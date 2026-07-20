/// <reference types="@cloudflare/workers-types" />

/**
 * Saga-style Workflow: every step that creates an external side effect registers a
 * compensating action. If a later step fails terminally, Workflows runs the registered
 * rollback handlers in reverse step-start order.
 *
 * Version notes (all of this is newer than most Workflows material you will find):
 * - Step rollback handlers (`WorkflowStepRollbackOptions`, the optional last argument
 *   to `step.do`) went GA on 2026-06-05. No compatibility flag is required.
 * - `WorkflowRollbackContext` gained `ctx` (the rolled-back step's own context) on
 *   2026-06-16. Older examples destructure only `{ output }`.
 * - `retries.delay` accepts a `WorkflowDelayFunction` as of @cloudflare/workers-types
 *   5.20260703.1. The function receives `{ ctx, error }` and returns a duration.
 * - `WorkflowEvent.schedule` (populated for cron-triggered instances) landed 2026-05-25.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1 and compatibility_date 2026-07-01.
 */

import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";

export type SubscriptionEnv = {
  BILLING_API_TOKEN: string;
  BILLING_API_URL: string;
  SEATS: KVNamespace;
};

export type ProvisionSubscription = {
  accountId: string;
  planId: string;
  seats: number;
  amountCents: number;
};

type ChargeReceipt = { chargeId: string; capturedAt: string };
type SeatGrant = { grantId: string; seats: number };

/**
 * A 402 or 409 from billing means the card or the plan is wrong, so retrying is pointless.
 * NonRetryableError fails the step immediately and starts the rollback chain.
 */
const failFastOn = new Set([402, 403, 409, 422]);

export class ProvisionSubscriptionWorkflow extends WorkflowEntrypoint<
  SubscriptionEnv,
  ProvisionSubscription
> {
  override async run(
    event: Readonly<WorkflowEvent<ProvisionSubscription>>,
    step: WorkflowStep,
  ): Promise<{ chargeId: string; grantId: string }> {
    const order = event.payload;

    // `schedule` is only present when the Workflows control plane started this
    // instance from a cron entry on the binding, so it distinguishes a nightly
    // reconciliation run from a user-triggered signup.
    const triggeredByCron = event.schedule !== undefined;

    const charge = await step.do(
      "capture payment",
      {
        retries: {
          limit: 6,
          backoff: "exponential",
          // Dynamic delay: read the provider's own Retry-After budget out of the
          // error instead of guessing. The result is fed into `backoff`, so this
          // is the base delay for the attempt, not the final wait.
          delay: ({ ctx, error }) => {
            const retryAfter = /retry after (\d+)s/i.exec(error.message);
            if (retryAfter) return `${Number(retryAfter[1])} seconds`;
            return `${ctx.attempt * 5} seconds`;
          },
        },
        timeout: "45 seconds",
        // Keeps the step output out of instance status responses and the dashboard.
        sensitive: "output",
      },
      async (): Promise<ChargeReceipt> => {
        const response = await fetch(`${this.env.BILLING_API_URL}/charges`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.env.BILLING_API_TOKEN}`,
            "content-type": "application/json",
            // Workflows replays a step on retry, so the instance id is the only
            // safe idempotency key here.
            "idempotency-key": `charge:${event.instanceId}`,
          },
          body: JSON.stringify({
            account: order.accountId,
            amount_cents: order.amountCents,
          }),
        });

        if (failFastOn.has(response.status)) {
          throw new NonRetryableError(
            `Billing rejected the charge with ${response.status}`,
            "BillingRejected",
          );
        }
        if (!response.ok) {
          throw new Error(`Billing responded ${response.status}`);
        }

        const body = (await response.json()) as { id: string };
        return { chargeId: body.id, capturedAt: new Date().toISOString() };
      },
      {
        // Compensation, not deletion: money already moved, so it moves back.
        rollback: async ({ ctx, error, output }) => {
          if (!output) return;
          await fetch(
            `${this.env.BILLING_API_URL}/charges/${output.chargeId}/refund`,
            {
              method: "POST",
              headers: {
                authorization: `Bearer ${this.env.BILLING_API_TOKEN}`,
                "content-type": "application/json",
                "idempotency-key": `refund:${event.instanceId}`,
              },
              body: JSON.stringify({
                reason: `${ctx.step.name} rolled back: ${error.message}`,
              }),
            },
          );
        },
        // Rollback handlers get their own retry budget, separate from the
        // forward step's. A refund that cannot land is worth trying harder for.
        rollbackConfig: {
          retries: { limit: 5, delay: "30 seconds", backoff: "linear" },
          timeout: "2 minutes",
        },
      },
    );

    const grant = await step.do(
      "grant seats",
      { retries: { limit: 3, delay: "10 seconds", backoff: "constant" } },
      async (): Promise<SeatGrant> => {
        const grantId = `${order.accountId}:${order.planId}`;
        await this.env.SEATS.put(
          grantId,
          JSON.stringify({ seats: order.seats, chargeId: charge.chargeId }),
        );
        return { grantId, seats: order.seats };
      },
      {
        rollback: async ({ output }) => {
          if (output) await this.env.SEATS.delete(output.grantId);
        },
      },
    );

    // No rollback on this step: a webhook that was never accepted needs no undo,
    // and the steps before it are already covered.
    await step.do(
      "notify account webhook",
      { retries: { limit: 4, delay: "1 minute", backoff: "exponential" } },
      async () => {
        await fetch(`${this.env.BILLING_API_URL}/webhooks/subscription`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            account: order.accountId,
            grant: grant.grantId,
            reconciliation: triggeredByCron,
          }),
        });
        return { delivered: true };
      },
    );

    return { chargeId: charge.chargeId, grantId: grant.grantId };
  }
}

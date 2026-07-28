/**
 * charge-step.ts
 *
 * A Vercel Workflow dunning sequence whose charge step is safe to run twice,
 * because it will be. Pinned to workflow@4.6.2.
 *
 * Failure modes solved:
 *
 *   1. The idempotency key that is too coarse. The invoice id looks stable and
 *      unique, and it is the first thing everyone reaches for. It is wrong
 *      here: this workflow charges the SAME invoice up to three times on
 *      purpose, so an invoice-keyed idempotency key turns attempts 2 and 3
 *      into replays of attempt 1's declined response. Every log line says the
 *      retry ran; no retry ever reached the processor; the invoice sits unpaid.
 *
 *   2. The idempotency key that is too fine. crypto.randomUUID() inside the
 *      step changes on every attempt, so it deduplicates nothing at all. So
 *      does `${stepId}:${attempt}`, which looks more careful and is worse,
 *      because it defeats the exact retry it appears to be scoping. The
 *      idempotency guide (https://workflow.dev/docs/foundations/idempotency)
 *      says it outright: "Keep keys deterministic; avoid including timestamps
 *      or attempt counters."
 *
 *   3. The key that cannot be computed where you need it. getStepMetadata()
 *      only works inside a step. Reading stepId in the workflow function to
 *      pass it down throws, and the docs also warn that a step called from
 *      outside a workflow runs as a plain function where getStepMetadata()
 *      throws as well. Since the same guide encourages reusing steps in
 *      ordinary route handlers, that second case is a live production crash,
 *      not a hypothetical. resolveSettlementKey() handles both.
 *
 *   4. The retry that fights the reservation. A step whose settlement is held
 *      by a still-running earlier attempt must back off past the lease, not
 *      retry immediately. Steps are re-enqueued immediately by default, so an
 *      uncaught error here burns the whole retry budget inside the lease
 *      window and the invoice fails for a reason that had nothing to do with
 *      the card. RetryableError carries retryAfter for exactly this.
 *
 * Why durable execution alone does not solve this: the event log records a
 * step's RESULT. The provider call lands between step_started and
 * step_completed, and a crash in that window replays the step with no memory
 * that money already moved. See reservation.ts for the settlement machine and
 * its runnable proof.
 */

import { FatalError, getStepMetadata, RetryableError, sleep } from "workflow";
import {
  type ReservationStore,
  SettlementInFlight,
  settleOnce,
} from "./reservation";

/** Wall-clock gaps between dunning attempts. Durations use the SDK's ms syntax. */
const DUNNING_BACKOFF = ["3d", "5d"] as const;

/** One attempt may hold a settlement key this long before it is presumed dead. */
const SETTLEMENT_LEASE_MS = 90_000;

/**
 * Structural dependencies, so this file pins no payment vendor and no ORM.
 * `lookupChargeByKey` is not optional: without it a crash inside charge() is
 * unrecoverable and the settlement key stays poisoned forever.
 */
export interface BillingDeps {
  readonly reservations: ReservationStore;
  readonly charge: (input: {
    readonly invoiceId: string;
    readonly amountCents: number;
    /**
     * Pass this through to the processor's own idempotency header when it has
     * one. Two independent guards is not redundancy here: the reservation
     * protects your database and the header protects the processor, and a
     * crash can land between them.
     */
    readonly idempotencyKey: string;
  }) => Promise<string>;
  readonly lookupChargeByKey: (key: string) => Promise<string | null>;
  readonly markInvoicePaid: (
    invoiceId: string,
    receipt: string,
  ) => Promise<void>;
  readonly notifyDunningFailure: (invoiceId: string) => Promise<void>;
}

export class CardDeclined extends Error {
  readonly invoiceId: string;
  constructor(invoiceId: string) {
    super(`card declined for invoice ${invoiceId}`);
    this.name = "CardDeclined";
    this.invoiceId = invoiceId;
  }
}

/**
 * Derive the settlement key for the current step invocation.
 *
 * Inside a workflow, stepId is the correct granularity and nothing else is:
 * it is stable across every retry of one invocation, and distinct between the
 * three invocations this workflow makes on the same invoice.
 *
 * Outside a workflow, "use step" is a no-op and getStepMetadata() throws, so
 * the caller has to supply a key that is stable for whatever it considers one
 * logical attempt. A checkout route would pass the client's request id.
 */
export function resolveSettlementKey(
  scope: string,
  explicitKey?: string,
): string {
  if (explicitKey !== undefined) return `${scope}:${explicitKey}`;
  const { stepId } = getStepMetadata();
  return `${scope}:${stepId}`;
}

/**
 * Charge an invoice at most once per step invocation.
 *
 * maxRetries is 5 rather than the default 3 because two of those attempts are
 * expected to be consumed by lease backoff on a genuinely contended key.
 */
export async function chargeInvoice(
  deps: BillingDeps,
  invoiceId: string,
  amountCents: number,
  explicitKey?: string,
): Promise<string> {
  "use step";

  const key = resolveSettlementKey(`charge:${invoiceId}`, explicitKey);

  try {
    const { receipt } = await settleOnce(deps.reservations, {
      key,
      leaseMs: SETTLEMENT_LEASE_MS,
      recover: deps.lookupChargeByKey,
      perform: () =>
        deps.charge({ invoiceId, amountCents, idempotencyKey: key }),
    });
    return receipt;
  } catch (error) {
    if (error instanceof SettlementInFlight) {
      // Back off past the lease. Retrying sooner cannot succeed and only
      // spends attempts the declined-card path is going to need.
      throw new RetryableError("settlement held by an earlier attempt", {
        retryAfter: error.retryAfterMs + 1_000,
      });
    }
    if (error instanceof CardDeclined) {
      // A decline is an answer, not a fault. Retrying it inside this step
      // would charge the same dead card five times in a row; the workflow's
      // own backoff is the right place to try again, days later.
      throw new FatalError(`invoice ${invoiceId} declined`);
    }
    throw error;
  }
}
chargeInvoice.maxRetries = 5;

async function settleInvoice(
  deps: BillingDeps,
  invoiceId: string,
  receipt: string,
): Promise<void> {
  "use step";
  await deps.markInvoicePaid(invoiceId, receipt);
}

async function abandonInvoice(
  deps: BillingDeps,
  invoiceId: string,
): Promise<void> {
  "use step";
  await deps.notifyDunningFailure(invoiceId);
}

/**
 * Three charge attempts spread over eight days for one BLANK Studio annual
 * renewal, then give up.
 *
 * Everything that could diverge on replay lives in a step. The loop counter,
 * the array index, and the branch all run in the workflow sandbox, which is
 * deterministic by construction; the sandbox even seeds Math.random and pins
 * Date, so the usual replay hazards from other durable-execution runtimes do
 * not apply here. What does NOT come for free is the side effect inside
 * chargeInvoice, which is the whole point of the settlement machine.
 *
 * sleep() suspends without holding a machine, so the eight days cost nothing
 * and the deploy that ships on day four interrupts nothing: this run is pinned
 * to the deployment that started it.
 */
export async function dunningWorkflow(
  deps: BillingDeps,
  invoiceId: string,
  amountCents: number,
): Promise<{ invoiceId: string; receipt: string | null; attempts: number }> {
  "use workflow";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      await sleep(DUNNING_BACKOFF[attempt - 1]);
    }

    try {
      // A fresh step invocation, so a fresh stepId, so a fresh settlement key.
      // This is the line the invoice-keyed version silently breaks.
      const receipt = await chargeInvoice(deps, invoiceId, amountCents);
      await settleInvoice(deps, invoiceId, receipt);
      return { invoiceId, receipt, attempts: attempt + 1 };
    } catch {
      // FatalError from a decline lands here with retries already skipped.
    }
  }

  await abandonInvoice(deps, invoiceId);
  return { invoiceId, receipt: null, attempts: 3 };
}

/**
 * charges.ts: exactly-once payment capture on Convex. The handlers are thin;
 * every decision lives in `lib/attemptMachine.ts`, which runs without a
 * deployment. Pinned to convex@1.42.3.
 *
 * The shape, and why each half has to be where it is:
 *
 *   requestCapture   mutation        reserves the attempt row, schedules the action
 *   runCapture       internalAction  the ONLY place the external call may happen
 *   settleCapture    internalMutation commits the outcome, fenced on the attempt
 *   sweepStuck       internalMutation cron: retakes leases the action never released
 *
 * NEVER call fetch() from a mutation. Convex mutations are deterministic
 * serializable transactions re-executed on OCC conflict
 * (https://stack.convex.dev/how-convex-works); a network call inside one would
 * fire once per re-execution, and the runtime forbids it anyway.
 *
 * NEVER assume the action ran exactly once. Actions "may have side-effects and
 * therefore can't be automatically retried by Convex when errors occur"
 * (https://docs.convex.dev/functions/actions), and per
 * https://docs.convex.dev/api/interfaces/server.Scheduler scheduled actions
 * execute at most once and are not retried. So the action may run zero times,
 * or (after a lease retake) twice. Both are handled: the reserved row survives
 * a zero-run, and the stable provider key survives a double-run.
 *
 * The one line that makes this an outbox rather than a hope:
 * `ctx.scheduler.runAfter` inside `requestCapture` is part of that mutation's
 * transaction. If the transaction aborts on an OCC conflict, the job is
 * discarded with the write. If it commits, the job is durably queued. There is
 * no window where the row exists and the job does not.
 *
 * Add to convex/schema.ts:
 *
 * ```ts
 * chargeAttempts: defineTable({
 *   requestId: v.string(),
 *   state: v.union(v.literal("reserved"), v.literal("settled")),
 *   providerKey: v.string(),
 *   attempt: v.number(),
 *   leaseUntil: v.number(),
 *   amountCents: v.number(),
 *   outcome: v.union(
 *     v.null(),
 *     v.object({
 *       status: v.literal("succeeded"),
 *       providerChargeId: v.string(),
 *       amountCents: v.number(),
 *     }),
 *     v.object({
 *       status: v.literal("failed"),
 *       code: v.string(),
 *       message: v.string(),
 *     }),
 *   ),
 *   lastError: v.union(v.null(), v.string()),
 * })
 *   .index("by_request", ["requestId"])
 *   .index("by_state_lease", ["state", "leaseUntil"]),
 * ```
 *
 * Live check (needs a deployment, this file cannot run locally):
 *   npx convex run charges:requestCapture '{"requestId":"order:8841:capture","amountCents":4999}'
 *   npx convex run charges:requestCapture '{"requestId":"order:8841:capture","amountCents":4999}'
 * The second call must return the first call's outcome and must not add a row.
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  mutation,
} from "./_generated/server";
import {
  type AttemptResult,
  abandonedOutcome,
  decideReserve,
  decideSettle,
  defaultAttemptPolicy,
  providerKeyFor,
} from "./lib/attemptMachine";

/**
 * Indexed lookup, not `.filter()`. A `.filter()` here would put the whole
 * chargeAttempts table into this mutation's read set, so every unrelated
 * capture in flight would conflict with it
 * (https://docs.convex.dev/error, "Write conflict: Optimistic concurrency
 * control"). The index range is the read set instead: one request id.
 */
async function attemptByRequest(ctx: MutationCtx, requestId: string) {
  return await ctx.db
    .query("chargeAttempts")
    .withIndex("by_request", (q) => q.eq("requestId", requestId))
    .unique();
}

export const requestCapture = mutation({
  args: { requestId: v.string(), amountCents: v.number() },
  handler: async (ctx, args) => {
    const existing = await attemptByRequest(ctx, args.requestId);
    const decision = decideReserve(existing, Date.now());

    switch (decision.kind) {
      case "replay":
        return { status: "settled" as const, outcome: decision.outcome };

      case "in-flight":
        return {
          status: "in-flight" as const,
          retryAfterMs: decision.retryAfterMs,
        };

      case "abandon":
        return { status: "abandoned" as const, attempts: decision.attempts };

      case "reserve": {
        const id = await ctx.db.insert("chargeAttempts", {
          requestId: args.requestId,
          state: "reserved",
          // Placeholder for one statement: the key is derived from the id that
          // this insert just assigned, so it cannot exist before the insert.
          providerKey: "",
          attempt: 1,
          leaseUntil: Date.now() + defaultAttemptPolicy.leaseMs,
          amountCents: args.amountCents,
          outcome: null,
          lastError: null,
        });
        const providerKey = providerKeyFor(id);
        await ctx.db.patch("chargeAttempts", id, { providerKey });
        // Committed with the two writes above, or not at all.
        await ctx.scheduler.runAfter(0, internal.charges.runCapture, {
          attemptId: id,
          attempt: 1,
        });
        return { status: "reserved" as const, attemptId: id };
      }

      case "retake": {
        // `existing` is non-null on every branch below "reserve".
        const row = existing as Doc<"chargeAttempts">;
        await ctx.db.patch("chargeAttempts", row._id, {
          attempt: decision.attempt,
          leaseUntil: Date.now() + defaultAttemptPolicy.leaseMs,
        });
        await ctx.scheduler.runAfter(0, internal.charges.runCapture, {
          attemptId: row._id,
          attempt: decision.attempt,
        });
        return { status: "retaken" as const, attempt: decision.attempt };
      }
    }
  },
});

/**
 * The external call. This is the only function here that is allowed to touch
 * the network and the only one with no transaction around it. It reads and
 * writes exclusively through ctx.runQuery / ctx.runMutation, because an action
 * has no ctx.db (https://docs.convex.dev/functions/actions).
 */
export const runCapture = internalAction({
  args: { attemptId: v.id("chargeAttempts"), attempt: v.number() },
  handler: async (ctx, args) => {
    const row = await ctx.runQuery(internal.charges.loadAttempt, {
      attemptId: args.attemptId,
    });
    // Already terminal, or our lease was retaken while this action was queued.
    if (row === null || row.state === "settled" || row.attempt !== args.attempt)
      return;

    let result: AttemptResult;
    try {
      const response = await fetch(
        "https://api.stripe.com/v1/payment_intents",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
            // The reason a second run of this action is survivable. Same request,
            // same key, forever: the provider returns the original charge instead
            // of creating a second one.
            "Idempotency-Key": row.providerKey,
          },
          body: new URLSearchParams({
            amount: String(row.amountCents),
            currency: "usd",
            confirm: "true",
          }),
        },
      );
      const body = (await response.json()) as {
        id?: string;
        error?: { code?: string; message?: string };
      };
      if (response.ok && body.id !== undefined) {
        result = {
          kind: "succeeded",
          providerChargeId: body.id,
          amountCents: row.amountCents,
        };
      } else if (response.status >= 500 || response.status === 429) {
        result = {
          kind: "transient-failure",
          message: `provider ${response.status}`,
        };
      } else {
        result = {
          kind: "permanent-failure",
          code: body.error?.code ?? "provider_rejected",
          message: body.error?.message ?? `provider ${response.status}`,
        };
      }
    } catch (error) {
      // A thrown fetch is ambiguous: the charge may or may not have landed.
      // Transient is the only honest classification, and it is safe precisely
      // because the retry carries the same idempotency key.
      result = {
        kind: "transient-failure",
        message: error instanceof Error ? error.message : String(error),
      };
    }

    await ctx.runMutation(internal.charges.settleCapture, {
      attemptId: args.attemptId,
      attempt: args.attempt,
      result,
    });
  },
});

/**
 * Must be an internalQuery, not an internalMutation. `ctx.runQuery` in an
 * action is typed `FunctionReference<"query", ...>`, so a mutation here fails
 * to typecheck, and it would also burn a write transaction per attempt for a
 * read. Each ctx.runQuery is its own read transaction: the row can change
 * between this read and the settle below, which is exactly why settleCapture
 * re-reads and re-checks the fence instead of trusting this snapshot.
 */
export const loadAttempt = internalQuery({
  args: { attemptId: v.id("chargeAttempts") },
  handler: async (ctx, args) =>
    await ctx.db.get("chargeAttempts", args.attemptId),
});

export const settleCapture = internalMutation({
  args: {
    attemptId: v.id("chargeAttempts"),
    attempt: v.number(),
    result: v.union(
      v.object({
        kind: v.literal("succeeded"),
        providerChargeId: v.string(),
        amountCents: v.number(),
      }),
      v.object({
        kind: v.literal("permanent-failure"),
        code: v.string(),
        message: v.string(),
      }),
      v.object({ kind: v.literal("transient-failure"), message: v.string() }),
    ),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get("chargeAttempts", args.attemptId);
    const decision = decideSettle(row, args.attempt, args.result);
    if (row === null || decision.kind === "ignore") return decision;

    if (decision.kind === "commit") {
      await ctx.db.patch("chargeAttempts", row._id, {
        state: "settled",
        outcome: decision.outcome,
      });
    } else {
      // Release the lease now so the sweeper does not have to wait it out.
      await ctx.db.patch("chargeAttempts", row._id, {
        leaseUntil: Date.now(),
        lastError: decision.lastError,
      });
    }
    return decision;
  },
});

/**
 * The cron half. A scheduled action that never ran (process lost, deploy mid
 * flight, transient runtime error) leaves a reserved row with an expired lease
 * and nothing queued, because Convex does not retry scheduled actions. This
 * sweep is what turns at-most-once scheduling into eventual delivery.
 *
 * Register it in convex/crons.ts:
 *
 * ```ts
 * import { cronJobs } from "convex/server";
 * import { internal } from "./_generated/api";
 *
 * const crons = cronJobs();
 * crons.interval("retake stuck captures", { minutes: 2 }, internal.charges.sweepStuck, {});
 * export default crons;
 * ```
 */
export const sweepStuck = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    // Bounded, index-ordered, and never a table scan: the sweeper must not put
    // the whole table in its read set or it will conflict with live captures.
    const stalled = await ctx.db
      .query("chargeAttempts")
      .withIndex("by_state_lease", (q) =>
        q.eq("state", "reserved").lt("leaseUntil", now),
      )
      .take(50);

    let retaken = 0;
    let abandoned = 0;
    for (const row of stalled) {
      const decision = decideReserve(row, now);
      if (decision.kind === "retake") {
        await ctx.db.patch("chargeAttempts", row._id, {
          attempt: decision.attempt,
          leaseUntil: now + defaultAttemptPolicy.leaseMs,
        });
        await ctx.scheduler.runAfter(0, internal.charges.runCapture, {
          attemptId: row._id,
          attempt: decision.attempt,
        });
        retaken++;
      } else if (decision.kind === "abandon") {
        // Settling the abandoned row is not cosmetic. A row left "reserved"
        // with an expired lease stays inside this sweeper's index range
        // forever, so every 2 minutes the scan re-reads it, and the `.take(50)`
        // budget silently fills with permanent garbage until live stalled
        // captures stop being seen at all. Writing the terminal outcome moves
        // it out of the ("reserved", leaseUntil) range for good.
        await ctx.db.patch("chargeAttempts", row._id, {
          state: "settled",
          outcome: abandonedOutcome(decision.attempts),
        });
        abandoned++;
      }
    }
    return { scanned: stalled.length, retaken, abandoned };
  },
});

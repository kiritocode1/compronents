/**
 * Durable payout settlement for the BLANK ledger.
 *
 * Targets Effect v4 (pinned: effect@4.0.0-beta.98). In v4 the durable
 * execution engine lives in core under `effect/unstable/workflow`; there is no
 * separate `@effect/workflow` install.
 *
 * Two v4-only shapes are used below:
 *   1. `Workflow.make(tag, options)` takes the tag as its FIRST argument and
 *      supports `class X extends Workflow.make(...)`. Landed in
 *      effect@4.0.0-beta.75 (2026-06-01, PR Effect-TS/effect-smol#2294).
 *   2. `DurableQueue`, which persists an item, suspends the workflow, and
 *      resumes it once a worker settles the item. Landed in
 *      effect@4.0.0-beta.66 (2026-05-12, PR Effect-TS/effect-smol#2164).
 */

import { Effect, Schema } from "effect";
import { Activity, DurableQueue, Workflow } from "effect/unstable/workflow";

/** Failure the workflow reports to its caller. Encoded into the persisted result. */
export class PayoutRejected extends Schema.TaggedErrorClass<PayoutRejected>()(
  "PayoutRejected",
  {
    payoutId: Schema.String,
    reason: Schema.Literals(["insufficient_balance", "account_frozen"]),
  },
) {}

/** Failure a ledger worker reports back through the queue's DurableDeferred. */
export class LedgerUnavailable extends Schema.TaggedErrorClass<LedgerUnavailable>()(
  "LedgerUnavailable",
  { region: Schema.String },
) {}

/**
 * A durable queue is a definition, not a running queue. `DurableQueue.process`
 * offers an item and suspends the calling workflow; `DurableQueue.worker`
 * builds the layer that drains it. The two halves can run in different
 * processes because both sides are keyed off `name` and `idempotencyKey`.
 */
export const LedgerPost = DurableQueue.make({
  name: "BlankLedgerPost",
  payload: {
    payoutId: Schema.String,
    amountMinor: Schema.Int,
    currency: Schema.Literals(["usd", "eur"]),
  },
  success: Schema.String, // the ledger entry id
  error: LedgerUnavailable,
  // Dedupe key: offering the same payout twice never double-posts.
  idempotencyKey: ({ payoutId }) => payoutId,
});

/**
 * Tag-first `Workflow.make`, then subclassed so the workflow is referenced as a
 * value and a type. Under v4 the tag is also exposed as `SettlePayout._tag`.
 */
export class SettlePayout extends Workflow.make("BlankSettlePayout", {
  payload: {
    payoutId: Schema.String,
    amountMinor: Schema.Int,
    currency: Schema.Literals(["usd", "eur"]),
  },
  success: Schema.Struct({ ledgerEntryId: Schema.String }),
  error: PayoutRejected,
  // The execution id is derived from this key, so a retried HTTP request that
  // carries the same payoutId joins the existing run instead of starting a new one.
  idempotencyKey: ({ payoutId }) => payoutId,
}) {}

/**
 * Activities are the replay boundary: a completed activity is read back from
 * the engine's journal on resume rather than re-executed. Everything outside an
 * activity runs again on every resume, so keep side effects inside one.
 */
const reserveFunds = (payoutId: string, amountMinor: number) =>
  Activity.make({
    name: "ReserveFunds",
    success: Schema.String, // reservation handle
    error: PayoutRejected,
    execute: Effect.gen(function* () {
      const attempt = yield* Activity.CurrentAttempt;
      yield* Effect.annotateCurrentSpan({ payoutId, attempt });
      if (amountMinor <= 0) {
        return yield* new PayoutRejected({
          payoutId,
          reason: "insufficient_balance",
        });
      }
      return `rsv_${payoutId}`;
    }),
  });

/**
 * `toLayer` registers the workflow with the engine and supplies its body. The
 * body is an ordinary Effect: the engine replays it, and Activity plus
 * DurableQueue checkpoints decide what is skipped on replay.
 */
export const SettlePayoutLayer = SettlePayout.toLayer(
  Effect.fnUntraced(function* (payload) {
    yield* reserveFunds(payload.payoutId, payload.amountMinor);

    // Suspends here. The workflow is durably parked until a LedgerPost worker
    // completes the item, which may be minutes or days later.
    const ledgerEntryId = yield* DurableQueue.process(LedgerPost, {
      payoutId: payload.payoutId,
      amountMinor: payload.amountMinor,
      currency: payload.currency,
    }).pipe(
      Effect.catchTag("LedgerUnavailable", (error) =>
        Effect.andThen(
          Effect.logWarning(`Ledger region ${error.region} rejected the post`),
          new PayoutRejected({
            payoutId: payload.payoutId,
            reason: "account_frozen",
          }),
        ),
      ),
    );

    return { ledgerEntryId };
  }),
);

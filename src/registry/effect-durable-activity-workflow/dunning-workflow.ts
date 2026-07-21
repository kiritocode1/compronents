/**
 * A subscription dunning sequence as a durable Effect 4 workflow: retry a failed
 * payment on a schedule, wait real days between attempts, and cancel the
 * subscription if every attempt fails, all surviving a deploy in the middle.
 *
 * The problem durable execution solves. A dunning flow is "charge the card; if it
 * fails wait three days and try again; after the fourth failure cancel." Written
 * as an ordinary function that is the easy part. The hard part is that the flow
 * lives for days, and in days a process restarts, a deploy ships, a machine dies.
 * A plain in-memory async function loses its place on any of those and either
 * never finishes or restarts from the top and charges a card that already paid.
 * The usual fixes are a cron table plus a state-machine column, or a queue with a
 * visibility timeout, and both push the workflow's control flow out of the code
 * and into rows nobody can read as a sequence.
 *
 * What a durable workflow gives instead. The workflow body below reads top to
 * bottom like the ordinary function, but every Activity in it is journaled. When
 * an Activity completes, its result is written to storage before the workflow
 * proceeds. If the process dies and the workflow is replayed, a completed
 * Activity does not run again: its recorded result is handed back and execution
 * fast-forwards to the first Activity that never finished. A DurableClock.sleep
 * of three days does not hold a fiber or a machine open for three days; the
 * workflow suspends, the runtime forgets it, and a timer wakes it when the clock
 * is due. The deploy that ships on day two does not interrupt anything, because
 * on day two nothing is running.
 *
 * What the engine guarantees, and what it does not:
 *
 *   - Replay skips completed Activities, it does not skip their side effects on
 *     the first run. The guarantee is "each Activity's RESULT is recorded once",
 *     not "the side effect happens exactly once." An Activity that charges a card
 *     and dies after the charge but before the journal write WILL run again on
 *     replay. Every Activity must therefore be idempotent, which is why the
 *     charge Activity below sends a provider-side idempotency key derived from
 *     the invoice and attempt, not a fresh id each call.
 *   - Determinism between Activities. The code that runs OUTSIDE an Activity, the
 *     control flow stitching them together, is re-executed on every replay, so it
 *     must be deterministic. A branch on Date.now() or Math.random() there would
 *     take a different path on replay than it did on the first run and desync the
 *     journal. Anything non-deterministic belongs INSIDE an Activity, where its
 *     result is recorded. DateTime.now inside the "stamp" Activity is fine; a
 *     bare Date.now() in the workflow body is a bug.
 *   - DurableClock.sleep is durable time, not a Fiber sleep. The inMemoryThreshold
 *     option lets short sleeps stay in memory to avoid a storage round trip; a
 *     three-day sleep is well past any threshold and is persisted as a timer.
 *   - idempotencyKey deduplicates whole workflow runs. Two executes with the same
 *     key resolve to the same execution rather than starting a second dunning
 *     sequence for one invoice, which is what makes a retried enqueue safe.
 *   - Compensation runs on failure, in reverse. Workflow.withCompensation attaches
 *     an undo to an Activity; if the workflow later fails, the recorded
 *     compensations run newest first. It is the saga pattern with the ordering
 *     handled for you, not a try/finally you maintain by hand.
 *
 * Every API is from effect@4.0.0-beta.98. Workflow, Activity, DurableClock, and
 * Workflow.withCompensation match node_modules/effect/src/unstable/workflow/.
 * Much of this engine is Tim Smart's work.
 */

import { DateTime, Effect, Schedule, Schema } from "effect";
import { Activity, DurableClock, Workflow } from "effect/unstable/workflow";

/** A payment provider rejected the charge. Carries whether a retry could help. */
export class ChargeDeclined extends Schema.ErrorClass<ChargeDeclined>(
  "BLANK/Dunning/ChargeDeclined",
)({
  invoiceId: Schema.String,
  reason: Schema.String,
  /** A hard decline (closed account) is not worth retrying; a soft one (no funds) is. */
  retryable: Schema.Boolean,
}) {}

/** The dunning sequence gave up after exhausting every attempt. */
export class DunningExhausted extends Schema.ErrorClass<DunningExhausted>(
  "BLANK/Dunning/DunningExhausted",
)({
  invoiceId: Schema.String,
  attempts: Schema.Int,
}) {}

/**
 * The workflow contract. The payload is the invoice to collect; the idempotency
 * key is the invoice id, so enqueuing the same invoice twice, however that
 * happens, joins the existing run instead of dunning the customer twice.
 */
export const DunningWorkflow = Workflow.make("BLANK/Dunning", {
  payload: {
    invoiceId: Schema.String,
    customerId: Schema.String,
    amountMinor: Schema.Int,
  },
  success: Schema.Struct({ collectedMinor: Schema.Int, onAttempt: Schema.Int }),
  error: DunningExhausted,
  idempotencyKey: ({ invoiceId }) => invoiceId,
});

/** How many days to wait before each successive retry. Four attempts total. */
const RETRY_SCHEDULE_DAYS = [0, 3, 5, 7] as const;

/**
 * The workflow body. Written as a straight sequence: try the charge, and on a
 * retryable decline sleep the scheduled number of days and try again, until it
 * succeeds or the attempts run out.
 *
 * The engine layer is produced by DunningWorkflow.toLayer. The build function
 * receives the decoded payload and returns the Effect that IS the workflow.
 */
export const DunningWorkflowLayer = DunningWorkflow.toLayer(
  Effect.fn(function* (payload) {
    let lastReason = "no attempt made";

    for (let attempt = 0; attempt < RETRY_SCHEDULE_DAYS.length; attempt++) {
      // Durable wait. The first attempt has a zero-day delay; later attempts
      // suspend the workflow for real days. inMemoryThreshold keeps a zero delay
      // from making a pointless storage round trip while still persisting the
      // multi-day sleeps as timers the runtime wakes on.
      yield* DurableClock.sleep({
        name: `dunning-wait-${attempt}`,
        duration: `${RETRY_SCHEDULE_DAYS[attempt]} days`,
        inMemoryThreshold: "1 second",
      });

      // The charge is an Activity, so its outcome is journaled: a replay after a
      // crash does not re-run a charge that already recorded a result. The retry
      // policy here is for the transient case (a provider timeout), separate from
      // the multi-day business retry the loop expresses.
      const outcome = yield* Activity.make({
        name: `charge-attempt-${attempt}`,
        success: Schema.Struct({
          collectedMinor: Schema.Int,
          capturedAt: Schema.DateTimeUtc,
        }),
        error: ChargeDeclined,
        execute: Effect.gen(function* () {
          // Non-determinism lives INSIDE the Activity, where its result is
          // recorded. Reading the current attempt count is how a redelivered
          // Activity knows which try it is without a mutable counter in the body.
          const providerAttempt = yield* Activity.CurrentAttempt;
          const capturedAt = yield* DateTime.now;

          // ponytail: stubbed provider call; the real one goes here. The
          // idempotency key is what makes the Activity safe to replay: the
          // provider dedupes a repeated (invoice, attempt) rather than
          // double-charging when the journal write was the thing that failed.
          const idempotencyKey = `${payload.invoiceId}:${attempt}:${providerAttempt}`;
          void idempotencyKey;

          // Stand-in outcome: the even attempts decline retryably, the last
          // succeeds. Replace with the provider result.
          if (attempt < RETRY_SCHEDULE_DAYS.length - 1) {
            return yield* new ChargeDeclined({
              invoiceId: payload.invoiceId,
              reason: "insufficient_funds",
              retryable: true,
            });
          }
          return { collectedMinor: payload.amountMinor, capturedAt };
        }),
        // Transient provider errors get a short exponential retry inside the
        // attempt; a business decline is returned, not retried here.
        interruptRetryPolicy: Schedule.exponential("2 seconds", 2),
      }).pipe(Effect.either);

      if (outcome._tag === "Right") {
        return {
          collectedMinor: outcome.right.collectedMinor,
          onAttempt: attempt,
        };
      }

      lastReason = outcome.left.reason;
      // A hard decline will never succeed on retry, so stop paying for attempts
      // and fail the whole sequence now rather than waiting out the schedule.
      if (!outcome.left.retryable) {
        return yield* new DunningExhausted({
          invoiceId: payload.invoiceId,
          attempts: attempt + 1,
        });
      }
    }

    // Every scheduled attempt declined. Record the terminal failure with
    // `return yield*` so the workflow ends here rather than falling through.
    void lastReason;
    return yield* new DunningExhausted({
      invoiceId: payload.invoiceId,
      attempts: RETRY_SCHEDULE_DAYS.length,
    });
  }),
);

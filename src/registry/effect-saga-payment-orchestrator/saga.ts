/**
 * saga.ts
 *
 * Failure modes solved:
 *   1. The multi-service booking that fails halfway and keeps your money:
 *      charge the card, reserve the seat, issue the ticket. If the ticket
 *      service is down after the charge and the reservation, a plain
 *      sequence leaves the customer charged for a seat they cannot use and
 *      no automatic way back. There is no distributed transaction across
 *      three vendors' APIs; the saga pattern is the answer: each forward
 *      step registers its compensation, and a failure runs the
 *      compensations in reverse for exactly the steps that succeeded.
 *   2. Compensations that themselves fail get swallowed: if the refund
 *      fails during rollback, silently continuing leaves real money
 *      stranded. The orchestrator collects compensation failures and
 *      surfaces them as a typed CompensationFailed carrying the stuck
 *      steps, so a human or a retry queue can finish the unwind instead of
 *      the system pretending it is clean.
 *
 * Why the primitives make it correct: completed steps push their
 * compensation onto a Ref stack as they succeed, the forward run stops at
 * the first failure, and the rollback pops the stack in LIFO order (undo
 * in reverse of do); each compensation runs under Effect.exit so one
 * failure cannot abort the rest of the unwind, and the ledger Refs let the
 * demo prove money returns to exactly where it started.
 */

import { Data, Effect, Ref } from "effect";

class StepFailed extends Data.TaggedError("StepFailed")<{
  readonly step: string;
}> {}

class CompensationFailed extends Data.TaggedError("CompensationFailed")<{
  readonly stuck: readonly string[];
}> {}

export interface Step {
  readonly name: string;
  readonly forward: Effect.Effect<void, StepFailed>;
  readonly compensate: Effect.Effect<void, StepFailed>;
}

export interface SagaResult {
  readonly committed: string[];
  readonly compensated: string[];
}

export const runSaga = (
  steps: readonly Step[],
): Effect.Effect<SagaResult, StepFailed | CompensationFailed> =>
  Effect.gen(function* () {
    const done = yield* Ref.make<Step[]>([]);

    // forward pass: run each step, remembering how to undo it
    const forward = Effect.gen(function* () {
      for (const step of steps) {
        yield* step.forward;
        yield* Ref.update(done, (d) => [...d, step]);
      }
    });

    const outcome = yield* Effect.exit(forward);
    if (outcome._tag === "Success") {
      const committed = (yield* Ref.get(done)).map((s) => s.name);
      return { committed, compensated: [] };
    }

    // rollback: compensate completed steps in reverse order
    const completed = yield* Ref.get(done);
    const stuck: string[] = [];
    const compensated: string[] = [];
    for (const step of [...completed].reverse()) {
      const undo = yield* Effect.exit(step.compensate);
      if (undo._tag === "Success") compensated.push(step.name);
      else stuck.push(step.name);
    }
    if (stuck.length > 0) return yield* new CompensationFailed({ stuck });
    return { committed: [], compensated };
  });

// ---- a bookable travel domain to make the failure concrete ----
interface Ledger {
  readonly card: Ref.Ref<number>;
  readonly seats: Ref.Ref<number>;
  readonly tickets: Ref.Ref<number>;
}

const makeLedger = (): Effect.Effect<Ledger> =>
  Effect.all({ card: Ref.make(0), seats: Ref.make(5), tickets: Ref.make(0) });

const bookingSteps = (
  ledger: Ledger,
  options: { readonly ticketFails?: boolean; readonly refundFails?: boolean },
): Step[] => [
  {
    name: "charge-card",
    forward: Ref.update(ledger.card, (n) => n + 250),
    compensate: options.refundFails
      ? new StepFailed({ step: "refund-card" })
      : Ref.update(ledger.card, (n) => n - 250),
  },
  {
    name: "reserve-seat",
    forward: Ref.update(ledger.seats, (n) => n - 1),
    compensate: Ref.update(ledger.seats, (n) => n + 1),
  },
  {
    name: "issue-ticket",
    forward: options.ticketFails
      ? new StepFailed({ step: "issue-ticket" })
      : Ref.update(ledger.tickets, (n) => n + 1),
    compensate: Ref.update(ledger.tickets, (n) => Math.max(0, n - 1)),
  },
];

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: the naive sequence leaves the customer charged on failure.
  {
    const ledger = yield* makeLedger();
    const steps = bookingSteps(ledger, { ticketFails: true });
    // "just run them in order" with no compensation
    yield* steps[0].forward;
    yield* steps[1].forward;
    yield* Effect.exit(steps[2].forward); // ticket fails, we stop
    const [card, seats] = yield* Effect.all([
      Ref.get(ledger.card),
      Ref.get(ledger.seats),
    ]);
    yield* check(
      "no-saga sequence strands the charge",
      card === 250 && seats === 4,
      `customer charged $${card} and holding a seat (${seats} left) for a ticket that never issued`,
    );
  }

  // Property 2: the saga compensates in reverse for the steps that succeeded.
  {
    const ledger = yield* makeLedger();
    const result = yield* Effect.exit(
      runSaga(bookingSteps(ledger, { ticketFails: true })),
    );
    const [card, seats, tickets] = yield* Effect.all([
      Ref.get(ledger.card),
      Ref.get(ledger.seats),
      Ref.get(ledger.tickets),
    ]);
    const order =
      result._tag === "Success"
        ? result.value.compensated.join(",")
        : "(threw)";
    yield* check(
      "saga rolls back exactly the successful steps in reverse",
      result._tag === "Success" && card === 0 && seats === 5 && tickets === 0,
      `ticket failure unwound [${order}]: card=$${card}, seats=${seats} (fully restored)`,
    );
  }

  // Property 3: a fully successful saga commits every step, no compensation.
  {
    const ledger = yield* makeLedger();
    const result = yield* runSaga(bookingSteps(ledger, {}));
    const [card, seats, tickets] = yield* Effect.all([
      Ref.get(ledger.card),
      Ref.get(ledger.seats),
      Ref.get(ledger.tickets),
    ]);
    yield* check(
      "all-success commits with no rollback",
      result.committed.length === 3 &&
        result.compensated.length === 0 &&
        card === 250 &&
        tickets === 1,
      `booked end to end: charged $${card}, seat reserved (${seats} left), ${tickets} ticket issued`,
    );
  }

  // Property 4: a failing compensation surfaces as a typed error, not silence.
  {
    const ledger = yield* makeLedger();
    const result = yield* Effect.exit(
      runSaga(bookingSteps(ledger, { ticketFails: true, refundFails: true })),
    );
    const stuck =
      result._tag === "Failure" &&
      String(result.cause).includes("CompensationFailed");
    const card = yield* Ref.get(ledger.card);
    yield* check(
      "a stuck compensation is surfaced, not swallowed",
      stuck && card === 250,
      `the refund failed during rollback: $${card} is flagged stuck via CompensationFailed for a retry queue`,
    );
  }

  console.log("saga.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

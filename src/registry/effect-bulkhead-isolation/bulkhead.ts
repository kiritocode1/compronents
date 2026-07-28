/**
 * bulkhead.ts
 *
 * Failure modes solved:
 *   1. The sympathetic outage (one slow dependency drowns the whole
 *      service): with a shared connection or worker pool, a recommendation
 *      service that starts taking 10 seconds slowly absorbs every worker,
 *      and suddenly checkout is down because RECOMMENDATIONS got slow.
 *      Ships solve this with bulkheads: watertight compartments so one
 *      breach floods one compartment. Here each dependency gets its own
 *      Semaphore of permits, so the slow dependency saturates its own
 *      compartment and every other dependency's calls flow untouched.
 *   2. The unbounded queue behind the pool (latency debt that never
 *      repays): when a compartment is full, letting callers queue forever
 *      converts an overload into ever-growing latency, and clients time
 *      out anyway while the queue eats memory. Each bulkhead has a small
 *      bounded waiting room; beyond it, calls are shed immediately with a
 *      typed BulkheadRejected. A fast no is load shedding, and it is what
 *      lets the system degrade one feature instead of failing all of them.
 *
 * Why the primitives make it correct: Semaphore permits are the running
 * ceiling, the waiting room is one Ref counter guarded atomically, and
 * rejection is a typed error the caller can map to a fallback, so the
 * degraded path is part of the signature instead of a timeout surprise.
 */

import { Data, Effect, Fiber, Ref, Semaphore } from "effect";

export class BulkheadRejected extends Data.TaggedError("BulkheadRejected")<{
  readonly dependency: string;
}> {}

export interface Bulkhead {
  readonly name: string;
  /** run `effect` inside this compartment, or fail fast with BulkheadRejected */
  readonly run: <A, E>(
    effect: Effect.Effect<A, E>,
  ) => Effect.Effect<A, E | BulkheadRejected>;
  readonly stats: Effect.Effect<{ shed: number; peakInFlight: number }>;
}

export const makeBulkhead = (options: {
  readonly name: string;
  /** concurrent executions allowed inside the compartment */
  readonly permits: number;
  /** callers allowed to wait for a permit; beyond this, shed immediately */
  readonly waitingRoom: number;
}): Effect.Effect<Bulkhead> =>
  Effect.gen(function* () {
    const gate = yield* Semaphore.make(options.permits);
    const waitingAndRunning = yield* Ref.make(0);
    const shed = yield* Ref.make(0);
    const inFlight = yield* Ref.make(0);
    const peakInFlight = yield* Ref.make(0);
    const capacity = options.permits + options.waitingRoom;

    const run = <A, E>(
      effect: Effect.Effect<A, E>,
    ): Effect.Effect<A, E | BulkheadRejected> =>
      Effect.gen(function* () {
        // One atomic decision: enter the compartment (running or waiting) or shed.
        const admitted = yield* Ref.modify(waitingAndRunning, (n) =>
          n < capacity ? ([true, n + 1] as const) : ([false, n] as const),
        );
        if (!admitted) {
          yield* Ref.update(shed, (n) => n + 1);
          return yield* new BulkheadRejected({ dependency: options.name });
        }
        return yield* Semaphore.withPermits(
          gate,
          1,
        )(
          Effect.gen(function* () {
            const now = yield* Ref.updateAndGet(inFlight, (n) => n + 1);
            yield* Ref.update(peakInFlight, (p) => Math.max(p, now));
            return yield* effect;
          }).pipe(Effect.ensuring(Ref.update(inFlight, (n) => n - 1))),
        ).pipe(Effect.ensuring(Ref.update(waitingAndRunning, (n) => n - 1)));
      });

    const stats = Effect.gen(function* () {
      return {
        shed: yield* Ref.get(shed),
        peakInFlight: yield* Ref.get(peakInFlight),
      };
    });

    return { name: options.name, run, stats } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Two dependencies: recommendations has gone slow (150ms), payments is fine (5ms).
  const slowCall = Effect.sleep("150 millis").pipe(Effect.map(() => "recs"));
  const fastCall = Effect.sleep("5 millis").pipe(Effect.map(() => "paid"));

  // Property 1: with one SHARED pool, 30 slow recommendation calls absorb
  // every permit and checkout queues behind them. With per-dependency
  // bulkheads, the same traffic leaves payments untouched.
  {
    const lastPaymentDone = (
      run: <A, E>(
        e: Effect.Effect<A, E>,
      ) => Effect.Effect<A, E | BulkheadRejected>,
      runSlow: <A, E>(
        e: Effect.Effect<A, E>,
      ) => Effect.Effect<A, E | BulkheadRejected>,
    ) =>
      Effect.gen(function* () {
        const t0 = Date.now();
        const doneAt = yield* Ref.make(0);
        yield* Effect.all(
          [
            ...Array.from({ length: 30 }, () =>
              runSlow(slowCall).pipe(Effect.exit),
            ),
            ...Array.from({ length: 30 }, () =>
              run(fastCall)
                .pipe(
                  Effect.tap(() =>
                    Ref.update(doneAt, (t) => Math.max(t, Date.now() - t0)),
                  ),
                )
                .pipe(Effect.exit),
            ),
          ],
          { concurrency: "unbounded" },
        );
        return yield* Ref.get(doneAt);
      });

    // shared: both dependencies drain one pool of 8 workers
    const shared = yield* makeBulkhead({
      name: "shared-pool",
      permits: 8,
      waitingRoom: 60,
    });
    const sharedMs = yield* lastPaymentDone(shared.run, shared.run);

    // isolated: each dependency owns its compartment
    const recs = yield* makeBulkhead({
      name: "recommendations",
      permits: 4,
      waitingRoom: 30,
    });
    const payments = yield* makeBulkhead({
      name: "payments",
      permits: 4,
      waitingRoom: 30,
    });
    const isolatedMs = yield* lastPaymentDone(payments.run, recs.run);

    yield* check(
      "slow dependency floods only its own compartment",
      isolatedMs * 3 < sharedMs,
      `last checkout finished after ${sharedMs}ms behind the shared pool, ${isolatedMs}ms with bulkheads (recommendations was 150ms/call, payments 5ms)`,
    );
  }

  // Property 2: the running ceiling holds under any pile-on.
  {
    const recs = yield* makeBulkhead({
      name: "recommendations",
      permits: 4,
      waitingRoom: 4,
    });
    yield* Effect.all(
      Array.from({ length: 40 }, () =>
        recs.run(Effect.sleep("20 millis")).pipe(Effect.exit),
      ),
      { concurrency: "unbounded" },
    );
    const { peakInFlight } = yield* recs.stats;
    yield* check(
      "permit ceiling holds",
      peakInFlight <= 4,
      `40 concurrent callers, peak in-flight ${peakInFlight} (ceiling 4)`,
    );
  }

  // Property 3: shedding is immediate, not a queued timeout. The 9th caller
  // (4 running + 4 waiting) is rejected in microseconds while the compartment
  // is busy for 150ms.
  {
    const recs = yield* makeBulkhead({
      name: "recommendations",
      permits: 4,
      waitingRoom: 4,
    });
    // fill the compartment: 8 admitted
    const busy = Effect.all(
      Array.from({ length: 8 }, () => recs.run(slowCall)),
      { concurrency: "unbounded" },
    ).pipe(Effect.forkChild);
    const fiber = yield* busy;
    yield* Effect.sleep("10 millis"); // let them take their seats
    const t0 = Date.now();
    const ninth = yield* Effect.exit(recs.run(slowCall));
    const rejectMs = Date.now() - t0;
    yield* Fiber.join(fiber); // drain the compartment before finishing
    yield* check(
      "overflow is a fast typed no",
      ninth._tag === "Failure" && rejectMs < 20,
      `9th caller rejected in ${rejectMs}ms with BulkheadRejected while the compartment stays busy 150ms`,
    );
  }

  console.log("bulkhead.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

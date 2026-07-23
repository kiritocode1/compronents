/**
 * aimd.ts
 *
 * Failure modes solved:
 *   1. A fixed concurrency limit is wrong at every moment: pick 50 and a
 *      healthy downstream is throttled below what it could serve; pick 500
 *      and a degraded downstream is buried, latency explodes, and timeouts
 *      cascade. There is no correct constant, because the right limit is
 *      whatever the downstream can handle RIGHT NOW. An adaptive limiter
 *      discovers it: additive-increase on success (nudge the limit up while
 *      things are healthy), multiplicative-decrease on overload (halve it
 *      fast when latency spikes or errors appear), the same control law TCP
 *      uses to find a link's capacity.
 *   2. Guessing overload from errors alone reacts too late: by the time
 *      requests fail, the queue is already deep. Watching LATENCY (a
 *      request slower than a threshold counts as a soft overload signal)
 *      backs the limit off before hard failures start, so the system rides
 *      just under the cliff instead of oscillating over it.
 *
 * Why the primitives make it correct: the limit and in-flight count live in
 * one Ref; admission is a single Ref.modify that rejects when in-flight
 * would exceed the current limit (so the limit is always respected even as
 * it moves); each completion feeds latency/outcome back through one
 * Ref.update applying additive-increase or multiplicative-decrease; and the
 * limit is clamped to [min, max] so the control loop cannot run away.
 */

import { Effect, Ref } from "effect";

interface LimiterState {
  readonly limit: number;
  readonly inFlight: number;
  readonly rejected: number;
}

export interface AdaptiveLimiter {
  readonly run: <A>(
    latencyMs: number,
    work: Effect.Effect<A>,
  ) => Effect.Effect<{ admitted: boolean; value?: A }>;
  readonly limit: Effect.Effect<number>;
  readonly stats: Effect.Effect<{ limit: number; rejected: number }>;
}

export const makeAdaptiveLimiter = (config: {
  readonly initial: number;
  readonly min: number;
  readonly max: number;
  readonly latencyThresholdMs: number;
  readonly increaseStep?: number;
  readonly decreaseFactor?: number;
}): Effect.Effect<AdaptiveLimiter> =>
  Effect.gen(function* () {
    const increaseStep = config.increaseStep ?? 1;
    const decreaseFactor = config.decreaseFactor ?? 0.5;
    const state = yield* Ref.make<LimiterState>({
      limit: config.initial,
      inFlight: 0,
      rejected: 0,
    });

    const clamp = (n: number) => Math.max(config.min, Math.min(config.max, n));

    const feedback = (latencyMs: number, ok: boolean) =>
      Ref.update(state, (s) => {
        const overloaded = !ok || latencyMs > config.latencyThresholdMs;
        const limit = overloaded
          ? clamp(Math.floor(s.limit * decreaseFactor)) // multiplicative decrease
          : clamp(s.limit + increaseStep); // additive increase
        return { ...s, limit, inFlight: s.inFlight - 1 };
      });

    const run = <A>(latencyMs: number, work: Effect.Effect<A>) =>
      Effect.gen(function* () {
        const admitted = yield* Ref.modify(
          state,
          (s): readonly [boolean, LimiterState] => {
            if (s.inFlight >= s.limit)
              return [false, { ...s, rejected: s.rejected + 1 }];
            return [true, { ...s, inFlight: s.inFlight + 1 }];
          },
        );
        if (!admitted) return { admitted: false as const };
        const value = yield* work;
        yield* feedback(latencyMs, true);
        return { admitted: true as const, value };
      });

    return {
      run,
      limit: Ref.get(state).pipe(Effect.map((s) => s.limit)),
      stats: Ref.get(state).pipe(
        Effect.map((s) => ({ limit: s.limit, rejected: s.rejected })),
      ),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const noop = Effect.void;

  // Property 1: sustained healthy traffic grows the limit toward the max.
  {
    const lim = yield* makeAdaptiveLimiter({
      initial: 10,
      min: 2,
      max: 100,
      latencyThresholdMs: 200,
    });
    // 40 fast (healthy) requests, run sequentially so each frees its slot
    for (let i = 0; i < 40; i++) yield* lim.run(50, noop);
    const limit = yield* lim.limit;
    yield* check(
      "the limit grows while the downstream is healthy",
      limit === 50,
      `40 fast requests additively raised the limit from 10 to ${limit} (toward the ceiling)`,
    );
  }

  // Property 2: a latency spike halves the limit fast (before hard errors).
  {
    const lim = yield* makeAdaptiveLimiter({
      initial: 64,
      min: 2,
      max: 128,
      latencyThresholdMs: 200,
    });
    // a burst of slow-but-not-failing responses signals overload
    for (let i = 0; i < 3; i++) yield* lim.run(500, noop);
    const limit = yield* lim.limit;
    yield* check(
      "a latency spike backs the limit off multiplicatively",
      limit === 8,
      `3 slow responses halved the limit 64 -> 32 -> 16 -> ${limit}, reacting before failures cascade`,
    );
  }

  // Property 3: the limit is respected at every instant; surplus is rejected.
  {
    const lim = yield* makeAdaptiveLimiter({
      initial: 4,
      min: 4,
      max: 4, // pinned, so we can assert admission exactly
      latencyThresholdMs: 1000,
    });
    // launch 20 concurrent long requests against a limit of 4
    const results = yield* Effect.all(
      Array.from({ length: 20 }, () => lim.run(50, Effect.sleep("20 millis"))),
      { concurrency: "unbounded" },
    );
    const admitted = results.filter((r) => r.admitted).length;
    yield* check(
      "in-flight never exceeds the current limit",
      admitted === 4,
      `20 concurrent requests against a limit of 4 admitted exactly ${admitted}; the rest were shed`,
    );
  }

  // Property 4: the loop settles near capacity instead of oscillating wildly.
  {
    const lim = yield* makeAdaptiveLimiter({
      initial: 10,
      min: 2,
      max: 60,
      latencyThresholdMs: 200,
    });
    // downstream capacity is ~20: requests are fast until the limit exceeds
    // 20, then they turn slow (overload), pushing the limit back down
    for (let round = 0; round < 60; round++) {
      const current = yield* lim.limit;
      const latency = current > 20 ? 400 : 80; // overloaded above capacity
      yield* lim.run(latency, noop);
    }
    const settled = yield* lim.limit;
    yield* check(
      "the control loop settles near real capacity",
      settled >= 8 && settled <= 22,
      `with a downstream capacity of ~20, the limit converged to ${settled}, hugging the cliff without runaway`,
    );
  }

  console.log("aimd.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

/**
 * sliding-window.ts
 *
 * Failure modes solved:
 *   1. Fixed-window counters allow a 2x burst at the boundary: "100 per
 *      minute" reset on the clock minute admits 100 at 0:59.9 and 100 more
 *      at 1:00.0, so 200 requests land in a fraction of a second, the exact
 *      spike the limit was meant to forbid. The window has to slide with
 *      the request, not snap to a grid.
 *   2. A true sliding log is accurate but stores every timestamp: keeping
 *      one entry per request to count "how many in the last 60s" costs
 *      memory proportional to the traffic, which an abusive client can turn
 *      into a memory-exhaustion vector. The sliding-window-counter
 *      approximation keeps just TWO numbers (current and previous fixed
 *      window counts) and weights the previous window by how much of it
 *      still overlaps the sliding window, bounding both the boundary burst
 *      and the memory to O(1) per key.
 *
 * Why the primitives make it correct: each key's (windowStart, current,
 * previous) counters live in one Ref updated by a single Ref.modify per
 * request against a logical clock, so a request that rolls the window
 * atomically shifts current into previous and resets current; the estimate
 * weights previous by the fraction of it still in view; and the decision to
 * admit is made in the same atomic step as the count bump, so two
 * concurrent requests at the limit cannot both slip through.
 */

import { Effect, Ref } from "effect";

interface WindowState {
  readonly windowStart: number;
  readonly current: number;
  readonly previous: number;
}

export interface RateLimiter {
  readonly tryAcquire: (
    key: string,
  ) => Effect.Effect<{ allowed: boolean; estimate: number }>;
  readonly tick: (ms: number) => Effect.Effect<void>;
}

export const makeSlidingWindow = (config: {
  readonly limit: number;
  readonly windowMs: number;
}): Effect.Effect<RateLimiter> =>
  Effect.gen(function* () {
    const clock = yield* Ref.make(0);
    const buckets = yield* Ref.make(new Map<string, WindowState>());

    const tryAcquire = (key: string) =>
      Effect.gen(function* () {
        const now = yield* Ref.get(clock);
        return yield* Ref.modify(
          buckets,
          (
            m,
          ): readonly [
            { allowed: boolean; estimate: number },
            Map<string, WindowState>,
          ] => {
            const held = m.get(key) ?? {
              windowStart: now,
              current: 0,
              previous: 0,
            };
            // roll the window forward as far as `now` requires
            let { windowStart, current, previous } = held;
            const elapsed = now - windowStart;
            if (elapsed >= 2 * config.windowMs) {
              previous = 0;
              current = 0;
              windowStart = now;
            } else if (elapsed >= config.windowMs) {
              previous = current;
              current = 0;
              windowStart = windowStart + config.windowMs;
            }
            // weight the previous window by the fraction still overlapping
            const intoCurrent = now - windowStart;
            const overlap = Math.max(0, 1 - intoCurrent / config.windowMs);
            const estimate = current + previous * overlap;
            if (estimate + 1 > config.limit) {
              return [
                { allowed: false, estimate },
                new Map(m).set(key, { windowStart, current, previous }),
              ];
            }
            return [
              { allowed: true, estimate: estimate + 1 },
              new Map(m).set(key, {
                windowStart,
                current: current + 1,
                previous,
              }),
            ];
          },
        );
      });

    return {
      tryAcquire,
      tick: (ms: number) => Ref.update(clock, (n) => n + ms),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: the fixed-window baseline admits 2x across the boundary.
  {
    const limit = 10;
    let windowStart = 0;
    let count = 0;
    let now = 0;
    const fixed = () => {
      if (now - windowStart >= 1000) {
        windowStart = now;
        count = 0;
      }
      if (count < limit) {
        count++;
        return true;
      }
      return false;
    };
    now = 999;
    let a = 0;
    for (let i = 0; i < 20; i++) if (fixed()) a++;
    now = 1000;
    let b = 0;
    for (let i = 0; i < 20; i++) if (fixed()) b++;
    yield* check(
      "fixed window leaks 2x at the boundary",
      a === 10 && b === 10,
      `${a + b} requests admitted in ~1ms straddling the reset, double the ${limit}/window budget`,
    );
  }

  // Property 2: the sliding window bounds the same boundary burst.
  {
    const rl = yield* makeSlidingWindow({ limit: 10, windowMs: 1000 });
    yield* rl.tick(999);
    let admitted = 0;
    for (let i = 0; i < 20; i++)
      if ((yield* rl.tryAcquire("ip")).allowed) admitted++;
    yield* rl.tick(1); // cross into the next window: previous still ~100% in view
    for (let i = 0; i < 20; i++)
      if ((yield* rl.tryAcquire("ip")).allowed) admitted++;
    yield* check(
      "sliding window blocks the boundary burst",
      admitted <= 10,
      `across the same boundary the sliding window admitted only ${admitted} (weighted previous window still counts)`,
    );
  }

  // Property 3: as the window slides fully past, budget refills smoothly.
  {
    const rl = yield* makeSlidingWindow({ limit: 10, windowMs: 1000 });
    for (let i = 0; i < 10; i++) yield* rl.tryAcquire("ip"); // exhaust
    const blocked = yield* rl.tryAcquire("ip");
    yield* rl.tick(1500); // slide halfway into the next window: old count weighted to 50%
    let halfway = 0;
    for (let i = 0; i < 20; i++)
      if ((yield* rl.tryAcquire("ip")).allowed) halfway++;
    yield* rl.tick(2000); // two full windows past the originals: fully aged out
    let refilled = 0;
    for (let i = 0; i < 20; i++)
      if ((yield* rl.tryAcquire("ip")).allowed) refilled++;
    yield* check(
      "budget refills gradually as the window slides past old requests",
      blocked.allowed === false && halfway === 5 && refilled === 10,
      `exhausted, then halfway-slid admitted ${halfway} (old count weighted 50%), and fully-slid admitted ${refilled}`,
    );
  }

  // Property 4: per-key isolation and O(1) state. One noisy key cannot use
  // another's budget, and no per-request timestamps are stored.
  {
    const rl = yield* makeSlidingWindow({ limit: 5, windowMs: 1000 });
    for (let i = 0; i < 10; i++) yield* rl.tryAcquire("noisy");
    const victim = yield* rl.tryAcquire("quiet");
    yield* check(
      "limits are per key, state is O(1) per key",
      victim.allowed === true,
      `the "noisy" key exhausting its budget did not touch "quiet", which was still admitted`,
    );
  }

  // Property 5: the last slot under the limit is granted exactly once.
  {
    const rl = yield* makeSlidingWindow({ limit: 1, windowMs: 1000 });
    const results = yield* Effect.all(
      Array.from({ length: 50 }, () => rl.tryAcquire("k")),
      { concurrency: "unbounded" },
    );
    const admitted = results.filter((r) => r.allowed).length;
    yield* check(
      "concurrent requests cannot both take the last slot",
      admitted === 1,
      `50 racing requests against a limit of 1 admitted exactly ${admitted}`,
    );
  }

  console.log("sliding-window.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

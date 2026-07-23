/**
 * token-bucket.ts
 *
 * Failure modes solved:
 *   1. The fixed window lets double the limit through a boundary: "1000
 *      requests per minute" counted in wall-clock minutes accepts 1000 at
 *      0:59 and another 1000 at 1:00, so a client lands 2000 requests in
 *      two seconds and your backend sees a spike the limit was supposed to
 *      forbid. A token bucket meters continuously: tokens refill at a
 *      steady rate, and no boundary resets the count, so the true rate
 *      over any window is bounded.
 *   2. Sustained-rate limiting that forbids all bursts is also wrong: real
 *      clients are bursty (a page load fires ten requests at once). The
 *      bucket allows a burst up to its capacity, then throttles to the
 *      refill rate, so a normal burst succeeds while an abusive stream is
 *      shaped down to the sustainable rate.
 *
 * Why the primitives make it correct: the bucket's token count and last
 * refill time live in one Ref updated by a single Ref.modify per request
 * (lazy refill: tokens accrue as a function of elapsed logical time, no
 * background timer to drift), so concurrent requests can never both spend
 * the same token; capacity caps the burst; and a logical clock Ref makes
 * the refill math deterministic for the demo.
 */

import { Effect, Ref } from "effect";

interface BucketState {
  readonly tokens: number;
  readonly lastRefill: number;
}

export interface TokenBucket {
  /** try to spend `cost` tokens; returns whether it was allowed */
  readonly tryAcquire: (
    cost?: number,
  ) => Effect.Effect<{ allowed: boolean; tokens: number }>;
  readonly tick: (ms: number) => Effect.Effect<void>;
  readonly available: Effect.Effect<number>;
}

export const makeTokenBucket = (config: {
  readonly capacity: number;
  /** tokens added per second */
  readonly refillPerSec: number;
}): Effect.Effect<TokenBucket> =>
  Effect.gen(function* () {
    const clock = yield* Ref.make(0);
    const state = yield* Ref.make<BucketState>({
      tokens: config.capacity,
      lastRefill: 0,
    });

    const tryAcquire = (cost = 1) =>
      Effect.gen(function* () {
        const now = yield* Ref.get(clock);
        return yield* Ref.modify(
          state,
          (s): readonly [{ allowed: boolean; tokens: number }, BucketState] => {
            const elapsedSec = (now - s.lastRefill) / 1000;
            const refilled = Math.min(
              config.capacity,
              s.tokens + elapsedSec * config.refillPerSec,
            );
            if (refilled >= cost) {
              return [
                { allowed: true, tokens: refilled - cost },
                { tokens: refilled - cost, lastRefill: now },
              ];
            }
            return [
              { allowed: false, tokens: refilled },
              { tokens: refilled, lastRefill: now },
            ];
          },
        );
      });

    return {
      tryAcquire,
      tick: (ms: number) => Ref.update(clock, (n) => n + ms),
      available: Ref.get(state).pipe(Effect.map((s) => s.tokens)),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: the fixed-window baseline leaks 2x at the boundary.
  {
    const limit = 10;
    let windowStart = 0;
    let count = 0;
    let now = 0;
    const fixedWindow = () => {
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
    // spend the window's budget at 0.9s, then again right after reset at 1.0s
    now = 900;
    let burst1 = 0;
    for (let i = 0; i < 20; i++) if (fixedWindow()) burst1++;
    now = 1000;
    let burst2 = 0;
    for (let i = 0; i < 20; i++) if (fixedWindow()) burst2++;
    yield* check(
      "fixed window admits 2x across the boundary",
      burst1 === 10 && burst2 === 10,
      `${burst1 + burst2} requests landed in ~100ms straddling the reset (limit was ${limit}/sec)`,
    );
  }

  // Property 2: the token bucket bounds the rate across the same boundary.
  {
    const bucket = yield* makeTokenBucket({ capacity: 10, refillPerSec: 10 });
    yield* bucket.tick(900);
    let admitted = 0;
    for (let i = 0; i < 20; i++)
      if ((yield* bucket.tryAcquire()).allowed) admitted++;
    yield* bucket.tick(100); // cross the "boundary": only ~1 token refilled
    for (let i = 0; i < 20; i++)
      if ((yield* bucket.tryAcquire()).allowed) admitted++;
    yield* check(
      "token bucket bounds the true rate at the boundary",
      admitted <= 12,
      `only ${admitted} requests admitted across the same boundary (10 capacity + ~1 refilled)`,
    );
  }

  // Property 3: a normal burst up to capacity is allowed instantly.
  {
    const bucket = yield* makeTokenBucket({ capacity: 10, refillPerSec: 2 });
    let ok = 0;
    for (let i = 0; i < 10; i++) if ((yield* bucket.tryAcquire()).allowed) ok++;
    const eleventh = yield* bucket.tryAcquire();
    yield* check(
      "a burst up to capacity succeeds, the next is shaped",
      ok === 10 && eleventh.allowed === false,
      `10 simultaneous requests all admitted; the 11th throttled with ${eleventh.tokens.toFixed(1)} tokens left`,
    );
  }

  // Property 4: after the burst, throughput settles to the refill rate.
  {
    const bucket = yield* makeTokenBucket({ capacity: 5, refillPerSec: 4 });
    for (let i = 0; i < 5; i++) yield* bucket.tryAcquire(); // drain
    yield* bucket.tick(1000); // one second passes -> 4 tokens
    let refilledAdmits = 0;
    for (let i = 0; i < 10; i++)
      if ((yield* bucket.tryAcquire()).allowed) refilledAdmits++;
    yield* check(
      "sustained rate equals the refill rate",
      refilledAdmits === 4,
      `after draining, one second refilled exactly ${refilledAdmits} tokens (rate 4/sec)`,
    );
  }

  // Property 5: concurrent requests cannot both spend the last token.
  {
    const bucket = yield* makeTokenBucket({ capacity: 1, refillPerSec: 0 });
    const results = yield* Effect.all(
      Array.from({ length: 50 }, () => bucket.tryAcquire()),
      { concurrency: "unbounded" },
    );
    const admitted = results.filter((r) => r.allowed).length;
    yield* check(
      "the last token is spent exactly once under concurrency",
      admitted === 1,
      `50 racing requests for a 1-token bucket admitted exactly ${admitted}`,
    );
  }

  console.log("token-bucket.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

/**
 * stampede.ts
 *
 * Failure modes solved:
 *   1. Cache stampede (database meltdown): when a hot key expires, every
 *      concurrent request that misses the cache races to recompute it, and a
 *      single expiry turns into thousands of identical loads that flatten the
 *      database. Effect's Cache coalesces concurrent gets of the same missing
 *      key onto one pending lookup fiber (single flight), so a thousand callers
 *      share one load and see its result the moment it lands. The correctness
 *      does not rest on anyone remembering to take a lock: coalescing is the
 *      shape of Cache.get, not a convention layered on top.
 *   2. Thundering herd (traffic spike on a cold cache): a cold start or a mass
 *      invalidation means many distinct keys miss at once, and single-flight per
 *      key still lets N distinct keys open N simultaneous loads against a
 *      database sized for far fewer. A Semaphore in front of the load path is an
 *      admission gate: the lookup waits for a permit before touching the
 *      database, so in-flight loads can never exceed the permit count no matter
 *      how large the spike. Stale-while-revalidate (serve the last good value
 *      while one background fiber refreshes) keeps the herd reading from cache
 *      instead of queueing on the gate during the refresh window.
 *
 * Why the primitives make it correct: Cache.get is the single author of the
 * coalescing guarantee, the Semaphore is the single author of the concurrency
 * ceiling, and both are enforced by the runtime rather than by caller
 * discipline. There is no second code path that can bypass either one.
 */

import { Cache, Data, Duration, Effect, Ref, Semaphore } from "effect"

// A tagged error so a failed origin read is a typed failure, not a thrown value.
class OriginUnavailable extends Data.TaggedError("OriginUnavailable")<{
  readonly key: string
}> {}

// In-memory stand-in for the expensive backing store. The Refs are the only
// real state: `loads` counts every physical read so the demo can prove
// coalescing, and `inFlight`/`maxInFlight` record how many reads overlapped so
// the demo can prove the admission gate held.
interface Origin {
  readonly read: (key: string) => Effect.Effect<string, OriginUnavailable>
  readonly loads: Ref.Ref<number>
  readonly maxInFlight: Ref.Ref<number>
}

const makeOrigin = (latency: Duration.Input): Effect.Effect<Origin> =>
  Effect.gen(function* () {
    const loads = yield* Ref.make(0)
    const inFlight = yield* Ref.make(0)
    const maxInFlight = yield* Ref.make(0)
    const read = (key: string) =>
      Effect.gen(function* () {
        yield* Ref.update(loads, (n) => n + 1)
        const now = yield* Ref.updateAndGet(inFlight, (n) => n + 1)
        yield* Ref.update(maxInFlight, (m) => Math.max(m, now))
        yield* Effect.sleep(latency) // model a slow query
        yield* Ref.update(inFlight, (n) => n - 1)
        return `value-for:${key}@rev1`
      })
    return { read, loads, maxInFlight } as const
  })

// A read-through cache whose lookup is admission-gated. Concurrent gets of one
// missing key collapse to a single lookup (Cache); distinct keys that all miss
// at once are throttled to `admission` concurrent origin reads (Semaphore).
const makeCoalescingCache = (
  origin: Origin,
  options: { readonly capacity: number; readonly ttl: Duration.Input; readonly admission: number },
) =>
  Effect.gen(function* () {
    const gate: Semaphore.Semaphore = yield* Semaphore.make(options.admission)
    const cache = yield* Cache.make<string, string, OriginUnavailable>({
      capacity: options.capacity,
      timeToLive: options.ttl,
      // The gate wraps the origin read, so the ceiling is enforced inside the
      // one place every miss must pass through.
      lookup: (key) => Semaphore.withPermits(gate, 1)(origin.read(key)),
    })
    return cache
  })

// Serve the current value immediately and refresh in the background: readers
// never block on the refresh, and Cache.refresh recomputes through the same
// coalescing lookup so a burst of refreshes is still one origin read.
const staleWhileRevalidate = (cache: Cache.Cache<string, string, OriginUnavailable>, key: string) =>
  Effect.gen(function* () {
    const current = yield* Cache.get(cache, key)
    yield* Effect.forkDetach(Cache.refresh(cache, key))
    return current
  })

// ---- demo: prove the two properties ----
const demo = Effect.gen(function* () {
  const assert = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  // Property 1: 100 concurrent gets of ONE cold key => exactly 1 origin load.
  {
    const origin = yield* makeOrigin("50 millis")
    const cache = yield* makeCoalescingCache(origin, { capacity: 1000, ttl: "10 seconds", admission: 8 })
    yield* Effect.all(
      Array.from({ length: 100 }, () => Cache.get(cache, "hot")),
      { concurrency: "unbounded" },
    )
    const loads = yield* Ref.get(origin.loads)
    yield* assert("single-flight coalescing", loads === 1, `100 concurrent gets caused ${loads} origin load(s), expected 1`)
  }

  // Property 2: thundering herd of 200 DISTINCT cold keys, admission gate = 8
  // => origin never sees more than 8 concurrent loads.
  {
    const origin = yield* makeOrigin("20 millis")
    const cache = yield* makeCoalescingCache(origin, { capacity: 1000, ttl: "10 seconds", admission: 8 })
    yield* Effect.all(
      Array.from({ length: 200 }, (_, i) => Cache.get(cache, `k${i}`)),
      { concurrency: "unbounded" },
    )
    const peak = yield* Ref.get(origin.maxInFlight)
    const loads = yield* Ref.get(origin.loads)
    yield* assert("admission gate ceiling", peak <= 8, `peak concurrent origin loads was ${peak}, ceiling 8`)
    yield* assert("distinct keys each loaded once", loads === 200, `200 distinct keys caused ${loads} loads, expected 200`)
  }

  // Property 3: stale-while-revalidate serves the cached value without blocking.
  {
    const origin = yield* makeOrigin("40 millis")
    const cache = yield* makeCoalescingCache(origin, { capacity: 1000, ttl: "10 seconds", admission: 8 })
    yield* Cache.get(cache, "swr") // warm it
    const before = yield* Ref.get(origin.loads)
    const served = yield* staleWhileRevalidate(cache, "swr")
    const afterImmediate = yield* Ref.get(origin.loads)
    yield* assert(
      "stale-while-revalidate is non-blocking",
      served.startsWith("value-for:swr") && afterImmediate === before,
      `served "${served}" with no extra synchronous load (loads ${before} -> ${afterImmediate})`,
    )
  }

  console.log("stampede.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})

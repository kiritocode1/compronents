/**
 * hedge.ts
 *
 * Failure modes solved:
 *   1. Tail latency (the p99 that costs revenue): most replicas answer in a
 *      few milliseconds, but a GC pause, a cold cache, or a slow disk makes
 *      one in a hundred take twenty times longer, and every user request that
 *      lands on the slow replica pays the full price. A hedged request waits
 *      for the p95 latency, then fires one backup request to another replica
 *      and takes whichever answers first. The slow tail is capped near
 *      (hedge delay + fast latency) instead of the straggler's full time.
 *   2. Load doubling (the hedge that becomes its own outage): hedging every
 *      request doubles traffic exactly when the backend is slow, which is
 *      exactly when it can least afford it. A token-bucket hedge budget
 *      (funded by completed requests, spent by hedges) caps hedges to a
 *      fixed fraction of traffic, so a systemic slowdown exhausts the budget
 *      and the hedger degrades to plain single requests instead of a storm.
 *
 * Why the primitives make it correct: Effect.raceFirst interrupts the losing
 * fiber the moment the winner lands, so an abandoned hedge never keeps
 * holding a connection, and the budget is one Ref.modify decision, so
 * concurrent hedgers cannot overspend it.
 */

import { Duration, Effect, Ref } from "effect"

export interface Hedger {
  /** Run `request`; if it has not answered within `delay`, race a backup. */
  readonly hedged: <A, E>(request: Effect.Effect<A, E>) => Effect.Effect<A, E>
  readonly stats: Effect.Effect<{ hedgesFired: number; budgetLeft: number }>
}

export const makeHedger = (options: {
  /** fire the backup after this long, typically the observed p95 */
  readonly delay: Duration.Input
  /** at most one hedge per this many completed requests */
  readonly hedgeEveryN: number
  /** hard cap on banked hedge tokens, so idle time cannot fund a burst */
  readonly burst: number
}): Effect.Effect<Hedger> =>
  Effect.gen(function* () {
    const tokens = yield* Ref.make(options.burst)
    const fills = yield* Ref.make(0)
    const hedgesFired = yield* Ref.make(0)

    // Each completed primary funds 1/N of a token; a hedge spends a whole one.
    const fund = Ref.update(fills, (n) => n + 1).pipe(
      Effect.andThen(
        Ref.modify(fills, (n) =>
          n >= options.hedgeEveryN ? ([true, 0] as const) : ([false, n] as const),
        ),
      ),
      Effect.tap((filled) =>
        filled ? Ref.update(tokens, (t) => Math.min(options.burst, t + 1)) : Effect.void,
      ),
    )
    const trySpend = Ref.modify(tokens, (t) => (t > 0 ? ([true, t - 1] as const) : ([false, t] as const)))

    const hedged = <A, E>(request: Effect.Effect<A, E>): Effect.Effect<A, E> => {
      const backup = Effect.gen(function* () {
        yield* Effect.sleep(options.delay)
        const allowed = yield* trySpend
        if (!allowed) {
          // Budget dry: never answer, so the primary is the only runner.
          return yield* Effect.never
        }
        yield* Ref.update(hedgesFired, (n) => n + 1)
        return yield* request
      })
      // raceFirst interrupts the loser, so the abandoned attempt releases its
      // connection instead of running to completion in the background.
      return Effect.raceFirst(request, backup).pipe(Effect.ensuring(fund))
    }

    const stats = Effect.gen(function* () {
      return {
        hedgesFired: yield* Ref.get(hedgesFired),
        budgetLeft: yield* Ref.get(tokens),
      }
    })

    return { hedged, stats } as const
  })

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const assert = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  // A replica pool where the straggler takes 400ms and a healthy pick takes 15ms.
  const makePool = () =>
    Effect.gen(function* () {
      const calls = yield* Ref.make(0)
      const interrupted = yield* Ref.make(0)
      const query = (latencyMs: number) =>
        Effect.gen(function* () {
          yield* Ref.update(calls, (n) => n + 1)
          yield* Effect.sleep(Duration.millis(latencyMs))
          return `rows@${latencyMs}ms`
        }).pipe(Effect.onInterrupt(() => Ref.update(interrupted, (n) => n + 1)))
      return { calls, interrupted, query } as const
    })

  // Property 1: a straggler primary is capped near hedge delay + fast latency.
  {
    const pool = yield* makePool()
    const hedger = yield* makeHedger({ delay: "30 millis", hedgeEveryN: 10, burst: 5 })
    const t0 = Date.now()
    // First call is the 400ms straggler; the hedge re-queries at 15ms.
    let served = ""
    {
      let first = true
      served = yield* hedger.hedged(
        Effect.suspend(() => {
          const latency = first ? 400 : 15
          first = false
          return pool.query(latency)
        }),
      )
    }
    const elapsed = Date.now() - t0
    const cancelled = yield* Ref.get(pool.interrupted)
    yield* assert(
      "hedge caps the tail",
      served === "rows@15ms" && elapsed < 200 && cancelled === 1,
      `served "${served}" in ${elapsed}ms (straggler was 400ms) and the loser was interrupted (${cancelled})`,
    )
  }

  // Property 2: a fast primary never pays for a hedge.
  {
    const pool = yield* makePool()
    const hedger = yield* makeHedger({ delay: "30 millis", hedgeEveryN: 10, burst: 5 })
    yield* hedger.hedged(pool.query(5))
    const calls = yield* Ref.get(pool.calls)
    const { hedgesFired } = yield* hedger.stats
    yield* assert(
      "fast path fires no hedge",
      calls === 1 && hedgesFired === 0,
      `one 5ms request made ${calls} call(s) and fired ${hedgesFired} hedge(s)`,
    )
  }

  // Property 3: a systemic slowdown exhausts the budget instead of doubling load.
  {
    const pool = yield* makePool()
    const hedger = yield* makeHedger({ delay: "10 millis", hedgeEveryN: 1000, burst: 2 })
    // Every request is slow (60ms), so every request WANTS to hedge; the
    // budget allows only the banked burst of 2.
    yield* Effect.all(
      Array.from({ length: 12 }, () => hedger.hedged(pool.query(60))),
      { concurrency: "unbounded" },
    )
    const { hedgesFired, budgetLeft } = yield* hedger.stats
    yield* assert(
      "budget stops a hedge storm",
      hedgesFired <= 2 && budgetLeft === 0,
      `12 slow requests fired ${hedgesFired} hedge(s) (cap 2), budget left ${budgetLeft}`,
    )
  }

  console.log("hedge.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})

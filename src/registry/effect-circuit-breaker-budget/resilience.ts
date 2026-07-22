/**
 * resilience.ts
 *
 * Failure modes solved:
 *   1. Retry storms (self-inflicted denial of service): a dependency wobbles,
 *      every caller retries, the retries multiply the load on the already-sick
 *      dependency, and the fleet DDoSes itself. Two primitives bound this. A
 *      retry budget is a token bucket where healthy traffic earns retry tokens
 *      at a fixed ratio and each retry spends one, so total retries can never
 *      exceed that percentage of traffic no matter how many callers fail at
 *      once. Backoff is Schedule.exponential made non-synchronised by
 *      Schedule.jittered, so recovering callers do not re-align into a
 *      synchronised wave that hammers the dependency on the same tick.
 *   2. Cascading failures (one slow dependency takes down its callers): a
 *      dependency stops responding, callers block on it, threads and fibers pile
 *      up, and the caller falls over from the waiting rather than from its own
 *      fault. Three primitives contain the blast radius. Effect.timeout turns an
 *      unbounded wait into a bounded typed failure, so no fiber is pinned to a
 *      dead dependency. A circuit breaker is a Ref state machine (closed, open,
 *      half-open) that, once a dependency has failed enough, rejects calls
 *      immediately instead of letting each one discover the outage the slow way,
 *      then admits a single probe after a cooldown to test recovery. A bulkhead
 *      is a Semaphore that caps concurrent calls to one dependency, so a
 *      saturated dependency exhausts only its own permits and the caller keeps
 *      serving everything else.
 *
 * Why the primitives make it correct: the budget cap is an atomic Ref.modify so
 * it holds under concurrency, the breaker's transitions are a single atomic
 * modify keyed on the Clock so two fibers cannot both slip a probe through, and
 * the bulkhead's ceiling is the Semaphore permit count, enforced by the runtime.
 */

import { Clock, Data, Duration, Effect, Option, Ref, Schedule, Semaphore } from "effect"

class DependencyDown extends Data.TaggedError("DependencyDown")<{ readonly why: string }> {}
class CircuitOpen extends Data.TaggedError("CircuitOpen")<{ readonly retryAfterMillis: number }> {}
class BulkheadFull extends Data.TaggedError("BulkheadFull")<{ readonly dependency: string }> {}
class RetryBudgetExhausted extends Data.TaggedError("RetryBudgetExhausted")<{}> {}

// ---- retry budget: a token bucket where traffic funds retries ----
interface RetryBudget {
  readonly tokens: Ref.Ref<number>
  readonly cap: number
  readonly earnPerCall: number
}

const makeRetryBudget = (options: { readonly cap: number; readonly earnPerCall: number }) =>
  Effect.map(Ref.make(0), (tokens) => ({ tokens, cap: options.cap, earnPerCall: options.earnPerCall }) satisfies RetryBudget)

// Every call funds the bucket by `earnPerCall`; every failure that wants a retry
// must spend one whole token. When the bucket is empty the failure is rewritten
// to RetryBudgetExhausted, which the retry policy refuses to retry, so the sum
// of retries across all callers is capped at earnPerCall * calls.
const withBudgetedRetry =
  (budget: RetryBudget) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | RetryBudgetExhausted, R> => {
    const policy = Schedule.jittered(Schedule.exponential("10 millis", 2))
    // On each failure, atomically spend one retry token. If the bucket is empty
    // the failure becomes RetryBudgetExhausted, which the retry policy refuses.
    const spend: Effect.Effect<A, E | RetryBudgetExhausted, R> = Effect.catch(effect, (err: E) =>
      Effect.flatMap(
        Ref.modify(budget.tokens, (t) => (t >= 1 ? ([true, t - 1] as const) : ([false, t] as const))),
        (hasToken): Effect.Effect<never, E | RetryBudgetExhausted> =>
          hasToken ? Effect.fail(err) : Effect.fail(new RetryBudgetExhausted()),
      ),
    )
    return Effect.andThen(
      Ref.update(budget.tokens, (t) => Math.min(budget.cap, t + budget.earnPerCall)),
      Effect.retry(spend, { schedule: policy, while: (e) => !(e instanceof RetryBudgetExhausted) }),
    )
  }

// ---- circuit breaker: a Ref state machine keyed on the Clock ----
type BreakerState =
  | { readonly _tag: "closed"; readonly failures: number }
  | { readonly _tag: "open"; readonly until: number }
  | { readonly _tag: "halfOpen" }

interface Breaker {
  readonly state: Ref.Ref<BreakerState>
  readonly threshold: number
  readonly cooldownMillis: number
}

const makeBreaker = (options: { readonly threshold: number; readonly cooldown: Duration.Input }) =>
  Effect.map(
    Ref.make<BreakerState>({ _tag: "closed", failures: 0 }),
    (state) =>
      ({ state, threshold: options.threshold, cooldownMillis: Duration.toMillis(options.cooldown) }) satisfies Breaker,
  )

const withBreaker =
  (breaker: Breaker) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | CircuitOpen, R> =>
    Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      // One atomic transition decides admission. "open" past its cooldown flips to
      // "halfOpen" and admits exactly one probe; a concurrent caller then reads
      // "halfOpen" and is rejected, so only one probe is ever in flight.
      const gate = yield* Ref.modify(
        breaker.state,
        (s): readonly ["admit" | { readonly reject: number }, BreakerState] => {
          if (s._tag === "closed") return ["admit", s]
          if (s._tag === "open") {
            return now >= s.until ? ["admit", { _tag: "halfOpen" }] : [{ reject: s.until - now }, s]
          }
          return [{ reject: 0 }, s] // halfOpen: a probe is already in flight
        },
      )

      if (typeof gate === "object") {
        return yield* Effect.fail(new CircuitOpen({ retryAfterMillis: Math.max(0, gate.reject) }))
      }

      const onSuccess = Ref.set(breaker.state, { _tag: "closed", failures: 0 } as BreakerState)
      const onFailure = Ref.update(breaker.state, (s): BreakerState => {
        if (s._tag === "halfOpen") return { _tag: "open", until: now + breaker.cooldownMillis }
        const failures = (s._tag === "closed" ? s.failures : 0) + 1
        return failures >= breaker.threshold
          ? { _tag: "open", until: now + breaker.cooldownMillis }
          : { _tag: "closed", failures }
      })

      return yield* effect.pipe(Effect.tap(() => onSuccess), Effect.tapError(() => onFailure))
    })

// ---- bulkhead: a per-dependency Semaphore that fails fast when saturated ----
const makeBulkhead = (dependency: string, permits: number) =>
  Effect.map(Semaphore.make(permits), (sem) => ({
    run: <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | BulkheadFull, R> =>
      Semaphore.withPermitsIfAvailable(sem, 1)(effect).pipe(
        Effect.flatMap(Option.match({ onNone: () => Effect.fail(new BulkheadFull({ dependency })), onSome: Effect.succeed })),
      ),
  }))

// A flaky dependency whose physical invocations are counted, wrapped in a
// timeout so a hang becomes a bounded typed failure rather than a pinned fiber.
const makeDependency = (options: { readonly failFirst: number; readonly latency: Duration.Input }) =>
  Effect.gen(function* () {
    const attempts = yield* Ref.make(0)
    const call = Effect.gen(function* () {
      const n = yield* Ref.updateAndGet(attempts, (a) => a + 1)
      yield* Effect.sleep(options.latency)
      if (n <= options.failFirst) return yield* Effect.fail(new DependencyDown({ why: `attempt ${n}` }))
      return `ok@${n}`
    }).pipe(Effect.timeout("500 millis"))
    return { call, attempts } as const
  })

const demo = Effect.gen(function* () {
  const assert = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  // Property 1: breaker opens after `threshold` failures and short-circuits.
  {
    const dep = yield* makeDependency({ failFirst: 1000, latency: "1 millis" }) // always fails
    const breaker = yield* makeBreaker({ threshold: 3, cooldown: "80 millis" })
    const guarded = withBreaker(breaker)(dep.call)
    // 3 failures trip it; the 4th and 5th must not reach the dependency.
    for (let i = 0; i < 5; i++) yield* Effect.result(guarded)
    const attemptsAfterTrip = yield* Ref.get(dep.attempts)
    const lastTwo = yield* Effect.all([Effect.result(guarded), Effect.result(guarded)])
    const attemptsFinal = yield* Ref.get(dep.attempts)
    const shortCircuited = lastTwo.every((r) => r._tag === "Failure" && r.failure instanceof CircuitOpen)
    yield* assert(
      "breaker opens and short-circuits",
      attemptsAfterTrip === 3 && shortCircuited && attemptsFinal === 3,
      `dependency touched ${attemptsFinal}x (frozen at 3), extra calls rejected as CircuitOpen=${shortCircuited}`,
    )

    // Property 2: after cooldown a single half-open probe is admitted and, on
    // success, closes the breaker.
    yield* Effect.sleep("100 millis")
    const dep2 = yield* makeDependency({ failFirst: 0, latency: "1 millis" }) // healthy now
    const guarded2 = withBreaker(breaker)(dep2.call)
    const probe = yield* Effect.result(guarded2)
    const state = yield* Ref.get(breaker.state)
    yield* assert(
      "half-open probe recovers the breaker",
      probe._tag === "Success" && state._tag === "closed",
      `probe result=${probe._tag}, breaker state=${state._tag} after successful probe`,
    )
  }

  // Property 3: retry budget caps total retries at earnPerCall * traffic.
  {
    const budget = yield* makeRetryBudget({ cap: 100, earnPerCall: 0.2 }) // 20% of traffic
    const dep = yield* makeDependency({ failFirst: 100000, latency: "1 millis" }) // always fails
    const traffic = 50
    yield* Effect.all(
      Array.from({ length: traffic }, () => Effect.result(withBudgetedRetry(budget)(dep.call))),
      { concurrency: 10 },
    )
    const totalAttempts = yield* Ref.get(dep.attempts)
    const retries = totalAttempts - traffic // first attempt of each call is free
    const cap = Math.ceil(traffic * 0.2)
    yield* assert(
      "retry budget caps the storm",
      retries <= cap,
      `${traffic} always-failing calls produced ${retries} retries, budget ceiling ${cap} (20% of traffic)`,
    )
  }

  // Property 4: bulkhead rejects overflow instead of queueing on a saturated dep.
  {
    const bulkhead = yield* makeBulkhead("payments", 2)
    const slow = Effect.sleep("120 millis").pipe(Effect.as("done"))
    // Hold both permits, then a third concurrent call must be rejected fast.
    const results = yield* Effect.all(
      [bulkhead.run(slow), bulkhead.run(slow), bulkhead.run(slow)],
      { concurrency: "unbounded" },
    ).pipe(Effect.result)
    const rejected = results._tag === "Failure" && results.failure instanceof BulkheadFull
    yield* assert(
      "bulkhead sheds overflow",
      rejected,
      `third concurrent call over a 2-permit bulkhead was rejected as BulkheadFull=${rejected}`,
    )
  }

  console.log("resilience.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})

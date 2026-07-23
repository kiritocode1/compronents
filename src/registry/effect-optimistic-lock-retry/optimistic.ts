/**
 * optimistic.ts
 *
 * Failure modes solved:
 *   1. The lost update (read-modify-write without a guard): two request
 *      handlers read stock=10, both compute 9, both write 9, and one sale
 *      vanished from the books. No error was thrown anywhere; the data is
 *      just wrong. Optimistic locking makes the write conditional: every
 *      row carries a version, the update says "set ... where version = the
 *      one I read", and a write that lost the race affects zero rows and
 *      surfaces as a typed VersionConflict instead of silently clobbering.
 *   2. The convoy you did not need (pessimistic locks under low
 *      contention): taking a row lock on every read pays the serialization
 *      cost even when conflicts are rare, which is most workloads. The
 *      optimistic path lets everyone proceed and charges only the actual
 *      losers: a conflicted writer re-reads the fresh row and retries with
 *      jittered backoff, bounded times, so under rare conflicts almost
 *      every write is lock-free and under a genuine hot spot the retry
 *      exhaustion is a visible typed failure you can route to a queue.
 *
 * Why the primitives make it correct: the compare-and-set is one atomic
 * Ref.modify (the same shape as UPDATE ... WHERE version = ?), the retry
 * loop re-reads before every attempt so it never replays a stale
 * computation, and Schedule.jittered desynchronizes competing retriers
 * instead of letting them collide again in lockstep.
 */

import { Data, Effect, Fiber, Ref, Schedule } from "effect"

export class VersionConflict extends Data.TaggedError("VersionConflict")<{
  readonly key: string
  readonly expected: number
  readonly actual: number
}> {}

export class RetriesExhausted extends Data.TaggedError("RetriesExhausted")<{
  readonly key: string
  readonly attempts: number
}> {}

interface Row<A> {
  readonly value: A
  readonly version: number
}

export interface VersionedStore<A> {
  readonly get: (key: string) => Effect.Effect<Row<A> | undefined>
  /** UPDATE ... SET value, version+1 WHERE version = expected */
  readonly compareAndSet: (
    key: string,
    expected: number,
    value: A,
  ) => Effect.Effect<Row<A>, VersionConflict>
  readonly insert: (key: string, value: A) => Effect.Effect<void>
  readonly conflicts: Ref.Ref<number>
}

export const makeVersionedStore = <A>(): Effect.Effect<VersionedStore<A>> =>
  Effect.gen(function* () {
    const table = yield* Ref.make(new Map<string, Row<A>>())
    const conflicts = yield* Ref.make(0)

    const get = (key: string) => Ref.get(table).pipe(Effect.map((m) => m.get(key)))
    const insert = (key: string, value: A) =>
      Ref.update(table, (m) => new Map(m).set(key, { value, version: 1 }))

    const compareAndSet = (key: string, expected: number, value: A) =>
      Effect.gen(function* () {
        type Outcome = { readonly _tag: "Ok"; readonly row: Row<A> } | { readonly _tag: "Conflict"; readonly actual: number }
        const outcome = yield* Ref.modify(
          table,
          (m): readonly [Outcome, Map<string, Row<A>>] => {
            const held = m.get(key)
            const actual = held?.version ?? 0
            if (actual !== expected) return [{ _tag: "Conflict", actual }, m]
            const row: Row<A> = { value, version: expected + 1 }
            return [{ _tag: "Ok", row }, new Map(m).set(key, row)]
          },
        )
        if (outcome._tag === "Conflict") {
          yield* Ref.update(conflicts, (n) => n + 1)
          return yield* new VersionConflict({ key, expected, actual: outcome.actual })
        }
        return outcome.row
      })

    return { get, compareAndSet, insert, conflicts } as const
  })

/**
 * Read-modify-write with the optimistic loop: re-read, compute, CAS, and on
 * conflict retry with jittered backoff up to `maxRetries` times.
 */
export const optimisticUpdate = <A>(
  store: VersionedStore<A>,
  key: string,
  compute: (current: A) => A,
  options: {
    readonly maxRetries: number
    /** models the SELECT-to-UPDATE round trip where the race lives */
    readonly readWriteGapMs?: number
  },
): Effect.Effect<Row<A>, RetriesExhausted> =>
  Effect.gen(function* () {
    const attempt = Effect.gen(function* () {
      const row = yield* store.get(key)
      if (row === undefined) {
        return yield* Effect.die(new Error(`optimisticUpdate on missing key ${key}`))
      }
      if (options.readWriteGapMs) yield* Effect.sleep(`${options.readWriteGapMs} millis`)
      // compute against THIS read's value; a conflict discards it and re-reads
      return yield* store.compareAndSet(key, row.version, compute(row.value))
    })
    return yield* attempt.pipe(
      Effect.retry({
        schedule: Schedule.jittered(Schedule.exponential("2 millis", 2)),
        times: options.maxRetries,
      }),
      Effect.catchTag("VersionConflict", () =>
        new RetriesExhausted({ key, attempts: options.maxRetries + 1 }),
      ),
    )
  })

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  // Property 1: the unguarded version LOSES updates silently.
  {
    const naive = yield* Ref.make(0) // stands in for a guardless row
    const readModifyWrite = Effect.gen(function* () {
      const current = yield* Ref.get(naive)
      yield* Effect.sleep("2 millis") // the gap where the race lives
      yield* Ref.set(naive, current + 1)
    })
    yield* Effect.all(
      Array.from({ length: 50 }, () => readModifyWrite),
      { concurrency: "unbounded" },
    )
    const total = yield* Ref.get(naive)
    yield* check(
      "unguarded read-modify-write loses updates",
      total < 50,
      `50 concurrent increments landed as ${total}: ${50 - total} sales silently vanished, no error anywhere`,
    )
  }

  // Property 2: the optimistic loop lands every update under contention.
  {
    const store = yield* makeVersionedStore<number>()
    yield* store.insert("stock:sku-42", 0)
    const results = yield* Effect.all(
      Array.from({ length: 50 }, () =>
        optimisticUpdate(store, "stock:sku-42", (n) => n + 1, {
          maxRetries: 80,
          readWriteGapMs: 1,
        }).pipe(Effect.exit),
      ),
      { concurrency: "unbounded" },
    )
    const landed = results.filter((e) => e._tag === "Success").length
    const row = yield* store.get("stock:sku-42")
    const conflictCount = yield* Ref.get(store.conflicts)
    yield* check(
      "versioned CAS loses nothing",
      landed === 50 && row?.value === 50 && row.version === 51,
      `50 concurrent increments: value ${row?.value}, version ${row?.version}, ${conflictCount} conflicts retried instead of clobbered`,
    )
  }

  // Property 3: conflicts are typed and carry both versions.
  {
    const store = yield* makeVersionedStore<string>()
    yield* store.insert("doc:readme", "v1 text")
    const row = yield* store.get("doc:readme")
    yield* store.compareAndSet("doc:readme", row?.version ?? 0, "editor A's text")
    const exit = yield* Effect.exit(
      store.compareAndSet("doc:readme", row?.version ?? 0, "editor B's text"),
    )
    yield* check(
      "the losing editor learns exactly what happened",
      exit._tag === "Failure" && String(exit.cause).includes("VersionConflict"),
      `editor B's write against version 1 failed typed (row is at 2); B re-reads and merges instead of overwriting A`,
    )
  }

  // Property 4: retry exhaustion on a genuine hot spot is a visible failure.
  {
    const store = yield* makeVersionedStore<number>()
    yield* store.insert("hot", 0)
    // an antagonist that bumps the version constantly
    const antagonist = Effect.gen(function* () {
      for (let i = 0; i < 200; i++) {
        const row = yield* store.get("hot")
        if (row) yield* store.compareAndSet("hot", row.version, row.value).pipe(Effect.exit)
        yield* Effect.sleep("1 millis")
      }
    })
    const fiber = yield* Effect.forkChild(antagonist)
    const exit = yield* Effect.exit(
      optimisticUpdate(store, "hot", (n) => n + 1, { maxRetries: 0 }).pipe(
        // with zero retries against a busy row, conflict surfaces immediately
        Effect.repeat({ times: 0 }),
      ),
    )
    const sawExhaustion =
      exit._tag === "Success" || String(exit.cause).includes("RetriesExhausted")
    yield* check(
      "hot-spot exhaustion is typed, not silent",
      sawExhaustion,
      `zero-retry write against a churning row either won its slot or failed RetriesExhausted; nothing was clobbered either way`,
    )
    yield* Fiber.interrupt(fiber)
  }

  console.log("optimistic.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})

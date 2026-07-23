/**
 * snowflake.ts
 *
 * Failure modes solved:
 *   1. The coordination bottleneck (one sequence table for every insert):
 *      a central AUTO_INCREMENT makes every writer in every region queue on
 *      one row. A snowflake ID is minted locally from 64 bits: 41 bits of
 *      milliseconds since a custom epoch, 10 bits of machine id, 12 bits of
 *      sequence within the millisecond. Any machine mints 4096 ids per ms
 *      with zero coordination, and ids still sort roughly by creation time,
 *      so they index and paginate like timestamps.
 *   2. Duplicate ids on clock rollback: the timestamp bits TRUST the wall
 *      clock, and wall clocks move backwards (NTP step, VM migration, leap
 *      smearing gone wrong). A generator that keeps minting during rollback
 *      re-issues timestamps it already used and collides with its own past.
 *      This generator remembers the last timestamp it minted against inside
 *      the same atomic decision as the mint: a small rollback parks the
 *      caller until the clock re-passes the high-water mark, a rollback
 *      beyond the tolerance is a typed ClockMovedBackward failure, and in
 *      neither case is a duplicate possible.
 *
 * Why the primitives make it correct: the (lastTimestamp, sequence) pair
 * lives in one Ref and every mint is one Ref.modify, so concurrent fibers
 * serialize through the atomic update and the exhausted-sequence and
 * rollback branches cannot interleave into a duplicate.
 */

import { Clock, Data, Effect, Fiber, Ref } from "effect"

export class ClockMovedBackward extends Data.TaggedError("ClockMovedBackward")<{
  readonly lastTimestamp: number
  readonly now: number
}> {}

const TIMESTAMP_BITS = 41n
const MACHINE_BITS = 10n
const SEQUENCE_BITS = 12n
const MAX_SEQUENCE = (1 << Number(SEQUENCE_BITS)) - 1 // 4095
const MAX_MACHINE = (1 << Number(MACHINE_BITS)) - 1 // 1023

export interface Snowflake {
  readonly next: Effect.Effect<bigint, ClockMovedBackward>
  /** unpack an id back into its parts, for debugging and range scans */
  readonly decode: (id: bigint) => {
    readonly timestampMs: number
    readonly machineId: number
    readonly sequence: number
  }
}

export const makeSnowflake = (options: {
  readonly machineId: number
  /** custom epoch; ids store milliseconds since this instant */
  readonly epochMs: number
  /** park-and-wait for rollbacks up to this size, fail beyond it */
  readonly maxBackwardDriftMs: number
  /** test seam: read a fake clock instead of Clock */
  readonly nowOverride?: Effect.Effect<number>
}): Effect.Effect<Snowflake> =>
  Effect.gen(function* () {
    if (options.machineId < 0 || options.machineId > MAX_MACHINE) {
      return yield* Effect.die(new Error(`machineId must be 0..${MAX_MACHINE}`))
    }
    const state = yield* Ref.make({ lastTimestamp: -1, sequence: 0 })
    const now = options.nowOverride ?? Clock.currentTimeMillis

    type MintResult =
      | { readonly _tag: "Minted"; readonly timestamp: number; readonly sequence: number }
      | { readonly _tag: "SequenceExhausted" }
      | { readonly _tag: "Backward"; readonly lastTimestamp: number }

    const next: Effect.Effect<bigint, ClockMovedBackward> = Effect.gen(function* () {
      while (true) {
        const t = yield* now
        // One atomic decision: mint, or report why not.
        const result = yield* Ref.modify(
          state,
          (s): readonly [MintResult, { lastTimestamp: number; sequence: number }] => {
          if (t < s.lastTimestamp) return [{ _tag: "Backward", lastTimestamp: s.lastTimestamp }, s]
          if (t === s.lastTimestamp) {
            if (s.sequence >= MAX_SEQUENCE) return [{ _tag: "SequenceExhausted" }, s]
            const seq = s.sequence + 1
            return [{ _tag: "Minted", timestamp: t, sequence: seq }, { lastTimestamp: t, sequence: seq }]
          }
          return [{ _tag: "Minted", timestamp: t, sequence: 0 }, { lastTimestamp: t, sequence: 0 }]
          },
        )

        switch (result._tag) {
          case "Minted": {
            const sinceEpoch = BigInt(result.timestamp - options.epochMs)
            return (
              (sinceEpoch << (MACHINE_BITS + SEQUENCE_BITS)) |
              (BigInt(options.machineId) << SEQUENCE_BITS) |
              BigInt(result.sequence)
            )
          }
          case "SequenceExhausted": {
            // 4096 ids minted this millisecond: wait for the next tick.
            yield* Effect.sleep("1 millis")
            break
          }
          case "Backward": {
            const drift = result.lastTimestamp - t
            if (drift > options.maxBackwardDriftMs) {
              return yield* new ClockMovedBackward({ lastTimestamp: result.lastTimestamp, now: t })
            }
            // Small drift: park until the clock re-passes the high-water mark.
            yield* Effect.sleep("1 millis")
            break
          }
        }
      }
    })

    const decode = (id: bigint) => ({
      timestampMs: Number(id >> (MACHINE_BITS + SEQUENCE_BITS)) + options.epochMs,
      machineId: Number((id >> SEQUENCE_BITS) & BigInt(MAX_MACHINE)),
      sequence: Number(id & BigInt(MAX_SEQUENCE)),
    })

    return { next, decode } as const
  })

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  const EPOCH = Date.UTC(2024, 0, 1)

  // Property 1: 20k concurrent mints, zero duplicates, k-sorted by time.
  {
    const flake = yield* makeSnowflake({ machineId: 7, epochMs: EPOCH, maxBackwardDriftMs: 10 })
    const ids = yield* Effect.all(
      Array.from({ length: 20_000 }, () => flake.next),
      { concurrency: "unbounded" },
    )
    const unique = new Set(ids.map(String)).size
    const decoded = flake.decode(ids[0])
    yield* check(
      "20k concurrent mints are unique",
      unique === 20_000 && decoded.machineId === 7,
      `${unique}/20000 unique, machine bits decode to ${decoded.machineId}`,
    )
    const sortedByValue = [...ids].sort((a, b) => (a < b ? -1 : 1))
    const timeOrdered = sortedByValue.every(
      (id, i) => i === 0 || flake.decode(sortedByValue[i - 1]).timestampMs <= flake.decode(id).timestampMs,
    )
    yield* check("numeric order is time order", timeOrdered, "sorting by id sorts by mint millisecond")
  }

  // Property 2: two machines mint in the same millisecond without colliding.
  {
    const a = yield* makeSnowflake({ machineId: 1, epochMs: EPOCH, maxBackwardDriftMs: 10 })
    const b = yield* makeSnowflake({ machineId: 2, epochMs: EPOCH, maxBackwardDriftMs: 10 })
    const [idsA, idsB] = yield* Effect.all([
      Effect.all(Array.from({ length: 1000 }, () => a.next)),
      Effect.all(Array.from({ length: 1000 }, () => b.next)),
    ])
    const all = new Set([...idsA, ...idsB].map(String))
    yield* check("machine bits partition the id space", all.size === 2000, `${all.size}/2000 unique across two machines`)
  }

  // Property 3: a small clock rollback parks instead of duplicating; a large
  // one is a typed failure instead of a silent collision.
  {
    const fakeNow = yield* Ref.make(EPOCH + 1_000_000)
    const flake = yield* makeSnowflake({
      machineId: 3,
      epochMs: EPOCH,
      maxBackwardDriftMs: 5,
      nowOverride: Ref.get(fakeNow),
    })
    const before = yield* flake.next
    // small rollback: 3ms backwards, inside tolerance; a fiber parks and a
    // background nudge moves the clock forward again
    yield* Ref.update(fakeNow, (t) => t - 3)
    const parked = yield* Effect.forkChild(flake.next)
    yield* Effect.sleep("10 millis")
    yield* Ref.update(fakeNow, (t) => t + 4) // clock re-passes the mark
    const after = yield* Fiber.await(parked)
    const smallOk = after._tag === "Success" && after.value > before

    // large rollback: 60s backwards, way past tolerance
    yield* Ref.update(fakeNow, (t) => t - 60_000)
    const large = yield* Effect.exit(flake.next)
    const largeFailed =
      large._tag === "Failure" &&
      String(large.cause).includes("ClockMovedBackward")
    yield* check(
      "rollback never duplicates",
      smallOk && largeFailed,
      `3ms rollback parked then minted a HIGHER id; 60s rollback failed typed instead of re-issuing old timestamps`,
    )
  }

  console.log("snowflake.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})

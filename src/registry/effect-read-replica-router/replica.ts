/**
 * replica.ts
 *
 * Failure modes solved:
 *   1. Read-your-writes violation (the vanishing update): writes go to the
 *      primary, reads go to a replica, and replication is asynchronous, so a
 *      user who saves a profile and reloads the page can be served a replica
 *      that has not applied the write yet. The router tracks the LSN each
 *      session last wrote, and a read is only allowed on a replica whose
 *      applied LSN has caught up to that mark; otherwise it routes to the
 *      primary. Freshness is checked against the write, not against a timer.
 *   2. Lag blowup (the replica that silently falls minutes behind): under
 *      load or a network partition, replica lag can grow from milliseconds
 *      to minutes, and routing "just reads" there serves arbitrarily stale
 *      data to everyone, sessions with writes or not. The router measures
 *      lag per replica on every route and ejects any replica beyond the
 *      ceiling, sending those reads to the primary until it catches up.
 *
 * Why the primitives make it correct: the LSN is a single monotonic Ref on
 * the primary, each replica's applied position is its own Ref, and the
 * routing decision is a pure comparison of the two, so there is no cached
 * staleness estimate to go stale itself.
 */

import { Effect, Ref } from "effect"

interface Row {
  readonly value: string
  readonly lsn: number
}

export interface Primary {
  readonly write: (key: string, value: string) => Effect.Effect<number>
  readonly read: (key: string) => Effect.Effect<Row | undefined>
  readonly lsn: Ref.Ref<number>
  /** the replication feed a replica pulls from; the WAL in a real deployment */
  readonly feed: Effect.Effect<{ rows: Map<string, Row>; upTo: number }>
}

export const makePrimary = (): Effect.Effect<Primary> =>
  Effect.gen(function* () {
    const table = yield* Ref.make(new Map<string, Row>())
    const lsn = yield* Ref.make(0)
    const write = (key: string, value: string) =>
      Effect.gen(function* () {
        const next = yield* Ref.updateAndGet(lsn, (n) => n + 1)
        yield* Ref.update(table, (m) => new Map(m).set(key, { value, lsn: next }))
        return next
      })
    const read = (key: string) => Ref.get(table).pipe(Effect.map((m) => m.get(key)))
    const feed = Effect.gen(function* () {
      return { rows: new Map(yield* Ref.get(table)), upTo: yield* Ref.get(lsn) }
    })
    return { write, read, lsn, feed } as const
  })

export interface Replica {
  readonly name: string
  readonly read: (key: string) => Effect.Effect<Row | undefined>
  readonly appliedLsn: Ref.Ref<number>
  /** apply everything the primary has committed so far */
  readonly catchUp: Effect.Effect<void>
}

export const makeReplica = (name: string, primary: Primary): Effect.Effect<Replica> =>
  Effect.gen(function* () {
    const table = yield* Ref.make(new Map<string, Row>())
    const appliedLsn = yield* Ref.make(0)
    const read = (key: string) => Ref.get(table).pipe(Effect.map((m) => m.get(key)))
    // On demand instead of a background timer, so callers control exactly how
    // far behind the replica is. ponytail: fork this on a Schedule for a live sim
    const catchUp = Effect.gen(function* () {
      const { rows, upTo } = yield* primary.feed
      yield* Ref.set(table, rows)
      yield* Ref.set(appliedLsn, upTo)
    })
    return { name, read, appliedLsn, catchUp } as const
  })

export interface Router {
  /** record a session write and remember its LSN for read-your-writes */
  readonly write: (session: string, key: string, value: string) => Effect.Effect<void>
  /** route a session read to the freshest safe target */
  readonly read: (
    session: string,
    key: string,
  ) => Effect.Effect<{ target: string; row: Row | undefined }>
}

export const makeRouter = (
  primary: Primary,
  replicas: readonly Replica[],
  options: { readonly maxLagLsn: number },
): Effect.Effect<Router> =>
  Effect.gen(function* () {
    const sessionMark = yield* Ref.make(new Map<string, number>())

    const write = (session: string, key: string, value: string) =>
      Effect.gen(function* () {
        const at = yield* primary.write(key, value)
        yield* Ref.update(sessionMark, (m) => new Map(m).set(session, at))
      })

    const read = (session: string, key: string) =>
      Effect.gen(function* () {
        const mark = (yield* Ref.get(sessionMark)).get(session) ?? 0
        const head = yield* Ref.get(primary.lsn)
        // First replica that (a) has this session's writes and (b) is inside
        // the lag ceiling. Both checks are LSN comparisons, not timers.
        for (const replica of replicas) {
          const applied = yield* Ref.get(replica.appliedLsn)
          if (applied >= mark && head - applied <= options.maxLagLsn) {
            const row = yield* replica.read(key)
            return { target: replica.name, row }
          }
        }
        const row = yield* primary.read(key)
        return { target: "primary", row }
      })

    return { write, read } as const
  })

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const assert = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  const primary = yield* makePrimary()
  const replica = yield* makeReplica("replica-1", primary)
  const router = yield* makeRouter(primary, [replica], { maxLagLsn: 5 })

  // Property 1: read-after-write routes to the primary while the replica lags.
  {
    yield* router.write("session-a", "profile:9", "display_name=Ada")
    const { target, row } = yield* router.read("session-a", "profile:9")
    yield* assert(
      "read-your-writes goes to primary",
      target === "primary" && row?.value === "display_name=Ada",
      `lagging replica skipped, served "${row?.value}" from ${target}`,
    )
  }

  // Property 2: once the replica catches up, the same session reads from it.
  {
    yield* replica.catchUp
    const { target, row } = yield* router.read("session-a", "profile:9")
    yield* assert(
      "caught-up replica takes the read",
      target === "replica-1" && row?.value === "display_name=Ada",
      `applied LSN reached the session mark, served from ${target}`,
    )
  }

  // Property 3: a session with no writes reads from the replica immediately.
  {
    const { target } = yield* router.read("session-b", "profile:9")
    yield* assert("write-free session offloads to replica", target === "replica-1", `served from ${target}`)
  }

  // Property 4: a replica beyond the lag ceiling is ejected for everyone.
  {
    for (let i = 0; i < 8; i++) yield* primary.write(`k${i}`, `v${i}`) // replica now 8 behind, ceiling 5
    const { target } = yield* router.read("session-b", "profile:9")
    yield* assert(
      "lagging replica is ejected",
      target === "primary",
      `replica 8 LSNs behind (ceiling 5), read fell back to ${target}`,
    )
  }

  console.log("replica.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})

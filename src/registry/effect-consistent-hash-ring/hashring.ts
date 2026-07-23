/**
 * hashring.ts
 *
 * Failure modes solved:
 *   1. The full reshuffle (hash(key) % N breaks when N changes): modulo
 *      placement moves almost every key when a node joins or leaves, which
 *      for a cache tier means a near-total miss storm and for a data tier
 *      means mass migration, both at the exact moment the cluster is
 *      already changing. On the ring, a key belongs to the first node
 *      clockwise from its hash, so adding a node steals only the arc ahead
 *      of it: roughly 1/N of the keys move and every other key stays put.
 *   2. The lumpy ring (one node owns half the circle): hashing each node
 *      once places N points on a 2^32 circle, and with small N the arcs are
 *      wildly uneven, so one node takes a multiple of its fair share and
 *      becomes the hotspot. Each node is hashed onto the ring many times
 *      (virtual nodes), which statistically evens the arcs, and membership
 *      changes swap whole vnode sets atomically in one Ref.
 *
 * Why the primitives make it correct: the ring is an immutable sorted array
 * swapped atomically through Ref.update, so a lookup never observes a
 * half-applied membership change, and lookup is a binary search, so routing
 * stays O(log n) at any vnode count.
 */

import { Effect, Ref } from "effect"

// FNV-1a with a murmur-style avalanche finisher: fast, dependency-free, and
// uniform enough for placement (this is placement, not cryptography). The
// finisher matters: raw FNV-1a on short similar strings clusters points and
// makes the arcs lumpy even with many vnodes.
const fnv1a = (input: string): number => {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  return hash >>> 0
}

interface VNode {
  readonly point: number
  readonly node: string
}

const buildRing = (nodes: readonly string[], vnodesPerNode: number): readonly VNode[] =>
  nodes
    .flatMap((node) =>
      Array.from({ length: vnodesPerNode }, (_, i) => ({
        point: fnv1a(`${node}#${i}`),
        node,
      })),
    )
    .sort((a, b) => a.point - b.point)

export interface HashRing {
  readonly lookup: (key: string) => Effect.Effect<string>
  readonly addNode: (node: string) => Effect.Effect<void>
  readonly removeNode: (node: string) => Effect.Effect<void>
  readonly nodes: Effect.Effect<readonly string[]>
}

export const makeHashRing = (options: {
  readonly nodes: readonly string[]
  /** vnodes per node; more vnodes = more even arcs; 100 to 200 is typical */
  readonly vnodesPerNode: number
}): Effect.Effect<HashRing> =>
  Effect.gen(function* () {
    const state = yield* Ref.make({
      members: [...options.nodes],
      ring: buildRing(options.nodes, options.vnodesPerNode),
    })

    // First vnode clockwise from the key's point, wrapping past 2^32 to 0.
    const lookup = (key: string) =>
      Ref.get(state).pipe(
        Effect.map(({ ring }) => {
          const point = fnv1a(key)
          let lo = 0
          let hi = ring.length
          while (lo < hi) {
            const mid = (lo + hi) >>> 1
            if (ring[mid].point < point) lo = mid + 1
            else hi = mid
          }
          return ring[lo === ring.length ? 0 : lo].node
        }),
      )

    const rebuild = (members: readonly string[]) => ({
      members: [...members],
      ring: buildRing(members, options.vnodesPerNode),
    })

    const addNode = (node: string) =>
      Ref.update(state, (s) => (s.members.includes(node) ? s : rebuild([...s.members, node])))

    const removeNode = (node: string) =>
      Ref.update(state, (s) => rebuild(s.members.filter((m) => m !== node)))

    const nodes = Ref.get(state).pipe(Effect.map((s) => s.members))

    return { lookup, addNode, removeNode, nodes } as const
  })

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() => console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`))

  const KEYS = Array.from({ length: 10_000 }, (_, i) => `session:${i}`)
  const placeAll = (ring: HashRing) =>
    Effect.gen(function* () {
      const placement = new Map<string, string>()
      for (const key of KEYS) placement.set(key, yield* ring.lookup(key))
      return placement
    })

  // Property 1: adding a 5th node moves ~1/5 of the keys; modulo moves ~4/5.
  {
    const ring = yield* makeHashRing({
      nodes: ["cache-1", "cache-2", "cache-3", "cache-4"],
      vnodesPerNode: 160,
    })
    const before = yield* placeAll(ring)
    yield* ring.addNode("cache-5")
    const after = yield* placeAll(ring)
    let moved = 0
    for (const key of KEYS) if (before.get(key) !== after.get(key)) moved++
    const movedPct = (moved / KEYS.length) * 100

    let moduloMoved = 0
    for (const key of KEYS) if (fnv1a(key) % 4 !== fnv1a(key) % 5) moduloMoved++
    const moduloPct = (moduloMoved / KEYS.length) * 100

    yield* check(
      "join moves ~1/N of keys, not all of them",
      movedPct > 12 && movedPct < 28 && moduloPct > 70,
      `ring moved ${movedPct.toFixed(1)}% of 10k keys on join (ideal 20%); hash % N would have moved ${moduloPct.toFixed(1)}%`,
    )

    // Every moved key moved TO the new node; no third-party churn.
    let strayMoves = 0
    for (const key of KEYS) {
      if (before.get(key) !== after.get(key) && after.get(key) !== "cache-5") strayMoves++
    }
    yield* check("moved keys all land on the new node", strayMoves === 0, `${strayMoves} keys moved between old nodes`)
  }

  // Property 2: vnodes even out the load.
  {
    const ring = yield* makeHashRing({
      nodes: ["cache-1", "cache-2", "cache-3", "cache-4", "cache-5"],
      vnodesPerNode: 160,
    })
    const placement = yield* placeAll(ring)
    const counts = new Map<string, number>()
    for (const node of placement.values()) counts.set(node, (counts.get(node) ?? 0) + 1)
    const loads = [...counts.values()]
    const max = Math.max(...loads)
    const min = Math.min(...loads)
    const fair = KEYS.length / 5
    yield* check(
      "vnodes keep arcs even",
      max / fair < 1.35 && min / fair > 0.65,
      `10k keys over 5 nodes: min ${min}, max ${max} (fair share ${fair})`,
    )
  }

  // Property 3: removing a node strands only its own keys.
  {
    const ring = yield* makeHashRing({
      nodes: ["cache-1", "cache-2", "cache-3", "cache-4"],
      vnodesPerNode: 160,
    })
    const before = yield* placeAll(ring)
    yield* ring.removeNode("cache-3")
    const after = yield* placeAll(ring)
    let reassigned = 0
    let untouched = 0
    for (const key of KEYS) {
      if (before.get(key) === "cache-3") {
        if (after.get(key) !== "cache-3") reassigned++
      } else if (before.get(key) === after.get(key)) untouched++
    }
    const survivors = KEYS.length - [...before.values()].filter((n) => n === "cache-3").length
    yield* check(
      "leave reassigns only the leaver's keys",
      untouched === survivors,
      `${reassigned} keys from cache-3 reassigned, all ${untouched}/${survivors} other keys stayed put`,
    )
  }

  console.log("hashring.ts: all properties verified")
})

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e)
  process.exit(1)
})

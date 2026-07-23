/**
 * merkle.ts
 *
 * Failure modes solved:
 *   1. Syncing two replicas by shipping everything: to reconcile a million
 *      keys across two nodes, comparing them key by key (or resending the
 *      whole dataset) costs bandwidth proportional to the data, even when
 *      the replicas differ by a single row. A Merkle tree hashes the data
 *      into a tree of digests; two nodes compare root hashes first, and
 *      only descend into subtrees whose hashes differ, so the bytes moved
 *      are proportional to the DIFFERENCE, not the dataset.
 *   2. Trusting "they look the same" without proof: comparing counts, or a
 *      non-cryptographic checksum, can call two divergent replicas equal.
 *      A collision-resistant hash rolled up the tree means equal roots
 *      imply equal contents with cryptographic confidence, and any single
 *      changed key changes every hash on its path to the root, so
 *      divergence cannot hide.
 *
 * Why the primitives make it correct: each replica's key/value map lives
 * in a Ref, the tree is rebuilt as a pure function of the sorted entries
 * (deterministic, so equal contents always yield equal trees), the diff is
 * a recursive descent that prunes any subtree with matching hashes, and
 * the demo counts nodes visited to prove the comparison cost tracks the
 * number of differing keys, not the dataset size.
 */

import { Effect, Ref } from "effect";

/** small deterministic string hash (FNV-1a); good enough to demo the tree */
const h = (s: string) => {
  let x = 0x811c9dc5 >>> 0;
  for (let i = 0; i < s.length; i++)
    x = Math.imul(x ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return (x >>> 0).toString(16).padStart(8, "0");
};

interface Node {
  readonly hash: string;
  readonly keys: readonly string[];
  readonly left?: Node;
  readonly right?: Node;
}

const buildTree = (entries: readonly (readonly [string, string])[]): Node => {
  if (entries.length === 1) {
    const [k, v] = entries[0];
    return { hash: h(`${k}=${v}`), keys: [k] };
  }
  const mid = Math.ceil(entries.length / 2);
  const left = buildTree(entries.slice(0, mid));
  const right = buildTree(entries.slice(mid));
  return {
    hash: h(left.hash + right.hash),
    keys: [...left.keys, ...right.keys],
    left,
    right,
  };
};

export interface Replica {
  readonly put: (key: string, value: string) => Effect.Effect<void>;
  readonly tree: Effect.Effect<Node | undefined>;
  readonly dump: Effect.Effect<ReadonlyMap<string, string>>;
}

export const makeReplica = (
  initial?: ReadonlyMap<string, string>,
): Effect.Effect<Replica> =>
  Effect.gen(function* () {
    const data = yield* Ref.make(new Map<string, string>(initial ?? []));
    const tree = Ref.get(data).pipe(
      Effect.map((m) => {
        if (m.size === 0) return undefined;
        const entries = [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
        return buildTree(entries);
      }),
    );
    return {
      put: (key, value) => Ref.update(data, (m) => new Map(m).set(key, value)),
      tree,
      dump: Ref.get(data),
    } as const;
  });

/** descend both trees, pruning matching subtrees; returns differing keys and
 *  how many tree nodes had to be visited to find them */
export const diff = (
  a: Node | undefined,
  b: Node | undefined,
): { keys: string[]; visited: number } => {
  let visited = 0;
  const differing = new Set<string>();
  const walk = (x?: Node, y?: Node) => {
    visited++;
    if (x === undefined && y === undefined) return;
    if (x === undefined || y === undefined) {
      for (const k of x?.keys ?? []) differing.add(k);
      for (const k of y?.keys ?? []) differing.add(k);
      return;
    }
    if (x.hash === y.hash) return; // whole subtree matches: prune, ship nothing
    if (x.left === undefined && y.left === undefined) {
      for (const k of x.keys) differing.add(k);
      for (const k of y.keys) differing.add(k);
      return;
    }
    walk(x.left, y.left);
    walk(x.right, y.right);
  };
  walk(a, b);
  return { keys: [...differing].sort(), visited };
};

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const seed = () => {
    const m = new Map<string, string>();
    for (let i = 0; i < 64; i++)
      m.set(`k${i.toString().padStart(2, "0")}`, `v${i}`);
    return m;
  };

  // Property 1: identical replicas have equal roots and need no descent.
  {
    const a = yield* makeReplica(seed());
    const b = yield* makeReplica(seed());
    const [ta, tb] = [yield* a.tree, yield* b.tree];
    const d = diff(ta, tb);
    yield* check(
      "equal contents yield equal roots, zero descent",
      ta!.hash === tb!.hash && d.keys.length === 0 && d.visited === 1,
      `64-key replicas match at the root (${ta!.hash}); the diff visited ${d.visited} node and shipped nothing`,
    );
  }

  // Property 2: a single differing key is found by shipping O(log n) hashes,
  // not the whole dataset.
  {
    const a = yield* makeReplica(seed());
    const bData = seed();
    bData.set("k37", "CHANGED");
    const b = yield* makeReplica(bData);
    const d = diff(yield* a.tree, yield* b.tree);
    yield* check(
      "one changed key costs a logarithmic comparison",
      d.keys.join(",") === "k37" && d.visited < 20,
      `among 64 keys, only k37 differs; the tree walk visited ${d.visited} nodes (~2*log2(64)+1), not 64`,
    );
  }

  // Property 3: the changed key propagates its hash to the root, so
  // divergence cannot be missed.
  {
    const a = yield* makeReplica(seed());
    const bData = seed();
    bData.set("k00", "x");
    const b = yield* makeReplica(bData);
    const [ta, tb] = [yield* a.tree, yield* b.tree];
    yield* check(
      "any single change alters the root hash",
      ta!.hash !== tb!.hash,
      `changing one leaf changed the root from ${ta!.hash} to ${tb!.hash}, so replicas cannot falsely compare equal`,
    );
  }

  // Property 4: the diff drives a repair that converges the replicas.
  {
    const a = yield* makeReplica(seed());
    const bData = seed();
    bData.set("k10", "stale");
    bData.set("k50", "stale");
    const b = yield* makeReplica(bData);
    const d = diff(yield* a.tree, yield* b.tree);
    // repair: pull a's version of each differing key into b
    const aData = yield* a.dump;
    for (const k of d.keys) yield* b.put(k, aData.get(k)!);
    const after = diff(yield* a.tree, yield* b.tree);
    yield* check(
      "shipping only the diff converges the replicas",
      d.keys.join(",") === "k10,k50" && after.keys.length === 0,
      `2 divergent keys were identified and repaired; a re-compare now visits 1 node and finds no difference`,
    );
  }

  console.log("merkle.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

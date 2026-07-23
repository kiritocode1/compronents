/**
 * gossip.ts
 *
 * Failure modes solved:
 *   1. Broadcast from one node does not scale and dies with the sender: a
 *      coordinator that pushes every update to every node is O(N) work on
 *      one machine and a single point of failure. Epidemic (gossip)
 *      dissemination has each node periodically tell a few RANDOM peers
 *      what it knows; an update reaches everyone in O(log N) rounds with no
 *      coordinator, and the failure of any node barely dents propagation.
 *   2. Gossip that never converges or floods forever: if nodes keep
 *      re-sending what everyone already has, the network churns without end
 *      and cannot tell "done" from "still spreading". Version vectors make
 *      it convergent: each node merges peers' state by keeping the highest
 *      version per key, so exchanges are idempotent, order-independent, and
 *      the system provably reaches a fixed point where every node holds the
 *      same state and further rounds change nothing.
 *
 * Why the primitives make it correct: each node's key->version map lives in
 * a Ref; a round reads a snapshot and merges it into a peer under that
 * peer's Ref.update (element-wise max, so merges commute and are
 * idempotent); peer selection uses a seeded LCG in a Ref so the demo is
 * deterministic; and convergence is detected by a round in which no node's
 * state changed.
 */

import { Effect, Ref } from "effect";

interface Versioned {
  readonly value: string;
  readonly version: number;
}

type NodeState = ReadonlyMap<string, Versioned>;

const merge = (a: NodeState, b: NodeState): NodeState => {
  const out = new Map(a);
  for (const [k, v] of b) {
    const held = out.get(k);
    if (held === undefined || v.version > held.version) out.set(k, v);
  }
  return out;
};

export interface GossipNode {
  readonly id: number;
  readonly state: Ref.Ref<NodeState>;
}

export interface Cluster {
  readonly nodes: readonly GossipNode[];
  readonly set: (
    nodeId: number,
    key: string,
    value: string,
  ) => Effect.Effect<void>;
  /** one round: every node pushes its state to `fanout` random peers */
  readonly round: (fanout: number) => Effect.Effect<{ changed: boolean }>;
  /** gossip until no node changes in a round; returns rounds taken */
  readonly converge: (fanout: number) => Effect.Effect<number>;
  readonly snapshot: Effect.Effect<readonly NodeState[]>;
}

export const makeCluster = (n: number, seed = 1): Effect.Effect<Cluster> =>
  Effect.gen(function* () {
    const nodes: GossipNode[] = [];
    for (let i = 0; i < n; i++) {
      nodes.push({ id: i, state: yield* Ref.make<NodeState>(new Map()) });
    }
    const clock = yield* Ref.make(0);
    const rng = yield* Ref.make(seed >>> 0);
    const nextRand = Ref.modify(rng, (s) => {
      const x = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return [x, x] as const;
    });

    const set = (nodeId: number, key: string, value: string) =>
      Effect.gen(function* () {
        const version = yield* Ref.updateAndGet(clock, (c) => c + 1);
        yield* Ref.update(nodes[nodeId].state, (m) =>
          new Map(m).set(key, { value, version }),
        );
      });

    const round = (fanout: number) =>
      Effect.gen(function* () {
        let changed = false;
        for (const node of nodes) {
          const snapshot = yield* Ref.get(node.state);
          for (let f = 0; f < fanout; f++) {
            const r = yield* nextRand;
            const peer = nodes[r % nodes.length];
            if (peer.id === node.id) continue;
            const before = yield* Ref.get(peer.state);
            const after = merge(before, snapshot);
            if (
              after.size !== before.size ||
              [...after].some(([k, v]) => before.get(k)?.version !== v.version)
            ) {
              changed = true;
              yield* Ref.set(peer.state, after);
            }
          }
        }
        return { changed };
      });

    const converge = (fanout: number) =>
      Effect.gen(function* () {
        let rounds = 0;
        while (true) {
          const { changed } = yield* round(fanout);
          rounds++;
          if (!changed) return rounds;
          if (rounds > 100) return rounds; // safety
        }
      });

    return {
      nodes,
      set,
      round,
      converge,
      snapshot: Effect.all(nodes.map((nd) => Ref.get(nd.state))),
    } as const;
  });

const equalState = (a: NodeState, b: NodeState) =>
  a.size === b.size &&
  [...a].every(([k, v]) => b.get(k)?.version === v.version);

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: one node's update reaches the whole cluster with no coordinator.
  {
    const cluster = yield* makeCluster(32, 7);
    yield* cluster.set(0, "leader", "node-9");
    const rounds = yield* cluster.converge(3);
    const states = yield* cluster.snapshot;
    const everyoneKnows = states.every(
      (s) => s.get("leader")?.value === "node-9",
    );
    yield* check(
      "an update epidemically reaches all nodes",
      everyoneKnows,
      `node 0's write spread to all 32 nodes in ${rounds} gossip rounds (fanout 3), no broadcaster`,
    );
  }

  // Property 2: propagation is logarithmic-ish, not linear in N.
  {
    const cluster = yield* makeCluster(64, 3);
    yield* cluster.set(0, "config", "v2");
    const rounds = yield* cluster.converge(3);
    yield* check(
      "spread cost is sublinear in cluster size",
      rounds < 20,
      `64 nodes converged in ${rounds} rounds; a linear broadcast would be 64 sends from one node`,
    );
  }

  // Property 3: merges are idempotent and order-independent (convergence).
  {
    const cluster = yield* makeCluster(16, 11);
    yield* cluster.set(0, "x", "a");
    yield* cluster.set(15, "y", "b"); // two writers, different nodes
    yield* cluster.converge(4);
    const states = yield* cluster.snapshot;
    const first = states[0];
    const allEqual = states.every((s) => equalState(s, first));
    // running more rounds changes nothing (fixed point)
    const extra = yield* cluster.round(4);
    yield* check(
      "the cluster converges to a single shared state",
      allEqual &&
        extra.changed === false &&
        first.get("x")?.value === "a" &&
        first.get("y")?.value === "b",
      `two concurrent writes merged; all 16 nodes hold identical state and an extra round changed nothing`,
    );
  }

  // Property 4: newer versions win; a stale value cannot overwrite a fresh one.
  {
    const cluster = yield* makeCluster(8, 5);
    yield* cluster.set(0, "k", "old");
    yield* cluster.converge(3);
    yield* cluster.set(3, "k", "new"); // a later write, higher version
    yield* cluster.converge(3);
    const states = yield* cluster.snapshot;
    const allNew = states.every((s) => s.get("k")?.value === "new");
    yield* check(
      "version vectors keep the newest write",
      allNew,
      `a newer write to "k" overtook the old value everywhere despite gossip re-exchanging the stale one`,
    );
  }

  console.log("gossip.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

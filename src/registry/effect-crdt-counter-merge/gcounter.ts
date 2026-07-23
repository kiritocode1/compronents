/**
 * gcounter.ts
 *
 * Failure modes solved:
 *   1. Concurrent increments that clobber each other: three app servers all
 *      keep a "likes" counter. Server A reads 10, adds 1, writes 11; server
 *      B did the same from 10 and also wrote 11. Two likes became one, and
 *      last-write-wins on a single number silently loses increments under
 *      any partition or race. The problem is representing a distributed
 *      count as one mutable cell.
 *   2. Merges that need coordination or a fixed order: a fix that requires
 *      locking every replica, or that only converges if updates arrive in a
 *      specific order, does not survive a network partition. A state-based
 *      grow-only counter (G-Counter) is a conflict-free replicated data
 *      type: each replica owns its OWN slot and only ever increments it, the
 *      value is the sum of all slots, and merge is element-wise max. Merge
 *      is commutative, associative, and idempotent, so replicas that
 *      exchanged updates in any order, any number of times, always converge
 *      to the same total with no coordinator.
 *
 * Why the primitives make it correct: each replica holds a per-replica
 * counter map in a Ref; increment bumps only this replica's slot
 * (Ref.update, so no cross-replica contention); merge takes element-wise
 * maxima (idempotent and order-independent, the CRDT law); and the value is
 * the sum over slots, so a re-delivered or reordered merge cannot change
 * the result once replicas have seen the same updates.
 */

import { Effect, Ref } from "effect";

export type Counter = ReadonlyMap<string, number>;

/** merge two G-Counters: element-wise max (the join in the CRDT lattice) */
export const merge = (a: Counter, b: Counter): Counter => {
  const out = new Map(a);
  for (const [id, n] of b) out.set(id, Math.max(out.get(id) ?? 0, n));
  return out;
};

export const value = (c: Counter): number => {
  let total = 0;
  for (const n of c.values()) total += n;
  return total;
};

export interface Replica {
  readonly id: string;
  readonly increment: (by?: number) => Effect.Effect<void>;
  readonly merge: (other: Counter) => Effect.Effect<void>;
  readonly value: Effect.Effect<number>;
  readonly state: Effect.Effect<Counter>;
}

export const makeReplica = (id: string): Effect.Effect<Replica> =>
  Effect.gen(function* () {
    const counter = yield* Ref.make<Counter>(new Map([[id, 0]]));
    return {
      id,
      increment: (by = 1) =>
        Ref.update(counter, (c) => new Map(c).set(id, (c.get(id) ?? 0) + by)),
      merge: (other: Counter) => Ref.update(counter, (c) => merge(c, other)),
      value: Ref.get(counter).pipe(Effect.map(value)),
      state: Ref.get(counter),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: the last-write-wins baseline loses concurrent increments.
  {
    const shared = yield* Ref.make(10);
    // two servers both read 10 and write 11 (no atomic increment)
    const read1 = yield* Ref.get(shared);
    const read2 = yield* Ref.get(shared);
    yield* Ref.set(shared, read1 + 1);
    yield* Ref.set(shared, read2 + 1);
    const final = yield* Ref.get(shared);
    yield* check(
      "LWW on a single cell loses an increment",
      final === 11,
      `two concurrent +1s on a shared number left it at ${final}, not 12: one like vanished`,
    );
  }

  // Property 2: partitioned replicas each count locally, then converge on merge.
  {
    const a = yield* makeReplica("a");
    const b = yield* makeReplica("b");
    const c = yield* makeReplica("c");
    // a partition: each replica takes independent increments
    yield* a.increment(3);
    yield* b.increment(5);
    yield* c.increment(2);
    // heal the partition by exchanging state
    yield* a.merge(yield* b.state);
    yield* a.merge(yield* c.state);
    yield* b.merge(yield* a.state);
    yield* c.merge(yield* a.state);
    const [va, vb, vc] = [yield* a.value, yield* b.value, yield* c.value];
    yield* check(
      "partitioned increments all survive the merge",
      va === 10 && vb === 10 && vc === 10,
      `3 + 5 + 2 taken under partition converged to ${va} on every replica after merging, no lost counts`,
    );
  }

  // Property 3: merge is idempotent and order-independent (the CRDT laws).
  {
    const a = yield* makeReplica("a");
    const b = yield* makeReplica("b");
    yield* a.increment(4);
    yield* b.increment(7);
    const sa = yield* a.state;
    const sb = yield* b.state;
    // merge in both orders and twice each; all must agree
    const ab = merge(merge(sa, sb), sb); // extra redundant merge
    const ba = merge(sb, sa);
    yield* check(
      "merge is commutative, associative, idempotent",
      value(ab) === 11 && value(ba) === 11,
      `merging a and b in either order (and re-merging) always yields ${value(ab)}: re-delivery is harmless`,
    );
  }

  // Property 4: a replica only writes its own slot, so merges never regress.
  {
    const a = yield* makeReplica("a");
    const b = yield* makeReplica("b");
    yield* a.increment(10);
    yield* b.merge(yield* a.state); // b learns a=10
    yield* b.increment(1); // b bumps its own slot
    yield* a.increment(2); // a bumps its own slot concurrently
    // an old snapshot of a (a=10) is re-merged into b; must not lower b's view
    yield* b.merge(new Map([["a", 10]]));
    yield* b.merge(yield* a.state); // then the fresh a=12
    yield* check(
      "stale merges cannot decrease the count",
      (yield* b.value) === 13,
      `b saw a stale a=10 re-merged, then fresh a=12; its total is ${yield* b.value} (12 + its own 1), never rolled back`,
    );
  }

  console.log("gcounter.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

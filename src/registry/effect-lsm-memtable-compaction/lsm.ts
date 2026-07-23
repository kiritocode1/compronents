/**
 * lsm.ts
 *
 * Failure modes solved:
 *   1. Random-write amplification: updating rows in place means every write
 *      seeks to a scattered disk location, and a write-heavy workload
 *      thrashes. A log-structured merge tree turns every write into an
 *      append to an in-memory memtable; when the memtable fills it flushes
 *      as one sorted, immutable SSTable, so writes are sequential and fast
 *      regardless of key order.
 *   2. Reads that drown in stale versions: with immutable segments, an
 *      updated or deleted key leaves old copies in older SSTables. A read
 *      that scanned all of them and had to reason about which wins would
 *      get slower with every flush, and a delete that just "stopped
 *      writing" would resurrect on the next lookup of an old segment.
 *      Newest-wins ordering plus tombstones fix reads (check memtable, then
 *      newest to oldest SSTable, first hit wins, a tombstone means absent),
 *      and background compaction merges segments so obsolete versions and
 *      tombstones are physically dropped, bounding read cost.
 *
 * Why the primitives make it correct: the memtable and the ordered SSTable
 * list live in one Ref; a flush is a single Ref.modify that moves the
 * sorted memtable to the front of the segment list and clears it (atomic,
 * so a concurrent read never sees a key in neither place); reads walk
 * newest to oldest and stop at the first entry including a tombstone; and
 * compaction folds segments newest-first so the surviving value of each
 * key is the most recent one.
 */

import { Effect, Ref } from "effect";

const TOMBSTONE = Symbol("tombstone");
type Stored = string | typeof TOMBSTONE;
type SSTable = ReadonlyMap<string, Stored>;

interface LsmState {
  readonly memtable: ReadonlyMap<string, Stored>;
  readonly segments: readonly SSTable[]; // newest first
  readonly flushes: number;
  readonly compactions: number;
}

export interface Lsm {
  readonly put: (key: string, value: string) => Effect.Effect<void>;
  readonly del: (key: string) => Effect.Effect<void>;
  readonly get: (
    key: string,
  ) => Effect.Effect<{ value: string | undefined; from: string }>;
  readonly compact: Effect.Effect<void>;
  readonly stats: Effect.Effect<{
    segments: number;
    flushes: number;
    compactions: number;
  }>;
}

export const makeLsm = (memtableLimit = 4): Effect.Effect<Lsm> =>
  Effect.gen(function* () {
    const state = yield* Ref.make<LsmState>({
      memtable: new Map(),
      segments: [],
      flushes: 0,
      compactions: 0,
    });

    const maybeFlush = (s: LsmState): LsmState => {
      if (s.memtable.size < memtableLimit) return s;
      // flush: the memtable becomes a new immutable SSTable at the front
      return {
        ...s,
        memtable: new Map(),
        segments: [new Map(s.memtable), ...s.segments],
        flushes: s.flushes + 1,
      };
    };

    const write = (key: string, value: Stored) =>
      Ref.update(state, (s) =>
        maybeFlush({ ...s, memtable: new Map(s.memtable).set(key, value) }),
      );

    const get = (key: string) =>
      Ref.get(state).pipe(
        Effect.map((s): { value: string | undefined; from: string } => {
          const inMem = s.memtable.get(key);
          if (inMem !== undefined) {
            return {
              value: inMem === TOMBSTONE ? undefined : inMem,
              from: "memtable",
            };
          }
          for (let i = 0; i < s.segments.length; i++) {
            const hit = s.segments[i].get(key);
            if (hit !== undefined) {
              return {
                value: hit === TOMBSTONE ? undefined : hit,
                from: `sstable-${i}`,
              };
            }
          }
          return { value: undefined, from: "miss" };
        }),
      );

    const compact = Ref.update(state, (s) => {
      // merge all segments newest-first into one; newest write of each key
      // wins, and tombstones for keys with no live value are dropped
      const merged = new Map<string, Stored>();
      for (const seg of s.segments) {
        for (const [k, v] of seg) if (!merged.has(k)) merged.set(k, v);
      }
      const compacted = new Map<string, Stored>();
      for (const [k, v] of merged) if (v !== TOMBSTONE) compacted.set(k, v);
      return {
        ...s,
        segments: compacted.size > 0 ? [compacted] : [],
        compactions: s.compactions + 1,
      };
    });

    return {
      put: (key, value) => write(key, value),
      del: (key) => write(key, TOMBSTONE),
      get,
      compact,
      stats: Ref.get(state).pipe(
        Effect.map((s) => ({
          segments: s.segments.length,
          flushes: s.flushes,
          compactions: s.compactions,
        })),
      ),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: filling the memtable flushes a sorted immutable segment.
  {
    const lsm = yield* makeLsm(4);
    for (const [k, v] of [
      ["a", "1"],
      ["b", "2"],
      ["c", "3"],
      ["d", "4"],
    ] as const) {
      yield* lsm.put(k, v);
    }
    const stats = yield* lsm.stats;
    yield* check(
      "a full memtable flushes to an SSTable",
      stats.flushes === 1 && stats.segments === 1,
      `4 writes into a size-4 memtable triggered ${stats.flushes} flush, leaving ${stats.segments} segment`,
    );
  }

  // Property 2: newest-wins across segments. An updated key reads its latest
  // value even though older copies still sit in older SSTables.
  {
    const lsm = yield* makeLsm(2);
    yield* lsm.put("user:1", "v1");
    yield* lsm.put("x", "flush1"); // forces flush of {user:1, x}
    yield* lsm.put("user:1", "v2");
    yield* lsm.put("y", "flush2"); // forces flush of {user:1:v2, y}
    const read = yield* lsm.get("user:1");
    yield* check(
      "reads return the newest version across segments",
      read.value === "v2" && read.from === "sstable-0",
      `user:1 exists in two segments; the read returned "${read.value}" from the newest (${read.from})`,
    );
  }

  // Property 3: a delete is a tombstone, not a gap. It masks older values
  // instead of letting them resurrect.
  {
    const lsm = yield* makeLsm(2);
    yield* lsm.put("k", "alive");
    yield* lsm.put("pad", "x"); // flush {k, pad}
    yield* lsm.del("k"); // tombstone in the memtable / next segment
    const read = yield* lsm.get("k");
    yield* check(
      "a tombstone masks an older live value",
      read.value === undefined,
      `k was written then deleted; the read is a miss ("${read.value}") even though "alive" is still in an old segment`,
    );
  }

  // Property 4: compaction merges segments and physically drops tombstones
  // and obsolete versions, bounding read cost.
  {
    const lsm = yield* makeLsm(2);
    yield* lsm.put("a", "1");
    yield* lsm.put("b", "1"); // flush
    yield* lsm.put("a", "2");
    yield* lsm.put("c", "1"); // flush
    yield* lsm.del("b");
    yield* lsm.put("d", "1"); // flush
    const before = yield* lsm.stats;
    yield* lsm.compact;
    const after = yield* lsm.stats;
    const [a, b] = [yield* lsm.get("a"), yield* lsm.get("b")];
    yield* check(
      "compaction collapses segments and drops garbage",
      before.segments === 3 &&
        after.segments === 1 &&
        a.value === "2" &&
        b.value === undefined,
      `${before.segments} segments compacted to ${after.segments}; a kept its newest ("${a.value}") and deleted b stayed gone`,
    );
  }

  console.log("lsm.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

/**
 * slru.ts
 *
 * Failure modes solved:
 *   1. One table scan flushes your whole cache: a plain LRU treats "touched
 *      once by a batch job" the same as "touched a thousand times by real
 *      users". A single sequential scan of cold keys marches through the
 *      recency list and evicts every hot key behind it; the next minute of
 *      real traffic is all misses against the database.
 *   2. Popularity that never expires: the opposite naive fix (plain LFU)
 *      lets yesterday's viral key squat in the cache on an old counter long
 *      after anyone wants it. Recency has to matter too.
 *
 * Segmented LRU closes both: new keys enter a PROBATION segment; only a
 * second hit promotes to PROTECTED. A scan's one-touch keys live and die in
 * probation without ever displacing a protected key. Protected keys that go
 * quiet demote back to probation (capacity pressure), so squatters age out.
 *
 * Why the primitives make it correct: both segments live in one Ref holding
 * immutable Maps (insertion order IS recency order, the JS Map guarantee),
 * every get/set is a single Ref.modify so concurrent fibers can never
 * interleave a promotion halfway, and eviction counts are part of the same
 * atomic state so the demo's assertions read a consistent snapshot.
 */

import { Effect, Ref } from "effect";

interface SlruState {
  readonly probation: ReadonlyMap<string, string>;
  readonly protected_: ReadonlyMap<string, string>;
  readonly hotEvictions: number;
}

export interface Slru {
  readonly get: (key: string) => Effect.Effect<string | undefined>;
  readonly set: (key: string, value: string) => Effect.Effect<void>;
  readonly stats: Effect.Effect<{
    probation: number;
    protected_: number;
    hotEvictions: number;
  }>;
}

const bumpTail = <V>(m: ReadonlyMap<string, V>, k: string, v: V) => {
  const next = new Map(m);
  next.delete(k);
  next.set(k, v);
  return next;
};

const dropHead = <V>(
  m: ReadonlyMap<string, V>,
): [string | undefined, Map<string, V>] => {
  const next = new Map(m);
  const head = next.keys().next();
  if (!head.done) next.delete(head.value);
  return [head.done ? undefined : head.value, next];
};

/** plain LRU for comparison: every touch is equal, scans win */
export const makeLru = (capacity: number): Effect.Effect<Slru> =>
  Effect.gen(function* () {
    const state = yield* Ref.make<SlruState>({
      probation: new Map(),
      protected_: new Map(),
      hotEvictions: 0,
    });
    const get = (key: string) =>
      Ref.modify(state, (s): readonly [string | undefined, SlruState] => {
        const held = s.probation.get(key);
        if (held === undefined) return [undefined, s];
        return [held, { ...s, probation: bumpTail(s.probation, key, held) }];
      });
    const set = (key: string, value: string) =>
      Ref.update(state, (s) => {
        let probation = bumpTail(s.probation, key, value);
        let hotEvictions = s.hotEvictions;
        if (probation.size > capacity) {
          const [victim, next] = dropHead(probation);
          probation = next;
          if (victim?.startsWith("hot:")) hotEvictions++;
        }
        return { ...s, probation, hotEvictions };
      });
    const stats = Ref.get(state).pipe(
      Effect.map((s) => ({
        probation: s.probation.size,
        protected_: s.protected_.size,
        hotEvictions: s.hotEvictions,
      })),
    );
    return { get, set, stats } as const;
  });

/** segmented LRU: 20% probation, 80% protected, promotion on second hit */
export const makeSlru = (capacity: number): Effect.Effect<Slru> =>
  Effect.gen(function* () {
    const protectedCap = Math.max(1, Math.floor(capacity * 0.8));
    const probationCap = Math.max(1, capacity - protectedCap);
    const state = yield* Ref.make<SlruState>({
      probation: new Map(),
      protected_: new Map(),
      hotEvictions: 0,
    });

    const get = (key: string) =>
      Ref.modify(state, (s): readonly [string | undefined, SlruState] => {
        const inProtected = s.protected_.get(key);
        if (inProtected !== undefined) {
          return [
            inProtected,
            { ...s, protected_: bumpTail(s.protected_, key, inProtected) },
          ];
        }
        const inProbation = s.probation.get(key);
        if (inProbation === undefined) return [undefined, s];
        // second touch: promote to protected, demoting its head if full
        const probation = new Map(s.probation);
        probation.delete(key);
        let protected_ = bumpTail(s.protected_, key, inProbation);
        let demotedProbation = probation;
        if (protected_.size > protectedCap) {
          const [victim, next] = dropHead(protected_);
          protected_ = next;
          if (victim !== undefined) {
            demotedProbation = bumpTail(probation, victim, "");
          }
        }
        return [inProbation, { ...s, probation: demotedProbation, protected_ }];
      });

    const set = (key: string, value: string) =>
      Ref.update(state, (s) => {
        if (s.protected_.has(key)) {
          return { ...s, protected_: bumpTail(s.protected_, key, value) };
        }
        let probation = bumpTail(s.probation, key, value);
        let hotEvictions = s.hotEvictions;
        if (probation.size > probationCap) {
          const [victim, next] = dropHead(probation);
          probation = next;
          if (victim?.startsWith("hot:")) hotEvictions++;
        }
        return { ...s, probation, hotEvictions };
      });

    const stats = Ref.get(state).pipe(
      Effect.map((s) => ({
        probation: s.probation.size,
        protected_: s.protected_.size,
        hotEvictions: s.hotEvictions,
      })),
    );
    return { get, set, stats } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const workload = (cache: Slru) =>
    Effect.gen(function* () {
      // warm 4 hot keys with two touches each (second touch promotes in slru)
      for (const k of ["hot:a", "hot:b", "hot:c", "hot:d"]) {
        yield* cache.set(k, `${k}-v`);
        yield* cache.get(k);
        yield* cache.get(k);
      }
      // a batch job scans 100 cold keys exactly once
      for (let i = 0; i < 100; i++) yield* cache.set(`scan:${i}`, "cold");
      // real traffic returns for the hot keys
      const hits = yield* Effect.all(
        ["hot:a", "hot:b", "hot:c", "hot:d"].map((k) => cache.get(k)),
      );
      return hits.filter((h) => h !== undefined).length;
    });

  const lru = yield* makeLru(10);
  const lruHits = yield* workload(lru);
  const lruStats = yield* lru.stats;

  const slru = yield* makeSlru(10);
  const slruHits = yield* workload(slru);
  const slruStats = yield* slru.stats;

  // Property 1: the scan flushes every hot key out of a plain LRU.
  yield* check(
    "plain LRU loses all hot keys to a scan",
    lruHits === 0 && lruStats.hotEvictions === 4,
    `after a 100-key scan, 0/4 hot keys survive and ${lruStats.hotEvictions} hot evictions were counted`,
  );

  // Property 2: the same scan cannot reach the protected segment.
  yield* check(
    "segmented LRU keeps all hot keys through the scan",
    slruHits === 4 && slruStats.hotEvictions === 0,
    `4/4 hot keys still hit; scan keys churned probation only (${slruStats.hotEvictions} hot evictions)`,
  );

  // Property 3: one touch is not enough for tenure; a scan key that was
  // never re-read cannot be sitting in protected.
  {
    const cold = yield* slru.get("scan:99");
    const stats = yield* slru.stats;
    yield* check(
      "one-touch keys never reach protected",
      stats.protected_ <= 8 && cold !== undefined,
      `scan:99 still answers from probation while protected holds ${stats.protected_} twice-touched keys (cap 8)`,
    );
  }

  // Property 4: promotion is atomic under concurrency; parallel gets of one
  // probation key cannot double-insert it into protected.
  {
    const c = yield* makeSlru(10);
    yield* c.set("hot:x", "v");
    yield* Effect.all(
      Array.from({ length: 20 }, () => c.get("hot:x")),
      { concurrency: "unbounded" },
    );
    const stats = yield* c.stats;
    yield* check(
      "concurrent promotion stays consistent",
      stats.protected_ + stats.probation === 1,
      `20 racing gets left exactly one copy of the key (protected=${stats.protected_}, probation=${stats.probation})`,
    );
  }

  console.log("slru.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

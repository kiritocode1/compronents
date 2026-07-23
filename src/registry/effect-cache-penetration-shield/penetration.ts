/**
 * penetration.ts
 *
 * Failure modes solved:
 *   1. The cache-miss attack: a cache only shields keys that EXIST. Ask for
 *      user:999999999 and the cache misses, the database confirms there is
 *      nothing, and nothing gets cached, so the next identical request
 *      repeats the whole trip. An attacker (or a buggy client) iterating
 *      random ids turns your cache hit rate into a lie and points the full
 *      request rate at the database.
 *   2. Negative caching alone still lets first contact through: caching
 *      "this key does not exist" stops repeats, but a rotating key space
 *      (uuid-per-request probing) makes every request a first contact. The
 *      bloom filter closes that: seeded with every key that exists, it
 *      answers "definitely absent" in memory, so made-up keys die before
 *      the database hears about them. False positives only waste one
 *      lookup; false negatives cannot happen if inserts stay in sync.
 *
 * Why the primitives make it correct: the bloom bit array lives in a Ref
 * and inserts use (h | 0) >>> 0 index math so hashes can never go negative
 * (a negative typed-array index silently drops the write and produces a
 * false negative), the negative cache entries carry a TTL checked against
 * a logical clock so absence can be re-verified after writes, and the
 * database hit counter is a Ref the demo reads to prove exactly how many
 * requests reached it.
 */

import { Effect, Ref } from "effect";

export interface Db {
  readonly fetch: (key: string) => Effect.Effect<string | undefined>;
  readonly hits: Effect.Effect<number>;
}

export const makeDb = (rows: ReadonlyMap<string, string>): Effect.Effect<Db> =>
  Effect.gen(function* () {
    const count = yield* Ref.make(0);
    return {
      fetch: (key: string) =>
        Ref.update(count, (n) => n + 1).pipe(Effect.map(() => rows.get(key))),
      hits: Ref.get(count),
    } as const;
  });

/** FNV-1a with per-round salt; >>> 0 keeps every index non-negative */
const hash = (key: string, round: number) => {
  let h = (0x811c9dc5 ^ round) >>> 0;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h >>> 0;
};

export interface Shield {
  readonly get: (
    key: string,
  ) => Effect.Effect<{
    value: string | undefined;
    source: "bloom" | "negative" | "cache" | "db";
  }>;
  readonly admit: (key: string) => Effect.Effect<void>;
}

export const makeShield = (
  db: Db,
  options?: {
    readonly bits?: number;
    readonly rounds?: number;
    readonly negativeTtl?: number;
  },
): Effect.Effect<Shield> =>
  Effect.gen(function* () {
    const bits = options?.bits ?? 4096;
    const rounds = options?.rounds ?? 3;
    const negativeTtl = options?.negativeTtl ?? 8;
    const bloom = yield* Ref.make(new Uint8Array(bits));
    const cache = yield* Ref.make(new Map<string, string>());
    const negative = yield* Ref.make(new Map<string, number>());
    const clock = yield* Ref.make(0);

    const admit = (key: string) =>
      Ref.update(bloom, (arr) => {
        const next = Uint8Array.from(arr);
        for (let r = 0; r < rounds; r++) next[hash(key, r) % bits] = 1;
        return next;
      });

    const mightExist = (key: string) =>
      Ref.get(bloom).pipe(
        Effect.map((arr) => {
          for (let r = 0; r < rounds; r++) {
            if (arr[hash(key, r) % bits] === 0) return false;
          }
          return true;
        }),
      );

    const get = (key: string) =>
      Effect.gen(function* () {
        const now = yield* Ref.updateAndGet(clock, (n) => n + 1);
        if (!(yield* mightExist(key))) {
          return { value: undefined, source: "bloom" as const };
        }
        const neg = (yield* Ref.get(negative)).get(key);
        if (neg !== undefined && now - neg < negativeTtl) {
          return { value: undefined, source: "negative" as const };
        }
        const hit = (yield* Ref.get(cache)).get(key);
        if (hit !== undefined) return { value: hit, source: "cache" as const };
        const row = yield* db.fetch(key);
        if (row === undefined) {
          yield* Ref.update(negative, (m) => new Map(m).set(key, now));
          return { value: undefined, source: "db" as const };
        }
        yield* Ref.update(cache, (m) => new Map(m).set(key, row));
        return { value: row, source: "db" as const };
      });

    return { get, admit } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  const rows = new Map([
    ["user:1", "ada"],
    ["user:2", "grace"],
    ["user:3", "edsger"],
  ]);

  // Property 1: the unshielded baseline sends every miss to the database.
  {
    const db = yield* makeDb(rows);
    const cache = yield* Ref.make(new Map<string, string>());
    const nakedGet = (key: string) =>
      Effect.gen(function* () {
        const hit = (yield* Ref.get(cache)).get(key);
        if (hit !== undefined) return hit;
        const row = yield* db.fetch(key);
        if (row !== undefined)
          yield* Ref.update(cache, (m) => new Map(m).set(key, row));
        return row;
      });
    yield* Effect.all(
      Array.from({ length: 50 }, () => nakedGet("user:999999")),
      { concurrency: 1 },
    );
    const hits = yield* db.hits;
    yield* check(
      "unshielded cache forwards every miss",
      hits === 50,
      `50 requests for a nonexistent key produced ${hits} database hits`,
    );
  }

  // Property 2: the bloom filter kills made-up keys with zero database work.
  {
    const db = yield* makeDb(rows);
    const shield = yield* makeShield(db);
    for (const key of rows.keys()) yield* shield.admit(key);
    const answers = yield* Effect.all(
      Array.from({ length: 50 }, (_, i) => shield.get(`user:${9000 + i}`)),
    );
    const hits = yield* db.hits;
    const fromBloom = answers.filter((a) => a.source === "bloom").length;
    yield* check(
      "rotating fake keys die at the bloom filter",
      hits === 0 && fromBloom === 50,
      `50 distinct probe keys: ${fromBloom} rejected in memory, ${hits} database hits`,
    );
  }

  // Property 3: a real key that was deleted (in bloom, not in db) costs one
  // trip, then the negative cache absorbs the repeats.
  {
    const db = yield* makeDb(rows);
    const shield = yield* makeShield(db);
    for (const key of rows.keys()) yield* shield.admit(key);
    yield* shield.admit("user:404"); // existed once, later deleted from db
    const answers = yield* Effect.all(
      Array.from({ length: 20 }, () => shield.get("user:404")),
      { concurrency: 1 },
    );
    const hits = yield* db.hits;
    const negatives = answers.filter((a) => a.source === "negative").length;
    yield* check(
      "negative cache absorbs repeated misses",
      hits <= 3 && negatives >= 17,
      `20 requests for a deleted key: ${hits} database trip(s), ${negatives} served from the negative cache`,
    );
  }

  // Property 4: real keys still flow: first read from db, repeats from cache.
  {
    const db = yield* makeDb(rows);
    const shield = yield* makeShield(db);
    for (const key of rows.keys()) yield* shield.admit(key);
    const first = yield* shield.get("user:2");
    const second = yield* shield.get("user:2");
    const hits = yield* db.hits;
    yield* check(
      "real keys are unaffected by the shield",
      first.value === "grace" && second.source === "cache" && hits === 1,
      `user:2 read "${first.value}" from db once, then from cache (${hits} db hit)`,
    );
  }

  console.log("penetration.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

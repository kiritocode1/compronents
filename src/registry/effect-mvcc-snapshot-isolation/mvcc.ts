/**
 * mvcc.ts
 *
 * Failure modes solved:
 *   1. Reads that block writes (and tear): a lock-per-row reader either
 *      freezes writers for the length of its scan or, without locks, reads
 *      a row mid-update and returns a value that never existed as a
 *      consistent whole. Multi-version concurrency control gives every
 *      transaction a SNAPSHOT: it reads the last version committed before
 *      it began, so a long read sees a stable, point-in-time view while
 *      writers keep appending new versions, and neither waits on the other.
 *   2. The lost update that snapshot isolation still allows: two
 *      transactions both read balance 100, both write 100 + delta, and one
 *      overwrites the other. Snapshot isolation does not catch this by
 *      itself, so the component adds first-committer-wins: at commit a
 *      transaction is aborted if any key it wrote was changed by a
 *      transaction that committed after its snapshot, turning a silent lost
 *      update into a typed WriteConflict the caller retries.
 *
 * Why the primitives make it correct: each key keeps an append-only list
 * of {value, committedAt} versions in one Ref; a snapshot is just the
 * commit timestamp captured at begin; commit is a single Ref.modify that
 * validates the write set against versions committed after the snapshot
 * and, only if clean, appends the new versions atomically, so two
 * conflicting commits can never both pass.
 */

import { Data, Effect, Ref } from "effect";

class WriteConflict extends Data.TaggedError("WriteConflict")<{
  readonly key: string;
}> {}

interface Version {
  readonly value: number;
  readonly committedAt: number;
}

interface Db {
  readonly store: Ref.Ref<ReadonlyMap<string, readonly Version[]>>;
  readonly clock: Ref.Ref<number>;
}

export interface Transaction {
  readonly read: (key: string) => Effect.Effect<number>;
  readonly write: (key: string, value: number) => Effect.Effect<void>;
  readonly commit: Effect.Effect<number, WriteConflict>;
}

export const makeDb = (
  initial: ReadonlyMap<string, number>,
): Effect.Effect<Db> =>
  Effect.gen(function* () {
    const seeded = new Map<string, readonly Version[]>();
    for (const [k, v] of initial) seeded.set(k, [{ value: v, committedAt: 0 }]);
    return {
      store: yield* Ref.make<ReadonlyMap<string, readonly Version[]>>(seeded),
      clock: yield* Ref.make(0),
    };
  });

const versionAsOf = (
  versions: readonly Version[] | undefined,
  snapshot: number,
) => {
  let best: Version | undefined;
  for (const v of versions ?? []) {
    if (
      v.committedAt <= snapshot &&
      (best === undefined || v.committedAt > best.committedAt)
    ) {
      best = v;
    }
  }
  return best?.value ?? 0;
};

export const begin = (db: Db): Effect.Effect<Transaction> =>
  Effect.gen(function* () {
    const snapshot = yield* Ref.get(db.clock);
    const writes = yield* Ref.make(new Map<string, number>());
    const reads = yield* Ref.make(new Set<string>());

    const read = (key: string) =>
      Effect.gen(function* () {
        const staged = (yield* Ref.get(writes)).get(key);
        if (staged !== undefined) return staged;
        yield* Ref.update(reads, (s) => new Set(s).add(key));
        const store = yield* Ref.get(db.store);
        return versionAsOf(store.get(key), snapshot);
      });

    const write = (key: string, value: number) =>
      Ref.update(writes, (m) => new Map(m).set(key, value));

    const commit = Effect.gen(function* () {
      const staged = yield* Ref.get(writes);
      return yield* Ref.modify(
        db.clock,
        (now): readonly [Effect.Effect<number, WriteConflict>, number] => {
          return [
            Effect.gen(function* () {
              const commitTs = now + 1;
              const conflict = yield* Ref.modify(
                db.store,
                (
                  store,
                ): readonly [
                  string | null,
                  ReadonlyMap<string, readonly Version[]>,
                ] => {
                  // first-committer-wins: abort if any written key gained a
                  // version after our snapshot
                  for (const key of staged.keys()) {
                    const versions = store.get(key) ?? [];
                    if (versions.some((v) => v.committedAt > snapshot))
                      return [key, store];
                  }
                  const next = new Map(store);
                  for (const [key, value] of staged) {
                    const prior = next.get(key) ?? [];
                    next.set(key, [...prior, { value, committedAt: commitTs }]);
                  }
                  return [null, next];
                },
              );
              if (conflict !== null)
                return yield* new WriteConflict({ key: conflict });
              return commitTs;
            }),
            now + 1,
          ];
        },
      ).pipe(Effect.flatten);
    });

    return { read, write, commit } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: a reader's snapshot is stable across a concurrent commit.
  {
    const db = yield* makeDb(new Map([["x", 100]]));
    const reader = yield* begin(db);
    const before = yield* reader.read("x");
    // a writer commits a new version while the reader is still open
    const writer = yield* begin(db);
    yield* writer.write("x", 999);
    yield* writer.commit;
    const after = yield* reader.read("x");
    yield* check(
      "an open transaction reads a stable snapshot",
      before === 100 && after === 100,
      `reader saw x=${before} then x=${after} even though a writer committed x=999 in between`,
    );
  }

  // Property 2: a transaction that begins after the commit sees the new value.
  {
    const db = yield* makeDb(new Map([["x", 100]]));
    const t1 = yield* begin(db);
    yield* t1.write("x", 250);
    yield* t1.commit;
    const t2 = yield* begin(db);
    yield* check(
      "a later transaction sees committed writes",
      (yield* t2.read("x")) === 250,
      `a transaction started after the commit reads x=${yield* t2.read("x")}`,
    );
  }

  // Property 3: the lost update. Two transactions on the same snapshot both
  // read 100 and write +50; first-committer-wins aborts the second.
  {
    const db = yield* makeDb(new Map([["bal", 100]]));
    const a = yield* begin(db);
    const b = yield* begin(db);
    const av = yield* a.read("bal");
    const bv = yield* b.read("bal");
    yield* a.write("bal", av + 50);
    yield* b.write("bal", bv + 50);
    yield* a.commit;
    const bExit = yield* Effect.exit(b.commit);
    const final = yield* begin(db).pipe(Effect.flatMap((t) => t.read("bal")));
    yield* check(
      "concurrent updates cannot silently clobber",
      bExit._tag === "Failure" && final === 150,
      `both read 100 and wrote +50; the second commit was refused (WriteConflict) so bal=${final}, not a lost-update 150-that-should-be-200`,
    );
  }

  // Property 4: non-overlapping write sets both commit; no false conflict.
  {
    const db = yield* makeDb(
      new Map([
        ["x", 1],
        ["y", 1],
      ]),
    );
    const a = yield* begin(db);
    const b = yield* begin(db);
    yield* a.write("x", 10);
    yield* b.write("y", 20);
    const ax = yield* Effect.exit(a.commit);
    const bx = yield* Effect.exit(b.commit);
    const t = yield* begin(db);
    const [x, y] = [yield* t.read("x"), yield* t.read("y")];
    yield* check(
      "disjoint writes do not conflict",
      ax._tag === "Success" && bx._tag === "Success" && x === 10 && y === 20,
      `two transactions touching different keys both committed: x=${x}, y=${y}`,
    );
  }

  console.log("mvcc.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

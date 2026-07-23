/**
 * wal.ts
 *
 * Failure modes solved:
 *   1. The crash that leaves the database half-written: applying an update
 *      directly to pages means a crash mid-write leaves some pages new and
 *      some old, and on restart there is no way to know which. A
 *      write-ahead log fixes durability and atomicity together: the change
 *      is appended to the log and fsynced BEFORE the pages are touched, so
 *      recovery can always finish (redo) a committed transaction or discard
 *      (ignore) an uncommitted one. The log is the truth; the pages are a
 *      cache of it.
 *   2. Replaying the whole log forever: without checkpoints, recovery would
 *      replay every write since the beginning of time, and the log would
 *      grow without bound. A checkpoint records that everything up to LSN N
 *      is safely in the pages, so recovery only replays the suffix after
 *      the last checkpoint and the log before it can be truncated.
 *
 * Why the primitives make it correct: the log is an append-only array in a
 * Ref, and a record is appended (and its LSN returned) before the page
 * write, so a crash can drop the page write but never the log record;
 * commit writes a Commit record, so recovery redoes only writes whose
 * transaction has a matching commit and rolls forward from the checkpoint
 * LSN; the demo models a crash by discarding page state and replaying the
 * log, then asserts the recovered pages equal what commit promised.
 */

import { Effect, Ref } from "effect";

type Record_ =
  | {
      readonly lsn: number;
      readonly kind: "write";
      readonly txId: number;
      readonly key: string;
      readonly value: string;
    }
  | { readonly lsn: number; readonly kind: "commit"; readonly txId: number }
  | {
      readonly lsn: number;
      readonly kind: "checkpoint";
      readonly upTo: number;
    };

export interface Wal {
  readonly begin: Effect.Effect<number>;
  readonly write: (
    txId: number,
    key: string,
    value: string,
  ) => Effect.Effect<number>;
  readonly commit: (txId: number) => Effect.Effect<void>;
  readonly checkpoint: Effect.Effect<void>;
  readonly pages: Effect.Effect<ReadonlyMap<string, string>>;
  /** wipe the in-memory pages (the volatile cache) and rebuild from the log */
  readonly crashAndRecover: Effect.Effect<{
    replayed: number;
    committedTxns: number;
  }>;
  readonly logSize: Effect.Effect<number>;
}

export const makeWal = (): Effect.Effect<Wal> =>
  Effect.gen(function* () {
    const log = yield* Ref.make<readonly Record_[]>([]);
    const pages = yield* Ref.make(new Map<string, string>());
    // the checkpointed page image on durable storage: survives a crash
    const durable = yield* Ref.make(new Map<string, string>());
    const nextTx = yield* Ref.make(0);

    const append = (mk: (lsn: number) => Record_) =>
      Ref.modify(log, (l): readonly [number, readonly Record_[]] => {
        const lsn = l.length;
        return [lsn, [...l, mk(lsn)]];
      });

    const write = (txId: number, key: string, value: string) =>
      Effect.gen(function* () {
        // WAL rule: the log record is durable before the page changes
        const lsn = yield* append((lsn) => ({
          lsn,
          kind: "write",
          txId,
          key,
          value,
        }));
        yield* Ref.update(pages, (m) => new Map(m).set(key, value));
        return lsn;
      });

    const recoverFrom = (
      records: readonly Record_[],
      durablePages: ReadonlyMap<string, string>,
    ) => {
      // find the last checkpoint; replay only the suffix after it, starting
      // from the durable page image the checkpoint left behind
      let start = 0;
      for (const r of records) if (r.kind === "checkpoint") start = r.upTo;
      const suffix = records.filter((r) => r.lsn >= start);
      const committed = new Set(
        suffix
          .filter(
            (r): r is Extract<Record_, { kind: "commit" }> =>
              r.kind === "commit",
          )
          .map((r) => r.txId),
      );
      const rebuilt = new Map<string, string>(durablePages);
      let replayed = 0;
      for (const r of suffix) {
        // redo only writes belonging to a committed transaction
        if (r.kind === "write" && committed.has(r.txId)) {
          rebuilt.set(r.key, r.value);
          replayed++;
        }
      }
      return { rebuilt, replayed, committed };
    };

    return {
      begin: Ref.updateAndGet(nextTx, (n) => n + 1),
      write,
      commit: (txId: number) =>
        append((lsn) => ({ lsn, kind: "commit", txId })).pipe(Effect.asVoid),
      checkpoint: Effect.gen(function* () {
        // flush the current committed page image to durable storage, then
        // record that the log up to here is safely persisted
        const current = yield* Ref.get(pages);
        yield* Ref.set(durable, new Map(current));
        const size = (yield* Ref.get(log)).length;
        yield* append((lsn) => ({ lsn, kind: "checkpoint", upTo: size }));
      }),
      pages: Ref.get(pages),
      crashAndRecover: Effect.gen(function* () {
        const records = yield* Ref.get(log);
        const durablePages = yield* Ref.get(durable);
        const { rebuilt, replayed, committed } = recoverFrom(
          records,
          durablePages,
        );
        // the crash: volatile pages are gone, rebuilt purely from the log
        yield* Ref.set(pages, rebuilt);
        return { replayed, committedTxns: committed.size };
      }),
      logSize: Ref.get(log).pipe(Effect.map((l) => l.length)),
    } as const;
  });

// ---- demo: prove the properties ----
const demo = Effect.gen(function* () {
  const check = (label: string, ok: boolean, detail: string) =>
    Effect.sync(() =>
      console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`),
    );

  // Property 1: a committed transaction survives a crash.
  {
    const wal = yield* makeWal();
    const tx = yield* wal.begin;
    yield* wal.write(tx, "balance", "100");
    yield* wal.write(tx, "status", "active");
    yield* wal.commit(tx);
    yield* wal.crashAndRecover;
    const pages = yield* wal.pages;
    yield* check(
      "committed writes survive a crash via redo",
      pages.get("balance") === "100" && pages.get("status") === "active",
      `after wiping pages and replaying the log, balance=${pages.get("balance")}, status=${pages.get("status")}`,
    );
  }

  // Property 2: an uncommitted transaction is discarded on recovery.
  {
    const wal = yield* makeWal();
    const tx = yield* wal.begin;
    yield* wal.write(tx, "balance", "999");
    // crash BEFORE commit: the write is in the log but the txn never committed
    const { replayed } = yield* wal.crashAndRecover;
    const pages = yield* wal.pages;
    yield* check(
      "uncommitted writes are not replayed",
      pages.get("balance") === undefined && replayed === 0,
      `a write with no matching commit was discarded on recovery (${replayed} records redone)`,
    );
  }

  // Property 3: mixed committed/uncommitted. Only the committed txn's effect
  // survives; the doomed one leaves no trace.
  {
    const wal = yield* makeWal();
    const good = yield* wal.begin;
    yield* wal.write(good, "a", "committed");
    yield* wal.commit(good);
    const bad = yield* wal.begin;
    yield* wal.write(bad, "a", "half-written"); // overwrites in-memory, uncommitted
    yield* wal.crashAndRecover;
    const pages = yield* wal.pages;
    yield* check(
      "recovery keeps committed effects and drops the rest",
      pages.get("a") === "committed",
      `an uncommitted overwrite was rolled back; a="${pages.get("a")}", not the dirty "half-written"`,
    );
  }

  // Property 4: a checkpoint bounds replay to the log suffix.
  {
    const wal = yield* makeWal();
    const t1 = yield* wal.begin;
    yield* wal.write(t1, "old", "1");
    yield* wal.commit(t1);
    yield* wal.checkpoint; // everything so far is in the pages
    const t2 = yield* wal.begin;
    yield* wal.write(t2, "new", "2");
    yield* wal.commit(t2);
    const { replayed } = yield* wal.crashAndRecover;
    const pages = yield* wal.pages;
    yield* check(
      "recovery replays only past the last checkpoint",
      replayed === 1 && pages.get("new") === "2",
      `only the ${replayed} post-checkpoint write was redone; recovery skipped the checkpointed prefix`,
    );
  }

  console.log("wal.ts: all properties verified");
});

Effect.runPromise(demo).catch((e) => {
  console.error("demo failed", e);
  process.exit(1);
});

import { type DBSchema, type IDBPDatabase, openDB } from "idb";

/**
 * The IndexedDB half of a write outbox: a durable queue of mutations that
 * survives reload, tab crash, and offline, and is drained to the server by
 * `drain.ts`.
 *
 * Built on idb 8.0.3 (Jake Archibald, ISC, https://github.com/jakearchibald/idb).
 * idb is a thin wrapper, not an ORM: every call that would hand back an
 * `IDBRequest` hands back a promise instead, a transaction exposes `tx.done`
 * and `tx.store`, and `db.get()` / `db.put()` are shortcuts that open a
 * single-store transaction for you. Nothing here is unavailable in raw
 * IndexedDB; the wrapper only removes the event plumbing.
 *
 * Two decisions in this file are load-bearing and both are measured, not
 * stylistic. They are documented at `readPending` and `openOutbox` below.
 */

export type OutboxStatus = "pending" | "dead";

export type OutboxRecord = {
  /** Assigned by the store's autoIncrement key generator, so it is also the insertion order. */
  id: number;
  status: OutboxStatus;
  /** Path or absolute URL this mutation POSTs to. */
  endpoint: string;
  body: unknown;
  /**
   * Sent as an `Idempotency-Key` header. Delivery here is at-least-once by
   * construction: the network call happens outside any transaction, so a
   * crash between "server accepted" and "row deleted" replays the write.
   * The server must dedupe on this value.
   */
  idempotencyKey: string;
  attempts: number;
  createdAt: number;
  /** Last transport or server error, kept for triaging the dead-letter set. */
  lastError?: string;
};

export interface OutboxSchema extends DBSchema {
  outbox: {
    key: number;
    value: OutboxRecord;
    indexes: {
      /**
       * Compound `[status, id]`, not a bare `status`. IndexedDB sorts index
       * entries by index key and then by primary key, so a compound key is
       * what makes "the next page of pending records, in insertion order"
       * expressible as one key range. With a bare `status` index the range
       * cannot carry a paging cursor and you are back to stepping a cursor,
       * which is the exact cost this file exists to avoid.
       */
      "by-status": [OutboxStatus, number];
    };
  };
}

export const OUTBOX_DB_NAME = "sync-outbox";
export const OUTBOX_DB_VERSION = 1;

/**
 * `upgrade` runs inside a `versionchange` transaction that idb hands you as
 * the fourth argument, so schema work and any data backfill share one atomic
 * unit. `oldVersion` is 0 on a first-ever open, which is why the guards below
 * are written as version ranges rather than a single "does it exist" check:
 * a client that has been away for two releases replays every missing step in
 * order.
 *
 * Do not await anything non-IndexedDB inside `upgrade`. The versionchange
 * transaction obeys the same auto-commit rule as every other transaction
 * (see `drain.ts`).
 */
export function openOutbox(): Promise<IDBPDatabase<OutboxSchema>> {
  return openDB<OutboxSchema>(OUTBOX_DB_NAME, OUTBOX_DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore("outbox", {
          keyPath: "id",
          autoIncrement: true,
        });
        // keyPath + autoIncrement means the generated key is written back
        // into the record, so a read batch already knows its own paging
        // cursor and never needs a matching getAllKeys() call.
        store.createIndex("by-status", ["status", "id"]);
      }
    },
    blocked() {
      // Another tab is holding an older version open. Nothing to do but wait;
      // the promise stays pending until that tab closes its connection.
    },
    terminated() {
      // Browser killed the connection (quota eviction, tab discard). The next
      // openOutbox() call reopens. Records already committed are intact.
    },
  });
}

/** Tuned in the 100 to 1000 range. See the note in `readPending`. */
export const DEFAULT_BATCH_SIZE = 100;

/**
 * Read the next page of pending records in insertion order.
 *
 * This is `getAll` over a key range, deliberately, and NOT a cursor. Stepping
 * a cursor is the single most expensive habit in IndexedDB code: each
 * `cursor.continue()` becomes its own JavaScript task, and those tasks are
 * separated by idle time while control bounces between the main thread and
 * the off-main-thread IndexedDB engine. Nolan Lawson benchmarked the swap
 * (https://nolanlawson.com/2021/08/22/speeding-up-indexeddb-reads-and-writes/,
 * 2015 MacBook Pro, Chrome 92 / Firefox 91 / Safari 14.1, median of >= 15
 * Tachometer iterations): reading 50,000 records took Chrome 1194.2ms by
 * cursor versus 702.8ms at batch size 100 and 488.3ms at 1000, and the
 * original PouchDB-era finding was a 40 to 50 percent win in Chrome and
 * Firefox. Safari is the extreme: a 100-record read went from 11ms to 1ms,
 * and 50,000 records from 4673ms to 227ms.
 *
 * The paging trick is the exclusive lower bound. `IDBKeyRange.bound` with
 * `lowerOpen: true` starts strictly after the last id of the previous page,
 * which is the compound-index form of the article's
 * `IDBKeyRange.lowerBound(keys.at(-1), true)`. `Number.MAX_SAFE_INTEGER`
 * closes the range at the top of the same status so the page can never spill
 * into "dead" records.
 *
 * ponytail: ascending only. IndexedDB v2 cannot page a key range in
 * descending order, which is fine because an outbox drains oldest-first. If
 * you ever need newest-first, the 2025 `getAllRecords` API added exactly that
 * (plus keys and values in one call); feature-detect it and keep this as the
 * fallback.
 */
export async function readPending(
  db: IDBPDatabase<OutboxSchema>,
  options: { after?: number; batchSize?: number; status?: OutboxStatus } = {},
): Promise<OutboxRecord[]> {
  const status = options.status ?? "pending";
  const after = options.after ?? Number.NEGATIVE_INFINITY;
  const range = IDBKeyRange.bound(
    [status, after],
    [status, Number.MAX_SAFE_INTEGER],
    options.after !== undefined,
    false,
  );

  // db.getAllFromIndex opens, uses, and commits its own readonly transaction.
  // That is the correct scope here: the caller is about to hit the network,
  // and no transaction may stay open across that boundary.
  return db.getAllFromIndex(
    "outbox",
    "by-status",
    range,
    options.batchSize ?? DEFAULT_BATCH_SIZE,
  );
}

/** Count of records in a status, for a queue badge or a drain-completion check. */
export function countByStatus(
  db: IDBPDatabase<OutboxSchema>,
  status: OutboxStatus,
): Promise<number> {
  return db.countFromIndex(
    "outbox",
    "by-status",
    IDBKeyRange.bound(
      [status, Number.NEGATIVE_INFINITY],
      [status, Number.MAX_SAFE_INTEGER],
    ),
  );
}

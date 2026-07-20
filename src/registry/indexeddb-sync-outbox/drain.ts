import type { IDBPDatabase } from "idb";
import {
  DEFAULT_BATCH_SIZE,
  type OutboxRecord,
  type OutboxSchema,
  readPending,
} from "./outbox-db";

/**
 * The drain loop: read a batch, close the transaction, POST, reopen a
 * transaction to settle the batch. Repeat until the queue is empty.
 *
 * The transaction split is not a style choice, it is the only shape that
 * works. Two rules from the IndexedDB spec, both restated in MDN's "Using
 * IndexedDB" (https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB):
 *
 * 1. Auto-commit. "Transactions are tied very closely to the event loop. If
 *    you make a transaction and return to the event loop without using it
 *    then the transaction will become inactive. The only way to keep the
 *    transaction active is to make a request on it." A `fetch` yields, so a
 *    transaction awaited across a fetch is already committed by the time the
 *    response lands and every later request on it throws
 *    `TransactionInactiveError`. There is no flag, no option, and no idb
 *    helper that suspends this. The network work must happen between two
 *    transactions, never inside one.
 *
 * 2. No shutdown guarantee. MDN: "there is no way to guarantee that IndexedDB
 *    transactions will complete, even with normal browser shutdown," and
 *    "you should never tie database transactions to unload events." So the
 *    settle transaction can be lost after the server has already accepted the
 *    write. Delivery is therefore at-least-once and the server must dedupe on
 *    `Idempotency-Key`. Do not try to close this hole with a `beforeunload`
 *    flush; that is the pattern MDN names as broken.
 */

export type EnqueueInput = {
  endpoint: string;
  body: unknown;
  /** Supply your own to make a retry from application code collapse onto one server-side write. */
  idempotencyKey?: string;
};

/**
 * One `put`, one implicit transaction. Returns the generated id.
 *
 * `put` rather than `add` because the key generator owns the id and a
 * generated key can never collide, so the add/put distinction buys nothing
 * here beyond a different error message.
 */
export function enqueue(
  db: IDBPDatabase<OutboxSchema>,
  input: EnqueueInput,
): Promise<number> {
  return db.put("outbox", {
    status: "pending",
    endpoint: input.endpoint,
    body: input.body,
    idempotencyKey: input.idempotencyKey ?? crypto.randomUUID(),
    attempts: 0,
    createdAt: Date.now(),
  } as OutboxRecord);
}

export type DrainOptions = {
  batchSize?: number;
  /**
   * Attempts before a record moves to `dead`. Counted per record, not per
   * batch, so one poison payload cannot hold the queue behind it forever.
   */
  maxAttempts?: number;
  /** Injectable for tests and for a service worker that wants its own fetch. */
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

export type DrainResult = {
  sent: number;
  failed: number;
  dead: number;
  /** True when the loop stopped because the network is failing, not because the queue emptied. */
  stalled: boolean;
};

/** Client errors are the payload's fault. Replaying them just burns attempts. */
function isPermanent(status: number): boolean {
  return status >= 400 && status < 500 && status !== 408 && status !== 429;
}

/**
 * ponytail: no cross-tab coordination. Two tabs draining at once will both
 * read the same pending batch and POST it twice, which the idempotency key
 * absorbs at the server. If that duplicate traffic matters, wrap the call in
 * `navigator.locks.request("sync-outbox", () => drain(db))`; the Web Locks
 * API is the one-line fix and needs no schema change.
 *
 * ponytail: no backoff schedule. A failed batch stops the loop and the caller
 * decides when to retry (online event, interval, Background Sync). If you
 * need per-record delay, add a `nextAttemptAt` field and make the index
 * `[status, nextAttemptAt, id]`; the paging in `readPending` is unaffected.
 */
export async function drain(
  db: IDBPDatabase<OutboxSchema>,
  options: DrainOptions = {},
): Promise<DrainResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const maxAttempts = options.maxAttempts ?? 5;
  const doFetch = options.fetchImpl ?? fetch;
  const result: DrainResult = { sent: 0, failed: 0, dead: 0, stalled: false };

  let after: number | undefined;

  for (;;) {
    if (options.signal?.aborted) return result;

    // Transaction 1 (readonly): opened and committed entirely inside this
    // call. Nothing below this line may touch it.
    const batch = await readPending(db, { after, batchSize });
    if (batch.length === 0) return result;

    const settled: OutboxRecord[] = [];
    const succeeded: number[] = [];
    let stop = false;

    // No transaction is open across this loop. This is the whole point.
    for (const record of batch) {
      if (options.signal?.aborted) break;

      const outcome = await send(record, doFetch, options.signal);

      if (outcome.ok) {
        succeeded.push(record.id);
        result.sent += 1;
        continue;
      }

      const attempts = record.attempts + 1;
      const exhausted = outcome.permanent || attempts >= maxAttempts;
      settled.push({
        ...record,
        attempts,
        status: exhausted ? "dead" : "pending",
        lastError: outcome.error,
      });

      if (exhausted) {
        result.dead += 1;
      } else {
        result.failed += 1;
      }

      // A transient failure means the network is down for everything behind
      // it too. Stop after writing back what we know rather than burning an
      // attempt on every remaining record.
      if (!outcome.permanent) {
        stop = true;
        break;
      }
    }

    // Transaction 2 (readwrite): a fresh transaction, opened only now that
    // all network work is finished. `tx.done` is the commit signal; the
    // individual delete/put promises resolving is not.
    if (succeeded.length > 0 || settled.length > 0) {
      const tx = db.transaction("outbox", "readwrite");
      await Promise.all([
        ...succeeded.map((id) => tx.store.delete(id)),
        ...settled.map((record) => tx.store.put(record)),
        tx.done,
      ]);
    }

    if (stop) {
      result.stalled = true;
      return result;
    }
    // An abort leaves the tail of the batch untouched and still pending.
    // Return rather than paging past it, or those records are skipped for the
    // rest of this drain.
    if (options.signal?.aborted) return result;

    // Page past the batch just handled. Every record in it is now deleted or
    // dead, so this is belt-and-braces against a status write that silently
    // no-ops, which would otherwise re-read the same page forever.
    after = batch[batch.length - 1]?.id ?? after;
  }
}

async function send(
  record: OutboxRecord,
  doFetch: typeof fetch,
  signal?: AbortSignal,
): Promise<{ ok: true } | { ok: false; permanent: boolean; error: string }> {
  try {
    const response = await doFetch(record.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": record.idempotencyKey,
      },
      body: JSON.stringify(record.body),
      signal,
    });

    if (response.ok) return { ok: true };
    return {
      ok: false,
      permanent: isPermanent(response.status),
      error: `HTTP ${response.status}`,
    };
  } catch (error) {
    // A thrown fetch is a transport failure (offline, DNS, CORS preflight),
    // never a server verdict, so it is always retryable.
    return {
      ok: false,
      permanent: false,
      error: error instanceof Error ? error.message : "network error",
    };
  }
}

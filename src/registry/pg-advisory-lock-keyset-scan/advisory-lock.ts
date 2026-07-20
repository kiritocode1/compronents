import { createHash } from "node:crypto";
import type { PoolClient } from "pg";

/**
 * Single-flight job locks on plain Postgres advisory locks, no ORM and no
 * lock table.
 *
 * Everything here is transaction-level (`pg_advisory_xact_lock` /
 * `pg_try_advisory_xact_lock`) and that is the whole point. Section 13.3.5
 * of the manual draws the line: a session-level lock "is held until
 * explicitly released or the session ends", and session-level requests "do
 * not honor transaction semantics: a lock acquired during a transaction that
 * is later rolled back will still be held following the rollback". It also
 * counts, so "for each completed lock request there must be a corresponding
 * unlock request before the lock is actually released". A worker that takes
 * `pg_advisory_lock`, throws, and returns its connection to the pool leaves
 * that lock held on a live pooled connection, and every later job on the same
 * key blocks forever behind a process that is no longer running. Transaction-
 * level requests "are automatically released at the end of the transaction,
 * and there is no explicit unlock operation", so COMMIT, ROLLBACK, and a
 * dropped connection all release identically. There is no leak path to get
 * wrong.
 *
 * Signatures used, from the advisory lock function table in Section 9.28.10:
 *
 *   pg_advisory_xact_lock(key bigint) -> void
 *   pg_advisory_xact_lock(key1 integer, key2 integer) -> void
 *   pg_try_advisory_xact_lock(key bigint) -> boolean
 *   pg_try_advisory_xact_lock(key1 integer, key2 integer) -> boolean
 *
 * The blocking forms return void and wait. The `try` forms "either obtain the
 * lock immediately and return true, or return false without waiting". That
 * boolean is the skip signal for a cron worker running on every box: one wins,
 * the rest return without work instead of queueing behind it.
 *
 * ---------------------------------------------------------------------------
 * The documented footgun, restated because it is easy to reintroduce.
 *
 * Section 13.3.5 flags this exact query as dangerous:
 *
 *   SELECT pg_advisory_lock(id) FROM foo WHERE id = 12345;             -- ok
 *   SELECT pg_advisory_lock(id) FROM foo WHERE id > 12345 LIMIT 100;   -- danger!
 *   SELECT pg_advisory_lock(q.id) FROM
 *     (SELECT id FROM foo WHERE id > 12345 LIMIT 100) q;               -- ok
 *
 * "the LIMIT is not guaranteed to be applied before the locking function is
 * executed. This might cause some locks to be acquired that the application
 * was not expecting, and hence would fail to release (until it ends the
 * session)." The lock function is an expression in the target list and the
 * LIMIT truncates the result after that expression has already run on rows
 * the caller never sees. At session level those extra locks are dangling and
 * survive until the connection closes, visible in `pg_locks` and attached to
 * nothing. Two rules follow: never call a lock function in the target list of
 * a query that also carries LIMIT or ORDER BY without pushing the row
 * selection into a subquery first (the third form above), and never mix
 * advisory locking into a paginated scan at all. Lock one key per call, the
 * way every function below does.
 *
 * Do not combine this with the keyset scan in `keyset-page.ts` by locking each
 * page row. Lock the job, then scan.
 *
 * ---------------------------------------------------------------------------
 * Pass a `PoolClient`, never a `Pool`. A lock belongs to the connection that
 * took it, and `pool.query()` may land each statement on a different backend.
 * These helpers own their transaction, so call them outside one.
 */

/** A bigint key, a two-int32 key pair, or a string hashed into the bigint space. */
export type JobLockKey = string | bigint | [number, number];

/**
 * Hash a human-readable job name into the full signed 64-bit space that
 * `pg_advisory_xact_lock(bigint)` accepts.
 *
 * SHA-256 truncated to its first 8 bytes, read big-endian as a signed int64.
 * Advisory lock keys are a bare namespace with no registry behind them, so
 * collisions are silent: two unrelated jobs that hash alike serialize against
 * each other forever and the symptom is throughput, not an error. 64 bits of a
 * cryptographic digest makes that negligible. A cheap 32-bit string hash
 * widened to bigint does not, because it leaves 32 bits of the key unused.
 *
 * Stable across processes and Node versions, so it is safe to derive the key
 * at each call site rather than storing it.
 */
export function hashLockKey(name: string): bigint {
  return createHash("sha256").update(name, "utf8").digest().readBigInt64BE(0);
}

const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

/**
 * Build the SQL call and its bound parameters for one of the four lock
 * functions. Keys are always bound, never interpolated.
 *
 * The two-int form exists so a caller can carve the space deliberately:
 * `[CLASS_REPORT_BUILD, tenantId]` keeps every job class in its own 32-bit
 * lane and makes `pg_locks` readable, since the view exposes `classid` and
 * `objid` as the two halves. The bigint form is the one to use when the key is
 * a hashed name, because it uses all 64 bits.
 */
function lockCall(
  fn: string,
  key: JobLockKey,
): { text: string; values: unknown[] } {
  if (Array.isArray(key)) {
    const [key1, key2] = key;
    for (const part of key) {
      if (!Number.isInteger(part) || part < INT32_MIN || part > INT32_MAX) {
        throw new RangeError(
          `${fn}: two-int key parts must be int32, got ${String(part)}`,
        );
      }
    }
    // Cast explicitly: node-postgres sends JS numbers as untyped text, and
    // without ::int the planner resolves the bigint overload on a two-arg
    // call and errors instead of silently locking a different key.
    return {
      text: `SELECT ${fn}($1::int, $2::int) AS locked`,
      values: [key1, key2],
    };
  }

  const asBigint = typeof key === "string" ? hashLockKey(key) : key;
  // pg serializes BigInt via toString, which is exactly the int8 text format.
  return {
    text: `SELECT ${fn}($1::bigint) AS locked`,
    values: [asBigint.toString()],
  };
}

/**
 * Run `work` while holding an exclusive transaction-level advisory lock,
 * waiting for it if another worker holds it.
 *
 * The lock is taken as the first statement inside the transaction and released
 * by the COMMIT or ROLLBACK that ends it. If `work` throws, the ROLLBACK
 * undoes its writes and drops the lock in the same step, and the error is
 * rethrown unchanged.
 *
 * Use this when the job must eventually run and the caller can afford to wait,
 * for example a migration step or a per-tenant recompute. Use `tryJobLock`
 * for anything on a timer, where waiting only stacks up workers.
 *
 * Note that the wait is unbounded by default. Set a `lock_timeout` on the
 * connection or the role if a stuck holder should surface as an error
 * (`55P03`) rather than a hung worker.
 */
export async function withJobLock<T>(
  client: PoolClient,
  key: JobLockKey,
  work: () => Promise<T>,
): Promise<T> {
  const call = lockCall("pg_advisory_xact_lock", key);
  await client.query("BEGIN");
  try {
    await client.query(call.text, call.values);
    const result = await work();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    // Best effort: if the connection is already broken the ROLLBACK fails too,
    // and the backend releases the lock when the socket closes regardless.
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  }
}

/**
 * Try to acquire the lock without waiting. Runs `work` and reports
 * `{ ran: true, result }` if this worker won, or `{ ran: false }` immediately
 * if another one is already inside.
 *
 * This is the shape a cron job wants. Every box fires at the same minute, one
 * takes the lock, the rest observe `false` and return, and nothing queues.
 * `pg_try_advisory_xact_lock` "will either obtain the lock immediately and
 * return true, or return false without waiting if the lock cannot be acquired
 * immediately", so the losers cost one round trip.
 *
 * A `false` result still ends its transaction cleanly. It is not an error and
 * should not be logged as one; skipped is the designed outcome.
 */
export async function tryJobLock<T>(
  client: PoolClient,
  key: JobLockKey,
  work: () => Promise<T>,
): Promise<{ ran: true; result: T } | { ran: false }> {
  const call = lockCall("pg_try_advisory_xact_lock", key);
  await client.query("BEGIN");
  try {
    const acquired = await client.query<{ locked: boolean }>(
      call.text,
      call.values,
    );
    if (acquired.rows[0]?.locked !== true) {
      // COMMIT rather than ROLLBACK: nothing was written, and an empty commit
      // does not mark the transaction as failed in connection-level metrics.
      await client.query("COMMIT");
      return { ran: false };
    }
    const result = await work();
    await client.query("COMMIT");
    return { ran: true, result };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  }
}

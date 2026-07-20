/// <reference types="@cloudflare/workers-types" />

/**
 * Point-in-time recovery for a single tenant, which is the operation a shared
 * database genuinely cannot perform.
 *
 * On one large Postgres, "restore tenant 4021 to 09:15 this morning" means
 * restoring a snapshot of everybody to a staging instance, extracting that
 * tenant's rows, and reconciling them back by hand, while every other tenant
 * keeps writing. It is a day of work and a risk, so in practice the answer to a
 * customer who ran a bad bulk edit is usually no.
 *
 * A SQLite-backed Durable Object keeps a durable log of changes for the past 30
 * days per object, so the same request is three calls against one tenant, with
 * no effect on any other tenant and no downtime for anybody else.
 *
 * The API (developers.cloudflare.com/durable-objects/api/sqlite-storage-api):
 *
 *   ctx.storage.getCurrentBookmark()        -> string, a lexically comparable
 *                                              marker for "right now"
 *   ctx.storage.getBookmarkForTime(date)    -> string, the bookmark nearest a
 *                                              past timestamp
 *   ctx.storage.onNextSessionRestoreBookmark(b)
 *                                           -> arms a restore; it does not
 *                                              restore anything by itself
 *
 * The third one is the one that surprises people. It arms a restore for the next
 * time the object starts, so the object must be restarted for it to happen, and
 * `ctx.abort()` is how you cause that deliberately. Reading storage after calling
 * it, in the same event, still returns the current, unrestored data.
 *
 * Two operational facts worth stating before this reaches a runbook. PITR covers
 * both SQL data and legacy key-value data in the same object, because the KV API
 * is implemented on the same SQLite database. And PITR is not available in local
 * development, which keeps no durable change log, so this path can only be
 * exercised against a deployed object.
 */

import { DurableObject } from "cloudflare:workers";

export type RecoveryEnv = {
  TENANT: DurableObjectNamespace<TenantRecovery>;
};

/**
 * Mix into, or extend alongside, the tenant object. It is written as its own
 * class here so the recovery surface can carry its own authorization.
 */
export class TenantRecovery extends DurableObject<RecoveryEnv> {
  /**
   * Take a bookmark before doing something destructive, and hand it back to the
   * caller. A bulk import, a schema-changing deploy, and a customer-run "delete
   * all archived" are the three moments worth one of these.
   *
   * Bookmarks are opaque but lexically comparable, so they sort like timestamps
   * without being parseable as one. Store the pair (bookmark, why, when) outside
   * the object, because a restore rolls the object back past any record of the
   * restore that the object itself was keeping.
   */
  async checkpoint(reason: string): Promise<{ bookmark: string; at: number }> {
    const bookmark = await this.ctx.storage.getCurrentBookmark();
    console.log("checkpoint", { reason, bookmark });
    return { bookmark, at: Date.now() };
  }

  /**
   * Restore to an explicit bookmark taken earlier.
   *
   * ctx.abort() ends the current session immediately: in-flight requests to this
   * object fail and any open WebSockets are disconnected. That is the intended
   * cost. Without it the restore sits armed until the object happens to be
   * evicted and woken, which could be seconds or hours, and in the meantime the
   * object keeps serving pre-restore data and accepting writes that the restore
   * will then discard.
   */
  async restoreTo(bookmark: string): Promise<never> {
    await this.ctx.storage.onNextSessionRestoreBookmark(bookmark);
    // Nothing after this line runs. Restarting is the restore.
    this.ctx.abort(`restoring to bookmark ${bookmark}`);
  }

  /**
   * Restore to a wall-clock time, for the common incident where nobody took a
   * checkpoint because nobody expected to need one.
   *
   * The window is 30 days. A request outside it is rejected here with a clear
   * message rather than being passed down to fail less legibly, and a request
   * for the future is rejected because "restore forward" is always a mistake.
   */
  async restoreToTime(target: Date): Promise<never> {
    const ageMs = Date.now() - target.getTime();
    if (ageMs < 0) throw new Error("cannot restore to a future time");
    if (ageMs > 30 * 24 * 60 * 60 * 1000) {
      throw new Error("restore window is 30 days");
    }

    const bookmark = await this.ctx.storage.getBookmarkForTime(target);
    return this.restoreTo(bookmark);
  }

  /**
   * The safety net for the restore itself.
   *
   * A restore is a write, and a wrong restore is a second incident on top of the
   * first. Taking a bookmark of the current state before arming the rollback
   * makes the operation reversible: if the chosen time turns out to be wrong,
   * restoreTo(previous) puts the object back exactly as it was, including the
   * rows the restore removed.
   *
   * The returned bookmark must be persisted somewhere outside this object, by
   * the caller, before restoreTo runs. That is the entire reason this returns
   * rather than chaining.
   */
  async prepareRollback(): Promise<string> {
    return this.ctx.storage.getCurrentBookmark();
  }
}

/**
 * Caller side, showing the ordering that makes the operation safe.
 *
 * ponytail: the undo bookmark is logged rather than written to a store. Route it
 * to whatever durable audit log the project already has; the shape of the
 * operation does not change, and inventing a store here would be inventing the
 * wrong one.
 */
export async function rollbackTenant(
  env: RecoveryEnv,
  tenantId: string,
  target: Date,
): Promise<{ undoBookmark: string }> {
  const tenant = env.TENANT.getByName(tenantId);

  // Step 1: capture the undo point and get it somewhere durable.
  const undoBookmark = await tenant.prepareRollback();
  console.log("armed rollback", { tenantId, undoBookmark, target });

  // Step 2: arm and abort. This call rejects, always, because the object it is
  // talking to restarts as part of servicing the request. Anything other than
  // treating that rejection as success would be a bug.
  await tenant.restoreToTime(target).catch(() => undefined);

  return { undoBookmark };
}

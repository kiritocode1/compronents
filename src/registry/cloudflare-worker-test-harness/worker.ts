/// <reference types="@cloudflare/workers-types" />

/**
 * The Worker under test: a SQLite-backed Durable Object that tracks per-user
 * rate limit windows, plus a small router in front of it.
 *
 * Nothing here is test-only. That is the point of `createTestHarness()`: it runs
 * your real production build, so the Worker needs no test seams, no injected
 * clock, and no debug endpoints.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1, compatibility_date 2026-07-01.
 *
 * Matching wrangler.jsonc (note the declarative `exports` map, which replaced the
 * legacy `migrations` array in Wrangler 4.107.0, 2026-07-02):
 *
 * {
 *   "name": "blank-quota-worker",
 *   "main": "src/quota/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "durable_objects": {
 *     "bindings": [{ "name": "QUOTA", "class_name": "QuotaCounter" }]
 *   },
 *   "exports": {
 *     "QuotaCounter": { "type": "durable-object", "storage": "sqlite" }
 *   }
 * }
 */

import { DurableObject } from "cloudflare:workers";

export type QuotaEnv = {
  QUOTA: DurableObjectNamespace<QuotaCounter>;
  QUOTA_PER_HOUR: string;
};

export type QuotaVerdict = {
  used: number;
  limit: number;
  allowed: boolean;
  resetsAt: number;
};

const HOUR_MS = 60 * 60 * 1000;

export class QuotaCounter extends DurableObject<QuotaEnv> {
  constructor(ctx: DurableObjectState, env: QuotaEnv) {
    super(ctx, env);
    // blockConcurrencyWhile keeps the first request from racing table creation.
    // `ctx.storage.sql` is synchronous, so no await is needed inside.
    ctx.blockConcurrencyWhile(async () => {
      ctx.storage.sql.exec(
        `CREATE TABLE IF NOT EXISTS windows (
           id TEXT PRIMARY KEY,
           used INTEGER NOT NULL,
           resets_at INTEGER NOT NULL
         )`,
      );
    });
  }

  /** RPC, not fetch. The harness can call this directly through `getExport()`. */
  async consume(id: string, cost: number): Promise<QuotaVerdict> {
    const limit = Number(this.env.QUOTA_PER_HOUR);
    const now = Date.now();

    const [current] = this.ctx.storage.sql
      .exec<{ used: number; resets_at: number }>(
        "SELECT used, resets_at FROM windows WHERE id = ?",
        id,
      )
      .toArray();

    const expired = current === undefined || current.resets_at <= now;
    const used = expired ? 0 : current.used;
    const resetsAt = expired ? now + HOUR_MS : current.resets_at;
    const allowed = used + cost <= limit;
    const next = allowed ? used + cost : used;

    this.ctx.storage.sql.exec(
      `INSERT INTO windows (id, used, resets_at) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET used = excluded.used, resets_at = excluded.resets_at`,
      id,
      next,
      resetsAt,
    );

    // Alarms on a SQLite-backed DO survive eviction, so the row is swept even if
    // the caller never comes back.
    await this.ctx.storage.setAlarm(resetsAt);

    return { used: next, limit, allowed, resetsAt };
  }

  override async alarm(): Promise<void> {
    this.ctx.storage.sql.exec(
      "DELETE FROM windows WHERE resets_at <= ?",
      Date.now(),
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const match = /^\/quota\/([\w-]+)$/.exec(url.pathname);
    if (!match) return new Response("Not found", { status: 404 });

    const userId = match[1];
    const cost = Number(url.searchParams.get("cost") ?? "1");
    // getByName replaces idFromName + get, and keeps the name on `stub.id.name`.
    const verdict = await env.QUOTA.getByName(userId).consume(userId, cost);

    return new Response(JSON.stringify(verdict), {
      status: verdict.allowed ? 200 : 429,
      headers: {
        "content-type": "application/json",
        "x-quota-remaining": String(verdict.limit - verdict.used),
      },
    });
  },
} satisfies ExportedHandler<QuotaEnv>;

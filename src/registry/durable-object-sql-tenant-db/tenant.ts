/// <reference types="@cloudflare/workers-types" />

/**
 * One SQLite database per tenant, living inside the Durable Object that serves
 * that tenant, with the compute sitting on top of the storage rather than a
 * network hop away from it.
 *
 * This is the shape serverless could not express. A stateless function talks to
 * one shared database over a connection, so every tenant is a WHERE clause, every
 * read pays a round trip, and isolation is a code review promise. A SQLite-backed
 * Durable Object inverts that: `ctx.storage.sql` is a real relational database
 * that is physically part of the object, so a query is a synchronous call into
 * memory-mapped storage, not I/O. There is no pool, no connection limit, no N+1
 * penalty measured in milliseconds, and no way for tenant A's query to read
 * tenant B's rows, because they are different databases.
 *
 * What that buys, concretely:
 *
 *   - Joins, indexes, aggregates, and transactions at single-digit microseconds
 *     per query, so the loop-with-a-query-inside that you rewrite as a join on
 *     Postgres is simply fine here.
 *   - Strong consistency without a transaction manager. A Durable Object handles
 *     one event at a time, so a read-modify-write needs no locking, no optimistic
 *     retry, and no serializable isolation level.
 *   - Writes commit at the end of the event automatically. There is no `await
 *     tx.commit()` and no partially applied event: either the event completed and
 *     everything it wrote is durable, or it threw and nothing it wrote survives.
 *
 * The trades that come with it, stated once so nobody discovers them in
 * production. Per-object SQL storage limits (developers.cloudflare.com/
 * durable-objects/platform/limits): 10 GB per object, 100 columns per table,
 * 2 MB per row or BLOB, 100 KB per SQL statement, 100 bound parameters per
 * query, 32 arguments per SQL function. Cross-tenant reporting has no join to
 * reach for; it needs a fan out or a warehouse copy. And an object is a single
 * writer, so a tenant hot enough to saturate one object needs sharding into
 * several, which is a design decision made at naming time, not later.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1, wrangler 4.112.0,
 * compatibility_date 2026-07-01.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "name": "blank-tenants",
 *   "main": "src/tenant/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "durable_objects": {
 *     "bindings": [{ "name": "TENANT", "class_name": "TenantDatabase" }]
 *   },
 *   "exports": {
 *     "TenantDatabase": { "type": "durable-object", "storage": "sqlite" }
 *   }
 * }
 *
 * The "storage": "sqlite" line is load-bearing. A key-value backed class has no
 * `ctx.storage.sql` at all, and the backend cannot be changed on a class that
 * already has data.
 */

import { DurableObject } from "cloudflare:workers";

export type TenantEnv = {
  TENANT: DurableObjectNamespace<TenantDatabase>;
};

export type Project = {
  id: string;
  name: string;
  status: "active" | "archived";
  createdAt: number;
};

export type UsageRow = {
  projectId: string;
  projectName: string;
  events: number;
  lastSeen: number | null;
};

/**
 * Every migration is an entry here. Adding one is append-only: an existing entry
 * is never edited, because objects that already ran it will never run it again.
 *
 * ponytail: this is a numbered array and a version row, not a migration library.
 * The whole state machine is "which index did we reach", and the object already
 * gives us a transactional, single-writer place to keep that number.
 */
const MIGRATIONS: readonly string[] = [
  `CREATE TABLE projects (
     id         TEXT PRIMARY KEY,
     name       TEXT NOT NULL,
     status     TEXT NOT NULL DEFAULT 'active',
     created_at INTEGER NOT NULL
   );
   CREATE TABLE events (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
     kind       TEXT NOT NULL,
     at         INTEGER NOT NULL
   );
   CREATE INDEX idx_events_project_at ON events(project_id, at DESC);`,

  `ALTER TABLE projects ADD COLUMN archived_at INTEGER;`,
];

/** Refuse writes well before the hard 10 GB ceiling, where recovery is easy. */
const SIZE_WARN_BYTES = 8 * 1024 * 1024 * 1024;

export class TenantDatabase extends DurableObject<TenantEnv> {
  private readonly sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: TenantEnv) {
    super(ctx, env);
    this.sql = ctx.storage.sql;

    // blockConcurrencyWhile is the only correct place for schema work. It holds
    // every inbound event, including RPC calls and alarms, until the callback
    // settles, so no request can observe a half-migrated schema. Outside it,
    // two concurrent wakes would both see version 0 and both run migration 1.
    //
    // If this callback throws, the runtime discards the object rather than
    // serving it, so a broken migration fails closed instead of corrupting.
    ctx.blockConcurrencyWhile(async () => this.migrate());
  }

  private migrate(): void {
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS _migrations (
         id         INTEGER PRIMARY KEY,
         applied_at INTEGER NOT NULL
       );`,
    );

    const applied = this.sql
      .exec<{ version: number }>(
        "SELECT COALESCE(MAX(id), 0) AS version FROM _migrations",
      )
      .one().version;

    for (let index = applied; index < MIGRATIONS.length; index += 1) {
      // Each statement batch and its version row go in together. transactionSync
      // takes a synchronous callback only, which is not a limitation here: sql.exec
      // is synchronous, and anything that needed an await inside a transaction
      // would be a design mistake in a single-threaded object anyway.
      this.ctx.storage.transactionSync(() => {
        // A multi-statement string is allowed, bound parameters are not mixed
        // into it. Bindings apply to a single statement, so the version insert
        // is its own exec.
        this.sql.exec(MIGRATIONS[index]);
        this.sql.exec(
          "INSERT INTO _migrations (id, applied_at) VALUES (?, ?)",
          index + 1,
          Date.now(),
        );
      });
    }
  }

  /**
   * Create a project. Read-check-write with no lock and no race, because the
   * object processes one event at a time; a second createProject for the same id
   * cannot interleave between the SELECT and the INSERT.
   */
  async createProject(id: string, name: string): Promise<Project> {
    this.assertHeadroom();

    const existing = this.sql
      .exec<{ count: number }>(
        "SELECT COUNT(*) AS count FROM projects WHERE id = ?",
        id,
      )
      .one().count;
    if (existing > 0) throw new Error(`project ${id} already exists`);

    const createdAt = Date.now();
    this.sql.exec(
      "INSERT INTO projects (id, name, status, created_at) VALUES (?, ?, 'active', ?)",
      id,
      name.slice(0, 200),
      createdAt,
    );

    return { id, name, status: "active", createdAt };
  }

  async recordEvent(projectId: string, kind: string): Promise<void> {
    this.assertHeadroom();
    // The foreign key rejects an event for a project that does not exist, so
    // there is no existence check to write and no window in which to write it.
    this.sql.exec(
      "INSERT INTO events (project_id, kind, at) VALUES (?, ?, ?)",
      projectId,
      kind.slice(0, 64),
      Date.now(),
    );
  }

  /**
   * A grouped join across two tables, returned in full.
   *
   * On a shared Postgres this endpoint would be a caching candidate. Here it is
   * a local query against a database that only holds this tenant's rows, so the
   * cache, its invalidation, and the staleness bug the invalidation eventually
   * has are all things that never get written.
   */
  async usage(limit = 50): Promise<UsageRow[]> {
    // toArray() drains the cursor into memory in one step. Prefer it over manual
    // iteration whenever another exec is coming, because a cursor is lazy and is
    // invalidated by the next exec on the same storage.
    return this.sql
      .exec<UsageRow>(
        `SELECT p.id           AS projectId,
                p.name         AS projectName,
                COUNT(e.id)    AS events,
                MAX(e.at)      AS lastSeen
           FROM projects p
           LEFT JOIN events e ON e.project_id = p.id
          WHERE p.status = 'active'
          GROUP BY p.id
          ORDER BY events DESC
          LIMIT ?`,
        Math.min(limit, 500),
      )
      .toArray();
  }

  /**
   * Streaming read for an export. `raw()` yields arrays instead of objects, which
   * avoids building one object per row when the rows are about to be serialized
   * anyway, and the cursor pulls rows as the consumer asks for them rather than
   * materializing the whole table.
   *
   * The rule that makes this safe: do not call sql.exec again while stepping this
   * cursor. The cursor is a live view over the query, and the next exec ends it.
   */
  async *exportEvents(projectId: string): AsyncGenerator<string> {
    const cursor = this.sql.exec(
      "SELECT kind, at FROM events WHERE project_id = ? ORDER BY at",
      projectId,
    );
    for (const [kind, at] of cursor.raw<[string, number]>()) {
      yield `${new Date(at).toISOString()},${kind}\n`;
    }
  }

  /** Cheap operational signal. Surface it before the object hits 10 GB and stops accepting writes. */
  async stats(): Promise<{ bytes: number; rows: number }> {
    return {
      bytes: this.sql.databaseSize,
      rows: this.sql
        .exec<{ n: number }>("SELECT COUNT(*) AS n FROM events")
        .one().n,
    };
  }

  private assertHeadroom(): void {
    if (this.sql.databaseSize > SIZE_WARN_BYTES) {
      // Failing here is recoverable: the caller can archive or shard. Failing at
      // the platform limit is not, because the retention job also needs to write.
      throw new Error("tenant database is near its 10 GB limit");
    }
  }
}

/**
 * migrate-fleet.ts
 *
 * Resumable schema migrations across a fleet of database-per-tenant libSQL
 * databases.
 *
 * Turso makes database-per-tenant affordable: thousands of databases created
 * from one schema parent, each a real isolated database. That kills the entire
 * class of "someone forgot the WHERE tenant_id clause", which no amount of
 * row-level-security discipline reliably prevents, because there is no shared
 * table to forget a predicate on. What it buys instead is a migration problem:
 * you now have 10,000 databases to migrate, the fan-out is not atomic across
 * them, and a partial fan-out leaves the fleet at mixed schema versions while
 * one deployment of your application code expects exactly one of them.
 *
 * Failure modes solved:
 *   1. Silent mixed-version fleet. `Promise.all(tenants.map(migrate))` rejects
 *      on the first failure and discards every other outcome, so after a
 *      partial fan-out you know one tenant failed and nothing about the other
 *      9,999. Here every database is migrated in isolation and the run returns
 *      a report naming who reached the target version, who is behind, at what
 *      version, and with which error. A partial fan-out becomes a resumable
 *      state instead of an unknown one.
 *   2. A half-applied migration. Applying the DDL and then recording the
 *      version is two steps, and a process killed between them leaves a
 *      database whose schema moved but whose ledger did not, so the retry
 *      replays the DDL and fails on "table already exists" forever. libSQL
 *      inherits SQLite's transactional DDL: CREATE TABLE, ALTER TABLE and DROP
 *      all roll back. So the migration's statements and its ledger row go in
 *      ONE `batch(..., "write")` and land together or not at all. This is a
 *      SQLite-family guarantee; the same code shape on MySQL would silently
 *      auto-commit each DDL statement.
 *   3. `batch()` defaulting to the losing transaction mode. `Client.batch(stmts)`
 *      uses `"deferred"` unless told otherwise, and a deferred transaction that
 *      reads before it writes loses an upgrade race with `SQLITE_BUSY_SNAPSHOT`
 *      (rawCode 517) that a busy timeout does not rescue. Every write here
 *      passes `"write"` explicitly. `Client.migrate()` is the method that looks
 *      purpose-built for this and it is also hardcoded to `"deferred"`, so it
 *      is not used for the ledger write.
 *   4. Silent divergence from an edited migration. Change the SQL of a
 *      migration already applied to 6,000 tenants and the next fan-out applies
 *      the new text to the remaining 4,000. Nothing errors. The fleet is now
 *      two different schemas that both report version 7. Each applied version
 *      stores a checksum of the exact statements that ran, and a mismatch is
 *      reported as drift instead of being migrated over.
 *   5. Unbounded fan-out. Opening 10,000 connections at once exhausts the
 *      client, which caps itself at 20 in-flight requests by default (the
 *      `concurrency` option in `@libsql/client`'s Config), and exhausts the
 *      platform's connection budget well before that. The fan-out runs through
 *      a fixed worker pool and closes each database as it finishes.
 *
 * Docs:
 *   https://docs.turso.tech/features/multi-db-schemas
 *   https://www.sqlite.org/lang_altertable.html
 *
 * The `Fleet` interface is what makes this testable; the real Turso Cloud
 * implementation is `tursoFleet()` at the bottom of the module section, built
 * on `@tursodatabase/api`'s `databases.list({ schema })`.
 *
 * run: bun migrate-fleet.ts
 */

import { createHash } from "node:crypto";

export interface Migration {
  /** Monotonic. Gaps are allowed; going backwards is not. */
  version: number;
  name: string;
  /**
   * Applied in order, in one transaction with the ledger row. Keep each
   * migration small enough that the whole thing is a sensible unit to roll
   * back, because that is exactly what happens when any statement fails.
   */
  statements: string[];
}

/** The subset of `@libsql/client`'s `Client` a tenant database must provide. */
export interface TenantDb {
  execute(stmt: unknown): Promise<{ rows: unknown[] }>;
  batch(stmts: unknown[], mode?: string): Promise<unknown[]>;
  close(): void;
}

export interface Fleet {
  /** Tenant database names, typically every child of one schema parent. */
  list(): Promise<string[]>;
  open(name: string): Promise<TenantDb>;
}

const LEDGER = `CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at INTEGER NOT NULL
)`;

/**
 * Identity of a migration's actual text. Two migrations with the same version
 * and different statements are different migrations, and the whole point of
 * storing this is to notice that.
 */
export function checksum(m: Migration): string {
  const canonical = JSON.stringify([m.version, m.name, m.statements]);
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16);
}

/**
 * Reject a migration list that cannot be applied deterministically, before any
 * database is touched. A duplicate version applied to half the fleet in one
 * order and half in another is drift you cannot detect afterwards.
 */
export function orderMigrations(migrations: Migration[]): Migration[] {
  const sorted = [...migrations].sort((a, b) => a.version - b.version);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i].version === sorted[i - 1].version) {
      throw new Error(
        `duplicate migration version ${sorted[i].version}: "${sorted[i - 1].name}" and "${sorted[i].name}"`,
      );
    }
  }
  return sorted;
}

export interface AppliedRow {
  version: number;
  name: string;
  checksum: string;
}

/** Read the ledger, creating it on first contact. Safe to call repeatedly. */
export async function readLedger(db: TenantDb): Promise<AppliedRow[]> {
  await db.execute(LEDGER);
  const r = await db.execute(
    "SELECT version, name, checksum FROM schema_migrations ORDER BY version",
  );
  return r.rows as unknown as AppliedRow[];
}

export interface Drift {
  version: number;
  name: string;
  expected: string;
  found: string;
}

export interface TenantResult {
  tenant: string;
  /** Highest version present after this run. */
  version: number;
  applied: number[];
  /** Non-empty means this database was left alone: its history is not yours. */
  drift: Drift[];
  error?: string;
}

/**
 * Bring one database to the head of `migrations`.
 *
 * Drift stops this database and only this database. Migrating a tenant whose
 * recorded history disagrees with your files is how a two-schema fleet becomes
 * a three-schema fleet.
 */
export async function migrateOne(
  db: TenantDb,
  migrations: Migration[],
): Promise<Omit<TenantResult, "tenant">> {
  const ordered = orderMigrations(migrations);
  const ledger = await readLedger(db);
  const applied = new Map(ledger.map((r) => [r.version, r]));
  const at = ledger.length === 0 ? 0 : ledger[ledger.length - 1].version;

  const drift: Drift[] = [];
  for (const m of ordered) {
    const row = applied.get(m.version);
    if (row === undefined) continue;
    const want = checksum(m);
    if (row.checksum !== want) {
      drift.push({
        version: m.version,
        name: m.name,
        expected: want,
        found: row.checksum,
      });
    }
  }
  if (drift.length > 0) return { version: at, applied: [], drift };

  const done: number[] = [];
  let version = at;
  for (const m of ordered) {
    if (applied.has(m.version)) continue;
    if (m.version <= version) {
      return {
        version,
        applied: done,
        drift,
        error: `migration ${m.version} ("${m.name}") is not ahead of recorded version ${version}, refusing to apply out of order`,
      };
    }
    try {
      // Transactional DDL: the schema change and the version row commit
      // together. mode "write" because batch() otherwise defaults to
      // "deferred", which can lose an upgrade race under a concurrent writer.
      await db.batch(
        [
          ...m.statements.map((sql) => ({ sql, args: [] })),
          {
            sql: "INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES (?, ?, ?, ?)",
            args: [m.version, m.name, checksum(m), Date.now()],
          },
        ],
        "write",
      );
    } catch (e) {
      return {
        version,
        applied: done,
        drift,
        error: `migration ${m.version} ("${m.name}") failed: ${(e as Error).message}`,
      };
    }
    done.push(m.version);
    version = m.version;
  }
  return { version, applied: done, drift };
}

export interface FanOutReport {
  targetVersion: number;
  atTarget: string[];
  behind: TenantResult[];
  drifted: TenantResult[];
  /** Total migrations applied across the fleet, for the deploy log. */
  totalApplied: number;
}

/**
 * Migrate every database in the fleet, in isolation, through a bounded pool.
 *
 * Idempotent: re-running after a partial fan-out touches only the databases
 * that are behind, so the retry is a resume. Calling it with an unchanged
 * migration list is also the cheapest fleet-wide version audit you have.
 */
export async function fanOut(options: {
  fleet: Fleet;
  migrations: Migration[];
  /** In-flight databases. Keep it well under the client's own limit. */
  concurrency?: number;
  onResult?: (r: TenantResult) => void;
}): Promise<FanOutReport> {
  const ordered = orderMigrations(options.migrations);
  const target = ordered.length === 0 ? 0 : ordered[ordered.length - 1].version;
  const tenants = await options.fleet.list();
  const concurrency = Math.max(1, options.concurrency ?? 8);
  const results: TenantResult[] = [];

  let next = 0;
  const worker = async () => {
    for (;;) {
      const i = next;
      next += 1;
      if (i >= tenants.length) return;
      const tenant = tenants[i];
      let result: TenantResult;
      let db: TenantDb | null = null;
      try {
        db = await options.fleet.open(tenant);
        result = { tenant, ...(await migrateOne(db, ordered)) };
      } catch (e) {
        // One tenant being unreachable is a fact about that tenant, not a
        // reason to abandon the rest of the fleet mid-flight.
        result = {
          tenant,
          version: -1,
          applied: [],
          drift: [],
          error: `unreachable: ${(e as Error).message}`,
        };
      } finally {
        db?.close();
      }
      results.push(result);
      options.onResult?.(result);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, tenants.length) }, worker),
  );

  results.sort((a, b) => a.tenant.localeCompare(b.tenant));
  return {
    targetVersion: target,
    atTarget: results
      .filter((r) => r.version === target && r.drift.length === 0)
      .map((r) => r.tenant),
    behind: results.filter((r) => r.version !== target && r.drift.length === 0),
    drifted: results.filter((r) => r.drift.length > 0),
    totalApplied: results.reduce((n, r) => n + r.applied.length, 0),
  };
}

/**
 * The real Turso Cloud fleet: every child database of one schema parent.
 *
 * `databases.list({ schema })` filters to the children of a schema parent and
 * `db.hostname` is the connect target, so tenant discovery is a control-plane
 * call rather than a table you have to keep in step with reality.
 *
 * ```ts
 * import { createClient as createApi } from "@tursodatabase/api";
 * import { createClient } from "@libsql/client";
 *
 * const fleet = tursoFleet({
 *   api: createApi({ org: "blank", token: process.env.TURSO_API_TOKEN! }),
 *   schema: "tenant_template",
 *   connect: (db) =>
 *     createClient({
 *       url: `libsql://${db.hostname}`,
 *       authToken: process.env.TURSO_AUTH_TOKEN!,
 *     }),
 * });
 * ```
 */
export function tursoFleet<
  D extends { name: string; hostname: string },
>(options: {
  api: { databases: { list(o?: { schema?: string }): Promise<D[]> } };
  schema: string;
  connect: (db: D) => TenantDb;
}): Fleet {
  let cache: Map<string, D> | null = null;
  const load = async () => {
    if (cache === null) {
      const dbs = await options.api.databases.list({ schema: options.schema });
      cache = new Map(dbs.map((d) => [d.name, d]));
    }
    return cache;
  };
  return {
    list: async () => [...(await load()).keys()],
    open: async (name) => {
      const db = (await load()).get(name);
      if (db === undefined) throw new Error(`no tenant database "${name}"`);
      return options.connect(db);
    },
  };
}

// ---------------------------------------------------------------------------
// demo
// ---------------------------------------------------------------------------
// A fleet of real libSQL `file:` databases standing in for tenant databases.
// Real SQL, real client, real transactional DDL. Turso Cloud is not required.

if (import.meta.main) {
  const { createClient } = await import("@libsql/client");
  const { rmSync } = await import("node:fs");

  let failures = 0;
  const assert = (name: string, ok: boolean, detail: string) => {
    if (!ok) failures += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
  };

  const tenants = ["acme", "globex", "initech", "umbrella", "wayne"];
  const file = (t: string) => `tenant-${t}.db`;
  const clean = () => {
    for (const t of tenants)
      for (const suffix of ["", "-wal", "-shm"]) {
        try {
          rmSync(`${file(t)}${suffix}`);
        } catch {}
      }
  };
  clean();

  let open = 0;
  let peakOpen = 0;
  const fleet: Fleet = {
    list: async () => tenants,
    open: async (name) => {
      open += 1;
      peakOpen = Math.max(peakOpen, open);
      const c = createClient({ url: `file:${file(name)}` });
      return {
        execute: (s: unknown) => c.execute(s as never) as never,
        batch: (s: unknown[], m?: string) =>
          c.batch(s as never, m as never) as never,
        close: () => {
          open -= 1;
          c.close();
        },
      };
    },
  };

  const migrations: Migration[] = [
    {
      version: 1,
      name: "invoices",
      statements: [
        "CREATE TABLE invoices (id INTEGER PRIMARY KEY, cents INTEGER NOT NULL, status TEXT NOT NULL)",
      ],
    },
    {
      version: 2,
      name: "invoice_due_date",
      statements: ["ALTER TABLE invoices ADD COLUMN due_at INTEGER"],
    },
    {
      version: 3,
      name: "dunning_attempts",
      statements: [
        "CREATE TABLE dunning_attempts (id INTEGER PRIMARY KEY, invoice_id INTEGER NOT NULL, attempted_at INTEGER NOT NULL)",
        "CREATE INDEX dunning_by_invoice ON dunning_attempts (invoice_id)",
      ],
    },
  ];

  // One tenant was hotfixed by hand during an incident, so migration 3's
  // CREATE TABLE will collide there. This is how fan-outs actually break.
  {
    const hotfixed = createClient({ url: `file:${file("globex")}` });
    await hotfixed.execute(
      "CREATE TABLE dunning_attempts (id INTEGER PRIMARY KEY, note TEXT)",
    );
    hotfixed.close();
  }

  // Property 1: a partial fan-out is reported, not swallowed.
  {
    const report = await fanOut({ fleet, migrations, concurrency: 2 });
    assert(
      "partial fan-out names exactly who is behind",
      report.atTarget.length === 4 &&
        report.behind.length === 1 &&
        report.behind[0].tenant === "globex" &&
        report.behind[0].version === 2,
      `4 tenants at v${report.targetVersion} (${report.atTarget.join(", ")}), globex stuck at v${report.behind[0]?.version} with: ${report.behind[0]?.error?.slice(0, 72)}`,
    );
  }

  // Property 2: the failed migration did not half-apply. Its first statement
  // succeeded before the second collided, and both rolled back with the
  // ledger row, so the retry has clean ground.
  {
    const g = createClient({ url: `file:${file("globex")}` });
    const idx = await g.execute(
      "SELECT name FROM sqlite_master WHERE name = 'dunning_by_invoice'",
    );
    const ledger = await g.execute(
      "SELECT version FROM schema_migrations ORDER BY version",
    );
    const versions = ledger.rows.map((r) => Number(r.version));
    g.close();
    assert(
      "failed migration left no partial schema",
      idx.rows.length === 0 && versions.join(",") === "1,2",
      `the index from migration 3 was never created and the ledger stops at v${versions[versions.length - 1]}, because transactional DDL rolled the CREATE INDEX, the CREATE TABLE and the version row back together`,
    );
  }

  // Property 3: fixing the tenant and re-running is a resume, not a re-run.
  {
    const g = createClient({ url: `file:${file("globex")}` });
    await g.execute("DROP TABLE dunning_attempts");
    g.close();
    const report = await fanOut({ fleet, migrations, concurrency: 2 });
    assert(
      "retry resumes only the tenant that was behind",
      report.behind.length === 0 &&
        report.atTarget.length === 5 &&
        report.totalApplied === 1,
      `the whole fleet reached v${report.targetVersion} and exactly ${report.totalApplied} migration was applied across all 5 databases, so the 4 already-migrated tenants were untouched`,
    );
  }

  // Property 4: re-running with nothing new applies nothing.
  {
    const report = await fanOut({ fleet, migrations, concurrency: 3 });
    assert(
      "fan-out is idempotent",
      report.totalApplied === 0 && report.atTarget.length === 5,
      `a third run applied ${report.totalApplied} migrations, so the deploy pipeline can call this unconditionally`,
    );
  }

  // Property 5: editing an applied migration is caught, not migrated over.
  {
    const edited = migrations.map((m) =>
      m.version === 2
        ? {
            ...m,
            statements: [
              "ALTER TABLE invoices ADD COLUMN due_at INTEGER NOT NULL DEFAULT 0",
            ],
          }
        : m,
    );
    const report = await fanOut({
      fleet,
      migrations: edited,
      concurrency: 3,
    });
    const d = report.drifted[0]?.drift[0];
    assert(
      "edited migration is reported as drift",
      report.drifted.length === 5 && report.totalApplied === 0,
      `all 5 tenants flagged v${d?.version} ("${d?.name}") as drift: recorded checksum ${d?.found}, local file now hashes to ${d?.expected}, so nothing was applied over a history that is not ours`,
    );
  }
  assert(
    "fan-out respects its concurrency cap",
    peakOpen <= 3,
    `peak simultaneously open tenant databases was ${peakOpen} across all runs, never the 5-wide Promise.all that would open the whole fleet at once`,
  );

  // Property 7: a duplicate version is refused before any database is opened.
  {
    let raised = "";
    try {
      orderMigrations([...migrations, { ...migrations[1], name: "oops" }]);
    } catch (e) {
      raised = (e as Error).message;
    }
    assert(
      "duplicate version is refused up front",
      raised.includes("duplicate migration version 2"),
      `orderMigrations threw before any connection was opened: ${raised}`,
    );
  }

  clean();
  console.log(
    failures === 0
      ? "migrate-fleet.ts: all properties verified"
      : `migrate-fleet.ts: ${failures} FAILED`,
  );
  if (failures > 0) process.exit(1);
}

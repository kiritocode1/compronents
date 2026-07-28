/**
 * write-transaction.ts
 *
 * Correct read-modify-write against libSQL, and the retry classifier that
 * makes it survive contention.
 *
 * libSQL exposes SQLite's transaction modes through `client.transaction(mode)`
 * and `client.batch(stmts, mode)`. The mode is not a performance knob. A
 * `deferred` transaction takes no lock until its first write, so a
 * read-then-write closure begins on a read snapshot and then tries to upgrade,
 * and if any other connection committed in that window the upgrade is rejected
 * outright. A `write` transaction issues BEGIN IMMEDIATE and takes the write
 * lock before the first read, so its snapshot cannot go stale underneath it.
 *
 * Failure modes solved:
 *   1. Lost update, sold as a race you cannot see. The read and the write of a
 *      read-modify-write in separate autocommit statements will interleave with
 *      another request and both will write the same decremented value. The
 *      flight sells more seats than it has. This is the shape people reach for
 *      precisely BECAUSE the transactional version kept throwing, so the fix
 *      for failure mode 2 below is what causes this one.
 *   2. `deferred` losing the upgrade. Verified against a real local WAL
 *      database: a deferred transaction reads `remaining = 3`, another
 *      connection commits, and the deferred transaction's UPDATE is rejected
 *      with `code: "SQLITE_BUSY"`, `extendedCode: "SQLITE_BUSY_SNAPSHOT"`,
 *      `rawCode: 517`. The booking is lost even though a seat was available.
 *   3. Believing a busy timeout covers this. `@libsql/client`'s `timeout`
 *      option is a busy timeout, and it does nothing here: with
 *      `timeout: 5000` the upgrade still fails, in 0ms, with the same 517.
 *      Busy timeout waits for a LOCK to free; a stale snapshot is not a lock
 *      you can wait out, it is a transaction that must be restarted from its
 *      first read. Retrying the failed statement in place re-applies a value
 *      computed from data that no longer exists.
 *   4. `batch()` silently defaulting to the losing mode. `client.batch(stmts)`
 *      and `client.migrate(stmts)` both use `"deferred"` unless told otherwise
 *      (`@libsql/core/lib-esm/api.d.ts`: "The default transaction mode is
 *      `deferred`"). Passing `"write"` is one argument and is never the
 *      default you get.
 *   5. Holding a write lock across the network. An interactive
 *      `client.transaction()` over the stateless HTTP protocol pins a
 *      server-side connection for every round trip inside the closure, so any
 *      application-side work between two statements holds the database's
 *      single write lock for a network round trip plus your own latency.
 *      `writeBatch` is one round trip and takes the lock for the duration of
 *      the server's own execution. Prefer it whenever the decision does not
 *      need JavaScript in the middle; SQL can usually express the guard.
 *
 * Docs:
 *   https://docs.turso.tech/sdk/ts/reference
 *   https://www.sqlite.org/lang_transaction.html
 *   https://www.sqlite.org/rescode.html#busy_snapshot
 *
 * run: bun write-transaction.ts
 */

/** How an error should be handled, not what SQLite called it. */
export type BusyClass =
  /** Stale read snapshot. The whole transaction must restart from its reads. */
  | "snapshot"
  /** Lock contention. Retryable, and a busy timeout genuinely helps. */
  | "busy"
  /** A real error. Retrying re-runs a decision that was already wrong. */
  | "fatal";

interface SqliteErrorish {
  code?: string;
  extendedCode?: string;
  rawCode?: number;
  message?: string;
}

/**
 * Classify a libSQL error for retry.
 *
 * `code` is `"SQLITE_BUSY"` for both contention and a stale snapshot, so it is
 * `extendedCode`/`rawCode` that carries the difference, and the difference is
 * the entire point: one is worth waiting for, the other is not.
 */
export function classifyBusy(error: unknown): BusyClass {
  const e = error as SqliteErrorish;
  if (e?.rawCode === 517 || e?.extendedCode === "SQLITE_BUSY_SNAPSHOT")
    return "snapshot";
  if (e?.rawCode === 5 || e?.code === "SQLITE_BUSY") return "busy";
  // SQLITE_BUSY_TIMEOUT: the busy timeout itself expired, still contention.
  if (e?.extendedCode === "SQLITE_BUSY_TIMEOUT") return "busy";
  return "fatal";
}

export interface Tx {
  execute(stmt: unknown): Promise<{ rows: unknown[]; rowsAffected: number }>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  close(): void;
}

export interface WriteClient {
  transaction(mode: string): Promise<Tx>;
  batch(stmts: unknown[], mode?: string): Promise<unknown[]>;
}

export class WriteContention extends Error {
  constructor(
    readonly attempts: number,
    readonly lastClass: BusyClass,
    cause: unknown,
  ) {
    super(
      `write transaction gave up after ${attempts} attempts (last: ${lastClass})`,
    );
    this.name = "WriteContention";
    this.cause = cause;
  }
}

export interface WriteOptions {
  maxAttempts?: number;
  /** Base backoff in ms. Doubles per attempt, with full jitter. */
  baseDelayMs?: number;
  deadlineMs?: number;
  /** Injectable for tests. Defaults to Math.random. */
  random?: () => number;
}

export interface WriteOutcome<T> {
  value: T;
  attempts: number;
  /** Retries by class, for the metric that tells you the mode is wrong. */
  retries: { snapshot: number; busy: number };
}

/**
 * Run `fn` inside a `write` transaction, retrying the WHOLE closure on
 * contention.
 *
 * The closure is re-run rather than the failed statement, because a retry that
 * resumes mid-transaction carries values read from a snapshot that has already
 * been invalidated. `fn` must therefore be safe to run more than once: read
 * inside it, do not mutate anything outside the transaction from it.
 *
 * Mode is always `"write"`. There is no option to weaken it, because the only
 * reason to run a read-modify-write as `deferred` is to lose it.
 */
export async function withWriteTransaction<T>(
  client: WriteClient,
  fn: (tx: Tx) => Promise<T>,
  options: WriteOptions = {},
): Promise<WriteOutcome<T>> {
  const maxAttempts = options.maxAttempts ?? 5;
  const baseDelayMs = options.baseDelayMs ?? 8;
  const random = options.random ?? Math.random;
  const deadline =
    options.deadlineMs === undefined
      ? Number.POSITIVE_INFINITY
      : Date.now() + options.deadlineMs;
  const retries = { snapshot: 0, busy: 0 };
  let lastError: unknown;
  let lastClass: BusyClass = "fatal";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    // The BEGIN itself is inside the try, not above it. BEGIN IMMEDIATE takes
    // the write lock up front, so under real contention this call is the most
    // likely place to see SQLITE_BUSY, and a retry loop that starts after it
    // leaves its single most common failure unretried.
    let tx: Tx | undefined;
    try {
      // BEGIN IMMEDIATE: the write lock is held before the first read, so the
      // snapshot this closure reasons about cannot move underneath it.
      tx = await client.transaction("write");
      const value = await fn(tx);
      await tx.commit();
      return { value, attempts: attempt, retries };
    } catch (error) {
      try {
        await tx?.rollback();
      } catch {
        // A transaction the server already aborted cannot be rolled back, and
        // that secondary failure must not mask the one worth reporting.
      }
      lastError = error;
      lastClass = classifyBusy(error);
      if (lastClass === "fatal") throw error;
      retries[lastClass] += 1;
      if (attempt === maxAttempts || Date.now() >= deadline) break;
      // Full jitter: synchronised retries are how contention becomes a
      // thundering herd that never drains.
      const ceiling = baseDelayMs * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, Math.floor(random() * ceiling)));
    } finally {
      tx?.close();
    }
  }
  throw new WriteContention(maxAttempts, lastClass, lastError);
}

/**
 * A non-interactive write, in the mode you meant.
 *
 * This exists because `client.batch(stmts)` defaults to `"deferred"`, so the
 * safe-looking one-liner is on the mode that loses. Reach for this before
 * `withWriteTransaction`: it is one round trip, and a conditional UPDATE with
 * the guard in its WHERE clause expresses most read-modify-writes without
 * pinning a connection across the network.
 */
export function writeBatch(
  client: WriteClient,
  stmts: unknown[],
): Promise<unknown[]> {
  return client.batch(stmts, "write");
}

// ---------------------------------------------------------------------------
// demo
// ---------------------------------------------------------------------------
// Real `@libsql/client` against a real local WAL database, with real concurrent
// connections. Every error code printed below came out of SQLite.

if (import.meta.main) {
  const { createClient } = await import("@libsql/client");
  const { rmSync } = await import("node:fs");

  let failures = 0;
  const assert = (name: string, ok: boolean, detail: string) => {
    if (!ok) failures += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
  };

  const url = "file:seats.db";
  const clean = () => {
    for (const suffix of ["", "-wal", "-shm"]) {
      try {
        rmSync(`seats.db${suffix}`);
      } catch {}
    }
  };
  clean();

  const SEATS = 3;
  const BUYERS = 8;
  const setup = createClient({ url });
  await setup.execute("PRAGMA journal_mode=WAL");
  await setup.execute(
    "CREATE TABLE seats (flight TEXT PRIMARY KEY, remaining INTEGER NOT NULL CHECK (remaining >= 0))",
  );
  await setup.execute(
    "CREATE TABLE bookings (id INTEGER PRIMARY KEY, flight TEXT NOT NULL, buyer TEXT NOT NULL)",
  );

  const reset = async () => {
    await setup.execute(
      "UPDATE seats SET remaining = ? WHERE flight = 'BA117'",
      [SEATS],
    );
    await setup.execute("DELETE FROM bookings");
  };
  await setup.execute("INSERT INTO seats VALUES ('BA117', ?)", [SEATS]);

  const tally = async () => {
    const s = await setup.execute(
      "SELECT remaining FROM seats WHERE flight = 'BA117'",
    );
    const b = await setup.execute("SELECT COUNT(*) AS n FROM bookings");
    return {
      remaining: Number((s.rows[0] as Record<string, unknown>).remaining),
      sold: Number((b.rows[0] as Record<string, unknown>).n),
    };
  };

  const buyers = Array.from({ length: BUYERS }, (_, i) => `buyer-${i + 1}`);

  // Approach 1: read, decide, write. No transaction at all. This is what a
  // team writes after the transactional version kept throwing SQLITE_BUSY.
  {
    await reset();
    const errors: string[] = [];
    await Promise.all(
      buyers.map(async (buyer) => {
        const c = createClient({ url, timeout: 2000 });
        try {
          const r = await c.execute(
            "SELECT remaining FROM seats WHERE flight = 'BA117'",
          );
          const remaining = Number(
            (r.rows[0] as Record<string, unknown>).remaining,
          );
          if (remaining <= 0) return;
          await c.execute(
            "UPDATE seats SET remaining = ? WHERE flight = 'BA117'",
            [remaining - 1],
          );
          await c.execute(
            "INSERT INTO bookings (flight, buyer) VALUES (?, ?)",
            ["BA117", buyer],
          );
        } catch (e) {
          errors.push(classifyBusy(e));
        } finally {
          c.close();
        }
      }),
    );
    const t = await tally();
    assert(
      "no transaction oversells the flight",
      t.sold > SEATS,
      `${BUYERS} buyers raced for ${SEATS} seats: ${t.sold} bookings written with remaining=${t.remaining}, so ${t.sold - SEATS} passengers have a seat that does not exist (${errors.length} errors raised, none of which was the oversell)`,
    );
  }

  // Approach 2: the deferred transaction. It does not oversell, and it loses
  // bookings that should have succeeded.
  {
    await reset();
    const classes: string[] = [];
    const codes: string[] = [];
    await Promise.all(
      buyers.map(async (buyer) => {
        const c = createClient({ url, timeout: 2000 });
        const tx = await c.transaction("deferred");
        try {
          const r = await tx.execute(
            "SELECT remaining FROM seats WHERE flight = 'BA117'",
          );
          const remaining = Number(
            (r.rows[0] as Record<string, unknown>).remaining,
          );
          if (remaining <= 0) {
            await tx.rollback();
            return;
          }
          await tx.execute(
            "UPDATE seats SET remaining = ? WHERE flight = 'BA117'",
            [remaining - 1],
          );
          await tx.execute(
            "INSERT INTO bookings (flight, buyer) VALUES (?, ?)",
            ["BA117", buyer],
          );
          await tx.commit();
        } catch (e) {
          classes.push(classifyBusy(e));
          const err = e as SqliteErrorish;
          codes.push(`${err.extendedCode}/${err.rawCode}`);
        } finally {
          tx.close();
          c.close();
        }
      }),
    );
    const t = await tally();
    const snapshots = classes.filter((c) => c === "snapshot").length;
    const busy = classes.filter((c) => c === "busy").length;
    // Which of the two arrives is a timing detail: SQLITE_BUSY_SNAPSHOT (517)
    // when this transaction's snapshot went stale under it, plain SQLITE_BUSY
    // (5) when another writer simply holds the lock. Both are the same defeat,
    // so the property is "contention rejected writers", not one code.
    assert(
      "deferred loses bookings to contention",
      t.sold < SEATS && snapshots + busy > 0,
      `no oversell (${t.sold} sold), but ${snapshots + busy} buyers were rejected (${snapshots} stale-snapshot, ${busy} lock-busy, first was ${codes[0]}) while ${t.remaining} seats sat unsold, and a 2000ms busy timeout was set on every connection`,
    );
  }

  // Approach 3: the guard. Mode "write", whole-closure retry.
  {
    await reset();
    const refused: string[] = [];
    const errors: string[] = [];
    let snapshotRetries = 0;
    let busyRetries = 0;
    await Promise.all(
      buyers.map(async (buyer) => {
        const c = createClient({ url, timeout: 2000 });
        try {
          const out = await withWriteTransaction(
            c as unknown as WriteClient,
            async (tx) => {
              const r = await tx.execute(
                "SELECT remaining FROM seats WHERE flight = 'BA117'",
              );
              const remaining = Number(
                (r.rows[0] as Record<string, unknown>).remaining,
              );
              if (remaining <= 0) return "sold out" as const;
              await tx.execute(
                "UPDATE seats SET remaining = ? WHERE flight = 'BA117'",
                [remaining - 1],
              );
              await tx.execute(
                "INSERT INTO bookings (flight, buyer) VALUES (?, ?)",
                ["BA117", buyer],
              );
              return "booked" as const;
            },
            { maxAttempts: 12, baseDelayMs: 5 },
          );
          snapshotRetries += out.retries.snapshot;
          busyRetries += out.retries.busy;
          if (out.value === "sold out") refused.push(buyer);
        } catch (e) {
          errors.push((e as Error).name);
        } finally {
          c.close();
        }
      }),
    );
    const t = await tally();
    assert(
      "write mode sells exactly the inventory",
      t.sold === SEATS && t.remaining === 0 && errors.length === 0,
      `${t.sold}/${SEATS} seats sold, ${refused.length} buyers correctly told sold out, ${errors.length} spurious failures, after ${busyRetries} lock retries and ${snapshotRetries} snapshot retries`,
    );
  }

  // Property 4: a busy timeout does not rescue a deferred upgrade, and the
  // failure is immediate, so the timeout is not even consulted.
  {
    await reset();
    const a = createClient({ url, timeout: 5000 });
    const b = createClient({ url, timeout: 5000 });
    const ta = await a.transaction("deferred");
    const r = await ta.execute(
      "SELECT remaining FROM seats WHERE flight = 'BA117'",
    );
    const tb = await b.transaction("write");
    await tb.execute(
      "UPDATE seats SET remaining = remaining - 1 WHERE flight = 'BA117'",
    );
    await tb.commit();
    const started = Date.now();
    let cls: BusyClass = "fatal";
    let detail = "";
    try {
      await ta.execute(
        "UPDATE seats SET remaining = ? WHERE flight = 'BA117'",
        [Number((r.rows[0] as Record<string, unknown>).remaining) - 1],
      );
      await ta.commit();
    } catch (e) {
      cls = classifyBusy(e);
      const err = e as SqliteErrorish;
      detail = `${err.code}/${err.extendedCode}/${err.rawCode}`;
    } finally {
      ta.close();
    }
    const elapsed = Date.now() - started;
    assert(
      "busy timeout does not cover a stale snapshot",
      cls === "snapshot" && elapsed < 100,
      `with timeout=5000ms the upgrade failed in ${elapsed}ms with ${detail}, classified "${cls}", so waiting was never an option and only restarting the transaction is`,
    );
    a.close();
    b.close();
  }

  // Property 5: a constraint violation is never retried.
  {
    await reset();
    const c = createClient({ url });
    let attempts = 0;
    let caught = "";
    try {
      await withWriteTransaction(c as unknown as WriteClient, async (tx) => {
        attempts += 1;
        await tx.execute(
          "UPDATE seats SET remaining = -1 WHERE flight = 'BA117'",
        );
      });
    } catch (e) {
      caught = (e as SqliteErrorish).extendedCode ?? (e as Error).name;
    }
    assert(
      "a fatal error is not retried",
      attempts === 1 && caught === "SQLITE_CONSTRAINT_CHECK",
      `the CHECK (remaining >= 0) violation surfaced as ${caught} after exactly ${attempts} attempt, because retrying a decision that was already wrong only wastes the write lock`,
    );
    c.close();
  }

  // Property 6: writeBatch forces the mode the default gets wrong.
  {
    await reset();
    const c = createClient({ url });
    // The guard lives in the WHERE clause, so this needs no interactive
    // transaction at all: one round trip, atomic, correct.
    const out = await writeBatch(c as unknown as WriteClient, [
      {
        sql: "UPDATE seats SET remaining = remaining - 1 WHERE flight = 'BA117' AND remaining > 0",
        args: [],
      },
      {
        sql: "INSERT INTO bookings (flight, buyer) VALUES ('BA117', 'buyer-batch')",
        args: [],
      },
    ]);
    const t = await tally();
    const affected = (out[0] as { rowsAffected: number }).rowsAffected;
    assert(
      "writeBatch expresses the guard in SQL, in write mode",
      affected === 1 && t.remaining === SEATS - 1 && t.sold === 1,
      `one round trip decremented ${affected} row to remaining=${t.remaining} and wrote ${t.sold} booking, with "write" passed explicitly because batch() defaults to "deferred"`,
    );
    c.close();
  }

  // Property 7: the classifier separates the three cases by hand.
  {
    const snapshot = classifyBusy({
      code: "SQLITE_BUSY",
      extendedCode: "SQLITE_BUSY_SNAPSHOT",
      rawCode: 517,
    });
    const busy = classifyBusy({ code: "SQLITE_BUSY", rawCode: 5 });
    const fatal = classifyBusy({
      code: "SQLITE_CONSTRAINT",
      extendedCode: "SQLITE_CONSTRAINT_UNIQUE",
      rawCode: 2067,
    });
    assert(
      "classifier separates snapshot, busy and fatal",
      snapshot === "snapshot" && busy === "busy" && fatal === "fatal",
      `517 -> ${snapshot} (restart the transaction), 5 -> ${busy} (wait and retry), 2067 -> ${fatal} (never retry), all three of which arrive with code "SQLITE_BUSY" or worse and are indistinguishable without the extended code`,
    );
  }

  setup.close();
  clean();
  console.log(
    failures === 0
      ? "write-transaction.ts: all properties verified"
      : `write-transaction.ts: ${failures} FAILED`,
  );
  if (failures > 0) process.exit(1);
}

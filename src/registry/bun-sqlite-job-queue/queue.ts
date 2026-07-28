/**
 * queue.ts: durable job queue on bun:sqlite with a Worker-thread consumer pool.
 *
 * BullMQ semantics without Redis: visibility timeouts (a crashed worker's job
 * becomes claimable again), retries with exponential backoff, a dead-letter
 * table after max attempts, atomic claims via UPDATE...RETURNING, and WAL mode
 * so N worker threads share one .db file safely. Zero npm deps: bun:sqlite for
 * storage and the Worker global for the consumer pool, both ship in Bun.
 *
 * run:
 *   bun queue.ts            (runs the built-in self-test: pool of 3 workers,
 *                            happy jobs, a flaky job, a poison job -> dead letter)
 *
 * library:
 *   import { JobQueue } from "./queue";
 *   const q = new JobQueue("jobs.db");
 *   q.enqueue("send-email", { to: "a@b.c" }, { maxAttempts: 5 });
 *   q.work("./handlers.ts", { concurrency: 4 });   handlers.ts exports:
 *     export const handlers = { "send-email": async (payload, job) => {...} };
 */

import { Database } from "bun:sqlite";

declare var self: Worker;

export interface Job {
  id: number;
  name: string;
  payload: string;
  state: string;
  attempts: number;
  max_attempts: number;
  visible_at: number;
  visibility_timeout: number;
  base_delay_ms: number;
  result: string | null;
  error: string | null;
}

function openDb(path: string): Database {
  const db = new Database(path, { create: true });
  db.run("PRAGMA journal_mode=WAL");
  db.run("PRAGMA busy_timeout=5000");
  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    payload TEXT NOT NULL DEFAULT '{}',
    state TEXT NOT NULL DEFAULT 'ready',
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    visible_at REAL NOT NULL DEFAULT 0,
    visibility_timeout REAL NOT NULL DEFAULT 30,
    base_delay_ms INTEGER NOT NULL DEFAULT 1000,
    result TEXT,
    error TEXT,
    created_at REAL NOT NULL DEFAULT (unixepoch('subsec'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS dead_letters (
    id INTEGER PRIMARY KEY,
    job_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    payload TEXT NOT NULL,
    attempts INTEGER NOT NULL,
    error TEXT,
    died_at REAL NOT NULL DEFAULT (unixepoch('subsec'))
  )`);
  db.run(
    "CREATE INDEX IF NOT EXISTS idx_jobs_claim ON jobs(state, visible_at)",
  );
  return db;
}

export class JobQueue {
  db: Database;
  #workers: Worker[] = [];

  constructor(public path: string) {
    this.db = openDb(path);
  }

  enqueue(
    name: string,
    payload: unknown = {},
    opts: {
      maxAttempts?: number;
      delayMs?: number;
      visibilityTimeoutSec?: number;
      baseDelayMs?: number;
    } = {},
  ): number {
    const row = this.db
      .query(
        `INSERT INTO jobs (name, payload, max_attempts, visible_at, visibility_timeout, base_delay_ms)
         VALUES (?, ?, ?, unixepoch('subsec') + ?, ?, ?) RETURNING id`,
      )
      .get(
        name,
        JSON.stringify(payload),
        opts.maxAttempts ?? 3,
        (opts.delayMs ?? 0) / 1000,
        opts.visibilityTimeoutSec ?? 30,
        opts.baseDelayMs ?? 1000,
      ) as { id: number };
    return row.id;
  }

  /**
   * Atomically claim the next runnable job. A job is runnable when it is
   * 'ready', or 'active' past its visibility deadline (its worker died).
   * The single UPDATE...RETURNING makes this race-free across threads.
   */
  claim(): Job | null {
    return this.db
      .query(
        `UPDATE jobs SET
           state = 'active',
           attempts = attempts + 1,
           visible_at = unixepoch('subsec') + visibility_timeout
         WHERE id = (
           SELECT id FROM jobs
           WHERE state IN ('ready', 'active') AND visible_at <= unixepoch('subsec')
           ORDER BY id LIMIT 1
         )
         RETURNING *`,
      )
      .get() as Job | null;
  }

  complete(id: number, result: unknown) {
    this.db.run(
      "UPDATE jobs SET state = 'done', result = ?, error = NULL WHERE id = ?",
      [JSON.stringify(result ?? null), id],
    );
  }

  /** Retry with exponential backoff, or move to dead_letters after max attempts. */
  fail(job: Job, error: string) {
    if (job.attempts >= job.max_attempts) {
      const tx = this.db.transaction(() => {
        this.db.run(
          "INSERT INTO dead_letters (job_id, name, payload, attempts, error) VALUES (?, ?, ?, ?, ?)",
          [job.id, job.name, job.payload, job.attempts, error],
        );
        this.db.run("DELETE FROM jobs WHERE id = ?", [job.id]);
      });
      tx();
    } else {
      const backoffSec = (job.base_delay_ms * 2 ** (job.attempts - 1)) / 1000;
      this.db.run(
        "UPDATE jobs SET state = 'ready', error = ?, visible_at = unixepoch('subsec') + ? WHERE id = ?",
        [error, backoffSec, job.id],
      );
    }
  }

  counts(): Record<string, number> {
    const out: Record<string, number> = {
      dead: (this.db.query("SELECT count(*) c FROM dead_letters").get() as any)
        .c,
    };
    for (const r of this.db
      .query("SELECT state, count(*) c FROM jobs GROUP BY state")
      .all() as any[])
      out[r.state] = r.c;
    return out;
  }

  /** Spawn a pool of Worker threads that import handlersPath and consume jobs. */
  work(
    handlersPath: string,
    opts: { concurrency?: number; pollMs?: number } = {},
  ) {
    for (let i = 0; i < (opts.concurrency ?? 2); i++) {
      const w = new Worker(new URL(import.meta.url));
      w.postMessage({
        dbPath: this.path,
        handlersPath,
        pollMs: opts.pollMs ?? 250,
      });
      this.#workers.push(w);
    }
  }

  stop() {
    for (const w of this.#workers) w.terminate();
    this.#workers = [];
  }
}

// ---- worker thread: poll, claim, run handler, complete or fail ----
if (!Bun.isMainThread) {
  self.onmessage = async (e: MessageEvent) => {
    const { dbPath, handlersPath, pollMs } = e.data;
    const { handlers } = await import(handlersPath);
    const q = new JobQueue(dbPath);
    while (true) {
      const job = q.claim();
      if (!job) {
        await Bun.sleep(pollMs);
        continue;
      }
      const fn = handlers[job.name];
      if (!fn) {
        q.fail(job, `no handler registered for "${job.name}"`);
        continue;
      }
      try {
        q.complete(job.id, await fn(JSON.parse(job.payload), job));
      } catch (err) {
        q.fail(job, String(err));
      }
    }
  };
}

// ---- self-test handlers (used when this file itself is the handlers module) ----
export const handlers: Record<string, (payload: any, job: Job) => unknown> = {
  square: async (p) => p.n * p.n,
  // fails on attempts 1 and 2, succeeds on attempt 3: proves retry + backoff
  flaky: async (p, job) => {
    if (job.attempts < 3) throw new Error(`flaky attempt ${job.attempts} down`);
    return `recovered on attempt ${job.attempts}`;
  },
  // always throws: proves the dead-letter path
  poison: async () => {
    throw new Error("this job can never succeed");
  },
};

if (import.meta.main && Bun.isMainThread) {
  const dbPath = `${import.meta.dir}/.queue-selftest.db`;
  for (const suffix of ["", "-wal", "-shm"])
    await Bun.file(dbPath + suffix)
      .delete()
      .catch(() => {});

  const q = new JobQueue(dbPath);
  for (let n = 1; n <= 5; n++) q.enqueue("square", { n });
  const flakyId = q.enqueue("flaky", {}, { maxAttempts: 5, baseDelayMs: 50 });
  q.enqueue("poison", {}, { maxAttempts: 2, baseDelayMs: 50 });

  q.work(import.meta.url, { concurrency: 3, pollMs: 50 });

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const c = q.counts();
    if ((c.done ?? 0) === 6 && c.dead === 1 && !c.ready && !c.active) break;
    await Bun.sleep(100);
  }
  q.stop();

  const c = q.counts();
  const flaky = q.db
    .query("SELECT * FROM jobs WHERE id = ?")
    .get(flakyId) as Job;
  const dead = q.db.query("SELECT * FROM dead_letters").get() as any;
  const squares = (
    q.db
      .query("SELECT result FROM jobs WHERE name = 'square' ORDER BY id")
      .all() as any[]
  ).map((r) => JSON.parse(r.result));

  console.log("counts:", c);
  console.log("squares:", squares);
  console.log(`flaky: attempts=${flaky.attempts} result=${flaky.result}`);
  console.log(
    `dead letter: name=${dead.name} attempts=${dead.attempts} error=${dead.error}`,
  );

  if ((c.done ?? 0) !== 6)
    throw new Error(`expected 6 done jobs, got ${c.done}`);
  if (c.dead !== 1) throw new Error(`expected 1 dead letter, got ${c.dead}`);
  if (squares.join(",") !== "1,4,9,16,25")
    throw new Error("square results wrong");
  if (flaky.attempts !== 3 || !String(flaky.result).includes("attempt 3"))
    throw new Error("flaky retry path wrong");
  if (dead.name !== "poison" || dead.attempts !== 2)
    throw new Error("dead-letter path wrong");
  console.log("queue self-test: all assertions passed");
  process.exit(0);
}

/**
 * workq.ts: a durable job queue on node:sqlite feeding a worker_threads pool.
 *
 * Jobs live in a SQLite table, so they survive process restarts: any job
 * left in state running by a crash is re-queued on boot. A pool of worker
 * threads (this same file, gated by isMainThread) executes jobs with
 * backpressure: the main thread claims a job from SQLite only when a worker
 * is idle, claim is an atomic UPDATE ... RETURNING. Failures retry with
 * capped exponential backoff plus full jitter, then land in state dead.
 * SIGINT drains in-flight jobs before terminating workers and closing the DB.
 *
 * Modern Node primitives used: node:sqlite DatabaseSync (WAL, UPDATE
 * RETURNING, named params), worker_threads with the .ts entry re-used as the
 * worker via new Worker(new URL(import.meta.url)), execArgv inheritance so
 * --experimental-sqlite propagates to workers, import.meta.main to gate the
 * CLI, util.parseArgs + styleText, type stripping (no build step).
 *
 * run:  node --experimental-sqlite workq.ts demo
 * run:  node --experimental-sqlite workq.ts enqueue square '{"n":7}' && node --experimental-sqlite workq.ts run
 * test: node --experimental-sqlite --test workq.test.ts
 */

import { DatabaseSync } from "node:sqlite";
import { Worker, isMainThread, parentPort } from "node:worker_threads";
import { parseArgs, styleText } from "node:util";
import { setTimeout as sleep } from "node:timers/promises";
import { rmSync } from "node:fs";

// ------------------------------------------------------------------ backoff

export interface BackoffOptions {
	baseMs?: number;
	factor?: number;
	capMs?: number;
	jitter?: (ms: number) => number; // default full jitter, pass (n) => n for determinism
}

export function backoffDelay(failureIndex: number, opts: BackoffOptions = {}): number {
	const { baseMs = 500, factor = 2, capMs = 30_000, jitter = (n) => Math.random() * n } = opts;
	return Math.round(jitter(Math.min(capMs, baseMs * factor ** failureIndex)));
}

export class RetryTimer {
	private readonly opts: BackoffOptions;
	constructor(opts: BackoffOptions = {}) {
		this.opts = opts;
	}
	schedule(failureIndex: number, fn: () => void): { delayMs: number; cancel: () => void } {
		const delayMs = backoffDelay(failureIndex, this.opts);
		const handle = setTimeout(fn, delayMs);
		return { delayMs, cancel: () => clearTimeout(handle) };
	}
}

// ---------------------------------------------------------------- job queue

export interface Job {
	id: number;
	type: string;
	payload: Record<string, unknown>;
	attempts: number;
	max_attempts: number;
}

export class JobQueue {
	private readonly db: DatabaseSync;
	private readonly backoff: BackoffOptions;

	constructor(path: string, opts: { backoff?: BackoffOptions } = {}) {
		this.backoff = opts.backoff ?? {};
		this.db = new DatabaseSync(path);
		if (path !== ":memory:") this.db.exec("PRAGMA journal_mode = WAL");
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS jobs(
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				type TEXT NOT NULL,
				payload TEXT NOT NULL,
				state TEXT NOT NULL DEFAULT 'queued',
				attempts INTEGER NOT NULL DEFAULT 0,
				max_attempts INTEGER NOT NULL DEFAULT 5,
				run_at INTEGER NOT NULL,
				created_at INTEGER NOT NULL,
				finished_at INTEGER,
				last_error TEXT,
				result TEXT
			);
			CREATE INDEX IF NOT EXISTS idx_jobs_claim ON jobs(state, run_at);
		`);
	}

	/** Crash recovery: anything still marked running belongs to a dead process. */
	recoverOrphans(): number {
		return Number(this.db.prepare("UPDATE jobs SET state='queued' WHERE state='running'").run().changes);
	}

	enqueue(type: string, payload: Record<string, unknown>, opts: { delayMs?: number; maxAttempts?: number } = {}): number {
		const now = Date.now();
		const r = this.db
			.prepare("INSERT INTO jobs (type, payload, run_at, created_at, max_attempts) VALUES (?, ?, ?, ?, ?)")
			.run(type, JSON.stringify(payload), now + (opts.delayMs ?? 0), now, opts.maxAttempts ?? 5);
		return Number(r.lastInsertRowid);
	}

	/** Atomic claim: flips exactly one due job to running and returns it. */
	claim(): Job | undefined {
		const row = this.db
			.prepare(`
				UPDATE jobs SET state='running'
				WHERE id = (SELECT id FROM jobs WHERE state='queued' AND run_at <= ? ORDER BY id LIMIT 1)
				RETURNING id, type, payload, attempts, max_attempts
			`)
			.get(Date.now()) as (Omit<Job, "payload"> & { payload: string }) | undefined;
		return row ? { ...row, payload: JSON.parse(row.payload) } : undefined;
	}

	complete(id: number, result: unknown): void {
		this.db.prepare("UPDATE jobs SET state='done', finished_at=?, result=? WHERE id=?").run(Date.now(), JSON.stringify(result ?? null), id);
	}

	fail(id: number, error: string): { disposition: "retry" | "dead"; delayMs: number } {
		const row = this.db.prepare("SELECT attempts, max_attempts FROM jobs WHERE id=?").get(id) as { attempts: number; max_attempts: number };
		const attempts = row.attempts + 1;
		if (attempts >= row.max_attempts) {
			this.db.prepare("UPDATE jobs SET state='dead', attempts=?, finished_at=?, last_error=? WHERE id=?").run(attempts, Date.now(), error, id);
			return { disposition: "dead", delayMs: 0 };
		}
		const delayMs = backoffDelay(row.attempts, this.backoff);
		this.db.prepare("UPDATE jobs SET state='queued', attempts=?, run_at=?, last_error=? WHERE id=?").run(attempts, Date.now() + delayMs, error, id);
		return { disposition: "retry", delayMs };
	}

	counts(): Record<string, number> {
		const out: Record<string, number> = {};
		for (const r of this.db.prepare("SELECT state, COUNT(*) AS n FROM jobs GROUP BY state").all() as { state: string; n: number }[]) {
			out[r.state] = r.n;
		}
		return out;
	}

	summary(): unknown[] {
		return this.db.prepare("SELECT id, type, state, attempts, last_error, result FROM jobs ORDER BY id").all();
	}

	close(): void {
		this.db.close();
	}
}

// -------------------------------------------------------------- worker side

interface Dispatch {
	jobId: number;
	type: string;
	payload: Record<string, unknown>;
	attempt: number;
}

if (!isMainThread && parentPort) {
	const handlers: Record<string, (payload: Record<string, unknown>, attempt: number) => Promise<unknown>> = {
		async square(p) {
			await sleep(Number(p.ms ?? 40));
			const n = Number(p.n);
			return { n, squared: n * n };
		},
		async flaky(p, attempt) {
			await sleep(20);
			const succeedOn = Number(p.succeedOn ?? 2);
			if (attempt < succeedOn) throw new Error(`transient failure, attempt ${attempt} of ${succeedOn}`);
			return { survivedAfterAttempts: attempt };
		},
	};
	parentPort.on("message", async (msg: Dispatch) => {
		try {
			const handler = handlers[msg.type];
			if (!handler) throw new Error(`no handler for job type ${msg.type}`);
			parentPort!.postMessage({ jobId: msg.jobId, ok: true, result: await handler(msg.payload, msg.attempt) });
		} catch (err) {
			parentPort!.postMessage({ jobId: msg.jobId, ok: false, error: err instanceof Error ? err.message : String(err) });
		}
	});
}

// -------------------------------------------------------------- worker pool

interface Slot {
	worker: Worker;
	job: Job | null;
}

export class WorkerPool {
	private readonly slots: Slot[] = [];
	private timer: NodeJS.Timeout | null = null;
	private draining = false;

	private readonly queue: JobQueue;
	private readonly size: number;
	private readonly pollMs: number;

	constructor(queue: JobQueue, size = 3, pollMs = 100) {
		this.queue = queue;
		this.size = size;
		this.pollMs = pollMs;
	}

	start(): void {
		for (let i = 0; i < this.size; i++) {
			const worker = new Worker(new URL(import.meta.url));
			const slot: Slot = { worker, job: null };
			worker.on("message", (msg: { jobId: number; ok: boolean; result?: unknown; error?: string }) => {
				const job = slot.job;
				slot.job = null;
				if (!job) return;
				if (msg.ok) {
					this.queue.complete(job.id, msg.result);
					console.log(styleText("green", `done  #${job.id} ${job.type}`), JSON.stringify(msg.result));
				} else {
					const { disposition, delayMs } = this.queue.fail(job.id, msg.error ?? "unknown");
					if (disposition === "retry") {
						console.log(styleText("yellow", `retry #${job.id} ${job.type} in ${delayMs}ms: ${msg.error}`));
					} else {
						console.log(styleText("red", `dead  #${job.id} ${job.type}: ${msg.error}`));
					}
				}
				this.tick();
			});
			this.slots.push(slot);
		}
		this.timer = setInterval(() => this.tick(), this.pollMs);
		this.tick();
	}

	/** Backpressure lives here: claim from SQLite only for idle workers. */
	private tick(): void {
		if (this.draining) return;
		for (const slot of this.slots) {
			if (slot.job) continue;
			const job = this.queue.claim();
			if (!job) return;
			slot.job = job;
			slot.worker.postMessage({ jobId: job.id, type: job.type, payload: job.payload, attempt: job.attempts } satisfies Dispatch);
		}
	}

	get idle(): boolean {
		return this.slots.every((s) => s.job === null);
	}

	async shutdown(): Promise<void> {
		this.draining = true;
		if (this.timer) clearInterval(this.timer);
		while (!this.idle) await sleep(25);
		await Promise.all(this.slots.map((s) => s.worker.terminate()));
	}
}

// ---------------------------------------------------------------------- cli

if ((import.meta as { main?: boolean }).main && isMainThread) {
	const { positionals, values } = parseArgs({
		allowPositionals: true,
		options: {
			db: { type: "string", default: new URL("./workq-demo.db", import.meta.url).pathname },
			workers: { type: "string", default: "3" },
		},
	});
	const [cmd, jobType, payloadJson] = positionals;

	if (cmd === "demo") {
		for (const suffix of ["", "-wal", "-shm"]) rmSync(values.db + suffix, { force: true });
		const queue = new JobQueue(values.db, { backoff: { baseMs: 150, capMs: 1500 } });
		for (let n = 1; n <= 5; n++) queue.enqueue("square", { n, ms: 60 });
		queue.enqueue("flaky", { succeedOn: 2 }, { maxAttempts: 5 });
		queue.enqueue("flaky", { succeedOn: 99 }, { maxAttempts: 3 });
		console.log(styleText("bold", `demo: 7 jobs enqueued (one recovers after 2 failures, one is doomed), pool=${values.workers}`));
		await runUntilDrained(queue, Number(values.workers));
	} else if (cmd === "enqueue" && jobType) {
		const queue = new JobQueue(values.db);
		const id = queue.enqueue(jobType, payloadJson ? JSON.parse(payloadJson) : {});
		console.log(`enqueued #${id} (${jobType}) into ${values.db}`);
		queue.close();
	} else if (cmd === "run") {
		const queue = new JobQueue(values.db, { backoff: { baseMs: 150, capMs: 1500 } });
		await runUntilDrained(queue, Number(values.workers));
	} else if (cmd === "status") {
		const queue = new JobQueue(values.db);
		console.table(queue.summary());
		queue.close();
	} else {
		console.error("usage: node --experimental-sqlite workq.ts demo | enqueue <type> [json] | run | status  [--db path] [--workers n]");
		process.exitCode = 2;
	}

	async function runUntilDrained(queue: JobQueue, workers: number): Promise<void> {
		const recovered = queue.recoverOrphans();
		if (recovered) console.log(styleText("yellow", `recovered ${recovered} orphaned running job(s) from a previous crash`));
		const pool = new WorkerPool(queue, workers);
		pool.start();
		let interrupted = false;
		process.once("SIGINT", async () => {
			interrupted = true;
			console.log(styleText("bold", "\nSIGINT: draining in-flight jobs, then stopping"));
			await pool.shutdown();
			console.table(queue.summary());
			queue.close();
			process.exit(0);
		});
		for (;;) {
			await sleep(150);
			if (interrupted) return;
			const c = queue.counts();
			if (!c.queued && !c.running && pool.idle) break;
		}
		await pool.shutdown();
		console.log(styleText("bold", "drained. final state:"));
		console.table(queue.summary());
		queue.close();
	}
}

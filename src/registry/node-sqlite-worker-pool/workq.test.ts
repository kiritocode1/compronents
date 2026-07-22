/**
 * workq.test.ts: node:test suite for workq.ts backoff scheduling.
 *
 * Uses mock timers (setTimeout and Date) to prove exponential backoff
 * without waiting real time: RetryTimer fires exactly at the computed
 * delays, and JobQueue keeps a failed job invisible to claim() until its
 * backoff window has elapsed on the mocked clock, then kills it after
 * max_attempts.
 *
 * run: node --experimental-sqlite --test workq.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { backoffDelay, RetryTimer, JobQueue } from "./workq.ts";

const deterministic = { baseMs: 100, factor: 2, capMs: 1000, jitter: (n: number) => n };

test("backoffDelay grows exponentially and respects the cap", () => {
	const delays = [0, 1, 2, 3, 4, 7].map((i) => backoffDelay(i, deterministic));
	assert.deepEqual(delays, [100, 200, 400, 800, 1000, 1000]);
});

test("backoffDelay full jitter stays within [0, ideal]", () => {
	for (let i = 0; i < 200; i++) {
		const d = backoffDelay(3, { baseMs: 100, factor: 2, capMs: 1000 });
		assert.ok(d >= 0 && d <= 800, `jittered delay ${d} out of range`);
	}
});

test("RetryTimer schedules retries at exact backoff boundaries", (t) => {
	t.mock.timers.enable({ apis: ["setTimeout"] });
	const timer = new RetryTimer(deterministic);
	const fired: number[] = [];
	for (const attempt of [0, 1, 2]) timer.schedule(attempt, () => fired.push(attempt));

	t.mock.timers.tick(99);
	assert.deepEqual(fired, [], "nothing fires before the first delay");
	t.mock.timers.tick(1); // t=100
	assert.deepEqual(fired, [0]);
	t.mock.timers.tick(100); // t=200
	assert.deepEqual(fired, [0, 1]);
	t.mock.timers.tick(199); // t=399
	assert.deepEqual(fired, [0, 1]);
	t.mock.timers.tick(1); // t=400
	assert.deepEqual(fired, [0, 1, 2]);
});

test("RetryTimer cancel prevents the retry", (t) => {
	t.mock.timers.enable({ apis: ["setTimeout"] });
	const timer = new RetryTimer(deterministic);
	let fired = 0;
	const { delayMs, cancel } = timer.schedule(0, () => fired++);
	assert.equal(delayMs, 100);
	cancel();
	t.mock.timers.tick(1000);
	assert.equal(fired, 0);
});

test("JobQueue hides a failed job until its backoff elapses, then retries, then deadletters", (t) => {
	t.mock.timers.enable({ apis: ["Date"], now: 1_000_000 });
	const queue = new JobQueue(":memory:", { backoff: deterministic });
	queue.enqueue("flaky", { succeedOn: 99 }, { maxAttempts: 3 });

	// attempt 0: claim and fail, retry scheduled 100ms out
	let job = queue.claim();
	assert.ok(job, "fresh job is claimable");
	let outcome = queue.fail(job.id, "boom 0");
	assert.deepEqual(outcome, { disposition: "retry", delayMs: 100 });
	assert.equal(queue.claim(), undefined, "job invisible during backoff");

	t.mock.timers.tick(99);
	assert.equal(queue.claim(), undefined, "still invisible 1ms before run_at");
	t.mock.timers.tick(1);
	job = queue.claim();
	assert.ok(job, "claimable exactly at run_at");
	assert.equal(job.attempts, 1);

	// attempt 1: fail again, backoff doubles to 200ms
	outcome = queue.fail(job.id, "boom 1");
	assert.deepEqual(outcome, { disposition: "retry", delayMs: 200 });
	t.mock.timers.tick(200);
	job = queue.claim();
	assert.ok(job);
	assert.equal(job.attempts, 2);

	// attempt 2: third failure hits max_attempts, job is dead, never claimable
	outcome = queue.fail(job.id, "boom 2");
	assert.equal(outcome.disposition, "dead");
	t.mock.timers.tick(60_000);
	assert.equal(queue.claim(), undefined, "dead jobs are never re-claimed");
	assert.deepEqual(queue.counts(), { dead: 1 });
	queue.close();
});

test("JobQueue recoverOrphans re-queues jobs stuck in running", () => {
	const queue = new JobQueue(":memory:", { backoff: deterministic });
	queue.enqueue("square", { n: 3 });
	const job = queue.claim();
	assert.ok(job);
	// simulate a crash: process dies with the job still marked running
	assert.equal(queue.recoverOrphans(), 1);
	const again = queue.claim();
	assert.ok(again, "orphaned job is claimable after recovery");
	assert.equal(again.id, job.id);
	queue.close();
});

/**
 * Integration tests for a real Worker build, driven by `createTestHarness()`.
 *
 * `createTestHarness()` is new: it was introduced in Wrangler 4.99.0 (2026-06-09)
 * and the Durable Object surface used below arrived over the following six weeks.
 * It replaces the older `unstable_dev()` approach and is a different thing from
 * `@cloudflare/vitest-pool-workers`: the harness runs your production build in a
 * local preview server and talks to it over HTTP and RPC from an ordinary Node
 * test process, so `globalThis.fetch` interceptors such as MSW work normally.
 *
 * Method availability by Wrangler version (all 2026):
 * - 4.99.0  (06-09) createTestHarness, listen, fetch, getWorker, getLogs, debug, reset
 * - 4.101.0 (06-16) per-Worker resource accessors
 * - 4.104.0 (06-23) getWorker().getEnv()
 * - 4.106.0 (06-25) applyD1Migrations, introspectWorkflow, bindingOverrides, getExport
 * - 4.109.0 (07-09) listDurableObjectIds
 * - 4.111.0 (07-15) evictDurableObject
 * - 4.112.0 (07-17) getDurableObjectStorage
 *
 * Pinned to wrangler@4.112.0. Written for `node --test`; the same calls work
 * unchanged under Vitest or Jest.
 */

/// <reference types="@cloudflare/workers-types" />

import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { createTestHarness, type TestHarness } from "wrangler";
import type { QuotaCounter } from "./worker";

// Typing the harness against your own Env and module gives autocomplete on
// binding names and turns a renamed Durable Object class into a compile error.
// The namespace generic is what makes the RPC call below type-check.
type QuotaEnv = {
  QUOTA: DurableObjectNamespace<QuotaCounter>;
  QUOTA_PER_HOUR: string;
};
type QuotaModule = typeof import("./worker");

let server: TestHarness;

before(async () => {
  server = createTestHarness({
    workers: [
      {
        configPath: "./wrangler.jsonc",
        // Test-only overrides. The committed config stays production-shaped;
        // a limit of 3 keeps the exhaustion test to three requests.
        vars: { QUOTA_PER_HOUR: "3" },
      },
    ],
  });
  await server.listen();
});

// reset() recreates storage and returns the server to its start-of-session
// options, so Durable Object state does not leak between tests.
beforeEach(async () => {
  await server.reset();
});

after(async () => {
  await server.close();
});

test("allows requests under the hourly limit", async () => {
  const response = await server.fetch("/quota/user-123");

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-quota-remaining"), "2");
});

test("returns 429 once the window is exhausted", async () => {
  await server.fetch("/quota/user-123?cost=3");
  const rejected = await server.fetch("/quota/user-123");

  assert.equal(rejected.status, 429);
});

test("persists the window row in Durable Object SQLite", async () => {
  const worker = server.getWorker<QuotaEnv, QuotaModule>();
  await worker.fetch("/quota/user-123?cost=2");

  // The first argument accepts an exported class name or a binding name; class
  // names win when both would match. `exec` runs inside the object and may start
  // it if it is not already active.
  const storage = await worker.getDurableObjectStorage("QuotaCounter", {
    name: "user-123",
  });
  const rows = await storage.exec<{ used: number }>(
    "SELECT used FROM windows WHERE id = ?",
    "user-123",
  );

  assert.deepEqual(rows, [{ used: 2 }]);
});

test("seeds storage directly to reach a state the API cannot produce", async () => {
  const worker = server.getWorker<QuotaEnv, QuotaModule>();

  // Touch the object so its schema exists, then write an already-expired window.
  await worker.fetch("/quota/user-456");
  const storage = await worker.getDurableObjectStorage("QuotaCounter", {
    name: "user-456",
  });
  await storage.exec(
    "UPDATE windows SET used = 3, resets_at = ? WHERE id = ?",
    Date.now() - 1000,
    "user-456",
  );

  // An expired window rolls over instead of rejecting.
  const response = await worker.fetch("/quota/user-456");
  assert.equal(response.status, 200);
});

test("survives eviction because the counter lives in SQLite, not memory", async () => {
  const worker = server.getWorker<QuotaEnv, QuotaModule>();
  await worker.fetch("/quota/user-789?cost=2");

  // Tears the instance down while keeping durable storage. In-memory state is
  // reset on the next start, which is exactly the production failure this test
  // is meant to catch.
  await worker.evictDurableObject("QuotaCounter", { name: "user-789" });

  const response = await worker.fetch("/quota/user-789");
  assert.equal(response.headers.get("x-quota-remaining"), "0");
});

test("creates one Durable Object per user id", async () => {
  const worker = server.getWorker<QuotaEnv, QuotaModule>();
  await worker.fetch("/quota/ada");
  await worker.fetch("/quota/grace");

  const ids = await worker.listDurableObjectIds("QuotaCounter");
  assert.equal(ids.length, 2);
});

test("calls the Durable Object RPC method without going through HTTP", async () => {
  const worker = server.getWorker<QuotaEnv, QuotaModule>();
  // getEnv() hands back the live binding object, vars and secrets included.
  const env = await worker.getEnv();
  const verdict = await env.QUOTA.getByName("rpc-user").consume("rpc-user", 1);

  assert.equal(verdict.allowed, true);
  assert.equal(verdict.limit, 3);
});

test("dumps a diagnostic timeline when something fails", async () => {
  await server.fetch("/quota/logged-user");

  const logs = server.getLogs();
  assert.ok(Array.isArray(logs));

  // Call server.debug() from a failure hook to print the server event timeline
  // interleaved with runtime logs, which is far more useful than a bare stack.
  server.clearLogs();
});

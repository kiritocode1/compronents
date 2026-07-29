// Convention 5 (AGENTS.md): a backend visualization must show all three of
// what it does, the code that does it, and the type it travels under.
//
//   node --import ./tests/alias-hooks.mjs --test tests/backend-viz-completeness.test.mjs
//
// This is a RATCHET, not a pass/fail gate. Most specs predate the rule, so they
// are listed in KNOWN_GAPS. The test enforces two things: a spec outside the
// list must be complete (so new items cannot ship half-built), and a spec
// inside it must still be incomplete (so fixing one forces you to delete its
// line, and the backlog can only shrink).

import assert from "node:assert/strict";
import { test } from "node:test";
import { backendViz } from "../src/lib/backend-viz.ts";

/** every spec an entry can show: one, or one per variant */
function specsOf(entry) {
  return "variants" in entry ? entry.variants.map((v) => v.spec) : [entry];
}

/** the task nodes a spec renders, whichever archetype it uses */
function nodesOf(spec) {
  if (spec.archetype === "flow") return spec.nodes;
  if (spec.archetype === "schedule") return spec.schedule.nodes;
  if (spec.archetype === "ref")
    return [spec.ref.request, spec.ref.challenger].filter(Boolean);
  if (spec.archetype === "scope")
    return spec.scope.node ? [spec.scope.node] : [];
  return [];
}

/**
 * Code and wired tokens are required of every runtime variant; type badges are
 * required once per item, since a dedicated  variant covers the contract
 * for the whole entry.
 */
export function gapsFor(entry) {
  const gaps = new Set();
  const specs = specsOf(entry);
  for (const spec of specs) {
    if (spec.archetype === "types") continue;
    const nodes = nodesOf(spec);
    if (!spec.code) gaps.add("code");
    else if (!nodes.some((n) => n.token)) gaps.add("token");
  }
  const showsTypes = specs.some(
    (spec) =>
      spec.archetype === "types" || nodesOf(spec).some((n) => n.types?.length),
  );
  if (!showsTypes) gaps.add("types");
  return [...gaps];
}

/** specs written before convention 5. Delete a line when you fix that item. */
const KNOWN_GAPS = new Set([
  "effect-service-lifecycle-runtime",
  "effect-sql-transactional-repository",
  "effect-durable-activity-workflow",
  "effect-cluster-entity-sharding",
  "effect-durable-workflow-queue",
  "effect-workflow-v4-migration",
  "alchemy-cloudflare-access-gateway",
  "effect-cloudflare-event-api",
  "effect-cache-stampede-guard",
  "effect-circuit-breaker-budget",
  "effect-shard-router-backpressure",
  "effect-fencing-token-hlc",
  "effect-outbox-replicator",
  "effect-idempotency-key-store",
  "effect-hedged-request-race",
  "effect-read-replica-router",
  "effect-heartbeat-failure-detector",
  "effect-multipart-upload-resume",
  "effect-exactly-once-consumer",
  "effect-webhook-dispatcher",
  "effect-consistent-hash-ring",
  "effect-snowflake-id-generator",
  "effect-bulkhead-isolation",
  "effect-payment-reconciliation",
  "effect-hot-account-ledger",
  "effect-bloom-url-frontier",
  "effect-password-hash-vault",
  "effect-quorum-read-repair",
  "effect-optimistic-lock-retry",
  "effect-deadlock-detector",
  "effect-geohash-proximity",
  "deno-kv-rate-limit",
  "better-auth-atomic-rate-limit",
  "durable-object-rpc-rate-limit",
  "d1-session-read-replica",
  "fluid-stream-lifecycle",
  "pg-advisory-lock-keyset-scan",
  "rivet-durable-workflow-actor",
  "artifacts-fork-run-workflow",
  "cloudflare-workflow-saga-rollback",
  "bun-sqlite-job-queue",
  "node-sqlite-worker-pool",
  "vercel-queue-consumer-groups",
  "indexeddb-sync-outbox",
  "durable-object-alarm-scheduler",
  "sveltekit-live-query-stream",
  "websocket-route-handler",
  "better-auth-jwks-cookie-cache",
  "better-auth-provisioning-gate",
  "cloudflare-worker-test-harness",
  "cloudflare-worker-cache-tags",
  "durable-object-websocket-hibernation",
  "durable-object-sql-tenant-db",
  "worker-rpc-promise-pipelining",
  "artifacts-repo-provisioner",
  "artifacts-agent-commit-notes",
  "drizzle-pg-jit-query-layer",
  "drizzle-kit-migration-gate",
  "drizzle-effect-pg-repository",
  "drizzle-cache-tag-invalidation",
  "prisma-driver-adapter-runtime",
  "prisma-client-extension-audit",
  "neon-http-composable-sql",
  "deno-kv-leader-election",
  "deno-kv-realtime-sync",
  "node-permission-sandbox",
  "node-diagnostics-telemetry",
  "rivet-dynamic-actor-registry",
  "sveltekit-explicit-env-vars",
  "sveltekit-batched-query-refresh",
  "elysia-plugin-scope-model",
  "elysia-aot-build-manifest",
  "elysia-standard-schema-guard",
  "bun-secrets-vault",
  "bun-auth-gateway",
  "fluid-compute-instance-safety",
  "effect-weighted-load-balancer",
  "effect-lru-cache-eviction",
  "effect-write-behind-cache",
  "effect-cache-penetration-shield",
  "effect-cdn-origin-shield",
  "effect-dns-resolver-cache",
  "effect-two-phase-commit",
  "effect-token-bucket-shaper",
  "effect-saga-payment-orchestrator",
  "effect-mvcc-snapshot-isolation",
  "effect-event-sourced-aggregate",
  "effect-leader-lease-election",
  "effect-vector-clock-causality",
  "effect-lsm-memtable-compaction",
  "effect-wal-crash-recovery",
  "effect-fair-priority-scheduler",
  "effect-merkle-anti-entropy",
  "effect-connection-pool-fair",
  "effect-gossip-dissemination",
  "effect-dataloader-batch",
  "effect-adaptive-concurrency-limit",
  "effect-crdt-counter-merge",
  "effect-sliding-window-rate-limit",
  "effect-scatter-gather-quorum",
  "effect-chunked-upload-integrity",
  "convex-exactly-once-action",
  "convex-occ-sharded-counter",
  "tigerbeetle-test-ledger",
  "tigerbeetle-two-phase-reservation",
  "turso-replica-read-your-writes",
  "turso-tenant-migration-fanout",
  "vercel-waituntil-drain-guard",
  "turso-transaction-mode-guard",
  "vercel-blob-client-upload-tokens",
  "vercel-workflow-step-idempotency",
  "vercel-workflow-continuation-versioning",
  "vercel-ai-gateway-failover-budget",
]);

test("a spec outside the backlog shows code, tokens and types", () => {
  const broken = Object.entries(backendViz)
    .filter(([name]) => !KNOWN_GAPS.has(name))
    .map(([name, entry]) => [name, gapsFor(entry)])
    .filter(([, gaps]) => gaps.length)
    .map(([name, gaps]) => `${name}: missing ${gaps.join(", ")}`);

  assert.deepEqual(
    broken,
    [],
    "see convention 5 in AGENTS.md; add the missing code/token/types to these specs",
  );
});

test("the backlog only shrinks", () => {
  const fixed = [...KNOWN_GAPS].filter(
    (name) => backendViz[name] && gapsFor(backendViz[name]).length === 0,
  );
  assert.deepEqual(
    fixed,
    [],
    "these specs are complete now: remove them from KNOWN_GAPS",
  );
});

test("the backlog has no stale entries", () => {
  const missing = [...KNOWN_GAPS].filter((name) => !backendViz[name]);
  assert.deepEqual(missing, [], "these items no longer exist: remove them");
});

import type { VizSpec } from "@/components/site/effect-viz";

/**
 * Effect-style visualization specs, one per backend registry item.
 *
 * Every spec is expressed through Kit Langton's visual-effect vocabulary only:
 *   - flow      node(s) -> arrow -> result  (pipelines, gates, candidates)
 *   - ref       odometer ref cell + request/challenger node (limits, budgets, fencing)
 *   - scope     sliding finalizer stack (acquire/release, locks, lifecycles)
 *   - schedule  time axis with attempt dots and a cursor (retries, dunning, queues)
 * so the animation shows what THIS component does and the failure mode it guards,
 * in kitlangton's actual design. Rendered on /backend/<name>.
 */

const s = (...a: string[]) => a as ("idle" | "running" | "completed" | "failed" | "death" | "interrupted")[];
const OK = ["idle", "running", "running", "completed", "completed", "idle"];
const OK_SLOW = ["idle", "running", "running", "running", "completed", "idle"];

// scope timelines: acquire in order, release in reverse (last acquired releases first)
const ACQ3_A = ["hidden", "pending", "pending", "pending", "pending", "pending", "running", "completed"];
const ACQ3_B = ["hidden", "hidden", "pending", "pending", "pending", "running", "completed", "completed"];
const ACQ3_C = ["hidden", "hidden", "hidden", "pending", "running", "completed", "completed", "completed"];
const ACQ2_A = ["hidden", "pending", "pending", "pending", "running", "completed"];
const ACQ2_B = ["hidden", "hidden", "pending", "running", "completed", "completed"];
const sc = (...a: string[]) => a as ("hidden" | "pending" | "running" | "completed")[];

export const backendViz: Record<string, VizSpec> = {
  // ======================= EFFECT =======================
  "effect-service-lifecycle-runtime": {
    archetype: "scope",
    caption:
      "acquireRelease binds each teardown to its setup; on SIGTERM the scope closes and finalizers run in reverse acquire order, so the connection pool drains after the workers that use it stop.",
    scope: {
      mode: "scope",
      finalizers: [
        { label: "connection pool", states: sc(...ACQ3_A) },
        { label: "fiberset workers", states: sc(...ACQ3_B) },
        { label: "http listener", states: sc(...ACQ3_C) },
      ],
    },
  },
  "effect-sql-transactional-repository": {
    archetype: "ref",
    caption:
      "Debit and credit post inside one scoped transaction; the ledger balance moves atomically, and a decode failure rolls the whole scope back rather than leaving a half-written row.",
    ref: {
      label: "ledger balance",
      values: [1000, 950, 900, 850, 850, 1000],
      request: { label: "post entry", states: s("idle", "completed", "completed", "completed", "failed", "idle"), result: "ok", error: "rollback" },
    },
  },
  "effect-httpapi-derived-client": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "One HttpApi declaration derives the server routes, the typed client, and the OpenAPI doc, so the three cannot drift apart.",
    nodes: [
      { label: "HttpApi", result: "spec", states: s(...OK) },
      { label: "client", result: "typed", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "effect-rpc-contract-transport": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "One RpcGroup contract is imported by both sides; the transport underneath is swappable without touching either.",
    nodes: [
      { label: "RpcGroup", result: "contract", states: s(...OK) },
      { label: "call", result: "job.id", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "effect-durable-activity-workflow": {
    archetype: "schedule",
    caption:
      "A dunning sequence retries a failed payment across real days with growing gaps; each Activity is journaled, so a mid-run deploy resumes at the next attempt instead of restarting from the top.",
    schedule: {
      label: "retry the failed charge, waiting real days between attempts",
      steps: 8,
      attempts: [
        { atPct: 6, outcome: "fail", label: "day 0" },
        { atPct: 26, outcome: "fail", label: "day 3" },
        { atPct: 58, outcome: "fail", label: "day 7" },
        { atPct: 96, outcome: "success", label: "paid" },
      ],
    },
  },
  "effect-cluster-entity-sharding": {
    archetype: "flow",
    arrowBefore: 2,
    caption:
      "Every account is a single-writer cluster entity; two withdrawals to the same account serialize on one shard by the runtime shape, so the second waits instead of double-spending against a SELECT FOR UPDATE.",
    nodes: [
      { label: "withdraw A", result: "ok", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "withdraw B", states: s("idle", "running", "running", "running", "completed", "idle") },
      { label: "entity", result: "serialized", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "effect-durable-workflow-queue": {
    archetype: "schedule",
    caption: "A DurableQueue persists the payout and suspends the workflow until a worker settles it; the checkpoint is replay-safe, so a restart resumes at the suspend point rather than re-charging.",
    schedule: {
      label: "persist, suspend, then settle when a worker claims it",
      steps: 7,
      attempts: [
        { atPct: 8, outcome: "wait", label: "enqueued" },
        { atPct: 45, outcome: "wait", label: "claimed" },
        { atPct: 92, outcome: "success", label: "settled" },
      ],
    },
  },
  "effect-workflow-v4-migration": {
    archetype: "flow",
    caption: "The same workflow annotated with the six verified Effect 3 to 4 breaks: the package move, tag-first make, and the generic-bound change.",
    nodes: [{ label: "migrate", result: "v4", states: s(...OK_SLOW) }],
  },
  "effect-cloudflare-event-api": {
    archetype: "flow",
    arrowBefore: 2,
    caption: "A schema validates the HTTP boundary, a traced service runs, KV persists, and waitUntil finishes background work after the response is sent.",
    nodes: [
      { label: "request", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "service", result: "kv", states: s("idle", "idle", "running", "completed", "completed", "idle") },
      { label: "response", result: "200", error: "422", states: s("idle", "idle", "running", "completed", "failed", "idle") },
    ],
  },

  // ---- Effect failure-mode resilience batch ----
  "effect-cache-stampede-guard": {
    archetype: "ref",
    caption:
      "A Semaphore caps concurrent origin loads; a thousand simultaneous misses draw the permit budget to zero and coalesce onto one fiber, so a late arrival waits for the shared load instead of melting the database.",
    ref: {
      label: "origin permits",
      values: [3, 2, 1, 0, 1, 3],
      request: { label: "cache miss", states: s("idle", "completed", "completed", "interrupted", "completed", "idle"), result: "load", error: "coalesced" },
    },
  },
  "effect-circuit-breaker-budget": {
    archetype: "ref",
    caption:
      "The retry budget is a token bucket: traffic funds tokens, each retry spends one, and an empty bucket rewrites the next failure as non-retryable, so retries can never exceed a fixed share of live traffic.",
    ref: {
      label: "retry budget",
      values: [4, 3, 2, 1, 0, 4],
      request: { label: "retry", states: s("idle", "completed", "completed", "completed", "failed", "idle"), result: "spent", error: "non-retryable" },
    },
  },
  "effect-shard-router-backpressure": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "A consistent-hash ring places cold keys; a key that crosses a frequency threshold splits by power-of-two-choices and dispatches to the shallower of two shards, so one hot key spreads across workers instead of drowning one.",
    nodes: [
      { label: "hot key", states: s("idle", "running", "running", "completed", "completed", "idle") },
      { label: "shard 1", result: "half", states: s("idle", "idle", "running", "completed", "completed", "idle") },
      { label: "shard 4", result: "half", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "effect-fencing-token-hlc": {
    archetype: "ref",
    caption:
      "A lease manager mints strictly increasing fencing tokens; the resource remembers the highest it has accepted and rejects any lower one, so a GC-paused old leader that wakes up cannot overwrite the new one.",
    ref: {
      label: "accepted token",
      values: [6, 7, 8, 8, 8, 8],
      challenger: { label: "stale leader (5)", states: s("idle", "idle", "idle", "failed", "idle", "idle"), error: "fenced out" },
    },
  },
  "effect-outbox-replicator": {
    archetype: "ref",
    caption:
      "The record and its outbox entry commit in one atomic update; a replicator drains with a cursor that advances only after a durable apply, so a crash never loses an acknowledged write.",
    ref: { label: "applied cursor", values: [40, 41, 42, 43, 44, 45] },
  },

  // ======================= RATE LIMITS / BUDGETS (ref) =======================
  "deno-kv-rate-limit": {
    archetype: "ref",
    caption:
      "A sliding-window limiter over Deno KV holds across isolates and regions; each request draws down the window budget atomically, and a request that finds it empty is rejected with 429.",
    ref: {
      label: "window budget",
      values: [5, 4, 3, 1, 0, 5],
      request: { label: "request", states: s("idle", "completed", "completed", "completed", "interrupted", "idle"), result: "pass", error: "429" },
    },
  },
  "better-auth-atomic-rate-limit": {
    archetype: "ref",
    caption:
      "INCR and PEXPIRE run inside one Lua call, so concurrent sign-in attempts draw down the same counter atomically; once the budget is spent the extra attempt cannot pass on a stale count.",
    ref: {
      label: "attempts left",
      values: [5, 3, 1, 0, 0, 5],
      request: { label: "sign-in", states: s("idle", "completed", "completed", "interrupted", "interrupted", "idle"), result: "ok", error: "429" },
    },
  },
  "durable-object-rpc-rate-limit": {
    archetype: "ref",
    caption:
      "One Durable Object per API key holds a strongly consistent token bucket in DO SQLite; the fronting Worker calls take() over RPC, and an exhausted bucket rejects until it refills.",
    ref: {
      label: "token bucket",
      values: [6, 4, 2, 0, 3, 6],
      request: { label: "take()", states: s("idle", "completed", "completed", "interrupted", "completed", "idle"), result: "ok", error: "empty" },
    },
  },

  // ======================= COUNTERS / CURSORS (ref) =======================
  "d1-session-read-replica": {
    archetype: "ref",
    caption:
      "Sequential consistency is scoped to one D1 session bookmark; a write advances it and the follow-up read carries it, so a replica cannot answer with a version older than the write.",
    ref: { label: "session bookmark", values: ["v40", "v41", "v42", "v42", "v43", "v43"] },
  },

  // ======================= LIFECYCLE / SCOPE / LOCKS (scope) =======================
  "fluid-stream-lifecycle": {
    archetype: "scope",
    caption:
      "A long-lived SSE endpoint opens on Fluid compute; the finally block unregisters the listener on disconnect, so a shared instance releases the subscription in reverse instead of leaking it to the next request.",
    scope: {
      mode: "scope",
      finalizers: [
        { label: "open stream", states: sc(...ACQ2_A) },
        { label: "register listener", states: sc(...ACQ2_B) },
      ],
    },
  },
  "pg-advisory-lock-keyset-scan": {
    archetype: "scope",
    caption:
      "pg_advisory_xact_lock is transaction-scoped: the lock is acquired inside the job's transaction and released automatically when it ends, so a worker that dies mid-job never strands a lock on a pooled connection.",
    scope: {
      mode: "scope",
      finalizers: [
        { label: "begin transaction", states: sc(...ACQ2_A) },
        { label: "advisory xact lock", states: sc(...ACQ2_B) },
      ],
    },
  },
  "rivet-durable-workflow-actor": {
    archetype: "scope",
    caption:
      "A Rivet actor's run handler is a durable, replayable workflow; getVersion gates new code so an in-flight run replays against the version it started on instead of corrupting its journal.",
    scope: {
      mode: "scope",
      finalizers: [
        { label: "actor state", states: sc(...ACQ2_A) },
        { label: "workflow step", states: sc(...ACQ2_B) },
      ],
    },
  },
  "artifacts-fork-run-workflow": {
    archetype: "scope",
    caption:
      "Each agent run forks a read-only baseline into a disposable copy; a durable workflow gates the merge back, so an unreviewed fork is released (discarded) rather than pushed to the baseline.",
    scope: {
      mode: "scope",
      finalizers: [
        { label: "fork baseline", states: sc(...ACQ2_A) },
        { label: "agent run", states: sc(...ACQ2_B) },
      ],
    },
  },
  "cloudflare-workflow-saga-rollback": {
    archetype: "flow",
    caption:
      "Each side-effecting step registers a compensation; a terminal failure runs those compensations in reverse start order, so the charge is refunded and the seats revoked instead of a half-applied booking.",
    nodes: [
      { label: "charge", result: "done", states: s("idle", "running", "completed", "completed", "interrupted", "idle") },
      { label: "reserve seats", error: "sold out", states: s("idle", "idle", "running", "failed", "failed", "idle") },
      { label: "rollback", result: "refunded", states: s("idle", "idle", "idle", "running", "completed", "idle") },
    ],
  },

  // ======================= QUEUES / SCHEDULES (schedule) =======================
  "bun-sqlite-job-queue": {
    archetype: "schedule",
    caption:
      "Jobs are claimed race-free with UPDATE ... RETURNING so two workers never take the same row; a failure retries with backoff, and a job past its budget lands in dead_letters instead of looping forever.",
    schedule: {
      label: "claim, then retry with backoff, then dead-letter",
      steps: 8,
      attempts: [
        { atPct: 8, outcome: "fail", label: "try 1" },
        { atPct: 30, outcome: "fail", label: "try 2" },
        { atPct: 62, outcome: "fail", label: "try 3" },
        { atPct: 96, outcome: "fail", label: "dead" },
      ],
    },
  },
  "node-sqlite-worker-pool": {
    archetype: "schedule",
    caption:
      "A node:sqlite queue feeds a worker_threads pool; a job is claimed with UPDATE ... RETURNING only when a worker is idle, and a row left running by a crash is re-queued on boot rather than lost.",
    schedule: {
      label: "claim when a worker frees, retry a crashed job",
      steps: 7,
      attempts: [
        { atPct: 10, outcome: "success", label: "job A" },
        { atPct: 45, outcome: "fail", label: "crash" },
        { atPct: 88, outcome: "success", label: "requeued" },
      ],
    },
  },
  "vercel-queue-consumer-groups": {
    archetype: "schedule",
    caption:
      "Vercel Queues acks the publish and notifies the consumer at once, so a consumer can begin before send() returns; writing before publish keeps the send-then-write race from dropping a message.",
    schedule: {
      label: "write, publish, consume (consume may start before send returns)",
      steps: 6,
      attempts: [
        { atPct: 12, outcome: "wait", label: "written" },
        { atPct: 48, outcome: "wait", label: "published" },
        { atPct: 90, outcome: "success", label: "consumed" },
      ],
    },
  },
  "indexeddb-sync-outbox": {
    archetype: "schedule",
    caption:
      "Client writes land in a durable IndexedDB outbox that survives reload; a paged drain walks the queue to the server in order, and a failed row waits for the next drain instead of being lost.",
    schedule: {
      label: "queue writes, drain to the server, retry a failed row",
      steps: 7,
      attempts: [
        { atPct: 12, outcome: "success", label: "w1" },
        { atPct: 45, outcome: "fail", label: "w2" },
        { atPct: 88, outcome: "success", label: "w2 retry" },
      ],
    },
  },
  "durable-object-alarm-scheduler": {
    archetype: "schedule",
    caption:
      "The timer lives with the entity as a DO alarm, firing exactly when due, instead of a per-minute cron sweeping a due-at query 1,440 times a day whether or not anything is due.",
    schedule: {
      label: "one alarm set on the entity, fired exactly at its due time",
      steps: 8,
      attempts: [
        { atPct: 6, outcome: "wait", label: "set" },
        { atPct: 88, outcome: "success", label: "fires" },
      ],
    },
  },
  "sveltekit-live-query-stream": {
    archetype: "schedule",
    caption: "query.live drives an async generator as an SSE stream with a per-process pub/sub hub; the finally block unregisters the listener on disconnect so a dropped client stops the pushes.",
    schedule: {
      label: "server pushes status ticks over SSE until the client disconnects",
      steps: 8,
      attempts: [
        { atPct: 10, outcome: "success", label: "tick" },
        { atPct: 38, outcome: "success", label: "tick" },
        { atPct: 66, outcome: "success", label: "tick" },
        { atPct: 94, outcome: "wait", label: "closed" },
      ],
    },
  },

  // ======================= FLOW (request / process / result) =======================
  "websocket-route-handler": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "A Next.js route handler upgrades to WebSocket via NextResponse.upgrade() on the Node runtime, powered by the bundled crossws, no extra install.",
    nodes: [
      { label: "upgrade", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "socket", result: "open", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "better-auth-jwks-cookie-cache": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "The JWKS is cached in a signed cookie, so token verification reads the local key instead of a network round trip on every request.",
    nodes: [
      { label: "verify", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "cookie", result: "cached", states: s("idle", "completed", "completed", "completed", "completed", "idle") },
    ],
  },
  "better-auth-provisioning-gate": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "validateUserInfo runs on every sign-in path; an allowlisted domain is admitted, an off-domain or anonymous session is refused at the gate.",
    nodes: [
      { label: "sign-in", states: s("idle", "running", "running", "completed", "completed", "idle") },
      { label: "admit", result: "member", error: "off-domain", states: s("idle", "idle", "running", "completed", "interrupted", "idle") },
    ],
  },
  "cloudflare-worker-test-harness": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "createTestHarness runs the production Worker build in a local preview; a Node test seeds DO SQLite, evicts, and asserts state survives the teardown.",
    nodes: [
      { label: "seed", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "assert", result: "survived", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "cloudflare-worker-cache-tags": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "A cache sits in front of the fetch handler; a hit never invokes the Worker, and a tagged write purges only the affected entries.",
    nodes: [
      { label: "request", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "cache", result: "hit", states: s("idle", "completed", "completed", "running", "completed", "idle") },
    ],
  },
  "durable-object-websocket-hibernation": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "A hibernating Durable Object evicts from memory between messages while the WebSocket stays open, so idle connections cost nothing until one wakes it.",
    nodes: [
      { label: "socket", result: "open", states: s("idle", "completed", "completed", "idle", "completed", "idle") },
      { label: "DO", result: "wake", states: s("idle", "idle", "running", "idle", "running", "idle") },
    ],
  },
  "durable-object-sql-tenant-db": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "One SQLite database per tenant lives inside the Durable Object that serves it, so a query is local rather than a WHERE clause across a shared table.",
    nodes: [
      { label: "tenant", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "own db", result: "rows", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "worker-rpc-promise-pipelining": {
    archetype: "flow",
    caption: "A chained RPC call pipelines across Workers in one round trip, so getCart then cart.items then item.product does not pay three network hops.",
    nodes: [{ label: "pipelined", result: "1 hop", states: s(...OK) }],
  },
  "artifacts-repo-provisioner": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "The control plane creates versioned Git repos at fleet scale, provisioning one per agent from a template instead of by hand.",
    nodes: [
      { label: "template", result: "ready", states: s("idle", "completed", "completed", "completed", "completed", "idle") },
      { label: "repo", result: "provisioned", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "artifacts-agent-commit-notes": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Attribution rides in git-notes, not the commit message, so it can be written after review and an eval score without rewriting history.",
    nodes: [
      { label: "commit", result: "sha", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "note", result: "attributed", states: s("idle", "idle", "idle", "running", "completed", "idle") },
    ],
  },
  "drizzle-pg-jit-query-layer": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Prepared statements bound at module scope with sql.placeholder skip re-planning; opt-in JIT mappers shape rows on the way out.",
    nodes: [
      { label: "prepared", states: s("idle", "completed", "completed", "completed", "completed", "idle") },
      { label: "query", result: "rows", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "drizzle-kit-migration-gate": {
    archetype: "flow",
    caption: "CI asserts the schema and the committed migration folder agree; a no_changes result is the pass, drift fails the gate.",
    nodes: [{ label: "schema check", result: "match", error: "drift", states: s("idle", "running", "running", "completed", "failed", "idle") }],
  },
  "drizzle-effect-pg-repository": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Drizzle query builders extend Effect directly; the seam sits at the repository, catching the query error by tag and re-raising a tagged domain error.",
    nodes: [
      { label: "query", states: s("idle", "running", "running", "completed", "failed", "idle") },
      { label: "repository", result: "domain", error: "NotFound", states: s("idle", "idle", "running", "completed", "failed", "idle") },
    ],
  },
  "drizzle-cache-tag-invalidation": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Cached reads carry $withCache tags; a raw SQL write invalidates exactly those tags, so the next read refills instead of serving a stale row.",
    nodes: [
      { label: "read", result: "cached", states: s("idle", "completed", "completed", "running", "completed", "idle") },
      { label: "write", result: "purged", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "prisma-driver-adapter-runtime": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Prisma 7 drops the Rust engine, so an explicit driver adapter supplies the pool; its defaults differ from v6 and are set here on purpose.",
    nodes: [
      { label: "adapter", result: "pool", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "query", result: "rows", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "prisma-client-extension-audit": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "A client extension injects deletedAt: null into reads and records an audit row on writes, the only interception point left after $use was removed.",
    nodes: [
      { label: "operation", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "audit", result: "logged", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "neon-http-composable-sql": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "A sql fragment stays inert until an outer query consumes it, renumbering placeholders in traversal order, so optional filters compose safely.",
    nodes: [
      { label: "fragment", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "query", result: "rows", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "deno-kv-leader-election": {
    archetype: "flow",
    caption:
      "withLock is a distributed compare-and-swap with an expireIn lease; candidates contend, one wins the lock, and the losers are held off rather than the lock wedging if the holder dies.",
    nodes: [
      { label: "node A", result: "leader", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "node B", error: "held", states: s("idle", "running", "interrupted", "interrupted", "interrupted", "idle") },
      { label: "node C", error: "held", states: s("idle", "running", "interrupted", "interrupted", "interrupted", "idle") },
    ],
  },
  "deno-kv-realtime-sync": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Every table is one KV document streamed over SSE via kv.watch; a client disconnect cancels the watch through stream teardown, no bookkeeping.",
    nodes: [
      { label: "mutate", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "subscribers", result: "synced", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "node-permission-sandbox": {
    archetype: "flow",
    caption: "A plugin runs in a child process under the permission model; a whitelisted read succeeds, an out-of-scope write gets ERR_ACCESS_DENIED.",
    nodes: [
      { label: "read data", result: "ok", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "write /etc", error: "DENIED", states: s("idle", "running", "running", "failed", "failed", "idle") },
    ],
  },
  "node-diagnostics-telemetry": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Requests are observed from outside through Node's diagnostics channels, so there is no instrumentation code in the handlers at all.",
    nodes: [
      { label: "request", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "channel", result: "traced", states: s("idle", "running", "completed", "completed", "completed", "idle") },
    ],
  },
  "rivet-dynamic-actor-registry": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "One dynamic definition backs every workspace; a load hook resolves untrusted actor source per key and runs it in a memory-capped Node process that dies on OOM instead of taking the host down.",
    nodes: [
      { label: "load", result: "source", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "isolate", result: "sandboxed", error: "OOM", states: s("idle", "idle", "running", "completed", "death", "idle") },
    ],
  },
  "sveltekit-explicit-env-vars": {
    archetype: "flow",
    caption: "One defineEnvVars table declares each variable's visibility and whether it inlines at build time, replacing prefix-based env guesswork.",
    nodes: [{ label: "env manifest", result: "declared", states: s(...OK) }],
  },
  "sveltekit-batched-query-refresh": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "query.batch collects the calls twenty components make in one macrotask into a single server invocation, eliminating the N+1.",
    nodes: [
      { label: "20 calls", states: s("idle", "running", "running", "completed", "completed", "idle") },
      { label: "1 batch", result: "resolved", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "elysia-plugin-scope-model": {
    archetype: "flow",
    caption: "An Elysia 2.0 auth plugin encodes the four renames stale code trips over, so scope and lifecycle hooks resolve under the new argument order.",
    nodes: [{ label: "plugin", result: "scoped", states: s(...OK) }],
  },
  "elysia-aot-build-manifest": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "A Bun.build step runs Elysia's Sucrose JIT ahead of time, so the handler codegen is baked at build instead of paid on every cold boot.",
    nodes: [
      { label: "build", states: s("idle", "running", "running", "completed", "completed", "idle") },
      { label: "boot", result: "instant", states: s("idle", "idle", "idle", "completed", "completed", "idle") },
    ],
  },
  "elysia-standard-schema-guard": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "One route validates with Zod inbound and TypeBox outbound; the guard documents the TypeBox v1 swap that two installed copies would break.",
    nodes: [
      { label: "Zod in", result: "valid", error: "422", states: s("idle", "running", "completed", "completed", "failed", "idle") },
      { label: "TypeBox out", result: "shaped", states: s("idle", "idle", "running", "completed", "idle", "idle") },
    ],
  },
  "bun-secrets-vault": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Secrets live in the OS credential store through Bun.secrets; a key index kept as one extra secret gives set, get, list, and rm a real list.",
    nodes: [
      { label: "set", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "keychain", result: "sealed", states: s("idle", "idle", "running", "completed", "completed", "idle") },
    ],
  },
  "bun-auth-gateway": {
    archetype: "flow",
    arrowBefore: 1,
    caption: "Bun.serve routes, Bun.CookieMap sessions, Bun.CSRF tokens, and Bun.password argon2id assemble a session gateway with no auth library.",
    nodes: [
      { label: "login", states: s("idle", "running", "running", "completed", "completed", "idle") },
      { label: "session", result: "cookie", error: "bad csrf", states: s("idle", "idle", "running", "completed", "failed", "idle") },
    ],
  },
  "fluid-compute-instance-safety": {
    archetype: "flow",
    caption: "Fluid shares one instance across concurrent invocations, so module-scope mutable state leaks across users; request state is kept per-invocation here, each user isolated.",
    nodes: [
      { label: "user A", result: "own", states: s("idle", "running", "completed", "completed", "completed", "idle") },
      { label: "user B", result: "own", states: s("idle", "running", "completed", "completed", "completed", "idle") },
    ],
  },
};

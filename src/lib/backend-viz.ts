import type { VizEntry } from "@/components/site/effect-viz";

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

const s = (...a: string[]) =>
  a as (
    | "idle"
    | "running"
    | "completed"
    | "failed"
    | "death"
    | "interrupted"
  )[];
const OK = ["idle", "running", "running", "completed", "completed", "idle"];
const OK_SLOW = ["idle", "running", "running", "running", "completed", "idle"];

// scope timelines: acquire in order, release in reverse (last acquired releases first)
const ACQ3_A = [
  "hidden",
  "pending",
  "pending",
  "pending",
  "pending",
  "pending",
  "running",
  "completed",
];
const ACQ3_B = [
  "hidden",
  "hidden",
  "pending",
  "pending",
  "pending",
  "running",
  "completed",
  "completed",
];
const ACQ3_C = [
  "hidden",
  "hidden",
  "hidden",
  "pending",
  "running",
  "completed",
  "completed",
  "completed",
];
const ACQ2_A = [
  "hidden",
  "pending",
  "pending",
  "pending",
  "running",
  "completed",
];
const ACQ2_B = [
  "hidden",
  "hidden",
  "pending",
  "running",
  "completed",
  "completed",
];
const sc = (...a: string[]) =>
  a as ("hidden" | "pending" | "running" | "completed")[];

export const backendViz: Record<string, VizEntry> = {
  // ======================= EFFECT =======================
  "effect-service-lifecycle-runtime": {
    control: "shutdown",
    variants: [
      {
        name: "clean stop",
        spec: {
          archetype: "scope",
          caption:
            "acquireRelease binds each teardown to its setup; on a clean stop the scope closes and finalizers run in reverse acquire order, so the connection pool drains after the workers that use it stop.",
          scope: {
            mode: "scope",
            node: {
              label: "server",
              result: "drained",
              states: s(
                "running",
                "running",
                "running",
                "running",
                "running",
                "running",
                "running",
                "completed",
              ),
            },
            finalizers: [
              { label: "connection pool", states: sc(...ACQ3_A) },
              { label: "fiberset workers", states: sc(...ACQ3_B) },
              { label: "http listener", states: sc(...ACQ3_C) },
            ],
          },
        },
      },
      {
        name: "sigterm",
        spec: {
          archetype: "scope",
          caption:
            "SIGTERM interrupts the root fiber; interruption closes the scope, and the same finalizers run in the same reverse order, so a deploy mid-request tears down exactly like a clean stop.",
          scope: {
            mode: "scope",
            node: {
              label: "server",
              states: s(
                "running",
                "running",
                "interrupted",
                "interrupted",
                "interrupted",
                "interrupted",
                "interrupted",
                "interrupted",
              ),
            },
            finalizers: [
              { label: "connection pool", states: sc(...ACQ3_A) },
              { label: "fiberset workers", states: sc(...ACQ3_B) },
              { label: "http listener", states: sc(...ACQ3_C) },
            ],
          },
        },
      },
      {
        name: "crash",
        spec: {
          archetype: "scope",
          caption:
            "A worker defect kills the fiber, but the scope still closes: every acquireRelease finalizer runs anyway, so even a crash cannot leak the pool or strand the listeners.",
          scope: {
            mode: "scope",
            node: {
              label: "server",
              error: "worker defect",
              states: s(
                "running",
                "running",
                "death",
                "death",
                "death",
                "death",
                "death",
                "death",
              ),
            },
            finalizers: [
              { label: "connection pool", states: sc(...ACQ3_A) },
              { label: "fiberset workers", states: sc(...ACQ3_B) },
              { label: "http listener", states: sc(...ACQ3_C) },
            ],
          },
        },
      },
    ],
  },
  "effect-sql-transactional-repository": {
    control: "outcome",
    variants: [
      {
        name: "commit",
        spec: {
          archetype: "ref",
          caption:
            "Debit and credit post inside one scoped transaction; the ledger balance moves atomically and the commit makes it durable.",
          ref: {
            label: "ledger balance",
            values: [1000, 950, 900, 850, 850, 850],
            request: {
              label: "post entry",
              states: s(
                "idle",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
              result: "committed",
            },
          },
        },
      },
      {
        name: "rollback",
        spec: {
          archetype: "ref",
          caption:
            "A decode failure inside the scope rolls the whole transaction back: every posted entry unwinds and the balance returns to where it started, never a half-written ledger.",
          ref: {
            label: "ledger balance",
            values: [1000, 950, 900, 1000, 1000, 1000],
            request: {
              label: "post entry",
              states: s(
                "idle",
                "completed",
                "completed",
                "failed",
                "failed",
                "idle",
              ),
              result: "ok",
              error: "rollback",
            },
          },
        },
      },
    ],
  },
  "effect-httpapi-derived-client": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "One HttpApi declaration derives the server routes, the typed client, and the OpenAPI doc, so the three cannot drift apart.",
    nodes: [
      { label: "HttpApi", result: "spec", states: s(...OK) },
      {
        label: "client",
        result: "typed",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "effect-rpc-contract-transport": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "One RpcGroup contract is imported by both sides; the transport underneath is swappable without touching either.",
    nodes: [
      { label: "RpcGroup", result: "contract", states: s(...OK) },
      {
        label: "call",
        result: "job.id",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "effect-durable-activity-workflow": {
    control: "outcome",
    variants: [
      {
        name: "eventually pays",
        spec: {
          archetype: "schedule",
          caption:
            "A dunning sequence retries a failed payment across real days with growing gaps; each Activity is journaled, so a mid-run deploy resumes at the next attempt instead of restarting from the top.",
          schedule: {
            durationMs: 8000,
            nodes: [
              {
                label: "charge",
                result: "paid",
                error: "declined",
                states: s(
                  "running",
                  "failed",
                  "running",
                  "failed",
                  "running",
                  "completed",
                ),
              },
              {
                label: "dunning",
                result: "settled",
                states: s(
                  "idle",
                  "interrupted",
                  "idle",
                  "interrupted",
                  "idle",
                  "completed",
                ),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.6, label: "3 days" },
              { kind: "run", w: 1 },
              { kind: "gap", w: 2.2, label: "7 days" },
              { kind: "run", w: 1 },
            ],
          },
        },
      },
      {
        name: "hard decline",
        spec: {
          archetype: "schedule",
          caption:
            "A hard decline short-circuits the schedule: the workflow cancels instead of paying for attempts that cannot succeed, and the journal records the terminal state.",
          schedule: {
            durationMs: 4000,
            nodes: [
              {
                label: "charge",
                error: "card blocked",
                states: s("running", "death", "death"),
              },
              {
                label: "dunning",
                states: s("idle", "interrupted", "interrupted"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.2, label: "cancelled" },
            ],
          },
        },
      },
    ],
  },
  "effect-cluster-entity-sharding": {
    archetype: "flow",
    arrowBefore: 2,
    caption:
      "Every account is a single-writer cluster entity; two withdrawals to the same account serialize on one shard by the runtime shape, so the second waits instead of double-spending against a SELECT FOR UPDATE.",
    nodes: [
      {
        label: "withdraw A",
        result: "ok",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "withdraw B",
        states: s("idle", "running", "running", "running", "completed", "idle"),
      },
      {
        label: "entity",
        result: "serialized",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "effect-durable-workflow-queue": {
    archetype: "schedule",
    caption:
      "A DurableQueue persists the payout and suspends the workflow until a worker settles it; the checkpoint is replay-safe, so a restart resumes at the suspend point rather than re-charging.",
    schedule: {
      durationMs: 6000,
      nodes: [
        {
          label: "payout",
          result: "queued",
          states: s("running", "completed", "completed", "completed"),
        },
        {
          label: "worker",
          result: "settled",
          states: s("idle", "interrupted", "running", "completed"),
        },
      ],
      segments: [
        { kind: "run", w: 1 },
        { kind: "gap", w: 2, label: "suspended, survives restart" },
        { kind: "run", w: 1 },
      ],
    },
  },
  "effect-workflow-v4-migration": {
    archetype: "flow",
    caption:
      "The same workflow annotated with the six verified Effect 3 to 4 breaks: the package move, tag-first make, and the generic-bound change.",
    nodes: [{ label: "migrate", result: "v4", states: s(...OK_SLOW) }],
  },
  "effect-cloudflare-event-api": {
    control: "outcome",
    variants: [
      {
        name: "200",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "A schema validates the HTTP boundary, a traced service runs, KV persists, and waitUntil finishes background work after the response is sent.",
          nodes: [
            {
              label: "request",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "service",
              result: "kv",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "response",
              result: "200",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "422",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "A malformed body never reaches the service: the schema rejects it at the boundary as a tagged error, and the handler maps it to a 422 with the decode details.",
          nodes: [
            {
              label: "request",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "schema",
              error: "decode failed",
              states: s("idle", "idle", "running", "failed", "failed", "idle"),
            },
            {
              label: "response",
              result: "422",
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
      },
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
      request: {
        label: "cache miss",
        states: s(
          "idle",
          "completed",
          "completed",
          "interrupted",
          "completed",
          "idle",
        ),
        result: "load",
        error: "coalesced",
      },
    },
  },
  "effect-circuit-breaker-budget": {
    archetype: "ref",
    caption:
      "The retry budget is a token bucket: traffic funds tokens, each retry spends one, and an empty bucket rewrites the next failure as non-retryable, so retries can never exceed a fixed share of live traffic.",
    ref: {
      label: "retry budget",
      values: [4, 3, 2, 1, 0, 4],
      request: {
        label: "retry",
        states: s(
          "idle",
          "completed",
          "completed",
          "completed",
          "failed",
          "idle",
        ),
        result: "spent",
        error: "non-retryable",
      },
    },
  },
  "effect-shard-router-backpressure": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "A consistent-hash ring places cold keys; a key that crosses a frequency threshold splits by power-of-two-choices and dispatches to the shallower of two shards, so one hot key spreads across workers instead of drowning one.",
    nodes: [
      {
        label: "hot key",
        states: s(
          "idle",
          "running",
          "running",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "shard 1",
        result: "half",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
      {
        label: "shard 4",
        result: "half",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "effect-fencing-token-hlc": {
    archetype: "ref",
    caption:
      "A lease manager mints strictly increasing fencing tokens; the resource remembers the highest it has accepted and rejects any lower one, so a GC-paused old leader that wakes up cannot overwrite the new one.",
    ref: {
      label: "accepted token",
      values: [6, 7, 8, 8, 8, 8],
      challenger: {
        label: "stale leader (5)",
        states: s("idle", "idle", "idle", "failed", "idle", "idle"),
        error: "fenced out",
      },
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
    control: "traffic",
    variants: [
      {
        name: "steady",
        spec: {
          archetype: "ref",
          caption:
            "Under steady traffic the sliding window refills as fast as it drains; every request passes and the budget hovers, consistent across isolates and regions.",
          ref: {
            label: "window budget",
            values: [5, 4, 4, 5, 4, 5],
            request: {
              label: "request",
              states: s(
                "idle",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
              result: "pass",
            },
          },
        },
      },
      {
        name: "burst",
        spec: {
          archetype: "ref",
          caption:
            "A burst drains the window to zero; each increment is atomic in KV, so the over-limit request is rejected with 429 on the real count, not a stale one.",
          ref: {
            label: "window budget",
            values: [5, 3, 1, 0, 0, 5],
            request: {
              label: "request",
              states: s(
                "idle",
                "completed",
                "completed",
                "interrupted",
                "interrupted",
                "idle",
              ),
              result: "pass",
              error: "429",
            },
          },
        },
      },
    ],
  },
  "better-auth-atomic-rate-limit": {
    archetype: "ref",
    caption:
      "INCR and PEXPIRE run inside one Lua call, so concurrent sign-in attempts draw down the same counter atomically; once the budget is spent the extra attempt cannot pass on a stale count.",
    ref: {
      label: "attempts left",
      values: [5, 3, 1, 0, 0, 5],
      request: {
        label: "sign-in",
        states: s(
          "idle",
          "completed",
          "completed",
          "interrupted",
          "interrupted",
          "idle",
        ),
        result: "ok",
        error: "429",
      },
    },
  },
  "durable-object-rpc-rate-limit": {
    archetype: "ref",
    caption:
      "One Durable Object per API key holds a strongly consistent token bucket in DO SQLite; the fronting Worker calls take() over RPC, and an exhausted bucket rejects until it refills.",
    ref: {
      label: "token bucket",
      values: [6, 4, 2, 0, 3, 6],
      request: {
        label: "take()",
        states: s(
          "idle",
          "completed",
          "completed",
          "interrupted",
          "completed",
          "idle",
        ),
        result: "ok",
        error: "empty",
      },
    },
  },

  // ======================= COUNTERS / CURSORS (ref) =======================
  "d1-session-read-replica": {
    archetype: "ref",
    caption:
      "Sequential consistency is scoped to one D1 session bookmark; a write advances it and the follow-up read carries it, so a replica cannot answer with a version older than the write.",
    ref: {
      label: "session bookmark",
      values: ["v40", "v41", "v42", "v42", "v43", "v43"],
    },
  },

  // ======================= LIFECYCLE / SCOPE / LOCKS (scope) =======================
  "fluid-stream-lifecycle": {
    control: "outcome",
    variants: [
      {
        name: "clean close",
        spec: {
          archetype: "scope",
          caption:
            "A long-lived SSE endpoint opens on Fluid compute; when the stream ends, the finally block unregisters the listener and closes the stream in reverse open order.",
          scope: {
            mode: "scope",
            node: {
              label: "stream",
              result: "closed",
              states: s(
                "running",
                "running",
                "running",
                "running",
                "running",
                "completed",
              ),
            },
            finalizers: [
              { label: "open stream", states: sc(...ACQ2_A) },
              { label: "register listener", states: sc(...ACQ2_B) },
            ],
          },
        },
      },
      {
        name: "client drops",
        spec: {
          archetype: "scope",
          caption:
            "A client that disconnects mid-stream triggers the same finally path: the listener unregisters and the stream releases, so a shared Fluid instance never leaks the subscription to the next request.",
          scope: {
            mode: "scope",
            node: {
              label: "stream",
              states: s(
                "running",
                "running",
                "interrupted",
                "interrupted",
                "interrupted",
                "interrupted",
              ),
            },
            finalizers: [
              { label: "open stream", states: sc(...ACQ2_A) },
              { label: "register listener", states: sc(...ACQ2_B) },
            ],
          },
        },
      },
    ],
  },
  "pg-advisory-lock-keyset-scan": {
    control: "outcome",
    variants: [
      {
        name: "commit",
        spec: {
          archetype: "scope",
          caption:
            "pg_advisory_xact_lock is transaction-scoped: the lock is acquired inside the job's transaction and released when it commits, no matched unlock call to forget.",
          scope: {
            mode: "scope",
            node: {
              label: "job",
              result: "done",
              states: s(
                "running",
                "running",
                "running",
                "running",
                "running",
                "completed",
              ),
            },
            finalizers: [
              { label: "begin transaction", states: sc(...ACQ2_A) },
              { label: "advisory xact lock", states: sc(...ACQ2_B) },
            ],
          },
        },
      },
      {
        name: "worker dies",
        spec: {
          archetype: "scope",
          caption:
            "A worker that dies mid-job aborts the transaction, and the xact-scoped lock releases with it, so the crash never strands a lock on a pooled connection the way a session-level lock would.",
          scope: {
            mode: "scope",
            node: {
              label: "job",
              error: "worker crashed",
              states: s(
                "running",
                "running",
                "death",
                "death",
                "death",
                "death",
              ),
            },
            finalizers: [
              { label: "begin transaction", states: sc(...ACQ2_A) },
              { label: "advisory xact lock", states: sc(...ACQ2_B) },
            ],
          },
        },
      },
    ],
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
    control: "outcome",
    variants: [
      {
        name: "succeeds",
        spec: {
          archetype: "flow",
          caption:
            "The happy path never touches the compensations: charge, reserve, and confirm each complete, and the registered rollback handlers simply expire with the workflow.",
          nodes: [
            {
              label: "charge",
              result: "done",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "reserve seats",
              result: "held",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "confirm",
              result: "booked",
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
      },
      {
        name: "terminal failure",
        spec: {
          archetype: "flow",
          caption:
            "A terminal failure runs each step's registered compensation in reverse start order, so the charge is refunded and the seats revoked instead of a half-applied booking.",
          nodes: [
            {
              label: "charge",
              result: "done",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "interrupted",
                "idle",
              ),
            },
            {
              label: "reserve seats",
              error: "sold out",
              states: s("idle", "idle", "running", "failed", "failed", "idle"),
            },
            {
              label: "rollback",
              result: "refunded",
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
      },
    ],
  },

  // ======================= QUEUES / SCHEDULES (schedule) =======================
  "bun-sqlite-job-queue": {
    control: "job",
    variants: [
      {
        name: "retries, then succeeds",
        spec: {
          archetype: "schedule",
          caption:
            "Jobs are claimed race-free with UPDATE ... RETURNING so two workers never take the same row; a failure retries with exponential backoff and eventually completes.",
          schedule: {
            durationMs: 6500,
            nodes: [
              {
                label: "job",
                result: "done",
                error: "attempt failed",
                states: s("running", "failed", "running", "completed"),
              },
              {
                label: "queue",
                result: "empty",
                states: s("idle", "interrupted", "idle", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.6, label: "backoff 2s" },
              { kind: "run", w: 1 },
            ],
          },
        },
      },
      {
        name: "dead-letters",
        spec: {
          archetype: "schedule",
          caption:
            "A job past its max-attempts budget lands in the dead_letters table instead of looping forever; the visibility timeout has already reclaimed it from any crashed worker.",
          schedule: {
            durationMs: 7500,
            nodes: [
              {
                label: "job",
                error: "dead_letters",
                states: s(
                  "running",
                  "failed",
                  "running",
                  "failed",
                  "running",
                  "death",
                ),
              },
              {
                label: "queue",
                result: "moved on",
                states: s(
                  "idle",
                  "interrupted",
                  "idle",
                  "interrupted",
                  "idle",
                  "completed",
                ),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.2, label: "backoff 2s" },
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.8, label: "backoff 4s" },
              { kind: "run", w: 1 },
            ],
          },
        },
      },
    ],
  },
  "node-sqlite-worker-pool": {
    archetype: "schedule",
    caption:
      "A node:sqlite queue feeds a worker_threads pool; a job is claimed with UPDATE ... RETURNING only when a worker is idle, and a row left running by a crash is re-queued on boot rather than lost.",
    schedule: {
      durationMs: 6000,
      nodes: [
        {
          label: "job",
          result: "done",
          error: "worker crashed",
          states: s("running", "failed", "running", "completed"),
        },
        {
          label: "pool",
          result: "idle",
          states: s("running", "idle", "running", "completed"),
        },
      ],
      segments: [
        { kind: "run", w: 1 },
        { kind: "gap", w: 1.4, label: "requeued on boot" },
        { kind: "run", w: 1 },
      ],
    },
  },
  "vercel-queue-consumer-groups": {
    archetype: "schedule",
    caption:
      "Vercel Queues acks the publish and notifies the consumer at once, so a consumer can begin before send() returns; writing before publish keeps the send-then-write race from dropping a message.",
    schedule: {
      durationMs: 5000,
      nodes: [
        {
          label: "producer",
          result: "acked",
          states: s("running", "completed", "completed"),
        },
        {
          label: "consumer",
          result: "processed",
          states: s("running", "running", "completed"),
        },
      ],
      segments: [
        { kind: "run", w: 1 },
        { kind: "run", w: 1.2 },
      ],
    },
  },
  "indexeddb-sync-outbox": {
    archetype: "schedule",
    caption:
      "Client writes land in a durable IndexedDB outbox that survives reload; a paged drain walks the queue to the server in order, and a failed row waits for the next drain instead of being lost.",
    schedule: {
      durationMs: 6000,
      nodes: [
        {
          label: "outbox",
          result: "drained",
          states: s("running", "completed", "running", "completed"),
        },
        {
          label: "server",
          result: "📤 synced",
          error: "offline",
          states: s("idle", "failed", "running", "completed"),
        },
      ],
      segments: [
        { kind: "run", w: 1 },
        { kind: "gap", w: 1.8, label: "offline, survives reload" },
        { kind: "run", w: 1 },
      ],
    },
  },
  "durable-object-alarm-scheduler": {
    archetype: "schedule",
    caption:
      "The timer lives with the entity as a DO alarm, firing exactly when due, instead of a per-minute cron sweeping a due-at query 1,440 times a day whether or not anything is due.",
    schedule: {
      durationMs: 6000,
      nodes: [
        {
          label: "entity",
          result: "scheduled",
          states: s("running", "completed", "completed", "completed"),
        },
        {
          label: "alarm()",
          result: "⏰ fired",
          notify: { atStep: 3, message: "exactly at due time", icon: "⏰" },
          states: s("idle", "idle", "running", "completed"),
        },
      ],
      segments: [
        { kind: "run", w: 0.7 },
        { kind: "gap", w: 3.2, label: "36h, zero polling" },
        { kind: "run", w: 0.7 },
      ],
    },
  },
  "sveltekit-live-query-stream": {
    archetype: "schedule",
    caption:
      "query.live drives an async generator as an SSE stream with a per-process pub/sub hub; the finally block unregisters the listener on disconnect so a dropped client stops the pushes.",
    schedule: {
      durationMs: 7000,
      nodes: [
        {
          label: "live query",
          result: "tick",
          states: s(
            "running",
            "completed",
            "running",
            "completed",
            "running",
            "completed",
          ),
        },
        {
          label: "client",
          result: "closed",
          states: s(
            "running",
            "running",
            "running",
            "running",
            "running",
            "completed",
          ),
        },
      ],
      segments: [
        { kind: "run", w: 1 },
        { kind: "gap", w: 0.9, label: "idle" },
        { kind: "run", w: 1 },
        { kind: "gap", w: 0.9, label: "idle" },
        { kind: "run", w: 1 },
      ],
    },
  },

  // ======================= FLOW (request / process / result) =======================
  "websocket-route-handler": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "A Next.js route handler upgrades to WebSocket via NextResponse.upgrade() on the Node runtime, powered by the bundled crossws, no extra install.",
    nodes: [
      {
        label: "upgrade",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "socket",
        result: "open",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "better-auth-jwks-cookie-cache": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "The JWKS is cached in a signed cookie, so token verification reads the local key instead of a network round trip on every request.",
    nodes: [
      {
        label: "verify",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "cookie",
        result: "cached",
        states: s(
          "idle",
          "completed",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
    ],
  },
  "better-auth-provisioning-gate": {
    control: "sign-in",
    variants: [
      {
        name: "allowed domain",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "validateUserInfo runs on every sign-in path; an allowlisted domain is admitted and the tenant membership is provisioned.",
          nodes: [
            {
              label: "sign-in",
              states: s(
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "admit",
              result: "member",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "off-domain",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "An off-domain or anonymous session is refused at the gate before any user row exists, across create-user, link-account, and SSO sign-in alike.",
          nodes: [
            {
              label: "sign-in",
              states: s(
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "admit",
              error: "domain not allowed",
              states: s(
                "idle",
                "idle",
                "running",
                "interrupted",
                "interrupted",
                "idle",
              ),
            },
          ],
        },
      },
    ],
  },
  "cloudflare-worker-test-harness": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "createTestHarness runs the production Worker build in a local preview; a Node test seeds DO SQLite, evicts, and asserts state survives the teardown.",
    nodes: [
      {
        label: "seed",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "assert",
        result: "survived",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "cloudflare-worker-cache-tags": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "A cache sits in front of the fetch handler; a hit never invokes the Worker, and a tagged write purges only the affected entries.",
    nodes: [
      {
        label: "request",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "cache",
        result: "hit",
        states: s(
          "idle",
          "completed",
          "completed",
          "running",
          "completed",
          "idle",
        ),
      },
    ],
  },
  "durable-object-websocket-hibernation": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "A hibernating Durable Object evicts from memory between messages while the WebSocket stays open, so idle connections cost nothing until one wakes it.",
    nodes: [
      {
        label: "socket",
        result: "open",
        states: s(
          "idle",
          "completed",
          "completed",
          "idle",
          "completed",
          "idle",
        ),
      },
      {
        label: "DO",
        result: "wake",
        states: s("idle", "idle", "running", "idle", "running", "idle"),
      },
    ],
  },
  "durable-object-sql-tenant-db": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "One SQLite database per tenant lives inside the Durable Object that serves it, so a query is local rather than a WHERE clause across a shared table.",
    nodes: [
      {
        label: "tenant",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "own db",
        result: "rows",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "worker-rpc-promise-pipelining": {
    archetype: "flow",
    caption:
      "A chained RPC call pipelines across Workers in one round trip, so getCart then cart.items then item.product does not pay three network hops.",
    nodes: [{ label: "pipelined", result: "1 hop", states: s(...OK) }],
  },
  "artifacts-repo-provisioner": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "The control plane creates versioned Git repos at fleet scale, provisioning one per agent from a template instead of by hand.",
    nodes: [
      {
        label: "template",
        result: "ready",
        states: s(
          "idle",
          "completed",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "repo",
        result: "provisioned",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "artifacts-agent-commit-notes": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "Attribution rides in git-notes, not the commit message, so it can be written after review and an eval score without rewriting history.",
    nodes: [
      {
        label: "commit",
        result: "sha",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "note",
        result: "attributed",
        states: s("idle", "idle", "idle", "running", "completed", "idle"),
      },
    ],
  },
  "drizzle-pg-jit-query-layer": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "Prepared statements bound at module scope with sql.placeholder skip re-planning; opt-in JIT mappers shape rows on the way out.",
    nodes: [
      {
        label: "prepared",
        states: s(
          "idle",
          "completed",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "query",
        result: "rows",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "drizzle-kit-migration-gate": {
    control: "ci run",
    variants: [
      {
        name: "in sync",
        spec: {
          archetype: "flow",
          caption:
            "CI asserts the schema and the committed migration folder agree; a no_changes result is the pass condition and the gate stays green.",
          nodes: [
            {
              label: "schema check",
              result: "no_changes",
              states: s(
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "drift",
        spec: {
          archetype: "flow",
          caption:
            "A schema edit without a committed migration fails the gate in CI, so drift is caught in review instead of at deploy time.",
          nodes: [
            {
              label: "schema check",
              error: "uncommitted drift",
              states: s(
                "idle",
                "running",
                "running",
                "failed",
                "failed",
                "idle",
              ),
            },
          ],
        },
      },
    ],
  },
  "drizzle-effect-pg-repository": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "Drizzle query builders extend Effect directly; the seam sits at the repository, catching the query error by tag and re-raising a tagged domain error.",
    nodes: [
      {
        label: "query",
        states: s("idle", "running", "running", "completed", "failed", "idle"),
      },
      {
        label: "repository",
        result: "domain",
        error: "NotFound",
        states: s("idle", "idle", "running", "completed", "failed", "idle"),
      },
    ],
  },
  "drizzle-cache-tag-invalidation": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "Cached reads carry $withCache tags; a raw SQL write invalidates exactly those tags, so the next read refills instead of serving a stale row.",
    nodes: [
      {
        label: "read",
        result: "cached",
        states: s(
          "idle",
          "completed",
          "completed",
          "running",
          "completed",
          "idle",
        ),
      },
      {
        label: "write",
        result: "purged",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "prisma-driver-adapter-runtime": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "Prisma 7 drops the Rust engine, so an explicit driver adapter supplies the pool; its defaults differ from v6 and are set here on purpose.",
    nodes: [
      {
        label: "adapter",
        result: "pool",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "query",
        result: "rows",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "prisma-client-extension-audit": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "A client extension injects deletedAt: null into reads and records an audit row on writes, the only interception point left after $use was removed.",
    nodes: [
      {
        label: "operation",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "audit",
        result: "logged",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "neon-http-composable-sql": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "A sql fragment stays inert until an outer query consumes it, renumbering placeholders in traversal order, so optional filters compose safely.",
    nodes: [
      {
        label: "fragment",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "query",
        result: "rows",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "deno-kv-leader-election": {
    archetype: "flow",
    caption:
      "withLock is a distributed compare-and-swap with an expireIn lease; candidates contend, one wins the lock, and the losers are held off rather than the lock wedging if the holder dies.",
    nodes: [
      {
        label: "node A",
        result: "👑 leader",
        notify: { atStep: 2, message: "lease acquired", icon: "👑" },
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "node B",
        error: "held",
        states: s(
          "idle",
          "running",
          "interrupted",
          "interrupted",
          "interrupted",
          "idle",
        ),
      },
      {
        label: "node C",
        error: "held",
        states: s(
          "idle",
          "running",
          "interrupted",
          "interrupted",
          "interrupted",
          "idle",
        ),
      },
    ],
  },
  "deno-kv-realtime-sync": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "Every table is one KV document streamed over SSE via kv.watch; a client disconnect cancels the watch through stream teardown, no bookkeeping.",
    nodes: [
      {
        label: "mutate",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "subscribers",
        result: "🔄 synced",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "node-permission-sandbox": {
    archetype: "flow",
    caption:
      "A plugin runs in a child process under the permission model; a whitelisted read succeeds, an out-of-scope write gets ERR_ACCESS_DENIED.",
    nodes: [
      {
        label: "read data",
        result: "ok",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "write /etc",
        error: "DENIED",
        states: s("idle", "running", "running", "failed", "failed", "idle"),
      },
    ],
  },
  "node-diagnostics-telemetry": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "Requests are observed from outside through Node's diagnostics channels, so there is no instrumentation code in the handlers at all.",
    nodes: [
      {
        label: "request",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "channel",
        result: "traced",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
    ],
  },
  "rivet-dynamic-actor-registry": {
    control: "tenant code",
    variants: [
      {
        name: "healthy",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "One dynamic definition backs every workspace; the load hook resolves the tenant's actor source per key and it runs inside a memory-capped Node process.",
          nodes: [
            {
              label: "load",
              result: "source",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "isolate",
              result: "sandboxed",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "oom kill",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "A tenant that leaks memory hits the process cap and dies alone: the runtime kills that isolate instead of the host, and the other workspaces never notice.",
          nodes: [
            {
              label: "load",
              result: "source",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "isolate",
              error: "OOM killed",
              states: s("idle", "idle", "running", "running", "death", "idle"),
            },
          ],
        },
      },
    ],
  },
  "sveltekit-explicit-env-vars": {
    archetype: "flow",
    caption:
      "One defineEnvVars table declares each variable's visibility and whether it inlines at build time, replacing prefix-based env guesswork.",
    nodes: [{ label: "env manifest", result: "declared", states: s(...OK) }],
  },
  "sveltekit-batched-query-refresh": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "query.batch collects the calls twenty components make in one macrotask into a single server invocation, eliminating the N+1.",
    nodes: [
      {
        label: "20 calls",
        states: s(
          "idle",
          "running",
          "running",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "1 batch",
        result: "[20 calls → 1]",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "elysia-plugin-scope-model": {
    archetype: "flow",
    caption:
      "An Elysia 2.0 auth plugin encodes the four renames stale code trips over, so scope and lifecycle hooks resolve under the new argument order.",
    nodes: [{ label: "plugin", result: "scoped", states: s(...OK) }],
  },
  "elysia-aot-build-manifest": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "A Bun.build step runs Elysia's Sucrose JIT ahead of time, so the handler codegen is baked at build instead of paid on every cold boot.",
    nodes: [
      {
        label: "build",
        states: s(
          "idle",
          "running",
          "running",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "boot",
        result: "instant",
        states: s("idle", "idle", "idle", "completed", "completed", "idle"),
      },
    ],
  },
  "elysia-standard-schema-guard": {
    control: "payload",
    variants: [
      {
        name: "valid",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "One route validates with Zod inbound and TypeBox outbound; a valid deployment body passes both schemas and the response is shaped on the way out.",
          nodes: [
            {
              label: "Zod in",
              result: "valid",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "TypeBox out",
              result: "shaped",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "invalid",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "An invalid body fails the Zod guard before the handler runs, returning 422; the TypeBox response schema never executes.",
          nodes: [
            {
              label: "Zod in",
              error: "422",
              states: s(
                "idle",
                "running",
                "failed",
                "failed",
                "failed",
                "idle",
              ),
            },
            {
              label: "TypeBox out",
              states: s("idle", "idle", "idle", "idle", "idle", "idle"),
            },
          ],
        },
      },
    ],
  },
  "bun-secrets-vault": {
    archetype: "flow",
    arrowBefore: 1,
    caption:
      "Secrets live in the OS credential store through Bun.secrets; a key index kept as one extra secret gives set, get, list, and rm a real list.",
    nodes: [
      {
        label: "set",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "keychain",
        result: "🔒 sealed",
        states: s("idle", "idle", "running", "completed", "completed", "idle"),
      },
    ],
  },
  "bun-auth-gateway": {
    control: "request",
    variants: [
      {
        name: "valid login",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Bun.password verifies the argon2id hash, Bun.CSRF checks the token bound to the session id, and Bun.CookieMap sets the session cookie automatically.",
          nodes: [
            {
              label: "login",
              states: s(
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "session",
              result: "cookie set",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "csrf mismatch",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "A token that does not match the session id fails Bun.CSRF verification and the request is rejected before the password check spends any argon2id work.",
          nodes: [
            {
              label: "login",
              states: s(
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "session",
              error: "csrf mismatch",
              states: s("idle", "idle", "running", "failed", "failed", "idle"),
            },
          ],
        },
      },
    ],
  },
  "fluid-compute-instance-safety": {
    archetype: "flow",
    caption:
      "Fluid shares one instance across concurrent invocations, so module-scope mutable state leaks across users; request state is kept per-invocation here, each user isolated.",
    nodes: [
      {
        label: "user A",
        result: "own",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
      {
        label: "user B",
        result: "own",
        states: s(
          "idle",
          "running",
          "completed",
          "completed",
          "completed",
          "idle",
        ),
      },
    ],
  },
};

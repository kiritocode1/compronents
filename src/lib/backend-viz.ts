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
    control: "three artefacts",
    variants: [
      {
        name: "maintained by hand",
        spec: {
          archetype: "flow",
          caption:
            "The server routes, the client SDK, and the OpenAPI file are three artefacts that are supposed to agree. The server renamed title to headline last sprint; the SDK still types title. It compiles, ships, and returns undefined in production, the drift no build step can see.",
          code: `sdk.getPost().title // server renamed it to headline weeks ago`,
          nodes: [
            {
              label: "server",
              result: "{ headline }",
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
              label: "hand-written sdk",
              result: "types { title }",
              token: "sdk.getPost().title",
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
              label: "production",
              error: "undefined at runtime",
              notify: {
                atStep: 2,
                message: "three copies, silent drift",
                icon: "📄",
              },
              states: s("idle", "idle", "running", "death", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "derived from one",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "The HttpApi declaration is the only artefact: the server routes implement it, HttpApiClient.make derives the client from it, and the OpenAPI doc is generated from it. The rename is now ONE edit, and every consumer that still says title fails to compile.",
          code: `const client = yield* HttpApiClient.make(ContentApi)`,
          nodes: [
            {
              label: "HttpApi spec",
              result: "one source",
              token: "ContentApi",
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
              label: "server + client + docs",
              result: "all derived, in sync",
              token: "HttpApiClient.make",
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
    ],
  },
  "effect-rpc-contract-transport": {
    control: "transport",
    variants: [
      {
        name: "http",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Server and client both import the same RpcGroup contract, and the transport is provided as a layer: here HTTP. Note the result: job.id, typed end to end, with no fetch wrapper and no types package in the middle.",
          code: `RpcServer.layer(JobsRpc).pipe(Layer.provide(HttpTransport))`,
          nodes: [
            {
              label: "JobsRpc contract",
              result: "shared import",
              token: "RpcServer.layer(JobsRpc)",
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
              label: "call over http",
              result: "job.id",
              token: "HttpTransport",
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
        name: "websocket",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Same contract, same handlers, same caller: only the provided layer changed. The identical job.id comes back over a socket, which is the whole argument: the transport is configuration, not architecture.",
          code: `RpcServer.layer(JobsRpc).pipe(Layer.provide(SocketTransport))`,
          nodes: [
            {
              label: "JobsRpc contract",
              result: "unchanged",
              token: "RpcServer.layer(JobsRpc)",
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
              label: "call over ws",
              result: "job.id, same",
              token: "SocketTransport",
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
    ],
  },
  "effect-durable-activity-workflow": {
    control: "engine",
    variants: [
      {
        name: "in-memory + deploy",
        spec: {
          archetype: "schedule",
          caption:
            "A plain async function holds this flow in process memory, and a deploy ships on day 2, in the middle of the three-day wait. The restarted process has no idea attempt 1 ever ran, so it starts from the top and charges the card AGAIN. The customer paid twice because the flow could not remember.",
          code: `await charge(invoice); await sleep(days(3)) // deploy erases this`,
          schedule: {
            durationMs: 7000,
            nodes: [
              {
                label: "charge",
                result: "charged again",
                token: "charge(invoice)",
                states: s(
                  "running",
                  "completed",
                  "idle",
                  "running",
                  "completed",
                ),
              },
              {
                label: "customer",
                error: "charged twice",
                notify: {
                  atStep: 3,
                  message: "no journal, no memory",
                  icon: "💸",
                },
                states: s("idle", "completed", "completed", "running", "death"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.4, label: "deploy ships, memory gone" },
              { kind: "run", w: 1 },
              { kind: "gap", w: 0.8, label: "restarted from the top" },
            ],
          },
        },
      },
      {
        name: "durable + deploy",
        spec: {
          archetype: "schedule",
          caption:
            "The same flow as a durable workflow: every Activity result is journaled before the next step runs. The same deploy ships during the wait, and on restart the replay hands back attempt 1's recorded result and fast-forwards to the first Activity that never finished. One charge per attempt, ever.",
          code: `yield* Activity.make("charge-1", charge(invoice)) // journaled once`,
          schedule: {
            durationMs: 8000,
            nodes: [
              {
                label: "charge",
                result: "paid",
                error: "declined",
                token: 'Activity.make("charge-1"',
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
                label: "journal",
                result: "replayed, not re-run",
                notify: {
                  atStep: 2,
                  message: "deploy survived, resumed here",
                  icon: "📓",
                },
                states: s(
                  "idle",
                  "completed",
                  "completed",
                  "completed",
                  "completed",
                  "completed",
                ),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.6, label: "3 days, deploy ships here" },
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
      "The account holds $100 and two $60 withdrawals arrive at once. Both target the same single-writer entity, so B queues behind A instead of racing it: A drains the balance to $40, then B runs against the REAL balance and is refused. Read the results in order; the second write saw the first one. No lock was taken because the runtime shape is the lock.",
    code: `yield* entity.send(account, withdraw(60)) // one writer per account`,
    nodes: [
      {
        label: "withdraw A ($60)",
        result: "bal $40",
        token: "entity.send",
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
        label: "withdraw B ($60)",
        error: "insufficient funds",
        notify: { atStep: 2, message: "queued behind A", icon: "🔒" },
        states: s("idle", "running", "running", "running", "failed", "idle"),
      },
      {
        label: "account",
        result: "$40, not -$20",
        token: "withdraw(60)",
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
    control: "guard",
    variants: [
      {
        name: "off (stampede)",
        spec: {
          archetype: "flow",
          arrowBefore: 3,
          caption:
            "The hot key expires and every concurrent miss recomputes it independently: three misses become three identical database loads, and at real traffic a single expiry becomes thousands. Watch the database take one load per miss until it dies.",
          code: `const value = yield* db.load(key) // every miss pays this`,
          nodes: [
            {
              label: "miss A",
              result: "load #1",
              token: "db.load(key)",
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
              label: "miss B",
              result: "load #2",
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
              label: "miss C",
              result: "load #3",
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
              label: "database",
              error: "3x identical loads",
              notify: {
                atStep: 3,
                message: "same key, three loads",
                icon: "🔥",
              },
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "death",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "single-flight",
        spec: {
          archetype: "flow",
          arrowBefore: 3,
          caption:
            "With the guard, the first miss starts the one origin load and every other miss waits on that same fiber. All three resolve with the identical value v42 from a single database read: same inputs, one load, three results.",
          code: `const value = yield* cache.get(key) // misses coalesce onto one fiber`,
          nodes: [
            {
              label: "miss A",
              result: "v42",
              token: "cache.get(key)",
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
              label: "miss B",
              result: "v42",
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
              label: "miss C",
              result: "v42",
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
              label: "database",
              result: "1 load",
              notify: {
                atStep: 3,
                message: "one read served all three",
                icon: "🛡️",
              },
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
    ],
  },
  "effect-circuit-breaker-budget": {
    control: "breaker",
    variants: [
      {
        name: "off (retry storm)",
        spec: {
          archetype: "flow",
          arrowBefore: 3,
          caption:
            "The dependency wobbles and every caller retries in lockstep: each failure spawns another attempt, the attempts multiply the load, and the dependency that needed breathing room gets hammered until it stops answering entirely. The retries caused the outage.",
          code: `yield* call(dep).pipe(Effect.retry(forever)) // load multiplies`,
          nodes: [
            {
              label: "attempt 1",
              error: "timeout",
              token: "call(dep)",
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
              label: "retry 2",
              error: "timeout",
              states: s("idle", "idle", "running", "failed", "failed", "idle"),
            },
            {
              label: "retry 3",
              error: "timeout",
              token: "Effect.retry(forever)",
              states: s("idle", "idle", "idle", "running", "failed", "idle"),
            },
            {
              label: "dependency",
              error: "hammered while down",
              notify: {
                atStep: 3,
                message: "retries tripled the load",
                icon: "📈",
              },
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "death",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "budget + breaker",
        spec: {
          archetype: "ref",
          caption:
            "The retry budget is a token bucket: traffic funds tokens, each retry spends one, and an empty bucket rewrites the next failure as non-retryable. Retries can never exceed a fixed share of live traffic, so the dependency gets room to recover.",
          code: `yield* call(dep).pipe(withRetryBudget(bucket), breaker.protect)`,
          ref: {
            label: "retry budget",
            values: [4, 3, 2, 1, 0, 4],
            request: {
              label: "retry",
              token: "withRetryBudget(bucket)",
              states: s(
                "idle",
                "completed",
                "completed",
                "completed",
                "failed",
                "idle",
              ),
              result: "spent 1",
              error: "non-retryable",
            },
          },
        },
      },
    ],
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
    control: "fencing",
    variants: [
      {
        name: "off (split brain)",
        spec: {
          archetype: "ref",
          caption:
            "The old leader was presumed dead during a GC pause, a new leader took over at token 8, and then the old one woke up and wrote anyway. Watch the accepted token roll BACKWARD to 5: the resource just accepted a write from a leader that lost its lease. That is split brain.",
          code: `resource.write(data) // no token check, any writer lands`,
          ref: {
            label: "accepted token",
            values: [6, 7, 8, { v: 5, bad: true }, { v: 5, bad: true }, 6],
            challenger: {
              label: "stale leader",
              token: "resource.write(data)",
              states: s(
                "idle",
                "idle",
                "idle",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
      {
        name: "fenced",
        spec: {
          archetype: "ref",
          caption:
            "With fencing, the lease mints strictly increasing tokens and the resource remembers the highest it has accepted. The stale leader wakes up holding token 5, the resource is already at 8, and the late write bounces off the number itself, not off a race it might win.",
          code: `resource.write(token, data) // rejected when token < highest`,
          ref: {
            label: "accepted token",
            values: [6, 7, 8, 8, 8, 8],
            challenger: {
              label: "stale leader (5)",
              token: "token < highest",
              states: s("idle", "idle", "idle", "failed", "idle", "idle"),
              error: "fenced out",
            },
          },
        },
      },
    ],
  },
  "effect-outbox-replicator": {
    control: "write path",
    variants: [
      {
        name: "dual write",
        spec: {
          archetype: "schedule",
          caption:
            "The row commits, the client gets its 200, and then the process dies before the publish. The event is simply gone: the database says the order exists, every downstream consumer says it never happened, and nothing will ever retry it.",
          code: `await db.insert(order); await bus.publish(event) // gap = data loss`,
          schedule: {
            durationMs: 5000,
            nodes: [
              {
                label: "db insert",
                result: "row saved",
                token: "db.insert(order)",
                states: s("running", "completed", "completed"),
              },
              {
                label: "publish",
                error: "event lost forever",
                token: "bus.publish(event)",
                states: s("idle", "running", "death"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.4, label: "process dies here" },
            ],
          },
        },
      },
      {
        name: "outbox",
        spec: {
          archetype: "schedule",
          caption:
            "The row and its outbox entry commit in ONE atomic write, so the crash cannot separate them. After the restart the replicator finds the unpublished entry, applies it, and only then advances its cursor: the event survives because it was never a second write.",
          code: `Ref.update((s) => ({ ...s, rows, outbox })) // one atomic commit`,
          schedule: {
            durationMs: 6000,
            nodes: [
              {
                label: "row + outbox",
                result: "committed together",
                token: "rows, outbox",
                states: s("running", "completed", "completed", "completed"),
              },
              {
                label: "replicator",
                result: "applied after crash",
                notify: {
                  atStep: 3,
                  message: "cursor advanced only now",
                  icon: "📤",
                },
                states: s("idle", "interrupted", "running", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.4, label: "crash + restart" },
              { kind: "run", w: 1 },
            ],
          },
        },
      },
    ],
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
    control: "storage",
    variants: [
      {
        name: "get/set (race)",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "Two concurrent sign-in attempts both GET the counter, both read 4, both decide 4 < 5 passes, and both SET it to 5. The limit admitted six attempts out of a budget of five, because the read and the write were separate round trips a race could fit between.",
          code: `const n = await get(key); if (n < 5) await set(key, n + 1) // both read 4`,
          nodes: [
            {
              label: "attempt A",
              result: "read 4, pass",
              token: "get(key)",
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
              label: "attempt B",
              result: "read 4, pass",
              notify: { atStep: 2, message: "same stale count", icon: "⚠️" },
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
              label: "limit",
              error: "6 of 5 admitted",
              token: "set(key, n + 1)",
              states: s("idle", "idle", "running", "failed", "failed", "idle"),
            },
          ],
        },
      },
      {
        name: "atomic lua",
        spec: {
          archetype: "ref",
          caption:
            "INCR and PEXPIRE run inside one Lua invocation, so every concurrent attempt draws down the same live counter. The count each attempt sees is the count that exists, and the attempt that finds it at zero gets its 429 on a real number, not a stale one.",
          code: `EVAL "INCR + PEXPIRE" 1 key // one atomic consume`,
          ref: {
            label: "attempts left",
            values: [5, 3, 1, 0, 0, 5],
            request: {
              label: "sign-in",
              token: "INCR + PEXPIRE",
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
      },
    ],
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
    control: "follow-up read",
    variants: [
      {
        name: "fresh session (stale)",
        spec: {
          archetype: "ref",
          caption:
            "The POST inserts at v42 and answers 303. The follow-up GET is a new Worker invocation with a fresh, unconstrained session, so a replica that has not caught up answers it at v41. Watch the version the reader sees roll backward past its own write: the user posts a comment and reloads to find it missing.",
          code: `db.withSession() // fresh session, replica may serve v41`,
          ref: {
            label: "version read",
            values: [
              "v41",
              "v42",
              { v: "v41", bad: true },
              { v: "v41", bad: true },
              "v42",
              "v42",
            ],
            request: {
              label: "GET after POST",
              token: "withSession()",
              states: s(
                "idle",
                "completed",
                "completed",
                "completed",
                "idle",
                "idle",
              ),
              result: "missing row",
            },
          },
        },
      },
      {
        name: "carried bookmark",
        spec: {
          archetype: "ref",
          caption:
            "The POST returns its session bookmark and the redirect carries it; the GET opens its session AT that bookmark, so any replica that answers must first be at least as new as the write. The version can only move forward.",
          code: `db.withSession(bookmark) // replica must catch up to v42 first`,
          ref: {
            label: "version read",
            values: ["v41", "v42", "v42", "v42", "v43", "v43"],
            request: {
              label: "GET after POST",
              token: "withSession(bookmark)",
              states: s(
                "idle",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
              result: "row present",
            },
          },
        },
      },
    ],
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
    control: "producer order",
    variants: [
      {
        name: "send, then write",
        spec: {
          archetype: "schedule",
          caption:
            "Vercel Queues acks the publish and notifies the consumer at the same moment, so the consumer can start BEFORE send() returns. Here it does: it looks up the order row the producer has not written yet, finds nothing, and fails. The near-universal send-then-write idiom is a guaranteed intermittent bug on this queue.",
          code: `await queue.send(msg); await db.insert(order) // consumer ran between`,
          schedule: {
            durationMs: 5000,
            nodes: [
              {
                label: "send()",
                result: "acked",
                token: "queue.send(msg)",
                states: s("running", "completed", "completed"),
              },
              {
                label: "consumer",
                error: "row not found",
                notify: {
                  atStep: 1,
                  message: "started before send returned",
                  icon: "⚡",
                },
                states: s("idle", "running", "failed"),
              },
              {
                label: "db insert",
                result: "too late",
                token: "db.insert(order)",
                states: s("idle", "idle", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "run", w: 1.2 },
            ],
          },
        },
      },
      {
        name: "write, then send",
        spec: {
          archetype: "schedule",
          caption:
            "Write the row first, then publish. Now when the consumer fires the instant the publish is acked, the row it looks up already exists, and the same race that dropped the message above cannot happen at all.",
          code: `await db.insert(order); await queue.send(msg) // row exists first`,
          schedule: {
            durationMs: 5000,
            nodes: [
              {
                label: "db insert",
                result: "row saved",
                token: "db.insert(order)",
                states: s("running", "completed", "completed"),
              },
              {
                label: "send()",
                result: "acked",
                token: "queue.send(msg)",
                states: s("idle", "running", "completed"),
              },
              {
                label: "consumer",
                result: "processed",
                states: s("idle", "running", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "run", w: 1.2 },
            ],
          },
        },
      },
    ],
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
    control: "key lookup",
    variants: [
      {
        name: "fetch every verify",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Every request that verifies a JWT first fetches the JWKS over the network, so the auth server sits in the hot path of every page load. Auth added a round trip to everything, and when the auth server blips, every verify blips with it.",
          code: `const jwks = await fetch("/api/auth/jwks") // every single request`,
          nodes: [
            {
              label: "fetch jwks",
              result: "120ms",
              token: 'fetch("/api/auth/jwks")',
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
              label: "verify",
              result: "121ms total",
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
      },
      {
        name: "cookie cache",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "The JWKS rides in a signed cookie the client already sends, so verification reads the key from the request itself: zero network, sub-millisecond, and the auth server can be down without a single verify noticing.",
          code: `const jwks = readSignedCookie(req, "jwks") // already in the request`,
          nodes: [
            {
              label: "read cookie",
              result: "0ms network",
              token: 'readSignedCookie(req, "jwks")',
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
              label: "verify",
              result: "1ms total",
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
    control: "on write, purge",
    variants: [
      {
        name: "everything",
        spec: {
          archetype: "flow",
          caption:
            "One product's price changes and the only lever is purge-all, so the entire cache empties. Every request that was a 2ms hit is suddenly a miss, and the origin absorbs the whole site's traffic at once because one row changed.",
          code: `await caches.default.purgeEverything() // one write, every key cold`,
          nodes: [
            {
              label: "product page",
              error: "MISS, 480ms",
              token: "purgeEverything()",
              states: s(
                "idle",
                "completed",
                "running",
                "failed",
                "failed",
                "idle",
              ),
            },
            {
              label: "home page",
              error: "MISS, 512ms",
              states: s(
                "idle",
                "completed",
                "running",
                "failed",
                "failed",
                "idle",
              ),
            },
            {
              label: "origin",
              error: "full traffic at once",
              notify: { atStep: 3, message: "every key went cold", icon: "🧊" },
              states: s("idle", "idle", "running", "running", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "by tag",
        spec: {
          archetype: "flow",
          caption:
            "The write purges only Cache-Tag: product-42. The product page takes one honest miss to refill while every other page stays a 2ms hit, so the blast radius of a price change is exactly the pages that showed the price.",
          code: `await purgeTags(["product-42"]) // only the affected entries`,
          nodes: [
            {
              label: "product page",
              result: "refilled",
              token: 'purgeTags(["product-42"])',
              states: s(
                "idle",
                "completed",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
            {
              label: "home page",
              result: "HIT 2ms",
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
              label: "origin",
              result: "1 refill",
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
    ],
  },
  "durable-object-websocket-hibernation": {
    control: "between messages",
    variants: [
      {
        name: "stays resident",
        spec: {
          archetype: "schedule",
          caption:
            "A chat room is quiet for 40 minutes but the Durable Object holding its sockets stays pinned in memory the whole time, billed for every idle second. Multiply by ten thousand quiet rooms and the bill is mostly silence.",
          code: `this.sessions.set(ws, meta) // in-memory state pins the DO awake`,
          schedule: {
            durationMs: 6000,
            nodes: [
              {
                label: "chat room DO",
                error: "billed 40 idle min",
                token: "this.sessions.set(ws, meta)",
                states: s("running", "running", "running", "failed"),
              },
            ],
            segments: [
              { kind: "run", w: 0.8 },
              { kind: "gap", w: 3, label: "idle 40 min, still billed" },
              { kind: "run", w: 0.8 },
            ],
          },
        },
      },
      {
        name: "hibernates",
        spec: {
          archetype: "schedule",
          caption:
            "With the hibernation API the runtime holds the open sockets itself and evicts the DO from memory the moment it goes quiet. The idle 40 minutes cost nothing, and the next message wakes the DO with its socket attachments restored.",
          code: `this.ctx.acceptWebSocket(ws) // runtime holds the socket, DO sleeps`,
          schedule: {
            durationMs: 6000,
            nodes: [
              {
                label: "chat room DO",
                result: "woke on message",
                token: "acceptWebSocket(ws)",
                notify: { atStep: 2, message: "idle time cost $0", icon: "😴" },
                states: s("running", "idle", "running", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 0.8 },
              { kind: "gap", w: 3, label: "evicted, sockets stay open" },
              { kind: "run", w: 0.8 },
            ],
          },
        },
      },
    ],
  },
  "durable-object-sql-tenant-db": {
    control: "isolation",
    variants: [
      {
        name: "shared table",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Every tenant lives in one shared table, so isolation is a WHERE clause that every single query must remember. This one forgot. The response ships tenant B's invoices to tenant A, and no type checker or review caught it because the query is syntactically fine.",
          code: `db.select().from(invoices) // forgot .where(eq(tenantId, a))`,
          nodes: [
            {
              label: "tenant A query",
              token: "db.select().from(invoices)",
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
              label: "response",
              error: "tenant B's rows leaked",
              notify: {
                atStep: 2,
                message: "isolation was a code review promise",
                icon: "🚨",
              },
              states: s("idle", "idle", "running", "death", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "db per tenant",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Each tenant's Durable Object holds its own SQLite file, so tenant A's query executes inside a database where tenant B's rows do not exist. The same forgotten WHERE clause now returns only A's data: isolation is structural, not a convention.",
          code: `this.sql.exec("SELECT * FROM invoices") // only A's db exists here`,
          nodes: [
            {
              label: "tenant A query",
              token: 'exec("SELECT * FROM invoices")',
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
              label: "response",
              result: "A's rows, locally",
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
    ],
  },
  "worker-rpc-promise-pipelining": {
    control: "service call",
    variants: [
      {
        name: "http hops",
        spec: {
          archetype: "flow",
          caption:
            "Over HTTP each dependent call waits for the previous response before it can even start: cart, then items, then product, three serialized round trips with JSON on every wire. Watch the timers stack; this tax is why HTTP service APIs drift into getCartWithItemsAndProducts.",
          code: `await fetch("/cart"); await fetch("/items"); await fetch("/product")`,
          nodes: [
            {
              label: "getCart",
              result: "180ms",
              token: 'fetch("/cart")',
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
              label: "cart.items",
              result: "360ms",
              token: 'fetch("/items")',
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
              label: "item.product",
              result: "540ms total",
              token: 'fetch("/product")',
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
      },
      {
        name: "rpc pipelined",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Workers RPC returns stubs, so the whole chain is expressed up front and the runtime ships it as ONE round trip: getCart().items[0].product resolves together. The fine-grained object API costs what the coarse hand-rolled endpoint used to.",
          code: `await using cart = env.SHOP.getCart(); await cart.items[0].product`,
          nodes: [
            {
              label: "chained stubs",
              token: "env.SHOP.getCart()",
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
              label: "result",
              result: "product, 1 hop",
              token: "cart.items[0].product",
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
    ],
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
    control: "attribution in",
    variants: [
      {
        name: "commit message",
        spec: {
          archetype: "ref",
          caption:
            "The eval score only exists after review, and the message is an input to the SHA. So adding the score later means amending, and amending mints a NEW SHA: watch the commit id change out from under every branch, PR comment, and CI run that referenced the old one.",
          code: `git commit --amend -m "score: 0.92" // the SHA is re-minted`,
          ref: {
            label: "commit sha",
            values: [
              "a1b2c3d",
              "a1b2c3d",
              { v: "f9e8d7c", bad: true },
              { v: "f9e8d7c", bad: true },
              "a1b2c3d",
              "a1b2c3d",
            ],
            request: {
              label: "add score later",
              token: "--amend",
              states: s(
                "idle",
                "idle",
                "completed",
                "completed",
                "idle",
                "idle",
              ),
              result: "history rewritten",
            },
          },
        },
      },
      {
        name: "git-notes",
        spec: {
          archetype: "ref",
          caption:
            "git-notes hang metadata OFF the commit instead of inside it, so the score written after review attaches to the same immutable SHA. The commit id every system already recorded stays true, and the attribution arrives when it is actually known.",
          code: `git notes add -m "score: 0.92" a1b2c3d // SHA untouched`,
          ref: {
            label: "commit sha",
            values: [
              "a1b2c3d",
              "a1b2c3d",
              "a1b2c3d",
              "a1b2c3d",
              "a1b2c3d",
              "a1b2c3d",
            ],
            request: {
              label: "add score later",
              token: "git notes add",
              states: s(
                "idle",
                "idle",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
              result: "attached, sha stable",
            },
          },
        },
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
    control: "error seam",
    variants: [
      {
        name: "raw error leaks",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "The query fails and the raw driver error climbs the stack untouched, so the user's 500 page says relation users_old does not exist, complete with the table name and the SQL. The route handler never had a chance to be graceful about an error it had no type for.",
          code: `await db.select().from(users) // pg error surfaces as-is`,
          nodes: [
            {
              label: "query",
              error: "42P01 relation missing",
              token: "db.select().from(users)",
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
              label: "response",
              error: "500 with raw SQL",
              states: s("idle", "idle", "running", "death", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "tagged at the seam",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Drizzle's builders extend Effect, so the repository catches EffectDrizzleQueryError by tag and re-raises UserNotFound, a domain error the route's type signature forces it to handle. The route maps it to a clean 404 and the driver detail never leaves the repository.",
          code: `.pipe(Effect.catchTag("EffectDrizzleQueryError", toDomain))`,
          nodes: [
            {
              label: "query",
              error: "query failed",
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
              label: "repository",
              error: "UserNotFound",
              token: 'catchTag("EffectDrizzleQueryError"',
              states: s("idle", "idle", "running", "failed", "failed", "idle"),
            },
            {
              label: "response",
              result: "404, no internals",
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
      },
    ],
  },
  "drizzle-cache-tag-invalidation": {
    control: "after the write",
    variants: [
      {
        name: "ttl only (stale)",
        spec: {
          archetype: "ref",
          caption:
            "The price changes to $80 but the cached read has 60 seconds left on its TTL, so every checkout until then charges the old $100. Watch the value the readers see stay wrong AFTER the write lands: a cache with no invalidation is a machine for serving the past.",
          code: `db.query.products.findFirst() // cached, no tag, TTL 60s`,
          ref: {
            label: "price read",
            values: [
              "$100",
              "$100",
              { v: "$100", bad: true },
              { v: "$100", bad: true },
              "$80",
              "$80",
            ],
            request: {
              label: "UPDATE price = 80",
              token: "findFirst()",
              states: s(
                "idle",
                "idle",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
              result: "landed",
            },
          },
        },
      },
      {
        name: "tagged purge",
        spec: {
          archetype: "ref",
          caption:
            "The read carries $withCache({ tag: 'product-42' }) and the write purges that tag in the same breath, so the very next read misses, refills, and answers $80. The stale window is not shorter, it does not exist.",
          code: `.$withCache({ tag: "product-42" }) // write purges this tag`,
          ref: {
            label: "price read",
            values: ["$100", "$100", "$80", "$80", "$80", "$80"],
            request: {
              label: "UPDATE + purge tag",
              token: '$withCache({ tag: "product-42" })',
              states: s(
                "idle",
                "idle",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
              result: "refilled",
            },
          },
        },
      },
    ],
  },
  "prisma-driver-adapter-runtime": {
    control: "pool config",
    variants: [
      {
        name: "pg defaults",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Prisma 7 hands pooling to the pg driver, and pg ships connectionTimeoutMillis: 0, wait forever. The database hiccups, the checkout query sits on the pool queue with no deadline, and the request above it hangs until the client gives up. Watch the timer climb with no failure and no answer, the worst outcome a query can have.",
          code: `new PrismaPg({ connectionString }) // pg default: wait forever`,
          nodes: [
            {
              label: "checkout query",
              token: "PrismaPg({ connectionString })",
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "running",
                "idle",
              ),
            },
            {
              label: "response",
              error: "still waiting",
              notify: {
                atStep: 3,
                message: "no timeout, no error, no answer",
                icon: "⏳",
              },
              states: s(
                "idle",
                "idle",
                "running",
                "running",
                "interrupted",
                "idle",
              ),
            },
          ],
        },
      },
      {
        name: "explicit caps",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "The adapter sets the numbers v6's Rust engine used to own: a connection timeout, a pool size, an idle cutoff. The same database hiccup now surfaces as a clean 5-second failure the retry layer can handle, instead of a request that hangs into the void.",
          code: `new PrismaPg({ connectionTimeoutMillis: 5000, max: 10 })`,
          nodes: [
            {
              label: "checkout query",
              token: "connectionTimeoutMillis: 5000",
              states: s(
                "idle",
                "running",
                "running",
                "failed",
                "failed",
                "idle",
              ),
            },
            {
              label: "response",
              result: "failed fast, retried",
              states: s(
                "idle",
                "idle",
                "running",
                "running",
                "completed",
                "idle",
              ),
            },
          ],
        },
      },
    ],
  },
  "prisma-client-extension-audit": {
    control: "delete",
    variants: [
      {
        name: "hard delete",
        spec: {
          archetype: "flow",
          caption:
            "prisma.user.delete() destroys the row. When the support ticket arrives asking what happened to this account, there is no row, no history, and no answer: the data and the evidence deleted each other.",
          code: `await prisma.user.delete({ where: { id } }) // row and history gone`,
          nodes: [
            {
              label: "delete",
              token: "prisma.user.delete",
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
              label: "the row",
              error: "gone, no audit trail",
              states: s("idle", "idle", "running", "death", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "soft delete + audit",
        spec: {
          archetype: "flow",
          caption:
            "The extension rewrites delete into an update that stamps deletedAt, filters every read so the row is invisible to the app, and records who deleted what and when in the audit table. The user is gone from the product and fully recoverable in the database.",
          code: `query.$allModels.$allOperations(...) // delete becomes update`,
          nodes: [
            {
              label: "delete",
              token: "$allOperations",
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
              label: "the row",
              result: "hidden, kept",
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
              label: "audit",
              result: "who, what, when",
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
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
    control: "env model",
    variants: [
      {
        name: "prefix guess",
        spec: {
          archetype: "flow",
          caption:
            "Visibility hangs on a naming prefix: someone renames STRIPE_SECRET to PUBLIC_STRIPE_KEY while wiring the checkout, the bundler happily inlines it, and the secret ships to every browser in the client JavaScript. The rename compiled; nothing warned.",
          code: `import { PUBLIC_STRIPE_KEY } from "$env/static/public" // oops`,
          nodes: [
            {
              label: "rename + build",
              token: "PUBLIC_STRIPE_KEY",
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
              label: "client bundle",
              error: "secret shipped to browsers",
              notify: {
                atStep: 2,
                message: "view-source shows the key",
                icon: "🔓",
              },
              states: s("idle", "idle", "running", "death", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "declared manifest",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "defineEnvVars is one reviewed table where every variable states its visibility and inlining. The same mistake now has to be a diff that flips visibility: 'server' to visibility: 'client' on a line named stripeSecret, in review, with the description right next to it.",
          code: `stripeSecret: { visibility: "server", inline: false }`,
          nodes: [
            {
              label: "manifest",
              result: "server-only, enforced",
              token: 'visibility: "server"',
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
              label: "client bundle",
              result: "no secrets",
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
    ],
  },
  "sveltekit-batched-query-refresh": {
    control: "fetch strategy",
    variants: [
      {
        name: "n+1",
        spec: {
          archetype: "flow",
          caption:
            "Twenty components each call the query on mount and each call is its own server round trip. Watch them run one after another and watch the timers stack: the page paid twenty invocations for one screen of data.",
          code: `const post = await getPost(id) // x20, one round trip each`,
          nodes: [
            {
              label: "q1",
              result: "60ms",
              token: "getPost(id)",
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
              label: "q2",
              result: "120ms",
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
              label: "q3 ... q20",
              result: "1.2s total",
              notify: {
                atStep: 4,
                message: "20 invocations, serial",
                icon: "🐢",
              },
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
      },
      {
        name: "batched",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "query.batch collects everything the twenty components ask for within one macrotask into a single server invocation and hands each caller its own row back. Same twenty answers, one round trip, and the callers cannot tell the difference.",
          code: `export const getPost = query.batch(schema, resolve) // one invocation`,
          nodes: [
            {
              label: "20 calls, one tick",
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
              result: "[p1 ... p20]",
              token: "query.batch",
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
    ],
  },
  "elysia-plugin-scope-model": {
    archetype: "flow",
    caption:
      "An Elysia 2.0 auth plugin encodes the four renames stale code trips over, so scope and lifecycle hooks resolve under the new argument order.",
    nodes: [{ label: "plugin", result: "scoped", states: s(...OK) }],
  },
  "elysia-aot-build-manifest": {
    control: "sucrose runs",
    variants: [
      {
        name: "on every boot",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Elysia's Sucrose JIT compiles every route's handler and validators when the process starts, so each cold start pays the full codegen bill before serving byte one. On serverless that bill lands on a user's first request.",
          code: `new Elysia().listen(3000) // JIT compiles all routes now`,
          nodes: [
            {
              label: "cold boot",
              result: "312ms of codegen",
              token: "listen(3000)",
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "completed",
                "idle",
              ),
            },
            {
              label: "first request",
              result: "waited for it",
              states: s("idle", "idle", "idle", "idle", "completed", "idle"),
            },
          ],
        },
      },
      {
        name: "at build",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "The elysia/plugin/aot bundler plugin runs the same Sucrose codegen inside Bun.build, bakes the generated handlers into the bundle, and strips the JIT from the output. The deploy pays once; every cold start after that boots in single-digit milliseconds.",
          code: `Bun.build({ plugins: [aot({ strip: true })] }) // paid once here`,
          nodes: [
            {
              label: "build step",
              result: "codegen baked in",
              token: "aot({ strip: true })",
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
              label: "cold boot",
              result: "4ms",
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
          ],
        },
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
    control: "where secrets live",
    variants: [
      {
        name: ".env file",
        spec: {
          archetype: "flow",
          caption:
            "The API key sits in a plaintext .env, one careless git add away from history. Once it lands in a commit, rotating the key is the only fix; deleting the file changes nothing, because git remembers. Every clone, fork, and CI cache now holds the secret forever.",
          code: `OPENAI_KEY=sk-live-4f2a... # plaintext on disk, one add from git`,
          nodes: [
            {
              label: "git add .",
              token: "sk-live-4f2a...",
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
              label: "the key",
              error: "in history forever",
              notify: {
                atStep: 2,
                message: "rotate it, deleting won't help",
                icon: "🔑",
              },
              states: s("idle", "idle", "running", "death", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "os keychain",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "vault set writes the key into the OS credential store: macOS Keychain, libsecret, or Windows Credential Manager, encrypted at rest and scoped to the logged-in user. There is no file for git add to find, and vault run injects it into the child process env only for the life of the command.",
          code: `await secrets.set({ service, name, value }) // no file exists`,
          nodes: [
            {
              label: "vault set",
              token: "secrets.set({ service, name, value })",
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
              result: "🔒 sealed, no file",
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
    control: "request state",
    variants: [
      {
        name: "module scope (leak)",
        spec: {
          archetype: "flow",
          caption:
            "Fluid runs concurrent invocations on ONE shared instance. User A's request writes currentUser at module scope, user B's request runs at the same time on the same instance, and B's response comes back with A's cart. Look at the results: both say cart: A. That is a cross-user data leak.",
          code: `let currentUser = null // module scope = shared across users`,
          nodes: [
            {
              label: "user A",
              result: "cart: A",
              token: "let currentUser",
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
              label: "user B",
              result: "cart: A",
              notify: { atStep: 3, message: "B got A's data", icon: "🚨" },
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
        name: "per invocation",
        spec: {
          archetype: "flow",
          caption:
            "State scoped to the invocation lives and dies with the request. The same two concurrent users on the same shared instance now each get their own cart, because nothing they touch outlives their own call.",
          code: `const user = await auth(req) // request scope, dies with the call`,
          nodes: [
            {
              label: "user A",
              result: "cart: A",
              token: "const user",
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
              label: "user B",
              result: "cart: B",
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
    ],
  },
};

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

  // ======================= DISTRIBUTED SYSTEMS PATTERNS =======================
  "effect-idempotency-key-store": {
    control: "idempotency",
    variants: [
      {
        name: "off (double charge)",
        spec: {
          archetype: "ref",
          caption:
            "The client times out and retries, but the first request already reached the processor. Both requests execute, and the charged total lands at 9998 cents for a 4999 cent order. Watch the odometer flash red on the second charge: that write should never have happened.",
          code: `await processor.charge(card, 4999) // the retry charges again`,
          ref: {
            label: "charged cents",
            values: [
              0,
              4999,
              4999,
              { v: 9998, bad: true },
              { v: 9998, bad: true },
              0,
            ],
            request: {
              label: "charge",
              token: "processor.charge",
              result: "receipt #1",
              states: s(
                "running",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            challenger: {
              label: "timeout retry",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
      {
        name: "keyed",
        spec: {
          archetype: "ref",
          caption:
            "Both requests carry the same idempotency key. The first arrival claims the key atomically and runs the charge; the retry finds the claim, awaits the same Deferred, and receives the first run's receipt. One execution, one 4999, two identical receipts.",
          code: `store.execute(key, charge) // duplicates await the winner's Deferred`,
          ref: {
            label: "charged cents",
            values: [0, 4999, 4999, 4999, 4999, 0],
            request: {
              label: "charge",
              token: "store.execute",
              result: "receipt #1",
              states: s(
                "running",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            challenger: {
              label: "timeout retry",
              token: "duplicates await",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
    ],
  },

  "effect-hedged-request-race": {
    control: "hedging",
    variants: [
      {
        name: "off (tail latency)",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Ninety-nine requests land on healthy replicas, and this one landed on the node mid GC pause. The user pays the straggler's full 400ms because there is no second chance: whatever node the request hit is the node that answers.",
          code: `const rows = yield* replica.query(q) // one attempt, one fate`,
          nodes: [
            {
              label: "request",
              token: "replica.query",
              error: "rows @ 400ms",
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "running",
                "failed",
              ),
            },
            {
              label: "user",
              error: "p99 spinner",
              notify: {
                atStep: 4,
                message: "still waiting on one node",
                icon: "🐌",
              },
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "running",
                "failed",
              ),
            },
          ],
        },
      },
      {
        name: "hedged",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "The primary gets the p95 delay to answer on its own. When it does not, one backup fires at a different replica and raceFirst takes the first answer, interrupting the loser so it releases its connection. The straggler is capped near delay plus fast latency: 45ms instead of 400.",
          code: `Effect.raceFirst(primary, backup) // loser is interrupted, not leaked`,
          nodes: [
            {
              label: "primary",
              token: "primary",
              error: "interrupted",
              states: s(
                "idle",
                "running",
                "running",
                "interrupted",
                "interrupted",
                "idle",
              ),
            },
            {
              label: "hedge @p95",
              token: "backup",
              result: "rows @ 45ms",
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
              label: "user",
              result: "45ms",
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

  "effect-read-replica-router": {
    control: "routing",
    variants: [
      {
        name: "off (stale read)",
        spec: {
          archetype: "ref",
          caption:
            "The user saves display_name=Ada, the write commits on the primary, and the reload reads from a replica that has not applied it yet. The page shows the OLD name. Watch the served value flash red: the write vanished from the user's point of view.",
          code: `db.replica.select(profile) // replication lag decides what you see`,
          ref: {
            label: "profile served",
            values: [
              "v1",
              "v1",
              { v: "v1", bad: true },
              { v: "v1", bad: true },
              "v2",
              "v1",
            ],
            request: {
              label: "save v2",
              result: "committed LSN 4",
              states: s(
                "running",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            challenger: {
              label: "reload",
              token: "db.replica.select",
              error: "shows v1",
              states: s("idle", "idle", "running", "failed", "idle", "idle"),
            },
          },
        },
      },
      {
        name: "routed",
        spec: {
          archetype: "ref",
          caption:
            "The router remembers this session wrote at LSN 4. The reload compares the replica's applied LSN (3) against the mark, sees it is behind, and routes to the primary: the user reads their own write. Once the replica applies LSN 4, the same session's reads move back to it.",
          code: `applied >= sessionMark ? replica : primary // freshness is arithmetic`,
          ref: {
            label: "profile served",
            values: ["v1", "v1", "v2", "v2", "v2", "v1"],
            request: {
              label: "save v2",
              result: "mark = LSN 4",
              states: s(
                "running",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            challenger: {
              label: "reload",
              token: "applied >= sessionMark",
              states: s(
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
    ],
  },

  "effect-heartbeat-failure-detector": {
    control: "detector",
    variants: [
      {
        name: "fixed timeout",
        spec: {
          archetype: "schedule",
          caption:
            "The rule is dead after 40ms of silence. One congested heartbeat arrives 60ms late, the timeout fires, and a perfectly healthy node is evicted: its shards reshuffle onto the survivors, which is load the cluster did not need at the exact moment the network was already struggling.",
          code: `if (silence > 40) evict(node) // congestion reads as death`,
          schedule: {
            durationMs: 6000,
            nodes: [
              {
                label: "node-7",
                token: "node",
                error: "evicted while alive",
                notify: {
                  atStep: 2,
                  message: "the beat was in flight",
                  icon: "📦",
                },
                states: s("running", "running", "death", "death"),
              },
              {
                label: "monitor",
                token: "evict",
                error: "false positive",
                states: s("running", "running", "failed", "failed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.2, label: "60ms congestion" },
              { kind: "run", w: 0.8 },
            ],
          },
        },
      },
      {
        name: "phi accrual",
        spec: {
          archetype: "schedule",
          caption:
            "Phi grows with silence relative to THIS node's learned rhythm. The 60ms delay pushes phi to 1.3, far under the threshold of 8, and the late beat resets it: no eviction. Only the sustained silence at the end accrues past 8, and that one really is a dead node.",
          code: `phi = silence / (mean * ln10) // suspicion, then certainty`,
          schedule: {
            durationMs: 7000,
            nodes: [
              {
                label: "node-7",
                token: "node",
                result: "survived congestion",
                states: s("running", "running", "running", "running", "death"),
              },
              {
                label: "phi",
                token: "phi",
                error: "8.0 crossed: dead",
                notify: {
                  atStep: 2,
                  message: "phi 1.3, beat arrived, reset",
                  icon: "🫀",
                },
                states: s("running", "running", "running", "running", "failed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1, label: "phi 1.3" },
              { kind: "run", w: 0.8 },
              { kind: "gap", w: 1.6, label: "silence, phi 8+" },
            ],
          },
        },
      },
    ],
  },

  "effect-multipart-upload-resume": {
    control: "outcome",
    variants: [
      {
        name: "completes",
        spec: {
          archetype: "scope",
          caption:
            "Initiate is the acquire and abort is its release. Parts upload in parallel with per-part retry, complete() assembles the ETags, and the abort finalizer sees the completed flag and skips itself. The scope closes clean: object stored, no leftovers.",
          code: `Effect.acquireRelease(initiate, abortUnlessDone) // cleanup is the scope's job`,
          scope: {
            mode: "scope",
            node: {
              label: "backup.tar (8 parts)",
              token: "initiate",
              result: "assembled",
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
              {
                label: "abort unless completed",
                token: "abortUnlessDone",
                states: sc(...ACQ3_A),
              },
              { label: "complete w/ etags", states: sc(...ACQ3_B) },
              { label: "upload parts 1-8", states: sc(...ACQ3_C) },
            ],
          },
        },
      },
      {
        name: "crash mid-part",
        spec: {
          archetype: "scope",
          caption:
            "Part 4 dies with no retries left and the whole session fails, but failing IS an exit path, so the release runs: abort tells the store to free every uploaded part. Without it, those parts sit invisible in the bucket listing and very visible on the invoice, forever.",
          code: `abort(uploadId) // ran because the scope closed, not because someone remembered`,
          scope: {
            mode: "scope",
            node: {
              label: "video.mp4 (8 parts)",
              error: "part 4 failed",
              notify: {
                atStep: 4,
                message: "orphaned parts freed: 0 billing",
                icon: "🧾",
              },
              states: s(
                "running",
                "running",
                "failed",
                "failed",
                "failed",
                "failed",
              ),
            },
            finalizers: [
              {
                label: "abort multipart",
                token: "abort(uploadId)",
                states: sc(...ACQ2_A),
              },
              { label: "upload parts (3 of 8 done)", states: sc(...ACQ2_B) },
            ],
          },
        },
      },
    ],
  },

  "effect-exactly-once-consumer": {
    control: "ordering",
    variants: [
      {
        name: "commit first (loses)",
        spec: {
          archetype: "schedule",
          caption:
            "The consumer commits offset 1 and then dies before applying pay-102. The broker's contract is simple: acknowledged work is never redelivered. The restart resumes at offset 2, and 250 dollars is gone with no error, no log line, no retry. Loss is silent by construction.",
          code: `commit(offset); apply(msg) // crash between = acknowledged and gone`,
          schedule: {
            durationMs: 6000,
            nodes: [
              {
                label: "commit offset 1",
                token: "commit(offset)",
                result: "acknowledged",
                states: s("running", "completed", "completed", "completed"),
              },
              {
                label: "apply pay-102",
                token: "apply(msg)",
                error: "$250 never lands",
                states: s("idle", "running", "death", "death"),
              },
              {
                label: "restart",
                error: "resumes at offset 2",
                states: s("idle", "idle", "idle", "failed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.3, label: "crash" },
              { kind: "run", w: 1 },
            ],
          },
        },
      },
      {
        name: "process first + dedupe",
        spec: {
          archetype: "schedule",
          caption:
            "Apply first, commit second: the crash in the gap means pay-102's offset was never acknowledged, so the broker redelivers it. The applied-ids set (updated in the same atomic decision as the balance) recognizes the duplicate and skips it. Balance 875, applied once, committed once.",
          code: `applyOnce(id) then commit(offset) // redelivery hits the dedupe set`,
          schedule: {
            durationMs: 6000,
            nodes: [
              {
                label: "apply pay-102",
                token: "applyOnce(id)",
                result: "balance +250",
                states: s("running", "completed", "completed", "completed"),
              },
              {
                label: "redelivery",
                token: "commit(offset)",
                result: "duplicate skipped",
                notify: {
                  atStep: 2,
                  message: "applied set says: seen it",
                  icon: "🧾",
                },
                states: s("idle", "interrupted", "running", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.3, label: "crash before commit" },
              { kind: "run", w: 1 },
            ],
          },
        },
      },
    ],
  },

  "effect-webhook-dispatcher": {
    control: "delivery",
    variants: [
      {
        name: "fire and forget",
        spec: {
          archetype: "schedule",
          caption:
            "The partner's endpoint is mid-deploy and answers 503 for forty seconds. One attempt, one 503, and the invoice.paid event is gone: their outage became your data loss, and nobody on either side has a record to replay.",
          code: `fetch(url, { body }) // their downtime, your gap`,
          schedule: {
            durationMs: 5000,
            nodes: [
              {
                label: "invoice.paid",
                token: "fetch(url",
                error: "dropped silently",
                states: s("running", "death", "death"),
              },
              {
                label: "endpoint",
                error: "503 mid-deploy",
                states: s("failed", "failed", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.6, label: "their deploy finishes" },
            ],
          },
        },
      },
      {
        name: "retried + signed",
        spec: {
          archetype: "schedule",
          caption:
            "Attempt 1 and 2 hit the deploy window and back off on jittered exponential delays. Attempt 3 lands a 200, and the consumer verifies the HMAC over timestamp.body in constant time before trusting a byte. The outage cost latency, not the event.",
          code: `retry(jittered(exponential)) + hmac(ts + "." + body) // late, not lost`,
          schedule: {
            durationMs: 7000,
            nodes: [
              {
                label: "invoice.paid",
                token: "retry",
                result: "delivered, verified",
                states: s(
                  "running",
                  "running",
                  "running",
                  "running",
                  "running",
                  "running",
                  "completed",
                ),
              },
              {
                label: "endpoint",
                token: "hmac",
                result: "signature ok",
                notify: {
                  atStep: 5,
                  message: "HMAC verified, replay window ok",
                  icon: "🔏",
                },
                states: s(
                  "failed",
                  "idle",
                  "failed",
                  "idle",
                  "running",
                  "completed",
                  "completed",
                ),
              },
            ],
            segments: [
              { kind: "run", w: 0.7 },
              { kind: "gap", w: 0.8, label: "2s + jitter" },
              { kind: "run", w: 0.7 },
              { kind: "gap", w: 1, label: "4s + jitter" },
              { kind: "run", w: 0.7 },
              { kind: "run", w: 0.5 },
            ],
          },
        },
      },
      {
        name: "dead endpoint",
        spec: {
          archetype: "schedule",
          caption:
            "Every attempt fails, the retries exhaust, and the event moves to the dead-letter queue carrying its attempt history and last status. Exhaustion is an explicit state an operator can replay from, not a log line that scrolled away.",
          code: `Queue.offer(deadLetters, { event, attempts, lastStatus }) // replayable`,
          schedule: {
            durationMs: 6000,
            nodes: [
              {
                label: "invoice.paid",
                token: "event",
                error: "4 attempts, all 500",
                states: s("running", "running", "running", "running", "failed"),
              },
              {
                label: "dead letters",
                token: "deadLetters",
                result: "1 event, replayable",
                notify: {
                  atStep: 4,
                  message: "kept with attempt history",
                  icon: "📮",
                },
                states: s("idle", "idle", "idle", "idle", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 0.7 },
              { kind: "gap", w: 0.7, label: "backoff" },
              { kind: "run", w: 0.7 },
              { kind: "gap", w: 0.9, label: "backoff" },
            ],
          },
        },
      },
    ],
  },

  "effect-consistent-hash-ring": {
    control: "placement",
    variants: [
      {
        name: "hash % N",
        spec: {
          archetype: "ref",
          caption:
            "cache-5 joins and N changes from 4 to 5, so hash(key) % N changes for almost every key: 8020 of 10000 keys now point somewhere new, and each one is a cache miss. The cluster stampedes its own origin at the exact moment it was scaling to protect it.",
          code: `serverIndex = hash(key) % N // N changed, so everything changed`,
          ref: {
            label: "keys remapped",
            values: [
              0,
              0,
              { v: 8020, bad: true },
              { v: 8020, bad: true },
              { v: 8020, bad: true },
              0,
            ],
            challenger: {
              label: "cache-5 joins",
              token: "% N",
              error: "miss storm",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
      {
        name: "ring + vnodes",
        spec: {
          archetype: "ref",
          caption:
            "On the ring, cache-5's 160 virtual nodes claim arcs and steal only the keys inside them: 2030 keys move, every one of them TO the new node, and the other 7970 stay exactly where they were. The join is a 20% event instead of an 80% one.",
          code: `ring.lookup(key) // first node clockwise; joins steal one arc`,
          ref: {
            label: "keys remapped",
            values: [0, 0, 2030, 2030, 2030, 0],
            request: {
              label: "cache-5 joins",
              token: "ring.lookup",
              result: "took 1/5 arc",
              states: s(
                "idle",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
    ],
  },

  "effect-snowflake-id-generator": {
    control: "clock",
    variants: [
      {
        name: "trusting the clock",
        spec: {
          archetype: "ref",
          caption:
            "NTP steps the wall clock back 60 seconds and the generator keeps minting from it. The odometer rolls BACKWARD: it re-issues timestamp bits it already used, and somewhere a new order id collides with one from a minute ago. Two rows, one primary key.",
          code: `id = now << 22 | machine | seq // now just moved backward`,
          ref: {
            label: "id timestamp ms",
            values: [
              1000,
              1001,
              1002,
              { v: 942, bad: true },
              { v: 943, bad: true },
              1000,
            ],
            challenger: {
              label: "NTP step -60s",
              token: "now",
              states: s(
                "idle",
                "idle",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
      {
        name: "rollback guard",
        spec: {
          archetype: "ref",
          caption:
            "The generator remembers the highest timestamp it minted against, inside the same atomic decision as the mint. A small rollback parks the caller until the clock re-passes the mark; this 60 second step is past tolerance, so the mint fails typed. No branch can produce a duplicate.",
          code: `t < lastTimestamp -> ClockMovedBackward // duplicates are unrepresentable`,
          ref: {
            label: "high-water mark ms",
            values: [1000, 1001, 1002, 1002, 1002, 1000],
            challenger: {
              label: "mint at 942",
              token: "ClockMovedBackward",
              error: "typed failure",
              states: s("idle", "idle", "idle", "failed", "idle", "idle"),
            },
          },
        },
      },
    ],
  },

  "effect-bulkhead-isolation": {
    control: "pool",
    variants: [
      {
        name: "shared pool",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "Recommendations went from 20ms to 150ms per call, and every call holds a shared worker for that long. Thirty of them absorb the whole pool, and checkout, which needs 5ms, queues behind them for 564ms. Checkout is down because recommendations got slow.",
          code: `sharedPool.run(call) // one slow tenant drains everyone's workers`,
          nodes: [
            {
              label: "recs (150ms)",
              token: "sharedPool",
              error: "holds all 8 workers",
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "running",
                "failed",
              ),
            },
            {
              label: "checkout (5ms)",
              error: "564ms behind recs",
              notify: {
                atStep: 3,
                message: "queued behind a slow stranger",
                icon: "🛒",
              },
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "failed",
                "idle",
              ),
            },
            {
              label: "user",
              error: "checkout timeout",
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
        name: "bulkheads",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "Each dependency owns a watertight compartment: recommendations saturates its own 4 permits and sheds its overflow with a typed BulkheadRejected the caller maps to a fallback shelf, while checkout's compartment never sees the flood. Last payment done in 57ms, not 564.",
          code: `recsBulkhead.run(call) // the breach floods one compartment`,
          nodes: [
            {
              label: "recs (150ms)",
              token: "recsBulkhead",
              error: "overflow shed fast",
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
              label: "checkout (5ms)",
              result: "paid @ 57ms",
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
              label: "user",
              result: "order placed",
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

  "effect-payment-reconciliation": {
    control: "recon",
    variants: [
      {
        name: "off (silent drift)",
        spec: {
          archetype: "schedule",
          caption:
            "Exactly-once was engineered everywhere, so nobody checks. A processor-side retry posts 25.01 against your 25.00, day after day, and the first anyone hears of it is a quarter close that is off by an amount no query can explain. Nothing errored; the books just diverged.",
          code: `// no reconciliation job exists; the drift compounds quietly`,
          schedule: {
            durationMs: 6000,
            nodes: [
              {
                label: "ledger",
                result: "$25.00 recorded",
                states: s("running", "completed", "completed", "completed"),
              },
              {
                label: "processor",
                error: "$25.01 settled",
                states: s("running", "completed", "completed", "completed"),
              },
              {
                label: "quarter close",
                token: "drift",
                error: "unexplained variance",
                notify: {
                  atStep: 3,
                  message: "90 days of compounding cents",
                  icon: "🧾",
                },
                states: s("idle", "idle", "running", "death"),
              },
            ],
            segments: [
              { kind: "run", w: 0.8 },
              { kind: "gap", w: 1.2, label: "90 days, no checks" },
              { kind: "run", w: 0.8 },
            ],
          },
        },
      },
      {
        name: "reconciled",
        spec: {
          archetype: "schedule",
          caption:
            "The nightly run normalizes both statements, matches by id, and buckets every difference. The 1 cent drift on tx-101 is flagged the same night it happens. tx-102, stamped 23:59:55 internally and 00:00:30 at the processor, is held as pending_cutoff instead of paging anyone, and matches on the next run.",
          code: `classify(ours, theirs) // matched | mismatch | missing | pending_cutoff`,
          schedule: {
            durationMs: 6500,
            nodes: [
              {
                label: "tx-101 drift",
                token: "mismatch",
                error: "2500 vs 2501",
                states: s("running", "failed", "failed", "failed"),
              },
              {
                label: "tx-102 @23:59:55",
                token: "pending_cutoff",
                result: "matched day 2",
                notify: {
                  atStep: 1,
                  message: "held, not paged: in transit",
                  icon: "🌙",
                },
                states: s("running", "interrupted", "running", "completed"),
              },
            ],
            segments: [
              { kind: "run", w: 1 },
              { kind: "gap", w: 1.2, label: "day boundary" },
              { kind: "run", w: 1 },
            ],
          },
        },
      },
    ],
  },

  "effect-hot-account-ledger": {
    control: "account",
    variants: [
      {
        name: "one row",
        spec: {
          archetype: "flow",
          arrowBefore: 3,
          caption:
            "Promotion day: two hundred concurrent credits to one merchant, and every one of them queues on the same row lock. Throughput collapses to one write per lock hold, checkout latency climbs past a second, and the platform's biggest account becomes its slowest row.",
          code: `UPDATE balance WHERE id = 'merchant' // every credit, same lock`,
          nodes: [
            {
              label: "credit #1",
              result: "held the lock",
              token: "UPDATE balance",
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
              label: "credit #2",
              error: "queued",
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "failed",
                "idle",
              ),
            },
            {
              label: "credit #200",
              error: "1011ms behind",
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
              label: "merchant row",
              error: "lock convoy",
              notify: {
                atStep: 3,
                message: "one lock, 200 waiters",
                icon: "🔒",
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
        name: "8 sub-accounts",
        spec: {
          archetype: "flow",
          arrowBefore: 3,
          caption:
            "The balance becomes eight sub-account rows. Each credit locks exactly one, so eight writes proceed at once and the convoy dissolves: the same two hundred credits land in 126ms instead of 1011ms, and the balance read (the sum over sub-accounts) is exact to the cent: 20000.",
          code: `credit -> subAccount[rr % 8] // one update locks one row of eight`,
          nodes: [
            {
              label: "credit #1",
              result: "sub 1",
              token: "subAccount",
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
              label: "credit #2",
              result: "sub 2",
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
              label: "credit #200",
              result: "sub 8",
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
              label: "balance = sum",
              result: "20000 exact",
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

  "effect-bloom-url-frontier": {
    control: "seen set",
    variants: [
      {
        name: "exact set",
        spec: {
          archetype: "ref",
          caption:
            "The crawler remembers every URL it has fetched in an exact in-memory set, and the set grows with the web: 100k URLs is 12MB, a billion is tens of gigabytes per worker. Watch the resident memory climb until the fleet is sized by its dedupe structure instead of its work.",
          code: `seen.add(url) // memory grows with every page ever crawled`,
          ref: {
            label: "dedupe RAM (MB)",
            values: [
              12,
              240,
              2400,
              { v: 12000, bad: true },
              { v: 12000, bad: true },
              12,
            ],
            challenger: {
              label: "crawl grows 1000x",
              token: "seen.add",
              error: "OOM sized",
              states: s(
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
      {
        name: "bloom filter",
        spec: {
          archetype: "ref",
          caption:
            "The filter is sized once from capacity and error budget: 100k URLs at 1% false positives is 117KB, forever. A seen URL can never report unseen (no loops, structurally), and the 1% of fresh URLs wrongly reported seen cost one missed page each, never correctness.",
          code: `bloom.testAndSet(url) // k bits decide; memory is a constant you chose`,
          ref: {
            label: "dedupe RAM (KB)",
            values: [117, 117, 117, 117, 117, 117],
            request: {
              label: "100k URLs crawled",
              token: "bloom.testAndSet",
              result: "0 false negatives",
              states: s(
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
    ],
  },

  "effect-password-hash-vault": {
    control: "storage",
    variants: [
      {
        name: "fast hash, no salt",
        spec: {
          archetype: "ref",
          caption:
            "The table leaks, and every hash is md5(password) with no salt. A rainbow table computed years ago cracks the common passwords instantly, and identical hashes mean cracking one user cracks everyone who chose the same password. Watch the count climb: this is offline, at billions of guesses per second.",
          code: `md5(password) // one leaked table, one precomputed rainbow`,
          ref: {
            label: "accounts cracked",
            values: [
              0,
              184000,
              { v: 620000, bad: true },
              { v: 990000, bad: true },
              { v: 990000, bad: true },
              0,
            ],
            challenger: {
              label: "rainbow table",
              token: "md5",
              states: s(
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
      {
        name: "scrypt + salt",
        spec: {
          archetype: "ref",
          caption:
            "Same leak, different table: every record is scrypt with a random per-user salt, parameters embedded in the row. No rainbow table was computed with your salts, so precomputation is worthless, and scrypt's memory-hard cost turns billions of guesses per second into thousands. The cracked count stays where it belongs.",
          code: `scrypt$16384$8$1$salt$hash // per-user salt, memory-hard cost`,
          ref: {
            label: "accounts cracked",
            values: [0, 0, 0, 0, 0, 0],
            challenger: {
              label: "rainbow table",
              token: "salt",
              error: "no precomputed match",
              states: s("idle", "running", "running", "failed", "idle", "idle"),
            },
          },
        },
      },
    ],
  },

  "effect-quorum-read-repair": {
    control: "read",
    variants: [
      {
        name: "read one replica",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "The write landed on r1 and r2 while r3 was partitioned. r3 is back now, still holding yesterday, and this read happened to route there. The client gets theme=light, acts on it, and overwrites the user's change: staleness became a lost update because one copy was trusted alone.",
          code: `r3.get(key) // whichever replica you hit is the truth you get`,
          nodes: [
            {
              label: "r3 (was partitioned)",
              token: "r3.get",
              error: "theme=light (v1)",
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
              label: "r1",
              result: "theme=dark (v2)",
              states: s("idle", "idle", "idle", "idle", "idle", "idle"),
            },
            {
              label: "client",
              error: "acts on v1",
              notify: {
                atStep: 3,
                message: "the newer copy was never asked",
                icon: "🕳️",
              },
              states: s("idle", "running", "running", "death", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "R+W > N",
        spec: {
          archetype: "flow",
          arrowBefore: 3,
          caption:
            "W=2 and R=2 over 3 replicas: every read set overlaps every write set, so the answers must include a v2 copy. The reader takes the highest version, returns theme=dark, and writes v2 back to r3 on a detached fiber. The read was right AND the cluster is one replica less wrong.",
          code: `max(version) wins; repair(stale) forked // overlap makes stale unelectable`,
          nodes: [
            {
              label: "r1",
              result: "v2",
              token: "max(version)",
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
              label: "r3 (stale)",
              result: "v1, outvoted",
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
              label: "read repair",
              token: "repair(stale)",
              result: "r3 healed to v2",
              notify: {
                atStep: 4,
                message: "healing rode the read",
                icon: "🩹",
              },
              states: s("idle", "idle", "idle", "running", "completed", "idle"),
            },
            {
              label: "client",
              result: "theme=dark (v2)",
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

  "effect-optimistic-lock-retry": {
    control: "guard",
    variants: [
      {
        name: "unguarded",
        spec: {
          archetype: "ref",
          caption:
            "Two handlers read stock=10, both compute 9, both write 9. Fifty concurrent sales landed as one: the demo measures 49 lost updates and not a single error anywhere. The odometer flashes red on the second write, the one that silently erased a sale.",
          code: `stock = stock - 1 // read, compute, write, and the race wins`,
          ref: {
            label: "stock",
            values: [10, 9, { v: 9, bad: true }, { v: 9, bad: true }, 9, 10],
            request: {
              label: "sale A",
              token: "stock - 1",
              result: "wrote 9",
              states: s(
                "running",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            challenger: {
              label: "sale B",
              states: s(
                "running",
                "running",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
      {
        name: "versioned CAS",
        spec: {
          archetype: "ref",
          caption:
            "Every row carries a version and the write says WHERE version = 7. Sale A commits and bumps to 8; sale B's write matches zero rows and fails typed with both versions in hand. B re-reads stock=9, retries with jittered backoff, and lands 8. Fifty concurrent sales: value 50, zero lost, 286 conflicts retried.",
          code: `UPDATE ... WHERE version = 7 // the loser learns, re-reads, retries`,
          ref: {
            label: "stock",
            values: [10, 9, 9, 8, 8, 10],
            request: {
              label: "sale A (v7)",
              token: "version = 7",
              result: "v8",
              states: s(
                "running",
                "completed",
                "completed",
                "completed",
                "completed",
                "idle",
              ),
            },
            challenger: {
              label: "sale B (v7)",
              token: "retries",
              error: "conflict, retried",
              states: s(
                "running",
                "running",
                "failed",
                "completed",
                "completed",
                "idle",
              ),
            },
          },
        },
      },
    ],
  },

  "effect-deadlock-detector": {
    control: "cycle",
    variants: [
      {
        name: "no detection",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "T1 holds alice and wants bob; T2 holds bob and wants alice. All four Coffman conditions hold, so both wait forever. Nothing crashes and nothing logs: throughput just stops, and every later transaction that touches either account joins the frozen queue behind them.",
          code: `T1: lock(alice) lock(bob)   T2: lock(bob) lock(alice) // forever`,
          nodes: [
            {
              label: "T1 holds alice",
              token: "lock(bob)",
              error: "waiting on bob",
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "death",
                "idle",
              ),
            },
            {
              label: "T2 holds bob",
              token: "lock(alice)",
              error: "waiting on alice",
              states: s(
                "idle",
                "running",
                "running",
                "running",
                "death",
                "idle",
              ),
            },
            {
              label: "lock queue",
              error: "circular wait",
              notify: {
                atStep: 3,
                message: "each waits for the other, forever",
                icon: "🔄",
              },
              states: s("idle", "idle", "running", "running", "death", "idle"),
            },
          ],
        },
      },
      {
        name: "wait-for graph",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "The lock manager walks the wait-for graph inside the same atomic decision that would enqueue the wait. T2's request for alice would close the ring, so it fails typed as the victim, its ensuring releases bob, and T1 takes it and commits. One victim, one survivor, resolved in 21ms.",
          code: `wouldCycle(T2, alice) -> DeadlockVictim // refused before it waits`,
          nodes: [
            {
              label: "T2 (victim)",
              token: "DeadlockVictim",
              error: "aborted, locks freed",
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
              label: "T1",
              token: "wouldCycle",
              result: "committed",
              notify: {
                atStep: 3,
                message: "took bob the moment T2 released",
                icon: "🔓",
              },
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
              label: "lock queue",
              result: "cycle never formed",
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

  "effect-geohash-proximity": {
    control: "lookup",
    variants: [
      {
        name: "single cell",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "The user's cell is dr5rsr and the ramen shop 122 meters north sits in dr5ru2: near in space, disjoint in prefix. A lookup that only reads the user's cell returns everything EXCEPT the closest restaurant, and no error hints that the grid's edge just ate a result.",
          code: `index.get(cell(user)) // the boundary is invisible until it isn't`,
          nodes: [
            {
              label: "cell dr5rsr",
              token: "cell(user)",
              result: "2 places",
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
              label: "ramen @122m",
              error: "in dr5ru2: missed",
              notify: {
                atStep: 3,
                message: "across the street, across the cell",
                icon: "🍜",
              },
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
              label: "results",
              error: "closest spot absent",
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
      {
        name: "9 cells + haversine",
        spec: {
          archetype: "flow",
          arrowBefore: 2,
          caption:
            "The covering reads the center cell and its 8 neighbors (candidates, not answers), then the exact haversine circle keeps what is truly inside the radius, sorted by distance. The ramen shop crosses the boundary into the candidate set and comes back first at 122m; the LA noise never enters the math.",
          code: `covering(user, 9).flatMap(get) |> haversine <= r // grid proposes, circle disposes`,
          nodes: [
            {
              label: "9-cell covering",
              token: "covering",
              result: "3 candidates",
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
              label: "haversine filter",
              token: "haversine",
              result: "exact circle",
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
              label: "results",
              result: "ramen first @122m",
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
  "effect-weighted-load-balancer": {
    control: "strategy",
    variants: [
      {
        name: "round-robin",
        spec: {
          archetype: "ref",
          caption:
            "Round-robin hands the degraded backend its full rotation share. b3 is 12x slower, yet its in-flight queue climbs to 12 and stays there while a third of traffic waits behind it.",
          code: "backends[i % backends.length]  // b3 gets its slice regardless",
          ref: {
            label: "b3 in-flight",
            values: [
              { v: 0 },
              { v: 4 },
              { v: 8 },
              { v: 12, bad: true },
              { v: 12, bad: true },
              { v: 12, bad: true },
            ],
            unit: "reqs",
            request: {
              label: "route",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "running",
              ],
              result: "b3 buried",
              token: "backends[i % backends.length]",
            },
          },
        },
      },
      {
        name: "power-of-two",
        spec: {
          archetype: "ref",
          caption:
            "Sampling two random backends and taking the emptier one routes around b3 the moment its counter is high. Its queue peaks at 6, not 12, and it serves 9 of 90 instead of 30.",
          code: "la <= lb ? backends[a] : backends[b]  // pick the emptier sample",
          ref: {
            label: "b3 in-flight",
            values: [
              { v: 0 },
              { v: 2 },
              { v: 4 },
              { v: 4 },
              { v: 2 },
              { v: 2 },
            ],
            unit: "reqs",
            request: {
              label: "route",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "b3 spared",
              token: "la <= lb ? backends[a] : backends[b]",
            },
          },
        },
      },
    ],
  },
  "effect-lru-cache-eviction": {
    control: "policy",
    variants: [
      {
        name: "plain LRU",
        spec: {
          archetype: "flow",
          caption:
            "A 100-key batch scan marches every hot key out of a plain LRU. One-touch cold keys are treated exactly like real traffic, so the next minute is all misses.",
          code: "lru.set(scanKey)  // evicts a hot key behind it",
          nodes: [
            {
              label: "4 hot keys",
              result: "0/4 survive",
              token: "lru.set(scanKey)",
              states: ["idle", "running", "running", "death", "death", "idle"],
            },
            {
              label: "scan (100 cold)",
              result: "flushes cache",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
      {
        name: "segmented LRU",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Scan keys enter probation and die there without touching the protected segment. A second hit is required for tenure, so all 4 hot keys survive the same scan.",
          code: "second hit -> promote to protected",
          nodes: [
            {
              label: "scan (100 cold)",
              result: "churns probation",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "4 hot keys",
              result: "4/4 survive",
              token: "second hit -> promote to protected",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-write-behind-cache": {
    control: "durability",
    variants: [
      {
        name: "no journal",
        spec: {
          archetype: "ref",
          caption:
            "Naive write-behind buffers writes in memory and flushes later. A crash between flushes drops every acknowledged write: the cache said OK, the store never heard.",
          code: "crash before flush  // 2 acknowledged writes gone",
          ref: {
            label: "recovered writes",
            values: [
              { v: 0 },
              { v: 1 },
              { v: 2 },
              { v: 0, bad: true },
              { v: 0, bad: true },
              { v: 0, bad: true },
            ],
            request: {
              label: "set",
              states: ["idle", "running", "running", "death", "death", "idle"],
              error: "buffer lost",
              token: "crash before flush",
            },
          },
        },
      },
      {
        name: "journaled",
        spec: {
          archetype: "ref",
          caption:
            "Every accepted write is journaled first, then coalesced (100 bumps to one key flush as one store write). The same crash costs zero acknowledged writes: recovery replays the journal.",
          code: "append journal -> then coalesce -> flush",
          ref: {
            label: "recovered writes",
            values: [
              { v: 0 },
              { v: 1 },
              { v: 2 },
              { v: 2 },
              { v: 2 },
              { v: 2 },
            ],
            request: {
              label: "set",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "replayed",
              token: "append journal -> then coalesce -> flush",
            },
          },
        },
      },
    ],
  },
  "effect-cache-penetration-shield": {
    control: "shield",
    variants: [
      {
        name: "unshielded",
        spec: {
          archetype: "ref",
          caption:
            "A cache only helps keys that exist. 50 requests for a made-up id all miss, the database confirms nothing, and nothing is cached: every request repeats the full trip.",
          code: "cache.miss -> db.fetch(fakeKey)  // 50 db hits",
          ref: {
            label: "database hits",
            values: [
              { v: 0 },
              { v: 12 },
              { v: 25 },
              { v: 38, bad: true },
              { v: 50, bad: true },
              { v: 50, bad: true },
            ],
            request: {
              label: "get fakeKey",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "running",
              ],
              result: "db buried",
              token: "cache.miss -> db.fetch(fakeKey)",
            },
          },
        },
      },
      {
        name: "shielded",
        spec: {
          archetype: "ref",
          caption:
            "A bloom filter seeded with every real key answers definitely-absent in memory, so 50 rotating fake keys die before the database hears them. Zero database hits.",
          code: "!bloom.mightExist(key) -> reject in memory",
          ref: {
            label: "database hits",
            values: [
              { v: 0 },
              { v: 0 },
              { v: 0 },
              { v: 0 },
              { v: 0 },
              { v: 0 },
            ],
            request: {
              label: "get fakeKey",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "0 db hits",
              token: "!bloom.mightExist(key) -> reject in memory",
            },
          },
        },
      },
    ],
  },
  "effect-cdn-origin-shield": {
    control: "shield",
    variants: [
      {
        name: "no shield",
        spec: {
          archetype: "ref",
          caption:
            "Six edge POPs all miss on the same fresh object and send six simultaneous fetches to the origin. Multiply by every object that just expired and the origin serves the internet again.",
          code: "each POP -> origin.fetch(obj)  // 6 fetches",
          ref: {
            label: "origin fetches",
            values: [
              { v: 0 },
              { v: 2 },
              { v: 4 },
              { v: 6, bad: true },
              { v: 6, bad: true },
              { v: 6, bad: true },
            ],
            request: {
              label: "POP miss",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "running",
              ],
              result: "origin storm",
              token: "each POP -> origin.fetch(obj)",
            },
          },
        },
      },
      {
        name: "shield tier",
        spec: {
          archetype: "ref",
          caption:
            "Edges fill from one shield cache and concurrent misses coalesce onto a single in-flight fetch via a per-key Deferred. Six simultaneous misses become exactly one origin fetch.",
          code: "first miss fetches; the rest await the Deferred",
          ref: {
            label: "origin fetches",
            values: [
              { v: 0 },
              { v: 1 },
              { v: 1 },
              { v: 1 },
              { v: 1 },
              { v: 1 },
            ],
            request: {
              label: "POP miss",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "5 coalesced",
              token: "first miss fetches; the rest await the Deferred",
            },
          },
        },
      },
    ],
  },
  "effect-dns-resolver-cache": {
    control: "cache",
    variants: [
      {
        name: "no cache",
        spec: {
          archetype: "ref",
          caption:
            "Every lookup walks root, TLD, and authority: three hops before your app sends a byte. Forty-one lookups of one name cost 123 upstream queries.",
          code: "resolve(name)  // 3 hops, every time",
          ref: {
            label: "upstream queries",
            values: [
              { v: 0 },
              { v: 30 },
              { v: 60 },
              { v: 90, bad: true },
              { v: 123, bad: true },
              { v: 123, bad: true },
            ],
            request: {
              label: "resolve",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "running",
              ],
              result: "123 hops",
              token: "resolve(name)",
            },
          },
        },
      },
      {
        name: "TTL + negative",
        spec: {
          archetype: "ref",
          caption:
            "The first lookup walks the recursion; repeats cost zero hops until the TTL expires. Even NXDOMAIN is cached with its own shorter TTL, so a typo in a hot loop dies at the resolver.",
          code: "cache.hit && held.expires > now -> 0 hops",
          ref: {
            label: "upstream queries",
            values: [
              { v: 0 },
              { v: 3 },
              { v: 3 },
              { v: 3 },
              { v: 3 },
              { v: 3 },
            ],
            request: {
              label: "resolve",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "3 total",
              token: "cache.hit && held.expires > now -> 0 hops",
            },
          },
        },
      },
    ],
  },
  "effect-two-phase-commit": {
    control: "outcome",
    variants: [
      {
        name: "unanimous",
        spec: {
          archetype: "flow",
          caption:
            "Phase 1: every participant durably stages and votes yes. Only then does phase 2 commit them all. Both sides move together, total conserved to the cent.",
          code: "votes.every(yes) -> log decision -> commit all",
          nodes: [
            {
              label: "prepare (vote)",
              result: "all yes",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "commit",
              result: "wallet 40 | bank 60",
              token: "votes.every(yes) -> log decision -> commit all",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
      {
        name: "one refuses",
        spec: {
          archetype: "flow",
          caption:
            "The wallet cannot cover 150, so it votes no in phase 1. The decision logs abort before anyone commits, and every participant rolls back. No money minted from nothing.",
          code: "one no -> abort -> nobody commits",
          nodes: [
            {
              label: "prepare (vote)",
              result: "wallet: no",
              token: "one no -> abort -> nobody commits",
              states: [
                "idle",
                "running",
                "running",
                "failed",
                "failed",
                "idle",
              ],
            },
            {
              label: "abort all",
              result: "wallet 100 | bank 0",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-token-bucket-shaper": {
    control: "limiter",
    variants: [
      {
        name: "fixed window",
        spec: {
          archetype: "ref",
          caption:
            "A fixed window counted on the clock minute admits 10 at 0:59 and 10 more at 1:00. Twenty requests land in a fraction of a second: the exact 2x boundary burst the limit forbids.",
          code: "if (now - windowStart >= 1000) count = 0  // resets, leaks 2x",
          ref: {
            label: "admitted / sec",
            values: [
              { v: 0 },
              { v: 10 },
              { v: 20, bad: true },
              { v: 20, bad: true },
              { v: 10 },
              { v: 0 },
            ],
            request: {
              label: "burst",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "idle",
              ],
              result: "2x leaked",
              token: "if (now - windowStart >= 1000) count = 0",
            },
          },
        },
      },
      {
        name: "token bucket",
        spec: {
          archetype: "ref",
          caption:
            "Tokens refill at a steady rate with no boundary to game. A burst up to capacity passes, then throughput settles to the refill rate. The true rate over any window stays bounded.",
          code: "refilled = min(cap, tokens + elapsed * rate)",
          ref: {
            label: "tokens",
            values: [
              { v: 10 },
              { v: 6 },
              { v: 2 },
              { v: 0 },
              { v: 1 },
              { v: 4 },
            ],
            unit: "tok",
            request: {
              label: "acquire",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "shaped",
              token: "refilled = min(cap, tokens + elapsed * rate)",
            },
          },
        },
      },
    ],
  },
  "effect-saga-payment-orchestrator": {
    archetype: "scope",
    caption:
      "Charge, reserve, issue: each forward step registers its compensation. Ticketing fails, so the saga runs the compensations in reverse for exactly the steps that succeeded. Card refunded, seat released, nothing stranded.",
    code: "issue-ticket fails -> compensate reserve-seat, then charge-card",
    scope: {
      mode: "saga",
      node: {
        label: "book trip",
        error: "issue-ticket fails",
        states: ["running", "running", "running", "failed", "failed", "failed"],
      },
      finalizers: [
        {
          label: "charge-card",
          states: [
            "hidden",
            "running",
            "completed",
            "completed",
            "completed",
            "completed",
          ],
          compensate: "refund-card",
        },
        {
          label: "reserve-seat",
          states: [
            "hidden",
            "hidden",
            "running",
            "completed",
            "completed",
            "completed",
          ],
          compensate: "release-seat",
        },
      ],
    },
  },
  "effect-mvcc-snapshot-isolation": {
    control: "concurrency",
    variants: [
      {
        name: "lost update",
        spec: {
          archetype: "ref",
          caption:
            "Two transactions both read balance 100 and both write 150. Snapshot isolation alone lets the second overwrite the first: one +50 is silently lost, the balance lands at 150 instead of 200.",
          code: "both read 100 -> both write 150  // one update lost",
          ref: {
            label: "balance",
            values: [
              { v: 100 },
              { v: 100 },
              { v: 150 },
              { v: 150, bad: true },
              { v: 150, bad: true },
              { v: 150, bad: true },
            ],
            unit: "$",
            request: {
              label: "write",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "lost +50",
              token: "both read 100 -> both write 150",
            },
          },
        },
      },
      {
        name: "first-committer-wins",
        spec: {
          archetype: "ref",
          caption:
            "Commit validates the write set against versions committed after the snapshot. The second transaction is aborted with a typed WriteConflict, so it re-reads and the balance stays correct at 150.",
          code: "written key changed after snapshot -> WriteConflict",
          ref: {
            label: "balance",
            values: [
              { v: 100 },
              { v: 100 },
              { v: 150 },
              { v: 150 },
              { v: 150 },
              { v: 150 },
            ],
            unit: "$",
            request: {
              label: "write",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "conflict retried",
              token: "written key changed after snapshot -> WriteConflict",
            },
          },
        },
      },
    ],
  },
  "effect-event-sourced-aggregate": {
    control: "model",
    variants: [
      {
        name: "state-only row",
        spec: {
          archetype: "flow",
          caption:
            "Storing just the current balance forgets how it got there. A corrupted value has no audit trail and cannot be replayed, and a concurrent write overwrites history.",
          code: "UPDATE account SET balance = ?  // history gone",
          nodes: [
            {
              label: "current balance",
              result: "75, no history",
              token: "UPDATE account SET balance = ?",
              states: ["idle", "running", "running", "death", "death", "idle"],
            },
          ],
        },
      },
      {
        name: "event log",
        spec: {
          archetype: "flow",
          caption:
            "State is a fold over ordered facts, so any past state is a prefix fold away and compare-and-append refuses a stale write with a typed ConcurrencyConflict. The log is the source of truth.",
          code: "fold([Opened, Deposited, Withdrew]) -> state",
          nodes: [
            {
              label: "event log",
              result: "4 facts kept",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "fold",
              result: "balance 75, v4",
              token: "fold([Opened, Deposited, Withdrew]) -> state",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-leader-lease-election": {
    control: "guard",
    variants: [
      {
        name: "no fencing",
        spec: {
          archetype: "ref",
          caption:
            "The old leader froze past its lease, node-b took over, then node-a thawed and wrote with stale authority. Without a fencing token the resource accepts it, rolling the value backward.",
          code: "resource.write(staleValue)  // no token check",
          ref: {
            label: "resource owner",
            values: [
              { v: "a" },
              { v: "a" },
              { v: "b" },
              { v: "a", bad: true },
              { v: "a", bad: true },
              { v: "a", bad: true },
            ],
            request: {
              label: "zombie write",
              states: ["idle", "running", "running", "death", "death", "idle"],
              error: "split brain",
              token: "resource.write(staleValue)",
            },
          },
        },
      },
      {
        name: "fenced",
        spec: {
          archetype: "ref",
          caption:
            "Every lease carries a monotonic token and the resource rejects any write below the highest it has seen. The thawed zombie writes with token 1 against a token-2 world and is fenced out.",
          code: "if (token < seen) -> FencedOut",
          ref: {
            label: "resource owner",
            values: [
              { v: "a" },
              { v: "a" },
              { v: "b" },
              { v: "b" },
              { v: "b" },
              { v: "b" },
            ],
            request: {
              label: "zombie write",
              states: [
                "idle",
                "running",
                "running",
                "failed",
                "failed",
                "idle",
              ],
              error: "fenced",
              token: "if (token < seen) -> FencedOut",
            },
          },
        },
      },
    ],
  },
  "effect-vector-clock-causality": {
    control: "ordering",
    variants: [
      {
        name: "wall-clock LWW",
        spec: {
          archetype: "flow",
          caption:
            "Two nodes edit the same doc; their clocks disagree by 200ms. Last-write-wins by timestamp picks the wrong one and silently deletes the edit that was actually made later.",
          code: "wallClockA > wallClockB ? a : b  // drops a real edit",
          nodes: [
            {
              label: "edit A {a:1}",
              result: "kept (fast clock)",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "edit B {b:1}",
              result: "deleted",
              token: "wallClockA > wallClockB ? a : b",
              states: ["idle", "running", "running", "death", "death", "idle"],
            },
          ],
        },
      },
      {
        name: "vector clock",
        spec: {
          archetype: "flow",
          caption:
            "Comparing what each node had observed reports before, after, or concurrent. The two edits are concurrent, so the system surfaces a conflict to merge instead of ranking one away.",
          code: "compare({a:1}, {b:1}) === 'concurrent'",
          nodes: [
            {
              label: "edit A {a:1}",
              result: "survives",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "edit B {b:1}",
              result: "survives, merge",
              token: "compare({a:1}, {b:1}) === 'concurrent'",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-lsm-memtable-compaction": {
    control: "read",
    variants: [
      {
        name: "delete as gap",
        spec: {
          archetype: "flow",
          caption:
            "If a delete just stops writing, an old copy of the key still sits in an older SSTable and resurrects on the next lookup. Immutable segments make silent gaps dangerous.",
          code: "read old SSTable -> deleted key comes back",
          nodes: [
            {
              label: "get k (deleted)",
              result: "returns 'alive'",
              token: "read old SSTable -> deleted key comes back",
              states: ["idle", "running", "running", "death", "death", "idle"],
            },
          ],
        },
      },
      {
        name: "tombstone + newest-wins",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Reads walk newest-to-oldest and stop at the first hit; a delete is a tombstone that masks older values. Compaction then merges segments and physically drops the garbage.",
          code: "first hit wins; tombstone -> absent",
          nodes: [
            {
              label: "3 segments",
              result: "newest first",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "get k",
              result: "miss (tombstoned)",
              token: "first hit wins; tombstone -> absent",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-wal-crash-recovery": {
    control: "recovery",
    variants: [
      {
        name: "committed",
        spec: {
          archetype: "flow",
          caption:
            "The change was logged and fsynced before the pages were touched, and the transaction committed. A crash wipes the volatile pages, but recovery redoes the committed write from the log.",
          code: "log commit -> crash -> redo from log",
          nodes: [
            {
              label: "write + commit",
              result: "logged",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "crash + recover",
              result: "balance 100 restored",
              token: "log commit -> crash -> redo from log",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
      {
        name: "uncommitted",
        spec: {
          archetype: "flow",
          caption:
            "A write with no matching commit record is in the log but never committed. Recovery redoes only committed transactions, so the half-written value is discarded, not applied.",
          code: "no commit record -> not replayed",
          nodes: [
            {
              label: "write (no commit)",
              result: "in log only",
              states: [
                "idle",
                "running",
                "running",
                "failed",
                "failed",
                "idle",
              ],
            },
            {
              label: "crash + recover",
              result: "discarded",
              token: "no commit record -> not replayed",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-fair-priority-scheduler": {
    control: "fairness",
    variants: [
      {
        name: "strict priority",
        spec: {
          archetype: "flow",
          caption:
            "A steady stream of priority-9 work keeps arriving, so the priority-1 backup job never reaches the front of the heap. Ten rounds pass and it has not run once: starvation.",
          code: "always pop max priority  // backup never runs",
          nodes: [
            {
              label: "urgent stream (p9)",
              result: "always first",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "backup (p1)",
              result: "starved",
              token: "always pop max priority",
              states: ["idle", "running", "running", "death", "death", "idle"],
            },
          ],
        },
      },
      {
        name: "aging",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Effective priority rises with the time a job has waited. The backup ages past priority 9 and finally runs at round 7, so even the lowest tier has a bounded worst-case wait.",
          code: "base + floor(waited / agePerTick)",
          nodes: [
            {
              label: "urgent stream (p9)",
              result: "runs first, at first",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "backup (aged)",
              result: "runs at round 7",
              token: "base + floor(waited / agePerTick)",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-merkle-anti-entropy": {
    control: "sync",
    variants: [
      {
        name: "ship everything",
        spec: {
          archetype: "flow",
          caption:
            "Reconciling two replicas by comparing key-by-key (or resending the dataset) moves bytes proportional to the data, even when they differ by a single row out of 64.",
          code: "for k in allKeys: compare(a[k], b[k])  // O(n)",
          nodes: [
            {
              label: "compare 64 keys",
              result: "64 comparisons",
              token: "for k in allKeys: compare(a[k], b[k])",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
      {
        name: "merkle diff",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Compare root hashes, then descend only into subtrees that disagree. One changed key among 64 is found by visiting 13 tree nodes; equal roots prove equal contents outright.",
          code: "x.hash === y.hash -> prune subtree",
          nodes: [
            {
              label: "roots differ",
              result: "descend",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "diff",
              result: "k37, 13 nodes visited",
              token: "x.hash === y.hash -> prune subtree",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-connection-pool-fair": {
    archetype: "scope",
    caption:
      "The pool caps concurrency at what the database can serve: 12 concurrent requests against 3 connections never run more than 3 at once. Surplus waits FIFO, and a saturated wait fails fast with AcquireTimeout instead of hanging.",
    code: "inFlight >= limit ? enqueue(waiter) : take(idle)",
    scope: {
      mode: "scope",
      node: {
        label: "12 requests",
        result: "peak 3 in use",
        states: [
          "running",
          "running",
          "running",
          "running",
          "running",
          "completed",
        ],
      },
      finalizers: [
        {
          label: "conn 1",
          states: [
            "hidden",
            "running",
            "completed",
            "completed",
            "completed",
            "completed",
          ],
        },
        {
          label: "conn 2",
          states: [
            "hidden",
            "hidden",
            "running",
            "completed",
            "completed",
            "completed",
          ],
        },
        {
          label: "conn 3",
          states: [
            "hidden",
            "hidden",
            "hidden",
            "running",
            "completed",
            "completed",
          ],
        },
      ],
    },
  },
  "effect-gossip-dissemination": {
    control: "spread",
    variants: [
      {
        name: "central broadcast",
        spec: {
          archetype: "flow",
          caption:
            "One coordinator pushing every update to every node is O(N) work on one machine and a single point of failure. If the broadcaster dies mid-fan-out, propagation stops.",
          code: "for node in cluster: coordinator.push(node)  // O(N)",
          nodes: [
            {
              label: "coordinator",
              result: "32 pushes, one node",
              token: "for node in cluster: coordinator.push(node)",
              states: ["idle", "running", "running", "death", "death", "idle"],
            },
          ],
        },
      },
      {
        name: "epidemic gossip",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Each node tells a few random peers what it knows. One write reaches all 32 nodes in 3 rounds with no coordinator, and version-vector maxima make re-exchange idempotent so the cluster converges.",
          code: "gossip to random peers; merge by max version",
          nodes: [
            {
              label: "node 0 writes",
              result: "tells 3 peers",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "converge",
              result: "all 32, 3 rounds",
              token: "gossip to random peers; merge by max version",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-dataloader-batch": {
    control: "loading",
    variants: [
      {
        name: "N+1",
        spec: {
          archetype: "ref",
          caption:
            "Rendering 100 posts that each fetch their author fires 1 query for the posts and 100 for the authors. The code reads naturally; the database sees a storm of single-row lookups.",
          code: "posts.map(p => db.author(p.authorId))  // 100 queries",
          ref: {
            label: "database queries",
            values: [
              { v: 1 },
              { v: 25 },
              { v: 50 },
              { v: 75, bad: true },
              { v: 100, bad: true },
              { v: 100, bad: true },
            ],
            request: {
              label: "load author",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "running",
              ],
              result: "100 queries",
              token: "posts.map(p => db.author(p.authorId))",
            },
          },
        },
      },
      {
        name: "batched",
        spec: {
          archetype: "ref",
          caption:
            "The loader collects every key requested within one tick, dedupes them, and issues a single WHERE id IN (...) query. One hundred author lookups over three distinct ids become one query.",
          code: "flush tick -> db.authors(WHERE id IN dedup(keys))",
          ref: {
            label: "database queries",
            values: [
              { v: 0 },
              { v: 1 },
              { v: 1 },
              { v: 1 },
              { v: 1 },
              { v: 1 },
            ],
            request: {
              label: "load author",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "1 query, 3 ids",
              token: "flush tick -> db.authors(WHERE id IN dedup(keys))",
            },
          },
        },
      },
    ],
  },
  "effect-adaptive-concurrency-limit": {
    control: "limit",
    variants: [
      {
        name: "fixed limit",
        spec: {
          archetype: "ref",
          caption:
            "Any constant is wrong at some point: pick 64 and a degraded downstream is buried under work it cannot serve, latency explodes, and timeouts cascade. The limit does not move when it must.",
          code: "const LIMIT = 64  // wrong the moment capacity drops",
          ref: {
            label: "concurrency limit",
            values: [
              { v: 64 },
              { v: 64 },
              { v: 64, bad: true },
              { v: 64, bad: true },
              { v: 64, bad: true },
              { v: 64, bad: true },
            ],
            request: {
              label: "admit",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "running",
              ],
              error: "buried",
              token: "const LIMIT = 64",
            },
          },
        },
      },
      {
        name: "AIMD",
        spec: {
          archetype: "ref",
          caption:
            "Additive-increase while healthy, multiplicative-decrease on a latency spike, the control law TCP uses. A slow-response burst halves the limit fast (64 to 8) so the system rides under the cliff.",
          code: "overloaded ? floor(limit/2) : limit + 1",
          ref: {
            label: "concurrency limit",
            values: [
              { v: 64 },
              { v: 32 },
              { v: 16 },
              { v: 8 },
              { v: 10 },
              { v: 12 },
            ],
            request: {
              label: "feedback",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "settled ~capacity",
              token: "overloaded ? floor(limit/2) : limit + 1",
            },
          },
        },
      },
    ],
  },
  "effect-crdt-counter-merge": {
    control: "counter",
    variants: [
      {
        name: "single cell",
        spec: {
          archetype: "ref",
          caption:
            "Two servers both read 10 and write 11. Last-write-wins on one mutable number turns two likes into one: an increment vanishes under any race or partition.",
          code: "read 10 -> write 11 (x2)  // one like lost",
          ref: {
            label: "likes",
            values: [
              { v: 10 },
              { v: 10 },
              { v: 11, bad: true },
              { v: 11, bad: true },
              { v: 11, bad: true },
              { v: 11, bad: true },
            ],
            request: {
              label: "increment",
              states: ["idle", "running", "running", "death", "death", "idle"],
              error: "lost +1",
              token: "read 10 -> write 11 (x2)",
            },
          },
        },
      },
      {
        name: "G-Counter",
        spec: {
          archetype: "ref",
          caption:
            "Each replica owns a slot it only increments; the value is the sum, and merge is element-wise max, commutative, associative, idempotent. Partitioned increments 3+5+2 converge to 10 on every replica.",
          code: "merge = element-wise max; value = sum(slots)",
          ref: {
            label: "total",
            values: [
              { v: 0 },
              { v: 3 },
              { v: 8 },
              { v: 10 },
              { v: 10 },
              { v: 10 },
            ],
            request: {
              label: "merge",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "converged 10",
              token: "merge = element-wise max; value = sum(slots)",
            },
          },
        },
      },
    ],
  },
  "effect-sliding-window-rate-limit": {
    control: "window",
    variants: [
      {
        name: "fixed window",
        spec: {
          archetype: "ref",
          caption:
            "A fixed window snaps to a grid, admitting 10 at 0:59.9 and 10 more at 1:00.0. Twenty requests slip through in a millisecond straddling the reset: the boundary burst it was meant to forbid.",
          code: "count >= limit ? deny : admit  // resets on the grid",
          ref: {
            label: "admitted @ boundary",
            values: [
              { v: 0 },
              { v: 10 },
              { v: 20, bad: true },
              { v: 20, bad: true },
              { v: 10 },
              { v: 0 },
            ],
            request: {
              label: "request",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "idle",
              ],
              result: "2x leaked",
              token: "count >= limit ? deny : admit",
            },
          },
        },
      },
      {
        name: "sliding counter",
        spec: {
          archetype: "ref",
          caption:
            "Keep only the current and previous window counts, weighting the previous by its remaining overlap. The same boundary admits at most ~10, with O(1) state per key and no timestamp log to exhaust.",
          code: "estimate = current + previous * overlap",
          ref: {
            label: "admitted @ boundary",
            values: [
              { v: 0 },
              { v: 5 },
              { v: 10 },
              { v: 10 },
              { v: 5 },
              { v: 0 },
            ],
            request: {
              label: "request",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
              result: "burst blocked",
              token: "estimate = current + previous * overlap",
            },
          },
        },
      },
    ],
  },
  "effect-scatter-gather-quorum": {
    control: "gather",
    variants: [
      {
        name: "wait for all",
        spec: {
          archetype: "flow",
          caption:
            "Fanning out to 5 shards and waiting for all of them is as slow as the worst shard, every time. Two 500ms stragglers gate the whole query at 500ms while three fast shards sit idle.",
          code: "Effect.all(shards)  // slowest shard wins",
          nodes: [
            {
              label: "3 fast shards",
              result: "10ms each",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "wait for all 5",
              result: "502ms (straggler)",
              token: "Effect.all(shards)",
              states: [
                "idle",
                "running",
                "running",
                "running",
                "running",
                "completed",
              ],
            },
          ],
        },
      },
      {
        name: "quorum + timeout",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Return once a quorum answers; a timeout degrades to a partial result rather than hanging, and stragglers are interrupted so no fiber leaks. A 3-of-5 quorum lands in 16ms past two 500ms shards.",
          code: "quorumMet.await race timeout -> interrupt rest",
          nodes: [
            {
              label: "5 shards scattered",
              result: "race",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "3-of-5 quorum",
              result: "16ms, stragglers cut",
              token: "quorumMet.await race timeout -> interrupt rest",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
  "effect-chunked-upload-integrity": {
    control: "transfer",
    variants: [
      {
        name: "one stream",
        spec: {
          archetype: "flow",
          caption:
            "Sending a large file as one stream lets a single flipped byte produce a silently wrong object the server stores as fine, and a connection lost at 95% throws away all the good work.",
          code: "PUT wholeFile  // one flipped byte, silent corruption",
          nodes: [
            {
              label: "upload 100MB",
              result: "corrupt, accepted",
              token: "PUT wholeFile",
              states: ["idle", "running", "running", "death", "death", "idle"],
            },
          ],
        },
      },
      {
        name: "chunked + checksum",
        spec: {
          archetype: "flow",
          arrowBefore: 1,
          caption:
            "Each chunk carries a checksum recomputed on arrival, so a corrupt chunk is rejected for re-send, resume ships only the missing chunks, and a final object digest is the last line of defense.",
          code: "digest(chunk) !== chunk.checksum -> ChecksumMismatch",
          nodes: [
            {
              label: "9 chunks",
              result: "each verified",
              states: [
                "idle",
                "running",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
            {
              label: "reassemble",
              result: "object digest OK",
              token: "digest(chunk) !== chunk.checksum -> ChecksumMismatch",
              states: [
                "idle",
                "idle",
                "running",
                "completed",
                "completed",
                "idle",
              ],
            },
          ],
        },
      },
    ],
  },
};

/**
 * attempt-machine.ts: the reservation state machine behind an exactly-once
 * external effect on Convex. Pure functions, no Convex imports, so the logic is
 * testable without a deployment. `charges.ts` is a thin handler over this.
 *
 * Pinned to convex@1.42.3.
 *
 * Failure modes solved:
 *
 *   1. Double charge from a re-run action. Convex mutations are serializable
 *      OCC transactions, but actions are not transactions at all:
 *      "Unlike queries and mutations, actions may have side-effects and
 *      therefore can't be automatically retried by Convex when errors occur."
 *      (https://docs.convex.dev/functions/actions). The mistake is calling
 *      Stripe from an action and writing the result afterwards: if the process
 *      dies between the charge and the write, the next attempt charges again,
 *      because the database has no memory that the first call happened. Here
 *      the mutation reserves an attempt row BEFORE the action runs, so the
 *      intent is durable at the instant the effect becomes possible.
 *
 *   2. A fresh provider idempotency key per retry, which defeats the provider's
 *      own dedupe. The key is minted once, inside the reserving mutation,
 *      derived from the attempt document id that Convex assigns transactionally.
 *      Every later attempt on the same request reuses that exact string, so the
 *      provider collapses the duplicate charge even when Convex genuinely runs
 *      the action twice. Generating the key in the action, or on the client per
 *      retry, gives the provider two different keys and two real charges.
 *
 *   3. The zombie writer. An action from attempt 3 stalls behind a slow network
 *      call, the lease expires, attempt 4 takes over and commits "failed", and
 *      then attempt 3 wakes up and writes "succeeded" over it. `decideSettle`
 *      fences on the attempt number, so a settle from a superseded attempt is
 *      dropped instead of rewriting a terminal outcome.
 *
 *   4. Infinite retry on a permanent error. A declined card does not succeed on
 *      attempt 40 either. Permanent results commit immediately as terminal and
 *      never re-enter the loop; only transient results consume an attempt.
 *
 * The invariant: at most one attempt holds the lease at any instant, the
 * provider key is constant for the life of a request, and a terminal outcome is
 * written once and then only ever replayed.
 *
 * run: bun run attempt-machine.ts
 */

/** Terminal result of the external call, as stored on the attempt row. */
export type ChargeOutcome =
  | {
      readonly status: "succeeded";
      readonly providerChargeId: string;
      readonly amountCents: number;
    }
  | {
      readonly status: "failed";
      readonly code: string;
      readonly message: string;
    };

/**
 * One row of the `chargeAttempts` table. `requestId` is the caller's
 * idempotency key (for example `order:8841:capture`), unique by index.
 */
export interface AttemptRecord {
  readonly requestId: string;
  readonly state: "reserved" | "settled";
  /** Handed to the payment provider. Constant for the life of the request. */
  readonly providerKey: string;
  /** Monotonic fence. Incremented every time the lease is taken. */
  readonly attempt: number;
  /** Wall clock ms after which another attempt may take the lease. */
  readonly leaseUntil: number;
  readonly outcome: ChargeOutcome | null;
  readonly lastError: string | null;
}

export interface AttemptPolicy {
  /** How long one action gets to finish before the lease can be retaken. */
  readonly leaseMs: number;
  /** Total attempts allowed before the request is abandoned as stuck. */
  readonly maxAttempts: number;
}

export const defaultAttemptPolicy: AttemptPolicy = {
  // Actions time out after 10 minutes (docs.convex.dev/functions/actions), so a
  // lease shorter than that can be retaken while the first action is still
  // legally running. That is survivable only because the provider key is shared.
  leaseMs: 11 * 60_000,
  maxAttempts: 5,
};

export type ReserveDecision =
  /** No row yet: insert a reserved row and schedule the action. */
  | { readonly kind: "reserve"; readonly attempt: 1 }
  /** Already terminal: hand back the stored outcome, run nothing. */
  | { readonly kind: "replay"; readonly outcome: ChargeOutcome }
  /** Another action holds the lease: tell the caller when to look again. */
  | { readonly kind: "in-flight"; readonly retryAfterMs: number }
  /** Lease expired: take it over, same provider key, next fence number. */
  | { readonly kind: "retake"; readonly attempt: number }
  /** Budget spent: stop scheduling and surface it for a human. */
  | { readonly kind: "abandon"; readonly attempts: number };

/**
 * The single decision the reserving mutation makes. Called inside a Convex
 * mutation, so the read of the existing row and the write that follows are one
 * serializable transaction: two concurrent reserves cannot both see `null`.
 */
export function decideReserve(
  existing: AttemptRecord | null,
  now: number,
  policy: AttemptPolicy = defaultAttemptPolicy,
): ReserveDecision {
  if (existing === null) return { kind: "reserve", attempt: 1 };
  if (existing.state === "settled" && existing.outcome !== null) {
    return { kind: "replay", outcome: existing.outcome };
  }
  if (now < existing.leaseUntil) {
    return { kind: "in-flight", retryAfterMs: existing.leaseUntil - now };
  }
  if (existing.attempt >= policy.maxAttempts) {
    return { kind: "abandon", attempts: existing.attempt };
  }
  return { kind: "retake", attempt: existing.attempt + 1 };
}

/**
 * Provider idempotency key. Derived from the attempt document id, which Convex
 * assigns when the reserving transaction commits, so it is unique per request
 * and identical across every retry of that request.
 *
 * Never call Math.random() here. Convex makes a mutation deterministic in the
 * senses that matter for OCC, but not this one: per
 * https://docs.convex.dev/functions/runtimes, inside a function "rand1 has a
 * new value for each function run", so an OCC re-execution mints a different
 * key, and a module-level Math.random() is frozen at deploy time and shared by
 * every request. Only a value the database assigned is stable across a re-run.
 */
export function providerKeyFor(attemptDocId: string): string {
  return `blank-charge-${attemptDocId}`;
}

/**
 * Terminal outcome for a request that burned its whole attempt budget. The
 * sweeper writes this so the row leaves the ("reserved", leaseUntil) index
 * range; otherwise it is rescanned forever and crowds out live stalled rows.
 */
export function abandonedOutcome(attempts: number): ChargeOutcome {
  return {
    status: "failed",
    code: "attempts_exhausted",
    message: `capture abandoned after ${attempts} attempts, needs manual reconciliation against the provider`,
  };
}

/** What the action reports back to the settling mutation. */
export type AttemptResult =
  | {
      readonly kind: "succeeded";
      readonly providerChargeId: string;
      readonly amountCents: number;
    }
  | {
      readonly kind: "permanent-failure";
      readonly code: string;
      readonly message: string;
    }
  | { readonly kind: "transient-failure"; readonly message: string };

export type SettleDecision =
  /** Write the terminal outcome and stop. */
  | { readonly kind: "commit"; readonly outcome: ChargeOutcome }
  /** Transient: release the lease so the next attempt can take over. */
  | { readonly kind: "release"; readonly lastError: string }
  /** Stale or duplicate settle: change nothing. */
  | { readonly kind: "ignore"; readonly reason: string };

/**
 * Fenced settle. `attempt` is the fence the action was handed at reserve time;
 * anything older lost its lease and must not touch the row.
 */
export function decideSettle(
  existing: AttemptRecord | null,
  attempt: number,
  result: AttemptResult,
): SettleDecision {
  if (existing === null) {
    return { kind: "ignore", reason: "attempt row no longer exists" };
  }
  if (existing.state === "settled") {
    return { kind: "ignore", reason: "already settled, outcome is immutable" };
  }
  if (attempt !== existing.attempt) {
    return {
      kind: "ignore",
      reason: `stale attempt ${attempt}, lease now held by attempt ${existing.attempt}`,
    };
  }
  if (result.kind === "succeeded") {
    return {
      kind: "commit",
      outcome: {
        status: "succeeded",
        providerChargeId: result.providerChargeId,
        amountCents: result.amountCents,
      },
    };
  }
  if (result.kind === "permanent-failure") {
    return {
      kind: "commit",
      outcome: { status: "failed", code: result.code, message: result.message },
    };
  }
  return { kind: "release", lastError: result.message };
}

// ---------------------------------------------------------------------------
// demo: an in-memory fake of the Convex mutation context, driving the real
// decision functions through the failures the machine exists to survive.
// ---------------------------------------------------------------------------

interface FakeWorld {
  readonly rows: Map<string, AttemptRecord & { readonly _id: string }>;
  readonly scheduled: Array<{
    requestId: string;
    attempt: number;
    providerKey: string;
  }>;
  nextId: number;
  now: number;
  /** Every call the payment provider actually received, by key. */
  readonly providerCalls: string[];
}

const makeWorld = (): FakeWorld => ({
  rows: new Map(),
  scheduled: [],
  nextId: 1,
  now: 1_000_000,
  providerCalls: [],
});

/** Stand-in for the reserving mutation: one transaction, decide then write. */
function reserve(world: FakeWorld, requestId: string): ReserveDecision {
  const existing = world.rows.get(requestId) ?? null;
  const decision = decideReserve(existing, world.now);
  if (decision.kind === "reserve") {
    const id = `att_${world.nextId++}`;
    const row = {
      _id: id,
      requestId,
      state: "reserved" as const,
      providerKey: providerKeyFor(id),
      attempt: 1,
      leaseUntil: world.now + defaultAttemptPolicy.leaseMs,
      outcome: null,
      lastError: null,
    };
    world.rows.set(requestId, row);
    // Same transaction as the insert: the job is committed with the row or not
    // at all. On Convex this line is ctx.scheduler.runAfter(0, ...).
    world.scheduled.push({
      requestId,
      attempt: 1,
      providerKey: row.providerKey,
    });
  } else if (decision.kind === "retake" && existing !== null) {
    const row = {
      ...existing,
      _id: (existing as { _id: string })._id,
      attempt: decision.attempt,
      leaseUntil: world.now + defaultAttemptPolicy.leaseMs,
    };
    world.rows.set(requestId, row);
    world.scheduled.push({
      requestId,
      attempt: decision.attempt,
      providerKey: row.providerKey, // unchanged, that is the whole point
    });
  }
  return decision;
}

/** Stand-in for the settling mutation. */
function settle(
  world: FakeWorld,
  requestId: string,
  attempt: number,
  result: AttemptResult,
): SettleDecision {
  const existing = world.rows.get(requestId) ?? null;
  const decision = decideSettle(existing, attempt, result);
  if (existing === null) return decision;
  if (decision.kind === "commit") {
    world.rows.set(requestId, {
      ...existing,
      state: "settled",
      outcome: decision.outcome,
    });
  } else if (decision.kind === "release") {
    world.rows.set(requestId, {
      ...existing,
      leaseUntil: world.now,
      lastError: decision.lastError,
    });
  }
  return decision;
}

/**
 * Stand-in for the cron sweeper. Its scan set is exactly the rows the
 * by_state_lease index range would return: reserved, lease expired.
 */
function sweep(world: FakeWorld) {
  const stalled = [...world.rows.values()].filter(
    (row) => row.state === "reserved" && row.leaseUntil < world.now,
  );
  let retaken = 0;
  let abandoned = 0;
  for (const row of stalled) {
    const decision = decideReserve(row, world.now);
    if (decision.kind === "retake") {
      world.rows.set(row.requestId, {
        ...row,
        attempt: decision.attempt,
        leaseUntil: world.now + defaultAttemptPolicy.leaseMs,
      });
      world.scheduled.push({
        requestId: row.requestId,
        attempt: decision.attempt,
        providerKey: row.providerKey,
      });
      retaken++;
    } else if (decision.kind === "abandon") {
      world.rows.set(row.requestId, {
        ...row,
        state: "settled",
        outcome: abandonedOutcome(decision.attempts),
      });
      abandoned++;
    }
  }
  return { scanned: stalled.length, retaken, abandoned };
}

/** A provider that dedupes on the idempotency key, the way Stripe does. */
function callProvider(
  world: FakeWorld,
  providerKey: string,
  amountCents: number,
) {
  world.providerCalls.push(providerKey);
  const first =
    world.providerCalls.indexOf(providerKey) === world.providerCalls.length - 1;
  return {
    providerChargeId: `ch_${providerKey}`,
    amountCents,
    deduped: !first,
  };
}

function demo() {
  const results: Array<[string, boolean, string]> = [];
  const check = (label: string, ok: boolean, detail: string) =>
    results.push([label, ok, detail]);

  // 1. Two concurrent reserves of one request: exactly one action is scheduled.
  {
    const w = makeWorld();
    const a = reserve(w, "order:8841:capture");
    const b = reserve(w, "order:8841:capture");
    check(
      "concurrent reserves schedule one action",
      a.kind === "reserve" &&
        b.kind === "in-flight" &&
        w.scheduled.length === 1,
      `first=${a.kind} second=${b.kind}, scheduled=${w.scheduled.length}`,
    );
  }

  // 2. The action dies after charging. The lease expires, the next attempt
  //    reuses the SAME provider key, so the provider dedupes the second call.
  {
    const w = makeWorld();
    reserve(w, "order:8841:capture");
    const first = w.scheduled[0];
    callProvider(w, first.providerKey, 4999); // charged, then the process dies

    w.now += defaultAttemptPolicy.leaseMs + 1;
    const retake = reserve(w, "order:8841:capture");
    const second = w.scheduled[1];
    const replay = callProvider(w, second.providerKey, 4999);

    check(
      "retry reuses the provider key so the provider dedupes",
      retake.kind === "retake" &&
        second.providerKey === first.providerKey &&
        replay.deduped &&
        new Set(w.providerCalls).size === 1,
      `key stable: ${second.providerKey === first.providerKey}, distinct keys sent: ${new Set(w.providerCalls).size}, second call deduped: ${replay.deduped}`,
    );

    settle(w, "order:8841:capture", second.attempt, {
      kind: "succeeded",
      providerChargeId: replay.providerChargeId,
      amountCents: 4999,
    });

    // 3. The attempt-1 zombie finally wakes up and tries to write.
    const zombie = settle(w, "order:8841:capture", first.attempt, {
      kind: "permanent-failure",
      code: "card_declined",
      message: "zombie writer from a superseded attempt",
    });
    const row = w.rows.get("order:8841:capture");
    check(
      "superseded attempt cannot overwrite the outcome",
      zombie.kind === "ignore" && row?.outcome?.status === "succeeded",
      `${zombie.kind}, outcome stayed "${row?.outcome?.status}"`,
    );

    // 4. A late duplicate replays instead of charging again.
    const late = reserve(w, "order:8841:capture");
    check(
      "late duplicate replays the stored outcome",
      late.kind === "replay" &&
        late.outcome.status === "succeeded" &&
        w.providerCalls.length === 2 &&
        new Set(w.providerCalls).size === 1,
      `${late.kind}, provider saw ${new Set(w.providerCalls).size} distinct key across ${w.providerCalls.length} calls`,
    );
  }

  // 5. A declined card is terminal, not a retry loop.
  {
    const w = makeWorld();
    reserve(w, "order:9002:capture");
    settle(w, "order:9002:capture", 1, {
      kind: "permanent-failure",
      code: "card_declined",
      message: "Your card was declined.",
    });
    const again = reserve(w, "order:9002:capture");
    check(
      "permanent failure is terminal, never rescheduled",
      again.kind === "replay" &&
        again.outcome.status === "failed" &&
        w.scheduled.length === 1,
      `${again.kind} with status "${again.kind === "replay" ? again.outcome.status : "?"}", scheduled=${w.scheduled.length}`,
    );
  }

  // 6. A transient failure releases the lease immediately and is bounded.
  //    Then the sweeper settles the exhausted row so it leaves its own scan set.
  {
    const w = makeWorld();
    reserve(w, "order:9110:capture");
    for (
      let attempt = 1;
      attempt <= defaultAttemptPolicy.maxAttempts;
      attempt++
    ) {
      settle(w, "order:9110:capture", attempt, {
        kind: "transient-failure",
        message: "provider 503",
      });
      reserve(w, "order:9110:capture");
    }
    const final = reserve(w, "order:9110:capture");
    check(
      "transient failures retry, then abandon within budget",
      final.kind === "abandon" &&
        w.scheduled.length === defaultAttemptPolicy.maxAttempts,
      `${final.kind} after ${w.scheduled.length} scheduled attempts (budget ${defaultAttemptPolicy.maxAttempts})`,
    );

    // The sweeper's index range is `.lt("leaseUntil", now)`, and settleCapture
    // released the lease by writing leaseUntil = Date.now(). A row released at
    // exactly `now` is outside a strict `lt` range, so the sweeper only sees it
    // on its next tick. That is correct, not a bug: the row is available to any
    // caller immediately (decideReserve compares `now < leaseUntil`), and only
    // the background scan waits a millisecond.
    w.now += 1;
    const first = sweep(w);
    const second = sweep(w);
    check(
      "sweeper retires an exhausted row instead of rescanning it forever",
      first.scanned === 1 &&
        first.abandoned === 1 &&
        first.retaken === 0 &&
        second.scanned === 0,
      `sweep 1 scanned ${first.scanned} abandoned ${first.abandoned}, sweep 2 scanned ${second.scanned}`,
    );
  }

  // 7. The sweeper is the only thing that rescues a scheduled action that never
  //    ran at all. Convex does not retry scheduled actions, so a lost process
  //    leaves a reserved row with an expired lease and nothing queued.
  {
    const w = makeWorld();
    reserve(w, "order:9310:capture");
    w.scheduled.length = 0; // the action was queued, then never executed
    w.now += defaultAttemptPolicy.leaseMs + 1;
    const swept = sweep(w);
    check(
      "sweeper re-queues an action that was scheduled but never ran",
      swept.retaken === 1 &&
        w.scheduled.length === 1 &&
        w.scheduled[0].providerKey ===
          w.rows.get("order:9310:capture")?.providerKey,
      `retaken ${swept.retaken}, requeued ${w.scheduled.length} with the original provider key`,
    );
  }

  for (const [label, ok, detail] of results) {
    console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`);
  }
  const failed = results.filter(([, ok]) => !ok).length;
  console.log(
    failed === 0
      ? "attempt-machine.ts: all properties verified"
      : `attempt-machine.ts: ${failed} property check(s) failed`,
  );
  if (failed > 0) process.exit(1);
}

// Gated, because this file is deployed. Convex bundles every module under
// convex/ and evaluates it inside the isolate, so an ungated demo() would run
// on function load and call a `process` that does not exist there.
// `import.meta.main` is true only under `bun run attempt-machine.ts`.
if (import.meta.main) demo();

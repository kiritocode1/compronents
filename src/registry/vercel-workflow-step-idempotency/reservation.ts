/**
 * reservation.ts
 *
 * Exactly-once settlement for a Vercel Workflow step whose side effect moves
 * money, with the one case everybody gets wrong handled explicitly.
 *
 * Failure modes solved:
 *
 *   1. Double charge from the journal gap. Workflow SDK journals a step's
 *      RESULT, not its side effect. The step lifecycle in
 *      https://workflow.dev/docs/how-it-works/event-sourcing is
 *      step_created -> step_started -> step_completed, and the provider call
 *      lands somewhere between started and completed. A crash in that window
 *      leaves the step in `running` with no recorded result, so the runtime
 *      retries it and the card is charged twice. Durable execution guarantees
 *      the result is recorded once; it cannot guarantee the effect happened
 *      once. That is your job, and this file is it.
 *
 *   2. The undecidable retry. A retry that finds a reservation with no receipt
 *      cannot tell "the previous attempt died before it charged" from "the
 *      previous attempt charged and died before it wrote the receipt". Naive
 *      implementations pick one and are wrong half the time: re-run and you
 *      double charge, refuse and the invoice never settles. The only correct
 *      move is to ask the provider what it holds under this key before
 *      deciding, which is what `recover` is for.
 *
 *   3. The concurrent second attempt. At-least-once delivery means a step can
 *      be re-driven while the first attempt is still alive (a stalled network
 *      call, not a dead process). `recover` returns null because the first
 *      attempt has not landed yet, so a recovery-only design charges twice.
 *      The reservation carries a lease deadline: inside the lease a loser
 *      refuses and asks to be retried later, outside it the previous attempt
 *      is presumed dead and recovery is meaningful.
 *
 * Pure logic, no SDK imports, no network. Run it: `bun run reservation.ts`.
 * The wiring into "use workflow" and "use step" lives in charge-step.ts.
 */

/** What the reservation store holds under one idempotency key. */
export type Settlement =
  | {
      readonly status: "in-flight";
      readonly key: string;
      /** Wall clock at which another attempt may presume this one dead. */
      readonly leaseExpiresAt: number;
    }
  | {
      readonly status: "settled";
      readonly key: string;
      readonly receipt: string;
    };

/**
 * The store needs exactly one guarantee: `claim` is atomic and single-winner.
 * A Postgres `INSERT ... ON CONFLICT DO NOTHING`, a DynamoDB conditional put,
 * a Redis `SET NX`, or a unique index on the key column all qualify. A
 * read-then-write in application code does not, and the gap between the read
 * and the write is exactly wide enough for the double charge.
 */
export interface ReservationStore {
  /** Atomic create. Resolves false when the key already exists. */
  readonly claim: (record: Settlement) => Promise<boolean>;
  readonly read: (key: string) => Promise<Settlement | null>;
  /** Unconditional overwrite of a key this attempt owns. */
  readonly commit: (record: Settlement) => Promise<void>;
}

/**
 * Thrown when another attempt holds an unexpired lease on this key. The caller
 * must retry later, never perform. In a step, rethrow this as the SDK's
 * RetryableError with a retryAfter past the lease deadline.
 */
export class SettlementInFlight extends Error {
  readonly key: string;
  readonly retryAfterMs: number;
  constructor(key: string, retryAfterMs: number) {
    super(
      `settlement ${key} is held by another attempt for ${retryAfterMs}ms more`,
    );
    this.name = "SettlementInFlight";
    this.key = key;
    this.retryAfterMs = retryAfterMs;
  }
}

export interface SettleOptions {
  /**
   * The idempotency key. Inside a step this must be derived from
   * getStepMetadata().stepId, which is the only value that is both stable
   * across retries of one invocation and distinct between two invocations of
   * the same step in a loop. See charge-step.ts for why the two obvious
   * alternatives (the order id, a fresh uuid) are each wrong.
   */
  readonly key: string;
  /** The non-idempotent effect. Runs at most once per key. */
  readonly perform: () => Promise<string>;
  /**
   * Ask the provider what it already holds under `key`, or null if nothing.
   * Stripe: search charges by metadata. Your own service: select by the key
   * column. Without this, a crash inside `perform` is unrecoverable and the
   * key is poisoned forever.
   */
  readonly recover: (key: string) => Promise<string | null>;
  /** How long one attempt may hold the key before another presumes it dead. */
  readonly leaseMs: number;
  readonly now?: () => number;
}

export interface SettleResult {
  readonly receipt: string;
  /** false when the receipt came from the store or from provider recovery. */
  readonly performed: boolean;
}

/**
 * Run `perform` at most once per key, across crashes and concurrent attempts.
 *
 * The order is load-bearing: claim the key BEFORE the effect, so a crash
 * inside the effect leaves evidence that an attempt was in flight. Claiming
 * after would leave a charge with nothing pointing at it.
 */
export async function settleOnce(
  store: ReservationStore,
  options: SettleOptions,
): Promise<SettleResult> {
  const now = options.now ?? Date.now;
  const { key } = options;

  const existing = await store.read(key);
  if (existing?.status === "settled") {
    return { receipt: existing.receipt, performed: false };
  }

  if (existing === null) {
    const won = await store.claim({
      status: "in-flight",
      key,
      leaseExpiresAt: now() + options.leaseMs,
    });
    if (won) {
      const receipt = await options.perform();
      await store.commit({ status: "settled", key, receipt });
      return { receipt, performed: true };
    }
    // Lost the create race. Fall through and treat it as a found reservation.
  }

  const held = await store.read(key);
  if (held?.status === "settled") {
    return { receipt: held.receipt, performed: false };
  }
  if (held === null) {
    // The owner released the key without settling. Start over from a clean
    // read rather than performing on a reservation we never held.
    return settleOnce(store, options);
  }

  const remaining = held.leaseExpiresAt - now();
  if (remaining > 0) {
    // Another attempt may still be alive inside the provider call. Asking the
    // provider now would return null and we would charge a second time.
    throw new SettlementInFlight(key, remaining);
  }

  // Lease expired, so the previous attempt is presumed dead. Whether it got as
  // far as the provider is undecidable from here, so ask the provider.
  const recovered = await options.recover(key);
  if (recovered !== null) {
    await store.commit({ status: "settled", key, receipt: recovered });
    return { receipt: recovered, performed: false };
  }

  // The provider holds nothing under this key, so the effect never landed.
  await store.commit({
    status: "in-flight",
    key,
    leaseExpiresAt: now() + options.leaseMs,
  });
  const receipt = await options.perform();
  await store.commit({ status: "settled", key, receipt });
  return { receipt, performed: true };
}

/** In-memory store with a single-winner `claim`. Swap for your table. */
export function createMemoryReservationStore(): ReservationStore & {
  readonly size: () => number;
} {
  const rows = new Map<string, Settlement>();
  return {
    claim: async (record) => {
      if (rows.has(record.key)) return false;
      rows.set(record.key, record);
      return true;
    },
    read: async (key) => rows.get(key) ?? null,
    commit: async (record) => {
      rows.set(record.key, record);
    },
    size: () => rows.size,
  };
}

// ---------------------------------------------------------------------------
// demo: bun run reservation.ts
// ---------------------------------------------------------------------------

/** Stands in for Stripe. Records every charge it accepts, keyed for lookup. */
function createCardProcessor() {
  const ledger: { key: string; cents: number; receipt: string }[] = [];
  let seq = 0;
  return {
    ledger,
    /** Non-idempotent by construction: every call is a new charge. */
    charge: async (key: string, cents: number) => {
      seq += 1;
      const receipt = `ch_${seq}`;
      ledger.push({ key, cents, receipt });
      return receipt;
    },
    lookupByKey: async (key: string) =>
      ledger.find((row) => row.key === key)?.receipt ?? null,
    total: () => ledger.reduce((sum, row) => sum + row.cents, 0),
  };
}

class CrashInjected extends Error {}

let failures = 0;

function check(name: string, ok: boolean, detail: string): void {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
}

async function demo(): Promise<void> {
  const INVOICE = 24_000; // BLANK Studio annual plan, $240.00
  const LEASE = 30_000;

  // 1. The baseline. No reservation, the process dies after the provider
  //    accepted the charge, the runtime retries the step. Money moves twice.
  {
    const card = createCardProcessor();
    const stepId = "step_01JQD7NAIVE";
    const attempt = async () => {
      await card.charge(stepId, INVOICE);
      throw new CrashInjected("died before step_completed was written");
    };
    await attempt().catch(() => {});
    await card.charge(stepId, INVOICE); // the retry, doing what it was told
    check(
      "unguarded step double charges across the journal gap",
      card.ledger.length === 2 && card.total() === 48_000,
      `ledger has ${card.ledger.length} charges totalling $${(card.total() / 100).toFixed(2)}`,
    );
  }

  // 2. Same crash, now reserved. The retry arrives inside the lease, so it
  //    refuses to guess and asks to be retried later. No second charge.
  {
    const card = createCardProcessor();
    const store = createMemoryReservationStore();
    const key = "charge:step_01JQD7LEASE";
    let clock = 1_000_000;
    const opts = {
      key,
      leaseMs: LEASE,
      now: () => clock,
      recover: card.lookupByKey,
      perform: async () => {
        const receipt = await card.charge(key, INVOICE);
        throw new CrashInjected(`charged ${receipt}, then died`);
      },
    };
    await settleOnce(store, opts).catch(() => {});
    clock += 5_000; // retried well inside the 30s lease
    const refused = await settleOnce(store, opts).catch((e: unknown) => e);
    check(
      "retry inside the lease refuses rather than guessing",
      refused instanceof SettlementInFlight && card.ledger.length === 1,
      `threw ${(refused as Error).name}, ledger still has ${card.ledger.length} charge`,
    );
  }

  // 3. The undecidable case, resolved. The lease has expired, so the previous
  //    attempt is dead. `recover` finds the charge it managed to land and the
  //    settlement adopts that receipt instead of creating a second one.
  {
    const card = createCardProcessor();
    const store = createMemoryReservationStore();
    const key = "charge:step_01JQD7ADOPT";
    let clock = 2_000_000;
    const base = {
      key,
      leaseMs: LEASE,
      now: () => clock,
      recover: card.lookupByKey,
    };
    await settleOnce(store, {
      ...base,
      perform: async () => {
        const receipt = await card.charge(key, INVOICE);
        throw new CrashInjected(`charged ${receipt}, then died`);
      },
    }).catch(() => {});
    clock += LEASE + 1;
    const result = await settleOnce(store, {
      ...base,
      perform: async () => card.charge(key, INVOICE),
    });
    check(
      "expired lease adopts the orphaned charge instead of repeating it",
      card.ledger.length === 1 &&
        result.receipt === "ch_1" &&
        !result.performed,
      `recovered receipt ${result.receipt}, performed=${result.performed}, ledger has ${card.ledger.length} charge`,
    );
  }

  // 4. The other side of undecidable: the attempt died BEFORE reaching the
  //    provider. `recover` finds nothing, so performing is the correct move
  //    and the invoice actually gets paid.
  {
    const card = createCardProcessor();
    const store = createMemoryReservationStore();
    const key = "charge:step_01JQD7EARLY";
    let clock = 3_000_000;
    const base = {
      key,
      leaseMs: LEASE,
      now: () => clock,
      recover: card.lookupByKey,
    };
    await settleOnce(store, {
      ...base,
      perform: async () => {
        throw new CrashInjected("died before the provider was reached");
      },
    }).catch(() => {});
    clock += LEASE + 1;
    const result = await settleOnce(store, {
      ...base,
      perform: async () => card.charge(key, INVOICE),
    });
    check(
      "expired lease with nothing at the provider performs exactly once",
      card.ledger.length === 1 && result.performed,
      `charged ${result.receipt}, performed=${result.performed}, ledger has ${card.ledger.length} charge`,
    );
  }

  // 5. The ordinary replay. Workflow replays the step after it settled; the
  //    receipt comes back from the store and no call reaches the provider.
  {
    const card = createCardProcessor();
    const store = createMemoryReservationStore();
    const key = "charge:step_01JQD7REPLAY";
    const opts = {
      key,
      leaseMs: LEASE,
      recover: card.lookupByKey,
      perform: async () => card.charge(key, INVOICE),
    };
    const first = await settleOnce(store, opts);
    const second = await settleOnce(store, opts);
    check(
      "settled key replays its receipt without touching the provider",
      first.receipt === second.receipt &&
        first.performed &&
        !second.performed &&
        card.ledger.length === 1,
      `both attempts saw ${second.receipt}, ledger has ${card.ledger.length} charge`,
    );
  }

  // 6. The granularity that makes stepId the right key. A dunning loop charges
  //    the same invoice three times on purpose. Three step invocations means
  //    three stepIds, so all three land. Keying on the invoice id instead
  //    would collapse attempts 2 and 3 into replays of attempt 1 and the
  //    invoice would sit unpaid while the logs claimed success.
  {
    const card = createCardProcessor();
    const store = createMemoryReservationStore();
    const stepIds = ["step_01JQD7DUN1", "step_01JQD7DUN2", "step_01JQD7DUN3"];
    for (const stepId of stepIds) {
      const key = `charge:${stepId}`;
      await settleOnce(store, {
        key,
        leaseMs: LEASE,
        recover: card.lookupByKey,
        perform: async () => card.charge(key, INVOICE),
      });
    }
    const receipts = new Set(card.ledger.map((row) => row.receipt));
    check(
      "distinct stepIds in a retry loop each settle independently",
      card.ledger.length === 3 && receipts.size === 3,
      `three dunning attempts produced ${receipts.size} distinct receipts`,
    );
  }

  // 7. Two attempts racing on a cold key. Only one may claim it; the loser
  //    must not perform, because the winner is still inside the provider call.
  {
    const card = createCardProcessor();
    const store = createMemoryReservationStore();
    const key = "charge:step_01JQD7RACE";
    const slowCharge = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return card.charge(key, INVOICE);
    };
    const opts = {
      key,
      leaseMs: LEASE,
      recover: card.lookupByKey,
      perform: slowCharge,
    };
    const [a, b] = await Promise.all([
      settleOnce(store, opts).catch((e: unknown) => e),
      settleOnce(store, opts).catch((e: unknown) => e),
    ]);
    const outcomes = [a, b];
    const settled = outcomes.filter(
      (o): o is SettleResult => !(o instanceof Error),
    );
    const refusedCount = outcomes.filter(
      (o) => o instanceof SettlementInFlight,
    ).length;
    check(
      "concurrent attempts on a cold key charge once, loser refuses",
      card.ledger.length === 1 && settled.length === 1 && refusedCount === 1,
      `${settled.length} settled, ${refusedCount} refused, ledger has ${card.ledger.length} charge`,
    );
  }

  console.log(
    failures === 0
      ? "\nreservation.ts: all properties verified"
      : `\nreservation.ts: ${failures} FAILED`,
  );
  if (failures > 0) process.exit(1);
}

if (import.meta.main) {
  demo().catch((error) => {
    console.error("demo crashed", error);
    process.exit(1);
  });
}

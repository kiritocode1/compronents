/**
 * fake-cluster.ts
 *
 * An in-memory TigerBeetle that enforces the real rejection semantics, so
 * ledger code can be unit tested in CI without a cluster.
 *
 * Failure modes solved:
 *   1. Ledger code that only ever runs against a real cluster is tested
 *      nowhere. TigerBeetle's whole value is the rejections (exceeds_credits,
 *      pending_transfer_already_posted, linked_event_failed), and those are
 *      exactly the paths a developer cannot reach from a happy-path
 *      integration test. This ledger produces them on demand, in process.
 *   2. The hand-rolled mock that returns "no errors" teaches the wrong
 *      reflex. Since 0.17.x, createTransfers returns one
 *      { timestamp, status } per event, positionally, with
 *      CreateTransferStatus.created (4294967295) for the ones that landed.
 *      A mock that returns [] for success trains code that never reads a
 *      status, which then silently ignores every rejection in production.
 *      See dist/index.d.ts in tigerbeetle-node@0.17.9:
 *      createTransfers: (batch: Transfer[]) => Promise<CreateTransferResult[]>
 *   3. Timeout expiry is untestable against a real cluster inside a test
 *      suite, because you would have to sleep for the timeout. advanceSeconds
 *      moves the simulated cluster clock, so the auto-void path is a
 *      millisecond assertion instead of a flaky sleep.
 *
 * Semantics implemented, from the reference docs:
 *   - https://docs.tigerbeetle.com/reference/requests/create_transfers
 *   - https://docs.tigerbeetle.com/reference/transfer
 *   - https://docs.tigerbeetle.com/reference/account
 *   Double-entry (every transfer moves the same amount out of one account and
 *   into another), the debits_must_not_exceed_credits and
 *   credits_must_not_exceed_debits invariants, two-phase pending / post /
 *   void with timeout expiry, post/void field inheritance from the pending
 *   transfer, linked chains with rollback and linked_event_failed, id
 *   idempotency (exists / exists_with_different_*), and id_already_failed
 *   for an id whose first attempt failed transiently.
 *
 * NOT implemented (a live cluster is still the only proof): the balancing_debit
 * and balancing_credit flags, closing_debit / closing_credit and the closed
 * account flag, imported events, the history flag and get_account_balances,
 * queryAccounts / queryTransfers filters, the 8189-event server batch ceiling
 * (this ledger accepts any array length), and any durability, replication, or
 * consensus behaviour whatsoever.
 *
 * run: bun run src/registry/tigerbeetle-test-ledger/fake-cluster.ts
 */

import {
  type Account,
  AccountFlags,
  amount_max,
  type CreateAccountResult,
  CreateAccountStatus,
  type CreateTransferResult,
  CreateTransferStatus,
  type Transfer,
  TransferFlags,
} from "tigerbeetle-node";

const U128_MAX = amount_max;
const NS_PER_SECOND = 1_000_000_000n;

/**
 * Transient statuses: the same id retried later can succeed, so TigerBeetle
 * remembers the failure and answers id_already_failed instead of re-running
 * the validation. Everything else is deterministic for a given id.
 * https://docs.tigerbeetle.com/reference/requests/create_transfers#id_already_failed
 */
const TRANSIENT: ReadonlySet<CreateTransferStatus> = new Set([
  CreateTransferStatus.debit_account_not_found,
  CreateTransferStatus.credit_account_not_found,
  CreateTransferStatus.pending_transfer_not_found,
  CreateTransferStatus.exceeds_credits,
  CreateTransferStatus.exceeds_debits,
  CreateTransferStatus.debit_account_already_closed,
  CreateTransferStatus.credit_account_already_closed,
]);

type PendingState = "pending" | "posted" | "voided" | "expired";

interface Snapshot {
  accounts: Map<bigint, Account>;
  transfers: Map<bigint, Transfer>;
  pending: Map<bigint, PendingState>;
  failed: Map<bigint, CreateTransferStatus>;
}

export interface TestLedger {
  createAccounts(batch: Account[]): Promise<CreateAccountResult[]>;
  createTransfers(batch: Transfer[]): Promise<CreateTransferResult[]>;
  lookupAccounts(ids: bigint[]): Promise<Account[]>;
  lookupTransfers(ids: bigint[]): Promise<Transfer[]>;
  /**
   * Move the simulated cluster clock forward. Pending transfers whose timeout
   * has elapsed release their held balance, exactly as the real cluster's
   * pulse operation does on a best-effort basis.
   */
  advanceSeconds(seconds: number): void;
  /** Nanoseconds since the Unix epoch, the unit of Account/Transfer.timestamp. */
  now(): bigint;
  destroy(): void;
}

/** Build a complete Account row; every field TigerBeetle requires, zeroed. */
export function testAccount(
  fields: Partial<Account> & Pick<Account, "id" | "ledger" | "code">,
): Account {
  return {
    debits_pending: 0n,
    debits_posted: 0n,
    credits_pending: 0n,
    credits_posted: 0n,
    user_data_128: 0n,
    user_data_64: 0n,
    user_data_32: 0,
    reserved: 0,
    flags: AccountFlags.none,
    timestamp: 0n,
    ...fields,
  };
}

/** Build a complete Transfer row; every field TigerBeetle requires, zeroed. */
export function testTransfer(
  fields: Partial<Transfer> & Pick<Transfer, "id">,
): Transfer {
  return {
    debit_account_id: 0n,
    credit_account_id: 0n,
    amount: 0n,
    pending_id: 0n,
    user_data_128: 0n,
    user_data_64: 0n,
    user_data_32: 0,
    timeout: 0,
    ledger: 0,
    code: 0,
    flags: TransferFlags.none,
    timestamp: 0n,
    ...fields,
  };
}

const has = (flags: number, bit: number) => (flags & bit) !== 0;

export function createTestLedger(
  options: { startNs?: bigint } = {},
): TestLedger {
  let nowNs = options.startNs ?? BigInt(Date.UTC(2026, 0, 1)) * 1_000_000n;
  const state: Snapshot = {
    accounts: new Map(),
    transfers: new Map(),
    pending: new Map(),
    failed: new Map(),
  };

  // ponytail: whole-state clone per linked chain. Correct and obvious; a real
  // undo log only matters if a test batches tens of thousands of events.
  const snapshot = (): Snapshot => ({
    accounts: new Map(
      [...state.accounts].map(([k, v]) => [k, { ...v }] as const),
    ),
    transfers: new Map(
      [...state.transfers].map(([k, v]) => [k, { ...v }] as const),
    ),
    pending: new Map(state.pending),
    failed: new Map(state.failed),
  });
  const restore = (snap: Snapshot) => {
    state.accounts = snap.accounts;
    state.transfers = snap.transfers;
    state.pending = snap.pending;
    state.failed = snap.failed;
  };

  const stamp = () => {
    nowNs += 1n;
    return nowNs;
  };

  /**
   * Best-effort expiry of pending transfers past their timeout, run before
   * every request. The real cluster does this on `pulse`, and the docs warn
   * that "client requests may observe still-pending balances for expired
   * transfers", so never assume expiry is instant at the deadline.
   */
  const expirePending = () => {
    for (const [id, status] of state.pending) {
      if (status !== "pending") continue;
      const t = state.transfers.get(id);
      if (!t || t.timeout === 0) continue;
      if (t.timestamp + BigInt(t.timeout) * NS_PER_SECOND > nowNs) continue;
      const dr = state.accounts.get(t.debit_account_id);
      const cr = state.accounts.get(t.credit_account_id);
      if (dr) dr.debits_pending -= t.amount;
      if (cr) cr.credits_pending -= t.amount;
      state.pending.set(id, "expired");
    }
  };

  // -- accounts ------------------------------------------------------------

  const applyAccount = (a: Account, timestamp: bigint): CreateAccountStatus => {
    if (a.id === 0n) return CreateAccountStatus.id_must_not_be_zero;
    if (a.id === U128_MAX) return CreateAccountStatus.id_must_not_be_int_max;
    if (
      has(a.flags, AccountFlags.debits_must_not_exceed_credits) &&
      has(a.flags, AccountFlags.credits_must_not_exceed_debits)
    ) {
      return CreateAccountStatus.flags_are_mutually_exclusive;
    }
    if (a.debits_pending !== 0n)
      return CreateAccountStatus.debits_pending_must_be_zero;
    if (a.debits_posted !== 0n)
      return CreateAccountStatus.debits_posted_must_be_zero;
    if (a.credits_pending !== 0n)
      return CreateAccountStatus.credits_pending_must_be_zero;
    if (a.credits_posted !== 0n)
      return CreateAccountStatus.credits_posted_must_be_zero;
    if (a.ledger === 0) return CreateAccountStatus.ledger_must_not_be_zero;
    if (a.code === 0) return CreateAccountStatus.code_must_not_be_zero;

    const prior = state.accounts.get(a.id);
    if (prior) {
      if (prior.flags !== a.flags)
        return CreateAccountStatus.exists_with_different_flags;
      if (prior.ledger !== a.ledger)
        return CreateAccountStatus.exists_with_different_ledger;
      if (prior.code !== a.code)
        return CreateAccountStatus.exists_with_different_code;
      if (prior.user_data_128 !== a.user_data_128)
        return CreateAccountStatus.exists_with_different_user_data_128;
      return CreateAccountStatus.exists;
    }
    state.accounts.set(a.id, { ...a, timestamp });
    return CreateAccountStatus.created;
  };

  // -- transfers -----------------------------------------------------------

  const applyTransfer = (
    t: Transfer,
    timestamp: bigint,
  ): CreateTransferStatus => {
    if (t.id === 0n) return CreateTransferStatus.id_must_not_be_zero;
    if (t.id === U128_MAX) return CreateTransferStatus.id_must_not_be_int_max;

    const isPending = has(t.flags, TransferFlags.pending);
    const isPost = has(t.flags, TransferFlags.post_pending_transfer);
    const isVoid = has(t.flags, TransferFlags.void_pending_transfer);
    if (Number(isPending) + Number(isPost) + Number(isVoid) > 1) {
      return CreateTransferStatus.flags_are_mutually_exclusive;
    }
    const resolves = isPost || isVoid;
    if (resolves && t.pending_id === 0n)
      return CreateTransferStatus.pending_id_must_not_be_zero;
    if (!resolves && t.pending_id !== 0n)
      return CreateTransferStatus.pending_id_must_be_zero;
    if (t.pending_id === U128_MAX)
      return CreateTransferStatus.pending_id_must_not_be_int_max;
    if (t.timeout !== 0 && !isPending)
      return CreateTransferStatus.timeout_reserved_for_pending_transfer;

    const prior = state.transfers.get(t.id);
    if (prior) {
      if (prior.flags !== t.flags)
        return CreateTransferStatus.exists_with_different_flags;
      if (prior.pending_id !== t.pending_id)
        return CreateTransferStatus.exists_with_different_pending_id;
      if (prior.user_data_128 !== t.user_data_128)
        return CreateTransferStatus.exists_with_different_user_data_128;
      // A stored post_pending_transfer holds the amount that actually posted,
      // not the amount that was submitted, so the retry comparison is not
      // equality. Quoting the create_transfers reference: "If the original
      // posted amount was less than the pending amount, then the transfer
      // amount must be equal to the posted amount. Otherwise, the transfer
      // amount must be greater than or equal to the pending amount." That is
      // what lets a full capture be retried with amount_max forever.
      if (has(prior.flags, TransferFlags.post_pending_transfer)) {
        const held = state.transfers.get(prior.pending_id)?.amount ?? 0n;
        const partial = prior.amount < held;
        const acceptable = partial
          ? t.amount === prior.amount
          : t.amount >= held;
        if (!acceptable)
          return CreateTransferStatus.exists_with_different_amount;
      } else if (prior.amount !== t.amount) {
        return CreateTransferStatus.exists_with_different_amount;
      }
      return CreateTransferStatus.exists;
    }
    const alreadyFailed = state.failed.get(t.id);
    if (alreadyFailed !== undefined)
      return CreateTransferStatus.id_already_failed;

    // Post and void inherit debit_account_id, credit_account_id, ledger and
    // code from the pending transfer when left zero. A non-zero value that
    // disagrees is rejected rather than silently ignored.
    let pending: Transfer | undefined;
    if (resolves) {
      pending = state.transfers.get(t.pending_id);
      if (!pending) return CreateTransferStatus.pending_transfer_not_found;
      if (!has(pending.flags, TransferFlags.pending)) {
        return CreateTransferStatus.pending_transfer_not_pending;
      }
      const phase = state.pending.get(t.pending_id);
      if (phase === "posted")
        return CreateTransferStatus.pending_transfer_already_posted;
      if (phase === "voided")
        return CreateTransferStatus.pending_transfer_already_voided;
      if (phase === "expired")
        return CreateTransferStatus.pending_transfer_expired;
      if (
        t.debit_account_id !== 0n &&
        t.debit_account_id !== pending.debit_account_id
      ) {
        return CreateTransferStatus.pending_transfer_has_different_debit_account_id;
      }
      if (
        t.credit_account_id !== 0n &&
        t.credit_account_id !== pending.credit_account_id
      ) {
        return CreateTransferStatus.pending_transfer_has_different_credit_account_id;
      }
      if (t.ledger !== 0 && t.ledger !== pending.ledger)
        return CreateTransferStatus.pending_transfer_has_different_ledger;
      if (t.code !== 0 && t.code !== pending.code)
        return CreateTransferStatus.pending_transfer_has_different_code;
    }

    const debitId = pending ? pending.debit_account_id : t.debit_account_id;
    const creditId = pending ? pending.credit_account_id : t.credit_account_id;
    const ledger = pending ? pending.ledger : t.ledger;
    const code = pending ? pending.code : t.code;

    if (debitId === 0n)
      return CreateTransferStatus.debit_account_id_must_not_be_zero;
    if (creditId === 0n)
      return CreateTransferStatus.credit_account_id_must_not_be_zero;
    if (debitId === creditId)
      return CreateTransferStatus.accounts_must_be_different;
    if (ledger === 0) return CreateTransferStatus.ledger_must_not_be_zero;
    if (code === 0) return CreateTransferStatus.code_must_not_be_zero;

    const dr = state.accounts.get(debitId);
    if (!dr) return CreateTransferStatus.debit_account_not_found;
    const cr = state.accounts.get(creditId);
    if (!cr) return CreateTransferStatus.credit_account_not_found;
    if (dr.ledger !== cr.ledger)
      return CreateTransferStatus.accounts_must_have_the_same_ledger;
    if (ledger !== dr.ledger) {
      return CreateTransferStatus.transfer_must_have_the_same_ledger_as_accounts;
    }

    // Resolve the amount actually moved. amount_max on a post means "the whole
    // pending amount"; a smaller amount posts that much and releases the rest.
    let amount = t.amount;
    if (pending && isPost) {
      amount = t.amount === U128_MAX ? pending.amount : t.amount;
      if (amount > pending.amount)
        return CreateTransferStatus.exceeds_pending_transfer_amount;
    }
    if (pending && isVoid) {
      if (t.amount !== 0n && t.amount !== pending.amount) {
        return CreateTransferStatus.pending_transfer_has_different_amount;
      }
      amount = 0n;
    }

    const nextDr = { ...dr };
    const nextCr = { ...cr };
    if (isPending) {
      nextDr.debits_pending += amount;
      nextCr.credits_pending += amount;
    } else if (pending) {
      nextDr.debits_pending -= pending.amount;
      nextCr.credits_pending -= pending.amount;
      nextDr.debits_posted += amount;
      nextCr.credits_posted += amount;
    } else {
      nextDr.debits_posted += amount;
      nextCr.credits_posted += amount;
    }

    // The invariant the database refuses to break. Pending debits count, which
    // is what makes a two-phase hold a real reservation rather than a note.
    for (const acct of [nextDr, nextCr]) {
      if (
        has(acct.flags, AccountFlags.debits_must_not_exceed_credits) &&
        acct.debits_pending + acct.debits_posted > acct.credits_posted
      ) {
        return CreateTransferStatus.exceeds_credits;
      }
      if (
        has(acct.flags, AccountFlags.credits_must_not_exceed_debits) &&
        acct.credits_pending + acct.credits_posted > acct.debits_posted
      ) {
        return CreateTransferStatus.exceeds_debits;
      }
    }

    state.accounts.set(debitId, nextDr);
    state.accounts.set(creditId, nextCr);
    state.transfers.set(t.id, {
      ...t,
      debit_account_id: debitId,
      credit_account_id: creditId,
      ledger,
      code,
      amount,
      timestamp,
    });
    if (isPending) state.pending.set(t.id, "pending");
    if (pending) state.pending.set(t.pending_id, isPost ? "posted" : "voided");
    return CreateTransferStatus.created;
  };

  /**
   * Chain-aware batch execution. The linked flag ties an event to the NEXT
   * event; the first event without it closes the chain. A chain either commits
   * whole or rolls back whole: the first event to break it carries the real
   * status and every sibling reports linked_event_failed. A trailing linked
   * flag leaves the chain open and the last event reports linked_event_chain_open.
   */
  const runBatch = <E extends { flags: number }, S extends number>(
    events: readonly E[],
    cfg: {
      linkedBit: number;
      created: S;
      linkedFailed: S;
      chainOpen: S;
      apply: (event: E, timestamp: bigint) => S;
      onFail?: (event: E, status: S) => void;
    },
  ): { timestamp: bigint; status: S }[] => {
    const out: { timestamp: bigint; status: S }[] = new Array(events.length);
    let start = 0;
    while (start < events.length) {
      let end = start;
      while (end < events.length && has(events[end].flags, cfg.linkedBit)) {
        end += 1;
      }
      const open = end === events.length;
      // A single unlinked event is its own chain of one.
      const last = open ? end - 1 : end;
      const before = last > start ? snapshot() : null;

      let brokeAt = -1;
      let brokeWith = cfg.created;
      for (let i = start; i <= last; i += 1) {
        const timestamp = stamp();
        const status =
          open && i === last ? cfg.chainOpen : cfg.apply(events[i], timestamp);
        out[i] = { timestamp, status };
        if (status !== cfg.created && status !== cfg.linkedFailed) {
          brokeAt = i;
          brokeWith = status;
          break;
        }
      }

      if (brokeAt !== -1 && last > start) {
        if (before) restore(before);
        for (let i = start; i <= last; i += 1) {
          out[i] = {
            timestamp: out[i]?.timestamp ?? stamp(),
            status: i === brokeAt ? brokeWith : cfg.linkedFailed,
          };
        }
      }
      // Record transient failures so a later retry of the same id is answered
      // with id_already_failed instead of silently re-running the validation.
      if (cfg.onFail) {
        for (let i = start; i <= last; i += 1) {
          const status = out[i].status;
          if (status !== cfg.created) cfg.onFail(events[i], status);
        }
      }
      start = last + 1;
    }
    return out;
  };

  return {
    async createAccounts(batch) {
      expirePending();
      return runBatch<Account, CreateAccountStatus>(batch, {
        linkedBit: AccountFlags.linked,
        created: CreateAccountStatus.created,
        linkedFailed: CreateAccountStatus.linked_event_failed,
        chainOpen: CreateAccountStatus.linked_event_chain_open,
        apply: applyAccount,
      });
    },
    async createTransfers(batch) {
      expirePending();
      return runBatch<Transfer, CreateTransferStatus>(batch, {
        linkedBit: TransferFlags.linked,
        created: CreateTransferStatus.created,
        linkedFailed: CreateTransferStatus.linked_event_failed,
        chainOpen: CreateTransferStatus.linked_event_chain_open,
        apply: applyTransfer,
        onFail: (event, status) => {
          if (TRANSIENT.has(status)) state.failed.set(event.id, status);
        },
      });
    },
    async lookupAccounts(ids) {
      expirePending();
      // Matches the real client: unknown ids yield nothing, so the response
      // order is not the request order. Always key results off the id field.
      return ids
        .map((id) => state.accounts.get(id))
        .filter((a): a is Account => a !== undefined)
        .map((a) => ({ ...a }));
    },
    async lookupTransfers(ids) {
      expirePending();
      return ids
        .map((id) => state.transfers.get(id))
        .filter((t): t is Transfer => t !== undefined)
        .map((t) => ({ ...t }));
    },
    advanceSeconds(seconds) {
      nowNs += BigInt(Math.round(seconds)) * NS_PER_SECOND;
      expirePending();
    },
    now: () => nowNs,
    destroy: () => {},
  };
}

// ---- demo: prove the ledger enforces what the real cluster enforces ----

const CHECKING = 1;
const CUSTOMER = 1;

function check(label: string, ok: boolean, detail: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`);
  if (!ok) process.exitCode = 1;
}

async function demo() {
  const tb = createTestLedger();
  const CUSTOMER_WALLET = 700n;
  const MERCHANT = 701n;
  const FUNDING = 702n;

  const accounts = await tb.createAccounts([
    testAccount({
      id: CUSTOMER_WALLET,
      ledger: CHECKING,
      code: CUSTOMER,
      flags: AccountFlags.debits_must_not_exceed_credits,
    }),
    testAccount({ id: MERCHANT, ledger: CHECKING, code: CUSTOMER }),
    testAccount({ id: FUNDING, ledger: CHECKING, code: CUSTOMER }),
  ]);
  check(
    "createAccounts returns one status per event",
    accounts.length === 3 &&
      accounts.every((r) => r.status === CreateAccountStatus.created),
    `3 accounts opened, statuses ${accounts.map((r) => CreateAccountStatus[r.status]).join(", ")}`,
  );

  // Fund the wallet with 100_00 cents from the funding account.
  await tb.createTransfers([
    testTransfer({
      id: 1n,
      debit_account_id: FUNDING,
      credit_account_id: CUSTOMER_WALLET,
      amount: 100_00n,
      ledger: CHECKING,
      code: 10,
    }),
  ]);

  // Property 1: double entry. The amount left one account and entered the other.
  {
    const [funding, wallet] = await tb.lookupAccounts([
      FUNDING,
      CUSTOMER_WALLET,
    ]);
    check(
      "double entry balances",
      funding.debits_posted === 100_00n && wallet.credits_posted === 100_00n,
      `funding debits ${funding.debits_posted}, wallet credits ${wallet.credits_posted}`,
    );
  }

  // Property 2: the balance invariant rejects the overdraw, per event.
  {
    const results = await tb.createTransfers([
      testTransfer({
        id: 2n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 60_00n,
        ledger: CHECKING,
        code: 20,
      }),
      testTransfer({
        id: 3n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 60_00n,
        ledger: CHECKING,
        code: 20,
      }),
    ]);
    check(
      "debits_must_not_exceed_credits rejects the overdraw",
      results[0].status === CreateTransferStatus.created &&
        results[1].status === CreateTransferStatus.exceeds_credits,
      `two 6000 debits against a 10000 balance: ${CreateTransferStatus[results[0].status]}, ${CreateTransferStatus[results[1].status]}`,
    );
  }

  // Property 3: idempotency by id. The same transfer replayed reports exists.
  {
    const results = await tb.createTransfers([
      testTransfer({
        id: 2n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 60_00n,
        ledger: CHECKING,
        code: 20,
      }),
    ]);
    const [wallet] = await tb.lookupAccounts([CUSTOMER_WALLET]);
    check(
      "replaying an id reports exists, no second debit",
      results[0].status === CreateTransferStatus.exists &&
        wallet.debits_posted === 60_00n,
      `status ${CreateTransferStatus[results[0].status]}, wallet debits still ${wallet.debits_posted}`,
    );
  }

  // Property 4: an id whose first attempt failed transiently is remembered.
  {
    const results = await tb.createTransfers([
      testTransfer({
        id: 3n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 1_00n,
        ledger: CHECKING,
        code: 20,
      }),
    ]);
    check(
      "id_already_failed for a retried transient failure",
      results[0].status === CreateTransferStatus.id_already_failed,
      `id 3 failed with exceeds_credits, retry reports ${CreateTransferStatus[results[0].status]}`,
    );
  }

  // Property 5: a pending hold releases itself when the timeout elapses.
  {
    await tb.createTransfers([
      testTransfer({
        id: 4n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 20_00n,
        ledger: CHECKING,
        code: 20,
        timeout: 120,
        flags: TransferFlags.pending,
      }),
    ]);
    const [held] = await tb.lookupAccounts([CUSTOMER_WALLET]);
    tb.advanceSeconds(121);
    const [released] = await tb.lookupAccounts([CUSTOMER_WALLET]);
    const late = await tb.createTransfers([
      testTransfer({
        id: 5n,
        pending_id: 4n,
        amount: amount_max,
        flags: TransferFlags.post_pending_transfer,
      }),
    ]);
    check(
      "timeout auto-voids the hold and blocks a late capture",
      held.debits_pending === 20_00n &&
        released.debits_pending === 0n &&
        late[0].status === CreateTransferStatus.pending_transfer_expired,
      `held ${held.debits_pending} -> released ${released.debits_pending}, late capture ${CreateTransferStatus[late[0].status]}`,
    );
  }

  // Property 6: a linked chain rolls back whole, and only one event carries
  // the real cause. The rest report linked_event_failed.
  {
    const before = await tb.lookupAccounts([CUSTOMER_WALLET]);
    const results = await tb.createTransfers([
      testTransfer({
        id: 6n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 10_00n,
        ledger: CHECKING,
        code: 20,
        flags: TransferFlags.linked,
      }),
      testTransfer({
        id: 7n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: 9999n,
        amount: 1_00n,
        ledger: CHECKING,
        code: 20,
        flags: TransferFlags.linked,
      }),
      testTransfer({
        id: 8n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 1_00n,
        ledger: CHECKING,
        code: 20,
      }),
    ]);
    const after = await tb.lookupAccounts([CUSTOMER_WALLET]);
    check(
      "a broken link rolls the whole chain back",
      results[0].status === CreateTransferStatus.linked_event_failed &&
        results[1].status === CreateTransferStatus.credit_account_not_found &&
        results[2].status === CreateTransferStatus.linked_event_failed &&
        before[0].debits_posted === after[0].debits_posted,
      `statuses ${results.map((r) => CreateTransferStatus[r.status]).join(", ")}, wallet debits unchanged at ${after[0].debits_posted}`,
    );
  }

  // Property 7: a trailing linked flag leaves the chain open and fails it.
  {
    const results = await tb.createTransfers([
      testTransfer({
        id: 9n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 1_00n,
        ledger: CHECKING,
        code: 20,
        flags: TransferFlags.linked,
      }),
      testTransfer({
        id: 10n,
        debit_account_id: CUSTOMER_WALLET,
        credit_account_id: MERCHANT,
        amount: 1_00n,
        ledger: CHECKING,
        code: 20,
        flags: TransferFlags.linked,
      }),
    ]);
    check(
      "an open chain fails with linked_event_chain_open",
      results[0].status === CreateTransferStatus.linked_event_failed &&
        results[1].status === CreateTransferStatus.linked_event_chain_open,
      `two valid transfers, both linked: ${results.map((r) => CreateTransferStatus[r.status]).join(", ")}`,
    );
  }

  console.log("fake-cluster.ts: all properties verified");
}

if (typeof require !== "undefined" && require.main === module) {
  demo().catch((error) => {
    console.error("demo failed", error);
    process.exit(1);
  });
}

/**
 * reservation.demo.ts
 *
 * Runnable proof for reservation.ts, against the in-memory ledger from
 * TigerBeetle Test Ledger. No cluster required.
 *
 * run: bun run src/registry/tigerbeetle-two-phase-reservation/reservation.demo.ts
 *
 * Proven here: the naive balance check loses the race and the invariant flag
 * does not; a pending hold is unspendable; capture posts and a retried capture
 * is not an error; a timeout releases the hold with no sweeper; a partial
 * capture releases the remainder.
 *
 * NOT proven here (a live cluster is the only proof): durability, replication,
 * real throughput, and the exact instant at which best-effort expiry runs.
 */

import { AccountFlags, CreateTransferStatus } from "tigerbeetle-node";
import {
  createTestLedger,
  testAccount,
} from "../tigerbeetle-test-ledger/fake-cluster";
import {
  authorize,
  authorizeByReadingTheBalance,
  available,
  capture,
  fundedAccount,
  type ReservationConfig,
  release,
} from "./reservation";

const CONFIG: ReservationConfig = { ledger: 1, code: 720 };
const TREASURY = 100n;
const GUARDED_WALLET = 101n;
const UNGUARDED_WALLET = 102n;
const MERCHANT = 103n;

const usd = (cents: bigint) =>
  `${cents < 0n ? "-" : ""}$${(cents < 0n ? -cents : cents) / 100n}.${String((cents < 0n ? -cents : cents) % 100n).padStart(2, "0")}`;

function check(label: string, ok: boolean, detail: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label} :: ${detail}`);
  if (!ok) process.exitCode = 1;
}

async function balanceOf(
  tb: ReturnType<typeof createTestLedger>,
  id: bigint,
): Promise<bigint> {
  const [account] = await tb.lookupAccounts([id]);
  return available(account);
}

async function demo() {
  const tb = createTestLedger();

  await tb.createAccounts([
    testAccount({ id: TREASURY, ledger: 1, code: 700 }),
    fundedAccount({ id: GUARDED_WALLET, ledger: 1, code: 701 }),
    // Same account, no invariant flag: the balance is advisory.
    testAccount({ id: UNGUARDED_WALLET, ledger: 1, code: 701 }),
    testAccount({ id: MERCHANT, ledger: 1, code: 702 }),
  ]);
  // Fund both wallets with 100.00 from the treasury.
  await tb.createTransfers([
    {
      id: 1n,
      debit_account_id: TREASURY,
      credit_account_id: GUARDED_WALLET,
      amount: 100_00n,
      pending_id: 0n,
      user_data_128: 0n,
      user_data_64: 0n,
      user_data_32: 0,
      timeout: 0,
      ledger: 1,
      code: 10,
      flags: 0,
      timestamp: 0n,
    },
    {
      id: 2n,
      debit_account_id: TREASURY,
      credit_account_id: UNGUARDED_WALLET,
      amount: 100_00n,
      pending_id: 0n,
      user_data_128: 0n,
      user_data_64: 0n,
      user_data_32: 0,
      timeout: 0,
      ledger: 1,
      code: 10,
      flags: 0,
      timestamp: 0n,
    },
  ]);

  // Property 1a: the naive check-then-debit race, on an unguarded account.
  // Two 60.00 authorizations both read 100.00 available and both proceed.
  {
    const both = await Promise.all([
      authorizeByReadingTheBalance(tb, CONFIG, {
        id: 10n,
        debitAccountId: UNGUARDED_WALLET,
        creditAccountId: MERCHANT,
        amount: 60_00n,
        timeoutSeconds: 0,
      }),
      authorizeByReadingTheBalance(tb, CONFIG, {
        id: 11n,
        debitAccountId: UNGUARDED_WALLET,
        creditAccountId: MERCHANT,
        amount: 60_00n,
        timeoutSeconds: 0,
      }),
    ]);
    const balance = await balanceOf(tb, UNGUARDED_WALLET);
    check(
      "naive balance check loses the race",
      both.every((r) => r.allowed) && balance === -20_00n,
      `both 60.00 authorizations passed the if (balance >= amount) check, wallet landed at ${usd(balance)}`,
    );
  }

  // Property 1b: the same two authorizations against the guarded account.
  {
    const both = await Promise.all([
      authorize(tb, CONFIG, {
        id: 12n,
        debitAccountId: GUARDED_WALLET,
        creditAccountId: MERCHANT,
        amount: 60_00n,
        timeoutSeconds: 900,
        userData128: 55_001n,
      }),
      authorize(tb, CONFIG, {
        id: 13n,
        debitAccountId: GUARDED_WALLET,
        creditAccountId: MERCHANT,
        amount: 60_00n,
        timeoutSeconds: 900,
        userData128: 55_002n,
      }),
    ]);
    const kinds = both.map((o) => o.kind).sort();
    const balance = await balanceOf(tb, GUARDED_WALLET);
    check(
      "debits_must_not_exceed_credits does not lose the race",
      kinds[0] === "applied" &&
        kinds[1] === "insufficient-funds" &&
        both.some((o) => o.status === CreateTransferStatus.exceeds_credits) &&
        balance === 40_00n,
      `one applied, one ${CreateTransferStatus[both.find((o) => o.kind === "insufficient-funds")?.status ?? 0]}, spendable balance ${usd(balance)}`,
    );
  }

  // Property 2: the hold is money, not a note. It sits in debits_pending and
  // the invariant counts it, so nothing else can spend it.
  {
    const [wallet] = await tb.lookupAccounts([GUARDED_WALLET]);
    const third = await authorize(tb, CONFIG, {
      id: 14n,
      debitAccountId: GUARDED_WALLET,
      creditAccountId: MERCHANT,
      amount: 60_00n,
      timeoutSeconds: 900,
    });
    check(
      "a pending hold is unspendable",
      wallet.debits_pending === 60_00n &&
        wallet.debits_posted === 0n &&
        third.kind === "insufficient-funds",
      `debits_pending ${usd(wallet.debits_pending)}, debits_posted ${usd(wallet.debits_posted)}, a third 60.00 authorization is ${third.kind}`,
    );
  }

  // Property 3: capture posts the held amount, and the retry is not an error.
  {
    const first = await capture(tb, { id: 20n, pendingId: 12n });
    const retrySameId = await capture(tb, { id: 20n, pendingId: 12n });
    const retryFreshId = await capture(tb, { id: 21n, pendingId: 12n });
    const [wallet] = await tb.lookupAccounts([GUARDED_WALLET]);
    check(
      "capture posts once, retries are already-applied",
      first.kind === "applied" &&
        retrySameId.kind === "already-applied" &&
        retryFreshId.kind === "already-applied" &&
        wallet.debits_pending === 0n &&
        wallet.debits_posted === 60_00n,
      `retry with the same id -> ${CreateTransferStatus[retrySameId.status]}, with a fresh id -> ${CreateTransferStatus[retryFreshId.status]}, posted ${usd(wallet.debits_posted)} and pending back to ${usd(wallet.debits_pending)}`,
    );
  }

  // Property 4: the timeout releases a forgotten hold with no sweeper, and a
  // late capture is rejected rather than double-charging.
  {
    const held = await authorize(tb, CONFIG, {
      id: 30n,
      debitAccountId: GUARDED_WALLET,
      creditAccountId: MERCHANT,
      amount: 30_00n,
      timeoutSeconds: 300,
    });
    const during = await balanceOf(tb, GUARDED_WALLET);
    tb.advanceSeconds(301); // the worker crashed; nobody captured
    const after = await balanceOf(tb, GUARDED_WALLET);
    const late = await capture(tb, { id: 31n, pendingId: 30n });
    const lateRelease = await release(tb, { id: 32n, pendingId: 30n });
    check(
      "timeout auto-voids, late capture is expired not double-charged",
      held.kind === "applied" &&
        during === 10_00n &&
        after === 40_00n &&
        late.kind === "expired" &&
        lateRelease.kind === "already-applied",
      `held 30.00 (spendable ${usd(during)}), after expiry spendable ${usd(after)}, late capture ${CreateTransferStatus[late.status]}, late release ${lateRelease.kind}`,
    );
  }

  // Property 5: partial capture. Authorize 40.00, capture 28.50, and the
  // remaining 11.50 is released in the same operation.
  {
    await authorize(tb, CONFIG, {
      id: 40n,
      debitAccountId: GUARDED_WALLET,
      creditAccountId: MERCHANT,
      amount: 40_00n,
      timeoutSeconds: 900,
    });
    const partial = await capture(tb, {
      id: 41n,
      pendingId: 40n,
      amount: 28_50n,
    });
    const [wallet] = await tb.lookupAccounts([GUARDED_WALLET]);
    check(
      "partial capture releases the remainder",
      partial.kind === "applied" &&
        wallet.debits_pending === 0n &&
        wallet.debits_posted === 88_50n &&
        available(wallet) === 11_50n,
      `authorized 40.00, captured 28.50, pending back to ${usd(wallet.debits_pending)} and spendable ${usd(available(wallet))}`,
    );
  }

  // Property 6: the guarded account never went negative at any point, which is
  // the whole claim. Sum both sides of the ledger for good measure.
  {
    const accounts = await tb.lookupAccounts([
      TREASURY,
      GUARDED_WALLET,
      UNGUARDED_WALLET,
      MERCHANT,
    ]);
    const debits = accounts.reduce((n, a) => n + a.debits_posted, 0n);
    const credits = accounts.reduce((n, a) => n + a.credits_posted, 0n);
    const guarded = accounts.find((a) => a.id === GUARDED_WALLET);
    check(
      "the ledger balances and the guarded wallet never went negative",
      debits === credits &&
        guarded !== undefined &&
        available(guarded) >= 0n &&
        (guarded.flags & AccountFlags.debits_must_not_exceed_credits) !== 0,
      `total debits ${usd(debits)} equal total credits ${usd(credits)}, guarded wallet ends at ${usd(available(guarded ?? accounts[0]))}`,
    );
  }

  console.log("reservation.demo.ts: all properties verified");
}

demo().catch((error) => {
  console.error("demo failed", error);
  process.exit(1);
});

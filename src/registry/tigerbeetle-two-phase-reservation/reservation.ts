/**
 * reservation.ts
 *
 * Authorize now, capture later, auto-void on expiry: a real reservation
 * primitive built on TigerBeetle's two-phase transfers.
 *
 * Failure modes solved:
 *   1. The check-then-debit race. `if (balance >= amount) debit(amount)` has a
 *      gap between the read and the write, and two concurrent authorizations
 *      both pass the check against the same balance. Both debit, the account
 *      goes negative, and no amount of retrying makes the read atomic. Here
 *      the funding account carries AccountFlags.debits_must_not_exceed_credits
 *      (value 2), so the cluster refuses the second transfer with
 *      CreateTransferStatus.exceeds_credits. The invariant is checked as
 *      `debits_pending + debits_posted + amount > credits_posted`, which the
 *      application cannot race because it is not the one checking.
 *      https://docs.tigerbeetle.com/reference/requests/create_transfers#exceeds_credits
 *   2. The reservation that does not reserve. Recording an authorization as a
 *      row in an `authorizations` table moves no money, so every balance
 *      reader has to remember to subtract the open holds, and the one query
 *      that forgets lets the customer spend the same money twice. A pending
 *      transfer moves the amount into `debits_pending`, and the invariant
 *      above counts pending debits, so a hold is unspendable by construction
 *      rather than by convention.
 *   3. The stranded hold and the cron job that double-refunds. A worker that
 *      crashes between authorize and capture freezes the customer's funds
 *      until a sweeper notices, and the sweeper races the real capture and
 *      releases money that was just taken. Transfer.timeout is an interval in
 *      seconds after which the cluster voids the hold itself, and a capture
 *      that arrives after expiry is rejected with pending_transfer_expired.
 *      One of the two wins, always, with no compensating transaction.
 *      https://docs.tigerbeetle.com/reference/transfer#timeout
 *   4. The retried capture read as a failure. Capture is a network call, so it
 *      gets retried. The retry does not return `created`: it returns `exists`
 *      when the same capture id is reused, or pending_transfer_already_posted
 *      when a fresh id resolves an already-posted hold. Code that treats any
 *      non-created status as an error refunds a customer who was correctly
 *      charged. classifyCapture folds both into "already-applied".
 *
 * Money is held, not spent: a pending transfer parks the amount in
 * debits_pending on the payer and credits_pending on the payee. Posting moves
 * it to *_posted; voiding drops it. Posting less than the held amount posts
 * that much and releases the remainder in the same operation, which is exactly
 * a card auth for 60.00 captured at 42.00.
 *
 * Verified against tigerbeetle-node@0.17.9 dist/bindings.d.ts and
 * dist/index.d.ts. Runnable check: reservation.demo.ts.
 */

import {
  type Account,
  AccountFlags,
  amount_max,
  type Client,
  CreateTransferStatus,
  type Transfer,
  TransferFlags,
} from "tigerbeetle-node";

/** The subset of the client this module needs; the test ledger satisfies it. */
export type LedgerClient = Pick<Client, "createTransfers" | "lookupAccounts">;

export interface ReservationConfig {
  /** Ledger id. Every account in one transfer must share it. */
  readonly ledger: number;
  /** Chart-of-accounts code for the transfers this module writes. */
  readonly code: number;
}

export interface AuthorizeRequest {
  /**
   * Client-supplied and stable across retries. Reusing the id is what makes a
   * retried authorize idempotent; generating a fresh one on retry places a
   * second hold. Use `id()` from tigerbeetle-node, persist it, then retry with
   * the persisted value.
   */
  readonly id: bigint;
  readonly debitAccountId: bigint;
  readonly creditAccountId: bigint;
  readonly amount: bigint;
  /** Seconds until the cluster voids the hold on its own. Must be positive. */
  readonly timeoutSeconds: number;
  /** Your order id, invoice id, or correlation id. */
  readonly userData128?: bigint;
}

export interface ResolveRequest {
  /** Id of the capture or release transfer itself, not of the hold. */
  readonly id: bigint;
  /** Id of the pending transfer being resolved. */
  readonly pendingId: bigint;
  /**
   * Capture only. Omit to capture the full held amount. A smaller amount
   * captures that much and releases the remainder in the same operation.
   */
  readonly amount?: bigint;
}

export type OutcomeKind =
  /** The operation landed on this call. */
  | "applied"
  /** It had already landed, on an earlier attempt or in another process. */
  | "already-applied"
  /** The invariant refused it: the payer does not have the funds. */
  | "insufficient-funds"
  /** The hold timed out and the cluster released it. Re-authorize. */
  | "expired"
  /** The hold was resolved the other way. Capture lost to a release, or vice versa. */
  | "conflict"
  /** A programming error: bad ids, wrong ledger, mismatched fields. */
  | "rejected";

export interface Outcome {
  readonly kind: OutcomeKind;
  readonly status: CreateTransferStatus;
  /** Cluster timestamp in nanoseconds; on `already-applied` it is the original. */
  readonly timestamp: bigint;
}

/**
 * Build the payer account. The flag is the entire point: without it the
 * balance is advisory and the race in failure mode 1 is live again.
 */
export function fundedAccount(fields: {
  readonly id: bigint;
  readonly ledger: number;
  readonly code: number;
  readonly userData128?: bigint;
}): Account {
  return {
    id: fields.id,
    debits_pending: 0n,
    debits_posted: 0n,
    credits_pending: 0n,
    credits_posted: 0n,
    user_data_128: fields.userData128 ?? 0n,
    user_data_64: 0n,
    user_data_32: 0,
    reserved: 0,
    ledger: fields.ledger,
    code: fields.code,
    flags: AccountFlags.debits_must_not_exceed_credits,
    timestamp: 0n,
  };
}

/**
 * Spendable balance of an account carrying debits_must_not_exceed_credits.
 * Subtracting debits_pending is not optional: a hold is money that is already
 * committed elsewhere, and a balance that ignores it is the overdraw.
 */
export function available(account: Account): bigint {
  return (
    account.credits_posted - account.debits_posted - account.debits_pending
  );
}

export function classifyAuthorize(status: CreateTransferStatus): OutcomeKind {
  switch (status) {
    case CreateTransferStatus.created:
      return "applied";
    case CreateTransferStatus.exists:
      return "already-applied";
    case CreateTransferStatus.exceeds_credits:
    case CreateTransferStatus.exceeds_debits:
      return "insufficient-funds";
    default:
      return "rejected";
  }
}

export function classifyCapture(status: CreateTransferStatus): OutcomeKind {
  switch (status) {
    case CreateTransferStatus.created:
      return "applied";
    // Same capture id retried, or a fresh id against an already-posted hold.
    // Both mean the money moved. Neither is an error.
    case CreateTransferStatus.exists:
    case CreateTransferStatus.pending_transfer_already_posted:
      return "already-applied";
    case CreateTransferStatus.pending_transfer_expired:
      return "expired";
    case CreateTransferStatus.pending_transfer_already_voided:
      return "conflict";
    default:
      return "rejected";
  }
}

export function classifyRelease(status: CreateTransferStatus): OutcomeKind {
  switch (status) {
    case CreateTransferStatus.created:
      return "applied";
    case CreateTransferStatus.exists:
    case CreateTransferStatus.pending_transfer_already_voided:
      return "already-applied";
    // Expiry already released the hold, which is the outcome we wanted.
    case CreateTransferStatus.pending_transfer_expired:
      return "already-applied";
    case CreateTransferStatus.pending_transfer_already_posted:
      return "conflict";
    default:
      return "rejected";
  }
}

/** Place a hold. The amount leaves the payer's spendable balance immediately. */
export function authorizeTransfer(
  config: ReservationConfig,
  request: AuthorizeRequest,
): Transfer {
  return {
    id: request.id,
    debit_account_id: request.debitAccountId,
    credit_account_id: request.creditAccountId,
    amount: request.amount,
    pending_id: 0n,
    user_data_128: request.userData128 ?? 0n,
    user_data_64: 0n,
    user_data_32: 0,
    timeout: request.timeoutSeconds,
    ledger: config.ledger,
    code: config.code,
    flags: TransferFlags.pending,
    timestamp: 0n,
  };
}

/**
 * Capture a hold. debit_account_id, credit_account_id, ledger and code are
 * left zero on purpose: the cluster inherits them from the pending transfer,
 * so a capture cannot be pointed at the wrong pair of accounts by a stale
 * copy of the authorization. amount_max means "the whole held amount".
 *
 * amount_max is also what makes a retried full capture idempotent. The stored
 * transfer holds the amount that actually posted, not the amount submitted, so
 * the retry comparison is not equality: "If the original posted amount was
 * less than the pending amount, then the transfer amount must be equal to the
 * posted amount. Otherwise, the transfer amount must be greater than or equal
 * to the pending amount." Retrying a full capture with the hold's face value
 * is fine; retrying it with anything smaller is exists_with_different_amount.
 * Retrying a PARTIAL capture must send exactly the amount first captured, so
 * persist that amount rather than recomputing it from a possibly-changed cart.
 * https://docs.tigerbeetle.com/reference/requests/create_transfers#exists_with_different_amount
 */
export function captureTransfer(request: ResolveRequest): Transfer {
  return {
    id: request.id,
    debit_account_id: 0n,
    credit_account_id: 0n,
    amount: request.amount ?? amount_max,
    pending_id: request.pendingId,
    user_data_128: 0n,
    user_data_64: 0n,
    user_data_32: 0,
    timeout: 0,
    ledger: 0,
    code: 0,
    flags: TransferFlags.post_pending_transfer,
    timestamp: 0n,
  };
}

/** Release a hold early. Amount 0 voids the full held amount. */
export function releaseTransfer(request: {
  readonly id: bigint;
  readonly pendingId: bigint;
}): Transfer {
  return {
    id: request.id,
    debit_account_id: 0n,
    credit_account_id: 0n,
    amount: 0n,
    pending_id: request.pendingId,
    user_data_128: 0n,
    user_data_64: 0n,
    user_data_32: 0,
    timeout: 0,
    ledger: 0,
    code: 0,
    flags: TransferFlags.void_pending_transfer,
    timestamp: 0n,
  };
}

async function submit(
  client: LedgerClient,
  transfer: Transfer,
  classify: (status: CreateTransferStatus) => OutcomeKind,
): Promise<Outcome> {
  const [result] = await client.createTransfers([transfer]);
  return {
    kind: classify(result.status),
    status: result.status,
    timestamp: result.timestamp,
  };
}

export const authorize = (
  client: LedgerClient,
  config: ReservationConfig,
  request: AuthorizeRequest,
): Promise<Outcome> =>
  submit(client, authorizeTransfer(config, request), classifyAuthorize);

export const capture = (
  client: LedgerClient,
  request: ResolveRequest,
): Promise<Outcome> =>
  submit(client, captureTransfer(request), classifyCapture);

export const release = (
  client: LedgerClient,
  request: { readonly id: bigint; readonly pendingId: bigint },
): Promise<Outcome> =>
  submit(client, releaseTransfer(request), classifyRelease);

/**
 * The naive alternative, kept here so the demo can run it side by side.
 * Reads the balance, decides, then writes. Correct in a single-threaded test,
 * wrong the moment two requests overlap.
 *
 * ponytail: this exists to fail. Do not import it from anything real.
 */
export async function authorizeByReadingTheBalance(
  client: LedgerClient,
  config: ReservationConfig,
  request: AuthorizeRequest,
): Promise<{ readonly allowed: boolean; readonly outcome?: Outcome }> {
  const [account] = await client.lookupAccounts([request.debitAccountId]);
  if (!account || available(account) < request.amount)
    return { allowed: false };
  // The gap. Another request read the same balance and is about to write too.
  const transfer = authorizeTransfer(config, request);
  const [result] = await client.createTransfers([
    { ...transfer, flags: TransferFlags.none, timeout: 0 },
  ]);
  return {
    allowed: true,
    outcome: {
      kind: classifyAuthorize(result.status),
      status: result.status,
      timestamp: result.timestamp,
    },
  };
}

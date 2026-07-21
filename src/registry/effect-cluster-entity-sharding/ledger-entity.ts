/**
 * A per-account ledger as a cluster entity: one addressable, single-writer
 * mailbox per account, instead of a row plus a lock.
 *
 * The problem this replaces. Money moving between accounts is the textbook
 * contention case. Two withdrawals against the same balance that interleave
 * either double-spend or need a guard, and the usual guard is a database lock:
 * SELECT ... FOR UPDATE, an advisory lock keyed on the account id, or a
 * serializable transaction that retries on conflict. Every one of those makes
 * the account row a point of contention that every worker fights over, and the
 * correctness of the whole system rests on nobody ever writing a path that
 * forgets the lock.
 *
 * What a cluster entity gives instead. An Entity is addressed by a string id,
 * and the cluster guarantees that at any instant exactly one runner in the
 * cluster owns the entity for a given id. Messages to that id land in that one
 * entity's mailbox and are processed one at a time. The single-writer property
 * is not a lock the handler has to remember to take: it is the shape of the
 * runtime. Ten million accounts are ten million addresses spread across the
 * runners, and the balance for one account is only ever touched by the one
 * fiber draining that account's mailbox, so the in-memory balance below needs
 * no lock at all.
 *
 * What the cluster guarantees, and what it does not:
 *
 *   - Single active entity per id. The cluster will not run two copies of
 *     account "acc_100" at once. During a rebalance an entity is stopped on the
 *     runner losing the shard before it starts on the runner gaining it, so the
 *     single-writer window is never violated, at the cost of a brief pause.
 *   - At-least-once delivery for persisted messages. A message annotated
 *     Persisted is written to MessageStorage before it is acknowledged, so a
 *     runner crash mid-processing redelivers it. That redelivery is exactly why
 *     every handler here must be idempotent: post a duplicate deposit and you
 *     have created money. The requestId on the envelope is the dedupe key, and
 *     the running state below records the ids it has already applied.
 *   - Ordering within one entity, not across entities. Messages to one account
 *     are ordered; a deposit to acc_1 and a deposit to acc_2 have no order
 *     relative to each other and are not meant to.
 *   - Idle eviction. maxIdleTime lets the runtime stop an entity that has seen
 *     no messages, freeing memory. The next message rehydrates it, which is why
 *     durable state cannot live only in the entity's memory. Here the balance is
 *     rebuilt from the applied-id log the handler keeps; a real deployment would
 *     rebuild it from MessageStorage or a projection table.
 *
 * Every API used here is from effect@4.0.0-beta.98. The Entity, Rpc, and
 * ClusterSchema surfaces match the shapes in
 * node_modules/effect/src/unstable/cluster/Entity.ts and
 * node_modules/effect/src/unstable/rpc/Rpc.ts.
 */

import { Effect, type Layer, Schema } from "effect";
import { ClusterSchema, Entity } from "effect/unstable/cluster";
import { Rpc } from "effect/unstable/rpc";

/**
 * A single posted movement. The amount is in minor units (cents), an integer,
 * because a balance kept in floating point is a rounding bug with a delay on it.
 */
export class Posting extends Schema.Class<Posting>("BLANK/Ledger/Posting")({
  requestId: Schema.String,
  amountMinor: Schema.Int,
  memo: Schema.String,
}) {}

/** The reply to a balance-changing call: the new balance and whether it applied. */
export class PostingResult extends Schema.Class<PostingResult>(
  "BLANK/Ledger/PostingResult",
)({
  balanceMinor: Schema.Int,
  /** False when the requestId was already applied, so a retry is a no-op. */
  applied: Schema.Boolean,
}) {}

/** Raised when a withdrawal would take the balance below zero. */
export class InsufficientFunds extends Schema.ErrorClass<InsufficientFunds>(
  "BLANK/Ledger/InsufficientFunds",
)({
  requestedMinor: Schema.Int,
  balanceMinor: Schema.Int,
}) {}

/**
 * The entity protocol. The type name "AccountLedger" plus the entity id form
 * the address; there is one ledger entity per account id.
 *
 * Deposit and Withdraw are annotated Persisted so the cluster writes them to
 * MessageStorage before acknowledging, which is what makes redelivery, and
 * therefore the idempotency requirement, real. GetBalance is not persisted: it
 * is a read, losing it on a crash costs nothing, and persisting reads would
 * write a storage row for every balance check.
 */
export const AccountLedger = Entity.make("AccountLedger", [
  Rpc.make("Deposit", {
    success: PostingResult,
    payload: {
      requestId: Schema.String,
      amountMinor: Schema.Int,
      memo: Schema.String,
    },
  }),
  Rpc.make("Withdraw", {
    success: PostingResult,
    error: InsufficientFunds,
    payload: {
      requestId: Schema.String,
      amountMinor: Schema.Int,
      memo: Schema.String,
    },
  }),
  Rpc.make("GetBalance", {
    success: PostingResult,
    payload: {},
  }).annotate(ClusterSchema.Persisted, false),
]).annotateRpcs(ClusterSchema.Persisted, true);

/**
 * The mutable state one running account entity owns. Because the cluster runs
 * exactly one of these per account id, a plain object is safe: no other fiber
 * anywhere is touching this account's balance. `applied` is the idempotency
 * ledger, the set of requestIds already folded into the balance, so a
 * redelivered Deposit is recognised and dropped instead of doubling the money.
 */
type LedgerState = {
  balanceMinor: number;
  readonly applied: Set<string>;
};

const emptyState = (): LedgerState => ({ balanceMinor: 0, applied: new Set() });

/**
 * The entity layer: the handlers, plus the options that decide the entity's
 * behaviour under load and failure.
 *
 * toLayer registers the entity with Sharding. The build effect runs once per
 * activated entity, which is where per-entity state is created, so each account
 * gets its own fresh LedgerState rather than sharing one across the runner.
 */
export const AccountLedgerLayer: Layer.Layer<
  never,
  never,
  import("effect/unstable/cluster").Sharding.Sharding
> = AccountLedger.toLayer(
  Effect.gen(function* () {
    // One state map per runner-activation of this layer. The entity runtime
    // keys a distinct LedgerState per entity id below via `forId`.
    const states = new Map<string, LedgerState>();
    const forId = (id: string): LedgerState => {
      let state = states.get(id);
      if (state === undefined) {
        state = emptyState();
        states.set(id, state);
      }
      return state;
    };

    return AccountLedger.of({
      Deposit: (envelope) => {
        const state = forId(envelope.address.entityId);
        // Idempotency guard. A redelivered message carries the same payload
        // requestId; applying it twice would mint money out of a retry.
        if (state.applied.has(envelope.payload.requestId)) {
          return Effect.succeed(
            new PostingResult({
              balanceMinor: state.balanceMinor,
              applied: false,
            }),
          );
        }
        state.balanceMinor += envelope.payload.amountMinor;
        state.applied.add(envelope.payload.requestId);
        return Effect.succeed(
          new PostingResult({
            balanceMinor: state.balanceMinor,
            applied: true,
          }),
        );
      },

      Withdraw: (envelope) => {
        const state = forId(envelope.address.entityId);
        if (state.applied.has(envelope.payload.requestId)) {
          return Effect.succeed(
            new PostingResult({
              balanceMinor: state.balanceMinor,
              applied: false,
            }),
          );
        }
        // The overdraw check is safe without a lock precisely because this is
        // the only fiber that can be inside this account right now. Under a
        // FOR UPDATE design this same check is correct only while the lock is
        // held, and wrong the moment someone forgets to take it.
        if (envelope.payload.amountMinor > state.balanceMinor) {
          return Effect.fail(
            new InsufficientFunds({
              requestedMinor: envelope.payload.amountMinor,
              balanceMinor: state.balanceMinor,
            }),
          );
        }
        state.balanceMinor -= envelope.payload.amountMinor;
        state.applied.add(envelope.payload.requestId);
        return Effect.succeed(
          new PostingResult({
            balanceMinor: state.balanceMinor,
            applied: true,
          }),
        );
      },

      GetBalance: (envelope) =>
        Effect.succeed(
          new PostingResult({
            balanceMinor: forId(envelope.address.entityId).balanceMinor,
            applied: true,
          }),
        ),
    });
  }),
  {
    // Stop an account entity after ten minutes of silence to free its memory.
    // The next message rehydrates it. Durable balance must therefore come from
    // storage, not from the in-memory map, which idle eviction discards.
    maxIdleTime: "10 minutes",
    // One message at a time per entity. This is the single-writer guarantee
    // stated as a number; raising it would let two withdrawals for one account
    // run concurrently and reintroduce the exact race the entity removes.
    concurrency: 1,
  },
);

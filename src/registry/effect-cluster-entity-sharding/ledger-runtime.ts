/**
 * Running the ledger entity: the single-node Sharding stack, and how a caller
 * gets a typed client for one account.
 *
 * The entity in ledger-entity.ts is defined independently of where it runs. This
 * file is the composition root that gives it a cluster to live in. Sharding.layer
 * is the piece that assigns entities to runners and routes messages, and it is
 * built from five services, each of which decides one axis of the cluster:
 *
 *   - ShardingConfig      how many shards, how entities hash onto them.
 *   - MessageStorage      where persisted messages are durably written before
 *                         acknowledgement. This is the layer that makes
 *                         at-least-once delivery real, and therefore the reason
 *                         the handlers must be idempotent.
 *   - Runners             how this runner talks to its peers. layerNoop is a
 *                         single-node cluster: no peers, no network hop.
 *   - RunnerStorage       the shared record of which runner owns which shard.
 *   - RunnerHealth        how dead runners are detected so their shards move.
 *
 * The stack below is the single-node, in-memory configuration: Runners.layerNoop,
 * RunnerHealth.layerNoop, and the memory variants of the two storages. It is a
 * real, running cluster of size one, which is the right shape for a dev machine,
 * a test, or a service that has not needed to scale out yet. Moving to a real
 * multi-runner cluster is a change to THIS file only: swap Runners.layerNoop for
 * Runners.layerRpc, the memory storages for the SQL-backed ones, and
 * RunnerHealth.layerNoop for layerPing or layerK8s. Nothing in ledger-entity.ts
 * changes, because the entity never knew how many runners existed.
 *
 * Every layer named here is exported from effect@4.0.0-beta.98 under
 * node_modules/effect/src/unstable/cluster/. MessageStorage.layerMemory keeps
 * messages in memory: durable enough to exercise redelivery in a test, not
 * durable across a process restart, which is what the SQL storage is for.
 */

import { Effect, Layer } from "effect";
import {
  MessageStorage,
  RunnerHealth,
  RunnerStorage,
  Runners,
  Sharding,
  ShardingConfig,
} from "effect/unstable/cluster";
import { AccountLedger, AccountLedgerLayer } from "./ledger-entity.ts";

/**
 * The single-node cluster. Sharding.layer sits on top; the five services below
 * it are provided in one Layer.provide so the whole stack resolves to just
 * Sharding for anything downstream.
 *
 * MessageStorage.layerMemory is listed before Runners.layerNoop deliberately:
 * Runners.layerNoop itself needs MessageStorage, so the storage layer has to be
 * in scope when the runners layer is built. Layer.provide resolves that ordering
 * by type, but keeping the dependency visible here is the honest documentation.
 */
export const SingleNodeSharding: Layer.Layer<Sharding.Sharding> =
  Sharding.layer.pipe(
    Layer.provide([
      Runners.layerNoop,
      RunnerHealth.layerNoop,
      RunnerStorage.layerMemory,
      MessageStorage.layerMemory,
      ShardingConfig.layerDefaults,
    ]),
  );

/**
 * The whole ledger service as one layer: the registered entity handlers plus the
 * cluster they run on. Provide this at the edge of your app and the account
 * ledger is live.
 */
export const LedgerLive: Layer.Layer<never> = AccountLedgerLayer.pipe(
  Layer.provide(SingleNodeSharding),
);

/**
 * Post a deposit to one account and read the resulting balance.
 *
 * The two-step client shape is the important part. `AccountLedger.client` yields
 * a FACTORY, and calling it with an account id yields the client bound to that
 * one entity address. The id is the routing key: the cluster hashes it to a
 * shard, finds the runner that owns that shard, and delivers there. The caller
 * never learns which runner answered, and does not need to, which is the whole
 * point of addressing by id rather than by host.
 *
 * This Effect requires Sharding in its environment, satisfied by LedgerLive (or
 * SingleNodeSharding) at the point it is run.
 */
export const deposit = Effect.fnUntraced(function* (
  accountId: string,
  requestId: string,
  amountMinor: number,
  memo: string,
) {
  const makeClient = yield* AccountLedger.client;
  const account = makeClient(accountId);
  return yield* account.Deposit({ requestId, amountMinor, memo });
});

/**
 * Attempt a withdrawal. The InsufficientFunds error declared on the entity is
 * carried across the cluster boundary as a typed failure in the Effect's error
 * channel, so the caller handles it with the same Effect.catchTag it would use
 * for a local error. A defect (a bug that throws something not in the schema) is
 * NOT tunnelled this way: it stays a defect, and with the entity's default
 * settings it is fatal to that message rather than silently swallowed.
 */
export const withdraw = Effect.fnUntraced(function* (
  accountId: string,
  requestId: string,
  amountMinor: number,
  memo: string,
) {
  const makeClient = yield* AccountLedger.client;
  const account = makeClient(accountId);
  return yield* account.Withdraw({ requestId, amountMinor, memo });
});

/**
 * Layer wiring for the BLANK payout settlement workflow.
 *
 * Targets Effect v4 (pinned: effect@4.0.0-beta.98). Every module imported here
 * ships inside the core `effect` package under `effect/unstable/*`.
 *
 * `DurableQueue.process` requires three services, and getting the layer order
 * wrong is the usual first failure:
 *   WorkflowEngine            journals activities and suspensions
 *   PersistedQueueFactory     creates the backing persisted queue
 *   PersistedQueueStore       where queue items actually live
 */

import { Effect, Layer } from "effect";
import { PersistedQueue } from "effect/unstable/persistence";
import {
  DurableQueue,
  type Workflow,
  WorkflowEngine,
} from "effect/unstable/workflow";
import { LedgerPost, SettlePayout, SettlePayoutLayer } from "./workflow.ts";

/**
 * Swap `layerStoreMemory` for `PersistedQueue.layerStoreSql` or
 * `layerStoreRedis` in production; the rest of this file is unchanged.
 * `layerStoreMemory` loses queued items on restart, which is fine for tests
 * and wrong for money.
 */
const PersistedQueueLive = PersistedQueue.layer.pipe(
  Layer.provide(PersistedQueue.layerStoreMemory),
);

/**
 * `WorkflowEngine.layerMemory` is the in-process engine. It replays correctly
 * but forgets journals across restarts, so a real deployment provides a
 * cluster-backed engine instead.
 */
const EngineLive = WorkflowEngine.layerMemory;

/**
 * The worker half of the durable queue. `concurrency` bounds how many ledger
 * posts are in flight; each settled item wakes exactly one suspended workflow.
 */
const LedgerPostWorker = DurableQueue.worker(
  LedgerPost,
  Effect.fnUntraced(function* (payload) {
    yield* Effect.log(
      `Posting ${payload.amountMinor} ${payload.currency} for ${payload.payoutId}`,
    );
    return `led_${payload.payoutId}`;
  }),
  { concurrency: 8 },
);

/**
 * One layer that registers the workflow, runs the queue workers, and provides
 * the engine plus persistence beneath both.
 */
export const SettlementLive = Layer.mergeAll(
  SettlePayoutLayer,
  LedgerPostWorker,
).pipe(Layer.provideMerge(Layer.mergeAll(EngineLive, PersistedQueueLive)));

/**
 * Fire and forget: `discard: true` returns the execution id immediately instead
 * of waiting for the workflow to finish. This is what an HTTP handler wants,
 * since a settlement can suspend for days.
 */
export const startSettlement = (
  payoutId: string,
  amountMinor: number,
  currency: "usd" | "eur",
) =>
  SettlePayout.execute({ payoutId, amountMinor, currency }, { discard: true });

/**
 * Poll returns `Option.none()` while the execution is unknown, and otherwise a
 * `Workflow.Result` that is either `Complete` (carrying an Exit) or `Suspended`.
 */
export const pollSettlement = (executionId: string) =>
  Effect.map(SettlePayout.poll(executionId), (result) =>
    result.pipe(
      // `Workflow.isResult` narrows an unknown value; here the option already
      // carries the right type, so branch on the tag directly.
      (option) =>
        option._tag === "None"
          ? ({ status: "unknown" } as const)
          : option.value._tag === "Suspended"
            ? ({ status: "suspended" } as const)
            : ({ status: "complete", exit: option.value.exit } as const),
    ),
  );

/** Cancels an in-flight settlement, running any registered compensations. */
export const cancelSettlement = (executionId: string) =>
  SettlePayout.interrupt(executionId);

// Re-exported so consumers do not need to reach into effect/unstable/workflow
// just to reference the Result type.
export type SettlementResult = Workflow.Result<
  { readonly ledgerEntryId: string },
  never
>;

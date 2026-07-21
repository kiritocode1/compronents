/**
 * Running the dunning workflow: the engine layer, and the two ways to start a
 * run.
 *
 * A workflow definition is inert until an engine backs it. WorkflowEngine is the
 * service that owns the journal: it records Activity results, drives replay after
 * a crash, and holds the durable timers that wake a suspended workflow. This file
 * wires WorkflowEngine.layerMemory, the in-memory engine, under the dunning
 * workflow's own layer.
 *
 * The memory engine is the right backing for a test or a single-process dev run:
 * the journal lives in memory, so it survives replay within one process but not a
 * process restart. Production durability across restarts and across machines is a
 * different engine, ClusterWorkflowEngine, backed by cluster sharding and durable
 * storage. Swapping it is a change to THIS file: replace WorkflowEngine.layerMemory
 * with the cluster engine layer and its storage. The workflow body does not change,
 * because it never knew which engine journaled it.
 *
 * Both layers are from effect@4.0.0-beta.98:
 * node_modules/effect/src/unstable/workflow/WorkflowEngine.ts exports layerMemory.
 */

import { Effect, Layer, Option } from "effect";
import { WorkflowEngine } from "effect/unstable/workflow";
import { DunningWorkflow, DunningWorkflowLayer } from "./dunning-workflow.ts";

/**
 * The dunning service as one layer: the workflow's registered handler plus the
 * engine that journals it. Provide this at the edge of your app.
 *
 * provideMerge, not provide, because callers downstream need WorkflowEngine in
 * scope too (to poll or interrupt a run), so the engine is kept in the layer's
 * output rather than hidden inside it.
 */
export const DunningLive: Layer.Layer<WorkflowEngine.WorkflowEngine> =
  DunningWorkflowLayer.pipe(Layer.provideMerge(WorkflowEngine.layerMemory));

/**
 * Enqueue an invoice for dunning without waiting for the days-long sequence to
 * finish. `discard: true` returns as soon as the run is durably started, handing
 * back the deterministic execution id so the caller can poll later.
 *
 * Because the workflow's idempotency key is the invoice id, calling this twice for
 * one invoice returns the SAME execution id and does not start a second sequence.
 * That is what makes an at-least-once enqueue (a retried webhook, a redelivered
 * queue message) safe: the second delivery joins the run the first one started.
 */
export const startDunning = Effect.fnUntraced(function* (
  invoiceId: string,
  customerId: string,
  amountMinor: number,
) {
  return yield* DunningWorkflow.execute(
    { invoiceId, customerId, amountMinor },
    { discard: true },
  );
});

/**
 * Read where a dunning run has got to. poll returns None if the execution id is
 * unknown, and otherwise a Result that is either Suspended (waiting on a durable
 * timer, for example mid three-day sleep) or Complete (the sequence finished,
 * carrying the success value or the DunningExhausted failure). This is the read
 * side a support dashboard would use to answer "is invoice X still being
 * retried, and on which attempt."
 */
export const dunningStatus = Effect.fnUntraced(function* (executionId: string) {
  const polled = yield* DunningWorkflow.poll(executionId);
  if (Option.isNone(polled)) {
    return { known: false as const };
  }
  return { known: true as const, result: polled.value };
});

import { actor, event, queue } from "rivetkit";
import { Loop, workflow } from "rivetkit/workflow";

/**
 * BLANK shipment pipeline: a Rivet actor whose `run` handler is a durable
 * workflow. Pinned to rivetkit 2.3.3 or newer.
 *
 * Two things here are new and version sensitive:
 *
 * 1. rivetkit 2.3.1 (2026-06-16) split the single `ActorWorkflowContext` into
 *    `WorkflowContext` and `WorkflowStepContext`. The outer `ctx` now only
 *    carries deterministic, replayable primitives (step, tryStep, try, loop,
 *    sleep, join, race, queue.next). Actor data (state, vars, db, client) and
 *    side effects (broadcast, queue.send) moved onto the `step` argument that
 *    every step callback receives. Reading `ctx.state` at the workflow level no
 *    longer type checks, which is the point: replay stays deterministic.
 *
 * 2. rivetkit 2.3.3 (2026-07-14) added `ctx.getVersion(name, latest)`, a
 *    version gate that lets an already running workflow keep replaying the code
 *    path it started on while new runs take the current path.
 */

/** Payload a warehouse posts when a parcel physically leaves a facility. */
interface ScanEvent {
  facility: string;
  scannedAt: number;
  /** Terminal scans end the tracking loop. */
  terminal: boolean;
}

interface ShipmentState {
  reference: string;
  status: "created" | "labelled" | "in-transit" | "delivered" | "lost";
  scans: ScanEvent[];
  labelUrl: string | null;
}

export const shipmentActor = actor({
  createState: (_c, input: { reference: string }): ShipmentState => ({
    reference: input.reference,
    status: "created",
    scans: [],
    labelUrl: null,
  }),

  // `event()` and `queue()` are type-only tokens: no runtime schema library is
  // required, the generic argument is what types broadcast and queue payloads.
  events: {
    statusChanged: event<{ status: ShipmentState["status"] }>(),
  },
  queues: {
    scan: queue<ScanEvent>(),
  },

  actions: {
    // Producers push scans through the normal queue API. The workflow below
    // consumes them durably, so a scan that arrives while the actor is asleep
    // is still processed after it wakes.
    recordScan: async (c, scan: ScanEvent) => {
      await c.queue.send("scan", scan);
    },
    snapshot: (c) => c.state,
  },

  run: workflow(
    async (ctx) => {
      // Version gate (2.3.3+). Workflows that were mid-flight when this file
      // shipped replay under version 1 and skip the carrier handoff; anything
      // started after the deploy runs version 2. Bumping the second argument is
      // how you retire a branch once no version 1 histories remain.
      const version = await ctx.getVersion("carrier-handoff", 2);

      // `step` persists its return value. On replay the callback is skipped and
      // the stored value is returned, so buying a label twice is impossible.
      const label = await ctx.step("buy-label", async (step) => {
        const url = `https://labels.blank.internal/${step.key.join("/")}.pdf`;
        step.state.labelUrl = url;
        step.state.status = "labelled";
        step.broadcast("statusChanged", { status: "labelled" });
        return url;
      });

      if (version >= 2) {
        // `tryStep` returns failure as data instead of throwing, so a carrier
        // outage degrades the shipment rather than killing the workflow.
        // Retry knobs live on the config object form.
        const handoff = await ctx.tryStep({
          name: "carrier-handoff",
          maxRetries: 5,
          retryBackoffBase: 500,
          timeout: 15_000,
          run: async (step) => {
            step.log.info({ label }, "handing parcel to carrier");
            return { carrier: "blank-freight", acceptedAt: Date.now() };
          },
          // Compensating action, replayed only if a later rollback checkpoint
          // unwinds past this step.
          rollback: async (step, output) => {
            step.log.warn({ carrier: output.carrier }, "cancelling handoff");
          },
        });

        if (!handoff.ok) {
          await ctx.step("mark-lost", async (step) => {
            step.state.status = "lost";
            step.broadcast("statusChanged", { status: "lost" });
          });
          return;
        }
      }

      await ctx.step("mark-in-transit", async (step) => {
        step.state.status = "in-transit";
        step.broadcast("statusChanged", { status: "in-transit" });
      });

      // Durable loop. `ctx.queue.next` parks the workflow; the actor is free to
      // sleep and the loop resumes on the next scan message. Loop state is
      // persisted per iteration, so `seen` survives a restart.
      const finalFacility = await ctx.loop({
        name: "await-scans",
        state: { seen: 0 },
        run: async (loopCtx, state) => {
          const message = await loopCtx.queue.next("scan");

          await loopCtx.step(`record-scan-${state.seen}`, async (step) => {
            step.state.scans.push(message.body);
          });

          if (message.body.terminal) {
            return Loop.break(message.body.facility);
          }
          return Loop.continue({ seen: state.seen + 1 });
        },
      });

      // Durable timer: the actor may sleep for the whole window and still wake
      // to finish. This is not setTimeout, it survives process death.
      await ctx.sleep("settle-window", 60_000);

      await ctx.step("mark-delivered", async (step) => {
        step.state.status = "delivered";
        step.broadcast("statusChanged", { status: "delivered" });
        step.log.info({ finalFacility }, "shipment closed");
      });
    },
    {
      // Fires on every workflow-level error event, including retries that were
      // eventually swallowed by tryStep. Runs with the plain RunContext.
      onError: (c, errorEvent) => {
        c.log.error({ errorEvent }, "shipment workflow error");
      },
    },
  ),
});

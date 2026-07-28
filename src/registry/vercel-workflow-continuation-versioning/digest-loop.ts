/**
 * digest-loop.ts
 *
 * A Vercel Workflow that runs forever without staying on the deployment that
 * started it, and survives the version boundary that creates. Pinned to
 * workflow@4.6.2.
 *
 * Failure modes solved:
 *
 *   1. The immortal pin. "Workflow runs are pinned to the deployment that
 *      starts them", per https://workflow.dev/docs/foundations/versioning.
 *      That default is right for a run with an end: a two-day sleep resumes
 *      into the same code it left, and the deploy that ships on day one
 *      interrupts nothing. It is wrong for a loop with no end. A recurring
 *      digest written as `while (true) { send(); await sleep("1d") }` pins
 *      itself to deploy 11 permanently, so the fix you shipped on deploy 12
 *      never reaches it, and the only way out is to find the run and cancel
 *      it by hand. This file models the loop as a chain of bounded runs
 *      instead: do one day of work, start the next run on the latest
 *      deployment, exit.
 *
 *   2. The untyped handoff that creates. start() with deploymentId erases the
 *      argument and return types to `unknown` by design, because the target
 *      deployment's code is not this deployment's code. So the function that
 *      receives a continuation must accept `unknown` and earn its types back
 *      at runtime. decodeState in state-envelope.ts is that gate, with the
 *      rename, rollback, and lossy-migration cases proven there.
 *
 *   3. The version boundary that passes locally for the wrong reason. From the
 *      same declaration: "In other worlds (local dev, Postgres) there is no
 *      notion of multiple deployments to resolve between, so `'latest'` has no
 *      effect, a warning is logged and the run targets the current
 *      deployment." Your continuation test therefore proves nothing about the
 *      thing it is testing unless it exercises decodeState directly, which is
 *      why the migration chain is unit-testable without a deployment at all.
 *
 *   4. The chain nobody can stop. Each hop is a new runId, so cancelling the
 *      run you can see cancels one day and the chain continues tomorrow. The
 *      hop cap in the envelope is the in-band brake; the kill switch read at
 *      the top of each hop is the out-of-band one.
 *
 * Compatibility rule for anything that crosses a hop: keep the workflow's
 * exported name and file path stable across the deployments you plan to
 * bridge. The docs are explicit that the caller and the target deployment can
 * differ, and a moved or renamed workflow function resolves to nothing on the
 * far side.
 */

import { sleep } from "workflow";
import { start } from "workflow/api";
import {
  decodeState,
  encodeState,
  type StateEnvelope,
  type StateVersions,
  UnreadableState,
} from "./state-envelope";

/** The current shape. Bump this by appending a migration, never by editing. */
export interface DigestState {
  readonly subscriberId: string;
  readonly lastDigestAt: string;
  readonly locale: string;
}

export const digestVersions: StateVersions<DigestState> = {
  /**
   * A little over a year of daily hops. Long enough that a healthy loop never
   * hits it, short enough that a loop stuck in a same-day retry cycle stops
   * before it becomes a line item.
   */
  maxHops: 400,
  migrations: [
    (prior) => {
      const p = prior as { subscriberId: string };
      return {
        subscriberId: p.subscriberId,
        lastSentAt: "1970-01-01T00:00:00.000Z",
      };
    },
    (prior) => {
      const p = prior as { subscriberId: string; lastSentAt: string };
      return {
        subscriberId: p.subscriberId,
        lastDigestAt: p.lastSentAt,
        locale: "en-GB",
      };
    },
  ],
  validate: (candidate): candidate is DigestState => {
    if (typeof candidate !== "object" || candidate === null) return false;
    const c = candidate as Record<string, unknown>;
    return (
      typeof c.subscriberId === "string" &&
      typeof c.lastDigestAt === "string" &&
      typeof c.locale === "string"
    );
  },
};

async function sendDigest(state: DigestState): Promise<string> {
  "use step";
  // Full Node.js runtime here: query the articles published since
  // state.lastDigestAt, render in state.locale, hand it to the mail provider.
  // Returns the new watermark, which becomes the next hop's input.
  void state;
  return new Date().toISOString();
}

async function digestsArePaused(subscriberId: string): Promise<boolean> {
  "use step";
  // The out-of-band brake. Read a flag your on-call can flip, because
  // cancelling one run in the chain only skips one day.
  void subscriberId;
  return false;
}

/**
 * Hand the next hop to the newest deployment.
 *
 * This has to be a step: start() reaches the network and the workflow sandbox
 * has no Node.js runtime. It is also the only line in the file where a version
 * boundary is crossed, which is why the envelope is stamped right here rather
 * than anywhere upstream.
 */
async function continueOnLatest(envelope: StateEnvelope): Promise<string> {
  "use step";
  const run = await start(dailyDigest, [envelope], {
    deploymentId: "latest",
  });
  return run.runId;
}

async function reportUnreadableState(
  reason: string,
  detail: string,
): Promise<void> {
  "use step";
  // A refused continuation is an alert, not a log line. The chain has stopped
  // and no future hop will restart it.
  void reason;
  void detail;
}

/**
 * One day of digest work, then a fresh run on the latest deployment.
 *
 * The parameter is `unknown` because that is honestly what arrives: a
 * deployment that no longer exists may have written it. Everything after
 * decodeState is typed again.
 */
export async function dailyDigest(
  input: unknown,
): Promise<
  | { status: "continued"; runId: string; hops: number }
  | { status: "paused"; subscriberId: string }
  | { status: "refused"; reason: string }
> {
  "use workflow";

  let state: DigestState;
  let hops: number;
  try {
    const decoded = decodeState(digestVersions, input);
    state = decoded.state;
    hops = decoded.hops;
  } catch (error) {
    if (error instanceof UnreadableState) {
      // Stop the chain. The failed run keeps its exact input in the event log,
      // so the fix is: ship the missing migration, then rerun this run on the
      // latest deployment with the same arguments.
      await reportUnreadableState(error.reason, error.message);
      return { status: "refused", reason: error.reason };
    }
    throw error;
  }

  if (await digestsArePaused(state.subscriberId)) {
    return { status: "paused", subscriberId: state.subscriberId };
  }

  const sentAt = await sendDigest(state);
  await sleep("1d");

  const runId = await continueOnLatest(
    encodeState(digestVersions, { ...state, lastDigestAt: sentAt }, hops + 1),
  );

  return { status: "continued", runId, hops: hops + 1 };
}

/**
 * Kick off a chain. Note the shape: the first run is handed an envelope too,
 * because a bare state object is exactly the input decodeState refuses, and
 * the chain should fail on hop 0 in your own hands rather than on hop 30 in
 * production.
 */
export async function startDigestChain(
  subscriberId: string,
  locale: string,
): Promise<string> {
  const run = await start(dailyDigest, [
    encodeState(
      digestVersions,
      { subscriberId, locale, lastDigestAt: new Date().toISOString() },
      0,
    ),
  ]);
  return run.runId;
}

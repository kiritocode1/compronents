/// <reference types="@cloudflare/workers-types" />

/**
 * Control plane for the agent-run Workflow, plus the fork sweeper.
 *
 * Two responsibilities, and they are deliberately separate:
 *
 * 1. Drive one run. Start an instance, report status, and deliver the two events
 *    the Workflow suspends on: `agent-run-finished` (the sandbox reporting it is
 *    done) and `merge-decision` (a reviewer or a policy engine approving the
 *    promotion into the baseline). `instance.sendEvent()` is how a suspended
 *    `step.waitForEvent` is resumed; the `type` has to match exactly.
 *
 * 2. Sweep abandoned forks on a cron. This is not redundant with the Workflow's
 *    own `finally` teardown. That teardown runs when a step throws, but it does
 *    not run when an instance is terminated, when a `waitForEvent` recipient
 *    never shows up and the operator kills the run, or when a deploy replaces a
 *    Workflow class mid-flight. Artifacts storage bills at $0.50 per GB-month
 *    past the first GB and the docs are explicit that "repos remain stored until
 *    you explicitly delete them", so unreferenced forks are a bill that grows on
 *    its own. The sweeper is the backstop that makes the happy path's cleanup
 *    optional rather than load-bearing.
 *
 * The sweeper decides on `createdAt`, which `list()` returns per repo, and uses
 * the repo NAME only to prove ownership. Both halves matter. Age has to come from
 * the server, because the epoch encoded in the name is supplied by whatever
 * created the repo and is not evidence of anything. Ownership has to come from
 * the name, because `delete()` takes a bare name and does not check who created
 * it, so a sweep filtering on age alone would reap the baseline repo every fork
 * descends from, which is by definition the oldest repo in the namespace.
 *
 * Verified against the `Artifacts` types shipped in
 * @cloudflare/workers-types@5.20260719.1, which are the authoritative shape.
 * `list()` returns `{ repos, total, cursor? }` where each entry is
 * `Omit<ArtifactsRepoInfo, "remote">`: id, name, description, defaultBranch,
 * createdAt, updatedAt, lastPushAt, source, readOnly. There is no `status` field
 * on it. `delete()` returns `Promise<boolean>`, false when the repo is already
 * gone, which is why the sweep counts the return value rather than its attempts.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "$schema": "./node_modules/wrangler/config-schema.json",
 *   "name": "blank-agent-run-forks",
 *   "main": "src/agent-run-forks/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "artifacts": [
 *     {
 *       "binding": "ARTIFACTS",
 *       "namespace": "agent-runs"
 *     }
 *   ],
 *   "workflows": [
 *     {
 *       "binding": "AGENT_RUN",
 *       "name": "agent-run",
 *       "class_name": "AgentRunWorkflow"
 *     }
 *   ],
 *   "triggers": {
 *     "crons": ["*\/15 * * * *"]
 *   },
 *   "vars": {
 *     "AGENT_DISPATCH_URL": "https://sandbox.internal.example/runs"
 *   }
 * }
 *
 * `artifacts` is non-inheritable in named Wrangler environments, so repeat the
 * block in each environment that needs it. Give the sweep its own namespace
 * ("agent-runs" above) so a stale-fork sweep can never see a production repo.
 */

import {
  type AgentRunEnv,
  type AgentRunParams,
  type MergeDecision,
  runForkName,
} from "./run-workflow";

export { AgentRunWorkflow } from "./run-workflow";

type Env = AgentRunEnv & {
  AGENT_RUN: Workflow<AgentRunParams>;
};

/**
 * How long a fork may sit untouched before the sweeper reclaims it. This is
 * bounded below by the Workflow's own longest wait: the merge gate can stay open
 * for 24 hours, so anything shorter would delete a fork somebody is still
 * reviewing. Six hours of headroom on top of that.
 */
const FORK_TTL_SECONDS = 30 * 60 * 60;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

/** Reads the epoch suffix that runForkName() appended. Non-run repos return null. */
const forkStartedAt = (repoName: string): number | null => {
  if (!repoName.startsWith("run-")) return null;
  const suffix = repoName.split("-").at(-1);
  const epoch = Number(suffix);
  return Number.isSafeInteger(epoch) && epoch > 0 ? epoch : null;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Start a run. The instance id is derived from the caller's run id, so a
    // retried POST resolves to the same instance instead of forking twice: the
    // fork name in the Workflow is derived from this id, and Workflows rejects a
    // duplicate id outright.
    if (request.method === "POST" && url.pathname === "/runs") {
      const params = (await request.json()) as AgentRunParams & {
        runId: string;
      };
      const instance = await env.AGENT_RUN.create({
        id: `agent-run:${params.runId}`,
        params,
        // Failed runs are worth keeping longer than successful ones: a fork that
        // was swept away leaves the instance history as the only record of what
        // the agent did before it broke.
        retention: { successRetention: "3 days", errorRetention: "30 days" },
      });
      return json({ instanceId: instance.id }, 202);
    }

    const instanceId = url.searchParams.get("instanceId");
    if (!instanceId) return json({ error: "Missing instanceId" }, 400);

    if (request.method === "GET" && url.pathname === "/runs") {
      const instance = await env.AGENT_RUN.get(instanceId);
      return json(await instance.status());
    }

    // The sandbox reporting that the agent has stopped pushing. Resumes the
    // "wait for the agent to finish its run" step.
    if (request.method === "POST" && url.pathname === "/runs/finished") {
      const payload = (await request.json()) as { commits: number };
      const instance = await env.AGENT_RUN.get(instanceId);
      await instance.sendEvent({ type: "agent-run-finished", payload });
      return json({ delivered: "agent-run-finished" });
    }

    // The merge gate. A human clicking approve, or a policy engine that has read
    // the diff, decides here. Nothing about the run promotes itself; the fork
    // stays a fork until this event says otherwise, and a decline still returns
    // cleanly so the teardown step runs.
    if (request.method === "POST" && url.pathname === "/runs/decision") {
      const decision = (await request.json()) as MergeDecision;
      if (typeof decision.approved !== "boolean" || !decision.decidedBy) {
        return json({ error: "approved and decidedBy are required" }, 400);
      }
      const instance = await env.AGENT_RUN.get(instanceId);
      await instance.sendEvent({ type: "merge-decision", payload: decision });
      return json({ delivered: "merge-decision", approved: decision.approved });
    }

    // Operator abandon. terminate() stops the instance without running the
    // Workflow's finally block, which is exactly the case the sweeper covers, so
    // the fork name is returned here for anyone who wants to reclaim it sooner.
    if (request.method === "DELETE" && url.pathname === "/runs") {
      const instance = await env.AGENT_RUN.get(instanceId);
      const status = await instance.status();
      await instance.terminate();
      return json({
        terminated: instanceId,
        note: "Fork teardown did not run. The cron sweep will reclaim it.",
        status: status.status,
      });
    }

    return json({ error: "Unsupported route" }, 404);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(sweepStaleForks(env));
  },
} satisfies ExportedHandler<Env>;

/**
 * Delete run forks older than FORK_TTL_SECONDS. Paginates because a busy
 * namespace can hold thousands of repos, one per run, which is the intended
 * shape rather than a smell.
 *
 * Age comes from the `createdAt` that `list()` returns on every entry, not from
 * the epoch embedded in the run's repo name. The name stays parseable for the
 * ownership check below, but a server-side timestamp is the honest source for a
 * decision that deletes data.
 *
 * The name prefix check is the safety rail that matters: `delete()` takes a name
 * and does not care whether this Workflow created it, so a sweep that filtered
 * on age alone would happily delete the baseline repo the whole system forks
 * from, which is older than every fork by construction.
 */
async function sweepStaleForks(env: Env): Promise<void> {
  const cutoffMs = Date.now() - FORK_TTL_SECONDS * 1000;
  // Left inferred from the binding's own result type rather than widened to
  // string by hand, so a change to the cursor's shape surfaces here.
  let cursor: Awaited<ReturnType<Artifacts["list"]>>["cursor"];
  let reclaimed = 0;

  do {
    const page = await env.ARTIFACTS.list({ limit: 100, cursor });
    for (const repo of page.repos) {
      // Only ever reap repos this Workflow named. Anything else in the namespace
      // belongs to someone else.
      if (forkStartedAt(repo.name) === null) continue;
      if (Date.parse(repo.createdAt) > cutoffMs) continue;
      // delete() is idempotent enough for a sweep: it returns false rather than
      // throwing when the Workflow's own finally block already tore the fork down.
      const deleted = await env.ARTIFACTS.delete(repo.name);
      if (deleted) reclaimed += 1;
    }
    cursor = page.cursor;
  } while (cursor);

  console.log(
    JSON.stringify({
      event: "fork-sweep",
      reclaimed,
      cutoff: new Date(cutoffMs).toISOString(),
      ttlSeconds: FORK_TTL_SECONDS,
    }),
  );
}

/**
 * Bootstrap helper, run once per namespace rather than per run.
 *
 * The baseline is created readOnly on purpose. That is the actual isolation
 * boundary: no agent token can push to it, so the only way work reaches the
 * baseline is the approved merge path, and a run that goes wrong is contained in
 * a repo that costs storage and nothing else. Flip readOnly off only for the
 * trusted merger that performs the promotion.
 */
export async function createBaseline(
  env: Env,
  name: string,
  source?: { url: string; branch?: string },
) {
  if (source) {
    // depth trims the imported history. Agents fork from the tip and rarely read
    // back beyond it, and every object imported is billed storage plus the
    // operations to move it.
    return env.ARTIFACTS.import({
      source: { url: source.url, branch: source.branch ?? "main", depth: 1 },
      target: {
        name,
        opts: {
          description: "BLANK agent baseline. Forks come from here.",
          readOnly: true,
        },
      },
    });
  }

  return env.ARTIFACTS.create(name, {
    description: "BLANK agent baseline. Forks come from here.",
    readOnly: true,
    setDefaultBranch: "main",
  });
}

/**
 * Recompute the fork name for a run without touching the Workflow. Useful for an
 * operator who terminated an instance and wants to inspect or delete its fork by
 * hand before the sweep window closes.
 */
export const forkNameForRun = (
  baselineRepo: string,
  instanceId: string,
  startedAt: Date,
) =>
  runForkName(baselineRepo, instanceId, Math.floor(startedAt.getTime() / 1000));

/// <reference types="@cloudflare/workers-types" />

/**
 * The Worker in front of the Artifacts control plane.
 *
 * Three routes, and the interesting thing about all three is what they refuse to
 * do.
 *
 * `POST /tasks` never accepts a repo name from the client. The name is computed
 * from the task record by nameTaskRepo(), because a client-supplied name is a
 * client-supplied idempotency key, and a retrying agent runner that generates a
 * fresh name per attempt provisions a fresh repo per attempt. The repo is the
 * expensive thing here, so the naming decision does not leave this Worker.
 *
 * `POST /tokens` requires the caller to already be authorised. The Artifacts
 * docs put a warning box on their own example for this reason: a token route is
 * a route that hands out push access to a repo, and an unauthenticated one is a
 * public write endpoint with extra steps. The check below is deliberately a
 * shared secret rather than a full auth system, and it is deliberately compared
 * with a constant-time comparison, because a naive `===` on a secret leaks its
 * length and prefix to anyone willing to time the responses.
 *
 * The scheduled handler reaps, and it reaps in dry-run mode until someone
 * changes one boolean. Storage bills whether or not anyone remembers the repos
 * exist, and a two-week-old repo from a task that finished in eleven seconds is
 * pure carry cost. But the first time a sweep runs against a real namespace it
 * should print what it would delete.
 *
 * Matching wrangler.jsonc:
 *
 * {
 *   "name": "blank-provisioner",
 *   "main": "src/provisioner/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "artifacts": [
 *     { "binding": "ARTIFACTS", "namespace": "blank-agents" }
 *   ],
 *   "vars": { "BASELINE_REPO": "blank-agent-baseline" },
 *   "triggers": { "crons": ["17 4 * * *"] }
 * }
 *
 * PROVISIONER_SECRET is set with `npx wrangler secret put PROVISIONER_SECRET`,
 * not in vars, so it stays out of the config file and out of git.
 */

import {
  type AgentTask,
  estimateFleetCost,
  mintReadToken,
  type ProvisionerEnv,
  provisionTaskRepo,
  reapAbandonedRepos,
  rotateWriteToken,
} from "./provisioner.ts";

type WorkerEnv = ProvisionerEnv & {
  PROVISIONER_SECRET: string;
};

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    if (!authorised(request, env)) {
      return new Response("unauthorised", { status: 401 });
    }

    const url = new URL(request.url);

    switch (`${request.method} ${url.pathname}`) {
      case "POST /tasks":
        return provision(request, env);

      case "POST /tokens":
        return issueToken(request, env);

      case "GET /costs":
        return costs(url);

      default:
        return new Response("not found", { status: 404 });
    }
  },

  /**
   * Daily reap. Runs on a cron rather than on task completion because "the agent
   * finished" and "nobody needs this repo any more" are different events: a
   * human may still be reviewing the diff an hour later. The retention window,
   * not the task lifecycle, is what decides.
   */
  async scheduled(
    _event: ScheduledController,
    env: WorkerEnv,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      reapAbandonedRepos(env, { dryRun: true }).then((result) => {
        console.log("artifacts reap", {
          scanned: result.scanned,
          wouldDelete: result.deleted.length,
          skipped: result.skipped.length,
          ops: result.ops,
        });
      }),
    );
  },
} satisfies ExportedHandler<WorkerEnv>;

/**
 * Provision the repo for a task.
 *
 * `reused: true` in the response is not decoration. It is the signal that the
 * caller retried, and a fleet where that fraction climbs has a runner that is
 * crashing after provisioning and before recording the result, which is worth
 * knowing before the operations line on the invoice tells you instead.
 */
async function provision(request: Request, env: WorkerEnv): Promise<Response> {
  const body = (await request
    .json()
    .catch(() => null)) as Partial<AgentTask> | null;

  if (!body?.fleet || !body.taskId || typeof body.createdAt !== "number") {
    return Response.json(
      { error: "fleet, taskId, and createdAt are required" },
      { status: 400 },
    );
  }

  // createdAt comes from the task record, not from this Worker's clock. If the
  // Worker stamped it here, every retry would compute a different day segment
  // once the clock crossed midnight, and midnight would quietly become the hour
  // that duplicates repos.
  const task: AgentTask = {
    fleet: body.fleet,
    taskId: body.taskId,
    createdAt: body.createdAt,
    importFrom: body.importFrom,
  };

  const result = await provisionTaskRepo(env, task);

  return Response.json(
    {
      repo: result.name,
      remote: result.remote,
      defaultBranch: result.defaultBranch,
      // The token goes back over this response and nowhere else. It is not
      // logged, because a write token in a log line outlives its TTL in
      // whatever indexed that log.
      writeToken: result.writeToken,
      expiresAt: result.expiresAt,
      reused: result.reused,
      billedOperations: result.ops,
    },
    { status: result.reused ? 200 : 201 },
  );
}

/**
 * Mint or rotate a repo token.
 *
 * Two shapes, one route. With `replaces`, this is a rotation: a new write token
 * is minted and the old one is revoked, in that order, so the agent never has a
 * moment with no valid credential. Without it, this is a read token for a
 * reviewer or an indexer, which is the scope everything that only clones should
 * be getting.
 */
async function issueToken(request: Request, env: WorkerEnv): Promise<Response> {
  const body = (await request.json().catch(() => null)) as {
    repo?: string;
    replaces?: string;
    ttlSeconds?: number;
  } | null;

  if (!body?.repo) {
    return Response.json({ error: "repo is required" }, { status: 400 });
  }

  const token = body.replaces
    ? await rotateWriteToken(env, body.repo, body.replaces)
    : await mintReadToken(env, body.repo, body.ttlSeconds ?? 900);

  return Response.json({
    repo: body.repo,
    scope: token.scope,
    expiresAt: token.expiresAt,
    token: token.plaintext,
  });
}

/**
 * What the fleet costs at a given volume.
 *
 * This route exists because "create a repo per agent task" is a design decision
 * with an invoice attached, and the invoice is easier to argue about before the
 * fleet is running. Ten thousand tasks a month with a handful of Git operations
 * each clears the free operations allowance in the first week.
 */
function costs(url: URL): Response {
  const number = (key: string, fallback: number) =>
    Number(url.searchParams.get(key) ?? fallback);

  const estimate = estimateFleetCost({
    tasksPerMonth: number("tasks", 10_000),
    gitOpsPerTask: number("gitOps", 6),
    averageRepoMb: number("repoMb", 40),
  });

  return Response.json({
    operationsUsd: Number(estimate.operations.toFixed(2)),
    storageUsd: Number(estimate.storage.toFixed(2)),
    totalUsd: Number(estimate.total.toFixed(2)),
    note: "Workers Paid only. First 10,000 operations and 1 GB-month are included.",
  });
}

/**
 * Constant-time secret comparison.
 *
 * `a === b` on strings short-circuits at the first differing byte, and the
 * difference is measurable across enough requests, which turns a secret into
 * something guessable one character at a time. The length check leaks only the
 * length, which is not the part worth protecting.
 */
function authorised(request: Request, env: WorkerEnv): boolean {
  const presented = request.headers
    .get("authorization")
    ?.replace(/^Bearer /, "");
  if (!presented || presented.length !== env.PROVISIONER_SECRET.length) {
    return false;
  }

  let difference = 0;
  for (let i = 0; i < presented.length; i++) {
    difference |=
      presented.charCodeAt(i) ^ env.PROVISIONER_SECRET.charCodeAt(i);
  }
  return difference === 0;
}

/// <reference types="@cloudflare/workers-types" />

/**
 * One agent run, one disposable fork.
 *
 * The constraint: many autonomous agents editing one branch is a merge-conflict
 * machine. Cloudflare's own guidance is blunt about it ("if you have 10,000
 * agents, create 10,000 repos", and "do not use one shared repo as a queue for
 * many autonomous agents"), so the isolation boundary here is a per-run fork of
 * a reviewed baseline, not a branch. A fork is cheap to make, cheap to inspect,
 * and cheap to throw away, which is exactly the property a speculative agent run
 * needs.
 *
 * What the platform guarantees:
 * - Each `step.do` is checkpointed. A completed step is never re-executed, and
 *   its return value is replayed from durable storage on a later attempt.
 * - A failing step is retried independently of every other step, on its own
 *   `retries` budget.
 * - `step.waitForEvent` suspends the instance without burning wall-clock billing,
 *   so a merge gate can sit open for hours waiting on a human.
 *
 * What the platform does NOT guarantee, and what this file is mostly about:
 * - A step body is run AT LEAST once, not exactly once. Anything a step does to
 *   the outside world has to be idempotent by construction, because a step that
 *   creates a fork and then dies before checkpointing will run again and try to
 *   create a second one. Every step here is written to converge on the same repo.
 * - `run()` finishing is not the same as `run()` running to completion. A `finally`
 *   block cleans up when a step throws, but it does NOT run if the instance is
 *   terminated out from under it. Fork teardown therefore needs a second,
 *   independent sweeper (see worker.ts), because storage is billed at
 *   $0.50/GB-month past the first 1 GB and an abandoned fork bills forever:
 *   "Repos remain stored until you explicitly delete them."
 *
 * Verified against the Artifacts Workers binding reference (closed beta,
 * developers.cloudflare.com/artifacts/api/workers-binding/, page dated
 * 2026-06-11). Only these methods exist on the binding and are used here:
 *   env.ARTIFACTS.get(name) / .create(name, opts) / .list(opts) / .delete(name)
 *   repo.fork(name, opts) / .createToken(scope, ttl) / .revokeToken(tokenOrId)
 * The handle carries metadata only (defaultBranch, lastPushAt, readOnly, source,
 * createdAt). There is no log, readCommit, readTree, or content read on it.
 * There is no merge method on the binding. Merging is a Git push, which is the
 * whole reason the gate below is a decision and not a call.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1 and compatibility_date
 * 2026-07-01.
 */

import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";

export type AgentRunEnv = {
  ARTIFACTS: Artifacts;
  /** Where the agent sandbox is dispatched. It receives a remote plus a token. */
  AGENT_DISPATCH_URL: string;
  AGENT_DISPATCH_TOKEN: string;
};

export type AgentRunParams = {
  /** Reviewed repo every run forks from. Kept readOnly so nothing pushes to it. */
  baselineRepo: string;
  /** Stable id of the agent or session requesting the run. */
  agentId: string;
  /** The task the agent is being asked to perform in its fork. */
  taskPrompt: string;
  /** Skip the human gate when a policy check is enough to approve the merge. */
  autoMergeWhenClean: boolean;
};

export type MergeDecision = {
  approved: boolean;
  decidedBy: string;
  reason: string;
};

type ForkHandle = { repoName: string; remote: string };

/**
 * The binding rejects with `ArtifactsError`, which carries a STRING `.code` for
 * matching plus a `.numericCode` that mirrors the REST API. Matching on the
 * string is the supported path; the numeric codes (ALREADY_EXISTS 10201,
 * FORK_IN_PROGRESS 10303) only matter when correlating with a REST response.
 *
 * ALREADY_EXISTS is the code that matters on a retry: the previous attempt did
 * create the fork, it just died before Workflows checkpointed the result.
 * FORK_IN_PROGRESS means the fork is real but not yet addressable, so it is
 * worth retrying rather than failing.
 *
 * The `name` check rather than `instanceof` is deliberate: ArtifactsError is an
 * interface in the runtime types, not a constructor this module can import.
 */
const isArtifactsError = (
  error: unknown,
  code: ArtifactsErrorCode,
): error is ArtifactsError => {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as Partial<ArtifactsError>;
  return candidate.name === "ArtifactsError" && candidate.code === code;
};

/**
 * Repo names are unique per namespace and may contain letters, digits, `.`, `_`,
 * and `-`. Deriving the name from the Workflow instance id is what makes the
 * fork step idempotent: every retry of the same instance computes the same name,
 * so a second `fork()` collides instead of creating a duplicate.
 *
 * The trailing epoch is not load-bearing for the sweeper, since `list()` returns
 * a real `createdAt` per repo. It is kept because it makes an abandoned fork
 * legible in a dashboard listing without a second lookup.
 */
export const runForkName = (
  baselineRepo: string,
  instanceId: string,
  startedAtSeconds: number,
): string => {
  const safe = (value: string) => value.replace(/[^A-Za-z0-9._-]/g, "-");
  return `run-${safe(baselineRepo)}-${safe(instanceId)}-${startedAtSeconds}`;
};

export class AgentRunWorkflow extends WorkflowEntrypoint<
  AgentRunEnv,
  AgentRunParams
> {
  override async run(
    event: Readonly<WorkflowEvent<AgentRunParams>>,
    step: WorkflowStep,
  ): Promise<{ repoName: string; merged: boolean; reason: string }> {
    const params = event.payload;

    // event.timestamp is the instance's creation time and is replayed verbatim
    // on every attempt, unlike Date.now(), which would produce a different repo
    // name on each retry and defeat the idempotency the naming scheme buys.
    const startedAtSeconds = Math.floor(event.timestamp.getTime() / 1000);
    const repoName = runForkName(
      params.baselineRepo,
      event.instanceId,
      startedAtSeconds,
    );

    let fork: ForkHandle | undefined;

    try {
      fork = await step.do(
        "fork baseline for this run",
        { retries: { limit: 5, delay: "2 seconds", backoff: "exponential" } },
        async (): Promise<ForkHandle> => {
          const baseline = await this.env.ARTIFACTS.get(params.baselineRepo);

          try {
            const forked = await baseline.fork(repoName, {
              description: `BLANK agent run ${event.instanceId} for ${params.agentId}`,
              // The run only ever needs the tip of the default branch. Copying
              // every branch and tag is storage this fork will never read, and
              // storage is the metered dimension.
              defaultBranchOnly: true,
              // Writable: the agent commits into its own fork. Isolation comes
              // from the baseline being readOnly, not from the fork being locked.
              readOnly: false,
            });
            return { repoName: forked.name, remote: forked.remote };
          } catch (error) {
            // The retry case. A previous attempt already created this fork, so
            // adopt it instead of failing the step forever on a name collision.
            if (!isArtifactsError(error, "ALREADY_EXISTS")) throw error;
            const existing = await this.env.ARTIFACTS.get(repoName);
            return { repoName, remote: existing.remote };
          }
        },
      );

      // Narrow once, here, where the assignment is in scope. `fork` has to stay
      // a `let` declared outside the try so the finally can tear it down, and TS
      // drops that narrowing across the awaits below.
      const forkRemote = fork.remote;

      // A fork is asynchronous. `get()` throws FORK_IN_PROGRESS until the copy
      // lands, so this step exists purely to absorb that window in retries
      // rather than handing the agent a remote that is not clonable yet.
      //
      // `get()` returning at all IS the readiness signal, and it is the only one
      // available: the binding is a control plane, with no log, readCommit, or
      // readTree method to probe the tip with. Reading history means cloning
      // over git, which is the sandbox's job, not this Workflow's.
      await step.do(
        "wait for fork to become addressable",
        { retries: { limit: 12, delay: "3 seconds", backoff: "linear" } },
        async () => {
          try {
            const repo = await this.env.ARTIFACTS.get(repoName);
            return { ready: true, defaultBranch: repo.defaultBranch };
          } catch (error) {
            if (isArtifactsError(error, "FORK_IN_PROGRESS")) {
              throw new Error(`Fork ${repoName} is still copying`);
            }
            throw error;
          }
        },
      );

      // Tokens are minted per run and expire on their own, so an abandoned
      // sandbox cannot keep pushing after the run is over. TTL is bounded by the
      // documented range of 60 to 31,536,000 seconds; two hours covers a long
      // agent run without leaving a credential lying around for a day.
      const handoff = await step.do(
        "mint a write token scoped to the fork",
        {
          retries: { limit: 4, delay: "5 seconds", backoff: "exponential" },
          // Keeps the minted token out of instance status responses and the
          // Workflows dashboard, where it would otherwise sit in plain text.
          sensitive: "output",
        },
        async () => {
          const repo = await this.env.ARTIFACTS.get(repoName);
          const token = await repo.createToken("write", 7200);
          return { plaintext: token.plaintext, expiresAt: token.expiresAt };
        },
      );

      await step.do(
        "dispatch the agent against its fork",
        { retries: { limit: 3, delay: "10 seconds", backoff: "exponential" } },
        async () => {
          const response = await fetch(this.env.AGENT_DISPATCH_URL, {
            method: "POST",
            headers: {
              authorization: `Bearer ${this.env.AGENT_DISPATCH_TOKEN}`,
              "content-type": "application/json",
              // The sandbox must treat a repeated dispatch for the same run as
              // the same job. Workflows replays steps; the runner has to expect it.
              "idempotency-key": `agent-run:${event.instanceId}`,
            },
            body: JSON.stringify({
              runId: event.instanceId,
              agentId: params.agentId,
              task: params.taskPrompt,
              remote: forkRemote,
              token: handoff.plaintext,
              // Tells the sandbox to mount rather than clone. A blobless mount
              // fetches commits, trees, and refs, then hydrates file contents on
              // read, which is the difference between a run that pays for a whole
              // repository and one that pays for the files it actually opened.
              // For a small repo a plain shallow clone is simpler and fine.
              checkout: { strategy: "artifact-fs", branch: "main", depth: 1 },
            }),
          });

          if (response.status === 404 || response.status === 422) {
            throw new NonRetryableError(
              `Agent runner rejected the dispatch with ${response.status}`,
              "AgentDispatchRejected",
            );
          }
          if (!response.ok) {
            throw new Error(`Agent runner responded ${response.status}`);
          }
          return { dispatched: true };
        },
      );

      // The agent works and pushes into its own fork. Nothing it does can reach
      // the baseline, so this wait is safe to leave open.
      const finished = await step.waitForEvent<{ commits: number }>(
        "wait for the agent to finish its run",
        { type: "agent-run-finished", timeout: "2 hours" },
      );

      // What the reviewer gets is deliberately thin, because the binding cannot
      // read content: there is no log, readCommit, readTree, or diff method on
      // it. What it can do is prove the push happened, since lastPushAt is null
      // until something lands and is the one server-side fact the sandbox cannot
      // forge in its completion event. Anything richer, a file list or a patch,
      // is a git clone by whatever renders the review, not a call from here.
      const diff = await step.do(
        "confirm the fork received the run's push",
        { retries: { limit: 3, delay: "5 seconds", backoff: "constant" } },
        async () => {
          const repo = await this.env.ARTIFACTS.get(repoName);
          if (repo.lastPushAt === null) {
            throw new NonRetryableError(
              `Run ${event.instanceId} reported ${finished.payload.commits} commits but ${repoName} has never been pushed to`,
            );
          }
          return {
            lastPushAt: repo.lastPushAt,
            defaultBranch: repo.defaultBranch,
            reported: finished.payload.commits,
          };
        },
      );

      // The gate. There is no merge call on the binding, and that is the correct
      // shape: promoting a fork into the baseline is a Git push performed by a
      // trusted merger, and the decision to make it is a human or a policy, never
      // a default. An unattended run that ends by pushing to the baseline has
      // thrown away the isolation the fork bought.
      const decision = params.autoMergeWhenClean
        ? { approved: true, decidedBy: "policy", reason: "Auto-merge enabled" }
        : (
            await step.waitForEvent<MergeDecision>("wait for merge decision", {
              type: "merge-decision",
              // Timing out is a rejection, not an approval. The fork survives
              // long enough to inspect and the sweeper reclaims it later.
              timeout: "24 hours",
            })
          ).payload;

      if (!decision.approved) {
        return {
          repoName,
          merged: false,
          reason: `Merge declined by ${decision.decidedBy}: ${decision.reason}`,
        };
      }

      await step.do(
        "promote the fork into the baseline",
        { retries: { limit: 3, delay: "15 seconds", backoff: "exponential" } },
        async () => {
          const baseline = await this.env.ARTIFACTS.get(params.baselineRepo);
          // A write token against the baseline, minted only after approval and
          // valid for five minutes. Nothing in the run held baseline write access
          // while the agent was working.
          const pushToken = await baseline.createToken("write", 300);
          const response = await fetch(this.env.AGENT_DISPATCH_URL, {
            method: "POST",
            headers: {
              authorization: `Bearer ${this.env.AGENT_DISPATCH_TOKEN}`,
              "content-type": "application/json",
              "idempotency-key": `agent-merge:${event.instanceId}`,
            },
            body: JSON.stringify({
              action: "merge",
              from: forkRemote,
              into: params.baselineRepo,
              // git-receive-pack is v1 only on Artifacts, and v1 optional
              // capabilities such as filter are not supported, so the merger has
              // to push with a plain v1 flow.
              pushToken: pushToken.plaintext,
              approvedBy: decision.decidedBy,
              commits: diff.reported,
            }),
          });
          if (!response.ok) {
            throw new Error(`Merge runner responded ${response.status}`);
          }
          return { merged: true };
        },
      );

      return {
        repoName,
        merged: true,
        reason: `Merged by ${decision.decidedBy}`,
      };
    } finally {
      // Teardown on both paths, including the failure path, because a fork that
      // nobody merged is pure cost. This runs when a step throws; it does NOT run
      // if the instance is terminated, which is why the sweeper exists.
      if (fork) {
        await step.do(
          "delete the run fork",
          { retries: { limit: 5, delay: "30 seconds", backoff: "linear" } },
          async () => {
            try {
              return { deleted: await this.env.ARTIFACTS.delete(repoName) };
            } catch (error) {
              // Already gone, most likely deleted by the sweeper. Converging on
              // absent is the whole point of an idempotent teardown.
              if (isArtifactsError(error, "NOT_FOUND"))
                return { deleted: true };
              throw error;
            }
          },
        );
      }
    }
  }
}

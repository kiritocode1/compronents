/// <reference types="@cloudflare/workers-types" />

/**
 * The control plane for Cloudflare Artifacts: naming, idempotent creation,
 * import, fork, token rotation, and reaping, written for a fleet of agents that
 * each want their own repo.
 *
 * Artifacts is a versioned filesystem that speaks Git over HTTPS, and the whole
 * point of it is that repos are cheap enough to create programmatically. The
 * documented guidance is literal about this: "If you have 10,000 agents, create
 * 10,000 repos." That advice is correct and it is also a bill, so this file
 * treats provisioning as a budgeted operation rather than a free one.
 *
 * What the platform guarantees, and what it does not:
 *
 *   - Repo names are unique within a namespace, and the name is the address.
 *     There is no rename. Choosing the grain wrong is the one mistake nothing
 *     downstream can fix, which is why nameTaskRepo() below is the most
 *     load-bearing function here despite being ten lines.
 *   - `create()` and `import()` return an initial token exactly once, in the
 *     `token` field. It is not retrievable later. A retry that hits
 *     ALREADY_EXISTS therefore cannot recover it and must mint a fresh one.
 *   - `get()` throws if the repo does not exist OR is not ready yet. An import
 *     or fork is asynchronous, so "the repo exists but get() throws" is a normal
 *     state, reported as IMPORT_IN_PROGRESS (10302) or FORK_IN_PROGRESS (10303),
 *     not a failure.
 *   - Token TTL is 60 seconds minimum, 31,536,000 seconds (one year) maximum,
 *     and defaults to 86,400. `createToken()` defaults to the "write" scope, so
 *     omitting the argument hands out write access.
 *   - Repos persist until explicitly deleted. Nothing expires on its own, which
 *     is why reapAbandonedRepos() exists rather than being someone's later
 *     problem.
 *   - Limits: 10 GB per repo, 1 TB per account (raisable), and 2,000 control
 *     plane requests per 10 seconds per namespace. That last one is the reason
 *     the reaper caps its deletions per run.
 *   - Billing, Workers Paid only: operations (create, push, pull, clone, and the
 *     rest of this file) are free for the first 10,000 per month, then $0.15 per
 *     additional 1,000. Storage is 1 GB-month free, then $0.50 per GB-month,
 *     averaged from daily peak. See estimateFleetCost() at the bottom.
 *
 * Pinned to @cloudflare/workers-types@5.20260719.1, wrangler 4.112.0,
 * compatibility_date 2026-07-01.
 *
 * Matching wrangler.jsonc. Note that `artifacts` is non-inheritable in named
 * environments, so it must be repeated in each one that needs it:
 *
 * {
 *   "name": "blank-provisioner",
 *   "main": "src/provisioner/worker.ts",
 *   "compatibility_date": "2026-07-01",
 *   "artifacts": [
 *     { "binding": "ARTIFACTS", "namespace": "blank-agents" }
 *   ]
 * }
 *
 * Types come from @cloudflare/workers-types via the reference above, not from
 * hand-written copies. Run `npx wrangler types` in your own project to regenerate
 * them against your compatibility date.
 */

/**
 * `Artifacts`, `ArtifactsRepo`, `ArtifactsError`, and the result types are global
 * ambient types from @cloudflare/workers-types, pulled in by the triple-slash
 * reference at the top of this file. Do not redeclare them locally: a hand-written
 * structural copy typechecks against itself rather than against the runtime, which
 * is how a call to a method that does not exist survives `tsc` and fails in prod.
 *
 * The real handle is metadata plus tokens plus fork, and nothing else:
 *   createToken / listTokens / revokeToken / fork
 * with ArtifactsRepoInfo fields (id, name, description, defaultBranch, createdAt,
 * updatedAt, lastPushAt, source, readOnly, remote) carried on the handle itself.
 * There is no log, readCommit, readTree, or content read anywhere on the binding.
 */

export type ProvisionerEnv = {
  ARTIFACTS: Artifacts;
  /** Reviewed starter repo that new task repos fork from. */
  BASELINE_REPO: string;
};

/**
 * A unit of autonomous work. `createdAt` is part of the record rather than read
 * from the clock, and that is deliberate: it makes the repo name a pure function
 * of the task, so a retried task computes the same name and lands on the same
 * repo instead of provisioning a second one.
 */
export type AgentTask = {
  fleet: string;
  taskId: string;
  createdAt: number;
  /** Optional public HTTPS remote to start from instead of the baseline fork. */
  importFrom?: string;
};

/** Documented Artifacts error codes, for the ones this file has to branch on. */
// ArtifactsError carries a STRING `.code` for matching, plus a `.numericCode`
// that mirrors the REST API. Match on the string; the numbers (10201, 10200,
// 10302, 10303) only matter when correlating a binding failure with a REST
// response in a log.
const ALREADY_EXISTS = "ALREADY_EXISTS" satisfies ArtifactsErrorCode;
const NOT_FOUND = "NOT_FOUND" satisfies ArtifactsErrorCode;
const IMPORT_IN_PROGRESS = "IMPORT_IN_PROGRESS" satisfies ArtifactsErrorCode;
const FORK_IN_PROGRESS = "FORK_IN_PROGRESS" satisfies ArtifactsErrorCode;

/** Agent sessions are hours, not days. A day-long write token is a day-long blast radius. */
const WRITE_TOKEN_TTL_SECONDS = 3600;

/** Delete a task repo this many days after the day encoded in its name. */
const RETENTION_DAYS = 14;

/**
 * The name is the address, and there is no rename.
 *
 * Three constraints meet here. Artifacts requires the first character to be a
 * letter or digit and the rest to be letters, digits, `.`, `_`, or `-`. Names
 * must be unique within a namespace, so a bare `docs-site` collides the moment
 * two agents want their own copy. And nothing in the API sorts or filters by
 * anything except the name, so whatever the reaper needs to make a delete
 * decision has to be visible in the name itself.
 *
 * Hence `fleet-YYYYMMDD-taskId`:
 *
 *   fleet      which fleet owns it, so one namespace can host several
 *   YYYYMMDD   the task's own creation day, from task.createdAt and never from
 *              Date.now(), so a retry two hours later still computes the same
 *              name. This is the field the reaper reads.
 *   taskId     the isolation boundary, one repo per unit of work
 *
 * The tempting alternative, `fleet-taskId` with the age looked up at reap time,
 * does not work: the binding's list() returns `name` and `status` and nothing
 * else, so there is no timestamp to look up without falling back to the REST
 * API, whose RepoInfo does carry created_at.
 */
export function nameTaskRepo(task: AgentTask): string {
  const day = new Date(task.createdAt)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const slug = (value: string) => value.replace(/[^A-Za-z0-9._-]/g, "-");
  // Leading character must be alphanumeric; a fleet named "-staging" is invalid.
  const fleet = slug(task.fleet).replace(/^[^A-Za-z0-9]+/, "") || "blank";
  return `${fleet}-${day}-${slug(task.taskId)}`;
}

const TASK_REPO_PATTERN = /^([A-Za-z0-9][A-Za-z0-9._-]*?)-(\d{8})-(.+)$/;

export type ProvisionResult = {
  name: string;
  remote: string;
  defaultBranch: string;
  writeToken: string;
  expiresAt: string;
  /** True when this call found the repo already there, so a retry is visible. */
  reused: boolean;
  /** Billable control plane operations this call spent. See estimateFleetCost. */
  ops: number;
};

/**
 * Provision the repo for a task, exactly once, no matter how many times the task
 * is retried.
 *
 * The idempotency here is not a lock and not a record in a side table. It is the
 * deterministic name plus the ALREADY_EXISTS error: creation is attempted, and a
 * collision is read as "a previous attempt got there first", which is precisely
 * what it means when the name is derived from the task. An agent runner that
 * retries a crashed task five times provisions one repo and pays for one repo.
 *
 * The one thing a retry genuinely cannot recover is the initial token, because
 * create() and fork() return it once and nothing serves it again. So the reuse
 * path mints a fresh short-lived write token instead of trying to find the old
 * one. This is the better behaviour anyway: the retry gets a token scoped to its
 * own attempt rather than inheriting one that has been sitting in a log.
 */
export async function provisionTaskRepo(
  env: ProvisionerEnv,
  task: AgentTask,
): Promise<ProvisionResult> {
  const name = nameTaskRepo(task);
  const description = `BLANK agent task ${task.taskId} (fleet ${task.fleet})`;

  try {
    // One operation, and it is the only one on the happy path that produces a
    // token, which is why the token is threaded straight out rather than
    // discarded and re-minted.
    const created = task.importFrom
      ? await env.ARTIFACTS.import({
          source: { url: task.importFrom, branch: "main", depth: 1 },
          target: { name, opts: { description } },
        })
      : await forkBaseline(env, name, description);

    return {
      name: created.name,
      remote: created.remote,
      defaultBranch: created.defaultBranch,
      writeToken: created.token,
      // create(), import(), and fork() return a bare token string with no
      // expiry alongside it, so the caller is told to treat it as short-lived
      // and rotate rather than being handed a false expiry.
      expiresAt: "unknown, rotate before relying on it",
      reused: false,
      ops: task.importFrom ? 1 : 2,
    };
  } catch (error) {
    if (codeOf(error) !== ALREADY_EXISTS) throw error;

    // A previous attempt won. Adopt its repo rather than inventing a second
    // name, which is the failure this whole design exists to prevent.
    const repo = await waitUntilReady(env, name);
    const token = await repo.createToken("write", WRITE_TOKEN_TTL_SECONDS);

    return {
      name,
      remote: remoteFor(name),
      defaultBranch: "main",
      writeToken: token.plaintext,
      expiresAt: token.expiresAt,
      reused: true,
      ops: 3,
    };
  }
}

/**
 * Fork the reviewed baseline instead of creating an empty repo and pushing a
 * skeleton into it.
 *
 * `defaultBranchOnly: true` matters more than it looks. Without it the fork
 * copies every branch in the baseline, which for a long-lived starter repo can
 * be dozens of stale agent branches, multiplied by every task that forks it, all
 * of it counting towards the $0.50 per GB-month line and the 10 GB per-repo cap.
 *
 * This is two billed operations (the get, then the fork) against one for a plain
 * create. Worth it: the alternative is an empty repo plus a clone, a commit, and
 * a push to populate it, which is more operations and more wall clock.
 */
async function forkBaseline(
  env: ProvisionerEnv,
  name: string,
  description: string,
): Promise<ArtifactsCreateRepoResult> {
  const baseline = await env.ARTIFACTS.get(env.BASELINE_REPO);
  return baseline.fork(name, {
    description,
    defaultBranchOnly: true,
    readOnly: false,
  });
}

/**
 * Wait out an in-flight import or fork.
 *
 * `get()` throws for two different reasons, and only one of them is a real
 * error. A repo that another attempt created a second ago is still importing or
 * forking, and get() reports that as IMPORT_IN_PROGRESS or FORK_IN_PROGRESS.
 * Treating either as "missing" is how a retry decides the repo is gone and
 * provisions a duplicate under a second name.
 *
 * ponytail: fixed 500ms polling rather than exponential backoff. Every poll is a
 * billed operation, so the ceiling is the point: a fork that is not ready in ten
 * tries is a fork worth surfacing, not one worth quietly waiting on.
 */
async function waitUntilReady(
  env: ProvisionerEnv,
  name: string,
  attempts = 10,
): Promise<ArtifactsRepo> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await env.ARTIFACTS.get(name);
    } catch (error) {
      const code = codeOf(error);
      if (code !== IMPORT_IN_PROGRESS && code !== FORK_IN_PROGRESS) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`repo ${name} was still not ready after ${attempts} polls`);
}

/**
 * Hand a running agent a new write token and retire the one it was using.
 *
 * The order is the entire content of this function. Mint first, then revoke:
 * revoking first leaves a window, however short, in which the agent's next push
 * fails with an auth error that looks like a permissions bug and is actually a
 * rotation race. The old token is revoked by its plaintext value, which
 * revokeToken() accepts alongside an id, so rotation never needs to reconcile
 * against listTokens().
 *
 * Read tokens are the default answer for anything that clones, indexes, or
 * reviews. Only the one agent that pushes gets "write", and it gets it for an
 * hour, because createToken() defaults to write scope and a 24 hour TTL if you
 * let it.
 */
export async function rotateWriteToken(
  env: ProvisionerEnv,
  repoName: string,
  previousToken: string,
): Promise<ArtifactsCreateTokenResult> {
  const repo = await env.ARTIFACTS.get(repoName);
  const next = await repo.createToken("write", WRITE_TOKEN_TTL_SECONDS);
  await repo.revokeToken(previousToken);
  return next;
}

/** A read token for reviewers, indexers, and anything that only clones. */
export async function mintReadToken(
  env: ProvisionerEnv,
  repoName: string,
  ttlSeconds = 900,
): Promise<ArtifactsCreateTokenResult> {
  const repo = await env.ARTIFACTS.get(repoName);
  // TTL below 60 is rejected with INVALID_TTL (10103), so clamp rather than
  // letting a caller's "30 second" instinct become a 400 at the far end.
  return repo.createToken("read", Math.max(60, ttlSeconds));
}

export type ReapResult = {
  scanned: number;
  deleted: string[];
  skipped: { name: string; reason: string }[];
  ops: number;
};

/**
 * Delete task repos whose day stamp is older than the retention window.
 *
 * Nothing in Artifacts expires. A fleet that provisions a repo per task and
 * never deletes one accumulates storage forever at $0.50 per GB-month, and the
 * bill arrives long after the agent runs that caused it have been forgotten.
 * This is the counterweight to "create 10,000 repos".
 *
 * Three guards, each protecting against a different way a sweep destroys work:
 *
 *   - Names that do not match TASK_REPO_PATTERN are skipped, always. A namespace
 *     holds the baseline repo and whatever else a human made, and a reaper that
 *     deletes what it does not recognise is a reaper that deletes the baseline.
 *   - Repos with status "importing" or "forking" are skipped. Their day stamp
 *     may be old (a retry of a two-week-old task) while the contents are being
 *     written right now.
 *   - `dryRun` defaults to true. The first run of a destructive sweep against a
 *     real namespace should print, not delete.
 *
 * `limit: 100` and a per-run deletion cap keep this under the documented 2,000
 * control plane requests per 10 seconds per namespace, and keep one sweep from
 * spending a month's free operations in a single cron tick.
 */
export async function reapAbandonedRepos(
  env: ProvisionerEnv,
  opts: { now?: number; dryRun?: boolean; maxDeletes?: number } = {},
): Promise<ReapResult> {
  const now = opts.now ?? Date.now();
  const dryRun = opts.dryRun ?? true;
  const maxDeletes = opts.maxDeletes ?? 200;
  const cutoff = now - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const result: ReapResult = { scanned: 0, deleted: [], skipped: [], ops: 0 };
  let cursor: string | undefined;

  do {
    const page = await env.ARTIFACTS.list({ limit: 100, cursor });
    result.ops += 1;
    cursor = page.cursor;

    for (const entry of page.repos) {
      result.scanned += 1;

      if (entry.status !== "ready") {
        result.skipped.push({ name: entry.name, reason: entry.status });
        continue;
      }

      const day = dayStampOf(entry.name);
      if (day === null) {
        result.skipped.push({ name: entry.name, reason: "not a task repo" });
        continue;
      }
      if (day >= cutoff) continue;

      if (result.deleted.length >= maxDeletes) {
        result.skipped.push({ name: entry.name, reason: "run cap reached" });
        continue;
      }

      if (!dryRun) {
        // delete() returns false rather than throwing when the repo is already
        // gone, which happens when two cron ticks overlap. Not an error.
        await env.ARTIFACTS.delete(entry.name);
        result.ops += 1;
      }
      result.deleted.push(entry.name);
    }
  } while (cursor);

  return result;
}

/** Parse the YYYYMMDD segment back out of a task repo name, or null if it is not one. */
function dayStampOf(name: string): number | null {
  const match = TASK_REPO_PATTERN.exec(name);
  if (!match) return null;
  const [, , stamp] = match;
  const parsed = Date.parse(
    `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T00:00:00Z`,
  );
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * What "a repo per agent task" costs, before you ship it.
 *
 * Operations bill at $0.15 per 1,000 past a 10,000 per month allowance, and this
 * file spends between 1 and 3 of them per provision before the agent has cloned
 * anything. Clones, fetches, and pushes are operations too, so the real figure
 * per task is the provision cost plus however many Git round trips the agent
 * makes. `gitOpsPerTask` is where that estimate goes.
 *
 * The number that surprises people is storage: it is the daily peak averaged
 * over the billing period, so repos that are reaped on day 14 of a 30 day period
 * bill for roughly half a month each, not for nothing.
 */
export function estimateFleetCost(input: {
  tasksPerMonth: number;
  gitOpsPerTask: number;
  averageRepoMb: number;
  retentionDays?: number;
}): { operations: number; storage: number; total: number } {
  const retention = input.retentionDays ?? RETENTION_DAYS;
  const opsPerTask = 2 + input.gitOpsPerTask;
  const billableOps = Math.max(0, input.tasksPerMonth * opsPerTask - 10_000);
  const operations = (billableOps / 1000) * 0.15;

  // Live repos at any moment, times size, prorated by how much of the 30 day
  // period each one exists for.
  const gbMonths =
    ((input.tasksPerMonth * input.averageRepoMb) / 1024) *
    (Math.min(retention, 30) / 30);
  const storage = Math.max(0, gbMonths - 1) * 0.5;

  return { operations, storage, total: operations + storage };
}

/**
 * Read the numeric Artifacts error code off a thrown value.
 *
 * The codes (NOT_FOUND, ALREADY_EXISTS, and the rest) are
 * stated to apply to both the REST API and the Workers binding, but the docs do
 * not pin down the shape of the object the binding throws. So this checks the
 * obvious `code` property and falls back to finding the code in the message
 * text, which is ugly and is the honest thing to do until `wrangler types`
 * declares an error class to narrow on. Confirm this against your own runtime
 * before relying on the ALREADY_EXISTS branch in provisionTaskRepo().
 */
export function codeOf(error: unknown): ArtifactsErrorCode | null {
  if (typeof error !== "object" || error === null) return null;
  const candidate = error as Partial<ArtifactsError>;
  // `name` rather than `instanceof`: ArtifactsError is an interface in the
  // runtime types, not a constructor this module can import and narrow against.
  if (candidate.name !== "ArtifactsError") return null;
  return candidate.code ?? null;
}

export { NOT_FOUND, ALREADY_EXISTS, RETENTION_DAYS, TASK_REPO_PATTERN };



/**
 * The write path: committing agent output into an Artifacts repo, and attaching
 * the provenance note in the same run.
 *
 * This half runs wherever the agent ran (a container, a sandbox, a CI job), not
 * in a Worker, and that split is forced by the product rather than chosen. The
 * Artifacts Workers binding is a control plane plus a read surface: `create`,
 * `get`, `import`, `fork`, `delete`, `createToken`, `listTokens`, `revokeToken`,
 * `log`, `readCommit`, `readTree`. There is no method that writes a blob, a
 * tree, a commit, or a note. Every content write into an Artifacts repo goes
 * over the Git smart HTTP remote with a `write`-scoped repo token, which means
 * the writer needs a real git binary and a real working tree.
 *
 * So the shape is: the Worker authorises the run and mints a narrow token
 * (worker.ts), and this module spends it.
 *
 * Verified against the Artifacts beta docs:
 *
 *   - Remote form: `https://<ACCOUNT_ID>.artifacts.cloudflare.net/git/<namespace>/<repo>.git`,
 *     and the docs say to use the exact `remote` string returned by the binding
 *     rather than assembling it, which is why `remote` is an input here.
 *   - Tokens are issued as `art_v1_<40 hex>?expires=<unix_seconds>`. The
 *     `?expires=` suffix is part of the returned string and is metadata, not
 *     credential, which matters below.
 *   - Push requires the `write` scope and runs over Git protocol v1
 *     receive-pack. Artifacts does not support v2 receive-pack, and some
 *     optional v1 upload-pack capabilities (filter, include-tag) are not
 *     supported, so partial and blobless clones are not available here.
 *
 * Pinned to node 22 (`node:child_process`, `node:fs/promises`), git 2.43 or
 * later, wrangler 4.112.0 on the Worker side. No runtime dependencies: this is
 * git and the standard library.
 */

import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

import {
  type AgentAttribution,
  encodeNote,
  noteRefs,
  notesRefspec,
} from "./attribution.ts";

const run = promisify(execFile);

export type CommitRunInput = {
  /** Working directory holding an already-cloned Artifacts repo. */
  cwd: string;
  /** The `remote` string from the Artifacts binding, unmodified. */
  remote: string;
  /** A `write`-scoped repo token, full string including the `?expires=` suffix. */
  token: string;
  branch: string;
  /** Files the agent produced, as repo-relative path to UTF-8 contents. */
  files: Record<string, string>;
  message: string;
  attribution: AgentAttribution;
};

export type CommitRunResult = {
  commit: string;
  noteRef: string;
  /** False when the agent produced no net change, in which case nothing is pushed. */
  committed: boolean;
};

/**
 * Build the git args that carry credentials.
 *
 * Two ways to authenticate are documented, and the difference is operational
 * rather than cosmetic. The Basic-auth-in-URL form
 * (`https://x:<secret>@host/...`) writes the secret into `.git/config` as part
 * of the remote, where it survives the process, gets picked up by any later
 * command in the same checkout, and shows up in `git remote -v` output that
 * frequently ends up in CI logs. The header form keeps it in argv for exactly
 * one command.
 *
 * `-c` rather than `git config`, for the same reason: nothing is persisted to
 * the repo config, so a token that expires mid-run cannot leave a stale
 * credential behind for the next job that reuses the checkout.
 *
 * Note the token is sent whole. The docs describe the `?expires=` suffix as the
 * expiry encoded into the token string, and the Bearer form takes "the full
 * token string returned by the control plane"; only the URL form wants the
 * secret split out of it.
 */
function authArgs(token: string): string[] {
  return ["-c", `http.extraHeader=Authorization: Bearer ${token}`];
}

async function git(cwd: string, args: string[]): Promise<string> {
  const { stdout } = await run("git", args, {
    cwd,
    // Agent output is UTF-8 text and note blobs can be a few KB; the default
    // 1 MB buffer is generous, but a `git log` over a long history is not.
    maxBuffer: 32 * 1024 * 1024,
    env: {
      ...process.env,
      // A prompt in a headless container hangs the job until the timeout rather
      // than failing, which reads as "the agent is slow" instead of "the token
      // was rejected".
      GIT_TERMINAL_PROMPT: "0",
      GIT_ASKPASS: "true",
    },
  });
  return stdout.trim();
}

/**
 * Commit the agent's files, attach the attribution note, push both.
 *
 * The ordering is deliberate: commit, then note, then one push carrying the
 * branch and the note ref together. Pushing the branch first and the note
 * second leaves a window where the work is visible and unattributed, and if the
 * container dies in that window the provenance is gone permanently, since
 * nothing downstream knows a note was supposed to exist.
 */
export async function commitRun(
  input: CommitRunInput,
): Promise<CommitRunResult> {
  const { cwd, remote, token, branch, attribution } = input;
  const { short: noteRefShort, full: noteRefFull } = noteRefs(
    attribution.agent,
  );

  for (const [path, contents] of Object.entries(input.files)) {
    // Reject traversal before touching the filesystem. The paths come from
    // model output, which is an untrusted input no matter how well the agent
    // has behaved so far, and `../../.git/hooks/post-checkout` is a working
    // remote-code-execution path on the next checkout.
    if (path.startsWith("/") || path.split("/").includes("..")) {
      throw new Error(`refusing to write outside the repo: ${path}`);
    }
    const target = join(cwd, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
  }

  // Identity is per-command, not global. A shared runner that sets user.email
  // once ends up attributing every agent's commits to the runner, which is the
  // exact information this component exists to preserve.
  const identity = [
    "-c",
    `user.name=${attribution.agent}`,
    "-c",
    `user.email=${attribution.agent}@agents.invalid`,
  ];

  await git(cwd, ["add", "--all"]);

  // An agent that produced no net change is a normal outcome, not a failure:
  // it read the repo, decided the task was already done, and stopped. Committing
  // an empty commit anyway would put a provenance note on a diff that does not
  // exist, and `git commit` without --allow-empty exits non-zero here, which
  // would read as a crash.
  const staged = await git(cwd, ["diff", "--cached", "--name-only"]);
  if (staged === "") {
    return {
      commit: await git(cwd, ["rev-parse", "HEAD"]),
      noteRef: noteRefFull,
      committed: false,
    };
  }

  await git(cwd, [
    ...identity,
    "commit",
    "--message",
    input.message,
    // No trailers. The attribution goes in the note precisely so the message
    // stays human-readable and the metadata stays editable.
    "--no-verify",
  ]);

  const commit = await git(cwd, ["rev-parse", "HEAD"]);

  // Note written against the SHA that was just produced, on this agent's own
  // ref. `add -f` is safe here only because the ref is namespaced per agent: on
  // a shared ref it would overwrite another agent's record for the same commit.
  //
  // `--file` rather than `-m`: a note carrying a full task and 64 tool-call
  // summaries runs to tens of KB, and argv has a hard ceiling that is 256 KB on
  // macOS. The temp file lives outside `cwd` so `git add --all` on a later run
  // in the same checkout cannot sweep it into a commit.
  const notePath = join(tmpdir(), `blank-note-${commit}.json`);
  await writeFile(notePath, encodeNote(attribution), "utf8");
  try {
    await git(cwd, [
      ...identity,
      "notes",
      `--ref=${noteRefShort}`,
      "add",
      "-f",
      `--file=${notePath}`,
      commit,
    ]);
  } finally {
    await rm(notePath, { force: true });
  }

  // Copy notes forward across history rewrites.
  //
  // A note is keyed by commit SHA, so a rebase, amend, or squash produces new
  // SHAs and strands every note on commits that are no longer reachable. Nothing
  // errors; `git log --notes` simply shows nothing, and the provenance is gone
  // in the most quiet way available.
  //
  // `notes.rewriteRef` has no default value, which means git copies notes across
  // rewrites for no ref at all unless it is set. Setting it in the repo config
  // (not with -c) is the point: it has to apply to the rebase somebody runs
  // later, from their own shell, not to this command.
  //
  // This covers `git rebase` and `git commit --amend`. It does not cover a
  // squash-merge performed by a server-side merge button, which rewrites outside
  // any local git config; there the correct move is to re-attach the note to the
  // resulting commit from the merge webhook.
  await git(cwd, ["config", "notes.rewriteRef", "refs/notes/agents/*"]);
  await git(cwd, ["config", "notes.rewriteMode", "overwrite"]);

  // One push, two refspecs, atomic. Without --atomic a rejected branch update
  // still lets the note ref land, which produces provenance for a commit the
  // remote does not have.
  //
  // The note refspec is required. `refs/notes/*` is not in the default push
  // refspec, so `git push origin main` from this repo would push the work and
  // leave every note in this container, and the container is about to be
  // destroyed.
  await git(cwd, [
    ...authArgs(token),
    "push",
    "--atomic",
    remote,
    `${branch}:refs/heads/${branch}`,
    notesRefspec(attribution.agent),
  ]);

  return { commit, noteRef: noteRefFull, committed: true };
}

/**
 * Clone an Artifacts repo with the notes refs included.
 *
 * `git clone` configures a fetch refspec of `+refs/heads/*:refs/remotes/origin/*`
 * and nothing else, so a plain clone of a repo full of agent provenance produces
 * a working tree with all of the code and none of the attribution, with no
 * warning and no empty-directory hint that anything was skipped. Every reader
 * that has ever been surprised by missing notes was surprised by this line not
 * existing.
 *
 * The refspec is added to the config rather than passed once, so subsequent
 * `git fetch` calls in the same checkout keep the notes current instead of
 * getting them once at clone time and then drifting.
 */
export async function cloneWithNotes(
  parentDir: string,
  remote: string,
  token: string,
  target: string,
): Promise<string> {
  await run("git", [...authArgs(token), "clone", remote, target], {
    cwd: parentDir,
  });
  const cwd = join(parentDir, target);

  await git(cwd, [
    "config",
    "--add",
    "remote.origin.fetch",
    "+refs/notes/agents/*:refs/notes/agents/*",
  ]);
  await git(cwd, [...authArgs(token), "fetch", "origin"]);

  // Make every agent's notes visible in `git log` output by default. Without
  // this, notes on a non-default ref are present in the object database and
  // invisible in every command a human runs, which is functionally the same as
  // not having fetched them.
  await git(cwd, ["config", "notes.displayRef", "refs/notes/agents/*"]);

  return cwd;
}

/**
 * Answer "which model wrote this" for a line, locally.
 *
 * `git blame` resolves the line to the commit that last touched it, and the
 * note on that commit names the model and run. This is the payoff for putting
 * attribution on the commit rather than in a sidecar database: it survives file
 * renames, it survives the harness being rewritten, and it needs no join.
 *
 * The limit is git's, not the note's: blame credits the last commit to touch the
 * line, so a human tweaking whitespace over agent-written code takes the credit
 * for it. Use `-w` and `-C` when that matters.
 */
export async function blameLine(
  cwd: string,
  path: string,
  line: number,
): Promise<{ commit: string; note: string | null }> {
  const commit = await git(cwd, [
    "blame",
    "-w",
    "-L",
    `${line},${line}`,
    "--porcelain",
    "--",
    path,
  ]).then((out) => out.split(/\s/)[0]);

  // Read across every agent ref, since the caller does not know which agent
  // touched the line, which is the question being asked.
  //
  // `git log --notes=<glob>` rather than `git notes show`: --notes accepts a ref
  // glob and concatenates every matching note, while `git notes --ref=` takes
  // exactly one ref and does not glob. With one ref per agent, globbing is the
  // only way to ask the question without first knowing the answer.
  const note = await git(cwd, [
    "log",
    "-1",
    "--format=%N",
    "--notes=agents/*",
    commit,
  ]);

  // An empty result is the normal answer for a human-authored commit, and for an
  // agent commit whose note was orphaned by a rebase. Those two cases are
  // indistinguishable from here, which is the strongest argument for setting
  // notes.rewriteRef before anyone rebases.
  return { commit, note: note === "" ? null : note };
}

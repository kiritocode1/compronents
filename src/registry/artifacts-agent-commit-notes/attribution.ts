/**
 * Agent attribution as a git note, not as a commit message.
 *
 * Cloudflare Artifacts is a versioned filesystem that speaks Git, and one of the
 * things it names explicitly is git-notes: "attach prompts, model output, run
 * IDs, or other harness metadata to a commit without changing the commit object
 * or working tree". That sentence is the whole design argument, so it is worth
 * spelling out why the metadata does not go where it usually goes.
 *
 * A commit message is immutable. The message is an input to the commit's SHA-1,
 * so editing it produces a different commit, which orphans every child. That
 * gives you two bad options once an agent's work has landed:
 *
 *   - Write attribution into the message at commit time, before review has
 *     happened, before the eval scores exist, before anyone knows whether the
 *     change survived. Everything learned afterwards has nowhere to live.
 *   - Rewrite history later to add it, which invalidates every SHA downstream
 *     and every reference anyone recorded.
 *
 * Trailers (`Model: claude-opus-4-8` at the end of the message) are the usual
 * compromise and they inherit the same immutability, plus they put machine data
 * in the field humans read. A repo where every commit message carries fifteen
 * lines of harness JSON is a repo where `git log` is no longer readable, and the
 * data is still stuck in a free-text field that has no schema.
 *
 * A note is a separate object that points at a commit. It is mutable, it can be
 * attached hours after the fact, it can be replaced when the reviewer signs off,
 * and it never changes the SHA of the thing it describes. The cost is the two
 * facts this file and its siblings are built around:
 *
 *   1. Notes live on their own refs under `refs/notes/*`, and those refs are in
 *      neither the default fetch refspec nor the default push refspec. A clone
 *      that does not ask for them silently gets a repo with zero provenance and
 *      no error to indicate anything is missing.
 *   2. Notes are keyed by the SHA of the commit they annotate, so a rebase,
 *      amend, squash, or cherry-pick leaves the note attached to a commit that
 *      is no longer reachable. The provenance does not move with the work.
 *
 * This file is the shared half: the record shape, the ref namespacing rule, and
 * the encode/decode pair. It has no dependencies and no platform imports, so the
 * same module is used by the harness that writes notes over Git and by the
 * Worker that reads them back through the Artifacts binding.
 */

/** A single tool invocation the agent made while producing the commit. */
export type ToolCall = {
  name: string;
  /** Truncated argument summary. Full payloads belong in the harness log store. */
  summary: string;
  ok: boolean;
  durationMs: number;
};

export type ReviewOutcome = "unreviewed" | "approved" | "changes-requested";

/**
 * The record serialised into one note blob.
 *
 * `schema` is first and is non-optional because notes outlive the harness that
 * wrote them. A reader six months from now needs to know which decoder applies
 * before it starts guessing at fields.
 */
export type AgentAttribution = {
  schema: "blank.agent-attribution/1";
  /** Stable slug for the agent, not the model. One agent may switch models. */
  agent: string;
  /** Exact model id, including the revision suffix. "claude" is not an answer. */
  model: string;
  /** The harness run that produced the commit. The join key to your log store. */
  runId: string;
  /** The task the run was given, verbatim. Truncated by encodeNote if oversized. */
  task: string;
  toolCalls: ToolCall[];
  /**
   * Review state. This is the field that justifies notes over trailers: it is
   * unknown at commit time and it changes later, which an immutable commit
   * message cannot express without rewriting history.
   */
  review: {
    outcome: ReviewOutcome;
    by: string | null;
    at: string | null;
  };
  /** ISO 8601. When the note was written, which is not when the commit was made. */
  recordedAt: string;
};

/**
 * Notes are content-addressed blobs in a tree, and a tree cannot hold two
 * entries under one name. Two agents annotating the same commit on the same ref
 * is therefore a write conflict, and the loser is whichever one did not pass
 * `-f`: `git notes add` without force refuses, and `git notes add -f` silently
 * discards the other agent's record. `git notes append` avoids the overwrite but
 * concatenates raw bytes, which turns two JSON documents into one string that
 * parses as neither.
 *
 * The fix is namespacing rather than merge logic. Each agent writes to its own
 * ref, so the tree entries never collide and no agent can destroy another's
 * provenance. Reading is then a fan-out across refs, which is cheap, instead of
 * a merge, which is not.
 *
 * `git notes --ref=agents/reviewer` resolves to `refs/notes/agents/reviewer`,
 * so the short form is what the CLI wants and the long form is what a refspec
 * wants. Both are returned to remove the guesswork at each call site.
 */
export function noteRefs(agent: string): { short: string; full: string } {
  // Ref name grammar is stricter than the Artifacts repo-name grammar, and an
  // agent slug is frequently machine-generated. Reject rather than sanitise: a
  // silently rewritten slug writes provenance to a ref nobody later reads from.
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(agent)) {
    throw new Error(
      `agent slug ${JSON.stringify(agent)} must match /^[a-z0-9][a-z0-9._-]*$/`,
    );
  }
  return { short: `agents/${agent}`, full: `refs/notes/agents/${agent}` };
}

/**
 * The refspec that makes notes travel.
 *
 * Neither side of this is implied by anything. `git push origin main` pushes
 * exactly `main`, and `git clone` configures a fetch refspec covering
 * `refs/heads/*` and nothing else. A pipeline that pushes agent work and forgets
 * this line produces a repo whose history is complete and whose provenance is
 * entirely local to a container that has already been destroyed.
 *
 * The Artifacts docs make the same point for the same reason: "notes live on
 * separate refs. Push and fetch refs/notes/* with the rest of your repo data
 * when you want that metadata to travel with the repository."
 *
 * Forced, because a note that was rewritten during review is a legitimate
 * non-fast-forward on its ref, and refusing it would strand the approval on the
 * machine that recorded it.
 */
export function notesRefspec(agent: string): string {
  const { full } = noteRefs(agent);
  return `+${full}:${full}`;
}

/** Fetch every agent's notes, for the read side that does not know the slugs. */
export const ALL_NOTES_REFSPEC = "+refs/notes/agents/*:refs/notes/agents/*";

/**
 * Notes are stored as loose blobs and a large one is paid for on every fetch of
 * the notes ref. A full transcript belongs in the harness log store, keyed by
 * `runId`; the note carries the pointer and the summary.
 */
const MAX_TASK_CHARS = 4_000;
const MAX_TOOL_CALLS = 64;

export function encodeNote(record: AgentAttribution): string {
  const trimmed: AgentAttribution = {
    ...record,
    task:
      record.task.length > MAX_TASK_CHARS
        ? `${record.task.slice(0, MAX_TASK_CHARS)}\n[truncated, full task at runId ${record.runId}]`
        : record.task,
    // Keep the tail, not the head. The last calls before the commit are the ones
    // that produced the diff being explained.
    toolCalls: record.toolCalls.slice(-MAX_TOOL_CALLS),
  };

  // Trailing newline so `git notes show` renders cleanly and so a note appended
  // to by hand later does not fuse onto the closing brace.
  return `${JSON.stringify(trimmed, null, 2)}\n`;
}

/**
 * Decode a note blob, returning null rather than throwing.
 *
 * Notes are the one part of the repo a human is expected to edit by hand
 * (`git notes edit`), and a malformed one must not take down a provenance query
 * over a thousand commits. The caller reports the commit as unattributed, which
 * is the truth, instead of failing the whole read.
 */
export function decodeNote(blob: string): AgentAttribution | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(blob);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const record = parsed as Partial<AgentAttribution>;

  // Version check before field access, so a v2 note read by a v1 decoder is
  // reported as unrecognised rather than silently decoded with missing fields.
  if (record.schema !== "blank.agent-attribution/1") return null;
  if (typeof record.model !== "string" || typeof record.runId !== "string") {
    return null;
  }

  return record as AgentAttribution;
}

/**
 * Notes trees fan out once they get large: git stores the note for commit
 * `abcdef...` at path `abcdef...` while the tree is small, and rebalances to
 * `ab/cdef...`, then `ab/cd/ef...`, as the count grows. The fanout depth is an
 * internal storage detail that changes underneath you as the repo fills, so any
 * reader addressing note blobs by path has to try each shape rather than assume
 * the flat one it saw during testing.
 *
 * This is only a concern for readers that resolve paths themselves, which is the
 * case for the Artifacts file route. `git notes show` handles it internally.
 */
export function notePathCandidates(commitSha: string): string[] {
  const sha = commitSha.toLowerCase();
  return [
    sha,
    `${sha.slice(0, 2)}/${sha.slice(2)}`,
    `${sha.slice(0, 2)}/${sha.slice(2, 4)}/${sha.slice(4)}`,
  ];
}

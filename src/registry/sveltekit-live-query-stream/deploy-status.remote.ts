// BLANK deploy pipeline: a server-push status stream built on SvelteKit remote functions.
//
// Requires @sveltejs/kit >= 2.66.0 and these flags, both still experimental at 2.70.1:
//
//   // svelte.config.js
//   export default {
//     kit: { experimental: { remoteFunctions: true } },
//     compilerOptions: { experimental: { async: true } }
//   };
//
// Version notes that matter here:
//   2.59.0 (2026-05-01) introduced `query.live`.
//   2.63.1 (2026-06-08) switched its transport to SSE.
//   2.58.0 (2026-04-23) reshaped `requested()`: it now takes a required `limit`
//                       and yields `{ arg, query }` entries instead of bare args.
//   2.66.0 (2026-06-18) fixed reconnect handling for `for await` consumers.
//
// This file must be named `*.remote.ts` for SvelteKit to treat it as a remote module.
// It never ships to the browser: the client gets generated fetch stubs instead.

import { error } from "@sveltejs/kit";
import { command, getRequestEvent, query, requested } from "$app/server";

export type DeployPhase =
  | "queued"
  | "building"
  | "uploading"
  | "live"
  | "failed";

export interface DeploySnapshot {
  project: string;
  phase: DeployPhase;
  step: string;
  updatedAt: number;
}

// Single-process hub. Swap for Redis pub/sub or Postgres LISTEN/NOTIFY the moment
// you run more than one instance: this Map is per-process and does not fan out.
const latest = new Map<string, DeploySnapshot>();
const watchers = new Map<string, Set<(snapshot: DeploySnapshot) => void>>();

function publish(snapshot: DeploySnapshot): void {
  latest.set(snapshot.project, snapshot);
  for (const notify of watchers.get(snapshot.project) ?? []) notify(snapshot);
}

/**
 * Async generator backing the live query. SvelteKit drives it as an SSE stream and
 * calls `.return()` when the subscriber disconnects, so the `finally` block is the
 * only place that unregisters the listener. Without it, every dropped tab leaks.
 */
async function* watchDeploy(project: string): AsyncGenerator<DeploySnapshot> {
  const pending: DeploySnapshot[] = [];
  let wake: (() => void) | null = null;

  const notify = (snapshot: DeploySnapshot) => {
    pending.push(snapshot);
    wake?.();
    wake = null;
  };

  const subscribers = watchers.get(project) ?? new Set<typeof notify>();
  watchers.set(project, subscribers);
  subscribers.add(notify);

  try {
    // Seed the stream so a late subscriber sees current state instead of waiting
    // for the next transition. `query.live` uses the first yield for the SSR pass.
    const seed = latest.get(project);
    if (seed) yield seed;

    while (true) {
      while (pending.length > 0) {
        const next = pending.shift();
        if (next) yield next;
      }
      await new Promise<void>((resolve) => {
        wake = resolve;
      });
    }
  } finally {
    subscribers.delete(notify);
    if (subscribers.size === 0) watchers.delete(project);
  }
}

/** Reads the operator off `event.locals`, which your `handle` hook is expected to set. */
function requireOperator(): string {
  const { locals } = getRequestEvent();
  const operator = (locals as { operator?: string }).operator;
  if (!operator) error(401, "Sign in to watch BLANK deploys");
  return operator;
}

/**
 * Live query. Consume it three ways on the client:
 *   `await deployStatus(slug)`            first value, resolves during SSR
 *   `deployStatus(slug).current`          reactive, undefined until `.ready`
 *   `for await (const s of deployStatus(slug))` imperative iteration
 *
 * `'unchecked'` skips schema validation, so the argument arrives as untrusted client
 * input and is validated by hand below. Pass a Standard Schema instead if you have one.
 */
export const deployStatus = query.live(
  "unchecked",
  (project: string): AsyncGenerator<DeploySnapshot> => {
    if (typeof project !== "string" || !/^[a-z0-9-]{1,64}$/.test(project)) {
      error(400, "Project slug must be lowercase letters, digits or hyphens");
    }
    requireOperator();
    return watchDeploy(project);
  },
);

/**
 * Commands run from event handlers, never during render. This one records a phase
 * transition and, in the same response, tells the client which live subscriptions to
 * reconnect. `requested(fn, limit)` is only meaningful inside a `command` or `form`.
 *
 * `arg` is the validated argument bound to the client's original cache key, so the
 * comparison below reconnects only the watchers of the project that actually moved.
 * `requested(deployStatus, 20).reconnectAll()` is the blunt version of the same thing.
 */
export const advanceDeploy = command(
  "unchecked",
  async (input: { project: string; phase: DeployPhase; step: string }) => {
    requireOperator();

    const previous = latest.get(input.project);
    if (previous?.phase === "live" || previous?.phase === "failed") {
      error(409, `Deploy for ${input.project} has already settled`);
    }

    const snapshot: DeploySnapshot = {
      project: input.project,
      phase: input.phase,
      step: input.step,
      updatedAt: Date.now(),
    };
    publish(snapshot);

    // The limit caps how many client-requested entries the server will act on;
    // anything beyond it is reported back to the client as a failure.
    for (const { arg, query: live } of requested(deployStatus, 20)) {
      if (arg === snapshot.project) void live.reconnect();
    }

    return snapshot;
  },
);

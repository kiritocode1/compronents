import { actor, setup } from "rivetkit";
import { createClient } from "rivetkit/client";
import { dynamicActor } from "rivetkit/dynamic";

/**
 * BLANK sandboxed automation runner built on Rivet dynamic actors.
 * Requires rivetkit 2.3.0 or newer: `rivetkit/dynamic` and `dynamicActor()`
 * were added to the package exports in 2.3.0 (2026-06-15).
 *
 * A normal `actor()` is defined at build time and baked into the registry.
 * A `dynamicActor()` has no body at all. It has a `load` loader that returns
 * actor source code as a string, resolved per actor key at start time, and the
 * runtime evaluates that source in a memory and CPU capped Node process. This
 * is how you run per-tenant code that you do not control at deploy time.
 */

/** Default automation shipped to a workspace before anyone edits it. */
const STARTER_AUTOMATION = `import { actor } from "rivetkit";

export default actor({
  state: { runs: 0, lastResult: null as string | null },
  actions: {
    run: (c, subject: string) => {
      c.state.runs += 1;
      c.state.lastResult = "notified " + subject;
      return c.state.lastResult;
    },
    stats: (c) => ({ runs: c.state.runs, lastResult: c.state.lastResult }),
  },
});
`;

/**
 * Ordinary actor holding the editable source for one workspace. Revisions are
 * bumped on write so a caller can tell whether its cached copy is stale.
 */
const automationSource = actor({
  state: { source: STARTER_AUTOMATION, revision: 1 },
  actions: {
    getSource: (c) => ({ source: c.state.source, revision: c.state.revision }),
    setSource: (c, source: string) => {
      c.state.source = source;
      c.state.revision += 1;
      return { revision: c.state.revision };
    },
  },
});

/**
 * The dynamic actor. `load` runs once per actor start, before any action is
 * dispatched. `c.key` is the key the caller used, so a single definition backs
 * every workspace and each one gets its own isolated code and state.
 */
const automationRunner = dynamicActor({
  load: async (c) => {
    const client = await c.client();
    const workspace = c.key[0] ?? "main";

    // Loader calls are plain actor calls, so source can come from another
    // actor, object storage, or an HTTP fetch. This reads the sibling actor.
    const current = await client.automationSource
      .getOrCreate([workspace])
      .getSource();

    return {
      source: current.source,
      // Guard rails for untrusted code. memoryLimit is in MB; a run that
      // exceeds cpuTimeLimitMs is terminated rather than allowed to spin.
      nodeProcess: { memoryLimit: 256, cpuTimeLimitMs: 10_000 },
    };
  },
});

export const registry = setup({
  use: { automationSource, automationRunner },
});

const client = createClient<typeof registry>({ encoding: "json" });

/** Publish new source. The next start of that workspace picks it up. */
export async function publishAutomation(workspace: string, source: string) {
  return client.automationSource.getOrCreate([workspace]).setSource(source);
}

/**
 * Dynamic actors have no compile time action map, so calls go through the
 * untyped `action()` escape hatch. The two generics are the argument tuple and
 * the return type; they are an assertion about the loaded source, not a check.
 */
export async function runAutomation(workspace: string, subject: string) {
  return client.automationRunner
    .getOrCreate([workspace])
    .action<[string], string>({ name: "run", args: [subject] });
}

export async function automationStats(workspace: string) {
  return client.automationRunner
    .getOrCreate([workspace])
    .action<[], { runs: number; lastResult: string | null }>({
      name: "stats",
      args: [],
    });
}

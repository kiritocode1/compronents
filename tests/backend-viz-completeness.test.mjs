// Convention 5 (AGENTS.md): a backend visualization must show all three of
// what it does, the code that does it, and the type it travels under.
//
//   node --import ./tests/alias-hooks.mjs --test tests/backend-viz-completeness.test.mjs
//
// This began as a RATCHET over a 113-item backlog. The backlog is now empty, so
// it reads as a plain gate: every spec must be complete. The two-sided check is
// kept because it is what stopped the list being repopulated on the way down. A
// spec outside KNOWN_GAPS must be complete, and a spec inside it must still be
// incomplete, so a name can only ever be removed.

import assert from "node:assert/strict";
import { test } from "node:test";
import { backendViz } from "../src/lib/backend-viz.ts";

/** every spec an entry can show: one, or one per variant */
function specsOf(entry) {
  return "variants" in entry ? entry.variants.map((v) => v.spec) : [entry];
}

/** the task nodes a spec renders, whichever archetype it uses */
function nodesOf(spec) {
  if (spec.archetype === "flow") return spec.nodes;
  if (spec.archetype === "schedule") return spec.schedule.nodes;
  if (spec.archetype === "ref")
    return [spec.ref.request, spec.ref.challenger].filter(Boolean);
  if (spec.archetype === "scope")
    return spec.scope.node ? [spec.scope.node] : [];
  return [];
}

/**
 * Code and wired tokens are required of every runtime variant; type badges are
 * required once per item, since a dedicated  variant covers the contract
 * for the whole entry.
 */
export function gapsFor(entry) {
  const gaps = new Set();
  const specs = specsOf(entry);
  for (const spec of specs) {
    if (spec.archetype === "types") continue;
    const nodes = nodesOf(spec);
    if (!spec.code) gaps.add("code");
    else if (!nodes.some((n) => n.token)) gaps.add("token");
  }
  const showsTypes = specs.some(
    (spec) =>
      spec.archetype === "types" || nodesOf(spec).some((n) => n.types?.length),
  );
  if (!showsTypes) gaps.add("types");
  return [...gaps];
}

/** specs written before convention 5. Delete a line when you fix that item. */
/**
 * Specs written before convention 5. This list is now EMPTY: every spec in
 * src/lib/backend-viz.ts shows what it does, the code that does it, and the
 * type it travels under.
 *
 * The ratchet still runs. A new item that ships incomplete fails the first
 * test, and re-adding a name here fails the second one the moment that item is
 * complete. Do not repopulate this to silence a failure; finish the spec.
 */
const KNOWN_GAPS = new Set([]);

test("a spec outside the backlog shows code, tokens and types", () => {
  const broken = Object.entries(backendViz)
    .filter(([name]) => !KNOWN_GAPS.has(name))
    .map(([name, entry]) => [name, gapsFor(entry)])
    .filter(([, gaps]) => gaps.length)
    .map(([name, gaps]) => `${name}: missing ${gaps.join(", ")}`);

  assert.deepEqual(
    broken,
    [],
    "see convention 5 in AGENTS.md; add the missing code/token/types to these specs",
  );
});

test("the backlog only shrinks", () => {
  const fixed = [...KNOWN_GAPS].filter(
    (name) => backendViz[name] && gapsFor(backendViz[name]).length === 0,
  );
  assert.deepEqual(
    fixed,
    [],
    "these specs are complete now: remove them from KNOWN_GAPS",
  );
});

test("the backlog has no stale entries", () => {
  const missing = [...KNOWN_GAPS].filter((name) => !backendViz[name]);
  assert.deepEqual(missing, [], "these items no longer exist: remove them");
});

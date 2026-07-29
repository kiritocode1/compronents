// Every `token` on a viz node must actually light something up.
//
//   node --import ./tests/alias-hooks.mjs --test tests/backend-viz-tokens.test.mjs
//
// CodeLine (src/components/site/effect-viz.tsx) resolves a mark with
// `rendered.indexOf(mark.token)` against the TOKENIZER'S OUTPUT, not against the
// spec's `code` string, and silently `continue`s when it misses. So a token
// copied verbatim from the source line can still highlight nothing, with no
// error anywhere.
//
// The completeness test cannot catch this: it only asks whether SOME node has a
// token, never whether that token resolves. Six real dead tokens were found this
// way, all from the tokenizer re-spacing its input: `...` folds to a single `…`,
// `{a:1}` becomes `{ a: 1 }`, and `= ?` renders with a doubled space.
//
// Prefer tokens that survive re-spacing. A bare call name like
// `planBackgroundTask` beats `planBackgroundTask(...)`.

import assert from "node:assert/strict";
import { test } from "node:test";
import { backendViz } from "../src/lib/backend-viz.ts";
import { segmentType, TOKEN_THEMES } from "../src/lib/type-tokens.ts";

const THEME = TOKEN_THEMES["github-dark"];

/** what the user actually sees, which is what CodeLine matches against */
const render = (code) =>
  segmentType(code, THEME, "code")
    .map((s) => s.content)
    .join("");

const specsOf = (entry) =>
  "variants" in entry ? entry.variants.map((v) => v.spec) : [entry];

/** every token a spec feeds to CodeLine, matching what each archetype wires */
function tokensOf(spec) {
  const out = [];
  const push = (n, where) => n?.token && out.push({ token: n.token, where });
  if (spec.archetype === "flow") {
    spec.nodes.forEach((n, i) => push(n, `nodes[${i}] ${n.label}`));
  } else if (spec.archetype === "ref") {
    push(spec.ref.request, "ref.request");
    push(spec.ref.challenger, "ref.challenger");
  } else if (spec.archetype === "scope") {
    push(spec.scope.node, "scope.node");
    spec.scope.finalizers.forEach((f, i) =>
      push(f, `finalizers[${i}] ${f.label}`),
    );
  } else if (spec.archetype === "schedule") {
    spec.schedule.nodes.forEach((n, i) => push(n, `nodes[${i}] ${n.label}`));
  }
  return out;
}

test("every wired token resolves against the rendered code line", () => {
  const dead = [];
  for (const [name, entry] of Object.entries(backendViz)) {
    const specs = specsOf(entry);
    specs.forEach((spec, vi) => {
      if (spec.archetype === "types" || !spec.code) return;
      const rendered = render(spec.code);
      const label = specs.length > 1 ? `${name} [variant ${vi}]` : name;
      for (const { token, where } of tokensOf(spec)) {
        if (rendered.includes(token)) continue;
        dead.push(
          `${label} (${where}): token ${JSON.stringify(token)} does not appear in ${JSON.stringify(rendered)}`,
        );
      }
    });
  }
  assert.deepEqual(
    dead,
    [],
    "these tokens highlight nothing; re-anchor them on text that survives the tokenizer",
  );
});

test("no spec wires tokens without a code line to put them in", () => {
  const orphans = [];
  for (const [name, entry] of Object.entries(backendViz)) {
    const specs = specsOf(entry);
    specs.forEach((spec, vi) => {
      if (spec.archetype === "types" || spec.code) return;
      const count = tokensOf(spec).length;
      if (count === 0) return;
      const label = specs.length > 1 ? `${name} [variant ${vi}]` : name;
      orphans.push(`${label}: ${count} token(s) but no code line to light`);
    });
  }
  assert.deepEqual(orphans, [], "add the missing code line, or drop the tokens");
});

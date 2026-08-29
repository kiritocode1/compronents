import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { directionLookup } from "../src/lib/direction.ts";
import {
  directionDiscoveryToMarkdown,
  discoverDirection,
} from "../src/lib/direction-discover.ts";

const BROAD_QUERY =
  "help me explore what I could use for a new developer tool interface";

test("joint discovery fixes the broad empty direction case", () => {
  const result = discoverDirection({ task: BROAD_QUERY });
  assert.ok(result.candidates.length >= 8);
  assert.ok(result.candidates.length <= 12);
  assert.equal(result.budget.studyAttempts, 3);
  assert.ok(result.coverage.categories.length >= 3);
  assert.ok(result.coverage.roles.length >= 3);
});

test("strict exact direction stays available and pinned", () => {
  const exact = directionLookup("animated footer");
  assert.equal(exact.registry.length, 1);
  assert.equal(exact.registry[0].id, "reg_animated-footer");

  const result = discoverDirection({ task: "animated footer" });
  assert.equal(result.exact[0].id, "reg_animated-footer");
  assert.equal(result.candidates[0].id, "reg_animated-footer");
});

test("agent Markdown requires the full taste loop", () => {
  const md = directionDiscoveryToMarkdown(
    discoverDirection({ task: BROAD_QUERY }),
  );
  assert.match(md, /scan all/i);
  assert.match(md, /at most three/i);
  assert.match(md, /inspect/i);
  assert.match(md, /why it works/i);
  assert.match(md, /adopt, adapt, or reject/i);
  assert.match(md, /apply/i);
  assert.match(md, /compare/i);
  assert.match(md, /actual influences/i);
  assert.match(md, /catalog.*lead/i);
  assert.match(md, /Argent|SKILL\.md|search.*catalog/i);
});

test("repo instruction surfaces carry the proactive stop condition", () => {
  const paths = [
    ".agents/skills/blank-direction/SKILL.md",
    ".agents/skills/second-brain/SKILL.md",
    "templates/blank-direction/AGENTS.snippet.md",
    "mcp/blank-direction/server.mjs",
    "mcp/blank-direction/README.md",
    "CLAUDE.md",
    "AGENTS.md",
  ];
  for (const path of paths) {
    const text = fs.readFileSync(path, "utf8");
    assert.match(
      text,
      /before (planning|the first|making|implementing)/i,
      path,
    );
    assert.match(text, /discover/i, path);
    assert.match(text, /inspect/i, path);
    assert.match(text, /three|3/, path);
    assert.match(text, /apply/i, path);
    assert.match(text, /compare/i, path);
  }
});

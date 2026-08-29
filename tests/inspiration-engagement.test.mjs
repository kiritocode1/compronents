import assert from "node:assert/strict";
import { test } from "node:test";
import { inspirationGroups } from "../src/lib/inspiration.ts";
import {
  CATEGORY_ENGAGEMENT,
  resolveEngagement,
} from "../src/lib/inspiration-engagement.ts";

test("every wall category has an engagement strategy", () => {
  assert.equal(inspirationGroups.length, 51);
  const missing = inspirationGroups
    .map((group) => group.title)
    .filter((title) => !CATEGORY_ENGAGEMENT[title]);
  assert.deepEqual(missing, []);
});

test("registry results inspect, install, and run", () => {
  const result = resolveEngagement({
    source: "registry",
    category: "Components",
    kind: [],
  });
  assert.equal(result.mode, "inspect-install-run");
  assert.match(result.instruction, /inspect/i);
  assert.match(result.instruction, /install/i);
  assert.match(result.evidenceRequired, /running|rendered|test/i);
});

test("kind overrides category defaults", () => {
  const cases = [
    ["skill", "load-skill"],
    ["library", "search-source-catalog"],
    ["essay", "read-study"],
    ["tool", "use-evaluate"],
    ["video", "watch-listen"],
    ["demo", "curate-with-argent"],
    ["asset", "inspect-asset"],
    ["course", "practice"],
    ["portfolio", "curate-with-argent"],
    ["gallery", "curate-with-argent"],
  ];

  for (const [kind, expected] of cases) {
    const result = resolveEngagement({
      source: "wall",
      category: "Developer tools and utilities",
      kind: [kind],
    });
    assert.equal(result.mode, expected, kind);
  }
});

test("component libraries must be searched beyond the landing page", () => {
  const result = resolveEngagement({
    source: "wall",
    category: "Component libraries and blocks",
    kind: ["library"],
  });
  assert.equal(result.mode, "search-source-catalog");
  assert.match(result.instruction, /search/i);
  assert.match(result.instruction, /component|block|example/i);
  assert.match(result.evidenceRequired, /source|docs|example|component/i);
});

test("skills load their instructions and creative references use Argent", () => {
  const skill = resolveEngagement({
    source: "wall",
    category: "Agent skills directories",
    kind: ["skill"],
  });
  assert.equal(skill.mode, "load-skill");
  assert.match(skill.instruction, /SKILL\.md/);

  const visual = resolveEngagement({
    source: "wall",
    category: "Design inspiration galleries",
    kind: ["gallery"],
  });
  assert.equal(visual.mode, "curate-with-argent");
  assert.equal(visual.skill, "argent-device-interact");
  assert.match(visual.instruction, /Argent/i);
  assert.match(visual.evidenceRequired, /visual|screenshot|interaction/i);
});

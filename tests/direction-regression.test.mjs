// Direction regressions: real agent-traffic queries, not BM25 unit checks.
//
//   node --import ./tests/alias-hooks.mjs --test tests/direction-regression.test.mjs

import assert from "node:assert/strict";
import { test } from "node:test";
import { directionLookup } from "../src/lib/direction.ts";
import { inspirationPickId } from "../src/lib/inspiration-id.ts";
import { recommendInspiration } from "../src/lib/inspiration-recommend.ts";
import { searchRegistry } from "../src/lib/registry-search.ts";

function wallHrefs(query) {
  return recommendInspiration(query)
    .picks.map((p) => p.href)
    .join(" ");
}

function wallIds(query) {
  return recommendInspiration(query)
    .picks.map((p) => p.id)
    .join(" ");
}

test("every wall pick has insp_ id and cite line", () => {
  const result = recommendInspiration("animated icons");
  assert.ok(result.picks.length > 0);
  for (const pick of result.picks) {
    assert.match(pick.id, /^insp_[a-z0-9-]+$/);
    assert.equal(pick.id, inspirationPickId(pick.title, pick.href));
    assert.match(pick.cite, new RegExp(pick.id));
    assert.match(pick.cite, /^From wall:/);
  }
});

test("animated icons: real packs, not static Eva/Lineicons", () => {
  const hrefs = wallHrefs("animated icons");
  assert.doesNotMatch(hrefs, /eva-icons/i);
  assert.doesNotMatch(hrefs, /lineicons\.com/i);
  assert.ok(
    /lucide-animated|useanimations|animateicons|movingicons|iconanimator|heroicons-animated|animate-ui\.com\/docs\/icons/i.test(
      hrefs,
    ),
    hrefs,
  );
});

test("motion designer portfolio ranks creatoroly", () => {
  const picks = recommendInspiration("motion designer portfolio").picks;
  assert.ok(picks.length > 0);
  assert.match(picks[0].href, /creatoroly/i);
});

test("something like linear stays in product/design families", () => {
  const picks = recommendInspiration("something like linear").picks;
  assert.ok(picks.length > 0);
  for (const pick of picks) {
    assert.notEqual(pick.category, "Audio, video and media");
    assert.notEqual(pick.category, "Color, gradients and palettes");
  }
  assert.ok(
    picks.some((p) =>
      /Design inspiration|Interface design|Portfolios|Component/i.test(
        p.category,
      ),
    ),
    picks.map((p) => p.category).join(", "),
  );
});

test("less vibe coded UI prefers craft over random kits", () => {
  const picks = recommendInspiration("less vibe coded UI").picks;
  assert.ok(picks.length > 0);
  assert.ok(
    picks.some((p) =>
      /Interface design guidelines|Design essays|Engineering essays/i.test(
        p.category,
      ),
    ),
    picks.map((p) => `${p.category}:${p.title}`).join(" | "),
  );
});

test("favicon animate hits the favicon demo", () => {
  assert.match(wallHrefs("favicon animate"), /favicon/i);
});

test("llm architecture stays in LLM category", () => {
  const picks = recommendInspiration("llm architecture").picks;
  assert.ok(
    picks.some(
      (p) =>
        p.category === "LLMs and AI engineering" ||
        /llm|transformer/i.test(p.title),
    ),
  );
});

test("registry search finds installables with reg_ ids", () => {
  const hits = searchRegistry("footer", { limit: 5 });
  // May be empty if no footer item; if present, shape must be correct
  for (const hit of hits) {
    assert.match(hit.id, /^reg_/);
    assert.match(hit.install, /shadcn/);
    assert.ok(hit.pageUrl.startsWith("https://ui.aryank.space/"));
  }
});

test("direction_lookup returns protocol + both sides", () => {
  const result = directionLookup("animated icons");
  assert.ok(result.protocol.length >= 3);
  assert.ok(result.wall.picks.length > 0);
  assert.match(result.wall.picks[0].id, /^insp_/);
  // registry may or may not match icons; wall must
  assert.equal(result.empty, false);
});

test("direction markdown includes citation format", async () => {
  const { directionToMarkdown } = await import("../src/lib/direction.ts");
  const md = directionToMarkdown(directionLookup("react animation"));
  assert.match(md, /From wall:/);
  assert.match(md, /outside-second-brain/);
  assert.match(md, /insp_/);
});

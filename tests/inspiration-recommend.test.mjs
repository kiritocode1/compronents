// Opinionated recommend layer on top of BM25.
//
//   node --test tests/inspiration-recommend.test.mjs

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  expandQuery,
  inferCategoryHints,
  resolveFacets,
} from "../src/lib/inspiration-meta.ts";
import {
  recommendInspiration,
  recommendToMarkdown,
} from "../src/lib/inspiration-recommend.ts";
import { inspirationGroups } from "../src/lib/inspiration.ts";
import { inspirationIndexToMarkdown } from "../src/lib/inspiration.ts";
import { searchInspiration } from "../src/lib/inspiration-search.ts";

test("recommend returns at most 3 picks by default", () => {
  const result = recommendInspiration("react animation library");
  assert.ok(result.picks.length > 0);
  assert.ok(result.picks.length <= 3);
  for (const pick of result.picks) {
    assert.ok(pick.href.startsWith("http"));
    assert.ok(pick.why.length > 0);
    assert.ok(pick.score > 0);
  }
});

test("animated icons does not surface static Eva or Lineicons", () => {
  const result = recommendInspiration("animated icons", { limit: 3 });
  const hrefs = result.picks.map((p) => p.href).join(" ");
  assert.doesNotMatch(hrefs, /eva-icons/i);
  assert.doesNotMatch(hrefs, /lineicons\.com/i);
  // At least one real animated-icon resource should land.
  assert.ok(
    result.picks.some(
      (p) =>
        /lucide-animated|movingicons|useanimations|animateicons|iconanimator|heroicons-animated|animate-ui\.com\/docs\/icons|bakai\.me\/lab\/animating/i.test(
          p.href,
        ) || /animated icon/i.test(p.category + p.title + (p.description ?? "")),
    ),
    `expected an animated-icon pick, got: ${result.picks.map((p) => p.title).join(", ")}`,
  );
});

test("favicon animate picks the favicon demo", () => {
  const result = recommendInspiration("favicon animate");
  assert.match(
    result.picks.map((p) => p.href).join(" "),
    /favicon/i,
  );
});

test("motion designer portfolio ranks creatoroly first", () => {
  const result = recommendInspiration("motion designer portfolio");
  assert.ok(result.picks.length > 0);
  assert.match(result.picks[0].href, /creatoroly/i);
});

test("llm architecture stays in LLM territory", () => {
  const result = recommendInspiration("llm architecture");
  assert.ok(result.picks.length > 0);
  assert.ok(
    result.picks.some(
      (p) =>
        p.category === "LLMs and AI engineering" ||
        /llm|transformer/i.test(p.title + (p.description ?? "")),
    ),
  );
});

test("something like linear does not return pure noise-only picks", () => {
  const result = recommendInspiration("something like linear");
  // Must produce at least one pick, and none should be random audio/color tools.
  assert.ok(result.picks.length > 0, "should return picks");
  for (const pick of result.picks) {
    assert.notEqual(pick.category, "Audio, video and media");
    assert.notEqual(pick.category, "Color, gradients and palettes");
  }
  // Prefer design / product UI categories when the phrase rewrite fires.
  assert.ok(
    result.variants.some((v) => /product ui|saas|issue tracker/i.test(v)),
    `expected linear phrase expansions, got ${result.variants.join(" | ")}`,
  );
});

test("empty query returns no picks", () => {
  const result = recommendInspiration("");
  assert.equal(result.picks.length, 0);
});

test("markdown output names Picks and agent rules", () => {
  const md = recommendToMarkdown(recommendInspiration("animated icons"));
  assert.match(md, /## Picks/);
  assert.match(md, /recommend only from Picks/i);
});

test("expandQuery cleans fluff and adds variants", () => {
  const variants = expandQuery("good ui libraries");
  assert.ok(variants.length >= 1);
  assert.ok(
    variants.some((v) => /ui/.test(v) && !/^good\b/.test(v)),
    `expected cleaned variant without leading fluff, got ${variants.join(" | ")}`,
  );
});

test("every link gets non-empty per-link facets including its title", () => {
  let count = 0;
  for (const group of inspirationGroups) {
    for (const link of group.links) {
      const facets = resolveFacets(group.title, link);
      assert.ok(facets.kind.length > 0, `no kind: ${link.title}`);
      assert.ok(facets.useFor.length > 0, `no useFor: ${link.title}`);
      // Title (or a bare form of it) must be indexed so the entry is uniquely findable.
      const titleLower = link.title.toLowerCase();
      const hasTitle = facets.useFor.some(
        (p) => p === titleLower || titleLower.includes(p) || p.includes(titleLower.split(/\s+/)[0]),
      );
      assert.ok(hasTitle, `title missing from useFor for ${link.title}: ${facets.useFor.join(", ")}`);
      count++;
    }
  }
  assert.ok(count >= 1000, `expected full catalog, got ${count}`);
});

test("inferCategoryHints routes animated icons exclusively", () => {
  assert.deepEqual(inferCategoryHints("animated icons for sidebar"), [
    "Animated icon libraries",
  ]);
  assert.ok(
    inferCategoryHints("motion designer portfolio").includes(
      "Portfolios and studios",
    ),
  );
});

test("Eva Icons and Lineicons live under Icons, not Animated", () => {
  const animated = inspirationGroups.find(
    (g) => g.title === "Animated icon libraries",
  );
  const icons = inspirationGroups.find((g) => g.title === "Icons");
  assert.ok(animated && icons);
  assert.ok(!animated.links.some((l) => l.title === "Eva Icons"));
  assert.ok(!animated.links.some((l) => l.title === "Lineicons"));
  assert.ok(icons.links.some((l) => l.title === "Eva Icons"));
  assert.ok(icons.links.some((l) => l.title === "Lineicons"));
});

test("search still works and carries facets", () => {
  const hits = searchInspiration("animated icons", { limit: 5 });
  assert.ok(hits.length > 0);
  assert.ok(hits[0].kind?.length || hits[0].useFor?.length);
});

test("llms.txt points at recommend and stays small", () => {
  const index = inspirationIndexToMarkdown();
  assert.ok(index.length < 8_000, `index is ${index.length} bytes`);
  assert.match(index, /inspiration\/recommend\?q=/);
  assert.match(index, /Recommend \(default for agents\)/);
});

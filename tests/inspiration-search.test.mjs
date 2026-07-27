// Retrieval checks for the inspiration search endpoint's ranking.
//
//   node --test tests/inspiration-search.test.mjs
//
// These assert that known-good entries land in the candidate pool an agent
// actually reads, not that they rank first: the model does the final pick.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  inspirationGroups,
  inspirationGroupsToMarkdown,
  inspirationIndexToMarkdown,
} from "../src/lib/inspiration.ts";
import {
  categoryIndex,
  listByCategory,
  searchInspiration,
  unmatchedTerms,
} from "../src/lib/inspiration-search.ts";

const hrefs = (hits) => hits.map((hit) => hit.href).join(" ");

test("ranks by relevance and respects the limit", () => {
  const hits = searchInspiration("react query caching", { limit: 5 });
  assert.ok(hits.length > 0 && hits.length <= 5);
  for (let i = 1; i < hits.length; i++) {
    assert.ok(hits[i - 1].score >= hits[i].score, "scores must descend");
  }
});

test("finds entries whose wording differs from the query", () => {
  // The rule's own motivating example: no literal keyword overlap with
  // "study how LLMs are designed" beyond "llm".
  const hits = searchInspiration("study how llms are designed internally");
  assert.match(hrefs(hits), /llm/i);
});

test("plural and singular forms hit the same entries", () => {
  const singular = searchInspiration("animated icon library", { limit: 8 });
  const plural = searchInspiration("animated icons libraries", { limit: 8 });
  const overlap = singular.filter((hit) =>
    plural.some((other) => other.href === hit.href),
  );
  assert.ok(overlap.length >= 4, "stemming should keep results stable");
});

test("category filter narrows to that category", () => {
  const hits = searchInspiration("font", { category: "Typography" });
  assert.ok(hits.length > 0);
  for (const hit of hits) {
    assert.match(hit.category, /Typography/i);
  }
});

test("browsing a category returns its links", () => {
  const [first] = categoryIndex();
  const hits = listByCategory(first.title, 5);
  assert.equal(hits.length, Math.min(first.count, 5));
  assert.equal(hits[0].category, first.title);
});

test("reports query words the collection never uses", () => {
  // The silent failure mode: 12 confident results for a word nothing mentions.
  assert.deepEqual(unmatchedTerms("zzzqqxx"), ["zzzqqxx"]);
  assert.deepEqual(unmatchedTerms("react animation"), []);
  assert.deepEqual(unmatchedTerms("react zzzqqxx"), ["zzzqqxx"]);
});

test("llms.txt stays small enough for any agent to read whole", () => {
  const index = inspirationIndexToMarkdown();
  // The entire point of splitting the feed. If this creeps back up, agents go
  // back to truncating the well-known path and guessing from a fragment.
  assert.ok(
    index.length < 8_000,
    `index grew to ${index.length} bytes, keep it under 8KB`,
  );
  // Every category must still be discoverable from the small file.
  for (const group of inspirationGroups) {
    assert.ok(index.includes(group.title), `missing category: ${group.title}`);
  }
  assert.match(index, /llms-full\.txt/);
  assert.match(index, /inspiration\/search\?q=/);
});

test("llms-full.txt still carries every link", () => {
  const full = inspirationGroupsToMarkdown();
  const all = inspirationGroups.flatMap((group) => group.links);
  assert.ok(all.length > 1000);
  for (const link of all) {
    assert.ok(full.includes(link.href), `dropped from full dump: ${link.href}`);
  }
});

test("empty and junk queries return nothing rather than everything", () => {
  assert.equal(searchInspiration("").length, 0);
  assert.equal(searchInspiration("the and of").length, 0);
  assert.equal(searchInspiration("zzzqqxx").length, 0);
});

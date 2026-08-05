/**
 * The /inspiration search box.
 *
 * The point of these is the first block: the website and the MCP rank on one
 * engine, so the site cannot drift back into being the weaker search. The rest
 * guard the behaviours that engine is wrapped in (dates, shelves, floors).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { inspirationGroups } from "@/lib/inspiration";
import { browseInspiration } from "@/lib/inspiration-browse";
import { recommendInspiration } from "@/lib/inspiration-recommend";

const flat = (groups) => groups.flatMap((group) => group.links);
const titles = (groups) => flat(groups).map((link) => link.title);
const hrefs = (groups) => new Set(flat(groups).map((link) => link.href));

/** Queries whose best answer a human and an agent should agree on. */
const SHARED = [
  "react native worker",
  "animated icons",
  "grain texture",
  "motion designer portfolio",
  "scroll driven animation",
  "web audio",
];

for (const query of SHARED) {
  test(`site search contains the agent's top pick: "${query}"`, () => {
    const pick = recommendInspiration(query).picks[0];
    assert.ok(pick, `recommend returned no pick for "${query}"`);
    assert.ok(
      hrefs(browseInspiration(inspirationGroups, query)).has(pick.href),
      `site search dropped the agent's top pick (${pick.title}) for "${query}"`,
    );
  });
}

test("intent queries the old fuzzy search missed now return results", () => {
  // Each of these returned zero or one row before the site moved onto the
  // shared engine: they only work through query expansion and style hints.
  for (const query of ["like linear", "less vibe coded", "grain texture"]) {
    const found = flat(browseInspiration(inspirationGroups, query));
    assert.ok(found.length >= 3, `"${query}" returned ${found.length} links`);
  }
});

test("an empty query returns the whole wall untouched", () => {
  const all = browseInspiration(inspirationGroups, "");
  assert.equal(all, inspirationGroups);
});

test("naming a shelf returns that shelf whole, in registry order", () => {
  const shelf = inspirationGroups.find((g) => g.title === "Typography tools");
  const result = browseInspiration(inspirationGroups, "typography tools");
  assert.equal(result.length, 1);
  assert.deepEqual(
    titles(result),
    shelf.links.map((l) => l.title),
  );
});

test("text search leads with the best hit, not wall order", () => {
  // Text search reorders by rank score so the agent's top pick is first,
  // not buried under an older wall entry that only shares a word.
  const pick = recommendInspiration("animated icons").picks[0];
  assert.ok(pick, "recommend returned no pick for animated icons");
  const found = flat(browseInspiration(inspirationGroups, "animated icons"));
  assert.equal(
    found[0]?.href,
    pick.href,
    `best hit should lead results, got ${found[0]?.title} ahead of ${pick.title}`,
  );
});

test("inspiration search is real Fuse fuzzy: title typos still hit", () => {
  const sprites = flat(browseInspiration(inspirationGroups, "spriteshet"));
  assert.ok(
    sprites.some((l) => /spritesheet/i.test(l.title)),
    "spriteshet should fuzzy-match the spritesheet demo",
  );
  const grain = flat(browseInspiration(inspirationGroups, "grann texture"));
  assert.ok(grain.length >= 3, "grann texture should still find grain assets");
});

test("a date-only query returns the wall narrowed to the range", () => {
  const now = new Date("2026-07-20T12:00:00Z");
  const found = flat(browseInspiration(inspirationGroups, "last week", now));
  assert.ok(found.length > 0, "no links in range");
  for (const link of found) {
    assert.ok(
      link.dateAdded >= "2026-07-13" && link.dateAdded <= "2026-07-19",
      `${link.title} (${link.dateAdded}) is outside last week`,
    );
  }
});

test("text and a date compose: both filters apply", () => {
  const now = new Date("2026-07-20T12:00:00Z");
  const withDate = flat(
    browseInspiration(inspirationGroups, "icons last week", now),
  );
  const withoutDate = hrefs(browseInspiration(inspirationGroups, "icons"));

  assert.ok(withDate.length > 0, "no icon links in range");
  assert.ok(
    withDate.length < withoutDate.size,
    "the date phrase did not narrow the text results",
  );
  for (const link of withDate) {
    assert.ok(withoutDate.has(link.href), `${link.title} is not an icon match`);
    assert.ok(
      link.dateAdded >= "2026-07-13" && link.dateAdded <= "2026-07-19",
      `${link.title} (${link.dateAdded}) is outside last week`,
    );
  }
});

test("nonsense returns nothing rather than a confident wall of junk", () => {
  assert.deepEqual(
    browseInspiration(inspirationGroups, "zzzqqxx wibblefrotz"),
    [],
  );
});

test("results stay a browsable set, not the whole wall", () => {
  const total = flat(inspirationGroups).length;
  for (const query of ["icons", "react animation library", "postgres"]) {
    const found = flat(browseInspiration(inspirationGroups, query)).length;
    assert.ok(found > 0, `"${query}" returned nothing`);
    assert.ok(
      found < total * 0.12,
      `"${query}" returned ${found} of ${total} links, which is a dump`,
    );
  }
});

// Soft Type: editing must keep the letters you did not touch, and layout must
// fit the text in the box.
//
//   node --test tests/soft-type.test.mjs

import assert from "node:assert/strict";
import { test } from "node:test";
import { layoutText } from "../src/registry/soft-type/layout.ts";
import {
  graphemes,
  isEmoji,
  reconcile,
} from "../src/registry/soft-type/text.ts";

let next = 1;
const make = (grapheme) => ({ id: next++, grapheme });
const ids = (entries) => entries.map((e) => e.id);
const typed = (text) => reconcile([], graphemes(text), make).entries;

test("typing in the middle keeps every other letter's id", () => {
  const before = typed("soft type");
  const { entries, removed, added } = reconcile(
    before,
    graphemes("soft, type"),
    make,
  );
  assert.equal(removed.length, 0);
  assert.deepEqual(
    added.map((e) => e.grapheme),
    [","],
  );
  assert.deepEqual(ids(entries.slice(0, 4)), ids(before.slice(0, 4)));
  assert.deepEqual(ids(entries.slice(5)), ids(before.slice(4)));
});

test("replacing a selection swaps only the replaced letters", () => {
  const before = typed("cat");
  const { entries, removed } = reconcile(before, graphemes("cart"), make);
  assert.deepEqual(removed, []);
  assert.equal(entries[0].id, before[0].id);
  assert.equal(entries[3].id, before[2].id);
});

test("a grapheme cluster is one letter", () => {
  assert.deepEqual(graphemes("é👍🏽한"), ["é", "👍🏽", "한"]);
  const before = typed("a👍🏽");
  const { removed } = reconcile(before, graphemes("a"), make);
  assert.equal(removed.length, 1);
  assert.equal(removed[0].grapheme, "👍🏽");
});

test("emoji become circles but text symbols stay glyphs", () => {
  for (const g of ["😀", "🎉", "👍🏽", "❤️", "🇨🇦", "1️⃣"])
    assert.ok(isEmoji(g), g);
  for (const g of ["A", "©", "★", "✓", "漢", "∞"]) assert.ok(!isEmoji(g), g);
});

// A plain box glyph: 0.6em wide, cap height 0.7em, sitting on the baseline.
const glyph = (id, grapheme = "x") => ({
  kind: "glyph",
  id,
  skeleton: {
    grapheme,
    strokes: [],
    radius: 0.1,
    advance: 0.62,
    bounds: { minX: 0, maxX: 0.6, minY: -0.7, maxY: 0 },
    area: 0.2,
  },
});
const words = (...lengths) => {
  const items = [];
  let id = 1;
  lengths.forEach((n, w) => {
    if (w) items.push({ kind: "space", id: id++ });
    for (let i = 0; i < n; i++) items.push(glyph(id++));
  });
  return items;
};

test("every letter lands inside the box", () => {
  const items = words(4, 4, 6);
  const { poses, slots } = layoutText(items, 800, 500, {
    squeeze: 1,
    breakWords: true,
  });
  assert.equal(poses.size, 14);
  assert.equal(slots.length, items.length + 1);
  for (const pose of poses.values()) {
    assert.ok(pose.x > 0 && pose.x < 800, `x ${pose.x}`);
    assert.ok(pose.y > 0 && pose.y < 500, `y ${pose.y}`);
  }
});

test("a narrow box breaks a long word only when breakWords is on", () => {
  const items = words(9);
  const rows = (breakWords) => {
    const { poses } = layoutText(items, 200, 800, {
      squeeze: 1,
      breakWords,
    });
    const ys = [...poses.values()].map((p) => p.y);
    return Math.max(...ys) - Math.min(...ys);
  };
  assert.ok(rows(true) > 100, "broken word spans several lines");
  assert.ok(rows(false) < 60, "unbroken word stays on one line");
});

test("a short word in a wide box stays whole", () => {
  const { poses } = layoutText(words(5), 1440, 900, {
    squeeze: 1,
    breakWords: true,
  });
  const ys = [...poses.values()].map((p) => p.y);
  assert.ok(Math.max(...ys) - Math.min(...ys) < 60, "BLANK stays on one line");
});

// Offline registry integrity checks: proves every registered item would copy
// cleanly and self-consistently through `shadcn add`, without a running server.
//
//   node --test tests/registry-integrity.test.mjs
//
// The live-install counterpart (tests/shadcn-install.test.mjs) exercises the
// real CLI; this file catches the same drift in ~1s with no network.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getRegistryDesignGuidance,
  matchesRegistrySearch,
} from "../src/lib/registry.ts";
import { searchDate } from "../src/lib/search-time.ts";
import {
  analyzeFile,
  exists,
  FILE_TYPES,
  readFile,
  registryItems,
} from "./registry-data.mjs";

const ITEM_TYPES = new Set([
  "registry:ui",
  "registry:component",
  "registry:lib",
]);

test("catalog is well-formed", () => {
  const names = new Set();
  for (const item of registryItems) {
    assert.ok(item.name, "item missing name");
    assert.ok(!names.has(item.name), `duplicate item name: ${item.name}`);
    names.add(item.name);
    assert.ok(item.title, `${item.name}: missing title`);
    assert.ok(item.description, `${item.name}: missing description`);
    assert.ok(
      ITEM_TYPES.has(item.type),
      `${item.name}: invalid type "${item.type}"`,
    );
    assert.ok(item.files?.length, `${item.name}: ships no files`);
  }
});

test("every item has complete design guidance", () => {
  for (const item of registryItems) {
    const guidance = getRegistryDesignGuidance(item);
    for (const field of ["style", "use", "pair", "avoid"]) {
      assert.ok(guidance[field], `${item.name}: missing ${field} guidance`);
    }
    assert.ok(
      guidance.use.includes(item.title),
      `${item.name}: use guidance is not item-specific`,
    );
  }
});

test("catalog search understands titles, sections, and natural dates", () => {
  const now = new Date(2026, 6, 16, 12);
  const matching = (query) =>
    registryItems.filter((item) => matchesRegistrySearch(item, query, now));

  assert.ok(matching("pixelgrid").some((item) => item.date === "2026-07-14"));
  assert.ok(matching("7/14").length > 0);
  assert.ok(matching("7/14").every((item) => item.date === "2026-07-14"));
  assert.ok(matching("pages July 14").length > 0);
  assert.ok(
    matching("pages July 14").every((item) => item.section === "pages"),
  );
  assert.ok(matching("yesterday").length > 0);
  assert.ok(matching("yesterday").every((item) => item.date === "2026-07-15"));
  assert.ok(matching("2 days ago").length > 0);
  assert.ok(matching("2 days ago").every((item) => item.date === "2026-07-14"));
  assert.ok(matching("this week").length > 0);
  assert.ok(
    matching("this week").every(
      (item) => item.date >= "2026-07-13" && item.date <= "2026-07-19",
    ),
  );
  assert.ok(matching("last week").length > 0);
  assert.ok(
    matching("last week").every(
      (item) => item.date >= "2026-07-06" && item.date <= "2026-07-12",
    ),
  );
  assert.ok(matching("2 weeks ago").length > 0);
  assert.ok(
    matching("2 weeks ago").every(
      (item) => item.date >= "2026-06-29" && item.date <= "2026-07-05",
    ),
  );
  assert.ok(matching("this month").length > 0);
  assert.ok(
    matching("this month").every((item) => item.date.startsWith("2026-07")),
  );
  assert.ok(matching("last month").length > 0);
  assert.ok(
    matching("last month").every((item) => item.date.startsWith("2026-06")),
  );
  assert.ok(matching("this Monday").length > 0);
  assert.ok(
    matching("this Monday").every((item) => item.date === "2026-07-13"),
  );
  assert.ok(matching("last Thursday").length > 0);
  assert.ok(
    matching("last Thursday").every((item) => item.date === "2026-07-09"),
  );
  assert.deepEqual(matching("monday"), matching("this monday"));
  assert.ok(matching("tomorrow").length === 0);
  assert.ok(matching("between yesterday and last monday").length > 0);
  assert.ok(
    matching("between yesterday and last monday").every(
      (item) => item.date >= "2026-07-06" && item.date <= "2026-07-15",
    ),
  );
  assert.deepEqual(
    matching("between last monday and yesterday"),
    matching("between yesterday and last monday"),
  );
  assert.deepEqual(matching("last thurstday"), matching("last Thursday"));
  assert.deepEqual(matching("2 weks ago"), matching("2 weeks ago"));
  assert.deepEqual(matching("yestarday"), matching("yesterday"));
  assert.deepEqual(
    matching("betwen yestrday and last mnday"),
    matching("between yesterday and last monday"),
  );
  assert.deepEqual(matching("pixlgrid"), matching("pixelgrid"));
  assert.deepEqual(matching("2/30"), []);
});

test("time query parser: tomorrow and between-range resolve to correct ISO bounds", () => {
  const now = new Date(2026, 6, 16, 12);
  const tomorrow = searchDate("tomorrow", now);
  assert.deepEqual(tomorrow, {
    start: "2026-07-17",
    end: "2026-07-17",
    phrase: "tomorrow",
  });

  const between = searchDate("between yesterday and last monday", now);
  assert.equal(between.start, "2026-07-06");
  assert.equal(between.end, "2026-07-15");

  const reversed = searchDate("between last monday and yesterday", now);
  assert.equal(reversed.start, between.start);
  assert.equal(reversed.end, between.end);
});

test("time query parser: bare 'X and Y' / 'X to Y' ranges without the word 'between'", () => {
  const now = new Date(2026, 6, 16, 12);

  const andRange = searchDate("today and yesterday", now);
  assert.deepEqual(andRange, {
    start: "2026-07-15",
    end: "2026-07-16",
    phrase: "today and yesterday",
  });

  const toRange = searchDate("today to last monday", now);
  assert.deepEqual(toRange, {
    start: "2026-07-06",
    end: "2026-07-16",
    phrase: "today to last monday",
  });
  const equivalentBetween = searchDate("between last monday and today", now);
  assert.equal(toRange.start, equivalentBetween.start);
  assert.equal(toRange.end, equivalentBetween.end);

  // Plain text containing "and"/"to" must not be misread as a range.
  assert.equal(searchDate("how to use gsap", now), null);
  assert.equal(searchDate("component library and tailwind", now), null);
});

test("time query parser: bare weekday names resolve to the most recent occurrence", () => {
  const now = new Date(2026, 6, 16, 12); // Thursday, July 16 2026

  assert.deepEqual(searchDate("monday", now), {
    start: "2026-07-13",
    end: "2026-07-13",
    phrase: "monday",
  });
  assert.deepEqual(searchDate("thursday", now), {
    start: "2026-07-16",
    end: "2026-07-16",
    phrase: "thursday",
  });
  assert.deepEqual(searchDate("friday", now), {
    start: "2026-07-10",
    end: "2026-07-10",
    phrase: "friday",
  });

  // "this"/"last" qualifiers still take priority over the bare-weekday fallback.
  assert.deepEqual(searchDate("this monday", now), {
    start: "2026-07-13",
    end: "2026-07-13",
    phrase: "this monday",
  });
  assert.deepEqual(searchDate("last monday", now), {
    start: "2026-07-06",
    end: "2026-07-06",
    phrase: "last monday",
  });
});

for (const item of registryItems) {
  test(`${item.name}: installs cleanly`, () => {
    const shipped = new Set(item.files.map((f) => f.path.replace(/\\/g, "/")));
    const targets = new Set();
    const problems = [];

    for (const file of item.files) {
      // Route handler readFile()s file.path; a missing file is a 500 / broken
      // install.
      if (!exists(file.path)) {
        problems.push(`missing file on disk: ${file.path}`);
        continue;
      }
      assert.ok(
        FILE_TYPES.has(file.type),
        `${file.path}: invalid file type "${file.type}"`,
      );
      assert.ok(file.target, `${file.path}: missing target`);
      assert.ok(
        !targets.has(file.target),
        `duplicate install target: ${file.target}`,
      );
      targets.add(file.target);

      const src = readFile(file.path);
      for (const problem of analyzeFile(
        file.path,
        src,
        shipped,
        item.dependencies,
      )) {
        problems.push(`${file.path}: ${problem}`);
      }
    }

    assert.deepEqual(problems, [], `\n  - ${problems.join("\n  - ")}\n`);
  });
}

// The demo shown in the site iframe imports the exact source that ships, so
// "what you see" == "what installs". Enforce that binding for every item.
for (const item of registryItems) {
  if (item.section === "backend") continue;

  test(`${item.name}: demo renders the installed source`, () => {
    const demoPath = `src/components/demos/${item.name}.tsx`;
    assert.ok(exists(demoPath), `no demo at ${demoPath}`);
    const demo = readFile(demoPath);
    const importsSource = new RegExp(
      `@/registry/${item.name}(?:["'/]|$)`,
      "m",
    ).test(demo);
    assert.ok(
      importsSource,
      `${demoPath} does not import @/registry/${item.name}`,
    );
  });
}

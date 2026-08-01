/**
 * Natural-language date parsing for the search boxes (inspiration + registry).
 *
 * Two halves matter here. The first locks the grammar: every phrase a person
 * might type, resolved against a fixed "now". The second locks what must NOT
 * parse, which is the harder half — months and years are ordinary English and
 * version numbers, and a date filter that fires on prose silently hides most
 * of the results with no way for the reader to tell why.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTimeQuery, searchDate } from "@/lib/search-time";

/** Sunday 2 August 2026. Every expectation below is relative to this. */
const NOW = new Date(2026, 7, 2);

const range = (query) => {
  const date = searchDate(query.toLowerCase(), NOW);
  return date ? [date.start, date.end] : null;
};

const cases = (label, table) => {
  test(label, () => {
    for (const [query, expected] of table) {
      assert.deepEqual(range(query), expected, `"${query}"`);
    }
  });
};

cases("months, with and without a year", [
  ["july 2026", ["2026-07-01", "2026-07-31"]],
  ["jul 2026", ["2026-07-01", "2026-07-31"]],
  ["july of 2026", ["2026-07-01", "2026-07-31"]],
  ["february 2024", ["2024-02-01", "2024-02-29"]], // leap year
  ["july", ["2026-07-01", "2026-07-31"]],
  ["december", ["2026-12-01", "2026-12-31"]],
]);

cases("years", [
  ["2026", ["2026-01-01", "2026-12-31"]],
  ["in 2025", ["2025-01-01", "2025-12-31"]],
  ["this year", ["2026-01-01", "2026-12-31"]],
  ["last year", ["2025-01-01", "2025-12-31"]],
  ["1 year ago", ["2025-01-01", "2025-12-31"]],
]);

cases("rolling windows run up to today", [
  ["last 3 months", ["2026-05-02", "2026-08-02"]],
  ["past 2 weeks", ["2026-07-19", "2026-08-02"]],
  ["last 6 days", ["2026-07-27", "2026-08-02"]],
  ["past 1 year", ["2025-08-02", "2026-08-02"]],
]);

cases("one-sided ranges", [
  ["since july", ["2026-07-01", "9999-12-31"]],
  ["since 2026-07-15", ["2026-07-15", "9999-12-31"]],
  ["after last week", ["2026-07-20", "9999-12-31"]],
  ["before 2026", ["0001-01-01", "2026-12-31"]],
  ["until last week", ["0001-01-01", "2026-07-26"]],
  ["up to friday", ["0001-01-01", "2026-07-31"]],
]);

cases("calendar periods name the whole period", [
  ["last week", ["2026-07-20", "2026-07-26"]],
  ["this week", ["2026-07-27", "2026-08-02"]],
  ["this month", ["2026-08-01", "2026-08-31"]],
  ["last month", ["2026-07-01", "2026-07-31"]],
  ["2 months ago", ["2026-06-01", "2026-06-30"]],
]);

cases("single days", [
  ["today", ["2026-08-02", "2026-08-02"]],
  ["yesterday", ["2026-08-01", "2026-08-01"]],
  ["2 days ago", ["2026-07-31", "2026-07-31"]],
  ["monday", ["2026-07-27", "2026-07-27"]],
  ["last friday", ["2026-07-24", "2026-07-24"]],
]);

cases("explicit dates in every notation", [
  ["2026-07-19", ["2026-07-19", "2026-07-19"]],
  ["7/19/2026", ["2026-07-19", "2026-07-19"]],
  ["july 19 2026", ["2026-07-19", "2026-07-19"]],
  ["july 19th", ["2026-07-19", "2026-07-19"]],
  ["19 july 2026", ["2026-07-19", "2026-07-19"]],
]);

cases("two-sided ranges", [
  ["between july 1 2026 and july 20 2026", ["2026-07-01", "2026-07-20"]],
  ["july 1 2026 to july 20 2026", ["2026-07-01", "2026-07-20"]],
]);

test("a day beats the month it sits in", () => {
  // Regression: a month+year pattern placed ahead of the day patterns ate the
  // "july 2026" inside "19 july 2026" and widened the day to the whole month.
  for (const query of ["19 july 2026", "july 19 2026", "1 august 2026"]) {
    const [start, end] = range(query);
    assert.equal(
      start,
      end,
      `"${query}" should be a single day, got ${start}..${end}`,
    );
  }
});

test("prose and version numbers are not dates", () => {
  // Every one of these contains a month name or a four-digit number. A date
  // match here would filter the results down to that period and quietly drop
  // whatever the person was actually searching for.
  const notDates = [
    "things that may help",
    "march of the icons",
    "august smith portfolio",
    "react 19",
    "tailwind 2024",
    "next 15 app router",
    "effect 3",
    "shadcn ui",
  ];
  for (const query of notDates) {
    assert.equal(searchDate(query, NOW), null, `"${query}" parsed as a date`);
  }
});

test("an unambiguous month still reads as a date mid-query", () => {
  const { date, words } = parseTimeQuery("icons july", NOW);
  assert.deepEqual([date?.start, date?.end], ["2026-07-01", "2026-07-31"]);
  assert.deepEqual(words, ["icons"]);
});

test("text and date split cleanly, leaving no scaffolding behind", () => {
  for (const [query, expected] of [
    ["react added last week", ["react"]],
    ["added july 2026", []],
    ["show me icons from july 2026", ["icons"]],
    ["since july", []],
    ["up to friday", []],
  ]) {
    assert.deepEqual(parseTimeQuery(query, NOW).words, expected, `"${query}"`);
  }
});

test("typos in date words still resolve", () => {
  // Correction runs in parseTimeQuery, as a second pass after the literal
  // query fails, and only for words of 4+ characters.
  for (const [query, expected] of [
    ["lasr week", ["2026-07-20", "2026-07-26"]],
    ["last weel", ["2026-07-20", "2026-07-26"]],
    ["yestrday", ["2026-08-01", "2026-08-01"]],
    ["jully 2026", ["2026-07-01", "2026-07-31"]],
    ["3 monts ago", ["2026-05-01", "2026-05-31"]],
  ]) {
    const { date } = parseTimeQuery(query, NOW);
    assert.deepEqual([date?.start, date?.end], expected, `"${query}"`);
  }
});

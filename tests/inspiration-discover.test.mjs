import assert from "node:assert/strict";
import { test } from "node:test";
import {
  discoverInspiration,
  diversifyCandidates,
} from "../src/lib/inspiration-discover.ts";

const BROAD_QUERY =
  "help me explore what I could use for a new developer tool interface";

test("broad discovery returns a varied usable scan", () => {
  const result = discoverInspiration(BROAD_QUERY);
  assert.ok(result.candidates.length >= 8, result.candidates.length);
  assert.ok(result.candidates.length <= 12, result.candidates.length);
  assert.ok(
    new Set(result.candidates.map((item) => item.id)).size ===
      result.candidates.length,
  );
  assert.ok(new Set(result.candidates.map((item) => item.category)).size >= 3);
  assert.ok(new Set(result.candidates.flatMap((item) => item.roles)).size >= 3);

  for (const candidate of result.candidates) {
    assert.match(candidate.id, /^insp_[a-z0-9-]+$/);
    assert.ok(candidate.matchedSignals.length > 0, candidate.title);
    assert.ok(candidate.whySurfaced.length > 0, candidate.title);
    assert.ok(candidate.engagement.instruction.length > 0, candidate.title);
  }
});

test("discovery is deterministic and bounded", () => {
  const first = discoverInspiration(BROAD_QUERY, { limit: 10 });
  const second = discoverInspiration(BROAD_QUERY, { limit: 10 });
  assert.deepEqual(
    first.candidates.map((item) => item.id),
    second.candidates.map((item) => item.id),
  );
  assert.equal(first.candidates.length, 10);

  const low = discoverInspiration(BROAD_QUERY, { limit: 1 });
  const high = discoverInspiration(BROAD_QUERY, { limit: 99 });
  assert.ok(low.candidates.length >= 8);
  assert.ok(high.candidates.length <= 12);
});

test("category and host caps hold when the pool is broad enough", () => {
  const candidates = Array.from({ length: 10 }, (_, index) => ({
    id: `insp_fixture-${index}`,
    source: "wall",
    title: `Fixture ${index}`,
    href: `https://fixture-${index}.example/item`,
    category: `Category ${index % 5}`,
    roles: index % 2 ? ["tool"] : ["library"],
    band: "direct",
    score: 10 - index / 10,
    matchedSignals: ["fixture query match"],
    whySurfaced: "fixture query match",
    engagement: {
      mode: "use-evaluate",
      instruction: "Use the fixture.",
      evidenceRequired: "Fixture evidence.",
    },
  }));
  const selected = diversifyCandidates(candidates, {
    limit: 10,
    maxPerCategory: 2,
    maxPerHost: 2,
  });
  const categoryCounts = new Map();
  const hostCounts = new Map();
  for (const item of selected) {
    categoryCounts.set(
      item.category,
      (categoryCounts.get(item.category) ?? 0) + 1,
    );
    const host = new URL(item.href).hostname.replace(/^www\./, "");
    hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
  }
  assert.ok([...categoryCounts.values()].every((count) => count <= 2));
  assert.ok([...hostCounts.values()].every((count) => count <= 2));
});

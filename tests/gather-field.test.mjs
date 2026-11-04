// Point placement has to agree with itself: the curve visits every cell once,
// the camera origin stays at the centre, and a painted plate yields finite points.
//
//   node --import ./tests/alias-hooks.mjs --test tests/gather-field.test.mjs

import assert from "node:assert/strict";
import { test } from "node:test";
import { lightEnvelope, project } from "../src/registry/gather-field/motion.ts";
import { paintPlate } from "../src/registry/gather-field/plates.ts";
import { hilbertXY, samplePlate } from "../src/registry/gather-field/sample.ts";

test("hilbert order visits every cell once", () => {
  for (const n of [2, 8]) {
    const seen = new Set();
    for (let d = 0; d < n * n; d++) {
      const [x, y] = hilbertXY(n, d);
      seen.add(`${x},${y}`);
    }
    assert.equal(seen.size, n * n);
  }
});

test("the origin projects to the centre of the frame", () => {
  const p = project(0, 0, 0, {
    yaw: 0,
    pitch: 0,
    zoom: 1,
    pushX: 0,
    pushY: 0,
  });
  assert.equal(p.ndcX, 0);
  assert.equal(p.ndcY, 0);
});

test("a painted plate samples a full finite cloud", () => {
  const plate = paintPlate("sphere", 64);
  const cloud = samplePlate(
    plate.rgba,
    plate.depth,
    64,
    128,
    "dark",
    "negative",
  );
  assert.equal(cloud.seed.length, 128);
  for (let i = 0; i < 128; i++) {
    assert.equal(Number.isFinite(cloud.home[i * 3]), true);
    assert.equal(Number.isFinite(cloud.home[i * 3 + 1]), true);
    assert.equal(Number.isFinite(cloud.home[i * 3 + 2]), true);
  }
});

test("a lamp is dark at the strike and bright once the attack finishes", () => {
  assert.equal(lightEnvelope(0), 0);
  assert.ok(lightEnvelope(0.018) > 0.8);
});

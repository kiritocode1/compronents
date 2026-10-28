// The flower's shaders, palette and stem are checked against the pinned module,
// not against a screenshot. The live canvas is mid-loop, so a pixel diff would
// move every time the clock does.
//
//   node --import ./tests/alias-hooks.mjs --test tests/balloon-zinnia.test.mjs

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  writePalette,
  writeStem,
} from "../src/registry/balloon-zinnia/geometry.ts";
import {
  COMPOSITION_ASPECT,
  COMPOSITION_HALF,
  DEFAULT_SETTINGS,
  HEAD_LIFT,
  PALETTE,
  PALETTE_WIDTH,
  STEM_SAMPLES,
} from "../src/registry/balloon-zinnia/model.ts";
import {
  PETAL_FRAG,
  PETAL_VERT,
  STEM_FRAG,
  STEM_VERT,
} from "../src/registry/balloon-zinnia/shaders.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pretty = fs.readFileSync(
  path.join(root, "reference/balloon-zinnia/component.pretty.mjs"),
  "utf8",
);

function slice(from, to) {
  const start = pretty.indexOf(from);
  const end = pretty.indexOf(to);
  assert.ok(start >= 0 && end > start, `missing ${from} .. ${to}`);
  return pretty.slice(start, end);
}

test("shaders match the pinned module, including the projection constants", () => {
  const built = new Function(
    `var Xe = 512;\n${slice("var Je = 0.5", "function tr(")}\nreturn { Ta, Ra, petal: er(false), stem: er(true) };`,
  )();
  assert.equal(PETAL_VERT, built.Ta);
  assert.equal(STEM_VERT, built.Ra);
  assert.equal(PETAL_FRAG, built.petal);
  assert.equal(STEM_FRAG, built.stem);
  assert.match(PETAL_VERT, /1\.008368/);
  assert.match(PETAL_VERT, /-1\.004184/);
  assert.match(PETAL_FRAG, /fwidth\(t\) \* 512\.0/);
});

test("the palette row matches the pinned baker", () => {
  const { xa, Sn } = new Function(
    `${slice("var Sn = [", "function p(")}\n${slice("function p(n, s, i)", "function Jo(")}\nreturn { xa, Sn };`,
  )();
  assert.deepEqual(PALETTE, Sn);
  assert.deepEqual(DEFAULT_SETTINGS.colors, Sn);
  const ours = new Uint8Array(PALETTE_WIDTH * 4);
  const theirs = new Uint8Array(PALETTE_WIDTH * 4);
  writePalette(PALETTE, ours);
  xa(Sn, theirs);
  assert.deepEqual(ours, theirs);
});

test("the stem samples match the pinned curve at several bends", () => {
  const { ga } = new Function(
    `var xe = Math.PI * 2, K = Math.PI / 180, Ln = 0.12, zo = 0.71, fa = 3, jo = 1.2, Zo = 48, Yo = 17, oe = 220;\n${slice("function ga(n, s, i, a)", "var Je = 0.5")}\n${slice("function p(n, s, i)", "function w(")}\nreturn { ga };`,
  )();
  for (const curve of [0, 0.5, 1, 3]) {
    const positions = new Float64Array(STEM_SAMPLES * 3);
    const normals = new Float64Array(STEM_SAMPLES * 3);
    const binormals = new Float64Array(STEM_SAMPLES * 3);
    const theirsP = new Float64Array(STEM_SAMPLES * 3);
    const theirsN = new Float64Array(STEM_SAMPLES * 3);
    const theirsB = new Float64Array(STEM_SAMPLES * 3);
    writeStem(curve, positions, normals, binormals);
    ga(curve, theirsP, theirsN, theirsB);
    assert.deepEqual(positions, theirsP, `positions at curve ${curve}`);
    assert.deepEqual(normals, theirsN, `normals at curve ${curve}`);
    assert.deepEqual(binormals, theirsB, `binormals at curve ${curve}`);
  }
});

test("the public defaults are the editor base preset, not the hidden fallbacks", () => {
  assert.equal(DEFAULT_SETTINGS.background, "#000000");
  assert.equal(DEFAULT_SETTINGS.petals, 22);
  assert.equal(DEFAULT_SETTINGS.grain, 0);
  assert.equal(DEFAULT_SETTINGS.puff, 134);
  assert.equal(DEFAULT_SETTINGS.bands, 5);
  assert.equal(DEFAULT_SETTINGS.scale, 100);
  assert.equal(DEFAULT_SETTINGS.stem.show, true);
  assert.equal(DEFAULT_SETTINGS.stem.curve, 100);
  assert.equal(DEFAULT_SETTINGS.entrance.animate, false);
  assert.equal(DEFAULT_SETTINGS.advanced.lean, 48);
  assert.equal(DEFAULT_SETTINGS.advanced.bandAxis, 48);
  assert.equal(DEFAULT_SETTINGS.advanced.cup, 25);
  assert.equal(DEFAULT_SETTINGS.advanced.phase, 60);
  assert.equal(DEFAULT_SETTINGS.advanced.pulseDepth, 36);
  assert.equal(DEFAULT_SETTINGS.advanced.breatheAngle, 35);
  assert.equal(DEFAULT_SETTINGS.advanced.swayPeriod, 14);
  assert.equal(COMPOSITION_ASPECT, 720 / 1280);
  assert.equal(COMPOSITION_HALF, 0.226);
  assert.equal(HEAD_LIFT, 0.098);
  assert.match(pretty, /var Pr = 15/);
  assert.match(pretty, /lean: 50/);
  assert.match(pretty, /phase: 72/);
  assert.match(pretty, /defaultValue: 22/);
  assert.match(pretty, /defaultValue: 48/);
});

test("shipped source does not name the origin studio", () => {
  const dir = path.join(root, "src/registry/balloon-zinnia");
  for (const file of fs.readdirSync(dir)) {
    const text = fs.readFileSync(path.join(dir, file), "utf8").toLowerCase();
    assert.equal(text.includes("originkit"), false, file);
    assert.equal(text.includes("codegrid"), false, file);
  }
});

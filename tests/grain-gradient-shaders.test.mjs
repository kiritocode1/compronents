// Proves the grain-gradient port is 1:1 at the shader level.
//
//   node --import ./tests/alias-hooks.mjs --test tests/grain-gradient-shaders.test.mjs
//
// tests/fixtures/grain-gradient/ holds the eight GLSL programs the original
// scene actually compiled and ran. src/registry/grain-gradient-field/shaders.ts
// is generated from those fixtures with every art-directable literal lifted to
// a template slot, so at DEFAULT_CONFIG each builder must return its fixture
// byte-for-byte. Anything else means a knob leaked a formatting change into the
// shader, which is precisely the drift a screenshot will not show you.
//
// It also pins the two items' shared sources together: the nav variant ships
// its own copy so it installs standalone, and copies rot.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CONFIG,
  diffuseFrag,
  gradientFrag,
  mouseReadFrag,
  mouseWriteFrag,
  noiseBlurFrag,
  sdfShapeFrag,
  sineFrag,
} from "../src/registry/grain-gradient-field/shaders.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = (name) =>
  fs.readFileSync(
    path.join(root, "tests/fixtures/grain-gradient", name),
    "utf8",
  );

const CASES = [
  ["0-gradient.frag", gradientFrag],
  ["1-sdf-shape.frag", sdfShapeFrag],
  ["2-noise-blur.frag", noiseBlurFrag],
  ["2-noise-blur-1.frag", noiseBlurFrag],
  ["3-sine.frag", sineFrag],
  ["4-mouse.frag", mouseReadFrag],
  ["4-mouse-1.frag", mouseWriteFrag],
  ["5-diffuse.frag", diffuseFrag],
];

for (const [name, build] of CASES) {
  test(`${name} is reproduced byte-for-byte at default config`, () => {
    assert.equal(build(DEFAULT_CONFIG), fixture(name));
  });
}

test("every config knob actually reaches a shader", () => {
  const all = CASES.map(([, build]) => build(DEFAULT_CONFIG)).join("\n");
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    const value = DEFAULT_CONFIG[key];
    const probe = { ...DEFAULT_CONFIG };
    // Perturb by something that survives both toFixed(4) and String().
    probe[key] = Array.isArray(value)
      ? value.map((v) => v + 0.0137)
      : value + 0.0137;
    const moved = CASES.map(([, build]) => build(probe)).join("\n");
    assert.notEqual(moved, all, `${key} changes nothing in any shader`);
  }
});

test("the nav item ships byte-identical copies of the shared sources", () => {
  for (const file of ["shaders.ts", "engine.ts"]) {
    const a = path.join(root, "src/registry/grain-gradient-field", file);
    const b = path.join(root, "src/registry/grain-gradient-nav", file);
    assert.ok(fs.existsSync(b), `grain-gradient-nav/${file} is missing`);
    assert.equal(
      fs.readFileSync(b, "utf8"),
      fs.readFileSync(a, "utf8"),
      `${file} drifted between the two items; run scripts/gen-grain-shaders.mjs`,
    );
  }
});

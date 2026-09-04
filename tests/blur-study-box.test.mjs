// Guards the Blur Study Box against drift from the pinned Kelly Milligan study.
//
//   node --test tests/blur-study-box.test.mjs

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file));
const text = (file) => read(file).toString("utf8");
const engine = text("src/registry/blur-study-box/engine.ts");
const shader = text("src/registry/blur-study-box/shader.ts");
const component = text("src/registry/blur-study-box/index.tsx");
const mechanics = JSON.parse(text("reference/blur-study-box/mechanics.json"));
const source = JSON.parse(text("reference/blur-study-box/source.json"));

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

test("the pinned source files keep their captured hashes", () => {
  for (const [file, expectedHash] of Object.entries(source.files)) {
    assert.equal(
      sha256(read(`reference/blur-study-box/${file}`)),
      expectedHash,
      `${file} changed after capture`,
    );
  }
});

test("box3d-wasm supplies the exact reference binary", () => {
  const wasm = read("node_modules/box3d-wasm/dist/box3d.wasm");
  assert.equal(wasm.byteLength, source.uncommittedBinary.bytes);
  assert.equal(sha256(wasm), source.uncommittedBinary.sha256);
});

test("physics and render constants match mechanics.json", () => {
  const expectedEngineValues = [
    ["const BODY_COUNT = 64", mechanics.render.bodyCount],
    ["const FIXED_STEP = 1 / 60", mechanics.physics.fixedStep],
    ["const SUBSTEPS = 4", mechanics.physics.substeps],
    ["const FLOOR_Y = -9", mechanics.physics.floorY],
    ["const CEILING_Y = 9", mechanics.physics.ceilingY],
    ["const HALF_WIDTH = 12", mechanics.physics.halfWidth],
    ["const PANE_Z = 1.2", mechanics.physics.frontZ],
    ["const WALL_THICKNESS = 0.5", mechanics.physics.wallThickness],
    ["const USER_DATA_START = 10_000", mechanics.physics.bodyUserDataStart],
    ["blur: 0.45", mechanics.defaults.blur],
    ["blurCurve: 3.15", mechanics.defaults.blurCurve],
    ["blurDistance: 1.6", mechanics.defaults.blurDistance],
    ["boxDepth: 5.2", mechanics.defaults.boxDepth],
    ["rodLength: 4", mechanics.defaults.rodLength],
    ["rodRadius: 0.5", mechanics.defaults.rodRadius],
    ["volumeDensity: 4.5", mechanics.defaults.volumeDensity],
    ["opacityFalloff: 3.5", mechanics.defaults.opacityFalloff],
    ["popStrength: 15", mechanics.defaults.popStrength],
    ["popTempo: 0.1", mechanics.defaults.popTempo],
    ["mulberry32(1_327_115_068)", mechanics.physics.seed],
    ["gravity: { x: 0, y: -11, z: 0 }", mechanics.physics.gravity],
    ["linearDamping: 0.32", mechanics.physics.linearDamping],
    ["angularDamping: 0.46", mechanics.physics.angularDamping],
    ["sleepThreshold: 0.35", mechanics.physics.sleepThreshold],
    ["density: 0.72", mechanics.physics.density],
    ["friction: 0.46", mechanics.physics.friction],
    ["restitution: 0.22", mechanics.physics.restitution],
    ["Math.PI * 2 * 5.5", mechanics.physics.dragFrequency],
    ["2 * 0.88 * mass", mechanics.physics.dragDampingRatio],
    ["mass * 420", mechanics.physics.dragForceLimit],
  ];

  for (const [needle] of expectedEngineValues) {
    assert.ok(engine.includes(needle), `missing source constant: ${needle}`);
  }

  const expectedShaderValues = [
    "0.004 + params.blur",
    "* 3.0",
    "2.0 / 96.0",
    "sample < 96u",
    "max(params.blurDistance, 0.001)",
    "params.blurCurve",
    "exp(-0.5 * pow(distance / width, 2.0))",
    "0.96 * exp(-ramp * params.opacityFalloff)",
    "1.0 - exp(-(gaussian * stepDepth * params.volumeDensity))",
    "noise * params.ditherStrength / 255.0",
    "return vec4f(vec3f(0.008)",
    "linearToSrgb(linear.r)",
  ];
  for (const needle of expectedShaderValues) {
    assert.ok(shader.includes(needle), `missing shader mechanic: ${needle}`);
  }
});

test("all capsules use one instanced draw and one instance-buffer write", () => {
  assert.match(engine, /instanceCount: INSTANCE_COUNT/);
  assert.match(engine, /instances: INSTANCE_COUNT/);
  assert.equal(
    [...engine.matchAll(/geometry\(gpu,/g)].length,
    1,
    "capsules should share one Geometry",
  );
  assert.equal(
    [...engine.matchAll(/studyGeometry\.buffers\[1\]\.write/g)].length,
    2,
    "the instance buffer should only update on rebuild and once per frame",
  );
  assert.doesNotMatch(engine, /bodies\.map\([^)]*draw/);
});

test("the expensive runtime is client-only and dynamically imported", () => {
  assert.match(component, /^"use client";/);
  assert.match(component, /import\("\.\/engine"\)/);
  assert.doesNotMatch(component, /from "vgpu"/);
  assert.doesNotMatch(component, /from "box3d-wasm/);
  assert.doesNotMatch(component, /from "tweakpane"/);
});

test("PNG output uses bounded tiles, streaming compression, and header verification", () => {
  const png = text("src/registry/blur-study-box/png.ts");
  assert.match(png, /const tileWidth = 1024/);
  assert.match(png, /const stripeHeight = 256/);
  assert.match(png, /new CompressionStream\("deflate"\)/);
  assert.match(png, /supportsOriginPrivateFileSystem/);
  assert.match(png, /await verifyPng\(file, size, size\)/);
});

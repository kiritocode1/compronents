// Guards the Blur Study Grid against drift from the pinned Kelly Milligan study.
//
//   node --test tests/blur-study-grid.test.mjs

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file));
const text = (file) => read(file).toString("utf8");
const engine = text("src/registry/blur-study-grid/engine.ts");
const shader = text("src/registry/blur-study-grid/shader.ts");
const component = text("src/registry/blur-study-grid/index.tsx");
const studio = text("src/components/studios/blur-study-grid.tsx");
const mechanics = JSON.parse(text("reference/blur-study-grid/mechanics.json"));
const source = JSON.parse(text("reference/blur-study-grid/source.json"));

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

test("the pinned source files keep their captured hashes", () => {
  for (const [file, expectedHash] of Object.entries(source.files)) {
    assert.equal(
      sha256(read(`reference/blur-study-grid/${file}`)),
      expectedHash,
      `${file} changed after capture`,
    );
  }
});

test("the four studies still share one stylesheet", () => {
  assert.equal(
    sha256(read("reference/blur-study-grid/index-Bd5woOhd.css")),
    sha256(read("reference/blur-study-box/index-Bd5woOhd.css")),
  );
});

test("grid and camera constants match mechanics.json", () => {
  const expected = [
    ["const COLUMNS = 10", mechanics.grid.columns],
    ["const ROWS = 10", mechanics.grid.rows],
    ["const SPACING_X = 2.3", mechanics.grid.spacingX],
    ["const SPACING_Y = 2", mechanics.grid.spacingY],
    ["const SEED = 1_327_115_068", mechanics.grid.seed],
    ["23.5 + (mobile ? 7 : 4)", mechanics.camera.baseVerticalSpan],
    ["29 / aspect", mechanics.camera.minimumHorizontalSpan],
    ["blur: 0.32", mechanics.defaults.blur],
    ["blurCurve: 3.55", mechanics.defaults.blurCurve],
    ["blurDistance: 1.6", mechanics.defaults.blurDistance],
    ["paneZ: 1.1", mechanics.defaults.paneZ],
    ["depthSpread: 0.5", mechanics.defaults.depthSpread],
    ["rodLength: 2", mechanics.defaults.rodLength],
    ["rodRadius: 0.42", mechanics.defaults.rodRadius],
    ["volumeDensity: 4.5", mechanics.defaults.volumeDensity],
    ["opacityFalloff: 1.6", mechanics.defaults.opacityFalloff],
    ["trackingSpeed: 0.45", mechanics.defaults.trackingSpeed],
  ];
  for (const [needle] of expected) {
    assert.ok(engine.includes(needle), `missing source constant: ${needle}`);
  }

  // The whole motion model, in the source's own form.
  assert.ok(engine.includes("2 + settings.trackingSpeed * 14"));
  assert.ok(engine.includes("1 - Math.exp(-delta * rate)"));
  assert.ok(engine.includes("settings.rodLength * 0.5 - settings.rodRadius"));
  assert.ok(
    engine.includes("settings.rodRadius + 3 * (0.004 + settings.blur)"),
    "proxy reach must stay at three maximum blur widths",
  );
});

test("the shader keeps the source's depth integral", () => {
  const expected = [
    "0.004 + params.blur",
    "* 3.0",
    "2.0 / 96.0",
    "unrolledSamples(96)",
    "max(params.blurDistance, 0.001)",
    "params.blurCurve",
    "exp(-0.5 * pow(distance / width, 2.0))",
    "0.96 * exp(-ramp * params.opacityFalloff)",
    "1.0 - exp(-(gaussian * stepDepth * params.volumeDensity))",
    "noise * params.ditherStrength / 255.0",
    "return vec4f(vec3f(0.008)",
    "linearToSrgb(linear.r)",
  ];
  for (const needle of expected) {
    assert.ok(shader.includes(needle), `missing shader mechanic: ${needle}`);
  }
});

test("the grid drops the box study's floor but nothing else", () => {
  const box = text("src/registry/blur-study-box/shader.ts");
  for (const gone of ["showFloor", "input.kind", "fwidth"]) {
    assert.ok(box.includes(gone), `box shader should still have ${gone}`);
    assert.ok(!shader.includes(gone), `grid shader should not have ${gone}`);
  }

  // The sample body must still be the box study's, character for character,
  // once the loop counter is rewritten as the emitted literal index. The
  // source builds its own graph the same way, by inlining a JS loop, so this
  // is the faithful form rather than a divergence from it.
  const between = (src, from, to) =>
    src.slice(src.indexOf(from) + from.length, src.indexOf(to));
  const boxBody = between(
    box,
    "let jitteredSample = ",
    "transmittance *= 1.0 - absorption;",
  );
  const gridBody = between(
    shader,
    "let jittered = ",
    "transmittance *= 1.0 - absorption;",
  );
  assert.equal(
    gridBody
      .replace(/\$\{index\}\.0/, "f32(sample)")
      .replaceAll("jittered", "jitteredSample"),
    boxBody,
  );
});

test("the ninety-six samples are emitted inline, not looped", () => {
  assert.match(shader, /function unrolledSamples\(count: number\)/);
  assert.match(shader, /\$\{unrolledSamples\(96\)\}/);
  // A dynamic break would stop the compiler inlining the body, which measured
  // as a real per-fragment cost against the source.
  assert.doesNotMatch(shader, /\bbreak;/);
});

test("all capsules use one instanced draw and one instance-buffer write", () => {
  assert.match(engine, /instanceCount: BODY_COUNT/);
  assert.match(engine, /instances: BODY_COUNT/);
  assert.equal(
    [...engine.matchAll(/geometry\(gpu,/g)].length,
    1,
    "capsules should share one Geometry",
  );
  assert.equal(
    [...engine.matchAll(/studyGeometry\.buffers\[1\]\.write/g)].length,
    2,
    "the instance buffer should only update on redraw and once per frame",
  );
});

test("the expensive runtime is client-only and dynamically imported", () => {
  assert.match(component, /^"use client";/);
  assert.match(component, /import\("\.\/engine"\)/);
  assert.doesNotMatch(component, /from "vgpu"/);
  assert.doesNotMatch(component, /from "tweakpane"/);
});

test("a settings change writes uniforms instead of remounting the engine", () => {
  // The mount effect must not depend on settings, or every slider tick would
  // drop the GPU context and rebuild the grid.
  assert.match(component, /\}, \[renderScale\]\);/);
  assert.match(component, /handleRef\.current\?\.setSettings\(/);
  assert.match(engine, /const setSettings = \(next: Partial<StudySettings>\)/);
});

test("the control panel lives in the studio, not in the component", () => {
  assert.doesNotMatch(component, /SliderComfortable/);
  assert.match(studio, /from "@\/components\/site\/studio-controls"/);

  // Every binding the source's Tweakpane exposed is present, with its range.
  const bindings = mechanics.controls.folders.flatMap(
    (folder) => folder.bindings,
  );
  assert.equal(bindings.length, 11);
  for (const binding of bindings) {
    assert.ok(
      studio.includes(`label="${binding.label}"`),
      `studio is missing the ${binding.label} control`,
    );
    assert.ok(
      studio.includes(`min={${binding.min}}`) &&
        studio.includes(`max={${binding.max}}`),
      `studio is missing the ${binding.label} range`,
    );
  }
});

test("the port does not write to a host's storage", () => {
  for (const file of [engine, component, studio]) {
    assert.doesNotMatch(file, /localStorage/);
  }
});

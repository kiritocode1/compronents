// Proves the frosted-plate carousel stays 1:1 with the unveil.fr pin.
//
//   node --test tests/frosted-plate-carousel.test.mjs

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pin = (name) =>
  fs.readFileSync(path.join(root, "reference/unveil", name), "utf8");
const src = fs.readFileSync(
  path.join(root, "src/registry/frosted-plate-carousel.tsx"),
  "utf8",
);

function extractTemplate(name) {
  const marker = `export const ${name} = \``;
  const open = src.indexOf(marker);
  assert.ok(open >= 0, `${name} export is missing`);
  const from = open + marker.length;
  const close = src.indexOf("`;", from);
  assert.ok(close >= 0, `${name} template is unclosed`);
  return src.slice(from, close);
}

test("vertex shader matches the pinned unveil tile.vert", () => {
  assert.equal(extractTemplate("TILE_VERT"), pin("tile.vert"));
});

test("fragment shader matches the pinned unveil tile.frag", () => {
  assert.equal(extractTemplate("TILE_FRAG"), pin("tile.frag"));
});

test("numeric mechanics match reference/unveil/mechanics.json", () => {
  const mechanics = JSON.parse(pin("mechanics.json"));
  const checks = [
    ["fov: 5", mechanics.camera.fov],
    ["cameraNear: 0.1", mechanics.camera.near],
    ["cameraFar: 1000", mechanics.camera.far],
    ["cameraY: 100 / 7.5", mechanics.camera.positionYExpr],
    ["cameraZDesktop: 35", mechanics.camera.positionZDesktop],
    ["cameraZPortrait: 55", mechanics.camera.positionZPortrait],
    ["clickDollyZDesktop: 30", mechanics.camera.clickDollyZDesktop],
    ["clickDollyZNarrow: 35", mechanics.camera.clickDollyZNarrow],
    ["narrowWidthPx: 640", mechanics.camera.narrowWidthPx],
    ["ambientIntensity: 1.5", mechanics.lights.ambient.intensity],
    ["directionalIntensity: 1", mechanics.lights.directional.intensity],
    ["directionalY: 25", mechanics.lights.directional.position[1]],
    ["directionalZ: 50", mechanics.lights.directional.position[2]],
    ["baseSize: 1.5", mechanics.tile.baseSize],
    ["thickness: 0.0175", mechanics.tile.thickness],
    ["spacing: 0.375", mechanics.tile.spacing],
    ["rotationY: -Math.PI / 6", mechanics.tile.rotationYExpr],
    ["depthPortrait: 6", mechanics.tile.depthMultiplierPortrait],
    ["visibilityZ: 12.5", mechanics.tile.visibilityZ],
    ["hoverHitScaleX: 1.5", mechanics.tile.hoverHitScaleX],
    ["wheelDivisor: 20", mechanics.scroll.wheelDivisor],
    ["previousLerp: 0.15", mechanics.scroll.previousLerp],
    ["scrollDivisor: 25", mechanics.scroll.indexFromScrollDivisor],
    ["dragLerp: 0.1", mechanics.scroll.dragLerp],
    ["dragHoverDivisor: 100", mechanics.scroll.dragHoverDivisor],
    ["dragTouchDivisor: 50", mechanics.scroll.dragTouchDivisor],
    ["dragActiveDelayMs: 150", mechanics.scroll.dragActiveDelayMs],
    ["sceneScaleFocus: 0.825", mechanics.sceneScale.dragOrFocus],
    ["entryScaleDuration: 1", mechanics.sceneScale.entryDuration],
    ["entryScaleDelay: 1.25", mechanics.sceneScale.entryDelay],
    ["hoverDuration: 0.5", mechanics.hover.desktop.duration],
    ["hoverDesktopX: (1 / 3) * 2", mechanics.hover.desktop.x],
    ["hoverDesktopY: -0.1", mechanics.hover.desktop.y],
    ["hoverMobileXOn: 0.325", mechanics.hover.mobile.xOn],
    ["hoverMobileXOff: -0.325", mechanics.hover.mobile.xOff],
    ["clickInnerDuration: (1.25 / 3) * 2", mechanics.click.innerXDurationExpr],
    ["clickRotationDuration: 1.25", mechanics.click.rotationDuration],
    ["clickGateMs: 1000", mechanics.click.gateDelayMs],
    ["clickStampWindowMs: 200", mechanics.click.stampWindowMs],
    ["entryOffsetX: -20", mechanics.entry.canvasInitOffsetX],
    ["entryDuration: 2", mechanics.entry.duration],
    ["titleFollowLerp: 0.1", mechanics.title.followLerp],
    ["pixelRatioCap: 2", mechanics.renderer.pixelRatioCap],
  ];
  for (const [needle] of checks) {
    assert.ok(src.includes(needle), `missing ${needle}`);
  }
});

test("source still uses the pin's wrap, rotation, and click duration expressions", () => {
  assert.match(src, /gsap\.utils\.wrap/);
  assert.match(src, /-Math\.PI \/ 6/);
  assert.match(src, /\(1\.25 \/ 3\) \* 2/);
  assert.match(src, /100 \/ 7\.5/);
  assert.match(src, /ease: "expo\.inOut"/);
  assert.match(src, /ease: "expo\.out"/);
  assert.match(src, /blurTexture\.a \*= 0\.75/);
  assert.match(src, /float margin = 0\.15/);
});

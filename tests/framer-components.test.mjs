import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context);
    } catch (error) {
      if (
        specifier.startsWith("./") &&
        context.parentURL?.includes("src/registry/")
      )
        return next(`${specifier}.ts`, context);
      throw error;
    }
  },
});
const { galleryLayout, galleryMechanics } = await import(
  "../src/registry/warped-gallery/renderer.ts"
);
const source = read("reference/bold-lychee/shared-lib.mjs");

for (const [folder, mappings] of [
  [
    "warped-gallery",
    {
      Fo: "cardVertexShader",
      Io: "cardFragmentShader",
      Lo: "gridVertexShader",
      Ro: "gridFragmentShader",
    },
  ],
]) {
  test(`${folder}: shaders equal the pinned source byte-for-byte`, () => {
    const current = read(`src/registry/${folder}/shaders.ts`);
    for (const [key, name] of Object.entries(mappings)) {
      const original = source.match(
        new RegExp(`\\b${key}=\u0060([\\s\\S]*?)\u0060`),
      )?.[1];
      const port = current.match(
        new RegExp(`${name} = \u0060([\\s\\S]*?)\u0060`),
      )?.[1];
      assert.ok(original);
      assert.equal(port, original, name);
    }
  });
}

test("fluid-refraction: all eleven shaders equal the pinned source", () => {
  const original = read("reference/real-result/shared-lib.mjs");
  const component = original.slice(original.indexOf("function Ja("));
  const shaders = [
    ...component.matchAll(
      /_\(f\.(?:VERTEX_SHADER|FRAGMENT_SHADER),`([\s\S]*?)`\)/g,
    ),
  ].map((m) => m[1]);
  const port = [
    ...read("src/registry/fluid-refraction/shaders.ts").matchAll(
      /export const \w+ = `([\s\S]*?)`;/g,
    ),
  ].map((m) => m[1]);
  assert.equal(shaders.length, 11);
  assert.deepEqual(port, shaders);
});

test("warped-gallery: responsive layout equals the original function", () => {
  const originalFunction = source.slice(
    source.indexOf("function mo("),
    source.indexOf("function ho("),
  );
  const original = runInNewContext(
    `const Ao=(v,lo,hi)=>Math.min(hi,Math.max(lo,v)); const Po=(w,small)=>Ao(10*w/(small?390:1500),5,20); ${originalFunction}; mo`,
  );
  const projects = [
    { title: "One", aspect: 1.5 },
    { title: "Two", aspect: 1 },
    { title: "Three", aspect: 16 / 9 },
  ];
  for (const [width, height] of [
    [1280, 577],
    [390, 844],
    [649, 600],
    [650, 600],
    [320, 480],
    [2400, 900],
  ]) {
    const pinned = JSON.parse(
      JSON.stringify(original(width, height, 649, projects)),
    );
    assert.deepEqual(galleryLayout(width, height, 649, projects), pinned);
  }
  assert.deepEqual(
    galleryLayout(390, 844, 649, []),
    JSON.parse(JSON.stringify(original(390, 844, 649, []))),
  );
});

test("warped-gallery: interaction and geometry constants are source values", () => {
  assert.deepEqual(galleryMechanics, {
    subdivisions: 24,
    cameraFov: 53.4,
    cameraZ: 41.18,
    desktopHeight: 0.435,
    desktopSheetT: 1.15,
    desktopDoor: -0.12,
    dent: 0.1,
    hoverRate: 13.8629,
    wheelMultiplier: 1.25,
    burstMultiplier: 2,
    burstRetention: 0.78,
    scrollRetention: 0.9,
    touchMultiplier: 3.25,
    touchInertia: 35,
    dragThreshold: 10,
    dragMultiplier: 1.5,
    dragInertia: 12,
  });
  for (const expression of [
    "Oo=53.4",
    "ko=41.18",
    "13.8629",
    "le*3.25",
    "le*35",
    "he*12",
    ".78**",
    "r*1.25*2",
  ])
    assert.ok(source.includes(expression), expression);
});

test("source pins have not changed", () => {
  for (const folder of [
    "bold-lychee",
    "practical-assumptions",
    "real-result",
  ]) {
    const manifest = JSON.parse(read(`reference/${folder}/source.json`));
    for (const [filename, sha256] of Object.entries(manifest.sha256)) {
      const buffer = readFileSync(
        new URL(`reference/${folder}/${filename}`, root),
      );
      assert.equal(
        createHash("sha256").update(buffer).digest("hex"),
        sha256,
        `${folder}/${filename}`,
      );
    }
  }
});

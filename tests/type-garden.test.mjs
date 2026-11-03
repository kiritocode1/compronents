import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assetItems } from "@/lib/assets";

const source = await readFile("reference/type-garden/unpacked.html", "utf8");
const component = await readFile("src/registry/type-garden.tsx", "utf8");

// rows of ['Name', '#RRGGBB', ...] in a PAL / PALETTES array literal
const paletteRows = (text, start) => {
  const from = text.indexOf(start);
  assert.ok(from >= 0, `missing ${start}`);
  const block = text.slice(
    from,
    text.indexOf("]\n", text.indexOf("Mono", from)) + 1,
  );
  return [
    ...block.matchAll(
      /\[\s*["']([^"']+)["']((?:\s*,\s*["']#[0-9A-F]{6}["'])+)\s*\]/gi,
    ),
  ].map((m) => [
    m[1],
    ...[...m[2].matchAll(/#[0-9A-F]{6}/gi)].map((c) => c[0]),
  ]);
};

test("the ten palettes match the pinned source", () => {
  const original = paletteRows(source, "PAL = [");
  assert.equal(original.length, 10);
  assert.deepEqual(
    paletteRows(component, "TYPE_GARDEN_PALETTES = ["),
    original,
  );
});

test("every font the component loads is a registered Blob asset", () => {
  const files = [...component.matchAll(/\$\{ASSET_BASE\}\/([\w.-]+)/g)].map(
    (m) => m[1],
  );
  assert.equal(new Set(files).size, 9);
  const registered = new Set(assetItems.map((a) => a.pathname));
  for (const file of files)
    assert.ok(registered.has(`type-garden/${file}`), file);
});

test("it renders its own canvas and listens on its root, not in a frame or on the window", () => {
  assert.doesNotMatch(component, /<iframe|srcDoc/);
  assert.doesNotMatch(
    component,
    /window\.addEventListener\(\s*"(keydown|pointermove)"/,
  );
  assert.match(component, /root\.addEventListener\("keydown", key\)/);
});

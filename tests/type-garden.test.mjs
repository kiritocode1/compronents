import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

const file = await readFile("reference/type-garden/core.html", "utf8");
const source = await readFile("reference/type-garden/index.html", "utf8");
const templateOf = (html) => {
  const script = new JSDOM(html).window.document.querySelector(
    'script[type="__bundler/template"]',
  );
  assert.ok(script);
  return JSON.parse(script.textContent);
};

const core = templateOf(file);
const original = templateOf(source);

test("core asset is reproducible from the pinned source", () => {
  const check = spawnSync(
    "python3",
    ["scripts/build-type-garden.py", "--check"],
    { encoding: "utf8" },
  );
  assert.equal(check.status, 0, check.stderr || check.stdout);
});

test("the source scene keeps input, canvas, palettes and keyboard behaviors", () => {
  const { document } = new JSDOM(core).window;
  assert.ok(document.querySelector('canvas[ref="{{ cv }}"]'));
  assert.ok(
    document.querySelector('input[aria-label="Type to grow a garden"]'),
  );
  assert.ok(document.querySelector('[data-tg="pal"]'));
  assert.match(core, /space cuts/);
  assert.match(core, /Backspace/);
  assert.match(core, /this\.grow\(/);
  assert.match(core, /this\.drawFlies\(/);
  assert.ok(original.length > core.length);
});

test("named controls and their keyboard shortcut are absent", () => {
  const { document } = new JSDOM(core).window;
  for (const selector of [
    '[data-tg="modes"]',
    '[data-tg="poster"]',
    "#tg-copy",
    '[data-tg="btn"]',
  ]) {
    assert.equal(document.querySelector(selector), null, selector);
  }
  assert.doesNotMatch(core, /this\.saveSVG\(\) : this\.savePNG\(\)/);
  assert.doesNotMatch(core, /Copy code/);
  assert.doesNotMatch(core, /<button[^>]*>SVG<\/button>/);
  assert.doesNotMatch(core, /<button[^>]*>PNG<\/button>/);
});

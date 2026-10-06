import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

const source = await readFile("reference/mossy-type/index.html", "utf8");
const component = await readFile("src/registry/mossy-type.tsx", "utf8");
const markup = component.match(/const documentMarkup = `([\s\S]*?)`;/)?.[1];

function elements(html) {
  const { document } = new JSDOM(html).window;
  return [...document.body.querySelectorAll("*")].map((element) => ({
    tag: element.tagName,
    attrs: [...element.attributes]
      .map(({ name, value }) => [name, value])
      .sort(([a], [b]) => a.localeCompare(b)),
    text: element.children.length ? "" : element.textContent.trim(),
  }));
}

test("the isolated document preserves every source body element, attribute and label", () => {
  assert.ok(markup, "missing pinned page document");
  assert.deepEqual(elements(markup), elements(source));
});

test("the source runtime and stylesheet resolve from registered stable assets", async () => {
  const assets = await readFile("src/lib/assets.ts", "utf8");
  assert.match(markup, /<base href="\$\{ASSETS\}\/"/);
  assert.match(markup, /src="\$\{ASSETS\}\/index\.js"/);
  assert.match(markup, /href="\$\{ASSETS\}\/index\.css"/);
  for (const asset of [
    "index.js",
    "index.css",
    "fonts/instrument-serif-latin-400-normal.woff",
    "fonts/dm-serif-display-latin-400-normal.woff",
    "fonts/playfair-display-latin-700-normal.woff",
    "fonts/archivo-black-latin-400-normal.woff",
    "fonts/pacifico-latin-400-normal.woff",
  ]) {
    assert.ok(assets.includes(`"${asset}"`), `${asset} absent from assets`);
  }
});

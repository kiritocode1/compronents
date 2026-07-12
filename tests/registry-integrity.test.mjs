// Offline registry integrity checks: proves every registered item would copy
// cleanly and self-consistently through `shadcn add`, without a running server.
//
//   node --test tests/registry-integrity.test.mjs
//
// The live-install counterpart (tests/shadcn-install.test.mjs) exercises the
// real CLI; this file catches the same drift in ~1s with no network.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  analyzeFile,
  exists,
  FILE_TYPES,
  readFile,
  registryItems,
} from "./registry-data.mjs";

const ITEM_TYPES = new Set(["registry:ui", "registry:component"]);

test("catalog is well-formed", () => {
  const names = new Set();
  for (const item of registryItems) {
    assert.ok(item.name, "item missing name");
    assert.ok(!names.has(item.name), `duplicate item name: ${item.name}`);
    names.add(item.name);
    assert.ok(item.title, `${item.name}: missing title`);
    assert.ok(item.description, `${item.name}: missing description`);
    assert.ok(
      ITEM_TYPES.has(item.type),
      `${item.name}: invalid type "${item.type}"`,
    );
    assert.ok(item.files?.length, `${item.name}: ships no files`);
  }
});

for (const item of registryItems) {
  test(`${item.name}: installs cleanly`, () => {
    const shipped = new Set(item.files.map((f) => f.path.replace(/\\/g, "/")));
    const targets = new Set();
    const problems = [];

    for (const file of item.files) {
      // Route handler readFile()s file.path; a missing file is a 500 / broken
      // install.
      if (!exists(file.path)) {
        problems.push(`missing file on disk: ${file.path}`);
        continue;
      }
      assert.ok(
        FILE_TYPES.has(file.type),
        `${file.path}: invalid file type "${file.type}"`,
      );
      assert.ok(file.target, `${file.path}: missing target`);
      assert.ok(
        !targets.has(file.target),
        `duplicate install target: ${file.target}`,
      );
      targets.add(file.target);

      const src = readFile(file.path);
      for (const problem of analyzeFile(
        file.path,
        src,
        shipped,
        item.dependencies,
      )) {
        problems.push(`${file.path}: ${problem}`);
      }
    }

    assert.deepEqual(problems, [], `\n  - ${problems.join("\n  - ")}\n`);
  });
}

// The demo shown in the site iframe imports the exact source that ships, so
// "what you see" == "what installs". Enforce that binding for every item.
for (const item of registryItems) {
  test(`${item.name}: demo renders the installed source`, () => {
    const demoPath = `src/components/demos/${item.name}.tsx`;
    assert.ok(exists(demoPath), `no demo at ${demoPath}`);
    const demo = readFile(demoPath);
    const importsSource = new RegExp(
      `@/registry/${item.name}(?:["'/]|$)`,
      "m",
    ).test(demo);
    assert.ok(
      importsSource,
      `${demoPath} does not import @/registry/${item.name}`,
    );
  });
}

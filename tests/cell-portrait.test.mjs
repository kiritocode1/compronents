// Cell Portrait: the shipped timeline, odds and tracers checked against values
// measured frame by frame from the reference recording
// (reference/cell-portrait/measurements.json).
//
//   node --test tests/cell-portrait.test.mjs

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import gsap from "gsap";
import ts from "typescript";

const port = readFileSync(
  new URL("../src/registry/cell-portrait.tsx", import.meta.url),
  "utf8",
);
const measured = JSON.parse(
  readFileSync(
    new URL("../reference/cell-portrait/measurements.json", import.meta.url),
    "utf8",
  ),
);

// Pull the pure mechanics out of the shipped file and run them as-is.
const WANTED = [
  "TIMING",
  "P_JOIN",
  "fullShare",
  "presence",
  "mulberry32",
  "keyBackground",
  "traceLoops",
  "buildLayout",
  "createLoop",
];
const parsed = ts.createSourceFile(
  "cell-portrait.tsx",
  port,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const mechanics = parsed.statements
  .filter(
    (node) =>
      (ts.isFunctionDeclaration(node) && WANTED.includes(node.name?.text)) ||
      (ts.isVariableStatement(node) &&
        node.declarationList.declarations.some((declaration) =>
          WANTED.includes(declaration.name.getText(parsed)),
        )),
  )
  .map((node) => node.getText(parsed))
  .join("\n");
const compiled = ts.transpileModule(
  `${mechanics}\nexports.api = { ${WANTED.join(", ")} };`,
  // ES2022 keeps for...of over Maps intact (the ES5 default would not iterate them).
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const exported = {};
runInNewContext(compiled, { exports: exported, gsap });
const {
  P_JOIN,
  fullShare,
  presence,
  keyBackground,
  traceLoops,
  buildLayout,
  createLoop,
} = exported.api;

test.after(() => gsap.ticker.sleep());

test("timeline reproduces the measured cell size and color per frame", () => {
  const state = { logCell: Math.log(36), color: 0 };
  const loop = createLoop(state, { from: 36, to: 7, detail: 5 });
  let exact = 0;
  const off = [];
  measured.cellByFrame.forEach((cell, index) => {
    loop.totalTime(index / 30);
    const shown = Math.round(Math.exp(state.logCell));
    if (shown === cell) exact++;
    else off.push({ frame: index + 1, measured: cell, shown });
  });
  assert.ok(exact >= 166, `only ${exact}/180 frames match`);
  assert.ok(
    off.every(({ measured: m, shown }) => Math.abs(m - shown) === 1),
    `frames off by more than one step: ${JSON.stringify(off)}`,
  );

  let squared = 0;
  for (const [frame, alpha] of Object.entries(measured.colorByFrame)) {
    loop.totalTime((Number(frame) - 1) / 30);
    squared += (state.color - alpha) ** 2;
  }
  assert.ok(squared <= 0.06, `color fade error ${squared.toFixed(3)}`);
  loop.kill();
});

test("presence follows the measured brightness curve", () => {
  let weighted = 0;
  let total = 0;
  for (const bin of measured.presenceByLuma) {
    const mid = (bin.luma[0] + bin.luma[1]) / 2;
    weighted += Math.abs(presence(mid) - bin.presence) * bin.n;
    total += bin.n;
    if (bin.luma[0] >= 0.7) assert.equal(presence(mid), 0);
  }
  assert.ok(weighted / total <= 0.06, `mean error ${weighted / total}`);
});

test("layouts join neighbours at the calibrated rates", () => {
  const cols = 40;
  const rows = 40;
  const grid = {
    cols,
    rows,
    inside: new Uint8Array(cols * rows).fill(1),
    odds: new Float32Array(cols * rows).fill(1),
  };
  for (const [cell, share] of [
    [36, 0.45],
    [7, 0.65],
  ]) {
    let pairs = 0;
    let full = 0;
    let thin = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const { right, down } = buildLayout(grid, cell, seed);
      for (let k = 0; k < cols * rows; k++)
        for (const type of [right[k], down[k]]) {
          if (type === 2) full++;
          if (type === 1) thin++;
        }
      pairs += 2 * cols * rows - cols - rows;
    }
    assert.ok(Math.abs((full + thin) / pairs - P_JOIN) < 0.02);
    assert.ok(Math.abs(full / (full + thin) - share) < 0.03);
    assert.ok(Math.abs(fullShare(cell) - share) < 1e-9);
  }
});

test("silhouette loops always close", () => {
  const mask = (rows) => {
    const cells = rows.flatMap((row) =>
      [...row].map((c) => (c === "#" ? 1 : 0)),
    );
    return [Uint8Array.from(cells), rows[0].length, rows.length];
  };
  const L = traceLoops(...mask(["#.", "##"]));
  assert.equal(L.open, 0);
  assert.equal(L.loops.length, 1);
  assert.equal(L.loops[0].length, 6);

  const pinch = traceLoops(...mask(["#.", ".#"]));
  assert.equal(pinch.open, 0);
  // Array.from keeps the result in this realm so deepEqual compares values.
  assert.deepEqual(
    Array.from(pinch.loops, (loop) => loop.length),
    [4, 4],
  );

  const ring = traceLoops(...mask(["###", "#.#", "###"]));
  assert.equal(ring.open, 0);
  assert.deepEqual(
    Array.from(ring.loops, (loop) => loop.length),
    [4, 4],
  );
});

test("opaque backgrounds key out without eating small highlights", () => {
  const size = 100;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  const paint = (x0, y0, x1, y1, v) => {
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const i = (y * size + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
  };
  paint(20, 20, 80, 80, 20); // the figure
  paint(30, 30, 50, 50, 255); // enclosed pocket, 4% of the image
  paint(60, 60, 64, 64, 255); // eye-white sized highlight, 0.16%
  keyBackground(data, size, 0, 0, size - 1, size - 1);
  const alpha = (x, y) => data[(y * size + x) * 4 + 3];
  assert.equal(alpha(2, 2), 0);
  assert.equal(alpha(25, 25), 255);
  assert.equal(alpha(40, 40), 0);
  assert.equal(alpha(62, 62), 255);
});

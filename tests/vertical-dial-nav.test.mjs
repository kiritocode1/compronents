import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ts from "typescript";

const port = readFileSync(
  new URL("../src/registry/vertical-dial-nav.tsx", import.meta.url),
  "utf8",
);
const parsed = ts.createSourceFile(
  "nav.tsx",
  port,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const mechanics = parsed.statements
  .filter(
    (node) =>
      (ts.isFunctionDeclaration(node) && node.name?.text === "dialOpacity") ||
      (ts.isVariableStatement(node) &&
        node.declarationList.declarations.some(
          (declaration) =>
            declaration.name.getText(parsed) === "DIAL_TRANSITION",
        )),
  )
  .map((node) => node.getText(parsed))
  .join("\n");
const compiled = ts.transpileModule(mechanics, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exported = {};
runInNewContext(compiled, { exports: exported });
const { DIAL_TRANSITION, dialOpacity } = exported;

const source = readFileSync(
  new URL("../reference/vertical-dial-nav/shared-lib.mjs", import.meta.url),
  "utf8",
);

test("distance fade agrees with the pinned Framer implementation", () => {
  const match = source.match(/function ie\(e\)\{([^}]+)\}/);
  assert.ok(match, "Pinned source must contain the original opacity function");
  const original = new Function("e", "p", "i", match[1]);
  for (let fadeDistance = 1; fadeDistance <= 10; fadeDistance++) {
    for (let active = 0; active < 6; active++) {
      for (let index = 0; index < 6; index++) {
        assert.equal(
          dialOpacity(Math.abs(index - active), fadeDistance),
          original(index, active, fadeDistance),
        );
      }
    }
  }
});

test("transition is extracted exactly from the pinned source", () => {
  const match = source.match(/transition:`(opacity 0\.4s[^`]+)`/);
  assert.ok(match);
  assert.equal(DIAL_TRANSITION, match[1]);
});

test("window and nested-root selection, activation and cleanup", async () => {
  const dom = new JSDOM(
    '<div id="mount"></div><div id="scroller"><section id="one"></section><section id="two"></section></div>',
  );
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    IS_REACT_ACT_ENVIRONMENT: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { window } = dom;
  window.matchMedia = () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  });
  const frames = new Set();
  const requestFrame = (callback) => {
    const id = setImmediate(() => {
      frames.delete(id);
      callback();
    });
    frames.add(id);
    return id;
  };
  const cancelFrame = (id) => {
    frames.delete(id);
    clearImmediate(id);
  };
  const module = { exports: {} };
  const componentCode = ts.transpileModule(port, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  runInNewContext(componentCode, {
    exports: module.exports,
    require: createRequire(import.meta.url),
    window,
    document: window.document,
    CSS: { escape: (value) => value },
    requestAnimationFrame: requestFrame,
    cancelAnimationFrame: cancelFrame,
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
  });
  const Nav = module.exports.default;
  const sections = [
    { id: "one", label: "One" },
    { id: "two", label: "Two" },
  ];
  const root = createRoot(window.document.getElementById("mount"));
  const scroller = window.document.getElementById("scroller");
  const second = window.document.getElementById("two");
  let secondTop = 1000;
  scroller.getBoundingClientRect = () => ({ top: 120 });
  Object.defineProperty(scroller, "clientHeight", { value: 600 });
  window.document.getElementById("one").getBoundingClientRect = () => ({
    top: 0,
  });
  second.getBoundingClientRect = () => ({ top: secondTop });
  const selected = () =>
    window.document.querySelector("a[aria-current]")?.textContent;
  const flush = async (callback) =>
    act(async () => {
      callback();
      await new Promise(setImmediate);
    });
  try {
    let documentScroll;
    second.scrollIntoView = (options) => {
      documentScroll = options;
    };
    await flush(() => root.render(React.createElement(Nav, { sections })));
    assert.equal(selected(), "One");
    secondTop = window.innerHeight * 0.3;
    await flush(() => window.dispatchEvent(new window.Event("scroll")));
    assert.equal(selected(), "Two", "window selection uses the 30% threshold");
    await flush(() => window.document.querySelectorAll("a")[1].click());
    assert.equal(
      documentScroll.behavior,
      "instant",
      "reduced motion skips smooth scrolling",
    );
    let rootScroll;
    scroller.scrollTo = (options) => {
      rootScroll = options;
    };
    secondTop = 301;
    await flush(() =>
      root.render(
        React.createElement(Nav, {
          sections,
          scrollRoot: { current: scroller },
        }),
      ),
    );
    assert.equal(
      selected(),
      "One",
      "nested-root threshold accounts for its top offset",
    );
    secondTop = 300;
    await flush(() => scroller.dispatchEvent(new window.Event("scroll")));
    assert.equal(selected(), "Two");
    await flush(() => window.document.querySelectorAll("a")[1].click());
    assert.equal(rootScroll.top, 180);
    assert.equal(rootScroll.behavior, "instant");
    await act(async () => {
      scroller.dispatchEvent(new window.Event("scroll"));
      root.unmount();
    });
    assert.equal(frames.size, 0, "unmount cancels any queued frame");
  } finally {
    for (const frame of frames) cancelFrame(frame);
    Object.assign(globalThis, previous);
    window.close();
  }
});

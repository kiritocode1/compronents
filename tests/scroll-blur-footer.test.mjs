import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const port = readFileSync("src/registry/scroll-blur-footer.tsx", "utf8");
const source = readFileSync("reference/scroll-blur-footer/page.mjs", "utf8");
const html = readFileSync("reference/scroll-blur-footer/index.html", "utf8");
const parsed = ts.createSourceFile(
  "footer.tsx",
  port,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
const names = ["MAX_BLUR", "LAYERS", "IDLE_DELAY", "FADE_IN", "FADE_OUT"];
const declarations = parsed.statements
  .filter(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some((declaration) =>
        names.includes(declaration.name.getText(parsed)),
      ),
  )
  .map((statement) => statement.getText(parsed))
  .join("\n");
const mechanics = { exports: {} };
runInNewContext(
  ts.transpileModule(`${declarations}\nexport { ${names.join(", ")} };`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: mechanics.exports },
);
const constants = mechanics.exports;

test("blur coefficients, inactivity delay and both springs agree with the pinned source", () => {
  const configuration = source.match(
    /F=(\d+),I=\{type:`spring`,stiffness:(\d+),damping:(\d+)\},L=\{type:`spring`,stiffness:(\d+),damping:(\d+)\},R=(\d+)/,
  );
  assert.ok(configuration, "source spring configuration missing");
  const [, blur, inStiffness, inDamping, outStiffness, outDamping, layers] =
    configuration.map(Number);
  assert.equal(constants.MAX_BLUR, blur);
  assert.equal(constants.LAYERS, layers);
  assert.equal(constants.FADE_IN.type, "spring");
  assert.equal(constants.FADE_IN.stiffness, inStiffness);
  assert.equal(constants.FADE_IN.damping, inDamping);
  assert.equal(constants.FADE_OUT.type, "spring");
  assert.equal(constants.FADE_OUT.stiffness, outStiffness);
  assert.equal(constants.FADE_OUT.damping, outDamping);
  const inactivity = source.match(/f\.current=_\(c,0,L\)\},(\d+)\)/);
  assert.ok(inactivity);
  assert.equal(constants.IDLE_DELAY, Number(inactivity[1]));
});

test("rendered masks match the source; real Motion handles scroll, interruption, preferences and cleanup", async () => {
  const dom = new JSDOM('<div id="mount"></div><div id="scroller"></div>', {
    pretendToBeVisual: true,
  });
  const previous = Object.fromEntries(
    [
      "window",
      "document",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "HTMLElement",
      "Element",
      "SVGElement",
      "IS_REACT_ACT_ENVIRONMENT",
    ].map((key) => [key, globalThis[key]]),
  );
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    Element: dom.window.Element,
    SVGElement: dom.window.SVGElement,
    requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
    cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const preference = new dom.window.EventTarget();
  preference.matches = false;
  dom.window.matchMedia = () => preference;
  const timers = new Map();
  const module = { exports: {} };
  runInNewContext(
    ts.transpileModule(port, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports: module.exports,
      require: createRequire(import.meta.url),
      window: dom.window,
      setTimeout(callback, delay) {
        const id = Symbol("idle");
        timers.set(id, { callback, delay });
        return id;
      },
      clearTimeout(id) {
        timers.delete(id);
      },
    },
  );
  const Footer = module.exports.default;
  const root = createRoot(dom.window.document.getElementById("mount"));
  const strength = () =>
    Number(
      dom.window.document
        .querySelector("[data-scroll-blur-footer]")
        .style.getPropertyValue("--sb"),
    );
  const waitUntil = async (predicate) => {
    const start = performance.now();
    while (!predicate()) {
      assert.ok(
        performance.now() - start < 2500,
        "Motion did not reach the expected state",
      );
      await new Promise((resolve) => dom.window.requestAnimationFrame(resolve));
    }
  };
  const scroll = () =>
    dom.window.document
      .getElementById("scroller")
      .dispatchEvent(new dom.window.Event("scroll"));
  const expire = () => {
    assert.equal(timers.size, 1);
    const [id, timer] = [...timers][0];
    timers.delete(id);
    assert.equal(timer.delay, constants.IDLE_DELAY);
    timer.callback();
  };
  try {
    const rendered = new JSDOM(
      renderToStaticMarkup(React.createElement(Footer)),
    ).window.document;
    const pinned = new JSDOM(html).window.document;
    const originalLayers = pinned.querySelectorAll(
      ".framer-b81453-container > div > div",
    );
    const layers = rendered.querySelectorAll("[data-scroll-blur-footer] > div");
    assert.equal(layers.length, constants.LAYERS);
    assert.equal(originalLayers.length, constants.LAYERS);
    layers.forEach((layer, index) => {
      assert.equal(
        layer.style.backdropFilter,
        originalLayers[index].style.backdropFilter,
      );
      assert.equal(
        layer.style.maskImage,
        originalLayers[index].style.maskImage,
      );
    });
    const top = new JSDOM(
      renderToStaticMarkup(React.createElement(Footer, { direction: "top" })),
    ).window.document;
    assert.equal(
      top.querySelector("[data-scroll-blur-footer]").style.top,
      "0px",
    );
    const expectedTop = top.createElement("div");
    expectedTop.style.maskImage = layers[0].style.maskImage.replace(
      "to top",
      "to bottom",
    );
    assert.equal(
      top.querySelector("[data-scroll-blur-footer] > div").style.maskImage,
      expectedTop.style.maskImage,
    );

    await act(async () => root.render(React.createElement(Footer)));
    assert.equal(strength(), 0);
    assert.equal(
      dom.window.document.querySelector("[data-scroll-blur-footer]").style
        .pointerEvents,
      "none",
    );
    scroll();
    await waitUntil(() => strength() > 0.8);
    scroll();
    assert.equal(
      timers.size,
      1,
      "continued scroll replaces the inactivity timer",
    );
    expire();
    await waitUntil(() => strength() < 0.5);
    scroll();
    await waitUntil(() => strength() > 0.8);
    expire();
    await waitUntil(() => strength() === 0);

    scroll();
    await waitUntil(() => strength() > 0.2);
    preference.matches = true;
    preference.dispatchEvent(new dom.window.Event("change"));
    assert.equal(strength(), 0);
    assert.equal(timers.size, 0);
    scroll();
    assert.equal(timers.size, 0, "reduced motion ignores scrolling");
    preference.matches = false;
    preference.dispatchEvent(new dom.window.Event("change"));
    scroll();
    assert.equal(timers.size, 1);
    await act(async () => root.unmount());
    assert.equal(
      timers.size,
      0,
      "unmount cancels the pending inactivity timer",
    );
    scroll();
    assert.equal(timers.size, 0, "unmount removes the capture listener");
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, previous);
    dom.window.close();
  }
});

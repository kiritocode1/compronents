// Source vs port comparison over CDP (Chrome on :9222, 1920x1034, DPR 1).
// Usage: node compare.mjs <outDir> [step]
//   step: optional ArrowRight presses applied to both before capture.
// Captures each WebGL canvas's backing pixels (both use preserveDrawingBuffer)
// plus element geometry, at the same logical scroll and backing size.
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = process.argv[2] ?? "evidence";
const STEPS = Number(process.argv[3] ?? 0);
mkdirSync(OUT, { recursive: true });

async function open(url) {
  const t = await (await fetch(`http://localhost:9222/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      const n = ++id;
      pending.set(n, r);
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  const evalJs = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
    return r.result?.result?.value;
  };
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1034, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url });
  return { send, evalJs, close: () => fetch(`http://localhost:9222/json/close/${t.id}`) };
}

const waitFor = async (page, expr, ms = 30000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await page.evalJs(expr).catch(() => false)) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`timeout: ${expr}`);
};

const settle = (page) =>
  page.evalJs(`new Promise(r => { let n = 0; const f = () => ++n > 40 ? r(true) : requestAnimationFrame(f); f(); })`);

const geometry = (surfaceSel, map) => `(() => {
  const s = document.querySelector(${JSON.stringify(surfaceSel)});
  const out = { surface: [s.offsetWidth, s.offsetHeight], scrollLeft: s.dataset.scrollLeft };
  const m = ${JSON.stringify(map)};
  for (const [k, sel] of Object.entries(m)) {
    const el = s.querySelector(sel);
    if (!el) { out[k] = null; continue; }
    let x = 0, y = 0, n = el;
    while (n && n !== s) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    const cs = getComputedStyle(el);
    out[k] = { x, y, w: el.offsetWidth, h: el.offsetHeight, font: cs.font, ls: cs.letterSpacing, color: cs.color, bg: cs.backgroundColor };
  }
  const t = s.querySelector('h1, h2');
  const r = document.createRange(); r.selectNodeContents(t);
  out.titleLines = [...r.getClientRects()].length;
  return out;
})()`;

const capture = (canvasSel) => `(() => {
  const c = document.querySelector(${JSON.stringify(canvasSel)});
  return { w: c.width, h: c.height, url: c.toDataURL('image/png') };
})()`;

const press = (page, viewportSel, n) =>
  page.evalJs(`(async () => {
    const v = document.querySelector(${JSON.stringify(viewportSel)});
    for (let i = 0; i < ${n}; i++) {
      v.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      await new Promise(r => setTimeout(r, 700));
    }
    await new Promise(r => setTimeout(r, 900));
    return true;
  })()`);

const save = (name, dataUrl) => writeFileSync(`${OUT}/${name}.png`, Buffer.from(dataUrl.split(",")[1], "base64"));

// Source.
const src = await open("https://toolcraft.sh/demos/aura-carousel/");
await waitFor(src, `document.querySelector('[data-dispersion-carousel]')?.dataset.railRenderer === 'webgl'`);
await src.evalJs(`document.fonts.ready.then(() => true)`);
if (STEPS) await press(src, "[data-carousel-base]", STEPS);
await settle(src);
const srcGeo = await src.evalJs(
  geometry("[data-dispersion-carousel]", {
    header: "[data-carousel-header]",
    title: "h1",
    nav: "[data-carousel-navigation]",
    navButton: "[data-carousel-navigation] button",
    rail: "[data-carousel-base]",
    dispersion: "[data-dispersion-rail]",
  }),
);
const srcCap = await src.evalJs(capture("[data-dispersion-rail] canvas"));
save("source-canvas", srcCap.url);
const srcShot = await src.send("Page.captureScreenshot", { format: "png" });
writeFileSync(`${OUT}/source-page.png`, Buffer.from(srcShot.result.data, "base64"));

// Port, same backing size as the source's canvas.
const scale = srcCap.w / srcGeo.surface[0];
const port = await open(`https://compronents.localhost:8443/aura-compare-tmp?scale=${scale}`);
await waitFor(port, `document.querySelector('.acr-surface')?.dataset.railRenderer === 'webgl'`);
await port.evalJs(`document.fonts.ready.then(() => true)`);
if (STEPS) await press(port, ".acr-rail-viewport", STEPS);
await settle(port);
const portGeo = await port.evalJs(
  geometry(".acr-surface", {
    header: ".acr-header",
    title: ".acr-title",
    nav: ".acr-navigation",
    navButton: ".acr-navigation-button",
    rail: ".acr-rail-viewport",
    dispersion: ".acr-dispersion-rail",
  }),
);
const portCap = await port.evalJs(capture(".acr-dispersion-canvas"));
save("port-canvas", portCap.url);
const portShot = await port.send("Page.captureScreenshot", { format: "png" });
writeFileSync(`${OUT}/port-page.png`, Buffer.from(portShot.result.data, "base64"));

writeFileSync(
  `${OUT}/geometry.json`,
  JSON.stringify({ scale, source: { geo: srcGeo, canvas: [srcCap.w, srcCap.h] }, port: { geo: portGeo, canvas: [portCap.w, portCap.h] } }, null, 2),
);
await src.close();
await port.close();
console.log(JSON.stringify({ scale, srcCanvas: [srcCap.w, srcCap.h], portCanvas: [portCap.w, portCap.h], srcScroll: srcGeo.scrollLeft, portScroll: portGeo.scrollLeft }));
process.exit(0);

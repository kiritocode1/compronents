// Pinned source vs port, deterministic. Chrome CDP on $CDP (default 9222; use a headless Chrome so the real cursor cannot reach the pages), 1200x800 at DPR 1.
// node compare.mjs <outDir>
// Seeded Math.random (reseeded before every key), frozen performance.now and a
// manual requestAnimationFrame on both pages. The same keystrokes go to the
// focused hidden field; the garden canvas is captured at fixed frame counts.
import { mkdirSync, writeFileSync } from "node:fs";
const CDP = process.env.CDP ?? "9222";
const OUT = process.argv[2] ?? "evidence";
mkdirSync(OUT, { recursive: true });
const SOURCE = new URL("../../reference/type-garden/index.html", import.meta.url).href;
const PORT = "https://compronents.localhost:8443/components/type-garden/preview";

const HARNESS = `(() => {
  let s = 1;
  Math.random = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.__seed = (v) => { s = v; };
  let t = 1000;
  performance.now = () => t;
  let q = [];
  window.requestAnimationFrame = (f) => { q.push(f); return q.length; };
  window.cancelAnimationFrame = () => {};
  window.__pump = (n, dt = 1000 / 60) => { for (let i = 0; i < n; i++) { t += dt; const run = q; q = []; for (const f of run) f(t); } return true; };
})();`;

async function open(url) {
  const tab = await (await fetch(`http://localhost:${CDP}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0; const pend = new Map(); const errors = [];
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    pend.get(m.id)?.(m); pend.delete(m.id); });
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const ev = async (x) => {
    const r = await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return r.result?.result?.value;
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: HARNESS });
  await send("Page.navigate", { url });
  return { send, ev, errors, close: () => fetch(`http://localhost:${CDP}/json/close/${tab.id}`) };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (p, expr) => { for (let i = 0; i < 200; i++) { if (await p.ev(expr).catch(() => false)) return; await sleep(150); } throw new Error(`timeout ${expr}`); };
const KEYS = { " ": ["Space", 32], Backspace: ["Backspace", 8] };
async function press(p, key) {
  const [code, vk] = KEYS[key] ?? [`Key${key.toUpperCase()}`, key.toUpperCase().charCodeAt(0)];
  const text = key.length === 1 ? key : undefined;
  await p.send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: vk, text });
  await p.send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk });
}
const grab = (p) => p.ev("document.querySelector('canvas').toDataURL('image/png')");

async function run(label, url) {
  const p = await open(url);
  await waitFor(p, "!!document.querySelector('[data-tg=input]') && document.querySelector('canvas').width === 1200");
  await waitFor(p, `document.fonts.check('700 100px "GT Ultra"') && document.fonts.status === 'loaded'`);
  await sleep(800);
  await p.ev("document.querySelector('[data-tg=input]').focus(); true");
  // a fixed pointer over the garden, so lean and rose turning are part of the diff
  await p.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 640, y: 260 });
  const shots = {};
  const shot = async (name) => { shots[name] = await grab(p); writeFileSync(`${OUT}/${label}-${name}.png`, Buffer.from(shots[name].split(",")[1], "base64")); };
  let k = 0;
  for (const ch of "in bloom") { await p.ev(`window.__seed(${100 + k++}); true`); await press(p, ch); await p.ev("window.__pump(6)"); }
  await p.ev("window.__pump(30)"); await shot("typed-mid");
  await p.ev("window.__pump(150)"); await shot("typed-settled");
  await p.ev(`window.__seed(${100 + k++}); true`); await press(p, " "); await p.ev("window.__pump(40)"); await shot("cut");
  await press(p, "Backspace"); await press(p, "Backspace"); await p.ev("window.__pump(8)"); await shot("wither-mid");
  await p.ev("window.__pump(60)"); await shot("wither-done");
  console.log(label, "errors:", JSON.stringify(p.errors.slice(0, 5)));
  await p.close();
  return shots;
}
const src = await run("source", SOURCE);
const port = await run("port", PORT);
console.log(JSON.stringify(Object.fromEntries(Object.keys(src).map((k) => [k, src[k] === port[k]]))));
process.exit(0);

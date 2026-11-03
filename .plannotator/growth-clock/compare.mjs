// Source vs port, deterministic. Chrome CDP on :9222, 1200x900 at DPR 1.
// node compare.mjs <outDir>
// Both pages get a seeded Math.random, a frozen Date and performance.now,
// and a manual requestAnimationFrame. Each page: set the clock to :03, reseed,
// click the canvas (restart), pump frames, capture; then move the clock to :04
// and capture mid-morph and after.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const OUT = process.argv[2] ?? "evidence";
mkdirSync(OUT, { recursive: true });
const SOURCE = new URL("./reference/index.html", import.meta.url).href;
const PORT = "https://compronents.localhost:8443/components/growth-clock/preview";

const HARNESS = `(() => {
  let s = 1;
  const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  Math.random = rnd;
  window.__seed = (v) => { s = v; };
  let t = 1000;
  performance.now = () => t;
  const RealDate = Date;
  let wall = new RealDate(2026, 10, 3, 12, 0, 3).getTime();
  window.__setSec = (sec) => { wall = new RealDate(2026, 10, 3, 12, 0, sec).getTime(); };
  window.Date = class extends RealDate { constructor(...a) { super(...(a.length ? a : [wall])); } static now() { return wall; } };
  let q = [];
  window.requestAnimationFrame = (f) => { q.push(f); return q.length; };
  window.cancelAnimationFrame = () => {};
  window.__pump = (n, dt = 1000 / 60) => { for (let i = 0; i < n; i++) { t += dt; const run = q; q = []; for (const f of run) f(t); } return q.length; };
})();`;

async function open(url) {
  const tab = await (await fetch("http://localhost:9222/json/new?about:blank", { method: "PUT" })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const pend = new Map();
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); pend.get(m.id)?.(m); pend.delete(m.id); });
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const ev = async (x) => {
    const r = await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return r.result?.result?.value;
  };
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: HARNESS });
  await send("Page.navigate", { url });
  return { ev, close: () => fetch(`http://localhost:9222/json/close/${tab.id}`) };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (p, expr) => { for (let i = 0; i < 200; i++) { if (await p.ev(expr).catch(() => false)) return; await sleep(150); } throw new Error(`timeout ${expr}`); };
const save = (name, url) => writeFileSync(`${OUT}/${name}.png`, Buffer.from(url.split(",")[1], "base64"));
const grab = (p) => p.ev("document.querySelector('canvas').toDataURL('image/png')");

const STAGES = [
  ["grow-1", 1], ["grow-60", 59], ["grow-240", 180],
  ["morph-mid", 3, 4], ["morph-done", 10], ["regrow-120", 110],
];

async function run(label, url) {
  const p = await open(url);
  await waitFor(p, "!!document.querySelector('canvas') && document.querySelector('canvas').width === 1200");
  await sleep(1500); // mask warming via requestIdleCallback
  await p.ev("window.__setSec(3); window.__seed(42); document.querySelector('canvas').dispatchEvent(new MouseEvent('click', {bubbles: true})); true");
  const shots = {};
  for (const [name, frames, sec] of STAGES) {
    if (sec !== undefined) await p.ev(`window.__setSec(${sec}); true`);
    await p.ev(`window.__pump(${frames}); true`);
    shots[name] = await grab(p);
    save(`${label}-${name}`, shots[name]);
  }
  await p.close();
  return shots;
}

const src = await run("source", SOURCE);
const port = await run("port", PORT);
const same = Object.fromEntries(Object.keys(src).map((k) => [k, src[k] === port[k]]));
console.log(JSON.stringify(same));
void fileURLToPath;
process.exit(0);

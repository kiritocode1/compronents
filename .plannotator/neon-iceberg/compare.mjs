// Source vs port at a frozen timeline position. Chrome CDP on :9222, DPR 1.
// node compare.mjs <outDir> <arrowRightPresses>
// Source: pause, Home (t=0), then N ArrowRight steps; read the time; capture
// the WebGL canvas (2600x3640 at zoom 1.3, renderScale 2). Port: render the
// artboard at 1.3x with plateGap = 0.11 * easeOutQuart(t / 2), crop the same
// 2600x3640 window (the source canvas is the default 1000x1400 scene bounds).
import { mkdirSync, writeFileSync } from "node:fs";
const OUT = process.argv[2] ?? "evidence/t0";
const STEPS = Number(process.argv[3] ?? 0);
mkdirSync(OUT, { recursive: true });

async function open(url) {
  const t = await (await fetch("http://localhost:9222/json/new?about:blank", { method: "PUT" })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0; const pend = new Map();
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); pend.get(m.id)?.(m); pend.delete(m.id); });
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const ev = async (x) => {
    const r = await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return r.result?.result?.value;
  };
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1034, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url });
  return { send, ev, close: () => fetch(`http://localhost:9222/json/close/${t.id}`) };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (p, expr) => { for (let i = 0; i < 200; i++) { if (await p.ev(expr).catch(() => false)) return; await sleep(150); } throw new Error("timeout " + expr); };
const frames = (p, n = 20) => p.ev(`new Promise(r=>{let i=0;const f=()=>++i>${n}?r(1):requestAnimationFrame(f);f()})`);
const save = (name, url) => writeFileSync(`${OUT}/${name}.png`, Buffer.from(url.split(",")[1], "base64"));

const src = await open("https://toolcraft.sh/demos/neon-iceberg/");
await waitFor(src, "!!document.querySelector('[data-iceberg-canvas]')");
await sleep(1500);
await src.ev(`document.querySelector('[aria-label="Pause playback"]')?.click() ?? true`);
await sleep(300);
const key = (k) => src.ev(`(()=>{const s=document.querySelector('[aria-label="Playback position"]');s.focus();for(const t of ['keydown','keyup'])s.dispatchEvent(new KeyboardEvent(t,{key:${JSON.stringify(k)},bubbles:true,cancelable:true}));return true})()`);
await key("Home");
for (let i = 0; i < STEPS; i++) { await key("ArrowRight"); await sleep(60); }
await sleep(400); await frames(src);
const time = Number(await src.ev(`document.querySelector('[aria-label="Playback position"]').getAttribute('aria-valuenow')`));
const srcCap = await src.ev(`(()=>{const c=document.querySelector('[data-iceberg-canvas]');return {w:c.width,h:c.height,url:c.toDataURL('image/png')}})()`);
save("source-canvas", srcCap.url);

const p = (((time % 2) + 2) % 2) / 2; // source: loop phase is t mod duration
const gap = 0.11 * (1 - (1 - p) ** 4);
const port = await open(`https://compronents.localhost:8443/nib-compare-tmp?gap=${gap}`);
await waitFor(port, "!!document.querySelector('canvas')?.width && document.querySelector('canvas').width > 3000");
await sleep(500); await frames(port);
const portCap = await port.ev(`(()=>{const c=document.querySelector('canvas');const o=document.createElement('canvas');o.width=2600;o.height=3640;o.getContext('2d').drawImage(c,260,260,2600,3640,0,0,2600,3640);return {w:c.width,h:c.height,url:o.toDataURL('image/png')}})()`);
save("port-canvas", portCap.url);
writeFileSync(`${OUT}/meta.json`, JSON.stringify({ time, gap, source: [srcCap.w, srcCap.h], portFull: [portCap.w, portCap.h] }, null, 2));
console.log(JSON.stringify({ time, gap, source: [srcCap.w, srcCap.h], portFull: [portCap.w, portCap.h] }));
await src.close(); await port.close(); process.exit(0);

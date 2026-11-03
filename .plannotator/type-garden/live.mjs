// Live port in headless Chrome (CDP 9223), no harness. Real typing on the
// preview; the docs page at desktop and phone widths; keys typed outside the
// garden must not grow letters.
import { writeFileSync } from "node:fs";
const CDP = process.env.CDP ?? "9223";
const BASE = "https://compronents.localhost:8443/components/type-garden";
async function open(url, width, height) {
  const tab = await (await fetch(`http://localhost:${CDP}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0; const pend = new Map(); const errors = [];
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200));
    pend.get(m.id)?.(m); pend.delete(m.id); });
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  const ev = async (x) => (await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: width < 500 });
  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, 6000));
  const shot = async (name) => { const r = await send("Page.captureScreenshot", { format: "png" }); writeFileSync(`evidence/live-${name}.png`, Buffer.from(r.result.data, "base64")); };
  const type = async (text) => { for (const ch of text) { await send("Input.insertText", { text: ch }); await new Promise((r) => setTimeout(r, 90)); } };
  return { send, ev, errors, shot, type, close: () => fetch(`http://localhost:${CDP}/json/close/${tab.id}`) };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pv = await open(`${BASE}/preview`, 1280, 800);
console.log("preview focused:", await pv.ev("document.activeElement?.getAttribute('data-tg')"));
await pv.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 700, y: 300 });
await pv.type("in bloom");
await sleep(2500);
await pv.shot("preview-typed");
await pv.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 900, y: 420, button: "left", clickCount: 1 });
await pv.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 900, y: 420, button: "left", clickCount: 1 });
await sleep(2500);
await pv.shot("preview-butterfly");
console.log("preview errors:", JSON.stringify(pv.errors));
await pv.close();

for (const [name, w, h] of [["docs-desktop", 1440, 1000], ["docs-phone", 390, 844]]) {
  const p = await open(BASE, w, h);
  console.log(name, "focused before click:", await p.ev("document.activeElement?.tagName"));
  await p.type("xyz");
  const r = await p.ev("(() => { const c = document.querySelector('[data-tg=app]'); if (!c) return 'no garden'; c.scrollIntoView({block: 'center'}); const b = c.getBoundingClientRect(); return JSON.stringify({ x: b.x, y: b.y, w: b.width, h: b.height }); })()");
  console.log(name, "garden rect:", r);
  await sleep(800);
  await p.shot(`${name}-untyped`);
  const b = JSON.parse(r);
  await p.send("Input.dispatchMouseEvent", { type: "mousePressed", x: b.x + b.w / 2, y: b.y + b.h * 0.3, button: "left", clickCount: 1 });
  await p.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: b.x + b.w / 2, y: b.y + b.h * 0.3, button: "left", clickCount: 1 });
  await p.type("rose");
  await sleep(2500);
  await p.shot(`${name}-typed`);
  console.log(name, "errors:", JSON.stringify(p.errors));
  await p.close();
}
process.exit(0);

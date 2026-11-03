// node probe.mjs <url> <expr> : evaluate an expression on a page after the iceberg canvas mounts.
const [, , url, expr, w = 1920, h = 1034] = process.argv;
const t = await (await fetch("http://localhost:9222/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pend = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); pend.get(m.id)?.(m); pend.delete(m.id); });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true })).result?.result;
await send("Emulation.setDeviceMetricsOverride", { width: +w, height: +h, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url });
for (let i = 0; i < 150; i++) { const r = await ev("!!document.querySelector('canvas[data-iceberg-canvas], .nib-canvas')"); if (r?.value) break; await new Promise((r) => setTimeout(r, 200)); }
await new Promise((r) => setTimeout(r, 1500));
console.log(JSON.stringify((await ev(expr)), null, 1));
await fetch(`http://localhost:9222/json/close/${t.id}`); process.exit(0);

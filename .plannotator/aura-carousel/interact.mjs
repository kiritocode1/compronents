// Drag and wheel the port over CDP; report scroll state and console errors.
const t = await (await fetch("http://localhost:9222/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pend = new Map(); const errors = [];
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map(a => a.value ?? a.description).join(" "));
  pend.get(m.id)?.(m); pend.delete(m.id); });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true })).result?.result?.value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1034, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "https://compronents.localhost:8443/components/aura-carousel/preview" });
for (let i = 0; i < 150 && !(await ev("document.querySelector('.acr-surface')?.dataset.railRenderer==='webgl'")); i++) await sleep(200);
const sl = () => ev("document.querySelector('.acr-surface').dataset.scrollLeft ?? 'init'");
const log = {};
log.start = await sl();
const mouse = (type, x, buttons = 1) => send("Input.dispatchMouseEvent", { type, x, y: 600, button: "left", buttons, clickCount: 1 });
await mouse("mousePressed", 1000);
for (let x = 1000; x >= 700; x -= 20) { await mouse("mouseMoved", x); await sleep(16); }
log.duringDrag = await sl();
await mouse("mouseReleased", 700, 0);
await sleep(900);
log.afterDragNoSnap = await sl();
for (let i = 0; i < 10; i++) { await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 960, y: 600, deltaX: 25, deltaY: 0 }); await sleep(16); }
log.duringWheel = await sl();
await sleep(1000);
log.afterWheelSnapped = await sl();
await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 960, y: 600, deltaX: 0, deltaY: 200 });
await sleep(300);
log.afterVerticalWheel = await sl();
log.errors = errors;
console.log(JSON.stringify(log, null, 1));
await fetch(`http://localhost:9222/json/close/${t.id}`); process.exit(0);

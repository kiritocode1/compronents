// Drag across the iceberg centre and off it; report whether the frame changed.
const t = await (await fetch("http://localhost:9222/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pend = new Map(); const errs = [];
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown") errs.push(m.params.exceptionDetails.text);
  pend.get(m.id)?.(m); pend.delete(m.id); });
const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true })).result?.result?.value;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 2100, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "https://compronents.localhost:8443/nib-compare-tmp?gap=0" });
for (let i = 0; i < 100 && !(await ev("document.querySelector('canvas')?.width>3000")); i++) await sleep(150);
await sleep(500);
const hash = () => ev("(()=>{const c=document.querySelector('canvas');const u=c.toDataURL();let h=0;for(let i=0;i<u.length;i+=97)h=(h*31+u.charCodeAt(i))|0;return h})()");
const drag = async (x0, y, x1) => {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: x0, y, button: "left", buttons: 1, clickCount: 1 });
  for (let x = x0; x <= x1; x += 15) { await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "left", buttons: 1 }); await sleep(16); }
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: x1, y, button: "left", buttons: 0, clickCount: 1 });
  await sleep(300);
};
const h0 = await hash();
await drag(60, 60, 260);           // empty corner: must not orbit
const h1 = await hash();
await drag(780, 1150, 980);        // on the block face: orbits
const h2 = await hash();
console.log(JSON.stringify({ emptyDragChanged: h0 !== h1, objectDragChanged: h1 !== h2, errors: errs }));
await fetch(`http://localhost:9222/json/close/${t.id}`); process.exit(0);

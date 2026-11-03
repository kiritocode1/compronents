// node console.mjs <url> : print console errors/warnings and exceptions for 6s.
const [, , url] = process.argv;
const t = await (await fetch("http://localhost:9222/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown") console.log("EXC", JSON.stringify(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).slice(0, 1500));
  if (m.method === "Runtime.consoleAPICalled" && ["error","warning"].includes(m.params.type)) console.log(m.params.type.toUpperCase(), m.params.args.map(a => a.value ?? a.description).join(" ").slice(0, 1500)); });
const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++id, method, params }));
send("Runtime.enable");
send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1034, deviceScaleFactor: 1, mobile: false });
send("Page.navigate", { url });
await new Promise((r) => setTimeout(r, 6000));
await fetch(`http://localhost:9222/json/close/${t.id}`); process.exit(0);

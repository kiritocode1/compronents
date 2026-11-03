// Live port, no harness: normal and reduced motion. Prints console errors.
import { writeFileSync } from "node:fs";
const URL_ = "https://compronents.localhost:8443/components/growth-clock/preview";
async function shot(name, reduce) {
  const tab = await (await fetch("http://localhost:9222/json/new?about:blank", { method: "PUT" })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0; const pend = new Map(); const errors = [];
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data);
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value ?? a.description).join(" "));
    pend.get(m.id)?.(m); pend.delete(m.id); });
  const send = (method, params = {}) => new Promise((r) => { const n = ++id; pend.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
  if (reduce) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Page.navigate", { url: URL_ });
  await new Promise((r) => setTimeout(r, 4000));
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`evidence/live-${name}.png`, Buffer.from(r.result.data, "base64"));
  console.log(name, "errors:", JSON.stringify(errors));
  await fetch(`http://localhost:9222/json/close/${tab.id}`);
}
await shot("default", false);
await shot("reduced", true);
process.exit(0);

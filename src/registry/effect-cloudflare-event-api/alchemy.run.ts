import alchemy from "alchemy";
import { KVNamespace, Worker } from "alchemy/cloudflare";

const app = await alchemy("blank-effect-event-api");

const events = await KVNamespace("events", {
  title: "blank-effect-events",
});

export const api = await Worker("api", {
  name: "blank-effect-event-api",
  entrypoint: "src/event-api/worker.ts",
  bindings: { EVENTS: events },
  compatibilityDate: "2026-07-15",
  sourceMap: true,
  url: true,
  observability: {
    enabled: true,
    logs: { enabled: true, persist: true },
    traces: { enabled: true, persist: true },
  },
  dev: { port: 8787 },
});

console.log(api.url);

await app.finalize();

/**
 * telemetry.ts: zero-instrumentation HTTP observability, no APM vendor.
 *
 * The request handlers below contain NO logging or timing code at all.
 * Everything is observed from the outside via the diagnostics channels Node
 * core already publishes: http.server.request.start / response.finish for
 * inbound requests, undici:request:create for outbound fetch() calls,
 * net.server.socket for connection counts. Request ids come from
 * AsyncLocalStorage bound directly to the http.server.request.start channel
 * with channel.bindStore, so the id propagates into every async continuation
 * of a request, including outbound fetches made while serving it.
 *
 * Emits structured JSON logs per request and keeps per-route latency
 * histograms, exposed in Prometheus text format at GET /metrics.
 *
 * Modern Node primitives used: diagnostics_channel built-in channels,
 * channel.bindStore + AsyncLocalStorage (async_hooks), global fetch backed
 * by undici and its undici:* channels, performance.now, crypto.randomUUID,
 * type stripping (.ts runs directly).
 *
 * run: PORT=4242 node telemetry.ts
 * try: curl localhost:4242/ping ; curl localhost:4242/work ; curl localhost:4242/metrics
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { subscribe } from "node:diagnostics_channel";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = Number(process.env.PORT ?? 4242);

// ---------------------------------------------------------- request context

interface ReqCtx {
  id: string;
  route: string;
  t0: number;
  outbound: number;
}

const als = new AsyncLocalStorage<ReqCtx>();
const ctxByRequest = new WeakMap<IncomingMessage, ReqCtx>();

// The request.start subscriber runs synchronously inside the request's async
// scope, so enterWith here binds a context the handler and every async
// continuation of it (including outbound fetches) will see. Verified on
// Node 22.22.3: channel.bindStore on this channel does NOT enter the store
// for http server requests on this line, enterWith in a subscriber does.
subscribe("http.server.request.start", (m) => {
  const { request } = m as { request: IncomingMessage };
  const ctx: ReqCtx = {
    id: randomUUID().slice(0, 8),
    route: `${request.method} ${(request.url ?? "/").split("?")[0]}`,
    t0: performance.now(),
    outbound: 0,
  };
  ctxByRequest.set(request, ctx);
  als.enterWith(ctx);
});

// ------------------------------------------------------------- metrics core

const BUCKETS_MS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500];

class Histogram {
  counts = new Array<number>(BUCKETS_MS.length + 1).fill(0);
  sum = 0;
  total = 0;
  record(ms: number): void {
    this.sum += ms;
    this.total++;
    const i = BUCKETS_MS.findIndex((b) => ms <= b);
    this.counts[i === -1 ? BUCKETS_MS.length : i]++;
  }
}

const latencyByRoute = new Map<string, Histogram>();
const statusByRoute = new Map<string, number>();
let serverSockets = 0;
let outboundTotal = 0;

// finish can fire from the socket's write context, not the request's, so
// correlate through the WeakMap keyed by the request object instead of ALS.
subscribe("http.server.response.finish", (m) => {
  const { request, response } = m as {
    request: IncomingMessage;
    response: ServerResponse;
  };
  const ctx = ctxByRequest.get(request);
  if (!ctx) return;
  const durMs = performance.now() - ctx.t0;
  let h = latencyByRoute.get(ctx.route);
  if (!h) latencyByRoute.set(ctx.route, (h = new Histogram()));
  h.record(durMs);
  const key = `${ctx.route}|${response.statusCode}`;
  statusByRoute.set(key, (statusByRoute.get(key) ?? 0) + 1);
  log("request", {
    reqId: ctx.id,
    route: ctx.route,
    status: response.statusCode,
    durMs: Number(durMs.toFixed(2)),
    outbound: ctx.outbound,
  });
});

// Outbound fetch() calls surface here via undici's channels, correlated to
// the inbound request purely through AsyncLocalStorage continuation.
subscribe("undici:request:create", (m) => {
  const { request } = m as {
    request: { origin: string; method: string; path: string };
  };
  outboundTotal++;
  const ctx = als.getStore();
  if (ctx) ctx.outbound++;
  log("outbound", {
    reqId: ctx?.id ?? null,
    method: request.method,
    target: `${request.origin}${request.path}`,
  });
});

subscribe("net.server.socket", () => {
  serverSockets++;
});

function log(event: string, fields: Record<string, unknown>): void {
  console.log(
    JSON.stringify({ ts: new Date().toISOString(), event, ...fields }),
  );
}

function renderMetrics(): string {
  const lines: string[] = [
    "# HELP http_request_duration_ms Inbound request latency by route.",
    "# TYPE http_request_duration_ms histogram",
  ];
  for (const [route, h] of latencyByRoute) {
    let cum = 0;
    BUCKETS_MS.forEach((b, i) => {
      cum += h.counts[i];
      lines.push(
        `http_request_duration_ms_bucket{route="${route}",le="${b}"} ${cum}`,
      );
    });
    lines.push(
      `http_request_duration_ms_bucket{route="${route}",le="+Inf"} ${h.total}`,
    );
    lines.push(
      `http_request_duration_ms_sum{route="${route}"} ${h.sum.toFixed(3)}`,
    );
    lines.push(`http_request_duration_ms_count{route="${route}"} ${h.total}`);
  }
  lines.push("# TYPE http_responses_total counter");
  for (const [key, n] of statusByRoute) {
    const [route, status] = key.split("|");
    lines.push(
      `http_responses_total{route="${route}",status="${status}"} ${n}`,
    );
  }
  lines.push(
    "# TYPE net_server_sockets_total counter",
    `net_server_sockets_total ${serverSockets}`,
  );
  lines.push(
    "# TYPE outbound_requests_total counter",
    `outbound_requests_total ${outboundTotal}`,
  );
  return lines.join("\n") + "\n";
}

// ------------------------------------------- the app: deliberately untouched

// Note there is not a single log/timing/id line in these handlers. That is
// the point: observability comes entirely from diagnostics_channel above.
const server = createServer(async (req, res) => {
  const path = (req.url ?? "/").split("?")[0];
  if (path === "/ping") {
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ pong: true }));
  } else if (path === "/work") {
    // Simulated real work: an outbound HTTP call plus some compute time.
    const upstream = await fetch(`http://127.0.0.1:${PORT}/ping`).then((r) =>
      r.json(),
    );
    await sleep(15 + Math.random() * 30);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ done: true, upstream }));
  } else if (path === "/metrics") {
    res.setHeader("content-type", "text/plain; version=0.0.4");
    res.end(renderMetrics());
  } else {
    res.statusCode = 404;
    res.end("not found\n");
  }
});

server.listen(PORT, () => log("listening", { port: PORT }));

process.once("SIGINT", () => {
  log("shutdown", { routes: latencyByRoute.size, outboundTotal });
  server.close(() => process.exit(0));
});

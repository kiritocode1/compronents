#!/usr/bin/env node
/**
 * BLANK direction MCP server (stdio JSON-RPC).
 *
 * Tools:
 *   direction_discover    — proactive registry + wall discovery
 *   direction_lookup      — registry + wall (default)
 *   inspiration_recommend — wall only
 *   registry_search       — installables only
 *
 * Env:
 *   BLANK_DIRECTION_URL  base URL (default https://ui.aryank.space)
 *
 * Register:
 *   claude mcp add blank-direction -- node /path/to/mcp/blank-direction/server.mjs
 */

import { createInterface } from "node:readline";

const BASE = (
  process.env.BLANK_DIRECTION_URL || "https://ui.aryank.space"
).replace(/\/$/, "");

const TOOLS = [
  {
    name: "direction_discover",
    description:
      "Call before planning or making the first choice-bearing UI, frontend, component, library, tool, or craft decision. Returns 8 to 12 varied BLANK candidates. Scan them, inspect at most 3, explain the mechanism and why it fits, apply it, compare the result, and cite only sources that changed the work.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "The task and its constraints in the user's own words",
        },
        section: {
          type: "string",
          enum: ["components", "pages", "backend", "all"],
          description: "Registry section filter",
        },
        limit: {
          type: "number",
          description: "Candidate count from 8 to 12, default 10",
        },
      },
      required: ["task"],
    },
  },
  {
    name: "direction_lookup",
    description:
      "Strict lookup for a concrete, known need. Search installable registry first, then the inspiration wall. Use direction_discover before planning when choices are still open. Returns markdown with reg_* and insp_* citation ids.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "User ask in their own words",
        },
        section: {
          type: "string",
          enum: ["components", "pages", "backend", "all"],
          description: "Registry section filter",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "inspiration_recommend",
    description:
      "Recommend up to 3 picks from the inspiration second brain (taste/reference). Prefer direction_lookup when the user might also need an installable BLANK component.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number", description: "Max picks 1-5, default 3" },
      },
      required: ["query"],
    },
  },
  {
    name: "registry_search",
    description:
      "Search BLANK registry installables (components, pages, backend) for npx shadcn add commands.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        section: {
          type: "string",
          enum: ["components", "pages", "backend", "all"],
        },
        limit: { type: "number" },
      },
      required: ["query"],
    },
  },
];

async function fetchText(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "text/markdown, text/plain, */*" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

async function callTool(name, args = {}) {
  if (name === "direction_discover") {
    const task = encodeURIComponent(String(args.task || "").trim());
    if (!task) throw new Error("task is required");
    const section = args.section
      ? `&section=${encodeURIComponent(args.section)}`
      : "";
    const limit = args.limit ? `&limit=${Number(args.limit) || 10}` : "";
    return fetchText(`/direction/discover?q=${task}${section}${limit}`);
  }

  const q = encodeURIComponent(String(args.query || "").trim());
  if (!q) throw new Error("query is required");

  if (name === "direction_lookup") {
    const section = args.section
      ? `&section=${encodeURIComponent(args.section)}`
      : "";
    return fetchText(`/direction?q=${q}${section}`);
  }
  if (name === "inspiration_recommend") {
    const limit = args.limit ? `&limit=${Number(args.limit) || 3}` : "";
    return fetchText(`/inspiration/recommend?q=${q}${limit}`);
  }
  if (name === "registry_search") {
    const section = args.section
      ? `&section=${encodeURIComponent(args.section)}`
      : "";
    const limit = args.limit ? `&limit=${Number(args.limit) || 5}` : "";
    return fetchText(`/registry/search?q=${q}${section}${limit}`);
  }
  throw new Error(`Unknown tool: ${name}`);
}

function send(msg) {
  process.stdout.write(`${JSON.stringify(msg)}\n`);
}

function ok(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function err(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handle(msg) {
  if (!msg || msg.jsonrpc !== "2.0") return;
  const { id, method, params } = msg;

  try {
    if (method === "initialize") {
      ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "blank-direction", version: "1.1.0" },
      });
      return;
    }
    if (method === "notifications/initialized" || method === "initialized") {
      return;
    }
    if (method === "tools/list") {
      ok(id, { tools: TOOLS });
      return;
    }
    if (method === "tools/call") {
      const name = params?.name;
      const args = params?.arguments ?? {};
      const text = await callTool(name, args);
      ok(id, {
        content: [{ type: "text", text }],
        isError: false,
      });
      return;
    }
    if (method === "ping") {
      ok(id, {});
      return;
    }
    // Ignore unknown notifications (no id)
    if (id !== undefined && id !== null) {
      err(id, -32601, `Method not found: ${method}`);
    }
  } catch (e) {
    if (id !== undefined && id !== null) {
      err(id, -32000, e instanceof Error ? e.message : String(e));
    }
  }
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return;
  }
  // Fire and forget; MCP allows concurrent requests
  void handle(msg);
});

process.stderr.write(`blank-direction MCP ready (base=${BASE})\n`);

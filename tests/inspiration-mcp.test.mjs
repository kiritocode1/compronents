import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

const serverPath = new URL("../mcp/blank-direction/server.mjs", import.meta.url)
  .pathname;
let fixture;
let fixtureUrl;
let child;
let nextId = 1;
const pending = new Map();
const requests = [];

before(async () => {
  fixture = createServer((request, response) => {
    const url = new URL(request.url, "http://fixture.test");
    requests.push({
      accept: request.headers.accept,
      path: url.pathname,
      params: Object.fromEntries(url.searchParams),
    });

    let body;
    if (url.pathname === "/api/inspiration/search") {
      body =
        url.searchParams.get("format") === "json"
          ? JSON.stringify({
              kind: "inspiration-json",
              query: url.searchParams.get("query"),
            })
          : `markdown:${url.searchParams.get("query")}`;
    } else if (url.pathname === "/direction/discover") {
      body = JSON.stringify({
        kind: "discover-json",
        task: url.searchParams.get("q"),
      });
    } else if (url.pathname === "/registry/search") {
      body = JSON.stringify({
        kind: "registry-json",
        query: url.searchParams.get("q"),
      });
    } else {
      response.writeHead(404);
      response.end("missing fixture route");
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(body);
  });
  fixture.listen(0, "127.0.0.1");
  await once(fixture, "listening");
  fixtureUrl = `http://127.0.0.1:${fixture.address().port}`;

  child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, BLANK_DIRECTION_URL: fixtureUrl },
    stdio: ["pipe", "pipe", "ignore"],
  });
  child.stdout.setEncoding("utf8");
  let buffer = "";
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    for (const line of buffer.split("\n").slice(0, -1)) {
      if (!line.trim()) continue;
      const message = JSON.parse(line);
      const resolve = pending.get(message.id);
      if (resolve) {
        pending.delete(message.id);
        resolve(message);
      }
    }
    buffer = buffer.slice(buffer.lastIndexOf("\n") + 1);
  });
});

after(async () => {
  child.kill();
  await once(child, "close");
  fixture.close();
  await once(fixture, "close");
});

function rpc(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`,
    );
    setTimeout(() => {
      if (pending.delete(id))
        reject(new Error(`timed out waiting for ${method}`));
    }, 2_000).unref();
  });
}

async function callTool(name, arguments_) {
  const reply = await rpc("tools/call", { name, arguments: arguments_ });
  assert.equal(reply.error, undefined, JSON.stringify(reply.error));
  return reply.result.content[0].text;
}

test("lists the MCP tools through the actual stdio server", async () => {
  const reply = await rpc("tools/list");
  assert.deepEqual(
    reply.result.tools.map((tool) => tool.name),
    [
      "inspiration_search",
      "inspiration_inspect",
      "inspiration_feedback",
      "direction_discover",
      "direction_lookup",
      "inspiration_recommend",
      "registry_search",
    ],
  );
});

test("inspiration_search defaults to markdown and preserves explicit JSON context", async () => {
  requests.length = 0;
  const markdown = await callTool("inspiration_search", {
    query: "cursor trail",
  });
  assert.equal(markdown, "markdown:cursor trail");
  assert.deepEqual(requests[0].params, {
    query: "cursor trail",
    format: "markdown",
  });
  assert.match(requests[0].accept, /text\/markdown/);

  const json = await callTool("inspiration_search", {
    query: "glass card",
    contextKey: "ctx a/b",
    format: "json",
  });
  assert.deepEqual(JSON.parse(json), {
    kind: "inspiration-json",
    query: "glass card",
  });
  assert.deepEqual(requests[1].params, {
    query: "glass card",
    contextKey: "ctx a/b",
    format: "json",
  });
  assert.match(requests[1].accept, /application\/json/);
});

test("direction_discover uses the explicit JSON path and encoded task", async () => {
  requests.length = 0;
  const text = await callTool("direction_discover", {
    task: "Build a UI for A/B research",
    section: "components",
    limit: 8,
    format: "json",
  });
  assert.deepEqual(JSON.parse(text), {
    kind: "discover-json",
    task: "Build a UI for A/B research",
  });
  assert.deepEqual(requests[0].params, {
    q: "Build a UI for A/B research",
    section: "components",
    limit: "8",
    format: "json",
  });
  assert.match(requests[0].accept, /application\/json/);
});

test("registry_search uses the explicit JSON path and preserves filters", async () => {
  requests.length = 0;
  const text = await callTool("registry_search", {
    query: "rate limiter",
    section: "backend",
    limit: 4,
    format: "json",
  });
  assert.deepEqual(JSON.parse(text), {
    kind: "registry-json",
    query: "rate limiter",
  });
  assert.deepEqual(requests[0].params, {
    q: "rate limiter",
    section: "backend",
    limit: "4",
    format: "json",
  });
  assert.match(requests[0].accept, /application\/json/);
});

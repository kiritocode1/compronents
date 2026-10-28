// Static server for the isolated preview; portless supplies PORT.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
const root = new URL(".", import.meta.url).pathname;
const types = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".mp4": "video/mp4", ".md": "text/markdown" };
createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^\/+/, "");
  try {
    const body = await readFile(join(root, path || "index.html"));
    res.writeHead(200, { "content-type": types[extname(path || "index.html")] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(Number(process.env.PORT));

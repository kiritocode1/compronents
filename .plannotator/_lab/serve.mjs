// Static server for preview labs under .plannotator/. Start it through
// portless so it gets a stable name, never a raw port:
//   portless lab.compronents node .plannotator/_lab/serve.mjs
//   -> https://lab.compronents.localhost/<name>/
// Also serves reference/ at /reference/ so a lab can load pinned source files.
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const labRoot = join(root, ".plannotator");
const refRoot = join(root, "reference");
const port = Number(process.env.PORT);
if (!port) throw new Error("PORT is unset; start this through portless");

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".glb": "model/gltf-binary",
  ".woff2": "font/woff2",
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  let path = decodeURIComponent(url.pathname);
  const base = path.startsWith("/reference/") ? refRoot : labRoot;
  if (base === refRoot) path = path.slice("/reference".length);
  let file = normalize(join(base, path));
  if (!file.startsWith(base)) {
    res.writeHead(403).end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory())
    file = join(file, "index.html");
  if (!existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": types[extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`lab server on ${port}`));

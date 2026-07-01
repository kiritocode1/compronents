// Reusable: upload a source site's public assets to Blob under <prefix>/<relpath>.
// Usage: node scripts/upload-template-assets.mjs <absoluteSrcDir> <blobPrefix>
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { put } from "@vercel/blob";

const [, , SRC, PREFIX] = process.argv;
if (!SRC || !PREFIX) {
  console.error("usage: upload-template-assets.mjs <srcDir> <blobPrefix>");
  process.exit(1);
}

const TYPES = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".mp3": "audio/mpeg", ".glb": "model/gltf-binary",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
  ".json": "application/json",
};

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(SRC).filter((f) => TYPES[extname(f).toLowerCase()]);
let done = 0;
for (const file of files) {
  const rel = relative(SRC, file).split("\\").join("/");
  const contentType = TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
  const res = await put(`${PREFIX}/${rel}`, readFileSync(file), {
    access: "public", addRandomSuffix: false, allowOverwrite: true, contentType, token,
  });
  done++;
  console.log(`${done}/${files.length} ${PREFIX}/${rel} -> ${res.url}`);
}
console.log(`DONE ${done} files`);

// One-off: upload salle-blanche public images to Blob under dining-room-page/<relpath>.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { put } from "@vercel/blob";

const SRC = "/Users/blank/Documents/full-pages/CGMWTFEB2026/salle-blanche/public";
const PREFIX = "dining-room-page";

const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };

// load token from .env.local
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

const files = walk(SRC);
let done = 0;
for (const file of files) {
  const rel = relative(SRC, file).split("\\").join("/");
  const ext = extname(file).toLowerCase();
  const contentType = TYPES[ext] ?? "application/octet-stream";
  const pathname = `${PREFIX}/${rel}`;
  const res = await put(pathname, readFileSync(file), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    token,
  });
  done++;
  console.log(`${done}/${files.length} ${pathname} -> ${res.url}`);
}
console.log(`DONE ${done} files`);

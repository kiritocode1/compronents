// Upload a directory to Blob, preserving relative paths.
// Usage: node scripts/upload-tree.mjs <blobPrefix> <dir> [dir...]
// A file at <dir>/textures/a.png lands at <blobPrefix>/textures/a.png, which is
// what a .gltf needs: its image URIs are relative to the model file.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { put } from "@vercel/blob";

const [, , PREFIX, ...DIRS] = process.argv;
if (!PREFIX || DIRS.length === 0) {
  console.error("usage: upload-tree.mjs <blobPrefix> <dir> [dir...]");
  process.exit(1);
}

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".json": "application/json",
  ".glsl": "text/plain",
  ".txt": "text/plain",
};

const SKIP = new Set([".DS_Store"]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry) || entry === "__MACOSX") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

let done = 0;
for (const dir of DIRS) {
  for (const file of walk(dir)) {
    const pathname = `${PREFIX}/${relative(dir, file).split("\\").join("/")}`;
    const res = await put(pathname, readFileSync(file), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType:
        TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
      token,
    });
    done++;
    console.log(`${pathname} -> ${res.url}`);
  }
}
console.log(`uploaded ${done} file(s)`);

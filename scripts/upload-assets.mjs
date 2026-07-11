// Generic: upload files to Blob. Usage: node scripts/upload-assets.mjs <blobPrefix> <file> [file...]
// Each file lands at <blobPrefix>/<basename>.
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { put } from "@vercel/blob";

const [, , PREFIX, ...FILES] = process.argv;
if (!PREFIX || FILES.length === 0) {
  console.error("usage: upload-assets.mjs <blobPrefix> <file> [file...]");
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
  ".mp4": "video/mp4",
};

let done = 0;
for (const file of FILES) {
  const name = basename(file);
  const contentType =
    TYPES[extname(name).toLowerCase()] ?? "application/octet-stream";
  const res = await put(`${PREFIX}/${name}`, readFileSync(file), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    token,
  });
  done++;
  console.log(`${done}/${FILES.length} ${res.pathname ?? res.url}`);
}
console.log(`DONE ${done}`);

// One-off: upload the Starry Night region map to Blob.
// The map must stay LOSSLESS — it encodes flat region ids as flat colors, and
// lossy compression would smear them into unmatchable in-between values.
// Usage: node scripts/upload-starry-night-regions.mjs <absolutePngPath>
import { readFileSync } from "node:fs";
import { put } from "@vercel/blob";

const [, , SRC] = process.argv;
if (!SRC) {
  console.error("usage: upload-starry-night-regions.mjs <pngPath>");
  process.exit(1);
}

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const pathname = "starry-night-flow/starry-night-regions.png";
const res = await put(pathname, readFileSync(SRC), {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "image/png",
  token,
});
console.log(`${pathname} -> ${res.url}`);

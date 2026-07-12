// One-off: upload unusual-studio images, fonts, and lottie json to Blob.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";

const ROOT =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/8d8ee38e-13ff-423e-a598-1acdd2221e34/scratchpad/src-us/MWTJULY2023/Source Code/unusual-studio";
const PREFIX = "unusual-studio-page";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const TYPES = {
  ".jpg": "image/jpeg",
  ".otf": "font/otf",
  ".json": "application/json",
};

let n = 0;
async function up(absPath, blobPath) {
  const ext = blobPath.slice(blobPath.lastIndexOf("."));
  const res = await put(`${PREFIX}/${blobPath}`, readFileSync(absPath), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: TYPES[ext] ?? "application/octet-stream",
    token,
  });
  n += 1;
  console.log(n, res.url.split(`/${PREFIX}/`)[1]);
}

for (const f of readdirSync(join(ROOT, "src/assets"))) {
  if (f.endsWith(".jpg")) await up(join(ROOT, "src/assets", f), `images/${f}`);
}
for (const f of readdirSync(join(ROOT, "public/fonts"))) {
  if (f.endsWith(".otf")) await up(join(ROOT, "public/fonts", f), `fonts/${f}`);
}
await up(join(ROOT, "src/Components/careers-lottie.json"), "careers-lottie.json");
console.log("done", n);

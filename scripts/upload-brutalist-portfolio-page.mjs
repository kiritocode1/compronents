// One-off: upload brutalist portfolio images + PP fonts to Blob.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";

const ROOT =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/8d8ee38e-13ff-423e-a598-1acdd2221e34/scratchpad/src-bru/CGMWTAUGUST2023";
const IMAGES = join(ROOT, "Source Code/Brutalist Portfolio/images");
const FONTS = join(ROOT, "Fonts");
const PREFIX = "brutalist-portfolio-page";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const TYPES = { ".png": "image/png", ".otf": "font/otf" };
let n = 0;
async function up(abs, blobPath) {
  const ext = blobPath.slice(blobPath.lastIndexOf("."));
  const res = await put(`${PREFIX}/${blobPath}`, readFileSync(abs), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: TYPES[ext] ?? "application/octet-stream",
    token,
  });
  n += 1;
  console.log(n, res.url.split(`/${PREFIX}/`)[1]);
}

for (const f of readdirSync(IMAGES)) {
  if (f.endsWith(".png")) await up(join(IMAGES, f), `images/${f}`);
}
for (const f of readdirSync(FONTS)) {
  if (f.endsWith(".otf")) await up(join(FONTS, f), `fonts/${f}`);
}
console.log("done", n);

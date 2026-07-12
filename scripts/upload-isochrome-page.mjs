// One-off: upload ISOChrome public assets + fonts to Blob.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { put } from "@vercel/blob";

const PUBLIC =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/8d8ee38e-13ff-423e-a598-1acdd2221e34/scratchpad/src-iso/CGMWTFEB2025/Source Code/isochrome/public";
const PREFIX = "isochrome-page";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const TYPES = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".ico": "image/x-icon",
};
function walk(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    if (f === ".DS_Store" || f.startsWith("._")) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}
let n = 0;
for (const file of walk(PUBLIC)) {
  const rel = relative(PUBLIC, file).split("\\").join("/");
  const ext = rel.slice(rel.lastIndexOf("."));
  if (!TYPES[ext] || ext === ".ico") continue;
  const res = await put(`${PREFIX}/${rel}`, readFileSync(file), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: TYPES[ext],
    token,
  });
  n += 1;
  console.log(n, res.url.split(`/${PREFIX}/`)[1]);
}
console.log("done", n);

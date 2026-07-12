// One-off: upload Null Studio (September) images + fonts to Blob.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { put } from "@vercel/blob";

const ROOT =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/8d8ee38e-13ff-423e-a598-1acdd2221e34/scratchpad/src-sep/MWTSEPTEMBER2023";
const ASSETS = join(ROOT, "Source Code/assets");
const PREFIX = "null-studio-page";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const TYPES = {
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
};
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
function walk(dir) {
  const out = [];
  for (const f of readdirSync(dir)) {
    if (f === ".DS_Store") continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

for (const f of walk(ASSETS)) {
  const rel = relative(ASSETS, f).split("\\").join("/");
  if (/\.(jpg|webp)$/.test(f)) await up(f, `images/${rel}`);
}

const FONTS = [
  ["Fonts/Cosi Times/CosiTimes-Roman.ttf", "CosiTimes-Roman.ttf"],
  ["Fonts/Cosi Times/CosiTimes-Bold.ttf", "CosiTimes-Bold.ttf"],
  ["Fonts/Cosi Times/CosiTimes-Light.ttf", "CosiTimes-Light.ttf"],
  ["Fonts/PP Eiko/PPEiko-Light.otf", "PPEiko-Light.otf"],
  ["Fonts/PP Eiko/PPEiko-Medium.otf", "PPEiko-Medium.otf"],
  ["Fonts/PP Eiko/PPEiko-Regular.otf", "PPEiko-Regular.otf"],
  ["Fonts/PP Neue Montreal/NeueMontreal-Light.otf", "NeueMontreal-Light.otf"],
  ["Fonts/PP Neue Montreal/NeueMontreal-Medium.otf", "NeueMontreal-Medium.otf"],
  ["Fonts/PP Neue Montreal/NeueMontreal-Regular.otf", "NeueMontreal-Regular.otf"],
];
for (const [src, name] of FONTS) await up(join(ROOT, src), `fonts/${name}`);
console.log("done", n);

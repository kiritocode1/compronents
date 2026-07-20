// One-off: upload Juan Mora page assets (images, lottie JSON, fonts, video) to Blob.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { put } from "@vercel/blob";

const SRC =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/603f7c64-0db7-441a-8ef3-06db10b66b1b/scratchpad/jm";
const PREFIX = "juan-mora-page";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const TYPES = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
};

// only these source dirs ship; css/ and js/ stay out of Blob
const DIRS = ["images", "documents", "fonts", "videos-work"];

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
for (const d of DIRS) {
  for (const file of walk(join(SRC, d))) {
    const rel = relative(SRC, file).split("\\").join("/");
    const ext = rel.slice(rel.lastIndexOf("."));
    if (!TYPES[ext]) continue;
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
}
console.log("done", n);

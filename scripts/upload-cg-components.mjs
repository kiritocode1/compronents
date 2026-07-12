// One-off: upload landing-image-reveal + spotlight-gallery-scroll media to Blob.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";

const CG =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/8d8ee38e-13ff-423e-a598-1acdd2221e34/scratchpad/cg";
const JOBS = [
  [join(CG, "codegrid-steelworks-landing-page-reveal/public"), "landing-image-reveal"],
  [join(CG, "codegrie-voltlites-scroll-animation/public"), "spotlight-gallery-scroll"],
];

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const TYPES = { ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".png": "image/png" };
let n = 0;
for (const [dir, prefix] of JOBS) {
  for (const f of readdirSync(dir)) {
    if (f.startsWith(".")) continue;
    const ext = f.slice(f.lastIndexOf("."));
    if (!TYPES[ext]) continue;
    const res = await put(`${prefix}/${f}`, readFileSync(join(dir, f)), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: TYPES[ext],
      token,
    });
    n += 1;
    console.log(n, res.url.split("/vercel-storage.com/")[1]);
  }
}
console.log("done", n);

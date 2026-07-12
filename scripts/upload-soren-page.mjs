// One-off: upload soren work images to Blob under soren-page/work/<file>.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";

const DIR =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/8d8ee38e-13ff-423e-a598-1acdd2221e34/scratchpad/src-soren/CGMWTAPRIL2024/Source Code/soren/src/assets/work";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

let n = 0;
for (const f of readdirSync(DIR)) {
  if (!f.endsWith(".jpg")) continue;
  const res = await put(`soren-page/work/${f}`, readFileSync(join(DIR, f)), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/jpeg",
    token,
  });
  n += 1;
  console.log(n, res.url.split("/soren-page/")[1]);
}
console.log("done", n);

// One-off: upload neoteric project + team images to Blob under neoteric-page/.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";

const ROOT =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/8d8ee38e-13ff-423e-a598-1acdd2221e34/scratchpad/src-neo/CGMWTOCTOBER2023/Source Code/neoteric/src/assets";
const DIRS = [
  [join(ROOT, "project-images"), "project-images"],
  [join(ROOT, "team"), "team"],
];

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

let n = 0;
for (const [dir, sub] of DIRS) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".jpg")) continue;
    const res = await put(
      `neoteric-page/${sub}/${f}`,
      readFileSync(join(dir, f)),
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "image/jpeg",
        token,
      },
    );
    n += 1;
    console.log(n, res.url.split("/neoteric-page/")[1]);
  }
}
console.log("done", n);

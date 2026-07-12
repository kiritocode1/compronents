// One-off: upload velasco-solari source media to Blob under velasco-solari-page/<relpath>.
import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { put } from "@vercel/blob";

const ROOT =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/8d8ee38e-13ff-423e-a598-1acdd2221e34/scratchpad/src-velasco/CGMWTDEC2023/Source Code/velasco-solari";
const PREFIX = "velasco-solari-page";

// (source dir, blob subpath)
const DIRS = [
  [join(ROOT, "src/assets/project-images"), "project-images"],
  [join(ROOT, "public/fonts"), "fonts"],
];

const TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

let done = 0;
for (const [dir, sub] of DIRS) {
  for (const file of walk(dir)) {
    const rel = relative(dir, file).split("\\").join("/");
    const ext = extname(file).toLowerCase();
    const pathname = `${PREFIX}/${sub}/${rel}`;
    const res = await put(pathname, readFileSync(file), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: TYPES[ext] ?? "application/octet-stream",
      token,
    });
    done += 1;
    console.log(`${done}  ${pathname}  ->  ${res.url}`);
  }
}
console.log(`\nUploaded ${done} files.`);

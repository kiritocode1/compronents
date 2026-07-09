// One-off: upload GLSL shader files to Blob under <prefix>/shaders/<name>.
// Usage: node scripts/upload-shaders.mjs <absoluteShaderDir> <blobPrefix>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";

const [, , SRC, PREFIX] = process.argv;
if (!SRC || !PREFIX) {
  console.error("usage: upload-shaders.mjs <shaderDir> <blobPrefix>");
  process.exit(1);
}

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = env.match(/BLOB_READ_WRITE_TOKEN=("?)(.+?)\1\s*$/m)?.[2];
if (!token) throw new Error("BLOB_READ_WRITE_TOKEN missing in .env.local");

const files = readdirSync(SRC).filter((f) => /\.(frag|vert)$/.test(f));
let done = 0;
for (const name of files) {
  const res = await put(`${PREFIX}/shaders/${name}`, readFileSync(join(SRC, name)), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "text/plain; charset=utf-8",
    token,
  });
  done++;
  console.log(`${done}/${files.length} ${PREFIX}/shaders/${name} -> ${res.url}`);
}
console.log(`DONE ${done} shaders`);

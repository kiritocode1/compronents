// Bundle a preview lab: `node .plannotator/_lab/build.mjs <name>`.
// Reads .plannotator/<name>/lab.tsx and writes .plannotator/<name>/lab.js, a
// browser ESM bundle with React and any repo dependency (three, postprocessing,
// matter-js) resolved from the repo's node_modules. Pass --watch to rebuild on
// change. Serve with serve.mjs and open https://lab.compronents.localhost/<name>/.
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(join(root, "package.json"));
const esbuild = require(
  join(root, "node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild"),
);

const name = process.argv[2];
if (!name) {
  console.error("usage: node .plannotator/_lab/build.mjs <name> [--watch]");
  process.exit(1);
}
const entry = join(root, ".plannotator", name, "lab.tsx");
if (!existsSync(entry)) {
  console.error(`missing ${entry}`);
  process.exit(1);
}

const options = {
  entryPoints: [entry],
  outfile: join(root, ".plannotator", name, "lab.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  sourcemap: "inline",
  absWorkingDir: root,
  nodePaths: [join(root, "node_modules")],
  alias: { "@": join(root, "src") },
  loader: { ".glsl": "text", ".frag": "text", ".vert": "text" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}

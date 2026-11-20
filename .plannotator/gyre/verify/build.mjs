// Bundle the Gyre lab. Same options as _lab/build.mjs, plus a scratch
// node_modules for opentype.js until the dependency is approved.
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const require = createRequire(join(root, "package.json"));
const esbuild = require(join(root, "node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild"));
await esbuild.build({
  entryPoints: [join(here, "../lab.tsx")],
  outfile: join(here, "../lab.js"),
  bundle: true, format: "esm", platform: "browser", target: "es2022", jsx: "automatic",
  absWorkingDir: root,
  nodePaths: [join(root, "node_modules"), process.env.EXTRA_NODE_PATH].filter(Boolean),
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});

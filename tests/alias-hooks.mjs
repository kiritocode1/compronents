// Lets `node --test` resolve the `@/` path alias that tsconfig maps to `src/`,
// so tests can import app modules directly instead of re-parsing them as text.
//
//   node --import ./tests/alias-hooks.mjs --test tests/*.test.mjs

import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src");

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
    const path = resolve(SRC, specifier.slice(2));
    const url = pathToFileURL(path).href;
    // the alias is written without an extension; app code is all .ts/.tsx
    for (const candidate of [url, `${url}.ts`, `${url}.tsx`]) {
      try {
        return nextResolve(candidate, context);
      } catch {}
    }
    return nextResolve(specifier, context);
  },
});

// App modules import each other without a file extension. Node's loader
// will not guess `.ts`, so a test that imports one of those modules needs
// the same guess the `@/` branch makes. Leave node_modules alone: handing
// a file URL back to a CommonJS require breaks packages that omit the
// extension on purpose.
registerHooks({
  resolve(specifier, context, nextResolve) {
    const parent = context.parentURL;
    if (
      !parent?.startsWith("file:") ||
      !fileURLToPath(parent).startsWith(SRC + sep) ||
      !specifier.startsWith(".") ||
      extname(specifier)
    ) {
      return nextResolve(specifier, context);
    }
    const base = resolve(dirname(fileURLToPath(parent)), specifier);
    for (const ext of [".ts", ".tsx", ".js", ".mjs"]) {
      if (!existsSync(base + ext)) continue;
      return nextResolve(pathToFileURL(base + ext).href, context);
    }
    return nextResolve(specifier, context);
  },
});

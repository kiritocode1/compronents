// Lets `node --test` resolve the `@/` path alias that tsconfig maps to `src/`,
// so tests can import app modules directly instead of re-parsing them as text.
//
//   node --import ./tests/alias-hooks.mjs --test tests/*.test.mjs

import { registerHooks } from "node:module";
import { dirname, resolve } from "node:path";
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

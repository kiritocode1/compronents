// Shared helpers for the registry tests. Loads the single source of truth
// (src/lib/registry.ts) and the import-analysis primitives both tests use.
//
// registry.ts has no imports, so Node's built-in type stripping imports it
// directly. No test framework, no build step.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const registry = await import(path.join(repoRoot, "src/lib/registry.ts"));

export const registryItems = registry.registryItems;

/** Packages shadcn assumes every consumer project already has. */
export const PEER_DEPS = new Set([
  "react",
  "react-dom",
  "react/jsx-runtime",
  "next",
]);

/** File types the shadcn registry-item schema accepts. */
export const FILE_TYPES = new Set([
  "registry:ui",
  "registry:component",
  "registry:hook",
  "registry:lib",
  "registry:page",
  "registry:file",
]);

const RESOLVE_EXTS = [
  "",
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
  "/index.tsx",
  "/index.ts",
  "/index.jsx",
  "/index.js",
];

/** npm package name for a bare import specifier (`gsap/ScrollTrigger` -> `gsap`). */
export function packageOf(spec) {
  if (spec.startsWith("@")) {
    const [scope, name = ""] = spec.split("/");
    return `${scope}/${name.split("@")[0]}`;
  }
  return spec.split("/")[0].split("@")[0];
}

/** Every module specifier imported/exported-from in a source string. */
export function importSpecifiers(src) {
  const out = [];
  for (const m of src.matchAll(
    /(?:import|export)[^;]*?from\s*["']([^"']+)["']/g,
  )) {
    out.push(m[1]);
  }
  for (const m of src.matchAll(/import\s*["']([^"']+)["']/g)) {
    out.push(m[1]);
  }
  return out;
}

/**
 * Classify every import in one shipped file as an install problem or not.
 * `shippedPaths` is the set of repo-relative paths this item ships.
 * Returns an array of human-readable problem strings (empty = clean).
 */
export function analyzeFile(filePath, src, shippedPaths, dependencies) {
  const problems = [];
  const dir = path.posix.dirname(filePath.replace(/\\/g, "/"));
  const deps = new Set((dependencies ?? []).map(packageOf));

  for (const spec of importSpecifiers(src)) {
    if (spec.startsWith(".")) {
      // Relative import: the target must be shipped by this same item, or the
      // installed component copies a broken import.
      const base = path.posix.normalize(path.posix.join(dir, spec));
      const resolved = RESOLVE_EXTS.some((ext) => shippedPaths.has(base + ext));
      if (!resolved) {
        problems.push(
          `imports "${spec}" which is not shipped by this item (resolved ${base})`,
        );
      }
    } else if (spec.startsWith("@/")) {
      // Alias imports don't exist in a consumer project unless declared as a
      // registry dependency. None of the current items use them.
      problems.push(
        `imports alias "${spec}" which will not resolve after install`,
      );
    } else {
      const pkg = packageOf(spec);
      if (!PEER_DEPS.has(pkg) && !deps.has(pkg)) {
        problems.push(
          `imports "${spec}" but package "${pkg}" is missing from dependencies`,
        );
      }
    }
  }
  return problems;
}

export function readFile(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

export function exists(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

// --- Portrayal helpers -----------------------------------------------------
// Extract scalar values so we can prove the panel/preview you SEE renders the
// same registry component, with the same values, as the demo whose code we
// SHOW. Only scalar literals (string/number/boolean) are compared — arrays and
// objects (images, data) are intentionally out of scope.

const SCALAR = String.raw`"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|-?[\d.]+|true|false`;
const unquote = (v) => v.replace(/^["']|["']$/g, "");

function readItemFile(relPath) {
  return exists(relPath) ? readFile(relPath) : null;
}

/** Default scalar prop values from a registry component's destructured params. */
export function registryDefaults(name) {
  for (const rel of [`src/registry/${name}.tsx`, `src/registry/${name}/index.tsx`]) {
    const src = readItemFile(rel);
    if (!src) continue;
    const out = {};
    for (const m of src.matchAll(
      new RegExp(String.raw`^\s+(\w+)\s*=\s*(${SCALAR})\s*,`, "gm"),
    )) {
      out[m[1]] = unquote(m[2]);
    }
    return out;
  }
  return {};
}

/**
 * Scalar props passed on the `<Component .../>` tag of a wrapper file that
 * renders `@/registry/<name>`. Returns null if the file doesn't render it.
 */
export function wrapperProps(relPath) {
  const src = readItemFile(relPath);
  if (src === null) return null;
  const imported = src.match(
    /import\s+(\w+)[^;]*?from\s*["']@\/registry\//,
  );
  if (!imported) return null;
  const tag = src.match(new RegExp(`<${imported[1]}\\b([\\s\\S]*?)\\/?>`));
  if (!tag) return {};
  const out = {};
  for (const a of tag[1].matchAll(
    new RegExp(String.raw`(\w+)=\{?(${SCALAR})\}?`, "g"),
  )) {
    out[a[1]] = unquote(a[2]);
  }
  return out;
}

/** Scalar entries of a studio's first PRESETS entry (its at-rest state). */
export function studioDefaults(relPath) {
  const src = readItemFile(relPath);
  if (src === null) return null;
  const arr =
    src.match(/PRESETS[^=]*=\s*\[([\s\S]*?)\]\s*as const/) ??
    src.match(/PRESETS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!arr) return null;
  const first = arr[1].match(/\{([\s\S]*?)\}/);
  if (!first) return {};
  const out = {};
  for (const e of first[1].matchAll(
    new RegExp(String.raw`(\w+):\s*(${SCALAR})`, "g"),
  )) {
    out[e[1]] = unquote(e[2]);
  }
  return out;
}

/**
 * Props excluded from the "renders what we show" comparison: identity/routing
 * props, and `embedded`, the one legitimate bounded-vs-fullscreen mode switch.
 */
export const PORTRAYAL_IGNORED_PROPS = new Set([
  "key",
  "src",
  "initialPath",
  "assetBase",
  "embedded",
]);

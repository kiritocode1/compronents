// One-off: scope the Juan Mora Webflow export CSS under .juan-mora-page and emit
// src/registry/juan-mora-page/styles.ts. Verbatim rules, only selectors prefixed
// and relative asset urls swapped for the runtime asset base.
import { readFileSync, writeFileSync } from "node:fs";

const SRC =
  "/private/tmp/claude-501/-Users-blank-Desktop-CREATE-compronents/603f7c64-0db7-441a-8ef3-06db10b66b1b/scratchpad/jm/css";
const ROOT = "juan-mora-page";
const FILES = [
  "normalize.css",
  "webflow.css",
  "juan-portfolio-2026.webflow.css",
];

const raw = FILES.map((f) => readFileSync(`${SRC}/${f}`, "utf8")).join("\n\n");
const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");

// brace/string/paren-aware split into top-level constructs
function splitBlocks(input) {
  const blocks = [];
  let depth = 0;
  let buf = "";
  let str = null;
  let paren = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    buf += ch;
    if (str) {
      if (ch === str && input[i - 1] !== "\\") str = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      str = ch;
      continue;
    }
    if (ch === "(") paren++;
    else if (ch === ")") paren = Math.max(0, paren - 1);
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        blocks.push(buf.trim());
        buf = "";
      }
    } else if (ch === ";" && depth === 0 && paren === 0) {
      blocks.push(buf.trim());
      buf = "";
    }
  }
  if (buf.trim()) blocks.push(buf.trim());
  return blocks.filter(Boolean);
}

// html/body carry the page's own background + type, so they collapse onto the root
function prefixSelectorList(selectors) {
  return selectors
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (/^(html|body|:root)$/i.test(s)) return `.${ROOT}`;
      if (/^(html|body)\s+/i.test(s))
        return `.${ROOT} ${s.replace(/^(html|body)\s+/i, "")}`;
      if (s === "*") return `.${ROOT} *`;
      if (/^\*\s/.test(s)) return `.${ROOT} ${s}`;
      // pseudo-elements on the page itself (::selection etc.)
      if (/^(::|:)/.test(s)) return `.${ROOT}${s}`;
      return `.${ROOT} ${s}`;
    })
    .join(",\n");
}

function transformBlock(block) {
  if (!block.includes("{")) {
    if (/^@(import|charset)/i.test(block)) return { hoist: block };
    return { drop: true };
  }
  const braceIndex = block.indexOf("{");
  const prelude = block.slice(0, braceIndex).trim();
  const body = block.slice(braceIndex + 1, block.lastIndexOf("}"));

  if (prelude.startsWith("@")) {
    if (
      /^@(font-face|keyframes|-webkit-keyframes|page|property)/i.test(prelude)
    )
      return { hoist: block };
    if (/^@(media|supports|layer|container)/i.test(prelude)) {
      const inner = splitBlocks(body)
        .map(transformBlock)
        .map((r) => r.scoped || r.hoist || "")
        .filter(Boolean)
        .join("\n");
      return { scoped: `${prelude} {\n${inner}\n}` };
    }
    return { hoist: block };
  }
  return { scoped: `${prefixSelectorList(prelude)} {${body}}` };
}

const blocks = splitBlocks(css).map(transformBlock);
const imports = blocks
  .filter((b) => b.hoist && /^@(import|charset)/i.test(b.hoist))
  .map((b) => b.hoist);
const atRules = blocks
  .filter((b) => b.hoist && !/^@(import|charset)/i.test(b.hoist))
  .map((b) => b.hoist);
const scoped = blocks.filter((b) => b.scoped).map((b) => b.scoped);

// the export ships a `visibility:hidden` gate that only lifts once Webflow's own
// IX3 runtime adds .w-mod-ix3; the React port drives the same reveals in GSAP,
// so that rule must not survive or the page renders blank.
const STRUCTURAL = `
.${ROOT}{position:relative;isolation:isolate;overflow-x:clip;width:100%;}
.${ROOT} .main{overflow:visible;}
`.trim();

let out = [...imports, ...atRules, ...scoped, STRUCTURAL].join("\n");

// relative export paths -> runtime asset base
out = out.replace(
  /url\((['"]?)\.\.\/(images|fonts)\//g,
  "url($1__ASSET_BASE__/$2/",
);

const ts = `// Generated from the Juan Mora Webflow export (normalize + webflow + site CSS).
// Every rule is verbatim; only selectors are scoped under .${ROOT} and relative
// asset urls are rewritten to the runtime asset base.
export function getJuanMoraPageStyles(assetBase: string): string {
  return ${JSON.stringify(out)}.replaceAll("__ASSET_BASE__", assetBase);
}
`;

writeFileSync(
  new URL("../src/registry/juan-mora-page/styles.ts", import.meta.url),
  ts,
);
console.log(
  "scoped rules:",
  scoped.length,
  "at-rules:",
  atRules.length,
  "bytes:",
  out.length,
);

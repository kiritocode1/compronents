// Reusable: concatenate CSS files and scope every rule under a root class so a
// ported full-page template can be injected via <style> without leaking globals.
// Usage: node scripts/scope-css.mjs <rootClass> <file1> <file2> ...
import { readFileSync } from "node:fs";

const [, , rootClass, ...files] = process.argv;
if (!rootClass || !files.length) {
  console.error("usage: scope-css.mjs <rootClass> <file...>");
  process.exit(1);
}

const raw = files.map((f) => readFileSync(f, "utf8")).join("\n\n");

// strip /* */ comments (harmless, shrinks output)
const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");

// tokenize into top-level constructs (at-rules + style rules), brace-aware
function splitBlocks(input) {
  const blocks = [];
  let depth = 0;
  let buf = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    buf += ch;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        blocks.push(buf.trim());
        buf = "";
      }
    } else if (ch === ";" && depth === 0) {
      // top-level statement like @import ...;
      blocks.push(buf.trim());
      buf = "";
    }
  }
  if (buf.trim()) blocks.push(buf.trim());
  return blocks.filter(Boolean);
}

function prefixSelectorList(selectors) {
  return selectors
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      if (/^(html|body|:root)$/i.test(s)) return `.${rootClass}`;
      if (s === "*") return `.${rootClass} *`;
      return `.${rootClass} ${s}`;
    })
    .join(",\n");
}

function transformBlock(block) {
  // statements (no braces): @import, @charset -> hoist
  if (!block.includes("{")) {
    if (/^@(import|charset)/i.test(block)) return { hoist: block };
    return { drop: true };
  }

  const braceIndex = block.indexOf("{");
  const prelude = block.slice(0, braceIndex).trim();
  const body = block.slice(braceIndex + 1, block.lastIndexOf("}"));

  // at-rules
  if (prelude.startsWith("@")) {
    if (/^@(font-face|keyframes|-webkit-keyframes|page|property)/i.test(prelude)) {
      return { hoist: block }; // keep global as-is
    }
    if (/^@(media|supports|layer|container)/i.test(prelude)) {
      // recurse: prefix inner rules, keep at-rule wrapper
      const inner = splitBlocks(body)
        .map(transformBlock)
        .map((r) => r.scoped || r.hoist || "")
        .filter(Boolean)
        .join("\n");
      return { scoped: `${prelude} {\n${inner}\n}` };
    }
    return { hoist: block };
  }

  // drop global view-transition pseudo rules (transitions emulated in JS)
  if (/::view-transition/i.test(prelude)) return { drop: true };

  return { scoped: `${prefixSelectorList(prelude)} {${body}}` };
}

const blocks = splitBlocks(css).map(transformBlock);
const imports = blocks.filter((b) => b.hoist && /^@(import|charset)/i.test(b.hoist)).map((b) => b.hoist);
const fonts = blocks.filter((b) => b.hoist && !/^@(import|charset)/i.test(b.hoist)).map((b) => b.hoist);
const scoped = blocks.filter((b) => b.scoped).map((b) => b.scoped);

const out = [
  ...imports,
  "@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Host+Grotesk:wght@300;400;450;500;600;700;800&display=swap');",
  `.${rootClass}{--font-host-grotesk:"Host Grotesk";--font-dm-mono:"DM Mono";position:relative;isolation:isolate;}`,
  ...fonts,
  ...scoped,
].join("\n");

process.stdout.write(out);

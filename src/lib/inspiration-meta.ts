/**
 * Facets, category defaults, and query expansion for inspiration retrieval.
 *
 * Every link gets per-link facets via deriveLinkFacets() (title, description,
 * host). CATEGORY_DEFAULTS fill gaps. Explicit kind/stack/useFor on the link
 * object always win as overrides. recommend + BM25 both read resolveFacets().
 */

import type { InspirationKind, InspirationLink } from "./inspiration.ts";

export interface InspirationFacets {
  kind: InspirationKind[];
  stack: string[];
  useFor: string[];
}

/** Category-level defaults. Per-link kind/stack/useFor override or extend these. */
export const CATEGORY_DEFAULTS: Record<string, InspirationFacets> = {
  React: {
    kind: ["library", "essay"],
    stack: ["react"],
    useFor: ["react libraries", "react data fetching", "react routing"],
  },
  "React Native and mobile": {
    kind: ["library", "essay"],
    stack: ["react-native", "mobile"],
    useFor: ["react native", "mobile app", "native animation"],
  },
  "JavaScript and TypeScript": {
    kind: ["library", "essay"],
    stack: ["javascript", "typescript"],
    useFor: ["typescript", "javascript utilities"],
  },
  "Web platform, CSS and performance": {
    kind: ["essay", "tool"],
    stack: ["css", "browser"],
    useFor: ["css performance", "browser internals", "web performance"],
  },
  "Frontend architecture and patterns": {
    kind: ["essay", "tool"],
    stack: ["frontend"],
    useFor: ["frontend architecture", "design patterns", "state management"],
  },
  Icons: {
    kind: ["library", "asset"],
    stack: ["svg", "icons"],
    useFor: ["icon pack", "static icons", "svg icons", "icon set"],
  },
  "Animated icon libraries": {
    kind: ["library"],
    stack: ["icons", "motion"],
    useFor: [
      "animated icons",
      "icon animation",
      "motion icons",
      "lottie icons",
      "hover icons",
    ],
  },
  "UI kit directories": {
    kind: ["directory", "library"],
    stack: ["react", "ui"],
    useFor: [
      "ui kit",
      "component library",
      "shadcn style",
      "design system components",
    ],
  },
  "Component libraries and blocks": {
    kind: ["library"],
    stack: ["react", "ui"],
    useFor: [
      "react components",
      "ui blocks",
      "copy paste components",
      "marketing components",
    ],
  },
  "Component demos and micro-interactions": {
    kind: ["demo"],
    stack: ["react", "css", "motion"],
    useFor: [
      "micro interaction",
      "interaction demo",
      "ui technique",
      "animation demo",
    ],
  },
  "Interface design guidelines and craft": {
    kind: ["essay"],
    stack: ["design"],
    useFor: ["design craft", "ui guidelines", "interface writing", "ux craft"],
  },
  "Design inspiration galleries": {
    kind: ["gallery"],
    stack: ["design"],
    useFor: [
      "site inspiration",
      "landing page inspiration",
      "web design gallery",
      "ui screenshots",
      "product ui reference",
      "saas design",
    ],
  },
  "Portfolios and studios": {
    kind: ["portfolio"],
    stack: ["design"],
    // Keep role-specific phrases on per-link tags only. Putting
    // "motion designer portfolio" here made every studio match that query.
    useFor: ["studio portfolio", "studio site", "portfolio of"],
  },
  "Color, gradients and palettes": {
    kind: ["tool", "asset"],
    stack: ["color"],
    useFor: ["color palette", "gradients", "theme colors"],
  },
  "CSS and shape generators": {
    kind: ["tool"],
    stack: ["css"],
    useFor: ["css generator", "shape css", "glassmorphism", "neumorphism"],
  },
  "Illustration and visual assets": {
    kind: ["asset"],
    stack: ["illustration"],
    useFor: ["illustration", "svg assets", "brand logos svg"],
  },
  "Typography tools": {
    kind: ["tool"],
    stack: ["typography"],
    useFor: ["font pairing", "type scale", "typography tool"],
  },
  "Type foundries and directories": {
    kind: ["directory", "asset"],
    stack: ["typography"],
    useFor: ["type foundry", "font licensing", "premium fonts"],
  },
  "Free typefaces": {
    kind: ["asset"],
    stack: ["typography"],
    useFor: ["free fonts", "free typeface", "self host font"],
  },
  "Branding and logo archives": {
    kind: ["gallery", "asset"],
    stack: ["branding"],
    useFor: ["logo inspiration", "brand identity", "logo archive", "rebrand"],
  },
  "Design essays and culture": {
    kind: ["essay"],
    stack: ["design"],
    useFor: ["design culture", "design essay"],
  },
  "Animation and motion": {
    kind: ["library", "essay"],
    stack: ["motion", "react"],
    useFor: [
      "animation library",
      "react animation",
      "page transition",
      "motion design",
      "spring animation",
    ],
  },
  "WebGL, shaders and creative coding": {
    kind: ["library", "demo", "essay"],
    stack: ["webgl", "shaders"],
    useFor: ["webgl", "shaders", "three.js", "creative coding", "gpu effects"],
  },
  "Audio, video and media": {
    kind: ["library", "tool"],
    stack: ["audio", "video"],
    useFor: ["audio library", "video player", "media pipeline"],
  },
  "LLMs and AI engineering": {
    kind: ["essay", "tool"],
    stack: ["llm", "ai"],
    useFor: [
      "llm architecture",
      "how transformers work",
      "language models",
      "prompt engineering",
      "ai engineering",
    ],
  },
  "Machine learning and deep learning": {
    kind: ["essay", "course"],
    stack: ["ml"],
    useFor: ["machine learning", "deep learning", "neural nets"],
  },
  "AI tools, agents and search": {
    kind: ["tool"],
    stack: ["ai", "agents"],
    useFor: ["ai tools", "coding agents", "ai search"],
  },
  "AI agent platforms and infrastructure": {
    kind: ["library", "tool"],
    stack: ["ai", "agents"],
    useFor: ["agent platform", "agent infra", "mcp", "tool calling"],
  },
  "Backend engineering": {
    kind: ["essay", "library"],
    stack: ["backend"],
    useFor: ["backend patterns", "api design", "server architecture"],
  },
  "Databases and storage": {
    kind: ["tool", "essay"],
    stack: ["database"],
    useFor: ["database", "storage", "postgres", "orm"],
  },
  "Infrastructure, observability and runtimes": {
    kind: ["tool", "essay"],
    stack: ["infra"],
    useFor: [
      "observability",
      "containers",
      "runtime",
      "deploy",
      "vercel containers",
    ],
  },
  "Distributed systems and computer science": {
    kind: ["essay"],
    stack: ["systems"],
    useFor: ["distributed systems", "computer science fundamentals"],
  },
  "Books and fundamentals": {
    kind: ["essay"],
    stack: [],
    useFor: ["programming books", "fundamentals"],
  },
  "Courses and learning paths": {
    kind: ["course"],
    stack: [],
    useFor: ["course", "learning path", "tutorial series"],
  },
  "Coding challenges and practice": {
    kind: ["tool"],
    stack: [],
    useFor: ["coding practice", "leetcode style"],
  },
  "Developer tools and utilities": {
    kind: ["tool"],
    stack: [],
    useFor: ["developer tools", "cli", "devtools"],
  },
  "Productivity and business tools": {
    kind: ["tool"],
    stack: [],
    useFor: ["productivity", "business tools"],
  },
  "File sharing and conversion tools": {
    kind: ["tool"],
    stack: [],
    useFor: ["file conversion", "file sharing", "image convert"],
  },
  "ASCII art and diagram tools": {
    kind: ["tool"],
    stack: [],
    useFor: ["diagrams", "ascii art", "architecture diagrams"],
  },
  "Marketing and growth tools": {
    kind: ["tool"],
    stack: [],
    useFor: ["marketing tools", "growth"],
  },
  "Effect ecosystem": {
    kind: ["library", "essay"],
    stack: ["effect", "typescript"],
    useFor: ["effect-ts", "effect library", "typed errors"],
  },
  "Docs, slides and content tools": {
    kind: ["tool"],
    stack: [],
    useFor: ["docs tools", "slides", "content"],
  },
  "Personal blogs and sites": {
    kind: ["essay", "portfolio"],
    stack: [],
    useFor: ["personal blog", "engineering blog"],
  },
  "Developer profiles and socials": {
    kind: ["directory"],
    stack: [],
    useFor: ["developer profile", "follow engineers"],
  },
  "Engineering essays and culture": {
    kind: ["essay"],
    stack: [],
    useFor: ["engineering culture", "engineering essay"],
  },
  "YouTube channels": {
    kind: ["video"],
    stack: [],
    useFor: ["youtube channel", "video learning"],
  },
  "Talks and individual videos": {
    kind: ["video"],
    stack: [],
    useFor: ["conference talk", "tech talk"],
  },
  "Self-hosted software": {
    kind: ["tool"],
    stack: ["self-host"],
    useFor: ["self hosted", "self-host software"],
  },
  "Mockups, textures and patterns": {
    kind: ["asset"],
    stack: ["design"],
    useFor: ["mockups", "textures", "patterns", "background textures"],
  },
  "Agent skills directories": {
    kind: ["skill", "directory"],
    stack: ["agents"],
    useFor: ["agent skills", "claude skills", "skills.sh"],
  },
  "VPS and hosting videos": {
    kind: ["video"],
    stack: ["infra"],
    useFor: ["vps comparison", "hosting provider"],
  },
};

/**
 * Synonym groups. Any term maps to the whole group (minus itself) for expansion.
 * Keep tight: noisy synonyms flood BM25 with junk.
 */
const SYNONYM_GROUPS: string[][] = [
  ["animation", "motion", "animate", "micro-interaction", "microinteraction"],
  ["icon", "icons", "glyph", "glyphs"],
  ["font", "typeface", "typography", "typefaces", "fonts"],
  ["library", "libraries", "package", "component library"],
  ["gallery", "inspiration", "showcase", "collection", "directory of sites"],
  ["portfolio", "studio", "designer site", "personal site work"],
  ["llm", "language model", "transformer", "large language model"],
  ["color", "palette", "colours", "colours palette"],
  ["webgl", "three.js", "threejs", "shader", "shaders"],
  ["database", "db", "postgres", "sql", "storage"],
  ["agent", "agents", "coding agent", "ai agent"],
  ["deploy", "hosting", "deployment", "runtime"],
  ["container", "containers", "docker"],
  ["logo", "wordmark", "brand mark", "logotype"],
  ["react", "reactjs"],
  ["next", "nextjs", "next.js"],
  ["css", "stylesheet"],
  ["essay", "article", "write-up", "writeup", "guide"],
  ["tool", "utility", "cli"],
  ["saas", "product ui", "b2b ui", "app ui"],
];

/**
 * Whole-phrase rewrites for vibe / brand-shaped asks that BM25 alone butchers.
 * Applied as extra query variants, not replacements.
 */
const PHRASE_EXPANSIONS: { match: RegExp; queries: string[] }[] = [
  {
    match: /\blinear\b/i,
    queries: [
      "product ui design gallery",
      "saas interface inspiration",
      "issue tracker design",
      "dense product design",
      "project management ui",
    ],
  },
  {
    match: /\b(vibe\s*cod\w*|ai\s*slop|generic\s*ai\s*ui)\b/i,
    queries: [
      "interface design craft guidelines",
      "design craft essay",
      "polished product ui",
      "anti generic ui",
    ],
  },
  {
    match: /\b(like\s+apple|apple[\s-]?like|liquid\s*glass)\b/i,
    queries: [
      "apple inspired interface",
      "motion design portfolio",
      "polished product design",
      "ios design craft",
    ],
  },
  {
    match: /\b(favicon)\b/i,
    queries: ["animated favicon", "favicon generator", "tab icon"],
  },
  {
    match: /\b(motion\s+design(er)?|motion\s+engineer)\b/i,
    queries: [
      "motion designer portfolio",
      "motion design studio",
      "animation portfolio",
    ],
  },
  {
    match: /\b(ui\s+librar|component\s+librar|component\s+kit)\b/i,
    queries: [
      "react component library",
      "ui kit shadcn",
      "copy paste components",
    ],
  },
  {
    match: /\b(animated?\s+icons?|icon\s+animat)/i,
    queries: [
      "animated icons library",
      "lottie icons",
      "motion icons react",
      "icon hover animation",
    ],
  },
  {
    match: /\b(logo\s+(design|inspo|inspiration|archive|reference))\b/i,
    queries: [
      "logo archive",
      "logo inspiration library",
      "brand identity archive",
    ],
  },
];

/** Stopwords stripped from recommend queries before expansion. */
const QUERY_FLUFF = new Set(
  "a an the good great best nice cool awesome some something any my me i want need looking for find get show me please really very more most useful helpful resources stuff things like from your second brain directory catalog wall".split(
    " ",
  ),
);

const EMPTY_FACETS: InspirationFacets = { kind: [], stack: [], useFor: [] };

/** Known stack tokens scanned in title/description/href. */
const STACK_PATTERNS: { re: RegExp; tag: string }[] = [
  { re: /\breact native\b/, tag: "react-native" },
  { re: /\breact\b/, tag: "react" },
  { re: /\bnext\.?js\b|\bnextjs\b/, tag: "next" },
  { re: /\bvue\b/, tag: "vue" },
  { re: /\bsvelte\b/, tag: "svelte" },
  { re: /\bsolid\b/, tag: "solid" },
  { re: /\bangular\b/, tag: "angular" },
  { re: /\btypescript\b|\bts\b/, tag: "typescript" },
  { re: /\bjavascript\b|\bjs\b/, tag: "javascript" },
  { re: /\btailwind\b/, tag: "tailwind" },
  { re: /\bcss\b/, tag: "css" },
  { re: /\bframer motion\b|\bmotion\.dev\b|\bmotion\b/, tag: "motion" },
  { re: /\bgsap\b/, tag: "gsap" },
  { re: /\bthree\.?js\b|\br3f\b|\breact three\b/, tag: "three" },
  { re: /\bwebgl\b/, tag: "webgl" },
  { re: /\bshader|glsl\b/, tag: "shaders" },
  { re: /\blottie\b/, tag: "lottie" },
  { re: /\bsvg\b/, tag: "svg" },
  { re: /\bpostgres|postgresql\b/, tag: "postgres" },
  { re: /\bsqlite\b/, tag: "sqlite" },
  { re: /\bredis\b/, tag: "redis" },
  { re: /\beffect-?ts\b|\beffect\b/, tag: "effect" },
  { re: /\brust\b/, tag: "rust" },
  { re: /\bpython\b/, tag: "python" },
  { re: /\bgo\b|\bgolang\b/, tag: "go" },
  { re: /\bios\b|\bswift\b/, tag: "ios" },
  { re: /\bandroid\b/, tag: "android" },
  { re: /\belectron\b/, tag: "electron" },
  { re: /\bnode\.?js\b|\bnodejs\b/, tag: "node" },
  { re: /\bshadcn\b/, tag: "shadcn" },
  { re: /\bradix\b/, tag: "radix" },
  { re: /\bfigma\b/, tag: "figma" },
  { re: /\bllm\b|\bopenai\b|\banthropic\b|\bclaude\b/, tag: "llm" },
  { re: /\bmcp\b/, tag: "mcp" },
  { re: /\bdocker\b|\bcontainer/, tag: "containers" },
  { re: /\bvercel\b/, tag: "vercel" },
  { re: /\baws\b/, tag: "aws" },
  { re: /\bkubernetes\b|\bk8s\b/, tag: "kubernetes" },
];

const KIND_RULES: { re: RegExp; kind: InspirationKind }[] = [
  {
    re: /\bportfolio of\b|\bpersonal (site|portfolio)\b|\bstudio of\b/,
    kind: "portfolio",
  },
  {
    re: /\byoutube\b|\bwatch\b|\btalk\b|\bvideo\b|\bconference\b/,
    kind: "video",
  },
  { re: /\bcourse\b|\blearning path\b|\btutorial series\b/, kind: "course" },
  { re: /\bskill\b|\bagent skill\b|skills\.sh/, kind: "skill" },
  {
    re: /\bessay\b|\barticle\b|\bwrite-?up\b|\bguide\b|\binterview\b|\bpost\b|\bnewsletter\b/,
    kind: "essay",
  },
  {
    re: /\bgallery\b|\bcurated (list|collection|archive)\b|\binspiration (gallery|directory)\b|\barchive of\b/,
    kind: "gallery",
  },
  {
    re: /\bgenerator\b|\bconverter\b|\bcli\b|\btool\b|\butility\b|\bplayground\b/,
    kind: "tool",
  },
  {
    re: /\bdemo\b|\blab\b|\bexperiment\b|\bmicro-?interaction\b/,
    kind: "demo",
  },
  {
    re: /\bdirectory\b|\bcatalog\b|\bindex of\b|\bawesome list\b|\bregistry of\b/,
    kind: "directory",
  },
  {
    re: /\bfont\b|\btypeface\b|\bicon (set|pack)\b|\billustration\b|\bmockup\b|\btexture\b|\basset\b/,
    kind: "asset",
  },
  {
    re: /\blibrary\b|\bcomponent(s)?\b|\bpackage\b|\bnpm\b|\bkit\b|\bsdk\b|\bframework\b/,
    kind: "library",
  },
];

/**
 * Content-derived facets unique to this link (title, description, host).
 * Always runs; explicit link fields override via resolveFacets.
 */
export function deriveLinkFacets(
  category: string,
  link: InspirationLink,
): InspirationFacets {
  const blob =
    `${link.title}\n${link.description ?? ""}\n${link.href}`.toLowerCase();
  return {
    kind: deriveKind(blob, category),
    stack: deriveStack(blob),
    useFor: deriveUseFor(link, category),
  };
}

function deriveKind(blob: string, category: string): InspirationKind[] {
  const found: InspirationKind[] = [];
  for (const rule of KIND_RULES) {
    if (rule.re.test(blob) && !found.includes(rule.kind)) {
      found.push(rule.kind);
    }
    if (found.length >= 2) break;
  }
  if (found.length) return found;

  // Fall back to first category default kind only (not the whole list).
  const base = CATEGORY_DEFAULTS[category]?.kind ?? [];
  return base.slice(0, 1);
}

function deriveStack(blob: string): string[] {
  const tags: string[] = [];
  for (const { re, tag } of STACK_PATTERNS) {
    if (re.test(blob) && !tags.includes(tag)) tags.push(tag);
    if (tags.length >= 8) break;
  }
  return tags;
}

function deriveUseFor(link: InspirationLink, category: string): string[] {
  const phrases: string[] = [];
  const title = link.title.trim();
  const titleLower = title.toLowerCase();

  // 1. Full title (strongest unique key).
  if (titleLower.length >= 2) phrases.push(titleLower);

  // 2. Title without parenthetical / colon suffix noise.
  const bare = titleLower
    .replace(/\s*[(（].*?[)）]\s*/g, " ")
    .replace(/\s*[:|–—-]\s*.+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (bare && bare !== titleLower) phrases.push(bare);

  // 3. Host (reactbits.dev, fonts.google.com).
  try {
    const host = new URL(link.href).hostname.replace(/^www\./, "");
    if (host && !host.includes("github.com") && !host.includes("youtube.com")) {
      phrases.push(host);
      const brand = host.split(".")[0];
      if (brand && brand.length > 2 && brand !== bare) phrases.push(brand);
    } else if (host.includes("github.com")) {
      const parts = new URL(link.href).pathname.split("/").filter(Boolean);
      if (parts[0] && parts[1]) phrases.push(`${parts[0]}/${parts[1]}`);
      if (parts[1]) phrases.push(parts[1].replace(/-/g, " "));
    }
  } catch {
    // ignore bad hrefs
  }

  // 4. Notable multi-word tech / product phrases from the description.
  const desc = link.description ?? "";
  const named = desc.match(
    /\b(?:[A-Z][a-zA-Z0-9.+#-]*(?:\s+[A-Z][a-zA-Z0-9.+#-]*){0,3})\b/g,
  );
  if (named) {
    for (const name of named.slice(0, 8)) {
      const n = name.trim();
      // Skip sentence starters that are just category words.
      if (n.length < 3 || n.length > 40) continue;
      if (
        /^(The|This|A|An|Its|With|From|For|Built|Made|Free|Open|Large|Simple|Popular|Home|Also|Recent|Ships|Offers|Lets|When|Every|About)$/i.test(
          n,
        )
      ) {
        continue;
      }
      phrases.push(n.toLowerCase());
    }
  }

  // 5. "for X" purpose clauses (short).
  const forMatch = desc.match(
    /\bfor\s+([a-z][a-z0-9]+(?:\s+[a-z][a-z0-9]+){0,3})/gi,
  );
  if (forMatch) {
    for (const m of forMatch.slice(0, 3)) {
      const purpose = m.replace(/^for\s+/i, "").toLowerCase();
      if (purpose.length >= 4 && purpose.length <= 40) phrases.push(purpose);
    }
  }

  // 6. Stack tags as light useFor so "react animation" hits stack-bearing links.
  const stack = deriveStack(
    `${link.title}\n${link.description ?? ""}\n${link.href}`.toLowerCase(),
  );
  for (const s of stack.slice(0, 3)) phrases.push(s);

  // 7. One category breadcrumb so category routing still has a hook.
  const catDefault = CATEGORY_DEFAULTS[category]?.useFor?.[0];
  if (catDefault) phrases.push(catDefault);

  return uniqueLower(phrases).slice(0, 10);
}

/**
 * Final facets for a link: explicit overrides > content-derived > category defaults.
 * Every link gets non-empty kind and useFor (at least the title).
 */
export function resolveFacets(
  category: string,
  link: InspirationLink,
): InspirationFacets {
  const base = CATEGORY_DEFAULTS[category] ?? EMPTY_FACETS;
  const derived = deriveLinkFacets(category, link);

  const explicitKind = normalizeList(link.kind);
  const explicitStack = link.stack ?? [];
  const explicitUseFor = link.useFor ?? [];

  const kind = explicitKind.length
    ? explicitKind
    : derived.kind.length
      ? derived.kind
      : base.kind;

  const stack = uniqueLower([
    ...base.stack,
    ...derived.stack,
    ...explicitStack,
  ]).slice(0, 12);

  // Explicit useFor first (author intent), then derived (title/host/names),
  // then a thin slice of category defaults for shared vocabulary.
  const useFor = uniqueLower([
    ...explicitUseFor,
    ...derived.useFor,
    ...base.useFor.slice(0, 2),
  ]).slice(0, 12);

  return { kind, stack, useFor };
}

function normalizeList(
  value: InspirationKind | InspirationKind[] | undefined,
): InspirationKind[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

/** Case-preserving dedupe (category titles, etc.). */
function unique(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/** Lowercased dedupe for stack/useFor tokens. */
function uniqueLower(items: string[]): string[] {
  return [
    ...new Set(items.map((item) => item.trim().toLowerCase()).filter(Boolean)),
  ];
}

/** Strip fluff words so "good ui libraries" becomes "ui libraries". */
export function cleanQuery(query: string): string {
  const tokens = query
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9+#.-]*/g)
    ?.filter((token) => !QUERY_FLUFF.has(token));
  return tokens?.join(" ") ?? query.trim();
}

/**
 * Build 2–6 query variants: cleaned original, synonym swaps, phrase expansions.
 */
export function expandQuery(query: string): string[] {
  const cleaned = cleanQuery(query);
  const variants = new Set<string>();
  if (query.trim()) variants.add(query.trim());
  if (cleaned && cleaned !== query.trim().toLowerCase()) variants.add(cleaned);

  const words = cleaned.split(/\s+/).filter(Boolean);
  for (const word of words) {
    for (const group of SYNONYM_GROUPS) {
      // Exact token match only. Substring match made "ui" hit "guide" and flood
      // every query containing "ui" with essay/article variants.
      if (!group.some((term) => term === word)) continue;
      for (const synonym of group) {
        if (synonym === word) continue;
        if (synonym.includes(" ")) {
          variants.add(synonym);
          continue;
        }
        variants.add(words.map((w) => (w === word ? synonym : w)).join(" "));
      }
    }
  }

  for (const { match, queries } of PHRASE_EXPANSIONS) {
    if (match.test(query)) {
      for (const q of queries) variants.add(q);
    }
  }

  // Cap expansion so BM25 merge stays cheap and focused.
  return [...variants].slice(0, 8);
}

/**
 * Categories the query is probably aiming at. Used as a soft boost, not a hard filter.
 */
export function inferCategoryHints(query: string): string[] {
  const q = query.toLowerCase();
  const hints: string[] = [];

  const rules: { test: RegExp; category: string; exclusive?: boolean }[] = [
    {
      // Word boundaries matter: "favicon animate" must not match icon+animat.
      test: /\banimated?\s+icons?\b|\bicons?\s+animat|\blottie\s+icons?\b/,
      category: "Animated icon libraries",
      exclusive: true,
    },
    { test: /\bicons?\b/, category: "Icons" },
    {
      test: /motion\s+design(er)?|motion\s+engineer|design\s+engineer portfolio/,
      category: "Portfolios and studios",
      exclusive: true,
    },
    { test: /portfolio|studio site/, category: "Portfolios and studios" },
    {
      test: /gallery|site inspiration|landing page inspo|dribbble|awwwards|product ui|saas (ui|design|interface)/,
      category: "Design inspiration galleries",
    },
    {
      test: /logo|wordmark|rebrand|brand identity/,
      category: "Branding and logo archives",
    },
    {
      test: /typeface|font(?!awesome)|typography|type foundry/,
      category: "Free typefaces",
    },
    {
      test: /font pair|type scale|variable font tool/,
      category: "Typography tools",
    },
    {
      test: /webgl|shader|three\.?js|r3f|creative coding/,
      category: "WebGL, shaders and creative coding",
    },
    {
      test: /\bllm\b|transformer|language model/,
      category: "LLMs and AI engineering",
    },
    {
      test: /react native|reanimated|expo/,
      category: "React Native and mobile",
    },
    {
      test: /animation library|page transition|framer motion|motion\.dev/,
      category: "Animation and motion",
    },
    {
      test: /component library|ui libraries|ui library|ui kit|shadcn|ui blocks|react components/,
      category: "Component libraries and blocks",
    },
    {
      test: /ui kit directory|component registry/,
      category: "UI kit directories",
    },
    {
      test: /micro[- ]?interaction|interaction demo|favicon/,
      category: "Component demos and micro-interactions",
    },
    {
      test: /color palette|gradient generator/,
      category: "Color, gradients and palettes",
    },
    {
      test: /container registry|observability|deploy runtime|vercel container/,
      category: "Infrastructure, observability and runtimes",
    },
    { test: /agent skill|skills\.sh/, category: "Agent skills directories" },
    { test: /effect-?ts|\beffect\b library/, category: "Effect ecosystem" },
    { test: /database|postgres|orm|sqlite/, category: "Databases and storage" },
    { test: /self[- ]?host/, category: "Self-hosted software" },
    {
      test: /mockup|texture|pattern fill/,
      category: "Mockups, textures and patterns",
    },
    {
      test: /design craft|interface guidelines|ui guidelines/,
      category: "Interface design guidelines and craft",
    },
  ];

  for (const rule of rules) {
    if (!rule.test.test(q)) continue;
    hints.push(rule.category);
    if (rule.exclusive) break;
  }
  return unique(hints);
}

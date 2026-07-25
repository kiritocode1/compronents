"use client";

/**
 * The repo window: a working editor shell rather than a screenshot of one.
 *
 * Structure follows the captured production markup exactly: a title bar with
 * terminal and search affordances, a resizable file tree, a gutter plus
 * token-highlighted source, a 1px-per-line minimap with a live viewport
 * marker, a resizable terminal, and a status bar.
 *
 * Interactive parts that are real, not decorative:
 * - folders expand on a 0fr -> 1fr grid transition with a rotating chevron
 * - the sidebar, the terminal, and the corner between them all drag-resize
 * - the minimap tracks and drives the editor scroll position
 * - the terminal runs git, ls, tree, plop, cat, help, clear
 * - Cmd/Ctrl+J toggles the terminal, Cmd/Ctrl+K opens file search
 */

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SIDEBAR_DEFAULT = 240;
const SIDEBAR_MIN = 140;
const TERMINAL_DEFAULT = 200;
const TERMINAL_MIN = 96;
/** Minimap glyph width: one source column renders as half a pixel. */
const CODE_MINIMAP_CHAR = 0.5;
const CODE_MINIMAP_WIDTH = 56;

type FileKind = "markdown" | "config" | "json" | "code";

interface RepoFile {
  type: "file";
  name: string;
  kind: FileKind;
  content: string;
}

interface RepoFolder {
  type: "folder";
  name: string;
  children: RepoNode[];
}

type RepoNode = RepoFile | RepoFolder;

const README = `# The Content Architecture

A production Next.js and Sanity foundation, committed rather than reinvented.

## Features

- Next.js 16 with App Router and Server Components
- Sanity CMS with an in-app Studio and a structure editors can navigate
- TypeScript strict, Tailwind CSS 4, and Biome
- Reusable components, page builder sections, and rich text blocks
- Draft mode with live preview, SEO helpers, and tag-based revalidation
- **Agent-native by default:** \`AGENTS.md\` and a dozen scoped skills load the
  conventions before the first prompt. Two MCP servers ship in the repo.
- **llms.txt for AI assistants:** an editable, generated \`/llms.txt\` drafted
  from your own content, owned by an editor instead of a build step.
- **Agent Markdown:** pages serve a token-light Markdown representation to
  clients sending \`Accept: text/markdown\`, on the same URL.
- Scaffolding via Plop for repeatable section and block generation
- Seed dataset of example content, imported with \`npm run seed\`

## Getting started

**New here? Start with [\`GETTING-STARTED.md\`](GETTING-STARTED.md).** It is the
guided path from a fresh clone to your first rendered section. The sections
below are the reference.

### Prerequisites

- Node.js >= 24.15.0
- npm >= 11.6.2

### Installation

\`\`\`bash
npm install
\`\`\`

### Environment variables

Create a \`.env\` file and add at least:

\`\`\`env
SANITY_API_VIEW_TOKEN=your-view-token
SANITY_API_EDIT_TOKEN=your-edit-token
SANITY_REVALIDATE_SECRET=your-revalidate-secret
RESEND_API_KEY=your-resend-api-key
RESEND_EMAIL_FROM=notifications@your-domain.com
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_API_VERSION=2026-02-19
NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH=/studio
\`\`\`

\`NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH\` is the public URL for Studio. The app
mounts Studio under \`app/sanity-studio/\`; \`next.config.ts\` rewrites the public
path to that folder.

### Development

\`\`\`bash
npm run dev
\`\`\`

- App: [http://localhost:3000](http://localhost:3000)
- Studio: \`http://localhost:3000\` + your studio base path

### Build

\`\`\`bash
npm run build
npm run start
\`\`\`

## Docs

Feature-level docs live in \`docs/\` so the root README stays light.

- Documentation hub: [\`docs/README.md\`](docs/README.md)
- Caching and revalidation: [\`docs/features/caching.md\`](docs/features/caching.md)
- Redirects: [\`docs/features/redirects.md\`](docs/features/redirects.md)
- Code generation (Plop): [\`docs/features/code-generation.md\`](docs/features/code-generation.md)
- Spam prevention: [\`docs/features/spam-prevention.md\`](docs/features/spam-prevention.md)

## Conventions

Every decision here is already made. Read \`AGENTS.md\` before changing the
architecture, build inside the conventions, and verify in a real browser.
`;

const AGENTS_MD = `# AGENTS.md

Read the scoped skills before changing the architecture. Build inside the
committed conventions. Verify in a real browser, not in your head.

## Load order

1. \`AGENTS.md\` (this file), always
2. The scoped skill for the layer you are touching
3. The version-matched framework docs, through the runtime MCP server

## Hard rules

- Queries live beside the schema they read, never inline in a component
- A section owns its schema, its query fragment, its type, and its component
- Generate sections with \`npm run plop section\`, never by hand
- No new architecture per run: if a decision is missing, propose it here first

## Verification

The browser MCP server drives a real Chrome. Screenshot the route you changed
and read the console before reporting the work as done.
`;

const PACKAGE_JSON = `{
  "name": "the-content-architecture",
  "private": true,
  "engines": {
    "node": ">=24.15.0",
    "npm": ">=11.6.2"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "check": "npm run check.types && biome check .",
    "check.types": "tsc --noEmit",
    "plop": "plop",
    "seed": "tsx scripts/seed.ts",
    "sanity:typegen": "sanity schema extract && sanity typegen generate"
  }
}`;

const MCP_JSON = `{
  "mcpServers": {
    "next-runtime": {
      "command": "npx",
      "args": ["-y", "@next/mcp"],
      "env": { "NEXT_PUBLIC_URL": "http://localhost:3000" }
    },
    "chrome": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}`;

const ENV_TS = `const REQUIRED = [
  "SANITY_API_VIEW_TOKEN",
  "SANITY_API_EDIT_TOKEN",
  "SANITY_REVALIDATE_SECRET",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);

// Fails at boot, not at the first request that needs a token.
if (missing.length > 0) {
  throw new Error("Missing env: " + missing.join(", "));
}

export const env = Object.fromEntries(
  REQUIRED.map((key) => [key, process.env[key] as string]),
);
`;

const file = (name: string, kind: FileKind, content: string): RepoFile => ({
  type: "file",
  name,
  kind,
  content,
});

const placeholder = (name: string) =>
  `// ${name}\n// Production source, included with the repository.\n// Open README.md for the captured overview.\n`;

const REPO_TREE: RepoNode[] = [
  {
    type: "folder",
    name: ".agents",
    children: [
      file(
        "schema.skill.md",
        "markdown",
        placeholder(".agents/schema.skill.md"),
      ),
      file(
        "queries.skill.md",
        "markdown",
        placeholder(".agents/queries.skill.md"),
      ),
      file(
        "sections.skill.md",
        "markdown",
        placeholder(".agents/sections.skill.md"),
      ),
    ],
  },
  {
    type: "folder",
    name: ".husky",
    children: [file("pre-commit", "config", placeholder(".husky/pre-commit"))],
  },
  {
    type: "folder",
    name: "app",
    children: [
      file("layout.tsx", "code", placeholder("app/layout.tsx")),
      file("page.tsx", "code", placeholder("app/page.tsx")),
      file("llms.txt/route.ts", "code", placeholder("app/llms.txt/route.ts")),
    ],
  },
  {
    type: "folder",
    name: "components",
    children: [
      file(
        "sections/hero.tsx",
        "code",
        placeholder("components/sections/hero.tsx"),
      ),
      file(
        "blocks/rich-text.tsx",
        "code",
        placeholder("components/blocks/rich-text.tsx"),
      ),
    ],
  },
  {
    type: "folder",
    name: "docs",
    children: [
      file("README.md", "markdown", placeholder("docs/README.md")),
      file(
        "features/caching.md",
        "markdown",
        placeholder("docs/features/caching.md"),
      ),
    ],
  },
  {
    type: "folder",
    name: "features",
    children: [
      file(
        "dom/use-breakpoint.ts",
        "code",
        placeholder("features/dom/use-breakpoint.ts"),
      ),
      file("seo/metadata.ts", "code", placeholder("features/seo/metadata.ts")),
    ],
  },
  {
    type: "folder",
    name: "sanity",
    children: [
      file("schemas/page.ts", "code", placeholder("sanity/schemas/page.ts")),
      file("queries/page.ts", "code", placeholder("sanity/queries/page.ts")),
      file("structure.ts", "code", placeholder("sanity/structure.ts")),
    ],
  },
  {
    type: "folder",
    name: "scripts",
    children: [file("seed.ts", "code", placeholder("scripts/seed.ts"))],
  },
  {
    type: "folder",
    name: "seed",
    children: [
      file(
        "production.ndjson",
        "config",
        placeholder("seed/production.ndjson"),
      ),
    ],
  },
  {
    type: "folder",
    name: "templates",
    children: [
      file("section.hbs", "config", placeholder("templates/section.hbs")),
    ],
  },
  file(".env.example", "config", placeholder(".env.example")),
  file(".gitignore", "config", placeholder(".gitignore")),
  file(".mcp.json", "json", MCP_JSON),
  file(".npmrc", "config", "engine-strict=true\n"),
  file(".nvmrc", "config", "24.15.0\n"),
  file("AGENTS.md", "markdown", AGENTS_MD),
  file("assets.d.ts", "code", placeholder("assets.d.ts")),
  file("biome.jsonc", "json", placeholder("biome.jsonc")),
  file("CLAUDE.md", "markdown", placeholder("CLAUDE.md")),
  file("env.ts", "code", ENV_TS),
  file("GETTING-STARTED.md", "markdown", placeholder("GETTING-STARTED.md")),
  file("lefthook.yml", "config", placeholder("lefthook.yml")),
  file("next-env.d.ts", "code", placeholder("next-env.d.ts")),
  file("next.config.ts", "code", placeholder("next.config.ts")),
  file("package.json", "json", PACKAGE_JSON),
  file("package-lock.json", "json", placeholder("package-lock.json")),
  file("plopfile.mjs", "code", placeholder("plopfile.mjs")),
  file("proxy.ts", "code", placeholder("proxy.ts")),
  file("README.md", "markdown", README),
  file("GET-ACCESS.md", "markdown", placeholder("GET-ACCESS.md")),
  file("sanity-schema.json", "json", placeholder("sanity-schema.json")),
  file("sanity.cli.ts", "code", placeholder("sanity.cli.ts")),
  file("sanity.config.ts", "code", placeholder("sanity.config.ts")),
  file("skills-lock.json", "json", placeholder("skills-lock.json")),
  file("tsconfig.json", "json", placeholder("tsconfig.json")),
];

function flattenFiles(nodes: RepoNode[], prefix = ""): RepoFile[] {
  return nodes.flatMap((node) =>
    node.type === "folder"
      ? flattenFiles(node.children, `${prefix}${node.name}/`)
      : [{ ...node, name: `${prefix}${node.name}` }],
  );
}

const ALL_FILES = flattenFiles(REPO_TREE);

/* ------------------------------------------------------------------ icons */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cap-tree-chevron"
      data-open={open}
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cap-tree-icon"
    >
      <path d="M2.2 5.3c0-.77.53-1.4 1.3-1.4h2.7c.4 0 .77.18 1.02.5l.5.65c.25.32.62.5 1.02.5h3.5c.77 0 1.3.63 1.3 1.4v4.5c0 .77-.53 1.4-1.3 1.4H3.5c-.77 0-1.3-.63-1.3-1.4V5.3Z" />
    </svg>
  );
}

function FileIcon({ kind }: { kind: FileKind }) {
  const common = {
    viewBox: "0 0 16 16",
    "aria-hidden": true as const,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "cap-tree-icon",
  };
  if (kind === "json") {
    return (
      <svg {...common}>
        <path d="M6.4 3.2C5 3.2 5 5.4 5 6.4c0 1-.6 1.6-1.6 1.6 1 0 1.6.6 1.6 1.6 0 1 0 3.2 1.4 3.2" />
        <path d="M9.6 3.2c1.4 0 1.4 2.2 1.4 3.2 0 1 .6 1.6 1.6 1.6-1 0-1.6.6-1.6 1.6 0 1 0 3.2-1.4 3.2" />
      </svg>
    );
  }
  if (kind === "code") {
    return (
      <svg {...common}>
        <path d="M5.8 5 3 8l2.8 3" />
        <path d="M10.2 5 13 8l-2.8 3" />
      </svg>
    );
  }
  if (kind === "config") {
    return (
      <svg {...common}>
        <path d="M2.6 4.6h10.8" />
        <path d="M2.6 8h10.8" />
        <path d="M2.6 11.4h10.8" />
        <circle cx="6" cy="4.6" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="10.4" cy="8" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="5.2" cy="11.4" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 2.6h5L12.4 6v7.4H4Z" />
      <path d="M9 2.6V6h3.4" />
    </svg>
  );
}

/* ------------------------------------------------------------ highlighting */

type Token = { text: string; tone?: string };

/**
 * Markdown tokeniser sized for the palette the source uses: headings, fenced
 * blocks, inline code, bold, links, and list bullets. Anything else stays at
 * body colour, which is what makes the highlighted lines read as a diff of
 * emphasis rather than a rainbow.
 */
function highlightMarkdown(source: string): Token[][] {
  const lines = source.split("\n");
  let inFence = false;
  return lines.map((line) => {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      return [{ text: line, tone: "fence" }];
    }
    if (inFence) return [{ text: line, tone: "fence" }];
    if (line.startsWith("#")) return [{ text: line, tone: "heading" }];

    const tokens: Token[] = [];
    let rest = line;
    const bullet = rest.match(/^(\s*)([-*])(\s)/);
    if (bullet) {
      tokens.push({ text: bullet[1] ?? "" });
      tokens.push({ text: bullet[2] ?? "-", tone: "bullet" });
      tokens.push({ text: bullet[3] ?? " " });
      rest = rest.slice(bullet[0].length);
    }

    const inline = /(\[[^\]]*\]\([^)]*\))|(`[^`]*`)|(\*\*[^*]+\*\*)/g;
    let cursor = 0;
    let match = inline.exec(rest);
    while (match) {
      if (match.index > cursor) {
        tokens.push({ text: rest.slice(cursor, match.index) });
      }
      const tone = match[1] ? "link" : match[2] ? "code" : "strong";
      tokens.push({ text: match[0], tone });
      cursor = match.index + match[0].length;
      match = inline.exec(rest);
    }
    if (cursor < rest.length) tokens.push({ text: rest.slice(cursor) });
    return tokens.length > 0 ? tokens : [{ text: "" }];
  });
}

const CODE_KEYWORDS =
  /\b(import|export|const|let|from|return|function|async|await|if|else|type|interface|new|class|true|false|null|undefined)\b/g;

function highlightCode(source: string): Token[][] {
  return source.split("\n").map((line) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
      return [{ text: line, tone: "fence" }];
    }
    const tokens: Token[] = [];
    let cursor = 0;
    const pattern = new RegExp(
      `("[^"]*"|'[^']*'|\`[^\`]*\`)|${CODE_KEYWORDS.source}`,
      "g",
    );
    let match = pattern.exec(line);
    while (match) {
      if (match.index > cursor)
        tokens.push({ text: line.slice(cursor, match.index) });
      tokens.push({ text: match[0], tone: match[1] ? "code" : "heading" });
      cursor = match.index + match[0].length;
      match = pattern.exec(line);
    }
    if (cursor < line.length) tokens.push({ text: line.slice(cursor) });
    return tokens.length > 0 ? tokens : [{ text: "" }];
  });
}

function highlight(kind: FileKind, source: string): Token[][] {
  return kind === "markdown"
    ? highlightMarkdown(source)
    : highlightCode(source);
}

/* ------------------------------------------------------------------- tree */

function TreeNode({
  node,
  depth,
  activePath,
  path,
  expanded,
  onToggle,
  onOpen,
}: {
  node: RepoNode;
  depth: number;
  activePath: string;
  path: string;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
}) {
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const indent = 10 + depth * 12;

  if (node.type === "folder") {
    const open = expanded.has(fullPath);
    return (
      <li>
        <button
          type="button"
          aria-expanded={open}
          style={{ paddingLeft: `${indent}px` }}
          className="cap-tree-row"
          onClick={() => onToggle(fullPath)}
        >
          <ChevronIcon open={open} />
          <FolderIcon />
          <span>{node.name}</span>
        </button>
        <div className="cap-tree-children" data-open={open}>
          <div>
            <ul>
              {node.children.map((child) => (
                <TreeNode
                  key={child.name}
                  node={child}
                  depth={depth + 1}
                  activePath={activePath}
                  path={fullPath}
                  expanded={expanded}
                  onToggle={onToggle}
                  onOpen={onOpen}
                />
              ))}
            </ul>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        style={{ paddingLeft: `${indent + 17}px` }}
        className="cap-tree-row"
        data-active={activePath === fullPath}
        onClick={() => onOpen(fullPath)}
      >
        <FileIcon kind={node.kind} />
        <span>{node.name}</span>
      </button>
    </li>
  );
}

/* -------------------------------------------------------------- component */

export function RepoExplorer() {
  const [activePath, setActivePath] = useState("README.md");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [terminalHeight, setTerminalHeight] = useState(TERMINAL_DEFAULT);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [viewport, setViewport] = useState({ top: 0, height: 1 });

  const shellRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLPreElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeFile = useMemo(
    () => ALL_FILES.find((entry) => entry.name === activePath) ?? ALL_FILES[0],
    [activePath],
  );
  const lines = useMemo(
    () => (activeFile ? highlight(activeFile.kind, activeFile.content) : []),
    [activeFile],
  );

  const openFile = useCallback((path: string) => {
    setActivePath(path);
    setSearchOpen(false);
    setQuery("");
    const scroller = codeRef.current;
    if (scroller) scroller.scrollTop = 0;
  }, []);

  const toggleFolder = useCallback((path: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  /* Keyboard: Cmd/Ctrl+J terminal, Cmd/Ctrl+K search, Escape closes search. */
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "j") {
        event.preventDefault();
        setTerminalOpen((open) => !open);
        return;
      }
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    // Scoped to the window, but only while the shell is on screen, so the
    // shortcuts never fight the host page when the section is scrolled away.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting)
          window.addEventListener("keydown", onKeyDown);
        else window.removeEventListener("keydown", onKeyDown);
      },
      { threshold: 0.4 },
    );
    observer.observe(shell);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  /* Minimap viewport marker follows the editor scroll. */
  const syncViewport = useCallback(() => {
    const scroller = codeRef.current;
    if (!scroller) return;
    const total = scroller.scrollHeight || 1;
    setViewport({
      top: scroller.scrollTop / total,
      height: Math.min(1, scroller.clientHeight / total),
    });
    if (gutterRef.current)
      gutterRef.current.style.transform = `translateY(${-scroller.scrollTop}px)`;
  }, []);

  useEffect(() => {
    syncViewport();
  }, [syncViewport]);

  const startResize = (
    event: ReactPointerEvent<HTMLElement>,
    axis: "x" | "y" | "both",
  ) => {
    event.preventDefault();
    const shell = shellRef.current;
    if (!shell) return;
    const bounds = shell.getBoundingClientRect();
    const onMove = (move: PointerEvent) => {
      if (axis !== "y") {
        const width = move.clientX - bounds.left;
        setSidebarWidth(
          Math.max(SIDEBAR_MIN, Math.min(bounds.width * 0.6, width)),
        );
      }
      if (axis !== "x") {
        const height = bounds.bottom - move.clientY;
        setTerminalHeight(
          Math.max(TERMINAL_MIN, Math.min(bounds.height * 0.7, height)),
        );
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const runCommand = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const input = command.trim();
    setCommand("");
    if (!input) return;
    if (input === "clear") {
      setHistory([]);
      return;
    }
    setHistory((current) => [
      ...current,
      `~ > ${input}`,
      runRepoCommand(input),
    ]);
  };

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return ALL_FILES.slice(0, 8);
    return ALL_FILES.filter((entry) =>
      entry.name.toLowerCase().includes(needle),
    ).slice(0, 8);
  }, [query]);

  return (
    <div className="cap-ide">
      <div className="cap-ide-frame" ref={shellRef}>
        <div className="cap-ide-bar">
          <span className="cap-ide-title">This is the actual repo.</span>
          <div className="cap-ide-tools">
            <button
              type="button"
              aria-label={terminalOpen ? "Hide terminal" : "Show terminal"}
              aria-pressed={terminalOpen}
              data-active={terminalOpen}
              onClick={() => setTerminalOpen((open) => !open)}
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="12" height="10" rx="1.5" />
                <path d="M4.6 6.6 6.6 8.2 4.6 9.8" strokeWidth="1.1" />
                <path d="M7.8 10h2.8" strokeWidth="1.1" />
              </svg>
              <kbd>⌘ J</kbd>
            </button>
            <button
              type="button"
              aria-label="Search files"
              onClick={() => setSearchOpen(true)}
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="7" cy="7" r="4.25" />
                <path d="M10.3 10.3 14 14" strokeWidth="1.4" />
              </svg>
              <kbd>⌘ K</kbd>
            </button>
          </div>
        </div>

        <div className="cap-ide-main">
          <aside
            className="cap-ide-sidebar"
            style={{ width: `${sidebarWidth}px` }}
          >
            <nav aria-label="File explorer">
              <ul>
                {REPO_TREE.map((node) => (
                  <TreeNode
                    key={node.name}
                    node={node}
                    depth={0}
                    path=""
                    activePath={activePath}
                    expanded={expanded}
                    onToggle={toggleFolder}
                    onOpen={openFile}
                  />
                ))}
              </ul>
            </nav>
          </aside>

          <button
            type="button"
            aria-label="Resize file explorer"
            className="cap-ide-resize-x"
            onPointerDown={(event) => startResize(event, "x")}
          >
            <span />
          </button>

          <div className="cap-ide-column">
            <div className="cap-editor">
              <div className="cap-editor-tab">{activeFile?.name}</div>
              <div className="cap-editor-body">
                <div className="cap-editor-gutter">
                  <pre ref={gutterRef} aria-hidden="true">
                    {lines.map((_, index) => `${index + 1}`).join("\n")}
                  </pre>
                </div>
                <div
                  className="cap-editor-code"
                  ref={codeRef}
                  onScroll={syncViewport}
                >
                  <pre>
                    {lines.map((tokens, index) => (
                      <div key={index} className="cap-editor-line">
                        {tokens.map((token, tokenIndex) => (
                          <span key={tokenIndex} data-tone={token.tone}>
                            {token.text}
                          </span>
                        ))}
                        {"\n"}
                      </div>
                    ))}
                  </pre>
                </div>
                <button
                  type="button"
                  aria-label="Scroll the editor"
                  className="cap-code-minimap"
                  style={{ width: `${CODE_MINIMAP_WIDTH}px` }}
                  onClick={(event) => {
                    const scroller = codeRef.current;
                    if (!scroller) return;
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const ratio = (event.clientY - bounds.top) / bounds.height;
                    scroller.scrollTop =
                      ratio * scroller.scrollHeight - scroller.clientHeight / 2;
                  }}
                >
                  {lines.map((tokens, index) => {
                    const text = tokens.map((token) => token.text).join("");
                    const indent = text.length - text.trimStart().length;
                    return (
                      <span key={index} className="cap-code-minimap-row">
                        <span
                          style={{
                            marginLeft: `${indent * CODE_MINIMAP_CHAR}px`,
                            width: `${Math.min(
                              CODE_MINIMAP_WIDTH - 8,
                              Math.max(
                                0,
                                text.trim().length * CODE_MINIMAP_CHAR,
                              ),
                            )}px`,
                          }}
                        />
                      </span>
                    );
                  })}
                  <span
                    aria-hidden="true"
                    className="cap-code-minimap-viewport"
                    style={{
                      top: `${viewport.top * 100}%`,
                      height: `${viewport.height * 100}%`,
                    }}
                  />
                </button>
              </div>
            </div>

            {terminalOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Resize terminal"
                  className="cap-ide-resize-y"
                  onPointerDown={(event) => startResize(event, "y")}
                >
                  <span />
                </button>
                <div
                  className="cap-terminal-dock"
                  style={{ height: `${terminalHeight}px` }}
                >
                  <section aria-label="Terminal" className="cap-terminal">
                    <div className="cap-terminal-title">Terminal</div>
                    <div className="cap-terminal-output">
                      <a className="cap-terminal-access" href="#cap-pricing">
                        <span>~/the-content-architecture &gt; </span>
                        <span>get-access</span>
                        <span> # €549 · one-time</span>
                      </a>
                      {history.map((entry, index) => (
                        <div key={index} className="cap-terminal-line">
                          {entry}
                        </div>
                      ))}
                      <form
                        className="cap-terminal-prompt"
                        onSubmit={(event) => event.preventDefault()}
                      >
                        <span>~/the-content-architecture-next-js &gt; </span>
                        <input
                          type="text"
                          aria-label="Terminal input"
                          spellCheck={false}
                          autoCapitalize="off"
                          autoCorrect="off"
                          autoComplete="off"
                          placeholder="try: git, ls, tree, plop, cat README.md"
                          value={command}
                          onChange={(event) => setCommand(event.target.value)}
                          onKeyDown={runCommand}
                        />
                      </form>
                    </div>
                  </section>
                </div>
              </>
            ) : null}
          </div>

          {terminalOpen ? (
            <button
              type="button"
              aria-label="Resize file explorer and terminal"
              tabIndex={-1}
              className="cap-ide-resize-corner"
              style={{
                left: `${sidebarWidth}px`,
                bottom: `${terminalHeight}px`,
              }}
              onPointerDown={(event) => startResize(event, "both")}
            />
          ) : null}

          {searchOpen ? (
            <div className="cap-ide-search">
              <input
                ref={searchInputRef}
                type="text"
                aria-label="Search files"
                placeholder="Search files"
                spellCheck={false}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && matches[0]) {
                    event.preventDefault();
                    openFile(matches[0].name);
                  }
                }}
              />
              <ul>
                {matches.map((entry) => (
                  <li key={entry.name}>
                    <button type="button" onClick={() => openFile(entry.name)}>
                      {entry.name}
                    </button>
                  </li>
                ))}
                {matches.length === 0 ? (
                  <li data-empty="true">No match</li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="cap-ide-status">
          <div>
            <span>
              <span aria-hidden="true">⎇</span>main
            </span>
            <span className="cap-ide-status-divider" />
            <span>
              <span aria-hidden="true" className="cap-ide-status-dot" />
              Updated today
            </span>
          </div>
          <button
            type="button"
            title="Show the commit graph"
            aria-label="Show the commit graph in the terminal"
            onClick={() => {
              setTerminalOpen(true);
              setHistory((current) => [
                ...current,
                "~ > git log --graph",
                COMMIT_GRAPH,
              ]);
            }}
          >
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12.5V9.5" strokeWidth="1.6" />
              <path d="M6.8 12.5V6.5" strokeWidth="1.6" />
              <path d="M9.6 12.5V8" strokeWidth="1.6" />
              <path d="M12.4 12.5V4.5" strokeWidth="1.6" />
            </svg>
            <span>81 commits</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const COMMIT_GRAPH = [
  "* 4f21ac0 (HEAD -> main) feat: agent markdown on the page route",
  "* 91c0e7b fix: revalidate the parent tag when a section moves",
  "* 2ad5f19 chore: bump studio to v6",
  "* c73e802 feat: llms.txt agent action in the site document",
].join("\n");

function runRepoCommand(input: string) {
  const [name, ...rest] = input.split(/\s+/);
  const argument = rest.join(" ");
  switch (name) {
    case "help":
      return "git  ls  tree  plop  cat <file>  get-access  clear";
    case "ls":
      return REPO_TREE.map((node) =>
        node.type === "folder" ? `${node.name}/` : node.name,
      ).join("  ");
    case "tree":
      return REPO_TREE.slice(0, 10)
        .map((node) =>
          node.type === "folder"
            ? `├── ${node.name}/\n│   └── ${node.children.length} files`
            : `├── ${node.name}`,
        )
        .join("\n");
    case "git":
      if (argument.startsWith("log")) return COMMIT_GRAPH;
      if (argument === "status")
        return "On branch main\nnothing to commit, working tree clean";
      return "usage: git <status|log>";
    case "plop":
      return "? Generator  section\n? Name       pricing-table\n  + schema, query, type, component";
    case "cat": {
      const target = ALL_FILES.find(
        (entry) => entry.name.toLowerCase() === argument.toLowerCase(),
      );
      return target
        ? target.content.split("\n").slice(0, 12).join("\n")
        : `cat: ${argument || "<file>"}: no such file`;
    }
    case "get-access":
      return "Opening the one-time license page...";
    default:
      return `command not found: ${name}`;
  }
}

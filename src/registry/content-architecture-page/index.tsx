"use client";

/**
 * Source-faithful React port of contentarchitecture.dev, captured 2026-07-23.
 *
 * Capture evidence:
 * - HTML SHA-256: 706878 bytes, 18819503f8dedb5095cb56d83852d710c2cb1379f5c440b07ed0f811bb6251b4
 * - CSS SHA-256: 74256 bytes, 52c060570a347368fa73f6dc0d3141a42fe7c0abcf2f50f2979aca5f10d257d6
 * - HAR: 72 first-party/Sanity GET resources, 12,088,503 bytes
 * - Desktop and 390px mobile geometry, menus, section states, and copy captured
 *
 * The production bundles were used as the reference, not executed here.
 * This installable component recreates their rendered page and interactions.
 */

import {
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getContentArchitecturePageStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/content-architecture-page";

export interface ContentArchitecturePageProps {
  assetBase?: string;
  className?: string;
  style?: CSSProperties;
}

const NAV_ITEMS = [
  ["features", "Features"],
  ["repo", "The repo"],
  ["showcase", "Showcase"],
  ["pricing", "Pricing"],
  ["faq", "FAQ"],
] as const;

const PROBLEMS = [
  ["Agent redesigns the architecture on every prompt", "∞ HRS."],
  ["Page builder schema + section registration + preview", "~5 HRS."],
  ["Draft mode + live preview + webhook revalidation", "~4 HRS."],
  ["CDN vs. data cache: stale content after publish", "~3 HRS."],
  ["Studio structure editors can actually use", "~3 HRS."],
  ["SEO metadata, OG images, sitemaps, robots.txt", "~2 HRS."],
  ["Rewriting the same 12 components", "~2 HRS."],
  ["Redirects, analytics, view transitions, Mux", "~2 HRS."],
  ["Contact form + spam guard + Resend wiring", "~1 HR."],
  ["ESLint, Prettier, Biome, git hooks", "~1 HR."],
  ["Basic auth for staging environments", "~1 HR."],
] as const;

const FEATURES = [
  {
    title: "001 / Agent-native",
    body: "AGENTS.md and a dozen scoped skills let Claude Code or Cursor ingest the conventions before the first prompt, instead of proposing a plausible new architecture per run. Two preconfigured MCP servers ship in the repo: one reads the Next.js runtime, compilation errors, routes, and docs matching the installed version; the other drives a real Chrome for screenshots, traces, and screencasts. The agent builds inside the decisions and checks its own work.",
  },
  {
    title: "002 / Agent-ready in production",
    body: "The shipped site stays legible to agents that read it. An editable llms.txt, drafted from your content with Sanity Agent Actions, and a token-light Markdown version of every page, served on the same URL through content negotiation. Generated in Studio, served verbatim, and a feature you can put in your own proposal.",
  },
  {
    title: "003 / Schema as a system",
    body: "Document roles, factory functions, singletons. Every schema looks the same, so every editor knows where to go. You never model the structure from scratch again.",
  },
  {
    title: "004 / The hard fields, already built",
    body: "The three fields nobody gets right the first time. A link field that handles internal refs, external URLs, email, and params. A media field that normalizes image, Mux, Rive, and Lottie into one shape, each returning dimensions, so you forget layout shift. A page builder with guardrails. Reusable, typed, composed everywhere.",
  },
  {
    title: "005 / Fetch layer, solved",
    body: "CDN bypassed in production, Data Cache doing the work, webhooks invalidating on publish, draft mode wired in. Stale content after publish stops being a midnight problem.",
  },
  {
    title: "006 / A Studio editors actually use",
    body: "Every document type where editors expect it. Pages own their routes, singletons stay locked, no hunting. Clients stop emailing to ask where their homepage lives.",
  },
  {
    title: "007 / SEO, done not deferred",
    body: "Per-page metadata from schema, sitemap driven by Sanity, OpenGraph with auto-cropped images, robots.txt included. Nothing bolted on the week before launch.",
  },
  {
    title: "008 / Production-ready from day one",
    body: "Basic auth, spam-protected forms, redirects managed in Sanity, analytics, view transitions. The plumbing you reconfigure every project, already wired.",
  },
  {
    title: "009 / Wired up, not just cloned",
    body: "An interactive setup script provisions the Sanity project, mints the tokens, adds CORS, and registers the revalidation webhook, then writes your .env. Export and migration scripts back up production and move content between environments. The first run is handled, not documented.",
  },
] as const;

const PROJECTS = [
  ["Good Fella", "https://good-fella.com/", "good-fella.jpg"],
  ["House of Honey", "https://www.houseofhoney.com/", "house-of-honey.jpg"],
  ["Aspen Search", "https://www.aspensearch.com/", "aspen-search.jpg"],
  ["Anuc Home", "https://www.anuchome.com/", "anuc-home.jpg"],
  ["Edoardo Lunardi", "https://www.edoardolunardi.dev/", "edoardo-lunardi.jpg"],
  ["Serve Robotics", "https://www.serverobotics.com/", "serve-robotics.jpg"],
  ["Muralia", "https://www.muralia.at/", "muralia.jpg"],
  ["blink", "https://www.blink.trade/", "blink.jpg"],
  ["WASL", "https://www.waslarchitects.com/", "wasl.jpg"],
  [
    "Creative Lives in Progress",
    "https://creativelivesinprogress.com/",
    "creative-lives.jpg",
  ],
  [
    "This site :D",
    "https://www.contentarchitecture.dev/",
    "content-architecture.png",
  ],
] as const;

const TESTIMONIALS = [
  {
    quote:
      "“We shipped the Good Fella site on an early version and it saved us tons of time. Six months in, we're still building pages and sections in an afternoon without fighting the setup.”",
    name: "Julian Fella",
    role: "Co-founder, Good Fella",
    avatar: "good-fella-avatar.jpg",
  },
  {
    quote:
      "“Edo and I ran a client project on this together. The plumbing was already handled, so the week we'd normally lose to setup went into the creative work the client actually remembers.”",
    name: "Elliott Mangham",
    role: "Founder & frontend engineer",
    avatar: "house-of-honey-avatar.png",
  },
  {
    quote:
      "“I opened the fetch layer and found the revalidation problem I'd burned two days on last project, already solved and committed. That one folder paid for the whole thing, and the rest is six years of decisions I'd have made the slow way.”",
    name: "Malik Kotb",
    role: "Web designer & engineer",
    avatar: "edoardo-avatar.jpg",
  },
] as const;

const INCLUSIONS = [
  "One-time fee, no subscription",
  "Perpetual license, unlimited projects",
  "Commercial use, no attribution",
  "Lifetime updates, included",
  "Agent-ready: skills, MCP, llms.txt",
  "Private GitHub Discussions",
  "Direct line to the maintainer",
  "Full source on purchase, sales final",
  "For Next.js + Sanity engineers, not no-code",
  "All prices in EUR",
] as const;

const FAQ = [
  {
    q: "What stack is this built on?",
    a: "Next.js 16 with the App Router and React Compiler, Sanity v6, TypeScript in strict mode, Tailwind 4, and Biome for lint and format. Deploys on Vercel out of the box, and runs on Cloudflare via OpenNext.",
  },
  {
    q: "Does it work with Claude Code and Cursor?",
    a: "It is built for it. AGENTS.md plus a dozen scoped skills mean any agentic tool ingests the conventions and boundaries before you write a prompt. Ask an agent to build this from scratch and you get a different architecture every run. Here the decisions are already made, so the agent works inside them instead of inventing new ones. You still read and write the real code yourself; the agent works inside the architecture, it does not write the app for you.\n\nIt also ships two preconfigured MCP servers. One reads the running Next.js dev server: compilation errors, routes, docs that match the installed version. The other drives a real Chrome: screenshots across viewports, performance traces, screencasts of transitions it can review frame by frame. The agent doesn't just know the conventions, it can look at the app it's changing.",
  },
  {
    q: "Is the shipped site agent-ready too?",
    a: "Yes. Every site built on this ships with an editable llms.txt, drafted from your content with Sanity Agent Actions from the Site document, and a token-light Markdown version of every page and article, served on the same URL to any agent that sends Accept: text/markdown. You generate it per page in Studio, review it, and it is served verbatim. Your client's site is readable by assistants and agentic crawlers on day one, a line item you can put in your own proposal.",
  },
  {
    q: "Am I locked into this exact stack?",
    a: "No. The opinion lives in the architecture, and the tools sit on top of it. Tailwind, Biome, Mux, Rive, Lottie, these are the defaults I reach for on most projects, wired in cleanly so they come out just as cleanly. Don't want Tailwind? Pull it. Prefer ESLint over Biome? Swap it. No Mux, Rive, or Lottie in this project? Drop them. What you are really buying is the patterns underneath, how content is modeled, fetched, and composed. The libraries are just what I ship with on 90% of my projects.\n\nThe Sanity layer is decoupled by design too. Every import inside the sanity/ folder is relative or an external package, nothing reaches into the Next.js app, so you can lift the whole Studio, schema, and field primitives into another project. The content layer doesn't hold you hostage to the front end.",
  },
  {
    q: "Do I need to know Sanity?",
    a: "Some, yes. This is a real codebase, not a no-code template. You should be comfortable in a Sanity schema file and a Next.js project. If you are, you will feel at home in minutes. If you have never opened a schema, the article series is the best place to start before deciding.",
  },
  {
    q: "Is this for me if I don't code?",
    a: "No, and I'd rather tell you here than take your money. This is a real Next.js and Sanity codebase, not a no-code tool: no visual page builder, no drag-and-drop editor. You clone the repo and write real code on top of it. If you don't work in Next.js and Sanity, it isn't for you.",
  },
  {
    q: "Can I use this for client work?",
    a: "Yes. Unlimited projects, commercial use, no attribution required. Use it on every client site you ship. The one thing you cannot do is resell the architecture itself as a competing product.",
  },
  {
    q: "How is this different from other boilerplates?",
    a: "Most boilerplates give you a pile of features. This gives you decisions. Every hard call, document modeling, the fetch layer, revalidation, the link and media fields, was made once over six years and committed. It is opinionated on purpose, and it is the architecture I ship my own client work on, not a side project cleaned up for sale.",
  },
  {
    q: "Why not just use a free Sanity starter?",
    a: "A free starter gets you a clean install and the easy parts. What it leaves you is the work that actually costs the days: a page builder with guardrails, the fetch layer and revalidation, the link and media fields, a Studio structure your editors don't email you about. Those decisions are still yours to make on every project. Here they're already made, over six years of real client work, and committed. You're not paying for code you could scaffold in an afternoon. You're paying to skip the part nobody quotes for.",
  },
  {
    q: "Will it break on Next.js updates?",
    a: "This is my daily driver, so I keep it current. Next.js majors, Sanity migrations, breaking plugin changes, I handle them and push the update. Your license includes every update for as long as I maintain it, which is for as long as I am using it myself.",
  },
  {
    q: "What do I actually get, and for how long?",
    a: "The full repo on day one, a perpetual license, and lifetime updates included, not sold as a separate tier. One payment, no subscription. You own it forever.",
  },
  {
    q: "Do you offer support?",
    a: "Buyers get a private GitHub Discussions space, threaded and searchable, where I answer questions directly. For anything bigger, I am reachable by email. What you will not find is a Discord to get lost in or a support queue that routes you to a bot.",
  },
  {
    q: "What if I find a bug?",
    a: "Tell me, and it gets fixed in the codebase, usually fast. A bug you hit is a bug my own client projects will hit too, so fixing it is in my interest as much as yours. The patch ships to everyone.",
  },
  {
    q: "Can I get a refund?",
    a: "Because you get the full source on purchase, sales are final, the same way every serious code product works. Once the repo is cloned, it cannot be un-cloned. So I have put everything you need to decide up front: read the article series for the full reasoning, browse the real repo above, and look at the sites already shipped on it. If something is unclear before you buy, email me and I will answer honestly, sometimes that means telling you it is not the right fit.",
  },
  {
    q: "What is this not?",
    a: "It is a set of architectural decisions, made once over six years and committed, that gets you to the real work faster. You write real code on top of it. There is no no-code editor, no UI kit or component library to theme, no auth-billing-dashboard SaaS scaffolding, and no course wrapped around it, though the article series explains the reasoning behind it. You buy it once and own it.",
  },
] as const;

const REPO_FILES = [
  ".AGENTS",
  ".HUSKY",
  "APP",
  "COMPONENTS",
  "DOCS",
  "FEATURES",
  "SANITY",
  "SCRIPTS",
  "SEED",
  "TEMPLATES",
  ".ENV.EXAMPLE",
  ".GITIGNORE",
  ".MCP.JSON",
  ".NPMRC",
  ".NVMRC",
  "AGENTS.MD",
  "ASSETS.D.TS",
  "BIOME.JSONC",
  "CLAUDE.MD",
  "ENV.TS",
  "GETTING-STARTED.MD",
  "LEFTHOOK.YML",
  "NEXT-ENV.D.TS",
  "NEXT.CONFIG.TS",
  "PACKAGE.JSON",
  "PACKAGE-LOCK.JSON",
  "PLOPFILE.MJS",
  "PROXY.TS",
  "README.MD",
  "GET-ACCESS.MD",
  "SANITY-SCHEMA.JSON",
  "SANITY.CLI.TS",
  "SANITY.CONFIG.TS",
  "SKILLS-LOCK.JSON",
  "TSCONFIG.JSON",
] as const;

const REPO_README = `# The Content Architecture

A modern Next.js 16 starter with Sanity CMS integration.

## Features

- Next.js 16 with App Router and Server Components
- Sanity CMS with in-app Studio
- TypeScript 6, Tailwind CSS 4, and Biome
- Reusable components, page builder sections, and rich text blocks
- Draft mode with Sanity Live, SEO helpers, and ISR revalidation
- HTTP Basic Auth, llms.txt, and Agent Markdown
- Redirects, Umami analytics, view transitions, Mux, and spam prevention
- Scaffolding via Plop for repeatable section and block generation

## Getting Started

New here? Start with GETTING-STARTED.md.

### Prerequisites

- Node.js >= 24.15.0
- npm >= 11.6.2

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

- App: http://localhost:3000
- Studio: NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH

## Project Structure

|-- app/             # Next.js App Router
|-- components/      # Shared React components
|-- features/        # Feature modules
|-- public/          # Static assets
|-- sanity/          # Sanity config, schema, structure
|-- scripts/         # Dataset and project-setup CLIs
|-- seed/            # Bundled starter content
|-- docs/            # Project documentation
+-- env.ts           # Typed environment config

## Agent Skills

AI guidance for this repository lives in AGENTS.md and .agents/skills/.

## License

MIT`;

const BACKGROUND_TEXT =
  "THE CONTENT ARCHITECTURE  AGENT NATIVE  SANITY  NEXT.JS  DECIDED ONCE  COMMITTED  SCHEMA  FETCH LAYER  STUDIO  SEO  PRODUCTION READY  ".repeat(
    260,
  );

const ASCII_BANNER = `THE CONTENT ARCHITECTURE

 /$$$$$$$$ /$$                       /$$$$$$                        /$$       /$$   /$$
|__  $$__/| $$                      /$$__  $$                      | $$      |__/  | $$
   | $$   | $$$$$$$   /$$$$$$      | $$  \\__/  /$$$$$$  /$$$$$$$ | $$$$$$$  /$$ /$$$$$$
   | $$   | $$__  $$ /$$__  $$     | $$       /$$__  $$| $$__  $$| $$__  $$| $$|_  $$_/
   | $$   | $$  \\ $$| $$$$$$$$     | $$      | $$  \\ $$| $$  \\ $$| $$  \\ $$| $$  | $$
   | $$   | $$  | $$| $$_____/     | $$    $$| $$  | $$| $$  | $$| $$  | $$| $$  | $$ /$$
   | $$   | $$  | $$|  $$$$$$$     |  $$$$$$/|  $$$$$$/| $$  | $$| $$  | $$| $$  |  $$$$/
   |__/   |__/  |__/ \\_______/      \\______/  \\______/ |__/  |__/|__/  |__/|__/   \\___/`;

function getScrollParent(node: HTMLElement) {
  let current = node.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(`${style.overflow}${style.overflowY}`)) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

function SectionNoise() {
  return (
    <div className="cap-noise" aria-hidden="true">
      <pre>{BACKGROUND_TEXT}</pre>
    </div>
  );
}

function GetAccessButton({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`cap-button${light ? " cap-button-light" : ""}`}
      href="https://www.contentarchitecture.dev/#pricing"
    >
      <span>Get</span>
      <span>Access</span>
    </a>
  );
}

function Spiral() {
  const radii = [44, 65, 89, 116, 147, 182, 221, 264, 311];
  const phrase =
    "THE CONTENT ARCHITECTURE · THE CONTENT ARCHITECTURE · THE CONTENT ARCHITECTURE · ";
  return (
    <div className="cap-spiral" aria-hidden="true">
      <svg viewBox="0 0 700 700" role="img">
        {radii.map((radius, index) => (
          <g key={radius}>
            <circle id={`cap-ring-${index}`} cx="350" cy="350" r={radius} />
            <text>
              <textPath href={`#cap-ring-${index}`}>
                {phrase.repeat(3)}
              </textPath>
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function AsciiImage({ src, alt }: { src: string; alt: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ascii, setAscii] = useState("LOADING SOURCE...");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";

    const render = () => {
      if (cancelled || !image.naturalWidth) return;
      const columns = Math.max(
        48,
        Math.min(112, Math.floor(root.clientWidth / 6)),
      );
      const rows = Math.max(18, Math.round(columns * (9 / 16) * 0.48));
      const canvas = document.createElement("canvas");
      canvas.width = columns;
      canvas.height = rows;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0, columns, rows);
      const pixels = context.getImageData(0, 0, columns, rows).data;
      const glyphs = " .,:;irsXA253hMHGS#9B&@";
      const lines: string[] = [];
      for (let row = 0; row < rows; row++) {
        let line = "";
        for (let column = 0; column < columns; column++) {
          const offset = (row * columns + column) * 4;
          const luminance =
            (pixels[offset] * 0.299 +
              pixels[offset + 1] * 0.587 +
              pixels[offset + 2] * 0.114) /
            255;
          line +=
            glyphs[
              Math.min(
                glyphs.length - 1,
                Math.floor((1 - luminance) * glyphs.length),
              )
            ];
        }
        lines.push(line);
      }
      setAscii(lines.join("\n"));
    };

    image.addEventListener("load", render);
    image.src = src;
    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(root);
    return () => {
      cancelled = true;
      image.removeEventListener("load", render);
      resizeObserver.disconnect();
    };
  }, [src]);

  return (
    <div ref={rootRef} className="cap-ascii">
      <img src={src} alt={alt} crossOrigin="anonymous" />
      <pre aria-hidden="true">{ascii}</pre>
    </div>
  );
}

function RepoExplorer() {
  const [activeFile, setActiveFile] = useState("README.MD");
  const [content, setContent] = useState(REPO_README);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState([
    "~/the-content-architecture > get-access   # €549 · one-time",
  ]);

  const openFile = (file: string) => {
    setActiveFile(file);
    if (file === "README.MD") setContent(REPO_README);
    else if (file === "AGENTS.MD") {
      setContent(
        "# AGENTS.md\n\nRead the scoped skills before changing the architecture.\nBuild inside the conventions. Verify in a real browser.\n",
      );
    } else if (file === "PACKAGE.JSON") {
      setContent(
        '{\n  "scripts": {\n    "dev": "next dev",\n    "check": "npm run check.types && biome check .",\n    "sanity:typegen": "sanity schema extract && sanity typegen generate"\n  }\n}',
      );
    } else {
      setContent(
        `// ${file}\n// Production source included in The Content Architecture.\n// Open README.MD for the captured overview.`,
      );
    }
  };

  const runCommand = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    const next = command.trim();
    if (!next) return;
    if (next === "clear") setHistory([]);
    else {
      const output =
        next === "ls"
          ? REPO_FILES.slice(0, 12).join("  ")
          : next === "help"
            ? "help  ls  cat README.md  get-access  clear"
            : next.toLowerCase() === "cat readme.md"
              ? "# The Content Architecture"
              : next === "get-access"
                ? "Opening the one-time license page..."
                : `command not found: ${next}`;
      setHistory((current) => [...current, `~ > ${next}\n${output}`]);
    }
    setCommand("");
  };

  return (
    <div className="cap-ide">
      <div className="cap-ide-bar">The Content Architecture</div>
      <div className="cap-ide-main">
        <nav className="cap-files" aria-label="File explorer">
          {REPO_FILES.map((file) => (
            <button
              key={file}
              type="button"
              data-active={activeFile === file}
              onClick={() => openFile(file)}
            >
              {file}
            </button>
          ))}
        </nav>
        <div className="cap-editor">
          <textarea
            aria-label={`${activeFile} contents`}
            spellCheck={false}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <section className="cap-terminal" aria-label="Terminal">
            <div className="cap-terminal-title">Terminal</div>
            <div className="cap-terminal-output">{history.join("\n")}</div>
            <label className="cap-terminal-line">
              <span>~/the-content-architecture &gt;&nbsp;</span>
              <input
                aria-label="Terminal input"
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                onKeyDown={runCommand}
              />
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ContentArchitecturePage({
  assetBase = DEFAULT_ASSET_BASE,
  className = "",
  style,
}: ContentArchitecturePageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [progress, setProgress] = useState(0);
  const [testimonial, setTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const styles = useMemo(
    () => getContentArchitecturePageStyles(assetBase),
    [assetBase],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scrollParent = getScrollParent(root);
    const onScroll = () => {
      const scrollTop =
        scrollParent === window
          ? window.scrollY
          : (scrollParent as HTMLElement).scrollTop;
      const scrollHeight =
        scrollParent === window
          ? document.documentElement.scrollHeight - window.innerHeight
          : (scrollParent as HTMLElement).scrollHeight -
            (scrollParent as HTMLElement).clientHeight;
      setProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);

      let current = "home";
      for (const [id] of NAV_ITEMS) {
        const section = root.querySelector<HTMLElement>(`#cap-${id}`);
        if (section && section.getBoundingClientRect().top < 180) current = id;
      }
      setActiveSection(current);
    };
    onScroll();
    scrollParent.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollParent.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    rootRef.current
      ?.querySelector<HTMLElement>(`#cap-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <main
      ref={rootRef}
      className={["content-architecture-page", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <style>{styles}</style>

      <header className="cap-header">
        <div className="cap-header-top">
          <button
            type="button"
            className="cap-brand"
            aria-label="Home"
            onClick={() => scrollTo("home")}
          >
            <span className="cap-brand-mark" />
          </button>
          <button
            type="button"
            className="cap-menu-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>Menu</span>
            <span>{menuOpen ? "−" : "+"}</span>
          </button>
        </div>
        <nav className="cap-nav" data-open={menuOpen} aria-label="Primary">
          {NAV_ITEMS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              data-active={activeSection === id}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
          <a href="https://www.contentarchitecture.dev/blog">Blog</a>
        </nav>
      </header>

      <div className="cap-minimap" aria-hidden="true">
        <span
          className="cap-minimap-progress"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="cap-more">
        <span className="cap-more-label">Learn more</span>
        <button
          type="button"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          +
        </button>
      </div>

      <section id="cap-home" className="cap-hero">
        <div className="cap-hero-copy">
          <p className="cap-kicker">Built for agentic development.</p>
          <h1>
            The Sanity setup
            <br />
            agents don&apos;t reinvent.
          </h1>
          <p className="cap-hero-deck">
            Every run invents a new one, none decided. This Next.js and Sanity
            kit commits six years of decisions. Your agent builds inside them,
            and checks its work through MCP and a real Chrome.
          </p>
          <p className="cap-audience">
            For engineers who work in Next.js and Sanity.
          </p>
          <div className="cap-hero-cta">
            <GetAccessButton />
          </div>
          <div className="cap-specs">
            <span>
              Next 16.x
              <br />
              Agents.md: loaded
            </span>
            <span>
              Sanity v6
              <br />
              MCP: 2 servers
            </span>
            <span>
              TS: strict
              <br />
              Drift: 0
            </span>
          </div>
        </div>
        <div className="cap-hero-art">
          <Spiral />
        </div>
      </section>

      <section className="cap-problems cap-paper">
        <div className="cap-container cap-problem-layout">
          <div>
            <p className="cap-kicker">Common problems</p>
            <div className="cap-problem-table">
              {PROBLEMS.map(([problem, time], index) => (
                <div key={problem} className="cap-problem-row">
                  <span>{String(index + 1).padStart(3, "0")}</span>
                  <span>{problem}</span>
                  <span>{time}</span>
                </div>
              ))}
            </div>
            <div className="cap-problem-total">
              <span>Estimated time lost:</span>
              <span>~24 hours per project (3 full days)</span>
            </div>
          </div>
          <div className="cap-problem-copy">
            <h2>
              The page builder
              <br />
              alone costs you days.
              <br />
              Every single time.
            </h2>
            <p>
              It&apos;s never the easy stuff that hurts. It&apos;s the page
              builder, modeled from scratch again. Draft mode and live preview,
              wired up and subtly broken again. The cache bug where published
              content goes stale and the client swears you shipped something
              wrong. A Studio structure your editors actually understand,
              instead of one they email you about.
            </p>
            <p>
              This is the part nobody quotes for and everybody rebuilds. Days
              gone before the real work starts.
            </p>
          </div>
        </div>
      </section>

      <section id="cap-features" className="cap-features cap-dark">
        <SectionNoise />
        <div className="cap-container">
          <div className="cap-features-intro">
            <h2>
              Every decision
              <br />
              already made. So
              <br />
              you can skip to
              <br />
              the actual work.
            </h2>
            <p>
              The Content Architecture is the production foundation underneath
              real client work. Hundreds of choices, schema, data, preview,
              cache, Studio, tooling, agents, made once and committed.
            </p>
          </div>
          <div className="cap-feature-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="cap-feature">
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cap-repo" className="cap-repo cap-paper">
        <div className="cap-repo-shell">
          <p className="cap-kicker cap-repo-kicker">This is the actual repo.</p>
          <RepoExplorer />
        </div>
      </section>

      <section id="cap-showcase" className="cap-showcase">
        <div className="cap-showcase-head">
          <h2>The work that gets remembered.</h2>
          <p>
            Real sites, shipped on The Content Architecture. With the plumbing
            already handled, the effort goes where it shows. The work here has
            been recognized by Awwwards, FWA, and CSSDA, and picked up across
            design directories.
          </p>
        </div>
        <div className="cap-project-grid">
          {PROJECTS.map(([title, href, image]) => (
            <a key={title} className="cap-project" href={href}>
              <AsciiImage
                src={`${assetBase}/${image}`}
                alt={`${title} website built on The Content Architecture`}
              />
              <h3>{title}</h3>
            </a>
          ))}
        </div>
      </section>

      <section className="cap-testimonials">
        <div className="cap-container">
          <div className="cap-testimonial-frame">
            <blockquote>{TESTIMONIALS[testimonial].quote}</blockquote>
            <div className="cap-testimonial-meta">
              <div className="cap-person">
                <img
                  src={`${assetBase}/${TESTIMONIALS[testimonial].avatar}`}
                  alt=""
                />
                <span>
                  {TESTIMONIALS[testimonial].name}
                  <br />
                  {TESTIMONIALS[testimonial].role}
                </span>
              </div>
              <div className="cap-slider-controls">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() =>
                    setTestimonial(
                      (testimonial - 1 + TESTIMONIALS.length) %
                        TESTIMONIALS.length,
                    )
                  }
                >
                  ←
                </button>
                <span className="cap-slider-count">
                  {String(testimonial + 1).padStart(2, "0")} / 03
                </span>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() =>
                    setTestimonial((testimonial + 1) % TESTIMONIALS.length)
                  }
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cap-pricing" className="cap-pricing cap-paper">
        <div className="cap-container cap-pricing-grid">
          <h2>
            One repo.
            <br />
            One pricing.
            <br />
            Lifetime updates.
          </h2>
          <div className="cap-price-card">
            <div className="cap-price">€549</div>
            <div className="cap-inclusions">
              {INCLUSIONS.map((inclusion, index) => (
                <div key={inclusion} className="cap-inclusion">
                  <span>{String(index + 1).padStart(3, "0")}</span>
                  <span>{inclusion}</span>
                </div>
              ))}
            </div>
            <div className="cap-price-actions">
              <GetAccessButton light />
            </div>
          </div>
        </div>
      </section>

      <section id="cap-faq" className="cap-faq">
        <div className="cap-faq-grid">
          <div>
            <h2>Before you buy</h2>
            <div className="cap-faq-cta">
              <GetAccessButton light />
            </div>
          </div>
          <div>
            {FAQ.map((item, index) => {
              const open = openFaq === index;
              return (
                <article key={item.q} className="cap-faq-item">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? -1 : index)}
                    >
                      <span>
                        Q.{String(index + 1).padStart(3, "0")} / {item.q}
                      </span>
                      <span className="cap-faq-plus">{open ? "−" : "+"}</span>
                    </button>
                  </h3>
                  {open ? (
                    <div className="cap-faq-answer">
                      <p>{item.a}</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cap-ascii-banner">
        <pre>{ASCII_BANNER}</pre>
      </section>

      <footer className="cap-footer">
        <SectionNoise />
        <div className="cap-footer-grid">
          <form className="cap-newsletter" onSubmit={submitNewsletter}>
            <input
              type="email"
              required
              aria-label="Email"
              placeholder="your@email.com"
            />
            <button type="submit">
              {subscribed ? "Updated" : "Stay updated"}
            </button>
          </form>
          <nav className="cap-footer-links" aria-label="Footer">
            <a href="https://www.contentarchitecture.dev/blog">Blog</a>
            <a href="https://www.contentarchitecture.dev/roadmap">Roadmap</a>
            <a href="https://www.contentarchitecture.dev/#pricing">
              Get access
            </a>
            <a href="https://www.contentarchitecture.dev/privacy-policy">
              Privacy policy
            </a>
            <a href="https://www.contentarchitecture.dev/terms-of-service">
              Terms of service
            </a>
          </nav>
        </div>
        <div className="cap-footer-bottom">
          <span>© 2026 The Content Architecture</span>
          <a href="https://www.edoardolunardi.dev/">
            Built by edoardolunardi.dev
          </a>
        </div>
      </footer>

      {drawerOpen ? (
        <>
          <button
            type="button"
            className="cap-drawer-backdrop"
            aria-label="Close learn more"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="cap-drawer">
            <div className="cap-drawer-head">
              <h2>Decided once. Committed.</h2>
              <button
                type="button"
                aria-label="Close learn more"
                onClick={() => setDrawerOpen(false)}
              >
                ×
              </button>
            </div>
            <p>
              The production Sanity and Next.js foundation built across six
              years of client work, packaged so engineers and their agents can
              start with the architecture already decided.
            </p>
            <a href="https://www.contentarchitecture.dev/">
              Visit the original site
            </a>
          </aside>
        </>
      ) : null}
    </main>
  );
}

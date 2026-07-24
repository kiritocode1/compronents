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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type CurtainHandle,
  type CurtainPhase,
  mountContentArchitectureCurtain,
} from "./ascii-curtain";
import { BLOG_POSTS, BlogArticle, BlogIndex, Odometer } from "./blog";
import { mountContentArchitectureGlyphField } from "./glyph-field";
import { SiteMinimap } from "./minimap";
import { RepoExplorer } from "./repo-explorer";
import {
  mountContentArchitectureSpiral,
  type SpiralInteractionState,
} from "./spiral";
import { getContentArchitecturePageStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/content-architecture-page";

export interface ContentArchitecturePageProps {
  assetBase?: string;
  className?: string;
  style?: CSSProperties;
}

type PageView =
  | { kind: "home"; anchor?: string }
  | { kind: "blog" }
  | { kind: "article"; slug: string };

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
    body: "AGENTS.md and a dozen scoped skills let Claude Code or Cursor ingest the conventions before the first prompt, instead of proposing a plausible new architecture per run. Two preconfigured MCP servers ship in the repo: one reads the Next.js runtime, compilation errors, routes, docs matching the installed version, the other drives a real Chrome for screenshots, traces, and screencasts. The agent builds inside the decisions and checks its own work.",
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

const ASCII_BANNER = ` /$$$$$$$$ /$$                                                       /$$            /$$$$$$              /$$
|__  $$__/| $$                                                      | $$           /$$__  $$            | $$
   | $$   | $$$$$$$   /$$$$$$        /$$$$$$$   /$$$$$$  /$$   /$$ /$$$$$$        |__/  \\ $$        /$$$$$$$  /$$$$$$  /$$   /$$  /$$$$$$$
   | $$   | $$__  $$ /$$__  $$      | $$__  $$ /$$__  $$|  $$ /$$/|_  $$_/           /$$$$$/       /$$__  $$ |____  $$| $$  | $$ /$$_____/
   | $$   | $$  \\ $$| $$$$$$$$      | $$  \\ $$| $$$$$$$$ \\  $$$$/   | $$            |___  $$      | $$  | $$  /$$$$$$$| $$  | $$|  $$$$$$
   | $$   | $$  | $$| $$_____/      | $$  | $$| $$_____/  >$$  $$   | $$ /$$       /$$  \\ $$      | $$  | $$ /$$__  $$| $$  | $$ \\____  $$
   | $$   | $$  | $$|  $$$$$$$      | $$  | $$|  $$$$$$$ /$$/\\  $$  |  $$$$/      |  $$$$$$/      |  $$$$$$$|  $$$$$$$|  $$$$$$$ /$$$$$$$/
   |__/   |__/  |__/ \\_______/      |__/  |__/ \\_______/|__/  \\__/   \\___/         \\______/        \\_______/ \\_______/ \\____  $$|_______/
                                                                                                                       /$$  | $$
                                                                                                                      |  $$$$$$/
                                                                                                                       \\______/


  /$$$$$$   /$$$$$$   /$$$$$$        /$$   /$$  /$$$$$$  /$$   /$$  /$$$$$$   /$$$$$$$
 |____  $$ /$$__  $$ /$$__  $$      | $$  | $$ /$$__  $$| $$  | $$ /$$__  $$ /$$_____/
  /$$$$$$$| $$  \\__/| $$$$$$$$      | $$  | $$| $$  \\ $$| $$  | $$| $$  \\__/|  $$$$$$
 /$$__  $$| $$      | $$_____/      | $$  | $$| $$  | $$| $$  | $$| $$       \\____  $$
|  $$$$$$$| $$      |  $$$$$$$      |  $$$$$$$|  $$$$$$/|  $$$$$$/| $$       /$$$$$$$//$$
 \\_______/|__/       \\_______/       \\____  $$ \\______/  \\______/ |__/      |_______/|__/
                                     /$$  | $$
                                    |  $$$$$$/
                                     \\______/`;

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

function GlyphField({
  imageUrl,
  backgroundOnly = false,
  interactive = true,
}: {
  imageUrl?: string;
  backgroundOnly?: boolean;
  interactive?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return mountContentArchitectureGlyphField(root, {
      imageUrl,
      backgroundOnly,
      interactive,
      cursorLabel: labelRef.current,
      modelLayout: "right",
      imageFit: "contain",
    });
  }, [backgroundOnly, imageUrl, interactive]);

  return (
    <div
      ref={rootRef}
      className="cap-glyph-field"
      aria-hidden="true"
      data-interactive={interactive}
    >
      {interactive ? (
        <span ref={labelRef} className="cap-glyph-cursor" data-visible="false">
          Click
        </span>
      ) : null}
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
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [interaction, setInteraction] =
    useState<SpiralInteractionState>("idle");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return mountContentArchitectureSpiral(
      root,
      labelRef.current,
      setInteraction,
    );
  }, []);

  return (
    <div ref={rootRef} className="cap-spiral" aria-hidden="true">
      <span ref={labelRef} data-visible="false">
        {interaction === "holding"
          ? "Keep holding"
          : interaction === "charged"
            ? "Release"
            : "Click & hold"}
      </span>
    </div>
  );
}

function ProblemsTerminal() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ row: 0, characters: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timer = 0;
    let started = false;
    let cancelled = false;
    const type = (row: number, characters: number) => {
      if (cancelled) return;
      const line = PROBLEMS[row];
      if (!line) {
        setProgress({ row: PROBLEMS.length, characters: 0 });
        return;
      }
      setProgress({ row, characters });
      if (characters < line[0].length) {
        timer = window.setTimeout(() => type(row, characters + 1), 16);
      } else {
        timer = window.setTimeout(() => type(row + 1, 0), 200);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return;
        started = true;
        type(0, 0);
      },
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={rootRef} className="cap-problem-window">
      <div className="cap-problem-window-shell">
        <div className="cap-problem-window-title">Common problems</div>
        <div className="cap-problem-window-body">
          <span className="cap-sr-only">
            {PROBLEMS.map(
              ([problem, time], index) =>
                `${String(index + 1).padStart(3, "0")} ${problem} ${time}`,
            ).join(". ")}
          </span>
          {PROBLEMS.map(([problem, duration], index) => {
            const visibleCount =
              index < progress.row
                ? problem.length
                : index === progress.row
                  ? progress.characters
                  : 0;
            const complete = visibleCount >= problem.length;
            return (
              <div key={problem} className="cap-problem-terminal-row">
                <span className="cap-problem-terminal-copy">
                  <span>
                    {visibleCount > 0 ? String(index + 1).padStart(3, "0") : ""}
                  </span>
                  <span>
                    {problem.slice(0, visibleCount)}
                    {!complete && visibleCount > 0 ? (
                      <i aria-hidden="true" />
                    ) : null}
                  </span>
                </span>
                <span>{complete ? duration : ""}</span>
              </div>
            );
          })}
          <div className="cap-problem-terminal-row cap-problem-terminal-total">
            <span>Estimated time lost:</span>
            <span>
              {progress.row >= PROBLEMS.length
                ? "~24 hours per project (3 full days)"
                : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingQuote({ quote, play }: { quote: string; play: boolean }) {
  const rootRef = useRef<HTMLQuoteElement>(null);
  const [entered, setEntered] = useState(false);
  const [characters, setCharacters] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setEntered(true);
      },
      { threshold: 0 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!entered || !play || characters >= quote.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCharacters(quote.length);
      return;
    }
    const timer = window.setTimeout(
      () => setCharacters((current) => Math.min(quote.length, current + 1)),
      18,
    );
    return () => window.clearTimeout(timer);
  }, [characters, entered, play, quote]);

  return (
    <blockquote ref={rootRef}>
      <span className="cap-sr-only">{quote}</span>
      <span aria-hidden="true" className="cap-typing-quote">
        {quote.slice(0, characters)}
        {characters < quote.length ? (
          <span className="cap-typewriter-cursor" />
        ) : null}
        <span className="cap-typewriter-rest">{quote.slice(characters)}</span>
      </span>
    </blockquote>
  );
}

export default function ContentArchitecturePage({
  assetBase = DEFAULT_ASSET_BASE,
  className = "",
  style,
}: ContentArchitecturePageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [pageRoot, setPageRoot] = useState<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [testimonial, setTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [view, setView] = useState<PageView>({ kind: "home" });
  const styles = useMemo(
    () => getContentArchitecturePageStyles(assetBase),
    [assetBase],
  );
  const attachRoot = useCallback((node: HTMLElement | null) => {
    rootRef.current = node;
    setPageRoot(node);
  }, []);

  /*
   * View transition. The registry item is self-contained, so it owns its own
   * routing: the curtain covers, the pending view swap runs while the screen
   * is opaque, then the curtain reveals. Same three-phase contract as the
   * production provider, minus the framework router.
   */
  const curtainRef = useRef<HTMLCanvasElement>(null);
  const curtain = useRef<CurtainHandle | null>(null);
  const pendingView = useRef<PageView | null>(null);
  const [phase, setPhase] = useState<CurtainPhase>("idle");
  const phaseRef = useRef<CurtainPhase>("idle");

  const watchdog = useRef<number | null>(null);

  const clearWatchdog = useCallback(() => {
    if (watchdog.current !== null) {
      window.clearTimeout(watchdog.current);
      watchdog.current = null;
    }
  }, []);

  const applyPhase = useCallback((next: CurtainPhase) => {
    phaseRef.current = next;
    setPhase(next);
    curtain.current?.setPhase(next);
  }, []);

  const settleView = useCallback(() => {
    const next = pendingView.current;
    pendingView.current = null;
    if (next) setView(next);
    applyPhase("reveal");
  }, [applyPhase]);

  useEffect(() => {
    const canvas = curtainRef.current;
    if (!canvas) return;
    const handle = mountContentArchitectureCurtain(canvas, {
      onCoverComplete: () => {
        clearWatchdog();
        settleView();
      },
      onRevealComplete: () => applyPhase("idle"),
      isReducedMotion: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    curtain.current = handle;
    return () => {
      handle.destroy();
      // Only release the ref if it still points at this handle, so a
      // remount that already installed a newer one is left intact.
      if (curtain.current === handle) curtain.current = null;
    };
  }, [applyPhase, clearWatchdog, settleView]);

  const navigate = useCallback(
    (next: PageView) => {
      setMenuOpen(false);
      if (phaseRef.current === "cover") return;
      pendingView.current = next;
      applyPhase("cover");
      // Watchdog from the source provider: if the cover never reports back
      // (a backgrounded tab pausing rAF, a dropped frame loop), the
      // navigation still lands instead of stranding an opaque curtain.
      clearWatchdog();
      watchdog.current = window.setTimeout(() => {
        if (phaseRef.current === "cover") settleView();
      }, 6000);
    },
    [applyPhase, clearWatchdog, settleView],
  );

  useEffect(() => clearWatchdog, [clearWatchdog]);

  useEffect(() => {
    if (view.kind === "home") {
      if (!view.anchor) return;
      rootRef.current
        ?.querySelector<HTMLElement>(`#cap-${view.anchor}`)
        ?.scrollIntoView({ block: "start" });
      return;
    }
    // A fresh view starts at the top, the way a real navigation would.
    getScrollParent(rootRef.current ?? document.body).scrollTo?.({ top: 0 });
  }, [view]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scrollParent = getScrollParent(root);
    const onScroll = () => {
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

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (view.kind !== "home") {
      // An anchor from a sub-view is still a navigation: cover, swap, land.
      navigate({ kind: "home", anchor: id });
      return;
    }
    rootRef.current
      ?.querySelector<HTMLElement>(`#cap-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  return (
    <main
      ref={attachRoot}
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
              data-active={view.kind === "home" && activeSection === id}
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            data-active={view.kind !== "home"}
            onClick={() => navigate({ kind: "blog" })}
          >
            Blog
          </button>
        </nav>
      </header>

      {view.kind === "home" ? <SiteMinimap pageRoot={pageRoot} /> : null}

      <div className="cap-more" data-hidden={view.kind !== "home"}>
        <span className="cap-more-label">Learn more</span>
        <button
          type="button"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          +
        </button>
      </div>

      {view.kind === "home" ? (
        <>
          <section
            id="cap-home"
            className="cap-hero"
            data-page-builder-section="mainHeroSection"
          >
            <div className="cap-hero-copy">
              <p className="cap-kicker" data-studio-field="eyebrow">
                Built for agentic development.
              </p>
              <h1 data-studio-field="title">
                The Sanity setup
                <br />
                agents don&apos;t reinvent.
              </h1>
              <p className="cap-hero-deck" data-studio-field="text">
                Every run invents a new one, none decided. This Next.js and
                Sanity kit commits six years of decisions. Your agent builds
                inside them, and checks its work through MCP and a real Chrome.
              </p>
              <p className="cap-audience" data-studio-field="audience">
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
            <button
              type="button"
              className="cap-scroll-cue"
              aria-label="Scroll to the next section"
              onClick={() => scrollTo("features")}
            >
              <span />
            </button>
          </section>

          <section
            className="cap-problems cap-paper"
            data-page-builder-section="textTerminalSection"
          >
            <div className="cap-container cap-problem-layout">
              <ProblemsTerminal />
              <div className="cap-problem-copy">
                <h2 data-studio-field="title">
                  The page builder
                  <br />
                  alone costs you days.
                  <br />
                  Every single time.
                </h2>
                <p data-studio-field="text.0">
                  It&apos;s never the easy stuff that hurts. It&apos;s the page
                  builder, modeled from scratch again. Draft mode and live
                  preview, wired up and subtly broken again. The cache bug where
                  published content goes stale and the client swears you shipped
                  something wrong. A Studio structure your editors actually
                  understand, instead of one they email you about.
                </p>
                <p data-studio-field="text.1">
                  This is the part nobody quotes for and everybody rebuilds.
                  Days gone before the real work starts.
                </p>
              </div>
            </div>
          </section>

          <section
            id="cap-features"
            className="cap-features cap-dark"
            data-page-builder-section="benefitsSection"
          >
            <div className="cap-features-field">
              <GlyphField backgroundOnly />
            </div>
            <div className="cap-container">
              <div className="cap-features-intro">
                <h2 data-studio-field="title">
                  Every decision
                  <br />
                  already made. So
                  <br />
                  you can skip to
                  <br />
                  the actual work.
                </h2>
                <p data-studio-field="text">
                  The Content Architecture is the production foundation
                  underneath my client work. Hundreds of choices, schema,
                  fetching, structure, SEO, made once over six years and
                  committed. Not a starter you outgrow in a month. Clone it,
                  rename it, ship. The architecture is fixed; the tools are
                  defaults you can swap. Fixed decisions are also what make
                  agentic development work: an agent inside committed
                  conventions ships, an agent without them redesigns.
                </p>
              </div>
              <div className="cap-feature-grid">
                {FEATURES.map((feature, index) => (
                  <article
                    key={feature.title}
                    className="cap-feature"
                    data-studio-item={`items.${index}`}
                  >
                    <h3 data-studio-field={`items.${index}.title`}>
                      {feature.title}
                    </h3>
                    <p data-studio-field={`items.${index}.text`}>
                      {feature.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="cap-repo"
            className="cap-repo cap-paper"
            data-page-builder-section="ideSection"
          >
            <div className="cap-repo-shell">
              <RepoExplorer />
            </div>
          </section>

          <section
            id="cap-showcase"
            className="cap-showcase"
            data-page-builder-section="showcaseSection"
          >
            <div className="cap-showcase-head">
              <h2 data-studio-field="title">The work that gets remembered.</h2>
              <p data-studio-field="text">
                Real sites, shipped on The Content Architecture. With the
                plumbing already handled, the effort goes where it shows. The
                work here has been recognized by Awwwards, FWA, and CSSDA, and
                picked up across design directories.
              </p>
            </div>
            <div className="cap-project-grid">
              {PROJECTS.map(([title, href, image], index) => (
                <a
                  key={title}
                  className="cap-project"
                  href={href}
                  data-studio-item={`items.${index}`}
                >
                  <div
                    className="cap-project-media"
                    data-studio-field={`items.${index}.appMedia`}
                  >
                    <GlyphField imageUrl={`${assetBase}/${image}`} />
                    <img
                      src={`${assetBase}/${image}`}
                      alt={`${title} website built on The Content Architecture`}
                      loading="lazy"
                    />
                  </div>
                  <h3 data-studio-field={`items.${index}.title`}>{title}</h3>
                </a>
              ))}
            </div>
          </section>

          <section
            className="cap-testimonials"
            data-page-builder-section="testimonialsSection"
          >
            <div className="cap-testimonial-viewport">
              <div
                className="cap-testimonial-track"
                style={
                  {
                    "--cap-testimonial-index": testimonial,
                  } as CSSProperties
                }
              >
                {TESTIMONIALS.map((item, index) => (
                  <article
                    key={item.name}
                    className="cap-testimonial-slide"
                    data-studio-item={`items.${index}`}
                  >
                    <div className="cap-testimonial-frame">
                      <div data-studio-field={`items.${index}.quote`}>
                        <TypingQuote
                          quote={item.quote}
                          play={testimonial === index}
                        />
                      </div>
                      <div className="cap-testimonial-meta">
                        <div className="cap-person">
                          <img src={`${assetBase}/${item.avatar}`} alt="" />
                          <span>
                            {item.name}
                            <br />
                            {item.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="cap-slider-controls">
              <button
                type="button"
                aria-label="Previous slide"
                disabled={testimonial === 0}
                onClick={() => setTestimonial(Math.max(0, testimonial - 1))}
              >
                ←
              </button>
              <span className="cap-slider-count">
                {String(testimonial + 1).padStart(2, "0")} / 03
              </span>
              <button
                type="button"
                aria-label="Next slide"
                disabled={testimonial === TESTIMONIALS.length - 1}
                onClick={() =>
                  setTestimonial(
                    Math.min(TESTIMONIALS.length - 1, testimonial + 1),
                  )
                }
              >
                →
              </button>
            </div>
          </section>

          <section
            id="cap-pricing"
            className="cap-pricing cap-paper"
            data-page-builder-section="pricingSection"
          >
            <div className="cap-container cap-pricing-grid">
              <h2 data-studio-field="title">
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

          <section
            id="cap-faq"
            className="cap-faq"
            data-page-builder-section="faqSection"
          >
            <div className="cap-faq-grid">
              <div>
                <h2 data-studio-field="title">Before you buy</h2>
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
                          <span className="cap-faq-plus">
                            {open ? "−" : "+"}
                          </span>
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

          <section
            className="cap-ascii-banner"
            data-page-builder-section="calloutSection"
          >
            <pre>{ASCII_BANNER}</pre>
          </section>
        </>
      ) : view.kind === "blog" ? (
        <BlogIndex
          onOpenArticle={(slug) => navigate({ kind: "article", slug })}
        />
      ) : (
        <BlogArticle
          post={
            BLOG_POSTS.find((post) => post.slug === view.slug) ?? BLOG_POSTS[0]
          }
          onBack={() => navigate({ kind: "blog" })}
        />
      )}

      <footer className="cap-footer">
        <GlyphField backgroundOnly interactive={false} />
        <div className="cap-footer-grid">
          <form className="cap-newsletter" onSubmit={submitNewsletter}>
            <input
              type="email"
              required
              aria-label="Email"
              placeholder="your@email.com"
            />
            <button type="submit">
              <Odometer text={subscribed ? "Updated" : "Stay updated"} />
            </button>
          </form>
          <nav className="cap-footer-links" aria-label="Footer">
            <button type="button" onClick={() => navigate({ kind: "blog" })}>
              Blog
            </button>
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
            <nav className="cap-drawer-nav" aria-label="Sections">
              <button type="button">001 / Why this exists</button>
              <button type="button">002 / Why I keep shipping it</button>
              <button type="button">003 / Who am I</button>
            </nav>
            <div className="cap-drawer-content">
              <div className="cap-drawer-head">
                <div>
                  <h2>README / The Content Architecture</h2>
                  <p>v1.0.0 - A personal note from the maintainer</p>
                </div>
                <button
                  type="button"
                  aria-label="Close learn more"
                  onClick={() => setDrawerOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="cap-drawer-sections">
                <section id="cap-drawer-why">
                  <h3>001 / Why this exists</h3>
                  <p>
                    Every Sanity project I shipped, the first week looked
                    identical. Spin up Next. Wire the Studio. Rewrite the page
                    builder. Rebuild the SEO layer. Re-do the webhook
                    revalidation. Re-style the same contact form for the fourth
                    time.
                  </p>
                  <p>
                    By the time the actual creative work started, 3 days of the
                    budget were gone and the client had not seen a single pixel
                    that mattered.
                  </p>
                  <p>
                    Extracting it started small. One project. Then two. Then
                    ten. Every time something broke in production, the fix went
                    back into the architecture.
                  </p>
                </section>
                <section>
                  <h3>002 / Why I keep shipping it</h3>
                  <p>
                    This is still the foundation underneath my client work. Each
                    production lesson goes back into the repository, so the next
                    project begins with a stronger set of decisions.
                  </p>
                </section>
                <section>
                  <h3>003 / Who am I</h3>
                  <p>
                    I am Edoardo Lunardi, an independent designer and engineer
                    building high-craft sites with Next.js and Sanity.
                  </p>
                  <a href="https://www.edoardolunardi.dev/">
                    edoardolunardi.dev
                  </a>
                </section>
              </div>
            </div>
          </aside>
        </>
      ) : null}
      <canvas
        ref={curtainRef}
        className="cap-curtain"
        data-ascii-curtain={phase}
      />
    </main>
  );
}

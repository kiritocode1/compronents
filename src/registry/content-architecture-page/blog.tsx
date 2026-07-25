"use client";

/**
 * Knowledge Hub: the article index and article detail views, plus the
 * odometer label used across both.
 *
 * The odometer is the site's standard hover treatment for uppercase mono
 * labels: every character is a 6-tall column (real glyph, four scrambles,
 * real glyph again) inside a 1em window. Hovering drives --odometer-progress
 * from 0 to 1, the column slides -5em, and a 28ms per-character delay turns
 * the whole label into a rolling counter that lands back on itself.
 */

import { useMemo } from "react";

const ODOMETER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ODOMETER_SCRAMBLES = 4;

/**
 * Deterministic per-position glyph pick. Math.random would desync the server
 * and client renders, and a scramble column only has to look arbitrary, not
 * be unpredictable.
 */
function scrambleGlyph(text: string, position: number, step: number) {
  let hash = 0x811c9dc5;
  const key = `${text}:${position}:${step}`;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return ODOMETER_ALPHABET[hash % ODOMETER_ALPHABET.length] ?? "0";
}

export function Odometer({ text }: { text: string }) {
  const characters = useMemo(() => Array.from(text), [text]);

  return (
    <>
      <span className="cap-sr-only">{text}</span>
      <span aria-hidden="true" className="cap-odometer">
        {characters.map((character, index) => {
          const key = `${character}-${index}`;
          if (character === " ") {
            return (
              <span key={key} className="cap-odometer-space">
                {" "}
              </span>
            );
          }
          return (
            <span key={key} className="cap-odometer-slot">
              <span className="cap-odometer-ghost">{character}</span>
              <span
                className="cap-odometer-column"
                style={{
                  transitionDelay: `calc(var(--cap-odometer,0) * ${index * 28}ms)`,
                }}
              >
                <span>{character}</span>
                {Array.from({ length: ODOMETER_SCRAMBLES }, (_, step) => (
                  <span key={`${key}-${step}`}>
                    {scrambleGlyph(text, index, step)}
                  </span>
                ))}
                <span>{character}</span>
              </span>
            </span>
          );
        })}
      </span>
    </>
  );
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateLabel: string;
  readingMinutes: number;
  body: BlogBlock[];
}

export type BlogBlock =
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "code"; language: string; lines: string[] };

export const BLOG_INTRO = [
  "Practical, opinionated writing on content architecture, headless CMS, and shipping real products with Sanity and Next.js.",
  "Every post comes from decisions already baked into this starter: how to model content that scales, query it cleanly, and turn structure into pages search engines and AI assistants can actually read.",
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "two-caches-stale-content",
    title: "Stale content has two caches, and you only know about one",
    excerpt:
      "A published field that refuses to show up on the live site is almost never a build problem. It is one of two independent caches holding an old copy, and a redeploy clears neither on purpose.",
    date: "2026-06-27",
    dateLabel: "27 Jun 2026",
    readingMinutes: 11,
    body: [
      {
        kind: "p",
        text: "The report always arrives the same way. A price changed in the Studio hours ago, the site still shows the old one, the field looks correct in the CMS. You redeploy, the new value appears, and you write it off as a build flake. The redeploy fixed nothing you can name, which is why it happens again the following week.",
      },
      { kind: "h2", text: "Two caches, not one" },
      {
        kind: "p",
        text: "Between a published document and the HTML a visitor receives, content passes through two caches that do not know about each other. Each answers to different controls and expires on different triggers, so fixing one still ships the wrong value if the other is lying.",
      },
      {
        kind: "list",
        items: [
          "The CMS edge CDN, toggled by the useCdn flag on the client. On, it serves a cached response: fast, and anywhere from seconds to minutes behind the latest publish.",
          "The framework data cache, controlled by the revalidate and tags options you pass to each fetch. It persists across requests and, on most hosts, survives a redeploy.",
        ],
      },
      {
        kind: "p",
        text: "Once you know there are two, debugging stops being guesswork. The question is no longer whether the code is broken, it is which layer is holding the stale copy.",
      },
      { kind: "h2", text: "Make the app tell you which one" },
      {
        kind: "p",
        text: "Before changing a line, add cache tags per document type and log the resolved cache state on the server. A request that returns fresh data with a stale render points at the data cache. A request that returns stale data straight from the client points at the CDN. Two log lines end an afternoon of guessing.",
      },
      {
        kind: "code",
        language: "ts",
        lines: [
          "const client = createClient({",
          "  useCdn: false,",
          "  perspective: 'published',",
          "})",
          "",
          "export const getPage = (slug: string) =>",
          "  client.fetch(PAGE_QUERY, { slug }, {",
          "    next: { tags: [`page:\u0024{slug}`] },",
          "  })",
        ],
      },
      { kind: "h2", text: "Invalidate on publish, not on a timer" },
      {
        kind: "p",
        text: "Time-based revalidation is a guess that is wrong in both directions: too slow for the editor watching the page, too fast for the pages nobody touched this month. A publish webhook that revalidates the exact tag for the document that changed is the version that holds up, and it is roughly forty lines including the signature check.",
      },
      {
        kind: "p",
        text: "That webhook is wired in this repo already. So is the tag naming, so is the signature verification, so is the draft mode path that has to bypass both caches without leaking a token to the browser.",
      },
    ],
  },
  {
    slug: "page-builder-guardrails",
    title:
      "A page builder without guardrails is a design system with extra steps",
    excerpt:
      "Give editors an unconstrained section list and you get pages nobody designed. The fix is not fewer options, it is options that cannot combine into something broken.",
    date: "2026-06-14",
    dateLabel: "14 Jun 2026",
    readingMinutes: 9,
    body: [
      {
        kind: "p",
        text: "Every page builder starts as a kindness. Editors should not need a developer to add a section. Six months later the homepage has four hero variants stacked, a testimonial block used as a footer, and spacing that nobody chose. The builder did exactly what it was asked to do.",
      },
      { kind: "h2", text: "Constraints belong in the schema" },
      {
        kind: "p",
        text: "The useful constraints are structural, and they live in the schema rather than in a document nobody reads. A section that may only appear once. A section that may only appear first. A group that accepts three children, not nine. Encoded there, the Studio refuses the broken combination before it becomes a page.",
      },
      {
        kind: "list",
        items: [
          "One media field shape across every section, so an image behaves the same wherever it lands.",
          "Section-level validation for cardinality and position, not a convention in a wiki.",
          "A preview that renders the real component, so the editor sees what ships.",
        ],
      },
      { kind: "h2", text: "Generate the section, do not hand-roll it" },
      {
        kind: "p",
        text: "Sections are the thing you add most, which makes them the thing worth generating. A scaffold command that writes the schema, the query fragment, the type, and the component in one step keeps the fifteenth section shaped like the first. Consistency you have to remember is consistency you will lose.",
      },
      {
        kind: "code",
        language: "bash",
        lines: [
          "npx plop section",
          "? Section name  pricing-table",
          "  + sanity/schemas/sections/pricing-table.ts",
          "  + sanity/queries/sections/pricing-table.ts",
          "  + components/sections/pricing-table.tsx",
        ],
      },
      {
        kind: "p",
        text: "The payoff is not the minutes saved writing files. It is that every section is reviewable against the same shape, so an agent or a new contributor can add the sixteenth without reading the other fifteen.",
      },
    ],
  },
  {
    slug: "agents-read-your-site-badly",
    title: "Agents read your site badly, and your CMS is where you fix it",
    excerpt:
      "An assistant sent to your page gets a token-heavy DOM and cites it wrong. Two content features fix that: an editor-owned llms.txt, and a Markdown representation served on the same URL.",
    date: "2026-06-28",
    dateLabel: "28 Jun 2026",
    readingMinutes: 16,
    body: [
      {
        kind: "p",
        text: "Point an assistant at a marketing page and watch what it actually receives: nav, cookie banner, three layers of layout wrappers, and somewhere inside that, four sentences of substance. It answers from what it could parse, which is why the citation is subtly wrong and the price is from the wrong plan.",
      },
      { kind: "h2", text: "Publish a file that says what you are" },
      {
        kind: "p",
        text: "An llms.txt at the root is a short, human-written map of what the site covers and where the authoritative pages are. It works because it is small enough to read entirely and specific enough to be worth reading. Generated once and forgotten, it rots; owned by an editor in the CMS, it stays true.",
      },
      { kind: "h2", text: "Serve Markdown on the same URL" },
      {
        kind: "p",
        text: "Content negotiation is the older, better answer to the same problem. A client that sends an Accept header asking for Markdown gets the page as prose: headings, paragraphs, links, no layout. Same URL, so every link that already exists keeps working, and nothing has to be duplicated into a parallel site.",
      },
      {
        kind: "code",
        language: "ts",
        lines: [
          "const wantsMarkdown = request.headers",
          "  .get('accept')",
          "  ?.includes('text/markdown')",
          "",
          "if (wantsMarkdown && page.agentMarkdown) {",
          "  return new Response(page.agentMarkdown, {",
          "    headers: { 'content-type': 'text/markdown; charset=utf-8' },",
          "  })",
          "}",
        ],
      },
      {
        kind: "list",
        items: [
          "Generated per page from the real content, then stored, so serving is a lookup and not a render.",
          "Editable, because the summary an agent should read is rarely the copy a visitor should read.",
          "Vary on Accept, or a cache will hand HTML to the agent and Markdown to the browser.",
        ],
      },
      {
        kind: "p",
        text: "Neither feature is speculative infrastructure. Both are a field in the CMS and a branch in a route handler, and both are the difference between being quoted correctly and being quoted at all.",
      },
    ],
  },
  {
    slug: "conventions-agents-can-read",
    title:
      "Conventions an agent can read beat conventions you enforce in review",
    excerpt:
      "An agent dropped into a codebase without committed decisions proposes a plausible new architecture every run. The fix is to make the decisions readable before the first prompt.",
    date: "2026-05-30",
    dateLabel: "30 May 2026",
    readingMinutes: 8,
    body: [
      {
        kind: "p",
        text: "Ask an agent to add a feature to a repo with no stated conventions and it will invent some. They will be reasonable. They will also be different from last week's, and different again from the ones a colleague used, and you will find all three during review.",
      },
      { kind: "h2", text: "Write the decisions down where they get loaded" },
      {
        kind: "p",
        text: "A conventions file at the repo root is read before the first prompt, which makes it the cheapest possible enforcement. Not a style guide: the actual decisions. Where a query lives. What a section file contains. Which layer may import which. The rules that would otherwise be a comment on the pull request.",
      },
      {
        kind: "list",
        items: [
          "Scoped skills, so the agent loads the schema rules when touching schema and not otherwise.",
          "A runtime server it can query for routes, compilation errors, and version-matched docs.",
          "A browser it can drive, so it checks its own work instead of asserting the work is done.",
        ],
      },
      { kind: "h2", text: "Verification is the half that gets skipped" },
      {
        kind: "p",
        text: "Conventions stop drift on the way in. Verification catches what the conventions did not cover. An agent that can open the page it just changed, screenshot it, and read the console is doing the review pass you would otherwise do by hand, and it is doing it before you look.",
      },
      {
        kind: "p",
        text: "The two together are what makes agentic work compound. Fixed decisions mean the agent builds instead of redesigning; a real browser means it notices when the build is wrong.",
      },
    ],
  },
];

function ArticleMetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="cap-article-meta-row">
      <dt>[{label}]</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function BlogIndex({
  onOpenArticle,
}: {
  onOpenArticle: (slug: string) => void;
}) {
  return (
    <section
      className="cap-blog"
      data-page-builder-section="articleListSection"
    >
      <div className="cap-blog-inner">
        <div className="cap-blog-head">
          <h1 data-studio-field="title">Knowledge Hub</h1>
          <div className="cap-blog-intro" data-studio-field="appRichText">
            {BLOG_INTRO.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
        <ul className="cap-blog-list">
          {BLOG_POSTS.map((post, index) => (
            <li key={post.slug}>
              <a
                className="cap-blog-card"
                href={`#blog/${post.slug}`}
                onClick={(event) => {
                  event.preventDefault();
                  onOpenArticle(post.slug);
                }}
              >
                <h2 data-studio-field={`articles.${index}.title`}>
                  {post.title}
                </h2>
                <p data-studio-field={`articles.${index}.excerpt`}>
                  {post.excerpt}
                </p>
                <p className="cap-blog-card-meta">
                  {post.dateLabel} · {post.readingMinutes} min read
                </p>
                <span className="cap-blog-card-cta">
                  <Odometer text="Read article" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function BlogArticle({
  post,
  onBack,
}: {
  post: BlogPost;
  onBack: () => void;
}) {
  return (
    <article className="cap-article" data-page-builder-section="article">
      <div className="cap-blog-inner">
        <button type="button" className="cap-article-back" onClick={onBack}>
          <span aria-hidden="true" className="cap-article-back-arrow">
            ←
          </span>
          <Odometer text="All articles" />
        </button>
        <header className="cap-article-head">
          <h1 data-studio-field="title">{post.title}</h1>
          <p className="cap-article-excerpt" data-studio-field="excerpt">
            {post.excerpt}
          </p>
          <dl className="cap-article-meta">
            <ArticleMetaRow label="Author">
              <a href="https://www.edoardolunardi.dev">Edoardo Lunardi</a>
            </ArticleMetaRow>
            <ArticleMetaRow label="Published">
              <time dateTime={post.date}>{post.dateLabel}</time>
            </ArticleMetaRow>
            <ArticleMetaRow label="Reading time">
              <time dateTime={`PT${post.readingMinutes}M`}>
                {post.readingMinutes} min
              </time>
            </ArticleMetaRow>
          </dl>
        </header>
        <div className="cap-article-body" data-studio-field="content">
          {post.body.map((block, index) => {
            const key = `${block.kind}-${index}`;
            if (block.kind === "h2") return <h2 key={key}>{block.text}</h2>;
            if (block.kind === "p") return <p key={key}>{block.text}</p>;
            if (block.kind === "list") {
              return (
                <ul key={key}>
                  {block.items.map((item) => (
                    <li key={item.slice(0, 24)}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <pre key={key} data-language={block.language}>
                <code>{block.lines.join("\n")}</code>
              </pre>
            );
          })}
        </div>
      </div>
    </article>
  );
}

/**
 * Server-side retrieval over the inspiration wall.
 *
 * The full feed is ~400KB of markdown, which is far past what an agent can
 * read in one shot, so `/inspiration/llms.txt` gets truncated and the pick is
 * made from whatever fraction survived. This narrows 1000+ links down to a
 * handful of candidates first; the agent does the semantic judgement on those.
 *
 * ponytail: BM25 over title/category/description, no embeddings. The
 * descriptions are keyword-dense (library names, authors, techniques), so
 * lexical scoring gets the right entries into a top-12 and the reading model
 * handles intent. Add vectors only if real queries start missing.
 */

// Relative + extension so `node --test` can import this directly, as
// registry.ts does with search-time.ts.
import { type InspirationLink, inspirationGroups } from "./inspiration.ts";
import { resolveFacets } from "./inspiration-meta.ts";

export interface SearchHit {
  title: string;
  href: string;
  description?: string;
  category: string;
  score: number;
  kind?: string[];
  stack?: string[];
  useFor?: string[];
}

const STOP_WORDS = new Set(
  "a an and any are as at be best but by can do does for from good great have how i in into is it its like me my need new of on or should show that the their them then there these this to top use used using want was what when where which who why will with you your".split(
    " ",
  ),
);

/** Consistent both sides of the index, so exact form never matters. */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && !word.endsWith("ss") && word.endsWith("s")) {
    return word.slice(0, -1);
  }
  return word;
}

function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z0-9][a-z0-9+#.-]*/g) ?? [];
  return words
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .map(stem);
}

interface IndexedDoc {
  link: InspirationLink;
  category: string;
  /** Term frequencies, with title and category counted extra. */
  freq: Map<string, number>;
  length: number;
}

interface Index {
  docs: IndexedDoc[];
  /** Document frequency per term. */
  df: Map<string, number>;
  avgLength: number;
}

const TITLE_BOOST = 3;
const CATEGORY_BOOST = 2;
const K1 = 1.5;
const B = 0.75;

function buildIndex(): Index {
  const docs: IndexedDoc[] = [];
  const df = new Map<string, number>();

  for (const group of inspirationGroups) {
    const categoryTokens = tokenize(group.title);
    for (const link of group.links) {
      const freq = new Map<string, number>();
      const add = (tokens: string[], weight: number) => {
        for (const token of tokens) {
          freq.set(token, (freq.get(token) ?? 0) + weight);
        }
      };

      add(tokenize(link.title), TITLE_BOOST);
      add(categoryTokens, CATEGORY_BOOST);
      add(tokenize(link.description ?? ""), 1);
      // The host carries signal too ("reactbits.dev", "fonts.google.com").
      add(
        tokenize(link.href.replace(/https?:\/\//, "").replace(/\//g, " ")),
        1,
      );

      // Facets: category defaults + per-link overrides. Weighted like body text
      // so "animated icons" hits useFor phrases without drowning titles.
      const facets = resolveFacets(group.title, link);
      add(tokenize(facets.kind.join(" ")), 2);
      add(tokenize(facets.stack.join(" ")), 2);
      add(tokenize(facets.useFor.join(" ")), 2);

      let length = 0;
      for (const [term, count] of freq) {
        length += count;
        df.set(term, (df.get(term) ?? 0) + 1);
      }

      docs.push({ link, category: group.title, freq, length });
    }
  }

  const total = docs.reduce((sum, doc) => sum + doc.length, 0);
  return { docs, df, avgLength: total / Math.max(docs.length, 1) };
}

let cached: Index | null = null;

function getIndex(): Index {
  cached ??= buildIndex();
  return cached;
}

export function searchInspiration(
  query: string,
  { limit = 12, category }: { limit?: number; category?: string } = {},
): SearchHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const index = getIndex();
  const wanted = category?.toLowerCase().trim();
  const hits: SearchHit[] = [];

  // Generic English that often appears in catalog blurbs ("designed by",
  // "case study"). When the query also has a content term (llm, react, …),
  // down-weight these so they cannot outrank the real signal alone.
  const WEAK_QUERY_TERMS = new Set(
    "designed built made using based create creating study studies internally actually really simple free best great useful popular modern".split(
      " ",
    ),
  );
  const hasStrongTerm = terms.some((term) => !WEAK_QUERY_TERMS.has(term));

  const termIdf = new Map<string, number>();
  for (const term of terms) {
    const docFreq = index.df.get(term) ?? 0;
    const idf = Math.log(
      1 + (index.docs.length - docFreq + 0.5) / (docFreq + 0.5),
    );
    termIdf.set(term, idf);
  }

  const strongTerms = terms.filter((term) => !WEAK_QUERY_TERMS.has(term));

  for (const doc of index.docs) {
    if (wanted && !doc.category.toLowerCase().includes(wanted)) continue;

    let score = 0;
    const matchedStrong: string[] = [];
    for (const term of terms) {
      const freq = doc.freq.get(term);
      if (!freq) continue;
      const idf = termIdf.get(term) ?? 0;
      const norm = 1 - B + (B * doc.length) / index.avgLength;
      const weak = hasStrongTerm && WEAK_QUERY_TERMS.has(term) ? 0.18 : 1;
      score += weak * idf * ((freq * (K1 + 1)) / (freq + K1 * norm));
      if (!WEAK_QUERY_TERMS.has(term)) matchedStrong.push(term);
    }

    // Multi-word asks like "animated footer" must not rank on only one half
    // ("animated" → icon libraries). Require full strong-term coverage for
    // short queries; for longer ones require the majority of strong terms.
    if (score > 0 && strongTerms.length >= 2) {
      const need =
        strongTerms.length <= 3
          ? strongTerms.length
          : Math.ceil(strongTerms.length * 0.6);
      if (matchedStrong.length < need) {
        score *= 0.08;
      }
    }

    if (score > 0.5) {
      const facets = resolveFacets(doc.category, doc.link);
      hits.push({
        title: doc.link.title,
        href: doc.link.href,
        description: doc.link.description,
        category: doc.category,
        score: Number(score.toFixed(3)),
        kind: facets.kind,
        stack: facets.stack,
        useFor: facets.useFor,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Query words that appear nowhere in the collection.
 *
 * Lexical scoring can only match shared vocabulary, so a question phrased in
 * words the entries never use is the one failure mode here, and it is silent:
 * you still get twelve confident-looking results. Surfacing the dead words
 * turns that into something the caller can act on by rewording.
 */
export function unmatchedTerms(query: string): string[] {
  const index = getIndex();
  return [...new Set(tokenize(query))].filter((term) => !index.df.has(term));
}

export function listByCategory(category: string, limit = 60): SearchHit[] {
  const wanted = category.toLowerCase().trim();
  const group = inspirationGroups.find(
    (candidate) =>
      candidate.title.toLowerCase() === wanted ||
      candidate.title.toLowerCase().includes(wanted),
  );
  if (!group) return [];

  return group.links.slice(0, limit).map((link) => ({
    title: link.title,
    href: link.href,
    description: link.description,
    category: group.title,
    score: 0,
  }));
}

export function categoryIndex(): { title: string; count: number }[] {
  return inspirationGroups.map((group) => ({
    title: group.title,
    count: group.links.length,
  }));
}

export function hitsToMarkdown(hits: SearchHit[]): string {
  return hits
    .map((hit) => {
      const suffix = hit.description ? `: ${hit.description}` : "";
      return `- [${hit.title}](${hit.href}) _(${hit.category})_${suffix}`;
    })
    .join("\n");
}

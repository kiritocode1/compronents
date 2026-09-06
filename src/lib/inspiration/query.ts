import { expandQuery, STYLE_PHRASE_MAP } from "../inspiration-meta.ts";
import { tokenize } from "../inspiration-rank.ts";

// These are equivalent words, not related technologies or category defaults.
const WORD_FORMS = [
  ["animation", "animate", "animated", "animating", "motion"],
  ["font", "typeface", "typography"],
  ["cache", "cached", "caching"],
  ["pair", "pairing", "paired"],
  ["host", "hosted", "hosting"],
  ["retrieve", "retrieval", "retrieving"],
  ["architecture", "architectural", "internal", "internally"],
  ["interface", "ui"],
  ["quiet", "subtle", "restrained"],
  ["postgres", "postgresql"],
  ["react", "reactjs"],
  ["javascript", "js"],
  ["typescript", "ts"],
  ["node", "nodejs"],
  ["reactnative", "react-native"],
  ["selfhost", "self-hosted", "self-hosting"],
];
const forms = new Map(
  WORD_FORMS.flatMap((group) => group.map((word) => [word, group[0]] as const)),
);
const FLUFF = new Set(
  "please find looking resource study learn understand actually less".split(
    " ",
  ),
);
const TECHNOLOGIES = new Set(
  "react reactnative vue svelte angular python rust javascript typescript postgres sqlite redis webgl gsap tailwind shadcn electron android swift docker kubernetes pgvector rag llm".split(
    " ",
  ),
);

export function queryTerms(text: string) {
  const phrases = text
    .toLowerCase()
    .replace(/\b(?:large )?language models?\b/g, "llm")
    .replace(/\bretrieval[ -]augmented generation\b/g, "rag")
    .replace(/\bunder the hood\b/g, "architecture")
    .replace(/\breact[ -]native\b/g, "reactnative")
    .replace(/\bself[ -]host(?:ed|ing)?\b/g, "selfhost")
    .replace(/\bscroll[ -]driven\b/g, "scroll")
    .replace(/\b(react|node|next)\.js\b/g, "$1")
    .replace(/[^a-z0-9+#]+/g, " ");
  return [
    ...new Set(
      tokenize(phrases)
        .map((word) => forms.get(word) ?? word)
        .filter((word) => !FLUFF.has(word)),
    ),
  ];
}

/** One edit, only for unknown query words. Callers decide whether to correct. */
export function nearTerm(a: string, b: string) {
  if (a === b) return true;
  if (
    a.length < 5 ||
    b.length < 5 ||
    a[0] !== b[0] ||
    Math.abs(a.length - b.length) > 1
  )
    return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + (i < a.length || j < b.length ? 1 : 0) <= 1;
}

export function coverage(terms: string[], text: string) {
  const words = new Set(queryTerms(positiveEvidence(text)));
  return terms.length
    ? terms.filter((term) => words.has(term)).length / terms.length
    : 1;
}

/** A short blurb can span sentences; distant mentions cannot establish a fit. */
export function nearbyCoverage(terms: string[], text: string) {
  const words = text.split(/\s+/);
  let support = 0;
  for (let i = 0; i < words.length; i += 30) {
    support = Math.max(
      support,
      coverage(terms, words.slice(i, i + 60).join(" ")),
    );
    if (support === 1) break;
  }
  return support;
}

export function analyzeQuery(text: string) {
  const excluded: string[][] = [];
  // Quoted phrases, technology names, and trailing exclusion clauses stay negative.
  const positive = text
    .replace(
      /(?:\b(?:without|excluding|exclude|not|no)\s+|(?:^|\s)-)("[^"]+"|[^,;]+?)(?=\s+\b(?:for|with|using|in)\b|[,;]|$)/gi,
      (_, clause: string) => {
        for (const part of clause
          .replaceAll('"', "")
          .split(/\s+(?:or|and)\s+/)) {
          const terms = queryTerms(part);
          if (terms.length) excluded.push(terms);
        }
        return " ";
      },
    )
    .trim();
  let terms = queryTerms(positive).slice(0, 32);
  // RAG already includes retrieval; educational verbs do not constrain internals.
  if (terms.includes("rag"))
    terms = terms.filter((term) => term !== "retrieve");
  if (terms.includes("architecture"))
    terms = terms.filter(
      (term) => !["designed", "built", "work"].includes(term),
    );
  const technology = terms.filter((term) => TECHNOLOGIES.has(term));
  const phrases = ["react query", "web audio"]
    .filter((phrase) => positive.toLowerCase().includes(phrase))
    .map((phrase) => queryTerms(phrase));
  const styleQuery = positive.replace(
    /\b(?:quiet|subtle) (?:motion|animation)\b/gi,
    "restrained motion",
  );
  const styleRules = STYLE_PHRASE_MAP.filter((rule) =>
    rule.match.test(styleQuery),
  );
  const style = styleRules.length > 0;
  const variants = style
    ? [
        ...styleRules.flatMap((rule) => rule.queries),
        ...expandQuery(styleQuery).slice(1),
      ]
        .map(queryTerms)
        .filter((words) => words.length >= 3)
        .slice(0, 10)
    : [];
  // Preserve the requested action when a style rewrite changes its setting.
  const actions = style
    ? terms.filter((term) => ["animation", "quiet"].includes(term))
    : [];
  return {
    positive,
    terms,
    excluded,
    technology,
    phrases,
    variants,
    style,
    actions,
  };
}

export type QueryAnalysis = ReturnType<typeof analyzeQuery>;

/** Never change a known word, or choose between equally plausible spellings. */
export function correctQuery(
  query: QueryAnalysis,
  known: Map<string, Set<number>>,
  titles: Set<string>,
) {
  query.terms = query.terms.map((term) => {
    if (known.has(term) || TECHNOLOGIES.has(term)) return term;
    const context = query.terms.filter((other) => other !== term);
    const matches = [...(context.length ? known.keys() : titles)]
      .filter((word) => nearTerm(term, word))
      .map((word) => ({
        word,
        support: context.filter((other) =>
          [...(known.get(other) ?? [])].some((id) => known.get(word)?.has(id)),
        ).length,
      }))
      .sort((a, b) => b.support - a.support);
    if (!matches.length || (context.length && !matches[0].support)) return term;
    return matches.length === 1 || matches[0].support > matches[1].support
      ? matches[0].word
      : term;
  });
}

export function candidateText(query: QueryAnalysis) {
  const terms = [...query.terms, ...query.variants.flat()];
  // SQL uses the original word forms as well as their equivalences.
  return [
    ...new Set([
      query.positive,
      ...terms,
      ...WORD_FORMS.filter((group) => terms.includes(group[0])).flat(),
    ]),
  ].join(" ");
}

/** Required concepts get their own candidate budget so broad rewrites cannot crowd them out. */
export function constraintTsQuery(query: QueryAnalysis) {
  return [...query.technology, ...query.actions]
    .map((term) => {
      const alternatives = WORD_FORMS.find((group) => group[0] === term) ?? [
        term,
      ];
      return `(${alternatives.map((word) => word.replace(/[^a-z0-9]+/g, " & ")).join(" | ")})`;
    })
    .join(" & ");
}

export function meetsConstraints(query: QueryAnalysis, text: string) {
  if (query.excluded.some((terms) => coverage(terms, text) === 1)) return false;
  // Explicit framework names carry dependencies; inherited category tags do not.
  if (
    query.excluded.some((terms) => terms.includes("react")) &&
    coverage(["reactnative", "shadcn"], text) > 0
  )
    return false;
  if (coverage(query.technology, text) < 1) return false;
  if (coverage(query.actions, text) < 1) return false;
  const phraseText = ` ${queryTermsInOrder(text)} `;
  if (
    !query.phrases.every((terms) => phraseText.includes(` ${terms.join(" ")} `))
  )
    return false;
  // A request for Linear's design must not match linear gradients or algebra.
  if (
    query.style &&
    coverage(["interface", "product", "saas", "craft"], text) === 0
  )
    return false;
  return true;
}

function queryTermsInOrder(text: string) {
  // Keep repeated words so a phrase cannot bridge distant parts of a description.
  return positiveEvidence(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .split(/\s+/)
    .map((word) => queryTerms(word).join(" ") || "_")
    .join(" ");
}

/** Explicitly denied features must not supply positive keyword evidence. */
function positiveEvidence(text: string) {
  return text.replace(
    /\b(?:not|no|without)\s+(?:any\s+)?(?:react[ -]native|[a-z0-9+#.-]+)/gi,
    " ",
  );
}

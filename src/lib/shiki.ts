import { createHighlighter, type Highlighter } from "shiki";

const THEME = "vesper";

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: ["tsx", "ts", "bash", "json"],
    });
  }
  return highlighterPromise;
}

/** Highlight a code string to HTML. Server-only (used from RSC). */
export async function highlight(code: string, lang = "tsx") {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code.trimEnd(), {
    lang,
    theme: THEME,
  });
}

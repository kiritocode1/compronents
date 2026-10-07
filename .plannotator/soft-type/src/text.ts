/** Text helpers with no DOM: grapheme splitting and matching new text to the letters on screen. */

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/** Splits text into graphemes: what a reader counts as one character (é, 👍🏽, 한). */
export const graphemes = (text: string) =>
  Array.from(segmenter.segment(text), (s) => s.segment);

export const isBreak = (g: string) => g === "\n" || g === "\r\n" || g === "\r";

export const isSpace = (g: string) => !isBreak(g) && /^\s+$/u.test(g);

/** Emoji presentation, flags and keycaps; a text-style © or ★ stays a glyph. */
export const isEmoji = (g: string) =>
  /\p{Emoji_Presentation}|\p{Regional_Indicator}|️|⃣/u.test(g);

export interface Keyed {
  id: number;
  grapheme: string;
}

/**
 * Matches new text against the letters on screen: the common prefix and suffix
 * keep their entries (and so their physics), only the middle is replaced.
 */
export function reconcile<T extends Keyed>(
  old: T[],
  next: string[],
  make: (grapheme: string) => T,
) {
  let start = 0;
  while (
    start < old.length &&
    start < next.length &&
    old[start].grapheme === next[start]
  )
    start++;
  let tail = 0;
  while (
    tail < old.length - start &&
    tail < next.length - start &&
    old[old.length - 1 - tail].grapheme === next[next.length - 1 - tail]
  )
    tail++;
  const removed = old.slice(start, old.length - tail);
  const added = next.slice(start, next.length - tail).map(make);
  return {
    entries: [
      ...old.slice(0, start),
      ...added,
      ...old.slice(old.length - tail),
    ],
    removed,
    added,
  };
}

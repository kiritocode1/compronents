/**
 * Shared PRO pixel-mosaic glyph data for the COMPRONENTS wordmark and OG image.
 * Colors are deterministic so client mosaic and static OG match 1:1.
 */

// 7x8 bitmaps for the three letters (1 = filled cell).
export const PRO_GLYPHS: Record<string, string[]> = {
  P: [
    "1111110",
    "1100011",
    "1100011",
    "1111110",
    "1100000",
    "1100000",
    "1100000",
    "1100000",
  ],
  R: [
    "1111110",
    "1100011",
    "1100011",
    "1111110",
    "1101100",
    "1100110",
    "1100011",
    "1100011",
  ],
  O: [
    "0111110",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "1100011",
    "0111110",
  ],
};

export const PRO_COLS = 7;
export const PRO_ROWS = 8;
export const PRO_BASE = "#f4b400";
export const PRO_FLASH = "#ffd766";
/** red, blue, lime, navy — same accents as the live mosaic twinkle */
export const PRO_ACCENTS = ["#e8402a", "#2f6bff", "#c3f53b", "#141d3f"] as const;

/** Deterministic 0..1 from an integer, stable across SSR and client. */
export function proRnd(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export type ProCell = {
  r: number;
  c: number;
  /** Steady fill (accent or base yellow). */
  color: string;
  /** Twinkle target: brighter yellow for accent cells, accent for base cells. */
  flash: string;
  isAccent: boolean;
  /** left-to-right index across the word (for animation delay) */
  colPos: number;
  gi: number;
};

/** Filled cells for one letter, with static colors matching the live mosaic. */
export function proLetterCells(ch: string, letterIndex: number): ProCell[] {
  const rows = PRO_GLYPHS[ch];
  if (!rows) return [];
  const out: ProCell[] = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c] !== "1") continue;
      const gi = letterIndex * 100 + r * PRO_COLS + c;
      const accent =
        PRO_ACCENTS[Math.floor(proRnd(gi + 7) * PRO_ACCENTS.length)];
      const isAccent = proRnd(gi) < 0.2;
      out.push({
        r,
        c,
        color: isAccent ? accent : PRO_BASE,
        flash: isAccent ? PRO_FLASH : accent,
        isAccent,
        colPos: letterIndex * (PRO_COLS + 1) + c,
        gi,
      });
    }
  }
  return out;
}

export const PRO_LETTERS = ["P", "R", "O"] as const;

"use client";

/**
 * Flow Field Text - a horizontally scrollable field of editorial columns whose
 * body copy is drawn as a monospace character grid sampled through an animated
 * 3D simplex-noise displacement field.
 *
 * Every cell of the grid does not draw its own glyph. It reads a glyph from a
 * drifting, noise-pushed position in the source copy, so legible text smears,
 * duplicates, and dissolves toward the bottom of the field, then reforms as the
 * field breathes. Serif headers (label, author, title) sit above each column
 * and scroll in lockstep. Drag or wheel to scroll sideways, hover a column to
 * pull it into an accent color, and tap a column to select it. Because color
 * follows the sampled character rather than the cell, the accent bleeds across
 * borders wherever the field borrowed a letter from a neighbor.
 *
 * A rebuild of the schemasofuncertainty.com home page: same noise
 * (josephg/noisejs simplex3), same displacement math, same layout and scroll.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Vendored simplex noise (josephg/noisejs), simplex3 + seed only. This exact
// permutation table and gradient set is what produces the field 1:1.
// ---------------------------------------------------------------------------

class Grad {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  dot3(x: number, y: number, z: number) {
    return this.x * x + this.y * y + this.z * z;
  }
}

const GRAD3 = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
].map(([x, y, z]) => new Grad(x, y, z));

// prettier-ignore
const PERM_SEED = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];

const F3 = 1 / 3;
const G3 = 1 / 6;

class Noise {
  perm: number[] = new Array(512);
  gradP: Grad[] = new Array(512);
  constructor(seed: number) {
    this.seed(seed);
  }
  seed(seed: number) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      const v =
        i & 1
          ? PERM_SEED[i] ^ (seed & 255)
          : PERM_SEED[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = GRAD3[v % 12];
    }
  }
  simplex3(xin: number, yin: number, zin: number) {
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const x0 = xin - i + t;
    const y0 = yin - j + t;
    const z0 = zin - k + t;
    let i1: number;
    let j1: number;
    let k1: number;
    let i2: number;
    let j2: number;
    let k2: number;
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.gradP[ii + this.perm[jj + this.perm[kk]]];
    const gi1 = this.gradP[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
    const gi2 = this.gradP[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
    const gi3 = this.gradP[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
    // Each corner contributes (0.5 - r^2)^4 * (gradient . offset), or 0 outside.
    const corner = (t: number, g: Grad, x: number, y: number, z: number) => {
      if (t < 0) return 0;
      const t2 = t * t;
      return t2 * t2 * g.dot3(x, y, z);
    };
    return (
      32 *
      (corner(0.5 - x0 * x0 - y0 * y0 - z0 * z0, gi0, x0, y0, z0) +
        corner(0.5 - x1 * x1 - y1 * y1 - z1 * z1, gi1, x1, y1, z1) +
        corner(0.5 - x2 * x2 - y2 * y2 - z2 * z2, gi2, x2, y2, z2) +
        corner(0.5 - x3 * x3 - y3 * y3 - z3 * z3, gi3, x3, y3, z3))
    );
  }
}

// ---------------------------------------------------------------------------
// Math helpers, matching the site's implementations exactly.
// ---------------------------------------------------------------------------

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(Math.min(v, Math.max(lo, hi)), Math.min(lo, hi));
const norm = (a: number, b: number, x: number) => (x - a) / (b - a);
const map = (v: number, inA: number, inB: number, outA: number, outB: number) =>
  outA + (outB - outA) * norm(inA, inB, v);

// Greedy word wrap to a column count; long words are hard-broken. Matches the
// per-line character budget the source layout uses.
function wrap(text: string, cols: number): string[] {
  if (cols < 1) return [text];
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/(\s+)/)) {
      if (word === "") continue;
      if (line.length + word.length <= cols) {
        line += word;
      } else if (/^\s+$/.test(word)) {
        out.push(line);
        line = "";
      } else if (word.length > cols) {
        if (line.trim()) out.push(line);
        let rest = word;
        while (rest.length > cols) {
          out.push(rest.slice(0, cols));
          rest = rest.slice(cols);
        }
        line = rest;
      } else {
        out.push(line.replace(/\s+$/, ""));
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

// floor(), but snaps up when within epsilon of the next integer (fp guard).
function snapFloor(e: number, eps = 1e-6) {
  const n = Math.floor(e);
  return Math.abs(e - n - 1) < eps ? Math.ceil(e) : n;
}

function formatTitle(title: string, subtitle?: string) {
  const upper = title.toUpperCase();
  if (!subtitle) return upper;
  const sep = /[.?!]$/.test(title.trim()) ? " " : ": ";
  return upper + sep + subtitle;
}

export interface FlowFieldItem {
  /** Body copy sampled into the noise field. */
  text: string;
  /** Serif header title (rendered uppercase). */
  title?: string;
  /** Serif subtitle appended after the title. */
  subtitle?: string;
  /** Serif byline above the title. */
  author?: string;
  /** Small mono badge (falls back to "NEW" when isNew). */
  label?: string;
  isNew?: boolean;
  /** Identity used for hover, accent, and onSelect. */
  url?: string;
}

export interface FlowFieldTextProps {
  /** Editorial columns tiled left to right. A bare string is one column. */
  items?: FlowFieldItem[] | string[] | string;
  /** Fired when a column is tapped (a click without a drag). */
  onSelect?: (url: string, item: FlowFieldItem, index: number) => void;
  background?: string;
  textColor?: string;
  accentColor?: string;
  /** Field + badge font. A monospace family keeps glyphs on the grid. */
  monoFamily?: string;
  /** Header (author / title) font. */
  serifFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  /** Time multiplier for the field drift. 1 matches the source. */
  speed?: number;
  /** Peak pixel displacement (source uses 1800). */
  magnitude?: number;
  /** Column pitch in px. Defaults to ~300 snapped to the char grid. */
  itemWidth?: number;
  /** Left indent of body copy inside each column, in px. */
  gutter?: number;
  /** Header band height in px (canvas starts below it). */
  headerHeight?: number;
  /** Accent the column under the pointer. */
  hoverHighlight?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ESSAY_FIELD =
  "BLANK builds interfaces that admit what they do not know. A model is a guess wearing the clothes of a fact, and the honest ones leave the seams showing. This field renders text the way a forecast renders weather: legible near the top, fraying toward the bottom, never quite settling into a single reading. Move slowly across it and the words steady under your attention. Look away and they drift, because the surface was never fixed, it was only sampled. Certainty is expensive and usually counterfeit. What a good interface offers instead is a calibrated sense of doubt, a way to feel how firm the ground is before you put your weight on it. We would rather show you the error bars than hide them behind a clean number. The clean number is a story; the error bars are the part of the truth the story left out. Read this as a demonstration and as an argument at the same time. The demonstration is the motion in front of you. The argument is that motion of this kind belongs in more of the tools we use, not as decoration but as an honest signal of how much of what we see is reconstructed on the fly. A page that never moves is making a promise it cannot keep. This one keeps a smaller promise and keeps it well: the letters are here, roughly, most of the time, and the rest is left to your eye to finish. Hold that thought while the field breathes and the sentences come apart in your hands. There is a discipline in that. It is easy to build a surface that shouts and easy to build one that sits perfectly still, and both are ways of dodging the harder question of how much to trust what you are looking at. The interesting work lives in the middle register, where a thing is alive enough to respond and honest enough to admit when it is guessing. That register is where BLANK likes to work, and it is where most real understanding happens too, in the narrow space between a confident claim and the quiet awareness that the claim could be wrong. Treat every screen you build as a proposition rather than a verdict, and the people using it will meet you with the same care.";
const ESSAY_NOISE =
  "Noise is not the enemy of meaning, it is the medium meaning travels through. Every character on this surface is sampled from a drifting position in the source copy, so the same sentence smears, doubles, drops a letter, and reforms as the field slowly breathes. What you read is a probability, held together just long enough to be understood, then handed back to the current. The displacement is small near the top and grows with the square of depth, which is why the opening lines stay sharp while the closing ones dissolve into scattered fragments and single letters adrift in white space. None of it is random in the careless sense. It is a smooth three dimensional field, the same kind of coherent noise used to grow terrain and cloud and marble, sampled once per cell and advanced a little every frame. Coherence is the whole trick. Pure static would be unreadable and pure order would be dead. What sits between them, a legible signal slowly losing its grip, is where the interesting reading happens. You are watching information decay at a rate you can follow, and following it is the point. Nothing here is trying to trick you. It is trying to make visible a thing that is usually hidden: that legibility is a threshold, not a guarantee, and that most surfaces are one bad sample away from static. Consider what it means to sample. A sample is a question asked of a place: what is here, right now, at this exact coordinate. Ask the question of a slightly different place and you get a slightly different answer, which is why the letters wander instead of jumping. The field moves them the way wind moves a field of wheat, in long coherent gusts rather than isolated jerks, and that coherence is what your eye tracks and trusts.";
const ESSAY_MODELS =
  "From type on a page to markets and climate and the weather next Tuesday, we lean on models to make the unknown feel handled. The persistent risk is mistaking the map for the ground it describes. A map that stops moving starts to feel like the territory, and that is exactly when it lies to you. This surface keeps the map visibly in motion, a standing reminder that the thing reacting under your cursor was only ever an approximation, useful precisely because it is incomplete. Completeness is not the goal and never was. A model complete enough to capture everything would be the size of the world and just as hard to read. The craft is in choosing what to leave out, and then being honest about the choosing. Every forecast is a confession of ignorance dressed up as a prediction. The good ones tell you how confident they are; the dangerous ones present a single future in a firm typeface and dare you to doubt it. We prefer the confessional kind. Watch a column here long enough and you can feel the confidence draining out of it line by line, the letters loosening their hold as the depth increases. That drain is not a failure of the render. It is the render being truthful about the difference between what it knows at the top and what it is only guessing at the bottom. A forecast is not a promise about the future, it is a description of the present taken to its likely conclusion, and when the present shifts the conclusion should shift with it. A model that refuses to update is not confident, it is merely stubborn. The best tools wear their revisions openly.";
const ESSAY_READING =
  "Reading is reconstruction, not reception. Your eye fills the gaps the noise opens, and the copy stays legible because the grid stays honest to its spacing even as the glyphs wander off their marks. Monospace is the quiet hero here: because every cell is the same width, a smeared line still lands on the same rhythm, and your reading brain snaps the wandering letters back into words. Take the grid away and the whole effect collapses into mush. Hover a column to pull it into focus, and watch the accent color bleed across a border wherever the field reached into a neighbor and borrowed a letter without giving it back. That bleed is not a bug, it is the most honest part of the picture: color follows the sampled character, not the cell it landed in, so the highlight goes exactly where the information actually came from. This is what attention looks like when you draw it faithfully. It is porous, it leaks, it picks up context from the edges of whatever sits nearby. A cleaner effect would draw a tidy box around the hovered column and call it focus. This one shows you the truer, messier thing: that focus is a stain that spreads, and that the boundaries we draw around meaning are always a little more permeable than we would like to admit. So read this as an invitation to notice your own reading. Feel the moment your eye locks a wandering word back into place, the small unconscious effort that turns a smear into a sentence.";
const ESSAY_DOUBT =
  "Doubt is a material you can build with. Most interfaces treat it as a defect to be sanded away, a rough edge between the user and a clean answer. We treat it as structure. A confidence interval is a shape. A margin of error has a texture. A forecast that admits its own spread gives you something firmer to stand on than a single number pretending to be the truth. This field is doubt rendered as motion. The letters hold their meaning loosely, the way an honest estimate holds its value, and the looseness is information, not failure. When a number arrives without its uncertainty attached, someone has done you the disservice of hiding their ignorance. When a surface arrives perfectly still, it is making the same quiet omission. We would rather show the tremor. A tool that shakes a little where it is unsure is easier to trust than one that never flinches, because the flinch is a signal you can calibrate against. Build with doubt and your users learn to read it. Hide it and they learn, eventually and expensively, that they should not have trusted the calm. The honest interface does not pretend to know more than it does, and it does not hide the moment its knowledge runs out. It shows you the edge and lets you decide how close to stand.";
const ESSAY_THRESHOLD =
  "There is a line, invisible and always moving, where signal becomes static. Below it a message survives any amount of interference; above it the same message dissolves into noise. Most of the time we live comfortably below the line and forget it is there. This surface drags the line into view and lets you watch text approach it, cross it, and come back. The top of each column sits safely in the readable zone. The bottom pushes past the threshold into scatter, single letters adrift with no word left to belong to. What is remarkable is how much distortion the top survives before it gives, and how suddenly the bottom lets go. Legibility is not a slider that fades smoothly to zero. It is a cliff, and the interesting reading happens right at the edge, where a word is half gone and your eye finishes it anyway. Every act of reading is a small bet that the signal is still above the line. Usually you win without noticing. Here the bet is visible, and losing it, watching a sentence finally come apart, is somehow as satisfying as reading it clean. The threshold is where design lives, the narrow band between too much order and too much chaos, and a good interface spends most of its life balanced right on that edge.";

const DEFAULT_ITEMS: FlowFieldItem[] = [
  {
    url: "modelling-uncertainty",
    isNew: true,
    author: "Mara Ellison",
    title: "Modelling Uncertainty",
    subtitle: "A Field Introduction",
    text: ESSAY_FIELD,
  },
  {
    url: "on-noise",
    isNew: true,
    author: "J. R. Okonkwo",
    title: "On Noise as a Medium",
    text: ESSAY_NOISE,
  },
  {
    url: "cost-of-certainty",
    label: "TXT",
    author: "Priya Nair",
    title: "Maps, Forecasts, and the Cost of Certainty",
    text: ESSAY_MODELS,
  },
  {
    url: "reading-reconstruction",
    label: "TXT",
    author: "Tomas Vidal",
    title: "Reading as Reconstruction",
    text: ESSAY_READING,
  },
  {
    url: "honest-interface",
    isNew: true,
    author: "Lena Fischer",
    title: "The Honest Interface",
    subtitle: "Notes on Doubt",
    text: ESSAY_DOUBT,
  },
  {
    url: "legibility-threshold",
    label: "TXT",
    author: "The BLANK Studio",
    title: "Legibility is a Threshold",
    text: ESSAY_THRESHOLD,
  },
];

function normalizeItems(items: FlowFieldTextProps["items"]): FlowFieldItem[] {
  if (items == null) return DEFAULT_ITEMS;
  if (typeof items === "string") return [{ text: items, url: "item-0" }];
  return items.map((it, i) =>
    typeof it === "string"
      ? { text: it, url: `item-${i}` }
      : { ...it, url: it.url ?? `item-${i}` },
  );
}

interface LaidOutColumn {
  textLeft: number;
  textWidth: number;
  lines: string[];
  url: string | null;
}

/** Thin monospace the source is set in, hosted alongside the registry. */
const NEXT_MONO_URL =
  "https://ui.aryank.space/assets/flow-field-text/next-mono-thin.woff";

/** Inject the @font-face once, synchronously, so metrics can be measured. */
function ensureNextMonoFace() {
  if (typeof document === "undefined") return;
  const id = "flow-field-text-next-mono";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `@font-face{font-family:"Next Mono";src:url("${NEXT_MONO_URL}") format("woff");font-display:swap}`;
  document.head.appendChild(style);
}

export default function FlowFieldText({
  items,
  onSelect,
  background = "#ffffff",
  textColor = "#111111",
  accentColor = "#f0341f",
  monoFamily = '"Next Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  serifFamily = '"Century Schoolbook", Georgia, "Times New Roman", serif',
  fontSize = 10,
  lineHeight = 1.3,
  speed = 1,
  magnitude = 1800,
  itemWidth,
  gutter,
  headerHeight,
  hoverHighlight = true,
  className,
  style,
}: FlowFieldTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const headerInnerRef = useRef<HTMLDivElement>(null);
  const scrollXRef = useRef(0);
  const hoverRef = useRef<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const cols = useMemo(
    () => normalizeItems(items),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(items)],
  );

  // Measured monospace advance, kept in state so headers and field agree on it.
  // Must reflect the *loaded* font: the grid steps by cw while fillText advances
  // by the real glyph width, so a stale fallback metric makes columns overlap.
  const [cw, setCw] = useState(() => fontSize * 0.6);
  useLayoutEffect(() => {
    let cancelled = false;
    ensureNextMonoFace();
    const measure = () => {
      const c = document.createElement("canvas").getContext("2d");
      if (!c) return;
      c.font = `${fontSize}px ${monoFamily}`;
      const w = c.measureText("M").width;
      if (!cancelled && w) setCw(w);
    };
    measure();
    if (typeof document !== "undefined" && document.fonts) {
      // Force the field font to actually load, then re-measure with its metrics.
      const load = document.fonts
        .load(`${fontSize}px "Next Mono"`)
        .catch(() => {});
      Promise.resolve(load)
        .then(() => document.fonts.ready)
        .then(() => {
          if (!cancelled) measure();
        });
    }
    return () => {
      cancelled = true;
    };
  }, [fontSize, monoFamily]);

  const ch = fontSize * lineHeight;
  const gut = gutter ?? 16 * lineHeight * 0.5;
  const itemW = itemWidth ?? Math.max(cw, Math.round(300 / cw) * cw);

  // Header spacing, derived exactly as the source does from a 16px base.
  const sA = 16 * lineHeight * 0.5; // gutter unit
  const sE = 16 * lineHeight * 3; // title max height
  const sD = sE + sA + 16 * lineHeight; // author + title block
  const sB = fontSize * lineHeight + sA + sD; // header content height
  const sC = sB + 2 * sA; // padding above the header content
  const headerH = headerHeight ?? 2 * sB + 3 * sA;

  const totalWidth = itemW * (cols.length + 1);

  // ---- the noise field (canvas), re-sampled at the scroll offset every frame
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nX = new Noise(Math.random());
    const nY = new Noise(Math.random());
    const nAmp = new Noise(Math.random());
    const font = `${fontSize}px ${monoFamily}`;
    const perLine = Math.max(1, Math.floor((itemW - gut) / cw));
    const layout: LaidOutColumn[] = cols.map((it, i) => ({
      textLeft: itemW * i + gut,
      textWidth: itemW - gut,
      lines: wrap(it.text, perLine),
      url: it.url ?? null,
    }));

    let cssW = 0;
    let cssH = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = root.getBoundingClientRect();
      cssW = rect.width;
      cssH = Math.max(0, rect.height - headerH);
      // canvas is a replaced element: pin its CSS size explicitly, or width:auto
      // resolves to the (dpr-scaled) backing size and glyphs render dpr x too big.
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
    };

    const sampleAt = (vx: number, y: number): [string, string | null] => {
      if (y < 0) return [" ", null];
      const col = layout.find(
        (c) => vx >= c.textLeft && vx < c.textLeft + c.textWidth,
      );
      if (!col) return [" ", null];
      const row = Math.floor(y / ch);
      if (row >= col.lines.length) return [" ", col.url];
      const lineText = col.lines[row];
      const idx = snapFloor((vx - col.textLeft) / cw);
      if (idx < 0 || idx >= lineText.length) return [" ", col.url];
      return [lineText[idx], col.url];
    };

    const displace = (x: number, y: number, t: number): [number, number] => {
      const o = Math.max(cssW, cssH) || 1;
      const mask = clamp(norm(ch, cssH, y), 0, 1) ** 2;
      const amp = map(
        nAmp.simplex3((x / o) * 3, (y / o) * 3 - 0.1 * t, 0.03 * t) ** 2,
        -1,
        1,
        -1,
        4,
      );
      const sx = (x / o - 0.5) * amp * 2;
      const sy = (y / o - 0.5) * amp - 0.08 * t;
      const sz = 0.1 * t;
      return [
        nX.simplex3(sx, sy, sz) * magnitude * mask * 2,
        nY.simplex3(sx, sy, sz) * magnitude * mask,
      ];
    };

    let raf = 0;
    const render = () => {
      const t = (performance.now() / 1000) * speed;
      const dpr = window.devicePixelRatio || 1;
      const scrollX = scrollXRef.current;
      const active = hoverRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.textBaseline = "top";
      ctx.font = font;

      // Phase-align the grid to the scroll offset (no slow catch-up loop).
      let startX = (gut - scrollX) % cw;
      if (startX > 0) startX -= cw;

      for (let py = 0; py < cssH; py += ch) {
        let run = "";
        let runColor = textColor;
        let runX = startX;
        for (let gx = startX; gx < cssW; gx += cw) {
          const [dx, dy] = displace(gx, py, t);
          const [char, url] = sampleAt(gx + scrollX + dx, py + dy);
          const color = url != null && url === active ? accentColor : textColor;
          if (color !== runColor) {
            ctx.fillStyle = runColor;
            ctx.fillText(run.toUpperCase(), runX, py);
            runX = gx;
            run = "";
            runColor = color;
          }
          run += char;
        }
        ctx.fillStyle = runColor;
        ctx.fillText(run.toUpperCase(), runX, py);
      }
      ctx.restore();
      raf = requestAnimationFrame(render);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [
    cols,
    cw,
    ch,
    itemW,
    gut,
    headerH,
    background,
    textColor,
    accentColor,
    monoFamily,
    fontSize,
    speed,
    magnitude,
  ]);

  // ---- horizontal scroll (drag + wheel), hover, and tap-to-select
  useEffect(() => {
    const scroller = scrollerRef.current;
    const headerInner = headerInnerRef.current;
    if (!scroller) return;

    const itemAt = (clientX: number) => {
      const rect = scroller.getBoundingClientRect();
      const x = clientX - rect.left + scroller.scrollLeft;
      const idx = Math.floor(x / itemW);
      return idx >= 0 && idx < cols.length ? { item: cols[idx], idx } : null;
    };

    const onScroll = () => {
      scrollXRef.current = scroller.scrollLeft;
      if (headerInner) {
        headerInner.style.transform = `translateX(${-scroller.scrollLeft}px)`;
      }
    };
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (d !== 0) {
        scroller.scrollLeft += d;
        e.preventDefault();
      }
    };

    let dragging = false;
    let startClientX = 0;
    let startScroll = 0;
    let moved = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      startClientX = e.clientX;
      startScroll = scroller.scrollLeft;
      moved = 0;
      scroller.setPointerCapture?.(e.pointerId);
      if (hoverHighlight) scroller.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (hoverHighlight) {
        const url = itemAt(e.clientX)?.item.url ?? null;
        hoverRef.current = url;
        setHover(url);
      }
      if (dragging) {
        const dx = e.clientX - startClientX;
        moved = Math.max(moved, Math.abs(dx));
        scroller.scrollLeft = startScroll - dx;
      }
    };
    const onUp = (e: PointerEvent) => {
      if (dragging && moved < 6) {
        const hit = itemAt(e.clientX);
        if (hit?.item.url) onSelect?.(hit.item.url, hit.item, hit.idx);
      }
      dragging = false;
      if (hoverHighlight) scroller.style.cursor = "grab";
      try {
        scroller.releasePointerCapture?.(e.pointerId);
      } catch {}
    };
    const onLeave = () => {
      hoverRef.current = null;
      setHover(null);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("wheel", onWheel, { passive: false });
    scroller.addEventListener("pointerdown", onDown);
    scroller.addEventListener("pointermove", onMove);
    scroller.addEventListener("pointerup", onUp);
    scroller.addEventListener("pointercancel", onUp);
    scroller.addEventListener("pointerleave", onLeave);
    onScroll();

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("pointerdown", onDown);
      scroller.removeEventListener("pointermove", onMove);
      scroller.removeEventListener("pointerup", onUp);
      scroller.removeEventListener("pointercancel", onUp);
      scroller.removeEventListener("pointerleave", onLeave);
    };
  }, [cols, itemW, hoverHighlight, onSelect]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: headerH,
          left: 0,
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          ref={headerInnerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: totalWidth,
            willChange: "transform",
          }}
        >
          {cols.map((it, i) => (
            <div
              key={it.url}
              style={{
                position: "absolute",
                top: 0,
                left: itemW * i,
                width: itemW,
                height: headerH,
                paddingTop: sC,
                paddingLeft: 8,
                boxSizing: "border-box",
                color: hover === it.url ? accentColor : textColor,
              }}
            >
              <div
                style={{ height: sB, display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    fontFamily: monoFamily,
                    fontSize,
                    lineHeight: 1.3,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {it.label ?? (it.isNew ? "NEW" : "")}
                </div>
                <div
                  style={{
                    height: sD,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    overflow: "hidden",
                  }}
                >
                  {it.author ? (
                    <div
                      style={{
                        fontFamily: serifFamily,
                        fontSize: 16,
                        lineHeight: 1.2,
                        marginBottom: 6,
                      }}
                    >
                      {it.author}
                    </div>
                  ) : null}
                  {it.title ? (
                    <div
                      style={{
                        fontFamily: serifFamily,
                        fontSize: 19,
                        lineHeight: 1.18,
                        maxHeight: sE,
                        overflow: "hidden",
                      }}
                    >
                      {formatTitle(it.title, it.subtitle)}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        ref={scrollerRef}
        style={{
          position: "absolute",
          inset: 0,
          overflowX: "auto",
          overflowY: "hidden",
          cursor: hoverHighlight ? "grab" : "default",
          touchAction: "pan-x",
        }}
      >
        <div style={{ width: totalWidth, height: 1 }} />
      </div>
    </div>
  );
}

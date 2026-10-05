/**
 * Fits typed text into the box at the largest size that wraps, then gives each
 * letter a loose but repeatable pose: its own size, tilt and lift, seeded by the
 * letter's id so it keeps them while other letters come and go.
 */
import type { Pose } from "./engine";
import type { GlyphSkeleton } from "./skeleton";

export type Item =
  | { kind: "glyph"; id: number; skeleton: GlyphSkeleton }
  | { kind: "space"; id: number }
  | { kind: "newline"; id: number };

export interface Slot {
  x: number;
  y: number;
  /** Line height at this slot, px. */
  h: number;
}

export interface Layout {
  poses: Map<number, Pose>;
  /** Caret position before item i; slots[items.length] is the end of the text. */
  slots: Slot[];
  /** Pixels per em before jitter. */
  size: number;
}

export interface LayoutOptions {
  /** How much larger than their slot letters are built, so they sit pressed together. */
  squeeze: number;
  /** Allow breaking a word between letters when keeping it whole would shrink the letters a lot (narrow boxes). */
  breakWords: boolean;
}

const SPACE = 0.3;
const GAP = 0.02;
const LINE_GAP = 0.02;
const EMPTY_TOP = -0.74;
const EMPTY_BOTTOM = 0.12;

function hash(n: number) {
  let t = (n * 0x9e3779b9 + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** A letter's personality, fixed for its lifetime. */
export function profile(id: number) {
  const sign = id % 2 ? 1 : -1;
  return {
    scale: 0.9 + hash(id * 3 + 1) * 0.22,
    angle: sign * (0.06 + hash(id * 3 + 2) * 0.16),
    lift: (hash(id * 3 + 3) - 0.5) * 0.08,
  };
}

interface Measured {
  item: Item;
  /** Footprint along the line, em. */
  width: number;
  top: number;
  bottom: number;
}

function measure(item: Item): Measured {
  if (item.kind !== "glyph")
    return {
      item,
      width: item.kind === "space" ? SPACE : 0,
      top: EMPTY_TOP,
      bottom: EMPTY_BOTTOM,
    };
  const p = profile(item.id);
  const b = item.skeleton.bounds;
  const w = (b.maxX - b.minX) * p.scale;
  const h = (b.maxY - b.minY) * p.scale;
  const centre = ((b.minY + b.maxY) / 2) * p.scale;
  return {
    item,
    width: w * Math.cos(p.angle) + Math.abs(Math.sin(p.angle)) * h * 0.4,
    top: centre - h / 2 + p.lift,
    bottom: centre + h / 2 + p.lift,
  };
}

/** Greedy word wrap at a width limit in em; with `breakWords`, a word longer than a line breaks between letters. */
function wrap(measured: Measured[], limit: number, breakWords: boolean) {
  const lines: Measured[][] = [[]];
  let width = 0;
  let word: Measured[] = [];
  const wordWidth = (w: Measured[]) =>
    w.reduce((s, m, i) => s + m.width + (i ? GAP : 0), 0);
  const flush = () => {
    if (!word.length) return;
    let line = lines[lines.length - 1];
    const ww = wordWidth(word);
    const lead = line.length ? GAP : 0;
    if (line.length && width + lead + ww > limit) {
      line = [];
      lines.push(line);
      width = 0;
    }
    for (const m of word) {
      const step = (line.length ? GAP : 0) + m.width;
      // Only a word longer than a whole line gets here: break it between letters.
      if (breakWords && line.length && width + step > limit) {
        line = [];
        lines.push(line);
        width = 0;
      }
      width += (line.length ? GAP : 0) + m.width;
      line.push(m);
    }
    word = [];
  };
  for (const m of measured) {
    if (m.item.kind === "glyph") {
      word.push(m);
      continue;
    }
    flush();
    const line = lines[lines.length - 1];
    if (m.item.kind === "newline") {
      line.push(m);
      lines.push([]);
      width = 0;
    } else if (line.length) {
      line.push(m);
      width += m.width;
    } else line.push(m);
  }
  flush();
  return lines;
}

function lineMetrics(line: Measured[]) {
  const glyphs = line.filter((m) => m.item.kind === "glyph");
  const width = line.reduce(
    (s, m, i) =>
      s +
      m.width +
      (i && m.item.kind === "glyph" && line[i - 1].item.kind === "glyph"
        ? GAP
        : 0),
    0,
  );
  // Trailing spaces do not count toward centring.
  let trailing = 0;
  for (let i = line.length - 1; i >= 0 && line[i].item.kind !== "glyph"; i--)
    trailing += line[i].width;
  return {
    width: width - trailing,
    top: glyphs.length ? Math.min(...glyphs.map((m) => m.top)) : EMPTY_TOP,
    bottom: glyphs.length
      ? Math.max(...glyphs.map((m) => m.bottom))
      : EMPTY_BOTTOM,
  };
}

export function layoutText(
  items: Item[],
  width: number,
  height: number,
  options: LayoutOptions,
): Layout {
  const pad = Math.max(9, Math.min(width, height) * 0.013);
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const measured = items.map(measure);
  const fits = (size: number, breakWords: boolean) => {
    const lines = wrap(measured, innerW / size, breakWords);
    const metrics = lines.map(lineMetrics);
    const total =
      metrics.reduce((s, m) => s + m.bottom - m.top, 0) +
      LINE_GAP * (lines.length - 1);
    return (
      Math.max(...metrics.map((m) => m.width)) * size <= innerW &&
      total * size <= innerH
    );
  };
  // Every dimension scales with size, so the largest size that fits is a binary search.
  const largest = (breakWords: boolean) => {
    let lo = 4;
    let hi = Math.max(lo, innerH * 1.4);
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (fits(mid, breakWords)) lo = mid;
      else hi = mid;
    }
    return lo;
  };
  // Words stay whole unless that would make the letters much smaller (a long word in a
  // narrow box): then breaking between letters keeps them big, as on a phone.
  const whole = largest(false);
  const broken = options.breakWords ? largest(true) : whole;
  const breakWords = whole < broken * 0.6;
  const fitted = breakWords ? broken : whole;
  // An empty box still needs a sensible caret height.
  const size = items.some((i) => i.kind === "glyph")
    ? fitted
    : Math.min(fitted, innerH * 0.4);
  const lines = wrap(measured, innerW / size, breakWords);
  const metrics = lines.map(lineMetrics);
  const total =
    (metrics.reduce((s, m) => s + m.bottom - m.top, 0) +
      LINE_GAP * (lines.length - 1)) *
    size;

  const poses = new Map<number, Pose>();
  const slotOf = new Map<number, Slot>();
  const after = new Map<number, Slot>();
  let top = (height - total) / 2;
  lines.forEach((line, row) => {
    const m = metrics[row];
    const baseline = top - m.top * size;
    const lineH = (m.bottom - m.top) * size;
    const midY = top + lineH / 2;
    let x = (width - m.width * size) / 2;
    line.forEach((entry, i) => {
      if (i && entry.item.kind === "glyph" && line[i - 1].item.kind === "glyph")
        x += GAP * size;
      slotOf.set(entry.item.id, { x, y: midY, h: lineH });
      const w = entry.width * size;
      if (entry.item.kind === "glyph") {
        const p = profile(entry.item.id);
        const b = entry.item.skeleton.bounds;
        // A gentle wave across the line, so rows do not read as typeset.
        const seam =
          Math.sin((x / width) * Math.PI * 1.65 - 0.55) * lineH * 0.05;
        poses.set(entry.item.id, {
          x: x + w / 2,
          y:
            baseline +
            (((b.minY + b.maxY) / 2) * p.scale + p.lift) * size +
            seam,
          size: size * p.scale * options.squeeze,
          angle: p.angle,
        });
      }
      x += w;
      after.set(entry.item.id, { x, y: midY, h: lineH });
      if (entry.item.kind === "newline") {
        const next = metrics[row + 1];
        const nextH = next ? (next.bottom - next.top) * size : lineH;
        const nextTop = top + lineH + LINE_GAP * size;
        const nextX = next ? (width - next.width * size) / 2 : width / 2;
        after.set(entry.item.id, {
          x: nextX,
          y: nextTop + nextH / 2,
          h: nextH,
        });
      }
    });
    top += lineH + LINE_GAP * size;
  });

  const empty: Slot = {
    x: width / 2,
    y: height / 2,
    h: (EMPTY_BOTTOM - EMPTY_TOP) * size,
  };
  const slots: Slot[] = items.map(
    (item, i) =>
      slotOf.get(item.id) ??
      (i ? (after.get(items[i - 1].id) ?? empty) : empty),
  );
  slots.push(
    items.length ? (after.get(items[items.length - 1].id) ?? empty) : empty,
  );
  return { poses, slots, size };
}

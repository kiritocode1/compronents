"use client";

import { type CSSProperties, useEffect, useRef } from "react";

/*
 * Growth Clock: the ones digit of the wall-clock seconds, drawn as closed
 * loops that grow by differential growth. Port of "Growth" from
 * kitasenjudesign.com/clock (#02_growth) without its GUI, HUD and keyboard
 * shortcuts.
 *
 * Each digit is rasterised, its outline and holes traced into up to three
 * loops, and every loop resampled to a fixed node count so any digit morphs
 * 1:1 into any other. Each frame splits long edges and randomly inserts
 * nodes, then relaxes them with spring, align and grid-bucketed repulsion
 * forces plus a decaying random kick, confined so growth cannot sink into the
 * glyph. When the second changes, every node eases onto the next digit in
 * 0.1 s, the grown nodes are dropped, the loops flash a fill, and growth
 * starts over. Constants, presets and drawing are the source's own.
 */

const MODES = ["outside", "free", "inside"] as const;
export type GrowthClockMode = (typeof MODES)[number];

/** Every value the source exposes on its GUI, at its defaults. */
export interface GrowthClockSettings {
  /** outside: growth may not sink more than `erode` into the glyph. inside: may not leave it by more than `dilate`. */
  mode: GrowthClockMode;
  fontPx: number;
  erode: number;
  dilate: number;
  /** Rest edge length. */
  L: number;
  /** Split edges longer than L * split. */
  split: number;
  /** Repulsion radius, also the grid cell size. */
  R: number;
  kSpring: number;
  kAlign: number;
  kRep: number;
  maxStep: number;
  /** Random insertion probability per edge per step. */
  pInsert: number;
  maxN: number;
  /** Simulation steps per frame. */
  steps: number;
  /** Stroke width in CSS px. */
  lineW: number;
  /** Quadratic curves through edge midpoints instead of a polyline. */
  smooth: boolean;
  /** Crosshair through the centre. */
  guide: boolean;
  /** Fill the loops when the second changes. */
  fill: boolean;
  fillColor: string;
  fillAlpha: number;
  /** Seconds the fill takes to fade after the morph. */
  fillFade: number;
  /** Speed of the random kick given to every node at the start of a digit. */
  v0: number;
  damping: number;
  /** Seconds the morph to the next digit takes. */
  morphSec: number;
}

export interface GrowthClockProps {
  /** Overrides for any value. They also win over the presets. */
  settings?: Partial<GrowthClockSettings>;
  /** Cycle the three scribble presets every 10 s, aligned to the clock. */
  presets?: boolean;
  /** Colour behind the clock. */
  background?: string;
  className?: string;
  style?: CSSProperties;
}

export const GROWTH_CLOCK_DEFAULTS: GrowthClockSettings = {
  mode: "outside",
  fontPx: 700,
  erode: 3,
  dilate: 14,
  L: 6,
  split: 1.6,
  R: 17,
  kSpring: 0.25,
  kAlign: 0.35,
  kRep: 0.6,
  maxStep: 1.2,
  pInsert: 0.0025,
  maxN: 8000,
  steps: 1,
  lineW: 1.1,
  smooth: true,
  guide: true,
  fill: true,
  fillColor: "#ffffff",
  fillAlpha: 0.2,
  fillFade: 0.3,
  v0: 5,
  damping: 0.95,
  morphSec: 0.1,
};

// Applied in turn every 10 s: :00-:09 -> 0, :10-:19 -> 1, :20-:29 -> 2, ...
const PRESETS: Partial<GrowthClockSettings>[] = [
  {
    mode: "outside",
    v0: 5,
    damping: 0.95,
    pInsert: 0.0025,
    L: 6,
    R: 17,
    kRep: 0.6,
    kAlign: 0.35,
    maxStep: 1.2,
  },
  {
    mode: "outside",
    v0: 8,
    damping: 0.9,
    pInsert: 0.0025,
    L: 6,
    R: 14,
    kRep: 0.6,
    kAlign: 0.35,
    maxStep: 1.2,
  },
  {
    mode: "outside",
    v0: 12,
    damping: 0.85,
    pInsert: 0.0025,
    L: 6,
    R: 12,
    kRep: 0.6,
    kAlign: 0.35,
    maxStep: 1.2,
  },
];

// World units: the glyph sits in a WORLD x WORLD square.
const WORLD = 1000;
const DIGITS = "0123456789";
const CAP_N = 60000;
const MIN_R = 3;
const SLOTS = 3;
const BACKGROUND = "#0e0e0e";
const STROKE = "#efe9da";
const GUIDE = "rgba(239, 233, 218, 0.18)";

type Shape = { x: Float32Array; y: Float32Array };
type Bitmap = Uint8Array;

/**
 * Starts the clock on `canvas`. Returns controls the component wires to
 * resize, visibility and click; `dispose` stops everything.
 */
function createGrowthClock(
  canvas: HTMLCanvasElement,
  overrides: Partial<GrowthClockSettings>,
  presets: boolean,
  background: string,
  reducedMotion: () => boolean,
) {
  const P: GrowthClockSettings = { ...GROWTH_CLOCK_DEFAULTS, ...overrides };
  let presetIdx = -1;
  const presetFor = () =>
    Math.floor(new Date().getSeconds() / 10) % PRESETS.length;
  const applyPreset = (i: number) => {
    presetIdx = i;
    Object.assign(P, PRESETS[i], overrides);
  };

  // ---- buffers (preallocated at capacity, no per-frame allocation) ----
  let X = new Float32Array(CAP_N);
  let Y = new Float32Array(CAP_N);
  let X2 = new Float32Array(CAP_N);
  let Y2 = new Float32Array(CAP_N);
  // home = where the node belongs on the target outline (inserted nodes take the midpoint)
  let HX = new Float32Array(CAP_N);
  let HY = new Float32Array(CAP_N);
  let HX2 = new Float32Array(CAP_N);
  let HY2 = new Float32Array(CAP_N);
  // 1 = default node of the outline: never removed, returns exactly to its home
  let O = new Uint8Array(CAP_N);
  let O2 = new Uint8Array(CAP_N);
  // velocity: only carries the random kick, decays by P.damping every step
  let VX = new Float32Array(CAP_N);
  let VY = new Float32Array(CAP_N);
  let VX2 = new Float32Array(CAP_N);
  let VY2 = new Float32Array(CAP_N);
  const FX = new Float32Array(CAP_N);
  const FY = new Float32Array(CAP_N);
  // positions at the start of a morph
  const SX = new Float32Array(CAP_N);
  const SY = new Float32Array(CAP_N);
  const GMAX = Math.ceil(WORLD / MIN_R);
  const head = new Int32Array(GMAX * GMAX);
  const nextI = new Int32Array(CAP_N);
  let n = 0;

  // ---- loops ----
  // Every digit is up to 3 closed loops: outer outline, upper hole, lower hole.
  // All 3 always exist in the arrays (contiguous, in slot order); a slot the
  // digit lacks is hidden: collapsed to a point, not simulated, not drawn.
  let LID = new Uint8Array(CAP_N);
  let LID2 = new Uint8Array(CAP_N);
  const LS = new Int32Array(SLOTS);
  const LE = new Int32Array(SLOTS);
  let vis = [true, false, false];
  let visNext = vis;

  function ranges() {
    let i = 0;
    for (let l = 0; l < SLOTS; l++) {
      LS[l] = i;
      while (i < n && LID[i] === l) i++;
      LE[l] = i;
    }
  }

  // ---- glyphs ----
  function rasterize(ch: string, dilate: number): Bitmap {
    const cv = document.createElement("canvas");
    cv.width = cv.height = WORLD;
    const g = cv.getContext("2d", { willReadFrequently: true });
    if (!g) return new Uint8Array(WORLD * WORLD);
    g.font = `900 ${P.fontPx}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    const m = g.measureText(ch);
    const x =
      WORLD / 2 + (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2;
    const y =
      WORLD / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    g.fillStyle = g.strokeStyle = "#fff";
    g.fillText(ch, x, y);
    if (dilate !== 0) {
      // negative = erode: cut the stroke away from the fill
      if (dilate < 0) g.globalCompositeOperation = "destination-out";
      g.lineJoin = "round";
      g.lineWidth = Math.abs(dilate) * 2;
      g.strokeText(ch, x, y);
    }
    const d = g.getImageData(0, 0, WORLD, WORLD).data;
    const bin = new Uint8Array(WORLD * WORLD);
    for (let i = 0; i < bin.length; i++) bin[i] = d[i * 4 + 3] > 127 ? 1 : 0;
    return bin;
  }

  // Moore-neighbour contour tracing (clockwise, y down), Jacob's stopping criterion
  function trace(bin: Bitmap): number[] {
    const W = WORLD;
    const H = WORLD;
    const s = bin.indexOf(1);
    if (s < 0) return [];
    const DX = [-1, -1, 0, 1, 1, 1, 0, -1];
    const DY = [0, -1, -1, -1, 0, 1, 1, 1];
    const DIR = new Int8Array(9);
    for (let d = 0; d < 8; d++) DIR[(DX[d] + 1) * 3 + DY[d] + 1] = d;
    const sx = s % W;
    const sy = (s / W) | 0;
    let px = sx;
    let py = sy;
    let bd = 0;
    let firstD = -1;
    const pts: number[] = [];
    for (let it = 0; it < 1e6; it++) {
      let found = -1;
      for (let k = 1; k <= 8; k++) {
        const d = (bd + k) & 7;
        const nx = px + DX[d];
        const ny = py + DY[d];
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && bin[ny * W + nx]) {
          found = d;
          break;
        }
      }
      if (found < 0) break;
      if (px === sx && py === sy) {
        if (firstD < 0) firstD = found;
        else if (found === firstD) break;
      }
      const pd = (found + 7) & 7;
      const bx = px + DX[pd];
      const by = py + DY[pd];
      px += DX[found];
      py += DY[found];
      bd = DIR[(bx - px + 1) * 3 + by - py + 1];
      pts.push(px + 0.5, py + 0.5);
    }
    return pts;
  }

  // Background regions not touching the border = holes (0, 4, 6, 8, 9), one
  // bitmap each, in scan order (topmost first)
  function holes(bin: Bitmap): Bitmap[] {
    const W = WORLD;
    const N = W * W;
    const lab = new Int32Array(N);
    const stack = new Int32Array(N);
    const out: Bitmap[] = [];
    let id = 0;
    for (let s = 0; s < N; s++) {
      if (bin[s] || lab[s]) continue;
      id++;
      let sp = 0;
      let border = false;
      let count = 0;
      stack[sp++] = s;
      lab[s] = id;
      while (sp) {
        const i = stack[--sp];
        const x = i % W;
        const y = (i / W) | 0;
        count++;
        if (x === 0 || y === 0 || x === W - 1 || y === W - 1) border = true;
        if (x > 0 && !bin[i - 1] && !lab[i - 1]) {
          lab[i - 1] = id;
          stack[sp++] = i - 1;
        }
        if (x < W - 1 && !bin[i + 1] && !lab[i + 1]) {
          lab[i + 1] = id;
          stack[sp++] = i + 1;
        }
        if (y > 0 && !bin[i - W] && !lab[i - W]) {
          lab[i - W] = id;
          stack[sp++] = i - W;
        }
        if (y < W - 1 && !bin[i + W] && !lab[i + W]) {
          lab[i + W] = id;
          stack[sp++] = i + W;
        }
      }
      if (!border && count > 30) {
        const h = new Uint8Array(N);
        for (let i = 0; i < N; i++) h[i] = lab[i] === id ? 1 : 0;
        out.push(h);
      }
    }
    return out;
  }

  // moving average over a closed loop of [x, y, x, y, ...]
  function smoothLoop(pts: number[]): number[] {
    const m = pts.length >> 1;
    const win = 4;
    const out: number[] = new Array(m * 2);
    for (let i = 0; i < m; i++) {
      let ax = 0;
      let ay = 0;
      for (let k = -win; k <= win; k++) {
        const j = (i + k + m) % m;
        ax += pts[j * 2];
        ay += pts[j * 2 + 1];
      }
      out[i * 2] = ax / (win * 2 + 1);
      out[i * 2 + 1] = ay / (win * 2 + 1);
    }
    return out;
  }

  function perimeter(loop: number[]) {
    const m = loop.length >> 1;
    let s = 0;
    for (let i = 0; i < m; i++) {
      const j = (i + 1) % m;
      s += Math.hypot(
        loop[j * 2] - loop[i * 2],
        loop[j * 2 + 1] - loop[i * 2 + 1],
      );
    }
    return s;
  }

  // exactly N points evenly spaced along the loop
  function resample(loop: number[], N: number): Shape {
    const m = loop.length >> 1;
    const step = perimeter(loop) / N;
    const x = new Float32Array(N);
    const y = new Float32Array(N);
    let k = 0;
    let carry = 0;
    for (let i = 0; i < m && k < N; i++) {
      const j = (i + 1) % m;
      const dx = loop[j * 2] - loop[i * 2];
      const dy = loop[j * 2 + 1] - loop[i * 2 + 1];
      const seg = Math.hypot(dx, dy);
      let t = carry;
      while (t < seg && k < N) {
        const u = t / seg;
        x[k] = loop[i * 2] + dx * u;
        y[k] = loop[i * 2 + 1] + dy * u;
        k++;
        t += step;
      }
      carry = t - seg;
    }
    for (; k < N; k++) {
      // float rounding guard
      x[k] = x[k - 1];
      y[k] = y[k - 1];
    }
    return { x, y };
  }

  // SHAPES[digit][slot] = outline resampled to NS[slot] points, or null if the
  // digit has no such loop. Each slot has the same default-node count in every
  // digit, so they morph 1:1.
  let SHAPES: (Shape | null)[][] = [];
  let NS = [0, 0, 0];
  function buildDigits() {
    const raw: number[][][] = [];
    const per: number[][] = [[], [], []];
    for (const ch of DIGITS) {
      const solid = rasterize(ch, 0);
      const loops = [smoothLoop(trace(solid))];
      for (const h of holes(solid).slice(0, SLOTS - 1))
        loops.push(smoothLoop(trace(h)));
      loops.forEach((l, k) => {
        per[k].push(perimeter(l));
      });
      raw.push(loops);
    }
    NS = per.map((p) =>
      p.length
        ? Math.max(8, Math.round(p.reduce((a, b) => a + b, 0) / p.length / P.L))
        : 8,
    );
    SHAPES = raw.map((loops) =>
      NS.map((N, k) => (loops[k] ? resample(loops[k], N) : null)),
    );
    maskCache = [];
  }

  function centroid(
    xs: Float32Array,
    ys: Float32Array,
    idx: (j: number) => number,
    count: number,
  ): [number, number] {
    let cx = 0;
    let cy = 0;
    for (let j = 0; j < count; j++) {
      cx += xs[idx(j)];
      cy += ys[idx(j)];
    }
    return [cx / count, cy / count];
  }

  // confinement bitmaps, built lazily per digit
  let maskCache: { mask: Bitmap; core: Bitmap }[] = [];
  let mask: Bitmap = new Uint8Array(0);
  let core: Bitmap = new Uint8Array(0);
  const buildMasks = (d: number) => ({
    mask: rasterize(DIGITS[d], P.dilate),
    core: rasterize(DIGITS[d], -P.erode),
  });
  function applyMasks(d: number) {
    if (!maskCache[d]) maskCache[d] = buildMasks(d);
    ({ mask, core } = maskCache[d]);
  }
  // build the remaining digits' masks one per idle slot, so digit changes don't hitch
  let disposed = false;
  function warmMasks(d = 0) {
    if (d >= DIGITS.length || disposed) return;
    const idle =
      window.requestIdleCallback ??
      ((f: () => void) => window.setTimeout(f, 50));
    idle(() => {
      if (disposed) return;
      if (!maskCache[d]) maskCache[d] = buildMasks(d);
      warmMasks(d + 1);
    });
  }

  // ---- clock / morph state ----
  let cur = 0;
  let target = 0;
  let morphing = false;
  let morphT0 = 0;
  let morphEndT = Number.NEGATIVE_INFINITY;
  const clockDigit = () => new Date().getSeconds() % 10;

  // independent random direction per node; hidden loops stay still
  function kick() {
    for (let i = 0; i < n; i++) {
      if (!vis[LID[i]]) {
        VX[i] = VY[i] = 0;
        continue;
      }
      const a = Math.random() * Math.PI * 2;
      VX[i] = Math.cos(a) * P.v0;
      VY[i] = Math.sin(a) * P.v0;
    }
  }

  function loadDigit(d: number) {
    const sh = SHAPES[d];
    const outer = sh[0] as Shape;
    const c = centroid(outer.x, outer.y, (j) => j, NS[0]);
    n = 0;
    for (let l = 0; l < SLOTS; l++) {
      const s = sh[l];
      for (let k = 0; k < NS[l]; k++, n++) {
        X[n] = HX[n] = s ? s.x[k] : c[0];
        Y[n] = HY[n] = s ? s.y[k] : c[1];
        O[n] = 1;
        LID[n] = l;
      }
    }
    ranges();
    vis = visNext = sh.map(Boolean);
    cur = target = d;
    morphing = false;
    applyMasks(d);
    kick();
  }

  // Retarget homes to digit d, loop by loop: defaults get its outline (rotated
  // to the closest match), grown nodes are spread on the chords between their
  // neighbouring defaults, so at the end of the morph they lie on the new
  // outline and can be dropped without a visible jump. A hole that appears
  // grows out of its own centre; one that disappears shrinks into its centre.
  function beginMorph(d: number, now: number) {
    const sh = SHAPES[d];
    visNext = sh.map(Boolean);
    for (let l = 0; l < SLOTS; l++) {
      const s = sh[l];
      const a0 = LS[l];
      const a1 = LE[l];
      const N = NS[l];
      if (!vis[l] && !s) continue;
      const D = new Int32Array(N);
      let c = 0;
      for (let i = a0; i < a1 && c < N; i++) if (O[i]) D[c++] = i;

      if (!vis[l] && s) {
        const p = centroid(s.x, s.y, (j) => j, N);
        for (let i = a0; i < a1; i++) {
          X[i] = HX[i] = p[0];
          Y[i] = HY[i] = p[1];
          VX[i] = VY[i] = 0;
        }
      }

      let bestK = 0;
      if (s && vis[l]) {
        let best = Number.POSITIVE_INFINITY;
        for (let k = 0; k < N; k++) {
          let e = 0;
          for (let j = 0; j < N; j += 4) {
            const t = (j + k) % N;
            const dx = HX[D[j]] - s.x[t];
            const dy = HY[D[j]] - s.y[t];
            e += dx * dx + dy * dy;
          }
          if (e < best) {
            best = e;
            bestK = k;
          }
        }
      }
      const p = s ? null : centroid(HX, HY, (j) => D[j], N);
      for (let j = 0; j < N; j++) {
        const t = (j + bestK) % N;
        HX[D[j]] = s ? s.x[t] : (p as [number, number])[0];
        HY[D[j]] = s ? s.y[t] : (p as [number, number])[1];
      }
      for (let j = 0; j < N; j++) {
        const a = D[j];
        const b = j === N - 1 ? a1 : D[j + 1];
        const bi = b === a1 ? D[0] : b;
        for (let i = a + 1; i < b; i++) {
          const f = (i - a) / (b - a);
          HX[i] = HX[a] + (HX[bi] - HX[a]) * f;
          HY[i] = HY[a] + (HY[bi] - HY[a]) * f;
        }
      }
      vis[l] = true; // draw it while it morphs, even if it is about to vanish
    }
    SX.set(X.subarray(0, n));
    SY.set(Y.subarray(0, n));
    target = d;
    morphing = true;
    morphT0 = now;
  }

  // time-based: ease every node from its start position to its home
  function stepMorph(now: number) {
    const t = Math.min(1, (now - morphT0) / (P.morphSec * 1000));
    const e = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
    for (let i = 0; i < n; i++) {
      X[i] = SX[i] + (HX[i] - SX[i]) * e;
      Y[i] = SY[i] + (HY[i] - SY[i]) * e;
    }
    if (t >= 1) finishMorph();
  }

  function finishMorph() {
    let m = 0;
    for (let i = 0; i < n; i++) if (O[i]) copy(i, m++);
    swap();
    n = m;
    ranges();
    vis = visNext;
    cur = target;
    morphing = false;
    morphEndT = performance.now();
    applyMasks(cur);
    kick();
  }

  // ---- simulation ----
  function relax() {
    const R = P.R;
    const R2 = R * R;
    const L = P.L;
    const G = Math.ceil(WORLD / R);
    const kS = P.kSpring;
    const kA = P.kAlign;
    const kR = P.kRep / R;
    const ms = P.maxStep;

    head.fill(-1, 0, G * G);
    for (let i = 0; i < n; i++) {
      if (!vis[LID[i]]) continue;
      let cx = (X[i] / R) | 0;
      let cy = (Y[i] / R) | 0;
      cx = cx < 0 ? 0 : cx >= G ? G - 1 : cx;
      cy = cy < 0 ? 0 : cy >= G ? G - 1 : cy;
      const c = cy * G + cx;
      nextI[i] = head[c];
      head[c] = i;
    }

    for (let i = 0; i < n; i++) {
      const l = LID[i];
      if (!vis[l]) {
        FX[i] = FY[i] = 0;
        continue;
      }
      const x = X[i];
      const y = Y[i];
      const a = i === LS[l] ? LE[l] - 1 : i - 1;
      const b = i === LE[l] - 1 ? LS[l] : i + 1;
      let fx = ((X[a] + X[b]) * 0.5 - x) * kA;
      let fy = ((Y[a] + Y[b]) * 0.5 - y) * kA;

      let dx = X[a] - x;
      let dy = Y[a] - y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1e-6) {
        const s = ((d - L) / d) * kS;
        fx += dx * s;
        fy += dy * s;
      }
      dx = X[b] - x;
      dy = Y[b] - y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1e-6) {
        const s = ((d - L) / d) * kS;
        fx += dx * s;
        fy += dy * s;
      }

      const cx = (x / R) | 0;
      const cy = (y / R) | 0;
      const x0 = cx > 0 ? cx - 1 : 0;
      const x1 = cx < G - 1 ? cx + 1 : G - 1;
      const y0 = cy > 0 ? cy - 1 : 0;
      const y1 = cy < G - 1 ? cy + 1 : G - 1;
      for (let gy = y0; gy <= y1; gy++) {
        const row = gy * G;
        for (let gx = x0; gx <= x1; gx++) {
          for (let j = head[row + gx]; j >= 0; j = nextI[j]) {
            if (j === i) continue;
            const rx = x - X[j];
            const ry = y - Y[j];
            const d2 = rx * rx + ry * ry;
            if (d2 < R2 && d2 > 1e-6) {
              const dd = Math.sqrt(d2);
              const s = ((R - dd) / dd) * kR;
              fx += rx * s;
              fy += ry * s;
            }
          }
        }
      }

      const m2 = fx * fx + fy * fy;
      if (m2 > ms * ms) {
        const s = ms / Math.sqrt(m2);
        fx *= s;
        fy *= s;
      }
      FX[i] = fx;
      FY[i] = fy;
    }

    const mode = MODES.indexOf(P.mode);
    const damp = P.damping;
    for (let i = 0; i < n; i++) {
      if (!vis[LID[i]]) continue;
      const vx = VX[i];
      const vy = VY[i];
      VX[i] = vx * damp;
      VY[i] = vy * damp;
      const nx = X[i] + FX[i] + vx;
      const ny = Y[i] + FY[i] + vy;
      let blocked = nx < 1 || ny < 1 || nx >= WORLD - 1 || ny >= WORLD - 1;
      if (!blocked) {
        const k = (ny | 0) * WORLD + (nx | 0);
        blocked = mode === 0 ? core[k] === 1 : mode === 2 && !mask[k];
      }
      if (blocked) {
        VX[i] = VY[i] = 0;
        continue;
      }
      X[i] = nx;
      Y[i] = ny;
    }
  }

  // Split long edges and randomly insert nodes; writes into the back buffers,
  // then swaps. Every existing node is always copied (the cap only limits
  // insertions), so no loop is cut.
  function grow() {
    const split2 = (P.L * P.split) ** 2;
    const pIns = P.pInsert;
    const maxN = P.maxN;
    let m = 0;
    for (let i = 0; i < n; i++) {
      const l = LID[i];
      const j = i === LE[l] - 1 ? LS[l] : i + 1;
      copy(i, m++);
      if (!vis[l] || m + (n - i) > maxN) continue;
      const dx = X[j] - X[i];
      const dy = Y[j] - Y[i];
      if (dx * dx + dy * dy > split2 || Math.random() < pIns) {
        X2[m] = X[i] + dx * 0.5;
        Y2[m] = Y[i] + dy * 0.5;
        HX2[m] = (HX[i] + HX[j]) * 0.5;
        HY2[m] = (HY[i] + HY[j]) * 0.5;
        VX2[m] = (VX[i] + VX[j]) * 0.5;
        VY2[m] = (VY[i] + VY[j]) * 0.5;
        O2[m] = 0;
        LID2[m] = l;
        m++;
      }
    }
    swap();
    n = m;
    ranges();
  }

  // front buffer node i -> back buffer slot m
  function copy(i: number, m: number) {
    X2[m] = X[i];
    Y2[m] = Y[i];
    HX2[m] = HX[i];
    HY2[m] = HY[i];
    VX2[m] = VX[i];
    VY2[m] = VY[i];
    O2[m] = O[i];
    LID2[m] = LID[i];
  }

  function swap() {
    [X, X2] = [X2, X];
    [Y, Y2] = [Y2, Y];
    [HX, HX2] = [HX2, HX];
    [HY, HY2] = [HY2, HY];
    [VX, VX2] = [VX2, VX];
    [VY, VY2] = [VY2, VY];
    [O, O2] = [O2, O];
    [LID, LID2] = [LID2, LID];
  }

  // ---- rendering ----
  const ctx = canvas.getContext("2d", { alpha: false });
  let dpr = 1;
  let scale = 1;
  let ox = 0;
  let oy = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    scale = (Math.min(canvas.width, canvas.height) / WORLD) * 0.94;
    ox = (canvas.width - WORLD * scale) / 2;
    oy = (canvas.height - WORLD * scale) / 2;
    draw();
  }

  function draw() {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (P.guide) {
      // crosshair through the world centre, across the whole canvas
      const cx = Math.round(ox + (WORLD / 2) * scale) + 0.5;
      const cy = Math.round(oy + (WORLD / 2) * scale) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, canvas.height);
      ctx.lineWidth = dpr;
      ctx.strokeStyle = GUIDE;
      ctx.stroke();
    }
    if (n < 2) return;
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
    ctx.beginPath();
    for (let l = 0; l < SLOTS; l++) {
      const a = LS[l];
      const e = LE[l];
      if (!vis[l] || e - a < 2) continue;
      if (P.smooth) {
        // quadratic beziers between edge midpoints, nodes as control points
        // (stays inside the control polygon, so no overshoot into neighbours)
        let mx = (X[e - 1] + X[a]) * 0.5;
        let my = (Y[e - 1] + Y[a]) * 0.5;
        ctx.moveTo(mx, my);
        for (let i = a; i < e; i++) {
          const j = i === e - 1 ? a : i + 1;
          mx = (X[i] + X[j]) * 0.5;
          my = (Y[i] + Y[j]) * 0.5;
          ctx.quadraticCurveTo(X[i], Y[i], mx, my);
        }
      } else {
        ctx.moveTo(X[a], Y[a]);
        for (let i = a + 1; i < e; i++) ctx.lineTo(X[i], Y[i]);
      }
      ctx.closePath();
    }
    // Fill only around the second change: solid while morphing, then fading
    // out. evenodd keeps the holes (0, 4, 6, 8, 9) empty.
    const fa = !P.fill
      ? 0
      : morphing
        ? 1
        : 1 - (performance.now() - morphEndT) / (P.fillFade * 1000);
    if (fa > 0 && P.fillAlpha > 0) {
      ctx.globalAlpha = P.fillAlpha * Math.min(1, fa);
      ctx.fillStyle = P.fillColor;
      ctx.fill("evenodd");
      ctx.globalAlpha = 1;
    }
    ctx.lineJoin = "round";
    ctx.lineWidth = (P.lineW * dpr) / scale;
    ctx.strokeStyle = STROKE;
    ctx.stroke();
  }

  // Reduced motion: the plain outline of the current digit, swapped each second.
  function still(d: number) {
    loadDigit(d);
    VX.fill(0, 0, n);
    VY.fill(0, 0, n);
  }

  let raf = 0;
  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (reducedMotion()) {
      const d = clockDigit();
      if (d !== cur || morphing) {
        still(d);
        draw();
      }
      return;
    }
    if (presets) {
      const p = presetFor();
      if (p !== presetIdx) applyPreset(p);
    }
    if (!morphing) {
      const d = clockDigit();
      if (d !== cur) beginMorph(d, now);
    }
    if (morphing) stepMorph(now);
    else {
      for (let s = 0; s < P.steps; s++) {
        if (n < P.maxN) grow();
        relax();
      }
    }
    draw();
  }

  function restart() {
    if (reducedMotion()) still(clockDigit());
    else loadDigit(clockDigit());
    draw();
  }

  buildDigits();
  resize();
  restart();
  warmMasks();

  return {
    resize,
    restart,
    start() {
      if (!raf && !disposed) raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

/**
 * The seconds digit of the wall clock as a growing scribble. Fills its
 * container; click to restart the current digit's growth.
 */
export default function GrowthClock({
  settings,
  presets = true,
  background = BACKGROUND,
  className,
  style,
}: GrowthClockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsKey = JSON.stringify(settings ?? {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clock = createGrowthClock(
      canvas,
      JSON.parse(settingsKey) as Partial<GrowthClockSettings>,
      presets,
      background,
      () => reduced.matches,
    );

    let onScreen = true;
    const sync = () => {
      if (onScreen && !document.hidden) clock.start();
      else clock.stop();
    };
    const resizeObserver = new ResizeObserver(() => clock.resize());
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    canvas.addEventListener("click", clock.restart);
    sync();

    return () => {
      clock.dispose();
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("click", clock.restart);
    };
  }, [settingsKey, presets, background]);

  return (
    <div
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
        role="img"
        aria-label="Clock showing the current second as a growing line drawing. Click to restart the growth."
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}

"use client";

import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

/*
 * Type Garden: type, and stems, leaves and roses grow through each letter.
 * Space cuts the last stem and sprouts a few roses from it, Backspace withers
 * the last letter, Enter clears the garden. Roses turn toward the pointer,
 * stems lean to it, and clicking the garden calls in a butterfly that lands
 * on the nearest rose. Port of type-garden.vercel.app's typing view without
 * its poster editor, mode switch, export and copy controls.
 *
 * Each letter is drawn with GT Ultra on a canvas. Its growth is generated
 * once when the key is pressed, from a seed shared by the whole word, as a
 * list of stems (woven over and under the letter), leaves and roses with a
 * delay each; every frame then draws that list at the letter's age. Growth
 * logic, timings, colours and palettes are the source's own.
 */

const ASSET_BASE = "https://ui.aryank.space/assets/type-garden";
const FONT = '"GT Ultra","Playfair Display",Georgia,serif';
const SENT = String.fromCharCode(0x200b); // kept in the hidden field so Backspace on an empty field still reports

// name, background, flower, stem & leaf, flower line, type
export const TYPE_GARDEN_PALETTES = [
  ["Rose noir", "#000000", "#FF1400", "#3257FF", "#FFB4A8", "#FFFFFF"],
  ["Paper", "#F3EEE4", "#FF3B1F", "#1C2B8F", "#FFD2C4", "#111111"],
  ["Midnight", "#0D1B4C", "#FF5A4E", "#9FB4FF", "#FFD6CF", "#FFFFFF"],
  ["Citrus", "#0E1A12", "#FF8A00", "#1FA463", "#FFE2B8", "#FFF6E8"],
  ["Orchid", "#140A1F", "#E63CFF", "#2FB8A6", "#F9D1FF", "#FFFFFF"],
  ["Moss", "#133A2A", "#FFB7C5", "#7FD18B", "#FFFFFF", "#F6F1E7"],
  ["Tomato", "#FF1400", "#FFF1E0", "#0B0B0B", "#FF1400", "#000000"],
  ["Butter", "#FFE9A8", "#E4002B", "#0F5132", "#FFC2C2", "#1A1A1A"],
  ["Blush", "#FAD4D8", "#C8102E", "#274690", "#FFE3E6", "#1A1A1A"],
  ["Mono", "#000000", "#F2F2F2", "#6E6E6E", "#000000", "#FFFFFF"],
] as const;

export interface TypeGardenProps {
  /** Index into TYPE_GARDEN_PALETTES to start on. The swatches change it. */
  palette?: number;
  /** Redraw the line work with a small jitter every 120 ms. Off under reduced motion. */
  boil?: boolean;
  /** How far, in px, a stem springs back when Space cuts it. */
  recoil?: number;
  /** Multiplier on leaves, extra stems and bridges between letters (0.5 to 1.6). */
  density?: number;
  /** Show the key hints and palette swatches along the bottom. */
  showHint?: boolean;
  /** Focus the hidden field on mount so typing works without a click first. */
  autoFocus?: boolean;
  className?: string;
  style?: CSSProperties;
}

type Pt = [number, number];
type Seg = { u0: number; u1: number; layer: number };
type Stem = {
  t: "stem";
  id: number;
  pts: Pt[];
  segs: Seg[];
  d0: number;
  dur: number;
  w: number;
  thorns: { u: number; s: number }[];
};
type Leaf = {
  t: "leaf";
  id: number;
  x: number;
  y: number;
  a: number;
  L: number;
  bend: number;
  layer: number;
  d0: number;
};
type Rose = {
  t: "rose";
  id: number;
  x: number;
  y: number;
  R: number;
  rot: number;
  ph1: number;
  ph2: number;
  turns: number;
  layer: number;
  d0: number;
};
type El = Stem | Leaf | Rose;
type Letter = {
  ch: string;
  id: number;
  birth: number;
  els: El[];
  tb?: number;
  ws?: number;
  wi?: number;
  prev?: Letter | null;
  endEls?: El[] | null;
  tend?: Stem[];
  dead?: number | null;
  cut?: number | null;
  x?: number;
  y?: number;
  tx?: number;
  ty?: number;
  tw?: number;
  line?: number;
  lean?: Pt;
};
type Colors = {
  red: string;
  blue: string;
  line: string;
  text: string;
  vein: string;
};
type Backend = {
  fill: (p: Pt[], col: string) => void;
  stroke: (p: Pt[], col: string, w: number) => void;
  rect: (x: number, y: number, w: number, h: number, col: string) => void;
  text: (ch: string, x: number, y: number, S: number, col: string) => void;
};
type WordParams = {
  roseP: number;
  leafy: number;
  dens: number;
  lean: number;
  big: number;
  curvy: number;
  bridgeP: number;
  w: number;
};
type GrowOpts = {
  base?: Pt;
  dir?: number;
  len?: number;
  pts?: Pt[];
  d0: number;
  depth?: number;
  layer0?: number;
  tip?: "rose" | "fan" | "leaf" | "curl" | null;
};
type Fly = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  st: "fly" | "wander" | "sit" | "leave";
  pid: number | null;
  hx: number;
  hy: number;
  t0: number;
  ph: number;
  sz: number;
  seed: number;
  ang: number;
  open?: number;
  ex?: number;
  ey?: number;
};
type SceneOptions = { boil: () => boolean; recoil: number; density: number };

// ---------- math ----------
const h = (n: number) => {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
};
const spr = (t: number, k = 7, w = 16) =>
  t <= 0 ? 0 : 1 - Math.exp(-t * k) * Math.cos(t * w);
const eo = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - (1 - t) ** 3);
function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = () => number;
function bez(a: Pt, b: Pt, c: Pt, d: Pt, n: number): Pt[] {
  const P: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    P.push([
      u * u * u * a[0] +
        3 * u * u * t * b[0] +
        3 * u * t * t * c[0] +
        t * t * t * d[0],
      u * u * u * a[1] +
        3 * u * u * t * b[1] +
        3 * u * t * t * c[1] +
        t * t * t * d[1],
    ]);
  }
  return P;
}
function at(P: Pt[], u: number): [Pt, number] {
  const n = P.length;
  const i = Math.min(n - 2, Math.max(1, Math.round(u * (n - 1))));
  return [
    P[i],
    Math.atan2(P[i + 1][1] - P[i - 1][1], P[i + 1][0] - P[i - 1][0]),
  ];
}
function jit(id: number, f: number, amp: number): [number, number, number] {
  if (!amp) return [0, 0, 0];
  return [
    (h(id * 1.37 + f * 7.13) * 2 - 1) * amp,
    (h(id * 2.71 + f * 3.11) * 2 - 1) * amp,
    (h(id * 5.3 + f * 1.7) * 2 - 1) * 0.035,
  ];
}
// quadratic curves through edge midpoints, points as control points
function path(c: CanvasRenderingContext2D, p: Pt[], closed: boolean) {
  const n = p.length;
  if (n < 2) return;
  const m = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (closed) {
    const s = m(p[n - 1], p[0]);
    c.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) {
      const q = m(p[i], p[(i + 1) % n]);
      c.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]);
    }
    c.closePath();
  } else {
    c.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < n - 1; i++) {
      const q = m(p[i], p[i + 1]);
      c.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]);
    }
    c.lineTo(p[n - 1][0], p[n - 1][1]);
  }
}
function backend(g: CanvasRenderingContext2D): Backend {
  return {
    fill: (p, col) => {
      g.beginPath();
      path(g, p, true);
      g.fillStyle = col;
      g.fill();
    },
    stroke: (p, col, w) => {
      g.beginPath();
      path(g, p, false);
      g.strokeStyle = col;
      g.lineWidth = w;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.stroke();
    },
    rect: (x, y, w, hh, col) => {
      g.fillStyle = col;
      g.fillRect(x, y, w, hh);
    },
    text: (ch, x, y, S, col) => {
      g.font = `700 ${S}px ${FONT}`;
      g.textAlign = "center";
      g.textBaseline = "alphabetic";
      g.fillStyle = col;
      g.fillText(ch, x, y);
    },
  };
}
function vine(
  base: Pt,
  dir: number,
  len: number,
  amp: number,
  waves: number,
  ph: number,
  bend: number,
  n = 40,
): Pt[] {
  const P: Pt[] = [[base[0], base[1]]];
  const step = len / n;
  let x = base[0];
  let y = base[1];
  for (let i = 1; i <= n; i++) {
    const u = i / n;
    const a =
      dir +
      bend * u +
      amp * Math.sin(u * Math.PI * waves + ph) * Math.min(1, u * 3);
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    P.push([x, y]);
  }
  return P;
}
function curl(P: Pt[], sign: number, rad: number): Pt[] {
  const n = P.length;
  const e = P[n - 1];
  const a = Math.atan2(e[1] - P[n - 2][1], e[0] - P[n - 2][0]);
  const c = [e[0] - Math.sin(a) * sign * rad, e[1] + Math.cos(a) * sign * rad];
  const a0 = Math.atan2(e[1] - c[1], e[0] - c[0]);
  for (let i = 1; i <= 14; i++) {
    const u = i / 14;
    const t = a0 + sign * u * Math.PI * 1.6;
    const rr = rad * (1 - 0.5 * u);
    P.push([c[0] + Math.cos(t) * rr, c[1] + Math.sin(t) * rr]);
  }
  return P;
}
// cut a stem into runs that alternate in front of and behind the letter
function weave(r: Rand, startLayer: number): Seg[] {
  const cuts: number[] = [];
  const nc = 1 + Math.floor(r() * 3);
  for (let i = 0; i < nc; i++) cuts.push(0.15 + r() * 0.7);
  cuts.sort((a, b) => a - b);
  const segs: Seg[] = [];
  let u0 = 0;
  let layer = startLayer;
  for (const c of cuts) {
    if (c <= u0) continue;
    segs.push({ u0, u1: c, layer });
    if (r() < 0.3) {
      const g = 0.02 + r() * 0.03;
      u0 = Math.min(0.98, c + g);
    } else u0 = c;
    layer = 1 - layer;
  }
  segs.push({ u0, u1: 1, layer });
  return segs;
}
function layerAt(segs: Seg[], u: number) {
  for (const s of segs) if (u >= s.u0 && u <= s.u1) return s.layer;
  return segs[segs.length - 1].layer;
}

/**
 * The garden itself: owns the canvas, the hidden field and every listener on
 * the component root. `dispose` removes them all.
 */
function createScene(
  root: HTMLDivElement,
  canvas: HTMLCanvasElement,
  fld: HTMLInputElement,
  opt: SceneOptions,
  initialPalette: number,
  autoFocus: boolean,
) {
  const g = canvas.getContext("2d") as CanvasRenderingContext2D;
  let letters: Letter[] = [];
  let uid = 1;
  let cache: Record<string, number> = {};
  let Sd = 0;
  let St = 0;
  let wrapped = false;
  const t0 = performance.now();
  let lastKey = 0;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let cx = 0;
  let cy = 0;
  let ctx_ = 0;
  let cty = 0;
  let lt = 0;
  let fl = 0;
  let palette = initialPalette;
  let cc: Colors = pal().C;
  let now_ = 0;
  const fa: Record<number, Pt> = {};
  let mx: number | null = null;
  let my = 0;
  let flies: Fly[] = [];
  let perch: { id: number; x: number; y: number; R: number }[] = [];
  const touch = !!window.matchMedia?.("(pointer: coarse)").matches;
  let ptype = "mouse";
  let composing = false;
  let kd = false;
  let iv = SENT;
  fld.value = SENT;

  function pal() {
    const p = TYPE_GARDEN_PALETTES[palette] ?? TYPE_GARDEN_PALETTES[0];
    return {
      bg: p[1],
      C: { red: p[2], blue: p[3], line: p[4], text: p[5], vein: p[1] },
    };
  }

  // ---------- butterflies ----------
  function spawnFly(x: number, y: number) {
    if (flies.length >= 6) {
      const o = flies.find((f) => f.st !== "leave");
      if (o) flyOff(o);
    }
    const taken = new Set(
      flies.filter((f) => f.st !== "leave").map((f) => f.pid),
    );
    let best: (typeof perch)[number] | null = null;
    let bd = 1e9;
    for (const p of perch) {
      if (taken.has(p.id)) continue;
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    const left = x < W / 2;
    const sz = Math.max(9, Sd * 0.09);
    flies.push({
      x: left ? -40 : W + 40,
      y: y + (Math.random() - 0.5) * H * 0.4,
      vx: 0,
      vy: 0,
      st: best ? "fly" : "wander",
      pid: best ? best.id : null,
      hx: x,
      hy: y,
      t0: performance.now(),
      ph: Math.random() * 6,
      sz,
      seed: Math.random() * 100,
      ang: 0,
    });
  }
  function flyOff(f: Fly) {
    f.st = "leave";
    f.pid = null;
    f.ex = f.x < W / 2 ? -80 : W + 80;
    f.ey = f.y - H * 0.3;
  }
  function drawFlies(B: Backend, now: number, C: Colors) {
    const dt = Math.min(48, now - (fl || now));
    fl = now;
    const byId: Record<number, (typeof perch)[number]> = {};
    for (const p of perch) byId[p.id] = p;
    flies = flies.filter((f) => {
      const t = (now - f.t0) / 1000;
      let tx = 0;
      let ty = 0;
      if (f.st === "sit" || f.st === "fly") {
        const p = f.pid == null ? undefined : byId[f.pid];
        if (!p) flyOff(f);
        else {
          tx = p.x + p.R * 0.05;
          ty = p.y - p.R * 0.55;
        }
      }
      if (f.st === "wander") {
        tx = f.hx + Math.sin(t * 1.3 + f.seed) * 70;
        ty = f.hy + Math.sin(t * 2.1 + f.seed) * 40;
        if (t > 3.5) flyOff(f);
      }
      if (f.st === "leave") {
        tx = f.ex as number;
        ty = f.ey as number;
      }
      if (f.st === "sit") {
        f.x += (tx - f.x) * 0.35;
        f.y += (ty - f.y) * 0.35;
        f.ang *= 0.85;
        f.ph += dt * 0.004;
        const burst = Math.sin((now / 1000) * 0.9 + f.seed) > 0.75;
        f.open = burst
          ? 0.2 + 0.8 * Math.abs(Math.cos((now / 1000) * 9 + f.seed))
          : 0.25 + 0.15 * Math.sin(f.ph);
      } else {
        const dx = tx - f.x;
        const dy = ty - f.y;
        const d = Math.hypot(dx, dy) || 1;
        const sp = f.st === "leave" ? 0.42 : Math.min(0.34, 0.06 + d * 0.0016);
        const flut = Math.sin(t * 7 + f.seed) * 0.12;
        const wob = Math.cos(t * 4.3 + f.seed) * 0.1;
        const ax = (dx / d) * sp + wob - f.vx;
        const ay = (dy / d) * sp + flut - f.vy;
        f.vx += (ax * 0.06 * dt) / 16;
        f.vy += (ay * 0.06 * dt) / 16;
        f.x += f.vx * dt;
        f.y += f.vy * dt + Math.sin(t * 13 + f.seed) * 0.6;
        f.ang += (Math.max(-0.5, Math.min(0.5, f.vx * 1.4)) - f.ang) * 0.1;
        f.open = Math.abs(Math.cos(t * 17 + f.seed));
        if (f.st === "fly" && d < 5) {
          f.st = "sit";
          f.ph = 0;
        }
        if (f.st === "leave" && (f.x < -60 || f.x > W + 60 || f.y < -60))
          return false;
      }
      butterfly(B, f.x, f.y, f.sz, f.ang, f.open as number, C);
      return true;
    });
  }
  function butterfly(
    B: Backend,
    x: number,
    y: number,
    s: number,
    ang: number,
    o: number,
    C: Colors,
  ) {
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const T = (px: number, py: number): Pt => [
      x + (px * ca - py * sa) * s,
      y + (px * sa + py * ca) * s,
    ];
    const wing = (
      wx: number,
      wy: number,
      rx: number,
      ry: number,
      a: number,
      side: number,
    ) => {
      const pts: Pt[] = [];
      const c = Math.cos(a);
      const sn = Math.sin(a);
      for (let k = 0; k < 22; k++) {
        const th = (k / 22) * Math.PI * 2;
        const r = 1 + 0.08 * Math.sin(th * 3);
        const lx = Math.cos(th) * rx * r;
        const ly = Math.sin(th) * ry * r;
        pts.push(
          T(
            side * (wx + lx * c - ly * sn) * (0.12 + 0.88 * o),
            wy + lx * sn + ly * c,
          ),
        );
      }
      return pts;
    };
    for (const sd of [-1, 1]) {
      B.fill(wing(0.46, 0.28, 0.36, 0.3, 0.5 * sd * sd, sd), C.text);
      B.fill(wing(0.55, -0.32, 0.55, 0.36, -0.55, sd), C.text);
      if (o > 0.35) B.fill(wing(0.66, -0.4, 0.13, 0.11, 0, sd), C.red);
    }
    const body: Pt[] = [];
    for (let k = 0; k < 18; k++) {
      const th = (k / 18) * Math.PI * 2;
      body.push(T(Math.cos(th) * 0.08, Math.sin(th) * 0.48));
    }
    B.fill(body, C.blue);
    const lw = Math.max(0.8, s * 0.05);
    B.stroke([T(0, -0.42), T(-0.14, -0.72), T(-0.24, -0.86)], C.blue, lw);
    B.stroke([T(0, -0.42), T(0.14, -0.72), T(0.24, -0.86)], C.blue, lw);
  }
  // roses ease their face toward the pointer
  function faceTurn(e: Rose, x: number, y: number): Pt {
    let wx = 0;
    let wy = 0;
    if (mx != null) {
      const dx = mx - x;
      const dy = my - y;
      const d = Math.hypot(dx, dy);
      const reach = 300;
      if (d < reach && d > 0.001) {
        const w = 1 - d / reach;
        const s = w * w * (3 - 2 * w) * Math.min(1, d / 40);
        wx = (dx / d) * s;
        wy = (dy / d) * s;
      }
    }
    const c = fa[e.id] || [0, 0];
    c[0] += (wx - c[0]) * 0.09;
    c[1] += (wy - c[1]) * 0.09;
    fa[e.id] = c;
    return c;
  }

  // ---------- layout ----------
  function resize() {
    const r = canvas.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    if (!r.width) return;
    W = r.width;
    H = r.height;
    dpr = d;
    canvas.width = Math.round(r.width * d);
    canvas.height = Math.round(r.height * d);
    layout(true);
  }
  function mw(ch: string) {
    if (cache[ch] != null) return cache[ch];
    g.font = `700 100px ${FONT}`;
    let w = g.measureText(ch).width / 100;
    if (ch === " ") w *= 1.4;
    cache[ch] = w;
    return w;
  }
  // sets tx/ty/tw on letters; keeps headroom for the garden above and below the type
  function layoutCore(A: Letter[], W: number, H: number, prevWrapped: boolean) {
    const maxW = W * 0.8;
    const S0 = H * 0.28;
    const LH = 2.1;
    const ws = A.map((l) => mw(l.ch));
    const words: { sp?: boolean; idx: number[] }[] = [];
    let cur: { idx: number[] } | null = null;
    A.forEach((l, i) => {
      if (l.ch === " ") {
        if (cur) {
          words.push(cur);
          cur = null;
        }
        words.push({ sp: true, idx: [i] });
      } else {
        if (!cur) cur = { idx: [] };
        cur.idx.push(i);
      }
    });
    if (cur) words.push(cur);
    const lineW = (li: number[], S: number) => {
      let e = li.length;
      while (e > 0 && A[li[e - 1]].ch === " ") e--;
      let w = 0;
      for (let k = 0; k < e; k++) w += ws[li[k]];
      return w * S;
    };
    const wrap = (S: number) => {
      const lines: number[][] = [[]];
      let lw = 0;
      for (const w of words) {
        const ww = w.idx.reduce((s, i) => s + ws[i], 0) * S;
        if (!w.sp && lw > 0 && lw + ww > maxW) {
          lines.push([]);
          lw = 0;
        }
        lines[lines.length - 1].push(...w.idx);
        lw += ww;
      }
      return lines;
    };
    let lines = [A.map((_, i) => i)];
    const unit = lineW(lines[0], 1);
    let S = unit > 0 ? Math.min(S0, maxW / unit) : S0;
    const multi = words.filter((w) => !w.sp).length > 1;
    let wrapped = multi && (S < H * 0.1 || (prevWrapped && S < H * 0.14));
    if (wrapped) {
      let lo = H * 0.03;
      let hi = H * 0.15;
      for (let k = 0; k < 22; k++) {
        const mid = (lo + hi) / 2;
        const ls = wrap(mid);
        const ok =
          ls.every((li) => lineW(li, mid) <= maxW) &&
          ls.length * LH * mid <= H * 0.82;
        if (ok) lo = mid;
        else hi = mid;
      }
      S = lo;
      lines = wrap(S);
      if (lines.length < 2) wrapped = false;
    }
    const n = lines.length;
    const lh = LH * S;
    lines.forEach((li, k) => {
      let x = W / 2 - lineW(li, S) / 2;
      const y = H / 2 + (k - (n - 1) / 2) * lh + 0.33 * S;
      for (const i of li) {
        const l = A[i];
        const w = ws[i] * S;
        l.tx = x + w / 2;
        l.ty = y;
        l.tw = w;
        l.line = k;
        x += w;
      }
    });
    return { S, wrapped, n };
  }
  function layout(snap?: boolean) {
    if (!W) return;
    const A = letters.filter((l) => !l.dead);
    const res = layoutCore(A, W, H, wrapped);
    wrapped = res.wrapped;
    for (const l of A) {
      if (l.x == null) {
        l.x = l.tx;
        l.y = l.ty;
      }
    }
    const S = res.S;
    const last = A[A.length - 1];
    St = S;
    ctx_ = last
      ? (last.tx as number) + (last.tw as number) / 2 + 0.07 * S
      : W / 2;
    cty = last ? (last.ty as number) - 0.33 * S : H / 2;
    if (snap || !Sd) {
      Sd = S;
      cx = ctx_;
      cy = cty;
      for (const l of A) {
        l.x = l.tx;
        l.y = l.ty;
      }
    }
  }

  // ---------- input ----------
  function refocus() {
    if (ptype === "mouse") fld.focus({ preventScroll: true });
  }
  function wither(now: number) {
    const A = letters.filter((l) => !l.dead);
    const last = A[A.length - 1];
    if (!last) return;
    last.dead = now;
    const pv = A[A.length - 2];
    if (pv && pv.ch !== " ") {
      pv.cut = null;
      pv.endEls = null;
      pv.tb = now;
    }
    layout();
  }
  // phone keyboards often skip real key events and write into the field instead, rewriting whole words while
  // they predict: mirror the field and apply the difference, new letters grow and removed ones wither
  function inputDiff(el: HTMLInputElement) {
    const S = SENT;
    if (kd) {
      iv = composing ? el.value : S;
      if (!composing) el.value = S;
      return;
    }
    const old = iv == null ? S : iv;
    const cur = el.value;
    let p = 0;
    while (p < old.length && p < cur.length && old[p] === cur[p]) p++;
    let dels = old.length - p;
    if (p === 0 && old[0] === S && old.length > 1) dels -= 1; // the sentinel is not a letter
    const now = performance.now();
    lastKey = now;
    for (let i = 0; i < dels; i++) wither(now);
    for (const ch of cur.slice(p)) {
      if (ch === S) continue;
      if (ch.charCodeAt(0) === 10) {
        letters = [];
        layout();
      } else add(ch, now);
    }
    if (composing) iv = cur;
    else {
      el.value = S;
      iv = S;
    }
  }
  function key(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.tagName === "BUTTON" &&
      (e.key === "Enter" || e.key === " ")
    )
      return;
    const now = performance.now();
    const A = letters.filter((l) => !l.dead);
    const last = A[A.length - 1];
    if (e.key === "Backspace") {
      e.preventDefault();
      mark();
      if (!last) return;
      last.dead = now;
      const pv = A[A.length - 2];
      if (pv && pv.ch !== " ") {
        pv.cut = null;
        pv.endEls = null;
        pv.tb = now;
      }
      layout();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      mark();
      letters = [];
      layout();
      return;
    }
    if (e.key.length !== 1) return;
    e.preventDefault();
    mark();
    add(e.key, now);
  }
  function mark() {
    lastKey = performance.now();
    kd = true;
    setTimeout(() => {
      kd = false;
    }, 0);
  }
  function add(ch: string, now: number) {
    const A = letters.filter((l) => !l.dead);
    const last = A[A.length - 1];
    if (ch === " ") {
      if (last && last.ch !== " ") {
        last.cut = now;
        genEnd(last, now - last.birth);
      }
      letters.push({ ch: " ", id: uid++, birth: now, els: [] });
      layout();
      return;
    }
    const same = !!last && last.ch !== " ";
    const l: Letter = {
      ch,
      id: uid++,
      birth: now,
      tb: now,
      ws: same ? last.ws : Math.floor(Math.random() * 1e9),
      wi: same ? (last.wi as number) + 1 : 0,
      prev: same ? last : null,
      els: [],
    };
    gen(l);
    letters.push(l);
    layout();
  }

  // ---------- growth ----------
  function wordParams(ws: number): WordParams {
    const r = rng(ws * 7 + 13);
    const dens = opt.density;
    return {
      roseP: 0.3 + r() * 0.3,
      leafy: (0.6 + r() * 0.8) * dens,
      dens,
      lean: (r() - 0.5) * 0.6,
      big: 0.85 + r() * 0.45,
      curvy: 0.8 + r() * 0.6,
      bridgeP: Math.min(0.95, (0.45 + r() * 0.35) * dens),
      w: 0.5,
    };
  }
  function grow(
    r: Rand,
    E: El[],
    nid: () => number,
    p: WordParams,
    o: GrowOpts,
  ): Pt[] {
    const tip =
      o.tip ||
      (r() < p.roseP
        ? "rose"
        : r() < 0.45
          ? "fan"
          : r() < 0.6
            ? "leaf"
            : "curl");
    let P =
      o.pts ||
      vine(
        o.base as Pt,
        o.dir as number,
        o.len as number,
        (0.35 + r() * 0.45) * p.curvy,
        1 + r() * 1.6,
        r() * 6.28,
        (r() - 0.5) * 1.2,
        40,
      );
    if (tip === "curl") P = curl(P, r() < 0.5 ? -1 : 1, 0.05 + r() * 0.05);
    const segs = weave(r, o.layer0 != null ? o.layer0 : r() < 0.5 ? 0 : 1);
    const dur = Math.max(320, (o.len || 0.8) * 620);
    const thorns: Stem["thorns"] = [];
    const nt = Math.floor(r() * 2.5);
    for (let i = 0; i < nt; i++)
      thorns.push({ u: 0.15 + r() * 0.65, s: r() < 0.5 ? -1 : 1 });
    E.push({
      t: "stem",
      id: nid(),
      pts: P,
      segs,
      d0: o.d0,
      dur,
      w: o.depth ? 0.82 : 1,
      thorns,
    });
    const nl = Math.floor(r() * 2.8 * p.leafy);
    let sd = r() < 0.5 ? -1 : 1;
    for (let i = 0; i < nl; i++) {
      const u = 0.25 + r() * 0.6;
      const [q, a] = at(P, u);
      sd = -sd;
      E.push({
        t: "leaf",
        id: nid(),
        x: q[0],
        y: q[1],
        a: a + sd * (0.55 + r() * 0.5),
        L: (0.14 + r() * 0.2) * (o.depth ? 0.8 : 1),
        bend: (r() - 0.5) * 1.2,
        layer: layerAt(segs, u),
        d0: o.d0 + dur * u,
      });
    }
    const [tp, ta] = at(P, 1);
    const td = o.d0 + dur * 0.8;
    const tl = layerAt(segs, 1);
    if (tip === "rose") {
      const R = (0.13 + r() * 0.15) * p.big * (o.depth ? 0.75 : 1);
      // legibility: a rose sitting over the letter body mostly goes behind it
      const over = tp[1] > -0.78 && tp[1] < 0.05 && Math.abs(tp[0]) < p.w * 0.5;
      const layer = over ? (r() < 0.22 ? 1 : 0) : r() < 0.6 ? 1 : tl;
      E.push({
        t: "rose",
        id: nid(),
        x: tp[0],
        y: tp[1],
        R,
        rot: (r() - 0.5) * 1.0,
        ph1: r() * 6.28,
        ph2: r() * 6.28,
        turns: 1.8 + r() * 1,
        layer,
        d0: td,
      });
      if (r() < 0.2) {
        const oo = ta + (r() < 0.5 ? 1 : -1) * 1.3;
        E.push({
          t: "rose",
          id: nid(),
          x: tp[0] + Math.cos(oo) * R * 1.4,
          y: tp[1] + Math.sin(oo) * R * 1.4,
          R: R * (0.6 + r() * 0.3),
          rot: (r() - 0.5) * 1.2,
          ph1: r() * 6.28,
          ph2: r() * 6.28,
          turns: 1.8 + r(),
          layer,
          d0: td + 120,
        });
      }
    } else if (tip === "fan") {
      const spread = 0.6 + r() * 0.3;
      for (let j = 0; j < 2; j++)
        E.push({
          t: "leaf",
          id: nid(),
          x: tp[0],
          y: tp[1],
          a: ta + (j - 0.5) * spread,
          L: 0.2 + r() * 0.2,
          bend: (j - 0.5) * 0.8,
          layer: tl,
          d0: td + j * 60,
        });
    } else if (tip === "leaf") {
      E.push({
        t: "leaf",
        id: nid(),
        x: tp[0],
        y: tp[1],
        a: ta + (r() - 0.5) * 0.3,
        L: 0.16 + r() * 0.16,
        bend: r() - 0.5,
        layer: tl,
        d0: td,
      });
    }
    if (!o.depth && r() < 0.3) {
      const u = 0.35 + r() * 0.35;
      const [q, a] = at(P, u);
      grow(r, E, nid, p, {
        base: q,
        dir: a + (r() < 0.5 ? -1 : 1) * (0.7 + r() * 0.4),
        len: (o.len || 0.8) * (0.35 + r() * 0.2),
        d0: o.d0 + dur * u,
        depth: 1,
        layer0: layerAt(segs, u),
      });
    }
    return P;
  }
  function gen(l: Letter) {
    const ws = l.ws as number;
    const wi = l.wi as number;
    const r = rng(
      (ws ^ Math.imul(wi + 1, 2654435761)) + Math.floor(Math.random() * 1e6),
    );
    const p = wordParams(ws);
    const E: El[] = [];
    let k0 = 0;
    const nid = () => l.id * 100 + k0++;
    const w = mw(l.ch);
    const inX = () => (r() - 0.5) * w * 0.7;
    p.w = w;
    const nUp = 1 + (r() < 0.45 * p.dens ? 1 : 0);
    for (let i = 0; i < nUp; i++) {
      grow(r, E, nid, p, {
        base: [inX(), -r() * 0.3],
        dir: -Math.PI / 2 + p.lean * 0.5 + (r() - 0.5) * 0.7,
        len: 0.6 + r() * 0.5,
        d0: 40 + i * 130,
        tip: wi === 0 && i === 0 ? "rose" : null,
      });
    }
    if (r() < 0.4 * p.dens)
      grow(r, E, nid, p, {
        base: [inX(), -0.1 - r() * 0.35],
        dir: Math.PI / 2 + (r() - 0.5) * 0.8,
        len: 0.35 + r() * 0.35,
        d0: 160,
      });
    if (l.prev && r() < p.bridgeP) {
      const px = -(mw(l.prev.ch) + w) / 2;
      const a: Pt = [inX(), -0.05 - r() * 0.55];
      const b: Pt = [px + (r() - 0.5) * 0.25, -0.05 - r() * 0.55];
      const bulge = (r() < 0.55 ? -1 : 1) * (0.4 + r() * 0.4);
      const dx = b[0] - a[0];
      let P = bez(
        a,
        [a[0] + dx * 0.15, a[1] + bulge],
        [b[0] - dx * 0.15, b[1] + bulge * 0.9],
        b,
        40,
      );
      if (r() < 0.45) P = P.slice(0, Math.floor(P.length * (0.7 + r() * 0.2)));
      grow(r, E, nid, p, {
        pts: P,
        len: Math.abs(dx) + Math.abs(bulge),
        d0: 90,
        tip: r() < 0.5 ? "curl" : r() < 0.5 ? "leaf" : "rose",
      });
    }
    if (wi === 0)
      grow(r, E, nid, p, {
        base: [-w * 0.3, -0.15 - r() * 0.4],
        dir: Math.PI + (r() - 0.5) * 1.2,
        len: 0.45 + r() * 0.3,
        d0: 120,
        tip: "curl",
      });
    l.els = E;
    l.endEls = null;
    // the tendril that reaches toward the next letter while this one is last in its word
    const T: El[] = [];
    const tr = rng(l.id * 977 + Math.floor(Math.random() * 1e6));
    grow(tr, T, () => l.id * 100 + 90 + T.length, p, {
      base: [w * 0.25, -0.1 - tr() * 0.45],
      dir: (tr() - 0.5) * 1.4,
      len: 0.45 + tr() * 0.25,
      d0: 0,
      tip: "curl",
      depth: 1,
    });
    l.tend = T.filter((e): e is Stem => e.t === "stem").slice(0, 1);
  }
  // Space after a word: the cut stem sprouts a few roses and fans
  function genEnd(l: Letter, rel: number) {
    const ws = l.ws as number;
    const r = rng(ws + (l.wi as number) * 31 + Math.floor(Math.random() * 1e6));
    const p = wordParams(ws);
    const E: El[] = [];
    let k0 = 50;
    const nid = () => l.id * 100 + k0++;
    const w = mw(l.ch);
    const n = 1 + Math.floor(r() * 2.5);
    p.w = w;
    for (let i = 0; i < n; i++) {
      const dir =
        -Math.PI / 2 + 0.6 + (i - (n - 1) / 2) * 0.9 + (r() - 0.5) * 0.4;
      grow(r, E, nid, p, {
        base: [(r() - 0.2) * w * 0.6, -r() * 0.5],
        dir,
        len: 0.4 + r() * 0.45,
        d0: rel + 40 + i * 90,
        depth: 1,
        tip: i === 0 || r() < 0.5 ? "rose" : "fan",
      });
    }
    l.endEls = E;
  }

  function strokeRange(
    B: Backend,
    P: Pt[],
    a: number,
    b: number,
    col: string,
    w: number,
  ) {
    const n = P.length - 1;
    const ia = a * n;
    const ib = b * n;
    const lerp = (t: number): Pt => {
      const i = Math.min(n - 1, Math.floor(t));
      const f = t - i;
      return [
        P[i][0] + (P[i + 1][0] - P[i][0]) * f,
        P[i][1] + (P[i + 1][1] - P[i][1]) * f,
      ];
    };
    const pts = [lerp(ia)];
    for (let i = Math.floor(ia) + 1; i < ib; i++) pts.push(P[i]);
    pts.push(lerp(ib));
    if (pts.length >= 2) B.stroke(pts, col, w);
  }
  function thorn(B: Backend, P: Pt[], u: number, s: number, S: number) {
    const [p, a] = at(P, u);
    const d = a + s * 2.3;
    const L = S * 0.045;
    B.stroke(
      [p, [p[0] + Math.cos(d) * L, p[1] + Math.sin(d) * L]],
      cc.blue,
      S * 0.022,
    );
  }
  function leaf(
    B: Backend,
    bx: number,
    by: number,
    a: number,
    L: number,
    bend: number,
  ) {
    if (L < 0.5) return;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const px = -sa;
    const py = ca;
    const ax = (u: number): Pt => {
      const b = Math.sin(Math.PI * u) * bend * 0.15 * L;
      return [bx + ca * u * L + px * b, by + sa * u * L + py * b];
    };
    const hw = (u: number) => L * 0.18 * Math.sin(Math.PI * u ** 0.8);
    const N = 12;
    const s1: Pt[] = [];
    const s2: Pt[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const c = ax(u);
      const w = hw(u);
      s1.push([c[0] + px * w, c[1] + py * w]);
      s2.push([c[0] - px * w, c[1] - py * w]);
    }
    const tip = ax(1);
    const base = ax(0);
    B.fill(
      [base, ...s1.slice(1, N), tip, tip, ...s2.slice(1, N).reverse(), base],
      cc.blue,
    );
    if (L > 6) {
      const v: Pt[] = [];
      for (let i = 0; i <= 8; i++) v.push(ax(0.08 + (0.72 * i) / 8));
      B.stroke(v, cc.vein, Math.max(0.8, L * 0.03));
    }
  }
  function rose(
    B: Backend,
    rx: number,
    ry: number,
    R: number,
    rot: number,
    e: Rose,
    a: number,
    tl: Pt | null,
  ) {
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    const tm = tl ? Math.hypot(tl[0], tl[1]) : 0;
    const ux = tm && tl ? tl[0] / tm : 0;
    const uy = tm && tl ? tl[1] / tm : 0;
    const sq = -0.28 * tm;
    const T = (x: number, y: number, z = 0): Pt => {
      let dx = x * cr - y * sr;
      let dy = x * sr + y * cr;
      if (tm && tl) {
        const k = (dx * ux + dy * uy) * sq;
        dx += k * ux + tl[0] * R * z;
        dy += k * uy + tl[1] * R * z;
      }
      return [rx + dx, ry + dy];
    };
    // petals, back to front: [cx, cy, rx, ry, angle, depth, edge]
    const P = [
      [0, -0.36, 0.56, 0.54, 0, 0, 0],
      [-0.5, -0.06, 0.6, 0.6, -0.35, 0, 0],
      [0.52, -0.06, 0.6, 0.6, 0.35, 0, 0],
      [-0.42, 0.3, 0.62, 0.48, 0.2, 0.12, 1],
      [0.47, 0.3, 0.62, 0.48, -0.2, 0.12, 1],
      [0.05, 0.42, 0.56, 0.38, 0, 0.14, 0],
    ];
    const ax0 = 0;
    const ay0 = 0.5;
    const lw = Math.max(0.8, R * 0.045);
    const st = 85;
    P.forEach((q, i) => {
      const s = spr((a - i * st) / 1000, 8, 14);
      if (s <= 0.001) return;
      const open = (1 - Math.min(1, s)) * (q[0] < 0 ? 0.5 : -0.5);
      const ang = q[4] + open;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const pt = (th: number) => {
        const rr =
          1 +
          0.08 * Math.sin(3 * th + e.ph1 + i) +
          0.04 * Math.sin(5 * th + e.ph2);
        const lx = Math.cos(th) * q[2] * rr;
        const ly = Math.sin(th) * q[3] * rr;
        const px = q[0] + lx * ca - ly * sa;
        const py = q[1] + lx * sa + ly * ca;
        return T((ax0 + (px - ax0) * s) * R, (ay0 + (py - ay0) * s) * R, q[5]);
      };
      const pts: Pt[] = [];
      for (let k = 0; k < 26; k++) pts.push(pt((k / 26) * Math.PI * 2));
      B.fill(pts, cc.red);
      if (q[6] && R >= 12 && s > 0.4) {
        const arc: Pt[] = [];
        for (let k = 0; k <= 14; k++)
          arc.push(pt(Math.PI * (1.18 + (0.64 * k) / 14)));
        strokeRange(B, arc, 0, Math.min(1, (s - 0.4) / 0.5), cc.line, lw * 0.8);
      }
    });
    const fr = eo((a - P.length * st - 80) / 520);
    if (fr > 0 && R > 3) {
      const sp: Pt[] = [];
      const scl: Pt[] = [];
      const turns =
        R < 20 ? Math.min(e.turns, 1.3) : R < 32 ? e.turns * 0.8 : e.turns;
      for (let i = 0; i <= 70; i++) {
        const u = i / 70;
        const th = e.ph1 + u * turns * Math.PI * 2;
        const rr = R * (0.08 + 0.57 * u);
        sp.push(
          T(
            Math.cos(th) * rr * 1.05,
            Math.sin(th) * rr * 0.72 - 0.12 * R,
            0.34 - 0.24 * u,
          ),
        );
      }
      strokeRange(B, sp, 0, fr, cc.line, lw);
      if (R >= 14) {
        for (let i = 0; i <= 36; i++) {
          const u = i / 36;
          scl.push(
            T(
              (-0.72 + 1.5 * u) * R,
              0.36 * R + 0.16 * R * Math.abs(Math.sin(u * Math.PI * 3)),
              0.18,
            ),
          );
        }
        strokeRange(B, scl, 0, fr, cc.line, lw);
      }
    }
  }

  // ---------- render ----------
  const WITHER = 260;
  function frame() {
    const now = performance.now();
    const dt = Math.min(64, now - (lt || now));
    lt = now;
    const k = 1 - Math.exp(-dt / 80);
    Sd += (St - Sd) * k;
    cx += (ctx_ - cx) * k;
    cy += (cty - cy) * k;
    for (const l of letters)
      if (!l.dead && l.tx != null) {
        l.x = (l.x as number) + (l.tx - (l.x as number)) * k;
        l.y = (l.y as number) + ((l.ty as number) - (l.y as number)) * k;
      }
    letters = letters.filter((l) => !(l.dead && now - l.dead > 300));
    paint(now);
  }
  function paint(now: number) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const pc = pal();
    g.fillStyle = pc.bg;
    g.fillRect(0, 0, W, H);
    const B = backend(g);
    render(B, now, pc.C);
    drawFlies(B, now, pc.C);
    // caret
    const S = Sd;
    const on = now - lastKey < 500 || Math.floor(now / 530) % 2 === 0;
    const hf = eo((now - t0) / 600);
    if (on && hf > 0) {
      const hh = 0.8 * S * hf;
      const w = Math.max(2, S * 0.03);
      B.rect(cx - w / 2, cy - hh / 2, w, hh, pc.C.text);
    }
  }
  function render(B: Backend, now: number, C: Colors) {
    const S = Sd;
    const L = letters;
    const act = L.filter((l) => !l.dead);
    cc = C;
    now_ = now;
    perch = [];
    // stems lean toward the pointer
    for (const l of L) {
      let tx = 0;
      let ty = 0;
      if (mx != null && !l.dead && l.ch !== " ") {
        const dx = mx - (l.x as number);
        const dy = my - ((l.y as number) - S * 0.6);
        const d = Math.hypot(dx, dy);
        const reach = Math.max(260, S * 3.2);
        if (d < reach && d > 1) {
          const w = 1 - d / reach;
          const s = w * w * (3 - 2 * w);
          tx = (dx / d) * s;
          ty = (dy / d) * s;
        }
      }
      if (!l.lean) l.lean = [0, 0];
      const c = l.lean;
      c[0] += (tx - c[0]) * 0.07;
      c[1] += (ty - c[1]) * 0.07;
    }
    const boil = opt.boil();
    const f = boil ? Math.floor(now / 120) : 0;
    const amp = boil ? Math.max(0.8, S * 0.01) : 0;
    const kd_ = (l: Letter) => (l.dead ? 1 - eo((now - l.dead) / WITHER) : 1);
    const draw = (layer: number) => {
      for (const l of L) {
        if (l.ch === " " || !l.els) continue;
        const age = now - l.birth;
        const kk = kd_(l);
        const each = (e: El) => {
          if (e.t === "stem") drawStem(B, e, l, age, kk, f, amp, layer);
          else if (e.layer === layer) drawEl(B, e, l, age, kk, f, amp);
        };
        l.els.forEach(each);
        if (l.endEls) l.endEls.forEach(each);
        const i = act.indexOf(l);
        const nx = i >= 0 ? act[i + 1] : null;
        if (l.tend && (l.dead || !nx || nx.ch === " ")) {
          let fr = eo((now - (l.tb as number) - 150) / 450);
          if (l.cut != null)
            fr *=
              1 -
              eo((now - l.cut) / 150) * Math.min(0.85, opt.recoil / (0.6 * S));
          for (const e of l.tend)
            drawStem(B, e, l, age, kk, f, amp, layer, fr * kk);
        }
      }
    };
    draw(0);
    for (const l of L)
      if (l.ch !== " " && !l.dead)
        B.text(l.ch, l.x as number, l.y as number, S, C.text);
    draw(1);
  }
  // a point on the letter's growth: a damped sway just after birth, plus the lean toward the pointer
  function wpt(l: Letter, x: number, y: number): Pt {
    const S = Sd;
    const ly = l.y as number;
    const t = (now_ - l.birth) / 1000;
    if (t > 0 && t < 2.5) {
      const hh = Math.max(0, (ly - y) / S);
      const dmp = Math.exp(-t * 3.2);
      const dir = l.id % 2 ? 1 : -1;
      x += S * 0.07 * hh * dmp * Math.sin(t * 11) * dir;
      y += S * 0.035 * hh * dmp * Math.sin(t * 11 + 1.2);
    }
    if (l.lean) {
      const hh = Math.min(2.5, Math.max(0, (ly - y) / S));
      const f = hh * hh * 0.5 + hh * 0.5;
      x += l.lean[0] * S * 0.1 * f;
      y += l.lean[1] * S * 0.05 * f;
    }
    return [x, y];
  }
  function drawStem(
    B: Backend,
    e: Stem,
    l: Letter,
    age: number,
    kk: number,
    f: number,
    amp: number,
    layer: number,
    frO?: number,
  ) {
    const S = Sd;
    const fr = frO != null ? frO : eo((age - e.d0) / e.dur) * kk;
    if (fr <= 0) return;
    const j = jit(e.id, f, amp);
    const P = e.pts.map((p) =>
      wpt(
        l,
        (l.x as number) + p[0] * S + j[0],
        (l.y as number) + p[1] * S + j[1],
      ),
    );
    for (const sg of e.segs) {
      if (sg.layer !== layer) continue;
      const b = Math.min(sg.u1, fr);
      if (b <= sg.u0) continue;
      strokeRange(B, P, sg.u0, b, cc.blue, S * 0.022 * (e.w || 1));
    }
    for (const th of e.thorns)
      if (fr > th.u && layerAt(e.segs, th.u) === layer)
        thorn(B, P, th.u, th.s, S);
  }
  function drawEl(
    B: Backend,
    e: Leaf | Rose,
    l: Letter,
    age: number,
    kk: number,
    f: number,
    amp: number,
  ) {
    const S = Sd;
    const j = jit(e.id, f, amp);
    const wx = (x: number, y: number) =>
      wpt(l, (l.x as number) + x * S + j[0], (l.y as number) + y * S + j[1]);
    if (e.t === "leaf") {
      const sc = spr((age - e.d0) / 1000, 7, 15) * kk;
      if (sc <= 0) return;
      const p = wx(e.x, e.y);
      leaf(B, p[0], p[1], e.a + j[2], e.L * S * sc, e.bend);
    } else {
      const a = age - e.d0;
      if (a < 0) return;
      if (kk <= 0.001) return;
      const p = wx(e.x, e.y);
      const tl = faceTurn(e, p[0], p[1]);
      if (!l.dead && a > 700)
        perch.push({ id: e.id, x: p[0], y: p[1], R: e.R * S * kk });
      rose(B, p[0], p[1], e.R * S * kk, e.rot + j[2] + tl[0] * 0.22, e, a, tl);
    }
  }

  // ---------- listeners, all on the component root ----------
  const local = (e: PointerEvent | globalThis.MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  const onMove = (e: PointerEvent) => {
    [mx, my] = local(e);
  };
  const onLeave = () => {
    mx = null;
  };
  const onPD = (e: PointerEvent) => {
    ptype = e.pointerType || "mouse";
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerType && e.pointerType !== "mouse") mx = null; // roses relax when the finger lifts
  };
  // pointer down anywhere in the garden keeps typing going; on the canvas it calls a butterfly
  const onFocus = (ev: PointerEvent) => {
    const isTouch = ev.pointerType && ev.pointerType !== "mouse";
    const onCanvas = ev.target === canvas;
    // touch: leave focus (and the keyboard) where it is while tapping; the tap's click opens the keyboard
    if (isTouch) {
      if (
        ev.cancelable &&
        (onCanvas || (ev.target as HTMLElement).closest?.("button"))
      )
        ev.preventDefault();
    } else fld.focus({ preventScroll: true });
    if (onCanvas) {
      const [x, y] = local(ev);
      spawnFly(x, y);
    }
  };
  const onTap = (ev: globalThis.MouseEvent) => {
    if (ptype !== "mouse" && ev.target === canvas)
      fld.focus({ preventScroll: true });
  };
  const onInput = () => inputDiff(fld);
  const onCS = () => {
    composing = true;
  };
  const onCE = () => {
    composing = false;
    setTimeout(() => {
      if (!composing) inputDiff(fld);
    }, 0);
  };

  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener("pointerdown", onPD, true);
  root.addEventListener("pointerdown", onFocus);
  root.addEventListener("pointerup", onUp);
  root.addEventListener("pointercancel", onUp);
  root.addEventListener("click", onTap);
  root.addEventListener("keydown", key);
  fld.addEventListener("input", onInput);
  fld.addEventListener("compositionstart", onCS);
  fld.addEventListener("compositionend", onCE);

  resize();
  document.fonts
    ?.load(`700 100px ${FONT}`)
    .then(() => {
      cache = {};
      layout();
    })
    .catch(() => {});

  let raf = 0;
  let running = false;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    frame();
  };
  const focusTimer =
    !touch && autoFocus
      ? window.setTimeout(() => fld.focus({ preventScroll: true }), 50)
      : 0;

  return {
    resize,
    start() {
      if (running) return;
      running = true;
      loop();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    setPalette(i: number) {
      palette = i;
      refocus();
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(focusTimer);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onPD, true);
      root.removeEventListener("pointerdown", onFocus);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("click", onTap);
      root.removeEventListener("keydown", key);
      fld.removeEventListener("input", onInput);
      fld.removeEventListener("compositionstart", onCS);
      fld.removeEventListener("compositionend", onCE);
    },
  };
}

/** Type into it and a garden grows from the letters. Fills its parent; give the parent a height. */
export default function TypeGarden({
  palette: initialPalette = 0,
  boil = true,
  recoil = 20,
  density = 1,
  showHint = true,
  autoFocus = false,
  className,
  style,
}: TypeGardenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<ReturnType<typeof createScene> | null>(null);
  const [palette, setPalette] = useState(initialPalette);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const boilRef = useRef(boil);
  boilRef.current = boil;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const input = inputRef.current;
    if (!root || !canvas || !input) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scene = createScene(
      root,
      canvas,
      input,
      { boil: () => boilRef.current && !reduced.matches, recoil, density },
      paletteRef.current,
      autoFocus,
    );
    sceneRef.current = scene;

    let onScreen = true;
    const sync = () => {
      if (onScreen && !document.hidden) scene.start();
      else scene.stop();
    };
    const resizeObserver = new ResizeObserver(() => scene.resize());
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      scene.dispose();
      sceneRef.current = null;
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [recoil, density, autoFocus]);

  const current = TYPE_GARDEN_PALETTES[palette] ?? TYPE_GARDEN_PALETTES[0];
  const pageBg = current[1];
  const textCol = current[5];

  const pick = (i: number) => (e: MouseEvent) => {
    e.stopPropagation();
    setPalette(i);
    sceneRef.current?.setPalette(i);
  };

  return (
    <div
      ref={rootRef}
      data-tg="app"
      className={`tg-root${className ? ` ${className}` : ""}`}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: pageBg,
        cursor: "text",
        fontFamily: "'DM Mono',ui-monospace,monospace",
        ...style,
      }}
    >
      <style>{STYLES}</style>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      <input
        ref={inputRef}
        data-tg="input"
        aria-label="Type to grow a garden"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          margin: 0,
          padding: 0,
          border: 0,
          opacity: 0,
          fontSize: 16,
          color: "transparent",
          background: "transparent",
          caretColor: "transparent",
          pointerEvents: "none",
        }}
      />
      {showHint && (
        <div
          data-tg="bar"
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            fontSize: 12,
            letterSpacing: "0.04em",
            color: textCol,
            opacity: 0.6,
          }}
        >
          <div
            data-tg="hints"
            style={{ display: "flex", gap: 20, flexWrap: "wrap" }}
          >
            <span data-tg="fine">type to grow</span>
            <span data-tg="coarse">tap to type</span>
            <span>space cuts</span>
            <span data-tg="fine">backspace withers</span>
            <span data-tg="coarse">⌫ withers</span>
            <span data-tg="fine">enter clears</span>
            <span data-tg="coarse">return clears</span>
          </div>
          <div
            data-tg="ctrls"
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <div
              data-tg="pal"
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                padding: "4px 6px",
                border: "1px solid #3A3A3A",
                borderRadius: 999,
                background: pageBg,
              }}
            >
              {TYPE_GARDEN_PALETTES.map((p, i) => {
                const selected = palette === i;
                return (
                  <button
                    key={p[0]}
                    type="button"
                    data-tg="sw"
                    aria-label={p[0]}
                    aria-pressed={selected}
                    title={p[0]}
                    onClick={pick(i)}
                    style={{
                      width: 22,
                      height: 22,
                      padding: 0,
                      borderRadius: 999,
                      cursor: "pointer",
                      background: p[1],
                      border: `1.5px solid ${selected ? textCol : p[1] === pageBg ? "#3A3A3A" : "transparent"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${selected ? 1.1 : 1})`,
                    }}
                  >
                    <span
                      data-tg="dot"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: p[2],
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <style>{FONT_FACES}</style>
    </div>
  );
}

// Source CSS, scoped to the root. Its viewport media queries become container
// queries, because the source ran in a frame the size of the component.
const STYLES = `
.tg-root{container-type:inline-size;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.tg-root button{-webkit-tap-highlight-color:transparent;touch-action:manipulation;box-sizing:border-box}
.tg-root [data-tg="sw"]:hover{transform:scale(1.15)!important}
.tg-root [data-tg="bar"]{left:calc(24px + env(safe-area-inset-left))!important;right:calc(24px + env(safe-area-inset-right))!important;bottom:calc(20px + env(safe-area-inset-bottom))!important}
.tg-root [data-tg="coarse"]{display:none}
@media (pointer:coarse){.tg-root [data-tg="fine"]{display:none}.tg-root [data-tg="coarse"]{display:inline}}
@container (max-width:600px){
  .tg-root [data-tg="bar"]{left:calc(16px + env(safe-area-inset-left))!important;right:calc(16px + env(safe-area-inset-right))!important;bottom:calc(14px + env(safe-area-inset-bottom))!important;gap:10px!important}
  .tg-root [data-tg="hints"]{gap:12px!important;font-size:11px}
  .tg-root [data-tg="ctrls"]{flex:1 1 100%;justify-content:space-between;gap:8px!important}
  .tg-root [data-tg="pal"]{gap:4px!important}
  .tg-root [data-tg="sw"]{--sw:clamp(13px,calc((100cqw - 183px) / 10),22px);width:var(--sw)!important;height:var(--sw)!important}
  .tg-root [data-tg="dot"]{width:calc(var(--sw) * .46)!important;height:calc(var(--sw) * .46)!important}
}
`;

const FONT_FACES = `
@font-face{font-family:"GT Ultra";src:url("${ASSET_BASE}/gt-ultra.otf") format("opentype");font-weight:100 900;font-style:normal;font-display:block}
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:700;font-display:swap;src:url("${ASSET_BASE}/playfair-display-700-cyrillic.woff2") format('woff2');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:700;font-display:swap;src:url("${ASSET_BASE}/playfair-display-700-vietnamese.woff2") format('woff2');unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:700;font-display:swap;src:url("${ASSET_BASE}/playfair-display-700-latin-ext.woff2") format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Playfair Display';font-style:normal;font-weight:700;font-display:swap;src:url("${ASSET_BASE}/playfair-display-700-latin.woff2") format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'DM Mono';font-style:normal;font-weight:400;font-display:swap;src:url("${ASSET_BASE}/dm-mono-400-latin-ext.woff2") format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'DM Mono';font-style:normal;font-weight:400;font-display:swap;src:url("${ASSET_BASE}/dm-mono-400-latin.woff2") format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'DM Mono';font-style:normal;font-weight:500;font-display:swap;src:url("${ASSET_BASE}/dm-mono-500-latin-ext.woff2") format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'DM Mono';font-style:normal;font-weight:500;font-display:swap;src:url("${ASSET_BASE}/dm-mono-500-latin.woff2") format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
`;

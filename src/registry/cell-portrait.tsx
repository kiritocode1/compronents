"use client";

/**
 * Cell Portrait - a portrait drawn as a grid of circles that join into
 * capsules and thin bridges.
 *
 * The cells shrink from 36px to 7px while the joins reshuffle every 133ms,
 * then the image colors in at 5px and the loop runs back out. The constants
 * below were measured frame by frame from the reference recording;
 * reference/cell-portrait/measurements.json pins those numbers and
 * tests/cell-portrait.test.mjs checks the timeline and odds against them.
 *
 * Geometry is in base pixels: the shorter side of the canvas is always 540
 * base px, the size the reference was rendered at, so cell sizes and stroke
 * weights scale with the component.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { type CSSProperties, useEffect, useRef } from "react";

export interface CellPortraitProps {
  /** Portrait image. A transparent PNG gives an exact silhouette; an opaque
   * image has its border color keyed out. Must allow CORS. */
  src?: string;
  alt?: string;
  background?: string;
  stroke?: string;
  /** Coarsest cell, in base px. */
  cellFrom?: number;
  /** Finest outline cell, in base px. */
  cellTo?: number;
  /** Cell size while the image is in color, in base px. */
  cellDetail?: number;
  /** Timeline speed multiplier. */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_SRC = "https://ui.aryank.space/assets/cell-portrait/miku.webp";

const BASE = 540;

/** Loop timing in seconds. Cell sizes tween on a log scale, all sine.inOut. */
const TIMING = {
  zoomIn: { at: 0, duration: 1.91 },
  detailIn: { at: 2.323, duration: 0.197 },
  colorIn: { at: 2.373, duration: 0.162 },
  colorOut: { at: 3.909, duration: 0.166 },
  detailOut: { at: 3.98, duration: 0.1 },
  zoomOut: { at: 4.39, duration: 1.61 },
} as const;

/** Reduced motion holds this moment of the loop: full color, finest cells. */
const HOLD_AT = 3.1;
/** Seconds between random layouts. */
const SHUFFLE = 0.4 / 3;
const CIRCLE = 1 / 3; // circle radius per cell
const THIN = 1 / 12; // thin bridge half-width per cell
const STROKE = 1 / 12; // stroke width per cell, capped at STROKE_MAX
const STROKE_MAX = 1.4;
const CORNER = 0.45; // silhouette step rounding per cell
const EDGE = 1; // base px kept clear between the outermost cells and the edge
const HAIRLINE_ALPHA = 0.85;
const P_JOIN = 0.42; // neighbours that join, at every cell size

/** Share of joins drawn as full capsules: 0.45 at 36px cells, 0.65 at 7px. */
function fullShare(cell: number) {
  return 0.45 + 0.2 * (Math.log(36 / cell) / Math.log(36 / 7));
}

/** Odds that a cell draws a circle, from the Rec. 709 luma (0 to 1) of its mean color. */
function presence(luma: number) {
  return luma >= 0.7 ? 0 : 0.9 - 0.8 * luma;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Removes the background of an opaque image in place. The background is the
 * most common border color; every region of it that touches the border is
 * keyed, plus enclosed pockets larger than 0.4% of the image (gaps between
 * strands of hair), while smaller enclosed regions such as eye whites stay.
 */
function keyBackground(
  data: Uint8ClampedArray,
  width: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  const at = (x: number, y: number) => (y * width + x) * 4;
  const binOf = (i: number) =>
    ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
  const border: number[] = [];
  for (let x = x0; x <= x1; x++) border.push(at(x, y0), at(x, y1));
  for (let y = y0; y <= y1; y++) border.push(at(x0, y), at(x1, y));
  const votes = new Map<number, number>();
  for (const i of border) votes.set(binOf(i), (votes.get(binOf(i)) ?? 0) + 1);
  let bin = 0;
  let count = 0;
  for (const [b, c] of votes) if (c > count) [bin, count] = [b, c];
  if (count < border.length * 0.25) return;
  const pick = border.filter((i) => binOf(i) === bin);
  const ref = [0, 1, 2].map(
    (k) => pick.reduce((sum, i) => sum + data[i + k], 0) / pick.length,
  );
  const near = (i: number) =>
    Math.abs(data[i] - ref[0]) <= 24 &&
    Math.abs(data[i + 1] - ref[1]) <= 24 &&
    Math.abs(data[i + 2] - ref[2]) <= 24;

  const minArea = (x1 - x0 + 1) * (y1 - y0 + 1) * 0.004;
  const seen = new Uint8Array(data.length / 4);
  const region: number[] = [];
  for (let sy = y0; sy <= y1; sy++)
    for (let sx = x0; sx <= x1; sx++) {
      const start = sy * width + sx;
      if (seen[start] || !near(start * 4)) continue;
      seen[start] = 1;
      region.length = 0;
      region.push(start);
      let touchesEdge = false;
      for (let r = 0; r < region.length; r++) {
        const p = region[r];
        const x = p % width;
        const y = (p - x) / width;
        if (x === x0 || x === x1 || y === y0 || y === y1) touchesEdge = true;
        const next = [
          x > x0 ? p - 1 : -1,
          x < x1 ? p + 1 : -1,
          y > y0 ? p - width : -1,
          y < y1 ? p + width : -1,
        ];
        for (const q of next)
          if (q >= 0 && !seen[q] && near(q * 4)) {
            seen[q] = 1;
            region.push(q);
          }
      }
      if (touchesEdge || region.length >= minArea)
        for (const p of region) data[p * 4 + 3] = 0;
    }
}

/**
 * Corner loops around the in-mask cells, in grid vertex coordinates.
 * Boundary edges are walked clockwise (inside on the right); at a vertex where
 * two cells touch diagonally the walk turns right, so they stay separate
 * loops. `open` counts walks that failed to return to their start (always 0
 * for a valid mask).
 */
function traceLoops(inside: Uint8Array, cols: number, rows: number) {
  const isIn = (i: number, j: number) =>
    i >= 0 && j >= 0 && i < cols && j < rows && inside[j * cols + i] === 1;
  const stride = cols + 1;
  const key = (x: number, y: number) => y * stride + x;
  const out = new Map<number, [number, number][]>();
  const add = (x0: number, y0: number, x1: number, y1: number) => {
    const list = out.get(key(x0, y0));
    if (list) list.push([x1, y1]);
    else out.set(key(x0, y0), [[x1, y1]]);
  };
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      if (!isIn(i, j)) continue;
      if (!isIn(i, j - 1)) add(i, j, i + 1, j);
      if (!isIn(i + 1, j)) add(i + 1, j, i + 1, j + 1);
      if (!isIn(i, j + 1)) add(i + 1, j + 1, i, j + 1);
      if (!isIn(i - 1, j)) add(i, j + 1, i, j);
    }

  const loops: [number, number][][] = [];
  let open = 0;
  for (const [startKey, list] of out) {
    while (list.length) {
      let x = startKey % stride;
      let y = (startKey - x) / stride;
      const first = list.pop();
      if (!first) break;
      let [nx, ny] = first;
      let dx = nx - x;
      let dy = ny - y;
      const corners: [number, number][] = [[x, y]];
      for (;;) {
        x = nx;
        y = ny;
        if (key(x, y) === startKey) break;
        const next = out.get(key(x, y));
        if (!next?.length) {
          open++;
          break;
        }
        let pick = 0;
        if (next.length > 1) {
          const turn = next.findIndex(
            ([tx, ty]) => tx - x === -dy && ty - y === dx,
          );
          if (turn >= 0) pick = turn;
        }
        [nx, ny] = next.splice(pick, 1)[0];
        if (nx - x !== dx || ny - y !== dy) corners.push([x, y]);
        dx = nx - x;
        dy = ny - y;
      }
      if (corners.length >= 3) loops.push(corners);
    }
  }
  return { loops, open };
}

interface CellGrid {
  size: number;
  cols: number;
  rows: number;
  ox: number;
  oy: number;
  inside: Uint8Array;
  odds: Float32Array;
}

interface CellLayout {
  on: Uint8Array;
  /** Join to the right / below: 0 none, 1 thin bridge, 2 full capsule. */
  right: Uint8Array;
  down: Uint8Array;
}

/** One random layout: which cells draw a circle and how neighbours join. */
function buildLayout(grid: CellGrid, cell: number, seed: number): CellLayout {
  const rand = mulberry32(seed);
  const pFull = P_JOIN * fullShare(cell);
  const { cols, rows, inside, odds } = grid;
  const n = cols * rows;
  const on = new Uint8Array(n);
  const right = new Uint8Array(n);
  const down = new Uint8Array(n);
  for (let k = 0; k < n; k++) on[k] = inside[k] && rand() < odds[k] ? 1 : 0;
  const join = () => {
    const u = rand();
    return u < pFull ? 2 : u < P_JOIN ? 1 : 0;
  };
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      if (!on[k]) continue;
      if (i + 1 < cols && on[k + 1]) right[k] = join();
      if (j + 1 < rows && on[k + cols]) down[k] = join();
    }
  return { on, right, down };
}

interface LoopState {
  logCell: number;
  color: number;
}

/** The six-tween loop. GSAP owns the clock; the renderer reads `state`. */
function createLoop(
  state: LoopState,
  cells: { from: number; to: number; detail: number },
) {
  const lg = Math.log;
  const ease = "sine.inOut";
  const T = TIMING;
  return gsap
    .timeline({ repeat: -1, paused: true })
    .fromTo(
      state,
      { logCell: lg(cells.from) },
      { logCell: lg(cells.to), duration: T.zoomIn.duration, ease },
      T.zoomIn.at,
    )
    .to(
      state,
      { logCell: lg(cells.detail), duration: T.detailIn.duration, ease },
      T.detailIn.at,
    )
    .fromTo(
      state,
      { color: 0 },
      { color: 1, duration: T.colorIn.duration, ease },
      T.colorIn.at,
    )
    .to(state, { color: 0, duration: T.colorOut.duration, ease }, T.colorOut.at)
    .to(
      state,
      { logCell: lg(cells.to), duration: T.detailOut.duration, ease },
      T.detailOut.at,
    )
    .to(
      state,
      { logCell: lg(cells.from), duration: T.zoomOut.duration, ease },
      T.zoomOut.at,
    );
}

interface SampledGrid extends CellGrid {
  color: string[];
  outline: Path2D;
}

/** Summed-area tables of premultiplied RGB and alpha, for O(1) cell means. */
function integrate(data: Uint8ClampedArray, width: number, height: number) {
  const stride = width + 1;
  const sums = [0, 1, 2, 3].map(() => new Float64Array(stride * (height + 1)));
  const row = [0, 0, 0, 0];
  for (let y = 0; y < height; y++) {
    row.fill(0);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3] / 255;
      row[0] += data[i] * a;
      row[1] += data[i + 1] * a;
      row[2] += data[i + 2] * a;
      row[3] += a;
      const o = (y + 1) * stride + x + 1;
      for (let k = 0; k < 4; k++) sums[k][o] = sums[k][o - stride] + row[k];
    }
  }
  return (k: number, ax: number, ay: number, bx: number, by: number) =>
    sums[k][by * stride + bx] -
    sums[k][ay * stride + bx] -
    sums[k][by * stride + ax] +
    sums[k][ay * stride + ax];
}

/**
 * Draws the scene into a canvas. Everything is computed in base px; `unit`
 * is device pixels per base px.
 */
function createRenderer(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  colors: { background: string; stroke: string },
) {
  let width = 0;
  let height = 0;
  let unit = 1;
  let sum: ReturnType<typeof integrate> | null = null;
  let mask: HTMLCanvasElement | null = null;
  let fit = { dx: 0, dy: 0, dw: 0, dh: 0 };
  let grids = new Map<number, SampledGrid>();
  let bases = new Map<number, HTMLCanvasElement>();
  let layoutKey = "";
  let layout: CellLayout | null = null;
  let drawn = "";
  const colorLayer = document.createElement("canvas");

  /** Contain-fits the image at 1 sample per base px, keying opaque backgrounds. */
  function sample() {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const s = c.getContext("2d", { willReadFrequently: true });
    if (!s) return;
    const k = Math.min(width / img.naturalWidth, height / img.naturalHeight);
    fit = {
      dw: img.naturalWidth * k,
      dh: img.naturalHeight * k,
      dx: (width - img.naturalWidth * k) / 2,
      dy: (height - img.naturalHeight * k) / 2,
    };
    s.drawImage(img, fit.dx, fit.dy, fit.dw, fit.dh);
    const pixels = s.getImageData(0, 0, width, height);
    const { data } = pixels;
    const x0 = Math.ceil(fit.dx);
    const y0 = Math.ceil(fit.dy);
    const x1 = Math.floor(fit.dx + fit.dw) - 1;
    const y1 = Math.floor(fit.dy + fit.dh) - 1;
    let hasAlpha = false;
    for (let y = y0; y <= y1 && !hasAlpha; y += 2)
      for (let x = x0; x <= x1; x += 2)
        if (data[(y * width + x) * 4 + 3] < 250) {
          hasAlpha = true;
          break;
        }
    if (!hasAlpha) keyBackground(data, width, x0, y0, x1, y1);
    sum = integrate(data, width, height);
    s.putImageData(pixels, 0, 0);
    mask = c;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.max(1, Math.min(rect.width, rect.height)) / BASE;
    width = Math.max(1, Math.round(rect.width / scale));
    height = Math.max(1, Math.round(rect.height / scale));
    unit = scale * dpr;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    colorLayer.width = canvas.width;
    colorLayer.height = canvas.height;
    grids = new Map();
    bases = new Map();
    layoutKey = "";
    drawn = "";
    sample();
  }

  /** Grid for one cell size, anchored so a grid line crosses the centre. */
  function gridFor(cell: number) {
    const cached = grids.get(cell);
    if (cached || !sum) return cached;
    const size = cell;
    const cx = width / 2;
    const cy = height / 2;
    const i0 = -Math.ceil(cx / size);
    const j0 = -Math.ceil(cy / size);
    const cols = Math.ceil((width - cx) / size) - i0;
    const rows = Math.ceil((height - cy) / size) - j0;
    const ox = cx + i0 * size;
    const oy = cy + j0 * size;
    const n = cols * rows;
    const inside = new Uint8Array(n);
    const odds = new Float32Array(n);
    const color = new Array<string>(n);
    const q = (v: number) => Math.min(255, Math.round(v / 4) * 4);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const left = ox + i * size;
        const top = oy + j * size;
        // Only whole cells: nothing is cut by the canvas edge, and the
        // silhouette always closes inside the frame.
        if (
          left < EDGE ||
          top < EDGE ||
          left + size > width - EDGE ||
          top + size > height - EDGE
        )
          continue;
        const ax = Math.round(left);
        const ay = Math.round(top);
        const bx = Math.round(left + size);
        const by = Math.round(top + size);
        const alpha = sum(3, ax, ay, bx, by);
        if (alpha / ((bx - ax) * (by - ay)) <= 0.5) continue;
        const r = sum(0, ax, ay, bx, by) / alpha;
        const g = sum(1, ax, ay, bx, by) / alpha;
        const b = sum(2, ax, ay, bx, by) / alpha;
        const k = j * cols + i;
        inside[k] = 1;
        odds[k] = presence((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255);
        // Quantised so the color phase can batch fills by color.
        color[k] = `rgb(${q(r)},${q(g)},${q(b)})`;
      }

    // Rounded staircase; corners snap to device pixel centres so the
    // hairline stays crisp.
    const outline = new Path2D();
    const snap = (v: number) => (Math.floor(v * unit) + 0.5) / unit;
    const radius = size * CORNER;
    for (const corners of traceLoops(inside, cols, rows).loops) {
      const p = corners.map(([x, y]) => [
        snap(ox + x * size),
        snap(oy + y * size),
      ]);
      const last = p[p.length - 1];
      outline.moveTo((last[0] + p[0][0]) / 2, (last[1] + p[0][1]) / 2);
      for (let k = 0; k < p.length; k++) {
        const b = p[(k + 1) % p.length];
        outline.arcTo(p[k][0], p[k][1], b[0], b[1], radius);
      }
      outline.closePath();
    }
    const grid = { size, cols, rows, ox, oy, inside, odds, color, outline };
    grids.set(cell, grid);
    return grid;
  }

  /**
   * Adds one cell's circle and half of each join, inset by half the stroke,
   * so a double-width stroke followed by a fill leaves one centred outline
   * around every cluster.
   */
  function addCell(
    path: Path2D,
    grid: SampledGrid,
    cells: CellLayout,
    k: number,
    w: number,
  ) {
    const { cols, size, ox, oy } = grid;
    const i = k % cols;
    const j = (k - i) / cols;
    const x = ox + (i + 0.5) * size;
    const y = oy + (j + 0.5) * size;
    const r = size * CIRCLE - w / 2;
    path.moveTo(x + r, y);
    path.arc(x, y, r, 0, Math.PI * 2);
    const half = size / 2;
    const reach = (type: number) =>
      (type === 2 ? size * CIRCLE : size * THIN) - w / 2;
    if (cells.right[k]) {
      const h = reach(cells.right[k]);
      path.rect(x, y - h, half, h * 2);
    }
    if (i > 0 && cells.right[k - 1]) {
      const h = reach(cells.right[k - 1]);
      path.rect(x - half, y - h, half, h * 2);
    }
    if (cells.down[k]) {
      const h = reach(cells.down[k]);
      path.rect(x - h, y, h * 2, half);
    }
    if (j > 0 && cells.down[k - cols]) {
      const h = reach(cells.down[k - cols]);
      path.rect(x - h, y - half, h * 2, half);
    }
  }

  /** Mosaic plus the full-resolution image, clipped to the silhouette. */
  function baseFor(cell: number, grid: SampledGrid) {
    const cached = bases.get(cell);
    if (cached || !mask) return cached;
    const base = document.createElement("canvas");
    base.width = canvas.width;
    base.height = canvas.height;
    const b = base.getContext("2d");
    const photo = document.createElement("canvas");
    photo.width = canvas.width;
    photo.height = canvas.height;
    const p = photo.getContext("2d");
    if (!b || !p) return undefined;
    p.setTransform(unit, 0, 0, unit, 0, 0);
    p.drawImage(img, fit.dx, fit.dy, fit.dw, fit.dh);
    p.globalCompositeOperation = "destination-in";
    p.drawImage(mask, 0, 0, width, height);
    b.setTransform(unit, 0, 0, unit, 0, 0);
    b.save();
    b.clip(grid.outline);
    const { cols, rows, inside, color, ox, oy, size } = grid;
    for (let k = 0; k < cols * rows; k++) {
      if (!inside[k]) continue;
      b.fillStyle = color[k];
      const i = k % cols;
      b.fillRect(
        ox + i * size - 0.5,
        oy + ((k - i) / cols) * size - 0.5,
        size + 1,
        size + 1,
      );
    }
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.drawImage(photo, 0, 0);
    b.restore();
    bases.set(cell, base);
    return base;
  }

  function render(time: number, logCell: number, colorMix: number) {
    const cell = Math.round(Math.exp(logCell));
    const seed = Math.floor(time / SHUFFLE);
    const color = Math.round(colorMix * 255) / 255;
    const key = `${cell}:${seed}:${color}`;
    // A hidden (zero-size) container has nothing to draw into.
    if (key === drawn || !canvas.width || !canvas.height) return;
    const grid = gridFor(cell);
    if (!grid) return;
    drawn = key;
    if (`${cell}:${seed}` !== layoutKey || !layout) {
      layout = buildLayout(grid, cell, Math.imul(seed + 1, 2654435761) ^ cell);
      layoutKey = `${cell}:${seed}`;
    }
    const cells = layout;
    const w = Math.min(grid.size * STROKE, STROKE_MAX);
    const n = grid.cols * grid.rows;

    ctx.setTransform(unit, 0, 0, unit, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = HAIRLINE_ALPHA;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1 / unit;
    ctx.stroke(grid.outline);
    ctx.globalAlpha = 1;
    const shapes = new Path2D();
    for (let k = 0; k < n; k++)
      if (cells.on[k]) addCell(shapes, grid, cells, k, w);
    ctx.lineWidth = w * 2;
    ctx.stroke(shapes);
    ctx.fillStyle = colors.background;
    ctx.fill(shapes);

    if (color <= 0) return;
    // Color phase: rendered opaque offscreen, then faded in as one layer.
    const c = colorLayer.getContext("2d");
    const base = baseFor(cell, grid);
    if (!c || !base) return;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, colorLayer.width, colorLayer.height);
    c.drawImage(base, 0, 0);
    c.setTransform(unit, 0, 0, unit, 0, 0);
    const fills = new Map<string, Path2D>();
    for (let k = 0; k < n; k++) {
      if (!cells.on[k]) continue;
      let path = fills.get(grid.color[k]);
      if (!path) {
        path = new Path2D();
        fills.set(grid.color[k], path);
      }
      addCell(path, grid, cells, k, w);
    }
    c.lineWidth = w * 2;
    c.strokeStyle = colors.stroke;
    c.stroke(shapes);
    for (const [fill, path] of fills) {
      c.fillStyle = fill;
      c.fill(path);
    }
    c.globalAlpha = 0.5;
    c.lineWidth = 1 / unit;
    c.stroke(grid.outline);
    c.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = color;
    ctx.drawImage(colorLayer, 0, 0);
    ctx.globalAlpha = 1;
  }

  return { render, resize };
}

export default function CellPortrait({
  src = DEFAULT_SRC,
  alt = "Portrait drawn as joined circles",
  background = "#2253E9",
  stroke = "#FFFFFF",
  cellFrom = 36,
  cellTo = 7,
  cellDetail = 5,
  speed = 1,
  className,
  style,
}: CellPortraitProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loopRef = useRef<gsap.core.Timeline | null>(null);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    loopRef.current?.timeScale(speed);
  }, [speed]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    let cancelled = false;
    let visible = true;
    let frame = 0;
    let cleanup = () => {};
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img
      .decode()
      .then(() => {
        if (cancelled) return;
        const renderer = createRenderer(canvas, ctx, img, {
          background,
          stroke,
        });
        const state: LoopState = { logCell: Math.log(cellFrom), color: 0 };
        const loop = createLoop(state, {
          from: cellFrom,
          to: cellTo,
          detail: cellDetail,
        }).timeScale(speedRef.current);
        loopRef.current = loop;
        const draw = () =>
          renderer.render(loop.totalTime(), state.logCell, state.color);
        loop.eventCallback("onUpdate", draw);

        const sync = () => {
          if (motion.matches) {
            loop.pause();
            loop.totalTime(HOLD_AT);
          } else if (visible) loop.play();
          else loop.pause();
          draw();
        };
        renderer.resize();
        sync();

        const resize = new ResizeObserver(() => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            renderer.resize();
            draw();
          });
        });
        resize.observe(root);
        const view = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          sync();
        });
        view.observe(root);
        motion.addEventListener("change", sync);
        cleanup = () => {
          resize.disconnect();
          view.disconnect();
          motion.removeEventListener("change", sync);
          loop.kill();
          loopRef.current = null;
        };
      })
      .catch(() => {
        // Unloadable or CORS-blocked image: the background color stays.
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, [src, background, stroke, cellFrom, cellTo, cellDetail]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background,
        overflow: "hidden",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

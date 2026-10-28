// Preview draft of the Cell Portrait renderer. Framework-free so it can be
// frame-captured and compared against the reference video before the React port.
// Every constant below was measured from "Dhruv - computational experiments".

/** Reference canvas: the source rendered a 540 CSS px square at DPR 2. */
const BASE = 540;

/**
 * Loop timing in seconds, fitted to the reference frame by frame (cell sizes
 * tweened on a log scale with sine.inOut; 166 of 180 frames match exactly,
 * the rest are one step off).
 */
const TIMING = {
  zoomIn: { at: 0, duration: 1.91 },
  detailIn: { at: 2.323, duration: 0.197 },
  colourIn: { at: 2.373, duration: 0.162 },
  colourOut: { at: 3.909, duration: 0.166 },
  detailOut: { at: 3.98, duration: 0.1 },
  zoomOut: { at: 4.39, duration: 1.61 },
};

const CIRCLE = 1 / 3; // circle radius per cell
const THIN = 1 / 12; // thin bridge half-width per cell
const STROKE = 1 / 12; // stroke width per cell, capped at STROKE_MAX
const STROKE_MAX = 1.4;
const CORNER = 0.45; // silhouette step rounding per cell
const EDGE = 1; // px kept clear between the outermost cells and the canvas edge
const P_JOIN = 0.42; // neighbours that join, at every cell size
// Share of joins that are full capsules grows as cells shrink: 0.45 at 36px, 0.65 at 7px.
const fullShare = (cell) => 0.45 + 0.2 * (Math.log(36 / cell) / Math.log(36 / 7));

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Probability that a cell draws a circle, from its Rec. 709 luma (0..1). */
function presence(luma) {
  return luma >= 0.7 ? 0 : 0.9 - 0.8 * luma;
}

/**
 * Draws the image contain-fit at 1 sample per CSS px and returns RGBA samples.
 * Opaque images get their border colour keyed out with a flood fill, so a
 * white-background illustration still yields a silhouette.
 */
function sampleImage(img, W, H) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const s = Math.min(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  const { data } = ctx.getImageData(0, 0, W, H);

  // Inside the drawn rect but opaque everywhere means no usable alpha: key it.
  const x0 = Math.ceil(dx);
  const y0 = Math.ceil(dy);
  const x1 = Math.floor(dx + dw) - 1;
  const y1 = Math.floor(dy + dh) - 1;
  let hasAlpha = false;
  for (let y = y0; y <= y1 && !hasAlpha; y += 2)
    for (let x = x0; x <= x1; x += 2)
      if (data[(y * W + x) * 4 + 3] < 250) {
        hasAlpha = true;
        break;
      }
  if (!hasAlpha) keyBorder(data, W, x0, y0, x1, y1);
  return { data, fit: { dx, dy, dw, dh } };
}

function keyBorder(data, W, x0, y0, x1, y1) {
  // Background = the most common border colour; skip keying when none dominates.
  const at = (x, y) => (y * W + x) * 4;
  const border = [];
  for (let x = x0; x <= x1; x++) border.push(at(x, y0), at(x, y1));
  for (let y = y0; y <= y1; y++) border.push(at(x0, y), at(x1, y));
  const binOf = (i) =>
    ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
  const votes = new Map();
  for (const i of border) votes.set(binOf(i), (votes.get(binOf(i)) ?? 0) + 1);
  let bin = 0;
  let count = 0;
  for (const [b, c] of votes) if (c > count) [bin, count] = [b, c];
  if (count < border.length * 0.25) return;
  const pick = border.filter((i) => binOf(i) === bin);
  const ref = [0, 1, 2].map(
    (k) => pick.reduce((s, i) => s + data[i + k], 0) / pick.length,
  );
  const near = (i) =>
    Math.abs(data[i] - ref[0]) <= 24 &&
    Math.abs(data[i + 1] - ref[1]) <= 24 &&
    Math.abs(data[i + 2] - ref[2]) <= 24;
  // Key each background-coloured region that touches the border, or that is
  // big enough to be a pocket between strands rather than an eye white.
  const minArea = (x1 - x0 + 1) * (y1 - y0 + 1) * 0.004;
  const seen = new Uint8Array(data.length / 4);
  const region = [];
  for (let sy = y0; sy <= y1; sy++)
    for (let sx = x0; sx <= x1; sx++) {
      const start = sy * W + sx;
      if (seen[start] || !near(start * 4)) continue;
      seen[start] = 1;
      region.length = 0;
      region.push(start);
      let edge = false;
      for (let r = 0; r < region.length; r++) {
        const p = region[r];
        const x = p % W;
        const y = (p - x) / W;
        if (x === x0 || x === x1 || y === y0 || y === y1) edge = true;
        for (const q of [
          x > x0 ? p - 1 : -1,
          x < x1 ? p + 1 : -1,
          y > y0 ? p - W : -1,
          y < y1 ? p + W : -1,
        ])
          if (q >= 0 && !seen[q] && near(q * 4)) {
            seen[q] = 1;
            region.push(q);
          }
      }
      if (edge || region.length >= minArea)
        for (const p of region) data[p * 4 + 3] = 0;
    }
}

/** Summed-area tables of premultiplied RGB and alpha, for O(1) cell averages. */
function integrate(data, W, H) {
  const S = W + 1;
  const sums = [0, 1, 2, 3].map(() => new Float64Array(S * (H + 1)));
  for (let y = 0; y < H; y++) {
    const row = [0, 0, 0, 0];
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const a = data[i + 3] / 255;
      row[0] += data[i] * a;
      row[1] += data[i + 1] * a;
      row[2] += data[i + 2] * a;
      row[3] += a;
      const o = (y + 1) * S + x + 1;
      for (let k = 0; k < 4; k++) sums[k][o] = sums[k][o - S] + row[k];
    }
  }
  return (k, ax, ay, bx, by) =>
    sums[k][by * S + bx] -
    sums[k][ay * S + bx] -
    sums[k][by * S + ax] +
    sums[k][ay * S + ax];
}

/** Grid for one cell size, anchored so a grid line crosses the canvas centre. */
function buildGrid(size, W, H, sum, dpr) {
  const cx = W / 2;
  const cy = H / 2;
  const i0 = -Math.ceil(cx / size);
  const j0 = -Math.ceil(cy / size);
  const cols = Math.ceil((W - cx) / size) - i0;
  const rows = Math.ceil((H - cy) / size) - j0;
  const n = cols * rows;
  const inside = new Uint8Array(n);
  const odds = new Float32Array(n);
  const colour = new Array(n);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const left = cx + (i0 + i) * size;
      const top = cy + (j0 + j) * size;
      // Only whole cells: nothing is cut by the canvas edge, and the
      // silhouette always closes inside the frame.
      if (
        left < EDGE ||
        top < EDGE ||
        left + size > W - EDGE ||
        top + size > H - EDGE
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
      // Quantised to steps of 4 so the colour phase can batch cells by colour.
      const q = (v) => Math.min(255, Math.round(v / 4) * 4);
      colour[k] = `rgb(${q(r)},${q(g)},${q(b)})`;
    }
  }
  const ox = cx + i0 * size;
  const oy = cy + j0 * size;
  return {
    size,
    cols,
    rows,
    ox,
    oy,
    inside,
    odds,
    colour,
    outline: traceOutline(inside, cols, rows, ox, oy, size, dpr),
  };
}

/**
 * Rounded staircase around the in-mask cells. Boundary edges are walked
 * clockwise (inside on the right), merged into corner loops, then every
 * corner is rounded with arcTo.
 */
function traceOutline(inside, cols, rows, ox, oy, size, dpr) {
  const In = (i, j) =>
    i >= 0 && j >= 0 && i < cols && j < rows && inside[j * cols + i] === 1;
  const W1 = cols + 1;
  const key = (x, y) => y * W1 + x;
  const out = new Map(); // vertex -> list of [toX, toY]
  const add = (x0, y0, x1, y1) => {
    const k = key(x0, y0);
    const list = out.get(k);
    if (list) list.push([x1, y1]);
    else out.set(k, [[x1, y1]]);
  };
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      if (!In(i, j)) continue;
      if (!In(i, j - 1)) add(i, j, i + 1, j);
      if (!In(i + 1, j)) add(i + 1, j, i + 1, j + 1);
      if (!In(i, j + 1)) add(i + 1, j + 1, i, j + 1);
      if (!In(i - 1, j)) add(i, j + 1, i, j);
    }
  const path = new Path2D();
  const loops = { closed: 0, open: 0 };
  const radius = size * CORNER;
  for (const [startKey, list] of out) {
    while (list.length) {
      let x = startKey % W1;
      let y = Math.floor(startKey / W1);
      let [nx, ny] = list.pop();
      const pts = [[x, y]];
      let dx = nx - x;
      let dy = ny - y;
      for (;;) {
        x = nx;
        y = ny;
        if (key(x, y) === startKey) {
          loops.closed++; // back where this loop began
          break;
        }
        const next = out.get(key(x, y));
        if (!next || !next.length) {
          loops.open++;
          break;
        }
        // At a pinch vertex, turn right first so diagonal cells stay separate loops.
        let pick = 0;
        if (next.length > 1) {
          const rx = -dy;
          const ry = dx;
          const idx = next.findIndex(([tx, ty]) => tx - x === rx && ty - y === ry);
          if (idx >= 0) pick = idx;
        }
        [nx, ny] = next.splice(pick, 1)[0];
        const ndx = nx - x;
        const ndy = ny - y;
        if (ndx !== dx || ndy !== dy) pts.push([x, y]);
        dx = ndx;
        dy = ndy;
      }
      if (pts.length < 3) continue;
      // Snap to device pixel centres so the 1px hairline stays crisp.
      const snap = (v) => (Math.floor(v * dpr) + 0.5) / dpr;
      const P = pts.map(([px, py]) => [snap(ox + px * size), snap(oy + py * size)]);
      const last = P[P.length - 1];
      path.moveTo((last[0] + P[0][0]) / 2, (last[1] + P[0][1]) / 2);
      for (let k = 0; k < P.length; k++) {
        const a = P[k];
        const b = P[(k + 1) % P.length];
        path.arcTo(a[0], a[1], b[0], b[1], radius);
      }
      path.closePath();
    }
  }
  path.loops = loops;
  return path;
}

/** One random layout: which cells draw a circle and how neighbours join. */
function buildLayout(grid, cell, seed) {
  const rand = mulberry32(seed);
  const pFull = P_JOIN * fullShare(cell);
  const { cols, rows, inside, odds } = grid;
  const n = cols * rows;
  const on = new Uint8Array(n);
  const right = new Uint8Array(n); // 0 none, 1 thin, 2 full
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

/**
 * Adds one cell's geometry (circle plus half of each bridge) inset by half the
 * stroke, so a 2x stroke followed by a fill leaves a centred outline of the union.
 */
function addCell(path, grid, layout, k, w) {
  const { cols, size, ox, oy } = grid;
  const i = k % cols;
  const j = (k / cols) | 0;
  const x = ox + (i + 0.5) * size;
  const y = oy + (j + 0.5) * size;
  const r = size * CIRCLE - w / 2;
  path.moveTo(x + r, y);
  path.arc(x, y, r, 0, Math.PI * 2);
  const half = size / 2;
  const width = (type) => (type === 2 ? size * CIRCLE : size * THIN) - w / 2;
  const { right, down } = layout;
  if (right[k]) path.rect(x, y - width(right[k]), half, width(right[k]) * 2);
  if (i > 0 && right[k - 1]) {
    const h = width(right[k - 1]);
    path.rect(x - half, y - h, half, h * 2);
  }
  if (down[k]) path.rect(x - width(down[k]), y, width(down[k]) * 2, half);
  if (j > 0 && down[k - cols]) {
    const h = width(down[k - cols]);
    path.rect(x - h, y - half, h * 2, half);
  }
}

export function createCellPortrait(canvas, img, options = {}) {
  const gsap = window.gsap;
  const {
    background = "#2253E9",
    stroke = "#FFFFFF",
    cellFrom = 36,
    cellTo = 7,
    cellDetail = 5,
    shuffleMs = 400 / 3,
    dpr: forcedDpr,
  } = options;
  const ctx = canvas.getContext("2d");
  const state = { logCell: Math.log(cellFrom), colour: 0 };
  let W = 0;
  let H = 0;
  let dpr = 1;
  let scale = 1;
  let sum = null;
  let fit = null;
  let grids = new Map();
  let bases = new Map();
  let layoutKey = "";
  let layout = null;
  let lastDrawn = "";
  let keyed = null;
  const colourLayer = document.createElement("canvas");

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    dpr = forcedDpr ?? Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    colourLayer.width = canvas.width;
    colourLayer.height = canvas.height;
    scale = Math.min(W, H) / BASE;
    const sampled = sampleImage(img, W, H);
    fit = sampled.fit;
    sum = integrate(sampled.data, W, H);
    keyed = sampled.data;
    grids = new Map();
    bases = new Map();
    lastDrawn = "";
    layoutKey = "";
  }

  const gridFor = (cell) => {
    let g = grids.get(cell);
    if (!g) {
      g = buildGrid(cell * scale, W, H, sum, dpr);
      grids.set(cell, g);
    }
    return g;
  };

  /** Mosaic plus the full image, clipped to the silhouette, cached per cell size. */
  function baseFor(cell, grid) {
    let base = bases.get(cell);
    if (base) return base;
    base = document.createElement("canvas");
    base.width = canvas.width;
    base.height = canvas.height;
    const b = base.getContext("2d");
    b.setTransform(dpr, 0, 0, dpr, 0, 0);
    b.save();
    b.clip(grid.outline);
    const { cols, rows, inside, colour, ox, oy, size } = grid;
    for (let k = 0; k < cols * rows; k++) {
      if (!inside[k]) continue;
      b.fillStyle = colour[k];
      b.fillRect(ox + (k % cols) * size - 0.5, oy + ((k / cols) | 0) * size - 0.5, size + 1, size + 1);
    }
    // Full-resolution image, masked by the sampled (possibly keyed) alpha.
    const mask = document.createElement("canvas");
    mask.width = W;
    mask.height = H;
    mask.getContext("2d").putImageData(new ImageData(keyed, W, H), 0, 0);
    const photo = document.createElement("canvas");
    photo.width = canvas.width;
    photo.height = canvas.height;
    const p = photo.getContext("2d");
    p.setTransform(dpr, 0, 0, dpr, 0, 0);
    p.drawImage(img, fit.dx, fit.dy, fit.dw, fit.dh);
    p.globalCompositeOperation = "destination-in";
    p.drawImage(mask, 0, 0, W, H);
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.drawImage(photo, 0, 0);
    b.restore();
    bases.set(cell, base);
    return base;
  }

  function render(force = false) {
    if (!sum) return;
    const t = tl.totalTime();
    const cell = Math.round(Math.exp(state.logCell));
    const seed = Math.floor((t * 1000) / shuffleMs);
    const colour = Math.round(state.colour * 255) / 255;
    const drawKey = `${cell}:${seed}:${colour}`;
    if (!force && drawKey === lastDrawn) return;
    lastDrawn = drawKey;
    const grid = gridFor(cell);
    const lk = `${cell}:${seed}`;
    if (lk !== layoutKey) {
      layout = buildLayout(grid, cell, Math.imul(seed + 1, 2654435761) ^ cell);
      layoutKey = lk;
    }
    const w = Math.min(grid.size * STROKE, STROKE_MAX * scale);
    const hair = 1 / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);

    // Outline phase: hairline silhouette, white union outlines over the background.
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = hair;
    ctx.stroke(grid.outline);
    ctx.globalAlpha = 1;
    const shapes = new Path2D();
    const n = grid.cols * grid.rows;
    for (let k = 0; k < n; k++) if (layout.on[k]) addCell(shapes, grid, layout, k, w);
    ctx.lineWidth = w * 2;
    ctx.stroke(shapes);
    ctx.fillStyle = background;
    ctx.fill(shapes);

    if (colour <= 0) return;
    // Colour phase, rendered opaque offscreen then faded in as one layer.
    const c = colourLayer.getContext("2d");
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, colourLayer.width, colourLayer.height);
    c.drawImage(baseFor(cell, grid), 0, 0);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Same white union outlines; each cell is filled with its sampled colour.
    const groups = new Map();
    for (let k = 0; k < n; k++) {
      if (!layout.on[k]) continue;
      let path = groups.get(grid.colour[k]);
      if (!path) {
        path = new Path2D();
        groups.set(grid.colour[k], path);
      }
      addCell(path, grid, layout, k, w);
    }
    c.lineWidth = w * 2;
    c.strokeStyle = stroke;
    c.stroke(shapes);
    for (const [fill, path] of groups) {
      c.fillStyle = fill;
      c.fill(path);
    }
    c.globalAlpha = 0.5;
    c.strokeStyle = stroke;
    c.lineWidth = hair;
    c.stroke(grid.outline);
    c.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = colour;
    ctx.drawImage(colourLayer, 0, 0);
    ctx.globalAlpha = 1;
  }

  const lg = Math.log;
  const T = TIMING;
  const tl = gsap.timeline({ repeat: -1, onUpdate: () => render() });
  tl.fromTo(
    state,
    { logCell: lg(cellFrom) },
    { logCell: lg(cellTo), duration: T.zoomIn.duration, ease: "sine.inOut" },
    T.zoomIn.at,
  )
    .to(state, { logCell: lg(cellDetail), duration: T.detailIn.duration, ease: "sine.inOut" }, T.detailIn.at)
    .fromTo(state, { colour: 0 }, { colour: 1, duration: T.colourIn.duration, ease: "sine.inOut" }, T.colourIn.at)
    .to(state, { colour: 0, duration: T.colourOut.duration, ease: "sine.inOut" }, T.colourOut.at)
    .to(state, { logCell: lg(cellTo), duration: T.detailOut.duration, ease: "sine.inOut" }, T.detailOut.at)
    .to(state, { logCell: lg(cellFrom), duration: T.zoomOut.duration, ease: "sine.inOut" }, T.zoomOut.at);

  resize();
  render(true);

  return {
    tl,
    state,
    seek(seconds) {
      tl.pause();
      tl.totalTime(seconds);
      render(true);
    },
    /** Rounded base cell size the renderer shows at a given loop time. */
    cellAt(seconds) {
      const keep = tl.totalTime();
      tl.totalTime(seconds, true);
      const cell = Math.round(Math.exp(state.logCell));
      tl.totalTime(keep, true);
      return cell;
    },
    colourAt(seconds) {
      const keep = tl.totalTime();
      tl.totalTime(seconds, true);
      const v = state.colour;
      tl.totalTime(keep, true);
      return v;
    },
    /** Debug: loop closure and edge clearance for one base cell size. */
    inspect(cell) {
      const g = gridFor(cell);
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (let k = 0; k < g.cols * g.rows; k++) {
        if (!g.inside[k]) continue;
        const x = g.ox + (k % g.cols) * g.size;
        const y = g.oy + ((k / g.cols) | 0) * g.size;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + g.size);
        maxY = Math.max(maxY, y + g.size);
      }
      return { ...g.outline.loops, minX, minY, maxX, maxY, W, H };
    },
    resize() {
      resize();
      render(true);
    },
    kill() {
      tl.kill();
    },
  };
}

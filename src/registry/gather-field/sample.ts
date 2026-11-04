export type Paper = "dark" | "light";
export type Tone = "negative" | "true";

export type Cloud = {
  home: Float32Array;
  color: Float32Array;
  seed: Float32Array;
  /** Indices of strong, spread-out points for the trackers to lock onto. */
  feats: Uint32Array;
};

/**
 * Hilbert cell for a power-of-two grid. Walking d from 0 covers every cell once,
 * so the same index in two pictures is the same place in the curve.
 */
export function hilbertXY(n: number, d: number): [number, number] {
  let x = 0;
  let y = 0;
  let t = d;
  for (let s = 1; s < n; s *= 2) {
    const rx = 1 & Math.floor(t / 2);
    const ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      const swap = x;
      x = y;
      y = swap;
    }
    x += s * rx;
    y += s * ry;
    t = Math.floor(t / 4);
  }
  return [x, y];
}

function boxBlur(src: Float32Array, size: number, radius: number) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const span = radius * 2 + 1;
  const clamp = (v: number) => (v < 0 ? 0 : v >= size ? size - 1 : v);

  for (let y = 0; y < size; y++) {
    let sum = 0;
    for (let x = -radius; x <= radius; x++) {
      sum += src[y * size + clamp(x)];
    }
    for (let x = 0; x < size; x++) {
      tmp[y * size + x] = sum / span;
      sum -= src[y * size + clamp(x - radius)];
      sum += src[y * size + clamp(x + radius + 1)];
    }
  }

  for (let x = 0; x < size; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      sum += tmp[clamp(y) * size + x];
    }
    for (let y = 0; y < size; y++) {
      out[y * size + x] = sum / span;
      sum -= tmp[clamp(y - radius) * size + x];
      sum += tmp[clamp(y + radius + 1) * size + x];
    }
  }
  return out;
}

function signalFor(lum: number, paper: Paper, tone: Tone) {
  if (paper === "light" && tone === "true") return 1 - lum;
  return lum;
}

/**
 * Hand points out along the curve in proportion to brightness and edge.
 * Dark paper keeps the bright pixels. On white paper, Negative does the same
 * and True keeps the dark pixels, which then print as ink.
 */
export function samplePlate(
  rgba: Uint8ClampedArray,
  depth: Float32Array | null,
  size: number,
  count: number,
  paper: Paper,
  tone: Tone,
): Cloud {
  if ((size & (size - 1)) !== 0) {
    throw new Error("gather-field: plate size must be a power of two");
  }

  const cells = size * size;
  const lum = new Float32Array(cells);
  for (let i = 0; i < cells; i++) {
    const o = i * 4;
    lum[i] =
      (rgba[o] * 0.2126 + rgba[o + 1] * 0.7152 + rgba[o + 2] * 0.0722) / 255;
  }
  const blur = boxBlur(lum, size, 5);
  const weight = new Float32Array(cells);
  let total = 0;

  for (let y = 0; y < size; y++) {
    const y0 = y > 0 ? y - 1 : 0;
    const y1 = y < size - 1 ? y + 1 : y;
    for (let x = 0; x < size; x++) {
      const x0 = x > 0 ? x - 1 : 0;
      const x1 = x < size - 1 ? x + 1 : x;
      const i = y * size + x;
      const edge = Math.min(
        1,
        Math.hypot(
          lum[y * size + x1] - lum[y * size + x0],
          lum[y1 * size + x] - lum[y0 * size + x],
        ) * 3.2,
      );
      const signal = signalFor(lum[i], paper, tone);
      const w = signal ** 0.85 * (0.6 + edge * 1.0);
      weight[i] = w;
      total += w;
    }
  }

  const home = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const score = new Float32Array(count);
  const step = total > 1e-6 ? total / count : 0;
  const rand = prng(0x5eed1234 ^ size ^ count);
  let acc = 0;
  let next = step * rand();
  let placed = 0;

  if (step > 0) {
    for (let d = 0; d < cells && placed < count; d++) {
      const [x, y] = hilbertXY(size, d);
      const i = y * size + x;
      acc += weight[i];
      while (placed < count && acc >= next) {
        // Anywhere in the cell and a little past it, so no grid shows.
        const px = ((x + 0.5 + (rand() - 0.5) * 1.3) / size) * 2 - 1;
        const py = 1 - ((y + 0.5 + (rand() - 0.5) * 1.3) / size) * 2;
        const zRaw = depth ? depth[i] : blur[i];
        const o = placed * 3;
        home[o] = px;
        home[o + 1] = py;
        home[o + 2] = (zRaw - 0.5) * 0.72 + (rand() - 0.5) * 0.012;
        const p = i * 4;
        color[o] = rgba[p] / 255;
        color[o + 1] = rgba[p + 1] / 255;
        color[o + 2] = rgba[p + 2] / 255;
        seed[placed] = rand();
        score[placed] = weight[i];
        placed += 1;
        next += step;
      }
    }
  }

  const last = Math.max(0, placed - 1);
  for (let i = placed; i < count; i++) {
    home[i * 3] = home[last * 3];
    home[i * 3 + 1] = home[last * 3 + 1];
    home[i * 3 + 2] = home[last * 3 + 2];
    color[i * 3] = color[last * 3];
    color[i * 3 + 1] = color[last * 3 + 1];
    color[i * 3 + 2] = color[last * 3 + 2];
    seed[i] = rand();
  }

  return { home, color, seed, feats: pickFeatures(home, score, placed) };
}

/**
 * Best point in each cell of a 20 by 20 grid, then the strongest of those,
 * kept apart: widely first, then closer, up to 48.
 */
function pickFeatures(home: Float32Array, score: Float32Array, n: number) {
  const bins = 20;
  const best = new Int32Array(bins * bins).fill(-1);
  for (let i = 0; i < n; i++) {
    const bx = Math.min(bins - 1, Math.floor(((home[i * 3] + 1) / 2) * bins));
    const by = Math.min(
      bins - 1,
      Math.floor(((home[i * 3 + 1] + 1) / 2) * bins),
    );
    if (bx < 0 || by < 0) continue;
    const b = by * bins + bx;
    if (best[b] < 0 || score[i] > score[best[b]]) best[b] = i;
  }
  // A bin holding only stray dust is not a feature.
  let top = 0;
  for (const i of best) if (i >= 0 && score[i] > top) top = score[i];
  const ranked = [...best].filter((i) => i >= 0 && score[i] > top * 0.3);
  ranked.sort((a, b) => score[b] - score[a]);
  const picked: number[] = [];
  for (const [gap, cap] of [
    [0.45, 12],
    [0.18, 48],
  ] as const) {
    for (const i of ranked) {
      if (picked.length >= cap) break;
      const x = home[i * 3];
      const y = home[i * 3 + 1];
      const clear = picked.every(
        (j) => Math.hypot(home[j * 3] - x, home[j * 3 + 1] - y) > gap,
      );
      if (clear) picked.push(i);
    }
  }
  return Uint32Array.from(picked);
}

/** Small seeded generator, so a plate samples the same way every time. */
function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Grid edge for a point count. 2^18 lands on 512. 2^19 lands on 1024. */
export function gridFor(count: number) {
  const bits = Math.max(4, Math.round(Math.log2(Math.max(2, count))));
  const edge = 1 << Math.ceil(bits / 2);
  return Math.min(1024, Math.max(64, edge));
}

export function shuffleIndices(count: number, seed: number) {
  const order = new Uint32Array(count);
  for (let i = 0; i < count; i++) order[i] = i;
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    const swap = order[i];
    order[i] = order[j];
    order[j] = swap;
  }
  return order;
}

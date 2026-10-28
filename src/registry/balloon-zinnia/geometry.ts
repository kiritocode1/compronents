import type { ColorStop } from "./model";
import { clamp, DEG, PALETTE_WIDTH, STEM_SAMPLES, TAU } from "./model";

const STEM_NECK = 0.12;
const STEM_REACH = 0.71;
const STEM_START = 1.2;
const STEM_LENGTH = 17;
const STEM_LEAN = 48 * DEG;
const STEM_WAVES = 3;

function parseColor(input: string): [number, number, number] | null {
  const hex = input.trim().match(/#([0-9a-f]{3,8})\b/i);
  if (hex) {
    let body = hex[1] ?? "";
    if (body.length === 3 || body.length === 4) {
      body = body
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (body.length === 6 || body.length === 8) {
      const value = Number.parseInt(body.slice(0, 6), 16);
      return [
        ((value >> 16) & 255) / 255,
        ((value >> 8) & 255) / 255,
        (value & 255) / 255,
      ];
    }
  }
  const rgb = input.match(/rgba?\(([^)]+)\)/i);
  if (!rgb?.[1]) return null;
  const channels = rgb[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((part) =>
      part.endsWith("%")
        ? (Number.parseFloat(part) / 100) * 255
        : Number.parseFloat(part),
    );
  return [
    clamp((channels[0] || 0) / 255, 0, 1),
    clamp((channels[1] || 0) / 255, 0, 1),
    clamp((channels[2] || 0) / 255, 0, 1),
  ];
}

/**
 * Bake the looping ramp into a 512-wide RGBA row. Stops wrap, and the last
 * one blends back into the first so the stripe has no seam.
 */
export function writePalette(stops: readonly ColorStop[], out: Uint8Array) {
  const count = stops.length;
  const colors: [number, number, number][] = [];
  const edges: number[] = [];
  let span = 0;
  for (let i = 0; i < count; i++) {
    const stop = stops[i];
    const parsed = stop ? parseColor(stop.color) : null;
    colors.push(parsed ?? [0, 0, 0]);
    edges.push(span);
    span += clamp(stop?.width ?? 1, 0.1, 100);
  }
  let index = 0;
  for (let x = 0; x < PALETTE_WIDTH; x++) {
    const at = ((x + 0.5) / PALETTE_WIDTH) * span;
    while (index < count - 1 && (edges[index + 1] ?? 0) <= at) index++;
    const start = edges[index] ?? 0;
    const end = index < count - 1 ? (edges[index + 1] ?? span) : span;
    const width = end - start;
    const t = width > 0 ? clamp((at - start) / width, 0, 1) : 0;
    const from = colors[index] ?? [0, 0, 0];
    const to = colors[(index + 1) % count] ?? from;
    for (let channel = 0; channel < 3; channel++) {
      out[x * 4 + channel] = Math.round(
        ((from[channel] ?? 0) +
          ((to[channel] ?? 0) - (from[channel] ?? 0)) * t) *
          255,
      );
    }
    out[x * 4 + 3] = 255;
  }
}

/**
 * S-curved stem. `curve` is 0..3 (the control's percent / 100). Samples land
 * in `positions`, with a parallel-transported normal and binormal beside them.
 */
export function writeStem(
  curve: number,
  positions: Float64Array,
  normals: Float64Array,
  binormals: Float64Array,
) {
  const knots: number[] = [
    0,
    -0.21,
    -0.22,
    STEM_NECK,
    -0.62,
    -0.52 * curve - 0.1 * (1 - curve),
    STEM_NECK,
    -1,
    -STEM_REACH * curve * 0.99,
  ];
  for (let y = STEM_START; y <= STEM_LENGTH + 2; y += 0.3) {
    knots.push(
      STEM_NECK,
      -y,
      -STEM_REACH * curve * Math.cos((TAU * (y - STEM_START)) / STEM_WAVES),
    );
  }
  const leanCos = Math.cos(STEM_LEAN);
  const leanSin = Math.sin(STEM_LEAN);
  const leaned: number[] = [];
  for (let i = 0; i < knots.length; i += 3) {
    const x = knots[i] ?? 0;
    const y = knots[i + 1] ?? 0;
    const z = knots[i + 2] ?? 0;
    leaned.push(x, leanCos * y - leanSin * z, leanSin * y + leanCos * z);
  }
  const knotCount = leaned.length / 3;
  const dense: number[] = [];
  const steps = 16;
  for (let i = 0; i < knotCount - 1; i++) {
    const i0 = Math.max(0, i - 1);
    const i2 = i + 1;
    const i3 = Math.min(knotCount - 1, i + 2);
    for (let step = 0; step < steps; step++) {
      const t = step / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      for (let axis = 0; axis < 3; axis++) {
        const p0 = leaned[i0 * 3 + axis] ?? 0;
        const p1 = leaned[i * 3 + axis] ?? 0;
        const p2 = leaned[i2 * 3 + axis] ?? 0;
        const p3 = leaned[i3 * 3 + axis] ?? 0;
        dense.push(
          0.5 *
            (2 * p1 +
              (-p0 + p2) * t +
              (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
              (-p0 + 3 * p1 - 3 * p2 + p3) * t3),
        );
      }
    }
  }
  const denseCount = dense.length / 3;
  const distance = new Float64Array(denseCount);
  for (let i = 1; i < denseCount; i++) {
    distance[i] =
      (distance[i - 1] ?? 0) +
      Math.hypot(
        (dense[i * 3] ?? 0) - (dense[i * 3 - 3] ?? 0),
        (dense[i * 3 + 1] ?? 0) - (dense[i * 3 - 2] ?? 0),
        (dense[i * 3 + 2] ?? 0) - (dense[i * 3 - 1] ?? 0),
      );
  }
  const limit = Math.min(distance[denseCount - 1] ?? 0, STEM_LENGTH);
  let cursor = 0;
  for (let i = 0; i < STEM_SAMPLES; i++) {
    const at = (i / (STEM_SAMPLES - 1)) * limit;
    while (cursor < denseCount - 2 && (distance[cursor + 1] ?? 0) < at)
      cursor++;
    const span = Math.max(
      1e-9,
      (distance[cursor + 1] ?? 0) - (distance[cursor] ?? 0),
    );
    const t = clamp((at - (distance[cursor] ?? 0)) / span, 0, 1);
    for (let axis = 0; axis < 3; axis++) {
      const from = dense[cursor * 3 + axis] ?? 0;
      const to = dense[cursor * 3 + 3 + axis] ?? 0;
      positions[i * 3 + axis] = from + (to - from) * t;
    }
  }
  let nx = 1;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < STEM_SAMPLES; i++) {
    const prev = Math.max(0, i - 1);
    const next = Math.min(STEM_SAMPLES - 1, i + 1);
    let tx = (positions[next * 3] ?? 0) - (positions[prev * 3] ?? 0);
    let ty = (positions[next * 3 + 1] ?? 0) - (positions[prev * 3 + 1] ?? 0);
    let tz = (positions[next * 3 + 2] ?? 0) - (positions[prev * 3 + 2] ?? 0);
    const length = Math.hypot(tx, ty, tz) || 1;
    tx /= length;
    ty /= length;
    tz /= length;
    const dot = nx * tx + ny * ty + nz * tz;
    nx -= dot * tx;
    ny -= dot * ty;
    nz -= dot * tz;
    const normalLength = Math.hypot(nx, ny, nz) || 1;
    nx /= normalLength;
    ny /= normalLength;
    nz /= normalLength;
    normals[i * 3] = nx;
    normals[i * 3 + 1] = ny;
    normals[i * 3 + 2] = nz;
    binormals[i * 3] = ty * nz - tz * ny;
    binormals[i * 3 + 1] = tz * nx - tx * nz;
    binormals[i * 3 + 2] = tx * ny - ty * nx;
  }
}

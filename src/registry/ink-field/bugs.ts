/**
 * Bug-bite etching: the CPU half of the metallic subsystem.
 *
 * `metallic.frag` needs two textures. `bugsMask` carries coverage in its alpha
 * channel (the shader differentiates it into a surface normal) and `bugsData`
 * stores each bite's centre in its red and green channels so the shader can
 * compute a per-bite view vector.
 *
 * The scan picks dark pixels out of the finished artwork, weighted toward the
 * darkest, with a minimum-distance rejection so bites do not clump. The result
 * of that scan is returned rather than recomputed on replay: a pixel scan
 * depends on exact rendered output, which is not reproducible across GPUs, so
 * recording the outcome is what keeps a piece stable.
 *
 * BLANK - aryank.space
 */

import { drawShape, makeShape } from "./brush";
import type { InkRandom } from "./rng";

export interface BiteTarget {
  x: number;
  y: number;
  brightness: number;
}

export interface BugScanOptions {
  /** Number of bites to place. The original always picks ten. */
  count?: number;
  /** Sampling stride in device pixels. */
  stride?: number;
  /** Ignore pixels brighter than this (0-255). */
  darkThreshold?: number;
  /** Minimum spacing between bites, in device pixels. */
  minDistance?: number;
}

/**
 * Finds dark points in an RGBA readback. Returns the chosen targets so they can
 * be stored and replayed instead of rescanned.
 */
export function scanForBites(
  pixels: Uint8Array,
  width: number,
  height: number,
  rng: InkRandom,
  options: BugScanOptions = {},
): BiteTarget[] {
  const count = options.count ?? 10;
  const stride = options.stride ?? 8;
  const darkThreshold = options.darkThreshold ?? 200;
  const minDistance = options.minDistance ?? Math.min(width, height) * 0.08;

  const candidates: BiteTarget[] = [];
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const brightness =
        0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      if (brightness < darkThreshold) candidates.push({ x, y, brightness });
    }
  }
  if (candidates.length === 0) return [];

  // Consider the darker half, weighted so darker pixels are likelier.
  candidates.sort((a, b) => a.brightness - b.brightness);
  const pool = candidates.slice(
    0,
    Math.max(1, Math.floor(candidates.length * 0.5)),
  );

  const chosen: BiteTarget[] = [];
  const minDistSq = minDistance * minDistance;
  let guard = 0;

  while (chosen.length < count && pool.length > 0 && guard < count * 40) {
    guard++;
    // Weight toward the head of the pool (the darkest pixels).
    const t = rng.random(0, 1);
    const index = Math.min(pool.length - 1, Math.floor(t * t * pool.length));
    const pick = pool[index];
    const tooClose = chosen.some((c) => {
      const dx = c.x - pick.x;
      const dy = c.y - pick.y;
      return dx * dx + dy * dy < minDistSq;
    });
    pool.splice(index, 1);
    if (!tooClose) chosen.push(pick);
  }

  return chosen;
}

export interface BiteTextures {
  mask: HTMLCanvasElement;
  data: HTMLCanvasElement;
}

/**
 * Rasterises the bites into the mask and data textures. Each bite pre-draws its
 * full random table before any geometry, so the draw count stays fixed however
 * the shapes rasterise.
 */
export function renderBites(
  targets: BiteTarget[],
  width: number,
  height: number,
  rng: InkRandom,
  biteSize: number,
  shapeType: number,
  existing?: BiteTextures,
): BiteTextures {
  const mask = existing?.mask ?? document.createElement("canvas");
  const data = existing?.data ?? document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  data.width = width;
  data.height = height;

  const maskCtx = mask.getContext("2d");
  const dataCtx = data.getContext("2d");
  if (!maskCtx || !dataCtx) return { mask, data };

  maskCtx.clearRect(0, 0, width, height);
  dataCtx.clearRect(0, 0, width, height);
  if (targets.length === 0) return { mask, data };

  const rolls = targets.map(() => ({
    colorRand1: rng.random(0, 1),
    colorRand2: rng.random(0, 1),
    colorRand3: rng.random(0, 1),
    sizeRand1: rng.random(0, 1),
    sizeRand2: rng.random(0, 1),
    sizeRand3: rng.random(0, 1),
    shapeSeed: rng.random(0, 10000),
  }));

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const roll = rolls[i];
    const size = biteSize * (0.6 + roll.sizeRand1 * 1.4);
    const shape = makeShape(rng, shapeType, size, Math.floor(roll.shapeSeed));

    // Mask: alpha is coverage, rgb is a warm base the shader tints.
    const tone = Math.round(120 + roll.colorRand1 * 80);
    drawShape(maskCtx, shape, t.x, t.y, tone, 255, 1);

    // Data: the bite centre in UV, so the shader can build a view vector.
    // Y is flipped because the texture upload flips.
    const u = Math.round((t.x / width) * 255);
    const v = Math.round((1 - t.y / height) * 255);
    dataCtx.fillStyle = `rgba(${u},${v},0,1)`;
    dataCtx.beginPath();
    dataCtx.arc(t.x, t.y, size * 2.2, 0, Math.PI * 2);
    dataCtx.fill();
  }

  return { mask, data };
}

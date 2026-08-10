/**
 * InkField CPU side: everything that happens before the GPU sees a mark.
 *
 * The shaders make ink behave like ink. This module makes a mark behave like a
 * brush. The GPU never sees a stroke, only a grayscale bitmap that a stroke
 * produced, so the inertia, taper, branch bundle and spray all live here.
 *
 * Ported from the InkField build 2026-07-22 (commit 359ab2a): the spring-damper
 * integrator, the speed/size ladders, sub-frame interpolation, the branch
 * offset tables, the fly-branch bundle generator and the four organic shape
 * generators. Constants are the source's, not approximations.
 *
 * BLANK - aryank.space
 */

import { clamp, type InkRandom, lerp, remap } from "./rng";

export type BrushModeId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Stamp mirroring, applied to the first branch of each type. */
const BRUSH_DIR = [
  { flipX: false, flipY: false },
  { flipX: true, flipY: false },
  { flipX: false, flipY: true },
  { flipX: true, flipY: true },
] as const;

/**
 * Branch type 2: five branches at fixed sign/offset pairs. `offsetBase` 1/2/3
 * selects one of the three precomputed offset radii; anything else multiplies
 * the base brush size directly.
 */
const BRANCH_T2 = [
  { offsetBase: 2, signX: 1, signY: 1, randThreshold: 0.05, jitterIndex: 4 },
  { offsetBase: 1, signX: -1, signY: -1, randThreshold: 0.1, jitterIndex: 5 },
  { offsetBase: 3, signX: -1, signY: -1, randThreshold: 0.12, jitterIndex: 6 },
  { offsetBase: 1, signX: 1, signY: 1, randThreshold: 0.08, jitterIndex: 7 },
  { offsetBase: 3, signX: 1, signY: 1, randThreshold: 0.2, jitterIndex: 8 },
] as const;

/** Branch type 3: eight branches, 45 degrees apart, radius 1.6. */
const BRANCH_T3 = [
  { angle: 0, radius: 1.6, randThreshold: 0.065, jitterIndex: 9 },
  { angle: Math.PI / 4, radius: 1.6, randThreshold: 0.1, jitterIndex: 10 },
  { angle: Math.PI / 2, radius: 1.6, randThreshold: 0.125, jitterIndex: 11 },
  {
    angle: (3 * Math.PI) / 4,
    radius: 1.6,
    randThreshold: 0.15,
    jitterIndex: 12,
  },
  { angle: Math.PI, radius: 1.6, randThreshold: 0.1, jitterIndex: 13 },
  {
    angle: (5 * Math.PI) / 4,
    radius: 1.6,
    randThreshold: 0.125,
    jitterIndex: 14,
  },
  {
    angle: (3 * Math.PI) / 2,
    radius: 1.6,
    randThreshold: 0.15,
    jitterIndex: 15,
  },
  {
    angle: (7 * Math.PI) / 4,
    radius: 1.6,
    randThreshold: 0.18,
    jitterIndex: 16,
  },
] as const;

/** Branch type 4: twelve branches, 30 degrees apart, radius 1.0. */
const BRANCH_T4 = [
  { angle: 0, radius: 1, randThreshold: 0.07, jitterIndex: 17 },
  { angle: Math.PI / 6, radius: 1, randThreshold: 0.08, jitterIndex: 18 },
  { angle: Math.PI / 3, radius: 1, randThreshold: 0.1, jitterIndex: 19 },
  { angle: Math.PI / 2, radius: 1, randThreshold: 0.13, jitterIndex: 20 },
  { angle: (2 * Math.PI) / 3, radius: 1, randThreshold: 0.16, jitterIndex: 21 },
  { angle: (5 * Math.PI) / 6, radius: 1, randThreshold: 0.1, jitterIndex: 22 },
  { angle: Math.PI, radius: 1, randThreshold: 0.13, jitterIndex: 23 },
  { angle: (7 * Math.PI) / 6, radius: 1, randThreshold: 0.16, jitterIndex: 24 },
  { angle: (4 * Math.PI) / 3, radius: 1, randThreshold: 0.19, jitterIndex: 25 },
  { angle: (3 * Math.PI) / 2, radius: 1, randThreshold: 0.13, jitterIndex: 26 },
  { angle: (5 * Math.PI) / 3, radius: 1, randThreshold: 0.16, jitterIndex: 27 },
  {
    angle: (11 * Math.PI) / 6,
    radius: 1,
    randThreshold: 0.19,
    jitterIndex: 28,
  },
] as const;

/* ------------------------------------------------------------------ *
 * Per-mode initialisation
 * ------------------------------------------------------------------ */

export interface BrushModeSpec {
  id: BrushModeId;
  name: string;
  /** Initial stamp size as [min, max], multiplied by the base brush size. */
  initialSize: readonly [number, number];
  /** Spray radius; `absolute` skips the base-size multiply. */
  spray: { value: number; absolute?: boolean };
  /** Post-release settle length, in frames. */
  maxUpdates: number;
  spring: number;
  damping: number;
  /** Per-frame size decay. */
  randStep: number;
  /** Modes that never terminate themselves by shrinking out of ink. */
  runsUntilRelease?: boolean;
  /** Deckle Edge is a flag on the fly-branch path, not its own branch. */
  sharpEdge?: boolean;
  /** Dry Brush permanently runs diffusion at 40% force. */
  forceScale?: number;
}

export const BRUSH_MODES: Record<BrushModeId, BrushModeSpec> = {
  1: {
    id: 1,
    name: "Ink Brush",
    initialSize: [20, 24],
    spray: { value: 3 },
    maxUpdates: 30,
    spring: 0.6,
    damping: 0.5,
    randStep: 0.05,
  },
  2: {
    id: 2,
    name: "Marker",
    initialSize: [20, 24],
    spray: { value: 1 },
    maxUpdates: 10,
    spring: 0.3,
    damping: 0.5,
    randStep: 0.05,
  },
  3: {
    id: 3,
    name: "Spray Paint",
    initialSize: [2, 4],
    spray: { value: 10 },
    maxUpdates: 10,
    spring: 0.6,
    damping: 0.5,
    randStep: 0.05,
    runsUntilRelease: true,
  },
  4: {
    id: 4,
    name: "Dry Brush",
    initialSize: [6, 9],
    spray: { value: 1 },
    maxUpdates: 10,
    spring: 0.6,
    damping: 0.5,
    randStep: 0.05,
    runsUntilRelease: true,
    forceScale: 0.4,
  },
  5: {
    id: 5,
    name: "Spray Dots",
    initialSize: [10, 14],
    spray: { value: 10, absolute: true },
    maxUpdates: 10,
    spring: 0.6,
    damping: 0.5,
    randStep: 0.05,
    runsUntilRelease: true,
  },
  6: {
    id: 6,
    name: "Flat Brush",
    initialSize: [10, 14],
    spray: { value: 10, absolute: true },
    maxUpdates: 10,
    spring: 0.6,
    damping: 0.5,
    randStep: 0.05,
  },
  7: {
    id: 7,
    name: "Deckle Edge",
    initialSize: [10, 14],
    spray: { value: 10, absolute: true },
    maxUpdates: 10,
    spring: 0.6,
    damping: 0.5,
    randStep: 0.05,
    sharpEdge: true,
  },
};

/* ------------------------------------------------------------------ *
 * Shape generators
 *
 * All four seed both PRNGs from their own seed and pre-draw their full random
 * tables before emitting a single vertex, so the draw count is fixed regardless
 * of how many layers actually render. That is what keeps a stroke reproducible.
 * ------------------------------------------------------------------ */

export interface ShapeData {
  type: "blob" | "strip" | "lightning";
  vertices: { x: number; y: number }[];
}

const TWO_PI = Math.PI * 2;

/** shapeType 0 - noise blob. Called at 1.3x the requested size. */
function makeBlob(rng: InkRandom, size: number, seed: number): ShapeData {
  rng.randomSeed(seed);
  rng.noiseSeed(seed);
  const vertices: { x: number; y: number }[] = [];
  const layerCount = 3;
  const drawCountRand = rng.random(1, 4);
  const amp = rng.random(0.4, 0.6);
  const drawCount = Math.floor(drawCountRand);

  const layers = [];
  for (let i = 0; i < layerCount; i++) {
    layers.push({
      offsetX: rng.random(-size * 0.2, size * 0.2),
      offsetY: rng.random(-size * 0.2, size * 0.2),
      rotation: rng.random(-Math.PI / 4, Math.PI / 4),
      sizeVariation: rng.random(0.85, 1.15),
      numVerticesRand: rng.random(36, 48),
      noiseOffset: rng.random(1000) + i * 500,
    });
  }

  for (let l = 0; l < drawCount; l++) {
    const layer = layers[l];
    const radiusBase = size * layer.sizeVariation;
    const count = Math.floor(layer.numVerticesRand);
    const raw: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TWO_PI;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const n =
        rng.noise(c * 1 + layer.noiseOffset, s * 1) * 0.5 +
        rng.noise(c * 2.5 + layer.noiseOffset + 100, s * 2.5) * 0.3 +
        rng.noise(c * 5 + layer.noiseOffset + 200, s * 5) * 0.2;
      const radius = radiusBase * (0.4 + n * amp);
      raw.push({ x: c * radius, y: s * radius });
    }

    // One pass of [1,2,1] smoothing around the ring.
    const smoothed: { x: number; y: number }[] = [];
    for (let i = 0; i < raw.length; i++) {
      const p = raw[(i - 1 + raw.length) % raw.length];
      const c = raw[i];
      const n = raw[(i + 1) % raw.length];
      smoothed.push({
        x: (p.x + c.x * 2 + n.x) / 4,
        y: (p.y + c.y * 2 + n.y) / 4,
      });
    }

    const cosR = Math.cos(layer.rotation);
    const sinR = Math.sin(layer.rotation);
    for (const v of smoothed) {
      vertices.push({
        x: v.x * cosR - v.y * sinR + layer.offsetX,
        y: v.x * sinR + v.y * cosR + layer.offsetY,
      });
    }
  }
  return { type: "blob", vertices };
}

/** shapeType 1 - elongated ribbon, walked out along the top and back along the bottom. */
function makeStrip(rng: InkRandom, size: number, seed: number): ShapeData {
  rng.randomSeed(seed);
  rng.noiseSeed(seed);
  const vertices: { x: number; y: number }[] = [];
  const drawCount = Math.floor(rng.random(1, 4));
  const rotation = rng.random(0, TWO_PI);

  const layers = [];
  for (let i = 0; i < 3; i++) {
    layers.push({
      lengthRatio: rng.random(1, 4),
      stripWidth: size * rng.random(0.5, 0.8),
      numVertices: Math.floor(rng.random(32, 48)),
      noiseAmp: rng.random(0.15, 0.35),
      layerRotationOffset: rng.random(-0.5, 0.5),
      noiseOffset: rng.random(1000) + i * 500,
      offsetX: rng.random(-size * 0.2, size * 0.2),
      offsetY: rng.random(-size * 0.2, size * 0.2),
    });
  }

  for (let l = 0; l < drawCount; l++) {
    const layer = layers[l];
    const half = layer.numVertices / 2;
    const length = size * layer.lengthRatio;
    const rot = rotation + layer.layerRotationOffset;
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    const ring: { x: number; y: number }[] = [];

    for (let i = 0; i < half; i++) {
      const t = i / (half - 1 || 1);
      const px = (t - 0.5) * length;
      const n = rng.noise(t * 3 + layer.noiseOffset, 0);
      ring.push({
        x: px,
        y: -layer.stripWidth * (0.5 + (n - 0.5) * layer.noiseAmp),
      });
    }
    for (let i = 0; i < half; i++) {
      const t = 1 - i / (half - 1 || 1);
      const px = (t - 0.5) * length;
      const n = rng.noise(t * 3 + layer.noiseOffset + 50, 1);
      ring.push({
        x: px,
        y: layer.stripWidth * (0.5 + (n - 0.5) * layer.noiseAmp),
      });
    }

    for (const v of ring) {
      vertices.push({
        x: v.x * cosR - v.y * sinR + layer.offsetX,
        y: v.x * sinR + v.y * cosR + layer.offsetY,
      });
    }
  }
  return { type: "strip", vertices };
}

/**
 * shapeType 2 and 3 - a random walk that occasionally sprouts a side branch.
 * `big` is shapeType 3: three times the size at a third the thickness, five
 * times the steps, which reads as a sprawling fracture rather than a scaled-up
 * bolt.
 */
function makeLightning(
  rng: InkRandom,
  sizeIn: number,
  seed: number,
  big: boolean,
): ShapeData {
  rng.randomSeed(seed);
  rng.noiseSeed(seed);
  const size = big ? sizeIn * 3 : sizeIn;
  const layerCount = big ? 3 : 2;
  const drawCount = Math.floor(rng.random(1, big ? 4 : 3));
  const stepRecords = big ? 75 : 30;
  const thicknessCount = big ? 800 : 300;
  const branchMul = big ? 5 : 2;

  const configs = [];
  for (let i = 0; i < layerCount; i++) {
    configs.push({
      branchAngle: rng.random(0, TWO_PI),
      offsetX: rng.random(-size * 0.2, size * 0.2),
      offsetY: rng.random(-size * 0.2, size * 0.2),
      numLRand: rng.random(0, 1),
      numStepsRand: rng.random(5, 15),
      stepSize: size * rng.random(0.2, 0.35),
      noiseScale: rng.random(0.1, 0.2) * (big ? 0.5 : 1),
      noiseStrength: rng.random(0.2, 0.4) * (big ? 0.5 : 1),
      thickness: size * rng.random(0.5, 0.7) * (big ? 0.3 : 1),
    });
  }

  // Fixed-size tables regardless of how many steps run.
  const steps = [];
  for (let i = 0; i < stepRecords; i++) {
    steps.push({
      stepVariation: rng.random(0.7, 1.3),
      subBranchRand: rng.random(0, 1),
      subBranchLengthRand: rng.random(3, 8),
      subBranchAngle: rng.random(-Math.PI / 3, Math.PI / 3),
    });
  }
  const thicknesses: number[] = [];
  for (let i = 0; i < thicknessCount; i++)
    thicknesses.push(rng.random(0.9, 1.1));

  const vertices: { x: number; y: number }[] = [];
  let thicknessCursor = 0;

  for (let l = 0; l < drawCount; l++) {
    const cfg = configs[l];
    const numSteps =
      Math.floor(cfg.numStepsRand) * (cfg.numLRand > 0.2 ? 1 : branchMul);
    let px = cfg.offsetX;
    let py = cfg.offsetY;
    let angle = cfg.branchAngle;

    const top: { x: number; y: number }[] = [];
    const bottom: { x: number; y: number }[] = [];

    for (let s = 0; s < numSteps; s++) {
      const rec = steps[s % steps.length];
      angle +=
        (rng.noise(s * cfg.noiseScale, l) - 0.5) * cfg.noiseStrength * Math.PI;
      const len = cfg.stepSize * rec.stepVariation;
      const nx = px + Math.cos(angle) * len;
      const ny = py + Math.sin(angle) * len;

      const t = thicknesses[thicknessCursor++ % thicknesses.length];
      const halfW = (cfg.thickness * t * (1 - s / (numSteps + 1))) / 2;
      const perpX = -Math.sin(angle) * halfW;
      const perpY = Math.cos(angle) * halfW;

      top.push({ x: px + perpX, y: py + perpY });
      bottom.push({ x: px - perpX, y: py - perpY });
      px = nx;
      py = ny;
    }

    for (const v of top) vertices.push(v);
    for (let i = bottom.length - 1; i >= 0; i--) vertices.push(bottom[i]);
  }
  return { type: "lightning", vertices };
}

export function makeShape(
  rng: InkRandom,
  shapeType: number,
  size: number,
  seed: number,
): ShapeData {
  switch (shapeType) {
    case 0:
      return makeBlob(rng, size * 1.3, seed);
    case 1:
      return makeStrip(rng, size, seed);
    case 2:
      return makeLightning(rng, size, seed, false);
    default:
      return makeLightning(rng, size, seed, true);
  }
}

/** Renders a generated shape at a point. Mirrors the source's `_j17`. */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ShapeData,
  px: number,
  py: number,
  gray: number,
  alpha: number,
  scale = 1,
) {
  if (shape.vertices.length < 3) return;
  ctx.fillStyle = `rgba(${gray},${gray},${gray},${alpha / 255})`;
  ctx.beginPath();
  ctx.moveTo(
    px + shape.vertices[0].x * scale,
    py + shape.vertices[0].y * scale,
  );
  for (let i = 1; i < shape.vertices.length; i++) {
    ctx.lineTo(
      px + shape.vertices[i].x * scale,
      py + shape.vertices[i].y * scale,
    );
  }
  ctx.closePath();
  ctx.fill();
}

/* ------------------------------------------------------------------ *
 * Fly-branch bundle
 * ------------------------------------------------------------------ */

export interface FlyBranch {
  perpOffset: number;
  randThreshold: number;
  sizeMultiplier: number;
  speedMultiplier: number;
  minStrokeWeight: number;
  startOffset: number;
  endDistanceOffset: number;
  brushSpeedMultiplier: number;
  widthVariationFactor: number;
  offsetVariationFactor: number;
}

/** Branch count by brush size. */
function flyBranchCount(
  rng: InkRandom,
  baseBrushSize: number,
  strokeSeed: number,
) {
  let min: number;
  let max: number;
  if (baseBrushSize <= 0.1) [min, max] = [2, 4];
  else if (baseBrushSize <= 0.25) [min, max] = [4, 7];
  else if (baseBrushSize <= 0.5) [min, max] = [6, 10];
  else if (baseBrushSize <= 2) [min, max] = [10, 15];
  else if (baseBrushSize <= 3) [min, max] = [20, 30];
  else [min, max] = [30, 50];
  rng.randomSeed(strokeSeed + 50000);
  return Math.floor(rng.random(min, max + 1));
}

/**
 * Ten properties per branch, each drawn from its own derived seed so a branch's
 * character depends only on (strokeSeed, index, property) and not on how many
 * draws happened earlier in the frame. Branches are offset perpendicular to the
 * stroke direction, never at fixed angles, then sorted so they read as splayed
 * bristles rather than parallel lines.
 */
export function makeFlyBranches(
  rng: InkRandom,
  baseBrushSize: number,
  strokeSeed: number,
): FlyBranch[] {
  const count = flyBranchCount(rng, baseBrushSize, strokeSeed);
  const base = strokeSeed + 60000;
  const out: FlyBranch[] = [];

  for (let i = 0; i < count; i++) {
    rng.randomSeed(base + i * 1000);
    const perpOffset = rng.random(-6, 6);
    rng.randomSeed(base + i * 2000 + 1);
    const randThreshold = rng.random(0.5, 1);
    rng.randomSeed(base + i * 3000 + 2);
    const sizeMultiplier = rng.random(1, 2);
    rng.randomSeed(base + i * 4000 + 3);
    const speedMultiplier = rng.random(0.7, 1.3);
    rng.randomSeed(base + i * 5000 + 4);
    const minStrokeWeight = rng.random(0.8, 1.2);
    rng.randomSeed(base + i * 6000 + 5);
    const startOffset = Math.floor(rng.random(0, 6));
    rng.randomSeed(base + i * 7000 + 6);
    const endDistanceOffset = rng.random(0, 8);
    rng.randomSeed(base + i * 8000 + 7);
    const brushSpeedMultiplier = rng.random(1, 2);
    rng.randomSeed(base + i * 9000 + 8);
    const widthVariationFactor = rng.random(0, 1);
    rng.randomSeed(base + i * 10000 + 9);
    const offsetVariationFactor = rng.random(0, 1);

    out.push({
      perpOffset,
      randThreshold,
      sizeMultiplier,
      speedMultiplier,
      minStrokeWeight,
      startOffset,
      endDistanceOffset,
      brushSpeedMultiplier,
      widthVariationFactor,
      offsetVariationFactor,
    });
  }

  out.sort((a, b) => a.perpOffset - b.perpOffset);
  return out;
}

/* ------------------------------------------------------------------ *
 * Stroke
 * ------------------------------------------------------------------ */

export interface StrokeOptions {
  mode: BrushModeId;
  baseBrushSize: number;
  /** Palette index. 0 is black, 1 is the near-white brush. */
  colorIndex: number;
  strokeSeed: number;
  /** Substeps per frame; the source records this per stroke (default 15). */
  step?: number;
  step2?: number;
  interpolationOffset?: number;
  expectedStrokeLength?: number;
  pathRotation?: number;
  /** Stamp mirroring, 0-3. */
  brushDir?: number;
  ctlNoisePerFrame?: number;
  /** Stamp geometry 0-3; drawn from the stroke seed when omitted. */
  shapeType?: number;
}

export interface StrokeMark {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  any: boolean;
}

/**
 * One brush stroke. `step()` is called once per frame with the pointer target;
 * it advances the physics and draws that frame's marks into the given 2-D
 * context, which the engine then blends into the grayscale draft.
 */
export class InkBrushStroke {
  readonly mode: BrushModeSpec;
  readonly opts: Required<StrokeOptions>;
  private rng: InkRandom;

  // Physics
  private x = 0;
  private y = 0;
  private accelX = 0;
  private accelY = 0;
  private speed = 0;
  private started = false;

  // Size
  private brushSize: number;
  private brushSizeNow = 0;
  private workingSize: number;
  private smoothedSize = 0;
  private radius = 0;
  private readonly minSize = 1;
  private readonly initialSize: number;
  private readonly spraySize: number;

  // Counters
  frame = 0;
  readonly mouseCountStart: number;
  settleFrame = 0;
  settling = false;
  finished = false;

  // Per-stroke draws
  private readonly explodeStart: boolean;
  private readonly explodeEnd: boolean;
  readonly shapeType: number;
  private readonly flyBranches: FlyBranch[];
  private readonly sharpEdge: boolean;

  /** Bounds of everything this stroke has drawn, in canvas pixels. */
  readonly bounds: StrokeMark = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    any: false,
  };

  constructor(rng: InkRandom, options: StrokeOptions) {
    this.rng = rng;
    this.mode = BRUSH_MODES[options.mode];

    // Seeding order matters: strokeSeed is drawn from the global stream, then
    // becomes the seed for both PRNGs, so everything after depends only on it.
    rng.randomSeed(options.strokeSeed);
    rng.noiseSeed(options.strokeSeed);

    this.explodeStart = rng.random(0, 1) > 0.8;
    this.explodeEnd = rng.random(0, 1) > 0.8;
    // The source draws a shapeType it then discards; the second draw is the
    // one used. Kept because the draw count is part of the replay contract.
    rng.random(0, 2);
    this.shapeType = options.shapeType ?? Math.floor(rng.random(2, 4));

    const size = options.baseBrushSize;
    const [lo, hi] = this.mode.initialSize;
    this.initialSize = rng.random(lo, hi) * size;
    this.spraySize = this.mode.spray.absolute
      ? this.mode.spray.value
      : this.mode.spray.value * size * (size > 5 ? 0.5 : 1);

    this.opts = {
      mode: options.mode,
      baseBrushSize: size,
      colorIndex: options.colorIndex,
      strokeSeed: options.strokeSeed,
      step: options.step ?? 15,
      step2: options.step2 ?? 5,
      interpolationOffset: options.interpolationOffset ?? 0,
      expectedStrokeLength: options.expectedStrokeLength ?? 400,
      pathRotation: options.pathRotation ?? 0,
      brushDir: options.brushDir ?? 0,
      ctlNoisePerFrame: options.ctlNoisePerFrame ?? 1,
      shapeType: this.shapeType,
    } as Required<StrokeOptions>;

    this.brushSize = this.initialSize;
    this.workingSize = this.initialSize;
    this.sharpEdge = this.mode.sharpEdge === true;
    this.flyBranches =
      options.mode === 6 || options.mode === 7
        ? makeFlyBranches(rng, size, options.strokeSeed)
        : [];

    this.mouseCountStart = 0;
    // Restore the stroke stream after the seeded bundle generation above.
    rng.randomSeed(options.strokeSeed + 1);
  }

  /** Diffusion force for this frame: 1.0 while drawing, ramping to 0 after release. */
  get force(): number {
    const scale = this.mode.forceScale ?? 1;
    if (!this.settling) return 1 * scale;
    return (
      remap(
        Math.min(this.settleFrame, this.mode.maxUpdates),
        0,
        this.mode.maxUpdates,
        1,
        0,
      ) * scale
    );
  }

  /** `mouseCount`, wrapped at 40 the way the diffusion shader expects. */
  get mouseCount(): number {
    return (this.frame + this.mouseCountStart) % 40;
  }

  get mouseCountAccumulated(): number {
    return this.frame + this.mouseCountStart;
  }

  /**
   * Ends the stroke and starts the settle clock. Idempotent: callers poll this
   * from the frame loop, and restarting the clock on every call would keep the
   * stroke alive forever, diffusing until the whole sheet floods.
   */
  release() {
    if (this.settling) return;
    this.settling = true;
    this.settleFrame = 0;
  }

  /** Advances the settle clock. Returns false once the stroke is fully done. */
  settleStep(): boolean {
    if (!this.settling) return true;
    this.settleFrame++;
    if (this.settleFrame >= this.mode.maxUpdates) {
      this.finished = true;
      return false;
    }
    return true;
  }

  private track(x: number, y: number, pad: number) {
    const b = this.bounds;
    if (x - pad < b.minX) b.minX = x - pad;
    if (y - pad < b.minY) b.minY = y - pad;
    if (x + pad > b.maxX) b.maxX = x + pad;
    if (y + pad > b.maxY) b.maxY = y + pad;
    b.any = true;
  }

  /** Grayscale jitter. Coloured brushes vary about twice as much as black. */
  private jitterGray(base: number): number {
    return this.opts.colorIndex === 0
      ? base + this.rng.random(10, 40)
      : base + this.rng.random(30, 80);
  }

  private setStroke(
    ctx: CanvasRenderingContext2D,
    g1: number,
    g2: number,
    alpha: number,
  ) {
    const gray =
      this.opts.colorIndex === 0 ? g1 : this.opts.colorIndex === 1 ? 150 : g2;
    const c = clamp(Math.round(gray), 0, 255);
    ctx.strokeStyle = `rgba(${c},${c},${c},${clamp(alpha, 0, 255) / 255})`;
  }

  private line(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    weight: number,
  ) {
    ctx.lineWidth = Math.max(0.05, weight);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const pad = ctx.lineWidth * 0.5 + 2;
    this.track(x1, y1, pad);
    this.track(x2, y2, pad);
  }

  /**
   * Advances the spring-damper toward the target and returns whether the
   * stroke is still alive. Applied once per frame, before any drawing.
   */
  private integrate(targetX: number, targetY: number) {
    if (!this.started) {
      this.started = true;
      this.x = targetX;
      this.y = targetY;
    }
    this.accelX += (targetX - this.x) * this.mode.spring;
    this.accelY += (targetY - this.y) * this.mode.spring;
    this.accelX *= this.mode.damping;
    this.accelY *= this.mode.damping;

    let speed = Math.sqrt(
      this.accelX * this.accelX + this.accelY * this.accelY,
    );
    if (this.mode.id === 6 || this.mode.id === 7) speed *= 0.7;
    if (this.mode.id === 2) speed *= 1.2;

    const size = this.opts.baseBrushSize;
    if (this.mode.id === 2) {
      // The Marker caps its speed penalty lower, so large markers barely thin.
      if (size <= 1) speed *= 0.9;
      else if (size <= 2) speed *= 1.3;
      else speed *= 1.5;
    } else if (size <= 1) speed *= 0.9;
    else if (size <= 2) speed *= 1.3;
    else if (size <= 3) speed *= 2;
    else speed *= 3;

    this.speed = speed;
    this.brushSizeNow = this.brushSize - this.speed;
  }

  /** Per-frame size decay. Returns false when the stroke runs out of ink. */
  decay(): boolean {
    this.workingSize -= this.mode.randStep;
    if (this.workingSize < 1) this.workingSize = 1;
    this.brushSize = this.workingSize;
    if (this.mode.runsUntilRelease) return true;
    return !(this.workingSize <= this.minSize && !this.settling);
  }

  /**
   * Draws this frame's marks. `ctx` is the transient stamp layer, cleared by
   * the caller each frame; the engine blends it into the accumulating draft.
   */
  step(ctx: CanvasRenderingContext2D, targetX: number, targetY: number) {
    if (this.frame >= this.opts.expectedStrokeLength) return;
    this.integrate(targetX, targetY);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rng = this.rng;
    const g1 = this.jitterGray(0);
    const g2 = this.jitterGray(0);
    const size = this.opts.baseBrushSize;
    const tiny = size < 0.25;
    const ctl = this.opts.ctlNoisePerFrame;

    const off1 = 1 * size * ctl;
    const off2 = 2 * size * ctl;
    const off3 = 3 * size * ctl;

    const swFloorTiny = Math.max(0.6, size * 2);
    let swFloor = tiny ? swFloorTiny : Math.max(0.6, size * 1.5);
    if (swFloor < 3) swFloor *= 2;
    let swFloorSmall = tiny ? swFloorTiny : Math.max(0.6, size * 1.2);
    if (swFloorSmall < 3) swFloorSmall *= 2;
    const swCeil = tiny ? Math.max(2, size * 10) : size < 0.5 ? 0.7 : 9999;
    const bigWeight = tiny
      ? rng.random(0.4, 0.8)
      : rng.random(size * 0.8, size * 2);

    this.radius = this.brushSizeNow * 0.5;

    const substeps = this.opts.step + this.opts.interpolationOffset;
    const dir = BRUSH_DIR[clamp(this.opts.brushDir, 0, 3)];

    let baseOpacity = 0.08;
    if (this.mode.id === 2) baseOpacity = 0.3;

    for (let i = 0; i < substeps; i++) {
      // --- branch type for this substep -------------------------------
      let branch: number;
      if (size < 1.5) {
        branch = rng.random(0, 1) > 0.4 ? 0 : rng.random(0, 1) > 0.4 ? 1 : 2;
      } else if (size < 6) {
        branch = rng.random(0, 1) > 0.4 ? 2 : rng.random(0, 1) > 0.6 ? 3 : 4;
      } else {
        branch = rng.random(0, 1) > 0.3 ? 3 : 4;
      }
      // Deckle Edge drops the two softest branch types entirely.
      if (this.sharpEdge) {
        branch = rng.random(0, 1) > 0.3 ? 3 : rng.random(0, 1) > 0.5 ? 2 : 4;
      }
      if (this.frame < 5 && rng.random(0, 1) > 0.2) branch = 5;

      const prevX = this.x;
      const prevY = this.y;
      this.x += this.accelX / substeps;
      this.y += this.accelY / substeps;

      const r1 = rng.random(0, 1);
      const r2 = rng.random(0, 4);
      const r3 = rng.random(0, 3);
      const ex1 = rng.random(-1, 1);
      const ey1 = rng.random(-1, 1);
      const ex2 = rng.random(-1, 1);
      const ey2 = rng.random(-1, 1);

      let opacity = baseOpacity;
      let weightScale = 1;
      if (branch === 3) {
        opacity *= 0.8;
        weightScale *= 0.8;
      } else if (branch === 4) {
        opacity *= 0.6;
        weightScale *= 0.5;
      }
      if (tiny) opacity = 0.18;
      else if (size < 1.5) opacity = 0.1;

      this.smoothedSize = lerp(this.smoothedSize, this.brushSizeNow, 0.5);
      if (this.mode.id === 1) {
        if (r1 > 0.8 && this.radius < 2 && i === 0) this.radius = r2;
      } else {
        this.radius +=
          (this.smoothedSize - this.radius) * (this.mode.id === 2 ? 0.8 : 0.3);
        if (this.mode.id === 2)
          this.radius = Math.max(tiny ? 0.2 : 1.5, this.radius);
      }

      // --- head ramp / tail ramp / explode -----------------------------
      let drawRadius: number;
      let offX = 0;
      let offY = 0;
      const len = this.opts.expectedStrokeLength;

      if (this.mode.id === 1) {
        drawRadius = this.radius;
      } else if (this.frame < 5) {
        const t = remap(this.frame, 0, 5, 0.05, 1);
        drawRadius = Math.max(tiny ? 0.1 : 0.5, this.radius * t);
        if (this.explodeStart) {
          offX = ex1 * remap(this.frame, 0, 5, 10, 0);
          offY = ey1 * remap(this.frame, 0, 5, 10, 0);
        }
      } else if (this.frame >= len - 5) {
        const t = remap(this.frame, len - 5, len, 1, 0.05);
        drawRadius = Math.max(tiny ? 0.1 : 0.5, this.radius * t);
        if (this.explodeEnd) {
          offX = ex2 * remap(this.frame, len - 5, len, 0, 10);
          offY = ey2 * remap(this.frame, len - 5, len, 0, 10);
        }
      } else if (this.radius > 2) {
        drawRadius = Math.max(tiny ? 0.2 : 1, this.radius);
      } else {
        drawRadius = Math.max(tiny ? 0.1 : 0.5, this.radius + (r3 / 3 - 0.5));
      }

      let mainW = drawRadius;
      let branchW = drawRadius * 0.5;
      if (branch === 3) {
        mainW *= 0.8;
        branchW *= 0.8;
      } else if (branch === 4) {
        mainW *= 0.5;
        branchW *= 0.5;
      }

      const showRoll = rng.random(0, 1);
      const alphaMain = rng.random(150, 255);
      const alphaA = rng.random(100, 255);
      const alphaB = rng.random(100, 255);
      const alphaC = rng.random(100, 255);

      // --- main spine --------------------------------------------------
      if (tiny) {
        if (!this.sharpEdge && this.frame > 1) {
          this.setStroke(ctx, g1, g2, alphaMain);
          const kk = Math.min(this.initialSize, Math.max(swFloor, mainW));
          this.line(
            ctx,
            this.x + offX,
            this.y + offY,
            prevX,
            prevY,
            Math.min(swCeil, kk),
          );
        }
      } else if (showRoll > opacity) {
        this.setStroke(ctx, g1, g2, alphaMain);
        const showSpine = !this.sharpEdge && this.frame > 3 && size < 4;
        let kk: number;
        if (mainW < 5) {
          kk =
            (this.mode.id === 1 ? 1.5 : 1) *
            Math.min(this.initialSize, Math.max(swFloor, mainW));
        } else {
          kk =
            weightScale * Math.min(this.initialSize, Math.max(swFloor, mainW));
          if (kk > 15) kk = rng.random(1.5, kk);
        }
        if (showSpine) {
          this.line(
            ctx,
            this.x + offX,
            this.y + offY,
            prevX,
            prevY,
            Math.min(swCeil, kk),
          );
        }
      }

      // --- per-substep jitter tables (fixed size: replay contract) ------
      const rolls: number[] = [];
      const jitters: number[] = [];
      for (let j = 0; j < 30; j++) {
        rolls.push(rng.random(0, 1));
        jitters.push(rng.random(-0.5, 0.5));
      }

      const branchWeight = (
        variation: number,
        jitter: number,
        small: boolean,
      ) => {
        const w = branchW * variation + jitter;
        const cap = tiny ? Math.max(2, size * 10) : 15;
        let v = w;
        if (v > cap) v = rng.random(tiny ? 0.6 : 1, cap);
        let sw = Math.max(tiny ? 0.6 : 1, v);
        if (sw < 3) sw *= 2;
        if (small) {
          sw =
            this.rng.noise(this.x * 0.1, this.y * 0.2) +
            1.5 * Math.max(swFloorSmall, w);
        }
        return Math.min(swCeil, size < 4 ? sw : rng.random(sw * 0.5, sw));
      };

      const drawBranch = (bx: number, by: number, weight: number) => {
        this.line(
          ctx,
          this.x + bx + offX,
          this.y + by + offY,
          prevX + bx,
          prevY + by,
          weight,
        );
      };

      if (branch === 0) {
        this.setStroke(ctx, g1, g2, alphaA);
        if (rolls[0] > 0.2) {
          const sx = dir.flipX ? -1 : 1;
          const sy = dir.flipY ? -1 : 1;
          let v = remap(
            this.rng.noise(this.x * 0.1, this.y * 0.1),
            0,
            1,
            0.8,
            1.2,
          );
          v = Math.max(1 + jitters[0], v);
          const small = branchW * v < 5;
          const w = small
            ? Math.min(
                swCeil,
                this.rng.noise(this.x * 0.1, this.y * 0.2) +
                  1.5 * Math.max(swFloorSmall, branchW * v),
              )
            : Math.min(swCeil, weightScale * Math.max(bigWeight, branchW * v));
          drawBranch(sx * off2, sy * off2, w);
        }
        if (rolls[1] > 0.3) {
          this.setStroke(ctx, g1, g2, alphaB);
          const sx = dir.flipX ? -1 : 1;
          const sy = dir.flipY ? 1 : -1;
          let v = remap(
            this.rng.noise(this.x * 0.3 + 300, this.y * 0.3 + 300),
            0,
            1,
            0.6,
            1.5,
          );
          v = Math.max(1 + jitters[1], v);
          drawBranch(
            sx * off2,
            sy * off2,
            Math.min(swCeil, weightScale * Math.max(bigWeight, branchW * v)),
          );
        }
      } else if (branch === 1) {
        this.setStroke(ctx, g1, g2, alphaA);
        if (rolls[0] > 0.1) {
          const sx = dir.flipX ? -1 : 1;
          const sy = dir.flipY ? -1 : 1;
          let v = remap(
            this.rng.noise(this.x * 0.3 + 200, this.y * 0.1 + 100),
            0,
            1,
            0.8,
            1.2,
          );
          v = Math.max(1 + jitters[0], v);
          drawBranch(
            sx * off2,
            sy * off2,
            Math.min(swCeil, weightScale * Math.max(bigWeight, branchW * v)),
          );
        }
        if (rolls[1] > 0.05) {
          this.setStroke(ctx, g1, g2, alphaB);
          const sx = dir.flipX ? -1 : 1;
          const sy = dir.flipY ? 1 : -1;
          let v = remap(
            this.rng.noise(this.x * 0.2 + 300, this.y * 0.2 + 200),
            0,
            1,
            0.8,
            1.2,
          );
          v = Math.max(1 + jitters[1], v);
          drawBranch(
            sx * off1,
            sy * off1,
            Math.min(swCeil, weightScale * Math.max(bigWeight, branchW * v)),
          );
        }
        if (rolls[2] > 0.15) {
          this.setStroke(ctx, g1, g2, alphaC);
          let v = remap(
            this.rng.noise(this.x * 0.1 + 400, this.y * 0.3 + 300),
            0,
            1,
            0.8,
            1.2,
          );
          v = Math.max(1 + jitters[2], v);
          const small = branchW * v < 5;
          const w = small
            ? Math.min(
                swCeil,
                this.rng.noise(this.x, this.y * 2) +
                  1.5 * Math.max(swFloorSmall, branchW * v),
              )
            : Math.min(swCeil, weightScale * Math.max(bigWeight, branchW * v));
          drawBranch(-off3, -off3, w);
        }
      } else if (branch === 2) {
        const v = remap(
          this.rng.noise(this.x * 0.1 + 400, this.y * 0.1 + 200),
          0,
          1,
          0.8,
          1.2,
        );
        this.setStroke(ctx, g1, g2, alphaA);
        for (let k = 0; k < BRANCH_T2.length; k++) {
          const spec = BRANCH_T2[k];
          if (rolls[k] <= spec.randThreshold) continue;
          // The source has a fourth arm here that multiplies the base size
          // directly; the shipped table only ever holds 1, 2 or 3.
          const offset =
            spec.offsetBase === 1 ? off1 : spec.offsetBase === 2 ? off2 : off3;
          const sx = k === 0 && dir.flipX ? -spec.signX : spec.signX;
          const sy = k === 0 && dir.flipY ? -spec.signY : spec.signY;
          drawBranch(
            sx * offset,
            sy * offset,
            branchWeight(v, jitters[spec.jitterIndex] ?? 0, false),
          );
        }
      } else if (branch === 3 || branch === 4) {
        const table = branch === 3 ? BRANCH_T3 : BRANCH_T4;
        const v = remap(
          this.rng.noise(this.x * 0.1 + 400, this.y * 0.1 + 200),
          0,
          1,
          branch === 3 ? 0.85 : 0.9,
          branch === 3 ? 1.15 : 1.1,
        );
        this.setStroke(ctx, g1, g2, alphaA);
        let spread = size * ctl;
        if (size > 4) spread *= rng.random(0.5, 2.5);
        for (let k = 0; k < table.length; k++) {
          const spec = table[k];
          const spin = size > 4 ? rng.random(0, 6.28) : 0;
          if ((rolls[k] ?? 0) <= spec.randThreshold) continue;
          const bx = Math.cos(spec.angle + spin) * spec.radius * spread;
          const by = Math.sin(spec.angle + spin) * spec.radius * spread;
          drawBranch(
            (dir.flipX ? -1 : 1) * bx,
            (dir.flipY ? -1 : 1) * by,
            branchWeight(v, jitters[spec.jitterIndex] ?? 0, false),
          );
        }
      }

      // --- fly-branch bundle (Flat Brush / Deckle Edge) -----------------
      if (this.flyBranches.length > 0) {
        const dx = this.x - prevX;
        const dy = this.y - prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.001) {
          const nx = dx / dist;
          const ny = dy / dist;
          const px = -ny;
          const py = nx;
          for (let b = 0; b < this.flyBranches.length; b++) {
            const br = this.flyBranches[b];
            if (this.frame < br.startOffset) continue;
            if (rng.random(0, 1) > br.randThreshold) continue;
            const jitterN = this.rng.noise(
              this.frame * 0.08 + b * 0.15,
              b * 0.01,
            );
            const widthN = this.rng.noise(this.frame * 0.1 + b * 0.1, b * 0.01);
            const off =
              br.perpOffset * size * (0.5 + jitterN * br.offsetVariationFactor);
            const w = Math.max(
              br.minStrokeWeight,
              drawRadius *
                br.sizeMultiplier *
                (0.5 + widthN * br.widthVariationFactor) *
                0.4,
            );
            this.setStroke(ctx, g1, g2, rng.random(80, 200));
            drawBranch(px * off, py * off, Math.min(swCeil, w));
          }
        }
      }
    }

    // --- spray dots ---------------------------------------------------
    // Added on top of the mode painter, never instead of it.
    const wantsSpray =
      (this.mode.id === 1 &&
        this.opts.colorIndex !== 1 &&
        !this.sharpEdge &&
        size >= 1.5 &&
        this.frame > 5 &&
        size < 6) ||
      this.mode.id === 5 ||
      (this.mode.id === 3 && rng.random(0, 1) > 0.4);

    if (wantsSpray) this.sprayDots(ctx, g1, g2);

    this.frame++;
  }

  /** `step2` positions along the segment, ten scattered dots at each. */
  private sprayDots(ctx: CanvasRenderingContext2D, g1: number, g2: number) {
    const rng = this.rng;
    const steps = this.opts.step2;
    const density = remap(
      this.rng.noise(this.x * 0.01, this.y * 0.01),
      0,
      1,
      0.3,
      1,
    );
    const size =
      Math.min(this.spraySize, this.brushSizeNow > 0 ? this.brushSizeNow : 1) *
      density;
    if (!(size > 0)) return;

    ctx.save();
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const lx = lerp(this.x - this.accelX, this.x, t);
      const ly = lerp(this.y - this.accelY, this.y, t);
      for (let j = 0; j < 10; j++) {
        const a = rng.random(0, TWO_PI);
        const r = rng.random(0, this.spraySize);
        const dotSize = rng.random(0.4, 2) * Math.max(0.3, density);
        const alpha = rng.random(40, 160);
        const gray = clamp(
          Math.round(
            this.opts.colorIndex === 0
              ? g1
              : this.opts.colorIndex === 1
                ? 150
                : g2,
          ),
          0,
          255,
        );
        ctx.fillStyle = `rgba(${gray},${gray},${gray},${alpha / 255})`;
        const px = lx + Math.cos(a) * r;
        const py = ly + Math.sin(a) * r;
        ctx.beginPath();
        ctx.arc(px, py, dotSize * 0.5, 0, TWO_PI);
        ctx.fill();
        this.track(px, py, dotSize);
      }
    }
    ctx.restore();
  }
}

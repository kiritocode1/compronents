/**
 * Numbers and the base preset from the pinned balloon zinnia module.
 * Partial props merge onto this preset. The module also carries a second set
 * of fallbacks (lean 50, cup 50, phase 72) that only apply when a control is
 * missing; the live base preset, which is what this ships, uses the values below.
 */

export interface ColorStop {
  color: string;
  width: number;
}

export interface StemSettings {
  show: boolean;
  curve: number;
  thickness: number;
}

export interface PlacementSettings {
  x: number;
  y: number;
  angle: number;
  tilt: number;
}

export interface EntranceSettings {
  animate: boolean;
  delay: number;
  stagger: number;
}

export interface ResponseSettings {
  reach: number;
  swell: number;
  follow: number;
  bounce: number;
}

export interface MotionSettings {
  sway: number;
  breathe: number;
  speed: number;
  flow: number;
  pulse: number;
}

export interface AdvancedSettings {
  lean: number;
  bandAxis: number;
  lens: number;
  cup: number;
  twist: number;
  ribs: number;
  swayYaw: number;
  breatheAngle: number;
  nodAngle: number;
  swayPeriod: number;
  pulseDepth: number;
  phase: number;
  bloomTime: number;
  followEase: number;
}

export interface BalloonZinniaSettings {
  background: string;
  colors: ColorStop[];
  petals: number;
  stem: StemSettings;
  petalLength: number;
  petalWidth: number;
  puff: number;
  bands: number;
  grain: number;
  scale: number;
  placement: PlacementSettings;
  entrance: EntranceSettings;
  response: ResponseSettings;
  motion: MotionSettings;
  advanced: AdvancedSettings;
}

export const PALETTE: ColorStop[] = [
  { color: "#479413", width: 9.4 },
  { color: "#6A9644", width: 6.2 },
  { color: "#CEACB7", width: 3.1 },
  { color: "#F3ABCE", width: 14.8 },
  { color: "#FB3B66", width: 2.3 },
  { color: "#EA0444", width: 4.7 },
  { color: "#842643", width: 2.3 },
  { color: "#1A1B2C", width: 6.3 },
  { color: "#243A86", width: 10.2 },
  { color: "#3955DA", width: 12.5 },
  { color: "#698AFD", width: 4.7 },
  { color: "#B2BCE4", width: 0.8 },
  { color: "#E7D4CA", width: 22.7 },
];

export const DEFAULT_SETTINGS: BalloonZinniaSettings = {
  background: "#000000",
  colors: PALETTE,
  petals: 22,
  stem: { show: true, curve: 100, thickness: 100 },
  petalLength: 200,
  petalWidth: 100,
  puff: 134,
  bands: 5,
  grain: 0,
  scale: 100,
  placement: { x: 0, y: 0, angle: 0, tilt: 0 },
  entrance: { animate: false, delay: 0, stagger: 5 },
  response: { reach: 5, swell: 5, follow: 5, bounce: 5 },
  motion: { sway: 5, breathe: 5, speed: 5, flow: 5, pulse: 5 },
  advanced: {
    lean: 48,
    bandAxis: 48,
    lens: 12,
    cup: 25,
    twist: 0,
    ribs: 10,
    swayYaw: 29,
    breatheAngle: 35,
    nodAngle: 0,
    swayPeriod: 14,
    pulseDepth: 36,
    phase: 60,
    bloomTime: 0.9,
    followEase: 0.3,
  },
};

/** Portrait composition the flower is scaled into, width / height. */
export const COMPOSITION_ASPECT = 720 / 1280;

export const PALETTE_WIDTH = 512;
export const STEM_SAMPLES = 220;
export const MAX_ELLIPSOIDS = 64;
export const MAX_PETALS = 24;

/** Longitude, latitude pairs. Picked from on-screen size, coarse first. */
export const PETAL_LODS: readonly (readonly [number, number])[] = [
  [24, 12],
  [48, 24],
  [96, 48],
  [160, 80],
];

/** Vertices around the stem. Picked the same way. */
export const STEM_ROUNDS = [24, 40, 64] as const;

export const NEAR = 0.5;
export const FAR = 120;

/** Half-height of the flower in world units, and how far the head sits above centre. */
export const COMPOSITION_HALF = 0.226;
export const HEAD_LIFT = 0.098;

export const DEG = Math.PI / 180;
export const TAU = Math.PI * 2;

export function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

export function num(value: number, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function mergeStop(stop: ColorStop | undefined, index: number): ColorStop {
  const base = PALETTE[index % PALETTE.length] ?? PALETTE[0];
  return {
    color: stop?.color ?? base.color,
    width: num(stop?.width ?? Number.NaN, base.width),
  };
}

/** What a caller may pass. Nested groups can be partial. */
export interface BalloonZinniaInput {
  background?: string;
  colors?: ColorStop[];
  petals?: number;
  stem?: Partial<StemSettings>;
  petalLength?: number;
  petalWidth?: number;
  puff?: number;
  bands?: number;
  grain?: number;
  scale?: number;
  placement?: Partial<PlacementSettings>;
  entrance?: Partial<EntranceSettings>;
  response?: Partial<ResponseSettings>;
  motion?: Partial<MotionSettings>;
  advanced?: Partial<AdvancedSettings>;
}

function defined<T extends object>(
  base: T,
  partial: Partial<T> | undefined,
): T {
  const next = { ...base };
  if (!partial) return next;
  for (const key of Object.keys(partial) as (keyof T)[]) {
    const value = partial[key];
    if (value !== undefined) next[key] = value as T[keyof T];
  }
  return next;
}

/** Fill any omitted control from the base preset. */
export function resolveSettings(
  partial: BalloonZinniaInput | undefined,
): BalloonZinniaSettings {
  const base = DEFAULT_SETTINGS;
  const colors =
    partial?.colors && partial.colors.length >= 2
      ? partial.colors.map((stop, index) => mergeStop(stop, index))
      : base.colors;
  return {
    background: partial?.background ?? base.background,
    colors,
    petals: num(partial?.petals ?? Number.NaN, base.petals),
    stem: defined(base.stem, partial?.stem),
    petalLength: num(partial?.petalLength ?? Number.NaN, base.petalLength),
    petalWidth: num(partial?.petalWidth ?? Number.NaN, base.petalWidth),
    puff: num(partial?.puff ?? Number.NaN, base.puff),
    bands: num(partial?.bands ?? Number.NaN, base.bands),
    grain: num(partial?.grain ?? Number.NaN, base.grain),
    scale: num(partial?.scale ?? Number.NaN, base.scale),
    placement: defined(base.placement, partial?.placement),
    entrance: defined(base.entrance, partial?.entrance),
    response: defined(base.response, partial?.response),
    motion: defined(base.motion, partial?.motion),
    advanced: defined(base.advanced, partial?.advanced),
  };
}

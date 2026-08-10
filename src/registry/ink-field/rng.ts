/**
 * Deterministic randomness for InkField.
 *
 * The original engine runs on p5, so every stroke's character comes out of two
 * specific generators: p5's seeded LCG (`random`) and p5's table-based Perlin
 * (`noise`). Reimplementing the brush with `Math.random` and a different noise
 * would produce marks that are plausible but not the same marks, so both are
 * ported exactly from p5 1.11.10.
 *
 * The generators are instance-based rather than module globals so several
 * canvases can run side by side without sharing a stream.
 *
 * BLANK - aryank.space
 */

/** Linear congruential generator, Numerical Recipes constants (p5 1.11.10). */
const LCG_M = 4294967296;
const LCG_A = 1664525;
const LCG_C = 1013904223;

const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

const scaledCosine = (i: number) => 0.5 * (1 - Math.cos(i * Math.PI));

export class InkRandom {
  private z = 0;
  private seeded = false;

  /** Perlin lattice, rebuilt whenever the noise seed changes. */
  private perlin: Float64Array | null = null;
  private octaves = 4;
  private falloff = 0.5;

  /**
   * Call counter. The original threads every draw through a counting wrapper
   * (`Crandom`) because replay determinism depends on the number of draws, not
   * just the seed. Kept so a stroke can be reproduced or diffed.
   */
  count = 0;

  constructor(seed?: number) {
    if (seed !== undefined) {
      this.randomSeed(seed);
      this.noiseSeed(seed);
    }
  }

  randomSeed(seed: number) {
    this.z = seed >>> 0;
    this.seeded = true;
  }

  /** Raw float in [0, 1). */
  private next(): number {
    if (!this.seeded) return Math.random();
    this.z = (LCG_A * this.z + LCG_C) % LCG_M;
    return this.z / LCG_M;
  }

  /**
   * p5's `random` overloads: no args -> [0,1); one arg -> [0,arg); two args ->
   * [min,max), swapping if reversed.
   */
  random(min?: number, max?: number): number {
    this.count++;
    const r = this.next();
    if (min === undefined) return r;
    if (max === undefined) return r * min;
    if (min > max) return r * (min - max) + max;
    return r * (max - min) + min;
  }

  /** Uniform integer in [min, max). Matches `floor(random(min, max))`. */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max));
  }

  pick<T>(items: readonly T[]): T {
    return items[
      Math.min(items.length - 1, Math.floor(this.random(0, items.length)))
    ];
  }

  noiseSeed(seed: number) {
    let z = seed >>> 0;
    const rand = () => {
      z = (LCG_A * z + LCG_C) % LCG_M;
      return z / LCG_M;
    };
    const table = new Float64Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) table[i] = rand();
    this.perlin = table;
  }

  noiseDetail(octaves: number, falloff: number) {
    if (octaves > 0) this.octaves = octaves;
    if (falloff > 0) this.falloff = falloff;
  }

  /**
   * p5's Perlin: a 4096-entry lattice sampled with cosine interpolation over
   * `octaves` doublings. Not gradient noise, and its output sits around 0.5
   * rather than spanning [-1,1], which is why callers remap so aggressively.
   */
  noise(x: number, y = 0, z = 0): number {
    if (!this.perlin) this.noiseSeed(0);
    const perlin = this.perlin as Float64Array;

    const ax = x < 0 ? -x : x;
    const ay = y < 0 ? -y : y;
    const az = z < 0 ? -z : z;

    let xi = Math.floor(ax);
    let yi = Math.floor(ay);
    let zi = Math.floor(az);
    let xf = ax - xi;
    let yf = ay - yi;
    let zf = az - zi;

    let r = 0;
    let ampl = 0.5;

    for (let o = 0; o < this.octaves; o++) {
      let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
      const rxf = scaledCosine(xf);
      const ryf = scaledCosine(yf);

      let n1 = perlin[of & PERLIN_SIZE];
      n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
      let n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
      n1 += ryf * (n2 - n1);

      of += PERLIN_ZWRAP;
      n2 = perlin[of & PERLIN_SIZE];
      n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
      let n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
      n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
      n2 += ryf * (n3 - n2);

      n1 += scaledCosine(zf) * (n2 - n1);
      r += n1 * ampl;
      ampl *= this.falloff;

      xi <<= 1;
      xf *= 2;
      yi <<= 1;
      yf *= 2;
      zi <<= 1;
      zf *= 2;

      if (xf >= 1) {
        xi++;
        xf--;
      }
      if (yf >= 1) {
        yi++;
        yf--;
      }
      if (zf >= 1) {
        zi++;
        zf--;
      }
    }

    return r;
  }
}

/** p5's `map`, without the clamp. */
export const remap = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);

export const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Seeded autoplay.
 *
 * A drawing tool renders blank paper until someone draws on it, so the demo
 * paints itself. Paths are stored as a handful of normalised control points and
 * expanded with a centripetal Catmull-Rom spline into the 50-80 samples per
 * stroke that the brush physics expect; anything shorter and the spring never
 * settles, which reads as a stuttery mark.
 *
 * Normalised coordinates mean a composition holds its shape at any aspect
 * ratio, and the seed makes the same artwork reproducible.
 *
 * BLANK - aryank.space
 */

import type { BrushModeId } from "./brush";
import { InkRandom } from "./rng";

export interface DemoStroke {
  mode: BrushModeId;
  inkMode: number;
  colorIndex: number;
  size: number;
  /** Frames to hold after the path ends, letting the ink settle. */
  hold: number;
  points: { x: number; y: number }[];
}

type Point = { x: number; y: number };

/** Centripetal Catmull-Rom through the control points. */
function spline(controls: Point[], samples: number): Point[] {
  if (controls.length < 2) return controls.slice();
  const pts = [controls[0], ...controls, controls[controls.length - 1]];
  const out: Point[] = [];
  const segments = pts.length - 3;

  for (let i = 0; i < segments; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const p2 = pts[i + 2];
    const p3 = pts[i + 3];
    const per = Math.max(2, Math.round(samples / segments));
    for (let s = 0; s < per; s++) {
      const t = s / per;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(controls[controls.length - 1]);
  return out;
}

/** A sweeping ensō-like arc, opened at the top left. */
function arcControls(
  rng: InkRandom,
  cx: number,
  cy: number,
  r: number,
): Point[] {
  const start = -0.35 * Math.PI;
  const sweep = 1.72 * Math.PI;
  const steps = 9;
  const out: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + sweep * t;
    // The radius breathes so the circle is drawn, not plotted.
    const wobble = 1 + (rng.random(-0.05, 0.05) + Math.sin(t * 5.2) * 0.035);
    out.push({
      x: cx + Math.cos(a) * r * wobble * 1.04,
      y: cy + Math.sin(a) * r * wobble,
    });
  }
  return out;
}

/**
 * Builds the demo composition: one large gestural arc, two supporting vertical
 * strokes and a small dry accent, so every part of the pipeline is visible
 * (a wet bleeding mark, a fibrous one, and dry spray) before anyone touches it.
 */
export function buildDemoStrokes(seed: number): DemoStroke[] {
  const rng = new InkRandom(seed);
  const strokes: DemoStroke[] = [];

  // The ensō is the hero, left of centre so the column has room to breathe.
  strokes.push({
    mode: 1,
    inkMode: 4,
    colorIndex: 0,
    size: 2,
    hold: 30,
    points: spline(arcControls(rng, 0.38, 0.5, 0.235), 72),
  });

  // A column of two marks to the right: one wet and solid, one dry and fibrous.
  const colX = 0.73;
  strokes.push({
    mode: 1,
    inkMode: 0,
    colorIndex: 0,
    size: 1,
    hold: 22,
    points: spline(
      [
        { x: colX + rng.random(-0.006, 0.006), y: 0.24 },
        { x: colX + rng.random(-0.008, 0.008), y: 0.32 },
        { x: colX + rng.random(-0.008, 0.008), y: 0.4 },
        { x: colX - 0.004, y: 0.47 },
      ],
      58,
    ),
  });

  strokes.push({
    mode: 6,
    inkMode: 5,
    colorIndex: 0,
    size: 0.5,
    hold: 20,
    points: spline(
      [
        { x: colX - 0.045, y: 0.55 },
        { x: colX + 0.01, y: 0.6 },
        { x: colX + 0.045, y: 0.66 },
      ],
      54,
    ),
  });

  // A small vermilion seal, the way a finished sheet is stamped.
  strokes.push({
    mode: 4,
    inkMode: 3,
    colorIndex: 30,
    size: 0.5,
    hold: 26,
    points: spline(
      [
        { x: colX - 0.012, y: 0.735 },
        { x: colX - 0.006, y: 0.762 },
        { x: colX - 0.014, y: 0.79 },
      ],
      50,
    ),
  });

  return strokes;
}

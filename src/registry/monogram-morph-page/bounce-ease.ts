/**
 * The bounce ease every character fade on this page runs on.
 *
 * The source site eases its opacity tweens with GSAP's CustomBounce plugin at
 * `strength: 0.8`, which is a paid Club GreenSock plugin. CustomBounce is only
 * a generator though: it emits a plain cubic-bezier path once at registration
 * and CustomEase samples it from then on. So the path below is that output,
 * baked in, and `bounceEase` evaluates it directly. Same curve, no Club
 * dependency, nothing to register.
 *
 * The curve matters because it is applied to opacity rather than to position.
 * It settles on 1 by overshooting and falling back (1 -> 0.36 -> 1 -> 0.63 ->
 * 1 ...), so a character does not fade in, it blinks in and stutters to solid.
 * That flicker is the whole texture of the page's text transitions.
 *
 * Layout: [x0, y0, then per segment: c1x, c1y, c2x, c2y, x, y].
 */
const BOUNCE_PATH = [
  0, 0, 0.119, 0, 0.17, 1, 0.17, 1, 0.17, 1, 0.202, 0.36, 0.29, 0.36, 0.36,
  0.36, 0.415, 1, 0.415, 1, 0.415, 1, 0.447, 0.6303, 0.501, 0.6303, 0.545,
  0.6303, 0.591, 1, 0.591, 1, 0.591, 1, 0.615, 0.8073, 0.654, 0.8073, 0.684,
  0.8073, 0.718, 1, 0.718, 1, 0.718, 1, 0.734, 0.9093, 0.763, 0.9093, 0.786,
  0.9093, 0.81, 1, 0.81, 1, 0.81, 1, 0.82, 0.9615, 0.842, 0.9615, 0.86, 0.9615,
  0.876, 1, 0.876, 1, 0.876, 1, 0.882, 0.9853, 0.899, 0.9853, 0.913, 0.9853,
  0.923, 1, 0.923, 1, 0.923, 1, 0.927, 0.9949, 0.94, 0.9949, 0.95, 0.9949,
  0.957, 1, 0.957, 1, 0.957, 1, 0.959, 0.9984, 0.969, 0.9984, 0.977, 0.9984,
  0.982, 1, 0.982, 1, 0.982, 1, 0.983, 0.9996, 0.99, 0.9996, 0.996, 0.9996, 1,
  1, 1, 1,
];

interface BounceSegment {
  x0: number;
  y0: number;
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
  x1: number;
  y1: number;
}

const SEGMENTS: BounceSegment[] = (() => {
  const out: BounceSegment[] = [];
  let x0 = BOUNCE_PATH[0];
  let y0 = BOUNCE_PATH[1];
  for (let i = 2; i + 5 < BOUNCE_PATH.length; i += 6) {
    const seg: BounceSegment = {
      x0,
      y0,
      c1x: BOUNCE_PATH[i],
      c1y: BOUNCE_PATH[i + 1],
      c2x: BOUNCE_PATH[i + 2],
      c2y: BOUNCE_PATH[i + 3],
      x1: BOUNCE_PATH[i + 4],
      y1: BOUNCE_PATH[i + 5],
    };
    out.push(seg);
    x0 = seg.x1;
    y0 = seg.y1;
  }
  return out;
})();

function cubic(a: number, b: number, c: number, d: number, t: number) {
  const m = 1 - t;
  return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d;
}

/**
 * Evaluate the baked bounce curve. Each segment is monotonic in x, so a short
 * bisection on x is enough to recover the parameter and read y off it.
 */
export function bounceEase(progress: number): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  let seg = SEGMENTS[SEGMENTS.length - 1];
  for (const candidate of SEGMENTS) {
    if (progress <= candidate.x1) {
      seg = candidate;
      break;
    }
  }

  const span = seg.x1 - seg.x0;
  if (span <= 0) return seg.y1;

  let lo = 0;
  let hi = 1;
  let t = (progress - seg.x0) / span;
  for (let i = 0; i < 18; i++) {
    const x = cubic(seg.x0, seg.c1x, seg.c2x, seg.x1, t);
    if (x < progress) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }

  return cubic(seg.y0, seg.c1y, seg.c2y, seg.y1, t);
}

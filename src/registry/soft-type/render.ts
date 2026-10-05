/**
 * Draws the world on a transparent canvas: each stroke is a fat round-capped
 * line through its particles, or, in blueprint mode, the 1px outline of that
 * tube with ribs and control-point markers.
 */
import type { Body, Particle, Path, World } from "./engine";

export interface Theme {
  ink: string;
  paper: string;
}

const WIRE = {
  line: "#8e9094",
  rib: "rgba(142,144,148,.45)",
  handle: "#55575b",
  fill: "rgba(255,255,255,.35)",
};

/**
 * A stroke's spine: quadratic curves through the midpoints between particles,
 * with each particle as the control point, flattened into short straight pieces.
 * Stroking real curves leaves hairline cracks on iOS where a fat curve bends
 * sharply, so the canvas only ever strokes polylines.
 */
function spine(path: Path) {
  const nodes = path.nodes;
  const count = nodes.length;
  const out = new Path2D();
  let last: [number, number] | null = null;
  const to = (x: number, y: number) => {
    if (!last) out.moveTo(x, y);
    else if (Math.hypot(x - last[0], y - last[1]) < 0.05) return;
    else out.lineTo(x, y);
    last = [x, y];
  };
  const mid = (a: Particle, b: Particle): [number, number] => [
    (a.x + b.x) / 2,
    (a.y + b.y) / 2,
  ];
  const curve = (p0: [number, number], c: Particle, p1: [number, number]) => {
    const ax = c.x - p0[0];
    const ay = c.y - p0[1];
    const bx = p1[0] - c.x;
    const by = p1[1] - c.y;
    const turn = Math.abs(Math.atan2(ax * by - ay * bx, ax * bx + ay * by));
    const pieces = Math.max(1, Math.min(24, Math.ceil(turn / 0.1)));
    for (let k = 1; k <= pieces; k++) {
      const t = k / pieces;
      const u = 1 - t;
      to(
        u * u * p0[0] + 2 * u * t * c.x + t * t * p1[0],
        u * u * p0[1] + 2 * u * t * c.y + t * t * p1[1],
      );
    }
  };
  if (path.closed) {
    let start = mid(nodes[count - 1], nodes[0]);
    to(...start);
    for (let i = 0; i < count; i++) {
      const end = mid(nodes[i], nodes[(i + 1) % count]);
      curve(start, nodes[i], end);
      start = end;
    }
    out.closePath();
  } else {
    let start: [number, number] = [nodes[0].x, nodes[0].y];
    to(...start);
    for (let i = 1; i < count - 1; i++) {
      const end = mid(nodes[i], nodes[i + 1]);
      curve(start, nodes[i], end);
      start = end;
    }
    if (count > 1) to(nodes[count - 1].x, nodes[count - 1].y);
    // A single particle still draws as a round dot.
    else out.lineTo(start[0] + 0.01, start[1]);
  }
  return out;
}

interface Rib {
  path: Path;
  i: number;
  end: boolean;
  shown: [boolean, boolean];
}

type Coord = "live" | "rest";

/**
 * Where a particle's rib sits on the drawn spine. The spine passes near, not
 * through, each particle, so this is the curve's midpoint for that particle's
 * segment and its unit tangent.
 */
function spineAt(path: Path, i: number, coord: Coord) {
  const X = (n: Particle) => (coord === "live" ? n.x : n.ox);
  const Y = (n: Particle) => (coord === "live" ? n.y : n.oy);
  const nodes = path.nodes;
  const count = nodes.length;
  const n = nodes[i];
  if (count === 1) return { x: X(n), y: Y(n), ux: 1, uy: 0 };
  if (!path.closed && (i === 0 || i === count - 1)) {
    const o = nodes[i === 0 ? 1 : count - 2];
    const sx = i === 0 ? X(o) - X(n) : X(n) - X(o);
    const sy = i === 0 ? Y(o) - Y(n) : Y(n) - Y(o);
    const l = Math.hypot(sx, sy) || 1;
    return { x: X(n), y: Y(n), ux: sx / l, uy: sy / l };
  }
  const prev = nodes[(i - 1 + count) % count];
  const next = nodes[(i + 1) % count];
  const start =
    !path.closed && i === 1
      ? [X(prev), Y(prev)]
      : [(X(prev) + X(n)) / 2, (Y(prev) + Y(n)) / 2];
  const end = [(X(n) + X(next)) / 2, (Y(n) + Y(next)) / 2];
  const tx = end[0] - start[0];
  const ty = end[1] - start[1];
  const l = Math.hypot(tx, ty) || 1;
  return {
    x: start[0] * 0.25 + X(n) * 0.5 + end[0] * 0.25,
    y: start[1] * 0.25 + Y(n) * 0.5 + end[1] * 0.25,
    ux: tx / l,
    uy: ty / l,
  };
}

/**
 * Ribs are chosen once per letter from its rest shape, so they stay put as it
 * moves. Every free stroke end gets one. Between them, a rib goes every four
 * pen widths, kept only where both of its points lie on the visible outline.
 */
function ribsFor(body: Body): Rib[] {
  if (Array.isArray(body.ribs)) return body.ribs as Rib[];
  const uses = new Map<Particle, number>();
  for (const path of body.paths)
    for (const n of path.nodes) uses.set(n, (uses.get(n) ?? 0) + 1);
  const visible = (x: number, y: number) =>
    body.nodes.every((m) => Math.hypot(m.ox - x, m.oy - y) >= m.r * 0.97);
  const sides = (path: Path, i: number) => {
    const { x, y, ux, uy } = spineAt(path, i, "rest");
    const r = path.nodes[i].r;
    return [
      [x - uy * r, y + ux * r],
      [x + uy * r, y - ux * r],
    ] as const;
  };
  const ribs: Rib[] = [];
  const taken: (readonly [number, number])[] = [];
  for (const path of body.paths) {
    if (path.closed || path.nodes.length < 2) continue;
    for (const i of [0, path.nodes.length - 1]) {
      if (uses.get(path.nodes[i]) !== 1) continue;
      const pts = sides(path, i);
      ribs.push({
        path,
        i,
        end: true,
        shown: [visible(...pts[0]), visible(...pts[1])],
      });
      taken.push(...pts);
    }
  }
  for (const path of body.paths) {
    const nodes = path.nodes;
    let travelled = path.closed ? Infinity : 0;
    for (let i = 1; i < nodes.length; i++) {
      travelled += Math.hypot(
        nodes[i].ox - nodes[i - 1].ox,
        nodes[i].oy - nodes[i - 1].oy,
      );
      const r = nodes[i].r;
      if (travelled < r * 4 || (!path.closed && i > nodes.length - 3)) continue;
      const pts = sides(path, i);
      if (!pts.every((p) => visible(...p))) continue;
      if (
        taken.some(([x, y]) =>
          pts.some(([px, py]) => Math.hypot(x - px, y - py) < r * 0.6),
        )
      )
        continue;
      travelled = 0;
      ribs.push({ path, i, end: false, shown: [true, true] });
      taken.push(...pts);
    }
  }
  body.ribs = ribs;
  return ribs;
}

function drawWire(ctx: CanvasRenderingContext2D, body: Body, spines: Path2D[]) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = WIRE.line;
  body.paths.forEach((p, i) => {
    ctx.lineWidth = p.radius * 2 + 1.1;
    ctx.stroke(spines[i]);
  });
  // Erase a slightly thinner tube, leaving a 1px outline. Letters never overlap, so this only
  // clears the letter's own middle.
  ctx.globalCompositeOperation = "destination-out";
  body.paths.forEach((p, i) => {
    ctx.lineWidth = Math.max(0.5, p.radius * 2 - 1.1);
    ctx.stroke(spines[i]);
  });
  ctx.restore();

  ctx.save();
  ctx.lineWidth = 1;
  ctx.fillStyle = WIRE.fill;
  const marks: [number, number, number, number][] = [];
  const ribs = ribsFor(body);
  for (const rib of ribs) {
    const { x, y, ux, uy } = spineAt(rib.path, rib.i, "live");
    const r = rib.path.nodes[rib.i].r;
    const a: [number, number] = [x - uy * r, y + ux * r];
    const c: [number, number] = [x + uy * r, y - ux * r];
    if (rib.shown[0] && rib.shown[1]) {
      ctx.strokeStyle = WIRE.rib;
      ctx.beginPath();
      ctx.moveTo(...a);
      ctx.lineTo(...c);
      ctx.stroke();
    }
    if (rib.shown[0]) marks.push([a[0], a[1], ux, uy]);
    if (rib.shown[1]) marks.push([c[0], c[1], ux, uy]);
  }
  // Each control point is a small circle whose slash runs along the stroke's edge.
  ctx.strokeStyle = WIRE.line;
  for (const [x, y, ux, uy] of marks) {
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - ux * 3.5, y - uy * 3.5);
    ctx.lineTo(x + ux * 3.5, y + uy * 3.5);
    ctx.stroke();
  }
  // Free stroke ends get a darker open handle at the centre of the stroke.
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = WIRE.handle;
  for (const rib of ribs) {
    if (!rib.end) continue;
    const n = rib.path.nodes[rib.i];
    ctx.beginPath();
    ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export interface Caret {
  x: number;
  y: number;
  h: number;
  /** 0 to 1. */
  alpha: number;
}

export interface DrawOptions {
  ratio: number;
  theme: Theme;
  blueprint: boolean;
  caret: Caret | null;
}

export function draw(
  ctx: CanvasRenderingContext2D,
  world: World,
  options: DrawOptions,
) {
  const { width, height } = world;
  ctx.setTransform(options.ratio, 0, 0, options.ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  // A paper-coloured rim under each letter keeps near-touching letters from fusing.
  const halo = Math.max(1.5, Math.min(4.5, Math.min(width, height) * 0.0035));
  for (const body of [...world.bodies].sort((a, b) => a.z - b.z)) {
    const spines = body.paths.map(spine);
    if (options.blueprint) {
      drawWire(ctx, body, spines);
      continue;
    }
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = options.theme.paper;
    body.paths.forEach((p, i) => {
      ctx.lineWidth = p.radius * 2;
      ctx.stroke(spines[i]);
    });
    ctx.strokeStyle = options.theme.ink;
    body.paths.forEach((p, i) => {
      ctx.lineWidth = Math.max(0.5, p.radius * 2 - halo * 2);
      ctx.stroke(spines[i]);
    });
    ctx.restore();
  }
  const caret = options.caret;
  if (caret && caret.alpha > 0) {
    const w = Math.max(2, Math.min(7, caret.h * 0.045));
    ctx.save();
    ctx.globalAlpha = caret.alpha;
    ctx.strokeStyle = options.blueprint ? WIRE.handle : options.theme.ink;
    ctx.lineCap = "round";
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(caret.x, caret.y - caret.h * 0.36 + w / 2);
    ctx.lineTo(caret.x, caret.y + caret.h * 0.36 - w / 2);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Soft-body tube letters.
 *
 * Each letter is a chain of particles laid along its skeleton. Distance links,
 * a bending constraint and a translation-only shape spring hold it together;
 * contacts keep letters apart. Everything is solved with position-based
 * dynamics at a fixed 60 Hz tick, so a grabbed particle can be dragged anywhere
 * and the rest of the letter stretches, squashes and shoves its neighbours.
 */
import type { GlyphSkeleton } from "./skeleton";

export interface Particle {
  /** Index inside its body. */
  index: number;
  body: Body;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Rest offset from the body's centre, px, already tilted. */
  ox: number;
  oy: number;
  /** Pen radius, px. */
  r: number;
}

interface Link {
  a: Particle;
  b: Particle;
  length: number;
}

export interface Path {
  nodes: Particle[];
  closed: boolean;
  /** Pen radius, px. */
  radius: number;
}

/** Where a letter sits: its ink centre, pixels per em and tilt in radians. */
export interface Pose {
  x: number;
  y: number;
  size: number;
  angle: number;
}

interface Spring {
  value: number;
  v: number;
  target: number;
  stiffness: number;
  damping: number;
  floor: number;
}

const TICK = 60;
/** Tilt, in radians, beyond which the shape spring stops pulling straight upright (20 degrees). */
const UNWIND = 0.35;
/** Links may stretch or squash this far and no further, however fast a letter is thrown. */
const STRETCH = 1.45;
const SQUASH = 0.65;

function stepSpring(s: Spring) {
  s.v += ((s.target - s.value) * s.stiffness - s.v * s.damping) / TICK;
  s.value = Math.max(s.floor, s.value + s.v / TICK);
}

function settled(s: Spring) {
  return Math.abs(s.target - s.value) < 0.001 && Math.abs(s.v) < 0.01;
}

export class Body {
  readonly id: number;
  readonly grapheme: string;
  readonly nodes: Particle[] = [];
  readonly paths: Path[] = [];
  readonly links: Link[] = [];
  /** Same-body particle pairs that never collide: neighbours along the material. */
  readonly calm = new Set<number>();
  cx = 0;
  cy = 0;
  bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  /** Largest pen radius, px. */
  radius = 0;
  /** Draw order; the last grabbed letter draws on top. */
  z = 0;
  /** Size relative to the layout, sprung so relayouts glide. */
  readonly layout: Spring = {
    value: 1,
    v: 0,
    target: 1,
    stiffness: 90,
    damping: 16,
    floor: 0.05,
  };
  /** Inflation for spawn, hold-to-pop and removal. */
  puff: Spring | null = null;
  /** Scale currently baked into the rest shape. */
  private applied = 1;
  /**
   * Pulls the letter to its layout slot for a few seconds after the text changes, fading out,
   * so letters arrive and settle. After that the arrangement is yours to push around.
   */
  anchor: { x: number; y: number; ticks: number } | null = null;
  /** Ticks before a spawned letter starts to grow, so a burst of letters arrives as a cascade. */
  delay = 0;
  /** Ticks spent badly stretched while nobody holds it; see World.untangle. */
  strained = 0;
  /** Ticks left easing back to the rest shape. */
  mending = 0;
  /** Set each tick while forming: passes through other letters instead of shoving them. */
  ghost = false;
  /** Rotation from the rest pose, fitted each tick: bending follows it. */
  private cos = 1;
  private sin = 0;
  /** Rotation of the shape spring's target, which trails `angle` back toward upright. */
  private turnCos = 1;
  private turnSin = 0;
  /** Mean rest offset, so targets sit around the current centroid. */
  private meanX = 0;
  private meanY = 0;
  leaving = false;
  /** Renderer cache. */
  ribs?: unknown;

  constructor(id: number, skeleton: GlyphSkeleton, pose: Pose) {
    this.id = id;
    this.grapheme = skeleton.grapheme;
    const { bounds } = skeleton;
    const midX = (bounds.minX + bounds.maxX) / 2;
    const midY = (bounds.minY + bounds.maxY) / 2;
    const cos = Math.cos(pose.angle);
    const sin = Math.sin(pose.angle);
    const owners = new Map<Particle, Set<number>>();

    skeleton.strokes.forEach((stroke, strokeIndex) => {
      const r = stroke.radius * pose.size;
      this.radius = Math.max(this.radius, r);
      const local = stroke.points.map((p) => ({
        x: (p.x - midX) * pose.size,
        y: (p.y - midY) * pose.size,
      }));
      if (stroke.closed) local.push(local[0]);
      const lengths = [0];
      for (let i = 1; i < local.length; i++)
        lengths.push(
          lengths[i - 1] +
            Math.hypot(
              local[i].x - local[i - 1].x,
              local[i].y - local[i - 1].y,
            ),
        );
      const length = lengths[lengths.length - 1];
      const count =
        local.length === 1 ? 0 : Math.max(3, Math.ceil(length / (r * 0.6)));
      const path: Particle[] = [];
      for (let i = 0; i <= count; i++) {
        if (stroke.closed && i === count) break;
        const distance = count ? (length * i) / count : 0;
        let j = 1;
        while (j < lengths.length - 1 && lengths[j] < distance) j++;
        const a = local[Math.max(0, j - 1)];
        const b = local[Math.min(local.length - 1, j)];
        const t =
          count && lengths[j] !== lengths[j - 1]
            ? (distance - lengths[j - 1]) / (lengths[j] - lengths[j - 1])
            : 0;
        const lx = a.x + (b.x - a.x) * t;
        const ly = a.y + (b.y - a.y) * t;
        const ox = lx * cos - ly * sin;
        const oy = lx * sin + ly * cos;
        // Stroke ends snap onto the stroke they meet, so a crossbar is welded to its stem.
        const end = !stroke.closed && (i === 0 || i === count);
        let node: Particle | null = null;
        let best = r * (end ? 1.1 : 0.28);
        for (const m of this.nodes) {
          const d = Math.hypot(m.ox - ox, m.oy - oy);
          if (d < best) {
            node = m;
            best = d;
          }
        }
        if (!node) {
          node = {
            index: this.nodes.length,
            body: this,
            x: pose.x + ox,
            y: pose.y + oy,
            vx: 0,
            vy: 0,
            ox,
            oy,
            r,
          };
          this.nodes.push(node);
          owners.set(node, new Set());
        } else node.r = Math.max(node.r, r);
        owners.get(node)?.add(strokeIndex);
        if (path[path.length - 1] !== node) path.push(node);
      }
      for (let i = 1; i < path.length; i++) this.link(path[i - 1], path[i]);
      if (stroke.closed && path.length > 2)
        this.link(path[path.length - 1], path[0]);
      this.paths.push({
        nodes: path,
        closed: stroke.closed && path.length > 2,
        radius: r,
      });
    });

    // Brace each junction with short links across strokes, so it bends instead of hinging.
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const oa = owners.get(a);
        const ob = owners.get(b);
        if (!oa || !ob || [...oa].some((s) => ob.has(s))) continue;
        if (Math.hypot(a.ox - b.ox, a.oy - b.oy) < (a.r + b.r) * 1.1)
          this.link(a, b);
      }
    }
    this.tether();
    // Particles that touch at rest, or are linked, are one material and skip contacts.
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        if (Math.hypot(a.ox - b.ox, a.oy - b.oy) < (a.r + b.r) * 1.05)
          this.calm.add(i * 4096 + j);
      }
    }
    for (const l of this.links)
      this.calm.add(
        Math.min(l.a.index, l.b.index) * 4096 + Math.max(l.a.index, l.b.index),
      );
    this.update();
  }

  private link(a: Particle, b: Particle) {
    this.links.push({ a, b, length: Math.hypot(a.ox - b.ox, a.oy - b.oy) });
  }

  /**
   * Ties separate pieces (the dot of an i, an umlaut, most strokes of a Han character) to
   * each other. Without this only the shape spring holds them, and one knock scatters them.
   * Pieces join along a spanning tree of nearest pairs, two links each so they cannot spin.
   */
  private tether() {
    const parent = this.nodes.map((_, i) => i);
    const find = (i: number): number => {
      if (parent[i] !== i) parent[i] = find(parent[i]);
      return parent[i];
    };
    for (const l of this.links) parent[find(l.a.index)] = find(l.b.index);
    const groups = new Map<number, Particle[]>();
    for (const n of this.nodes) {
      const root = find(n.index);
      const group = groups.get(root);
      if (group) group.push(n);
      else groups.set(root, [n]);
    }
    const pieces = [...groups.values()];
    if (pieces.length < 2) return;
    const d = (a: Particle, b: Particle) =>
      Math.hypot(a.ox - b.ox, a.oy - b.oy);
    // Prim's algorithm over pieces, measured by their closest particles.
    const joined = new Set([0]);
    while (joined.size < pieces.length) {
      let best: { a: Particle; b: Particle; to: number; d: number } | null =
        null;
      for (const i of joined) {
        for (let j = 0; j < pieces.length; j++) {
          if (joined.has(j)) continue;
          for (const a of pieces[i])
            for (const b of pieces[j])
              if (!best || d(a, b) < best.d) best = { a, b, to: j, d: d(a, b) };
        }
      }
      if (!best) break;
      const first = best;
      this.link(first.a, first.b);
      // A second link from different particles, the nearest such pair, braces against spinning.
      let second: { a: Particle; b: Particle; d: number } | null = null;
      for (const i of joined) {
        for (const a of pieces[i]) {
          if (a === first.a) continue;
          for (const b of pieces[first.to])
            if (b !== first.b && (!second || d(a, b) < second.d))
              second = { a, b, d: d(a, b) };
        }
      }
      if (second) this.link(second.a, second.b);
      else if (pieces[first.to].length === 1) {
        // A one-particle dot: brace it from a second particle on the other side.
        let other: Particle | null = null;
        for (const i of joined)
          for (const a of pieces[i])
            if (a !== first.a && (!other || d(a, first.b) < d(other, first.b)))
              other = a;
        if (other) this.link(other, first.b);
      }
      joined.add(first.to);
    }
  }

  update() {
    let x = 0;
    let y = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of this.nodes) {
      x += n.x;
      y += n.y;
      minX = Math.min(minX, n.x - n.r);
      maxX = Math.max(maxX, n.x + n.r);
      minY = Math.min(minY, n.y - n.r);
      maxY = Math.max(maxY, n.y + n.r);
    }
    const count = this.nodes.length || 1;
    this.cx = x / count;
    this.cy = y / count;
    this.bounds = { minX, maxX, minY, maxY };
  }

  hitTest(x: number, y: number) {
    return this.nodes.some(
      (n) => (x - n.x) ** 2 + (y - n.y) ** 2 <= n.r * n.r * 1.1,
    );
  }

  /** Scale the rest shape, pen and current pose about the centre together. */
  private scaleBy(k: number) {
    this.update();
    this.radius *= k;
    for (const n of this.nodes) {
      n.ox *= k;
      n.oy *= k;
      n.r *= k;
      n.x = this.cx + (n.x - this.cx) * k;
      n.y = this.cy + (n.y - this.cy) * k;
    }
    for (const l of this.links) l.length *= k;
    for (const p of this.paths) p.radius *= k;
  }

  /** Advances the size springs; returns true while either is moving. */
  followScale() {
    stepSpring(this.layout);
    if (this.delay > 0) this.delay--;
    else if (this.puff) stepSpring(this.puff);
    const desired = this.layout.value * (this.puff?.value ?? 1);
    if (Math.abs(desired - this.applied) > 1e-6) {
      this.scaleBy(desired / this.applied);
      this.applied = desired;
    }
    if (
      this.puff &&
      !this.leaving &&
      this.puff.target === 1 &&
      settled(this.puff)
    )
      this.puff = null;
    return !settled(this.layout) || !!this.puff;
  }

  /** Inflate toward `target` times the size. Elastic springs overshoot and wobble back. */
  inflate(target: number, elastic = false) {
    this.puff ??= {
      value: 1,
      v: 0,
      target: 1,
      stiffness: 0,
      damping: 0,
      floor: 0.6,
    };
    this.puff.target = target;
    this.puff.stiffness = elastic ? 220 : 260;
    this.puff.damping = elastic ? 7 : 32;
  }

  /** Grow in from nothing with an elastic overshoot, after `delay` ticks. */
  spawn(delay = 0) {
    this.puff = {
      value: 0.2,
      v: 0,
      target: 1,
      stiffness: 220,
      damping: 9,
      floor: 0.02,
    };
    this.delay = delay;
    this.followScale();
  }

  /** Shrink away; the world drops the body once it is gone. */
  remove() {
    this.leaving = true;
    this.puff = {
      value: this.puff?.value ?? 1,
      v: this.puff?.v ?? 0,
      target: 0,
      stiffness: 320,
      damping: 30,
      floor: 0.02,
    };
  }

  get gone() {
    return this.leaving && (this.puff?.value ?? 1) < 0.08;
  }

  /** Still growing in: too small for its contacts to hold its shape, so it stays rigid. */
  get forming() {
    return (
      !this.leaving &&
      (this.delay > 0 ||
        (!!this.puff &&
          this.puff.target === 1 &&
          this.puff.value < 0.6 &&
          this.puff.floor < 0.5))
    );
  }

  /** Worst stretch or squash of any link, as a fraction of its rest length. */
  strain() {
    let worst = 0;
    for (const l of this.links)
      worst = Math.max(
        worst,
        Math.abs(Math.hypot(l.b.x - l.a.x, l.b.y - l.a.y) / l.length - 1),
      );
    return worst;
  }

  /**
   * Fits the letter's rotation away from its rest pose (2D shape matching). Up to
   * UNWIND the shape spring pulls straight back upright, exactly as the original
   * does. Past that, a fast drag has whipped the letter round, and pulling every
   * particle straight to its upright slot would drag strokes through each other;
   * so the target turns with the letter, trailing UNWIND behind, and the letter
   * swings back as a whole instead of crumpling.
   */
  fit() {
    this.update();
    let mx = 0;
    let my = 0;
    for (const n of this.nodes) {
      mx += n.ox;
      my += n.oy;
    }
    mx /= this.nodes.length || 1;
    my /= this.nodes.length || 1;
    let c = 0;
    let s = 0;
    for (const n of this.nodes) {
      const qx = n.ox - mx;
      const qy = n.oy - my;
      const px = n.x - this.cx;
      const py = n.y - this.cy;
      c += qx * px + qy * py;
      s += qx * py - qy * px;
    }
    const angle = c || s ? Math.atan2(s, c) : 0;
    const turn = angle - Math.max(-UNWIND, Math.min(UNWIND, angle));
    this.meanX = mx;
    this.meanY = my;
    this.cos = Math.cos(angle);
    this.sin = Math.sin(angle);
    this.turnCos = Math.cos(turn);
    this.turnSin = Math.sin(turn);
  }

  /** Where the shape spring wants particle `n`, given the last fit. */
  target(n: Particle) {
    const qx = n.ox - this.meanX;
    const qy = n.oy - this.meanY;
    return {
      x: this.cx + qx * this.turnCos - qy * this.turnSin,
      y: this.cy + qx * this.turnSin + qy * this.turnCos,
    };
  }

  /** A rest-frame vector turned into the letter's current orientation, for bending. */
  turned(x: number, y: number) {
    return { x: x * this.cos - y * this.sin, y: x * this.sin + y * this.cos };
  }

  /**
   * Links as a tree grown outward from `root`, each written as (nearer, farther), so the
   * letter can be pulled along behind a held particle in one pass, like a rope.
   */
  chain(root: Particle) {
    const next = new Map<Particle, Link[]>();
    for (const l of this.links) {
      for (const [p, q] of [
        [l.a, l.b],
        [l.b, l.a],
      ] as const) {
        const list = next.get(p);
        const step = { a: p, b: q, length: l.length };
        if (list) list.push(step);
        else next.set(p, [step]);
      }
    }
    const seen = new Set([root]);
    const queue = [root];
    const tree: Link[] = [];
    for (let i = 0; i < queue.length; i++) {
      for (const step of next.get(queue[i]) ?? []) {
        if (seen.has(step.b)) continue;
        seen.add(step.b);
        queue.push(step.b);
        tree.push(step);
      }
    }
    return tree;
  }

  /** Moves particles toward the rest shape around the current centre by `amount` (0 to 1). */
  restore(amount: number) {
    this.fit();
    for (const n of this.nodes) {
      const t = this.target(n);
      n.x += (t.x - n.x) * amount;
      n.y += (t.y - n.y) * amount;
    }
  }
}

export interface Drag {
  body: Body;
  node: Particle;
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** The letter's links ordered outward from the held particle; see limitStrain. */
  chain: { a: Particle; b: Particle; length: number }[];
}

export class World {
  width: number;
  height: number;
  bodies: Body[] = [];
  drag: Drag | null = null;
  energy = 1;
  reducedMotion = false;
  private nodes: Particle[] = [];
  /** Spatial hash buckets, reused across passes. */
  private readonly grid = new Map<number, Particle[]>();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  add(body: Body) {
    this.bodies.push(body);
    this.nodes.push(...body.nodes);
    this.energy = 1;
  }

  /** Removes a letter at once, without the shrink-away animation. */
  drop(body: Body) {
    this.bodies = this.bodies.filter((b) => b !== body);
    this.nodes = this.nodes.filter((n) => n.body !== body);
    if (this.drag?.body === body) this.drag = null;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.energy = 1;
  }

  /** Moves every letter's layout target; contacts still apply on the way, so they bump into place. */
  place(body: Body, x: number, y: number, scale: number) {
    body.anchor = { x, y, ticks: 240 };
    body.layout.target = scale;
    this.energy = 1;
  }

  hit(x: number, y: number) {
    const ordered = [...this.bodies].sort((a, b) => b.z - a.z);
    return ordered.find((b) => !b.leaving && b.hitTest(x, y)) ?? null;
  }

  grab(body: Body, x: number, y: number) {
    let node = body.nodes[0];
    for (const n of body.nodes)
      if (Math.hypot(n.x - x, n.y - y) < Math.hypot(node.x - x, node.y - y))
        node = n;
    this.drag = {
      body,
      node,
      x,
      y,
      dx: node.x - x,
      dy: node.y - y,
      chain: body.chain(node),
    };
    // A letter you move stays where you leave it.
    body.anchor = null;
    this.energy = 1;
  }

  release() {
    this.drag = null;
  }

  get busy() {
    return this.bodies.some(
      (b) =>
        b.puff ||
        b.anchor ||
        Math.abs(b.layout.target - b.layout.value) > 0.001 ||
        Math.abs(b.layout.v) > 0.01,
    );
  }

  sleep() {
    for (const n of this.nodes) n.vx = n.vy = 0;
    this.energy = 0;
  }

  private followAnchors() {
    for (const b of this.bodies) {
      const a = b.anchor;
      if (!a || b === this.drag?.body) continue;
      if (--a.ticks <= 0) {
        b.anchor = null;
        continue;
      }
      const pull = 0.05 * Math.min(1, a.ticks / 60);
      // The slot is where the ink's centre goes; the particles' centroid sits off it for lopsided letters.
      let mx = 0;
      let my = 0;
      for (const n of b.nodes) {
        mx += n.ox;
        my += n.oy;
      }
      mx /= b.nodes.length || 1;
      my /= b.nodes.length || 1;
      for (const n of b.nodes) {
        n.vx += (a.x + mx - b.cx) * pull;
        n.vy += (a.y + my - b.cy) * pull;
      }
    }
  }

  private confine(n: Particle) {
    n.x = Math.max(n.r + 3, Math.min(this.width - n.r - 3, n.x));
    n.y = Math.max(n.r + 3, Math.min(this.height - n.r - 3, n.y));
  }

  private solve() {
    for (const b of this.bodies) {
      for (const l of b.links) {
        const dx = l.b.x - l.a.x;
        const dy = l.b.y - l.a.y;
        const d = Math.hypot(dx, dy) || 1;
        const k = ((d - l.length) / d) * 0.24;
        l.a.x += dx * k;
        l.a.y += dy * k;
        l.b.x -= dx * k;
        l.b.y -= dy * k;
      }
      // Bending: each particle's offset from its neighbours' midpoint returns to its rest offset,
      // turned with the letter so a rotated letter keeps its curves.
      for (const path of b.paths) {
        const nodes = path.nodes;
        if (nodes.length < 3) continue;
        const start = path.closed ? 0 : 1;
        const end = path.closed ? nodes.length : nodes.length - 1;
        for (let i = start; i < end; i++) {
          const n = nodes[i];
          const a = nodes[(i - 1 + nodes.length) % nodes.length];
          const c = nodes[(i + 1) % nodes.length];
          const rest = b.turned(
            n.ox - (a.ox + c.ox) / 2,
            n.oy - (a.oy + c.oy) / 2,
          );
          const dx = ((a.x + c.x) / 2 - n.x + rest.x) * 0.18;
          const dy = ((a.y + c.y) / 2 - n.y + rest.y) * 0.18;
          n.x += dx;
          n.y += dy;
          a.x -= dx / 2;
          a.y -= dy / 2;
          c.x -= dx / 2;
          c.y -= dy / 2;
        }
      }
    }
    // Contacts through a spatial hash. Letters keep a 1.8 px gap, so they press but never fuse.
    let largest = 8;
    for (const n of this.nodes) largest = Math.max(largest, n.r);
    const cell = largest * 2 + 3;
    const grid = this.grid;
    for (const bucket of grid.values()) bucket.length = 0;
    for (const a of this.nodes) {
      const gx = Math.floor(a.x / cell);
      const gy = Math.floor(a.y / cell);
      for (let x = gx - 1; x <= gx + 1; x++) {
        for (let y = gy - 1; y <= gy + 1; y++) {
          const bucket = grid.get(x * 65536 + y);
          if (!bucket) continue;
          for (const b of bucket) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const reach = a.r + b.r + 1.8;
            const d2 = dx * dx + dy * dy;
            if (d2 >= reach * reach) continue;
            if (a.body === b.body) {
              if (
                a.body.calm.has(
                  Math.min(a.index, b.index) * 4096 +
                    Math.max(a.index, b.index),
                )
              )
                continue;
            } else if (a.body.ghost || b.body.ghost) continue;
            const d = Math.sqrt(d2) || 0.001;
            // Deep overlaps (a letter growing into a full slot) resolve over a few ticks instead of
            // in one shove, which would fling thin strokes through each other.
            const push = Math.min((reach - d) * 0.5, Math.min(a.r, b.r) * 0.35);
            const k = push / d;
            a.x += dx * k;
            a.y += dy * k;
            b.x -= dx * k;
            b.y -= dy * k;
          }
        }
      }
      const key = gx * 65536 + gy;
      const bucket = grid.get(key);
      if (bucket) bucket.push(a);
      else grid.set(key, [a]);
    }
    for (const n of this.nodes) this.confine(n);
  }

  /**
   * Strain limiting. A fast throw moves the held particle up to 60 px a tick, far faster
   * than soft links can follow, and the letter tears into a noodle. The held letter is
   * pulled along behind its held particle so no link passes STRETCH; every other link is
   * held between SQUASH and STRETCH. Ordinary squish never reaches these limits.
   */
  private limitStrain() {
    const drag = this.drag;
    if (drag) {
      for (const l of drag.chain) {
        const dx = l.b.x - l.a.x;
        const dy = l.b.y - l.a.y;
        const d = Math.hypot(dx, dy);
        const most = l.length * STRETCH;
        if (d <= most) continue;
        l.b.x = l.a.x + (dx / d) * most;
        l.b.y = l.a.y + (dy / d) * most;
      }
    }
    for (const b of this.bodies) {
      for (const l of b.links) {
        const dx = l.b.x - l.a.x;
        const dy = l.b.y - l.a.y;
        const d = Math.hypot(dx, dy) || 0.001;
        const goal = Math.max(
          l.length * SQUASH,
          Math.min(l.length * STRETCH, d),
        );
        if (goal === d) continue;
        const k = (d - goal) / d / 2;
        const heldA = l.a === drag?.node;
        const heldB = l.b === drag?.node;
        // The held particle stays on the pointer; its partner takes the whole correction.
        const ka = heldA ? 0 : heldB ? 2 * k : k;
        const kb = heldB ? 0 : heldA ? 2 * k : k;
        l.a.x += dx * ka;
        l.a.y += dy * ka;
        l.b.x -= dx * kb;
        l.b.y -= dy * kb;
      }
    }
  }

  /**
   * Letters still growing in hold their shape exactly. And a letter left badly stretched
   * for a while (its strokes knotted through each other in a pile-up) eases back to its
   * rest shape; the shape spring alone cannot undo a knot, since contacts hold it shut.
   */
  private untangle() {
    for (const b of this.bodies) {
      if (b.forming) {
        b.restore(1);
        continue;
      }
      if (b === this.drag?.body) {
        b.strained = 0;
        continue;
      }
      if (b.mending > 0) {
        b.mending--;
        b.restore(0.2);
        continue;
      }
      b.strained = b.strain() > 0.3 ? b.strained + 1 : 0;
      if (b.strained > 45) {
        b.strained = 0;
        b.mending = 20;
      }
    }
  }

  step() {
    let changing = false;
    for (const b of this.bodies) if (b.followScale()) changing = true;
    for (const b of this.bodies) b.ghost = b.forming;
    for (const b of this.bodies.filter((body) => body.gone)) this.drop(b);
    this.followAnchors();
    const nodes = this.nodes;
    const old = nodes.map((n) => [n.x, n.y]);
    // Shape spring: a letter can go anywhere but always swings back upright (see Body.fit).
    for (const b of this.bodies) {
      b.fit();
      for (const n of b.nodes) {
        const t = b.target(n);
        n.vx += (t.x - n.x) * 0.024;
        n.vy += (t.y - n.y) * 0.024;
      }
    }
    // This tick's motion: momentum plus the drag. The held particle tracks the pointer and the
    // rest of its letter is carried partway, so it feels light rather than towed by one point.
    const move = nodes.map((n) => [n.vx, n.vy]);
    let held: {
      n: Particle;
      x0: number;
      y0: number;
      x: number;
      y: number;
    } | null = null;
    const drag = this.drag;
    if (drag) {
      const n = drag.node;
      const mx = Math.max(-60, Math.min(60, drag.x + drag.dx - n.x));
      const my = Math.max(-60, Math.min(60, drag.y + drag.dy - n.y));
      nodes.forEach((m, i) => {
        if (m.body !== drag.body) return;
        move[i][0] += mx * 0.2;
        move[i][1] += my * 0.2;
      });
      held = { n, x0: n.x, y0: n.y, x: n.x + mx, y: n.y + my };
    }
    // Fast motion is split into substeps no longer than half the thinnest pen, with contacts
    // between them, so strokes cannot tunnel through each other and interlock.
    let far = 0;
    let thin = Infinity;
    for (const n of nodes) thin = Math.min(thin, n.r);
    for (const [x, y] of move) far = Math.max(far, Math.hypot(x, y));
    if (held)
      far = Math.max(far, Math.hypot(held.x - held.x0, held.y - held.y0));
    const steps = Math.max(
      1,
      Math.min(8, Math.ceil(far / (Math.max(thin, 1) * 0.5))),
    );
    const passes = Math.ceil(6 / steps);
    for (let s = 1; s <= steps; s++) {
      nodes.forEach((n, i) => {
        n.x += move[i][0] / steps;
        n.y += move[i][1] / steps;
      });
      for (let p = 0; p < passes; p++) {
        this.solve();
        if (held) {
          const t = s / steps;
          held.n.x = held.x0 + (held.x - held.x0) * t;
          held.n.y = held.y0 + (held.y - held.y0) * t;
          this.confine(held.n);
        }
      }
      this.limitStrain();
      for (const n of nodes) this.confine(n);
    }
    this.untangle();
    const damping = this.reducedMotion ? 0.7 : 0.94;
    let e = 0;
    nodes.forEach((n, i) => {
      n.vx = Math.max(-30, Math.min(30, (n.x - old[i][0]) * damping));
      n.vy = Math.max(-30, Math.min(30, (n.y - old[i][1]) * damping));
      e += n.vx * n.vx + n.vy * n.vy;
    });
    this.energy = Math.sqrt(e / (nodes.length || 1));
    for (const b of this.bodies) b.update();
    return changing;
  }
}

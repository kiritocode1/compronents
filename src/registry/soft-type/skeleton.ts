/**
 * Turns one grapheme into a centreline skeleton that the soft-type engine can bend.
 *
 * The grapheme is drawn in a heavy rounded font. A rounded heavy letter is very
 * nearly a centreline swept by a round pen, so the medial axis of its mask is the
 * pen path and the distance transform along that axis is the pen radius. That
 * holds for any glyph the browser can draw, so no per-letter data ships.
 *
 * Output is in em units: x grows right from the pen origin, y grows down from
 * the baseline (canvas convention).
 */

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  closed: boolean;
  /** Pen radius for this stroke, em. Strokes keep the weight the font gave them. */
  radius: number;
}

/** A stroke in raster pixels, before it has a radius. */
interface RawStroke {
  points: Point[];
  closed: boolean;
}

export interface GlyphSkeleton {
  grapheme: string;
  strokes: Stroke[];
  /** Typical pen radius across strokes (median), em. */
  radius: number;
  /** Advance width from the font, em. */
  advance: number;
  /** Bounds of the drawn tube (skeleton grown by the radius), em. */
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  /** Ink area of the rasterised glyph, em². */
  area: number;
}

export interface SkeletonOptions {
  /** CSS font-family list. */
  family: string;
  /** CSS font weight used for rasterising. */
  weight: number;
  /** Raster size in px per em. Higher is cleaner and slower. */
  resolution?: number;
}

const PAD = 4;

let scratch: {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} | null = null;

function scratchContext() {
  if (!scratch) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("soft-type: 2D canvas unavailable");
    scratch = { canvas, ctx };
  }
  return scratch;
}

interface Raster {
  mask: Uint8Array;
  w: number;
  h: number;
  originX: number;
  originY: number;
  advance: number;
}

function rasterise(grapheme: string, font: string, resolution: number): Raster {
  const { canvas, ctx } = scratchContext();
  ctx.font = font;
  const m = ctx.measureText(grapheme);
  const left = Math.ceil(Math.max(0, m.actualBoundingBoxLeft));
  const right = Math.ceil(Math.max(0, m.actualBoundingBoxRight));
  const ascent = Math.ceil(Math.max(0, m.actualBoundingBoxAscent));
  const descent = Math.ceil(Math.max(0, m.actualBoundingBoxDescent));
  const w = Math.max(1, left + right) + PAD * 2;
  const h = Math.max(1, ascent + descent) + PAD * 2;
  canvas.width = w;
  canvas.height = h;
  // Resizing resets context state.
  ctx.font = font;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  ctx.fillText(grapheme, PAD + left, PAD + ascent);
  const data = ctx.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let i = 0; i < mask.length; i++)
    mask[i] = data[i * 4 + 3] >= 128 ? 1 : 0;
  return {
    mask,
    w,
    h,
    originX: PAD + left,
    originY: PAD + ascent,
    advance: m.width / resolution,
  };
}

/** Exact Euclidean distance from each ink pixel to the nearest background pixel. */
function distanceTransform(
  mask: Uint8Array,
  w: number,
  h: number,
): Float32Array {
  const INF = 1e20;
  const grid = new Float64Array(w * h);
  for (let i = 0; i < grid.length; i++) grid[i] = mask[i] ? INF : 0;
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  // Felzenszwalb and Huttenlocher's 1D squared transform, run on columns then rows.
  const pass = (len: number) => {
    let k = 0;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    for (let q = 1; q < len; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < len; q++) {
      while (z[k + 1] < q) k++;
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
  };
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x];
    pass(h);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x];
    pass(w);
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x];
  }
  const out = new Float32Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = Math.sqrt(grid[i]);
  return out;
}

// Neighbour offsets in ring order: N, NE, E, SE, S, SW, W, NW.
const DX = [0, 1, 1, 1, 0, -1, -1, -1];
const DY = [-1, -1, 0, 1, 1, 1, 0, -1];

/** Zhang-Suen thinning, in place. */
function thin(img: Uint8Array, w: number, h: number) {
  const remove: number[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let step = 0; step < 2; step++) {
      remove.length = 0;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (!img[i]) continue;
          const p = DX.map((dx, k) => img[(y + DY[k]) * w + x + dx]);
          const b = p.reduce((s, v) => s + v, 0);
          if (b < 2 || b > 6) continue;
          let a = 0;
          for (let k = 0; k < 8; k++) if (!p[k] && p[(k + 1) % 8]) a++;
          if (a !== 1) continue;
          // p[0]=N p[2]=E p[4]=S p[6]=W
          if (
            step === 0
              ? p[0] * p[2] * p[4] || p[2] * p[4] * p[6]
              : p[0] * p[2] * p[6] || p[0] * p[4] * p[6]
          )
            continue;
          remove.push(i);
        }
      }
      for (const i of remove) img[i] = 0;
      if (remove.length) changed = true;
    }
  }
}

function ringNeighbours(img: Uint8Array, w: number, i: number) {
  const x = i % w;
  const y = (i - x) / w;
  const out: number[] = [];
  for (let k = 0; k < 8; k++) if (img[(y + DY[k]) * w + x + DX[k]]) out.push(k);
  return out;
}

/**
 * Zhang-Suen leaves staircases two pixels thick on diagonals, which read as fake
 * junctions. Remove any pixel whose neighbours stay connected without it, as long
 * as it is not a line end.
 */
function removeStaircases(img: Uint8Array, w: number, h: number) {
  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (!img[i]) continue;
        const ring = ringNeighbours(img, w, i);
        if (ring.length < 2) continue;
        // Count 8-connected groups among the neighbours themselves.
        const seen = new Set<number>();
        let groups = 0;
        for (const start of ring) {
          if (seen.has(start)) continue;
          groups++;
          const stack = [start];
          seen.add(start);
          while (stack.length) {
            const k = stack.pop() as number;
            for (const j of ring) {
              if (seen.has(j)) continue;
              if (
                Math.abs(DX[k] - DX[j]) <= 1 &&
                Math.abs(DY[k] - DY[j]) <= 1
              ) {
                seen.add(j);
                stack.push(j);
              }
            }
          }
        }
        if (groups === 1) {
          img[i] = 0;
          changed = true;
        }
      }
    }
  }
}

/**
 * Zhang-Suen deletes a 2x2 block outright, so a round dot (period, colon, the
 * dot of "!") can thin to nothing. Any ink blob left without a skeleton pixel
 * gets one at its deepest point, which is the dot's centre.
 */
function keepDots(
  mask: Uint8Array,
  img: Uint8Array,
  dist: Float32Array,
  w: number,
  h: number,
) {
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    let deepest = start;
    let hasSkeleton = false;
    seen[start] = 1;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop() as number;
      if (img[i]) hasSkeleton = true;
      if (dist[i] > dist[deepest]) deepest = i;
      const x = i % w;
      const y = (i - x) / w;
      for (let k = 0; k < 8; k++) {
        const nx = x + DX[k];
        const ny = y + DY[k];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (mask[j] && !seen[j]) {
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
    if (!hasSkeleton) img[deepest] = 1;
  }
}

interface GraphNode {
  id: number;
  x: number;
  y: number;
  /** Distance transform at the node, px. */
  r: number;
  edges: number[];
}

interface GraphEdge {
  id: number;
  a: number;
  b: number;
  points: Point[];
  alive: boolean;
}

function polylineLength(points: Point[]) {
  let length = 0;
  for (let i = 1; i < points.length; i++)
    length += Math.hypot(
      points[i].x - points[i - 1].x,
      points[i].y - points[i - 1].y,
    );
  return length;
}

/** Traces the 1px skeleton into nodes (ends, junctions) and edges between them, plus closed loops. */
function traceGraph(img: Uint8Array, dist: Float32Array, w: number, h: number) {
  const degree = new Uint8Array(w * h);
  const pixels: number[] = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (!img[i]) continue;
      pixels.push(i);
      degree[i] = ringNeighbours(img, w, i).length;
    }
  }
  const nodeOf = new Int32Array(w * h).fill(-1);
  const nodes: GraphNode[] = [];
  // Junction pixels that touch merge into one node; every end pixel is its own node.
  for (const i of pixels) {
    if (degree[i] === 2 || nodeOf[i] >= 0) continue;
    const id = nodes.length;
    const members = [i];
    nodeOf[i] = id;
    if (degree[i] >= 3) {
      for (let m = 0; m < members.length; m++) {
        const j = members[m];
        const jx = j % w;
        const jy = (j - jx) / w;
        for (let k = 0; k < 8; k++) {
          const q = (jy + DY[k]) * w + jx + DX[k];
          if (img[q] && degree[q] >= 3 && nodeOf[q] < 0) {
            nodeOf[q] = id;
            members.push(q);
          }
        }
      }
    }
    let sx = 0;
    let sy = 0;
    let sr = 0;
    for (const j of members) {
      sx += (j % w) + 0.5;
      sy += Math.floor(j / w) + 0.5;
      sr = Math.max(sr, dist[j]);
    }
    nodes.push({
      id,
      x: sx / members.length,
      y: sy / members.length,
      r: sr,
      edges: [],
    });
  }

  const edges: GraphEdge[] = [];
  const visited = new Uint8Array(w * h);
  const center = (i: number): Point => ({
    x: (i % w) + 0.5,
    y: Math.floor(i / w) + 0.5,
  });
  const addEdge = (a: number, b: number, points: Point[]) => {
    const edge: GraphEdge = { id: edges.length, a, b, points, alive: true };
    edges.push(edge);
    nodes[a].edges.push(edge.id);
    nodes[b].edges.push(edge.id);
  };
  const directPairs = new Set<string>();

  for (const p of pixels) {
    const from = nodeOf[p];
    if (from < 0) continue;
    const px = p % w;
    const py = (p - px) / w;
    for (let k = 0; k < 8; k++) {
      const q = (py + DY[k]) * w + px + DX[k];
      if (!img[q] || nodeOf[q] === from) continue;
      if (nodeOf[q] >= 0) {
        const key =
          from < nodeOf[q] ? `${from}:${nodeOf[q]}` : `${nodeOf[q]}:${from}`;
        if (directPairs.has(key)) continue;
        directPairs.add(key);
        addEdge(from, nodeOf[q], [
          { x: nodes[from].x, y: nodes[from].y },
          { x: nodes[nodeOf[q]].x, y: nodes[nodeOf[q]].y },
        ]);
        continue;
      }
      if (visited[q]) continue;
      const points: Point[] = [
        { x: nodes[from].x, y: nodes[from].y },
        center(q),
      ];
      visited[q] = 1;
      let prev = p;
      let cur = q;
      let to = -1;
      for (;;) {
        const cx = cur % w;
        const cy = (cur - cx) / w;
        let next = -1;
        for (let j = 0; j < 8; j++) {
          const r = (cy + DY[j]) * w + cx + DX[j];
          if (!img[r] || r === prev) continue;
          if (nodeOf[r] >= 0 && nodeOf[r] !== from) {
            next = r;
            break;
          }
          // Back into the start node: a loop such as P's bowl. `prev` already rules out stepping straight back.
          if (nodeOf[r] === from) {
            next = r;
            break;
          }
          if (nodeOf[r] < 0 && !visited[r]) next = r;
        }
        if (next < 0) break;
        if (nodeOf[next] >= 0) {
          to = nodeOf[next];
          break;
        }
        visited[next] = 1;
        points.push(center(next));
        prev = cur;
        cur = next;
      }
      if (to < 0) continue;
      points.push({ x: nodes[to].x, y: nodes[to].y });
      addEdge(from, to, points);
    }
  }

  // Whatever is left is a loop with no ends or junctions (O, 0, D's bowl closed on itself).
  const loops: Point[][] = [];
  for (const p of pixels) {
    if (nodeOf[p] >= 0 || visited[p]) continue;
    const loop: Point[] = [center(p)];
    visited[p] = 1;
    let prev = -1;
    let cur = p;
    for (;;) {
      const cx = cur % w;
      const cy = (cur - cx) / w;
      let next = -1;
      for (let j = 0; j < 8; j++) {
        const r = (cy + DY[j]) * w + cx + DX[j];
        if (img[r] && r !== prev && !visited[r]) {
          next = r;
          break;
        }
      }
      if (next < 0) break;
      visited[next] = 1;
      loop.push(center(next));
      prev = cur;
      cur = next;
    }
    if (loop.length >= 4) loops.push(loop);
  }
  return { nodes, edges, loops };
}

function liveDegree(node: GraphNode, edges: GraphEdge[]) {
  let n = 0;
  for (const e of node.edges)
    if (edges[e].alive) n += edges[e].a === edges[e].b ? 2 : 1;
  return n;
}

/** Joins two edges that meet at a node of degree 2 into one. */
function mergeThrough(node: GraphNode, nodes: GraphNode[], edges: GraphEdge[]) {
  const live = node.edges.filter((e) => edges[e].alive);
  if (live.length !== 2) return false;
  const [e1, e2] = live.map((e) => edges[e]);
  if (e1 === e2) return false;
  const p1 = e1.b === node.id ? e1.points : [...e1.points].reverse();
  const p2 = e2.a === node.id ? e2.points : [...e2.points].reverse();
  const start = e1.b === node.id ? e1.a : e1.b;
  const end = e2.a === node.id ? e2.b : e2.a;
  e1.points = [...p1, ...p2.slice(1)];
  e1.a = start;
  e1.b = end;
  e2.alive = false;
  if (!nodes[end].edges.includes(e1.id)) nodes[end].edges.push(e1.id);
  return true;
}

/**
 * Removes spurs: medial axes grow little branches into square corners and serifs.
 * Length alone cannot tell those from a short real arm (the crossbar of f or t
 * is about one pen radius long). Depth can: a real stroke ends at the centre of
 * its round cap, a pen radius inside the ink, while a spur runs out to the edge.
 */
function prune(nodes: GraphNode[], edges: GraphEdge[]) {
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of edges) {
      if (!e.alive) continue;
      // A loop too small to hold a counter is a junction artefact.
      if (e.a === e.b) {
        if (polylineLength(e.points) < nodes[e.a].r * 2.5) {
          e.alive = false;
          changed = true;
        }
        continue;
      }
      const da = liveDegree(nodes[e.a], edges);
      const db = liveDegree(nodes[e.b], edges);
      const end = da === 1 ? e.a : db === 1 ? e.b : -1;
      const junction = end === e.a ? e.b : e.a;
      if (end < 0 || liveDegree(nodes[junction], edges) < 3) continue;
      const length = polylineLength(e.points);
      const reach = nodes[junction].r;
      const shallow = nodes[end].r < reach * 0.45;
      if (length < reach * 0.35 || (shallow && length < reach * 1.1)) {
        e.alive = false;
        changed = true;
      }
    }
    for (const node of nodes)
      if (liveDegree(node, edges) === 2 && mergeThrough(node, nodes, edges))
        changed = true;
  }
}

function directionAt(
  points: Point[],
  fromStart: boolean,
  reach: number,
): Point {
  const list = fromStart ? points : [...points].reverse();
  const origin = list[0];
  let travelled = 0;
  let target = list[list.length - 1];
  for (let i = 1; i < list.length; i++) {
    travelled += Math.hypot(
      list[i].x - list[i - 1].x,
      list[i].y - list[i - 1].y,
    );
    if (travelled >= reach) {
      target = list[i];
      break;
    }
  }
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: dx / l, y: dy / l };
}

/**
 * Chains edges into strokes, continuing straight through junctions where two
 * branches line up, so a stem stays one bendable stroke instead of two pieces
 * hinged at the crossbar.
 */
function chainStrokes(nodes: GraphNode[], edges: GraphEdge[]): RawStroke[] {
  const live = edges.filter((e) => e.alive);
  // An edge end is (edge, 0 = start/a, 1 = end/b).
  const partner = new Map<string, [number, 0 | 1]>();
  for (const node of nodes) {
    const ends: { edge: number; side: 0 | 1; dir: Point }[] = [];
    for (const id of node.edges) {
      const e = edges[id];
      if (!e.alive) continue;
      const reach = Math.max(4, node.r * 2);
      if (e.a === node.id)
        ends.push({
          edge: id,
          side: 0,
          dir: directionAt(e.points, true, reach),
        });
      if (e.b === node.id)
        ends.push({
          edge: id,
          side: 1,
          dir: directionAt(e.points, false, reach),
        });
    }
    if (ends.length < 3) continue;
    const pairs: { i: number; j: number; straight: number }[] = [];
    for (let i = 0; i < ends.length; i++) {
      for (let j = i + 1; j < ends.length; j++) {
        if (ends[i].edge === ends[j].edge) continue;
        const straight = -(
          ends[i].dir.x * ends[j].dir.x +
          ends[i].dir.y * ends[j].dir.y
        );
        if (straight > Math.cos((50 * Math.PI) / 180))
          pairs.push({ i, j, straight });
      }
    }
    pairs.sort((p, q) => q.straight - p.straight);
    const used = new Set<number>();
    for (const { i, j } of pairs) {
      if (used.has(i) || used.has(j)) continue;
      used.add(i);
      used.add(j);
      partner.set(`${ends[i].edge}:${ends[i].side}`, [
        ends[j].edge,
        ends[j].side,
      ]);
      partner.set(`${ends[j].edge}:${ends[j].side}`, [
        ends[i].edge,
        ends[i].side,
      ]);
    }
  }
  // Degree-2 nodes left after pruning are already merged; degree-1 and unpaired ends stop a chain.
  const done = new Set<number>();
  const strokes: RawStroke[] = [];
  const walk = (startEdge: number, startSide: 0 | 1) => {
    const points: Point[] = [];
    let edge = startEdge;
    let side = startSide;
    let closed = false;
    for (;;) {
      done.add(edge);
      const e = edges[edge];
      const seg = side === 0 ? e.points : [...e.points].reverse();
      points.push(...(points.length ? seg.slice(1) : seg));
      const next = partner.get(`${edge}:${side === 0 ? 1 : 0}`);
      if (!next) break;
      if (next[0] === startEdge && next[1] === startSide) {
        closed = true;
        break;
      }
      if (done.has(next[0])) break;
      edge = next[0];
      side = next[1];
    }
    if (closed) points.pop();
    strokes.push({ points, closed });
  };
  for (const e of live) {
    if (done.has(e.id)) continue;
    if (!partner.has(`${e.id}:0`)) walk(e.id, 0);
    else if (!partner.has(`${e.id}:1`)) walk(e.id, 1);
  }
  // Edges paired at both ends form closed chains.
  for (const e of live) if (!done.has(e.id)) walk(e.id, 0);
  for (const stroke of strokes) {
    if (stroke.closed) continue;
    const first = stroke.points[0];
    const last = stroke.points[stroke.points.length - 1];
    // A self-loop edge (8's bowls, e's eye) comes back to its own start.
    if (
      stroke.points.length > 3 &&
      Math.hypot(first.x - last.x, first.y - last.y) < 1.5
    ) {
      stroke.points.pop();
      stroke.closed = true;
    }
  }
  return strokes;
}

/** Light Laplacian smoothing that keeps open ends fixed, then resampling to an even spacing. */
function smooth(
  stroke: RawStroke,
  iterations: number,
  spacing: number,
): RawStroke {
  let pts = stroke.points.map((p) => ({ ...p }));
  const n = pts.length;
  if (n > 2) {
    for (let it = 0; it < iterations; it++) {
      const next = pts.map((p) => ({ ...p }));
      for (let i = 0; i < n; i++) {
        if (!stroke.closed && (i === 0 || i === n - 1)) continue;
        const a = pts[(i - 1 + n) % n];
        const b = pts[(i + 1) % n];
        next[i] = {
          x: pts[i].x * 0.5 + (a.x + b.x) * 0.25,
          y: pts[i].y * 0.5 + (a.y + b.y) * 0.25,
        };
      }
      pts = next;
    }
  }
  const loop = stroke.closed ? [...pts, pts[0]] : pts;
  const total = polylineLength(loop);
  if (total < spacing)
    return {
      points: stroke.closed ? pts : [pts[0], pts[pts.length - 1]],
      closed: stroke.closed,
    };
  const count = Math.max(stroke.closed ? 6 : 2, Math.round(total / spacing));
  const out: Point[] = [];
  let seg = 1;
  let walked = 0;
  for (let i = 0; i <= count; i++) {
    if (stroke.closed && i === count) break;
    const target = (total * i) / count;
    while (
      seg < loop.length - 1 &&
      walked +
        Math.hypot(
          loop[seg].x - loop[seg - 1].x,
          loop[seg].y - loop[seg - 1].y,
        ) <
        target
    ) {
      walked += Math.hypot(
        loop[seg].x - loop[seg - 1].x,
        loop[seg].y - loop[seg - 1].y,
      );
      seg++;
    }
    const a = loop[seg - 1];
    const b = loop[seg];
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const t = Math.min(1, Math.max(0, (target - walked) / l));
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return { points: out, closed: stroke.closed };
}

const cache = new Map<string, GlyphSkeleton>();

/** Skeleton for one grapheme. Results are cached per grapheme and font. */
export function skeletonise(
  grapheme: string,
  options: SkeletonOptions,
): GlyphSkeleton {
  const resolution = options.resolution ?? 160;
  const font = `${options.weight} ${resolution}px ${options.family}`;
  const key = `${font}\u0000${grapheme}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const raster = rasterise(grapheme, font, resolution);
  const { mask, w, h } = raster;
  const dist = distanceTransform(mask, w, h);
  const img = mask.slice();
  thin(img, w, h);
  removeStaircases(img, w, h);
  keepDots(mask, img, dist, w, h);

  let area = 0;
  for (let i = 0; i < mask.length; i++) area += mask[i];

  const { nodes, edges, loops } = traceGraph(img, dist, w, h);
  prune(nodes, edges);
  const strokes = chainStrokes(nodes, edges);
  for (const loop of loops) strokes.push({ points: loop, closed: true });
  // Nodes with nothing attached are dots: periods, the i's tittle, a colon.
  for (const node of nodes)
    if (!node.edges.length)
      strokes.push({ points: [{ x: node.x, y: node.y }], closed: false });

  // Pen radius per stroke: median of the distance transform along it, so an
  // accent or a copyright ring keeps its own thinner weight.
  const depthAt = (p: Point) =>
    dist[
      Math.min(h - 1, Math.floor(p.y)) * w + Math.min(w - 1, Math.floor(p.x))
    ];
  const median = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  const strokeRadii = strokes.map((s) =>
    Math.max(1, median(s.points.map(depthAt))),
  );
  const radiusPx = strokeRadii.length ? median(strokeRadii) : resolution * 0.08;
  const smoothed = strokes.map((s, i) =>
    s.points.length > 1 ? smooth(s, 3, Math.max(2, strokeRadii[i] * 0.25)) : s,
  );

  const toEm = (p: Point): Point => ({
    x: (p.x - raster.originX) / resolution,
    y: (p.y - raster.originY) / resolution,
  });
  const emStrokes: Stroke[] = smoothed.map((s, i) => ({
    closed: s.closed,
    radius: strokeRadii[i] / resolution,
    points: s.points.map(toEm),
  }));
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const s of emStrokes) {
    for (const p of s.points) {
      minX = Math.min(minX, p.x - s.radius);
      maxX = Math.max(maxX, p.x + s.radius);
      minY = Math.min(minY, p.y - s.radius);
      maxY = Math.max(maxY, p.y + s.radius);
    }
  }
  if (!emStrokes.length) {
    minX = 0;
    maxX = raster.advance;
    minY = -0.7;
    maxY = 0;
  }
  const result: GlyphSkeleton = {
    grapheme,
    strokes: emStrokes,
    radius: radiusPx / resolution,
    advance: raster.advance,
    bounds: { minX, maxX, minY, maxY },
    area: area / (resolution * resolution),
  };
  cache.set(key, result);
  return result;
}

const weighed = new Map<string, GlyphSkeleton>();

interface Frame {
  w: number;
  h: number;
  ox: number;
  oy: number;
  scale: number;
}

/** Ink mask of the tube glyph drawn at `k` times its pen, in a fixed frame. */
function inkAt(skeleton: GlyphSkeleton, k: number, f: Frame) {
  const { canvas, ctx } = scratchContext();
  canvas.width = f.w;
  canvas.height = f.h;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#fff";
  for (const stroke of skeleton.strokes) {
    ctx.lineWidth = stroke.radius * 2 * k * f.scale;
    ctx.beginPath();
    stroke.points.forEach((p, i) => {
      const x = (p.x + f.ox) * f.scale;
      const y = (p.y + f.oy) * f.scale;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    if (stroke.points.length === 1)
      ctx.lineTo(
        (stroke.points[0].x + f.ox) * f.scale + 0.01,
        (stroke.points[0].y + f.oy) * f.scale,
      );
    if (stroke.closed) ctx.closePath();
    ctx.stroke();
  }
  const data = ctx.getImageData(0, 0, f.w, f.h).data;
  const ink = new Uint8Array(f.w * f.h);
  for (let i = 0; i < ink.length; i++) ink[i] = data[i * 4 + 3] >= 128 ? 1 : 0;
  return ink;
}

/** Labels 4-connected regions where `open` is set; returns labels (0 = none) and whether each touches the frame edge. */
function regions(open: Uint8Array, w: number, h: number) {
  const label = new Int32Array(w * h);
  const edge: boolean[] = [false];
  const area: number[] = [0];
  const stack: number[] = [];
  for (let start = 0; start < open.length; start++) {
    if (!open[start] || label[start]) continue;
    const id = edge.length;
    edge.push(false);
    area.push(0);
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop() as number;
      const x = i % w;
      const y = (i - x) / w;
      area[id]++;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge[id] = true;
      const visit = (j: number) => {
        if (!open[j] || label[j]) return;
        label[j] = id;
        stack.push(j);
      };
      if (x > 0) visit(i - 1);
      if (x < w - 1) visit(i + 1);
      if (y > 0) visit(i - w);
      if (y < h - 1) visit(i + w);
    }
  }
  return { label, edge, area };
}

/** Pixels inside the convex hull of the ink. */
function hullOf(ink: Uint8Array, w: number, h: number) {
  const pts: [number, number][] = [];
  for (let y = 0; y < h; y++) {
    let first = -1;
    let last = -1;
    for (let x = 0; x < w; x++) {
      if (!ink[y * w + x]) continue;
      if (first < 0) first = x;
      last = x;
    }
    if (first >= 0) pts.push([first, y], [last, y]);
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (
    o: [number, number],
    a: [number, number],
    b: [number, number],
  ) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    )
      lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    )
      upper.pop();
    upper.push(p);
  }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  const inside = new Uint8Array(w * h);
  if (hull.length < 3) return inside;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let ok = true;
      for (let i = 0; i < hull.length && ok; i++)
        if (cross(hull[i], hull[(i + 1) % hull.length], [x, y]) < 0) ok = false;
      inside[y * w + x] = ok ? 1 : 0;
    }
  }
  return inside;
}

/**
 * Fattens a glyph's pen toward `target` times the font's own, as bold as it can
 * go with counters still open: no counter may close or lose more than half its
 * area, and no new one may appear (that is an aperture, like the mouth of an S
 * or an e, sealing shut). Never thinner than the font.
 */
export function weigh(
  skeleton: GlyphSkeleton,
  target: number,
  minPen = 0,
): GlyphSkeleton {
  // A thin fallback font (most CJK, Arabic, symbol fonts) is pushed toward a minimum pen in em.
  const weight = Math.max(
    target,
    skeleton.radius > 0 ? minPen / skeleton.radius : 1,
  );
  if (weight <= 1 || !skeleton.strokes.length) return skeleton;
  const key = `${weight}\u0000${skeleton.grapheme}\u0000${skeleton.radius}\u0000${skeleton.strokes.length}`;
  const hit = weighed.get(key);
  if (hit) return hit;
  // One fixed frame, big enough for the fattest candidate, so masks line up pixel for pixel.
  const scale = 96;
  const b = skeleton.bounds;
  const margin = (weight - 1) * skeleton.radius * 1.5 + 2 / scale;
  const frame: Frame = {
    scale,
    ox: -b.minX + margin,
    oy: -b.minY + margin,
    w: Math.ceil((b.maxX - b.minX + margin * 2) * scale),
    h: Math.ceil((b.maxY - b.minY + margin * 2) * scale),
  };
  const { w, h } = frame;
  const base = inkAt(skeleton, 1, frame);
  const hull = hullOf(base, w, h);
  // White pockets inside the outline: counters, plus the open bays of S, c, 3 or m.
  const pocket = new Uint8Array(w * h);
  for (let i = 0; i < pocket.length; i++)
    pocket[i] = hull[i] && !base[i] ? 1 : 0;
  const pockets = regions(pocket, w, h);
  const enclosed = (ink: Uint8Array) => {
    const bg = new Uint8Array(w * h);
    for (let i = 0; i < bg.length; i++) bg[i] = ink[i] ? 0 : 1;
    const r = regions(bg, w, h);
    return r.edge.filter((touches, id) => id > 0 && !touches && r.area[id] > 6)
      .length;
  };
  const holes = enclosed(base);
  const minPocket = (skeleton.radius * scale) ** 2 * 0.5;
  const open = (k: number) => {
    const ink = inkAt(skeleton, k, frame);
    // No counter may close and no aperture may seal into a new one.
    if (enclosed(ink) !== holes) return false;
    const kept = new Float64Array(pockets.area.length);
    for (let i = 0; i < ink.length; i++)
      if (pockets.label[i] && !ink[i]) kept[pockets.label[i]]++;
    for (let id = 1; id < pockets.area.length; id++) {
      if (pockets.area[id] < minPocket) continue;
      if (kept[id] < pockets.area[id] * 0.5) return false;
    }
    return true;
  };
  let k = weight;
  if (!open(weight)) {
    let lo = 1;
    let hi = weight;
    for (let i = 0; i < 6; i++) {
      const mid = (lo + hi) / 2;
      if (open(mid)) lo = mid;
      else hi = mid;
    }
    k = lo;
  }
  const strokes = skeleton.strokes.map((s) => ({ ...s, radius: s.radius * k }));
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const s of strokes) {
    for (const p of s.points) {
      minX = Math.min(minX, p.x - s.radius);
      maxX = Math.max(maxX, p.x + s.radius);
      minY = Math.min(minY, p.y - s.radius);
      maxY = Math.max(maxY, p.y + s.radius);
    }
  }
  const result: GlyphSkeleton = {
    ...skeleton,
    strokes,
    radius: skeleton.radius * k,
    bounds: { minX, maxX, minY, maxY },
  };
  weighed.set(key, result);
  return result;
}

/**
 * Emoji are pictures, not strokes, and their silhouettes skeletonise into debris.
 * Each one becomes a filled circle about cap height: a ring whose pen is a little
 * wider than the ring is round, so the tube covers the middle and still squashes.
 */
export function circle(grapheme: string): GlyphSkeleton {
  const r = 0.2;
  const ring = r * 0.8;
  const cx = r + ring;
  const cy = -(r + ring);
  const points = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return { x: cx + Math.cos(a) * ring, y: cy + Math.sin(a) * ring };
  });
  const reach = r + ring;
  return {
    grapheme,
    strokes: [{ points, closed: true, radius: r }],
    radius: r,
    advance: reach * 2 + 0.08,
    bounds: {
      minX: cx - reach,
      maxX: cx + reach,
      minY: cy - reach,
      maxY: cy + reach,
    },
    area: Math.PI * reach * reach,
  };
}

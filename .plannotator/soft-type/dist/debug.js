(() => {
  // src/skeleton.ts
  var PAD = 4;
  var scratch = null;
  function scratchContext() {
    if (!scratch) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx)
        throw new Error("soft-type: 2D canvas unavailable");
      scratch = { canvas, ctx };
    }
    return scratch;
  }
  function rasterise(grapheme, font, resolution) {
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
    ctx.font = font;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#fff";
    ctx.fillText(grapheme, PAD + left, PAD + ascent);
    const data = ctx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 0;i < mask.length; i++)
      mask[i] = data[i * 4 + 3] >= 128 ? 1 : 0;
    return { mask, w, h, originX: PAD + left, originY: PAD + ascent, advance: m.width / resolution };
  }
  function distanceTransform(mask, w, h) {
    const INF = 100000000000000000000;
    const grid = new Float64Array(w * h);
    for (let i = 0;i < grid.length; i++)
      grid[i] = mask[i] ? INF : 0;
    const n = Math.max(w, h);
    const f = new Float64Array(n);
    const d = new Float64Array(n);
    const v = new Int32Array(n);
    const z = new Float64Array(n + 1);
    const pass = (len) => {
      let k = 0;
      v[0] = 0;
      z[0] = -INF;
      z[1] = INF;
      for (let q = 1;q < len; q++) {
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
      for (let q = 0;q < len; q++) {
        while (z[k + 1] < q)
          k++;
        d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
      }
    };
    for (let x = 0;x < w; x++) {
      for (let y = 0;y < h; y++)
        f[y] = grid[y * w + x];
      pass(h);
      for (let y = 0;y < h; y++)
        grid[y * w + x] = d[y];
    }
    for (let y = 0;y < h; y++) {
      for (let x = 0;x < w; x++)
        f[x] = grid[y * w + x];
      pass(w);
      for (let x = 0;x < w; x++)
        grid[y * w + x] = d[x];
    }
    const out = new Float32Array(w * h);
    for (let i = 0;i < out.length; i++)
      out[i] = Math.sqrt(grid[i]);
    return out;
  }
  var DX = [0, 1, 1, 1, 0, -1, -1, -1];
  var DY = [-1, -1, 0, 1, 1, 1, 0, -1];
  function thin(img, w, h) {
    const remove = [];
    let changed = true;
    while (changed) {
      changed = false;
      for (let step = 0;step < 2; step++) {
        remove.length = 0;
        for (let y = 1;y < h - 1; y++) {
          for (let x = 1;x < w - 1; x++) {
            const i = y * w + x;
            if (!img[i])
              continue;
            const p = DX.map((dx, k) => img[(y + DY[k]) * w + x + dx]);
            const b = p.reduce((s, v) => s + v, 0);
            if (b < 2 || b > 6)
              continue;
            let a = 0;
            for (let k = 0;k < 8; k++)
              if (!p[k] && p[(k + 1) % 8])
                a++;
            if (a !== 1)
              continue;
            if (step === 0 ? p[0] * p[2] * p[4] || p[2] * p[4] * p[6] : p[0] * p[2] * p[6] || p[0] * p[4] * p[6])
              continue;
            remove.push(i);
          }
        }
        for (const i of remove)
          img[i] = 0;
        if (remove.length)
          changed = true;
      }
    }
  }
  function ringNeighbours(img, w, i) {
    const x = i % w;
    const y = (i - x) / w;
    const out = [];
    for (let k = 0;k < 8; k++)
      if (img[(y + DY[k]) * w + x + DX[k]])
        out.push(k);
    return out;
  }
  function removeStaircases(img, w, h) {
    let changed = true;
    while (changed) {
      changed = false;
      for (let y = 1;y < h - 1; y++) {
        for (let x = 1;x < w - 1; x++) {
          const i = y * w + x;
          if (!img[i])
            continue;
          const ring = ringNeighbours(img, w, i);
          if (ring.length < 2)
            continue;
          const seen = new Set;
          let groups = 0;
          for (const start of ring) {
            if (seen.has(start))
              continue;
            groups++;
            const stack = [start];
            seen.add(start);
            while (stack.length) {
              const k = stack.pop();
              for (const j of ring) {
                if (seen.has(j))
                  continue;
                if (Math.abs(DX[k] - DX[j]) <= 1 && Math.abs(DY[k] - DY[j]) <= 1) {
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
  function keepDots(mask, img, dist, w, h) {
    const seen = new Uint8Array(w * h);
    const stack = [];
    for (let start = 0;start < mask.length; start++) {
      if (!mask[start] || seen[start])
        continue;
      let deepest = start;
      let hasSkeleton = false;
      seen[start] = 1;
      stack.push(start);
      while (stack.length) {
        const i = stack.pop();
        if (img[i])
          hasSkeleton = true;
        if (dist[i] > dist[deepest])
          deepest = i;
        const x = i % w;
        const y = (i - x) / w;
        for (let k = 0;k < 8; k++) {
          const nx = x + DX[k];
          const ny = y + DY[k];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h)
            continue;
          const j = ny * w + nx;
          if (mask[j] && !seen[j]) {
            seen[j] = 1;
            stack.push(j);
          }
        }
      }
      if (!hasSkeleton)
        img[deepest] = 1;
    }
  }
  function polylineLength(points) {
    let length = 0;
    for (let i = 1;i < points.length; i++)
      length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    return length;
  }
  function traceGraph(img, dist, w, h) {
    const degree = new Uint8Array(w * h);
    const pixels = [];
    for (let y = 1;y < h - 1; y++) {
      for (let x = 1;x < w - 1; x++) {
        const i = y * w + x;
        if (!img[i])
          continue;
        pixels.push(i);
        degree[i] = ringNeighbours(img, w, i).length;
      }
    }
    const nodeOf = new Int32Array(w * h).fill(-1);
    const nodes = [];
    for (const i of pixels) {
      if (degree[i] === 2 || nodeOf[i] >= 0)
        continue;
      const id = nodes.length;
      const members = [i];
      nodeOf[i] = id;
      if (degree[i] >= 3) {
        for (let m = 0;m < members.length; m++) {
          const j = members[m];
          const jx = j % w;
          const jy = (j - jx) / w;
          for (let k = 0;k < 8; k++) {
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
        sx += j % w + 0.5;
        sy += Math.floor(j / w) + 0.5;
        sr = Math.max(sr, dist[j]);
      }
      nodes.push({ id, x: sx / members.length, y: sy / members.length, r: sr, edges: [] });
    }
    const edges = [];
    const visited = new Uint8Array(w * h);
    const center = (i) => ({ x: i % w + 0.5, y: Math.floor(i / w) + 0.5 });
    const addEdge = (a, b, points) => {
      const edge = { id: edges.length, a, b, points, alive: true };
      edges.push(edge);
      nodes[a].edges.push(edge.id);
      nodes[b].edges.push(edge.id);
    };
    const directPairs = new Set;
    for (const p of pixels) {
      const from = nodeOf[p];
      if (from < 0)
        continue;
      const px = p % w;
      const py = (p - px) / w;
      for (let k = 0;k < 8; k++) {
        const q = (py + DY[k]) * w + px + DX[k];
        if (!img[q] || nodeOf[q] === from)
          continue;
        if (nodeOf[q] >= 0) {
          const key = from < nodeOf[q] ? `${from}:${nodeOf[q]}` : `${nodeOf[q]}:${from}`;
          if (directPairs.has(key))
            continue;
          directPairs.add(key);
          addEdge(from, nodeOf[q], [
            { x: nodes[from].x, y: nodes[from].y },
            { x: nodes[nodeOf[q]].x, y: nodes[nodeOf[q]].y }
          ]);
          continue;
        }
        if (visited[q])
          continue;
        const points = [{ x: nodes[from].x, y: nodes[from].y }, center(q)];
        visited[q] = 1;
        let prev = p;
        let cur = q;
        let to = -1;
        for (;; ) {
          const cx = cur % w;
          const cy = (cur - cx) / w;
          let next = -1;
          for (let j = 0;j < 8; j++) {
            const r = (cy + DY[j]) * w + cx + DX[j];
            if (!img[r] || r === prev)
              continue;
            if (nodeOf[r] >= 0 && nodeOf[r] !== from) {
              next = r;
              break;
            }
            if (nodeOf[r] === from) {
              next = r;
              break;
            }
            if (nodeOf[r] < 0 && !visited[r])
              next = r;
          }
          if (next < 0)
            break;
          if (nodeOf[next] >= 0) {
            to = nodeOf[next];
            break;
          }
          visited[next] = 1;
          points.push(center(next));
          prev = cur;
          cur = next;
        }
        if (to < 0)
          continue;
        points.push({ x: nodes[to].x, y: nodes[to].y });
        addEdge(from, to, points);
      }
    }
    const loops = [];
    for (const p of pixels) {
      if (nodeOf[p] >= 0 || visited[p])
        continue;
      const loop = [center(p)];
      visited[p] = 1;
      let prev = -1;
      let cur = p;
      for (;; ) {
        const cx = cur % w;
        const cy = (cur - cx) / w;
        let next = -1;
        for (let j = 0;j < 8; j++) {
          const r = (cy + DY[j]) * w + cx + DX[j];
          if (img[r] && r !== prev && !visited[r]) {
            next = r;
            break;
          }
        }
        if (next < 0)
          break;
        visited[next] = 1;
        loop.push(center(next));
        prev = cur;
        cur = next;
      }
      if (loop.length >= 4)
        loops.push(loop);
    }
    return { nodes, edges, loops };
  }
  function liveDegree(node, edges) {
    let n = 0;
    for (const e of node.edges)
      if (edges[e].alive)
        n += edges[e].a === edges[e].b ? 2 : 1;
    return n;
  }
  function mergeThrough(node, edges) {
    const live = node.edges.filter((e) => edges[e].alive);
    if (live.length !== 2)
      return false;
    const [e1, e2] = live.map((e) => edges[e]);
    if (e1 === e2)
      return false;
    const p1 = e1.b === node.id ? e1.points : [...e1.points].reverse();
    const p2 = e2.a === node.id ? e2.points : [...e2.points].reverse();
    const start = e1.b === node.id ? e1.a : e1.b;
    const end = e2.a === node.id ? e2.b : e2.a;
    e1.points = [...p1, ...p2.slice(1)];
    e1.a = start;
    e1.b = end;
    e2.alive = false;
    return true;
  }
  function prune(nodes, edges) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const e of edges) {
        if (!e.alive)
          continue;
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
        if (end < 0 || liveDegree(nodes[junction], edges) < 3)
          continue;
        if (polylineLength(e.points) < nodes[junction].r * 1.3) {
          e.alive = false;
          changed = true;
        }
      }
      for (const node of nodes)
        if (liveDegree(node, edges) === 2 && mergeThrough(node, edges))
          changed = true;
    }
  }
  function directionAt(points, fromStart, reach) {
    const list = fromStart ? points : [...points].reverse();
    const origin = list[0];
    let travelled = 0;
    let target = list[list.length - 1];
    for (let i = 1;i < list.length; i++) {
      travelled += Math.hypot(list[i].x - list[i - 1].x, list[i].y - list[i - 1].y);
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
  function chainStrokes(nodes, edges) {
    const live = edges.filter((e) => e.alive);
    const partner = new Map;
    for (const node of nodes) {
      const ends = [];
      for (const id of node.edges) {
        const e = edges[id];
        if (!e.alive)
          continue;
        const reach = Math.max(4, node.r * 2);
        if (e.a === node.id)
          ends.push({ edge: id, side: 0, dir: directionAt(e.points, true, reach) });
        if (e.b === node.id)
          ends.push({ edge: id, side: 1, dir: directionAt(e.points, false, reach) });
      }
      if (ends.length < 3)
        continue;
      const pairs = [];
      for (let i = 0;i < ends.length; i++) {
        for (let j = i + 1;j < ends.length; j++) {
          if (ends[i].edge === ends[j].edge)
            continue;
          const straight = -(ends[i].dir.x * ends[j].dir.x + ends[i].dir.y * ends[j].dir.y);
          if (straight > Math.cos(50 * Math.PI / 180))
            pairs.push({ i, j, straight });
        }
      }
      pairs.sort((p, q) => q.straight - p.straight);
      const used = new Set;
      for (const { i, j } of pairs) {
        if (used.has(i) || used.has(j))
          continue;
        used.add(i);
        used.add(j);
        partner.set(`${ends[i].edge}:${ends[i].side}`, [ends[j].edge, ends[j].side]);
        partner.set(`${ends[j].edge}:${ends[j].side}`, [ends[i].edge, ends[i].side]);
      }
    }
    const done = new Set;
    const strokes = [];
    const walk = (startEdge, startSide) => {
      const points = [];
      let edge = startEdge;
      let side = startSide;
      let closed = false;
      for (;; ) {
        done.add(edge);
        const e = edges[edge];
        const seg = side === 0 ? e.points : [...e.points].reverse();
        points.push(...points.length ? seg.slice(1) : seg);
        const next = partner.get(`${edge}:${side === 0 ? 1 : 0}`);
        if (!next)
          break;
        if (next[0] === startEdge && next[1] === startSide) {
          closed = true;
          break;
        }
        if (done.has(next[0]))
          break;
        edge = next[0];
        side = next[1];
      }
      if (closed)
        points.pop();
      strokes.push({ points, closed });
    };
    for (const e of live) {
      if (done.has(e.id))
        continue;
      if (!partner.has(`${e.id}:0`))
        walk(e.id, 0);
      else if (!partner.has(`${e.id}:1`))
        walk(e.id, 1);
    }
    for (const e of live)
      if (!done.has(e.id))
        walk(e.id, 0);
    for (const stroke of strokes) {
      if (stroke.closed)
        continue;
      const first = stroke.points[0];
      const last = stroke.points[stroke.points.length - 1];
      if (stroke.points.length > 3 && Math.hypot(first.x - last.x, first.y - last.y) < 1.5) {
        stroke.points.pop();
        stroke.closed = true;
      }
    }
    return strokes;
  }
  function smooth(stroke, iterations, spacing) {
    let pts = stroke.points.map((p) => ({ ...p }));
    const n = pts.length;
    if (n > 2) {
      for (let it = 0;it < iterations; it++) {
        const next = pts.map((p) => ({ ...p }));
        for (let i = 0;i < n; i++) {
          if (!stroke.closed && (i === 0 || i === n - 1))
            continue;
          const a = pts[(i - 1 + n) % n];
          const b = pts[(i + 1) % n];
          next[i] = { x: pts[i].x * 0.5 + (a.x + b.x) * 0.25, y: pts[i].y * 0.5 + (a.y + b.y) * 0.25 };
        }
        pts = next;
      }
    }
    const loop = stroke.closed ? [...pts, pts[0]] : pts;
    const total = polylineLength(loop);
    if (total < spacing)
      return { points: stroke.closed ? pts : [pts[0], pts[pts.length - 1]], closed: stroke.closed };
    const count = Math.max(stroke.closed ? 6 : 2, Math.round(total / spacing));
    const out = [];
    let seg = 1;
    let walked = 0;
    for (let i = 0;i <= count; i++) {
      if (stroke.closed && i === count)
        break;
      const target = total * i / count;
      while (seg < loop.length - 1 && walked + Math.hypot(loop[seg].x - loop[seg - 1].x, loop[seg].y - loop[seg - 1].y) < target) {
        walked += Math.hypot(loop[seg].x - loop[seg - 1].x, loop[seg].y - loop[seg - 1].y);
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
  var cache = new Map;
  function skeletonise(grapheme, options, debug) {
    const resolution = options.resolution ?? 160;
    const font = `${options.weight} ${resolution}px ${options.family}`;
    const key = `${font}\x00${grapheme}`;
    const hit = cache.get(key);
    if (hit && !debug)
      return hit;
    const raster = rasterise(grapheme, font, resolution);
    const { mask, w, h } = raster;
    const dist = distanceTransform(mask, w, h);
    const img = mask.slice();
    thin(img, w, h);
    removeStaircases(img, w, h);
    keepDots(mask, img, dist, w, h);
    debug?.({ raster, thinned: img, dist });
    let area = 0;
    for (let i = 0;i < mask.length; i++)
      area += mask[i];
    const { nodes, edges, loops } = traceGraph(img, dist, w, h);
    prune(nodes, edges);
    let strokes = chainStrokes(nodes, edges);
    for (const loop of loops)
      strokes.push({ points: loop, closed: true });
    for (const node of nodes)
      if (!node.edges.some((e) => edges[e].alive))
        strokes.push({ points: [{ x: node.x, y: node.y }], closed: false });
    const samples = [];
    for (let i = 0;i < img.length; i++)
      if (img[i])
        samples.push(dist[i]);
    samples.sort((a, b) => a - b);
    const radiusPx = samples.length ? Math.max(1, samples[Math.floor(samples.length / 2)]) : resolution * 0.08;
    strokes = strokes.filter((s) => s.points.length > 1 || samples.length > 0);
    strokes = strokes.map((s) => s.points.length > 1 ? smooth(s, 3, Math.max(2, radiusPx * 0.25)) : s);
    const toEm = (p) => ({ x: (p.x - raster.originX) / resolution, y: (p.y - raster.originY) / resolution });
    const emStrokes = strokes.map((s) => ({ closed: s.closed, points: s.points.map(toEm) }));
    const radius = radiusPx / resolution;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const s of emStrokes) {
      for (const p of s.points) {
        minX = Math.min(minX, p.x - radius);
        maxX = Math.max(maxX, p.x + radius);
        minY = Math.min(minY, p.y - radius);
        maxY = Math.max(maxY, p.y + radius);
      }
    }
    if (!emStrokes.length) {
      minX = 0;
      maxX = raster.advance;
      minY = -0.7;
      maxY = 0;
    }
    const result = {
      grapheme,
      strokes: emStrokes,
      radius,
      advance: raster.advance,
      bounds: { minX, maxX, minY, maxY },
      area: area / (resolution * resolution)
    };
    cache.set(key, result);
    return result;
  }

  // src/debug-entry.ts
  Object.assign(window, { SoftTypeDebug: { skeletonise } });
})();

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
  function mergeThrough(node, nodes, edges) {
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
    if (!nodes[end].edges.includes(e1.id))
      nodes[end].edges.push(e1.id);
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
        const length = polylineLength(e.points);
        const reach = nodes[junction].r;
        const shallow = nodes[end].r < reach * 0.45;
        if (length < reach * 0.35 || shallow && length < reach * 1.1) {
          e.alive = false;
          changed = true;
        }
      }
      for (const node of nodes)
        if (liveDegree(node, edges) === 2 && mergeThrough(node, nodes, edges))
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
    const strokes = chainStrokes(nodes, edges);
    for (const loop of loops)
      strokes.push({ points: loop, closed: true });
    for (const node of nodes)
      if (!node.edges.length)
        strokes.push({ points: [{ x: node.x, y: node.y }], closed: false });
    const depthAt = (p) => dist[Math.min(h - 1, Math.floor(p.y)) * w + Math.min(w - 1, Math.floor(p.x))];
    const median = (values) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    };
    const strokeRadii = strokes.map((s) => Math.max(1, median(s.points.map(depthAt))));
    const radiusPx = strokeRadii.length ? median(strokeRadii) : resolution * 0.08;
    const smoothed = strokes.map((s, i) => s.points.length > 1 ? smooth(s, 3, Math.max(2, strokeRadii[i] * 0.25)) : s);
    const toEm = (p) => ({ x: (p.x - raster.originX) / resolution, y: (p.y - raster.originY) / resolution });
    const emStrokes = smoothed.map((s, i) => ({ closed: s.closed, radius: strokeRadii[i] / resolution, points: s.points.map(toEm) }));
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
    const result = {
      grapheme,
      strokes: emStrokes,
      radius: radiusPx / resolution,
      advance: raster.advance,
      bounds: { minX, maxX, minY, maxY },
      area: area / (resolution * resolution)
    };
    cache.set(key, result);
    return result;
  }
  var weighed = new Map;
  function inkAt(skeleton, k, f) {
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
        if (i)
          ctx.lineTo(x, y);
        else
          ctx.moveTo(x, y);
      });
      if (stroke.points.length === 1)
        ctx.lineTo((stroke.points[0].x + f.ox) * f.scale + 0.01, (stroke.points[0].y + f.oy) * f.scale);
      if (stroke.closed)
        ctx.closePath();
      ctx.stroke();
    }
    const data = ctx.getImageData(0, 0, f.w, f.h).data;
    const ink = new Uint8Array(f.w * f.h);
    for (let i = 0;i < ink.length; i++)
      ink[i] = data[i * 4 + 3] >= 128 ? 1 : 0;
    return ink;
  }
  function regions(open, w, h) {
    const label = new Int32Array(w * h);
    const edge = [false];
    const area = [0];
    const stack = [];
    for (let start = 0;start < open.length; start++) {
      if (!open[start] || label[start])
        continue;
      const id = edge.length;
      edge.push(false);
      area.push(0);
      label[start] = id;
      stack.push(start);
      while (stack.length) {
        const i = stack.pop();
        const x = i % w;
        const y = (i - x) / w;
        area[id]++;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1)
          edge[id] = true;
        if (x > 0 && open[i - 1] && !label[i - 1])
          label[i - 1] = id, stack.push(i - 1);
        if (x < w - 1 && open[i + 1] && !label[i + 1])
          label[i + 1] = id, stack.push(i + 1);
        if (y > 0 && open[i - w] && !label[i - w])
          label[i - w] = id, stack.push(i - w);
        if (y < h - 1 && open[i + w] && !label[i + w])
          label[i + w] = id, stack.push(i + w);
      }
    }
    return { label, edge, area };
  }
  function hullOf(ink, w, h) {
    const pts = [];
    for (let y = 0;y < h; y++) {
      let first = -1;
      let last = -1;
      for (let x = 0;x < w; x++) {
        if (!ink[y * w + x])
          continue;
        if (first < 0)
          first = x;
        last = x;
      }
      if (first >= 0)
        pts.push([first, y], [last, y]);
    }
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
        lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = pts.length - 1;i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
        upper.pop();
      upper.push(p);
    }
    const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
    const inside = new Uint8Array(w * h);
    if (hull.length < 3)
      return inside;
    for (let y = 0;y < h; y++) {
      for (let x = 0;x < w; x++) {
        let ok = true;
        for (let i = 0;i < hull.length && ok; i++)
          if (cross(hull[i], hull[(i + 1) % hull.length], [x, y]) < 0)
            ok = false;
        inside[y * w + x] = ok ? 1 : 0;
      }
    }
    return inside;
  }
  function weigh(skeleton, target, minPen = 0) {
    const weight = Math.max(target, skeleton.radius > 0 ? minPen / skeleton.radius : 1);
    if (weight <= 1 || !skeleton.strokes.length)
      return skeleton;
    const key = `${weight}\x00${skeleton.grapheme}\x00${skeleton.radius}\x00${skeleton.strokes.length}`;
    const hit = weighed.get(key);
    if (hit)
      return hit;
    const scale = 96;
    const b = skeleton.bounds;
    const margin = (weight - 1) * skeleton.radius * 1.5 + 2 / scale;
    const frame = {
      scale,
      ox: -b.minX + margin,
      oy: -b.minY + margin,
      w: Math.ceil((b.maxX - b.minX + margin * 2) * scale),
      h: Math.ceil((b.maxY - b.minY + margin * 2) * scale)
    };
    const { w, h } = frame;
    const base = inkAt(skeleton, 1, frame);
    const hull = hullOf(base, w, h);
    const pocket = new Uint8Array(w * h);
    for (let i = 0;i < pocket.length; i++)
      pocket[i] = hull[i] && !base[i] ? 1 : 0;
    const pockets = regions(pocket, w, h);
    const enclosed = (ink) => {
      const bg = new Uint8Array(w * h);
      for (let i = 0;i < bg.length; i++)
        bg[i] = ink[i] ? 0 : 1;
      const r = regions(bg, w, h);
      return r.edge.filter((touches, id) => id > 0 && !touches && r.area[id] > 6).length;
    };
    const holes = enclosed(base);
    const minPocket = (skeleton.radius * scale) ** 2 * 0.5;
    const open = (k) => {
      const ink = inkAt(skeleton, k, frame);
      if (enclosed(ink) !== holes)
        return false;
      const kept = new Float64Array(pockets.area.length);
      for (let i = 0;i < ink.length; i++)
        if (pockets.label[i] && !ink[i])
          kept[pockets.label[i]]++;
      for (let id = 1;id < pockets.area.length; id++) {
        if (pockets.area[id] < minPocket)
          continue;
        if (kept[id] < pockets.area[id] * 0.5)
          return false;
      }
      return true;
    };
    let k = weight;
    if (!open(weight)) {
      let lo = 1;
      let hi = weight;
      for (let i = 0;i < 6; i++) {
        const mid = (lo + hi) / 2;
        if (open(mid))
          lo = mid;
        else
          hi = mid;
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
    const result = { ...skeleton, strokes, radius: skeleton.radius * k, bounds: { minX, maxX, minY, maxY } };
    weighed.set(key, result);
    return result;
  }

  // src/inspect.ts
  var FAMILY = '"Nunito", ui-rounded, system-ui, sans-serif';
  var WEIGHT = 1000;
  var SETS = {
    latin: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    digits: "0123456789",
    punct: "!?.,:;'\"-_()[]{}/\\@#$%&*+=<>~^|`",
    latin1: "ÀÉÎÕÜÇÑßæøåœ€£¥©®°±§¶",
    greek: "ΑΒΓΔΘΛΞΠΣΦΨΩαβγδλπσφψω",
    cyrillic: "АБВГДЖЗИЛФЦЧШЩЫЭЮЯжщ",
    other: "عربيअआकखगघ한글漢字鬱あア★♥✓→∞≈√",
    emoji: "\uD83D\uDE00\uD83C\uDF89\uD83D\uDC4D\uD83C\uDFFD\uD83C\uDDE8\uD83C\uDDE6❤️"
  };
  var segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  var CELL = 150;
  function drawCell(ctx, g, x0, y0) {
    let dbg = null;
    const t0 = performance.now();
    const sk = skeletonise(g, { family: FAMILY, weight: WEIGHT, resolution: 160 }, (d) => dbg = d);
    const pen = Number(new URLSearchParams(location.search).get("pen") ?? 1);
    const shown = weigh(sk, pen, pen > 1 ? 0.085 : 0);
    const ms = performance.now() - t0;
    if (!dbg)
      return;
    const { raster, thinned } = dbg;
    const half = CELL / 2;
    const s = Math.min((half - 8) / raster.w, (CELL - 28) / raster.h);
    const img = ctx.createImageData(raster.w, raster.h);
    for (let i = 0;i < raster.mask.length; i++) {
      const v = thinned[i] ? [220, 40, 40, 255] : raster.mask[i] ? [205, 208, 214, 255] : [0, 0, 0, 0];
      img.data.set(v, i * 4);
    }
    const off = document.createElement("canvas");
    off.width = raster.w;
    off.height = raster.h;
    off.getContext("2d")?.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, x0 + 4, y0 + 4, raster.w * s, raster.h * s);
    const em = 160 * s;
    const ox = x0 + 4 + raster.originX * s;
    const oy = y0 + 4 + raster.originY * s;
    const colors = ["#1f6feb", "#0a8f4a", "#b35c00", "#8a3ffc", "#d6336c", "#0c8599"];
    sk.strokes.forEach((stroke, i) => {
      ctx.strokeStyle = colors[i % colors.length];
      ctx.fillStyle = colors[i % colors.length];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      stroke.points.forEach((p, j) => j ? ctx.lineTo(ox + p.x * em, oy + p.y * em) : ctx.moveTo(ox + p.x * em, oy + p.y * em));
      if (stroke.closed)
        ctx.closePath();
      ctx.stroke();
      const first = stroke.points[0];
      ctx.beginPath();
      ctx.arc(ox + first.x * em, oy + first.y * em, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    const bw = shown.bounds.maxX - shown.bounds.minX;
    const bh = shown.bounds.maxY - shown.bounds.minY;
    const t = Math.min((half - 8) / bw, (CELL - 28) / bh);
    const tx = x0 + half + 4 - shown.bounds.minX * t;
    const ty = y0 + 4 - shown.bounds.minY * t;
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of shown.strokes) {
      ctx.lineWidth = stroke.radius * 2 * t;
      ctx.beginPath();
      stroke.points.forEach((p, j) => j ? ctx.lineTo(tx + p.x * t, ty + p.y * t) : ctx.moveTo(tx + p.x * t, ty + p.y * t));
      if (stroke.points.length === 1)
        ctx.lineTo(tx + stroke.points[0].x * t + 0.01, ty + stroke.points[0].y * t);
      if (stroke.closed)
        ctx.closePath();
      ctx.stroke();
    }
    ctx.fillStyle = "#55575b";
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(`${sk.strokes.length}s r${sk.radius.toFixed(3)} x${(shown.radius / sk.radius).toFixed(2)} ${ms.toFixed(1)}ms`, x0 + 4, y0 + CELL - 6);
  }
  async function runInspector(root) {
    await document.fonts.load(`${WEIGHT} 160px Nunito`, "Aa");
    const names = (new URLSearchParams(location.search).get("sets") ?? Object.keys(SETS).join(",")).split(",");
    for (const name of names) {
      const graphemes = [...segmenter.segment(SETS[name] ?? name)].map((s) => s.segment);
      const cols = Math.min(10, graphemes.length);
      const rows = Math.ceil(graphemes.length / cols);
      const title = document.createElement("h3");
      title.textContent = name;
      title.style.cssText = "font:600 13px ui-monospace,monospace;margin:18px 0 6px";
      const canvas = document.createElement("canvas");
      canvas.width = cols * CELL;
      canvas.height = rows * CELL;
      canvas.style.cssText = `width:${cols * CELL}px;height:${rows * CELL}px;background:#f4f5f7`;
      root.append(title, canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx)
        continue;
      ctx.strokeStyle = "#e1e3e8";
      for (let i = 0;i < graphemes.length; i++) {
        const x = i % cols * CELL;
        const y = Math.floor(i / cols) * CELL;
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#e1e3e8";
        ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
        drawCell(ctx, graphemes[i], x, y);
        ctx.restore();
      }
    }
  }

  // src/inspect-entry.ts
  Object.assign(window, { SoftTypeInspect: { runInspector } });
})();

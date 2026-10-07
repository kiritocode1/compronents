(() => {
  // src/engine.ts
  var TICK = 60;
  var UNWIND = 0.35;
  var STRETCH = 1.45;
  var SQUASH = 0.65;
  function stepSpring(s) {
    s.v += ((s.target - s.value) * s.stiffness - s.v * s.damping) / TICK;
    s.value = Math.max(s.floor, s.value + s.v / TICK);
  }
  function settled(s) {
    return Math.abs(s.target - s.value) < 0.001 && Math.abs(s.v) < 0.01;
  }

  class Body {
    id;
    grapheme;
    nodes = [];
    paths = [];
    links = [];
    calm = new Set;
    cx = 0;
    cy = 0;
    bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    radius = 0;
    z = 0;
    layout = {
      value: 1,
      v: 0,
      target: 1,
      stiffness: 90,
      damping: 16,
      floor: 0.05
    };
    puff = null;
    applied = 1;
    anchor = null;
    delay = 0;
    strained = 0;
    mending = 0;
    ghost = false;
    cos = 1;
    sin = 0;
    turnCos = 1;
    turnSin = 0;
    meanX = 0;
    meanY = 0;
    leaving = false;
    ribs;
    constructor(id, skeleton, pose) {
      this.id = id;
      this.grapheme = skeleton.grapheme;
      const { bounds } = skeleton;
      const midX = (bounds.minX + bounds.maxX) / 2;
      const midY = (bounds.minY + bounds.maxY) / 2;
      const cos = Math.cos(pose.angle);
      const sin = Math.sin(pose.angle);
      const owners = new Map;
      skeleton.strokes.forEach((stroke, strokeIndex) => {
        const r = stroke.radius * pose.size;
        this.radius = Math.max(this.radius, r);
        const local = stroke.points.map((p) => ({
          x: (p.x - midX) * pose.size,
          y: (p.y - midY) * pose.size
        }));
        if (stroke.closed)
          local.push(local[0]);
        const lengths = [0];
        for (let i = 1;i < local.length; i++)
          lengths.push(lengths[i - 1] + Math.hypot(local[i].x - local[i - 1].x, local[i].y - local[i - 1].y));
        const length = lengths[lengths.length - 1];
        const count = local.length === 1 ? 0 : Math.max(3, Math.ceil(length / (r * 0.6)));
        const path = [];
        for (let i = 0;i <= count; i++) {
          if (stroke.closed && i === count)
            break;
          const distance = count ? length * i / count : 0;
          let j = 1;
          while (j < lengths.length - 1 && lengths[j] < distance)
            j++;
          const a = local[Math.max(0, j - 1)];
          const b = local[Math.min(local.length - 1, j)];
          const t = count && lengths[j] !== lengths[j - 1] ? (distance - lengths[j - 1]) / (lengths[j] - lengths[j - 1]) : 0;
          const lx = a.x + (b.x - a.x) * t;
          const ly = a.y + (b.y - a.y) * t;
          const ox = lx * cos - ly * sin;
          const oy = lx * sin + ly * cos;
          const end = !stroke.closed && (i === 0 || i === count);
          let node = null;
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
              r
            };
            this.nodes.push(node);
            owners.set(node, new Set);
          } else
            node.r = Math.max(node.r, r);
          owners.get(node)?.add(strokeIndex);
          if (path[path.length - 1] !== node)
            path.push(node);
        }
        for (let i = 1;i < path.length; i++)
          this.link(path[i - 1], path[i]);
        if (stroke.closed && path.length > 2)
          this.link(path[path.length - 1], path[0]);
        this.paths.push({
          nodes: path,
          closed: stroke.closed && path.length > 2,
          radius: r
        });
      });
      for (let i = 0;i < this.nodes.length; i++) {
        for (let j = i + 1;j < this.nodes.length; j++) {
          const a = this.nodes[i];
          const b = this.nodes[j];
          const oa = owners.get(a);
          const ob = owners.get(b);
          if (!oa || !ob || [...oa].some((s) => ob.has(s)))
            continue;
          if (Math.hypot(a.ox - b.ox, a.oy - b.oy) < (a.r + b.r) * 1.1)
            this.link(a, b);
        }
      }
      this.tether();
      for (let i = 0;i < this.nodes.length; i++) {
        for (let j = i + 1;j < this.nodes.length; j++) {
          const a = this.nodes[i];
          const b = this.nodes[j];
          if (Math.hypot(a.ox - b.ox, a.oy - b.oy) < (a.r + b.r) * 1.05)
            this.calm.add(i * 4096 + j);
        }
      }
      for (const l of this.links)
        this.calm.add(Math.min(l.a.index, l.b.index) * 4096 + Math.max(l.a.index, l.b.index));
      this.update();
    }
    link(a, b) {
      this.links.push({ a, b, length: Math.hypot(a.ox - b.ox, a.oy - b.oy) });
    }
    tether() {
      const parent = this.nodes.map((_, i) => i);
      const find = (i) => {
        if (parent[i] !== i)
          parent[i] = find(parent[i]);
        return parent[i];
      };
      for (const l of this.links)
        parent[find(l.a.index)] = find(l.b.index);
      const groups = new Map;
      for (const n of this.nodes) {
        const root = find(n.index);
        const group = groups.get(root);
        if (group)
          group.push(n);
        else
          groups.set(root, [n]);
      }
      const pieces = [...groups.values()];
      if (pieces.length < 2)
        return;
      const d = (a, b) => Math.hypot(a.ox - b.ox, a.oy - b.oy);
      const joined = new Set([0]);
      while (joined.size < pieces.length) {
        let best = null;
        for (const i of joined) {
          for (let j = 0;j < pieces.length; j++) {
            if (joined.has(j))
              continue;
            for (const a of pieces[i])
              for (const b of pieces[j])
                if (!best || d(a, b) < best.d)
                  best = { a, b, to: j, d: d(a, b) };
          }
        }
        if (!best)
          break;
        const first = best;
        this.link(first.a, first.b);
        let second = null;
        for (const i of joined) {
          for (const a of pieces[i]) {
            if (a === first.a)
              continue;
            for (const b of pieces[first.to])
              if (b !== first.b && (!second || d(a, b) < second.d))
                second = { a, b, d: d(a, b) };
          }
        }
        if (second)
          this.link(second.a, second.b);
        else if (pieces[first.to].length === 1) {
          let other = null;
          for (const i of joined)
            for (const a of pieces[i])
              if (a !== first.a && (!other || d(a, first.b) < d(other, first.b)))
                other = a;
          if (other)
            this.link(other, first.b);
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
    hitTest(x, y) {
      return this.nodes.some((n) => (x - n.x) ** 2 + (y - n.y) ** 2 <= n.r * n.r * 1.1);
    }
    scaleBy(k) {
      this.update();
      this.radius *= k;
      for (const n of this.nodes) {
        n.ox *= k;
        n.oy *= k;
        n.r *= k;
        n.x = this.cx + (n.x - this.cx) * k;
        n.y = this.cy + (n.y - this.cy) * k;
      }
      for (const l of this.links)
        l.length *= k;
      for (const p of this.paths)
        p.radius *= k;
    }
    followScale() {
      stepSpring(this.layout);
      if (this.delay > 0)
        this.delay--;
      else if (this.puff)
        stepSpring(this.puff);
      const desired = this.layout.value * (this.puff?.value ?? 1);
      if (Math.abs(desired - this.applied) > 0.000001) {
        this.scaleBy(desired / this.applied);
        this.applied = desired;
      }
      if (this.puff && !this.leaving && this.puff.target === 1 && settled(this.puff))
        this.puff = null;
      return !settled(this.layout) || !!this.puff;
    }
    inflate(target, elastic = false) {
      this.puff ??= {
        value: 1,
        v: 0,
        target: 1,
        stiffness: 0,
        damping: 0,
        floor: 0.6
      };
      this.puff.target = target;
      this.puff.stiffness = elastic ? 220 : 260;
      this.puff.damping = elastic ? 7 : 32;
    }
    spawn(delay = 0) {
      this.puff = {
        value: 0.2,
        v: 0,
        target: 1,
        stiffness: 220,
        damping: 9,
        floor: 0.02
      };
      this.delay = delay;
      this.followScale();
    }
    remove() {
      this.leaving = true;
      this.puff = {
        value: this.puff?.value ?? 1,
        v: this.puff?.v ?? 0,
        target: 0,
        stiffness: 320,
        damping: 30,
        floor: 0.02
      };
    }
    get gone() {
      return this.leaving && (this.puff?.value ?? 1) < 0.08;
    }
    get forming() {
      return !this.leaving && (this.delay > 0 || !!this.puff && this.puff.target === 1 && this.puff.value < 0.6 && this.puff.floor < 0.5);
    }
    strain() {
      let worst = 0;
      for (const l of this.links)
        worst = Math.max(worst, Math.abs(Math.hypot(l.b.x - l.a.x, l.b.y - l.a.y) / l.length - 1));
      return worst;
    }
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
    target(n) {
      const qx = n.ox - this.meanX;
      const qy = n.oy - this.meanY;
      return {
        x: this.cx + qx * this.turnCos - qy * this.turnSin,
        y: this.cy + qx * this.turnSin + qy * this.turnCos
      };
    }
    turned(x, y) {
      return { x: x * this.cos - y * this.sin, y: x * this.sin + y * this.cos };
    }
    chain(root) {
      const next = new Map;
      for (const l of this.links) {
        for (const [p, q] of [
          [l.a, l.b],
          [l.b, l.a]
        ]) {
          const list = next.get(p);
          const step = { a: p, b: q, length: l.length };
          if (list)
            list.push(step);
          else
            next.set(p, [step]);
        }
      }
      const seen = new Set([root]);
      const queue = [root];
      const tree = [];
      for (let i = 0;i < queue.length; i++) {
        for (const step of next.get(queue[i]) ?? []) {
          if (seen.has(step.b))
            continue;
          seen.add(step.b);
          queue.push(step.b);
          tree.push(step);
        }
      }
      return tree;
    }
    restore(amount) {
      this.fit();
      for (const n of this.nodes) {
        const t = this.target(n);
        n.x += (t.x - n.x) * amount;
        n.y += (t.y - n.y) * amount;
      }
    }
  }

  class World {
    width;
    height;
    bodies = [];
    drag = null;
    energy = 1;
    reducedMotion = false;
    nodes = [];
    grid = new Map;
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }
    add(body) {
      this.bodies.push(body);
      this.nodes.push(...body.nodes);
      this.energy = 1;
    }
    drop(body) {
      this.bodies = this.bodies.filter((b) => b !== body);
      this.nodes = this.nodes.filter((n) => n.body !== body);
      if (this.drag?.body === body)
        this.drag = null;
    }
    resize(width, height) {
      this.width = width;
      this.height = height;
      this.energy = 1;
    }
    place(body, x, y, scale) {
      body.anchor = { x, y, ticks: 240 };
      body.layout.target = scale;
      this.energy = 1;
    }
    hit(x, y) {
      const ordered = [...this.bodies].sort((a, b) => b.z - a.z);
      return ordered.find((b) => !b.leaving && b.hitTest(x, y)) ?? null;
    }
    grab(body, x, y) {
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
        chain: body.chain(node)
      };
      body.anchor = null;
      this.energy = 1;
    }
    release() {
      this.drag = null;
    }
    get busy() {
      return this.bodies.some((b) => b.puff || b.anchor || Math.abs(b.layout.target - b.layout.value) > 0.001 || Math.abs(b.layout.v) > 0.01);
    }
    sleep() {
      for (const n of this.nodes)
        n.vx = n.vy = 0;
      this.energy = 0;
    }
    followAnchors() {
      for (const b of this.bodies) {
        const a = b.anchor;
        if (!a || b === this.drag?.body)
          continue;
        if (--a.ticks <= 0) {
          b.anchor = null;
          continue;
        }
        const pull = 0.05 * Math.min(1, a.ticks / 60);
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
    confine(n) {
      n.x = Math.max(n.r + 3, Math.min(this.width - n.r - 3, n.x));
      n.y = Math.max(n.r + 3, Math.min(this.height - n.r - 3, n.y));
    }
    solve() {
      for (const b of this.bodies) {
        for (const l of b.links) {
          const dx = l.b.x - l.a.x;
          const dy = l.b.y - l.a.y;
          const d = Math.hypot(dx, dy) || 1;
          const k = (d - l.length) / d * 0.24;
          l.a.x += dx * k;
          l.a.y += dy * k;
          l.b.x -= dx * k;
          l.b.y -= dy * k;
        }
        for (const path of b.paths) {
          const nodes = path.nodes;
          if (nodes.length < 3)
            continue;
          const start = path.closed ? 0 : 1;
          const end = path.closed ? nodes.length : nodes.length - 1;
          for (let i = start;i < end; i++) {
            const n = nodes[i];
            const a = nodes[(i - 1 + nodes.length) % nodes.length];
            const c = nodes[(i + 1) % nodes.length];
            const rest = b.turned(n.ox - (a.ox + c.ox) / 2, n.oy - (a.oy + c.oy) / 2);
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
      let largest = 8;
      for (const n of this.nodes)
        largest = Math.max(largest, n.r);
      const cell = largest * 2 + 3;
      const grid = this.grid;
      for (const bucket of grid.values())
        bucket.length = 0;
      for (const a of this.nodes) {
        const gx = Math.floor(a.x / cell);
        const gy = Math.floor(a.y / cell);
        for (let x = gx - 1;x <= gx + 1; x++) {
          for (let y = gy - 1;y <= gy + 1; y++) {
            const bucket = grid.get(x * 65536 + y);
            if (!bucket)
              continue;
            for (const b of bucket) {
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const reach = a.r + b.r + 1.8;
              const d2 = dx * dx + dy * dy;
              if (d2 >= reach * reach)
                continue;
              if (a.body === b.body) {
                if (a.body.calm.has(Math.min(a.index, b.index) * 4096 + Math.max(a.index, b.index)))
                  continue;
              } else if (a.body.ghost || b.body.ghost)
                continue;
              const d = Math.sqrt(d2) || 0.001;
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
        if (bucket)
          bucket.push(a);
        else
          grid.set(key, [a]);
      }
      for (const n of this.nodes)
        this.confine(n);
    }
    limitStrain() {
      const drag = this.drag;
      if (drag) {
        for (const l of drag.chain) {
          const dx = l.b.x - l.a.x;
          const dy = l.b.y - l.a.y;
          const d = Math.hypot(dx, dy);
          const most = l.length * STRETCH;
          if (d <= most)
            continue;
          l.b.x = l.a.x + dx / d * most;
          l.b.y = l.a.y + dy / d * most;
        }
      }
      for (const b of this.bodies) {
        for (const l of b.links) {
          const dx = l.b.x - l.a.x;
          const dy = l.b.y - l.a.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const goal = Math.max(l.length * SQUASH, Math.min(l.length * STRETCH, d));
          if (goal === d)
            continue;
          const k = (d - goal) / d / 2;
          const heldA = l.a === drag?.node;
          const heldB = l.b === drag?.node;
          const ka = heldA ? 0 : heldB ? 2 * k : k;
          const kb = heldB ? 0 : heldA ? 2 * k : k;
          l.a.x += dx * ka;
          l.a.y += dy * ka;
          l.b.x -= dx * kb;
          l.b.y -= dy * kb;
        }
      }
    }
    untangle() {
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
      for (const b of this.bodies)
        if (b.followScale())
          changing = true;
      for (const b of this.bodies)
        b.ghost = b.forming;
      for (const b of this.bodies.filter((body) => body.gone))
        this.drop(b);
      this.followAnchors();
      const nodes = this.nodes;
      const old = nodes.map((n) => [n.x, n.y]);
      for (const b of this.bodies) {
        b.fit();
        for (const n of b.nodes) {
          const t = b.target(n);
          n.vx += (t.x - n.x) * 0.024;
          n.vy += (t.y - n.y) * 0.024;
        }
      }
      const move = nodes.map((n) => [n.vx, n.vy]);
      let held = null;
      const drag = this.drag;
      if (drag) {
        const n = drag.node;
        const mx = Math.max(-60, Math.min(60, drag.x + drag.dx - n.x));
        const my = Math.max(-60, Math.min(60, drag.y + drag.dy - n.y));
        nodes.forEach((m, i) => {
          if (m.body !== drag.body)
            return;
          move[i][0] += mx * 0.2;
          move[i][1] += my * 0.2;
        });
        held = { n, x0: n.x, y0: n.y, x: n.x + mx, y: n.y + my };
      }
      let far = 0;
      let thin = Infinity;
      for (const n of nodes)
        thin = Math.min(thin, n.r);
      for (const [x, y] of move)
        far = Math.max(far, Math.hypot(x, y));
      if (held)
        far = Math.max(far, Math.hypot(held.x - held.x0, held.y - held.y0));
      const steps = Math.max(1, Math.min(8, Math.ceil(far / (Math.max(thin, 1) * 0.5))));
      const passes = Math.ceil(6 / steps);
      for (let s = 1;s <= steps; s++) {
        nodes.forEach((n, i) => {
          n.x += move[i][0] / steps;
          n.y += move[i][1] / steps;
        });
        for (let p = 0;p < passes; p++) {
          this.solve();
          if (held) {
            const t = s / steps;
            held.n.x = held.x0 + (held.x - held.x0) * t;
            held.n.y = held.y0 + (held.y - held.y0) * t;
            this.confine(held.n);
          }
        }
        this.limitStrain();
        for (const n of nodes)
          this.confine(n);
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
      for (const b of this.bodies)
        b.update();
      return changing;
    }
  }

  // src/layout.ts
  var SPACE = 0.3;
  var GAP = 0.02;
  var LINE_GAP = 0.02;
  var EMPTY_TOP = -0.74;
  var EMPTY_BOTTOM = 0.12;
  function hash(n) {
    let t = n * 2654435769 + 1831565813 | 0;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function profile(id) {
    const sign = id % 2 ? 1 : -1;
    return {
      scale: 0.9 + hash(id * 3 + 1) * 0.22,
      angle: sign * (0.06 + hash(id * 3 + 2) * 0.16),
      lift: (hash(id * 3 + 3) - 0.5) * 0.08
    };
  }
  function measure(item) {
    if (item.kind !== "glyph")
      return {
        item,
        width: item.kind === "space" ? SPACE : 0,
        top: EMPTY_TOP,
        bottom: EMPTY_BOTTOM
      };
    const p = profile(item.id);
    const b = item.skeleton.bounds;
    const w = (b.maxX - b.minX) * p.scale;
    const h = (b.maxY - b.minY) * p.scale;
    const centre = (b.minY + b.maxY) / 2 * p.scale;
    return {
      item,
      width: w * Math.cos(p.angle) + Math.abs(Math.sin(p.angle)) * h * 0.4,
      top: centre - h / 2 + p.lift,
      bottom: centre + h / 2 + p.lift
    };
  }
  function wrap(measured, limit, breakWords) {
    const lines = [[]];
    let width = 0;
    let word = [];
    const wordWidth = (w) => w.reduce((s, m, i) => s + m.width + (i ? GAP : 0), 0);
    const flush = () => {
      if (!word.length)
        return;
      let line = lines[lines.length - 1];
      const ww = wordWidth(word);
      const lead = line.length ? GAP : 0;
      if (line.length && width + lead + ww > limit) {
        line = [];
        lines.push(line);
        width = 0;
      }
      for (const m of word) {
        const step = (line.length ? GAP : 0) + m.width;
        if (breakWords && line.length && width + step > limit) {
          line = [];
          lines.push(line);
          width = 0;
        }
        width += (line.length ? GAP : 0) + m.width;
        line.push(m);
      }
      word = [];
    };
    for (const m of measured) {
      if (m.item.kind === "glyph") {
        word.push(m);
        continue;
      }
      flush();
      const line = lines[lines.length - 1];
      if (m.item.kind === "newline") {
        line.push(m);
        lines.push([]);
        width = 0;
      } else if (line.length) {
        line.push(m);
        width += m.width;
      } else
        line.push(m);
    }
    flush();
    return lines;
  }
  function lineMetrics(line) {
    const glyphs = line.filter((m) => m.item.kind === "glyph");
    const width = line.reduce((s, m, i) => s + m.width + (i && m.item.kind === "glyph" && line[i - 1].item.kind === "glyph" ? GAP : 0), 0);
    let trailing = 0;
    for (let i = line.length - 1;i >= 0 && line[i].item.kind !== "glyph"; i--)
      trailing += line[i].width;
    return {
      width: width - trailing,
      top: glyphs.length ? Math.min(...glyphs.map((m) => m.top)) : EMPTY_TOP,
      bottom: glyphs.length ? Math.max(...glyphs.map((m) => m.bottom)) : EMPTY_BOTTOM
    };
  }
  function layoutText(items, width, height, options) {
    const pad = Math.max(9, Math.min(width, height) * 0.013);
    const innerW = width - pad * 2;
    const innerH = height - pad * 2;
    const measured = items.map(measure);
    const fits = (size, breakWords) => {
      const lines = wrap(measured, innerW / size, breakWords);
      const metrics = lines.map(lineMetrics);
      const total = metrics.reduce((s, m) => s + m.bottom - m.top, 0) + LINE_GAP * (lines.length - 1);
      return Math.max(...metrics.map((m) => m.width)) * size <= innerW && total * size <= innerH;
    };
    const largest = (breakWords) => {
      let lo = 4;
      let hi = Math.max(lo, innerH * 1.4);
      for (let i = 0;i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (fits(mid, breakWords))
          lo = mid;
        else
          hi = mid;
      }
      return lo;
    };
    const whole = largest(false);
    const broken = options.breakWords ? largest(true) : whole;
    const breakWords = whole < broken * 0.6;
    const fitted = breakWords ? broken : whole;
    const size = items.some((i) => i.kind === "glyph") ? fitted : Math.min(fitted, innerH * 0.4);
    const lines = wrap(measured, innerW / size, breakWords);
    const metrics = lines.map(lineMetrics);
    const total = (metrics.reduce((s, m) => s + m.bottom - m.top, 0) + LINE_GAP * (lines.length - 1)) * size;
    const poses = new Map;
    const slotOf = new Map;
    const after = new Map;
    let top = (height - total) / 2;
    lines.forEach((line, row) => {
      const m = metrics[row];
      const baseline = top - m.top * size;
      const lineH = (m.bottom - m.top) * size;
      const midY = top + lineH / 2;
      let x = (width - m.width * size) / 2;
      line.forEach((entry, i) => {
        if (i && entry.item.kind === "glyph" && line[i - 1].item.kind === "glyph")
          x += GAP * size;
        slotOf.set(entry.item.id, { x, y: midY, h: lineH });
        const w = entry.width * size;
        if (entry.item.kind === "glyph") {
          const p = profile(entry.item.id);
          const b = entry.item.skeleton.bounds;
          const seam = Math.sin(x / width * Math.PI * 1.65 - 0.55) * lineH * 0.05;
          poses.set(entry.item.id, {
            x: x + w / 2,
            y: baseline + ((b.minY + b.maxY) / 2 * p.scale + p.lift) * size + seam,
            size: size * p.scale * options.squeeze,
            angle: p.angle
          });
        }
        x += w;
        after.set(entry.item.id, { x, y: midY, h: lineH });
        if (entry.item.kind === "newline") {
          const next = metrics[row + 1];
          const nextH = next ? (next.bottom - next.top) * size : lineH;
          const nextTop = top + lineH + LINE_GAP * size;
          const nextX = next ? (width - next.width * size) / 2 : width / 2;
          after.set(entry.item.id, {
            x: nextX,
            y: nextTop + nextH / 2,
            h: nextH
          });
        }
      });
      top += lineH + LINE_GAP * size;
    });
    const empty = {
      x: width / 2,
      y: height / 2,
      h: (EMPTY_BOTTOM - EMPTY_TOP) * size
    };
    const slots = items.map((item, i) => slotOf.get(item.id) ?? (i ? after.get(items[i - 1].id) ?? empty : empty));
    slots.push(items.length ? after.get(items[items.length - 1].id) ?? empty : empty);
    return { poses, slots, size };
  }

  // src/render.ts
  var WIRE = {
    line: "#8e9094",
    rib: "rgba(142,144,148,.45)",
    handle: "#55575b",
    fill: "rgba(255,255,255,.35)"
  };
  function spine(path) {
    const nodes = path.nodes;
    const count = nodes.length;
    const out = new Path2D;
    let last = null;
    const to = (x, y) => {
      if (!last)
        out.moveTo(x, y);
      else if (Math.hypot(x - last[0], y - last[1]) < 0.05)
        return;
      else
        out.lineTo(x, y);
      last = [x, y];
    };
    const mid = (a, b) => [
      (a.x + b.x) / 2,
      (a.y + b.y) / 2
    ];
    const curve = (p0, c, p1) => {
      const ax = c.x - p0[0];
      const ay = c.y - p0[1];
      const bx = p1[0] - c.x;
      const by = p1[1] - c.y;
      const turn = Math.abs(Math.atan2(ax * by - ay * bx, ax * bx + ay * by));
      const pieces = Math.max(1, Math.min(24, Math.ceil(turn / 0.1)));
      for (let k = 1;k <= pieces; k++) {
        const t = k / pieces;
        const u = 1 - t;
        to(u * u * p0[0] + 2 * u * t * c.x + t * t * p1[0], u * u * p0[1] + 2 * u * t * c.y + t * t * p1[1]);
      }
    };
    if (path.closed) {
      let start = mid(nodes[count - 1], nodes[0]);
      to(...start);
      for (let i = 0;i < count; i++) {
        const end = mid(nodes[i], nodes[(i + 1) % count]);
        curve(start, nodes[i], end);
        start = end;
      }
      out.closePath();
    } else {
      let start = [nodes[0].x, nodes[0].y];
      to(...start);
      for (let i = 1;i < count - 1; i++) {
        const end = mid(nodes[i], nodes[i + 1]);
        curve(start, nodes[i], end);
        start = end;
      }
      if (count > 1)
        to(nodes[count - 1].x, nodes[count - 1].y);
      else
        out.lineTo(start[0] + 0.01, start[1]);
    }
    return out;
  }
  function spineAt(path, i, coord) {
    const X = (n) => coord === "live" ? n.x : n.ox;
    const Y = (n) => coord === "live" ? n.y : n.oy;
    const nodes = path.nodes;
    const count = nodes.length;
    const n = nodes[i];
    if (count === 1)
      return { x: X(n), y: Y(n), ux: 1, uy: 0 };
    if (!path.closed && (i === 0 || i === count - 1)) {
      const o = nodes[i === 0 ? 1 : count - 2];
      const sx = i === 0 ? X(o) - X(n) : X(n) - X(o);
      const sy = i === 0 ? Y(o) - Y(n) : Y(n) - Y(o);
      const l = Math.hypot(sx, sy) || 1;
      return { x: X(n), y: Y(n), ux: sx / l, uy: sy / l };
    }
    const prev = nodes[(i - 1 + count) % count];
    const next = nodes[(i + 1) % count];
    const start = !path.closed && i === 1 ? [X(prev), Y(prev)] : [(X(prev) + X(n)) / 2, (Y(prev) + Y(n)) / 2];
    const end = [(X(n) + X(next)) / 2, (Y(n) + Y(next)) / 2];
    const tx = end[0] - start[0];
    const ty = end[1] - start[1];
    const l = Math.hypot(tx, ty) || 1;
    return {
      x: start[0] * 0.25 + X(n) * 0.5 + end[0] * 0.25,
      y: start[1] * 0.25 + Y(n) * 0.5 + end[1] * 0.25,
      ux: tx / l,
      uy: ty / l
    };
  }
  function ribsFor(body) {
    if (Array.isArray(body.ribs))
      return body.ribs;
    const uses = new Map;
    for (const path of body.paths)
      for (const n of path.nodes)
        uses.set(n, (uses.get(n) ?? 0) + 1);
    const visible = (x, y) => body.nodes.every((m) => Math.hypot(m.ox - x, m.oy - y) >= m.r * 0.97);
    const sides = (path, i) => {
      const { x, y, ux, uy } = spineAt(path, i, "rest");
      const r = path.nodes[i].r;
      return [
        [x - uy * r, y + ux * r],
        [x + uy * r, y - ux * r]
      ];
    };
    const ribs = [];
    const taken = [];
    for (const path of body.paths) {
      if (path.closed || path.nodes.length < 2)
        continue;
      for (const i of [0, path.nodes.length - 1]) {
        if (uses.get(path.nodes[i]) !== 1)
          continue;
        const pts = sides(path, i);
        ribs.push({
          path,
          i,
          end: true,
          shown: [visible(...pts[0]), visible(...pts[1])]
        });
        taken.push(...pts);
      }
    }
    for (const path of body.paths) {
      const nodes = path.nodes;
      let travelled = path.closed ? Infinity : 0;
      for (let i = 1;i < nodes.length; i++) {
        travelled += Math.hypot(nodes[i].ox - nodes[i - 1].ox, nodes[i].oy - nodes[i - 1].oy);
        const r = nodes[i].r;
        if (travelled < r * 4 || !path.closed && i > nodes.length - 3)
          continue;
        const pts = sides(path, i);
        if (!pts.every((p) => visible(...p)))
          continue;
        if (taken.some(([x, y]) => pts.some(([px, py]) => Math.hypot(x - px, y - py) < r * 0.6)))
          continue;
        travelled = 0;
        ribs.push({ path, i, end: false, shown: [true, true] });
        taken.push(...pts);
      }
    }
    body.ribs = ribs;
    return ribs;
  }
  function drawWire(ctx, body, spines) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = WIRE.line;
    body.paths.forEach((p, i) => {
      ctx.lineWidth = p.radius * 2 + 1.1;
      ctx.stroke(spines[i]);
    });
    ctx.globalCompositeOperation = "destination-out";
    body.paths.forEach((p, i) => {
      ctx.lineWidth = Math.max(0.5, p.radius * 2 - 1.1);
      ctx.stroke(spines[i]);
    });
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 1;
    ctx.fillStyle = WIRE.fill;
    const marks = [];
    const ribs = ribsFor(body);
    for (const rib of ribs) {
      const { x, y, ux, uy } = spineAt(rib.path, rib.i, "live");
      const r = rib.path.nodes[rib.i].r;
      const a = [x - uy * r, y + ux * r];
      const c = [x + uy * r, y - ux * r];
      if (rib.shown[0] && rib.shown[1]) {
        ctx.strokeStyle = WIRE.rib;
        ctx.beginPath();
        ctx.moveTo(...a);
        ctx.lineTo(...c);
        ctx.stroke();
      }
      if (rib.shown[0])
        marks.push([a[0], a[1], ux, uy]);
      if (rib.shown[1])
        marks.push([c[0], c[1], ux, uy]);
    }
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
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = WIRE.handle;
    for (const rib of ribs) {
      if (!rib.end)
        continue;
      const n = rib.path.nodes[rib.i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  function draw(ctx, world, options) {
    const { width, height } = world;
    ctx.setTransform(options.ratio, 0, 0, options.ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
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
    return {
      mask,
      w,
      h,
      originX: PAD + left,
      originY: PAD + ascent,
      advance: m.width / resolution
    };
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
      nodes.push({
        id,
        x: sx / members.length,
        y: sy / members.length,
        r: sr,
        edges: []
      });
    }
    const edges = [];
    const visited = new Uint8Array(w * h);
    const center = (i) => ({
      x: i % w + 0.5,
      y: Math.floor(i / w) + 0.5
    });
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
        const points = [
          { x: nodes[from].x, y: nodes[from].y },
          center(q)
        ];
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
          ends.push({
            edge: id,
            side: 0,
            dir: directionAt(e.points, true, reach)
          });
        if (e.b === node.id)
          ends.push({
            edge: id,
            side: 1,
            dir: directionAt(e.points, false, reach)
          });
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
        partner.set(`${ends[i].edge}:${ends[i].side}`, [
          ends[j].edge,
          ends[j].side
        ]);
        partner.set(`${ends[j].edge}:${ends[j].side}`, [
          ends[i].edge,
          ends[i].side
        ]);
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
          next[i] = {
            x: pts[i].x * 0.5 + (a.x + b.x) * 0.25,
            y: pts[i].y * 0.5 + (a.y + b.y) * 0.25
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
        closed: stroke.closed
      };
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
  function skeletonise(grapheme, options) {
    const resolution = options.resolution ?? 160;
    const font = `${options.weight} ${resolution}px ${options.family}`;
    const key = `${font}\x00${grapheme}`;
    const hit = cache.get(key);
    if (hit)
      return hit;
    const raster = rasterise(grapheme, font, resolution);
    const { mask, w, h } = raster;
    const dist = distanceTransform(mask, w, h);
    const img = mask.slice();
    thin(img, w, h);
    removeStaircases(img, w, h);
    keepDots(mask, img, dist, w, h);
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
    const toEm = (p) => ({
      x: (p.x - raster.originX) / resolution,
      y: (p.y - raster.originY) / resolution
    });
    const emStrokes = smoothed.map((s, i) => ({
      closed: s.closed,
      radius: strokeRadii[i] / resolution,
      points: s.points.map(toEm)
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
        const visit = (j) => {
          if (!open[j] || label[j])
            return;
          label[j] = id;
          stack.push(j);
        };
        if (x > 0)
          visit(i - 1);
        if (x < w - 1)
          visit(i + 1);
        if (y > 0)
          visit(i - w);
        if (y < h - 1)
          visit(i + w);
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
    const result = {
      ...skeleton,
      strokes,
      radius: skeleton.radius * k,
      bounds: { minX, maxX, minY, maxY }
    };
    weighed.set(key, result);
    return result;
  }
  function circle(grapheme) {
    const r = 0.2;
    const ring = r * 0.8;
    const cx = r + ring;
    const cy = -(r + ring);
    const points = Array.from({ length: 24 }, (_, i) => {
      const a = i / 24 * Math.PI * 2;
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
        maxY: cy + reach
      },
      area: Math.PI * reach * reach
    };
  }

  // src/text.ts
  var segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  var graphemes = (text) => Array.from(segmenter.segment(text), (s) => s.segment);
  var isBreak = (g) => g === `
` || g === `\r
` || g === "\r";
  var isSpace = (g) => !isBreak(g) && /^\s+$/u.test(g);
  var isEmoji = (g) => /\p{Emoji_Presentation}|\p{Regional_Indicator}|️|⃣/u.test(g);
  function reconcile(old, next, make) {
    let start = 0;
    while (start < old.length && start < next.length && old[start].grapheme === next[start])
      start++;
    let tail = 0;
    while (tail < old.length - start && tail < next.length - start && old[old.length - 1 - tail].grapheme === next[next.length - 1 - tail])
      tail++;
    const removed = old.slice(start, old.length - tail);
    const added = next.slice(start, next.length - tail).map(make);
    return {
      entries: [
        ...old.slice(0, start),
        ...added,
        ...old.slice(old.length - tail)
      ],
      removed,
      added
    };
  }

  // src/controller.ts
  var MIN_PEN = 0.085;
  var HOLD_DELAY = 150;
  var HOLD_GROW = 1100;
  var HOLD_SHAKE = 600;
  var HOLD_SIZE = 2;

  class SoftTypeController {
    root;
    canvas;
    ctx;
    input;
    options;
    world;
    entries = [];
    layout = null;
    nextId = 1;
    topZ = 0;
    width = 0;
    height = 0;
    ratio = 1;
    raf = 0;
    previous = 0;
    accumulator = 0;
    quiet = 0;
    version = 0;
    blueprint = false;
    instant = false;
    pointerId = null;
    press = null;
    moved = false;
    audio = null;
    caret = { x: 0, y: 0, h: 0, vx: 0, vy: 0, placed: false };
    typedAt = 0;
    blinkTimer = 0;
    reduced = matchMedia("(prefers-reduced-motion: reduce)");
    observer;
    cleanups = [];
    constructor(root, options) {
      this.root = root;
      this.options = options;
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("aria-hidden", "true");
      this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:text";
      const ctx = this.canvas.getContext("2d");
      if (!ctx)
        throw new Error("soft-type: 2D canvas unavailable");
      this.ctx = ctx;
      this.input = document.createElement("textarea");
      this.input.style.cssText = "position:absolute;left:0;top:0;width:1px;height:1px;padding:0;border:0;margin:0;opacity:0;resize:none;overflow:hidden;font-size:16px;pointer-events:none";
      this.input.setAttribute("autocapitalize", "off");
      this.input.setAttribute("autocomplete", "off");
      this.input.setAttribute("autocorrect", "off");
      this.input.spellcheck = false;
      this.input.setAttribute("aria-label", options.ariaLabel);
      this.input.value = options.value;
      root.append(this.canvas, this.input);
      this.world = new World(1, 1);
      this.world.reducedMotion = this.reduced.matches;
      this.bind();
      this.observer = new ResizeObserver(() => this.resize());
      this.observer.observe(root);
      this.resize();
    }
    listen(target, type, fn) {
      target.addEventListener(type, fn);
      this.cleanups.push(() => target.removeEventListener(type, fn));
    }
    bind() {
      this.listen(this.input, "input", () => this.onInput());
      this.listen(this.input, "focus", () => this.wakeCaret());
      this.listen(this.input, "blur", () => this.render());
      this.listen(this.input, "keyup", () => this.wakeCaret());
      this.listen(this.input, "keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          this.relayout();
        }
      });
      const selection = () => {
        if (document.activeElement === this.input)
          this.wakeCaret();
      };
      document.addEventListener("selectionchange", selection);
      this.cleanups.push(() => document.removeEventListener("selectionchange", selection));
      this.listen(this.canvas, "pointerdown", (e) => this.onPointerDown(e));
      this.listen(this.canvas, "pointermove", (e) => this.onPointerMove(e));
      const end = (e) => this.onPointerUp(e);
      this.listen(this.canvas, "pointerup", end);
      this.listen(this.canvas, "pointercancel", end);
      this.listen(this.canvas, "lostpointercapture", end);
      this.listen(this.canvas, "pointerleave", () => this.canvas.style.setProperty("cursor", "text"));
      const motion = () => {
        this.world.reducedMotion = this.reduced.matches;
        this.wake();
      };
      this.reduced.addEventListener("change", motion);
      this.cleanups.push(() => this.reduced.removeEventListener("change", motion));
      const visibility = () => {
        this.release();
        if (document.hidden) {
          cancelAnimationFrame(this.raf);
          this.raf = 0;
        } else
          this.wake();
      };
      document.addEventListener("visibilitychange", visibility);
      this.cleanups.push(() => document.removeEventListener("visibilitychange", visibility));
    }
    update(options) {
      const reshaped = options.fontFamily !== this.options.fontFamily || options.fontWeight !== this.options.fontWeight || options.weight !== this.options.weight;
      const resized = options.squeeze !== this.options.squeeze || options.breakWords !== this.options.breakWords;
      this.options = options;
      this.input.setAttribute("aria-label", options.ariaLabel);
      if (reshaped) {
        for (const entry of this.entries) {
          if (entry.body)
            this.world.drop(entry.body);
          entry.body = null;
        }
        this.instant = true;
      }
      if (options.value !== this.input.value) {
        this.input.value = options.value;
        this.sync();
      } else if (reshaped || resized)
        this.sync();
      else
        this.render();
    }
    font() {
      return `${this.options.fontWeight} 160px ${this.options.fontFamily}`;
    }
    onInput() {
      const parts = graphemes(this.input.value);
      if (parts.length > this.options.maxLength) {
        const at = this.input.selectionStart;
        this.input.value = parts.slice(0, this.options.maxLength).join("");
        this.input.setSelectionRange(Math.min(at, this.input.value.length), Math.min(at, this.input.value.length));
      }
      this.typedAt = performance.now();
      this.options.onValueChange?.(this.input.value);
      this.sync();
    }
    sync() {
      const { entries, removed, added } = reconcile(this.entries, graphemes(this.input.value), (grapheme) => ({
        id: this.nextId++,
        grapheme,
        body: null,
        built: 0
      }));
      for (const entry of removed)
        entry.body?.remove();
      this.entries = entries;
      const version = ++this.version;
      const font = this.font();
      const text = added.map((e) => e.grapheme).join("");
      if (text && !document.fonts.check(font, text)) {
        document.fonts.load(font, text).then(() => version === this.version && this.relayout(), () => version === this.version && this.relayout());
        return;
      }
      this.relayout();
    }
    relayout() {
      if (!this.width || !this.height)
        return;
      const items = this.entries.map((e) => {
        if (isBreak(e.grapheme))
          return { kind: "newline", id: e.id };
        if (isSpace(e.grapheme))
          return { kind: "space", id: e.id };
        if (isEmoji(e.grapheme))
          return { kind: "glyph", id: e.id, skeleton: circle(e.grapheme) };
        const skeleton = skeletonise(e.grapheme, {
          family: this.options.fontFamily,
          weight: this.options.fontWeight
        });
        return {
          kind: "glyph",
          id: e.id,
          skeleton: weigh(skeleton, this.options.weight, MIN_PEN)
        };
      });
      this.layout = layoutText(items, this.width, this.height, {
        squeeze: this.options.squeeze,
        breakWords: this.options.breakWords
      });
      let shrink = 1;
      for (const entry of this.entries) {
        const pose = this.layout.poses.get(entry.id);
        if (pose && entry.body && !entry.body.leaving)
          shrink = Math.min(shrink, pose.size / entry.built / entry.body.layout.target);
      }
      const wait = shrink < 0.92 ? 12 : 0;
      let spawned = 0;
      for (const entry of this.entries) {
        const pose = this.layout.poses.get(entry.id);
        if (!pose)
          continue;
        if (!entry.body) {
          const item = items.find((i) => i.id === entry.id);
          if (item?.kind !== "glyph" || !item.skeleton.strokes.length)
            continue;
          entry.body = new Body(entry.id, item.skeleton, pose);
          entry.built = pose.size;
          entry.body.z = ++this.topZ;
          if (!this.instant)
            entry.body.spawn(wait + spawned * 2);
          this.world.place(entry.body, pose.x, pose.y, 1);
          if (this.reduced.matches && entry.body.puff)
            entry.body.puff.damping = 30;
          this.world.add(entry.body);
          spawned++;
        } else
          this.world.place(entry.body, pose.x, pose.y, pose.size / entry.built);
      }
      if (spawned && this.options.sound && !this.instant)
        this.tick(spawned);
      this.instant = false;
      this.wake();
    }
    resize() {
      const rect = this.root.getBoundingClientRect();
      const width = Math.max(40, Math.round(rect.width));
      const height = Math.max(40, Math.round(rect.height));
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (width === this.width && height === this.height && ratio === this.ratio)
        return;
      this.release();
      this.width = width;
      this.height = height;
      this.ratio = ratio;
      this.canvas.width = Math.round(width * ratio);
      this.canvas.height = Math.round(height * ratio);
      this.world.resize(width, height);
      if (!this.entries.length && this.input.value)
        this.sync();
      else
        this.relayout();
    }
    point(e) {
      const rect = this.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    onPointerDown(e) {
      if (e.button !== 0 || this.pointerId !== null)
        return;
      const p = this.point(e);
      const body = this.world.hit(p.x, p.y);
      this.moved = false;
      this.pointerId = e.pointerId;
      this.canvas.setPointerCapture(e.pointerId);
      if (!body)
        return;
      e.preventDefault();
      this.world.grab(body, p.x, p.y);
      body.z = ++this.topZ;
      this.press = {
        body,
        x: p.x,
        y: p.y,
        start: null,
        live: true,
        dx: 0,
        dy: 0
      };
      this.wakeAudio();
      this.canvas.style.setProperty("cursor", "grabbing");
      this.wake();
    }
    onPointerMove(e) {
      if (this.pointerId !== null && e.pointerId !== this.pointerId)
        return;
      const p = this.point(e);
      if (this.press?.live && Math.hypot(p.x - this.press.x, p.y - this.press.y) > 8) {
        this.endPress();
        this.moved = true;
      }
      const drag = this.world.drag;
      if (drag) {
        drag.x = Math.max(5, Math.min(this.width - 5, p.x));
        drag.y = Math.max(5, Math.min(this.height - 5, p.y));
        this.wake();
      } else if (this.pointerId === null)
        this.canvas.style.setProperty("cursor", this.world.hit(p.x, p.y) ? "grab" : "text");
    }
    onPointerUp(e) {
      if (e.pointerId !== this.pointerId)
        return;
      const wasDrag = this.moved;
      this.release();
      if (!wasDrag && document.activeElement !== this.input)
        this.input.focus({ preventScroll: true });
      this.wake();
    }
    release() {
      this.endPress();
      this.world.release();
      const id = this.pointerId;
      this.pointerId = null;
      if (id !== null && this.canvas.hasPointerCapture(id))
        this.canvas.releasePointerCapture(id);
      this.canvas.style.setProperty("cursor", "text");
    }
    endPress() {
      if (this.press?.live)
        this.press.body.inflate(1);
      this.press = null;
    }
    stepPress(time) {
      const press = this.press;
      if (!press?.live)
        return;
      press.start ??= time;
      const t = time - press.start - HOLD_DELAY;
      if (t <= 0)
        return;
      const u = Math.min(1, t / HOLD_GROW);
      const eased = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2;
      press.body.inflate(1 + (HOLD_SIZE - 1) * eased);
      const shake = t - HOLD_GROW;
      if (shake > 0 && shake < HOLD_SHAKE && !this.reduced.matches) {
        const amount = 2 + 4 * shake / HOLD_SHAKE;
        const dx = Math.sin(shake * 0.15) * amount;
        const dy = Math.cos(shake * 0.11) * amount * 0.6;
        for (const n of press.body.nodes) {
          n.x += dx - press.dx;
          n.y += dy - press.dy;
        }
        press.dx = dx;
        press.dy = dy;
      } else if (shake >= HOLD_SHAKE) {
        press.body.inflate(1, true);
        this.pop(press.body);
        press.live = false;
        this.blueprint = !this.blueprint;
        this.root.dataset.blueprint = String(this.blueprint);
      }
    }
    wakeAudio() {
      if (!this.options.sound)
        return;
      this.audio ??= new AudioContext;
      if (this.audio.state === "suspended")
        this.audio.resume();
    }
    pop(body) {
      const audio = this.audio;
      if (!audio || !this.options.sound || this.reduced.matches)
        return;
      const now = audio.currentTime;
      const bodies = this.world.bodies;
      const average = bodies.reduce((s, b) => s + b.radius, 0) / (bodies.length || 1);
      const pitch = 760 * Math.sqrt(average / Math.max(1, body.radius));
      const tone = audio.createOscillator();
      const level = audio.createGain();
      tone.type = "sine";
      tone.frequency.setValueAtTime(pitch, now);
      tone.frequency.exponentialRampToValueAtTime(pitch * 0.22, now + 0.13);
      level.gain.setValueAtTime(0.0001, now);
      level.gain.exponentialRampToValueAtTime(0.22, now + 0.006);
      level.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      tone.connect(level).connect(audio.destination);
      tone.start(now);
      tone.stop(now + 0.22);
      const click = audio.createBuffer(1, Math.round(audio.sampleRate * 0.012), audio.sampleRate);
      const data = click.getChannelData(0);
      for (let i = 0;i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
      const burst = audio.createBufferSource();
      const filter = audio.createBiquadFilter();
      const clickLevel = audio.createGain();
      burst.buffer = click;
      filter.type = "highpass";
      filter.frequency.value = 1800;
      clickLevel.gain.value = 0.06;
      burst.connect(filter).connect(clickLevel).connect(audio.destination);
      burst.start(now);
    }
    tick(count) {
      const audio = this.audio;
      if (!audio || audio.state !== "running" || this.reduced.matches)
        return;
      const now = audio.currentTime;
      const tone = audio.createOscillator();
      const level = audio.createGain();
      const pitch = 980 + Math.random() * 120;
      tone.type = "sine";
      tone.frequency.setValueAtTime(pitch, now);
      tone.frequency.exponentialRampToValueAtTime(pitch * 0.5, now + 0.07);
      level.gain.setValueAtTime(0.0001, now);
      level.gain.exponentialRampToValueAtTime(Math.min(0.08, 0.04 * count), now + 0.004);
      level.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      tone.connect(level).connect(audio.destination);
      tone.start(now);
      tone.stop(now + 0.1);
    }
    caretIndex() {
      const at = this.input.selectionEnd;
      let offset = 0;
      let index = 0;
      for (const entry of this.entries) {
        if (offset >= at)
          break;
        offset += entry.grapheme.length;
        index++;
      }
      return index;
    }
    caretTarget() {
      const layout = this.layout;
      if (!layout)
        return null;
      const index = this.caretIndex();
      const slot = layout.slots[Math.min(index, layout.slots.length - 1)];
      const gap = layout.size * 0.06;
      const prev = this.entries[index - 1];
      if (prev?.body && !prev.body.leaving)
        return { x: prev.body.bounds.maxX + gap, y: slot.y, h: slot.h };
      const next = this.entries[index];
      if (next?.body && !next.body.leaving && (!prev || isBreak(prev.grapheme)))
        return { x: next.body.bounds.minX - gap, y: slot.y, h: slot.h };
      return slot;
    }
    caretState(time) {
      if (document.activeElement !== this.input)
        return null;
      const target = this.caretTarget();
      if (!target)
        return null;
      const c = this.caret;
      if (!c.placed || this.reduced.matches) {
        Object.assign(c, {
          x: target.x,
          y: target.y,
          h: target.h,
          vx: 0,
          vy: 0,
          placed: true
        });
      } else {
        c.vx += ((target.x - c.x) * 500 - c.vx * 40) / 60;
        c.vy += ((target.y - c.y) * 500 - c.vy * 40) / 60;
        c.x += c.vx / 60;
        c.y += c.vy / 60;
        c.h += (target.h - c.h) * 0.3;
      }
      const since = time - this.typedAt;
      const alpha = since < 500 || since % 1100 < 550 ? 1 : 0;
      return { x: c.x, y: c.y, h: c.h, alpha };
    }
    wakeCaret() {
      this.typedAt = performance.now();
      this.render();
    }
    render(time = performance.now()) {
      const caret = this.caretState(time);
      draw(this.ctx, this.world, {
        ratio: this.ratio,
        theme: this.options.theme,
        blueprint: this.blueprint,
        caret
      });
      clearTimeout(this.blinkTimer);
      if (!this.raf && caret) {
        const since = time - this.typedAt;
        const wait = since < 500 ? 500 - since : 550 - (since - 500) % 550;
        this.blinkTimer = window.setTimeout(() => this.render(), Math.max(16, wait));
      }
    }
    wake() {
      this.quiet = 0;
      if (!this.raf && !document.hidden) {
        this.previous = 0;
        this.raf = requestAnimationFrame((t) => this.frame(t));
      }
    }
    frame(time) {
      this.raf = 0;
      if (document.hidden) {
        this.previous = 0;
        return;
      }
      this.accumulator = Math.min(1000 / 60, this.accumulator + Math.min(time - (this.previous || time - 16.67), 33.34));
      this.previous = time;
      this.stepPress(time);
      let changing = false;
      while (this.accumulator >= 1000 / 60) {
        if (this.world.step())
          changing = true;
        this.accumulator -= 1000 / 60;
      }
      const caretMoving = Math.hypot(this.caret.vx, this.caret.vy) > 0.5;
      this.quiet = !changing && !caretMoving && !this.world.drag && !this.press?.live && !this.world.busy && this.world.energy < 0.08 ? this.quiet + 1 : 0;
      if (this.quiet < 40)
        this.raf = requestAnimationFrame((t) => this.frame(t));
      else {
        this.world.sleep();
        this.previous = 0;
        this.accumulator = 0;
      }
      this.render(time);
    }
    destroy() {
      cancelAnimationFrame(this.raf);
      clearTimeout(this.blinkTimer);
      this.observer.disconnect();
      for (const fn of this.cleanups)
        fn();
      this.canvas.remove();
      this.input.remove();
      this.audio?.close();
    }
  }

  // src/play-entry.ts
  var root = document.getElementById("stage");
  if (root) {
    const params = new URLSearchParams(location.search);
    const controller = new SoftTypeController(root, {
      value: params.get("text") ?? "Soft type",
      fontFamily: '"Nunito", ui-rounded, system-ui, sans-serif',
      fontWeight: Number(params.get("weight") ?? 1000),
      theme: { ink: "#000", paper: "#fff" },
      squeeze: Number(params.get("squeeze") ?? 1.05),
      weight: Number(params.get("pen") ?? 1.2),
      breakWords: true,
      maxLength: 64,
      sound: true,
      ariaLabel: "Type to add letters"
    });
    Object.assign(window, { softType: controller });
    const proxies = document.createElement("div");
    proxies.style.cssText = "position:fixed;inset:0;pointer-events:none";
    document.body.append(proxies);
    const track = () => {
      const entries = controller.entries;
      const letters = entries.flatMap((e) => e.body && !e.body.leaving ? [{ x: e.body.cx, y: e.body.cy }] : []);
      while (proxies.children.length < letters.length) {
        const el = document.createElement("div");
        el.style.cssText = "position:absolute;width:4px;height:4px;margin:-2px 0 0 -2px";
        proxies.append(el);
      }
      [...proxies.children].forEach((el, i) => {
        const letter = letters[i];
        if (!(el instanceof HTMLElement))
          return;
        el.dataset.letter = letter ? String(i) : "";
        el.style.left = `${letter?.x ?? -10}px`;
        el.style.top = `${letter?.y ?? -10}px`;
      });
      requestAnimationFrame(track);
    };
    track();
    document.fonts.ready.then(() => document.body.setAttribute("data-ready", "1"));
  }
})();

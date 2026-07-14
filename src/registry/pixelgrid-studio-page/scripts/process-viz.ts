import { getScrollParent } from "./scroll-adapter";

/**
 * The process (Explore/Generate/Refine/Scale) and protocol-part (Truth/
 * Skills/Output/Check) donut visuals on every canvas[data-viz]: four small
 * generative fields plus a cursor-reactive diamond tessellation.
 */
export function initProcessViz(root: HTMLElement): () => void {
  const HEAT = ["#1c2541", "#3b5bd9", "#f5c518", "#e0492a"];
  const NEON = "#d8ff00";
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const PX = 6;
  function mix(a: string, b: string, t: number) {
    const ar = Number.parseInt(a.slice(1, 3), 16);
    const ag = Number.parseInt(a.slice(3, 5), 16);
    const ab = Number.parseInt(a.slice(5, 7), 16);
    const br = Number.parseInt(b.slice(1, 3), 16);
    const bg = Number.parseInt(b.slice(3, 5), 16);
    const bb = Number.parseInt(b.slice(5, 7), 16);
    return `rgb(${(ar + (br - ar) * t) | 0},${(ag + (bg - ag) * t) | 0},${(ab + (bb - ab) * t) | 0})`;
  }
  function rnd(s: number) {
    const x = Math.sin(s * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  type Item = {
    cv: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    kind: string;
    host: Element | null;
    w: number;
    h: number;
    t: number;
    on: boolean;
    hov: boolean;
    st: unknown;
    pmx: number;
    pmy: number;
    pin: boolean;
    pstr: number;
    size: () => void;
  };
  const items: Item[] = [];
  const cleanups: Array<() => void> = [];

  for (const cv of Array.from(
    root.querySelectorAll<HTMLCanvasElement>("canvas[data-viz]"),
  )) {
    const host =
      cv.closest(".donut") ?? cv.closest(".slide") ?? cv.parentElement;
    const ctx = cv.getContext("2d");
    if (!ctx) continue;
    const o: Item = {
      cv,
      ctx,
      kind: cv.getAttribute("data-viz") ?? "",
      host,
      w: 0,
      h: 0,
      t: Math.random() * 1000,
      on: true,
      hov: false,
      st: null,
      pmx: 0,
      pmy: 0,
      pin: false,
      pstr: 0,
      size: () => {},
    };
    function size() {
      const r = cv.getBoundingClientRect();
      if (r.width < 2) return;
      o.w = r.width;
      o.h = r.height;
      cv.width = Math.round(r.width * DPR);
      cv.height = Math.round(r.height * DPR);
      o.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      o.st = null;
    }
    o.size = size;
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    cleanups.push(() => ro.disconnect());
    if (/^(truth|skills|output|check)$/.test(o.kind)) {
      const onMove = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        o.pmx = e.clientX - r.left;
        o.pmy = e.clientY - r.top;
        o.pin = true;
        o.hov = true;
      };
      const onLeave = () => {
        o.pin = false;
        o.hov = false;
      };
      cv.addEventListener("pointermove", onMove, { passive: true });
      cv.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        cv.removeEventListener("pointermove", onMove);
        cv.removeEventListener("pointerleave", onLeave);
      });
    }
    items.push(o);
  }

  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        for (const o of items) {
          if (o.host === e.target) o.on = e.isIntersecting;
        }
      }
    },
    { root: getScrollParent(root), threshold: 0.02 },
  );
  for (const o of items) if (o.host) io.observe(o.host);
  cleanups.push(() => io.disconnect());

  const PROC_OR_PROTO =
    /^(explore|generate|refine|scale|truth|skills|output|check)$/;
  function bg(o: Item) {
    o.ctx.clearRect(0, 0, o.w, o.h);
    if (PROC_OR_PROTO.test(o.kind)) return;
    o.ctx.fillStyle = "#fff";
    o.ctx.fillRect(0, 0, o.w, o.h);
  }
  function grid(o: Item) {
    if (PROC_OR_PROTO.test(o.kind)) return;
    const c = o.ctx;
    c.strokeStyle = "#fafafa";
    c.lineWidth = 1;
    c.beginPath();
    for (let x = 0; x <= o.w; x += 14) {
      c.moveTo(x + 0.5, 0);
      c.lineTo(x + 0.5, o.h);
    }
    for (let y = 0; y <= o.h; y += 14) {
      c.moveTo(0, y + 0.5);
      c.lineTo(o.w, y + 0.5);
    }
    c.stroke();
  }
  function px(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    col: string,
    a: number,
  ) {
    c.globalAlpha = a;
    c.fillStyle = col;
    c.fillRect(
      Math.round(x / PX) * PX,
      Math.round(y / PX) * PX,
      PX - 1,
      PX - 1,
    );
  }
  type Star = { x: number; y: number; a: number; col: string };
  function explore(o: Item) {
    const c = o.ctx;
    const N = 30;
    const sp = o.hov ? 2.0 : 0.95;
    if (!o.st) {
      const st: Star[] = [];
      for (let i = 0; i < N; i++) {
        st.push({
          x: rnd(i + 1) * o.w,
          y: rnd(i + 7) * o.h,
          a: rnd(i + 3) * 6.28,
          col: HEAT[i % 4],
        });
      }
      o.st = st;
    }
    bg(o);
    grid(o);
    const st = o.st as Star[];
    for (let i = 0; i < st.length; i++) {
      const d = st[i];
      d.a += (rnd(i + ((o.t * 0.002) | 0)) - 0.5) * 0.6;
      d.x += Math.cos(d.a) * sp;
      d.y += Math.sin(d.a) * sp;
      if (d.x < 6) {
        d.x = 6;
        d.a = Math.PI - d.a;
      }
      if (d.x > o.w - 6) {
        d.x = o.w - 6;
        d.a = Math.PI - d.a;
      }
      if (d.y < 6) {
        d.y = 6;
        d.a = -d.a;
      }
      if (d.y > o.h - 6) {
        d.y = o.h - 6;
        d.a = -d.a;
      }
      px(c, d.x, d.y, d.col, 1);
    }
    c.globalAlpha = 1;
  }
  function generate(o: Item) {
    const c = o.ctx;
    const cell = PX;
    const cols = Math.ceil(o.w / cell);
    const nr = Math.ceil(o.h / cell) + 1;
    bg(o);
    grid(o);
    const tt = o.t * (o.hov ? 0.011 : 0.0055);
    for (let cx = 0; cx < cols; cx++) {
      if (rnd(cx + 3) > 0.45) continue;
      const speed = 0.45 + rnd(cx + 1) * 0.8;
      const off = (tt * speed) % 1;
      const hot = rnd(cx * 5) > 0.72;
      for (let y = 0; y < nr; y++) {
        if (rnd(cx * 7 + y) > 0.45) continue;
        const yy = (y + off * nr) % nr;
        const py = yy * cell;
        const a = 1 - yy / nr;
        c.globalAlpha = 0.5 * a;
        c.fillStyle =
          hot && rnd(cx + y * 3) > 0.55 ? HEAT[(rnd(cx) * 4) | 0] : "#1c2541";
        c.fillRect(cx * cell, py, cell - 1, cell - 1);
      }
    }
    c.globalAlpha = 1;
  }
  type RStar = { a: number; nx: number; ny: number };
  function refine(o: Item) {
    const c = o.ctx;
    const N = 120;
    if (!o.st) {
      const st: RStar[] = [];
      for (let i = 0; i < N; i++)
        st.push({ a: (i / N) * 6.28, nx: rnd(i + 1), ny: rnd(i + 5) });
      o.st = st;
    }
    bg(o);
    grid(o);
    const cyc = Math.sin(o.t * 0.001 * (o.hov ? 1.6 : 0.7)) * 0.5 + 0.5;
    const cx = o.w / 2;
    const cy = o.h / 2;
    const R = Math.min(o.w, o.h) * 0.32;
    const st = o.st as RStar[];
    for (let i = 0; i < st.length; i++) {
      const d = st[i];
      const tx = cx + Math.cos(d.a) * R;
      const ty = cy + Math.sin(d.a) * R;
      const nx = cx + (d.nx - 0.5) * o.w * 0.92;
      const ny = cy + (d.ny - 0.5) * o.h * 0.92;
      const x = nx + (tx - nx) * cyc;
      const y = ny + (ty - ny) * cyc;
      px(c, x, y, cyc > 0.82 ? "#1c2541" : HEAT[i % 4], 0.3 + cyc * 0.7);
    }
    c.globalAlpha = 1;
  }
  function scale(o: Item) {
    const c = o.ctx;
    const cell = PX * 2;
    const cols = Math.ceil(o.w / cell);
    const rows = Math.ceil(o.h / cell);
    bg(o);
    grid(o);
    const wave = (o.t * 0.001 * (o.hov ? 1.3 : 0.6)) % 2.6;
    const cx = o.w / 2;
    const cy = o.h / 2;
    const maxd = Math.hypot(cx, cy);
    for (let r = 0; r < rows; r++) {
      for (let cc = 0; cc < cols; cc++) {
        const x = cc * cell + cell / 2;
        const y = r * cell + cell / 2;
        const dd = Math.hypot(x - cx, y - cy) / maxd;
        const act = Math.max(0, 1 - Math.abs(dd * 2.2 - wave) * 3);
        if (act < 0.05) {
          px(c, x, y, "#1c2541", 0.1);
          continue;
        }
        const col =
          act > 0.6
            ? HEAT[3]
            : act > 0.38
              ? HEAT[2]
              : act > 0.18
                ? HEAT[1]
                : HEAT[0];
        px(c, x, y, col, 0.3 + act * 0.7);
      }
    }
    c.globalAlpha = 1;
  }
  const C9 = 9;
  function px9(o: Item, x: number, y: number, col: string, a: number) {
    const c = o.ctx;
    c.globalAlpha = a;
    c.fillStyle = col;
    c.fillRect(
      Math.round(x / C9) * C9,
      Math.round(y / C9) * C9,
      C9 - 1,
      C9 - 1,
    );
  }
  function diam(
    o: Item,
    cx: number,
    cy: number,
    r: number,
    col: string,
    a: number,
  ) {
    const n = Math.round(r / C9);
    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        if (Math.abs(i) + Math.abs(j) <= n)
          px9(o, cx + i * C9, cy + j * C9, col, a);
      }
    }
  }
  function hb(o: Item, x: number, y: number) {
    if (o.pstr <= 0.001) return 0;
    const dx = x - o.pmx;
    const dy = y - o.pmy;
    const R = Math.min(o.w, o.h) * 0.42;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d >= R) return 0;
    const b = 1 - d / R;
    return b * b * o.pstr;
  }
  function rep(
    o: Item,
    cx: number,
    cy: number,
    b: number,
  ): [number, number] | null {
    if (b <= 0) return null;
    const dx = cx - o.pmx;
    const dy = cy - o.pmy;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const R = Math.min(o.w, o.h) * 0.42;
    const push = b * Math.min(o.w, o.h) * 0.3 * Math.min(1, d / (R * 0.4));
    return [cx + (dx / d) * push, cy + (dy / d) * push];
  }
  function dDiam(
    o: Item,
    cx: number,
    cy: number,
    r: number,
    col: string,
    a: number,
  ) {
    const b = hb(o, cx, cy);
    const p = rep(o, cx, cy, b);
    diam(
      o,
      p ? p[0] : cx,
      p ? p[1] : cy,
      r * (1 + b * 0.3),
      b > 0.02 ? mix(col, NEON, Math.min(1, b)) : col,
      a,
    );
  }
  function ss3(x: number) {
    x = x < 0 ? 0 : x > 1 ? 1 : x;
    return x * x * (3 - 2 * x);
  }
  function tessViz(o: Item) {
    const c = o.ctx;
    bg(o);
    grid(o);
    o.pstr += ((o.pin ? 1 : 0) - o.pstr) * 0.14;
    const tt = o.t * 0.001;
    const cx = o.w / 2;
    const cy = o.h / 2;
    const m = Math.min(o.w, o.h);
    const k = o.kind;
    if (k === "truth") {
      const RD = Math.max(C9 * 2, (m * 0.32) | 0);
      const n = Math.round(RD / C9);
      const inner = Math.round(n * 0.42);
      const wave = (1 - ((o.t * 0.0005) % 1)) * (n + 2) - 1;
      for (let i = -n; i <= n; i++) {
        for (let j = -n; j <= n; j++) {
          const d = Math.abs(i) + Math.abs(j);
          if (d > n) continue;
          const base = d <= inner ? HEAT[3] : HEAT[2];
          const pulse = Math.max(0, 1 - Math.abs(d - wave) / 1.6);
          let col = pulse > 0.04 ? mix(base, "#ffffff", pulse * 0.6) : base;
          const cxp = cx + i * C9;
          const cyp = cy + j * C9;
          const bb = hb(o, cxp, cyp);
          const pp = rep(o, cxp, cyp, bb);
          if (bb > 0.02) col = mix(col, NEON, Math.min(1, bb));
          px9(o, pp ? pp[0] : cxp, pp ? pp[1] : cyp, col, 1);
        }
      }
    } else if (k === "skills") {
      const RD2 = Math.max(C9 * 2, (m * 0.19) | 0);
      const step = RD2 + C9 * 2;
      const offs = [
        [0, 0],
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ];
      const gr = ss3((o.t % 3200) / 3200);
      const n = 1 + Math.floor(gr * 4);
      for (let i = 0; i < n; i++) {
        dDiam(
          o,
          cx + offs[i][0] * step,
          cy + offs[i][1] * step,
          (RD2 * 0.7) | 0,
          i ? HEAT[1] : HEAT[2],
          1,
        );
      }
    } else if (k === "output") {
      const rd = Math.max(C9, (m * 0.11) | 0);
      const st = rd + C9;
      const reveal = ss3((o.t % 4000) / 4000);
      for (let x = -st; x < o.w + st; x += st) {
        for (let y = -st; y < o.h + st; y += st) {
          const dd = Math.hypot(x - cx, y - cy) / m;
          if (dd > reveal * 1.4) continue;
          dDiam(
            o,
            x,
            y,
            rd,
            dd < 0.18 ? HEAT[3] : dd < 0.4 ? HEAT[2] : HEAT[1],
            0.95,
          );
        }
      }
    } else {
      const rd2 = Math.max(C9, (m * 0.16) | 0);
      const st2 = rd2 + C9 * 2;
      const sweep = ((tt * 0.4) % 1.3) * o.w;
      for (let x = st2 * 0.5; x < o.w; x += st2) {
        for (let y = st2 * 0.5; y < o.h; y += st2) {
          const lit = Math.abs(x - sweep) < st2 * 0.6;
          const b = hb(o, x, y);
          const pp = rep(o, x, y, b);
          const base = lit ? NEON : x < sweep ? HEAT[2] : "#dcdcdc";
          const col = b > 0.02 ? mix(base, NEON, Math.min(1, b)) : base;
          diam(
            o,
            pp ? pp[0] : x,
            pp ? pp[1] : y,
            rd2 * 0.8 * (1 + b * 0.3),
            col,
            lit ? 1 : x < sweep ? 0.9 : 0.55,
          );
        }
      }
    }
    c.globalAlpha = 1;
  }

  const REND: Record<string, (o: Item) => void> = {
    explore,
    generate,
    refine,
    scale,
    truth: tessViz,
    skills: tessViz,
    output: tessViz,
    check: tessViz,
  };
  let last = 0;
  let rafId = 0;
  function loop(ts: number) {
    const dt = ts - last;
    last = ts;
    for (const o of items) {
      if (!o.w) {
        o.size();
        continue;
      }
      if (!o.on) continue;
      o.t += dt;
      const fn = REND[o.kind];
      if (fn) fn(o);
    }
    rafId = requestAnimationFrame(loop);
  }
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    for (const o of items) o.size();
  });
  rafId = requestAnimationFrame(loop);
  cleanups.push(() => cancelAnimationFrame(rafId));

  return () => {
    for (const c of cleanups) c();
  };
}

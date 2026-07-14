import { getScrollParent } from "./scroll-adapter";

/**
 * Generative pixel-art media for every case-study tile. The source page used
 * real client video here; since we can't (and shouldn't) re-host another
 * studio's client work, every `.csm canvas` renders one of the source's own
 * thermal/dots/fluid/reveal generative-art modes instead, keyed off the
 * slide's `data-fx` attribute.
 */
export function initPreviewFx(root: HTMLElement): () => void {
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const PALS: Record<string, string[]> = {
    heat: ["#1c2541", "#3b5bd9", "#f5c518", "#e0492a"],
    camo: ["#9aa0d6", "#e0552e", "#0A0A0A"],
    warm: ["#7a1020", "#e0492a", "#f5c518"],
  };
  type Fx = { type: string; pal?: string[]; neon?: boolean };
  const FX: Record<string, Fx> = {
    kv: { type: "thermal", pal: PALS.heat, neon: true },
    thermal: { type: "thermal", pal: PALS.warm, neon: false },
    dots: { type: "dots" },
    fluid: { type: "fluid" },
    reveal: { type: "reveal" },
    lab: { type: "thermal", pal: PALS.camo, neon: true },
  };
  function hsh(a: number) {
    const n = Math.sin(a) * 43758.5453;
    return n - Math.floor(n);
  }

  type Item = {
    cv: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    fx: Fx;
    seed: number;
    w: number;
    h: number;
    t: number;
    on: boolean;
    mx: number;
    my: number;
    hov: boolean;
    tm: HTMLCanvasElement;
    tmData: Uint8ClampedArray | null;
    tc: number;
    tr: number;
    cl: number;
    size: () => void;
  };
  const items: Item[] = [];
  const cleanups: Array<() => void> = [];

  for (const cv of Array.from(
    root.querySelectorAll<HTMLCanvasElement>(".caro .slide.cs .csm canvas"),
  )) {
    const slide = cv.closest<HTMLElement>(".slide");
    const fx = FX[slide?.getAttribute("data-fx") ?? "kv"] ?? FX.kv;
    const ctx = cv.getContext("2d");
    if (!ctx) continue;
    const o: Item = {
      cv,
      ctx,
      fx,
      seed: Math.random() * 100,
      w: 0,
      h: 0,
      t: Math.random() * 1000,
      on: true,
      mx: -1,
      my: -1,
      hov: false,
      tm: document.createElement("canvas"),
      tmData: null,
      tc: 0,
      tr: 0,
      cl: 8,
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
      if (fx.type === "reveal") {
        const cl = 8;
        const tc = Math.ceil(r.width / cl);
        const tr = Math.ceil(r.height / cl);
        o.tm.width = tc;
        o.tm.height = tr;
        const m = o.tm.getContext("2d") as CanvasRenderingContext2D;
        m.clearRect(0, 0, tc, tr);
        m.fillStyle = "#000";
        m.textAlign = "center";
        m.textBaseline = "middle";
        m.font = `600 ${tr * 0.46}px "Space Grotesk",sans-serif`;
        m.fillText("BLANK", tc / 2, tr / 2);
        o.tmData = m.getImageData(0, 0, tc, tr).data;
        o.tc = tc;
        o.tr = tr;
        o.cl = cl;
      }
    }
    o.size = size;
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    cleanups.push(() => ro.disconnect());
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      o.mx = e.clientX - r.left;
      o.my = e.clientY - r.top;
      o.hov = true;
    };
    const onLeave = () => {
      o.hov = false;
      o.mx = -1;
    };
    slide?.addEventListener("pointermove", onMove);
    slide?.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      slide?.removeEventListener("pointermove", onMove);
      slide?.removeEventListener("pointerleave", onLeave);
    });
    items.push(o);
  }

  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) {
        for (const o of items) {
          if (o.cv.closest(".slide") === e.target) o.on = e.isIntersecting;
        }
      }
    },
    { root: getScrollParent(root), threshold: 0.01 },
  );
  for (const o of items) {
    const slide = o.cv.closest(".slide");
    if (slide) io.observe(slide);
  }
  cleanups.push(() => io.disconnect());

  function pt(o: Item, tt: number): [number, number] {
    return [
      o.hov && o.mx > 0
        ? o.mx
        : o.w * (0.5 + 0.34 * Math.sin(tt * 0.5 + o.seed)),
      o.hov && o.my > 0
        ? o.my
        : o.h * (0.5 + 0.34 * Math.cos(tt * 0.6 + o.seed)),
    ];
  }
  function grid(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cl: number,
  ) {
    ctx.strokeStyle = "#ededed";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += cl) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
    }
    for (let y = 0; y <= h; y += cl) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
    }
    ctx.stroke();
  }
  function thermal(o: Item) {
    const ctx = o.ctx;
    const w = o.w;
    const h = o.h;
    const tt = o.t * 0.001;
    const s = o.seed;
    const cell = 9;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const pal = o.fx.pal ?? PALS.heat;
    const p = pt(o, tt);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c / cols;
        const ny = r / rows;
        let v =
          0.5 +
          0.5 *
            ((Math.sin(nx * 6 + s + tt * 0.3) *
              Math.cos(ny * 5 - s + tt * 0.2) +
              Math.sin((nx + ny) * 5 + s)) /
              1.6);
        const dx = (c + 0.5) * cell - p[0];
        const dy = (r + 0.5) * cell - p[1];
        const dd = Math.sqrt(dx * dx + dy * dy);
        v += Math.max(0, 1 - dd / 120) * 0.5;
        v += (hsh(c * 12.9 + r * 78.2 + s) - 0.5) * 0.12;
        if (v < 0.34) continue;
        let col = pal[0];
        for (let k = 1; k < pal.length; k++) {
          if (v >= 0.34 + (0.62 * k) / pal.length) col = pal[k];
        }
        if (o.fx.neon && v >= 0.9) col = "#d8ff00";
        ctx.fillStyle = col;
        ctx.fillRect(c * cell, r * cell, cell - 1, cell - 1);
      }
    }
    grid(ctx, w, h, cell);
  }
  function dots(o: Item) {
    const ctx = o.ctx;
    const w = o.w;
    const h = o.h;
    const tt = o.t * 0.001;
    const p = pt(o, tt);
    const step = 14;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    for (let y = step; y < h; y += step) {
      for (let x = step; x < w; x += step) {
        const dx = x - p[0];
        const dy = y - p[1];
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = Math.max(0, 1 - d / 120);
        const ox = x + (dx / d) * f * 16;
        const oy = y + (dy / d) * f * 16;
        const sz = 1.6 + f * 4.5;
        ctx.fillStyle = f > 0.55 ? "#e0492a" : "#0A0A0A";
        ctx.globalAlpha = 0.3 + f * 0.7;
        ctx.fillRect(ox - sz / 2, oy - sz / 2, sz, sz);
      }
    }
    ctx.globalAlpha = 1;
  }
  function fluid(o: Item) {
    const ctx = o.ctx;
    const w = o.w;
    const h = o.h;
    const tt = o.t * 0.001;
    const p = pt(o, tt);
    const step = 15;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 1.4;
    for (let y = step; y < h; y += step) {
      for (let x = step; x < w; x += step) {
        const dx = x - p[0];
        const dy = y - p[1];
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = Math.max(0, 1 - d / 150);
        const a =
          Math.atan2(dy, dx) + Math.PI / 2 + Math.sin(tt + d * 0.02) * 0.6;
        const len = 3 + f * 15;
        ctx.strokeStyle = "#3b5bd9";
        ctx.globalAlpha = 0.14 + f * 0.7;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(a) * len, y - Math.sin(a) * len);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  function reveal(o: Item) {
    const ctx = o.ctx;
    const w = o.w;
    const h = o.h;
    const cl = o.cl || 8;
    const tc = o.tc;
    const tr = o.tr;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    if (!o.tmData) return;
    const sweep = (o.t * 0.00055) % 1.5;
    const tick = Math.floor(o.t * 0.016);
    for (let r = 0; r < tr; r++) {
      for (let c = 0; c < tc; c++) {
        if (o.tmData[(r * tc + c) * 4 + 3] < 60) continue;
        const ra = c / tc;
        if (sweep >= ra) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(c * cl, r * cl, cl - 1, cl - 1);
        } else if (sweep > ra - 0.16) {
          if (hsh(c + tick * 0.7 + r * 3.1) < 0.5) {
            ctx.fillStyle = "#e0552e";
            ctx.fillRect(c * cl, r * cl, cl - 1, cl - 1);
          }
        }
      }
    }
    grid(ctx, w, h, cl);
  }
  function draw(o: Item) {
    const ty = o.fx.type;
    if (ty === "dots") dots(o);
    else if (ty === "fluid") fluid(o);
    else if (ty === "reveal") reveal(o);
    else thermal(o);
  }
  let last = 0;
  let rafId = 0;
  function loop(ts: number) {
    const d = ts - last;
    last = ts;
    for (const o of items) {
      if (!o.w) {
        o.size();
        continue;
      }
      if (!o.on) continue;
      o.t += d;
      draw(o);
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

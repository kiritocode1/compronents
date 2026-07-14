import { getScrollParent } from "./scroll-adapter";

/**
 * Two small standalone flow canvases: the process row's double-helix
 * (#procflow) and the Brand-... err, Component Context Protocol's
 * constellation flow (#bcp-flowviz). Both part their strands around the
 * cursor and spotlight whichever step label is hovered.
 */
export function initFlowCanvases(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];
  const ioRoot = getScrollParent(root);

  initHelix();
  initBcpFlow();

  function initHelix() {
    const cv = root.querySelector<HTMLCanvasElement>("#procflow");
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const DPR = Math.min(devicePixelRatio || 1, 2);
    const CELL = 9;
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let on = true;
    const COOL = "#3b5bd9";
    const YEL = "#f5c518";
    function mix(a: string, b: string, t: number) {
      if (t <= 0) return a;
      if (t >= 1) return b;
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
    function ss(x: number) {
      x = x < 0 ? 0 : x > 1 ? 1 : x;
      return x * x * (3 - 2 * x);
    }
    function prof(x: number) {
      return 0.06 + 0.94 * Math.abs(2 * x - 1) ** 1.2;
    }
    function pick(seed: number, x: number) {
      return rnd(seed) < ss(x) ? YEL : COOL;
    }
    function dep(za: number, rk: number) {
      return Math.max(0, Math.min(1, 0.5 + 0.5 * (za / Math.max(1, rk))));
    }
    function size() {
      const r = cv!.getBoundingClientRect();
      if (r.width < 2) return;
      W = r.width;
      H = r.height;
      cv!.width = Math.round(W * DPR);
      cv!.height = Math.round(H * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      cols = Math.ceil(W / CELL);
      rows = Math.ceil(H / CELL);
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    cleanups.push(() => ro.disconnect());
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) on = e.isIntersecting;
      },
      { root: ioRoot },
    );
    io.observe(cv);
    cleanups.push(() => io.disconnect());

    let pmx = 0;
    let pmy = 0;
    let pstr = 0;
    let ptgt = 0;
    function moveAt(cx: number, cy: number) {
      const r = cv!.getBoundingClientRect();
      pmx = cx - r.left;
      pmy = cy - r.top;
      ptgt = pmx >= -40 && pmx <= W + 40 && pmy >= -40 && pmy <= H + 40 ? 1 : 0;
    }
    const onMove = (e: PointerEvent) => moveAt(e.clientX, e.clientY);
    const onLeave = () => {
      ptgt = 0;
    };
    cv.addEventListener("pointermove", onMove, { passive: true });
    cv.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    });

    let ST = -1;
    const EM = [1, 1, 1, 1];
    function aOf(u: number) {
      if (
        ST < 0 &&
        EM[0] > 0.995 &&
        EM[1] > 0.995 &&
        EM[2] > 0.995 &&
        EM[3] > 0.995
      )
        return 1;
      const g = u * 4 - 0.5;
      const q = Math.floor(g);
      const f = ss(Math.min(1, Math.max(0, (g - q - 0.35) / 0.3)));
      const a0 = EM[Math.max(0, Math.min(3, q))];
      const a1 = EM[Math.max(0, Math.min(3, q + 1))];
      return a0 + (a1 - a0) * f;
    }
    const steps = root.querySelectorAll<HTMLElement>("#process .donuts .step");
    steps.forEach((el, i) => {
      const enter = (e: PointerEvent) => {
        if (e.pointerType !== "touch") ST = i;
      };
      const leave = () => {
        if (ST === i) ST = -1;
      };
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const lw = 62;
        let x = e.clientX - r.left - lw / 2;
        x = Math.max(0, Math.min(r.width - lw, x));
        el.style.setProperty("--lx", `${Math.round(x / 9) * 9}px`);
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("pointermove", move, { passive: true });
      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("pointermove", move);
      });
    });

    const M = 400;
    const turns = 3.2;
    let clk = 0;
    type It = {
      c: number;
      r: number;
      d: number;
      col: string;
      a: number | null;
    };
    function frame() {
      if (!cols) return;
      ctx!.clearRect(0, 0, W, H);
      pstr += (ptgt - pstr) * 0.09;
      const RAD = H * 0.55;
      const AMP = H * 0.42;
      const repel = pstr > 0.01;
      for (let e2 = 0; e2 < 4; e2++) {
        const tg = ST < 0 || ST === e2 ? 1 : 0.16;
        EM[e2] += (tg - EM[e2]) * 0.07;
      }
      const cy = H / 2;
      const R = H * 0.42;
      const items: It[] = [];
      function push(it: {
        sx: number;
        sy: number;
        d: number;
        col: string;
        a: number | null;
      }) {
        if (repel) {
          const dx = it.sx - pmx;
          const dy = it.sy - pmy;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
          if (dist < RAD) {
            const f = (1 - dist / RAD) ** 2 * pstr;
            it.sx += (dx / dist) * f * AMP;
            it.sy += (dy / dist) * f * AMP;
          }
        }
        items.push({
          c: (it.sx / CELL) | 0,
          r: (it.sy / CELL) | 0,
          d: it.d,
          col: it.col,
          a: it.a,
        });
      }
      for (let s = 0; s < 2; s++) {
        const ph0 = s * Math.PI;
        for (let i = 0; i < M; i++) {
          const u = (i / M + clk * 0.0013) % 1;
          const rk = R * prof(u);
          const chaos = (1 - u) ** 1.05;
          const ang =
            u * turns * 6.2832 +
            ph0 +
            (rnd(i * 3.1 + s * 40) - 0.5) * 2.9 * chaos;
          const jr = rk * (1 + (rnd(i * 7.7 + s * 9) - 0.5) * 1.9 * chaos);
          const za = Math.cos(ang) * jr;
          const ya = Math.sin(ang) * jr;
          const depth = dep(za, rk);
          push({
            sx: u * W + za * 0.34,
            sy: cy + ya * 0.92,
            d: depth,
            col: mix("#ffffff", pick(i * 2.3 + s * 70, u), 0.3 + 0.65 * depth),
            a: aOf(u),
          });
        }
      }
      for (let uu = 0; uu < 1; uu += 0.04) {
        const u2 = (uu + clk * 0.0013) % 1;
        if (u2 < 0.5) continue;
        const rk2 = R * prof(u2);
        const ang2 = u2 * turns * 6.2832;
        for (let w = 0; w <= 1.001; w += 0.12) {
          const f2 = 1 - 2 * w;
          const za2 = Math.cos(ang2) * rk2 * f2;
          const ya2 = Math.sin(ang2) * rk2 * f2;
          const depth2 = dep(za2, rk2);
          push({
            sx: u2 * W + za2 * 0.34,
            sy: cy + ya2 * 0.92,
            d: depth2 - 0.01,
            col: mix("#ffffff", YEL, 0.3 + 0.5 * depth2),
            a: aOf(u2),
          });
        }
      }
      items.sort((a, b) => a.d - b.d);
      for (const it of items) {
        if (it.r < 0 || it.r >= rows || it.c < 0 || it.c >= cols) continue;
        ctx!.globalAlpha = it.a == null ? 1 : it.a;
        ctx!.fillStyle = it.col;
        ctx!.fillRect(it.c * CELL, it.r * CELL, CELL - 1, CELL - 1);
      }
      ctx!.globalAlpha = 1;
    }
    let rafId = 0;
    function loop() {
      if (on) {
        clk++;
        frame();
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    cleanups.push(() => cancelAnimationFrame(rafId));
  }

  function initBcpFlow() {
    const cv = root.querySelector<HTMLCanvasElement>("#bcp-flowviz");
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const DPR = Math.min(devicePixelRatio || 1, 2);
    const PX = 8;
    const HEAT = ["#1c2541", "#3b5bd9", "#f5c518", "#e0492a"];
    const NEON = "#d8ff00";
    function ss(t: number) {
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      return t * t * (3 - 2 * t);
    }
    function hash(n: number) {
      const s = Math.sin(n * 12.9898) * 43758.5453;
      return s - Math.floor(s);
    }
    const HX: Record<string, [number, number, number]> = {};
    function hx(h: string): [number, number, number] {
      if (HX[h]) return HX[h];
      let v: [number, number, number];
      if (h.charAt(0) === "#") {
        v = [
          Number.parseInt(h.slice(1, 3), 16),
          Number.parseInt(h.slice(3, 5), 16),
          Number.parseInt(h.slice(5, 7), 16),
        ];
      } else {
        const m = h.match(/\d+/g) as string[];
        v = [+m[0], +m[1], +m[2]];
      }
      HX[h] = v;
      return v;
    }
    function mix(a: string, b: string, t: number) {
      const A = hx(a);
      const B = hx(b);
      return `rgb(${(A[0] + (B[0] - A[0]) * t) | 0},${(A[1] + (B[1] - A[1]) * t) | 0},${(A[2] + (B[2] - A[2]) * t) | 0})`;
    }
    function pxf(u: number, isSk: boolean) {
      const startX = isSk ? 0.28 : 0.0;
      return startX + u * (1 - startX);
    }
    function flowPos(
      u: number,
      s: number,
      W: number,
      H: number,
      t: number,
    ): [number, number, number] {
      const cy = H / 2;
      const isSk = hash(s * 5.5) < 0.5;
      const px = pxf(u, isSk);
      let x = px * W;
      const mg = 1 - ss(Math.min(1, (px - 0.02) / 0.55));
      const r = H * 0.3 * (0.28 + 0.72 * mg) + H * 0.05;
      const chaos = Math.max(0, 1 - px / 0.5) ** 1.2;
      const a =
        px * 0.85 * 6.2832 +
        (isSk ? Math.PI : 0) +
        (hash(s * 3.1) - 0.5) * 3.0 * chaos +
        Math.sin(t * 0.0016 + s * 30) * chaos * 1.1;
      const jr = r * (1 + (hash(s * 7.7) - 0.5) * 1.8 * chaos);
      const env = 1 - 0.22 * ss((px - 0.5) / 0.16);
      const oz = ss((px - 0.5) / 0.14) * (1 - ss((px - 0.8) / 0.08));
      const z = Math.cos(a) * jr;
      let y =
        cy +
        (Math.sin(a) * jr + (isSk ? 1 : -1) * H * 0.16 * mg) * env -
        H * 0.09 * ss((px - 0.4) / 0.3);
      x += z * 0.3 * env;
      const jt = t * 0.0022;
      x +=
        Math.sin(jt + s * 40 + px * 7) * W * 0.007 +
        Math.sin(jt * 0.5 + s * 13) * W * 0.005;
      y +=
        (Math.cos(jt * 1.1 + s * 27 + px * 5) * H * 0.055 +
          Math.sin(jt * 0.7 + s * 51) * H * 0.04) *
        env;
      y +=
        (Math.sin(t * 0.0025 + s * 44) + (hash(s * 61) - 0.5) * 1.8) *
        H *
        0.11 *
        oz;
      if (px > 0.74) {
        const tl = (px - 0.74) / 0.26;
        const pass = hash(s * 9.1) < 0.96;
        y += (pass ? -1 : 1) * ss(tl) * H * 0.42;
      }
      return [x, y, 0.5 + 0.5 * (z / (jr + 0.001))];
    }
    function cu(u: number, s: number) {
      const isSk = hash(s * 5.5) < 0.5;
      const px = pxf(u, isSk);
      if (px < 0.58) return isSk ? HEAT[1] : HEAT[0];
      if (px < 0.74) return HEAT[2];
      const tl = (px - 0.74) / 0.26;
      return mix(
        HEAT[2],
        hash(s * 9.1) < 0.96 ? NEON : HEAT[3],
        ss(Math.min(1, tl * 1.4)),
      );
    }
    function px(x: number, y: number, col: string, a: number) {
      ctx!.globalAlpha = a;
      ctx!.fillStyle = col;
      ctx!.fillRect(
        Math.round(x / PX) * PX,
        Math.round(y / PX) * PX,
        PX - 1,
        PX - 1,
      );
    }
    function stageOf(u: number, s: number) {
      const isSk = hash(s * 5.5) < 0.5;
      const p = pxf(u, isSk);
      if (p > 0.74) return 3;
      if (p >= 0.58) return 2;
      return isSk ? 1 : 0;
    }
    let ST = -1;
    const EM = [1, 1, 1, 1];
    const steps = root.querySelectorAll<HTMLElement>(
      "#protocol-parts .donuts .step",
    );
    steps.forEach((el, i) => {
      const enter = (e: PointerEvent) => {
        if (e.pointerType !== "touch") ST = i;
      };
      const leave = () => {
        if (ST === i) ST = -1;
      };
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const lw = 62;
        let x = e.clientX - r.left - lw / 2;
        x = Math.max(0, Math.min(r.width - lw, x));
        el.style.setProperty("--lx", `${Math.round(x / 9) * 9}px`);
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("pointermove", move, { passive: true });
      cleanups.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("pointermove", move);
      });
    });
    let W = 0;
    let H = 0;
    type Pt = { u0: number; s: number; sp: number };
    let P: Pt[] | null = null;
    let t = Math.random() * 4000;
    let on = true;
    let pmx = 0;
    let pmy = 0;
    let pstr = 0;
    let ptgt = 0;
    function ensure() {
      if (!P) {
        P = [];
        for (let i = 0; i < 4400; i++) {
          P.push({
            u0: hash(i * 3.3 + 7),
            s: hash(i * 1.7 + 3),
            sp: 0.55 + hash(i * 5.1 + 2) * 0.9,
          });
        }
      }
    }
    function size() {
      const r = cv!.getBoundingClientRect();
      if (r.width < 2) return;
      W = r.width;
      H = r.height;
      cv!.width = Math.round(W * DPR);
      cv!.height = Math.round(H * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    cleanups.push(() => ro.disconnect());
    const onMove = (e: PointerEvent) => {
      const r = cv!.getBoundingClientRect();
      pmx = e.clientX - r.left;
      pmy = e.clientY - r.top;
      ptgt = pmx >= -40 && pmx <= W + 40 && pmy >= -40 && pmy <= H + 40 ? 1 : 0;
    };
    const onLeave = () => {
      ptgt = 0;
    };
    cv.addEventListener("pointermove", onMove, { passive: true });
    cv.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    });
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) on = e.isIntersecting;
      },
      { root: ioRoot },
    );
    io.observe(cv);
    cleanups.push(() => io.disconnect());
    function rep(p: [number, number, number]): [number, number, number] {
      if (pstr < 0.01) return p;
      const R = Math.min(W, H) * 0.35;
      const dx = p[0] - pmx;
      const dy = p[1] - pmy;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
      if (d >= R) return p;
      const f = (1 - d / R) ** 2 * pstr;
      const m = Math.min(W, H) * 0.3;
      return [p[0] + (dx / d) * f * m, p[1] + (dy / d) * f * m, p[2]];
    }
    function draw() {
      ensure();
      ctx!.clearRect(0, 0, W, H);
      pstr += (ptgt - pstr) * 0.09;
      for (let e = 0; e < 4; e++) {
        const tgt = ST < 0 || ST === e ? 1 : 0.16;
        EM[e] += (tgt - EM[e]) * 0.07;
      }
      const pts: [number, number, number, string, number][] = [];
      for (const Q of P as Pt[]) {
        const u = (Q.u0 + t * 0.00006 * (Q.sp || 1)) % 1;
        const p = rep(flowPos(u, Q.s, W, H, t));
        pts.push([p[0], p[1], p[2], cu(u, Q.s), EM[stageOf(u, Q.s)]]);
      }
      pts.sort((a, b) => a[2] - b[2]);
      ctx!.globalAlpha = 0.13;
      ctx!.strokeStyle = "#cfcfcf";
      ctx!.lineWidth = 1;
      const LK = (PX * 6) ** 2;
      for (let j = 0; j < pts.length; j += 2) {
        for (let k = j + 1; k < Math.min(pts.length, j + 6); k++) {
          const dx = pts[j][0] - pts[k][0];
          const dy = pts[j][1] - pts[k][1];
          if (dx * dx + dy * dy < LK) {
            ctx!.beginPath();
            ctx!.moveTo(pts[j][0], pts[j][1]);
            ctx!.lineTo(pts[k][0], pts[k][1]);
            ctx!.stroke();
          }
        }
      }
      for (const p of pts) px(p[0], p[1], p[3], p[4]);
      ctx!.globalAlpha = 1;
    }
    let last = 0;
    let rafId = 0;
    function loop(ts: number) {
      const dt = Math.min(40, ts - last);
      last = ts;
      if (!W) {
        size();
      } else if (on) {
        t += dt;
        draw();
      }
      rafId = requestAnimationFrame(loop);
    }
    size();
    if (W) draw();
    rafId = requestAnimationFrame(loop);
    cleanups.push(() => cancelAnimationFrame(rafId));
  }

  return () => {
    for (const c of cleanups) c();
  };
}

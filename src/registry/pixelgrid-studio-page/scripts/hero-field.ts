import { getScrollParent, scrollTopOf } from "./scroll-adapter";

/**
 * Generative pixel-field hero backdrop: ambient cloud noise, neon accent
 * bands, a decode-to-real-text headline reveal, pointer charge/detonate
 * waves, an idle Pac-Man wander, a cursor-follow blob that gets pulled into
 * the mood-smileys and the origin-story heart, and BLANK/pixel keyboard
 * easter eggs. Ported near-verbatim from the source; the only structural
 * change is that `#hero-kv` is `position: sticky` inside a CSS-grid overlay
 * (not `position: fixed` to the real viewport) so it renders correctly both
 * full-bleed and inside the bounded studio panel - every viewport-relative
 * rect below is re-based against the canvas's own bounding rect instead of
 * assuming the canvas sits at (0,0).
 */
export function initHeroField(root: HTMLElement): () => void {
  const cv = root.querySelector<HTMLCanvasElement>("#hero-kv");
  const hero = root.querySelector<HTMLElement>("#hero");
  if (!cv || !hero) return () => {};
  const ctx = cv.getContext("2d");
  if (!ctx) return () => {};
  const scrollEl = getScrollParent(root);

  const cleanups: Array<() => void> = [];
  const on = <K extends keyof WindowEventMap>(
    target: Window | Document,
    type: K,
    handler: (ev: WindowEventMap[K]) => void,
    opts?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, handler as EventListener, opts);
    cleanups.push(() =>
      target.removeEventListener(type, handler as EventListener, opts),
    );
  };

  const DPR = Math.min(devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  let cell = 9;
  let BRUSH = 10;
  let cols = 0;
  let rows = 0;
  let heat = new Float32Array(0);
  let dis = new Float32Array(0);
  let t = 0;
  const SEED = Math.random() * 1000;
  type Wave = { x: number; y: number; t0: number; pow: number };
  const waves: Wave[] = [];
  let shake = 0;
  let mx = -1;
  let my = -1;
  let hov = false;
  let typeT = 0;
  let introT = 0;
  const RSPREAD = 1.15;
  const RLEAD = 0.16;
  const TBLOCK = 6;
  const LINES = ["PIXELS,", "ENGINEERED."];
  const BANDS: [number, string][] = [
    [0.3, "#1c2541"],
    [0.46, "#3b5bd9"],
    [0.62, "#f5c518"],
    [0.78, "#e0492a"],
  ];
  const tmask = document.createElement("canvas");
  const tmc = tmask.getContext("2d") as CanvasRenderingContext2D;
  const tfx = document.createElement("canvas");
  const tfc = tfx.getContext("2d") as CanvasRenderingContext2D;
  let TB: { cx: number; w: number; fs: number; lh: number; y0: number } | null =
    null;

  let originX = 0;
  let originY = 0;
  function updateOrigin() {
    const r = cv!.getBoundingClientRect();
    originX = r.left;
    originY = r.top;
  }

  let hrTop = 0;
  let hrH = 0;
  let fhb = -1;

  function size() {
    W = root.clientWidth;
    H = scrollEl ? scrollEl.clientHeight : window.innerHeight;
    cv!.width = Math.round(W * DPR);
    cv!.height = Math.round(H * DPR);
    cv!.style.height = `${H}px`;
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    tmask.width = cv!.width;
    tmask.height = cv!.height;
    tmc.setTransform(DPR, 0, 0, DPR, 0, 0);
    tfx.width = cv!.width;
    tfx.height = cv!.height;
    tfc.setTransform(DPR, 0, 0, DPR, 0, 0);
    cols = Math.ceil(W / cell) + 1;
    rows = Math.ceil(H / cell) + 1;
    heat = new Float32Array(cols * rows);
    dis = new Float32Array(cols * rows);
    measureType();
  }
  let lastW = root.clientWidth;
  size();
  on(window, "resize", () => {
    if (root.clientWidth !== lastW) {
      lastW = root.clientWidth;
      size();
    }
  });

  function hsh(c: number, r: number) {
    const n = Math.sin(c * 127.1 + r * 311.7 + SEED * 0.13) * 43758.5453;
    return n - Math.floor(n);
  }
  function base(nx: number, ny: number, tt: number) {
    const s = SEED;
    nx += Math.sin(ny * 5 + tt * 0.5 + s) * 0.05;
    ny += Math.cos(nx * 5 - tt * 0.4) * 0.05;
    const v =
      Math.sin(nx * 5.6 + s * 1.3 + tt * 0.3) *
        Math.cos(ny * 4.7 - s * 0.7 + tt * 0.22) +
      Math.sin((nx * 1.4 + ny * 1.7) * 4.1 - s + tt * 0.16) +
      Math.sin(ny * 9 + s * 2.1 + nx * 3) * 0.5 +
      Math.sin(nx * 13 - s * 1.7) * 0.28;
    return 0.5 + 0.5 * (v / 2.55);
  }
  function region(nx: number, ny: number, tt: number) {
    return (
      0.5 +
      0.5 *
        Math.sin(nx * 2.1 + tt * 0.12 + SEED * 0.7) *
        Math.cos(ny * 1.8 - tt * 0.09 + SEED * 0.3)
    );
  }
  function dep(x: number, y: number, amt: number, sig: number) {
    const cc = x / cell;
    const cr = y / cell;
    const rad = Math.ceil(sig * 1.6);
    const inv = 1 / (2 * sig * sig * 0.18);
    for (let dr = -rad; dr <= rad; dr++) {
      for (let dc = -rad; dc <= rad; dc++) {
        const c = (cc + dc) | 0;
        const r = (cr + dr) | 0;
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        const dx = c + 0.5 - cc;
        const dy = r + 0.5 - cr;
        const w = Math.exp(-(dx * dx + dy * dy) * inv);
        if (w < 0.02) continue;
        const id = r * cols + c;
        const vv = heat[id] + amt * w;
        heat[id] = vv > 1 ? 1 : vv;
      }
    }
  }
  let pmx = -1;
  let pmy = -1;
  let lastMove = -9;
  function follow(x: number, y: number, sig: number) {
    if (pmx < 0) {
      pmx = x;
      pmy = y;
    }
    const dx = x - pmx;
    const dy = y - pmy;
    const dl = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.min(48, Math.round(dl / (cell * 0.8))));
    for (let s = 1; s <= steps; s++) {
      const f = s / steps;
      dep(pmx + dx * f, pmy + dy * f, 0.16, sig);
    }
    pmx = x;
    pmy = y;
  }
  function pacman(
    cx: number,
    cy: number,
    rad: number,
    ang: number,
    mouth: number,
    val: number,
  ) {
    const c0 = Math.floor((cx - rad) / cell);
    const c1 = Math.ceil((cx + rad) / cell);
    const r0 = Math.floor((cy - rad) / cell);
    const r1 = Math.ceil((cy + rad) / cell);
    const rr = rad * rad;
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        const dx = (c + 0.5) * cell - cx;
        const dy = (r + 0.5) * cell - cy;
        if (dx * dx + dy * dy > rr) continue;
        const da = Math.abs(
          ((((Math.atan2(dy, dx) - ang) % (2 * Math.PI)) + 3 * Math.PI) %
            (2 * Math.PI)) -
            Math.PI,
        );
        if (da < mouth) continue;
        const id = r * cols + c;
        const v = val + 0.03 * Math.sin(c * 0.7 + r * 0.7 - t * 0.01);
        if (v > heat[id]) heat[id] = v;
      }
    }
  }
  let pacOn = false;
  let pacx = 0;
  let pacy = 0;
  let pacDir = 1;
  let pacStart = 0;
  let pacAge = 0;
  let PFOOD = 34;
  function wander(restx: number, resty: number) {
    if (!pacOn) {
      pacOn = true;
      pacDir = restx < W * 0.5 ? 1 : -1;
      pacx = restx;
      pacy = resty;
      pacStart = restx;
      pacAge = 0;
      PFOOD = BRUSH * 3.4;
    }
    const rad = BRUSH * 3.4;
    pacAge++;
    pacx += pacDir * 2.6;
    if (pacx > W + rad + 12 || pacx < -rad - 12) {
      pacDir = Math.random() < 0.5 ? 1 : -1;
      pacy = 70 + Math.random() * (H - 140);
      pacx = pacDir > 0 ? -rad : W + rad;
      pacStart = pacx;
      pacAge = 0;
    }
    const ang = pacDir > 0 ? 0 : Math.PI;
    const pr = Math.round(pacy / cell);
    for (let k = 1; k <= 80; k++) {
      const px = pacStart + pacDir * PFOOD * k;
      if (px < -20 || px > W + 20) continue;
      if (pacDir * (px - pacx) > rad * 0.7) {
        const pc = Math.round(px / cell);
        if (pc >= 0 && pr >= 0 && pc < cols && pr < rows) {
          const pid = pr * cols + pc;
          if (0.72 > heat[pid]) heat[pid] = 0.72;
        }
      }
    }
    const mouth = 0.05 + 0.6 * Math.abs(Math.sin(pacAge * 0.16));
    pacman(pacx, pacy, rad, ang, mouth, 0.72);
  }
  let hoverSlide: Element | null = null;
  function measureType() {
    const fs = Math.min((W * 0.6) / 2.6, H * 0.165);
    const lh = fs * 0.92;
    const cy = hrTop + hrH * 0.45;
    tmc.font = `400 ${fs}px "Space Grotesk",sans-serif`;
    let mw = 1;
    for (const line of LINES) {
      const ww = tmc.measureText(line).width;
      if (ww > mw) mw = ww;
    }
    TB = { cx: W / 2, w: mw, fs, lh, y0: cy - lh / 2 };
    tmc.clearRect(0, 0, W, H);
    tmc.textAlign = "center";
    tmc.textBaseline = "middle";
    tmc.fillStyle = "#000";
    for (let i = 0; i < LINES.length; i++) {
      tmc.fillText(LINES[i], W / 2, TB.y0 + i * lh);
    }
  }
  function drawTypeReveal(g2: CanvasRenderingContext2D, color: string) {
    if (!TB) return;
    const n = Math.ceil(W / TBLOCK);
    const span = Math.max(1, n);
    const tick = Math.floor(typeT * 16);
    const nr = Math.ceil(H / TBLOCK);
    tfc.clearRect(0, 0, W, H);
    tfc.fillStyle = color;
    for (let c = 0; c < n; c++) {
      const key = c / span;
      const ra = key * RSPREAD;
      if (typeT >= ra) {
        tfc.fillRect(c * TBLOCK, 0, TBLOCK, H);
      } else if (typeT > ra - RLEAD) {
        const prob = 0.25 + 0.75 * (1 - (ra - typeT) / RLEAD);
        for (let r = 0; r < nr; r++) {
          if (hsh(c + tick * 0.7, r) < prob) {
            tfc.fillRect(c * TBLOCK, r * TBLOCK, TBLOCK, TBLOCK);
          }
        }
      }
    }
    tfc.globalCompositeOperation = "destination-in";
    tfc.drawImage(tmask, 0, 0, W, H);
    tfc.globalCompositeOperation = "source-over";
    g2.drawImage(tfx, 0, 0, W, H);
  }
  const TOUCH = !matchMedia("(hover: hover) and (pointer: fine)").matches;
  const secOrigin = root.querySelector<HTMLElement>("#origin");
  const secContact = root.querySelector<HTMLElement>("#contact");
  const footEl = root.querySelector<HTMLElement>("footer");
  function spans(el: HTMLElement | null, y: number) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.top - originY < y && r.bottom - originY > y;
  }
  function zoneOf(el: Element | null): "" | "text" | "heart" {
    if (!el?.closest) return "";
    if (el.closest("#contact, footer")) return "text";
    if (el.closest("#origin")) return "heart";
    return "";
  }
  let hoverEls: Element[] = [];
  type Group = { host: Element; els: Element[]; frame: boolean };
  let groups: Group[] = [];
  let smileyEls: { el: Element; val: number }[] = [];
  let ctaMeta: Element | null = null;
  let headEls: Element[] = [];
  let headElsM: Element[] = [];
  function collectTargets() {
    hoverEls = Array.from(
      root.querySelectorAll(
        TOUCH
          ? ".btn"
          : ".slide:first-child .csm, .slide:first-child .pv, .btn",
      ),
    );
    headEls = Array.from(
      root.querySelectorAll(".hero h1, .ed h2, .proc h2, .ch h2"),
    );
    headElsM = Array.from(root.querySelectorAll("[data-blobarrow]"));
    groups = [];
    for (const sel of ["#process .donuts", "#protocol-parts .donuts"]) {
      const h = root.querySelector(sel);
      if (h) {
        const e = Array.from(h.querySelectorAll(".donut"));
        if (e.length) groups.push({ host: h, els: e, frame: true });
      }
    }
    const two = root.querySelector("#shift .two");
    if (two) {
      const sm = Array.from(two.querySelectorAll(".smiley"));
      if (sm.length) groups.push({ host: two, els: sm, frame: false });
    }
    smileyEls = Array.from(root.querySelectorAll("#shift .smiley")).map(
      (el) => ({
        el,
        val: el.getAttribute("data-base") === "#3b5bd9" ? 0.56 : 1.0,
      }),
    );
    ctaMeta = root.querySelector("#contact .meta");
  }
  collectTargets();
  on(window, "load", collectTargets);
  function nearestTarget(vc: number) {
    let best: Element | null = null;
    let bd = H * 0.42;
    for (const el of hoverEls) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.bottom - originY < 0 || r.top - originY > H)
        continue;
      const d = Math.abs(r.top - originY + r.height / 2 - vc);
      if (d < bd) {
        bd = d;
        best = el;
      }
    }
    return best;
  }
  function nearHeadline(x: number, y: number, list: Element[]) {
    let best: { x: number; y: number; idx: number } | null = null;
    let bd = 1e9;
    const M = 150;
    for (let i = 0; i < list.length; i++) {
      const r = list[i].getBoundingClientRect();
      const rt = r.top - originY;
      const rb = r.bottom - originY;
      const rl = r.left - originX;
      const rr = r.right - originX;
      if (r.width < 2 || rb < -40 || rt > H + 40) continue;
      if (x < rl - M || x > rr + M || y < rt - M || y > rb + M) continue;
      const cx = rl + r.width / 2;
      const cy = rt + r.height / 2;
      const d = Math.hypot(x - cx, y - cy);
      if (d < bd) {
        bd = d;
        best = { x: cx, y: cy, idx: i };
      }
    }
    return best;
  }
  function ctr(el: Element): [number, number] {
    const r = el.getBoundingClientRect();
    return [r.left - originX + r.width / 2, r.top - originY + r.height / 2];
  }
  function activeGroup(vc: number) {
    let best: Group | null = null;
    let bd = H * 0.55;
    for (const g of groups) {
      const h = g.host.getBoundingClientRect();
      if (h.bottom - originY < 0 || h.top - originY > H || h.height < 2)
        continue;
      const d = Math.abs(h.top - originY + h.height / 2 - vc);
      if (d < bd) {
        bd = d;
        best = g;
      }
    }
    if (!best) return null;
    const hb2 = best.host.getBoundingClientRect();
    const n = best.els.length;
    let p = (vc - (hb2.top - originY)) / Math.max(1, hb2.height);
    p = Math.max(0, Math.min(0.9999, p));
    if (n < 2) {
      const c = ctr(best.els[0]);
      return { x: c[0], y: c[1], el: best.els[0], frame: best.frame };
    }
    const f = p * (n - 1);
    const i0 = Math.floor(f);
    const fr = f - i0;
    const a = ctr(best.els[i0]);
    const b = ctr(best.els[Math.min(n - 1, i0 + 1)]);
    return {
      x: a[0] * (1 - fr) + b[0] * fr,
      y: a[1] * (1 - fr) + b[1] * fr,
      el: best.els[fr < 0.5 ? i0 : Math.min(n - 1, i0 + 1)],
      frame: best.frame,
    };
  }
  let cursorZone: "" | "text" | "heart" = "";
  on(
    window,
    "pointermove",
    (e) => {
      if (TOUCH) return;
      lastMove = performance.now() / 1000;
      pacOn = false;
      mx = e.clientX - originX;
      my = e.clientY - originY;
      hov = true;
      cursorZone = zoneOf(e.target as Element);
    },
    { passive: true },
  );
  const scrollTarget: HTMLElement | Window = scrollEl ?? window;
  const onContainerScroll = () => {
    if (TOUCH || !hov || mx < 0) return;
    lastMove = performance.now() / 1000;
    pacOn = false;
    cursorZone = zoneOf(document.elementFromPoint(mx + originX, my + originY));
  };
  scrollTarget.addEventListener("scroll", onContainerScroll, { passive: true });
  cleanups.push(() =>
    scrollTarget.removeEventListener("scroll", onContainerScroll),
  );
  for (const m of root.querySelectorAll(
    ".slide .csm, .slide .pv, .ctabtn, .btn, .proc .donut",
  )) {
    const enter = () => {
      hoverSlide = m;
    };
    const leave = () => {
      if (hoverSlide === m) hoverSlide = null;
    };
    m.addEventListener("mouseenter", enter);
    m.addEventListener("mouseleave", leave);
    cleanups.push(() => {
      m.removeEventListener("mouseenter", enter);
      m.removeEventListener("mouseleave", leave);
    });
  }
  let charging = false;
  let chT0 = 0;
  let chx = 0;
  let chy = 0;
  on(window, "pointerdown", (e) => {
    if (TOUCH) return;
    if ((e.target as Element).closest?.("a,button,input,.pxctl")) return;
    charging = true;
    chT0 = performance.now() / 1000;
    chx = e.clientX - originX;
    chy = e.clientY - originY;
  });
  function release() {
    if (!charging) return;
    charging = false;
    const ns = performance.now() / 1000;
    const ch = Math.min((ns - chT0) / 2.2, 1);
    waves.push({ x: chx, y: chy, t0: ns, pow: 0.35 + ch * 2.1 });
    dep(chx, chy, 1, BRUSH * (2.5 + ch * 18));
    shake = 0.45 + ch * 1.9;
    const hb = hero!.getBoundingClientRect();
    const hbTop = hb.top - originY;
    const hbBottom = hb.bottom - originY;
    if (hbBottom > 0 && hbTop < H) typeT = 0;
  }
  on(window, "pointerup", release);
  on(window, "pointercancel", release);
  const HEART = [
    [2, 1],
    [3, 1],
    [5, 1],
    [6, 1],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [6, 3],
    [7, 3],
    [2, 4],
    [3, 4],
    [4, 4],
    [5, 4],
    [6, 4],
    [3, 5],
    [4, 5],
    [5, 5],
    [4, 6],
  ];
  function stampHeart(cx: number, cy: number) {
    const S = 2;
    const bc = Math.round(cx / cell);
    const br = Math.round(cy / cell);
    const o = 4 * S;
    for (const [hx, hy] of HEART) {
      for (let yy = 0; yy < S; yy++) {
        for (let xx = 0; xx < S; xx++) {
          const C = bc + hx * S + xx - o;
          const R = br + hy * S + yy - o;
          if (C < 0 || R < 0 || C >= cols || R >= rows) continue;
          const id = R * cols + C;
          const w = 0.86 + 0.12 * Math.sin(C * 0.6 + R * 0.6 - t * 0.006);
          if (w > heat[id]) heat[id] = w;
        }
      }
    }
  }
  type Spark = { x: number; y: number; vx: number; vy: number; life: number };
  const hsparks: Spark[] = [];
  function heartBoom(x: number, y: number) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 6.2832;
      const sp = BRUSH * (0.7 + hsh(i, x) * 0.7);
      hsparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
      });
    }
  }
  let wasHeart = false;
  function pointArrow(x: number, y: number, ang: number, tt: number) {
    const L = BRUSH * 8.5;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const tipx = x + ca * L;
    const tipy = y + sa * L;
    const pulse = (tt * 0.9) % 1;
    const steps = Math.max(16, Math.round(L / (cell * 0.5)));
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const hi = Math.exp(-(((f - pulse) * 3.0) ** 2));
      dep(x + ca * L * f, y + sa * L * f, 0.5 + 0.46 * hi, 0.95);
    }
    const hl = BRUSH * 3.4;
    for (let s = -1; s <= 1; s += 2) {
      const ba = ang + Math.PI + s * 0.62;
      const bsteps = Math.max(8, Math.round(hl / (cell * 0.5)));
      for (let j = 0; j <= bsteps; j++) {
        const g = j / bsteps;
        dep(
          tipx + Math.cos(ba) * hl * g,
          tipy + Math.sin(ba) * hl * g,
          0.72,
          0.95,
        );
      }
    }
  }
  function stampDisk(cx: number, cy: number, rad: number, val: number) {
    if (rad < 3) return;
    const c0 = Math.floor((cx - rad) / cell);
    const c1 = Math.ceil((cx + rad) / cell);
    const r0 = Math.floor((cy - rad) / cell);
    const r1 = Math.ceil((cy + rad) / cell);
    const rr = rad * rad;
    const fk = Math.floor(t / 140);
    const ACCV = [0.96, 0.72, 0.82];
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        const dx = (c + 0.5) * cell - cx;
        const dy = (r + 0.5) * cell - cy;
        if (dx * dx + dy * dy > rr) continue;
        const v =
          hsh(c * 1.7 + 0.3, r * 1.1 + fk * 3.7) < 0.18
            ? ACCV[(hsh(c + fk * 2.1, r - fk * 1.3) * 3) | 0]
            : val + 0.03 * Math.sin(c * 0.7 + r * 0.7 - t * 0.01);
        heat[r * cols + c] = v;
      }
    }
  }
  const txtC = document.createElement("canvas");
  const txc = txtC.getContext("2d") as CanvasRenderingContext2D;
  const TXT = "the answer is yes we do it     ";
  let txtW = 0;
  const TXH = 20;
  let txtData: Uint8ClampedArray | null = null;
  let txtScroll = 0;
  function buildTxt() {
    txc.font = '18px "Space Grotesk",monospace';
    txtW = Math.max(8, Math.ceil(txc.measureText(TXT).width));
    txtC.width = txtW;
    txtC.height = TXH;
    txc.font = '18px "Space Grotesk",monospace';
    txc.textBaseline = "middle";
    txc.fillStyle = "#000";
    txc.clearRect(0, 0, txtW, TXH);
    txc.fillText(TXT, 0, TXH / 2);
    txtData = txc.getImageData(0, 0, txtW, TXH).data;
  }
  function stampText(cy: number) {
    if (!txtData) buildTxt();
    const br = Math.round(cy / cell) - (TXH >> 1);
    const so = Math.floor(txtScroll);
    const amp = TOUCH ? 0.05 : 0.14;
    for (let lc = 0; lc < cols; lc++) {
      const mc = (((so + lc) % txtW) + txtW) % txtW;
      for (let lr = 0; lr < TXH; lr++) {
        if (txtData![(lr * txtW + mc) * 4 + 3] > 80) {
          const R = br + lr;
          if (R < 0 || R >= rows) continue;
          const id = R * cols + lc;
          const ww = 0.84 + amp * Math.sin(lc * 0.6 + lr * 0.6 - t * 0.006);
          if (ww > heat[id]) heat[id] = ww;
        }
      }
    }
  }
  const wMask = document.createElement("canvas");
  const wmx = wMask.getContext("2d") as CanvasRenderingContext2D;
  let wData: Uint8ClampedArray | null = null;
  let wW = 0;
  const wH = 14;
  let eggUntil = 0;
  let heartUntil = 0;
  function buildWord(txt: string) {
    wmx.font = 'bold 12px "Space Grotesk",monospace';
    wW = Math.max(8, Math.ceil(wmx.measureText(txt).width));
    wMask.width = wW;
    wMask.height = wH;
    wmx.font = 'bold 12px "Space Grotesk",monospace';
    wmx.textBaseline = "middle";
    wmx.fillStyle = "#000";
    wmx.clearRect(0, 0, wW, wH);
    wmx.fillText(txt, 0, wH / 2);
    wData = wmx.getImageData(0, 0, wW, wH).data;
  }
  function stampWord() {
    if (!wData) return;
    const tw = Math.min(W * 0.7, H * 0.45 * (wW / wH));
    const sc = tw / wW;
    const ox = (W - tw) / 2;
    const oy = (H - sc * wH) / 2;
    for (let mr = 0; mr < wH; mr++) {
      for (let mc = 0; mc < wW; mc++) {
        if (wData[(mr * wW + mc) * 4 + 3] < 80) continue;
        const c0 = ((ox + mc * sc) / cell) | 0;
        const c1 = ((ox + (mc + 1) * sc) / cell) | 0;
        const r0 = ((oy + mr * sc) / cell) | 0;
        const r1 = ((oy + (mr + 1) * sc) / cell) | 0;
        for (let R = r0; R <= r1; R++) {
          for (let C = c0; C <= c1; C++) {
            if (C < 0 || R < 0 || C >= cols || R >= rows) continue;
            const id = R * cols + C;
            const ww = 0.8 + 0.18 * Math.sin(C * 0.5 + R * 0.5 - t * 0.012);
            if (ww > heat[id]) heat[id] = ww;
          }
        }
      }
    }
  }
  function stampBigHeart() {
    const gw = 9;
    const gh = 8;
    const tw = Math.min(W * 0.42, H * 0.55 * (gw / gh));
    const sc = tw / gw;
    const ox = (W - gw * sc) / 2;
    const oy = (H - gh * sc) / 2;
    for (const [hx, hy] of HEART) {
      const c0 = ((ox + hx * sc) / cell) | 0;
      const c1 = ((ox + (hx + 1) * sc) / cell) | 0;
      const r0 = ((oy + hy * sc) / cell) | 0;
      const r1 = ((oy + (hy + 1) * sc) / cell) | 0;
      for (let R = r0; R <= r1; R++) {
        for (let C = c0; C <= c1; C++) {
          if (C < 0 || R < 0 || C >= cols || R >= rows) continue;
          const id = R * cols + C;
          const ww = 0.82 + 0.12 * Math.sin(C * 0.5 + R * 0.5 - t * 0.01);
          if (ww > heat[id]) heat[id] = ww;
        }
      }
    }
  }
  function burst(n: number, pow: number) {
    const b = performance.now() / 1000;
    for (let i = 0; i < n; i++) {
      waves.push({
        x: Math.random() * W,
        y: Math.random() * H,
        t0: b,
        pow: pow * (0.6 + Math.random()),
      });
    }
    shake = Math.max(shake, 1.6);
  }
  function fireWord() {
    buildWord("BLANK");
    eggUntil = performance.now() / 1000 + 3.4;
    burst(12, 1.1);
  }
  function fireHeart() {
    heartUntil = performance.now() / 1000 + 3.4;
    burst(8, 0.9);
  }
  const KON = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
  let ki = 0;
  let typed = "";
  on(window, "keydown", (e) => {
    const k = e.keyCode;
    if (k === KON[ki]) {
      ki++;
      if (ki === KON.length) {
        ki = 0;
        fireWord();
      }
    } else {
      ki = k === KON[0] ? 1 : 0;
    }
    if (e.key && e.key.length === 1) {
      typed = (typed + e.key.toLowerCase()).slice(-6);
      if (typed.slice(-5) === "blank") fireWord();
      else if (typed.slice(-5) === "pixel") fireHeart();
    }
  });
  on(window, "dblclick", (e) => {
    if (TOUCH) return;
    if ((e.target as Element).closest?.("a,button,input,.pxctl")) return;
    const x = e.clientX - originX;
    const y = e.clientY - originY;
    waves.push({ x, y, t0: performance.now() / 1000, pow: 2.8 });
    dep(x, y, 1, BRUSH * 22);
    shake = 2.4;
  });

  function render() {
    updateOrigin();
    const tt = t * 0.001;
    const ns = performance.now() / 1000;
    const hb = hero!.getBoundingClientRect();
    hrTop = hb.top - originY;
    hrH = hb.height;
    const intro = introT / 1.6;
    for (let i = 0; i < heat.length; i++) {
      if (dis[i] > 0 && ((i / cols) | 0) * cell > hb.bottom - originY) {
        dis[i] -= 0.007;
        if (dis[i] <= 0) {
          dis[i] = 0;
          heat[i] = 0;
        } else if (dis[i] < 0.3) {
          heat[i] *= 0.88;
        } else {
          heat[i] = Math.max(heat[i] * 0.95, 0.9);
        }
      } else {
        if (dis[i] > 0) dis[i] = 0;
        heat[i] *= TOUCH ? 0.85 : 0.878;
        if (heat[i] < 0.003) heat[i] = 0;
      }
    }
    if (TOUCH) {
      const sp = scrollTopOf(scrollEl);
      const vc = H * 0.5;
      let bx = 0;
      let by = 0;
      let mhd: { x: number; y: number } | null = null;
      for (const el of headElsM) {
        const mr = el.getBoundingClientRect();
        if (mr.width < 2) continue;
        const mcy = mr.top - originY + mr.height / 2;
        if (mcy > H * 0.3 && mcy < H * 0.64) {
          mhd = { x: mr.left - originX + mr.width / 2, y: mcy };
          break;
        }
      }
      if (mhd) {
        cursorZone = "";
        let tprog = (H * 0.64 - mhd.y) / (H * 0.34);
        tprog = tprog < 0 ? 0 : tprog > 1 ? 1 : tprog;
        bx = mhd.x + (tprog - 0.5) * W * 0.5;
        by = mhd.y - 104;
        hoverSlide = null;
      } else {
        cursorZone = spans(secOrigin, vc)
          ? "heart"
          : spans(secContact, vc) || spans(footEl, vc)
            ? "text"
            : "";
        if (cursorZone) {
          bx = W * 0.5 + Math.sin(sp * 0.0026 + 0.6) * W * 0.33;
          by = H * 0.5 + Math.sin(sp * 0.0052) * H * 0.2;
          hoverSlide = null;
        } else {
          const g = activeGroup(vc);
          if (g) {
            bx = g.x;
            by = g.y;
            hoverSlide = g.frame ? g.el : null;
          } else {
            const tg = nearestTarget(vc);
            if (tg) {
              const tr = tg.getBoundingClientRect();
              bx = tr.left - originX + tr.width / 2;
              by = tr.top - originY + tr.height / 2;
              hoverSlide = tg;
            } else {
              bx = W * 0.5 + Math.sin(sp * 0.0026 + 0.6) * W * 0.33;
              by = H * 0.5 + Math.sin(sp * 0.0052) * H * 0.2;
              hoverSlide = null;
            }
          }
        }
      }
      if (mx < 0) mx = bx;
      if (my < 0) my = by;
      mx += (bx - mx) * 0.11;
      my += (by - my) * 0.11;
      mx = Math.max(8, Math.min(W - 8, mx));
      my = Math.max(8, Math.min(H - 8, my));
      hov = true;
      lastMove = ns;
    }
    if (hov && mx > 0) {
      const hd = TOUCH ? null : nearHeadline(mx, my, headEls);
      const idle = ns - lastMove;
      if (hd) {
        if (idle < 2.4) {
          pointArrow(mx, my, Math.atan2(hd.y - my, hd.x - mx), ns);
          pmx = mx;
          pmy = my;
        } else {
          wander(mx, my);
          pmx = mx;
          pmy = my;
        }
      } else if (cursorZone === "heart") {
        if (!wasHeart) heartBoom(mx, my);
        stampHeart(mx, my);
        pmx = mx;
        pmy = my;
      } else if (cursorZone === "text") {
        follow(mx, my, my > hb.bottom - originY ? BRUSH * 0.5 : BRUSH);
      } else {
        let sg: { cx: number; cy: number; rad: number; val: number } | null =
          null;
        let sp = 0;
        for (const smiley of smileyEls) {
          const qr = smiley.el.getBoundingClientRect();
          const qt = qr.top - originY;
          const qb = qr.bottom - originY;
          if (qr.width < 2 || qb < -40 || qt > H + 40) continue;
          const qcx = qr.left - originX + qr.width / 2;
          const qcy = qt + qr.height / 2;
          const GR = qr.width * 1.9;
          const qp = 1 - Math.hypot(mx - qcx, my - qcy) / GR;
          if (qp > sp) {
            sp = qp;
            sg = { cx: qcx, cy: qcy, rad: qr.width * 0.46, val: smiley.val };
          }
        }
        if (sg && sp > 0) {
          const e = sp * sp * (3 - 2 * sp);
          const bx = mx + (sg.cx - mx) * e;
          const by = my + (sg.cy - my) * e;
          if (e < 0.82) dep(bx, by, 0.13, BRUSH * (1 - 0.5 * e));
          if (sp > 0.16) stampDisk(sg.cx, sg.cy, sg.rad * e, sg.val);
          pmx = mx;
          pmy = my;
        } else if (idle > 1.5) {
          wander(mx, my);
          pmx = mx;
          pmy = my;
        } else {
          follow(mx, my, my > hb.bottom - originY ? BRUSH * 0.5 : BRUSH);
        }
      }
      wasHeart = cursorZone === "heart";
    }
    for (let hi = hsparks.length - 1; hi >= 0; hi--) {
      const hsp = hsparks[hi];
      hsp.x += hsp.vx;
      hsp.y += hsp.vy;
      hsp.vx *= 0.88;
      hsp.vy *= 0.88;
      hsp.life -= 0.06;
      if (hsp.life <= 0) {
        hsparks.splice(hi, 1);
        continue;
      }
      dep(hsp.x, hsp.y, 0.45 + 0.45 * hsp.life, 1.6);
    }
    if (ctaMeta) {
      const _mr = (ctaMeta as Element).getBoundingClientRect();
      const mrTop = _mr.top - originY;
      const mrBottom = _mr.bottom - originY;
      if (mrBottom > 0 && mrTop < H + 260) {
        txtScroll += 0.14;
        stampText(mrTop - (TOUCH ? 195 : 235));
      }
    }
    if (ns < eggUntil) stampWord();
    if (ns < heartUntil) stampBigHeart();
    if (charging) {
      const chg = Math.min((ns - chT0) / 2.2, 1);
      dep(chx, chy, 0.45 + chg * 0.5, BRUSH * (2 + chg * 8));
      if (shake < 0.12 + chg * 0.35) shake = 0.12 + chg * 0.35;
    }
    for (let wi = waves.length - 1; wi >= 0; wi--) {
      const wv = waves[wi];
      const age = ns - wv.t0;
      if (age > 1.5) {
        waves.splice(wi, 1);
        continue;
      }
      const pw = wv.pow || 1;
      const R = age * Math.hypot(W, H) * 1.7;
      const sig = cell * 5.5 * pw;
      const amp = Math.max(0, 1 - age / 1.5) * 1.2 * pw;
      const inv = 1 / (2 * sig * sig);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = (c + 0.5) * cell - wv.x;
          const dy = (r + 0.5) * cell - wv.y;
          const dd = Math.sqrt(dx * dx + dy * dy);
          const g = amp * Math.exp(-((dd - R) * (dd - R)) * inv);
          if (g > 0.02) {
            const id = r * cols + c;
            if (g > heat[id]) heat[id] = g;
            if (
              (r + 0.5) * cell > hb.bottom - originY &&
              g > 0.25 &&
              dis[id] === 0
            ) {
              dis[id] = 0.45 + hsh(c, r) * 0.7;
            }
          }
        }
      }
    }
    ctx!.save();
    if (shake > 0.01) {
      shake *= 0.9;
      ctx!.translate(
        (Math.random() - 0.5) * shake * 20,
        (Math.random() - 0.5) * shake * 20,
      );
    } else shake = 0;
    ctx!.clearRect(-40, -40, W + 80, H + 80);
    ctx!.fillStyle = "#fff";
    ctx!.fillRect(-40, -40, W + 80, H + 80);
    const sy = TOUCH ? 0 : scrollTopOf(scrollEl);
    const off = sy - Math.floor(sy / cell) * cell;
    const s = cell - 1;
    ctx!.strokeStyle = "#fafafa";
    ctx!.lineWidth = 1;
    ctx!.beginPath();
    for (let gx = 0; gx <= W; gx += cell) {
      ctx!.moveTo(gx + 0.5, 0);
      ctx!.lineTo(gx + 0.5, H);
    }
    for (let gy = -off; gy <= H; gy += cell) {
      ctx!.moveTo(0, gy + 0.5);
      ctx!.lineTo(W, gy + 0.5);
    }
    ctx!.stroke();
    const drStart = Math.floor(sy / cell) - 1;
    const drEnd = Math.floor((sy + H) / cell) + 1;
    if (fhb < 0) fhb = hb.bottom - originY;
    else fhb += (hb.bottom - originY - fhb) * (TOUCH ? 0.2 : 1);
    const hAmp = H * 0.14;
    const heroBottom = fhb + sy;
    const heroEnd = heroBottom * 0.55;
    const fadeSpan = Math.max(1, heroBottom * 0.18);
    for (let dr = drStart; dr <= drEnd; dr++) {
      const vy = dr * cell - sy;
      const ccyView = vy + cell * 0.5;
      const vr = Math.floor(ccyView / cell);
      const inRow = vr >= 0 && vr < rows;
      const dd = dr * cell;
      const ny = (dr * cell) / H;
      for (let c2 = 0; c2 < cols; c2++) {
        const nx = (c2 * cell) / W;
        const co = Math.max(
          0,
          (Math.sin(c2 * 0.5 + SEED) + Math.sin(c2 * 0.21 - SEED * 1.3)) *
            0.16 +
            hsh(Math.floor(c2 / 2) + 3.3, Math.floor(dr / 4)) * 0.6 +
            0.15,
        );
        const depthN = dd + co * hAmp;
        const regThr =
          depthN <= heroEnd ? 0 : Math.min(1, (depthN - heroEnd) / fadeSpan);
        let v = inRow ? heat[vr * cols + c2] * 0.9 : 0;
        if (
          region(nx, ny, tt) > regThr &&
          hsh(c2 * 1.7 + 11.3, dr * 1.3 + 5.1) < intro
        ) {
          v +=
            base(nx, ny, tt) +
            (hsh(c2, dr) - 0.5) * 0.12 +
            Math.sin(c2 * 0.6 + dr * 0.8 + tt * 1.7) * 0.045;
        }
        if (v < 0.3 && !(v >= 0.86 && v < 1.02)) continue;
        let col = BANDS[0][1];
        if (v >= BANDS[1][0]) col = BANDS[1][1];
        if (v >= BANDS[2][0]) col = BANDS[2][1];
        if (v >= BANDS[3][0]) col = BANDS[3][1];
        if (v >= 0.86 && v < 1.02) col = "#d8ff00";
        ctx!.fillStyle = col;
        ctx!.fillRect(c2 * cell, vy, s, s);
      }
    }
    ctx!.restore();
    void drawTypeReveal;
    void hoverSlide;
  }
  let rafId = 0;
  let lastTs = 0;
  function loop(ts: number) {
    if (!lastTs) lastTs = ts;
    const d = ts - lastTs;
    lastTs = ts;
    t += d;
    typeT += d / 1000;
    introT += d / 1000;
    render();
    rafId = requestAnimationFrame(loop);
  }
  (document.fonts?.ready ?? Promise.resolve()).then(() => size());
  rafId = requestAnimationFrame(loop);

  const pxctl = root.querySelector<HTMLElement>(".pxctl");
  if (pxctl) {
    const onPxCtl = (e: Event) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>("button");
      if (!btn) return;
      const pick = (attr: string) => {
        pxctl
          .querySelectorAll(`button[data-${attr}]`)
          .forEach((x) => x.classList.remove("on"));
        btn.classList.add("on");
      };
      if (btn.dataset.cell != null) {
        cell = +btn.dataset.cell;
        size();
        pick("cell");
      } else if (btn.dataset.brush != null) {
        BRUSH = +btn.dataset.brush;
        pick("brush");
      }
    };
    pxctl.addEventListener("click", onPxCtl);
    cleanups.push(() => pxctl.removeEventListener("click", onPxCtl));
  }

  return () => {
    cancelAnimationFrame(rafId);
    for (const c of cleanups) c();
  };
}

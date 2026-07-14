import {
  clientHeightOf,
  getScrollParent,
  scrollHeightOf,
  scrollTopOf,
  scrollToY,
} from "./scroll-adapter";

/** Footer: an ambient auto-building skyline you can click to take over and play full-width Tetris. */
export function initFooterTetris(root: HTMLElement): () => void {
  const cv = root.querySelector<HTMLCanvasElement>("#footcity");
  const footer = cv?.closest<HTMLElement>("footer");
  const ctx = cv?.getContext("2d");
  if (!cv || !footer || !ctx) return () => {};
  const scrollEl = getScrollParent(root);
  const cleanups: Array<() => void> = [];

  const DPR = Math.min(devicePixelRatio || 1, 2);
  const cell = 9;
  let W = 0;
  let H = 0;
  let cols = 0;
  let rows = 0;
  let on = true;
  let phase: "idle" | "flick" | "expand" | "play" = "idle";
  const reduce = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let grid: Int8Array = new Int8Array(0);
  const PAL = ["#1c2541", "#3b5bd9", "#f5c518", "#e0492a", "#d8ff00"];
  function hsh(a: number) {
    const n = Math.sin(a * 12.9898) * 43758.5453;
    return n - Math.floor(n);
  }
  function ci(s: number) {
    return 1 + Math.min(4, (hsh(s) * 5) | 0);
  }
  function seed() {
    for (let c = 0; c < cols; c++) {
      if (hsh(c * 2.3 + 1.1) < 0.3) continue;
      const hh = 1 + Math.floor(hsh(c * 4.7 + 0.5) * (rows * 0.58));
      for (let r = rows - 1; r >= rows - hh && r >= 0; r--)
        grid[r * cols + c] = ci(c * 9.1 + r * 3.7);
    }
  }
  const APCS = [
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  ];
  type APiece = { m: number[][]; x: number; y: number; col: number };
  let apiece: APiece | null = null;
  let at = 0;
  let afade = 0;
  let flick = 0;
  function aspawn() {
    if (!cols) return;
    const m = APCS[(Math.random() * APCS.length) | 0];
    let w = 0;
    for (const p of m) w = Math.max(w, p[0]);
    apiece = {
      m,
      x: (Math.random() * (cols - w)) | 0,
      y: -2,
      col: 1 + Math.min(4, (Math.random() * 5) | 0),
    };
  }
  function ahit(m: number[][], px: number, py: number) {
    for (const p of m) {
      const gx = px + p[0];
      const gy = py + p[1];
      if (gy >= rows) return true;
      if (gy >= 0 && (gx < 0 || gx >= cols || grid[gy * cols + gx]))
        return true;
    }
    return false;
  }
  function astep() {
    if (afade > 0) return;
    if (!apiece) {
      aspawn();
      return;
    }
    if (ahit(apiece.m, apiece.x, apiece.y + 1)) {
      let top = rows;
      for (const p of apiece.m) {
        const gx = apiece.x + p[0];
        const gy = apiece.y + p[1];
        if (gy >= 0 && gy < rows) {
          grid[gy * cols + gx] = apiece.col;
          if (gy < top) top = gy;
        }
      }
      if (top <= 1) afade = 0.001;
      apiece = null;
    } else apiece.y++;
  }
  function adraw() {
    ctx!.clearRect(0, 0, W, H);
    const a = afade > 0 ? Math.max(0, 1 - afade) : 1;
    const fk = Math.floor(flick * 30);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const g = grid[r * cols + c];
        if (!g) continue;
        if (flick > 0 && hsh(c * 7.1 + r * 3.3 + fk * 2.7) < flick) continue;
        ctx!.globalAlpha = a;
        ctx!.fillStyle = PAL[g - 1];
        ctx!.fillRect(c * cell, r * cell, cell - 1, cell - 1);
      }
    }
    if (apiece && flick <= 0) {
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = PAL[apiece.col - 1];
      for (const p of apiece.m) {
        const gx = apiece.x + p[0];
        const gy = apiece.y + p[1];
        if (gy >= 0) ctx!.fillRect(gx * cell, gy * cell, cell - 1, cell - 1);
      }
    }
    ctx!.globalAlpha = 1;
  }

  type PieceDef = { c: number; m: number[][] };
  const PIECES: PieceDef[] = [
    { c: 1, m: [[1, 1, 1, 1]] },
    {
      c: 2,
      m: [
        [1, 1],
        [1, 1],
      ],
    },
    {
      c: 4,
      m: [
        [0, 1, 0],
        [1, 1, 1],
      ],
    },
    {
      c: 3,
      m: [
        [0, 1, 1],
        [1, 1, 0],
      ],
    },
    {
      c: 0,
      m: [
        [1, 1, 0],
        [0, 1, 1],
      ],
    },
    {
      c: 1,
      m: [
        [1, 0, 0],
        [1, 1, 1],
      ],
    },
    {
      c: 2,
      m: [
        [0, 0, 1],
        [1, 1, 1],
      ],
    },
  ];
  type Cur = { m: number[][]; c: number; x: number; y: number };
  let curs: Cur[] = [];
  let over = false;
  const dropMs = 300;
  let grav = 0;
  let spawnT = 0;
  let score = 0;
  let scoreEl: HTMLElement | null = null;
  function rot(m: number[][]) {
    const R = m.length;
    const C = m[0].length;
    const n: number[][] = [];
    for (let x = 0; x < C; x++) {
      n[x] = [];
      for (let y = 0; y < R; y++) n[x][y] = m[R - 1 - y][x];
    }
    return n;
  }
  function phit(m: number[][], px: number, py: number) {
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[0].length; x++) {
        if (!m[y][x]) continue;
        const gx = px + x;
        const gy = py + y;
        if (
          gx < 0 ||
          gx >= cols ||
          gy >= rows ||
          (gy >= 0 && grid[gy * cols + gx])
        )
          return true;
      }
    }
    return false;
  }
  function spawnOne() {
    const cap = Math.max(2, Math.round(cols / 38));
    if (curs.length >= cap) return;
    const p = PIECES[(Math.random() * PIECES.length) | 0];
    const pw = p.m[0].length;
    for (let t = 0; t < 8; t++) {
      const x = (Math.random() * (cols - pw + 1)) | 0;
      if (!phit(p.m, x, 0)) {
        curs.push({ m: p.m, c: p.c, x, y: -p.m.length });
        return;
      }
    }
  }
  function mergeP(pc: Cur) {
    for (let y = 0; y < pc.m.length; y++) {
      for (let x = 0; x < pc.m[0].length; x++) {
        if (pc.m[y][x]) {
          const gy = pc.y + y;
          if (gy >= 0 && gy < rows) grid[gy * cols + pc.x + x] = pc.c + 1;
        }
      }
    }
  }
  function clearLines() {
    let n = 0;
    for (let y = rows - 1; y >= 0; y--) {
      let full = true;
      for (let x = 0; x < cols; x++) {
        if (!grid[y * cols + x]) {
          full = false;
          break;
        }
      }
      if (full) {
        for (let yy = y; yy > 0; yy--) {
          for (let x2 = 0; x2 < cols; x2++)
            grid[yy * cols + x2] = grid[(yy - 1) * cols + x2];
        }
        for (let x3 = 0; x3 < cols; x3++) grid[x3] = 0;
        n++;
        y++;
      }
    }
    if (n) {
      score += [0, 100, 300, 600, 1000][Math.min(4, n)];
      setScore();
    }
  }
  function pmove(d: number) {
    if (over) return;
    let mv = false;
    for (const c of curs) {
      if (!phit(c.m, c.x + d, c.y)) {
        c.x += d;
        mv = true;
      }
    }
    if (mv) pdraw();
  }
  function psoft() {
    if (over) return;
    for (const c of curs) {
      if (!phit(c.m, c.x, c.y + 1)) c.y++;
    }
    pdraw();
  }
  function protate() {
    if (over) return;
    for (const c of curs) {
      const r = rot(c.m);
      const k = [0, -1, 1, -2, 2];
      for (const kk of k) {
        if (!phit(r, c.x + kk, c.y)) {
          c.m = r;
          c.x += kk;
          break;
        }
      }
    }
    pdraw();
  }
  function phard() {
    if (over) return;
    for (const c of curs) {
      while (!phit(c.m, c.x, c.y + 1)) c.y++;
      mergeP(c);
      if (c.y <= 0) over = true;
    }
    curs = [];
    clearLines();
    pdraw();
  }
  function pdraw() {
    ctx!.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const g = grid[r * cols + c];
        if (g) {
          ctx!.fillStyle = PAL[g - 1];
          ctx!.fillRect(c * cell, r * cell, cell - 1, cell - 1);
        }
      }
    }
    for (const pc of curs) {
      ctx!.fillStyle = PAL[pc.c];
      for (let yy = 0; yy < pc.m.length; yy++) {
        for (let xx = 0; xx < pc.m[0].length; xx++) {
          if (pc.m[yy][xx]) {
            const cy = pc.y + yy;
            if (cy >= 0)
              ctx!.fillRect((pc.x + xx) * cell, cy * cell, cell - 1, cell - 1);
          }
        }
      }
    }
    ov.classList.toggle("tt-isover", !!over);
  }
  function pstep() {
    if (over) return;
    const still: Cur[] = [];
    for (const c of curs) {
      if (phit(c.m, c.x, c.y + 1)) {
        mergeP(c);
        if (c.y <= 0) over = true;
      } else {
        c.y++;
        still.push(c);
      }
    }
    curs = still;
    if (--spawnT <= 0) {
      spawnOne();
      spawnT = 1 + ((Math.random() * 4) | 0);
    }
    clearLines();
    pdraw();
  }
  function gtick() {
    if (phase !== "play" || over) return;
    pstep();
    grav = window.setTimeout(gtick, dropMs);
  }
  function setScore() {
    if (scoreEl) scoreEl.textContent = `000000${score}`.slice(-6);
  }
  function beginPlay() {
    phase = "play";
    size();
    grid.fill(0);
    over = false;
    score = 0;
    setScore();
    curs = [];
    spawnT = 0;
    spawnOne();
    spawnOne();
    pdraw();
    clearTimeout(grav);
    grav = window.setTimeout(gtick, dropMs);
  }

  function size() {
    const r = cv!.getBoundingClientRect();
    if (r.width < 2) return;
    W = r.width;
    H = r.height;
    cv!.width = Math.round(W * DPR);
    cv!.height = Math.round(H * DPR);
    ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    cols = Math.ceil(W / cell);
    rows = Math.floor(H / cell);
    grid = new Int8Array(cols * rows);
    if (phase === "idle") seed();
  }
  size();
  const ro = new ResizeObserver(() => {
    const wasPlay = phase === "play";
    size();
    if (wasPlay) {
      over = false;
      curs = [];
      spawnT = 0;
      pdraw();
    }
  });
  ro.observe(cv);
  cleanups.push(() => ro.disconnect());
  const io = new IntersectionObserver(
    (es) => {
      for (const e of es) on = e.isIntersecting;
    },
    { root: getScrollParent(root) },
  );
  io.observe(cv);
  cleanups.push(() => io.disconnect());

  const ov = document.createElement("div");
  ov.id = "tetris";
  ov.innerHTML =
    '<div class="tt-score">000000</div>' +
    '<div class="tt-pad">' +
    '<button data-k="left" aria-label="Move left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg></button>' +
    '<button data-k="right" aria-label="Move right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>' +
    '<button data-k="rot" aria-label="Rotate"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>' +
    '<button data-k="drop" aria-label="Hard drop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 6 5 5 5-5"/><path d="m7 13 5 5 5-5"/></svg></button>' +
    "</div>" +
    '<button class="tt-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg></button>' +
    '<div class="tt-over"><span class="ttl">Game over</span><button class="tt-again" type="button">play again</button></div>';
  footer.appendChild(ov);
  scoreEl = ov.querySelector(".tt-score");
  const pxHover = (
    window as unknown as { __pxHover?: (el: HTMLElement) => void }
  ).__pxHover;
  const againBtn = ov.querySelector<HTMLElement>(".tt-again");
  if (againBtn) pxHover?.(againBtn);
  const onAgain = (e: Event) => {
    e.stopPropagation();
    beginPlay();
  };
  againBtn?.addEventListener("click", onAgain);
  const closeBtn = ov.querySelector<HTMLElement>(".tt-close");
  const onClose = (e: Event) => {
    e.stopPropagation();
    endGame();
  };
  closeBtn?.addEventListener("click", onClose);
  const padHandlers: Array<[HTMLButtonElement, (e: Event) => void]> = [];
  ov.querySelectorAll<HTMLButtonElement>(".tt-pad button").forEach((b) => {
    const handler = (e: Event) => {
      e.stopPropagation();
      if (over) {
        beginPlay();
        return;
      }
      const a = b.getAttribute("data-k");
      if (a === "left") pmove(-1);
      else if (a === "right") pmove(1);
      else if (a === "rot") protate();
      else phard();
    };
    b.addEventListener("click", handler);
    padHandlers.push([b, handler]);
  });

  function glideToFooter() {
    const startY = scrollTopOf(scrollEl);
    const start = performance.now();
    let rafId2 = 0;
    function tick(now: number) {
      const p = Math.min(1, (now - start) / 560);
      const e = 1 - (1 - p) ** 3;
      const maxNow = scrollHeightOf(scrollEl) - clientHeightOf(scrollEl);
      scrollToY(scrollEl, startY + (maxNow - startY) * e);
      if (p < 1) rafId2 = requestAnimationFrame(tick);
    }
    rafId2 = requestAnimationFrame(tick);
    cleanups.push(() => cancelAnimationFrame(rafId2));
  }
  function startGame() {
    if (phase !== "idle") return;
    phase = "flick";
    flick = 0.001;
  }
  function endGame() {
    phase = "idle";
    footer!.classList.remove("playing");
    clearTimeout(grav);
    flick = 0;
    over = false;
    curs = [];
  }
  function key(e: KeyboardEvent) {
    if (phase !== "play") return;
    if (e.key === "Escape") {
      endGame();
      return;
    }
    if (over) {
      if (e.key === "Enter") beginPlay();
      return;
    }
    if (e.key === "ArrowLeft") {
      pmove(-1);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      pmove(1);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      psoft();
      e.preventDefault();
    } else if (e.key === "ArrowUp" || e.key === "x" || e.key === "X") {
      protate();
      e.preventDefault();
    } else if (e.key === " ") {
      phard();
      e.preventDefault();
    }
  }
  document.addEventListener("keydown", key);
  cleanups.push(() => document.removeEventListener("keydown", key));
  const onFooterClick = (e: MouseEvent) => {
    if (
      phase !== "idle" ||
      (e.target as Element).closest?.(".tt-close,.tt-pad,.tt-again")
    )
      return;
    startGame();
  };
  footer.addEventListener("click", onFooterClick);
  cleanups.push(() => footer.removeEventListener("click", onFooterClick));

  let rafId = 0;
  function loop() {
    if (on && !reduce) {
      if (phase === "idle") {
        at++;
        if (at % 5 === 0) astep();
        if (afade > 0) {
          afade += 0.05;
          if (afade >= 1) {
            grid = new Int8Array(cols * rows);
            seed();
            afade = 0;
          }
        }
        adraw();
      } else if (phase === "flick") {
        flick += 0.06;
        adraw();
        if (flick >= 1) {
          phase = "expand";
          footer!.classList.add("playing");
          glideToFooter();
          window.setTimeout(beginPlay, 580);
        }
      }
    }
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
  cleanups.push(() => cancelAnimationFrame(rafId));

  const teaserCv = root.querySelector<HTMLCanvasElement>("#ttpieces");
  const teaserCtx = teaserCv?.getContext("2d");
  if (teaserCv && teaserCtx) {
    const U = 4;
    const Wc = 5 * U;
    const Hc = 4 * U;
    teaserCv.width = Math.round(Wc * DPR);
    teaserCv.height = Math.round(Hc * DPR);
    teaserCv.style.width = `${Wc}px`;
    teaserCv.style.height = `${Hc}px`;
    teaserCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const COL = ["#3b5bd9", "#f5c518", "#e0492a", "#d8ff00"];
    const P = [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
      ],
      [
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ],
    ];
    let i = 0;
    function draw() {
      teaserCtx!.clearRect(0, 0, Wc, Hc);
      const m = P[i % P.length];
      const col = COL[i % COL.length];
      let mx = 0;
      let my = 0;
      for (const k of m) {
        if (k[0] > mx) mx = k[0];
        if (k[1] > my) my = k[1];
      }
      const ox = (Wc - (mx + 1) * U) / 2;
      const oy = (Hc - (my + 1) * U) / 2;
      teaserCtx!.fillStyle = col;
      for (const k of m)
        teaserCtx!.fillRect(ox + k[0] * U, oy + k[1] * U, U - 1, U - 1);
    }
    draw();
    const teaserInt = window.setInterval(() => {
      i++;
      draw();
    }, 520);
    cleanups.push(() => clearInterval(teaserInt));
  }

  cleanups.push(() => {
    clearTimeout(grav);
    againBtn?.removeEventListener("click", onAgain);
    closeBtn?.removeEventListener("click", onClose);
    for (const [b, handler] of padHandlers)
      b.removeEventListener("click", handler);
    ov.remove();
  });

  return () => {
    for (const c of cleanups) c();
  };
}

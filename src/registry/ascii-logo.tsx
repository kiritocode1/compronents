"use client";

/**
 * Interactive ASCII Logo — a logo dissolved into a live grid of ASCII glyphs.
 *
 * A source image is sampled onto a dot grid drawn on a <canvas>; cells bright
 * enough to clear the threshold light up as ASCII characters that flicker in
 * place. The cursor shoves nearby glyphs outward with a little spring physics
 * (push, then ease back), so the wordmark scatters and reforms as you move
 * through it. No animation library — just canvas 2D and a rAF loop.
 *
 * Fills its container, so drop it into any bounded, relatively-positioned box
 * (or a full-screen section). Pass your own `src`; the pixels are read back off
 * a canvas, so it must be same-origin or CORS-enabled.
 *
 * BLANK — aryank.space
 */

import { useEffect, useRef } from "react";

export interface AsciiLogoProps {
  /** Logo image, sampled pixel-by-pixel. Same-origin or CORS-enabled. */
  src?: string;
  /** Frame background. */
  background?: string;
  /** Resting dot-grid color. */
  gridColor?: string;
  /** Lit glyph color. */
  charColor?: string;
  /** Glyph ramp, dark → bright. */
  chars?: string;
  /** Brightness (0–1) a sampled pixel must clear to become a glyph. */
  threshold?: number;
  /** Cell size / gap in px (desktop, then below mobileBreakpoint). */
  cellSize?: number;
  cellGap?: number;
  mobileCellSize?: number;
  mobileCellGap?: number;
  mobileBreakpoint?: number;
  /** Cursor push radius (in cells), strength, spring stiffness, damping. */
  pushRadius?: number;
  pushForce?: number;
  spring?: number;
  damping?: number;
  /** How often (ms) lit glyphs reshuffle their character. */
  flickerMs?: number;
  /** Logo width as a percentage of the container. */
  logoScale?: number;
}

const COMPRONENTS_ASSET_BASE = "https://compronents.dev/assets/ascii-logo";

type Cell = {
  col: number;
  row: number;
  char: string;
  isLit: boolean;
  offsetX: number;
  offsetY: number;
  velX: number;
  velY: number;
};

export default function AsciiLogo({
  src = `${COMPRONENTS_ASSET_BASE}/logo.png`,
  background = "#0f0f0f",
  gridColor = "#171717",
  charColor = "#dadada",
  chars = ".:+*#%@0369",
  threshold = 0.5,
  cellSize = 8,
  cellGap = 2,
  mobileCellSize = 3,
  mobileCellGap = 1,
  mobileBreakpoint = 768,
  pushRadius = 5,
  pushForce = 30,
  spring = 0.025,
  damping = 0.5,
  flickerMs = 50,
  logoScale = 75,
}: AsciiLogoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `src` re-runs setup so a new source image is re-sampled from scratch.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const logoImg = imgRef.current;
    if (!root || !canvas || !logoImg) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    let step = cellSize + cellGap;
    let size = cellSize;
    let cols = 0;
    let rows = 0;
    let cells: Cell[] = [];

    const setupCanvas = () => {
      const isMobile = window.innerWidth < mobileBreakpoint;
      size = isMobile ? mobileCellSize : cellSize;
      const gap = isMobile ? mobileCellGap : cellGap;
      step = size + gap;
      const w = root.clientWidth;
      const h = root.clientHeight;
      cols = Math.floor(w / step);
      rows = Math.floor(h / step);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const sampleLogoIntoCells = () => {
      const rootRect = root.getBoundingClientRect();
      const rect = logoImg.getBoundingClientRect();
      const logoCols = Math.max(1, Math.ceil(rect.width / step));
      const logoRows = Math.max(1, Math.ceil(rect.height / step));
      const startCol = Math.floor((rect.left - rootRect.left) / step);
      const startRow = Math.floor((rect.top - rootRect.top) / step);

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = logoCols;
      sampleCanvas.height = logoRows;
      const sampleCtx = sampleCanvas.getContext("2d");
      if (!sampleCtx) return;
      sampleCtx.fillStyle = "#000";
      sampleCtx.fillRect(0, 0, logoCols, logoRows);
      sampleCtx.drawImage(logoImg, 0, 0, logoCols, logoRows);
      const { data } = sampleCtx.getImageData(0, 0, logoCols, logoRows);

      cells = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const inLogo =
            col >= startCol &&
            col < startCol + logoCols &&
            row >= startRow &&
            row < startRow + logoRows;
          let isLit = false;
          let char = " ";
          if (inLogo) {
            const idx = ((row - startRow) * logoCols + (col - startCol)) * 4;
            const brightness =
              (data[idx] * 0.299 +
                data[idx + 1] * 0.587 +
                data[idx + 2] * 0.114) /
              255;
            isLit = brightness > threshold;
            char = isLit
              ? chars[
                  Math.min(
                    chars.length - 1,
                    Math.floor(brightness * chars.length),
                  )
                ]
              : " ";
          }
          cells.push({
            col,
            row,
            char,
            isLit,
            offsetX: 0,
            offsetY: 0,
            velX: 0,
            velY: 0,
          });
        }
      }
    };

    const renderFrame = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = gridColor;
      for (const { col, row } of cells) {
        ctx.fillRect(col * step, row * step, size, size);
      }

      ctx.font = `${size + 2}px monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      ctx.fillStyle = charColor;
      for (const { col, row, char, isLit, offsetX, offsetY } of cells) {
        if (!isLit) continue;
        const x = (col + Math.round(offsetX)) * step;
        const y = (row + Math.round(offsetY)) * step;
        ctx.fillText(char, x + size / 2, y);
      }
    };

    const init = () => {
      setupCanvas();
      sampleLogoIntoCells();
      renderFrame();
    };

    const mouse = { col: -999, row: -999, isMoving: false };
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const updatePhysics = () => {
      for (const cell of cells) {
        if (!cell.isLit) continue;
        if (mouse.isMoving) {
          const dx = cell.col + cell.offsetX - mouse.col;
          const dy = cell.row + cell.offsetY - mouse.row;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pushRadius && dist > 0) {
            const force = (1 - dist / pushRadius) ** 2 * pushForce;
            cell.velX += (dx / dist) * force;
            cell.velY += (dy / dist) * force;
          }
        }
        cell.velX += -cell.offsetX * spring;
        cell.velY += -cell.offsetY * spring;
        cell.velX *= damping;
        cell.velY *= damping;
        cell.offsetX += cell.velX;
        cell.offsetY += cell.velY;
        if (Math.abs(cell.offsetX) < 0.01 && Math.abs(cell.velX) < 0.01) {
          cell.offsetX = cell.velX = 0;
        }
        if (Math.abs(cell.offsetY) < 0.01 && Math.abs(cell.velY) < 0.01) {
          cell.offsetY = cell.velY = 0;
        }
      }
    };

    let frame = 0;
    const animationLoop = () => {
      updatePhysics();
      renderFrame();
      frame = requestAnimationFrame(animationLoop);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      mouse.col = (e.clientX - rect.left) / step;
      mouse.row = (e.clientY - rect.top) / step;
      mouse.isMoving = true;
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        mouse.isMoving = false;
      }, flickerMs);
    };

    const onMouseLeave = () => {
      mouse.col = mouse.row = -999;
      mouse.isMoving = false;
    };

    const flicker = setInterval(() => {
      for (const cell of cells) {
        if (cell.isLit) {
          cell.char = chars[Math.floor(Math.random() * chars.length)];
        }
      }
    }, flickerMs);

    const startWhenReady = () => {
      init();
      animationLoop();
    };
    if (logoImg.complete && logoImg.naturalWidth) {
      startWhenReady();
    } else {
      logoImg.addEventListener("load", startWhenReady, { once: true });
    }

    const observer = new ResizeObserver(() => init());
    observer.observe(root);

    root.addEventListener("mousemove", onMouseMove);
    root.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(flicker);
      if (idleTimer) clearTimeout(idleTimer);
      observer.disconnect();
      logoImg.removeEventListener("load", startWhenReady);
      root.removeEventListener("mousemove", onMouseMove);
      root.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [
    src,
    gridColor,
    charColor,
    chars,
    threshold,
    cellSize,
    cellGap,
    mobileCellSize,
    mobileCellGap,
    mobileBreakpoint,
    pushRadius,
    pushForce,
    spring,
    damping,
    flickerMs,
  ]);

  return (
    <div className="al-root" ref={rootRef} style={{ background }}>
      <style>{styles}</style>
      <canvas ref={canvasRef} />
      <div className="al-logo" style={{ width: `${logoScale}%` }}>
        {/* biome-ignore lint/performance/noImgElement: pixels are read back off a canvas for ASCII sampling. */}
        <img ref={imgRef} src={src} alt="" crossOrigin="anonymous" />
      </div>
    </div>
  );
}

const styles = `
.al-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.al-root canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.al-root .al-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.al-root .al-logo img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  visibility: hidden;
}
`;

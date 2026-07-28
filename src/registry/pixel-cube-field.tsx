"use client";

/**
 * Pixel Cube Field - a grid of RGB-split wireframe cubes that aim at the cursor.
 *
 * Every cube is the same rasterizer as the single Pixel Cube Avatar: twelve
 * edges projected through a two-axis rotation, drawn with an integer Bresenham
 * line into three 8-bit channel buffers, with the red and blue passes offset a
 * few degrees from green so each wireframe splits into chromatic fringes. The
 * whole field shares one cell buffer and one ImageData write, so a 6 by 6 grid
 * is still a single canvas and a single rAF loop.
 *
 * The orientation of each cube comes from its offset to the cursor: the cube
 * under the pointer sits head-on and the tilt grows with distance, saturating
 * at `radius` cubes out, so the field reads as a lens pointed at wherever the
 * mouse is. Every cube keeps its own rotation, so they lag into place
 * independently rather than snapping as a block. Cubes are never scaled by
 * distance, so the grid stays flat instead of bulging.
 *
 * When the pointer has been still for three seconds the focus drifts on its own
 * between random points. A click sends a ring of full revolutions outward from
 * the cube you hit, one ring at a time.
 *
 * No dependencies.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

export interface PixelCubeFieldProps {
  /** Rendered width and height in px. */
  size?: number;
  /** Cubes per side. */
  gridSize?: number;
  /** Pixel cells each cube box is drawn into. Lower reads coarser. */
  cellsPerCube?: number;
  /** Tilt in degrees a cube reaches once it is `radius` cubes from the cursor. */
  maxAngle?: number;
  /** Distance in cubes at which the tilt stops growing. */
  radius?: number;
  /** Seconds for a cube to close half the gap to its target angle. */
  smoothing?: number;
  /** Degrees the red and blue passes sit off green. 0 disables the fringing. */
  chromDeg?: number;
  /** How much of the previous frame bleeds into this one, 0 to 1. */
  fade?: number;
  /** Backdrop the field is rasterized onto. Hex only, it is baked per pixel. */
  background?: string;
  /** Drift the focus on its own once the pointer has been idle. */
  autoAnimate?: boolean;
  /** Send a ring of revolutions outward from the clicked cube. */
  rippleOnClick?: boolean;
  /** Multiplier on how fast the ripple travels and spins. */
  rippleSpeed?: number;
  /** Accessible label for the canvas. */
  label?: string;
  className?: string;
}

const TAU = Math.PI * 2;
/** Orientation a cube holds when it sits directly under the cursor. */
const BASE_A = 4.2;
const BASE_B = 0.54;
/** Simulation rate. */
const FPS = 28;
/** Cube radius as a fraction of its box, from the single-cube original. */
const SIZE_F = 0.27;
/** Per-cell brightness a drawn edge writes, and the extra a ripple adds. */
const EDGE_LEVEL = 200;
const RIPPLE_LEVEL = 55;
/** Seconds of pointer stillness before the focus starts drifting on its own. */
const IDLE_DELAY = 3;
/** Degrees of chroma per unit of scale offset, from the single-cube original. */
const CHROM_SCALE = 0.004;

const VERTS = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

function project(x: number, y: number, z: number, a: number, b: number) {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const y1 = y * ca - z * sa;
  const z1 = y * sa + z * ca;
  const cb = Math.cos(b);
  const sb = Math.sin(b);
  return { x: x * cb + z1 * sb, y: y1, z: -x * sb + z1 * cb };
}

/** Bresenham into a cell buffer, keeping the brighter of old and new. */
function drawLine(
  buf: Uint8Array,
  w: number,
  h: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  level: number,
) {
  let x = x0 | 0;
  let y = y0 | 0;
  const ex = x1 | 0;
  const ey = y1 | 0;
  const dx = Math.abs(ex - x);
  const dy = Math.abs(ey - y);
  const sx = x < ex ? 1 : -1;
  const sy = y < ey ? 1 : -1;
  let err = dx - dy;
  for (;;) {
    if (x >= 0 && x < w && y >= 0 && y < h) {
      const i = y * w + x;
      if (level > buf[i]) buf[i] = level;
    }
    if (x === ex && y === ey) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

/** Shortest signed delta from `to` to `from`, wrapped into [-PI, PI]. */
function shortAngle(from: number, to: number) {
  let d = (from - to) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export default function PixelCubeField({
  size = 640,
  gridSize = 6,
  cellsPerCube = 17,
  maxAngle = 55,
  radius = 3,
  smoothing = 0.12,
  chromDeg = 13,
  fade = 0.9,
  background = "#0a0a0a",
  autoAnimate = true,
  rippleOnClick = true,
  rippleSpeed = 2,
  label = "Grid of wireframe cubes that follow the cursor",
  className,
}: PixelCubeFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cols = gridSize * cellsPerCube;
  const cell = Math.max(1, Math.round(size / cols));
  const canvasSize = cols * cell;

  useEffect(() => {
    const hostEl = hostRef.current;
    const canvas = canvasRef.current;
    if (!hostEl || !canvas) return;
    // Aliased so the narrowing survives inside the hoisted helper bodies.
    const host = hostEl;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    // Aliased so the narrowing survives inside the hoisted render/frame bodies.
    const ctx = ctx2d;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bgR = parseInt(background.slice(1, 3), 16) || 0;
    const bgG = parseInt(background.slice(3, 5), 16) || 0;
    const bgB = parseInt(background.slice(5, 7), 16) || 0;
    // Uint32 view of RGBA bytes on a little-endian host: 0xAABBGGRR.
    const bgPacked = (0xff000000 | (bgB << 16) | (bgG << 8) | bgR) >>> 0;

    const rows = cols;
    const cellCount = cols * rows;
    const curR = new Uint8Array(cellCount);
    const curG = new Uint8Array(cellCount);
    const curB = new Uint8Array(cellCount);
    const prevR = new Uint8Array(cellCount);
    const prevG = new Uint8Array(cellCount);
    const prevB = new Uint8Array(cellCount);
    const img = ctx.createImageData(canvasSize, canvasSize);
    const px = new Uint32Array(img.data.buffer);

    // Per-cube state. Each cube eases toward its own target independently.
    const n = gridSize * gridSize;
    const rotA = new Float64Array(n).fill(BASE_A);
    const rotB = new Float64Array(n).fill(BASE_B);
    const lastA = new Float64Array(n).fill(BASE_A);
    const lastB = new Float64Array(n).fill(BASE_B);
    const chromA = new Float64Array(n);
    const chromB = new Float64Array(n);
    // Absolute time each cube's ripple begins; Infinity means no ripple queued.
    const rippleAt = new Float64Array(n).fill(Number.POSITIVE_INFINITY);

    const cubeRadius = cellsPerCube * SIZE_F;
    const maxRad = (maxAngle * Math.PI) / 180;
    const chromRad = (chromDeg * Math.PI) / 180;
    const chromScale = chromDeg * CHROM_SCALE;
    const rippleSpread = 0.15 / rippleSpeed;
    const rippleDur = 0.6 / rippleSpeed;

    let raf = 0;
    let lastTime = 0;
    let frameAccum = 0;
    let clock = 0;
    let idleFor = 0;
    let pointerInside = false;

    // Focus is in cube units: (0,0) is the top-left cube, (gridSize-1, …) the last.
    let focusCol = (gridSize - 1) / 2;
    let focusRow = (gridSize - 1) / 2;
    let driftCol = focusCol;
    let driftRow = focusRow;
    let targetCol = Math.random() * (gridSize - 1);
    let targetRow = Math.random() * (gridSize - 1);

    function render() {
      curR.fill(0);
      curG.fill(0);
      curB.fill(0);

      for (let i = 0; i < n; i++) {
        const boxCol = (i % gridSize) * cellsPerCube;
        const boxRow = ((i / gridSize) | 0) * cellsPerCube;
        const cx = boxCol + cellsPerCube / 2;
        const cy = boxRow + cellsPerCube / 2;

        const u = (clock - rippleAt[i]) / rippleDur;
        const inRipple = u >= 0 && u < 1;
        // One full turn as the wave passes, so it lands where it started.
        const spin = inRipple ? (1 - (1 - u) ** 3) * TAU : 0;
        const level = inRipple
          ? EDGE_LEVEL + Math.sin(u * Math.PI) * RIPPLE_LEVEL
          : EDGE_LEVEL;

        const a = rotA[i];
        const b = rotB[i] + spin;

        const channel = (
          buf: Uint8Array,
          dB: number,
          scale: number,
          dA: number,
        ) => {
          const r = cubeRadius * scale;
          for (const [ia, ib] of EDGES) {
            const va = VERTS[ia];
            const vb = VERTS[ib];
            const pa = project(va[0], va[1], va[2], a + dA, b + dB);
            const pb = project(vb[0], vb[1], vb[2], a + dA, b + dB);
            drawLine(
              buf,
              cols,
              rows,
              cx + pa.x * r,
              cy + pa.y * r,
              cx + pb.x * r,
              cy + pb.y * r,
              level | 0,
            );
          }
        };

        channel(curR, -chromRad - chromB[i], 1 - chromScale, -chromA[i]);
        channel(curG, 0, 1, 0);
        channel(curB, chromRad + chromB[i], 1 + chromScale, chromA[i]);
      }

      // Blend the previous frame back in so motion smears a decaying trail.
      for (let i = 0; i < cellCount; i++) {
        const r = (prevR[i] * fade) | 0;
        const g = (prevG[i] * fade) | 0;
        const b = (prevB[i] * fade) | 0;
        if (r > curR[i]) curR[i] = r;
        if (g > curG[i]) curG[i] = g;
        if (b > curB[i]) curB[i] = b;
      }
      prevR.set(curR);
      prevG.set(curG);
      prevB.set(curB);

      px.fill(bgPacked);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          const r = Math.max(curR[i], bgR);
          const g = Math.max(curG[i], bgG);
          const b = Math.max(curB[i], bgB);
          if (r === bgR && g === bgG && b === bgB) continue;
          const packed = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
          const x0 = col * cell;
          const y0 = row * cell;
          for (let y = y0; y < y0 + cell; y++) {
            const rowOff = y * canvasSize;
            for (let x = x0; x < x0 + cell; x++) px[rowOff + x] = packed;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function frame(now: number) {
      if (!lastTime) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      clock += dt;

      if (!pointerInside) idleFor += dt;

      // Once the pointer has been away long enough, the focus wanders by itself.
      const drifting = autoAnimate && !reduced && idleFor >= IDLE_DELAY;
      if (drifting) {
        const speed = 1 - Math.exp(-dt * 1.2);
        driftCol += (targetCol - driftCol) * speed;
        driftRow += (targetRow - driftRow) * speed;
        if (Math.hypot(targetCol - driftCol, targetRow - driftRow) < 0.1) {
          targetCol = Math.random() * (gridSize - 1);
          targetRow = Math.random() * (gridSize - 1);
        }
        focusCol = driftCol;
        focusRow = driftRow;
      } else if (!pointerInside && !autoAnimate) {
        // With drift off, the field relaxes back to a head-on grid.
        focusCol = (gridSize - 1) / 2;
        focusRow = (gridSize - 1) / 2;
      }

      // Half-life smoothing, so the eased angles do not depend on frame rate.
      const k = smoothing > 0 ? 1 - 2 ** (-dt / smoothing) : 1;
      const chromaK = 1 - Math.exp(-dt * 10);

      for (let i = 0; i < n; i++) {
        const col = i % gridSize;
        const row = (i / gridSize) | 0;
        // Offset to the focus, measured in radii and clamped to one radius, so
        // the tilt saturates instead of running away at the far corners.
        let ox = (col - focusCol) / radius;
        let oy = (row - focusRow) / radius;
        const mag = Math.hypot(ox, oy);
        if (mag > 1) {
          ox /= mag;
          oy /= mag;
        }
        const targetA = BASE_A + oy * maxRad;
        const targetB = BASE_B + ox * maxRad;

        rotA[i] += shortAngle(targetA, rotA[i]) * k;
        rotB[i] += shortAngle(targetB, rotB[i]) * k;

        // Fringing widens with how fast this cube actually turned this frame.
        const dA = shortAngle(rotA[i], lastA[i]);
        const dB = shortAngle(rotB[i], lastB[i]);
        lastA[i] = rotA[i];
        lastB[i] = rotB[i];
        chromA[i] +=
          (Math.max(-0.4, Math.min(0.4, dA * 1.4)) - chromA[i]) * chromaK;
        chromB[i] +=
          (Math.max(-0.4, Math.min(0.4, dB * 1.4)) - chromB[i]) * chromaK;
      }

      frameAccum += dt;
      if (frameAccum >= 1 / FPS) {
        frameAccum %= 1 / FPS;
        render();
      }
      raf = requestAnimationFrame(frame);
    }

    /** Pointer position in cube units, where 0 is the centre of the first cube. */
    function toCubeSpace(clientX: number, clientY: number) {
      const rect = host.getBoundingClientRect();
      const w = rect.width / gridSize;
      const h = rect.height / gridSize;
      return {
        col: (clientX - rect.left) / w - 0.5,
        row: (clientY - rect.top) / h - 0.5,
      };
    }

    const onMove = (e: PointerEvent) => {
      if (!Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
      const { col, row } = toCubeSpace(e.clientX, e.clientY);
      focusCol = col;
      focusRow = row;
      driftCol = col;
      driftRow = row;
      pointerInside = true;
      idleFor = 0;
    };

    const onLeave = () => {
      pointerInside = false;
      idleFor = 0;
    };

    const onClick = (e: MouseEvent) => {
      if (!rippleOnClick || reduced) return;
      const { col, row } = toCubeSpace(e.clientX, e.clientY);
      const hitCol = Math.round(col);
      const hitRow = Math.round(row);
      for (let i = 0; i < n; i++) {
        const ring = Math.round(
          Math.hypot((i % gridSize) - hitCol, ((i / gridSize) | 0) - hitRow),
        );
        rippleAt[i] = clock + ring * rippleSpread;
      }
    };

    const onHidden = () => {
      if (!document.hidden) return;
      // Drop the trail and the clock so returning to the tab does not jump.
      prevR.fill(0);
      prevG.fill(0);
      prevB.fill(0);
      rippleAt.fill(Number.POSITIVE_INFINITY);
      lastTime = 0;
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onHidden);

    render();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [
    autoAnimate,
    background,
    canvasSize,
    cell,
    cellsPerCube,
    chromDeg,
    cols,
    fade,
    gridSize,
    maxAngle,
    radius,
    rippleOnClick,
    rippleSpeed,
    smoothing,
  ]);

  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      aria-label={label}
      style={{
        width: canvasSize,
        height: canvasSize,
        flex: "none",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

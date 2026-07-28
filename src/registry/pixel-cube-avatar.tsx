"use client";

/**
 * Pixel Cube Avatar - a wireframe cube rasterized onto a 17x17 pixel grid.
 *
 * Twelve cube edges are projected with a hand-rolled two-axis rotation and
 * drawn with an integer Bresenham line into three separate 8-bit channel
 * buffers. The red and blue passes are rotated a few degrees apart from green
 * and scaled slightly differently, so the wireframe splits into chromatic
 * fringes; each frame also blends the previous frame back in at 90 percent, so
 * fast motion smears a decaying trail behind the edges. The 289 cells are then
 * expanded into square blocks in a single ImageData write, which is what gives
 * the low-resolution look.
 *
 * The cube has five states: idle, spin on hover, drag while a pointer is held,
 * coast on release, and a critically-damped spring that returns it to the
 * nearest of two rest poses. Clicking fires a burst, a randomized multi-turn
 * tumble with a decaying sine wobble layered on top. Canvas 2D and one rAF
 * loop, no dependencies.
 *
 * Fixed 17x17 simulation; `size` only changes how large each cell is drawn.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

export interface PixelCubeAvatarProps {
  /** Rendered width and height in px. The grid stays 17x17; cells scale. */
  size?: number;
  /** Backdrop the cube is rasterized onto. Hex only, it is baked per pixel. */
  background?: string;
  /** Accessible label for the canvas. */
  label?: string;
  className?: string;
}

/** Cells per side. The whole look depends on this staying small. */
const GRID = 17;
const TAU = Math.PI * 2;
/** Rest orientation the cube settles back to. */
const BASE_A = 4.2;
const BASE_B = 0.54;
/** Simulation rate. Velocities below are expressed per frame at this rate. */
const FPS = 28;
/** Radians of rotation per px of pointer drag. */
const DRAG_SENS = 0.012;

const CONFIG = {
  cubeCount: 1,
  twistDeg: 52.5,
  chromDeg: 13,
  sizeF: 0.27,
  fade: 0.9,
  speedY: 0.051,
  speedX: 0.022,
};

/** Speed (rad/s) that saturates the motion-reactive chroma and fade drop. */
const SPEED_NORM = 8;
const CHROMA_GAIN = 1.4;
const CHROMA_MAX = 0.4;
const FADE_DROP = 0.32;
/** Per-cell brightness a drawn edge writes. */
const EDGE_LEVEL = 200;

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

/** The two orientations that read as a cube head-on; whichever is nearer wins. */
const REST_POSES = [
  [BASE_A, BASE_B],
  [Math.PI - BASE_A, BASE_B + Math.PI],
];

type Mode =
  | "idle"
  | "spin"
  | "drag"
  | "coast"
  | "return"
  | "settle"
  | "decay"
  | "burst";

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

/** Re-express `angle` on the branch nearest `near`. */
function unwrapNear(angle: number, near: number) {
  return near + shortAngle(angle, near);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function PixelCubeAvatar({
  size = 320,
  background = "#161616",
  label = "Rotating pixel cube",
  className,
}: PixelCubeAvatarProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cell = Math.max(1, Math.round(size / GRID));
  const canvasSize = GRID * cell;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
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

    const cols = GRID;
    const rows = GRID;
    const count = cols * rows;
    const curR = new Uint8Array(count);
    const curG = new Uint8Array(count);
    const curB = new Uint8Array(count);
    const prevR = new Uint8Array(count);
    const prevG = new Uint8Array(count);
    const prevB = new Uint8Array(count);
    const img = ctx.createImageData(canvasSize, canvasSize);
    const px = new Uint32Array(img.data.buffer);

    let rotA = BASE_A;
    let rotB = BASE_B;
    let velA = 0;
    let velB = 0;
    let mode: Mode = "idle";
    let raf = 0;
    let lastTime = 0;
    let hoverTimer: ReturnType<typeof setTimeout> | undefined;
    let hovering = false;
    let dragging = false;
    let decay = 0;
    let burstT = 0;
    let burstFromA = 0;
    let burstFromB = 0;
    let speedEase = 0;
    let frameAccum = 0;
    let chromA = 0;
    let chromB = 0;
    let lastA = BASE_A;
    let lastB = BASE_B;
    let burstDA = 0;
    let burstDB = 0;
    let burstDur = 0.85;
    let burstWobA = 0;
    let burstWobB = 0;
    let burstCycles = 3;

    let restA = BASE_A;
    let restB = BASE_B;
    let omegaA = 2.5;
    let omegaB = 2.5;
    let damping = 1;

    /** Aim at the nearer rest pose; softer spring the further it has to travel. */
    function pickRest() {
      let best = Infinity;
      for (const [poseA, poseB] of REST_POSES) {
        const dA = shortAngle(poseA, rotA);
        const dB = shortAngle(poseB, rotB);
        const dist = Math.abs(dA) + Math.abs(dB);
        if (dist < best) {
          best = dist;
          restA = rotA + dA;
          restB = rotB + dB;
        }
      }
      const base = 3.6 / (1 + best * 0.35);
      omegaA = base * (0.85 + Math.random() * 0.3);
      omegaB = base * (0.85 + Math.random() * 0.3);
      damping = 0.78 + Math.random() * 0.22;
    }

    function render() {
      curR.fill(0);
      curG.fill(0);
      curB.fill(0);

      const cx = cols / 2;
      const cy = rows / 2;
      const radius = Math.min(cols, rows) * CONFIG.sizeF;
      const twist = (CONFIG.twistDeg * Math.PI) / 180;
      const chromRad = (CONFIG.chromDeg * Math.PI) / 180;
      const chromScale = CONFIG.chromDeg * 0.004;

      const channel = (buf: Uint8Array, dB: number, scale: number, dA = 0) => {
        for (let n = CONFIG.cubeCount; n >= 1; n--) {
          const r = radius * scale * (n / CONFIG.cubeCount);
          const tw = (CONFIG.cubeCount - n) * twist;
          for (const [ia, ib] of EDGES) {
            const va = VERTS[ia];
            const vb = VERTS[ib];
            const pa = project(va[0], va[1], va[2], rotA + dA, rotB + dB + tw);
            const pb = project(vb[0], vb[1], vb[2], rotA + dA, rotB + dB + tw);
            drawLine(
              buf,
              cols,
              rows,
              cx + pa.x * r,
              cy + pa.y * r,
              cx + pb.x * r,
              cy + pb.y * r,
              EDGE_LEVEL,
            );
          }
        }
      };

      channel(curR, -chromRad - chromB, 1 - chromScale, -chromA);
      channel(curG, 0, 1);
      channel(curB, chromRad + chromB, 1 + chromScale, chromA);

      // Blend the previous frame back in, dropping the trail as speed rises.
      const base = mode === "spin" ? 0.8 : CONFIG.fade;
      const drop = mode === "burst" ? FADE_DROP * 0.45 : FADE_DROP;
      const fade = base * (1 - drop * speedEase);
      for (let i = 0; i < count; i++) {
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
      const off = ((canvasSize - cols * cell) / 2) | 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          const r = Math.max(curR[i], bgR);
          const g = Math.max(curG[i], bgG);
          const b = Math.max(curB[i], bgB);
          if (r === bgR && g === bgG && b === bgB) continue;
          const packed = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
          const x0 = off + col * cell;
          const y0 = off + row * cell;
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
      const frames = dt * FPS;

      if (!Number.isFinite(rotA) || !Number.isFinite(rotB)) {
        rotA = restA = BASE_A;
        rotB = restB = BASE_B;
        velA = velB = 0;
        if (mode !== "spin") mode = "settle";
      }

      if (mode === "spin") {
        rotB += CONFIG.speedY * frames;
        rotA += CONFIG.speedX * frames;
      } else if (mode === "coast") {
        rotA += velA * frames;
        rotB += velB * frames;
        const k = 0.93 ** frames;
        velA *= k;
        velB *= k;
        if (Math.abs(velA) + Math.abs(velB) < 0.02) {
          if (hovering && !reduced) {
            mode = "spin";
          } else {
            pickRest();
            omegaA *= 1.6;
            omegaB *= 1.6;
            mode = "return";
          }
        }
      } else if (mode === "return" || mode === "settle") {
        let vA = velA * FPS;
        let vB = velB * FPS;
        vA +=
          (-omegaA * omegaA * (rotA - restA) - 2 * damping * omegaA * vA) * dt;
        vB +=
          (-omegaB * omegaB * (rotB - restB) - 2 * damping * omegaB * vB) * dt;
        rotA += vA * dt;
        rotB += vB * dt;
        velA = vA / FPS;
        velB = vB / FPS;
        if (
          Math.abs(rotA - restA) + Math.abs(rotB - restB) < 0.003 &&
          Math.abs(vA) + Math.abs(vB) < 0.02
        ) {
          rotA = restA;
          rotB = restB;
          mode = "decay";
          decay = 60;
        }
      } else if (mode === "decay") {
        // Keep drawing for a beat so the trail can fade out, then park the loop.
        decay -= frames;
        if (decay <= 0) {
          render();
          mode = "idle";
          raf = 0;
          return;
        }
      } else if (mode === "burst") {
        burstT += dt;
        const t = Math.min(burstT / burstDur, 1);
        const ease = 1 - (1 - t) ** 3;
        const wob = Math.sin(t * Math.PI * burstCycles) * (1 - t);
        rotA = burstFromA + burstDA * ease + wob * burstWobA;
        rotB = burstFromB + burstDB * ease + wob * burstWobB;
        if (t >= 1) {
          rotA = burstFromA + burstDA;
          rotB = burstFromB + burstDB;
          velA = velB = 0;
          pickRest();
          mode = hovering && !reduced ? "spin" : "settle";
        }
      }

      const dA = shortAngle(rotA, lastA);
      const dB = shortAngle(rotB, lastB);
      lastA = rotA;
      lastB = rotB;

      const active =
        mode === "drag" ||
        mode === "coast" ||
        mode === "return" ||
        mode === "burst";
      const speed = (Math.abs(dA) + Math.abs(dB)) / Math.max(dt, 0.001);
      const target = active ? Math.min(1, speed / SPEED_NORM) : 0;
      speedEase += (target - speedEase) * (1 - Math.exp(-dt * 6));
      if (target === 0 && speedEase < 0.02) speedEase = 0;

      const k = 1 - Math.exp(-dt * 10);
      chromA +=
        (clamp(active ? dA * CHROMA_GAIN : 0, -CHROMA_MAX, CHROMA_MAX) -
          chromA) *
        k;
      chromB +=
        (clamp(active ? dB * CHROMA_GAIN : 0, -CHROMA_MAX, CHROMA_MAX) -
          chromB) *
        k;
      if (!active && Math.abs(chromA) + Math.abs(chromB) < 0.002)
        chromA = chromB = 0;

      frameAccum += dt;
      if (frameAccum >= 1 / FPS) {
        frameAccum %= 1 / FPS;
        render();
      }
      raf = requestAnimationFrame(frame);
    }

    function setMode(next: Mode) {
      mode = next;
      if (!raf) {
        lastTime = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    render();

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hovering = true;
      clearTimeout(hoverTimer);
      if (!reduced && !dragging && mode !== "burst") {
        hoverTimer = setTimeout(() => setMode("spin"), 100);
      }
    };

    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hovering = false;
      clearTimeout(hoverTimer);
      if (mode === "spin") {
        velA = CONFIG.speedX;
        velB = CONFIG.speedY;
        pickRest();
        setMode("settle");
      }
    };

    let lastX = 0;
    let lastY = 0;
    let dragDist = 0;
    // Flip horizontal drag when the cube is showing its far side.
    let dragSign = 1;
    let lastMove = 0;
    let pointerId: number | null = null;

    const onDown = (e: PointerEvent) => {
      if (
        dragging ||
        !Number.isFinite(e.clientX) ||
        !Number.isFinite(e.clientY)
      )
        return;
      dragging = true;
      pointerId = e.pointerId;
      dragDist = 0;
      velA = velB = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMove = e.timeStamp;
      dragSign = Math.cos(rotA) >= 0 ? 1 : -1;
      clearTimeout(hoverTimer);
      setMode("drag");
      host.setPointerCapture(e.pointerId);
      e.preventDefault();
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      let dx = e.clientX - lastX;
      let dy = e.clientY - lastY;
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
      dx = clamp(dx, -80, 80);
      dy = clamp(dy, -80, 80);
      lastX = e.clientX;
      lastY = e.clientY;
      dragDist += Math.abs(dx) + Math.abs(dy);
      rotB += dx * DRAG_SENS * dragSign;
      rotA += dy * DRAG_SENS;
      const elapsed = (Math.max(e.timeStamp - lastMove, 1) / 1000) * FPS;
      lastMove = e.timeStamp;
      velB += ((dx * DRAG_SENS * dragSign) / elapsed - velB) * 0.35;
      velA += ((dy * DRAG_SENS) / elapsed - velA) * 0.35;
    };

    const onUp = (e: PointerEvent | null) => {
      if (!dragging || (e && e.pointerId != null && e.pointerId !== pointerId))
        return;
      dragging = false;
      pointerId = null;
      // A pointer that sat still before release should not fling.
      if (!e || !Number.isFinite(e.timeStamp) || e.timeStamp - lastMove > 100) {
        velA = velB = 0;
      }
      if (!Number.isFinite(velA) || !Number.isFinite(velB)) velA = velB = 0;
      velA = clamp(velA, -0.3, 0.3);
      velB = clamp(velB, -0.3, 0.3);
      setMode("coast");
    };

    const onClick = (e: MouseEvent) => {
      if (dragDist > 6) {
        e.stopImmediatePropagation();
        e.preventDefault();
        dragDist = 0;
        return;
      }
      if (reduced || mode === "burst") return;
      clearTimeout(hoverTimer);
      rotA = unwrapNear(rotA, BASE_A);
      rotB = unwrapNear(rotB, BASE_B);
      burstFromA = rotA;
      burstFromB = rotB;
      const turn = () =>
        (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random()) * TAU;
      // A quarter of clicks tumble on one axis only.
      const roll = Math.random();
      burstDA = roll < 0.25 ? 0 : turn();
      burstDB = roll >= 0.25 && roll < 0.5 ? 0 : turn();
      burstDur = 0.75 + Math.random() * 0.5;
      burstWobA = (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.6);
      burstWobB = (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.6);
      burstCycles = 2 + Math.random() * 3;
      burstT = 0;
      setMode("burst");
    };

    const onHidden = () => {
      if (!document.hidden) return;
      clearTimeout(hoverTimer);
      dragging = false;
      pointerId = null;
      hovering = false;
      velA = velB = 0;
      rotA = restA = lastA = BASE_A;
      rotB = restB = lastB = BASE_B;
      speedEase = 0;
      chromA = chromB = 0;
      frameAccum = 0;
      prevR.fill(0);
      prevG.fill(0);
      prevB.fill(0);
      mode = "idle";
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      render();
    };

    const onBlur = () => onUp(null);

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onUp);
    host.addEventListener("lostpointercapture", onUp);
    host.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("blur", onBlur);

    return () => {
      clearTimeout(hoverTimer);
      if (raf) cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("lostpointercapture", onUp);
      host.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("blur", onBlur);
    };
  }, [background, canvasSize, cell]);

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
        cursor: "pointer",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
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

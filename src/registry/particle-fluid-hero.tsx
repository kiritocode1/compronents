"use client";

/**
 * Particle Fluid Hero - a call to action sitting in a pit of two hundred and
 * fifty shapes that behave like a coarse fluid. Each pair inside the spacing
 * radius pushes apart, blends velocity toward their average, and raises a
 * density count on both; that count then softens gravity, damping, and the
 * separation correction for the frame, which is what keeps a settled pile from
 * boiling. Neighbour lookups go through a spatial hash rebuilt every frame, so
 * the pair test stays local rather than quadratic. Press and drag to inject
 * pointer velocity into anything within range.
 *
 * Self-contained: it fills its own box, no page scroll required. Canvas 2D, no
 * physics library.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

export interface ParticleFluidHeroProps {
  eyebrow?: string;
  headingLines?: string[];
  ctaLabel?: string;
  background?: string;
  particleColor?: string;
  particleCount?: number;
  particleSize?: number;
}

interface Vec {
  x: number;
  y: number;
}

type ShapeType = "triangle" | "square" | "circle";

const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);

const random = (min: number, max: number) => min + Math.random() * (max - min);

/** p5's frameRate(60) budget, in ms. See the loop for why the cap matters. */
const STEP_MS = 1000 / 60;
/** p5 allows a frame this far early before skipping it. Without the slack a
 *  60Hz display, whose rAF deltas jitter either side of 16.667ms, loses a large
 *  share of its steps and the pile settles far tighter than the source's. */
const STEP_EPSILON_MS = 5;

export default function ParticleFluidHero({
  eyebrow = "Is your big idea ready to go wild?",
  headingLines = ["Let's work", "together!"],
  ctaLabel = "Let's talk",
  background = "#1a2ffb",
  particleColor = "#ffffff",
  particleCount = 250,
  particleSize = 12,
}: ParticleFluidHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const spacing = particleSize * 12;
    const gravity: Vec = { x: 0, y: 2.2 };

    let width = root.clientWidth;
    let height = root.clientHeight;

    const pointer = { x: 0, y: 0, prevX: 0, prevY: 0, pressed: false };

    class Particle {
      pos: Vec;
      vel: Vec;
      acc: Vec;
      lastPos: Vec;
      densityFactor = 0;
      rotation: number;
      rotationVel: number;
      shapeType: ShapeType;

      constructor(x: number, y: number) {
        this.pos = { x, y };
        this.vel = { x: random(-20, 20), y: random(-20, 20) };
        this.acc = { x: 0, y: 0 };
        this.lastPos = { x, y };
        this.rotation = random(0, Math.PI * 2);
        this.rotationVel = random(-0.1, 0.1);
        this.shapeType = (["triangle", "square", "circle"] as const)[
          Math.floor(Math.random() * 3)
        ];
      }

      update(dt: number) {
        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y;

        this.rotation += this.rotationVel * dt;

        const gravityScale = map(this.densityFactor, 0, 5, 1, 0.7);
        this.acc.x += gravity.x * 4 * gravityScale;
        this.acc.y += gravity.y * 4 * gravityScale;

        if (pointer.pressed) {
          const dx = this.pos.x - pointer.x;
          const dy = this.pos.y - pointer.y;
          const d = Math.hypot(dx, dy);
          const maxDist = 250;
          if (d < maxDist) {
            const mvx = pointer.x - pointer.prevX;
            const mvy = pointer.y - pointer.prevY;
            const densityScale = map(this.densityFactor, 0, 5, 1, 0.85);
            const strength = map(d, 0, maxDist, 1, 0) ** 1.75;
            this.acc.x += mvx * 10 * densityScale * strength;
            this.acc.y += mvy * 10 * densityScale * strength;
            this.rotationVel += Math.hypot(mvx, mvy) * 0.01 * random(-1, 1);
          }
        }

        this.vel.x += this.acc.x * dt * 15;
        this.vel.y += this.acc.y * dt * 15;

        if (this.pos.y > height - particleSize * 2) {
          this.vel.x *= 0.92 * 0.94;
          this.vel.y *= 0.92;
          this.rotationVel *= 0.95;
        } else {
          this.vel.x *= 0.985;
          this.vel.y *= 0.985;
          this.rotationVel *= 0.99;
        }

        this.pos.x += this.vel.x * dt * 11.5;
        this.pos.y += this.vel.y * dt * 11.5;

        const bounce = 0.45;
        const buffer = particleSize;

        if (this.pos.x < buffer) {
          this.pos.x = buffer;
          this.vel.x = Math.abs(this.vel.x) * bounce;
        }
        if (this.pos.x > width - buffer) {
          this.pos.x = width - buffer;
          this.vel.x = -Math.abs(this.vel.x) * bounce;
        }
        if (this.pos.y < buffer) {
          this.pos.y = buffer;
          this.vel.y = Math.abs(this.vel.y) * bounce;
        }
        if (this.pos.y > height - buffer) {
          this.pos.y = height - buffer;
          this.vel.y = -Math.abs(this.vel.y) * bounce;
        }

        this.acc.x = 0;
        this.acc.y = 0;
        this.densityFactor = 0;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const renderX = this.lastPos.x + (this.pos.x - this.lastPos.x) * 0.5;
        const renderY = this.lastPos.y + (this.pos.y - this.lastPos.y) * 0.5;
        const size = particleSize;

        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        if (this.shapeType === "triangle") {
          ctx.moveTo(-size / 2, size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.lineTo(0, -size / 2);
          ctx.closePath();
        } else if (this.shapeType === "square") {
          ctx.rect(-size / 2, -size / 2, size, size);
        } else {
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      }

      interact(other: Particle) {
        const dx = this.pos.x - other.pos.x;
        const dy = this.pos.y - other.pos.y;
        const d = Math.hypot(dx, dy);
        if (d >= spacing) return;

        const densityIncrease = map(d, 0, spacing, 1.2, 0.1);
        this.densityFactor += densityIncrease;
        other.densityFactor += densityIncrease;

        const length = d || 1e-6;
        const fx = dx / length;
        const fy = dy / length;

        const strength = map(d, 0, spacing, 0.8, 0) ** 1.1;
        const sx = fx * strength;
        const sy = fy * strength;

        const overlap = spacing - d;
        if (overlap > 0) {
          const correctionStrength = map(overlap, 0, spacing, 0.15, 0.25);
          let cx = sx * overlap * correctionStrength;
          let cy = sy * overlap * correctionStrength;

          const nearFloor =
            this.pos.y > height - particleSize * 4 ||
            other.pos.y > height - particleSize * 4;
          if (nearFloor) {
            cx *= 0.7;
            cy *= 0.7;
          }

          const densityScale = map(
            this.densityFactor + other.densityFactor,
            0,
            10,
            1,
            0.9,
          );
          const correctionWeight = 0.15 * densityScale;
          this.pos.x += cx * correctionWeight;
          this.pos.y += cy * correctionWeight;
          other.pos.x -= cx * correctionWeight;
          other.pos.y -= cy * correctionWeight;

          const avgX = (this.vel.x + other.vel.x) * 0.5;
          const avgY = (this.vel.y + other.vel.y) * 0.5;
          let velocityBlend = map(d, 0, spacing, 0.15, 0.02);
          velocityBlend *= map(
            this.densityFactor + other.densityFactor,
            0,
            10,
            1.2,
            0.95,
          );
          if (d < spacing * 0.5) velocityBlend *= 1.5;

          this.vel.x += (avgX - this.vel.x) * velocityBlend;
          this.vel.y += (avgY - this.vel.y) * velocityBlend;
          other.vel.x += (avgX - other.vel.x) * velocityBlend;
          other.vel.y += (avgY - other.vel.y) * velocityBlend;
        }

        this.acc.x += sx * 0.4;
        this.acc.y += sy * 0.4;
        other.acc.x -= sx * 0.4;
        other.acc.y -= sy * 0.4;
      }
    }

    let particles: Particle[] = [];

    const seed = () => {
      particles = [];
      // The source divides the available width by the spacing without a floor;
      // in a narrow container that yields zero columns and the fill loop never
      // terminates, so one column is the minimum here.
      const cols = Math.max(1, Math.floor((width * 0.95) / spacing));
      const startX = (width - cols * spacing) * 0.5;
      const startY = height * 0.05;

      let count = 0;
      let row = 0;
      while (count < particleCount) {
        for (let col = 0; col < cols && count < particleCount; col++) {
          particles.push(
            new Particle(
              startX + col * spacing + random(-5, 5),
              startY + row * spacing + random(-5, 5),
            ),
          );
          count++;
        }
        row++;
      }
    };

    const resize = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    seed();

    const observer = new ResizeObserver(resize);
    observer.observe(root);

    const onPointerDown = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer.pressed = true;
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
    };
    const onPointerMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onPointerUp = () => {
      pointer.pressed = false;
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    let frame = 0;
    let previous = performance.now();

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);

      // The source runs under p5 with frameRate(60), which caps the loop at 60
      // steps per second. That cap is load-bearing: the separation correction in
      // interact() moves positions directly and is NOT scaled by dt, so an
      // uncapped rAF on a 120Hz display applies it twice as often and the fluid
      // spreads to roughly double the spacing. This is p5's own gate: allow the
      // frame a few ms early, and advance the clock by one whole step rather
      // than to now, so 60Hz runs every frame and 120Hz runs every other one.
      if (now - previous < STEP_MS - STEP_EPSILON_MS) return;
      previous = Math.max(previous + STEP_MS, now);
      const dt = STEP_MS / 1000;

      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      context.fillStyle = particleColor;

      const grid = new Map<string, number[]>();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(dt);
        const key = `${Math.floor(p.pos.x / spacing)},${Math.floor(p.pos.y / spacing)}`;
        const cell = grid.get(key);
        if (cell) cell.push(i);
        else grid.set(key, [i]);
      }

      for (const [key, cell] of grid) {
        const [gx, gy] = key.split(",").map(Number);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighbor = grid.get(`${gx + dx},${gy + dy}`);
            if (!neighbor) continue;
            for (const i of cell) {
              for (const j of neighbor) {
                if (i < j) particles[i].interact(particles[j]);
              }
            }
          }
        }
      }

      for (const p of particles) p.draw(context);

      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [background, particleColor, particleCount, particleSize]);

  return (
    <div
      className="pfh-root"
      ref={rootRef}
      style={{ backgroundColor: background }}
    >
      <style>{styles}</style>
      <canvas className="pfh-canvas" ref={canvasRef} />

      <div className="pfh-header">
        <p>{eyebrow}</p>
        <h1>
          {headingLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < headingLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h1>
        <button className="pfh-cta" type="button">
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.pfh-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  font-family: "Manrope", sans-serif;
  touch-action: none;
}

.pfh-root * {
  box-sizing: border-box;
}

.pfh-canvas {
  position: absolute;
  inset: 0;
  display: block;
  z-index: 1;
}

.pfh-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  pointer-events: none;
  z-index: 2;
}

.pfh-header p {
  margin: 0 0 1.5em 0;
  color: #fff;
  text-transform: uppercase;
  font-weight: 400;
}

.pfh-header h1 {
  margin: 0 0 0.75em 0;
  color: #fff;
  text-align: center;
  font-size: 7.5cqw;
  font-weight: 400;
  line-height: 100%;
}

.pfh-cta {
  border: none;
  outline: none;
  padding: 1.5em 3em;
  text-transform: uppercase;
  font-family: inherit;
  font-weight: 500;
  color: #000;
  background-color: #fff;
  border-radius: 2em;
  pointer-events: auto;
  cursor: pointer;
}
`;

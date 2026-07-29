"use client";

/**
 * Elastic String Field - a field of fat rubber ribbons that toss themselves in,
 * shove each other apart, and settle into a packed arrangement. Each ribbon is
 * thirty five mass points wired by two spring sets: structural springs between
 * neighbours hold its length, and bending springs between every point and the
 * one two along resist folding, which is what keeps it reading as a stiff band
 * instead of a limp chain. Every point in the field also repels every other
 * point inside the repulsion radius, walls included, so ribbons never overlap
 * and the field distributes itself.
 *
 * A ribbon is born compressed: its points sit a tenth of a rest length apart
 * along a sine wave, so the springs unpack it into a loop the moment it spawns
 * and it arrives with a toss velocity in a random direction. New ribbons keep
 * dropping wherever there is clearance until the field is full. Press an empty
 * spot to add one, press a ribbon to drag it.
 *
 * Canvas 2D, no physics library and no p5.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

export interface ElasticStringFieldProps {
  /** Ribbon colours. One is drawn at random per spawn. */
  palette?: string[];
  /** Field colour. Left unset, one of the palette entries is picked per mount
   *  and dropped from the ribbon colours, as the source does. */
  background?: string;
  /** Spring constant between adjacent points. Higher snaps back harder. */
  elasticity?: number;
  /** Spring constant between a point and the one two along. This is the
   *  stiffness that stops a ribbon folding onto itself. */
  bendingResistance?: number;
  /** Push applied between two points inside the repulsion radius. */
  repulsionStrength?: number;
  /** Distance at which points start pushing each other, and the width of the
   *  cushion along each wall. */
  repulsionRadius?: number;
  /** Velocity retained per frame. Below about 0.8 the field goes slack. */
  damping?: number;
  /** Downward acceleration. Zero leaves the field weightless. */
  gravity?: number;
  /** Stroke weight of a ribbon. */
  lineWidth?: number;
  /** Target distance between adjacent points. */
  restLength?: number;
  /** Keep dropping ribbons wherever there is clearance. */
  autoSpawn?: boolean;
  /** Toss speed a new ribbon is thrown in with. */
  initialVelocity?: number;
  /** Clearance from every existing point a spawn site needs. */
  spawnClearance?: number;
  /** Wait between spawn attempts, in ms. */
  spawnInterval?: number;
  /** Hard cap on ribbons in the field. */
  maxStrings?: number;
  className?: string;
}

const DEFAULT_PALETTE = [
  "#eb4e28",
  "#1e4b9d",
  "#f5dec0",
  "#dfa6e0",
  "#8fb6ae",
  "#8d98c6",
  "#19242d",
  "#111617",
];

/** Points per ribbon. */
const POINTS_PER_STRING = 35;
/** Ribbons the field opens with. */
const INITIAL_STRINGS = 3;
/** How close a press must land to grab a point. */
const GRAB_RADIUS = 40;
/** Velocity ceiling. Without it a stiff spring pair can blow the field apart. */
const MAX_SPEED = 50;

/** p5's frameRate(60) budget, in ms. See the loop for why the cap matters. */
const STEP_MS = 1000 / 60;
/** p5 allows a frame this far early before skipping it. Without the slack a
 *  60Hz display, whose rAF deltas jitter either side of 16.667ms, loses a large
 *  share of its steps and the field crawls. */
const STEP_EPSILON_MS = 5;

const random = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Ribbon {
  points: Point[];
  color: string;
}

/**
 * p5's curveVertex, which is a Catmull-Rom spline with tightness 0, written as
 * the cubic beziers Canvas 2D can draw. The source duplicates the first and
 * last vertex, so the control quad clamps at both ends.
 */
function strokeSpline(context: CanvasRenderingContext2D, points: Point[]) {
  if (points.length < 2) return;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    context.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x + (p1.x - p3.x) / 6,
      p2.y + (p1.y - p3.y) / 6,
      p2.x,
      p2.y,
    );
  }
  context.stroke();
}

export default function ElasticStringField({
  palette = DEFAULT_PALETTE,
  background,
  elasticity = 0.8,
  bendingResistance = 0.1,
  repulsionStrength = 2,
  repulsionRadius = 60,
  damping = 0.85,
  gravity = 0,
  lineWidth = 60,
  restLength = 15,
  autoSpawn = true,
  initialVelocity = 15,
  spawnClearance = 75,
  spawnInterval = 100,
  maxStrings = 24,
  className,
}: ElasticStringFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Read live inside the loop so a control can be dragged without restarting
  // the simulation.
  const settings = {
    palette,
    background,
    elasticity,
    bendingResistance,
    repulsionStrength,
    repulsionRadius,
    damping,
    gravity,
    lineWidth,
    restLength,
    autoSpawn,
    initialVelocity,
    spawnClearance,
    spawnInterval,
    maxStrings,
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = root.clientWidth;
    let height = root.clientHeight;

    const resize = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ribbons: Ribbon[] = [];
    let dragging: Point | null = null;

    // The source draws the field colour from the palette and removes it from
    // the ribbon colours, so a ribbon is never invisible against its own
    // background. Picked here rather than during render: it is random, and a
    // random value read while rendering does not survive hydration.
    const startPalette = settingsRef.current.palette;
    const bgIndex = Math.floor(Math.random() * startPalette.length);
    const drawnBackground = startPalette[bgIndex];
    const ribbonColors = startPalette.toSpliced(bgIndex, 1);

    /**
     * A ribbon starts compressed along its own axis with a sine wave across it,
     * so the structural springs have to unpack it. That unpacking is the toss.
     */
    const spawn = (x: number, y: number) => {
      const s = settingsRef.current;
      const offsetAngle = random(0, Math.PI * 2);
      const tossAngle = random(0, Math.PI * 2);
      const tossSpeed = random(0, s.initialVelocity);
      const initVx = Math.cos(tossAngle) * tossSpeed;
      const initVy = Math.sin(tossAngle) * tossSpeed;
      const points: Point[] = [];

      for (let i = 0; i < POINTS_PER_STRING; i++) {
        const localX = i * s.restLength * 0.1;
        const localY = Math.sin(i * 0.3) * 25;
        points.push({
          x:
            x + localX * Math.cos(offsetAngle) - localY * Math.sin(offsetAngle),
          y:
            y + localX * Math.sin(offsetAngle) + localY * Math.cos(offsetAngle),
          vx: initVx + random(-2, 2),
          vy: initVy + random(-2, 2),
        });
      }

      ribbons.push({
        points,
        color: pick(s.background ? s.palette : ribbonColors),
      });
    };

    for (let i = 0; i < INITIAL_STRINGS; i++) {
      spawn(
        random(100, Math.max(101, width - 100)),
        random(100, Math.max(101, height - 100)),
      );
    }

    const updatePoint = (p: Point) => {
      const s = settingsRef.current;
      if (p === dragging) return;

      p.vy += s.gravity;
      p.vx *= s.damping;
      p.vy *= s.damping;

      const speedSq = p.vx * p.vx + p.vy * p.vy;
      if (speedSq > MAX_SPEED * MAX_SPEED) {
        const speed = Math.sqrt(speedSq);
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Walls push with the same cushion the points use on each other, and only
      // bounce (at half energy) once a point is fully outside.
      const r = s.repulsionRadius;
      const cushion = (distance: number) =>
        ((r - distance) / r) * s.repulsionStrength;

      if (p.x > 0 && p.x < r) p.vx += cushion(p.x);
      else if (p.x < 0) {
        p.x = 0;
        if (p.vx < 0) p.vx *= -0.5;
      }

      const fromRight = width - p.x;
      if (fromRight > 0 && fromRight < r) p.vx -= cushion(fromRight);
      else if (p.x > width) {
        p.x = width;
        if (p.vx > 0) p.vx *= -0.5;
      }

      if (p.y > 0 && p.y < r) p.vy += cushion(p.y);
      else if (p.y < 0) {
        p.y = 0;
        if (p.vy < 0) p.vy *= -0.5;
      }

      const fromBottom = height - p.y;
      if (fromBottom > 0 && fromBottom < r) p.vy -= cushion(fromBottom);
      else if (p.y > height) {
        p.y = height;
        if (p.vy > 0) p.vy *= -0.5;
      }
    };

    /** One spring pass over a point pair, pulling them toward `target` apart. */
    const spring = (
      p1: Point,
      p2: Point,
      target: number,
      stiffness: number,
    ) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 0) return;
      const force = (d - target) * stiffness;
      const fx = (dx / d) * force;
      const fy = (dy / d) * force;
      p1.vx += fx;
      p1.vy += fy;
      p2.vx -= fx;
      p2.vy -= fy;
    };

    const pointerPosition = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerDown = (event: PointerEvent) => {
      const { x, y } = pointerPosition(event);
      let closest: Point | null = null;
      let closestDist = GRAB_RADIUS;

      for (const ribbon of ribbons) {
        for (const p of ribbon.points) {
          const d = Math.hypot(x - p.x, y - p.y);
          if (d < closestDist) {
            closestDist = d;
            closest = p;
          }
        }
      }

      if (closest) {
        dragging = closest;
        canvas.setPointerCapture(event.pointerId);
      } else if (ribbons.length < settingsRef.current.maxStrings) {
        spawn(x, y);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const { x, y } = pointerPosition(event);
      dragging.x = Math.min(Math.max(x, 0), width);
      dragging.y = Math.min(Math.max(y, 0), height);
      dragging.vx = 0;
      dragging.vy = 0;
    };

    const onPointerUp = () => {
      dragging = null;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const observer = new ResizeObserver(resize);
    observer.observe(root);

    let frame = 0;
    let previous = performance.now();
    let lastSpawn = previous;

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);

      // The source runs under p5, which caps the loop at 60 steps per second.
      // That cap is load-bearing: every force here is added straight to a
      // velocity in pixels per frame with no dt anywhere, so an uncapped rAF on
      // a 120Hz display runs the field at double speed. This is p5's own gate:
      // allow the frame a few ms early, and advance the clock by one whole step
      // rather than to now, so 60Hz runs every frame and 120Hz every other one.
      if (now - previous < STEP_MS - STEP_EPSILON_MS) return;
      previous = Math.max(previous + STEP_MS, now);

      const s = settingsRef.current;
      const points: Point[] = [];
      for (const ribbon of ribbons) points.push(...ribbon.points);

      // ponytail: every pair tested, which is what the source does. maxStrings
      // is the guard; swap in a spatial hash only if the cap has to go up.
      const rSq = s.repulsionRadius * s.repulsionRadius;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dSq = dx * dx + dy * dy;
          if (dSq <= 0 || dSq >= rSq) continue;
          const d = Math.sqrt(dSq);
          const force =
            ((s.repulsionRadius - d) / s.repulsionRadius) * s.repulsionStrength;
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          p1.vx += fx;
          p1.vy += fy;
          p2.vx -= fx;
          p2.vy -= fy;
        }
      }

      for (const ribbon of ribbons) {
        const pts = ribbon.points;
        for (let i = 0; i < pts.length - 1; i++) {
          spring(pts[i], pts[i + 1], s.restLength, s.elasticity);
        }
        for (let i = 0; i < pts.length - 2; i++) {
          spring(pts[i], pts[i + 2], s.restLength * 2, s.bendingResistance);
        }
        for (const p of pts) updatePoint(p);
      }

      if (
        s.autoSpawn &&
        ribbons.length < s.maxStrings &&
        now - lastSpawn > s.spawnInterval &&
        width > 200 &&
        height > 200
      ) {
        // Ten tries at a clear site, then give up until the next interval, so a
        // full field costs ten distance sweeps rather than spinning.
        for (let tries = 0; tries < 10; tries++) {
          const x = random(100, width - 100);
          const y = random(100, height - 100);
          if (
            points.some((p) => Math.hypot(x - p.x, y - p.y) < s.spawnClearance)
          )
            continue;
          spawn(x, y);
          lastSpawn = now;
          break;
        }
      }

      context.fillStyle = s.background ?? drawnBackground;
      context.fillRect(0, 0, width, height);
      context.lineWidth = s.lineWidth;
      context.lineJoin = "round";
      context.lineCap = "round";
      for (const ribbon of ribbons) {
        context.strokeStyle = ribbon.color;
        strokeSpline(context, ribbon.points);
      }
    };

    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: background,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", touchAction: "none", cursor: "pointer" }}
      />
    </div>
  );
}

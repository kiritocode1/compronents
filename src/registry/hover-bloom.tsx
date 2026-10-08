"use client";

import { type CSSProperties, useEffect, useRef } from "react";

export interface HoverBloomProps {
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  spawnOn?: "move" | "still";
  growthMode?: "upright" | "creep";
  spawnRate?: number;
  maxBlooms?: number;
  resetOnLeave?: boolean;
  backgroundColor?: string;
  paperTint?: string;
  grid?: boolean;
  gridSize?: number;
  gridDotSize?: number;
  gridColor?: string;
  palette?: "mixed" | "warm" | "cool" | "pink";
  /** Nonempty hex colors override the preset palette. */
  customPalette?: readonly string[];
  stemHue?: number;
  stemSaturation?: number;
  stemLightness?: number;
  flowerSaturation?: number;
  flowerLightness?: number;
  bloomScale?: number;
  blur?: number;
  watercolor?: number;
  trailFade?: number;
}

type Pigment = { h: number; s: number; l: number };
type Segment = { x: number; y: number; a: number };
type Stem = {
  id: string;
  x: number;
  y: number;
  targetLen: number;
  grown: number;
  speed: number;
  targetA: number;
  segs: Segment[];
  done: boolean;
  hasFlower: boolean;
  type: number;
  scale: number;
  hue: number;
  sat: number;
  light: number;
};
type Flower = {
  id: string;
  x: number;
  y: number;
  age: number;
  maxAge: number;
  type: number;
  scale: number;
  hue: number;
  sat: number;
  light: number;
};
const palettes = {
  mixed: [350, 15, 330, 40, 300, 5, 345, 20],
  warm: [12, 22, 35, 5, 18],
  cool: [210, 245, 190, 275, 200],
  pink: [330, 345, 350, 315, 5],
};
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const pick = (values: readonly number[]) =>
  values[Math.floor(Math.random() * values.length)];

function hexPigment(color: string): Pigment | null {
  const short = color.trim().replace(/^#/, "");
  const hex =
    short.length === 3
      ? short
          .split("")
          .map((c) => c + c)
          .join("")
      : short;
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  const r = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return {
    h,
    s: delta === 0 ? 0 : (delta / (1 - Math.abs(2 * l - 1))) * 100,
    l: l * 100,
  };
}
function hsla(p: Pigment, alpha: number) {
  return `hsla(${((p.h % 360) + 360) % 360}, ${Math.max(0, Math.min(100, p.s))}%, ${Math.max(0, Math.min(100, p.l))}%, ${clamp01(alpha)})`;
}

/** Accumulating watercolor canvas. Give the container an explicit height. */
export function HoverBloom({
  className,
  style,
  "aria-label": label = "Hover Bloom canvas",
  spawnOn = "move",
  growthMode = "upright",
  spawnRate = 10,
  maxBlooms = 80,
  resetOnLeave = false,
  backgroundColor = "#FFFFFF",
  paperTint = "#F5F5F5",
  grid = true,
  gridSize = 24,
  gridDotSize = 1,
  gridColor = "#CCCCCC",
  palette = "mixed",
  customPalette,
  stemHue = 115,
  stemSaturation = 28,
  stemLightness = 38,
  flowerSaturation = 78,
  flowerLightness = 66,
  bloomScale = 1,
  blur = 0.6,
  watercolor = 0.8,
  trailFade = 0.08,
}: HoverBloomProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = rootRef.current,
      surface = canvasRef.current;
    if (!element || !surface) return;
    const root = element,
      canvas = surface;
    const layer = document.createElement("canvas");
    const paint = layer.getContext("2d", { alpha: true, desynchronized: true });
    const view = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!paint || !view) return;
    const colors =
      customPalette?.map(hexPigment).filter((c) => c !== null) ?? [];
    let width = 0,
      height = 0,
      dpr = 1;
    let stems: Stem[] = [],
      flowers: Flower[] = [];
    let hovered = false,
      frame = 0,
      budget = 0,
      disposed = false;
    let previous: { x: number; y: number; t: number } | null = null;
    const cap = Math.max(1, Math.floor(maxBlooms));

    function composite() {
      if (!view) return;
      view.setTransform(1, 0, 0, 1, 0, 0);
      view.clearRect(0, 0, canvas.width, canvas.height);
      view.scale(dpr, dpr);
      const wash = clamp01(watercolor);
      view.filter = `blur(${Math.max(0, blur) * (0.5 + wash * 0.9)}px) contrast(${1.02 + wash * 0.08}) saturate(${1.05 + wash * 0.15})`;
      view.globalAlpha = 1;
      view.drawImage(
        layer,
        0,
        0,
        width * dpr,
        height * dpr,
        0,
        0,
        width,
        height,
      );
      view.filter = "none";
    }
    function resize() {
      if (!root || !paint) return;
      const rect = root.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width)),
        h = Math.max(1, Math.round(rect.height));
      const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      if (w === width && h === height && ratio === dpr) return;
      const old = document.createElement("canvas");
      old.width = layer.width;
      old.height = layer.height;
      old.getContext("2d")?.drawImage(layer, 0, 0);
      width = w;
      height = h;
      dpr = ratio;
      canvas.width = layer.width = Math.floor(w * ratio);
      canvas.height = layer.height = Math.floor(h * ratio);
      paint.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint.lineCap = "round";
      paint.lineJoin = "round";
      paint.globalCompositeOperation = "source-over";
      paint.fillStyle = backgroundColor;
      paint.fillRect(0, 0, w, h);
      const dx = (layer.width - old.width) * 0.5,
        dy = layer.height - old.height;
      paint.setTransform(1, 0, 0, 1, 0, 0);
      paint.drawImage(old, dx, dy);
      paint.setTransform(ratio, 0, 0, ratio, 0, 0);
      for (const stem of stems) {
        stem.x += dx / ratio;
        stem.y += dy / ratio;
        for (const seg of stem.segs) {
          seg.x += dx / ratio;
          seg.y += dy / ratio;
        }
      }
      for (const flower of flowers) {
        flower.x += dx / ratio;
        flower.y += dy / ratio;
      }
      composite();
    }
    function clear() {
      if (!paint || !view) return;
      paint.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint.clearRect(0, 0, width, height);
      paint.fillStyle = backgroundColor;
      paint.fillRect(0, 0, width, height);
      view.setTransform(1, 0, 0, 1, 0, 0);
      view.clearRect(0, 0, canvas.width, canvas.height);
      stems = [];
      flowers = [];
    }
    function spawn(x: number, y: number, velocity: number) {
      if (stems.length + flowers.length >= cap) {
        stems.splice(0, Math.max(0, stems.length - (cap - 1)));
        flowers.splice(0, Math.max(0, flowers.length - (cap - 1)));
      }
      const custom = colors.length
        ? colors[Math.floor(Math.random() * colors.length)]
        : undefined;
      const pigment = custom ?? {
        h: pick(palettes[palette]) + Math.random() * 10 - 5,
        s: flowerSaturation,
        l: flowerLightness,
      };
      const scale =
        Math.max(0.2, bloomScale) *
        (0.65 + Math.random() * 0.6) *
        (0.8 + velocity * 0.6);
      const creep = growthMode === "creep",
        targetA = creep ? -Math.PI * 0.15 : -Math.PI / 2;
      const targetLen =
        (height * (creep ? 0.22 : 0.12) +
          height * (creep ? 0.32 : 0.22) * Math.random() +
          40) *
        (0.65 + scale);
      const angle = targetA + (Math.random() - 0.5) * (creep ? 0.8 : 0.75);
      stems.push({
        id: `${Date.now()}-${Math.random()}`,
        x: Math.max(
          width * 0.03,
          Math.min(width * 0.97, x + (Math.random() - 0.5) * 14),
        ),
        y: Math.max(
          height * 0.1,
          Math.min(height * 0.98, y + 10 + Math.random() * 18),
        ),
        targetLen,
        grown: 0,
        speed: 1.6 + Math.random() * 2.2,
        targetA,
        segs: [{ x, y, a: angle }],
        done: false,
        hasFlower: false,
        type: Math.floor(Math.random() * (creep ? 4 : 6)),
        scale,
        hue: pigment.h,
        sat: pigment.s,
        light: pigment.l,
      });
    }
    function flower(
      x: number,
      y: number,
      type: number,
      scale: number,
      hue: number,
      sat: number,
      light: number,
    ) {
      flowers.push({
        id: `${Date.now()}-${Math.random()}`,
        x,
        y,
        type,
        scale,
        hue,
        sat,
        light,
        age: 0,
        maxAge: 70 + Math.random() * 70,
      });
    }
    function dab(
      x: number,
      y: number,
      radius: number,
      color: Pigment,
      alpha: number,
      angle = 0,
      stretch = 1.6,
    ) {
      if (!paint) return;
      for (let i = 0; i < 2; i++) {
        const dx = (Math.random() - 0.5) * radius * 0.25,
          dy = (Math.random() - 0.5) * radius * 0.25;
        const size = Math.max(0.6, radius * (0.75 + Math.random() * 0.5));
        const rx = size * stretch,
          ry = size * (0.55 + Math.random() * 0.55);
        const rotation = angle + (Math.random() - 0.5) * 0.35;
        paint.beginPath();
        paint.ellipse(x + dx, y + dy, rx, ry, rotation, 0, Math.PI * 2);
        paint.fillStyle = hsla(
          {
            h: color.h + Math.random() * 10 - 5,
            s: color.s,
            l: color.l + Math.random() * 12 - 6,
          },
          alpha,
        );
        paint.fill();
      }
    }
    function stroke(
      from: Segment,
      to: Segment,
      color: Pigment,
      weight: number,
      alpha: number,
    ) {
      if (!paint) return;
      paint.beginPath();
      paint.moveTo(from.x, from.y);
      paint.lineTo(to.x, to.y);
      paint.strokeStyle = hsla(
        {
          h: color.h + Math.random() * 8 - 4,
          s: color.s,
          l: color.l + Math.random() * 10 - 5,
        },
        alpha,
      );
      paint.lineWidth = Math.max(0.2, weight * (0.8 + Math.random() * 0.5));
      paint.stroke();
    }
    function grow(stem: Stem) {
      for (let i = 0; i < Math.max(1, Math.floor(stem.speed)); i++) {
        if (stem.grown >= stem.targetLen) {
          stem.done = true;
          break;
        }
        const last = stem.segs[stem.segs.length - 1];
        const angle =
          last.a +
          (stem.targetA - last.a) * 0.04 +
          (Math.random() - 0.5) * 0.12;
        stem.segs.push({
          x: last.x + Math.cos(angle) * 5,
          y: last.y + Math.sin(angle) * 5,
          a: angle,
        });
        stem.grown += 5;
      }
      if (stem.grown >= stem.targetLen) stem.done = true;
    }
    function drawStem(stem: Stem) {
      const segments = stem.segs,
        last = segments.length - 1;
      const base = { h: stemHue, s: stemSaturation, l: stemLightness };
      const shadow = {
        h: stemHue + 18,
        s: stemSaturation,
        l: Math.max(10, stemLightness - 8),
      };
      const length = Math.max(1, Math.floor(stem.targetLen / 5));
      for (let i = Math.max(1, last - 4); i <= last; i++) {
        const from = segments[i - 1],
          to = segments[i];
        const weight = (2.8 * (1 - i / length) + 0.8) * stem.scale;
        stroke(from, to, shadow, weight * 0.7, 0.18);
        stroke(from, to, base, weight, 0.14);
        if (
          i > 5 &&
          i < last - 3 &&
          Math.random() < (stem.targetA > -1.2 ? 0.16 : 0.08)
        ) {
          const a =
            to.a + (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.7);
          const size = (10 + Math.random() * 22) * stem.scale;
          const tip = {
            x: to.x + Math.cos(a) * size,
            y: to.y + Math.sin(a) * size,
            a,
          };
          const leaf = {
            h: stemHue + Math.random() * 10 - 5,
            s: stemSaturation,
            l: Math.min(65, stemLightness + 10),
          };
          dab(
            (to.x + tip.x) * 0.5,
            (to.y + tip.y) * 0.5,
            (4 + Math.random() * 4) * stem.scale,
            leaf,
            0.09,
            a,
            2.2,
          );
          stroke(to, tip, shadow, Math.max(0.35, weight * 0.35), 0.14);
        }
      }
    }
    function drawFlower(f: Flower) {
      f.age++;
      const growth = 0.15 + clamp01(f.age / 60) * 0.85;
      const fade = resetOnLeave ? clamp01((f.maxAge - f.age) / 20) : 1;
      const base = { h: f.hue, s: f.sat, l: f.light };
      const light = {
        h: f.hue + 2,
        s: Math.max(20, f.sat - 10),
        l: Math.min(92, f.light + 12),
      };
      const shadow = {
        h: f.hue,
        s: Math.min(100, f.sat + 12),
        l: Math.max(16, f.light - 22),
      };
      const center = { h: 40, s: 85, l: 52 };
      const x = f.x + (Math.random() - 0.5) * 0.2;
      const y = f.y - (8 + Math.random() * 6) * f.scale * growth;
      const round = f.type <= 3;
      const petals = round
        ? f.type === 0
          ? 18
          : f.type === 1
            ? 6
            : f.type === 2
              ? 10
              : 8
        : f.type === 4
          ? 12
          : 7;
      const radius =
        (round ? 7.5 : 10) * f.scale * growth +
        (f.type === 0 ? 4 * f.scale * growth : 0);
      const elongation = round
        ? f.type === 1
          ? 1.25
          : 1
        : f.type === 2
          ? 0.75
          : 1;
      for (let i = 0; i < petals; i++) {
        if (Math.random() > 0.75) continue;
        const angle =
          (round && f.type === 1
            ? -Math.PI / 2 +
              (i % 2 === 0 ? -0.45 : 0.45) +
              (Math.random() - 0.5) * 0.25
            : -Math.PI / 2 + (Math.PI * 2 * i) / petals) +
          (Math.random() - 0.5) * 0.35;
        const distance = radius * (0.75 + Math.random() * 0.85) * elongation;
        const px = x + Math.cos(angle) * distance,
          py = y + Math.sin(angle) * distance;
        const stretch = (round ? 2.2 : 1.6) + Math.random() * (round ? 1 : 0.9);
        const color = Math.random() > 0.65 ? light : base;
        dab(
          px,
          py,
          radius * (0.55 + Math.random() * 0.25),
          color,
          fade * 0.055 * (0.6 + watercolor * 0.8),
          angle,
          stretch,
        );
        dab(
          (px + x) * 0.5,
          (py + y) * 0.5,
          radius * 0.45,
          shadow,
          fade * 0.04 * (0.7 + watercolor * 0.7),
          angle + 0.1,
          stretch * 0.95,
        );
      }
      const core = (5 + Math.random() * 3) * f.scale * growth;
      dab(
        x,
        y + f.scale,
        core * 1.05,
        shadow,
        fade * 0.06 * (0.7 + watercolor * 0.8),
        0,
        1.2,
      );
      if (f.age > 10)
        for (let i = 0; i < 7; i++) {
          if (Math.random() > 0.5) continue;
          const a = Math.random() * Math.PI * 2,
            distance = (1 + Math.random() * 5) * f.scale * growth;
          dab(
            x + Math.cos(a) * distance,
            y + Math.sin(a) * distance,
            (1.2 + Math.random() * 1.8) * f.scale * growth,
            center,
            fade * 0.07,
            a,
            1,
          );
        }
    }
    function tick() {
      frame = 0;
      if (disposed || !paint) return;
      if (resetOnLeave) {
        paint.save();
        paint.globalCompositeOperation = "source-over";
        paint.fillStyle = backgroundColor;
        paint.globalAlpha = Math.max(0.02, clamp01(trailFade) * 0.35);
        paint.setTransform(dpr, 0, 0, dpr, 0, 0);
        paint.fillRect(0, 0, width, height);
        paint.restore();
      }
      for (const stem of stems) {
        if (!stem.done) {
          grow(stem);
          drawStem(stem);
        } else if (!stem.hasFlower) {
          const segments = stem.segs,
            end = segments[Math.max(1, segments.length - 2)];
          flower(
            end.x,
            end.y,
            stem.type,
            Math.max(0.2, stem.scale * (0.8 + Math.random() * 0.5)),
            stem.hue,
            stem.sat,
            stem.light,
          );
          if (segments.length > 18 && Math.random() > 0.55) {
            const branch =
              segments[
                Math.max(
                  5,
                  segments.length - (10 + Math.floor(Math.random() * 10)),
                )
              ];
            const side = Math.random() < 0.5 ? -1 : 1,
              a = branch.a + side * (0.85 + Math.random() * 0.5);
            flower(
              branch.x + Math.cos(a) * (10 + Math.random() * 12) * stem.scale,
              branch.y + Math.sin(a) * (10 + Math.random() * 12) * stem.scale,
              (stem.type + 1 + Math.floor(Math.random() * 3)) % 6,
              Math.max(0.18, stem.scale * 0.7),
              stem.hue + 8,
              stem.sat,
              stem.light,
            );
          }
          stem.hasFlower = true;
        }
      }
      let painting = false;
      for (const f of flowers)
        if (f.age < f.maxAge) {
          drawFlower(f);
          painting = true;
        }
      composite();
      stems = stems.filter((s) => !(s.done && s.hasFlower));
      if (flowers.length > cap) flowers.splice(0, flowers.length - cap);
      if (hovered || stems.length > 0 || painting)
        frame = requestAnimationFrame(tick);
      else if (resetOnLeave) clear();
    }
    function start() {
      if (!frame && !disposed) frame = requestAnimationFrame(tick);
    }
    function enter() {
      hovered = true;
      start();
    }
    function leave() {
      hovered = false;
      previous = null;
      budget = 0;
      if (resetOnLeave) clear();
    }
    function move(e: PointerEvent) {
      if (!hovered) return;
      const rect = root.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
      const now = performance.now(),
        old = previous;
      const velocity = old
        ? clamp01(
            0.25 +
              (Math.hypot(x - old.x, y - old.y) / Math.max(1, now - old.t)) *
                3.2,
          )
        : 0.35;
      previous = { x, y, t: now };
      if (spawnOn === "move") {
        budget +=
          Math.max(0, spawnRate) *
          (old ? Math.max(0, now - old.t) / 1000 : 1 / 60);
        while (budget >= 1) {
          budget--;
          spawn(
            x + (Math.random() - 0.5) * 10,
            y + (Math.random() - 0.5) * 10,
            velocity,
          );
        }
        start();
      }
    }
    function down(e: PointerEvent) {
      const rect = root.getBoundingClientRect();
      spawn(e.clientX - rect.left, e.clientY - rect.top, 0.9);
      start();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerdown", down);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerdown", down);
    };
  }, [
    spawnOn,
    growthMode,
    spawnRate,
    maxBlooms,
    resetOnLeave,
    backgroundColor,
    palette,
    customPalette,
    stemHue,
    stemSaturation,
    stemLightness,
    flowerSaturation,
    flowerLightness,
    bloomScale,
    blur,
    watercolor,
    trailFade,
  ]);

  const dot = Math.max(0.5, gridDotSize);
  return (
    <div
      ref={rootRef}
      className={className}
      role="img"
      aria-label={label}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor,
        backgroundImage: grid
          ? `radial-gradient(${gridColor} ${dot}px, transparent ${dot}px)`
          : "none",
        backgroundSize: grid
          ? `${Math.max(6, gridSize)}px ${Math.max(6, gridSize)}px`
          : undefined,
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.03)",
        touchAction: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${paperTint} 0%, rgba(255,255,255,0) 62%)`,
          mixBlendMode: "multiply",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
export default HoverBloom;

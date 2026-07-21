"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Generative canvas helpers                                           */
/* ------------------------------------------------------------------ */

type WaveType =
  | "sine"
  | "triangle"
  | "sawtooth"
  | "square"
  | "bounce"
  | "elastic";

function wave(t: number, type: WaveType): number {
  const r = t % 1;
  switch (type) {
    case "triangle":
      if (r < 0.25) return 4 * r;
      if (r < 0.75) return 1 - (r - 0.25) * 4;
      return -1 + (r - 0.75) * 4;
    case "sawtooth":
      return 2 * r - 1;
    case "square":
      return r < 0.5 ? 1 : -1;
    case "bounce":
      return Math.abs(Math.sin(r * Math.PI * 2));
    case "elastic":
      return Math.sin(r * Math.PI * 8) * Math.exp(-(3 * r));
    default:
      return Math.sin(r * Math.PI * 2);
  }
}

/** Deterministic mulberry32 so every render of a seed draws the same texture. */
function createSeededRandom(seed: number): () => number {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let e = Math.imul(t ^ (t >>> 15), 1 | t);
    e = (e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ e;
    return ((e ^ (e >>> 14)) >>> 0) / 0x100000000;
  };
}

function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.scale(dpr, dpr);
  return ctx;
}

function clearCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: string,
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  alpha = 1,
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
}

/** rAF loop; callback receives elapsed seconds since start. */
function createAnimationLoop(cb: (elapsed: number) => void): () => void {
  let raf = 0;
  let start = 0;
  let running = true;
  const step = (now: number) => {
    if (!running) return;
    if (!start) start = now;
    cb((now - start) / 1000);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => {
    running = false;
    cancelAnimationFrame(raf);
  };
}

/* ------------------------------------------------------------------ */
/* Texture generators (fixed 312x192, scaled by the card)              */
/* ------------------------------------------------------------------ */

const GRAPHIC_W = 312;
const GRAPHIC_H = 192;

interface GraphicProps {
  seed: number;
  foreground: string;
  background: string;
}

type Draw = (ctx: CanvasRenderingContext2D, t: number) => void;

/**
 * Mounts a canvas, builds its draw function once per dependency change, and
 * runs it on a rAF loop. `build` is read through a ref so the loop only
 * restarts when `deps` actually change, not on every parent render.
 */
function useTexture(build: () => Draw, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, GRAPHIC_W, GRAPHIC_H);
    if (!ctx) return;
    const draw = buildRef.current();
    return createAnimationLoop((t) => draw(ctx, t));
  }, deps);

  return ref;
}

/** Card 1: vertical bars whose heights ride a wave, anchored every 2 columns. */
function WaveformBars({ seed, foreground, background }: GraphicProps) {
  const cfg = {
    waveType: "sine" as WaveType,
    waveAmplitude: 0.4,
    waveFrequency: 0.9,
    phaseOffset: 0.4,
    columns: 64,
    barWidth: 2,
    gap: 4,
    minHeight: 1,
    maxHeight: 194,
    anchorInterval: 2,
    stagger: 0.1,
    verticalShift: 5,
    shiftCurve: 3,
    shiftOrigin: 0.99,
    speed: 0.1,
  };
  const ref = useTexture(() => {
    const rng = createSeededRandom(seed);
    return (ctx, t) => {
      clearCanvas(ctx, GRAPHIC_W, GRAPHIC_H, background);
      const F = cfg.maxHeight;
      const step = cfg.barWidth + cfg.gap;
      const x0 = (GRAPHIC_W - (cfg.columns * step - cfg.gap)) / 2;
      for (let e = 0; e < cfg.columns; e++) {
        const x = x0 + e * step;
        const anchor = cfg.anchorInterval > 0 && e % cfg.anchorInterval === 0;
        let h: number;
        if (anchor) {
          h = F;
        } else {
          const n = (e % cfg.anchorInterval) * cfg.stagger;
          const phase =
            (e / cfg.columns) * cfg.waveFrequency +
            cfg.phaseOffset +
            n +
            t * cfg.speed;
          const raw =
            cfg.minHeight +
            ((wave(phase, cfg.waveType) * cfg.waveAmplitude + 1) / 2) *
              (F - cfg.minHeight);
          h = Math.max(cfg.minHeight, raw + (rng() - 0.5) * 2);
        }
        let y = 0;
        if (!anchor && cfg.verticalShift !== 0) {
          const tt = Math.floor(e / cfg.anchorInterval);
          const rr = Math.floor(cfg.columns / cfg.anchorInterval);
          const origin = cfg.shiftOrigin * (rr - 1);
          const dist = Math.abs(tt - origin);
          const span = Math.max(origin, rr - 1 - origin);
          const ratio = dist / Math.max(1, span);
          const curve = Math.abs(cfg.shiftCurve) || 1;
          y +=
            span *
            cfg.verticalShift *
            (cfg.shiftCurve >= 0 ? ratio ** curve : 1 - (1 - ratio) ** curve);
        }
        drawRect(ctx, x, y, cfg.barWidth, h, foreground);
      }
    };
  }, [seed, foreground, background]);
  return <canvas ref={ref} />;
}

/** Card 2: mosaic of squares whose opacity pulses with an elastic wave. */
function GridBlocks({ seed, foreground, background }: GraphicProps) {
  const cfg = {
    waveType: "elastic" as WaveType,
    waveAmplitude: 1,
    waveFrequency: 1,
    phaseOffset: 0.35,
    item: 15,
    gap: 2,
    opacityMin: 0,
    opacityMax: 1,
    speed: 0.05,
  };
  const ref = useTexture(() => {
    const rng = createSeededRandom(seed);
    return (ctx, t) => {
      clearCanvas(ctx, GRAPHIC_W, GRAPHIC_H, background);
      const rows = Math.floor((GRAPHIC_H + cfg.gap) / (cfg.item + cfg.gap));
      const cols = Math.floor((GRAPHIC_W + cfg.gap) / (cfg.item + cfg.gap));
      const rowW = cols * cfg.item + (cols - 1) * cfg.gap;
      const x0 = (GRAPHIC_W - rowW) / 2;
      const y0 = (GRAPHIC_H - (rows * (cfg.item + cfg.gap) - cfg.gap)) / 2;
      for (let r = 0; r < rows; r++) {
        const y = y0 + r * (cfg.item + cfg.gap);
        const rowPhase = cfg.phaseOffset * r;
        const rowWave =
          (r / rows) * cfg.waveFrequency + cfg.phaseOffset + t * cfg.speed;
        const count = Math.max(
          5,
          cols +
            Math.floor(wave(rowWave, cfg.waveType) * cfg.waveAmplitude * 3),
        );
        for (let c = 0; c < count; c++) {
          const x = x0 + c * (cfg.item + cfg.gap);
          const phase =
            (c / count) * cfg.waveFrequency + rowPhase + t * cfg.speed;
          const raw =
            cfg.opacityMin +
            ((wave(phase, cfg.waveType) * cfg.waveAmplitude + 1) / 2 +
              0.15 * rng()) *
              (cfg.opacityMax - cfg.opacityMin);
          const alpha = Math.max(cfg.opacityMin, Math.min(cfg.opacityMax, raw));
          drawRect(ctx, x, y, cfg.item, cfg.item, foreground, alpha);
        }
      }
    };
  }, [seed, foreground, background]);
  return <canvas ref={ref} />;
}

/** Card 3: stacked horizontal ribbons that thicken toward the bottom. */
function NoiseLines({ seed, foreground, background }: GraphicProps) {
  const cfg = {
    waveType: "sine" as WaveType,
    waveAmplitude: 0.9,
    waveFrequency: 0.9,
    phaseOffset: 0.4,
    rows: 29,
    baseThickness: 0.5,
    maxThickness: 4.5,
    gapY: 2,
    speed: 0.2,
  };
  const ref = useTexture(() => {
    return (ctx, t) => {
      clearCanvas(ctx, GRAPHIC_W, GRAPHIC_H, background);
      ctx.fillStyle = foreground;
      const top = (GRAPHIC_H - cfg.rows * (cfg.maxThickness + cfg.gapY)) / 2;
      for (let r = 0; r < cfg.rows; r++) {
        const n = r / (cfg.rows - 1);
        const y = top + r * (cfg.maxThickness + cfg.gapY);
        const target =
          cfg.baseThickness + n * (cfg.maxThickness - cfg.baseThickness);
        const knee = 1 - 0.8 * n;
        const seg = GRAPHIC_W / 100;
        for (let i = 0; i < 100; i++) {
          const x = (i / 100) * GRAPHIC_W;
          const g = i / 100;
          let thickness = cfg.baseThickness;
          if (g > knee)
            thickness =
              cfg.baseThickness +
              ((g - knee) / (1 - knee)) * (target - cfg.baseThickness);
          const phase =
            (g + n) * cfg.waveFrequency + cfg.phaseOffset + t * cfg.speed;
          const dy = wave(phase, cfg.waveType) * cfg.waveAmplitude * 3;
          ctx.fillRect(x, y + dy - thickness / 2, seg + 1, thickness);
        }
      }
    };
  }, [seed, foreground, background]);
  return <canvas ref={ref} />;
}

/** Card 4: rows of variable-width blocks flowing on an elastic wave. */
function FluidGrid({ seed, foreground, background }: GraphicProps) {
  const cfg = {
    waveType: "elastic" as WaveType,
    waveAmplitude: 1,
    waveFrequency: 1,
    phaseOffset: 1,
    rows: 8,
    cols: 40,
    minWidth: 0,
    maxWidth: 11,
    itemHeight: 20,
    gapX: 2,
    gapY: 2,
    stagger: 0.12,
    speed: 0.05,
  };
  const ref = useTexture(() => {
    const rng = createSeededRandom(seed);
    return (ctx, t) => {
      clearCanvas(ctx, GRAPHIC_W, GRAPHIC_H, background);
      const rowSpan =
        cfg.cols * ((cfg.minWidth + cfg.maxWidth) / 2 + cfg.gapX) - cfg.gapX;
      const x0 = (GRAPHIC_W - rowSpan) / 2;
      const y0 =
        (GRAPHIC_H - (cfg.rows * (cfg.itemHeight + cfg.gapY) - cfg.gapY)) / 2;
      for (let r = 0; r < cfg.rows; r++) {
        const y = y0 + r * (cfg.itemHeight + cfg.gapY);
        const rowPhase = r * cfg.stagger;
        let x = x0;
        for (let c = 0; c < cfg.cols; c++) {
          const phase =
            (c / cfg.cols) * cfg.waveFrequency +
            rowPhase +
            cfg.phaseOffset +
            t * cfg.speed;
          const raw =
            cfg.minWidth +
            (0.5 +
              ((wave(phase, cfg.waveType) + 1) / 2 - 0.5) * cfg.waveAmplitude) *
              (cfg.maxWidth - cfg.minWidth) +
            (rng() - 0.5) * 0.5;
          const w = Math.max(cfg.minWidth, Math.min(cfg.maxWidth, raw));
          drawRect(ctx, x, y, w, cfg.itemHeight, foreground);
          x += w + cfg.gapX;
        }
      }
    };
  }, [seed, foreground, background]);
  return <canvas ref={ref} />;
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  lineWidth: number,
  alpha: number,
) {
  const i = lineWidth / 2;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.roundRect(x + i, y + i, w - lineWidth, h - lineWidth, Math.max(0, r - i));
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Card 5: a blueprint UI frame with a sidebar and a scrolling row of panels. */
function InterfaceBlueprint({ foreground, background }: GraphicProps) {
  const cfg = {
    gridSize: 12,
    gridOpacity: 0.12,
    strokeWidth: 1,
    cornerRadius: 6,
    speed: 0.4,
  };
  const ref = useTexture(() => {
    const g = cfg.gridSize;
    const snap = (v: number) => Math.round(v / g) * g;
    return (ctx, t) => {
      clearCanvas(ctx, GRAPHIC_W, GRAPHIC_H, background);
      ctx.strokeStyle = foreground;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = cfg.gridOpacity;
      for (let x = 0; x <= GRAPHIC_W; x += g) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GRAPHIC_H);
        ctx.stroke();
      }
      for (let y = 0; y <= GRAPHIC_H; y += g) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GRAPHIC_W, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const frameW = GRAPHIC_W - 2 * g;
      const frameH = GRAPHIC_H - 2 * g;
      strokeRoundRect(
        ctx,
        g,
        g,
        frameW,
        frameH,
        2 * cfg.cornerRadius,
        foreground,
        cfg.strokeWidth,
        0.4,
      );
      const innerX = 2 * g;
      const innerY = 2 * g;
      const innerW = frameW - 2 * g;
      const innerH = frameH - 2 * g;
      const sidebarW = snap(0.28 * innerW);
      strokeRoundRect(
        ctx,
        innerX,
        innerY,
        sidebarW,
        innerH,
        cfg.cornerRadius,
        foreground,
        cfg.strokeWidth,
        0.6,
      );
      const mainX = innerX + sidebarW + g;
      const mainW = innerW - sidebarW - g;
      strokeRoundRect(
        ctx,
        mainX,
        innerY,
        mainW,
        innerH,
        cfg.cornerRadius,
        foreground,
        cfg.strokeWidth,
        0.6,
      );
      const panelW = snap((mainW - 2 * g - 2 * g) / 3);
      const panelPad = 2 * g;
      const panelH = innerH - 2 * panelPad;
      const panelY = innerY + panelPad;
      const stride = panelW + g;
      const scroll = (t * cfg.speed * 25) % stride;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(
        mainX + cfg.strokeWidth,
        innerY + cfg.strokeWidth,
        mainW - 2 * cfg.strokeWidth,
        innerH - 2 * cfg.strokeWidth,
        cfg.cornerRadius - 1,
      );
      ctx.clip();
      const first = mainX + g - scroll;
      for (let e = 0; e < 5; e++) {
        strokeRoundRect(
          ctx,
          first + e * stride,
          panelY,
          panelW,
          panelH,
          cfg.cornerRadius - 1,
          foreground,
          cfg.strokeWidth,
          0.5,
        );
      }
      ctx.restore();
    };
  }, [foreground, background]);
  return <canvas ref={ref} />;
}

export type GraphicType =
  | "waveformBars"
  | "gridBlocks"
  | "noiseLines"
  | "fluidGrid"
  | "interfaceBlueprint";

const GRAPHICS: Record<GraphicType, (p: GraphicProps) => React.ReactElement> = {
  waveformBars: WaveformBars,
  gridBlocks: GridBlocks,
  noiseLines: NoiseLines,
  fluidGrid: FluidGrid,
  interfaceBlueprint: InterfaceBlueprint,
};

/* ------------------------------------------------------------------ */
/* Cards + fan layout                                                  */
/* ------------------------------------------------------------------ */

export interface DeckCard {
  id: string;
  title: string;
  titleLines: number;
  description: string;
  background: string;
  foreground: string;
  bodyColor: string;
  graphicType: GraphicType;
  seed: number;
}

export const defaultCards: DeckCard[] = [
  {
    id: "1",
    title: "Working\nKnowledge",
    titleLines: 2,
    description:
      "Frameworks, principles, and models you can apply to your interface work right away, from spacing systems to the way state is designed.",
    background: "#E54F10",
    foreground: "#FFFFC2",
    bodyColor: "rgba(255, 255, 194, 0.7)",
    graphicType: "waveformBars",
    seed: 12345,
  },
  {
    id: "2",
    title: "Practical\nDemonstration",
    titleLines: 2,
    description:
      "Detailed walkthroughs of building interfaces, spotting the real opportunities, and refining a screen until every part holds together.",
    background: "#F6EBD9",
    foreground: "#524733",
    bodyColor: "rgba(82, 71, 51, 0.8)",
    graphicType: "gridBlocks",
    seed: 54321,
  },
  {
    id: "3",
    title: "Collaborating\nwith AI",
    titleLines: 2,
    description:
      "Repeatable, specific methods for working with AI to get exacting results, covering Claude Code and how to structure prompts for real components.",
    background: "#0A90D2",
    foreground: "#AEFFFF",
    bodyColor: "rgba(174, 255, 255, 0.8)",
    graphicType: "noiseLines",
    seed: 11111,
  },
  {
    id: "4",
    title: "Means &\nMethods",
    titleLines: 2,
    description:
      "Small techniques for daily work: alignment, rhythm, and the assembly details that separate a good interface from a great one.",
    background: "#53F399",
    foreground: "#004D00",
    bodyColor: "rgba(0, 77, 0, 0.7)",
    graphicType: "fluidGrid",
    seed: 22222,
  },
  {
    id: "5",
    title: "Interface\nToolkit",
    titleLines: 2,
    description:
      "Screencasts and deep dives on the full path from a blank canvas to a shipped, production-ready set of interface primitives.",
    background: "#211F1E",
    foreground: "#F6EBD9",
    bodyColor: "rgba(246, 235, 217, 0.7)",
    graphicType: "interfaceBlueprint",
    seed: 33333,
  },
];

/** Resting fan pose per card id: where each card sits when nothing is open. */
const FAN_POSE: Record<
  string,
  { rotation: number; offsetX: number; offsetY: number }
> = {
  "1": { rotation: -8, offsetX: -306, offsetY: -10 },
  "2": { rotation: 4, offsetX: -151, offsetY: 20 },
  "3": { rotation: -2, offsetX: 0, offsetY: -41 },
  "4": { rotation: 1, offsetX: 147, offsetY: 16 },
  "5": { rotation: 5, offsetX: 310, offsetY: -19 },
};

/** Cluster pose per card id: where the unselected cards go when one is open. */
const CLUSTER_POSE: Record<
  string,
  { offsetX: number; offsetY: number; rotation: number; scale: number }
> = {
  "1": { offsetX: 49, offsetY: 48, rotation: -4, scale: 1 },
  "2": { offsetX: 31, offsetY: 49, rotation: -2, scale: 1 },
  "3": { offsetX: 0, offsetY: 51, rotation: 0, scale: 1 },
  "4": { offsetX: -10, offsetY: 53, rotation: 2, scale: 1 },
  "5": { offsetX: -33, offsetY: 57, rotation: 3, scale: 1 },
};

const SMALL = {
  cardW: 228,
  cardH: 288,
  padding: 16,
  graphicW: 196,
  graphicH: 120,
  titleSize: 28,
  titleLineH: 30,
};
const LARGE = {
  cardW: 360,
  cardH: 464,
  padding: 24,
  graphicW: 312,
  graphicH: 192,
  titleSize: 36,
  titleLineH: 36,
};
const BODY_W = LARGE.cardW - 2 * LARGE.padding;
const CLUSTER = { offsetX: 0, offsetY: 184, spacing: 70 };

const LAYOUT_SPRING = {
  type: "spring",
  visualDuration: 0.4,
  bounce: 0.15,
} as const;
const BODY_SPRING = {
  type: "spring",
  visualDuration: 0.2,
  bounce: 0.1,
} as const;
const POS_SPRING = {
  type: "spring",
  visualDuration: 0.5,
  bounce: 0.3,
} as const;

/**
 * The texture always draws at a fixed 312x192 and is scaled down to whatever
 * slot the card currently has, so the pattern keeps its density instead of
 * re-generating at a new size when a card opens.
 */
function CardGraphic({ card, dims }: { card: DeckCard; dims: typeof SMALL }) {
  const Graphic = GRAPHICS[card.graphicType];
  return (
    <motion.div
      className="absolute overflow-hidden"
      initial={false}
      animate={{
        left: dims.padding,
        top: dims.padding,
        width: dims.graphicW,
        height: dims.graphicH,
      }}
      transition={LAYOUT_SPRING}
    >
      <motion.div
        style={{
          width: GRAPHIC_W,
          height: GRAPHIC_H,
          transformOrigin: "top left",
        }}
        initial={false}
        animate={{ scale: dims.graphicW / GRAPHIC_W }}
        transition={LAYOUT_SPRING}
      >
        <div
          style={{
            width: GRAPHIC_W,
            height: GRAPHIC_H,
            backgroundColor: card.background,
          }}
        >
          <Graphic
            seed={card.seed}
            foreground={card.foreground}
            background={card.background}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export interface FannedCardDeckProps {
  cards?: DeckCard[];
  /** Width of the deck stage. Cards fan out within this box. */
  className?: string;
}

export default function FannedCardDeck({
  cards = defaultCards,
  className,
}: FannedCardDeckProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [width, setWidth] = useState(1080);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 1100);
    return () => clearTimeout(id);
  }, []);

  const t = (Math.max(400, Math.min(1080, width)) - 400) / 680;
  const offsetMultiplier = 0.4 + 0.6 * t;
  const clusterScale = 0.8 + 0.2 * t;
  const bodyFont = width <= 768 ? 17.5 : 16;

  const toggle = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected((cur) => (cur === id ? null : id));
  }, []);
  const close = useCallback(() => setSelected(null), []);

  return (
    <div
      className={`relative flex w-full items-center justify-center ${className ?? ""}`}
      style={{ minHeight: 600 }}
      onClick={close}
    >
      <motion.div
        className="relative"
        style={{ width: 900, height: 550 }}
        initial={{
          filter: "blur(8px)",
          scale: 0.8 * clusterScale,
          opacity: 0,
          y: 120,
        }}
        animate={{ filter: "blur(0px)", scale: clusterScale, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
      >
        {cards.map((card, index) => {
          const isSelected = selected === card.id;
          const dims = isSelected ? LARGE : SMALL;
          const fan = FAN_POSE[card.id];
          const cluster = CLUSTER_POSE[card.id];

          let x: number;
          let y: number;
          let rotate: number;
          let scale: number;
          if (isSelected) {
            x = 0;
            y = -40;
            rotate = 0;
            scale = 1;
          } else if (selected === null) {
            x = fan.offsetX * offsetMultiplier;
            y = fan.offsetY;
            rotate = fan.rotation;
            scale = 1;
          } else {
            const spread = (cards.length - 1) * CLUSTER.spacing;
            x =
              CLUSTER.offsetX +
              index * CLUSTER.spacing -
              spread / 2 +
              cluster.offsetX;
            y = CLUSTER.offsetY + cluster.offsetY;
            rotate = cluster.rotation;
            scale = 0.7 * cluster.scale;
          }

          const titleTop = isSelected
            ? dims.padding + dims.graphicH + 16
            : dims.cardH - dims.padding - dims.titleLineH * card.titleLines;
          const bodyTop =
            LARGE.padding +
            LARGE.graphicH +
            16 +
            LARGE.titleLineH * card.titleLines +
            12;
          const entranceLift =
            Math.max(25, 50 * Math.abs(index - 2)) + 48 * index;
          // Stagger only applies to the first landing; once mounted, reacting to
          // a click must be immediate.
          const stagger = mounted ? {} : { delay: 0.5 + 0.016 * index };

          return (
            <motion.div
              key={card.id}
              onClick={(e) => toggle(card.id, e)}
              className="absolute origin-center cursor-pointer select-none"
              style={{ left: "50%", top: "50%", zIndex: index + 1 }}
              initial={{
                x: x - dims.cardW / 2 + (2 - index) * 50,
                y: y - dims.cardH / 2 + entranceLift,
                scale,
                rotate,
              }}
              animate={{
                x: x - dims.cardW / 2,
                y: y - dims.cardH / 2,
                scale,
                rotate,
              }}
              whileHover={
                selected
                  ? {}
                  : { scale: 1.03 * scale, y: y - dims.cardH / 2 - 8 }
              }
              transition={{
                ...LAYOUT_SPRING,
                ...stagger,
                x: { ...POS_SPRING, ...stagger },
                y: { ...POS_SPRING, ...stagger },
              }}
            >
              <motion.div
                className="relative overflow-hidden rounded-2xl"
                style={{ backgroundColor: card.background }}
                initial={false}
                animate={{ width: dims.cardW, height: dims.cardH }}
                transition={LAYOUT_SPRING}
              >
                <CardGraphic card={card} dims={dims} />

                <motion.h2
                  className="absolute font-serif"
                  style={{
                    color: card.foreground,
                    whiteSpace: "pre-line",
                    fontSize: dims.titleSize,
                    lineHeight: `${dims.titleLineH}px`,
                    transition:
                      "font-size 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), line-height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  initial={false}
                  animate={{ top: titleTop, left: dims.padding }}
                  transition={LAYOUT_SPRING}
                >
                  {card.title}
                </motion.h2>

                <motion.div
                  className="absolute"
                  style={{ left: LARGE.padding, top: bodyTop, width: BODY_W }}
                  initial={false}
                  animate={{
                    opacity: isSelected ? 1 : 0,
                    filter: isSelected ? "blur(0px)" : "blur(4px)",
                  }}
                  transition={BODY_SPRING}
                >
                  <p
                    style={{
                      color: card.bodyColor,
                      fontSize: bodyFont,
                      lineHeight: "24px",
                    }}
                  >
                    {card.description}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

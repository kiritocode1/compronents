"use client";

/**
 * Phone Stack Carousel: a CSS-built phone in the middle of a fanned stack of
 * cards. The stack rides a critically damped spring, leans into its own
 * velocity, and the phone screen swaps slides through a wobbling circular
 * clip that grows from the right edge.
 *
 * Ported 1:1 from the phonestackcarousel.framer.website code component
 * (pinned in reference/phone-stack-carousel/carousel.pretty.js). Every size
 * is a multiple of `--u = min(1cqh, 1.95cqw)`, so the whole scene scales with
 * the component box, not the viewport. Give the parent a height.
 *
 * Input: drag or flick, wheel (both axes by default), arrow keys when
 * focused, click a side card to bring it forward, click the screen to open
 * the current slide's link. Autoplay pauses on hover and off screen.
 */

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
} from "react";

export type PhoneStackSlide = {
  /** Image URL. Ignored when `video` is set, as in the source. */
  image?: string;
  /** Video URL. Plays muted and looped on the screen and on side cards. */
  video?: string;
  /** Alt text. */
  title?: string;
  /** Opened when the screen is clicked while this slide is current. */
  link?: string;
};

export type PhoneFinish = "obsidian" | "graphite" | "ink" | "silver";
export type PhoneStackFeel = "silk" | "brisk" | "drift";

export type PhoneStackCarouselProps = {
  items?: PhoneStackSlide[];
  /** Index shown first. */
  start?: number;
  device?: {
    /** Phone height as a percentage of the box height, 50 to 96. */
    size?: number;
    finish?: PhoneFinish;
    /** Screen colour behind the media. */
    screen?: string;
    statusBar?: boolean;
    clock?: string;
    homeBar?: boolean;
    glare?: boolean;
  };
  cards?: {
    /** Side card width as a percentage of the phone width, 40 to 120. */
    width?: number;
    /** Side card height as a percentage of the phone height, 40 to 105. */
    height?: number;
    /** Corner radius in px. */
    radius?: number;
    /** How far cards tuck under each other, -30 to 60 (%). */
    overlap?: number;
    /** Scale lost per step away from the phone, 0 to 20 (%). */
    depth?: number;
    /** Darkening of the outermost cards, 0 to 100 (%). */
    dim?: number;
    /** Cards visible on each side, 1 to 6. */
    span?: number;
    /** Whether videos on side cards play or stay on their first frame. */
    sideVideo?: "play" | "poster";
    /** Fade the stack out at the left and right edges. */
    edgeFade?: boolean;
    /** Open slide links in a new tab. */
    newTab?: boolean;
  };
  motion?: {
    autoplay?: boolean;
    /** Seconds between autoplay steps, 1 to 20. */
    interval?: number;
    hoverPause?: boolean;
    wheel?: "both" | "horizontal" | "off";
    feel?: PhoneStackFeel;
    /** `liquid` wobbles the screen wipe, `iris` keeps it a clean circle. */
    morph?: "liquid" | "iris";
    /** Maximum lean in degrees while the stack moves, 0 to 20. */
    lean?: number;
    /** Fan the cards out from behind the phone on first view. */
    intro?: boolean;
  };
  surface?: {
    background?: string;
    grid?: boolean;
    gridColor?: string;
    halo?: string;
  };
  indicator?: {
    show?: boolean;
    color?: string;
    active?: string;
  };
  className?: string;
  style?: CSSProperties;
};

const ASSET_BASE = "https://ui.aryank.space/assets/phone-stack-carousel";

/** The eight slides on the source page, in its order. */
export const DEFAULT_SLIDES: PhoneStackSlide[] = [
  { image: `${ASSET_BASE}/chrome-study.jpg`, title: "Chrome Study" },
  { image: `${ASSET_BASE}/soft-ritual.png`, title: "Soft Ritual" },
  { video: `${ASSET_BASE}/lattice.mp4`, title: "Lattice" },
  { image: `${ASSET_BASE}/glass-edge.jpg`, title: "Glass Edge" },
  { image: `${ASSET_BASE}/plume.png`, title: "Plume" },
  { video: `${ASSET_BASE}/quiet-form.mp4`, title: "Quiet Form" },
  { image: `${ASSET_BASE}/night-grain.jpg`, title: "Night Grain" },
  { video: `${ASSET_BASE}/drift.mp4`, title: "" },
];

const FINISHES = {
  obsidian: {
    band: ["#0c0c0e", "#3c3d42", "#17171a", "#2d2e32", "#121214", "#060607"],
    key: ["#141416", "#3a3b40", "#1a1a1d"],
    seam: "#050506",
    edge: 0.22,
  },
  graphite: {
    band: ["#1d1e21", "#6e7075", "#38393d", "#5a5c61", "#2c2d30", "#121315"],
    key: ["#2a2b2e", "#6a6c71", "#323337"],
    seam: "#0b0b0c",
    edge: 0.32,
  },
  ink: {
    band: ["#0f131c", "#4a5568", "#1d2331", "#3a4459", "#171c28", "#080a0f"],
    key: ["#181d29", "#465067", "#20263a"],
    seam: "#05070a",
    edge: 0.26,
  },
  silver: {
    band: ["#7f8186", "#f3f4f6", "#b4b6ba", "#e6e7ea", "#9c9ea2", "#5d5f63"],
    key: ["#8e9094", "#eceef0", "#a5a7ab"],
    seam: "#1c1d1f",
    edge: 0.45,
  },
} as const;

/** Spring stiffness and damping ratio per feel. */
const FEELS = {
  silk: { k: 110, z: 1 },
  brisk: { k: 260, z: 0.94 },
  drift: { k: 60, z: 0.8 },
} as const;

/** Signal, wifi and battery glyphs for the status bar. */
const STATUS_GLYPHS = `url("data:image/svg+xml;utf8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2070%2014'%3E%3Cg%20fill%3D'white'%3E%3Crect%20x%3D'0'%20y%3D'8'%20width%3D'3.2'%20height%3D'4'%20rx%3D'0.8'%2F%3E%3Crect%20x%3D'4.8'%20y%3D'5.8'%20width%3D'3.2'%20height%3D'6.2'%20rx%3D'0.8'%2F%3E%3Crect%20x%3D'9.6'%20y%3D'3.4'%20width%3D'3.2'%20height%3D'8.6'%20rx%3D'0.8'%2F%3E%3Crect%20x%3D'14.4'%20y%3D'1'%20width%3D'3.2'%20height%3D'11'%20rx%3D'0.8'%2F%3E%3Ccircle%20cx%3D'30'%20cy%3D'10.9'%20r%3D'1.45'%2F%3E%3C%2Fg%3E%3Cg%20fill%3D'none'%20stroke%3D'white'%20stroke-width%3D'1.8'%20stroke-linecap%3D'round'%3E%3Cpath%20d%3D'M26.9%207.9%20A4.4%204.4%200%200%201%2033.1%207.9'%2F%3E%3Cpath%20d%3D'M24.2%205.2%20A8.2%208.2%200%200%201%2035.8%205.2'%2F%3E%3C%2Fg%3E%3Crect%20x%3D'44.5'%20y%3D'1.5'%20width%3D'21'%20height%3D'11'%20rx%3D'3.4'%20fill%3D'none'%20stroke%3D'white'%20stroke-opacity%3D'0.45'%2F%3E%3Crect%20x%3D'46.5'%20y%3D'3.5'%20width%3D'14.5'%20height%3D'7'%20rx%3D'1.8'%20fill%3D'white'%2F%3E%3Crect%20x%3D'66.6'%20y%3D'5'%20width%3D'1.7'%20height%3D'4'%20rx%3D'0.85'%20fill%3D'white'%20fill-opacity%3D'0.45'%2F%3E%3C%2Fsvg%3E")`;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const easeOutQuart = (t: number) => 1 - (1 - t) ** 4;
const easeInOutSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
/** A length in scene units. */
const u = (n: number) => `calc(var(--u) * ${n.toFixed(4)})`;

/** Signed shortest offset on a ring of n slides, in (-n/2, n/2]. */
function ringOffset(d: number, n: number) {
  if (n <= 0) return 0;
  let m = ((d % n) + n) % n;
  if (m > n / 2) m -= n;
  return m;
}

type Config = ReturnType<typeof resolveConfig>;

function resolveConfig(p: PhoneStackCarouselProps) {
  const device = p.device ?? {};
  const cards = p.cards ?? {};
  const motion = p.motion ?? {};
  const surface = p.surface ?? {};
  const indicator = p.indicator ?? {};

  const PH = clamp(device.size ?? 82, 50, 96);
  const PW = PH * 0.488;
  const R = PW * 0.172;
  const inset = PW * 0.05;
  const cardW = PW * clamp((cards.width ?? 80) / 100, 0.4, 1.2);
  const cardH = PH * clamp((cards.height ?? 80) / 100, 0.4, 1.05);
  const shrink = clamp((cards.depth ?? 8) / 100, 0, 0.2);
  const overlap = clamp((cards.overlap ?? 12) / 100, -0.3, 0.6);
  const tuck = cardW * 0.16;
  const showDots = indicator.show ?? false;
  const finish: PhoneFinish =
    device.finish && device.finish in FINISHES ? device.finish : "ink";

  return {
    PH,
    PW,
    R,
    inset,
    SW: PW - inset * 2,
    SH: PH - inset * 2,
    screenR: R - inset * 0.9,
    keyW: PW * 0.013,
    cardW,
    cardH,
    shrink,
    /** Distance from the phone centre to the first card's centre. */
    first: PW / 2 - tuck + (cardW * (1 - shrink)) / 2,
    /** Distance between later cards. */
    step: cardW * (1 - shrink * 1.6) * (1 - overlap),
    /** The scene lifts to make room for the dots. */
    lift: showDots ? 2.2 : 0,
    span: clamp(Math.round(cards.span ?? 3), 1, 6),
    dim: clamp((cards.dim ?? 45) / 100, 0, 1),
    radius: cards.radius ?? 22,
    sideVideo: cards.sideVideo ?? "play",
    edgeFade: cards.edgeFade ?? true,
    newTab: cards.newTab ?? true,
    finish,
    statusBar: device.statusBar ?? false,
    clock: device.clock ?? "9:41",
    homeBar: device.homeBar ?? true,
    glare: device.glare ?? true,
    screen: device.screen ?? "#050506",
    autoplay: motion.autoplay ?? true,
    interval: clamp(motion.interval ?? 3.2, 1, 20),
    hoverPause: motion.hoverPause ?? true,
    wheel: motion.wheel ?? "both",
    feel: motion.feel ?? "silk",
    lean: clamp(motion.lean ?? 6, 0, 20),
    intro: motion.intro ?? true,
    wobble: (motion.morph ?? "liquid") === "liquid" ? 0.11 : 0,
    bg: surface.background ?? "#FFFFFF",
    grid: surface.grid ?? true,
    gridColor: surface.gridColor ?? "rgba(255,255,255,0.07)",
    halo: surface.halo ?? "rgba(170,180,210,0.14)",
    showDots,
    dotColor: indicator.color ?? "rgba(255,255,255,0.22)",
    dotActive: indicator.active ?? "#FFFFFF",
  };
}

/** Where the card at signed ring offset `d` sits. */
function cardPose(d: number, c: Config, n: number) {
  const a = Math.abs(d);
  const sign = d < 0 ? -1 : 1;
  const x = a <= 1 ? a * c.first : c.first + (a - 1) * c.step;
  const reach = Math.min(c.span + 1, n / 2);
  return {
    x: sign * x,
    s: 1 - c.shrink * Math.min(a, 4),
    z: 200 - Math.round(a * 20),
    alpha: clamp((reach - a) / 0.5, 0, 1),
    shade: c.dim * Math.min(a / c.span, 1),
  };
}

/**
 * The screen wipe: a 60-point circle centred on the right edge of the screen
 * that grows to cover it as `t` goes 0 to 1. Two sine harmonics bend its
 * radius, strongest mid-wipe, which is the "liquid" look.
 */
function wipePolygon(t: number, c: Config, wobble: number) {
  if (t <= 0) return "polygon(100% 50%, 100% 50%, 100% 50%)";
  const cx = c.SW;
  const cy = c.SH / 2;
  const r = Math.hypot(c.SW, c.SH / 2) * 1.08 * t;
  const amp = wobble * Math.sin(Math.PI * t);
  const phase = t * 2.6;
  const pts: string[] = [];
  for (let i = 0; i < 60; i++) {
    const th = (i / 60) * Math.PI * 2;
    const rr =
      r *
      (1 +
        amp *
          (0.6 * Math.sin(3 * th + phase) +
            0.4 * Math.sin(5 * th - 1.3 * phase)));
    const x = ((cx + rr * Math.cos(th)) / c.SW) * 100;
    const y = ((cy + rr * Math.sin(th)) / c.SH) * 100;
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

function deviceStyles(c: Config) {
  const f = FINISHES[c.finish];
  const R = c.R;
  const bezel = c.PW * 0.021;
  const gap = c.PW * 0.006;
  const keyGradient = `linear-gradient(90deg, ${f.key[0]}, ${f.key[1]} 45%, ${f.key[2]})`;
  const key = (
    side: "l" | "r",
    top: number,
    height: number,
  ): CSSProperties => ({
    position: "absolute",
    top: u(c.PH * top),
    height: u(c.PH * height),
    width: u(c.keyW),
    [side === "l" ? "left" : "right"]: u(-c.keyW * 0.82),
    borderRadius: u(c.keyW),
    background: keyGradient,
    boxShadow: `inset 0 0 0 ${u(0.08)} rgba(255,255,255,${(f.edge * 0.5).toFixed(2)}), 0 0 ${u(0.3)} rgba(0,0,0,0.5)`,
  });
  const notch = (side: "l" | "r", top: string): CSSProperties => ({
    position: "absolute",
    [side === "l" ? "left" : "right"]: 0,
    top,
    width: u(bezel),
    height: u(c.PW * 0.011),
    background: "rgba(0,0,0,0.38)",
  });
  const b = f.band;

  return {
    frame: {
      position: "absolute",
      left: "50%",
      top: `calc(50% - ${u(c.lift)})`,
      width: u(c.PW),
      height: u(c.PH),
      transform: "translate(-50%, -50%)",
      zIndex: 400,
    } satisfies CSSProperties,
    keys: [
      key("l", 0.19, 0.038),
      key("l", 0.262, 0.072),
      key("l", 0.352, 0.072),
      key("r", 0.29, 0.108),
    ],
    notches: [
      notch("l", u(R * 0.95)),
      notch("r", u(R * 0.95)),
      notch("l", `calc(100% - ${u(R * 0.95)})`),
      notch("r", `calc(100% - ${u(R * 0.95)})`),
    ],
    cast: {
      position: "absolute",
      inset: 0,
      borderRadius: u(R),
      boxShadow: `0 ${u(4)} ${u(9)} rgba(0,0,0,0.6), 0 ${u(1.2)} ${u(2.4)} rgba(0,0,0,0.55)`,
      pointerEvents: "none",
    } satisfies CSSProperties,
    body: {
      position: "absolute",
      inset: 0,
      borderRadius: u(R),
      background: `linear-gradient(142deg, ${b[0]} 0%, ${b[1]} 14%, ${b[2]} 34%, ${b[3]} 58%, ${b[4]} 80%, ${b[5]} 100%)`,
      boxShadow: `inset 0 0 0 ${u(0.11)} rgba(255,255,255,${f.edge}), inset 0 0 ${u(0.5)} ${u(0.18)} rgba(0,0,0,0.45)`,
    } satisfies CSSProperties,
    seam: {
      position: "absolute",
      inset: u(bezel),
      borderRadius: u(R - bezel),
      background: f.seam,
      boxShadow: `inset 0 ${u(0.12)} ${u(0.2)} rgba(255,255,255,0.14)`,
    } satisfies CSSProperties,
    glass: {
      position: "absolute",
      inset: u(bezel + gap),
      borderRadius: u(R - bezel - gap),
      background: "linear-gradient(180deg, #0a0a0c, #020203)",
      boxShadow: `inset 0 0 0 ${u(0.1)} rgba(255,255,255,0.06)`,
    } satisfies CSSProperties,
    screen: {
      position: "absolute",
      inset: u(c.inset),
      borderRadius: u(c.screenR),
      overflow: "hidden",
      background: c.screen,
      isolation: "isolate",
      WebkitMaskImage: "-webkit-radial-gradient(white, black)",
    } satisfies CSSProperties,
    island: {
      position: "absolute",
      left: "50%",
      top: u(c.PW * 0.034),
      width: u(c.SW * 0.34),
      height: u(c.PW * 0.092),
      transform: "translateX(-50%)",
      borderRadius: u(c.PW * 0.05),
      background: "#000",
      zIndex: 6,
    } satisfies CSSProperties,
    lens: {
      position: "absolute",
      right: u(c.PW * 0.026),
      top: "50%",
      width: u(c.PW * 0.042),
      height: u(c.PW * 0.042),
      transform: "translateY(-50%)",
      borderRadius: "50%",
      background:
        "radial-gradient(circle at 38% 34%, rgba(120,150,255,0.55) 0 14%, rgba(30,40,80,0.9) 32%, #07080c 62%)",
      boxShadow: `0 0 0 ${u(0.12)} rgba(255,255,255,0.05)`,
    } satisfies CSSProperties,
    status: {
      position: "absolute",
      left: 0,
      right: 0,
      top: u(c.PW * 0.034),
      height: u(c.PW * 0.092),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `0 ${u(c.SW * 0.1)} 0 ${u(c.SW * 0.13)}`,
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      fontWeight: 600,
      fontSize: u(c.PW * 0.05),
      letterSpacing: "0.01em",
      zIndex: 5,
      pointerEvents: "none",
    } satisfies CSSProperties,
    glyphs: {
      width: u(c.SW * 0.22),
      height: u(c.SW * 0.044),
      backgroundImage: STATUS_GLYPHS,
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
    } satisfies CSSProperties,
    topShade: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: "16%",
      background: "linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0))",
      zIndex: 4,
      pointerEvents: "none",
    } satisfies CSSProperties,
    homeBar: {
      position: "absolute",
      left: "50%",
      bottom: u(c.PW * 0.022),
      width: u(c.SW * 0.36),
      height: u(c.PW * 0.013),
      transform: "translateX(-50%)",
      borderRadius: u(c.PW * 0.01),
      background: "rgba(255,255,255,0.88)",
      zIndex: 5,
      pointerEvents: "none",
    } satisfies CSSProperties,
    glare: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(118deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.035) 26%, rgba(255,255,255,0) 44%), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 8%)",
      zIndex: 7,
      pointerEvents: "none",
    } satisfies CSSProperties,
    rim: {
      position: "absolute",
      inset: 0,
      borderRadius: u(R),
      boxShadow: `inset 0 ${u(0.15)} ${u(0.2)} rgba(255,255,255,${(f.edge * 0.8).toFixed(2)}), inset 0 ${u(-0.15)} ${u(0.25)} rgba(0,0,0,0.4)`,
      pointerEvents: "none",
    } satisfies CSSProperties,
  };
}

function sceneStyles(c: Config) {
  const fade =
    "linear-gradient(90deg, transparent 0%, #000 11%, #000 89%, transparent 100%)";
  return {
    root: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      background: c.bg,
      containerType: "size",
      cursor: "grab",
      touchAction: "pan-y",
      userSelect: "none",
      outline: "none",
    } satisfies CSSProperties,
    scale: {
      position: "absolute",
      inset: 0,
      "--u": "min(1cqh, 1.95cqw)",
    } as CSSProperties,
    grid: {
      position: "absolute",
      inset: 0,
      backgroundImage: `radial-gradient(${c.gridColor} 1px, transparent 1.4px)`,
      backgroundSize: "22px 22px",
      backgroundPosition: "center",
      pointerEvents: "none",
    } satisfies CSSProperties,
    halo: {
      position: "absolute",
      left: "50%",
      top: `calc(50% - ${u(c.lift)})`,
      width: u(c.PW * 2.3),
      height: u(c.PH * 0.95),
      transform: "translate(-50%, -50%)",
      background: `radial-gradient(closest-side, ${c.halo}, rgba(0,0,0,0))`,
      pointerEvents: "none",
    } satisfies CSSProperties,
    stack: {
      position: "absolute",
      inset: 0,
      perspective: u(220),
      ...(c.edgeFade ? { WebkitMaskImage: fade, maskImage: fade } : {}),
    } satisfies CSSProperties,
    card: {
      position: "absolute",
      left: "50%",
      top: `calc(50% - ${u(c.lift)})`,
      overflow: "hidden",
      background: "#121214",
      boxShadow: `0 ${u(2)} ${u(5)} rgba(0,0,0,0.5)`,
      width: u(c.cardW),
      height: u(c.cardH),
      borderRadius: c.radius,
      visibility: "hidden",
      willChange: "transform, opacity",
    } satisfies CSSProperties,
    cardEdge: {
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      pointerEvents: "none",
    } satisfies CSSProperties,
    shade: {
      position: "absolute",
      inset: 0,
      background: "#000",
      opacity: 0,
    } satisfies CSSProperties,
    dots: {
      position: "absolute",
      left: "50%",
      top: `calc(50% - ${u(c.lift)} + ${u(c.PH / 2 + 2.6)})`,
      transform: "translate(-50%, -50%)",
      display: "flex",
      alignItems: "center",
      gap: u(0.8),
      zIndex: 600,
    } satisfies CSSProperties,
    dot: {
      height: u(0.75),
      width: u(0.75),
      borderRadius: u(1),
      background: c.dotColor,
    } satisfies CSSProperties,
    // maxWidth: none survives host resets such as Preflight's img max-width.
    media: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      maxWidth: "none",
      objectFit: "cover",
      display: "block",
      pointerEvents: "none",
    } satisfies CSSProperties,
  };
}

type Grab = {
  id: number;
  x: number;
  t: number;
  v: number;
  moved: number;
  /** Pixels of drag per slide. */
  per: number;
  /** Index of the card the press started on, or -1. */
  hit: number;
  onScreen: boolean;
};

export default function PhoneStackCarousel(props: PhoneStackCarouselProps) {
  const c = resolveConfig(props);
  const source = props.items?.length ? props.items : DEFAULT_SLIDES;
  const slides = useMemo(
    () =>
      source.map((s) => ({
        img: s.video ? "" : (s.image ?? ""),
        vid: s.video ?? "",
        title: s.title ?? "",
        link: s.link ?? "",
      })),
    [source],
  );
  const n = slides.length;
  const dev = deviceStyles(c);
  const sc = sceneStyles(c);

  // Latest props for the rAF loop and handlers, which are bound once.
  const live = useRef({ c, n, slides });
  live.current = { c, n, slides };

  const rootRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const shadeEls = useRef<(HTMLDivElement | null)[]>([]);
  const cardVideos = useRef<(HTMLVideoElement | null)[]>([]);
  const paneEls = useRef<(HTMLDivElement | null)[]>([]);
  const paneMediaEls = useRef<(HTMLDivElement | null)[]>([]);
  const paneShadeEls = useRef<(HTMLDivElement | null)[]>([]);
  const paneVideos = useRef<(HTMLVideoElement | null)[]>([]);
  const dotEls = useRef<(HTMLDivElement | null)[]>([]);

  const start = Math.round(props.start ?? 0);
  const state = useRef({
    pos: start,
    vel: 0,
    goal: start,
    raf: 0,
    last: 0,
    /** In view and the tab is visible. */
    permit: false,
    /** prefers-reduced-motion. */
    calm: false,
    hover: false,
    /** -2 waiting, -1 done, otherwise the intro's start time. */
    intro: c.intro ? -2 : -1,
    shown: -999,
    wheelT: undefined as ReturnType<typeof setTimeout> | undefined,
    autoT: undefined as ReturnType<typeof setTimeout> | undefined,
    grab: null as Grab | null,
  }).current;

  // The functions below only read `live` and `state`, so the copies bound by
  // the once-only effects stay correct across renders.
  const introAt = (now: number, a: number) =>
    state.intro === -1
      ? 1
      : state.intro === -2
        ? 0
        : easeOutQuart(clamp((now - state.intro - a * 85) / 1050, 0, 1));

  const paint = (now: number) => {
    const { c, n } = live.current;
    if (!n) return;
    const lean = state.calm ? 0 : clamp(-state.vel * 2.4, -c.lean, c.lean);
    for (let i = 0; i < n; i++) {
      const el = cardEls.current[i];
      if (!el) continue;
      const d = ringOffset(i - state.pos, n);
      const a = Math.abs(d);
      const p = cardPose(d, c, n);
      if (p.alpha <= 0.001 || a < 0.02) {
        el.style.visibility = "hidden";
        continue;
      }
      const k = introAt(now, a);
      el.style.visibility = "visible";
      el.style.zIndex = String(p.z);
      el.style.opacity = String(p.alpha);
      el.style.transform = `translate3d(-50%, -50%, 0) translate3d(${u(p.x * k)}, 0, 0) rotateY(${lean.toFixed(3)}deg) scale(${(p.s * (0.92 + 0.08 * k)).toFixed(4)})`;
      const shade = shadeEls.current[i];
      if (shade) shade.style.opacity = p.shade.toFixed(3);
    }

    const base = Math.floor(state.pos);
    const frac = state.pos - base;
    const cur = ((base % n) + n) % n;
    const next = (cur + 1) % n;
    const t = easeInOutSine(clamp(frac, 0, 1));
    for (let i = 0; i < n; i++) {
      const pane = paneEls.current[i];
      if (!pane) continue;
      const media = paneMediaEls.current[i];
      const shade = paneShadeEls.current[i];
      if (i === next && next !== cur && t > 5e-4) {
        pane.style.visibility = "visible";
        pane.style.zIndex = "2";
        const clip = wipePolygon(t, c, c.wobble);
        pane.style.clipPath = clip;
        pane.style.setProperty("-webkit-clip-path", clip);
        if (media)
          media.style.transform = `scale(${(1.22 - 0.22 * t).toFixed(4)})`;
        if (shade) shade.style.opacity = ((1 - t) * 0.35).toFixed(3);
      } else if (i === cur) {
        pane.style.visibility = "visible";
        pane.style.zIndex = "1";
        pane.style.clipPath = "none";
        pane.style.setProperty("-webkit-clip-path", "none");
        if (media)
          media.style.transform = `scale(${(1 - 0.07 * t).toFixed(4)})`;
        if (shade) shade.style.opacity = (t * 0.6).toFixed(3);
      } else {
        pane.style.visibility = "hidden";
      }
    }

    for (let i = 0; i < n; i++) {
      const dot = dotEls.current[i];
      if (!dot) continue;
      const near = Math.max(0, 1 - Math.abs(ringOffset(i - state.pos, n)));
      dot.style.width = u(0.75 + 1.85 * near);
      dot.style.background = near > 0.5 ? c.dotActive : c.dotColor;
      dot.style.opacity = String(0.65 + 0.35 * near);
    }
  };

  /** Play the current screen video and side card videos within reach. */
  const syncVideos = () => {
    const { c, n } = live.current;
    for (let i = 0; i < n; i++) {
      const a = Math.abs(ringOffset(i - state.goal, n));
      const screen = paneVideos.current[i];
      if (screen) {
        if (state.permit && a < 0.5) screen.play().catch(() => {});
        else screen.pause();
      }
      const card = cardVideos.current[i];
      if (card) {
        if (state.permit && a >= 0.5 && a <= c.span + 0.5)
          card.play().catch(() => {});
        else card.pause();
      }
    }
  };

  const syncIfMoved = () => {
    const { n } = live.current;
    const idx = n ? ((Math.round(state.goal) % n) + n) % n : 0;
    if (idx !== state.shown) {
      state.shown = idx;
      syncVideos();
    }
  };

  const scheduleAutoplay = () => {
    clearTimeout(state.autoT);
    state.autoT = undefined;
    const { c, n } = live.current;
    if (!c.autoplay || !state.permit || state.calm || state.grab || n < 2)
      return;
    if (c.hoverPause && state.hover) return;
    state.autoT = setTimeout(() => {
      state.autoT = undefined;
      if (
        !state.permit ||
        state.grab ||
        (live.current.c.hoverPause && state.hover)
      )
        return;
      state.goal = Math.round(state.goal) + 1;
      kick();
    }, c.interval * 1000);
  };

  const tick = (now: number) => {
    state.raf = 0;
    if (!state.permit) return;
    const { c, n } = live.current;
    const dt = state.last
      ? Math.min((now - state.last) / 1000, 1 / 30)
      : 1 / 60;
    state.last = now;
    if (state.intro === -2) state.intro = now;

    let busy = false;
    if (state.grab) busy = true;
    else if (state.calm) {
      state.pos = state.goal;
      state.vel = 0;
    } else {
      // Damped spring, three semi-implicit Euler substeps per frame.
      const f = FEELS[c.feel] ?? FEELS.silk;
      const damping = 2 * f.z * Math.sqrt(f.k);
      const h = dt / 3;
      for (let s = 0; s < 3; s++) {
        const acc = -f.k * (state.pos - state.goal) - damping * state.vel;
        state.vel += acc * h;
        state.pos += state.vel * h;
      }
      if (
        Math.abs(state.pos - state.goal) < 4e-4 &&
        Math.abs(state.vel) < 0.002
      ) {
        state.pos = state.goal;
        state.vel = 0;
        if (n > 0) {
          // Rebase into [0, n) so positions never grow without bound.
          const wrap = Math.floor(state.pos / n) * n;
          state.pos -= wrap;
          state.goal -= wrap;
        }
      } else busy = true;
    }
    if (state.intro >= 0) {
      if (now - state.intro < 1050 + (c.span + 1) * 85) busy = true;
      else state.intro = -1;
    }
    paint(now);
    syncIfMoved();
    if (busy) state.raf = requestAnimationFrame(tick);
    else {
      state.last = 0;
      scheduleAutoplay();
    }
  };

  const kick = () => {
    if (!state.permit || state.raf) return;
    clearTimeout(state.autoT);
    state.autoT = undefined;
    state.raf = requestAnimationFrame(tick);
  };

  /** Stop everything and snap to the nearest slide. */
  const halt = () => {
    cancelAnimationFrame(state.raf);
    state.raf = 0;
    state.last = 0;
    clearTimeout(state.autoT);
    clearTimeout(state.wheelT);
    state.autoT = undefined;
    state.wheelT = undefined;
    state.grab = null;
    state.vel = 0;
    state.goal = Math.round(state.goal);
    state.pos = state.goal;
    if (state.intro >= 0) state.intro = -1;
    paint(performance.now());
    for (const v of paneVideos.current) v?.pause();
    for (const v of cardVideos.current) v?.pause();
  };

  const fns = useRef({
    paint,
    syncVideos,
    kick,
    halt,
    scheduleAutoplay,
    syncIfMoved,
  });
  fns.current = {
    paint,
    syncVideos,
    kick,
    halt,
    scheduleAutoplay,
    syncIfMoved,
  };

  // Run only while on screen and the tab is visible; follow reduced motion.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const hasIO = typeof IntersectionObserver !== "undefined";
    let inView = !hasIO;
    let visible = document.visibilityState !== "hidden";
    const mq =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    state.calm = !!mq?.matches;

    const update = () => {
      const ok = inView && visible;
      if (ok === state.permit) return;
      state.permit = ok;
      if (ok) {
        if (state.intro === -2 && (state.calm || !live.current.c.intro))
          state.intro = -1;
        fns.current.syncVideos();
        fns.current.kick();
      } else fns.current.halt();
    };
    const io = hasIO
      ? new IntersectionObserver(
          (entries) => {
            inView = entries.some((e) => e.isIntersecting);
            update();
          },
          { threshold: 0.01 },
        )
      : null;
    io?.observe(el);
    const onVisibility = () => {
      visible = document.visibilityState !== "hidden";
      update();
    };
    const onMotionPref = () => {
      state.calm = !!mq?.matches;
      if (state.calm) {
        state.intro = -1;
        clearTimeout(state.autoT);
        state.autoT = undefined;
      }
      fns.current.kick();
      if (!state.raf) fns.current.scheduleAutoplay();
    };
    document.addEventListener("visibilitychange", onVisibility);
    mq?.addEventListener?.("change", onMotionPref);
    update();
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq?.removeEventListener?.("change", onMotionPref);
      state.permit = false;
      fns.current.halt();
    };
  }, [state]);

  // Wheel needs a non-passive listener to stop the page scrolling.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const { c } = live.current;
      if (c.wheel === "off" || !state.permit) return;
      let d = 0;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) d = e.deltaX;
      else if (c.wheel === "both") d = e.deltaY;
      if (!d) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 420 : 1;
      const near = Math.round(state.pos);
      state.goal = clamp(state.goal + (d * unit) / 360, near - 3, near + 3);
      clearTimeout(state.wheelT);
      state.wheelT = setTimeout(() => {
        state.wheelT = undefined;
        state.goal = Math.round(state.goal);
        fns.current.kick();
      }, 150);
      fns.current.kick();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [state]);

  // Repaint after every render so prop changes apply without motion.
  useEffect(() => {
    fns.current.paint(performance.now());
    state.shown = -999;
    fns.current.syncIfMoved();
  });

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !state.permit) return;
    const { c } = live.current;
    const target = e.target as HTMLElement;
    const slot = target.closest<HTMLElement>("[data-slot]");
    const box = rootRef.current?.getBoundingClientRect();
    const unitPx = box ? Math.min(box.height * 0.01, box.width * 0.0195) : 7;
    state.grab = {
      id: e.pointerId,
      x: e.clientX,
      t: performance.now(),
      v: 0,
      moved: 0,
      per: Math.max(40, c.first * unitPx),
      hit: slot ? Number(slot.dataset.slot) : -1,
      onScreen: !!target.closest("[data-pane]"),
    };
    state.vel = 0;
    clearTimeout(state.wheelT);
    state.wheelT = undefined;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    if (rootRef.current) rootRef.current.style.cursor = "grabbing";
    kick();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = state.grab;
    if (!g || g.id !== e.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - g.x;
    const dPos = -dx / g.per;
    state.pos += dPos;
    state.goal = state.pos;
    const dt = Math.max((now - g.t) / 1000, 0.001);
    g.v = g.v * 0.65 + (dPos / dt) * 0.35;
    g.moved += Math.abs(dx);
    g.x = e.clientX;
    g.t = now;
    state.vel = g.v;
  };

  const release = (
    e: ReactPointerEvent<HTMLDivElement>,
    cancelled: boolean,
  ) => {
    const g = state.grab;
    if (!g || g.id !== e.pointerId) return;
    state.grab = null;
    if (rootRef.current) rootRef.current.style.cursor = "grab";
    const { c, n, slides } = live.current;
    const near = Math.round(state.pos);
    if (!cancelled && g.moved < 6) {
      // A click: open the screen's link, or bring a clicked card forward.
      state.vel = 0;
      state.goal = near;
      if (g.onScreen && n) {
        const s = slides[((near % n) + n) % n];
        if (s?.link)
          window.open(s.link, c.newTab ? "_blank" : "_self", "noopener");
      } else if (g.hit >= 0 && n)
        state.goal = near + ringOffset(g.hit - near, n);
    } else {
      // A flick: carry velocity, land on a slide at most four away.
      const v = performance.now() - g.t > 90 ? 0 : clamp(g.v, -14, 14);
      state.vel = v;
      state.goal = clamp(Math.round(state.pos + v * 0.24), near - 4, near + 4);
    }
    kick();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    state.goal = Math.round(state.goal) + (e.key === "ArrowRight" ? 1 : -1);
    kick();
  };

  const first = ((start % (n || 1)) + (n || 1)) % (n || 1);

  return (
    <div
      ref={rootRef}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: arrow keys drive the carousel
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Media carousel"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => release(e, false)}
      onPointerCancel={(e) => release(e, true)}
      onPointerEnter={() => {
        state.hover = true;
        clearTimeout(state.autoT);
        state.autoT = undefined;
      }}
      onPointerLeave={() => {
        state.hover = false;
        if (!state.raf) scheduleAutoplay();
      }}
      onKeyDown={onKeyDown}
      className={props.className}
      style={{ ...sc.root, ...props.style }}
    >
      <div style={sc.scale}>
        {c.grid && <div style={sc.grid} />}
        <div style={sc.halo} />
        <div style={sc.stack}>
          {slides.map((s, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: slides are positional
              key={i}
              data-slot={i}
              ref={(el) => {
                cardEls.current[i] = el;
              }}
              style={sc.card}
            >
              {s.vid && c.sideVideo === "play" ? (
                <video
                  ref={(el) => {
                    cardVideos.current[i] = el;
                  }}
                  src={s.vid}
                  poster={s.img || undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  style={sc.media}
                />
              ) : s.img ? (
                // biome-ignore lint/performance/noImgElement: plain media layer sized by the card
                <img
                  src={s.img}
                  alt={s.title}
                  draggable={false}
                  style={sc.media}
                />
              ) : null}
              <div
                ref={(el) => {
                  shadeEls.current[i] = el;
                }}
                style={sc.shade}
              />
              <div style={sc.cardEdge} />
            </div>
          ))}
        </div>
        <div style={dev.frame}>
          <div style={dev.cast} />
          {dev.keys.map((k, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
            <div key={i} style={k} />
          ))}
          <div style={dev.body}>
            {dev.notches.map((k, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed list
              <div key={i} style={k} />
            ))}
          </div>
          <div style={dev.seam} />
          <div style={dev.glass} />
          <div data-pane="" style={dev.screen}>
            {slides.map((s, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: slides are positional
                key={i}
                ref={(el) => {
                  paneEls.current[i] = el;
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  visibility: i === first ? "visible" : "hidden",
                  willChange: "clip-path",
                }}
              >
                <div
                  ref={(el) => {
                    paneMediaEls.current[i] = el;
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    willChange: "transform",
                  }}
                >
                  {s.vid ? (
                    <video
                      ref={(el) => {
                        paneVideos.current[i] = el;
                      }}
                      src={s.vid}
                      poster={s.img || undefined}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      style={sc.media}
                    />
                  ) : s.img ? (
                    // biome-ignore lint/performance/noImgElement: plain media layer sized by the screen
                    <img
                      src={s.img}
                      alt={s.title}
                      draggable={false}
                      style={sc.media}
                    />
                  ) : null}
                </div>
                <div
                  ref={(el) => {
                    paneShadeEls.current[i] = el;
                  }}
                  style={{ ...sc.shade, pointerEvents: "none" }}
                />
              </div>
            ))}
            {c.statusBar && <div style={dev.topShade} />}
            {c.statusBar && (
              <div style={dev.status}>
                <span>{c.clock}</span>
                <span style={dev.glyphs} />
              </div>
            )}
            <div style={dev.island}>
              <div style={dev.lens} />
            </div>
            {c.homeBar && <div style={dev.homeBar} />}
            {c.glare && <div style={dev.glare} />}
          </div>
          <div style={dev.rim} />
        </div>
        {c.showDots && n > 1 && (
          <div style={sc.dots}>
            {slides.map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: one dot per slide
                key={i}
                ref={(el) => {
                  dotEls.current[i] = el;
                }}
                style={sc.dot}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

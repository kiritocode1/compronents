"use client";

/**
 * Settlement Layer Page - a multi-route enterprise infrastructure template.
 *
 * Motion architecture (rebuilt in React, parameters measured from a teardown of
 * a Webflow + GSAP reference build):
 *
 *  - Lenis smooth scroll driven by the GSAP ticker with lagSmoothing off, and
 *    ScrollTrigger.update wired to Lenis scroll so both share one clock.
 *  - A scroll-driven pixel dissolve between section colours: a 25x6 grid whose
 *    pattern and two shuffle orders come from a seeded minstd generator, so the
 *    dissolve is identical across reloads. Phase one (progress 0 to 0.5)
 *    reveals accent pixels, phase two (0.5 to 1) fills to solid.
 *  - Travelling pulses along staircase connector paths, using a dash segment of
 *    max(48, length * 0.045) and a 3.4s base loop offset per path.
 *  - A momentum drag carousel for the product suite, lerping at 0.14 per frame.
 *  - A header that flips to its light variant over light sections via
 *    IntersectionObserver, desktop only.
 *
 * Routing is internal: the component owns a path and renders the matching page,
 * so the whole template mounts as one registry item.
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ARTICLES,
  BUILT_FOR,
  CAPABILITIES,
  CAREER,
  COMPANY,
  CONTACT,
  CTA,
  CUTTING_EDGE,
  FOOTER_COLUMNS,
  LEGAL_DOCS,
  NAV_LINKS,
  NEWSROOM,
  PARTNERS,
  PRODUCTS,
  ROLES,
  TRUSTED,
  UTILITY_LINKS,
} from "./content";
import { getSettlementLayerPageStyles } from "./styles";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ------------------------------------------------------------------ router */

type RouterValue = {
  path: string;
  navigate: (next: string) => void;
};

const RouterContext = createContext<RouterValue>({
  path: "/",
  navigate: () => {},
});

const useRouter = () => useContext(RouterContext);

/**
 * The element that actually scrolls. Null means the window.
 *
 * The template is often mounted inside a scrolling container (a preview shell,
 * a demo box, a modal) rather than as the whole document. Lenis and
 * ScrollTrigger both default to the window, so without this every scroll-driven
 * effect silently does nothing in those contexts.
 */
const ScrollerContext = createContext<HTMLElement | null>(null);

const useScroller = () => useContext(ScrollerContext);

function findScroller(start: HTMLElement | null): HTMLElement | null {
  let el = start?.parentElement ?? null;
  while (el && el !== document.body && el !== document.documentElement) {
    const overflowY = getComputedStyle(el).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return el;
    el = el.parentElement;
  }
  return null;
}

/* ------------------------------------------------------------- primitives */

/** Deterministic minstd generator, so a dissolve looks the same every reload. */
function seededRandom(seed: number) {
  let t = seed % 2147483647;
  if (t <= 0) t += 2147483646;
  return () => {
    t = (t * 16807) % 2147483647;
    return (t - 1) / 2147483646;
  };
}

function shuffle<T>(input: T[], rnd: () => number) {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Shared smooth-scroll spine. One Lenis instance drives ScrollTrigger. */
function useSmoothScroll(
  rootRef: React.RefObject<HTMLDivElement | null>,
  onScroller: (el: HTMLElement | null) => void,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = rootRef.current;
    const scroller = findScroller(root);
    onScroller(scroller);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      ...(scroller && root ? { wrapper: scroller, content: root } : {}),
    });
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const resync = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", resync);
    if (document.fonts?.ready) void document.fonts.ready.then(resync);
    const settle = window.setTimeout(resync, 400);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("load", resync);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, [rootRef, onScroller]);
}

/** Entrance reveal. Sets data-in once the element crosses 88% of the viewport. */
function useFadeIn(
  rootRef: React.RefObject<HTMLElement | null>,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(".slp-fade"));
    if (!targets.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of targets) el.dataset.in = "true";
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.delay ?? 0);
          window.setTimeout(() => {
            el.dataset.in = "true";
          }, delay);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    for (const el of targets) io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const PIXEL_COLS = 25;
const PIXEL_ROWS = 6;
const REVEAL_RATIO = 0.5;

type PixelTransitionProps = {
  from: string;
  to: string;
  accent?: string;
  seed?: number;
};

/**
 * Scroll-driven pixel dissolve between two section colours.
 *
 * Pattern: the bottom two rows are always filled; above them a row appears with
 * probability 0.34 / 0.50 / 0.70 as it descends, and each live cell takes the
 * destination colour, the origin colour or the accent at a 55 / 27 / 18 split.
 * Progress under REVEAL_RATIO paints the reveal order, progress above it paints
 * the fill order, and at the top the whole band collapses to a solid block so
 * there is nothing left to repaint.
 */
function PixelTransition({
  from,
  to,
  accent = "#6fe3ff",
  seed = 0,
}: PixelTransitionProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scroller = useScroller();

  const pattern = useMemo(() => {
    const rnd = seededRandom(100 + seed);
    const rows: (0 | 1 | 2 | 3)[][] = [];
    for (let r = 0; r < PIXEL_ROWS; r++) {
      const row: (0 | 1 | 2 | 3)[] = [];
      for (let c = 0; c < PIXEL_COLS; c++) {
        if (r >= PIXEL_ROWS - 2) {
          row.push(1);
          continue;
        }
        const appear = r === 0 ? 0.34 : r === 1 ? 0.5 : 0.7;
        if (rnd() >= appear) {
          row.push(0);
          continue;
        }
        const p = rnd();
        row.push(p < 0.55 ? 1 : p < 0.82 ? 2 : 3);
      }
      rows.push(row);
    }
    return rows;
  }, [seed]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const grid = gridRef.current;
    if (!wrap || !grid) return;

    const colorFor = (t: 0 | 1 | 2 | 3) =>
      t === 1 ? to : t === 2 ? from : t === 3 ? accent : from;

    const cells: HTMLDivElement[] = [];
    const active: HTMLDivElement[] = [];
    grid.replaceChildren();

    for (let r = 0; r < PIXEL_ROWS; r++) {
      for (let c = 0; c < PIXEL_COLS; c++) {
        const type = pattern[r][c];
        const el = document.createElement("div");
        el.className = "slp-pixel";
        el.style.backgroundColor = from;
        el.dataset.base = colorFor(type);
        el.dataset.current = from;
        if (type) active.push(el);
        cells.push(el);
        grid.appendChild(el);
      }
    }

    const revealOrder = shuffle(active, seededRandom(200 + seed));
    const fillOrder = shuffle(active, seededRandom(300 + seed));

    const sizeGrid = () => {
      const width = Math.round(
        wrap.clientWidth || wrap.parentElement?.clientWidth || 0,
      );
      if (!width) return;
      const draw = Math.max(18, Math.ceil(width / PIXEL_COLS));
      grid.style.gridTemplateColumns = `repeat(${PIXEL_COLS},${draw}px)`;
      grid.style.gridTemplateRows = `repeat(${PIXEL_ROWS},${draw}px)`;
      grid.style.width = `${draw * PIXEL_COLS}px`;
      grid.style.height = `${draw * PIXEL_ROWS}px`;
      grid.style.marginLeft = `${Math.min(0, Math.round((width - draw * PIXEL_COLS) / 2))}px`;
      wrap.style.height = `${draw * PIXEL_ROWS}px`;
    };

    let solid = false;
    const paint = (revealCount: number, fillCount: number) => {
      if (solid) {
        wrap.dataset.solid = "true";
        return;
      }
      wrap.dataset.solid = "false";
      const revealed = new Set(revealOrder.slice(0, revealCount));
      const filled = new Set(fillOrder.slice(0, fillCount));
      for (const el of cells) {
        let color = from;
        if (revealed.has(el))
          color = filled.has(el) ? to : (el.dataset.base ?? from);
        // Only touch the DOM when the colour actually changed.
        if (el.dataset.current !== color) {
          el.style.backgroundColor = color;
          el.dataset.current = color;
        }
      }
    };

    const countFor = (p: number, len: number) =>
      p >= 0.997 ? len : Math.floor(clamp01(p) * len);

    const setProgress = (raw: number) => {
      const p = clamp01(raw);
      const revealCount = countFor(
        REVEAL_RATIO > 0 ? p / REVEAL_RATIO : p,
        revealOrder.length,
      );
      if (p <= REVEAL_RATIO) {
        solid = false;
        paint(revealCount, 0);
        return;
      }
      const pb = clamp01((p - REVEAL_RATIO) / (1 - REVEAL_RATIO));
      solid = solid ? pb >= 0.985 : pb >= 0.997;
      paint(revealCount, countFor(pb, fillOrder.length));
    };

    sizeGrid();

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      ...(scroller ? { scroller } : {}),
      start: "top bottom",
      end: "bottom top",
      invalidateOnRefresh: true,
      onUpdate: (self) => setProgress(self.progress),
      onLeave: () => {
        solid = true;
        paint(revealOrder.length, fillOrder.length);
      },
      onEnterBack: (self) => {
        solid = false;
        setProgress(self.progress);
      },
      onLeaveBack: () => {
        solid = false;
        setProgress(0);
      },
    });

    setProgress(trigger.progress);

    const onResize = () => {
      sizeGrid();
      ScrollTrigger.refresh();
      setProgress(trigger.progress);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      trigger.kill();
    };
  }, [pattern, from, to, accent, seed, scroller]);

  return (
    <div
      ref={wrapRef}
      className="slp-pixel-transition"
      data-solid="false"
      style={
        {
          "--slp-px-from": from,
          "--slp-px-solid": to,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div ref={gridRef} className="slp-pixel-grid" />
    </div>
  );
}

/**
 * Staircase connector with a light pulse travelling along it.
 * Dash segment is max(48, length * 0.045); each path's loop is offset by 0.15s.
 */
function ConnectorPaths({
  paths,
  viewBox,
}: {
  paths: string[];
  viewBox: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const scroller = useScroller();

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const pulses = Array.from(
        svg.querySelectorAll<SVGPathElement>(".slp-path-pulse"),
      );
      for (const [i, path] of pulses.entries()) {
        const len = path.getTotalLength();
        if (!len) continue;
        const seg = Math.max(48, len * 0.045);
        path.style.strokeDasharray = `${seg} ${len}`;
        path.style.strokeDashoffset = "0";
        gsap.set(path, { opacity: 1 });
        gsap.to(path, {
          strokeDashoffset: -(len + seg),
          duration: 3.4 + i * 0.15,
          ease: "none",
          repeat: -1,
        });
      }

      const bases = Array.from(
        svg.querySelectorAll<SVGPathElement>(".slp-path-base"),
      );
      for (const path of bases) {
        const len = path.getTotalLength();
        if (!len) continue;
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: "power2.out",
            stagger: 0.18,
            scrollTrigger: {
              trigger: svg,
              ...(scroller ? { scroller } : {}),
              start: "top 85%",
            },
          },
        );
      }
    },
    { scope: svgRef, dependencies: [scroller] },
  );

  return (
    <svg
      ref={svgRef}
      className="slp-path-svg"
      viewBox={viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <title>Connector paths</title>
      {paths.map((d) => (
        <path key={d} className="slp-path-base" d={d} />
      ))}
      {paths.map((d) => (
        <path key={`pulse-${d}`} className="slp-path-pulse" d={d} />
      ))}
    </svg>
  );
}

/**
 * Hero convergence field.
 *
 * Every parameter here is measured off a recorded frame of the reference
 * render rather than eyeballed, because a field like this reads wrong the
 * moment the distribution is regular.
 *
 *   spokes            130, lineWidth 1, drawn centre -> perimeter
 *   radius            0.30 of the smaller stage axis
 *   control distance  0.50 to 0.62 of the spoke length
 *   control angle     +/- 36 degrees off the spoke, signed both ways
 *   stroke            per-spoke linear gradient, centre -> endpoint
 *   dots              r 2.0, solid white, on the perimeter
 *   motion            constant 3.78 deg/sec rotation of the whole field
 *   shimmer           control angles drift ~8.9 deg per 1.4s on their own
 *   cursor push       control points shoved away from the pointer, ~120 units
 *                     at the cursor decaying on a ~180 unit exponential
 *
 * The centre and the radius never move: the recorded origin stayed pinned to
 * the exact stage centre in every frame. What the pointer moves is the control
 * point of each curve, which bows the curves away from the cursor and reads as
 * a concave push. The effect only exists inside the ring, which is why probing
 * from outside it shows nothing.
 *
 * The two details that carry the whole look: the control angle is symmetric
 * rather than one-directional (a single sign turns it into a pinwheel), and
 * each spoke is stroked with its own gradient so it is bright near the centre,
 * dips through the middle, and lifts again at the rim.
 */
const FIELD_SPOKES = 130;
const FIELD_RADIUS_RATIO = 0.3;
const FIELD_DEG_PER_SEC = 3.78;
/** Cursor push, in the same units as the measured stage (1440 wide). */
const FIELD_PUSH_STRENGTH = 265;
const FIELD_PUSH_FALLOFF = 180;
const FIELD_REF_WIDTH = 1440;
const FIELD_STOPS: [number, number][] = [
  [0, 0.3685],
  [0.2, 0.5425],
  [0.4, 0.168],
  [0.6, 0.14],
  [0.8, 0.14],
  [1, 0.3685],
];
const FIELD_LABELS = [
  { text: "SETTLEMENT...", angle: -0.62 },
  { text: "CUSTODY...", angle: -1.15 },
  { text: "ISSUANCE...", angle: 0.28 },
  { text: "CLEARING...", angle: 1.02 },
  { text: "TRANSFER...", angle: 2.32 },
  { text: "NETTING...", angle: 3.52 },
];

function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Per-spoke control-point character, fixed at mount so the field shimmers
  // rather than reshuffling every frame.
  const spokes = useMemo(() => {
    const rnd = seededRandom(11);
    return Array.from({ length: FIELD_SPOKES }, () => ({
      distFrac: 0.5 + rnd() * 0.12,
      // Signed both ways: this is what stops it reading as a pinwheel.
      angleOffset: ((rnd() * 2 - 1) * 36 * Math.PI) / 180,
      // Independent phase per spoke, so the field breathes rather than pulsing
      // in unison.
      shimmerPhase: rnd() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let raf = 0;
    let width = 0;
    let height = 0;

    // Pointer in canvas space. Null while the cursor is outside the stage,
    // which is also the state the field idles in.
    let pointer: { x: number; y: number } | null = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);

      const radius = Math.min(width, height) * FIELD_RADIUS_RATIO;
      const cx = width / 2;
      const cy = height / 2;
      const spin = reduced
        ? 0
        : (t / 1000) * FIELD_DEG_PER_SEC * (Math.PI / 180);

      ctx.lineWidth = 1;
      for (const [i, spoke] of spokes.entries()) {
        const a = (i / FIELD_SPOKES) * Math.PI * 2 + spin;
        const ex = cx + Math.cos(a) * radius;
        const ey = cy + Math.sin(a) * radius;

        // Measured: control angles drift ~8.9 degrees per 1.4s on their own,
        // independent of pointer position. Amplitude 9 over a 6s period lands
        // on that rate. Without it the spokes are rigid and the field reads as
        // a rotating diagram rather than a live one.
        const shimmer = reduced
          ? 0
          : (Math.sin((t / 6000) * Math.PI * 2 + spoke.shimmerPhase) *
              9 *
              Math.PI) /
            180;
        const ca = a + spoke.angleOffset + shimmer;
        const cr =
          radius *
          spoke.distFrac *
          (reduced
            ? 1
            : 1 +
              Math.sin((t / 5200) * Math.PI * 2 + spoke.shimmerPhase) * 0.021);
        let qx = cx + Math.cos(ca) * cr;
        let qy = cy + Math.sin(ca) * cr;

        // Shove the control point directly away from the cursor. Magnitude and
        // falloff are scaled from the measured stage so the push feels the same
        // at any viewport.
        if (pointer && !reduced) {
          const scale = width / FIELD_REF_WIDTH;
          const dx = qx - pointer.x;
          const dy = qy - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          const push =
            FIELD_PUSH_STRENGTH *
            scale *
            Math.exp(-dist / (FIELD_PUSH_FALLOFF * scale));
          qx += (dx / dist) * push;
          qy += (dy / dist) * push;
        }

        const grad = ctx.createLinearGradient(cx, cy, ex, ey);
        for (const [offset, alpha] of FIELD_STOPS) {
          grad.addColorStop(offset, `rgba(255,255,255,${alpha})`);
        }
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(qx, qy, ex, ey);
        ctx.stroke();
      }

      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < FIELD_SPOKES; i++) {
        const a = (i / FIELD_SPOKES) * Math.PI * 2 + spin;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(a) * radius,
          cy + Math.sin(a) * radius,
          2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      ctx.font = '11px "Fragment Mono", ui-monospace, monospace';
      ctx.fillStyle = "rgba(255,255,255,.66)";
      for (const label of FIELD_LABELS) {
        const lr = radius * 1.16;
        ctx.textAlign = Math.cos(label.angle) < 0 ? "right" : "left";
        ctx.fillText(
          label.text,
          cx + Math.cos(label.angle) * lr,
          cy + Math.sin(label.angle) * lr,
        );
      }
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      draw(performance.now());
    };
    window.addEventListener("resize", onResize, { passive: true });

    const stage = canvas.parentElement;
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onPointerLeave = () => {
      pointer = null;
    };

    if (!reduced && stage) {
      stage.addEventListener("pointermove", onPointerMove, { passive: true });
      stage.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (stage) {
        stage.removeEventListener("pointermove", onPointerMove);
        stage.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, [spokes]);

  return <canvas ref={canvasRef} className="slp-hero-field" />;
}

/**
 * Rising staircase flow with a scroll-driven pulse.
 *
 * Two stepped connectors run across the section, each a dim base line plus a
 * white pulse segment whose dash offset is tied directly to scroll position
 * rather than to a tween. Measured mechanics:
 *
 *   progress   (innerHeight - rect.top) / (innerHeight + rect.height), clamped
 *   main       dashoffset -1000 + progress * 1000   (1050 on mobile)
 *   sub        dashoffset -1040 + progress * 980    (1020 on mobile)
 *   dash       120/880 on the main line, 90/910 on the sub
 *   fade       past progress 0.82, 1 - (progress - 0.82) / 0.18
 *
 * Below 768px the progress source switches to the heading, mapped from
 * vh * 1.05 down to vh * 0.12, so the pulse tracks the text rather than a
 * section that now fills more than a screen.
 */
/**
 * Builds a rising staircase across the viewBox: run right, round the corner,
 * climb, repeat. `steps` are [x, y] landings; `r` is the corner radius. Two
 * lines are generated from the same description at a small offset so they read
 * as a pair rather than one thick rule.
 */
function staircasePath(steps: [number, number][], r = 20, offset = 0): string {
  const pts = steps.map(
    ([x, y]) => [x + offset, y + offset] as [number, number],
  );
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    const next = pts[i + 1];
    if (!next) {
      d += y === py ? `H${x}` : `V${y}`;
      continue;
    }
    // Stop short of the landing, then curve into the new direction.
    const rise = next[1] - y;
    d += `H${x - r}`;
    d += `C${x - r / 2} ${y} ${x} ${y + (rise > 0 ? r / 2 : -r / 2)} ${x} ${y + (rise > 0 ? r : -r)}`;
    d += `V${next[1] + (rise > 0 ? -r : r)}`;
    i++;
  }
  return d;
}

const FLOW_STEPS: [number, number][] = [
  [-40, 880],
  [560, 880],
  [560, 470],
  [980, 470],
  [980, 210],
  [1960, 210],
];
/** Mirrored landings, so a paired flow descends while the other climbs. */
const FLOW_STEPS_FALL: [number, number][] = [
  [-40, 210],
  [560, 210],
  [560, 470],
  [980, 470],
  [980, 880],
  [1960, 880],
];

type StaircaseFlowProps = {
  headingRef?: React.RefObject<HTMLElement | null>;
  /** Stretches the scroll distance: end = -(height * stretch + pad). */
  stretch?: number;
  pad?: number;
  /** Fraction of progress the pulse waits before it starts travelling. */
  motionDelay?: number;
  /** Fraction of the run spent fading in and out at each end. */
  pulseEdge?: number;
  /** -1 runs the pulse backwards along the path. */
  direction?: 1 | -1;
  /** Multiplies raw progress, so the pulse completes earlier than the scroll. */
  speedFactor?: number;
  /**
   * Which end the dash starts from. "lead" begins at -1000 and counts up,
   * "trail" begins at +1000 and counts down, which sends the pulse the other
   * way along the same path.
   */
  offsetFrom?: "lead" | "trail";
  /** Vertical placement of the generated staircase inside the viewBox. */
  variant?: "rise" | "fall";
};

function StaircaseFlow({
  headingRef,
  stretch = 1,
  pad = 0,
  motionDelay = 0,
  pulseEdge = 0,
  direction = 1,
  speedFactor = 1,
  offsetFrom = "lead",
  variant = "rise",
}: StaircaseFlowProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<SVGPathElement>(null);
  const subRef = useRef<SVGPathElement>(null);
  const gradId = useId();

  const [mainD, subD] = useMemo(() => {
    const steps = variant === "rise" ? FLOW_STEPS : FLOW_STEPS_FALL;
    return [staircasePath(steps, 20, 0), staircasePath(steps, 20, 30)];
  }, [variant]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const main = mainRef.current;
    const sub = subRef.current;
    if (!wrap || !main || !sub) return;

    let raf = 0;

    const progressForElement = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const h = rect.height || el.clientHeight || 1;
      const start = window.innerHeight;
      const end = -(h * stretch + pad);
      return clamp01(((start - rect.top) / (start - end)) * speedFactor);
    };

    const progressForHeading = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return clamp01((vh * 1.05 - rect.top) / (vh * 1.05 - vh * 0.12));
    };

    // A dead zone at the head of the run, then the whole travel compressed
    // into what is left.
    const motionProg = (p: number) =>
      motionDelay <= 0 ? p : clamp01((p - motionDelay) / (1 - motionDelay));

    // Symmetric fade at both ends of the travel.
    const edgeFade = (p: number) => {
      const k = Math.min(pulseEdge, 0.499);
      if (k <= 0) return 1;
      if (p < k) return clamp01(p / k);
      if (p > 1 - k) return clamp01((1 - p) / k);
      return 1;
    };

    const frame = () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const heading = headingRef?.current ?? null;
      const raw =
        mobile && heading
          ? progressForHeading(heading)
          : progressForElement(wrap);

      const moved = motionProg(raw);
      const p = direction === -1 ? 1 - moved : moved;

      const mainTravel = mobile ? 1050 : 1000;
      const subTravel = mobile ? 1020 : 980;

      if (offsetFrom === "trail") {
        main.style.strokeDashoffset = String(1000 - p * mainTravel);
        sub.style.strokeDashoffset = String(1040 - p * mainTravel);
      } else {
        main.style.strokeDashoffset = String(-1000 + p * mainTravel);
        sub.style.strokeDashoffset = String(-1040 + p * subTravel);
      }

      const fade = String(edgeFade(p));
      main.style.opacity = fade;
      sub.style.opacity = fade;

      raf = requestAnimationFrame(frame);
    };

    frame();
    return () => cancelAnimationFrame(raf);
  }, [
    headingRef,
    stretch,
    pad,
    motionDelay,
    pulseEdge,
    direction,
    speedFactor,
    offsetFrom,
  ]);

  return (
    <div ref={wrapRef} className="slp-flow" aria-hidden="true">
      <svg
        className="slp-flow-svg"
        viewBox="0 0 1920 914"
        preserveAspectRatio="none"
      >
        <title>Connector flow</title>
        <defs>
          <linearGradient
            id={gradId}
            x1="0"
            y1="0"
            x2="1920"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="rgba(255,255,255,0)" />
            <stop offset="0.5" stopColor="rgba(255,255,255,.34)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path className="slp-flow-base" d={subD} stroke={`url(#${gradId})`} />
        <path className="slp-flow-base" d={mainD} stroke={`url(#${gradId})`} />
        <path
          ref={subRef}
          className="slp-flow-pulse"
          d={subD}
          strokeDasharray="90 910"
        />
        <path
          ref={mainRef}
          className="slp-flow-pulse"
          d={mainD}
          strokeDasharray="120 880"
        />
      </svg>
    </div>
  );
}

/**
 * Testimonial carousel.
 *
 * The quote itself is not slid or wiped; it is re-set to zero opacity and
 * tweened back over 0.65s on power2.out each time the index changes, so the
 * text swaps in place. Dots and arrows drive the index, and the same tween
 * runs whichever control moved it.
 */
function TestimonialCarousel({
  items,
}: {
  items: { text: string; attribution: string }[];
}) {
  const [index, setIndex] = useState(0);
  const quoteRef = useRef<HTMLQuoteElement>(null);

  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { clearProps: "opacity" });
      return;
    }
    gsap.set(el, { opacity: 0 });
    const tween = gsap.to(el, {
      opacity: 1,
      duration: 0.65,
      ease: "power2.out",
      onComplete: () => gsap.set(el, { clearProps: "opacity" }),
    });
    return () => {
      tween.kill();
    };
  }, []);

  const go = (next: number) => {
    const count = items.length;
    setIndex(((next % count) + count) % count);
  };

  const active = items[index];

  return (
    <div className="slp-testimonials">
      <blockquote ref={quoteRef} className="slp-quote" key={index}>
        {active.text}
        <div className="slp-quote-attr">{active.attribution}</div>
      </blockquote>

      <div className="slp-testimonial-controls">
        <div className="slp-testimonial-dots">
          {items.map((item, i) => (
            <button
              key={item.attribution}
              type="button"
              className="slp-dot"
              data-active={i === index}
              aria-label={`Quote ${i + 1}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <div className="slp-testimonial-arrows">
          <button
            type="button"
            className="slp-arrow-btn"
            aria-label="Previous quote"
            onClick={() => go(index - 1)}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
              <title>Previous</title>
              <path
                d="M10 2L4 8l6 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="square"
              />
            </svg>
          </button>
          <button
            type="button"
            className="slp-arrow-btn"
            aria-label="Next quote"
            onClick={() => go(index + 1)}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
              <title>Next</title>
              <path
                d="M6 2l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="square"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Copy the current URL. Uses the async clipboard where it exists and falls
 * back to a hidden textarea plus execCommand, which is still the only path
 * that works in older WebViews and on insecure origins.
 */
function useCopyLink() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    const href = window.location.href;
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(href).then(done, () => {
        window.prompt("Copy:", href);
      });
      return;
    }

    const ta = document.createElement("textarea");
    ta.value = href;
    ta.style.position = "fixed";
    ta.style.left = "-99999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      done();
    } catch {
      window.prompt("Copy:", href);
    } finally {
      document.body.removeChild(ta);
    }
  }, []);

  return { copied, copy };
}

/** Phone input constrained to an optional leading + and up to 15 digits. */
const PHONE_PATTERN = /^\+?[0-9]{0,15}$/;

function PhoneField() {
  const [value, setValue] = useState("");

  return (
    <div className="slp-field">
      <label htmlFor="slp-phone">Phone</label>
      <input
        id="slp-phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          // Reject rather than strip, so a paste of something wrong is visible
          // to the person instead of being silently mangled.
          if (PHONE_PATTERN.test(next)) setValue(next);
        }}
        placeholder="+44"
      />
    </div>
  );
}

/**
 * Circuit-trace card artwork.
 *
 * Orthogonal traces run in from all four edges and terminate on a central
 * block, with pads dropped along the way. Generated from a seed so each
 * product gets its own board that is stable across reloads, and so the
 * template ships without external media.
 */
function CircuitPlate({ seed }: { seed: number }) {
  const traces = useMemo(() => {
    const rnd = seededRandom(400 + seed);
    const out: { d: string; pads: [number, number][] }[] = [];
    const coreL = 84;
    const coreR = 116;
    const coreT = 84;
    const coreB = 116;

    for (let i = 0; i < 18; i++) {
      const side = i % 4;
      const t = 0.12 + rnd() * 0.76;
      const step = 14 + rnd() * 30;
      const pads: [number, number][] = [];
      let d: string;

      if (side === 0) {
        const y = 200 * t;
        const x = coreL;
        d = `M0 ${y.toFixed(1)}H${(x - step).toFixed(1)}L${x.toFixed(1)} ${(y + (y < 100 ? step : -step)).toFixed(1)}V${(y < 100 ? coreT : coreB).toFixed(1)}`;
        pads.push([Math.max(4, x - step - 10), y]);
      } else if (side === 1) {
        const y = 200 * t;
        const x = coreR;
        d = `M200 ${y.toFixed(1)}H${(x + step).toFixed(1)}L${x.toFixed(1)} ${(y + (y < 100 ? step : -step)).toFixed(1)}V${(y < 100 ? coreT : coreB).toFixed(1)}`;
        pads.push([Math.min(196, x + step + 10), y]);
      } else if (side === 2) {
        const x = 200 * t;
        const y = coreT;
        d = `M${x.toFixed(1)} 0V${(y - step).toFixed(1)}L${(x + (x < 100 ? step : -step)).toFixed(1)} ${y.toFixed(1)}H${(x < 100 ? coreL : coreR).toFixed(1)}`;
        pads.push([x, Math.max(4, y - step - 10)]);
      } else {
        const x = 200 * t;
        const y = coreB;
        d = `M${x.toFixed(1)} 200V${(y + step).toFixed(1)}L${(x + (x < 100 ? step : -step)).toFixed(1)} ${y.toFixed(1)}H${(x < 100 ? coreL : coreR).toFixed(1)}`;
        pads.push([x, Math.min(196, y + step + 10)]);
      }
      out.push({ d, pads });
    }
    return out;
  }, [seed]);

  return (
    <svg
      className="slp-plate"
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <title>Circuit plate</title>
      {traces.map((tr) => (
        <path key={tr.d} d={tr.d} className="slp-plate-trace" />
      ))}
      {traces.flatMap((tr) =>
        tr.pads.map(([px, py]) => (
          <rect
            key={`${tr.d}-${px}-${py}`}
            x={px - 3}
            y={py - 3}
            width="6"
            height="6"
            className="slp-plate-pad"
          />
        )),
      )}
      <rect x="84" y="84" width="32" height="32" className="slp-plate-core" />
    </svg>
  );
}

/**
 * Cascading rounded steps.
 *
 * Large, thin outlines that step down and to the left across a section,
 * overlapping each other. Unlike the connector flows these carry no pulse:
 * they are structural, and the copy sits inside the bays they create. Each
 * step is drawn as an open path with generously rounded corners so the shape
 * reads as a sheet folding rather than a boxed border.
 */
function RoundedCascade({ steps = 3 }: { steps?: number }) {
  const paths = useMemo(() => {
    const out: string[] = [];
    const r = 34;
    for (let i = 0; i < steps; i++) {
      // Each successive sheet starts lower and further left.
      const x = 1400 - i * 300;
      const y = 120 + i * 300;
      const bottom = 1200;
      out.push(
        [
          `M2000 ${y}`,
          `H${x + r}`,
          `Q${x} ${y} ${x} ${y + r}`,
          `V${bottom - r}`,
          `Q${x} ${bottom} ${x - r} ${bottom}`,
          `H${Math.max(0, x - 340)}`,
        ].join(" "),
      );
    }
    return out;
  }, [steps]);

  return (
    <svg
      className="slp-cascade"
      viewBox="0 0 2000 1400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <title>Cascading steps</title>
      {paths.map((d) => (
        <path key={d} d={d} className="slp-cascade-path" />
      ))}
    </svg>
  );
}

/**
 * Curved mesh bands.
 *
 * Measured off the reference by filtering its draw calls to what actually
 * lands inside a 1440x900 viewport:
 *
 *   dots per 90px row   53 / 39 / 0 ... 0 / 27 / 64
 *   visible segments    506 of 900 drawn
 *   visible nodes       198, radius 2.4
 *   node pitch          ~195px horizontally
 *
 * The zero rows are the point: nothing renders between y 180 and y 720, so
 * this is two bands hugging the edges, not a sphere filling the frame. Each
 * band is a set of shallow arcs with cross links, drifting sideways so the
 * mesh reads as a surface in motion.
 */
const MESH_PITCH = 195;
const MESH_ROWS = 5;
const MESH_NODE_R = 2.4;
const MESH_DRIFT_PX_PER_SEC = 7;

function MeshBands() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /**
     * One band. `dir` is -1 for the top (arcs sagging down toward the middle)
     * and +1 for the bottom (arcs rising toward it), so the pair reads as the
     * inside of a curved surface.
     */
    const band = (baseY: number, dir: 1 | -1, drift: number) => {
      const cols = Math.ceil(width / MESH_PITCH) + 3;
      // Band must terminate by 180px from its edge: 5 rows x 26 + max sag 45.
      const rowGap = 26;
      const pts: { x: number; y: number }[][] = [];

      for (let r = 0; r < MESH_ROWS; r++) {
        const row: { x: number; y: number }[] = [];
        // Rows further from the edge sag more, which is what curves the band.
        const sag = (r + 1) * 9;
        for (let c = 0; c < cols; c++) {
          const x = c * MESH_PITCH - MESH_PITCH * 1.5 + drift;
          const t = x / width;
          // Shallow parabola across the width, deepest at centre.
          const curve = sag * 4 * t * (1 - t);
          row.push({ x, y: baseY + dir * (r * rowGap) + dir * curve });
        }
        pts.push(row);
      }

      ctx.strokeStyle = "rgba(255,255,255,.28)";
      ctx.lineWidth = 1;

      // Arcs along each row.
      for (const row of pts) {
        ctx.beginPath();
        row.forEach((p, i) =>
          i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
        );
        ctx.stroke();
      }
      // Cross links between rows.
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        pts.forEach((row, r) =>
          r ? ctx.lineTo(row[c].x, row[c].y) : ctx.moveTo(row[c].x, row[c].y),
        );
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255,255,255,.6)";
      for (const row of pts) {
        for (const p of row) {
          if (p.x < -40 || p.x > width + 40) continue;
          ctx.beginPath();
          ctx.arc(p.x, p.y, MESH_NODE_R, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const draw = (t: number) => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const drift = reduced
        ? 0
        : (((t / 1000) * MESH_DRIFT_PX_PER_SEC) % MESH_PITCH) - MESH_PITCH;
      band(-40, 1, drift);
      band(height + 40, -1, -drift);
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) draw(0);
    else raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      draw(performance.now());
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="slp-globe" />;
}

/* ------------------------------------------------------------ shared chrome */

function Reveal({ children }: { children: string }) {
  return (
    <span className="slp-reveal">
      <span className="slp-reveal-inner" data-text={children}>
        {children}
      </span>
    </span>
  );
}

function ArrowIcon() {
  return (
    <span className="slp-btn-arrow" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
        <title>Arrow</title>
        <path
          d="M3 13L13 3M13 3H5.5M13 3V10.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="square"
        />
      </svg>
    </span>
  );
}

type ButtonProps = {
  children: string;
  href?: string;
  variant?: "solid" | "ghost";
  arrow?: boolean;
};

function Button({
  children,
  href = "/contact",
  variant = "solid",
  arrow = true,
}: ButtonProps) {
  const { navigate } = useRouter();
  return (
    <button
      type="button"
      className={`slp-btn slp-btn-${variant}`}
      onClick={() => navigate(href)}
    >
      <span className="slp-btn-inner">
        <Reveal>{children}</Reveal>
        {arrow ? (
          <span className="slp-btn-box">
            <ArrowIcon />
          </span>
        ) : null}
      </span>
    </button>
  );
}

function Header() {
  const { path, navigate } = useRouter();
  const [light, setLight] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scroller = useScroller();

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    const target: HTMLElement | Window = scroller ?? window;
    const onScroll = () =>
      setScrolled((scroller ? scroller.scrollTop : window.scrollY) > 24);
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [scroller]);

  // Flip to the light header while a light section sits under it. Desktop only,
  // matching the reference behaviour.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 992px)").matches) {
      setLight(false);
      return;
    }
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".slp-on-white"),
    );
    if (!sections.length) {
      setLight(false);
      return;
    }
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setLight(visible.size > 0);
      },
      { rootMargin: "-8% 0px -92% 0px", threshold: 0 },
    );
    for (const s of sections) io.observe(s);
    return () => io.disconnect();
  }, [path]);

  return (
    <>
      <header
        className="slp-header"
        data-light={light}
        data-scrolled={scrolled}
      >
        <button
          type="button"
          className="slp-logo"
          onClick={() => navigate("/")}
        >
          <span className="slp-logo-mark" />
          BLANK
        </button>

        <nav className="slp-nav slp-pill-group">
          <button
            type="button"
            className="slp-nav-link"
            data-active={path === "/"}
            onClick={() => navigate("/")}
          >
            <Reveal>Home</Reveal>
          </button>
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              type="button"
              className="slp-nav-link"
              data-active={
                path === link.href || path.startsWith(`${link.href}/`)
              }
              onClick={() => navigate(link.href)}
            >
              <Reveal>{link.label}</Reveal>
            </button>
          ))}
        </nav>

        <div className="slp-header-actions">
          <div className="slp-pill-group">
            {UTILITY_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                className="slp-nav-link"
                data-active={path === link.href}
                onClick={() => navigate(link.href)}
              >
                <Reveal>{link.label}</Reveal>
              </button>
            ))}
          </div>
          <Button href="/contact">Get in Touch</Button>
          <button
            type="button"
            className="slp-burger"
            data-open={menuOpen}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </header>

      <div className="slp-mobile-menu" data-open={menuOpen}>
        {[...NAV_LINKS, ...UTILITY_LINKS].map((link) => (
          <button
            key={link.href}
            type="button"
            onClick={() => navigate(link.href)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </>
  );
}

const CTA_PATHS = [
  "M0,120 L140,120 L140,60 L320,60 L320,150 L520,150 L520,20 L760,20",
  "M0,190 L220,190 L220,110 L430,110 L430,215 L680,215 L680,90 L900,90",
];

function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  useFadeIn(ref);

  return (
    <section ref={ref} className="slp-section slp-on-white slp-cta">
      <ConnectorPaths paths={CTA_PATHS} viewBox="0 0 900 240" />
      <div className="slp-inner slp-cta-inner">
        <div className="slp-fade">
          <p className="slp-eyebrow">Get started</p>
          <h2 className="slp-h2" style={{ marginTop: "1rem" }}>
            {CTA.heading}
          </h2>
        </div>
        <div className="slp-fade" data-delay="120">
          <p className="slp-body">{CTA.body}</p>
          <div className="slp-cta-actions">
            <Button href="/contact">{CTA.primary}</Button>
            <Button href="/products" variant="ghost">
              {CTA.secondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { navigate } = useRouter();
  const year = new Date().getFullYear();

  return (
    <footer className="slp-footer">
      <div className="slp-inner">
        <div className="slp-footer-top">
          <div className="slp-footer-col">
            <h4>Stay informed</h4>
            <p className="slp-small" style={{ maxWidth: "38ch" }}>
              Release notes and research from the team, a few times a quarter.
            </p>
            <form
              className="slp-subscribe"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="you@institution.com"
                aria-label="Email address"
              />
              <button type="submit" className="slp-btn slp-btn-solid">
                <Reveal>Subscribe</Reveal>
              </button>
            </form>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="slp-footer-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <button type="button" onClick={() => navigate(link.href)}>
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="slp-footer-bottom">
          <span>© {year} BLANK. All rights reserved.</span>
          <span>Built on the settlement layer</span>
        </div>

        <div className="slp-wordmark">BLANK</div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------- home */

function ProductsCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let current = 0;
    let target = 0;
    let dragging = false;
    let startX = 0;
    let startTarget = 0;
    let raf = 0;

    const maxScroll = () =>
      Math.max(0, track.scrollWidth - viewport.clientWidth);
    const clampTarget = (v: number) => Math.max(-maxScroll(), Math.min(0, v));

    const render = () => {
      // Momentum lerp; the reference settles at 0.14 per frame.
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.05) current = target;
      track.style.transform = `translate3d(${current}px,0,0)`;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startTarget = target;
      viewport.dataset.dragging = "true";
      viewport.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      target = clampTarget(startTarget + (e.clientX - startX));
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      viewport.dataset.dragging = "false";
      if (viewport.hasPointerCapture(e.pointerId))
        viewport.releasePointerCapture(e.pointerId);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      target = clampTarget(target - e.deltaX);
    };
    const onResize = () => {
      target = clampTarget(target);
    };

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="slp-products-viewport"
      data-dragging="false"
    >
      <div ref={trackRef} className="slp-products-track">
        {PRODUCTS.map((product) => (
          <button
            key={product.slug}
            type="button"
            className="slp-product-card"
            onClick={() => navigate(`/products/${product.slug}`)}
          >
            <div className="slp-product-card-top">
              <span className="slp-eyebrow">{product.kicker}</span>
              <ArrowIcon />
            </div>
            <div style={{ textAlign: "left" }}>
              <h3>{product.name}</h3>
              <p>{product.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  const ref = useRef<HTMLDivElement>(null);
  // Below 768px the flow pulse tracks this heading instead of the section.
  const builtForHeadingRef = useRef<HTMLHeadingElement>(null);
  const cuttingEdgeHeadingRef = useRef<HTMLHeadingElement>(null);
  useFadeIn(ref);

  return (
    <div ref={ref}>
      <section className="slp-hero slp-on-blue">
        <HeroField />
        <div className="slp-hero-content">
          <h1 className="slp-hero-headline slp-fade">
            Enterprise-Grade
            <br />
            Infrastructure for Settlement
          </h1>
          <div className="slp-fade" data-delay="140">
            <Button href="/contact">Get in Touch</Button>
          </div>
        </div>
        <span className="slp-hero-caption">scroll down</span>
      </section>

      <section className="slp-section slp-on-blue">
        <StaircaseFlow headingRef={builtForHeadingRef} />
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">{BUILT_FOR.eyebrow}</p>
          <h2
            ref={builtForHeadingRef}
            className="slp-h2 slp-fade"
            data-delay="80"
            style={{ marginTop: "1rem" }}
          >
            {BUILT_FOR.heading}
          </h2>
          <div className="slp-builtfor-grid">
            <p className="slp-body slp-fade" data-delay="140">
              {BUILT_FOR.body}
            </p>
            <div className="slp-panel slp-fade" data-delay="200">
              <div className="slp-panel-steps">
                <ConnectorPaths paths={CTA_PATHS} viewBox="0 0 900 240" />
              </div>
              <h3 className="slp-h3">{BUILT_FOR.panel.title}</h3>
              <p className="slp-body">{BUILT_FOR.panel.body}</p>
              <div>
                <Button href="/products" variant="ghost">
                  {BUILT_FOR.panel.cta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="slp-section slp-on-blue slp-trusted">
        <div className="slp-inner">
          <h2 className="slp-h2 slp-fade">{TRUSTED.heading}</h2>
          <p className="slp-body slp-fade" data-delay="90">
            {TRUSTED.body}
          </p>
          <div className="slp-logo-band slp-fade" data-delay="150">
            {[
              "Northgate",
              "Meridian",
              "Helvetic",
              "Kestrel",
              "Sable",
              "Orbis",
              "Vantage",
              "Lumen",
            ].map((name) => (
              <div key={name} className="slp-logo-cell">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#151515" seed={1} />

      <section className="slp-section slp-on-black">
        <div className="slp-inner">
          <div className="slp-products-head">
            <div>
              <p className="slp-eyebrow slp-fade">Product suite</p>
              <h2
                className="slp-h2 slp-fade"
                data-delay="80"
                style={{ marginTop: "1rem" }}
              >
                Seven modules,
                <br />
                one settlement layer
              </h2>
            </div>
            <p className="slp-body slp-fade" data-delay="140">
              Deploy the whole suite or the single module that closes the gap
              you have. Drag to browse.
            </p>
          </div>
          <ProductsCarousel />
        </div>
      </section>

      <section className="slp-section slp-on-blue">
        <StaircaseFlow
          headingRef={cuttingEdgeHeadingRef}
          stretch={6}
          pad={1200}
          motionDelay={0.15}
          pulseEdge={0.25}
          direction={1}
          variant="rise"
        />
        <StaircaseFlow
          headingRef={cuttingEdgeHeadingRef}
          stretch={6}
          pad={1200}
          motionDelay={0.15}
          pulseEdge={0.25}
          direction={-1}
          variant="fall"
        />
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Capabilities</p>
          <h2
            ref={cuttingEdgeHeadingRef}
            className="slp-h2 slp-fade"
            data-delay="80"
            style={{ marginTop: "1rem" }}
          >
            {CUTTING_EDGE.heading}
          </h2>
          <div className="slp-capabilities">
            {CAPABILITIES.map((cap, i) => (
              <div
                key={cap.title}
                className="slp-capability slp-fade"
                data-delay={i * 80}
              >
                <div>
                  <span className="slp-capability-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="slp-h3" style={{ marginTop: ".6rem" }}>
                    {cap.title}
                  </h3>
                </div>
                <p className="slp-body">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#ffffff" seed={2} />

      <section className="slp-section slp-on-white">
        <div className="slp-inner">
          <div className="slp-products-head">
            <h2 className="slp-h2 slp-fade">Newsroom</h2>
            <Button href="/newsroom" variant="ghost">
              All updates
            </Button>
          </div>
          <div className="slp-news-grid">
            {NEWSROOM.slice(0, 3).map((item, i) => (
              <button
                key={item.title}
                type="button"
                className="slp-news-card slp-fade"
                data-delay={i * 90}
              >
                <div className="slp-news-meta">
                  <span>{item.category}</span>
                  <span>{item.date}</span>
                </div>
                <h3>{item.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

/* ---------------------------------------------------------------- products */

/**
 * Pinned horizontal product scroller.
 *
 * Measured off the reference: every card sits at a fixed vertical position and
 * the whole track translates horizontally as the page scrolls, at 0.87px of
 * travel per 1px of scroll, with cards spaced 453.57px apart. The section is
 * made tall enough to supply that travel, and the viewport inside it is sticky
 * so the cards hold their vertical position while the track slides.
 */
const CARD_PITCH = 453.57;
const SCROLL_RATIO = 0.87;

function ProductScroller() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();

  const travel = CARD_PITCH * PRODUCTS.length;
  // Scroll distance required to deliver that travel at the measured ratio.
  const scrollLength = travel / SCROLL_RATIO;

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let raf = 0;
    const frame = () => {
      const rect = section.getBoundingClientRect();
      // Progress through the section's scrollable run.
      const run = rect.height - window.innerHeight;
      const passed = clamp01(run > 0 ? -rect.top / run : 0);
      track.style.transform = `translate3d(${(-passed * travel).toFixed(2)}px,0,0)`;
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [travel]);

  return (
    <section
      ref={sectionRef}
      className="slp-scroller slp-on-black"
      style={{ height: `calc(100svh + ${Math.round(scrollLength)}px)` }}
    >
      <div className="slp-scroller-pin">
        <div className="slp-inner">
          <h1 className="slp-h1 slp-fade">The Institutional Stack</h1>
        </div>
        <div className="slp-scroller-viewport">
          <div ref={trackRef} className="slp-scroller-track">
            {PRODUCTS.map((product, i) => (
              <button
                key={product.slug}
                type="button"
                className="slp-stack-card"
                style={
                  {
                    "--slp-card-rot": `${i % 2 === 0 ? -1.2 : 1.6}deg`,
                    "--slp-card-drop": `${i % 2 === 0 ? 0 : 64}px`,
                  } as React.CSSProperties
                }
                onClick={() => navigate(`/products/${product.slug}`)}
              >
                <span className="slp-stack-media">
                  <CircuitPlate seed={i} />
                  <span className="slp-stack-tag">{product.kicker}</span>
                  <span className="slp-stack-arrow">
                    <ArrowIcon />
                  </span>
                </span>
                <span className="slp-stack-body">
                  <span className="slp-stack-title">{product.name}</span>
                  <span className="slp-stack-desc">{product.summary}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductsPage() {
  const ref = useRef<HTMLDivElement>(null);
  useFadeIn(ref);

  return (
    <div ref={ref}>
      <ProductScroller />

      <PixelTransition from="#151515" to="#044ab3" seed={3} />

      <section className="slp-section slp-on-blue">
        <div className="slp-inner slp-split">
          <h2 className="slp-h2 slp-fade">
            Built for real-world financial systems
          </h2>
          <p className="slp-body slp-fade" data-delay="100">
            Every module is deployed inside an existing control framework rather
            than replacing it. That is the difference between a pilot and a
            production system.
          </p>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

function ProductDetailPage({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const product = PRODUCTS.find((p) => p.slug === slug) ?? PRODUCTS[0];
  useFadeIn(ref, [slug]);

  return (
    <div ref={ref} key={slug}>
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">{product.kicker}</p>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            {product.name}
          </h1>
          <p
            className="slp-body slp-fade"
            data-delay="150"
            style={{ marginTop: "1.5rem" }}
          >
            {product.tagline}
          </p>
        </div>
      </section>

      <section className="slp-section slp-on-blue" style={{ paddingTop: 0 }}>
        <div className="slp-inner slp-split">
          <h2 className="slp-h2 slp-fade">Operational model</h2>
          <div>
            <p className="slp-body slp-fade">{product.summary}</p>
            <div style={{ marginTop: "2.5rem" }}>
              {product.operational.map((item, i) => (
                <div
                  key={item.title}
                  className="slp-capability slp-fade"
                  data-delay={i * 80}
                >
                  <h3 className="slp-h3">{item.title}</h3>
                  <p className="slp-body">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#ffffff" seed={4} />

      <section className="slp-section slp-on-white">
        <div className="slp-inner">
          <h2 className="slp-h2 slp-fade">Properties</h2>
          <div className="slp-card-grid">
            {product.properties.map((prop, i) => (
              <div
                key={prop.label}
                className="slp-card slp-fade"
                data-delay={i * 70}
              >
                <span className="slp-eyebrow">{prop.label}</span>
                <p className="slp-h3">{prop.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

/* ----------------------------------------------------------------- company */

function CompanyPage() {
  const ref = useRef<HTMLDivElement>(null);
  useFadeIn(ref);

  return (
    <div ref={ref}>
      {/* Wordmark left, statement right, cascading sheets behind both. */}
      <section className="slp-company-hero slp-on-blue">
        <RoundedCascade steps={3} />
        <div className="slp-inner slp-company-grid">
          <h1 className="slp-company-mark slp-fade">BLANK</h1>
          <p className="slp-company-statement slp-fade" data-delay="120">
            {COMPANY.heading}
          </p>
        </div>
      </section>

      {/* The narrow column sits inside the bay the cascade opens up. */}
      <section className="slp-section slp-on-blue slp-company-built">
        <div className="slp-inner">
          <div className="slp-company-column slp-fade">
            <h2 className="slp-h2">What BLANK is built on</h2>
            <div className="slp-company-copy">
              <p>{COMPANY.body}</p>
              <p>
                The team combines distributed systems depth with a working
                knowledge of how regulated institutions actually operate, which
                is what keeps the product configurable instead of prescriptive.
              </p>
            </div>
          </div>
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#151515" seed={5} />

      <section className="slp-section slp-on-black">
        <div className="slp-inner">
          <h2 className="slp-h2 slp-fade">How we work</h2>
          <div className="slp-card-grid">
            {COMPANY.cards.map((card, i) => (
              <div
                key={card.title}
                className="slp-card slp-fade"
                data-delay={i * 80}
              >
                <span className="slp-capability-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="slp-h3">{card.title}</h3>
                <p className="slp-body">{card.body}</p>
              </div>
            ))}
          </div>
          <div className="slp-stat-row">
            {COMPANY.stats.map((stat, i) => (
              <div key={stat.label} className="slp-fade" data-delay={i * 70}>
                <div className="slp-stat-value">{stat.value}</div>
                <div className="slp-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

/* ---------------------------------------------------------------- partners */

const PARTNER_PATTERN = [
  { col: 1, row: 2 },
  { col: 2, row: 2 },
  { col: 3, row: 1 },
  { col: 4, row: 2 },
  { col: 5, row: 2 },
  { col: 6, row: 2 },
  { col: 3, row: 3 },
  { col: 5, row: 3 },
];

function PartnersPage() {
  const ref = useRef<HTMLDivElement>(null);
  useFadeIn(ref);
  const names = [
    "Northgate",
    "Meridian",
    "Helvetic",
    "Kestrel",
    "Sable",
    "Orbis",
    "Vantage",
    "Lumen",
  ];

  return (
    <div ref={ref}>
      {/* Mesh bands top and bottom, heading top-left, copy and CTA sitting low
          and right of centre with the middle left deliberately empty. */}
      <section className="slp-partners-hero slp-on-blue">
        <MeshBands />
        <div className="slp-inner slp-partners-hero-inner">
          <h1 className="slp-h1 slp-fade">
            BLANK&rsquo;s
            <br />
            Industry Partners
          </h1>
          <div className="slp-partners-lede slp-fade" data-delay="140">
            <p>{PARTNERS.body}</p>
            <div style={{ marginTop: "1.6rem" }}>
              <Button href="/contact">Partner with us</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="slp-section slp-on-blue">
        <div className="slp-inner">
          <div className="slp-partner-grid slp-fade">
            {names.map((name, i) => (
              <div
                key={name}
                className="slp-partner-cell"
                style={{
                  gridColumn: PARTNER_PATTERN[i]?.col,
                  gridRow: PARTNER_PATTERN[i]?.row,
                }}
              >
                {name}
              </div>
            ))}
          </div>

          <TestimonialCarousel items={PARTNERS.testimonials} />
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#ffffff" seed={6} />

      <section className="slp-section slp-on-white">
        <div className="slp-inner">
          <h2 className="slp-h2 slp-fade">Partner programme</h2>
          <div className="slp-card-grid">
            {PARTNERS.categories.map((cat, i) => (
              <div
                key={cat.title}
                className="slp-card slp-fade"
                data-delay={i * 80}
              >
                <h3 className="slp-h3">{cat.title}</h3>
                <p className="slp-body">{cat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

/* ------------------------------------------------------------------ career */

function CareerPage() {
  const ref = useRef<HTMLDivElement>(null);
  useFadeIn(ref);

  return (
    <div ref={ref}>
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Careers</p>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            {CAREER.heading}
          </h1>
          <p
            className="slp-body slp-fade"
            data-delay="150"
            style={{ marginTop: "1.5rem" }}
          >
            {CAREER.body}
          </p>

          <p className="slp-eyebrow slp-fade" style={{ marginTop: "4rem" }}>
            {ROLES.length} open positions
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            {ROLES.map((role, i) => (
              <div
                key={role.title}
                className="slp-role slp-fade"
                data-delay={i * 60}
              >
                <span className="slp-role-title">{role.title}</span>
                <span className="slp-role-meta">{role.team}</span>
                <span className="slp-role-meta" data-hide-sm="true">
                  {role.location}
                </span>
                <ArrowIcon />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

/* ----------------------------------------------------------------- contact */

function ContactPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [sent, setSent] = useState(false);
  useFadeIn(ref);

  return (
    <div ref={ref}>
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner slp-split">
          <div>
            <p className="slp-eyebrow slp-fade">Contact</p>
            <h1
              className="slp-h1 slp-fade"
              data-delay="90"
              style={{ marginTop: "1.2rem" }}
            >
              {CONTACT.heading}
            </h1>
            <p
              className="slp-body slp-fade"
              data-delay="150"
              style={{ marginTop: "1.5rem" }}
            >
              {CONTACT.body}
            </p>
            <div
              className="slp-stat-row"
              style={{ gridTemplateColumns: "repeat(3,1fr)" }}
            >
              {CONTACT.offices.map((office, i) => (
                <div
                  key={office.city}
                  className="slp-fade"
                  data-delay={200 + i * 70}
                >
                  <div className="slp-h3">{office.city}</div>
                  <div className="slp-stat-label">{office.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <form
            className="slp-form slp-fade"
            data-delay="180"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="slp-field">
              <label htmlFor="slp-name">Name</label>
              <input id="slp-name" name="name" required />
            </div>
            <div className="slp-field">
              <label htmlFor="slp-email">Work email</label>
              <input id="slp-email" name="email" type="email" required />
            </div>
            <div className="slp-field">
              <label htmlFor="slp-org">Institution</label>
              <input id="slp-org" name="organisation" />
            </div>
            <PhoneField />
            <div className="slp-field">
              <label htmlFor="slp-msg">What are you settling?</label>
              <textarea id="slp-msg" name="message" />
            </div>
            <div>
              <button type="submit" className="slp-btn slp-btn-solid">
                <Reveal>{sent ? "Received" : "Send"}</Reveal>
                <ArrowIcon />
              </button>
            </div>
            <p className="slp-form-note">
              {sent
                ? "Thanks. This demo form does not submit anywhere."
                : "We reply within two working days."}
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ---------------------------------------------------------------- newsroom */

function NewsroomPage() {
  const ref = useRef<HTMLDivElement>(null);
  useFadeIn(ref);

  return (
    <div ref={ref}>
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Newsroom</p>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            Product and network updates
          </h1>
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#ffffff" seed={7} />

      <section className="slp-section slp-on-white">
        <div className="slp-inner">
          <div className="slp-news-grid">
            {NEWSROOM.map((item, i) => (
              <button
                key={item.title}
                type="button"
                className="slp-news-card slp-fade"
                data-delay={(i % 3) * 90}
              >
                <div className="slp-news-meta">
                  <span>{item.category}</span>
                  <span>{item.date}</span>
                </div>
                <h3>{item.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

/* -------------------------------------------------------------------- blog */

function BlogIndexPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  useFadeIn(ref);

  return (
    <div ref={ref}>
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Blog</p>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            Writing from the team
          </h1>
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#ffffff" seed={8} />

      <section className="slp-section slp-on-white">
        <div className="slp-inner">
          <div className="slp-article-list">
            {ARTICLES.map((article, i) => (
              <button
                key={article.slug}
                type="button"
                className="slp-article-row slp-fade"
                data-delay={i * 80}
                onClick={() => navigate(`/blog/${article.slug}`)}
              >
                <span className="slp-role-meta">{article.date}</span>
                <span style={{ textAlign: "left" }}>
                  <span className="slp-h3">{article.title}</span>
                  <span
                    className="slp-body"
                    style={{ display: "block", marginTop: ".5rem" }}
                  >
                    {article.excerpt}
                  </span>
                </span>
                <ArrowIcon />
              </button>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

function BlogPostPage({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const article = ARTICLES.find((a) => a.slug === slug) ?? ARTICLES[0];
  const scroller = useScroller();
  const { copied, copy } = useCopyLink();
  useFadeIn(ref, [slug]);

  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    const target: HTMLElement | Window = scroller ?? window;
    const onScroll = () => {
      const [pos, max] = scroller
        ? [scroller.scrollTop, scroller.scrollHeight - scroller.clientHeight]
        : [
            window.scrollY,
            document.documentElement.scrollHeight - window.innerHeight,
          ];
      bar.style.width = `${max > 0 ? clamp01(pos / max) * 100 : 0}%`;
    };
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [scroller]);

  return (
    <div ref={ref} key={slug}>
      <div ref={progressRef} className="slp-progress" />

      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <div className="slp-article-meta slp-fade">
            <span>{article.category}</span>
            <span>{article.date}</span>
            <span>{article.readingTime}</span>
            <button type="button" className="slp-copy-link" onClick={copy}>
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            {article.title}
          </h1>
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#ffffff" seed={9} />

      <section className="slp-section slp-on-white">
        <div className="slp-inner">
          <div className="slp-prose">
            {article.body.map((para, i) => (
              <p
                key={para.slice(0, 32)}
                className="slp-fade"
                data-delay={i * 60}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}

/* ------------------------------------------------------------------- legal */

function LegalPage({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const doc = LEGAL_DOCS.find((d) => d.slug === slug) ?? LEGAL_DOCS[0];
  useFadeIn(ref, [slug]);

  return (
    <div ref={ref} key={slug}>
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Updated {doc.updated}</p>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            {doc.title}
          </h1>
        </div>
      </section>

      <section className="slp-section slp-on-blue" style={{ paddingTop: 0 }}>
        <div className="slp-inner slp-prose">
          {doc.sections.map((section, i) => (
            <div key={section.heading} className="slp-fade" data-delay={i * 70}>
              <h2 className="slp-h3" style={{ marginBottom: ".8rem" }}>
                {section.heading}
              </h2>
              {section.body.map((para) => (
                <p key={para.slice(0, 32)}>{para}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------- root */

function NotFoundPage() {
  return (
    <div>
      <section
        className="slp-page-hero slp-on-blue"
        style={{ minHeight: "70svh" }}
      >
        <div className="slp-inner">
          <p className="slp-eyebrow">404</p>
          <h1 className="slp-h1" style={{ marginTop: "1.2rem" }}>
            That page does not exist
          </h1>
          <div style={{ marginTop: "2rem" }}>
            <Button href="/">Back to home</Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function renderRoute(path: string): ReactNode {
  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  const parts = clean.split("/").filter(Boolean);

  if (clean === "/") return <HomePage />;
  if (parts[0] === "products") {
    return parts[1] ? <ProductDetailPage slug={parts[1]} /> : <ProductsPage />;
  }
  if (parts[0] === "blog") {
    return parts[1] ? <BlogPostPage slug={parts[1]} /> : <BlogIndexPage />;
  }
  if (parts[0] === "legal" && parts[1]) return <LegalPage slug={parts[1]} />;
  if (clean === "/company") return <CompanyPage />;
  if (clean === "/partners") return <PartnersPage />;
  if (clean === "/career") return <CareerPage />;
  if (clean === "/contact") return <ContactPage />;
  if (clean === "/newsroom") return <NewsroomPage />;
  return <NotFoundPage />;
}

/** Pages that render their own Footer rather than the shared CTA + Footer pair. */
const SELF_FOOTED = new Set(["/contact"]);

export type SettlementLayerPageProps = {
  /** Route to render on mount. Defaults to the home page. */
  initialPath?: string;
};

export default function SettlementLayerPage({
  initialPath = "/",
}: SettlementLayerPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState(initialPath);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPath(initialPath);
  }, [initialPath]);

  const handleScroller = useCallback((el: HTMLElement | null) => {
    setScroller(el);
  }, []);

  useSmoothScroll(rootRef, handleScroller);

  const navigate = useCallback(
    (next: string) => {
      setPath(next);
      if (typeof window === "undefined") return;
      // Reset whichever element actually scrolls, then let ScrollTrigger
      // remeasure against the newly mounted route.
      if (scroller) scroller.scrollTop = 0;
      else window.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    [scroller],
  );

  const router = useMemo<RouterValue>(
    () => ({ path, navigate }),
    [path, navigate],
  );

  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  const showFooter = !SELF_FOOTED.has(clean) && !clean.startsWith("/legal");

  return (
    <RouterContext.Provider value={router}>
      <ScrollerContext.Provider value={scroller}>
        <div ref={rootRef} className="settlement-layer-page">
          <style
            // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet
            dangerouslySetInnerHTML={{ __html: getSettlementLayerPageStyles() }}
          />
          <Header />
          <div className="slp-shell" key={clean}>
            {renderRoute(path)}
            {showFooter ? <Footer /> : null}
          </div>
        </div>
      </ScrollerContext.Provider>
    </RouterContext.Provider>
  );
}

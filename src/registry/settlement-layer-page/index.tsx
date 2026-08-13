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
 * A ring of dots on the perimeter, each tied to a single focal point by a bowed
 * curve. The bow is what makes it read as a vortex rather than a starburst: the
 * control point of every curve is pushed tangentially in one rotational
 * direction, so the whole field appears to wind inward. The focal point drifts
 * slowly across the horizontal, which drags the convergence with it.
 *
 * Measured geometry: ring radius is 0.30 of the smaller stage axis, ~118 dots,
 * lines at low alpha so density rather than weight carries the form.
 */
const FIELD_DOTS = 118;
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

    // Pointer influence. `target` is where the cursor is, `pull` eases toward
    // it so the convergence trails the cursor instead of snapping to it, and
    // decays back to the idle drift once the pointer leaves.
    let targetX = 0;
    let targetY = 0;
    let pullX = 0;
    let pullY = 0;
    let engaged = 0;
    let engagedTarget = 0;

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

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.3;

      // The focal point drifts horizontally and barely at all vertically.
      const drift = reduced ? 0 : Math.sin(t / 4200) * radius * 0.06;

      // Ease the pull toward the cursor and the engagement toward its target,
      // so entering and leaving the hero are both smooth rather than stepped.
      pullX += (targetX - pullX) * 0.06;
      pullY += (targetY - pullY) * 0.06;
      engaged += (engagedTarget - engaged) * 0.05;

      const fx = cx + drift + (reduced ? 0 : pullX * engaged * 0.55);
      const fy =
        cy +
        (reduced ? 0 : Math.sin(t / 6100) * radius * 0.015) +
        (reduced ? 0 : pullY * engaged * 0.55);

      ctx.lineWidth = 1;
      for (let i = 0; i < FIELD_DOTS; i++) {
        const a = (i / FIELD_DOTS) * Math.PI * 2;
        const px = cx + Math.cos(a) * radius;
        const py = cy + Math.sin(a) * radius;

        // Control point sits mid-chord, pushed along the tangent so the curve
        // bows. One sign for every spoke is what creates the winding.
        const mx = (px + fx) / 2;
        const my = (py + fy) / 2;
        const bow = radius * 0.34;
        const qx = mx + Math.cos(a + Math.PI / 2) * bow;
        const qy = my + Math.sin(a + Math.PI / 2) * bow;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(qx, qy, fx, fy);
        ctx.strokeStyle = `rgba(255,255,255,${0.13 + (i % 5) * 0.018})`;
        ctx.stroke();
      }

      // Perimeter dots sit on top of the curve ends.
      for (let i = 0; i < FIELD_DOTS; i++) {
        const a = (i / FIELD_DOTS) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(a) * radius,
          cy + Math.sin(a) * radius,
          1.5,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = "rgba(255,255,255,.82)";
        ctx.fill();
      }

      // A small hot core where everything meets.
      const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, radius * 0.09);
      glow.addColorStop(0, "rgba(255,255,255,.55)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(fx, fy, radius * 0.09, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '11px "Fragment Mono", ui-monospace, monospace';
      ctx.fillStyle = "rgba(255,255,255,.66)";
      for (const label of FIELD_LABELS) {
        const lr = radius * 1.14;
        const lx = cx + Math.cos(label.angle) * lr;
        const ly = cy + Math.sin(label.angle) * lr;
        ctx.textAlign = Math.cos(label.angle) < 0 ? "right" : "left";
        ctx.fillText(label.text, lx, ly);
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

    // Track the pointer against the hero, not the canvas, so the field keeps
    // responding while the cursor is over the headline and button too.
    const stage = canvas.parentElement;
    const onPointerMove = (e: PointerEvent) => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      targetX = e.clientX - (rect.left + rect.width / 2);
      targetY = e.clientY - (rect.top + rect.height / 2);
      engagedTarget = 1;
    };
    const onPointerLeave = () => {
      engagedTarget = 0;
      targetX = 0;
      targetY = 0;
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
  }, []);

  return <canvas ref={canvasRef} className="slp-hero-field" />;
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
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">{BUILT_FOR.eyebrow}</p>
          <h2
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
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Capabilities</p>
          <h2
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

function ProductsPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { navigate } = useRouter();
  useFadeIn(ref);

  return (
    <div ref={ref}>
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Products</p>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            The settlement suite
          </h1>
          <p
            className="slp-body slp-fade"
            data-delay="150"
            style={{ marginTop: "1.5rem" }}
          >
            Seven modules that share one ledger, one policy model and one audit
            trail. Take the whole suite or the single piece that closes your
            gap.
          </p>
        </div>
      </section>

      <section className="slp-section slp-on-blue" style={{ paddingTop: 0 }}>
        <div className="slp-inner">
          {PRODUCTS.map((product, i) => (
            <button
              key={product.slug}
              type="button"
              className="slp-capability slp-fade"
              data-delay={i * 60}
              onClick={() => navigate(`/products/${product.slug}`)}
              style={{ width: "100%", textAlign: "left" }}
            >
              <div>
                <span className="slp-capability-index">{product.kicker}</span>
                <h3 className="slp-h3" style={{ marginTop: ".6rem" }}>
                  {product.name}
                </h3>
              </div>
              <p className="slp-body">{product.tagline}</p>
            </button>
          ))}
        </div>
      </section>

      <PixelTransition from="#044ab3" to="#151515" seed={3} />

      <section className="slp-section slp-on-black">
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
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Company</p>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            {COMPANY.heading}
          </h1>
          <p
            className="slp-body slp-fade"
            data-delay="150"
            style={{ marginTop: "1.5rem" }}
          >
            {COMPANY.body}
          </p>
          <div className="slp-stat-row">
            {COMPANY.stats.map((stat, i) => (
              <div
                key={stat.label}
                className="slp-fade"
                data-delay={180 + i * 70}
              >
                <div className="slp-stat-value">{stat.value}</div>
                <div className="slp-stat-label">{stat.label}</div>
              </div>
            ))}
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
      <section className="slp-page-hero slp-on-blue">
        <div className="slp-inner">
          <p className="slp-eyebrow slp-fade">Partners</p>
          <h1
            className="slp-h1 slp-fade"
            data-delay="90"
            style={{ marginTop: "1.2rem" }}
          >
            {PARTNERS.heading}
          </h1>
          <p
            className="slp-body slp-fade"
            data-delay="150"
            style={{ marginTop: "1.5rem" }}
          >
            {PARTNERS.body}
          </p>

          <div className="slp-partner-grid slp-fade" data-delay="220">
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

          <blockquote className="slp-quote slp-fade">
            {PARTNERS.quote.text}
            <div className="slp-quote-attr">{PARTNERS.quote.attribution}</div>
          </blockquote>
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

"use client";

/**
 * monogram-morph-page
 *
 * A fixed-layout portfolio home built around a single idea: the wordmark is
 * liquid. It is drawn as HTML text pushed through an SVG goo filter (blur, then
 * a steep alpha threshold), so when the letters crowd together they fuse into
 * one blob and when they spread apart the blob tears into droplets that snap
 * back into glyphs. That one effect does both jobs the page needs:
 *
 *   - on load, a monogram melts and spreads into the full wordmark;
 *   - on navigation, the current word melts and resolves into the next one.
 *
 * Around it, every piece of running text is pre-split into characters and faded
 * on a bounce curve with a randomised stagger, so text does not fade, it
 * flickers out and stutters back in. See `bounce-ease.ts` for why that curve is
 * baked rather than generated at runtime.
 *
 * Nothing here scrolls and nothing here is fetched. The whole page is one
 * viewport, and the only moving parts are the morph, the character staggers,
 * the nav pill fill, and the draggable tags.
 */

import gsap from "gsap";
import * as React from "react";
import { bounceEase } from "./bounce-ease";
import { getMonogramMorphPageStyles } from "./styles";

/* ------------------------------------------------------------------ timing */

/** Length of one word-to-word morph, matching the source's transition clips. */
const MORPH_DURATION = 1.173;
/** Beat the loader holds on the monogram before it melts. */
const LOADER_HOLD = 1;

/**
 * Blur radii, as fractions of the rendered font size rather than as pixels, so
 * the goo holds its proportions at any container width.
 *
 * The resting value is not zero, and that matters: the mark is liquid even when
 * it is standing still. A small blur under the threshold rounds every corner
 * and lets adjacent letters fuse at their joins, which is what stops the word
 * reading as ordinary text with a stroke on it between transitions.
 */
const HALO_REST_BLUR = 0.038;
const HALO_PEAK_BLUR = 0.132;
/** The letterforms blur lower throughout, so they stay legible inside it. */
const INK_REST_BLUR = 0.009;
const INK_PEAK_BLUR = 0.04;

/** Widest the mark is allowed to run, as a fraction of the container. */
const MARK_WIDTH_LIMIT = 0.86;

/* The mark's two colours. They live here rather than only in the stylesheet
   because the goo filter has to flood with the exact same values; splitting
   them across CSS and SVG is how they drift apart. */
const MARK_COLOR = "#f0ff42";
const INK_COLOR = "#cadb00";

/**
 * How much of its resting offset a glyph keeps at full melt.
 *
 * Not zero: piling every letter onto the exact centre gives a tidy rounded
 * lozenge, where the reference collapses to a lumpy horizontal bar. Holding a
 * fifth of the spread means a short word still balls up while a long one stays
 * a bar, which is the difference between the two source clips.
 */
const COLLAPSE_RESIDUAL = 0.22;

/** Vertical scatter at full melt, as a fraction of the mark's size. */
const COLLAPSE_WOBBLE = 0.055;

/**
 * Deterministic 0-to-1 value per glyph index, used to stagger when each letter
 * leaves and arrives. Without it every glyph travels in lockstep and the word
 * collapses as one solid slab; with it the outer letters lag behind the mass
 * and tear off as droplets before catching up.
 */
function glyphPhase(index: number) {
  return ((index * 9301 + 49297) % 233280) / 233280;
}

/* -------------------------------------------------------------------- data */

export interface MonogramMorphRoute {
  /** Stable id used for the active state and as the React key. */
  id: string;
  /** Label shown in the bottom nav pill. */
  label: string;
  /** Word the goo layer resolves to while this route is active. */
  word: string;
}

export interface MonogramMorphTag {
  id: string;
  label: string;
}

export interface MonogramMorphEntry {
  id: string;
  title: string;
  kind: string;
  year: string;
}

export interface MonogramMorphLink {
  label: string;
  href: string;
}

const DEFAULT_ROUTES: MonogramMorphRoute[] = [
  { id: "home", label: "Home", word: "Blank" },
  { id: "projects", label: "Projects", word: "Projects" },
  { id: "archive", label: "Archive", word: "Archive" },
];

const DEFAULT_TAGS: MonogramMorphTag[] = [
  { id: "typography", label: "Typography" },
  { id: "motion", label: "Motion" },
  { id: "systems", label: "Systems" },
  { id: "webgl", label: "WebGL" },
  { id: "sound", label: "Sound" },
];

const DEFAULT_PROJECTS: MonogramMorphEntry[] = [
  { id: "registry", title: "Registry", kind: "Component system", year: "2026" },
  {
    id: "effect-viz",
    title: "Effect visualizations",
    kind: "Interaction study",
    year: "2026",
  },
  { id: "dither", title: "Dither studio", kind: "WebGL tool", year: "2025" },
  {
    id: "wall",
    title: "Inspiration wall",
    kind: "Search interface",
    year: "2025",
  },
  {
    id: "type-morph",
    title: "Type morph",
    kind: "Motion vocabulary",
    year: "2025",
  },
];

const DEFAULT_ARCHIVE: MonogramMorphEntry[] = [
  { id: "goo", title: "Goo wordmark", kind: "Filter study", year: "2026" },
  { id: "bounce", title: "Bounce ease", kind: "Timing curve", year: "2026" },
  {
    id: "stagger",
    title: "Split stagger",
    kind: "Text transition",
    year: "2025",
  },
  {
    id: "odometer",
    title: "Odometer cell",
    kind: "Numeric readout",
    year: "2025",
  },
  {
    id: "finalizer",
    title: "Finalizer stack",
    kind: "Scope diagram",
    year: "2024",
  },
];

const DEFAULT_PRACTICE = [
  "Interface design",
  "Motion systems",
  "Design engineering",
  "Brand identity",
  "Prototyping",
];

const DEFAULT_PRIMARY_LINKS: MonogramMorphLink[] = [
  { label: "BE", href: "#" },
  { label: "DRI", href: "#" },
  { label: "Linkedin", href: "#" },
];

const DEFAULT_SECONDARY_LINKS: MonogramMorphLink[] = [
  { label: "IG", href: "#" },
  { label: "FB", href: "#" },
];

/* ----------------------------------------------------------------- helpers */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth 0-to-1 ramp between two progress marks. */
function ramp(value: number, from: number, to: number) {
  const t = clamp01((value - from) / (to - from));
  return t * t * (3 - 2 * t);
}

/**
 * Melt amount across a morph. A scaled sine clamps into a plateau, so the word
 * stays fully liquid through the middle of the transition rather than only at
 * its exact midpoint. That plateau is what gives the droplets time to travel.
 */
function meltAt(progress: number) {
  return Math.min(1, Math.sin(Math.PI * clamp01(progress)) * 1.45);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let splitSeq = 0;

/**
 * Pre-splits text into per-character spans at render time.
 *
 * The source runs GSAP SplitText on mount and re-splits after every route
 * change. In React the same result falls out of the markup, which also keeps
 * the character nodes stable across renders so GSAP never ends up animating a
 * node a re-render has already thrown away.
 */
function SplitText({ text }: { text: string }) {
  const words = React.useMemo(() => text.split(/(\s+)/), [text]);
  const seq = React.useMemo(() => {
    splitSeq += 1;
    return splitSeq;
  }, []);

  return (
    <>
      {words.map((word, wordIndex) => (
        <span className="mmp-word" key={`${seq}-w-${wordIndex}`}>
          {Array.from(word).map((char, charIndex) => (
            <span
              className="mmp-char"
              key={`${seq}-c-${wordIndex}-${charIndex}`}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </>
  );
}

/**
 * One word of the mark, split so each glyph can be moved on its own.
 *
 * Keyed by index and character: React then reuses a glyph node whenever the
 * character at that position is unchanged, which is what lets a morph start
 * from wherever the previous one left the mark.
 */
function MorphWord({ slot, text }: { slot: "from" | "to"; text: string }) {
  return (
    <div className="mmp-morph-word" data-slot={slot}>
      {Array.from(text).map((char, index) => (
        <span
          className="mmp-morph-glyph"
          key={`${slot}-${index}-${char}`}
          data-index={index}
        >
          {char}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- props */

export interface MonogramMorphPageProps {
  /** Mark the loader melts from. Keep it short: it has to read as one blob. */
  monogram?: string;
  /** Colour of the smear the letterforms sit inside. */
  markColor?: string;
  /** Colour of the letterforms themselves. */
  inkColor?: string;
  /** Routes across the bottom nav. The first one is the landing route. */
  routes?: MonogramMorphRoute[];
  /** Route id to open on. Defaults to the first route. */
  initialRoute?: string;
  /** Coordinates printed above the nav, in the mono face. */
  coordinates?: string;
  /** IANA timezone the clock reads in. Defaults to the visitor's. */
  timeZone?: string;
  /** Label above the left-hand list. */
  practiceLabel?: string;
  /** Left-hand list items. */
  practice?: string[];
  /** Italic label above the centre column. */
  aboutLabel?: string;
  /** Centre column copy. */
  about?: string;
  /** Italic label above the right column. */
  contactLabel?: string;
  /** Right column lines, printed above the mail link. */
  contact?: string[];
  /** Email the contact block links to. */
  email?: string;
  /** Draggable tags scattered over the wordmark on the landing route. */
  tags?: MonogramMorphTag[];
  /** Rows listed on the second route. */
  projects?: MonogramMorphEntry[];
  /** Rows listed on the third route. */
  archive?: MonogramMorphEntry[];
  /** Links in the left-hand nav cluster. */
  primaryLinks?: MonogramMorphLink[];
  /** Links in the right-hand nav cluster. */
  secondaryLinks?: MonogramMorphLink[];
  /** Seconds the loader holds the monogram before melting. */
  loaderHold?: number;
  /** Skip the loader and open on the resolved wordmark. */
  skipLoader?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* --------------------------------------------------------------- component */

export default function MonogramMorphPage({
  monogram = "B",
  markColor = MARK_COLOR,
  inkColor = INK_COLOR,
  routes = DEFAULT_ROUTES,
  initialRoute,
  coordinates = "51.5072°N 0.1276°W",
  timeZone,
  practiceLabel = "Practice:",
  practice = DEFAULT_PRACTICE,
  aboutLabel = "About",
  about = "BLANK is a design and engineering practice building interface systems, motion vocabularies, and the components that carry them.",
  contactLabel = "Contact",
  contact = ["London, United Kingdom", "Available for new work"],
  email = "hello@ui.aryank.space",
  tags = DEFAULT_TAGS,
  projects = DEFAULT_PROJECTS,
  archive = DEFAULT_ARCHIVE,
  primaryLinks = DEFAULT_PRIMARY_LINKS,
  secondaryLinks = DEFAULT_SECONDARY_LINKS,
  loaderHold = LOADER_HOLD,
  skipLoader = false,
  className,
  style,
}: MonogramMorphPageProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const haloBlurRef = React.useRef<SVGFEGaussianBlurElement | null>(null);
  const inkBlurRef = React.useRef<SVGFEGaussianBlurElement | null>(null);
  const tagLayerRef = React.useRef<HTMLDivElement | null>(null);

  const filterId = React.useId().replace(/:/g, "");

  const safeRoutes = routes.length > 0 ? routes : DEFAULT_ROUTES;
  const [routeId, setRouteId] = React.useState(
    () => initialRoute ?? safeRoutes[0].id,
  );
  const activeRoute =
    safeRoutes.find((route) => route.id === routeId) ?? safeRoutes[0];

  // Both goo slots are always mounted; a morph only swaps what they hold and
  // drives progress from 0 (slot "from" visible) to 1 (slot "to" visible).
  const [morphWords, setMorphWords] = React.useState(() => ({
    from: skipLoader ? activeRoute.word : monogram,
    to: activeRoute.word,
  }));
  const [booted, setBooted] = React.useState(skipLoader);
  const busyRef = React.useRef(false);

  /* -------------------------------------------------------- morph plumbing */

  /**
   * Rendered font size of the mark, in px. Blur radii are expressed against it
   * so the goo scales with the type instead of with the pixel grid.
   */
  const markSizeRef = React.useRef(200);

  /**
   * Every glyph in both slots, with how far it sits from the centre of its own
   * word and its stagger phase. Measured from layout position (`offsetLeft`),
   * which transforms do not disturb, so this stays correct mid-morph.
   */
  const glyphsRef = React.useRef<
    { el: HTMLElement; offset: number; phase: number; incoming: boolean }[]
  >([]);

  const measureMark = React.useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const words = Array.from(
      stage.querySelectorAll<HTMLElement>(".mmp-morph-word"),
    );
    if (words.length === 0) return;

    const size = Number.parseFloat(getComputedStyle(words[0]).fontSize);

    // Word lengths differ per route, so a fixed size would run "Projects" off
    // the edge at whatever setting flatters "BLANK". Each word is scaled to fit
    // instead, which also keeps every route's mark the same optical weight.
    const limit = stage.clientWidth * MARK_WIDTH_LIMIT;
    let scaleTotal = 0;

    const measured: (typeof glyphsRef)["current"] = [];
    for (const word of words) {
      const incoming = word.dataset.slot === "to";
      const natural = word.offsetWidth;
      const fit = natural > 0 ? Math.min(1, limit / natural) : 1;
      word.style.transform = `scale(${fit.toFixed(4)})`;
      scaleTotal += fit;

      const half = natural / 2;
      const glyphs = Array.from(
        word.querySelectorAll<HTMLElement>(".mmp-morph-glyph"),
      );
      glyphs.forEach((el, index) => {
        measured.push({
          el,
          offset: el.offsetLeft + el.offsetWidth / 2 - half,
          phase: glyphPhase(index),
          incoming,
        });
      });
    }
    glyphsRef.current = measured;

    // Blur follows the size the mark is actually drawn at, not the size it was
    // set at, or a scaled-down word would come out over-blurred.
    const meanFit = words.length > 0 ? scaleTotal / words.length : 1;
    if (Number.isFinite(size) && size > 0) {
      markSizeRef.current = size * meanFit;
    }
  }, []);

  /** Writes one frame of the morph. Progress 0 shows `from`, 1 shows `to`. */
  const applyMorph = React.useCallback((progress: number) => {
    const stage = stageRef.current;
    const halo = haloBlurRef.current;
    const ink = inkBlurRef.current;
    if (!stage || !halo || !ink) return;

    const melt = meltAt(progress);
    const size = markSizeRef.current;

    halo.setAttribute(
      "stdDeviation",
      (size * lerp(HALO_REST_BLUR, HALO_PEAK_BLUR, melt)).toFixed(3),
    );
    ink.setAttribute(
      "stdDeviation",
      (size * lerp(INK_REST_BLUR, INK_PEAK_BLUR, melt)).toFixed(3),
    );

    // Splat sideways and squash vertically at full melt, so the mass spreads
    // past the final word width before it pulls back into glyphs.
    stage.style.transform = `scaleX(${(1 + 0.16 * melt).toFixed(4)}) scaleY(${(
      1 - 0.14 * melt
    ).toFixed(4)})`;

    // The handover happens while both words are fully liquid, so it reads as
    // one body reshaping rather than as two words dissolving through each other.
    const swap = ramp(progress, 0.44, 0.56);
    const outOpacity = (1 - swap).toFixed(4);
    const inOpacity = swap.toFixed(4);

    for (const node of stage.querySelectorAll<HTMLElement>(
      '[data-slot="from"]',
    )) {
      node.style.opacity = outOpacity;
    }
    for (const node of stage.querySelectorAll<HTMLElement>(
      '[data-slot="to"]',
    )) {
      node.style.opacity = inOpacity;
    }

    // The morph itself: the outgoing word's letters run home to the centre and
    // pile into one mass, the incoming word's letters fly back out of it. Each
    // one leaves and lands on its own clock, so the outer letters trail the
    // mass and break off as droplets on the way.
    for (const glyph of glyphsRef.current) {
      const spread = glyph.incoming
        ? ramp(progress, 0.44 + glyph.phase * 0.14, 0.94 + glyph.phase * 0.06)
        : 1 -
          ramp(progress, 0.02 + glyph.phase * 0.1, 0.52 + glyph.phase * 0.16);

      const travelled = COLLAPSE_RESIDUAL + spread * (1 - COLLAPSE_RESIDUAL);
      const x = -glyph.offset * (1 - travelled);
      // A little vertical scatter keeps the pile from reading as a machined
      // lozenge; it settles to nothing as the word resolves.
      const y = (1 - spread) * (glyph.phase - 0.5) * COLLAPSE_WOBBLE * size;

      glyph.el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    }
  }, []);

  /** Runs one word-to-word morph, resolving once the word is crisp again. */
  const runMorph = React.useCallback(
    (from: string, to: string) =>
      new Promise<void>((resolve) => {
        setMorphWords({ from, to });

        // Let React paint the new words before the first frame reads them.
        requestAnimationFrame(() => {
          measureMark();
          if (prefersReducedMotion()) {
            applyMorph(1);
            resolve();
            return;
          }
          const proxy = { progress: 0 };
          applyMorph(0);
          gsap.to(proxy, {
            progress: 1,
            duration: MORPH_DURATION,
            ease: "none",
            onUpdate: () => applyMorph(proxy.progress),
            onComplete: () => {
              applyMorph(1);
              resolve();
            },
          });
        });
      }),
    [applyMorph, measureMark],
  );

  /* ------------------------------------------------------- character fades */

  const query = React.useCallback(<T extends Element>(selector: string) => {
    const root = rootRef.current;
    if (!root) return [] as T[];
    return Array.from(root.querySelectorAll<T>(selector));
  }, []);

  /** Drops the tags, empties the pill, and flickers the running text out. */
  const animateOut = React.useCallback(() => {
    const tagNodes = query<HTMLElement>(".mmp-tag");
    if (tagNodes.length > 0) {
      gsap.to(tagNodes, {
        duration: 0.8,
        ease: "power3.out",
        opacity: 0,
        stagger: { amount: 0.25 },
      });
    }

    const pill = query<HTMLElement>('.mmp-nav-item[aria-current="page"]')[0];
    if (pill) {
      gsap.to(pill, {
        startAt: { backgroundColor: "#302c27", color: "#ffffff" },
        backgroundColor: "#ffffff",
        color: "#302c27",
        duration: 1.2,
        ease: "power3.out",
      });
    }

    const chars = query<HTMLElement>('[data-anim="chars"] .mmp-char');
    if (chars.length > 0) {
      gsap.to(chars, {
        duration: 0.4,
        opacity: 0,
        ease: bounceEase,
        stagger: { amount: 0.25, from: "random" },
      });
    }
  }, [query]);

  /**
   * Fills the new pill and flickers the incoming route's text back in.
   *
   * Every character tween here is a `fromTo`, not a `from`, which the source
   * could get away with because swup swapped the DOM out from under it and the
   * incoming nodes arrived with no inline opacity. These nodes persist across
   * routes and are still carrying the `opacity: 0` that `animateOut` left on
   * them, so a `from(0)` would animate them from zero back to zero and the
   * header would simply never come back.
   */
  const animateIn = React.useCallback(() => {
    const pill = query<HTMLElement>('.mmp-nav-item[aria-current="page"]')[0];
    const pillChars = query<HTMLElement>(
      '.mmp-nav-item[aria-current="page"] .mmp-char',
    );

    if (pill) {
      gsap.killTweensOf(pill);
      gsap.to(pill, {
        startAt: { backgroundColor: "transparent", color: "#302c27" },
        backgroundColor: "#302c27",
        color: "#ffffff",
        duration: 1.2,
        ease: "power3.out",
        onComplete: () =>
          gsap.set(pill, { clearProps: "backgroundColor,color" }),
      });
    }

    if (pillChars.length > 0) {
      gsap.killTweensOf(pillChars);
      gsap.fromTo(
        pillChars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          ease: bounceEase,
          stagger: { each: 0.04, from: "random" },
          onComplete: () => gsap.set(pillChars, { clearProps: "opacity" }),
        },
      );
    }

    // Each block staggers within itself, so columns resolve in parallel rather
    // than as one long sweep across the page.
    for (const group of query<HTMLElement>('[data-anim="chars"]')) {
      const chars = Array.from(
        group.querySelectorAll<HTMLElement>(".mmp-char"),
      );
      if (chars.length === 0) continue;
      gsap.killTweensOf(chars);
      gsap.fromTo(
        chars,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          ease: bounceEase,
          stagger: { amount: 0.25, from: "random" },
          onComplete: () => gsap.set(chars, { clearProps: "opacity" }),
        },
      );
    }

    const rows = query<HTMLElement>(".mmp-row");
    if (rows.length > 0) {
      gsap.killTweensOf(rows);
      gsap.fromTo(
        rows,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: { amount: 0.25 },
          onComplete: () => gsap.set(rows, { clearProps: "opacity" }),
        },
      );
    }
  }, [query]);

  /* ------------------------------------------------------------------ tags */

  /**
   * Scatters the tags along the top and bottom edges of their box, rejecting
   * any placement that overlaps one already taken, then fades them up.
   */
  const scatterTags = React.useCallback(() => {
    const layer = tagLayerRef.current;
    if (!layer) return;
    const nodes = Array.from(layer.querySelectorAll<HTMLElement>(".mmp-tag"));
    if (nodes.length === 0) return;

    const bounds = layer.getBoundingClientRect();
    const taken: { x: number; y: number; w: number; h: number }[] = [];

    // The source picks each edge on a coin flip, which every so often drops the
    // whole set onto one side and reads as a row rather than a scatter. Dealing
    // from a shuffled, balanced pool keeps it random-looking but always uses
    // both edges, which is how the layout is meant to sit around the mark.
    const edges = nodes.map((_, index) => index % 2);
    for (let i = edges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [edges[i], edges[j]] = [edges[j], edges[i]];
    }

    nodes.forEach((node, index) => {
      const w = node.offsetWidth;
      const h = node.offsetHeight;
      const y = edges[index] === 0 ? 0 : Math.max(0, bounds.height - h);
      let x = 0;
      let attempts = 0;
      let overlaps = true;

      // Bounded rather than a do/while: a container too small to fit them all
      // should place them anyway, not spin.
      while (overlaps && attempts < 120) {
        x = Math.floor(Math.random() * Math.max(1, bounds.width - w));
        overlaps = taken.some(
          (slot) =>
            x < slot.x + slot.w &&
            x + w > slot.x &&
            y < slot.y + slot.h &&
            y + h > slot.y,
        );
        attempts += 1;
      }

      taken.push({ x, y, w, h });
      gsap.set(node, { x, y, overwrite: "auto" });
    });

    gsap.to(nodes, {
      duration: 1.2,
      ease: "power3.out",
      opacity: 1,
      stagger: { amount: 0.25 },
    });
  }, []);

  /** Pointer-drag for the tags, kept in sync with the GSAP x/y transform. */
  const handleTagPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = event.currentTarget;
      node.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startY = event.clientY;
      const originX = Number(gsap.getProperty(node, "x")) || 0;
      const originY = Number(gsap.getProperty(node, "y")) || 0;

      const move = (moveEvent: PointerEvent) => {
        gsap.set(node, {
          x: originX + (moveEvent.clientX - startX),
          y: originY + (moveEvent.clientY - startY),
        });
      };
      const up = () => {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerup", up);
        node.removeEventListener("pointercancel", up);
      };

      node.addEventListener("pointermove", move);
      node.addEventListener("pointerup", up);
      node.addEventListener("pointercancel", up);
    },
    [],
  );

  /* ------------------------------------------------------------------ boot */

  // Captured at first render: the loader always runs monogram to the word the
  // page opened on, whatever the props do afterwards.
  const bootRef = React.useRef({
    monogram,
    word: activeRoute.word,
    hold: loaderHold,
    skip: skipLoader,
  });

  React.useEffect(() => {
    const { monogram: mark, word, hold, skip } = bootRef.current;
    let cancelled = false;

    measureMark();

    if (skip) {
      applyMorph(1);
      scatterTags();
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const early = Array.from(
      root.querySelectorAll<HTMLElement>('[data-anim="chars"] .mmp-char'),
    );
    const late = Array.from(
      root.querySelectorAll<HTMLElement>(
        '[data-anim="chars-late"] .mmp-char, .mmp-nav-item, .mmp-clock',
      ),
    );

    gsap.set([...early, ...late], { opacity: 0 });
    applyMorph(0);

    let reveal: gsap.core.Timeline | null = null;

    const call = gsap.delayedCall(hold, () => {
      runMorph(mark, word).then(() => {
        if (cancelled) return;
        setBooted(true);
        reveal = gsap
          .timeline({ defaults: { duration: 0.6, ease: "power3.out" } })
          .to(early, {
            opacity: 1,
            ease: bounceEase,
            stagger: { amount: 0.25, from: "random" },
            onComplete: () => gsap.set(early, { clearProps: "opacity" }),
          })
          .to(
            late,
            {
              opacity: 1,
              ease: bounceEase,
              stagger: { amount: 0.25, from: "random" },
              onComplete: () => gsap.set(late, { clearProps: "opacity" }),
            },
            "<25%",
          )
          .call(() => scatterTags(), undefined, "<");
      });
    });

    return () => {
      cancelled = true;
      call.kill();
      reveal?.kill();
    };
  }, [applyMorph, measureMark, runMorph, scatterTags]);

  // Re-scatter and re-measure when the container resizes, matching the source's
  // resize hook. The mark's blur is tied to its font size, so a width change
  // has to re-read it or the goo drifts out of proportion.
  React.useEffect(() => {
    const layer = tagLayerRef.current;
    const root = rootRef.current;
    if (!root || !booted) return;
    let frame = 0;
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        measureMark();
        applyMorph(1);
        if (layer) scatterTags();
      });
    });
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [applyMorph, booted, measureMark, scatterTags]);

  /* -------------------------------------------------------------- navigate */

  const navigate = React.useCallback(
    async (nextId: string) => {
      if (busyRef.current || nextId === routeId) return;
      const next = safeRoutes.find((route) => route.id === nextId);
      if (!next) return;

      busyRef.current = true;
      animateOut();
      await runMorph(activeRoute.word, next.word);
      setRouteId(nextId);
      // Let the new route's markup mount before its characters are staggered.
      requestAnimationFrame(() => {
        animateIn();
        scatterTags();
        busyRef.current = false;
      });
    },
    [
      activeRoute.word,
      animateIn,
      animateOut,
      routeId,
      runMorph,
      safeRoutes,
      scatterTags,
    ],
  );

  /* ----------------------------------------------------------------- clock */

  // Rendered empty on the server and filled on mount, so the markup does not
  // depend on the machine that produced it.
  const [clock, setClock] = React.useState<{ h: string; m: string } | null>(
    null,
  );

  React.useEffect(() => {
    const tick = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }).formatToParts(new Date());
      setClock({
        h: parts.find((part) => part.type === "hour")?.value ?? "00",
        m: parts.find((part) => part.type === "minute")?.value ?? "00",
      });
    };
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  /* ------------------------------------------------------------------ view */

  const isLanding = routeId === safeRoutes[0].id;
  const entries =
    routeId === safeRoutes[1]?.id
      ? projects
      : routeId === safeRoutes[2]?.id
        ? archive
        : [];

  const gooHalo = `mmp-goo-halo-${filterId}`;
  const gooInk = `mmp-goo-ink-${filterId}`;

  return (
    <div
      ref={rootRef}
      className={["mmp", className].filter(Boolean).join(" ")}
      data-booted={booted ? "true" : "false"}
      style={
        {
          "--mmp-yellow": markColor,
          "--mmp-green-yellow": inkColor,
          ...style,
        } as React.CSSProperties
      }
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped component stylesheet
        dangerouslySetInnerHTML={{ __html: getMonogramMorphPageStyles() }}
      />

      {/* The goo: blur the glyphs, then push alpha through a steep ramp so the
          soft edges snap back to a hard silhouette. Overlapping glyphs fuse,
          separating ones tear apart like liquid. */}
      <div className="mmp-morph" aria-hidden="true">
        <svg className="mmp-morph-defs" aria-hidden="true" focusable="false">
          <title>Wordmark morph filter</title>
          <defs>
            {/* Blur, threshold the alpha, then REPAINT the resulting silhouette
                with a flat flood. That last step is not decoration: feGaussianBlur
                operates on premultiplied alpha, so boosting only the alpha channel
                leaves the colour channels at their blurred, part-way-to-transparent
                values and the whole mark composites washed-out over the page. The
                flood throws those channels away and keeps only the shape. */}
            <filter
              id={gooHalo}
              x="-40%"
              y="-80%"
              width="180%"
              height="260%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                ref={haloBlurRef}
                in="SourceGraphic"
                stdDeviation="0"
                result="mmp-halo-blur"
              />
              <feColorMatrix
                in="mmp-halo-blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                result="mmp-halo-goo"
              />
              <feFlood floodColor={markColor} result="mmp-halo-fill" />
              <feComposite
                in="mmp-halo-fill"
                in2="mmp-halo-goo"
                operator="in"
              />
            </filter>
            <filter
              id={gooInk}
              x="-40%"
              y="-80%"
              width="180%"
              height="260%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur
                ref={inkBlurRef}
                in="SourceGraphic"
                stdDeviation="0"
                result="mmp-ink-blur"
              />
              <feColorMatrix
                in="mmp-ink-blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"
                result="mmp-ink-goo"
              />
              <feFlood floodColor={inkColor} result="mmp-ink-fill" />
              <feComposite in="mmp-ink-fill" in2="mmp-ink-goo" operator="in" />
            </filter>
          </defs>
        </svg>

        <div ref={stageRef} className="mmp-morph-stage">
          <div
            className="mmp-morph-layer mmp-morph-layer--halo"
            style={{ filter: `url(#${gooHalo})` }}
          >
            <MorphWord slot="from" text={morphWords.from} />
            <MorphWord slot="to" text={morphWords.to} />
          </div>
          <div
            className="mmp-morph-layer mmp-morph-layer--ink"
            style={{ filter: `url(#${gooInk})` }}
          >
            <MorphWord slot="from" text={morphWords.from} />
            <MorphWord slot="to" text={morphWords.to} />
          </div>
        </div>
      </div>

      <div className="mmp-page">
        <section className="mmp-grid mmp-header">
          <div className="mmp-header-left">
            <div className="mmp-positions mmp-h4">
              <p data-anim="chars">
                <SplitText text={practiceLabel} />
              </p>
              <ul className="mmp-positions-list">
                {practice.map((item) => (
                  <li className="mmp-h4" data-anim="chars" key={item}>
                    <SplitText text={item} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mmp-header-middle">
            <h2
              className="mmp-header-middle-title mmp-italic"
              data-anim="chars"
            >
              <SplitText text={aboutLabel} />
            </h2>
            <div className="mmp-header-middle-content" data-anim="chars">
              <SplitText text={about} />
            </div>
          </div>

          <div className="mmp-header-right">
            <h2 className="mmp-header-right-title mmp-italic" data-anim="chars">
              <SplitText text={contactLabel} />
            </h2>
            <div className="mmp-header-right-content" data-anim="chars">
              {contact.map((line) => (
                <p key={line}>
                  <SplitText text={line} />
                </p>
              ))}
              <p>
                <u>
                  <SplitText text="E: " />
                </u>
                <a href={`mailto:${email}`}>
                  <u>
                    <SplitText text={email} />
                  </u>
                </a>
              </p>
            </div>
          </div>
        </section>

        {isLanding ? (
          <section className="mmp-tags">
            <div className="mmp-tags-wrap" ref={tagLayerRef}>
              {tags.map((tag) => (
                <div
                  className="mmp-tag"
                  key={tag.id}
                  onPointerDown={handleTagPointerDown}
                >
                  <h3 className="mmp-h3">{tag.label}</h3>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mmp-listing">
            {entries.map((entry, index) => (
              <div className="mmp-row" key={entry.id}>
                <span className="mmp-row-cell mmp-row-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className="mmp-row-cell mmp-row-title mmp-h3"
                  data-anim="chars"
                >
                  <SplitText text={entry.title} />
                </span>
                <span className="mmp-row-cell mmp-row-meta">{entry.kind}</span>
                <span className="mmp-row-cell mmp-row-meta">{entry.year}</span>
              </div>
            ))}
          </section>
        )}
      </div>

      <header className="mmp-nav">
        <nav className="mmp-grid mmp-nav-inner">
          <div className="mmp-nav-info">
            <p className="mmp-nav-coords" data-anim="chars-late">
              <SplitText text={coordinates} />
            </p>
            <div className="mmp-clock">
              <div>{clock?.h ?? ""}</div>
              <div className="mmp-clock-divider">:</div>
              <div>{clock?.m ?? ""}</div>
            </div>
          </div>

          <div className="mmp-nav-list">
            <div className="mmp-nav-list-wrap">
              {safeRoutes.map((route) => (
                <button
                  type="button"
                  className="mmp-nav-item mmp-h4"
                  key={route.id}
                  aria-current={route.id === routeId ? "page" : "false"}
                  onClick={() => void navigate(route.id)}
                >
                  <SplitText text={route.label} />
                </button>
              ))}
            </div>
          </div>

          <div className="mmp-nav-socials">
            <div className="mmp-nav-socials-wrap">
              {primaryLinks.map((link) => (
                <a
                  className="mmp-h4"
                  data-anim="chars-late"
                  href={link.href}
                  key={link.label}
                >
                  <SplitText text={link.label} />
                </a>
              ))}
            </div>
          </div>

          <div className="mmp-nav-works">
            <div className="mmp-nav-works-wrap">
              {secondaryLinks.map((link) => (
                <a
                  className="mmp-h4"
                  data-anim="chars-late"
                  href={link.href}
                  key={link.label}
                >
                  <SplitText text={link.label} />
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

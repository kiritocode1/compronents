"use client";

/**
 * BLNK Agency Page — port of obys.agency home + work case study.
 *
 * From the source (not invented):
 * - Black preloader with top progress bar + right % + center logo brackets
 * - Logo brackets (#logo) with is-spread (±137%) on Vertical/Horizontal
 * - Wheel-driven infinite work gallery (scrollS cur/tar, snap, wrap)
 * - Vertical / Horizontal / Grid modes
 * - Title rail + mid-line meta (category / service / index)
 * - Click project → route transition (preloader-bg fade) → #wo case study
 * - Case study: Back, title, meta, Live Website, #wo-ga image column
 * - Studio caption #fx top-right; header wordmark shrinks on case/grid
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { runObysBoot } from "./boot";
import {
  LOGO_PATH_L,
  LOGO_PATH_L_GLOBE,
  LOGO_PATH_R,
  LOGO_PATH_R_GLOBE,
} from "./logo-paths";
import { getBlnkAgencyPageStyles } from "./styles";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type BlnkAgencyMode = "vertical" | "horizontal" | "grid";
export type BlnkAgencyRoute = "work" | "about" | "project";

export interface BlnkAgencyProject {
  name: string;
  category: string;
  service: string;
  aspect: number;
  widthRem: number;
  image: string;
  /** Extra images for the case-study gallery column. */
  gallery?: string[];
  href?: string;
  grid: {
    gr: number;
    gc: number;
    grM: number;
    gcM: number;
    grS: number;
    gcS: number;
    grXs: number;
    gcXs: number;
  };
}

export interface BlnkAgencyPageProps {
  projects?: BlnkAgencyProject[];
  studioName?: string;
  email?: string;
  copyright?: string;
  studioBlurb?: string;
  aboutLead?: string;
  aboutImage?: string;
  timezoneLabel?: string;
  timezone?: string;
  initialRoute?: BlnkAgencyRoute;
  initialMode?: BlnkAgencyMode;
  skipPreloader?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ASSET = "https://ui.aryank.space/assets";
const IMG = {
  award: (n: number) => `${ASSET}/award-list/img${n}.jpg`,
  portfolio: (n: number) => `${ASSET}/portfolio-page/project-${n}.jpg`,
  reveal: (n: number) => `${ASSET}/image-reveal/img-${n}.jpg`,
};

const COPIES = 3;

const GRID = (
  gr: number,
  gc: number,
  grM: number,
  gcM: number,
  grS: number,
  gcS: number,
  grXs: number,
  gcXs: number,
) => ({ gr, gc, grM, gcM, grS, gcS, grXs, gcXs });

export const DEFAULT_PROJECTS: BlnkAgencyProject[] = [
  {
    name: "Field Atlas",
    category: "Architecture, Furniture",
    service: "Creative Direction, Web Design/Dev",
    aspect: 1,
    widthRem: 13.2,
    image: IMG.award(1),
    gallery: [IMG.award(1), IMG.award(2), IMG.award(3)],
    href: "https://aryank.space",
    grid: GRID(1, 2, 1, 2, 1, 1, 1, 1),
  },
  {
    name: "Signal Concept",
    category: "Fashion",
    service: "Web Design/Dev",
    aspect: 0.8,
    widthRem: 17.5,
    image: IMG.award(2),
    gallery: [IMG.award(2), IMG.award(4), IMG.award(5)],
    href: "https://aryank.space",
    grid: GRID(1, 4, 1, 4, 1, 3, 1, 2),
  },
  {
    name: "Registry 24",
    category: "Architecture",
    service: "Web Design",
    aspect: 1,
    widthRem: 18.4,
    image: IMG.award(3),
    gallery: [IMG.award(3), IMG.award(6), IMG.award(7)],
    href: "https://aryank.space",
    grid: GRID(1, 7, 1, 6, 1, 2, 2, 1),
  },
  {
    name: "Night Form",
    category: "Fashion, Photography",
    service: "Creative Direction, Web Design/Dev",
    aspect: 0.67,
    widthRem: 13.2,
    image: IMG.award(4),
    gallery: [IMG.award(4), IMG.award(8), IMG.award(9)],
    href: "https://aryank.space",
    grid: GRID(1, 9, 1, 8, 2, 1, 2, 2),
  },
  {
    name: "Prism Study",
    category: "Photography, Fashion",
    service: "Web Design/Dev, Identity",
    aspect: 1.5,
    widthRem: 19.6,
    image: IMG.award(5),
    gallery: [IMG.award(5), IMG.award(10), IMG.award(11)],
    href: "https://aryank.space",
    grid: GRID(1, 11, 2, 1, 2, 3, 3, 1),
  },
  {
    name: "Soft Protocol",
    category: "Fashion",
    service: "Web Design/Dev, Identity",
    aspect: 1,
    widthRem: 13.2,
    image: IMG.award(6),
    gallery: [IMG.award(6), IMG.award(12), IMG.award(13)],
    href: "https://aryank.space",
    grid: GRID(2, 1, 2, 3, 2, 2, 3, 2),
  },
  {
    name: "Orbit Desk",
    category: "Technology",
    service: "Web Design/Dev",
    aspect: 0.8,
    widthRem: 17.5,
    image: IMG.award(7),
    gallery: [IMG.award(7), IMG.award(14), IMG.award(15)],
    href: "https://aryank.space",
    grid: GRID(2, 5, 2, 5, 3, 1, 4, 1),
  },
  {
    name: "Teaching Grid",
    category: "Education",
    service: "Concept, Web Design/Dev, Identity",
    aspect: 1,
    widthRem: 18.4,
    image: IMG.award(8),
    gallery: [IMG.award(8), IMG.award(16), IMG.award(17)],
    href: "https://aryank.space",
    grid: GRID(2, 6, 2, 7, 3, 3, 4, 2),
  },
  {
    name: "Studio Notes",
    category: "Education",
    service: "Concept, Web Design/Dev, Identity",
    aspect: 0.67,
    widthRem: 13.2,
    image: IMG.award(9),
    gallery: [IMG.award(9), IMG.portfolio(1), IMG.portfolio(2)],
    href: "https://aryank.space",
    grid: GRID(2, 9, 3, 2, 3, 2, 5, 1),
  },
  {
    name: "Emulsion",
    category: "Fashion, Photography",
    service: "Creative Direction, Web Design/Dev",
    aspect: 1.5,
    widthRem: 19.6,
    image: IMG.award(10),
    gallery: [IMG.award(10), IMG.award(1), IMG.award(3)],
    href: "https://aryank.space",
    grid: GRID(2, 11, 3, 4, 4, 1, 5, 2),
  },
  {
    name: "Glyph Press",
    category: "Culture",
    service: "Concept, Web Design/Dev, Identity",
    aspect: 1,
    widthRem: 13.2,
    image: IMG.award(11),
    gallery: [IMG.award(11), IMG.award(5), IMG.award(7)],
    href: "https://aryank.space",
    grid: GRID(3, 3, 3, 6, 4, 3, 6, 1),
  },
  {
    name: "Black Frame",
    category: "Architecture, Development",
    service: "Creative Direction, Web Design/Dev",
    aspect: 0.8,
    widthRem: 17.5,
    image: IMG.award(12),
    gallery: [IMG.award(12), IMG.award(2), IMG.award(4)],
    href: "https://aryank.space",
    grid: GRID(3, 4, 3, 8, 4, 2, 6, 2),
  },
  {
    name: "Salience",
    category: "Technology",
    service: "Web Design/Dev, 3D",
    aspect: 1,
    widthRem: 18.4,
    image: IMG.award(13),
    gallery: [IMG.award(13), IMG.award(6), IMG.award(8)],
    href: "https://aryank.space",
    grid: GRID(3, 8, 4, 1, 5, 1, 7, 1),
  },
  {
    name: "Modernist Trace",
    category: "Culture, Side Project",
    service: "Concept, Web Design/Dev, Identity",
    aspect: 0.67,
    widthRem: 13.2,
    image: IMG.award(14),
    gallery: [IMG.award(14), IMG.award(9), IMG.award(11)],
    href: "https://aryank.space",
    grid: GRID(3, 10, 4, 3, 5, 3, 7, 2),
  },
  {
    name: "Bioform",
    category: "Technology, Biotech",
    service: "Creative Direction, Web Design/Dev, 3D",
    aspect: 1.5,
    widthRem: 19.6,
    image: IMG.award(15),
    gallery: [IMG.award(15), IMG.award(10), IMG.award(12)],
    href: "https://aryank.space",
    grid: GRID(4, 2, 4, 5, 5, 2, 8, 1),
  },
  {
    name: "Velocity",
    category: "Automotive",
    service: "Web Design/Dev",
    aspect: 1,
    widthRem: 13.2,
    image: IMG.award(16),
    gallery: [IMG.award(16), IMG.award(13), IMG.award(15)],
    href: "https://aryank.space",
    grid: GRID(4, 6, 4, 7, 6, 1, 8, 2),
  },
  {
    name: "Atmos",
    category: "Technology, Furniture",
    service: "Creative Direction, Web Design/Dev",
    aspect: 0.8,
    widthRem: 17.5,
    image: IMG.award(17),
    gallery: [IMG.award(17), IMG.award(14), IMG.award(16)],
    href: "https://aryank.space",
    grid: GRID(4, 9, 5, 2, 6, 3, 9, 1),
  },
  {
    name: "Rule Set",
    category: "Education, Side Project",
    service: "Concept, Web Design/Dev, Identity",
    aspect: 1,
    widthRem: 18.4,
    image: IMG.portfolio(1),
    gallery: [IMG.portfolio(1), IMG.portfolio(2), IMG.award(17)],
    href: "https://aryank.space",
    grid: GRID(4, 11, 5, 4, 6, 2, 9, 2),
  },
  {
    name: "Silver Tone",
    category: "Fashion, Photography",
    service: "Concept, Web Design/Dev",
    aspect: 0.67,
    widthRem: 13.2,
    image: IMG.portfolio(2),
    gallery: [IMG.portfolio(2), IMG.reveal(1), IMG.reveal(2)],
    href: "https://aryank.space",
    grid: GRID(5, 4, 5, 6, 7, 1, 10, 1),
  },
];

const MODES: { id: BlnkAgencyMode; label: string }[] = [
  { id: "vertical", label: "Vertical," },
  { id: "horizontal", label: "Horizontal," },
  { id: "grid", label: "Grid" },
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function buildLoop<T>(items: T[], copies = COPIES): T[] {
  const out: T[] = [];
  for (let c = 0; c < copies; c++) out.push(...items);
  return out;
}

function buildEmptyCells(projects: BlnkAgencyProject[]) {
  const occupied = new Set(projects.map((p) => `${p.grid.gr}:${p.grid.gc}`));
  const maxRow = Math.max(...projects.map((p) => p.grid.gr), 5) + 1;
  const cells: { row: number; col: number; n: string }[] = [];
  let n = 1;
  for (let row = 1; row <= maxRow; row++) {
    for (let col = 1; col <= 12; col++) {
      if (occupied.has(`${row}:${col}`)) continue;
      if ((row + col) % 3 === 0 || (row * col) % 5 === 0) {
        cells.push({ row, col, n: pad2(n) });
      }
      n++;
    }
  }
  return cells;
}

function useClock(timezone: string, label: string) {
  const [text, setText] = useState(`${label} --:-- --`);
  useEffect(() => {
    const tick = () => {
      try {
        const parts = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).formatToParts(new Date());
        const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
        const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
        const dayPeriod =
          parts.find((p) => p.type === "dayPeriod")?.value?.toUpperCase() ??
          "AM";
        setText(`${label} ${hour}:${minute} ${dayPeriod}`);
      } catch {
        const d = new Date();
        const h = d.getHours();
        const ap = h >= 12 ? "PM" : "AM";
        setText(`${label} ${pad2(h % 12 || 12)}:${pad2(d.getMinutes())} ${ap}`);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timezone, label]);
  return text;
}

/* ------------------------------------------------------------------ */
/* Gallery engine — wheel / touch, lerp, snap, wrap (source scrollS)  */
/* ------------------------------------------------------------------ */

type Axis = "y" | "x";

interface GalleryEngine {
  destroy: () => void;
  recenter: () => void;
}

function createGalleryEngine(opts: {
  root: HTMLElement;
  track: HTMLElement;
  titlesTrack?: HTMLElement | null;
  titleItems?: HTMLElement[];
  frameItems: HTMLElement[];
  axis: Axis;
  count: number;
  onActive: (index: number) => void;
  horizontalCenter?: boolean;
}): GalleryEngine {
  const {
    root,
    track,
    titlesTrack = null,
    titleItems = [],
    frameItems,
    axis,
    count,
    onActive,
    horizontalCenter = false,
  } = opts;

  let cur = 0;
  let tar = 0;
  let loopLen = 0;
  let centers: number[] = [];
  let titleCenters: number[] = [];
  let titleTarget = 0;
  let active = -1;
  let scrolling = false;
  let snapped = true;
  let raf = 0;
  let snapTimer: number | null = null;
  let destroyed = false;
  let touching = false;
  let touchLast = 0;

  const DAMP_SCROLL = 0.09; // source pU ≈ 0.09
  const DAMP_SNAP = 0.07; // source sU ≈ 0.07

  const viewportSize = () =>
    axis === "y" ? root.clientHeight : root.clientWidth;

  const centerOf = (el: HTMLElement, ancestor: HTMLElement) => {
    const ar = ancestor.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return axis === "y"
      ? er.top - ar.top + er.height / 2
      : er.left - ar.left + er.width / 2;
  };

  const measure = () => {
    if (frameItems.length === 0) return;
    const prev = track.style.transform;
    track.style.transform = horizontalCenter ? "translateY(-50%)" : "";
    centers = frameItems.map((el) => centerOf(el, track));
    if (centers[count] !== undefined && centers[0] !== undefined) {
      loopLen = Math.abs(centers[count] - centers[0]);
    } else {
      loopLen = Math.max(
        axis === "y" ? track.scrollHeight / COPIES : track.scrollWidth / COPIES,
        1,
      );
    }
    if (titlesTrack && titleItems.length > 0) {
      const tPrev = titlesTrack.style.transform;
      titlesTrack.style.transform = "";
      titleCenters = titleItems.map((el) => el.offsetTop + el.offsetHeight / 2);
      titleTarget = (titlesTrack.parentElement?.clientHeight ?? 0) / 2;
      titlesTrack.style.transform = tPrev;
    }
    track.style.transform = prev;
  };

  const wrapScroll = () => {
    if (loopLen <= 0) return;
    while (cur >= loopLen * 2) {
      cur -= loopLen;
      tar -= loopLen;
    }
    while (cur < loopLen) {
      cur += loopLen;
      tar += loopLen;
    }
  };

  const applyTransform = () => {
    if (axis === "y") {
      track.style.transform = `translate3d(0, ${-cur}px, 0)`;
    } else if (horizontalCenter) {
      track.style.transform = `translate3d(${-cur}px, -50%, 0)`;
    } else {
      track.style.transform = `translate3d(${-cur}px, 0, 0)`;
    }
    if (titlesTrack && titleCenters.length > 0 && active >= 0) {
      const titleIdx = count + (active % count);
      const tCenter = titleCenters[titleIdx] ?? titleCenters[active] ?? 0;
      titlesTrack.style.transform = `translate3d(0, ${-(tCenter - titleTarget)}px, 0)`;
    }
    // Source updPrlx: slight image offset by distance from center
    if (centers.length > 0) {
      const mid = cur + viewportSize() / 2;
      for (let i = 0; i < frameItems.length; i++) {
        const img = frameItems[i].querySelector("img");
        if (!img) continue;
        const c = centers[i] ?? mid;
        const dist = Math.max(
          -1,
          Math.min(1, (c - mid) / (viewportSize() || 1)),
        );
        if (frameItems[i].classList.contains("is-on")) {
          img.style.transform = "scale(1)";
        } else {
          img.style.transform = `scale(1.12) translate3d(0, ${dist * -5}%, 0)`;
        }
      }
    }
  };

  const findClosest = () => {
    const mid = cur + viewportSize() / 2;
    let best = count;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = count; i < count * 2 && i < centers.length; i++) {
      const d = Math.abs(centers[i] - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    return best;
  };

  const setActiveFromClosest = () => {
    if (centers.length === 0) return;
    const idx = findClosest();
    const logical = ((idx % count) + count) % count;
    if (logical === active) return;
    active = logical;
    onActive(logical);
    for (let i = 0; i < titleItems.length; i++) {
      titleItems[i].classList.toggle("is-on", i % count === logical);
    }
    for (let i = 0; i < frameItems.length; i++) {
      frameItems[i].classList.toggle("is-on", i % count === logical);
    }
  };

  const nearestSnapTarget = () => {
    const idx = findClosest();
    const center = centers[idx];
    if (center === undefined) return cur;
    return center - viewportSize() / 2;
  };

  const scheduleSnap = () => {
    if (snapTimer !== null) window.clearTimeout(snapTimer);
    snapTimer = window.setTimeout(() => {
      if (touching || destroyed) return;
      if (Math.abs(cur - tar) > 4) return;
      tar = nearestSnapTarget();
      snapped = true;
      scrolling = false;
    }, 120);
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const dx = e.deltaX;
    const dy = e.deltaY;
    let delta = axis === "y" ? dy : Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (e.shiftKey && axis === "y") delta = dx || dy;
    if (Math.abs(delta) < 0.5) return;
    scrolling = true;
    snapped = false;
    tar += delta;
    scheduleSnap();
  };

  const onTouchStart = (e: TouchEvent) => {
    if (!e.touches[0]) return;
    touching = true;
    snapped = false;
    scrolling = true;
    touchLast = axis === "y" ? e.touches[0].clientY : e.touches[0].clientX;
    if (snapTimer !== null) window.clearTimeout(snapTimer);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!touching || !e.touches[0]) return;
    e.preventDefault();
    const pos = axis === "y" ? e.touches[0].clientY : e.touches[0].clientX;
    tar += touchLast - pos;
    touchLast = pos;
  };

  const onTouchEnd = () => {
    touching = false;
    scheduleSnap();
  };

  const tick = () => {
    if (destroyed) return;
    const damp = snapped ? DAMP_SNAP : DAMP_SCROLL;
    const diff = tar - cur;
    if (Math.abs(diff) < 0.2) cur = tar;
    else cur += diff * damp;
    wrapScroll();
    applyTransform();
    setActiveFromClosest();
    if (!touching && scrolling && Math.abs(tar - cur) < 2.5 && !snapped) {
      tar = nearestSnapTarget();
      snapped = true;
      scrolling = false;
    }
    raf = requestAnimationFrame(tick);
  };

  const recenter = () => {
    measure();
    if (loopLen <= 0 || centers.length === 0) return;
    const midIndex = count + Math.floor(count / 2);
    const center = centers[midIndex] ?? centers[count] ?? 0;
    cur = center - viewportSize() / 2;
    tar = cur;
    wrapScroll();
    active = -1;
    applyTransform();
    setActiveFromClosest();
  };

  requestAnimationFrame(() => {
    if (destroyed) return;
    recenter();
    raf = requestAnimationFrame(tick);
  });

  root.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("touchstart", onTouchStart, { passive: true });
  root.addEventListener("touchmove", onTouchMove, { passive: false });
  root.addEventListener("touchend", onTouchEnd, { passive: true });
  root.addEventListener("touchcancel", onTouchEnd, { passive: true });
  const onResize = () => {
    const prev = active;
    measure();
    const midIndex = count + ((prev >= 0 ? prev : 0) % count);
    const center = centers[midIndex];
    if (center !== undefined) {
      cur = center - viewportSize() / 2;
      tar = cur;
    }
    wrapScroll();
    applyTransform();
  };
  window.addEventListener("resize", onResize);

  return {
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      if (snapTimer !== null) window.clearTimeout(snapTimer);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("resize", onResize);
    },
    recenter,
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function BlnkAgencyPage({
  projects = DEFAULT_PROJECTS,
  studioName = "BLNK",
  email = "hello@aryank.space",
  copyright = `All rights reserved. ©${new Date().getFullYear()} BLNK`,
  studioBlurb = "The studio is shaped by people who care deeply about design and the process behind. Each project becomes a case study and a meaningful part of our portfolio, developed with care and attention.",
  aboutLead = "A concept-driven design studio crafting award-winning brand and web experiences shaped by storytelling and strong visual systems.",
  aboutImage = IMG.reveal(1),
  timezoneLabel = "CET",
  timezone = "Europe/Berlin",
  initialRoute = "work",
  initialMode = "vertical",
  skipPreloader = false,
  className,
  style,
}: BlnkAgencyPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const vTrackRef = useRef<HTMLDivElement>(null);
  const vTitlesRef = useRef<HTMLDivElement>(null);
  const hTrackRef = useRef<HTMLDivElement>(null);
  const hTitlesRef = useRef<HTMLDivElement>(null);
  const gTrackRef = useRef<HTMLDivElement>(null);
  const caseGaRef = useRef<HTMLDivElement>(null);
  const caseTrackRef = useRef<HTMLDivElement>(null);
  const prgRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const introStackRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GalleryEngine | null>(null);

  const [route, setRoute] = useState<BlnkAgencyRoute>(
    initialRoute === "project" ? "work" : initialRoute,
  );
  const [mode, setMode] = useState<BlnkAgencyMode>(initialMode);
  const [ready, setReady] = useState(skipPreloader);
  const [activeIndex, setActiveIndex] = useState(
    Math.floor(projects.length / 2),
  );
  const [projectIndex, setProjectIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [contactLabel, setContactLabel] = useState("Contact");
  const [pct, setPct] = useState(0);
  const [metaTick, setMetaTick] = useState(0);

  const clock = useClock(timezone, timezoneLabel);
  const empties = useMemo(() => buildEmptyCells(projects), [projects]);
  const loop = useMemo(() => buildLoop(projects), [projects]);
  const gridSets = useMemo(() => [0, 1, 2], []);
  const activeProject = projects[activeIndex] ?? projects[0];
  const caseProject = projects[projectIndex] ?? projects[0];
  const hoverProject = hoverIndex !== null ? projects[hoverIndex] : null;

  /* Boot: runObysBoot (ah + eh from d.js). No invent spin/fan. */
  useEffect(() => {
    if (skipPreloader) {
      setReady(true);
      setPct(100);
      const logo = logoRef.current;
      logo?.classList.remove("is-intro");
      logo?.classList.add("is-spread", "is-on");
      return;
    }
    const root = rootRef.current;
    const logo = logoRef.current;
    const stack = introStackRef.current;
    if (!root || !logo || !stack) return;

    const pathR = logo.querySelector(
      "#bap-logo-r path",
    ) as SVGPathElement | null;
    const pathL = logo.querySelector(
      "#bap-logo-l path",
    ) as SVGPathElement | null;
    if (!pathR || !pathL) return;

    const kill = runObysBoot({
      root,
      logo,
      pathR,
      pathL,
      stack,
      planes: Array.from(
        stack.querySelectorAll<HTMLElement>(".bap-intro-plane"),
      ),
      preloader: root.querySelector(".bap-preloader"),
      preloaderBg: root.querySelector(".bap-preloader-bg"),
      prgBar: prgRef.current,
      pctEl: root.querySelector(".bap-preloader-pct"),
      onCounter: setPct,
      onDone: () => setReady(true),
    });

    return kill;
  }, [skipPreloader, projects]);

  /* ---- Intro chrome (source u0.boot line reveals) ---- */
  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;
    const q = (sel: string) =>
      Array.from(root.querySelectorAll(sel)) as HTMLElement[];

    q(".bap-header-title").forEach((el) => el.classList.add("is-in"));
    q(".bap-header-menu > button").forEach((el, i) => {
      gsap.delayedCall(0.05 * i, () => el.classList.add("is-in"));
    });
    q(".bap-header-time > span").forEach((el) => el.classList.add("is-in"));
    q(".bap-header-contact").forEach((el) => el.classList.add("is-in"));
    q(".bap-modes > button").forEach((el, i) => {
      gsap.delayedCall(0.06 * i, () => el.classList.add("is-in"));
    });
    q(".bap-copy .bap-ln").forEach((el) => el.classList.add("is-in"));
    q(".bap-fx").forEach((el) => el.classList.add("is-on"));
    q(".bap-title .bap-ln").forEach((el, i) => {
      gsap.delayedCall(0.035 * (i % projects.length), () =>
        el.classList.add("is-in"),
      );
    });
    setMetaTick((t) => t + 1);
  }, [ready, projects.length]);

  /* Mode switcher underline, imperative so is-in survives re-renders */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const buttons = root.querySelectorAll<HTMLElement>(".bap-modes > button");
    buttons.forEach((el, i) => {
      el.classList.toggle("is-on", MODES[i]?.id === mode);
    });
  }, [mode]);

  /* Logo spread: on for V/H home, off for grid / project / about (source) */
  useEffect(() => {
    const logo = logoRef.current;
    if (!logo || !ready) return;
    if (route === "work" && mode !== "grid") {
      logo.classList.add("is-spread", "is-on");
      logo.classList.remove("is-hide");
    } else if (route === "work" && mode === "grid") {
      logo.classList.remove("is-spread");
      logo.classList.add("is-on");
    } else {
      // work case / about: logo stays, header shrinks
      logo.classList.add("is-spread", "is-on");
    }
  }, [route, mode, ready]);

  /* Meta line rise when active changes (source me is-on swap) */
  useEffect(() => {
    if (!ready || route !== "work") return;
    const root = rootRef.current;
    if (!root) return;
    const inners = root.querySelectorAll<HTMLElement>(
      ".bap-v-meta-inner, .bap-h-meta-inner",
    );
    inners.forEach((el) => {
      el.classList.remove("is-on");
      void el.offsetWidth;
      el.classList.add("is-on");
    });
  }, [activeIndex, ready, route, mode, metaTick]);

  /* Home gallery engine */
  useEffect(() => {
    if (!ready || route !== "work") return;
    const work = workRef.current;
    if (!work) return;
    let cancelled = false;

    const mount = () => {
      if (cancelled) return;
      engineRef.current?.destroy();
      engineRef.current = null;

      const onActive = (i: number) => {
        setActiveIndex(i);
        setMetaTick((t) => t + 1);
      };

      if (mode === "vertical") {
        const track = vTrackRef.current;
        const titlesEl = vTitlesRef.current;
        if (!track) return;
        engineRef.current = createGalleryEngine({
          root: work,
          track,
          titlesTrack: titlesEl,
          titleItems: titlesEl
            ? Array.from(titlesEl.querySelectorAll("[data-title]"))
            : [],
          frameItems: Array.from(track.querySelectorAll("[data-frame]")),
          axis: "y",
          count: projects.length,
          onActive,
        });
      } else if (mode === "horizontal") {
        const track = hTrackRef.current;
        const titlesEl = hTitlesRef.current;
        if (!track) return;
        engineRef.current = createGalleryEngine({
          root: work,
          track,
          titlesTrack: titlesEl,
          titleItems: titlesEl
            ? Array.from(titlesEl.querySelectorAll("[data-title]"))
            : [],
          frameItems: Array.from(track.querySelectorAll("[data-frame]")),
          axis: "x",
          count: projects.length,
          onActive,
          horizontalCenter: true,
        });
      } else {
        const track = gTrackRef.current;
        if (!track) return;
        engineRef.current = createGalleryEngine({
          root: work,
          track,
          frameItems: Array.from(track.querySelectorAll("[data-grid-frame]")),
          axis: "y",
          count: projects.length,
          onActive,
        });
      }
    };

    const id = requestAnimationFrame(() => requestAnimationFrame(mount));
    const t = window.setTimeout(() => {
      if (cancelled) return;
      engineRef.current?.recenter();
    }, 400);

    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      window.clearTimeout(t);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [ready, route, mode, projects.length]);

  /* Case-study gallery wheel (source wo-ga scroll) */
  useEffect(() => {
    if (route !== "project") return;
    const ga = caseGaRef.current;
    const track = caseTrackRef.current;
    if (!ga || !track) return;

    let cur = 0;
    let tar = 0;
    let raf = 0;
    let max = 0;

    const measure = () => {
      max = Math.max(0, track.scrollHeight - ga.clientHeight);
    };
    const tick = () => {
      cur += (tar - cur) * 0.09;
      if (Math.abs(tar - cur) < 0.2) cur = tar;
      track.style.transform = `translate3d(0, ${-cur}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      tar = Math.max(0, Math.min(max, tar + e.deltaY));
    };

    measure();
    // Start with first image centered-ish
    tar = cur = 0;
    raf = requestAnimationFrame(tick);
    ga.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", measure);

    // Entrance: images slide from right (source ease.x = galleryW)
    gsap.fromTo(
      track.children,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power3.out" },
    );

    return () => {
      cancelAnimationFrame(raf);
      ga.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", measure);
    };
  }, [route, projectIndex]);

  /* Route transition (source preloader-bg fade out/in) */
  const transitionTo = useCallback((next: () => void) => {
    const veil = veilRef.current;
    if (!veil) {
      next();
      return;
    }
    gsap
      .timeline()
      .set(veil, { pointerEvents: "all" })
      .to(veil, { opacity: 1, duration: 0.35, ease: "power2.in" })
      .add(() => next())
      .to(veil, { opacity: 0, duration: 0.45, ease: "power2.out", delay: 0.05 })
      .set(veil, { pointerEvents: "none" });
  }, []);

  const openProject = useCallback(
    (index: number) => {
      transitionTo(() => {
        setProjectIndex(index);
        setRoute("project");
      });
    },
    [transitionTo],
  );

  const goHome = useCallback(() => {
    transitionTo(() => setRoute("work"));
  }, [transitionTo]);

  const goAbout = useCallback(() => {
    transitionTo(() => setRoute("about"));
  }, [transitionTo]);

  const goMode = (m: BlnkAgencyMode) => {
    if (m === mode) return;
    setMode(m);
  };

  const onContact = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setContactLabel("Copied");
      window.setTimeout(() => setContactLabel("Contact"), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }, [email]);

  const year = new Date().getFullYear();
  const headerShrink =
    route === "project" || route === "about" || mode === "grid";

  return (
    <main
      ref={rootRef}
      className={["blnk-agency-page", className].filter(Boolean).join(" ")}
      style={style}
      data-ready={ready ? "1" : "0"}
      data-route={route}
      data-mode={mode}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped page CSS
        dangerouslySetInnerHTML={{ __html: getBlnkAgencyPageStyles() }}
      />

      <div className="bap-shell">
        <div className="bap-page">
          {/* ---------- HOME WORK ---------- */}
          <div
            ref={workRef}
            className="bap-work"
            style={{
              visibility: route === "work" && ready ? "visible" : "hidden",
              pointerEvents: route === "work" && ready ? "auto" : "none",
              opacity: route === "work" && ready ? 1 : 0,
            }}
            aria-hidden={route !== "work" || !ready}
          >
            {/* Vertical */}
            <div
              className={`bap-mode${mode === "vertical" ? " is-active" : ""}`}
            >
              <div className="bap-v-wrap">
                <div className="bap-v-track" ref={vTrackRef}>
                  {loop.map((p, i) => (
                    <button
                      key={`vf-${p.name}-${i}`}
                      type="button"
                      data-frame
                      className={`bap-frame${activeIndex === i % projects.length ? " is-on" : ""}`}
                      style={{
                        aspectRatio: String(p.aspect),
                        width: `calc(${p.widthRem} * var(--bap-rem))`,
                      }}
                      aria-label={p.name}
                      onClick={() => openProject(i % projects.length)}
                    >
                      <img src={p.image} alt="" draggable={false} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="bap-v-titles">
                <div className="bap-v-titles-track" ref={vTitlesRef}>
                  {loop.map((p, i) => (
                    <div
                      key={`vt-${p.name}-${i}`}
                      data-title
                      className={`bap-title${activeIndex === i % projects.length ? " is-on" : ""}`}
                    >
                      <span className="bap-ln_">
                        <span className="bap-ln">{p.name}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bap-v-meta">
                <div className="bap-v-meta-inner" key={`vm-${activeIndex}`}>
                  <span>{activeProject?.category}</span>
                  <span>{activeProject?.service}</span>
                  <span>{pad2(activeIndex + 1)}</span>
                </div>
              </div>
            </div>

            {/* Horizontal */}
            <div
              className={`bap-mode${mode === "horizontal" ? " is-active" : ""}`}
            >
              <div className="bap-h-wrap">
                <div className="bap-h-track" ref={hTrackRef}>
                  {loop.map((p, i) => (
                    <button
                      key={`hf-${p.name}-${i}`}
                      type="button"
                      data-frame
                      className={`bap-frame${activeIndex === i % projects.length ? " is-on" : ""}`}
                      style={{
                        aspectRatio: String(p.aspect),
                        width: `calc(${p.widthRem} * var(--bap-rem))`,
                      }}
                      aria-label={p.name}
                      onClick={() => openProject(i % projects.length)}
                    >
                      <img src={p.image} alt="" draggable={false} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="bap-h-titles">
                <div className="bap-h-titles-track" ref={hTitlesRef}>
                  {loop.map((p, i) => (
                    <div
                      key={`ht-${p.name}-${i}`}
                      data-title
                      className={`bap-title${activeIndex === i % projects.length ? " is-on" : ""}`}
                    >
                      <span className="bap-ln_">
                        <span className="bap-ln">{p.name}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bap-h-meta">
                <div className="bap-h-meta-line">
                  <div className="bap-h-meta-inner" key={`hm-${activeIndex}`}>
                    <span>{pad2(activeIndex + 1)}</span>
                    <span className="bap-h-meta-rule" aria-hidden />
                    <span>{activeProject?.category}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className={`bap-mode${mode === "grid" ? " is-active" : ""}`}>
              <div className="bap-grid-viewport">
                <div className="bap-grid-track" ref={gTrackRef}>
                  {gridSets.map((copy) => (
                    <div key={`gs-${copy}`} className="bap-grid" data-grid-set>
                      {empties.map((c) => (
                        <div
                          key={`e-${copy}-${c.row}-${c.col}`}
                          className="bap-grid-empty"
                          style={{ gridRow: c.row, gridColumn: c.col }}
                        >
                          {c.n}
                        </div>
                      ))}
                      {projects.map((p, i) => (
                        <div
                          key={`gi-${copy}-${p.name}`}
                          className="bap-grid-item"
                          data-grid-frame
                          style={
                            {
                              "--gr": p.grid.gr,
                              "--gc": p.grid.gc,
                              "--gr-m": p.grid.grM,
                              "--gc-m": p.grid.gcM,
                              "--gr-s": p.grid.grS,
                              "--gc-s": p.grid.gcS,
                              "--gr-xs": p.grid.grXs,
                              "--gc-xs": p.grid.gcXs,
                            } as CSSProperties
                          }
                        >
                          <button
                            type="button"
                            className={`bap-grid-img${hoverIndex === i ? " is-hv" : ""}`}
                            style={{ aspectRatio: String(p.aspect) }}
                            aria-label={p.name}
                            onMouseEnter={() => setHoverIndex(i)}
                            onMouseLeave={() => setHoverIndex(null)}
                            onClick={() => openProject(i)}
                          >
                            <img src={p.image} alt="" draggable={false} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <figure
                className={`bap-grid-preview${hoverIndex !== null ? " is-on" : ""}`}
              >
                {hoverProject ? (
                  <img src={hoverProject.image} alt="" draggable={false} />
                ) : null}
              </figure>
              <div
                className={`bap-grid-title${hoverIndex !== null ? " is-on" : ""}`}
              >
                <div>{hoverProject?.name}</div>
              </div>
              <div
                className={`bap-grid-meta${hoverIndex !== null ? " is-on" : ""}`}
              >
                <div>
                  <div>{hoverProject?.name}</div>
                </div>
                <div>
                  <div>{hoverProject?.category}</div>
                </div>
                <div>
                  <div>{hoverProject?.service}</div>
                </div>
                <div>
                  <div>{hoverIndex !== null ? pad2(hoverIndex + 1) : "00"}</div>
                </div>
              </div>
            </div>

            {/* is-on / is-in are toggled imperatively so React re-renders
                never clobber the classes added by the reveal effect */}
            <div className="bap-modes">
              {MODES.map((m) => (
                <button key={m.id} type="button" onClick={() => goMode(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
            <div className="bap-copy">
              <span className="bap-ln_">
                <span className="bap-ln">{copyright}</span>
              </span>
            </div>
          </div>

          {/* ---------- PROJECT CASE STUDY (source #wo) ---------- */}
          <div
            className={`bap-case${route === "project" ? " is-active" : ""}`}
            aria-hidden={route !== "project"}
          >
            <button type="button" className="bap-case-back" onClick={goHome}>
              <span className="bap-ln_">
                <span
                  className={`bap-ln${route === "project" ? " is-in" : ""}`}
                >
                  Back
                </span>
              </span>
              <span className="bap-u is-on">
                <div />
              </span>
            </button>
            <div className="bap-case-info">
              <h1 className="bap-case-ti">
                <span className="bap-ln_">
                  <span
                    className={`bap-ln${route === "project" ? " is-in" : ""}`}
                  >
                    {caseProject?.name}
                  </span>
                </span>
              </h1>
              <div className="bap-case-meta">
                <h2>{caseProject?.category}</h2>
                <h2>{caseProject?.service}</h2>
                {caseProject?.href ? (
                  <a
                    className="bap-case-link"
                    href={caseProject.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live Website
                    <span className="bap-u is-on">
                      <div />
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
            <div className="bap-case-ga" ref={caseGaRef}>
              <div className="bap-case-ga-track" ref={caseTrackRef}>
                {(
                  caseProject?.gallery ?? [caseProject?.image].filter(Boolean)
                ).map((src, i) => (
                  <img
                    key={`${caseProject?.name}-g-${i}`}
                    src={src}
                    alt=""
                    draggable={false}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ---------- ABOUT ---------- */}
          <div
            className={`bap-about${route === "about" ? " is-active" : ""}`}
            aria-hidden={route !== "about"}
          >
            <div className="bap-about-inner">
              <p className="bap-about-lead">{aboutLead}</p>
              <div className="bap-about-grid">
                <div className="bap-about-col">
                  <h2>Studio</h2>
                  <p>{studioName}</p>
                  <p>Design &amp; Development</p>
                  <p>EU / Remote</p>
                </div>
                <div className="bap-about-col">
                  <h2>Contact</h2>
                  <a href={`mailto:${email}`}>{email}</a>
                  <a
                    href="https://aryank.space"
                    target="_blank"
                    rel="noreferrer"
                  >
                    aryank.space
                  </a>
                </div>
                <div className="bap-about-col">
                  <h2>Focus</h2>
                  <p>Brand systems</p>
                  <p>Web experiences</p>
                  <p>Motion &amp; product UI</p>
                </div>
                <div className="bap-about-visual">
                  <img src={aboutImage} alt="" draggable={false} />
                </div>
              </div>
              <div className="bap-about-foot">
                <div className="bap-about-mark">{studioName}</div>
                <p className="bap-about-note">
                  Built as a registry page for BLANK. Real work, real motion, no
                  throwaway copy. ©{year}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studio caption — hidden on case study (source fx hide on wo) */}
      {route === "work" ? (
        <div className={`bap-fx${mode === "grid" ? " is-hide" : ""}`}>
          <p className="bap-fx-de">{studioBlurb}</p>
          <div className="bap-fx-co">
            <span>Contact:</span>
            <a href={`mailto:${email}`}>
              {email}
              <span className="bap-u is-on">
                <div />
              </span>
            </a>
          </div>
        </div>
      ) : null}

      {/* Intro image stack (source eh) — sits under logo during preloader */}
      {!skipPreloader ? (
        <div ref={introStackRef} className="bap-intro-stack" aria-hidden>
          {projects.slice(0, 6).map((p) => (
            <div
              key={`intro-${p.name}`}
              className="bap-intro-plane"
              data-ar={String(p.aspect)}
            >
              <img src={p.image} alt="" draggable={false} />
            </div>
          ))}
        </div>
      ) : null}

      {/* Logo brackets — exact paths from obys.agency #logo-r / #logo-l */}
      <div ref={logoRef} className="bap-logo is-intro" aria-hidden>
        <svg viewBox="0 0 400 400" fill="none">
          <g id="bap-logo-r">
            <path
              d={LOGO_PATH_R}
              data-d={LOGO_PATH_R_GLOBE}
              fill="currentColor"
            />
          </g>
          <g id="bap-logo-l">
            <path
              d={LOGO_PATH_L}
              data-d={LOGO_PATH_L_GLOBE}
              fill="currentColor"
            />
          </g>
        </svg>
      </div>

      <header className="bap-header">
        <button
          type="button"
          className={`bap-header-title${headerShrink ? " is-shrink" : ""}`}
          aria-label={studioName}
          onClick={goHome}
        >
          <span>{studioName}</span>
        </button>
        <div className="bap-header-right">
          <nav className="bap-header-menu" aria-label="Primary">
            <button
              type="button"
              className={
                route === "work" || route === "project" ? "is-on" : undefined
              }
              onClick={goHome}
            >
              <span>Work</span>
            </button>
            <button
              type="button"
              className={route === "about" ? "is-on" : undefined}
              onClick={goAbout}
            >
              <span>About</span>
            </button>
          </nav>
          <div className="bap-header-time">
            <span>{clock}</span>
          </div>
          <div className="bap-header-contact-wrap">
            <button
              type="button"
              className="bap-header-contact"
              data-email={email}
              onClick={onContact}
            >
              {contactLabel}
            </button>
          </div>
        </div>
      </header>

      {/* Route veil */}
      <div ref={veilRef} className="bap-route-veil" aria-hidden />

      {/* Preloader */}
      {!skipPreloader ? (
        <div className="bap-preloader" aria-hidden={ready}>
          <div className="bap-preloader-bg" />
          <div className="bap-prg">
            <div ref={prgRef} />
          </div>
          <div className="bap-preloader-pct">
            <span>{pad2(pct)}</span>
          </div>
        </div>
      ) : null}
    </main>
  );
}

"use client";

// BLANK — aryank.space
// Colourist reel page: a one-screen portfolio for a film colourist. Home holds
// a single sentence with a role word that takes the cursor's hue, and the reel
// waits as a 64px peek at the bottom edge with its own frames blurred into an
// ambient glow above it. Projects open as a vertical looping list (an embla
// carousel whose rows fade by distance from centre) or as a grid, and any
// project plays full-bleed with a gallery and credits view. P, I and Escape
// move between screens.
//
// Ported line by line from the source's compiled Next.js bundle: same embla
// options and engine hooks, same framer-motion variants, same CSS transitions.
// Viewport units become container units on the root, and window listeners
// that only make sense inside the page move to the root element.

import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Variants,
} from "motion/react";
import type * as React from "react";
import {
  createContext,
  memo,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type ColouristProject,
  type ColouristSite,
  DEFAULT_PROJECTS,
  DEFAULT_SITE,
} from "./data";
import { getColouristReelPageStyles } from "./styles";

export type { ColouristProject, ColouristSite } from "./data";
export { DEFAULT_PROJECTS, DEFAULT_SITE } from "./data";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/colourist-reel-page";

type Page = "home" | "projects" | "player" | "information";
type ProjectViewMode = "list" | "grid";
type PlayerViewMode = "video" | "gallery" | "info" | "showreel";
type Filter = "all" | ColouristProject["type"];
type Breakpoint =
  | ""
  | "mobile"
  | "tabletPortrait"
  | "tabletMedium"
  | "tabletLandscape"
  | "laptop"
  | "desktop";
type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

export type ColouristReelView = "home" | "projects" | "grid" | "information";

interface RootContextValue {
  rootRef: RefObject<HTMLDivElement | null>;
  url: (path: string) => string;
}

const RootContext = createContext<RootContextValue | null>(null);

function useRoot() {
  const ctx = useContext(RootContext);
  if (!ctx) throw new Error("ColouristReelPage parts must render inside it");
  return ctx;
}

/** Leading + trailing throttle with `cancel`, matching lodash.throttle. */
function throttle<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;
  const invoke = (args: A) => {
    last = Date.now();
    fn(...args);
  };
  const throttled = (...args: A) => {
    const remaining = wait - (Date.now() - last);
    if (remaining <= 0 || remaining > wait) {
      if (timer) clearTimeout(timer);
      timer = undefined;
      invoke(args);
      return;
    }
    pending = args;
    timer ??= setTimeout(() => {
      timer = undefined;
      if (pending) invoke(pending);
      pending = undefined;
    }, remaining);
  };
  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };
  return throttled;
}

/** The source's breakpoint hook, gaps between ranges included. */
function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("");
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 550) setBp("mobile");
      if (w > 551 && w < 768) setBp("tabletPortrait");
      if (w > 769 && w < 1124) setBp("tabletMedium");
      if (w > 1125 && w < 1440) setBp("tabletLandscape");
      if (w > 1441 && w < 1679) setBp("laptop");
      if (w > 1680) setBp("desktop");
    };
    window.addEventListener("resize", update);
    update();
    return () => window.removeEventListener("resize", update);
  }, []);
  return bp;
}

const isSmall = (bp: Breakpoint) => bp === "mobile" || bp === "tabletPortrait";

const isSafariUA = () =>
  typeof navigator !== "undefined" &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const formatClock = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

/** Stands in for the source's em dash separators. */
const Dash = () => <span className="cr-dash" aria-hidden="true" />;

function Timezone({ timezone }: { timezone: string }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const tz = (() => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return timezone;
    } catch {
      return "Asia/Kolkata";
    }
  })();
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!mounted)
    return (
      <div className="cr-tz" suppressHydrationWarning>
        {formatClock(new Date(), tz)}
      </div>
    );
  const zone =
    new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return (
    <div className="cr-tz" suppressHydrationWarning>
      {formatClock(now, tz)} {zone}
    </div>
  );
}

const pageVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut", delay: 0.3 },
  },
};

const fadeVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
};

function Description({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <p>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

function InfoScreen({
  site,
  isActive,
}: {
  site: ColouristSite;
  isActive: boolean;
}) {
  const { url } = useRoot();
  const logos = site.featuredLogos;
  return (
    <motion.section
      className="cr-info-screen"
      variants={pageVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      style={{
        zIndex: isActive ? 20 : 1,
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <div
        className="cr-info-inner"
        style={{ pointerEvents: isActive ? "auto" : "none" }}
      >
        <div className="cr-info-top">
          {site.instagramUrl ? (
            <motion.div className="cr-info-cell type-small">
              <a href={site.instagramUrl} target="_blank" rel="noreferrer">
                {site.instagramHandle}
              </a>
            </motion.div>
          ) : null}
          {site.email ? (
            <motion.div className="cr-info-cell type-small">
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </motion.div>
          ) : null}
        </div>
        {site.description ? (
          <div className="cr-info-desc type-small">
            <Description text={site.description} />
          </div>
        ) : null}
        {site.timezone && site.location ? (
          <div className="cr-info-tzrow type-small">
            <span>
              {site.location} <Dash />{" "}
            </span>
            <Timezone timezone={site.timezone} />
          </div>
        ) : null}
        {logos.length > 0 ? (
          <div className="cr-info-logos">
            {logos.map((src) => (
              <img
                key={src}
                className="cr-info-logo"
                src={url(src)}
                alt="Featured logo"
              />
            ))}
          </div>
        ) : null}
        <div className="cr-info-footer">
          <p className="type-small">
            <span>©</span> {new Date().getFullYear()} {site.name}
          </p>
          <p className="type-small">
            Built by{" "}
            <a href={site.builtBy.href} target="_blank" rel="noreferrer">
              {site.builtBy.label}
            </a>
          </p>
        </div>
      </div>
    </motion.section>
  );
}

// Opacity by distance (in slides) from the centre of the list.
const FALLOFF = [1, 0.6, 0.35, 0.2, 0.12, 0.06, 0];
const falloff = (d: number) => {
  if (d >= 6) return 0;
  const i = Math.floor(d);
  const n = FALLOFF[i];
  return n + (FALLOFF[i + 1] - n) * (d - i);
};

interface CarouselProps {
  projects: ColouristProject[];
  activeProject: ColouristProject | null;
  isPlayerMode: boolean;
  playerControlIsActive: boolean;
  activePage: Page;
  isActive: boolean;
  setActiveProject: (p: ColouristProject) => void;
  setActivePage: (p: Page) => void;
}

const carouselVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
};

type EmblaApi = NonNullable<ReturnType<typeof useEmblaCarousel>[1]>;

/** Per-slide distance from the scroll position, loop-aware, in slide units. */
function slideDistances(api: EmblaApi) {
  const engine = api.internalEngine();
  const progress = api.scrollProgress();
  const snaps = api.scrollSnapList();
  const count = snaps.length;
  const out = new Array<number>(count);
  let nearest = Number.POSITIVE_INFINITY;
  let nearestIndex = 0;
  for (let i = 0; i < count; i += 1) {
    let diff = snaps[i] - progress;
    if (engine.options.loop) {
      for (const point of engine.slideLooper.loopPoints) {
        const target = point.target();
        if (i === point.index && target !== 0) {
          const sign = Math.sign(target);
          if (sign === -1) diff = snaps[i] - (1 + progress);
          if (sign === 1) diff = snaps[i] + (1 - progress);
        }
      }
    }
    const d = Math.abs(diff * count);
    out[i] = d;
    if (d < nearest) {
      nearest = d;
      nearestIndex = i;
    }
  }
  return { distances: out, nearestIndex };
}

const ProjectCarousel = memo(function ProjectCarousel({
  projects,
  activeProject,
  isPlayerMode,
  playerControlIsActive,
  activePage,
  isActive,
  setActiveProject,
  setActivePage,
}: CarouselProps) {
  const rafRef = useRef<number | null>(null);
  const centreRef = useRef(0);
  const plugins = useMemo(() => [WheelGesturesPlugin()], []);
  const [emblaRef, api] = useEmblaCarousel(
    {
      loop: true,
      axis: "y",
      startIndex: Math.floor(projects.length / 2),
      dragFree: true,
      align: "center",
      skipSnaps: false,
      containScroll: false,
      watchSlides: false,
    },
    plugins,
  );

  useEffect(() => {
    if (!api || !activeProject) return;
    const i = projects.findIndex((p) => p.slug === activeProject.slug);
    if (i !== -1 && api.selectedScrollSnap() !== i) api.scrollTo(i, true);
  }, [api, activeProject, projects]);

  const paint = useCallback(() => {
    if (!api || !projects.length) return;
    const { distances, nearestIndex } = slideDistances(api);
    centreRef.current = nearestIndex;
    const slides = api.slideNodes();
    for (let i = 0; i < distances.length; i += 1) {
      const slide = slides[i];
      const d = distances[i];
      slide.style.opacity = String(falloff(d));
      slide.style.transform = "none";
      slide.style.pointerEvents = d <= 5 ? "auto" : "none";
      slide.style.willChange = "opacity";
      slide.setAttribute("data-center", String(d < 0.5));
    }
    api.containerNode().style.willChange = "transform";
  }, [api, projects.length]);

  const schedulePaint = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paint();
    });
  }, [paint]);

  // Centre the active project (or the middle row) whenever the list opens.
  useEffect(() => {
    if (!api || !isActive) return;
    let index =
      projects.length % 2 === 0
        ? Math.floor(projects.length / 2) - 1
        : Math.floor(projects.length / 2);
    if (activeProject) {
      const i = projects.findIndex((p) => p.slug === activeProject.slug);
      if (i !== -1) index = i;
    }
    api.scrollTo(index, true);
    setActiveProject(projects[index]);
  }, [api, isActive]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveProject(projects[api.selectedScrollSnap()]);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, projects, setActiveProject]);

  // A release near rest snaps hard; a fling keeps a tenth of its distance.
  useEffect(() => {
    if (!api) return;
    const onPointerUp = (instance: EmblaApi) => {
      const { scrollTo, target, location } = instance.internalEngine();
      const diff = target.get() - location.get();
      const factor = Math.abs(diff) < 0.25 ? 10 : 0.1;
      scrollTo.distance(diff * factor, true);
    };
    api.on("pointerUp", onPointerUp);
    return () => {
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const clamp = () => {
      const {
        limit,
        target,
        location,
        offsetLocation,
        scrollTo,
        translate,
        scrollBody,
      } = api.internalEngine();
      let edge: number | null = null;
      if (limit.reachedMax(target.get())) edge = limit.max;
      if (limit.reachedMin(target.get())) edge = limit.min;
      if (edge !== null) {
        offsetLocation.set(edge);
        location.set(edge);
        target.set(edge);
        translate.to(edge);
        translate.toggleActive(false);
        // biome-ignore lint/correctness/useHookAtTopLevel: embla engine setter, not a React hook
        scrollBody.useDuration(0).useFriction(0);
        scrollTo.distance(0, false);
      } else {
        translate.toggleActive(true);
      }
    };
    paint();
    api.on("scroll", clamp);
    api.on("scroll", schedulePaint);
    api.on("reInit", paint);
    return () => {
      api.off("scroll", clamp);
      api.off("scroll", schedulePaint);
      api.off("reInit", paint);
    };
  }, [api, paint, schedulePaint]);

  const bp = useBreakpoint();
  const small = isSmall(bp);
  const onSlideClick = useCallback(
    (i: number) => {
      if (!api) return;
      api.scrollTo(i);
      setActiveProject(projects[i]);
      if (!small) setActivePage("player");
    },
    [api, small, setActivePage, setActiveProject, projects],
  );

  return (
    <div className="cr-carousel">
      <motion.div
        ref={emblaRef}
        className={isActive ? "cr-embla-pe-on" : "cr-embla-pe-off"}
        variants={carouselVariants}
        initial="hidden"
        animate={
          activePage !== "player" || playerControlIsActive
            ? "visible"
            : "hidden"
        }
      >
        <div className="cr-embla-container">
          {projects.map((p, i) => (
            <div
              key={`${p.slug}-${i}`}
              className="cr-slide cr-slide-desktop"
              onClick={() => onSlideClick(i)}
            >
              <div className="cr-tile-slot tile-slot">
                <motion.div
                  className="cr-tile"
                  data-tile
                  style={{
                    background: p.tileColor || "var(--colour-off-white)",
                  }}
                />
              </div>
              <motion.div
                className="cr-slide-content"
                style={
                  {
                    "--cr-slide-colour": isPlayerMode
                      ? "var(--colour-white)"
                      : "var(--colour-off-black)",
                  } as CSSVars
                }
              >
                {p.client ? <span>{p.client}</span> : null}
                {p.title ? (
                  <span className="project-title">{p.title}</span>
                ) : null}
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

const mobileCarouselVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut", delay: 0.5 },
  },
};

const MobileProjectCarousel = memo(function MobileProjectCarousel({
  projects,
  activeProject,
  isPlayerMode,
  activePage,
  isActive,
  setActiveProject,
  setActivePage,
}: CarouselProps) {
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const [emblaRef, api] = useEmblaCarousel({
    loop: true,
    axis: "y",
    startIndex: Math.floor(projects.length / 2),
    dragFree: true,
    align: "center",
    skipSnaps: false,
    containScroll: false,
    watchSlides: false,
  });

  useEffect(() => {
    if (!api || !activeProject) return;
    const i = projects.findIndex((p) => p.slug === activeProject.slug);
    if (i !== -1 && api.selectedScrollSnap() !== i) api.scrollTo(i, true);
  }, [api, activeProject, projects]);

  const paint = useCallback(() => {
    if (!api || !projects.length) return;
    const { distances } = slideDistances(api);
    const slides = api.slideNodes();
    for (let i = 0; i < distances.length; i += 1) {
      const slide = slides[i];
      const d = distances[i];
      slide.style.opacity = String(falloff(d));
      slide.style.transform = "none";
      slide.style.willChange = "opacity";
      slide.setAttribute("data-center", String(d < 0.5));
    }
    api.containerNode().style.willChange = "transform";
  }, [api, projects.length]);

  const schedulePaint = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paint();
    });
  }, [paint]);

  useEffect(() => {
    if (!api || !isActive) return;
    paint();
    api.on("scroll", schedulePaint);
    api.on("reInit", paint);
    return () => {
      api.off("scroll", schedulePaint);
      api.off("reInit", paint);
    };
  }, [api, paint, schedulePaint, isActive]);

  useEffect(() => {
    if (!api || !projects.length || !isActive || activeProject) return;
    setActiveProject(projects[Math.floor(projects.length / 2)]);
  }, [api, projects, setActiveProject, isActive, activeProject]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSlideClick = useCallback(
    (i: number) => {
      if (!api || !isActive) return;
      if (api.selectedScrollSnap() === i) {
        setActivePage("player");
        return;
      }
      api.scrollTo(i);
      setActiveProject(projects[i]);
    },
    [api, setActivePage, setActiveProject, projects, isActive],
  );

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveProject(projects[api.selectedScrollSnap()]);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, projects, setActiveProject]);

  return (
    <div className="cr-mcarousel performance">
      {mounted ? (
        <motion.div
          ref={emblaRef}
          variants={mobileCarouselVariants}
          initial="hidden"
          animate={activePage !== "player" ? "visible" : "hidden"}
          style={{ pointerEvents: activePage === "projects" ? "auto" : "none" }}
        >
          <div className="cr-embla-container">
            {projects.map((p, i) => (
              <div
                key={`${p.slug}-${i}`}
                className="cr-slide"
                onClick={() => onSlideClick(i)}
              >
                <div className="tile-slot">
                  <motion.div
                    className="cr-tile"
                    data-tile
                    style={{
                      background: p.tileColor || "var(--colour-off-white)",
                    }}
                  />
                </div>
                <motion.div
                  className="cr-mslide-content"
                  layout
                  transition={{ duration: 0.1 }}
                  style={
                    {
                      "--cr-slide-colour": isPlayerMode
                        ? "var(--colour-white)"
                        : "var(--colour-off-black)",
                    } as CSSVars
                  }
                >
                  {p.client ? <span>{p.client}</span> : null}
                  {p.title ? (
                    <span className="project-title">{p.title}</span>
                  ) : null}
                </motion.div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
});

function ProjectGridCard({
  project,
  isPriority,
  isHovered,
  setActiveProject,
  setActivePage,
  setIsHovered,
}: {
  project: ColouristProject;
  isPriority: boolean;
  isHovered: boolean;
  setActiveProject: (p: ColouristProject) => void;
  setActivePage: (p: Page) => void;
  setIsHovered: (hovered: boolean) => void;
}) {
  const { url } = useRoot();
  return (
    <div
      className="cr-grid-card"
      onClick={() => {
        setActiveProject(project);
        setActivePage("player");
      }}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className="cr-grid-media">
        <div className="cr-grid-media-inner">
          {project.poster ? (
            <img
              src={url(project.poster)}
              alt={`${project.title} - ${project.client}`}
              loading={isPriority ? "eager" : "lazy"}
              decoding="async"
            />
          ) : null}
          <AnimatePresence>
            {isHovered && project.video ? (
              <motion.div
                key="video"
                className="cr-grid-media-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <video
                  src={url(project.video)}
                  poster={url(project.poster)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <div>
        <p className="cr-grid-title type-small">
          {project.title ? <span>{project.title}</span> : null}
          {project.client ? <span>{project.client}</span> : null}
        </p>
        {project.type ? (
          <p className="cr-grid-type type-small">{project.type}</p>
        ) : null}
      </div>
    </div>
  );
}

const ProjectGrid = memo(function ProjectGrid({
  projects,
  isPlayerMode,
  isActive,
  useDelay,
  setActiveProject,
  setActivePage,
}: {
  projects: ColouristProject[];
  isPlayerMode: boolean;
  isActive: boolean;
  useDelay: boolean;
  setActiveProject: (p: ColouristProject) => void;
  setActivePage: (p: Page) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoverSetter = useCallback(
    (slug: string) => (on: boolean) => setHovered(on ? slug : null),
    [],
  );
  return (
    <div
      className="cr-grid"
      style={{
        pointerEvents: isPlayerMode ? "none" : isActive ? "all" : "none",
        opacity: isPlayerMode ? 0 : 1,
        transform: isPlayerMode ? "scale(0.98)" : "scale(1)",
        filter: isPlayerMode ? "blur(10px)" : "blur(0px)",
        transitionDelay: useDelay ? "500ms" : "0ms",
      }}
    >
      {projects.length > 0 ? (
        <div className="cr-grid-pad">
          <div className="cr-lgrid layout-grid">
            {projects.map((p, i) => (
              <ProjectGridCard
                key={p.slug}
                project={p}
                isHovered={hovered === p.slug}
                isPriority={i < 3}
                setActiveProject={setActiveProject}
                setActivePage={setActivePage}
                setIsHovered={hoverSetter(p.slug)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "commercial", label: "Commercial" },
  { id: "music", label: "Music" },
  { id: "narrative", label: "Narrative" },
];

function ProjectFilters({
  activeFilter,
  isPlayerMode,
  setActiveFilter,
}: {
  activeFilter: Filter;
  isPlayerMode: boolean;
  setActiveFilter: (f: Filter) => void;
}) {
  return (
    <div
      className="cr-filters"
      style={{
        pointerEvents: isPlayerMode ? "none" : "auto",
        opacity: isPlayerMode ? 0 : 1,
      }}
    >
      {FILTERS.map(({ id, label }) => {
        const active = activeFilter === id;
        return (
          <button
            key={id}
            type="button"
            className="cr-filter"
            style={{ pointerEvents: active ? "none" : "auto" }}
            onClick={() => setActiveFilter(id)}
          >
            <span
              style={{
                color: active
                  ? "var(--colour-mid-grey)"
                  : "var(--colour-light-grey)",
              }}
            >
              {label}
            </span>
            {active ? (
              <motion.div className="cr-tile-bg" layoutId="filter-tile-bg" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

const listVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
};

const gridVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(5px)",
    y: 15,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.5, ease: "easeInOut", delay: 0.75 },
  },
};

const ProjectsScreen = memo(function ProjectsScreen({
  projects,
  isActive,
  activeProject,
  activePage,
  playerControlIsActive,
  projectViewMode,
  playerViewMode,
  setActiveProject,
  setActivePage,
}: {
  projects: ColouristProject[];
  isActive: boolean;
  activeProject: ColouristProject | null;
  activePage: Page;
  playerControlIsActive: boolean;
  projectViewMode: ProjectViewMode;
  playerViewMode: PlayerViewMode;
  setActiveProject: (p: ColouristProject) => void;
  setActivePage: (p: Page) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [filtered, setFiltered] = useState(projects);
  const [isFiltering, setIsFiltering] = useState(false);
  const hasProjects = projects.length > 0;
  const isPlayer = activePage === "player";
  const isList = projectViewMode === "list";
  const isGrid = projectViewMode === "grid";
  const small = isSmall(useBreakpoint());
  const listKey = filtered.map((p) => p.slug).join("|");

  // Fade out, swap the filtered set after 300ms, fade back in.
  useEffect(() => {
    setIsFiltering(true);
    const id = setTimeout(() => {
      setFiltered(
        filter === "all" ? projects : projects.filter((p) => p.type === filter),
      );
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(id);
  }, [filter, projects]);

  const listActive =
    isActive && playerViewMode === "video" && (isList || (isGrid && isPlayer));

  return (
    <motion.section
      className="cr-projects"
      variants={pageVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      style={{ zIndex: isActive ? 50 : 1 }}
    >
      <ProjectFilters
        isPlayerMode={isPlayer}
        activeFilter={filter}
        setActiveFilter={setFilter}
      />
      <div
        className="cr-projects-inner projects-screen"
        style={{
          opacity: hasProjects && !isFiltering ? 1 : 0,
          pointerEvents: hasProjects && !isFiltering ? "auto" : "none",
        }}
      >
        <motion.div
          className="cr-list"
          variants={listVariants}
          initial="hidden"
          animate={listActive ? "visible" : "hidden"}
          style={{
            zIndex: listActive ? 20 : 1,
            pointerEvents: listActive ? "auto" : "none",
          }}
        >
          {!small ? (
            <ProjectCarousel
              key={listKey}
              projects={filtered}
              activeProject={activeProject}
              isPlayerMode={isPlayer}
              activePage={activePage}
              playerControlIsActive={playerControlIsActive}
              isActive={listActive}
              setActiveProject={setActiveProject}
              setActivePage={setActivePage}
            />
          ) : null}
          {small ? (
            <MobileProjectCarousel
              key={listKey}
              projects={filtered}
              activeProject={activeProject}
              isPlayerMode={isPlayer}
              activePage={activePage}
              playerControlIsActive={playerControlIsActive}
              isActive={isActive && !isPlayer}
              setActiveProject={setActiveProject}
              setActivePage={setActivePage}
            />
          ) : null}
        </motion.div>
        <motion.div
          className="cr-gridwrap"
          variants={gridVariants}
          initial="hidden"
          animate={isActive && isGrid ? "visible" : "hidden"}
          style={{
            pointerEvents: isActive && isGrid && !isPlayer ? "auto" : "none",
            zIndex: isActive && isGrid && !isPlayer ? 20 : 1,
            transitionDelay: isGrid && isPlayer ? "500ms" : "0ms",
          }}
        >
          <ProjectGrid
            projects={filtered}
            isPlayerMode={isPlayer}
            isActive={isActive && isGrid}
            useDelay={isGrid && !isPlayer}
            setActiveProject={setActiveProject}
            setActivePage={setActivePage}
          />
        </motion.div>
      </div>
    </motion.section>
  );
});

/** The role word: its hue follows the cursor across the page, 0 to 300deg. */
function ColourTitle({ children }: { children: string }) {
  const { rootRef } = useRoot();
  const [hue, setHue] = useState(0);
  useEffect(() => {
    const onMove = throttle((e: MouseEvent) => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHue(Math.floor(((e.clientX - rect.left) / (rect.width || 1)) * 300));
    }, 100);
    window.addEventListener("mousemove", onMove);
    return () => {
      onMove.cancel();
      window.removeEventListener("mousemove", onMove);
    };
  }, [rootRef]);
  return (
    <span className="cr-colour" style={{ color: `hsl(${hue}deg,70%,50%)` }}>
      {children}
    </span>
  );
}

function HomeScreen({
  site,
  isPlayerMode,
  isActive,
}: {
  site: ColouristSite;
  isPlayerMode: boolean;
  isActive: boolean;
}) {
  return (
    <motion.section
      className="cr-home"
      variants={pageVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      style={{ zIndex: isActive ? 2 : 1 }}
    >
      <div
        className="cr-home-content"
        style={{
          opacity: isPlayerMode ? 0 : 1,
          pointerEvents: isActive ? "auto" : "none",
        }}
      >
        <h1 className="cr-home-title">
          A <ColourTitle>{site.role}</ColourTitle> {site.titleSuffix}
        </h1>
        <p className="cr-home-sub">{site.subTitle}</p>
      </div>
    </motion.section>
  );
}

function MainNavButton({
  title,
  hint,
  onClick,
  alignHintLeft = false,
}: {
  title: string;
  hint: string;
  onClick: () => void;
  alignHintLeft?: boolean;
}) {
  return (
    <button
      type="button"
      className="cr-navbtn tile-button"
      data-left={alignHintLeft}
      onClick={onClick}
    >
      {title}
      <p className="cr-navhint hint" data-left={alignHintLeft}>
        {hint}
      </p>
    </button>
  );
}

function EscButton({
  activePage,
  alignHintLeft = false,
  useDarkMode = false,
  setActivePage,
  setPlayerViewMode,
}: {
  activePage: Page;
  alignHintLeft?: boolean;
  useDarkMode?: boolean;
  setActivePage: (p: Page) => void;
  setPlayerViewMode?: (m: PlayerViewMode) => void;
}) {
  const back = useCallback(() => {
    if (activePage === "player") setActivePage("projects");
    else if (activePage === "projects") setActivePage("home");
    else if (activePage === "home" && setPlayerViewMode)
      setPlayerViewMode("video");
    else setActivePage("home");
  }, [activePage, setActivePage, setPlayerViewMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back]);

  return (
    <button
      type="button"
      className="cr-esc tile-button"
      data-dark={useDarkMode}
      data-left={alignHintLeft}
      onClick={back}
    >
      esc
      <p
        className="cr-eschint hint"
        data-dark={useDarkMode}
        data-left={alignHintLeft}
      >
        Escape
      </p>
    </button>
  );
}

const layoutStyle = (isActive: boolean): React.CSSProperties => ({
  pointerEvents: isActive ? "auto" : "none",
  zIndex: isActive ? 2 : 1,
});

function HomeLayout({
  playerViewMode,
  isActive,
  setActivePage,
  setPlayerViewMode,
}: {
  playerViewMode: PlayerViewMode;
  isActive: boolean;
  setActivePage: (p: Page) => void;
  setPlayerViewMode: (m: PlayerViewMode) => void;
}) {
  const small = isSmall(useBreakpoint());
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      const key = e.key.toLowerCase();
      if (key === "p") setActivePage("projects");
      else if (key === "i") setActivePage("information");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, setActivePage]);

  return (
    <motion.div
      className="cr-layout cr-layout-gap"
      variants={fadeVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      style={layoutStyle(isActive)}
    >
      {playerViewMode === "showreel" ? (
        <EscButton
          activePage="home"
          useDarkMode
          setActivePage={setActivePage}
          setPlayerViewMode={setPlayerViewMode}
        />
      ) : (
        <>
          <MainNavButton
            title={small ? "Projects" : "P"}
            hint="Projects"
            onClick={() => setActivePage("projects")}
          />
          <MainNavButton
            title={small ? "Info" : "I"}
            hint="Info"
            alignHintLeft
            onClick={() => setActivePage("information")}
          />
        </>
      )}
    </motion.div>
  );
}

const iconStroke = {
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const ListIcon = () => (
  <svg
    width="14"
    height="10"
    viewBox="0 0 14 10"
    fill="none"
    aria-hidden="true"
  >
    <path d="M0.5 5H13.5" stroke="var(--colour-off-black)" {...iconStroke} />
    <path
      d="M0.5 9.33325H13.5"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
    <path
      d="M0.5 0.666626H13.5"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
  </svg>
);

const GridIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path d="M7 0.5V13.5" stroke="var(--colour-off-black)" {...iconStroke} />
    <path d="M0.5 7H13.5" stroke="var(--colour-off-black)" {...iconStroke} />
    <path
      d="M12.0556 0.5H1.94444C1.1467 0.5 0.5 1.1467 0.5 1.94444V12.0556C0.5 12.8533 1.1467 13.5 1.94444 13.5H12.0556C12.8533 13.5 13.5 12.8533 13.5 12.0556V1.94444C13.5 1.1467 12.8533 0.5 12.0556 0.5Z"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
  </svg>
);

const VideoIcon = () => (
  <svg
    width="14"
    height="10"
    viewBox="0 0 14 10"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9.59961 5.65019L12.995 7.91386C13.0439 7.94643 13.1008 7.96512 13.1595 7.96793C13.2183 7.97074 13.2766 7.95756 13.3285 7.92981C13.3803 7.90206 13.4236 7.86077 13.4539 7.81033C13.4841 7.7599 13.5001 7.70221 13.5001 7.64341V2.31514C13.5001 2.25795 13.485 2.20176 13.4564 2.15225C13.4278 2.10275 13.3866 2.06168 13.337 2.03319C13.2874 2.0047 13.2311 1.9898 13.174 1.98999C13.1168 1.99019 13.0606 2.00547 13.0112 2.03429L9.59961 4.02492"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
    <path
      d="M8.30098 1.09937H1.80016C1.0821 1.09937 0.5 1.68149 0.5 2.39958V7.60043C0.5 8.31852 1.0821 8.90064 1.80016 8.90064H8.30098C9.01904 8.90064 9.60114 8.31852 9.60114 7.60043V2.39958C9.60114 1.68149 9.01904 1.09937 8.30098 1.09937Z"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
  </svg>
);

const GalleryIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M11.6666 0.999634H2.33333C1.59695 0.999634 1 1.59662 1 2.33304V11.6669C1 12.4033 1.59695 13.0003 2.33333 13.0003H11.6666C12.403 13.0003 12.9999 12.4033 12.9999 11.6669V2.33304C12.9999 1.59662 12.403 0.999634 11.6666 0.999634Z"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
    <path
      d="M5 5.99986C5.55228 5.99986 5.99999 5.55212 5.99999 4.99981C5.99999 4.4475 5.55228 3.99976 5 3.99976C4.44771 3.99976 4 4.4475 4 4.99981C4 5.55212 4.44771 5.99986 5 5.99986Z"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
    <path
      d="M13 9.27787L10.9426 7.36329C10.6926 7.13068 10.3535 7 9.99997 7C9.64642 7 9.30734 7.13068 9.0573 7.36329L3 13.0003"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
    <path d="M7 9.4V7" stroke="var(--colour-off-black)" {...iconStroke} />
    <path
      d="M7 4.59998H7.006"
      stroke="var(--colour-off-black)"
      {...iconStroke}
    />
  </svg>
);

function ViewButton({
  active,
  dark,
  hint,
  onClick,
  children,
}: {
  active: boolean;
  dark: boolean;
  hint: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const idle = dark ? "var(--colour-off-white)" : "var(--colour-light-grey)";
  return (
    <button
      type="button"
      aria-label={hint}
      className={`cr-view ${dark ? "cr-view-dark" : "cr-view-light"}`}
      style={
        {
          pointerEvents: active ? "none" : "auto",
          "--cr-view-stroke": active ? "var(--colour-off-black)" : idle,
        } as CSSVars
      }
      onClick={onClick}
    >
      {children}
      <p className="cr-viewhint hint">{hint}</p>
      {active ? <motion.div className="cr-tile-bg" layoutId="tile-bg" /> : null}
    </button>
  );
}

function ProjectLayout({
  activePage,
  projectViewMode,
  isActive,
  setActivePage,
  setProjectViewMode,
}: {
  activePage: Page;
  projectViewMode: ProjectViewMode;
  isActive: boolean;
  setActivePage: (p: Page) => void;
  setProjectViewMode: (m: ProjectViewMode) => void;
}) {
  return (
    <motion.div
      className="cr-layout"
      variants={fadeVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      style={layoutStyle(isActive)}
    >
      <EscButton activePage={activePage} setActivePage={setActivePage} />
      <div className="cr-views">
        <ViewButton
          active={projectViewMode === "list"}
          dark={false}
          hint="List"
          onClick={() => setProjectViewMode("list")}
        >
          <ListIcon />
        </ViewButton>
        <ViewButton
          active={projectViewMode === "grid"}
          dark={false}
          hint="Grid"
          onClick={() => setProjectViewMode("grid")}
        >
          <GridIcon />
        </ViewButton>
      </div>
    </motion.div>
  );
}

function PlayerLayout({
  activePage,
  playerViewMode,
  isActive,
  setActivePage,
  setPlayerViewMode,
}: {
  activePage: Page;
  playerViewMode: PlayerViewMode;
  isActive: boolean;
  setActivePage: (p: Page) => void;
  setPlayerViewMode: (m: PlayerViewMode) => void;
}) {
  return (
    <motion.div
      className="cr-layout cr-layout-gap"
      variants={fadeVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      style={layoutStyle(isActive)}
    >
      <EscButton
        activePage={activePage}
        useDarkMode
        setActivePage={setActivePage}
      />
      <div className="cr-views">
        <ViewButton
          active={playerViewMode === "video"}
          dark
          hint="Video"
          onClick={() => setPlayerViewMode("video")}
        >
          <VideoIcon />
        </ViewButton>
        <ViewButton
          active={playerViewMode === "gallery"}
          dark
          hint="Gallery"
          onClick={() => setPlayerViewMode("gallery")}
        >
          <GalleryIcon />
        </ViewButton>
        <ViewButton
          active={playerViewMode === "info"}
          dark
          hint="Info"
          onClick={() => setPlayerViewMode("info")}
        >
          <InfoIcon />
        </ViewButton>
      </div>
    </motion.div>
  );
}

function InfoLayout({
  activePage,
  isActive,
  setActivePage,
}: {
  activePage: Page;
  isActive: boolean;
  setActivePage: (p: Page) => void;
}) {
  return (
    <motion.div
      className="cr-layout cr-layout-info cr-layout-gap"
      variants={fadeVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      style={layoutStyle(isActive)}
    >
      <EscButton
        activePage={activePage}
        alignHintLeft
        setActivePage={setActivePage}
      />
    </motion.div>
  );
}

function Header({
  activePage,
  projectViewMode,
  playerViewMode,
  playerControlIsActive,
  setActivePage,
  setProjectViewMode,
  setPlayerViewMode,
}: {
  activePage: Page;
  projectViewMode: ProjectViewMode;
  playerViewMode: PlayerViewMode;
  playerControlIsActive: boolean;
  setActivePage: (p: Page) => void;
  setProjectViewMode: (m: ProjectViewMode) => void;
  setPlayerViewMode: (m: PlayerViewMode) => void;
}) {
  const small = isSmall(useBreakpoint());
  return (
    <header className="cr-header">
      <HomeLayout
        playerViewMode={playerViewMode}
        isActive={activePage === "home"}
        setActivePage={setActivePage}
        setPlayerViewMode={setPlayerViewMode}
      />
      <InfoLayout
        activePage={activePage}
        isActive={activePage === "information"}
        setActivePage={setActivePage}
      />
      <ProjectLayout
        activePage={activePage}
        projectViewMode={projectViewMode}
        isActive={activePage === "projects"}
        setActivePage={setActivePage}
        setProjectViewMode={setProjectViewMode}
      />
      <PlayerLayout
        activePage={activePage}
        playerViewMode={playerViewMode}
        isActive={
          (activePage === "player" && playerControlIsActive) ||
          (small && activePage === "player")
        }
        setActivePage={setActivePage}
        setPlayerViewMode={setPlayerViewMode}
      />
    </header>
  );
}

function Logo({
  site,
  activePage,
  playerViewMode,
  setActivePage,
}: {
  site: ColouristSite;
  activePage: Page;
  playerViewMode: PlayerViewMode;
  setActivePage: (p: Page) => void;
}) {
  const [open, setOpen] = useState(false);
  const small = isSmall(useBreakpoint());
  const isActive =
    activePage !== "player" &&
    playerViewMode !== "showreel" &&
    activePage !== "projects";
  return (
    <motion.div
      className="cr-logo type-p"
      onMouseOver={() => {
        if (!small) setOpen(true);
      }}
      onMouseOut={() => {
        if (!small) setOpen(false);
      }}
      style={
        {
          "--cr-logo-op": isActive ? 1 : 0,
          "--cr-logo-pe": isActive ? "auto" : "none",
        } as CSSVars
      }
    >
      <AnimatePresence initial={false}>
        <motion.div key="logo" className="cr-logo-cell" layout>
          <button
            type="button"
            className="cr-logo-btn"
            onClick={() => setActivePage("home")}
          >
            {site.name}
          </button>
        </motion.div>
        {open ? (
          <motion.div
            key="info-container"
            className="cr-logo-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            layout
          >
            <div>
              <Dash />
            </div>
            {site.email ? (
              <motion.div key="email" className="cr-logo-cell">
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </motion.div>
            ) : null}
            <div>
              <Dash />
            </div>
            {site.instagramUrl ? (
              <motion.div key="instagram" className="cr-logo-cell">
                <a href={site.instagramUrl} target="_blank" rel="noreferrer">
                  {site.instagramHandle}
                </a>
              </motion.div>
            ) : null}
            <div>
              <Dash />
            </div>
            <motion.div key="timezone" className="cr-logo-cell">
              <Timezone timezone={site.timezone} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

const MutedIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M9.59961 5.05005C9.92741 5.48704 10.1398 5.99963 10.217 6.54041"
      stroke="var(--colour-off-white)"
      {...iconStroke}
    />
    <path
      d="M11.7852 2.86365C12.6164 3.69447 13.1781 4.75644 13.3971 5.91115C13.6161 7.06587 13.4822 8.25977 13.0129 9.33728"
      stroke="var(--colour-off-white)"
      {...iconStroke}
    />
    <path
      d="M0.5 0.500366L13.4986 13.4996"
      stroke="var(--colour-off-white)"
      {...iconStroke}
    />
    <path
      d="M3.74966 3.75024L3.36815 4.13177C3.28327 4.21716 3.18229 4.28486 3.07106 4.33094C2.95983 4.37702 2.84056 4.40056 2.72016 4.40021H1.14993C0.977559 4.40021 0.812246 4.46869 0.69036 4.59058C0.568475 4.71247 0.5 4.87779 0.5 5.05017V8.94995C0.5 9.12233 0.568475 9.28765 0.69036 9.40954C0.812246 9.53143 0.977559 9.59991 1.14993 9.59991H2.72016C2.84056 9.59956 2.95983 9.62311 3.07106 9.66918C3.18229 9.71526 3.28327 9.78296 3.36815 9.86835L5.56686 12.0678C5.63095 12.132 5.71265 12.1758 5.80161 12.1935C5.89058 12.2112 5.98281 12.2022 6.06661 12.1674C6.15041 12.1327 6.22202 12.0739 6.27236 11.9984C6.3227 11.9229 6.34951 11.8342 6.34938 11.7435V6.3501"
      stroke="var(--colour-off-white)"
      {...iconStroke}
    />
    <path
      d="M5.58789 1.91208C5.65021 1.84952 5.7297 1.80687 5.81629 1.78955C5.90287 1.77222 5.99265 1.781 6.07424 1.81477C6.15583 1.84853 6.22556 1.90577 6.27458 1.97921C6.32361 2.05266 6.34972 2.13901 6.34961 2.22731V2.67319"
      stroke="var(--colour-off-white)"
      {...iconStroke}
    />
  </svg>
);

const UnmutedIcon = () => (
  <svg
    width="14"
    height="12"
    viewBox="0 0 14 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6.35035 1.25545C6.35022 1.16491 6.32327 1.07644 6.27291 1.0012C6.22254 0.925963 6.15102 0.867328 6.06736 0.832698C5.9837 0.798068 5.89166 0.788993 5.80285 0.806621C5.71404 0.824249 5.63244 0.867788 5.56835 0.931744L3.36862 3.13076C3.28373 3.21616 3.18273 3.28386 3.07148 3.32995C2.96024 3.37603 2.84095 3.39958 2.72053 3.39922H1.15004C0.977638 3.39922 0.812298 3.46771 0.690392 3.58961C0.568486 3.71151 0.5 3.87685 0.5 4.04924V7.94937C0.5 8.12176 0.568486 8.2871 0.690392 8.409C0.812298 8.5309 0.977638 8.59939 1.15004 8.59939H2.72053C2.84095 8.59904 2.96024 8.62258 3.07148 8.66867C3.18273 8.71475 3.28373 8.78245 3.36862 8.86785L5.5677 11.0675C5.6318 11.1317 5.71351 11.1755 5.80249 11.1932C5.89147 11.211 5.98372 11.2019 6.06753 11.1671C6.15135 11.1324 6.22297 11.0736 6.27332 10.9981C6.32367 10.9226 6.35048 10.8339 6.35035 10.7432V1.25545Z"
      stroke="var(--colour-off-white)"
      {...iconStroke}
    />
    <path
      d="M9.60156 4.04919C10.0235 4.61177 10.2516 5.29603 10.2516 5.99926C10.2516 6.70248 10.0235 7.38674 9.60156 7.94932"
      stroke="var(--colour-off-white)"
      {...iconStroke}
    />
    <path
      d="M11.7871 10.136C12.3304 9.59277 12.7613 8.94785 13.0553 8.23807C13.3493 7.52828 13.5007 6.76754 13.5007 5.99928C13.5007 5.23102 13.3493 4.47028 13.0553 3.76049C12.7613 3.05071 12.3304 2.40579 11.7871 1.86255"
      stroke="var(--colour-off-white)"
      {...iconStroke}
    />
  </svg>
);

function MuteTrigger({
  isMuted,
  setIsMuted,
}: {
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="cr-mute"
      aria-label={isMuted ? "Unmute" : "Mute"}
      onClick={() => setIsMuted(!isMuted)}
    >
      <AnimatePresence mode="wait">
        {isMuted ? (
          <motion.div
            key="muted-icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MutedIcon />
          </motion.div>
        ) : (
          <motion.div
            key="unmuted-icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <UnmutedIcon />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

const formatTime = (s: number) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(s % 60)
    .toString()
    .padStart(2, "0")}`;

const controlsVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut", delay: 0 },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut", delay: 0.3 },
  },
};

function PlayerControls({
  isMuted,
  currentTime,
  videoLength,
  activePage,
  playerControlIsActive,
  playerViewMode,
  setIsMuted,
  handleSeek,
  setPlayerControlIsActive,
}: {
  isMuted: boolean;
  currentTime: number;
  videoLength: number;
  activePage: Page;
  playerControlIsActive: boolean;
  playerViewMode: PlayerViewMode;
  setIsMuted: (m: boolean) => void;
  handleSeek: (t: number) => void;
  setPlayerControlIsActive: (a: boolean) => void;
}) {
  const { rootRef } = useRoot();

  // Controls show on movement and hide after two idle seconds.
  useEffect(() => {
    if (activePage !== "player" && playerViewMode !== "showreel") {
      setPlayerControlIsActive(false);
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const show = () => setPlayerControlIsActive(true);
    const scheduleHide = () => {
      timer = setTimeout(() => setPlayerControlIsActive(false), 2000);
    };
    show();
    scheduleHide();
    const onActivity = throttle(() => {
      clearTimeout(timer);
      show();
      scheduleHide();
    }, 200);
    root.addEventListener("mousemove", onActivity);
    root.addEventListener("touchstart", onActivity);
    root.addEventListener("touchmove", onActivity);
    return () => {
      root.removeEventListener("mousemove", onActivity);
      root.removeEventListener("touchstart", onActivity);
      root.removeEventListener("touchmove", onActivity);
      onActivity.cancel();
      clearTimeout(timer);
    };
  }, [activePage, playerViewMode]);

  return (
    <AnimatePresence>
      {playerControlIsActive ? (
        <motion.div
          key="controls-wrapper"
          className="cr-controls"
          variants={controlsVariants}
          initial="hidden"
          animate={
            playerControlIsActive &&
            (activePage === "player" || playerViewMode === "showreel")
              ? "visible"
              : "hidden"
          }
          exit="hidden"
        >
          <div className="cr-controls-inner">
            <div className="cr-controls-panel">
              <MuteTrigger isMuted={isMuted} setIsMuted={setIsMuted} />
              <div className="cr-seek">
                <div
                  className="cr-seek-inner"
                  onClick={(e) => {
                    const el = e.currentTarget;
                    const x = e.clientX - el.getBoundingClientRect().left;
                    handleSeek(
                      videoLength ? (x / el.clientWidth) * videoLength : 0,
                    );
                  }}
                >
                  <div className="cr-seek-full" />
                  <div
                    className="cr-seek-current"
                    style={{
                      width: `${videoLength ? (currentTime / videoLength) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="cr-time">
                <span className="type-small">
                  {formatTime(Math.floor(currentTime))}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ShowreelHint({ isActive }: { isActive: boolean }) {
  return (
    <div
      className="cr-hint type-small showreel-hint"
      style={{ "--cr-hint-op": isActive ? 0.3 : 0 } as CSSVars}
    >
      <div className="cr-hint-line" />
    </div>
  );
}

function Player({
  site,
  activeProject,
  activePage,
  playerViewMode,
  playerControlIsActive,
  projectViewMode,
  setActivePage,
  setPlayerControlIsActive,
  setPlayerViewMode,
  blur = 100,
  spread = 1,
}: {
  site: ColouristSite;
  activeProject: ColouristProject | null;
  activePage: Page;
  playerViewMode: PlayerViewMode;
  playerControlIsActive: boolean;
  projectViewMode: ProjectViewMode;
  setActivePage: (p: Page) => void;
  setPlayerControlIsActive: (a: boolean) => void;
  setPlayerViewMode: (m: PlayerViewMode) => void;
  blur?: number;
  spread?: number;
}) {
  const { url } = useRoot();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoLength, setVideoLength] = useState(0);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const lastTime = useRef(0);
  const [isSafari, setIsSafari] = useState(false);
  const isMobile = useBreakpoint() === "mobile";

  useEffect(() => setIsSafari(isSafariUA()), []);

  useEffect(() => {
    if (activePage !== "player") setIsMuted(true);
  }, [activePage, playerViewMode]);

  const src = activeProject?.video ?? site.showreel.video;
  const poster = activeProject?.poster ?? site.showreel.poster;

  useEffect(() => {
    if (video) video.muted = isMuted;
  }, [isMuted, video]);

  useEffect(() => {
    if (!video) return;
    const id = setTimeout(() => {
      video.muted = isMuted;
    }, 100);
    return () => clearTimeout(id);
  }, [activeProject, video, isMuted]);

  useEffect(() => {
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, [video]);

  // Ambient glow: the playing frame drawn at 1/8 size into a canvas that CSS
  // blurs by 100px and saturates, so the reel's colour spills above the peek.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const v = video;
    let raf: number | undefined;
    let interval: number | undefined;
    let painting = false;
    let lastPainted = -1;
    const safari = isSafariUA();
    const posterImg = new Image();
    posterImg.crossOrigin = "anonymous";
    posterImg.src = url(poster);
    let w = 320;
    let h = 180;

    const draw = () => {
      if (painting) return;
      try {
        if (v.readyState < 2 || v.videoWidth === 0 || v.videoHeight === 0)
          return;
        const t = v.currentTime;
        if (!safari && lastPainted === t && v.paused) return;
        painting = true;
        const rect = canvas.getBoundingClientRect();
        if (
          rect.width > 0 &&
          rect.height > 0 &&
          canvas.width > 0 &&
          canvas.height > 0
        ) {
          if (safari && Math.random() < 0.05) {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
          } else {
            ctx.clearRect(0, 0, w, h);
          }
          ctx.drawImage(v, 0, 0, w, h);
          lastPainted = t;
          if (safari) {
            const tf = canvas.style.transform || "translateZ(0)";
            canvas.style.transform = tf.includes("0.001px")
              ? "translateZ(0)"
              : "translateZ(0.001px)";
            void canvas.offsetHeight;
            canvas.style.willChange =
              canvas.style.willChange === "transform"
                ? "transform, opacity"
                : "transform";
          }
        }
      } catch (err) {
        console.warn("Canvas paint error (Safari compatibility):", err);
      } finally {
        painting = false;
      }
      if (!safari && !v.paused && !v.ended) raf = requestAnimationFrame(draw);
    };
    const onMeta = () => {
      if (v.videoWidth > 0 && v.videoHeight > 0) {
        w = Math.max(1, v.videoWidth / 8);
        h = Math.max(1, v.videoHeight / 8);
        canvas.width = w;
        canvas.height = h;
        if (safari) {
          canvas.style.willChange = "transform, opacity";
          canvas.style.transform = "translateZ(0)";
        }
        try {
          if (posterImg.complete && posterImg.naturalWidth > 0)
            ctx.drawImage(posterImg, 0, 0, w, h);
        } catch (err) {
          console.warn("Poster draw error:", err);
        }
      }
    };
    const onPoster = () => {
      try {
        if (posterImg.naturalWidth > 0 && posterImg.naturalHeight > 0)
          ctx.drawImage(posterImg, 0, 0, w, h);
      } catch (err) {
        console.warn("Poster load error:", err);
      }
    };
    const stopInterval = () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
    };
    const onPlay = () => {
      lastPainted = -1;
      if (!safari) {
        draw();
        return;
      }
      if (interval) return;
      interval = window.setInterval(() => {
        if (!v.ended && v.readyState >= 2) {
          draw();
          if (Math.random() < 0.1) {
            const tf = canvas.style.transform || "translateZ(0)";
            canvas.style.transform = tf.includes("0.002px")
              ? "translateZ(0)"
              : "translateZ(0.002px)";
          }
        }
      }, 100);
    };
    const onPause = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = undefined;
      }
      if (safari) stopInterval();
    };
    const onTime = () => {
      if (v.ended) return;
      draw();
      canvas.style.marginTop =
        canvas.style.marginTop === "0.001px" ? "0px" : "0.001px";
    };
    const onPosterError = () => console.warn("Poster load failed");

    posterImg.addEventListener("load", onPoster);
    posterImg.addEventListener("error", onPosterError);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onPlay);
    v.addEventListener("playing", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onPause);
    if (safari) v.addEventListener("timeupdate", onTime);
    if (v.readyState >= 1) onMeta();
    if (!v.paused && v.readyState >= 2) onPlay();

    return () => {
      painting = false;
      if (raf) cancelAnimationFrame(raf);
      stopInterval();
      posterImg.removeEventListener("load", onPoster);
      posterImg.removeEventListener("error", onPosterError);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("playing", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onPause);
      if (safari) v.removeEventListener("timeupdate", onTime);
    };
  }, [video, src]);

  const usePlayer = activePage === "player" || playerViewMode === "showreel";
  const useDelay = projectViewMode === "grid" && activePage === "player";
  const usePeek =
    (activePage === "projects" && projectViewMode === "list") ||
    (activePage === "home" && playerViewMode !== "showreel");

  const open = () => {
    setIsTransitioning(true);
    if (activePage === "projects") setActivePage("player");
    else if (activePage === "home") setPlayerViewMode("showreel");
    setTimeout(() => setIsTransitioning(false), 1500);
  };

  const wrapperVars: CSSVars = {
    "--cr-pl-tf": usePlayer
      ? "translateY(0)"
      : activePage === "home" ||
          (activePage === "projects" && projectViewMode === "list")
        ? "translateY(calc(100cqh - 64px))"
        : "translateY(100cqh)",
    "--cr-pl-delay":
      (useDelay && projectViewMode === "grid") ||
      projectViewMode === "list" ||
      activePage === "home"
        ? "300ms"
        : "0ms",
    "--cr-pl-mbottom":
      activePage === "information" ? "-50%" : usePlayer ? "50%" : "0",
    "--cr-pl-mtf": usePlayer ? "translateY(50%)" : "translateY(0)",
    "--cr-pl-radius": `${usePlayer ? 0 : 10}px`,
  };

  const innerVars: CSSVars = {
    width: usePlayer ? "100cqw" : "80cqw",
    cursor:
      activePage === "projects" || activePage === "home"
        ? "pointer"
        : "default",
    pointerEvents: isTransitioning ? "none" : "auto",
    transitionDelay: useDelay ? "300ms" : "0ms",
    "--cr-pl-hint-hover": usePlayer ? 0 : 0.5,
  };
  if (usePeek) innerVars["--cr-pl-peek"] = "translateY(-32px)";

  return (
    <section className="cr-player" style={wrapperVars}>
      <div
        className="cr-player-inner"
        style={innerVars}
        onClick={open}
        onWheel={(e) => {
          if (!isMobile && e.deltaY < -50) open();
        }}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          document.addEventListener(
            "touchend",
            (end) => {
              if (startY - end.changedTouches[0].clientY > 50) open();
            },
            { once: true },
          );
        }}
      >
        <motion.div
          key={src}
          className="player-motion-wrapper"
          initial={{ opacity: 0, pointerEvents: "none" }}
          animate={{ opacity: 1, pointerEvents: "auto" }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 1 }}
        >
          <div
            className="cr-backdrop"
            style={{
              filter: `brightness(${playerControlIsActive && activePage === "player" ? 0.2 : 1})`,
              transform: `translateY( ${usePlayer ? "calc(50cqh - 50%)" : "0px"} )`,
            }}
          >
            <canvas
              ref={canvasRef}
              width="320"
              height="180"
              className={`cr-ambient${isSafari ? " cr-ambient-safari" : ""}`}
              style={{
                filter: `blur(${blur}px) saturate(1.5)`,
                transform: `scale(${spread}) translateZ(0)`,
                WebkitTransform: `scale(${spread}) translateZ(0)`,
                opacity:
                  activePage !== "player" &&
                  projectViewMode !== "grid" &&
                  playerViewMode !== "showreel"
                    ? 1
                    : 0,
              }}
            />
            {src ? (
              <video
                ref={setVideo}
                className="cr-video"
                src={url(src)}
                poster={url(poster)}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                onLoadedMetadata={(e) =>
                  setVideoLength(e.currentTarget.duration || 0)
                }
                onTimeUpdate={(e) => {
                  const t = e.currentTarget.currentTime;
                  if (Math.abs(t - lastTime.current) > 0.01) {
                    setCurrentTime(t);
                    lastTime.current = t;
                  }
                }}
              />
            ) : null}
          </div>
        </motion.div>
        <ShowreelHint
          isActive={
            playerViewMode !== "showreel" &&
            activePage !== "player" &&
            activePage !== "information" &&
            projectViewMode !== "grid"
          }
        />
      </div>
      <PlayerControls
        isMuted={isMuted}
        currentTime={currentTime}
        videoLength={videoLength}
        playerControlIsActive={playerControlIsActive}
        activePage={activePage}
        playerViewMode={playerViewMode}
        setIsMuted={setIsMuted}
        handleSeek={(t) => {
          if (video) {
            video.currentTime = t;
            setCurrentTime(t);
          }
        }}
        setPlayerControlIsActive={setPlayerControlIsActive}
      />
    </section>
  );
}

/** While an overlay is open, the projects list underneath stops taking input. */
function useLockProjects(isActive: boolean) {
  const { rootRef } = useRoot();
  useEffect(() => {
    const el = rootRef.current?.querySelector<HTMLElement>(".projects-screen");
    if (el) el.style.pointerEvents = isActive ? "none" : "auto";
  }, [isActive, rootRef]);
}

function Gallery({
  isActive,
  project,
}: {
  isActive: boolean;
  project: ColouristProject | null;
}) {
  const { url } = useRoot();
  useLockProjects(isActive);
  const images = project?.gallery ?? [];
  return (
    <motion.section
      className="cr-gallery"
      variants={pageVariants}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      <div className="cr-lwrap layout-wrapper">
        <div className="cr-lgrid layout-grid">
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="cr-gallery-item">
              <div
                className="cr-gallery-outer"
                style={{ paddingTop: `${project?.galleryRatio || "56.25"}%` }}
              >
                <div className="cr-gallery-inner">
                  <img
                    src={url(src)}
                    alt="Gallery"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          ))}
          {images.length === 0 ? <p className="cr-gallery-empty">N/A</p> : null}
        </div>
      </div>
    </motion.section>
  );
}

function ProjectInfo({
  isActive,
  project,
}: {
  isActive: boolean;
  project: ColouristProject | null;
}) {
  useLockProjects(isActive);
  const rows: [string, string][] = project
    ? [
        ["Client", project.client],
        ["Title", project.title],
        ["Year", project.year],
        [
          "Type",
          project.type
            ? project.type.charAt(0).toUpperCase() + project.type.slice(1)
            : "",
        ],
      ]
    : [];
  const credits = project?.credits ?? [];
  return (
    <AnimatePresence>
      {isActive ? (
        <motion.section
          key="info-wrapper"
          className="cr-pinfo"
          initial={{ opacity: 0, pointerEvents: "none" }}
          animate={{ opacity: 1, pointerEvents: "auto" }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.3 }}
        >
          <div className="cr-pinfo-group">
            {rows
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="cr-pinfo-cell">
                  <p className="cr-pinfo-role type-small">{label}</p>
                  <p className="cr-pinfo-title type-small">{value}</p>
                </div>
              ))}
          </div>
          {credits.length > 0 ? (
            <div className="cr-pinfo-group">
              {credits.map((c) => (
                <div key={`${c.role}-${c.title}`} className="cr-pinfo-cell">
                  <p className="cr-pinfo-role type-small">{c.role}</p>
                  {c.link ? (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noreferrer"
                      className="type-small"
                    >
                      {c.title}
                    </a>
                  ) : (
                    <p className="cr-pinfo-title type-small">{c.title}</p>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

const viewState = (view: ColouristReelView) => ({
  page: (view === "grid" ? "projects" : view) as Page,
  mode: (view === "grid" ? "grid" : "list") as ProjectViewMode,
});

export interface ColouristReelPageProps {
  /** Base URL prefixed to every clip, still and the font. */
  assetBase?: string;
  /** Identity, contact and copy. Partial values merge over the BLANK defaults. */
  site?: Partial<ColouristSite>;
  projects?: ColouristProject[];
  /** Screen shown on mount. */
  initialView?: ColouristReelView;
  className?: string;
  style?: React.CSSProperties;
}

export default function ColouristReelPage({
  assetBase = DEFAULT_ASSET_BASE,
  site: siteOverride,
  projects = DEFAULT_PROJECTS,
  initialView = "home",
  className,
  style,
}: ColouristReelPageProps) {
  const site = useMemo(
    () => ({ ...DEFAULT_SITE, ...siteOverride }),
    [siteOverride],
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const base = assetBase.replace(/\/$/, "");
  const ctx = useMemo<RootContextValue>(
    () => ({
      rootRef,
      url: (path: string) =>
        /^(https?:)?\/\//.test(path) ? path : `${base}/${path}`,
    }),
    [base],
  );

  const [activePage, setActivePage] = useState<Page>(
    viewState(initialView).page,
  );
  const [projectViewMode, setProjectViewMode] = useState<ProjectViewMode>(
    viewState(initialView).mode,
  );
  const [activeProject, setActiveProject] = useState<ColouristProject | null>(
    null,
  );
  const [playerViewMode, setPlayerViewMode] = useState<PlayerViewMode>("video");
  const [playerControlIsActive, setPlayerControlIsActive] = useState(false);

  useEffect(() => {
    const next = viewState(initialView);
    setActivePage(next.page);
    setProjectViewMode(next.mode);
  }, [initialView]);

  useEffect(() => {
    if (activePage === "home") {
      setActiveProject(null);
      setPlayerViewMode("video");
    }
    if (activePage === "projects") setPlayerViewMode("video");
  }, [activePage]);

  // Any scroll, swipe or arrow key on home lifts the reel into view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || activePage !== "home" || playerViewMode === "showreel") return;
    let fired = false;
    let startY = 0;
    let startX = 0;
    const KEYS = new Set([
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      "Space",
      " ",
    ]);
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) trigger();
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches?.[0];
      if (t) {
        startY = t.clientY;
        startX = t.clientX;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches?.[0];
      if (!t) return;
      if (
        Math.abs(t.clientY - startY) > 10 ||
        Math.abs(t.clientX - startX) > 10
      )
        trigger();
    };
    const onKey = (e: KeyboardEvent) => {
      if (KEYS.has(e.key)) trigger();
    };
    const detach = () => {
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
    function trigger() {
      if (fired) return;
      fired = true;
      setPlayerViewMode("showreel");
      detach();
    }
    root.addEventListener("wheel", onWheel, { passive: true });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return detach;
  }, [activePage, playerViewMode]);

  const isPlayerMode = activePage === "player" || playerViewMode === "showreel";

  return (
    <RootContext.Provider value={ctx}>
      <LayoutGroup id="colourist-reel-page">
        <div
          ref={rootRef}
          className={`cr-root${className ? ` ${className}` : ""}`}
          data-dark={isPlayerMode}
          style={style}
        >
          <style
            // biome-ignore lint/security/noDangerouslySetInnerHtml: component-scoped stylesheet
            dangerouslySetInnerHTML={{
              __html: getColouristReelPageStyles(base),
            }}
          />
          <Logo
            site={site}
            activePage={activePage}
            playerViewMode={playerViewMode}
            setActivePage={setActivePage}
          />
          <Header
            activePage={activePage}
            projectViewMode={projectViewMode}
            playerViewMode={playerViewMode}
            playerControlIsActive={playerControlIsActive}
            setActivePage={setActivePage}
            setProjectViewMode={setProjectViewMode}
            setPlayerViewMode={setPlayerViewMode}
          />
          <HomeScreen
            site={site}
            isPlayerMode={playerViewMode === "showreel"}
            isActive={activePage === "home"}
          />
          <ProjectsScreen
            projects={projects}
            activeProject={activeProject}
            activePage={activePage}
            playerControlIsActive={playerControlIsActive}
            projectViewMode={projectViewMode}
            playerViewMode={playerViewMode}
            isActive={activePage === "projects" || activePage === "player"}
            setActiveProject={setActiveProject}
            setActivePage={setActivePage}
          />
          <InfoScreen site={site} isActive={activePage === "information"} />
          <Player
            site={site}
            activeProject={activeProject}
            activePage={activePage}
            playerControlIsActive={playerControlIsActive}
            projectViewMode={projectViewMode}
            playerViewMode={playerViewMode}
            setActivePage={setActivePage}
            setPlayerControlIsActive={setPlayerControlIsActive}
            setPlayerViewMode={setPlayerViewMode}
          />
          <Gallery
            isActive={playerViewMode === "gallery" && activePage === "player"}
            project={activeProject}
          />
          <ProjectInfo
            isActive={playerViewMode === "info" && activePage === "player"}
            project={activeProject}
          />
        </div>
      </LayoutGroup>
    </RootContext.Provider>
  );
}

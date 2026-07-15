"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_VIDEO_BASE = "https://ui.aryank.space/assets/film-studio-page";

export interface SidewaysProject {
  title: string;
  director: string;
  client: string;
  video: string;
  poster?: string;
  startAt?: number;
}

export interface DepoluxeSidewaysCarouselProps {
  projects?: SidewaysProject[];
  brand?: [string, string];
  claim?: string;
  nav?: Array<{ label: string; href: string }>;
  className?: string;
}

const DEFAULT_PROJECTS: SidewaysProject[] = [
  {
    title: "New Forms",
    director: "Mara Vale",
    client: "Atelier One",
    video: `${DEFAULT_VIDEO_BASE}/hero/hero-footage.mp4`,
    poster: `${DEFAULT_VIDEO_BASE}/spotlight/spotlight-1.jpg`,
    startAt: 1,
  },
  {
    title: "Soft Current",
    director: "Ivo March",
    client: "North House",
    video: `${DEFAULT_VIDEO_BASE}/contact/contact-hero.mp4`,
    poster: `${DEFAULT_VIDEO_BASE}/spotlight/spotlight-2.jpg`,
    startAt: 5,
  },
  {
    title: "After Light",
    director: "Noa Bell",
    client: "Edition 06",
    video: `${DEFAULT_VIDEO_BASE}/hero/hero-footage.mp4`,
    poster: `${DEFAULT_VIDEO_BASE}/spotlight/spotlight-3.jpg`,
    startAt: 8,
  },
  {
    title: "Open Water",
    director: "Jules Marin",
    client: "Common Ground",
    video: `${DEFAULT_VIDEO_BASE}/contact/contact-hero.mp4`,
    poster: `${DEFAULT_VIDEO_BASE}/spotlight/spotlight-4.jpg`,
    startAt: 12,
  },
  {
    title: "Night Study",
    director: "Aya North",
    client: "Paper Journal",
    video: `${DEFAULT_VIDEO_BASE}/hero/hero-footage.mp4`,
    poster: `${DEFAULT_VIDEO_BASE}/spotlight/spotlight-5.jpg`,
    startAt: 14,
  },
  {
    title: "Field Notes",
    director: "Leon Moss",
    client: "Studio Index",
    video: `${DEFAULT_VIDEO_BASE}/contact/contact-hero.mp4`,
    poster: `${DEFAULT_VIDEO_BASE}/spotlight/spotlight-6.jpg`,
    startAt: 19,
  },
  {
    title: "Low Season",
    director: "Rina Cole",
    client: "Maison Lune",
    video: `${DEFAULT_VIDEO_BASE}/hero/hero-footage.mp4`,
    poster: `${DEFAULT_VIDEO_BASE}/spotlight/spotlight-7.jpg`,
    startAt: 22,
  },
  {
    title: "Second Nature",
    director: "Owen Hart",
    client: "Frame Review",
    video: `${DEFAULT_VIDEO_BASE}/contact/contact-hero.mp4`,
    poster: `${DEFAULT_VIDEO_BASE}/spotlight/spotlight-8.jpg`,
    startAt: 27,
  },
];

const DEFAULT_NAV = [
  { label: "Featured", href: "#featured" },
  { label: "Archive", href: "#archive" },
  { label: "Talent", href: "#talent" },
  { label: "Approach", href: "#approach" },
  { label: "Contact", href: "#contact" },
];

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function wrap(value: number, count: number) {
  return ((value % count) + count) % count;
}

function wrappedDistance(index: number, position: number, count: number) {
  let distance = wrap(index - position, count);
  if (distance > count / 2) distance -= count;
  return distance;
}

function seekVideo(video: HTMLVideoElement, seconds = 0) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return;
  video.currentTime = Math.min(seconds, Math.max(0, video.duration - 0.15));
}

export default function DepoluxeSidewaysCarousel({
  projects = DEFAULT_PROJECTS,
  brand = ["BLANK", "FILMS"],
  claim = "A cinematic practice for image, motion and culture",
  nav = DEFAULT_NAV,
  className = "",
}: DepoluxeSidewaysCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const positionRef = useRef(0);
  const targetRef = useRef(0);
  const focusedRef = useRef(false);
  const hoverFocusRef = useRef(false);
  const scrollFocusRef = useRef(false);
  const dragFocusRef = useRef(false);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const projectCount = projects.length;
  const activeProject = projects[activeIndex] ?? projects[0];

  const syncFocus = useCallback(() => {
    const next =
      hoverFocusRef.current || scrollFocusRef.current || dragFocusRef.current;
    focusedRef.current = next;
    setFocused(next);
  }, []);

  const finishScrollLater = useCallback(() => {
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    endTimerRef.current = setTimeout(() => {
      scrollFocusRef.current = false;
      syncFocus();
    }, 430);
  }, [syncFocus]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || projectCount === 0) return;

    let frame = 0;
    let previousTime = performance.now();
    let width = root.clientWidth;
    let height = root.clientHeight;

    const resizeObserver = new ResizeObserver(() => {
      width = root.clientWidth;
      height = root.clientHeight;
    });
    resizeObserver.observe(root);

    const draw = (time: number) => {
      const deltaTime = Math.min(40, time - previousTime);
      previousTime = time;

      if (!focusedRef.current && !draggingRef.current) {
        targetRef.current += deltaTime * 0.00018;
      }

      const easing = 1 - 0.91 ** (deltaTime / 16.667);
      positionRef.current += (targetRef.current - positionRef.current) * easing;

      const baseSize = Math.max(width * 0.3, height * 0.35);
      const current = wrap(Math.round(positionRef.current), projectCount);
      setActiveIndex((previous) => (previous === current ? previous : current));

      itemRefs.current.forEach((item, index) => {
        if (!item) return;

        const distance = wrappedDistance(
          index,
          positionRef.current,
          projectCount,
        );
        const size = baseSize * 0.5 ** Math.abs(distance);
        let x = 0;
        let y = 0;
        let drawWidth = size;
        let drawHeight = size;

        if (distance <= 0) {
          const stackOffset = baseSize - size;
          x = stackOffset * 2;
          y = height - size;
        } else {
          const stackOffset = baseSize - size;
          y = height - baseSize - stackOffset;
        }

        if (distance >= -1 && distance <= 0) {
          drawWidth += x;
          x = 0;
        } else if (distance >= 0 && distance <= 1) {
          const previousEdge = height - baseSize * 0.5 ** (1 - distance);
          drawHeight -= y + size - previousEdge;
        }

        item.style.width = `${Math.max(1, drawWidth)}px`;
        item.style.height = `${Math.max(1, drawHeight)}px`;
        item.style.opacity = Math.abs(distance) > 3.9 ? "0" : "1";
        item.style.zIndex = String(50 - Math.round(Math.abs(distance) * 5));
        item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      frame = requestAnimationFrame(draw);
    };

    const beginScroll = () => {
      scrollFocusRef.current = true;
      syncFocus();
      finishScrollLater();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;
      targetRef.current += delta / Math.max(520, height * 0.78);
      beginScroll();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      draggingRef.current = true;
      dragFocusRef.current = true;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      root.setPointerCapture(event.pointerId);
      syncFocus();
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      const localX = event.clientX - bounds.left;
      const localY = event.clientY - bounds.top;
      const focusBoundary = width * 0.05 + (width * 0.5 * localY) / height;
      hoverFocusRef.current = localX < focusBoundary;

      if (draggingRef.current) {
        const deltaX = event.clientX - lastPointerRef.current.x;
        const deltaY = event.clientY - lastPointerRef.current.y;
        targetRef.current -=
          (deltaY + deltaX * 0.7) / Math.max(460, height * 0.72);
        lastPointerRef.current = { x: event.clientX, y: event.clientY };
      }

      syncFocus();
    };

    const endDrag = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      dragFocusRef.current = false;
      if (root.hasPointerCapture(event.pointerId)) {
        root.releasePointerCapture(event.pointerId);
      }
      syncFocus();
    };

    const onPointerLeave = () => {
      hoverFocusRef.current = false;
      syncFocus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const direction =
        event.key === "ArrowDown" || event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowUp" || event.key === "ArrowLeft"
            ? -1
            : 0;
      if (!direction) return;
      event.preventDefault();
      targetRef.current += direction;
      beginScroll();
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    root.addEventListener("pointerleave", onPointerLeave);
    root.addEventListener("keydown", onKeyDown);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", endDrag);
      root.removeEventListener("pointercancel", endDrag);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("keydown", onKeyDown);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
  }, [finishScrollLater, projectCount, syncFocus]);

  useEffect(() => {
    cardVideoRefs.current.forEach((video, index) => {
      if (!video) return;
      const distance = Math.abs(
        wrappedDistance(index, activeIndex, projectCount),
      );
      if (focused && distance <= 3) {
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [activeIndex, focused, projectCount]);

  if (!activeProject || projectCount === 0) return null;

  return (
    <div
      aria-label="Infinite cinematic project carousel"
      aria-valuemax={projectCount - 1}
      aria-valuemin={0}
      aria-valuenow={activeIndex}
      aria-valuetext={`${activeProject.title}, ${activeProject.client}`}
      className={`dsc-root${focused ? " is-focused" : ""} ${className}`}
      ref={rootRef}
      role="slider"
      tabIndex={0}
    >
      <style>{styles}</style>

      <div className="dsc-backdrop" aria-hidden="true">
        <video
          autoPlay
          key={`${activeProject.video}-${activeIndex}`}
          loop
          muted
          onLoadedMetadata={(event) => {
            seekVideo(event.currentTarget, activeProject.startAt);
            event.currentTarget.play().catch(() => undefined);
          }}
          playsInline
          poster={activeProject.poster}
          preload="auto"
          src={activeProject.video}
        />
      </div>
      <div className="dsc-shade" aria-hidden="true" />

      <header className="dsc-header">
        <a className="dsc-brand" href="#featured">
          <span>{brand[0]}</span>
          <span>{brand[1]}</span>
        </a>
        <p className="dsc-claim">{claim}</p>
        <nav aria-label="Portfolio">
          {nav.map((item, index) => (
            <a
              className={index === 0 ? "is-active" : ""}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="dsc-idle-copy" aria-live="polite">
        <span className="dsc-idle-index">
          {ROMAN[activeIndex] ?? activeIndex + 1}
        </span>
        <span className="dsc-idle-line" />
        <div className="dsc-idle-center">
          <strong>“{activeProject.title}”</strong>
          <span>{activeProject.director}</span>
        </div>
        <span className="dsc-idle-client">{activeProject.client}</span>
      </div>

      <div className="dsc-stack" aria-hidden={!focused}>
        {projects.map((project, index) => (
          <div
            className="dsc-stack-item"
            key={`${project.title}-${index}`}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
          >
            {index === activeIndex ? (
              <video
                autoPlay
                loop
                muted
                onLoadedMetadata={(event) => {
                  seekVideo(event.currentTarget, project.startAt);
                }}
                playsInline
                poster={project.poster}
                preload="metadata"
                ref={(node) => {
                  cardVideoRefs.current[index] = node;
                }}
                src={project.video}
              />
            ) : (
              <img alt="" draggable={false} src={project.poster} />
            )}
            <span className="dsc-stack-label">
              <b>{ROMAN[index] ?? index + 1}</b>
              <span>{project.client}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
.dsc-root {
  position: relative;
  isolation: isolate;
  contain: layout paint;
  width: 100%;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  color: #f5f1eb;
  background: #160e0e;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif;
  cursor: grab;
  outline: none;
  touch-action: none;
  user-select: none;
}

.dsc-root:active { cursor: grabbing; }
.dsc-root *, .dsc-root *::before, .dsc-root *::after { box-sizing: border-box; }

.dsc-backdrop,
.dsc-shade {
  position: absolute;
  inset: 0;
}

.dsc-backdrop {
  z-index: -3;
  overflow: hidden;
  transform: scale(1.01);
  filter: blur(0);
  transition: transform 200ms cubic-bezier(.55,.06,.68,.19), filter 200ms cubic-bezier(.55,.06,.68,.19);
  will-change: transform, filter;
}

.dsc-backdrop video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dsc-shade {
  z-index: -2;
  background:
    linear-gradient(90deg, rgba(112, 123, 128, .28) 0%, rgba(40, 33, 36, .32) 48%, rgba(68, 17, 9, .38) 100%),
    rgba(8, 5, 5, .14);
  transition: background-color 200ms ease;
}

.dsc-root.is-focused .dsc-backdrop {
  transform: scale(2);
  filter: blur(100px);
}

.dsc-root.is-focused .dsc-shade { background-color: rgba(16, 7, 7, .25); }

.dsc-header {
  position: absolute;
  z-index: 100;
  top: 25px;
  left: 50%;
  width: min(360px, calc(100% - 32px));
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -.015em;
}

.dsc-header a { color: inherit; text-decoration: none; }
.dsc-brand { display: flex; justify-content: space-between; width: 100%; }
.dsc-claim { margin: 17px 0 17px; font-style: italic; white-space: nowrap; }
.dsc-header nav { display: flex; justify-content: space-between; width: 100%; }
.dsc-header nav a { position: relative; }
.dsc-header nav a::after {
  position: absolute;
  right: 0;
  bottom: -4px;
  left: 0;
  height: 1px;
  background: currentColor;
  content: "";
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 220ms ease;
}
.dsc-header nav a:hover::after,
.dsc-header nav a.is-active::after { transform: scaleX(1); transform-origin: left; }

.dsc-idle-copy {
  position: absolute;
  inset: 0;
  z-index: 15;
  font-size: clamp(14px, 1.05vw, 20px);
  transition: opacity 180ms ease, transform 500ms cubic-bezier(.16,1,.3,1);
}

.dsc-idle-index { position: absolute; top: 11.5%; left: 32px; }
.dsc-idle-line {
  position: absolute;
  top: 16.5%;
  bottom: 16.5%;
  left: 32px;
  width: 1px;
  background: rgba(255,255,255,.78);
}
.dsc-idle-center {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 37px;
  align-items: center;
  transform: translate(-50%, -50%);
  text-align: center;
}
.dsc-idle-center strong {
  font-size: clamp(32px, 2.6vw, 52px);
  font-style: italic;
  font-weight: 400;
  line-height: 1;
}
.dsc-idle-client { position: absolute; top: 50%; right: 32px; transform: translateY(-50%); }
.dsc-root.is-focused .dsc-idle-copy { opacity: 0; transform: translateY(-4vh); }

.dsc-stack {
  position: absolute;
  inset: 0;
  z-index: 20;
  opacity: 0;
  transition: opacity 120ms ease;
  pointer-events: none;
}
.dsc-root.is-focused .dsc-stack { opacity: 1; transition-delay: 170ms; }

.dsc-stack-item {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  will-change: width, height, opacity, transform;
}
.dsc-stack-item video,
.dsc-stack-item img {
  display: block;
  width: 100%;
  height: 100%;
  background: #080808;
  object-fit: cover;
}
.dsc-stack-label {
  position: absolute;
  top: 0;
  left: calc(100% + clamp(18px, 1.65vw, 32px));
  display: flex;
  gap: clamp(22px, 2.25vw, 44px);
  align-items: baseline;
  min-width: 280px;
  color: #f5f1eb;
  font-size: clamp(12px, 1.05vw, 20px);
  line-height: 1;
  white-space: nowrap;
}
.dsc-stack-label b { font-weight: 400; }

@media (max-width: 700px) {
  .dsc-root { min-height: 500px; }
  .dsc-header { top: 20px; font-size: 13px; }
  .dsc-claim { margin: 13px 0; overflow: hidden; text-overflow: ellipsis; }
  .dsc-idle-index, .dsc-idle-line { left: 18px; }
  .dsc-idle-client { right: 18px; }
  .dsc-idle-center { gap: 24px; }
  .dsc-stack-label { min-width: 180px; }
}

@media (prefers-reduced-motion: reduce) {
  .dsc-backdrop,
  .dsc-shade,
  .dsc-idle-copy,
  .dsc-stack { transition-duration: 1ms; }
}
`;

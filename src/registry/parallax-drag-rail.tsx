"use client";

/**
 * Parallax Drag Rail - an endless horizontal rail you can wheel or drag. Six
 * copies of the set are laid end to end and the track silently jumps back a
 * full sequence whenever it drifts past the safe band, so the loop never runs
 * out and never visibly seams. Each image is held at 2.25 zoom and slid against
 * its own frame by its distance from center, so cards read as windows onto one
 * continuous scene rather than separate pictures. Captions only appear once the
 * rail is genuinely still, and a real drag suppresses the click so you cannot
 * open a project by throwing the rail.
 *
 * Self-contained: it fills its own box and reads the wheel over itself.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/parallax-drag-rail";

export interface RailSlide {
  title: string;
  img: string;
  url: string;
}

export interface ParallaxDragRailProps {
  brand?: string;
  navLinks?: string[];
  slides?: RailSlide[];
  footerLeft?: string;
  footerRight?: string;
  scrollSpeed?: number;
  lerpFactor?: number;
  maxVelocity?: number;
}

const DEFAULT_SLIDES: RailSlide[] = [
  {
    title: "Echoes of Silence",
    img: `${ASSET_BASE}/slider_img_01.jpg`,
    url: "#",
  },
  { title: "Floral Circuit", img: `${ASSET_BASE}/slider_img_02.jpg`, url: "#" },
  {
    title: "Synthetic Horizon",
    img: `${ASSET_BASE}/slider_img_03.jpg`,
    url: "#",
  },
  {
    title: "Portal Sequence",
    img: `${ASSET_BASE}/slider_img_04.jpg`,
    url: "#",
  },
  {
    title: "Projected Memory",
    img: `${ASSET_BASE}/slider_img_05.jpg`,
    url: "#",
  },
  { title: "Fractured Self", img: `${ASSET_BASE}/slider_img_06.jpg`, url: "#" },
  {
    title: "Moonlit Constructs",
    img: `${ASSET_BASE}/slider_img_07.jpg`,
    url: "#",
  },
  { title: "Fading Room", img: `${ASSET_BASE}/slider_img_08.jpg`, url: "#" },
];

export default function ParallaxDragRail({
  brand = "Glasswake",
  navLinks = ["Work", "Studio", "Contact"],
  slides = DEFAULT_SLIDES,
  footerLeft = "Experiment 0471",
  footerRight = "Built by BLANK",
  scrollSpeed = 1.75,
  lerpFactor = 0.05,
  maxVelocity = 150,
}: ParallaxDragRailProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!slides.length) return;

    const slider = root.querySelector<HTMLElement>(".ihs-slider");
    const track = root.querySelector<HTMLElement>(".ihs-slide-track");
    if (!slider || !track) return;

    const totalSlideCount = slides.length;

    const state = {
      currentX: 0,
      targetX: 0,
      slideWidth: 390,
      slides: [] as HTMLElement[],
      isDragging: false,
      startX: 0,
      lastX: 0,
      lastMouseX: 0,
      lastScrollTime: performance.now(),
      isMoving: false,
      velocity: 0,
      lastCurrentX: 0,
      dragDistance: 0,
      hasActuallyDragged: false,
      isMobile: false,
    };

    let frame = 0;
    let dragReleaseTimer = 0;

    const createSlideElement = (index: number) => {
      const slide = document.createElement("div");
      slide.className = "ihs-slide";

      if (state.isMobile) {
        slide.style.width = "175px";
        slide.style.height = "250px";
      }

      const imageContainer = document.createElement("div");
      imageContainer.className = "ihs-slide-image";

      const dataIndex = index % totalSlideCount;
      const img = document.createElement("img");
      img.src = slides[dataIndex].img;
      img.alt = slides[dataIndex].title;

      const overlay = document.createElement("div");
      overlay.className = "ihs-slide-overlay";

      const title = document.createElement("p");
      title.className = "ihs-project-title";
      title.textContent = slides[dataIndex].title;

      const arrow = document.createElement("div");
      arrow.className = "ihs-project-arrow";
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", "M7 17L17 7M17 7H7M17 7V17");
      svg.appendChild(path);
      arrow.appendChild(svg);

      slide.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.dragDistance < 10 && !state.hasActuallyDragged) {
          const url = slides[dataIndex].url;
          if (url && url !== "#") window.location.href = url;
        }
      });

      overlay.appendChild(title);
      overlay.appendChild(arrow);
      imageContainer.appendChild(img);
      slide.appendChild(imageContainer);
      slide.appendChild(overlay);

      return slide;
    };

    const initializeSlides = () => {
      track.replaceChildren();
      state.slides = [];

      state.isMobile = window.innerWidth < 1000;
      state.slideWidth = state.isMobile ? 215 : 390;

      const copies = 6;
      const totalSlides = totalSlideCount * copies;

      for (let i = 0; i < totalSlides; i++) {
        const slide = createSlideElement(i);
        track.appendChild(slide);
        state.slides.push(slide);
      }

      const startOffset = -(totalSlideCount * state.slideWidth * 2);
      state.currentX = startOffset;
      state.targetX = startOffset;
    };

    const updateSlidePositions = () => {
      const sequenceWidth = state.slideWidth * totalSlideCount;

      if (state.currentX > -sequenceWidth * 1) {
        state.currentX -= sequenceWidth;
        state.targetX -= sequenceWidth;
      } else if (state.currentX < -sequenceWidth * 4) {
        state.currentX += sequenceWidth;
        state.targetX += sequenceWidth;
      }

      track.style.transform = `translate3d(${state.currentX}px, 0, 0)`;
    };

    const updateParallax = () => {
      const rootRect = root.getBoundingClientRect();
      const viewportCenter = rootRect.left + rootRect.width / 2;

      for (const slide of state.slides) {
        const img = slide.querySelector("img");
        if (!img) continue;

        const slideRect = slide.getBoundingClientRect();

        if (
          slideRect.right < rootRect.left - 500 ||
          slideRect.left > rootRect.right + 500
        ) {
          continue;
        }

        const slideCenter = slideRect.left + slideRect.width / 2;
        const distanceFromCenter = slideCenter - viewportCenter;
        const parallaxOffset = distanceFromCenter * -0.25;

        img.style.transform = `translateX(${parallaxOffset}px) scale(2.25)`;
      }
    };

    const updateMovingState = () => {
      state.velocity = Math.abs(state.currentX - state.lastCurrentX);
      state.lastCurrentX = state.currentX;

      const isSlowEnough = state.velocity < 0.1;
      const hasBeenStillLongEnough =
        performance.now() - state.lastScrollTime > 200;
      state.isMoving =
        state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough;

      root.style.setProperty("--ihs-slider-moving", state.isMoving ? "1" : "0");
    };

    const animate = () => {
      state.currentX += (state.targetX - state.currentX) * lerpFactor;

      updateMovingState();
      updateSlidePositions();
      updateParallax();

      frame = requestAnimationFrame(animate);
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault();
      state.lastScrollTime = performance.now();

      const scrollDelta = e.deltaY * scrollSpeed;
      state.targetX -= Math.max(
        Math.min(scrollDelta, maxVelocity),
        -maxVelocity,
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      state.isDragging = true;
      state.startX = e.touches[0].clientX;
      state.lastX = state.targetX;
      state.dragDistance = 0;
      state.hasActuallyDragged = false;
      state.lastScrollTime = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!state.isDragging) return;

      const deltaX = (e.touches[0].clientX - state.startX) * 1.5;
      state.targetX = state.lastX + deltaX;
      state.dragDistance = Math.abs(deltaX);

      if (state.dragDistance > 5) state.hasActuallyDragged = true;

      state.lastScrollTime = performance.now();
    };

    const releaseDrag = () => {
      state.isDragging = false;
      clearTimeout(dragReleaseTimer);
      dragReleaseTimer = window.setTimeout(() => {
        state.hasActuallyDragged = false;
      }, 100);
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      state.isDragging = true;
      state.startX = e.clientX;
      state.lastMouseX = e.clientX;
      state.lastX = state.targetX;
      state.dragDistance = 0;
      state.hasActuallyDragged = false;
      state.lastScrollTime = performance.now();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!state.isDragging) return;

      e.preventDefault();
      const deltaX = (e.clientX - state.lastMouseX) * 2;
      state.targetX += deltaX;
      state.lastMouseX = e.clientX;
      state.dragDistance += Math.abs(deltaX);

      if (state.dragDistance > 5) state.hasActuallyDragged = true;

      state.lastScrollTime = performance.now();
    };

    const handleResize = () => initializeSlides();
    const preventDragStart = (e: Event) => e.preventDefault();

    slider.addEventListener("wheel", handleWheel, { passive: false });
    slider.addEventListener("touchstart", handleTouchStart);
    slider.addEventListener("touchmove", handleTouchMove);
    slider.addEventListener("touchend", releaseDrag);
    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", releaseDrag);
    slider.addEventListener("dragstart", preventDragStart);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", releaseDrag);
    window.addEventListener("resize", handleResize);

    initializeSlides();
    animate();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(dragReleaseTimer);
      slider.removeEventListener("wheel", handleWheel);
      slider.removeEventListener("touchstart", handleTouchStart);
      slider.removeEventListener("touchmove", handleTouchMove);
      slider.removeEventListener("touchend", releaseDrag);
      slider.removeEventListener("mousedown", handleMouseDown);
      slider.removeEventListener("mouseleave", releaseDrag);
      slider.removeEventListener("dragstart", preventDragStart);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", releaseDrag);
      window.removeEventListener("resize", handleResize);
      track.replaceChildren();
    };
  }, [slides, scrollSpeed, lerpFactor, maxVelocity]);

  return (
    <div className="ihs-root" ref={rootRef}>
      <style>{styles}</style>
      <nav className="ihs-nav">
        <div className="ihs-logo">
          <a href="#top">{brand}</a>
        </div>
        <div className="ihs-nav-links">
          {navLinks.map((link) => (
            <a href="#top" key={link}>
              {link}
            </a>
          ))}
        </div>
      </nav>
      <div className="ihs-slider">
        <div className="ihs-slide-track" />
      </div>
      <footer className="ihs-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap");

.ihs-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "DM Mono", monospace;
  background-color: #0f0f0f;
  color: #fff;
}
.ihs-root * { margin: 0; padding: 0; box-sizing: border-box; }
.ihs-root a,
.ihs-root p {
  display: block;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 500;
}
.ihs-nav,
.ihs-footer {
  position: absolute;
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}
.ihs-nav { top: 0; }
.ihs-footer { bottom: 0; }
.ihs-nav-links { display: flex; gap: 2rem; }
.ihs-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
}
.ihs-slide-track {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
}
.ihs-slide {
  flex-shrink: 0;
  width: 350px;
  height: 500px;
  margin: 0 20px;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  overflow: visible;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.ihs-slide-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1;
}
.ihs-slide-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
  transform: scale(2.25);
  user-select: none;
}
.ihs-slide-overlay {
  position: absolute;
  bottom: -1.75rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
  z-index: 10;
  transition: opacity 0.3s ease;
  opacity: 0;
}
.ihs-slide:hover .ihs-slide-overlay {
  opacity: calc(1 - var(--ihs-slider-moving, 1));
}
.ihs-project-title {
  text-transform: uppercase;
  font-weight: 500;
  font-size: 0.8rem;
}
.ihs-project-arrow { width: 16px; height: 16px; }
.ihs-project-arrow svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: #fff;
  stroke-width: 2;
}
`;

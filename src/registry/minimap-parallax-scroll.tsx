"use client";

/**
 * Minimap Parallax Scroll - an infinite full-screen project feed with inertia,
 * snap-to-project, parallax images, and a live minimap that scrolls in sync.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/minimap-parallax-scroll";

export interface MinimapProject {
  title: string;
  image: string;
  category: string;
  year: string;
}

export interface MinimapParallaxScrollProps {
  projects?: MinimapProject[];
  scrollSpeed?: number;
  lerpFactor?: number;
  background?: string;
}

const DEFAULT_PROJECTS: MinimapProject[] = [
  {
    title: "Redroom Gesture 14",
    image: `${ASSET_BASE}/img_1.jpg`,
    category: "Concept Series",
    year: "2025",
  },
  {
    title: "Shadowwear 6AM",
    image: `${ASSET_BASE}/img_2.jpg`,
    category: "Photography",
    year: "2024",
  },
  {
    title: "Blur Formation 03",
    image: `${ASSET_BASE}/img_3.jpg`,
    category: "Kinetic Study",
    year: "2024",
  },
  {
    title: "Sunglass Operator",
    image: `${ASSET_BASE}/img_4.jpg`,
    category: "Editorial Motion",
    year: "2023",
  },
  {
    title: "Azure Figure 5",
    image: `${ASSET_BASE}/img_5.jpg`,
    category: "Visual Research",
    year: "2024",
  },
];

interface Parallax {
  update: (scroll: number, index: number) => void;
}

interface TrackedItem {
  el: HTMLDivElement;
  parallax?: Parallax;
}

export default function MinimapParallaxScroll({
  projects = DEFAULT_PROJECTS,
  scrollSpeed = 0.75,
  lerpFactor = 0.05,
  background = "#000000",
}: MinimapParallaxScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const projectList = root.querySelector<HTMLElement>(".mps-project-list");
    const minimapPreview = root.querySelector<HTMLElement>(
      ".mps-minimap-img-preview",
    );
    const minimapInfoList = root.querySelector<HTMLElement>(
      ".mps-minimap-info-list",
    );
    if (!projectList || !minimapPreview || !minimapInfoList) return;

    const config = {
      SCROLL_SPEED: scrollSpeed,
      LERP_FACTOR: lerpFactor,
      BUFFER_SIZE: 5,
      MAX_VELOCITY: 150,
      SNAP_DURATION: 500,
    };

    const state = {
      currentY: 0,
      targetY: 0,
      isDragging: false,
      projects: new Map<number, TrackedItem>(),
      minimap: new Map<number, TrackedItem>(),
      minimapInfo: new Map<number, TrackedItem>(),
      projectHeight: root.clientHeight,
      minimapHeight: 250,
      isSnapping: false,
      snapStart: { time: 0, y: 0, target: 0 },
      dragStart: { y: 0, scrollY: 0 },
      lastScrollTime: Date.now(),
    };

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const createParallax = (img: HTMLImageElement, height: number) => {
      let current = 0;
      return {
        update: (scroll: number, index: number) => {
          const target = (-scroll - index * height) * 0.2;
          current = lerp(current, target, 0.1);
          if (Math.abs(current - target) > 0.01) {
            img.style.transform = `translateY(${current}px) scale(1.5)`;
          }
        },
      };
    };

    const getProjectData = (index: number) => {
      const i =
        ((Math.abs(index) % projects.length) + projects.length) %
        projects.length;
      return projects[i];
    };

    const createElement = (
      index: number,
      type: "main" | "minimap" | "info",
    ) => {
      const maps = {
        main: state.projects,
        minimap: state.minimap,
        info: state.minimapInfo,
      };
      if (maps[type].has(index)) return;

      const data = getProjectData(index);
      const num = (
        (((Math.abs(index) % projects.length) + projects.length) %
          projects.length) +
        1
      )
        .toString()
        .padStart(2, "0");

      if (type === "main") {
        const el = document.createElement("div");
        el.className = "mps-project";
        el.innerHTML = `<img src="${data.image}" alt="${data.title}" />`;
        projectList.appendChild(el);
        const img = el.querySelector("img");
        state.projects.set(index, {
          el,
          parallax: img ? createParallax(img, state.projectHeight) : undefined,
        });
      } else if (type === "minimap") {
        const el = document.createElement("div");
        el.className = "mps-minimap-img-item";
        el.innerHTML = `<img src="${data.image}" alt="${data.title}" />`;
        minimapPreview.appendChild(el);
        const img = el.querySelector("img");
        state.minimap.set(index, {
          el,
          parallax: img ? createParallax(img, state.minimapHeight) : undefined,
        });
      } else {
        const el = document.createElement("div");
        el.className = "mps-minimap-item-info";
        el.innerHTML = `
          <div class="mps-minimap-item-info-row">
            <p>${num}</p>
            <p>${data.title}</p>
          </div>
          <div class="mps-minimap-item-info-row">
            <p>${data.category}</p>
            <p>${data.year}</p>
          </div>
        `;
        minimapInfoList.appendChild(el);
        state.minimapInfo.set(index, { el });
      }
    };

    for (let i = -config.BUFFER_SIZE; i <= config.BUFFER_SIZE; i++) {
      createElement(i, "main");
      createElement(i, "minimap");
      createElement(i, "info");
    }

    const syncElements = () => {
      const current = Math.round(-state.targetY / state.projectHeight);
      const min = current - config.BUFFER_SIZE;
      const max = current + config.BUFFER_SIZE;

      for (let i = min; i <= max; i++) {
        createElement(i, "main");
        createElement(i, "minimap");
        createElement(i, "info");
      }

      for (const map of [state.projects, state.minimap, state.minimapInfo]) {
        map.forEach((item, index) => {
          if (index < min || index > max) {
            item.el.remove();
            map.delete(index);
          }
        });
      }
    };

    const snapToProject = () => {
      state.isSnapping = true;
      state.snapStart.time = Date.now();
      state.snapStart.y = state.targetY;
      state.snapStart.target =
        -Math.round(-state.targetY / state.projectHeight) * state.projectHeight;
    };

    const updateSnap = () => {
      const progress = Math.min(
        (Date.now() - state.snapStart.time) / config.SNAP_DURATION,
        1,
      );
      const eased = 1 - (1 - progress) ** 3;
      state.targetY =
        state.snapStart.y +
        (state.snapStart.target - state.snapStart.y) * eased;
      if (progress >= 1) state.isSnapping = false;
    };

    const updatePositions = () => {
      const minimapY =
        (state.currentY * state.minimapHeight) / state.projectHeight;

      state.projects.forEach((item, index) => {
        const y = index * state.projectHeight + state.currentY;
        item.el.style.transform = `translateY(${y}px)`;
        item.parallax?.update(state.currentY, index);
      });

      state.minimap.forEach((item, index) => {
        const y = index * state.minimapHeight + minimapY;
        item.el.style.transform = `translateY(${y}px)`;
        item.parallax?.update(minimapY, index);
      });

      state.minimapInfo.forEach((item, index) => {
        item.el.style.transform = `translateY(${
          index * state.minimapHeight + minimapY
        }px)`;
      });
    };

    let frame = 0;
    const animate = () => {
      const now = Date.now();

      if (
        !state.isSnapping &&
        !state.isDragging &&
        now - state.lastScrollTime > 100
      ) {
        const snapPoint =
          -Math.round(-state.targetY / state.projectHeight) *
          state.projectHeight;
        if (Math.abs(state.targetY - snapPoint) > 1) snapToProject();
      }

      if (state.isSnapping) updateSnap();
      if (!state.isDragging)
        state.currentY += (state.targetY - state.currentY) * config.LERP_FACTOR;

      syncElements();
      updatePositions();
      frame = requestAnimationFrame(animate);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.isSnapping = false;
      state.lastScrollTime = Date.now();
      const delta = Math.max(
        Math.min(e.deltaY * config.SCROLL_SPEED, config.MAX_VELOCITY),
        -config.MAX_VELOCITY,
      );
      state.targetY -= delta;
    };

    const onTouchStart = (e: TouchEvent) => {
      state.isDragging = true;
      state.isSnapping = false;
      state.dragStart = { y: e.touches[0].clientY, scrollY: state.targetY };
      state.lastScrollTime = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!state.isDragging) return;
      state.targetY =
        state.dragStart.scrollY +
        (e.touches[0].clientY - state.dragStart.y) * 1.5;
      state.lastScrollTime = Date.now();
    };

    const onTouchEnd = () => {
      state.isDragging = false;
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart);
    root.addEventListener("touchmove", onTouchMove);
    root.addEventListener("touchend", onTouchEnd);

    animate();

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      projectList.replaceChildren();
      minimapPreview.replaceChildren();
      minimapInfoList.replaceChildren();
    };
  }, [projects, scrollSpeed, lerpFactor]);

  return (
    <div
      className="mps-root"
      ref={rootRef}
      style={{ "--mps-bg": background } as React.CSSProperties}
    >
      <style>{styles}</style>
      <div className="mps-container">
        <ul className="mps-project-list" />

        <div className="mps-minimap">
          <div className="mps-minimap-wrapper">
            <div className="mps-minimap-img-preview" />
            <div className="mps-minimap-info-list" />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.mps-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: var(--mps-bg);
  font-family: "Inter", sans-serif;
}

.mps-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mps-root p {
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: -0.0125rem;
}

.mps-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.mps-project {
  position: absolute;
  width: 100%;
  height: 100%;
  will-change: transform;
  overflow: hidden;
}

.mps-minimap {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  height: calc(250px + 3rem);
  background-color: #fff;
  padding: 1.5rem;
  overflow: hidden;
}

.mps-minimap-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.mps-minimap-img-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 35%;
  height: 100%;
  overflow: hidden;
}

.mps-minimap-img-item {
  position: absolute;
  width: 100%;
  height: 100%;
  will-change: transform;
  overflow: hidden;
}

.mps-minimap-img-item img,
.mps-project img {
  position: relative;
  transform: scale(1.5);
  will-change: transform;
}

.mps-minimap-info-list {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.mps-minimap-item-info {
  position: absolute;
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  will-change: transform;
}

.mps-minimap-item-info-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
}

@media (max-width: 1000px) {
  .mps-minimap-img-preview {
    left: unset;
    right: 0rem;
    transform: translate(0, -50%);
  }

  .mps-minimap-item-info-row {
    flex-direction: column;
  }
}
`;

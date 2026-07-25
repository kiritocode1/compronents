"use client";

/**
 * Snap Parallax Projects - an endlessly scrolling project list that settles on
 * whole panels. Wheel or drag moves it freely, but a tenth of a second after
 * input stops it eases to the nearest panel boundary on a cubic curve, so it
 * never rests half way between two projects. Panels are built into a fifteen
 * either side buffer and destroyed past fifty, so the list runs forever in both
 * directions. Each image is held at 1.5 zoom and lags the panel by a fifth,
 * and the layout alternates so the picture swaps sides project to project.
 *
 * Self-contained: it fills its own box and reads the wheel over itself.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/snap-parallax-projects";

export interface SnapProject {
  title: string;
  image: string;
  isAlternate: boolean;
}

export interface SnapParallaxProjectsProps {
  projects?: SnapProject[];
  scrollSpeed?: number;
  lerpFactor?: number;
  snapDuration?: number;
}

const DEFAULT_PROJECTS: SnapProject[] = [
  { title: "Euphoria", image: `${ASSET_BASE}/img1.jpeg`, isAlternate: false },
  { title: "Scratcher", image: `${ASSET_BASE}/img2.jpeg`, isAlternate: true },
  { title: "Ember", image: `${ASSET_BASE}/img3.jpeg`, isAlternate: false },
  {
    title: "Liquid Soleil",
    image: `${ASSET_BASE}/img4.jpeg`,
    isAlternate: true,
  },
  { title: "Vacuum", image: `${ASSET_BASE}/img5.jpeg`, isAlternate: false },
  { title: "Synthesis", image: `${ASSET_BASE}/img6.jpeg`, isAlternate: true },
];

const BUFFER_SIZE = 15;
const CLEANUP_THRESHOLD = 50;
const MAX_VELOCITY = 120;

const lerp = (start: number, end: number, factor: number) =>
  start + (end - start) * factor;

export default function SnapParallaxProjects({
  projects = DEFAULT_PROJECTS,
  scrollSpeed = 0.75,
  lerpFactor = 0.05,
  snapDuration = 500,
}: SnapParallaxProjectsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!projects.length) return;

    const list = root.querySelector<HTMLElement>(".psi-project-list");
    if (!list) return;

    const state = {
      currentY: 0,
      targetY: 0,
      lastY: 0,
      isDragging: false,
      startY: 0,
      projects: new Map<number, HTMLElement>(),
      parallaxImages: new Map<number, { update: (scroll: number) => void }>(),
      projectHeight: root.clientHeight,
      isSnapping: false,
      snapStartTime: 0,
      snapStartY: 0,
      snapTargetY: 0,
      lastScrollTime: performance.now(),
    };

    let frame = 0;

    const createParallaxImage = (
      imageElement: HTMLImageElement,
      index: number,
    ) => {
      let currentTranslateY = 0;
      let targetTranslateY = 0;

      const update = (scroll: number) => {
        // Panel top in list space is index * projectHeight, which is stable
        // regardless of where the list has been recycled to.
        const boundsTop = index * state.projectHeight;
        const relativeScroll = -scroll - boundsTop;
        targetTranslateY = relativeScroll * 0.2;
        currentTranslateY = lerp(currentTranslateY, targetTranslateY, 0.1);

        if (Math.abs(currentTranslateY - targetTranslateY) > 0.01) {
          imageElement.style.transform = `translateY(${currentTranslateY}px) scale(1.5)`;
        }
      };

      return { update };
    };

    const getProjectData = (index: number) => {
      const dataIndex =
        ((Math.abs(index) % projects.length) + projects.length) %
        projects.length;
      return { data: projects[dataIndex], dataIndex };
    };

    const createProjectElement = (index: number) => {
      if (state.projects.has(index)) return;

      const { data, dataIndex } = getProjectData(index);
      const projectNumber = (dataIndex + 1).toString().padStart(2, "0");

      const project = document.createElement("div");
      project.className = "psi-project";

      const titleSide = document.createElement("div");
      titleSide.className = "psi-side";
      const title = document.createElement("div");
      title.className = "psi-title";
      const nameH1 = document.createElement("h1");
      nameH1.textContent = data.title;
      const numberH1 = document.createElement("h1");
      numberH1.textContent = projectNumber;
      title.append(nameH1, numberH1);
      titleSide.appendChild(title);

      const imgSide = document.createElement("div");
      imgSide.className = "psi-side";
      const imgWrap = document.createElement("div");
      imgWrap.className = "psi-img";
      const img = document.createElement("img");
      img.src = data.image;
      img.alt = data.title;
      imgWrap.appendChild(img);
      imgSide.appendChild(imgWrap);

      if (data.isAlternate) {
        project.append(imgSide, titleSide);
      } else {
        project.append(titleSide, imgSide);
      }

      project.style.transform = `translateY(${index * state.projectHeight}px)`;
      list.appendChild(project);
      state.projects.set(index, project);
      state.parallaxImages.set(index, createParallaxImage(img, index));
    };

    const getCurrentIndex = () =>
      Math.round(-state.targetY / state.projectHeight);

    const checkAndCreateProjects = () => {
      const currentIndex = getCurrentIndex();
      const minNeeded = currentIndex - BUFFER_SIZE;
      const maxNeeded = currentIndex + BUFFER_SIZE;

      for (let i = minNeeded; i <= maxNeeded; i++) {
        if (!state.projects.has(i)) createProjectElement(i);
      }

      for (const [index, project] of state.projects) {
        if (
          index < currentIndex - CLEANUP_THRESHOLD ||
          index > currentIndex + CLEANUP_THRESHOLD
        ) {
          project.remove();
          state.projects.delete(index);
          state.parallaxImages.delete(index);
        }
      }
    };

    const getClosestSnapPoint = () => {
      const currentIndex = Math.round(-state.targetY / state.projectHeight);
      return -currentIndex * state.projectHeight;
    };

    const initiateSnap = () => {
      state.isSnapping = true;
      state.snapStartTime = performance.now();
      state.snapStartY = state.targetY;
      state.snapTargetY = getClosestSnapPoint();
    };

    const updateSnap = () => {
      const elapsed = performance.now() - state.snapStartTime;
      const progress = Math.min(elapsed / snapDuration, 1);

      const t = 1 - (1 - progress) ** 3;

      state.targetY =
        state.snapStartY + (state.snapTargetY - state.snapStartY) * t;

      if (progress >= 1) {
        state.isSnapping = false;
        state.targetY = state.snapTargetY;
      }
    };

    const animate = () => {
      const now = performance.now();
      const timeSinceLastScroll = now - state.lastScrollTime;

      if (!state.isSnapping && !state.isDragging && timeSinceLastScroll > 100) {
        const snapPoint = getClosestSnapPoint();
        if (Math.abs(state.targetY - snapPoint) > 1) initiateSnap();
      }

      if (state.isSnapping) updateSnap();

      if (!state.isDragging) {
        state.currentY += (state.targetY - state.currentY) * lerpFactor;
      }

      checkAndCreateProjects();

      for (const [index, project] of state.projects) {
        const y = index * state.projectHeight + state.currentY;
        project.style.transform = `translateY(${y}px)`;
        state.parallaxImages.get(index)?.update(state.currentY);
      }

      frame = requestAnimationFrame(animate);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      state.isSnapping = false;
      state.lastScrollTime = performance.now();

      const scrollDelta = e.deltaY * scrollSpeed;
      state.targetY -= Math.max(
        Math.min(scrollDelta, MAX_VELOCITY),
        -MAX_VELOCITY,
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      state.isDragging = true;
      state.isSnapping = false;
      state.startY = e.touches[0].clientY;
      state.lastY = state.targetY;
      state.lastScrollTime = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!state.isDragging) return;
      const deltaY = (e.touches[0].clientY - state.startY) * 1.5;
      state.targetY = state.lastY + deltaY;
      state.lastScrollTime = performance.now();
    };

    const handleTouchEnd = () => {
      state.isDragging = false;
    };

    const handleResize = () => {
      state.projectHeight = root.clientHeight;
      for (const [index, project] of state.projects) {
        project.style.transform = `translateY(${index * state.projectHeight}px)`;
      }
    };

    root.addEventListener("wheel", handleWheel, { passive: false });
    root.addEventListener("touchstart", handleTouchStart);
    root.addEventListener("touchmove", handleTouchMove);
    root.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("resize", handleResize);

    for (let i = -BUFFER_SIZE; i <= BUFFER_SIZE; i++) createProjectElement(i);
    animate();

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("wheel", handleWheel);
      root.removeEventListener("touchstart", handleTouchStart);
      root.removeEventListener("touchmove", handleTouchMove);
      root.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
      for (const [, project] of state.projects) project.remove();
      state.projects.clear();
      state.parallaxImages.clear();
    };
  }, [projects, scrollSpeed, lerpFactor, snapDuration]);

  return (
    <div className="psi-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="psi-container">
        <ul className="psi-project-list" />
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.psi-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Inter", sans-serif;
  background-color: #0f0f0f;
  color: #fff;
}
.psi-root * { margin: 0; padding: 0; box-sizing: border-box; }
.psi-root img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
  transform: translateY(0) scale(1.5);
}
.psi-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.psi-project-list {
  position: absolute;
  width: 100%;
  will-change: transform;
  list-style: none;
}
.psi-project {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  position: absolute;
  left: 0;
  will-change: transform;
}
.psi-side { flex: 1; height: 100%; overflow: hidden; }
.psi-img { width: 100%; height: 100%; overflow: hidden; }
.psi-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.psi-root h1 {
  text-transform: uppercase;
  font-size: 2.5rem;
  font-weight: 500;
  letter-spacing: -0.0125rem;
  padding: 0.5em;
}
`;

"use client";

/**
 * Voku Image Slider - an arc of images that eases around the viewport.
 *
 * Wheel, drag, or touch move a single scroll target. Each image wraps through a
 * curved track, scaling down toward the edges and lifting as it reaches center.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export interface VokuImageSliderProps {
  images?: string[];
  titles?: string[];
  background?: string;
  textColor?: string;
  slideWidth?: number;
  slideHeight?: number;
  gap?: number;
  arcDepth?: number;
  centerLift?: number;
  lerp?: number;
}

const ASSET_BASE = "https://compronents.dev/assets/voku-image-slider";
const DEFAULT_IMAGES = Array.from(
  { length: 9 },
  (_, index) => `${ASSET_BASE}/img${index + 1}.jpg`,
);

const DEFAULT_TITLES = [
  "Profile Study",
  "Pump Noir",
  "Compact Disc",
  "Iris Frame",
  "Open Compact",
  "Shelf Set",
  "Hand Held",
  "Clear Stack",
  "Foam Pump",
];

const wrap = (value: number, max: number) => ((value % max) + max) % max;

export default function VokuImageSlider({
  images = DEFAULT_IMAGES,
  titles = DEFAULT_TITLES,
  background = "#e7e4dc",
  textColor = "#171717",
  slideWidth = 200,
  slideHeight = 275,
  gap = 100,
  arcDepth = 150,
  centerLift = 100,
  lerp = 0.05,
}: VokuImageSliderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);
  const activeIndexRef = useRef(-1);
  const [activeTitle, setActiveTitle] = useState(titles[0] ?? "");
  const keys = useMemo(
    () => images.map((image, index) => `${image}-${index}`),
    [images],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || images.length === 0) return;

    let width = root.clientWidth;
    let height = root.clientHeight;
    let centerX = width / 2;
    let baselineY = height * 0.4;
    const trackWidth = images.length * gap;
    let scrollTarget = 0;
    let scrollCurrent = 0;
    let touchStartX = 0;
    let pointerStartX: number | null = null;
    let frame = 0;

    const compute = (index: number, scrollOffset: number) => {
      let wrappedOffsetX = wrap(index * gap - scrollOffset, trackWidth);
      if (wrappedOffsetX > trackWidth / 2) wrappedOffsetX -= trackWidth;

      const slideCenterX = centerX + wrappedOffsetX;
      const normalized = (slideCenterX - centerX) / (width * 0.5);
      const absDist = Math.min(Math.abs(normalized), 1.3);
      const scale = Math.max(1 - absDist * 0.8, 0.25);
      const scaledWidth = slideWidth * scale;
      const scaledHeight = slideHeight * scale;
      const clampedDist = Math.min(absDist, 1);
      const arcDrop = (1 - Math.cos(clampedDist * Math.PI)) * 0.5 * arcDepth;
      const lift = Math.max(1 - absDist * 2, 0) * centerLift;

      return {
        x: slideCenterX - scaledWidth / 2,
        y: baselineY - scaledHeight / 2 + arcDrop - lift,
        width: scaledWidth,
        height: scaledHeight,
        zIndex: Math.round((1 - absDist) * 100),
        distance: Math.abs(wrappedOffsetX),
      };
    };

    const layout = (scrollOffset: number) => {
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        const next = compute(index, scrollOffset);
        slide.style.width = `${next.width}px`;
        slide.style.height = `${next.height}px`;
        slide.style.zIndex = `${next.zIndex}`;
        slide.style.transform = `translate3d(${next.x}px, ${next.y}px, 0)`;
        if (next.distance < closestDistance) {
          closestDistance = next.distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeIndexRef.current) {
        activeIndexRef.current = closestIndex;
        setActiveTitle(titles[closestIndex] ?? `Slide ${closestIndex + 1}`);
      }
    };

    const animate = () => {
      scrollCurrent += (scrollTarget - scrollCurrent) * lerp;
      layout(scrollCurrent);
      frame = requestAnimationFrame(animate);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      scrollTarget += (event.deltaY + event.deltaX) * 0.5;
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStartX = event.touches[0]?.clientX ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      const touchX = event.touches[0]?.clientX ?? touchStartX;
      scrollTarget += (touchStartX - touchX) * 1.2;
      touchStartX = touchX;
    };
    const onPointerDown = (event: PointerEvent) => {
      pointerStartX = event.clientX;
      root.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (pointerStartX === null) return;
      scrollTarget += (pointerStartX - event.clientX) * 1.2;
      pointerStartX = event.clientX;
    };
    const onPointerUp = () => {
      pointerStartX = null;
    };
    const onResize = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      centerX = width / 2;
      baselineY = height * 0.4;
      layout(scrollCurrent);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    const observer = new ResizeObserver(onResize);
    observer.observe(root);
    layout(0);
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
    };
  }, [
    images,
    titles,
    slideWidth,
    slideHeight,
    gap,
    arcDepth,
    centerLift,
    lerp,
  ]);

  return (
    <section
      className="vis-root"
      ref={rootRef}
      style={
        {
          "--vis-bg": background,
          "--vis-text": textColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <p className="vis-title">{activeTitle}</p>
      {keys.map((key, index) => (
        <div
          className="vis-slide"
          key={key}
          ref={(node) => {
            if (node) slideRefs.current[index] = node;
          }}
        >
          <img src={images[index]} alt="" draggable={false} />
        </div>
      ))}
    </section>
  );
}

const styles = `
.vis-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 620px;
  overflow: hidden;
  background: var(--vis-bg);
  color: var(--vis-text);
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.vis-root:active {
  cursor: grabbing;
}

.vis-title {
  position: absolute;
  left: 50%;
  bottom: 2rem;
  z-index: 1000;
  margin: 0;
  transform: translateX(-50%);
  font-family: "Geist Mono", "SFMono-Regular", Consolas, monospace;
  font-size: clamp(0.75rem, 1.2vw, 1rem);
  text-transform: uppercase;
  letter-spacing: 0;
  white-space: nowrap;
}

.vis-slide {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  border-radius: 0.4rem;
  box-shadow: 0 18px 60px rgb(0 0 0 / 0.18);
  will-change: transform, width, height;
}

.vis-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
`;

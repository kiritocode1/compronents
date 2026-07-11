"use client";

/**
 * Detroit Paris Slider - an exponential infinite image stream.
 *
 * Slides are not evenly spaced. Each frame grows from a tiny sliver into a
 * large square-ish poster according to an exponential edge function, then wraps
 * back into the stream. Wheel, drag, and idle motion all move the same scroll
 * target so it keeps the original reference's physical, elastic feel.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";

export interface DetroitParisSliderProps {
  images?: string[];
  title?: string;
  background?: string;
  textColor?: string;
  lerp?: number;
  scrollSpeed?: number;
  minSize?: number;
  growth?: number;
  aspect?: number;
  baseline?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
}

const COMPRONENTS_ASSET_BASE =
  "https://ui.aryank.space/assets/detroit-paris-slider";

const DEFAULT_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `${COMPRONENTS_ASSET_BASE}/slide-img-${i + 1}.jpg`,
);

const lerpValue = (start: number, end: number, t: number) =>
  start + (end - start) * t;

const wrap = (value: number, max: number) => ((value % max) + max) % max;

export default function DetroitParisSlider({
  images = DEFAULT_IMAGES,
  title = "Perpetual Motion",
  background = "#edede7",
  textColor = "#111111",
  lerp = 0.075,
  scrollSpeed = 3.5,
  minSize = 0.1,
  growth = 0.25,
  aspect = 1 / 1.25,
  baseline = 0,
  autoplay = true,
  autoplaySpeed = 0.004,
}: DetroitParisSliderProps) {
  const sliderRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<HTMLDivElement[]>([]);

  const slideCount = useMemo(() => {
    const growthRatio = Math.exp(growth);
    return Math.ceil(Math.log(1 + (growthRatio - 1) / minSize) / growth) + 4;
  }, [growth, minSize]);
  const slideKeys = useMemo(
    () => Array.from({ length: slideCount }, (_, index) => `slide-${index}`),
    [slideCount],
  );

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || images.length === 0) return;

    const slides = slideRefs.current.slice(0, slideCount);
    const growthRatio = Math.exp(growth);
    const edgeX = (position: number, width: number) =>
      (width * minSize * (growthRatio ** position - 1)) / (growthRatio - 1);

    let scroll = 0;
    let scrollTarget = 0;
    let lastPointerX: number | null = null;
    let frame = 0;
    const slideStreamIndex = Array.from({ length: slideCount }, (_, i) => i);

    const setSlideImage = (slide: HTMLDivElement, imageIndex: number) => {
      const img = slide.querySelector("img");
      if (!img) return;
      const nextSrc = images[imageIndex];
      if (img.dataset.src === nextSrc) return;
      img.dataset.src = nextSrc;
      img.src = nextSrc;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      scrollTarget += (event.deltaY + event.deltaX) * scrollSpeed * 0.0014;
    };

    const onPointerDown = (event: PointerEvent) => {
      lastPointerX = event.clientX;
      slider.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (lastPointerX === null) return;
      scrollTarget += (lastPointerX - event.clientX) * scrollSpeed * -0.005;
      lastPointerX = event.clientX;
    };

    const releasePointer = () => {
      lastPointerX = null;
    };

    const render = () => {
      if (autoplay) scrollTarget += autoplaySpeed;
      scroll = lerpValue(scroll, scrollTarget, lerp);

      const sliderWidth = slider.clientWidth;
      const sliderHeight = slider.clientHeight;
      const baselineOffset = sliderHeight * baseline;

      for (let i = 0; i < slideCount; i++) {
        const slide = slides[i];
        if (!slide) continue;
        let streamIndex = slideStreamIndex[i];

        while (edgeX(streamIndex + scroll, sliderWidth) > sliderWidth) {
          streamIndex -= slideCount;
        }
        while (edgeX(streamIndex + scroll + 1, sliderWidth) < 0) {
          streamIndex += slideCount;
        }
        slideStreamIndex[i] = streamIndex;

        const left = Math.round(edgeX(streamIndex + scroll, sliderWidth));
        const right = Math.round(edgeX(streamIndex + scroll + 1, sliderWidth));
        const width = Math.max(1, right - left);
        const height = width / aspect;

        setSlideImage(slide, wrap(streamIndex, images.length));
        slide.style.width = `${width}px`;
        slide.style.height = `${height}px`;
        slide.style.zIndex = `${Math.max(0, Math.round(right))}`;
        slide.style.transform = `translate3d(${left}px, ${-baselineOffset}px, 0)`;
      }

      frame = requestAnimationFrame(render);
    };

    slider.addEventListener("wheel", onWheel, { passive: false });
    slider.addEventListener("pointerdown", onPointerDown);
    slider.addEventListener("pointermove", onPointerMove);
    slider.addEventListener("pointerup", releasePointer);
    slider.addEventListener("pointercancel", releasePointer);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      slider.removeEventListener("wheel", onWheel);
      slider.removeEventListener("pointerdown", onPointerDown);
      slider.removeEventListener("pointermove", onPointerMove);
      slider.removeEventListener("pointerup", releasePointer);
      slider.removeEventListener("pointercancel", releasePointer);
    };
  }, [
    images,
    slideCount,
    lerp,
    scrollSpeed,
    minSize,
    growth,
    aspect,
    baseline,
    autoplay,
    autoplaySpeed,
  ]);

  return (
    <section
      className="dps-root"
      ref={sliderRef}
      style={
        {
          "--dps-bg": background,
          "--dps-text": textColor,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <header className="dps-header">
        <h2>{title}</h2>
      </header>
      {slideKeys.map((key, index) => (
        <div
          className="dps-slide"
          key={key}
          ref={(node) => {
            if (node) slideRefs.current[index] = node;
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: sources are swapped imperatively inside the animation loop. */}
          <img alt="" draggable={false} crossOrigin="anonymous" />
        </div>
      ))}
    </section>
  );
}

const styles = `
.dps-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 620px;
  overflow: hidden;
  background: var(--dps-bg);
  color: var(--dps-text);
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.dps-root:active {
  cursor: grabbing;
}

.dps-slide {
  position: absolute;
  left: 0;
  bottom: 0;
  overflow: hidden;
  will-change: transform, width, height;
  background: #d9d8cf;
}

.dps-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.dps-header {
  position: absolute;
  top: clamp(1.25rem, 4vw, 3rem);
  left: clamp(1.25rem, 4vw, 3rem);
  z-index: 20;
  max-width: min(720px, 72vw);
  pointer-events: none;
}

.dps-header h2 {
  margin: 0;
  width: min-content;
  min-width: min(540px, 70vw);
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: clamp(3rem, 5vw, 7rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
}

@media (max-width: 700px) {
  .dps-root {
    min-height: 560px;
  }

  .dps-header h2 {
    min-width: 78vw;
    font-size: clamp(2.7rem, 13vw, 5.2rem);
  }
}
`;

"use client";

/**
 * Scroll Wave Gallery - a vertical column of images that sway as they scroll.
 *
 * Each frame rides a sum of three sine waves (a slow base swing, a faster flow,
 * and a fine detail jitter) to drift left and right while you scroll, and its
 * clip-path pinches inward as it crosses the center of the viewport, so the
 * column reads like a loose ribbon of photographs settling into place. The last
 * quarter of the set shrinks for a sense of recession. Driven by per-image GSAP
 * ScrollTriggers with Lenis smooth scroll.
 *
 * By default it owns a scroll container sized to its box (`embedded`), so it
 * drops into a bounded demo or a full-height section. Set `embedded={false}` to
 * drive it from the window scroll instead.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

export interface ScrollWaveGalleryProps {
  /** Images stacked top to bottom through the scroll. */
  images?: string[];
  /** Headings shown in the intro and outro panels. */
  introText?: string;
  outroText?: string;
  /** Page background and ink. */
  background?: string;
  textColor?: string;
  /** Horizontal sway strength (0 holds the column straight). */
  waveStrength?: number;
  /** Maximum edge pinch at the center crossing, in percent. */
  clipMax?: number;
  /** Own an internal scroll container (true) or use the window scroll (false). */
  embedded?: boolean;
}

const COMPRONENTS_ASSET_BASE =
  "https://compronents.dev/assets/scroll-wave-gallery";
const DEFAULT_IMAGES = Array.from(
  { length: 12 },
  (_, i) => `${COMPRONENTS_ASSET_BASE}/img-${i + 1}.jpg`,
);

const ASPECT_RATIOS = ["3/2", "4/3", "5/4", "7/5"];
const IMAGE_BASE_HEIGHT = 375;
const WAVES = {
  base: { amp: 0.1, freq: 1.0, speed: 1.0, phase: 5.0 },
  flow: { amp: 0.15, freq: 5.0, speed: 5.0, phase: 10.0 },
  detail: { amp: 0.025, freq: 5.0, speed: 1.5, phase: 2.5 },
};
const CLIP_POWER = 2;

export default function ScrollWaveGallery({
  images = DEFAULT_IMAGES,
  introText = "Loose Structure",
  outroText = "Crafted by BLANK",
  background = "#e3e4d8",
  textColor = "#000000",
  waveStrength = 1,
  clipMax = 20,
  embedded = true,
}: ScrollWaveGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    const gallery = galleryRef.current;
    if (!scroller || !content || !gallery) return;

    const total = images.length;
    const measureWidth = () =>
      embedded ? scroller.clientWidth : window.innerWidth;

    /* ---- Smooth scroll ---- */
    const lenis = embedded
      ? new Lenis({ wrapper: scroller, content })
      : new Lenis();
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const items = gsap.utils.toArray<HTMLElement>(".swg-image", gallery);

    const shrinkStartIndex = Math.floor(total * 0.75);
    const shrinkFactorFor = (i: number) =>
      i >= shrinkStartIndex
        ? (i - shrinkStartIndex + 1) / (total - shrinkStartIndex)
        : 0;

    const sizeImages = () => {
      const vw = measureWidth();
      const sizeFactor = Math.min(vw / 750, 1);
      items.forEach((item, i) => {
        const height =
          IMAGE_BASE_HEIGHT * sizeFactor * (1 - shrinkFactorFor(i) * 0.5);
        item.style.height = `${Math.round(height)}px`;
      });
    };
    sizeImages();

    const triggers = items.map((item, index) => {
      const normalizedIndex = total > 1 ? index / (total - 1) : 0;
      return ScrollTrigger.create({
        trigger: item,
        scroller: embedded ? scroller : undefined,
        start: "top bottom",
        end: "bottom top",
        onUpdate: ({ progress }) => {
          const vw = measureWidth();
          const { base, flow, detail } = WAVES;

          const baseWave = Math.sin(
            normalizedIndex * base.freq +
              (1 - progress) * base.speed +
              base.phase,
          );
          const flowWave =
            0.5 +
            Math.sin(
              normalizedIndex * flow.freq + flow.phase + progress * flow.speed,
            );
          const detailWave =
            0.5 +
            Math.sin(
              normalizedIndex * detail.freq +
                detail.phase +
                progress * detail.speed,
            );

          const translateX =
            (vw - item.offsetWidth) / 2 -
            vw * 0.1 +
            waveStrength *
              (baseWave * vw * base.amp +
                flowWave * vw * flow.amp +
                detailWave * vw * detail.amp);

          const centerOffset = Math.abs(progress - 0.5) * 2;
          const clipAmount = centerOffset ** CLIP_POWER * clipMax;

          item.style.translate = `${translateX}px`;
          item.style.clipPath = `inset(0 ${clipAmount}% 0 ${clipAmount}%)`;
        },
      });
    });

    const onResize = () => {
      sizeImages();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      for (const trigger of triggers) trigger.kill();
      lenis.off("scroll", onScroll);
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
    };
  }, [images, embedded, waveStrength, clipMax]);

  return (
    <div
      className={embedded ? "swg-root swg-embedded" : "swg-root"}
      style={
        {
          "--swg-bg": background,
          "--swg-fg": textColor,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="swg-scroller" ref={scrollerRef}>
        <div className="swg-content" ref={contentRef}>
          <section className="swg-panel">
            <h2>{introText}</h2>
          </section>

          <section className="swg-gallery" ref={galleryRef}>
            {images.map((src, i) => (
              <div
                className="swg-image"
                key={src}
                style={{ aspectRatio: ASPECT_RATIOS[i % ASPECT_RATIOS.length] }}
              >
                {/* biome-ignore lint/performance/noImgElement: raw cover image swayed and clipped on scroll. */}
                <img src={src} alt="" draggable={false} />
              </div>
            ))}
          </section>

          <section className="swg-panel">
            <h2>{outroText}</h2>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
.swg-root {
  width: 100%;
  height: 100%;
  background: var(--swg-bg);
  color: var(--swg-fg);
}

.swg-root.swg-embedded .swg-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.swg-root.swg-embedded .swg-scroller::-webkit-scrollbar {
  display: none;
}

.swg-content {
  width: 100%;
}

.swg-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  overflow: hidden;
}
.swg-root.swg-embedded .swg-panel {
  height: 100%;
}

.swg-panel h2 {
  margin: 0;
  font-family: ui-serif, Georgia, "Times New Roman", serif;
  font-size: clamp(3rem, 6cqw, 7rem);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1;
  text-align: center;
}

.swg-gallery {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  overflow: hidden;
  container-type: inline-size;
}

.swg-image {
  position: relative;
  clip-path: inset(0 20% 0 20%);
  will-change: transform, clip-path;
  overflow: hidden;
}

.swg-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.swg-root.swg-embedded {
  container-type: inline-size;
}
.swg-root.swg-embedded .swg-panel h2 {
  font-size: clamp(2rem, 9cqw, 5rem);
}
`;

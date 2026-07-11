"use client";

/**
 * Converging Search Scroll - a pinned sequence: scattered labelled feature
 * pills slide to the center and shrink into a single rounded dot while their
 * text fades out, the spotlight line lifts away, then the dot grows into a
 * search bar that drops into place and a final header fades up beneath it.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/converging-search-scroll";

export interface ConvergingSearchScrollProps {
  meshImage?: string;
  introText?: string;
  spotlightText?: string;
  headerText?: string;
  headerSubtext?: string;
  features?: string[];
  searchLabel?: string;
  outroText?: string;
  embedded?: boolean;
}

const DEFAULT_FEATURES = [
  "Flow",
  "Knowledge Grid",
  "Relay",
  "Adaptive Layer",
  "Signal",
  "System Design",
  "Archive",
];

const FEATURE_START_POSITIONS = [
  { top: 25, left: 15 },
  { top: 12.5, left: 50 },
  { top: 22.5, left: 75 },
  { top: 30, left: 82.5 },
  { top: 50, left: 20 },
  { top: 80, left: 20 },
  { top: 75, left: 75 },
];

export default function ConvergingSearchScroll({
  meshImage = `${ASSET_BASE}/mesh.png`,
  introText = "Where systems move with intention",
  spotlightText = "Information flows best through intentional design",
  headerText = "Find what matters through intelligent design",
  headerSubtext = "Discover a system that adapts to the way you think, not the other way around.",
  features = DEFAULT_FEATURES,
  searchLabel = "Find the unseen link",
  outroText = "( System complete )",
  embedded = true,
}: ConvergingSearchScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".css-content");
    const spotlight = root.querySelector<HTMLElement>(".css-spotlight");
    if (!content || !spotlight) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const featureEls = root.querySelectorAll<HTMLElement>(".css-feature");
    const featureBgs = root.querySelectorAll<HTMLElement>(".css-feature-bg");

    featureEls.forEach((feature, index) => {
      const pos = FEATURE_START_POSITIONS[index];
      if (!pos) return;
      gsap.set(feature, { top: `${pos.top}%`, left: `${pos.left}%` });
    });

    const featureStartDimensions: { width: number; height: number }[] = [];
    for (const bg of featureBgs) {
      const rect = bg.getBoundingClientRect();
      featureStartDimensions.push({ width: rect.width, height: rect.height });
    }

    const remInPixels = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    const targetWidth = 3 * remInPixels;
    const targetHeight = 3 * remInPixels;

    const viewportWidth = () =>
      embedded ? (root?.clientWidth ?? window.innerWidth) : window.innerWidth;
    const viewportHeight = () =>
      embedded
        ? (root?.clientHeight ?? window.innerHeight)
        : window.innerHeight;

    const getSearchBarFinalWidth = () => (viewportWidth() < 1000 ? 20 : 25);
    let searchBarFinalWidth = getSearchBarFinalWidth();

    const onResize = () => {
      searchBarFinalWidth = getSearchBarFinalWidth();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    const trigger = ScrollTrigger.create({
      trigger: spotlight,
      scroller: embedded ? root : undefined,
      start: "start",
      end: `+=${viewportHeight() * 3}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        if (progress <= 0.3333) {
          const spotlightHeaderProgress = progress / 0.3333;
          gsap.set(".css-spotlight-content", {
            y: `${-100 * spotlightHeaderProgress}%`,
          });
        } else {
          gsap.set(".css-spotlight-content", { y: "-100%" });
        }

        if (progress >= 0 && progress <= 0.5) {
          const featureProgress = progress / 0.5;

          featureEls.forEach((feature, index) => {
            const original = FEATURE_START_POSITIONS[index];
            if (!original) return;
            const currentTop =
              original.top + (50 - original.top) * featureProgress;
            const currentLeft =
              original.left + (50 - original.left) * featureProgress;
            gsap.set(feature, {
              top: `${currentTop}%`,
              left: `${currentLeft}%`,
            });
          });

          featureBgs.forEach((bg, index) => {
            const dim = featureStartDimensions[index];
            if (!dim) return;
            const currentWidth =
              dim.width + (targetWidth - dim.width) * featureProgress;
            const currentHeight =
              dim.height + (targetHeight - dim.height) * featureProgress;
            const currentBorderRadius = 0.5 + (25 - 0.5) * featureProgress;
            const currentBorderWidth = 0.125 + (0.35 - 0.125) * featureProgress;
            gsap.set(bg, {
              width: `${currentWidth}px`,
              height: `${currentHeight}px`,
              borderRadius: `${currentBorderRadius}rem`,
              borderWidth: `${currentBorderWidth}rem`,
            });
          });

          if (progress >= 0 && progress <= 0.1) {
            const featureTextProgress = progress / 0.1;
            gsap.set(".css-feature-content", {
              opacity: 1 - featureTextProgress,
            });
          } else if (progress > 0.1) {
            gsap.set(".css-feature-content", { opacity: 0 });
          }
        }

        gsap.set(".css-features", { opacity: progress >= 0.5 ? 0 : 1 });
        gsap.set(".css-search-bar", { opacity: progress >= 0.5 ? 1 : 0 });

        if (progress >= 0.5 && progress <= 0.75) {
          const searchBarProgress = (progress - 0.5) / 0.25;
          const width = 3 + (searchBarFinalWidth - 3) * searchBarProgress;
          const height = 3 + (5 - 3) * searchBarProgress;
          const translateY = -50 + (200 - -50) * searchBarProgress;
          gsap.set(".css-search-bar", {
            width: `${width}rem`,
            height: `${height}rem`,
            transform: `translate(-50%, ${translateY}%)`,
          });
          gsap.set(".css-search-bar p", { opacity: 0 });
        } else if (progress > 0.75) {
          gsap.set(".css-search-bar", {
            width: `${searchBarFinalWidth}rem`,
            height: "5rem",
            transform: "translate(-50%, 200%)",
          });
        }

        if (progress >= 0.75) {
          const finalHeaderProgress = (progress - 0.75) / 0.25;
          gsap.set(".css-search-bar p", { opacity: finalHeaderProgress });
          gsap.set(".css-header-content", {
            y: -50 + 50 * finalHeaderProgress,
            opacity: finalHeaderProgress,
          });
        } else {
          gsap.set(".css-search-bar p", { opacity: 0 });
          gsap.set(".css-header-content", { y: -50, opacity: 0 });
        }
      },
    });

    return () => {
      window.removeEventListener("resize", onResize);
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div className="css-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="css-content">
        <section className="css-intro">
          <h1>{introText}</h1>
        </section>

        <section className="css-spotlight">
          <div className="css-spotlight-content">
            <div className="css-spotlight-bg">
              <img alt="" draggable={false} src={meshImage} />
            </div>
            <h1>{spotlightText}</h1>
          </div>

          <div className="css-header">
            <div className="css-header-content">
              <h1>{headerText}</h1>
              <p>{headerSubtext}</p>
            </div>
          </div>

          <div className="css-features">
            {features.map((feature) => (
              <div className="css-feature" key={feature}>
                <div className="css-feature-bg" />
                <div className="css-feature-content">
                  <p>{feature}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="css-search-bar">
            <p>{searchLabel}</p>
          </div>
        </section>

        <section className="css-outro">
          <h1>{outroText}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Instrument+Serif:ital@0;1&family=Manrope:wght@200..800&display=swap");

.css-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #0f0f0f;
  color: #fff;
  font-family: "Instrument Serif", serif;
}

.css-root::-webkit-scrollbar {
  display: none;
}

.css-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.css-root h1 {
  text-align: center;
  font-size: 5rem;
  font-weight: 500;
  line-height: 0.9;
}

.css-root p {
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1;
}

.css-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.css-intro,
.css-outro {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.css-intro h1,
.css-outro h1 {
  width: 40%;
}

.css-spotlight-content,
.css-header {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: transform;
}

.css-spotlight-bg {
  position: absolute;
  transform: scale(0.8);
  opacity: 0.25;
}

.css-spotlight-content h1 {
  width: 40%;
}

.css-header-content {
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 2rem;
  will-change: transform, opacity;
  transform: translateY(-100px);
  opacity: 0;
}

.css-feature {
  position: absolute;
  width: max-content;
  height: max-content;
  padding: 1rem 1.5rem;
  transform: translate(-50%, -50%);
  will-change: top, left;
}

.css-feature-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background-color: #141414;
  border: 0.125rem solid #262626;
  border-radius: 0.5rem;
  will-change: width, height, border-radius, border-width;
}

.css-feature-content {
  position: relative;
  will-change: opacity;
}

.css-feature-content p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-weight: 400;
  font-size: 0.85rem;
  line-height: 1;
}

.css-search-bar {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3rem;
  height: 3rem;
  border-radius: 25rem;
  border: 0.35rem solid #262626;
  background-color: #141414;
  opacity: 0;
  display: flex;
  align-items: center;
  will-change: opacity, width, height, transform;
}

.css-search-bar p {
  position: relative;
  opacity: 0;
  transform: translateX(2rem);
  will-change: opacity;
}

@media (max-width: 1000px) {
  .css-root h1 {
    font-size: 2.5rem;
  }

  .css-intro h1,
  .css-outro h1,
  .css-spotlight-content h1,
  .css-header-content {
    width: 100%;
    padding: 2rem;
  }

  .css-spotlight-bg {
    transform: scale(2);
  }

  .css-feature {
    padding: 1rem;
  }

  .css-feature-content p {
    font-size: 0.7rem;
  }
}
`;

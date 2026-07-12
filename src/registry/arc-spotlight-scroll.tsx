"use client";

/**
 * Arc Spotlight Scroll - a pinned "telescope" reveal. Two words split apart to
 * open a scaling background frame, then a diagonally clipped viewport scrolls a
 * column of titles past its center. As each title reaches the middle it lights
 * up, the backdrop swaps to its still, and thumbnail frames arc down a bezier
 * path on the right. GSAP ScrollTrigger with Lenis.
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

const ASSET_BASE = "https://ui.aryank.space/assets/arc-spotlight-scroll";

export interface ArcSpotlightItem {
  name: string;
  img: string;
}

export interface ArcSpotlightScrollProps {
  intro?: string;
  outro?: string;
  introWords?: [string, string];
  headerLabel?: string;
  items?: ArcSpotlightItem[];
  embedded?: boolean;
}

const DEFAULT_ITEMS: ArcSpotlightItem[] = [
  { name: "Silent Arc", img: `${ASSET_BASE}/img1.jpg` },
  { name: "Bloom 24", img: `${ASSET_BASE}/img2.jpg` },
  { name: "Glass Fade", img: `${ASSET_BASE}/img3.jpg` },
  { name: "Echo 9", img: `${ASSET_BASE}/img4.jpg` },
  { name: "Velvet Loop", img: `${ASSET_BASE}/img5.jpg` },
  { name: "Field Two", img: `${ASSET_BASE}/img6.jpg` },
  { name: "Pale Thread", img: `${ASSET_BASE}/img7.jpg` },
  { name: "Stillroom", img: `${ASSET_BASE}/img8.jpg` },
  { name: "Ghostline", img: `${ASSET_BASE}/img9.jpg` },
  { name: "Mono 73", img: `${ASSET_BASE}/img10.jpg` },
];

// NOTE: gap, speed, and arcRadius are interconnected. Changing the number of
// items means retuning these so the arc timing and spacing still read well.
const config = { gap: 0.08, speed: 0.3, arcRadius: 500 };

export default function ArcSpotlightScroll({
  intro = "A curated series of surreal frames.",
  outro = "Moments in still motion.",
  introWords = ["Beneath", "Beyond"],
  headerLabel = "Discover",
  items = DEFAULT_ITEMS,
  embedded = true,
}: ArcSpotlightScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".asp-content");
    if (!content) return;

    const titlesContainer = root.querySelector<HTMLElement>(".asp-titles");
    const imagesContainer = root.querySelector<HTMLElement>(".asp-images");
    const spotlightHeader = root.querySelector<HTMLElement>(".asp-header");
    const titlesContainerElement = root.querySelector<HTMLElement>(
      ".asp-titles-container",
    );
    const bgImg = root.querySelector<HTMLImageElement>(".asp-bg-img img");
    if (
      !titlesContainer ||
      !imagesContainer ||
      !spotlightHeader ||
      !titlesContainerElement ||
      !bgImg
    ) {
      return;
    }
    const introTextElements =
      root.querySelectorAll<HTMLElement>(".asp-intro-text");

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const vw = embedded ? root.clientWidth : window.innerWidth;
    const vh = embedded ? root.clientHeight : window.innerHeight;

    const titleElements = Array.from(
      titlesContainer.querySelectorAll<HTMLElement>("h1"),
    );
    const imageElements = Array.from(
      imagesContainer.querySelectorAll<HTMLElement>(".asp-img"),
    );
    if (titleElements[0]) titleElements[0].style.opacity = "1";
    let currentActiveIndex = 0;

    const containerWidth = vw * 0.3;
    const containerHeight = vh;
    const arcStartX = containerWidth - 220;
    const arcStartY = -200;
    const arcEndY = containerHeight + 200;
    const arcControlPointX = arcStartX + config.arcRadius;
    const arcControlPointY = containerHeight / 2;

    const getBezierPosition = (t: number) => {
      const x =
        (1 - t) * (1 - t) * arcStartX +
        2 * (1 - t) * t * arcControlPointX +
        t * t * arcStartX;
      const y =
        (1 - t) * (1 - t) * arcStartY +
        2 * (1 - t) * t * arcControlPointY +
        t * t * arcEndY;
      return { x, y };
    };

    const getImgProgressState = (index: number, overallProgress: number) => {
      const startTime = index * config.gap;
      const endTime = startTime + config.speed;
      if (overallProgress < startTime) return -1;
      if (overallProgress > endTime) return 2;
      return (overallProgress - startTime) / config.speed;
    };

    const ctx = gsap.context(() => {
      imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));

      ScrollTrigger.create({
        trigger: ".asp-spotlight",
        scroller: embedded ? root : undefined,
        start: "top top",
        end: `+=${vh * 10}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          if (progress <= 0.2) {
            const animationProgress = progress / 0.2;
            const moveDistance = vw * 0.6;
            gsap.set(introTextElements[0], {
              x: -animationProgress * moveDistance,
              opacity: 1,
            });
            gsap.set(introTextElements[1], {
              x: animationProgress * moveDistance,
              opacity: 1,
            });
            gsap.set(".asp-bg-img", {
              transform: `scale(${animationProgress})`,
            });
            gsap.set(".asp-bg-img img", {
              transform: `scale(${1.5 - animationProgress * 0.5})`,
            });
            imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));
            spotlightHeader.style.opacity = "0";
            gsap.set(titlesContainerElement, {
              "--before-opacity": "0",
              "--after-opacity": "0",
            });
          } else if (progress > 0.2 && progress <= 0.25) {
            gsap.set(".asp-bg-img", { transform: "scale(1)" });
            gsap.set(".asp-bg-img img", { transform: "scale(1)" });
            gsap.set(introTextElements[0], { opacity: 0 });
            gsap.set(introTextElements[1], { opacity: 0 });
            imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));
            spotlightHeader.style.opacity = "1";
            gsap.set(titlesContainerElement, {
              "--before-opacity": "1",
              "--after-opacity": "1",
            });
          } else if (progress > 0.25 && progress <= 0.95) {
            gsap.set(".asp-bg-img", { transform: "scale(1)" });
            gsap.set(".asp-bg-img img", { transform: "scale(1)" });
            gsap.set(introTextElements[0], { opacity: 0 });
            gsap.set(introTextElements[1], { opacity: 0 });
            spotlightHeader.style.opacity = "1";
            gsap.set(titlesContainerElement, {
              "--before-opacity": "1",
              "--after-opacity": "1",
            });

            const switchProgress = (progress - 0.25) / 0.7;
            const titlesContainerHeight = titlesContainer.scrollHeight;
            const startPosition = vh;
            const targetPosition = -titlesContainerHeight;
            const totalDistance = startPosition - targetPosition;
            const currentY = startPosition - switchProgress * totalDistance;
            gsap.set(".asp-titles", {
              transform: `translateY(${currentY}px)`,
            });

            imageElements.forEach((img, index) => {
              const imageProgress = getImgProgressState(index, switchProgress);
              if (imageProgress < 0 || imageProgress > 1) {
                gsap.set(img, { opacity: 0 });
              } else {
                const pos = getBezierPosition(imageProgress);
                gsap.set(img, {
                  x: pos.x - 100,
                  y: pos.y - 75,
                  opacity: 1,
                });
              }
            });

            const viewportMiddle = vh / 2;
            let closestIndex = 0;
            let closestDistance = Number.POSITIVE_INFINITY;
            titleElements.forEach((title, index) => {
              const titleRect = title.getBoundingClientRect();
              const titleCenter = titleRect.top + titleRect.height / 2;
              const distanceFromCenter = Math.abs(titleCenter - viewportMiddle);
              if (distanceFromCenter < closestDistance) {
                closestDistance = distanceFromCenter;
                closestIndex = index;
              }
            });

            if (closestIndex !== currentActiveIndex) {
              if (titleElements[currentActiveIndex]) {
                titleElements[currentActiveIndex].style.opacity = "0.25";
              }
              titleElements[closestIndex].style.opacity = "1";
              bgImg.src = items[closestIndex].img;
              currentActiveIndex = closestIndex;
            }
          } else if (progress > 0.95) {
            spotlightHeader.style.opacity = "0";
            gsap.set(titlesContainerElement, {
              "--before-opacity": "0",
              "--after-opacity": "0",
            });
          }
        },
      });
    }, root);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, items]);

  return (
    <div
      className={embedded ? "asp-root asp-embedded" : "asp-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="asp-content">
        <section className="asp-intro">
          <h1>{intro}</h1>
        </section>

        <section className="asp-spotlight">
          <div className="asp-intro-text-wrapper">
            <div className="asp-intro-text">
              <p>{introWords[0]}</p>
            </div>
            <div className="asp-intro-text">
              <p>{introWords[1]}</p>
            </div>
          </div>

          <div className="asp-bg-img">
            <img alt="" src={items[0].img} />
          </div>

          <div className="asp-titles-container">
            <div className="asp-titles">
              {items.map((item) => (
                <h1 key={item.name}>{item.name}</h1>
              ))}
            </div>
          </div>

          <div className="asp-images">
            {items.map((item) => (
              <div className="asp-img" key={item.name}>
                <img alt="" src={item.img} />
              </div>
            ))}
          </div>

          <div className="asp-header">
            <p>{headerLabel}</p>
          </div>
        </section>

        <section className="asp-outro">
          <h1>{outro}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.asp-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Manrope", sans-serif;
  background-color: #0f0f0f;
}

.asp-root.asp-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.asp-root.asp-embedded::-webkit-scrollbar {
  display: none;
}

.asp-content {
  position: relative;
  width: 100%;
}

.asp-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asp-root h1 {
  font-size: 4rem;
  font-weight: 500;
  line-height: 1;
}

.asp-root p {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1;
}

.asp-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.asp-intro,
.asp-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0f0f0f;
  color: #fff;
}

.asp-intro-text-wrapper {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 0.5rem;
}

.asp-intro-text {
  flex: 1;
  position: relative;
  will-change: transform;
  color: #fff;
}

.asp-intro-text:nth-child(1) {
  display: flex;
  justify-content: flex-end;
}

.asp-bg-img {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform: scale(0);
  will-change: transform;
}

.asp-bg-img img {
  transform: scale(1.5);
  will-change: transform;
}

.asp-titles-container {
  position: absolute;
  top: 0;
  left: 15vw;
  width: 100%;
  height: 100%;
  overflow: hidden;
  clip-path: polygon(
    50svh 0px,
    0px 50%,
    50svh 100%,
    100% calc(100% + 100svh),
    100% -100svh
  );
  --before-opacity: 0;
  --after-opacity: 0;
}

.asp-titles-container::before,
.asp-titles-container::after {
  content: "";
  position: absolute;
  width: 100svh;
  height: 2.5px;
  background: #fff;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.asp-titles-container::before {
  top: 0;
  left: 0;
  transform: rotate(-45deg) translate(-7rem);
  opacity: var(--before-opacity);
}

.asp-titles-container::after {
  bottom: 0;
  left: 0;
  transform: rotate(45deg) translate(-7rem);
  opacity: var(--after-opacity);
}

.asp-titles {
  position: relative;
  left: 15%;
  width: 75%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 5rem;
  transform: translateY(100%);
  z-index: 2;
}

.asp-titles h1 {
  color: #fff;
  opacity: 0.25;
  transition: opacity 0.3s ease;
}

.asp-images {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  min-width: 300px;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.asp-img {
  position: absolute;
  width: 200px;
  height: 150px;
  will-change: transform;
}

.asp-header {
  position: absolute;
  top: 50%;
  left: 10%;
  transform: translateY(-50%);
  color: #fff;
  transition: opacity 0.3s ease;
  z-index: 2;
  opacity: 0;
}

@media (max-width: 1000px) {
  .asp-root h1 {
    font-size: 2rem;
  }
  .asp-intro,
  .asp-outro {
    padding: 2rem;
    text-align: center;
  }
  .asp-titles-container {
    clip-path: none;
  }
  .asp-titles-container::before,
  .asp-titles-container::after {
    display: none;
  }
  .asp-titles {
    left: 0;
  }
  .asp-header {
    display: none;
  }
}
`;

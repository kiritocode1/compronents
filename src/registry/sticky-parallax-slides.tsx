"use client";

/**
 * Sticky Parallax Slides - a pinned horizontal run where the images resist the
 * track. Each photo is held at 1.35 zoom and pushed back a quarter of the slide
 * width as its panel crosses, so the frames slide over the pictures instead of
 * carrying them. Only the outgoing and incoming pair are offset at any moment,
 * everything else sits neutral. Titles are governed by an IntersectionObserver
 * against the slider rather than the scroll position, so the caption swaps at
 * the quarter visible mark and correctly steps back on reverse.
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

const ASSET_BASE = "https://ui.aryank.space/assets/sticky-parallax-slides";

export interface StickyParallaxSlide {
  image: string;
  titleTop: string;
  titleBottom: string;
}

export interface StickyParallaxSlidesProps {
  slides?: StickyParallaxSlide[];
  outroHeading?: string;
  embedded?: boolean;
}

const DEFAULT_SLIDES: StickyParallaxSlide[] = [
  {
    image: `${ASSET_BASE}/img1.jpeg`,
    titleTop: "Refined Reception",
    titleBottom: "Lasting Impact",
  },
  {
    image: `${ASSET_BASE}/img2.jpeg`,
    titleTop: "Practical Luxury",
    titleBottom: "Smart Living",
  },
  {
    image: `${ASSET_BASE}/img3.jpeg`,
    titleTop: "Modern Concrete",
    titleBottom: "Warm Details",
  },
  {
    image: `${ASSET_BASE}/img4.jpeg`,
    titleTop: "Curved Elements",
    titleBottom: "Modern Flow",
  },
  {
    image: `${ASSET_BASE}/img5.jpeg`,
    titleTop: "Minimal Design",
    titleBottom: "Natural Light",
  },
];

export default function StickyParallaxSlides({
  slides = DEFAULT_SLIDES,
  outroHeading = "Shaping timeless spaces with contemporary vision",
  embedded = true,
}: StickyParallaxSlidesProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".rdg-content");
    const stickySection = root.querySelector<HTMLElement>(".rdg-sticky");
    const slidesContainer = root.querySelector<HTMLElement>(".rdg-slides");
    const slider = root.querySelector<HTMLElement>(".rdg-slider");
    if (!content || !stickySection || !slidesContainer || !slider) return;

    const slideEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".rdg-slide"),
    );
    if (!slideEls.length) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const stickyHeight = viewportHeight * 6;
    const totalMove = slidesContainer.offsetWidth - slider.offsetWidth;
    const slideWidth = slider.offsetWidth;

    for (const slide of slideEls) {
      const title = slide.querySelector(".rdg-title h1");
      gsap.set(title, { y: -200 });
    }

    let currentVisibleIndex: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const currentIndex = slideEls.indexOf(entry.target as HTMLElement);
          const titles = slideEls.map((slide) =>
            slide.querySelector(".rdg-title h1"),
          );

          if (entry.intersectionRatio >= 0.25) {
            currentVisibleIndex = currentIndex;
            titles.forEach((title, index) => {
              gsap.to(title, {
                y: index === currentIndex ? 0 : -200,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
            });
          } else if (
            entry.intersectionRatio < 0.25 &&
            currentVisibleIndex === currentIndex
          ) {
            const prevIndex = currentIndex - 1;
            currentVisibleIndex = prevIndex >= 0 ? prevIndex : null;

            titles.forEach((title, index) => {
              gsap.to(title, {
                y: index === prevIndex ? 0 : -200,
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              });
            });
          }
        }
      },
      { root: slider, threshold: [0, 0.25] },
    );

    for (const slide of slideEls) observer.observe(slide);

    const trigger = ScrollTrigger.create({
      trigger: stickySection,
      scroller,
      start: "top top",
      end: `+=${stickyHeight}px`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const mainMove = progress * totalMove;

        gsap.set(slidesContainer, { x: -mainMove });

        const currentSlide = Math.floor(mainMove / slideWidth);
        const slideProgress = (mainMove % slideWidth) / slideWidth;

        slideEls.forEach((slide, index) => {
          const image = slide.querySelector("img");
          if (!image) return;

          if (index === currentSlide || index === currentSlide + 1) {
            const relativeProgress =
              index === currentSlide ? slideProgress : slideProgress - 1;
            const parallaxAmount = relativeProgress * slideWidth * 0.25;
            gsap.set(image, { x: parallaxAmount, scale: 1.35 });
          } else {
            gsap.set(image, { x: 0, scale: 1.35 });
          }
        });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      observer.disconnect();
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, slides]);

  return (
    <div
      className={embedded ? "rdg-root rdg-embedded" : "rdg-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="rdg-content">
        <section className="rdg-sticky">
          <div className="rdg-slider">
            <div
              className="rdg-slides"
              style={{ width: `${slides.length * 100}%` }}
            >
              {slides.map((slide) => (
                <div className="rdg-slide" key={slide.titleTop}>
                  <div className="rdg-img">
                    <img src={slide.image} alt="" />
                  </div>
                  <div className="rdg-title">
                    <h1>
                      {slide.titleTop}
                      <br />
                      {slide.titleBottom}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rdg-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.rdg-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: #b4aea7;
}
.rdg-root.rdg-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.rdg-root.rdg-embedded::-webkit-scrollbar { display: none; }
.rdg-root * { margin: 0; padding: 0; box-sizing: border-box; }
.rdg-content { position: relative; width: 100%; }
.rdg-root img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform, scale;
  transform: translateX(0) scale(1.35);
}
.rdg-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 1.5em;
  overflow: hidden;
}
.rdg-outro {
  background-color: #141414;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.rdg-outro h1 {
  color: #fff;
  text-transform: uppercase;
  font-size: 60px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.9;
}
.rdg-sticky { background-color: #b4aea7; }
.rdg-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.rdg-slides {
  position: relative;
  height: 100%;
  display: flex;
  will-change: transform;
  transform: translateX(0);
}
.rdg-slide {
  position: relative;
  flex: 1;
  height: 100%;
}
.rdg-img {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.rdg-title {
  position: relative;
  width: max-content;
  height: 200px;
  margin: 1.5em;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  z-index: 2;
}
.rdg-title h1 {
  position: relative;
  color: #fff;
  text-transform: uppercase;
  font-size: 85px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.9;
  will-change: transform;
}
`;

"use client";

/**
 * Scroll Scrub Slider - a pinned full-screen slider scrubbed by scroll. Each
 * step cross-fades a new image, rebuilds the title line-by-line, and updates
 * numbered indices with sliding markers and a vertical progress bar.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/scroll-scrub-slider";

export interface ScrubSlide {
  title: string;
  image: string;
}

export interface ScrollScrubSliderProps {
  slides?: ScrubSlide[];
  introText?: string;
  outroText?: string;
  navLeft?: string;
  navRight?: string;
  embedded?: boolean;
}

const DEFAULT_SLIDES: ScrubSlide[] = [
  {
    title:
      "Under the soft hum of streetlights she watches the world ripple through glass, her calm expression mirrored in the fragments of drifting light.",
    image: `${ASSET_BASE}/slider_img_1.jpg`,
  },
  {
    title:
      "A car slices through the desert, shadow chasing the wind as clouds of dust rise behind, blurring the horizon into gold and thunder.",
    image: `${ASSET_BASE}/slider_img_2.jpg`,
  },
  {
    title:
      "Reflections ripple across mirrored faces, each one a fragment of identity, caught between defiance, doubt, and the silence of thought.",
    image: `${ASSET_BASE}/slider_img_3.jpg`,
  },
  {
    title:
      "Soft light spills through the cafe windows as morning settles into wood and metal, capturing the rhythm of quiet human routine.",
    image: `${ASSET_BASE}/slider_img_4.jpg`,
  },
  {
    title:
      "Every serve becomes a battle between focus and instinct, movement flowing like rhythm as the court blurs beneath the sunlight.",
    image: `${ASSET_BASE}/slider_img_5.jpg`,
  },
  {
    title:
      "Amber light spills over the stage as guitars cry into smoke and shadow, where music and motion merge into pure energy.",
    image: `${ASSET_BASE}/slider_img_6.jpg`,
  },
  {
    title:
      "Dust erupts beneath his stride as sweat glints under floodlights, every step pushing closer to victory, grit, and pure determination.",
    image: `${ASSET_BASE}/slider_img_7.jpg`,
  },
];

export default function ScrollScrubSlider({
  slides = DEFAULT_SLIDES,
  introText = "Scroll to explore the rhythm of still images that move quietly between story and sensation.",
  outroText = "As the sequence slows the silence takes over, holding the last traces of motion in the air.",
  navLeft = "BLANK / Experiment 501",
  navRight = "[ Scroll Motion Slider ]",
  embedded = true,
}: ScrollScrubSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".sss-content");
    const slider = root.querySelector<HTMLElement>(".sss-slider");
    const progressBar = root.querySelector<HTMLElement>(".sss-progress");
    const sliderImages = root.querySelector<HTMLElement>(".sss-slider-images");
    const sliderTitle = root.querySelector<HTMLElement>(".sss-slider-title");
    const sliderIndices = root.querySelector<HTMLElement>(".sss-indices");
    if (!content || !slider || !progressBar || !sliderImages || !sliderTitle)
      return;
    if (!sliderIndices) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const pinDistance = viewportHeight * slides.length;

    let activeSlide = 0;
    let currentSplit: SplitText | null = null;

    function createIndices() {
      if (!sliderIndices) return;
      sliderIndices.innerHTML = "";

      slides.forEach((_, index) => {
        const indexNum = (index + 1).toString().padStart(2, "0");
        const indicatorElement = document.createElement("p");
        indicatorElement.dataset.index = `${index}`;
        indicatorElement.innerHTML = `<span class="sss-marker"></span><span class="sss-index">${indexNum}</span>`;
        sliderIndices.appendChild(indicatorElement);

        if (index === 0) {
          gsap.set(indicatorElement.querySelector(".sss-index"), {
            opacity: 1,
          });
          gsap.set(indicatorElement.querySelector(".sss-marker"), {
            scaleX: 1,
          });
        } else {
          gsap.set(indicatorElement.querySelector(".sss-index"), {
            opacity: 0.35,
          });
          gsap.set(indicatorElement.querySelector(".sss-marker"), {
            scaleX: 0,
          });
        }
      });
    }

    function animateNewSlide(index: number) {
      if (!sliderImages) return;
      const newSliderImage = document.createElement("img");
      newSliderImage.src = slides[index].image;
      newSliderImage.alt = `Slide ${index + 1}`;

      gsap.set(newSliderImage, {
        opacity: 0,
        scale: 1.1,
      });

      sliderImages.appendChild(newSliderImage);

      gsap.to(newSliderImage, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.to(newSliderImage, {
        scale: 1,
        duration: 1,
        ease: "power2.out",
      });

      const allImages = sliderImages.querySelectorAll("img");
      if (allImages.length > 3) {
        const removeCount = allImages.length - 3;
        for (let i = 0; i < removeCount; i++) {
          sliderImages.removeChild(allImages[i]);
        }
      }

      animateNewTitle(index);
      animateIndicators(index);
    }

    function animateIndicators(index: number) {
      if (!sliderIndices) return;
      const indicators = sliderIndices.querySelectorAll("p");

      indicators.forEach((indicator, i) => {
        const markerElement = indicator.querySelector(".sss-marker");
        const indexElement = indicator.querySelector(".sss-index");

        if (i === index) {
          gsap.to(indexElement, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          });

          gsap.to(markerElement, {
            scaleX: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        } else {
          gsap.to(indexElement, {
            opacity: 0.5,
            duration: 0.3,
            ease: "power2.out",
          });

          gsap.to(markerElement, {
            scaleX: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      });
    }

    function animateNewTitle(index: number) {
      if (!sliderTitle) return;
      if (currentSplit) {
        currentSplit.revert();
      }

      sliderTitle.innerHTML = `<h1>${slides[index].title}</h1>`;

      const heading = sliderTitle.querySelector("h1");
      if (!heading) return;

      currentSplit = new SplitText(heading, {
        type: "lines",
        linesClass: "sss-line",
        mask: "lines",
      });

      gsap.set(currentSplit.lines, {
        yPercent: 100,
        opacity: 0,
      });

      gsap.to(currentSplit.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.1,
        ease: "power3.out",
      });
    }

    createIndices();

    const trigger = ScrollTrigger.create({
      trigger: slider,
      scroller: embedded ? root : undefined,
      start: "top top",
      end: `+=${pinDistance}px`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        gsap.set(progressBar, {
          scaleY: self.progress,
        });

        const currentSlide = Math.floor(self.progress * slides.length);

        if (activeSlide !== currentSlide && currentSlide < slides.length) {
          activeSlide = currentSlide;
          animateNewSlide(activeSlide);
        }
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      if (currentSplit) currentSplit.revert();
    };
  }, [slides, embedded]);

  return (
    <div className="sss-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="sss-content">
        <nav className="sss-nav">
          <div className="sss-logo">
            <p>{navLeft}</p>
          </div>
          <div className="sss-site-info">
            <p>{navRight}</p>
          </div>
        </nav>

        <section className="sss-intro">
          <h1>{introText}</h1>
        </section>

        <section className="sss-slider">
          <div className="sss-slider-images">
            <img alt="Slide 1" src={slides[0]?.image} />
          </div>

          <div className="sss-slider-title">
            <h1>{slides[0]?.title}</h1>
          </div>

          <div className="sss-slider-indicator">
            <div className="sss-indices" />

            <div className="sss-progress-bar">
              <div className="sss-progress" />
            </div>
          </div>
        </section>

        <section className="sss-outro">
          <h1>{outroText}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.sss-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  font-family: "Inter", sans-serif;
  background-color: #0f0f0f;
}

.sss-root::-webkit-scrollbar {
  display: none;
}

.sss-root h1 {
  font-size: 3rem;
  font-weight: 400;
  letter-spacing: -0.1rem;
  line-height: 1.2;
}

.sss-root p {
  font-family: "Geist Mono", monospace;
  font-weight: 400;
  font-size: 0.85rem;
}

.sss-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sss-nav {
  position: sticky;
  top: 0;
  width: 100%;
  height: 0;
  z-index: 2;
}

.sss-nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sss-logo,
.sss-site-info {
  margin: 2rem;
}

.sss-nav p {
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #fff;
}

.sss-logo {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  padding: 0.5rem 1rem;
  overflow: hidden;
}

.sss-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.sss-intro,
.sss-outro {
  padding: 2rem;
  align-content: center;
  background-color: #0f0f0f;
  color: #fff;
}

.sss-intro h1,
.sss-outro h1 {
  width: 50%;
  margin: 0 auto;
  text-align: center;
}

.sss-slider-images {
  position: absolute;
  width: 100%;
  height: 100%;
}

.sss-slider-images::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.35);
}

.sss-slider-images img {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: center;
  will-change: transform, opacity;
}

.sss-slider-title {
  position: absolute;
  top: 50%;
  left: 2rem;
  transform: translateY(-50%);
  width: 50%;
  color: #fff;
}

.sss-slider-indicator {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
}

.sss-indices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.sss-indices p {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #fff;
}

.sss-index {
  position: relative;
  width: 1.25rem;
  display: flex;
  justify-content: flex-end;
  will-change: opacity;
}

.sss-marker {
  position: relative;
  width: 0.75rem;
  height: 1px;
  background-color: #fff;
  transform-origin: right;
  will-change: transform;
  transform: scaleX(0);
}

.sss-progress-bar {
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.35);
}

.sss-progress {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleY(0);
  width: 3px;
  height: 100%;
  background-color: #fff;
  transform-origin: top;
  will-change: transform;
}

.sss-line {
  position: relative;
  display: block;
  will-change: transform;
}

@media (max-width: 1000px) {
  .sss-root h1 {
    font-size: 2rem;
    letter-spacing: 0;
  }

  .sss-nav {
    display: none;
  }

  .sss-intro h1,
  .sss-outro h1 {
    width: 100%;
  }

  .sss-slider-title {
    top: 5rem;
    left: 0;
    transform: none;
    width: 100%;
    padding: 2rem;
  }

  .sss-slider-indicator {
    top: unset;
    transform: none;
    bottom: 2rem;
  }
}
`;

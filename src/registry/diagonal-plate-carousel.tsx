"use client";

/**
 * Diagonal Plate Carousel - two tall photographic plates leaning twenty degrees
 * in opposite directions, with the title set between them. Advancing does not
 * move the current slide: a whole new slide is stacked on top with its
 * clip-path collapsed to the bottom edge and unfurled upward, so the incoming
 * frame is revealed rather than slid. Inside it the two plates ride from a
 * hundred percent to fifty while the outgoing slide's plates continue to zero,
 * which is what makes the images look like they are being pulled through the
 * cut. The heading arrives pre-scaled at 1.5 and settles to 1 on the same
 * ease. Slides alternate a light and a dark theme, and the stack is trimmed to
 * five once each transition completes.
 *
 * Self-contained: it fills its own box, click anywhere to advance.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/diagonal-plate-carousel";

export interface DiagonalPlateSlide {
  title: string;
  images: [string, string];
}

export interface DiagonalPlateCarouselProps {
  slides?: DiagonalPlateSlide[];
  background?: string;
}

const DEFAULT_SLIDES: DiagonalPlateSlide[] = [
  "Echoes",
  "Ethereal",
  "Neon Void",
  "Mystics",
  "Horizons",
  "Dystopian",
].map((title, i) => ({
  title,
  images: [
    `${ASSET_BASE}/slider-${i + 1}-1.jpg`,
    `${ASSET_BASE}/slider-${i + 1}-2.jpg`,
  ],
}));

export default function DiagonalPlateCarousel({
  slides = DEFAULT_SLIDES,
  background = "rgb(211, 216, 203)",
}: DiagonalPlateCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const slider = root.querySelector<HTMLElement>(".dpc-slider");
    if (!slider) return;

    let activeSlide = 0;

    const onClick = () => {
      const currentSlide = slider.querySelector(".dpc-slide:not(.dpc-exiting)");
      const slideTheme = activeSlide % 2 ? "dpc-dark" : "dpc-light";
      activeSlide = (activeSlide + 1) % slides.length;

      if (currentSlide) {
        // The outgoing plates keep travelling to 0% while the incoming ones
        // arrive at 50%, so the images read as one continuous pull.
        gsap.to(currentSlide.querySelectorAll("img"), {
          top: "0%",
          duration: 1.5,
          ease: "power4.inOut",
        });
        currentSlide.classList.add("dpc-exiting");
      }

      const slide = slides[activeSlide];

      const newSlide = document.createElement("div");
      newSlide.classList.add("dpc-slide", slideTheme);
      newSlide.style.clipPath =
        "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";

      const newSlideImg1 = document.createElement("div");
      newSlideImg1.className = "dpc-slide-img dpc-slide-img-1";
      const img1 = document.createElement("img");
      img1.src = slide.images[0];
      img1.alt = "";
      img1.draggable = false;
      img1.style.top = "100%";
      newSlideImg1.appendChild(img1);
      newSlide.appendChild(newSlideImg1);

      const newSlideContent = document.createElement("div");
      newSlideContent.classList.add("dpc-slide-content");
      const heading = document.createElement("h1");
      heading.style.scale = "1.5";
      heading.textContent = slide.title;
      newSlideContent.appendChild(heading);
      newSlide.appendChild(newSlideContent);

      const newSlideImg2 = document.createElement("div");
      newSlideImg2.className = "dpc-slide-img dpc-slide-img-2";
      const img2 = document.createElement("img");
      img2.src = slide.images[1];
      img2.alt = "";
      img2.draggable = false;
      img2.style.top = "100%";
      newSlideImg2.appendChild(img2);
      newSlide.appendChild(newSlideImg2);

      slider.appendChild(newSlide);

      gsap.to(newSlide, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "power4.inOut",
        onStart: () => {
          gsap.to([img1, img2], {
            top: "50%",
            duration: 1.5,
            ease: "power4.inOut",
          });
        },
        onComplete: () => {
          while (slider.children.length > 5) {
            slider.removeChild(slider.firstChild as Node);
          }
        },
      });

      gsap.to(root.querySelectorAll(".dpc-slide-content h1"), {
        scale: 1,
        duration: 1.5,
        ease: "power4.inOut",
      });
    };

    root.addEventListener("click", onClick);

    return () => {
      root.removeEventListener("click", onClick);
      gsap.killTweensOf(slider.querySelectorAll("*"));
      for (const extra of Array.from(slider.children).slice(1)) {
        extra.remove();
      }
    };
  }, [slides]);

  const first = slides[0];

  return (
    <div className="dpc-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="dpc-slider" style={{ background }}>
        <div className="dpc-slide dpc-dark">
          <div className="dpc-slide-img dpc-slide-img-1">
            <img alt="" draggable={false} src={first.images[0]} />
          </div>
          <div className="dpc-slide-content">
            <h1>{first.title}</h1>
          </div>
          <div className="dpc-slide-img dpc-slide-img-2">
            <img alt="" draggable={false} src={first.images[1]} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&display=swap");

.dpc-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  cursor: pointer;
}

.dpc-root * {
  box-sizing: border-box;
}

.dpc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dpc-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.dpc-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background: #dbdbdb;
  overflow: hidden;
}

.dpc-slide.dpc-dark {
  background: #000;
}

.dpc-slide-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.dpc-slide-content h1 {
  margin: 0;
  font-family: "Anton", sans-serif;
  font-size: 20cqw;
  text-transform: uppercase;
  font-weight: 400;
  color: #000;
}

.dpc-slide.dpc-dark .dpc-slide-content h1 {
  color: #dbdbdb;
}

.dpc-slide-img {
  position: absolute;
  width: 250px;
  height: 150%;
  filter: saturate(0);
}

.dpc-slide-img img {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 250px;
  height: 600px;
}

.dpc-slide-img-1 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);
}

.dpc-slide-img-2 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(20deg);
}
`;

"use client";

/**
 * Hour Timeline Slider - click anywhere to wipe in the next slide with a
 * clip-path reveal while an elastic timeline of hours redistributes its
 * spacing, compressing the past and stretching the present.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/hour-timeline-slider";

export interface HourTimelineSliderProps {
  images?: string[];
  navLeft?: string;
  navRight?: string;
  footerLeft?: string;
  footerRight?: string;
  duration?: number;
}

const DEFAULT_IMAGES = Array.from(
  { length: 5 },
  (_, index) => `${ASSET_BASE}/img-${index + 1}.jpg`,
);

export default function HourTimelineSlider({
  images = DEFAULT_IMAGES,
  navLeft = "BLANK",
  navRight = "( Elite web designs )",
  footerLeft = "A day in the city, told hour by hour",
  footerRight = "Archive",
  duration = 1.5,
}: HourTimelineSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(CustomEase);
    if (!CustomEase.get("hts-hop")) {
      CustomEase.create(
        "hts-hop",
        "M0,0 C0.083,0.294 0.117,0.767 0.413,0.908 0.606,1 0.752,1 1,1 ",
      );
    }

    const slider = root.querySelector<HTMLElement>(".hts-slider");
    const timeline = root.querySelector<HTMLElement>(".hts-timeline");
    if (!slider || !timeline) return;

    const initialTimelineHTML = timeline.innerHTML;
    const initialSlides = Array.from(slider.children);

    let slides = slider.querySelectorAll<HTMLElement>(".hts-slide");
    let animating = false;

    slides.forEach((slide, index) => {
      if (index > 0) {
        gsap.set(slide, {
          clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
        });
      }
    });

    function initializeFlexValues() {
      if (!timeline) return;
      const counters = timeline.querySelectorAll<HTMLElement>("p");

      counters[0].style.flexGrow = "5";
      counters[0].style.width = "max-content";
      counters[1].style.flexGrow = "4";
      counters[1].style.width = "max-content";
      counters[2].style.flexGrow = "3";
      counters[2].style.width = "max-content";
      counters[3].style.flexGrow = "1.5";
      counters[3].style.width = "max-content";
      counters[4].style.flexGrow = "1";
      counters[4].style.width = "max-content";
      for (let i = 5; i < counters.length; i++) {
        counters[i].style.flexGrow = "0";
        counters[i].style.width = "0px";
      }
    }

    initializeFlexValues();

    function appendNewCounters() {
      if (!timeline) return;
      const counters = Array.from(timeline.querySelectorAll<HTMLElement>("p"));
      const firstIndex = counters.findIndex((p) =>
        p.classList.contains("first"),
      );

      for (let i = 0; i < firstIndex; i++) {
        counters[i].remove();
      }

      for (let i = 1; i <= 8; i++) {
        const newSup = document.createElement("sup");
        newSup.textContent = "pm";

        const newP = document.createElement("p");
        newP.textContent = `${i}`;
        newP.style.flexGrow = "0";
        newP.style.width = "0px";
        newP.appendChild(newSup);
        timeline.appendChild(newP);
      }
    }

    const handleSlider = () => {
      if (animating || !slider || !timeline) return;
      animating = true;

      slides = slider.querySelectorAll(".hts-slide");

      const firstSlide = slides[0];
      const firstSlideImg = firstSlide.querySelector("img");

      if (slides.length > 1) {
        const secondSlide = slides[1];
        const secondSlideImg = secondSlide.querySelector("img");
        gsap.set(secondSlideImg, { x: 250 });

        gsap.to(secondSlideImg, {
          x: 0,
          duration: duration,
          ease: "hts-hop",
        });

        gsap.to(firstSlideImg, {
          x: -500,
          duration: duration,
          ease: "hts-hop",
        });

        gsap.to(secondSlide, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: duration,
          ease: "hts-hop",
          onComplete: () => {
            firstSlide.remove();
            slider.appendChild(firstSlide);

            gsap.set(firstSlide, {
              clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
            });

            animating = false;
          },
        });
      } else {
        animating = false;
      }

      const counters = timeline.querySelectorAll<HTMLElement>("p");

      const lastFlexGrow = counters[counters.length - 1].style.flexGrow;

      const lastCounter = root.querySelector(".hts-timeline .last");
      if (lastCounter && lastCounter.textContent === "7pm") {
        appendNewCounters();
      }

      counters.forEach((p) => {
        p.classList.remove("last");
        p.classList.remove("first");
      });

      let firstAssigned = false;

      for (let i = counters.length - 1; i > 0; i--) {
        gsap.to(counters[i], {
          flexGrow: counters[i - 1].style.flexGrow,
          duration: duration,
          ease: "hts-hop",
          onStart: () => {
            const newWidth =
              Number(counters[i - 1].style.flexGrow) > 0
                ? "max-content"
                : "0px";
            gsap.set(counters[i], { width: newWidth });

            if (counters[i - 1].style.flexGrow === "5") {
              counters[i].classList.add("first");
              firstAssigned = true;
            } else if (
              counters[i - 1].style.flexGrow === "1" &&
              !firstAssigned
            ) {
              counters[i].classList.add("last");
            }
          },
        });
      }

      gsap.to(counters[0], {
        flexGrow: lastFlexGrow,
        duration: duration,
        ease: "hts-hop",
        onStart: () => {
          const newWidth = Number(lastFlexGrow) > 0 ? "max-content" : "0px";
          gsap.set(counters[0], { width: newWidth });

          if (lastFlexGrow === "5") {
            counters[0].classList.add("first");
          } else if (lastFlexGrow === "1" && !firstAssigned) {
            counters[0].classList.add("last");
          }
        },
      });
    };

    root.addEventListener("click", handleSlider);

    return () => {
      root.removeEventListener("click", handleSlider);
      gsap.killTweensOf(root.querySelectorAll("*"));
      timeline.innerHTML = initialTimelineHTML;
      slider.replaceChildren(...initialSlides);
    };
  }, [duration]);

  return (
    <div className="hts-root" ref={rootRef}>
      <style>{styles}</style>
      <nav className="hts-nav">
        <a href="#top">{navLeft}</a>
        <a href="#top">{navRight}</a>
      </nav>

      <footer className="hts-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>

      <div className="hts-slider">
        {images.map((image, index) => (
          <div className="hts-slide" key={image}>
            <img alt={`Slide ${index + 1}`} draggable={false} src={image} />
          </div>
        ))}
      </div>

      <div className="hts-timeline">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
          <p key={hour}>
            {hour}
            <sup>pm</sup>
          </p>
        ))}
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap");

@font-face {
  font-family: "BLANK Hour Display";
  src: url("${ASSET_BASE}/fonts/neue-montreal-medium.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.hts-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #000;
}

.hts-root a,
.hts-root p {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.75);
  font-family: "Akkurat Mono", "Geist Mono", monospace;
  font-size: 11px;
  text-transform: uppercase;
}

.hts-nav,
.hts-footer {
  position: absolute;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.hts-nav {
  top: 0;
}

.hts-footer {
  bottom: 0;
}

.hts-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hts-slider::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.hts-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
  will-change: transform;
}

.hts-root img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

.hts-timeline {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 105%;
  z-index: 2;
  display: flex;
}

.hts-timeline p {
  font-family: "PP Neue Montreal", "BLANK Hour Display", sans-serif;
  font-weight: 500;
  font-size: 28px;
  color: #fff;
  cursor: pointer;
}

.hts-timeline p sup {
  position: relative;
  top: -4px;
  font-family: "Akkurat Mono", "Geist Mono", monospace;
  font-size: 11px;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .hts-timeline {
    width: 110%;
  }
}
`;

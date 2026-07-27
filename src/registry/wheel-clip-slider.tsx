"use client";

/**
 * Wheel Clip Slider - a wheel-driven slider where the incoming frame is not
 * moved, it is unclipped. The next slide sits at full size with its clip-path
 * collapsed to the edge you are scrolling from and opens to the full rectangle,
 * while its image travels from scale two down to one and the outgoing image
 * travels the opposite way, so the two pictures cross in depth rather than
 * sliding. The word column is one strip stepped by exactly its line height, a
 * magnetic ring follows the pointer at half strength, and the ring's stroke is
 * drawn out and back with a dash offset on every change.
 *
 * Slides are created on demand and any slide more than two away is dropped, so
 * the list stays at five nodes no matter how far you scroll.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useId, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/wheel-clip-slider";

export interface WheelClipSliderProps {
  images?: string[];
  prefix?: string;
  words?: string[];
  linkUrls?: string[];
  linkLines?: [string, string];
  accent?: string;
  /** Height of one word row, in px. The column steps by exactly this. */
  lineHeight?: number;
  fontSize?: number;
}

const DEFAULT_IMAGES = Array.from(
  { length: 5 },
  (_, i) => `${ASSET_BASE}/img-${i + 1}.jpg`,
);

export default function WheelClipSlider({
  images = DEFAULT_IMAGES,
  prefix = "Developing",
  words = ["Ideas", "Science", "Balance", "Reality", "Journey"],
  linkUrls = [
    "https://ui.aryank.space/",
    "https://ui.aryank.space/components",
    "https://ui.aryank.space/pages",
    "https://ui.aryank.space/backend",
    "https://ui.aryank.space/inspiration",
  ],
  linkLines = ["View", "Project"],
  accent = "#f9b165",
  lineHeight = 150,
  fontSize = 120,
}: WheelClipSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const pathId = `wcs-path-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sliderContainer = root.querySelector<HTMLElement>(".wcs-slider");
    const indicators = root.querySelectorAll<HTMLElement>(".wcs-index");
    const path = root.querySelector<SVGPathElement>(`#${pathId}`);
    const line1 = root.querySelector<HTMLElement>(".wcs-line-1");
    const line2 = root.querySelector<HTMLElement>(".wcs-line-2");
    const link = root.querySelector<HTMLElement>(".wcs-link");
    const linkWrapper = root.querySelector<HTMLElement>(".wcs-link-wrapper");
    const postfix = root.querySelector<HTMLElement>(".wcs-postfix");
    if (
      !sliderContainer ||
      !path ||
      !line1 ||
      !line2 ||
      !link ||
      !linkWrapper ||
      !postfix
    )
      return;

    const totalSlides = images.length;
    let currentSlideIndex = 1;
    let isAnimating = false;
    let currentTopValue = 0;

    function normalizeSlideTitle(number: number) {
      let normalized = number;
      while (normalized <= 0) normalized += totalSlides;
      return ((normalized - 1) % totalSlides) + 1;
    }

    function getImageSource(slideNumber: number) {
      return images[normalizeSlideTitle(slideNumber) - 1];
    }

    for (const [idx, slide] of root
      .querySelectorAll<HTMLElement>(".wcs-slide")
      .entries()) {
      const img = slide.querySelector("img");
      if (idx === 0) {
        gsap.set(slide, { zIndex: 1 });
        gsap.set(img, { scale: 1, top: "0" });
      } else {
        gsap.set(slide, {
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
          zIndex: 0,
        });
        gsap.set(img, { scale: 2, top: "4em" });
      }
    }

    function createSlide(slideNumber: number) {
      const slide = document.createElement("div");
      slide.className = "wcs-slide";
      slide.dataset.slide = String(slideNumber);

      const img = document.createElement("img");
      img.src = getImageSource(slideNumber);
      img.alt = "";
      img.draggable = false;
      slide.appendChild(img);

      gsap.set(slide, {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        zIndex: 0,
      });
      gsap.set(img, { scale: 2, top: "4em" });
      return slide;
    }

    const slideByIndex = (n: number) =>
      root.querySelector<HTMLElement>(`[data-slide="${n}"]`);

    function updateSlideTitle(index: number) {
      const displayNumber = normalizeSlideTitle(index);
      // The source picks its step from window.innerWidth; the row height is a
      // prop here, so the same value drives the CSS and the tween.
      const multiplier = window.innerWidth < 900 ? 42 : lineHeight;
      currentTopValue = -(displayNumber - 1) * multiplier;
      gsap.to(postfix, {
        y: `${currentTopValue}px`,
        duration: 2,
        ease: "power4.inOut",
      });
    }

    function updateIndicators(index: number) {
      const normalizedIndex = normalizeSlideTitle(index);
      for (const indicator of indicators) {
        gsap.to(indicator, { scaleX: 0.5, duration: 2, ease: "power4.inOut" });
      }
      gsap.to(indicators[normalizedIndex - 1], {
        scaleX: 1,
        duration: 2,
        ease: "power4.inOut",
      });
    }

    function updateLink(index: number) {
      const normalizedIndex = normalizeSlideTitle(index) - 1;
      const linkElement = root?.querySelector<HTMLAnchorElement>(
        ".wcs-link-wrapper a",
      );
      if (linkElement) linkElement.href = linkUrls[normalizedIndex] ?? "#";
    }

    function cleanupSlides() {
      for (const slide of root?.querySelectorAll<HTMLElement>(".wcs-slide") ??
        []) {
        const slideNumber = Number(slide.dataset.slide);
        if (Math.abs(slideNumber - currentSlideIndex) > 2) slide.remove();
      }
    }

    function createNewText() {
      const line1Text = document.createElement("p");
      const line2Text = document.createElement("p");
      line1Text.textContent = linkLines[0];
      line2Text.textContent = linkLines[1];
      gsap.set([line1Text, line2Text], { y: 30 });
      return { line1Text, line2Text };
    }

    function animateText() {
      const tl = gsap.timeline();
      const currentLine1 = line1?.querySelector("p");
      const currentLine2 = line2?.querySelector("p");
      const { line1Text, line2Text } = createNewText();

      tl.to([currentLine1, currentLine2], {
        y: -30,
        stagger: 0.1,
        delay: 0.25,
        duration: 1,
        ease: "power3.inOut",
        onComplete: () => {
          currentLine1?.remove();
          currentLine2?.remove();
        },
      });

      line1?.appendChild(line1Text);
      line2?.appendChild(line2Text);

      tl.to(
        [line1Text, line2Text],
        {
          y: 0,
          stagger: 0.1,
          delay: 0.75,
          duration: 1,
          ease: "power3.inOut",
        },
        "<",
      );
      return tl;
    }

    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: 0,
      rotation: -90,
      transformOrigin: "center center",
    });

    function animateCircle() {
      const tl = gsap.timeline();
      tl.set(path, {
        strokeDashoffset: 0,
        strokeDasharray: length,
        scale: 1,
      })
        .to(path, {
          strokeDashoffset: -length,
          duration: 1,
          ease: "power2.inOut",
        })
        .set(path, { strokeDashoffset: length })
        .to(path, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" });
      return tl;
    }

    function animateSlideTransition(
      currentSlide: HTMLElement,
      nextSlide: HTMLElement,
      direction: "up" | "down",
    ) {
      if (isAnimating) return;
      isAnimating = true;

      const currentImg = currentSlide.querySelector("img");
      const nextImg = nextSlide.querySelector("img");

      gsap.set(nextSlide, {
        clipPath:
          direction === "up"
            ? "polygon(0 0, 100% 0, 100% 0, 0 0)"
            : "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
      });
      gsap.set(nextImg, { scale: 2, top: "4em" });
      gsap.set(currentSlide, { zIndex: 1 });
      gsap.set(nextSlide, { zIndex: 2 });

      const titleIndex =
        direction === "up" ? currentSlideIndex - 1 : currentSlideIndex;
      updateSlideTitle(titleIndex);
      updateIndicators(titleIndex);
      updateLink(titleIndex);

      const timeline = gsap.timeline({
        onComplete: () => {
          gsap.set(currentSlide, { zIndex: 0 });
          gsap.set(nextSlide, { zIndex: 1 });
          cleanupSlides();
          isAnimating = false;
        },
      });

      timeline.add(animateCircle(), 0);
      timeline.add(animateText(), 0);

      timeline
        .to(
          currentImg,
          { scale: 2, top: "4em", duration: 2, ease: "power3.inOut" },
          0,
        )
        .to(
          nextSlide,
          {
            clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
            duration: 2,
            ease: "power4.inOut",
          },
          0,
        )
        .to(
          nextImg,
          { scale: 1, top: "0", duration: 2, ease: "power3.inOut" },
          0,
        );
    }

    function showNextSlide() {
      const currentSlide = slideByIndex(currentSlideIndex);
      if (!currentSlide) return;
      currentSlideIndex++;

      let nextSlide = slideByIndex(currentSlideIndex);
      if (!nextSlide) {
        nextSlide = createSlide(currentSlideIndex);
        sliderContainer?.appendChild(nextSlide);
      }
      animateSlideTransition(currentSlide, nextSlide, "down");
    }

    function showPrevSlide() {
      const currentSlide = slideByIndex(currentSlideIndex);
      if (!currentSlide) return;
      const prevSlideIndex = currentSlideIndex - 1;

      let prevSlide = slideByIndex(prevSlideIndex);
      if (!prevSlide) {
        prevSlide = createSlide(prevSlideIndex);
        sliderContainer?.insertBefore(prevSlide, currentSlide);
      }
      animateSlideTransition(currentSlide, prevSlide, "up");
      currentSlideIndex--;
    }

    // The source listens on window; scoping to the root keeps the wheel from
    // hijacking the page around a bounded preview.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimating) return;
      if (e.deltaY > 0) showNextSlide();
      else if (e.deltaY < 0) showPrevSlide();
    };
    root.addEventListener("wheel", onWheel, { passive: false });

    const xTo = gsap.quickTo(linkWrapper, "x", {
      duration: 0.4,
      ease: "power3",
    });
    const yTo = gsap.quickTo(linkWrapper, "y", {
      duration: 0.4,
      ease: "power3",
    });

    const onMouseMove = (e: MouseEvent) => {
      const rect = link.getBoundingClientRect();
      xTo((e.clientX - rect.left - rect.width / 2) * 0.5);
      yTo((e.clientY - rect.top - rect.height / 2) * 0.5);
    };
    const onMouseLeave = () => {
      xTo(0);
      yTo(0);
    };
    link.addEventListener("mousemove", onMouseMove);
    link.addEventListener("mouseleave", onMouseLeave);

    gsap.set(linkWrapper, { x: 0, y: 0, xPercent: -50, yPercent: -50 });
    updateLink(1);

    return () => {
      root.removeEventListener("wheel", onWheel);
      link.removeEventListener("mousemove", onMouseMove);
      link.removeEventListener("mouseleave", onMouseLeave);
      gsap.killTweensOf([postfix, linkWrapper, path]);
      for (const slide of root.querySelectorAll<HTMLElement>(".wcs-slide")) {
        if (Number(slide.dataset.slide) > images.length) slide.remove();
      }
    };
  }, [images, linkUrls, linkLines, lineHeight, pathId]);

  return (
    <div className="wcs-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="wcs-container">
        <div className="wcs-slider">
          {images.map((src, i) => (
            <div
              className={i === 0 ? "wcs-slide wcs-slide-first" : "wcs-slide"}
              data-slide={i + 1}
              key={src}
            >
              <img alt="" draggable={false} src={src} />
            </div>
          ))}
        </div>

        <div className="wcs-content">
          <div
            className="wcs-title"
            style={{
              color: accent,
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              clipPath: `polygon(0 0, 100% 0, 100% ${lineHeight}px, 0 ${lineHeight}px)`,
            }}
          >
            <div className="wcs-prefix">{prefix}</div>
            <div className="wcs-postfix">
              {words.map((word) => (
                <div key={word}>{word}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="wcs-indicator">
          {images.map((src, i) => (
            <div
              className={i === 0 ? "wcs-index wcs-active" : "wcs-index"}
              key={`indicator-${src}`}
              style={{ backgroundColor: accent }}
            />
          ))}
        </div>

        <div className="wcs-link">
          <div className="wcs-link-wrapper">
            <a href={linkUrls[0] ?? "#"}>
              <svg
                aria-hidden="true"
                height="300"
                viewBox="0 0 100 100"
                width="300"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50,10 A40,40 0 1,1 49.9999,10"
                  fill="none"
                  id={pathId}
                  stroke={accent}
                  strokeWidth="0.75"
                />
              </svg>

              <div className="wcs-link-label">
                <div className="wcs-line wcs-line-1">
                  <p style={{ color: accent }}>{linkLines[0]}</p>
                </div>
                <div className="wcs-line wcs-line-2">
                  <p style={{ color: accent }}>{linkLines[1]}</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap");

.wcs-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #000;
  font-family: "Archivo", sans-serif;
}

.wcs-root * {
  box-sizing: border-box;
}

.wcs-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

.wcs-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.wcs-slider {
  position: relative;
  width: 100%;
  height: 100%;
}

.wcs-slide {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  clip-path: polygon(0 100%, 100% 100%, 100% 100%, 0 100%);
}

.wcs-slide img {
  position: relative;
}

.wcs-slide-first {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.wcs-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10000;
}

.wcs-title {
  position: absolute;
  top: 85%;
  left: 45%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 0.25em;
  text-transform: uppercase;
  will-change: transform;
}

.wcs-prefix span {
  padding: 0 0.25em;
}

.wcs-postfix {
  position: relative;
  top: 0;
  will-change: transform;
}

.wcs-indicator {
  position: absolute;
  top: 0;
  right: 1em;
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1em;
  z-index: 10;
}

.wcs-index {
  width: 100%;
  height: 2px;
  transform: scaleX(0.5);
  opacity: 1;
  transform-origin: right center;
}

.wcs-index.wcs-active {
  transform: scaleX(1);
}

.wcs-link {
  position: absolute;
  top: 75%;
  left: 75%;
  transform: translate(-50%, -50%);
  width: 350px;
  height: 350px;
  z-index: 10000;
}

.wcs-link-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  will-change: transform;
  pointer-events: auto;
  cursor: pointer;
}

.wcs-link-wrapper a {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.wcs-link-label {
  position: absolute;
  top: 47.5%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wcs-link-label p {
  margin: 0;
  text-transform: uppercase;
  font-size: 24px;
}

.wcs-line {
  height: 28px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.wcs-line-1 {
  position: relative;
  width: 80px;
  left: -4px;
}

.wcs-line-2 {
  position: relative;
  width: 120px;
  left: 32px;
}

.wcs-line p {
  position: absolute;
  transform: translateY(0);
  will-change: transform;
}

.wcs-root svg,
.wcs-link-label {
  pointer-events: none;
}

@media (max-width: 900px) {
  .wcs-title {
    top: 60%;
    left: 55%;
    font-size: 40px !important;
    line-height: 42px !important;
    clip-path: polygon(0 0, 100% 0, 100% 42px, 0 42px) !important;
  }

  .wcs-indicator {
    width: 40px;
    padding-bottom: 2em;
    justify-content: flex-end;
  }

  .wcs-link {
    left: 50%;
  }
}
`;

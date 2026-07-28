"use client";

/**
 * Split Click Slider - the whole frame is the control: clicking its left half
 * goes back, the right half goes forward. Each change stacks a new full-bleed
 * layer on top and wipes it open from the edge you came from, while the picture
 * inside both the old and the new layer slides five hundred pixels in that same
 * direction, so the two images parallax against each other instead of one
 * simply covering the other. The counter and title are single strips stepped by
 * exactly one row, and the two plus marks accumulate a quarter turn per change,
 * so they keep winding rather than resetting.
 *
 * Layers are stacked and the oldest is dropped once more than the slide count
 * exist, so the DOM never grows past that.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/split-click-slider";

export interface SplitClickSlide {
  title: string;
  image: string;
}

export interface SplitClickSliderProps {
  slides?: SplitClickSlide[];
  navLinks?: string[];
  /** Row height of the counter strip, in px. */
  counterStep?: number;
  /** Row height of the title strip, in px. */
  titleStep?: number;
}

const DEFAULT_SLIDES: SplitClickSlide[] = [
  { title: "The Revival Ensemble", image: `${ASSET_BASE}/img1.jpg` },
  { title: "Above The Canvas", image: `${ASSET_BASE}/img2.jpg` },
  { title: "Harmony in Every Note", image: `${ASSET_BASE}/img3.jpg` },
  { title: "Redefining Imagination", image: `${ASSET_BASE}/img4.jpg` },
  { title: "From Earth to Expression", image: `${ASSET_BASE}/img5.jpg` },
];

export default function SplitClickSlider({
  slides = DEFAULT_SLIDES,
  navLinks = ["Work", "About"],
  counterStep = 20,
  titleStep = 60,
}: SplitClickSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "scs-hop",
      "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1",
    );

    const slider = root.querySelector<HTMLElement>(".scs-slider");
    const sliderImages = root.querySelector<HTMLElement>(".scs-slider-images");
    const counter = root.querySelector<HTMLElement>(".scs-counter");
    const titles = root.querySelector<HTMLElement>(".scs-title-wrapper");
    const indicators = root.querySelectorAll<HTMLElement>(".scs-indicators p");
    const prevSlides = root.querySelectorAll<HTMLElement>(
      ".scs-preview-list .scs-preview",
    );
    const slidePreview = root.querySelector<HTMLElement>(".scs-preview-list");
    if (!slider || !sliderImages || !counter || !titles || !slidePreview)
      return;

    let currentImg = 1;
    const totalSlides = slides.length;
    let indicatorRotation = 0;

    function updateCounterAndTitlePosition() {
      gsap.to(counter, {
        y: -counterStep * (currentImg - 1),
        duration: 1,
        ease: "scs-hop",
      });
      gsap.to(titles, {
        y: -titleStep * (currentImg - 1),
        duration: 1,
        ease: "scs-hop",
      });
    }

    function updateActiveSlidePreview() {
      for (const prev of prevSlides) prev.classList.remove("scs-active");
      prevSlides[currentImg - 1]?.classList.add("scs-active");
    }

    function cleanupSlides() {
      const imgElements = root?.querySelectorAll(".scs-slider-images .scs-img");
      if (imgElements && imgElements.length > totalSlides) {
        imgElements[0].remove();
      }
    }

    function animateSlide(direction: "left" | "right") {
      const allImgs = root?.querySelectorAll<HTMLElement>(".scs-img");
      if (!allImgs?.length) return;
      const currentSlide = allImgs[allImgs.length - 1];

      const slideImg = document.createElement("div");
      slideImg.classList.add("scs-img");

      const slideImgElem = document.createElement("img");
      slideImgElem.src = slides[currentImg - 1].image;
      slideImgElem.alt = "";
      slideImgElem.draggable = false;
      gsap.set(slideImgElem, { x: direction === "left" ? -500 : 500 });

      slideImg.appendChild(slideImgElem);
      sliderImages?.appendChild(slideImg);

      gsap.to(currentSlide.querySelector("img"), {
        x: direction === "left" ? 500 : -500,
        duration: 1.5,
        ease: "scs-hop",
      });

      gsap.fromTo(
        slideImg,
        {
          clipPath:
            direction === "left"
              ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
              : "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
        },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.5,
          ease: "scs-hop",
        },
      );
      gsap.to(slideImgElem, { x: 0, duration: 1.5, ease: "scs-hop" });

      cleanupSlides();

      indicatorRotation += direction === "left" ? -90 : 90;
      gsap.to(indicators, {
        rotate: indicatorRotation,
        duration: 1,
        ease: "scs-hop",
      });
    }

    // The source binds to document and reads clientX against the window. Here
    // it is bound to the slider and measured against its own rect, so the split
    // is the component's midpoint rather than the screen's.
    const onClick = (event: MouseEvent) => {
      const rect = slider.getBoundingClientRect();
      const clickPosition = event.clientX - rect.left;
      const target = event.target as HTMLElement;

      if (slidePreview.contains(target)) {
        const clickedPrev = target.closest<HTMLElement>(".scs-preview");
        if (clickedPrev) {
          const clickedIndex = Array.from(prevSlides).indexOf(clickedPrev) + 1;
          if (clickedIndex !== currentImg) {
            const direction = clickedIndex < currentImg ? "left" : "right";
            currentImg = clickedIndex;
            animateSlide(direction);
            updateActiveSlidePreview();
            updateCounterAndTitlePosition();
          }
        }
        return;
      }

      if (clickPosition < rect.width / 2 && currentImg !== 1) {
        currentImg--;
        animateSlide("left");
      } else if (clickPosition > rect.width / 2 && currentImg !== totalSlides) {
        currentImg++;
        animateSlide("right");
      }

      updateActiveSlidePreview();
      updateCounterAndTitlePosition();
    };
    slider.addEventListener("click", onClick);

    return () => {
      slider.removeEventListener("click", onClick);
      gsap.killTweensOf([counter, titles, indicators]);
      const extra = root.querySelectorAll(".scs-slider-images .scs-img");
      extra.forEach((el, i) => {
        if (i > 0) el.remove();
      });
    };
  }, [slides, counterStep, titleStep]);

  return (
    <div className="scs-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="scs-nav">
        {navLinks.map((link, i) => (
          <a className={i === 0 ? "scs-nav-active" : ""} href="#nav" key={link}>
            {link}
          </a>
        ))}
      </nav>

      <div className="scs-slider">
        <div className="scs-slider-images">
          <div className="scs-img">
            <img alt="" draggable={false} src={slides[0].image} />
          </div>
        </div>

        <div className="scs-title">
          <div className="scs-title-wrapper">
            {slides.map((slide) => (
              <p key={slide.title}>{slide.title}</p>
            ))}
          </div>
        </div>

        <div className="scs-counter-wrap">
          <div className="scs-counter">
            {slides.map((slide, i) => (
              <p key={`count-${slide.title}`}>{i + 1}</p>
            ))}
          </div>
          <div>
            <p>&mdash;</p>
          </div>
          <div>
            <p>{slides.length}</p>
          </div>
        </div>

        <div className="scs-preview-list">
          {slides.map((slide, i) => (
            <div
              className={i === 0 ? "scs-preview scs-active" : "scs-preview"}
              key={`preview-${slide.title}`}
            >
              <img alt="" draggable={false} src={slide.image} />
            </div>
          ))}
        </div>

        <div className="scs-indicators">
          <p>+</p>
          <p>+</p>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.scs-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Inter", sans-serif;
}

.scs-root * {
  box-sizing: border-box;
  user-select: none;
}

.scs-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scs-root a,
.scs-root p {
  margin: 0;
  text-decoration: none;
  color: #fff;
  font-size: 14px;
}

.scs-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: center;
  gap: 2em;
  z-index: 2;
}

.scs-nav a {
  opacity: 0.5;
}

.scs-nav a.scs-nav-active {
  opacity: 1;
}

.scs-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
}

.scs-slider-images {
  position: absolute;
  width: 100%;
  height: 100%;
}

.scs-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.scs-counter-wrap {
  position: absolute;
  bottom: 2em;
  left: 50%;
  transform: translateX(-50%);
  height: 24px;
  display: flex;
  gap: 0.5em;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.scs-counter-wrap > div {
  flex: 1;
}

.scs-counter-wrap p {
  line-height: 20px;
}

.scs-counter {
  position: relative;
  top: 0px;
  will-change: transform;
}

.scs-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 64px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.scs-title-wrapper {
  position: relative;
  width: 100%;
  top: 0px;
  text-align: center;
  will-change: transform;
}

.scs-title-wrapper p {
  font-size: 50px;
  line-height: 60px;
}

.scs-indicators {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  display: flex;
  justify-content: space-between;
}

.scs-indicators p {
  position: relative;
  font-size: 40px;
  font-weight: 200;
  will-change: transform;
}

.scs-preview-list {
  position: absolute;
  bottom: 2em;
  right: 2em;
  width: 35%;
  height: 50px;
  display: flex;
  gap: 1em;
}

.scs-preview {
  position: relative;
  flex: 1;
  cursor: pointer;
}

.scs-preview::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  transition: 0.3s ease-in-out;
}

.scs-preview.scs-active::after {
  background-color: rgba(0, 0, 0, 0);
}

@media (max-width: 900px) {
  .scs-indicators {
    width: 90%;
  }

  .scs-preview-list {
    width: 90%;
    bottom: 5em;
  }

  .scs-title-wrapper p {
    font-size: 30px;
  }
}
`;

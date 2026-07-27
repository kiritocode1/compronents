"use client";

/**
 * Rotating Panel Slider - three panels on an arc where the side ones are turned
 * a quarter turn on their own axis while the picture inside is counter-rotated
 * by the same amount, so the image stays upright while its frame lies flat.
 * Advancing moves each panel to the next station and re-opens or re-closes its
 * clip-path at the same time, so a card does not slide in, it unfolds into
 * place. A fourth panel is built off-frame at scale zero for the vacated slot
 * and the far one is scaled away, so the arc is always exactly three visible.
 * The title is per-character and enters from the direction of travel.
 *
 * Self-contained: it fills its own box, click a side panel or an index entry.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/rotating-panel-slider";

export interface RotatingPanelSlide {
  name: string;
  img: string;
}

export interface RotatingPanelSliderProps {
  slides?: RotatingPanelSlide[];
  brand?: string;
  navLink?: string;
  footerLeft?: string;
  footerRight?: string;
}

const DEFAULT_SLIDES: RotatingPanelSlide[] = [
  { name: "Serene Space", img: `${ASSET_BASE}/img1.jpg` },
  { name: "Gentle Horizon", img: `${ASSET_BASE}/img2.jpg` },
  { name: "Quiet Flow", img: `${ASSET_BASE}/img3.jpg` },
  { name: "Ethereal Light", img: `${ASSET_BASE}/img4.jpg` },
  { name: "Calm Drift", img: `${ASSET_BASE}/img5.jpg` },
  { name: "Subtle Balance", img: `${ASSET_BASE}/img6.jpg` },
  { name: "Soft Whisper", img: `${ASSET_BASE}/img7.jpg` },
];

export default function RotatingPanelSlider({
  slides = DEFAULT_SLIDES,
  brand = "BLANK",
  navLink = "Watch Showreel",
  footerLeft = "Experiment 0394, 24",
  footerRight = "By BLANK",
}: RotatingPanelSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "rps-hop",
      "M0,0 C0.488,0.02 0.467,0.286 0.5,0.5 0.532,0.712 0.58,1 1,1",
    );

    const slider = root.querySelector<HTMLElement>(".rps-slider");
    const sliderTitle = root.querySelector<HTMLElement>(".rps-title");
    const sliderCounter = root.querySelector<HTMLElement>(
      ".rps-counter p span:first-child",
    );
    const sliderItems = root.querySelector<HTMLElement>(".rps-items");
    const sliderPreview = root.querySelector<HTMLElement>(".rps-preview");
    if (
      !slider ||
      !sliderTitle ||
      !sliderCounter ||
      !sliderItems ||
      !sliderPreview
    )
      return;

    const totalSlides = slides.length;
    let activeSlideIndex = 1;
    let isAnimating = false;

    const clipPath = {
      closed: "polygon(25% 30%, 75% 30%, 75% 70%, 25% 70%)",
      open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    };

    const slidePositions = {
      prev: { left: "15%", rotation: -90 },
      active: { left: "50%", rotation: 0 },
      next: { left: "85%", rotation: 90 },
    } as const;

    function splitTextIntoSpans(element: HTMLElement) {
      element.innerHTML = element.innerText
        .split("")
        .map((char) => `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`)
        .join("");
    }

    function createAndAnimateTitle(
      content: RotatingPanelSlide,
      direction: "next" | "prev",
    ) {
      const newTitle = document.createElement("h1");
      newTitle.innerText = content.name;
      sliderTitle?.appendChild(newTitle);
      splitTextIntoSpans(newTitle);

      const yOffset = direction === "next" ? 60 : -60;
      gsap.set(newTitle.querySelectorAll("span"), { y: yOffset });
      gsap.to(newTitle.querySelectorAll("span"), {
        y: 0,
        duration: 1.25,
        stagger: 0.02,
        ease: "rps-hop",
        delay: 0.25,
      });

      const currentTitle = sliderTitle?.querySelector<HTMLElement>(
        "h1:not(:last-child)",
      );
      if (currentTitle) {
        gsap.to(currentTitle.querySelectorAll("span"), {
          y: -yOffset,
          duration: 1.25,
          stagger: 0.02,
          ease: "rps-hop",
          delay: 0.25,
          onComplete: () => currentTitle.remove(),
        });
      }
    }

    function createSlide(content: RotatingPanelSlide, className: string) {
      const slide = document.createElement("div");
      slide.className = `rps-slide-container ${className}`;
      slide.innerHTML = `<div class="rps-slide-img"><img src="${content.img}" alt="${content.name}" draggable="false"></div>`;
      return slide;
    }

    function getSlideIndex(increment: number) {
      return (
        ((activeSlideIndex + increment - 1 + totalSlides) % totalSlides) + 1
      );
    }

    function updateCounterAndHighlight(index: number) {
      if (sliderCounter) sliderCounter.textContent = String(index);
      sliderItems
        ?.querySelectorAll("p")
        .forEach((item, i) =>
          item.classList.toggle("rps-activeItem", i === index - 1),
        );
    }

    function updatePreviewImage(content: RotatingPanelSlide) {
      const newImage = document.createElement("img");
      newImage.src = content.img;
      newImage.alt = content.name;
      newImage.draggable = false;
      sliderPreview?.appendChild(newImage);

      gsap.fromTo(
        newImage,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
          delay: 0.5,
          onComplete: () =>
            sliderPreview?.querySelector("img:not(:last-child)")?.remove(),
        },
      );
    }

    function animateSlide(
      slide: Element | null,
      props: { left: string; rotation: number; clipPath: string },
    ) {
      if (!slide) return;
      gsap.to(slide, { ...props, duration: 2, ease: "rps-hop" });
      gsap.to(slide.querySelector(".rps-slide-img"), {
        rotation: -props.rotation,
        duration: 2,
        ease: "rps-hop",
      });
    }

    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    function transitionSlides(direction: "next" | "prev") {
      if (isAnimating || !slider) return;
      isAnimating = true;

      const [outgoingPos, incomingPos] =
        direction === "next"
          ? (["prev", "next"] as const)
          : (["next", "prev"] as const);

      const outgoingSlide = slider.querySelector(`.${outgoingPos}`);
      const activeSlide = slider.querySelector(".active");
      const incomingSlide = slider.querySelector(`.${incomingPos}`);

      animateSlide(incomingSlide, {
        ...slidePositions.active,
        clipPath: clipPath.open,
      });
      animateSlide(activeSlide, {
        ...slidePositions[outgoingPos],
        clipPath: clipPath.closed,
      });
      gsap.to(outgoingSlide, {
        scale: 0,
        opacity: 0,
        duration: 2,
        ease: "rps-hop",
      });

      const newSlideIndex = getSlideIndex(direction === "next" ? 2 : -2);
      const newSlide = createSlide(slides[newSlideIndex - 1], incomingPos);
      slider.appendChild(newSlide);
      gsap.set(newSlide, {
        ...slidePositions[incomingPos],
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        opacity: 0,
        clipPath: clipPath.closed,
      });
      gsap.to(newSlide, { scale: 1, opacity: 1, duration: 2, ease: "rps-hop" });

      const nextActiveIndex = getSlideIndex(direction === "next" ? 1 : -1);
      createAndAnimateTitle(slides[nextActiveIndex - 1], direction);
      updatePreviewImage(slides[nextActiveIndex - 1]);

      const t1 = setTimeout(() => {
        updateCounterAndHighlight(nextActiveIndex);
        timeouts.delete(t1);
      }, 1000);
      timeouts.add(t1);

      const t2 = setTimeout(() => {
        outgoingSlide?.remove();
        if (activeSlide)
          activeSlide.className = `rps-slide-container ${outgoingPos}`;
        if (incomingSlide)
          incomingSlide.className = "rps-slide-container active";
        newSlide.className = `rps-slide-container ${incomingPos}`;
        activeSlideIndex = nextActiveIndex;
        isAnimating = false;
        timeouts.delete(t2);
      }, 2000);
      timeouts.add(t2);
    }

    const onClick = (e: MouseEvent) => {
      const clickedSlide = (e.target as HTMLElement).closest(
        ".rps-slide-container",
      );
      if (clickedSlide && !isAnimating) {
        transitionSlides(
          clickedSlide.classList.contains("next") ? "next" : "prev",
        );
      }
    };
    slider.addEventListener("click", onClick);

    const ctx = gsap.context(() => {
      for (const [key, value] of Object.entries(slidePositions)) {
        gsap.set(`.rps-slide-container.${key}`, {
          ...value,
          xPercent: -50,
          yPercent: -50,
          clipPath: key === "active" ? clipPath.open : clipPath.closed,
        });
        if (key !== "active") {
          gsap.set(`.rps-slide-container.${key} .rps-slide-img`, {
            rotation: -value.rotation,
          });
        }
      }
    }, root);

    const initialTitle = sliderTitle.querySelector<HTMLElement>("h1");
    if (initialTitle) {
      splitTextIntoSpans(initialTitle);
      gsap.fromTo(
        initialTitle.querySelectorAll("span"),
        { y: 60 },
        { y: 0, duration: 1, stagger: 0.02, ease: "rps-hop" },
      );
    }

    updateCounterAndHighlight(activeSlideIndex);

    const itemCleanups: (() => void)[] = [];
    sliderItems.querySelectorAll("p").forEach((item, index) => {
      const onItemClick = () => {
        if (index + 1 !== activeSlideIndex && !isAnimating) {
          transitionSlides(index + 1 > activeSlideIndex ? "next" : "prev");
        }
      };
      item.addEventListener("click", onItemClick);
      itemCleanups.push(() => item.removeEventListener("click", onItemClick));
    });

    return () => {
      slider.removeEventListener("click", onClick);
      for (const cleanup of itemCleanups) cleanup();
      for (const timeout of timeouts) clearTimeout(timeout);
      ctx.revert();
      gsap.killTweensOf(slider.querySelectorAll("*"));
    };
  }, [slides]);

  return (
    <div className="rps-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="rps-nav">
        <a className="rps-logo" href="#brand">
          {brand}
        </a>
        <a href="#showreel">{navLink}</a>
      </nav>

      <div className="rps-slider">
        <div className="rps-slide-container prev">
          <div className="rps-slide-img">
            <img
              alt={slides[slides.length - 1].name}
              draggable={false}
              src={slides[slides.length - 1].img}
            />
          </div>
        </div>
        <div className="rps-slide-container active">
          <div className="rps-slide-img">
            <img alt={slides[0].name} draggable={false} src={slides[0].img} />
          </div>
        </div>
        <div className="rps-slide-container next">
          <div className="rps-slide-img">
            <img alt={slides[1].name} draggable={false} src={slides[1].img} />
          </div>
        </div>

        <div className="rps-title">
          <h1>{slides[0].name}</h1>
        </div>

        <div className="rps-counter">
          <p>
            <span>1</span>
            <span>/</span>
            <span>{totalSlidesLabel(slides.length)}</span>
          </p>
        </div>

        <div className="rps-items">
          {slides.map((slide, i) => (
            <p className={i === 0 ? "rps-activeItem" : ""} key={slide.name}>
              {slide.name}
            </p>
          ))}
        </div>

        <div className="rps-preview">
          <img alt="" draggable={false} src={slides[0].img} />
        </div>
      </div>

      <footer className="rps-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>
    </div>
  );
}

function totalSlidesLabel(count: number) {
  return String(count);
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Inter:opsz,wght@14..32,100..900&display=swap");

.rps-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  background-color: #0f0f0f;
  color: #fff;
  font-family: "Inter", sans-serif;
}

.rps-root * {
  box-sizing: border-box;
}

.rps-root p,
.rps-root a {
  margin: 0;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  color: #5e5e5e;
  text-transform: uppercase;
}

.rps-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rps-nav {
  position: absolute;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.rps-nav a.rps-logo {
  font-family: "Anton", sans-serif;
  font-size: 40px;
  color: #d2d2d2;
}

.rps-slider {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.rps-slide-container {
  position: absolute;
  width: 30%;
  height: 70%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #000;
  cursor: pointer;
  will-change: transform, opacity, clip-path;
  z-index: 2;
}

.rps-slide-img {
  position: absolute;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.rps-slide-img img {
  transform: scale(1.5);
  opacity: 0.75;
  will-change: transform;
}

.rps-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 60px;
  text-align: center;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  z-index: 10;
}

.rps-title h1 {
  position: absolute;
  width: 100%;
  height: 50px;
  margin: 0;
  text-align: center;
  color: #fff;
  font-size: 50px;
  font-weight: 500;
}

.rps-title h1 span {
  position: relative;
  display: inline-block;
  transform: translateY(50px);
  will-change: transform;
}

.rps-counter {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 2.5em;
  text-align: center;
  z-index: 2;
}

.rps-counter p {
  display: flex;
  gap: 1em;
  justify-content: center;
  color: #fff;
}

.rps-items {
  position: absolute;
  left: 2.5em;
  bottom: 2.5em;
  z-index: 2;
}

.rps-items p {
  transition: 0.5s color;
  cursor: pointer;
}

.rps-items p.rps-activeItem {
  color: #fff;
}

.rps-preview {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  width: 75%;
  margin: 0 auto;
  height: 100%;
  z-index: 0;
  opacity: 0.5;
  overflow: hidden;
}

.rps-preview img {
  position: absolute;
  top: 0;
  animation: rps-pan 20s infinite linear;
}

@keyframes rps-pan {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

.rps-footer {
  position: absolute;
  right: 2em;
  bottom: 2em;
  z-index: 10;
  text-align: right;
}

@media (max-width: 900px) {
  .rps-slide-container {
    top: 75%;
    width: 70%;
    height: 50%;
  }

  .rps-preview {
    top: 0;
    left: 0;
    transform: translateX(0%);
    width: 100%;
    height: 100%;
  }
}
`;

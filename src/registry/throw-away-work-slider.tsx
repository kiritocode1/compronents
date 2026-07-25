"use client";

/**
 * Throw Away Work Slider - a wheel-driven project slider where the outgoing
 * slide is thrown rather than faded. It shrinks to a quarter, rotates thirty
 * degrees and flies two viewports off screen, while the incoming one enters
 * from the opposite edge through a narrow clip path that widens to full frame.
 * Copy is split fresh on every slide, so words and lines climb out from behind
 * their own masks on a staggered timeline. Input is rate limited to one slide
 * per second so a fast scroll cannot stack transitions.
 *
 * Self-contained: it fills its own box and reads the wheel over itself.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/throw-away-work-slider";

export interface WorkSlide {
  slideTitle: string;
  slideDescription: string;
  slideUrl: string;
  slideTags: string[];
  slideImg: string;
}

export interface ThrowAwayWorkSliderProps {
  slides?: WorkSlide[];
  linkLabel?: string;
  tagsLabel?: string;
}

const DEFAULT_SLIDES: WorkSlide[] = [
  {
    slideTitle: "Monochrome Signal",
    slideDescription:
      "A stripped-back visual experience blending luxury fashion with streetwear edge. Designed for bold statements and minimal distractions.",
    slideUrl: "/projects/monochrome-signal",
    slideTags: ["Monochrome", "Editorial", "Fashion", "Visual Identity"],
    slideImg: `${ASSET_BASE}/slide-img-1.jpg`,
  },
  {
    slideTitle: "Mecha Muse",
    slideDescription:
      "An experimental microsite blurring the line between human and machine. Cinematic visuals and deep red hues evoke a futuristic mythos.",
    slideUrl: "/projects/mecha-muse",
    slideTags: ["Cyberpunk", "Experimental", "3D Layers", "Concept Design"],
    slideImg: `${ASSET_BASE}/slide-img-2.jpg`,
  },
  {
    slideTitle: "Neon Bloom",
    slideDescription:
      "A surreal fusion of light, shadow, and sound. This project celebrates contrast and silhouette in a dreamlike digital space.",
    slideUrl: "/projects/neon-bloom",
    slideTags: ["Surreal", "Lightplay", "Immersive", "Visual Narrative"],
    slideImg: `${ASSET_BASE}/slide-img-3.jpg`,
  },
  {
    slideTitle: "Chromawave",
    slideDescription:
      "A glossy, synth-infused interface for creators at the edge of music and fashion. Perfect for launch drops or digital showrooms.",
    slideUrl: "/projects/chromawave",
    slideTags: ["Futuristic", "Glassmorphism", "Music", "Creative Tech"],
    slideImg: `${ASSET_BASE}/slide-img-4.jpg`,
  },
];

export default function ThrowAwayWorkSlider({
  slides = DEFAULT_SLIDES,
  linkLabel = "View Project",
  tagsLabel = "Tags",
}: ThrowAwayWorkSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!slides.length) return;
    gsap.registerPlugin(SplitText);

    const slider = root.querySelector<HTMLElement>(".kws-slider");
    if (!slider) return;

    const totalSlides = slides.length;
    let currentSlide = 1;

    let isAnimating = false;
    let scrollAllowed = true;
    let lastScrollTime = 0;
    let buildTimer = 0;

    const createSlide = (slideIndex: number) => {
      const slideData = slides[slideIndex - 1];

      const slide = document.createElement("div");
      slide.className = "kws-slide";

      const slideImg = document.createElement("div");
      slideImg.className = "kws-slide-img";
      const img = document.createElement("img");
      img.src = slideData.slideImg;
      img.alt = "";
      slideImg.appendChild(img);

      const slideHeader = document.createElement("div");
      slideHeader.className = "kws-slide-header";

      const slideTitle = document.createElement("div");
      slideTitle.className = "kws-slide-title";
      const h1 = document.createElement("h1");
      h1.textContent = slideData.slideTitle;
      slideTitle.appendChild(h1);

      const slideDescription = document.createElement("div");
      slideDescription.className = "kws-slide-description";
      const p = document.createElement("p");
      p.textContent = slideData.slideDescription;
      slideDescription.appendChild(p);

      const slideLink = document.createElement("div");
      slideLink.className = "kws-slide-link";
      const a = document.createElement("a");
      a.href = slideData.slideUrl;
      a.textContent = linkLabel;
      slideLink.appendChild(a);

      slideHeader.append(slideTitle, slideDescription, slideLink);

      const slideInfo = document.createElement("div");
      slideInfo.className = "kws-slide-info";

      const slideTags = document.createElement("div");
      slideTags.className = "kws-slide-tags";
      const tagsLabelEl = document.createElement("p");
      tagsLabelEl.textContent = tagsLabel;
      slideTags.appendChild(tagsLabelEl);

      for (const tag of slideData.slideTags) {
        const tagP = document.createElement("p");
        tagP.textContent = tag;
        slideTags.appendChild(tagP);
      }

      const slideIndexWrapper = document.createElement("div");
      slideIndexWrapper.className = "kws-slide-index-wrapper";
      const slideIndexCopy = document.createElement("p");
      slideIndexCopy.textContent = slideIndex.toString().padStart(2, "0");
      const slideIndexSeparator = document.createElement("p");
      slideIndexSeparator.textContent = "/";
      const slidesTotalCount = document.createElement("p");
      slidesTotalCount.textContent = totalSlides.toString().padStart(2, "0");

      slideIndexWrapper.append(
        slideIndexCopy,
        slideIndexSeparator,
        slidesTotalCount,
      );

      slideInfo.append(slideTags, slideIndexWrapper);
      slide.append(slideImg, slideHeader, slideInfo);

      return slide;
    };

    const splitSlideText = (slide: HTMLElement) => {
      const slideHeader = slide.querySelector<HTMLElement>(
        ".kws-slide-title h1",
      );
      if (slideHeader) {
        SplitText.create(slideHeader, {
          type: "words",
          wordsClass: "kws-word",
          mask: "words",
        });
      }

      for (const element of Array.from(
        slide.querySelectorAll<HTMLElement>("p, a"),
      )) {
        SplitText.create(element, {
          type: "lines",
          linesClass: "kws-line",
          mask: "lines",
          reduceWhiteSpace: false,
        });
      }
    };

    const animateSlide = (direction: "down" | "up") => {
      if (isAnimating || !scrollAllowed) return;

      isAnimating = true;
      scrollAllowed = false;

      const currentSlideElement =
        slider.querySelector<HTMLElement>(".kws-slide");
      if (!currentSlideElement) {
        isAnimating = false;
        scrollAllowed = true;
        return;
      }

      if (direction === "down") {
        currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
      } else {
        currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
      }

      const exitY = direction === "down" ? "-200%" : "200%";
      const entryY = direction === "down" ? "100%" : "-100%";
      const entryClipPath =
        direction === "down"
          ? "polygon(20% 20%, 80% 20%, 80% 100%, 20% 100%)"
          : "polygon(20% 0%, 80% 0%, 80% 80%, 20% 80%)";

      gsap.to(currentSlideElement, {
        scale: 0.25,
        opacity: 0,
        rotation: 30,
        y: exitY,
        duration: 2,
        ease: "power4.inOut",
        force3D: true,
        onComplete: () => {
          currentSlideElement.remove();
        },
      });

      buildTimer = window.setTimeout(() => {
        const newSlide = createSlide(currentSlide);

        gsap.set(newSlide, {
          y: entryY,
          clipPath: entryClipPath,
          force3D: true,
        });

        slider.appendChild(newSlide);

        splitSlideText(newSlide);

        const words = newSlide.querySelectorAll(".kws-word");
        const lines = newSlide.querySelectorAll(".kws-line");

        gsap.set([...Array.from(words), ...Array.from(lines)], {
          y: "100%",
          force3D: true,
        });

        gsap.to(newSlide, {
          y: 0,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.5,
          ease: "power4.out",
          force3D: true,
          onStart: () => {
            const tl = gsap.timeline();

            const headerWords = newSlide.querySelectorAll(
              ".kws-slide-title .kws-word",
            );
            tl.to(
              headerWords,
              {
                y: "0%",
                duration: 1,
                ease: "power4.out",
                stagger: 0.1,
                force3D: true,
              },
              0.75,
            );

            const tagsLines = newSlide.querySelectorAll(
              ".kws-slide-tags .kws-line",
            );
            const indexLines = newSlide.querySelectorAll(
              ".kws-slide-index-wrapper .kws-line",
            );
            const descriptionLines = newSlide.querySelectorAll(
              ".kws-slide-description .kws-line",
            );

            tl.to(
              tagsLines,
              { y: "0%", duration: 1, ease: "power4.out", stagger: 0.1 },
              "-=0.75",
            );

            tl.to(
              indexLines,
              { y: "0%", duration: 1, ease: "power4.out", stagger: 0.1 },
              "<",
            );

            tl.to(
              descriptionLines,
              { y: "0%", duration: 1, ease: "power4.out", stagger: 0.1 },
              "<",
            );

            const linkLines = newSlide.querySelectorAll(
              ".kws-slide-link .kws-line",
            );
            tl.to(
              linkLines,
              { y: "0%", duration: 1, ease: "power4.out" },
              "-=1",
            );
          },
          onComplete: () => {
            isAnimating = false;
            window.setTimeout(() => {
              scrollAllowed = true;
              lastScrollTime = performance.now();
            }, 100);
          },
        });
      }, 750);
    };

    const handleScroll = (direction: "down" | "up") => {
      const now = performance.now();

      if (isAnimating || !scrollAllowed) return;
      if (now - lastScrollTime < 1000) return;

      lastScrollTime = now;
      animateSlide(direction);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleScroll(e.deltaY > 0 ? "down" : "up");
    };

    let touchStartY = 0;
    let isTouchActive = false;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      isTouchActive = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isTouchActive || isAnimating || !scrollAllowed) return;

      const touchCurrentY = e.touches[0].clientY;
      const difference = touchStartY - touchCurrentY;

      if (Math.abs(difference) > 50) {
        isTouchActive = false;
        handleScroll(difference > 0 ? "down" : "up");
      }
    };

    const onTouchEnd = () => {
      isTouchActive = false;
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: false });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd);

    const firstSlide = slider.querySelector<HTMLElement>(".kws-slide");
    if (firstSlide) splitSlideText(firstSlide);

    return () => {
      clearTimeout(buildTimer);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
    };
  }, [slides, linkLabel, tagsLabel]);

  const first = slides[0];

  return (
    <div className="kws-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="kws-slider">
        <div className="kws-slide">
          <div className="kws-slide-img">
            <img src={first?.slideImg} alt="" />
          </div>

          <div className="kws-slide-header">
            <div className="kws-slide-title">
              <h1>{first?.slideTitle}</h1>
            </div>
            <div className="kws-slide-description">
              <p>{first?.slideDescription}</p>
            </div>
            <div className="kws-slide-link">
              <a href={first?.slideUrl}>{linkLabel}</a>
            </div>
          </div>

          <div className="kws-slide-info">
            <div className="kws-slide-tags">
              <p>{tagsLabel}</p>
              {first?.slideTags.map((tag) => (
                <p key={tag}>{tag}</p>
              ))}
            </div>
            <div className="kws-slide-index-wrapper">
              <p>01</p>
              <p>/</p>
              <p>{slides.length.toString().padStart(2, "0")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.kws-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "DM Sans", sans-serif;
  background-color: #000;
}
.kws-root * { margin: 0; padding: 0; box-sizing: border-box; }
.kws-root img { width: 100%; height: 100%; object-fit: cover; }
.kws-root h1,
.kws-root p,
.kws-root a {
  text-transform: uppercase;
  color: #fff;
}
.kws-root h1 {
  font-size: 5rem;
  font-weight: 600;
  letter-spacing: -0.1rem;
}
.kws-root p,
.kws-root a {
  text-decoration: none;
  font-family: "DM Mono", monospace;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: -0.01rem;
}
.kws-slider {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  overflow: hidden;
}
.kws-slide,
.kws-slide-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.kws-slide { will-change: transform; }
.kws-slide-header {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 75%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  z-index: 1;
}
.kws-slide-description {
  width: 60%;
  text-align: center;
  margin-bottom: 1rem;
}
.kws-slide-info {
  position: absolute;
  left: 0;
  bottom: 2rem;
  width: 100%;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.kws-slide-tags { display: flex; flex-direction: column; }
.kws-slide-index-wrapper { display: flex; }
.kws-slide-index-wrapper p { text-align: center; width: 2rem; }
.kws-slide-tags p:first-child { margin-bottom: 1rem; }
.kws-line,
.kws-word {
  position: relative;
  display: inline-block;
  will-change: transform;
}

@media (max-width: 1000px) {
  .kws-root h1 { font-size: 2rem; letter-spacing: 0; }
  .kws-root p { font-size: 0.8rem; }
  .kws-slide-header {
    top: 50%;
    bottom: unset;
    transform: translate(-50%, -50%);
    width: 90%;
  }
  .kws-slide-description { width: 100%; }
}
`;

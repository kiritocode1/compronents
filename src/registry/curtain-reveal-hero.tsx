"use client";

/**
 * Curtain Reveal Hero - a long pinned hero that stages a full reveal on scroll.
 * A red wipe splits from a center seam to fill the frame, three images cascade
 * open from nothing with a clip-and-scale, and a closing statement scales up,
 * then that statement is cut down the middle and its two halves slide apart like
 * curtains to hand off to the next section. GSAP timeline ScrollTrigger + Lenis.
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

const ASSET_BASE = "https://ui.aryank.space/assets/curtain-reveal-hero";

export interface CurtainRevealHeroProps {
  heroImage?: string;
  heroHeading?: string;
  images?: [string, string, string];
  outroHeading?: string;
  aboutHeading?: string;
  aboutBody?: string;
  embedded?: boolean;
}

export default function CurtainRevealHero({
  heroImage = `${ASSET_BASE}/hero-bg.jpg`,
  heroHeading = "A modern approach to luxury living and timeless spaces",
  images = [
    `${ASSET_BASE}/hero-img-1.jpg`,
    `${ASSET_BASE}/hero-img-2.jpg`,
    `${ASSET_BASE}/hero-img-3.jpg`,
  ],
  outroHeading = "Thoughtfully crafted spaces designed to inspire modern living connections",
  aboutHeading = "Designing digital experiences that feel effortless",
  aboutBody = "From initial concept to final detail, every element is considered with purpose and clarity",
  embedded = true,
}: CurtainRevealHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".crh-content");
    const heroSection = root.querySelector<HTMLElement>(".crh-hero");
    const heroBackground = root.querySelector<HTMLElement>(".crh-hero-bg");
    const heroContent = root.querySelector<HTMLElement>(".crh-hero-content");
    const heroRevealer = root.querySelector<HTMLElement>(".crh-hero-revealer");
    const heroImagesWrapper =
      root.querySelector<HTMLElement>(".crh-hero-images");
    const heroOutroContent = root.querySelector<HTMLElement>(
      ".crh-hero-outro-content",
    );
    if (
      !content ||
      !heroSection ||
      !heroBackground ||
      !heroContent ||
      !heroRevealer ||
      !heroImagesWrapper ||
      !heroOutroContent
    )
      return;

    const heroImages = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".crh-hero-img"),
    );

    const outroClone = heroOutroContent.cloneNode(true) as HTMLElement;
    heroOutroContent.classList.add("crh-hero-outro-left");
    outroClone.classList.add("crh-hero-outro-right");
    outroClone.classList.remove("crh-hero-outro-left");
    heroOutroContent.parentNode?.appendChild(outroClone);

    gsap.set(heroOutroContent, {
      clipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)",
    });
    gsap.set(outroClone, {
      clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)",
    });
    gsap.set(heroImagesWrapper, { scale: 1 });

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        scroller,
        start: "top top",
        end: () =>
          `+=${(embedded ? root.clientHeight : window.innerHeight) * 7}`,
        pin: true,
        pinSpacing: false,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl.to(heroBackground, { scale: 1, duration: 0.5 }, 0);
    tl.to(
      heroRevealer,
      {
        clipPath: "polygon(49.5% 0%, 50.5% 0%, 50.5% 100%, 49.5% 100%)",
        duration: 0.2,
      },
      0,
    );
    tl.to(
      heroRevealer,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 0.3,
      },
      0.2,
    );

    const cascadeStart = 0.4;
    const cascadeStagger = 0.04;
    const cascadeDuration = 0.16;

    heroImages.forEach((heroImage, index) => {
      tl.to(
        heroImage,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          scale: 1,
          duration: cascadeDuration,
        },
        cascadeStart + index * cascadeStagger,
      );
    });

    tl.to(
      heroOutroContent,
      { scale: 1, duration: cascadeDuration },
      cascadeStart + heroImages.length * cascadeStagger + cascadeStagger * 0.5,
    );

    tl.set(
      [heroBackground, heroContent, heroRevealer, heroImagesWrapper],
      { autoAlpha: 0 },
      0.7,
    );
    tl.set(heroSection, { backgroundColor: "transparent" }, 0.7);
    tl.to(heroOutroContent, { xPercent: -150, duration: 0.3 }, 0.7);
    tl.to(outroClone, { xPercent: 50, duration: 0.3 }, 0.7);

    ScrollTrigger.refresh();

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      outroClone.remove();
      heroOutroContent.classList.remove("crh-hero-outro-left");
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, images]);

  return (
    <div
      className={embedded ? "crh-root crh-embedded" : "crh-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="crh-content">
        <section className="crh-hero">
          <div className="crh-hero-bg">
            <img alt="" draggable={false} src={heroImage} />
          </div>

          <div className="crh-hero-content">
            <h1>{heroHeading}</h1>
          </div>

          <div className="crh-hero-revealer" />

          <div className="crh-hero-images">
            {images.map((src, i) => (
              <div className="crh-hero-img" key={src}>
                <img alt={`Interior ${i + 1}`} draggable={false} src={src} />
              </div>
            ))}
          </div>

          <div className="crh-hero-outro-content">
            <h1>{outroHeading}</h1>
          </div>
        </section>

        <section className="crh-about">
          <div className="crh-about-content">
            <h3>{aboutHeading}</h3>
            <p>{aboutBody}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap");

.crh-root {
  --base-100: #f0f0e6;
  --base-200: #991f1f;
  --base-300: #0f0f0f;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--base-100);
  font-family: "DM Sans", sans-serif;
}

.crh-root.crh-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.crh-root.crh-embedded::-webkit-scrollbar {
  display: none;
}

.crh-content {
  position: relative;
  width: 100%;
}

.crh-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.crh-root h1,
.crh-root h3,
.crh-root p {
  margin: 0;
  text-transform: uppercase;
  font-weight: 500;
  line-height: 1;
}

.crh-root h1 {
  font-size: clamp(3rem, 4vw, 5rem);
}
.crh-root h3 {
  font-size: clamp(2rem, 3vw, 4rem);
}
.crh-root p {
  font-size: 1.1rem;
}

.crh-hero {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  z-index: 2;
  background-color: var(--base-100);
}

.crh-hero-bg,
.crh-hero-content,
.crh-hero-revealer,
.crh-hero-images {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.crh-hero-img,
.crh-hero-outro-content {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%) scale(0);
  will-change: transform;
}

.crh-hero-content,
.crh-hero-outro-content {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--base-100);
}

.crh-hero-content h1,
.crh-hero-outro-content h1 {
  width: 65%;
}

.crh-hero-outro-content {
  background-color: var(--base-200);
}

.crh-hero-bg {
  transform: scale(1.5);
}

.crh-hero-revealer {
  background-color: var(--base-200);
  clip-path: polygon(49.5% 50%, 50.5% 50%, 50.5% 50%, 49.5% 50%);
}

.crh-hero-img {
  clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
  will-change: clip-path;
}

.crh-about {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  background-color: var(--base-100);
  color: var(--base-300);
  margin-top: 500svh;
  z-index: 1;
}

.crh-about-content {
  width: 40%;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
}

@media (max-width: 1000px) {
  .crh-hero-content h1,
  .crh-hero-outro-content h1,
  .crh-about-content {
    width: 100%;
  }
}
`;

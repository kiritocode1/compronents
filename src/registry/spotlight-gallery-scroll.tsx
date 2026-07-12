"use client";

/**
 * Spotlight Gallery Scroll - a pinned hero where a giant three-column image wall
 * shrinks to a tidy grid as you scroll, a corner logo scales down and rides up
 * into place, the headline fades in word by word while the footer blurs away,
 * then the whole hero lifts and dims to hand off to the next sections. GSAP
 * ScrollTrigger + SplitText + Lenis.
 *
 * Owns a scroll container by default (`embedded`); set `embedded={false}` to
 * drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/spotlight-gallery-scroll";

export interface SpotlightGalleryScrollProps {
  images?: string[];
  logo?: string;
  heading?: string;
  buttonLabel?: string;
  footer?: string;
  studioHeading?: string;
  connectHeading?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 9 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function SpotlightGalleryScroll({
  images = DEFAULT_IMAGES,
  logo = `${ASSET_BASE}/logo.svg`,
  heading = "A living catalogue of images that shouldn't exist, collected frame by frame from the edge of the real.",
  buttonLabel = "Request Access",
  footer = "An archive of the unreal",
  studioHeading = "Studio",
  connectHeading = "Connect",
  embedded = true,
}: SpotlightGalleryScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".sgs-content");
    const hero = root.querySelector<HTMLElement>(".sgs-hero");
    const studio = root.querySelector<HTMLElement>(".sgs-studio");
    const gallery = root.querySelector<HTMLElement>(".sgs-gallery");
    const galleryImgs = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".sgs-item img"),
    );
    const logoEl = root.querySelector<HTMLElement>(".sgs-logo");
    const heroFooter = root.querySelector<HTMLElement>(".sgs-hero-footer");
    const heroInner = root.querySelector<HTMLElement>(".sgs-hero-inner");
    const heroOverlay = root.querySelector<HTMLElement>(".sgs-hero-overlay");
    const heroButton = root.querySelector<HTMLElement>(".sgs-btn");
    const headline = root.querySelector<HTMLElement>(".sgs-hero-header h3");
    if (
      !content ||
      !hero ||
      !studio ||
      !gallery ||
      !logoEl ||
      !heroFooter ||
      !heroInner ||
      !heroOverlay ||
      !heroButton ||
      !headline
    )
      return;

    const lerp = (from: number, to: number, t: number) =>
      from + (to - from) * t;
    const mapRange = (value: number, start: number, end: number) =>
      gsap.utils.clamp(0, 1, (value - start) / (end - start));

    const split = SplitText.create(headline, {
      type: "words",
      wordsClass: "sgs-word",
    });
    const fadeTargets = [...split.words, heroButton];
    gsap.set(fadeTargets, { opacity: 0 });
    const fadeStep = (0.6 - 0.1) / fadeTargets.length;
    const fadeDuration = fadeStep * 3;

    let logoStartScale = window.innerWidth <= 1000 ? 2 : 6;

    const scroller = embedded ? root : undefined;
    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const heroST = ScrollTrigger.create({
      trigger: hero,
      scroller,
      start: "top top",
      end: `+=${viewportHeight * 4}px`,
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
      onRefresh: () => {
        logoStartScale = window.innerWidth <= 1000 ? 2 : 6;
      },
      onUpdate: (self) => {
        const p = self.progress;
        const galleryProgress = mapRange(p, 0, 0.75);
        gsap.set(gallery, { scale: lerp(1, 0.5, galleryProgress) });
        gsap.set(galleryImgs, { scale: lerp(1.25, 1, galleryProgress) });

        const logoScale = lerp(logoStartScale, 1, galleryProgress);
        const oneRem = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        const logoScaledHeight = logoEl.offsetHeight * logoScale;
        const logoTravel = viewportHeight - logoScaledHeight - oneRem * 4;
        gsap.set(logoEl, {
          scale: logoScale,
          y: -logoTravel * galleryProgress,
        });

        const footerProgress = mapRange(p, 0.05, 0.25);
        gsap.set(heroFooter, {
          scale: lerp(1, 0.75, footerProgress),
          filter: `blur(${lerp(0, 20, footerProgress)}px)`,
          opacity: lerp(1, 0, footerProgress),
        });

        fadeTargets.forEach((target, index) => {
          const start = 0.1 + index * fadeStep;
          gsap.set(target, {
            opacity: mapRange(p, start, start + fadeDuration),
          });
        });
      },
    });

    const exitST = ScrollTrigger.create({
      trigger: studio,
      scroller,
      start: "top bottom",
      end: "top top",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(heroInner, { y: `${-25 * self.progress}%` });
        gsap.set(heroOverlay, { opacity: self.progress });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      heroST.kill();
      exitST.kill();
      split.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, images]);

  const cols = [images.slice(0, 3), images.slice(3, 6), images.slice(6, 9)];

  return (
    <div
      className={embedded ? "sgs-root sgs-embedded" : "sgs-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sgs-content">
        <div className="sgs-logo">
          <img src={logo} alt="" />
        </div>
        <section className="sgs-hero">
          <div className="sgs-hero-inner">
            <div className="sgs-gallery">
              {cols.map((col, ci) => (
                <div className="sgs-col" key={`col-${ci}`}>
                  {col.map((src, ri) => (
                    <div className="sgs-item" key={`${src}-${ri}`}>
                      <img src={src} alt="" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="sgs-hero-header">
              <h3>{heading}</h3>
              <a href="#a" className="sgs-btn">
                {buttonLabel}
              </a>
            </div>
            <div className="sgs-hero-footer">
              <h5>{footer}</h5>
            </div>
          </div>
          <div className="sgs-hero-overlay" />
        </section>
        <section className="sgs-studio">
          <h1>{studioHeading}</h1>
        </section>
        <section className="sgs-connect">
          <h1>{connectHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap");

.sgs-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Plus Jakarta Sans", sans-serif;
}
.sgs-root.sgs-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.sgs-root.sgs-embedded::-webkit-scrollbar { display: none; }
.sgs-content { position: relative; width: 100%; }
.sgs-root * { margin: 0; padding: 0; box-sizing: border-box; }
.sgs-root img { width: 100%; height: 100%; object-fit: cover; }
.sgs-root h1,
.sgs-root h3,
.sgs-root h5 { font-weight: 500; line-height: 1.25; letter-spacing: -0.04em; }
.sgs-root h1 { font-size: clamp(2rem, 4vw, 6rem); }
.sgs-root h3 { font-size: clamp(1.5rem, 2.5vw, 3.5rem); }
.sgs-root h5 { font-size: clamp(1.25rem, 2vw, 2.75rem); }
.sgs-btn {
  text-decoration: none;
  color: #000;
  background-color: #c4d600;
  padding: 1rem 2rem;
  border-radius: 0.25rem;
  font-weight: 500;
  width: max-content;
  will-change: opacity;
  opacity: 0;
}
.sgs-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.sgs-studio,
.sgs-connect {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #fff;
}
.sgs-hero { background-color: #0f0f0f; }
.sgs-studio { background-color: #58634a; margin-top: 300svh; }
.sgs-connect { background-color: #1c1f14; }

.sgs-gallery {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: calc(300% + 2rem);
  height: calc(300svh + 2rem);
  display: flex;
  gap: 1rem;
  will-change: transform;
}
.sgs-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(300svh + 2rem);
  gap: 1rem;
}
.sgs-item { position: relative; flex: 1; overflow: hidden; }
.sgs-item img { position: relative; transform: scale(1.25); will-change: transform; }

.sgs-logo {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  width: 6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(0px) scale(6);
  transform-origin: bottom left;
  will-change: transform;
  z-index: 10;
}
.sgs-hero-inner { position: relative; width: 100%; height: 100%; will-change: transform; }
.sgs-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0;
  will-change: opacity;
  pointer-events: none;
}
.sgs-hero-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  color: #fff;
}
.sgs-hero-footer {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  width: 200px;
  color: #fff;
  will-change: transform, filter;
}

@media (max-width: 1000px) {
  .sgs-logo { transform: translateY(0px) scale(2); }
  .sgs-hero-header { width: 100%; padding: 2rem; }
  .sgs-hero-footer {
    width: 200px;
    right: unset;
    left: 50%;
    bottom: 20svh;
    text-align: center;
    transform: translateX(-50%);
  }
}
`;

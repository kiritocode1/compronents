"use client";

/**
 * Showreel Zoom Scroll - a showreel that starts as a thumbnail floating above
 * the fold and grows into the frame as you scroll. The card tracks the pointer
 * horizontally while it is still small, drifting further the smaller it is, and
 * settles dead center once it reaches full size. Its caption shrinks on a two
 * stage curve so the type lands at reading size exactly when the video does.
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

export interface ShowreelZoomScrollProps {
  brand?: string;
  navLinks?: string[];
  heroHeading?: string;
  heroCopy?: string;
  scrollLabel?: string;
  videoSrc?: string;
  videoTitle?: string;
  videoYears?: string;
  outroCopy?: string;
  embedded?: boolean;
}

const DEFAULT_VIDEO =
  "https://ui.aryank.space/assets/halftone-scene-footer/mountain.mp4";

const BREAKPOINTS = [
  { maxWidth: 1000, translateY: -135, movMultiplier: 450 },
  { maxWidth: 1100, translateY: -130, movMultiplier: 500 },
  { maxWidth: 1200, translateY: -125, movMultiplier: 550 },
  { maxWidth: 1300, translateY: -120, movMultiplier: 600 },
];

export default function ShowreelZoomScroll({
  brand = "BLANK",
  navLinks = ["Home", "About", "Videos", "Contact"],
  heroHeading = "BLANK",
  heroCopy = "One library, every interface worth building.",
  scrollLabel = "(Scroll)",
  videoSrc = DEFAULT_VIDEO,
  videoTitle = "Studio Showreel",
  videoYears = "2023 - 2024",
  outroCopy = "Build without the clutter.",
  embedded = true,
}: ShowreelZoomScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".vck-content");
    const intro = root.querySelector<HTMLElement>(".vck-intro");
    const videoContainer = root.querySelector<HTMLElement>(
      ".vck-video-container-desktop",
    );
    if (!content || !intro || !videoContainer) return;

    const videoTitleElements = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".vck-video-container-desktop .vck-video-title p"),
    );

    const frameWidth = () => window.innerWidth;
    if (frameWidth() < 900) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const getInitialValues = () => {
      const width = frameWidth();
      for (const bp of BREAKPOINTS) {
        if (width <= bp.maxWidth) {
          return {
            translateY: bp.translateY,
            movementMultiplier: bp.movMultiplier,
          };
        }
      }
      return { translateY: -105, movementMultiplier: 650 };
    };

    const initialValues = getInitialValues();

    const animationState = {
      scrollProgress: 0,
      initialTranslateY: initialValues.translateY,
      currentTranslateY: initialValues.translateY,
      movementMultiplier: initialValues.movementMultiplier,
      scale: 0.25,
      fontSize: 80,
      gap: 2,
      targetMouseX: 0,
      currentMouseX: 0,
    };

    const onResize = () => {
      const newValues = getInitialValues();
      animationState.initialTranslateY = newValues.translateY;
      animationState.movementMultiplier = newValues.movementMultiplier;
      if (animationState.scrollProgress === 0) {
        animationState.currentTranslateY = newValues.translateY;
      }
    };
    window.addEventListener("resize", onResize);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: intro,
        scroller,
        start: "top bottom",
        end: "top 10%",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          animationState.scrollProgress = self.progress;

          animationState.currentTranslateY = gsap.utils.interpolate(
            animationState.initialTranslateY,
            0,
            animationState.scrollProgress,
          );

          animationState.scale = gsap.utils.interpolate(
            0.25,
            1,
            animationState.scrollProgress,
          );

          animationState.gap = gsap.utils.interpolate(
            2,
            1,
            animationState.scrollProgress,
          );

          if (animationState.scrollProgress <= 0.4) {
            const firstPartProgress = animationState.scrollProgress / 0.4;
            animationState.fontSize = gsap.utils.interpolate(
              80,
              40,
              firstPartProgress,
            );
          } else {
            const secondPartProgress =
              (animationState.scrollProgress - 0.4) / 0.6;
            animationState.fontSize = gsap.utils.interpolate(
              40,
              20,
              secondPartProgress,
            );
          }
        },
      },
    });

    const onMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      animationState.targetMouseX =
        ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    };
    root.addEventListener("mousemove", onMouseMove);

    let frame = 0;
    const animate = () => {
      if (frameWidth() < 900) {
        frame = requestAnimationFrame(animate);
        return;
      }

      const {
        scale,
        targetMouseX,
        currentMouseX,
        currentTranslateY,
        fontSize,
        gap,
        movementMultiplier,
      } = animationState;

      const scaledMovementMultiplier = (1 - scale) * movementMultiplier;

      const maxHorizontalMovement =
        scale < 0.95 ? targetMouseX * scaledMovementMultiplier : 0;

      animationState.currentMouseX = gsap.utils.interpolate(
        currentMouseX,
        maxHorizontalMovement,
        0.05,
      );

      videoContainer.style.transform = `translateY(${currentTranslateY}%) translateX(${animationState.currentMouseX}px) scale(${scale})`;
      videoContainer.style.gap = `${gap}em`;

      for (const element of videoTitleElements) {
        element.style.fontSize = `${fontSize}px`;
      }

      frame = requestAnimationFrame(animate);
    };
    animate();

    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      root.removeEventListener("mousemove", onMouseMove);
      timeline.scrollTrigger?.kill();
      timeline.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  const videoBlock = (variant: "desktop" | "mobile") => (
    <div className={`vck-video-container-${variant}`}>
      <div className="vck-video-preview">
        <div className="vck-video-wrapper">
          <video src={videoSrc} autoPlay loop muted playsInline />
        </div>
      </div>
      <div className="vck-video-title">
        <p>{videoTitle}</p>
        <p>{videoYears}</p>
      </div>
    </div>
  );

  return (
    <div
      className={embedded ? "vck-root vck-embedded" : "vck-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="vck-content">
        <nav className="vck-nav">
          <div className="vck-logo">
            <a href="#top">{brand}</a>
          </div>
          <div className="vck-links">
            {navLinks.map((link) => (
              <a href="#top" key={link}>
                {link}
              </a>
            ))}
          </div>
        </nav>

        <section className="vck-hero">
          <h1>{heroHeading}</h1>
          <div className="vck-hero-copy">
            <p>{heroCopy}</p>
            <p>{scrollLabel}</p>
          </div>
        </section>

        <section className="vck-intro">
          {videoBlock("desktop")}
          {videoBlock("mobile")}
        </section>

        <section className="vck-outro">
          <p>{outroCopy}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap");

.vck-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  color: #1a1a1a;
  background-color: #e3e3db;
  container-type: inline-size;
}
.vck-root.vck-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.vck-root.vck-embedded::-webkit-scrollbar { display: none; }
.vck-root * { margin: 0; padding: 0; box-sizing: border-box; }
.vck-content { position: relative; width: 100%; }
.vck-root h1 { font-size: 60px; font-weight: 500; }
.vck-root p { font-size: 20px; font-weight: 500; }
.vck-root a {
  text-decoration: none;
  color: #fff;
  font-size: 20px;
  font-weight: 500;
}
.vck-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2em 2.5em;
  display: flex;
  justify-content: space-between;
  mix-blend-mode: difference;
  z-index: 2;
}
.vck-links { display: flex; gap: 1em; }
.vck-root section {
  width: 100%;
  height: 100svh;
  padding: 2.5em;
}
.vck-hero {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 4em;
}
.vck-hero h1 {
  position: relative;
  left: -0.05em;
  text-transform: uppercase;
  font-weight: 500;
  font-size: 20cqw;
  letter-spacing: -0.04em;
  line-height: 1;
}
.vck-hero-copy {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.vck-outro {
  display: flex;
  justify-content: center;
  align-items: center;
}
.vck-intro { height: 100svh; }
.vck-video-container-desktop {
  position: relative;
  transform: translateY(-105%) scale(0.25);
  display: flex;
  flex-direction: column;
  gap: 2em;
  will-change: transform;
}
.vck-video-container-desktop .vck-video-title p {
  position: relative;
  font-size: 78px;
  font-weight: 500;
}
.vck-video-container-mobile {
  display: none;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.vck-video-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 1.5rem;
  background-color: #b9b9b3;
  overflow: hidden;
}
.vck-video-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 1.5rem;
  overflow: hidden;
}
.vck-video-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.5rem;
  pointer-events: none;
}
@media (max-width: 900px) {
  .vck-nav,
  .vck-root section { padding: 1.5em; }
  .vck-hero { justify-content: flex-end; gap: 2em; }
  .vck-hero h1 { font-size: 19cqw; }
  .vck-video-container-desktop { display: none; }
  .vck-video-container-mobile { display: flex; flex-direction: column; gap: 1em; }
}
`;

"use client";

/**
 * Mask Reveal Preloader - a one-shot intro: a logo slides in char by char over
 * a filling progress bar with a mix-blend footer line, then an SVG-shaped mask
 * (a rounded capsule cut out of a solid fill) scales up massively to punch
 * through and reveal the hero, whose image settles from a zoom while the
 * headline, footer copy, and pill buttons animate in.
 *
 * Fills its container, so it drops into any bounded box or a full-screen
 * section. Plays once when most of the component is visible; no scroll-driven
 * timeline is needed after it starts.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { IoArrowForwardSharp, IoMenuSharp } from "react-icons/io5";

const ASSET_BASE = "https://ui.aryank.space/assets/mask-reveal-preloader";

export interface MaskRevealPreloaderProps {
  heroImage?: string;
  maskShape?: string;
  logo?: string;
  preloaderCopy?: string;
  headline?: string;
  footerHeading?: string;
  footerText?: string;
  contactLabel?: string;
  menuLabel?: string;
}

export default function MaskRevealPreloader({
  heroImage = `${ASSET_BASE}/hero-img.jpg`,
  maskShape = `${ASSET_BASE}/mask.svg`,
  logo = "Obsidian",
  preloaderCopy = "Spaces unfold in light and shadow, where structure finds its quiet rhythm, and time align in harmony.",
  headline = "Obsidian",
  footerHeading = "Spaces defined through light and silence.",
  footerText = "Geometry and balance converge, creating environments that breathe with ease.",
  contactLabel = "Contact",
  menuLabel = "Menu",
}: MaskRevealPreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(SplitText);

    let active = true;
    let tl: gsap.core.Timeline | null = null;
    let observer: IntersectionObserver | null = null;
    const splits: SplitText[] = [];
    root.dataset.mrpState = "waiting";

    const start = () => {
      if (!active || tl) return;
      root.dataset.mrpState = "playing";

      const make = (selector: string, type: "chars" | "lines", cls: string) => {
        const s = SplitText.create(root.querySelectorAll(selector), {
          type,
          mask: type,
          [`${type}Class`]: cls,
        });
        splits.push(s);
        return s;
      };

      const logoChars = make(".mrp-logo h1", "chars", "mrp-char");
      const footerLines = make(".mrp-pre-footer p", "lines", "mrp-line");
      const headerChars = make(".mrp-header h1", "chars", "mrp-char");
      const heroFooterH3 = make(".mrp-hero-footer h3", "lines", "mrp-line");
      const heroFooterP = make(".mrp-hero-footer p", "lines", "mrp-line");
      const btnLabels = make(".mrp-btn-label span", "lines", "mrp-line");

      const q = (sel: string) => root.querySelectorAll(sel);
      const progress = root.querySelector<HTMLElement>(".mrp-progress");
      const progressBar = root.querySelector<HTMLElement>(".mrp-progress-bar");
      const mask = root.querySelector<HTMLElement>(".mrp-mask");
      const heroImage = root.querySelector<HTMLElement>(".mrp-hero-img");
      if (!progress || !progressBar || !mask || !heroImage) return;

      gsap.set(logoChars.chars, { x: "100%" });
      gsap.set(
        [
          footerLines.lines,
          headerChars.chars,
          heroFooterH3.lines,
          heroFooterP.lines,
          btnLabels.lines,
        ],
        { y: "100%" },
      );
      gsap.set(q(".mrp-btn-icon"), { clipPath: "circle(0% at 50% 50%)" });
      gsap.set(q(".mrp-btn"), { scale: 0 });

      const animateProgress = (duration = 4) => {
        const progressTl = gsap.timeline();
        const counterSteps = 5;
        let currentProgress = 0;
        for (let i = 0; i < counterSteps; i++) {
          const finalStep = i === counterSteps - 1;
          const targetProgress = finalStep
            ? 1
            : Math.min(currentProgress + Math.random() * 0.3 + 0.1, 0.9);
          currentProgress = targetProgress;
          progressTl.to(progressBar, {
            scaleX: targetProgress,
            duration: duration / counterSteps,
            ease: "power2.out",
          });
        }
        return progressTl;
      };

      tl = gsap.timeline({
        delay: 0.35,
        onComplete: () => {
          root.dataset.mrpState = "complete";
        },
      });

      tl.to(logoChars.chars, {
        x: "0%",
        stagger: 0.05,
        duration: 1,
        ease: "power4.inOut",
      })
        .to(
          footerLines.lines,
          { y: "0%", stagger: 0.1, duration: 1, ease: "power4.inOut" },
          "0.25",
        )
        .add(animateProgress(), "<")
        .set(progress, { backgroundColor: "#fff" })
        .to(
          logoChars.chars,
          {
            x: "-100%",
            stagger: 0.05,
            duration: 1,
            ease: "power4.inOut",
          },
          "-=0.5",
        )
        .to(
          footerLines.lines,
          { y: "-100%", stagger: 0.1, duration: 1, ease: "power4.inOut" },
          "<",
        )
        .to(
          progress,
          { opacity: 0, duration: 0.5, ease: "power3.out" },
          "-=0.25",
        )
        .to(mask, { scale: 6, duration: 2.5, ease: "power3.out" }, "<")
        .to(heroImage, { scale: 1, duration: 1.5, ease: "power3.out" }, "<")
        .to(headerChars.chars, {
          y: 0,
          stagger: 0.05,
          duration: 1,
          ease: "power4.out",
          delay: -2,
        })
        .to(
          [heroFooterH3.lines, heroFooterP.lines],
          { y: 0, stagger: 0.1, duration: 1, ease: "power4.out" },
          "-=1.5",
        )
        .to(
          q(".mrp-btn"),
          {
            scale: 1,
            duration: 1,
            ease: "power4.out",
          },
          "<",
        )
        .to(
          q(".mrp-btn-icon"),
          {
            clipPath: "circle(100% at 50% 50%)",
            duration: 1,
            ease: "power2.out",
          },
          "<0.1",
        )
        .to(btnLabels.lines, { y: 0, duration: 1, ease: "power4.out" }, "<");
    };

    document.fonts.ready.then(() => {
      if (!active) return;

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry || entry.intersectionRatio < 0.55) return;
          observer?.disconnect();
          observer = null;
          start();
        },
        { threshold: [0, 0.55] },
      );
      observer.observe(root);
    });

    return () => {
      active = false;
      observer?.disconnect();
      tl?.kill();
      for (const s of splits) s.revert();
    };
  }, []);

  return (
    <div
      className="mrp-root"
      ref={rootRef}
      style={{ ["--mrp-mask" as string]: `url(${maskShape})` }}
    >
      <style>{styles}</style>

      <div className="mrp-progress">
        <div className="mrp-progress-bar" />
        <div className="mrp-logo">
          <h1>{logo}</h1>
        </div>
      </div>

      <div className="mrp-mask" />

      <div className="mrp-pre-content">
        <div className="mrp-pre-footer">
          <p>{preloaderCopy}</p>
        </div>
      </div>

      <div className="mrp-container">
        <section className="mrp-hero">
          <div className="mrp-hero-inner">
            <div className="mrp-hero-img">
              <img alt="" draggable={false} src={heroImage} />
            </div>

            <div className="mrp-hero-content">
              <div className="mrp-header">
                <h1>{headline}</h1>
              </div>

              <div className="mrp-contact-btn">
                <div className="mrp-btn">
                  <div className="mrp-btn-label">
                    <span>{contactLabel}</span>
                  </div>
                  <div className="mrp-btn-icon">
                    <IoArrowForwardSharp />
                  </div>
                </div>
              </div>

              <div className="mrp-menu-btn">
                <div className="mrp-btn">
                  <div className="mrp-btn-label">
                    <span>{menuLabel}</span>
                  </div>
                  <div className="mrp-btn-icon">
                    <IoMenuSharp />
                  </div>
                </div>
              </div>

              <div className="mrp-hero-footer">
                <h3>{footerHeading}</h3>
                <p>{footerText}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Host+Grotesk:ital,wght@0,300..800;1,300..800&display=swap");

.mrp-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  font-family: "Host Grotesk", sans-serif;
}

.mrp-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mrp-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.mrp-hero {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 1rem;
  background-color: #181717;
}

.mrp-hero-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 4rem;
  overflow: hidden;
}

.mrp-hero-img {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  will-change: transform;
}

.mrp-hero-content {
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 2rem;
  color: #f5f5f5;
}

.mrp-header h1 {
  font-size: 12rem;
  font-weight: 500;
  letter-spacing: -0.25rem;
  line-height: 1;
}

.mrp-hero-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 2rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.mrp-hero-footer h3 {
  font-size: 2rem;
  font-weight: 400;
  line-height: 1.1;
  width: 25%;
}

.mrp-hero-footer p {
  width: 25%;
  text-align: right;
  opacity: 0.5;
}

.mrp-contact-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
}

.mrp-menu-btn {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
}

.mrp-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0.25rem 0.25rem 1.5rem;
  border-radius: 4rem;
  background-color: #f5f5f5;
  color: #181717;
  will-change: transform;
}

.mrp-btn-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #181717;
  color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  border-radius: 100%;
}

.mrp-btn-label span {
  font-size: 0.9rem;
  font-weight: 450;
  line-height: 1;
}

.mrp-progress,
.mrp-mask,
.mrp-pre-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  pointer-events: none;
}

.mrp-progress {
  background-color: #292725;
  z-index: 3;
  will-change: opacity;
}

.mrp-progress-bar {
  position: absolute;
  top: 0;
  left: 50%;
  width: 55%;
  height: 100%;
  background-color: #f5f5f5;
  transform: translateX(-50%) scaleX(0);
  will-change: transform;
  transform-origin: left;
}

.mrp-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
  mix-blend-mode: difference;
  z-index: 4;
}

.mrp-logo h1 {
  position: relative;
  color: #f5f5f5;
  font-size: 3rem;
  font-weight: 500;
  line-height: 1;
}

.mrp-mask {
  background-color: #181717;
  -webkit-mask: linear-gradient(#f5f5f5, #f5f5f5),
    var(--mrp-mask) center/50% no-repeat;
  -webkit-mask-composite: source-out;
  mask: linear-gradient(#f5f5f5, #f5f5f5),
    var(--mrp-mask) center/50% no-repeat;
  mask-composite: subtract;
  will-change: transform;
  z-index: 3;
}

.mrp-pre-content {
  z-index: 4;
}

.mrp-pre-footer {
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translate(-50%);
  width: 30%;
  text-align: center;
}

.mrp-pre-footer p {
  color: #f5f5f5;
  opacity: 0.5;
}

.mrp-line,
.mrp-char {
  position: relative;
  padding-bottom: 0.2em;
  margin-bottom: -0.2em;
  will-change: transform;
}

@media (max-width: 800px) {
  .mrp-hero-inner {
    border-radius: 3rem;
  }

  .mrp-header h1 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 100%;
    font-size: 4rem;
    letter-spacing: 0;
  }

  .mrp-hero-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .mrp-hero-footer h3,
  .mrp-hero-footer p {
    width: 100%;
    text-align: left;
  }

  .mrp-hero-footer h3 {
    font-size: 1.25rem;
  }

  .mrp-menu-btn {
    position: absolute;
    top: 2rem;
    left: 2rem;
    transform: translateX(0%);
  }

  .mrp-progress-bar {
    left: 0%;
    width: 100%;
    transform: translateX(0%) scaleX(0);
  }

  .mrp-logo h1 {
    font-size: 2rem;
  }

  .mrp-mask {
    -webkit-mask: linear-gradient(#f5f5f5, #f5f5f5),
      var(--mrp-mask) center/90% no-repeat;
    -webkit-mask-composite: source-out;
    mask: linear-gradient(#f5f5f5, #f5f5f5),
      var(--mrp-mask) center/90% no-repeat;
    mask-composite: subtract;
  }

  .mrp-pre-footer {
    width: 75%;
  }
}
`;

"use client";

/**
 * Preloader Panel Reveal - a one-shot intro: two columns of masked copy and a
 * glitching NN counter animate over a black panel while a center square grows
 * in stepped scales from nothing to full frame; the black panel then wipes up
 * and out, and the nav, hero image, and product card slide up from below into
 * place.
 *
 * Fills its container, so it drops into any bounded box or a full-screen
 * section. Plays once on mount; no scroll needed.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/preloader-panel-reveal";

export interface PreloaderPanelRevealProps {
  heroImage?: string;
  logo?: string;
  navLinks?: string[];
  ctaLabel?: string;
  copyColumns?: [string, string];
  productName?: string;
  productLink?: string;
}

const DEFAULT_NAV = ["Collections", "New Arrivals", "The Atelier", "Support"];
const DEFAULT_COPY: [string, string] = [
  "Handpicked collections shaped by artistry, balancing rare elements with a focus on purity.",
  "Explore timeless essentials built with care, thoughtfully designed to guide you.",
];

export default function PreloaderPanelReveal({
  heroImage = `${ASSET_BASE}/hero.jpg`,
  logo = "Atelier Vale",
  navLinks = DEFAULT_NAV,
  ctaLabel = "Create Account",
  copyColumns = DEFAULT_COPY,
  productName = "[ Ember No. 04 ]",
  productLink = "View the Collection",
}: PreloaderPanelRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(SplitText);

    const splitTextIntoLines = (selector: string) =>
      SplitText.create(root.querySelectorAll(selector), {
        type: "lines",
        mask: "lines",
        linesClass: "ppr-line",
      });

    const splits = [
      splitTextIntoLines(".ppr-copy p"),
      splitTextIntoLines(".ppr-counter p"),
    ];

    const risers = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".ppr-nav, .ppr-hero-img, .ppr-hero-content",
      ),
    );
    gsap.set(risers, { y: "35svh" });

    const counterEl = root.querySelector<HTMLElement>(".ppr-counter p");
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const animateCounter = (duration = 4.5, delay = 2) => {
      if (!counterEl) return;
      const maxDuration = duration * 1000;
      let currentValue = 0;

      timeouts.push(
        setTimeout(() => {
          const startTime = Date.now();
          const updateCounter = () => {
            if (cancelled) return;
            const elapsedTime = Date.now() - startTime;
            const progress = elapsedTime / maxDuration;

            if (currentValue < 100 && elapsedTime < maxDuration) {
              const target = Math.floor(progress * 100);
              const jump = Math.floor(Math.random() * 25) + 5;
              currentValue = Math.min(currentValue + jump, target, 100);
              counterEl.textContent = currentValue.toString().padStart(2, "0");
              timeouts.push(
                setTimeout(updateCounter, 200 + Math.random() * 100),
              );
            } else {
              counterEl.textContent = "100";
            }
          };
          updateCounter();
        }, delay * 1000),
      );
    };

    animateCounter();

    const tl = gsap.timeline();
    tl.to([".ppr-copy p .ppr-line", ".ppr-counter p .ppr-line"], {
      y: "0%",
      duration: 1,
      stagger: 0.075,
      ease: "power3.out",
      delay: 1,
    })
      .to(
        ".ppr-revealer",
        { scale: 0.1, duration: 0.75, ease: "power2.out" },
        "<",
      )
      .to(".ppr-revealer", { scale: 0.25, duration: 1, ease: "power3.out" })
      .to(".ppr-revealer", { scale: 0.5, duration: 0.75, ease: "power3.out" })
      .to(".ppr-revealer", { scale: 0.75, duration: 0.5, ease: "power2.out" })
      .to(".ppr-revealer", { scale: 1, duration: 1, ease: "power3.out" })
      .to(
        ".ppr-preloader",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1.25,
          ease: "power3.out",
        },
        "-=1",
      )
      .to(risers, { y: "0%", duration: 1.25, ease: "power3.out" }, "<");

    return () => {
      cancelled = true;
      for (const t of timeouts) clearTimeout(t);
      tl.kill();
      for (const s of splits) s.revert();
    };
  }, []);

  return (
    <div className="ppr-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="ppr-preloader">
        <div className="ppr-revealer" />

        <div className="ppr-copy">
          <div className="ppr-copy-col">
            <p>{copyColumns[0]}</p>
          </div>
          <div className="ppr-copy-col">
            <p>{copyColumns[1]}</p>
          </div>
        </div>

        <div className="ppr-counter">
          <p>00</p>
        </div>
      </div>

      <nav className="ppr-nav">
        <div className="ppr-nav-logo">
          <a href="#">{logo}</a>
        </div>
        <div className="ppr-nav-links">
          {navLinks.map((link) => (
            <a href="#" key={link}>
              {link}
            </a>
          ))}
        </div>
        <div className="ppr-nav-cta">
          <a href="#">{ctaLabel}</a>
        </div>
      </nav>

      <section className="ppr-hero">
        <div className="ppr-hero-img">
          <img alt="" draggable={false} src={heroImage} />
        </div>

        <div className="ppr-hero-content">
          <div className="ppr-product-name">
            <p>{productName}</p>
          </div>
          <div className="ppr-product-link">
            <a href="#">{productLink}</a>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap");

.ppr-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #eff1eb;
}

.ppr-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ppr-root a,
.ppr-root p {
  color: #5b553b;
  text-decoration: none;
  text-transform: uppercase;
  font-family: "Geist Mono", monospace;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: -0.0125rem;
  line-height: 1;
  display: inline-block;
}

.ppr-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  gap: 2rem;
  padding: 2rem;
  will-change: transform;
  z-index: 1;
}

.ppr-nav-logo,
.ppr-nav-cta {
  flex: 1;
  display: flex;
}

.ppr-nav-cta {
  justify-content: flex-end;
}

.ppr-nav-links {
  flex: 2;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.ppr-nav a {
  height: max-content;
  color: #5b553b;
  background-color: #eff1eb;
  padding: 0.25rem 0.5rem;
}

.ppr-nav-logo a {
  color: #fff;
  background-color: #5b553b;
}

.ppr-hero {
  position: relative;
  width: 100%;
  height: 100svh;
  will-change: transform;
  overflow: hidden;
}

.ppr-hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.ppr-hero-content {
  position: absolute;
  bottom: 5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.ppr-product-name,
.ppr-product-link {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 2.5rem;
}

.ppr-product-name {
  background-color: #fff;
}

.ppr-product-link {
  background-color: #5b553b;
}

.ppr-product-link a {
  color: #fff;
}

.ppr-preloader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  display: flex;
  align-items: center;
  padding: 2rem;
  background-color: #000;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
  overflow: hidden;
  z-index: 2;
}

.ppr-preloader p {
  color: #fff;
}

.ppr-revealer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 100%;
  aspect-ratio: 1;
  background-color: #5b553b;
  will-change: transform;
  z-index: 2;
}

.ppr-copy,
.ppr-copy-col,
.ppr-counter {
  flex: 1;
  display: flex;
}

.ppr-counter {
  justify-content: flex-end;
}

.ppr-copy p {
  width: 75%;
}

.ppr-line {
  will-change: transform;
  transform: translateY(100%);
}

@media (max-width: 1000px) {
  .ppr-nav-links {
    display: none;
  }

  .ppr-preloader,
  .ppr-copy {
    flex-direction: column;
  }

  .ppr-revealer {
    width: 200%;
  }

  .ppr-copy-col {
    align-items: center;
  }

  .ppr-copy p {
    width: 100%;
  }

  .ppr-counter {
    align-items: center;
  }
}
`;

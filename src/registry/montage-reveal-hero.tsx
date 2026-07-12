"use client";

/**
 * Montage Reveal Hero - a landing intro that counts itself in. A rolling
 * three-digit counter runs to 100 while a loader panel wipes up and a stack of
 * thumbnails pops in at one corner, then the whole stack Flips across to the
 * opposite corner with a scale pulse as the counter fades, and the navigation,
 * sidebar, dividers, and headline rise into place line by line. GSAP Flip with
 * SplitText.
 *
 * Fills its container, so it drops into any bounded box or a full-screen
 * section. Plays once on mount; no scroll needed.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/montage-reveal-hero";

export interface MontageRevealHeroProps {
  images?: string[];
  logo?: string;
  brand?: string;
  navLinks?: [string, string];
  cta?: string;
  heading?: string;
  subheading?: string;
  infoLines?: [string, string];
  footer?: string;
  className?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 15 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function MontageRevealHero({
  images = DEFAULT_IMAGES,
  logo = `${ASSET_BASE}/logo.png`,
  brand = "Omno",
  navLinks = ["Portfolio", "About"],
  cta = "Contact Us",
  heading = "Visual engineering for modern brands",
  subheading = "A design team focused on brand websites, apps and products",
  infoLines = ["Award-winning creative studio", "Operating since 2019"],
  footer = "Watch showreel",
  className,
}: MontageRevealHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(Flip, SplitText);

    const ctx = gsap.context(() => {
      for (const element of root.querySelectorAll<HTMLElement>(
        "h1, h2, .mrh-links a, .mrh-links p, .mrh-logo-name a, .mrh-cta a, .mrh-info-copy p",
      )) {
        SplitText.create(element, { type: "lines", linesClass: "mrh-line" });
        for (const line of element.querySelectorAll<HTMLElement>(".mrh-line")) {
          line.innerHTML = `<span>${line.textContent}</span>`;
        }
      }

      const createCounterDigits = () => {
        const counter1 = root.querySelector<HTMLElement>(".mrh-counter-1");
        const counter2 = root.querySelector<HTMLElement>(".mrh-counter-2");
        const counter3 = root.querySelector<HTMLElement>(".mrh-counter-3");
        if (!counter1 || !counter2 || !counter3) return;

        const n0 = document.createElement("div");
        n0.className = "mrh-num";
        n0.textContent = "0";
        counter1.appendChild(n0);
        const n1 = document.createElement("div");
        n1.className = "mrh-num mrh-num1offset1";
        n1.textContent = "1";
        counter1.appendChild(n1);

        for (let i = 0; i <= 10; i++) {
          const d = document.createElement("div");
          d.className = i === 1 ? "mrh-num mrh-num1offset2" : "mrh-num";
          d.textContent = i === 10 ? "0" : String(i);
          counter2.appendChild(d);
        }

        for (let i = 0; i < 30; i++) {
          const d = document.createElement("div");
          d.className = "mrh-num";
          d.textContent = String(i % 10);
          counter3.appendChild(d);
        }
        const final = document.createElement("div");
        final.className = "mrh-num";
        final.textContent = "0";
        counter3.appendChild(final);
      };

      const animateCounter = (
        counter: HTMLElement | null,
        duration: number,
        delay = 0,
      ) => {
        if (!counter) return;
        const numHeight =
          counter.querySelector<HTMLElement>(".mrh-num")?.clientHeight ?? 0;
        const totalDistance =
          (counter.querySelectorAll(".mrh-num").length - 1) * numHeight;
        gsap.to(counter, {
          y: -totalDistance,
          duration,
          delay,
          ease: "power2.inOut",
        });
      };

      const animateImages = () => {
        const imgs = root.querySelectorAll<HTMLElement>(".mrh-img");
        for (const img of imgs) img.classList.remove("mrh-animate-out");
        const state = Flip.getState(imgs);
        for (const img of imgs) img.classList.add("mrh-animate-out");

        const main = gsap.timeline();
        main.add(
          Flip.from(state, { duration: 1, stagger: 0.1, ease: "power3.inOut" }),
        );
        imgs.forEach((img, index) => {
          const scaleTl = gsap.timeline();
          scaleTl
            .to(img, { scale: 2.5, duration: 0.45, ease: "power3.in" }, 0.025)
            .to(img, { scale: 1, duration: 0.45, ease: "power3.out" }, 0.5);
          main.add(scaleTl, index * 0.1);
        });
        return main;
      };

      createCounterDigits();
      animateCounter(root.querySelector(".mrh-counter-3"), 2.5);
      animateCounter(root.querySelector(".mrh-counter-2"), 3);
      animateCounter(root.querySelector(".mrh-counter-1"), 2, 1.5);

      const tl = gsap.timeline();
      gsap.set(".mrh-img", { scale: 0 });

      tl.to(".mrh-hero-bg", {
        scaleY: "100%",
        duration: 3,
        ease: "power2.inOut",
        delay: 0.25,
      });
      tl.to(
        ".mrh-img",
        { scale: 1, duration: 1, stagger: 0.125, ease: "power3.out" },
        "<",
      );
      tl.to(".mrh-counter", {
        opacity: 0,
        duration: 0.3,
        ease: "power3.out",
        delay: 0.3,
        onStart: animateImages,
      });
      tl.to(".mrh-sidebar .mrh-divider", {
        scaleY: "100%",
        duration: 1,
        ease: "power3.inOut",
        delay: 1.25,
      });
      tl.to(
        [".mrh-nav .mrh-divider", ".mrh-info .mrh-divider"],
        { scaleX: "100%", duration: 1, stagger: 0.5, ease: "power3.inOut" },
        "<",
      );
      tl.to(".mrh-logo", { scale: 1, duration: 1, ease: "power4.inOut" }, "<");
      tl.to(
        [
          ".mrh-logo-name a span",
          ".mrh-links a span, .mrh-links p span",
          ".mrh-cta a span",
        ],
        { y: "0%", duration: 1, stagger: 0.1, ease: "power4.out", delay: 0.5 },
        "<",
      );
      tl.to(
        [".mrh-header span", ".mrh-info span", ".mrh-footer span"],
        { y: "0%", duration: 1, stagger: 0.1, ease: "power4.out" },
        "<",
      );
    }, root);

    return () => ctx.revert();
  }, [images]);

  return (
    <div
      className={className ? `mrh-root ${className}` : "mrh-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <section className="mrh-hero">
        <div className="mrh-hero-bg" />

        <div className="mrh-counter">
          <div className="mrh-counter-1 mrh-digit" />
          <div className="mrh-counter-2 mrh-digit" />
          <div className="mrh-counter-3 mrh-digit" />
        </div>

        <div className="mrh-images-container">
          {images.map((src, i) => (
            <div className="mrh-img" key={src}>
              <img alt={`Frame ${i + 1}`} draggable={false} src={src} />
            </div>
          ))}
        </div>

        <nav className="mrh-nav">
          <div className="mrh-logo-name">
            <a href="#top">{brand}</a>
          </div>
          <div className="mrh-nav-items">
            <div className="mrh-links">
              <a href="#top">{navLinks[0]}</a>
              <p>/</p>
              <a href="#top">{navLinks[1]}</a>
            </div>
            <div className="mrh-cta">
              <a href="#top">{cta}</a>
            </div>
          </div>
          <div className="mrh-divider" />
        </nav>

        <div className="mrh-sidebar">
          <div className="mrh-logo">
            <img alt="" draggable={false} src={logo} />
          </div>
          <div className="mrh-divider" />
        </div>

        <div className="mrh-header">
          <h1>{heading}</h1>
        </div>

        <div className="mrh-info">
          <h2>{subheading}</h2>
          <div className="mrh-divider" />
          <div className="mrh-info-copy">
            <p>{infoLines[0]}</p>
            <p>{infoLines[1]}</p>
          </div>
        </div>

        <div className="mrh-footer">
          <h2>{footer}</h2>
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap");

.mrh-root {
  --bg: #f1efe7;
  --fg: #1f1f1f;
  --loader-bg: #e0e0d8;
  --stroke: rgba(0, 0, 0, 0.2);
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "DM Sans", sans-serif;
  color: var(--fg);
}

.mrh-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mrh-root h1 {
  margin: 0;
  font-size: clamp(2.5rem, 6vw, 6rem);
  font-weight: 500;
  letter-spacing: -0.05rem;
  line-height: 1.1;
}

.mrh-root h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2.5vw, 1.75rem);
  font-weight: 500;
  letter-spacing: -0.02rem;
  line-height: 1.1;
}

.mrh-root a,
.mrh-root p {
  margin: 0;
  color: var(--fg);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  overflow: hidden;
  line-height: 1;
}

.mrh-hero {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  background-color: var(--bg);
  overflow: hidden;
}

.mrh-hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--loader-bg);
  transform-origin: bottom;
  transform: scaleY(0%);
}

.mrh-counter {
  position: absolute;
  right: 3rem;
  bottom: 2rem;
  z-index: 3;
  display: flex;
  height: 120px;
  font-size: 120px;
  line-height: 150px;
  -webkit-text-stroke: 2px var(--fg);
  clip-path: polygon(0 0, 100% 0, 100% 120px, 0 120px);
}

.mrh-counter-1,
.mrh-counter-2,
.mrh-counter-3 {
  position: relative;
  top: -15px;
}

.mrh-num1offset1 {
  position: relative;
  right: -30px;
}
.mrh-num1offset2 {
  position: relative;
  right: -15px;
}

.mrh-images-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.mrh-images-container .mrh-img {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  width: 20%;
  aspect-ratio: 5/3;
  border-radius: 0.75rem;
  overflow: hidden;
}

.mrh-images-container .mrh-img.mrh-animate-out {
  top: unset;
  left: unset;
  bottom: 1.5rem;
  right: 1.5rem;
}

.mrh-divider {
  background-color: var(--stroke);
}

.mrh-nav {
  position: relative;
  width: 100%;
  height: 5rem;
  padding: 1.5rem 1.5rem 1.5rem 7.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.mrh-logo-name a {
  font-size: 1.5rem;
}

.mrh-nav-items,
.mrh-links {
  display: flex;
  align-items: center;
}
.mrh-nav-items {
  gap: 7.5rem;
}
.mrh-links {
  gap: 0.5rem;
}

.mrh-nav .mrh-divider {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  transform-origin: left;
  transform: scaleX(0%);
}

.mrh-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 5rem;
  height: 100%;
  padding-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 2;
}

.mrh-sidebar .mrh-logo {
  width: 2rem;
  aspect-ratio: 1;
  transform: scale(0);
}

.mrh-sidebar .mrh-divider {
  position: absolute;
  right: 0;
  top: 0;
  width: 1px;
  height: 100%;
  transform-origin: top;
  transform: scaleY(0%);
}

.mrh-header {
  position: absolute;
  top: 35%;
  left: 7.5rem;
  transform: translateY(-50%);
  width: 60%;
  z-index: 2;
}

.mrh-info {
  position: absolute;
  right: 1.5rem;
  top: 60%;
  transform: translateY(-50%);
  width: 20%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 2;
}

.mrh-info .mrh-divider {
  width: 100%;
  height: 1px;
  transform-origin: left;
  transform: scaleX(0%);
}

.mrh-info-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mrh-footer {
  position: absolute;
  bottom: 1.5rem;
  left: 7.5rem;
  z-index: 2;
}

.mrh-line {
  overflow: hidden;
}

.mrh-line span {
  position: relative;
  display: block;
  transform: translateY(125%);
  will-change: transform;
}

@media (max-width: 1000px) {
  .mrh-links {
    display: none;
  }
  .mrh-images-container .mrh-img {
    width: 30%;
  }
  .mrh-header {
    top: 25%;
    width: calc(100% - 12.5rem);
  }
  .mrh-info {
    width: calc(100% - 12.5rem);
    right: unset;
    left: 7.5rem;
  }
  .mrh-counter {
    right: 1.5rem;
  }
}
`;

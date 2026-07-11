"use client";

/**
 * Orbit Text Preloader - concentric rings of orbiting text stretch and spin
 * around a counter while the page loads, then fade out to reveal the hero.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import type * as React from "react";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/orbit-text-preloader";

export interface OrbitTextPreloaderProps {
  heroImage?: string;
  heroText?: string;
  orbitWords?: string[];
  background?: string;
  loaderBackground?: string;
  loaderColor?: string;
}

const ORBIT_PATHS = [
  "M 500,-275 A 775,775 0 0,1 500,1275 A 775,775 0 0,1 500,-275 A 775,775 0 0,1 500,1275 A 775,775 0 0,1 500,-275 A 775,775 0 0,1 500,1275 A 775,775 0 0,1 499.99,-275",
  "M 500,-200 A 700,700 0 0,1 500,1200 A 700,700 0 0,1 500,-200 A 700,700 0 0,1 500,1200 A 700,700 0 0,1 500,-200 A 700,700 0 0,1 500,1200 A 700,700 0 0,1 499.99,-200",
  "M 500,-125 A 625,625 0 0,1 500,1125 A 625,625 0 0,1 500,-125 A 625,625 0 0,1 500,1125 A 625,625 0 0,1 500,-125 A 625,625 0 0,1 500,1125 A 625,625 0 0,1 499.99,-125",
  "M 500,-50 A 550,550 0 0,1 500,1050 A 550,550 0 0,1 500,-50 A 550,550 0 0,1 500,1050 A 550,550 0 0,1 500,-50 A 550,550 0 0,1 500,1050 A 550,550 0 0,1 499.99,-50",
  "M 500,25 A 475,475 0 0,1 500,975 A 475,475 0 0,1 500,25 A 475,475 0 0,1 500,975 A 475,475 0 0,1 500,25 A 475,475 0 0,1 500,975 A 475,475 0 0,1 499.99,25",
  "M 500,100 A 400,400 0 0,1 500,900 A 400,400 0 0,1 500,100 A 400,400 0 0,1 500,900 A 400,400 0 0,1 500,100 A 400,400 0 0,1 500,900 A 400,400 0 0,1 499.99,100",
  "M 500,175 A 325,325 0 0,1 500,825 A 325,325 0 0,1 500,175 A 325,325 0 0,1 500,825 A 325,325 0 0,1 500,175 A 325,325 0 0,1 500,825 A 325,325 0 0,1 499.99,175",
  "M 500,250 A 250,250 0 0,1 500,750 A 250,250 0 0,1 500,250 A 250,250 0 0,1 500,750 A 250,250 0 0,1 500,250 A 250,250 0 0,1 500,750 A 250,250 0 0,1 499.99,250",
];

const START_OFFSETS = ["30%", "31%", "33%", "32%", "30%", "31%", "33%", "32%"];
const START_TEXT_LENGTHS = [300, 280, 240, 260, 290, 200, 210, 190];
const TARGET_TEXT_LENGTHS = [4000, 3500, 3250, 3000, 2500, 2000, 1500, 1250];
const ORBIT_RADII = [775, 700, 625, 550, 475, 400, 325, 250];

const DEFAULT_WORDS = [
  "Developer",
  "Frontend",
  "Creative",
  "Designer",
  "Portfolio",
  "Digital",
  "Modern",
  "Design",
];

export default function OrbitTextPreloader({
  heroImage = `${ASSET_BASE}/hero.jpg`,
  heroText = "Your content begins here",
  orbitWords = DEFAULT_WORDS,
  background = "#0f0f0f",
  loaderBackground = "#d1d9b8",
  loaderColor = "#0f0f0f",
}: OrbitTextPreloaderProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(SplitText, CustomEase);
    if (!CustomEase.get("otp-hop"))
      CustomEase.create("otp-hop", "0.9, 0, 0.1, 1");

    const ctx = gsap.context(() => {
      const split = SplitText.create(root.querySelector(".otp-hero-copy p"), {
        type: "words",
        mask: "words",
        wordsClass: "word",
      });

      const textPaths = root.querySelectorAll(".otp-loader svg textPath");

      const startTextLengths = Array.from(textPaths).map((tp) =>
        parseFloat(tp.getAttribute("textLength") ?? "0"),
      );

      const startTextOffsets = Array.from(textPaths).map((tp) =>
        parseFloat(tp.getAttribute("startOffset") ?? "0"),
      );

      const maxOrbitRadius = ORBIT_RADII[0];
      const maxAnimDuration = 1.25;
      const minAnimDuration = 1;

      textPaths.forEach((textPath, index) => {
        const animationDelay = (textPaths.length - 1 - index) * 0.1;

        const currentOrbitRadius = ORBIT_RADII[index];

        const currentDuration =
          minAnimDuration +
          (currentOrbitRadius / maxOrbitRadius) *
            (maxAnimDuration - minAnimDuration);

        const pathLength = 2 * Math.PI * currentOrbitRadius * 3;
        const textLengthIncrease =
          TARGET_TEXT_LENGTHS[index] - startTextLengths[index];
        const offsetAdjustment = (textLengthIncrease / 2 / pathLength) * 100;
        const targetOffset = startTextOffsets[index] - offsetAdjustment;

        gsap.to(textPath, {
          attr: {
            textLength: TARGET_TEXT_LENGTHS[index],
            startOffset: `${targetOffset}%`,
          },
          duration: currentDuration,
          delay: animationDelay,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          repeatDelay: 0,
        });
      });

      let loaderRotation = 0;
      const loaderSvg = root.querySelector(".otp-loader svg");

      function animateRotation() {
        const spinDirection = Math.random() < 0.5 ? 1 : -1;
        loaderRotation += 25 * spinDirection;

        gsap.to(loaderSvg, {
          rotation: loaderRotation,
          duration: 2,
          ease: "power2.inOut",
          onComplete: animateRotation,
        });
      }

      animateRotation();

      const counterText = root.querySelector(".otp-counter p");
      const count = { value: 0 };

      gsap.to(count, {
        value: 100,
        duration: 4,
        delay: 1,
        ease: "power1.out",
        onUpdate: () => {
          if (counterText)
            counterText.textContent = `${Math.floor(count.value)}`;
        },
        onComplete: () => {
          gsap.to(root.querySelector(".otp-counter"), {
            opacity: 0,
            duration: 0.5,
            delay: 1,
          });
        },
      });

      const orbitTextElements = root.querySelectorAll(".otp-orbit-text");
      gsap.set(orbitTextElements, { opacity: 0 });

      const orbitTextsReversed = Array.from(orbitTextElements).reverse();

      gsap.to(orbitTextsReversed, {
        opacity: 1,
        duration: 0.75,
        stagger: 0.125,
        ease: "power1.out",
      });

      gsap.to(orbitTextsReversed, {
        opacity: 0,
        duration: 0.75,
        stagger: 0.1,
        delay: 6,
        ease: "power1.out",
        onComplete: () => {
          gsap.to(root.querySelector(".otp-loader"), {
            opacity: 0,
            duration: 1,
            onComplete: () => {
              const loader = root.querySelector<HTMLElement>(".otp-loader");
              if (loader) loader.style.display = "none";
            },
          });

          gsap.to(root.querySelector(".otp-hero-bg"), {
            scale: 1,
            duration: 2,
            delay: -0.5,
            ease: "otp-hop",
          });

          gsap.to(root.querySelectorAll(".otp-hero-copy p .word"), {
            y: 0,
            duration: 2,
            delay: -0.25,
            stagger: 0.1,
            ease: "otp-hop",
          });
        },
      });

      return () => {
        split.revert();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="otp-root"
      ref={rootRef}
      style={
        {
          "--otp-base-100": "#fff",
          "--otp-base-200": loaderBackground,
          "--otp-base-300": loaderColor,
          "--otp-bg": background,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="otp-loader">
        <svg viewBox="-425 -425 1850 1850" xmlns="http://www.w3.org/2000/svg">
          {ORBIT_PATHS.map((d, index) => (
            <path d={d} id={`otp-orbit-${index + 1}`} key={d} />
          ))}
          {orbitWords.slice(0, 8).map((word, index) => (
            <text className="otp-orbit-text" key={word}>
              <textPath
                href={`#otp-orbit-${index + 1}`}
                startOffset={START_OFFSETS[index]}
                textLength={START_TEXT_LENGTHS[index]}
              >
                {word}
              </textPath>
            </text>
          ))}
        </svg>

        <div className="otp-counter">
          <p>0</p>
        </div>
      </div>

      <div className="otp-hero">
        <div className="otp-hero-bg">
          <img alt="" draggable={false} src={heroImage} />
        </div>
        <div className="otp-hero-copy">
          <p>{heroText}</p>
        </div>
      </div>
    </section>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.otp-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: var(--otp-bg);
  font-family: "Inter", sans-serif;
}

.otp-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.otp-root p {
  text-transform: uppercase;
  font-weight: 500;
}

.otp-hero {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.otp-hero-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: scale(1.25);
  will-change: transform;
}

.otp-hero-copy {
  position: relative;
}

.otp-hero-copy p {
  color: var(--otp-base-100);
}

.otp-hero-copy p .word {
  position: relative;
  will-change: transform;
  transform: translateY(100%);
}

.otp-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--otp-base-200);
  color: var(--otp-base-300);
  will-change: opacity;
  z-index: 2;
}

.otp-loader .otp-counter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.otp-loader svg {
  width: 85%;
  height: 85%;
}

.otp-loader svg path {
  fill: none;
}

.otp-loader svg .otp-orbit-text {
  fill: var(--otp-base-300);
  text-transform: uppercase;
  font-size: 2.75rem;
  font-weight: 500;
}

@media (max-width: 1000px) {
  .otp-loader svg {
    width: 100%;
    height: 100%;
  }

  .otp-loader svg .otp-orbit-text {
    font-size: 3rem;
  }
}
`;

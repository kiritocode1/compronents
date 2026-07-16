"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/block-page-transition";

export interface BlockPageTransitionScene {
  label: string;
  image: string;
}

export interface BlockPageTransitionProps {
  brand?: string;
  transitionText?: string;
  scenes?: BlockPageTransitionScene[];
}

const DEFAULT_SCENES = [
  { label: "Genesis", image: `${ASSET_BASE}/img1.jpg` },
  { label: "Threshold", image: `${ASSET_BASE}/img2.jpg` },
  { label: "Sanctum", image: `${ASSET_BASE}/img3.jpg` },
];

export default function BlockPageTransition({
  brand = "Emberfall",
  transitionText = "BLANK Studio",
  scenes = DEFAULT_SCENES,
}: BlockPageTransitionProps) {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const blocksRef = useRef<HTMLDivElement[]>([]);
  const wordsRef = useRef<HTMLElement[]>([]);
  const timelineRef = useRef<gsap.core.Timeline>(null);

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("bpt-hop", "0.9, 0, 0.1, 1");
    const split = new SplitText(heading, {
      type: "words",
      wordsClass: "bpt-word",
      mask: "words",
    });
    wordsRef.current = split.words as HTMLElement[];
    gsap.set(wordsRef.current, { y: "100%" });

    return () => {
      timelineRef.current?.kill();
      split.revert();
    };
  }, []);

  function navigate(next: number) {
    if (transitioning || next === active) return;
    setTransitioning(true);

    timelineRef.current = gsap
      .timeline({
        onComplete: () => {
          gsap.set(gridRef.current, { pointerEvents: "none" });
          setTransitioning(false);
        },
      })
      .set(gridRef.current, { pointerEvents: "all" })
      .set(blocksRef.current, {
        transformOrigin: "left center",
        scaleX: 0,
      })
      .set(wordsRef.current, { y: "100%" })
      .to(blocksRef.current, {
        scaleX: 1,
        duration: 1,
        ease: "bpt-hop",
        stagger: 0.075,
      })
      .to(
        wordsRef.current,
        {
          y: "0%",
          duration: 1,
          ease: "power4.out",
          stagger: 0.1,
        },
        "-=0.6",
      )
      .call(() => setActive(next))
      .set(blocksRef.current, {
        transformOrigin: "right center",
        scaleX: 1,
      })
      .to(wordsRef.current, {
        y: "100%",
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
      })
      .to(
        blocksRef.current,
        {
          scaleX: 0,
          duration: 1,
          ease: "bpt-hop",
          stagger: 0.075,
        },
        "-=1",
      );
  }

  const scene = scenes[active] ?? DEFAULT_SCENES[0];

  return (
    <div className="bpt-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="bpt-navbar">
        <div className="bpt-navbar-item">
          <button type="button" onClick={() => navigate(0)}>
            {brand}
          </button>
        </div>
        <div className="bpt-navbar-items">
          {scenes.map((item, index) => (
            <div className="bpt-navbar-item" key={item.label}>
              <button type="button" onClick={() => navigate(index)}>
                {item.label}
              </button>
            </div>
          ))}
        </div>
      </nav>

      <section
        className="bpt-hero"
        style={{ backgroundImage: `url(${scene.image})` }}
      >
        <h1>{scene.label}</h1>
      </section>

      <div className="bpt-transition-grid" ref={gridRef}>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="bpt-transition-block"
            key={index}
            ref={(element) => {
              if (element) blocksRef.current[index] = element;
            }}
          />
        ))}
      </div>

      <div className="bpt-transition-text">
        <h1 ref={headingRef}>{transitionText}</h1>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&family=Instrument+Serif&display=swap");

.bpt-root {
  --bpt-bg: #0f0f0f;
  --bpt-fg: #f2f0e6;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: var(--bpt-bg);
  color: var(--bpt-fg);
}

.bpt-root *,
.bpt-root *::before,
.bpt-root *::after {
  box-sizing: border-box;
}

.bpt-navbar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
}

.bpt-navbar-items {
  display: flex;
  gap: clamp(1rem, 4vw, 2rem);
}

.bpt-navbar-item {
  padding: 1.5rem;
}

.bpt-navbar-item button {
  border: 0;
  background: transparent;
  color: var(--bpt-fg);
  cursor: pointer;
  font-family: "Instrument Sans", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.bpt-hero {
  position: relative;
  display: flex;
  width: 100%;
  height: 100svh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: cover;
}

.bpt-hero h1 {
  margin: 0;
  font-family: "Instrument Serif", serif;
  font-size: clamp(5rem, 15vw, 20rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
}

.bpt-transition-grid {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  width: 100%;
  height: 100svh;
  flex-direction: column;
  overflow: hidden;
  pointer-events: none;
}

.bpt-transition-block {
  width: 100%;
  flex: 1;
  transform: scaleX(0);
  transform-origin: left center;
  background: var(--bpt-fg);
  will-change: transform;
}

.bpt-transition-text {
  position: absolute;
  inset: 0;
  z-index: 101;
  display: flex;
  width: 100%;
  height: 100svh;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.bpt-transition-text h1 {
  margin: 0;
  color: var(--bpt-bg);
  font-family: "Instrument Serif", serif;
  font-size: clamp(1.5rem, 3vw, 4.5rem);
  font-weight: 400;
  letter-spacing: -0.03em;
  line-height: 1;
}

.bpt-word {
  transform: translateY(100%);
  will-change: transform;
}

@media (max-width: 1000px) {
  .bpt-navbar {
    padding: 2rem;
  }

  .bpt-navbar-items {
    align-items: flex-end;
    flex-direction: column;
    gap: 0;
  }

  .bpt-navbar-item {
    padding: 0.25rem;
  }
}
`;

"use client";

/**
 * SVG Stroke Hover - image cards with animated scribble strokes.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/svg-stroke-hover";

export interface SvgStrokeCard {
  title: string;
  image: string;
  accent: string;
}

export interface SvgStrokeHoverProps {
  cards?: SvgStrokeCard[];
  heading?: string;
  background?: string;
  textColor?: string;
}

const defaultCards: SvgStrokeCard[] = [
  {
    title: "Synthetic Silhouette",
    image: `${ASSET_BASE}/img1.jpg`,
    accent: "#e67339",
  },
  {
    title: "Red Form Study",
    image: `${ASSET_BASE}/img2.jpg`,
    accent: "#a66363",
  },
  {
    title: "Material Pause",
    image: `${ASSET_BASE}/img3.jpg`,
    accent: "#eb3828",
  },
  {
    title: "Obscured Profile",
    image: `${ASSET_BASE}/img4.jpg`,
    accent: "#a6a09d",
  },
  {
    title: "Muted Presence",
    image: `${ASSET_BASE}/img5.jpg`,
    accent: "#99938a",
  },
  {
    title: "Spatial Balance",
    image: `${ASSET_BASE}/img6.jpg`,
    accent: "#5f7c98",
  },
];

const strokeOne =
  "M227.549 1818.76C227.549 1818.76 406.016 2207.75 569.049 2130.26C843.431 1999.85 -264.104 1002.3 227.549 876.262C552.918 792.849 773.647 2456.11 1342.05 2130.26C1885.43 1818.76 14.9644 455.772 760.548 137.262C1342.05 -111.152 1663.5 2266.35 2209.55 1972.76C2755.6 1679.18 1536.63 384.467 1826.55 137.262C2013.5 -22.1463 2209.55 381.262 2209.55 381.262";

const strokeTwo =
  "M1661.28 2255.51C1661.28 2255.51 2311.09 1960.37 2111.78 1817.01C1944.47 1696.67 718.456 2870.17 499.781 2255.51C308.969 1719.17 2457.51 1613.83 2111.78 963.512C1766.05 313.198 427.949 2195.17 132.281 1455.51C-155.219 736.292 2014.78 891.514 1708.78 252.012C1437.81 -314.29 369.471 909.169 132.281 566.512C18.1772 401.672 244.781 193.012 244.781 193.012";

export default function SvgStrokeHover({
  cards = defaultCards,
  heading = "The Hover State",
  background = "#f2f0eb",
  textColor = "#111111",
}: SvgStrokeHoverProps) {
  return (
    <section
      className="ssh-root"
      style={
        {
          "--ssh-bg": background,
          "--ssh-text": textColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <header className="ssh-header">
        <h2>{heading}</h2>
      </header>
      <div className="ssh-grid">
        {cards.map((card) => (
          <article
            className="ssh-card"
            key={`${card.title}-${card.image}`}
            style={{ "--ssh-accent": card.accent } as React.CSSProperties}
          >
            <img alt="" draggable={false} src={card.image} />
            <svg
              className="ssh-stroke ssh-stroke-one"
              viewBox="0 0 2453 2273"
              aria-hidden="true"
              role="presentation"
            >
              <path d={strokeOne} pathLength={1} />
            </svg>
            <svg
              className="ssh-stroke ssh-stroke-two"
              viewBox="0 0 2250 2535"
              aria-hidden="true"
              role="presentation"
            >
              <path d={strokeTwo} pathLength={1} />
            </svg>
            <h3>{card.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

const styles = `
.ssh-root {
  width: 100%;
  min-height: 720px;
  padding: clamp(1rem, 2vw, 2rem);
  background: var(--ssh-bg);
  color: var(--ssh-text);
  font-family: "Geist", "Inter", system-ui, sans-serif;
}

.ssh-header {
  display: grid;
  min-height: 220px;
  place-items: center;
  text-align: center;
}

.ssh-header h2 {
  margin: 0;
  font-size: clamp(3rem, 7vw, 7rem);
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1.05;
}

.ssh-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.ssh-card {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  background: #dedbd2;
  isolation: isolate;
}

.ssh-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.01);
  transition: filter 300ms ease, transform 600ms ease;
}

.ssh-card:hover img {
  filter: saturate(0.75) contrast(0.92);
  transform: scale(1.05);
}

.ssh-stroke {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 130%;
  height: 130%;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(1.2);
}

.ssh-stroke path {
  fill: none;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  stroke-width: 200;
  transition: stroke-dashoffset 900ms ease, stroke-width 900ms ease;
}

.ssh-stroke-one path {
  stroke: var(--ssh-accent);
}

.ssh-stroke-two path {
  stroke: #e0e0e0;
}

.ssh-card:hover .ssh-stroke path {
  stroke-dashoffset: 0;
  stroke-width: 620;
}

.ssh-card h3 {
  position: absolute;
  right: 1.5rem;
  bottom: 1.25rem;
  left: 1.5rem;
  margin: 0;
  color: #111;
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-weight: 480;
  letter-spacing: 0;
  line-height: 1.1;
  transform: translateY(110%);
  transition: transform 420ms ease;
  z-index: 2;
}

.ssh-card:hover h3 {
  transform: translateY(0);
}

@media (max-width: 900px) {
  .ssh-grid {
    grid-template-columns: 1fr;
  }

  .ssh-header {
    min-height: 160px;
  }
}
`;

"use client";

/**
 * Terminal Text Reveal - scroll progress copy with bright word passes.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";
import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/terminal-text-reveal";

export interface TerminalTextRevealService {
  title: string;
  body: string;
  image: string;
}

export interface TerminalTextRevealProps {
  introImage?: string;
  bannerImage?: string;
  headline?: string;
  intro?: string;
  services?: TerminalTextRevealService[];
  outro?: string;
  initialColor?: string;
  accentColor?: string;
  finalColor?: string;
}

const services: TerminalTextRevealService[] = [
  {
    title: "Precision Engineering",
    body: "Every breakthrough begins with detail. From the first sketch to full-scale production, the process is built on accuracy, consistency, and performance. The machine is the sum of thousands of deliberate calculations designed to set new standards in motion.",
    image: `${ASSET_BASE}/img_2.jpg`,
  },
  {
    title: "Performance Optimization",
    body: "True innovation means doing more with less. These systems deliver maximum output while reducing waste, resistance, and downtime. Each detail is calibrated for efficiency, turning raw energy into refined power that keeps industry moving.",
    image: `${ASSET_BASE}/img_3.jpg`,
  },
  {
    title: "Advanced Mobility",
    body: "The future of movement is seamless. From high-speed transit to autonomous systems, mobility work connects people, industries, and cities with speed and reliability. Every element is engineered for flow, capacity, and dependable rhythm.",
    image: `${ASSET_BASE}/img_4.jpg`,
  },
  {
    title: "Next-Gen Infrastructure",
    body: "Building for tomorrow requires infrastructure that can endure, adapt, and expand. From aerospace systems to ground-level operations, the work is designed for harsh environments while maintaining precise control.",
    image: `${ASSET_BASE}/img_5.jpg`,
  },
];

export default function TerminalTextReveal({
  introImage = `${ASSET_BASE}/intro.jpg`,
  bannerImage = `${ASSET_BASE}/img_1.jpg`,
  headline = "A new chapter in engineered systems",
  intro = "In an era defined by precision and speed, innovation reshapes the foundation of modern industry. Every component is built with intent, every system designed to perform at scale. This is the architecture of progress, setting new benchmarks for how we build, move, and connect.",
  services: serviceItems = services,
  outro = "Innovation has no finish line.",
  initialColor = "#d5d5d5",
  accentColor = "#abff02",
  finalColor = "#101010",
}: TerminalTextRevealProps) {
  return (
    <section
      className="ttr-root"
      style={
        {
          "--ttr-initial": initialColor,
          "--ttr-accent": accentColor,
          "--ttr-final": finalColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="ttr-hero">
        <img alt="" draggable={false} src={introImage} />
      </div>
      <div className="ttr-about">
        <h2>{headline}</h2>
        <RevealCopy>{intro}</RevealCopy>
      </div>
      <div className="ttr-banner">
        <img alt="" draggable={false} src={bannerImage} />
      </div>
      <div className="ttr-services">
        {serviceItems.map((service, index) => (
          <article className="ttr-service" key={service.title}>
            <div className="ttr-panel">
              <div>
                <h3>{service.title}</h3>
                <RevealCopy>{service.body}</RevealCopy>
              </div>
            </div>
            <div className="ttr-panel ttr-image">
              <img alt="" draggable={false} src={service.image} />
            </div>
            {index % 2 === 1 ? null : <span className="ttr-rule" />}
          </article>
        ))}
      </div>
      <div className="ttr-outro">
        <h3>{outro}</h3>
      </div>
    </section>
  );
}

function RevealCopy({ children }: { children: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);
  const words = children.split(" ");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let scrollRoot: HTMLElement | Window = window;
    let parent = element.parentElement;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (/(auto|scroll|overlay)/.test(overflowY)) {
        scrollRoot = parent;
        break;
      }
      parent = parent.parentElement;
    }

    const update = () => {
      const rect = element.getBoundingClientRect();
      const rootRect =
        scrollRoot instanceof Window
          ? { top: 0, height: window.innerHeight || 1 }
          : scrollRoot.getBoundingClientRect();
      const top = rect.top - rootRect.top;
      const next =
        1 - (top - rootRect.height * 0.16) / (rootRect.height * 0.68);
      setProgress(Math.max(0, Math.min(1, next)));
    };

    update();
    scrollRoot.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scrollRoot.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const active = Math.floor(progress * words.length);
  const accent = Math.floor(active - words.length * 0.06);

  return (
    <p className="ttr-copy" ref={ref}>
      {words.map((word, index) => (
        <span
          className={
            index <= accent
              ? "is-final"
              : index <= active
                ? "is-accent"
                : undefined
          }
          key={`${word}-${index}`}
        >
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

const styles = `
.ttr-root {
  width: 100%;
  background: #ffffff;
  color: #101010;
  font-family: "Geist", "Inter", system-ui, sans-serif;
}

.ttr-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ttr-hero,
.ttr-banner {
  height: min(760px, 100svh);
  padding: 1rem;
}

.ttr-hero img,
.ttr-banner img,
.ttr-image img {
  border-radius: 8px;
}

.ttr-about,
.ttr-outro {
  display: grid;
  min-height: 100svh;
  place-items: center;
  padding: clamp(2rem, 6vw, 6rem);
  text-align: center;
}

.ttr-about h2 {
  max-width: 980px;
  margin: 0 0 1.5rem;
  font-size: clamp(2.8rem, 7vw, 6.8rem);
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1;
}

.ttr-about .ttr-copy {
  max-width: 620px;
  margin-inline: auto;
}

.ttr-copy {
  margin: 0;
  color: var(--ttr-initial);
  font-size: clamp(1.05rem, 1.6vw, 1.35rem);
  font-weight: 520;
  line-height: 1.55;
}

.ttr-copy span {
  color: var(--ttr-initial);
  transition: color 160ms ease;
}

.ttr-copy span.is-accent {
  color: var(--ttr-accent);
}

.ttr-copy span.is-final {
  color: var(--ttr-final);
}

.ttr-services {
  display: grid;
  gap: 2rem;
  padding: 1rem;
}

.ttr-service {
  position: relative;
  display: grid;
  min-height: min(760px, 100svh);
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 2rem;
}

.ttr-service:nth-child(even) .ttr-panel:first-child {
  order: 2;
}

.ttr-panel {
  display: grid;
  place-items: center;
  min-width: 0;
  overflow: hidden;
}

.ttr-panel > div {
  max-width: 560px;
}

.ttr-panel h3,
.ttr-outro h3 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 4vw, 4.2rem);
  font-weight: 560;
  letter-spacing: 0;
  line-height: 1.08;
}

.ttr-rule {
  position: absolute;
  right: 50%;
  bottom: 1rem;
  width: 1px;
  height: 4rem;
  background: rgb(0 0 0 / 0.18);
}

@media (max-width: 900px) {
  .ttr-service,
  .ttr-service:nth-child(even) .ttr-panel:first-child {
    grid-template-columns: 1fr;
    order: initial;
  }

  .ttr-service {
    min-height: auto;
  }

  .ttr-panel {
    min-height: 360px;
  }
}
`;

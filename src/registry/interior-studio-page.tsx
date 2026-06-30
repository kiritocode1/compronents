"use client";

/**
 * Interior Studio Page - an atmospheric spatial design homepage.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";

export interface InteriorStudioPageProps {
  headline?: string;
  intro?: string;
  heroImage?: string;
  projectImages?: string[];
  processImages?: string[];
  background?: string;
  textColor?: string;
  softColor?: string;
  glassColor?: string;
}

const ASSET = "https://compronents.dev/assets/interior-studio-page";

const DEFAULT_PROJECTS = Array.from(
  { length: 4 },
  (_, i) => `${ASSET}/project-${i + 1}.jpg`,
);

const DEFAULT_PROCESS = Array.from(
  { length: 4 },
  (_, i) => `${ASSET}/process-${i + 1}.jpg`,
);

function fill(items: string[], fallback: string[], count: number) {
  const source = items.length ? items : fallback;
  return Array.from({ length: count }, (_, i) => source[i % source.length]);
}

export default function InteriorStudioPage({
  headline = "Spaces that feel rooted, human, and quietly bold",
  intro = "A full-page studio composition for interiors, hospitality, and objects that need texture, patience, and light.",
  heroImage = `${ASSET}/hero.jpg`,
  projectImages = DEFAULT_PROJECTS,
  processImages = DEFAULT_PROCESS,
  background = "#171615",
  textColor = "#f2ede6",
  softColor = "#c9beb0",
  glassColor = "#f2ede6",
}: InteriorStudioPageProps) {
  const projects = fill(projectImages, DEFAULT_PROJECTS, 4);
  const process = fill(processImages, DEFAULT_PROCESS, 4);

  return (
    <main
      className="isp-root"
      style={
        {
          "--isp-bg": background,
          "--isp-text": textColor,
          "--isp-soft": softColor,
          "--isp-glass": glassColor,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <section className="isp-hero">
        {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
        <img className="isp-hero-img" src={heroImage} alt="" />
        <div className="isp-shade" />
        <nav className="isp-nav" aria-label="Studio navigation">
          <a href="#studio">BLANK Studio</a>
          <a href="#work">Work</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="isp-hero-copy">
          <h1>{headline}</h1>
          <p>{intro}</p>
          <a href="#work">Explore spaces</a>
        </div>
        <div className="isp-stats">
          {[
            ["18", "Rooms shaped for daily rituals"],
            ["07", "Material palettes in active study"],
            ["04", "Cities in the current field archive"],
          ].map(([value, label]) => (
            <article key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="isp-manifesto" id="studio">
        <p>What we do</p>
        <h2>
          We arrange texture, proportion, and negative space until a room begins
          to feel inevitable.
        </h2>
        <div className="isp-tags">
          {[
            "Spatial identity",
            "Hospitality systems",
            "Residential studies",
            "Object styling",
            "Material direction",
            "Soft lighting",
          ].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>

      <section className="isp-work" id="work">
        <div className="isp-work-header">
          <p>Selected rooms</p>
          <h2>Spaces with a calm center and a precise edge.</h2>
        </div>
        <div className="isp-projects">
          {projects.map((src, index) => (
            <article key={src} className="isp-project">
              {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
              <img src={src} alt={`Interior project ${index + 1}`} />
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>
                  {
                    [
                      "House of quiet stone",
                      "Studio under warm glass",
                      "Apartment for long mornings",
                      "Salon with low light",
                    ][index]
                  }
                </h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="isp-process" id="process">
        <div>
          <p>Process archive</p>
          <h2>Every material decision gets tested in daylight and shadow.</h2>
        </div>
        <div className="isp-process-grid">
          {process.map((src, index) => (
            <figure key={src}>
              {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
              <img src={src} alt={`Process study ${index + 1}`} />
              <figcaption>
                <span>Study {index + 1}</span>
                <span>Texture, volume, light</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = `
.isp-root {
  width: 100%;
  min-height: 100svh;
  background: var(--isp-bg);
  color: var(--isp-text);
  font-family: ui-sans-serif, system-ui, sans-serif;
  overflow-x: hidden;
}

.isp-root a {
  color: inherit;
  text-decoration: none;
}

.isp-hero {
  position: relative;
  min-height: 135svh;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.isp-hero-img,
.isp-project img,
.isp-process img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.isp-hero-img {
  position: absolute;
  inset: 0;
  z-index: 0;
  filter: saturate(0.92) contrast(0.92);
}

.isp-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.72)),
    linear-gradient(90deg, rgba(0, 0, 0, 0.28), transparent 48%, rgba(0, 0, 0, 0.2));
}

.isp-nav {
  position: absolute;
  top: clamp(1rem, 2vw, 2rem);
  left: clamp(1rem, 2vw, 2rem);
  right: clamp(1rem, 2vw, 2rem);
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr repeat(3, auto);
  gap: clamp(0.75rem, 2vw, 2rem);
  color: var(--isp-text);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.isp-hero-copy {
  position: relative;
  z-index: 2;
  width: min(68rem, calc(100% - 2rem));
  display: grid;
  justify-items: center;
  gap: 1.4rem;
  text-align: center;
  transform: translateY(-10svh);
}

.isp-hero-copy h1 {
  max-width: 13ch;
  margin: 0;
  font-size: clamp(3.8rem, 10vw, 11rem);
  font-weight: 520;
  line-height: 0.9;
  letter-spacing: 0;
}

.isp-hero-copy p {
  max-width: 32rem;
  margin: 0;
  color: var(--isp-soft);
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  line-height: 1.55;
}

.isp-hero-copy a {
  border: 1px solid color-mix(in srgb, var(--isp-text) 35%, transparent);
  border-radius: 999px;
  padding: 0.8rem 1.1rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  backdrop-filter: blur(12px);
}

.isp-stats {
  position: absolute;
  left: clamp(1rem, 2vw, 2rem);
  right: clamp(1rem, 2vw, 2rem);
  bottom: clamp(1rem, 2vw, 2rem);
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.isp-stats article {
  min-height: 12rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background: color-mix(in srgb, var(--isp-glass) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--isp-glass) 18%, transparent);
  backdrop-filter: blur(18px);
}

.isp-stats strong {
  font-size: clamp(2.2rem, 6vw, 6rem);
  font-weight: 500;
  line-height: 0.85;
}

.isp-stats span {
  max-width: 14rem;
  color: var(--isp-soft);
  font-size: 0.9rem;
  line-height: 1.35;
}

.isp-manifesto,
.isp-work,
.isp-process {
  padding: clamp(4rem, 9vw, 9rem) clamp(1rem, 2vw, 2rem);
}

.isp-manifesto {
  display: grid;
  gap: 3rem;
  background: var(--isp-bg);
}

.isp-manifesto p,
.isp-work-header p,
.isp-process p {
  margin: 0;
  color: var(--isp-soft);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.isp-manifesto h2,
.isp-work-header h2,
.isp-process h2 {
  max-width: 72rem;
  margin: 0;
  font-size: clamp(2.6rem, 7.8vw, 8.5rem);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: 0;
}

.isp-tags {
  max-width: 56rem;
}

.isp-tags span {
  display: inline-flex;
  margin: 0 0.45rem 0.55rem 0;
  border: 1px solid color-mix(in srgb, var(--isp-soft) 45%, transparent);
  border-radius: 999px;
  padding: 0.85rem 1.15rem;
  color: var(--isp-soft);
}

.isp-work {
  background: color-mix(in srgb, var(--isp-bg) 84%, white);
}

.isp-work-header {
  display: grid;
  grid-template-columns: minmax(9rem, 0.3fr) 1fr;
  gap: 2rem;
  margin-bottom: clamp(2rem, 6vw, 6rem);
}

.isp-projects {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: color-mix(in srgb, var(--isp-text) 16%, transparent);
}

.isp-project {
  position: relative;
  min-height: 38rem;
  margin: 0;
  overflow: hidden;
  background: #282522;
}

.isp-project div {
  position: absolute;
  inset: auto 0 0;
  display: grid;
  gap: 0.55rem;
  padding: 1rem;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.68));
}

.isp-project span,
.isp-project h3 {
  margin: 0;
}

.isp-project span {
  color: var(--isp-soft);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.isp-project h3 {
  max-width: 17rem;
  font-size: clamp(1.4rem, 2.2vw, 2.5rem);
  font-weight: 500;
  line-height: 0.98;
}

.isp-process {
  display: grid;
  grid-template-columns: minmax(18rem, 0.6fr) 1fr;
  gap: clamp(2rem, 5vw, 5rem);
}

.isp-process div:first-child {
  display: grid;
  align-content: start;
  gap: 1.5rem;
}

.isp-process-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.isp-process figure {
  margin: 0;
  display: grid;
  gap: 0.65rem;
}

.isp-process figure img {
  aspect-ratio: 4 / 5;
}

.isp-process figcaption {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--isp-soft);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .isp-hero {
    min-height: 160svh;
  }

  .isp-nav {
    grid-template-columns: 1fr;
  }

  .isp-hero-copy {
    transform: translateY(-18svh);
  }

  .isp-stats,
  .isp-work-header,
  .isp-projects,
  .isp-process,
  .isp-process-grid {
    grid-template-columns: 1fr;
  }

  .isp-stats article {
    min-height: 8rem;
  }

  .isp-project {
    min-height: 30rem;
  }
}
`;

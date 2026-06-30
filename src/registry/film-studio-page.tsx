"use client";

/**
 * Film Studio Page - a stark production house homepage with video and frames.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";

export interface FilmStudioPageProps {
  headline?: string;
  manifesto?: string;
  videoSrc?: string;
  bannerImage?: string;
  spotlightImages?: string[];
  background?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
}

const ASSET = "https://compronents.dev/assets/film-studio-page";

const DEFAULT_SPOTLIGHT = Array.from(
  { length: 8 },
  (_, i) => `${ASSET}/spotlight-${i + 1}.jpg`,
);

function spotlights(items: string[]) {
  const source = items.length ? items : DEFAULT_SPOTLIGHT;
  return Array.from({ length: 8 }, (_, i) => source[i % source.length]);
}

export default function FilmStudioPage({
  headline = "Films forged on shadow, silence, and geometry.",
  manifesto = "We approach cinema as a construction of form and weight. Each frame is laid like concrete, measured and precise.",
  videoSrc = `${ASSET}/hero.mp4`,
  bannerImage = `${ASSET}/banner.jpg`,
  spotlightImages = DEFAULT_SPOTLIGHT,
  background = "#050505",
  textColor = "#f1efe6",
  mutedColor = "#8e8a80",
  accentColor = "#d7ff2f",
}: FilmStudioPageProps) {
  const frames = spotlights(spotlightImages);

  return (
    <main
      className="fsp-root"
      style={
        {
          "--fsp-bg": background,
          "--fsp-text": textColor,
          "--fsp-muted": mutedColor,
          "--fsp-accent": accentColor,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <section className="fsp-hero">
        <video className="fsp-video" autoPlay muted loop playsInline>
          <source src={videoSrc} type="video/mp4" />
        </video>
        <nav className="fsp-nav" aria-label="Film navigation">
          <a href="#top">BLANK Films</a>
          <a href="#ethos">Ethos</a>
          <a href="#frames">Frames</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="fsp-hero-copy">
          <h1>{headline}</h1>
        </div>
        <footer className="fsp-footer-line">
          <p>Warsaw / Marseille</p>
          <p>Scroll to continue</p>
        </footer>
      </section>

      <section className="fsp-callout" id="ethos">
        <p>We shoot. We fracture. We reform.</p>
        <h2>{manifesto}</h2>
      </section>

      <section className="fsp-banner">
        {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
        <img src={bannerImage} alt="" />
        <div>
          <h2>We do not chase beauty. We build function.</h2>
          <p>
            Film is not only vision, it is work. The camera is a tool, but so is
            the hand that holds it and the time spent waiting for a single
            detail to align.
          </p>
          <div>
            {[
              "Film archive",
              "Documentation",
              "Still frames",
              "Research",
              "Preservation",
            ].map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="fsp-frames" id="frames">
        <div className="fsp-frame-header">
          <p>Selected frames</p>
          <h2>Cold images arranged with pressure and rhythm.</h2>
        </div>
        <div className="fsp-frame-grid">
          {frames.map((src, index) => (
            <figure key={src}>
              {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
              <img src={src} alt={`Selected frame ${index + 1}`} />
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>Frame study</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = `
.fsp-root {
  width: 100%;
  min-height: 100svh;
  background: var(--fsp-bg);
  color: var(--fsp-text);
  font-family: ui-sans-serif, system-ui, sans-serif;
  overflow-x: hidden;
}

.fsp-root a {
  color: inherit;
  text-decoration: none;
}

.fsp-hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.fsp-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.2);
}

.fsp-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.62)),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 5px);
  pointer-events: none;
}

.fsp-nav {
  position: absolute;
  z-index: 3;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  display: grid;
  grid-template-columns: 1fr repeat(3, auto);
  gap: 1.25rem;
  color: var(--fsp-text);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.fsp-hero-copy {
  position: relative;
  z-index: 2;
  width: min(82rem, calc(100% - 2rem));
}

.fsp-hero-copy h1,
.fsp-callout h2,
.fsp-banner h2,
.fsp-frame-header h2 {
  margin: 0;
  font-size: clamp(3.8rem, 9.5vw, 10.5rem);
  font-weight: 520;
  line-height: 0.88;
  letter-spacing: 0;
  text-transform: uppercase;
}

.fsp-hero-copy h1 {
  max-width: 12ch;
}

.fsp-footer-line {
  position: absolute;
  z-index: 3;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--fsp-muted);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.fsp-callout {
  min-height: 100svh;
  display: grid;
  place-items: center;
  gap: 2rem;
  padding: clamp(3rem, 8vw, 8rem) clamp(1rem, 2vw, 2rem);
  text-align: center;
}

.fsp-callout p,
.fsp-frame-header p {
  margin: 0;
  color: var(--fsp-muted);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.fsp-callout h2 {
  max-width: 13ch;
  color: var(--fsp-text);
}

.fsp-banner {
  position: relative;
  min-height: 140svh;
  display: grid;
  align-items: stretch;
  overflow: hidden;
}

.fsp-banner img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1) contrast(1.1);
}

.fsp-banner::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.fsp-banner > div {
  position: relative;
  z-index: 2;
  display: grid;
  align-content: space-between;
  gap: 3rem;
  min-height: 140svh;
  padding: clamp(1rem, 2vw, 2rem);
}

.fsp-banner h2 {
  max-width: 12ch;
  color: var(--fsp-accent);
}

.fsp-banner p {
  max-width: 34rem;
  margin: 0;
  color: var(--fsp-text);
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  line-height: 1.55;
}

.fsp-banner div div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.fsp-banner span {
  border: 1px solid color-mix(in srgb, var(--fsp-accent) 45%, transparent);
  border-radius: 999px;
  padding: 0.7rem 0.9rem;
  color: var(--fsp-accent);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.fsp-frames {
  padding: clamp(4rem, 8vw, 8rem) clamp(1rem, 2vw, 2rem);
}

.fsp-frame-header {
  display: grid;
  grid-template-columns: minmax(9rem, 0.3fr) 1fr;
  gap: 2rem;
  margin-bottom: clamp(2rem, 5vw, 5rem);
}

.fsp-frame-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: color-mix(in srgb, var(--fsp-text) 16%, transparent);
}

.fsp-frame-grid figure {
  margin: 0;
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--fsp-bg);
}

.fsp-frame-grid img {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  display: block;
  filter: grayscale(1) contrast(1.08);
}

.fsp-frame-grid figcaption {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--fsp-muted);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .fsp-nav,
  .fsp-frame-header,
  .fsp-frame-grid {
    grid-template-columns: 1fr;
  }

  .fsp-footer-line {
    flex-direction: column;
  }

  .fsp-banner,
  .fsp-banner > div {
    min-height: 110svh;
  }
}
`;

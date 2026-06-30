"use client";

/**
 * Dark Catalog Page - a game and media studio homepage with hard contrast.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";

export interface DarkCatalogPageProps {
  title?: string;
  leftSignal?: string;
  rightSignal?: string;
  manifesto?: string;
  logoImage?: string;
  featuredImages?: string[];
  catalogImages?: string[];
  teamImages?: string[];
  background?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
}

const ASSET = "https://compronents.dev/assets/dark-catalog-page";

const DEFAULT_FEATURED = Array.from(
  { length: 4 },
  (_, i) => `${ASSET}/featured-${i + 1}.jpg`,
);
const DEFAULT_CATALOG = Array.from(
  { length: 4 },
  (_, i) => `${ASSET}/catalog-${i + 1}.jpg`,
);
const DEFAULT_TEAM = Array.from(
  { length: 5 },
  (_, i) => `${ASSET}/team-${i + 1}.jpg`,
);

function repeat(items: string[], fallback: string[], count: number) {
  const source = items.length ? items : fallback;
  return Array.from({ length: count }, (_, i) => source[i % source.length]);
}

export default function DarkCatalogPage({
  title = "BLANK LOCK",
  leftSignal = "Worlds without exit",
  rightSignal = "Games without mercy",
  manifesto = "We build digital worlds rooted in tension, silence, and consequence. The player is never fully in control and the environment is never fully understood.",
  logoImage = `${ASSET}/wordmark.png`,
  featuredImages = DEFAULT_FEATURED,
  catalogImages = DEFAULT_CATALOG,
  teamImages = DEFAULT_TEAM,
  background = "#050507",
  textColor = "#e9e5d7",
  mutedColor = "#807a70",
  accentColor = "#ddff39",
}: DarkCatalogPageProps) {
  const featured = repeat(featuredImages, DEFAULT_FEATURED, 4);
  const catalog = repeat(catalogImages, DEFAULT_CATALOG, 4);
  const team = repeat(teamImages, DEFAULT_TEAM, 5);

  return (
    <main
      className="dcp-root"
      style={
        {
          "--dcp-bg": background,
          "--dcp-text": textColor,
          "--dcp-muted": mutedColor,
          "--dcp-accent": accentColor,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <section className="dcp-hero">
        <nav className="dcp-nav" aria-label="Catalog navigation">
          <a href="#top">BLANK</a>
          <a href="#manifesto">Manifesto</a>
          <a href="#catalog">Catalog</a>
          <a href="#team">Team</a>
        </nav>
        <div className="dcp-grid-light" />
        <div className="dcp-signals">
          <p>{leftSignal}</p>
          <p>{rightSignal}</p>
        </div>
        <div className="dcp-logo">
          {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
          <img src={logoImage} alt={title} />
        </div>
        <p className="dcp-hero-note">
          Hard-surface page kit for game studios, catalogs, launch worlds, and
          cinematic product systems.
        </p>
      </section>

      <section className="dcp-manifesto" id="manifesto">
        <p>The manifesto</p>
        <h2>{manifesto}</h2>
      </section>

      <section className="dcp-featured">
        {featured.map((src, index) => (
          <article key={src}>
            {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
            <img src={src} alt={`Featured world ${index + 1}`} />
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>
              {
                ["Signal room", "Cold relay", "Terminal field", "Locked orbit"][
                  index
                ]
              }
            </h3>
          </article>
        ))}
      </section>

      <section className="dcp-catalog" id="catalog">
        <div className="dcp-catalog-copy">
          <p>Catalog</p>
          <h2>Playable systems staged as stark artifacts.</h2>
        </div>
        <div className="dcp-catalog-grid">
          {catalog.map((src, index) => (
            <figure key={src}>
              {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
              <img src={src} alt={`Catalog release ${index + 1}`} />
              <figcaption>
                <span>Build {String(index + 41)}</span>
                <span>Active research</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="dcp-team" id="team">
        <div>
          <p>Team array</p>
          <h2>Five operators, one shared pressure system.</h2>
        </div>
        <div className="dcp-team-row">
          {team.map((src, index) => (
            <figure key={src}>
              {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
              <img src={src} alt={`Operator ${index + 1}`} />
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = `
.dcp-root {
  width: 100%;
  min-height: 100svh;
  background: var(--dcp-bg);
  color: var(--dcp-text);
  font-family: ui-sans-serif, system-ui, sans-serif;
  overflow-x: hidden;
}

.dcp-root a {
  color: inherit;
  text-decoration: none;
}

.dcp-hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.dcp-hero::before {
  content: "";
  position: absolute;
  inset: 12%;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--dcp-accent) 18%, transparent), transparent 68%);
  filter: blur(40px);
  transform: scaleX(1.6);
}

.dcp-nav {
  position: absolute;
  z-index: 4;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  display: grid;
  grid-template-columns: 1fr repeat(3, auto);
  gap: 1.25rem;
  color: var(--dcp-muted);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dcp-grid-light {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(color-mix(in srgb, var(--dcp-text) 8%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--dcp-text) 8%, transparent) 1px, transparent 1px);
  background-size: 5rem 5rem;
  mask-image: radial-gradient(circle at center, black, transparent 72%);
}

.dcp-signals {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 2rem;
  right: 2rem;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
  color: var(--dcp-muted);
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dcp-logo {
  position: relative;
  z-index: 3;
  width: min(30rem, 72vw);
  filter: drop-shadow(0 0 30px color-mix(in srgb, var(--dcp-accent) 18%, transparent));
}

.dcp-logo img {
  width: 100%;
  height: auto;
  display: block;
}

.dcp-hero-note {
  position: absolute;
  z-index: 3;
  bottom: 2rem;
  left: 50%;
  width: min(26rem, calc(100% - 2rem));
  margin: 0;
  transform: translateX(-50%);
  color: var(--dcp-muted);
  text-align: center;
  line-height: 1.5;
}

.dcp-manifesto {
  min-height: 100svh;
  display: grid;
  place-items: center;
  gap: 1.4rem;
  padding: clamp(3rem, 8vw, 8rem) clamp(1rem, 2vw, 2rem);
  text-align: center;
  background: color-mix(in srgb, var(--dcp-bg) 88%, white);
}

.dcp-manifesto p,
.dcp-catalog-copy p,
.dcp-team p {
  margin: 0;
  color: var(--dcp-accent);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.dcp-manifesto h2,
.dcp-catalog-copy h2,
.dcp-team h2 {
  max-width: 13ch;
  margin: 0;
  font-size: clamp(3rem, 8vw, 9rem);
  font-weight: 520;
  line-height: 0.9;
  letter-spacing: 0;
  text-transform: uppercase;
}

.dcp-featured {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: color-mix(in srgb, var(--dcp-text) 12%, transparent);
}

.dcp-featured article {
  position: relative;
  min-height: 42rem;
  overflow: hidden;
  background: var(--dcp-bg);
}

.dcp-featured img,
.dcp-catalog img,
.dcp-team img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(0.2) contrast(1.08);
}

.dcp-featured article::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.78));
}

.dcp-featured span,
.dcp-featured h3 {
  position: absolute;
  z-index: 2;
  left: 1rem;
  margin: 0;
}

.dcp-featured span {
  bottom: 5.4rem;
  color: var(--dcp-accent);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}

.dcp-featured h3 {
  bottom: 1rem;
  max-width: 12rem;
  font-size: clamp(1.5rem, 2.8vw, 3rem);
  font-weight: 520;
  line-height: 0.9;
  text-transform: uppercase;
}

.dcp-catalog {
  display: grid;
  grid-template-columns: 0.75fr 1.25fr;
  gap: clamp(2rem, 5vw, 5rem);
  padding: clamp(4rem, 8vw, 8rem) clamp(1rem, 2vw, 2rem);
}

.dcp-catalog-copy {
  position: sticky;
  top: 2rem;
  align-self: start;
  display: grid;
  gap: 1rem;
}

.dcp-catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.dcp-catalog figure {
  margin: 0;
}

.dcp-catalog figure img {
  aspect-ratio: 4 / 5;
}

.dcp-catalog figcaption {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.75rem;
  color: var(--dcp-muted);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.dcp-team {
  display: grid;
  gap: clamp(2rem, 5vw, 5rem);
  padding: clamp(4rem, 8vw, 8rem) clamp(1rem, 2vw, 2rem);
  background: color-mix(in srgb, var(--dcp-bg) 88%, white);
}

.dcp-team > div:first-child {
  display: grid;
  grid-template-columns: minmax(9rem, 0.3fr) 1fr;
  gap: 2rem;
}

.dcp-team-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  background: color-mix(in srgb, var(--dcp-text) 12%, transparent);
}

.dcp-team-row figure {
  margin: 0;
  aspect-ratio: 3 / 4;
  background: var(--dcp-bg);
}

@media (max-width: 900px) {
  .dcp-nav,
  .dcp-featured,
  .dcp-catalog,
  .dcp-catalog-grid,
  .dcp-team > div:first-child,
  .dcp-team-row {
    grid-template-columns: 1fr;
  }

  .dcp-signals {
    display: none;
  }

  .dcp-featured article {
    min-height: 30rem;
  }

  .dcp-catalog-copy {
    position: relative;
    top: auto;
  }
}
`;

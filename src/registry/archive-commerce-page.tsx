"use client";

/**
 * Archive Commerce Page - a full-screen editorial storefront.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";

export interface ArchiveCommercePageProps {
  title?: string;
  subtitle?: string;
  kicker?: string;
  heroImage?: string;
  productImages?: string[];
  articleImages?: string[];
  background?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
}

const ASSET = "https://compronents.dev/assets/archive-commerce-page";

const DEFAULT_PRODUCTS = Array.from(
  { length: 6 },
  (_, i) => `${ASSET}/product-${i + 1}.jpeg`,
);

const DEFAULT_ARTICLES = Array.from(
  { length: 3 },
  (_, i) => `${ASSET}/article-${i + 1}.jpeg`,
);

function cycle(items: string[], count: number) {
  const source = items.length ? items : DEFAULT_PRODUCTS;
  return Array.from({ length: count }, (_, i) => source[i % source.length]);
}

export default function ArchiveCommercePage({
  title = "BLANK ARCHIVE",
  subtitle = "A quiet catalogue for mockups, objects, notes, and release fragments arranged with gallery-level restraint.",
  kicker = "Drop 04, reusable product surfaces",
  heroImage = `${ASSET}/hero.gif`,
  productImages = DEFAULT_PRODUCTS,
  articleImages = DEFAULT_ARTICLES,
  background = "#f7f5ef",
  textColor = "#16130f",
  mutedColor = "#6f675d",
  accentColor = "#c84f2f",
}: ArchiveCommercePageProps) {
  const products = cycle(productImages, 6);
  const articles = cycle(articleImages, 3);

  return (
    <main
      className="acp-root"
      style={
        {
          "--acp-bg": background,
          "--acp-text": textColor,
          "--acp-muted": mutedColor,
          "--acp-accent": accentColor,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <section className="acp-hero">
        <nav className="acp-nav" aria-label="Archive navigation">
          <a href="#archive">BLANK</a>
          <div>
            <a href="#objects">Objects</a>
            <a href="#notes">Notes</a>
            <a href="#index">Index</a>
          </div>
        </nav>

        <div className="acp-hero-media" aria-hidden="true">
          {/* biome-ignore lint/performance/noImgElement: registry components use portable img tags. */}
          <img src={heroImage} alt="" />
        </div>

        <div className="acp-copy">
          <p>{kicker}</p>
          <h1>
            {title.split(" ").map((word) => (
              <span key={word}>{word}</span>
            ))}
          </h1>
        </div>

        <aside className="acp-panel" aria-label="Archive summary">
          <p>{subtitle}</p>
          <a href="#objects">Browse the system</a>
        </aside>

        <div className="acp-product-strip" id="objects">
          {products.slice(0, 3).map((src, index) => (
            <figure key={src} className="acp-product-card">
              {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
              <img src={src} alt={`Archive object ${index + 1}`} />
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>Object study</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="acp-index" id="archive">
        <div className="acp-index-heading">
          <p>Current index</p>
          <h2>
            Product surfaces with enough silence around them to be studied.
          </h2>
        </div>
        <div className="acp-grid">
          {products.map((src, index) => (
            <article key={src} className="acp-grid-item">
              <div>
                {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
                <img src={src} alt={`Surface specimen ${index + 1}`} />
              </div>
              <p>Surface {String(index + 1).padStart(2, "0")}</p>
              <span>Mockup asset, high contrast preview</span>
            </article>
          ))}
        </div>
      </section>

      <section className="acp-notes" id="notes">
        {articles.map((src, index) => (
          <article key={src} className="acp-note">
            <div>
              {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
              <img src={src} alt={`Archive note ${index + 1}`} />
            </div>
            <p>Note {String(index + 1).padStart(2, "0")}</p>
            <h3>
              {index === 0
                ? "The object is treated like a small building."
                : index === 1
                  ? "Every preview needs a useful amount of quiet."
                  : "The archive works best when it feels handled."}
            </h3>
          </article>
        ))}
      </section>
    </main>
  );
}

const styles = `
.acp-root {
  width: 100%;
  min-height: 100svh;
  background: var(--acp-bg);
  color: var(--acp-text);
  font-family: ui-sans-serif, system-ui, sans-serif;
  overflow-x: hidden;
}

.acp-root a {
  color: inherit;
  text-decoration: none;
}

.acp-hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: clamp(1rem, 2vw, 2rem);
  overflow: hidden;
}

.acp-nav {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.acp-nav div {
  display: flex;
  gap: clamp(0.75rem, 2vw, 2rem);
}

.acp-hero-media {
  position: absolute;
  inset: 10% 23% 13%;
  z-index: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--acp-text) 12%, transparent);
  filter: saturate(0.9);
}

.acp-hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.88;
}

.acp-copy {
  position: relative;
  z-index: 2;
  align-self: end;
  max-width: min(84rem, 92vw);
  padding-bottom: clamp(9rem, 19vh, 14rem);
}

.acp-copy p,
.acp-panel p,
.acp-index-heading p,
.acp-grid-item span,
.acp-note p {
  color: var(--acp-muted);
}

.acp-copy p {
  max-width: 24rem;
  margin: 0 0 1.5rem 0.2rem;
  font-size: clamp(0.76rem, 1.2vw, 0.95rem);
  line-height: 1.45;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.acp-copy h1 {
  display: flex;
  flex-direction: column;
  margin: 0;
  font-size: clamp(4.5rem, 15vw, 17rem);
  font-weight: 620;
  line-height: 0.72;
  letter-spacing: 0;
  text-transform: uppercase;
}

.acp-copy h1 span:nth-child(2) {
  padding-left: clamp(1.5rem, 12vw, 12rem);
}

.acp-panel {
  position: absolute;
  right: clamp(1rem, 2vw, 2rem);
  top: 18%;
  z-index: 3;
  width: min(19rem, calc(100vw - 2rem));
  display: grid;
  gap: 1rem;
  font-size: 0.92rem;
  line-height: 1.55;
}

.acp-panel a {
  width: max-content;
  border-bottom: 1px solid var(--acp-accent);
  color: var(--acp-accent);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.acp-product-strip {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  width: min(36rem, 100%);
  justify-self: end;
  align-self: end;
}

.acp-product-card {
  margin: 0;
  min-width: 0;
}

.acp-product-card img,
.acp-grid-item img,
.acp-note img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.acp-product-card img {
  aspect-ratio: 4 / 3;
  background: #ddd5c9;
}

.acp-product-card figcaption {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.55rem;
  color: var(--acp-muted);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.acp-index {
  padding: clamp(4rem, 8vw, 8rem) clamp(1rem, 2vw, 2rem);
}

.acp-index-heading {
  display: grid;
  grid-template-columns: minmax(9rem, 0.35fr) 1fr;
  gap: clamp(1rem, 4vw, 4rem);
  margin-bottom: clamp(2rem, 5vw, 5rem);
}

.acp-index-heading h2 {
  max-width: 58rem;
  margin: 0;
  font-size: clamp(2.4rem, 7vw, 8rem);
  font-weight: 560;
  line-height: 0.9;
  letter-spacing: 0;
  text-transform: uppercase;
}

.acp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 2rem);
}

.acp-grid-item {
  display: grid;
  gap: 0.65rem;
}

.acp-grid-item div {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #ded8ce;
}

.acp-grid-item p {
  margin: 0;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.acp-grid-item span {
  font-size: 0.82rem;
}

.acp-notes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: color-mix(in srgb, var(--acp-text) 12%, transparent);
  padding-top: 1px;
}

.acp-note {
  display: grid;
  gap: 1.25rem;
  min-height: 36rem;
  padding: clamp(1rem, 2vw, 2rem);
  background: var(--acp-bg);
}

.acp-note div {
  aspect-ratio: 1;
  overflow: hidden;
}

.acp-note h3 {
  align-self: end;
  margin: 0;
  font-size: clamp(1.8rem, 3.4vw, 4rem);
  font-weight: 560;
  line-height: 0.92;
  letter-spacing: 0;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .acp-hero {
    min-height: 110svh;
  }

  .acp-nav,
  .acp-nav div {
    align-items: flex-start;
  }

  .acp-nav div {
    flex-direction: column;
    gap: 0.4rem;
  }

  .acp-hero-media {
    inset: 14% 1rem 24%;
  }

  .acp-copy {
    padding-bottom: 13rem;
  }

  .acp-panel {
    top: auto;
    right: auto;
    left: 1rem;
    bottom: 9rem;
  }

  .acp-product-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .acp-index-heading,
  .acp-grid,
  .acp-notes {
    grid-template-columns: 1fr;
  }

  .acp-note {
    min-height: 28rem;
  }
}
`;

"use client";

/**
 * Dining Room Page - a refined restaurant page with collage, menu, and CTA.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";

export interface DiningRoomPageProps {
  title?: string;
  location?: string;
  since?: string;
  about?: string;
  heroImage?: string;
  aboutImages?: string[];
  menuImages?: string[];
  ctaImage?: string;
  background?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
}

const ASSET = "https://compronents.dev/assets/dining-room-page";

const DEFAULT_ABOUT = Array.from(
  { length: 6 },
  (_, i) => `${ASSET}/about-${i + 1}.jpg`,
);

const DEFAULT_MENU = Array.from(
  { length: 5 },
  (_, i) => `${ASSET}/menu-${i + 1}.jpg`,
);

function take(items: string[], fallback: string[], count: number) {
  const source = items.length ? items : fallback;
  return Array.from({ length: count }, (_, i) => source[i % source.length]);
}

export default function DiningRoomPage({
  title = "BLANK Dining",
  location = "Florence, IT",
  since = "Since 1984",
  about = "A dining room built on balance and subtlety, where materials, light, and service create something that feels effortless.",
  heroImage = `${ASSET}/hero.jpg`,
  aboutImages = DEFAULT_ABOUT,
  menuImages = DEFAULT_MENU,
  ctaImage = `${ASSET}/cta.jpg`,
  background = "#f4efe7",
  textColor = "#191612",
  mutedColor = "#81766b",
  accentColor = "#7f2f21",
}: DiningRoomPageProps) {
  const gallery = take(aboutImages, DEFAULT_ABOUT, 6);
  const menus = take(menuImages, DEFAULT_MENU, 5);

  return (
    <main
      className="drp-root"
      style={
        {
          "--drp-bg": background,
          "--drp-text": textColor,
          "--drp-muted": mutedColor,
          "--drp-accent": accentColor,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <section className="drp-hero">
        {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
        <img src={heroImage} alt="" />
        <nav className="drp-nav" aria-label="Dining navigation">
          <a href="#top">BLANK Dining</a>
          <a href="#menu">Menu</a>
          <a href="#reserve">Reserve</a>
        </nav>
        <div className="drp-hero-copy">
          <h1>{title}</h1>
        </div>
        <footer className="drp-hero-footer">
          <p>{since}</p>
          <p>{location}</p>
        </footer>
      </section>

      <section className="drp-about">
        <div className="drp-about-copy">
          <p>Maison dining</p>
          <h2>{about}</h2>
        </div>
        <div className="drp-collage">
          {gallery.map((src, index) => (
            <div key={src} className={`drp-img drp-img-${index + 1}`}>
              {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
              <img src={src} alt={`Dining detail ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="drp-menu" id="menu">
        <div className="drp-menu-header">
          <p>Current menu</p>
          <h2>Small plates, slow evenings, precise service.</h2>
        </div>
        <div className="drp-menu-grid">
          {menus.map((src, index) => (
            <article key={src}>
              <div>
                {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
                <img src={src} alt={`Menu category ${index + 1}`} />
              </div>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>
                {
                  [
                    "Breakfast",
                    "Shared plates",
                    "Wood fire",
                    "Cold sweets",
                    "Mineral drinks",
                  ][index]
                }
              </h3>
            </article>
          ))}
        </div>
      </section>

      <section className="drp-reserve" id="reserve">
        <div>
          <p>Reservation note</p>
          <h2>Hold the room for the hour when the light turns amber.</h2>
          <a href="#reserve">Request a table</a>
        </div>
        <figure>
          {/* biome-ignore lint/performance/noImgElement: portable registry image. */}
          <img src={ctaImage} alt="Dining table prepared for service" />
        </figure>
      </section>
    </main>
  );
}

const styles = `
.drp-root {
  width: 100%;
  min-height: 100svh;
  background: var(--drp-bg);
  color: var(--drp-text);
  font-family: Georgia, "Times New Roman", serif;
  overflow-x: hidden;
}

.drp-root a {
  color: inherit;
  text-decoration: none;
}

.drp-hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  display: grid;
  place-items: center;
  text-align: center;
}

.drp-hero > img,
.drp-img img,
.drp-menu img,
.drp-reserve img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.drp-hero > img {
  position: absolute;
  inset: 0;
  z-index: 0;
  filter: saturate(0.86) contrast(0.96);
}

.drp-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(24, 18, 14, 0.18);
}

.drp-nav {
  position: absolute;
  z-index: 3;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: white;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.drp-nav a:first-child {
  margin-right: auto;
}

.drp-hero-copy {
  position: relative;
  z-index: 2;
  width: min(88rem, 92vw);
  color: white;
}

.drp-hero-copy h1 {
  margin: 0;
  font-size: clamp(5rem, 16vw, 18rem);
  font-weight: 400;
  line-height: 0.78;
  letter-spacing: 0;
}

.drp-hero-footer {
  position: absolute;
  z-index: 3;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.82);
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.drp-about {
  position: relative;
  min-height: 220svh;
  display: grid;
  place-items: start center;
  padding: 16svh clamp(1rem, 2vw, 2rem);
}

.drp-about-copy {
  position: sticky;
  top: 10svh;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 1rem;
  text-align: center;
}

.drp-about-copy p,
.drp-menu-header p,
.drp-reserve p {
  margin: 0;
  color: var(--drp-muted);
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.drp-about-copy h2,
.drp-menu-header h2,
.drp-reserve h2 {
  max-width: 13ch;
  margin: 0;
  font-size: clamp(2.8rem, 8vw, 9rem);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: 0;
}

.drp-collage {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.drp-img {
  position: absolute;
  overflow: hidden;
  border-radius: 0.35rem;
  box-shadow: 0 24px 80px rgba(40, 27, 18, 0.14);
}

.drp-img-1 { top: 8%; left: 25%; width: 13%; aspect-ratio: 1; }
.drp-img-2 { top: 18%; right: 17%; width: 16%; aspect-ratio: 5 / 7; }
.drp-img-3 { top: 42%; left: 8%; width: 20%; aspect-ratio: 4 / 5; }
.drp-img-4 { top: 52%; left: 43%; width: 22%; aspect-ratio: 1; }
.drp-img-5 { top: 68%; right: 8%; width: 14%; aspect-ratio: 1; }
.drp-img-6 { top: 76%; left: 20%; width: 18%; aspect-ratio: 5 / 7; }

.drp-menu {
  padding: clamp(4rem, 9vw, 9rem) clamp(1rem, 2vw, 2rem);
  background: color-mix(in srgb, var(--drp-bg) 88%, white);
}

.drp-menu-header {
  display: grid;
  grid-template-columns: minmax(9rem, 0.3fr) 1fr;
  gap: 2rem;
  margin-bottom: clamp(2rem, 5vw, 5rem);
}

.drp-menu-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  background: color-mix(in srgb, var(--drp-text) 16%, transparent);
}

.drp-menu-grid article {
  display: grid;
  gap: 0.85rem;
  padding: 0.85rem;
  background: var(--drp-bg);
}

.drp-menu-grid article div {
  aspect-ratio: 3 / 4;
  overflow: hidden;
}

.drp-menu-grid span {
  color: var(--drp-muted);
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
}

.drp-menu-grid h3 {
  margin: 0;
  font-size: clamp(1.3rem, 2vw, 2.1rem);
  font-weight: 400;
  line-height: 0.98;
}

.drp-reserve {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  min-height: 95svh;
  background: var(--drp-text);
  color: var(--drp-bg);
}

.drp-reserve > div {
  display: grid;
  align-content: center;
  gap: 1.5rem;
  padding: clamp(2rem, 5vw, 5rem);
}

.drp-reserve p {
  color: color-mix(in srgb, var(--drp-bg) 70%, transparent);
}

.drp-reserve a {
  width: max-content;
  border: 1px solid color-mix(in srgb, var(--drp-bg) 35%, transparent);
  border-radius: 999px;
  padding: 0.85rem 1.1rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.drp-reserve figure {
  margin: 0;
  min-height: 95svh;
}

@media (max-width: 900px) {
  .drp-nav {
    flex-wrap: wrap;
  }

  .drp-hero-copy h1 {
    font-size: clamp(4.8rem, 22vw, 9rem);
  }

  .drp-about-copy h2 {
    max-width: 10ch;
  }

  .drp-img-1 { width: 25%; left: 6%; }
  .drp-img-2 { width: 24%; right: 6%; }
  .drp-img-3 { width: 32%; }
  .drp-img-4 { width: 32%; left: 48%; }
  .drp-img-5 { width: 22%; }
  .drp-img-6 { width: 28%; left: 10%; }

  .drp-menu-header,
  .drp-menu-grid,
  .drp-reserve {
    grid-template-columns: 1fr;
  }
}
`;

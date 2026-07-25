"use client";

/**
 * Shuffle Grid Preloader - a load sequence built from a three by three grid
 * that riffles. Two columns of credits fade up against a wordmark whose fill
 * climbs line by line, then the panel clears and the grid wipes in. Twenty
 * rounds of random nine-image sets are swapped through at 150ms, so the tiles
 * flicker like a shuffling deck, and the final round restores the real center
 * frame. Everything but that center tile wipes away, and it scales four times
 * while its own image counter-scales back to one, so the tile becomes the
 * page's hero photograph at native size.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/shuffle-grid-preloader";

export interface ShuffleProject {
  name: string;
  director: string;
  location: string;
}

export interface ShuffleGridPreloaderProps {
  wordmarkLines?: [string, string];
  navLinks?: [string[], string[]];
  projects?: ShuffleProject[];
  introCopy?: [string, string];
  title?: string;
  images?: string[];
  heroImage?: string;
  bannerImages?: [string, string];
}

const DEFAULT_IMAGES = Array.from(
  { length: 35 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpeg`,
);

const DEFAULT_PROJECTS: ShuffleProject[] = [
  {
    name: "Lunar Eclipse",
    director: "Amelia Crawford",
    location: "Toronto, ON",
  },
  {
    name: "Visitor Quarters",
    director: "Marcus Reynolds",
    location: "Vancouver Studio, BC",
  },
  { name: "Celestial", director: "Nina Liu // Weston", location: "Austin, TX" },
  {
    name: "Streamwave Original",
    director: "Dylan Pierce",
    location: "Sunset Studios - Miami",
  },
  {
    name: "Viewfinder",
    director: "Javier // Rodriguez",
    location: "BLANK Studios - Chicago",
  },
  {
    name: "Rhythm Collective",
    director: "Sophia // Chen",
    location: "London, UK",
  },
  {
    name: "Urban Odyssey",
    director: "Leo Thompson",
    location: "Pioneer Studios - Seattle",
  },
  {
    name: "Prism No. 1",
    director: "Taylor // McKnight",
    location: "Private Estate - Sedona",
  },
  {
    name: "Vision Quest",
    director: "Spencer // Hudson",
    location: "Elevation - Denver",
  },
  {
    name: "Wavelength",
    director: "Kai Nakamura",
    location: "San Francisco, CA",
  },
  { name: "Desert Horizon", director: "Olivia", location: "New Mexico" },
  {
    name: "Spectrum",
    director: "Ellis // Moss",
    location: "Harmony Studio - Montreal",
  },
  {
    name: "Vision Quest II",
    director: "Hudson // Wright",
    location: "Elevation Studios - Denver",
  },
  { name: "Auteur", director: "Leo Thompson", location: "Berlin, DE" },
  {
    name: "Capsule X Design",
    director: "Sophia // Chen",
    location: "Neon House - Brooklyn",
  },
  {
    name: "Pulse",
    director: "Callum // Winters",
    location: "Echo Pavilion - Portland",
  },
];

export default function ShuffleGridPreloader({
  wordmarkLines = ["Nova", "Vice"],
  navLinks = [
    ["Index", "Work"],
    ["About", "Contact"],
  ],
  projects = DEFAULT_PROJECTS,
  introCopy = ["Creative Solutions", "Impactful Results"],
  title = "Crafting bold experiences",
  images = DEFAULT_IMAGES,
  heroImage = `${ASSET_BASE}/img5.jpeg`,
  bannerImages = [`${ASSET_BASE}/img7.jpeg`, `${ASSET_BASE}/img16.jpeg`],
}: ShuffleGridPreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!images.length) return;
    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("nrt-hop", "0.9, 0, 0.1, 1");

    const gridImages = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".nrt-img"),
    );
    const heroImageEl = root.querySelector<HTMLElement>(
      ".nrt-img.nrt-hero-img",
    );
    const otherImages = gridImages.filter((img) => img !== heroImageEl);
    const introCopyEls = root.querySelectorAll(".nrt-intro-copy h3");
    const titleEl = root.querySelector<HTMLElement>(".nrt-title h1");
    if (!heroImageEl || !titleEl) return;

    const introSplits = Array.from(introCopyEls).map((el) =>
      SplitText.create(el, { type: "words", wordsClass: "nrt-word" }),
    );
    const titleSplit = SplitText.create(titleEl, {
      type: "words",
      wordsClass: "nrt-word",
    });

    const introWords = introSplits.flatMap((s) => s.words);

    const getRandomImageSet = () => {
      const shuffled = [...images].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 9);
    };

    const rotationTweens: gsap.core.Tween[] = [];

    const startImageRotation = () => {
      const totalCycles = 20;

      for (let cycle = 0; cycle < totalCycles; cycle++) {
        const randomImages = getRandomImageSet();

        rotationTweens.push(
          gsap.to(
            {},
            {
              duration: 0,
              delay: cycle * 0.15,
              onComplete: () => {
                gridImages.forEach((img, index) => {
                  const imgElement = img.querySelector("img");
                  if (!imgElement) return;

                  if (cycle === totalCycles - 1 && img === heroImageEl) {
                    imgElement.src = heroImage;
                    gsap.set(heroImageEl.querySelector("img"), { scale: 2 });
                  } else {
                    imgElement.src = randomImages[index % randomImages.length];
                  }
                });
              },
            },
          ),
        );
      }
    };

    const nav = root.querySelector<HTMLElement>(".nrt-nav");
    gsap.set(nav, { y: "-125%" });
    gsap.set(introWords, { y: "110%" });
    gsap.set(titleSplit.words, { y: "110%" });

    const overlayTimeline = gsap.timeline();
    const imagesTimeline = gsap.timeline();
    const textTimeline = gsap.timeline();
    let rotationTimer = 0;

    overlayTimeline.to(root.querySelector(".nrt-logo-line-1"), {
      backgroundPosition: "0% 0%",
      color: "#fff",
      duration: 1,
      ease: "none",
      delay: 0.5,
      onComplete: () => {
        gsap.to(root.querySelector(".nrt-logo-line-2"), {
          backgroundPosition: "0% 0%",
          color: "#fff",
          duration: 1,
          ease: "none",
        });
      },
    });

    const projectRows = root.querySelectorAll(
      ".nrt-projects-header, .nrt-project-item",
    );
    const locationRows = root.querySelectorAll(
      ".nrt-locations-header, .nrt-location-item",
    );
    const projectItems = root.querySelectorAll(".nrt-project-item");
    const locationItems = root.querySelectorAll(".nrt-location-item");

    overlayTimeline.to(projectRows, {
      opacity: 1,
      duration: 0.15,
      stagger: 0.075,
      delay: 1,
    });

    overlayTimeline.to(
      locationRows,
      { opacity: 1, duration: 0.15, stagger: 0.075 },
      "<",
    );

    overlayTimeline.to(projectItems, {
      color: "#fff",
      duration: 0.15,
      stagger: 0.075,
    });

    overlayTimeline.to(
      locationItems,
      { color: "#fff", duration: 0.15, stagger: 0.075 },
      "<",
    );

    overlayTimeline.to(projectRows, {
      opacity: 0,
      duration: 0.15,
      stagger: 0.075,
    });

    overlayTimeline.to(
      locationRows,
      { opacity: 0, duration: 0.15, stagger: 0.075 },
      "<",
    );

    overlayTimeline.to(root.querySelector(".nrt-overlay"), {
      opacity: 0,
      duration: 0.5,
      delay: 1.5,
    });

    imagesTimeline.to(gridImages, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1,
      delay: 2.5,
      stagger: 0.05,
      ease: "nrt-hop",
      onStart: () => {
        rotationTimer = window.setTimeout(() => {
          startImageRotation();
          gsap.to(root.querySelector(".nrt-loader"), {
            opacity: 0,
            duration: 0.3,
          });
        }, 1000);
      },
    });

    imagesTimeline.to(otherImages, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      delay: 2.5,
      stagger: 0.05,
      ease: "nrt-hop",
    });

    imagesTimeline.to(heroImageEl, { y: -50, duration: 1, ease: "nrt-hop" });

    imagesTimeline.to(heroImageEl, {
      scale: 4,
      clipPath: "polygon(20% 10%, 80% 10%, 80% 90%, 20% 90%)",
      duration: 1.5,
      ease: "nrt-hop",
      onStart: () => {
        gsap.to(heroImageEl.querySelector("img"), {
          scale: 1,
          duration: 1.5,
          ease: "nrt-hop",
        });

        gsap.to(root.querySelectorAll(".nrt-banner-img"), {
          scale: 1,
          delay: 0.5,
          duration: 0.5,
        });
        gsap.to(nav, { y: "0%", duration: 1, ease: "nrt-hop", delay: 0.25 });
      },
    });

    imagesTimeline.to(
      root.querySelector(".nrt-banner-img-1"),
      { left: "40%", rotate: -20, duration: 1.5, delay: 0.5, ease: "nrt-hop" },
      "<",
    );

    imagesTimeline.to(
      root.querySelector(".nrt-banner-img-2"),
      { left: "60%", rotate: 20, duration: 1.5, ease: "nrt-hop" },
      "<",
    );

    textTimeline.to(titleSplit.words, {
      y: "0%",
      duration: 1,
      stagger: 0.1,
      delay: 9.5,
      ease: "power3.out",
    });

    textTimeline.to(
      introWords,
      {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        delay: 0.25,
        ease: "power3.out",
      },
      "<",
    );

    return () => {
      clearTimeout(rotationTimer);
      overlayTimeline.kill();
      imagesTimeline.kill();
      textTimeline.kill();
      for (const tween of rotationTweens) tween.kill();
      for (const split of introSplits) split.revert();
      titleSplit.revert();
    };
  }, [images, heroImage, projects]);

  return (
    <div className="nrt-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="nrt-overlay">
        <div className="nrt-projects">
          <div className="nrt-projects-header">
            <p>Project</p>
            <p>Director</p>
          </div>
          {projects.map((project) => (
            <div className="nrt-project-item" key={project.name}>
              <p>{project.name}</p>
              <p>{project.director}</p>
            </div>
          ))}
        </div>
        <div className="nrt-loader">
          <h1 className="nrt-logo-line-1">{wordmarkLines[0]}</h1>
          <h1 className="nrt-logo-line-2">{wordmarkLines[1]}</h1>
        </div>
        <div className="nrt-locations">
          <div className="nrt-locations-header">
            <p>Location</p>
          </div>
          {projects.map((project) => (
            <div className="nrt-location-item" key={project.name}>
              <p>{project.location}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="nrt-image-grid">
        {[0, 1, 2].map((rowIndex) => (
          <div className="nrt-grid-row" key={`grid-row-${rowIndex}`}>
            {[0, 1, 2].map((colIndex) => {
              const cellIndex = rowIndex * 3 + colIndex;
              const isHero = cellIndex === 4;
              return (
                <div
                  className={isHero ? "nrt-img nrt-hero-img" : "nrt-img"}
                  key={`grid-cell-${cellIndex}`}
                >
                  <img src={isHero ? heroImage : images[cellIndex]} alt="" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <nav className="nrt-nav">
        <div className="nrt-links">
          {navLinks[0].map((link) => (
            <a href="#top" key={link}>
              {link}
            </a>
          ))}
        </div>
        <div className="nrt-nav-logo">
          <a href="#top">
            {wordmarkLines[0]}
            <br />
            {wordmarkLines[1]}
          </a>
        </div>
        <div className="nrt-links">
          {navLinks[1].map((link) => (
            <a href="#top" key={link}>
              {link}
            </a>
          ))}
        </div>
      </nav>

      <div className="nrt-banner-img nrt-banner-img-1">
        <img src={bannerImages[0]} alt="" />
      </div>
      <div className="nrt-banner-img nrt-banner-img-2">
        <img src={bannerImages[1]} alt="" />
      </div>

      <div className="nrt-intro-copy">
        <h3>{introCopy[0]}</h3>
        <h3>{introCopy[1]}</h3>
      </div>

      <div className="nrt-title">
        <h1>{title}</h1>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=DM+Mono:wght@400;500&display=swap");

.nrt-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "DM Mono", monospace;
  background-color: #e3e3db;
}
.nrt-root * { margin: 0; padding: 0; box-sizing: border-box; }
.nrt-root img { width: 100%; height: 100%; object-fit: cover; }
.nrt-root p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.7rem;
}
.nrt-root a {
  text-decoration: none;
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.7rem;
  color: #000;
}
.nrt-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2em;
  background-color: #000;
  color: #fff;
  display: flex;
  gap: 2em;
  overflow: hidden;
  z-index: 3;
}
.nrt-projects,
.nrt-loader,
.nrt-locations {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1em;
}
.nrt-loader { align-items: center; gap: 0; }
.nrt-loader h1 {
  text-align: center;
  text-transform: uppercase;
  font-family: "Anton", sans-serif;
  font-size: 2.5rem;
  font-style: italic;
  line-height: 0.9;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-image: linear-gradient(0deg, #3a3a3a, #3a3a3a 50%, #fff 0);
  background-size: 100% 200%;
  background-position: 0% 100%;
  color: #3a3a3a;
}
.nrt-projects-header,
.nrt-project-item,
.nrt-locations-header,
.nrt-location-item {
  display: flex;
  gap: 2em;
  opacity: 0;
}
.nrt-projects-header > *,
.nrt-project-item > * { flex: 1; }
.nrt-locations { align-items: center; }
.nrt-locations-header,
.nrt-location-item { width: 50%; }
.nrt-project-item,
.nrt-location-item { color: #4f4f4f; }
.nrt-image-grid {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30%;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  gap: 1em;
  z-index: 2;
}
.nrt-grid-row { width: 100%; display: flex; gap: 1em; }
.nrt-img {
  position: relative;
  flex: 1;
  aspect-ratio: 1;
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
  overflow: hidden;
}
.nrt-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1em;
  display: flex;
  gap: 2em;
  z-index: 4;
}
.nrt-nav > * { flex: 1; }
.nrt-links {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.nrt-nav-logo {
  text-align: center;
  display: flex;
  justify-content: center;
}
.nrt-nav-logo a {
  font-family: "Anton", sans-serif;
  font-size: 1.75rem;
  font-weight: bolder;
  font-style: italic;
  line-height: 0.9;
}
.nrt-banner-img {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 20%;
  aspect-ratio: 4/5;
}
.nrt-intro-copy {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  width: 100%;
  padding: 0 8em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nrt-title {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
}
.nrt-intro-copy h3,
.nrt-title h1 {
  position: relative;
  text-transform: uppercase;
  color: #000;
  font-family: "Anton", sans-serif;
  font-weight: 500;
  font-style: italic;
  line-height: 0.9;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.nrt-title h1 { font-size: 3.5rem; }
.nrt-intro-copy h3 { font-size: 1.5rem; }
.nrt-intro-copy h3 .nrt-word,
.nrt-title h1 .nrt-word {
  display: inline-block;
  position: relative;
  will-change: transform;
  margin-right: 0.1rem;
}

@media (max-width: 900px) {
  .nrt-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .nrt-projects,
  .nrt-locations,
  .nrt-intro-copy,
  .nrt-banner-img { display: none; }
  .nrt-title {
    width: 100%;
    bottom: 20%;
    display: flex;
    justify-content: center;
  }
  .nrt-title h1 { font-size: 2.5rem; }
  .nrt-image-grid { width: 75%; gap: 0.5em; }
  .nrt-grid-row {
    width: 95%;
    justify-content: space-around;
    gap: 0.5em;
  }
}
`;

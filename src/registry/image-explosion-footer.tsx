"use client";

/**
 * Image Explosion Footer - a footer that erupts when it comes into view.
 * Fifteen cards are launched upward with randomised sideways force and spin,
 * then run on a real integrator: gravity accumulates into velocity every frame
 * while friction bleeds off horizontal drift and rotation, so the arc is
 * genuinely ballistic rather than an eased tween. The burst arms itself again
 * once every particle has fallen back below the midpoint, so scrolling away
 * and back re-fires it.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/image-explosion-footer";

export interface ImageExplosionFooterProps {
  heroImage?: string;
  outroImage?: string;
  aboutCopy?: string;
  footerHeading?: string;
  copyrightLines?: [string, string];
  images?: string[];
  gravity?: number;
  friction?: number;
  imageSize?: number;
  horizontalForce?: number;
  verticalForce?: number;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 15 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function ImageExplosionFooter({
  heroImage = `${ASSET_BASE}/hero.jpg`,
  outroImage = `${ASSET_BASE}/outro.jpg`,
  aboutCopy = "The world collapsed, but the game survived. In the neon-lit ruins of civilization, the last remnants of power are not in governments or corporations, they are in the decks. Each card carries a fragment of lost history, a code of survival, a weapon of deception. The elite hoard them. The rebels steal them. The desperate gamble their lives for them.",
  footerHeading = "The future is in your hands",
  copyrightLines = ["© 2025 BLANK", "All rights reserved."],
  images = DEFAULT_IMAGES,
  gravity = 0.25,
  friction = 0.99,
  imageSize = 150,
  horizontalForce = 20,
  verticalForce = 15,
  embedded = true,
}: ImageExplosionFooterProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const content = root.querySelector<HTMLElement>(".exp-content");
    const explosionContainer = root.querySelector<HTMLElement>(
      ".exp-explosion-container",
    );
    const footer = root.querySelector<HTMLElement>(".exp-footer");
    if (!content || !explosionContainer || !footer) return;

    const rotationSpeed = 10;
    const resetDelay = 500;

    let explosionTriggered = false;
    let animationId = 0;
    let checkTimeout = 0;
    let resetTimer = 0;
    let initialTimer = 0;

    interface Particle {
      element: HTMLElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
    }

    let particles: Particle[] = [];

    const makeParticle = (element: HTMLElement): Particle => ({
      element,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * horizontalForce,
      vy: -verticalForce - Math.random() * 10,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * rotationSpeed,
    });

    const updateParticle = (p: Particle) => {
      p.vy += gravity;
      p.vx *= friction;
      p.vy *= friction;
      p.rotationSpeed *= friction;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      p.element.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
    };

    const createParticles = () => {
      explosionContainer.replaceChildren();
      particles = [];

      for (const path of images) {
        const particle = document.createElement("img");
        particle.src = path;
        particle.alt = "";
        particle.className = "exp-particle-img";
        particle.style.width = `${imageSize}px`;
        explosionContainer.appendChild(particle);
      }

      particles = Array.from(
        explosionContainer.querySelectorAll<HTMLElement>(".exp-particle-img"),
      ).map(makeParticle);
    };

    const explode = () => {
      if (explosionTriggered) return;
      explosionTriggered = true;

      createParticles();

      let finished = false;

      const animate = () => {
        if (finished) return;

        for (const particle of particles) updateParticle(particle);

        if (
          particles.length > 0 &&
          particles.every(
            (particle) => particle.y > explosionContainer.offsetHeight / 2,
          )
        ) {
          cancelAnimationFrame(animationId);
          finished = true;
          resetTimer = window.setTimeout(() => {
            explosionTriggered = false;
          }, resetDelay);
          return;
        }

        animationId = requestAnimationFrame(animate);
      };

      animate();
    };

    const checkFooterPosition = () => {
      const footerRect = footer.getBoundingClientRect();
      const bounds = embedded
        ? root.getBoundingClientRect()
        : { top: 0, height: window.innerHeight };
      const relativeTop = footerRect.top - bounds.top;

      if (
        !explosionTriggered &&
        relativeTop <= bounds.height - footerRect.height * 0.5
      ) {
        explode();
      }
    };

    for (const path of images) {
      const img = new window.Image();
      img.src = path;
    }

    createParticles();

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const handleScroll = () => {
      clearTimeout(checkTimeout);
      checkTimeout = window.setTimeout(checkFooterPosition, 10);
    };
    lenis.on("scroll", handleScroll);

    initialTimer = window.setTimeout(checkFooterPosition, 500);

    const handleResize = () => {
      explosionTriggered = false;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      cancelAnimationFrame(rafId);
      clearTimeout(checkTimeout);
      clearTimeout(resetTimer);
      clearTimeout(initialTimer);
      window.removeEventListener("resize", handleResize);
      lenis.destroy();
      explosionContainer.replaceChildren();
    };
  }, [
    embedded,
    images,
    gravity,
    friction,
    imageSize,
    horizontalForce,
    verticalForce,
  ]);

  return (
    <div
      className={embedded ? "exp-root exp-embedded" : "exp-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="exp-content">
        <section
          className="exp-hero"
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        <section className="exp-about">
          <p>{aboutCopy}</p>
        </section>

        <section
          className="exp-outro"
          style={{ backgroundImage: `url(${outroImage})` }}
        />

        <footer className="exp-footer">
          <h1>{footerHeading}</h1>
          <div className="exp-copyright-info">
            <p>{copyrightLines[0]}</p>
            <p>{copyrightLines[1]}</p>
          </div>

          <div className="exp-explosion-container" />
        </footer>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:opsz,wght@14..32,100..900&display=swap");

.exp-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: #0f0f0f;
}
.exp-root.exp-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.exp-root.exp-embedded::-webkit-scrollbar { display: none; }
.exp-root * { margin: 0; padding: 0; box-sizing: border-box; }
.exp-content { position: relative; width: 100%; }
.exp-root p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 14px;
}
.exp-root img { width: 100%; height: 100%; object-fit: cover; }
.exp-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2em;
}
.exp-hero,
.exp-outro {
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
}
.exp-about {
  color: #000;
  background-color: #e3e3db;
  display: flex;
  justify-content: center;
  align-items: center;
}
.exp-about p { width: 50%; text-align: center; }
.exp-footer {
  position: relative;
  width: 100%;
  height: 75svh;
  background-color: #0f0f0f;
  color: #fff;
  padding: 2em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}
.exp-copyright-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.exp-explosion-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200%;
  pointer-events: none;
}
.exp-particle-img {
  position: absolute;
  bottom: -200px;
  left: 50%;
  width: 150px;
  height: auto;
  object-fit: cover;
  transform: translateX(-50%);
  will-change: transform;
}
`;

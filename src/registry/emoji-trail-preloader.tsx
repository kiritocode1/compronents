"use client";

/**
 * Emoji Trail Preloader - a loading screen you can play with. A square rotates
 * a half turn twice, shrinks to nothing, and hands off to the page reveal: the
 * headline is split to characters that rise per row, and the centre image pops
 * from zero into a twenty second continuous spin. While the loader is still up,
 * moving the pointer four hundred pixels since the last drop spawns a badge at
 * the cursor that springs in with a back ease, holds, then falls out of frame
 * and removes itself. The queue is spaced by wall clock time, so a fast sweep
 * still staggers the drops instead of firing them together.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/emoji-trail-preloader";

export interface EmojiTrailPreloaderProps {
  siteInfo?: string;
  logo?: string;
  menuIcon?: string;
  heroImage?: string;
  headingRows?: string[];
  badges?: string[];
  cursor?: string;
  heroBackground?: string;
  preloaderBackground?: string;
  loaderColor?: string;
}

export default function EmojiTrailPreloader({
  siteInfo = "Welcome to The Quiet Crowd! This is your gateway to a world of refined branding, where elegance meets ingenuity. Step into a realm where your brand's uniqueness whispers louder than a shout, captivating the hearts of your audience. The Quiet Crowd doesn't just create brands, it curates timeless identities that resonate.",
  logo = `${ASSET_BASE}/logo.png`,
  menuIcon = `${ASSET_BASE}/menu-btn.png`,
  heroImage = `${ASSET_BASE}/hero-2.png`,
  headingRows = ["The", "Quiet Crowd"],
  badges = [
    `${ASSET_BASE}/emoji-1.png`,
    `${ASSET_BASE}/emoji-2.png`,
    `${ASSET_BASE}/emoji-3.png`,
    `${ASSET_BASE}/emoji-4.png`,
  ],
  cursor = `${ASSET_BASE}/cursor.svg`,
  heroBackground = "#faec6c",
  preloaderBackground = "#ded7ce",
  loaderColor = "#c5beb5",
}: EmojiTrailPreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const emojiLayer = root.querySelector<HTMLElement>(".etp-emojis");
    if (!emojiLayer) return;

    const mouseDistance = 400;
    const emojiWaitTime = 500;
    const emojiFallDelay = 200;
    const emojiRotations = [90, -90];
    const emojiSizes = [150, 200, 250, 300];

    let isLoading = true;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastEmojiTime = 0;

    const ctx = gsap.context(() => {
      gsap.to(".etp-preloader", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.5,
        delay: 5,
        ease: "power4.inOut",
      });

      gsap.to(".etp-loader", {
        rotation: "+=180",
        duration: 1.5,
        delay: 1,
        repeat: 1,
        ease: "power4.inOut",
        onComplete: () => {
          gsap.to(".etp-loader", {
            scale: 0,
            duration: 2,
            ease: "power4.inOut",
            onComplete: () => {
              isLoading = false;

              const timeline = gsap.timeline();
              for (const row of root.querySelectorAll(".etp-header-row")) {
                timeline.to(
                  row.querySelectorAll("span"),
                  {
                    y: 0,
                    duration: 1,
                    ease: "power4.out",
                    stagger: { amount: 0.25, from: "start" },
                  },
                  0,
                );
              }

              timeline
                .to(
                  ".etp-hero-img",
                  { scale: 1, duration: 1.5, ease: "power4.out" },
                  0,
                )
                .to(
                  ".etp-hero-img",
                  { rotation: 360, duration: 20, ease: "none", repeat: -1 },
                  0,
                );
            },
          });
        },
      });
    }, root);

    const createEmoji = (x: number, y: number) => {
      const emoji = document.createElement("div");
      const size = emojiSizes[Math.floor(Math.random() * emojiSizes.length)];
      const src = badges[Math.floor(Math.random() * badges.length)];

      emoji.className = "etp-emoji";
      emoji.style.width = `${size}px`;
      emoji.style.height = `${size}px`;
      emoji.style.backgroundImage = `url(${src})`;
      emoji.style.left = `${x - size / 2}px`;
      emoji.style.top = `${y - size / 2}px`;
      emojiLayer.appendChild(emoji);

      const initialRotation =
        emojiRotations[Math.floor(Math.random() * emojiRotations.length)];
      const currentTime = Date.now();
      const delayFromLast =
        Math.max(0, emojiFallDelay - (currentTime - lastEmojiTime)) / 1000;

      gsap.set(emoji, { scale: 0, rotation: initialRotation });

      gsap
        .timeline()
        .to(emoji, {
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: "back.out(1.75)",
        })
        .to(emoji, {
          y: root.clientHeight + size,
          rotation: initialRotation,
          duration: 0.5,
          ease: "power2.in",
          delay: emojiWaitTime / 1000 + delayFromLast,
          onComplete: () => emoji.remove(),
        });

      return currentTime;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isLoading) return;
      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const distance = Math.hypot(x - lastMouseX, y - lastMouseY);
      if (distance > mouseDistance) {
        lastEmojiTime = createEmoji(x, y);
        lastMouseX = x;
        lastMouseY = y;
      }
    };

    root.addEventListener("pointermove", onPointerMove);

    return () => {
      root.removeEventListener("pointermove", onPointerMove);
      ctx.revert();
      emojiLayer.replaceChildren();
    };
  }, [badges]);

  return (
    <div
      className="etp-root"
      ref={rootRef}
      style={{ cursor: `url(${cursor}) 32 32, auto` }}
    >
      <style>{styles}</style>

      <div
        className="etp-preloader"
        style={{ backgroundColor: preloaderBackground }}
      >
        <div className="etp-loader" style={{ backgroundColor: loaderColor }} />
      </div>

      <div className="etp-emojis" />

      <section className="etp-hero" style={{ backgroundColor: heroBackground }}>
        <div className="etp-nav">
          <div className="etp-site-info">
            <p>{siteInfo}</p>
          </div>
          <div className="etp-logo">
            <img alt="" draggable={false} src={logo} />
          </div>
          <div className="etp-menu-btn">
            <img alt="" draggable={false} src={menuIcon} />
          </div>
        </div>

        <div className="etp-hero-img">
          <img alt="" draggable={false} src={heroImage} />
        </div>

        <div className="etp-header">
          {headingRows.map((row) => (
            <div className="etp-header-row" key={row}>
              <h1>
                {row.split("").map((char, i) => (
                  <span key={`${row}-${String(i)}`}>
                    {char === " " ? "  " : char}
                  </span>
                ))}
              </h1>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Inter:opsz,wght@14..32,100..900&display=swap");

.etp-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  color: #000;
  font-family: "Inter", sans-serif;
}

.etp-root * {
  box-sizing: border-box;
}

.etp-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.etp-preloader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
  overflow: hidden;
  z-index: 1;
}

.etp-loader {
  position: relative;
  width: 40px;
  height: 40px;
  will-change: transform;
}

.etp-emojis {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 2;
}

.etp-emoji {
  position: absolute;
  background-color: #e3e3e3;
  border-radius: 100%;
  overflow: hidden;
  pointer-events: none;
  will-change: transform;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
}

.etp-hero {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 0;
}

.etp-nav {
  width: 100%;
  display: flex;
  align-items: flex-start;
}

.etp-nav > div {
  flex: 1;
  padding: 1.5em;
}

.etp-site-info p {
  margin: 0;
  max-width: 450px;
  font-size: 18px;
  font-weight: 400;
}

.etp-logo {
  display: flex;
  justify-content: center;
}

.etp-logo img {
  width: 200px;
  height: auto;
  object-fit: contain;
  transform: scale(0.5);
}

.etp-menu-btn {
  display: flex;
  justify-content: flex-end;
}

.etp-menu-btn img {
  width: 70px;
  height: auto;
  object-fit: contain;
}

.etp-hero-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 40%;
  aspect-ratio: 1;
  transform-origin: center;
  will-change: transform;
}

.etp-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75em;
  padding: 1em 2em;
}

.etp-header-row {
  position: relative;
  padding-top: 0.5em;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.etp-header h1 {
  margin: 0;
  font-family: "Archivo", sans-serif;
  font-stretch: expanded;
  font-size: 9.5cqw;
  font-weight: 200;
  line-height: 90%;
}

.etp-header h1 span {
  position: relative;
  display: inline-block;
  transform: translateY(200px);
}
`;

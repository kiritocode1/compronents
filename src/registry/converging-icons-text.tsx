"use client";

/**
 * Converging Icons Text - a pinned hero where a row of icons collects itself
 * into a sentence. As you scroll, the header fades, the floating icon row lifts
 * and scales down to caption size, then clones of each icon peel off and travel
 * into inline slots inside a headline, moving vertically then horizontally into
 * place, and the surrounding words fade in one by one in a shuffled order. GSAP
 * ScrollTrigger + Lenis. Desktop only.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/converging-icons-text";

export interface ConvergingIconsTextProps {
  icons?: [string, string, string, string, string];
  heroTitle?: string;
  heroSubtitle?: string;
  segments?: [string, string, string, string, string, string];
  outroText?: string;
  embedded?: boolean;
}

const DEFAULT_ICONS: [string, string, string, string, string] = [
  `${ASSET_BASE}/icon_1.png`,
  `${ASSET_BASE}/icon_2.png`,
  `${ASSET_BASE}/icon_3.png`,
  `${ASSET_BASE}/icon_4.png`,
  `${ASSET_BASE}/icon_5.png`,
];

const DEFAULT_SEGMENTS: [string, string, string, string, string, string] = [
  "Delve into coding",
  "without clutter.",
  "Unlock source code ",
  "for every tutorial",
  "published on the BLANK",
  "YouTube channel.",
];

export default function ConvergingIconsText({
  icons = DEFAULT_ICONS,
  heroTitle = "BLANK PRO",
  heroSubtitle = "One subscription, endless web design.",
  segments = DEFAULT_SEGMENTS,
  outroText = "Link in description",
  embedded = true,
}: ConvergingIconsTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".cvt-content");
    const heroSection = root.querySelector<HTMLElement>(".cvt-hero");
    const animatedIcons = root.querySelector<HTMLElement>(
      ".cvt-animated-icons",
    );
    const heroHeader = root.querySelector<HTMLElement>(".cvt-hero-header");
    const iconElements = Array.from(
      root.querySelectorAll<HTMLElement>(".cvt-animated-icon"),
    );
    const textSegments = Array.from(
      root.querySelectorAll<HTMLElement>(".cvt-text-segment"),
    );
    const placeholders = Array.from(
      root.querySelectorAll<HTMLElement>(".cvt-placeholder-icon"),
    );
    if (!content || !heroSection || !animatedIcons || !heroHeader) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const isMobile = root.clientWidth <= 1000;
    const headerIconSize = isMobile ? 30 : 60;
    const currentIconSize =
      iconElements[0]?.getBoundingClientRect().width || headerIconSize;
    const exactScale = headerIconSize / currentIconSize;

    // Shuffle reveal order of the words.
    const textAnimationOrder = textSegments.map((segment, originalIndex) => ({
      segment,
      originalIndex,
    }));
    for (let i = textAnimationOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [textAnimationOrder[i], textAnimationOrder[j]] = [
        textAnimationOrder[j],
        textAnimationOrder[i],
      ];
    }

    let duplicateIcons: HTMLElement[] | null = null;
    const clearDuplicates = () => {
      if (!duplicateIcons) return;
      for (const d of duplicateIcons) d.remove();
      duplicateIcons = null;
    };

    if (root.clientWidth <= 1000) {
      // Desktop-only effect; still register cleanup.
      return () => {
        gsap.ticker.remove(tickerFn);
        lenis.destroy();
      };
    }

    const trigger = ScrollTrigger.create({
      trigger: heroSection,
      scroller,
      start: "top top",
      end: `+=${(embedded ? root.clientHeight : window.innerHeight) * 8}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const vh = embedded ? root.clientHeight : window.innerHeight;
        const heroRect = heroSection.getBoundingClientRect();

        for (const segment of textSegments) gsap.set(segment, { opacity: 0 });

        if (progress <= 0.3) {
          const moveProgress = progress / 0.3;
          const containerMoveY = -vh * 0.3 * moveProgress;

          if (progress <= 0.15) {
            const headerProgress = progress / 0.15;
            gsap.set(heroHeader, {
              transform: `translate(-50%, calc(-50% + ${-50 * headerProgress}px))`,
              opacity: 1 - headerProgress,
            });
          } else {
            gsap.set(heroHeader, {
              transform: "translate(-50%, calc(-50% + -50px))",
              opacity: 0,
            });
          }

          clearDuplicates();
          gsap.set(animatedIcons, {
            x: 0,
            y: containerMoveY,
            scale: 1,
            opacity: 1,
          });

          iconElements.forEach((icon, index) => {
            const staggerDelay = index * 0.1;
            const iconProgress = gsap.utils.mapRange(
              staggerDelay,
              staggerDelay + 0.5,
              0,
              1,
              moveProgress,
            );
            const clamped = Math.max(0, Math.min(1, iconProgress));
            gsap.set(icon, { x: 0, y: -containerMoveY * (1 - clamped) });
          });
        } else if (progress <= 0.6) {
          const scaleProgress = (progress - 0.3) / 0.3;
          gsap.set(heroHeader, {
            transform: "translate(-50%, calc(-50% + -50px))",
            opacity: 0,
          });
          heroSection.style.backgroundColor =
            scaleProgress >= 0.5 ? "#e3e3db" : "#141414";

          clearDuplicates();

          const targetCenterX = heroRect.left + heroSection.clientWidth / 2;
          const targetCenterY = heroRect.top + heroSection.clientHeight / 2;
          const rect = animatedIcons.getBoundingClientRect();
          const currentCenterX = rect.left + rect.width / 2;
          const currentCenterY = rect.top + rect.height / 2;
          const deltaX = (targetCenterX - currentCenterX) * scaleProgress;
          const deltaY = (targetCenterY - currentCenterY) * scaleProgress;
          const baseY = -vh * 0.3;
          const currentScale = 1 + (exactScale - 1) * scaleProgress;

          gsap.set(animatedIcons, {
            x: deltaX,
            y: baseY + deltaY,
            scale: currentScale,
            opacity: 1,
          });
          for (const icon of iconElements) gsap.set(icon, { x: 0, y: 0 });
        } else if (progress <= 0.75) {
          const moveProgress = (progress - 0.6) / 0.15;
          gsap.set(heroHeader, {
            transform: "translate(-50%, calc(-50% + -50px))",
            opacity: 0,
          });
          heroSection.style.backgroundColor = "#e3e3db";

          const targetCenterX = heroRect.left + heroSection.clientWidth / 2;
          const targetCenterY = heroRect.top + heroSection.clientHeight / 2;
          const rect = animatedIcons.getBoundingClientRect();
          const currentCenterX = rect.left + rect.width / 2;
          const currentCenterY = rect.top + rect.height / 2;
          const baseY = -vh * 0.3;

          gsap.set(animatedIcons, {
            x: targetCenterX - currentCenterX,
            y: baseY + (targetCenterY - currentCenterY),
            scale: exactScale,
            opacity: 0,
          });
          for (const icon of iconElements) gsap.set(icon, { x: 0, y: 0 });

          if (!duplicateIcons) {
            duplicateIcons = iconElements.map((icon) => {
              const dup = icon.cloneNode(true) as HTMLElement;
              dup.className = "cvt-duplicate-icon";
              dup.style.position = "absolute";
              dup.style.width = `${headerIconSize}px`;
              dup.style.height = `${headerIconSize}px`;
              heroSection.appendChild(dup);
              return dup;
            });
          }

          duplicateIcons.forEach((dup, index) => {
            if (index >= placeholders.length) return;
            const iconRect = iconElements[index].getBoundingClientRect();
            const startX = iconRect.left + iconRect.width / 2 - heroRect.left;
            const startY = iconRect.top + iconRect.height / 2 - heroRect.top;
            const targetRect = placeholders[index].getBoundingClientRect();
            const tX = targetRect.left + targetRect.width / 2 - heroRect.left;
            const tY = targetRect.top + targetRect.height / 2 - heroRect.top;
            const moveX = tX - startX;
            const moveY = tY - startY;

            let currentX = 0;
            let currentY = 0;
            if (moveProgress <= 0.5) {
              currentY = moveY * (moveProgress / 0.5);
            } else {
              currentY = moveY;
              currentX = moveX * ((moveProgress - 0.5) / 0.5);
            }
            dup.style.left = `${startX + currentX - headerIconSize / 2}px`;
            dup.style.top = `${startY + currentY - headerIconSize / 2}px`;
            dup.style.opacity = "1";
            dup.style.display = "flex";
          });
        } else {
          gsap.set(heroHeader, {
            transform: "translate(-50%, calc(-50% + -100px))",
            opacity: 0,
          });
          heroSection.style.backgroundColor = "#e3e3db";
          gsap.set(animatedIcons, { opacity: 0 });

          if (duplicateIcons) {
            duplicateIcons.forEach((dup, index) => {
              if (index >= placeholders.length) return;
              const targetRect = placeholders[index].getBoundingClientRect();
              const tX = targetRect.left + targetRect.width / 2 - heroRect.left;
              const tY = targetRect.top + targetRect.height / 2 - heroRect.top;
              dup.style.left = `${tX - headerIconSize / 2}px`;
              dup.style.top = `${tY - headerIconSize / 2}px`;
              dup.style.opacity = "1";
              dup.style.display = "flex";
            });
          }

          textAnimationOrder.forEach((item, randomIndex) => {
            const segmentStart = 0.75 + randomIndex * 0.03;
            const segmentProgress = gsap.utils.mapRange(
              segmentStart,
              segmentStart + 0.015,
              0,
              1,
              progress,
            );
            gsap.set(item.segment, {
              opacity: Math.max(0, Math.min(1, segmentProgress)),
            });
          });
        }
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      clearDuplicates();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, icons, segments]);

  return (
    <div
      className={embedded ? "cvt-root cvt-embedded" : "cvt-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="cvt-content">
        <section className="cvt-hero">
          <div className="cvt-hero-header">
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
          </div>

          <div className="cvt-animated-icons">
            {icons.map((src, i) => (
              <div className={`cvt-animated-icon cvt-icon-${i + 1}`} key={src}>
                <img alt="" draggable={false} src={src} />
              </div>
            ))}
          </div>

          <h1 className="cvt-animated-text">
            <span className="cvt-placeholder-icon" />
            <span className="cvt-text-segment">{segments[0]}</span>
            <span className="cvt-placeholder-icon" />
            <span className="cvt-text-segment">{segments[1]}</span>
            <span className="cvt-text-segment">{segments[2]}</span>
            <span className="cvt-placeholder-icon" />
            <span className="cvt-text-segment">{segments[3]}</span>
            <span className="cvt-placeholder-icon" />
            <span className="cvt-text-segment">{segments[4]}</span>
            <span className="cvt-placeholder-icon" />
            <span className="cvt-text-segment">{segments[5]}</span>
          </h1>
        </section>

        <section className="cvt-outro">
          <h1>{outroText}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@300..800&display=swap");

.cvt-root {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #141414;
  font-family: "Host Grotesk", sans-serif;
}

.cvt-root.cvt-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.cvt-root.cvt-embedded::-webkit-scrollbar {
  display: none;
}

.cvt-content {
  position: relative;
  width: 100%;
}

.cvt-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cvt-hero,
.cvt-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #141414;
  color: #e3e3db;
  overflow: hidden;
}

.cvt-hero {
  flex-direction: column;
  transition: background-color 0.3s ease;
}

.cvt-outro h1 {
  margin: 0;
  font-size: 7vw;
  font-weight: 800;
  line-height: 1;
}

.cvt-hero-header {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  will-change: transform, opacity;
}

.cvt-hero-header h1 {
  margin: 0;
  font-size: 7vw;
  font-weight: 800;
  line-height: 1;
}

.cvt-hero-header p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 400;
}

.cvt-animated-icons {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  will-change: transform;
  z-index: 2;
}

.cvt-animated-icon {
  flex: 1;
  aspect-ratio: 1;
  will-change: transform;
}

.cvt-animated-text {
  position: relative;
  margin: 0;
  max-width: 1000px;
  text-align: center;
  color: #141414;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1;
}

.cvt-text-segment {
  opacity: 0;
}

.cvt-placeholder-icon {
  margin-top: -10px;
  width: 60px;
  height: 60px;
  display: inline-block;
  vertical-align: middle;
  will-change: transform;
  visibility: hidden;
}

@media (max-width: 1000px) {
  .cvt-hero-header {
    top: 45%;
    width: 100%;
  }
  .cvt-hero-header h1,
  .cvt-outro h1 {
    font-size: 12vw;
    text-align: center;
  }
  .cvt-hero-header p {
    font-size: 1.1rem;
  }
  .cvt-placeholder-icon {
    margin-top: -4px;
    width: 30px;
    height: 30px;
  }
}
`;

"use client";

/**
 * Card Fan Landing Reveal - a load sequence that deals a hand. Eight cards pop
 * out around a circle one at a time, then collapse back to nothing. As they go,
 * a second set is already stacked at the first card's exact slot, face down and
 * scaled to a tenth. Those five lift, the front one flips over, and they fan
 * out to evenly spaced positions measured from the real frame width, so the
 * spread always fits its container. The wordmark rises from behind its own
 * baseline and only scales up once the hand has settled.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/card-fan-landing-reveal";

export interface FanCard {
  code: string;
  number: string;
}

export interface CardFanLandingRevealProps {
  logoMark?: string;
  siteInfo?: string;
  menuLabel?: string;
  wordmark?: string;
  introImages?: string[];
  outroCards?: FanCard[];
  background?: string;
}

const DEFAULT_INTRO_IMAGES = Array.from(
  { length: 8 },
  (_, i) => `${ASSET_BASE}/card-${i + 1}.jpg`,
);

const DEFAULT_OUTRO_CARDS: FanCard[] = [
  { code: "OR", number: "13" },
  { code: "LV", number: "88" },
  { code: "ZN", number: "21" },
  { code: "TH", number: "47" },
  { code: "VX", number: "77" },
];

export default function CardFanLandingReveal({
  logoMark = "( N )",
  siteInfo = "Digital Folio 25",
  menuLabel = "Menu",
  wordmark = "BLANK",
  introImages = DEFAULT_INTRO_IMAGES,
  outroCards = DEFAULT_OUTRO_CARDS,
  background = "#6c9a8b",
}: CardFanLandingRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(CustomEase);
    CustomEase.create("abk-hop", "0.75, 0, 0.2, 1");

    const nav = root.querySelector<HTMLElement>(".abk-nav");
    const logo = root.querySelector<HTMLElement>(".abk-hero-footer .abk-logo");
    const logoInner = root.querySelector<HTMLElement>(
      ".abk-hero-footer .abk-logo span",
    );
    if (!nav || !logo || !logoInner) return;

    const introCards = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".abk-intro-cards .abk-card"),
    );
    const outroCardEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".abk-outro-cards .abk-card"),
    );
    if (!introCards.length || !outroCardEls.length) return;

    const introCardsCount = introCards.length;
    const frameWidth = () => root.clientWidth;
    const radius = frameWidth() < 1000 ? 150 : 225;

    introCards.forEach((card, i) => {
      const angle = (i / introCardsCount) * Math.PI * 2 - Math.PI / 2;

      gsap.set(card, {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        rotation: (angle * 180) / Math.PI + 90,
        transformPerspective: 800,
        transformOrigin: "center center",
        scale: 0,
      });
    });

    const firstIntroCardAngle = -Math.PI / 2;
    const firstIntroCardX = radius * Math.cos(firstIntroCardAngle);
    const firstIntroCardY = radius * Math.sin(firstIntroCardAngle);

    outroCardEls.forEach((card, index) => {
      gsap.set(card, {
        x: firstIntroCardX,
        y: firstIntroCardY,
        rotation: (firstIntroCardAngle * 180) / Math.PI + 90,
        rotationY: index === 0 ? 0 : 180,
        transformPerspective: 800,
        transformOrigin: "center center",
        zIndex: 5 - index,
        opacity: 0,
      });
    });

    const calculateCardPositions = () => {
      const viewportWidth = frameWidth();
      const cardRect = outroCardEls[0].getBoundingClientRect();
      const cardWidth = cardRect.width;
      const padding = viewportWidth < 1000 ? 16 : 32;
      const maxLeftPos = -(viewportWidth / 2) + padding + cardWidth / 2;
      const maxRightPos = viewportWidth / 2 - padding - cardWidth / 2;

      return [0, maxLeftPos, maxLeftPos / 2, maxRightPos / 2, maxRightPos];
    };

    const tl = gsap.timeline({ delay: 0.5 });

    tl.to(introCards, {
      scale: 1,
      duration: 1,
      stagger: 0.1,
      ease: "abk-hop",
      onComplete: () => {
        gsap.set(outroCardEls, { opacity: 1 });
        gsap.set(outroCardEls[0], { scale: 1, rotation: 0 });
        gsap.set(outroCardEls[1], { scale: 0.1, rotation: -90 });
        gsap.set(outroCardEls[2], { scale: 0.1, rotation: -45 });
        gsap.set(outroCardEls[3], { scale: 0.1, rotation: 90 });
        gsap.set(outroCardEls[4], { scale: 0.1, rotation: 45 });
      },
    });

    tl.to(introCards, {
      scale: 0,
      duration: 1,
      stagger: 0.1,
      ease: "abk-hop",
    })
      .to(
        outroCardEls,
        {
          y: frameWidth() < 1000 ? 0 : -125,
          duration: 1.5,
          ease: "abk-hop",
        },
        "-=0.25",
      )
      .to(
        outroCardEls[0],
        { rotationY: 180, duration: 1.5, ease: "abk-hop" },
        "<",
      )
      .to(
        outroCardEls,
        {
          x: (index: number) => calculateCardPositions()[index],
          scale: 1,
          rotation: 0,
          duration: 1.5,
          ease: "abk-hop",
        },
        "<",
      )
      .to(nav, { y: 0, duration: 1, ease: "abk-hop" }, "-=1");

    const heroFooterTl = gsap.timeline({ delay: 0.5 });

    heroFooterTl
      .to(logoInner, { y: "0%", duration: 1, ease: "abk-hop" })
      .to(logo, { scale: 1, duration: 1.25, ease: "abk-hop" }, "+=2.25");

    const updateCardPositions = () => {
      const positions = calculateCardPositions();
      outroCardEls.forEach((card, index) => {
        gsap.set(card, { x: positions[index] });
      });
    };
    window.addEventListener("resize", updateCardPositions);

    return () => {
      window.removeEventListener("resize", updateCardPositions);
      tl.kill();
      heroFooterTl.kill();
    };
  }, [introImages, outroCards]);

  return (
    <div
      className="abk-root"
      ref={rootRef}
      style={{ "--abk-bg": background } as React.CSSProperties}
    >
      <style>{styles}</style>
      <nav className="abk-nav">
        <div className="abk-logo-mark">
          <p>{logoMark}</p>
        </div>
        <div className="abk-site-info">
          <p>{siteInfo}</p>
        </div>
        <div className="abk-menu">
          <p>{menuLabel}</p>
        </div>
      </nav>

      <div className="abk-container">
        <div className="abk-intro-cards">
          {introImages.map((image) => (
            <div className="abk-card" key={image}>
              <img src={image} alt="" />
            </div>
          ))}
        </div>

        <div className="abk-outro-cards">
          {outroCards.map((card, index) => (
            <div className="abk-card" key={card.code}>
              {index === 0 ? (
                <div className="abk-card-back">
                  <img src={introImages[0]} alt="" />
                </div>
              ) : null}
              <div className="abk-card-front">
                <p>{card.code}</p>
                <p>{card.number}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="abk-hero-footer">
          <div className="abk-logo">
            <span>{wordmark}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

.abk-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Barlow Condensed", sans-serif;
  background-color: var(--abk-bg);
}
.abk-root * { margin: 0; padding: 0; box-sizing: border-box; }
.abk-root img { width: 100%; height: 100%; object-fit: cover; }
.abk-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  transform: translateY(-100%);
  will-change: transform;
  z-index: 2;
}
.abk-nav > div { flex: 1; }
.abk-nav .abk-site-info { text-align: center; }
.abk-nav .abk-menu { text-align: right; }
.abk-nav p {
  text-transform: uppercase;
  font-size: 1.25rem;
  font-weight: 700;
}
.abk-container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--abk-bg);
  overflow: hidden;
}
.abk-intro-cards,
.abk-outro-cards {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.abk-card {
  position: absolute;
  width: 100px;
  height: 138.09px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transform-style: preserve-3d;
  will-change: transform;
}
.abk-outro-cards .abk-card:nth-child(2),
.abk-outro-cards .abk-card:nth-child(3) {
  transform-origin: right bottom;
}
.abk-outro-cards .abk-card:nth-child(4),
.abk-outro-cards .abk-card:nth-child(5) {
  transform-origin: left bottom;
}
.abk-card-front,
.abk-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}
.abk-card-front {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: #fbf7f4;
  color: #0e0e0e;
  transform: rotateY(180deg);
}
.abk-card-front p { font-size: 1rem; font-weight: 700; }
.abk-hero-footer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
}
.abk-hero-footer .abk-logo {
  position: relative;
  width: 100%;
  overflow: hidden;
  transform: scale(0.1);
  transform-origin: bottom;
  will-change: transform;
  text-align: center;
}
.abk-hero-footer .abk-logo span {
  position: relative;
  display: block;
  transform: translateY(125%);
  text-transform: uppercase;
  font-size: 6rem;
  font-weight: 900;
  line-height: 0.85;
  color: #fbf7f4;
}

@media (max-width: 1000px) {
  .abk-nav { padding: 1rem; gap: 0; }
  .abk-card { width: 60px; height: 83.44px; }
  .abk-card-front { padding: 0.5rem; }
  .abk-card-front p { font-size: 1rem; }
  .abk-hero-footer { padding: 1rem; }
  .abk-hero-footer .abk-logo { transform: scale(0.5); }
}
`;

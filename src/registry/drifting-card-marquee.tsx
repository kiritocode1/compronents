"use client";

/**
 * Drifting Card Marquee - a pinned section that pans an oversized wordmark
 * sideways while cards drift across it on hand-authored paths. Each card gets
 * its own four point tracks for vertical position and rotation, and its
 * progress is a delayed, doubled slice of the section progress, so the cards
 * start in sequence and each finishes early rather than all sharing one clock.
 * The card is placed by walking those tracks: progress times three picks the
 * segment, the remainder interpolates within it, which is what makes a card
 * arc and tumble instead of travelling in a straight line.
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

const ASSET_BASE = "https://ui.aryank.space/assets/drifting-card-marquee";

export interface DriftingCard {
  title: string;
  description: string;
  image: string;
}

export interface DriftingCardMarqueeProps {
  brand?: string;
  navItems?: string[];
  heroImage?: string;
  heading?: string;
  cards?: DriftingCard[];
  outroCopy?: string;
  /** Per card: [four y-percent stops, four rotation stops]. */
  transforms?: [number[], number[]][];
  embedded?: boolean;
}

const DEFAULT_CARDS: DriftingCard[] = [
  {
    title: "Immersive Training Simulations",
    description:
      "Revolutionize hands-on learning with lifelike training environments, enhancing skill development and retention.",
    image: `${ASSET_BASE}/img1.jpg`,
  },
  {
    title: "Virtual Design Collaboration",
    description:
      "Enable remote teams to co-create in 3D spaces, speeding up design iterations and boosting innovation.",
    image: `${ASSET_BASE}/img2.jpg`,
  },
  {
    title: "Immersive Product Demos",
    description:
      "Showcase products in a fully interactive, 360-degree experience, making presentations more engaging and memorable.",
    image: `${ASSET_BASE}/img3.jpg`,
  },
  {
    title: "Remote Healthcare Solutions",
    description:
      "Empower healthcare professionals with virtual consultations and remote diagnostics in immersive 3D environments.",
    image: `${ASSET_BASE}/img4.jpg`,
  },
  {
    title: "Interactive Entertainment",
    description:
      "Deliver a new dimension of gaming and entertainment with fully immersive and interactive virtual experiences.",
    image: `${ASSET_BASE}/img1.jpg`,
  },
];

const DEFAULT_TRANSFORMS: [number[], number[]][] = [
  [
    [10, 50, -10, 10],
    [20, -10, -45, 20],
  ],
  [
    [0, 47.5, -10, 15],
    [-25, 15, -45, 30],
  ],
  [
    [0, 52.5, -10, 5],
    [15, -5, -40, 60],
  ],
  [
    [0, 50, 30, -80],
    [20, -10, 60, 5],
  ],
  [
    [0, 55, -15, 30],
    [25, -15, 60, 95],
  ],
];

export default function DriftingCardMarquee({
  brand = "Nebulon",
  navItems = ["Catalog", "Cart"],
  heroImage = `${ASSET_BASE}/hero.jpg`,
  heading = "Nebulon Does it again.",
  cards = DEFAULT_CARDS,
  outroCopy = "(Your next section goes here)",
  transforms = DEFAULT_TRANSFORMS,
  embedded = true,
}: DriftingCardMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".dcm-content");
    const stickySection = root.querySelector<HTMLElement>(".dcm-sticky");
    const stickyHeader = root.querySelector<HTMLElement>(".dcm-sticky-header");
    if (!content || !stickySection || !stickyHeader) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const cardEls = root.querySelectorAll<HTMLElement>(".dcm-card");
    const viewportWidth = () =>
      embedded ? root.clientWidth : window.innerWidth;
    const stickyHeight =
      (embedded ? root.clientHeight : window.innerHeight) * 5;

    const trigger = ScrollTrigger.create({
      trigger: stickySection,
      scroller,
      start: "top top",
      end: `+=${stickyHeight}px`,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;

        const maxTranslate = stickyHeader.offsetWidth - viewportWidth();
        gsap.set(stickyHeader, { x: -progress * maxTranslate });

        cardEls.forEach((card, index) => {
          const delay = index * 0.1125;
          const cardProgress = Math.max(0, Math.min((progress - delay) * 2, 1));

          if (cardProgress > 0) {
            const cardStartX = 25;
            const cardEndX = -650;
            const yPos = transforms[index][0];
            const rotations = transforms[index][1];

            const cardX = gsap.utils.interpolate(
              cardStartX,
              cardEndX,
              cardProgress,
            );

            const yProgress = cardProgress * 3;
            const yIndex = Math.min(Math.floor(yProgress), yPos.length - 2);
            const yInterpolation = yProgress - yIndex;
            const cardY = gsap.utils.interpolate(
              yPos[yIndex],
              yPos[yIndex + 1],
              yInterpolation,
            );

            const cardRotation = gsap.utils.interpolate(
              rotations[yIndex],
              rotations[yIndex + 1],
              yInterpolation,
            );

            gsap.set(card, {
              xPercent: cardX,
              yPercent: cardY,
              rotation: cardRotation,
              opacity: 1,
            });
          } else {
            gsap.set(card, { opacity: 0 });
          }
        });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      gsap.killTweensOf([stickyHeader, ...Array.from(cardEls)]);
    };
  }, [embedded, cards, transforms]);

  return (
    <div
      className={embedded ? "dcm-root dcm-embedded" : "dcm-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="dcm-content">
        <nav className="dcm-nav">
          <div className="dcm-logo">
            <a href="#brand">{brand}</a>
          </div>
          <div className="dcm-nav-items">
            {navItems.map((item) => (
              <a href="#nav" key={item}>
                {item}
              </a>
            ))}
          </div>
        </nav>

        <section
          className="dcm-hero"
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        <section className="dcm-sticky">
          <div className="dcm-sticky-header">
            <h1>{heading}</h1>
          </div>

          {cards.map((card) => (
            <div className="dcm-card" key={card.title}>
              <div className="dcm-card-img">
                <img alt="" draggable={false} src={card.image} />
              </div>
              <div className="dcm-card-content">
                <div className="dcm-card-title">
                  <h2>{card.title}</h2>
                </div>
                <div className="dcm-card-description">
                  <p>{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="dcm-outro">
          <p>{outroCopy}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&display=swap");

.dcm-root {
  position: relative;
  width: 100%;
  height: 100%;
  container-type: inline-size;
  color: #000;
  font-family: "Cormorant Garamond", serif;
}

.dcm-root * {
  box-sizing: border-box;
}

.dcm-root.dcm-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.dcm-root.dcm-embedded::-webkit-scrollbar {
  display: none;
}

.dcm-content {
  position: relative;
  width: 100%;
}

.dcm-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dcm-nav {
  position: absolute;
  top: 0;
  width: 100%;
  padding: 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 3;
}

.dcm-logo,
.dcm-nav-items {
  flex: 1;
}

.dcm-nav a {
  text-decoration: none;
  color: #000;
  font-size: 24px;
  letter-spacing: -0.02em;
}

.dcm-nav-items {
  display: flex;
  justify-content: center;
  gap: 2em;
}

.dcm-content section {
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.dcm-hero {
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
}

.dcm-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}

.dcm-outro p {
  margin: 0;
  color: #ded8c8;
  font-size: 30px;
  letter-spacing: -0.005em;
}

.dcm-sticky {
  position: relative;
  background-color: #ded8c8;
}

.dcm-sticky-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 250cqw;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: transform;
}

.dcm-sticky-header h1 {
  margin: 0;
  color: #000;
  font-size: 30cqw;
  font-weight: 300;
  letter-spacing: -0.05em;
  line-height: 100%;
}

.dcm-card {
  position: absolute;
  top: 10%;
  left: 100%;
  width: 325px;
  height: 500px;
  background-color: #000;
  border-radius: 1em;
  padding: 0.5em;
  will-change: transform;
  z-index: 2;
}

.dcm-card .dcm-card-img {
  width: 100%;
  height: 200px;
  border-radius: 0.5em;
  overflow: hidden;
}

.dcm-card-content {
  width: 100%;
  height: 275px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  padding: 0.5em;
}

.dcm-card-content h2 {
  margin: 0;
  font-size: 42px;
  font-weight: 300;
  letter-spacing: -0.005em;
}

.dcm-card-content p {
  margin: 0;
  font-size: 20px;
  font-weight: 300;
  letter-spacing: -0.005em;
}

@media (max-width: 900px) {
  .dcm-nav-items {
    justify-content: flex-end;
  }
}
`;

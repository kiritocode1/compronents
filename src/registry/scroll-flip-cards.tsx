"use client";

/**
 * Scroll Flip Cards - a process section choreographed entirely by scroll. Three
 * hero cards fan apart and drop away, then a pinned services panel draws the
 * heading up from below while the same cards fly in from underneath, scale up,
 * gather to center, and flip a half turn to reveal their service lists. Below
 * 1000px it falls back to a static stacked layout. GSAP ScrollTrigger + Lenis.
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

export interface FlipCardService {
  name: string;
  number: string;
  items: string[];
}

export interface ScrollFlipCardsProps {
  logo?: string;
  menuLabel?: string;
  aboutHeading?: string;
  servicesHeading?: string;
  outroHeading?: string;
  services?: [FlipCardService, FlipCardService, FlipCardService];
  embedded?: boolean;
}

const DEFAULT_SERVICES: [FlipCardService, FlipCardService, FlipCardService] = [
  {
    name: "Plan",
    number: "01",
    items: [
      "Discovery",
      "Audit",
      "User Flow",
      "Site Map",
      "Personas",
      "Strategy",
    ],
  },
  {
    name: "Design",
    number: "02",
    items: [
      "Wireframes",
      "UI Kits",
      "Prototypes",
      "Visual Style",
      "Interaction",
      "Design QA",
    ],
  },
  {
    name: "Develop",
    number: "03",
    items: [
      "HTML/CSS/JS",
      "CMS Build",
      "GSAP Motion",
      "Responsive",
      "Optimization",
      "Launch",
    ],
  },
];

const smoothStep = (p: number) => p * p * (3 - 2 * p);

function FlipCard({ service, id }: { service: FlipCardService; id: string }) {
  return (
    <div className="sfc-card" id={id}>
      <div className="sfc-card-wrapper">
        <div className="sfc-flip-card-inner">
          <div className="sfc-flip-card-front">
            <div className="sfc-card-title">
              <span>{service.name}</span>
              <span>{service.number}</span>
            </div>
            <div className="sfc-card-title">
              <span>{service.number}</span>
              <span>{service.name}</span>
            </div>
          </div>
          <div className="sfc-flip-card-back">
            <div className="sfc-card-title">
              <span>{service.name}</span>
              <span>{service.number}</span>
            </div>
            <div className="sfc-card-copy">
              {service.items.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
            <div className="sfc-card-title">
              <span>{service.number}</span>
              <span>{service.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScrollFlipCards({
  logo = "BLANK",
  menuLabel = "Menu",
  aboutHeading = "Keep scrolling, it gets good",
  servicesHeading = "Stuff we make so you do not have to",
  outroHeading = "The story is not over yet",
  services = DEFAULT_SERVICES,
  embedded = true,
}: ScrollFlipCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".sfc-content");
    const hero = root.querySelector<HTMLElement>(".sfc-hero");
    const servicesEl = root.querySelector<HTMLElement>(".sfc-services");
    if (!content || !hero || !servicesEl) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const triggers: ScrollTrigger[] = [];
    const q = (s: string) => root.querySelector<HTMLElement>(s);
    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;

    if (root.clientWidth > 1000) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          scroller,
          start: "top top",
          end: "75% top",
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(".sfc-hero-cards", {
              opacity: gsap.utils.interpolate(1, 0.5, smoothStep(progress)),
            });
            [
              "#sfc-hero-card-1",
              "#sfc-hero-card-2",
              "#sfc-hero-card-3",
            ].forEach((cardId, index) => {
              const delay = index * 0.9;
              const cardProgress = gsap.utils.clamp(
                0,
                1,
                (progress - delay * 0.1) / (1 - delay * 0.1),
              );
              const y = gsap.utils.interpolate(
                "0%",
                "350%",
                smoothStep(cardProgress),
              );
              const scale = gsap.utils.interpolate(
                1,
                0.75,
                smoothStep(cardProgress),
              );
              let x = "0%";
              let rotation = 0;
              if (index === 0) {
                x = gsap.utils.interpolate(
                  "0%",
                  "90%",
                  smoothStep(cardProgress),
                );
                rotation = gsap.utils.interpolate(
                  0,
                  -15,
                  smoothStep(cardProgress),
                );
              } else if (index === 2) {
                x = gsap.utils.interpolate(
                  "0%",
                  "-90%",
                  smoothStep(cardProgress),
                );
                rotation = gsap.utils.interpolate(
                  0,
                  15,
                  smoothStep(cardProgress),
                );
              }
              gsap.set(cardId, { y, x, rotation, scale });
            });
          },
        }),
        ScrollTrigger.create({
          trigger: servicesEl,
          scroller,
          start: "top top",
          end: `+=${viewportHeight * 4}px`,
          pin: servicesEl,
          pinSpacing: true,
        }),
        ScrollTrigger.create({
          trigger: servicesEl,
          scroller,
          start: "top bottom",
          end: `+=${viewportHeight * 4}`,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const headerProgress = gsap.utils.clamp(0, 1, progress / 0.9);
            gsap.set(".sfc-services-header", {
              y: gsap.utils.interpolate(
                "400%",
                "0%",
                smoothStep(headerProgress),
              ),
            });

            ["#sfc-card-1", "#sfc-card-2", "#sfc-card-3"].forEach(
              (cardId, index) => {
                const delay = index * 0.5;
                const cardProgress = gsap.utils.clamp(
                  0,
                  1,
                  (progress - delay * 0.1) / (0.9 - delay * 0.1),
                );
                const innerCard = q(`${cardId} .sfc-flip-card-inner`);

                let y: string;
                if (cardProgress < 0.4) {
                  y = gsap.utils.interpolate(
                    "-100%",
                    "50%",
                    smoothStep(cardProgress / 0.4),
                  );
                } else if (cardProgress < 0.6) {
                  y = gsap.utils.interpolate(
                    "50%",
                    "0%",
                    smoothStep((cardProgress - 0.4) / 0.2),
                  );
                } else {
                  y = "0%";
                }

                let scale: number;
                if (cardProgress < 0.4) {
                  scale = gsap.utils.interpolate(
                    0.25,
                    0.75,
                    smoothStep(cardProgress / 0.4),
                  );
                } else if (cardProgress < 0.6) {
                  scale = gsap.utils.interpolate(
                    0.75,
                    1,
                    smoothStep((cardProgress - 0.4) / 0.2),
                  );
                } else {
                  scale = 1;
                }

                const opacity =
                  cardProgress < 0.2 ? smoothStep(cardProgress / 0.2) : 1;

                let x: string;
                let rotate: number;
                let rotationY: number;
                if (cardProgress < 0.6) {
                  x = index === 0 ? "100%" : index === 1 ? "0%" : "-100%";
                  rotate = index === 0 ? -5 : index === 1 ? 0 : 5;
                  rotationY = 0;
                } else if (cardProgress < 1) {
                  const n = (cardProgress - 0.6) / 0.4;
                  x = gsap.utils.interpolate(
                    index === 0 ? "100%" : index === 1 ? "0%" : "-100%",
                    "0%",
                    smoothStep(n),
                  );
                  rotate = gsap.utils.interpolate(
                    index === 0 ? -5 : index === 1 ? 0 : 5,
                    0,
                    smoothStep(n),
                  );
                  rotationY = smoothStep(n) * 180;
                } else {
                  x = "0%";
                  rotate = 0;
                  rotationY = 180;
                }

                gsap.set(cardId, { opacity, y, x, rotate, scale });
                if (innerCard) gsap.set(innerCard, { rotationY });
              },
            );
          },
        }),
      );
    }

    ScrollTrigger.refresh();

    return () => {
      for (const t of triggers) t.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, services]);

  return (
    <div
      className={embedded ? "sfc-root sfc-embedded" : "sfc-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sfc-content">
        <nav className="sfc-nav">
          <div className="sfc-logo">
            <span>{logo}</span>
          </div>
          <div className="sfc-menu-btn">
            <span>{menuLabel}</span>
          </div>
        </nav>

        <section className="sfc-section sfc-hero">
          <div className="sfc-hero-cards">
            {services.map((service, i) => (
              <div
                className={`sfc-card sfc-hero-card-${i + 1}`}
                id={`sfc-hero-card-${i + 1}`}
                key={service.name}
              >
                <div className="sfc-card-title">
                  <span>{service.name}</span>
                  <span>{service.number}</span>
                </div>
                <div className="sfc-card-title">
                  <span>{service.number}</span>
                  <span>{service.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="sfc-section sfc-about">
          <h1>{aboutHeading}</h1>
        </section>

        <section className="sfc-section sfc-services">
          <div className="sfc-cards">
            <div className="sfc-cards-container">
              {services.map((service, i) => (
                <FlipCard
                  id={`sfc-card-${i + 1}`}
                  key={service.name}
                  service={service}
                />
              ))}
            </div>
          </div>

          <div className="sfc-services-header">
            <h1>{servicesHeading}</h1>
          </div>

          <div className="sfc-mobile-cards">
            <div className="sfc-cards-container">
              {services.map((service, i) => (
                <FlipCard
                  id={`sfc-mobile-card-${i + 1}`}
                  key={service.name}
                  service={service}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="sfc-section sfc-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:opsz,wght@9..40,100..1000&display=swap");

.sfc-root {
  --dark: #000;
  --light: #f9f4eb;
  --light2: #f0ece5;
  --accent-1: #e5d9f6;
  --accent-2: #ffd2f3;
  --accent-3: #fcdca6;
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--light);
  color: var(--dark);
  font-family: "DM Sans", sans-serif;
}

.sfc-root.sfc-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.sfc-root.sfc-embedded::-webkit-scrollbar {
  display: none;
}

.sfc-content {
  position: relative;
  width: 100%;
}

.sfc-root h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.sfc-root p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.sfc-root span {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.75rem;
  font-weight: 500;
}

.sfc-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 4;
}

.sfc-logo span,
.sfc-menu-btn span {
  font-size: 0.8rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
  display: inline-block;
}
.sfc-logo span {
  background-color: var(--dark);
  color: var(--light);
}
.sfc-menu-btn span {
  background-color: var(--light2);
  color: var(--dark);
}

.sfc-section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  overflow: hidden;
}

.sfc-hero {
  background-color: var(--light);
  color: var(--dark);
}

.sfc-about,
.sfc-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--dark);
  color: var(--light);
}

.sfc-hero-cards {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 35%;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.sfc-hero-cards .sfc-card {
  flex: 1;
  position: relative;
  aspect-ratio: 5/7;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  will-change: transform;
}

.sfc-card-title {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.sfc-hero-cards .sfc-card span {
  font-size: 0.7rem;
}

.sfc-hero-cards .sfc-hero-card-1 {
  background-color: var(--accent-1);
  transform-origin: top right;
  z-index: 2;
}
.sfc-hero-cards .sfc-hero-card-2 {
  background-color: var(--accent-2);
  z-index: 1;
}
.sfc-hero-cards .sfc-hero-card-3 {
  background-color: var(--accent-3);
  transform-origin: top left;
  z-index: 0;
}

.sfc-services {
  padding: 8rem 2rem;
}

.sfc-services-header {
  position: relative;
  width: 100%;
  text-align: center;
  transform: translateY(400%);
  will-change: transform;
  z-index: 1;
}

.sfc-cards {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  z-index: 0;
  background-color: var(--light);
}

.sfc-cards-container {
  position: relative;
  width: 75%;
  height: 100%;
  margin-top: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
}

.sfc-cards-container .sfc-card {
  flex: 1;
  position: relative;
  aspect-ratio: 5/7;
  perspective: 1000px;
}

.sfc-cards-container .sfc-card .sfc-card-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  animation: sfc-floating 2s infinite ease-in-out;
}

@keyframes sfc-floating {
  0% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(-50%, -55%);
  }
  100% {
    transform: translate(-50%, -50%);
  }
}

#sfc-card-1 .sfc-card-wrapper {
  animation-delay: 0s;
}
#sfc-card-2 .sfc-card-wrapper {
  animation-delay: 0.25s;
}
#sfc-card-3 .sfc-card-wrapper {
  animation-delay: 0.5s;
}

.sfc-flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.sfc-flip-card-front,
.sfc-flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  backface-visibility: hidden;
  overflow: hidden;
}

.sfc-flip-card-front {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

#sfc-card-1 .sfc-flip-card-front,
#sfc-mobile-card-1 .sfc-flip-card-front {
  background-color: var(--accent-1);
}
#sfc-card-2 .sfc-flip-card-front,
#sfc-mobile-card-2 .sfc-flip-card-front {
  background-color: var(--accent-2);
}
#sfc-card-3 .sfc-flip-card-front,
#sfc-mobile-card-3 .sfc-flip-card-front {
  background-color: var(--accent-3);
}

.sfc-flip-card-back {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  background-color: #fff;
  transform: rotateY(180deg);
}

#sfc-card-1 .sfc-flip-card-back,
#sfc-mobile-card-1 .sfc-flip-card-back {
  background-color: var(--accent-1);
}
#sfc-card-2 .sfc-flip-card-back,
#sfc-mobile-card-2 .sfc-flip-card-back {
  background-color: var(--accent-2);
}
#sfc-card-3 .sfc-flip-card-back,
#sfc-mobile-card-3 .sfc-flip-card-back {
  background-color: var(--accent-3);
}

.sfc-card-copy {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sfc-card-copy p {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  background-color: var(--light2);
  border-radius: 0.25rem;
}

.sfc-cards #sfc-card-1 {
  transform: translateX(100%) translateY(-100%) rotate(-5deg) scale(0.25);
  z-index: 2;
}
.sfc-cards #sfc-card-2 {
  transform: translateX(0%) translateY(-100%) rotate(0deg) scale(0.25);
  z-index: 1;
}
.sfc-cards #sfc-card-3 {
  transform: translateX(-100%) translateY(-100%) rotate(5deg) scale(0.25);
  z-index: 0;
}

.sfc-cards .sfc-cards-container .sfc-card {
  opacity: 0;
}

.sfc-mobile-cards {
  display: none;
}

@media (max-width: 1000px) {
  .sfc-hero-cards {
    width: calc(100% - 4rem);
  }

  .sfc-services {
    min-height: 100svh;
    height: auto;
  }

  .sfc-cards {
    display: none;
  }

  .sfc-services-header {
    transform: translateY(0%);
  }

  .sfc-mobile-cards {
    display: block;
  }

  .sfc-mobile-cards .sfc-cards-container {
    width: calc(100% - 4rem);
    display: block;
    height: auto;
    margin: 4rem auto;
  }

  .sfc-mobile-cards .sfc-cards-container .sfc-card {
    margin-bottom: 2rem;
    opacity: 1;
  }

  .sfc-mobile-cards .sfc-card-wrapper {
    animation: none;
    position: relative;
    top: auto;
    left: auto;
    transform: none;
  }

  .sfc-mobile-cards .sfc-card .sfc-flip-card-front {
    transform: rotateY(180deg);
  }

  .sfc-mobile-cards .sfc-flip-card-back {
    transform: rotateY(0deg);
  }
}
`;

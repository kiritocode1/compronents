"use client";

/**
 * Calendar Pad Cards - contribution-graph style cards where the coloured
 * squares are the navigation. Each card lays out five rows of pads, the first
 * and last rows are decorative, and as many of the middle pads as there are
 * entries are picked at random, coloured, and made clickable. Opening one does
 * not slide a panel in: the pad itself is scaled twenty times until it fills
 * the card, which is why the detail view arrives in the accent colour of the
 * square you pressed. The content then springs in on an elastic ease with each
 * block entering from a random tilt, and closing runs the whole thing backwards
 * before clearing the props.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/calendar-pad-cards";

export interface CalendarPadEntry {
  img: string;
  h1: string;
  copy: string;
  linkLabel: string;
  linkSrc: string;
}

export interface CalendarPadMonth {
  month: string;
  entries: CalendarPadEntry[];
}

export interface CalendarPadCardsProps {
  months?: CalendarPadMonth[];
  brand?: string;
  navItems?: string[];
  activeColors?: string[];
  backLabel?: string;
}

const DEFAULT_MONTHS: CalendarPadMonth[] = [
  {
    month: "May",
    entries: [
      {
        img: `${ASSET_BASE}/img1.jpg`,
        h1: "Modern Art Evolution",
        copy: "Explore the dynamic evolution of modern art through a series of captivating paintings and installations that challenge traditional boundaries and inspire new perspectives.",
        linkLabel: "Explore More",
        linkSrc: "https://ui.aryank.space/components",
      },
      {
        img: `${ASSET_BASE}/img2.jpg`,
        h1: "Sculpture Innovations",
        copy: "Discover groundbreaking approaches to sculpture and installation art. This project highlights innovative techniques and materials used by contemporary artists to create stunning three-dimensional works.",
        linkLabel: "Discover Now",
        linkSrc: "https://ui.aryank.space/pages",
      },
      {
        img: `${ASSET_BASE}/img3.jpg`,
        h1: "Digital Illustration Magic",
        copy: "Dive into the world of digital illustrations with this project, showcasing the intricate and imaginative works of artists who blend technology and creativity to produce stunning visual art.",
        linkLabel: "See Details",
        linkSrc: "https://ui.aryank.space/backend",
      },
      {
        img: `${ASSET_BASE}/img4.jpg`,
        h1: "Fusion Art Forms",
        copy: "Experience the seamless fusion of traditional and digital art forms in this project. Artists explore the intersections of different mediums to create unique and thought-provoking pieces.",
        linkLabel: "Check it Out",
        linkSrc: "https://ui.aryank.space/inspiration",
      },
    ],
  },
  {
    month: "June",
    entries: [
      {
        img: `${ASSET_BASE}/img5.jpg`,
        h1: "Abstract Painting Odyssey",
        copy: "Join us on a captivating journey through the world of abstract painting. This project features bold and expressive works that push the boundaries of color, form, and texture.",
        linkLabel: "Learn More",
        linkSrc: "https://ui.aryank.space/components",
      },
    ],
  },
  {
    month: "July",
    entries: [
      {
        img: `${ASSET_BASE}/img6.jpg`,
        h1: "Graphic Design Trends",
        copy: "Stay ahead of the curve with this exploration of modern graphic design trends. From minimalist aesthetics to bold typography, discover the latest movements shaping the design world.",
        linkLabel: "Read More",
        linkSrc: "https://ui.aryank.space/pages",
      },
      {
        img: `${ASSET_BASE}/img7.jpg`,
        h1: "Contemporary Photography",
        copy: "Take a closer look at contemporary photography techniques. This project showcases the innovative work of photographers who capture the world through a modern lens.",
        linkLabel: "View Gallery",
        linkSrc: "https://ui.aryank.space/backend",
      },
      {
        img: `${ASSET_BASE}/img8.jpg`,
        h1: "Mixed Media Masterpieces",
        copy: "Discover the beauty of mixed media art in this project, where artists combine various materials and techniques to create visually rich and layered pieces that tell compelling stories.",
        linkLabel: "Check it Out",
        linkSrc: "https://ui.aryank.space/inspiration",
      },
    ],
  },
  {
    month: "August",
    entries: [
      {
        img: `${ASSET_BASE}/img1.jpg`,
        h1: "Conceptual Art Series",
        copy: "Engage with a series of thought-provoking conceptual art pieces that challenge perceptions and invite viewers to contemplate deeper meanings and ideas behind each work.",
        linkLabel: "Explore More",
        linkSrc: "https://ui.aryank.space/components",
      },
      {
        img: `${ASSET_BASE}/img2.jpg`,
        h1: "Street Art Chronicles",
        copy: "Delve into the vibrant world of street art with this project, showcasing the creativity and impact of urban artists who transform public spaces into canvases for expression.",
        linkLabel: "Discover Now",
        linkSrc: "https://ui.aryank.space/pages",
      },
    ],
  },
];

const DEFAULT_COLORS = ["#5fa5f9", "#e879f9", "#a78bfa", "#2cd4bf"];

export default function CalendarPadCards({
  months = DEFAULT_MONTHS,
  brand = "BLANK",
  navItems = ["Blog", "Contact"],
  activeColors = DEFAULT_COLORS,
  backLabel = "Back",
}: CalendarPadCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const container = root.querySelector<HTMLElement>(".cpc-container");
    if (!container) return;

    const shuffleArray = <T,>(array: T[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    const cleanups: (() => void)[] = [];

    const setActivePads = (
      clickablePads: HTMLElement[],
      card: HTMLElement,
      activePadCount: number,
      items: CalendarPadEntry[],
    ) => {
      clickablePads.slice(0, activePadCount).forEach((pad, i) => {
        pad.classList.add("cpc-active");
        pad.style.backgroundColor =
          activeColors[Math.floor(Math.random() * activeColors.length)];

        const onClick = () => {
          for (const p of clickablePads) p.style.zIndex = "0";
          pad.style.zIndex = "1";

          const item = items[i];
          const cardContent =
            card.querySelector<HTMLElement>(".cpc-card-content");
          if (!cardContent) return;

          cardContent.innerHTML = `
    <button type="button" class="cpc-back">${backLabel}</button>
    <div class="cpc-card-item cpc-img">
      <img src="${item.img}" alt="" draggable="false" />
    </div>
    <div class="cpc-card-item cpc-copy">
      <h1>${item.h1}</h1>
      <p>${item.copy}</p>
    </div>
    <div class="cpc-card-item cpc-copy cpc-link">
      <a href="${item.linkSrc}">${item.linkLabel}</a>
      <span aria-hidden="true">&rarr;</span>
    </div>
  `;

          gsap.to(pad, {
            scale: 20,
            duration: 0.3,
            onComplete: () => {
              gsap.to(cardContent, {
                opacity: 1,
                pointerEvents: "all",
                duration: 0.075,
              });
              gsap.fromTo(
                cardContent.querySelectorAll(".cpc-card-item"),
                {
                  y: 100,
                  rotation: () => gsap.utils.random(-30, 30),
                  opacity: 0,
                },
                {
                  y: 0,
                  rotation: 0,
                  opacity: 1,
                  duration: 2,
                  ease: "elastic.out",
                  stagger: 0.1,
                },
              );
            },
          });

          const backBtn = cardContent.querySelector<HTMLElement>(".cpc-back");
          backBtn?.addEventListener("click", () => {
            gsap.to(cardContent, {
              opacity: 0,
              pointerEvents: "none",
              duration: 0.2,
              onComplete: () => {
                gsap.to(pad, {
                  scale: 1,
                  duration: 0.3,
                  onComplete: () => {
                    pad.style.zIndex = "0";
                    cardContent.style.opacity = "0";
                    cardContent.style.pointerEvents = "none";
                    gsap.set(cardContent.querySelectorAll(".cpc-card-item"), {
                      clearProps: "all",
                    });
                  },
                });
              },
            });
          });
        };

        pad.addEventListener("click", onClick);
        cleanups.push(() => pad.removeEventListener("click", onClick));
      });
    };

    const generatePads = (
      card: HTMLElement,
      activePadCount: number,
      items: CalendarPadEntry[],
    ) => {
      const rowsConfig = [7, 7, 7, 7, Math.floor(Math.random() * 3) + 2];
      const clickablePads: HTMLElement[] = [];

      rowsConfig.forEach((padCount, rowIndex) => {
        const row = document.createElement("div");
        row.classList.add("cpc-row");
        for (let i = 0; i < padCount; i++) {
          const pad = document.createElement("div");
          pad.classList.add("cpc-pad");
          row.appendChild(pad);
          if (rowIndex !== 0 && rowIndex !== rowsConfig.length - 1) {
            clickablePads.push(pad);
          }
        }
        card.appendChild(row);
      });

      shuffleArray(clickablePads);
      setActivePads(clickablePads, card, activePadCount, items);
    };

    const cards: HTMLElement[] = [];
    for (const monthData of months) {
      const card = document.createElement("div");
      card.classList.add("cpc-card");

      const cardTitle = document.createElement("div");
      cardTitle.classList.add("cpc-card-title");
      cardTitle.innerHTML = `<p>${monthData.month}</p>`;
      card.appendChild(cardTitle);

      const cardContent = document.createElement("div");
      cardContent.classList.add("cpc-card-content");
      card.appendChild(cardContent);

      generatePads(card, monthData.entries.length, monthData.entries);
      container.appendChild(card);
      cards.push(card);
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
      for (const card of cards) {
        gsap.killTweensOf(card.querySelectorAll("*"));
        card.remove();
      }
    };
  }, [months, activeColors, backLabel]);

  return (
    <div className="cpc-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="cpc-scroller">
        <div className="cpc-container">
          <nav className="cpc-nav">
            <div className="cpc-logo">
              <a href="#brand">{brand}</a>
            </div>
            <div className="cpc-nav-items">
              {navItems.map((item) => (
                <a href="#nav" key={item}>
                  {item}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@100..900&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap");

.cpc-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Rubik", sans-serif;
  background-color: #1a1a1a;
  color: #fff;
}

.cpc-root * {
  box-sizing: border-box;
}

.cpc-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.cpc-scroller::-webkit-scrollbar {
  display: none;
}

.cpc-container {
  width: 100%;
  padding-bottom: 4em;
}

.cpc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cpc-nav {
  width: 30%;
  margin: 2em auto 0 auto;
  padding: 2em 0.25em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cpc-nav-items {
  display: flex;
  gap: 2em;
}

.cpc-nav a {
  text-decoration: none;
  color: #fff;
}

.cpc-card {
  position: relative;
  width: 460px;
  height: 400px;
  margin: 2em auto;
  padding: 2em;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  background-color: #272727;
  overflow: hidden;
}

.cpc-card-title {
  color: #fff;
  padding-bottom: 1em;
}

.cpc-card-title p {
  margin: 0;
}

.cpc-row {
  width: 100%;
  display: flex;
  gap: 0.5em;
}

.cpc-pad {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 0.5rem;
  background-color: #333333;
  z-index: 0;
  pointer-events: none;
}

.cpc-pad.cpc-active {
  pointer-events: all;
  cursor: pointer;
}

.cpc-card .cpc-row:nth-child(3) .cpc-pad:nth-child(1),
.cpc-card .cpc-row:nth-child(3) .cpc-pad:nth-child(2),
.cpc-card .cpc-row:nth-child(3) .cpc-pad:nth-child(3) {
  opacity: 0.35;
}

.cpc-card-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2em;
  color: #fff;
  overflow-y: auto;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
}

.cpc-card-content button {
  border: none;
  outline: none;
  border-radius: 4em;
  font-family: "Rubik", sans-serif;
  padding: 0.5em 1em;
  background-color: #fff;
  color: #000;
  cursor: pointer;
}

.cpc-img {
  width: 100%;
  height: 200px;
  margin: 1em 0;
  border-radius: 1em;
  overflow: hidden;
}

.cpc-copy {
  margin: 0.5em 0;
  padding: 1.5em;
  border-radius: 1em;
  background: #fff;
  color: #000;
}

.cpc-copy h1 {
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 0.35em 0;
}

.cpc-copy p {
  margin: 0;
  font-size: 14px;
  line-height: 150%;
  color: gray;
}

.cpc-copy.cpc-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1em 0;
}

.cpc-copy.cpc-link a {
  color: #000;
  text-decoration: none;
}

.cpc-card-item {
  position: relative;
}

@media (max-width: 900px) {
  .cpc-nav {
    width: 100%;
    padding: 2em;
  }
  .cpc-card {
    width: 360px;
    height: 320px;
    gap: 0.25em;
  }

  .cpc-row {
    gap: 0.25em;
  }

  .cpc-pad {
    width: 40px;
    height: 40px;
  }
}
`;

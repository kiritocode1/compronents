"use client";

/**
 * Infinite Contact Scroll - a looping contact sheet where each row's gap
 * breathes open and closed as it crosses the center line, while a pinned
 * icon in the middle of the screen swaps to the next glyph every time a
 * new row locks to center.
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

const ASSET_BASE = "https://ui.aryank.space/assets/infinite-contact-scroll";

export interface ContactRow {
  label: string;
  value: string;
}

export interface InfiniteContactScrollProps {
  rows?: ContactRow[];
  icons?: string[];
  /** How many copies of the row block are stacked for the infinite loop. */
  copies?: number;
  embedded?: boolean;
}

const DEFAULT_ROWS: ContactRow[] = [
  { label: "Address", value: "19 Great Street" },
  { label: "Current Time", value: "20:40:30 (GMT)" },
  { label: "General Inquiries", value: "hello@aryank.space" },
  { label: "New Business Inquiries", value: "new@aryank.space" },
  { label: "Collaborations", value: "Selective Connections" },
  { label: "Job Inquiries", value: "studio@aryank.space" },
  { label: "Telephone", value: "+91 98 4022 2235" },
  { label: "Social Media", value: "@blank" },
];

const DEFAULT_ICONS = Array.from(
  { length: 7 },
  (_, i) => `${ASSET_BASE}/icon_${i + 1}.png`,
);

export default function InfiniteContactScroll({
  rows = DEFAULT_ROWS,
  icons = DEFAULT_ICONS,
  copies = 11,
  embedded = true,
}: InfiniteContactScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".ics-content");
    if (!content) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content, infinite: true })
      : new Lenis({ infinite: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = () =>
      embedded
        ? (root?.clientHeight ?? window.innerHeight)
        : window.innerHeight;
    const rowMaxGap = window.innerWidth < 1000 ? 5 : 10;

    const contactRows = Array.from(
      root.querySelectorAll<HTMLElement>(".ics-row"),
    );
    const triggers: ScrollTrigger[] = [];

    for (const row of contactRows) {
      triggers.push(
        ScrollTrigger.create({
          trigger: row,
          scroller: embedded ? root : undefined,
          start: () => `top+=${viewportHeight() / 2 - 550} center`,
          end: () => `top+=${viewportHeight() / 2 - 450} center`,
          scrub: true,
          onUpdate: (self) => {
            const gap = 1 + (rowMaxGap - 1) * self.progress;
            row.style.gap = `${gap}rem`;
          },
        }),
      );

      triggers.push(
        ScrollTrigger.create({
          trigger: row,
          scroller: embedded ? root : undefined,
          start: () => `top+=${viewportHeight() / 2 - 400} center`,
          end: () => `top+=${viewportHeight() / 2 - 300} center`,
          scrub: true,
          onUpdate: (self) => {
            const gap = rowMaxGap - (rowMaxGap - 1) * self.progress;
            row.style.gap = `${gap}rem`;
          },
        }),
      );
    }

    const iconImg = root.querySelector<HTMLImageElement>(".ics-icon img");
    let currentIconIndex = 0;
    let lastCenteredRow: HTMLElement | null = null;

    const onScroll = () => {
      if (!root || !iconImg) return;
      const rootTop = embedded ? root.getBoundingClientRect().top : 0;
      const viewportCenter = rootTop + viewportHeight() / 2;

      let closestRow: HTMLElement | null = null;
      let minDistance = Number.POSITIVE_INFINITY;

      for (const row of contactRows) {
        const rect = row.getBoundingClientRect();
        const rowCenter = rect.top + rect.height / 2;
        const distance = Math.abs(rowCenter - viewportCenter);

        if (distance < minDistance && distance < 25) {
          minDistance = distance;
          closestRow = row;
        }
      }

      if (closestRow && closestRow !== lastCenteredRow) {
        lastCenteredRow = closestRow;
        currentIconIndex = (currentIconIndex + 1) % icons.length;
        iconImg.src = icons[currentIconIndex];
      }
    };
    lenis.on("scroll", onScroll);

    return () => {
      for (const trigger of triggers) trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, icons, copies]);

  return (
    <div className="ics-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="ics-visual">
        <div className="ics-visual-inner">
          <div className="ics-icon">
            <img alt="" draggable={false} src={icons[0]} />
          </div>
        </div>
      </div>
      <div className="ics-content">
        {Array.from({ length: copies }, (_, copyIndex) => (
          <section
            className="ics-info"
            // ponytail: identical looped copies, index key is fine
            key={`copy-${copyIndex}`}
          >
            {rows.map((row) => (
              <div className="ics-row" key={row.label}>
                <p>{row.label}</p>
                <p>{row.value}</p>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Stylish&display=swap");

.ics-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  container-type: size;
  background-color: #0f0f0f;
  color: #fff;
  font-family: "Stylish", sans-serif;
}

.ics-root::-webkit-scrollbar {
  display: none;
}

.ics-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ics-root p {
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.025rem;
}

.ics-visual {
  position: sticky;
  top: 0;
  height: 0;
  z-index: 2;
  overflow: visible;
}

.ics-visual-inner {
  width: 100%;
  height: 100cqh;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.ics-icon {
  position: relative;
  width: 8rem;
  height: 8rem;
  transform: translateY(-8.9rem);
}

.ics-info {
  position: relative;
  width: 100%;
  height: 100cqh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  overflow: hidden;
}

.ics-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  will-change: gap;
}

.ics-row p {
  flex: 1;
}

.ics-row p:nth-child(1) {
  text-align: right;
}

.ics-row p:nth-child(2) {
  color: #4f4f4f;
}

@media (max-width: 1000px) {
  .ics-root p {
    font-size: 1rem;
  }

  .ics-icon {
    width: 4rem;
    height: 4rem;
    transform: translateY(-0.5rem);
  }
}
`;

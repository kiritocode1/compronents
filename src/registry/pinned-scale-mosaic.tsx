"use client";

/**
 * Pinned Scale Mosaic - a sparse photo grid where every row grows in and then
 * collapses away. Each row runs two triggers: one scales its images up from
 * nothing as the row rises into view, a second pins the row at the top and
 * scales them back to zero as it leaves, with pinSpacing off so the next row
 * slides up over it. Images scale about their outer corner rather than their
 * center, alternating left and right, so a row opens outward from the edges of
 * the grid.
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

const ASSET_BASE = "https://ui.aryank.space/assets/pinned-scale-mosaic";

export type MosaicCell = { image: string; origin: "left" | "right" } | null;

export interface PinnedScaleMosaicProps {
  introHeading?: string;
  introLabel?: string;
  outroLabel?: string;
  rows?: MosaicCell[][];
  embedded?: boolean;
}

const img = (n: number) => `${ASSET_BASE}/img${n}.jpeg`;

// Four columns per row. null is an empty cell, which is what makes the grid
// read as scattered rather than tiled.
const DEFAULT_ROWS: MosaicCell[][] = [
  [
    { image: img(1), origin: "right" },
    null,
    { image: img(2), origin: "left" },
    null,
  ],
  [null, { image: img(3), origin: "left" }, null, null],
  [
    { image: img(4), origin: "right" },
    null,
    null,
    { image: img(5), origin: "left" },
  ],
  [
    null,
    { image: img(6), origin: "left" },
    { image: img(7), origin: "right" },
    null,
  ],
  [
    { image: img(8), origin: "left" },
    null,
    null,
    { image: img(9), origin: "left" },
  ],
  [null, null, { image: img(10), origin: "left" }, null],
  [
    null,
    { image: img(11), origin: "left" },
    null,
    { image: img(12), origin: "left" },
  ],
  [
    { image: img(13), origin: "right" },
    null,
    { image: img(14), origin: "left" },
    null,
  ],
  [null, { image: img(15), origin: "left" }, null, null],
  [
    { image: img(16), origin: "right" },
    null,
    null,
    { image: img(17), origin: "left" },
  ],
];

export default function PinnedScaleMosaic({
  introHeading = "Design that Captivates",
  introLabel = "( Explore Below )",
  outroLabel = "( Return to the Beginning )",
  rows = DEFAULT_ROWS,
  embedded = true,
}: PinnedScaleMosaicProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".fdl-content");
    if (!content) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    gsap.set(root.querySelectorAll(".fdl-img"), { scale: 0, force3D: true });

    const triggers: ScrollTrigger[] = [];
    const rowEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".fdl-row"),
    );

    rowEls.forEach((row, index) => {
      const rowImages = gsap.utils.toArray<HTMLElement>(
        row.querySelectorAll(".fdl-img"),
      );
      if (!rowImages.length) return;

      const scaleOutId = `fdl-scaleOut-${index}`;

      triggers.push(
        ScrollTrigger.create({
          id: `fdl-scaleIn-${index}`,
          trigger: row,
          scroller,
          start: "top bottom",
          end: "bottom bottom-=10%",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!self.isActive) return;
            const progress = self.progress;
            const easedProgress = Math.min(1, progress * 1.2);
            const scaleValue = gsap.utils.interpolate(0, 1, easedProgress);

            for (const image of rowImages) {
              gsap.set(image, { scale: scaleValue, force3D: true });
            }

            if (progress > 0.95) {
              gsap.set(rowImages, { scale: 1, force3D: true });
            }
          },
          onLeave: () => {
            gsap.set(rowImages, { scale: 1, force3D: true });
          },
        }),
      );

      triggers.push(
        ScrollTrigger.create({
          id: scaleOutId,
          trigger: row,
          scroller,
          start: "top top",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
          scrub: 1,
          invalidateOnRefresh: true,
          onEnter: () => {
            gsap.set(rowImages, { scale: 1, force3D: true });
          },
          onUpdate: (self) => {
            if (self.isActive) {
              const scale = gsap.utils.interpolate(1, 0, self.progress);

              for (const image of rowImages) {
                gsap.set(image, {
                  scale,
                  force3D: true,
                  clearProps: self.progress === 1 ? "scale" : "",
                });
              }
            } else if (self.scroll() < self.start) {
              gsap.set(rowImages, { scale: 1, force3D: true });
            }
          },
        }),
      );

      const restoreIfNotLeaving = () => {
        const scaleOut = ScrollTrigger.getById(scaleOutId);
        if (scaleOut && scaleOut.progress === 0) {
          gsap.set(rowImages, { scale: 1, force3D: true });
        }
      };

      triggers.push(
        ScrollTrigger.create({
          id: `fdl-marker-${index}`,
          trigger: row,
          scroller,
          start: "bottom bottom",
          end: "top top",
          onEnter: restoreIfNotLeaving,
          onLeave: restoreIfNotLeaving,
          onEnterBack: restoreIfNotLeaving,
        }),
      );
    });

    const onResize = () => ScrollTrigger.refresh(true);
    window.addEventListener("resize", onResize);

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      for (const trigger of triggers) trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, rows]);

  return (
    <div
      className={embedded ? "fdl-root fdl-embedded" : "fdl-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="fdl-content">
        <section className="fdl-intro">
          <h1>{introHeading}</h1>
          <p>{introLabel}</p>
        </section>

        <section className="fdl-work">
          {rows.map((row, rowIndex) => (
            <div
              className="fdl-row"
              key={`row-${row.find(Boolean)?.image ?? rowIndex}`}
            >
              {row.map((cell, cellIndex) => (
                <div
                  className="fdl-col"
                  key={cell?.image ?? `empty-${rowIndex}-${cellIndex}`}
                >
                  {cell ? (
                    <div className="fdl-img" data-origin={cell.origin}>
                      <img src={cell.image} alt="" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className="fdl-outro">
          <p>{outroLabel}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=DM+Mono:wght@400;500&display=swap");

.fdl-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: #1a1d20;
  container-type: inline-size;
}
.fdl-root.fdl-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.fdl-root.fdl-embedded::-webkit-scrollbar { display: none; }
.fdl-root * { margin: 0; padding: 0; box-sizing: border-box; }
.fdl-content { position: relative; width: 100%; }
.fdl-root img { width: 100%; height: 100%; object-fit: cover; }
.fdl-root h1 {
  text-transform: uppercase;
  text-align: center;
  font-size: 10cqw;
  font-weight: 400;
}
.fdl-root p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 13px;
}
.fdl-intro,
.fdl-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  background-color: #101214;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4em;
  overflow: hidden;
}
.fdl-work {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #1a1d20;
}
.fdl-row { width: 100%; display: flex; }
.fdl-col { flex: 1; aspect-ratio: 1; }
.fdl-img {
  position: relative;
  width: 100%;
  height: 100%;
  will-change: transform;
}
.fdl-img[data-origin="left"] { transform-origin: 0% 0%; }
.fdl-img[data-origin="right"] { transform-origin: 100% 0%; }
`;

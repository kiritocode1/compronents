"use client";

/**
 * Wedge Clip Work Scroll - a work index where each project opens and closes
 * like an aperture. The image starts as an angled wedge, widens to a full
 * rectangle as the panel arrives, then folds shut from the bottom as it leaves.
 * The project title is masked per character and each character gets its own
 * short scroll window, so the name types itself upward slightly ahead of the
 * image finishing its opening.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/wedge-clip-work-scroll";

export interface WedgeWorkItem {
  name: string;
  image: string;
}

export interface WedgeClipWorkScrollProps {
  heroHeading?: string;
  outroHeading?: string;
  items?: WedgeWorkItem[];
  embedded?: boolean;
}

const DEFAULT_ITEMS: WedgeWorkItem[] = [
  { name: "Carbon Edge", image: `${ASSET_BASE}/work_01.jpg` },
  { name: "Velocity Grid", image: `${ASSET_BASE}/work_02.jpg` },
  { name: "Aeroform", image: `${ASSET_BASE}/work_03.jpg` },
  { name: "Mach Horizon", image: `${ASSET_BASE}/work_04.jpg` },
  { name: "Titan Rail", image: `${ASSET_BASE}/work_05.jpg` },
];

const WEDGE_CLOSED = "polygon(25% 25%, 75% 40%, 100% 100%, 0% 100%)";
const WEDGE_OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const WEDGE_EXIT = "polygon(0% 0%, 100% 0%, 75% 60%, 25% 75%)";

export default function WedgeClipWorkScroll({
  heroHeading = "Beyond the limits",
  outroHeading = "Back to base",
  items = DEFAULT_ITEMS,
  embedded = true,
}: WedgeClipWorkScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".cly-content");
    if (!content) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const triggers: ScrollTrigger[] = [];
    const splits: SplitText[] = [];

    for (const item of gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".cly-work-item"),
    )) {
      const img = item.querySelector<HTMLElement>(".cly-work-item-img");
      const nameH1 = item.querySelector<HTMLElement>(".cly-work-item-name h1");
      if (!img || !nameH1) continue;

      const split = SplitText.create(nameH1, { type: "chars", mask: "chars" });
      splits.push(split);

      gsap.set(split.chars, { y: "125%" });

      split.chars.forEach((char, index) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: item,
            scroller,
            start: `top+=${index * 25 - 250} top`,
            end: `top+=${index * 25 - 100} top`,
            scrub: 1,
            invalidateOnRefresh: true,
            animation: gsap.fromTo(
              char,
              { y: "125%" },
              { y: "0%", ease: "none" },
            ),
          }),
        );
      });

      triggers.push(
        ScrollTrigger.create({
          trigger: item,
          scroller,
          start: "top bottom",
          end: "top top",
          scrub: 0.5,
          invalidateOnRefresh: true,
          animation: gsap.fromTo(
            img,
            { clipPath: WEDGE_CLOSED },
            { clipPath: WEDGE_OPEN, ease: "none" },
          ),
        }),
      );

      triggers.push(
        ScrollTrigger.create({
          trigger: item,
          scroller,
          start: "bottom bottom",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true,
          animation: gsap.fromTo(
            img,
            { clipPath: WEDGE_OPEN },
            { clipPath: WEDGE_EXIT, ease: "none" },
          ),
        }),
      );
    }

    ScrollTrigger.refresh();

    return () => {
      for (const trigger of triggers) trigger.kill();
      for (const split of splits) split.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, items]);

  return (
    <div
      className={embedded ? "cly-root cly-embedded" : "cly-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="cly-content">
        <section className="cly-hero">
          <h1>{heroHeading}</h1>
        </section>

        {items.map((item) => (
          <section className="cly-work-item" key={item.name}>
            <div className="cly-work-item-img">
              <img src={item.image} alt="" />
            </div>
            <div className="cly-work-item-name">
              <h1>{item.name}</h1>
            </div>
          </section>
        ))}

        <section className="cly-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap");

.cly-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter Tight", sans-serif;
  background-color: #fcfcfc;
  color: #141414;
  container-type: inline-size;
}
.cly-root.cly-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.cly-root.cly-embedded::-webkit-scrollbar { display: none; }
.cly-root * { margin: 0; padding: 0; box-sizing: border-box; }
.cly-content { position: relative; width: 100%; }
.cly-root img { width: 100%; height: 100%; object-fit: cover; }
.cly-root h1 {
  text-transform: uppercase;
  text-align: center;
  font-size: 5rem;
  font-weight: 550;
  line-height: 1;
}
.cly-root section {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.cly-hero,
.cly-outro {
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.cly-work-item { height: 150svh; }
.cly-work-item-img {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(25% 25%, 75% 40%, 100% 100%, 0% 100%);
  will-change: clip-path;
}
.cly-work-item-name {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  z-index: 1;
}
.cly-work-item-name h1 { color: #fff; }

@media (max-width: 1000px) {
  .cly-root h1,
  .cly-work-item-name h1 { font-size: 2.5rem; }
}
`;

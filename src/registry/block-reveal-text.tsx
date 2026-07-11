"use client";

/**
 * Block Reveal Text - an editorial scroll page where every copy block is split
 * into lines and each line is uncovered by a colored bar that wipes across it
 * left to right, then retracts to the right, timed off a scroll trigger so the
 * text reveals line by line as it enters view. Full-bleed image sections sit
 * between the copy.
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

const ASSET_BASE = "https://ui.aryank.space/assets/block-reveal-text";
const ACCENT = "#fe0100";

export interface RevealSection {
  type: "image" | "heading" | "body";
  image?: string;
  text?: string;
  /** Reveal bar color for copy sections. Defaults to the accent for headings. */
  blockColor?: string;
  /** Tint the copy with the accent color (headings only in the default set). */
  accent?: boolean;
}

export interface BlockRevealTextProps {
  sections?: RevealSection[];
  navLeft?: string;
  navRight?: string;
  stagger?: number;
  duration?: number;
  embedded?: boolean;
}

const DEFAULT_SECTIONS: RevealSection[] = [
  {
    type: "heading",
    image: `${ASSET_BASE}/img_1.jpg`,
    text: "Framed in tungsten and shadows, every shot holds its own deliberate tension.",
    blockColor: ACCENT,
    accent: true,
  },
  {
    type: "body",
    text: "This is cinematography in its raw form with practical lamps, soft falloff, and the presence of grain that fills each corner of the frame. Every room functions as a set and every posture becomes a composition. Light moves across furniture and faces, shaping scenes with a natural sense of depth.",
  },
  { type: "image", image: `${ASSET_BASE}/img_2.jpg` },
  {
    type: "heading",
    text: "Still frames with bold contrast and lighting choices that embrace imperfection.",
    blockColor: ACCENT,
    accent: true,
  },
  { type: "image", image: `${ASSET_BASE}/img_3.jpg` },
  {
    type: "body",
    text: "The camera settles into long takes and patient movement. Colors stay unrefined and shadows turn into texture. The image waits for action instead of chasing it. Every frame forms a clear visual language built through restraint.",
  },
  {
    type: "heading",
    image: `${ASSET_BASE}/img_4.jpg`,
    text: "Cinematography thrives in the details from the grain to the falloff to the glow.",
    blockColor: ACCENT,
    accent: true,
  },
];

export default function BlockRevealText({
  sections = DEFAULT_SECTIONS,
  navLeft = "Static House",
  navRight = "Menu",
  stagger = 0.15,
  duration = 0.75,
  embedded = true,
}: BlockRevealTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(SplitText, ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".brt-content");
    if (!content) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const copyEls = Array.from(root.querySelectorAll<HTMLElement>(".brt-copy"));
    const splits: SplitText[] = [];
    const triggers: ScrollTrigger[] = [];

    for (const el of copyEls) {
      const blockColor = el.dataset.block || "#000";
      const split = SplitText.create(el, {
        type: "lines",
        linesClass: "brt-line",
        lineThreshold: 0.1,
      });
      splits.push(split);

      const lines: HTMLElement[] = [];
      const blocks: HTMLElement[] = [];

      for (const line of split.lines as HTMLElement[]) {
        const wrapper = document.createElement("div");
        wrapper.className = "brt-line-wrapper";
        line.parentNode?.insertBefore(wrapper, line);
        wrapper.appendChild(line);

        const block = document.createElement("div");
        block.className = "brt-revealer";
        block.style.backgroundColor = blockColor;
        wrapper.appendChild(block);

        lines.push(line);
        blocks.push(block);
      }

      gsap.set(lines, { opacity: 0 });
      gsap.set(blocks, { scaleX: 0, transformOrigin: "left center" });

      blocks.forEach((block, index) => {
        const tl = gsap.timeline({ delay: index * stagger, paused: true });
        tl.to(block, { scaleX: 1, duration, ease: "power4.inOut" });
        tl.set(lines[index], { opacity: 1 });
        tl.set(block, { transformOrigin: "right center" });
        tl.to(block, { scaleX: 0, duration, ease: "power4.inOut" });

        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            scroller: embedded ? root : undefined,
            start: "top 90%",
            once: true,
            onEnter: () => tl.play(),
          }),
        );
      });
    }

    return () => {
      for (const t of triggers) t.kill();
      for (const s of splits) s.revert();
      for (const wrapper of root.querySelectorAll(".brt-line-wrapper")) {
        const line = wrapper.firstChild;
        if (wrapper.parentNode && line) {
          wrapper.parentNode.insertBefore(line, wrapper);
          wrapper.remove();
        }
      }
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, stagger, duration, sections]);

  return (
    <div className={`brt-root${embedded ? " brt-embedded" : ""}`} ref={rootRef}>
      <style>{styles}</style>

      <nav className="brt-nav">
        <p>{navLeft}</p>
        <p>{navRight}</p>
      </nav>

      <div className="brt-content">
        {sections.map((section, index) => {
          if (section.type === "image") {
            return (
              <section
                className="brt-section brt-banner"
                // ponytail: static section list, index key is fine
                key={`section-${index}`}
              >
                <div className="brt-bg">
                  <img alt="" draggable={false} src={section.image} />
                </div>
              </section>
            );
          }

          const isHeading = section.type === "heading";
          return (
            <section
              className={`brt-section${section.accent ? " brt-accent" : ""}`}
              key={`section-${index}`}
            >
              {section.image ? (
                <div className="brt-bg">
                  <img alt="" draggable={false} src={section.image} />
                </div>
              ) : null}
              {isHeading ? (
                <h1
                  className="brt-copy"
                  data-block={section.blockColor ?? ACCENT}
                >
                  {section.text}
                </h1>
              ) : (
                <p
                  className="brt-copy"
                  data-block={section.blockColor ?? "#000"}
                >
                  {section.text}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Cossette+Titre:wght@400;700&display=swap");

.brt-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #e3e4d8;
  color: #000;
  font-family: "Cossette Titre", sans-serif;
}

.brt-embedded {
  transform: translateZ(0);
}

.brt-root::-webkit-scrollbar {
  display: none;
}

.brt-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brt-root h1,
.brt-root p {
  text-transform: uppercase;
  font-weight: 500;
  line-height: 1;
}

.brt-root h1 {
  font-size: 6rem;
  letter-spacing: -0.1rem;
}

.brt-root p {
  font-size: 3rem;
  letter-spacing: -0.025rem;
}

.brt-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  mix-blend-mode: difference;
  z-index: 2;
}

.brt-nav p {
  font-size: 1.5rem;
  color: #e3e4d8;
}

.brt-section {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.brt-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.brt-section h1 {
  width: 75%;
  position: relative;
  z-index: 1;
}

.brt-section p {
  width: 60%;
  position: relative;
  z-index: 1;
}

.brt-accent h1 {
  color: #fe0100;
}

.brt-section h1 .brt-line-wrapper,
.brt-section p .brt-line-wrapper {
  margin: 0 auto;
}

.brt-line-wrapper {
  position: relative;
  width: max-content;
  display: block;
}

.brt-line {
  position: relative;
  display: block;
}

.brt-revealer {
  position: absolute;
  top: 0;
  left: 0;
  width: 101%;
  height: 101%;
  pointer-events: none;
  will-change: transform;
  z-index: 1;
}

@media (max-width: 1000px) {
  .brt-root h1 {
    font-size: 3rem;
  }

  .brt-root p {
    font-size: 1.5rem;
  }

  .brt-section {
    padding: 2rem;
  }

  .brt-section h1,
  .brt-section p {
    width: 100%;
  }
}
`;

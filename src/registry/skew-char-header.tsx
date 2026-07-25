"use client";

/**
 * Skew Char Header - headlines that assemble character by character, skewed
 * and thrown in from the right. The stagger is keyed to each character's index
 * within its own line rather than its index in the whole heading, so every line
 * starts its ripple at the same moment and multi-line copy reads as several
 * parallel waves instead of one long queue. Three modes are supported on the
 * same component: play on mount, play once on entry, and scrub against scroll.
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

export interface SkewCharSection {
  heading: string;
  mode: "load" | "enter" | "scrub";
  background: string;
  color: string;
}

export interface SkewCharHeaderProps {
  sections?: SkewCharSection[];
  stagger?: number;
  duration?: number;
  embedded?: boolean;
}

const DEFAULT_SECTIONS: SkewCharSection[] = [
  {
    heading: "Every letter finds its place",
    mode: "load",
    background: "#23002b",
    color: "#e894ff",
  },
  {
    heading: "Lines resolve together, not one after another",
    mode: "enter",
    background: "#002529",
    color: "#94ffe4",
  },
  {
    heading: "Scrub it and the whole thing rewinds",
    mode: "scrub",
    background: "#291900",
    color: "#ffab46",
  },
];

export default function SkewCharHeader({
  sections = DEFAULT_SECTIONS,
  stagger = 0.05,
  duration = 0.65,
  embedded = true,
}: SkewCharHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(SplitText, ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".sch-content");
    if (!content) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const splits: SplitText[] = [];
    const timelines: gsap.core.Timeline[] = [];
    const triggers: ScrollTrigger[] = [];

    const headings = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".sch-animated-header"),
    );

    headings.forEach((el, index) => {
      const mode = sections[index]?.mode ?? "load";

      const split = SplitText.create(el, {
        type: "lines,words,chars",
        linesClass: "sch-line",
        wordsClass: "sch-word",
        charsClass: "sch-char",
        autoSplit: true,
      });
      splits.push(split);

      const { chars, lines } = split;

      gsap.set(chars, { x: 100, opacity: 0, skewX: 20 });

      // Index within the line, not within the heading, so every line starts
      // its ripple at the same moment.
      const charMeta = lines.flatMap((line) => {
        const lineChars = chars.filter((c) => line.contains(c));
        return lineChars.map((char, charIndexInLine) => ({
          char,
          charIndexInLine,
        }));
      });

      const animate = (tl: gsap.core.Timeline) => {
        for (const { char, charIndexInLine } of charMeta) {
          tl.to(
            char,
            { x: 0, opacity: 1, skewX: 0, ease: "power3.out", duration },
            charIndexInLine * stagger,
          );
        }
        return tl;
      };

      if (mode === "enter") {
        const tl = gsap.timeline({ paused: true });
        animate(tl);
        timelines.push(tl);

        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            scroller,
            start: "top 100%",
            onEnter: () => tl.restart(),
            onLeaveBack: () => tl.pause(0),
          }),
        );
        return;
      }

      if (mode === "scrub") {
        const tl = gsap.timeline({ paused: true });
        animate(tl);
        timelines.push(tl);

        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            scroller,
            start: "top 90%",
            end: "top 45%",
            scrub: true,
            animation: tl,
          }),
        );
        return;
      }

      const tl = gsap.timeline();
      animate(tl);
      timelines.push(tl);
    });

    ScrollTrigger.refresh();

    return () => {
      for (const trigger of triggers) trigger.kill();
      for (const tl of timelines) tl.kill();
      for (const split of splits) split.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, sections, stagger, duration]);

  return (
    <div
      className={embedded ? "sch-root sch-embedded" : "sch-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sch-content">
        {sections.map((section) => (
          <section
            className="sch-section"
            key={section.heading}
            style={{
              backgroundColor: section.background,
              color: section.color,
            }}
          >
            <h1 className="sch-animated-header">{section.heading}</h1>
          </section>
        ))}
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

.sch-root {
  position: relative;
  width: 100%;
  height: 100%;
  container-type: inline-size;
}
.sch-root.sch-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.sch-root.sch-embedded::-webkit-scrollbar { display: none; }
.sch-root * { margin: 0; padding: 0; box-sizing: border-box; }
.sch-content { position: relative; width: 100%; }
.sch-root h1 {
  text-transform: uppercase;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 900;
  font-size: clamp(3rem, 10cqw, 15rem);
  letter-spacing: -2%;
  line-height: 0.75;
}
.sch-section {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
}
.sch-section h1 { width: 65%; }
.sch-line { display: block; }
.sch-word { display: inline-block; }
.sch-char {
  display: inline-block;
  will-change: transform, opacity;
}
`;

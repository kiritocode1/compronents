"use client";

/**
 * Interlock Title Scroll - full-bleed titles that assemble themselves as they
 * enter. Every other character starts pushed above the line and the rest below,
 * so the word reads as two combs sliding into each other, while the whole block
 * drifts in from the side. Each band staggers from a different end, and the
 * middle one runs the opposite direction to the two around it.
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

export interface InterlockTitleScrollProps {
  introHeading?: string;
  titles?: string[];
  outroHeading?: string;
  background?: string;
  foreground?: string;
  accent?: string;
  embedded?: boolean;
}

export default function InterlockTitleScroll({
  introHeading = "Scroll begins",
  titles = ["Subtle Phase", "Hidden Flow", "Calm Glide"],
  outroHeading = "End of motion",
  background = "#f4f3ef",
  foreground = "#141414",
  accent = "#e3f794",
  embedded = true,
}: InterlockTitleScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".tlt-content");
    if (!content) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const titleHeadings = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".tlt-title h1"),
    );
    const splits: SplitText[] = [];

    for (const heading of titleHeadings) {
      const split = SplitText.create(heading, {
        type: "chars",
        charsClass: "tlt-char",
      });
      splits.push(split);

      split.chars.forEach((char, i) => {
        const charInitialY = i % 2 === 0 ? -150 : 150;
        gsap.set(char, { y: charInitialY });
      });
    }

    const titleBands = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".tlt-title"),
    );

    const triggers = titleBands.map((title, index) => {
      const titleContainer = title.querySelector<HTMLElement>(
        ".tlt-title-container",
      );
      const titleContainerInitialX = index === 1 ? -100 : 100;
      const split = splits[index];
      const charCount = split.chars.length;

      return ScrollTrigger.create({
        trigger: title,
        scroller,
        start: "top bottom",
        end: "top -25%",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const titleContainerX =
            titleContainerInitialX - self.progress * titleContainerInitialX;
          gsap.set(titleContainer, { x: `${titleContainerX}%` });

          split.chars.forEach((char, i) => {
            const charStaggerIndex = index === 1 ? charCount - 1 - i : i;

            const charStartDelay = 0.1;
            const charTimelineSpan = 1 - charStartDelay;
            const staggerFactor = Math.min(0.75, charTimelineSpan * 0.75);
            const delay =
              charStartDelay + (charStaggerIndex / charCount) * staggerFactor;
            const duration =
              charTimelineSpan - (staggerFactor * (charCount - 1)) / charCount;
            const start = delay;

            let charProgress = 0;
            if (self.progress >= start) {
              charProgress = Math.min(1, (self.progress - start) / duration);
            }

            const charInitialY = i % 2 === 0 ? -150 : 150;
            const charY = charInitialY - charProgress * charInitialY;
            gsap.set(char, { y: charY });
          });
        },
      });
    });

    ScrollTrigger.refresh();

    return () => {
      for (const trigger of triggers) trigger.kill();
      for (const split of splits) split.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, titles]);

  return (
    <div
      className={embedded ? "tlt-root tlt-embedded" : "tlt-root"}
      ref={rootRef}
      style={
        {
          "--tlt-bg": background,
          "--tlt-fg": foreground,
          "--tlt-accent": accent,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="tlt-content">
        <section className="tlt-intro">
          <h1>{introHeading}</h1>
        </section>

        <section className="tlt-animated-titles">
          {titles.map((title) => (
            <div className="tlt-title" key={title}>
              <div className="tlt-title-container">
                <h1>{title}</h1>
              </div>
            </div>
          ))}
        </section>

        <section className="tlt-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.tlt-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Manrope", sans-serif;
  background-color: var(--tlt-bg);
  color: var(--tlt-fg);
  container-type: inline-size;
}
.tlt-root.tlt-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.tlt-root.tlt-embedded::-webkit-scrollbar { display: none; }
.tlt-root * { margin: 0; padding: 0; box-sizing: border-box; }
.tlt-content { position: relative; width: 100%; }
.tlt-root h1 {
  font-size: 10rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.25rem;
}
.tlt-root section {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.tlt-intro,
.tlt-outro {
  height: 100svh;
  text-align: center;
  align-content: center;
}
.tlt-title {
  height: 85svh;
  display: flex;
  align-items: center;
}
.tlt-title-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: transform;
}
.tlt-title:nth-child(1),
.tlt-title:nth-child(3) { background-color: var(--tlt-accent); }
.tlt-title:nth-child(2) { background-color: var(--tlt-bg); }
.tlt-char {
  position: relative;
  display: inline-block;
  will-change: transform;
}

@container (max-width: 1000px) {
  .tlt-root h1 {
    font-size: 3rem;
    letter-spacing: 0;
  }
}
`;

// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * AnimeText - scroll-driven word-reveal animation.
 *
 * Props:
 *  - paragraphs   : string[]  - array of paragraph strings to animate
 *  - keywords     : string[]  - words that get coloured pill highlights
 *  - keywordColors: object    - { keyword: "#hexcolor" }
 *  - highlightBg  : string    - rgb triplet for the reveal flash  (default "60, 60, 60")
 *  - pinDuration  : number    - scroll-pin length in vh multiples  (default 4)
 */
export default function AnimeText({
  paragraphs = [],
  keywords = [],
  keywordColors = {},
  highlightBg = "237, 235, 231",
  pinDuration = 4,
}) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  // lazy-load gsap and create scroll-pinned word reveal
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");

      const gsap = gsapMod.default ?? gsapMod.gsap;
      const { ScrollTrigger } = stMod;

      gsap.registerPlugin(ScrollTrigger);

      const container = containerRef.current;
      if (!container || cancelled) return;

      const words = Array.from(container.querySelectorAll(".at-word"));
      const totalWords = words.length;

      triggerRef.current = ScrollTrigger.create({
        trigger: container,
        pin: container,
        start: "top top",
        end: `+=${window.innerHeight * pinDuration}`,
        pinSpacing: true,
        onUpdate: (self) => {
          const progress = self.progress;

          words.forEach((word, index) => {
            const wordText = word.querySelector("span");

            // forward reveal - words fade in with highlight flash
            if (progress <= 0.7) {
              const revealProgress = Math.min(1, progress / 0.7);
              const overlapWords = 15;
              const wordStart = index / totalWords;
              const wordEnd = wordStart + overlapWords / totalWords;
              const timelineScale =
                1 /
                Math.min(
                  1 + overlapWords / totalWords,
                  1 + (totalWords - 1) / totalWords + overlapWords / totalWords,
                );
              const adjStart = wordStart * timelineScale;
              const adjEnd = wordEnd * timelineScale;
              const duration = adjEnd - adjStart;
              const wordProgress =
                revealProgress <= adjStart
                  ? 0
                  : revealProgress >= adjEnd
                    ? 1
                    : (revealProgress - adjStart) / duration;

              word.style.opacity = wordProgress;

              const bgFade =
                wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
              word.style.backgroundColor = `rgba(${highlightBg}, ${Math.max(0, 1 - bgFade)})`;

              const textReveal =
                wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
              wordText.style.opacity = Math.pow(textReveal, 0.5);
            } else {
              // reverse fade - highlight returns as text hides
              const reverseProgress = (progress - 0.7) / 0.3;
              word.style.opacity = 1;

              const reverseOverlap = 5;
              const rStart = index / totalWords;
              const rEnd = rStart + reverseOverlap / totalWords;
              const rScale =
                1 /
                Math.max(
                  1,
                  (totalWords - 1) / totalWords + reverseOverlap / totalWords,
                );
              const rAdjStart = rStart * rScale;
              const rAdjEnd = rEnd * rScale;
              const rDur = rAdjEnd - rAdjStart;
              const rProgress =
                reverseProgress <= rAdjStart
                  ? 0
                  : reverseProgress >= rAdjEnd
                    ? 1
                    : (reverseProgress - rAdjStart) / rDur;

              if (rProgress > 0) {
                wordText.style.opacity = 1 - rProgress;
                word.style.backgroundColor = `rgba(${highlightBg}, ${rProgress})`;
              } else {
                wordText.style.opacity = 1;
                word.style.backgroundColor = `rgba(${highlightBg}, 0)`;
              }
            }
          });
        },
      });
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [paragraphs, keywords, highlightBg, pinDuration]);

  // kill scrolltrigger after pinned content unmounts
  useLayoutEffect(() => {
    return () => {
      triggerRef.current?.kill();
      triggerRef.current = null;
    };
  }, []);

  const normalise = (w) => w.toLowerCase().replace(/[.,!?;:"]/g, "");

  return (
    <section className="at-container" ref={containerRef}>
      <div className="at-inner">
        <div className="at-text">
          <div className="container">
            {paragraphs.map((para, pi) => (
              <p key={pi}>
                {para
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((word, wi) => {
                    const norm = normalise(word);
                    const isKeyword = keywords.includes(norm);
                    const color = keywordColors[norm];
                    return (
                      <span
                        key={wi}
                        className={`at-word${isKeyword ? " at-keyword-wrapper" : ""}`}
                      >
                        <span
                          className={isKeyword ? "at-keyword" : ""}
                          style={
                            isKeyword && color
                              ? { "--kw-color": color }
                              : undefined
                          }
                        >
                          {word}
                        </span>
                      </span>
                    );
                  })}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

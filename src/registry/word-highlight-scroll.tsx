"use client";

/**
 * Word Highlight Scroll - pinned copy that reads itself in as you scroll. Each
 * paragraph section pins while its words light up one after another: a grey
 * chip fades in, the word resolves through it, and selected keywords carry a
 * colored pill. Past 70 percent the sweep reverses, dropping the words back
 * behind their chips. Bold color-card headlines sit between the sections. GSAP
 * ScrollTrigger + Lenis.
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

export interface WordHighlightScrollProps {
  headlineHero?: string;
  headlineCta?: string;
  headlineOutro?: string;
  aboutParagraphs?: [string, string];
  featuresParagraphs?: [string, string];
  keywords?: string[];
  embedded?: boolean;
}

const DEFAULT_KEYWORDS = [
  "vibrant",
  "living",
  "clarity",
  "expression",
  "shape",
  "intuitive",
  "storytelling",
  "interactive",
  "vision",
];

export default function WordHighlightScroll({
  headlineHero = "Playground for bold ideas and creative interfaces.",
  headlineCta = "Join BLANK now to create expressive interfaces.",
  headlineOutro = "Built for designers who shape the web.",
  aboutParagraphs = [
    "BLANK is a vibrant space for designers who think in motion and build with intent. It is more than a tool, it is where bold ideas turn into living interfaces, powered by color, rhythm, and creative control.",
    "We believe great design starts with clarity and expression ends. That is why BLANK is built to simplify your workflow while amplifying your creative reach. From the first concept to the final handoff, it is a space where your ideas take shape, your palette comes to life, and your interface begins.",
  ],
  featuresParagraphs = [
    "BLANK brings motion, structure, and creativity together in one intuitive space. Design responsive layouts, choreograph smooth animations, and explore rich storytelling visuals, all without writing a single line of code.",
    "With built-in support for interactive components, scroll-based effects, and real-time previews, BLANK lets you prototype bold, expressive interfaces that feel as good as they look. It is the fastest way to bring your creative vision to life on the modern web.",
  ],
  keywords = DEFAULT_KEYWORDS,
  embedded = true,
}: WordHighlightScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".wh-content");
    if (!content) return;

    const wordHighlightBgColor = "60, 60, 60";

    for (const paragraph of root.querySelectorAll<HTMLElement>(
      ".wh-anime-text p",
    )) {
      const words = (paragraph.textContent ?? "").split(/\s+/);
      paragraph.innerHTML = "";
      for (const word of words) {
        if (!word.trim()) continue;
        const wordContainer = document.createElement("div");
        wordContainer.className = "wh-word";
        const wordText = document.createElement("span");
        wordText.textContent = word;
        const normalized = word.toLowerCase().replace(/[.,!?;:"]/g, "");
        if (keywords.includes(normalized)) {
          wordContainer.classList.add("wh-keyword-wrapper");
          wordText.classList.add("wh-keyword", normalized);
        }
        wordContainer.appendChild(wordText);
        paragraph.appendChild(wordContainer);
      }
    }

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const triggers: ScrollTrigger[] = [];

    for (const container of root.querySelectorAll<HTMLElement>(
      ".wh-anime-text-container",
    )) {
      triggers.push(
        ScrollTrigger.create({
          trigger: container,
          scroller: embedded ? root : undefined,
          pin: container,
          start: "top top",
          end: `+=${viewportHeight * 4}`,
          pinSpacing: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const words = Array.from(
              container.querySelectorAll<HTMLElement>(
                ".wh-anime-text .wh-word",
              ),
            );
            const totalWords = words.length;

            words.forEach((word, index) => {
              const wordText = word.querySelector<HTMLElement>("span");
              if (!wordText) return;

              if (progress <= 0.7) {
                const revealProgress = Math.min(1, progress / 0.7);
                const overlapWords = 15;
                const totalAnimationLength = 1 + overlapWords / totalWords;
                const wordStart = index / totalWords;
                const wordEnd = wordStart + overlapWords / totalWords;
                const timelineScale =
                  1 /
                  Math.min(
                    totalAnimationLength,
                    1 +
                      (totalWords - 1) / totalWords +
                      overlapWords / totalWords,
                  );
                const adjustedStart = wordStart * timelineScale;
                const adjustedEnd = wordEnd * timelineScale;
                const duration = adjustedEnd - adjustedStart;
                const wordProgress =
                  revealProgress <= adjustedStart
                    ? 0
                    : revealProgress >= adjustedEnd
                      ? 1
                      : (revealProgress - adjustedStart) / duration;

                word.style.opacity = `${wordProgress}`;
                const backgroundFadeStart =
                  wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
                const backgroundOpacity = Math.max(0, 1 - backgroundFadeStart);
                word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;

                const textRevealThreshold = 0.9;
                const textRevealProgress =
                  wordProgress >= textRevealThreshold
                    ? (wordProgress - textRevealThreshold) /
                      (1 - textRevealThreshold)
                    : 0;
                wordText.style.opacity = `${textRevealProgress ** 0.5}`;
              } else {
                const reverseProgress = (progress - 0.7) / 0.3;
                word.style.opacity = "1";
                const reverseOverlapWords = 5;
                const reverseWordStart = index / totalWords;
                const reverseWordEnd =
                  reverseWordStart + reverseOverlapWords / totalWords;
                const reverseTimelineScale =
                  1 /
                  Math.max(
                    1,
                    (totalWords - 1) / totalWords +
                      reverseOverlapWords / totalWords,
                  );
                const reverseAdjustedStart =
                  reverseWordStart * reverseTimelineScale;
                const reverseAdjustedEnd =
                  reverseWordEnd * reverseTimelineScale;
                const reverseDuration =
                  reverseAdjustedEnd - reverseAdjustedStart;
                const reverseWordProgress =
                  reverseProgress <= reverseAdjustedStart
                    ? 0
                    : reverseProgress >= reverseAdjustedEnd
                      ? 1
                      : (reverseProgress - reverseAdjustedStart) /
                        reverseDuration;

                if (reverseWordProgress > 0) {
                  wordText.style.opacity = `${1 - reverseWordProgress}`;
                  word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${reverseWordProgress})`;
                } else {
                  wordText.style.opacity = "1";
                  word.style.backgroundColor = `rgba(${wordHighlightBgColor}, 0)`;
                }
              }
            });
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
  }, [embedded, keywords]);

  return (
    <div className={embedded ? "wh-root wh-embedded" : "wh-root"} ref={rootRef}>
      <style>{styles}</style>
      <div className="wh-content">
        <section className="wh-section wh-hero">
          <div className="wh-copy-container">
            <h1>{headlineHero}</h1>
          </div>
        </section>

        <section className="wh-section wh-about wh-anime-text-container">
          <div className="wh-copy-container">
            <div className="wh-anime-text">
              {aboutParagraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="wh-section wh-cta">
          <div className="wh-copy-container">
            <h1>{headlineCta}</h1>
          </div>
        </section>

        <section className="wh-section wh-features wh-anime-text-container">
          <div className="wh-copy-container">
            <div className="wh-anime-text">
              {featuresParagraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="wh-section wh-outro">
          <div className="wh-copy-container">
            <h1>{headlineOutro}</h1>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap");

.wh-root {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #141414;
  font-family: "DM Sans", sans-serif;
}

.wh-root.wh-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.wh-root.wh-embedded::-webkit-scrollbar {
  display: none;
}

.wh-content {
  position: relative;
  width: 100%;
}

.wh-section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2em;
  overflow: hidden;
}

.wh-copy-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border-radius: 2rem;
}

.wh-copy-container h1 {
  margin: 0;
  width: 70%;
  color: #141414;
  font-size: clamp(2rem, 6vw, 5rem);
  font-weight: 900;
  line-height: 1;
}

.wh-hero .wh-copy-container {
  background: #fe6d38;
}
.wh-cta .wh-copy-container {
  background: #c6fe69;
}
.wh-outro .wh-copy-container {
  background: #7a78ff;
}

.wh-about .wh-copy-container,
.wh-features .wh-copy-container {
  border: 0.15rem dashed rgb(60, 60, 60);
}

.wh-anime-text {
  width: 60%;
}

.wh-anime-text p {
  margin: 0 0 2rem;
  color: #fff;
  text-align: center;
  font-size: clamp(1.25rem, 2.5vw, 2rem);
  font-weight: 900;
  line-height: 1;
}

.wh-anime-text .wh-word {
  display: inline-block;
  position: relative;
  margin-right: 0.2rem;
  margin-bottom: 0.2rem;
  padding: 0.1rem 0.2rem;
  border-radius: 2rem;
  will-change: background-color, opacity;
}

.wh-anime-text .wh-word.wh-keyword-wrapper {
  margin: 0 0.4rem 0.2rem 0.2rem;
}

.wh-anime-text .wh-word span {
  position: relative;
}

.wh-anime-text .wh-word span.wh-keyword {
  border-radius: 2rem;
  display: inline-block;
  width: 100%;
  height: 100%;
  padding: 0.1rem 0;
  color: #141414;
}

.wh-anime-text .wh-word span.wh-keyword::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% + 1rem);
  height: calc(100% + 0.4rem);
  background-color: #fff;
  border-radius: 2rem;
  z-index: -1;
}

.wh-anime-text .wh-word span.wh-keyword.vibrant::before,
.wh-anime-text .wh-word span.wh-keyword.shape::before,
.wh-anime-text .wh-word span.wh-keyword.interactive::before {
  background-color: #7a78ff;
}

.wh-anime-text .wh-word span.wh-keyword.living::before,
.wh-anime-text .wh-word span.wh-keyword.expression::before,
.wh-anime-text .wh-word span.wh-keyword.storytelling::before {
  background-color: #fe6d38;
}

.wh-anime-text .wh-word span.wh-keyword.clarity::before,
.wh-anime-text .wh-word span.wh-keyword.intuitive::before,
.wh-anime-text .wh-word span.wh-keyword.vision::before {
  background-color: #c6fe69;
}

.wh-anime-text .wh-word,
.wh-anime-text .wh-word span {
  opacity: 0;
}

@media (max-width: 1000px) {
  .wh-copy-container h1 {
    width: 90%;
  }
  .wh-anime-text {
    width: 90%;
  }
}
`;

"use client";

/**
 * Stretch Text Scroll - three pinned panels whose oversized words grow on a
 * vertical scaleY as you scroll in, snap to full height, then collapse back out.
 * The final panel keeps scaling its word past the frame until a background image
 * takes over, its wash fades, and a centered headline reads in word by word.
 * GSAP ScrollTrigger with SplitText and Lenis.
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

const ASSET_BASE = "https://ui.aryank.space/assets/stretch-text-scroll";
const DARK = "rgba(17, 39, 11, 1)";

export interface StretchTextScrollProps {
  heroText?: string;
  words?: [string, string, string];
  header?: string;
  outroText?: string;
  image?: string;
  embedded?: boolean;
}

export default function StretchTextScroll({
  heroText = "This space intentionally loud",
  words = ["Overdrive", "Static", "Friction"],
  header = "Overdrive always breaks the system",
  outroText = "End of transmission",
  image = `${ASSET_BASE}/img.jpg`,
  embedded = true,
}: StretchTextScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".stx-content");
    if (!content) return;

    const q = <T extends HTMLElement>(sel: string) =>
      root.querySelector<T>(sel);

    const header1 = q<HTMLElement>(".stx-header h1");
    const textElement1 = q<HTMLElement>(".stx-text-1 .stx-text-container h1");
    const textElement2 = q<HTMLElement>(".stx-text-2 .stx-text-container h1");
    const textElement3 = q<HTMLElement>(".stx-text-3 .stx-text-container h1");
    const textContainer3 = q<HTMLElement>(".stx-text-3 .stx-text-container");
    if (!textElement1 || !textElement2 || !textElement3 || !textContainer3) {
      return;
    }

    let headerSplit: SplitText | null = null;
    if (header1) {
      headerSplit = SplitText.create(header1, {
        type: "words",
        wordsClass: "stx-spotlight-word",
      });
      gsap.set(headerSplit.words, { opacity: 0 });
    }

    const targetScales: number[] = [];
    const calculateDynamicScale = () => {
      for (let i = 1; i <= 3; i++) {
        const section = q<HTMLElement>(`.stx-text-${i}`);
        const text = q<HTMLElement>(`.stx-text-${i} .stx-text-container h1`);
        if (!section || !text) continue;
        targetScales[i - 1] = section.offsetHeight / text.offsetHeight;
      }
    };
    calculateDynamicScale();
    window.addEventListener("resize", calculateDynamicScale);

    const setScaleY = (el: HTMLElement, scale: number) => {
      el.style.transform = `scaleY(${scale})`;
    };

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const scroller = embedded ? root : undefined;
    const vh = () => (embedded ? root.clientHeight : window.innerHeight);
    const triggers: ScrollTrigger[] = [];

    const scaleInOut = (
      idx: number,
      target: HTMLElement,
      triggerSel: string,
    ) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: triggerSel,
          scroller,
          start: "top bottom",
          end: "top top",
          scrub: 1,
          onUpdate: (self) =>
            setScaleY(target, targetScales[idx] * self.progress),
        }),
      );
      triggers.push(
        ScrollTrigger.create({
          trigger: triggerSel,
          scroller,
          start: "top top",
          end: `+=${vh()}px`,
          pin: true,
          pinSpacing: false,
          scrub: 1,
          onUpdate: (self) =>
            setScaleY(target, targetScales[idx] * (1 - self.progress)),
        }),
      );
    };

    scaleInOut(0, textElement1, ".stx-text-1");
    scaleInOut(1, textElement2, ".stx-text-2");

    triggers.push(
      ScrollTrigger.create({
        trigger: ".stx-text-3",
        scroller,
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) =>
          setScaleY(textElement3, targetScales[2] * self.progress),
      }),
    );

    triggers.push(
      ScrollTrigger.create({
        trigger: ".stx-text-3",
        scroller,
        start: "top top",
        end: `+=${vh() * 4}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          if (progress === 0) {
            textContainer3.style.backgroundColor = DARK;
            textContainer3.style.opacity = "1";
          }

          if (progress <= 0.75) {
            const scaleProgress = progress / 0.75;
            const currentScale = 1 + 9 * scaleProgress;
            textContainer3.style.transform = `scale3d(${currentScale}, ${currentScale}, 1)`;
          } else {
            textContainer3.style.transform = `scale3d(10, 10, 1)`;
          }

          if (progress < 0.25) {
            textContainer3.style.backgroundColor = DARK;
            textContainer3.style.opacity = "1";
          } else if (progress >= 0.25 && progress <= 0.5) {
            const fadeProgress = (progress - 0.25) / 0.25;
            const bgOpacity = Math.max(0, Math.min(1, 1 - fadeProgress));
            textContainer3.style.backgroundColor = DARK.replace(
              "1)",
              `${bgOpacity})`,
            );
          } else if (progress > 0.5) {
            textContainer3.style.backgroundColor = DARK.replace("1)", "0)");
          }

          if (progress >= 0.5 && progress <= 0.75) {
            const textProgress = (progress - 0.5) / 0.25;
            textContainer3.style.opacity = `${1 - textProgress}`;
          } else if (progress > 0.75) {
            textContainer3.style.opacity = "0";
          }

          if (headerSplit && headerSplit.words.length > 0) {
            if (progress >= 0.75 && progress <= 0.95) {
              const textProgress = (progress - 0.75) / 0.2;
              const totalWords = headerSplit.words.length;
              headerSplit.words.forEach((word, index) => {
                const wordRevealProgress = index / totalWords;
                gsap.set(word, {
                  opacity: textProgress >= wordRevealProgress ? 1 : 0,
                });
              });
            } else if (progress < 0.75) {
              gsap.set(headerSplit.words, { opacity: 0 });
            } else if (progress > 0.95) {
              gsap.set(headerSplit.words, { opacity: 1 });
            }
          }
        },
      }),
    );

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", calculateDynamicScale);
      for (const t of triggers) t.kill();
      headerSplit?.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div
      className={embedded ? "stx-root stx-embedded" : "stx-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="stx-content">
        <section className="stx-hero">
          <h1>{heroText}</h1>
        </section>

        <section className="stx-text-1">
          <div className="stx-text-container">
            <h1>{words[0]}</h1>
          </div>
        </section>

        <section className="stx-text-2">
          <div className="stx-text-container">
            <h1>{words[1]}</h1>
          </div>
        </section>

        <section className="stx-text-3">
          <div className="stx-bg-img">
            <img alt="" src={image} />
          </div>
          <div className="stx-text-container">
            <h1>{words[2]}</h1>
          </div>
          <div className="stx-header">
            <h1>{header}</h1>
          </div>
        </section>

        <section className="stx-outro">
          <h1>{outroText}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap");

.stx-root {
  --stx-dark: rgba(17, 39, 11, 1);
  --stx-light: rgba(162, 255, 91, 1);
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Roboto Condensed", sans-serif;
  background-color: var(--stx-dark);
}

.stx-root.stx-embedded {
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100svh;
}
.stx-root.stx-embedded::-webkit-scrollbar {
  display: none;
}

.stx-content {
  position: relative;
  width: 100%;
}

.stx-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stx-root h1 {
  text-transform: uppercase;
  font-size: 5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 0.85;
  text-align: center;
}

.stx-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.stx-hero,
.stx-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--stx-dark);
  color: var(--stx-light);
}

.stx-hero h1,
.stx-outro h1 {
  width: 50%;
}

.stx-text-1,
.stx-text-2 {
  background-color: var(--stx-light);
  color: var(--stx-dark);
}

.stx-text-3 {
  color: var(--stx-light);
}

.stx-text-container,
.stx-bg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: opacity, transform;
  z-index: 1;
}

.stx-text-container h1 {
  position: relative;
  left: -0.035em;
  letter-spacing: -0.05em;
  transform-origin: 50% 0%;
  transform: scaleY(0);
}

.stx-text-1 .stx-text-container h1 {
  font-size: 23vw;
  font-weight: 300;
  will-change: transform;
}

.stx-text-2 .stx-text-container h1 {
  font-size: 35vw;
  will-change: transform;
}

.stx-text-3 .stx-text-container {
  background-color: var(--stx-dark);
  color: var(--stx-light);
}

.stx-text-3 .stx-text-container h1 {
  font-size: 27vw;
  font-weight: 900;
}

.stx-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  z-index: 2;
}

@media (max-width: 1000px) {
  .stx-root h1 {
    font-size: 3rem;
  }
  .stx-hero h1,
  .stx-outro h1,
  .stx-header {
    width: calc(100% - 4rem);
  }
}
`;

"use client";

/**
 * Line Rise Text - a long editorial page where every copy block is split into
 * masked lines that rise up from behind their own baseline as the block scrolls
 * into view. Text-indented paragraphs keep their indent on the first line only,
 * and the hero copy rises on a short delay at load.
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

const ASSET_BASE = "https://ui.aryank.space/assets/line-rise-text";

export interface LineRiseTextProps {
  heroImage?: string;
  aboutImage?: string;
  brand?: string;
  embedded?: boolean;
}

export default function LineRiseText({
  heroImage = `${ASSET_BASE}/hero.jpg`,
  aboutImage = `${ASSET_BASE}/about.jpg`,
  brand = "Greyloom",
  embedded = true,
}: LineRiseTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(SplitText, ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".lrt-content");
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

    const splits: SplitText[] = [];
    const tweens: gsap.core.Tween[] = [];

    const copyRoots = Array.from(
      root.querySelectorAll<HTMLElement>(".lrt-copy"),
    );

    for (const copyRoot of copyRoots) {
      const delay = Number.parseFloat(copyRoot.dataset.delay || "0");
      const elements = copyRoot.hasAttribute("data-copy-wrapper")
        ? Array.from(copyRoot.children)
        : [copyRoot];

      const lines: Element[] = [];
      for (const element of elements) {
        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: "lrt-line",
          lineThreshold: 0.1,
        });
        splits.push(split);

        const el = element as HTMLElement;
        const textIndent = window.getComputedStyle(el).textIndent;
        if (textIndent && textIndent !== "0px") {
          const first = split.lines[0] as HTMLElement | undefined;
          if (first) first.style.paddingLeft = textIndent;
          el.style.textIndent = "0";
        }
        lines.push(...split.lines);
      }

      gsap.set(lines, { y: "100%" });
      tweens.push(
        gsap.to(lines, {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay,
          scrollTrigger: {
            trigger: copyRoot,
            scroller: embedded ? root : undefined,
            start: "top 75%",
            once: true,
          },
        }),
      );
    }

    return () => {
      for (const t of tweens) t.kill();
      for (const s of splits) s.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div className="lrt-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="lrt-content">
        <nav className="lrt-nav">
          <div className="lrt-col">
            <div className="lrt-sub-col">
              <span>{brand}</span>
            </div>
            <div className="lrt-sub-col">
              <span>Home</span>
              <span>Projects</span>
              <span>About</span>
              <span>Lab</span>
            </div>
          </div>
          <div className="lrt-col">
            <span>Let's talk</span>
          </div>
        </nav>

        <section className="lrt-hero">
          <div className="lrt-hero-img">
            <img alt="" draggable={false} src={heroImage} />
          </div>
          <div className="lrt-header">
            <h1 className="lrt-copy" data-delay="0.5">
              We craft identities and experiences for the bold.
            </h1>
          </div>
        </section>

        <section className="lrt-about">
          <span className="lrt-copy">
            Design & Strategy for the Vision-Driven
          </span>
          <div className="lrt-header">
            <h1 className="lrt-copy">
              We partner with founders, innovators, and change-makers to shape
              brands that resonate. From first lines of code to global launches,
              we bring focus, elegance, and intent to every stage.
            </h1>
          </div>
        </section>

        <section className="lrt-about-img">
          <img alt="" draggable={false} src={aboutImage} />
        </section>

        <section className="lrt-story">
          <div className="lrt-col">
            <h1 className="lrt-copy">The Story Behind Our Stillness</h1>
          </div>
          <div className="lrt-col">
            <div className="lrt-copy" data-copy-wrapper="true">
              <p>
                {brand} was born from a simple idea: that creativity, when
                wielded with intention, can quietly reshape the world. In an era
                of overstimulation and fleeting trends, we chose a different
                path. One of clarity, restraint, and long-form vision.
              </p>
              <p>
                We began as a small collective of designers, developers, and
                strategists who shared an obsession with thoughtful execution.
                No shortcuts, no templates. Just the hard, honest work of
                listening deeply, thinking critically, and building beautifully.
                Over time, our work began to attract the kind of clients we had
                always hoped for. Visionary founders, principled organizations,
                and global teams with sharp ideas and quiet confidence.
              </p>
              <p>
                We do not chase virality. We do not trade in noise. We build for
                the long haul: timeless identities, seamless digital
                experiences, and strategies that evolve with clarity and
                purpose. {brand} exists for those who believe that the most
                enduring ideas do not demand attention. They earn it.
              </p>
            </div>
          </div>
        </section>

        <section className="lrt-philosophy">
          <span className="lrt-copy">The Thought Beneath</span>
          <div className="lrt-header">
            <h1 className="lrt-copy">
              We believe in the power of quiet conviction. In work that speaks
              softly but lingers long. In design as a tool for clarity, not
              decoration. We believe that the best ideas do not demand
              attention. Our philosophy is simple. Create with purpose.
            </h1>
          </div>
        </section>

        <footer className="lrt-footer">
          <div className="lrt-col">
            <div className="lrt-sub-col">
              <span>Terms & Conditions</span>
            </div>
            <div className="lrt-sub-col">
              <div className="lrt-copy" data-copy-wrapper="true">
                <h1>Twitter</h1>
                <h1>LinkedIn</h1>
                <h1>Instagram</h1>
                <h1>Awwwards</h1>
                <h1>Email</h1>
              </div>
            </div>
          </div>
          <div className="lrt-col">
            <span>Copyright {brand} 2025</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@200..800&display=swap");

.lrt-root {
  position: relative;
  /* Own stacking context so the hero image's z-index:-1 sits above this
     wrapper's background instead of being hidden behind it. */
  isolation: isolate;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #fff;
  font-family: "Lay Grotesk - Trial", "Manrope", sans-serif;
}

.lrt-root::-webkit-scrollbar {
  display: none;
}

.lrt-root h1 {
  font-size: 3.5rem;
  font-weight: 500;
  letter-spacing: -0.05rem;
  line-height: 1;
}

.lrt-root p {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 1em;
}

.lrt-root span {
  color: #000;
  display: block;
  text-transform: uppercase;
  font-family: "Apercu Mono Pro", "DM Mono", monospace;
  font-size: 0.75rem;
  font-weight: 500;
}

.lrt-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lrt-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  padding: 1.5em 2em;
  z-index: 1;
}

.lrt-nav .lrt-col:nth-child(1) {
  display: flex;
}

.lrt-nav .lrt-col:nth-child(2) {
  text-align: right;
}

.lrt-nav span {
  color: #909090;
  mix-blend-mode: difference;
}

.lrt-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2em;
}

.lrt-col,
.lrt-sub-col {
  flex: 1;
}

.lrt-hero,
.lrt-about-img {
  display: flex;
  justify-content: center;
  align-items: center;
}

.lrt-hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

.lrt-hero .lrt-header {
  width: 50%;
  text-align: center;
}

.lrt-hero .lrt-header h1 {
  color: #909090;
}

/* .lrt-root prefix so height wins over the scoped ".lrt-root section" rule. */
.lrt-root .lrt-about-img {
  height: max-content;
  padding: 8em 2em;
}

.lrt-about-img img {
  width: 20%;
  aspect-ratio: 4/5;
}

.lrt-about,
.lrt-philosophy {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.lrt-philosophy {
  background-color: #202020;
}

.lrt-philosophy h1,
.lrt-philosophy span {
  color: #fff;
}

.lrt-about h1,
.lrt-philosophy h1 {
  text-indent: 25%;
}

.lrt-root .lrt-story {
  height: max-content;
  display: flex;
  gap: 1em;
  margin-bottom: 8em;
}

.lrt-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1em;
  padding: 6em 2em 1.5em 2em;
}

.lrt-footer .lrt-col {
  display: flex;
  justify-content: flex-end;
}

.lrt-footer .lrt-sub-col {
  display: flex;
  align-items: flex-end;
}

.lrt-line {
  transform: translateY(100%);
  will-change: transform;
}

@media (max-width: 900px) {
  .lrt-root h1 {
    font-size: 2rem;
  }

  .lrt-nav .lrt-col:nth-child(1) .lrt-sub-col:nth-child(2) {
    display: none;
  }

  .lrt-hero .lrt-header {
    width: 95%;
  }

  .lrt-about-img img {
    width: 100%;
  }

  .lrt-story {
    flex-direction: column;
  }

  .lrt-footer .lrt-col:nth-child(1) {
    flex-direction: column-reverse;
    gap: 4em;
  }

  .lrt-footer .lrt-col:nth-child(2) {
    display: none;
  }
}
`;

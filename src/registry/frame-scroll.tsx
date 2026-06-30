"use client";

/**
 * Frame Scroll - a pinned hero that collapses into a drifting grid.
 *
 * The hero pins while you scroll: the headline slides up out of frame, a second
 * line fades in word by word, then the full-bleed image shrinks to a small
 * rounded tile in the center. Below it, four columns of thumbnails parallax past
 * at staggered speeds before the frame settles into a quiet outro.
 *
 * By default it owns a Lenis-smoothed scroll container, so it embeds in a
 * bounded box. Pass embedded={false} to drive it from the window scroll.
 * GSAP ScrollTrigger with Lenis; copy is split into words by hand.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

export interface FrameScrollProps {
  heroImage?: string;
  /** Sixteen thumbnails arranged into four parallax columns. */
  images?: string[];
  heading?: string;
  copy?: string;
  aboutText?: string;
  outroText?: string;
  background?: string;
  textColor?: string;
  heroTextColor?: string;
  /** Own an internal scroll container (true) or use the window scroll (false). */
  embedded?: boolean;
}

const COMPRONENTS_ASSET_BASE = "https://compronents.dev/assets/frame-scroll";
const DEFAULT_HERO = `${COMPRONENTS_ASSET_BASE}/hero.jpg`;
const DEFAULT_IMAGES = Array.from(
  { length: 16 },
  (_, i) => `${COMPRONENTS_ASSET_BASE}/img-${i + 1}.jpg`,
);

const COLUMN_PARALLAX = [-500, -250, -250, -500];

export default function FrameScroll({
  heroImage = DEFAULT_HERO,
  images = DEFAULT_IMAGES,
  heading = "A study of motion unfolding inside a single frame",
  copy = "The moment where stillness transforms into movement",
  aboutText = "Fragments of motion and atmosphere gathered into a drifting collection of quiet visual moments.",
  outroText = "The frame settles back into quiet stillness.",
  background = "#e3e3db",
  textColor = "#171717",
  heroTextColor = "#ffffff",
  embedded = true,
}: FrameScrollProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  const copyWords = copy.split(" ");
  const columns = [0, 1, 2, 3].map((c) => images.slice(c * 4, c * 4 + 4));

  // biome-ignore lint/correctness/useExhaustiveDependencies: text props seed static DOM; the scroll machinery rebuilds only on layout / image / mode changes.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    const hero = heroRef.current;
    const about = aboutRef.current;
    if (!scroller || !content || !hero || !about) return;

    const viewportW = embedded ? scroller.clientWidth : window.innerWidth;
    const viewportH = embedded ? scroller.clientHeight : window.innerHeight;
    if (embedded) scroller.style.setProperty("--fs-vh", `${viewportH}px`);

    const lenis = embedded
      ? new Lenis({ wrapper: scroller, content })
      : new Lenis();
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const heroHeader = hero.querySelector<HTMLElement>(".fs-hero-header");
    const heroCopy = hero.querySelector<HTMLElement>(".fs-hero-copy");
    const heroImg = hero.querySelector<HTMLElement>(".fs-hero-img");
    const words = Array.from(hero.querySelectorAll<HTMLElement>(".fs-word"));
    let copyHidden = false;

    const heroTrigger = ScrollTrigger.create({
      trigger: hero,
      scroller: embedded ? scroller : undefined,
      start: "top top",
      end: `+=${viewportH * 3.5}`,
      pin: true,
      pinSpacing: false,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        const headerProgress = Math.min(progress / 0.29, 1);
        if (heroHeader)
          gsap.set(heroHeader, { yPercent: -headerProgress * 100 });

        const wordsProgress = Math.max(
          0,
          Math.min((progress - 0.29) / 0.21, 1),
        );
        const total = words.length || 1;
        words.forEach((word, i) => {
          const start = i / total;
          const end = (i + 1) / total;
          const opacity = Math.max(
            0,
            Math.min((wordsProgress - start) / (end - start), 1),
          );
          gsap.set(word, { opacity });
        });

        if (progress > 0.64 && !copyHidden) {
          copyHidden = true;
          if (heroCopy) gsap.to(heroCopy, { opacity: 0, duration: 0.2 });
        } else if (progress <= 0.64 && copyHidden) {
          copyHidden = false;
          if (heroCopy) gsap.to(heroCopy, { opacity: 1, duration: 0.2 });
        }

        const imgProgress = Math.max(0, Math.min((progress - 0.71) / 0.29, 1));
        if (heroImg) {
          gsap.set(heroImg, {
            width: gsap.utils.interpolate(viewportW, 150, imgProgress),
            height: gsap.utils.interpolate(viewportH, 150, imgProgress),
            borderRadius: gsap.utils.interpolate(0, 10, imgProgress),
          });
        }
      },
    });

    const columnTriggers = COLUMN_PARALLAX.map((y, i) => {
      const col = about.querySelector<HTMLElement>(`.fs-col-${i + 1}`);
      if (!col) return null;
      return gsap.to(col, {
        y,
        ease: "none",
        scrollTrigger: {
          trigger: about,
          scroller: embedded ? scroller : undefined,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    ScrollTrigger.refresh();

    return () => {
      heroTrigger.kill();
      for (const t of columnTriggers) t?.scrollTrigger?.kill();
      lenis.off("scroll", onScroll);
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
    };
  }, [images, heroImage, embedded]);

  return (
    <div
      className={embedded ? "fs-root fs-embedded" : "fs-root"}
      style={
        {
          "--fs-bg": background,
          "--fs-text": textColor,
          "--fs-hero-text": heroTextColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="fs-scroller" ref={scrollerRef}>
        <div className="fs-content" ref={contentRef}>
          <section className="fs-hero" ref={heroRef}>
            <div className="fs-hero-img">
              {/* biome-ignore lint/performance/noImgElement: full-bleed cover image shrunk to a tile on scroll. */}
              <img src={heroImage} alt="" />
            </div>
            <div className="fs-hero-header">
              <h2>{heading}</h2>
            </div>
            <div className="fs-hero-copy">
              <h3>
                {copyWords.map((word, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: copy words can repeat, so position is part of the identity.
                  <span className="fs-word" key={`${word}-${i}`}>
                    {word}
                    {i < copyWords.length - 1 ? " " : ""}
                  </span>
                ))}
              </h3>
            </div>
          </section>

          <section className="fs-about" ref={aboutRef}>
            <div className="fs-about-images">
              {columns.map((col, ci) => (
                <div
                  className={`fs-col fs-col-${ci + 1}`}
                  key={`col-${ci + 1}`}
                >
                  {col.map((src) => (
                    <div className="fs-img" key={src}>
                      {/* biome-ignore lint/performance/noImgElement: raw cover thumbnail in a parallax column. */}
                      <img src={src} alt="" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="fs-about-header">
              <h3>{aboutText}</h3>
            </div>
          </section>

          <section className="fs-outro">
            <h3>{outroText}</h3>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
.fs-root {
  width: 100%;
  height: 100%;
  background: var(--fs-bg);
  color: var(--fs-text);
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
}

.fs-root.fs-embedded .fs-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.fs-root.fs-embedded .fs-scroller::-webkit-scrollbar {
  display: none;
}

.fs-content {
  width: 100%;
}

.fs-hero,
.fs-about,
.fs-outro {
  position: relative;
  width: 100%;
  height: 100svh;
}
.fs-root.fs-embedded .fs-hero,
.fs-root.fs-embedded .fs-about,
.fs-root.fs-embedded .fs-outro {
  height: var(--fs-vh, 100%);
}

.fs-hero-img,
.fs-hero-header,
.fs-hero-copy {
  position: absolute;
  width: 100%;
  height: 100%;
  will-change: transform, opacity, width, height;
}

.fs-hero-img {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
}
.fs-hero-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fs-hero-header,
.fs-hero-copy {
  display: flex;
  align-items: flex-end;
  padding: clamp(1.5rem, 4cqw, 4rem);
  color: var(--fs-hero-text);
}

.fs-hero-header h2 {
  width: 75%;
  margin: 0;
  font-size: clamp(2rem, 7cqw, 5rem);
  font-weight: 400;
  letter-spacing: -0.04rem;
  line-height: 1;
}

.fs-hero-copy h3 {
  width: 60%;
  margin: 0;
  font-size: clamp(1.4rem, 4cqw, 3rem);
  font-weight: 400;
  letter-spacing: -0.03rem;
  line-height: 1.05;
}

.fs-word {
  opacity: 0;
  will-change: opacity;
}

.fs-about,
.fs-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.fs-about {
  margin-top: 275svh;
}
.fs-root.fs-embedded .fs-about {
  margin-top: calc(var(--fs-vh, 100vh) * 2.75);
}

.fs-about-images {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: clamp(0.5rem, 2cqw, 2rem);
  padding: clamp(1.5rem, 4cqw, 4rem);
}

.fs-col {
  position: relative;
  height: 125%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  will-change: transform;
}
.fs-col-1 {
  transform: translateY(1000px);
}
.fs-col-2 {
  transform: translateX(-225px) translateY(500px);
}
.fs-col-3 {
  transform: translateX(225px) translateY(500px);
}
.fs-col-4 {
  transform: translateY(1000px);
}

.fs-img {
  width: clamp(70px, 9cqw, 125px);
  height: clamp(70px, 9cqw, 125px);
  border-radius: 10px;
  overflow: hidden;
}
.fs-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fs-about-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(40%, 640px);
}
.fs-about-header h3,
.fs-outro h3 {
  margin: 0;
  font-size: clamp(1.4rem, 3.5cqw, 3rem);
  font-weight: 400;
  letter-spacing: -0.03rem;
  line-height: 1.05;
}

.fs-outro {
  background: color-mix(in srgb, var(--fs-bg) 88%, #000 12%);
}
.fs-outro h3 {
  width: min(45%, 560px);
}

@media (max-width: 1000px) {
  .fs-hero-header h2,
  .fs-hero-copy h3 {
    width: 100%;
  }
  .fs-col-2,
  .fs-col-3 {
    transform: translateX(0px) translateY(500px);
  }
  .fs-about-header,
  .fs-outro h3 {
    width: 80%;
  }
}
`;

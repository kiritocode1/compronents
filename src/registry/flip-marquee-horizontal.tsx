"use client";

/**
 * Flip Marquee Horizontal - a tilted marquee that hands one of its own frames
 * over to the next section. As the marquee passes, the seventh image is cloned
 * in place, and when the horizontal section pins, GSAP Flip grows that clone
 * from its slot in the rotated strip to a full-bleed plate, straightening it on
 * the way. The page darkens across the first five percent of the pin, then the
 * horizontal track and the plate travel at different rates so the plate slides
 * out from behind the slides rather than with them.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/flip-marquee-horizontal";

export interface FlipMarqueeSlide {
  copy: string;
  image: string;
}

export interface FlipMarqueeHorizontalProps {
  heroHeading?: string;
  outroHeading?: string;
  marqueeImages?: string[];
  pinnedIndex?: number;
  slides?: FlipMarqueeSlide[];
  light?: string;
  dark?: string;
  embedded?: boolean;
}

const DEFAULT_MARQUEE = Array.from(
  { length: 13 },
  (_, i) => `${ASSET_BASE}/img-${i + 1}.jpg`,
);

const DEFAULT_SLIDES: FlipMarqueeSlide[] = [
  {
    copy: "A landscape in constant transition, where every shape, sound, and shadow refuses to stay still. What seems stable begins to dissolve, and what fades returns again in a new form.",
    image: `${ASSET_BASE}/slide-1.jpg`,
  },
  {
    copy: "The rhythm of motion carries us forward into spaces that feel familiar yet remain undefined. Each shift is subtle, yet together they remind us that nothing we see is ever permanent.",
    image: `${ASSET_BASE}/slide-2.jpg`,
  },
];

export default function FlipMarqueeHorizontal({
  heroHeading = "Fragments of thought arranged in sequence become patterns. They unfold step by step, shaping meaning as they move forward.",
  outroHeading = "Shadows fold into light. Shapes shift across the frame, reminding us that stillness is only temporary.",
  marqueeImages = DEFAULT_MARQUEE,
  pinnedIndex = 6,
  slides = DEFAULT_SLIDES,
  light = "#edf1e8",
  dark = "#101010",
  embedded = true,
}: FlipMarqueeHorizontalProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, Flip);

    const container = root.querySelector<HTMLElement>(".wjh-container");
    const marquee = root.querySelector<HTMLElement>(".wjh-marquee");
    const marqueeImagesEl = root.querySelector<HTMLElement>(
      ".wjh-marquee-images",
    );
    const horizontal = root.querySelector<HTMLElement>(
      ".wjh-horizontal-scroll",
    );
    const horizontalWrapper = root.querySelector<HTMLElement>(
      ".wjh-horizontal-scroll-wrapper",
    );
    const originalMarqueeImg = root.querySelector<HTMLImageElement>(
      ".wjh-marquee-img.wjh-pin img",
    );
    if (
      !container ||
      !marquee ||
      !marqueeImagesEl ||
      !horizontal ||
      !horizontalWrapper ||
      !originalMarqueeImg
    ) {
      return;
    }

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content: container })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const interpolateColor = (c1: string, c2: string, factor: number) =>
      gsap.utils.interpolate(c1, c2, factor);

    const triggers: ScrollTrigger[] = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: marquee,
        scroller,
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const xPosition = -75 + self.progress * 25;
          gsap.set(marqueeImagesEl, { x: `${xPosition}%` });
        },
      }),
    );

    let pinnedMarqueeImgClone: HTMLImageElement | null = null;
    let isImgCloneActive = false;

    const createPinnedMarqueeImgClone = () => {
      if (isImgCloneActive) return;

      const rect = originalMarqueeImg.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();

      pinnedMarqueeImgClone = originalMarqueeImg.cloneNode(
        true,
      ) as HTMLImageElement;

      // The source pins this clone to the viewport with position: fixed. Inside
      // a bounded root that would escape the box, so it is absolutely placed
      // against the root and its rect is measured relative to the root instead.
      gsap.set(pinnedMarqueeImgClone, {
        position: "absolute",
        left: `${rect.left - rootRect.left}px`,
        top: `${rect.top - rootRect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        transform: "rotate(-5deg)",
        transformOrigin: "center center",
        pointerEvents: "none",
        willChange: "transform",
        zIndex: 100,
      });

      root.appendChild(pinnedMarqueeImgClone);
      gsap.set(originalMarqueeImg, { opacity: 0 });
      isImgCloneActive = true;
    };

    const removePinnedMarqueeImgClone = () => {
      if (!isImgCloneActive) return;
      pinnedMarqueeImgClone?.remove();
      pinnedMarqueeImgClone = null;
      gsap.set(originalMarqueeImg, { opacity: 1 });
      isImgCloneActive = false;
    };

    const viewportHeight = () =>
      embedded ? root.clientHeight : window.innerHeight;

    triggers.push(
      ScrollTrigger.create({
        trigger: horizontal,
        scroller,
        start: "top top",
        end: () => `+=${viewportHeight() * 5}`,
        pin: true,
        invalidateOnRefresh: true,
      }),
    );

    triggers.push(
      ScrollTrigger.create({
        trigger: marquee,
        scroller,
        start: "top top",
        onEnter: createPinnedMarqueeImgClone,
        onEnterBack: createPinnedMarqueeImgClone,
        onLeaveBack: removePinnedMarqueeImgClone,
      }),
    );

    let flipAnimation: gsap.core.Timeline | null = null;

    triggers.push(
      ScrollTrigger.create({
        trigger: horizontal,
        scroller,
        start: "top 50%",
        end: () => `+=${viewportHeight() * 5.5}`,
        invalidateOnRefresh: true,
        onEnter: () => {
          if (pinnedMarqueeImgClone && isImgCloneActive && !flipAnimation) {
            const state = Flip.getState(pinnedMarqueeImgClone);

            gsap.set(pinnedMarqueeImgClone, {
              position: "absolute",
              left: "0px",
              top: "0px",
              width: "100%",
              height: "100%",
              transform: "rotate(0deg)",
              transformOrigin: "center center",
            });

            flipAnimation = Flip.from(state, {
              duration: 1,
              ease: "none",
              paused: true,
            });
          }
        },
        onLeaveBack: () => {
          if (flipAnimation) {
            flipAnimation.kill();
            flipAnimation = null;
          }
          gsap.set(container, { backgroundColor: light });
          gsap.set(horizontalWrapper, { x: "0%" });
        },
      }),
    );

    triggers.push(
      ScrollTrigger.create({
        trigger: horizontal,
        scroller,
        start: "top 50%",
        end: () => `+=${viewportHeight() * 5.5}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          if (progress <= 0.05) {
            const bgColorProgress = Math.min(progress / 0.05, 1);
            gsap.set(container, {
              backgroundColor: interpolateColor(light, dark, bgColorProgress),
            });
          } else {
            gsap.set(container, { backgroundColor: dark });
          }

          if (progress <= 0.2) {
            const scaleProgress = progress / 0.2;
            flipAnimation?.progress(scaleProgress);
          }

          if (progress > 0.2 && progress <= 0.95) {
            flipAnimation?.progress(1);

            const horizontalProgress = (progress - 0.2) / 0.75;

            const wrapperTranslateX = -66.67 * horizontalProgress;
            gsap.set(horizontalWrapper, { x: `${wrapperTranslateX}%` });

            const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
            const imageTranslateX = -slideMovement * 100;
            if (pinnedMarqueeImgClone) {
              gsap.set(pinnedMarqueeImgClone, { x: `${imageTranslateX}%` });
            }
          } else if (progress > 0.95) {
            flipAnimation?.progress(1);
            if (pinnedMarqueeImgClone) {
              gsap.set(pinnedMarqueeImgClone, { x: "-200%" });
            }
            gsap.set(horizontalWrapper, { x: "-66.67%" });
          }
        },
      }),
    );

    ScrollTrigger.refresh();

    return () => {
      for (const trigger of triggers) trigger.kill();
      flipAnimation?.kill();
      removePinnedMarqueeImgClone();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, marqueeImages, slides, light, dark]);

  return (
    <div
      className={embedded ? "wjh-root wjh-embedded" : "wjh-root"}
      ref={rootRef}
      style={
        { "--wjh-light": light, "--wjh-dark": dark } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="wjh-container">
        <section className="wjh-hero">
          <h1>{heroHeading}</h1>
        </section>

        <section className="wjh-marquee">
          <div className="wjh-marquee-wrapper">
            <div className="wjh-marquee-images">
              {marqueeImages.map((image, i) => (
                <div
                  className={
                    i === pinnedIndex
                      ? "wjh-marquee-img wjh-pin"
                      : "wjh-marquee-img"
                  }
                  key={image}
                >
                  <img src={image} alt="" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wjh-horizontal-scroll">
          <div className="wjh-horizontal-scroll-wrapper">
            <div className="wjh-horizontal-slide wjh-horizontal-spacer" />
            {slides.map((slide) => (
              <div className="wjh-horizontal-slide" key={slide.image}>
                <div className="wjh-col">
                  <h3>{slide.copy}</h3>
                </div>
                <div className="wjh-col">
                  <img src={slide.image} alt="" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="wjh-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.wjh-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
}
.wjh-root.wjh-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.wjh-root.wjh-embedded::-webkit-scrollbar { display: none; }
.wjh-root * { margin: 0; padding: 0; box-sizing: border-box; }
.wjh-root img { width: 100%; height: 100%; object-fit: cover; }
.wjh-root h1 {
  font-size: 4rem;
  font-weight: 500;
  letter-spacing: -0.075rem;
  line-height: 1.125;
}
.wjh-root h3 {
  font-size: 2.25rem;
  font-weight: 500;
  letter-spacing: -0.025rem;
  line-height: 1.125;
}
.wjh-container {
  position: relative;
  width: 100%;
  background-color: var(--wjh-light);
  will-change: background-color;
}
.wjh-hero,
.wjh-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  align-content: center;
  text-align: center;
}
.wjh-hero h1,
.wjh-outro h1 { width: 75%; margin: 0 auto; }
.wjh-outro {
  background-color: var(--wjh-dark);
  color: var(--wjh-light);
}
.wjh-marquee {
  position: relative;
  width: 100%;
  height: 50svh;
  overflow: hidden;
}
.wjh-marquee-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-5deg);
  width: 150%;
  height: 100%;
}
.wjh-marquee-images {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-75%, -50%);
  width: 200%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  will-change: transform;
}
.wjh-marquee-img { flex: 1; width: 100%; aspect-ratio: 5/3; }
.wjh-horizontal-scroll {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.wjh-horizontal-scroll-wrapper {
  position: relative;
  width: 300%;
  height: 100svh;
  display: flex;
  will-change: transform;
}
.wjh-horizontal-slide {
  flex: 1;
  height: 100%;
  display: flex;
  gap: 2rem;
  padding: 2rem;
}
.wjh-horizontal-slide:not(.wjh-horizontal-spacer) {
  background-color: var(--wjh-dark);
  color: var(--wjh-light);
}
.wjh-horizontal-slide .wjh-col:nth-child(1) { flex: 3; }
.wjh-horizontal-slide .wjh-col:nth-child(2) { flex: 2; }
.wjh-horizontal-scroll .wjh-col {
  display: flex;
  justify-content: center;
  align-items: center;
}
.wjh-horizontal-slide .wjh-col h3,
.wjh-horizontal-slide .wjh-col img { width: 75%; }
.wjh-horizontal-slide .wjh-col img { height: 75%; }

@media (max-width: 1000px) {
  .wjh-root h1 { font-size: 2.25rem; letter-spacing: -0.05rem; }
  .wjh-root h3 { font-size: 1.5rem; }
  .wjh-hero h1,
  .wjh-outro h1 { width: 100%; }
  .wjh-marquee-wrapper { width: 300%; }
  .wjh-horizontal-slide {
    padding: 4rem;
    flex-direction: column-reverse;
    gap: 2rem;
  }
  .wjh-horizontal-slide .wjh-col:nth-child(1) { align-items: flex-start; }
  .wjh-horizontal-slide .wjh-col h3 { width: 100%; }
  .wjh-horizontal-slide .wjh-col img { width: 100%; height: 100%; }
}
`;

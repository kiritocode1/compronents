"use client";

/**
 * Pinned Shrink Cards - full-bleed sections that pin at the top and shrink
 * their image to half size as the next one arrives. Each section's scale range
 * ends at a point computed from the distance to the section below it, rather
 * than at a fixed scroll length, so uneven section heights still hand over
 * cleanly. Pin spacing is off, so the pins share the same stretch of document
 * and the cards overlap instead of queueing. The hero heading fades on its own
 * trigger across four viewports, independent of the stack.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/pinned-shrink-cards";

export interface PinnedShrinkCardsProps {
  images?: string[];
  brand?: string;
  heading?: string;
  footerHeading?: string;
  /** Scale the pinned image shrinks to. */
  endScale?: number;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 6 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function PinnedShrinkCards({
  images = DEFAULT_IMAGES,
  brand = "Flow Canvas",
  heading = "Sculpted Zen Playground",
  footerHeading = "Footer",
  endScale = 0.5,
  embedded = true,
}: PinnedShrinkCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".psc-content");
    const footer = root.querySelector<HTMLElement>(".psc-footer");
    const lastCard = root.querySelector<HTMLElement>(".psc-card-scroll");
    const heroH1 = root.querySelector<HTMLElement>(".psc-hero h1");
    if (!content || !footer || !lastCard || !heroH1) return;

    const scroller = embedded ? root : undefined;
    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;

    const tweens: gsap.core.Tween[] = [];
    const triggers: ScrollTrigger[] = [];

    const pinnedSections = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".psc-pinned"),
    );

    pinnedSections.forEach((section, index, sections) => {
      const img = section.querySelector<HTMLElement>(".psc-img");
      const nextSection = sections[index + 1] || lastCard;
      // The scale range ends where the NEXT section begins, so uneven heights
      // still hand over at the right moment.
      const endScalePoint = `top+=${nextSection.offsetTop - section.offsetTop} top`;

      tweens.push(
        gsap.to(section, {
          scrollTrigger: {
            trigger: section,
            scroller,
            start: "top top",
            end:
              index === sections.length
                ? `+=${lastCard.offsetHeight / 2}`
                : footer.offsetTop - viewportHeight,
            pin: true,
            pinSpacing: false,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        }),
      );

      if (img) {
        tweens.push(
          gsap.fromTo(
            img,
            { scale: 1 },
            {
              scale: endScale,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                scroller,
                start: "top top",
                end: endScalePoint,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          ),
        );
      }
    });

    triggers.push(
      ScrollTrigger.create({
        trigger: content,
        scroller,
        start: "top top",
        end: `+=${viewportHeight * 4}`,
        scrub: 1,
        onUpdate: (self) => {
          heroH1.style.opacity = String(1 - self.progress);
        },
      }),
    );

    ScrollTrigger.refresh();

    return () => {
      for (const tween of tweens) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
      for (const trigger of triggers) trigger.kill();
    };
  }, [embedded, images, endScale]);

  return (
    <div
      className={embedded ? "psc-root psc-embedded" : "psc-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="psc-content">
        <div className="psc-logo">
          <a href="#brand">{brand}</a>
        </div>

        <section className="psc-hero psc-pinned">
          <h1>{heading}</h1>
        </section>

        {images.slice(0, -1).map((src) => (
          <section className="psc-card psc-pinned" key={src}>
            <div className="psc-img">
              <img alt="" draggable={false} src={src} />
            </div>
          </section>
        ))}

        <section className="psc-card psc-card-scroll">
          <div className="psc-img">
            <img alt="" draggable={false} src={images[images.length - 1]} />
          </div>
        </section>

        <section className="psc-footer">
          <h1>{footerHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap");

.psc-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0f0f0f;
  color: #fff;
  container-type: inline-size;
  font-family: "Hanken Grotesk", sans-serif;
}

.psc-root * {
  box-sizing: border-box;
}

.psc-root.psc-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.psc-root.psc-embedded::-webkit-scrollbar {
  display: none;
}

.psc-content {
  position: relative;
  width: 100%;
}

.psc-logo {
  position: absolute;
  top: 2em;
  left: 2em;
  z-index: 10;
}

.psc-logo a {
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 14px;
  font-weight: 500;
}

.psc-content section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.psc-hero,
.psc-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.psc-hero h1,
.psc-footer h1 {
  margin: 0;
  font-size: 7cqw;
  font-weight: 500;
  line-height: 1;
}

.psc-img {
  width: 100%;
  height: 100%;
  will-change: transform;
}

.psc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
`;

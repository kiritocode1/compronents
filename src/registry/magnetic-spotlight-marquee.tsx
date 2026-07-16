"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/magnetic-spotlight-marquee";

const DEFAULT_IMAGES = Array.from(
  { length: 6 },
  (_, index) => `${ASSET_BASE}/marquee-img-${index + 1}.jpg`,
);

const config = {
  marqueeScrollSpeed: 100,
  stripFollowEase: 0.05,
  stripEdgeInset: 175,
  contentRiseRate: 0.85,
  risenTopGap: 100,
  liftHeadStart: 125,
  wakeStrength: 2.5,
  wakeReach: 125,
  lineSettleEase: 0.09,
};

export interface MagneticSpotlightMarqueeProps {
  images?: string[];
  title?: string;
  tagline?: string;
  email?: string;
  socialLinks?: string;
  copy?: [string, string];
  footer?: string;
}

interface MovingLine {
  el: HTMLElement;
  restCenterY: number;
  currentY: number;
}

export default function MagneticSpotlightMarquee({
  images = DEFAULT_IMAGES,
  title = "BLANK Studio",
  tagline = "Making digital work worth remembering",
  email = "hello@aryank.space",
  socialLinks = "Instagram, YouTube, X",
  copy = [
    "BLANK explores web design, motion, and front end development through practical experiments and detailed walkthroughs. Every release is made to help developers build engaging digital experiences.",
    "From GSAP animation and interactive interfaces to complete website builds, the studio focuses on creative techniques, clean code, and thoughtful processes that belong in real projects.",
  ],
  footer = "BLANK is dedicated to the craft of modern web development through tutorials, creative experiments, and detailed project breakdowns. Every release is designed to inspire curiosity, encourage learning, and help developers build better experiences for the web.",
}: MagneticSpotlightMarqueeProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const marquee = root.querySelector<HTMLElement>(".msm-marquee");
    const track = root.querySelector<HTMLElement>(".msm-marquee-track");
    if (!marquee || !track) return;

    gsap.registerPlugin(SplitText);

    const sourceItems = Array.from(track.children) as HTMLElement[];
    const oneSetWidth = sourceItems.reduce(
      (sum, item) => sum + item.offsetWidth,
      0,
    );
    const setsNeeded = Math.ceil(window.innerWidth / oneSetWidth) + 1;

    for (let copyIndex = 0; copyIndex < setsNeeded; copyIndex += 1) {
      sourceItems.forEach((item) => track.appendChild(item.cloneNode(true)));
    }

    const splits: SplitText[] = [];
    const textLines: MovingLine[] = [];
    let stripBaseTop = 0;
    let stripHeight = 0;
    let sectionHeight = 0;
    const stripRestCenterY = config.stripEdgeInset;
    let contentTopAtRest = 0;
    let stripTargetY = 0;
    let stripCurrentY = 0;
    let stripPrevY = 0;
    let hasPointerMoved = false;

    const measureGeometry = () => {
      sectionHeight = root.getBoundingClientRect().height;
      stripBaseTop = marquee.offsetTop;
      stripHeight = marquee.offsetHeight;

      let blockTop = Number.POSITIVE_INFINITY;
      textLines.forEach((line) => {
        let y = 0;
        let node: HTMLElement | null = line.el;
        while (node && node !== root) {
          y += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        line.restCenterY = y + line.el.offsetHeight / 2;
        blockTop = Math.min(
          blockTop,
          line.restCenterY - line.el.offsetHeight / 2,
        );
      });
      contentTopAtRest = Number.isFinite(blockTop)
        ? blockTop
        : sectionHeight * 0.4;

      if (!hasPointerMoved) {
        const restY = config.stripEdgeInset - stripBaseTop - stripHeight / 2;
        stripTargetY = restY;
        stripCurrentY = restY;
        stripPrevY = restY;
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      hasPointerMoved = true;
      const bounds = root.getBoundingClientRect();
      const cursorY = event.clientY - bounds.top;
      const wantedY = cursorY - stripBaseTop - stripHeight / 2;
      const highestY = config.stripEdgeInset - stripBaseTop - stripHeight / 2;
      const lowestY =
        sectionHeight - config.stripEdgeInset - stripBaseTop - stripHeight / 2;
      stripTargetY = gsap.utils.clamp(highestY, lowestY, wantedY);
    };

    const tick = () => {
      stripCurrentY += (stripTargetY - stripCurrentY) * config.stripFollowEase;
      gsap.set(marquee, { y: stripCurrentY });

      const stripCenterY = stripBaseTop + stripCurrentY + stripHeight / 2;
      const stripVelocityY = stripCurrentY - stripPrevY;
      stripPrevY = stripCurrentY;
      const descentBelowRest = Math.max(0, stripCenterY - stripRestCenterY);
      const maxRise = Math.max(0, contentTopAtRest - config.risenTopGap);
      const contentRise = -Math.min(
        descentBelowRest * config.contentRiseRate,
        maxRise,
      );

      textLines.forEach((line) => {
        const gapToStrip = line.restCenterY - stripCenterY;
        const reachedLine =
          stripCenterY + config.liftHeadStart >= line.restCenterY;
        const wakeInfluence = Math.exp(
          -(gapToStrip * gapToStrip) /
            (2 * config.wakeReach * config.wakeReach),
        );
        const wakeOffset = stripVelocityY * wakeInfluence * config.wakeStrength;
        const lineTarget = (reachedLine ? contentRise : 0) + wakeOffset;
        line.currentY += (lineTarget - line.currentY) * config.lineSettleEase;
        gsap.set(line.el, { y: line.currentY });
      });
    };

    const ctx = gsap.context(() => {
      const splitTargets = gsap.utils.toArray<HTMLElement>(
        ".msm-content h1, .msm-content h3, .msm-copy p",
      );
      splitTargets.forEach((element) => {
        const split = SplitText.create(element, {
          type: "lines",
          linesClass: "msm-line",
        });
        splits.push(split);
        split.lines.forEach((line) => {
          textLines.push({
            el: line as HTMLElement,
            restCenterY: 0,
            currentY: 0,
          });
        });
      });

      gsap.to(track, {
        x: `-=${oneSetWidth}`,
        duration: oneSetWidth / config.marqueeScrollSpeed,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (value) =>
            `${gsap.utils.wrap(-oneSetWidth, 0, Number.parseFloat(value))}px`,
        },
      });
    }, root);

    measureGeometry();
    window.addEventListener("resize", measureGeometry);
    root.addEventListener("mousemove", handlePointerMove);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      root.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", measureGeometry);
      ctx.revert();
      splits.forEach((split) => split.revert());
      Array.from(track.children).forEach((item) => {
        if (!sourceItems.includes(item as HTMLElement)) item.remove();
      });
    };
  }, []);

  return (
    <section className="msm-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="msm-nav">
        <p>{email}</p>
        <p>{socialLinks}</p>
      </div>

      <div className="msm-marquee">
        <div className="msm-marquee-track">
          {images.slice(0, 6).map((image, index) => (
            <div className="msm-marquee-item" key={`${image}-${index}`}>
              <img alt="" draggable={false} src={image} />
            </div>
          ))}
        </div>
      </div>

      <div className="msm-content">
        <h1>{title}</h1>
        <h3>{tagline}</h3>
        <div className="msm-copy">
          <p>{copy[0]}</p>
          <p>{copy[1]}</p>
        </div>
      </div>

      <div className="msm-footer">
        <p>{footer}</p>
      </div>
    </section>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap");

.msm-root, .msm-root * { box-sizing: border-box; }
.msm-root h1, .msm-root h3, .msm-root p { margin: 0; padding: 0; }
.msm-root {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background: #0f0f0f;
}
.msm-root h1 {
  font-family: "Instrument Serif", serif;
  font-size: 6rem;
  font-weight: 500;
  line-height: 0.9;
}
.msm-root h3 {
  font-family: "Instrument Sans", sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
  text-transform: uppercase;
}
.msm-root p {
  font-family: "Instrument Sans", sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
  line-height: 1.25;
}
.msm-nav, .msm-footer {
  position: absolute;
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #7a7a7a;
}
.msm-nav { top: 0; }
.msm-nav p {
  font-family: "Instrument Serif", serif;
  font-size: 0.9rem;
  font-weight: 500;
}
.msm-footer { bottom: 0; }
.msm-footer p {
  width: 30%;
  font-size: 0.6rem;
  text-align: center;
}
.msm-marquee {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  display: flex;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
  will-change: transform;
}
.msm-marquee-track {
  display: flex;
  flex-shrink: 0;
  will-change: transform;
}
.msm-marquee-item {
  flex-shrink: 0;
  width: 18rem;
  padding: 0 0.5rem;
}
.msm-marquee-item img {
  display: block;
  width: 100%;
  height: 10rem;
  border-radius: 6px;
  background: #ddd;
  object-fit: cover;
}
.msm-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: 30%;
  height: 100%;
  margin: 0 auto;
  padding-top: 8rem;
  color: #fff;
  mix-blend-mode: difference;
}
.msm-content h1 {
  width: 15rem;
  text-align: center;
}
.msm-content h3 {
  width: 20rem;
  text-align: center;
}
.msm-copy { display: flex; gap: 1rem; }
.msm-copy p:first-child { text-align: right; }
.msm-line {
  position: relative;
  white-space: nowrap;
  will-change: transform;
}
@media (max-width: 1000px) {
  .msm-root h1 { font-size: 4rem; }
  .msm-root h3 { font-size: 1.5rem; }
  .msm-footer p { width: 100%; }
  .msm-content { width: 100%; padding: 2rem; }
}
`;

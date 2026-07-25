"use client";

/**
 * Nested Mask Banner - a banner that opens like a telescope. Seven copies of
 * the same photograph are stacked, each masked by the same shape and each
 * starting at a smaller scale than the one above, so the frame reads as
 * concentric rings rather than a single picture. Scroll grows the whole
 * container from nothing while every ring closes on full size at a different
 * rate, so the rings collapse into one image at the end. Two words slide apart
 * as it opens, and the headline fills in word by word once the frame is mostly
 * there.
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

const ASSET_BASE = "https://ui.aryank.space/assets/nested-mask-banner";

export interface NestedMaskBannerProps {
  heroHeading?: string;
  bannerHeading?: string;
  introWords?: [string, string];
  outroHeading?: string;
  bannerImage?: string;
  maskImage?: string;
  maskLayers?: number;
  embedded?: boolean;
}

export default function NestedMaskBanner({
  heroHeading = "The frame is only the beginning.",
  bannerHeading = "The Season Wears Confidence",
  introWords = ["Surface", "Layered"],
  outroHeading = "And that's the silhouette.",
  bannerImage = `${ASSET_BASE}/banner-img.jpg`,
  maskImage = `${ASSET_BASE}/banner-img-mask.png`,
  maskLayers = 6,
  embedded = true,
}: NestedMaskBannerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".tel-content");
    const banner = root.querySelector<HTMLElement>(".tel-banner");
    const bannerContainer = root.querySelector<HTMLElement>(
      ".tel-banner-img-container",
    );
    const bannerHeader = root.querySelector<HTMLElement>(
      ".tel-banner-header h1",
    );
    if (!content || !banner || !bannerContainer || !bannerHeader) return;

    const bannerIntroTextElements = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".tel-banner-intro-text"),
    );
    const bannerMaskLayers = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".tel-mask"),
    );

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const splitText = new SplitText(bannerHeader, { type: "words" });
    const words = splitText.words;
    gsap.set(words, { opacity: 0 });

    bannerMaskLayers.forEach((layer, i) => {
      gsap.set(layer, { scale: 0.9 - i * 0.2 });
    });
    gsap.set(bannerContainer, { scale: 0 });

    const frameWidth = () => (embedded ? root.clientWidth : window.innerWidth);
    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;

    const trigger = ScrollTrigger.create({
      trigger: banner,
      scroller,
      start: "top top",
      end: `+=${viewportHeight * 4}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;

        gsap.set(bannerContainer, { scale: progress });

        bannerMaskLayers.forEach((layer, i) => {
          const initialScale = 0.9 - i * 0.2;
          const layerProgress = Math.min(progress / 0.9, 1.0);
          const currentScale =
            initialScale + layerProgress * (1.0 - initialScale);

          gsap.set(layer, { scale: currentScale });
        });

        if (progress <= 0.9) {
          const textProgress = progress / 0.9;
          const moveDistance = frameWidth() * 0.5;

          gsap.set(bannerIntroTextElements[0], {
            x: -textProgress * moveDistance,
          });
          gsap.set(bannerIntroTextElements[1], {
            x: textProgress * moveDistance,
          });
        }

        if (progress >= 0.7 && progress <= 0.9) {
          const headerProgress = (progress - 0.7) / 0.2;
          const totalWords = words.length;

          words.forEach((word, i) => {
            const wordStartDelay = i / totalWords;
            const wordEndDelay = (i + 1) / totalWords;

            let wordOpacity = 0;

            if (headerProgress >= wordEndDelay) {
              wordOpacity = 1;
            } else if (headerProgress >= wordStartDelay) {
              wordOpacity =
                (headerProgress - wordStartDelay) /
                (wordEndDelay - wordStartDelay);
            }

            gsap.set(word, { opacity: wordOpacity });
          });
        } else if (progress < 0.7) {
          gsap.set(words, { opacity: 0 });
        } else if (progress > 0.9) {
          gsap.set(words, { opacity: 1 });
        }
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      splitText.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, maskLayers]);

  return (
    <div
      className={embedded ? "tel-root tel-embedded" : "tel-root"}
      ref={rootRef}
      style={{ "--tel-mask": `url(${maskImage})` } as React.CSSProperties}
    >
      <style>{styles}</style>
      <div className="tel-content">
        <section className="tel-hero">
          <h1>{heroHeading}</h1>
        </section>

        <section className="tel-banner">
          <div className="tel-banner-img-container">
            <div className="tel-img">
              <img src={bannerImage} alt="" />
            </div>
            {Array.from({ length: maskLayers }, (_, i) => (
              <div
                className="tel-img tel-mask"
                key={`mask-layer-${i + 1}-of-${maskLayers}`}
              >
                <img src={bannerImage} alt="" />
              </div>
            ))}

            <div className="tel-banner-header">
              <h1>{bannerHeading}</h1>
            </div>
          </div>

          <div className="tel-banner-intro-text-container">
            {introWords.map((word) => (
              <div className="tel-banner-intro-text" key={word}>
                <h1>{word}</h1>
              </div>
            ))}
          </div>
        </section>

        <section className="tel-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap");

.tel-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Instrument Serif", serif;
  background-color: #e3e3db;
}
.tel-root.tel-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.tel-root.tel-embedded::-webkit-scrollbar { display: none; }
.tel-root * { margin: 0; padding: 0; box-sizing: border-box; }
.tel-content { position: relative; width: 100%; }
.tel-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}
.tel-root h1 { font-size: 4rem; line-height: 1.1; }
.tel-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  background-color: #e3e3db;
  color: #141414;
  overflow: hidden;
}
.tel-hero,
.tel-outro {
  display: flex;
  justify-content: center;
  align-items: center;
}
.tel-hero h1,
.tel-outro h1 { width: 50%; text-align: center; }
.tel-banner-img-container {
  position: relative;
  width: 100%;
  height: 100%;
  will-change: transform;
}
.tel-banner-img-container .tel-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}
.tel-banner-img-container .tel-img.tel-mask {
  -webkit-mask-image: var(--tel-mask);
  mask-image: var(--tel-mask);
  -webkit-mask-size: cover;
  mask-size: cover;
  -webkit-mask-position: center;
  mask-position: center;
}
.tel-banner-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  text-align: center;
  color: #e3e3db;
  z-index: 2;
}
.tel-banner-intro-text-container {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}
.tel-banner-intro-text {
  flex: 1;
  position: relative;
  will-change: transform;
}
.tel-banner-intro-text:nth-child(1) {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1000px) {
  .tel-hero h1,
  .tel-outro h1,
  .tel-banner-header { width: calc(100% - 4rem); }
}
`;

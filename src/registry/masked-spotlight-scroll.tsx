"use client";

/**
 * Masked Spotlight Scroll - a pinned sequence where a wall of desaturated
 * stills drifts past, then a shaped mask opens through it. The mask grows from
 * nothing to 450 percent while the photograph behind it counter-scales from 1.5
 * down to 1, so the image appears to settle as the aperture widens rather than
 * being pushed by it. Once the mask is fully open the closing headline fills in
 * word by word against scroll position.
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

const ASSET_BASE = "https://ui.aryank.space/assets/masked-spotlight-scroll";

export interface MaskedSpotlightScrollProps {
  wordmark?: string;
  introHeading?: string;
  spotlightHeading?: string;
  maskHeading?: string;
  outroHeading?: string;
  images?: string[];
  bannerImage?: string;
  maskImage?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 9 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

// Which cell of each four-wide row carries a photograph. The gaps are what
// give the wall its scattered rhythm.
const GRID: (number | null)[][] = [
  [null, 0, null, 1],
  [2, null, null, null],
  [null, 3, 4, null],
  [null, 5, null, 6],
  [7, null, 8, null],
];

export default function MaskedSpotlightScroll({
  wordmark = "BLANK",
  introHeading = "Awaken the Scroll",
  spotlightHeading = "Where Frames Fade Into Fate",
  maskHeading = "The Last Frame Hits Hard",
  outroHeading = "End of Act One",
  images = DEFAULT_IMAGES,
  bannerImage = `${ASSET_BASE}/spotlight-banner.jpg`,
  maskImage = `${ASSET_BASE}/spotlight-mask.svg`,
  embedded = true,
}: MaskedSpotlightScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const content = root.querySelector<HTMLElement>(".ksb-content");
    const spotlight = root.querySelector<HTMLElement>(".ksb-spotlight");
    const spotlightImages = root.querySelector<HTMLElement>(
      ".ksb-spotlight-images",
    );
    const maskContainer = root.querySelector<HTMLElement>(
      ".ksb-mask-container",
    );
    const maskImageEl = root.querySelector<HTMLElement>(".ksb-mask-img");
    const maskHeader = root.querySelector<HTMLElement>(
      ".ksb-mask-container .ksb-header h1",
    );
    if (
      !content ||
      !spotlight ||
      !spotlightImages ||
      !maskContainer ||
      !maskImageEl
    ) {
      return;
    }

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const spotlightContainerHeight = spotlightImages.offsetHeight;
    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
    const initialOffset = spotlightContainerHeight * 0.05;
    const totalMovement =
      spotlightContainerHeight + initialOffset + viewportHeight;

    let headerSplit: SplitText | null = null;
    if (maskHeader) {
      headerSplit = SplitText.create(maskHeader, {
        type: "words",
        wordsClass: "ksb-spotlight-word",
      });
      gsap.set(headerSplit.words, { opacity: 0 });
    }

    const trigger = ScrollTrigger.create({
      trigger: spotlight,
      scroller,
      start: "top top",
      end: `+=${viewportHeight * 7}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress;

        if (progress <= 0.5) {
          const imagesMoveProgress = progress / 0.5;

          const startY = 5;
          const endY = -(totalMovement / spotlightContainerHeight) * 100;
          const currentY = startY + (endY - startY) * imagesMoveProgress;

          gsap.set(spotlightImages, { y: `${currentY}%` });
        }

        if (progress >= 0.25 && progress <= 0.75) {
          const maskProgress = (progress - 0.25) / 0.5;
          const maskSize = `${maskProgress * 450}%`;
          const imageScale = 1.5 - maskProgress * 0.5;

          maskContainer.style.setProperty("-webkit-mask-size", maskSize);
          maskContainer.style.setProperty("mask-size", maskSize);

          gsap.set(maskImageEl, { scale: imageScale });
        } else if (progress < 0.25) {
          maskContainer.style.setProperty("-webkit-mask-size", "0%");
          maskContainer.style.setProperty("mask-size", "0%");
          gsap.set(maskImageEl, { scale: 1.5 });
        } else if (progress > 0.75) {
          maskContainer.style.setProperty("-webkit-mask-size", "450%");
          maskContainer.style.setProperty("mask-size", "450%");
          gsap.set(maskImageEl, { scale: 1 });
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
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      headerSplit?.revert();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, images]);

  return (
    <div
      className={embedded ? "ksb-root ksb-embedded" : "ksb-root"}
      ref={rootRef}
      style={
        {
          "--ksb-mask": `url(${maskImage})`,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="ksb-content">
        <nav className="ksb-nav">
          <span>{wordmark}</span>
        </nav>

        <section className="ksb-intro">
          <div className="ksb-header">
            <h1>{introHeading}</h1>
          </div>
        </section>

        <section className="ksb-spotlight">
          <div className="ksb-header">
            <h1>{spotlightHeading}</h1>
          </div>
          <div className="ksb-spotlight-images">
            {GRID.map((row, rowIndex) => (
              <div className="ksb-row" key={`row-${rowIndex}`}>
                {row.map((imageIndex, cellIndex) => (
                  <div
                    className="ksb-img"
                    key={`cell-${rowIndex}-${cellIndex}`}
                  >
                    {imageIndex !== null && images[imageIndex] ? (
                      <img src={images[imageIndex]} alt="" />
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="ksb-mask-container">
            <div className="ksb-mask-img">
              <img src={bannerImage} alt="" />
            </div>
            <div className="ksb-header">
              <h1>{maskHeading}</h1>
            </div>
          </div>
        </section>

        <section className="ksb-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

.ksb-root {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #161616;
}
.ksb-root.ksb-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.ksb-root.ksb-embedded::-webkit-scrollbar { display: none; }
.ksb-root * { margin: 0; padding: 0; box-sizing: border-box; }
.ksb-content { position: relative; width: 100%; }
.ksb-root h1 {
  text-transform: uppercase;
  font-family: "Barlow Condensed", sans-serif;
  font-size: 6rem;
  font-weight: 900;
  line-height: 0.85;
  letter-spacing: -0.02rem;
}
.ksb-root img { width: 100%; height: 100%; object-fit: cover; }
.ksb-nav {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 35%;
  padding: 1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  z-index: 2;
  color: #fff;
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
}
.ksb-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  background-color: #161616;
  color: #fff;
  overflow: hidden;
}
.ksb-intro,
.ksb-outro {
  display: flex;
  justify-content: center;
  align-items: center;
}
.ksb-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 50%;
  z-index: 1;
}
.ksb-spotlight { background-color: #101010; }
.ksb-spotlight-images {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300svh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform: translateY(5%);
  will-change: transform;
}
.ksb-row {
  width: 100%;
  padding: 2rem;
  display: flex;
  gap: 2rem;
}
.ksb-img {
  flex: 1;
  aspect-ratio: 5/7;
  overflow: hidden;
}
.ksb-img img { opacity: 0.5; filter: saturate(0); }
.ksb-mask-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  -webkit-mask: var(--ksb-mask) center/contain no-repeat;
  mask: var(--ksb-mask) center/contain no-repeat;
  overflow: hidden;
  -webkit-mask-size: 0%;
  mask-size: 0%;
  z-index: 10;
}
.ksb-mask-container .ksb-mask-img { width: 100%; height: 100%; }

@media (max-width: 1000px) {
  .ksb-root h1 { font-size: 4rem; }
  .ksb-nav,
  .ksb-header { width: calc(100% - 4rem); }
  .ksb-spotlight-images { width: 200%; left: -25%; }
}
`;

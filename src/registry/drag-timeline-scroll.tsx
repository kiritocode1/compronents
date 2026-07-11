"use client";

/**
 * Drag Timeline Scroll - a five-screen horizontal layout driven by a draggable
 * scrubber riding a tick-mark timeline along the bottom edge.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/drag-timeline-scroll";

export interface DragScrollTextSection {
  heading: string;
  body: string;
}

export interface DragTimelineScrollProps {
  images?: string[];
  firstSection?: DragScrollTextSection;
  fourthSection?: DragScrollTextSection;
  navLinks?: string[];
  dragLabel?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 9 },
  (_, index) => `${ASSET_BASE}/img-${index + 1}.jpg`,
);

const DEFAULT_FIRST: DragScrollTextSection = {
  heading:
    "Beyond the Veil, Threads Woven from the Shadows of Tomorrow is launching soon",
  body: "In a world frayed at the edges, our garments emerge as relics of a darker future, meticulously crafted to withstand the relentless passage of time. Each piece is a testament to survival, an amalgamation of rugged functionality and stark beauty. Embrace the abyss with our latest collection, where fashion transcends mere aesthetics and becomes a fortress.\n\nOur designs whisper tales of a forgotten society, echoing through the threads of each garment. Dive into the depths of desolation with us; adorn yourself in the remnants of a world where every stitch counts and each fabric tells a story of resilience. Join us in wearing the armor of the foregone, forging ahead into the dystopian night.",
};

const DEFAULT_FOURTH: DragScrollTextSection = {
  heading: "Echoes of Rebellion, Couture Crafted for the Last Stand",
  body: "In the shadows of crumbling skyscrapers and forgotten streets, our fashion emerges as a beacon of defiance. Each piece in our collection is forged in the fires of rebellion, designed for the brave souls who dare to stand against the tide of conformity.\n\nJoin the resistance styled in the essence of upheaval. Our creations are not just worn; they are wielded, each fabric, each seam imbued with the power of resilience. As the world edges closer to the precipice, clad yourself in our designs and become an icon of the revolution.",
};

const DEFAULT_LINKS = ["Urban Eclipse", "About", "Contact", "Work"];

export default function DragTimelineScroll({
  images = DEFAULT_IMAGES,
  firstSection = DEFAULT_FIRST,
  fourthSection = DEFAULT_FOURTH,
  navLinks = DEFAULT_LINKS,
  dragLabel = "Drag",
}: DragTimelineScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(Draggable);

    const timeline = root.querySelector<HTMLElement>(".dts-timeline");
    const scroller = root.querySelector<HTMLElement>(".dts-scroller");
    const container = root.querySelector<HTMLElement>(".dts-container");
    if (!timeline || !scroller || !container) return;

    const timelineWidth = timeline.offsetWidth;
    const scrollerWidth = scroller.offsetWidth;
    const gap = parseInt(window.getComputedStyle(document.body).fontSize, 10);

    const maxDragX = timelineWidth - scrollerWidth - 2 * gap;

    const markers: HTMLDivElement[] = [];
    for (let i = 0; i < 50; i++) {
      const marker = document.createElement("div");
      marker.classList.add("dts-marker");
      timeline.appendChild(marker);
      markers.push(marker);
    }

    const draggable = Draggable.create(scroller, {
      type: "x",
      bounds: {
        minX: gap,
        maxX: timelineWidth - scrollerWidth - gap,
      },
      onDrag: function (this: Draggable) {
        const progress = (this.x - gap) / maxDragX;
        const containerX = -400 * (timelineWidth / 100) * progress;
        gsap.to(container, {
          x: containerX,
          duration: 1,
          ease: "power3.out",
        });
      },
    });

    return () => {
      for (const instance of draggable) instance.kill();
      for (const marker of markers) marker.remove();
      gsap.killTweensOf([container, scroller]);
    };
  }, []);

  const imageSections: string[][] = [
    images.slice(0, 3),
    images.slice(3, 6),
    images.slice(6, 9),
  ];

  return (
    <div className="dts-root" ref={rootRef}>
      <style>{styles}</style>
      <nav className="dts-nav">
        {navLinks.map((link) => (
          <a href="#top" key={link}>
            {link}
          </a>
        ))}
      </nav>

      <div className="dts-container">
        <section className="dts-text-section">
          <h1>{firstSection.heading}</h1>
          <p>
            {firstSection.body.split("\n\n").map((chunk, index) => (
              <span className="dts-body-chunk" key={chunk.slice(0, 24)}>
                {index > 0 ? (
                  <>
                    <br />
                    <br />
                  </>
                ) : null}
                {chunk}
              </span>
            ))}
          </p>
        </section>

        <section>
          {imageSections[0].map((image, index) => (
            <div className={`dts-img dts-img-${index + 1}`} key={image}>
              <img alt="" draggable={false} src={image} />
            </div>
          ))}
        </section>

        <section>
          {imageSections[1].map((image, index) => (
            <div className={`dts-img dts-img-${index + 4}`} key={image}>
              <img alt="" draggable={false} src={image} />
            </div>
          ))}
        </section>

        <section className="dts-text-section">
          <h1>{fourthSection.heading}</h1>
          <p>
            {fourthSection.body.split("\n\n").map((chunk, index) => (
              <span className="dts-body-chunk" key={chunk.slice(0, 24)}>
                {index > 0 ? (
                  <>
                    <br />
                    <br />
                  </>
                ) : null}
                {chunk}
              </span>
            ))}
          </p>
        </section>

        <section>
          {imageSections[2].map((image, index) => (
            <div className={`dts-img dts-img-${index + 7}`} key={image}>
              <img alt="" draggable={false} src={image} />
            </div>
          ))}
        </section>
      </div>

      <div className="dts-timeline">
        <div className="dts-scroller">
          <p>
            [<span>{dragLabel}</span>]
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap");

@font-face {
  font-family: "BLANK Drag Display";
  src: url("${ASSET_BASE}/fonts/neue-montreal-medium.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.dts-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: #000;
  color: #fff;
}

.dts-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dts-nav {
  position: absolute;
  top: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.dts-root a {
  text-decoration: none;
  color: #fff;
  font-family: "Akkurat Mono", "Geist Mono", monospace;
  text-transform: uppercase;
  font-size: 12px;
}

.dts-timeline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 10%;
  padding: 2.25em 1em;
  display: flex;
  justify-content: space-around;
}

.dts-marker {
  width: 1px;
  height: 100%;
  background: #fff;
}

.dts-scroller {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(0%, -50%);
  font-family: "Akkurat Mono", "Geist Mono", monospace;
  text-transform: uppercase;
  background: #000;
  cursor: pointer;
  line-height: 120%;
  z-index: 2;
}

.dts-scroller span {
  font-family: "Akkurat Mono", "Geist Mono", monospace;
  font-size: 13px;
  padding: 0 3em;
}

.dts-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 500%;
  height: 90%;
  display: flex;
}

.dts-root section {
  position: relative;
  width: 20%;
  height: 100%;
  padding: 6em 2em 0 2em;
  display: flex;
  gap: 2em;
  overflow: hidden;
}

.dts-img {
  width: 100%;
  height: 100%;
}

.dts-root h1 {
  width: 50%;
  font-family: "PP Neue Montreal", "BLANK Drag Display", sans-serif;
  font-weight: 400;
  font-size: 40px;
  text-transform: uppercase;
}

.dts-root p {
  width: 40%;
  font-family: "PP Neue Montreal", "BLANK Drag Display", sans-serif;
  font-weight: 400;
  font-size: 16px;
}

.dts-text-section {
  display: flex;
  justify-content: space-between;
}

.dts-img-2,
.dts-img-3,
.dts-img-4,
.dts-img-6,
.dts-img-7,
.dts-img-9 {
  flex: 1;
}

.dts-img-1,
.dts-img-5,
.dts-img-8 {
  flex: 2;
}
`;

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/wordmark-spotlight-scroll";
const WORDMARKS = [
  `${ASSET_BASE}/header.svg`,
  ...Array.from(
    { length: 6 },
    (_, i) => `${ASSET_BASE}/project_name_${i + 1}.svg`,
  ),
];
const DEFAULT_IMAGES = Array.from(
  { length: 6 },
  (_, i) => `${ASSET_BASE}/project_img_${i + 1}.jpg`,
);

export interface WordmarkSpotlightScrollProps {
  images?: string[];
  driftAmount?: number;
  embedded?: boolean;
}

export default function WordmarkSpotlightScroll({
  images = DEFAULT_IMAGES,
  driftAmount = 300,
  embedded = true,
}: WordmarkSpotlightScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".wss-content");
    const track = root.querySelector<HTMLElement>(".wss-scroll-track");
    const names = Array.from(root.querySelectorAll<HTMLElement>(".wss-name"));
    const visuals = Array.from(
      root.querySelectorAll<HTMLElement>(".wss-visual"),
    );
    if (!content || !track || names.length < 2) return;

    const controller = new AbortController();
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    let trigger: ScrollTrigger | undefined;

    const stepCount = names.length - 1;

    function updateNames(progress: number) {
      const position = progress * stepCount;
      const current = Math.min(Math.floor(position), stepCount - 1);
      const local = gsap.utils.clamp(0, 1, position - current);

      names.forEach((name, index) => {
        if (index < current) {
          gsap.set(name, { scaleY: 0, transformOrigin: "top center" });
        } else if (index === current) {
          gsap.set(name, {
            scaleY: 1 - local,
            transformOrigin: "top center",
          });
        } else if (index === current + 1) {
          gsap.set(name, {
            scaleY: local,
            transformOrigin: "bottom center",
          });
        } else {
          gsap.set(name, { scaleY: 0, transformOrigin: "bottom center" });
        }
      });
    }

    function updateVisuals(progress: number) {
      const position = progress * stepCount;
      visuals.forEach((visual, index) => {
        const local = position - index;
        let scale = 0;
        let yPercent = 0;
        if (local > 0 && local < 1) {
          scale = local;
        } else if (local >= 1 && local < 2) {
          const exit = local - 1;
          scale = 1 - exit;
          yPercent = -exit * driftAmount;
        }
        gsap.set(visual, {
          scale,
          yPercent,
          transformOrigin: "bottom left",
        });
      });
    }

    function start() {
      names.forEach((name, index) => gsap.set(name, { zIndex: index }));
      visuals.forEach((visual, index) =>
        gsap.set(visual, { zIndex: 100 + index, scale: 0 }),
      );
      updateNames(0);
      updateVisuals(0);

      trigger = ScrollTrigger.create({
        trigger: track,
        scroller: embedded ? root : undefined,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          updateNames(self.progress);
          updateVisuals(self.progress);
        },
      });
      ScrollTrigger.refresh();
    }

    void Promise.all(
      names.map(async (name) => {
        const src = name.dataset.name;
        if (!src) return;
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) throw new Error(`Unable to load ${src}`);
        name.innerHTML = await response.text();
        const svg = name.querySelector("svg");
        svg?.setAttribute("preserveAspectRatio", "none");
        svg?.removeAttribute("width");
        svg?.removeAttribute("height");
      }),
    )
      .then(start)
      .catch((error: unknown) => {
        if ((error as DOMException).name !== "AbortError") console.error(error);
      });

    return () => {
      controller.abort();
      trigger?.kill();
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, [driftAmount, embedded]);

  return (
    <div
      className={embedded ? "wss-root wss-embedded" : "wss-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="wss-content">
        <div className="wss-spotlight">
          <div className="wss-spotlight-frame">
            {WORDMARKS.map((wordmark) => (
              <div className="wss-name" data-name={wordmark} key={wordmark} />
            ))}
            {images.slice(0, 6).map((image) => (
              <div className="wss-visual" key={image}>
                <img alt="" draggable={false} src={image} />
              </div>
            ))}
          </div>
        </div>
        <div
          className="wss-scroll-track"
          style={{ height: `${WORDMARKS.length * 100}svh` }}
        />
      </div>
    </div>
  );
}

const styles = `
.wss-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-x: hidden;
  overflow-y: auto;
  background: #0f0f0f;
  scrollbar-width: none;
}

.wss-root::-webkit-scrollbar { display: none; }
.wss-root:not(.wss-embedded) { height: auto; overflow: visible; }
.wss-content { position: relative; width: 100%; }
.wss-spotlight {
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 100svh;
  margin-bottom: -100svh;
  padding: 1rem;
  background: #0f0f0f;
}

.wss-spotlight-frame { position: relative; width: 100%; height: 100%; overflow: hidden; }
.wss-name { position: absolute; top: 0; right: 0; width: 75%; height: 100%; will-change: transform; }
.wss-name:first-child { width: 100%; }
.wss-name svg { display: block; width: 100%; height: 100%; }
.wss-visual { position: absolute; bottom: 0; left: 0; width: 300px; max-width: 40%; aspect-ratio: 1; overflow: hidden; border-radius: 0.5rem; will-change: transform; }
.wss-visual img { display: block; width: 100%; height: 100%; object-fit: cover; }
.wss-scroll-track { position: relative; z-index: 0; width: 100%; }
`;

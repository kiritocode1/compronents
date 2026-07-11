"use client";

/**
 * Inversa Scroll — a pinned hero that inverts through a masked window on scroll.
 *
 * One long pinned scroll runs several phases at once: the hero image parallaxes
 * up, a slatted SVG mask shrinks to punch a "window" through a dark overlay, the
 * image desaturates to greyscale inside it, a wireframe grid and two pulsing
 * location markers fade in, four copy blocks slide past, and a side progress bar
 * fills. Then the window re-opens and color returns. GSAP ScrollTrigger + Lenis.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK — aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { type CSSProperties, useEffect, useRef } from "react";

export interface InversaBlock {
  heading: string;
  body?: string;
}

export interface InversaMarker {
  label: string;
  color: string;
  top: string;
  left: string;
}

export interface InversaScrollProps {
  heroImage?: string;
  maskImage?: string;
  gridImage?: string;
  title?: string;
  blocks?: [InversaBlock, InversaBlock, InversaBlock];
  markers?: [InversaMarker, InversaMarker];
  outroText?: string;
  dark?: string;
  light?: string;
  embedded?: boolean;
}

const ASSET = "https://ui.aryank.space/assets/inversa-scroll";

const DEFAULT_BLOCKS: [InversaBlock, InversaBlock, InversaBlock] = [
  {
    heading: "Coordinate Mapping",
    body: "Terrain data is interpreted through directional vectors. Movement responds to relative position rather than absolute distance.",
  },
  {
    heading: "Active Locations",
    body: "Key points are indexed within the field. Each location functions as a reference for spatial alignment and transition logic.",
  },
  {
    heading: "Spatial Center",
    body: "The system converges toward a balanced focal region. Motion decelerates as positional variance reaches equilibrium.",
  },
];

const DEFAULT_MARKERS: [InversaMarker, InversaMarker] = [
  { label: "Anchor Field", color: "#dc5935", top: "50%", left: "50%" },
  { label: "Drift Field", color: "#d3ef76", top: "35%", left: "60%" },
];

const ease = (x: number) => x * x * (3 - 2 * x);

export default function InversaScroll({
  heroImage = `${ASSET}/hero-img.jpg`,
  maskImage = `${ASSET}/mask.svg`,
  gridImage = `${ASSET}/grid-overlay.svg`,
  title = "Location Framework",
  blocks = DEFAULT_BLOCKS,
  markers = DEFAULT_MARKERS,
  outroText = "The system has reached its final spatial state.",
  dark = "#141414",
  light = "#ffffff",
  embedded = true,
}: InversaScrollProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroImgElRef = useRef<HTMLImageElement>(null);
  const heroMaskRef = useRef<HTMLDivElement>(null);
  const gridOverlayRef = useRef<HTMLDivElement>(null);
  const marker1Ref = useRef<HTMLDivElement>(null);
  const marker2Ref = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: copy props seed static DOM; the scroll machinery rebuilds only on image / mode changes.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const scroller = scrollerRef.current;
    const contentScroll = contentScrollRef.current;
    const hero = heroRef.current;
    const heroContent = heroContentRef.current;
    const heroImg = heroImgRef.current;
    const heroImgEl = heroImgElRef.current;
    const heroMask = heroMaskRef.current;
    const gridOverlay = gridOverlayRef.current;
    const marker1 = marker1Ref.current;
    const marker2 = marker2Ref.current;
    const progressBar = progressBarRef.current;
    if (
      !scroller ||
      !contentScroll ||
      !hero ||
      !heroContent ||
      !heroImg ||
      !heroImgEl ||
      !heroMask ||
      !gridOverlay ||
      !marker1 ||
      !marker2 ||
      !progressBar
    )
      return;

    const viewportHeight = embedded
      ? scroller.clientHeight
      : window.innerHeight;
    if (embedded) scroller.style.setProperty("--iv-vh", `${viewportHeight}px`);

    const lenis = embedded
      ? new Lenis({ wrapper: scroller, content: contentScroll })
      : new Lenis();
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const heroContentMove = heroContent.offsetHeight - viewportHeight;
    const heroImgMove = heroImg.offsetHeight - viewportHeight;

    const trigger = ScrollTrigger.create({
      trigger: hero,
      scroller: embedded ? scroller : undefined,
      start: "top top",
      end: `+=${viewportHeight * 4}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(progressBar, { "--iv-progress": p });
        gsap.set(heroContent, { y: -p * heroContentMove });

        let imgProgress: number;
        if (p <= 0.45) imgProgress = ease(p / 0.45) * 0.65;
        else if (p <= 0.75) imgProgress = 0.65;
        else imgProgress = 0.65 + ease((p - 0.75) / 0.25) * 0.35;
        gsap.set(heroImg, { y: imgProgress * heroImgMove });

        let maskScale: number;
        let saturation: number;
        let overlayOpacity: number;
        if (p <= 0.4) {
          maskScale = 2.5;
          saturation = 1;
          overlayOpacity = 0.35;
        } else if (p <= 0.5) {
          const t = ease((p - 0.4) / 0.1);
          maskScale = 2.5 - t * 1.5;
          saturation = 1 - t;
          overlayOpacity = 0.35 + t * 0.35;
        } else if (p <= 0.75) {
          maskScale = 1;
          saturation = 0;
          overlayOpacity = 0.7;
        } else if (p <= 0.85) {
          const t = ease((p - 0.75) / 0.1);
          maskScale = 1 + t * 1.5;
          saturation = t;
          overlayOpacity = 0.7 - t * 0.35;
        } else {
          maskScale = 2.5;
          saturation = 1;
          overlayOpacity = 0.35;
        }
        gsap.set(heroMask, { scale: maskScale });
        gsap.set(heroImgEl, { filter: `saturate(${saturation})` });
        gsap.set(heroImg, { "--iv-overlay-opacity": overlayOpacity });

        let gridOpacity: number;
        if (p <= 0.475) gridOpacity = 0;
        else if (p <= 0.5) gridOpacity = ease((p - 0.475) / 0.025);
        else if (p <= 0.75) gridOpacity = 1;
        else if (p <= 0.775) gridOpacity = 1 - ease((p - 0.75) / 0.025);
        else gridOpacity = 0;
        gsap.set(gridOverlay, { opacity: gridOpacity });

        let m1: number;
        if (p <= 0.5) m1 = 0;
        else if (p <= 0.525) m1 = ease((p - 0.5) / 0.025);
        else if (p <= 0.7) m1 = 1;
        else if (p <= 0.75) m1 = 1 - ease((p - 0.7) / 0.05);
        else m1 = 0;
        gsap.set(marker1, { opacity: m1 });

        let m2: number;
        if (p <= 0.55) m2 = 0;
        else if (p <= 0.575) m2 = ease((p - 0.55) / 0.025);
        else if (p <= 0.7) m2 = 1;
        else if (p <= 0.75) m2 = 1 - ease((p - 0.7) / 0.05);
        else m2 = 0;
        gsap.set(marker2, { opacity: m2 });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      lenis.off("scroll", onScroll);
      lenis.destroy();
      gsap.ticker.remove(tickerFn);
    };
  }, [heroImage, maskImage, gridImage, embedded]);

  const maskStyle = {
    maskImage: `linear-gradient(${light}, ${light}), url("${maskImage}")`,
    WebkitMaskImage: `linear-gradient(${light}, ${light}), url("${maskImage}")`,
    maskRepeat: "no-repeat, no-repeat",
    WebkitMaskRepeat: "no-repeat, no-repeat",
    maskPosition: "center, center",
    WebkitMaskPosition: "center, center",
    maskSize: "100% 100%, 50%",
    WebkitMaskSize: "100% 100%, 50%",
    maskComposite: "subtract",
    WebkitMaskComposite: "subtract",
    backgroundColor: dark,
  } as CSSProperties;

  return (
    <div
      className={embedded ? "iv-root iv-embedded" : "iv-root"}
      style={{ ["--iv-dark" as string]: dark, ["--iv-light" as string]: light }}
    >
      <style>{styles}</style>
      <div className="iv-scroller" ref={scrollerRef}>
        <div className="iv-content" ref={contentScrollRef}>
          <section className="iv-hero" ref={heroRef}>
            <div className="iv-hero-img" ref={heroImgRef}>
              {/* biome-ignore lint/performance/noImgElement: raw image driven imperatively by ScrollTrigger. */}
              <img ref={heroImgElRef} src={heroImage} alt="" />
            </div>

            <div className="iv-hero-mask" ref={heroMaskRef} style={maskStyle} />

            <div className="iv-grid-overlay" ref={gridOverlayRef}>
              {/* biome-ignore lint/performance/noImgElement: decorative SVG overlay. */}
              <img src={gridImage} alt="" />
            </div>

            <div
              className="iv-marker iv-marker-1"
              ref={marker1Ref}
              style={
                {
                  top: markers[0].top,
                  left: markers[0].left,
                  ["--iv-marker" as string]: markers[0].color,
                } as CSSProperties
              }
            >
              <span className="iv-marker-icon" />
              <p className="iv-marker-label">{markers[0].label}</p>
            </div>

            <div
              className="iv-marker iv-marker-2"
              ref={marker2Ref}
              style={
                {
                  top: markers[1].top,
                  left: markers[1].left,
                  ["--iv-marker" as string]: markers[1].color,
                } as CSSProperties
              }
            >
              <span className="iv-marker-icon" />
              <p className="iv-marker-label">{markers[1].label}</p>
            </div>

            <div className="iv-hero-content" ref={heroContentRef}>
              <div className="iv-block">
                <div className="iv-copy">
                  <h1>{title}</h1>
                </div>
              </div>
              {blocks.map((block) => (
                <div className="iv-block" key={block.heading}>
                  <div className="iv-copy">
                    <h2>{block.heading}</h2>
                    {block.body ? <p>{block.body}</p> : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="iv-progress" ref={progressBarRef} />
          </section>

          <section className="iv-outro">
            <p>{outroText}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,100..1000&display=swap");

.iv-root {
  width: 100%;
  height: 100%;
  font-family: "DM Sans", sans-serif;
  color: var(--iv-light, #fff);
}

.iv-root.iv-embedded .iv-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.iv-root.iv-embedded .iv-scroller::-webkit-scrollbar {
  display: none;
}

.iv-root .iv-hero,
.iv-root .iv-outro {
  position: relative;
  width: 100%;
  height: var(--iv-vh, 100svh);
  background-color: var(--iv-dark, #141414);
  overflow: hidden;
}

.iv-root .iv-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.iv-root .iv-outro p {
  font-size: 1.125rem;
  line-height: 1.4;
  text-align: center;
}

.iv-root .iv-hero-img {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: calc(var(--iv-vh, 100svh) * 2);
  --iv-overlay-opacity: 0.35;
  will-change: transform;
}
.iv-root .iv-hero-img::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--iv-dark, #141414);
  opacity: var(--iv-overlay-opacity);
  will-change: opacity;
}
.iv-root .iv-hero-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: filter;
}

.iv-root .iv-hero-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--iv-vh, 100svh);
  will-change: transform;
  pointer-events: none;
}

.iv-root .iv-grid-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 55%;
  will-change: opacity;
  pointer-events: none;
}
.iv-root .iv-grid-overlay img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.25;
}

.iv-root .iv-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  will-change: opacity;
  opacity: 0;
}
.iv-root .iv-marker-label {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--iv-marker, #dc5935);
  color: var(--iv-dark, #141414);
}
.iv-root .iv-marker-2 .iv-marker-label {
  color: var(--iv-dark, #141414);
}
.iv-root .iv-marker-icon {
  position: relative;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 2rem;
  background-color: var(--iv-marker, #dc5935);
}
.iv-root .iv-marker-icon::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10rem;
  height: 10rem;
  border-radius: 100%;
  background-color: var(--iv-marker, #dc5935);
  animation: iv-pulse 1.5s cubic-bezier(0.2, 0.6, 0.35, 1) infinite;
}

@keyframes iv-pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.25);
  }
  80%,
  100% {
    opacity: 0;
  }
}

.iv-root .iv-hero-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--iv-vh, 100svh) * 4);
  display: flex;
  flex-direction: column;
  will-change: transform;
}
.iv-root .iv-block {
  width: 100%;
  height: var(--iv-vh, 100svh);
  padding: 4rem;
  display: flex;
}
.iv-root .iv-copy {
  width: 35%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.iv-root .iv-block:nth-child(1) {
  align-items: flex-end;
}
.iv-root .iv-block:nth-child(2),
.iv-root .iv-block:nth-child(4) {
  justify-content: flex-end;
  align-items: center;
}
.iv-root .iv-block:nth-child(3) {
  align-items: center;
}
.iv-root .iv-copy h1 {
  font-size: clamp(2rem, 4vw, 5rem);
  font-weight: 400;
  line-height: 1.1;
}
.iv-root .iv-copy h2 {
  font-size: clamp(1.25rem, 2.25vw, 3rem);
  font-weight: 400;
  line-height: 1.1;
}
.iv-root .iv-copy p {
  font-size: 1.05rem;
  line-height: 1.4;
}

.iv-root .iv-progress {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  width: 0.1rem;
  height: 10rem;
  background-color: rgba(255, 255, 255, 0.2);
  --iv-progress: 0;
}
.iv-root .iv-progress::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--iv-light, #fff);
  transform-origin: top;
  transform: scaleY(var(--iv-progress));
  will-change: transform;
}

@media (max-width: 800px) {
  .iv-root .iv-grid-overlay {
    width: 100%;
  }
  .iv-root .iv-block {
    padding: 1.5rem;
  }
  .iv-root .iv-copy {
    width: 75%;
  }
}
`;

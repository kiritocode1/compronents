"use client";

/**
 * Frame Sequence Hero - a scroll-scrubbed video played as 207 individual
 * frames on a canvas. Every frame is preloaded before the trigger is created,
 * so scrubbing never lands on a blank canvas, and each draw recomputes its own
 * cover fit so the sequence fills any aspect ratio without distortion. Over the
 * same pin the nav fades in the first tenth, the headline recedes on Z and
 * fades by a quarter, and the product shot flies in from a thousand pixels
 * forward across the last stretch.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/frame-sequence-hero";

export interface FrameSequenceHeroProps {
  brand?: string;
  navLinks?: string[];
  primaryCta?: string;
  secondaryCta?: string;
  heading?: string;
  trustedLabel?: string;
  clientLogos?: string[];
  productImage?: string;
  logoImage?: string;
  outroHeading?: string;
  frameCount?: number;
  frameBase?: string;
  embedded?: boolean;
}

export default function FrameSequenceHero({
  brand = "Byewind",
  navLinks = ["Overview", "Solutions", "Resources"],
  primaryCta = "Live Demo",
  secondaryCta = "Get Started",
  heading = "One unified workspace to build, test, and ship AI faster",
  trustedLabel = "Trusted by",
  clientLogos = Array.from(
    { length: 4 },
    (_, i) => `${ASSET_BASE}/client-logo-${i + 1}.png`,
  ),
  productImage = `${ASSET_BASE}/dashboard.png`,
  logoImage = `${ASSET_BASE}/logo.png`,
  outroHeading = "Join teams building faster with Byewind.",
  frameCount = 207,
  frameBase = ASSET_BASE,
  embedded = true,
}: FrameSequenceHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".adl-content");
    const nav = root.querySelector<HTMLElement>(".adl-nav");
    const header = root.querySelector<HTMLElement>(".adl-header");
    const heroImg = root.querySelector<HTMLElement>(".adl-hero-img");
    const hero = root.querySelector<HTMLElement>(".adl-hero");
    const canvas = root.querySelector<HTMLCanvasElement>(".adl-canvas");
    const context = canvas?.getContext("2d");
    if (
      !content ||
      !nav ||
      !header ||
      !heroImg ||
      !hero ||
      !canvas ||
      !context
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

    const frameWidth = () => (embedded ? root.clientWidth : window.innerWidth);
    const frameHeight = () =>
      embedded ? root.clientHeight : window.innerHeight;

    const setCanvasSize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const w = frameWidth();
      const h = frameHeight();
      canvas.width = w * pixelRatio;
      canvas.height = h * pixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };
    setCanvasSize();

    const currentFrame = (index: number) =>
      `${frameBase}/frame_${(index + 1).toString().padStart(4, "0")}.jpg`;

    const images: HTMLImageElement[] = [];
    const videoFrames = { frame: 0 };
    let imagesToLoad = frameCount;
    let trigger: ScrollTrigger | null = null;
    let disposed = false;

    const render = () => {
      const canvasWidth = frameWidth();
      const canvasHeight = frameHeight();

      context.clearRect(0, 0, canvasWidth, canvasHeight);

      const img = images[videoFrames.frame];
      if (img?.complete && img.naturalWidth > 0) {
        const imageAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = canvasWidth / canvasHeight;

        let drawWidth: number;
        let drawHeight: number;
        let drawX: number;
        let drawY: number;

        if (imageAspect > canvasAspect) {
          drawHeight = canvasHeight;
          drawWidth = drawHeight * imageAspect;
          drawX = (canvasWidth - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvasWidth;
          drawHeight = drawWidth / imageAspect;
          drawX = 0;
          drawY = (canvasHeight - drawHeight) / 2;
        }

        context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }
    };

    const setupScrollTrigger = () => {
      trigger = ScrollTrigger.create({
        trigger: hero,
        scroller,
        start: "top top",
        end: `+=${frameHeight() * 7}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          const animationProgress = Math.min(progress / 0.9, 1);
          const targetFrame = Math.round(animationProgress * (frameCount - 1));
          videoFrames.frame = targetFrame;
          render();

          if (progress <= 0.1) {
            const navProgress = progress / 0.1;
            gsap.set(nav, { opacity: 1 - navProgress });
          } else {
            gsap.set(nav, { opacity: 0 });
          }

          if (progress <= 0.25) {
            const zProgress = progress / 0.25;
            const translateZ = zProgress * -500;

            let opacity = 1;
            if (progress >= 0.2) {
              const fadeProgress = Math.min((progress - 0.2) / (0.25 - 0.2), 1);
              opacity = 1 - fadeProgress;
            }

            gsap.set(header, {
              transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
              opacity,
            });
          } else {
            gsap.set(header, { opacity: 0 });
          }

          if (progress < 0.6) {
            gsap.set(heroImg, {
              transform: "translateZ(1000px)",
              opacity: 0,
            });
          } else if (progress >= 0.6 && progress <= 0.9) {
            const imgProgress = (progress - 0.6) / (0.9 - 0.6);
            const translateZ = 1000 - imgProgress * 1000;

            let opacity = 0;
            if (progress <= 0.8) {
              opacity = (progress - 0.6) / (0.8 - 0.6);
            } else {
              opacity = 1;
            }

            gsap.set(heroImg, {
              transform: `translateZ(${translateZ}px)`,
              opacity,
            });
          } else {
            gsap.set(heroImg, { transform: "translateZ(0px)", opacity: 1 });
          }
        },
      });
    };

    const onLoad = () => {
      imagesToLoad--;
      if (!imagesToLoad && !disposed) {
        render();
        setupScrollTrigger();
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = currentFrame(i);
      images.push(img);
    }

    const onResize = () => {
      setCanvasSize();
      render();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      trigger?.kill();
      for (const img of images) {
        img.onload = null;
        img.onerror = null;
      }
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, frameCount, frameBase]);

  return (
    <div
      className={embedded ? "adl-root adl-embedded" : "adl-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="adl-content">
        <nav className="adl-nav">
          <div className="adl-nav-links">
            {navLinks.map((link) => (
              <a href="#top" key={link}>
                {link}
              </a>
            ))}
          </div>
          <div className="adl-logo">
            <a href="#top">
              <img src={logoImage} alt="" /> {brand}
            </a>
          </div>
          <div className="adl-nav-buttons">
            <div className="adl-btn adl-primary">
              <a href="#top">{primaryCta}</a>
            </div>
            <div className="adl-btn adl-secondary">
              <a href="#top">{secondaryCta}</a>
            </div>
          </div>
        </nav>

        <section className="adl-hero">
          <canvas className="adl-canvas" />

          <div className="adl-hero-content">
            <div className="adl-header">
              <h1>{heading}</h1>
              <p>{trustedLabel}</p>
              <div className="adl-client-logos">
                {clientLogos.map((logo) => (
                  <div className="adl-client-logo" key={logo}>
                    <img src={logo} alt="" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="adl-hero-img-container">
            <div className="adl-hero-img">
              <img src={productImage} alt="" />
            </div>
          </div>
        </section>
        <section className="adl-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Host+Grotesk:ital,wght@0,300..800;1,300..800&display=swap");

.adl-root {
  --fg: #241910;
  --bg: #fefbf4;
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "DM Mono", monospace;
  background-color: var(--bg);
}
.adl-root.adl-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.adl-root.adl-embedded::-webkit-scrollbar { display: none; }
.adl-root * { margin: 0; padding: 0; box-sizing: border-box; }
.adl-content { position: relative; width: 100%; }
.adl-root img { width: 100%; height: 100%; object-fit: cover; }
.adl-root h1 {
  font-family: "Host Grotesk", sans-serif;
  font-size: 3rem;
  font-weight: 400;
  line-height: 1.1;
}
.adl-root p {
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 500;
}
.adl-root a {
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--fg);
}
.adl-btn { padding: 0.75rem 1.5rem; border-radius: 0.25rem; }
.adl-btn.adl-primary { background-color: var(--bg); }
.adl-btn.adl-primary a { color: var(--fg); }
.adl-btn.adl-secondary { background-color: var(--fg); }
.adl-btn.adl-secondary a { color: var(--bg); }
.adl-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  will-change: opacity;
  z-index: 2;
}
.adl-nav > div { flex: 1; }
.adl-nav .adl-nav-links { display: flex; gap: 3rem; }
.adl-nav .adl-logo {
  display: flex;
  justify-content: center;
  align-items: center;
}
.adl-nav .adl-logo img { width: 2rem; }
.adl-nav .adl-logo a {
  text-transform: none;
  font-family: "Host Grotesk", sans-serif;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.adl-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.adl-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background-color: var(--bg);
  color: var(--fg);
}
.adl-canvas { width: 100%; height: 100%; object-fit: cover; }
.adl-hero-content {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  transform-style: preserve-3d;
  perspective: 1000px;
  padding: 0.5rem 0;
}
.adl-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  color: var(--fg);
  transform-origin: center;
  will-change: transform, opacity;
}
.adl-header h1 { width: 50%; margin-bottom: 0.5rem; }
.adl-header p { opacity: 0.35; }
.adl-client-logos { width: 30%; display: flex; gap: 0.5rem; }
.adl-client-logos .adl-client-logo { flex: 1; }
.adl-client-logos .adl-client-logo img { object-fit: contain; }
.adl-hero-img-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  transform-style: preserve-3d;
  perspective: 1000px;
}
.adl-hero-img {
  position: relative;
  width: 100%;
  height: 100%;
  transform: translateZ(1000px);
  opacity: 0;
  will-change: transform, opacity;
}

@media (max-width: 1000px) {
  .adl-root h1 { font-size: 2rem; }
  .adl-nav .adl-nav-links,
  .adl-nav .adl-nav-buttons { display: none; }
  .adl-header h1,
  .adl-client-logos,
  .adl-hero-img-container { width: calc(100% - 4rem); }
}
`;

"use client";

/**
 * Logo Mask Zoom Scroll - the page is covered by a solid panel with a
 * logo-shaped hole punched through it. That panel starts at 500 times scale,
 * so the hole is far larger than the frame and you only see the photograph
 * behind it. Scroll shrinks the panel on an exponential curve until the hole
 * is exactly logo-sized, at which point the mark reads as drawn on top of a
 * flat field. The picture counter-zooms while a white sheet fades over it, and
 * the closing headline is filled by a gradient dragged upward through its own
 * background clip.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useId, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/logo-mask-zoom-scroll";

export interface LogoMaskZoomScrollProps {
  backgroundImage?: string;
  foregroundImage?: string;
  logoImage?: string;
  scrollHint?: string;
  overlayHeading?: string;
  outroCopy?: string;
  logoPath?: string;
  panelColor?: string;
  revealColor?: string;
  embedded?: boolean;
}

// A neutral geometric mark. The source shipped a trademarked game logo, which
// is not ours to redistribute, so this is a BLANK-safe stand-in: swap
// `logoPath` for any single SVG path and the mask picks up its bounding box
// automatically.
const DEFAULT_LOGO_PATH =
  "M60 40 L140 40 A40 40 0 0 1 140 120 L60 120 Z M60 140 L160 140 A40 40 0 0 1 160 220 L60 220 Z M200 40 L240 40 L240 220 L200 220 Z M280 40 L320 40 L320 180 L400 180 L400 220 L280 220 Z";

export default function LogoMaskZoomScroll({
  backgroundImage = `${ASSET_BASE}/hero-img-layer-1.jpg`,
  foregroundImage = `${ASSET_BASE}/hero-img-layer-2.png`,
  logoImage = `${ASSET_BASE}/logo.png`,
  scrollHint = "Scroll down to reveal",
  overlayHeading = "Animation\nExperiment 452\nBy BLANK",
  outroCopy = "Build your empire. Rule your city.",
  logoPath = DEFAULT_LOGO_PATH,
  panelColor = "#111117",
  revealColor = "#e66461",
  embedded = true,
}: LogoMaskZoomScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const maskId = `gta-mask-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".gta-content");
    const hero = root.querySelector<HTMLElement>(".gta-hero");
    const heroImgContainer = root.querySelector<HTMLElement>(
      ".gta-hero-img-container",
    );
    const heroImgLogo = root.querySelector<HTMLElement>(".gta-hero-img-logo");
    const heroImgCopy = root.querySelector<HTMLElement>(".gta-hero-img-copy");
    const fadeOverlay = root.querySelector<HTMLElement>(".gta-fade-overlay");
    const svgOverlay = root.querySelector<HTMLElement>(".gta-overlay");
    const overlayCopy = root.querySelector<HTMLElement>(".gta-overlay-copy h1");
    const logoContainer = root.querySelector<HTMLElement>(
      ".gta-logo-container",
    );
    const logoMask = root.querySelector<SVGPathElement>(".gta-logo-mask");
    if (
      !content ||
      !hero ||
      !heroImgContainer ||
      !heroImgLogo ||
      !heroImgCopy ||
      !fadeOverlay ||
      !svgOverlay ||
      !overlayCopy ||
      !logoContainer ||
      !logoMask
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

    const initialOverlayScale = 500;

    const updateLogoMask = () => {
      const logoDimensions = logoContainer.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const logoBoundingBox = logoMask.getBBox();
      if (!logoBoundingBox.width || !logoBoundingBox.height) return;

      const horizontalScaleRatio = logoDimensions.width / logoBoundingBox.width;
      const verticalScaleRatio = logoDimensions.height / logoBoundingBox.height;
      const logoScaleFactor = Math.min(
        horizontalScaleRatio,
        verticalScaleRatio,
      );

      const logoHorizontalPosition =
        logoDimensions.left -
        rootRect.left +
        (logoDimensions.width - logoBoundingBox.width * logoScaleFactor) / 2 -
        logoBoundingBox.x * logoScaleFactor;
      const logoVerticalPosition =
        logoDimensions.top -
        rootRect.top +
        (logoDimensions.height - logoBoundingBox.height * logoScaleFactor) / 2 -
        logoBoundingBox.y * logoScaleFactor;

      logoMask.setAttribute(
        "transform",
        `translate(${logoHorizontalPosition}, ${logoVerticalPosition}) scale(${logoScaleFactor})`,
      );
    };

    updateLogoMask();

    gsap.set(svgOverlay, {
      transformOrigin: "50% 50%",
      xPercent: 0,
      yPercent: 0,
      left: 0,
      top: 0,
      scale: initialOverlayScale,
    });

    let scrollTriggerInstance: ScrollTrigger | null = null;
    const viewportHeight = () =>
      embedded ? root.clientHeight : window.innerHeight;

    const setupScrollTrigger = () => {
      scrollTriggerInstance?.kill();

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: hero,
        scroller,
        start: "top top",
        end: `+=${viewportHeight() * 5}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const scrollProgress = self.progress;
          const fadeOpacity = 1 - scrollProgress * (1 / 0.15);

          if (scrollProgress <= 0.15) {
            gsap.set([heroImgLogo, heroImgCopy], { opacity: fadeOpacity });
          } else {
            gsap.set([heroImgLogo, heroImgCopy], { opacity: 0 });
          }

          if (scrollProgress <= 0.85) {
            const normalizedProgress = scrollProgress * (1 / 0.85);
            const heroImgContainerScale = 1.5 - 0.5 * normalizedProgress;
            const overlayScale =
              initialOverlayScale *
              (1 / initialOverlayScale) ** normalizedProgress;
            let fadeOverlayOpacity = 0;

            gsap.set(heroImgContainer, { scale: heroImgContainerScale });

            gsap.set(svgOverlay, {
              transformOrigin: "50% 25%",
              scale: overlayScale,
              force3D: true,
            });

            if (scrollProgress >= 0.25) {
              fadeOverlayOpacity = Math.min(
                1,
                (scrollProgress - 0.25) * (1 / 0.4),
              );
            }

            gsap.set(fadeOverlay, { opacity: fadeOverlayOpacity });
          }

          if (scrollProgress >= 0.7 && scrollProgress <= 0.85) {
            const overlayCopyRevealProgress =
              (scrollProgress - 0.7) * (1 / 0.15);

            const gradientSpread = 100;
            const gradientBottomPosition =
              240 - overlayCopyRevealProgress * 280;
            const gradientTopPosition = gradientBottomPosition - gradientSpread;
            const overlayCopyScale = 1.25 - 0.25 * overlayCopyRevealProgress;

            overlayCopy.style.background = `linear-gradient(to bottom, ${panelColor} 0%, ${panelColor} ${gradientTopPosition}%, ${revealColor} ${gradientBottomPosition}%, ${revealColor} 100%)`;
            overlayCopy.style.backgroundClip = "text";

            gsap.set(overlayCopy, {
              scale: overlayCopyScale,
              opacity: overlayCopyRevealProgress,
            });
          } else if (scrollProgress < 0.7) {
            gsap.set(overlayCopy, { opacity: 0 });
          }
        },
      });
    };

    setupScrollTrigger();
    ScrollTrigger.refresh();

    const onResize = () => {
      updateLogoMask();
      ScrollTrigger.refresh();
      setupScrollTrigger();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      scrollTriggerInstance?.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, logoPath, panelColor, revealColor]);

  return (
    <div
      className={embedded ? "gta-root gta-embedded" : "gta-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="gta-content">
        <section className="gta-hero">
          <div className="gta-hero-img-container">
            <img src={backgroundImage} alt="" />

            <div className="gta-hero-img-logo">
              <img src={logoImage} alt="" />
            </div>

            <img src={foregroundImage} alt="" />

            <div className="gta-hero-img-copy">
              <p>{scrollHint}</p>
            </div>
          </div>

          <div className="gta-fade-overlay" />

          <div className="gta-overlay">
            <svg width="100%" height="100%" aria-hidden="true">
              <title>Logo reveal mask</title>
              <defs>
                <mask id={maskId}>
                  <rect width="100%" height="100%" fill="white" />
                  <path className="gta-logo-mask" d={logoPath} />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill={panelColor}
                mask={`url(#${maskId})`}
              />
            </svg>
          </div>

          <div className="gta-logo-container" />

          <div className="gta-overlay-copy">
            <h1>
              {overlayHeading.split("\n").map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h1>
          </div>
        </section>

        <section className="gta-outro">
          <p>{outroCopy}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.gta-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "DM Sans", sans-serif;
  background: #111117;
  color: #fff;
}
.gta-root.gta-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.gta-root.gta-embedded::-webkit-scrollbar { display: none; }
.gta-root * { margin: 0; padding: 0; box-sizing: border-box; }
.gta-content { position: relative; width: 100%; }
.gta-root img { width: 100%; height: 100%; object-fit: cover; }
.gta-root h1 {
  text-transform: uppercase;
  font-size: 6rem;
  font-weight: 700;
  letter-spacing: -0.2rem;
  line-height: 0.8;
}
.gta-root p {
  text-transform: uppercase;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 0.8;
}
.gta-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  background-color: #111117;
  text-align: center;
  overflow: hidden;
}
.gta-hero-img-container,
.gta-hero-img-container img,
.gta-fade-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.gta-hero-img-logo img {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 250px;
  height: auto;
  object-fit: contain;
}
.gta-hero-img-copy {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translate(-50%, 0%);
  will-change: opacity;
}
.gta-hero-img-copy p { font-size: 0.65rem; }
.gta-fade-overlay { background-color: #fff; will-change: opacity; }
.gta-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 150%;
  z-index: 1;
  transform-origin: center center;
}
.gta-logo-container {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center center;
  width: 400px;
  height: 400px;
  z-index: 2;
  pointer-events: none;
}
.gta-overlay-copy {
  position: absolute;
  bottom: 25%;
  left: 50%;
  transform: translate(-50%, 0%);
  z-index: 2;
  width: 100%;
}
.gta-overlay-copy h1 {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  transform-origin: center 0%;
}
.gta-outro {
  display: flex;
  justify-content: center;
  align-items: center;
}

@media (max-width: 900px) {
  .gta-root h1 { font-size: 2rem; letter-spacing: 0; }
  .gta-root p { font-size: 1rem; }
  .gta-overlay-copy { width: 100%; }
}
`;

"use client";

/**
 * Expanding Navbar Reveal - a fixed 16:9 navbar card sits centered over a
 * full-bleed image; as you scroll the first viewport the card's background
 * and link row expand to fill the screen while the logo FLIPs from the card's
 * bottom center up to a pinned top bar, uncovering the hero beneath.
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

const ASSET_BASE = "https://ui.aryank.space/assets/expanding-navbar-reveal";

export interface NavLink {
  label: string;
  href: string;
}

export interface ExpandingNavbarRevealProps {
  backdropImage?: string;
  logoImage?: string;
  leftLinks?: [NavLink, NavLink];
  rightLinks?: [NavLink, NavLink];
  heroText?: string;
  aboutText?: string;
  embedded?: boolean;
}

const DEFAULT_LEFT: [NavLink, NavLink] = [
  { label: "Index", href: "#" },
  { label: "Studio", href: "#" },
];
const DEFAULT_RIGHT: [NavLink, NavLink] = [
  { label: "Archive", href: "#" },
  { label: "Connect", href: "#" },
];

export default function ExpandingNavbarReveal({
  backdropImage = `${ASSET_BASE}/navbar-img.jpg`,
  logoImage = `${ASSET_BASE}/logo.svg`,
  leftLinks = DEFAULT_LEFT,
  rightLinks = DEFAULT_RIGHT,
  heroText = "Designing movement beyond fixed frames and rigid form",
  aboutText = "The frame dissolves, but the movement continues forward",
  embedded = true,
}: ExpandingNavbarRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger, Flip);

    const scroller = root.querySelector<HTMLElement>(".encr-scroller");
    const content = root.querySelector<HTMLElement>(".encr-content");
    const spacer = root.querySelector<HTMLElement>(".encr-spacer");
    const about = root.querySelector<HTMLElement>(".encr-about");
    const backdrop = root.querySelector<HTMLElement>(".encr-backdrop");
    const navbarBg = root.querySelector<HTMLElement>(".encr-background");
    const navbarItems = root.querySelector<HTMLElement>(".encr-items");
    const navbarLogo = root.querySelector<HTMLElement>(".encr-logo");
    if (
      !scroller ||
      !content ||
      !spacer ||
      !about ||
      !backdrop ||
      !navbarBg ||
      !navbarItems ||
      !navbarLogo
    )
      return;

    const navbarLinks = Array.from(
      root.querySelectorAll<HTMLElement>(".encr-links"),
    );

    // Capture the guarded elements so their non-null types carry into init().
    const els = {
      root,
      scroller,
      content,
      spacer,
      about,
      backdrop,
      navbarBg,
      navbarItems,
      navbarLogo,
    };

    // Fixed layers live outside the scroller so they pin to the stage. Lenis
    // only smooths the scrollable column, matching the pure JS body layout.
    const lenis = embedded
      ? new Lenis({ wrapper: els.scroller, content: els.content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    let trigger: ScrollTrigger | null = null;
    let flipTween: gsap.core.Timeline | null = null;

    function measureViewport() {
      const viewportWidth = embedded ? els.root.clientWidth : window.innerWidth;
      const viewportHeight = embedded
        ? els.root.clientHeight
        : window.innerHeight;
      return { viewportWidth, viewportHeight };
    }

    function init() {
      trigger?.kill();
      flipTween?.kill();
      trigger = null;
      flipTween = null;

      const { viewportWidth, viewportHeight } = measureViewport();
      const isDesktop = viewportWidth >= 720;

      // Two viewports of lead-in scroll (expand + hold), sized to the stage.
      els.spacer.style.height = `${viewportHeight * 2}px`;
      els.about.style.minHeight = `${viewportHeight}px`;

      if (!isDesktop) {
        els.navbarLogo.classList.add("encr-logo-pinned");
        gsap.set(els.navbarLogo, { width: 250 });
        gsap.set([els.navbarBg, els.navbarItems], {
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          xPercent: 0,
          yPercent: 0,
          x: 0,
          y: 0,
          transform: "none",
        });
        return;
      }

      // Reset to the centered 16:9 card before measuring Flip.
      gsap.set([els.navbarBg, els.navbarItems], { clearProps: "all" });
      els.navbarLogo.classList.remove("encr-logo-pinned");
      gsap.set(els.navbarLogo, { clearProps: "all" });
      for (const link of navbarLinks) gsap.set(link, { clearProps: "all" });

      // Force layout so offsetWidth reflects the card, not a stale inline size.
      void els.navbarBg.offsetWidth;

      const initialWidth = els.navbarBg.offsetWidth;
      const initialHeight = els.navbarBg.offsetHeight;
      const initialLinksWidths = navbarLinks.map((link) => link.offsetWidth);

      // Hold link columns at their card-width so they do not stretch with the frame.
      for (const [i, link] of navbarLinks.entries()) {
        gsap.set(link, { width: initialLinksWidths[i] });
      }

      const state = Flip.getState(els.navbarLogo);
      els.navbarLogo.classList.add("encr-logo-pinned");
      gsap.set(els.navbarLogo, { width: 250 });
      flipTween = Flip.from(state, {
        duration: 1,
        ease: "none",
        paused: true,
      });

      // Drive progress off the scroll column (not the fixed backdrop). Fixed
      // triggers report a constant rect and never accumulate scroll distance.
      trigger = ScrollTrigger.create({
        trigger: els.content,
        scroller: embedded ? els.scroller : undefined,
        start: "top top",
        end: `+=${viewportHeight}px`,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;

          gsap.set([els.navbarBg, els.navbarItems], {
            width: gsap.utils.interpolate(initialWidth, viewportWidth, p),
            height: gsap.utils.interpolate(initialHeight, viewportHeight, p),
          });

          flipTween?.progress(p);
        },
      });
    }

    init();

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        gsap.set(
          [els.navbarBg, els.navbarItems, els.navbarLogo, ...navbarLinks],
          { clearProps: "all" },
        );
        els.navbarLogo.classList.remove("encr-logo-pinned");
        init();
        ScrollTrigger.refresh();
      }, 250);
    };
    window.addEventListener("resize", onResize);

    // Layout can settle after mount (fonts, images); remeasure once.
    const raf = requestAnimationFrame(() => {
      gsap.set(
        [els.navbarBg, els.navbarItems, els.navbarLogo, ...navbarLinks],
        { clearProps: "all" },
      );
      els.navbarLogo.classList.remove("encr-logo-pinned");
      init();
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
      trigger?.kill();
      flipTween?.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div
      className={`encr-root${embedded ? " encr-embedded" : ""}`}
      ref={rootRef}
    >
      <style>{styles}</style>

      {/*
        Viewport-pinned layers sit outside the scroller so position:fixed /
        absolute never rides the Lenis content. Matches pure JS where backdrop
        + items are body-level siblings of the sections.
      */}
      <div className="encr-backdrop">
        <div className="encr-img">
          <img alt="" draggable={false} src={backdropImage} />
        </div>
        <div className="encr-background" />
      </div>

      <div className="encr-items">
        <div className="encr-links">
          {leftLinks.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="encr-links">
          {rightLinks.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="encr-logo">
          <a href="#">
            <img alt="" draggable={false} src={logoImage} />
          </a>
        </div>
      </div>

      <div className="encr-scroller">
        <div className="encr-content">
          <div aria-hidden="true" className="encr-spacer" />
          <section className="encr-hero">
            <h1>{heroText}</h1>
          </section>

          <section className="encr-about">
            <h1>{aboutText}</h1>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;900&family=Host+Grotesk:wght@300..800&display=swap");

.encr-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #f9f4eb;
  color: #141414;
}

/* Stage-scoped pin: absolute layers stick to this box, scroller owns the wheel. */
.encr-embedded {
  height: 100%;
  min-height: 0;
}

.encr-root:not(.encr-embedded) {
  height: auto;
  min-height: 100svh;
  overflow: visible;
}

.encr-scroller {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 1;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.encr-root:not(.encr-embedded) .encr-scroller {
  height: auto;
  overflow: visible;
}

.encr-scroller::-webkit-scrollbar {
  display: none;
}

.encr-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.encr-root h1 {
  text-transform: uppercase;
  font-family: "Barlow Condensed", sans-serif;
  font-size: clamp(3rem, 5vw, 7rem);
  font-weight: 900;
  line-height: 0.8;
}

.encr-root a {
  text-decoration: none;
  color: #141414;
  font-family: "Host Grotesk", sans-serif;
  font-size: 1.125rem;
  font-weight: 450;
  line-height: 0.9;
}

/*
 * Embedded: absolute against the stage so the card never leaves the top of the
 * demo box. Full-page: fixed against the viewport like the pure JS source.
 */
.encr-backdrop,
.encr-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.encr-root:not(.encr-embedded) .encr-backdrop,
.encr-root:not(.encr-embedded) .encr-img {
  position: fixed;
  height: 100svh;
}

.encr-background,
.encr-items {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  min-width: min(720px, 100%);
  aspect-ratio: 16 / 9;
  will-change: width, height;
}

.encr-root:not(.encr-embedded) .encr-background,
.encr-root:not(.encr-embedded) .encr-items {
  position: fixed;
  min-width: 720px;
}

.encr-background {
  background-color: #f9f4eb;
  pointer-events: none;
  z-index: 0;
}

.encr-items {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 2;
  pointer-events: none;
}

.encr-items a {
  pointer-events: all;
}

.encr-logo {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  padding: 2.5rem;
  pointer-events: all;
  z-index: 2;
}

.encr-logo.encr-logo-pinned {
  bottom: unset;
  top: -0.25rem;
}

.encr-logo img {
  object-fit: contain;
}

.encr-links {
  position: relative;
  width: 50%;
  display: flex;
  justify-content: space-between;
}

.encr-links:nth-child(1) {
  padding: 2.5rem 5rem 0 2.5rem;
}

.encr-links:nth-child(2) {
  padding: 2.5rem 2.5rem 0 5rem;
}

.encr-spacer {
  width: 100%;
  pointer-events: none;
}

.encr-root section {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
  z-index: 1;
}

.encr-hero {
  padding: 2.5rem 0;
}

.encr-about {
  display: flex;
}

.encr-hero h1,
.encr-about h1 {
  width: 50%;
}

@media (max-width: 720px) {
  .encr-background,
  .encr-items {
    min-width: 100%;
  }

  .encr-items,
  .encr-links {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .encr-items {
    padding: 2rem;
  }

  .encr-links:nth-child(1),
  .encr-links:nth-child(2) {
    padding: 0;
  }

  .encr-logo,
  .encr-logo.encr-logo-pinned {
    left: 0;
    transform: translateX(0);
  }

  .encr-spacer {
    display: none;
  }

  .encr-hero {
    min-height: 100vh;
  }

  .encr-hero h1,
  .encr-about h1 {
    padding: 2.5rem;
    width: 100%;
  }
}
`;

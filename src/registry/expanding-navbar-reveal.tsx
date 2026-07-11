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

    const content = root.querySelector<HTMLElement>(".encr-content");
    const backdrop = root.querySelector<HTMLElement>(".encr-backdrop");
    const navbarBg = root.querySelector<HTMLElement>(".encr-background");
    const navbarItems = root.querySelector<HTMLElement>(".encr-items");
    const navbarLogo = root.querySelector<HTMLElement>(".encr-logo");
    if (!content || !backdrop || !navbarBg || !navbarItems || !navbarLogo)
      return;

    const navbarLinks = Array.from(
      root.querySelectorAll<HTMLElement>(".encr-links"),
    );

    // Capture the guarded elements so their non-null types carry into init().
    const els = { root, backdrop, navbarBg, navbarItems, navbarLogo };

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    let trigger: ScrollTrigger | null = null;

    function init() {
      const viewportWidth = embedded
        ? els.root.clientWidth
        : window.innerWidth;
      const viewportHeight = embedded
        ? els.root.clientHeight
        : window.innerHeight;
      const isDesktop = viewportWidth >= 720;

      if (!isDesktop) {
        els.navbarLogo.classList.add("encr-logo-pinned");
        gsap.set(els.navbarLogo, { width: 250 });
        gsap.set([els.navbarBg, els.navbarItems], {
          width: "100%",
          height: "100%",
        });
        return;
      }

      const initialWidth = els.navbarBg.offsetWidth;
      const initialHeight = els.navbarBg.offsetHeight;
      const initialLinksWidths = navbarLinks.map((link) => link.offsetWidth);

      const state = Flip.getState(els.navbarLogo);
      els.navbarLogo.classList.add("encr-logo-pinned");
      gsap.set(els.navbarLogo, { width: 250 });
      const flip = Flip.from(state, {
        duration: 1,
        ease: "none",
        paused: true,
      });

      trigger = ScrollTrigger.create({
        trigger: els.backdrop,
        scroller: embedded ? els.root : undefined,
        start: "top top",
        end: `+=${viewportHeight}px`,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;

          gsap.set([els.navbarBg, els.navbarItems], {
            width: gsap.utils.interpolate(initialWidth, viewportWidth, p),
            height: gsap.utils.interpolate(initialHeight, viewportHeight, p),
          });

          navbarLinks.forEach((link, i) => {
            gsap.set(link, {
              width: gsap.utils.interpolate(
                link.offsetWidth,
                initialLinksWidths[i],
                p,
              ),
            });
          });

          flip.progress(p);
        },
      });
    }

    init();

    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        trigger?.kill();
        gsap.set(
          [els.navbarBg, els.navbarItems, els.navbarLogo, ...navbarLinks],
          { clearProps: "all" },
        );
        els.navbarLogo.classList.remove("encr-logo-pinned");
        init();
      }, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timer);
      trigger?.kill();
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
      <div className="encr-content">
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

        <section className="encr-hero">
          <h1>{heroText}</h1>
        </section>

        <section className="encr-about">
          <h1>{aboutText}</h1>
        </section>
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
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f9f4eb;
  color: #141414;
}

/* Contain the fixed navbar to this box when embedded in a bounded stage. */
.encr-embedded {
  transform: translateZ(0);
}

.encr-root::-webkit-scrollbar {
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

.encr-backdrop,
.encr-img {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.encr-background,
.encr-items {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  min-width: 720px;
  aspect-ratio: 16/9;
  will-change: width, height;
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
  margin-top: 200svh;
}

.encr-about {
  height: 100svh;
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

  .encr-hero {
    height: 100svh;
    margin-top: 0;
  }

  .encr-hero h1,
  .encr-about h1 {
    padding: 2.5rem;
    width: 100%;
  }
}
`;

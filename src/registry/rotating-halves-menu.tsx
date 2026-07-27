"use client";

/**
 * Rotating Halves Menu - a fullscreen navigation whose backdrop is two panels
 * that arrive by rotating rather than sliding. Each half is scaled twice over
 * and parked at a half turn about the edge it meets in the middle, so opening
 * the menu unwinds both rotations at once and the two colours sweep in from the
 * seam. The links are split into masked lines that rise after the panels are
 * most of the way home, and the hamburger crosses into an X on the same clock.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/rotating-halves-menu";

export interface RotatingHalvesMenuProps {
  brand?: string;
  ctaLabel?: string;
  heroImage?: string;
  heroHeading?: string;
  primaryLinks?: string[];
  secondaryLinks?: string[];
  footerLinks?: string[];
  footerNote?: string;
  leftPanelColor?: string;
  rightPanelColor?: string;
}

export default function RotatingHalvesMenu({
  brand = "Carbon Structure",
  ctaLabel = "Start Journey",
  heroImage = `${ASSET_BASE}/hero.jpg`,
  heroHeading = "Dense Geometry",
  primaryLinks = [
    "Manifesto",
    "Spatial Journeys",
    "Material Archive",
    "Visit Atelier",
    "Rituals",
  ],
  secondaryLinks = [
    "Tactile Vault",
    "Form Experiments",
    "Carbon Network",
    "Shadow Library",
    "Collections",
  ],
  footerLinks = [
    "Usage Terms",
    "Data & Cookies",
    "Privacy Policy",
    "Accessibility",
  ],
  footerNote = "© 2025 Carbon Structure",
  leftPanelColor = "#474437",
  rightPanelColor = "#403d31",
}: RotatingHalvesMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(SplitText, CustomEase);
    CustomEase.create("rhm-hop", "0.85, 0, 0.15, 1");

    const ctx = gsap.context(() => {
      const split = SplitText.create(".rhm-menu a, .rhm-menu p", {
        type: "lines",
        mask: "lines",
        linesClass: "rhm-line",
      });

      const tl = gsap.timeline({ paused: true });
      timelineRef.current = tl;

      tl.to(
        ".rhm-toggle-btn .rhm-bar-1",
        { y: 3.25, rotation: 45, scaleX: 0.75, duration: 1, ease: "rhm-hop" },
        0,
      )
        .to(
          ".rhm-toggle-btn .rhm-bar-2",
          {
            y: -3.25,
            rotation: -45,
            scaleX: 0.75,
            duration: 1,
            ease: "rhm-hop",
          },
          0,
        )
        .to(
          ".rhm-menu .rhm-bg-left-inner",
          { rotate: 0, duration: 1, ease: "rhm-hop" },
          0,
        )
        .to(
          ".rhm-menu .rhm-bg-right-inner",
          { rotate: 0, duration: 1, ease: "rhm-hop" },
          0,
        )
        .to(
          ".rhm-items-col:nth-child(1) .rhm-line",
          { y: 0, duration: 0.75, ease: "power3.out", stagger: 0.1 },
          "0.6",
        )
        .to(
          ".rhm-items-col:nth-child(2) .rhm-line",
          { y: 0, duration: 0.75, ease: "power3.out", stagger: 0.1 },
          "<",
        )
        .to(
          ".rhm-menu-footer .rhm-line",
          { y: 0, duration: 0.75, ease: "power3.out", stagger: 0.1 },
          "<",
        );

      return () => {
        timelineRef.current = null;
        split.revert();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  const toggle = () => {
    const tl = timelineRef.current;
    if (!tl) return;
    if (isOpen) tl.reverse();
    else tl.play();
    setIsOpen(!isOpen);
  };

  return (
    <div className="rhm-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="rhm-nav">
        <div className="rhm-nav-toggle">
          <button
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="rhm-toggle-btn"
            onClick={toggle}
            type="button"
          >
            <span className="rhm-bar-1" />
            <span className="rhm-bar-2" />
          </button>
        </div>
        <div className="rhm-nav-logo">
          <a href="#brand">{brand}</a>
        </div>
        <div className="rhm-nav-cta">
          <a href="#cta">{ctaLabel}</a>
        </div>
      </nav>

      <div className={isOpen ? "rhm-menu rhm-active" : "rhm-menu"}>
        <div className="rhm-menu-bg">
          <div className="rhm-bg-left">
            <div
              className="rhm-bg-left-inner"
              style={{ backgroundColor: leftPanelColor }}
            />
          </div>
          <div className="rhm-bg-right">
            <div
              className="rhm-bg-right-inner"
              style={{ backgroundColor: rightPanelColor }}
            />
          </div>
        </div>
        <div className="rhm-menu-items">
          <div className="rhm-items-col">
            {primaryLinks.map((link) => (
              <div className="rhm-menu-link" key={link}>
                <a href="#menu">{link}</a>
              </div>
            ))}
          </div>
          <div className="rhm-items-col">
            {secondaryLinks.map((link) => (
              <div className="rhm-menu-link" key={link}>
                <a href="#menu">{link}</a>
              </div>
            ))}
          </div>
          <div className="rhm-menu-footer">
            <div className="rhm-menu-footer-col">
              {footerLinks.map((link) => (
                <a href="#legal" key={link}>
                  {link}
                </a>
              ))}
            </div>
            <div className="rhm-menu-footer-col">
              <p>{footerNote}</p>
            </div>
          </div>
        </div>
      </div>

      <section
        className="rhm-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <h1>{heroHeading}</h1>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap");

.rhm-root {
  --rhm-base-100: #fff;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Instrument Sans", sans-serif;
}

.rhm-root * {
  box-sizing: border-box;
}

.rhm-root a,
.rhm-root p {
  margin: 0;
  text-decoration: none;
  color: var(--rhm-base-100);
  font-weight: 450;
  line-height: 1;
}

.rhm-hero {
  position: relative;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.rhm-hero h1 {
  width: 50%;
  margin: 0;
  text-align: center;
  color: var(--rhm-base-100);
  font-family: "Instrument Serif", serif;
  font-size: clamp(3rem, 10vw, 12rem);
  font-weight: 500;
  line-height: 0.75;
}

.rhm-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  align-items: center;
  z-index: 2;
}

.rhm-nav > div {
  flex: 1;
}

.rhm-nav .rhm-nav-logo {
  display: flex;
  justify-content: center;
}

.rhm-nav .rhm-nav-logo a {
  width: 8rem;
  text-align: center;
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 500;
}

.rhm-nav .rhm-nav-cta {
  display: flex;
  justify-content: flex-end;
}

.rhm-nav .rhm-nav-cta a {
  font-family: "Instrument Serif", serif;
  padding: 0.75rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5rem;
}

.rhm-nav .rhm-toggle-btn {
  width: 60px;
  height: 60px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10rem;
  cursor: pointer;
}

.rhm-nav .rhm-toggle-btn span {
  width: 100%;
  height: 1.25px;
  background: var(--rhm-base-100);
  will-change: transform;
}

.rhm-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.rhm-menu.rhm-active {
  pointer-events: all;
}

.rhm-menu .rhm-menu-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.rhm-menu .rhm-bg-left,
.rhm-menu .rhm-bg-right {
  position: absolute;
  width: 50%;
  height: 100%;
  overflow: hidden;
}

.rhm-menu .rhm-bg-left {
  left: 0;
}

.rhm-menu .rhm-bg-right {
  right: 0;
}

.rhm-menu .rhm-bg-left-inner,
.rhm-menu .rhm-bg-right-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.rhm-menu .rhm-bg-left-inner {
  transform-origin: 100% 50%;
  transform: rotate(180deg) scale(2, 2);
}

.rhm-menu .rhm-bg-right-inner {
  transform-origin: 0% 50%;
  transform: rotate(-180deg) scale(2, 2);
}

.rhm-menu .rhm-menu-items {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
}

.rhm-menu .rhm-items-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.rhm-menu .rhm-items-col:nth-child(1) a {
  text-transform: uppercase;
  font-size: clamp(1.5rem, 2.5vw, 4rem);
  line-height: 1.1;
}

.rhm-menu .rhm-items-col:nth-child(2) a {
  font-family: "Instrument Serif", serif;
  font-size: clamp(1.65rem, 2.75vw, 3rem);
  line-height: 1.2;
}

.rhm-menu .rhm-menu-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.rhm-menu .rhm-menu-footer-col {
  display: flex;
  gap: 2rem;
}

.rhm-menu .rhm-menu-footer a,
.rhm-menu .rhm-menu-footer p {
  text-transform: uppercase;
  font-size: 0.75rem;
}

.rhm-menu a .rhm-line,
.rhm-menu p .rhm-line {
  position: relative;
  transform: translateY(110%);
  will-change: transform;
}

@media (max-width: 1000px) {
  .rhm-nav {
    flex-direction: row-reverse;
    justify-content: space-between;
  }

  .rhm-nav .rhm-nav-toggle {
    display: flex;
    justify-content: flex-end;
  }

  .rhm-nav .rhm-nav-logo {
    justify-content: flex-start;
  }

  .rhm-nav .rhm-nav-logo a {
    text-align: left;
  }

  .rhm-nav .rhm-nav-cta {
    display: none;
  }

  .rhm-menu .rhm-bg-right {
    display: none;
  }

  .rhm-menu .rhm-bg-left {
    width: 100%;
  }

  .rhm-menu .rhm-menu-items {
    padding: 6rem 2rem;
    flex-direction: column-reverse;
    gap: 4rem;
  }

  .rhm-menu .rhm-items-col {
    align-items: flex-start;
    gap: 0.5rem;
  }

  .rhm-menu .rhm-items-col:nth-child(1) {
    justify-content: flex-start;
  }

  .rhm-menu .rhm-items-col:nth-child(2) {
    justify-content: flex-end;
  }

  .rhm-menu .rhm-menu-footer {
    padding: 2rem;
    align-items: flex-end;
  }

  .rhm-menu .rhm-menu-footer-col {
    flex-direction: column;
    gap: 0;
  }
}
`;

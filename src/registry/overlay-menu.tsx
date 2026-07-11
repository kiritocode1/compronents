"use client";

/**
 * Overlay Menu — a layered, curtain-style fullscreen navigation.
 *
 * A hamburger toggles a multi-pane overlay: four colored panels sweep down in a
 * staggered scaleY, the dark menu surface clip-path reveals underneath, and the
 * link groups slide up line-by-line (GSAP timeline + SplitText). Reverse plays
 * it all backwards.
 *
 * Wraps your page: pass the content behind the menu as `children`. The root is
 * relatively positioned and fills its parent, so size it full-screen for a real
 * site nav or drop it into any bounded box.
 *
 * BLANK — aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { type ReactNode, useEffect, useRef } from "react";

export interface MenuLink {
  label: string;
  href: string;
}

export interface OverlayMenuProps {
  /** Logo image shown top-left in the bar. */
  logo?: string;
  /** Page / hero content rendered behind the menu. */
  children?: ReactNode;
  socials?: MenuLink[];
  legal?: MenuLink[];
  primaryLinks?: MenuLink[];
  secondaryLinks?: MenuLink[];
  /** The four curtain panel colors, swept in order. */
  panelColors?: [string, string, string, string];
  /** The menu surface color revealed under the curtains. */
  menuColor?: string;
  /** Hamburger bar color. */
  togglerColor?: string;
}

const COMPRONENTS_ASSET_BASE = "https://ui.aryank.space/assets/overlay-menu";
const HREF = "https://aryank.space";

const DEFAULT_SOCIALS: MenuLink[] = [
  { label: "Bluesky", href: HREF },
  { label: "Pinterest", href: HREF },
  { label: "YouTube", href: HREF },
  { label: "Instagram", href: HREF },
  { label: "LinkedIn", href: HREF },
  { label: "X", href: HREF },
];
const DEFAULT_LEGAL: MenuLink[] = [
  { label: "Cookie Policy", href: HREF },
  { label: "Accessibility", href: HREF },
  { label: "Data Rights", href: HREF },
  { label: "Disclosures", href: HREF },
];
const DEFAULT_PRIMARY: MenuLink[] = [
  { label: "Home", href: HREF },
  { label: "Experiments", href: HREF },
  { label: "Latest Updates", href: HREF },
  { label: "Documentation", href: HREF },
  { label: "Community", href: HREF },
];
const DEFAULT_SECONDARY: MenuLink[] = [
  { label: "Playground", href: HREF },
  { label: "Build Something", href: HREF },
  { label: "Activity Feed", href: HREF },
  { label: "Profile", href: HREF },
];

const DEFAULT_PANELS: [string, string, string, string] = [
  "#57cea5",
  "#063124",
  "#0b5c43",
  "#21ba80",
];

export default function OverlayMenu({
  logo = `${COMPRONENTS_ASSET_BASE}/logo.png`,
  children,
  socials = DEFAULT_SOCIALS,
  legal = DEFAULT_LEGAL,
  primaryLinks = DEFAULT_PRIMARY,
  secondaryLinks = DEFAULT_SECONDARY,
  panelColors = DEFAULT_PANELS,
  menuColor = "#084331",
  togglerColor = "#ffffff",
}: OverlayMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const togglerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    gsap.registerPlugin(SplitText);
    const root = rootRef.current;
    const toggler = togglerRef.current;
    if (!root || !toggler) return;

    const navBgs = root.querySelectorAll<HTMLElement>(".om-bg");
    const navItems = root.querySelector<HTMLElement>(".om-items");
    if (!navItems) return;

    /* ---- Split the link groups into masked lines ---- */
    const splits: SplitText[] = [];
    const groupSelectors = [
      ".om-socials a, .om-legal a",
      ".om-primary-links a",
      ".om-secondary-links a",
    ];
    const lineGroups = groupSelectors.map((selector) => {
      const lines: Element[] = [];
      root.querySelectorAll(selector).forEach((node) => {
        const split = SplitText.create(node, {
          type: "lines",
          mask: "lines",
          linesClass: "om-line",
        });
        splits.push(split);
        lines.push(...split.lines);
      });
      return lines;
    });
    const allLines = lineGroups.flat();
    gsap.set(allLines, { y: "100%" });

    /* ---- Curtain + surface timeline ---- */
    let isOpen = false;
    let isAnimating = false;

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => {
        isAnimating = false;
      },
      onReverseComplete: () => {
        gsap.set(allLines, { y: "100%" });
        isAnimating = false;
      },
    });

    tl.to(navBgs, {
      scaleY: 1,
      duration: 0.75,
      stagger: 0.1,
      ease: "power3.inOut",
    });
    tl.to(
      navItems,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 0.75,
        ease: "power3.inOut",
      },
      "-=0.6",
    );

    const animateLinksIn = () => {
      lineGroups.forEach((lines) => {
        gsap.fromTo(
          lines,
          { y: "100%" },
          {
            y: "0%",
            duration: 0.75,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.85,
          },
        );
      });
    };

    const onToggle = () => {
      if (isAnimating) return;
      isAnimating = true;
      toggler.classList.toggle("om-open");
      if (!isOpen) {
        tl.play();
        animateLinksIn();
      } else {
        tl.reverse();
      }
      isOpen = !isOpen;
    };
    toggler.addEventListener("click", onToggle);

    return () => {
      toggler.removeEventListener("click", onToggle);
      tl.kill();
      for (const split of splits) split.revert();
    };
  }, [panelColors.join("|"), menuColor]);

  return (
    <div className="om-root" ref={rootRef}>
      <style>{styles}</style>

      {children ? <div className="om-backdrop">{children}</div> : null}

      <nav className="om-nav">
        <div className="om-logo">
          <a href={HREF}>
            <img src={logo} alt="" />
          </a>
        </div>
        <button
          type="button"
          className="om-toggler"
          ref={togglerRef}
          aria-label="Toggle menu"
          style={{ ["--om-toggler" as string]: togglerColor }}
        >
          <span />
          <span />
        </button>
      </nav>

      <div className="om-content">
        {panelColors.map((color, i) => (
          <div
            key={`panel-${i}`}
            className="om-bg"
            style={{ backgroundColor: color }}
          />
        ))}

        <div className="om-items" style={{ backgroundColor: menuColor }}>
          <div className="om-items-col">
            <div className="om-socials">
              {socials.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
            <div className="om-legal">
              {legal.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className="om-items-col">
            <div className="om-primary-links">
              {primaryLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
            <div className="om-secondary-links">
              {secondaryLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Onest:wght@100..900&display=swap");

.om-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #141414;
  font-family: "Onest", sans-serif;
}

.om-root .om-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.om-root .om-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  z-index: 2;
}

.om-root .om-logo {
  padding: 1rem;
  cursor: pointer;
}

.om-root .om-logo img {
  width: 40px;
  height: 40px;
  display: block;
}

.om-root .om-toggler {
  padding: 1rem;
  cursor: pointer;
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
}

.om-root .om-toggler span {
  width: 40px;
  height: 2px;
  background-color: var(--om-toggler, #fff);
  transition: all 0.4s ease;
}

.om-root .om-toggler.om-open span:first-child {
  transform: translateY(3.5px) rotate(45deg) scaleX(0.75);
}

.om-root .om-toggler.om-open span:nth-child(2) {
  transform: translateY(-3.5px) rotate(-45deg) scaleX(0.75);
}

.om-root .om-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 1;
}

.om-root .om-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  transform: scaleY(0);
  transform-origin: top;
  will-change: transform;
  pointer-events: none;
}

.om-root .om-items {
  display: flex;
  gap: 2rem;
  padding: 8rem;
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
  will-change: clip-path;
}

.om-root .om-items-col:nth-child(1) {
  flex: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
}

.om-root .om-items-col:nth-child(2) {
  flex: 4;
  display: flex;
  gap: 2rem;
  justify-content: space-between;
}

.om-root .om-items a {
  text-decoration: none;
  color: #fff;
  display: block;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 0.5rem;
}

.om-root .om-socials a {
  font-size: 1.25rem;
}

.om-root .om-legal a {
  font-size: 0.9rem;
  color: #318b6f;
}

.om-root .om-primary-links a {
  font-size: 3rem;
}

.om-root .om-secondary-links a {
  font-size: 1.5rem;
}

.om-root .om-content a .om-line {
  position: relative;
  will-change: transform;
}

@media (max-width: 1000px) {
  .om-root .om-content,
  .om-root .om-items {
    height: 100%;
  }

  .om-root .om-items {
    flex-direction: column;
    justify-content: center;
    padding: 0 2rem;
  }

  .om-root .om-legal,
  .om-root .om-secondary-links {
    display: none;
  }

  .om-root .om-items-col:nth-child(1),
  .om-root .om-items-col:nth-child(2) {
    flex: none;
  }
}
`;

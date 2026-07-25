"use client";

/**
 * Elastic Curtain Menu - a full-screen menu whose panel is a single SVG path
 * with a quadratic control point, so it drops in as a sagging sheet rather than
 * a rectangle. Opening runs the curve past its resting position and settles it;
 * closing flips the anchor to the bottom and lifts the sag the other way. Link
 * characters fly in from far right on an elastic ease and the contact block
 * staggers up underneath.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/elastic-curtain-menu";

export interface ElasticCurtainMenuProps {
  wordmark?: string;
  openLabel?: string;
  closeLabel?: string;
  links?: string[];
  contactLabel?: string;
  contactLines?: string[];
  addressLines?: string[];
  backgroundImage?: string;
  panelColor?: string;
  accent?: string;
}

const DEFAULT_LINKS = [
  "work",
  "services",
  "about",
  "insights",
  "careers",
  "contact",
];

export default function ElasticCurtainMenu({
  wordmark = "BLANK",
  openLabel = "Menu",
  closeLabel = "Close",
  links = DEFAULT_LINKS,
  contactLabel = "Get in touch",
  contactLines = ["studio@aryank.space", "+1 (437) 982 4412"],
  addressLines = ["42 Mercer Street", "Toronto, ON M5V"],
  backgroundImage = `${ASSET_BASE}/bg.jpg`,
  panelColor = "#f0eeee",
  accent = "#a374ff",
}: ElasticCurtainMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(SplitText);

    const navToggleMenu = root.querySelector<HTMLElement>(".ppm-toggle-menu");
    const navToggleClose = root.querySelector<HTMLElement>(".ppm-toggle-close");
    const menu = root.querySelector<HTMLElement>(".ppm-menu");
    const menuBg = root.querySelector<SVGPathElement>(".ppm-menu-path");
    const menuBgSvg = root.querySelector<SVGSVGElement>(".ppm-menu-bg-svg");
    const menuLogo = root.querySelector<HTMLElement>(".ppm-menu-logo");
    if (
      !navToggleMenu ||
      !navToggleClose ||
      !menu ||
      !menuBg ||
      !menuBgSvg ||
      !menuLogo
    ) {
      return;
    }

    const menuLinks = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".ppm-menu-col-links a"),
    );
    const menuInfoItems = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(
        ".ppm-menu-col-info p, .ppm-menu-col-info h3, .ppm-menu-col-info h6",
      ),
    );

    const svgWidth = menuBgSvg.viewBox.baseVal.width;
    const svgHeight = menuBgSvg.viewBox.baseVal.height;
    const svgCenterX = svgWidth / 2;

    const OPEN_HIDDEN = `M${svgWidth},0 Q${svgCenterX},0 0,0 L0,0 L${svgWidth},0 Z`;
    const OPEN_BULGE = `M${svgWidth},345 Q${svgCenterX},620 0,345 L0,0 L${svgWidth},0 Z`;
    const OPEN_FULL = `M${svgWidth},${svgHeight} Q${svgCenterX},${svgHeight} 0,${svgHeight} L0,0 L${svgWidth},0 Z`;
    const CLOSE_START = `M${svgWidth},0 Q${svgCenterX},0 0,0 L0,${svgHeight} L${svgWidth},${svgHeight} Z`;
    const CLOSE_BULGE = `M${svgWidth},350 Q${svgCenterX},130 0,350 L0,${svgHeight} L${svgWidth},${svgHeight} Z`;
    const CLOSE_HIDDEN = `M${svgWidth},${svgHeight} Q${svgCenterX},${svgHeight} 0,${svgHeight} L0,${svgHeight} L${svgWidth},${svgHeight} Z`;

    gsap.set(menuBg, { attr: { d: OPEN_HIDDEN } });

    const splits: SplitText[] = [];
    for (const link of menuLinks) {
      const split = new SplitText(link, {
        type: "chars",
        charsClass: "ppm-char",
      });
      splits.push(split);
      gsap.set(split.chars, { opacity: 0, x: "750%" });
    }

    gsap.set(menuInfoItems, { opacity: 0, y: 100 });

    let isOpen = false;
    let isAnimating = false;

    const openMenu = () => {
      menu.classList.add("ppm-is-open");

      gsap.to(navToggleMenu, { duration: 0.25, opacity: 0, ease: "none" });
      gsap.to(navToggleClose, {
        duration: 0.25,
        opacity: 1,
        ease: "none",
        delay: 0.25,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating = false;
        },
      });

      tl.to(menuBg, {
        duration: 0.5,
        attr: { d: OPEN_BULGE },
        ease: "power4.in",
      }).to(menuBg, {
        duration: 0.5,
        attr: { d: OPEN_FULL },
        ease: "power4.out",
      });

      tl.to(menuLogo, { duration: 0.1, opacity: 1, ease: "none" }, "-=0.75");

      tl.to(
        menuInfoItems,
        {
          duration: 0.75,
          opacity: 1,
          y: 0,
          ease: "power3.out",
          stagger: 0.075,
        },
        "-=0.35",
      );

      const menuLinksChars = splits.flatMap((s) => s.chars);

      tl.to(
        menuLinksChars,
        {
          duration: 1.5,
          x: "0%",
          ease: "elastic.out(1, 0.25)",
          stagger: 0.01,
        },
        0.45,
      );

      tl.to(
        menuLinksChars,
        {
          duration: 0.75,
          opacity: 1,
          ease: "power2.out",
          stagger: 0.01,
        },
        0.45,
      );
    };

    const closeMenu = () => {
      gsap.set(menuBg, { attr: { d: CLOSE_START } });

      gsap.to(navToggleClose, { duration: 0.3, opacity: 0, ease: "none" });
      gsap.to(navToggleMenu, {
        duration: 0.3,
        opacity: 1,
        ease: "none",
        delay: 0.25,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          menu.classList.remove("ppm-is-open");
          gsap.set(menuBg, { attr: { d: OPEN_HIDDEN } });
          for (const split of splits) {
            gsap.set(split.chars, { opacity: 0, x: "750%" });
          }
          gsap.set(menuLinks, { opacity: 1 });
          gsap.set(menuInfoItems, { opacity: 0, y: 100 });
          isAnimating = false;
        },
      });

      tl.to(menuLogo, { duration: 0.3, opacity: 0 })
        .to(menuLinks, { duration: 0.3, opacity: 0 }, "<")
        .to(menuInfoItems, { duration: 0.3, opacity: 0 }, "<");

      tl.to(
        menuBg,
        { duration: 0.5, attr: { d: CLOSE_BULGE }, ease: "power3.in" },
        "<",
      ).to(menuBg, {
        duration: 0.5,
        attr: { d: CLOSE_HIDDEN },
        ease: "power3.out",
      });
    };

    toggleRef.current = () => {
      if (isAnimating) return;
      isAnimating = true;
      isOpen = !isOpen;
      setOpen(isOpen);
      if (isOpen) {
        openMenu();
      } else {
        closeMenu();
      }
    };

    return () => {
      toggleRef.current = null;
      for (const split of splits) split.revert();
      gsap.killTweensOf([
        menuBg,
        menuLogo,
        navToggleMenu,
        navToggleClose,
        ...menuLinks,
        ...menuInfoItems,
      ]);
    };
  }, [links]);

  return (
    <div
      className="ppm-root"
      ref={rootRef}
      style={{ "--ppm-accent": accent } as React.CSSProperties}
    >
      <style>{styles}</style>
      <section
        className="ppm-hero"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="ppm-nav">
        <div className="ppm-nav-logo">
          <span>{wordmark}</span>
        </div>

        <button
          className="ppm-nav-toggle"
          type="button"
          aria-expanded={open}
          onClick={() => toggleRef.current?.()}
        >
          <p className="ppm-toggle-menu">{openLabel}</p>
          <p className="ppm-toggle-close">{closeLabel}</p>
        </button>

        <div className="ppm-menu">
          <svg
            className="ppm-menu-bg-svg"
            viewBox="0 0 1131 861"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              className="ppm-menu-path"
              fill={panelColor}
              d="M1131,0 Q565.5,0 0,0 L0,0 L1131,0 Z"
            />
          </svg>

          <div className="ppm-menu-logo">
            <span>{wordmark}</span>
          </div>

          <div className="ppm-menu-col ppm-menu-col-info">
            <p>{contactLabel}</p>
            {contactLines.map((line) => (
              <h3 key={line}>{line}</h3>
            ))}
            <br />
            {addressLines.map((line) => (
              <h6 key={line}>{line}</h6>
            ))}
          </div>

          <div className="ppm-menu-col ppm-menu-col-links">
            {links.map((link) => (
              <a href="#top" key={link}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Boldonse&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap");

.ppm-root {
  --base-100: #f0eeee;
  --base-200: var(--ppm-accent, #a374ff);
  --base-300: #222225;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Google Sans Flex", sans-serif;
  container-type: inline-size;
}
.ppm-root * { margin: 0; padding: 0; box-sizing: border-box; }
.ppm-root img { width: 100%; height: 100%; object-fit: cover; }
.ppm-root h3,
.ppm-root h6 {
  font-family: "Google Sans Flex", sans-serif;
  font-weight: 450;
  line-height: 1.35;
  letter-spacing: -2%;
}
.ppm-root h3 { font-size: clamp(1.5rem, 3cqw, 3rem); }
.ppm-root h6 { font-size: clamp(1rem, 1.25cqw, 1.5rem); }
.ppm-root p {
  text-transform: uppercase;
  font-family: "Google Sans Flex", sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.25rem;
}
.ppm-hero {
  position: relative;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
}
.ppm-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
.ppm-nav-logo,
.ppm-menu-logo {
  position: absolute;
  top: 2rem;
  left: 2rem;
  width: 6rem;
  font-family: "Boldonse", sans-serif;
  font-size: 1rem;
  line-height: 1;
  letter-spacing: -0.02em;
}
.ppm-nav-logo { color: var(--base-100); }
.ppm-menu-logo { color: var(--base-300); }
.ppm-nav-toggle {
  position: absolute;
  top: 2rem;
  right: 2rem;
  color: var(--base-100);
  cursor: pointer;
  z-index: 100;
  padding: 0.5rem;
  background: none;
  border: 0;
  font: inherit;
}
.ppm-nav-logo,
.ppm-nav-toggle {
  padding: 0.5rem;
  pointer-events: all;
}
.ppm-toggle-menu { color: var(--base-100); }
.ppm-toggle-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  color: var(--base-300);
  opacity: 0;
}
.ppm-menu {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2.5rem;
  display: flex;
  gap: 2rem;
  color: var(--base-300);
  pointer-events: none;
  z-index: 10;
}
.ppm-menu.ppm-is-open { pointer-events: all; }
.ppm-menu-bg-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}
.ppm-menu-logo { opacity: 0; padding: 0.5rem; }
.ppm-menu-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.ppm-menu-col a {
  text-decoration: none;
  color: var(--base-300);
  font-family: "Boldonse", sans-serif;
  font-size: clamp(2.5rem, 5cqw, 5rem);
  line-height: 1.35;
  display: block;
  width: max-content;
  overflow: visible;
}
.ppm-menu-col p { color: var(--base-200); margin-bottom: 1rem; }
.ppm-menu a .ppm-char,
.ppm-menu-col h3,
.ppm-menu-col h6,
.ppm-menu-col p { will-change: transform, opacity; }

@media (max-width: 1000px) {
  .ppm-menu { flex-direction: column-reverse; }
  .ppm-menu-col-links { flex: 1.5; }
}
`;

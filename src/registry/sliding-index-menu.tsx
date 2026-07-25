"use client";

/**
 * Sliding Index Menu - a full-screen menu that wipes up from the bottom edge
 * and hands the page over to an oversized link index. The whole index rail
 * slides horizontally against the pointer, so moving right pulls the far links
 * into reach, and an accent bar chases whichever link is hovered, easing its
 * position and its width at the same time. Each link swaps to a duplicate copy
 * on a per-character roll.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/sliding-index-menu";

export interface SlidingIndexMenuProps {
  toggleLabel?: string;
  navItem?: string;
  heroHeading?: string;
  links?: string[];
  leftColumn?: string[];
  rightColumn?: string[];
  menuImage?: string;
  accent?: string;
}

const DEFAULT_LINKS = ["Index", "Persona", "Biography", "Work", "Journal"];

const DEFAULT_LEFT = [
  "BLANK",
  "Shoreline Drive",
  "Oslo",
  "",
  "Edition",
  "Vol. 03",
  "",
  "Contact",
  "hello@aryank.space",
  "",
  "Direct",
  "+47 1234 567890",
];

const DEFAULT_RIGHT = [
  "Instagram",
  "Are.na",
  "Vimeo",
  "",
  "",
  "Language",
  "Norsk",
  "",
  "",
  "Credits",
  "Imprint",
  "Ref. 00492X",
];

export default function SlidingIndexMenu({
  toggleLabel = "Menu",
  navItem = "Archive",
  heroHeading = "Shaping Ideas",
  links = DEFAULT_LINKS,
  leftColumn = DEFAULT_LEFT,
  rightColumn = DEFAULT_RIGHT,
  menuImage = `${ASSET_BASE}/menu_img.jpg`,
  accent = "#fca311",
}: SlidingIndexMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(SplitText);

    const container = root.querySelector<HTMLElement>(".jam-container");
    const navToggle = root.querySelector<HTMLElement>(".jam-nav-toggle");
    const menuOverlay = root.querySelector<HTMLElement>(".jam-menu-overlay");
    const menuContent = root.querySelector<HTMLElement>(".jam-menu-content");
    const menuImageEl = root.querySelector<HTMLElement>(".jam-menu-img");
    const menuLinksWrapper = root.querySelector<HTMLElement>(
      ".jam-menu-links-wrapper",
    );
    const linkHighlighter = root.querySelector<HTMLElement>(
      ".jam-link-highlighter",
    );
    if (
      !container ||
      !navToggle ||
      !menuOverlay ||
      !menuContent ||
      !menuImageEl ||
      !menuLinksWrapper ||
      !linkHighlighter
    ) {
      return;
    }

    const isWide = () => window.innerWidth >= 1000;

    let currentX = 0;
    let targetX = 0;
    const lerpFactor = 0.05;

    let currentHighlighterX = 0;
    let targetHighlighterX = 0;
    let currentHighlighterWidth = 0;
    let targetHighlighterWidth = 0;

    let isMenuOpen = false;
    let isMenuAnimating = false;
    let frame = 0;

    const menuLinks = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".jam-menu-link a"),
    );
    const menuLinkContainers = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".jam-menu-link"),
    );

    const splits: SplitText[] = [];
    for (const link of menuLinks) {
      const copies = link.querySelectorAll("span");
      copies.forEach((copy, copyIndex) => {
        const split = new SplitText(copy, { type: "chars" });
        splits.push(split);
        for (const char of split.chars) char.classList.add("jam-char");
        if (copyIndex === 1) gsap.set(split.chars, { y: "110%" });
      });
    }

    gsap.set(menuContent, { y: "50%", opacity: 0.25 });
    gsap.set(menuImageEl, { scale: 0.5, opacity: 0.25 });
    gsap.set(menuLinks, { y: "150%" });
    gsap.set(linkHighlighter, { y: "150%" });

    const firstLink = menuLinkContainers[0];
    const firstLinkSpan = firstLink?.querySelector<HTMLElement>("a span");
    if (firstLink && firstLinkSpan) {
      const linkWidth = firstLinkSpan.offsetWidth;
      linkHighlighter.style.width = `${linkWidth}px`;
      currentHighlighterWidth = linkWidth;
      targetHighlighterWidth = linkWidth;

      const linkRect = firstLink.getBoundingClientRect();
      const menuWrapperRect = menuLinksWrapper.getBoundingClientRect();
      const initialX = linkRect.left - menuWrapperRect.left;
      currentHighlighterX = initialX;
      targetHighlighterX = initialX;
    }

    const toggleMenu = () => {
      if (isMenuAnimating) return;
      isMenuAnimating = true;

      if (!isMenuOpen) {
        gsap.to(container, {
          y: "-40%",
          opacity: 0.25,
          duration: 1.25,
          ease: "expo.out",
        });

        gsap.to(menuOverlay, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          duration: 1.25,
          ease: "expo.out",
          onComplete: () => {
            gsap.set(container, { y: "40%" });
            gsap.set(menuLinkContainers, { overflow: "visible" });
            isMenuOpen = true;
            isMenuAnimating = false;
          },
        });

        gsap.to(menuContent, {
          y: "0%",
          opacity: 1,
          duration: 1.5,
          ease: "expo.out",
        });

        gsap.to(menuImageEl, {
          scale: 1,
          opacity: 1,
          duration: 1.5,
          ease: "expo.out",
        });

        gsap.to(menuLinks, {
          y: "0%",
          duration: 1.25,
          stagger: 0.1,
          delay: 0.25,
          ease: "expo.out",
        });

        gsap.to(linkHighlighter, {
          y: "0%",
          duration: 1,
          delay: 1,
          ease: "expo.out",
        });
      } else {
        gsap.to(container, {
          y: "0%",
          opacity: 1,
          duration: 1.25,
          ease: "expo.out",
        });

        gsap.to(menuLinks, { y: "-200%", duration: 1.25, ease: "expo.out" });

        gsap.to(menuContent, {
          y: "-100%",
          opacity: 0.25,
          duration: 1.25,
          ease: "expo.out",
        });

        gsap.to(menuImageEl, {
          y: "-100%",
          opacity: 0.5,
          duration: 1.25,
          ease: "expo.out",
        });

        gsap.to(menuOverlay, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1.25,
          ease: "expo.out",
          onComplete: () => {
            gsap.set(menuOverlay, {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            });
            gsap.set(menuLinks, { y: "150%" });
            gsap.set(linkHighlighter, { y: "150%" });
            gsap.set(menuContent, { y: "50%", opacity: 0.25 });
            gsap.set(menuImageEl, { y: "0%", scale: 0.5, opacity: 0.25 });
            gsap.set(menuLinkContainers, { overflow: "hidden" });

            gsap.set(menuLinksWrapper, { x: 0 });
            currentX = 0;
            targetX = 0;

            isMenuOpen = false;
            isMenuAnimating = false;
          },
        });
      }
    };

    navToggle.addEventListener("click", toggleMenu);

    const enterHandlers: [HTMLElement, () => void][] = [];
    const leaveHandlers: [HTMLElement, () => void][] = [];

    for (const link of menuLinkContainers) {
      const onEnter = () => {
        if (!isWide()) return;

        const linkCopy = link.querySelectorAll("a span");
        const visibleChars = linkCopy[0]?.querySelectorAll(".jam-char");
        const animatedChars = linkCopy[1]?.querySelectorAll(".jam-char");

        gsap.to(visibleChars, {
          y: "-110%",
          stagger: 0.03,
          duration: 0.5,
          ease: "expo.inOut",
        });
        gsap.to(animatedChars, {
          y: "0%",
          stagger: 0.03,
          duration: 0.5,
          ease: "expo.inOut",
        });

        const linkRect = link.getBoundingClientRect();
        const menuWrapperRect = menuLinksWrapper.getBoundingClientRect();
        targetHighlighterX = linkRect.left - menuWrapperRect.left;

        const linkCopyElement = link.querySelector<HTMLElement>("a span");
        targetHighlighterWidth = linkCopyElement
          ? linkCopyElement.offsetWidth
          : link.offsetWidth;
      };

      const onLeave = () => {
        if (!isWide()) return;

        const linkCopy = link.querySelectorAll("a span");
        const visibleChars = linkCopy[0]?.querySelectorAll(".jam-char");
        const animatedChars = linkCopy[1]?.querySelectorAll(".jam-char");

        gsap.to(animatedChars, {
          y: "110%",
          stagger: 0.03,
          duration: 0.5,
          ease: "expo.inOut",
        });
        gsap.to(visibleChars, {
          y: "0%",
          stagger: 0.03,
          duration: 0.5,
          ease: "expo.inOut",
        });
      };

      link.addEventListener("mouseenter", onEnter);
      link.addEventListener("mouseleave", onLeave);
      enterHandlers.push([link, onEnter]);
      leaveHandlers.push([link, onLeave]);
    }

    const onOverlayMove = (e: MouseEvent) => {
      if (!isWide()) return;

      const overlayRect = menuOverlay.getBoundingClientRect();
      const mouseX = e.clientX - overlayRect.left;
      const viewportWidth = overlayRect.width;
      const menuLinksWrapperWidth = menuLinksWrapper.offsetWidth;

      const maxMoveLeft = 0;
      const maxMoveRight = viewportWidth - menuLinksWrapperWidth;

      const sensitivityRange = viewportWidth * 0.5;
      const startX = (viewportWidth - sensitivityRange) / 2;
      const endX = startX + sensitivityRange;

      let mousePercentage: number;
      if (mouseX <= startX) {
        mousePercentage = 0;
      } else if (mouseX >= endX) {
        mousePercentage = 1;
      } else {
        mousePercentage = (mouseX - startX) / sensitivityRange;
      }

      targetX = maxMoveLeft + mousePercentage * (maxMoveRight - maxMoveLeft);
    };
    menuOverlay.addEventListener("mousemove", onOverlayMove);

    const onWrapperLeave = () => {
      if (!firstLink || !firstLinkSpan) return;
      const linkRect = firstLink.getBoundingClientRect();
      const menuWrapperRect = menuLinksWrapper.getBoundingClientRect();
      targetHighlighterX = linkRect.left - menuWrapperRect.left;
      targetHighlighterWidth = firstLinkSpan.offsetWidth;
    };
    menuLinksWrapper.addEventListener("mouseleave", onWrapperLeave);

    const animate = () => {
      currentX += (targetX - currentX) * lerpFactor;
      currentHighlighterX +=
        (targetHighlighterX - currentHighlighterX) * lerpFactor;
      currentHighlighterWidth +=
        (targetHighlighterWidth - currentHighlighterWidth) * lerpFactor;

      gsap.to(menuLinksWrapper, {
        x: currentX,
        duration: 0.3,
        ease: "power4.out",
      });

      gsap.to(linkHighlighter, {
        x: currentHighlighterX,
        width: currentHighlighterWidth,
        duration: 0.3,
        ease: "power4.out",
      });

      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      navToggle.removeEventListener("click", toggleMenu);
      menuOverlay.removeEventListener("mousemove", onOverlayMove);
      menuLinksWrapper.removeEventListener("mouseleave", onWrapperLeave);
      for (const [el, fn] of enterHandlers) {
        el.removeEventListener("mouseenter", fn);
      }
      for (const [el, fn] of leaveHandlers) {
        el.removeEventListener("mouseleave", fn);
      }
      for (const split of splits) split.revert();
    };
  }, [links]);

  return (
    <div
      className="jam-root"
      ref={rootRef}
      style={{ "--jam-accent": accent } as React.CSSProperties}
    >
      <style>{styles}</style>
      <div className="jam-content">
        <nav className="jam-nav">
          <div className="jam-nav-toggle">
            <p>{toggleLabel}</p>
          </div>
          <div className="jam-nav-item">
            <p>{navItem}</p>
          </div>
        </nav>

        <div className="jam-menu-overlay">
          <div className="jam-menu-content">
            <div className="jam-menu-col">
              {leftColumn.map((line, i) =>
                line ? <p key={`l-${i}`}>{line}</p> : <br key={`l-${i}`} />,
              )}
            </div>
            <div className="jam-menu-col">
              {rightColumn.map((line, i) =>
                line ? <p key={`r-${i}`}>{line}</p> : <br key={`r-${i}`} />,
              )}
            </div>
          </div>

          <div className="jam-menu-img">
            <img src={menuImage} alt="" />
          </div>

          <div className="jam-menu-links-wrapper">
            {links.map((link) => (
              <div className="jam-menu-link" key={link}>
                <a href="#top">
                  <span>{link}</span>
                  <span>{link}</span>
                </a>
              </div>
            ))}

            <div className="jam-link-highlighter" />
          </div>
        </div>

        <div className="jam-container">
          <section className="jam-hero">
            <h1>{heroHeading}</h1>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.jam-root {
  --jam-dark: #1e1e1e;
  --jam-light: #fefff8;
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "DM Sans", sans-serif;
  background-color: #000;
  overflow: hidden;
  container-type: inline-size;
}
.jam-root * { margin: 0; padding: 0; box-sizing: border-box; }
.jam-content { position: relative; width: 100%; height: 100%; }
.jam-root img { width: 100%; height: 100%; object-fit: cover; }
.jam-root h1 {
  text-transform: uppercase;
  font-family: "Anton", sans-serif;
  font-size: 10rem;
  font-weight: 500;
  letter-spacing: -0.1rem;
  line-height: 0.9;
}
.jam-root p,
.jam-root a {
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;
  user-select: none;
}
.jam-container {
  position: relative;
  width: 100%;
  height: 100%;
  will-change: transform, opacity;
  z-index: 0;
}
.jam-root section {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: var(--jam-light);
  color: var(--jam-dark);
  padding: 2rem;
}
.jam-hero h1 { width: 70%; }
.jam-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  color: var(--jam-light);
  display: flex;
  justify-content: space-between;
  mix-blend-mode: difference;
  z-index: 2;
}
.jam-nav p { padding: 1rem; cursor: pointer; }
.jam-menu-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--jam-dark);
  color: var(--jam-light);
  z-index: 1;
  will-change: clip-path;
  clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
}
.jam-menu-content {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  will-change: transform, opacity;
}
.jam-menu-col:nth-child(2) { text-align: right; }
.jam-menu-img {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  will-change: transform, opacity;
}
.jam-menu-links-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  width: max-content;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  will-change: transform;
}
.jam-menu-link {
  position: relative;
  will-change: transform;
  overflow: hidden;
}
.jam-menu-link a {
  position: relative;
  color: var(--jam-light);
  font-family: "Anton", sans-serif;
  font-size: 10rem;
  font-weight: 500;
  letter-spacing: -0.2rem;
  display: inline-block;
  overflow: hidden;
}
.jam-menu-link a span:nth-child(2) {
  position: absolute;
  top: 0;
  left: 0;
}
.jam-link-highlighter {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 400px;
  height: 0.75rem;
  background-color: var(--jam-accent);
  will-change: transform, width;
}
.jam-char {
  position: relative;
  display: inline-block;
  will-change: transform;
}

@media (max-width: 1000px) {
  .jam-hero h1 { width: 100%; font-size: 4rem; }
  .jam-menu-content { top: 25%; }
  .jam-menu-img,
  .jam-link-highlighter { display: none; }
  .jam-menu-links-wrapper { flex-direction: column; gap: 0; }
  .jam-menu-link a { font-size: 4rem; letter-spacing: -0.05rem; }
}
`;

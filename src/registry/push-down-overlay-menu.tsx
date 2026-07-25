"use client";

/**
 * Push Down Overlay Menu - the menu does not sit on top of the page, it pushes
 * the page out of the way. Opening drives the whole document down a full
 * viewport while the panel wipes in from the top edge and its own content
 * slides down from half a screen above, so the two move as one sheet. Every
 * line of menu copy is masked and dropped in from above with a negative
 * stagger, and the hamburger folds into a cross on the same custom ease.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/push-down-overlay-menu";

export interface PushDownOverlayMenuProps {
  brandMark?: string;
  toggleLabel?: string;
  links?: string[];
  tags?: string[];
  location?: string;
  contactLines?: string[];
  heroHeading?: string;
  outroHeading?: string;
  bannerImage?: string;
  menuImage?: string;
  embedded?: boolean;
}

export default function PushDownOverlayMenu({
  brandMark = "B",
  toggleLabel = "Menu",
  links = ["Index", "Portfolio", "Studio", "Journal", "Connect"],
  tags = ["Web Animations", "Interactive Media", "Motion Craft"],
  location = "Toronto, Canada",
  contactLines = ["+1 437 555 0199", "hello@aryank.space"],
  heroHeading = "Modern design system made that looks timeless",
  outroHeading = "Let's build something quietly iconic",
  bannerImage = `${ASSET_BASE}/hero.jpg`,
  menuImage = `${ASSET_BASE}/menu-media.jpg`,
  embedded = true,
}: PushDownOverlayMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("pov-hop", ".87,0,.13,1");

    const scrollContent = root.querySelector<HTMLElement>(".pov-scroll");
    const container = root.querySelector<HTMLElement>(".pov-container");
    const menuToggleBtn = root.querySelector<HTMLElement>(".pov-toggle-btn");
    const menuOverlay = root.querySelector<HTMLElement>(".pov-menu-overlay");
    const menuOverlayContainer = root.querySelector<HTMLElement>(
      ".pov-menu-overlay-content",
    );
    const menuMediaWrapper = root.querySelector<HTMLElement>(
      ".pov-menu-media-wrapper",
    );
    const menuToggleLabel = root.querySelector<HTMLElement>(
      ".pov-toggle-label p",
    );
    const hamburgerIcon = root.querySelector<HTMLElement>(
      ".pov-hamburger-icon",
    );
    if (
      !scrollContent ||
      !container ||
      !menuToggleBtn ||
      !menuOverlay ||
      !menuOverlayContainer ||
      !menuMediaWrapper ||
      !menuToggleLabel ||
      !hamburgerIcon
    ) {
      return;
    }

    const lenis = embedded
      ? new Lenis({ wrapper: root, content: scrollContent })
      : new Lenis();
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const copyContainers = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".pov-menu-col"),
    );
    const splitTextByContainer: SplitText[][] = [];

    for (const textContainer of copyContainers) {
      const textElements = textContainer.querySelectorAll("a, p");
      const containerSplits: SplitText[] = [];

      for (const element of Array.from(textElements)) {
        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: "pov-line",
        });
        containerSplits.push(split);
        gsap.set(split.lines, { y: "-110%" });
      }

      splitTextByContainer.push(containerSplits);
    }

    let isMenuOpen = false;
    let isAnimating = false;
    const viewport = () => (embedded ? root.clientHeight : window.innerHeight);

    const onToggle = () => {
      if (isAnimating) return;

      if (!isMenuOpen) {
        isAnimating = true;
        lenis.stop();

        const tl = gsap.timeline();

        tl.to(
          menuToggleLabel,
          { y: "-110%", duration: 1, ease: "pov-hop" },
          "<",
        )
          .to(container, { y: viewport(), duration: 1, ease: "pov-hop" }, "<")
          .to(
            menuOverlay,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1,
              ease: "pov-hop",
            },
            "<",
          )
          .to(
            menuOverlayContainer,
            { yPercent: 0, duration: 1, ease: "pov-hop" },
            "<",
          )
          .to(
            menuMediaWrapper,
            { opacity: 1, duration: 0.75, ease: "power2.out", delay: 0.5 },
            "<",
          );

        for (const containerSplits of splitTextByContainer) {
          const copyLines = containerSplits.flatMap((split) => split.lines);
          tl.to(
            copyLines,
            { y: "0%", duration: 2, ease: "pov-hop", stagger: -0.075 },
            -0.15,
          );
        }

        hamburgerIcon.classList.add("pov-active");

        tl.call(() => {
          isAnimating = false;
        });

        isMenuOpen = true;
      } else {
        isAnimating = true;

        hamburgerIcon.classList.remove("pov-active");
        const tl = gsap.timeline();

        tl.to(container, { y: 0, duration: 1, ease: "pov-hop" })
          .to(
            menuOverlay,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: 1,
              ease: "pov-hop",
            },
            "<",
          )
          .to(
            menuOverlayContainer,
            { yPercent: -50, duration: 1, ease: "pov-hop" },
            "<",
          )
          .to(menuToggleLabel, { y: "0%", duration: 1, ease: "pov-hop" }, "<")
          .to(
            copyContainers,
            { opacity: 0.25, duration: 1, ease: "pov-hop" },
            "<",
          );

        tl.call(() => {
          for (const containerSplits of splitTextByContainer) {
            const copyLines = containerSplits.flatMap((split) => split.lines);
            gsap.set(copyLines, { y: "-110%" });
          }

          gsap.set(copyContainers, { opacity: 1 });
          gsap.set(menuMediaWrapper, { opacity: 0 });

          isAnimating = false;
          lenis.start();
        });

        isMenuOpen = false;
      }
    };

    menuToggleBtn.addEventListener("click", onToggle);

    return () => {
      cancelAnimationFrame(frame);
      menuToggleBtn.removeEventListener("click", onToggle);
      for (const containerSplits of splitTextByContainer) {
        for (const split of containerSplits) split.revert();
      }
      lenis.destroy();
    };
  }, [embedded, links, tags]);

  return (
    <div
      className={embedded ? "pov-root pov-embedded" : "pov-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <nav className="pov-nav">
        <div className="pov-menu-bar">
          <div className="pov-menu-logo">
            <span>{brandMark}</span>
          </div>
          <div className="pov-toggle-btn">
            <div className="pov-toggle-label">
              <p>{toggleLabel}</p>
            </div>
            <div className="pov-hamburger-icon">
              <span />
              <span />
            </div>
          </div>
        </div>
        <div className="pov-menu-overlay">
          <div className="pov-menu-overlay-content">
            <div className="pov-menu-media-wrapper">
              <img src={menuImage} alt="" />
            </div>
            <div className="pov-menu-content-wrapper">
              <div className="pov-menu-content-main">
                <div className="pov-menu-col">
                  {links.map((link) => (
                    <div className="pov-menu-link" key={link}>
                      <a href="#top">{link}</a>
                    </div>
                  ))}
                </div>

                <div className="pov-menu-col">
                  {tags.map((tag) => (
                    <div className="pov-menu-tag" key={tag}>
                      <a href="#top">{tag}</a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pov-menu-footer">
                <div className="pov-menu-col">
                  <p>{location}</p>
                </div>
                <div className="pov-menu-col">
                  {contactLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pov-scroll">
        <div className="pov-container">
          <section className="pov-hero">
            <h1>{heroHeading}</h1>
          </section>
          <section className="pov-banner">
            <img src={bannerImage} alt="" />
          </section>
          <section className="pov-outro">
            <h1>{outroHeading}</h1>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.pov-root {
  --bg: #171717;
  --fg: #fff;
  --menu-bg: #0f0f0f;
  --menu-fg-secondary: #5f5f5f;
  --hamburger-icon-border: rgba(255, 255, 255, 0.1);
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: var(--menu-bg);
  container-type: inline-size;
}
.pov-root.pov-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.pov-root.pov-embedded::-webkit-scrollbar { display: none; }
.pov-root * { margin: 0; padding: 0; box-sizing: border-box; }
.pov-scroll { position: relative; width: 100%; }
.pov-root img { width: 100%; height: 100%; object-fit: cover; }
.pov-root h1 {
  font-size: 7.5rem;
  font-weight: 500;
  letter-spacing: -0.2rem;
  line-height: 1;
}
.pov-root p { font-size: 0.95rem; font-weight: 500; }
.pov-root a {
  text-decoration: none;
  color: var(--fg);
  font-size: 1.5rem;
  font-weight: 500;
}
.pov-container {
  position: relative;
  background-color: var(--bg);
  color: var(--fg);
  will-change: transform;
}
.pov-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.pov-root section h1 { width: 75%; }
.pov-root section img { opacity: 0.5; }
.pov-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 2;
}
.pov-menu-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: all;
  color: var(--menu-fg-secondary);
  z-index: 2;
}
.pov-menu-logo {
  width: 2rem;
  height: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--hamburger-icon-border);
  border-radius: 0.25rem;
  color: var(--fg);
  font-size: 0.95rem;
  font-weight: 600;
}
.pov-toggle-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}
.pov-toggle-label { overflow: hidden; }
.pov-toggle-label p {
  position: relative;
  transform: translateY(0%);
  will-change: transform;
}
.pov-hamburger-icon {
  position: relative;
  width: 3rem;
  height: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--hamburger-icon-border);
  border-radius: 100%;
}
.pov-hamburger-icon span {
  position: absolute;
  width: 15px;
  height: 1.25px;
  background-color: var(--fg);
  transition: all 0.75s cubic-bezier(0.87, 0, 0.13, 1);
  transform-origin: center;
  will-change: transform;
}
.pov-hamburger-icon span:nth-child(1) { transform: translateY(-3px); }
.pov-hamburger-icon span:nth-child(2) { transform: translateY(3px); }
.pov-hamburger-icon.pov-active span:nth-child(1) {
  transform: translateY(0) rotate(45deg) scaleX(1.05);
}
.pov-hamburger-icon.pov-active span:nth-child(2) {
  transform: translateY(0) rotate(-45deg) scaleX(1.05);
}
.pov-menu-overlay,
.pov-menu-overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: var(--fg);
  overflow: hidden;
  z-index: 1;
}
.pov-menu-overlay {
  background-color: var(--menu-bg);
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
  will-change: clip-path;
}
.pov-menu-overlay-content {
  display: flex;
  transform: translateY(-50%);
  will-change: transform;
  pointer-events: all;
}
.pov-menu-media-wrapper { flex: 2; opacity: 0; will-change: opacity; }
.pov-menu-media-wrapper img { opacity: 0.25; }
.pov-menu-content-wrapper { flex: 3; position: relative; display: flex; }
.pov-menu-content-main {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.pov-menu-footer { margin: 0 auto; }
.pov-menu-content-main,
.pov-menu-footer {
  width: 75%;
  padding: 2rem;
  display: flex;
  align-items: flex-end;
  gap: 2rem;
}
.pov-menu-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.pov-menu-col:nth-child(1) { flex: 3; }
.pov-menu-col:nth-child(2) { flex: 2; }
.pov-menu-link a { font-size: 3.5rem; font-weight: 500; line-height: 1.2; }
.pov-menu-tag a,
.pov-menu-footer p { color: var(--menu-fg-secondary); }
.pov-line { position: relative; will-change: transform; }

@container (max-width: 1000px) {
  .pov-root h1 { font-size: 3rem; letter-spacing: -0.05rem; }
  .pov-root section h1 { width: 100%; }
  .pov-menu-media-wrapper { display: none; }
  .pov-menu-content-main,
  .pov-menu-footer { width: 100%; }
  .pov-menu-content-main {
    top: 50%;
    flex-direction: column;
    align-items: flex-start;
    gap: 5rem;
  }
  .pov-menu-link a { font-size: 3rem; }
  .pov-menu-tag a { font-size: 1.25rem; }
}
`;

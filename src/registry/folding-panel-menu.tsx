"use client";

/**
 * Folding Panel Menu - a strip of numbered panels pinned to the right edge that
 * unfolds into a fullscreen navigation. Tapping "Menu" widens the strip from a
 * thin column to the full frame with a custom "hop" ease; each panel's giant
 * rotated word rises letter by letter, and once open, hovering a panel swaps its
 * label for a muted alternate and clip-reveals its image. "Close" folds it back.
 * GSAP timeline + CustomEase.
 *
 * Sizes to its container (container-query units) so it fits a bounded stage or a
 * full-viewport slot. Rebuilt faithfully from a Codegrid Awwwards study.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/folding-panel-menu";

export interface FoldingPanelMenuItem {
  index: string;
  label: string;
  image: string;
}

export interface FoldingPanelMenuProps {
  items?: FoldingPanelMenuItem[];
  heroImage?: string;
  cream?: string;
  muted?: string;
  ink?: string;
  className?: string;
}

const DEFAULT_ITEMS: FoldingPanelMenuItem[] = [
  { index: "01", label: "Why", image: `${ASSET_BASE}/img1.jpg` },
  { index: "02", label: "Who", image: `${ASSET_BASE}/img2.jpg` },
  { index: "03", label: "What", image: `${ASSET_BASE}/img3.jpg` },
  { index: "04", label: "How", image: `${ASSET_BASE}/img4.jpg` },
  { index: "05", label: "Join", image: `${ASSET_BASE}/img5.jpg` },
];

export default function FoldingPanelMenu({
  items = DEFAULT_ITEMS,
  heroImage = `${ASSET_BASE}/hero.jpg`,
  cream = "#eee5d2",
  muted = "#a39b89",
  ink = "#2c221d",
  className,
}: FoldingPanelMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const openBtn = openRef.current;
    const closeBtn = closeRef.current;
    if (!root || !openBtn || !closeBtn) return;

    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "fpm-hop",
      "M0,0 C0.091,0.543 0.148,0.662 0.277,0.786 0.405,0.909 0.596,0.979 1,1 ",
    );

    let isMenuOpen = false;

    const ctx = gsap.context(() => {
      gsap.set(".fpm-close p", { y: 40 });
      gsap.set(".fpm-link p span", { y: 250 });

      const handleMenu = () => {
        gsap.to(".fpm-menu", {
          width: isMenuOpen ? "20%" : "100%",
          duration: 1,
          ease: "fpm-hop",
        });

        gsap.to(".fpm-item", {
          justifyContent: isMenuOpen ? "center" : "flex-start",
          duration: 1,
          ease: "power3.out",
        });

        gsap.to(".fpm-item-index", {
          alignItems: isMenuOpen ? "center" : "flex-start",
          duration: 1,
          ease: "power3.out",
          onComplete: () => {
            isMenuOpen = !isMenuOpen;
            root.classList.toggle("fpm-open", isMenuOpen);
          },
        });

        gsap.to(".fpm-close p", {
          y: isMenuOpen ? 40 : 0,
          duration: 1,
          ease: "power3.out",
        });

        gsap.to(".fpm-open p", {
          y: isMenuOpen ? 0 : -40,
          duration: 1,
          ease: "power3.out",
        });

        for (const item of root.querySelectorAll(".fpm-item")) {
          const letters = item.querySelectorAll(".fpm-link p span");
          gsap.to(letters, {
            delay: isMenuOpen ? 0 : 0.25,
            y: isMenuOpen ? 250 : 0,
            duration: 1,
            stagger: isMenuOpen ? -0.075 : 0.075,
            ease: "power3.out",
          });
        }
      };

      openBtn.addEventListener("click", handleMenu);
      closeBtn.addEventListener("click", handleMenu);
    }, root);

    return () => ctx.revert();
  }, [items]);

  return (
    <div
      className={className ? `fpm-root ${className}` : "fpm-root"}
      ref={rootRef}
      style={
        {
          "--fpm-cream": cream,
          "--fpm-muted": muted,
          "--fpm-ink": ink,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>

      <div className="fpm-menu">
        {items.map((item) => (
          <div className="fpm-item" key={item.index}>
            <div className="fpm-item-index">
              <p>{item.index}</p>
              <p>{item.label}</p>
            </div>
            <div className="fpm-link fpm-link-main">
              <p>
                {[...item.label].map((char, i) => (
                  <span key={`${item.index}-m-${i}`}>{char}</span>
                ))}
              </p>
            </div>
            <div className="fpm-link fpm-link-hover">
              <p>
                {[...item.label].map((char, i) => (
                  <span key={`${item.index}-h-${i}`}>{char}</span>
                ))}
              </p>
            </div>
            <div className="fpm-img">
              <img alt={item.label} draggable={false} src={item.image} />
            </div>
          </div>
        ))}

        <div className="fpm-close" ref={closeRef}>
          <p>Close</p>
        </div>
      </div>

      <div
        className="fpm-container"
        style={{ backgroundImage: `url("${heroImage}")` }}
      >
        <div className="fpm-open" ref={openRef}>
          <p>Menu</p>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..900&family=Playfair+Display:wght@400;500&display=swap");

.fpm-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: size;
  font-family: "DM Sans", sans-serif;
}

.fpm-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fpm-root p {
  margin: 0;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
  line-height: 100%;
}

.fpm-container {
  width: 100%;
  height: 100%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: cover;
}

.fpm-open {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  color: var(--fpm-cream);
}

.fpm-close {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  color: var(--fpm-muted);
}

.fpm-open,
.fpm-close {
  margin: 0.75em;
  padding: 0.75em;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  cursor: pointer;
}

.fpm-open p,
.fpm-close p {
  position: relative;
}

.fpm-menu {
  position: absolute;
  top: 0;
  right: 0;
  width: 20%;
  height: 100%;
  display: flex;
  z-index: 2;
}

.fpm-item {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  background: var(--fpm-cream);
  border-left: 1.5px solid rgba(163, 155, 137, 0.35);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  margin-left: -1px;
}

.fpm-item-index {
  height: 100%;
  padding: 1.5em 0.5em 2em 0.5em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  color: var(--fpm-muted);
}

.fpm-item-index p:nth-child(2) {
  position: relative;
  transform: rotate(-90deg);
}

.fpm-link {
  position: absolute;
  bottom: 2.5%;
  left: 55%;
  transform: translate(-50%, -50%) rotate(-90deg);
}

.fpm-item:nth-child(3) .fpm-link {
  bottom: 7.5%;
}

.fpm-link p {
  position: relative;
  display: flex;
  font-family: "Playfair Display", serif;
  font-size: clamp(72px, 26cqh, 200px);
  font-weight: 400;
  text-transform: none;
  line-height: 100%;
  transition: all 0.5s;
}

.fpm-link p span {
  position: relative;
}

.fpm-item .fpm-link-main,
.fpm-item .fpm-link-hover {
  transition: all 0.5s;
}

.fpm-link-main p {
  color: var(--fpm-ink);
}

.fpm-item .fpm-link-hover {
  left: 150%;
  color: rgba(163, 155, 137, 0.85);
}

.fpm-root.fpm-open .fpm-item:hover .fpm-link-main {
  left: -100%;
}
.fpm-root.fpm-open .fpm-item:hover .fpm-link-hover {
  left: 50%;
}

.fpm-img {
  position: absolute;
  width: 75%;
  height: 35%;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
  transition: 0.5s all cubic-bezier(0.165, 0.84, 0.44, 1);
}

.fpm-root.fpm-open .fpm-item:hover .fpm-img {
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}

@container (max-width: 900px) {
  .fpm-menu {
    flex-direction: column;
  }

  .fpm-link {
    bottom: unset;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }

  .fpm-item:nth-child(3) .fpm-link {
    bottom: unset;
  }

  .fpm-link p {
    font-size: clamp(48px, 12cqw, 80px);
  }

  .fpm-link-hover {
    display: none;
  }

  .fpm-root.fpm-open .fpm-item:hover .fpm-link-main {
    top: 50%;
    left: 50%;
  }

  .fpm-item-index {
    align-items: center;
  }

  .fpm-item-index p:nth-child(1) {
    padding: 0 0.5em;
  }

  .fpm-img {
    display: none;
  }
}
`;

"use client";

/**
 * Tilt Away Menu - opening the menu does not cover the page, it throws it. The
 * hero rotates, scales up and slides off toward the bottom right while the menu
 * panel unfolds from the opposite corner, arriving from a rotated, oversized,
 * quarter-opacity state. The clip path overshoots past the bottom edge so the
 * panel lands as a skewed sheet, links roll up from below their own baseline,
 * and hovering a link stacks a new preview image in over the last one.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/tilt-away-menu";

export interface TiltAwayMenuLink {
  label: string;
  image: string;
}

export interface TiltAwayMenuProps {
  brand?: string;
  openLabel?: string;
  closeLabel?: string;
  heroHeading?: string;
  heroImage?: string;
  links?: TiltAwayMenuLink[];
  socials?: string[];
  footerPrimary?: string;
  footerLinks?: string[];
}

const DEFAULT_LINKS: TiltAwayMenuLink[] = [
  { label: "Visions", image: `${ASSET_BASE}/img-1.jpg` },
  { label: "Core", image: `${ASSET_BASE}/img-2.jpg` },
  { label: "Signals", image: `${ASSET_BASE}/img-3.jpg` },
  { label: "Connect", image: `${ASSET_BASE}/img-4.jpg` },
];

export default function TiltAwayMenu({
  brand = "Void Construct",
  openLabel = "Menu",
  closeLabel = "Close",
  heroHeading = "Digital architecture that rises from the void.",
  heroImage = `${ASSET_BASE}/hero.jpg`,
  links = DEFAULT_LINKS,
  socials = ["Behance", "Dribbble", "LinkedIn", "Instagram"],
  footerPrimary = "Run Sequence",
  footerLinks = ["Origin", "Join Signal"],
}: TiltAwayMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const container = root.querySelector<HTMLElement>(".exo-container");
    const menuOverlay = root.querySelector<HTMLElement>(".exo-menu-overlay");
    const menuContent = root.querySelector<HTMLElement>(".exo-menu-content");
    const menuPreviewImg = root.querySelector<HTMLElement>(
      ".exo-menu-preview-img",
    );
    const openEl = root.querySelector<HTMLElement>(".exo-menu-open");
    const closeEl = root.querySelector<HTMLElement>(".exo-menu-close");
    if (
      !container ||
      !menuOverlay ||
      !menuContent ||
      !menuPreviewImg ||
      !openEl ||
      !closeEl
    ) {
      return;
    }

    const menuLinks = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".exo-link a"),
    );
    const rollTargets = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".exo-link a, .exo-social a"),
    );
    const defaultImage = links[0]?.image;

    let isOpen = false;
    let isAnimating = false;

    const cleanupPreviewImages = () => {
      const previewImages = menuPreviewImg.querySelectorAll("img");
      if (previewImages.length > 3) {
        for (let i = 0; i < previewImages.length - 3; i++) {
          menuPreviewImg.removeChild(previewImages[i]);
        }
      }
    };

    const resetPreviewImage = () => {
      menuPreviewImg.replaceChildren();
      if (!defaultImage) return;
      const defaultPreviewImg = document.createElement("img");
      defaultPreviewImg.src = defaultImage;
      defaultPreviewImg.alt = "";
      menuPreviewImg.appendChild(defaultPreviewImg);
    };

    const animateMenuToggle = (isOpening: boolean) => {
      gsap.to(isOpening ? openEl : closeEl, {
        x: -5,
        y: isOpening ? -10 : 10,
        rotation: isOpening ? -5 : 5,
        opacity: 0,
        delay: 0.25,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.to(isOpening ? closeEl : openEl, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        delay: 0.5,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const openMenu = () => {
      if (isAnimating || isOpen) return;
      isAnimating = true;

      gsap.to(container, {
        rotation: 10,
        x: 300,
        y: 450,
        scale: 1.5,
        duration: 1.25,
        ease: "power4.inOut",
      });

      animateMenuToggle(true);

      gsap.to(menuContent, {
        rotation: 0,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.25,
        ease: "power4.inOut",
      });

      gsap.to(rollTargets, {
        y: "0%",
        delay: 0.75,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.to(menuOverlay, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)",
        duration: 1.25,
        ease: "power4.inOut",
        onComplete: () => {
          isOpen = true;
          isAnimating = false;
        },
      });
    };

    const closeMenu = () => {
      if (isAnimating || !isOpen) return;
      isAnimating = true;

      gsap.to(container, {
        rotation: 0,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.25,
        ease: "power4.inOut",
      });

      animateMenuToggle(false);

      gsap.to(menuContent, {
        rotation: -15,
        x: -100,
        y: -100,
        scale: 1.5,
        opacity: 0.25,
        duration: 1.25,
        ease: "power4.inOut",
      });

      gsap.to(menuOverlay, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.25,
        ease: "power4.inOut",
        onComplete: () => {
          isOpen = false;
          isAnimating = false;
          gsap.set(rollTargets, { y: "120%" });
          resetPreviewImage();
        },
      });
    };

    toggleRef.current = () => {
      if (!isOpen) {
        openMenu();
        setOpen(true);
      } else {
        closeMenu();
        setOpen(false);
      }
    };

    const hoverHandlers: [HTMLElement, () => void][] = [];
    for (const link of menuLinks) {
      const onHover = () => {
        if (!isOpen || isAnimating) return;

        const imgSrc = link.getAttribute("data-img");
        if (!imgSrc) return;

        const previewImages = menuPreviewImg.querySelectorAll("img");
        if (
          previewImages.length > 0 &&
          previewImages[previewImages.length - 1].src.endsWith(imgSrc)
        ) {
          return;
        }

        const newPreviewImg = document.createElement("img");
        newPreviewImg.src = imgSrc;
        newPreviewImg.alt = "";
        newPreviewImg.style.opacity = "0";
        newPreviewImg.style.transform = "scale(1.25) rotate(10deg)";

        menuPreviewImg.appendChild(newPreviewImg);
        cleanupPreviewImages();

        gsap.to(newPreviewImg, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.75,
          ease: "power2.out",
        });
      };

      link.addEventListener("mouseover", onHover);
      hoverHandlers.push([link, onHover]);
    }

    return () => {
      toggleRef.current = null;
      for (const [el, fn] of hoverHandlers) {
        el.removeEventListener("mouseover", fn);
      }
      gsap.killTweensOf([
        container,
        menuOverlay,
        menuContent,
        openEl,
        closeEl,
        ...rollTargets,
      ]);
    };
  }, [links]);

  return (
    <div className="exo-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="exo-container">
        <section className="exo-hero">
          <div className="exo-hero-img">
            <img src={heroImage} alt="" />
          </div>
          <h1>{heroHeading}</h1>
        </section>
      </div>

      <div className="exo-menu-overlay">
        <div className="exo-menu-content">
          <div className="exo-menu-items">
            <div className="exo-col-lg">
              <div className="exo-menu-preview-img">
                <img src={links[0]?.image} alt="" />
              </div>
            </div>
            <div className="exo-col-sm">
              <div className="exo-menu-links">
                {links.map((link) => (
                  <div className="exo-link" key={link.label}>
                    <a href="#top" data-img={link.image}>
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>

              <div className="exo-menu-socials">
                {socials.map((social) => (
                  <div className="exo-social" key={social}>
                    <a href="#top">{social}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="exo-menu-footer">
            <div className="exo-col-lg">
              <a href="#top">{footerPrimary}</a>
            </div>
            <div className="exo-col-sm">
              {footerLinks.map((link) => (
                <a href="#top" key={link}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="exo-nav">
        <div className="exo-logo">
          <a href="#top">{brand}</a>
        </div>
        <button
          className="exo-menu-toggle"
          type="button"
          aria-expanded={open}
          onClick={() => toggleRef.current?.()}
        >
          <p className="exo-menu-open">{openLabel}</p>
          <p className="exo-menu-close">{closeLabel}</p>
        </button>
      </nav>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.exo-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Inter", sans-serif;
  background-color: #0f0f0f;
  container-type: inline-size;
}
.exo-root * { margin: 0; padding: 0; box-sizing: border-box; }
.exo-root img { width: 100%; height: 100%; object-fit: cover; }
.exo-root h1 {
  color: #fff;
  font-size: 7rem;
  font-weight: 400;
  letter-spacing: -0.2rem;
  line-height: 1;
}
.exo-root a,
.exo-root p {
  position: relative;
  text-decoration: none;
  color: #fff;
  font-size: 1rem;
  font-weight: 300;
  user-select: none;
}
.exo-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2.5em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}
.exo-logo a { font-weight: 600; }
.exo-menu-toggle {
  position: relative;
  width: 3rem;
  height: 1.5rem;
  cursor: pointer;
  background: none;
  border: 0;
  font: inherit;
}
.exo-menu-toggle p {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  will-change: transform, opacity;
}
.exo-menu-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #0f0f0f;
  z-index: 1;
  clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
}
.exo-menu-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: left bottom;
  will-change: opacity, transform;
  transform: translateX(-100px) translateY(-100px) scale(1.5) rotate(-15deg);
  opacity: 0.25;
}
.exo-menu-items,
.exo-menu-footer {
  width: 100%;
  padding: 2.5em;
  display: flex;
  gap: 2.5em;
}
.exo-col-lg { flex: 3; }
.exo-col-sm { flex: 2; }
.exo-menu-items .exo-col-lg {
  display: flex;
  justify-content: center;
  align-items: center;
}
.exo-menu-preview-img {
  position: relative;
  width: 45%;
  height: 100%;
  overflow: hidden;
}
.exo-menu-preview-img img {
  position: absolute;
  will-change: transform, opacity;
}
.exo-menu-items .exo-col-sm {
  padding: 2.5em 0;
  display: flex;
  flex-direction: column;
  gap: 2.5em;
}
.exo-menu-links,
.exo-menu-socials {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.exo-link,
.exo-social {
  padding-bottom: 6px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.exo-link a,
.exo-social a {
  display: inline-block;
  will-change: transform;
  transition: color 0.5s;
  transform: translateY(120%);
  opacity: 0.25;
}
.exo-link a { font-size: 3.5rem; letter-spacing: -0.02rem; }
.exo-social a { color: #8f8f8f; }
.exo-social a:hover { color: #fff; }
.exo-menu-footer { position: absolute; bottom: 0; }
.exo-menu-footer .exo-col-sm {
  display: flex;
  justify-content: space-between;
}
.exo-link a::after,
.exo-social a::after,
.exo-menu-footer a::after {
  position: absolute;
  content: "";
  top: 102.5%;
  left: 0;
  width: 100%;
  height: 2px;
  background: #fff;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s cubic-bezier(0.6, 0, 0.4, 1);
}
.exo-link a:hover::after,
.exo-social a:hover::after,
.exo-menu-footer a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
.exo-container {
  position: relative;
  width: 100%;
  height: 100%;
  will-change: transform;
  transform-origin: right top;
}
.exo-hero {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 2.5em;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.exo-hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
.exo-hero h1 { position: relative; width: 80%; z-index: 1; }
.exo-menu-close {
  opacity: 0;
  transform: translateX(-5px) translateY(10px) rotate(5deg);
}

@container (max-width: 900px) {
  .exo-hero h1 { width: 100%; font-size: 4rem; letter-spacing: 0; }
  .exo-menu-items .exo-col-lg { display: none; }
  .exo-link a::after,
  .exo-social a::after,
  .exo-menu-footer a::after { display: none; }
}
`;

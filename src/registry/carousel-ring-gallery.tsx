"use client";

/**
 * Carousel Ring Gallery - twenty-five cards arranged on a ring, each rotated
 * to face outward from the center. Moving the pointer tilts the whole ring on
 * two axes, and any card within range flips a half turn, scales up, and pushes
 * outward along its own radius, with the amount falling off by distance so the
 * effect reads as a wave passing through the ring. Clicking a card rotates the
 * ring so that card reaches the bottom, then scales the whole thing five times
 * and drives it down past the frame, leaving the picture filling the view with
 * its title rising in behind.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/carousel-ring-gallery";

export interface RingGalleryItem {
  title: string;
  img: string;
}

export interface CarouselRingGalleryProps {
  brand?: string;
  navAction?: string;
  footerLeft?: string;
  footerRight?: string;
  collection?: RingGalleryItem[];
  imageCount?: number;
  radius?: number;
}

const TITLES = [
  "Shadow Profile",
  "Crimson Silhouette",
  "Wavelength",
  "Noir Figure",
  "Midnight Gaze",
  "Cobalt Contrast",
  "Half-Light",
  "Scarlet Frame",
  "Pale Vision",
  "Spectral Form",
  "Monochrome Motion",
  "Platinum Edge",
  "Electric Shade",
  "Veiled Light",
  "Luminous Dark",
  "Haze Portrait",
  "Glowing Contour",
  "Dark Elegance",
  "Ruby Accent",
  "Clear Gaze",
];

const DEFAULT_COLLECTION: RingGalleryItem[] = TITLES.map((title, i) => ({
  title,
  img: `${ASSET_BASE}/img${i + 1}.jpeg`,
}));

export default function CarouselRingGallery({
  brand = "Silhouette Stock",
  navAction = "Download Assets",
  footerLeft = "Experiment 454",
  footerRight = "Made by BLANK",
  collection = DEFAULT_COLLECTION,
  imageCount = 25,
  radius = 275,
}: CarouselRingGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!collection.length) return;
    gsap.registerPlugin(SplitText);

    const gallery = root.querySelector<HTMLElement>(".ikw-gallery");
    const galleryContainer = root.querySelector<HTMLElement>(
      ".ikw-gallery-container",
    );
    const titleContainer = root.querySelector<HTMLElement>(
      ".ikw-title-container",
    );
    if (!gallery || !galleryContainer || !titleContainer) return;

    const galleryEl = gallery;
    const titleContainerEl = titleContainer;

    const cards: HTMLElement[] = [];
    const transformState: {
      currentRotation: number;
      targetRotation: number;
      currentX: number;
      targetX: number;
      currentY: number;
      targetY: number;
      currentScale: number;
      targetScale: number;
      angle: number;
    }[] = [];

    let currentTitle: HTMLElement | null = null;
    let isPreviewActive = false;
    let isTransitioning = false;
    let frame = 0;
    const splits: SplitText[] = [];

    const config = {
      sensitivity: 500,
      effectFalloff: 250,
      cardMoveAmount: 50,
      lerpFactor: 0.15,
      isMobile: window.innerWidth < 1000,
    };

    const parallaxState = {
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      currentX: 0,
      currentY: 0,
      currentZ: 0,
    };

    const clickHandlers: [HTMLElement, (e: MouseEvent) => void][] = [];

    for (let i = 0; i < imageCount; i++) {
      const angle = (i / imageCount) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const cardIndex = i % collection.length;

      const card = document.createElement("div");
      card.className = "ikw-card";
      card.dataset.index = `${i}`;
      card.dataset.title = collection[cardIndex].title;

      const img = document.createElement("img");
      img.src = collection[cardIndex].img;
      img.alt = "";
      card.appendChild(img);

      gsap.set(card, {
        x,
        y,
        rotation: (angle * 180) / Math.PI + 90,
        transformPerspective: 800,
        transformOrigin: "center center",
      });

      gallery.appendChild(card);
      cards.push(card);
      transformState.push({
        currentRotation: 0,
        targetRotation: 0,
        currentX: 0,
        targetX: 0,
        currentY: 0,
        targetY: 0,
        currentScale: 1,
        targetScale: 1,
        angle,
      });

      const onClick = (e: MouseEvent) => {
        if (!isPreviewActive && !isTransitioning) {
          togglePreview(Number.parseInt(card.dataset.index ?? "0", 10));
          e.stopPropagation();
        }
      };
      card.addEventListener("click", onClick);
      clickHandlers.push([card, onClick]);
    }

    function togglePreview(index: number) {
      isPreviewActive = true;
      isTransitioning = true;

      const angle = transformState[index].angle;
      const targetPosition = (Math.PI * 3) / 2;
      let rotationRadians = targetPosition - angle;

      if (rotationRadians > Math.PI) rotationRadians -= Math.PI * 2;
      else if (rotationRadians < -Math.PI) rotationRadians += Math.PI * 2;

      for (const state of transformState) {
        state.currentRotation = 0;
        state.targetRotation = 0;
        state.currentScale = 1;
        state.targetScale = 1;
        state.currentX = 0;
        state.targetX = 0;
        state.currentY = 0;
        state.targetY = 0;
      }

      gsap.to(galleryEl, {
        onStart: () => {
          cards.forEach((card, i) => {
            gsap.to(card, {
              x: radius * Math.cos(transformState[i].angle),
              y: radius * Math.sin(transformState[i].angle),
              rotationY: 0,
              scale: 1,
              duration: 1.25,
              ease: "power4.out",
            });
          });
        },
        scale: 5,
        y: 1300,
        rotation: (rotationRadians * 180) / Math.PI + 360,
        duration: 2,
        ease: "power4.inOut",
        onComplete: () => {
          isTransitioning = false;
        },
      });

      gsap.to(parallaxState, {
        currentX: 0,
        currentY: 0,
        currentZ: 0,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => {
          gsap.set(galleryContainer, {
            rotateX: parallaxState.currentX,
            rotateY: parallaxState.currentY,
            rotation: parallaxState.currentZ,
            transformOrigin: "center center",
          });
        },
      });

      const titleText = cards[index].dataset.title ?? "";
      const p = document.createElement("p");
      p.textContent = titleText;
      titleContainerEl.appendChild(p);
      currentTitle = p;

      const splitText = new SplitText(p, {
        type: "words",
        wordsClass: "ikw-word",
      });
      splits.push(splitText);
      const words = splitText.words;

      gsap.set(words, { y: "125%" });
      gsap.to(words, {
        y: "0%",
        duration: 0.75,
        delay: 1.25,
        stagger: 0.1,
        ease: "power4.out",
      });
    }

    const galleryScaleForWidth = () => {
      const viewportWidth = window.innerWidth;
      if (viewportWidth < 768) return 0.6;
      if (viewportWidth < 1200) return 0.8;
      return 1;
    };

    function resetGallery() {
      if (isTransitioning) return;

      isTransitioning = true;

      if (currentTitle) {
        const title = currentTitle;
        const words = title.querySelectorAll(".ikw-word");
        gsap.to(words, {
          y: "-125%",
          duration: 0.75,
          delay: 0.5,
          stagger: 0.1,
          ease: "power4.out",
          onComplete: () => {
            title.remove();
            currentTitle = null;
          },
        });
      }

      gsap.to(galleryEl, {
        scale: galleryScaleForWidth(),
        y: 0,
        x: 0,
        rotation: 0,
        duration: 2.5,
        ease: "power4.inOut",
        onComplete: () => {
          isPreviewActive = false;
          isTransitioning = false;
          Object.assign(parallaxState, {
            targetX: 0,
            targetY: 0,
            targetZ: 0,
            currentX: 0,
            currentY: 0,
            currentZ: 0,
          });
        },
      });
    }

    const handleResize = () => {
      config.isMobile = window.innerWidth < 1000;

      gsap.set(galleryEl, { scale: galleryScaleForWidth() });

      if (!isPreviewActive) {
        Object.assign(parallaxState, {
          targetX: 0,
          targetY: 0,
          targetZ: 0,
          currentX: 0,
          currentY: 0,
          currentZ: 0,
        });

        for (const state of transformState) {
          state.targetRotation = 0;
          state.currentRotation = 0;
          state.targetScale = 1;
          state.currentScale = 1;
          state.targetX = 0;
          state.currentX = 0;
          state.targetY = 0;
          state.currentY = 0;
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    const onRootClick = () => {
      if (isPreviewActive && !isTransitioning) resetGallery();
    };
    root.addEventListener("click", onRootClick);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPreviewActive && !isTransitioning) {
        resetGallery();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const onMouseMove = (e: MouseEvent) => {
      if (isPreviewActive || isTransitioning || config.isMobile) return;

      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      parallaxState.targetY = percentX * 15;
      parallaxState.targetX = -percentY * 15;
      parallaxState.targetZ = (percentX + percentY) * 5;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const dx = e.clientX - (cardRect.left + cardRect.width / 2);
        const dy = e.clientY - (cardRect.top + cardRect.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.sensitivity && !config.isMobile) {
          const flipFactor = Math.max(0, 1 - distance / config.effectFalloff);
          const angle = transformState[index].angle;
          const moveAmount = config.cardMoveAmount * flipFactor;

          transformState[index].targetRotation = 180 * flipFactor;
          transformState[index].targetScale = 1 + 0.3 * flipFactor;
          transformState[index].targetX = moveAmount * Math.cos(angle);
          transformState[index].targetY = moveAmount * Math.sin(angle);
        } else {
          transformState[index].targetRotation = 0;
          transformState[index].targetScale = 1;
          transformState[index].targetX = 0;
          transformState[index].targetY = 0;
        }
      });
    };
    root.addEventListener("mousemove", onMouseMove);

    const onMouseLeave = () => {
      if (isPreviewActive || isTransitioning) return;
      for (const state of transformState) {
        state.targetRotation = 0;
        state.targetScale = 1;
        state.targetX = 0;
        state.targetY = 0;
      }
      parallaxState.targetX = 0;
      parallaxState.targetY = 0;
      parallaxState.targetZ = 0;
    };
    root.addEventListener("mouseleave", onMouseLeave);

    const animate = () => {
      if (!isPreviewActive && !isTransitioning) {
        parallaxState.currentX +=
          (parallaxState.targetX - parallaxState.currentX) * config.lerpFactor;
        parallaxState.currentY +=
          (parallaxState.targetY - parallaxState.currentY) * config.lerpFactor;
        parallaxState.currentZ +=
          (parallaxState.targetZ - parallaxState.currentZ) * config.lerpFactor;

        gsap.set(galleryContainer, {
          rotateX: parallaxState.currentX,
          rotateY: parallaxState.currentY,
          rotation: parallaxState.currentZ,
          transformOrigin: "center center",
        });

        cards.forEach((card, index) => {
          const state = transformState[index];

          state.currentRotation +=
            (state.targetRotation - state.currentRotation) * config.lerpFactor;
          state.currentScale +=
            (state.targetScale - state.currentScale) * config.lerpFactor;
          state.currentX +=
            (state.targetX - state.currentX) * config.lerpFactor;
          state.currentY +=
            (state.targetY - state.currentY) * config.lerpFactor;

          const angle = state.angle;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          gsap.set(card, {
            x: x + state.currentX,
            y: y + state.currentY,
            rotationY: state.currentRotation,
            scale: state.currentScale,
            rotation: (angle * 180) / Math.PI + 90,
            transformOrigin: "center center",
            transformPerspective: 1000,
          });
        });
      }
      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      root.removeEventListener("click", onRootClick);
      root.removeEventListener("mousemove", onMouseMove);
      root.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("keydown", onKeyDown);
      for (const [el, fn] of clickHandlers) {
        el.removeEventListener("click", fn);
      }
      for (const split of splits) split.revert();
      gallery.replaceChildren();
      titleContainer.replaceChildren();
    };
  }, [collection, imageCount, radius]);

  return (
    <div className="ikw-root" ref={rootRef}>
      <style>{styles}</style>
      <nav className="ikw-nav">
        <a href="#top">{brand}</a>
        <p>{navAction}</p>
      </nav>

      <div className="ikw-container">
        <div className="ikw-gallery-container">
          <div className="ikw-gallery" />
        </div>
        <div className="ikw-title-container" />
      </div>

      <footer className="ikw-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.ikw-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #e3e3db;
  font-family: "Inter", sans-serif;
}
.ikw-root * { margin: 0; padding: 0; box-sizing: border-box; }
.ikw-root a,
.ikw-root p {
  text-decoration: none;
  color: #1f1f1f;
  font-family: "Inter", sans-serif;
  font-size: 15px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.02rem;
}
.ikw-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  backface-visibility: hidden;
}
.ikw-nav,
.ikw-footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}
.ikw-nav { top: 0; }
.ikw-footer { bottom: 0; }
.ikw-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.ikw-gallery-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  perspective: 2000px;
  will-change: transform;
}
.ikw-gallery {
  position: relative;
  width: 600px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center;
  will-change: transform;
}
.ikw-card {
  position: absolute;
  width: 45px;
  height: 60px;
  border-radius: 4px;
  transform-origin: center;
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: visible;
  overflow: hidden;
  cursor: pointer;
}
.ikw-title-container {
  position: absolute;
  bottom: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 42px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  z-index: 3;
}
.ikw-title-container p {
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 36px;
  letter-spacing: -0.05rem;
}
.ikw-word {
  position: relative;
  display: inline-block;
  will-change: transform;
}
`;

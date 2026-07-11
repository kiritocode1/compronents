"use client";

/**
 * Folder Preview Hover - stacked folder rows rise on hover while three photo
 * previews pop out of the folder mouth with randomized tilt.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import type * as React from "react";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/folder-preview-hover";

export interface FolderItem {
  index: string;
  name: string;
  variant: 1 | 2 | 3;
  images: [string, string, string];
}

export interface FolderPreviewHoverProps {
  folders?: FolderItem[];
  navLeft?: string;
  navRight?: string;
  background?: string;
  textColor?: string;
}

const img = (n: number) => `${ASSET_BASE}/img-${n}.jpg`;

const DEFAULT_FOLDERS: FolderItem[] = [
  {
    index: "01",
    name: "figures",
    variant: 1,
    images: [img(1), img(2), img(3)],
  },
  {
    index: "02",
    name: "persona",
    variant: 2,
    images: [img(4), img(5), img(6)],
  },
  { index: "03", name: "form", variant: 2, images: [img(7), img(8), img(9)] },
  {
    index: "04",
    name: "chromatic",
    variant: 3,
    images: [img(10), img(11), img(12)],
  },
  {
    index: "05",
    name: "mythos",
    variant: 1,
    images: [img(13), img(14), img(15)],
  },
  {
    index: "06",
    name: "kinetics",
    variant: 2,
    images: [img(16), img(17), img(18)],
  },
];

export default function FolderPreviewHover({
  folders = DEFAULT_FOLDERS,
  navLeft = "Design Ledger",
  navRight = "Experiment 0492",
  background = "#f4f7f0",
  textColor = "#0f0f0f",
}: FolderPreviewHoverProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const folderEls = root.querySelectorAll<HTMLElement>(".fph-folder");
    const folderWrappers = root.querySelectorAll<HTMLElement>(
      ".fph-folder-wrapper",
    );

    let isMobile = window.innerWidth < 1000;

    function setInitialPositions() {
      gsap.set(folderWrappers, { y: isMobile ? 0 : 25 });
    }

    const cleanups: Array<() => void> = [];

    folderEls.forEach((folder, index) => {
      const previewImages = folder.querySelectorAll(".fph-folder-preview-img");

      const onEnter = () => {
        if (isMobile) return;

        for (const siblingFolder of folderEls) {
          if (siblingFolder !== folder) {
            siblingFolder.classList.add("disabled");
          }
        }

        gsap.to(folderWrappers[index], {
          y: 0,
          duration: 0.25,
          ease: "back.out(1.7)",
        });

        previewImages.forEach((image, imgIndex) => {
          let rotation: number;
          if (imgIndex === 0) {
            rotation = gsap.utils.random(-20, -10);
          } else if (imgIndex === 1) {
            rotation = gsap.utils.random(-10, 10);
          } else {
            rotation = gsap.utils.random(10, 20);
          }

          gsap.to(image, {
            y: "-100%",
            rotation: rotation,
            duration: 0.25,
            ease: "back.out(1.7)",
            delay: imgIndex * 0.025,
          });
        });
      };

      const onLeave = () => {
        if (isMobile) return;

        for (const siblingFolder of folderEls) {
          siblingFolder.classList.remove("disabled");
        }

        gsap.to(folderWrappers[index], {
          y: 25,
          duration: 0.25,
          ease: "back.out(1.7)",
        });

        previewImages.forEach((image, imgIndex) => {
          gsap.to(image, {
            y: "0%",
            rotation: 0,
            duration: 0.25,
            ease: "back.out(1.7)",
            delay: imgIndex * 0.05,
          });
        });
      };

      folder.addEventListener("mouseenter", onEnter);
      folder.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        folder.removeEventListener("mouseenter", onEnter);
        folder.removeEventListener("mouseleave", onLeave);
      });
    });

    const onResize = () => {
      const currentBreakpoint = window.innerWidth < 1000;
      if (currentBreakpoint !== isMobile) {
        isMobile = currentBreakpoint;
        setInitialPositions();

        for (const folder of folderEls) {
          folder.classList.remove("disabled");
        }
        const allPreviewImages = root.querySelectorAll(
          ".fph-folder-preview-img",
        );
        gsap.set(allPreviewImages, { y: "0%", rotation: 0 });
      }
    };

    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    setInitialPositions();

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  const rows: FolderItem[][] = [];
  for (let i = 0; i < folders.length; i += 2) {
    rows.push(folders.slice(i, i + 2));
  }

  return (
    <section
      className="fph-root"
      ref={rootRef}
      style={
        {
          "--fph-bg": background,
          "--fph-fg": textColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <nav className="fph-nav">
        <p>{navLeft}</p>
        <p>{navRight}</p>
      </nav>
      <div className="fph-folders">
        {rows.map((row) => (
          <div className="fph-row" key={row[0]?.name}>
            {row.map((folder) => (
              <div
                className={`fph-folder variant-${folder.variant}`}
                key={folder.name}
              >
                <div className="fph-folder-preview">
                  {folder.images.map((image) => (
                    <div className="fph-folder-preview-img" key={image}>
                      <img alt="" draggable={false} src={image} />
                    </div>
                  ))}
                </div>
                <div className="fph-folder-wrapper">
                  <div className="fph-folder-index">
                    <p>{folder.index}</p>
                  </div>
                  <div className="fph-folder-name">
                    <h1>{folder.name}</h1>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.fph-root {
  --variant-1: #ffc640;
  --variant-2: #d5d9d2;
  --variant-3: #b0b3ad;
  --disabled-folder-bg: #e8ebe4;
  --disabled-folder-fg: #b0b3ad;

  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  background-color: var(--fph-bg);
  color: var(--fph-fg);
}

.fph-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fph-root h1 {
  font-family: "DM Sans", sans-serif;
  font-size: 2.75rem;
  font-weight: 400;
}

.fph-root p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.8rem;
  font-weight: 500;
}

.fph-root h1,
.fph-root p {
  transition: color 250ms ease;
  line-height: 1;
}

.fph-nav {
  position: absolute;
  top: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fph-folders {
  width: 100%;
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.fph-row {
  position: relative;
  width: 100%;
  display: flex;
}

.fph-folder {
  position: relative;
  flex: 1;
  height: 200px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.fph-row:nth-child(2) .fph-folder:nth-child(1) {
  flex: 2;
}

.fph-row:nth-child(2) .fph-folder:nth-child(2) {
  flex: 3;
}

.fph-folder-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 25rem;
  height: 100%;
  pointer-events: none;
}

.fph-folder-preview-img {
  position: absolute;
  top: 50%;
  width: 8rem;
  height: 12rem;
}

.fph-folder-preview-img:nth-child(1) {
  left: 20%;
  transform-origin: top left;
}

.fph-folder-preview-img:nth-child(2) {
  left: 50%;
  transform-origin: center;
}

.fph-folder-preview-img:nth-child(3) {
  left: 80%;
  transform-origin: top right;
}

.fph-folder-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.fph-folder-index {
  position: relative;
  width: 40%;
  padding: 0.75rem;
}

.fph-folder-index::after {
  content: "";
  position: absolute;
  top: 0;
  left: 99%;
  height: 101%;
  aspect-ratio: 1;
  clip-path: polygon(0 0, 25% 0, 100% 100%, 0% 100%);
}

.fph-folder-name {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  padding: 0 0.25rem;
  padding-left: 2rem;
}

.fph-folder-index,
.fph-folder-index::after,
.fph-folder-name {
  transition: background-color 250ms ease;
}

.fph-folder.variant-1 .fph-folder-index,
.fph-folder.variant-1 .fph-folder-index::after,
.fph-folder.variant-1 .fph-folder-name {
  background-color: var(--variant-1);
}

.fph-folder.variant-2 .fph-folder-index,
.fph-folder.variant-2 .fph-folder-index::after,
.fph-folder.variant-2 .fph-folder-name {
  background-color: var(--variant-2);
}

.fph-folder.variant-3 .fph-folder-index,
.fph-folder.variant-3 .fph-folder-index::after,
.fph-folder.variant-3 .fph-folder-name {
  background-color: var(--variant-3);
}

.fph-folder.disabled .fph-folder-index,
.fph-folder.disabled .fph-folder-index::after,
.fph-folder.disabled .fph-folder-name {
  background-color: var(--disabled-folder-bg);
}

.fph-folder.disabled p,
.fph-folder.disabled h1 {
  color: var(--disabled-folder-fg);
}

.fph-row:nth-child(1) {
  bottom: -13rem;
}

.fph-row:nth-child(2) {
  bottom: -7.5rem;
}

.fph-row:nth-child(3) {
  bottom: -2rem;
}

@media (max-width: 1000px) {
  .fph-root h1 {
    font-size: 2rem;
  }

  .fph-row {
    flex-direction: column;
    bottom: 0 !important;
  }

  .fph-folder {
    margin-bottom: -0.5rem;
  }

  .fph-folder-preview {
    display: none;
  }

  .fph-folder-name {
    padding: 0rem 2rem 2rem;
  }

  .fph-row:nth-child(2) .fph-folder.variant-2 .fph-folder-index,
  .fph-row:nth-child(2) .fph-folder.variant-2 .fph-folder-index::after,
  .fph-row:nth-child(2) .fph-folder.variant-2 .fph-folder-name {
    background-color: var(--variant-3);
  }

  .fph-row:nth-child(2) .fph-folder.variant-3 .fph-folder-index,
  .fph-row:nth-child(2) .fph-folder.variant-3 .fph-folder-index::after,
  .fph-row:nth-child(2) .fph-folder.variant-3 .fph-folder-name {
    background-color: var(--variant-2);
  }
}
`;

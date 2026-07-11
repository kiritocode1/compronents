"use client";

/**
 * Mosaic Flip — a wall of 3D cubes that flips to swap a picture.
 *
 * Each project image is sliced across a grid of cubes; the cubes idle with a
 * slow random "breathing" on the Z axis. Hovering a project name paints the
 * incoming image onto the cubes' hidden faces, then rotates the whole grid 180°
 * in a center-out stagger so the picture turns over tile-by-tile. A queue keeps
 * rapid hovers from colliding. Built with GSAP.
 *
 * The mosaic is a fixed pixel grid (tilesX × tilesY × tileSize) centered in the
 * frame — give it a box at least that large, or it clips.
 *
 * BLANK — aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

export interface MosaicProject {
  label: string;
}

export interface MosaicFlipProps {
  /** Image URLs: index 0 is the idle image, 1…N map to the projects. */
  images?: string[];
  /** Project names; project i (1-based) reveals images[i]. */
  projects?: MosaicProject[];
  tilesX?: number;
  tilesY?: number;
  tileSize?: number;
  /** Color of the cube top/bottom faces. */
  edgeColor?: string;
  background?: string;
  perspective?: number;
}

const COMPRONENTS_ASSET_BASE = "https://ui.aryank.space/assets/mosaic-flip";

const DEFAULT_IMAGES = [
  "default.jpg",
  "img1.jpg",
  "img2.jpg",
  "img3.jpg",
  "img4.jpg",
  "img5.jpg",
  "img6.jpg",
].map((f) => `${COMPRONENTS_ASSET_BASE}/${f}`);

const DEFAULT_PROJECTS: MosaicProject[] = [
  { label: "NX-09" },
  { label: "1997 Hallway Tape" },
  { label: "Deep Space" },
  { label: "Sleep Phase Anomaly" },
  { label: "Still-life.mov" },
  { label: "Monoform™" },
];

const FACE_SIDES = [
  "face-front",
  "face-rear",
  "face-right",
  "face-left",
  "face-top",
  "face-bottom",
] as const;

type TileRecord = {
  element: HTMLDivElement;
  faces: Record<string, HTMLDivElement>;
  row: number;
  col: number;
};

export default function MosaicFlip({
  images = DEFAULT_IMAGES,
  projects = DEFAULT_PROJECTS,
  tilesX = 12,
  tilesY = 9,
  tileSize = 60,
  edgeColor = "#222222",
  background = "#171717",
  perspective = 800,
}: MosaicFlipProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previewEl = previewRef.current;
    const listEl = listRef.current;
    if (!previewEl || !listEl) return;

    const previewWidth = tilesX * tileSize;
    const previewHeight = tilesY * tileSize;

    const tiles: TileRecord[] = [];
    for (let row = 0; row < tilesY; row++) {
      for (let col = 0; col < tilesX; col++) {
        const tile = document.createElement("div");
        tile.className = "mf-tile";
        const faces: Record<string, HTMLDivElement> = {};
        for (const side of FACE_SIDES) {
          const face = document.createElement("div");
          face.className = `mf-face ${side}`;
          tile.appendChild(face);
          faces[side] = face;
        }
        previewEl.appendChild(tile);
        tiles.push({ element: tile, faces, row, col });
      }
    }

    const setTileImage = (
      tile: TileRecord,
      side: string,
      imagePath: string,
    ) => {
      const face = tile.faces[side];
      face.style.backgroundImage = `url(${imagePath})`;
      face.style.backgroundSize = `${previewWidth}px ${previewHeight}px`;
      face.style.backgroundPosition = `${-(tile.col * tileSize)}px ${-(tile.row * tileSize)}px`;
    };

    for (const tile of tiles) {
      setTileImage(tile, "face-front", images[0]);
      setTileImage(tile, "face-rear", images[0]);
      setTileImage(tile, "face-right", images[0]);
      setTileImage(tile, "face-left", images[0]);
      tile.faces["face-top"].style.background = edgeColor;
      tile.faces["face-bottom"].style.background = edgeColor;
    }

    /* ---- Idle breathing ---- */
    let disposed = false;
    const breathe = (el: HTMLDivElement) => {
      if (disposed) return;
      gsap.to(el, {
        z: gsap.utils.random(-40, 40),
        duration: gsap.utils.random(0.6, 1.4),
        ease: "sine.inOut",
        onComplete: () => breathe(el),
      });
    };
    const delayedCalls = tiles.map((tile, i) =>
      gsap.delayedCall(i * 0.015, () => breathe(tile.element)),
    );

    /* ---- Reveal flips ---- */
    let activeProject = 0;
    let revealCount = 0;
    let isRevealing = false;
    let nextProject: number | null = null;
    let hoverDelay: ReturnType<typeof setTimeout> | null = null;

    const getHiddenFace = () =>
      revealCount % 2 === 0 ? "face-rear" : "face-front";

    const revealProject = (projectIndex: number) => {
      if (projectIndex === activeProject && !isRevealing) return;
      if (isRevealing) {
        nextProject = projectIndex;
        return;
      }
      if (projectIndex === activeProject) return;

      isRevealing = true;
      nextProject = null;

      const hiddenFace = getHiddenFace();
      for (const tile of tiles) {
        setTileImage(tile, hiddenFace, images[projectIndex]);
        setTileImage(tile, "face-right", images[0]);
        setTileImage(tile, "face-left", images[0]);
      }

      revealCount++;
      activeProject = projectIndex;

      gsap.to(
        tiles.map((t) => t.element),
        {
          rotateY: revealCount * 180,
          duration: 0.5,
          ease: "power3.inOut",
          stagger: {
            each: 0.05,
            from: "center",
            grid: [tilesY, tilesX],
          },
          onComplete: () => {
            isRevealing = false;
            if (nextProject !== null && nextProject !== activeProject) {
              revealProject(nextProject);
            }
          },
        },
      );
    };

    /* ---- Wiring ---- */
    const links = [...listEl.querySelectorAll<HTMLButtonElement>("button")];
    const onEnter = (link: HTMLButtonElement) => () => {
      for (const l of links) l.classList.remove("mf-active");
      link.classList.add("mf-active");
      const projectIndex = Number(link.dataset.index);
      if (hoverDelay) clearTimeout(hoverDelay);
      hoverDelay = setTimeout(() => revealProject(projectIndex), 50);
    };
    const enterHandlers = links.map((link) => {
      const handler = onEnter(link);
      link.addEventListener("mouseenter", handler);
      link.addEventListener("focus", handler);
      return { link, handler };
    });

    const onListLeave = () => {
      for (const l of links) l.classList.remove("mf-active");
      if (hoverDelay) clearTimeout(hoverDelay);
      hoverDelay = setTimeout(() => revealProject(0), 50);
    };
    listEl.addEventListener("mouseleave", onListLeave);

    return () => {
      disposed = true;
      if (hoverDelay) clearTimeout(hoverDelay);
      for (const call of delayedCalls) call.kill();
      gsap.killTweensOf(tiles.map((t) => t.element));
      for (const { link, handler } of enterHandlers) {
        link.removeEventListener("mouseenter", handler);
        link.removeEventListener("focus", handler);
      }
      listEl.removeEventListener("mouseleave", onListLeave);
      previewEl.replaceChildren();
    };
  }, [images, tilesX, tilesY, tileSize, edgeColor]);

  const depth = tileSize / 2;

  return (
    <section
      className="mf-spotlight"
      style={{ background, perspective: `${perspective}px` }}
    >
      <style>{styles}</style>
      <div
        className="mf-preview"
        ref={previewRef}
        style={{
          gridTemplateColumns: `repeat(${tilesX}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${tilesY}, ${tileSize}px)`,
          ["--mf-tile" as string]: `${tileSize}px`,
          ["--mf-depth" as string]: `${depth}px`,
        }}
      />

      <nav className="mf-list" ref={listRef}>
        {projects.map((project, i) => (
          <button type="button" key={project.label} data-index={i + 1}>
            {project.label}
          </button>
        ))}
      </nav>
    </section>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap");

.mf-spotlight {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}

.mf-spotlight .mf-preview {
  display: grid;
  transform-style: preserve-3d;
}

.mf-spotlight .mf-tile {
  width: var(--mf-tile);
  height: var(--mf-tile);
  position: relative;
  transform-style: preserve-3d;
  will-change: transform;
}

.mf-spotlight .mf-face {
  position: absolute;
  width: var(--mf-tile);
  height: var(--mf-tile);
  background-size: cover;
  background-position: center;
  backface-visibility: hidden;
}

.mf-spotlight .face-front {
  transform: translateZ(var(--mf-depth));
}
.mf-spotlight .face-rear {
  transform: rotateY(180deg) translateZ(var(--mf-depth));
}
.mf-spotlight .face-right {
  transform: rotateY(90deg) translateZ(var(--mf-depth));
}
.mf-spotlight .face-left {
  transform: rotateY(-90deg) translateZ(var(--mf-depth));
}
.mf-spotlight .face-top {
  transform: rotateX(90deg) translateZ(var(--mf-depth));
}
.mf-spotlight .face-bottom {
  transform: rotateX(-90deg) translateZ(var(--mf-depth));
}

.mf-spotlight .mf-list {
  position: absolute;
  bottom: 3rem;
  right: 3rem;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.mf-spotlight .mf-list button {
  color: #fff;
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 1rem;
  background: none;
  border: 0;
  padding: 0.125rem 0;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.3s;
  text-align: right;
}

.mf-spotlight .mf-list button:hover,
.mf-spotlight .mf-list button:focus-visible,
.mf-spotlight .mf-list button.mf-active {
  opacity: 1;
  outline: none;
}
`;

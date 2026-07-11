"use client";

/**
 * Creative Clutter - a desk of scattered objects that reflows between layouts.
 *
 * Eleven cutout props are positioned as a percentage of the desk, with a
 * headline floating among them. Three mode buttons (chaos, cleanup, notebook)
 * swap the whole arrangement, and GSAP Flip tweens every object and the heading
 * from where they were to where they land, staggered from the center.
 *
 * Pure layout math plus one Flip transition. The board reads from its own box,
 * so it embeds in a bounded demo or fills a section.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useCallback, useEffect, useRef, useState } from "react";

type ModeId = "chaos" | "cleanup" | "notebook";

interface ItemPlacement {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

interface Arrangement {
  header: { x: number; y: number; center: boolean };
  items: ItemPlacement[];
}

export interface CreativeClutterProps {
  heading?: string;
  paragraph?: string;
  /** Cutout images, in the documented object order. */
  images?: string[];
  background?: string;
  textColor?: string;
  mutedColor?: string;
  surfaceColor?: string;
  borderColor?: string;
}

const COMPRONENTS_ASSET_BASE =
  "https://ui.aryank.space/assets/creative-clutter";

const ITEM_IDS = [
  "music",
  "cd",
  "dialog",
  "folder",
  "macmini",
  "paper",
  "passport",
  "portrait",
  "appicon",
  "lighter",
  "cursor",
];

const ITEM_SIZES: Record<string, number> = {
  music: 325,
  appicon: 100,
  cd: 400,
  cursor: 125,
  dialog: 300,
  folder: 150,
  lighter: 225,
  macmini: 250,
  paper: 375,
  passport: 250,
  portrait: 375,
};

const DEFAULT_IMAGES = ITEM_IDS.map(
  (id) => `${COMPRONENTS_ASSET_BASE}/${id}.png`,
);

const ARRANGEMENTS: Record<ModeId, Arrangement> = {
  chaos: {
    header: { x: 50, y: 47.5, center: true },
    items: [
      { id: "music", x: -2.5, y: -2.5, rotation: -15 },
      { id: "appicon", x: 20, y: 15, rotation: 5 },
      { id: "cd", x: 72.5, y: 5, rotation: 0 },
      { id: "cursor", x: 72.5, y: 75, rotation: 0 },
      { id: "dialog", x: 80, y: 60, rotation: 15 },
      { id: "folder", x: 90, y: 50, rotation: 5 },
      { id: "lighter", x: 2.5, y: 45, rotation: -10 },
      { id: "macmini", x: 9.5, y: 55, rotation: 15 },
      { id: "paper", x: 5, y: 15, rotation: 10 },
      { id: "passport", x: -2.5, y: 65, rotation: -35 },
      { id: "portrait", x: 65, y: 20, rotation: -5 },
    ],
  },
  cleanup: {
    header: { x: 70, y: 37.5, center: false },
    items: [
      { id: "music", x: 76.5, y: -5, rotation: 0 },
      { id: "appicon", x: 64.5, y: 6, rotation: 0 },
      { id: "cd", x: 0, y: 47.5, rotation: 0 },
      { id: "cursor", x: 63.5, y: 23, rotation: 0 },
      { id: "dialog", x: 34.5, y: 59, rotation: 0 },
      { id: "folder", x: 24.5, y: 33, rotation: 0 },
      { id: "lighter", x: -6, y: 3.5, rotation: 0 },
      { id: "macmini", x: 82.5, y: 66, rotation: 0 },
      { id: "paper", x: 9, y: -3.5, rotation: 0 },
      { id: "passport", x: 60, y: 65.5, rotation: 0 },
      { id: "portrait", x: 36.5, y: 5.5, rotation: 0 },
    ],
  },
  notebook: {
    header: { x: 50, y: 47.5, center: true },
    items: [
      { id: "music", x: 45, y: 0.5, rotation: 20 },
      { id: "appicon", x: 65, y: 70, rotation: 25 },
      { id: "cd", x: 27.5, y: 15, rotation: 10 },
      { id: "cursor", x: 75, y: 35, rotation: 0 },
      { id: "dialog", x: 30, y: 57.5, rotation: 10 },
      { id: "folder", x: 25, y: 40, rotation: 10 },
      { id: "lighter", x: 30, y: 7.5, rotation: 30 },
      { id: "macmini", x: 50, y: 50, rotation: -5 },
      { id: "paper", x: 10, y: 10, rotation: -30 },
      { id: "passport", x: 16.5, y: 50, rotation: -20 },
      { id: "portrait", x: 57.5, y: 20, rotation: 10 },
    ],
  },
};

const MODES: { id: ModeId; label: string; icon: React.ReactNode }[] = [
  {
    id: "chaos",
    label: "Chaos",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "cleanup",
    label: "Cleanup",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
        </g>
      </svg>
    ),
  },
  {
    id: "notebook",
    label: "Notebook",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm0 0a2 2 0 0 0 2 2h11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function CreativeClutter({
  heading = "Creative Clutter",
  paragraph = "The best ideas live somewhere between a coffee stain and a half-open folder. Scattered things have a way of finding others when you stop trying to organize.",
  images = DEFAULT_IMAGES,
  background = "#f5f2ed",
  textColor = "#171717",
  mutedColor = "#5f5f5f",
  surfaceColor = "#f5f2ed",
  borderColor = "#e0dfd7",
}: CreativeClutterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<ModeId>("chaos");
  const [activeMode, setActiveMode] = useState<ModeId>("chaos");

  const applyLayout = useCallback((mode: ModeId) => {
    const desk = deskRef.current;
    const header = headerRef.current;
    if (!desk || !header) return;

    const deskWidth = desk.offsetWidth;
    const deskHeight = desk.offsetHeight;
    const layout = ARRANGEMENTS[mode];
    const isMobile = deskWidth < 1000;

    const centered = isMobile || layout.header.center;
    const offsetX = centered ? header.offsetWidth / 2 : 0;
    const offsetY = centered ? header.offsetHeight / 2 : 0;
    const headerX = isMobile ? 50 : layout.header.x;
    const headerY = isMobile ? 47.5 : layout.header.y;

    gsap.set(header, {
      x: (headerX / 100) * deskWidth - offsetX,
      y: (headerY / 100) * deskHeight - offsetY,
      rotation: 0,
    });

    for (const { id, x, y, rotation } of layout.items) {
      const el = desk.querySelector<HTMLElement>(`[data-item="${id}"]`);
      if (!el) continue;
      gsap.set(el, {
        x: (x / 100) * deskWidth,
        y: (y / 100) * deskHeight,
        width: ITEM_SIZES[id],
        height: ITEM_SIZES[id],
        rotation,
      });
    }
  }, []);

  useEffect(() => {
    gsap.registerPlugin(Flip);
    const desk = deskRef.current;
    if (!desk) return;

    applyLayout(modeRef.current);
    const resizeObserver = new ResizeObserver(() =>
      applyLayout(modeRef.current),
    );
    resizeObserver.observe(desk);
    return () => resizeObserver.disconnect();
  }, [applyLayout]);

  const selectMode = (mode: ModeId) => {
    if (mode === modeRef.current) return;
    const desk = deskRef.current;
    const header = headerRef.current;
    if (!desk || !header) return;

    const flipTargets = [
      header,
      ...desk.querySelectorAll<HTMLElement>("[data-item]"),
    ];
    const state = Flip.getState(flipTargets);
    modeRef.current = mode;
    setActiveMode(mode);
    applyLayout(mode);
    Flip.from(state, {
      duration: 1.25,
      ease: "power3.inOut",
      stagger: { amount: 0.1, from: "center" },
      absolute: true,
    });
  };

  return (
    <div
      ref={rootRef}
      className="cc-root"
      style={
        {
          "--cc-bg": background,
          "--cc-text": textColor,
          "--cc-muted": mutedColor,
          "--cc-surface": surfaceColor,
          "--cc-border": borderColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="cc-desk" ref={deskRef}>
        <div className="cc-header" ref={headerRef}>
          <h2>{heading}</h2>
          <p>{paragraph}</p>
        </div>

        {ITEM_IDS.map((id, i) => (
          <div className="cc-item" data-item={id} key={id}>
            <img src={images[i]} alt="" draggable={false} />
          </div>
        ))}

        <div className="cc-modes">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              aria-label={mode.label}
              title={mode.label}
              className={activeMode === mode.id ? "cc-active" : ""}
              onClick={() => selectMode(mode.id)}
            >
              {mode.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = `
.cc-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 520px;
  overflow: hidden;
  background: var(--cc-bg);
  color: var(--cc-text);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.cc-desk {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.cc-header {
  position: absolute;
  top: 0;
  left: 0;
  width: min(400px, 80%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: center;
  pointer-events: none;
  z-index: 10;
  will-change: transform;
}

.cc-header h2 {
  margin: 0;
  font-family: ui-serif, Georgia, serif;
  font-size: clamp(2.25rem, 6cqw, 4rem);
  font-weight: 600;
  letter-spacing: -0.02rem;
  line-height: 1;
}

.cc-header p {
  margin: 0;
  font-size: clamp(0.8rem, 2cqw, 0.95rem);
  line-height: 1.7;
  color: var(--cc-muted);
}

.cc-item {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.cc-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.cc-modes {
  position: absolute;
  bottom: 7.5%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 20;
}

.cc-modes button {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cc-muted);
  background: var(--cc-surface);
  border: 1px solid var(--cc-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 200ms ease, background 300ms ease, color 300ms ease;
}

.cc-modes button:active {
  transform: scale(0.9);
}

.cc-modes button.cc-active {
  background: var(--cc-border);
  color: var(--cc-text);
}

@media (max-width: 1000px) {
  .cc-item {
    filter: saturate(0.4);
  }
}
`;

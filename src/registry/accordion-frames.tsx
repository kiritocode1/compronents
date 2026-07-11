"use client";

/**
 * Accordion Frames — a horizontal focus accordion of image panels.
 *
 * A row of thin vertical slats sits centered in the frame. Focusing one (hover
 * on desktop, tap on mobile) springs it open to a wide panel while the rest stay
 * as slivers, and a bordered focus indicator with light "beams" running off the
 * top and bottom edges tracks the open panel. Pure React — no animation library,
 * the motion is a single CSS transition on `left` / `width`.
 *
 * Drop it full-bleed as a hero, or into any bounded, relatively-positioned box;
 * the track measures itself with a ResizeObserver and recenters.
 *
 * BLANK — aryank.space
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface AccordionFramesProps {
  /** Panel image URLs. The accordion shows as many as `desktopCount`. */
  images?: string[];
  /** How many panels to show on wide viewports. */
  desktopCount?: number;
  /** How many panels to show below `mobileBreakpoint`. */
  mobileCount?: number;
  /** Open-panel width, in px (desktop / mobile). */
  expandedWidth?: number;
  mobileExpandedWidth?: number;
  /** Resting slat width, in px. */
  collapsedWidth?: number;
  /** Gap between slats, in px. */
  gap?: number;
  /** Track height, in px (desktop / mobile). */
  panelHeight?: number;
  mobilePanelHeight?: number;
  /** Viewport width under which the mobile layout + tap-to-focus kicks in. */
  mobileBreakpoint?: number;
  /** Index of the panel open on first paint. */
  defaultFocus?: number;
  /** Draw the bordered focus indicator with the vertical beams. */
  focusIndicator?: boolean;
  /** Focus indicator + beam color. */
  accentColor?: string;
  /** Frame background color. */
  background?: string;
}

const COMPRONENTS_ASSET_BASE =
  "https://ui.aryank.space/assets/accordion-frames";

const DEFAULT_IMAGES: string[] = Array.from(
  { length: 20 },
  (_, i) => `${COMPRONENTS_ASSET_BASE}/spotlight-${i + 1}.jpg`,
);

export default function AccordionFrames({
  images = DEFAULT_IMAGES,
  desktopCount = 20,
  mobileCount = 10,
  expandedWidth = 400,
  mobileExpandedWidth = 100,
  collapsedWidth = 20,
  gap = 5,
  panelHeight = 400,
  mobilePanelHeight = 260,
  mobileBreakpoint = 1000,
  defaultFocus = 0,
  focusIndicator = true,
  accentColor = "#ffffff",
  background = "#0f0f0f",
}: AccordionFramesProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedPanel, setFocusedPanel] = useState(defaultFocus);

  const panelCount = Math.min(
    images.length,
    isMobile ? mobileCount : desktopCount,
  );
  const openWidth = isMobile ? mobileExpandedWidth : expandedWidth;
  const height = isMobile ? mobilePanelHeight : panelHeight;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(([entry]) => {
      setTrackWidth(entry.contentRect.width);
      setIsMobile(window.innerWidth < mobileBreakpoint);
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [mobileBreakpoint]);

  // Reset focus when the layout flips between mobile and desktop panel counts.
  useEffect(() => {
    setFocusedPanel(Math.min(defaultFocus, panelCount - 1));
  }, [panelCount]);

  const getPanelPosition = useCallback(
    (panelIndex: number) => {
      const totalTrackWidth =
        (panelCount - 1) * (collapsedWidth + gap) + openWidth;
      const offsetToCenter = (trackWidth - totalTrackWidth) / 2;

      let left = offsetToCenter;
      for (let i = 0; i < panelIndex; i++) {
        left += (i === focusedPanel ? openWidth : collapsedWidth) + gap;
      }
      const width = panelIndex === focusedPanel ? openWidth : collapsedWidth;
      return { left, width };
    },
    [focusedPanel, panelCount, openWidth, collapsedWidth, gap, trackWidth],
  );

  return (
    <section className="acf-spotlight" style={{ background }}>
      <style>{styles}</style>
      <div className="acf-track" ref={trackRef} style={{ height }}>
        <div className="acf-panels" style={{ height }}>
          {focusIndicator ? (
            <div
              className="acf-focus-indicator"
              style={{
                ...positionStyle(getPanelPosition(focusedPanel)),
                borderColor: accentColor,
                ["--acf-accent" as string]: accentColor,
              }}
            />
          ) : null}

          {Array.from({ length: panelCount }, (_, i) => {
            const { left, width } = getPanelPosition(i);
            return (
              <button
                type="button"
                key={`${isMobile ? "m" : "d"}-${i}`}
                className="acf-panel"
                style={{ left, width }}
                aria-label={`Focus panel ${i + 1}`}
                aria-pressed={i === focusedPanel}
                onMouseEnter={isMobile ? undefined : () => setFocusedPanel(i)}
                onFocus={isMobile ? undefined : () => setFocusedPanel(i)}
                onClick={() => setFocusedPanel(i)}
              >
                <img src={images[i % images.length]} alt="" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function positionStyle({ left, width }: { left: number; width: number }) {
  return { left, width };
}

const styles = `
.acf-spotlight {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
}

.acf-spotlight .acf-track {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  max-width: 1400px;
  transform: translate(-50%, -50%);
}

.acf-spotlight .acf-panels {
  position: relative;
  width: 100%;
}

.acf-spotlight .acf-panel {
  position: absolute;
  top: 0;
  height: 100%;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  overflow: hidden;
  cursor: pointer;
  transition: all 1s cubic-bezier(0.075, 0.82, 0.165, 1);
  will-change: left, width;
}

.acf-spotlight .acf-panel:focus-visible {
  outline: none;
}

.acf-spotlight .acf-panel img {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
}

.acf-spotlight .acf-focus-indicator {
  position: absolute;
  top: 0;
  height: 100%;
  border: 3px solid var(--acf-accent, #fff);
  transition: all 1s cubic-bezier(0.075, 0.82, 0.165, 1);
  will-change: left, width;
  pointer-events: none;
  z-index: 100;
}

.acf-spotlight .acf-focus-indicator::before,
.acf-spotlight .acf-focus-indicator::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  background: var(--acf-accent, #fff);
}

.acf-spotlight .acf-focus-indicator::before {
  bottom: 100%;
  height: 100vh;
}

.acf-spotlight .acf-focus-indicator::after {
  top: 100%;
  height: 100vh;
}

@media (max-width: 1000px) {
  .acf-spotlight .acf-panel img {
    width: 200px;
  }
}
`;

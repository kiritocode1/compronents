"use client";

import type * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/fluid-mosaic";

export interface FluidMosaicItem {
  /** Image URL, or a `{ src }` / `{ url }` object. */
  image?: string | { src?: string; url?: string };
  /** Large line, rendered last. */
  title?: string;
  /** Small uppercase line above the title. */
  caption?: string;
  /** When set, the tile renders as an anchor. */
  link?: string;
}

export interface FluidMosaicProps {
  items?: FluidMosaicItem[];
  /** How much a track swells at the cursor. 0 keeps every track even. */
  strength?: number;
  /** Width of the lens as a fraction of the grid, so how many tracks react. */
  radius?: number;
  /** Easing factor per frame. Lower trails further behind the cursor. */
  smoothness?: number;
  /** Pixels the images counter-drift inside their tiles. */
  parallax?: number;
  imageScale?: number;
  gap?: number;
  /** Tile corner radius. */
  radiusCorners?: number;
  background?: string;
  overlayColor?: string;
  /** 0 to 100. */
  overlayOpacity?: number;
  showText?: boolean;
  titleFont?: React.CSSProperties;
  captionFont?: React.CSSProperties;
  textColor?: string;
  textGap?: number;
  textPadding?: number;
  /** Root width at or below which the compact layout takes over. */
  mobileBreakpoint?: number;
  mobileColumns?: 1 | 2 | "1" | "2";
  /** Set false to freeze the grid even and skip the animation loop. */
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_ITEMS: FluidMosaicItem[] = [
  {
    image: `${ASSET_BASE}/img1.jpg`,
    title: "Editorial",
    caption: "01 / Portrait",
  },
  { image: `${ASSET_BASE}/img2.jpg`, title: "Form", caption: "02 / Study" },
  {
    image: `${ASSET_BASE}/img3.jpg`,
    title: "Motion",
    caption: "03 / Campaign",
  },
  {
    image: `${ASSET_BASE}/img4.jpg`,
    title: "Collection",
    caption: "04 / Lookbook",
  },
  {
    image: `${ASSET_BASE}/img5.jpg`,
    title: "Objects",
    caption: "05 / Archive",
  },
  { image: `${ASSET_BASE}/img6.jpg`, title: "Volume", caption: "06 / Series" },
  {
    image: `${ASSET_BASE}/img7.jpg`,
    title: "Material",
    caption: "07 / Detail",
  },
  {
    image: `${ASSET_BASE}/img8.jpg`,
    title: "Afterlight",
    caption: "08 / Story",
  },
];

const AREA_NAMES = "abcdefghijkl".split("");

/**
 * Desktop area maps, one per item count. Every layout keeps a two-by-two hero
 * in the top left so the grid reads as editorial rather than as a table.
 */
const DESKTOP_LAYOUTS: Record<number, string[]> = {
  1: ["a a a a", "a a a a", "a a a a"],
  2: ["a a b b", "a a b b", "a a b b"],
  3: ["a a b b", "a a b b", "c c c c"],
  4: ["a a b b", "a a c d", "a a c d"],
  5: ["a a b c", "a a d d", "a a e e"],
  6: ["a a b c", "a a d d", "e e f f"],
  7: ["a a b c", "a a d d", "e f f g"],
  8: ["a a b c", "a a d d", "e f g h"],
  9: ["a a b c", "a a d d", "e f g h", "i i i i"],
  10: ["a a b c", "a a d d", "e f g h", "i i j j"],
  11: ["a a b c", "a a d d", "e f g h", "i i j k"],
  12: ["a a b c", "a a d d", "e f g h", "i j k l"],
};

function desktopAreas(count: number) {
  return DESKTOP_LAYOUTS[Math.max(1, Math.min(12, count))];
}

function compactAreas(count: number, columns: number) {
  if (columns === 1) {
    return Array.from({ length: count }, (_, index) => `${AREA_NAMES[index]}`);
  }
  if (count === 1) return ["a a", "a a"];

  // The first item keeps a double-height hero, the rest pair off two per row.
  const rows = ["a a", "a a"];
  let index = 1;
  while (index < count) {
    const first = AREA_NAMES[index];
    const second = AREA_NAMES[index + 1];
    if (index + 1 < count) rows.push(`${first} ${second}`);
    else rows.push(`${first} ${first}`);
    index += 2;
  }
  return rows;
}

function sourceFromImage(image: FluidMosaicItem["image"]) {
  if (typeof image === "string") return image;
  return image?.src || image?.url || "";
}

/**
 * Track sizes for one axis. Each track is weighted by a gaussian centred on the
 * pointer, so the track under the cursor swells and its neighbours give up the
 * space. The floor keeps far tracks from collapsing to nothing.
 */
function gaussianTracks(
  pointer: number,
  count: number,
  strength: number,
  radius: number,
) {
  const safeRadius = Math.max(0.04, radius);
  const values = Array.from({ length: count }, (_, index) => {
    const center = (index + 0.5) / count;
    const distance = pointer - center;
    const influence = Math.exp(
      -(distance * distance) / (2 * safeRadius * safeRadius),
    );
    return Math.max(0.18, 1 + influence * strength);
  });
  return values.map((value) => `${value.toFixed(4)}fr`).join(" ");
}

const DEFAULT_TITLE_FONT: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontSize: 28,
  fontWeight: 600,
  lineHeight: "1.05em",
  letterSpacing: "-0.035em",
};

const DEFAULT_CAPTION_FONT: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  fontWeight: 500,
  lineHeight: "1.2em",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

export default function FluidMosaic({
  items = DEFAULT_ITEMS,
  strength = 2.4,
  radius = 0.24,
  smoothness = 0.11,
  parallax = 18,
  imageScale = 1.08,
  gap = 10,
  radiusCorners = 18,
  background = "#0D0D0D",
  overlayColor = "#000000",
  overlayOpacity = 46,
  showText = true,
  titleFont = DEFAULT_TITLE_FONT,
  captionFont = DEFAULT_CAPTION_FONT,
  textColor = "#FFFFFF",
  textGap = 5,
  textPadding = 22,
  mobileBreakpoint = 620,
  mobileColumns = 2,
  animate = true,
  className,
  style,
}: FluidMosaicProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const target = useRef({ x: 0.5, y: 0.5 });
  const current = useRef({ x: 0.5, y: 0.5 });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isCompact, setIsCompact] = useState(false);

  const visibleItems = useMemo(() => {
    const list = items?.length ? items : DEFAULT_ITEMS;
    return list.slice(0, 12);
  }, [items]);

  const safeMobileColumns = Number(mobileColumns) === 1 ? 1 : 2;

  const areas = useMemo(() => {
    if (isCompact) return compactAreas(visibleItems.length, safeMobileColumns);
    return desktopAreas(visibleItems.length);
  }, [isCompact, safeMobileColumns, visibleItems.length]);

  const columnCount = isCompact ? safeMobileColumns : 4;
  const rowCount = Math.max(1, areas.length);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const update = () => {
      const width = element.getBoundingClientRect().width;
      setIsCompact(width <= mobileBreakpoint);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mobileBreakpoint]);

  // Re-seed the tracks whenever the axis counts change, so a layout switch does
  // not leave the old column count's sizes on the grid for a frame.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const x = animate ? current.current.x : 0.5;
    const y = animate ? current.current.y : 0.5;
    grid.style.gridTemplateColumns = gaussianTracks(
      x,
      columnCount,
      animate ? strength : 0,
      radius,
    );
    grid.style.gridTemplateRows = gaussianTracks(
      y,
      rowCount,
      animate ? strength : 0,
      radius,
    );
  }, [columnCount, radius, rowCount, animate, strength]);

  useEffect(() => {
    if (!animate) return;
    let frame = 0;
    let alive = true;

    const step = () => {
      if (!alive) return;
      const ease = Math.max(0.015, Math.min(0.35, smoothness));
      current.current.x += (target.current.x - current.current.x) * ease;
      current.current.y += (target.current.y - current.current.y) * ease;

      const grid = gridRef.current;
      if (grid) {
        grid.style.gridTemplateColumns = gaussianTracks(
          current.current.x,
          columnCount,
          strength,
          radius,
        );
        grid.style.gridTemplateRows = gaussianTracks(
          current.current.y,
          rowCount,
          strength,
          radius,
        );
      }

      // Images drift against the cursor, so a swelling tile reveals more of its
      // photograph instead of just stretching the same crop.
      const offsetX = (current.current.x - 0.5) * parallax * -1;
      const offsetY = (current.current.y - 0.5) * parallax * -1;
      for (const image of imageRefs.current) {
        if (!image) continue;
        image.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${imageScale})`;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [
    columnCount,
    imageScale,
    parallax,
    radius,
    rowCount,
    animate,
    smoothness,
    strength,
  ]);

  const updatePointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!animate || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      target.current = {
        x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
      };
    },
    [animate],
  );

  const handlePointerLeave = useCallback(() => {
    target.current = { x: 0.5, y: 0.5 };
    setActiveIndex(-1);
  }, []);

  const gridStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateAreas: areas.map((row) => `"${row}"`).join(" "),
    gridTemplateColumns: gaussianTracks(
      0.5,
      columnCount,
      animate ? strength : 0,
      radius,
    ),
    gridTemplateRows: gaussianTracks(
      0.5,
      rowCount,
      animate ? strength : 0,
      radius,
    ),
    gap,
    padding: gap,
    boxSizing: "border-box",
    background,
    overflow: "hidden",
    touchAction: "pan-y",
  };

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        ...style,
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        background,
      }}
      onPointerEnter={updatePointer}
      onPointerMove={updatePointer}
      onPointerLeave={handlePointerLeave}
    >
      <div ref={gridRef} style={gridStyle}>
        {visibleItems.map((item, index) => {
          const source = sourceFromImage(item.image);
          const href = item.link;
          const isActive = activeIndex === index;
          const Wrapper = href ? "a" : "div";

          return (
            <Wrapper
              key={`${index}-${item.title || "image"}`}
              href={href || undefined}
              onPointerEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(-1)}
              aria-label={item.title || `Mosaic image ${index + 1}`}
              style={{
                gridArea: AREA_NAMES[index],
                display: "block",
                position: "relative",
                minWidth: 0,
                minHeight: 0,
                overflow: "hidden",
                borderRadius: radiusCorners,
                color: textColor,
                textDecoration: "none",
                background: "rgba(255,255,255,0.06)",
                cursor: href ? "pointer" : "default",
                transform: "translateZ(0)",
              }}
            >
              {source ? (
                <img
                  ref={(node) => {
                    imageRefs.current[index] = node;
                  }}
                  src={source}
                  alt={item.title || ""}
                  draggable={false}
                  loading={index < 2 ? "eager" : "lazy"}
                  style={{
                    position: "absolute",
                    inset: -parallax,
                    width: `calc(100% + ${parallax * 2}px)`,
                    height: `calc(100% + ${parallax * 2}px)`,
                    // The image is deliberately larger than its tile so the
                    // parallax drift never exposes an edge. Tailwind Preflight
                    // and most CSS resets ship `img { max-width: 100% }`, which
                    // would clamp that overhang away and let the bare tile show
                    // through on the trailing edge, so opt out explicitly.
                    maxWidth: "none",
                    maxHeight: "none",
                    objectFit: "cover",
                    transform: `translate3d(0, 0, 0) scale(${imageScale})`,
                    transformOrigin: "center",
                    userSelect: "none",
                    pointerEvents: "none",
                    willChange: animate ? "transform" : "auto",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.035))",
                  }}
                />
              )}

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: overlayColor,
                  opacity:
                    (overlayOpacity / 100) *
                    (showText ? (isActive ? 0.72 : 0.34) : 0),
                  transition: "opacity 320ms cubic-bezier(.2,.8,.2,1)",
                  pointerEvents: "none",
                }}
              />

              {showText && (
                <div
                  style={{
                    position: "absolute",
                    left: textPadding,
                    right: textPadding,
                    bottom: textPadding,
                    display: "flex",
                    flexDirection: "column",
                    gap: textGap,
                    pointerEvents: "none",
                    transform: isActive
                      ? "translate3d(0,0,0)"
                      : "translate3d(0,5px,0)",
                    opacity: isActive ? 1 : 0.82,
                    transition:
                      "transform 320ms cubic-bezier(.2,.8,.2,1), opacity 320ms cubic-bezier(.2,.8,.2,1)",
                  }}
                >
                  {item.caption && (
                    <div
                      style={{
                        ...captionFont,
                        color: textColor,
                        opacity: 0.72,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.caption}
                    </div>
                  )}
                  {item.title && (
                    <div
                      style={{
                        ...titleFont,
                        color: textColor,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </div>
                  )}
                </div>
              )}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

"use client";

/**
 * Scroll Tunnel 3D - an infinite depth tunnel of images.
 *
 * Images are arranged four-to-a-ring around an ellipse, stacked back along the
 * Z axis into a tunnel. Wheel, drag, and idle motion all push one scroll target
 * that is lerped into the current depth, so the camera glides forward through
 * the rings. Each layer wraps in Z (the tunnel is endless) and a per-layer black
 * overlay fades it in from the far fog and out as it passes the camera.
 *
 * No animation library: a single requestAnimationFrame loop writes transforms
 * directly. Owns its own wheel/pointer handlers so it embeds in a bounded box.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";

export interface ScrollTunnel3DProps {
  images?: string[];
  background?: string;
  scrollSpeed?: number;
  layerGap?: number;
  lerp?: number;
  perspective?: number;
  radiusX?: number;
  radiusY?: number;
  itemWidth?: number;
  itemHeight?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  title?: string;
  caption?: string;
}

const COMPRONENTS_ASSET_BASE =
  "https://ui.aryank.space/assets/scroll-tunnel-3d";

const DEFAULT_IMAGES = Array.from(
  { length: 12 },
  (_, i) => `${COMPRONENTS_ASSET_BASE}/img-${i + 1}.jpg`,
);

const wrap = (value: number, max: number) => ((value % max) + max) % max;

interface TunnelItem {
  key: string;
  src: string;
  x: number;
  y: number;
}

interface TunnelLayer {
  key: string;
  baseZ: number;
  items: TunnelItem[];
}

export default function ScrollTunnel3D({
  images = DEFAULT_IMAGES,
  background = "#000000",
  scrollSpeed = 2,
  layerGap = 2500,
  lerp = 0.07,
  perspective = 1000,
  radiusX = 400,
  radiusY = 280,
  itemWidth = 180,
  itemHeight = 220,
  autoplay = true,
  autoplaySpeed = 6,
  title,
  caption,
}: ScrollTunnel3DProps) {
  const rootRef = useRef<HTMLElement>(null);
  const layerRefs = useRef<HTMLDivElement[]>([]);

  const layers = useMemo<TunnelLayer[]>(() => {
    const total = Math.max(1, images.length);
    const contentLayerCount = Math.max(1, Math.ceil(total / 4));
    const totalLayerCount = Math.max(contentLayerCount, 6);
    const halfW = itemWidth / 2;
    const halfH = itemHeight / 2;

    return Array.from({ length: totalLayerCount }, (_, i) => {
      const imageStartIndex = (i % contentLayerCount) * 4;
      const items: TunnelItem[] = [];

      for (let j = 0; j < 4; j++) {
        const imageIndex = imageStartIndex + j;
        if (imageIndex >= total) break;

        const angle = (j / 4) * Math.PI * 2 - Math.PI / 2;
        items.push({
          key: `layer-${i}-item-${j}`,
          src: images[imageIndex],
          x: Math.cos(angle) * radiusX - halfW,
          y: Math.sin(angle) * radiusY - halfH,
        });
      }

      return { key: `layer-${i}`, baseZ: -i * layerGap, items };
    });
  }, [images, radiusX, radiusY, itemWidth, itemHeight, layerGap]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const layerEls = layerRefs.current.slice(0, layers.length);
    const totalLayerCount = layers.length;
    const tunnelDepth = totalLayerCount * layerGap;
    const visibleDepth = 3 * layerGap;
    const exitPoint = layerGap * 0.6;

    let targetScroll = layerGap * 0.3;
    let currentScroll = targetScroll;
    let lastPointerY: number | null = null;
    let frame = 0;

    const overlayFor = (z: number) => {
      if (z > exitPoint) return 1;
      if (z > 0) return z / exitPoint;
      if (z > -visibleDepth) {
        const progress = Math.abs(z) / visibleDepth;
        return progress * progress;
      }
      return 1;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      targetScroll += event.deltaY * scrollSpeed;
    };

    const onPointerDown = (event: PointerEvent) => {
      lastPointerY = event.clientY;
      root.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (lastPointerY === null) return;
      targetScroll += (lastPointerY - event.clientY) * scrollSpeed * 2;
      lastPointerY = event.clientY;
    };

    const releasePointer = () => {
      lastPointerY = null;
    };

    const render = () => {
      if (autoplay) targetScroll += autoplaySpeed;
      currentScroll += (targetScroll - currentScroll) * lerp;

      for (let i = 0; i < totalLayerCount; i++) {
        const el = layerEls[i];
        if (!el) continue;

        const z =
          wrap(layers[i].baseZ + currentScroll, tunnelDepth) -
          tunnelDepth +
          exitPoint;
        const overlay = Math.min(1, Math.max(0, overlayFor(z)));

        el.style.transform = `translateZ(${z}px)`;
        el.style.setProperty("--st-overlay", String(overlay));
        el.style.visibility = overlay >= 1 ? "hidden" : "visible";
      }

      frame = requestAnimationFrame(render);
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", releasePointer);
    root.addEventListener("pointercancel", releasePointer);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", releasePointer);
      root.removeEventListener("pointercancel", releasePointer);
    };
  }, [layers, layerGap, lerp, scrollSpeed, autoplay, autoplaySpeed]);

  return (
    <section
      ref={rootRef}
      className="st3d-root"
      style={
        {
          "--st-bg": background,
          "--st-perspective": `${perspective}px`,
          "--st-item-w": `${itemWidth}px`,
          "--st-item-h": `${itemHeight}px`,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="st3d-tunnel">
        {layers.map((layer, layerIndex) => (
          <div
            key={layer.key}
            className="st3d-layer"
            ref={(node) => {
              if (node) layerRefs.current[layerIndex] = node;
            }}
          >
            {layer.items.map((item) => (
              <div
                key={item.key}
                className="st3d-item"
                style={{ left: `${item.x}px`, top: `${item.y}px` }}
              >
                {/* biome-ignore lint/performance/noImgElement: the tunnel needs a raw cover image, not Next's layout-aware loader. */}
                <img src={item.src} alt="" draggable={false} />
                <div className="st3d-item-overlay" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {(title || caption) && (
        <div className="st3d-hud">
          {title && <p className="st3d-title">{title}</p>}
          {caption && <p className="st3d-caption">{caption}</p>}
        </div>
      )}
    </section>
  );
}

const styles = `
.st3d-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  overflow: hidden;
  background: var(--st-bg);
  perspective: var(--st-perspective);
  touch-action: none;
  cursor: grab;
  user-select: none;
}

.st3d-root:active {
  cursor: grabbing;
}

.st3d-tunnel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
}

.st3d-layer {
  position: absolute;
  will-change: transform, visibility;
}

.st3d-item {
  position: absolute;
  width: var(--st-item-w);
  height: var(--st-item-h);
  overflow: hidden;
}

.st3d-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.st3d-item-overlay {
  position: absolute;
  inset: 0;
  background: var(--st-bg);
  opacity: var(--st-overlay, 1);
  pointer-events: none;
}

.st3d-hud {
  position: absolute;
  left: clamp(1.25rem, 4vw, 3rem);
  bottom: clamp(1.25rem, 4vw, 3rem);
  z-index: 10;
  max-width: min(420px, 70%);
  pointer-events: none;
  color: #f4f4f0;
  font-family: ui-sans-serif, system-ui, sans-serif;
  mix-blend-mode: difference;
}

.st3d-title {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 2.4rem);
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.01em;
}

.st3d-caption {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  line-height: 1.5;
  opacity: 0.7;
}
`;

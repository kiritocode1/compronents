"use client";

/**
 * Pan Video Canvas - a canvas twice the size of its frame in both directions,
 * panned by the inverse of the pointer position so moving right pulls the board
 * left and you steer around a space larger than the window. The motion is a
 * plain CSS transition at two seconds on a heavy ease-out curve rather than a
 * per-frame lerp, so the board keeps gliding long after the cursor stops and
 * arrives without any physics. Each tile holds a still and a Vimeo embed scaled
 * two hundred percent behind it; hovering crossfades the still out, the video
 * in, and the title up, all on separate durations so the three do not arrive
 * together.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";

const ASSET_BASE = "https://ui.aryank.space/assets/pan-video-canvas";

export interface PanVideoItem {
  videoId: string;
  videoName: string;
  previewImg: string;
}

export interface PanVideoCanvasProps {
  /** Rows of tiles. The middle row is spaced differently by design. */
  rows?: PanVideoItem[][];
  /** Divides the pointer offset. Higher values pan less. */
  factor?: number;
}

const DEFAULT_ROWS: PanVideoItem[][] = [
  [
    {
      videoId: "509236733",
      videoName: "Sport Power Ad Campaign",
      previewImg: `${ASSET_BASE}/preview-1.jpg`,
    },
    {
      videoId: "584150509",
      videoName: "Brand Vision Promo",
      previewImg: `${ASSET_BASE}/preview-2.jpg`,
    },
    {
      videoId: "545748940",
      videoName: "Minimal Motion Graphics",
      previewImg: `${ASSET_BASE}/preview-3.jpg`,
    },
    {
      videoId: "176422498",
      videoName: "Project Momentum Highlights",
      previewImg: `${ASSET_BASE}/preview-4.jpg`,
    },
  ],
  [
    {
      videoId: "540889297",
      videoName: "Ad Strategy Execution",
      previewImg: `${ASSET_BASE}/preview-5.jpg`,
    },
    {
      videoId: "569373486",
      videoName: "Sport Drive Showcase",
      previewImg: `${ASSET_BASE}/preview-6.jpg`,
    },
    {
      videoId: "464308114",
      videoName: "Brand Essence Storytelling",
      previewImg: `${ASSET_BASE}/preview-7.jpg`,
    },
  ],
  [
    {
      videoId: "510814675",
      videoName: "Minimal Flair Presentation",
      previewImg: `${ASSET_BASE}/preview-8.jpg`,
    },
    {
      videoId: "187209770",
      videoName: "Project Pulse Documentary",
      previewImg: `${ASSET_BASE}/preview-9.jpg`,
    },
    {
      videoId: "437808118",
      videoName: "Ad Creativity Concepts",
      previewImg: `${ASSET_BASE}/preview-10.jpg`,
    },
    {
      videoId: "871750630",
      videoName: "Sport Icon Journey",
      previewImg: `${ASSET_BASE}/preview-11.jpg`,
    },
  ],
];

export default function PanVideoCanvas({
  rows = DEFAULT_ROWS,
  factor = 1,
}: PanVideoCanvasProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const gallery = galleryRef.current;
    if (!root || !gallery) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { width, height } = root.getBoundingClientRect();
      const rect = root.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;

      // Inverted on purpose: moving right pulls the board left, so the pointer
      // steers rather than drags.
      const deltaX = (centerX - (e.clientX - rect.left)) / factor;
      const deltaY = (centerY - (e.clientY - rect.top)) / factor;

      gallery.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    };

    root.addEventListener("mousemove", handleMouseMove);
    return () => root.removeEventListener("mousemove", handleMouseMove);
  }, [factor]);

  return (
    <div className="pvc-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="pvc-gallery" ref={galleryRef}>
        {rows.map((row, rowIndex) => (
          <div className="pvc-row" key={`row-${String(rowIndex)}`}>
            {row.map((item) => (
              <div className="pvc-item" key={item.videoId}>
                <div className="pvc-preview-img">
                  <img
                    alt={item.videoName}
                    draggable={false}
                    src={item.previewImg}
                  />
                </div>
                <p className="pvc-video-name">{item.videoName}</p>

                <div className="pvc-video-wrapper">
                  <ReactPlayer
                    controls={false}
                    height="100%"
                    loop
                    muted
                    playing
                    src={`https://vimeo.com/${item.videoId}`}
                    width="100%"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap");

.pvc-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: #000;
}

.pvc-root * {
  box-sizing: border-box;
}

.pvc-gallery {
  width: 200%;
  height: 200%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: transform 2000ms cubic-bezier(0.075, 0.82, 0.165, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10em;
}

.pvc-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.pvc-row:nth-child(2) {
  justify-content: space-around;
}

.pvc-item {
  position: relative;
  width: 400px;
  height: 275px;
  overflow: hidden;
  flex: none;
}

.pvc-video-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scale(2);
  transition: 0.3s all;
}

.pvc-video-wrapper > div {
  opacity: 0;
  transition: 300ms;
}

.pvc-item:hover .pvc-video-wrapper > div {
  opacity: 1;
}

.pvc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pvc-video-name {
  position: absolute;
  width: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  text-align: center;
  font-size: 30px;
  font-family: "Instrument Serif", serif;
  color: #fff;
  opacity: 0;
  transition: 0.15s;
  pointer-events: none;
  z-index: 2;
}

.pvc-item:hover .pvc-video-name {
  opacity: 1;
}

.pvc-preview-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.pvc-preview-img img {
  opacity: 1;
  transition: 300ms;
}

.pvc-item:hover .pvc-preview-img img {
  opacity: 0;
}
`;

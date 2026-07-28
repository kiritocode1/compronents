"use client";

/**
 * Filmstrip Video Player - a full-bleed player whose scrubber is a strip of
 * still frames rather than a bar. The playhead is a red rule positioned from
 * the video's own timeupdate as a percentage, with a half second linear
 * transition so it glides between the four-per-second events instead of
 * stepping. Clicking the strip seeks by ratio and moves the marker in the same
 * gesture, and the click handler stops propagation so seeking does not also
 * toggle playback: anywhere else in the frame is a play or pause target,
 * reported by a label that trails the cursor on a one second ease-out.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/filmstrip-video-player";

export interface FilmstripVideoPlayerProps {
  videoSrc?: string;
  /** Still frames laid along the scrubber. */
  frames?: string[];
  /** Labels along the top of the strip. */
  timestamps?: string[];
  playLabel?: string;
  pauseLabel?: string;
}

const DEFAULT_FRAMES = Array.from(
  { length: 9 },
  (_, i) => `${ASSET_BASE}/${i + 1}.jpg`,
);

const DEFAULT_TIMESTAMPS = Array.from({ length: 13 }, (_, i) => {
  const seconds = i * 5;
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;
});

export default function FilmstripVideoPlayer({
  videoSrc = `${ASSET_BASE}/video.mp4`,
  frames = DEFAULT_FRAMES,
  timestamps = DEFAULT_TIMESTAMPS,
  playLabel = "Play",
  pauseLabel = "Pause",
}: FilmstripVideoPlayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [label, setLabel] = useState(pauseLabel);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    const marker = root.querySelector<HTMLElement>(".fvp-marker");
    const timeline = root.querySelector<HTMLElement>(".fvp-timeline");
    const cursor = root.querySelector<HTMLElement>(".fvp-cursor");
    if (!marker || !timeline || !cursor) return;

    let isPlaying = true;

    const onTimeUpdate = () => {
      if (!video.duration) return;
      marker.style.left = `calc(${(video.currentTime / video.duration) * 100}% - 1px)`;
    };
    video.addEventListener("timeupdate", onTimeUpdate);

    // stopPropagation is load-bearing: without it a seek would also reach the
    // root handler and toggle playback in the same click.
    const onTimelineClick = (e: MouseEvent) => {
      e.stopPropagation();
      const rect = timeline.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      video.currentTime = percentage * video.duration;
      marker.style.left = `calc(${percentage * 100}% - 1px)`;
    };
    timeline.addEventListener("click", onTimelineClick);

    const onRootClick = (e: MouseEvent) => {
      if (timeline.contains(e.target as Node)) return;
      if (isPlaying) {
        video.pause();
        setLabel(playLabel);
      } else {
        video.play();
        setLabel(pauseLabel);
      }
      isPlaying = !isPlaying;
    };
    root.addEventListener("click", onRootClick);

    const onMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      cursor.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px)`;
    };
    root.addEventListener("mousemove", onMouseMove);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      timeline.removeEventListener("click", onTimelineClick);
      root.removeEventListener("click", onRootClick);
      root.removeEventListener("mousemove", onMouseMove);
    };
  }, [playLabel, pauseLabel]);

  return (
    <div className="fvp-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="fvp-video-container">
        <video autoPlay loop muted playsInline ref={videoRef}>
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      <div className="fvp-cursor">
        <p>{label}</p>
      </div>

      <div className="fvp-timeline">
        <div className="fvp-marker" />
        <div className="fvp-timestamps">
          {timestamps.map((stamp) => (
            <p key={stamp}>{stamp}</p>
          ))}
        </div>
        <div className="fvp-frames">
          {frames.map((src) => (
            <div className="fvp-frame" key={src}>
              <img alt="" draggable={false} src={src} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap");

.fvp-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Geist Mono", monospace;
  background: #000;
}

.fvp-root * {
  box-sizing: border-box;
}

.fvp-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fvp-root p {
  margin: 0;
  color: #fff;
  font-size: 13px;
}

.fvp-video-container {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.fvp-video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fvp-timeline {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 160px;
  display: flex;
  flex-direction: column;
  padding: 1em;
  gap: 0.5em;
  cursor: pointer;
  z-index: 3;
}

.fvp-timestamps {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.fvp-frames {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  gap: 1em;
  border-top: 1px dashed #fff;
  border-bottom: 1px dashed #fff;
  padding: 0.75em 0;
}

.fvp-frame {
  position: relative;
  flex: 1;
}

.fvp-frame::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  transition: 0.3s;
}

.fvp-frame:hover::after {
  background: rgba(0, 0, 0, 0);
}

.fvp-marker {
  position: absolute;
  bottom: 0.75em;
  left: 0;
  width: 2px;
  height: 150px;
  background: red;
  transition: left 0.5s linear;
  z-index: 2;
}

.fvp-marker::before {
  position: absolute;
  content: "";
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background: red;
}

.fvp-cursor {
  position: absolute;
  top: 20px;
  left: 20px;
  text-transform: uppercase;
  transition: transform 1000ms cubic-bezier(0.075, 0.82, 0.165, 1);
  pointer-events: none;
  z-index: 2;
}

@media (max-width: 900px) {
  .fvp-timeline {
    height: 100px;
  }

  .fvp-timestamps p:nth-child(2),
  .fvp-timestamps p:nth-child(3),
  .fvp-timestamps p:nth-child(5),
  .fvp-timestamps p:nth-child(6),
  .fvp-timestamps p:nth-child(8),
  .fvp-timestamps p:nth-child(9),
  .fvp-timestamps p:nth-child(11),
  .fvp-timestamps p:nth-child(12) {
    display: none;
  }

  .fvp-frames {
    gap: 0.25em;
    border-bottom: none;
  }

  .fvp-marker {
    height: 100px;
  }

  .fvp-cursor {
    display: none;
  }
}
`;

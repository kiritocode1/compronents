"use client";

/**
 * Vinyl Orbit Player - a spinning record with curved headline paths.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/vinyl-orbit-player";

export interface VinylOrbitPlayerProps {
  coverImage?: string;
  diskImage?: string;
  primaryText?: string;
  secondaryText?: string;
  background?: string;
  textColor?: string;
}

export default function VinylOrbitPlayer({
  coverImage = `${ASSET_BASE}/sample-cover.jpg`,
  diskImage = `${ASSET_BASE}/disk.png`,
  primaryText = "Fly to the moon now",
  secondaryText = "Throwback Music Vol",
  background = "#000000",
  textColor = "#ffffff",
}: VinylOrbitPlayerProps) {
  const repeated = [0, 1, 2];

  return (
    <section
      className="vop-root"
      style={
        {
          "--vop-bg": background,
          "--vop-text": textColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <svg
        className="vop-primary"
        width="800px"
        height="600px"
        viewBox="0 0 350 350"
        aria-hidden="true"
        role="presentation"
      >
        <defs>
          <path
            id="vop-primary-path"
            d="M -393 405 C -53 405 -73 5 177 5 C 427 5 407 405 747 405"
          />
        </defs>
        <text>
          {repeated.map((index) => (
            <textPath href="#vop-primary-path" key={index} startOffset="-25%">
              {primaryText}
              <animate
                attributeName="startOffset"
                begin={`${index * 2}s`}
                dur="6s"
                from="-25%"
                repeatCount="indefinite"
                to="100%"
              />
            </textPath>
          ))}
        </text>
      </svg>
      <svg
        className="vop-secondary"
        width="600px"
        height="600px"
        viewBox="0 0 350 350"
        aria-hidden="true"
        role="presentation"
      >
        <defs>
          <path
            id="vop-secondary-path"
            d="M -393 60 C -53 60 -70 365 180 365 C 421 352 407 60 725 56"
          />
        </defs>
        {/* source sets dominant-baseline "end", an invalid value browsers treat as auto */}
        <text x="50%" y="50%" textAnchor="middle">
          <textPath href="#vop-secondary-path" startOffset="37%">
            {secondaryText}
          </textPath>
        </text>
      </svg>
      <div className="vop-disk">
        <img alt="" draggable={false} src={diskImage} />
        <div className="vop-cover">
          <img alt="" draggable={false} src={coverImage} />
        </div>
      </div>
    </section>
  );
}

const styles = `
@font-face {
  font-family: "BLANK Vinyl Display";
  src: url("${ASSET_BASE}/fonts/primary-display.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "BLANK Vinyl Label";
  src: url("${ASSET_BASE}/fonts/neue-montreal-medium.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.vop-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 620px;
  overflow: hidden;
  background: var(--vop-bg);
}

.vop-root svg {
  position: absolute;
  top: 50%;
  left: 50%;
  overflow: visible;
  transform: translate(-50%, -50%);
}

.vop-root path {
  fill: transparent;
}

.vop-root text,
.vop-root textPath {
  fill: var(--vop-text);
  text-transform: uppercase;
}

.vop-primary {
  font-family: "Tusker Grotesk", "BLANK Vinyl Display", sans-serif;
  font-size: 46px;
}

.vop-secondary {
  font-family: "PP Neue Montreal", "BLANK Vinyl Label", sans-serif;
  font-size: 20px;
}

.vop-disk {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 550px;
  height: 550px;
  border-radius: 100%;
  transform: translate(-50%, -50%);
  animation: vop-spin 2s linear infinite;
}

.vop-disk > img,
.vop-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
}

.vop-cover {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 250px;
  height: 250px;
  overflow: hidden;
  border-radius: 100%;
  transform: translate(-50%, -50%);
}

@keyframes vop-spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
`;

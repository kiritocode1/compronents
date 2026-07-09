"use client";

/**
 * Vinyl Orbit Player - a spinning record with curved headline paths.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";

const ASSET_BASE = "https://compronents.dev/assets/vinyl-orbit-player";

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
            <textPath
              className="vop-marquee"
              href="#vop-primary-path"
              key={index}
              startOffset="-25%"
            >
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
        <text>
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
.vop-root {
  position: relative;
  display: grid;
  min-height: 620px;
  place-items: center;
  overflow: hidden;
  background: var(--vop-bg);
  color: var(--vop-text);
  font-family: "Geist", "Inter", system-ui, sans-serif;
}

.vop-root svg {
  position: absolute;
  top: 50%;
  left: 50%;
  overflow: visible;
  fill: transparent;
  transform: translate(-50%, -50%);
}

.vop-primary {
  width: min(82vw, 820px);
}

.vop-secondary {
  width: min(62vw, 620px);
}

.vop-root text,
.vop-root textPath {
  fill: var(--vop-text);
  text-transform: uppercase;
}

.vop-primary text {
  font-size: 46px;
  font-weight: 800;
  letter-spacing: 0;
}

.vop-secondary text {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.03em;
}

.vop-disk {
  position: relative;
  width: min(54vw, 550px);
  aspect-ratio: 1;
  border-radius: 999px;
  animation: vop-spin 2.4s linear infinite;
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
  width: 45%;
  aspect-ratio: 1;
  overflow: hidden;
  border: 2px solid rgb(255 255 255 / 0.16);
  border-radius: 999px;
  transform: translate(-50%, -50%);
}

@keyframes vop-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .vop-root {
    min-height: 520px;
  }

  .vop-disk {
    width: min(76vw, 430px);
  }
}
`;

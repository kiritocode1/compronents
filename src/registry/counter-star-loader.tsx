"use client";

/**
 * Counter Star Loader - a one-shot loader: two odometer columns roll their
 * digits while the whole counter walks across the bottom of the screen in six
 * steps, then three four-point stars scale up in sequence to wipe the screen
 * (white, lime, black), and the headline swings in from a 3D Y-rotation as the
 * site info lines and a toggle button pop in.
 *
 * Fills its container, so it drops into any bounded box or a full-screen
 * section. Plays once on mount; no scroll needed.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const STAR_PATH =
  "M75.9817 0L77.25 34.2209C78.0259 55.1571 94.8249 71.9475 115.762 72.7127L150.982 74L115.762 75.2873C94.8249 76.0525 78.0259 92.8429 77.25 113.779L75.9817 148L74.7134 113.779C73.9375 92.8429 57.1385 76.0525 36.2019 75.2873L0.981689 74L36.2018 72.7127C57.1384 71.9475 73.9375 55.1571 74.7134 34.2209L75.9817 0Z";

export interface CounterStarLoaderProps {
  digitsLeft?: [number, number, number, number, number, number];
  digitsRight?: [number, number, number, number, number, number];
  headline?: string;
  infoLines?: string[];
  revealerColors?: [string, string, string];
}

const DEFAULT_LEFT: [number, number, number, number, number, number] = [
  9, 8, 7, 4, 2, 0,
];
const DEFAULT_RIGHT: [number, number, number, number, number, number] = [
  9, 5, 9, 7, 4, 0,
];

function StarSvg({ fill }: { fill: string }) {
  return (
    <svg
      fill="none"
      height="148"
      viewBox="0 0 151 148"
      width="151"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={STAR_PATH} fill={fill} />
    </svg>
  );
}

export default function CounterStarLoader({
  digitsLeft = DEFAULT_LEFT,
  digitsRight = DEFAULT_RIGHT,
  headline = "HauteMuse",
  infoLines = ["Digital & Brand Design", "Photography & Film Production"],
  revealerColors = ["#ffffff", "#CDFD50", "#000000"],
}: CounterStarLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const windowWidth = root.clientWidth || window.innerWidth;
    const wrapperWidth = 180;
    const finalPosition = windowWidth - wrapperWidth;
    const stepDistance = finalPosition / 6;

    const q = (sel: string) => root.querySelectorAll(sel);
    const tl = gsap.timeline();
    const extra: gsap.core.Tween[] = [];

    tl.to(q(".csl-count"), {
      x: -900,
      duration: 0.85,
      delay: 0.5,
      ease: "power4.inOut",
    });

    for (let i = 1; i <= 6; i++) {
      const xPosition = -900 + i * 180;
      tl.to(q(".csl-count"), {
        x: xPosition,
        duration: 0.85,
        ease: "power4.inOut",
        onStart: () => {
          extra.push(
            gsap.to(q(".csl-count-wrapper"), {
              x: stepDistance * i,
              duration: 0.85,
              ease: "power4.inOut",
            }),
          );
        },
      });
    }

    gsap.set(q(".csl-revealer svg"), { scale: 0 });

    const delays = [6, 6.5, 7];
    q(".csl-revealer svg").forEach((el, i) => {
      extra.push(
        gsap.to(el, {
          scale: 45,
          duration: 1.5,
          ease: "power4.inOut",
          delay: delays[i],
          onComplete: () => {
            if (i === delays.length - 1) {
              const loader = root.querySelector<HTMLElement>(".csl-loader");
              if (loader) loader.style.display = "none";
            }
          },
        }),
      );
    });

    extra.push(
      gsap.to(q(".csl-header h1"), {
        onStart: () => {
          extra.push(
            gsap.to(q(".csl-toggle-btn"), {
              scale: 1,
              duration: 1,
              ease: "power4.inOut",
            }),
          );
          extra.push(
            gsap.to(q(".csl-line p"), {
              y: 0,
              duration: 1,
              stagger: 0.1,
              ease: "power3.out",
            }),
          );
        },
        rotateY: 0,
        opacity: 1,
        duration: 2,
        ease: "power3.out",
        delay: 8,
      }),
    );

    return () => {
      tl.kill();
      for (const t of extra) t.kill();
    };
  }, []);

  return (
    <div className="csl-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="csl-loader">
        <div className="csl-count-wrapper">
          <div className="csl-count">
            {digitsLeft.map((d, i) => (
              <div className="csl-digit" key={`l-${i}`}>
                <h1>{d}</h1>
              </div>
            ))}
          </div>
        </div>

        <div className="csl-count-wrapper">
          <div className="csl-count">
            {digitsRight.map((d, i) => (
              <div className="csl-digit" key={`r-${i}`}>
                <h1>{d}</h1>
              </div>
            ))}
          </div>
        </div>

        <div className="csl-revealer csl-revealer-1">
          <StarSvg fill={revealerColors[0]} />
        </div>
        <div className="csl-revealer csl-revealer-2">
          <StarSvg fill={revealerColors[1]} />
        </div>
        <div className="csl-revealer csl-revealer-3">
          <StarSvg fill={revealerColors[2]} />
        </div>
      </div>

      <div className="csl-container">
        <div className="csl-site-info">
          {infoLines.map((line) => (
            <div className="csl-line" key={line}>
              <p>{line}</p>
            </div>
          ))}
        </div>
        <div className="csl-toggle-btn">
          <StarSvg fill="#000000" />
        </div>
        <div className="csl-header">
          <h1>{headline}</h1>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.cdnfonts.com/css/pp-neue-montreal");

.csl-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #000;
  color: #fff;
  font-family: "PP Editorial Old", Georgia, serif;
}

.csl-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.csl-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  color: #fff;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  z-index: 2;
}

.csl-count-wrapper {
  position: relative;
  width: 180px;
  height: 360px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  will-change: transform;
}

.csl-count {
  position: relative;
  width: 1080px;
  height: 360px;
  display: flex;
  justify-content: space-between;
  transform: translateX(-1080px);
  will-change: transform;
}

.csl-digit {
  position: relative;
  width: 180px;
  height: 360px;
}

.csl-digit h1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: max-content;
  font-size: 360px;
  font-weight: lighter;
  line-height: 1;
}

.csl-revealer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.csl-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
}

.csl-site-info {
  position: absolute;
  top: 2em;
  left: 2em;
  display: flex;
  flex-direction: column;
  gap: 0.125em;
  z-index: 1;
}

.csl-line {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  height: 18px;
}

.csl-line p {
  position: relative;
  font-family: "PP Neue Montreal", sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.125px;
  opacity: 0.5;
  -webkit-font-smoothing: antialiased;
  transform: translateY(18px);
  will-change: transform;
}

.csl-toggle-btn {
  position: absolute;
  top: 2em;
  right: 2em;
  width: 60px;
  height: 50px;
  background: #fff;
  border-radius: 100%;
  transform: scale(0);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.csl-toggle-btn svg {
  width: 30px;
  height: auto;
}

.csl-header {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 1em;
  transform-style: preserve-3d;
  perspective: 2000px;
}

.csl-header h1 {
  position: relative;
  font-size: 25vw;
  font-weight: lighter;
  letter-spacing: -0.02em;
  line-height: 0.85;
  transform: rotateY(60deg);
  transform-origin: bottom left;
  will-change: transform;
  opacity: 0;
}
`;

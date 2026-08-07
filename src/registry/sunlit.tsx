"use client";

/**
 * Sunlit
 *
 * Pure CSS dappled light: sunlight through blinds and a billowing leaf canopy,
 * with progressive blur for depth, a floor bounce glow, and a day/night
 * transition that walks through hand-picked sunrise and sunset colors.
 *
 * Adapted from Jacky Zhao's open-source CSS experiment
 * (https://github.com/jackyzha0/sunlit), inspired by daylightcomputer.com and
 * sunlit.place. Perspective uses a derived matrix3d homography so the light
 * plane reads as a window wall rather than a flat affine skew. Leaf motion
 * combines a slow billow keyframe with an SVG turbulence displacement filter.
 *
 * BLANK, aryank.space
 */

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useId,
  useState,
} from "react";

const DEFAULT_LEAVES = "/assets/sunlit/leaves.png";

const DAY_MATRIX =
  "matrix3d(0.7500, -0.0625, 0.0000, 0.0008, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000)";
const NIGHT_MATRIX =
  "matrix3d(0.8333, 0.0833, 0.0000, 0.0003, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000)";

const BLUR_LAYERS = [
  { blur: "6px", stop1: "0%", stop2: "0%" },
  { blur: "12px", stop1: "40%", stop2: "80%" },
  { blur: "48px", stop1: "40%", stop2: "70%" },
  { blur: "96px", stop1: "70%", stop2: "80%" },
] as const;

export interface SunlitProps {
  /** Controlled night mode. When set, the component no longer owns dark state. */
  dark?: boolean;
  /** Initial night mode when uncontrolled. */
  defaultDark?: boolean;
  /** Fires after day/night flips (click toggle or keyboard). */
  onDarkChange?: (dark: boolean) => void;
  /** Click the scene (outside interactive children) to toggle day/night. */
  toggleOnClick?: boolean;
  /** Leaf canopy texture. Defaults to the hosted sunlit leaves asset. */
  leavesSrc?: string;
  /** Daytime backdrop color. */
  dayColor?: string;
  /** Nighttime backdrop color. */
  nightColor?: string;
  /** Warm floor bounce at day. */
  bounceLightDay?: string;
  /** Cool floor bounce at night. */
  bounceLightNight?: string;
  /** Shutter bar color (the solid bars that cast the light). */
  shadowColor?: string;
  /** How many horizontal shutters to stack. */
  shutterCount?: number;
  /** Content rendered above the light plane, inherits the active text color. */
  children?: ReactNode;
  className?: string;
}

export default function Sunlit({
  dark: darkProp,
  defaultDark = false,
  onDarkChange,
  toggleOnClick = true,
  leavesSrc = DEFAULT_LEAVES,
  dayColor = "#fffdfa",
  nightColor = "#0f131c",
  bounceLightDay = "#f5d7a6",
  bounceLightNight = "#1b293f",
  shadowColor,
  shutterCount = 23,
  children,
  className,
}: SunlitProps) {
  const reactId = useId().replace(/:/g, "");
  const filterId = `sunlit-wind-${reactId}`;
  const [uncontrolledDark, setUncontrolledDark] = useState(defaultDark);
  const [transition, setTransition] = useState<"none" | "sunrise" | "sunset">(
    "none",
  );

  const isControlled = darkProp !== undefined;
  const dark = isControlled ? darkProp : uncontrolledDark;

  const setDark = useCallback(
    (next: boolean) => {
      setTransition(next ? "sunset" : "sunrise");
      if (!isControlled) setUncontrolledDark(next);
      onDarkChange?.(next);
    },
    [isControlled, onDarkChange],
  );

  const toggle = useCallback(() => {
    setDark(!dark);
  }, [dark, setDark]);

  const dayShadow = shadowColor ?? (dark ? "#030307" : "#1a1917");
  const bounce = dark ? bounceLightNight : bounceLightDay;
  const light = dark ? nightColor : dayColor;
  const text = dark ? dayColor : nightColor;

  const toggleProps = toggleOnClick
    ? {
        role: "button",
        tabIndex: 0,
        "aria-pressed": dark,
        "aria-label": dark ? "Switch to daylight" : "Switch to night",
      }
    : {};

  const rootStyle = {
    "--sunlit-day": dayColor,
    "--sunlit-evening": "#fccc83",
    "--sunlit-dusk": "#db7a2a",
    "--sunlit-night": nightColor,
    "--sunlit-dawn": "#16132b",
    "--sunlit-morning": "#9fb3bf",
    "--sunlit-light": light,
    "--sunlit-dark": text,
    "--sunlit-shadow": dayShadow,
    "--sunlit-bounce": bounce,
    "--sunlit-timing": "cubic-bezier(0.455, 0.190, 0.000, 0.985)",
    color: text,
    backgroundColor: light,
  } as CSSProperties;

  return (
    <div
      className={`sunlit-root${dark ? " sunlit-dark" : ""}${
        transition !== "none" ? " sunlit-animating" : ""
      }${transition === "sunrise" ? " sunlit-sunrise" : ""}${
        transition === "sunset" ? " sunlit-sunset" : ""
      }${className ? ` ${className}` : ""}`}
      style={rootStyle}
      data-sunlit={dark ? "night" : "day"}
      onClick={
        toggleOnClick
          ? (event) => {
              const target = event.target as HTMLElement;
              if (target.closest("a, button, input, textarea, select, label")) {
                return;
              }
              toggle();
            }
          : undefined
      }
      onKeyDown={
        toggleOnClick
          ? (event) => {
              if (event.key === " " || event.key === "Enter") {
                const target = event.target as HTMLElement;
                if (target !== event.currentTarget) return;
                event.preventDefault();
                toggle();
              }
            }
          : undefined
      }
      {...toggleProps}
    >
      <style>{styles(filterId)}</style>

      <div className="sunlit-dappled" aria-hidden>
        <div className="sunlit-glow" />
        <div className="sunlit-glow-bounce" />

        <div className="sunlit-perspective">
          <div
            className="sunlit-leaves"
            style={{ backgroundImage: `url("${leavesSrc}")` }}
          >
            <svg
              width="0"
              height="0"
              style={{ position: "absolute", width: 0, height: 0 }}
              aria-hidden
            >
              <defs>
                <filter
                  id={filterId}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feTurbulence type="fractalNoise" numOctaves="2" seed="1">
                    <animate
                      attributeName="baseFrequency"
                      dur="16s"
                      keyTimes="0;0.33;0.66;1"
                      values="0.005 0.003;0.01 0.009;0.008 0.004;0.005 0.003"
                      repeatCount="indefinite"
                    />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic">
                    <animate
                      attributeName="scale"
                      dur="20s"
                      keyTimes="0;0.25;0.5;0.75;1"
                      values="45;55;75;55;45"
                      repeatCount="indefinite"
                    />
                  </feDisplacementMap>
                </filter>
              </defs>
            </svg>
          </div>

          <div className="sunlit-blinds">
            <div className="sunlit-shutters">
              {Array.from({ length: Math.max(4, shutterCount) }, (_, i) => (
                <div key={i} className="sunlit-shutter" />
              ))}
            </div>
            <div className="sunlit-vertical">
              <div className="sunlit-bar" />
              <div className="sunlit-bar" />
            </div>
          </div>
        </div>

        <div className="sunlit-progressive-blur">
          {BLUR_LAYERS.map((layer, i) => (
            <div
              key={i}
              style={
                {
                  "--blur-amount": layer.blur,
                  "--stop1": layer.stop1,
                  "--stop2": layer.stop2,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {children ? <div className="sunlit-content">{children}</div> : null}
    </div>
  );
}

function styles(filterId: string) {
  return `
    .sunlit-root {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 100%;
      overflow: hidden;
      isolation: isolate;
      color: var(--sunlit-dark);
      background-color: var(--sunlit-light);
      transition: color 0.8s var(--sunlit-timing);
      animation-duration: 0s;
      animation-fill-mode: forwards;
      animation-timing-function: linear;
      cursor: pointer;
      outline: none;
    }
    .sunlit-root:focus-visible {
      box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--sunlit-dark) 35%, transparent);
    }
    .sunlit-root.sunlit-animating.sunlit-sunrise {
      animation-duration: 1s;
      animation-name: sunlit-sunrise;
    }
    .sunlit-root.sunlit-animating.sunlit-sunset {
      animation-duration: 1.7s;
      animation-name: sunlit-sunset;
    }
    @keyframes sunlit-sunrise {
      0% { background-color: var(--sunlit-night); }
      10% { background-color: var(--sunlit-dawn); }
      35% { background-color: var(--sunlit-morning); }
      100% { background-color: var(--sunlit-day); }
    }
    @keyframes sunlit-sunset {
      0% { background-color: var(--sunlit-day); }
      30% { background-color: var(--sunlit-evening); }
      60% { background-color: var(--sunlit-dusk); }
      90% { background-color: var(--sunlit-dawn); }
      100% { background-color: var(--sunlit-night); }
    }
    .sunlit-dappled {
      pointer-events: none;
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
    }
    .sunlit-glow {
      position: absolute;
      background: linear-gradient(
        309deg,
        var(--sunlit-bounce),
        var(--sunlit-bounce) 20%,
        transparent
      );
      transition: background 1s var(--sunlit-timing);
      height: 100%;
      width: 100%;
      opacity: 0.5;
    }
    .sunlit-glow-bounce {
      position: absolute;
      background: linear-gradient(
        355deg,
        var(--sunlit-bounce) 0%,
        transparent 30%,
        transparent 100%
      );
      transition: background 1s var(--sunlit-timing);
      opacity: 0.5;
      height: 100%;
      width: 100%;
      bottom: 0;
    }
    .sunlit-perspective {
      position: absolute;
      transition: transform 1.7s var(--sunlit-timing), opacity 4s ease;
      top: -30%;
      right: 0;
      width: 80%;
      height: 130%;
      opacity: 0.07;
      background-blend-mode: darken;
      transform-origin: top right;
      transform-style: preserve-3d;
      transform: ${DAY_MATRIX};
    }
    .sunlit-root.sunlit-dark .sunlit-perspective {
      opacity: 0.3;
      transform: ${NIGHT_MATRIX};
    }
    .sunlit-leaves {
      position: absolute;
      background-size: cover;
      background-repeat: no-repeat;
      bottom: -20px;
      right: -700px;
      width: 1600px;
      height: 1400px;
      filter: url(#${filterId});
      animation: sunlit-billow 8s ease-in-out infinite;
    }
    .sunlit-blinds {
      position: relative;
      width: 100%;
    }
    .sunlit-shutters {
      display: flex;
      flex-direction: column;
      align-items: end;
      gap: 60px;
      transition: gap 1s var(--sunlit-timing);
    }
    .sunlit-root.sunlit-dark .sunlit-shutters {
      gap: 20px;
    }
    .sunlit-shutter {
      width: 100%;
      height: 40px;
      background-color: var(--sunlit-shadow);
      transition: height 1s var(--sunlit-timing);
    }
    .sunlit-root.sunlit-dark .sunlit-shutter {
      height: 80px;
    }
    .sunlit-vertical {
      top: 0;
      position: absolute;
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: space-around;
    }
    .sunlit-bar {
      width: 5px;
      height: 100%;
      background-color: var(--sunlit-shadow);
    }
    .sunlit-progressive-blur {
      position: absolute;
      inset: 0;
    }
    .sunlit-progressive-blur > div {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(var(--blur-amount));
      -webkit-backdrop-filter: blur(var(--blur-amount));
      mask-image: linear-gradient(
        252deg,
        transparent,
        transparent var(--stop1),
        black var(--stop2),
        black
      );
      -webkit-mask-image: linear-gradient(
        252deg,
        transparent,
        transparent var(--stop1),
        black var(--stop2),
        black
      );
    }
    .sunlit-content {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      color: inherit;
      pointer-events: none;
    }
    .sunlit-content a,
    .sunlit-content button,
    .sunlit-content input,
    .sunlit-content textarea,
    .sunlit-content select,
    .sunlit-content label,
    .sunlit-content [data-sunlit-interactive] {
      pointer-events: auto;
    }
    @keyframes sunlit-billow {
      0% {
        transform: perspective(400px) rotateX(0deg) rotateY(0deg) scale(1);
      }
      25% {
        transform: perspective(400px) rotateX(1deg) rotateY(2deg) scale(1.02);
      }
      50% {
        transform: perspective(400px) rotateX(-4deg) rotateY(-2deg) scale(0.97);
      }
      75% {
        transform: perspective(400px) rotateX(1deg) rotateY(-1deg) scale(1.04);
      }
      100% {
        transform: perspective(400px) rotateX(0deg) rotateY(0deg) scale(1);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .sunlit-leaves {
        animation: none;
        filter: none;
      }
      .sunlit-root.sunlit-animating.sunlit-sunrise,
      .sunlit-root.sunlit-animating.sunlit-sunset {
        animation-duration: 0.01ms !important;
      }
      .sunlit-perspective,
      .sunlit-shutter,
      .sunlit-shutters,
      .sunlit-glow,
      .sunlit-glow-bounce {
        transition: none !important;
      }
    }
  `;
}

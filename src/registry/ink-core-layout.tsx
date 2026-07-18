"use client";

import { useEffect, useRef, useState } from "react";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/ink-core-layout";

const CARDS = [
  {
    title: "the rarest material",
    body: "the universe has eons and you have about eighty. that makes your time the rarest material in existence. we build with it.",
    image: "5.png",
    left: 0,
    top: 0,
  },
  {
    title: "the idea",
    body: "you can't own more time. but a moment, fully noticed, is time made solid. the more you notice, the more life you get to keep.",
    image: "4.png",
    left: 6,
    top: 5,
  },
  {
    title: "the idea behind the name",
    body: "an old idea we kept returning to: every thing happens once. do the same thing tomorrow and you'll make something else entirely. that's what makes it precious.",
    image: "1.png",
    left: 11,
    top: 2,
  },
  {
    title: "the name",
    body: "ichigo ichie, a japanese phrase. we compressed it into one word: BLANK. a studio named after the fact that nothing happens twice.",
    image: "2.png",
    left: 15,
    top: 4,
  },
  {
    title: "the mark",
    body: "our wordmark was drawn by a calligraphy artist. ink and brush. she shipped us the original. it exists exactly once, which is the entire point.",
    image: "3.png",
    left: 21,
    top: 1,
  },
  {
    title: "the king",
    body: "in shogi, who is the king you're protecting? it is not the piece but the ones who come after you. that's the other way humans hold time. we pass things down.",
    image: "8.png",
    left: 25,
    top: 5,
  },
  {
    title: "the studio",
    body: "so this is what we do. objects, brands, film, software, archives. different disciplines, one passion. making moments you can preserve.",
    image: "7-r2.png",
    left: 30,
    top: 0,
  },
  {
    title: "est. 2026",
    body: "we began with time. we intend to leave some behind. BLANK studio, designed to hold time.",
    image: "8.mp4",
    left: 35,
    top: 4,
  },
] as const;

export interface InkCoreLayoutProps {
  /** Milliseconds the opening ink screen remains visible. */
  loadingDuration?: number;
  /** Base URL for the registered image and video assets. */
  assetBase?: string;
  className?: string;
}

/**
 * A compact, horizontal studio layout with source-backed segmented tiles and
 * a cursor-drawn ink field.
 *
 * BLANK - aryank.space
 */
export default function InkCoreLayout({
  loadingDuration = 5667,
  assetBase = DEFAULT_ASSET_BASE,
  className = "",
}: InkCoreLayoutProps) {
  const rootRef = useRef<HTMLElement>(null);
  const panRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [inkVisible, setInkVisible] = useState(true);
  const [still, setStill] = useState(false);
  const [largeType, setLargeType] = useState(false);
  const [panX, setPanX] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), loadingDuration);
    return () => window.clearTimeout(timeout);
  }, [loadingDuration]);

  useEffect(() => {
    const font = new FontFace(
      "Ink Core Switzer",
      `url(${assetBase}/switzer.ttf)`,
    );
    void font.load().then((loaded) => document.fonts.add(loaded));
    return () => {
      document.fonts.delete(font);
    };
  }, [assetBase]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let startX = 0;
    let startPan = 0;
    let dragging = false;
    const maxPan = () => {
      const unit = Math.max(32, (root.clientHeight - 190) / 10);
      return Math.min(
        0,
        root.clientWidth - (root.clientWidth * 0.14 + unit * 38),
      );
    };
    const down = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("a, button")) return;
      startX = event.clientX;
      startPan = panRef.current;
      dragging = true;
      root.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const nextPan = Math.max(
        maxPan(),
        Math.min(0, startPan + event.clientX - startX),
      );
      panRef.current = nextPan;
      setPanX(nextPan);
    };
    const up = (event: PointerEvent) => {
      dragging = false;
      root.releasePointerCapture(event.pointerId);
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    return () => {
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section
      className={`ink-core-layout ${still ? "is-still" : ""} ${largeType ? "is-large" : ""} ${className}`}
      aria-label="Ink field editorial layout"
      ref={rootRef}
      style={
        {
          "--icl-loading-duration": `${loadingDuration}ms`,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <InkCursor enabled={inkVisible} still={still} rootRef={rootRef} />

      <a className="icl-retrace" href="#start">
        ‹‹ RETRACE STEPS
      </a>
      <a className="icl-explore" href="#end">
        EXPLORE STUDIO »
      </a>

      <div
        className="icl-rail"
        id="start"
        style={{ transform: `translate3d(${panX}px, 0, 0)` }}
      >
        {CARDS.map((card, index) => (
          <article
            className="icl-card"
            key={card.title}
            style={
              {
                "--left": card.left,
                "--top": card.top,
              } as React.CSSProperties
            }
          >
            <div className="icl-card-image" aria-hidden="true">
              {card.image.endsWith(".mp4") ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={`${assetBase}/${card.image}`}
                />
              ) : (
                Array.from({ length: 6 }, (_, band) => (
                  <span
                    className="icl-band"
                    key={band}
                    style={{ "--band": band } as React.CSSProperties}
                  >
                    <img alt="" src={`${assetBase}/${card.image}`} />
                  </span>
                ))
              )}
            </div>
            <p className="icl-cap">
              CORE-{String(index + 1).padStart(3, "0")} · {card.title}
            </p>
            <p className="icl-copy">{card.body}</p>
          </article>
        ))}
      </div>

      <div className="icl-footer" id="end">
        <button type="button">♪ MUSIC · PLAY</button>
        <p>BLANK studio · est. 2026 · core</p>
        <span>▸ 000</span>
      </div>

      <div className="icl-controls">
        <button type="button" onClick={() => setInkVisible((value) => !value)}>
          HOLD TIME WITH INK · {inkVisible ? "ON" : "OFF"}
        </button>
        <button type="button" onClick={() => setStill((value) => !value)}>
          MOTION · {still ? "STILL" : "FULL"}
        </button>
        <button
          type="button"
          aria-label="Toggle text size"
          onClick={() => setLargeType((value) => !value)}
        >
          Aᵃ
        </button>
      </div>

      {loading ? (
        <LoadingScreen
          assetBase={assetBase}
          loadingDuration={loadingDuration}
        />
      ) : null}
    </section>
  );
}

function InkCursor({
  enabled,
  still,
  rootRef,
}: {
  enabled: boolean;
  still: boolean;
  rootRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!root || !canvas || !context || !enabled) return;

    let frame = 0;
    let previous: { x: number; y: number } | null = null;
    let ratio = 1;
    const resize = () => {
      const bounds = root.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(bounds.width * ratio);
      canvas.height = Math.ceil(bounds.height * ratio);
      canvas.style.width = `${bounds.width}px`;
      canvas.style.height = `${bounds.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      const point = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      if (!previous) {
        previous = point;
        return;
      }
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      const width = Math.min(5.5, 1.8 + distance * 0.025);
      const path = new Path2D();
      path.moveTo(previous.x, previous.y);
      path.lineTo(point.x, point.y);

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";

      context.strokeStyle = "rgba(5, 5, 5, .07)";
      context.lineWidth = width * 3.2;
      context.shadowColor = "rgba(5, 5, 5, .12)";
      context.shadowBlur = width * 1.8;
      context.stroke(path);

      context.strokeStyle = "rgba(5, 5, 5, .88)";
      context.lineWidth = width;
      context.shadowColor = "rgba(5, 5, 5, .3)";
      context.shadowBlur = width * 0.65;
      context.stroke(path);
      context.restore();
      previous = point;
    };
    const fade = () => {
      if (!still) {
        const bounds = root.getBoundingClientRect();
        context.save();
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = "rgba(0, 0, 0, .012)";
        context.fillRect(0, 0, bounds.width, bounds.height);
        context.restore();
      }
      frame = window.requestAnimationFrame(fade);
    };
    const leave = () => {
      previous = null;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    root.addEventListener("pointermove", draw);
    root.addEventListener("pointerleave", leave);
    frame = window.requestAnimationFrame(fade);
    return () => {
      observer.disconnect();
      root.removeEventListener("pointermove", draw);
      root.removeEventListener("pointerleave", leave);
      window.cancelAnimationFrame(frame);
    };
  }, [enabled, rootRef, still]);

  return (
    <div className="icl-cursor-ink" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}

function LoadingScreen({
  assetBase,
  loadingDuration,
}: {
  assetBase: string;
  loadingDuration: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setProgress(Math.min(99, Math.floor((elapsed / loadingDuration) * 100)));
    }, 50);
    return () => window.clearInterval(interval);
  }, [loadingDuration]);

  return (
    <div className="icl-loader" aria-hidden="true">
      <div className="icl-loader-media">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={`${assetBase}/intro.mp4`}
        />
        <div className="icl-loader-label">
          <span>/LOADING</span>
        </div>
      </div>
      <span className="icl-loader-progress">
        /loading ▸ {String(progress).padStart(3, "0")}
      </span>
    </div>
  );
}

const styles = `
.ink-core-layout {
  --unit: max(32px, calc((100svh - 190px) / 10));
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100svh;
  min-height: 540px;
  overflow: hidden;
  touch-action: none;
  background: #fff;
  color: #090909;
  font-family: "Ink Core Switzer", Arial, sans-serif;
  font-size: 11px;
  line-height: 1.25;
  -webkit-font-smoothing: antialiased;
}
.ink-core-layout *, .ink-core-layout *::before, .ink-core-layout *::after { box-sizing: border-box; }
.ink-core-layout a, .ink-core-layout button { color: inherit; font: inherit; }
.ink-core-layout a { text-decoration: none; }
.icl-retrace, .icl-explore, .icl-footer button, .icl-controls button {
  position: absolute;
  z-index: 4;
  border: 1px solid #a9a9a5;
  background: rgba(255,255,255,.9);
  padding: 8px 14px;
  letter-spacing: -.02em;
  white-space: nowrap;
}
.icl-retrace { top: 40px; left: 7vw; }
.icl-explore { top: 40px; right: 7vw; }
.icl-rail {
  position: absolute;
  z-index: 2;
  inset: 96px 0 0;
  width: calc(14vw + var(--unit) * 38);
  height: calc(100% - 96px);
  will-change: transform;
}
.icl-card {
  position: absolute;
  top: calc(var(--top) * var(--unit));
  left: calc(7vw + var(--left) * var(--unit));
  width: calc(var(--unit) * 2.1);
  margin: 0;
}
.icl-card-image {
  position: relative;
  display: block;
  width: 64px;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f4f4f2;
}
.icl-band { position: absolute; right: 0; left: 0; top: calc(var(--band) * 16.666%); height: 16.666%; overflow: hidden; transform-origin: left center; transition: transform 400ms cubic-bezier(.16,1,.3,1); }
.icl-band img { position: absolute; top: calc(var(--band) * -100%); width: 100%; height: 600%; object-fit: cover; }
.icl-card:hover .icl-band:nth-child(odd) { transform: translateX(7px) rotate(.8deg); }
.icl-card:hover .icl-band:nth-child(even) { transform: translateX(-5px) rotate(-.7deg); }
.icl-card-image video { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1); }
.icl-cap { margin: 10px 0 13px; color: #777773; font-size: 10px; letter-spacing: -.02em; white-space: nowrap; }
.icl-copy { width: 12.2ch; margin: 0; font-family: "Helvetica Neue", Helvetica, sans-serif; font-size: 15px; line-height: 1.42; letter-spacing: -.035em; }
.is-large .icl-copy { font-size: 17px; }
.icl-footer { position: absolute; z-index: 4; bottom: 23px; left: 7vw; display: flex; align-items: center; gap: 22px; color: #8e8d89; font-size: 10px; }
.icl-footer button { position: static; color: #151515; cursor: pointer; }
.icl-footer p { margin: 0; }
.icl-footer span { color: #42423f; }
.icl-controls { position: absolute; z-index: 4; right: 7vw; bottom: 22px; display: flex; align-items: center; gap: 6px; }
.icl-controls button { position: static; padding: 8px 11px; cursor: pointer; }
.icl-controls button:last-child { padding-inline: 12px; }
.icl-cursor-ink, .icl-cursor-ink canvas { position: absolute; z-index: 1; inset: 0; pointer-events: none; mix-blend-mode: multiply; }
.icl-loader { position: absolute; z-index: 90; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; overflow: hidden; pointer-events: none; background: #fff; color: #040b05; animation: icl-loader-out 600ms cubic-bezier(.16,1,.3,1) forwards; animation-delay: calc(var(--icl-loading-duration) - 600ms); }
.icl-loader-media { position: relative; width: min(92vw, 1420px); aspect-ratio: 1680 / 800; max-height: 44vh; }
.icl-loader-media video { display: block; width: 100%; height: 100%; object-fit: contain; filter: grayscale(1) contrast(1.02); }
.icl-loader-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.icl-loader-label span { font-size: 14px; letter-spacing: -.04em; }
.icl-loader-progress { font-size: 11px; letter-spacing: -.04em; text-transform: uppercase; opacity: .62; font-variant-numeric: tabular-nums; }
@keyframes icl-loader-out { to { opacity: 0; visibility: hidden; } }
@media (prefers-reduced-motion: reduce) { .icl-loader { animation-duration: 1ms; } }
@media (max-width: 700px) {
  .ink-core-layout { --unit: max(34px, calc((100svh - 170px) / 10)); min-height: 520px; }
  .icl-retrace { left: 16px; top: 18px; } .icl-explore { right: 16px; top: 18px; }
  .icl-rail { inset: 78px 0 0; width: calc(32px + var(--unit) * 38); overflow-x: auto; }
  .icl-card { left: calc(16px + var(--left) * var(--unit)); }
  .icl-footer { bottom: 16px; left: 16px; gap: 9px; } .icl-footer p { display: none; }
  .icl-controls { right: 16px; bottom: 15px; } .icl-controls button { padding: 7px; } .icl-controls button:first-child { display: none; }
}
`;

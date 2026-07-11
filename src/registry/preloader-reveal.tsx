"use client";

/**
 * Preloader Reveal - a system-boot intro that wipes away into a hero.
 *
 * A black preloader sheet draws a circular progress ring and reveals a stack of
 * telemetry readouts, settling on an Engage control. Engaging collapses the
 * sheet to the left, swaps the label to a granted state, and clip-wipes through
 * to a hero whose headline rises word by word. A white annotation backdrop sits
 * underneath so the margins read like a technical document mid-assembly.
 *
 * Everything is scoped to the component box with absolute positioning, so it
 * embeds in a bounded demo or fills a section. Built with a GSAP timeline and
 * CustomEase; text is split into masked lines by hand.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

export interface PreloaderRevealProps {
  /** Hero headline, revealed word by word after the wipe. */
  heading?: string;
  /** Label on the boot control before engaging. */
  engageLabel?: string;
  /** Label shown after engaging. */
  grantedLabel?: string;
  /** Small label in the top-left of the preloader. */
  initiatingLabel?: string;
  /** Annotation mark in the backdrop and the boot control. */
  logo?: string;
  buttonLogo?: string;
  /** Color system. */
  dark?: string;
  light?: string;
  muted?: string;
  /** Auto-run the full sequence on a loop for showcase (true) or wait for a click. */
  loop?: boolean;
}

const COMPRONENTS_ASSET_BASE =
  "https://ui.aryank.space/assets/preloader-reveal";
const DEFAULT_LOGO = `${COMPRONENTS_ASSET_BASE}/logo.png`;
const DEFAULT_BUTTON_LOGO = `${COMPRONENTS_ASSET_BASE}/logo-light.png`;

const FULL_CLIP = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const LEFT_CLIP = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
const PROGRESS_STOPS = [0.2, 0.45, 0.85, 1];

const TOP_ROW = [
  ["ARC 117 Delta Trace"],
  ["Sector / Hollow Frame", "0.392 02SD 008923"],
  ["Material / Unknown Fiber", "Status / Soft Resonance"],
  ["logo"],
  [":::..:::.::::..:::"],
];
const BOTTOM_ROW = [
  ["Surface Memory"],
  ["// / / ///// / / / ///"],
  ["Phase Offset > 17%"],
  ["Fragments Aligning", "Pattern Emerging"],
  ["Collapse Pending", "Return to Layer Zero"],
  ["F-9"],
];

export default function PreloaderReveal({
  heading = "The system is now visible",
  engageLabel = "Engage",
  grantedLabel = "Access Granted",
  initiatingLabel = "Initiating",
  logo = DEFAULT_LOGO,
  buttonLogo = DEFAULT_BUTTON_LOGO,
  dark = "#000000",
  light = "#ffffff",
  muted = "#7a7a7a",
  loop = true,
}: PreloaderRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const words = heading.split(" ");

  // biome-ignore lint/correctness/useExhaustiveDependencies: readout/label copy seeds static DOM; the timeline rebuilds only on heading / mode changes.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(CustomEase);
    CustomEase.create("plr-hop", "0.9, 0, 0.1, 1");
    CustomEase.create("plr-glide", "0.8, 0, 0.2, 1");

    const q = gsap.utils.selector(root);
    const preloader = q(".plr-preloader")[0] as HTMLElement;
    const hero = q(".plr-hero")[0] as HTMLElement;
    const revealer = q(".plr-revealer")[0] as HTMLElement;
    const btn = q(".plr-btn")[0] as HTMLElement;
    const track = q(".plr-stroke-track")[0] as unknown as SVGGeometryElement;
    const progress = q(
      ".plr-stroke-progress",
    )[0] as unknown as SVGGeometryElement;
    if (!preloader || !hero || !revealer || !btn || !track || !progress) return;

    const len = track.getTotalLength() || 2 * Math.PI * 155;

    const setInitial = () => {
      gsap.set([track, progress], {
        strokeDasharray: len,
        strokeDashoffset: len,
      });
      gsap.set(q(".plr-line-inner, .plr-word-inner"), { yPercent: 100 });
      gsap.set(q(".plr-strokes svg"), {
        rotation: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set(q("#pbc-logo"), { opacity: 1 });
      gsap.set(btn, { scale: 1 });
      gsap.set(preloader, { scale: 1, clipPath: FULL_CLIP });
      gsap.set(revealer, { clipPath: FULL_CLIP });
      gsap.set(hero, { scale: 0.75 });
    };

    let ready = false;
    let exitTl: gsap.core.Timeline | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const buildIntro = () => {
      const tl = gsap.timeline({ delay: loop ? 0.4 : 1 });
      tl.to(q(".plr-row .plr-line-inner"), {
        yPercent: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.1,
      })
        .to(track, { strokeDashoffset: 0, duration: 2, ease: "plr-hop" }, "<")
        .to(
          q(".plr-strokes svg"),
          { rotation: 270, duration: 2, ease: "plr-hop" },
          "<",
        );

      PROGRESS_STOPS.forEach((stop, i) => {
        tl.to(progress, {
          strokeDashoffset: len - len * stop,
          duration: 0.75,
          ease: "plr-glide",
          delay: i === 0 ? 0.3 : 0.4,
        });
      });

      tl.to(q("#pbc-logo"), { opacity: 0, duration: 0.35 }, "-=0.25")
        .to(btn, { scale: 0.9, duration: 1.5, ease: "plr-hop" }, "-=0.5")
        .to(
          q("#pbc-label .plr-line-inner"),
          {
            yPercent: 0,
            duration: 0.75,
            ease: "power3.out",
            onComplete: () => {
              ready = true;
              if (loop) timers.push(setTimeout(engage, 1400));
            },
          },
          "-=0.75",
        );
      return tl;
    };

    function engage() {
      if (!ready) return;
      ready = false;

      exitTl = gsap.timeline();
      exitTl
        .to(preloader, { scale: 0.75, duration: 1.25, ease: "plr-hop" })
        .to(
          [track, progress],
          { strokeDashoffset: -len, duration: 1.25, ease: "plr-hop" },
          "<",
        )
        .to(
          q("#pbc-label .plr-line-inner"),
          { yPercent: -100, duration: 0.75, ease: "power3.out" },
          "-=1.25",
        )
        .to(
          q("#pbc-outro-label .plr-line-inner"),
          { yPercent: 0, duration: 0.75, ease: "power3.out" },
          "-=0.75",
        )
        .to(preloader, {
          clipPath: LEFT_CLIP,
          duration: 1.5,
          ease: "plr-hop",
        })
        .to(
          revealer,
          { clipPath: LEFT_CLIP, duration: 1.5, ease: "plr-hop" },
          "-=1.45",
        )
        .to(hero, { scale: 1, duration: 1.25, ease: "plr-hop" })
        .to(
          q(".plr-word-inner"),
          {
            yPercent: 0,
            duration: 1,
            ease: "plr-glide",
            stagger: 0.05,
            onComplete: () => {
              if (loop)
                timers.push(
                  setTimeout(() => {
                    setInitial();
                    intro.restart(true);
                  }, 2000),
                );
            },
          },
          "-=1.75",
        );
    }

    setInitial();
    const intro = buildIntro();
    btn.addEventListener("click", engage);

    return () => {
      btn.removeEventListener("click", engage);
      for (const t of timers) clearTimeout(t);
      intro.kill();
      exitTl?.kill();
      gsap.killTweensOf(q("*"));
    };
  }, [heading, loop]);

  return (
    <div
      ref={rootRef}
      className="plr-root"
      style={
        {
          "--plr-dark": dark,
          "--plr-light": light,
          "--plr-muted": muted,
        } as CSSProperties
      }
    >
      <style>{styles}</style>

      <div className="plr-backdrop">
        <div className="plr-pb-row">
          {TOP_ROW.map((col) => (
            <div className="plr-pb-col" key={`top-${col[0]}`}>
              {col[0] === "logo" ? (
                // biome-ignore lint/performance/noImgElement: small annotation mark, not a content image.
                <img className="plr-pb-logo" src={logo} alt="" />
              ) : (
                col.map((line) => <p key={line}>{line}</p>)
              )}
            </div>
          ))}
        </div>
        <div className="plr-pb-row">
          {BOTTOM_ROW.map((col) => (
            <div className="plr-pb-col" key={`bot-${col[0]}`}>
              {col.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="plr-hero">
        <div className="plr-revealer" />
        <h1>
          {words.map((word, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: headline words can repeat, so position is part of the identity.
            <span className="plr-word" key={`${word}-${i}`}>
              <span className="plr-word-inner">{word}</span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
      </section>

      <div className="plr-preloader">
        <div className="plr-row">
          <p>
            <span className="plr-line">
              <span className="plr-line-inner">{initiatingLabel}</span>
            </span>
          </p>
        </div>

        <div className="plr-row">
          <div className="plr-col">
            <div className="plr-sub-col">
              {["Phase 01", "Sequence"].map((t) => (
                <p key={t}>
                  <span className="plr-line">
                    <span className="plr-line-inner">{t}</span>
                  </span>
                </p>
              ))}
            </div>
            <div className="plr-sub-col">
              {["Signal Scan", "07 Layers"].map((t) => (
                <p key={t}>
                  <span className="plr-line">
                    <span className="plr-line-inner">{t}</span>
                  </span>
                </p>
              ))}
            </div>
          </div>
          <div className="plr-col">
            <p>
              <span className="plr-line">
                <span className="plr-line-inner">PX-17</span>
              </span>
            </p>
          </div>
        </div>

        <div className="plr-btn">
          {/* biome-ignore lint/performance/noImgElement: small mark fading out as the ring resolves. */}
          <img id="pbc-logo" className="plr-btn-logo" src={buttonLogo} alt="" />
          <p id="pbc-label">
            <span className="plr-line">
              <span className="plr-line-inner">{engageLabel}</span>
            </span>
          </p>
          <p id="pbc-outro-label">
            <span className="plr-line">
              <span className="plr-line-inner">{grantedLabel}</span>
            </span>
          </p>
          <div className="plr-strokes">
            <svg viewBox="0 0 320 320" fill="none" aria-hidden="true">
              <circle
                className="plr-stroke-track"
                cx="160"
                cy="160"
                r="155"
                stroke="var(--plr-muted)"
                strokeWidth="2"
              />
              <circle
                className="plr-stroke-progress"
                cx="160"
                cy="160"
                r="155"
                stroke="var(--plr-light)"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700;800&family=Geist+Mono:wght@400;500&display=swap");

.plr-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  overflow: hidden;
  container-type: size;
  background: var(--plr-dark);
}

.plr-root * {
  box-sizing: border-box;
}

.plr-root p {
  margin: 0;
  text-transform: uppercase;
  font-family: "Geist Mono", monospace;
  font-size: clamp(0.6rem, 2.4cqmin, 0.75rem);
  font-weight: 500;
  line-height: 1;
}

.plr-line {
  display: block;
  overflow: hidden;
}
.plr-line-inner {
  display: block;
  transform: translateY(100%);
  will-change: transform;
}

.plr-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--plr-light);
  color: var(--plr-muted);
}

.plr-pb-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: clamp(1rem, 3cqmin, 1.5rem);
  gap: 1rem;
}
.plr-pb-row:last-child {
  align-items: flex-end;
}

.plr-pb-col {
  display: grid;
  gap: 0.4rem;
}

.plr-pb-logo {
  width: clamp(1.75rem, 7cqmin, 2.5rem);
  height: clamp(1.75rem, 7cqmin, 2.5rem);
  padding: 0.25rem;
  border: 1px dashed var(--plr-muted);
}

.plr-hero {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  background: var(--plr-dark);
  color: var(--plr-light);
  transform: scale(0.75);
  will-change: transform;
}

.plr-revealer {
  position: absolute;
  inset: 0;
  background: var(--plr-light);
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
}

.plr-hero h1 {
  position: relative;
  width: 90%;
  margin: 0;
  text-transform: uppercase;
  font-family: "Barlow Condensed", sans-serif;
  font-size: clamp(3rem, 15cqw, 12rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 0.85;
}

.plr-word {
  position: relative;
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
}
.plr-word-inner {
  display: inline-block;
  transform: translateY(100%);
  will-change: transform;
}

.plr-preloader {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--plr-dark);
  color: var(--plr-light);
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: transform, clip-path;
}

.plr-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: clamp(1rem, 3cqmin, 1.5rem);
}

.plr-col {
  display: flex;
  gap: clamp(2rem, 9cqmin, 6rem);
  align-items: flex-end;
}

.plr-sub-col {
  display: grid;
  gap: 0.4rem;
}

.plr-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(20rem, 60cqmin);
  height: min(20rem, 60cqmin);
  padding: 0;
  border: none;
  background: transparent;
  color: var(--plr-light);
  cursor: pointer;
  will-change: transform;
}

.plr-strokes,
.plr-btn-logo,
#pbc-label,
#pbc-outro-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.plr-btn-logo {
  width: min(4rem, 18cqmin);
  height: min(4rem, 18cqmin);
}

#pbc-label,
#pbc-outro-label {
  font-size: clamp(0.75rem, 3cqmin, 0.9rem) !important;
  letter-spacing: 0.02em;
}

.plr-strokes,
.plr-strokes svg {
  width: 100%;
  height: 100%;
  will-change: transform;
}
`;

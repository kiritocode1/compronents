"use client";

import { useEffect, useState } from "react";

const CARDS = [
  {
    title: "the rarest material",
    body: "the universe has eons and you have about eighty. that makes your time the rarest material in existence. we build with it.",
    image: "✦",
    left: 0,
    top: 0,
  },
  {
    title: "the idea",
    body: "you can't own more time. but a moment, fully noticed, is time made solid. the more you notice, the more life you get to keep.",
    image: "✳",
    left: 6,
    top: 5,
  },
  {
    title: "the idea behind the name",
    body: "an old idea we kept returning to: every thing happens once. do the same thing tomorrow and you'll make something else entirely.",
    image: "◒",
    left: 11,
    top: 2,
  },
  {
    title: "the name",
    body: "ichigo ichie, a japanese phrase. we compressed it into one word: inkfield. a studio named after the fact that nothing happens twice.",
    image: "▥",
    left: 15,
    top: 4,
  },
  {
    title: "the mark",
    body: "our wordmark was drawn by a calligraphy artist. ink and brush. the original exists exactly once, which is the entire point.",
    image: "◐",
    left: 21,
    top: 1,
  },
  {
    title: "the king",
    body: "in shogi, who is the king you're protecting? it is not the piece but the ones who come after you. that is the other way humans hold time.",
    image: "▦",
    left: 25,
    top: 5,
  },
  {
    title: "the studio",
    body: "so this is what we do. objects, brands, film, software, archives. different disciplines, one passion. making moments you can preserve.",
    image: "✹",
    left: 30,
    top: 0,
  },
  {
    title: "est. 2026",
    body: "we began with time. we intend to leave some behind. a small studio designed to hold time.",
    image: "◌",
    left: 35,
    top: 4,
  },
] as const;

export interface InkCoreLayoutProps {
  /** Milliseconds the opening ink screen remains visible. */
  loadingDuration?: number;
  className?: string;
}

/**
 * A compact, horizontal studio layout with an inky opening screen. It uses
 * gradients instead of source imagery, so it can install without an asset pack.
 *
 * BLANK - aryank.space
 */
export default function InkCoreLayout({
  loadingDuration = 1400,
  className = "",
}: InkCoreLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [inkVisible, setInkVisible] = useState(true);
  const [still, setStill] = useState(false);
  const [largeType, setLargeType] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), loadingDuration);
    return () => window.clearTimeout(timeout);
  }, [loadingDuration]);

  return (
    <section
      className={`ink-core-layout ${still ? "is-still" : ""} ${largeType ? "is-large" : ""} ${className}`}
      aria-label="Ink field editorial layout"
    >
      <style>{styles}</style>
      {inkVisible ? <InkField /> : null}

      <a className="icl-retrace" href="#start">
        ‹‹ RETRACE STEPS
      </a>
      <a className="icl-explore" href="#end">
        EXPLORE STUDIO »
      </a>

      <div className="icl-rail" id="start">
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
              <span>{card.image}</span>
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

      {loading ? <LoadingScreen /> : null}
    </section>
  );
}

function InkField() {
  return (
    <div className="icl-ink" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

function LoadingScreen() {
  return (
    <output className="icl-loader" aria-live="polite" aria-label="Loading">
      <InkField />
      <p>LOADING ·</p>
      <p>LOADING ·</p>
      <p>LOADING ·</p>
    </output>
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
  background: #fff;
  color: #090909;
  font-family: "Geist Mono", "SFMono-Regular", Consolas, monospace;
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
  letter-spacing: -.06em;
  white-space: nowrap;
}
.icl-retrace { top: 40px; left: 7vw; }
.icl-explore { top: 40px; right: 7vw; }
.icl-rail {
  position: absolute;
  inset: 96px 0 0;
  width: calc(14vw + var(--unit) * 38);
  height: calc(100% - 96px);
}
.icl-card {
  position: absolute;
  top: calc(var(--top) * var(--unit));
  left: calc(7vw + var(--left) * var(--unit));
  width: calc(var(--unit) * 2.1);
  margin: 0;
}
.icl-card-image {
  display: grid;
  width: 64px;
  aspect-ratio: 1;
  place-items: center;
  overflow: hidden;
  color: #1e1e1d;
  background:
    radial-gradient(circle at 29% 30%, #191919 0 7%, transparent 8%),
    radial-gradient(circle at 72% 64%, #60605e 0 13%, transparent 14%),
    repeating-linear-gradient(92deg, #ebebe8 0 6px, #aaa9a5 7px 8px, #f7f7f5 9px 13px);
  filter: grayscale(1);
}
.icl-card:nth-child(2n) .icl-card-image { border-radius: 50%; transform: rotate(9deg); }
.icl-card:nth-child(3n) .icl-card-image { clip-path: polygon(0 0, 100% 8%, 84% 100%, 4% 88%); }
.icl-card-image span { mix-blend-mode: screen; font-size: 44px; }
.icl-cap { margin: 10px 0 13px; color: #777773; font-size: 10px; letter-spacing: -.06em; white-space: nowrap; }
.icl-copy { width: 12.2ch; margin: 0; font-family: "Helvetica Neue", Helvetica, sans-serif; font-size: 15px; line-height: 1.42; letter-spacing: -.035em; }
.is-large .icl-copy { font-size: 17px; }
.icl-footer { position: absolute; z-index: 4; bottom: 23px; left: 7vw; display: flex; align-items: center; gap: 22px; color: #8e8d89; font-size: 10px; }
.icl-footer button { position: static; color: #151515; cursor: pointer; }
.icl-footer p { margin: 0; }
.icl-footer span { color: #42423f; }
.icl-controls { position: absolute; z-index: 4; right: 7vw; bottom: 22px; display: flex; align-items: center; gap: 6px; }
.icl-controls button { position: static; padding: 8px 11px; cursor: pointer; }
.icl-controls button:last-child { padding-inline: 12px; }
.icl-ink { position: absolute; z-index: 0; inset: 0; overflow: hidden; pointer-events: none; opacity: .09; mix-blend-mode: multiply; }
.icl-ink::before, .icl-ink::after, .icl-ink i { position: absolute; display: block; content: ""; width: 31vw; height: 32vh; background: #222; filter: blur(22px) contrast(190%); transform: rotate(-15deg); }
.icl-ink::before { top: -16vh; left: 11vw; border-radius: 53% 47% 69% 31% / 39% 64% 36% 61%; }
.icl-ink::after { right: -9vw; bottom: 12vh; width: 37vw; height: 25vh; border-radius: 59% 41% 18% 82% / 47% 49% 51% 53%; }
.icl-ink i:nth-child(1) { top: 20vh; left: 34vw; width: 9vw; height: 48vh; border-radius: 80% 20% 55% 45%; }
.icl-ink i:nth-child(2) { top: 38vh; left: 51vw; width: 39vw; height: 13vh; border-radius: 70% 30% 45% 55%; }
.icl-ink i:nth-child(3) { top: 4vh; left: 67vw; width: 15vw; height: 27vh; border-radius: 25% 75% 40% 60%; }
.icl-ink i:nth-child(n+4) { display: none; }
.is-still .icl-ink { opacity: .04; }
.icl-loader { position: absolute; z-index: 10; inset: 0; display: grid; place-items: center; overflow: hidden; background: rgba(255,255,255,.72); color: rgba(20,20,20,.23); animation: icl-loader-out 420ms ease-in forwards; animation-delay: 1.18s; }
.icl-loader .icl-ink { position: absolute; inset: auto; width: min(500px, 52vw); height: min(260px, 42vh); opacity: .15; transform: translateY(-3px); }
.icl-loader .icl-ink::before { top: 0; left: 20%; width: 55%; height: 88%; }
.icl-loader .icl-ink::after { right: 5%; bottom: 8%; width: 60%; height: 40%; }
.icl-loader .icl-ink i:nth-child(1) { top: 6%; left: 36%; height: 89%; }
.icl-loader .icl-ink i:nth-child(2) { top: 35%; left: 8%; width: 84%; }
.icl-loader p { position: absolute; margin: 0; font-size: 10px; letter-spacing: -.07em; animation: icl-loader-flicker 680ms steps(2,end) infinite; }
.icl-loader p:nth-of-type(1) { transform: translate(-20px, -17px); }
.icl-loader p:nth-of-type(2) { transform: translate(23px, 11px); animation-delay: -180ms; }
.icl-loader p:nth-of-type(3) { transform: translate(-10px, 38px); animation-delay: -410ms; }
@keyframes icl-loader-flicker { 50% { opacity: .18; transform: translate(5px, 5px); } }
@keyframes icl-loader-out { to { opacity: 0; visibility: hidden; } }
@media (prefers-reduced-motion: reduce) { .icl-loader, .icl-loader p { animation: none; } }
@media (max-width: 700px) {
  .ink-core-layout { --unit: max(34px, calc((100svh - 170px) / 10)); min-height: 520px; }
  .icl-retrace { left: 16px; top: 18px; } .icl-explore { right: 16px; top: 18px; }
  .icl-rail { inset: 78px 0 0; width: calc(32px + var(--unit) * 38); overflow-x: auto; }
  .icl-card { left: calc(16px + var(--left) * var(--unit)); }
  .icl-footer { bottom: 16px; left: 16px; gap: 9px; } .icl-footer p { display: none; }
  .icl-controls { right: 16px; bottom: 15px; } .icl-controls button { padding: 7px; } .icl-controls button:first-child { display: none; }
}
`;

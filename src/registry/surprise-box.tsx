"use client";

/**
 * Surprise Box
 *
 * A wireframe shipping box sitting alone on black. Every click pokes it: the
 * box hops, its top flaps wobble, and the poke sound pitches up a step. Land
 * the fifth poke inside the combo window and the lid bursts open, throwing a
 * few hundred colored cubes into the air on real gravity before the box quietly
 * folds itself shut again.
 *
 * The scene is drawn twice. The lower copy is the box you click; the upper copy
 * is a pointer-transparent stencil of just its front and right faces, painted
 * above the rising cubes. Cubes start behind that stencil and are promoted in
 * front of it the instant their vertical velocity turns positive, so confetti
 * reads as leaving the box from inside it and falling past it on the way down.
 */

import { type CSSProperties, useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/surprise-box";

/** The BLANK monogram printed on the box side and on every confetti cube. */
const MARK_PATH =
  "M49.6591 101H45.2273L58.0455 66.0909H62.4091L75.2273 101H70.7955L60.3636 71.6136H60.0909L49.6591 101ZM51.2955 87.3636H69.1591V91.1136H51.2955V87.3636ZM80.6648 101V66.0909H84.892V83.4091H85.3011L100.983 66.0909H106.506L91.8466 81.8409L106.506 101H101.392L89.2557 84.7727L84.892 89.6818V101H80.6648Z";
const MARK_VIEWBOX = "44 64 64 39";

const DEFAULT_COLORS = [
  "#2D5847",
  "#3E7A62",
  "#4F9C7D",
  "#FF5F2E",
  "#FA3A00",
  "#FF8661",
  "#FF9DC5",
  "#FF6BA7",
  "#FF3889",
  "#2345E0",
  "#1A36B7",
  "#516CE6",
  "#FBF0EE",
  "#F8E6E2",
  "#FEFBFB",
];

const REST = "rotateX(-30deg) rotateY(-45deg)";
/** Two pokes further apart than this do not stack toward the burst. */
const COMBO_WINDOW = 400;
/** How long the lid stays open before the box folds shut and resets. */
const OPEN_DURATION = 2600;
const GRAVITY = 1600;
/** Confetti wave cadence after the opening burst. */
const WAVE_INTERVAL = 85;

const BARCODE = [
  [0, 2],
  [4, 1],
  [7, 3],
  [12, 1],
  [15, 2],
  [19, 4],
  [25, 1],
  [28, 2],
  [32, 1],
  [35, 3],
  [40, 1],
  [43, 2],
  [47, 1],
  [50, 3],
  [55, 1],
  [58, 2],
];

export interface SurpriseBoxProps {
  /** Wordmark printed on the front face. */
  label?: string;
  /** Small stencil code above the wordmark. */
  specCode?: string;
  /** Handling note under the stencil code. */
  specNote?: string;
  /** Credit line printed on the right face, beside the mark. */
  brand?: string;
  /** Pokes needed inside the combo window before the box bursts open. */
  pokesToOpen?: number;
  /** Cube colors thrown by the burst. Each gets a darker shade for side faces. */
  colors?: string[];
  /** Set false to run the whole thing silently. */
  sound?: boolean;
  /** Origin serving poke.mp3, box_land.mp3, box_explode.mp3, box_close.mp3. */
  assetBase?: string;
  className?: string;
  style?: CSSProperties;
}

type Cue = "poke" | "land" | "explode" | "close";

interface Particle {
  wrap: HTMLDivElement;
  cube: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  vrx: number;
  vry: number;
  descending: boolean;
}

export default function SurpriseBox({
  label = "aryank.space",
  specCode = "BLK-STD-01",
  specNote = "HANDLE WITH CARE",
  brand = "Powered by BLANK",
  pokesToOpen = 5,
  colors = DEFAULT_COLORS,
  sound = true,
  assetBase = ASSET_BASE,
  className,
  style,
}: SurpriseBoxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // Latest props the imperative loop reads, so a prop change never restarts it.
  const cfg = useRef({ pokesToOpen, colors, sound, assetBase });
  cfg.current = { pokesToOpen, colors, sound, assetBase };

  useEffect(() => {
    const root = rootRef.current;
    const hit = hitRef.current;
    const box = boxRef.current;
    if (!root || !hit || !box) return;

    const boxes = root.querySelectorAll<HTMLElement>(".sbx-box");
    const flaps = {
      front: box.querySelector<HTMLElement>(".sbx-flap-front"),
      back: box.querySelector<HTMLElement>(".sbx-flap-back"),
    };

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const sign = () => (Math.random() < 0.5 ? -1 : 1);

    // ---- sound -------------------------------------------------------------
    const volumes: Record<Cue, number> = {
      poke: 0.7,
      land: 0.5,
      explode: 0.9,
      close: 0.6,
    };
    const sources = {} as Record<Cue, HTMLAudioElement>;
    for (const cue of Object.keys(volumes) as Cue[]) {
      const file = cue === "poke" ? "poke.mp3" : `box_${cue}.mp3`;
      const el = new Audio(`${cfg.current.assetBase}/${file}`);
      el.preload = "auto";
      sources[cue] = el;
    }

    function play(cue: Cue, opts: { rate?: number; volume?: number } = {}) {
      if (!cfg.current.sound) return;
      const node = sources[cue].cloneNode() as HTMLAudioElement & {
        preservesPitch?: boolean;
        webkitPreservesPitch?: boolean;
      };
      // Pitch must ride the playback rate: that is what turns repeat pokes into
      // a rising scale instead of the same sample four times.
      node.preservesPitch = false;
      if ("webkitPreservesPitch" in node) node.webkitPreservesPitch = false;
      node.volume = opts.volume ?? volumes[cue];
      node.playbackRate = opts.rate ?? 1;
      node.play().catch(() => {});
    }

    // ---- box reactions -----------------------------------------------------
    let landTimer: ReturnType<typeof setTimeout> | null = null;

    /** Hop the whole box. `power` 0..1 for pokes, above 1 for the burst. */
    function hop(power: number) {
      const lift = 18 + 36 * power;
      const tilt = 4 + 8 * power;
      const dx = rand(-tilt, tilt);
      const dy = rand(-tilt, tilt);
      const dz = rand(-tilt, tilt);
      const peak = `translateY(${-lift}px) rotateX(${-30 + dx}deg) rotateY(${-45 + dy}deg) rotateZ(${dz}deg)`;
      const squash = `translateY(${lift * 0.06}px) rotateX(${-30 - dx * 0.18}deg) rotateY(${-45 - dy * 0.18}deg) rotateZ(${-dz * 0.18}deg)`;
      const frames: Keyframe[] = [
        { transform: REST, easing: "cubic-bezier(0.16, 0.84, 0.44, 1)" },
        {
          transform: peak,
          offset: 0.38,
          easing: "cubic-bezier(0.5, 0, 0.8, 0.4)",
        },
        {
          transform: squash,
          offset: 0.72,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
        { transform: REST },
      ];
      for (const el of boxes) el.animate(frames, { duration: 560 });
      if (landTimer) clearTimeout(landTimer);
      landTimer = setTimeout(
        () =>
          play("land", {
            rate: rand(0.92, 1.08),
            volume: 0.35 + 0.3 * Math.min(power, 1),
          }),
        560 * 0.72,
      );
    }

    /** Rattle the two long flaps so the lid looks loose before it gives. */
    function rattle(power: number) {
      const pairs: [HTMLElement | null, (deg: number) => string][] = [
        [flaps.front, (d) => `translateZ(1px) rotateX(${-d}deg)`],
        [flaps.back, (d) => `translateZ(1px) rotateX(${d}deg)`],
      ];
      for (const [el, to] of pairs) {
        if (!el) continue;
        const open = to((6 + 8 * power) * rand(0.6, 1.5));
        el.animate(
          [
            {
              transform: "translateZ(1px)",
              easing: "cubic-bezier(0.16, 0.84, 0.44, 1)",
            },
            { transform: open, offset: 0.32 },
            {
              transform: open,
              offset: 0.52,
              easing: "cubic-bezier(0.5, 0, 0.8, 0.4)",
            },
            { transform: "translateZ(1px)" },
          ],
          { duration: rand(380, 520), delay: rand(0, 80) },
        );
      }
    }

    // ---- confetti ----------------------------------------------------------
    const shade = (hex: string, factor: number) => {
      const h = hex.replace("#", "");
      const ch = (i: number) =>
        Math.round(Number.parseInt(h.slice(i, i + 2), 16) * factor);
      return `rgb(${ch(0)}, ${ch(2)}, ${ch(4)})`;
    };

    const small = window.matchMedia("(max-width: 768px)").matches;
    const burstCount = small ? 10 : 20;
    const waveCount = small ? 5 : 8;
    const perWave = small ? 4 : 6;
    const minSize = small ? 14 : 20;
    const maxSize = small ? 40 : 64;

    const markSvg = `<svg viewBox="${MARK_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="${MARK_PATH}" fill="white" fill-opacity="0.85"/></svg>`;

    const particles: Particle[] = [];
    let frame: number | null = null;
    let last = 0;

    function spawn(originX: number, originY: number): Particle {
      const size = rand(minSize, maxSize);
      const palette = cfg.current.colors;
      const base = palette[Math.floor(Math.random() * palette.length)];
      const dark = shade(base, 0.7);
      const half = size / 2;

      const wrap = document.createElement("div");
      wrap.className = "sbx-p-wrap";
      const cube = document.createElement("div");
      cube.className = "sbx-p-cube";
      cube.style.width = `${size}px`;
      cube.style.height = `${size}px`;

      [
        `translateZ(${half}px)`,
        `rotateY(180deg) translateZ(${half}px)`,
        `rotateY(90deg) translateZ(${half}px)`,
        `rotateY(-90deg) translateZ(${half}px)`,
        `rotateX(90deg) translateZ(${half}px)`,
        `rotateX(-90deg) translateZ(${half}px)`,
      ].forEach((transform, i) => {
        const face = document.createElement("div");
        face.className = "sbx-p-face";
        face.style.width = `${size}px`;
        face.style.height = `${size}px`;
        face.style.background = i % 3 === 1 ? dark : base;
        face.style.transform = transform;
        if (i === 0) {
          face.innerHTML = markSvg;
          const svg = face.querySelector("svg");
          if (svg) {
            svg.style.width = `${Math.round(size * 0.66)}px`;
            svg.style.height = `${Math.round(size * 0.4)}px`;
          }
        }
        cube.appendChild(face);
      });
      wrap.appendChild(cube);

      const particle: Particle = {
        wrap,
        cube,
        x: originX + rand(-20, 20) - half,
        y: originY + rand(-20, 10) - half,
        vx: sign() * rand(80, 380),
        vy: -rand(450, 900),
        rx: rand(0, 360),
        ry: rand(0, 360),
        vrx: sign() * rand(180, 720),
        vry: sign() * rand(180, 720),
        descending: false,
      };
      particles.push(particle);
      return particle;
    }

    function step(now: number) {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      const floor = (root as HTMLElement).clientHeight + 60;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rx += p.vrx * dt;
        p.ry += p.vry * dt;
        if (p.y > floor) {
          p.wrap.remove();
          particles.splice(i, 1);
          continue;
        }
        // Rising cubes stay behind the stencil; falling ones come in front.
        if (!p.descending && p.vy >= 0) {
          p.descending = true;
          p.wrap.style.zIndex = "10";
        }
        p.wrap.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        p.cube.style.transform = `rotateX(${p.rx}deg) rotateY(${p.ry}deg)`;
      }
      frame = particles.length > 0 ? requestAnimationFrame(step) : null;
    }

    function ensureLoop() {
      if (frame === null) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    }

    const waveTimers: ReturnType<typeof setTimeout>[] = [];

    function burstConfetti() {
      const rootRect = (root as HTMLElement).getBoundingClientRect();
      const rect = (box as HTMLElement).getBoundingClientRect();
      const originX = rect.left + rect.width / 2 - rootRect.left;
      const originY = rect.top + rect.height * 0.25 - rootRect.top;

      const first = document.createDocumentFragment();
      for (let i = 0; i < burstCount; i++)
        first.appendChild(spawn(originX, originY).wrap);
      (root as HTMLElement).appendChild(first);
      ensureLoop();

      for (let wave = 1; wave <= waveCount; wave++) {
        waveTimers.push(
          setTimeout(() => {
            const chunk = document.createDocumentFragment();
            for (let i = 0; i < perWave; i++)
              chunk.appendChild(spawn(originX, originY).wrap);
            (root as HTMLElement).appendChild(chunk);
            ensureLoop();
          }, wave * WAVE_INTERVAL),
        );
      }
    }

    // ---- input -------------------------------------------------------------
    let combo = 0;
    let lastPoke = 0;
    let open = false;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    function burst() {
      open = true;
      for (const el of Object.values(flaps))
        el?.getAnimations().forEach((a) => a.cancel());
      (box as HTMLElement).classList.add("sbx-open");
      play("poke", { rate: 1.3 + rand(-0.08, 0.08) });
      play("explode");
      hop(1.6);
      burstConfetti();
      closeTimer = setTimeout(() => {
        (box as HTMLElement).classList.remove("sbx-open");
        play("close", { rate: rand(0.96, 1.04) });
        combo = 0;
        open = false;
      }, OPEN_DURATION);
    }

    function poke() {
      if (open) return;
      const now = performance.now();
      combo = now - lastPoke > COMBO_WINDOW ? 1 : combo + 1;
      lastPoke = now;
      if (combo >= cfg.current.pokesToOpen) {
        burst();
        return;
      }
      const power = combo / cfg.current.pokesToOpen;
      play("poke", { rate: 0.85 + power * 0.45 + rand(-0.12, 0.12) });
      hop(power);
      rattle(power);
    }

    hit.addEventListener("click", poke);
    return () => {
      hit.removeEventListener("click", poke);
      if (landTimer) clearTimeout(landTimer);
      if (closeTimer) clearTimeout(closeTimer);
      for (const t of waveTimers) clearTimeout(t);
      if (frame !== null) cancelAnimationFrame(frame);
      for (const p of particles) p.wrap.remove();
      particles.length = 0;
    };
  }, []);

  const print = (
    <div className="sbx-print">
      <div className="sbx-print-spec">
        <span>{specCode}</span>
        <span>{specNote}</span>
      </div>
      <span className="sbx-label">{label}</span>
      <svg className="sbx-barcode" viewBox="0 0 60 24" aria-hidden="true">
        {BARCODE.map(([x, w]) => (
          <rect key={x} x={x} y="0" width={w} height="24" />
        ))}
      </svg>
    </div>
  );

  const sidePrint = (
    <div className="sbx-print sbx-print-side">
      <svg
        className="sbx-mark"
        viewBox={MARK_VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d={MARK_PATH} fill="currentColor" />
      </svg>
      <span className="sbx-brand">{brand}</span>
    </div>
  );

  return (
    <div ref={rootRef} className={`sbx-root ${className ?? ""}`} style={style}>
      <style>{CSS}</style>

      <div className="sbx-scene">
        <button
          ref={hitRef}
          type="button"
          className="sbx-hitbox"
          aria-label={`Poke the ${label} box`}
        >
          <div ref={boxRef} className="sbx-box">
            <div className="sbx-face sbx-face-front">{print}</div>
            <div className="sbx-face sbx-face-back" />
            <div className="sbx-face sbx-face-right">{sidePrint}</div>
            <div className="sbx-face sbx-face-left" />
            <div className="sbx-face sbx-face-bottom" />
            <div className="sbx-top">
              <div className="sbx-flap sbx-flap-front" />
              <div className="sbx-flap sbx-flap-back" />
              <div className="sbx-flap sbx-flap-right" />
              <div className="sbx-flap sbx-flap-left" />
            </div>
          </div>
        </button>
      </div>

      {/* Stencil copy, painted over rising confetti. */}
      <div className="sbx-scene sbx-scene-overlay" aria-hidden="true">
        <div className="sbx-hitbox">
          <div className="sbx-box">
            <div className="sbx-face sbx-face-front">{print}</div>
            <div className="sbx-face sbx-face-right">{sidePrint}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.sbx-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}
.sbx-root * { box-sizing: border-box; margin: 0; padding: 0; }
.sbx-scene {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 4000px;
  z-index: 5;
}
.sbx-scene-overlay { pointer-events: none; z-index: 7; }
.sbx-hitbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 340px;
  height: 340px;
  background: none;
  border: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transform: scale(1.3);
  transform-style: preserve-3d;
  -webkit-tap-highlight-color: transparent;
}
.sbx-hitbox:focus-visible { outline: 1px solid rgba(255,255,255,0.5); outline-offset: -40px; }
.sbx-box {
  position: relative;
  width: 220px;
  height: 140px;
  pointer-events: none;
  transform: rotateX(-30deg) rotateY(-45deg);
  transform-style: preserve-3d;
}
.sbx-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 220px;
  height: 140px;
  background: #000;
  border: 1px solid hsla(0, 0%, 100%, 0.35);
  border-radius: 4px;
  backface-visibility: visible;
}
.sbx-face-front { transform: translateZ(110px); }
.sbx-face-back { transform: rotateY(180deg) translateZ(110px); }
.sbx-face-right { transform: rotateY(90deg) translateZ(110px); }
.sbx-face-left { transform: rotateY(-90deg) translateZ(110px); }
.sbx-face-bottom {
  top: -40px;
  width: 220px;
  height: 220px;
  transform: rotateX(-90deg) translateZ(70px);
}
.sbx-face-front::after,
.sbx-face-back::after,
.sbx-face-left::after {
  content: "";
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  height: 0;
  border-top: 1px dashed hsla(0, 0%, 100%, 0.12);
}
.sbx-face-right::after {
  content: "";
  position: absolute;
  top: 24%;
  left: 50%;
  width: 54px;
  height: 14px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid hsla(0, 0%, 100%, 0.3);
  border-radius: 999px;
}
.sbx-print {
  position: absolute;
  inset: 0;
  padding: 12px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  backface-visibility: hidden;
  user-select: none;
  -webkit-user-select: none;
}
.sbx-print-spec {
  position: absolute;
  top: 12px;
  left: 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 7px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.sbx-print-side {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 6px;
  padding: 0 0 12px 14px;
}
.sbx-mark { width: 30px; height: 18px; color: rgba(255, 255, 255, 0.45); }
.sbx-brand {
  color: rgba(255, 255, 255, 0.3);
  font-size: 7px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.sbx-label {
  position: absolute;
  bottom: 12px;
  left: 14px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
  letter-spacing: 0.06em;
}
.sbx-barcode {
  position: absolute;
  bottom: 12px;
  right: 14px;
  width: 44px;
  height: 18px;
  color: rgba(255, 255, 255, 0.4);
}
.sbx-barcode rect { fill: currentColor; }
.sbx-top {
  position: absolute;
  top: -40px;
  left: 0;
  width: 220px;
  height: 220px;
  transform: rotateX(90deg) translateZ(70px);
  transform-style: preserve-3d;
}
.sbx-flap {
  position: absolute;
  background: #000;
  border: 1px solid hsla(0, 0%, 100%, 0.35);
  border-radius: 4px;
  backface-visibility: visible;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.sbx-flap-front {
  top: 110px;
  left: 0;
  width: 220px;
  height: 110px;
  transform: translateZ(1px);
  transform-origin: center bottom;
  transition-delay: 0.28s;
}
.sbx-flap-back {
  top: 0;
  left: 0;
  width: 220px;
  height: 110px;
  transform: translateZ(1px);
  transform-origin: center top;
  transition-delay: 0.28s;
}
.sbx-flap-right {
  top: 0;
  left: 110px;
  width: 110px;
  height: 220px;
  transform-origin: right center;
  transition-delay: 0s;
}
.sbx-flap-left {
  top: 0;
  left: 0;
  width: 110px;
  height: 220px;
  transform-origin: left center;
  transition-delay: 0s;
}
.sbx-box.sbx-open .sbx-flap {
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0s;
}
.sbx-box.sbx-open .sbx-flap-front { transform: translateZ(1px) rotateX(-125deg); }
.sbx-box.sbx-open .sbx-flap-back { transform: translateZ(1px) rotateX(125deg); }
.sbx-box.sbx-open .sbx-flap-right { transform: rotateY(125deg); }
.sbx-box.sbx-open .sbx-flap-left { transform: rotateY(-125deg); }
.sbx-p-wrap {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 6;
  will-change: transform;
}
.sbx-p-cube {
  position: relative;
  transform-style: preserve-3d;
  will-change: transform;
}
.sbx-p-face {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 480px) { .sbx-hitbox { transform: scale(0.8); } }
@media (max-width: 380px) { .sbx-hitbox { transform: scale(0.65); } }
`;

"use client";

/**
 * Smudge Cursor Reveal - a hero where moving the cursor smudges away the top
 * layer to reveal a hidden message underneath. Circles are stamped along the
 * pointer path into an SVG goo-filter mask, then expand and dissolve, so the
 * reveal reads like wiping fog off glass. Pointer and touch driven, no scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

export interface SmudgeCursorRevealProps {
  foreground?: string;
  background?: string;
}

const CONFIG = {
  smoothing: 0.1,
  movementThreshold: 0.01,
  sizeFromSpeed: 0.2,
  expandMultiplier: 2,
  expandTime: 2,
  expandEase: "power1.inOut",
  dissolveStart: 2,
  dissolveTime: 3,
  dissolveEase: "power3.in",
};

export default function SmudgeCursorReveal({
  foreground = "Dig in",
  background = "The things worth finding are never on the surface. They live in the parts you almost scrolled past.",
}: SmudgeCursorRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const svg = root.querySelector<SVGSVGElement>(".smr-svg");
    const blobs = root.querySelector<SVGGElement>(".smr-blobs");
    if (!svg || !blobs) return;

    const pointer = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    let started = false;
    let raf = 0;

    const move = (x: number, y: number) => {
      const rect = root.getBoundingClientRect();
      const px = x - rect.left;
      const py = y - rect.top;
      if (!started) {
        pointer.x = smooth.x = px;
        pointer.y = smooth.y = py;
        started = true;
        return;
      }
      pointer.x = px;
      pointer.y = py;
    };

    const onMouse = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    };
    root.addEventListener("mousemove", onMouse);
    root.addEventListener("touchstart", onTouch, { passive: false });
    root.addEventListener("touchmove", onTouch, { passive: false });

    const sizeSvg = () => {
      svg.style.width = `${root.clientWidth}px`;
      svg.style.height = `${root.clientHeight}px`;
    };
    sizeSvg();
    const ro = new ResizeObserver(sizeSvg);
    ro.observe(root);

    const stamp = (x: number, y: number, radius: number) => {
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", String(x));
      circle.setAttribute("cy", String(y));
      circle.setAttribute("r", String(radius));
      circle.setAttribute("fill", "#fff");
      blobs.prepend(circle);
      const animated = { current: radius };
      const tl = gsap.timeline({
        onUpdate() {
          circle.setAttribute("r", String(Math.max(0, animated.current)));
        },
        onComplete() {
          tl.kill();
          circle.remove();
        },
      });
      tl.to(animated, {
        current: radius * CONFIG.expandMultiplier,
        duration: CONFIG.expandTime,
        ease: CONFIG.expandEase,
      });
      tl.to(
        animated,
        {
          current: 0,
          duration: CONFIG.dissolveTime,
          ease: CONFIG.dissolveEase,
        },
        CONFIG.dissolveStart,
      );
    };

    const update = () => {
      if (started) {
        smooth.x += (pointer.x - smooth.x) * CONFIG.smoothing;
        smooth.y += (pointer.y - smooth.y) * CONFIG.smoothing;
        const speed = Math.hypot(pointer.x - smooth.x, pointer.y - smooth.y);
        if (speed > CONFIG.movementThreshold) {
          stamp(smooth.x, smooth.y, speed * CONFIG.sizeFromSpeed);
        }
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("mousemove", onMouse);
      root.removeEventListener("touchstart", onTouch);
      root.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <div className="smr-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="smr-foreground">
        <h1>{foreground}</h1>
      </div>
      <div className="smr-background">
        <h3>{background}</h3>
      </div>
      <svg
        className="smr-svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="smr-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="25" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 -14"
            />
          </filter>
        </defs>
        <mask id="smr-mask">
          <g className="smr-blobs" filter="url(#smr-goo)" />
        </mask>
      </svg>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:opsz,wght@9..40,100..1000&display=swap");

.smr-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #2a2b2a;
}
.smr-root * { margin: 0; padding: 0; box-sizing: border-box; }
.smr-root h1,
.smr-root h3 {
  text-transform: uppercase;
  font-family: "Anton", "DM Sans", sans-serif;
  line-height: 0.9;
  font-weight: 400;
}
.smr-root h1 { font-size: clamp(5rem, 22.5vw, 30rem); }
.smr-root h3 { font-size: clamp(2rem, 5vw, 6rem); font-weight: 400; }

.smr-foreground,
.smr-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2rem;
  text-align: center;
  user-select: none;
}
.smr-foreground {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background-color: #2a2b2a;
  color: #edf2ed;
}
.smr-background {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #cbd4c2;
  color: #323332;
  mask: url(#smr-mask);
  -webkit-mask: url(#smr-mask);
}
.smr-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
`;

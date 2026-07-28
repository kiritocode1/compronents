"use client";

/**
 * Gravity Drop Landing - a hero whose scattered thumbnails are Matter.js bodies
 * held static until you press the toggle. Gravity is zero and every body is
 * static at rest, so the layout is exactly the CSS positions until the moment
 * it is released; then each body is un-fixed and given a small random angular
 * velocity so the pile lands untidily rather than in formation. Raising them is
 * not a physics rewind: the bodies go static again and are lerped back to their
 * measured start positions on an ease-out-quad, which is what makes the return
 * read as deliberate. The same toggle re-clips the backdrop, blows the wordmark
 * from ten to twenty vw, and staggers the link columns in the opposite
 * direction on the way back.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import Matter from "matter-js";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/gravity-drop-landing";

export interface GravityDropColumn {
  heading: string;
  links: string[];
}

export interface GravityDropLandingProps {
  images?: string[];
  /** Resting position of each thumbnail, as [top%, left%]. */
  positions?: [number, number][];
  wordmark?: string;
  toggleLabel?: string;
  columns?: GravityDropColumn[];
  overlayColor?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 12 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

const DEFAULT_POSITIONS: [number, number][] = [
  [50, 5],
  [15, 10],
  [25, 15],
  [5, 37.5],
  [35, 40],
  [30, 52.5],
  [40, 50],
  [20, 60],
  [60, 65],
  [27.5, 75],
  [37.5, 85],
  [65, 82.5],
];

const DEFAULT_COLUMNS: GravityDropColumn[] = [
  {
    heading: "About Us",
    links: ["Our Team", "Our Mission", "Careers", "Contact"],
  },
  {
    heading: "Services",
    links: [
      "Web Development",
      "Mobile Apps",
      "UI/UX Design",
      "SEO Optimization",
    ],
  },
  {
    heading: "Projects",
    links: ["E-commerce", "Portfolio", "Blog", "Landing Pages"],
  },
  {
    heading: "Resources",
    links: ["Tutorials", "Documentation", "Community", "Support"],
  },
];

export default function GravityDropLanding({
  images = DEFAULT_IMAGES,
  positions = DEFAULT_POSITIONS,
  wordmark = "BLANK",
  toggleLabel = "[ Drop / Raise ]",
  columns = DEFAULT_COLUMNS,
  overlayColor = "#aaaaa0",
}: GravityDropLandingProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const { Engine, Runner, World, Bodies, Body, Events } = Matter;

    const engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0.001 } });
    const runner = Runner.create();
    Runner.run(runner, engine);

    const items = root.querySelectorAll<HTMLElement>(".gdl-item");
    const initialPositions = Array.from(items).map((item) => ({
      x: item.offsetLeft,
      y: item.offsetTop,
      angle: 0,
    }));

    const bodies = Array.from(items).map((item, index) => {
      const body = Bodies.rectangle(
        initialPositions[index].x + item.offsetWidth / 2,
        initialPositions[index].y + item.offsetHeight / 2,
        item.offsetWidth,
        item.offsetHeight,
        {
          restitution: 0.75,
          friction: 0.5,
          frictionAir: 0.0175,
          isStatic: true,
        },
      );
      World.add(engine.world, body);
      return body;
    });

    // The floor is the component's own bottom edge, not the window's, so the
    // pile lands inside a bounded preview.
    const floor = Bodies.rectangle(
      root.clientWidth / 2,
      root.clientHeight + 5,
      root.clientWidth,
      20,
      { isStatic: true },
    );
    World.add(engine.world, floor);

    let gravityEnabled = false;
    let isAnimating = false;
    const frames = new Set<number>();
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    const duration = 0.75;
    const easeOutQuad = (t: number) => t * (2 - t);

    const overlay = root.querySelector<HTMLElement>(".gdl-overlay");
    const toggleBtn = root.querySelector<HTMLElement>(".gdl-toggle-btn");

    const toggleClipPath = () => {
      gsap.to(overlay, {
        clipPath: gravityEnabled
          ? "polygon(5% 60%, 95% 60%, 95% 100%, 5% 100%)"
          : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.5,
        ease: "power3.inOut",
      });

      gsap.to(toggleBtn, {
        color: gravityEnabled ? "#fff" : "#000",
        delay: 0.5,
        duration: 1,
      });

      gsap.to(root.querySelector(".gdl-overlay h1"), {
        left: gravityEnabled ? "32.5%" : "0%",
        duration: 1,
        ease: "power4.inOut",
      });

      gsap.to(root.querySelectorAll(".gdl-overlay h1 span"), {
        fontSize: gravityEnabled ? "20cqw" : "10cqw",
        duration: 1,
        ease: "power4.inOut",
        stagger: gravityEnabled ? -0.035 : 0.035,
      });

      for (const col of root.querySelectorAll(".gdl-col")) {
        gsap.to(col.querySelectorAll(".gdl-line p"), {
          y: gravityEnabled ? 0 : 30,
          delay: gravityEnabled ? 0.75 : 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1 * (gravityEnabled ? 1 : -1),
        });
      }
    };

    const onToggle = () => {
      if (isAnimating) return;
      isAnimating = true;

      if (!gravityEnabled) {
        engine.world.gravity.y = 1;
        for (const body of bodies) {
          Body.setStatic(body, false);
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.25);
        }
        gravityEnabled = true;
      } else {
        engine.world.gravity.y = 0;
        bodies.forEach((body, index) => {
          Body.setStatic(body, true);
          const startPos = { x: body.position.x, y: body.position.y };
          const startAngle = body.angle;
          const endPos = {
            x: initialPositions[index].x + items[index].offsetWidth / 2,
            y: initialPositions[index].y + items[index].offsetHeight / 2,
          };
          const startTime = performance.now();

          const animateBack = (currentTime: number) => {
            const elapsedTime = (currentTime - startTime) / 1000;
            const t = Math.min(elapsedTime / duration, 1);
            const easedT = easeOutQuad(t);

            const x = startPos.x + easedT * (endPos.x - startPos.x);
            const y = startPos.y + easedT * (endPos.y - startPos.y);
            const angle = startAngle + easedT * (0 - startAngle);

            const timeout = setTimeout(() => {
              Body.setPosition(body, { x, y });
              Body.setAngle(body, angle);
              timeouts.delete(timeout);
            }, 750);
            timeouts.add(timeout);

            if (t < 1) {
              const frame = requestAnimationFrame(animateBack);
              frames.add(frame);
            }
          };

          const frame = requestAnimationFrame(animateBack);
          frames.add(frame);
        });
        gravityEnabled = false;
      }

      toggleClipPath();

      const settle = setTimeout(() => {
        isAnimating = false;
        timeouts.delete(settle);
      }, 2000);
      timeouts.add(settle);
    };

    toggleBtn?.addEventListener("click", onToggle);

    const afterUpdate = () => {
      bodies.forEach((body, index) => {
        const item = items[index];
        item.style.top = `${body.position.y - item.offsetHeight / 2}px`;
        item.style.left = `${body.position.x - item.offsetWidth / 2}px`;
        item.style.transform = `rotate(${body.angle}rad)`;
      });
    };
    Events.on(engine, "afterUpdate", afterUpdate);

    return () => {
      toggleBtn?.removeEventListener("click", onToggle);
      Events.off(engine, "afterUpdate", afterUpdate);
      for (const frame of frames) cancelAnimationFrame(frame);
      for (const timeout of timeouts) clearTimeout(timeout);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      gsap.killTweensOf(root.querySelectorAll("*"));
    };
  }, [images, positions, columns]);

  return (
    <div className="gdl-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="gdl-container">
        <button className="gdl-toggle-btn" type="button">
          {toggleLabel}
        </button>

        {images.map((src, i) => (
          <div
            className="gdl-item"
            key={src}
            style={{
              top: `${positions[i]?.[0] ?? 50}%`,
              left: `${positions[i]?.[1] ?? 50}%`,
            }}
          >
            <img alt="" draggable={false} src={src} />
          </div>
        ))}
      </div>

      <div className="gdl-overlay" style={{ background: overlayColor }}>
        <h1>
          {wordmark.split("").map((char, i) => (
            <span key={`${char}-${String(i)}`}>{char}</span>
          ))}
        </h1>
      </div>

      <div className="gdl-content">
        {columns.map((col) => (
          <div className="gdl-col" key={col.heading}>
            <div className="gdl-line">
              <p>{col.heading}</p>
            </div>
            {col.links.map((link) => (
              <div className="gdl-line" key={link}>
                <p>{link}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Geist+Mono:wght@100..900&display=swap");

.gdl-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Geist Mono", monospace;
  background: #000;
  color: #fff;
  overflow: hidden;
  container-type: inline-size;
}

.gdl-root * {
  box-sizing: border-box;
}

.gdl-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gdl-container {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.gdl-toggle-btn {
  position: absolute;
  top: 2em;
  right: 2em;
  background: none;
  border: none;
  outline: none;
  text-transform: uppercase;
  font-size: 12px;
  font-family: "Geist Mono", monospace;
  padding: 0.5em 1em;
  cursor: pointer;
  color: #000;
  mix-blend-mode: difference;
  z-index: 2;
}

.gdl-item {
  position: absolute;
  width: 90px;
  height: 60px;
  border: 2px solid #000;
}

.gdl-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1em;
  z-index: 0;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
}

.gdl-overlay h1 {
  position: absolute;
  bottom: 0%;
  left: 0%;
  margin: 0;
  padding: 1em;
  font-family: "Anton", sans-serif;
  text-transform: uppercase;
  line-height: 100%;
  color: #000;
}

.gdl-overlay h1 span {
  display: inline-block;
  font-size: 10cqw;
}

.gdl-content {
  position: relative;
  width: 100%;
  display: flex;
}

.gdl-col {
  flex: 1;
  padding: 2em;
  gap: 2em;
}

.gdl-col .gdl-line:nth-child(1) {
  margin-bottom: 1em;
  opacity: 0.5;
}

.gdl-line {
  position: relative;
  width: 100%;
  height: 24px;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  opacity: 0.75;
}

.gdl-line p {
  position: absolute;
  margin: 0;
  text-transform: uppercase;
  font-size: 12px;
  color: #fff;
  transform: translateY(30px);
}
`;

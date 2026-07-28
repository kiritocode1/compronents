"use client";

/**
 * Scatter Photo Physics - polaroid-style cards floating in zero gravity behind
 * a wordmark, shoved around by the cursor. Gravity is switched off entirely and
 * the bodies are held in by four static walls, so nothing settles: high air
 * friction bleeds the energy off instead, and each card drifts to a stop
 * wherever it happens to be. Moving the pointer applies a randomly directed
 * force to every card within a hundred and fifty pixels, so a sweep scatters
 * the cluster rather than pushing it, and each card carries a random starting
 * angle so the pile never looks aligned. The DOM cards are positioned from the
 * physics bodies every frame; the simulation has no renderer of its own.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import Matter from "matter-js";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/scatter-photo-physics";

export interface ScatterPhotoPhysicsProps {
  images?: string[];
  heading?: string;
  /** Radius in px within which the pointer disturbs a card. */
  influenceRadius?: number;
  /** Peak magnitude of the random impulse applied per axis. */
  forceMagnitude?: number;
}

const DEFAULT_IMAGES = Array.from(
  { length: 12 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function ScatterPhotoPhysics({
  images = DEFAULT_IMAGES,
  heading = "BLANK",
  influenceRadius = 150,
  forceMagnitude = 3,
}: ScatterPhotoPhysicsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = root.querySelector<HTMLElement>(".spp-stage");
    if (!stage) return;

    const { Engine, World, Bodies, Body } = Matter;

    const width = root.clientWidth;
    const height = root.clientHeight;
    if (!width || !height) return;

    const engine = Engine.create();
    engine.world.gravity.y = 0;

    const random = (min: number, max: number) =>
      min + Math.random() * (max - min);

    const thickness = 50;
    World.add(engine.world, [
      Bodies.rectangle(width / 2, -thickness / 2, width, thickness, {
        isStatic: true,
      }),
      Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, {
        isStatic: true,
      }),
      Bodies.rectangle(-thickness / 2, height / 2, thickness, height, {
        isStatic: true,
      }),
      Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, {
        isStatic: true,
      }),
    ]);

    interface Item {
      body: Matter.Body;
      div: HTMLElement;
    }

    const items: Item[] = images.map((src) => {
      const x = random(100, width - 100);
      const y = random(100, height - 100);

      const body = Bodies.rectangle(x, y, 100, 200, {
        frictionAir: 0.075,
        restitution: 0.25,
        density: 0.002,
        angle: Math.random() * Math.PI * 2,
      });
      World.add(engine.world, body);

      const div = document.createElement("div");
      div.className = "spp-item";
      div.style.left = `${body.position.x - 50}px`;
      div.style.top = `${body.position.y - 100}px`;
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.draggable = false;
      div.appendChild(img);
      stage.appendChild(div);

      return { body, div };
    });

    let frame = 0;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      Engine.update(engine);
      for (const item of items) {
        item.div.style.left = `${item.body.position.x - 50}px`;
        item.div.style.top = `${item.body.position.y - 100}px`;
        item.div.style.transform = `rotate(${item.body.angle}rad)`;
      }
    };
    draw();

    let lastMouseX = -1;
    const lastMouseY = -1;

    const onMouseMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // The source never updates lastMouseY (its assignment is a typo that
      // evaluates and discards), so this gate is effectively always open and
      // the cards react to almost every move. Kept as-is: closing the gate
      // would make the field noticeably less lively than the original.
      if (Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY) > 10) {
        lastMouseX = mouseX;

        for (const item of items) {
          const distance = Math.hypot(
            mouseX - item.body.position.x,
            mouseY - item.body.position.y,
          );
          if (distance < influenceRadius) {
            Body.applyForce(
              item.body,
              { x: item.body.position.x, y: item.body.position.y },
              {
                x: random(-forceMagnitude, forceMagnitude),
                y: random(-forceMagnitude, forceMagnitude),
              },
            );
          }
        }
      }
    };

    root.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("mousemove", onMouseMove);
      for (const item of items) item.div.remove();
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [images, influenceRadius, forceMagnitude]);

  return (
    <div className="spp-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="spp-stage" />
      <div className="spp-header">
        <h1>{heading}</h1>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap");

.spp-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  container-type: inline-size;
  background: #000;
}

.spp-root * {
  box-sizing: border-box;
}

.spp-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.spp-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
}

.spp-header h1 {
  margin: 0;
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 12cqw;
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 175%;
  color: #fff;
  text-align: center;
}

.spp-item {
  position: absolute;
  padding: 0.5em 0.5em 4em 0.5em;
  width: 200px;
  height: 225px;
  overflow: hidden;
  background: #fff;
}

.spp-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
}
`;

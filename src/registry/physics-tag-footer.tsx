"use client";

/**
 * Physics Tag Footer - a footer that fills itself by dropping. Scroll it into
 * view and the stack of labels rains in from above, tumbles, and piles up on
 * the floor, each one grabbable and throwable afterwards. A top wall seals the
 * box three seconds in so nothing can be flung back out.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Matter from "matter-js";
import { useEffect, useRef } from "react";

export interface PhysicsTagFooterProps {
  heroHeading?: string;
  footerHeading?: string;
  tags?: string[];
  embedded?: boolean;
}

const DEFAULT_TAGS = [
  "BLANK",
  "HTML",
  "CSS",
  "JavaScript",
  "GSAP",
  "ScrollTrigger",
  "Lenis",
  "React",
  "Next.js",
  "WebGL",
  "Three.js",
  "Creative Dev",
];

const CONFIG = {
  gravity: { x: 0, y: 1 },
  restitution: 0.5,
  friction: 0.15,
  frictionAir: 0.02,
  density: 0.002,
  wallThickness: 200,
  mouseStiffness: 0.6,
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export default function PhysicsTagFooter({
  heroHeading = "Scroll down to break the laws of web design",
  footerHeading = "Because why list when you can play?",
  tags = DEFAULT_TAGS,
  embedded = true,
}: PhysicsTagFooterProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".pob-content");
    const section = root.querySelector<HTMLElement>(".pob-footer");
    const container = root.querySelector<HTMLElement>(".pob-object-container");
    if (!content || !section || !container) return;

    let engine: Matter.Engine | null = null;
    let runner: Matter.Runner | null = null;
    let frame = 0;
    let topWallTimer = 0;
    const cleanups: (() => void)[] = [];
    const bodies: {
      body: Matter.Body;
      element: HTMLElement;
      width: number;
      height: number;
    }[] = [];

    const initPhysics = () => {
      engine = Matter.Engine.create();
      engine.gravity = CONFIG.gravity as Matter.Gravity;
      engine.constraintIterations = 10;
      engine.positionIterations = 20;
      engine.velocityIterations = 16;
      engine.timing.timeScale = 1;

      const containerRect = container.getBoundingClientRect();
      const wallThickness = CONFIG.wallThickness;

      const walls = [
        Matter.Bodies.rectangle(
          containerRect.width / 2,
          containerRect.height + wallThickness / 2,
          containerRect.width + wallThickness * 2,
          wallThickness,
          { isStatic: true },
        ),
        Matter.Bodies.rectangle(
          -wallThickness / 2,
          containerRect.height / 2,
          wallThickness,
          containerRect.height + wallThickness * 2,
          { isStatic: true },
        ),
        Matter.Bodies.rectangle(
          containerRect.width + wallThickness / 2,
          containerRect.height / 2,
          wallThickness,
          containerRect.height + wallThickness * 2,
          { isStatic: true },
        ),
      ];
      Matter.World.add(engine.world, walls);

      const objects = gsap.utils.toArray<HTMLElement>(
        container.querySelectorAll(".pob-object"),
      );
      objects.forEach((obj, index) => {
        const objRect = obj.getBoundingClientRect();

        const startX =
          Math.random() * (containerRect.width - objRect.width) +
          objRect.width / 2;
        const startY = -500 - index * 200;
        const startRotation = (Math.random() - 0.5) * Math.PI;

        const body = Matter.Bodies.rectangle(
          startX,
          startY,
          objRect.width,
          objRect.height,
          {
            restitution: CONFIG.restitution,
            friction: CONFIG.friction,
            frictionAir: CONFIG.frictionAir,
            density: CONFIG.density,
          },
        );

        Matter.Body.setAngle(body, startRotation);

        bodies.push({
          body,
          element: obj,
          width: objRect.width,
          height: objRect.height,
        });

        if (engine) Matter.World.add(engine.world, body);
      });

      topWallTimer = window.setTimeout(() => {
        if (!engine) return;
        const topWall = Matter.Bodies.rectangle(
          containerRect.width / 2,
          -wallThickness / 2,
          containerRect.width + wallThickness * 2,
          wallThickness,
          { isStatic: true },
        );
        Matter.World.add(engine.world, topWall);
      }, 3000);

      const mouse = Matter.Mouse.create(container);
      const wheelHandler = (
        mouse as unknown as { mousewheel: (e: Event) => void }
      ).mousewheel;
      mouse.element.removeEventListener("mousewheel", wheelHandler);
      mouse.element.removeEventListener("DOMMouseScroll", wheelHandler);

      const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: CONFIG.mouseStiffness,
          render: { visible: false },
        },
      } as Matter.IMouseConstraintDefinition);

      mouseConstraint.mouse.element.oncontextmenu = () => false;

      let dragging: Matter.Body | null = null;
      let originalInertia: number | null = null;

      Matter.Events.on(mouseConstraint, "startdrag", (event) => {
        dragging = (event as unknown as { body: Matter.Body }).body;
        if (dragging) {
          originalInertia = dragging.inertia;
          Matter.Body.setInertia(dragging, Number.POSITIVE_INFINITY);
          Matter.Body.setVelocity(dragging, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(dragging, 0);
        }
      });

      Matter.Events.on(mouseConstraint, "enddrag", () => {
        if (dragging) {
          Matter.Body.setInertia(dragging, originalInertia || 1);
          dragging = null;
          originalInertia = null;
        }
      });

      Matter.Events.on(engine, "beforeUpdate", () => {
        if (!dragging) return;
        const target = dragging;
        const found = bodies.find((b) => b.body === target);
        if (!found) return;

        const minX = found.width / 2;
        const maxX = containerRect.width - found.width / 2;
        const minY = found.height / 2;
        const maxY = containerRect.height - found.height / 2;

        Matter.Body.setPosition(target, {
          x: clamp(target.position.x, minX, maxX),
          y: clamp(target.position.y, minY, maxY),
        });

        Matter.Body.setVelocity(target, {
          x: clamp(target.velocity.x, -20, 20),
          y: clamp(target.velocity.y, -20, 20),
        });
      });

      const releaseDrag = () => {
        mouseConstraint.constraint.bodyB = null;
        (
          mouseConstraint.constraint as unknown as {
            pointB: Matter.Vector | null;
          }
        ).pointB = null;
      };
      container.addEventListener("mouseleave", releaseDrag);
      document.addEventListener("mouseup", releaseDrag);
      cleanups.push(() => {
        container.removeEventListener("mouseleave", releaseDrag);
        document.removeEventListener("mouseup", releaseDrag);
      });

      Matter.World.add(engine.world, mouseConstraint);

      runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      const updatePositions = () => {
        for (const { body, element, width, height } of bodies) {
          const x = clamp(
            body.position.x - width / 2,
            0,
            containerRect.width - width,
          );
          const y = clamp(
            body.position.y - height / 2,
            -height * 3,
            containerRect.height - height,
          );

          element.style.left = `${x}px`;
          element.style.top = `${y}px`;
          element.style.transform = `rotate(${body.angle}rad)`;
        }

        frame = requestAnimationFrame(updatePositions);
      };
      updatePositions();
    };

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const st = ScrollTrigger.create({
      trigger: section,
      scroller,
      start: "top bottom",
      once: true,
      onEnter: () => {
        if (!engine) initPhysics();
      },
    });

    ScrollTrigger.refresh();

    return () => {
      st.kill();
      cancelAnimationFrame(frame);
      clearTimeout(topWallTimer);
      for (const fn of cleanups) fn();
      if (runner) Matter.Runner.stop(runner);
      if (engine) {
        Matter.World.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, tags]);

  return (
    <div
      className={embedded ? "pob-root pob-embedded" : "pob-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="pob-content">
        <section className="pob-hero">
          <h1>{heroHeading}</h1>
        </section>

        <section className="pob-footer">
          <div className="pob-object-container">
            {tags.map((tag) => (
              <div className="pob-object" key={tag}>
                <p>{tag}</p>
              </div>
            ))}
          </div>

          <div className="pob-footer-content">
            <h1>{footerHeading}</h1>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.pob-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "DM Sans", sans-serif;
}
.pob-root.pob-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.pob-root.pob-embedded::-webkit-scrollbar { display: none; }
.pob-root * { margin: 0; padding: 0; box-sizing: border-box; }
.pob-content { position: relative; width: 100%; }
.pob-root h1 {
  font-size: 4rem;
  font-weight: 500;
  letter-spacing: -0.04rem;
  line-height: 1.2;
  user-select: none;
}
.pob-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  overflow: hidden;
}
.pob-hero h1,
.pob-footer h1 {
  width: 45%;
  text-align: center;
}
.pob-hero {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  color: #0f0f0f;
}
.pob-footer {
  background-color: #0f0f0f;
  color: #fff;
}
.pob-footer-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}
.pob-footer-content * { pointer-events: auto; }
.pob-object-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.pob-object {
  position: absolute;
  width: max-content;
  font-size: 2rem;
  font-weight: 500;
  background-color: #fff;
  color: #0f0f0f;
  padding: 1rem 2rem;
  border-radius: 50px;
  cursor: grab;
  user-select: none;
  pointer-events: auto;
  z-index: 2;
}
.pob-object:active { cursor: grabbing; }

@media (max-width: 1000px) {
  .pob-root h1 { font-size: 2rem; }
  .pob-hero h1,
  .pob-footer h1 { width: 100%; }
  .pob-object { font-size: 1rem; }
}
`;

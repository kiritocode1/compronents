"use client";

/**
 * Falling Tag List - a hover list where labels drop in as physical pills.
 *
 * Each row is an oversized name. Hovering springs the row open, fans a small
 * stack of images up from behind it, and drops its descriptor tags in as rounded
 * physics bodies that tumble and settle on a floor (Matter.js). Leaving fades the
 * pills out, collapses the row, and slides the images back down. The name flips
 * between a resting and an active color on the way.
 *
 * Reads from its own box, so it embeds in a bounded demo or fills a section.
 * GSAP for the springs, Matter.js for the pile.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import Matter from "matter-js";
import { useEffect, useRef } from "react";

export interface FallingTagService {
  name: string;
  tags: string[];
  images: string[];
}

export interface FallingTagListProps {
  services?: FallingTagService[];
  background?: string;
  nameColor?: string;
  hoverColor?: string;
  tagColor?: string;
}

const COMPRONENTS_ASSET_BASE =
  "https://compronents.dev/assets/falling-tag-list";

const DEFAULT_SERVICES: FallingTagService[] = [
  {
    name: "Silhouette",
    tags: [
      "Editorial",
      "Fashion Identity",
      "Monochrome",
      "Shadow Play",
      "Minimalism",
      "Studio Portraits",
    ],
    images: [1, 2, 3].map(
      (n) => `${COMPRONENTS_ASSET_BASE}/service_1_img_${n}.jpg`,
    ),
  },
  {
    name: "Chroma",
    tags: [
      "Color Theory",
      "Graphics",
      "Poster Design",
      "Saturation",
      "Pop Art",
      "Visual Energy",
    ],
    images: [1, 2, 3].map(
      (n) => `${COMPRONENTS_ASSET_BASE}/service_2_img_${n}.jpg`,
    ),
  },
  {
    name: "Persona",
    tags: [
      "Character Design",
      "Portraits",
      "Visual Storytelling",
      "Emotion",
      "Identity",
      "Artistic Direction",
    ],
    images: [1, 2, 3].map(
      (n) => `${COMPRONENTS_ASSET_BASE}/service_3_img_${n}.jpg`,
    ),
  },
];

export default function FallingTagList({
  services = DEFAULT_SERVICES,
  background = "#171717",
  nameColor = "#ff3831",
  hoverColor = "#ffffd9",
  tagColor = "#ffffd9",
}: FallingTagListProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: colors seed CSS vars / tween targets; the physics wiring rebuilds only when the service set changes.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const { Engine, Composite, Bodies, Body } = Matter;
    const serviceEls = Array.from(
      root.querySelectorAll<HTMLElement>(".ftl-service"),
    );

    const measureTag = (label: string) => {
      const ghost = document.createElement("div");
      ghost.className = "ftl-tag";
      ghost.style.position = "absolute";
      ghost.style.visibility = "hidden";
      ghost.textContent = label;
      root.appendChild(ghost);
      const size = { width: ghost.offsetWidth, height: ghost.offsetHeight };
      ghost.remove();
      return size;
    };

    const teardowns = serviceEls.map((service) => {
      const serviceImages = service.querySelectorAll<HTMLElement>(".ftl-img");
      const serviceName = service.querySelector<HTMLElement>("h2");
      const tagLabels = (service.dataset.tags ?? "").split("|").filter(Boolean);
      const tagSizes = tagLabels.map(measureTag);

      let engine: Matter.Engine | null = null;
      let tagElements: HTMLElement[] = [];
      let tagBodies: Matter.Body[] = [];
      let rafId = 0;
      let tagsContainer: HTMLElement | null = null;
      let isHovered = false;
      let dropTimer: gsap.core.Tween | null = null;

      const cleanupTags = () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (engine) Engine.clear(engine);
        if (tagsContainer) tagsContainer.remove();
        tagElements = [];
        tagBodies = [];
        engine = null;
        rafId = 0;
        tagsContainer = null;
      };

      const createTags = () => {
        cleanupTags();
        const w = service.offsetWidth;
        const h = service.offsetHeight;

        tagsContainer = document.createElement("div");
        tagsContainer.className = "ftl-tags";
        service.appendChild(tagsContainer);

        engine = Engine.create({ gravity: { x: 0, y: 2, scale: 0.001 } });
        const wallThickness = 20;
        const floorOffset = w < 1000 ? 25 : 50;

        const floor = Bodies.rectangle(
          w / 2,
          h - floorOffset + wallThickness / 2,
          w * 3,
          wallThickness,
          { isStatic: true },
        );
        const leftWall = Bodies.rectangle(
          -wallThickness / 2,
          h / 2,
          wallThickness,
          h * 3,
          { isStatic: true },
        );
        const rightWall = Bodies.rectangle(
          w + wallThickness / 2,
          h / 2,
          wallThickness,
          h * 3,
          { isStatic: true },
        );
        Composite.add(engine.world, [floor, leftWall, rightWall]);

        tagLabels.forEach((label, i) => {
          const tagEl = document.createElement("div");
          tagEl.className = "ftl-tag";
          tagEl.textContent = label;
          tagsContainer?.appendChild(tagEl);

          const tagWidth = tagSizes[i].width;
          const tagHeight = tagSizes[i].height;
          const startX = w * 0.25 + Math.random() * w * 0.5;
          const startY = -(tagHeight / 2) - i * 5;
          const angle = (Math.random() - 0.5) * 0.4;

          const body = Bodies.rectangle(startX, startY, tagWidth, tagHeight, {
            chamfer: { radius: tagHeight / 2 },
            restitution: 0.15,
            friction: 0.6,
            density: 0.002,
          });
          Body.setAngle(body, angle);
          if (engine) Composite.add(engine.world, body);

          gsap.to(tagEl, {
            opacity: 1,
            duration: 0.3,
            delay: i * 0.04,
            ease: "power2.out",
          });

          tagElements.push(tagEl);
          tagBodies.push(body);
        });

        const update = () => {
          if (!engine) return;
          Engine.update(engine, 1000 / 60);
          for (let i = 0; i < tagElements.length; i++) {
            const body = tagBodies[i];
            const el = tagElements[i];
            const tw = tagSizes[i].width;
            const th = tagSizes[i].height;
            el.style.transform = `translate(${body.position.x - tw / 2}px, ${body.position.y - th / 2}px) rotate(${body.angle}rad)`;
          }
          rafId = requestAnimationFrame(update);
        };
        rafId = requestAnimationFrame(update);
      };

      const onEnter = () => {
        isHovered = true;
        const expandedHeight = service.offsetWidth < 1000 ? "12.5rem" : "25rem";
        gsap.killTweensOf(service);
        gsap.killTweensOf(serviceImages);
        if (serviceName) gsap.killTweensOf(serviceName);

        gsap.to(service, {
          height: expandedHeight,
          duration: 0.75,
          ease: "elastic.out(1,0.5)",
        });
        if (serviceName) {
          gsap.to(serviceName, {
            color: hoverColor,
            duration: 0.25,
            ease: "power4.out",
          });
        }
        gsap.to(serviceImages, {
          y: "-50%",
          duration: 0.75,
          ease: "elastic.out(1,0.5)",
          stagger: 0.075,
        });
        dropTimer = gsap.delayedCall(0.2, () => {
          if (isHovered) createTags();
        });
      };

      const onLeave = () => {
        isHovered = false;
        const collapsedHeight = service.offsetWidth < 1000 ? "5rem" : "10rem";
        if (dropTimer) dropTimer.kill();
        gsap.killTweensOf(service);
        gsap.killTweensOf(serviceImages);
        if (serviceName) gsap.killTweensOf(serviceName);

        if (tagElements.length) {
          gsap.to(tagElements, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.out",
            onComplete: cleanupTags,
          });
        } else {
          cleanupTags();
        }
        if (serviceName) {
          gsap.to(serviceName, {
            color: nameColor,
            duration: 0.25,
            ease: "power4.out",
          });
        }
        gsap.to(serviceImages, {
          y: "50%",
          duration: 0.75,
          ease: "elastic.out(1,0.5)",
          stagger: 0.075,
        });
        gsap.to(service, {
          height: collapsedHeight,
          duration: 0.5,
          ease: "elastic.out(1,0.75)",
        });
      };

      service.addEventListener("mouseenter", onEnter);
      service.addEventListener("mouseleave", onLeave);

      return () => {
        service.removeEventListener("mouseenter", onEnter);
        service.removeEventListener("mouseleave", onLeave);
        if (dropTimer) dropTimer.kill();
        cleanupTags();
      };
    });

    return () => {
      for (const teardown of teardowns) teardown();
    };
  }, [services]);

  return (
    <div
      ref={rootRef}
      className="ftl-root"
      style={
        {
          "--ftl-bg": background,
          "--ftl-name": nameColor,
          "--ftl-tag": tagColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      {services.map((service) => (
        <div
          className="ftl-service"
          data-tags={service.tags.join("|")}
          key={service.name}
        >
          <div className="ftl-name">
            <h2>{service.name}</h2>
          </div>
          <div className="ftl-images">
            {service.images.map((src, i) => (
              <div className="ftl-img" key={`${service.name}-${i}`}>
                {/* biome-ignore lint/performance/noImgElement: raw cover thumbnail fanned behind the name. */}
                <img src={src} alt="" draggable={false} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = `
.ftl-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 520px;
  padding: 2rem;
  background: var(--ftl-bg);
  color: var(--ftl-name);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  container-type: inline-size;
  font-family: "Barlow Condensed", ui-sans-serif, system-ui, sans-serif;
}

.ftl-service {
  position: relative;
  width: max-content;
  height: 10rem;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  cursor: pointer;
  will-change: height;
}

.ftl-name h2 {
  position: relative;
  margin: 0;
  text-transform: uppercase;
  font-size: clamp(3.5rem, 14cqw, 10rem);
  font-weight: 900;
  letter-spacing: -0.1rem;
  line-height: 1;
  background: var(--ftl-bg);
  z-index: 2;
}

.ftl-images {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 25rem;
  height: 20rem;
  overflow: hidden;
}

.ftl-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  width: 15rem;
  height: 10rem;
  border-radius: 0.35rem;
  overflow: hidden;
}

.ftl-img:nth-child(1) {
  transform-origin: bottom left;
  transform: translate(-50%, 50%) rotate(-5deg);
  margin-top: -1.5rem;
}

.ftl-img:nth-child(2) {
  transform-origin: bottom right;
  transform: translate(-50%, 50%) rotate(2.5deg);
  margin-top: -1.5rem;
}

.ftl-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.ftl-tags {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.ftl-tag {
  position: absolute;
  top: 0;
  left: 0;
  font-family: ui-serif, Georgia, serif;
  font-size: 1rem;
  color: var(--ftl-tag);
  background: var(--ftl-bg);
  border: 1px solid var(--ftl-tag);
  border-radius: 4rem;
  padding: 0.5rem 1.5rem;
  white-space: nowrap;
  opacity: 0;
  will-change: transform, opacity;
}

@media (max-width: 999px) {
  .ftl-service {
    height: 5rem;
  }
  .ftl-images {
    width: 12.5rem;
    height: 10rem;
  }
  .ftl-img {
    width: 7.5rem;
    height: 5rem;
  }
  .ftl-img:nth-child(1),
  .ftl-img:nth-child(2) {
    margin-top: -0.75rem;
  }
  .ftl-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
  }
}
`;

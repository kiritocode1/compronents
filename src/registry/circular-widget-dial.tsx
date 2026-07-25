"use client";

/**
 * Circular Widget Dial - a ring of image segments that never stops turning.
 * The ring rotates one way, a thin indicator line sweeps the other, and
 * whichever segment sits under the line becomes the desaturated full-bleed
 * backdrop with its name on a chip in the middle. Scrolling the wheel over it
 * spins both faster or throws them into reverse, and everything eases on a lerp
 * so the dial always coasts to a stop instead of snapping.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useId, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/circular-widget-dial";

export interface CircularWidget {
  image: string;
  name: string;
}

export interface CircularWidgetDialProps {
  widgets?: CircularWidget[];
  accent?: string;
  background?: string;
  spinSpeed?: number;
}

const DEFAULT_WIDGETS: CircularWidget[] = [
  { image: `${ASSET_BASE}/widget_1.jpg`, name: "Velvet" },
  { image: `${ASSET_BASE}/widget_2.jpg`, name: "Glass Relay" },
  { image: `${ASSET_BASE}/widget_3.jpg`, name: "Noir-17" },
  { image: `${ASSET_BASE}/widget_4.jpg`, name: "Driftline" },
  { image: `${ASSET_BASE}/widget_5.jpg`, name: "Pulse 9" },
  { image: `${ASSET_BASE}/widget_6.jpg`, name: "Cold Meridian" },
  { image: `${ASSET_BASE}/widget_7.jpg`, name: "Astra" },
  { image: `${ASSET_BASE}/widget_8.jpg`, name: "Mono Circuit" },
  { image: `${ASSET_BASE}/widget_9.jpg`, name: "Lumen-04" },
  { image: `${ASSET_BASE}/widget_10.jpg`, name: "Shadow Bloom" },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const createSVG = <K extends keyof SVGElementTagNameMap>(
  type: K,
  attrs: Record<string, string | number> = {},
): SVGElementTagNameMap[K] => {
  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    type,
  );
  for (const [k, v] of Object.entries(attrs)) {
    svgElement.setAttribute(k, String(v));
  }
  return svgElement;
};

export default function CircularWidgetDial({
  widgets = DEFAULT_WIDGETS,
  accent = "#ffff2b",
  background = "#000",
  spinSpeed = 18,
}: CircularWidgetDialProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const container = root.querySelector<HTMLElement>(".cwd-widgets");
    const previewContainer = root.querySelector<HTMLElement>(
      ".cwd-widget-preview-img",
    );
    const titleEl = root.querySelector<HTMLElement>(".cwd-widget-title");
    if (!container || !previewContainer || !titleEl) return;

    let svg: SVGSVGElement | null = null;
    let centerX = 0;
    let centerY = 0;
    let outerRadius = 0;
    let currentIndicatorRotation = 0;
    let targetIndicatorRotation = 0;
    let currentSpinnerRotation = 0;
    let targetSpinnerRotation = 0;
    let lastTime = performance.now();
    let lastSegmentIndex = -1;
    let frame = 0;

    const createWidgetSpinner = () => {
      const frameWidth = container.clientWidth;
      const frameHeight = container.clientHeight;
      const viewportSize = Math.min(frameWidth, frameHeight);
      outerRadius = viewportSize * 0.4;
      const innerRadius = viewportSize * 0.25;
      centerX = frameWidth / 2;
      centerY = frameHeight / 2;

      svg = createSVG("svg", { class: "cwd-widget-svg" });
      const defs = createSVG("defs");
      svg.appendChild(defs);

      const anglePerSegment = (2 * Math.PI) / widgets.length;

      for (let i = 0; i < widgets.length; i++) {
        const startAngle = i * anglePerSegment - Math.PI / 2;
        const endAngle = (i + 1) * anglePerSegment - Math.PI / 2;
        const midAngle = (startAngle + endAngle) / 2;

        const clipPath = createSVG("clipPath", { id: `cwd-${uid}-clip-${i}` });
        const path = `M ${centerX + outerRadius * Math.cos(startAngle)} ${
          centerY + outerRadius * Math.sin(startAngle)
        } A ${outerRadius} ${outerRadius} 0 0 1 ${
          centerX + outerRadius * Math.cos(endAngle)
        } ${centerY + outerRadius * Math.sin(endAngle)} L ${
          centerX + innerRadius * Math.cos(endAngle)
        } ${
          centerY + innerRadius * Math.sin(endAngle)
        } A ${innerRadius} ${innerRadius} 0 0 0 ${
          centerX + innerRadius * Math.cos(startAngle)
        } ${centerY + innerRadius * Math.sin(startAngle)} Z`;

        clipPath.appendChild(createSVG("path", { d: path }));
        defs.appendChild(clipPath);

        const g = createSVG("g", {
          "clip-path": `url(#cwd-${uid}-clip-${i})`,
          "data-segment": i,
        });

        const segmentRadius = (innerRadius + outerRadius) / 2;
        const segmentX = centerX + Math.cos(midAngle) * segmentRadius;
        const segmentY = centerY + Math.sin(midAngle) * segmentRadius;

        const arcLength = outerRadius * anglePerSegment;
        const imgWidth = arcLength * 1.25;
        const imgHeight = (outerRadius - innerRadius) * 1.25;
        const rotation = (midAngle * 180) / Math.PI + 90;

        const image = createSVG("image", {
          href: widgets[i].image,
          width: imgWidth,
          height: imgHeight,
          x: segmentX - imgWidth / 2,
          y: segmentY - imgHeight / 2,
          preserveAspectRatio: "xMidYMid slice",
          transform: `rotate(${rotation} ${segmentX} ${segmentY})`,
        });
        image.setAttribute("crossorigin", "anonymous");

        g.appendChild(image);
        svg.appendChild(g);
      }

      container.appendChild(svg);
    };

    const addIndicator = () => {
      if (!svg) return;
      const innerRadius = outerRadius * 0.625;
      const widgetIndicator = createSVG("line", {
        class: "cwd-widget-indicator",
        x1: centerX,
        y1: centerY - innerRadius * 0.85,
        x2: centerX,
        y2: centerY - outerRadius * 1.05,
      });
      svg.appendChild(widgetIndicator);
    };

    const updateContent = () => {
      const relativeRotation =
        (((currentIndicatorRotation - currentSpinnerRotation) % 360) + 360) %
        360;
      const segmentIndex =
        Math.floor(relativeRotation / (360 / widgets.length)) % widgets.length;

      if (segmentIndex === lastSegmentIndex) return;
      lastSegmentIndex = segmentIndex;

      titleEl.textContent = widgets[segmentIndex].name;

      const img = document.createElement("img");
      img.src = widgets[segmentIndex].image;
      img.alt = widgets[segmentIndex].name;
      img.crossOrigin = "anonymous";

      gsap.set(img, { opacity: 0 });
      previewContainer.appendChild(img);
      gsap.to(img, { opacity: 1, duration: 0.1, ease: "power2.out" });

      const allImages = previewContainer.querySelectorAll("img");
      if (allImages.length > 3) {
        for (let i = 0; i < allImages.length - 3; i++) {
          previewContainer.removeChild(allImages[i]);
        }
      }
    };

    const animate = () => {
      const currentTime = performance.now();
      let deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      deltaTime = Math.min(deltaTime, 0.1);

      targetIndicatorRotation += spinSpeed * deltaTime;
      targetSpinnerRotation -= spinSpeed * 0.25 * deltaTime;

      currentIndicatorRotation = lerp(
        currentIndicatorRotation,
        targetIndicatorRotation,
        0.1,
      );
      currentSpinnerRotation = lerp(
        currentSpinnerRotation,
        targetSpinnerRotation,
        0.1,
      );

      svg
        ?.querySelector(".cwd-widget-indicator")
        ?.setAttribute(
          "transform",
          `rotate(${currentIndicatorRotation % 360} ${centerX} ${centerY})`,
        );

      for (const seg of Array.from(
        svg?.querySelectorAll("[data-segment]") ?? [],
      )) {
        seg.setAttribute(
          "transform",
          `rotate(${currentSpinnerRotation % 360} ${centerX} ${centerY})`,
        );
      }

      updateContent();

      frame = requestAnimationFrame(animate);
    };

    createWidgetSpinner();
    addIndicator();
    animate();

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.05;
      targetIndicatorRotation += delta;
      targetSpinnerRotation -= delta;
    };
    root.addEventListener("wheel", onWheel, { passive: false });

    const onResize = () => {
      if (svg) svg.remove();
      createWidgetSpinner();
      addIndicator();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      svg?.remove();
      previewContainer.replaceChildren();
    };
  }, [widgets, spinSpeed, uid]);

  return (
    <div
      className="cwd-root"
      ref={rootRef}
      style={
        {
          "--cwd-light": accent,
          "--cwd-dark": background,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <section className="cwd-widgets">
        <div className="cwd-widget-preview-img" />
        <div className="cwd-widget-title" />
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap");

.cwd-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Geist Mono", monospace;
  background-color: var(--cwd-dark);
  overflow: hidden;
}
.cwd-root * { margin: 0; padding: 0; box-sizing: border-box; }
.cwd-root img { width: 100%; height: 100%; object-fit: cover; }
.cwd-widgets {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.cwd-widget-preview-img {
  position: absolute;
  width: 100%;
  height: 100%;
}
.cwd-widget-preview-img img {
  position: absolute;
  top: 0;
  left: 0;
  will-change: opacity;
  filter: saturate(0);
}
.cwd-widget-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background-color: var(--cwd-light);
  color: var(--cwd-dark);
  border-radius: 0.125rem;
  z-index: 2;
}
.cwd-widget-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.cwd-widget-indicator {
  stroke: var(--cwd-light);
  stroke-width: 3;
  stroke-linecap: round;
}
`;

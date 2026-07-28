"use client";

/**
 * Radial Name Wheel - sixty labels laid around a circle eleven hundred pixels
 * across, most of it off-frame, so you only ever see the arc that passes
 * through the viewport. Scroll rotates the whole ring by a ten-thousandth of a
 * pixel per unit, which is why a very long page turns it slowly and evenly, and
 * every label is re-placed with cos and sin plus a rotation matching its own
 * angle, so the type stays tangent to the circle. Hovering a label pushes an
 * image into a frame that trails the cursor, clip-wiped up from the bottom;
 * leaving wipes it away from the top, and older images in the stack are cleared
 * on a delay so a fast sweep leaves a brief trail rather than snapping.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/radial-name-wheel";

export interface RadialNameWheelProps {
  names?: string[];
  images?: string[];
  /** Radius of the ring in px. */
  radius?: number;
  brand?: string;
  navNote?: string;
  links?: string[];
  footerNote?: string;
  embedded?: boolean;
}

const DEFAULT_NAMES = [
  "Lunar Horizon Lounge",
  "Martian Red Quarters",
  "Orbit Oasis Chamber",
  "Neon Nexus Home",
  "Quantum Quiet Quarters",
  "Galactic Gateway Studio",
  "Starlight Sky Suite",
  "Void Vector Villa",
  "Cosmic Cove Nook",
  "Satellite Space Site",
  "Plasma Peak Penthouse",
  "Asteroid Alley Loft",
  "Celestial City Condo",
  "Pulsar Point Pavilion",
  "Gravity Garden Suite",
  "Interstellar Ivy Inn",
  "Nebula Nest Nook",
  "Exoplanet Escape Estate",
  "Meteorite Mansion Den",
  "Black Hole Bungalow",
  "Warp World Workshop",
  "Photon Particle Pod",
  "Dark Matter Den",
  "Event Horizon Home",
  "Solar Flare Studio",
  "Quantum Leap Lounge",
  "Supernova Sun Suite",
  "Eclipse Edge Enclave",
  "Galaxy Garden Gazebo",
  "Time Traveler Terrace",
  "Orbital Observatory Outpost",
  "Gravity Grove Grotto",
  "Cosmos Cottage Core",
  "Space-Time Spiral Studio",
  "Alien Array Atrium",
  "Dimensional Dome Dwelling",
  "Vortex Valley Villa",
  "Starship Station Studio",
  "Quantum Quasar Quarters",
  "Planetary Plaza Penthouse",
  "Rocket Range Room",
  "Spectrum Spire Space",
  "Terraforming Tower Terrace",
  "Universe Utopia Unit",
  "Void Vista View",
  "Wormhole Wall Window",
  "Xenon Xeriscape Xanadu",
  "Yield Yacht Yard",
  "Zenith Zone Zephyr",
  "Alpha Aurora Atrium",
  "Beta Bridge Bastion",
  "Gamma Garden Gateway",
  "Delta Dome Den",
  "Epsilon Echo Estate",
  "Zeta Zenith Zone",
  "Eta Echo Enclave",
  "Theta Theater Thicket",
  "Iota Island Inn",
  "Kappa Keep Kiosk",
  "Lambda Loft Lounge",
];

const DEFAULT_IMAGES = Array.from(
  { length: 60 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function RadialNameWheel({
  names = DEFAULT_NAMES,
  images = DEFAULT_IMAGES,
  radius = 1100,
  brand = "BLANK",
  navNote = "Interface studies, 2026",
  links = ["Components", "Pages", "Backend"],
  footerNote = "Scroll to turn",
  embedded = true,
}: RadialNameWheelProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cursor = root.querySelector<HTMLElement>(".rnw-cursor");
    const gallery = root.querySelector<HTMLElement>(".rnw-gallery");
    const scroller = root.querySelector<HTMLElement>(".rnw-scroller");
    if (!cursor || !gallery || !scroller) return;

    const numberOfItems = names.length;
    // The ring is centred on the component's own box rather than the window.
    const centerX = root.clientWidth / 2;
    const centerY = root.clientHeight / 2;
    const angleIncrement = (2 * Math.PI) / numberOfItems;

    const cleanups: (() => void)[] = [];
    const timeouts = new Set<ReturnType<typeof setTimeout>>();
    const created: HTMLElement[] = [];

    for (let i = 0; i < numberOfItems; i++) {
      const item = document.createElement("div");
      item.className = "rnw-item";
      const p = document.createElement("p");
      const count = document.createElement("span");
      p.textContent = names[i];
      count.textContent = `(${Math.floor(Math.random() * 50) + 1})`;
      item.appendChild(p);
      p.appendChild(count);
      gallery.appendChild(item);
      created.push(item);

      const angle = i * angleIncrement;
      gsap.set(item, {
        x: `${centerX + radius * Math.cos(angle)}px`,
        y: `${centerY + radius * Math.sin(angle)}px`,
        rotation: (angle * 180) / Math.PI,
      });

      const onOver = () => {
        const img = document.createElement("img");
        img.src = images[i % images.length];
        img.alt = "";
        img.draggable = false;
        img.style.clipPath = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
        cursor.appendChild(img);

        gsap.to(img, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "power3.out",
        });
      };

      const onOut = () => {
        const imgs = cursor.getElementsByTagName("img");
        if (!imgs.length) return;
        const lastImg = imgs[imgs.length - 1];

        for (const img of Array.from(imgs)) {
          if (img === lastImg) continue;
          gsap.to(img, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            delay: 0.5,
            ease: "power3.out",
            onComplete: () => {
              const t = setTimeout(() => {
                img.remove();
                timeouts.delete(t);
              }, 1000);
              timeouts.add(t);
            },
          });
        }

        gsap.to(lastImg, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          ease: "power3.out",
          delay: 0.25,
        });
      };

      item.addEventListener("mouseover", onOver);
      item.addEventListener("mouseout", onOut);
      cleanups.push(() => {
        item.removeEventListener("mouseover", onOver);
        item.removeEventListener("mouseout", onOut);
      });
    }

    const updatePosition = () => {
      const scrollY = embedded ? scroller.scrollTop : window.scrollY;
      const scrollAmount = scrollY * 0.0001;
      created.forEach((item, index) => {
        const angle = index * angleIncrement + scrollAmount;
        gsap.to(item, {
          duration: 0.05,
          x: `${centerX + radius * Math.cos(angle)}px`,
          y: `${centerY + radius * Math.sin(angle)}px`,
          rotation: (angle * 180) / Math.PI,
          ease: "elastic.out(1,0.3)",
        });
      });
    };

    updatePosition();

    const scrollTarget: EventTarget = embedded ? scroller : window;
    scrollTarget.addEventListener("scroll", updatePosition);

    const onMouseMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      gsap.to(cursor, {
        x: e.clientX - rect.left - 150,
        y: e.clientY - rect.top - 200,
        duration: 1,
        ease: "power3.out",
      });
    };
    root.addEventListener("mousemove", onMouseMove);

    return () => {
      scrollTarget.removeEventListener("scroll", updatePosition);
      root.removeEventListener("mousemove", onMouseMove);
      for (const cleanup of cleanups) cleanup();
      for (const t of timeouts) clearTimeout(t);
      gsap.killTweensOf(created);
      gsap.killTweensOf(cursor);
      gallery.replaceChildren();
      cursor.replaceChildren();
    };
  }, [embedded, names, images, radius]);

  return (
    <div
      className={embedded ? "rnw-root rnw-embedded" : "rnw-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <div className="rnw-cursor" />

      <nav className="rnw-nav">
        <a href="#brand">
          {brand} <span>/</span> {navNote}
        </a>
        <p>{footerNote}</p>
      </nav>

      <footer className="rnw-footer">
        <div className="rnw-links">
          {links.map((link) => (
            <a href="#footer" key={link}>
              {link}
            </a>
          ))}
        </div>
        <p>{navNote}</p>
      </footer>

      <div className="rnw-container">
        <div className="rnw-gallery" />
      </div>

      <div className="rnw-scroller">
        <div className="rnw-content" />
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&display=swap");

.rnw-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  color: #fff;
  overflow: hidden;
  font-family: "Hanken Grotesk", sans-serif;
}

.rnw-root * {
  box-sizing: border-box;
}

.rnw-scroller {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.rnw-root.rnw-embedded .rnw-scroller {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.rnw-root.rnw-embedded .rnw-scroller::-webkit-scrollbar {
  display: none;
}

.rnw-content {
  width: 100%;
  height: 3000svh;
}

.rnw-root img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rnw-cursor {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 400px;
  z-index: 0;
  pointer-events: none;
}

.rnw-nav,
.rnw-footer {
  position: absolute;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 4;
  mix-blend-mode: difference;
  pointer-events: none;
}

.rnw-root a,
.rnw-root p {
  margin: 0;
  text-decoration: none;
  color: #fff;
  font-size: 14px;
}

.rnw-root a span {
  padding: 0 2em;
}

.rnw-links {
  display: flex;
  gap: 2em;
}

.rnw-nav {
  top: 0;
}
.rnw-footer {
  bottom: 0;
}

.rnw-container {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.rnw-gallery {
  position: absolute;
  width: 200%;
  height: 100%;
  left: -75%;
  overflow: hidden;
}

.rnw-item {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 80px;
  cursor: pointer;
}

.rnw-item p {
  width: 100%;
  font-size: 42px;
  font-weight: 500;
  text-transform: uppercase;
  color: #fff;
}

.rnw-item p span {
  padding: 0 20px;
  font-size: 16px;
}
`;

"use client";

/**
 * Client Hover Preview - a wall of client names where hovering a name wipes a
 * centered image preview open with a clip-path and cross-fades between clients.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import type * as React from "react";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/client-hover-preview";

export interface ClientHoverPreviewProps {
  clients?: string[];
  images?: string[];
  header?: string;
  logoText?: string;
  navLinks?: string[];
  footerLeft?: string;
  footerRight?: string;
  background?: string;
}

const DEFAULT_CLIENTS = [
  "Native Instruments,",
  "Oura,",
  "Hender Scheme,",
  "B&O Play,",
  "Nothing,",
  "Gentle Monster,",
  "Officine Panerai,",
  "Polestar,",
  "Fragment Design,",
  "Superfuture,",
  "Bang & Olufsen,",
  "Sonos.",
];

const DEFAULT_IMAGES = Array.from(
  { length: 12 },
  (_, index) => `${ASSET_BASE}/img${index + 1}.jpg`,
);

export default function ClientHoverPreview({
  clients = DEFAULT_CLIENTS,
  images = DEFAULT_IMAGES,
  header = "Trusted Us",
  logoText = "Nørd Objects",
  navLinks = ["Home", "Projects", "About Us"],
  footerLeft = "Experiment 503",
  footerRight = "Developed by BLANK",
  background = "#ffffff",
}: ClientHoverPreviewProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(CustomEase);
    if (!CustomEase.get("chp-hop")) {
      CustomEase.create(
        "chp-hop",
        "M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.45,0.984 0.504,1 1,1",
      );
    }

    const clientsPreview = root.querySelector(".chp-clients-preview");
    const clientNames = root.querySelectorAll(".chp-client-name");
    if (!clientsPreview) return;

    let activeClientIndex = -1;
    const cleanups: Array<() => void> = [];

    clientNames.forEach((client, index) => {
      let activeClientImgWrapper: HTMLDivElement | null = null;
      let activeClientImg: HTMLImageElement | null = null;

      const onMouseOver = () => {
        if (activeClientIndex === index) return;

        if (activeClientIndex !== -1) {
          const previousClient = clientNames[activeClientIndex];
          const mouseoutEvent = new Event("mouseout");
          previousClient.dispatchEvent(mouseoutEvent);
        }

        activeClientIndex = index;

        const clientImgWrapper = document.createElement("div");
        clientImgWrapper.className = "chp-client-img-wrapper";

        const clientImg = document.createElement("img");
        clientImg.src = images[index % images.length];
        gsap.set(clientImg, { scale: 1.25, opacity: 0 });

        clientImgWrapper.appendChild(clientImg);
        clientsPreview.appendChild(clientImgWrapper);

        activeClientImgWrapper = clientImgWrapper;
        activeClientImg = clientImg;

        gsap.to(clientImgWrapper, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 0.5,
          ease: "chp-hop",
        });

        gsap.to(clientImg, {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
        });

        gsap.to(clientImg, {
          scale: 1,
          duration: 1.25,
          ease: "chp-hop",
        });
      };

      const onMouseOut = (event: Event) => {
        const related = (event as MouseEvent).relatedTarget as Node | null;
        if (related && client.contains(related)) {
          return;
        }

        if (activeClientIndex === index) {
          activeClientIndex = -1;
        }

        if (activeClientImg && activeClientImgWrapper) {
          const clientImgToRemove = activeClientImg;
          const clientImgWrapperToRemove = activeClientImgWrapper;

          activeClientImg = null;
          activeClientImgWrapper = null;

          gsap.to(clientImgToRemove, {
            opacity: 0,
            duration: 0.5,
            ease: "power1.out",
            onComplete: () => {
              clientImgWrapperToRemove.remove();
            },
          });
        }
      };

      client.addEventListener("mouseover", onMouseOver);
      client.addEventListener("mouseout", onMouseOut);
      cleanups.push(() => {
        client.removeEventListener("mouseover", onMouseOver);
        client.removeEventListener("mouseout", onMouseOut);
      });
    });

    return () => {
      for (const cleanup of cleanups) cleanup();
      clientsPreview.replaceChildren();
    };
  }, [images]);

  return (
    <section
      className="chp-root"
      ref={rootRef}
      style={{ "--chp-bg": background } as React.CSSProperties}
    >
      <style>{styles}</style>
      <nav className="chp-nav">
        <div className="chp-logo">
          <a href="#top">{logoText}</a>
        </div>

        <div className="chp-nav-links">
          {navLinks.map((link) => (
            <a href="#top" key={link}>
              {link}
            </a>
          ))}
        </div>
      </nav>

      <div className="chp-clients">
        <div className="chp-clients-preview" />

        <div className="chp-clients-header">
          <p>{header}</p>
        </div>

        <div className="chp-clients-list">
          {clients.map((client) => (
            <div className="chp-client-name" key={client}>
              <h1>{client}</h1>
            </div>
          ))}
        </div>
      </div>

      <footer className="chp-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>
    </section>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap");

.chp-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  font-family: "DM Sans", sans-serif;
  background-color: var(--chp-bg);
}

.chp-root h1 {
  font-size: 3rem;
  font-weight: 500;
  line-height: 1;
  color: #fff;
}

.chp-root p,
.chp-root a {
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.85rem;
  font-weight: 550;
  line-height: 1;
  display: inline-block;
}

.chp-nav,
.chp-footer {
  position: absolute;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  mix-blend-mode: difference;
  z-index: 2;
}

.chp-nav {
  top: 0;
}

.chp-nav .chp-nav-links {
  display: flex;
  gap: 0.75rem;
}

.chp-footer {
  bottom: 0;
}

.chp-clients {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 2rem;
  overflow: hidden;
}

.chp-clients-preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 50%;
  z-index: 0;
  pointer-events: none;
}

.chp-client-img-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
  will-change: clip-path;
  overflow: hidden;
}

.chp-client-img-wrapper img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform, opacity;
}

.chp-clients-header p {
  position: relative;
  color: #acacac;
  z-index: 1;
}

.chp-clients-list {
  position: relative;
  width: 80%;
  margin-bottom: 8rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0.75rem;
  mix-blend-mode: difference;
  z-index: 2;
}

.chp-client-name {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.chp-client-name::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0.15rem;
  background: #fff;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 300ms ease-out;
}

.chp-client-name:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

@media (max-width: 1000px) {
  .chp-root h1 {
    font-size: 2rem;
  }

  .chp-clients-preview {
    width: 100%;
    height: 100%;
  }

  .chp-clients-list {
    width: 100%;
  }
}
`;

"use client";

/**
 * Flip Layout Gallery - one set of images that rearranges between three
 * completely different layouts without ever being re-created. Positions are
 * declared purely in CSS per layout class; switching records the current rects
 * with GSAP Flip, swaps the class, and lets Flip interpolate every tile from
 * where it was to where the new stylesheet puts it. The stagger is dropped to
 * zero when moving into the column layout, because a staggered arrival into a
 * vertical list reads as a queue rather than a formation. The column layout
 * also mounts a scroll relationship: an invisible tall strip provides the
 * scroll length, and its progress drives the gallery and a minimap at different
 * multipliers, so the two travel at different rates over the same gesture.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useEffect, useRef, useState } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/flip-layout-gallery";

export type FlipLayoutId = "layout-1" | "layout-2" | "layout-3";

export interface FlipLayoutGalleryProps {
  images?: string[];
  brand?: string;
  menuLabel?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 14 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

const LAYOUTS: FlipLayoutId[] = ["layout-1", "layout-2", "layout-3"];

export default function FlipLayoutGallery({
  images = DEFAULT_IMAGES,
  brand = "BLANK",
  menuLabel = "Menu",
  embedded = true,
}: FlipLayoutGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<FlipLayoutId>("layout-1");
  const [active, setActive] = useState<FlipLayoutId>("layout-1");

  useEffect(() => {
    gsap.registerPlugin(Flip, CustomEase, ScrollToPlugin);
    CustomEase.create(
      "flg-hop",
      "M0,0 C0.028,0.528 0.129,0.74 0.27,0.852 0.415,0.967 0.499,1 1,1",
    );
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scroller = root.querySelector<HTMLElement>(".flg-scroller");
    const gallery = root.querySelector<HTMLElement>(".flg-gallery");
    const imgPreviews = root.querySelector<HTMLElement>(".flg-img-previews");
    const minimap = root.querySelector<HTMLElement>(".flg-minimap");
    if (!scroller || !gallery || !imgPreviews || !minimap) return;

    const handleScroll = () => {
      if (activeRef.current !== "layout-2") return;

      const imgPreviewsHeight = imgPreviews.scrollHeight;
      const galleryHeight = gallery.scrollHeight;
      const scrollY = embedded ? scroller.scrollTop : window.scrollY;
      const windowHeight = embedded
        ? scroller.clientHeight
        : window.innerHeight;

      const scrollFraction = scrollY / (imgPreviewsHeight - windowHeight);
      const galleryTranslateY =
        -scrollFraction * (galleryHeight - windowHeight) * 1.525;
      const minimapTranslateY =
        scrollFraction * (windowHeight - minimap.offsetHeight) * 0.425;

      gsap.to(gallery, { y: galleryTranslateY, ease: "none", duration: 0.1 });
      gsap.to(minimap, { y: minimapTranslateY, ease: "none", duration: 0.1 });
    };

    const target: EventTarget = embedded ? scroller : window;
    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, [embedded]);

  const switchLayout = (newLayout: FlipLayoutId) => {
    const root = rootRef.current;
    if (!root || newLayout === activeRef.current) return;

    const scroller = root.querySelector<HTMLElement>(".flg-scroller");
    const gallery = root.querySelector<HTMLElement>(".flg-gallery");
    const imgPreviews = root.querySelector<HTMLElement>(".flg-img-previews");
    const minimap = root.querySelector<HTMLElement>(".flg-minimap");
    if (!scroller || !gallery || !imgPreviews || !minimap) return;

    const run = () => {
      const previous = activeRef.current;
      const state = Flip.getState(gallery.querySelectorAll(".flg-img"));

      gallery.classList.remove(`flg-${previous}`);
      gallery.classList.add(`flg-${newLayout}`);

      // Moving into the column layout drops the stagger: a staggered arrival
      // into a vertical list reads as a queue rather than a formation.
      const staggerValue =
        (previous === "layout-1" && newLayout === "layout-2") ||
        (previous === "layout-3" && newLayout === "layout-2")
          ? 0
          : 0.025;

      Flip.from(state, {
        duration: 1.5,
        ease: "flg-hop",
        stagger: staggerValue,
      });

      activeRef.current = newLayout;
      setActive(newLayout);

      if (newLayout === "layout-2") {
        gsap.to([imgPreviews, minimap], {
          autoAlpha: 1,
          duration: 0.3,
          delay: 0.5,
        });
      } else {
        gsap.to([imgPreviews, minimap], { autoAlpha: 0, duration: 0.3 });
        gsap.set(gallery, { clearProps: "y" });
        gsap.set(minimap, { clearProps: "y" });
      }
    };

    // Leaving the column layout mid-scroll must return to the top first, or
    // Flip measures the tiles from a scrolled position and they fly in from
    // off-frame.
    const scrollTop = embedded ? scroller.scrollTop : window.scrollY;
    if (activeRef.current === "layout-2" && scrollTop > 0) {
      gsap.to(embedded ? scroller : window, {
        scrollTo: { y: 0 },
        duration: 0.5,
        ease: "power3.out",
        onComplete: run,
      });
    } else {
      run();
    }
  };

  return (
    <div
      className={embedded ? "flg-root flg-embedded" : "flg-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <nav className="flg-nav">
        <div className="flg-nav-item">
          <p>{brand}</p>
        </div>
        {LAYOUTS.map((layout, i) => (
          <div className="flg-nav-item" key={layout}>
            <p
              className={active === layout ? "flg-active" : ""}
              onClick={() => switchLayout(layout)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") switchLayout(layout);
              }}
              // biome-ignore lint/a11y/useSemanticElements: the source styles these as plain text in the nav row
              role="button"
              tabIndex={0}
            >
              {`0${i + 1}`}
            </p>
          </div>
        ))}
        <div className="flg-nav-item">
          <p>{menuLabel}</p>
        </div>
      </nav>

      <div className="flg-minimap" />

      <div className="flg-scroller">
        <div className="flg-gallery-container">
          <div className="flg-gallery flg-layout-1">
            {images.map((src, i) => (
              <div className="flg-img" data-img={i + 1} key={src}>
                <img alt="" draggable={false} src={src} />
              </div>
            ))}
          </div>
        </div>

        <div className="flg-img-previews">
          {images.map((src) => (
            <img alt="" draggable={false} key={`preview-${src}`} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.flg-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
  color: #000;
  font-family: "Inter", sans-serif;
}

.flg-root * {
  box-sizing: border-box;
}

.flg-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.flg-scroller {
  position: relative;
  width: 100%;
  height: 100%;
}

.flg-root.flg-embedded .flg-scroller {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.flg-root.flg-embedded .flg-scroller::-webkit-scrollbar {
  display: none;
}

.flg-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0.75em 2em;
  display: flex;
  z-index: 3;
}

.flg-nav .flg-nav-item {
  flex: 1;
}

.flg-nav .flg-nav-item p {
  margin: 0;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 500;
  padding: 1em 0.25em;
  cursor: pointer;
}

.flg-nav .flg-nav-item p.flg-active {
  opacity: 0.5;
}

.flg-img-previews {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.flg-img-previews img {
  width: 600px;
  height: 700px;
  padding: 1em 0;
}

.flg-gallery-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-top: 4em;
  z-index: 1;
}

.flg-gallery.flg-layout-1 {
  position: relative;
  width: 100%;
  height: 100%;
  transform: translateX(0%);
}

.flg-gallery.flg-layout-1 .flg-img {
  position: absolute;
  width: 100px;
  height: 125px;
}

.flg-gallery.flg-layout-2 {
  padding-top: 0.5em;
  position: absolute;
  top: 25%;
  left: 10%;
  transform: translateX(0%);
}

.flg-gallery.flg-layout-2 .flg-img {
  width: 75px;
  height: 100px;
  margin-bottom: 1em;
}

.flg-gallery.flg-layout-3 {
  position: relative;
  width: 100%;
  height: 100%;
  transform: translateX(0%);
}

.flg-gallery.flg-layout-3 .flg-img {
  position: absolute;
  top: 4em;
  right: 4em;
  width: 300px;
  height: 400px;
}

.flg-gallery.flg-layout-1 [data-img="1"],
.flg-gallery.flg-layout-1 [data-img="2"],
.flg-gallery.flg-layout-1 [data-img="3"],
.flg-gallery.flg-layout-1 [data-img="4"] {
  top: 0%;
}

.flg-gallery.flg-layout-1 [data-img="5"],
.flg-gallery.flg-layout-1 [data-img="6"],
.flg-gallery.flg-layout-1 [data-img="7"],
.flg-gallery.flg-layout-1 [data-img="8"] {
  top: 25%;
}

.flg-gallery.flg-layout-1 [data-img="9"],
.flg-gallery.flg-layout-1 [data-img="10"] {
  top: 50%;
}

.flg-gallery.flg-layout-1 [data-img="11"],
.flg-gallery.flg-layout-1 [data-img="12"],
.flg-gallery.flg-layout-1 [data-img="13"],
.flg-gallery.flg-layout-1 [data-img="14"] {
  top: 75%;
}

.flg-gallery.flg-layout-1 [data-img="1"],
.flg-gallery.flg-layout-1 [data-img="5"],
.flg-gallery.flg-layout-1 [data-img="11"] {
  left: 2em;
}

.flg-gallery.flg-layout-1 [data-img="2"] {
  left: 15%;
}

.flg-gallery.flg-layout-1 [data-img="3"],
.flg-gallery.flg-layout-1 [data-img="9"] {
  left: 45%;
}

.flg-gallery.flg-layout-1 [data-img="4"],
.flg-gallery.flg-layout-1 [data-img="10"],
.flg-gallery.flg-layout-1 [data-img="12"] {
  left: 65%;
}

.flg-gallery.flg-layout-1 [data-img="13"] {
  left: 75%;
}

.flg-gallery.flg-layout-1 [data-img="6"] {
  left: 25%;
}

.flg-gallery.flg-layout-1 [data-img="7"] {
  right: 15%;
}

.flg-gallery.flg-layout-1 [data-img="8"],
.flg-gallery.flg-layout-1 [data-img="14"] {
  right: 2em;
}

.flg-minimap {
  position: absolute;
  top: 25%;
  left: 12.5%;
  transform: translateX(-50%);
  width: 140px;
  height: 90px;
  border: 1px solid #000;
  border-radius: 2px;
  z-index: 2;
  visibility: hidden;
  opacity: 0;
}
`;

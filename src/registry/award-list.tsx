"use client";

/**
 * Award List — a hover-reactive list of accolades with a cursor image stack.
 *
 * Each row is a three-state shutter: the award name sits flush, and on hover the
 * row slides to expose the project credit (the inverted black band), settling
 * up or down depending on which edge you leave by. Hovering also tosses the
 * row's image onto a preview pile in the corner; the pile scales in, stacks, and
 * collapses to the last image when you pause, then clears when the cursor leaves
 * the list. GSAP for the motion, Lenis for smooth scroll.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to run it as a full page section on the window scroll.
 *
 * BLANK — aryank.space
 */

import gsap from "gsap";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

export interface Award {
  name: string;
  type: string;
  project: string;
  label: string;
  /** Image tossed onto the corner preview pile on hover. */
  image: string;
}

export interface AwardListProps {
  awards?: Award[];
  heading?: string;
  /** Name row (resting) colors. */
  nameBackground?: string;
  nameColor?: string;
  /** Project row (hover) colors — the inverted band. */
  projectBackground?: string;
  projectColor?: string;
  /** Own an internal scroll container (true) or use the window scroll (false). */
  embedded?: boolean;
}

const COMPRONENTS_ASSET_BASE = "https://ui.aryank.space/assets/award-list";

const DEFAULT_AWARDS: Award[] = [
  {
    name: "Independent of the year",
    type: "Nominee",
    project: "INNOVATE 2024",
    label: "Awwwards",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "LVXH — AMOT",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Open Field Audio",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "ArtisanCraft",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Disguised Edge",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Silvia Santiago",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "2023 Showcase",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Digital Excellence",
    label: "Vacuum",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Harmonic Pitch",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Shadowline",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Verse 21",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "LVXH — AMOT",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "Open Field Audio",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "ArtisanCraft",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "Disguised Edge",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "Silvia Santiago",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "2023 Showcase",
    label: "See Live",
  },
].map((award, i) => ({
  ...award,
  image: `${COMPRONENTS_ASSET_BASE}/img${i + 1}.jpg`,
}));

const POS = { BOTTOM: 0, MIDDLE: -80, TOP: -160 };

export default function AwardList({
  awards = DEFAULT_AWARDS,
  heading = "Recognition and awards",
  nameBackground = "#e3e3db",
  nameColor = "#000000",
  projectBackground = "#000000",
  projectColor = "#e3e3db",
  embedded = true,
}: AwardListProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    const list = listRef.current;
    const preview = previewRef.current;
    if (!scroller || !content || !list || !preview) return;

    /* ---- Smooth scroll ---- */
    const lenis = embedded
      ? new Lenis({ wrapper: scroller, content })
      : new Lenis({ autoRaf: false });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const awardEls = [...list.querySelectorAll<HTMLElement>(".aw-award")];

    const lastMouse = { x: 0, y: 0 };
    let activeAward: HTMLElement | null = null;
    let ticking = false;
    let mouseTimeout: ReturnType<typeof setTimeout> | null = null;

    const animatePreview = () => {
      const rect = list.getBoundingClientRect();
      if (
        lastMouse.x < rect.left ||
        lastMouse.x > rect.right ||
        lastMouse.y < rect.top ||
        lastMouse.y > rect.bottom
      ) {
        preview.querySelectorAll("img").forEach((img) => {
          gsap.to(img, {
            scale: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => img.remove(),
          });
        });
      }
    };

    const updateAwards = () => {
      animatePreview();

      if (activeAward) {
        const rect = activeAward.getBoundingClientRect();
        const stillOver =
          lastMouse.x >= rect.left &&
          lastMouse.x <= rect.right &&
          lastMouse.y >= rect.top &&
          lastMouse.y <= rect.bottom;
        if (!stillOver) {
          const wrapper = activeAward.querySelector(".aw-wrapper");
          const leavingTop = lastMouse.y < rect.top + rect.height / 2;
          gsap.to(wrapper, {
            y: leavingTop ? POS.TOP : POS.BOTTOM,
            duration: 0.4,
            ease: "power2.out",
          });
          activeAward = null;
        }
      }

      for (const award of awardEls) {
        if (award === activeAward) continue;
        const rect = award.getBoundingClientRect();
        const over =
          lastMouse.x >= rect.left &&
          lastMouse.x <= rect.right &&
          lastMouse.y >= rect.top &&
          lastMouse.y <= rect.bottom;
        if (over) {
          const wrapper = award.querySelector(".aw-wrapper");
          gsap.to(wrapper, {
            y: POS.MIDDLE,
            duration: 0.4,
            ease: "power2.out",
          });
          activeAward = award;
        }
      }
      ticking = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      lastMouse.x = e.clientX;
      lastMouse.y = e.clientY;
      if (mouseTimeout) clearTimeout(mouseTimeout);

      const rect = list.getBoundingClientRect();
      const inside =
        lastMouse.x >= rect.left &&
        lastMouse.x <= rect.right &&
        lastMouse.y >= rect.top &&
        lastMouse.y <= rect.bottom;
      if (inside) {
        mouseTimeout = setTimeout(() => {
          const images = preview.querySelectorAll("img");
          if (images.length > 1) {
            const last = images[images.length - 1];
            images.forEach((img) => {
              if (img !== last) {
                gsap.to(img, {
                  scale: 0,
                  duration: 0.4,
                  ease: "power2.out",
                  onComplete: () => img.remove(),
                });
              }
            });
          }
        }, 2000);
      }
      animatePreview();
    };
    window.addEventListener("mousemove", onMouseMove);

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateAwards);
        ticking = true;
      }
    };
    const scrollTarget: HTMLElement | Window = embedded ? scroller : window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    lenis.on("scroll", onScroll);

    /* ---- Per-row hover ---- */
    const cleanups: Array<() => void> = [];
    awardEls.forEach((award, index) => {
      const wrapper = award.querySelector(".aw-wrapper");
      let currentPosition = POS.TOP;

      const onEnter = (e: MouseEvent) => {
        activeAward = award;
        const rect = award.getBoundingClientRect();
        const enterTop = e.clientY < rect.top + rect.height / 2;
        if (enterTop || currentPosition === POS.BOTTOM) {
          currentPosition = POS.MIDDLE;
          gsap.to(wrapper, {
            y: POS.MIDDLE,
            duration: 0.4,
            ease: "power2.out",
          });
        }

        const img = document.createElement("img");
        img.src = awards[index]?.image ?? "";
        img.alt = "";
        img.style.position = "absolute";
        img.style.top = "0";
        img.style.left = "0";
        img.style.scale = "0";
        img.style.zIndex = `${Date.now()}`;
        preview.appendChild(img);
        gsap.to(img, { scale: 1, duration: 0.4, ease: "power2.out" });
      };

      const onLeave = (e: MouseEvent) => {
        activeAward = null;
        const rect = award.getBoundingClientRect();
        const leavingTop = e.clientY < rect.top + rect.height / 2;
        currentPosition = leavingTop ? POS.TOP : POS.BOTTOM;
        gsap.to(wrapper, {
          y: currentPosition,
          duration: 0.4,
          ease: "power2.out",
        });
      };

      award.addEventListener("mouseenter", onEnter);
      award.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        award.removeEventListener("mouseenter", onEnter);
        award.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      scrollTarget.removeEventListener("scroll", onScroll);
      for (const fn of cleanups) fn();
      if (mouseTimeout) clearTimeout(mouseTimeout);
      gsap.ticker.remove(raf);
      lenis.destroy();
      for (const el of awardEls) {
        gsap.killTweensOf(el.querySelector(".aw-wrapper"));
      }
      preview.replaceChildren();
    };
  }, [awards, embedded]);

  const cssVars = {
    ["--aw-name-bg" as string]: nameBackground,
    ["--aw-name-color" as string]: nameColor,
    ["--aw-project-bg" as string]: projectBackground,
    ["--aw-project-color" as string]: projectColor,
  };

  return (
    <div
      className={embedded ? "aw-root aw-embedded" : "aw-root"}
      style={cssVars}
    >
      <style>{styles}</style>
      <div className="aw-scroller" ref={scrollerRef}>
        <div className="aw-content" ref={contentRef}>
          <section className="aw-section">
            {heading ? <p className="aw-heading">{heading}</p> : null}
            <div className="aw-list" ref={listRef}>
              {awards.map((award, i) => (
                <div
                  className="aw-award"
                  key={`${award.name}-${award.project}-${i}`}
                >
                  <div className="aw-wrapper">
                    <div className="aw-name">
                      <h1>{award.name}</h1>
                      <h1>{award.type}</h1>
                    </div>
                    <div className="aw-project">
                      <h1>{award.project}</h1>
                      <h1>{award.label}</h1>
                    </div>
                    <div className="aw-name">
                      <h1>{award.name}</h1>
                      <h1>{award.type}</h1>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <div className="aw-preview" ref={previewRef} />
    </div>
  );
}

const styles = `
.aw-root {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--aw-name-bg, #e3e3db);
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;
}

.aw-root.aw-embedded .aw-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.aw-root.aw-embedded .aw-scroller::-webkit-scrollbar {
  display: none;
}

.aw-root .aw-section {
  min-height: 100%;
  height: max-content;
  padding-bottom: 4rem;
}

.aw-root .aw-heading {
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 1.25rem;
  color: var(--aw-name-color, #000);
}

.aw-root .aw-list {
  border-top: 1px solid var(--aw-name-color, #000);
}

.aw-root .aw-award {
  height: 80px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.aw-root .aw-wrapper {
  position: relative;
  height: 240px;
  will-change: transform;
  transform: translateY(-160px);
}

.aw-root .aw-name,
.aw-root .aw-project {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  padding: 5px 15px;
  cursor: pointer;
  border-bottom: 1px solid var(--aw-name-color, #000);
}

.aw-root .aw-name {
  background-color: var(--aw-name-bg, #e3e3db);
  color: var(--aw-name-color, #000);
}

.aw-root .aw-project {
  background-color: var(--aw-project-bg, #000);
  color: var(--aw-project-color, #e3e3db);
}

.aw-root .aw-name h1,
.aw-root .aw-project h1 {
  text-transform: uppercase;
  font-size: clamp(1.25rem, 3.5vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 0.9;
}

.aw-root .aw-preview {
  position: absolute;
  bottom: 15px;
  right: 15px;
  width: 30%;
  height: 30%;
  z-index: 2;
  pointer-events: none;
}

.aw-root .aw-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}
`;

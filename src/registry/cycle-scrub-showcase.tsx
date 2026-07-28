"use client";

/**
 * Cycle Scrub Showcase - a pinned section where scroll progress is multiplied
 * by the project count, so the integer part of that number picks the project
 * and the fraction drives everything inside it. The current frame is scaled
 * from 1.25 down to 1 across its own cycle, and crossing an integer boundary
 * fires a discrete swap: the outgoing frame shrinks away going forward, or
 * re-clips downward and blows out its contrast going back, so reversing is not
 * the forward transition played in reverse. Metadata types itself back in one
 * character every thirty milliseconds, half a second after the swap.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/cycle-scrub-showcase";

export interface CycleScrubProject {
  title: string;
  tagline: string;
  year: string;
  tag: string;
  link: string;
  image: string;
}

export interface CycleScrubShowcaseProps {
  projects?: CycleScrubProject[];
  linkLabel?: string;
  outroCopy?: string;
  embedded?: boolean;
}

const DEFAULT_PROJECTS: CycleScrubProject[] = [
  {
    title: "Nebula Quest",
    tagline: "Redefining Galactic UX",
    year: "2023",
    tag: "game design",
    link: "https://ui.aryank.space/components",
    image: `${ASSET_BASE}/img1.jpg`,
  },
  {
    title: "Aurora Scribe",
    tagline: "Crafting Stories in Light",
    year: "2022",
    tag: "content creation",
    link: "https://ui.aryank.space/pages",
    image: `${ASSET_BASE}/img2.jpg`,
  },
  {
    title: "Echo Circuit",
    tagline: "Where Sound Meets Code",
    year: "2024",
    tag: "audio engineering",
    link: "https://ui.aryank.space/backend",
    image: `${ASSET_BASE}/img3.jpg`,
  },
  {
    title: "Zenith Horizon",
    tagline: "Breaking Boundaries in Motion",
    year: "2023",
    tag: "motion design",
    link: "https://ui.aryank.space/inspiration",
    image: `${ASSET_BASE}/img4.jpg`,
  },
  {
    title: "Prism Architect",
    tagline: "Sculpting Digital Dreams",
    year: "2024",
    tag: "web development",
    link: "https://ui.aryank.space",
    image: `${ASSET_BASE}/img5.jpg`,
  },
];

export default function CycleScrubShowcase({
  projects = DEFAULT_PROJECTS,
  linkLabel = "Explore",
  outroCopy = "Your next section goes here",
  embedded = true,
}: CycleScrubShowcaseProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".cyc-content");
    const pinnedSection = root.querySelector<HTMLElement>(".cyc-pinned");
    const progressBar = root.querySelector<HTMLElement>(".cyc-progress");
    if (!content || !pinnedSection || !progressBar) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = () =>
      embedded ? root.clientHeight : window.innerHeight;
    const pinnedHeight = viewportHeight() * 10;
    const images = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".cyc-img"),
    );

    function animateImageEntry(img: HTMLElement) {
      gsap.fromTo(
        img,
        {
          scale: 1.25,
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          opacity: 0,
        },
        {
          scale: 1,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          opacity: 1,
          duration: 1,
          ease: "power2.inOut",
        },
      );

      gsap.fromTo(
        img.querySelector("img"),
        { filter: "contrast(2) brightness(10)" },
        {
          filter: "contrast(1) brightness(1)",
          duration: 1,
          ease: "power2.inOut",
        },
      );
    }

    function animateImageExitForward(img: HTMLElement) {
      gsap.to(img, {
        scale: 0.5,
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
      });
    }

    function animateImageExitReverse(img: HTMLElement) {
      gsap.to(img, {
        scale: 1.25,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power2.inOut",
      });
      gsap.to(img.querySelector("img"), {
        filter: "contrast(2) brightness(10)",
        duration: 1,
        ease: "power2.inOut",
      });
    }

    function updateInfoContent(index: number) {
      const infoItems =
        root?.querySelectorAll<HTMLElement>(".cyc-info > div p");
      const link = root?.querySelector<HTMLAnchorElement>(
        ".cyc-info .cyc-link a",
      );
      if (!infoItems || !link) return;

      for (const item of infoItems) {
        item.innerHTML = "";
      }
      link.setAttribute("href", "#");

      const item = projects[index];
      const contentArray = [item.title, item.tagline, item.year, item.tag];

      infoItems.forEach((element, i) => {
        if (i >= 4) return;
        for (const [letterIndex, letter] of contentArray[i]
          .split("")
          .entries()) {
          const span = document.createElement("span");
          span.textContent = letter;
          span.style.opacity = "0";
          element.appendChild(span);
          gsap.to(span, {
            opacity: 1,
            duration: 0.01,
            delay: 0.03 * letterIndex,
            ease: "power1.inOut",
          });
        }
      });

      link.setAttribute("href", item.link);

      const linkText = link.textContent ?? "";
      link.innerHTML = "";
      for (const [letterIndex, letter] of linkText.split("").entries()) {
        const span = document.createElement("span");
        span.textContent = letter;
        span.style.opacity = "0";
        link.appendChild(span);
        gsap.to(span, {
          opacity: 1,
          duration: 0.01,
          delay: 0.03 * letterIndex,
          ease: "power1.inOut",
        });
      }
    }

    updateInfoContent(0);
    animateImageEntry(images[0]);

    let lastCycle = 0;
    const cycles = projects.length;

    const trigger = ScrollTrigger.create({
      trigger: pinnedSection,
      scroller,
      start: "top top",
      end: `+=${pinnedHeight * 2}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const totalProgress = self.progress * cycles;
        const currentCycle = Math.floor(totalProgress);
        const cycleProgress = (totalProgress % 1) * 100;

        if (currentCycle < images.length) {
          const currentImage = images[currentCycle];
          gsap.to(currentImage, {
            scale: 1 - (0.25 * cycleProgress) / 100,
            duration: 0.1,
            overwrite: "auto",
          });

          if (currentCycle !== lastCycle) {
            if (self.direction > 0) {
              if (lastCycle < images.length)
                animateImageExitForward(images[lastCycle]);
              if (currentCycle < images.length) {
                animateImageEntry(images[currentCycle]);
                gsap.delayedCall(0.5, () => updateInfoContent(currentCycle));
              }
            } else {
              if (currentCycle < images.length) {
                animateImageEntry(images[currentCycle]);
                gsap.delayedCall(0.5, () => updateInfoContent(currentCycle));
              }
              if (lastCycle < images.length)
                animateImageExitReverse(images[lastCycle]);
            }
            lastCycle = currentCycle;
          }
        }

        if (currentCycle < cycles) {
          gsap.to(progressBar, {
            height: `${cycleProgress}%`,
            duration: 0.1,
            overwrite: true,
          });

          if (cycleProgress < 1 && self.direction > 0) {
            gsap.set(progressBar, { height: "0%" });
          } else if (cycleProgress > 99 && self.direction < 0) {
            gsap.set(progressBar, { height: "100%" });
          }
        } else {
          gsap.to(progressBar, {
            height: self.direction > 0 ? "100%" : `${cycleProgress}%`,
            duration: 0.1,
            overwrite: true,
          });
        }
      },
    });

    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      gsap.killTweensOf(images);
    };
  }, [embedded, projects]);

  return (
    <div
      className={embedded ? "cyc-root cyc-embedded" : "cyc-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="cyc-content">
        <section className="cyc-pinned">
          <div className="cyc-info">
            <div className="cyc-title">
              <p>Title</p>
            </div>
            <div className="cyc-tagline">
              <p>Tagline</p>
            </div>
            <div className="cyc-year">
              <p>Year</p>
            </div>
            <div className="cyc-tag">
              <p>Tag</p>
            </div>
            <div className="cyc-link">
              <a href="#explore">{linkLabel}</a>
            </div>
          </div>
          <div className="cyc-progress-bar">
            <div className="cyc-progress" />
          </div>

          {projects.map((project) => (
            <div className="cyc-img" key={project.title}>
              <img alt="" draggable={false} src={project.image} />
            </div>
          ))}
        </section>
        <section className="cyc-about">
          <p>{outroCopy}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap");

.cyc-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Geist Mono", monospace;
}

.cyc-root * {
  box-sizing: border-box;
}

.cyc-root.cyc-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.cyc-root.cyc-embedded::-webkit-scrollbar {
  display: none;
}

.cyc-content {
  position: relative;
  width: 100%;
}

.cyc-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cyc-root p,
.cyc-root a {
  margin: 0;
  color: #fff;
  text-transform: uppercase;
  text-decoration: none;
  font-size: 13px;
}

.cyc-content section {
  position: relative;
  width: 100%;
  height: 100svh;
}

.cyc-pinned {
  background-color: #111111;
  overflow: hidden;
}

.cyc-about {
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.cyc-info {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1em;
  z-index: 1;
}

.cyc-info > div {
  flex: 1;
}

.cyc-link {
  display: flex;
  justify-content: flex-end;
}

.cyc-link a {
  padding: 0.35em;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
}

.cyc-progress-bar {
  position: absolute;
  top: 50%;
  left: 75%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 120px;
  background-color: rgb(40, 40, 40);
  z-index: 1;
}

.cyc-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0%;
  z-index: 2;
  background-color: #fff;
}

.cyc-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1.25);
  width: 35%;
  height: 70%;
  z-index: 0;
  clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
}

.cyc-img img {
  filter: contrast(1) brightness(1);
}
`;

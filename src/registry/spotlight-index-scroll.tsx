"use client";

/**
 * Spotlight Index Scroll - a pinned gallery where a centered column of images
 * scrolls past a fixed sightline: whichever image sits on the center line
 * brightens, a running NN/TT index counter climbs the left edge, and a stacked
 * list of project names on the right lights up and slides one entry at a time.
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

const ASSET_BASE = "https://ui.aryank.space/assets/spotlight-index-scroll";

export interface SpotlightProject {
  name: string;
  image: string;
}

export interface SpotlightIndexScrollProps {
  projects?: SpotlightProject[];
  introText?: string;
  outroText?: string;
  embedded?: boolean;
}

const DEFAULT_PROJECTS: SpotlightProject[] = [
  { name: "Human Form Study", image: `${ASSET_BASE}/img1.jpg` },
  { name: "Interior Light", image: `${ASSET_BASE}/img2.jpg` },
  { name: "Project 21", image: `${ASSET_BASE}/img3.jpg` },
  { name: "Shadow Portraits", image: `${ASSET_BASE}/img4.jpg` },
  { name: "Everyday Objects", image: `${ASSET_BASE}/img5.jpg` },
  { name: "Unit 07 Care", image: `${ASSET_BASE}/img6.jpg` },
  { name: "Motion Practice", image: `${ASSET_BASE}/img7.jpg` },
  { name: "Noonlight Series", image: `${ASSET_BASE}/img8.jpg` },
  { name: "Material Stillness", image: `${ASSET_BASE}/img9.jpg` },
  { name: "Quiet Walk", image: `${ASSET_BASE}/img10.jpg` },
];

export default function SpotlightIndexScroll({
  projects = DEFAULT_PROJECTS,
  introText = "A collection of selected works",
  outroText = "Scroll complete",
  embedded = true,
}: SpotlightIndexScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".sis-content");
    const spotlight = root.querySelector<HTMLElement>(".sis-spotlight");
    const projectIndex = root.querySelector<HTMLElement>(".sis-index h1");
    const imagesContainer = root.querySelector<HTMLElement>(".sis-images");
    const namesContainer = root.querySelector<HTMLElement>(".sis-names");
    if (
      !content ||
      !spotlight ||
      !projectIndex ||
      !imagesContainer ||
      !namesContainer
    )
      return;

    const projectImgs = Array.from(
      root.querySelectorAll<HTMLElement>(".sis-img"),
    );
    const projectNames = Array.from(
      root.querySelectorAll<HTMLElement>(".sis-names p"),
    );
    const totalProjectCount = projectNames.length;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded
      ? (root.clientHeight ?? window.innerHeight)
      : window.innerHeight;

    const spotlightHeight = spotlight.offsetHeight;
    const spotlightPadding = Number.parseFloat(
      getComputedStyle(spotlight).padding,
    );
    const projectIndexHeight = projectIndex.offsetHeight;
    const containerHeight = namesContainer.offsetHeight;
    const imagesHeight = imagesContainer.offsetHeight;

    const moveDistanceIndex =
      spotlightHeight - spotlightPadding * 2 - projectIndexHeight;
    const moveDistanceNames =
      spotlightHeight - spotlightPadding * 2 - containerHeight;
    const moveDistanceImages = viewportHeight - imagesHeight;

    const imgActivationThreshold = viewportHeight / 2;
    const rootTop = () => (embedded ? root.getBoundingClientRect().top : 0);

    const trigger = ScrollTrigger.create({
      trigger: spotlight,
      scroller: embedded ? root : undefined,
      start: "top top",
      end: `+=${viewportHeight * 5}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        const currentIndex = Math.min(
          Math.floor(progress * totalProjectCount) + 1,
          totalProjectCount,
        );

        projectIndex.textContent = `${String(currentIndex).padStart(
          2,
          "0",
        )}/${String(totalProjectCount).padStart(2, "0")}`;

        gsap.set(projectIndex, { y: progress * moveDistanceIndex });
        gsap.set(imagesContainer, { y: progress * moveDistanceImages });

        const threshold = rootTop() + imgActivationThreshold;
        for (const img of projectImgs) {
          const imgRect = img.getBoundingClientRect();
          const active =
            imgRect.top <= threshold && imgRect.bottom >= threshold;
          gsap.set(img, { opacity: active ? 1 : 0.5 });
        }

        projectNames.forEach((p, index) => {
          const startProgress = index / totalProjectCount;
          const endProgress = (index + 1) / totalProjectCount;
          const projectProgress = Math.max(
            0,
            Math.min(
              1,
              (progress - startProgress) / (endProgress - startProgress),
            ),
          );

          gsap.set(p, { y: -projectProgress * moveDistanceNames });
          gsap.set(p, {
            color:
              projectProgress > 0 && projectProgress < 1 ? "#fff" : "#4a4a4a",
          });
        });
      },
    });

    return () => {
      trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  const count = projects.length;

  return (
    <div className="sis-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="sis-content">
        <section className="sis-intro">
          <p>{introText}</p>
        </section>

        <section className="sis-spotlight">
          <div className="sis-index">
            <h1>{`01/${String(count).padStart(2, "0")}`}</h1>
          </div>

          <div className="sis-images">
            {projects.map((project) => (
              <div className="sis-img" key={project.name}>
                <img alt="" draggable={false} src={project.image} />
              </div>
            ))}
          </div>

          <div className="sis-names">
            {projects.map((project) => (
              <p key={project.name}>{project.name}</p>
            ))}
          </div>
        </section>

        <section className="sis-outro">
          <p>{outroText}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap");

.sis-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #141414;
  color: #fff;
  font-family: "Google Sans", sans-serif;
}

.sis-root::-webkit-scrollbar {
  display: none;
}

.sis-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sis-root h1 {
  text-transform: uppercase;
  font-size: clamp(3rem, 5vw, 7rem);
  font-weight: 400;
  line-height: 1;
}

.sis-root p {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.25;
}

.sis-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  overflow: hidden;
}

.sis-intro,
.sis-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.sis-images {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 35%;
  padding: 50svh 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: -1;
}

.sis-img {
  width: 100%;
  aspect-ratio: 16/9;
  opacity: 0.5;
  overflow: hidden;
}

.sis-names {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.sis-names p {
  color: #4a4a4a;
}

.sis-index h1,
.sis-images,
.sis-names p {
  will-change: transform;
}

@media (max-width: 1000px) {
  .sis-images {
    width: calc(100% - 4rem);
    gap: 25svh;
  }

  .sis-names p {
    color: #fff !important;
  }
}
`;

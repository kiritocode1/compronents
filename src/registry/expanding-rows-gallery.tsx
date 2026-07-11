"use client";

/**
 * Expanding Rows Gallery - rows of project cards wider than the viewport that
 * stretch from a tight strip to five times the screen width as they scroll
 * through view, so the grid feels like it zooms past the camera.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/expanding-rows-gallery";

export interface GalleryProject {
  name: string;
  year: number;
  img: string;
}

export interface ExpandingRowsGalleryProps {
  projects?: GalleryProject[];
  projectsPerRow?: number;
  totalRows?: number;
  introText?: string;
  outroText?: string;
  embedded?: boolean;
}

const DEFAULT_PROJECTS: GalleryProject[] = [
  { name: "Fieldnotes", year: 2020, img: `${ASSET_BASE}/img1.jpg` },
  { name: "Redline", year: 2021, img: `${ASSET_BASE}/img2.jpg` },
  { name: "Gallery Walk", year: 2019, img: `${ASSET_BASE}/img3.jpg` },
  { name: "Side Profile", year: 2022, img: `${ASSET_BASE}/img4.jpg` },
  { name: "Open Mic", year: 2023, img: `${ASSET_BASE}/img5.jpg` },
  { name: "Backboard", year: 2024, img: `${ASSET_BASE}/img6.jpg` },
  { name: "Afterglow", year: 2021, img: `${ASSET_BASE}/img7.jpg` },
  { name: "Hill House", year: 2020, img: `${ASSET_BASE}/img8.jpg` },
  { name: "Low Tide", year: 2018, img: `${ASSET_BASE}/img9.jpg` },
  { name: "Timepiece", year: 2019, img: `${ASSET_BASE}/img10.jpg` },
  { name: "Close Focus", year: 2022, img: `${ASSET_BASE}/img11.jpg` },
  { name: "Airframe", year: 2023, img: `${ASSET_BASE}/img12.jpg` },
  { name: "Hardcase", year: 2024, img: `${ASSET_BASE}/img13.jpg` },
  { name: "Deep Red", year: 2021, img: `${ASSET_BASE}/img14.jpg` },
  { name: "Fast Track", year: 2022, img: `${ASSET_BASE}/img15.jpg` },
  { name: "Night Shift", year: 2025, img: `${ASSET_BASE}/img16.jpg` },
];

export default function ExpandingRowsGallery({
  projects = DEFAULT_PROJECTS,
  projectsPerRow = 9,
  totalRows = 10,
  introText = "Selected work, shot on location",
  outroText = "Full archive available on request",
  embedded = true,
}: ExpandingRowsGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const content = root.querySelector<HTMLElement>(".erg-content");
    const section = root.querySelector<HTMLElement>(".erg-projects");
    if (!content || !section) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const rows = Array.from(
      section.querySelectorAll<HTMLElement>(".erg-projects-row"),
    );
    const firstRow = rows[0];
    if (!firstRow) return;

    let rowStartWidth = 125;
    let rowEndWidth = 500;

    const sectionGap = Number.parseFloat(getComputedStyle(section).gap) || 0;
    const sectionPadding =
      Number.parseFloat(getComputedStyle(section).paddingTop) || 0;

    function measure() {
      const isMobile = window.innerWidth < 1000;
      rowStartWidth = isMobile ? 250 : 125;
      rowEndWidth = isMobile ? 750 : 500;

      firstRow.style.width = `${rowEndWidth}%`;
      const expandedRowHeight = firstRow.offsetHeight;
      firstRow.style.width = "";

      const expandedSectionHeight =
        expandedRowHeight * rows.length +
        sectionGap * (rows.length - 1) +
        sectionPadding * 2;

      if (section) section.style.height = `${expandedSectionHeight}px`;
    }

    measure();

    function onScrollUpdate() {
      if (!root) return;
      const scrollY = embedded ? root.scrollTop : window.scrollY;
      const viewportHeight = embedded ? root.clientHeight : window.innerHeight;
      const originTop = embedded ? root.getBoundingClientRect().top : 0;

      for (const row of rows) {
        const rect = row.getBoundingClientRect();
        const rowTop = rect.top - originTop + scrollY;
        const rowBottom = rowTop + rect.height;

        const scrollStart = rowTop - viewportHeight;
        const scrollEnd = rowBottom;

        let progress = (scrollY - scrollStart) / (scrollEnd - scrollStart);
        progress = Math.max(0, Math.min(1, progress));

        const width = rowStartWidth + (rowEndWidth - rowStartWidth) * progress;
        row.style.width = `${width}%`;
      }
    }

    gsap.ticker.add(onScrollUpdate);
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
      gsap.ticker.remove(onScrollUpdate);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  const rowsData: GalleryProject[][] = [];
  let projectIndex = 0;
  for (let r = 0; r < totalRows; r++) {
    const rowProjects: GalleryProject[] = [];
    for (let c = 0; c < projectsPerRow; c++) {
      rowProjects.push(projects[projectIndex % projects.length]);
      projectIndex++;
    }
    rowsData.push(rowProjects);
  }

  return (
    <div className="erg-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="erg-content">
        <section className="erg-intro">
          <p>{introText}</p>
        </section>

        <section className="erg-projects">
          {rowsData.map((rowProjects, rowIndex) => (
            <div
              className="erg-projects-row"
              // ponytail: rows are static per mount, index key is fine
              key={`row-${rowIndex}`}
            >
              {rowProjects.map((project, colIndex) => (
                <div
                  className="erg-project"
                  key={`${project.name}-${colIndex}`}
                >
                  <div className="erg-project-img">
                    <img
                      alt={project.name}
                      draggable={false}
                      src={project.img}
                    />
                  </div>
                  <div className="erg-project-info">
                    <p>{project.name}</p>
                    <p>{project.year}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className="erg-outro">
          <p>{outroText}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.cdnfonts.com/css/pp-neue-montreal");

.erg-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #fff;
  color: #000;
  font-family: "PP Neue Montreal", sans-serif;
}

.erg-root::-webkit-scrollbar {
  display: none;
}

.erg-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.erg-root p {
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: -0.02rem;
  line-height: 1;
}

.erg-intro,
.erg-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.erg-projects {
  position: relative;
  width: 100%;
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.erg-projects-row {
  width: 125%;
  display: flex;
  gap: 1rem;
  flex: none;
}

.erg-project {
  flex: 1;
  aspect-ratio: 7/5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.erg-project-img {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.erg-project-info {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.erg-project-info p {
  font-size: 0.75rem;
}
`;

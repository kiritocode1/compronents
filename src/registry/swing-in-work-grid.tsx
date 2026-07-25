"use client";

/**
 * Swing In Work Grid - a work index where each row swings into place. Cards
 * start a thousand pixels low and rotated sixty degrees, mirrored left against
 * right, so a row reads as two panels hinging shut. The row fires once when it
 * reaches mid viewport and the pair lands on a quarter second stagger, which
 * keeps the second card still turning as the first settles.
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

const ASSET_BASE = "https://ui.aryank.space/assets/swing-in-work-grid";

export interface WorkProject {
  name: string;
  description: string;
  img: string;
  route: string;
}

export interface SwingInWorkGridProps {
  heading?: string;
  footerLeft?: string;
  footerRight?: string;
  projects?: WorkProject[];
  embedded?: boolean;
}

const DEFAULT_PROJECTS: WorkProject[] = [
  {
    name: "Silent Form",
    description: "Exploring movement against open light",
    img: `${ASSET_BASE}/work-1.jpg`,
    route: "/silent-form",
  },
  {
    name: "Golden Hour",
    description: "Portraits shaped by warmth and shadow",
    img: `${ASSET_BASE}/work-2.jpg`,
    route: "/golden-hour",
  },
  {
    name: "Redline",
    description: "Cycles of speed and intensity",
    img: `${ASSET_BASE}/work-3.jpg`,
    route: "/redline",
  },
  {
    name: "Verdant Studio",
    description: "A brand identity in deep green",
    img: `${ASSET_BASE}/work-4.jpg`,
    route: "/verdant-studio",
  },
  {
    name: "Crimson Tool",
    description: "Minimal object framed in red velvet",
    img: `${ASSET_BASE}/work-5.jpg`,
    route: "/crimson-tool",
  },
  {
    name: "Moonstairs",
    description: "Architecture under quiet light",
    img: `${ASSET_BASE}/work-6.jpg`,
    route: "/moonstairs",
  },
  {
    name: "Backlit Figure",
    description: "Silhouettes cut against color",
    img: `${ASSET_BASE}/work-7.jpg`,
    route: "/backlit-figure",
  },
  {
    name: "Palm Study",
    description: "Natural light and textured skin",
    img: `${ASSET_BASE}/work-8.jpg`,
    route: "/palm-study",
  },
  {
    name: "Terra Seat",
    description: "Earth tones in crafted design",
    img: `${ASSET_BASE}/work-9.jpg`,
    route: "/terra-seat",
  },
  {
    name: "Atelier Meridian",
    description: "A living space, curated and minimal",
    img: `${ASSET_BASE}/work-10.jpg`,
    route: "/atelier-meridian",
  },
];

export default function SwingInWorkGrid({
  heading = "Featured Work",
  footerLeft = "Developed by BLANK",
  footerRight = "All rights reserved © 2025",
  projects = DEFAULT_PROJECTS,
  embedded = true,
}: SwingInWorkGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".mbn-content");
    if (!content) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    gsap.set(root.querySelectorAll(".mbn-work-item"), { y: 1000 });

    const triggers: ScrollTrigger[] = [];

    for (const row of gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".mbn-row"),
    )) {
      const workItems = gsap.utils.toArray<HTMLElement>(
        row.querySelectorAll(".mbn-work-item"),
      );

      workItems.forEach((item, itemIndex) => {
        const isLeftProjectItem = itemIndex === 0;
        gsap.set(item, {
          rotation: isLeftProjectItem ? -60 : 60,
          transformOrigin: "center center",
        });
      });

      triggers.push(
        ScrollTrigger.create({
          trigger: row,
          scroller,
          start: "top 50%",
          invalidateOnRefresh: true,
          onEnter: () => {
            gsap.to(workItems, {
              y: 0,
              rotation: 0,
              duration: 1,
              ease: "power4.out",
              stagger: 0.25,
            });
          },
        }),
      );
    }

    ScrollTrigger.refresh();

    return () => {
      for (const trigger of triggers) trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, projects]);

  const rows: WorkProject[][] = [];
  for (let i = 0; i < projects.length; i += 2) {
    rows.push(projects.slice(i, i + 2));
  }

  return (
    <div
      className={embedded ? "mbn-root mbn-embedded" : "mbn-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="mbn-content">
        <header className="mbn-header">
          <h1>{heading}</h1>
        </header>

        <section className="mbn-work">
          {rows.map((row) => (
            <div className="mbn-row" key={row[0].name}>
              {row.map((project) => (
                <div className="mbn-work-item" key={project.name}>
                  <a href={project.route} className="mbn-work-item-link">
                    <div className="mbn-work-item-img">
                      <img src={project.img} alt={project.name} />
                    </div>
                    <div className="mbn-work-item-copy">
                      <h3>{project.name}</h3>
                      <p>{project.description}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          ))}
        </section>

        <footer className="mbn-footer">
          <p>{footerLeft}</p>
          <p>{footerRight}</p>
        </footer>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.mbn-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Manrope", sans-serif;
  background-color: #edf1e8;
  color: #0f0f0f;
}
.mbn-root.mbn-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.mbn-root.mbn-embedded::-webkit-scrollbar { display: none; }
.mbn-root * { margin: 0; padding: 0; box-sizing: border-box; }
.mbn-content { position: relative; width: 100%; }
.mbn-root img { width: 100%; height: 100%; object-fit: cover; }
.mbn-root h1 { font-size: 4rem; letter-spacing: -0.1rem; }
.mbn-root h3 { font-size: 1.25rem; letter-spacing: -0.025rem; }
.mbn-root p {
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: -0.0125rem;
}
.mbn-root a { text-decoration: none; }
.mbn-header,
.mbn-footer {
  position: relative;
  width: 100%;
  height: 400px;
  text-align: center;
  align-content: center;
  padding: 1.5rem;
}
.mbn-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.mbn-work {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  overflow: hidden;
}
.mbn-row {
  flex: 1;
  width: 100%;
  display: flex;
  gap: 1.5rem;
}
.mbn-work-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.mbn-work-item-img { aspect-ratio: 4/3; overflow: hidden; }
.mbn-work-item-copy p { color: #999; }
.mbn-work-item-link {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  width: 100%;
  height: 100%;
}
.mbn-work-item-link:hover { text-decoration: none; color: inherit; }

@media (max-width: 1000px) {
  .mbn-work,
  .mbn-row { gap: 2rem; }
  .mbn-row { flex-direction: column; }
  .mbn-footer {
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
  }
}
`;

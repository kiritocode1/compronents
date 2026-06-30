"use client";

/**
 * Portfolio Page — a full single-screen portfolio with a clip-path page wipe.
 *
 * A dark landing screen reveals its wordmark line-by-line from behind masking
 * bars, lists projects whose thumbnails slide open on hover, and carries a
 * grainy noise overlay throughout. Clicking a project wipes the whole screen
 * away with a clip-path transition into a light project view; a back button
 * wipes home again. Built with Motion (framer-motion) and AnimatePresence.
 *
 * It owns its scroll and fills its container, so size the wrapper full-screen
 * for a real page or drop it into a bounded box.
 *
 * BLANK — aryank.space
 */

import { AnimatePresence, type Easing, motion } from "motion/react";
import { useState } from "react";

export interface PortfolioProject {
  name: string;
  category: string;
  year: string;
  image: string;
  description: string;
}

export interface PortfolioPageProps {
  /** The three big landing wordmark lines (left column). */
  primaryLines?: [string, string, string];
  /** The three big landing lines (right column). */
  secondaryLines?: [string, string, string];
  projects?: PortfolioProject[];
  aboutLead?: string;
  aboutBody?: string;
  socials?: { label: string; href: string }[];
  /** Three short studio credits in the landing footer. */
  credits?: [string, string, string];
  bg?: string;
  text?: string;
  projectBg?: string;
}

const ASSET = "https://compronents.dev/assets/portfolio-page";
const EASE: Easing = [0.83, 0, 0.17, 1];

const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    name: "Inked",
    category: "experience",
    year: "/2022",
    image: `${ASSET}/project-1.jpg`,
    description:
      "A typographic launch experience built around a single ink-bleed transition and a lot of restraint.",
  },
  {
    name: "Chromatic",
    category: "development",
    year: "/2023",
    image: `${ASSET}/project-2.jpg`,
    description:
      "A color-driven product site where every section owns its own palette and the scroll blends between them.",
  },
  {
    name: "Impressions",
    category: "portfolio",
    year: "/2019",
    image: `${ASSET}/project-3.jpg`,
    description:
      "A studio portfolio with a clip-path page model — the screen wipes rather than navigates.",
  },
  {
    name: "Stellar",
    category: "experience",
    year: "/2021",
    image: `${ASSET}/project-4.jpg`,
    description:
      "An immersive scroll piece about orbital mechanics, paced entirely by a pinned timeline.",
  },
  {
    name: "Byte",
    category: "development",
    year: "/2018",
    image: `${ASSET}/project-5.jpg`,
    description:
      "A developer landing page that treats the terminal as the hero and the cursor as the narrator.",
  },
];

const DEFAULT_SOCIALS = [
  { label: "email", href: "mailto:hello@aryank.space" },
  { label: "twitter", href: "https://aryank.space" },
  { label: "linkedin", href: "https://aryank.space" },
];

export default function PortfolioPage({
  primaryLines = ["blank", "visual", "dev."],
  secondaryLines = ["portfolio", "2025&", "2026."],
  projects = DEFAULT_PROJECTS,
  aboutLead = "(about this guy)",
  aboutBody = "Blank is a software developer building considered digital experiences from aryank.space — interfaces, motion, and the small details that make a product feel alive. Equal parts engineer and art director, happiest where the two overlap.",
  socials = DEFAULT_SOCIALS,
  credits = [
    "currently creating at|aryank.space",
    "previously visual dev at|chromatic waves",
    "prev intern|at mario",
  ],
  bg = "#191c1a",
  text = "#b0b0b0",
  projectBg = "#b0b0b0",
}: PortfolioPageProps) {
  const [active, setActive] = useState<number | null>(null);

  const headerLineMotion = (delay: number) => ({
    initial: { top: "7rem" },
    animate: {
      top: 0,
      transition: { duration: 1.5, ease: EASE, delay },
    },
  });

  return (
    <div
      className="pf-root"
      style={
        {
          ["--pf-bg" as string]: bg,
          ["--pf-text" as string]: text,
          ["--pf-project" as string]: projectBg,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="pf-noise" />

      <AnimatePresence mode="wait">
        {active === null ? (
          <motion.div
            key="home"
            className="pf-view"
            initial={{
              clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
            }}
            animate={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              transition: { duration: 0.1, ease: EASE },
            }}
            exit={{
              clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
              transition: { duration: 0.75, ease: EASE },
            }}
          >
            <div className="pf-home">
              <section className="pf-hero">
                <div className="pf-headers">
                  <div className="pf-header">
                    {primaryLines.map((line, i) => (
                      <h1 key={line}>
                        <motion.div
                          className="pf-h1"
                          {...headerLineMotion(-0.25 + i * 0.15)}
                        >
                          {line}
                        </motion.div>
                        <div className="pf-h1-revealer" />
                      </h1>
                    ))}
                  </div>
                  <div className="pf-header pf-header-2">
                    {secondaryLines.map((line, i) => (
                      <h1 key={line}>
                        <motion.div
                          className="pf-h1"
                          {...headerLineMotion(-0.25 + i * 0.15)}
                        >
                          {line}
                        </motion.div>
                        <div className="pf-h1-revealer" />
                      </h1>
                    ))}
                  </div>
                </div>

                <div className="pf-footer">
                  <motion.div
                    className="pf-divider"
                    initial={{ width: 0 }}
                    animate={{
                      width: "100%",
                      transition: { duration: 1.5, ease: EASE },
                    }}
                  />
                  <motion.div
                    className="pf-footer-content"
                    initial={{ y: 200, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: { duration: 2, ease: EASE },
                    }}
                  >
                    <div className="pf-footer-col">
                      <div className="pf-arrow">
                        <p>&darr;</p>
                      </div>
                      <div className="pf-arrow">
                        <p>&darr;</p>
                      </div>
                    </div>
                    {credits.map((credit) => {
                      const [a, b] = credit.split("|");
                      return (
                        <div className="pf-footer-col" key={credit}>
                          <p>
                            {a} <br /> {b}
                          </p>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              </section>

              <div className="pf-projects-nav">
                <div className="pf-projects-nav-container">
                  {projects.map((project, i) => (
                    <div className="pf-project-item" key={project.name}>
                      <button
                        type="button"
                        className="pf-project-link"
                        onClick={() => setActive(i)}
                      >
                        <div className="pf-project-l">
                          <div className="pf-project-link-img">
                            {/* biome-ignore lint/performance/noImgElement: hover-revealed raw thumbnail. */}
                            <img src={project.image} alt="" />
                          </div>
                          <div className="pf-project-name">
                            <h2>{project.name}</h2>
                          </div>
                        </div>
                        <div className="pf-project-date">
                          <p>{project.category}</p>
                          <p>{project.year}</p>
                        </div>
                        <div className="pf-project-dir">
                          <p>&#8599;</p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <section className="pf-about">
                <div className="pf-about-container">
                  <div className="pf-about-col">
                    <p>{aboutLead}</p>
                    <p>{aboutBody}</p>
                  </div>
                  <div className="pf-about-col">
                    <div className="pf-socials">
                      {socials.map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {social.label} &#8599;
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="pf-footer">
                <div className="pf-divider" />
                <div className="pf-footer-content">
                  <div className="pf-footer-col">
                    <div className="pf-arrow">
                      <p>&#8593;</p>
                    </div>
                    <div className="pf-arrow">
                      <p>&#8593;</p>
                    </div>
                  </div>
                  <div className="pf-footer-col">
                    <p>
                      &copy; by <br /> aryank.space
                    </p>
                  </div>
                  <div className="pf-footer-col">
                    <p>
                      made with <br /> considered motion
                    </p>
                  </div>
                  <div className="pf-footer-col">
                    <p>
                      all rights <br /> reserved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="project"
            className="pf-view"
            initial={{
              clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
            }}
            animate={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              transition: { duration: 0.1, ease: EASE },
            }}
            exit={{
              clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
              transition: { duration: 0.75, ease: EASE },
            }}
          >
            <ProjectView
              project={projects[active]}
              onBack={() => setActive(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectView({
  project,
  onBack,
}: {
  project: PortfolioProject;
  onBack: () => void;
}) {
  return (
    <div className="pf-project">
      <motion.button
        type="button"
        className="pf-back-button"
        onClick={onBack}
        aria-label="Back"
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          transition: { duration: 1.5, ease: EASE, delay: 0.5 },
        }}
      >
        <p>&#8592;</p>
      </motion.button>

      <div className="pf-project-container">
        <div className="pf-project-info">
          <motion.div
            className="pf-project-img"
            initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
            animate={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              transition: { duration: 1.75, ease: EASE },
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: raw image driven by Motion (scale) inside a clip-path reveal. */}
            <motion.img
              src={project.image}
              alt=""
              initial={{ scale: 1.5 }}
              animate={{ scale: 1, transition: { duration: 1.75, ease: EASE } }}
            />
          </motion.div>
          <motion.div
            className="pf-project-description"
            initial={{ x: -40, opacity: 0 }}
            animate={{
              x: 0,
              opacity: 1,
              transition: { duration: 1.5, ease: EASE, delay: 0.25 },
            }}
          >
            <p>
              <b>{project.name}</b>
            </p>
            <p>{project.description}</p>
          </motion.div>
        </div>

        <div className="pf-footer">
          <motion.div
            className="pf-divider"
            initial={{ width: 0 }}
            animate={{
              width: "100%",
              transition: { duration: 1.5, ease: EASE, delay: 1 },
            }}
          />
          <motion.div
            className="pf-footer-content"
            initial={{ y: 200, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { duration: 2, ease: EASE, delay: 0.5 },
            }}
          >
            <div className="pf-footer-col">
              <div className="pf-arrow">
                <p>&darr;</p>
              </div>
              <div className="pf-arrow">
                <p>&darr;</p>
              </div>
            </div>
            <div className="pf-footer-col">
              <p>
                (category) <br /> {project.category}
              </p>
            </div>
            <div className="pf-footer-col">
              <p>
                (year) <br /> {project.year.replace("/", "")}
              </p>
            </div>
            <div className="pf-footer-col">
              <p>
                (profile) <br /> front end dev
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const NOISE_DATA_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

const styles = `
.pf-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--pf-bg, #191c1a);
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  text-transform: uppercase;
}

.pf-root .pf-noise {
  position: absolute;
  top: -25%;
  left: -25%;
  width: 150%;
  height: 150%;
  z-index: 5;
  background: ${NOISE_DATA_URI} repeat;
  background-size: 180px 180px;
  opacity: 0.08;
  pointer-events: none;
  will-change: transform;
  animation: pf-noise 0.4s steps(2) infinite;
}
@keyframes pf-noise {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-8%, 5%); }
  100% { transform: translate(6%, -4%); }
}

.pf-root .pf-view {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.pf-root .pf-view::-webkit-scrollbar { display: none; }

.pf-root h1, .pf-root h2, .pf-root h3 { font-weight: 400; }
.pf-root h1 { font-size: clamp(3rem, 6.5vw, 6.5rem); line-height: 0.85; letter-spacing: -0.04em; position: relative; }
.pf-root h2 { font-size: clamp(1.6rem, 3.4vw, 3.375rem); line-height: 0.85; letter-spacing: -0.03em; }
.pf-root p, .pf-root a { font-size: 0.75rem; font-weight: 500; }
.pf-root h1, .pf-root h2, .pf-root h3, .pf-root p, .pf-root a {
  position: relative;
  color: var(--pf-text, #b0b0b0);
}
.pf-root a { text-decoration: none; }

.pf-root .pf-home { padding: 2em; }

.pf-root .pf-hero {
  width: 100%;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 5em;
}
.pf-root .pf-headers { width: 100%; display: flex; justify-content: space-between; }
.pf-root .pf-header h1 { overflow: hidden; display: block; }
.pf-root .pf-h1 { position: relative; display: block; }
.pf-root .pf-h1-revealer { position: relative; }
.pf-root .pf-h1-revealer::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 120%;
  height: 7rem;
  background: var(--pf-bg, #191c1a);
  z-index: 0;
}
.pf-root .pf-header-2 { margin-top: 4rem; }

.pf-root .pf-footer { width: 100%; opacity: 0.5; }
.pf-root .pf-divider { margin: 0.75em 0; width: 100%; height: 1px; background: var(--pf-text, #b0b0b0); }
.pf-root .pf-footer-content { padding: 0.75em 0; width: 100%; display: flex; justify-content: space-between; }
.pf-root .pf-footer-col:nth-child(1) { display: flex; }
.pf-root .pf-arrow {
  margin-right: 0.25rem;
  background: var(--pf-text, #b0b0b0);
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
}
.pf-root .pf-arrow p { color: var(--pf-bg, #191c1a); }

.pf-root .pf-projects-nav { margin: 8rem 0 2em 0; width: 100%; }
.pf-root .pf-projects-nav-container { width: 75%; margin-left: auto; }
.pf-root .pf-project-link {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid var(--pf-text, #b0b0b0);
  min-height: 110px;
  padding: 1em 0;
  background: none;
  cursor: pointer;
  text-align: left;
}
.pf-root .pf-project-l { display: flex; flex: 4; align-items: center; }
.pf-root .pf-project-date { flex: 2; }
.pf-root .pf-project-dir { flex: 0.5; text-align: right; }
.pf-root .pf-project-link-img {
  margin-right: 1em;
  width: 0;
  height: 90px;
  overflow: hidden;
  transition: width 1s cubic-bezier(0.075, 0.82, 0.165, 1);
}
.pf-root .pf-project-link:hover .pf-project-link-img,
.pf-root .pf-project-link:focus-visible .pf-project-link-img { width: 120px; }
.pf-root .pf-project-link img { width: 120px; height: 100%; object-fit: cover; }

.pf-root .pf-about { margin: 4rem 0; width: 100%; padding: 8rem 0; }
.pf-root .pf-about-container { width: 75%; margin-left: auto; display: flex; gap: 6rem; }
.pf-root .pf-about-col:nth-child(1) { flex: 3; }
.pf-root .pf-about-col:nth-child(2) { flex: 2; }
.pf-root .pf-about-col p:nth-child(1) { opacity: 0.5; margin-bottom: 1rem; }
.pf-root .pf-about-col p { line-height: 1.6; }
.pf-root .pf-socials { display: flex; flex-direction: column; gap: 0.4rem; }

/* Project view */
.pf-root .pf-project { position: relative; height: 100%; }
.pf-root .pf-back-button {
  position: absolute;
  margin: 1.5em;
  width: 32px;
  height: 32px;
  background: var(--pf-bg, #191c1a);
  border: 0;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
}
.pf-root .pf-back-button p { color: var(--pf-text, #b0b0b0); }
.pf-root .pf-project-container {
  width: 100%;
  min-height: 100%;
  background: var(--pf-project, #b0b0b0);
  padding: 2em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4em;
}
.pf-root .pf-project-container * { color: var(--pf-bg, #191c1a); }
.pf-root .pf-project-container .pf-divider { background: var(--pf-bg, #191c1a); }
.pf-root .pf-project-container .pf-footer { opacity: 1; }
.pf-root .pf-project-container .pf-arrow { background: var(--pf-bg, #191c1a); }
.pf-root .pf-project-container .pf-arrow p { color: var(--pf-project, #b0b0b0); }
.pf-root .pf-project-info {
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  gap: 6em;
  align-items: flex-end;
  padding-top: 5em;
}
.pf-root .pf-project-img {
  flex: 5;
  max-width: 520px;
  aspect-ratio: 1;
  clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
}
.pf-root .pf-project-img img { width: 100%; height: 100%; object-fit: cover; }
.pf-root .pf-project-description { flex: 2; }
.pf-root .pf-project-description p { line-height: 1.6; }
.pf-root .pf-project-description p:first-child { margin-bottom: 1rem; font-size: 1rem; }

@media (max-width: 900px) {
  .pf-root .pf-headers { flex-direction: column; gap: 2rem; }
  .pf-root .pf-about-container { width: 100%; flex-direction: column; gap: 3em; }
  .pf-root .pf-projects-nav-container { width: 100%; }
  .pf-root .pf-project-date { display: none; }
  .pf-root .pf-project-info { flex-direction: column; gap: 2em; align-items: stretch; }
  .pf-root .pf-project-img { max-width: 100%; }
}
`;

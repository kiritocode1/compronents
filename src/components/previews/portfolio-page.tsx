"use client";

import PortfolioPage, {
  type PortfolioProject,
} from "@/registry/portfolio-page";

const BASE = "/assets/portfolio-page";
const PROJECTS: PortfolioProject[] = [
  {
    name: "Inked",
    category: "experience",
    year: "/2022",
    image: `${BASE}/project-1.jpg`,
    description:
      "A typographic launch experience built around a single ink-bleed transition and a lot of restraint.",
  },
  {
    name: "Chromatic",
    category: "development",
    year: "/2023",
    image: `${BASE}/project-2.jpg`,
    description:
      "A color-driven product site where every section owns its own palette and the scroll blends between them.",
  },
  {
    name: "Impressions",
    category: "portfolio",
    year: "/2019",
    image: `${BASE}/project-3.jpg`,
    description:
      "A studio portfolio with a clip-path page model — the screen wipes rather than navigates.",
  },
  {
    name: "Stellar",
    category: "experience",
    year: "/2021",
    image: `${BASE}/project-4.jpg`,
    description:
      "An immersive scroll piece about orbital mechanics, paced entirely by a pinned timeline.",
  },
  {
    name: "Byte",
    category: "development",
    year: "/2018",
    image: `${BASE}/project-5.jpg`,
    description:
      "A developer landing page that treats the terminal as the hero and the cursor as the narrator.",
  },
];

/** Full-viewport preview of the Portfolio Page. */
export default function Preview() {
  return (
    <div style={{ position: "relative", height: "100svh", width: "100%" }}>
      <PortfolioPage projects={PROJECTS} />
    </div>
  );
}

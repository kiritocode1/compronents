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

/**
 * Bounded preview of the Portfolio Page. Hover a project to slide its thumbnail
 * open, then click it to wipe the whole screen into the project view; the back
 * button (top-left) wipes home again.
 */
export default function Demo() {
  return (
    <div className="relative h-[620px] w-full overflow-hidden rounded-md">
      <PortfolioPage projects={PROJECTS} />
    </div>
  );
}

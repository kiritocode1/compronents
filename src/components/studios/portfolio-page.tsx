"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
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

const PRESETS = [
  {
    id: "moss",
    label: "Moss",
    bg: "#191c1a",
    text: "#b0b0b0",
    projectBg: "#b0b0b0",
  },
  {
    id: "paper",
    label: "Paper",
    bg: "#e9e6df",
    text: "#1a1a1a",
    projectBg: "#1a1a1a",
  },
  {
    id: "ink",
    label: "Ink",
    bg: "#0c0c10",
    text: "#7f86ff",
    projectBg: "#7f86ff",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function PortfolioPageStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [bg, setBg] = useState<string>(preset.bg);
  const [text, setText] = useState<string>(preset.text);
  const [projectBg, setProjectBg] = useState<string>(preset.projectBg);

  const studioKey = [bg, text, projectBg].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setBg(next.bg);
    setText(next.text);
    setProjectBg(next.projectBg);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[640px] w-full overflow-hidden rounded-t-lg">
        <Link
          href="/components/portfolio-page/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-[200] flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <PortfolioPage
          key={studioKey}
          projects={PROJECTS}
          bg={bg}
          text={text}
          projectBg={projectBg}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Portfolio Page
              </h2>
            </div>
            <button
              type="button"
              onClick={() => applyPreset(PRESETS[0])}
              aria-label="Reset studio"
              title="Reset studio"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-md border bg-card p-1 xl:max-w-xl">
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item)}
                className={`flex min-h-10 items-center justify-center rounded px-3 text-center text-[0.68rem] uppercase leading-tight transition-colors ${
                  preset.id === item.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[3fr_1.4fr]">
          <section className="grid grid-cols-3 gap-3">
            <StudioColor label="Backdrop" value={bg} onChange={setBg} />
            <StudioColor label="Ink" value={text} onChange={setText} />
            <StudioColor
              label="Project bg"
              value={projectBg}
              onChange={setProjectBg}
            />
          </section>

          <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              The whole screen is a clip-path that wipes between home and a
              project — the project view paints its own background, so its color
              is the inverse of the landing.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

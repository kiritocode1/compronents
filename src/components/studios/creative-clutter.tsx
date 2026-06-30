"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import CreativeClutter from "@/registry/creative-clutter";

const ITEM_IDS = [
  "music",
  "cd",
  "dialog",
  "folder",
  "macmini",
  "paper",
  "passport",
  "portrait",
  "appicon",
  "lighter",
  "cursor",
];
const IMAGES = ITEM_IDS.map((id) => `/assets/creative-clutter/${id}.png`);

const PRESETS = [
  {
    id: "paper",
    label: "Paper",
    heading: "Creative Clutter",
    background: "#f5f2ed",
    textColor: "#171717",
    mutedColor: "#5f5f5f",
    surfaceColor: "#f5f2ed",
    borderColor: "#e0dfd7",
  },
  {
    id: "slate",
    label: "Slate",
    heading: "Ordered Mess",
    background: "#1b1b1b",
    textColor: "#f3f1ec",
    mutedColor: "#9a9a92",
    surfaceColor: "#222222",
    borderColor: "#343434",
  },
  {
    id: "sand",
    label: "Sand",
    heading: "Studio Floor",
    background: "#e7ddc9",
    textColor: "#2c2418",
    mutedColor: "#6c6151",
    surfaceColor: "#efe7d6",
    borderColor: "#d6cbb3",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function CreativeClutterStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [heading, setHeading] = useState<string>(preset.heading);
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [mutedColor, setMutedColor] = useState<string>(preset.mutedColor);
  const [surfaceColor, setSurfaceColor] = useState<string>(preset.surfaceColor);
  const [borderColor, setBorderColor] = useState<string>(preset.borderColor);

  function applyPreset(next: Preset) {
    setPreset(next);
    setHeading(next.heading);
    setBackground(next.background);
    setTextColor(next.textColor);
    setMutedColor(next.mutedColor);
    setSurfaceColor(next.surfaceColor);
    setBorderColor(next.borderColor);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-[#f5f2ed] xl:h-[760px]">
        <Link
          href="/components/creative-clutter/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/50 text-black/70 backdrop-blur transition-colors hover:bg-black/10 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <CreativeClutter
          images={IMAGES}
          heading={heading}
          background={background}
          textColor={textColor}
          mutedColor={mutedColor}
          surfaceColor={surfaceColor}
          borderColor={borderColor}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Creative Clutter
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)]">
          <label className="flex flex-col gap-2">
            <span className="label">Heading</span>
            <input
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
              className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
            />
            <div className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Use the three buttons on the board to flip between chaos,
                cleanup, and notebook layouts.
              </p>
            </div>
          </label>

          <section className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3">
            <StudioColor
              label="Back"
              value={background}
              onChange={setBackground}
            />
            <StudioColor
              label="Text"
              value={textColor}
              onChange={setTextColor}
            />
            <StudioColor
              label="Muted"
              value={mutedColor}
              onChange={setMutedColor}
            />
            <StudioColor
              label="Surface"
              value={surfaceColor}
              onChange={setSurfaceColor}
            />
            <StudioColor
              label="Border"
              value={borderColor}
              onChange={setBorderColor}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}

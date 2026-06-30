"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import FrameScroll from "@/registry/frame-scroll";

const HERO = "/assets/frame-scroll/hero.jpg";
const IMAGES = Array.from(
  { length: 16 },
  (_, i) => `/assets/frame-scroll/img-${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "bone",
    label: "Bone",
    heading: "A study of motion unfolding inside a single frame",
    background: "#e3e3db",
    textColor: "#171717",
    heroTextColor: "#ffffff",
  },
  {
    id: "noir",
    label: "Noir",
    heading: "Stillness held one breath before it moves",
    background: "#121212",
    textColor: "#eceae3",
    heroTextColor: "#ffffff",
  },
  {
    id: "clay",
    label: "Clay",
    heading: "Quiet frames drifting toward a single still",
    background: "#d9cbbb",
    textColor: "#2a2018",
    heroTextColor: "#fdf6ec",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function FrameScrollStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [heading, setHeading] = useState<string>(preset.heading);
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [heroTextColor, setHeroTextColor] = useState<string>(
    preset.heroTextColor,
  );

  function applyPreset(next: Preset) {
    setPreset(next);
    setHeading(next.heading);
    setBackground(next.background);
    setTextColor(next.textColor);
    setHeroTextColor(next.heroTextColor);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-[#e3e3db] xl:h-[760px]">
        <Link
          href="/components/frame-scroll/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/50 text-black/70 backdrop-blur transition-colors hover:bg-black/10 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <FrameScroll
          heroImage={HERO}
          images={IMAGES}
          heading={heading}
          background={background}
          textColor={textColor}
          heroTextColor={heroTextColor}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Frame Scroll
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(280px,1fr)_minmax(240px,1fr)]">
          <label className="flex flex-col gap-2">
            <span className="label">Hero heading</span>
            <input
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
              className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
            />
            <div className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Scroll inside the frame: the headline lifts away, the second
                line fades in word by word, and the photo shrinks to a tile.
              </p>
            </div>
          </label>

          <section className="grid grid-cols-3 content-start gap-3">
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
              label="Hero"
              value={heroTextColor}
              onChange={setHeroTextColor}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}

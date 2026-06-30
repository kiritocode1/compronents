"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import SpiralGallery from "@/registry/spiral-gallery";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/assets/spiral-gallery/img-${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "graphite",
    label: "Graphite",
    heading:
      "Somewhere between structure and disorder new forms quietly start to emerge",
    heroBackground: "#242424",
    aboutBackground: "#171717",
    textColor: "#d2d2d2",
  },
  {
    id: "bone",
    label: "Bone",
    heading: "A slow turn through a coil of remembered frames",
    heroBackground: "#e7e3d8",
    aboutBackground: "#d8d2c4",
    textColor: "#1c1a16",
  },
  {
    id: "teal",
    label: "Teal",
    heading: "Order and drift winding around the same axis",
    heroBackground: "#0c1c1e",
    aboutBackground: "#081416",
    textColor: "#bfe6e2",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function SpiralGalleryStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [heading, setHeading] = useState<string>(preset.heading);
  const [heroBackground, setHeroBackground] = useState<string>(
    preset.heroBackground,
  );
  const [aboutBackground, setAboutBackground] = useState<string>(
    preset.aboutBackground,
  );
  const [textColor, setTextColor] = useState<string>(preset.textColor);

  function applyPreset(next: Preset) {
    setPreset(next);
    setHeading(next.heading);
    setHeroBackground(next.heroBackground);
    setAboutBackground(next.aboutBackground);
    setTextColor(next.textColor);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-[#242424] xl:h-[760px]">
        <Link
          href="/components/spiral-gallery/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white/70 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <SpiralGallery
          images={IMAGES}
          heading={heading}
          heroBackground={heroBackground}
          aboutBackground={aboutBackground}
          textColor={textColor}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Spiral Gallery
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
            <textarea
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
              rows={3}
              className="resize-none rounded-md border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-border-strong"
            />
            <div className="mt-1 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Scroll to descend through the coil. Scroll speed adds spin; the
                cursor tilts the whole helix.
              </p>
            </div>
          </label>

          <section className="grid grid-cols-3 content-start gap-3">
            <StudioColor
              label="Hero"
              value={heroBackground}
              onChange={setHeroBackground}
            />
            <StudioColor
              label="About"
              value={aboutBackground}
              onChange={setAboutBackground}
            />
            <StudioColor
              label="Text"
              value={textColor}
              onChange={setTextColor}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}

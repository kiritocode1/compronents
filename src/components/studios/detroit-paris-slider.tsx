"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import DetroitParisSlider from "@/registry/detroit-paris-slider";

const IMAGES = Array.from(
  { length: 10 },
  (_, i) => `/assets/detroit-paris-slider/slide-img-${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "paris",
    label: "Paris",
    title: "Perpetual Motion",
    background: "#edede7",
    textColor: "#111111",
    growth: 0.25,
    scrollSpeed: 3.5,
  },
  {
    id: "detroit",
    label: "Detroit",
    title: "Motor City Loop",
    background: "#10100f",
    textColor: "#eeeeea",
    growth: 0.3,
    scrollSpeed: 4.2,
  },
  {
    id: "archive",
    label: "Archive",
    title: "Image Conveyor",
    background: "#e1d6c2",
    textColor: "#3a2114",
    growth: 0.18,
    scrollSpeed: 2.6,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function DetroitParisSliderStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [title, setTitle] = useState<string>(preset.title);
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [growth, setGrowth] = useState<number>(preset.growth);
  const [scrollSpeed, setScrollSpeed] = useState<number>(preset.scrollSpeed);

  function applyPreset(next: Preset) {
    setPreset(next);
    setTitle(next.title);
    setBackground(next.background);
    setTextColor(next.textColor);
    setGrowth(next.growth);
    setScrollSpeed(next.scrollSpeed);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-[#edede7] xl:h-[760px]">
        <Link
          href="/components/detroit-paris-slider/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/40 text-black/70 backdrop-blur transition-colors hover:bg-black/10 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <DetroitParisSlider
          images={IMAGES}
          title={title}
          background={background}
          textColor={textColor}
          growth={growth}
          scrollSpeed={scrollSpeed}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Detroit Paris Slider
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(260px,1fr)_minmax(240px,1fr)_minmax(260px,1fr)]">
          <label className="flex flex-col gap-2">
            <span className="label">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
            />
          </label>

          <section className="grid content-start gap-3">
            <div className="grid grid-cols-2 gap-3">
              <StudioColor
                label="Text"
                value={textColor}
                onChange={setTextColor}
              />
              <StudioColor
                label="Back"
                value={background}
                onChange={setBackground}
              />
            </div>
          </section>

          <section className="grid content-start gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Growth"
              value={growth}
              onChange={setGrowth}
              min={0.1}
              max={0.4}
              step={0.01}
              formatValue={(v) => v.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Scroll speed"
              value={scrollSpeed}
              onChange={setScrollSpeed}
              min={1}
              max={6}
              step={0.1}
              formatValue={(v) => v.toFixed(1)}
            />
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Growth controls the exponential spacing. Lower values read like
                a conveyor; higher values make the foreground slide surge.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

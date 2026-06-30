"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import ScrollWaveGallery from "@/registry/scroll-wave-gallery";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/assets/scroll-wave-gallery/img-${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "linen",
    label: "Linen",
    outroText: "Crafted by BLANK",
    background: "#e3e4d8",
    textColor: "#000000",
    waveStrength: 1,
    clipMax: 20,
  },
  {
    id: "ink",
    label: "Ink",
    outroText: "Held in the dark",
    background: "#101010",
    textColor: "#f1f1ea",
    waveStrength: 1.3,
    clipMax: 28,
  },
  {
    id: "still",
    label: "Still",
    outroText: "Set in a straight line",
    background: "#dfd6c6",
    textColor: "#2a2117",
    waveStrength: 0.4,
    clipMax: 10,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function ScrollWaveGalleryStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [outroText, setOutroText] = useState<string>(preset.outroText);
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [waveStrength, setWaveStrength] = useState<number>(preset.waveStrength);
  const [clipMax, setClipMax] = useState<number>(preset.clipMax);

  function applyPreset(next: Preset) {
    setPreset(next);
    setOutroText(next.outroText);
    setBackground(next.background);
    setTextColor(next.textColor);
    setWaveStrength(next.waveStrength);
    setClipMax(next.clipMax);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-[#e3e4d8] xl:h-[760px]">
        <Link
          href="/components/scroll-wave-gallery/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/40 text-black/70 backdrop-blur transition-colors hover:bg-black/10 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <ScrollWaveGallery
          images={IMAGES}
          outroText={outroText}
          background={background}
          textColor={textColor}
          waveStrength={waveStrength}
          clipMax={clipMax}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Scroll Wave Gallery
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
            <span className="label">Outro heading</span>
            <input
              value={outroText}
              onChange={(event) => setOutroText(event.target.value)}
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
              label="Wave strength"
              value={waveStrength}
              onChange={setWaveStrength}
              min={0}
              max={2}
              step={0.1}
              formatValue={(v) => v.toFixed(1)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Center pinch"
              value={clipMax}
              onChange={setClipMax}
              min={0}
              max={40}
              step={1}
              formatValue={(v) => `${Math.round(v)}%`}
            />
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Wave strength scales the horizontal sway. Center pinch sets how
                far each frame clips inward as it crosses the middle.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

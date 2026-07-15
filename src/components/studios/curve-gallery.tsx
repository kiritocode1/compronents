"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import CurveGallery from "@/registry/curve-gallery";

const IMAGES = Array.from(
  { length: 12 },
  (_, index) => `/assets/scroll-tunnel-3d/img-${index + 1}.jpg`,
);

const PRESETS = [
  {
    id: "paper",
    name: "Paper",
    background: "#f2f0eb",
    foreground: "#171715",
    focusDistance: 4.8,
    maxScale: 11,
    autoplayDuration: 12,
  },
  {
    id: "ink",
    name: "Ink",
    background: "#11110f",
    foreground: "#f2f0eb",
    focusDistance: 5.4,
    maxScale: 9,
    autoplayDuration: 16,
  },
  {
    id: "signal",
    name: "Signal",
    background: "#d7f12f",
    foreground: "#10110c",
    focusDistance: 4.2,
    maxScale: 14,
    autoplayDuration: 9,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function CurveGalleryStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [background, setBackground] = useState<string>(preset.background);
  const [foreground, setForeground] = useState<string>(preset.foreground);
  const [focusDistance, setFocusDistance] = useState<number>(
    preset.focusDistance,
  );
  const [maxScale, setMaxScale] = useState<number>(preset.maxScale);
  const [autoplayDuration, setAutoplayDuration] = useState<number>(
    preset.autoplayDuration,
  );

  const applyPreset = (next: Preset) => {
    setPreset(next);
    setBackground(next.background);
    setForeground(next.foreground);
    setFocusDistance(next.focusDistance);
    setMaxScale(next.maxScale);
    setAutoplayDuration(next.autoplayDuration);
  };

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-[#f2f0eb] xl:h-[760px]">
        <Link
          href="/components/curve-gallery/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/60 text-black/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <CurveGallery
          images={IMAGES}
          background={background}
          foreground={foreground}
          focusDistance={focusDistance}
          maxScale={maxScale}
          autoplayDuration={autoplayDuration}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Curve Gallery
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
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(260px,1fr)_minmax(240px,1fr)_minmax(260px,1fr)]">
          <section className="grid content-start gap-4">
            <StudioColor
              label="Background"
              value={background}
              onChange={setBackground}
            />
            <StudioColor
              label="Interface"
              value={foreground}
              onChange={setForeground}
            />
          </section>

          <section className="grid content-start gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Focus radius"
              value={focusDistance}
              onChange={setFocusDistance}
              min={2.5}
              max={7}
              step={0.1}
              formatValue={(value) => value.toFixed(1)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Focus scale"
              value={maxScale}
              onChange={setMaxScale}
              min={4}
              max={18}
              step={1}
              formatValue={(value) => `${Math.round(value)}x`}
            />
          </section>

          <section className="grid content-start gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Auto lap"
              value={autoplayDuration}
              onChange={setAutoplayDuration}
              min={6}
              max={24}
              step={1}
              formatValue={(value) => `${Math.round(value)}s`}
            />
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Focus radius decides how many nearby frames bloom. Focus scale
                controls how decisively one photograph takes the foreground.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

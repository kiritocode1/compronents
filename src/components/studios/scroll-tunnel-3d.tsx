"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import ScrollTunnel3D from "@/registry/scroll-tunnel-3d";

const IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/assets/scroll-tunnel-3d/img-${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "archive",
    label: "Archive",
    title: "Through the archive",
    background: "#000000",
    scrollSpeed: 2,
    layerGap: 2500,
    lerp: 0.07,
  },
  {
    id: "daylight",
    label: "Daylight",
    title: "Open the catalog",
    background: "#e8e6df",
    scrollSpeed: 1.6,
    layerGap: 2200,
    lerp: 0.1,
  },
  {
    id: "velvet",
    label: "Velvet",
    title: "Down the corridor",
    background: "#0a0510",
    scrollSpeed: 2.6,
    layerGap: 3000,
    lerp: 0.05,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function ScrollTunnel3DStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [title, setTitle] = useState<string>(preset.title);
  const [background, setBackground] = useState<string>(preset.background);
  const [scrollSpeed, setScrollSpeed] = useState<number>(preset.scrollSpeed);
  const [layerGap, setLayerGap] = useState<number>(preset.layerGap);
  const [lerp, setLerp] = useState<number>(preset.lerp);

  function applyPreset(next: Preset) {
    setPreset(next);
    setTitle(next.title);
    setBackground(next.background);
    setScrollSpeed(next.scrollSpeed);
    setLayerGap(next.layerGap);
    setLerp(next.lerp);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-black xl:h-[760px]">
        <Link
          href="/components/scroll-tunnel-3d/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white/70 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <ScrollTunnel3D
          images={IMAGES}
          title={title}
          caption="Scroll or drag to fall deeper into the stack."
          background={background}
          scrollSpeed={scrollSpeed}
          layerGap={layerGap}
          lerp={lerp}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Scroll Tunnel 3D
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
            <StudioColor
              label="Background"
              value={background}
              onChange={setBackground}
            />
          </section>

          <section className="grid content-start gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Scroll speed"
              value={scrollSpeed}
              onChange={setScrollSpeed}
              min={0.5}
              max={5}
              step={0.1}
              formatValue={(v) => v.toFixed(1)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Depth gap"
              value={layerGap}
              onChange={setLayerGap}
              min={1500}
              max={4000}
              step={50}
              formatValue={(v) => `${Math.round(v)}px`}
            />
            <SliderComfortable
              variant="scrubber"
              label="Smoothing"
              value={lerp}
              onChange={setLerp}
              min={0.02}
              max={0.2}
              step={0.01}
              formatValue={(v) => v.toFixed(2)}
            />
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Depth gap spaces the rings along the tunnel. Lower smoothing
                snaps to the cursor; higher values drift like film advancing.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

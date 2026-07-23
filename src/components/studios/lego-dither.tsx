"use client";

import { Maximize2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SliderComfortable } from "@/components/site/studio-controls";
import LegoDither from "@/registry/lego-dither";

const DEFAULTS = {
  cellSize: 7,
  modelScale: 1.15,
  spinSpeed: 0.26,
  pointerRotation: 0.15,
  trailSize: 0.041,
  trailDecay: 0.08,
  distortion: 0.18,
};

export default function LegoDitherStudio() {
  const [settings, setSettings] = useState(DEFAULTS);
  const update = (name: keyof typeof DEFAULTS, value: number) =>
    setSettings((current) => ({ ...current, [name]: value }));

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-white xl:h-[760px]">
        <Link
          href="/components/lego-dither/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/75 text-black/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <LegoDither {...settings} />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="label">Studio</p>
            <h2 className="mt-1 text-sm text-foreground uppercase">
              Lego Dither
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSettings(DEFAULTS)}
            aria-label="Reset studio"
            title="Reset studio"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-3">
          <section className="grid content-start gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Stud size"
              value={settings.cellSize}
              onChange={(value) => update("cellSize", value)}
              min={4}
              max={14}
              step={1}
              formatValue={(value) => `${Math.round(value)}px`}
            />
            <SliderComfortable
              variant="scrubber"
              label="Hand scale"
              value={settings.modelScale}
              onChange={(value) => update("modelScale", value)}
              min={0.65}
              max={1.4}
              step={0.05}
              formatValue={(value) => `${value.toFixed(2)}x`}
            />
          </section>

          <section className="grid content-start gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Spin speed"
              value={settings.spinSpeed}
              onChange={(value) => update("spinSpeed", value)}
              min={0}
              max={0.8}
              step={0.01}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Pointer rotation"
              value={settings.pointerRotation}
              onChange={(value) => update("pointerRotation", value)}
              min={0}
              max={0.3}
              step={0.01}
              formatValue={(value) => value.toFixed(2)}
            />
          </section>

          <section className="grid content-start gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Trail width"
              value={settings.trailSize}
              onChange={(value) => update("trailSize", value)}
              min={0.02}
              max={0.08}
              step={0.005}
              formatValue={(value) => value.toFixed(3)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Colour gap"
              value={settings.trailDecay}
              onChange={(value) => update("trailDecay", value)}
              min={0.04}
              max={0.14}
              step={0.01}
              formatValue={(value) => `${Math.round(value * 1000)}ms`}
            />
            <SliderComfortable
              variant="scrubber"
              label="Scatter strength"
              value={settings.distortion}
              onChange={(value) => update("distortion", value)}
              min={0}
              max={0.32}
              step={0.005}
              formatValue={(value) => value.toFixed(3)}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { Maximize2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SliderComfortable } from "@/components/site/studio-controls";
import BlurStudyGrid from "@/registry/blur-study-grid";

// The source ships these as a Tweakpane panel inside the artwork. The
// component must not mount its own GUI, so the same folders, labels, ranges
// and steps are rebuilt here, outside the preview.
const DEFAULTS = {
  blur: 0.32,
  blurCurve: 3.55,
  blurDistance: 1.6,
  paneZ: 1.1,
  opacityFalloff: 1.6,
  volumeDensity: 4.5,
  ditherStrength: 1,
  rodLength: 2,
  rodRadius: 0.42,
  depthSpread: 0.5,
  trackingSpeed: 0.45,
};

export default function BlurStudyGridStudio() {
  const [settings, setSettings] = useState(DEFAULTS);
  const update = (name: keyof typeof DEFAULTS, value: number) =>
    setSettings((current) => ({ ...current, [name]: value }));

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg xl:h-[760px]">
        <Link
          href="/components/blur-study-grid/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/75 text-black/70 backdrop-blur transition-colors hover:bg-white hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <BlurStudyGrid className="h-full" settings={settings} />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
          <div>
            <p className="label">Studio</p>
            <h2 className="mt-1 text-sm text-foreground uppercase">
              Blur Study Grid
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
            <p className="label">Diffusion</p>
            <SliderComfortable
              variant="scrubber"
              label="Amount"
              value={settings.blur}
              onChange={(value) => update("blur", value)}
              min={0.02}
              max={0.6}
              step={0.01}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Ramp curve"
              value={settings.blurCurve}
              onChange={(value) => update("blurCurve", value)}
              min={0.35}
              max={4}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Ramp distance"
              value={settings.blurDistance}
              onChange={(value) => update("blurDistance", value)}
              min={0.25}
              max={4}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Pane Z"
              value={settings.paneZ}
              onChange={(value) => update("paneZ", value)}
              min={-3}
              max={4}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
          </section>

          <section className="grid content-start gap-4">
            <p className="label">Volume</p>
            <SliderComfortable
              variant="scrubber"
              label="Opacity falloff"
              value={settings.opacityFalloff}
              onChange={(value) => update("opacityFalloff", value)}
              min={0}
              max={4}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Volume density"
              value={settings.volumeDensity}
              onChange={(value) => update("volumeDensity", value)}
              min={1}
              max={10}
              step={0.1}
              formatValue={(value) => value.toFixed(1)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Dither"
              value={settings.ditherStrength}
              onChange={(value) => update("ditherStrength", value)}
              min={0}
              max={1}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
          </section>

          <section className="grid content-start gap-4">
            <p className="label">Capsules and motion</p>
            <SliderComfortable
              variant="scrubber"
              label="Length"
              value={settings.rodLength}
              onChange={(value) => update("rodLength", value)}
              min={2}
              max={6}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Radius"
              value={settings.rodRadius}
              onChange={(value) => update("rodRadius", value)}
              min={0.15}
              max={0.8}
              step={0.01}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Depth spread"
              value={settings.depthSpread}
              onChange={(value) => update("depthSpread", value)}
              min={0}
              max={3}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Tracking"
              value={settings.trackingSpeed}
              onChange={(value) => update("trackingSpeed", value)}
              min={0.05}
              max={2}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import CrtDisplay from "@/registry/crt-display";

const PROJECTS = [
  { label: "District", image: "/assets/crt-display/project-img-1.jpg" },
  { label: "Waypoint", image: "/assets/crt-display/project-img-2.jpg" },
  { label: "Corridor", image: "/assets/crt-display/project-img-3.jpg" },
  { label: "Archive", image: "/assets/crt-display/project-img-4.jpg" },
  { label: "Terminal", image: "/assets/crt-display/project-img-5.jpg" },
];

const PRESETS = [
  { id: "concrete", label: "Concrete", background: "#b0b0b0", exposure: 1.25 },
  { id: "void", label: "Void", background: "#0d0d0d", exposure: 1.45 },
  { id: "sun", label: "Sun", background: "#d8cdb6", exposure: 1.1 },
] as const;

type Preset = (typeof PRESETS)[number];

export default function CrtDisplayStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [background, setBackground] = useState<string>(preset.background);
  const [exposure, setExposure] = useState<number>(preset.exposure);

  function applyPreset(next: Preset) {
    setPreset(next);
    setBackground(next.background);
    setExposure(next.exposure);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-[#b0b0b0] xl:h-[760px]">
        <Link
          href="/components/crt-display/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/50 text-black/70 backdrop-blur transition-colors hover:bg-black/10 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <CrtDisplay
          src="/assets/crt-display/monitor.glb"
          defaultImage="/assets/crt-display/default.jpg"
          projects={PROJECTS}
          background={background}
          exposure={exposure}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                CRT Display
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(240px,1fr)_minmax(260px,1fr)]">
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
              label="Exposure"
              value={exposure}
              onChange={setExposure}
              min={0.6}
              max={2}
              step={0.05}
              formatValue={(v) => v.toFixed(2)}
            />
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Hover the project chips to load a frame onto the tube. Each swap
                spikes the glitch tear, then it decays back to a clean scan.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

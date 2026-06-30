"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import ImageReveal from "@/registry/image-reveal";

const IMAGES = [1, 2, 3, 4, 5].map((n) => `/assets/image-reveal/img-${n}.jpg`);

const PRESETS = [
  {
    id: "ember",
    label: "Ember",
    dissolveColor: "#ff6426",
    dissolveCellSize: 16,
  },
  {
    id: "acid",
    label: "Acid",
    dissolveColor: "#d3ef76",
    dissolveCellSize: 12,
  },
  {
    id: "ice",
    label: "Ice",
    dissolveColor: "#6ee7ff",
    dissolveCellSize: 22,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function ImageRevealStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [dissolveColor, setDissolveColor] = useState<string>(
    preset.dissolveColor,
  );
  const [dissolveCellSize, setDissolveCellSize] = useState<number>(
    preset.dissolveCellSize,
  );

  const studioKey = [dissolveColor, dissolveCellSize].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setDissolveColor(next.dissolveColor);
    setDissolveCellSize(next.dissolveCellSize);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[560px] w-full overflow-hidden rounded-t-lg">
        <Link
          href="/components/image-reveal/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-[200] flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <ImageReveal
          key={studioKey}
          images={IMAGES}
          dissolveColor={dissolveColor}
          dissolveCellSize={dissolveCellSize}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Image Reveal
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[1fr_1fr_1fr]">
          <StudioColor
            label="Dissolve color"
            value={dissolveColor}
            onChange={setDissolveColor}
          />

          <SliderComfortable
            variant="scrubber"
            label="Cell size"
            value={dissolveCellSize}
            onChange={setDissolveCellSize}
            min={8}
            max={28}
            step={2}
            formatValue={(v) => `${v}px`}
          />

          <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              The band is densest at its core and scatters at the edges, so
              smaller cells read as fine static and larger ones as chunky
              teletext. Scroll inside the frame to drive it.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

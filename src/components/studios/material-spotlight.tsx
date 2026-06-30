"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MaterialSpotlight from "@/registry/material-spotlight";

const MODEL = "/assets/material-spotlight/model.glb";

const PRESETS = [
  {
    id: "bone",
    label: "Bone",
    background: "#dddcd7",
    radius: 0.15,
    softness: 0.35,
  },
  {
    id: "slate",
    label: "Slate",
    background: "#1b1d22",
    radius: 0.22,
    softness: 0.5,
  },
  {
    id: "blush",
    label: "Blush",
    background: "#e7cdc4",
    radius: 0.1,
    softness: 0.22,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function MaterialSpotlightStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [background, setBackground] = useState<string>(preset.background);
  const [radius, setRadius] = useState<number>(preset.radius);
  const [softness, setSoftness] = useState<number>(preset.softness);

  const studioKey = [background, radius, softness].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setBackground(next.background);
    setRadius(next.radius);
    setSoftness(next.softness);
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-surface">
      <div className="relative h-[500px] w-full overflow-hidden xl:h-[540px]">
        <Link
          href="/components/material-spotlight/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/40 text-black/60 backdrop-blur transition-colors hover:bg-white/70 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <MaterialSpotlight
          key={studioKey}
          src={MODEL}
          background={background}
          radius={radius}
          softness={softness}
        />
      </div>

      <aside className="border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Material Spotlight
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
          <label className="flex flex-col gap-2">
            <span className="label">Background</span>
            <span className="flex h-10 items-center gap-2 rounded-md border bg-card px-2">
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="size-5 border-0 bg-transparent p-0"
                aria-label="Background color"
              />
              <span className="text-xs text-muted-foreground">
                {background}
              </span>
            </span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="label">Radius — {radius.toFixed(2)}</span>
            <input
              type="range"
              min={0.05}
              max={0.4}
              step={0.01}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="mt-3 w-full accent-foreground"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="label">Softness — {softness.toFixed(2)}</span>
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.01}
              value={softness}
              onChange={(e) => setSoftness(Number(e.target.value))}
              className="mt-3 w-full accent-foreground"
            />
          </label>
        </div>

        <div className="flex items-start gap-2 border-t p-4 text-xs leading-relaxed text-muted-foreground sm:p-5">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
          <p>
            The patch only touches roughness and diffuse inside a soft sphere
            around the cursor's hit on the model — radius sizes the wet spot,
            softness feathers its edge.
          </p>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MosaicFlip from "@/registry/mosaic-flip";

const IMAGES = [
  "default.jpg",
  "img1.jpg",
  "img2.jpg",
  "img3.jpg",
  "img4.jpg",
  "img5.jpg",
  "img6.jpg",
].map((f) => `/assets/mosaic-flip/${f}`);

const PRESETS = [
  {
    id: "default",
    label: "12 × 9",
    tilesX: 12,
    tilesY: 9,
    edgeColor: "#222222",
  },
  { id: "coarse", label: "8 × 6", tilesX: 8, tilesY: 6, edgeColor: "#1a1a1a" },
  {
    id: "fine",
    label: "16 × 12",
    tilesX: 16,
    tilesY: 12,
    edgeColor: "#2a2a2a",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function MosaicFlipStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [edgeColor, setEdgeColor] = useState<string>(preset.edgeColor);

  const tileSize = preset.id === "fine" ? 36 : preset.id === "coarse" ? 64 : 48;
  const studioKey = [preset.id, edgeColor].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setEdgeColor(next.edgeColor);
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-surface">
      <div className="relative h-[520px] w-full overflow-hidden bg-[#171717]">
        <Link
          href="/components/mosaic-flip/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 left-4 z-20 flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <MosaicFlip
          key={studioKey}
          images={IMAGES}
          tilesX={preset.tilesX}
          tilesY={preset.tilesY}
          tileSize={tileSize}
          edgeColor={edgeColor}
        />
      </div>

      <aside className="border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Mosaic Flip
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[1fr_2fr]">
          <label className="flex flex-col gap-2">
            <span className="label">Cube edge</span>
            <span className="flex h-10 items-center gap-2 rounded-md border bg-card px-2">
              <input
                type="color"
                value={edgeColor}
                onChange={(e) => setEdgeColor(e.target.value)}
                className="size-5 border-0 bg-transparent p-0"
                aria-label="Cube edge color"
              />
              <span className="text-xs text-muted-foreground">{edgeColor}</span>
            </span>
          </label>

          <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              Each cube shows a slice of the full image. A finer grid turns the
              flip into a shimmering wave; a coarser one reads as big plates
              turning over. The edge color is the cube's top and bottom.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

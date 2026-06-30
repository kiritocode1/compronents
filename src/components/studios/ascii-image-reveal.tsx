"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import AsciiImageReveal from "@/registry/ascii-image-reveal";

const IMAGES = Array.from(
  { length: 15 },
  (_, i) => `/assets/ascii-image-reveal/img${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "blank",
    label: "Blank",
    background: "#111111",
    canvasBackground: "#111111",
    glyphColor: "#c8c8c8",
    chars: "........:::=+xX#0369",
    columns: 25,
    scrambleCount: 10,
    gap: "1.35rem",
  },
  {
    id: "mineral",
    label: "Mineral",
    background: "#0d1210",
    canvasBackground: "#0d1210",
    glyphColor: "#d9ffcc",
    chars: "....:;+*%@",
    columns: 29,
    scrambleCount: 7,
    gap: "1rem",
  },
  {
    id: "proof",
    label: "Proof",
    background: "#f0eee4",
    canvasBackground: "#1b1a16",
    glyphColor: "#f0eee4",
    chars: "...:+=xX#0369",
    columns: 21,
    scrambleCount: 13,
    gap: "1.6rem",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function AsciiImageRevealStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [background, setBackground] = useState<string>(preset.background);
  const [canvasBackground, setCanvasBackground] = useState<string>(
    preset.canvasBackground,
  );
  const [glyphColor, setGlyphColor] = useState<string>(preset.glyphColor);
  const [chars, setChars] = useState<string>(preset.chars);
  const [columns, setColumns] = useState<number>(preset.columns);
  const [scrambleCount, setScrambleCount] = useState<number>(
    preset.scrambleCount,
  );
  const [gap, setGap] = useState<string>(preset.gap);

  const studioKey = [
    background,
    canvasBackground,
    glyphColor,
    chars,
    columns,
    scrambleCount,
    gap,
  ].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setBackground(next.background);
    setCanvasBackground(next.canvasBackground);
    setGlyphColor(next.glyphColor);
    setChars(next.chars);
    setColumns(next.columns);
    setScrambleCount(next.scrambleCount);
    setGap(next.gap);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-black xl:h-[760px]">
        <Link
          href="/components/ascii-image-reveal/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <AsciiImageReveal
          key={studioKey}
          images={IMAGES}
          background={background}
          canvasBackground={canvasBackground}
          glyphColor={glyphColor}
          chars={chars}
          columns={columns}
          scrambleCount={scrambleCount}
          gap={gap}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                ASCII Image Reveal
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(240px,1fr)_minmax(280px,1.1fr)_minmax(240px,1fr)]">
          <section className="grid content-start gap-3">
            <div className="grid grid-cols-3 gap-3">
              <StudioColor
                label="Glyph"
                value={glyphColor}
                onChange={setGlyphColor}
              />
              <StudioColor
                label="Canvas"
                value={canvasBackground}
                onChange={setCanvasBackground}
              />
              <StudioColor
                label="Back"
                value={background}
                onChange={setBackground}
              />
            </div>
            <label className="flex flex-col gap-2">
              <span className="label">Gap</span>
              <input
                value={gap}
                onChange={(event) => setGap(event.target.value)}
                className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
              />
            </label>
          </section>

          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-2">
              <span className="label">Glyph ramp</span>
              <input
                value={chars}
                onChange={(event) => setChars(event.target.value || ".")}
                className="h-10 rounded-md border bg-card px-3 font-mono text-sm outline-none transition-colors focus:border-border-strong"
              />
            </label>
            <div className="mt-3 flex flex-col gap-4">
              <SliderComfortable
                variant="scrubber"
                label="Columns"
                value={columns}
                onChange={setColumns}
                min={16}
                max={36}
                step={1}
              />
              <SliderComfortable
                variant="scrubber"
                label="Scramble"
                value={scrambleCount}
                onChange={setScrambleCount}
                min={1}
                max={18}
                step={1}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground lg:border-t-0 lg:pt-0">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              Columns decide how faithful the ASCII sampling feels. Scramble
              count only affects darker cells, so silhouettes stay noisy while
              highlights settle almost immediately.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

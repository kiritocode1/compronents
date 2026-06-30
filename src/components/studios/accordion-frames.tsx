"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AccordionFrames from "@/registry/accordion-frames";

const IMAGES = Array.from(
  { length: 20 },
  (_, i) => `/assets/accordion-frames/spotlight-${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "gallery",
    label: "Gallery",
    accentColor: "#ffffff",
    background: "#0f0f0f",
    expandedWidth: 400,
    focusIndicator: true,
  },
  {
    id: "filmstrip",
    label: "Filmstrip",
    accentColor: "#ff6426",
    background: "#141414",
    expandedWidth: 320,
    focusIndicator: true,
  },
  {
    id: "quiet",
    label: "Quiet",
    accentColor: "#d3ef76",
    background: "#0b0b0b",
    expandedWidth: 460,
    focusIndicator: false,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function AccordionFramesStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [accentColor, setAccentColor] = useState<string>(preset.accentColor);
  const [background, setBackground] = useState<string>(preset.background);
  const [expandedWidth, setExpandedWidth] = useState<number>(
    preset.expandedWidth,
  );
  const [focusIndicator, setFocusIndicator] = useState<boolean>(
    preset.focusIndicator,
  );

  const studioKey = [
    accentColor,
    background,
    expandedWidth,
    focusIndicator,
  ].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setAccentColor(next.accentColor);
    setBackground(next.background);
    setExpandedWidth(next.expandedWidth);
    setFocusIndicator(next.focusIndicator);
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-surface">
      <div className="relative h-[480px] w-full overflow-hidden xl:h-[520px]">
        <Link
          href="/components/accordion-frames/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-[200] flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <AccordionFrames
          key={studioKey}
          images={IMAGES}
          accentColor={accentColor}
          background={background}
          expandedWidth={expandedWidth}
          focusIndicator={focusIndicator}
          panelHeight={340}
        />
      </div>

      <aside className="border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Accordion Frames
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(240px,1fr)]">
          <section className="grid content-start gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2">
                <span className="label">Accent</span>
                <span className="flex h-10 items-center gap-2 rounded-md border bg-card px-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="size-5 border-0 bg-transparent p-0"
                    aria-label="Accent color"
                  />
                  <span className="text-xs text-muted-foreground">
                    {accentColor}
                  </span>
                </span>
              </label>
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
            </div>
          </section>

          <label className="flex flex-col gap-2">
            <span className="label">Open width — {expandedWidth}px</span>
            <input
              type="range"
              min={220}
              max={560}
              step={10}
              value={expandedWidth}
              onChange={(e) => setExpandedWidth(Number(e.target.value))}
              className="mt-3 w-full accent-foreground"
            />
            <label className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={focusIndicator}
                onChange={(e) => setFocusIndicator(e.target.checked)}
                className="size-4 accent-foreground"
              />
              Focus indicator + beams
            </label>
          </label>

          <div className="flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground lg:border-t-0 lg:pt-0">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              Hover (or tap) a slat to open it. The strip stays centered as a
              set — the focused frame widens in place while the others compress,
              and the indicator beams track wherever it lands.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

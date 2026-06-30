"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import InversaScroll, { type InversaMarker } from "@/registry/inversa-scroll";

const BASE = "/assets/inversa-scroll";

const PRESETS = [
  {
    id: "field",
    label: "Field",
    accent1: "#dc5935",
    accent2: "#d3ef76",
    dark: "#141414",
  },
  {
    id: "tactical",
    label: "Tactical",
    accent1: "#46e0b0",
    accent2: "#ff5c7a",
    dark: "#0a0f0d",
  },
  {
    id: "signal",
    label: "Signal",
    accent1: "#ffd24a",
    accent2: "#6ea8ff",
    dark: "#0c0a14",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function InversaScrollStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [accent1, setAccent1] = useState<string>(preset.accent1);
  const [accent2, setAccent2] = useState<string>(preset.accent2);
  const [dark, setDark] = useState<string>(preset.dark);

  const markers: [InversaMarker, InversaMarker] = [
    { label: "Anchor Field", color: accent1, top: "50%", left: "50%" },
    { label: "Drift Field", color: accent2, top: "35%", left: "60%" },
  ];
  const studioKey = [accent1, accent2, dark].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setAccent1(next.accent1);
    setAccent2(next.accent2);
    setDark(next.dark);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[560px] w-full overflow-hidden rounded-t-lg">
        <Link
          href="/components/inversa-scroll/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 left-4 z-[200] flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <InversaScroll
          key={studioKey}
          heroImage={`${BASE}/hero-img.jpg`}
          maskImage={`${BASE}/mask.svg`}
          gridImage={`${BASE}/grid-overlay.svg`}
          markers={markers}
          dark={dark}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Inversa Scroll
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[2fr_1.4fr]">
          <section className="grid grid-cols-3 gap-3">
            <StudioColor
              label="Marker 1"
              value={accent1}
              onChange={setAccent1}
            />
            <StudioColor
              label="Marker 2"
              value={accent2}
              onChange={setAccent2}
            />
            <StudioColor label="Backdrop" value={dark} onChange={setDark} />
          </section>

          <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              Every phase is keyed to a slice of one pinned scroll — the window
              closes around the halfway point, holds at greyscale, then
              re-opens. Scroll inside the frame to drive it.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

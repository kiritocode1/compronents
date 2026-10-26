"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import CellPortrait from "@/registry/cell-portrait";

const PRESETS = [
  {
    id: "reference",
    label: "Reference",
    background: "#2253E9",
    stroke: "#FFFFFF",
    cellFrom: 36,
    cellTo: 7,
    speed: 1,
  },
  {
    id: "night",
    label: "Night",
    background: "#0B0B0F",
    stroke: "#EDEDED",
    cellFrom: 36,
    cellTo: 7,
    speed: 1,
  },
  {
    id: "paper",
    label: "Paper",
    background: "#EFEDE6",
    stroke: "#151515",
    cellFrom: 30,
    cellTo: 8,
    speed: 0.8,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function CellPortraitStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [background, setBackground] = useState<string>(preset.background);
  const [stroke, setStroke] = useState<string>(preset.stroke);
  const [cellFrom, setCellFrom] = useState<number>(preset.cellFrom);
  const [cellTo, setCellTo] = useState<number>(preset.cellTo);
  const [speed, setSpeed] = useState<number>(preset.speed);

  function applyPreset(next: Preset) {
    setPreset(next);
    setBackground(next.background);
    setStroke(next.stroke);
    setCellFrom(next.cellFrom);
    setCellTo(next.cellTo);
    setSpeed(next.speed);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg xl:h-[760px]">
        <Link
          href="/components/cell-portrait/preview"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-20 flex h-9 items-center rounded-md border border-white/15 bg-black/40 px-3 text-[0.68rem] text-white/70 uppercase backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          Fullscreen
        </Link>
        <CellPortrait
          src="/assets/cell-portrait/miku.webp"
          alt="Illustration of Hatsune Miku drawn as joined circles"
          background={background}
          stroke={stroke}
          cellFrom={cellFrom}
          cellTo={cellTo}
          cellDetail={Math.min(5, cellTo)}
          speed={speed}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Cell Portrait
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
            <div className="grid grid-cols-2 gap-3">
              <StudioColor
                label="Back"
                value={background}
                onChange={setBackground}
              />
              <StudioColor label="Stroke" value={stroke} onChange={setStroke} />
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <SliderComfortable
              variant="scrubber"
              label="Coarsest cell"
              value={cellFrom}
              onChange={setCellFrom}
              min={16}
              max={48}
              step={1}
            />
            <SliderComfortable
              variant="scrubber"
              label="Finest cell"
              value={cellTo}
              onChange={setCellTo}
              min={5}
              max={12}
              step={1}
            />
            <SliderComfortable
              variant="scrubber"
              label="Speed"
              value={speed}
              onChange={setSpeed}
              min={0.25}
              max={2}
              step={0.05}
            />
          </div>

          <div className="flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground lg:border-t-0 lg:pt-0">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              Cell sizes are measured on a 540px frame and scale with the
              component. Dark areas hold the most circles; near-white areas such
              as eye highlights stay empty, which is what lets a face read
              before any color arrives.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

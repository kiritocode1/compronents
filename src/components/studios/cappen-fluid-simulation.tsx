"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CappenFluidSimulation from "@/registry/cappen-fluid-simulation";

const PRESETS = [
  {
    id: "vortex",
    label: "Vortex",
    headline: ["Fluid System In", "Constant Field", "Of Interaction"],
    background: "#ffffff",
    textColor: "#000000",
    inkColor: "#ffffff",
    curl: 50,
    forceStrength: 8.5,
  },
  {
    id: "carbon",
    label: "Carbon",
    headline: ["Black Water", "Under A", "White Lamp"],
    background: "#0c0c0c",
    textColor: "#eeeeee",
    inkColor: "#f2f2f2",
    curl: 68,
    forceStrength: 10,
  },
  {
    id: "signal",
    label: "Signal",
    headline: ["Signal Field", "In Soft", "Collision"],
    background: "#f4f0de",
    textColor: "#17150f",
    inkColor: "#f26a2e",
    curl: 36,
    forceStrength: 7,
  },
] as const;

type Preset = (typeof PRESETS)[number];
const HEADLINE_FIELDS = ["first", "second", "third"];

export default function CappenFluidSimulationStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [headline, setHeadline] = useState<string[]>([...preset.headline]);
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [inkColor, setInkColor] = useState<string>(preset.inkColor);
  const [curl, setCurl] = useState<number>(preset.curl);
  const [forceStrength, setForceStrength] = useState<number>(
    preset.forceStrength,
  );

  const studioKey = [
    headline.join("/"),
    background,
    textColor,
    inkColor,
    curl,
    forceStrength,
  ].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setHeadline([...next.headline]);
    setBackground(next.background);
    setTextColor(next.textColor);
    setInkColor(next.inkColor);
    setCurl(next.curl);
    setForceStrength(next.forceStrength);
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden bg-white xl:h-[760px]">
        <Link
          href="/components/cappen-fluid-simulation/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/40 text-black/70 backdrop-blur transition-colors hover:bg-black/10 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <CappenFluidSimulation
          key={studioKey}
          headline={headline}
          background={background}
          textColor={textColor}
          inkColor={inkColor}
          curl={curl}
          forceStrength={forceStrength}
        />
      </div>

      <aside className="border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Cappen Fluid Simulation
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(260px,1fr)_minmax(260px,1fr)_minmax(260px,1fr)]">
          <section className="grid content-start gap-3">
            {headline.map((line, index) => (
              <label
                className="flex flex-col gap-2"
                key={HEADLINE_FIELDS[index]}
              >
                <span className="label">Line {index + 1}</span>
                <input
                  value={line}
                  onChange={(event) => {
                    const next = [...headline];
                    next[index] = event.target.value;
                    setHeadline(next);
                  }}
                  className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
                />
              </label>
            ))}
          </section>

          <section className="grid content-start gap-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Ink", inkColor, setInkColor],
                ["Text", textColor, setTextColor],
                ["Back", background, setBackground],
              ].map(([label, value, setter]) => (
                <label className="flex flex-col gap-2" key={label as string}>
                  <span className="label">{label as string}</span>
                  <span className="flex h-10 items-center rounded-md border bg-card px-2">
                    <input
                      type="color"
                      value={value as string}
                      onChange={(event) =>
                        (setter as (value: string) => void)(event.target.value)
                      }
                      className="size-5 border-0 bg-transparent p-0"
                      aria-label={`${label as string} color`}
                    />
                  </span>
                </label>
              ))}
            </div>
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="label">Curl - {curl}</span>
              <input
                type="range"
                min={0}
                max={90}
                value={curl}
                onChange={(event) => setCurl(Number(event.target.value))}
                className="w-full accent-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="label">Force - {forceStrength}</span>
              <input
                type="range"
                min={2}
                max={14}
                step={0.5}
                value={forceStrength}
                onChange={(event) =>
                  setForceStrength(Number(event.target.value))
                }
                className="w-full accent-foreground"
              />
            </label>
          </section>

          <div className="flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground lg:border-t-0 lg:pt-0">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              The solver is live WebGL, so changing curl or force rebuilds the
              simulation. Move across the stage to inject velocity; idle splats
              keep the ink breathing when the pointer rests.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

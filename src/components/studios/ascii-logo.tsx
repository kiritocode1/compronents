"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  SliderComfortable,
  StudioColor,
} from "@/components/site/studio-controls";
import AsciiLogo from "@/registry/ascii-logo";

const LOGO = "/assets/ascii-logo/logo.png";

const PRESETS = [
  {
    id: "graphite",
    label: "Graphite",
    background: "#0f0f0f",
    gridColor: "#171717",
    charColor: "#dadada",
    chars: ".:+*#%@0369",
    pushForce: 30,
  },
  {
    id: "ember",
    label: "Ember",
    background: "#120a06",
    gridColor: "#2a1408",
    charColor: "#ff7a2f",
    chars: ".:=+x#0369",
    pushForce: 42,
  },
  {
    id: "terminal",
    label: "Terminal",
    background: "#04140c",
    gridColor: "#0c241a",
    charColor: "#5cf0a8",
    chars: "01:+*#%@",
    pushForce: 22,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function AsciiLogoStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [background, setBackground] = useState<string>(preset.background);
  const [gridColor, setGridColor] = useState<string>(preset.gridColor);
  const [charColor, setCharColor] = useState<string>(preset.charColor);
  const [chars, setChars] = useState<string>(preset.chars);
  const [pushForce, setPushForce] = useState<number>(preset.pushForce);

  const studioKey = [background, gridColor, charColor, chars, pushForce].join(
    "|",
  );

  function applyPreset(next: Preset) {
    setPreset(next);
    setBackground(next.background);
    setGridColor(next.gridColor);
    setCharColor(next.charColor);
    setChars(next.chars);
    setPushForce(next.pushForce);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[480px] w-full overflow-hidden rounded-t-lg xl:h-[520px]">
        <Link
          href="/components/ascii-logo/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <AsciiLogo
          key={studioKey}
          src={LOGO}
          background={background}
          gridColor={gridColor}
          charColor={charColor}
          chars={chars}
          pushForce={pushForce}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                ASCII Logo
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
            <div className="grid grid-cols-3 gap-3">
              <StudioColor
                label="Glyph"
                value={charColor}
                onChange={setCharColor}
              />
              <StudioColor
                label="Grid"
                value={gridColor}
                onChange={setGridColor}
              />
              <StudioColor
                label="Back"
                value={background}
                onChange={setBackground}
              />
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="label">Glyph ramp</span>
              <input
                value={chars}
                onChange={(e) => setChars(e.target.value || ".")}
                className="h-10 rounded-md border bg-card px-3 font-mono text-sm outline-none transition-colors focus:border-border-strong"
              />
            </label>
            <SliderComfortable
              variant="scrubber"
              label="Push force"
              value={pushForce}
              onChange={setPushForce}
              min={0}
              max={60}
              step={2}
            />
          </div>

          <div className="flex items-start gap-2 border-t pt-4 text-xs leading-relaxed text-muted-foreground lg:border-t-0 lg:pt-0">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              The ramp maps brightness to characters — denser glyphs read as
              brighter pixels. Push force decides how violently the cursor
              scatters the wordmark before it springs back.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

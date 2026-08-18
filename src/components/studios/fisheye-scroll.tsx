"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import { SliderComfortable } from "@/components/ui/slider";
import FisheyeScroll from "@/registry/fisheye-scroll";

const PORTRAIT = "/assets/fisheye-scroll/portrait.png";

const PRESETS = [
  {
    id: "giants",
    label: "Giants",
    text: "GIANTS",
    background: "#e83210",
    textColor: "#f1cbb6",
    effect: "behind" as const,
  },
  {
    id: "night",
    label: "Night",
    text: "AFTER",
    background: "#10141c",
    textColor: "#e8e2d6",
    effect: "behind" as const,
  },
  {
    id: "acid",
    label: "Acid",
    text: "HOLD",
    background: "#c8f04a",
    textColor: "#141414",
    effect: "forward" as const,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function FisheyeScrollStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [text, setText] = useState<string>(preset.text);
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [effect, setEffect] = useState<"behind" | "forward" | "both">(
    preset.effect,
  );
  const [intensity, setIntensity] = useState(1);
  const [zoom, setZoom] = useState(1);

  function applyPreset(next: Preset) {
    setPreset(next);
    setText(next.text);
    setBackground(next.background);
    setTextColor(next.textColor);
    setEffect(next.effect);
    setIntensity(1);
    setZoom(1);
  }

  const studioKey = [text, background, textColor, effect, intensity, zoom].join(
    "|",
  );

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[560px] w-full overflow-hidden rounded-t-lg xl:h-[640px]">
        <Link
          href="/components/fisheye-scroll/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 left-4 z-[200] flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <FisheyeScroll
          key={studioKey}
          portraitSrc={PORTRAIT}
          text={text}
          background={background}
          textColor={textColor}
          effect={effect}
          intensity={intensity}
          zoom={zoom}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Fisheye Scroll
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[1.4fr_1fr_1fr]">
          <label className="flex flex-col gap-2">
            <span className="label">Word</span>
            <input
              value={text}
              onChange={(event) => setText(event.target.value.toUpperCase())}
              className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
            />
            <div className="mt-1 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Scroll slides the mid-band word left to right. Behind pinches
                the middle under the figure so the sides grow. Forward is the
                same strip over the person, enlarged from the centre.
              </p>
            </div>
          </label>

          <section className="grid grid-cols-2 content-start gap-3">
            <StudioColor
              label="Back"
              value={background}
              onChange={setBackground}
            />
            <StudioColor
              label="Type"
              value={textColor}
              onChange={setTextColor}
            />
          </section>

          <section className="grid content-start gap-4">
            <div className="grid grid-cols-3 gap-1 rounded-md border bg-card p-1">
              <button
                type="button"
                onClick={() => setEffect("behind")}
                className={`flex min-h-9 items-center justify-center rounded px-2 text-[0.68rem] uppercase transition-colors ${
                  effect === "behind"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Behind
              </button>
              <button
                type="button"
                onClick={() => setEffect("both")}
                className={`flex min-h-9 items-center justify-center rounded px-2 text-[0.68rem] uppercase transition-colors ${
                  effect === "both"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Both
              </button>
              <button
                type="button"
                onClick={() => setEffect("forward")}
                className={`flex min-h-9 items-center justify-center rounded px-2 text-[0.68rem] uppercase transition-colors ${
                  effect === "forward"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Forward
              </button>
            </div>
            <SliderComfortable
              variant="scrubber"
              label="Lens"
              value={intensity}
              onChange={setIntensity}
              min={0.2}
              max={1.8}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
            <SliderComfortable
              variant="scrubber"
              label="Zoom"
              value={zoom}
              onChange={setZoom}
              min={0.45}
              max={1.35}
              step={0.05}
              formatValue={(value) => value.toFixed(2)}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}

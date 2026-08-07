"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import { SliderComfortable } from "@/components/ui/slider";
import Sunlit from "@/registry/sunlit";

const LEAVES = "/assets/sunlit/leaves.png";

const PRESETS = [
  {
    id: "paper",
    label: "Paper",
    dayColor: "#fffdfa",
    nightColor: "#0f131c",
    bounceLightDay: "#f5d7a6",
    bounceLightNight: "#1b293f",
    shutterCount: 23,
    dark: false,
  },
  {
    id: "dusk",
    label: "Dusk",
    dayColor: "#f6e8d4",
    nightColor: "#14101c",
    bounceLightDay: "#e8b46a",
    bounceLightNight: "#2a1f3d",
    shutterCount: 18,
    dark: true,
  },
  {
    id: "coast",
    label: "Coast",
    dayColor: "#f3f7f8",
    nightColor: "#0c1418",
    bounceLightDay: "#c9dde6",
    bounceLightNight: "#17303a",
    shutterCount: 20,
    dark: false,
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function SunlitStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [dayColor, setDayColor] = useState<string>(preset.dayColor);
  const [nightColor, setNightColor] = useState<string>(preset.nightColor);
  const [bounceLightDay, setBounceLightDay] = useState<string>(
    preset.bounceLightDay,
  );
  const [bounceLightNight, setBounceLightNight] = useState<string>(
    preset.bounceLightNight,
  );
  const [shutterCount, setShutterCount] = useState<number>(preset.shutterCount);
  const [dark, setDark] = useState<boolean>(preset.dark);

  function applyPreset(next: Preset) {
    setPreset(next);
    setDayColor(next.dayColor);
    setNightColor(next.nightColor);
    setBounceLightDay(next.bounceLightDay);
    setBounceLightNight(next.bounceLightNight);
    setShutterCount(next.shutterCount);
    setDark(next.dark);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg xl:h-[760px]">
        <Link
          href="/components/sunlit/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-black/15 bg-white/50 text-black/70 backdrop-blur transition-colors hover:bg-black/10 hover:text-black"
        >
          <Maximize2 className="size-4" />
        </Link>
        <Sunlit
          dark={dark}
          onDarkChange={setDark}
          leavesSrc={LEAVES}
          dayColor={dayColor}
          nightColor={nightColor}
          bounceLightDay={bounceLightDay}
          bounceLightNight={bounceLightNight}
          shutterCount={shutterCount}
        >
          <div className="flex h-full flex-col justify-between p-8 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <span className="font-serif text-2xl tracking-tight">BLANK</span>
              <button
                type="button"
                data-sunlit-interactive
                onClick={(event) => {
                  event.stopPropagation();
                  setDark((value) => !value);
                }}
                className="rounded-full border border-current/20 px-3 py-1.5 text-[0.65rem] tracking-[0.14em] uppercase opacity-80 transition-opacity hover:opacity-100"
              >
                {dark ? "Night" : "Day"}
              </button>
            </div>
            <div className="max-w-md space-y-3">
              <p className="text-[0.68rem] tracking-[0.14em] uppercase opacity-60">
                Sunlit studio
              </p>
              <h2 className="font-serif text-3xl leading-tight tracking-tight md:text-4xl">
                {dark
                  ? "Moonlight pooling under the sill"
                  : "Soft morning light across the room"}
              </h2>
              <p className="text-sm leading-relaxed opacity-70">
                Click the scene to run sunrise or sunset. Shutters tighten at
                night and the leaf plane tips with the new light angle.
              </p>
            </div>
          </div>
        </Sunlit>
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">Sunlit</h2>
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(280px,1fr)_minmax(240px,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="label">Time of day</span>
              <button
                type="button"
                onClick={() => setDark((value) => !value)}
                className={`rounded-md border px-3 py-1.5 text-[0.68rem] uppercase tracking-wide transition-colors ${
                  dark
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {dark ? "Night" : "Day"}
              </button>
            </div>
            <SliderComfortable
              label="Shutters"
              min={8}
              max={32}
              step={1}
              value={shutterCount}
              onChange={setShutterCount}
            />
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                Progressive blur layers keep the near wall sharp and the far
                canopy soft. Night closes the shutters and tips the light plane
                with a derived matrix3d transform.
              </p>
            </div>
          </div>

          <section className="grid grid-cols-2 content-start gap-3">
            <StudioColor label="Day" value={dayColor} onChange={setDayColor} />
            <StudioColor
              label="Night"
              value={nightColor}
              onChange={setNightColor}
            />
            <StudioColor
              label="Bounce day"
              value={bounceLightDay}
              onChange={setBounceLightDay}
            />
            <StudioColor
              label="Bounce night"
              value={bounceLightNight}
              onChange={setBounceLightNight}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import PreloaderReveal from "@/registry/preloader-reveal";

const LOGO = "/assets/preloader-reveal/logo.png";
const BUTTON_LOGO = "/assets/preloader-reveal/logo-light.png";

const PRESETS = [
  {
    id: "mono",
    label: "Mono",
    heading: "The system is now visible",
    engageLabel: "Engage",
    grantedLabel: "Access Granted",
    dark: "#000000",
    light: "#ffffff",
    muted: "#7a7a7a",
  },
  {
    id: "amber",
    label: "Amber",
    heading: "Signal locked and holding",
    engageLabel: "Initiate",
    grantedLabel: "Channel Open",
    dark: "#1a1206",
    light: "#ffb347",
    muted: "#8a6a32",
  },
  {
    id: "paper",
    label: "Paper",
    heading: "Layer zero has resolved",
    engageLabel: "Reveal",
    grantedLabel: "Pattern Aligned",
    dark: "#16140f",
    light: "#f3ede1",
    muted: "#8c8576",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function PreloaderRevealStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [heading, setHeading] = useState<string>(preset.heading);
  const [engageLabel, setEngageLabel] = useState<string>(preset.engageLabel);
  const [grantedLabel, setGrantedLabel] = useState<string>(preset.grantedLabel);
  const [dark, setDark] = useState<string>(preset.dark);
  const [light, setLight] = useState<string>(preset.light);
  const [muted, setMuted] = useState<string>(preset.muted);

  function applyPreset(next: Preset) {
    setPreset(next);
    setHeading(next.heading);
    setEngageLabel(next.engageLabel);
    setGrantedLabel(next.grantedLabel);
    setDark(next.dark);
    setLight(next.light);
    setMuted(next.muted);
  }

  return (
    <div className="flex w-full flex-col rounded-lg border bg-surface">
      <div className="relative h-[680px] w-full overflow-hidden rounded-t-lg bg-black xl:h-[760px]">
        <Link
          href="/components/preloader-reveal/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 right-4 z-30 flex size-9 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white/70 backdrop-blur transition-colors hover:bg-white/20 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <PreloaderReveal
          logo={LOGO}
          buttonLogo={BUTTON_LOGO}
          heading={heading}
          engageLabel={engageLabel}
          grantedLabel={grantedLabel}
          dark={dark}
          light={light}
          muted={muted}
        />
      </div>

      <aside className="rounded-b-lg border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Preloader Reveal
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[minmax(260px,1fr)_minmax(240px,1fr)_minmax(260px,1fr)]">
          <label className="flex flex-col gap-2">
            <span className="label">Hero heading</span>
            <input
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
              className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
            />
          </label>

          <section className="grid content-start gap-3">
            <div className="grid grid-cols-3 gap-3">
              <StudioColor label="Dark" value={dark} onChange={setDark} />
              <StudioColor label="Light" value={light} onChange={setLight} />
              <StudioColor label="Muted" value={muted} onChange={setMuted} />
            </div>
          </section>

          <section className="grid content-start gap-4">
            <label className="flex flex-col gap-2">
              <span className="label">Engage label</span>
              <input
                value={engageLabel}
                onChange={(event) => setEngageLabel(event.target.value)}
                className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="label">Granted label</span>
              <input
                value={grantedLabel}
                onChange={(event) => setGrantedLabel(event.target.value)}
                className="h-10 rounded-md border bg-card px-3 text-sm outline-none transition-colors focus:border-border-strong"
              />
            </label>
            <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
              <p>
                The sequence runs on a loop here. Dark drives the preloader and
                hero, light is the ring and ink, muted tints the backdrop notes.
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

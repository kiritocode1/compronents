"use client";

import { Maximize2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AwardList, { type Award } from "@/registry/award-list";

const BASE = "/assets/award-list";
const RAW = [
  {
    name: "Independent of the year",
    type: "Nominee",
    project: "INNOVATE 2024",
    label: "Awwwards",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "LVXH — AMOT",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Open Field Audio",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "ArtisanCraft",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Disguised Edge",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "Silvia Santiago",
    label: "See Live",
  },
  {
    name: "Site of the day",
    type: "Awwwards",
    project: "2023 Showcase",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "Harmonic Pitch",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "Shadowline",
    label: "See Live",
  },
  {
    name: "Developer Award",
    type: "Awwwards",
    project: "Verse 21",
    label: "See Live",
  },
];
const AWARDS: Award[] = RAW.map((a, i) => ({
  ...a,
  image: `${BASE}/img${i + 1}.jpg`,
}));

const PRESETS = [
  {
    id: "paper",
    label: "Paper",
    nameBackground: "#e3e3db",
    nameColor: "#000000",
    projectBackground: "#000000",
    projectColor: "#e3e3db",
  },
  {
    id: "noir",
    label: "Noir",
    nameBackground: "#0f0f0f",
    nameColor: "#f3f3f3",
    projectBackground: "#ff6a00",
    projectColor: "#0f0f0f",
  },
  {
    id: "blueprint",
    label: "Blueprint",
    nameBackground: "#0b1c3a",
    nameColor: "#cfe0ff",
    projectBackground: "#cfe0ff",
    projectColor: "#0b1c3a",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function AwardListStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [nameBackground, setNameBackground] = useState<string>(
    preset.nameBackground,
  );
  const [nameColor, setNameColor] = useState<string>(preset.nameColor);
  const [projectBackground, setProjectBackground] = useState<string>(
    preset.projectBackground,
  );
  const [projectColor, setProjectColor] = useState<string>(preset.projectColor);

  const studioKey = [
    nameBackground,
    nameColor,
    projectBackground,
    projectColor,
  ].join("|");

  function applyPreset(next: Preset) {
    setPreset(next);
    setNameBackground(next.nameBackground);
    setNameColor(next.nameColor);
    setProjectBackground(next.projectBackground);
    setProjectColor(next.projectColor);
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-lg border bg-surface">
      <div className="relative h-[540px] w-full overflow-hidden">
        <Link
          href="/components/award-list/preview"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="absolute top-4 left-4 z-[200] flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <Maximize2 className="size-4" />
        </Link>
        <AwardList
          key={studioKey}
          awards={AWARDS}
          nameBackground={nameBackground}
          nameColor={nameColor}
          projectBackground={projectBackground}
          projectColor={projectColor}
        />
      </div>

      <aside className="border-t bg-background">
        <div className="flex flex-col gap-5 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-56">
            <div>
              <p className="label">Studio</p>
              <h2 className="mt-1 text-sm text-foreground uppercase">
                Award List
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

        <div className="grid gap-x-5 gap-y-6 border-t p-4 sm:p-5 lg:grid-cols-[3fr_1.4fr]">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Name bg", nameBackground, setNameBackground],
              ["Name ink", nameColor, setNameColor],
              ["Proj bg", projectBackground, setProjectBackground],
              ["Proj ink", projectColor, setProjectColor],
            ].map(([labelText, value, setter]) => (
              <label key={labelText as string} className="flex flex-col gap-2">
                <span className="label">{labelText as string}</span>
                <span className="flex h-10 items-center gap-2 rounded-md border bg-card px-2">
                  <input
                    type="color"
                    value={value as string}
                    onChange={(e) =>
                      (setter as (v: string) => void)(e.target.value)
                    }
                    className="size-5 border-0 bg-transparent p-0"
                    aria-label={labelText as string}
                  />
                </span>
              </label>
            ))}
          </section>

          <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-accent-soft" />
            <p>
              The project band is the inverse of the name row, so high contrast
              between the two pairs makes the shutter snap read sharper.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

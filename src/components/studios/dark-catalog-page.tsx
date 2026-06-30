"use client";

import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import {
  FullPageStudioShell,
  StudioTextarea,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import DarkCatalogPage from "@/registry/dark-catalog-page";

const BASE = "/assets/dark-catalog-page";
const FEATURED = Array.from(
  { length: 4 },
  (_, i) => `${BASE}/featured-${i + 1}.jpg`,
);
const CATALOG = Array.from(
  { length: 4 },
  (_, i) => `${BASE}/catalog-${i + 1}.jpg`,
);
const TEAM = Array.from({ length: 5 }, (_, i) => `${BASE}/team-${i + 1}.jpg`);

const PRESETS = [
  {
    id: "signal",
    label: "Signal",
    title: "BLANK LOCK",
    background: "#050507",
    textColor: "#e9e5d7",
    mutedColor: "#807a70",
    accentColor: "#ddff39",
  },
  {
    id: "hazard",
    label: "Hazard",
    title: "BLANK GRID",
    background: "#090706",
    textColor: "#f2e7dc",
    mutedColor: "#8d7b6f",
    accentColor: "#ff6a2f",
  },
  {
    id: "cyan",
    label: "Cyan",
    title: "BLANK NODE",
    background: "#05090c",
    textColor: "#edf9ff",
    mutedColor: "#718796",
    accentColor: "#55e6ff",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function DarkCatalogPageStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [title, setTitle] = useState<string>(preset.title);
  const [manifesto, setManifesto] = useState(
    "We build digital worlds rooted in tension, silence, and consequence. The player is never fully in control and the environment is never fully understood.",
  );
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [mutedColor, setMutedColor] = useState<string>(preset.mutedColor);
  const [accentColor, setAccentColor] = useState<string>(preset.accentColor);

  function applyPreset(id: string) {
    const next = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
    setPreset(next);
    setTitle(next.title);
    setBackground(next.background);
    setTextColor(next.textColor);
    setMutedColor(next.mutedColor);
    setAccentColor(next.accentColor);
  }

  return (
    <FullPageStudioShell
      name="dark-catalog-page"
      title="Dark Catalog Page"
      presets={PRESETS}
      activePreset={preset.id}
      onPreset={applyPreset}
      onReset={() => applyPreset(PRESETS[0].id)}
      controls={
        <>
          <StudioTextField label="Title" value={title} onChange={setTitle} />
          <StudioTextarea
            label="Manifesto"
            value={manifesto}
            onChange={setManifesto}
          />
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StudioColor
              label="Back"
              value={background}
              onChange={setBackground}
            />
            <StudioColor
              label="Text"
              value={textColor}
              onChange={setTextColor}
            />
            <StudioColor
              label="Muted"
              value={mutedColor}
              onChange={setMutedColor}
            />
            <StudioColor
              label="Accent"
              value={accentColor}
              onChange={setAccentColor}
            />
          </section>
        </>
      }
      note={
        <p>
          The dark catalog page is tuned for high contrast product worlds. The
          wordmark, project tiles, release catalog, and team portraits all come
          from Blob so the installable page does not ship binary assets.
        </p>
      }
    >
      <DarkCatalogPage
        title={title}
        manifesto={manifesto}
        logoImage={`${BASE}/wordmark.png`}
        featuredImages={FEATURED}
        catalogImages={CATALOG}
        teamImages={TEAM}
        background={background}
        textColor={textColor}
        mutedColor={mutedColor}
        accentColor={accentColor}
      />
    </FullPageStudioShell>
  );
}

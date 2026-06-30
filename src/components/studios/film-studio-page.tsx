"use client";

import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import {
  FullPageStudioShell,
  StudioTextarea,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import FilmStudioPage from "@/registry/film-studio-page";

const BASE = "/assets/film-studio-page";
const SPOTLIGHT = Array.from(
  { length: 8 },
  (_, i) => `${BASE}/spotlight-${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "negative",
    label: "Negative",
    headline: "Films forged on shadow, silence, and geometry.",
    background: "#050505",
    textColor: "#f1efe6",
    mutedColor: "#8e8a80",
    accentColor: "#d7ff2f",
  },
  {
    id: "oxide",
    label: "Oxide",
    headline: "Images built from pressure, grain, and restraint.",
    background: "#0b0908",
    textColor: "#f4e7db",
    mutedColor: "#a08f81",
    accentColor: "#ff5c35",
  },
  {
    id: "silver",
    label: "Silver",
    headline: "A production page with cold light and durable form.",
    background: "#111315",
    textColor: "#edf0f0",
    mutedColor: "#899196",
    accentColor: "#b7d6ff",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function FilmStudioPageStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [headline, setHeadline] = useState<string>(preset.headline);
  const [manifesto, setManifesto] = useState(
    "We approach cinema as a construction of form and weight. Each frame is laid like concrete, measured and precise.",
  );
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [mutedColor, setMutedColor] = useState<string>(preset.mutedColor);
  const [accentColor, setAccentColor] = useState<string>(preset.accentColor);

  function applyPreset(id: string) {
    const next = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
    setPreset(next);
    setHeadline(next.headline);
    setBackground(next.background);
    setTextColor(next.textColor);
    setMutedColor(next.mutedColor);
    setAccentColor(next.accentColor);
  }

  return (
    <FullPageStudioShell
      name="film-studio-page"
      title="Film Studio Page"
      presets={PRESETS}
      activePreset={preset.id}
      onPreset={applyPreset}
      onReset={() => applyPreset(PRESETS[0].id)}
      controls={
        <>
          <StudioTextField
            label="Headline"
            value={headline}
            onChange={setHeadline}
          />
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
          The hero is a Blob-hosted MP4 with a stark editorial stack below it.
          Keep the video muted and looped for installable page use, then tune
          the text and accent color for the target production house.
        </p>
      }
    >
      <FilmStudioPage
        headline={headline}
        manifesto={manifesto}
        videoSrc={`${BASE}/hero.mp4`}
        bannerImage={`${BASE}/banner.jpg`}
        spotlightImages={SPOTLIGHT}
        background={background}
        textColor={textColor}
        mutedColor={mutedColor}
        accentColor={accentColor}
      />
    </FullPageStudioShell>
  );
}

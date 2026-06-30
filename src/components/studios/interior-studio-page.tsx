"use client";

import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import {
  FullPageStudioShell,
  StudioTextarea,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import InteriorStudioPage from "@/registry/interior-studio-page";

const BASE = "/assets/interior-studio-page";
const PROJECTS = Array.from(
  { length: 4 },
  (_, i) => `${BASE}/project-${i + 1}.jpg`,
);
const PROCESS = Array.from(
  { length: 4 },
  (_, i) => `${BASE}/process-${i + 1}.jpg`,
);

const PRESETS = [
  {
    id: "earth",
    label: "Earth",
    headline: "Spaces that feel rooted, human, and quietly bold",
    background: "#171615",
    textColor: "#f2ede6",
    softColor: "#c9beb0",
    glassColor: "#f2ede6",
  },
  {
    id: "mineral",
    label: "Mineral",
    headline: "Rooms arranged around material, pause, and light",
    background: "#202623",
    textColor: "#eff4eb",
    softColor: "#b9c7b9",
    glassColor: "#d6e8d0",
  },
  {
    id: "warm",
    label: "Warm",
    headline: "Interiors shaped for long mornings and quiet work",
    background: "#2a211a",
    textColor: "#fff3e1",
    softColor: "#d8c0a1",
    glassColor: "#ffe6c7",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function InteriorStudioPageStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [headline, setHeadline] = useState<string>(preset.headline);
  const [intro, setIntro] = useState(
    "A full-page studio composition for interiors, hospitality, and objects that need texture, patience, and light.",
  );
  const [background, setBackground] = useState<string>(preset.background);
  const [textColor, setTextColor] = useState<string>(preset.textColor);
  const [softColor, setSoftColor] = useState<string>(preset.softColor);
  const [glassColor, setGlassColor] = useState<string>(preset.glassColor);

  function applyPreset(id: string) {
    const next = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
    setPreset(next);
    setHeadline(next.headline);
    setBackground(next.background);
    setTextColor(next.textColor);
    setSoftColor(next.softColor);
    setGlassColor(next.glassColor);
  }

  return (
    <FullPageStudioShell
      name="interior-studio-page"
      title="Interior Studio Page"
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
          <StudioTextarea label="Intro" value={intro} onChange={setIntro} />
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
              label="Soft"
              value={softColor}
              onChange={setSoftColor}
            />
            <StudioColor
              label="Glass"
              value={glassColor}
              onChange={setGlassColor}
            />
          </section>
        </>
      }
      note={
        <p>
          The page opens with a 135svh image hero and glass stat blocks, then
          moves into a manifesto, project wall, and process archive. Every asset
          is addressed through the Blob-backed assets route.
        </p>
      }
    >
      <InteriorStudioPage
        headline={headline}
        intro={intro}
        heroImage={`${BASE}/hero.jpg`}
        projectImages={PROJECTS}
        processImages={PROCESS}
        background={background}
        textColor={textColor}
        softColor={softColor}
        glassColor={glassColor}
      />
    </FullPageStudioShell>
  );
}

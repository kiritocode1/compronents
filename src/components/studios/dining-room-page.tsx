"use client";

import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import {
  FullPageStudioShell,
  StudioTextarea,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import DiningRoomPage from "@/registry/dining-room-page";

const BASE = "/assets/dining-room-page";
const ABOUT = Array.from({ length: 6 }, (_, i) => `${BASE}/about-${i + 1}.jpg`);
const MENU = Array.from({ length: 5 }, (_, i) => `${BASE}/menu-${i + 1}.jpg`);

const PRESETS = [
  {
    id: "linen",
    label: "Linen",
    title: "BLANK Dining",
    background: "#f4efe7",
    textColor: "#191612",
    mutedColor: "#81766b",
    accentColor: "#7f2f21",
  },
  {
    id: "cellar",
    label: "Cellar",
    title: "Maison BLANK",
    background: "#19120e",
    textColor: "#f7eadc",
    mutedColor: "#b49c88",
    accentColor: "#db7b49",
  },
  {
    id: "sage",
    label: "Sage",
    title: "BLANK Table",
    background: "#e8eadf",
    textColor: "#20251d",
    mutedColor: "#6f7666",
    accentColor: "#496d52",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function DiningRoomPageStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [title, setTitle] = useState<string>(preset.title);
  const [about, setAbout] = useState(
    "A dining room built on balance and subtlety, where materials, light, and service create something that feels effortless.",
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
      name="dining-room-page"
      title="Dining Room Page"
      presets={PRESETS}
      activePreset={preset.id}
      onPreset={applyPreset}
      onReset={() => applyPreset(PRESETS[0].id)}
      controls={
        <>
          <StudioTextField label="Title" value={title} onChange={setTitle} />
          <StudioTextarea label="About" value={about} onChange={setAbout} />
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
          This studio keeps the dining page fullscreen and scrollable above the
          controls. The editable layer focuses on title, narrative copy, and the
          core palette while image roles stay pinned to Blob assets.
        </p>
      }
    >
      <DiningRoomPage
        title={title}
        about={about}
        heroImage={`${BASE}/hero.jpg`}
        aboutImages={ABOUT}
        menuImages={MENU}
        ctaImage={`${BASE}/cta.jpg`}
        background={background}
        textColor={textColor}
        mutedColor={mutedColor}
        accentColor={accentColor}
      />
    </FullPageStudioShell>
  );
}

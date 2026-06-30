"use client";

import { useState } from "react";
import { StudioColor } from "@/components/site/studio-controls";
import {
  FullPageStudioShell,
  StudioTextarea,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import ArchiveCommercePage from "@/registry/archive-commerce-page";

const BASE = "/assets/archive-commerce-page";
const PRODUCTS = Array.from(
  { length: 6 },
  (_, i) => `${BASE}/product-${i + 1}.jpeg`,
);
const ARTICLES = Array.from(
  { length: 3 },
  (_, i) => `${BASE}/article-${i + 1}.jpeg`,
);

const PRESETS = [
  {
    id: "paper",
    label: "Paper",
    title: "BLANK ARCHIVE",
    background: "#f7f5ef",
    textColor: "#16130f",
    mutedColor: "#6f675d",
    accentColor: "#c84f2f",
  },
  {
    id: "ink",
    label: "Ink",
    title: "BLANK INDEX",
    background: "#11100d",
    textColor: "#eee8dc",
    mutedColor: "#9c9285",
    accentColor: "#f0aa35",
  },
  {
    id: "gallery",
    label: "Gallery",
    title: "OBJECT STUDY",
    background: "#ece8df",
    textColor: "#25211b",
    mutedColor: "#756b5f",
    accentColor: "#3f6d55",
  },
] as const;

type Preset = (typeof PRESETS)[number];

export default function ArchiveCommercePageStudio() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [title, setTitle] = useState<string>(preset.title);
  const [subtitle, setSubtitle] = useState(
    "A quiet catalogue for mockups, objects, notes, and release fragments arranged with gallery-level restraint.",
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
      name="archive-commerce-page"
      title="Archive Commerce Page"
      presets={PRESETS}
      activePreset={preset.id}
      onPreset={applyPreset}
      onReset={() => applyPreset(PRESETS[0].id)}
      controls={
        <>
          <StudioTextField label="Title" value={title} onChange={setTitle} />
          <StudioTextarea
            label="Subtitle"
            value={subtitle}
            onChange={setSubtitle}
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
          This page uses one animated hero asset, six product surfaces, and
          three editorial notes from Vercel Blob. The composition is built for a
          full viewport first, then continues into a product index.
        </p>
      }
    >
      <ArchiveCommercePage
        title={title}
        subtitle={subtitle}
        heroImage={`${BASE}/hero.gif`}
        productImages={PRODUCTS}
        articleImages={ARTICLES}
        background={background}
        textColor={textColor}
        mutedColor={mutedColor}
        accentColor={accentColor}
      />
    </FullPageStudioShell>
  );
}

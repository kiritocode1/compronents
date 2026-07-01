"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import FilmStudioPage, {
  type FilmStudioPageProps,
} from "@/registry/film-studio-page";

const PRESETS = [
  { id: "/", label: "Index" },
  { id: "/work", label: "Work" },
  { id: "/culture", label: "Culture" },
  { id: "/directors", label: "Directors" },
  { id: "/film", label: "Film" },
  { id: "/contact", label: "Contact" },
] as const satisfies readonly {
  id: NonNullable<FilmStudioPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function FilmStudioPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState("/assets/film-studio-page");

  return (
    <FullPageStudioShell
      name="film-studio-page"
      title="Film Studio Page"
      presets={PRESETS}
      activePreset={activePath}
      onPreset={(id) => setActivePath(id as PresetId)}
      onReset={() => {
        setActivePath(PRESETS[0].id);
        setAssetBase("/assets/film-studio-page");
      }}
      controls={
        <StudioTextField
          label="Asset base"
          value={assetBase}
          onChange={setAssetBase}
        />
      }
      note={
        <p>
          Source-backed Negative Films template ported with the original route
          set, project-grid Preloader, scramble nav menu, Three.js
          pixelated-video hero, html2canvas pixelated-text, lens-distortion work
          slider, expanding spotlight gallery, Lenis scroll, ukiyojs parallax,
          and Blob-hosted media. The pixelation and lens effects run on desktop.
        </p>
      }
    >
      <FilmStudioPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}

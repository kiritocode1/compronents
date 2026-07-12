"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import BrutalistPortfolioPage, {
  type BrutalistPortfolioPageProps,
} from "@/registry/brutalist-portfolio-page";

const BASE = "/assets/brutalist-portfolio-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/case-studies", label: "Case Studies" },
  { id: "/about", label: "About" },
] as const satisfies readonly {
  id: NonNullable<BrutalistPortfolioPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function BrutalistPortfolioPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="brutalist-portfolio-page"
      title="Brutalist Portfolio Page"
      presets={PRESETS}
      activePreset={activePath}
      onPreset={(id) => setActivePath(id as PresetId)}
      onReset={() => {
        setActivePath(PRESETS[0].id);
        setAssetBase(BASE);
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
          Source-backed Brutal Portfolio port with the original route set: a
          cursor image-trail home, an about page, and a case-studies list,
          behind a local router with the TweenMax trail reimplemented in gsap 3
          and Blob-hosted PP fonts and imagery.
        </p>
      }
    >
      <BrutalistPortfolioPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}

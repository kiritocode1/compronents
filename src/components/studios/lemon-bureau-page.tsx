"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import LemonBureauPage, {
  type LemonBureauPageProps,
} from "@/registry/lemon-bureau-page";

const BASE = "/assets/lemon-bureau-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/studio", label: "Studio" },
  { id: "/work", label: "Work" },
  { id: "/sample-project", label: "Project" },
  { id: "/contact", label: "Contact" },
] as const satisfies readonly {
  id: NonNullable<LemonBureauPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function LemonBureauPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="lemon-bureau-page"
      title="Lemon Bureau Page"
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
          Source-backed Lemon Bureau studio port with five local routes,
          Blob-hosted media, a GSAP preloader split, menu overlay reveal,
          full-page WebGL fluid-ink cursor trail, WebGL particle logo, pinned
          studio hero, stacked team cards, boosted client marquee, SVG work
          carousel, a three.js contact cube, and a GPU FLIP fluid footer.
        </p>
      }
    >
      <LemonBureauPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}

"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import DiningRoomPage, {
  type DiningRoomPageProps,
} from "@/registry/dining-room-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/about", label: "Essence" },
  { id: "/menu", label: "Carte" },
  { id: "/reservation", label: "Book" },
] as const satisfies readonly {
  id: NonNullable<DiningRoomPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function DiningRoomPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState("/assets/dining-room-page");

  return (
    <FullPageStudioShell
      name="dining-room-page"
      title="Dining Room Page"
      presets={PRESETS}
      activePreset={activePath}
      onPreset={(id) => setActivePath(id as PresetId)}
      onReset={() => {
        setActivePath(PRESETS[0].id);
        setAssetBase("/assets/dining-room-page");
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
          Source-backed Salle Blanche restaurant template ported with the
          original route set (home, essence, carte, book), Preloader, rotating
          nav menu, GSAP SplitText copy reveals, Lenis smooth scroll, dragging
          testimonials carousel, sticky cards, chefs hover, and a clip-path page
          transition. Fonts and imagery are served from Blob.
        </p>
      }
    >
      <DiningRoomPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}

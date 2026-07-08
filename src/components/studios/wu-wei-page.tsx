"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import WuWeiPage, { type WuWeiPageProps } from "@/registry/wu-wei-page";

const BASE = "/assets/wu-wei-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/work", label: "Work" },
  { id: "/studio", label: "Studio" },
  { id: "/archive", label: "Archive" },
  { id: "/contact", label: "Contact" },
  { id: "/sample-project", label: "Project" },
] as const satisfies readonly {
  id: NonNullable<WuWeiPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function WuWeiPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="wu-wei-page"
      title="Wu Wei Page"
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
          Source-backed Wu Wei studio port with six local routes, Blob-hosted
          media, GSAP preloader, WebGL logo particles, SplitText copy reveals,
          Lenis scroll, pinned studio sections, stacked cards, archive drag
          field, contact reveal, and sample-project progress counter.
        </p>
      }
    >
      <WuWeiPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}

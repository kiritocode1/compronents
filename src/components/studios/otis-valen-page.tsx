"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import OtisValenPage, {
  type OtisValenPageProps,
} from "@/registry/otis-valen-page";

const BASE = "/assets/otis-valen-page";

const PRESETS = [
  { id: "/", label: "Index" },
  { id: "/work", label: "Good Stuff" },
  { id: "/project", label: "Project" },
  { id: "/about", label: "Meet Otis" },
  { id: "/contact", label: "Slide In" },
] as const satisfies readonly {
  id: NonNullable<OtisValenPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function OtisValenPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="otis-valen-page"
      title="Otis Valen Page"
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
          Source-backed Otis Valen portfolio port with the original route set,
          block transition, menu reveal, pinned hero image, horizontal featured
          work, stacked services, project preview zoom, contact trail, footer
          image burst, Lenis scroll, and Blob-hosted media.
        </p>
      }
    >
      <OtisValenPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}

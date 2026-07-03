"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import DamienTsarantosPage, {
  type DamienTsarantosPageProps,
} from "@/registry/damien-tsarantos-page";

const BASE = "/assets/damien-tsarantos-page";

const PRESETS = [
  { id: "/", label: "Home" },
  { id: "/about", label: "About" },
  { id: "/work", label: "Projects" },
  { id: "/project", label: "Project" },
  { id: "/awards", label: "Awards" },
  { id: "/contact", label: "Contact" },
] as const satisfies readonly {
  id: NonNullable<DamienTsarantosPageProps["initialPath"]>;
  label: string;
}[];

type PresetId = (typeof PRESETS)[number]["id"];

export default function DamienTsarantosPageStudio() {
  const [activePath, setActivePath] = useState<PresetId>(PRESETS[0].id);
  const [assetBase, setAssetBase] = useState(BASE);

  return (
    <FullPageStudioShell
      name="damien-tsarantos-page"
      title="Damien Tsarantos Page"
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
          Source-backed Damien Tsarantos portfolio port with the original six
          route set, Lenis scroll, magnetic buttons, contact card ScrollTrigger
          stack, split-heading reveals, marquee strips, and Blob-hosted media.
        </p>
      }
    >
      <DamienTsarantosPage assetBase={assetBase} initialPath={activePath} />
    </FullPageStudioShell>
  );
}

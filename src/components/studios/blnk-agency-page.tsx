"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import BlnkAgencyPage, {
  type BlnkAgencyMode,
  type BlnkAgencyRoute,
} from "@/registry/blnk-agency-page";

const PRESETS = [
  { id: "work-vertical", label: "Work · Vertical" },
  { id: "work-horizontal", label: "Work · Horizontal" },
  { id: "work-grid", label: "Work · Grid" },
  { id: "about", label: "About" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

function parsePreset(id: PresetId): {
  route: BlnkAgencyRoute;
  mode: BlnkAgencyMode;
} {
  if (id === "about") return { route: "about", mode: "vertical" };
  if (id === "work-horizontal") return { route: "work", mode: "horizontal" };
  if (id === "work-grid") return { route: "work", mode: "grid" };
  return { route: "work", mode: "vertical" };
}

export default function BlnkAgencyPageStudio() {
  const [preset, setPreset] = useState<PresetId>(PRESETS[0].id);
  const [studioName, setStudioName] = useState("BLNK");
  const [email, setEmail] = useState("hello@aryank.space");
  const { route, mode } = parsePreset(preset);

  const pageKey = `${preset}-${studioName}-${email}`;

  return (
    <FullPageStudioShell
      name="blnk-agency-page"
      title="BLNK Agency Page"
      presets={PRESETS}
      activePreset={preset}
      onPreset={(id) => setPreset(id as PresetId)}
      onReset={() => {
        setPreset(PRESETS[0].id);
        setStudioName("BLNK");
        setEmail("hello@aryank.space");
      }}
      controls={
        <>
          <StudioTextField
            label="Studio name"
            value={studioName}
            onChange={setStudioName}
          />
          <StudioTextField label="Email" value={email} onChange={setEmail} />
        </>
      }
      note={
        <p>
          Port of obys.agency: preloader with logo brackets, wheel-driven
          infinite Vertical / Horizontal / Grid gallery, mid-line meta, click
          opens a work case study via page-transition veil, About route, and
          difference-blend chrome. Branded BLNK with existing registry imagery.
        </p>
      }
    >
      <BlnkAgencyPage
        key={pageKey}
        studioName={studioName}
        email={email}
        initialRoute={route}
        initialMode={mode}
        skipPreloader
      />
    </FullPageStudioShell>
  );
}

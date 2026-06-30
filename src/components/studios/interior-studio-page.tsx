"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import InteriorStudioPage from "@/registry/interior-studio-page";

const ROUTES = [
  { id: "home", label: "Home", route: "" },
  { id: "studio", label: "Studio", route: "studio" },
  { id: "spaces", label: "Spaces", route: "spaces" },
  { id: "sample", label: "Sample", route: "sample-space" },
  { id: "blueprints", label: "Blueprints", route: "blueprints" },
  { id: "connect", label: "Connect", route: "connect" },
] as const;

type RoutePreset = (typeof ROUTES)[number];

export default function InteriorStudioPageStudio() {
  const [preset, setPreset] = useState<RoutePreset>(ROUTES[0]);
  const [assetBase, setAssetBase] = useState("/interior-studio-page");
  const [route, setRoute] = useState<string>(preset.route);

  function applyPreset(id: string) {
    const next = ROUTES.find((item) => item.id === id) ?? ROUTES[0];
    setPreset(next);
    setRoute(next.route);
  }

  return (
    <FullPageStudioShell
      name="interior-studio-page"
      title="Interior Studio Page"
      presets={ROUTES}
      activePreset={preset.id}
      onPreset={applyPreset}
      onReset={() => {
        setAssetBase("/interior-studio-page");
        applyPreset(ROUTES[0].id);
      }}
      controls={
        <>
          <StudioTextField
            label="Hosted base"
            value={assetBase}
            onChange={setAssetBase}
          />
          <StudioTextField label="Route" value={route} onChange={setRoute} />
        </>
      }
      note={
        <p>
          This is the static export of the Terrene source site, with homepage,
          studio, spaces, sample-space, blueprints, and connect routes. The
          original menu, preloader, Lenis scroll, GSAP ScrollTrigger sequences,
          spotlight gallery, review carousel, and view transitions are kept in
          the Blob-hosted bundle.
        </p>
      }
    >
      <InteriorStudioPage assetBase={assetBase} route={route} height="100%" />
    </FullPageStudioShell>
  );
}

"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import ArchiveCommercePage from "@/registry/archive-commerce-page";

const ROUTES = [
  { id: "home", label: "Home", route: "" },
  { id: "catalogue", label: "Catalogue", route: "catalogue" },
  {
    id: "product",
    label: "Product",
    route: "catalogue/mirror-orb-mockup",
  },
  { id: "archive", label: "Archive", route: "archive" },
  { id: "editorial", label: "Editorial", route: "editorial" },
  {
    id: "article",
    label: "Article",
    route: "editorial/designing-with-restraint",
  },
] as const;

type RoutePreset = (typeof ROUTES)[number];

export default function ArchiveCommercePageStudio() {
  const [preset, setPreset] = useState<RoutePreset>(ROUTES[0]);
  const [assetBase, setAssetBase] = useState("/archive-commerce-page");
  const [route, setRoute] = useState<string>(preset.route);

  function applyPreset(id: string) {
    const next = ROUTES.find((item) => item.id === id) ?? ROUTES[0];
    setPreset(next);
    setRoute(next.route);
  }

  return (
    <FullPageStudioShell
      name="archive-commerce-page"
      title="Archive Commerce Page"
      presets={ROUTES}
      activePreset={preset.id}
      onPreset={applyPreset}
      onReset={() => {
        setAssetBase("/archive-commerce-page");
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
          This is the static export of the Format Archive source, served through
          a hosted proxy while every generated asset stays in Vercel Blob. It
          keeps the source preloader, cart drawer, Lenis scroll, GSAP reveals,
          product detail routes, editorial routes, and view transitions.
        </p>
      }
    >
      <ArchiveCommercePage assetBase={assetBase} route={route} height="100%" />
    </FullPageStudioShell>
  );
}

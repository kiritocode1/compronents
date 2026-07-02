// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import Menu from "./components/Menu/Menu";
import Brief from "./pages/brief";
import Catalog from "./pages/catalog";
import Connect from "./pages/connect";
import Home from "./pages/home";
import Studio from "./pages/studio";
import TransitionProvider from "./providers/TransitionProvider";
import {
  AssetProvider,
  DEFAULT_ASSET_BASE,
  normalizePath,
  ScrollProvider,
} from "./runtime";
import { getDarkCatalogPageStyles } from "./styles";

const ROUTES = new Set(["/", "/studio", "/catalog", "/brief", "/connect"]);

function PageOutlet({ pathname }: { pathname: string }) {
  switch (pathname) {
    case "/studio":
      return <Studio />;
    case "/catalog":
      return <Catalog />;
    case "/brief":
      return <Brief />;
    case "/connect":
      return <Connect />;
    default:
      return <Home />;
  }
}

export default function DarkCatalogPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: {
  assetBase?: string;
  initialPath?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [pathname, setPathnameState] = useState(() => {
    const normalized = normalizePath(initialPath);
    return ROUTES.has(normalized) ? normalized : "/";
  });

  const setPathname = (nextPath: string) => {
    const normalized = normalizePath(nextPath);
    setPathnameState(ROUTES.has(normalized) ? normalized : "/");
  };

  const css = useMemo(() => getDarkCatalogPageStyles(assetBase), [assetBase]);

  useEffect(() => {
    const normalized = normalizePath(initialPath);
    setPathnameState(ROUTES.has(normalized) ? normalized : "/");
  }, [initialPath]);

  return (
    <AssetProvider base={assetBase}>
      <div
        ref={rootRef}
        className={["dark-catalog-page", className].filter(Boolean).join(" ")}
        style={style}
      >
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <ScrollProvider rootRef={rootRef}>
          <TransitionProvider pathname={pathname} setPathname={setPathname}>
            <Menu />
            <div className="dark-catalog-route" key={pathname}>
              <PageOutlet pathname={pathname} />
            </div>
          </TransitionProvider>
        </ScrollProvider>
      </div>
    </AssetProvider>
  );
}

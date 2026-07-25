"use client";

/**
 * Clip Mask Transition Page - a three route site whose page changes are driven
 * by the browser's own View Transition API rather than by a JS timeline. The
 * outgoing page lifts and fades while the incoming one rises and opens from a
 * flat clip path at the bottom edge, so the new page appears to unroll over the
 * old one. The navbar is given its own transition name and told not to animate,
 * so it stays pinned and perfectly still while everything behind it changes.
 *
 * Routes run through a lightweight internal router, so the whole template is
 * one installable component with no routing dependency.
 *
 * BLANK - aryank.space
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { getClipMaskTransitionStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/clip-mask-transition-page";

export const CLIP_MASK_ROUTES = [
  { path: "/", label: "Genesis", slug: "genesis" },
  { path: "/gateway", label: "Gateway", slug: "gateway" },
  { path: "/colony", label: "Colony", slug: "colony" },
] as const;

export type ClipMaskRoute = (typeof CLIP_MASK_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(CLIP_MASK_ROUTES.map((r) => r.path));

function normalizePath(path: string | undefined): ClipMaskRoute {
  if (path && ROUTE_SET.has(path)) return path as ClipMaskRoute;
  return "/";
}

export interface ClipMaskTransitionPageProps {
  assetBase?: string;
  brand?: string;
  initialPath?: ClipMaskRoute;
}

// startViewTransition is still unshipped in some engines, so this is called
// through a guard and falls back to an immediate state change.
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> };
};

export default function ClipMaskTransitionPage({
  assetBase = DEFAULT_ASSET_BASE,
  brand = "Aethos",
  initialPath = "/",
}: ClipMaskTransitionPageProps) {
  const [path, setPath] = useState<ClipMaskRoute>(normalizePath(initialPath));
  const rootRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback(
    (next: ClipMaskRoute) => {
      if (next === path) return;

      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition !== "function") {
        setPath(next);
        return;
      }

      doc.startViewTransition(() => {
        // flushSync is not available here, so React batches this into the
        // transition's capture window on its own.
        setPath(next);
      });
    },
    [path],
  );

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  const active =
    CLIP_MASK_ROUTES.find((r) => r.path === path) ?? CLIP_MASK_ROUTES[0];

  return (
    <div className="cmt-root" ref={rootRef}>
      <style>{getClipMaskTransitionStyles(assetBase)}</style>

      <nav className="cmt-navbar" style={{ viewTransitionName: "cmt-navbar" }}>
        <div className="cmt-navbar-logo">
          <div className="cmt-navbar-item">
            <button type="button" onClick={() => navigate("/")}>
              {brand}
            </button>
          </div>
        </div>
        <div className="cmt-navbar-items">
          {CLIP_MASK_ROUTES.map((route) => (
            <div className="cmt-navbar-item" key={route.path}>
              <button type="button" onClick={() => navigate(route.path)}>
                {route.label}
              </button>
            </div>
          ))}
        </div>
      </nav>

      <div className="cmt-page" key={active.path}>
        <section className={`cmt-hero cmt-${active.slug}`}>
          <h1>{active.label}</h1>
        </section>
      </div>
    </div>
  );
}

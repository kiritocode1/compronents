"use client";

/**
 * Interior Studio Page - source-backed Terrene website template.
 *
 * The source bundle is hosted from Vercel Blob and streamed through the
 * Compronents template route so its Lenis, GSAP, ScrollTrigger, SplitType, menu,
 * preloader, gallery, and view-transition code can run intact.
 */

import type { CSSProperties } from "react";

export interface InteriorStudioPageProps {
  assetBase?: string;
  route?: string;
  title?: string;
  height?: CSSProperties["height"];
  className?: string;
}

const DEFAULT_TEMPLATE_BASE = "https://ui.aryank.space/interior-studio-page";

function templateUrl(assetBase: string, route: string) {
  const base = assetBase.replace(/\/+$/, "");
  const cleanRoute = route.replace(/^\/+|\/+$/g, "");
  return cleanRoute ? `${base}/${cleanRoute}` : base;
}

export default function InteriorStudioPage({
  assetBase = DEFAULT_TEMPLATE_BASE,
  route = "",
  title = "Interior Studio Page",
  height = "100svh",
  className,
}: InteriorStudioPageProps) {
  const src = templateUrl(assetBase, route);

  return (
    <div
      className={["w-full overflow-hidden bg-black", className]
        .filter(Boolean)
        .join(" ")}
      style={{ height }}
    >
      <iframe
        key={src}
        src={src}
        title={title}
        className="block h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

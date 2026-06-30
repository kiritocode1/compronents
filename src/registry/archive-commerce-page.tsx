"use client";

/**
 * Archive Commerce Page - source-backed Format Archive website template.
 *
 * Assets, fonts, generated CSS, and generated JavaScript are stored in Vercel
 * Blob. The default frame URL uses the Compronents hosted proxy so the source
 * site's GSAP, Lenis, cart store, and view-transition scripts can execute with
 * correct headers.
 */

import type { CSSProperties } from "react";

export interface ArchiveCommercePageProps {
  assetBase?: string;
  route?: string;
  title?: string;
  height?: CSSProperties["height"];
  className?: string;
}

const DEFAULT_TEMPLATE_BASE = "https://ui.aryank.space/archive-commerce-page";

function templateUrl(assetBase: string, route: string) {
  const base = assetBase.replace(/\/+$/, "");
  const cleanRoute = route.replace(/^\/+|\/+$/g, "");
  return cleanRoute ? `${base}/${cleanRoute}` : base;
}

export default function ArchiveCommercePage({
  assetBase = DEFAULT_TEMPLATE_BASE,
  route = "",
  title = "Archive Commerce Page",
  height = "100svh",
  className,
}: ArchiveCommercePageProps) {
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

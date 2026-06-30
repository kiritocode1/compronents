"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { demos } from "@/components/demos";
import { previews } from "@/components/previews";
import { getRegistryItem } from "@/lib/registry";

/**
 * Renders a registry item's preview edge-to-edge over the whole viewport,
 * escaping the site chrome. Prefers a dedicated full-screen `preview`, falling
 * back to the bounded `demo`. The fixed scroll container is its own scroller, so
 * scroll-on-reveal components (embedded mode) work here without the window.
 */
export function FullscreenPreview({ name }: { name: string }) {
  const Preview = previews[name] ?? demos[name];
  const section = getRegistryItem(name)?.section ?? "components";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black">
      <Link
        href={`/${section}/${name}`}
        aria-label="Close fullscreen"
        title="Close"
        className="fixed top-4 right-4 z-[60] flex size-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="size-4" />
      </Link>
      {Preview ? <Preview /> : null}
    </div>
  );
}

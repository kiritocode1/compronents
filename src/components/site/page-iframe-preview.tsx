"use client";

import { useSound } from "@web-kits/audio/react";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ExpandIcon } from "@/components/ui/expand-icon";
import { uiTap } from "@/lib/sounds";

/**
 * Bounded iframe preview for full-page templates. Page templates are heavy
 * (WebGL, smooth scroll, full-viewport layout), so rendering them inline on the
 * detail page takes over the whole screen. The iframe sandboxes the real
 * `/pages/<name>/preview` route into a fixed-height, independently scrollable
 * box, with a button to open it fullscreen.
 */
export function PageIframePreview({ name }: { name: string }) {
  const [reloadKey, setReloadKey] = useState(0);
  const playTap = useSound(uiTap);
  const src = `/pages/${name}/preview`;

  return (
    <div className="relative overflow-hidden rounded-lg border bg-black">
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <Link
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open fullscreen"
          title="Fullscreen"
          className="hit-area-1 flex size-7 items-center justify-center rounded-md bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExpandIcon
            size={14}
            className="flex size-full items-center justify-center"
          />
        </Link>
        <button
          type="button"
          onClick={() => {
            playTap();
            setReloadKey((k) => k + 1);
          }}
          aria-label="Reload preview"
          title="Reload"
          className="hit-area-1 flex size-7 items-center justify-center rounded-md bg-black/40 text-white/70 backdrop-blur transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
      <iframe
        key={reloadKey}
        src={src}
        title={`${name} preview`}
        loading="lazy"
        allow="autoplay; fullscreen"
        className="block h-[640px] w-full border-0"
      />
    </div>
  );
}

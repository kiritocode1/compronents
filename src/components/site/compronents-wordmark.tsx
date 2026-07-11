"use client";

import { Calligraph } from "calligraph";
import { GeistPixelCircle } from "geist/font/pixel";
import { cn } from "@/lib/utils";

/**
 * The COMPRONENTS wordmark: COM / NENTS animate in through Calligraph, PRO is
 * Geist Pixel Circle with orange and blue after-image copies stacked behind
 * it toward +x/+y, drifting in stepped pixel-grid increments. Scales with
 * font-size (offsets in em).
 */
export function CompronentsWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline whitespace-nowrap font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <Calligraph as="span" initial>
        COM
      </Calligraph>
      <span className="relative mx-[0.06em] inline-block">
        <span
          aria-hidden
          className={cn(
            GeistPixelCircle.className,
            "pixel-afterimage-b absolute inset-0 text-blue-600/70",
          )}
        >
          PRO
        </span>
        <span
          aria-hidden
          className={cn(
            GeistPixelCircle.className,
            "pixel-afterimage-a absolute inset-0 text-amber-500/80",
          )}
        >
          PRO
        </span>
        <span className={cn(GeistPixelCircle.className, "relative")}>PRO</span>
      </span>
      <Calligraph as="span" initial>
        NENTS
      </Calligraph>
    </span>
  );
}

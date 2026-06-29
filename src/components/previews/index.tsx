"use client";

import type { ComponentType } from "react";
import AnimatedFooterPreview from "./animated-footer";

/**
 * Optional full-viewport preview for a registry item, shown at
 * `/components/<name>/preview`. Falls back to the demo when a component has no
 * dedicated full-screen preview.
 *
 * To add one: create `src/components/previews/<name>.tsx` (default-export the
 * full-page preview) and register it here.
 */
export const previews: Record<string, ComponentType> = {
  "animated-footer": AnimatedFooterPreview,
};

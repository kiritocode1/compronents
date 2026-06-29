"use client";

import type { ComponentType } from "react";
import AnimatedFooterDemo from "./animated-footer";

/**
 * Maps a registry item name to its live usage demo.
 *
 * To add one: create `src/components/demos/<name>.tsx` (default-export a
 * `Demo` component) and register it here.
 */
export const demos: Record<string, ComponentType> = {
  "animated-footer": AnimatedFooterDemo,
};

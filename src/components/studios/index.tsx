"use client";

import type { ComponentType } from "react";
import AnimatedFooterStudio from "./animated-footer";

export type StudioComponent = ComponentType;

/**
 * Per-component studios are intentionally explicit. Artistic components often
 * need bespoke controls instead of a generic prop editor.
 */
export const studios: Record<string, StudioComponent> = {
  "animated-footer": AnimatedFooterStudio,
};

"use client";

import type { ComponentType } from "react";
import AccordionFramesPreview from "./accordion-frames";
import AnimatedFooterPreview from "./animated-footer";
import AsciiLogoPreview from "./ascii-logo";
import AwardListPreview from "./award-list";
import ImageRevealPreview from "./image-reveal";
import InversaScrollPreview from "./inversa-scroll";
import MaterialSpotlightPreview from "./material-spotlight";
import MosaicFlipPreview from "./mosaic-flip";
import OverlayMenuPreview from "./overlay-menu";
import PortfolioPagePreview from "./portfolio-page";

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
  "accordion-frames": AccordionFramesPreview,
  "ascii-logo": AsciiLogoPreview,
  "overlay-menu": OverlayMenuPreview,
  "mosaic-flip": MosaicFlipPreview,
  "image-reveal": ImageRevealPreview,
  "award-list": AwardListPreview,
  "inversa-scroll": InversaScrollPreview,
  "material-spotlight": MaterialSpotlightPreview,
  "portfolio-page": PortfolioPagePreview,
};

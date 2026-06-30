"use client";

import type { ComponentType } from "react";
import AccordionFramesStudio from "./accordion-frames";
import AnimatedFooterStudio from "./animated-footer";
import AsciiLogoStudio from "./ascii-logo";
import AwardListStudio from "./award-list";
import ImageRevealStudio from "./image-reveal";
import InversaScrollStudio from "./inversa-scroll";
import MaterialSpotlightStudio from "./material-spotlight";
import MosaicFlipStudio from "./mosaic-flip";
import OverlayMenuStudio from "./overlay-menu";
import PortfolioPageStudio from "./portfolio-page";

export type StudioComponent = ComponentType;

/**
 * Per-component studios are intentionally explicit. Artistic components often
 * need bespoke controls instead of a generic prop editor.
 */
export const studios: Record<string, StudioComponent> = {
  "animated-footer": AnimatedFooterStudio,
  "accordion-frames": AccordionFramesStudio,
  "ascii-logo": AsciiLogoStudio,
  "overlay-menu": OverlayMenuStudio,
  "mosaic-flip": MosaicFlipStudio,
  "image-reveal": ImageRevealStudio,
  "award-list": AwardListStudio,
  "inversa-scroll": InversaScrollStudio,
  "material-spotlight": MaterialSpotlightStudio,
  "portfolio-page": PortfolioPageStudio,
};

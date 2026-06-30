"use client";

import type { ComponentType } from "react";
import AccordionFramesPreview from "./accordion-frames";
import AnimatedFooterPreview from "./animated-footer";
import AsciiImageRevealPreview from "./ascii-image-reveal";
import AsciiLogoPreview from "./ascii-logo";
import AwardListPreview from "./award-list";
import CappenFluidSimulationPreview from "./cappen-fluid-simulation";
import DetroitParisSliderPreview from "./detroit-paris-slider";
import ImageRevealPreview from "./image-reveal";
import InversaScrollPreview from "./inversa-scroll";
import MaterialSpotlightPreview from "./material-spotlight";
import MosaicFlipPreview from "./mosaic-flip";
import OverlayMenuPreview from "./overlay-menu";
import PortfolioPagePreview from "./portfolio-page";
import PreloaderRevealPreview from "./preloader-reveal";
import ScrollTunnel3DPreview from "./scroll-tunnel-3d";
import ScrollWaveGalleryPreview from "./scroll-wave-gallery";

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
  "ascii-image-reveal": AsciiImageRevealPreview,
  "cappen-fluid-simulation": CappenFluidSimulationPreview,
  "detroit-paris-slider": DetroitParisSliderPreview,
  "ascii-logo": AsciiLogoPreview,
  "overlay-menu": OverlayMenuPreview,
  "mosaic-flip": MosaicFlipPreview,
  "image-reveal": ImageRevealPreview,
  "award-list": AwardListPreview,
  "inversa-scroll": InversaScrollPreview,
  "material-spotlight": MaterialSpotlightPreview,
  "portfolio-page": PortfolioPagePreview,
  "scroll-tunnel-3d": ScrollTunnel3DPreview,
  "scroll-wave-gallery": ScrollWaveGalleryPreview,
  "preloader-reveal": PreloaderRevealPreview,
};

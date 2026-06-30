"use client";

import type { ComponentType } from "react";
import AccordionFramesStudio from "./accordion-frames";
import AnimatedFooterStudio from "./animated-footer";
import AsciiImageRevealStudio from "./ascii-image-reveal";
import AsciiLogoStudio from "./ascii-logo";
import AwardListStudio from "./award-list";
import CappenFluidSimulationStudio from "./cappen-fluid-simulation";
import CreativeClutterStudio from "./creative-clutter";
import CrtDisplayStudio from "./crt-display";
import DetroitParisSliderStudio from "./detroit-paris-slider";
import FallingTagListStudio from "./falling-tag-list";
import FrameScrollStudio from "./frame-scroll";
import ImageRevealStudio from "./image-reveal";
import InversaScrollStudio from "./inversa-scroll";
import MaterialSpotlightStudio from "./material-spotlight";
import MosaicFlipStudio from "./mosaic-flip";
import OverlayMenuStudio from "./overlay-menu";
import PortfolioPageStudio from "./portfolio-page";
import PreloaderRevealStudio from "./preloader-reveal";
import ScrollTunnel3DStudio from "./scroll-tunnel-3d";
import ScrollWaveGalleryStudio from "./scroll-wave-gallery";
import SpiralGalleryStudio from "./spiral-gallery";

export type StudioComponent = ComponentType;

/**
 * Per-component studios are intentionally explicit. Artistic components often
 * need bespoke controls instead of a generic prop editor.
 */
export const studios: Record<string, StudioComponent> = {
  "animated-footer": AnimatedFooterStudio,
  "accordion-frames": AccordionFramesStudio,
  "ascii-image-reveal": AsciiImageRevealStudio,
  "cappen-fluid-simulation": CappenFluidSimulationStudio,
  "detroit-paris-slider": DetroitParisSliderStudio,
  "ascii-logo": AsciiLogoStudio,
  "overlay-menu": OverlayMenuStudio,
  "mosaic-flip": MosaicFlipStudio,
  "image-reveal": ImageRevealStudio,
  "award-list": AwardListStudio,
  "inversa-scroll": InversaScrollStudio,
  "material-spotlight": MaterialSpotlightStudio,
  "portfolio-page": PortfolioPageStudio,
  "scroll-tunnel-3d": ScrollTunnel3DStudio,
  "scroll-wave-gallery": ScrollWaveGalleryStudio,
  "preloader-reveal": PreloaderRevealStudio,
  "creative-clutter": CreativeClutterStudio,
  "crt-display": CrtDisplayStudio,
  "falling-tag-list": FallingTagListStudio,
  "frame-scroll": FrameScrollStudio,
  "spiral-gallery": SpiralGalleryStudio,
};

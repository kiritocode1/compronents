"use client";

import type { ComponentType } from "react";
import AccordionFramesDemo from "./accordion-frames";
import AnimatedFooterDemo from "./animated-footer";
import AsciiImageRevealDemo from "./ascii-image-reveal";
import AsciiLogoDemo from "./ascii-logo";
import AwardListDemo from "./award-list";
import CappenFluidSimulationDemo from "./cappen-fluid-simulation";
import DetroitParisSliderDemo from "./detroit-paris-slider";
import ImageRevealDemo from "./image-reveal";
import InversaScrollDemo from "./inversa-scroll";
import MaterialSpotlightDemo from "./material-spotlight";
import MosaicFlipDemo from "./mosaic-flip";
import OverlayMenuDemo from "./overlay-menu";
import PortfolioPageDemo from "./portfolio-page";
import PreloaderRevealDemo from "./preloader-reveal";
import ScrollTunnel3DDemo from "./scroll-tunnel-3d";
import ScrollWaveGalleryDemo from "./scroll-wave-gallery";

/**
 * Maps a registry item name to its live usage demo.
 *
 * To add one: create `src/components/demos/<name>.tsx` (default-export a
 * `Demo` component) and register it here.
 */
export const demos: Record<string, ComponentType> = {
  "animated-footer": AnimatedFooterDemo,
  "accordion-frames": AccordionFramesDemo,
  "ascii-image-reveal": AsciiImageRevealDemo,
  "cappen-fluid-simulation": CappenFluidSimulationDemo,
  "detroit-paris-slider": DetroitParisSliderDemo,
  "ascii-logo": AsciiLogoDemo,
  "overlay-menu": OverlayMenuDemo,
  "mosaic-flip": MosaicFlipDemo,
  "image-reveal": ImageRevealDemo,
  "award-list": AwardListDemo,
  "inversa-scroll": InversaScrollDemo,
  "material-spotlight": MaterialSpotlightDemo,
  "portfolio-page": PortfolioPageDemo,
  "scroll-tunnel-3d": ScrollTunnel3DDemo,
  "scroll-wave-gallery": ScrollWaveGalleryDemo,
  "preloader-reveal": PreloaderRevealDemo,
};

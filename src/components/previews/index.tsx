"use client";

import type { ComponentType } from "react";
import AccordionFramesPreview from "./accordion-frames";
import AnimatedFooterPreview from "./animated-footer";
import ArchiveCommercePagePreview from "./archive-commerce-page";
import AsciiImageRevealPreview from "./ascii-image-reveal";
import AsciiLogoPreview from "./ascii-logo";
import AwardListPreview from "./award-list";
import CappenFluidSimulationPreview from "./cappen-fluid-simulation";
import CreativeClutterPreview from "./creative-clutter";
import CrtDisplayPreview from "./crt-display";
import CurveGalleryPreview from "./curve-gallery";
import DarkCatalogPagePreview from "./dark-catalog-page";
import DeadspacePagePreview from "./deadspace-page";
import DepoluxeSidewaysCarouselPreview from "./depoluxe-sideways-carousel";
import DetroitParisSliderPreview from "./detroit-paris-slider";
import DiningRoomPagePreview from "./dining-room-page";
import EdgeWarpRailPreview from "./edge-warp-rail";
import FallingTagListPreview from "./falling-tag-list";
import FilmStudioPagePreview from "./film-studio-page";
import FlowFieldTextPreview from "./flow-field-text";
import FluidMosaicPreview from "./fluid-mosaic";
import FrameScrollPreview from "./frame-scroll";
import GrainGradientFieldPreview from "./grain-gradient-field";
import GrainGradientNavPreview from "./grain-gradient-nav";
import ImageRevealPreview from "./image-reveal";
import InkFieldPreview from "./ink-field";
import InteriorStudioPagePreview from "./interior-studio-page";
import InversaScrollPreview from "./inversa-scroll";
import LegoDitherPreview from "./lego-dither";
import March2025TemplatePreview from "./march-2025-template";
import MaterialSpotlightPreview from "./material-spotlight";
import MonogramMorphPagePreview from "./monogram-morph-page";
import MosaicFlipPreview from "./mosaic-flip";
import OverlayMenuPreview from "./overlay-menu";
import PortfolioPagePreview from "./portfolio-page";
import PreloaderRevealPreview from "./preloader-reveal";
import PrismLightInstrumentPreview from "./prism-light-instrument";
import ProceduralComputerPagePreview from "./procedural-computer-page";
import ScrollTunnel3DPreview from "./scroll-tunnel-3d";
import ScrollWaveGalleryPreview from "./scroll-wave-gallery";
import SpiralGalleryPreview from "./spiral-gallery";
import SurpriseBoxPreview from "./surprise-box";

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
  "depoluxe-sideways-carousel": DepoluxeSidewaysCarouselPreview,
  "detroit-paris-slider": DetroitParisSliderPreview,
  "ascii-logo": AsciiLogoPreview,
  "overlay-menu": OverlayMenuPreview,
  "monogram-morph-page": MonogramMorphPagePreview,
  "mosaic-flip": MosaicFlipPreview,
  "image-reveal": ImageRevealPreview,
  "ink-field": InkFieldPreview,
  "grain-gradient-field": GrainGradientFieldPreview,
  "grain-gradient-nav": GrainGradientNavPreview,
  "award-list": AwardListPreview,
  "inversa-scroll": InversaScrollPreview,
  "material-spotlight": MaterialSpotlightPreview,
  "portfolio-page": PortfolioPagePreview,
  "procedural-computer-page": ProceduralComputerPagePreview,
  "scroll-tunnel-3d": ScrollTunnel3DPreview,
  "scroll-wave-gallery": ScrollWaveGalleryPreview,
  "preloader-reveal": PreloaderRevealPreview,
  "creative-clutter": CreativeClutterPreview,
  "crt-display": CrtDisplayPreview,
  "curve-gallery": CurveGalleryPreview,
  "lego-dither": LegoDitherPreview,
  "falling-tag-list": FallingTagListPreview,
  "edge-warp-rail": EdgeWarpRailPreview,
  "flow-field-text": FlowFieldTextPreview,
  "fluid-mosaic": FluidMosaicPreview,
  "frame-scroll": FrameScrollPreview,
  "spiral-gallery": SpiralGalleryPreview,
  "surprise-box": SurpriseBoxPreview,
  "archive-commerce-page": ArchiveCommercePagePreview,
  "interior-studio-page": InteriorStudioPagePreview,
  "dining-room-page": DiningRoomPagePreview,
  "film-studio-page": FilmStudioPagePreview,
  "dark-catalog-page": DarkCatalogPagePreview,
  "deadspace-page": DeadspacePagePreview,
  "march-2025-template": March2025TemplatePreview,
  "prism-light-instrument": PrismLightInstrumentPreview,
};

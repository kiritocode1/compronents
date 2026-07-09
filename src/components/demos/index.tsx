"use client";

import type { ComponentType } from "react";
import AccordionFramesDemo from "./accordion-frames";
import AnimatedFooterDemo from "./animated-footer";
import ArchiveCommercePageDemo from "./archive-commerce-page";
import AsciiImageRevealDemo from "./ascii-image-reveal";
import AsciiLogoDemo from "./ascii-logo";
import AwardListDemo from "./award-list";
import CappenFluidSimulationDemo from "./cappen-fluid-simulation";
import CreativeClutterDemo from "./creative-clutter";
import CrtDisplayDemo from "./crt-display";
import DamienTsarantosPageDemo from "./damien-tsarantos-page";
import DarkCatalogPageDemo from "./dark-catalog-page";
import DeadspacePageDemo from "./deadspace-page";
import DetroitParisSliderDemo from "./detroit-paris-slider";
import DiningRoomPageDemo from "./dining-room-page";
import FallingTagListDemo from "./falling-tag-list";
import FilmStudioPageDemo from "./film-studio-page";
import FrameScrollDemo from "./frame-scroll";
import GridScrambleHoverDemo from "./grid-scramble-hover";
import ImageRevealDemo from "./image-reveal";
import InteriorStudioPageDemo from "./interior-studio-page";
import InversaScrollDemo from "./inversa-scroll";
import LemonBureauPageDemo from "./lemon-bureau-page";
import March2025TemplateDemo from "./march-2025-template";
import MaterialSpotlightDemo from "./material-spotlight";
import MosaicFlipDemo from "./mosaic-flip";
import OtisValenPageDemo from "./otis-valen-page";
import OverlayMenuDemo from "./overlay-menu";
import PortfolioPageDemo from "./portfolio-page";
import PreloaderRevealDemo from "./preloader-reveal";
import ScrollTunnel3DDemo from "./scroll-tunnel-3d";
import ScrollWaveGalleryDemo from "./scroll-wave-gallery";
import SpiralGalleryDemo from "./spiral-gallery";
import TextDisplacementFieldDemo from "./text-displacement-field";
import ThreejsInfiniteSliderDemo from "./threejs-infinite-slider";
import VinylOrbitPlayerDemo from "./vinyl-orbit-player";
import VokuImageSliderDemo from "./voku-image-slider";
import WuWeiPageDemo from "./wu-wei-page";

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
  "creative-clutter": CreativeClutterDemo,
  "crt-display": CrtDisplayDemo,
  "falling-tag-list": FallingTagListDemo,
  "frame-scroll": FrameScrollDemo,
  "spiral-gallery": SpiralGalleryDemo,
  "voku-image-slider": VokuImageSliderDemo,
  "threejs-infinite-slider": ThreejsInfiniteSliderDemo,
  "grid-scramble-hover": GridScrambleHoverDemo,
  "text-displacement-field": TextDisplacementFieldDemo,
  "vinyl-orbit-player": VinylOrbitPlayerDemo,
  "archive-commerce-page": ArchiveCommercePageDemo,
  "interior-studio-page": InteriorStudioPageDemo,
  "dining-room-page": DiningRoomPageDemo,
  "film-studio-page": FilmStudioPageDemo,
  "dark-catalog-page": DarkCatalogPageDemo,
  "damien-tsarantos-page": DamienTsarantosPageDemo,
  "deadspace-page": DeadspacePageDemo,
  "otis-valen-page": OtisValenPageDemo,
  "march-2025-template": March2025TemplateDemo,
  "wu-wei-page": WuWeiPageDemo,
  "lemon-bureau-page": LemonBureauPageDemo,
};

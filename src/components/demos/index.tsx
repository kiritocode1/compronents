"use client";

import type { ComponentType } from "react";
import AccordionFramesDemo from "./accordion-frames";
import AnimatedFooterDemo from "./animated-footer";
import ApertureZoomHeroDemo from "./aperture-zoom-hero";
import ArchiveCommercePageDemo from "./archive-commerce-page";
import AsciiImageRevealDemo from "./ascii-image-reveal";
import AsciiLogoDemo from "./ascii-logo";
import AwardListDemo from "./award-list";
import BlockRevealTextDemo from "./block-reveal-text";
import CappenFluidSimulationDemo from "./cappen-fluid-simulation";
import CatalogSwapGalleryDemo from "./catalog-swap-gallery";
import ClientHoverPreviewDemo from "./client-hover-preview";
import ConvergingSearchScrollDemo from "./converging-search-scroll";
import CorridorScene3DDemo from "./corridor-scene-3d";
import CounterStarLoaderDemo from "./counter-star-loader";
import CreativeClutterDemo from "./creative-clutter";
import CrossRevealScrollDemo from "./cross-reveal-scroll";
import CrtDisplayDemo from "./crt-display";
import CursorTrailScrollDemo from "./cursor-trail-scroll";
import CurvedPlaneSliderDemo from "./curved-plane-slider";
import DamienTsarantosPageDemo from "./damien-tsarantos-page";
import DarkCatalogPageDemo from "./dark-catalog-page";
import DeadspacePageDemo from "./deadspace-page";
import DetroitParisSliderDemo from "./detroit-paris-slider";
import DiningRoomPageDemo from "./dining-room-page";
import DragTimelineScrollDemo from "./drag-timeline-scroll";
import ExpandingNavbarRevealDemo from "./expanding-navbar-reveal";
import ExpandingRowsGalleryDemo from "./expanding-rows-gallery";
import FallingTagListDemo from "./falling-tag-list";
import FilmStudioPageDemo from "./film-studio-page";
import FilterScrubGalleryDemo from "./filter-scrub-gallery";
import FolderPreviewHoverDemo from "./folder-preview-hover";
import FoldingPanelMenuDemo from "./folding-panel-menu";
import FractalGlassHoverDemo from "./fractal-glass-hover";
import FrameScrollDemo from "./frame-scroll";
import GridScrambleHoverDemo from "./grid-scramble-hover";
import HourTimelineSliderDemo from "./hour-timeline-slider";
import ImageRevealDemo from "./image-reveal";
import InfiniteContactScrollDemo from "./infinite-contact-scroll";
import InteriorStudioPageDemo from "./interior-studio-page";
import InversaScrollDemo from "./inversa-scroll";
import InversionLensHoverDemo from "./inversion-lens-hover";
import LandingCounterRevealDemo from "./landing-counter-reveal";
import LemonBureauPageDemo from "./lemon-bureau-page";
import LineRiseTextDemo from "./line-rise-text";
import March2025TemplateDemo from "./march-2025-template";
import MaskRevealPreloaderDemo from "./mask-reveal-preloader";
import MaterialSpotlightDemo from "./material-spotlight";
import MinimapParallaxScrollDemo from "./minimap-parallax-scroll";
import MinimapScrubberDemo from "./minimap-scrubber";
import ModelMenu3DDemo from "./model-menu-3d";
import MosaicFlipDemo from "./mosaic-flip";
import NamePreloaderRevealDemo from "./name-preloader-reveal";
import OrbitTextPreloaderDemo from "./orbit-text-preloader";
import OtisValenPageDemo from "./otis-valen-page";
import OverlayMenuDemo from "./overlay-menu";
import PortfolioPageDemo from "./portfolio-page";
import PreloaderPanelRevealDemo from "./preloader-panel-reveal";
import PreloaderRevealDemo from "./preloader-reveal";
import RibbonStrokeScrollDemo from "./ribbon-stroke-scroll";
import RotatingHandScrollDemo from "./rotating-hand-scroll";
import ScrollScrubSliderDemo from "./scroll-scrub-slider";
import ScrollTextBlocksDemo from "./scroll-text-blocks";
import ScrollTunnel3DDemo from "./scroll-tunnel-3d";
import ScrollWaveGalleryDemo from "./scroll-wave-gallery";
import SpiralGalleryDemo from "./spiral-gallery";
import SplitCardScrollDemo from "./split-card-scroll";
import SpotlightIndexScrollDemo from "./spotlight-index-scroll";
import SvgStrokeHoverDemo from "./svg-stroke-hover";
import TerminalTextRevealDemo from "./terminal-text-reveal";
import TextDisplacementFieldDemo from "./text-displacement-field";
import ThreejsInfiniteSliderDemo from "./threejs-infinite-slider";
import VideoCardStackDemo from "./video-card-stack";
import VinylOrbitPlayerDemo from "./vinyl-orbit-player";
import VokuImageSliderDemo from "./voku-image-slider";
import WebglDissolveScrollDemo from "./webgl-dissolve-scroll";
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
  "svg-stroke-hover": SvgStrokeHoverDemo,
  "terminal-text-reveal": TerminalTextRevealDemo,
  "orbit-text-preloader": OrbitTextPreloaderDemo,
  "scroll-text-blocks": ScrollTextBlocksDemo,
  "video-card-stack": VideoCardStackDemo,
  "client-hover-preview": ClientHoverPreviewDemo,
  "filter-scrub-gallery": FilterScrubGalleryDemo,
  "folding-panel-menu": FoldingPanelMenuDemo,
  "folder-preview-hover": FolderPreviewHoverDemo,
  "minimap-parallax-scroll": MinimapParallaxScrollDemo,
  "minimap-scrubber": MinimapScrubberDemo,
  "scroll-scrub-slider": ScrollScrubSliderDemo,
  "split-card-scroll": SplitCardScrollDemo,
  "hour-timeline-slider": HourTimelineSliderDemo,
  "drag-timeline-scroll": DragTimelineScrollDemo,
  "expanding-rows-gallery": ExpandingRowsGalleryDemo,
  "ribbon-stroke-scroll": RibbonStrokeScrollDemo,
  "rotating-hand-scroll": RotatingHandScrollDemo,
  "infinite-contact-scroll": InfiniteContactScrollDemo,
  "aperture-zoom-hero": ApertureZoomHeroDemo,
  "spotlight-index-scroll": SpotlightIndexScrollDemo,
  "expanding-navbar-reveal": ExpandingNavbarRevealDemo,
  "webgl-dissolve-scroll": WebglDissolveScrollDemo,
  "landing-counter-reveal": LandingCounterRevealDemo,
  "block-reveal-text": BlockRevealTextDemo,
  "preloader-panel-reveal": PreloaderPanelRevealDemo,
  "fractal-glass-hover": FractalGlassHoverDemo,
  "name-preloader-reveal": NamePreloaderRevealDemo,
  "model-menu-3d": ModelMenu3DDemo,
  "converging-search-scroll": ConvergingSearchScrollDemo,
  "mask-reveal-preloader": MaskRevealPreloaderDemo,
  "line-rise-text": LineRiseTextDemo,
  "inversion-lens-hover": InversionLensHoverDemo,
  "counter-star-loader": CounterStarLoaderDemo,
  "corridor-scene-3d": CorridorScene3DDemo,
  "catalog-swap-gallery": CatalogSwapGalleryDemo,
  "cross-reveal-scroll": CrossRevealScrollDemo,
  "cursor-trail-scroll": CursorTrailScrollDemo,
  "curved-plane-slider": CurvedPlaneSliderDemo,
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

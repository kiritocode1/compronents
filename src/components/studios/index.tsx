"use client";

import type { ComponentType } from "react";
import AccordionFramesStudio from "./accordion-frames";
import AnimatedFooterStudio from "./animated-footer";
import ArchiveCommercePageStudio from "./archive-commerce-page";
import AsciiImageRevealStudio from "./ascii-image-reveal";
import AsciiLogoStudio from "./ascii-logo";
import AwardListStudio from "./award-list";
import BrutalistPortfolioPageStudio from "./brutalist-portfolio-page";
import CappenFluidSimulationStudio from "./cappen-fluid-simulation";
import CreativeClutterStudio from "./creative-clutter";
import CrtDisplayStudio from "./crt-display";
import CurveGalleryStudio from "./curve-gallery";
import DamienTsarantosPageStudio from "./damien-tsarantos-page";
import DarkCatalogPageStudio from "./dark-catalog-page";
import DeadspacePageStudio from "./deadspace-page";
import DetroitParisSliderStudio from "./detroit-paris-slider";
import DiningRoomPageStudio from "./dining-room-page";
import FallingTagListStudio from "./falling-tag-list";
import FilmStudioPageStudio from "./film-studio-page";
import FrameScrollStudio from "./frame-scroll";
import ImageRevealStudio from "./image-reveal";
import InteriorStudioPageStudio from "./interior-studio-page";
import InversaScrollStudio from "./inversa-scroll";
import IsochromePageStudio from "./isochrome-page";
import JuanMoraPageStudio from "./juan-mora-page";
import LemonBureauPageStudio from "./lemon-bureau-page";
import March2025TemplateStudio from "./march-2025-template";
import MaterialSpotlightStudio from "./material-spotlight";
import MosaicFlipStudio from "./mosaic-flip";
import NeotericPageStudio from "./neoteric-page";
import NullStudioPageStudio from "./null-studio-page";
import OtisValenPageStudio from "./otis-valen-page";
import OverlayMenuStudio from "./overlay-menu";
import PixelgridStudioPageStudio from "./pixelgrid-studio-page";
import PortfolioPageStudio from "./portfolio-page";
import PreloaderRevealStudio from "./preloader-reveal";
import ScrollTunnel3DStudio from "./scroll-tunnel-3d";
import ScrollWaveGalleryStudio from "./scroll-wave-gallery";
import SorenPageStudio from "./soren-page";
import SpiralGalleryStudio from "./spiral-gallery";
import UnusualStudioPageStudio from "./unusual-studio-page";
import VelascoSolariPageStudio from "./velasco-solari-page";
import WuWeiPageStudio from "./wu-wei-page";

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
  "curve-gallery": CurveGalleryStudio,
  "falling-tag-list": FallingTagListStudio,
  "frame-scroll": FrameScrollStudio,
  "spiral-gallery": SpiralGalleryStudio,
  "archive-commerce-page": ArchiveCommercePageStudio,
  "interior-studio-page": InteriorStudioPageStudio,
  "dining-room-page": DiningRoomPageStudio,
  "film-studio-page": FilmStudioPageStudio,
  "dark-catalog-page": DarkCatalogPageStudio,
  "damien-tsarantos-page": DamienTsarantosPageStudio,
  "deadspace-page": DeadspacePageStudio,
  "otis-valen-page": OtisValenPageStudio,
  "march-2025-template": March2025TemplateStudio,
  "wu-wei-page": WuWeiPageStudio,
  "lemon-bureau-page": LemonBureauPageStudio,
  "brutalist-portfolio-page": BrutalistPortfolioPageStudio,
  "isochrome-page": IsochromePageStudio,
  "juan-mora-page": JuanMoraPageStudio,
  "null-studio-page": NullStudioPageStudio,
  "neoteric-page": NeotericPageStudio,
  "soren-page": SorenPageStudio,
  "unusual-studio-page": UnusualStudioPageStudio,
  "velasco-solari-page": VelascoSolariPageStudio,
  "pixelgrid-studio-page": PixelgridStudioPageStudio,
};

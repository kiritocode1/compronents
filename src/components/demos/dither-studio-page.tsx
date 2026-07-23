"use client";

import DitherStudioPage from "@/registry/dither-studio-page";

/** A small public-domain loop so the hero footage and showreel render by default. */
const SAMPLE_VIDEO = "/assets/film-studio-page/hero/hero-footage.mp4";

export default function DitherStudioPageDemo() {
  return <DitherStudioPage heroVideoSrc={SAMPLE_VIDEO} />;
}

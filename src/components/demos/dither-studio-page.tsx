"use client";

import DitherStudioPage from "@/registry/dither-studio-page";

/** A small public-domain loop so the hero footage and showreel render by default. */
const SAMPLE_VIDEO =
  "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/juan-mora-page/videos-work/desk_jm3.mp4";

export default function DitherStudioPageDemo() {
  return <DitherStudioPage heroVideoSrc={SAMPLE_VIDEO} />;
}

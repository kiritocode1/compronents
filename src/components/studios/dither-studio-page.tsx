"use client";

import { useState } from "react";
import {
  FullPageStudioShell,
  StudioTextField,
} from "@/components/studios/full-page-studio-shell";
import DitherStudioPage from "@/registry/dither-studio-page";

const PRESETS = [
  { id: "plate", label: "No media" },
  { id: "video", label: "With video" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

/** A small public-domain loop, so the studio can show the hero with real footage. */
const SAMPLE_VIDEO =
  "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/juan-mora-page/videos-work/desk_jm3.mp4";

export default function DitherStudioPageStudio() {
  const [preset, setPreset] = useState<PresetId>("plate");
  const [heroVideoSrc, setHeroVideoSrc] = useState("");

  const applyPreset = (id: PresetId) => {
    setPreset(id);
    setHeroVideoSrc(id === "video" ? SAMPLE_VIDEO : "");
  };

  return (
    <FullPageStudioShell
      name="dither-studio-page"
      title="Dither Studio Page"
      presets={PRESETS}
      activePreset={preset}
      onPreset={(id) => applyPreset(id as PresetId)}
      onReset={() => applyPreset("plate")}
      controls={
        <StudioTextField
          label="Hero video URL"
          value={heroVideoSrc}
          onChange={setHeroVideoSrc}
        />
      }
      note={
        <p>
          A full-bleed agency homepage that sits on a live WebGL dither field
          warping toward the cursor. The pill nav morphs its pixel mark and
          rolls a new message per section, the right-rail panels follow the
          scroll, case rows expand in place, and a label pill chases the
          pointer. Move the mouse across any image: it smears into coarse pixels
          behind the cursor and heals. On load a counter runs to 100% before the
          plate dissolves; reload the preview to replay it. No media ships with
          the component; footage passed via props is requantised to duotone
          dither every frame.
        </p>
      }
    >
      <DitherStudioPage heroVideoSrc={heroVideoSrc || undefined} />
    </FullPageStudioShell>
  );
}

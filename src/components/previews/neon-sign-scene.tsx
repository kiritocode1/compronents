"use client";

import NeonSignScene from "@/registry/neon-sign-scene";

export default function NeonSignScenePreview() {
  return (
    <main className="h-screen w-full overflow-hidden bg-black">
      <NeonSignScene className="h-full w-full" />
    </main>
  );
}

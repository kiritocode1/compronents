"use client";

import BunkerScene from "@/registry/bunker-scene";

export default function BunkerScenePreview() {
  return (
    <main className="h-screen w-full overflow-hidden bg-black">
      <BunkerScene className="h-full w-full" />
    </main>
  );
}

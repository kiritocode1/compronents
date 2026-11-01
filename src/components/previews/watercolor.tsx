"use client";
import Watercolor from "@/registry/watercolor";
export default function WatercolorPreview() {
  return (
    <main className="h-dvh overflow-hidden">
      <Watercolor wheelControls keyboardShortcuts />
    </main>
  );
}

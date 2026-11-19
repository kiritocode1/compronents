"use client";

import PatchCables from "@/registry/patch-cables";

export default function PatchCablesPreview() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <PatchCables />
    </main>
  );
}

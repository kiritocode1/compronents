"use client";

import PlasmaTunnelBackground from "@/registry/plasma-tunnel-background";

export default function PlasmaTunnelBackgroundDemo() {
  return (
    <div className="relative h-[720px] w-full overflow-hidden rounded-md bg-black">
      <PlasmaTunnelBackground className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-8 text-white mix-blend-screen sm:p-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-cyan-100/80">
          BLANK signal field
        </p>
        <h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-7xl">
          A procedural tunnel for pages that need motion before the first word.
        </h2>
      </div>
    </div>
  );
}

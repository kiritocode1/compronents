"use client";

import WindDriftField from "@/registry/wind-drift-field";

export default function WindDriftFieldDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      <WindDriftField>
        <div className="flex h-full flex-col justify-between p-[clamp(1rem,3vmin,2rem)] text-[#f0ece3]">
          <div>
            <h2 className="font-mono text-[clamp(1.9rem,5vmin,3.2rem)] leading-[0.9] tracking-[0.03em] uppercase">
              Still air
            </h2>
            <p className="mt-2 font-mono text-[0.6rem] tracking-[0.24em] text-[#a3b0b8] uppercase">
              Move the pointer to raise a wind
            </p>
          </div>
          <p className="max-w-[22rem] font-mono text-[0.6rem] leading-[1.9] tracking-[0.18em] text-[#a3b0b8] uppercase">
            Nothing moves on its own. Colour reads wind speed, green in a slow
            eddy, red where you sweep hard.
          </p>
        </div>
      </WindDriftField>
    </div>
  );
}

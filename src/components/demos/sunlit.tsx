"use client";

import Sunlit from "@/registry/sunlit";

export default function SunlitDemo() {
  return (
    <div className="h-[100svh] w-full overflow-hidden">
      <Sunlit>
        <div className="flex h-full flex-col justify-between p-10 md:p-14">
          <header className="flex items-start justify-between gap-6">
            <span className="font-serif text-2xl tracking-tight md:text-3xl">
              BLANK
            </span>
            <p className="max-w-[14rem] text-right text-[0.68rem] leading-relaxed tracking-[0.12em] uppercase opacity-70">
              Click anywhere to toggle the sun
            </p>
          </header>

          <div className="max-w-xl space-y-5">
            <p className="text-[0.7rem] tracking-[0.16em] uppercase opacity-65">
              Dappled light
            </p>
            <h1 className="font-serif text-4xl leading-[1.1] tracking-tight md:text-6xl">
              Morning through the blinds, still settling on the floor
            </h1>
            <p className="max-w-md text-sm leading-relaxed opacity-75 md:text-base">
              A pure CSS window of shutters, leaves, and progressive blur. Day
              and night trade places through a short sunrise or sunset, not a
              hard cut.
            </p>
          </div>
        </div>
      </Sunlit>
    </div>
  );
}

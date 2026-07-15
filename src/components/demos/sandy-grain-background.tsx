"use client";

import SandyGrainBackground from "@/registry/sandy-grain-background";

export default function SandyGrainBackgroundDemo() {
  return (
    <div className="h-[100svh] w-full overflow-hidden">
      <SandyGrainBackground>
        <div className="flex h-full flex-col justify-between p-10">
          <header className="flex items-start justify-between">
            <span className="font-serif text-3xl tracking-tight text-[#ece4d4]">
              BLANK
            </span>
            <nav className="flex gap-8 text-xs tracking-[0.14em] text-[#c8b89a]">
              <a href="#services">[ SERVICES ]</a>
              <a href="#method">[ METHOD ]</a>
              <a href="#contact">[ CONTACT ]</a>
            </nav>
          </header>
          <h1 className="max-w-3xl font-serif text-5xl leading-tight text-[#ece4d4] md:text-7xl">
            Read your position clearly, then grow with confidence
          </h1>
        </div>
      </SandyGrainBackground>
    </div>
  );
}

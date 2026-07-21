"use client";

import FannedCardDeck from "@/registry/fanned-card-deck";

export default function FannedCardDeckDemo() {
  return (
    <div className="flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 py-20">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-5xl text-white tracking-tight">
          Interface Craft
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/50 leading-relaxed">
          A working library for those committed to designing with uncommon care.
        </p>
      </div>
      <FannedCardDeck />
    </div>
  );
}

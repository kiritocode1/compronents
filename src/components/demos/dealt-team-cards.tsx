"use client";

import DealtTeamCards from "@/registry/dealt-team-cards";

export default function DealtTeamCardsDemo() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-[#171717]">
      <DealtTeamCards />
    </div>
  );
}

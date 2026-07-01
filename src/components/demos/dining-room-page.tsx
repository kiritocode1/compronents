"use client";

import DiningRoomPage from "@/registry/dining-room-page";

export default function DiningRoomPageDemo() {
  return (
    <div className="h-[760px] w-full overflow-y-auto rounded-md bg-black">
      <DiningRoomPage assetBase="/assets/dining-room-page" />
    </div>
  );
}

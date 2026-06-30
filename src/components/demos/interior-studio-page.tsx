"use client";

import InteriorStudioPage from "@/registry/interior-studio-page";

const BASE = "/assets/interior-studio-page";

export default function InteriorStudioPageDemo() {
  return (
    <div className="h-[760px] w-full overflow-y-auto rounded-md bg-[#171615]">
      <InteriorStudioPage
        heroImage={`${BASE}/hero.jpg`}
        projectImages={Array.from(
          { length: 4 },
          (_, i) => `${BASE}/project-${i + 1}.jpg`,
        )}
        processImages={Array.from(
          { length: 4 },
          (_, i) => `${BASE}/process-${i + 1}.jpg`,
        )}
      />
    </div>
  );
}

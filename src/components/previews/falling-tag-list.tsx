"use client";

import FallingTagList from "@/registry/falling-tag-list";

const SERVICES = [
  {
    name: "Silhouette",
    tags: [
      "Editorial",
      "Fashion Identity",
      "Monochrome",
      "Shadow Play",
      "Minimalism",
      "Studio Portraits",
    ],
    images: [1, 2, 3].map(
      (n) => `/assets/falling-tag-list/service_1_img_${n}.jpg`,
    ),
  },
  {
    name: "Chroma",
    tags: [
      "Color Theory",
      "Graphics",
      "Poster Design",
      "Saturation",
      "Pop Art",
      "Visual Energy",
    ],
    images: [1, 2, 3].map(
      (n) => `/assets/falling-tag-list/service_2_img_${n}.jpg`,
    ),
  },
  {
    name: "Persona",
    tags: [
      "Character Design",
      "Portraits",
      "Visual Storytelling",
      "Emotion",
      "Identity",
      "Artistic Direction",
    ],
    images: [1, 2, 3].map(
      (n) => `/assets/falling-tag-list/service_3_img_${n}.jpg`,
    ),
  },
];

export default function FallingTagListPreview() {
  return (
    <main className="h-screen w-full overflow-hidden bg-[#171717]">
      <FallingTagList services={SERVICES} />
    </main>
  );
}

"use client";

import WarpedGallery, {
  type WarpedGalleryProject,
} from "@/registry/warped-gallery";

const base = "https://ui.aryank.space/assets/warped-gallery";
function imageSrcSet(
  index: number,
  width: number,
  variants: readonly [number, number][] = [
    [512, 512],
    [1024, 1024],
    [2048, 2048],
    [4096, 4096],
  ],
) {
  return [
    ...variants.map(
      ([scale, descriptor]) =>
        `${base}/source-project-${index}-${scale}.avif ${descriptor}w`,
    ),
    `${base}/source-project-${index}.${index < 6 ? "jpg" : "avif"} ${width}w`,
  ].join(",");
}
export const warpedGalleryProjects = [
  {
    title: "Nav in motion",
    video: `${base}/nav-in-motion.mp4`,
    aspectRatio: 1.7474402730375427,
  },
  {
    title: "Lucent Drift",
    image: `${base}/source-project-1.jpg`,
    imageSrcSet: imageSrcSet(1, 7500),
    aspectRatio: 1.7009966777408638,
  },
  {
    title: "Velvet Static",
    image: `${base}/source-project-2.jpg`,
    imageSrcSet: imageSrcSet(2, 7146, [
      [1024, 1021],
      [2048, 2043],
      [4096, 4086],
    ]),
    aspectRatio: 1.7361111111111112,
  },
  {
    title: "Soft Collision",
    image: `${base}/source-project-3.jpg`,
    imageSrcSet: imageSrcSet(3, 7680),
    aspectRatio: 1.8384201077199283,
  },
  {
    title: "Phantom Layers",
    image: `${base}/source-project-4.jpg`,
    imageSrcSet: imageSrcSet(4, 3840, [
      [512, 512],
      [1024, 1024],
      [2048, 2048],
    ]),
    aspectRatio: 1.5272727272727273,
  },
  {
    title: "Liquid Echo",
    image: `${base}/source-project-5.jpg`,
    imageSrcSet: imageSrcSet(5, 8000),
    aspectRatio: 1.6611111111111112,
  },
  {
    title: "Blue Mirage",
    image: `${base}/source-project-6.avif`,
    imageSrcSet: imageSrcSet(6, 3600, [
      [512, 512],
      [1024, 1024],
      [2048, 2048],
    ]),
    aspectRatio: 1.3333333333333333,
  },
  {
    title: "Neon Bloom",
    image: `${base}/source-project-7.avif`,
    imageSrcSet: imageSrcSet(7, 6000),
    aspectRatio: 1.613888888888889,
  },
] satisfies readonly WarpedGalleryProject[];

export default function WarpedGalleryDemo() {
  return (
    <WarpedGallery
      projects={warpedGalleryProjects}
      showGrid={false}
      style={{ height: 580 }}
    />
  );
}

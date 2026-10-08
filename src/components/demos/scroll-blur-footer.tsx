"use client";

import { getHostedAssetUrl } from "@/lib/assets";
import ScrollBlurFooter from "@/registry/scroll-blur-footer";

const image = getHostedAssetUrl("scroll-blur-footer/gradient.avif");

export default function ScrollBlurFooterDemo({
  fullscreen = false,
}: {
  fullscreen?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: fullscreen ? "100dvh" : 560,
        overflow: "hidden",
        background: "#000",
      }}
    >
      <section
        data-scroll-blur-scroller=""
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The scroll region must support keyboard scrolling.
        tabIndex={0}
        aria-label="Scroll blur preview"
        style={{ height: "100%", overflowY: "auto" }}
      >
        {[0, 1].map((index) => (
          <section
            key={index}
            style={{ height: "100%", padding: 10, boxSizing: "border-box" }}
          >
            {/* biome-ignore lint/performance/noImgElement: Preserve the pinned source image without recompression. */}
            <img
              src={image}
              srcSet={`${image} 2048w`}
              sizes="calc(100vw - 20px)"
              alt="Abstract mint, white and black gradient"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 10,
                display: "block",
              }}
            />
          </section>
        ))}
      </section>
      <ScrollBlurFooter position="absolute" />
    </div>
  );
}

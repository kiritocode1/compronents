// biome-ignore-all lint/a11y/noNoninteractiveTabindex: The focusable region implements keyboard scrolling.
"use client";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createGalleryRenderer, type WarpedGalleryProject } from "./renderer";

export type { WarpedGalleryProject } from "./renderer";
export interface WarpedGalleryProps {
  projects: readonly WarpedGalleryProject[];
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  background?: string;
  titleColor?: string;
  showGrid?: boolean;
  playVideos?: boolean;
  openInNewTab?: boolean;
  mobileBreakpoint?: number;
  scrollSensitivity?: number;
}
const fontUrl =
  "https://ui.aryank.space/assets/warped-gallery/inter-variable.woff2";
const veilGradient =
  "linear-gradient(to bottom, #000 0%, rgba(0,0,0,.916) 3.25%, rgba(0,0,0,.712) 6.5%, rgba(0,0,0,.468) 9.75%, rgba(0,0,0,.25) 13%, rgba(0,0,0,.10) 16.25%, rgba(0,0,0,.024) 19.5%, rgba(0,0,0,.002) 22.75%, transparent 26%, transparent 74%, rgba(0,0,0,.002) 77.25%, rgba(0,0,0,.024) 80.5%, rgba(0,0,0,.10) 83.75%, rgba(0,0,0,.25) 87%, rgba(0,0,0,.468) 90.25%, rgba(0,0,0,.712) 93.5%, rgba(0,0,0,.916) 96.75%, #000 100%)";

/** Infinite shader-bent gallery. Size it with style/className or a sized parent. */
export function WarpedGallery({
  projects,
  className,
  style,
  "aria-label": label = "Featured projects. Scroll or drag to browse.",
  background = "#000000",
  titleColor = "#ffffff",
  showGrid = true,
  playVideos = true,
  openInNewTab = false,
  mobileBreakpoint = 649,
  scrollSensitivity = 1,
}: WarpedGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const anchorsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const root = rootRef.current,
      canvas = canvasRef.current,
      veil = veilRef.current;
    if (!root || !canvas || !veil) return;
    let renderer: ReturnType<typeof createGalleryRenderer> = null;
    try {
      renderer = createGalleryRenderer(
        root,
        canvas,
        veil,
        anchorsRef.current.filter((a) => a !== null),
        projects,
        {
          background,
          titleColor,
          showGrid,
          playVideos,
          mobileBreakpoint,
          scrollSensitivity,
        },
      );
    } catch (error) {
      console.error("WarpedGallery initialization failed.", error);
    }
    setReady(renderer !== null);
    return () => renderer?.dispose();
  }, [
    projects,
    background,
    titleColor,
    showGrid,
    playVideos,
    mobileBreakpoint,
    scrollSensitivity,
  ]);

  return (
    // biome-ignore lint/a11y/useSemanticElements: Preserve the source region and its keyboard scroll target.
    <div
      ref={rootRef}
      className={className}
      data-warped-gallery=""
      data-ready={ready}
      tabIndex={0}
      role="region"
      aria-label={label}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 1,
        minHeight: 1,
        overflow: ready ? "hidden" : "auto",
        background,
        color: titleColor,
        cursor: "grab",
        touchAction: ready ? "none" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        isolation: "isolate",
        fontFamily:
          '"WarpedGalleryInter", "InterVariable", "Inter", Arial, sans-serif',
        ...style,
      }}
    >
      <style>{`
        @font-face { font-family: "WarpedGalleryInter"; src: url("${fontUrl}") format("woff2"); font-style: normal; font-weight: 100 900; font-display: swap; }
        [data-warped-gallery] a:focus-visible { outline: 1px solid rgba(255,255,255,.8); outline-offset: -1px; }
        [data-warped-gallery] a { -webkit-tap-highlight-color: transparent; cursor: pointer; }
        [data-warped-gallery][data-dragging="true"], [data-warped-gallery][data-dragging="true"] * { cursor: grabbing !important; }
        [data-warped-gallery][data-ready="false"] a { position: relative !important; transform: none !important; width: auto !important; height: auto !important; left: auto !important; top: auto !important; margin: 16px; }
      `}</style>
      <canvas
        ref={canvasRef}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
          visibility: ready ? "visible" : "hidden",
        }}
      />
      {projects.map((project, index) => (
        <a
          key={`${index}-${project.title}`}
          ref={(node) => {
            anchorsRef.current[index] = node;
          }}
          href={project.href?.trim() || "#"}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          draggable={false}
          aria-label={`Open ${project.title}`}
          style={{
            position: "absolute",
            display: "block",
            zIndex: 1,
            background: "transparent",
            textDecoration: "none",
            color: titleColor,
            willChange: "transform",
          }}
        >
          {!ready && (
            <>
              {project.image && (
                <img
                  src={project.image}
                  alt=""
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: 300,
                    objectFit: "cover",
                  }}
                />
              )}
              {project.title}
            </>
          )}
        </a>
      ))}
      <div
        ref={veilRef}
        aria-hidden="true"
        style={{
          display: "none",
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background: veilGradient,
          visibility: ready ? "visible" : "hidden",
        }}
      />
    </div>
  );
}
export default WarpedGallery;

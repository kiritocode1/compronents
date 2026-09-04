"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import {
  type BlurStudyBoxHandle,
  DEFAULT_SETTINGS,
  type StudySettings,
} from "./engine";

export interface BlurStudyBoxProps {
  className?: string;
  /**
   * Optical and physical model. Anything left out keeps the study's own
   * value, so `{ blur: 0.2 }` changes diffusion and nothing else.
   */
  settings?: Partial<StudySettings>;
  /**
   * Device pixels per CSS pixel. Every fragment walks ninety-six volume
   * samples, so cost scales with the square of this: 2 costs four times 1.
   */
  renderScale?: number;
  /** Holds the simulation still. Reduced-motion users get this regardless. */
  paused?: boolean;
  /** Gives the host `exportPng(size, onProgress?)` for print-size renders. */
  ref?: React.Ref<{
    exportPng: (
      size: number,
      onProgress?: (step: string) => void,
    ) => Promise<void>;
  }>;
}

/**
 * A Box3D capsule study rendered as one instanced WebGPU draw. The renderer,
 * physics runtime, and PNG encoder load only after this client mounts.
 */
export default function BlurStudyBox({
  className,
  settings,
  renderScale = 1,
  paused = false,
  ref,
}: BlurStudyBoxProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewPanelRef = useRef<HTMLElement>(null);
  const handleRef = useRef<BlurStudyBoxHandle | null>(null);

  useImperativeHandle(ref, () => ({
    exportPng: async (size, onProgress) => {
      await handleRef.current?.exportPng(size, onProgress);
    },
  }));

  // Settings only reach the engine on mount, so serialise them to keep an
  // inline object literal from restarting the study on every render.
  const settingsKey = JSON.stringify(settings ?? null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const status = statusRef.current;
    const previewCanvas = previewCanvasRef.current;
    const previewPanel = previewPanelRef.current;
    if (!root || !canvas || !status || !previewCanvas || !previewPanel) return;

    let cancelled = false;
    import("./engine")
      .then(({ startBlurStudyBox }) =>
        startBlurStudyBox({
          root,
          canvas,
          status,
          previewCanvas,
          previewPanel,
          settings: {
            ...DEFAULT_SETTINGS,
            ...(JSON.parse(settingsKey) as Partial<StudySettings> | null),
          },
          renderScale,
          paused,
        }),
      )
      .then((handle) => {
        if (cancelled) handle.stop();
        else handleRef.current = handle;
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        // The status line is the only failure surface; the cause goes to the
        // console so a blank canvas is still diagnosable.
        console.error("Blur Study Box could not start.", cause);
        status.textContent = "WebGPU unavailable";
      });

    return () => {
      cancelled = true;
      handleRef.current?.stop();
      handleRef.current = null;
    };
  }, [settingsKey, renderScale, paused]);

  return (
    <main
      ref={rootRef}
      className={`blur-study-box${className ? ` ${className}` : ""}`}
    >
      <canvas
        ref={canvasRef}
        className="blur-study-box__canvas"
        aria-label="Interactive frosted pane study"
      />

      <header className="blur-study-box__masthead">
        <div className="blur-study-box__status" aria-live="polite">
          <span className="blur-study-box__status-dot" />
          <span ref={statusRef}>Initialising renderer</span>
        </div>
      </header>

      <figure ref={previewPanelRef} className="blur-study-box__preview" hidden>
        <canvas ref={previewCanvasRef} width={240} height={240} />
        <figcaption>Last verified export</figcaption>
      </figure>

      <style jsx>{`
        .blur-study-box {
          position: relative;
          width: 100%;
          min-width: 320px;
          height: 100%;
          min-height: 520px;
          overflow: hidden;
          color: #162a2a;
          background:
            radial-gradient(circle at 24% 17%, #ffffffc7, transparent 32rem),
            linear-gradient(135deg, #e3e6df, #cfd6d0);
          font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          font-synthesis: none;
          text-rendering: optimizeLegibility;
        }

        .blur-study-box::after {
          position: absolute;
          z-index: 3;
          inset: 0;
          pointer-events: none;
          content: "";
          opacity: 0.23;
          mix-blend-mode: soft-light;
          background-image:
            repeating-radial-gradient(
              circle at 20% 30%,
              transparent 0 2px,
              #1b33311f 2.5px 3px
            ),
            linear-gradient(103deg, transparent 30%, #ffffff40, transparent 68%);
          background-size:
            7px 7px,
            100% 100%;
        }

        .blur-study-box__canvas {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          cursor: grab;
          touch-action: none;
        }

        .blur-study-box.is-grabbing-body .blur-study-box__canvas {
          cursor: grabbing;
        }

        .blur-study-box__masthead {
          position: absolute;
          z-index: 5;
          top: clamp(1.25rem, 3vw, 2.75rem);
          right: clamp(1.25rem, 3.5vw, 3.75rem);
          left: clamp(1.25rem, 3.5vw, 3.75rem);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          pointer-events: none;
        }

        .blur-study-box__status {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          color: #162a2aad;
          font-size: 0.68rem;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .blur-study-box__status-dot {
          flex: 0 0 0.45rem;
          width: 0.45rem;
          height: 0.45rem;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #ce684d;
          box-shadow: 0 0 0 4px #ce684d1c;
        }

        .blur-study-box__preview {
          position: absolute;
          z-index: 5;
          bottom: clamp(1.25rem, 3vw, 2.75rem);
          left: clamp(1.25rem, 3.5vw, 3.75rem);
          width: min(13rem, 28vw);
          margin: 0;
          padding: 0.42rem;
          border: 1px solid #1b313021;
          border-radius: 0.3rem;
          background: #ebefe9a8;
          box-shadow: 0 1rem 3rem #2b3e3a1a;
          backdrop-filter: blur(14px);
        }

        .blur-study-box__preview[hidden] {
          display: none;
        }

        .blur-study-box__preview canvas {
          display: block;
          width: 100%;
          height: auto;
          background: #d9ddd6;
        }

        .blur-study-box__preview figcaption {
          padding: 0.42rem 0.2rem 0.08rem;
          color: #162a2a85;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        @media (max-width: 680px), (max-height: 520px) and (pointer: coarse) {
          .blur-study-box__masthead {
            top: max(0.75rem, env(safe-area-inset-top));
            right: max(0.75rem, env(safe-area-inset-right));
            left: max(0.75rem, env(safe-area-inset-left));
          }

          .blur-study-box__status {
            max-width: 6.5rem;
            justify-content: flex-end;
            font-size: 0.58rem;
            line-height: 1.35;
            text-align: right;
          }

          .blur-study-box__preview {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

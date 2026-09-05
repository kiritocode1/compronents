"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import {
  type BlurStudyGridHandle,
  DEFAULT_SETTINGS,
  type StudySettings,
} from "./engine";

export interface BlurStudyGridProps {
  className?: string;
  /**
   * Optical model. Anything left out keeps the study's own value, so
   * `{ blur: 0.2 }` changes diffusion and nothing else. Changing this while
   * mounted writes uniforms rather than restarting the study, so it is safe
   * to drive from a slider.
   */
  settings?: Partial<StudySettings>;
  /**
   * Device pixels per CSS pixel. Every fragment walks ninety-six volume
   * samples, so cost scales with the square of this: 2 costs four times 1.
   */
  renderScale?: number;
  /** Freezes pointer tracking. Reduced-motion users get this regardless. */
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
 * A hundred capsules on a fixed grid, each aiming at the pointer through a
 * frosted pane, rendered as one instanced WebGPU draw. The renderer and PNG
 * encoder load only after this client mounts.
 */
export default function BlurStudyGrid({
  className,
  settings,
  renderScale = 1,
  paused = false,
  ref,
}: BlurStudyGridProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewPanelRef = useRef<HTMLElement>(null);
  const handleRef = useRef<BlurStudyGridHandle | null>(null);

  useImperativeHandle(ref, () => ({
    exportPng: async (size, onProgress) => {
      await handleRef.current?.exportPng(size, onProgress);
    },
  }));

  // Serialised so an inline object literal does not look like a new value on
  // every render. This drives a uniform write, never a remount.
  const settingsKey = JSON.stringify(settings ?? null);

  // The engine mounts once. `renderScale` is the only prop that has to rebuild
  // it, because it fixes the surface's device pixel ratio.
  useEffect(() => {
    const canvas = canvasRef.current;
    const status = statusRef.current;
    const previewCanvas = previewCanvasRef.current;
    const previewPanel = previewPanelRef.current;
    if (!canvas || !status || !previewCanvas || !previewPanel) return;

    let cancelled = false;
    import("./engine")
      .then(({ startBlurStudyGrid }) =>
        startBlurStudyGrid({
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
        console.error("Blur Study Grid could not start.", cause);
        status.textContent = "WebGPU unavailable";
      });

    return () => {
      cancelled = true;
      handleRef.current?.stop();
      handleRef.current = null;
    };
    // settingsKey and paused deliberately stay out of this array: they reach
    // the running engine through the two effects below, so listing them here
    // would restart the study on every slider tick.
  }, [renderScale]);

  useEffect(() => {
    handleRef.current?.setSettings(
      (JSON.parse(settingsKey) as Partial<StudySettings> | null) ?? {},
    );
  }, [settingsKey]);

  useEffect(() => {
    handleRef.current?.setPaused(paused);
  }, [paused]);

  return (
    <main
      ref={rootRef}
      className={`blur-study-grid${className ? ` ${className}` : ""}`}
    >
      <canvas
        ref={canvasRef}
        className="blur-study-grid__canvas"
        aria-label="Interactive frosted pane study that follows the pointer"
      />

      <header className="blur-study-grid__masthead">
        <div className="blur-study-grid__status" aria-live="polite">
          <span className="blur-study-grid__status-dot" />
          <span ref={statusRef}>Initialising renderer</span>
        </div>
      </header>

      <figure ref={previewPanelRef} className="blur-study-grid__preview" hidden>
        <canvas ref={previewCanvasRef} width={240} height={240} />
        <figcaption>Last verified export</figcaption>
      </figure>

      <style jsx>{`
        .blur-study-grid {
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
        }

        .blur-study-grid::after {
          position: absolute;
          z-index: 4;
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

        .blur-study-grid__canvas {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          touch-action: none;
        }

        .blur-study-grid__masthead {
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

        .blur-study-grid__status {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          color: #162a2aad;
          font-size: 0.68rem;
          font-weight: 650;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .blur-study-grid__status-dot {
          flex: 0 0 0.45rem;
          width: 0.45rem;
          height: 0.45rem;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #ce684d;
          box-shadow: 0 0 0 4px #ce684d1c;
        }

        .blur-study-grid__preview {
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

        .blur-study-grid__preview[hidden] {
          display: none;
        }

        .blur-study-grid__preview canvas {
          display: block;
          width: 100%;
          height: auto;
          background: #d9ddd6;
        }

        .blur-study-grid__preview figcaption {
          padding: 0.42rem 0.2rem 0.08rem;
          color: #162a2a85;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        @media (max-width: 680px), (max-height: 520px) and (pointer: coarse) {
          .blur-study-grid__masthead {
            top: max(0.75rem, env(safe-area-inset-top));
            right: max(0.75rem, env(safe-area-inset-right));
            left: max(0.75rem, env(safe-area-inset-left));
          }

          .blur-study-grid__status {
            max-width: 6.5rem;
            justify-content: flex-end;
            font-size: 0.58rem;
            line-height: 1.35;
            text-align: right;
          }

          .blur-study-grid__preview {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}

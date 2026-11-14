"use client";

/**
 * Image Pixelation: an image that resolves out of large square pixels.
 *
 * Ported 1:1 from the basement.studio lab "Image pixelation" experiment
 * (pinned in reference/image-pixelation/). A 2D canvas covers the image. Each
 * step draws the image into the top-left corner at `factor`% of the canvas
 * size, then scales that corner back up over the whole canvas with smoothing
 * off. The factor walks a Fibonacci series (1, 1, 2, 3 for four steps) and
 * then 100, one step every 100ms times `stepsDuration`. After the last step
 * the canvas hides and the sharp image shows, and stays.
 *
 * Before the first play the live source shows nothing, so `initial` defaults
 * to "hidden". Canvas pixels are CSS pixels, so on a 2x display the blocks are
 * the same size as on the source.
 */

import {
  type CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export type ImagePixelationTrigger = "click" | "hover" | "inView" | "manual";

export type ImagePixelationHandle = {
  /** Run the resolve from the coarsest step. */
  play: () => void;
};

export type ImagePixelationProps = {
  src?: string;
  alt?: string;
  /** Number of Fibonacci steps before the full-resolution step, 1 to 11. */
  steps?: number;
  /** Multiplies the 100ms each step is held, 0.1 to 3. */
  stepsDuration?: number;
  /** What starts the resolve. `manual` waits for the ref's `play()`. */
  trigger?: ImagePixelationTrigger;
  /** What shows before the first play: nothing, the coarsest step, or the image. */
  initial?: "hidden" | "pixelated" | "sharp";
  /** Width over height of the box. Defaults to the image's own ratio. */
  ratio?: number;
  /** How the image fills a box whose `ratio` differs from the image's. */
  fit?: "cover" | "contain";
  onComplete?: () => void;
  className?: string;
  style?: CSSProperties;
};

const DEFAULT_SRC =
  "https://ui.aryank.space/assets/image-pixelation/beanie.jpg";

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Fibonacci terms 1..n without the leading 0: n = 4 gives 1, 1, 2, 3. */
function fibonacci(n: number) {
  const series = [0, 1];
  for (let i = 2; i < n + 1; i++) series[i] = series[i - 1] + series[i - 2];
  return series.slice(1, n + 1);
}

/** Source rect of `img` that fills a w x h box under `fit`. */
function fitRect(
  img: HTMLImageElement,
  w: number,
  h: number,
  fit: "cover" | "contain",
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale =
    fit === "cover" ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  return { sx: (iw - sw) / 2, sy: (ih - sh) / 2, sw, sh };
}

/** idle: before the first play. step: a step index is on the canvas. done: sharp. */
type Phase = { kind: "idle" } | { kind: "step"; index: number } | { kind: "done" };

const ImagePixelation = forwardRef<ImagePixelationHandle, ImagePixelationProps>(
  function ImagePixelation(
    {
      src = DEFAULT_SRC,
      alt = "",
      steps = 4,
      stepsDuration = 1,
      trigger = "inView",
      initial = "hidden",
      ratio,
      fit = "cover",
      onComplete,
      className,
      style,
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [loaded, setLoaded] = useState(false);
    const [natural, setNatural] = useState<number | null>(null);
    const [phase, setPhase] = useState<Phase>({ kind: "idle" });

    const factors = useMemo(
      () => [...fibonacci(clamp(Math.round(steps), 1, 11)), 100],
      [steps],
    );
    const holdMs = 100 * clamp(stepsDuration, 0.1, 3);

    // onComplete is read through a ref so a new callback each render does
    // not restart the step timer.
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    const draw = useCallback(
      (step: number) => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img || !img.naturalWidth) return;
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const size = factors[step] * 0.01;
        // With no `ratio` the box already has the image's ratio, so draw the
        // whole image as the source does. A custom ratio crops by `fit`.
        const r =
          ratio === undefined
            ? { sx: 0, sy: 0, sw: img.naturalWidth, sh: img.naturalHeight }
            : fitRect(img, width, height, fit);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, width * size, height * size);
        ctx.drawImage(canvas, 0, 0, width * size, height * size, 0, 0, width, height);
      },
      [factors, fit, ratio],
    );

    const play = useCallback(() => {
      if (!loaded) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        setPhase({ kind: "done" });
        onCompleteRef.current?.();
        return;
      }
      setPhase({ kind: "step", index: 0 });
    }, [loaded]);

    useImperativeHandle(ref, () => ({ play }), [play]);

    // Paint the current step, hold it, then advance or finish.
    useEffect(() => {
      if (phase.kind !== "step") return;
      draw(phase.index);
      const t = window.setTimeout(() => {
        if (phase.index + 1 < factors.length)
          setPhase({ kind: "step", index: phase.index + 1 });
        else {
          setPhase({ kind: "done" });
          onCompleteRef.current?.();
        }
      }, holdMs);
      return () => window.clearTimeout(t);
    }, [phase, factors.length, holdMs, draw]);

    // `initial="pixelated"` keeps the coarsest step painted while idle.
    useEffect(() => {
      if (!loaded || phase.kind !== "idle" || initial !== "pixelated") return;
      draw(0);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ro = new ResizeObserver(() => draw(0));
      ro.observe(canvas);
      return () => ro.disconnect();
    }, [loaded, phase.kind, initial, draw]);

    useEffect(() => {
      if (trigger !== "inView" || !loaded) return;
      const el = rootRef.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            play();
          }
        },
        { threshold: 0.4 },
      );
      io.observe(el);
      return () => io.disconnect();
    }, [trigger, loaded, play]);

    const showImage =
      phase.kind === "done" || (phase.kind === "idle" && initial === "sharp");
    const showCanvas =
      phase.kind === "step" || (phase.kind === "idle" && initial === "pixelated");
    const boxRatio = ratio ?? natural ?? 1.5;

    return (
      <div
        ref={rootRef}
        className={className}
        onClick={trigger === "click" ? play : undefined}
        onPointerEnter={trigger === "hover" ? play : undefined}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: String(boxRatio),
          overflow: "hidden",
          cursor: trigger === "click" ? "pointer" : undefined,
          ...style,
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: the canvas samples this element directly */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          onLoad={(e) => {
            const img = e.currentTarget;
            setNatural(img.naturalWidth / img.naturalHeight);
            setLoaded(true);
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            maxWidth: "none",
            objectFit: fit,
            opacity: showImage ? 1 : 0,
          }}
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: showCanvas ? 1 : 0,
            pointerEvents: "none",
          }}
        />
      </div>
    );
  },
);

export default ImagePixelation;

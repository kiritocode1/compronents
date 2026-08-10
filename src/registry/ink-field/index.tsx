"use client";

/**
 * InkField - a sumi-e ink field you can paint into.
 *
 * A reimplementation of the InkField engine's mark-making pipeline. Every mark
 * runs the same chain the original does: a spring-damped brush stamps grayscale
 * geometry, an animated force map decides which way ink creeps, a diffusion
 * shader spreads it under a rule that lets ink darken a pixel but never brighten
 * one, and a colour pass converts the finished draft to pigment at commit time.
 *
 * The stroke is grayscale until it is committed. That is the pipeline's central
 * decision: diffusion physics operate on one channel so spreading ink cannot
 * drift in hue, and colour becomes a separate mapping applied afterward.
 *
 * All ten shaders are the originals, transcribed byte-exact.
 *
 * BLANK - aryank.space
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { buildDemoStrokes, type DemoStroke } from "./autoplay";
import { type BrushModeId, InkBrushStroke } from "./brush";
import { renderBites, scanForBites } from "./bugs";
import {
  type DistortUniforms,
  InkFieldEngine,
  randomForceMapParams,
} from "./engine";
import {
  DEFAULT_EFFECTS,
  DEFAULT_FLOW,
  DEFAULT_METALLIC,
  type FlowTypeId,
  hexToRgb,
  inkSwatch,
  METAL_TINTS,
  type MetalTintId,
} from "./palette";
import { InkRandom } from "./rng";

export type { BrushModeId } from "./brush";
export type {
  FlowTypeId,
  InkModeId,
  InkSwatch,
  MetalTintId,
} from "./palette";
export {
  BLEND_MODES,
  BRUSH_SIZES,
  FLOW_TYPES,
  INK_MODES,
  INK_PALETTE,
  METAL_TINTS,
} from "./palette";

export interface InkFieldHandle {
  /** Wipes the canvas back to bare paper. */
  clear(): void;
  /** Replays the built-in demo composition. */
  playDemo(): void;
  /** Displaces committed pixels with the current flow settings. */
  applyFlow(): void;
  /** Runs the dark-pixel scan and lays a metallic etching over the artwork. */
  applyEtching(): void;
  /** Regenerates the wind map, changing how existing and future ink creeps. */
  reseedForceMap(): void;
  /** PNG data URL of the current artwork. */
  toDataURL(): string | undefined;
}

export interface InkFieldProps {
  /* ---- brush ---- */
  /** 1 Ink Brush, 2 Marker, 3 Spray Paint, 4 Dry Brush, 5 Spray Dots, 6 Flat Brush, 7 Deckle Edge. */
  brushMode?: BrushModeId;
  /** 0.1 to 5. The UI in the original labels 5 as 10x. */
  brushSize?: number;
  /** Diffusion behaviour, 0-5: Fly White, Squeeze, Marker, Salt, Bleed, Fiber. */
  inkMode?: number;
  /** Palette index 0-35. 0 is black, 1 the white brush, 29 erases, 33 uses `customColor`. */
  colorIndex?: number;
  /** Resolves palette index 33. */
  customColor?: string;
  /** Mode 0 diffusion blend weight. */
  diffusionStrength?: number;
  /** Stamp mirroring, 0-3. */
  brushDir?: number;
  /** Substeps stamped per frame. Higher is smoother and more expensive. */
  substeps?: number;

  /* ---- colour ---- */
  /** 0 Mix, 1 Multiply, 2 Darken. */
  blendMode?: number;
  /** Kubelka-Munk pigment mixing, so red over yellow gives orange, not mud. */
  spectralMix?: boolean;
  /** Per-stroke HSB jitter. */
  hueShift?: number;
  satShift?: number;
  briShift?: number;
  /** Ceiling on white-brush opacity. */
  whiteMaxOpacity?: number;

  /* ---- surface ---- */
  background?: string;
  paperTexture?: boolean;
  paperGrain?: number;

  /* ---- post effects ---- */
  distortEnabled?: boolean;
  displacementB?: number;
  displacementC?: number;
  showFbmMask?: boolean;
  resonanceEnabled?: boolean;
  rsFrequency?: number;
  rsWaveSpeed?: number;
  rsStrength?: number;
  rsGradientMix?: number;
  rsScale?: number;
  cellularEnabled?: boolean;
  cellularScale?: number;
  cellularSeed?: number;
  whiteDotEnabled?: boolean;
  whiteDotDensity?: number;
  grainEnabled?: boolean;
  grainAmount?: number;

  /* ---- flow displacement ---- */
  /** Displacement style. 0 Basic, 2 Concentric, 3 Vertical, 4 Horizontal, 5 Crack, 6 Mosaic, 7 Vortex, 8 Cellular. */
  flowType?: FlowTypeId;
  flowStrength?: number;
  flowStyle?: number;
  flowMultiDirection?: boolean;
  flowLastStrokeOnly?: boolean;
  flowColorDeep?: number;
  /** Hold the pointer still to displace the artwork under it. */
  flowOnLongPress?: boolean;
  longPressMs?: number;

  /* ---- metallic etching ---- */
  metallicStrength?: number;
  metallicFlowSpeed?: number;
  metallicFresnel?: number;
  metalTint?: MetalTintId;
  biteSize?: number;
  biteCount?: number;

  /* ---- behaviour ---- */
  /** Same seed, same demo artwork and same brush character. */
  seed?: number;
  /** Paint the demo composition on mount. */
  autoplay?: boolean;
  /** Demo points consumed per frame. */
  autoplaySpeed?: number;
  /** Accept pointer input. */
  interactive?: boolean;
  /** Cap the backing-store scale. Lower is faster on dense displays. */
  maxPixelRatio?: number;
  className?: string;
  style?: React.CSSProperties;
  onStrokeCommit?: (count: number) => void;
}

const DEFAULTS = {
  brushMode: 1 as BrushModeId,
  brushSize: 2,
  inkMode: 4,
  colorIndex: 0,
  customColor: "#FF6A3D",
  diffusionStrength: 0.45,
  brushDir: 0,
  substeps: 15,
  blendMode: 0,
  spectralMix: false,
  hueShift: -0.01,
  satShift: 0.02,
  briShift: 0.02,
  whiteMaxOpacity: 0.78,
  background: "#F4F1EA",
  paperTexture: true,
  paperGrain: 0.03,
  seed: 20260722,
  autoplay: true,
  autoplaySpeed: 1,
  interactive: true,
  maxPixelRatio: 2,
  longPressMs: 620,
  flowOnLongPress: true,
  biteCount: 10,
};

const InkField = forwardRef<InkFieldHandle, InkFieldProps>(
  function InkField(props, ref) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<InkFieldEngine | null>(null);
    const stampRef = useRef<HTMLCanvasElement | null>(null);
    const rngRef = useRef<InkRandom>(
      new InkRandom(props.seed ?? DEFAULTS.seed),
    );

    // Props are read from a ref inside the loop so changing one never restarts
    // the engine or interrupts a stroke in flight.
    const propsRef = useRef(props);
    propsRef.current = props;

    const strokeRef = useRef<InkBrushStroke | null>(null);
    /** Ink mode the live stroke was started with; demo strokes carry their own. */
    const strokeInkModeRef = useRef<number | null>(null);
    const etchingRef = useRef(false);
    const targetRef = useRef({ x: 0, y: 0 });
    const pointerDownRef = useRef(false);
    const pressStartRef = useRef({ x: 0, y: 0, t: 0, moved: false });
    const strokeCountRef = useRef(0);
    const commitPendingRef = useRef(false);

    const demoRef = useRef<{
      strokes: DemoStroke[];
      stroke: number;
      point: number;
      hold: number;
      active: boolean;
    }>({ strokes: [], stroke: 0, point: 0, hold: 0, active: false });

    const fbmSeeds = useMemo<[number, number, number, number]>(() => {
      const r = new InkRandom((props.seed ?? DEFAULTS.seed) ^ 0x5f3759df);
      return [
        r.random(0, 100),
        r.random(0, 100),
        r.random(0, 100),
        r.random(0, 100),
      ];
    }, [props.seed]);

    const get = useCallback(<K extends keyof typeof DEFAULTS>(key: K) => {
      const value = (propsRef.current as Record<string, unknown>)[
        key as string
      ];
      return (
        value === undefined ? DEFAULTS[key] : value
      ) as (typeof DEFAULTS)[K];
    }, []);

    /* ---------------- stroke lifecycle ---------------- */

    const beginStroke = useCallback(
      (x: number, y: number, override?: Partial<DemoStroke>) => {
        const rng = rngRef.current;
        const seed = Math.floor(rng.random(100000000, 999999999));

        strokeRef.current = new InkBrushStroke(rng, {
          mode: (override?.mode ?? get("brushMode")) as BrushModeId,
          baseBrushSize: override?.size ?? get("brushSize"),
          colorIndex: override?.colorIndex ?? get("colorIndex"),
          strokeSeed: seed,
          step: get("substeps"),
          brushDir: get("brushDir"),
        });
        strokeInkModeRef.current = override?.inkMode ?? null;
        targetRef.current = { x, y };
      },
      [get],
    );

    const commitStroke = useCallback(() => {
      const engine = engineRef.current;
      const stroke = strokeRef.current;
      if (!engine || !stroke) return;
      const p = propsRef.current;
      const colorIndex = stroke.opts.colorIndex;

      engine.commit({
        useSharpen: strokeInkModeRef.current ?? p.inkMode ?? DEFAULTS.inkMode,
        brushColorMode: colorIndex,
        brushCategory: colorIndex === 1 ? 1 : 0,
        baseBrushSize: stroke.opts.baseBrushSize,
        indiffusionStrength: get("diffusionStrength"),
        strokeSeed: stroke.opts.strokeSeed,
        mouseCount: stroke.mouseCount,
        mouseCountAccumulated: stroke.mouseCountAccumulated,
        keyBlendMode: get("blendMode"),
        useSpectralMix: get("spectralMix"),
        hueShift: get("hueShift"),
        satShift: get("satShift"),
        briShift: get("briShift"),
        whiteMaxOpacity: get("whiteMaxOpacity"),
        customBrushColor: hexToRgb(get("customColor")),
      });

      strokeRef.current = null;
      strokeInkModeRef.current = null;
      strokeCountRef.current += 1;
      propsRef.current.onStrokeCommit?.(strokeCountRef.current);
    }, [get]);

    /* ---------------- imperative API ---------------- */

    const doFlow = useCallback((cx?: number, cy?: number) => {
      const engine = engineRef.current;
      if (!engine) return;
      const p = propsRef.current;
      const rng = rngRef.current;
      // Restrict to a region around the press, or the whole canvas.
      const half = 0.32;
      const bounds: [number, number, number, number] =
        cx === undefined || cy === undefined
          ? [0, 0, 1, 1]
          : [
              Math.max(0, cx - half),
              Math.max(0, cy - half),
              Math.min(1, cx + half),
              Math.min(1, cy + half),
            ];

      engine.applyFlow({
        ...DEFAULT_FLOW,
        blendType: p.flowType ?? DEFAULT_FLOW.blendType,
        blendVol: p.flowStrength ?? DEFAULT_FLOW.blendVol,
        globalStyle: p.flowStyle ?? DEFAULT_FLOW.globalStyle,
        multiDir: p.flowMultiDirection ? 1 : 0,
        lastStrokeOnly: p.flowLastStrokeOnly ?? false,
        colorDeep: p.flowColorDeep ?? DEFAULT_FLOW.colorDeep,
        radSeed: rng.random(0, 1000) * 0.001,
        seed: rng.random(0, 10),
        strokeBounds: bounds,
      });
    }, []);

    const doEtching = useCallback(() => {
      const engine = engineRef.current;
      if (!engine) return;
      const p = propsRef.current;
      const rng = rngRef.current;
      const pixels = engine.readOutput();
      const targets = scanForBites(pixels, engine.width, engine.height, rng, {
        count: p.biteCount ?? DEFAULTS.biteCount,
        stride: 8,
      });
      if (targets.length === 0) return;
      const textures = renderBites(
        targets,
        engine.width,
        engine.height,
        rng,
        (p.biteSize ?? DEFAULT_METALLIC.biteSize) * engine.density,
        Math.floor(rng.random(0, 4)),
      );
      engine.setBugTextures(textures.mask, textures.data);
      etchingRef.current = true;
    }, []);

    const startDemo = useCallback(() => {
      const seed = get("seed");
      demoRef.current = {
        strokes: buildDemoStrokes(seed),
        stroke: 0,
        point: 0,
        hold: 0,
        active: true,
      };
    }, [get]);

    useImperativeHandle(
      ref,
      () => ({
        clear() {
          engineRef.current?.clearArtwork();
          strokeRef.current = null;
          etchingRef.current = false;
          demoRef.current.active = false;
          strokeCountRef.current = 0;
        },
        playDemo() {
          engineRef.current?.clearArtwork();
          strokeRef.current = null;
          etchingRef.current = false;
          startDemo();
        },
        applyFlow() {
          doFlow();
        },
        applyEtching() {
          doEtching();
        },
        reseedForceMap() {
          const engine = engineRef.current;
          if (engine) engine.forceMap = randomForceMapParams(Math.random);
        },
        toDataURL() {
          return canvasRef.current?.toDataURL("image/png");
        },
      }),
      [doFlow, doEtching, startDemo],
    );

    /* ---------------- engine lifecycle ---------------- */

    useEffect(() => {
      const host = hostRef.current;
      const canvas = canvasRef.current;
      if (!host || !canvas) return;

      let engine: InkFieldEngine;
      try {
        engine = new InkFieldEngine(canvas, {
          pixelDensity: Math.min(
            window.devicePixelRatio || 1,
            propsRef.current.maxPixelRatio ?? DEFAULTS.maxPixelRatio,
          ),
          backgroundColor: hexToRgb(
            propsRef.current.background ?? DEFAULTS.background,
          ),
          paperTexture: propsRef.current.paperTexture !== false,
          paperGrain: propsRef.current.paperGrain ?? DEFAULTS.paperGrain,
        });
      } catch {
        // No WebGL2: leave the paper-coloured host in place rather than crashing.
        return;
      }
      engineRef.current = engine;

      const stamp = document.createElement("canvas");
      stamp.width = engine.width;
      stamp.height = engine.height;
      stampRef.current = stamp;

      if (propsRef.current.autoplay !== false) startDemo();

      let raf = 0;
      let disposed = false;
      const startedAt = performance.now();

      const frame = () => {
        if (disposed) return;
        raf = requestAnimationFrame(frame);
        const engineNow = engineRef.current;
        if (!engineNow) return;

        const p = propsRef.current;
        const now = performance.now();
        const seconds = (now - startedAt) * 0.001;
        const stampCanvas = stampRef.current;
        if (!stampCanvas) return;
        const ctx = stampCanvas.getContext("2d");
        if (!ctx) return;

        /* --- demo autoplay drives the pointer target when idle --- */
        const demo = demoRef.current;
        if (demo.active && demo.hold > 0) demo.hold -= 1;
        if (demo.active && demo.hold === 0 && !pointerDownRef.current) {
          const current = demo.strokes[demo.stroke];
          if (!current) {
            demo.active = false;
          } else if (!strokeRef.current && demo.point === 0) {
            const first = current.points[0];
            beginStroke(
              first.x * engineNow.cssWidth,
              first.y * engineNow.cssHeight,
              current,
            );
            targetRef.current = {
              x: first.x * engineNow.cssWidth,
              y: first.y * engineNow.cssHeight,
            };
            demo.point = 1;
          } else if (demo.point > 0 && demo.point < current.points.length) {
            const speed = Math.max(
              1,
              Math.round(p.autoplaySpeed ?? DEFAULTS.autoplaySpeed),
            );
            const next =
              current.points[Math.min(current.points.length - 1, demo.point)];
            targetRef.current = {
              x: next.x * engineNow.cssWidth,
              y: next.y * engineNow.cssHeight,
            };
            demo.point += speed;
          } else if (demo.point >= current.points.length && strokeRef.current) {
            strokeRef.current.release();
          }
        }

        /* --- 1. CPU brush stamps this frame's marks --- */
        const stroke = strokeRef.current;
        let hasLiveStroke = false;
        if (stroke && !stroke.settling) {
          // The brush works in CSS pixels the way p5 does, so a brush size
          // covers the same visual width regardless of display density.
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, stampCanvas.width, stampCanvas.height);
          ctx.setTransform(engineNow.density, 0, 0, engineNow.density, 0, 0);
          stroke.step(ctx, targetRef.current.x, targetRef.current.y);
          engineNow.stampInto(stampCanvas);
          hasLiveStroke = true;
          if (!stroke.decay()) stroke.release();
        } else if (stroke) {
          hasLiveStroke = true;
        }

        /* --- 2. composite committed work onto paper, then tint the live draft --- */
        const colorIndex =
          stroke?.opts.colorIndex ?? p.colorIndex ?? DEFAULTS.colorIndex;
        const swatch = inkSwatch(colorIndex);
        const brushColor =
          swatch.dynamic === "custom"
            ? hexToRgb(p.customColor ?? DEFAULTS.customColor)
            : swatch.dynamic === "background"
              ? hexToRgb(p.background ?? DEFAULTS.background)
              : hexToRgb(swatch.hex);

        engineNow.composite({
          brushColorMode: colorIndex,
          brushCategory: colorIndex === 1 ? 1 : 0,
          brushColor,
          whiteMaxOpacity: p.whiteMaxOpacity ?? DEFAULTS.whiteMaxOpacity,
          hueShift: p.hueShift ?? DEFAULTS.hueShift,
          satShift: p.satShift ?? DEFAULTS.satShift,
          briShift: p.briShift ?? DEFAULTS.briShift,
          hasLiveStroke,
        });

        /* --- 3. the wind map is regenerated every frame, so it animates --- */
        engineNow.renderForceMap(seconds);

        /* --- 4. post effects --- */
        const distortU: DistortUniforms = {
          distortEnabled: p.distortEnabled ?? DEFAULT_EFFECTS.distortEnabled,
          displacementB: p.displacementB ?? DEFAULT_EFFECTS.displacementB,
          displacementC: p.displacementC ?? DEFAULT_EFFECTS.displacementC,
          showFbmMask: p.showFbmMask ?? DEFAULT_EFFECTS.showFbmMask,
          rsEnabled: p.resonanceEnabled ?? DEFAULT_EFFECTS.resonanceEnabled,
          rsFrequency: p.rsFrequency ?? DEFAULT_EFFECTS.rsFrequency,
          rsWaveSpeed: p.rsWaveSpeed ?? DEFAULT_EFFECTS.rsWaveSpeed,
          rsStrength: p.rsStrength ?? DEFAULT_EFFECTS.rsStrength,
          rsGradientMix: p.rsGradientMix ?? DEFAULT_EFFECTS.rsGradientMix,
          rsScale: p.rsScale ?? DEFAULT_EFFECTS.rsScale,
          cellularEnabled: p.cellularEnabled ?? DEFAULT_EFFECTS.cellularEnabled,
          cellularScale: p.cellularScale ?? DEFAULT_EFFECTS.cellularScale,
          cellularSeed: p.cellularSeed ?? DEFAULT_EFFECTS.cellularSeed,
          whiteDotDensity:
            (p.whiteDotEnabled ?? DEFAULT_EFFECTS.whiteDotEnabled)
              ? (p.whiteDotDensity ?? DEFAULT_EFFECTS.whiteDotDensity)
              : 0,
          grainAmount:
            (p.grainEnabled ?? DEFAULT_EFFECTS.grainEnabled)
              ? (p.grainAmount ?? DEFAULT_EFFECTS.grainAmount)
              : 0,
        };
        engineNow.distort(distortU, seconds, fbmSeeds);

        /* --- 5. metallic etching sits over the composited output --- */
        if (etchingRef.current) {
          const tint =
            METAL_TINTS.find(
              (t) => t.id === (p.metalTint ?? DEFAULT_METALLIC.tint),
            ) ?? METAL_TINTS[0];
          engineNow.applyMetallic(
            {
              strength: (p.metallicStrength ?? DEFAULT_METALLIC.strength) / 100,
              flowSpeed:
                (p.metallicFlowSpeed ?? DEFAULT_METALLIC.flowSpeed) / 50,
              fresnelStrength:
                p.metallicFresnel ?? DEFAULT_METALLIC.fresnelStrength,
              tint: tint.tint,
              lightPos: DEFAULT_METALLIC.lightPos,
            },
            now,
          );
        }

        /* --- 6. diffusion runs LAST, so it displays next frame --- */
        if (stroke) {
          engineNow.diffuse(stroke.force, {
            useSharpen:
              strokeInkModeRef.current ?? p.inkMode ?? DEFAULTS.inkMode,
            brushColorMode: stroke.opts.colorIndex,
            brushCategory: stroke.opts.colorIndex === 1 ? 1 : 0,
            baseBrushSize: stroke.opts.baseBrushSize,
            indiffusionStrength:
              p.diffusionStrength ?? DEFAULTS.diffusionStrength,
            strokeSeed: stroke.opts.strokeSeed,
            mouseCount: stroke.mouseCount,
            mouseCountAccumulated: stroke.mouseCountAccumulated,
          });
          if (stroke.settling && !stroke.settleStep())
            commitPendingRef.current = true;
        }

        engineNow.present();

        /* --- 7. commit once the settle clock has run out --- */
        if (commitPendingRef.current) {
          commitPendingRef.current = false;
          commitStroke();
          const d = demoRef.current;
          if (d.active) {
            const current = d.strokes[d.stroke];
            d.hold = current ? current.hold : 0;
            d.point = 0;
            d.stroke += 1;
            if (d.stroke >= d.strokes.length) d.active = false;
          }
        }
      };

      raf = requestAnimationFrame(frame);

      const observer = new ResizeObserver(() => {
        const e = engineRef.current;
        if (!e) return;
        if (
          e.resize({
            backgroundColor: hexToRgb(
              propsRef.current.background ?? DEFAULTS.background,
            ),
            paperTexture: propsRef.current.paperTexture !== false,
            paperGrain: propsRef.current.paperGrain ?? DEFAULTS.paperGrain,
          })
        ) {
          const s = stampRef.current;
          if (s) {
            s.width = e.width;
            s.height = e.height;
          }
          strokeRef.current = null;
          if (demoRef.current.active) startDemo();
        }
      });
      observer.observe(host);

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        observer.disconnect();
        engine.dispose();
        engineRef.current = null;
      };
    }, []);

    /* ---------------- surface changes ---------------- */

    useEffect(() => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.setBackground(
        hexToRgb(props.background ?? DEFAULTS.background),
        props.paperTexture !== false,
        props.paperGrain ?? DEFAULTS.paperGrain,
      );
    }, [props.background, props.paperTexture, props.paperGrain]);

    useEffect(() => {
      rngRef.current = new InkRandom(props.seed ?? DEFAULTS.seed);
    }, [props.seed]);

    /* ---------------- pointer ---------------- */

    const localPoint = (event: React.PointerEvent) => {
      const canvas = canvasRef.current;
      const engine = engineRef.current;
      if (!canvas || !engine) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * engine.cssWidth,
        y: ((event.clientY - rect.top) / rect.height) * engine.cssHeight,
      };
    };

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (propsRef.current.interactive === false) return;
      // Capture keeps a fast drag from escaping the canvas. Some pointers
      // cannot be captured (synthetic events, exotic input), so never let a
      // failure here abort the stroke.
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* capture is an optimisation, not a requirement */
      }
      demoRef.current.active = false;
      if (strokeRef.current) {
        strokeRef.current.release();
        commitPendingRef.current = false;
      }
      const point = localPoint(event);
      pointerDownRef.current = true;
      pressStartRef.current = {
        x: point.x,
        y: point.y,
        t: performance.now(),
        moved: false,
      };
      beginStroke(point.x, point.y);
    };

    const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerDownRef.current) return;
      const point = localPoint(event);
      targetRef.current = point;
      const press = pressStartRef.current;
      const dx = point.x - press.x;
      const dy = point.y - press.y;
      if (dx * dx + dy * dy > 36) press.moved = true;

      // A long press that never moved displaces the artwork instead of marking it.
      if (
        !press.moved &&
        (propsRef.current.flowOnLongPress ?? DEFAULTS.flowOnLongPress) &&
        performance.now() - press.t >
          (propsRef.current.longPressMs ?? DEFAULTS.longPressMs)
      ) {
        pointerDownRef.current = false;
        strokeRef.current = null;
        const engine = engineRef.current;
        if (engine)
          doFlow(press.x / engine.cssWidth, press.y / engine.cssHeight);
      }
    };

    const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerDownRef.current) return;
      pointerDownRef.current = false;
      try {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        /* see onPointerDown */
      }
      const press = pressStartRef.current;
      const held = performance.now() - press.t;
      if (
        !press.moved &&
        (propsRef.current.flowOnLongPress ?? DEFAULTS.flowOnLongPress) &&
        held > (propsRef.current.longPressMs ?? DEFAULTS.longPressMs)
      ) {
        strokeRef.current = null;
        const engine = engineRef.current;
        if (engine)
          doFlow(press.x / engine.cssWidth, press.y / engine.cssHeight);
        return;
      }
      strokeRef.current?.release();
    };

    return (
      <div
        ref={hostRef}
        className={props.className}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: props.background ?? DEFAULTS.background,
          touchAction: "none",
          cursor: props.interactive === false ? "default" : "crosshair",
          ...props.style,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%" }}
        />
      </div>
    );
  },
);

export default InkField;

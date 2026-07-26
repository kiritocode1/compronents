"use client";

/**
 * Motion Tracking - a WebGPU motion-detection effect. A looping video is run
 * through a compute shader that frame-differences successive grayscale frames
 * at quarter resolution, builds a decaying "trail" mask of where movement
 * happened, then renders that motion as tinted ASCII glyphs over the darkened
 * footage with a bloom bloompass on top.
 *
 * WebGPU only (Chrome, Edge, Safari 18+). Falls back to a message elsewhere.
 * Fills its container. Ported from Maxime Heckel's r3f playground demo.
 *
 * BLANK - aryank.space
 */

import { bloom } from "three/addons/tsl/display/BloomNode.js";
import {
  dot,
  float,
  floor,
  Fn,
  If,
  instanceIndex,
  mix,
  texture,
  textureStore,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
  wgslFn,
} from "three/tsl";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  NearestFilter,
  NeutralToneMapping,
  PostProcessing,
  SRGBColorSpace,
  StorageTexture,
  VideoTexture,
  WebGPURenderer,
} from "three/webgpu";
import { useEffect, useRef, useState } from "react";

// ponytail: default hotlinks the reference footage so the effect works 1:1 out
// of the box. Its watercolour mask is tuned for river water; re-host on Blob and
// pass `videoSrc` for production.
const DEFAULT_VIDEO =
  "https://cdn.maximeheckel.com/videos/footages/river4-compressed.mp4";

const ASCII_CHARS = " .,:-=+*%#$";

const TINTS = {
  blue: [0.0235, 0.5137, 1.1],
  green: [0.0235, 1.1, 0.35],
  red: [1.1, 0.08, 0.0235],
} as const;

// The frame-difference compute pass. Reads the video, isolates moving water
// with a saturation/luminance/non-green mask, and accumulates a decaying trail.
const motionShader = wgslFn(`
  fn computeMotion(
    sceneTexture: texture_2d<f32>,
    previousFrameReadTexture: texture_2d<f32>,
    previousFrameWriteTexture: texture_storage_2d<rgba8unorm, write>,
    trailReadTexture: texture_2d<f32>,
    trailWriteTexture: texture_storage_2d<rgba8unorm, write>,
    hasPreviousFrame: bool,
    motionThreshold: f32,
    trailDecay: f32,
    videoUvScale: vec2f,
    index: u32
  ) -> void {
    let detectionDimensions = textureDimensions(previousFrameWriteTexture);
    let pixelCount = detectionDimensions.x * detectionDimensions.y;
    if (index >= pixelCount) {
      return;
    }

    let coord = vec2u(index % detectionDimensions.x, index / detectionDimensions.x);
    let sceneDimensions = textureDimensions(sceneTexture);
    let outputUv = (vec2f(coord) + vec2f(0.5)) / vec2f(detectionDimensions);
    let coverUv = (outputUv - vec2f(0.5)) * videoUvScale + vec2f(0.5);
    let sceneUv = vec2f(coverUv.x, 1.0 - coverUv.y);
    let sceneCoord = clamp(
      vec2i(sceneUv * vec2f(sceneDimensions)),
      vec2i(0),
      vec2i(sceneDimensions) - vec2i(1)
    );
    let sceneColor = textureLoad(sceneTexture, sceneCoord, 0).rgb;
    let currentGray = dot(sceneColor, vec3f(0.299, 0.587, 0.114));

    let maxChannel = max(sceneColor.r, max(sceneColor.g, sceneColor.b));
    let minChannel = min(sceneColor.r, min(sceneColor.g, sceneColor.b));
    let saturation = (maxChannel - minChannel) / max(maxChannel, 0.0001);
    let neutralColorMask = 1.0 - smoothstep(0.125, 0.13, saturation);
    let luminanceMask = smoothstep(0.02, 0.2, currentGray);
    let greenExcess = sceneColor.g - max(sceneColor.r, sceneColor.b);
    let nonGreenMask = 1.0 - smoothstep(0.02, 0.12, greenExcess);
    let waterColorMask = neutralColorMask * luminanceMask * nonGreenMask;

    let previousValue = textureLoad(previousFrameReadTexture, vec2i(coord), 0).r;
    let difference = abs(currentGray - previousValue);

    var motionAmount = 0.0;
    if (hasPreviousFrame) {
      let thresholdedMotion = smoothstep(motionThreshold, motionThreshold * 4.0, difference);
      motionAmount = pow(thresholdedMotion, 0.5) * waterColorMask;
    }

    let previousTrailAmount = textureLoad(trailReadTexture, vec2i(coord), 0).r;
    let decayedTrailAmount = max(previousTrailAmount * trailDecay - 0.025, 0.0);
    let trailAmount = max(decayedTrailAmount, motionAmount) * waterColorMask;

    textureStore(trailWriteTexture, vec2i(coord), vec4f(vec3f(trailAmount), trailAmount));
    textureStore(previousFrameWriteTexture, vec2i(coord), vec4f(vec3f(currentGray), 1.0));
  }
`);

// Maps a motion value to a glyph from the ASCII atlas and returns its coverage.
const asciiShader = wgslFn(`
  fn asciiAtlasMotion(asciiTexture: texture_2d<f32>, paneUv: vec2f, value: f32, cols: f32) -> f32 {
    let cellUv = fract(paneUv * vec2f(cols, 96.0));
    let luma = clamp(value, 0.0, 1.0);
    let count = ${ASCII_CHARS.length}.0;
    let charIndex = clamp(floor(luma * (count - 1.0)), 0.0, count - 1.0);
    let asciiUv = vec2f((charIndex + cellUv.x) / count, 1.0 - cellUv.y);
    let asciiDimensions = textureDimensions(asciiTexture);
    let asciiCoord = clamp(
      vec2i(asciiUv * vec2f(asciiDimensions)),
      vec2i(0),
      vec2i(asciiDimensions) - vec2i(1)
    );
    return textureLoad(asciiTexture, asciiCoord, 0).r;
  }
`);

function buildAsciiAtlas(): CanvasTexture {
  const canvas = document.createElement("canvas");
  const cell = 512;
  canvas.width = cell * ASCII_CHARS.length;
  canvas.height = cell;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = `${cell}px "Space Grotesk", "MS Gothic", "Noto Sans JP", monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ASCII_CHARS.split("").forEach((char, i) => {
      ctx.fillText(char, (i + 0.5) * cell, cell / 2);
    });
  }
  const tex = new CanvasTexture(canvas);
  tex.generateMipmaps = false;
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function makeDetectionTexture(w: number, h: number): StorageTexture {
  const tex = new StorageTexture(w, h);
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  return tex;
}

export interface MotionTrackingProps {
  videoSrc?: string;
  color?: keyof typeof TINTS;
  debug?: boolean;
  /** Brightness of the grayscale footage behind the glyphs, 0 (black) to 1. */
  videoBrightness?: number;
}

export default function MotionTracking({
  videoSrc = DEFAULT_VIDEO,
  color = "blue",
  debug = false,
  videoBrightness = 0.4,
}: MotionTrackingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [supported, setSupported] = useState(true);
  const colorRef = useRef(color);
  const debugRef = useRef(debug);
  const videoBrightnessRef = useRef(videoBrightness);
  colorRef.current = color;
  debugRef.current = debug;
  videoBrightnessRef.current = videoBrightness;

  useEffect(() => {
    if (typeof navigator === "undefined" || !(navigator as Navigator & { gpu?: unknown }).gpu) {
      setSupported(false);
      return;
    }
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let disposed = false;
    let frame = 0;
    let rebuildTimer: ReturnType<typeof setTimeout> | null = null;

    const video = document.createElement("video");
    // attributes must be set before src for autoplay to be allowed
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.crossOrigin = "anonymous";
    video.src = videoSrc;

    // rVFC drives VideoTexture.needsUpdate, but only while the video plays,
    // so keep retrying play() until the footage is actually advancing.
    const tryPlay = () => {
      video.play().catch(() => {});
    };
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    // Chrome suspends media in a backgrounded tab and never resumes it, which
    // leaves a frozen frame: no frame delta, no motion, glyphs decay to nothing.
    video.addEventListener("pause", tryPlay);

    const videoTexture = new VideoTexture(video);
    videoTexture.colorSpace = SRGBColorSpace;

    const renderer = new WebGPURenderer({ canvas, antialias: false });
    renderer.toneMapping = NeutralToneMapping;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const asciiTexture = buildAsciiAtlas();
    const post = new PostProcessing(renderer);

    // uniforms shared across every rebuild
    const uHasPrev = uniform(false);
    const uShowDebug = uniform(false);
    const uThreshold = uniform(0.005);
    const uDecay = uniform(0.995);
    const uVideoBrightness = uniform(videoBrightnessRef.current);

    let prevFrames: StorageTexture[] = [];
    let trails: StorageTexture[] = [];
    // biome-ignore lint/suspicious/noExplicitAny: TSL node graph fights TS generics
    let computeNodes: any[] = [];
    let phase = 0;
    let hasPrev = false;
    let builtKey = "";

    // A gentle saturation lift, matching the reference's final grade.
    // biome-ignore lint/suspicious/noExplicitAny: TSL node graph fights TS generics
    const grade = Fn(([c]: any) => {
      const luma = dot(c, vec3(0.2125, 0.7154, 0.0721));
      return mix(vec3(luma), c, 1.05);
    });

    const disposeTextures = () => {
      for (const t of prevFrames) t.dispose();
      for (const t of trails) t.dispose();
      prevFrames = [];
      trails = [];
    };

    const build = () => {
      if (disposed) return;
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      const videoAspect = video.videoWidth / video.videoHeight || 16 / 9;

      // ponytail: a rebuild throws away the motion trail, so skip the no-op ones
      // (ResizeObserver's initial fire, a `loadedmetadata` that changes nothing).
      const key = `${width}x${height}x${videoAspect}`;
      if (key === builtKey) return;
      builtKey = key;

      renderer.setSize(width, height, false);

      const pr = renderer.getPixelRatio();
      const gw = Math.max(1, Math.floor(width * pr));
      const gh = Math.max(1, Math.floor(height * pr));
      const dw = Math.max(1, Math.floor(0.25 * gw));
      const dh = Math.max(1, Math.floor(0.25 * gh));

      const viewAspect = gw / gh;
      // cover-fit scale (uv space) so the footage fills the pane
      const fx = videoAspect > viewAspect ? viewAspect / videoAspect : 1;
      const fy = videoAspect > viewAspect ? 1 : videoAspect / viewAspect;
      const cols = Math.max(1, Math.round(96 * (gw / gh)));

      disposeTextures();
      prevFrames = [makeDetectionTexture(dw, dh), makeDetectionTexture(dw, dh)];
      trails = [makeDetectionTexture(dw, dh), makeDetectionTexture(dw, dh)];

      const compute = (readIdx: number, writeIdx: number) =>
        motionShader({
          sceneTexture: texture(videoTexture),
          previousFrameReadTexture: texture(prevFrames[readIdx]),
          previousFrameWriteTexture: textureStore(prevFrames[writeIdx]).toWriteOnly(),
          trailReadTexture: texture(trails[readIdx]),
          trailWriteTexture: textureStore(trails[writeIdx]).toWriteOnly(),
          hasPreviousFrame: uHasPrev,
          motionThreshold: uThreshold,
          trailDecay: uDecay,
          videoUvScale: vec2(fx, fy),
          index: instanceIndex,
        }).compute(dw * dh, [8]);

      const grid = vec2(cols, 96);

      const display = (readIdx: number) => {
        const node = Fn(() => {
          const paneUv = uv();
          const coverUv = paneUv.sub(0.5).mul(vec2(fx, fy)).add(0.5);
          const videoUv = vec2(coverUv.x, float(1).sub(coverUv.y));
          const videoColor = texture(videoTexture, videoUv).rgb;
          // grayscale footage sitting behind the glyph field
          const gray = dot(videoColor, vec3(0.299, 0.587, 0.114));
          const base = vec3(gray).mul(uVideoBrightness);
          const out = base.toVar();

          // one motion sample per ASCII cell -> blocky glyph field
          const cellUv = floor(paneUv.mul(grid)).add(0.5).div(grid);
          const motionValue = texture(trails[readIdx], cellUv).r;
          const glyph = asciiShader({
            asciiTexture: texture(asciiTexture),
            paneUv,
            value: motionValue,
            cols: float(cols),
          });

          const t = TINTS[colorRef.current] ?? TINTS.blue;
          const tint = vec3(t[0] ** 2.2, t[1] ** 2.2, t[2] ** 2.2);
          const glyphColor = mix(tint, vec3(1), glyph as never);

          const debugValue = texture(trails[readIdx], paneUv).a;
          If(uShowDebug, () => {
            out.assign(vec3(debugValue));
          }).Else(() => {
            out.assign(mix(base, glyphColor, motionValue));
          });

          return vec4((grade as unknown as (...a: unknown[]) => never)(out), 1);
          // biome-ignore lint/suspicious/noExplicitAny: TSL node graph fights TS generics
        })() as any;
        return node.add((bloom as (...a: unknown[]) => unknown)(node, 0.75, 0.15, 0.19));
      };

      computeNodes = [compute(0, 1), compute(1, 0)];
      phase = 0;
      hasPrev = false;
      uHasPrev.value = false;

      // PostProcessing compiles `outputNode` into its quad material once and only
      // recompiles when `needsUpdate` is set, so assigning it per frame does
      // nothing. Publish it here instead: without the flag the pipeline stays
      // latched on the pre-rebuild graph, keeps sampling the trail textures this
      // build just disposed, reads zeros, and the glyphs vanish for good while
      // the video keeps rendering.
      post.outputNode = display(1) as never;
      post.needsUpdate = true;
    };

    const render = () => {
      frame = requestAnimationFrame(render);
      if (!computeNodes.length || video.readyState < 2) return;
      videoTexture.needsUpdate = true;
      uHasPrev.value = hasPrev;
      uShowDebug.value = debugRef.current;
      uVideoBrightness.value = videoBrightnessRef.current;
      renderer.compute(computeNodes[phase]);
      renderer.clear();
      post.render();
      hasPrev = true;
      phase = 1 - phase;
    };

    const start = async () => {
      await renderer.init();
      if (disposed) return;
      build();
      video.play().catch(() => {});
      render();
    };

    const onMeta = () => build();
    video.addEventListener("loadedmetadata", onMeta);

    const resizeObserver = new ResizeObserver(() => {
      if (rebuildTimer) clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(build, 150);
    });
    resizeObserver.observe(root);

    start().catch(() => setSupported(false));

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      if (rebuildTimer) clearTimeout(rebuildTimer);
      resizeObserver.disconnect();
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("pause", tryPlay);
      video.pause();
      video.src = "";
      disposeTextures();
      asciiTexture.dispose();
      videoTexture.dispose();
      post.dispose?.();
      renderer.dispose();
    };
  }, [videoSrc]);

  return (
    <div className="mt-root" ref={rootRef}>
      <style>{styles}</style>
      <canvas className="mt-canvas" ref={canvasRef} />
      {!supported && (
        <div className="mt-fallback">
          This effect needs WebGPU. Open in Chrome, Edge, or Safari 18+.
        </div>
      )}
    </div>
  );
}

const styles = `
.mt-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: #000;
}

.mt-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.mt-fallback {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #9fb4ff;
  font-family: "DM Mono", ui-monospace, monospace;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
}
`;

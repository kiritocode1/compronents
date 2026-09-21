"use client";

/**
 * Video Summagator - a moving image, unfolded into time.
 *
 * A clip is sampled into N evenly spaced frames and stacked along Z as a single
 * `Data3DTexture`. The cube you orbit is that texture: width and height are the
 * picture, depth is the running time. A fragment shader ray-marches it, so the
 * front face is the first frame, the back face is the last, and the smear
 * between them is every frame in the clip integrated along the view ray.
 *
 * The selected frame is the boundary between two behaviours. Everything after it
 * is opaque, so it reads as a solid surface with a 1px outline; everything before
 * it is transparent and accumulates. Scrubbing time slides that boundary through
 * the cube.
 *
 * The component carries no control panel of its own. Every live value is a prop
 * and every one-shot action is a method on the ref, so the controls live wherever
 * the host puts them.
 *
 * BLANK - aryank.space
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  abortError,
  createVolumeTexture,
  maxVolumeDepth,
  type SampledVolume,
  sampleVideo,
} from "./sampler";
import { VOLUME_FRAGMENT_SHADER, VOLUME_VERTEX_SHADER } from "./volume-shader";

const SAMPLE_VIDEO_URL =
  "https://ui.aryank.space/assets/video-summagator/sample.mp4";

/** Width below which the component lays out for a phone. */
const COMPACT_WIDTH = 760;

/** Length of the opening reveal, in ms. */
const VOLUME_REVEAL_MS = 800;

/** Half-extent of the longest image axis. Depth is driven by the depth prop. */
const IMAGE_HALF = 1.35;

export type QualityTier = 96 | 160 | 240;

/** Readout for the host: what the decode actually produced. */
export interface VolumeInfo {
  label: string;
  duration: number;
  sourceWidth: number;
  sourceHeight: number;
  count: number;
  width: number;
  height: number;
  bytes: number;
}

export interface VideoSummagatorHandle {
  /** Jumps the playhead to a time in seconds and pauses. */
  seek(seconds: number): void;
  /** Moves one sampled frame forward or back and pauses. */
  stepFrame(direction: 1 | -1): void;
  /** Returns the camera to its opening three-quarter view. */
  resetCamera(): void;
  /** Looks straight down -Z, so the volume reads as a single flat frame. */
  frontView(): void;
}

export interface VideoSummagatorProps {
  /** Clip loaded on mount. Must be same-origin or CORS-readable to be sampled. */
  src?: string;
  /** Name for the current clip, reported back through `onReady`. */
  sampleLabel?: string;
  eyebrow?: string;
  title?: string;
  tagline?: string;
  /** Frames sampled out of the clip. Changing it re-decodes. */
  quality?: QualityTier;
  playing?: boolean;
  /** Playback rate while `playing`. */
  speed?: number;
  /** Depth of the volume in world units: how far time is stretched. */
  depth?: number;
  /** Extinction of the transparent region before the selected frame. */
  density?: number;
  brightness?: number;
  /** Draws the 1px outline around the selected frame. */
  showFrame?: boolean;
  autoRotate?: boolean;
  /** Fires at most every 100ms while the playhead moves. */
  onTimeChange?: (time: number, duration: number) => void;
  /** Fires when a clip finishes decoding. */
  onReady?: (info: VolumeInfo) => void;
  /** Decode failures, cancellations and WebGL trouble. Null clears. */
  onMessage?: (message: string | null) => void;
  /** Fires when playback should stop, e.g. after a keyboard scrub. */
  onPlayingChange?: (playing: boolean) => void;
  /** Fires while a clip is decoding. */
  onBusyChange?: (busy: boolean) => void;
  className?: string;
}

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${String(minutes).padStart(2, "0")}:${seconds.toFixed(2).padStart(5, "0")}`;
}

/** Progressive volume shown while frames are still decoding. */
interface LoadingVisual {
  previousHalf: THREE.Vector3;
  texture: THREE.Data3DTexture;
  progress: number;
  target: number;
  onSettled: (() => void) | null;
}

const VideoSummagator = forwardRef<VideoSummagatorHandle, VideoSummagatorProps>(
  function VideoSummagator(
    {
      src = SAMPLE_VIDEO_URL,
      sampleLabel = "Flowers · CC0 sample",
      eyebrow = "SPACE / TIME STUDY",
      title = "Video Summagator",
      tagline = "A moving image, unfolded into time.",
      quality = 160,
      playing = false,
      speed = 1,
      depth = 3,
      density = 0.1,
      brightness = 1,
      showFrame = true,
      autoRotate = false,
      onTimeChange,
      onReady,
      onMessage,
      onPlayingChange,
      onBusyChange,
      className = "",
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewRef = useRef<HTMLCanvasElement>(null);
    const startLabelRef = useRef<HTMLDivElement>(null);
    const endLabelRef = useRef<HTMLDivElement>(null);
    // Written straight to the DOM: these two change every frame during playback,
    // and routing them through state would re-render the host at 60fps.
    const timecodeRef = useRef<HTMLOutputElement>(null);
    const captionRef = useRef<HTMLElement>(null);

    const [compact, setCompact] = useState(false);
    const [state, setState] = useState<"loading" | "ready" | "error">(
      "loading",
    );

    // Props the render loop reads every frame, mirrored so the loop never closes
    // over a stale render.
    const live = useRef({
      playing,
      speed,
      depth,
      density,
      brightness,
      showFrame,
      autoRotate,
    });
    live.current = {
      playing,
      speed,
      depth,
      density,
      brightness,
      showFrame,
      autoRotate,
    };

    // Callbacks in a ref for the same reason: the scene effect must not re-run
    // because the host passed a new inline function.
    const handlers = useRef({
      onTimeChange,
      onReady,
      onMessage,
      onPlayingChange,
      onBusyChange,
    });
    handlers.current = {
      onTimeChange,
      onReady,
      onMessage,
      onPlayingChange,
      onBusyChange,
    };

    // Everything three.js owns. One ref so the effect can tear it all down.
    const gl = useRef<{
      renderer: THREE.WebGLRenderer | null;
      scene: THREE.Scene | null;
      camera: THREE.OrthographicCamera | null;
      orbit: OrbitControls | null;
      mesh: THREE.Mesh | null;
      wire: THREE.LineSegments | null;
      material: THREE.ShaderMaterial | null;
      texture: THREE.Data3DTexture | null;
      half: THREE.Vector3;
      volume: SampledVolume | null;
      previewImage: ImageData | null;
      selectedFrame: number;
      time: number;
      loadingVisual: LoadingVisual | null;
      volumeRevealStarted: number;
      volumeReveal: number;
      animation: number;
      lastTick: number;
      lastUi: number;
      drawRequested: boolean;
      disposed: boolean;
      contextLost: boolean;
      ready: boolean;
      compact: boolean;
      loadController: AbortController | null;
    }>({
      renderer: null,
      scene: null,
      camera: null,
      orbit: null,
      mesh: null,
      wire: null,
      material: null,
      texture: null,
      half: new THREE.Vector3(IMAGE_HALF, 0.76, depth / 2),
      volume: null,
      previewImage: null,
      selectedFrame: -1,
      time: 0,
      loadingVisual: null,
      volumeRevealStarted: 0,
      volumeReveal: 1,
      animation: 0,
      lastTick: 0,
      lastUi: 0,
      drawRequested: true,
      disposed: false,
      contextLost: false,
      ready: false,
      compact: false,
      loadController: null,
    });

    const tickRef = useRef<(now: number) => void>(() => {});

    const requestDraw = useCallback(() => {
      const g = gl.current;
      g.drawRequested = true;
      if (!g.animation && !g.disposed && !document.hidden) {
        g.animation = requestAnimationFrame(tickRef.current);
      }
    }, []);

    /** Cancels the opening reveal so a scrub never fights the animation. */
    const finishReveal = useCallback(() => {
      gl.current.volumeRevealStarted = 0;
      gl.current.volumeReveal = 1;
    }, []);

    const updateShape = useCallback(() => {
      const g = gl.current;
      g.half.z = live.current.depth / 2;
      g.mesh?.scale.copy(g.half).multiplyScalar(2);
      g.wire?.scale.copy(g.half).multiplyScalar(2);
      requestDraw();
    }, [requestDraw]);

    const resetCamera = useCallback(() => {
      const g = gl.current;
      if (!g.camera || !g.orbit) return;
      g.camera.position.set(4.7, 2.8, 5.2);
      g.camera.zoom = 1;
      g.camera.updateProjectionMatrix();
      g.orbit.target.set(0, 0, 0);
      g.orbit.update();
      requestDraw();
    }, [requestDraw]);

    const frontView = useCallback(() => {
      const g = gl.current;
      if (!g.camera || !g.orbit) return;
      g.camera.position.set(0, 0, 7);
      g.orbit.target.set(0, 0, 0);
      g.orbit.update();
      requestDraw();
    }, [requestDraw]);

    const seek = useCallback(
      (seconds: number) => {
        const g = gl.current;
        finishReveal();
        g.time = THREE.MathUtils.clamp(seconds, 0, g.volume?.duration ?? 0);
        requestDraw();
      },
      [finishReveal, requestDraw],
    );

    const stepFrame = useCallback(
      (direction: 1 | -1) => {
        const g = gl.current;
        if (!g.volume) return;
        seek(g.time + direction * (g.volume.duration / (g.volume.count - 1)));
        handlers.current.onPlayingChange?.(false);
        handlers.current.onTimeChange?.(g.time, g.volume.duration);
      },
      [seek],
    );

    useImperativeHandle(
      ref,
      () => ({ seek, stepFrame, resetCamera, frontView }),
      [seek, stepFrame, resetCamera, frontView],
    );

    // ---------------------------------------------------------------- load ---

    const loadClip = useCallback(
      async (url: string, label: string, requested: QualityTier) => {
        const g = gl.current;
        g.loadController?.abort();

        const controller = new AbortController();
        g.loadController = controller;
        const { signal } = controller;

        const previousHalf = g.half.clone();

        handlers.current.onPlayingChange?.(false);
        handlers.current.onBusyChange?.(true);
        handlers.current.onMessage?.(null);
        g.volumeRevealStarted = 0;
        g.volumeReveal = 1;

        // Until the first frame lands there is nothing to shade, so show the cage.
        if (g.wire && !g.ready) {
          g.wire.visible = true;
          if (g.mesh) g.mesh.visible = false;
          requestDraw();
        }

        try {
          const maxDepth = maxVolumeDepth(g.renderer);
          const volume = await sampleVideo(url, {
            quality: Math.min(requested, maxDepth),
            maxEdge: g.compact ? 256 : 320,
            signal,
            onGeometry: (w, h, c, ratio, data) => {
              if (!g.renderer || g.contextLost || !g.material) return;
              // The frame size is known and the buffer exists, so hand the GPU a
              // texture now and re-upload it as the seek loop fills it in.
              g.loadingVisual = {
                previousHalf,
                texture: createVolumeTexture(data, w, h, c),
                progress: 0,
                target: 0,
                onSettled: null,
              };
              g.half.x = ratio >= 1 ? IMAGE_HALF : IMAGE_HALF * ratio;
              g.half.y = ratio >= 1 ? IMAGE_HALF / ratio : IMAGE_HALF;
              g.material.uniforms.uVideo.value = g.loadingVisual.texture;
              g.material.uniforms.uTextureSize.value.set(w, h, c);
              if (g.mesh) g.mesh.visible = false;
              updateShape();
            },
            onProgress: (fraction) => {
              const visual = g.loadingVisual;
              if (!visual) return;
              visual.target = fraction;
              // Snap on the first frame (and with reduced motion) so the volume
              // does not ease up from nothing before anything has decoded.
              if (
                visual.progress === 0 ||
                matchMedia("(prefers-reduced-motion: reduce)").matches
              ) {
                visual.progress = fraction;
              }
              visual.texture.needsUpdate = true;
              if (g.mesh) g.mesh.visible = true;
              requestDraw();
            },
          });

          if (signal.aborted || g.disposed) throw abortError();

          // Let the growing volume finish its expansion before it becomes the
          // selected-frame view, so the two animations do not overlap.
          await settleLoadingVisual(signal);
          if (signal.aborted || g.disposed) throw abortError();

          g.volume = volume;
          g.selectedFrame = -1;

          const preview = previewRef.current;
          if (preview) {
            preview.width = volume.width;
            preview.height = volume.height;
            g.previewImage =
              preview
                .getContext("2d")
                ?.createImageData(volume.width, volume.height) ?? null;
          }

          const ratio = volume.sourceWidth / volume.sourceHeight;
          g.half.x = ratio >= 1 ? IMAGE_HALF : IMAGE_HALF * ratio;
          g.half.y = ratio >= 1 ? IMAGE_HALF / ratio : IMAGE_HALF;

          g.time = 0.42 * volume.duration;

          installTexture(g.loadingVisual?.texture ?? null);
          updateShape();

          g.ready = true;
          setState(g.renderer && !g.contextLost ? "ready" : "error");
          clearLoadingVisual(true);

          const reduced = matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          g.volumeReveal = reduced ? 1 : 0;
          g.volumeRevealStarted = reduced ? 0 : performance.now();

          handlers.current.onReady?.({
            label,
            duration: volume.duration,
            sourceWidth: volume.sourceWidth,
            sourceHeight: volume.sourceHeight,
            count: volume.count,
            width: volume.width,
            height: volume.height,
            bytes: volume.data.byteLength,
          });
          handlers.current.onTimeChange?.(g.time, volume.duration);
          requestDraw();
        } catch (error) {
          const err = error as Error;
          if (err.name !== "AbortError") {
            handlers.current.onMessage?.(err.message);
            if (!g.ready) {
              setState("error");
              if (captionRef.current) {
                captionRef.current.textContent =
                  "Load a readable video to begin.";
              }
            }
          } else if (g.loadController === controller && !g.disposed) {
            handlers.current.onMessage?.(
              g.ready
                ? "Import cancelled. Previous clip kept."
                : "Import cancelled. Choose a clip to begin.",
            );
          }
        } finally {
          if (g.loadController === controller) {
            clearLoadingVisual();
            g.loadController = null;
            handlers.current.onBusyChange?.(false);
            requestDraw();
          }
        }
      },
      [requestDraw, updateShape],
    );

    function settleLoadingVisual(signal: AbortSignal) {
      const g = gl.current;
      if (signal.aborted) return Promise.reject(abortError());
      const visual = g.loadingVisual;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (
        !visual ||
        reduced ||
        document.hidden ||
        g.contextLost ||
        visual.progress >= 1
      ) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve, reject) => {
        const finish = () => {
          visual.onSettled = null;
          signal.removeEventListener("abort", finish);
          document.removeEventListener("visibilitychange", hidden);
          if (signal.aborted) reject(abortError());
          else resolve();
        };
        const hidden = () => {
          if (document.hidden) finish();
        };
        visual.onSettled = finish;
        signal.addEventListener("abort", finish, { once: true });
        document.addEventListener("visibilitychange", hidden);
        requestDraw();
      });
    }

    function installTexture(decoded: THREE.Data3DTexture | null) {
      const g = gl.current;
      if (!g.renderer || !g.volume || g.contextLost || !g.material) return;
      const previous = g.texture;
      g.texture =
        decoded ??
        createVolumeTexture(
          g.volume.data,
          g.volume.width,
          g.volume.height,
          g.volume.count,
        );
      g.material.uniforms.uVideo.value = g.texture;
      g.material.uniforms.uTextureSize.value.set(
        g.volume.width,
        g.volume.height,
        g.volume.count,
      );
      if (previous && previous !== g.texture) previous.dispose();
    }

    function clearLoadingVisual(committed = false) {
      const g = gl.current;
      const visual = g.loadingVisual;
      if (!visual) return;
      if (visual.texture !== g.texture) visual.texture.dispose();
      if (!committed) g.half.copy(visual.previousHalf);
      g.loadingVisual = null;
      if (g.material) {
        g.material.uniforms.uLoaded.value = 1;
        g.material.uniforms.uVideo.value = g.texture;
        if (g.volume) {
          g.material.uniforms.uTextureSize.value.set(
            g.volume.width,
            g.volume.height,
            g.volume.count,
          );
        }
      }
      if (g.mesh) g.mesh.visible = Boolean(g.texture);
      updateShape();
    }

    // -------------------------------------------------------------- scene ----

    useEffect(() => {
      const g = gl.current;
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      const root = rootRef.current;
      if (!canvas || !stage || !root) return;

      g.disposed = false;

      const axisPoint = new THREE.Vector3();

      function resize() {
        if (!g.renderer || !g.camera || !g.material || g.disposed) return;
        const w = stage!.clientWidth;
        const h = stage!.clientHeight;
        if (!w || !h) return;
        g.renderer.setPixelRatio(
          Math.min(window.devicePixelRatio || 1, 1.5, 1600 / Math.max(w, h)),
        );
        g.renderer.setSize(w, h, false);
        g.material.uniforms.uCssViewport.value.set(w, h);
        g.renderer.getDrawingBufferSize(
          g.material.uniforms.uDrawingBufferSize.value,
        );
        // Fit the shorter axis with an orthographic frustum, keeping user zoom.
        const aspect = w / h;
        const halfHeight = (g.compact ? 2.4 : 2.75) / Math.min(aspect, 1);
        g.camera.left = -halfHeight * aspect;
        g.camera.right = halfHeight * aspect;
        g.camera.top = halfHeight;
        g.camera.bottom = -halfHeight;
        g.camera.updateProjectionMatrix();
        requestDraw();
      }

      function updateLabels() {
        if (!g.camera || !stage) return;
        const rect = stage.getBoundingClientRect();
        const pairs: [HTMLDivElement | null, number, string][] = [
          [startLabelRef.current, g.half.z, "0.00s"],
          [
            endLabelRef.current,
            -g.half.z,
            `${(g.volume?.duration ?? 0).toFixed(2)}s →`,
          ],
        ];
        for (const [element, z, label] of pairs) {
          if (!element) continue;
          axisPoint.set(g.half.x + 0.06, -g.half.y - 0.1, z).project(g.camera);
          element.textContent = label;
          element.style.left = `${THREE.MathUtils.clamp(
            (axisPoint.x * 0.5 + 0.5) * rect.width,
            8,
            Math.max(8, rect.width - element.offsetWidth - 8),
          )}px`;
          element.style.top = `${THREE.MathUtils.clamp(
            (-axisPoint.y * 0.5 + 0.5) * rect.height,
            8,
            Math.max(8, rect.height - element.offsetHeight - 8),
          )}px`;
        }
      }

      function updatePreview() {
        const volume = g.volume;
        const preview = previewRef.current;
        if (!volume || !preview || !g.previewImage) return;
        const index = Math.min(
          volume.count - 1,
          Math.max(
            0,
            Math.round((g.time / volume.duration) * (volume.count - 1)),
          ),
        );
        if (index !== g.selectedFrame) {
          g.selectedFrame = index;
          g.previewImage.data.set(
            volume.data.subarray(
              index * volume.frameBytes,
              (index + 1) * volume.frameBytes,
            ),
          );
          preview.getContext("2d")?.putImageData(g.previewImage, 0, 0);
          if (captionRef.current) {
            captionRef.current.textContent = `Sample ${String(index + 1).padStart(3, "0")} / ${volume.count}`;
          }
        }
        if (timecodeRef.current) {
          timecodeRef.current.textContent = formatTime(g.time);
        }
      }

      function draw() {
        g.drawRequested = false;
        updatePreview();
        if (!g.renderer || !g.camera || !g.scene || !g.material) return;
        if ((!g.ready && !g.loadController) || g.contextLost) return;

        const params = live.current;
        const u = g.material.uniforms;
        const total = g.volume?.duration ?? 1;
        u.uTime.value = g.loadingVisual ? 0 : g.time / total;
        u.uLoaded.value = g.loadingVisual ? g.loadingVisual.progress : 1;
        u.uAvailable.value = g.loadingVisual ? g.loadingVisual.target : 1;
        u.uReveal.value = g.volumeReveal;
        u.uFrame.value = params.showFrame && !g.loadingVisual;
        u.uDensity.value = params.density;
        u.uBrightness.value = params.brightness;

        g.camera.updateMatrixWorld();
        // Project the selected frame's four corners into CSS pixels so the shader
        // can stroke its outline at a constant width whatever the zoom.
        for (let i = 0; i < 4; i++) {
          axisPoint
            .set(
              i === 0 || i === 3 ? -g.half.x : g.half.x,
              i < 2 ? -g.half.y : g.half.y,
              g.half.z * (1 - 2 * (u.uTime.value as number)),
            )
            .project(g.camera);
          (u.uFrameCorners.value as THREE.Vector2[])[i].set(
            (axisPoint.x * 0.5 + 0.5) * canvas!.clientWidth,
            (axisPoint.y * 0.5 + 0.5) * canvas!.clientHeight,
          );
        }

        g.renderer.render(g.scene, g.camera);
        updateLabels();
      }

      function tick(now: number) {
        g.animation = 0;
        if (document.hidden || g.disposed) return;
        const dt = g.lastTick ? Math.min((now - g.lastTick) / 1000, 0.1) : 0;
        g.lastTick = now;
        const params = live.current;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

        const visual = g.loadingVisual;
        if (visual && visual.progress < visual.target) {
          visual.progress +=
            (visual.target - visual.progress) * (1 - Math.exp(-22 * dt));
          if (reduced || visual.target - visual.progress < 0.0005) {
            visual.progress = visual.target;
          }
          g.drawRequested = true;
          if (visual.progress === 1) visual.onSettled?.();
        }

        if (g.volumeRevealStarted) {
          const progress = Math.min(
            (now - g.volumeRevealStarted) / VOLUME_REVEAL_MS,
            1,
          );
          g.volumeReveal = progress * progress * (3 - 2 * progress);
          if (progress >= 1) g.volumeRevealStarted = 0;
          g.drawRequested = true;
        }

        if (g.ready && params.playing && g.volume) {
          g.time = (g.time + dt * params.speed) % g.volume.duration;
          g.drawRequested = true;
        }

        if (g.orbit) {
          g.orbit.autoRotate = params.autoRotate;
          if (g.orbit.update(dt)) g.drawRequested = true;
        }

        if (g.drawRequested) draw();

        // The playhead moves every frame; the host needs it ~10 times a second.
        if (now - g.lastUi > 100 && params.playing && g.volume) {
          handlers.current.onTimeChange?.(g.time, g.volume.duration);
          g.lastUi = now;
        }

        if (
          params.playing ||
          params.autoRotate ||
          g.drawRequested ||
          g.volumeRevealStarted ||
          (visual && visual.progress < visual.target)
        ) {
          if (!g.animation) g.animation = requestAnimationFrame(tick);
        } else if (!g.animation) {
          g.lastTick = 0;
        }
      }

      tickRef.current = tick;

      try {
        g.renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        });
        g.renderer.setClearColor(0x050505, 1);
        g.renderer.outputColorSpace = THREE.SRGBColorSpace;
        g.renderer.toneMapping = THREE.NoToneMapping;

        g.scene = new THREE.Scene();
        g.camera = new THREE.OrthographicCamera(
          -2.75,
          2.75,
          2.75,
          -2.75,
          0.05,
          80,
        );

        g.orbit = new OrbitControls(g.camera, canvas);
        g.orbit.enableDamping = false;
        g.orbit.enablePan = false;
        g.orbit.minZoom = 0.45;
        g.orbit.maxZoom = 2.5;
        g.orbit.autoRotateSpeed = 0.6;
        g.orbit.addEventListener("change", requestDraw);

        g.material = new THREE.ShaderMaterial({
          glslVersion: THREE.GLSL3,
          side: THREE.BackSide,
          depthWrite: false,
          uniforms: {
            uVideo: { value: null },
            uHalf: { value: g.half },
            uTextureSize: { value: new THREE.Vector3(1, 1, 1) },
            uTime: { value: 0.42 },
            uLoaded: { value: 1 },
            uAvailable: { value: 1 },
            uReveal: { value: 1 },
            uDensity: { value: live.current.density },
            uBrightness: { value: live.current.brightness },
            uFrame: { value: live.current.showFrame },
            uCssViewport: { value: new THREE.Vector2(1, 1) },
            uDrawingBufferSize: { value: new THREE.Vector2(1, 1) },
            uFrameCorners: {
              value: Array.from({ length: 4 }, () => new THREE.Vector2()),
            },
          },
          vertexShader: VOLUME_VERTEX_SHADER,
          fragmentShader: VOLUME_FRAGMENT_SHADER,
        });

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        g.mesh = new THREE.Mesh(geometry, g.material);
        g.scene.add(g.mesh);

        g.wire = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({
            color: 0xd6d6d1,
            transparent: true,
            opacity: 0.3,
            depthTest: false,
          }),
        );
        g.wire.renderOrder = 2;
        g.scene.add(g.wire);

        resetCamera();
        updateShape();
        resize();
      } catch {
        g.renderer?.dispose();
        g.renderer = null;
        setState("error");
        handlers.current.onMessage?.(
          "WebGL 2 is unavailable. You can still load a clip and inspect its sampled frames.",
        );
      }

      // ------------------------------------------------------ listeners ------

      const events = new AbortController();
      const { signal } = events;

      canvas.addEventListener(
        "keydown",
        (event) => {
          if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
            event.preventDefault();
            g.volumeRevealStarted = 0;
            g.volumeReveal = 1;
            if (event.key === " ") {
              handlers.current.onPlayingChange?.(!live.current.playing);
            } else if (g.volume) {
              g.time = THREE.MathUtils.clamp(
                g.time +
                  (event.key === "ArrowLeft" ? -1 : 1) *
                    (g.volume.duration / (g.volume.count - 1)),
                0,
                g.volume.duration,
              );
              handlers.current.onPlayingChange?.(false);
              handlers.current.onTimeChange?.(g.time, g.volume.duration);
            }
            requestDraw();
          } else if (event.key.toLowerCase() === "r") {
            resetCamera();
          }
        },
        { signal },
      );

      canvas.addEventListener(
        "webglcontextlost",
        (event) => {
          event.preventDefault();
          g.contextLost = true;
          setState("error");
          handlers.current.onMessage?.(
            "Graphics paused. The sampled frame is still available while graphics recover.",
          );
        },
        { signal },
      );

      canvas.addEventListener(
        "webglcontextrestored",
        () => {
          g.contextLost = false;
          installTexture(null);
          setState("ready");
          handlers.current.onMessage?.(null);
          requestDraw();
        },
        { signal },
      );

      document.addEventListener(
        "visibilitychange",
        () => {
          cancelAnimationFrame(g.animation);
          g.animation = 0;
          g.lastTick = 0;
          if (!document.hidden) requestDraw();
        },
        { signal },
      );

      const observer = new ResizeObserver(() => {
        const width = root.clientWidth;
        const nextCompact = width > 0 && width < COMPACT_WIDTH;
        if (nextCompact !== g.compact) {
          g.compact = nextCompact;
          setCompact(nextCompact);
        }
        resize();
      });
      observer.observe(root);
      observer.observe(stage);

      return () => {
        g.disposed = true;
        cancelAnimationFrame(g.animation);
        g.animation = 0;
        g.loadController?.abort();
        events.abort();
        observer.disconnect();
        g.loadingVisual?.texture.dispose();
        g.orbit?.dispose();
        g.texture?.dispose();
        g.mesh?.geometry.dispose();
        g.material?.dispose();
        g.wire?.geometry.dispose();
        (g.wire?.material as THREE.Material | undefined)?.dispose();
        g.renderer?.dispose();
        g.volume = null;
        g.ready = false;
      };
    }, [requestDraw, resetCamera, updateShape]);

    // Decoding is expensive, so it re-runs only for a new clip or sample count.
    useEffect(() => {
      loadClip(src, sampleLabel, quality);
    }, [loadClip, quality, sampleLabel, src]);

    // Depth resizes the box; the rest are uniforms the next draw picks up.
    useEffect(() => {
      updateShape();
    }, [updateShape]);

    useEffect(() => {
      if (playing) {
        finishReveal();
        gl.current.lastTick = 0;
      }
      requestDraw();
    }, [playing, finishReveal, requestDraw]);

    return (
      <div
        className={`vsum-root ${compact ? "is-compact" : ""} ${className}`}
        data-state={state}
        ref={rootRef}
      >
        <style>{styles}</style>

        <header className="vsum-header">
          <span className="vsum-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{tagline}</p>
        </header>

        <div className="vsum-stage" ref={stageRef}>
          <canvas
            aria-label="Video time cube. Arrow keys step through time, space plays."
            className="vsum-canvas"
            ref={canvasRef}
            tabIndex={0}
          />
          <div className="vsum-axis" ref={startLabelRef}>
            0.00s
          </div>
          <div className="vsum-axis" ref={endLabelRef}>
            TIME →
          </div>
        </div>

        <figure className="vsum-preview">
          <div className="vsum-preview-top">
            <span>SELECTED FRAME</span>
            <output className="vsum-timecode" ref={timecodeRef}>
              00:00.00
            </output>
          </div>
          <canvas aria-label="Selected video frame" ref={previewRef} />
          <figcaption ref={captionRef} />
        </figure>

        <footer className="vsum-footer">
          <p>
            {compact
              ? "Drag to orbit · Pinch to zoom"
              : "Drag to orbit · Scroll to zoom · ← → step through time · Space to play"}
          </p>
        </footer>
      </div>
    );
  },
);

export default VideoSummagator;

const styles = `
.vsum-root {
  --vsum-background: #050505;
  --vsum-text: #efefed;
  --vsum-muted: #a0a09d;
  --vsum-accent: #eac38b;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--vsum-background);
  color: var(--vsum-text);
  color-scheme: dark;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-text-size-adjust: 100%;
}

.vsum-root *,
.vsum-root *::before,
.vsum-root *::after {
  box-sizing: border-box;
}

.vsum-header {
  position: absolute;
  top: 32px;
  left: 36px;
  z-index: 2;
  pointer-events: none;
}

.vsum-eyebrow {
  color: var(--vsum-muted);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: .17em;
}

.vsum-header h1 {
  font-size: 24px;
  font-weight: 450;
  letter-spacing: -.045em;
  margin: 12px 0 8px;
}

.vsum-header p {
  color: var(--vsum-muted);
  font-size: 12px;
  margin: 0;
}

.vsum-stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.vsum-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  cursor: grab;
  outline: none;
}

.vsum-canvas:active {
  cursor: grabbing;
}

.vsum-canvas:focus-visible {
  outline: 2px solid var(--vsum-accent);
  outline-offset: -2px;
}

.vsum-axis {
  position: absolute;
  color: #aaa;
  font: 10px ui-monospace, monospace;
  padding: 5px 7px;
  background: #050505c9;
  pointer-events: none;
  opacity: 0;
}

.vsum-root[data-state="ready"] .vsum-axis {
  opacity: 1;
}

.vsum-preview {
  position: absolute;
  left: 36px;
  bottom: 80px;
  margin: 0;
  width: 184px;
  pointer-events: none;
  z-index: 2;
}

.vsum-preview-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font: 9px ui-monospace, monospace;
  color: var(--vsum-muted);
}

.vsum-timecode {
  color: var(--vsum-accent);
}

.vsum-preview canvas {
  display: block;
  width: 100%;
  max-height: 125px;
  object-fit: contain;
  object-position: left;
  border: 1px solid #333;
  background: #141414;
}

.vsum-preview figcaption {
  font: 9px ui-monospace, monospace;
  color: #969690;
  margin-top: 7px;
  min-height: 1em;
}

.vsum-footer {
  position: absolute;
  left: 36px;
  right: 36px;
  bottom: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  z-index: 2;
}

.vsum-footer p {
  font-size: 10px;
  color: #999994;
  margin: 0;
  line-height: 1.8;
}

/* Compact: tighter margins, smaller thumbnail, no eyebrow. */
.vsum-root.is-compact .vsum-header {
  left: 20px;
  top: 18px;
  right: 20px;
}

.vsum-root.is-compact .vsum-eyebrow { display: none; }

.vsum-root.is-compact .vsum-header h1 {
  margin: 0 0 6px;
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: -.03em;
}

.vsum-root.is-compact .vsum-header p {
  font-size: 11px;
  line-height: 1.5;
}

.vsum-root.is-compact .vsum-preview {
  left: 20px;
  bottom: 56px;
  width: 100px;
}

.vsum-root.is-compact .vsum-preview canvas { max-height: 76px; }
.vsum-root.is-compact .vsum-preview-top { font-size: 10px; margin-bottom: 6px; }
.vsum-root.is-compact .vsum-preview-top span { display: none; }
.vsum-root.is-compact .vsum-preview figcaption { font-size: 9px; white-space: nowrap; }

.vsum-root.is-compact .vsum-footer {
  left: 20px;
  right: 20px;
  bottom: 18px;
}

.vsum-root.is-compact .vsum-footer p { font-size: 11px; line-height: 1.7; }
`;

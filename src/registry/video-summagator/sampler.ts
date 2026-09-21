/**
 * Decoding a video into a 3D texture.
 *
 * There is no browser API that hands you every frame of a video, so the sampler
 * seeks to N evenly spaced timestamps, draws each one into a 2D canvas, and
 * packs the RGBA bytes into a single buffer laid out as w x h x frames. That
 * buffer becomes a `Data3DTexture`, which is the whole trick: once the clip is
 * a 3D texture, a fragment shader can read any (x, y, time) the same way it
 * reads any (x, y) of a photo.
 *
 * Seeking is serial and each seek is a promise, so decoding a 240-sample volume
 * is 240 round trips through the video element. That is why the caller gets
 * progress callbacks and an AbortSignal rather than one long await.
 *
 * BLANK - aryank.space
 */

import * as THREE from "three";

/** Longest a single seek or metadata load may take before the clip is rejected. */
const MEDIA_TIMEOUT_MS = 15_000;

/** Ceiling on one decoded volume. 240 samples of 320x180 RGBA is about 55 MiB. */
const MAX_VOLUME_BYTES = 40 * 1024 * 1024;

export interface SampledVolume {
  /** Interleaved RGBA bytes, frame-major: frame i starts at i * frameBytes. */
  data: Uint8Array;
  width: number;
  height: number;
  count: number;
  frameBytes: number;
  duration: number;
  /** Native pixel size of the source, for the readout. */
  sourceWidth: number;
  sourceHeight: number;
}

export interface SampleOptions {
  /** Requested sample count. Clamped to the GPU's MAX_3D_TEXTURE_SIZE. */
  quality: number;
  /** Longest edge of a decoded frame, in pixels. */
  maxEdge: number;
  signal: AbortSignal;
  /**
   * Fires once the decoded geometry is known and the buffer is allocated, before
   * the first seek. The caller gets the live buffer so it can upload a 3D texture
   * that fills in as frames land, rather than waiting for the whole decode.
   */
  onGeometry?: (
    width: number,
    height: number,
    count: number,
    ratio: number,
    data: Uint8Array,
  ) => void;
  /** Called as frames land, so the caller can grow the volume while it decodes. */
  onProgress?: (fraction: number, partial: Uint8Array) => void;
}

export function abortError() {
  return new DOMException("Import cancelled", "AbortError");
}

/**
 * Resolves when `event` fires on the video, rejecting on error, timeout or abort.
 * `action` runs after the listeners are attached so a synchronous seek cannot
 * fire before anything is listening.
 */
function mediaEvent(
  video: HTMLVideoElement,
  event: string,
  signal: AbortSignal,
  action?: () => void,
) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const timeout = setTimeout(
      () =>
        finish(
          new Error(
            "Video decoding timed out. Try an MP4 (H.264) or WebM file.",
          ),
        ),
      MEDIA_TIMEOUT_MS,
    );
    const done = () => finish();
    const failed = () =>
      finish(
        new Error(
          "This video cannot be decoded. Try an MP4 (H.264) or WebM file.",
        ),
      );
    const aborted = () => finish(abortError());

    function finish(error?: Error) {
      clearTimeout(timeout);
      video.removeEventListener(event, done);
      video.removeEventListener("error", failed);
      signal.removeEventListener("abort", aborted);
      if (error) reject(error);
      else resolve();
    }

    video.addEventListener(event, done, { once: true });
    video.addEventListener("error", failed, { once: true });
    signal.addEventListener("abort", aborted, { once: true });
    try {
      action?.();
    } catch (error) {
      finish(error as Error);
    }
  });
}

/**
 * Wraps a packed buffer as a 3D texture.
 *
 * The bytes are sRGB but the colour space is declared `NoColorSpace`: WebGL has
 * no sRGB internal format for 3D textures that is safe across drivers, so the
 * shader decodes to linear itself in `linearRGB`.
 */
export function createVolumeTexture(
  pixels: Uint8Array,
  width: number,
  height: number,
  frames: number,
) {
  const texture = new THREE.Data3DTexture(pixels, width, height, frames);
  texture.format = THREE.RGBAFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.wrapR = THREE.ClampToEdgeWrapping;
  texture.unpackAlignment = 1;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Largest 3D texture depth the GPU will accept, or a conservative guess. */
export function maxVolumeDepth(renderer: THREE.WebGLRenderer | null) {
  if (!renderer) return 256;
  const gl = renderer.getContext() as WebGL2RenderingContext;
  return gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) as number;
}

/**
 * Seeks through `url` and packs the sampled frames into one RGBA buffer.
 *
 * Progress is reported against the buffer itself, not a copy, so the caller can
 * hand the same allocation to the GPU and re-upload it as more frames arrive.
 */
export async function sampleVideo(
  url: string,
  { quality, maxEdge, signal, onGeometry, onProgress }: SampleOptions,
): Promise<SampledVolume> {
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";

  try {
    await mediaEvent(video, "loadeddata", signal, () => {
      video.src = url;
      video.load();
    });

    if (
      !Number.isFinite(video.duration) ||
      video.duration <= 0 ||
      video.videoWidth <= 0 ||
      video.videoHeight <= 0
    ) {
      throw new Error("This file has no readable video duration or image.");
    }

    const count = Math.max(2, Math.round(quality));
    const sourceWidth = video.videoWidth;
    const sourceHeight = video.videoHeight;

    // Two independent caps: a longest-edge tier, and a byte budget that keeps a
    // high sample count from multiplying into hundreds of megabytes.
    const sizeScale = Math.min(
      1,
      maxEdge / Math.max(sourceWidth, sourceHeight),
      Math.sqrt(MAX_VOLUME_BYTES / (count * 4 * sourceWidth * sourceHeight)),
    );
    const width = Math.max(2, Math.round(sourceWidth * sizeScale));
    const height = Math.max(2, Math.round(sourceHeight * sizeScale));
    const frameBytes = width * height * 4;
    const data = new Uint8Array(frameBytes * count);

    const scratch = document.createElement("canvas");
    scratch.width = width;
    scratch.height = height;
    const ctx = scratch.getContext("2d", { willReadFrequently: true });
    if (!ctx)
      throw new Error("This browser cannot decode video frames to a canvas.");

    onGeometry?.(width, height, count, sourceWidth / sourceHeight, data);

    // Stop a hair short of the duration: seeking to exactly `duration` lands
    // past the last frame in several browsers and returns a blank image.
    const endTime = Math.max(
      0,
      video.duration - Math.min(0.04, video.duration * 0.01),
    );
    let lastReport = 0;

    for (let i = 0; i < count; i++) {
      if (signal.aborted) throw abortError();
      const target = (endTime * i) / (count - 1);
      if (Math.abs(video.currentTime - target) > 0.00001) {
        await mediaEvent(video, "seeked", signal, () => {
          video.currentTime = target;
        });
      }
      ctx.drawImage(video, 0, 0, width, height);
      data.set(ctx.getImageData(0, 0, width, height).data, i * frameBytes);

      const now = performance.now();
      if (i === 0 || i === count - 1 || now - lastReport >= 100) {
        onProgress?.((i + 1) / count, data);
        lastReport = now;
      }
    }

    return {
      data,
      width,
      height,
      count,
      frameBytes,
      duration: video.duration,
      sourceWidth,
      sourceHeight,
    };
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
}

"use client";

/**
 * Unfocused - an image or video with a directional lens blur. Blur strength
 * grows from `origin` along `angle`, each pixel averages 24 jittered samples
 * on a disc, red and blue are sampled apart for chromatic dispersion, and a
 * static grain is mixed in. On mount the blur, grain and distortion run from
 * full to zero over `duration`, so the media comes into focus.
 *
 * The parent sets the size: the component fills it.
 *
 * BLANK - aryank.space
 */

import { type CSSProperties, useEffect, useRef } from "react";

const DEFAULT_IMAGE = "https://ui.aryank.space/assets/unfocused/arch-dark.avif";
const DEFAULT_ALT =
  "A white sphere suspended among curved black metallic ribbons.";

const FALLOFF = { linear: 0, quadratic: 1, cubic: 2, square: 3 } as const;
const NOISE_BLEND = { none: 0, lighter: 1, darker: 2, both: 3 } as const;

export interface UnfocusedProps {
  /** Image or video URL. Cross-origin media needs CORS headers. */
  src?: string;
  type?: "image" | "video";
  /** Image description, read as the canvas label. */
  alt?: string;
  /** Loop the video. */
  loop?: boolean;
  fit?: "cover" | "contain";
  /** Blur strength, 0 to 1000. */
  blur?: number;
  /** Direction the blur grows in, degrees. */
  angle?: number;
  /** 0 blurs evenly; 1 ramps from sharp at the origin to full blur. */
  falloff?: number;
  /** Ramp curve. `linear` is a smoothstep, `square` is a square root. */
  falloffType?: keyof typeof FALLOFF;
  /** Where the ramp starts, 0 to 1 from the left. */
  originX?: number;
  /** Where the ramp starts, 0 to 1 from the bottom. */
  originY?: number;
  /** Radial lens distortion, -1 to 1. */
  distortion?: number;
  /** Red and blue split, 0 to 1. Scales with blur. */
  dispersion?: number;
  /** Grain amount, 0 to 1. */
  noise?: number;
  /** Where the grain shows: everywhere, in darks, in lights, or midtones. */
  noiseBlend?: keyof typeof NOISE_BLEND;
  /** Animate from the blurred state into focus on mount. */
  appear?: boolean;
  /** Seconds the focus pull takes. */
  duration?: number;
  /** Cubic bezier for the focus pull. */
  ease?: readonly [number, number, number, number];
  className?: string;
  style?: CSSProperties;
}

// Shaders are the source's, verbatim. The blur jitter hashes vUv, so even
// last-bit differences in the interpolated uv change the grain; the plane,
// camera and matrices below therefore follow the source's OGL scene exactly.
const VERTEX = `
    precision mediump float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec2 uMediaSize;
    uniform vec2 uPanelSize;
    uniform int uFitMode; // 0: contain, 1: cover
    varying vec2 vUv;
    varying vec2 vTextureCoord;

    void main() {
        vUv = uv;

        if (uFitMode == 1) {
            vec2 ratio = vec2(
                min((uPanelSize.x / uPanelSize.y) / (uMediaSize.x / uMediaSize.y), 1.0),
                min((uPanelSize.y / uPanelSize.x) / (uMediaSize.y / uMediaSize.x), 1.0)
            );
            vTextureCoord = (uv - 0.5) * ratio + 0.5;
        } else {
            vTextureCoord = uv;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const FRAGMENT = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec2 uMediaSize;
    uniform vec2 uPanelSize;

    uniform float uBlur;
    uniform float uFalloff;
    uniform float uFalloffType;
    uniform float uAngle;
    uniform vec2 uCenter;
    uniform float uDispersion;
    uniform float uNoise;
    uniform float uNoiseBlend;
    uniform float uScale;
    uniform vec2 uOrigin;

    varying vec2 vUv;
    varying vec2 vTextureCoord;

    const float PI2 = 6.28318530718;
    const int SAMPLES = 24;
    const float INV_SAMPLES = 1.0 / float(SAMPLES);
    const vec3 LUMA_WEIGHTS = vec3(0.299, 0.587, 0.114);
    const float MAX_DIST = 0.70710678118;

    float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 uv) {
        return rand(uv) * 2.0 - 1.0;
    }

    vec2 applyRadialScale(vec2 uv, float scale) {
        vec2 fromCenter = uv - 0.5;
        float distance = length(fromCenter);

        if (distance < 0.001) return uv;

        float normalizedDistance = distance * 1.41421356237;
        float transformedDistance = pow(normalizedDistance, scale) * MAX_DIST;

        return 0.5 + normalize(fromCenter) * transformedDistance;
    }

    float calculateNoiseLuminanceFactor(float luminance, int blendMode) {
        if (blendMode == 0) return 1.0;

        float smoothLum = smoothstep(0.2, 0.8, luminance);

        if (blendMode == 1) {
            return 1.0 - smoothLum * smoothLum;
        } else if (blendMode == 2) {
            return smoothLum * smoothLum;
        } else if (blendMode == 3) {
            float centerBias = 1.0 - abs(luminance - 0.5) * 2.0;
            return max(pow(centerBias, 1.5), 0.1);
        }

        return 1.0;
    }

    float applyFalloff(float t, int falloffType) {
        if (falloffType == 1) return t * t;
        if (falloffType == 2) return t * t * t;
        if (falloffType == 3) return sqrt(t);
        return smoothstep(0.0, 1.0, t);
    }

    void main() {
        if (uBlur <= 0.0) {
            gl_FragColor = texture2D(uTexture, vTextureCoord);
            return;
        }

        vec2 scaledTextureCoord = applyRadialScale(vTextureCoord, 1.0 + uScale * 0.2);
        vec2 gradientDirection = vec2(cos(uAngle), sin(uAngle));

        vec2 fromOrigin = vUv - uOrigin;
        float projectionOnGradient = dot(fromOrigin, gradientDirection);
        float falloffDistance = clamp(max(projectionOnGradient, 0.0) / 0.7, 0.0, 1.0);

        int falloffType = int(uFalloffType + 0.5);
        float falloffCurve = applyFalloff(falloffDistance, falloffType);
        float reversedFalloff = 1.0 - falloffCurve;
        float blurStrength = mix(uBlur, reversedFalloff * uBlur, clamp(uFalloff, 0.0, 1.0));

        float dispersionFalloffStrength = mix(uDispersion, reversedFalloff * uDispersion, clamp(uFalloff, 0.0, 1.0));
        float dispersionStrength = dispersionFalloffStrength * blurStrength * 0.5;
        vec2 texelSize = 1.0 / uMediaSize;
        vec2 panelTexelRatio = uPanelSize / uMediaSize;
        float baseRadius = blurStrength * max(texelSize.x, texelSize.y) * max(panelTexelRatio.x, panelTexelRatio.y) * 0.5;
        vec2 dispersionDirection = vec2(-sin(uAngle), cos(uAngle));

        vec2 redOffset = dispersionDirection * dispersionStrength * texelSize * -0.7;
        vec2 blueOffset = dispersionDirection * dispersionStrength * texelSize * 0.7;

        vec3 channelColors = vec3(0.0);
        float totalWeight = 0.0;

        bool hasNoise = uNoise > 0.0;
        float noiseInfluence = uNoise * 0.3;

        for (int i = 0; i < SAMPLES; i++) {
            float fi = float(i);
            float angle = fi * INV_SAMPLES * PI2;
            vec2 circleDir = vec2(cos(angle), sin(angle));

            float randomOffset = rand(vec2(fi, vUv.x + vUv.y)) * 0.5 + 0.5;

            if (hasNoise) {
                float noiseValue = noise(vUv + vec2(fi * 0.1));
                randomOffset += noiseValue * noiseInfluence;
            }
            randomOffset = clamp(randomOffset, 0.1, 1.0);

            vec2 baseSampleOffset = circleDir * baseRadius * randomOffset;
            float baseWeight = 1.0 - smoothstep(0.0, 1.0, length(baseSampleOffset) / baseRadius);

            if (hasNoise) {
                float weightNoise = noise(vUv + vec2(fi * 0.05 + 13.7));
                baseWeight *= (1.0 + weightNoise * uNoise * 0.2);
            }
            baseWeight = max(baseWeight, 0.0);

            vec2 sampleCoord = clamp(scaledTextureCoord + baseSampleOffset, 0.0, 1.0);
            vec4 centerSample = texture2D(uTexture, sampleCoord);
            vec4 redSample = texture2D(uTexture, clamp(sampleCoord + redOffset, 0.0, 1.0));
            vec4 blueSample = texture2D(uTexture, clamp(sampleCoord + blueOffset, 0.0, 1.0));

            float weight = baseWeight;
            channelColors.r += redSample.r * redSample.a * weight;
            channelColors.g += centerSample.g * centerSample.a * weight;
            channelColors.b += blueSample.b * blueSample.a * weight;
            totalWeight += weight;
        }

        vec4 fallbackColor = texture2D(uTexture, scaledTextureCoord);
        channelColors = (totalWeight > 0.0) ? channelColors / totalWeight : fallbackColor.rgb * fallbackColor.a;

        if (hasNoise) {
            float finalNoise = noise(vUv * 10.0 + vec2(31.4, 17.2));
            float luminance = dot(channelColors, LUMA_WEIGHTS);

            float noiseStrength = uNoise;
            int blendMode = int(uNoiseBlend + 0.5);

            if (blendMode > 0) {
                float luminanceFactor = calculateNoiseLuminanceFactor(luminance, blendMode);
                noiseStrength *= luminanceFactor;
            }

            float adjustedNoise = finalNoise;
            if (blendMode == 3) {
                if (luminance > 0.8) {
                    adjustedNoise = abs(finalNoise) * sign(finalNoise) * 0.3;
                } else if (luminance < 0.2) {
                    adjustedNoise *= 0.5;
                }
            }

            vec3 noiseContribution = vec3(adjustedNoise * noiseStrength * 0.1);
            channelColors = clamp(channelColors + noiseContribution, 0.0, 1.0);
        }

        float finalAlpha = max(fallbackColor.a, (blurStrength > 0.0) ? min(blurStrength * 0.01, 1.0) : 0.0);
        gl_FragColor = vec4(channelColors, finalAlpha);
    }
`;

/**
 * Cubic bezier easing as motion solves it: 12 bisection steps to 1e-7. Kept
 * as is so the focus pull hits the same values on the same frames.
 */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const calc = (t: number, a1: number, a2: number) =>
    (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
  if (x1 === y1 && x2 === y2) return (x: number) => x;
  const tForX = (x: number) => {
    let lo = 0;
    let hi = 1;
    let t = 0;
    let cur = 0;
    let i = 0;
    do {
      t = lo + (hi - lo) / 2;
      cur = calc(t, x1, x2) - x;
      if (cur > 0) hi = t;
      else lo = t;
    } while (Math.abs(cur) > 1e-7 && ++i < 12);
    return t;
  };
  return (x: number) => (x === 0 || x === 1 ? x : calc(tForX(x), y1, y2));
}

/** Plane size for the media in the panel: the panel for cover, letterboxed for contain. */
function fitSize(mw: number, mh: number, pw: number, ph: number, fit: string) {
  const ma = mw / mh;
  if (fit === "contain")
    return ma > pw / ph ? { w: pw, h: pw / ma } : { w: ph * ma, h: ph };
  return { w: pw, h: ph };
}

/** Camera distance; the fov is set so a plane of panel size fills the view. */
const CAMERA_Z = 1000;

/**
 * OGL's Plane: positions in px around the origin, uv (0, 0) bottom left, two
 * indexed triangles.
 */
function planePositions(w: number, h: number) {
  const pos = new Float32Array(12);
  let i = 0;
  for (let iy = 0; iy <= 1; iy++) {
    const y = iy * h - h / 2;
    for (let ix = 0; ix <= 1; ix++, i++) {
      const x = ix * w - w / 2;
      pos[i * 3] = x;
      pos[i * 3 + 1] = -y;
      pos[i * 3 + 2] = 0;
    }
  }
  return pos;
}
const PLANE_UV = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);
const PLANE_INDEX = new Uint16Array([0, 2, 1, 2, 3, 1]);
/** Camera at z = CAMERA_Z looking down -z; the mesh sits at the origin. */
const MODEL_VIEW = new Float32Array([
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  -CAMERA_Z,
  1,
]);

/** OGL's perspective, with the fov round-tripped through degrees as the source does. */
function projection(w: number, h: number) {
  const fovDeg = 2 * Math.atan(h / 2 / CAMERA_Z) * (180 / Math.PI);
  const fov = fovDeg * (Math.PI / 180);
  const near = 1;
  const far = 2000;
  const f = 1 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / (w / h),
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    -1,
    0,
    0,
    2 * far * near * nf,
    0,
  ]);
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function Unfocused({
  src = DEFAULT_IMAGE,
  type = "image",
  alt = src === DEFAULT_IMAGE ? DEFAULT_ALT : "",
  loop = true,
  fit = "cover",
  blur = 200,
  angle = 45,
  falloff = 1,
  falloffType = "linear",
  originX = 0,
  originY = 0.5,
  distortion = 0.3,
  dispersion = 0.4,
  noise = 1,
  noiseBlend = "darker",
  appear = true,
  duration = 2,
  ease = [0.44, 0, 0.56, 1],
  className,
  style,
}: UnfocusedProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const params = {
    fit,
    blur,
    angle,
    falloff,
    falloffType,
    originX,
    originY,
    distortion,
    dispersion,
    noise,
    noiseBlend,
  };
  const paramsRef = useRef(params);
  paramsRef.current = params;
  /** Re-renders with the latest props; set once the GL scene exists. */
  const redraw = useRef(() => {});
  const [e1, e2, e3, e4] = ease;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // A fresh canvas per run: a context lost in cleanup cannot be reused.
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    if (type === "video") canvas.setAttribute("aria-hidden", "true");
    else {
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", alt);
    }
    root.appendChild(canvas);
    const attrs: WebGLContextAttributes = {
      alpha: true,
      depth: true,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    };
    const gl2 = canvas.getContext("webgl2", attrs);
    const gl: WebGLRenderingContext | null =
      gl2 ?? canvas.getContext("webgl", attrs);
    if (!gl) {
      canvas.remove();
      return;
    }
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      canvas.remove();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.remove();
      return;
    }
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
    gl.useProgram(program);

    const attrib = (name: string, size: number) => {
      const buffer = gl.createBuffer();
      const at = gl.getAttribLocation(program, name);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(at);
      gl.vertexAttribPointer(at, size, gl.FLOAT, false, 0, 0);
      return buffer;
    };
    const posBuffer = attrib("position", 3);
    gl.bindBuffer(gl.ARRAY_BUFFER, attrib("uv", 2));
    gl.bufferData(gl.ARRAY_BUFFER, PLANE_UV, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, PLANE_INDEX, gl.STATIC_DRAW);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      projection: u("projectionMatrix"),
      modelView: u("modelViewMatrix"),
      media: u("uMediaSize"),
      panel: u("uPanelSize"),
      fitMode: u("uFitMode"),
      tex: u("uTexture"),
      blur: u("uBlur"),
      angle: u("uAngle"),
      falloff: u("uFalloff"),
      falloffType: u("uFalloffType"),
      scale: u("uScale"),
      dispersion: u("uDispersion"),
      noise: u("uNoise"),
      noiseBlend: u("uNoiseBlend"),
      origin: u("uOrigin"),
    };

    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc.tex, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let media: HTMLImageElement | HTMLVideoElement | null = null;
    let mw = 0;
    let mh = 0;
    let pw = 0;
    let ph = 0;
    let alive = true;
    // 1 is fully blurred, 0 in focus. Blur, grain and distortion scale by it.
    let progress = 1;
    let animating = false;
    let raf = 0;

    const upload = () => {
      if (!media) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        media,
      );
    };

    const draw = () => {
      if (!media || !mw || !mh || !pw || !ph) return;
      const p = paramsRef.current;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const cw = Math.floor(pw * dpr);
      const ch = Math.floor(ph * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      if (media instanceof HTMLVideoElement) upload();
      const plane = fitSize(mw, mh, pw, ph, p.fit);
      gl.viewport(0, 0, cw, ch);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        planePositions(plane.w, plane.h),
        gl.DYNAMIC_DRAW,
      );
      gl.uniformMatrix4fv(loc.projection, false, projection(pw, ph));
      gl.uniformMatrix4fv(loc.modelView, false, MODEL_VIEW);
      gl.uniform2f(loc.media, mw, mh);
      gl.uniform2f(loc.panel, pw, ph);
      gl.uniform1i(loc.fitMode, p.fit === "cover" ? 1 : 0);
      gl.uniform1f(loc.blur, p.blur * progress);
      gl.uniform1f(loc.angle, (p.angle * Math.PI) / 180);
      gl.uniform1f(loc.falloff, p.falloff);
      gl.uniform1f(loc.falloffType, FALLOFF[p.falloffType]);
      gl.uniform1f(loc.scale, p.distortion * progress);
      gl.uniform1f(loc.dispersion, p.dispersion);
      gl.uniform1f(loc.noise, p.noise * progress);
      gl.uniform1f(loc.noiseBlend, NOISE_BLEND[p.noiseBlend]);
      gl.uniform2f(loc.origin, p.originX, p.originY);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
    redraw.current = draw;

    // One loop drives the focus pull and video frames; it stops when neither
    // needs a new frame.
    const easeFn = bezier(e1, e2, e3, e4);
    let t0 = -1;
    const frame = (now: number) => {
      raf = 0;
      if (!alive) return;
      let skip = false;
      if (animating) {
        if (t0 < 0) t0 = now;
        // Elapsed time in whole ms, as motion's updateTime rounds it.
        const x = duration > 0 ? Math.round(now - t0) / (duration * 1000) : 1;
        progress = 1 - easeFn(Math.min(1, x));
        // The source stops drawing on the frame its tween completes, so the
        // resting frame is the last eased one, a hair short of focus.
        if (x >= 1) {
          animating = false;
          skip = true;
        }
      }
      const playing =
        media instanceof HTMLVideoElement && !media.paused && !media.ended;
      if (!skip || playing) draw();
      if (animating || playing) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && alive) raf = requestAnimationFrame(frame);
    };
    if (appear) {
      animating = true;
      wake();
    }

    const onSize = () => {
      pw = root.clientWidth;
      ph = root.clientHeight;
      draw();
    };
    const ro = new ResizeObserver(onSize);
    ro.observe(root);
    onSize();

    const isVideo = type === "video";
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      isVideo ? gl.LINEAR : gl.LINEAR_MIPMAP_LINEAR,
    );
    if (isVideo) {
      const v = document.createElement("video");
      v.crossOrigin = "anonymous";
      v.muted = true;
      v.loop = loop;
      v.autoplay = true;
      v.playsInline = true;
      v.preload = "auto";
      v.setAttribute("playsinline", "");
      v.setAttribute("muted", "");
      const ready = () => {
        if (!alive || v.readyState < 2) return;
        media = v;
        mw = v.videoWidth;
        mh = v.videoHeight;
        draw();
        wake();
      };
      v.addEventListener("loadeddata", ready);
      v.addEventListener("play", wake);
      v.src = src;
      v.play().catch(() => {});
      return () => {
        alive = false;
        if (raf) cancelAnimationFrame(raf);
        ro.disconnect();
        v.pause();
        v.removeAttribute("src");
        v.load();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
        redraw.current = () => {};
      };
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!alive) return;
      media = img;
      mw = img.naturalWidth || img.width;
      mh = img.naturalHeight || img.height;
      upload();
      const pot = (n: number) => (n & (n - 1)) === 0;
      if (gl2 || (pot(mw) && pot(mh))) gl.generateMipmap(gl.TEXTURE_2D);
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      draw();
    };
    img.src = src;
    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      img.onload = null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      redraw.current = () => {};
    };
  }, [src, type, alt, loop, appear, duration, e1, e2, e3, e4]);

  // Prop changes after mount repaint with the current focus progress.
  useEffect(() => {
    redraw.current();
  });

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    />
  );
}

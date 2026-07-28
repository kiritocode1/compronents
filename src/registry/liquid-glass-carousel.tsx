"use client";

/**
 * Liquid Glass Carousel - an infinite row of image panels drawn through a
 * liquid-glass lens.
 *
 * The carousel renders into an offscreen buffer at device resolution, then a
 * fullscreen quad samples that buffer through a lens shader: an elliptical
 * mask with an inward pull, per-channel chromatic dispersion, a fluid rim wave
 * driven by two sine harmonics, a central nova, and a shimmering blue ring.
 * Panels all share one height and take their width from the measured aspect of
 * their image, so nothing is cropped, and the row loops by wrapping a single
 * scroll value against the summed slot widths.
 *
 * Wheel input moves a target the scroll lerps toward; once the wheel goes quiet
 * and the glide is nearly spent, the target is redirected onto the nearest
 * panel center so the row always settles on an image inside the same glide.
 * Scroll speed feeds a smoothed energy value that shrinks every panel up to 25
 * percent while moving. Clicking a panel glides it to center and opens focus:
 * the panel scales up, the lens distortion fades out, and every other panel
 * sweeps down out of frame in a center-out wave. On load the panels rise from
 * below at 80px tall, hold, then grow to full size while the lens blooms in.
 *
 * Three.js and GSAP. Fills its parent box, so it works fullscreen or inside a
 * bounded stage. Ported from Yousuf-developer/liquid-glass-carousel (MIT).
 *
 * BLANK - aryank.space
 */

import { gsap } from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const ASSET_BASE = "https://ui.aryank.space/assets/liquid-glass-carousel";

export interface LiquidGlassCarouselProject {
  src: string;
  /** Name shown on the first overlay line. */
  brand: string;
  /** Project line shown under the brand. */
  desc: string;
  /** Width / height. Leave undefined to measure it from the loaded image. */
  aspect?: number;
}

export interface LiquidGlassCarouselProps {
  projects?: LiquidGlassCarouselProject[];
  /** Height of every panel in px. Width follows each image's aspect. */
  panelHeight?: number;
  /** Gap between panels in px. */
  gap?: number;
  /** Ring, aura and dispersion tint of the lens. */
  accentColor?: string;
  /** Page colour behind the panels. */
  background?: string;
  /** Colour of the counter and close label. */
  textColor?: string;
  /** Play the rise-and-grow entry animation on mount. */
  entry?: boolean;
  /** Viewport width below which the carousel is replaced by a holding screen. */
  minWidth?: number;
  smallScreenText?: string;
  className?: string;
}

const DEFAULT_PROJECTS: LiquidGlassCarouselProject[] = [
  {
    src: `${ASSET_BASE}/img-1.jpg`,
    brand: "Bloomcollar",
    desc: "Ruff Study, Spring Editorial",
  },
  {
    src: `${ASSET_BASE}/img-2.jpg`,
    brand: "Ribbonwork",
    desc: "Red Silk Blindfold Series",
  },
  {
    src: `${ASSET_BASE}/img-3.jpg`,
    brand: "Swanhold",
    desc: "Black Swan Portrait Triptych",
  },
  {
    src: `${ASSET_BASE}/img-4.jpg`,
    brand: "Lumenflora",
    desc: "Wearable Light Bloom Study",
  },
  {
    src: `${ASSET_BASE}/img-5.jpg`,
    brand: "Long Exposure",
    desc: "Motion Portrait in Low Light",
  },
  {
    src: `${ASSET_BASE}/img-6.jpg`,
    brand: "Night Vision",
    desc: "Infrared Optics Campaign",
  },
  {
    src: `${ASSET_BASE}/img-7.jpg`,
    brand: "Still Object",
    desc: "Glove and Dried Stem",
  },
  {
    src: `${ASSET_BASE}/img-8.jpg`,
    brand: "Blossom Veil",
    desc: "Spring Gauze Editorial",
  },
  {
    src: `${ASSET_BASE}/img-9.jpg`,
    brand: "Split Frame",
    desc: "Screen Light Portrait",
  },
  {
    src: `${ASSET_BASE}/img-10.jpg`,
    brand: "Threshold",
    desc: "Petal Floor Installation",
  },
  {
    src: `${ASSET_BASE}/img-11.jpg`,
    brand: "Daisy Fall",
    desc: "Recline Study in Green",
  },
  {
    src: `${ASSET_BASE}/img-12.jpg`,
    brand: "Glasshouse",
    desc: "Conservatory Work Series",
  },
];

/**
 * Layout and scroll feel. Wheel moves a target, the scroll lerps after it.
 * When the wheel goes quiet and the glide is nearly done, the target gets
 * redirected once onto the nearest panel center, so the row always settles on
 * an image but the landing is part of the same glide.
 */
const CONFIG = {
  PANEL_H: 450, // px height, same for every panel
  GAP: 12, // px gap between panels
  EASE: 0.075, // lerp toward target (lower = heavier glide)
  WHEEL: 1, // wheel sensitivity
  SNAP: true, // settle onto the nearest panel center
  SNAP_DIST: 60, // remaining glide px below which the settle-snap engages
  SNAP_DELAY: 120, // ms of wheel silence required before snapping
  SHRINK_MAX: 60, // scroll speed (px/frame) that equals the full 25% shrink
  SHRINK_ATTACK: 0.25, // how fast panels shrink when speeding up
  SHRINK_DECAY: 0.06, // how fast they grow back when settling
};

/** The liquid-glass lens, a fullscreen post-process over the panel row. */
const LENS = {
  shape: "circle" as "circle" | "square",
  squareRound: 0, // corner rounding for the rectangle shape (0 sharp .. 1 round)
  rotation: 65, // static rotation in degrees
  spin: 0, // auto-spin speed (deg/sec, 0 = off)
  sizeX: 0.565, // half-width as a fraction of the box height
  sizeY: 1, // half-height as a fraction of the box height
  posX: 0.5, // center x in screen-UV (0 left .. 1 right)
  posY: 0.5, // center y in screen-UV (0 bottom .. 1 top)
  zoom: 0, // inward pull strength
  dispersion: 11, // chromatic dispersion
  blur: 0, // blur amount in px
  glow: 4.2, // overall glow multiplier
  whiteGlow: 0.24, // central white nova intensity
  novaSize: 12, // nova size
  blueRing: 6, // accent ring intensity
  ringRadius: 0.49, // ring radius (0 .. 0.5)
  ringWidth: 0.014, // ring width
  shimmer: true, // animated ring shimmer
  shimmerFreq: 12, // shimmer wave count around the ring
  shimmerSpeed: 3.5, // shimmer animation speed
  shimmerDepth: 0.12, // shimmer intensity (0 none .. 0.5 strong)
  rimStart: 0.578, // where the rim fluid wave begins
  rimTangential: 0.6, // tangential fluid-wave displacement
  rimInward: 0, // extra inward pull at the rim
  rimFreq1: 2, // fluid wave frequency 1
  rimFreq2: 1, // fluid wave frequency 2
  blueColor: "#009dff", // accent tint and ring colour
  rimLine: 1.4, // bright white border line intensity (0 = off)
  rimLinePos: 0.488, // where the white border sits (0 .. 0.5)
  rimLineWidth: 0.003, // sharpness of the white border
  vignette: 0, // overall vignette strength (0 = off)
  vignetteSize: 0.3, // how far in the vignette reaches
  samples: 16, // dispersion samples
};

/**
 * Focus mode: click an image, it centers and enlarges, everything else sweeps
 * down out of view and the lens distortion fades away.
 */
const FOCUS = {
  cardDuration: 0.7, // seconds for the other cards to drop
  focusDuration: 0.9, // seconds for the main card to scale into focus
  cardEase: "power4.out",
  focusEase: "power3.out",
  stagger: 0.06, // seconds between successive panels leaving, center-out
  dropDist: 1.4, // drop distance as a fraction of the box height
  centerScale: 1.18, // how much the focused image grows when alone
  lensFade: 0.85, // seconds for the lens props to ramp to invisible
};

/** Entry: panels rise from below small, hold, then grow while the lens blooms. */
const ENTRY = {
  enabled: true,
  delay: 0.5, // seconds before the entry begins
  startH: 80, // px height each panel starts at
  riseDuration: 1, // seconds for a panel to rise into place
  stagger: 0.07, // seconds between panels rising
  riseEase: "power3.out",
  fromBelow: 0.9, // start offset below the box, as a fraction of its height
  growDelay: 0.25, // seconds to wait after the rise before growing
  growDuration: 2.15, // seconds for each panel to grow to full size
  growEase: "expo.inOut",
  growStagger: 0.085, // seconds between successive panels growing
  growDir: "inward" as "inward" | "outward", // "outward" = center first
  lensBloom: 1.4, // seconds for the lens effect to fade back in
  lensBloomEase: "power2.inOut",
};

/** Overlay text transitions, animated in the React layer. */
const UI_ANIM = {
  duration: 0.4, // seconds for focus transitions
  ease: "power3.out",
  topShiftPct: -5, // how far the top text moves, as a percent of box height
  revealDuration: 1.6, // fade-in once the entry settles
  revealEase: "power2.out",
  revealStagger: 0.18, // counter follows the top text by this delay
};

interface CarouselCallbacks {
  cursorElement?: HTMLElement | null;
  projects: LiquidGlassCarouselProject[];
  config: typeof CONFIG;
  lens: typeof LENS & { background: string };
  entryCfg: typeof ENTRY;
  onActiveChange?: (index: number) => void;
  onFocusChange?: (open: boolean) => void;
  onEntryDone?: (done: boolean) => void;
}

/**
 * The carousel itself: three.js plus GSAP, no React. Mounts a canvas into
 * `mount`, reports state through the callbacks, and returns handles the React
 * layer drives (closeFocus for the button, destroy on unmount).
 */
function createCarousel(mount: HTMLElement, options: CarouselCallbacks) {
  const {
    cursorElement = null,
    projects: PROJECTS,
    config: CFG,
    lens: LENS_CFG,
    entryCfg: ENTRY_CFG,
    onActiveChange = () => {},
    onFocusChange = () => {},
    onEntryDone = () => {},
  } = options;

  let W = mount.clientWidth;
  let H = mount.clientHeight;

  // ---- renderer / scene / camera (orthographic, 1 unit = 1 px) ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(new THREE.Color(LENS_CFG.background), 1); // match the page bg so FBO gaps blend
  renderer.domElement.style.display = "block";
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -W / 2,
    W / 2,
    H / 2,
    -H / 2,
    -100,
    100,
  );
  camera.position.z = 10;

  // ---- load the source images (textures + measured aspect) ----
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const sources = PROJECTS.map((img) => {
    const s = {
      tex: null as THREE.Texture | null,
      aspect: img.aspect ?? 1,
      locked: img.aspect != null,
    };
    loader.load(img.src, (tex) => {
      // mipmaps + anisotropy keep panels crisp while they render small
      // (the entry animation starts them at ~80px tall)
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.colorSpace = THREE.SRGBColorSpace;
      if (!s.locked && tex.image) s.aspect = tex.image.width / tex.image.height;
      s.tex = tex;
      // aspect is now known, so rebuild slot offsets to match the widths and
      // re-center the row while the user has not scrolled yet
      recomputeTotal();
      if (!userInteracted) {
        scroll = centerForIndex(0);
        target = scroll;
      }
    });
    return s;
  });

  // width of one slot: height is fixed (PANEL_H), so width = aspect * PANEL_H + gap
  function slotWidth(srcIndex: number) {
    return sources[srcIndex].aspect * CFG.PANEL_H + CFG.GAP;
  }

  // cumulative x of each source's slot, and the total loop width
  let offsets: number[] = [];
  let totalWidth = 0;
  function recomputeTotal() {
    offsets = [];
    let acc = 0;
    for (let i = 0; i < sources.length; i++) {
      offsets.push(acc);
      acc += slotWidth(i);
    }
    totalWidth = acc;
  }
  recomputeTotal();

  // scroll value that puts panel `idx` dead-center. idx is an unbounded
  // integer (loop k, source = idx mod N) so focus, click and entry can aim at
  // an exact panel copy.
  function centerForIndex(idx: number) {
    const N = sources.length;
    const loop = Math.floor(idx / N);
    const s = ((idx % N) + N) % N;
    return offsets[s] + slotWidth(s) / 2 - CFG.GAP / 2 + loop * totalWidth;
  }

  // integer index (including loop) whose center is closest to `value`
  function nearestIndex(value: number) {
    if (!totalWidth) return 0;
    const N = sources.length;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < N; i++) {
      const center = offsets[i] + slotWidth(i) / 2 - CFG.GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        best = i + k * N;
      }
    }
    return best;
  }

  // which source index is closest to the box center (drives the overlay text)
  function centerIndex(value: number) {
    if (!totalWidth) return 0;
    let bestI = 0;
    let bestDist = Infinity;
    for (let i = 0; i < sources.length; i++) {
      const center = offsets[i] + slotWidth(i) / 2 - CFG.GAP / 2;
      const k = Math.round((value - center) / totalWidth);
      const dist = Math.abs(center + k * totalWidth - value);
      if (dist < bestDist) {
        bestDist = dist;
        bestI = i;
      }
    }
    return bestI;
  }
  let lastCenter = -1;

  // ---- mesh pool ----
  // REPEATS copies of the whole image set so wide screens never run dry.
  const REPEATS = 4;
  const pool: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    srcIndex: number;
    bound?: boolean;
  }> = [];
  for (let r = 0; r < REPEATS; r++) {
    for (let i = 0; i < sources.length; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xdddddd,
        transparent: true,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), mat);
      mesh.visible = false;
      scene.add(mesh);
      pool.push({ mesh, mat, srcIndex: i });
    }
  }

  // ---- scroll state ----
  let scroll = centerForIndex(0); // current (image 01 centered)
  let target = scroll; // desired
  let userInteracted = false; // true once the user scrolls (stops auto-recenter)
  let prevScroll = 0;
  let scrollEnergy = 0; // smoothed 0..1 scroll activity, drives the panel shrink
  let pendingFocus: { srcIndex: number } | null = null; // open focus once a click-to-center settles
  let lastWheelAt = 0;
  let snapArmed = false; // wheel input arms the settle-snap; it fires once

  // ---- liquid-glass lens: FBO + fullscreen pass ----
  // The carousel renders into rt at device resolution (a CSS-sized target would
  // render at 1x and upscale, which is blurry on retina); a fullscreen quad
  // then samples it through the lens shader.
  const dpr = renderer.getPixelRatio();
  const rt = new THREE.WebGLRenderTarget(W * dpr, H * dpr);
  const lensScene = new THREE.Scene();
  const lensCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const lensUniforms = {
    uTex: { value: rt.texture },
    uRes: { value: new THREE.Vector2(W * dpr, H * dpr) },
    uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uSizeX: { value: LENS_CFG.sizeX },
    uSizeY: { value: LENS_CFG.sizeY },
    uShape: { value: LENS_CFG.shape === "square" ? 1 : 0 },
    uSquareRound: { value: LENS_CFG.squareRound },
    uRotation: { value: 0 },
    uAspect: { value: W / H },
    uZoom: { value: LENS_CFG.zoom },
    uDispersion: { value: LENS_CFG.dispersion },
    uBlur: { value: LENS_CFG.blur },
    uGlow: { value: LENS_CFG.glow },
    uWhiteGlow: { value: LENS_CFG.whiteGlow },
    uNovaSize: { value: LENS_CFG.novaSize },
    uBlueRing: { value: LENS_CFG.blueRing },
    uRingRadius: { value: LENS_CFG.ringRadius },
    uRingWidth: { value: LENS_CFG.ringWidth },
    uShimmer: { value: LENS_CFG.shimmer ? 1 : 0 },
    uShimmerFreq: { value: LENS_CFG.shimmerFreq },
    uShimmerSpeed: { value: LENS_CFG.shimmerSpeed },
    uShimmerDepth: { value: LENS_CFG.shimmerDepth },
    uTime: { value: 0 },
    uRimStart: { value: LENS_CFG.rimStart },
    uRimTangential: { value: LENS_CFG.rimTangential },
    uRimInward: { value: LENS_CFG.rimInward },
    uRimFreq1: { value: LENS_CFG.rimFreq1 },
    uRimFreq2: { value: LENS_CFG.rimFreq2 },
    uBlueColor: { value: new THREE.Color(LENS_CFG.blueColor) },
    uRimLine: { value: LENS_CFG.rimLine },
    uRimLinePos: { value: LENS_CFG.rimLinePos },
    uRimLineWidth: { value: LENS_CFG.rimLineWidth },
    uVignette: { value: LENS_CFG.vignette },
    uVignetteSize: { value: LENS_CFG.vignetteSize },
    uSamples: { value: LENS_CFG.samples },
  };
  const lensMat = new THREE.ShaderMaterial({
    uniforms: lensUniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      #define PI 3.14159265
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform vec2  uRes;
      uniform vec2  uCenter;
      uniform float uSizeX;         // half-width (height-fraction units)
      uniform float uSizeY;         // half-height (height-fraction units)
      uniform float uAspect;        // W/H
      uniform float uZoom;
      uniform float uDispersion;
      uniform float uBlur;
      uniform float uGlow;
      uniform float uWhiteGlow;
      uniform float uNovaSize;
      uniform float uBlueRing;
      uniform float uRingRadius;
      uniform float uRingWidth;
      uniform float uShimmer;
      uniform float uShimmerFreq;
      uniform float uShimmerSpeed;
      uniform float uShimmerDepth;
      uniform float uTime;
      uniform float uRimStart;
      uniform float uRimTangential;
      uniform float uRimInward;
      uniform float uRimFreq1;
      uniform float uRimFreq2;
      uniform vec3  uBlueColor;
      uniform float uRimLine;
      uniform float uRimLinePos;
      uniform float uRimLineWidth;
      uniform float uVignette;     // overall vignette strength (0 = off)
      uniform float uVignetteSize; // radius where the vignette begins
      uniform float uShape;        // 0 = circle, 1 = square
      uniform float uSquareRound;  // corner rounding for square (0..1)
      uniform float uRotation;     // lens rotation in radians
      uniform int   uSamples;

      const int MAX_SAMPLES = 16;

      // rounded-box signed distance (negative inside)
      float sdRoundBox(vec2 p, vec2 b, float r){
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }

      // Evaluate the disc lens centered at 'center' (screen-UV). Returns the
      // lensed color; 'outA' is how opaque this lens is here (0 outside disc).
      vec3 discLens(vec2 center, float aspectCorrect, out float outA) {
        // local coords, aspect-corrected so x/y are in the same screen units
        vec2 p = (vUv - center);
        p.x *= aspectCorrect;
        // rotate local space so the rect and all internals spin together
        float ca = cos(uRotation), sa = sin(uRotation);
        p = mat2(ca, -sa, sa, ca) * p;
        vec2 halfSize = vec2(uSizeX, uSizeY);
        // elliptical distance: 0 center .. 1 boundary
        float dist = length(p / halfSize);
        outA = 0.0;

        // mask shape: ellipse OR rounded rect, drives the cutoff.
        // maskND: 0 inside .. 1 at the shape boundary (>1 outside).
        float maskND;
        if (uShape > 0.5) {
          float corner = min(uSizeX, uSizeY) * clamp(uSquareRound, 0.0, 1.0);
          float sd = sdRoundBox(p, halfSize, corner);
          maskND = 1.0 + sd / min(uSizeX, uSizeY);
        } else {
          maskND = dist;
        }
        if (maskND > 1.0) return vec3(0.0);

        // shapeND: 0 center .. 1 boundary, following the chosen shape. Used by
        // nova / ring / border so they take the SAME shape.
        float shapeND = clamp(maskND, 0.0, 1.0);

        // deflection uses the elliptical radial nd so it bends smoothly from
        // the center even when the boundary is rectangular
        float nd = clamp(dist, 0.0, 1.0);
        vec2  offset = vUv - center;
        vec2  radialDir = normalize(offset + 1e-6);
        vec2  tangentDir = vec2(-radialDir.y, radialDir.x);
        // angle measured in ROTATED local space so the rim wave and shimmer spin too
        float angle = atan(p.y, p.x);

        // inward pull + fluid rim waves
        float pull = uZoom * 0.30 * (nd * nd);
        float rimStrength = smoothstep(uRimStart, 1.0, nd);
        float fluidWave = sin(angle * uRimFreq1) * 0.55 + sin(angle * uRimFreq2) * 0.25;
        float rScreen = (uSizeX + uSizeY) * 0.5;
        vec2  rimOff = tangentDir * fluidWave * rimStrength * rScreen * uRimTangential;
        vec2  rimPull = -radialDir * rimStrength * rScreen * uRimInward;

        vec2 baseUV = center + offset * (1.0 - pull) + rimOff + rimPull;

        // chromatic dispersion (weighted multi-sample, per-channel normalized)
        float rimMask = smoothstep(0.55, 1.0, nd);
        vec2  dispDir = offset * uDispersion * 0.004 * rimMask;
        int N = uSamples;
        if (N < 2) N = 2;
        if (N > MAX_SAMPLES) N = MAX_SAMPLES;
        vec3 col = vec3(0.0);
        vec3 caW = vec3(0.0);
        for (int i = 0; i < MAX_SAMPLES; i++) {
          if (i >= N) break;
          float t = float(i) / float(N - 1);
          vec2 sUV = baseUV + dispDir * (t - 0.5);
          vec3 s = texture2D(uTex, sUV).rgb;
          vec3 w = vec3(
            exp(-pow((t - 0.00) / 0.38, 2.0)),
            exp(-pow((t - 0.50) / 0.38, 2.0)),
            exp(-pow((t - 1.00) / 0.38, 2.0))
          );
          col += s * w;
          caW += w;
        }
        col /= max(caW, vec3(0.001));

        // optional blur near the rim
        float blurFade = 1.0 - smoothstep(0.72, 0.98, nd);
        if (uBlur > 0.01 && blurFade > 0.01) {
          vec2 blurRad = vec2(uBlur) / uRes * blurFade;
          vec3 bcol = vec3(0.0);
          float btw = 0.0;
          for (float a = 0.0; a < PI * 2.0; a += PI * 2.0 / 6.0) {
            for (float rr = 0.4; rr <= 1.001; rr += 0.3) {
              vec2 o = vec2(cos(a), sin(a)) * blurRad * rr;
              float w = 1.0 - rr * 0.38;
              bcol += texture2D(uTex, baseUV + o).rgb * w;
              btw += w;
            }
          }
          col = mix(bcol / btw, col, rimMask);
        }

        // glassy darkening toward the center
        col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, shapeND));

        // white nova glow at the center
        float r2 = shapeND * shapeND * 0.25;
        float gs = max(uNovaSize * uGlow * 0.003, 0.004);
        float nova = exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18;
        nova *= uWhiteGlow * (uGlow / 17.0) * 1.15;
        col += vec3(nova);

        // accent ring + aura
        float dC = shapeND * 0.5;
        float tR = clamp(uRingRadius, 0.1, 0.49);
        float rW = max(uRingWidth, 0.003);
        float ring = exp(-pow((dC - tR) / rW, 2.0));
        ring *= uBlueRing * (uGlow / 17.0) * 1.8;
        if (uShimmer > 0.5) ring *= sin(angle * uShimmerFreq + uTime * uShimmerSpeed) * uShimmerDepth + (1.0 - uShimmerDepth);
        float ringAura = exp(-pow((dC - tR) / (rW * 6.0), 2.0)) * 0.28 * uBlueRing * (uGlow / 17.0);
        col += uBlueColor * (ring + ringAura);
        // bright border line
        col += vec3(exp(-pow((dC - uRimLinePos) / max(uRimLineWidth, 0.0001), 2.0)) * uRimLine);

        // lens alpha: solid inside, soft falloff at the very edge
        outA = smoothstep(1.0, 0.93, maskND);
        return col;
      }

      void main(){
        vec3 base = texture2D(uTex, vUv).rgb;  // carousel, untouched
        vec3 outc = base;

        float a = 0.0;
        vec3 c = discLens(uCenter, uAspect, a);
        outc = mix(outc, c, a);

        // overall vignette: darken toward the corners (aspect-correct)
        if (uVignette > 0.001) {
          vec2 vc = vUv - 0.5;
          vc.x *= uAspect;
          float d = length(vc) / max(uVignetteSize, 0.0001);
          float vig = 1.0 - uVignette * smoothstep(0.5, 1.0, d);
          outc *= clamp(vig, 0.0, 1.0);
        }

        gl_FragColor = vec4(outc, 1.0);
      }
    `,
  });
  const lensQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensMat);
  lensScene.add(lensQuad);

  // ---- focus state ----
  // When focused, the lens props fade out (lensFx 1 -> 0) and every panel
  // except the focused one slides down off-screen, staggered center-out.
  const focusState = {
    active: false,
    srcIndex: -1,
    poolIdx: -1,
    lensFx: ENTRY_CFG.enabled ? 0 : 1, // 0 during entry; blooms in later
    anim: null as gsap.core.Timeline | null,
  };
  const drop: number[] = new Array(REPEATS * sources.length).fill(0); // per-panel drop 0..1
  let focusScale = 1; // eased scale-up applied to the focused panel
  const lastCenterX: Array<number | undefined> = new Array(
    REPEATS * sources.length,
  ); // per-pool x, undefined if hidden

  // ---- entry state ----
  // pEntry[poolIdx]: 0 = below the box at startH, 1 = settled in the real row.
  const pEntry: number[] = new Array(REPEATS * sources.length).fill(
    ENTRY_CFG.enabled ? 0 : 1,
  );
  let entryActive = ENTRY_CFG.enabled;
  let entrySettled = false; // rise finished but panels held at small size
  const growArr: number[] = new Array(REPEATS * sources.length).fill(
    ENTRY_CFG.enabled ? 0 : 1,
  );
  let entryAnim: gsap.core.Timeline | null = null;

  // lens props that fade out for focus/entry, with their full values
  const LENS_FX_KEYS = [
    "uDispersion",
    "uBlueRing",
    "uRimLine",
    "uVignette",
    "uZoom",
    "uRimTangential",
    "uRimInward",
  ] as const;
  const lensFxFull: Record<string, number> = {};
  for (const k of LENS_FX_KEYS) lensFxFull[k] = lensUniforms[k].value;

  // ---- layout: place pooled meshes for the current scroll (every frame) ----
  let panelRects: Array<{
    left: number;
    right: number;
    top: number;
    bottom: number;
    poolIdx: number;
    srcIndex: number;
    centerX: number;
  }> = []; // visible panel rects, in box-local px, for hit-testing
  let centeredPanel: {
    srcIndex: number;
    centerX: number;
    wPx: number;
    h: number;
    poolIdx: number;
  } | null = null;
  function layout() {
    panelRects = [];
    centeredPanel = null;
    let centeredDist = Infinity;
    const half = W / 2;
    const buffer = CFG.PANEL_H; // generous horizontal buffer
    pool.forEach((p, poolIdx) => {
      const rep = Math.floor(poolIdx / sources.length);
      const i = p.srcIndex;
      const src = sources[i];

      // slot center within one loop, shifted by scroll, wrapped, then pushed
      // out by this pool entry's repetition rung
      const slotCenterInLoop = offsets[i] + slotWidth(i) / 2 - CFG.GAP / 2;
      let x = slotCenterInLoop - scroll;
      x = ((x % totalWidth) + totalWidth) % totalWidth;
      x += (rep - Math.floor(REPEATS / 2)) * totalWidth;
      if (x > half + totalWidth) x -= totalWidth * REPEATS;

      const centerX = x;
      const inEntry = entryActive || entrySettled;
      if (!inEntry && (centerX < -half - buffer || centerX > half + buffer)) {
        p.mesh.visible = false;
        lastCenterX[poolIdx] = undefined;
        return;
      }
      lastCenterX[poolIdx] = centerX;

      // fixed size for every panel; shrink up to 25% with scroll speed
      const shrink = 1 - 0.25 * scrollEnergy;
      const h = CFG.PANEL_H * shrink;
      const wPx = src.aspect * CFG.PANEL_H * shrink;

      // bind the texture once available
      if (src.tex && !p.bound) {
        p.mat.map = src.tex;
        p.mat.color.set(0xffffff);
        p.mat.needsUpdate = true;
        p.bound = true;
      }

      let y = 0;

      // focus: the focused panel grows and stays put, others slide down
      const isFocused = focusState.active && focusState.poolIdx === poolIdx;
      const d = drop[poolIdx] || 0;
      let drawW = wPx;
      let drawH = h;
      if (isFocused) {
        drawW = wPx * focusScale;
        drawH = h * focusScale;
      } else if (d > 0) {
        y = -d * H * FOCUS.dropDist;
      }

      p.mesh.visible = true;

      // entry: interpolate from (below the box, startH) up to the real state
      let finalX = centerX;
      let finalY = y;
      let finalW = drawW;
      let finalH = drawH;
      if (entryActive || entrySettled) {
        const pe = pEntry[poolIdx] || 0;
        const g = growArr[poolIdx] || 0;

        const curH = ENTRY_CFG.startH + (drawH - ENTRY_CFG.startH) * g;
        finalH = curH;
        finalW = curH * src.aspect;

        // constant-gap walk from the centered source, one copy per source.
        // Each slot uses ITS OWN current grow height, so a grown panel takes
        // more space and pushes its neighbours outward.
        const cSrc = centerIndex(scroll);
        let di = i - cSrc;
        if (di > sources.length / 2) di -= sources.length;
        if (di < -sources.length / 2) di += sources.length;
        const N = sources.length;
        const midRep = Math.floor(REPEATS / 2);
        if (rep !== midRep) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }
        const slotH = (s: number) => {
          const gg = growArr[midRep * N + s] || 0;
          return ENTRY_CFG.startH + (CFG.PANEL_H - ENTRY_CFG.startH) * gg;
        };
        let off = 0;
        if (di > 0) {
          for (let k = 0; k < di; k++) {
            const sa = (((cSrc + k) % N) + N) % N;
            const sb = (((cSrc + k + 1) % N) + N) % N;
            off +=
              (sources[sa].aspect * slotH(sa) +
                sources[sb].aspect * slotH(sb)) /
                2 +
              CFG.GAP;
          }
        } else if (di < 0) {
          for (let k = 0; k < -di; k++) {
            const sa = (((cSrc - k) % N) + N) % N;
            const sb = (((cSrc - k - 1) % N) + N) % N;
            off -=
              (sources[sa].aspect * slotH(sa) +
                sources[sb].aspect * slotH(sb)) /
                2 +
              CFG.GAP;
          }
        }
        finalX = off;
        if (finalX < -half - buffer || finalX > half + buffer) {
          p.mesh.visible = false;
          lastCenterX[poolIdx] = undefined;
          return;
        }

        // vertical: rise from below the box up to the real y
        const below = -H * ENTRY_CFG.fromBelow;
        finalY = below + (y - below) * pe;
      }

      p.mesh.position.set(finalX, finalY, 0);
      p.mesh.scale.set(finalW, finalH, 1);

      // box-local rect (px, top-left origin) for pointer hit-testing
      const sx = centerX + W / 2;
      const sy = H / 2 - y;
      panelRects.push({
        left: sx - drawW / 2,
        right: sx + drawW / 2,
        top: sy - drawH / 2,
        bottom: sy + drawH / 2,
        poolIdx,
        srcIndex: i,
        centerX,
      });

      if (Math.abs(centerX) < centeredDist) {
        centeredDist = Math.abs(centerX);
        centeredPanel = { srcIndex: i, centerX, wPx, h, poolIdx };
      }
    });
  }

  // which visible panel (if any) is under a box-local point?
  function panelAtPointer(px: number, py: number) {
    for (let i = 0; i < panelRects.length; i++) {
      const r = panelRects[i];
      if (px >= r.left && px <= r.right && py >= r.top && py <= r.bottom)
        return r;
    }
    return null;
  }

  const el = renderer.domElement;

  // Pointer events carry viewport coords; the panel rects are box-local, and
  // so is the cursor label. One conversion serves both, and it is the identity
  // when the carousel happens to fill the viewport.
  function localPoint(e: PointerEvent | MouseEvent) {
    const r = mount.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  // ---- "View" cursor follower ----
  if (cursorElement)
    gsap.set(cursorElement, {
      xPercent: 20,
      yPercent: 30,
      scale: 0,
      autoAlpha: 0,
    });
  const moveX = cursorElement
    ? gsap.quickTo(cursorElement, "x", { duration: 0.5, ease: "power3.out" })
    : null;
  const moveY = cursorElement
    ? gsap.quickTo(cursorElement, "y", { duration: 0.5, ease: "power3.out" })
    : null;

  let overPanel = false;

  function setView(on: boolean) {
    if (entryActive || entrySettled) on = false; // not during entry
    el.style.cursor = on ? "pointer" : "";
    if (on === overPanel || !cursorElement) return;
    overPanel = on;
    gsap.to(cursorElement, {
      scale: on ? 1 : 0,
      autoAlpha: on ? 1 : 0,
      duration: on ? 0.35 : 0.25,
      ease: on ? "power3.out" : "power3.in",
    });
  }

  // ---- input ----
  function onWheel(e: WheelEvent) {
    e.preventDefault();
    if (focusState.active || entryActive || entrySettled) return;
    userInteracted = true;
    pendingFocus = null; // manual scroll cancels a click-to-center in flight
    target += (e.deltaY || e.deltaX) * CFG.WHEEL;
    lastWheelAt = performance.now();
    snapArmed = true;
  }

  function onPointerMove(e: PointerEvent) {
    const p = localPoint(e);
    if (moveX) moveX(p.x);
    if (moveY) moveY(p.y);
    if (focusState.active) {
      setView(false);
      return;
    }
    setView(panelAtPointer(p.x, p.y) !== null);
  }
  function onLeave() {
    setView(false);
  }

  function onClick(e: MouseEvent) {
    if (focusState.active || entryActive || entrySettled) return;
    const p = localPoint(e);
    const hit = panelAtPointer(p.x, p.y);
    if (!hit) return;
    // the centered panel opens right away; anything else glides to center
    // first and the tick loop opens focus once it arrives
    if (centeredPanel && hit.poolIdx === centeredPanel.poolIdx) {
      pendingFocus = null;
      openFocus();
      return;
    }
    userInteracted = true;
    target = centerForIndex(nearestIndex(scroll + hit.centerX));
    pendingFocus = { srcIndex: hit.srcIndex };
    setView(false);
  }

  // ---- focus open / close ----
  function openFocus() {
    if (focusState.active || !centeredPanel) return;
    const panel = centeredPanel;
    const src = sources[panel.srcIndex];
    if (!src || !src.tex) return;

    focusState.active = true;
    focusState.srcIndex = panel.srcIndex;
    const focusPoolIdx = panel.poolIdx;
    focusState.poolIdx = focusPoolIdx;

    // pull scroll precisely to center so the focused panel is dead-centre
    target = centerForIndex(nearestIndex(scroll));

    // order the OTHER panels by distance from the focused card and group
    // near-equal distances, so left/right pairs leave together: a real
    // center-out wave radiating from the clicked card
    const focusX = lastCenterX[focusPoolIdx] || 0;
    const others = pool
      .map((_p, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.idx !== focusPoolIdx && o.x !== undefined)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x as number) - focusX) }))
      .sort((a, b) => a.dist - b.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && o.dist - prevDist > 1) rank++;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    // re-snapshot the lens values so the fade and restore track live edits
    for (const k of LENS_FX_KEYS) lensFxFull[k] = lensUniforms[k].value;

    if (focusState.anim) focusState.anim.kill();
    const tl = gsap.timeline();
    tl.to(
      focusState,
      { lensFx: 0, duration: FOCUS.lensFade, ease: "power3.out" },
      0,
    );
    tl.to(
      { v: focusScale },
      {
        v: FOCUS.centerScale,
        duration: FOCUS.focusDuration,
        ease: FOCUS.focusEase,
        onUpdate() {
          focusScale = (this.targets()[0] as { v: number }).v;
        },
      },
      0,
    );
    ranked.forEach((o) => {
      tl.to(
        drop,
        { [o.idx]: 1, duration: FOCUS.cardDuration, ease: FOCUS.cardEase },
        o.rank * FOCUS.stagger,
      );
    });
    focusState.anim = tl;

    setView(false);
    el.style.cursor = "";
    onFocusChange(true);
  }

  function closeFocus() {
    if (!focusState.active) return;
    if (focusState.anim) focusState.anim.kill();

    // return wave: farthest cards first (edges-in), symmetric pairs together
    const focusX = lastCenterX[focusState.poolIdx] || 0;
    const others = pool
      .map((_p, idx) => ({ idx, x: lastCenterX[idx] }))
      .filter((o) => o.x !== undefined && (drop[o.idx] || 0) > 0)
      .map((o) => ({ idx: o.idx, dist: Math.abs((o.x as number) - focusX) }))
      .sort((a, b) => b.dist - a.dist);

    let rank = 0;
    let prevDist = -1;
    const ranked = others.map((o) => {
      if (prevDist >= 0 && prevDist - o.dist > 1) rank++;
      prevDist = o.dist;
      return { idx: o.idx, rank };
    });

    // notify the host NOW so its UI animates in sync with the cards returning;
    // focusState.active stays true until the timeline finishes (it still gates
    // scroll input)
    onFocusChange(false);

    const tl = gsap.timeline({
      onComplete: () => {
        focusState.active = false;
        focusState.srcIndex = -1;
      },
    });
    tl.to(
      focusState,
      { lensFx: 1, duration: FOCUS.lensFade * 0.8, ease: "power3.inOut" },
      0,
    );
    tl.to(
      { v: focusScale },
      {
        v: 1,
        duration: FOCUS.focusDuration * 0.85,
        ease: FOCUS.focusEase,
        onUpdate() {
          focusScale = (this.targets()[0] as { v: number }).v;
        },
      },
      0,
    );
    ranked.forEach((o) => {
      tl.to(
        drop,
        {
          [o.idx]: 0,
          duration: FOCUS.cardDuration * 0.85,
          ease: FOCUS.cardEase,
        },
        o.rank * FOCUS.stagger * 0.7,
      );
    });
    focusState.anim = tl;
  }

  // ---- entry animation: rise from below, hold small, grow to full ----
  function playEntry() {
    if (entryAnim) entryAnim.kill();
    for (let k = 0; k < pEntry.length; k++) pEntry[k] = 0;
    entryActive = true;
    entrySettled = false;
    onEntryDone(false);
    for (let k = 0; k < growArr.length; k++) growArr[k] = 0;
    focusState.lensFx = 0; // no lens distortion during entry

    // center a panel cleanly; that panel rises first
    target = centerForIndex(nearestIndex(scroll));
    scroll = target;

    layout(); // populate lastCenterX
    const visible: number[] = [];
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] !== undefined) visible.push(k);
    }

    const tl = gsap.timeline({ delay: ENTRY_CFG.delay });
    // each card rises after its own random delay
    const spread = ENTRY_CFG.stagger * Math.max(visible.length - 1, 1);
    let lastRiseEnd = 0;
    visible.forEach((idx) => {
      const at = Math.random() * spread;
      lastRiseEnd = Math.max(lastRiseEnd, at + ENTRY_CFG.riseDuration);
      tl.to(
        pEntry,
        {
          [idx]: 1,
          duration: ENTRY_CFG.riseDuration,
          ease: ENTRY_CFG.riseEase,
        },
        at,
      );
    });

    // rise done, so hold at the small size then grow to full (staggered)
    tl.call(
      () => {
        entryActive = false;
        entrySettled = true;
      },
      undefined,
      lastRiseEnd,
    );

    // grow stagger ranked by slot distance from the centered source, so
    // symmetric left/right pairs grow together. outward = center first,
    // inward = edges first.
    const cSrcG = centerIndex(scroll);
    const Ng = sources.length;
    const midRepG = Math.floor(REPEATS / 2);
    const growList: Array<{ idx: number; rank: number }> = [];
    let maxRank = 0;
    for (let k = 0; k < lastCenterX.length; k++) {
      if (lastCenterX[k] === undefined) continue;
      if (Math.floor(k / Ng) !== midRepG) continue;
      let di = (k % Ng) - cSrcG;
      if (di > Ng / 2) di -= Ng;
      if (di < -Ng / 2) di += Ng;
      const r = Math.abs(di);
      maxRank = Math.max(maxRank, r);
      growList.push({ idx: k, rank: r });
    }
    const growRanked = growList.map((v) => ({
      idx: v.idx,
      rank: ENTRY_CFG.growDir === "outward" ? v.rank : maxRank - v.rank,
    }));

    const growStart = lastRiseEnd + ENTRY_CFG.growDelay;
    let growEnd = growStart;

    // the lens blooms back in the moment the grow begins
    tl.to(
      focusState,
      {
        lensFx: 1,
        duration: ENTRY_CFG.lensBloom,
        ease: ENTRY_CFG.lensBloomEase,
      },
      growStart,
    );

    growRanked.forEach((o) => {
      const at = growStart + o.rank * ENTRY_CFG.growStagger;
      growEnd = Math.max(growEnd, at + ENTRY_CFG.growDuration);
      tl.to(
        growArr,
        {
          [o.idx]: 1,
          duration: ENTRY_CFG.growDuration,
          ease: ENTRY_CFG.growEase,
        },
        at,
      );
    });
    // hand off to the normal full-size carousel
    tl.call(
      () => {
        entrySettled = false;
        for (let k = 0; k < growArr.length; k++) growArr[k] = 1;
        onEntryDone(true);
      },
      undefined,
      growEnd,
    );
    entryAnim = tl;
  }

  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("click", onClick);

  // ---- animation loop ----
  let raf = 0;
  function tick() {
    // settle-snap: wheel quiet plus glide almost done, so aim at the nearest
    // center. Redirecting the target (not the scroll) keeps it one glide.
    if (
      CFG.SNAP &&
      snapArmed &&
      !focusState.active &&
      Math.abs(target - scroll) < CFG.SNAP_DIST &&
      performance.now() - lastWheelAt > CFG.SNAP_DELAY
    ) {
      target = centerForIndex(nearestIndex(target));
      snapArmed = false;
    }

    scroll += (target - scroll) * CFG.EASE;

    // tell the host which image is centered (overlay text)
    const ci = centerIndex(scroll);
    if (ci !== lastCenter) {
      lastCenter = ci;
      onActiveChange(ci);
    }

    // scroll speed to energy 0..1, which drives the panel shrink. Attack fast
    // when speeding up, decay slow when settling.
    const rawSpeed = scroll - prevScroll;
    prevScroll = scroll;
    const norm = Math.min(1, Math.abs(rawSpeed) / Math.max(1, CFG.SHRINK_MAX));
    const k = norm > scrollEnergy ? CFG.SHRINK_ATTACK : CFG.SHRINK_DECAY;
    scrollEnergy += (norm - scrollEnergy) * k;

    layout();

    // click-to-center: once the glide settles on the clicked panel, focus it
    if (pendingFocus && !focusState.active) {
      if (Math.abs(target - scroll) < 0.5) {
        const pf = pendingFocus;
        pendingFocus = null;
        if (centeredPanel && centeredPanel.srcIndex === pf.srcIndex)
          openFocus();
      }
    }

    // lens uniforms plus the focus/entry fade of the distortion props
    lensUniforms.uCenter.value.set(LENS_CFG.posX, LENS_CFG.posY);
    lensUniforms.uAspect.value = W / H;
    lensUniforms.uTime.value = performance.now() * 0.001;
    const rad = (a: number) => (a * Math.PI) / 180;
    lensUniforms.uRotation.value =
      rad(LENS_CFG.rotation) + rad(LENS_CFG.spin) * (performance.now() * 0.001);
    const fx = focusState.lensFx;
    for (const key of LENS_FX_KEYS) {
      lensUniforms[key].value = lensFxFull[key] * fx;
    }

    // render the carousel into the FBO, then the FBO through the lens
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(lensScene, lensCam);

    raf = requestAnimationFrame(tick);
  }
  tick();

  if (ENTRY_CFG.enabled) playEntry();

  // ---- resize / teardown ----
  // ResizeObserver rather than a window listener: the carousel sizes to its
  // parent box, which can change without the window doing so.
  function onResize() {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h || (w === W && h === H)) return;
    W = w;
    H = h;
    renderer.setSize(W, H);
    camera.left = -W / 2;
    camera.right = W / 2;
    camera.top = H / 2;
    camera.bottom = -H / 2;
    camera.updateProjectionMatrix();
    rt.setSize(W * dpr, H * dpr);
    lensUniforms.uRes.value.set(W * dpr, H * dpr);
  }
  const ro = new ResizeObserver(onResize);
  ro.observe(mount);

  function destroy() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    el.removeEventListener("wheel", onWheel);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerleave", onLeave);
    el.removeEventListener("click", onClick);
    if (focusState.anim) focusState.anim.kill();
    if (entryAnim) entryAnim.kill();
    renderer.dispose();
    rt.dispose();
    lensQuad.geometry.dispose();
    lensMat.dispose();
    pool.forEach((p) => {
      p.mesh.geometry.dispose();
      p.mat.dispose();
    });
    sources.forEach((s) => {
      if (s.tex) s.tex.dispose();
    });
    if (el.parentNode) el.parentNode.removeChild(el);
  }

  return { closeFocus, replayEntry: playEntry, destroy };
}

const styles = `
.glens-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 16px;
  line-height: 1.5;
}
.glens-root canvas { display: block; }
.glens-top {
  position: absolute;
  left: 50%;
  top: 15%;
  padding: 0 1rem;
  mix-blend-mode: exclusion;
  color: #fff;
  pointer-events: none;
}
.glens-top-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.glens-top p,
.glens-counter p {
  margin: 0;
  text-align: center;
  font-size: 1rem;
}
.glens-counter {
  position: absolute;
  left: 50%;
  bottom: 15%;
  padding: 0 1rem;
  pointer-events: none;
}
.glens-cursor {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 50;
  pointer-events: none;
  white-space: nowrap;
  mix-blend-mode: exclusion;
  color: #fff;
  font-size: 0.875rem;
  will-change: transform;
}
.glens-close {
  position: absolute;
  top: 2%;
  right: 4%;
  z-index: 50;
  padding: 0;
  border: 0;
  background: none;
  white-space: nowrap;
  mix-blend-mode: exclusion;
  color: #fff;
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 300ms;
}
.glens-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #000;
}
.glens-small p {
  margin: 0;
  padding: 0 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: rgb(255 255 255 / 0.7);
}
`;

export default function LiquidGlassCarousel({
  projects = DEFAULT_PROJECTS,
  panelHeight = CONFIG.PANEL_H,
  gap = CONFIG.GAP,
  accentColor = LENS.blueColor,
  background = "#ffffff",
  textColor = "#000000",
  entry = true,
  minWidth = 1024,
  smallScreenText = "This experience is built for larger screens. Please visit on a display wider than 1024px.",
  className,
}: LiquidGlassCarouselProps) {
  const mountRef = useRef<HTMLDivElement>(null); // the engine mounts its canvas here
  const cursorRef = useRef<HTMLDivElement>(null); // trailing "View" label, moved by the engine
  const topTextRef = useRef<HTMLDivElement>(null); // brand and desc, GSAP-animated on focus
  const counterRef = useRef<HTMLDivElement>(null); // 01/12 counter, GSAP-animated on focus
  const engineRef = useRef<ReturnType<typeof createCarousel> | null>(null);
  const revealPlayedRef = useRef(false); // the entry reveal fade runs exactly once

  const [active, setActive] = useState(0); // index of the centered image
  const [focused, setFocused] = useState(false); // a focus session is open
  const [entryDone, setEntryDone] = useState(false); // entry fully settled
  // "pending" until we know the viewport (SSR-safe), then "ok" | "small"
  const [screen, setScreen] = useState<"pending" | "ok" | "small">("pending");

  const config = useMemo(
    () => ({ ...CONFIG, PANEL_H: panelHeight, GAP: gap }),
    [panelHeight, gap],
  );
  const lens = useMemo(
    () => ({ ...LENS, blueColor: accentColor, background }),
    [accentColor, background],
  );
  const entryCfg = useMemo(() => ({ ...ENTRY, enabled: entry }), [entry]);

  // ---- viewport gate ----
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${minWidth}px)`);
    const update = () => setScreen(mq.matches ? "small" : "ok");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [minWidth]);

  // ---- engine lifecycle ----
  useEffect(() => {
    if (screen !== "ok" || !mountRef.current) return; // never boot WebGL on small screens
    const engine = createCarousel(mountRef.current, {
      cursorElement: cursorRef.current,
      projects,
      config,
      lens,
      entryCfg,
      onActiveChange: setActive,
      onFocusChange: setFocused,
      onEntryDone: setEntryDone,
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [screen, projects, config, lens, entryCfg]);

  // ---- overlay text transitions ----
  // GSAP-driven so they share the canvas animations' easing vocabulary.
  useEffect(() => {
    const top = topTextRef.current;
    const counter = counterRef.current;
    if (!top || !counter) return;
    if (!entryDone && entryCfg.enabled) {
      gsap.set([top, counter], { autoAlpha: 0 });
      revealPlayedRef.current = false;
      return; // stay hidden until the entry settles
    }
    gsap.set(top, { xPercent: -50 }); // GSAP owns the transform
    gsap.set(counter, { xPercent: -50 });
    const boxH = mountRef.current?.clientHeight ?? 0;
    const y = focused ? (UI_ANIM.topShiftPct / 100) * boxH : 0;

    if (entryDone && !focused && !revealPlayedRef.current) {
      // settle reveal: a slow fade with no movement, the counter trailing the
      // top text slightly. Runs ONCE after the entry, because closing focus
      // must not replay it (the heading would blink out and fade back in).
      revealPlayedRef.current = true;
      gsap.fromTo(
        top,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: UI_ANIM.revealDuration,
          ease: UI_ANIM.revealEase,
        },
      );
      gsap.fromTo(
        counter,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: UI_ANIM.revealDuration,
          ease: UI_ANIM.revealEase,
          delay: UI_ANIM.revealStagger,
        },
      );
      return;
    }

    // focus toggle transitions (quicker)
    gsap.to(top, {
      y,
      autoAlpha: 1,
      duration: UI_ANIM.duration,
      ease: UI_ANIM.ease,
    });
    gsap.to(counter, {
      autoAlpha: focused ? 0 : 1,
      duration: UI_ANIM.duration,
      ease: UI_ANIM.ease,
    });
  }, [focused, entryDone, entryCfg.enabled]);

  // Small screens get a plain holding screen instead of the carousel.
  // "pending" (first paint, viewport not measured yet) stays black too, so
  // phones never see a flash of the desktop experience booting.
  if (screen !== "ok") {
    return (
      <div className={className}>
        <style>{styles}</style>
        <div className="glens-small">
          {screen === "small" && <p>{smallScreenText}</p>}
        </div>
      </div>
    );
  }

  const current = projects[active] ?? projects[0];
  // the overlay only fades in once the entry settles, so hide it up front
  const hidden = entryCfg.enabled
    ? ({ opacity: 0, visibility: "hidden" } as const)
    : undefined;

  return (
    <div
      ref={mountRef}
      className={className ? `glens-root ${className}` : "glens-root"}
      style={{ background, color: textColor }}
    >
      <style>{styles}</style>

      <div ref={topTextRef} className="glens-top" style={hidden}>
        <div className="glens-top-inner">
          <p>{current.brand}</p>
          <p>{current.desc}</p>
        </div>
      </div>

      <div ref={counterRef} className="glens-counter" style={hidden}>
        <p>
          {String(active + 1).padStart(2, "0")}/
          {String(projects.length).padStart(2, "0")}
        </p>
      </div>

      <div ref={cursorRef} className="glens-cursor">
        View
      </div>

      <button
        type="button"
        onClick={() => engineRef.current?.closeFocus()}
        aria-label="Close"
        className="glens-close"
        style={{
          opacity: focused ? 1 : 0,
          pointerEvents: focused ? "auto" : "none",
        }}
      >
        Close
      </button>
    </div>
  );
}

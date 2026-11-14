"use client";

/**
 * Neon Sign Scene: a port of basement.studio's lab experiment 36 from React
 * Three Fiber and drei to vanilla three.js inside one React effect, with the
 * lightbox sign redrawn as the BLANK wordmark.
 *
 * Mechanism. A fov 10 camera looks up at a lightbox sign hanging in a dark
 * room corner and orbits it on a 40s ellipse until the cursor moves; then it
 * eases to a spherical offset taken from the cursor and resumes 2.5s after the
 * last move. The room is lit by a 0.02 ambient light and an environment map
 * that a cube camera re-renders every frame: an HDR city panorama with six
 * white rect lights sliding past it at 35 units/s, so reflections on the walls
 * sweep. Two seconds after load a gsap timeline flickers the sign's emission
 * (on, fade, on, fade, then a 2s sine rise to 0.54) and drives the ambient
 * light with it. Film noise, bloom and a vignette sit on top, and a thousand
 * additive points drift on 2D simplex noise.
 *
 * Bloom follows postprocessing 6.36, the version the source shipped: its
 * luminance pass weights each colour by its own luminance, which 6.37+ drops.
 * The port carries that shader.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import {
  BlendFunction,
  BloomEffect,
  type Effect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import { type CSSProperties, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  type GLTF,
  GLTFLoader,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

gsap.registerPlugin(CustomEase);

const ASSET_BASE = "https://ui.aryank.space/assets/neon-sign-scene";

/** One step of the neon timeline. No duration makes it a set, like gsap's .set(). */
export interface NeonSignFlickerStep {
  value: number;
  duration?: number;
  delay?: number;
  /** gsap ease name. Omitted, it is the source's default curve. */
  ease?: string;
}

export interface NeonSignSceneProps {
  /** GLB with the SCENE.001 room and Cartel.001 sign meshes. */
  modelSrc?: string;
  /** Equirectangular HDR behind the moving rect lights in the environment. */
  environmentSrc?: string;
  /** "blank" draws the BLANK mark on the lightbox; "model" keeps the GLB's sign texture. */
  sign?: "blank" | "model";
  /** Width over height. The source canvas is 21:9. */
  ratio?: number;
  vignetteOffset?: number;
  vignetteDarkness?: number;
  vignetteOpacity?: number;
  bloomRadius?: number;
  bloomLuminanceSmoothing?: number;
  bloomLuminanceThreshold?: number;
  /** Colour-dodge film noise opacity. 0 removes the effect. */
  noiseOpacity?: number;
  /** Sign emission once the flicker settles. */
  neonTarget?: number;
  /** Ambient intensity at neon 0 and neon 1; it follows the neon linearly. */
  ambientRange?: [number, number];
  /** Orbit swing: x scales the azimuth, y the polar angle (both times pi). */
  rotationMultipliers?: { x: number; y: number };
  particleSize?: number;
  /** Noise speed of the particle drift. */
  particleVelocity?: number;
  /** World units per second the environment's rect lights travel. */
  spotSpeed?: number;
  spotIntensity?: number;
  /** Seconds after load before the flicker starts. */
  flickerDelay?: number;
  /** Neon timeline. Defaults to the source's, built from neonTarget. */
  flicker?: NeonSignFlickerStep[];
  className?: string;
  style?: CSSProperties;
}

const CAMERA_POSITION = new THREE.Vector3(
  3.8974264860083605,
  0.82,
  -2.3958733109675228,
);
const CAMERA_TARGET = new THREE.Vector3(-0.15, 2.25, 1.12);
/** gsap DURATION in the source's lib/gsap: 0.8 / golden ratio. */
const DURATION = 0.8 * (1 / ((1 + Math.sqrt(5)) / 2));
const FULL_ROTATION_DURATION = DURATION * 80;
const AUTO_ROTATE_TIMEOUT_MS = 2500;
/** The source's lib/gsap default ease, used by every tween without its own. */
const DEFAULT_EASE = "M0,0 C0.30,0.35 0.40,1 1,1";

/** x offsets of the six rect lights; each sits 6 units further down the track. */
const SPOT_POSITIONS = [2, 0, 2, 0, 2, 0];
const SPOT_INTERVAL = 120;
const PARTICLE_COUNT = 1000;

/**
 * Wordmark box in the 1024px sign emission texture, measured from the source
 * texture: x 285..697, y 455..518 (centre 491.5, 487). The BLANK mark takes
 * the same width and centre. LETTER_RECT also covers the subtitle line
 * (x 374..607, y 535..546), padded by 4px, and is painted white first.
 */
const WORDMARK = { centerX: 491.5, centerY: 487, width: 413 };
const LETTER_RECT = { x: 281, y: 451, width: 421, height: 100 };
/** blank-mark.svg, viewBox 0 0 1030 240, even-odd, all five letters. */
const MARK_SIZE = { width: 1030, height: 240 };
const MARK_PATH =
  "M218.00 96.00L218.00 40.00L178.00 0.00L84.00 0.00L84.00 9.00L83.95 9.98L83.81 10.95L83.57 11.90L83.24 12.83L82.82 13.71L82.31 14.56L81.73 15.34L81.07 16.07L80.34 16.73L79.56 17.31L78.71 17.82L77.83 18.24L76.90 18.57L75.95 18.81L74.98 18.95L74.00 19.00L73.02 18.95L72.05 18.81L71.10 18.57L70.17 18.24L69.29 17.82L68.44 17.31L67.66 16.73L66.93 16.07L66.27 15.34L65.69 14.56L65.18 13.71L64.76 12.83L64.43 11.90L64.19 10.95L64.05 9.98L64.00 9.00L64.00 0.00L0.00 0.00L0.00 240.00L178.00 240.00L218.00 200.00L218.00 144.00L182.00 120.00Z" +
  "M145.94 42.47L148.82 43.84L151.56 45.48L154.12 47.38L156.48 49.52L158.62 51.88L160.52 54.44L162.16 57.18L163.53 60.06L164.60 63.07L165.38 66.16L165.84 69.31L166.00 72.50L165.84 75.69L165.38 78.84L164.60 81.93L163.53 84.94L162.16 87.82L160.52 90.56L158.62 93.12L156.48 95.48L154.12 97.62L151.56 99.52L148.82 101.16L145.94 102.53L142.93 103.60L139.84 104.38L136.69 104.84L133.50 105.00L62.00 105.00L62.00 40.00L133.50 40.00L136.69 40.16L139.84 40.62L142.93 41.40Z" +
  "M142.93 136.40L145.94 137.47L148.82 138.84L151.56 140.48L154.12 142.38L156.48 144.52L158.62 146.88L160.52 149.44L162.16 152.18L163.53 155.06L164.60 158.07L165.38 161.16L165.84 164.31L166.00 167.50L165.84 170.69L165.38 173.84L164.60 176.93L163.53 179.94L162.16 182.82L160.52 185.56L158.62 188.12L156.48 190.48L154.12 192.62L151.56 194.52L148.82 196.16L145.94 197.53L142.93 198.60L139.84 199.38L136.69 199.84L133.50 200.00L62.00 200.00L62.00 135.00L133.50 135.00L136.69 135.16L139.84 135.62Z" +
  " " +
  "M302.00 218.00L302.00 22.00L280.00 0.00L240.00 0.00L240.00 240.00L280.00 240.00Z" +
  " " +
  "M548.00 0.00L486.00 0.00L486.00 9.00L485.99 9.49L485.95 9.98L485.89 10.47L485.81 10.95L485.70 11.43L485.57 11.90L485.42 12.37L485.24 12.83L485.04 13.28L484.82 13.71L484.58 14.14L484.31 14.56L484.03 14.96L483.73 15.34L483.41 15.72L483.07 16.07L482.72 16.41L482.34 16.73L481.96 17.03L481.56 17.31L481.14 17.58L480.71 17.82L480.28 18.04L479.83 18.24L479.37 18.42L478.90 18.57L478.43 18.70L477.95 18.81L477.47 18.89L476.98 18.95L476.49 18.99L476.00 19.00L475.51 18.99L475.02 18.95L474.53 18.89L474.05 18.81L473.57 18.70L473.10 18.57L472.63 18.42L472.17 18.24L471.72 18.04L471.29 17.82L470.86 17.58L470.44 17.31L470.04 17.03L469.66 16.73L469.28 16.41L468.93 16.07L468.59 15.72L468.27 15.34L467.97 14.96L467.69 14.56L467.42 14.14L467.18 13.71L466.96 13.28L466.76 12.83L466.58 12.37L466.43 11.90L466.30 11.43L466.19 10.95L466.11 10.47L466.05 9.98L466.01 9.49L466.00 9.00L466.00 0.00L364.00 0.00L324.00 40.00L324.00 200.00L364.00 240.00L548.00 240.00Z" +
  "M456.00 200.00L453.38 199.96L450.77 199.83L448.16 199.61L445.56 199.32L442.97 198.93L440.39 198.46L437.83 197.91L435.29 197.27L432.78 196.56L430.28 195.75L427.82 194.87L425.39 193.91L422.98 192.87L420.62 191.75L418.29 190.55L416.00 189.28L413.75 187.94L411.55 186.52L409.40 185.03L407.30 183.47L405.25 181.84L403.25 180.15L401.31 178.39L399.43 176.57L397.61 174.69L395.85 172.75L394.16 170.75L392.53 168.70L390.97 166.60L389.48 164.45L388.06 162.25L386.72 160.00L385.45 157.71L384.25 155.38L383.13 153.02L382.09 150.61L381.13 148.18L380.25 145.72L379.44 143.22L378.73 140.71L378.09 138.17L377.54 135.61L377.07 133.03L376.68 130.44L376.39 127.84L376.17 125.23L376.04 122.62L376.00 120.00L376.04 117.38L376.17 114.77L376.39 112.16L376.68 109.56L377.07 106.97L377.54 104.39L378.09 101.83L378.73 99.29L379.44 96.78L380.25 94.28L381.13 91.82L382.09 89.39L383.13 86.98L384.25 84.62L385.45 82.29L386.72 80.00L388.06 77.75L389.48 75.55L390.97 73.40L392.53 71.30L394.16 69.25L395.85 67.25L397.61 65.31L399.43 63.43L401.31 61.61L403.25 59.85L405.25 58.16L407.30 56.53L409.40 54.97L411.55 53.48L413.75 52.06L416.00 50.72L418.29 49.45L420.62 48.25L422.98 47.13L425.39 46.09L427.82 45.13L430.28 44.25L432.78 43.44L435.29 42.73L437.83 42.09L440.39 41.54L442.97 41.07L445.56 40.68L448.16 40.39L450.77 40.17L453.38 40.04L456.00 40.00L486.00 40.00L486.00 45.85L486.00 194.15L486.00 200.00Z" +
  " " +
  "M652.00 0.00L652.00 9.00L651.99 9.49L651.95 9.98L651.89 10.47L651.81 10.95L651.70 11.43L651.57 11.90L651.42 12.37L651.24 12.83L651.04 13.28L650.82 13.71L650.58 14.14L650.31 14.56L650.03 14.96L649.73 15.34L649.41 15.72L649.07 16.07L648.72 16.41L648.34 16.73L647.96 17.03L647.56 17.31L647.14 17.58L646.71 17.82L646.28 18.04L645.83 18.24L645.37 18.42L644.90 18.57L644.43 18.70L643.95 18.81L643.47 18.89L642.98 18.95L642.49 18.99L642.00 19.00L641.51 18.99L641.02 18.95L640.53 18.89L640.05 18.81L639.57 18.70L639.10 18.57L638.63 18.42L638.17 18.24L637.72 18.04L637.29 17.82L636.86 17.58L636.44 17.31L636.04 17.03L635.66 16.73L635.28 16.41L634.93 16.07L634.59 15.72L634.27 15.34L633.97 14.96L633.69 14.56L633.42 14.14L633.18 13.71L632.96 13.28L632.76 12.83L632.58 12.37L632.43 11.90L632.30 11.43L632.19 10.95L632.11 10.47L632.05 9.98L632.01 9.49L632.00 9.00L632.00 0.00L570.00 0.00L570.00 240.00L632.00 240.00L632.00 96.00L632.00 95.00L632.03 93.20L632.12 91.40L632.26 89.61L632.47 87.82L632.73 86.04L633.06 84.27L633.44 82.51L633.87 80.76L634.37 79.03L634.92 77.32L635.53 75.63L636.19 73.95L636.90 72.30L637.67 70.67L638.49 69.07L639.37 67.50L640.29 65.96L641.27 64.44L642.29 62.96L643.37 61.52L644.48 60.11L645.65 58.74L646.86 57.40L648.11 56.11L649.40 54.86L650.74 53.65L652.11 52.48L653.52 51.37L654.96 50.29L656.44 49.27L657.96 48.29L659.50 47.37L661.07 46.49L662.67 45.67L664.30 44.90L665.95 44.19L667.63 43.53L669.32 42.92L671.03 42.37L672.76 41.87L674.51 41.44L676.27 41.06L678.04 40.73L679.82 40.47L681.61 40.26L683.40 40.12L685.20 40.03L687.00 40.00L688.80 40.03L690.60 40.12L692.39 40.26L694.18 40.47L695.96 40.73L697.73 41.06L699.49 41.44L701.24 41.87L702.97 42.37L704.68 42.92L706.37 43.53L708.05 44.19L709.70 44.90L711.33 45.67L712.93 46.49L714.50 47.37L716.04 48.29L717.56 49.27L719.04 50.29L720.48 51.37L721.89 52.48L723.26 53.65L724.60 54.86L725.89 56.11L727.14 57.40L728.35 58.74L729.52 60.11L730.63 61.52L731.71 62.96L732.73 64.44L733.71 65.96L734.63 67.50L735.51 69.07L736.33 70.67L737.10 72.30L737.81 73.95L738.47 75.63L739.08 77.32L739.63 79.03L740.13 80.76L740.56 82.51L740.94 84.27L741.27 86.04L741.53 87.82L741.74 89.61L741.88 91.40L741.97 93.20L742.00 95.00L742.00 96.00L742.00 240.00L782.00 240.00L804.00 218.00L804.00 40.00L764.00 0.00Z" +
  " " +
  "M907.89 73.11L907.81 73.59L907.70 74.07L907.57 74.54L907.42 75.01L907.24 75.47L907.04 75.92L906.82 76.35L906.58 76.78L906.31 77.20L906.03 77.60L905.73 77.98L905.41 78.36L905.07 78.71L904.72 79.05L904.34 79.37L903.96 79.67L903.56 79.95L903.14 80.22L902.71 80.46L902.28 80.68L901.83 80.88L901.37 81.06L900.90 81.21L900.43 81.34L899.95 81.45L899.47 81.53L898.98 81.59L898.49 81.63L898.00 81.64L897.51 81.63L897.02 81.59L896.53 81.53L896.05 81.45L895.57 81.34L895.10 81.21L894.63 81.06L894.17 80.88L893.72 80.68L893.29 80.46L892.86 80.22L892.44 79.95L892.04 79.67L891.66 79.37L891.28 79.05L890.93 78.71L890.59 78.36L890.27 77.98L889.97 77.60L889.69 77.20L889.42 76.78L889.18 76.35L888.96 75.92L888.76 75.47L888.58 75.01L888.43 74.54L888.30 74.07L888.19 73.59L888.11 73.11L888.05 72.62L888.01 72.13L888.00 71.64L888.00 64.00L888.00 0.00L826.00 0.00L826.00 240.00L888.00 240.00L888.00 176.00L888.00 168.36L888.01 167.87L888.05 167.38L888.11 166.89L888.19 166.41L888.30 165.93L888.43 165.46L888.58 164.99L888.76 164.53L888.96 164.08L889.18 163.65L889.42 163.22L889.69 162.80L889.97 162.40L890.27 162.02L890.59 161.64L890.93 161.29L891.28 160.95L891.66 160.63L892.04 160.33L892.44 160.05L892.86 159.78L893.29 159.54L893.72 159.32L894.17 159.12L894.63 158.94L895.10 158.79L895.57 158.66L896.05 158.55L896.53 158.47L897.02 158.41L897.51 158.37L898.00 158.36L898.49 158.37L898.98 158.41L899.47 158.47L899.95 158.55L900.43 158.66L900.90 158.79L901.37 158.94L901.83 159.12L902.28 159.32L902.71 159.54L903.14 159.78L903.56 160.05L903.96 160.33L904.34 160.63L904.72 160.95L905.07 161.29L905.41 161.64L905.73 162.02L906.03 162.40L906.31 162.80L906.58 163.22L906.82 163.65L907.04 164.08L907.24 164.53L907.42 164.99L907.57 165.46L907.70 165.93L907.81 166.41L907.89 166.89L907.95 167.38L907.99 167.87L908.00 168.36L908.00 196.00L952.00 240.00L1030.00 240.00L910.00 120.00L1030.00 0.00L952.00 0.00L908.00 44.00L908.00 71.64L907.99 72.13L907.95 72.62Z";
const PARTICLES_VERT = /* glsl */ `
// Array and textureless GLSL 2D simplex noise. Ian McEwan, Ashima Arts.
// MIT License. https://github.com/ashima/webgl-noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise2(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uParticleVelocity;
uniform float uParticleDisplaceFactor;

attribute float aScale;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float noiseX = snoise2(vec2(position.x, uTime * uParticleVelocity)) * uParticleDisplaceFactor;
  float noiseY = snoise2(vec2(position.y, uTime * uParticleVelocity)) * uParticleDisplaceFactor;
  float noiseZ = snoise2(vec2(position.z, uTime * uParticleVelocity)) * uParticleDisplaceFactor;

  modelPosition = vec4(
    modelPosition.x + noiseX,
    modelPosition.y + noiseY,
    modelPosition.z + noiseZ,
    modelPosition.w
  );

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  gl_PointSize = uSize * aScale * uPixelRatio;
  gl_PointSize *= (1.0 / - viewPosition.z);
}
`;

const PARTICLES_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uAlpha;

void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = min(0.05 / distanceToCenter - 0.1, uAlpha);
  gl_FragColor = vec4(uColor, strength);
}
`;

/**
 * postprocessing 6.36's luminance.frag. With COLOR defined (the bloom pass) it
 * outputs rgb * clamp(smoothstep(threshold, threshold + smoothing, l) * l),
 * where 6.37+ outputs rgb * smoothstep(...), a brighter bloom.
 */
const LUMINANCE_FRAG_636 = `#include <common>
#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#ifdef RANGE
uniform vec2 range;
#elif defined(THRESHOLD)
uniform float threshold;uniform float smoothing;
#endif
varying vec2 vUv;void main(){vec4 texel=texture2D(inputBuffer,vUv);float l=luminance(texel.rgb);
#ifdef RANGE
float low=step(range.x,l);float high=step(l,range.y);l*=low*high;
#elif defined(THRESHOLD)
l=smoothstep(threshold,threshold+smoothing,l)*l;
#endif
#ifdef COLOR
gl_FragColor=vec4(texel.rgb*clamp(l,0.0,1.0),l);
#else
gl_FragColor=vec4(l);
#endif
}`;

/** The source's neon timeline: on, fade, on, fade, then a slow rise. */
function defaultFlicker(target: number): NeonSignFlickerStep[] {
  return [
    { value: target },
    { value: 0, duration: 0.25, delay: 0.2 },
    { value: target },
    { value: 0, duration: 0.25, delay: 0.2 },
    { value: target, duration: 2, delay: 1, ease: "sine.out" },
  ];
}

function createParticles() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const scale = new Float32Array(PARTICLE_COUNT);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    scale[i] = 1;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
  return geometry;
}

/**
 * The rect lights of drei's <Lightformer form="rect">: a unit plane with an
 * unlit, double-sided, untonemapped material whose colour is white * intensity.
 */
function createSpots(intensity: number) {
  const outer = new THREE.Group();
  outer.position.set(0, 4, 0);
  outer.rotation.set(0, 0, -Math.PI / 2);
  const track = new THREE.Group();
  outer.add(track);
  const geometry = new THREE.PlaneGeometry();
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color("white").multiplyScalar(intensity),
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  SPOT_POSITIONS.forEach((x, i) => {
    const spot = new THREE.Mesh(geometry, material);
    spot.rotation.set(Math.PI / 2, 0, 0);
    spot.position.set(x, 4, i * 6);
    spot.scale.set(4, 1, 1);
    track.add(spot);
  });
  return { outer, track };
}

/**
 * Redraws the sign texture with the BLANK mark: copies the model's emission
 * image, paints the wordmark region white and draws the mark in black at the
 * wordmark's width and centre. The grey falloff around it is untouched.
 */
function createSignTexture(source: THREE.Texture) {
  const image = source.image as CanvasImageSource & {
    width: number;
    height: number;
  };
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0);
  const s = image.width / 1024;
  ctx.fillStyle = "#fff";
  ctx.fillRect(
    LETTER_RECT.x * s,
    LETTER_RECT.y * s,
    LETTER_RECT.width * s,
    LETTER_RECT.height * s,
  );
  const k = (WORDMARK.width / MARK_SIZE.width) * s;
  ctx.setTransform(
    k,
    0,
    0,
    k,
    WORDMARK.centerX * s - (MARK_SIZE.width * k) / 2,
    WORDMARK.centerY * s - (MARK_SIZE.height * k) / 2,
  );
  ctx.fillStyle = "#000";
  ctx.fill(new Path2D(MARK_PATH), "evenodd");

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = source.flipY;
  texture.colorSpace = source.colorSpace;
  texture.wrapS = source.wrapS;
  texture.wrapT = source.wrapT;
  texture.minFilter = source.minFilter;
  texture.magFilter = source.magFilter;
  texture.channel = source.channel;
  return texture;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((node) => {
    if (!(node instanceof THREE.Mesh || node instanceof THREE.Points)) return;
    node.geometry.dispose();
    const materials: THREE.Material[] = Array.isArray(node.material)
      ? node.material
      : [node.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    }
  });
}

export default function XeroScene({
  modelSrc = `${ASSET_BASE}/neon-sign.glb`,
  environmentSrc = `${ASSET_BASE}/potsdamer-platz-1k.hdr`,
  sign = "blank",
  ratio = 21 / 9,
  vignetteOffset = 0.46,
  vignetteDarkness = 0.64,
  vignetteOpacity = 0.73,
  bloomRadius = 0.64,
  bloomLuminanceSmoothing = 0.4,
  bloomLuminanceThreshold = 0.87,
  noiseOpacity = 0.2,
  neonTarget = 0.54,
  ambientRange = [0.02, 1],
  rotationMultipliers = { x: 1 / 30, y: 1 / 40 },
  particleSize = 10,
  particleVelocity = 0.1,
  spotSpeed = 35,
  spotIntensity = 5,
  flickerDelay = 2,
  flicker,
  className,
  style,
}: NeonSignSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Object props compare by value so inline literals do not rebuild the scene.
  const ambientKey = JSON.stringify(ambientRange);
  const rotationKey = JSON.stringify(rotationMultipliers);
  const flickerKey = JSON.stringify(flicker ?? defaultFlicker(neonTarget));

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const [ambientMin, ambientMax] = JSON.parse(ambientKey) as [number, number];
    const multipliers = JSON.parse(rotationKey) as { x: number; y: number };
    const steps = JSON.parse(flickerKey) as NeonSignFlickerStep[];
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    let width = Math.max(root.clientWidth, 1);
    let height = Math.max(root.clientHeight, 1);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // The source's EffectComposer switches tone mapping off.
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const ambient = new THREE.AmbientLight(0xffffff, ambientMin);
    scene.add(ambient);

    const camera = new THREE.PerspectiveCamera(10, width / height, 0.1, 10);
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(CAMERA_TARGET);

    // Environment: drei's <Environment preset="city" frames={Infinity}
    // resolution={512}> with children. A cube camera at the origin of a
    // private scene renders the HDR background and the moving rect lights
    // into a half-float cube target every frame. drei hands it to the room as
    // scene.environment; here it is each material's own envMap, because since
    // three r163 a material lit by scene.environment takes
    // scene.environmentIntensity (1) instead of its envMapIntensity, and the
    // source (r159) relies on the room's 0.08 and the sign's 0.
    const envScene = new THREE.Scene();
    const envTarget = new THREE.WebGLCubeRenderTarget(512);
    envTarget.texture.type = THREE.HalfFloatType;
    const cubeCamera = new THREE.CubeCamera(1, 1000, envTarget);
    envScene.add(cubeCamera);
    const spots = createSpots(spotIntensity);
    envScene.add(spots.outer);

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uParticleVelocity: { value: particleVelocity },
        uParticleDisplaceFactor: { value: 0.5 },
        uPixelRatio: { value: pixelRatio },
        uSize: { value: particleSize },
        uColor: { value: new THREE.Color("#fff") },
        uAlpha: { value: 0.25 },
      },
      vertexShader: PARTICLES_VERT,
      fragmentShader: PARTICLES_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(createParticles(), particleMaterial);

    const world = new THREE.Group();
    world.position.set(-0.5, 1.25, 0.95);
    scene.add(world);
    scene.add(particles);

    // The source's react-three/postprocessing composer: half float buffers
    // and its default 8x multisampling (the source misspells the prop that
    // would turn it off). The three effects merge into one pass, in order.
    const composer = new EffectComposer(renderer, {
      multisampling: renderer.capabilities.isWebGL2 ? 8 : 0,
      frameBufferType: THREE.HalfFloatType,
    });
    composer.addPass(new RenderPass(scene, camera));
    const effects: Effect[] = [];
    if (noiseOpacity > 0) {
      const noise = new NoiseEffect({
        blendFunction: BlendFunction.COLOR_DODGE,
      });
      noise.blendMode.opacity.value = noiseOpacity;
      effects.push(noise);
    }
    const bloom = new BloomEffect({
      blendFunction: BlendFunction.ADD,
      mipmapBlur: true,
      radius: bloomRadius,
      luminanceThreshold: bloomLuminanceThreshold,
      luminanceSmoothing: bloomLuminanceSmoothing,
    });
    bloom.luminanceMaterial.fragmentShader = LUMINANCE_FRAG_636;
    bloom.luminanceMaterial.needsUpdate = true;
    effects.push(bloom);
    const vignette = new VignetteEffect({
      offset: vignetteOffset,
      darkness: vignetteDarkness,
    });
    vignette.blendMode.opacity.value = vignetteOpacity;
    effects.push(vignette);
    composer.addPass(new EffectPass(camera, ...effects));
    composer.setSize(width, height);

    // Camera: CamTargetRotation. The cursor (or the orbit) maps to a
    // spherical offset around the target; the camera moves to target + offset
    // and looks at the target.
    const offset = new THREE.Vector3();
    const spherical = new THREE.Spherical();
    const cameraPosition = (x: number, y: number) => {
      offset.copy(CAMERA_POSITION).sub(CAMERA_TARGET);
      spherical.setFromVector3(offset);
      spherical.theta += Math.PI * x * multipliers.x;
      spherical.phi += -(Math.PI * y) * multipliers.y;
      return offset.setFromSpherical(spherical).add(CAMERA_TARGET);
    };
    const lookAtTarget = () => camera.lookAt(CAMERA_TARGET);
    const updateCam = (x: number, y: number, immediate: boolean) => {
      const { x: px, y: py, z: pz } = cameraPosition(x, y);
      if (immediate) {
        // gsap.set(..., { overwrite: true }) without creating a tween: gsap
        // 3.12+ adds tweens made inside a context's callbacks to that context,
        // so the orbit's per-frame sets would pile up in it and its revert
        // would rewind the camera through all of them.
        gsap.killTweensOf(camera.position);
        camera.position.set(px, py, pz);
        lookAtTarget();
        return;
      }
      gsap.to(camera.position, {
        overwrite: true,
        duration: DURATION,
        x: px,
        y: py,
        z: pz,
        ease: "power2.out",
        onUpdate: lookAtTarget,
      });
    };

    // Auto orbit, with the source's React state flow: a cursor move reverts
    // the orbit, and 2.5s after the last move the camera eases back over 10s
    // before the orbit restarts.
    let autoRotate = true;
    let orbitStarted = false;
    let orbit: gsap.Context | null = null;
    let autoRotateTimer = 0;
    const startOrbit = () => {
      orbit = gsap.context(() => {
        const home = cameraPosition(Math.sin(0), Math.cos(0)).clone();
        const angle = { x: 0, y: 0 };
        const timeline = gsap.timeline();
        if (orbitStarted) {
          timeline.to(camera.position, {
            duration: FULL_ROTATION_DURATION / 4,
            ease: "none",
            x: home.x,
            y: home.y,
            z: home.z,
            onUpdate: lookAtTarget,
          });
        }
        timeline.to(angle, {
          duration: FULL_ROTATION_DURATION,
          repeat: -1,
          ease: "none",
          x: Math.PI * 2,
          y: Math.PI * 2,
          onUpdate: () => updateCam(Math.sin(angle.x), Math.cos(angle.y), true),
        });
        orbitStarted = true;
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      window.clearTimeout(autoRotateTimer);
      autoRotateTimer = window.setTimeout(() => {
        autoRotate = true;
        if (!reducedMotion) startOrbit();
      }, AUTO_ROTATE_TIMEOUT_MS);
      updateCam(x, y, false);
      if (autoRotate) {
        autoRotate = false;
        // gsap 3.11 (the source's) fired onUpdate while reverting a context,
        // so the orbit's last callback sets the camera to the orbit start
        // pose and overwrites the cursor tween above. The first move after
        // the orbit snaps there; later moves ease to the cursor.
        orbit?.revert({ suppressEvents: false });
        orbit = null;
      }
    };
    root.addEventListener("pointermove", onPointerMove, { passive: true });

    // Neon: the emission colour and the ambient light follow one value.
    let signMaterial: THREE.MeshStandardMaterial | null = null;
    const setNeon = (v: number) => {
      ambient.intensity = THREE.MathUtils.lerp(ambientMin, ambientMax, v);
      signMaterial?.emissive.setRGB(v, v, v);
    };
    let neonTimeline: gsap.core.Timeline | null = null;
    let neonSettled = false;
    const startFlicker = () => {
      if (neonTimeline || neonSettled) return;
      if (reducedMotion) {
        setNeon(steps.at(-1)?.value ?? neonTarget);
        neonSettled = true;
        return;
      }
      const neon = { value: 0 };
      const defaultEase = CustomEase.create("neonSignDefault", DEFAULT_EASE);
      const timeline = gsap.timeline({
        delay: flickerDelay,
        onUpdate: () => setNeon(neon.value),
      });
      for (const step of steps) {
        if (!step.duration) {
          if (step.delay) timeline.to({}, { duration: step.delay });
          timeline.set(neon, { value: step.value });
        } else {
          timeline.to(neon, {
            value: step.value,
            duration: step.duration,
            delay: step.delay ?? 0,
            ease: step.ease ?? defaultEase,
          });
        }
      }
      neonTimeline = timeline;
    };

    // Frame order follows the source: gsap's tweens update first, then the
    // scene renders (a ticker listener runs after gsap's root update). The
    // flicker starts with the loop, like the source's layout effect; the
    // orbit starts after the first frame, like its passive effect.
    let running = false;
    let loaded = false;
    let inView = false;
    let started = false;
    let lastTime = 0;
    let elapsed = 0;
    const render = () => {
      const now = performance.now();
      const delta = Math.min(Math.max((now - lastTime) / 1000, 0), 0.25);
      lastTime = now;
      if (!reducedMotion) {
        elapsed += delta;
        spots.track.position.z += delta * spotSpeed;
        if (spots.track.position.z > SPOT_INTERVAL) {
          spots.track.position.z = -SPOT_INTERVAL;
        }
      }
      particleMaterial.uniforms.uTime.value = elapsed;
      cubeCamera.update(renderer, envScene);
      composer.render(delta);
      if (!started) {
        started = true;
        if (!reducedMotion) startOrbit();
      }
    };
    const syncLoop = () => {
      const shouldRun = loaded && inView;
      if (shouldRun && !running) {
        running = true;
        lastTime = performance.now();
        gsap.ticker.add(render);
      } else if (!shouldRun && running) {
        running = false;
        gsap.ticker.remove(render);
      }
      if (shouldRun) startFlicker();
    };

    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry?.isIntersecting ?? false;
      syncLoop();
    });
    intersection.observe(root);

    const resize = new ResizeObserver(() => {
      width = Math.max(root.clientWidth, 1);
      height = Math.max(root.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
    });
    resize.observe(root);

    // The source suspends until both the model and the HDR have loaded.
    let disposed = false;
    let model: THREE.Object3D | null = null;
    let hdr: THREE.DataTexture | null = null;
    let signTexture: THREE.Texture | null = null;
    Promise.all([
      new GLTFLoader().loadAsync(modelSrc),
      new HDRLoader().loadAsync(environmentSrc),
    ])
      .then(([gltf, environment]: [GLTF, THREE.DataTexture]) => {
        if (disposed) {
          disposeObject(gltf.scene);
          environment.dispose();
          return;
        }
        hdr = environment;
        environment.mapping = THREE.EquirectangularReflectionMapping;
        envScene.background = environment;

        gltf.scene.traverse((node) => {
          if (!(node instanceof THREE.Mesh)) return;
          const material = node.material as THREE.MeshStandardMaterial;
          material.envMap = envTarget.texture;
          if (material.name === "SCENE.001") material.envMapIntensity = 0.08;
          if (material.name !== "Cartel.001") return;
          material.toneMapped = false;
          material.emissive.setRGB(0, 0, 0);
          material.emissiveIntensity = 1;
          material.envMapIntensity = 0;
          signMaterial = material;
          if (sign !== "blank" || !material.emissiveMap) return;
          const texture = createSignTexture(material.emissiveMap);
          if (!texture) return;
          signTexture = texture;
          material.map?.dispose();
          material.emissiveMap.dispose();
          material.normalMap?.dispose();
          material.map = texture;
          material.emissiveMap = texture;
          // The normal map only embossed the old letters.
          material.normalMap = null;
          material.needsUpdate = true;
        });
        world.add(gltf.scene);
        model = gltf.scene;

        updateCam(Math.sin(0), Math.cos(Math.PI / 2), true);
        loaded = true;
        syncLoop();
      })
      .catch((error: unknown) => {
        console.error("neon-sign-scene: failed to load assets", error);
      });

    return () => {
      disposed = true;
      root.removeEventListener("pointermove", onPointerMove);
      window.clearTimeout(autoRotateTimer);
      intersection.disconnect();
      resize.disconnect();
      gsap.ticker.remove(render);
      neonTimeline?.kill();
      orbit?.revert();
      gsap.killTweensOf(camera.position);
      if (model) disposeObject(model);
      signTexture?.dispose();
      hdr?.dispose();
      disposeObject(spots.outer);
      disposeObject(particles);
      envTarget.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [
    modelSrc,
    environmentSrc,
    sign,
    vignetteOffset,
    vignetteDarkness,
    vignetteOpacity,
    bloomRadius,
    bloomLuminanceSmoothing,
    bloomLuminanceThreshold,
    noiseOpacity,
    neonTarget,
    ambientKey,
    rotationKey,
    particleSize,
    particleVelocity,
    spotSpeed,
    spotIntensity,
    flickerDelay,
    flickerKey,
  ]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: String(ratio),
        overflow: "hidden",
        background: "#000",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}

"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const TRAIL_LENGTH = 12;
const NOISE_SIZE = 256;

/**
 * Deterministic gradient-vector noise, generated once per module.
 * Park-Miller LCG so the field is identical on every machine and reload:
 * RG hold cos/sin of a random angle, B an unrelated random scalar.
 */
function generateNoiseTexture() {
  const size = NOISE_SIZE;
  const data = new Uint8Array(size * size * 4);
  let seed = 48271;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const angle = rand() * Math.PI * 2;
      data[idx] = ((Math.cos(angle) * 0.5 + 0.5) * 255) | 0;
      data[idx + 1] = ((Math.sin(angle) * 0.5 + 0.5) * 255) | 0;
      data[idx + 2] = (rand() * 255) | 0;
      data[idx + 3] = 255;
    }
  }
  return data;
}

let noiseData: Uint8Array | null = null;
function getNoiseData() {
  if (!noiseData) noiseData = generateNoiseTexture();
  return noiseData;
}

/** Warm gradient stand-in so the component renders with no image supplied. */
const DEFAULT_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
<defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="#2D1B69"/><stop offset="30%" stop-color="#6B3FA0"/>
<stop offset="60%" stop-color="#E8475F"/><stop offset="100%" stop-color="#FFC857"/>
</linearGradient></defs>
<rect width="600" height="400" fill="url(#a)"/>
<circle cx="180" cy="150" r="80" fill="#ffffff" opacity="0.12"/>
<circle cx="420" cy="280" r="110" fill="#ffffff" opacity="0.08"/>
<circle cx="350" cy="100" r="50" fill="#ffffff" opacity="0.1"/>
</svg>`,
)}`;

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

function buildFragmentShader(lowQuality: boolean) {
  const trailCount = lowQuality ? 6 : TRAIL_LENGTH;
  const fbmOctaves = lowQuality ? 2 : 4;
  return `
precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform sampler2D uTexture;
uniform sampler2D uNoiseTex;
uniform vec2 uImageSize;
uniform vec3 uEffectColor1;
uniform vec3 uEffectColor2;
uniform vec3 uEffectColor3;
uniform vec3 uEffectColor4;
uniform float uRadius;
uniform float uStrength;
uniform float uSpeed;
uniform float uDistortion;
uniform float uHueShift;
uniform float uColorCycle;
uniform float uShowGradient;
uniform vec2 uPadding;
uniform vec2 uTrail[${TRAIL_LENGTH}];
uniform vec2 uTrailVelocities[${TRAIL_LENGTH}];
uniform float uTrailStrengths[${TRAIL_LENGTH}];
uniform float uBurst;
uniform vec2 uBurstPos;
uniform float uObjectFit;

// -- texture-based gradient noise --

vec4 sampleImageTexture(vec2 uv) {
    vec2 clampedUv = clamp(uv, 0.0, 1.0);
    vec4 sampleColor = texture2D(uTexture, clampedUv);
    float inBounds =
        step(0.0, uv.x) *
        step(uv.x, 1.0) *
        step(0.0, uv.y) *
        step(uv.y, 1.0);
    float alpha = sampleColor.a * inBounds;
    vec3 rgb = alpha > 0.0001
        ? sampleColor.rgb / max(sampleColor.a, 0.0001)
        : vec3(0.0);
    return vec4(rgb, alpha);
}

vec2 noiseTexCoord(vec2 i) {
    return (floor(mod(i, 256.0)) + 0.5) / 256.0;
}

float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    vec2 g00 = texture2D(uNoiseTex, noiseTexCoord(i)).rg * 2.0 - 1.0;
    vec2 g10 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(1.0, 0.0))).rg * 2.0 - 1.0;
    vec2 g01 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(0.0, 1.0))).rg * 2.0 - 1.0;
    vec2 g11 = texture2D(uNoiseTex, noiseTexCoord(i + vec2(1.0, 1.0))).rg * 2.0 - 1.0;
    return mix(mix(dot(g00, f - vec2(0.0, 0.0)),
                   dot(g10, f - vec2(1.0, 0.0)), u.x),
               mix(dot(g01, f - vec2(0.0, 1.0)),
                   dot(g11, f - vec2(1.0, 1.0)), u.x), u.y);
}

mat2 rot(float a) {
    float c = cos(a); float s = sin(a);
    return mat2(c, -s, s, c);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = rot(0.37);
    for (int i = 0; i < ${fbmOctaves}; i++) {
        v += a * gnoise(p);
        p = r * p * 2.0 + vec2(13.7, 31.5);
        a *= 0.5;
    }
    return v;
}

${
  !lowQuality
    ? `
// -- curl noise (divergence-free flow field) --
vec2 curlNoise(vec2 p) {
    float eps = 0.1;
    float n1 = gnoise(p + vec2(0.0, eps));
    float n2 = gnoise(p - vec2(0.0, eps));
    float n3 = gnoise(p + vec2(eps, 0.0));
    float n4 = gnoise(p - vec2(eps, 0.0));
    float dFdy = (n1 - n2) / (2.0 * eps);
    float dFdx = (n3 - n4) / (2.0 * eps);
    return vec2(dFdy, -dFdx);
}
`
    : ""
}

// -- HSL helpers --

vec3 rgb2hsl(vec3 c) {
    float mx = max(max(c.r, c.g), c.b);
    float mn = min(min(c.r, c.g), c.b);
    float l = (mx + mn) * 0.5;
    if (mx == mn) return vec3(0.0, 0.0, l);
    float d = mx - mn;
    float s = l > 0.5 ? d / (2.0 - mx - mn) : d / (mx + mn);
    float h;
    if (mx == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
    else h = (c.r - c.g) / d + 4.0;
    h /= 6.0;
    return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0 / 2.0) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    return p;
}

vec3 hsl2rgb(vec3 hsl) {
    if (hsl.y == 0.0) return vec3(hsl.z);
    float q = hsl.z < 0.5 ? hsl.z * (1.0 + hsl.y) : hsl.z + hsl.y - hsl.z * hsl.y;
    float p = 2.0 * hsl.z - q;
    return vec3(
        hue2rgb(p, q, hsl.x + 1.0 / 3.0),
        hue2rgb(p, q, hsl.x),
        hue2rgb(p, q, hsl.x - 1.0 / 3.0)
    );
}

// -- main --

void main() {
    vec2 uv = vUv;
    float canvasAspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 imageAreaSize = uResolution * (1.0 - 2.0 * uPadding);
    float imageAreaAspect = imageAreaSize.x / max(imageAreaSize.y, 1.0);
    float imageAspect = uImageSize.x / max(uImageSize.y, 1.0);

    // remap from padded canvas to image-area UVs
    vec2 imageUv = (uv - uPadding) / (1.0 - 2.0 * uPadding);

    // object-fit UV mapping (within image area)
    // uObjectFit: 0 = cover, 1 = contain, 2 = fill
    vec2 texUv = imageUv;
    if (uObjectFit < 0.5) {
        // cover: scale to fill, crop excess
        if (imageAreaAspect > imageAspect) {
            float scale = imageAreaAspect / imageAspect;
            texUv.y = (imageUv.y - 0.5) / scale + 0.5;
        } else {
            float scale = imageAspect / imageAreaAspect;
            texUv.x = (imageUv.x - 0.5) / scale + 0.5;
        }
    } else if (uObjectFit < 1.5) {
        // contain: scale to fit entirely, letterbox
        if (imageAreaAspect > imageAspect) {
            float scale = imageAspect / imageAreaAspect;
            texUv.x = (imageUv.x - 0.5) / scale + 0.5;
        } else {
            float scale = imageAreaAspect / imageAspect;
            texUv.y = (imageUv.y - 0.5) / scale + 0.5;
        }
    }
    // fill (uObjectFit >= 1.5): texUv = imageUv as-is (stretch)
    texUv.y = 1.0 - texUv.y;

    float time = uTime * uSpeed;

    vec2 aspect = vec2(canvasAspect, 1.0);
    vec2 p = uv * aspect;
    float radiusScaled = uRadius * max(canvasAspect, 1.0);

    // -- flow field --
    ${
      !lowQuality
        ? `vec2 flowField = curlNoise(p * 2.0 + time * 0.3);`
        : `vec2 flowField = vec2(
               gnoise(p * 2.0 + time * 0.3 + vec2(0.0, 73.1)),
               gnoise(p * 2.0 + time * 0.3 + vec2(131.7, 0.0))
           ) * 0.5;`
    }

    // -- hover proximity (color shifts even when pointer is still) --
    float hoverDist = distance(p, uPointer * aspect);
    float hoverT = 1.0 - smoothstep(0.0, radiusScaled, hoverDist);
    float hoverInfluence = hoverT * hoverT * hoverT * uPointerActive * uStrength;
    float orbCore = pow(hoverT, 1.8) * uPointerActive;
    float orbHalo = pow(hoverT, 0.8) * uPointerActive;
    float orbRing = smoothstep(0.12, 0.58, hoverT) * (1.0 - smoothstep(0.58, 0.92, hoverT)) * uPointerActive;
    float orbPulse = (0.5 + 0.5 * sin(uTime * 1.2)) * (0.12 + 0.2 * orbCore);

    // -- trail: vortex + curl + smudge --
    float trailInfluence = 0.0;
    vec2 totalSwirl = vec2(0.0);

    for (int i = 0; i < ${trailCount}; i++) {
        float trailStr = uTrailStrengths[i];
        if (trailStr < 0.001) continue;
        vec2 trailPos = uTrail[i] * aspect;
        vec2 toTrail = p - trailPos;
        float dist = length(toTrail);
        float t = 1.0 - smoothstep(0.0, radiusScaled, dist);
        float influence = t * t * t * trailStr;

        // noise modulation for organic shape
        float noiseOff = gnoise(uv * 5.0 + time * 0.4 + float(i) * 1.7) * uDistortion;
        influence *= (1.0 + noiseOff * 0.6);
        trailInfluence += influence;

        vec2 vel = uTrailVelocities[i];
        float velMag = length(vel);

        // vortex spin: perpendicular to direction-to-point
        vec2 tangent = vec2(-toTrail.y, toTrail.x);
        float vortexStr = influence * velMag * 2.0;
        totalSwirl += tangent / max(dist, 0.02) * vortexStr * uDistortion * 0.4;

        // reduced linear smudge (still needed for directional push)
        if (velMag > 0.001) {
            totalSwirl += vel * influence * uDistortion * 0.3;
        }

        // curl flow contribution (organic turbulence)
        totalSwirl += flowField * influence * uDistortion * 0.25;
    }
    trailInfluence = clamp(trailInfluence, 0.0, 1.0) * uStrength * uPointerActive;

    // -- burst (independent of pointer active) --
    vec2 burstSwirl = vec2(0.0);
    float burstInfluence = 0.0;
    if (uBurst > 0.001) {
        float burstDist = distance(p, uBurstPos * aspect);
        float burstExpand = 1.0 + (1.0 - uBurst) * 2.0;
        float burstRadius = radiusScaled * burstExpand;
        float burstT = 1.0 - smoothstep(0.0, burstRadius, burstDist);
        burstInfluence = burstT * burstT * uBurst * uBurst * uStrength;
        vec2 burstDir = p - uBurstPos * aspect;
        float bdLen = length(burstDir);
        if (bdLen > 0.001) burstDir /= bdLen;
        burstSwirl = burstDir * burstInfluence * uDistortion * 0.8
                   + flowField * burstInfluence * uDistortion * 0.3;
    }

    // combine hover + trail + burst
    float combined = clamp(hoverInfluence + trailInfluence + burstInfluence, 0.0, 1.0);

    // -- texture distortion using curl-warped UVs --
    vec2 swirlUv = totalSwirl * 0.5 * uPointerActive + burstSwirl * 0.5;
    // add subtle curl warp near cursor even when still
    swirlUv += flowField * hoverInfluence * 0.03;
    vec2 smudgedTexUv = texUv + swirlUv;
    vec4 smudgedColor = sampleImageTexture(smudgedTexUv);

    // warped boundary mask -- edges distort with the swirl
    vec2 warpedImageUv = imageUv - swirlUv;
    float inImage = smoothstep(-0.005, 0.0, warpedImageUv.x) * smoothstep(-0.005, 0.0, 1.0 - warpedImageUv.x)
                  * smoothstep(-0.005, 0.0, warpedImageUv.y) * smoothstep(-0.005, 0.0, 1.0 - warpedImageUv.y);

    // hue shift + saturation boost (only when gradient effect is on)
    vec3 hueShifted = smudgedColor.rgb;
    if (uShowGradient > 0.5) {
        vec3 hsl = rgb2hsl(smudgedColor.rgb);
        float noiseHue = fbm(uv * 3.0 + time * 0.3);
        hsl.x = fract(hsl.x + uHueShift * combined * (0.5 + noiseHue * 0.5));
        hsl.y = min(1.0, hsl.y + combined * 0.6);
        hsl.z = clamp(hsl.z + combined * 0.1, 0.0, 1.0);
        hueShifted = hsl2rgb(hsl);
    }

    // animate effect colors -- cycle hues over time
    vec3 c1hsl = rgb2hsl(uEffectColor1);
    c1hsl.x = fract(c1hsl.x + uTime * uColorCycle);
    vec3 cycledColor1 = hsl2rgb(c1hsl);

    vec3 c2hsl = rgb2hsl(uEffectColor2);
    c2hsl.x = fract(c2hsl.x + uTime * uColorCycle * 0.73);
    vec3 cycledColor2 = hsl2rgb(c2hsl);

    vec3 c3hsl = rgb2hsl(uEffectColor3);
    c3hsl.x = fract(c3hsl.x + uTime * uColorCycle * 1.17);
    vec3 cycledColor3 = hsl2rgb(c3hsl);

    vec3 c4hsl = rgb2hsl(uEffectColor4);
    c4hsl.x = fract(c4hsl.x + uTime * uColorCycle * 0.53);
    vec3 cycledColor4 = hsl2rgb(c4hsl);

    // -- domain-warped gradient overlay --
    vec2 warpCoord = uv * 2.5 + (totalSwirl * uPointerActive + burstSwirl) * 4.0;
    ${
      !lowQuality
        ? `float warpLayer = fbm(warpCoord + time * 0.15);
    float gradientT = fbm(warpCoord + warpLayer * 0.5 + time * 0.1);`
        : `float gradientT = fbm(warpCoord + time * 0.1);`
    }

    // remap FBM output (~[-0.94, 0.94]) to smooth [0, 1]
    float gt = clamp(gradientT * 0.5 + 0.5, 0.0, 1.0);
    gt = gt * gt * (3.0 - 2.0 * gt); // hermite smooth
    float premiumShift = (fbm(uv * 1.6 + flowField * 0.9 + time * 0.08) * 0.5 + 0.5) - 0.5;
    gt = clamp(gt + premiumShift * (0.08 * orbHalo + 0.05 * orbRing), 0.0, 1.0);

    // 4-stop gradient: color1 -> color2 -> color3 -> color4
    float seg = gt * 3.0;
    vec3 gradientColor;
    if (seg < 1.0) {
        gradientColor = mix(cycledColor1, cycledColor2, seg);
    } else if (seg < 2.0) {
        gradientColor = mix(cycledColor2, cycledColor3, seg - 1.0);
    } else {
        gradientColor = mix(cycledColor3, cycledColor4, seg - 2.0);
    }

    // blend: more gradient when swirling fast
    float swirlMag = length(totalSwirl * uPointerActive + burstSwirl);
    float distortionBand = clamp(orbRing * 1.15 + burstInfluence * 0.5 + trailInfluence * 0.35, 0.0, 1.0);
    float gradientMix = smoothstep(0.02, 0.72, combined * 0.28 + orbHalo * 0.3 + swirlMag * 1.4) * uShowGradient;
    vec3 premiumGradientColor = mix(gradientColor, vec3(1.0), 0.18 * orbCore + 0.06 * orbPulse);
    vec3 premiumHueShifted = mix(hueShifted, smudgedColor.rgb, 0.18 * (1.0 - orbHalo));
    vec3 effectColor = mix(premiumHueShifted, premiumGradientColor, gradientMix * (0.78 + 0.22 * orbHalo));

    // compositing: image area blends normally, overflow fades out
    float imageMix = clamp(combined * 0.55 + orbCore * 0.2 + orbHalo * 0.15, 0.0, 1.0);
    vec3 imageBlend = mix(smudgedColor.rgb, effectColor, imageMix);
    vec3 finalColor = mix(effectColor, imageBlend, inImage);
    float glow = clamp(orbHalo * 0.55 + orbCore * orbCore * 0.45 + distortionBand * 0.18, 0.0, 1.0);
    vec3 outerGlowColor = mix(gradientColor, premiumGradientColor, 0.5);
    finalColor += outerGlowColor * glow * (0.16 + 0.08 * orbPulse) * uShowGradient;
    finalColor += vec3(1.0) * orbCore * 0.045 * uShowGradient;
    finalColor = clamp(finalColor, 0.0, 1.0);

    float alpha = inImage * smudgedColor.a;
    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
}
`;
}

/* ------------------------------------------------------------------ */
/* Colour handling                                                     */
/* ------------------------------------------------------------------ */

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hslToRgb01(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    let v = t;
    if (v < 0) v += 1;
    if (v > 1) v -= 1;
    if (v < 1 / 6) return p + (q - p) * 6 * v;
    if (v < 1 / 2) return q;
    if (v < 2 / 3) return p + (q - p) * (2 / 3 - v) * 6;
    return p;
  };
  return [hue2rgb(h + 1 / 3), hue2rgb(h), hue2rgb(h - 1 / 3)];
}

function parseColorToRgb01(input: string): [number, number, number] {
  const value = input.trim();
  const hex = value.startsWith("#") ? value.slice(1) : null;
  if (hex) {
    const normalized =
      hex.length === 3 || hex.length === 4
        ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
        : hex.slice(0, 6).padEnd(6, "0");
    const int = Number.parseInt(normalized, 16);
    if (!Number.isNaN(int)) {
      return [
        ((int >> 16) & 255) / 255,
        ((int >> 8) & 255) / 255,
        (int & 255) / 255,
      ];
    }
  }
  const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const channels = rgbMatch[1].split(",").map((part) => part.trim());
    const toChannel = (channel: string) => {
      if (channel.endsWith("%")) {
        return clamp((Number.parseFloat(channel) / 100) * 255, 0, 255);
      }
      return clamp(Number.parseFloat(channel), 0, 255);
    };
    return [
      toChannel(channels[0] || "0") / 255,
      toChannel(channels[1] || "0") / 255,
      toChannel(channels[2] || "0") / 255,
    ];
  }
  const hslMatch = value.match(/hsla?\(([^)]+)\)/i);
  if (hslMatch) {
    const parts = hslMatch[1].split(/[,/]/).map((s) => s.trim());
    const h = Number.parseFloat(parts[0]) / 360;
    const s = Number.parseFloat(parts[1]) / 100;
    const l = Number.parseFloat(parts[2]) / 100;
    if (!Number.isNaN(h) && !Number.isNaN(s) && !Number.isNaN(l)) {
      return hslToRgb01(h, s, l);
    }
  }
  // canvas fallback resolves named colours, oklch, colour functions
  if (typeof document !== "undefined") {
    try {
      const ctx = document.createElement("canvas").getContext("2d");
      if (ctx) {
        ctx.fillStyle = value;
        const resolved = ctx.fillStyle;
        if (typeof resolved === "string" && resolved.startsWith("#")) {
          const int = Number.parseInt(resolved.slice(1), 16);
          return [
            ((int >> 16) & 255) / 255,
            ((int >> 8) & 255) / 255,
            (int & 255) / 255,
          ];
        }
      }
    } catch {
      // fall through to black
    }
  }
  return [0, 0, 0];
}

export const FLUID_IMAGE_PRESETS = {
  tropical: ["#0D9488", "#A78BFA", "#F472B6", "#FBBF24"],
  ocean: ["#0EA5E9", "#6366F1", "#14B8A6", "#818CF8"],
  sunset: ["#F97316", "#EF4444", "#A855F7", "#FBBF24"],
  neon: ["#22D3EE", "#A3E635", "#F472B6", "#FACC15"],
  forest: ["#16A34A", "#065F46", "#A3E635", "#D9F99D"],
  monochrome: ["#E5E5E5", "#A3A3A3", "#525252", "#171717"],
} as const;

export type FluidImagePreset = keyof typeof FLUID_IMAGE_PRESETS | "custom";

const DEFAULT_PRESET: FluidImagePreset = "tropical";

/** Maps N supplied colours onto exactly the 4 stops the shader takes. */
function resolveColors(preset: FluidImagePreset, customColors: string[]) {
  const palette =
    preset === "custom"
      ? customColors.length > 0
        ? customColors
        : [...FLUID_IMAGE_PRESETS[DEFAULT_PRESET as "tropical"]]
      : [
          ...(FLUID_IMAGE_PRESETS[preset as "tropical"] ??
            FLUID_IMAGE_PRESETS.tropical),
        ];
  if (palette.length === 0) return ["#000000", "#000000", "#000000", "#000000"];
  if (palette.length === 1)
    return [palette[0], palette[0], palette[0], palette[0]];
  if (palette.length === 2)
    return [palette[0], palette[1], palette[1], palette[0]];
  if (palette.length === 3)
    return [palette[0], palette[1], palette[2], palette[1]];
  if (palette.length === 4)
    return [palette[0], palette[1], palette[2], palette[3]];
  const last = palette.length - 1;
  return [
    palette[0],
    palette[Math.round(last / 3)],
    palette[Math.round((last * 2) / 3)],
    palette[last],
  ];
}

/* ------------------------------------------------------------------ */
/* GL helpers                                                          */
/* ------------------------------------------------------------------ */

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || "Unknown shader compile error";
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, fragmentSource: string) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create shader program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) || "Unknown program link error";
    gl.deleteProgram(program);
    throw new Error(info);
  }
  return program;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export interface FluidImageProps {
  /** Image URL. Falls back to a built-in gradient when omitted. */
  image?: string;
  /** Alt text for the layout image behind the canvas. */
  alt?: string;
  /** How the texture is mapped into the frame. Computed in the shader. */
  objectFit?: "cover" | "contain" | "fill";
  /** Named palette, or "custom" to use `customColors`. */
  preset?: FluidImagePreset;
  /** 1 to 6 colours, resampled onto the shader's 4 gradient stops. */
  customColors?: string[];
  /** Turn the gradient overlay off to keep only the liquid distortion. */
  showGradient?: boolean;
  /** Radius of the pointer's influence, 0.05 to 0.8. */
  radius?: number;
  /** Overall effect intensity, 0 to 1. */
  strength?: number;
  /** How much the flow field warps the image, 0 to 1. */
  distortion?: number;
  /** Hue rotation applied inside the influence area, 0 to 1. */
  hueShift?: number;
  /** Speed the four gradient stops drift around the hue wheel. */
  colorCycle?: number;
  /** Time multiplier for the noise field. */
  speed?: number;
  /** Per-frame trail retention, 0.8 to 0.995. Higher holds longer. */
  persistence?: number;
  /** Pointer follow easing, 0.01 to 1. Lower lags further behind. */
  pointerSmooth?: number;
  /** "low" halves the trail, drops to 2 FBM octaves, skips curl noise. */
  quality?: "high" | "low";
  /** Fade the canvas up once the texture has decoded. */
  fadeIn?: boolean;
  /** Fade duration in seconds. */
  fadeInDuration?: number;
  /** Device-pixel-ratio ceiling. */
  maxDpr?: number;
  /** Canvas bleed in px, so the swirl can spill past the frame. */
  overflowPadding?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function FluidImage({
  image,
  alt = "",
  objectFit = "cover",
  preset = DEFAULT_PRESET,
  customColors = [],
  showGradient = true,
  radius = 0.4,
  strength = 0.9,
  distortion = 0.4,
  hueShift = 0.5,
  colorCycle = 0.05,
  speed = 0.4,
  persistence = 0.97,
  pointerSmooth = 0.08,
  quality = "high",
  fadeIn = true,
  fadeInDuration = 0.6,
  maxDpr = 1.75,
  overflowPadding = 100,
  className,
  style,
}: FluidImageProps) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const reducedMotionRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const imageSrc = image || DEFAULT_IMAGE;
  const objectFitValue =
    objectFit === "contain" ? 1 : objectFit === "fill" ? 2 : 0;

  const [c1, c2, c3, c4] = resolveColors(preset, customColors);

  // Live values the render loop reads without re-running the GL effect.
  const stateRef = React.useRef({
    effectColor1Rgb: [0, 0, 0] as [number, number, number],
    effectColor2Rgb: [0, 0, 0] as [number, number, number],
    effectColor3Rgb: [0, 0, 0] as [number, number, number],
    effectColor4Rgb: [0, 0, 0] as [number, number, number],
    showGradient,
    radius,
    strength,
    speed,
    distortion,
    hueShift,
    colorCycle,
    persistence,
    pointerSmooth,
    maxDpr,
    fadeIn,
    fadeInDuration,
    overflowPadding,
    objectFit: objectFitValue,
  });
  stateRef.current = {
    effectColor1Rgb: parseColorToRgb01(c1),
    effectColor2Rgb: parseColorToRgb01(c2),
    effectColor3Rgb: parseColorToRgb01(c3),
    effectColor4Rgb: parseColorToRgb01(c4),
    showGradient,
    radius,
    strength,
    speed,
    distortion,
    hueShift,
    colorCycle,
    persistence,
    pointerSmooth,
    maxDpr,
    fadeIn,
    fadeInDuration,
    overflowPadding,
    objectFit: objectFitValue,
  };

  const imageUrlRef = React.useRef(imageSrc);
  imageUrlRef.current = imageSrc;
  const reloadTextureRef = React.useRef<((url: string) => void) | undefined>(
    undefined,
  );
  const initialMountRef = React.useRef(true);

  React.useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    reloadTextureRef.current?.(imageSrc);
  }, [imageSrc]);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let raf = 0;
    let rafRunning = false;

    const canvas = document.createElement("canvas");
    const initPad = stateRef.current.overflowPadding;
    canvas.style.position = "absolute";
    canvas.style.top = `-${initPad}px`;
    canvas.style.left = `-${initPad}px`;
    canvas.style.width = `calc(100% + ${initPad * 2}px)`;
    canvas.style.height = `calc(100% + ${initPad * 2}px)`;
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    const initState = stateRef.current;
    if (initState.fadeIn) {
      canvas.style.opacity = "0";
      canvas.style.transition = `opacity ${initState.fadeInDuration}s ease`;
    }
    host.appendChild(canvas);

    const maybeGl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: false,
    }) as WebGLRenderingContext | null;

    if (!maybeGl) {
      setLoadError("WebGL is not available");
      if (canvas.parentElement === host) host.removeChild(canvas);
      return;
    }
    // Rebound after the guard: `render` is a hoisted declaration, so the
    // narrowing on `maybeGl` does not survive into it.
    const gl = maybeGl;

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    let texture: WebGLTexture | null = null;
    let noiseTex: WebGLTexture | null = null;
    let loc: Record<string, WebGLUniformLocation | null> | null = null;
    let imageSize = { w: 1, h: 1 };
    let loadGen = 0;

    let cw = Math.max(1, host.clientWidth || host.offsetWidth || 1);
    let ch = Math.max(1, host.clientHeight || host.offsetHeight || 1);

    const fragSource = buildFragmentShader(quality === "low");

    function initGL(ctx: WebGLRenderingContext) {
      program = createProgram(ctx, fragSource);
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGLRenderingContext.useProgram is the GL API, not a React hook.
      ctx.useProgram(program);
      const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
      buffer = ctx.createBuffer();
      if (!buffer) throw new Error("Could not create vertex buffer");
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
      const posLoc = ctx.getAttribLocation(program, "aPosition");
      ctx.enableVertexAttribArray(posLoc);
      ctx.vertexAttribPointer(posLoc, 2, ctx.FLOAT, false, 0, 0);

      const names = [
        "uResolution",
        "uPointer",
        "uPointerActive",
        "uTime",
        "uTexture",
        "uNoiseTex",
        "uImageSize",
        "uEffectColor1",
        "uEffectColor2",
        "uEffectColor3",
        "uEffectColor4",
        "uRadius",
        "uStrength",
        "uSpeed",
        "uDistortion",
        "uHueShift",
        "uColorCycle",
        "uShowGradient",
        "uTrail",
        "uTrailVelocities",
        "uTrailStrengths",
        "uPadding",
        "uBurst",
        "uBurstPos",
        "uObjectFit",
      ];
      loc = {};
      for (const n of names) {
        loc[n] = ctx.getUniformLocation(program, n);
      }

      texture = ctx.createTexture();
      ctx.activeTexture(ctx.TEXTURE0);
      ctx.bindTexture(ctx.TEXTURE_2D, texture);
      ctx.texImage2D(
        ctx.TEXTURE_2D,
        0,
        ctx.RGBA,
        1,
        1,
        0,
        ctx.RGBA,
        ctx.UNSIGNED_BYTE,
        new Uint8Array([128, 128, 128, 255]),
      );
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);

      noiseTex = ctx.createTexture();
      ctx.activeTexture(ctx.TEXTURE1);
      ctx.bindTexture(ctx.TEXTURE_2D, noiseTex);
      ctx.texImage2D(
        ctx.TEXTURE_2D,
        0,
        ctx.RGBA,
        NOISE_SIZE,
        NOISE_SIZE,
        0,
        ctx.RGBA,
        ctx.UNSIGNED_BYTE,
        getNoiseData(),
      );
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
      ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
      ctx.activeTexture(ctx.TEXTURE0);
    }

    /**
     * Cross-origin is requested for everything except data URIs. The upstream
     * component only set it for URLs whose origin already differs, which breaks
     * same-origin paths that redirect to a CDN: the redirect lands cross-origin
     * and the texture upload then throws a security error.
     */
    const loadImage = (url: string) => {
      const gen = ++loadGen;
      const attempt = (useCors: boolean) => {
        const img = new Image();
        if (useCors && !url.startsWith("data:")) img.crossOrigin = "anonymous";
        img.onload = () => {
          if (cancelled || gen !== loadGen) return;
          if (!img.naturalWidth || !img.naturalHeight) return;
          setLoadError(null);
          imageSize = { w: img.naturalWidth, h: img.naturalHeight };
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img,
          );
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
          requestAnimationFrame(() => {
            canvas.style.opacity = "1";
          });
          ensureRAF();
        };
        img.onerror = () => {
          if (cancelled || gen !== loadGen) return;
          if (useCors) {
            attempt(false);
            return;
          }
          setLoadError("Failed to load image");
        };
        img.src = url;
      };
      attempt(true);
    };

    try {
      initGL(gl);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unknown error while starting shader",
      );
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (canvas.parentElement === host) host.removeChild(canvas);
      return;
    }

    reloadTextureRef.current = loadImage;
    loadImage(imageUrlRef.current);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        cw = Math.max(1, Math.floor(entry.contentRect.width));
        ch = Math.max(1, Math.floor(entry.contentRect.height));
      }
      ensureRAF();
    });
    ro.observe(host);

    let targetPointer = { x: 0.5, y: 0.5 };
    const smoothPointer = { x: 0.5, y: 0.5 };
    const prevSmooth = { x: 0.5, y: 0.5 };
    const pointerVelocity = { x: 0, y: 0 };
    let pointerInside = false;
    let pointerActiveFade = 0;
    let lastPad = initPad;
    let lastPw = 0;
    let lastPh = 0;
    let burstValue = 0;
    let burstPos = { x: 0.5, y: 0.5 };

    const trail = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: -1,
      y: -1,
      vx: 0,
      vy: 0,
      strength: 0,
    }));
    const trailFlat = new Float32Array(TRAIL_LENGTH * 2);
    const trailVelFlat = new Float32Array(TRAIL_LENGTH * 2);
    const trailStrengths = new Float32Array(TRAIL_LENGTH);

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotionRef.current) return;
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      targetPointer = {
        x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
        y: clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1),
      };
      pointerInside = true;
      ensureRAF();
    };
    const onPointerLeave = () => {
      pointerInside = false;
      ensureRAF();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (reducedMotionRef.current) return;
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      burstPos = {
        x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
        y: clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1),
      };
      burstValue = 1;
      ensureRAF();
    };

    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    host.addEventListener("pointerdown", onPointerDown);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      window.cancelAnimationFrame(raf);
      rafRunning = false;
    };
    const onContextRestored = () => {
      try {
        initGL(gl);
        loadImage(imageUrlRef.current);
        ensureRAF();
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Context restore failed",
        );
      }
    };
    canvas.addEventListener("webglcontextlost", onContextLost, false);
    canvas.addEventListener("webglcontextrestored", onContextRestored, false);

    const start = performance.now();
    let lastFrameTime = 0;

    function ensureRAF() {
      if (!rafRunning && !cancelled) {
        rafRunning = true;
        lastFrameTime = performance.now();
        raf = window.requestAnimationFrame(render);
      }
    }

    function render(now: number) {
      if (cancelled || !loc) {
        rafRunning = false;
        return;
      }
      // frame-rate independent delta, capped so a backgrounded tab cannot jump
      const dt = Math.min((now - lastFrameTime) / 1e3, 0.1);
      lastFrameTime = now;
      const dtScale = dt * 60;
      const s = stateRef.current;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        Math.max(0.5, s.maxDpr),
      );
      const padPx = s.overflowPadding;
      const canvasW = cw + 2 * padPx;
      const canvasH = ch + 2 * padPx;
      const pw = Math.floor(canvasW * dpr);
      const ph = Math.floor(canvasH * dpr);
      if (pw !== lastPw || ph !== lastPh) {
        canvas.width = pw;
        canvas.height = ph;
        gl.viewport(0, 0, pw, ph);
        lastPw = pw;
        lastPh = ph;
      }
      if (padPx !== lastPad) {
        canvas.style.top = `-${padPx}px`;
        canvas.style.left = `-${padPx}px`;
        canvas.style.width = `calc(100% + ${padPx * 2}px)`;
        canvas.style.height = `calc(100% + ${padPx * 2}px)`;
        lastPad = padPx;
      }

      const smoothK = 1 - (1 - clamp(s.pointerSmooth, 0.01, 1)) ** dtScale;
      prevSmooth.x = smoothPointer.x;
      prevSmooth.y = smoothPointer.y;
      smoothPointer.x += (targetPointer.x - smoothPointer.x) * smoothK;
      smoothPointer.y += (targetPointer.y - smoothPointer.y) * smoothK;

      const rawVx = dt > 0 ? (smoothPointer.x - prevSmooth.x) / dt : 0;
      const rawVy = dt > 0 ? (smoothPointer.y - prevSmooth.y) / dt : 0;
      const velDecay = 0.5 ** dtScale;
      pointerVelocity.x = pointerVelocity.x * velDecay + rawVx * (1 - velDecay);
      pointerVelocity.y = pointerVelocity.y * velDecay + rawVy * (1 - velDecay);

      const fadeTarget = pointerInside ? 1 : 0;
      const fadeK = 1 - 0.9 ** dtScale;
      pointerActiveFade += (fadeTarget - pointerActiveFade) * fadeK;

      if (burstValue > 0.001) {
        burstValue *= 0.94 ** dtScale;
        if (burstValue < 0.001) burstValue = 0;
      }

      const trailDecay = s.persistence ** dtScale;
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        trail[i].strength *= trailDecay;
      }
      const dx = smoothPointer.x - trail[0].x;
      const dy = smoothPointer.y - trail[0].y;
      if (pointerInside) {
        if (dx * dx + dy * dy > 5e-5) {
          for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
            trail[i].x = trail[i - 1].x;
            trail[i].y = trail[i - 1].y;
            trail[i].vx = trail[i - 1].vx;
            trail[i].vy = trail[i - 1].vy;
            trail[i].strength = trail[i - 1].strength;
          }
        }
        trail[0].x = smoothPointer.x;
        trail[0].y = smoothPointer.y;
        trail[0].vx = pointerVelocity.x * dt;
        trail[0].vy = pointerVelocity.y * dt;
        trail[0].strength = 1;
      }

      const padNormX = canvasW > 0 ? padPx / canvasW : 0;
      const padNormY = canvasH > 0 ? padPx / canvasH : 0;
      const scaleX = 1 - 2 * padNormX;
      const scaleY = 1 - 2 * padNormY;
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        trailFlat[i * 2] = trail[i].x * scaleX + padNormX;
        trailFlat[i * 2 + 1] = trail[i].y * scaleY + padNormY;
        trailVelFlat[i * 2] = trail[i].vx * scaleX;
        trailVelFlat[i * 2 + 1] = trail[i].vy * scaleY;
        trailStrengths[i] = trail[i].strength;
      }

      gl.uniform2f(loc.uResolution, pw, ph);
      gl.uniform2f(loc.uPadding, padNormX, padNormY);
      gl.uniform2f(
        loc.uPointer,
        smoothPointer.x * scaleX + padNormX,
        smoothPointer.y * scaleY + padNormY,
      );
      gl.uniform1f(loc.uPointerActive, pointerActiveFade);
      gl.uniform1f(loc.uTime, (now - start) * 0.001);
      gl.uniform1i(loc.uTexture, 0);
      gl.uniform1i(loc.uNoiseTex, 1);
      gl.uniform2f(loc.uImageSize, imageSize.w, imageSize.h);
      gl.uniform3f(loc.uEffectColor1, ...s.effectColor1Rgb);
      gl.uniform3f(loc.uEffectColor2, ...s.effectColor2Rgb);
      gl.uniform3f(loc.uEffectColor3, ...s.effectColor3Rgb);
      gl.uniform3f(loc.uEffectColor4, ...s.effectColor4Rgb);
      gl.uniform1f(loc.uRadius, s.radius);
      gl.uniform1f(loc.uStrength, s.strength);
      gl.uniform1f(loc.uSpeed, s.speed);
      gl.uniform1f(loc.uDistortion, s.distortion);
      gl.uniform1f(loc.uHueShift, s.hueShift);
      gl.uniform1f(loc.uColorCycle, s.colorCycle);
      gl.uniform1f(loc.uShowGradient, s.showGradient ? 1 : 0);
      gl.uniform1f(loc.uObjectFit, s.objectFit);
      gl.uniform2fv(loc.uTrail, trailFlat);
      gl.uniform2fv(loc.uTrailVelocities, trailVelFlat);
      gl.uniform1fv(loc.uTrailStrengths, trailStrengths);
      gl.uniform1f(loc.uBurst, burstValue);
      gl.uniform2f(
        loc.uBurstPos,
        burstPos.x * scaleX + padNormX,
        burstPos.y * scaleY + padNormY,
      );

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // idle out: nothing left moving means the loop can stop entirely
      let allDecayed = pointerActiveFade < 0.001 && burstValue < 0.001;
      if (allDecayed) {
        for (let i = 0; i < TRAIL_LENGTH; i++) {
          if (trailStrengths[i] > 0.001) {
            allDecayed = false;
            break;
          }
        }
      }
      if (!pointerInside && allDecayed) {
        rafRunning = false;
        return;
      }
      raf = window.requestAnimationFrame(render);
    }

    ensureRAF();
    if (!initState.fadeIn) canvas.style.opacity = "1";
    setLoadError(null);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      rafRunning = false;
      reloadTextureRef.current = undefined;
      ro.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (texture) gl.deleteTexture(texture);
      if (noiseTex) gl.deleteTexture(noiseTex);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (canvas.parentElement === host) host.removeChild(canvas);
    };
  }, [quality]);

  const unavailable = loadError === "WebGL is not available";

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "visible",
        ...style,
      }}
    >
      {/* Sizes the host and stands in wherever the canvas cannot run. */}
      <img
        src={imageSrc}
        alt={alt}
        style={
          unavailable
            ? { width: "100%", height: "100%", objectFit, display: "block" }
            : {
                display: "block",
                maxWidth: "100%",
                height: "auto",
                visibility: "hidden",
              }
        }
      />
      {loadError && !unavailable ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontFamily: "monospace",
            color: "rgba(255,255,255,0.8)",
            background: "rgba(0,0,0,0.35)",
            padding: 12,
            textAlign: "center",
          }}
        >
          {`Fluid Image: ${loadError}`}
        </div>
      ) : null}
    </div>
  );
}

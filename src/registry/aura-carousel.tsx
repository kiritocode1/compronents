"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Aura Carousel: a looping customer-story rail whose cards pick up a spectral
 * aura as they pass through a stationary zone at each side of the viewport.
 *
 * Port of toolcraft.sh/demos/aura-carousel without its control panel. The
 * DOM rail stays the scroll and drag surface; once WebGL is ready its cards
 * are hidden and one fragment shader redraws the whole rail from a single
 * retained strip texture (cards plus testimonial text), applying the edge
 * warp, ripple, dispersion, aura and boundary light band in screen space.
 * The shader, layout values and scroll physics are the source's own.
 */

export interface AuraCarouselCard {
  /** Image URL. Cover-cropped to a 448 x 560 card; must allow CORS for WebGL. */
  src: string;
  alt: string;
  /** White copy pinned to the bottom of the card. */
  testimonial: string;
}

export interface AuraCarouselProps {
  /** Heading above the rail. */
  title?: string;
  /** Cards in one loop cycle. The rail renders three cycles to wrap seamlessly. */
  cards?: AuraCarouselCard[];
  /** Surface colour behind the rail and header. */
  background?: string;
  /** Backing-pixel multiplier on top of devicePixelRatio. The source renders at 2. */
  renderScale?: number;
  /** Darken the bottom of each card under the white testimonial. Turn off for photos that already carry their own. */
  scrim?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ASSET_BASE = "https://ui.aryank.space/assets";
const FONT_FAMILY = "Aura Figtree";

const DEFAULT_TITLE = "How focused teams turn insights into action.";

const DEFAULT_CARDS: AuraCarouselCard[] = [
  {
    src: `${ASSET_BASE}/liquid-glass-carousel/img-12.jpg`,
    alt: "A person unpacking boxes beside a tall window onto a garden",
    testimonial:
      "“Bringing our research into one clear view helped the team agree on priorities and decide what to build next.”",
  },
  {
    src: `${ASSET_BASE}/liquid-glass-carousel/img-5.jpg`,
    alt: "A woman beside a lit table lamp, her shadow on the wall",
    testimonial:
      "“Learning why customers came back helped us improve our products and focus on the details they value most.”",
  },
  {
    src: `${ASSET_BASE}/liquid-glass-carousel/img-8.jpg`,
    alt: "A woman with a dark fringe looking through pink flowers",
    testimonial:
      "“A shared brief gave everyone a clear view of the goal and their role in reaching it. We made decisions sooner and kept work moving without extra meetings.”",
  },
  {
    src: `${ASSET_BASE}/liquid-glass-carousel/img-1.jpg`,
    alt: "A profile portrait with white flowers tucked behind the ear",
    testimonial:
      "“We replaced disconnected reports with shared measures, so teams could spot problems early and make better decisions together.”",
  },
  {
    src: `${ASSET_BASE}/liquid-glass-carousel/img-9.jpg`,
    alt: "A man in a striped shirt sitting under a pale square of light",
    testimonial:
      "“Simpler reporting freed up time to hear from customers, test new ideas, and improve the services they use daily.”",
  },
];

// Layout, verbatim from the source (px).
const CARD_WIDTH = 448;
const CARD_HEIGHT = 560;
const CARD_GAP = 16;
const CARD_RADIUS = 12;
const EFFECT_PADDING = 64;
const TEXT_PADDING = 24;
const TEXT_LINE_HEIGHT = 26;
const SLOT = CARD_WIDTH + CARD_GAP;
const STRIP_SCALE = 2;
const TEXT_FONT = `400 20px "${FONT_FAMILY}", Arial, sans-serif`;

// Effect settings: the source's defaults with the panel removed.
const SETTINGS = {
  amount: 85,
  aura: 0.69,
  blur: 0,
  count: 20,
  curve: 1.15,
  edgeFade: 0.51,
  edgeWidth: 13,
  gateGlow: 0.49,
  gateOffset: 9,
  gateRefraction: 7,
  gateWidth: 147,
  hue: 0,
  spectrum: 0.67,
  turbulence: 0.79,
  turbulenceScale: 168,
  velocity: 0.45,
  warp: 8,
  warpFace: 133,
  warpOffset: 1,
  warpSharpness: 2.35,
  warpStyle: "stretch",
  warpWave: 3,
  warpWaveBlur: 0,
  warpWaveKind: "ripple",
  warpWaveLength: 336,
} as const;

// Scroll physics, verbatim.
const VELOCITY_SMOOTHING = 0.2;
const VELOCITY_REST = 0.05;
const VELOCITY_GAIN = 1.6;
const VELOCITY_LIMIT = 140;
const SNAP_IDLE_MS = 480;
const STEP_MS = 420;

// Bottom scrim. The source cards bake this darkening into their pixels; it is
// drawn here so any photo keeps the white testimonial legible.
const SCRIM_STOPS: [number, string][] = [
  [0.45, "rgba(0,0,0,0)"],
  [0.72, "rgba(0,0,0,0.42)"],
  [1, "rgba(0,0,0,0.86)"],
];

const VERTEX_SHADER = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = vec2(aPosition.x * 0.5 + 0.5, 0.5 - aPosition.y * 0.5);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uStrip;
uniform sampler2D uText;
uniform vec2 uTextRowRange;
uniform vec2 uViewSize;
uniform vec2 uStripSize;
uniform float uPadY;
uniform float uScroll;
uniform float uEdgeStart;
uniform float uCurve;
uniform float uAmount;
uniform float uBlur;
uniform float uSpectrum;
uniform float uHue;
uniform float uIncludeText;
uniform float uAura;
uniform float uFade;
uniform float uVelocity;
uniform float uGateGlow;
uniform float uGateOffset;
uniform float uGateRefraction;
uniform float uGateWidth;
uniform float uTurbulence;
uniform float uTurbulenceFreq;
uniform float uWarp;
uniform float uWarpFace;
uniform float uWarpOffset;
uniform float uWarpSharpness;
uniform float uWarpStyle;
uniform float uWarpWave;
uniform float uWarpWaveBlur;
uniform float uWarpWaveKind;
uniform float uWarpWaveLength;
uniform int uSamples;

varying vec2 vUv;

const int MAX_SAMPLES = 48;
const int AURA_SAMPLES = 12;
const float GOLDEN_ANGLE = 2.399963;

vec4 sampleStrip(vec2 point) {
  float wrappedX = mod(mod(point.x + uScroll, uStripSize.x) + uStripSize.x, uStripSize.x);
  vec2 strip = vec2(wrappedX, point.y - uPadY);
  vec2 uv = strip / uStripSize;
  if (uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  vec4 imageTexel = texture2D(uStrip, uv);
  vec3 premultiplied = imageTexel.rgb * imageTexel.a;
  float alpha = imageTexel.a;
  if (uIncludeText > 0.5 && uv.y >= uTextRowRange.x && uv.y <= uTextRowRange.y) {
    vec4 textTexel = texture2D(uText, uv);
    premultiplied =
      textTexel.rgb * textTexel.a + premultiplied * (1.0 - textTexel.a);
    alpha = textTexel.a + alpha * (1.0 - textTexel.a);
  }
  return vec4(premultiplied, alpha);
}

vec3 spectralWeight(float t) {
  float h = uHue + t * 4.188790;
  vec3 rainbow = 0.5 + 0.5 * cos(h + vec3(0.0, -2.094395, -4.188790));
  rainbow = pow(rainbow, vec3(1.25)) * 1.8;
  return max(mix(vec3(1.0), rainbow, uSpectrum), 0.0);
}

float ditherPhase(vec2 seed) {
  return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}

float valueHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(valueHash(cell), valueHash(cell + vec2(1.0, 0.0)), u.x),
    mix(
      valueHash(cell + vec2(0.0, 1.0)),
      valueHash(cell + vec2(1.0, 1.0)),
      u.x
    ),
    u.y
  );
}

float fbm(vec2 p) {
  return valueNoise(p) * 0.65 + valueNoise(p * 2.13 + 7.7) * 0.35;
}

// Optical-path height of a wavy refractive slab. Several incommensurate
// sines plus a low fbm keep the surface from reading as a straight flag.
float waveHeight(vec2 p, float midY, float waveLen) {
  float q = (p.y - midY) / max(waveLen, 8.0);
  float px = p.x / max(uViewSize.x, 1.0);
  float p1 = q * 6.283185 + px * 2.6;
  float p2 = q * 13.63 + px * -3.4 + 1.27;
  float p3 = q * 22.05 + px * 1.8 + 2.41;
  float organic = fbm(vec2(px * 3.4, q * 1.85)) * 2.0 - 1.0;
  return 0.50 * sin(p1) + 0.26 * sin(p2) + 0.12 * sin(p3) + 0.22 * organic;
}

void main() {
  vec2 point = vUv * uViewSize;
  float centered = vUv.x * 2.0 - 1.0;
  float distance = abs(centered);
  float direction = centered >= 0.0 ? 1.0 : -1.0;
  float edge = clamp(
    (distance - uEdgeStart) / max(1.0 - uEdgeStart, 1e-4),
    0.0,
    1.0
  );
  edge = pow(edge, uCurve);

  // Relocatable warp band. Offset 0 pins the outer bound to the true
  // viewport rim. Displacement returns to zero AT that rim so cards
  // still press against the edge instead of leaving a vacated margin.
  float zoneWidth = max(1.0 - uEdgeStart, 0.04);
  float inset = clamp(uWarpOffset, 0.0, 0.85);
  float outer = 1.0 - inset;
  float inner = max(outer - zoneWidth, 0.0);
  float warpT = clamp((distance - inner) / max(outer - inner, 1e-4), 0.0, 1.0);
  float rimHold = smoothstep(0.78, 1.0, warpT);
  float warpEdge = pow(warpT, uCurve) * (1.0 - rimHold);
  float warpWindow = smoothstep(0.0, 0.2, warpT) * (1.0 - rimHold);

  if (uWarp > 0.5 || uWarpWave > 0.5) {
    float midY = uPadY + uStripSize.y * 0.5;
    if (uWarp > 0.5) {
      if (uWarpStyle < 0.5) {
        if (warpEdge > 0.0005) {
          float warp = min(uWarp * pow(warpEdge, 1.2), uViewSize.x * 0.12);
          point.x -= direction * warp;
          point.y += (point.y - midY) * warp / max(uStripSize.y, 1.0);
        }
      } else {
        float faceCenter = mix(inner, outer, 0.92);
        float faceHalf = max(uWarpFace, 4.0) / max(uViewSize.x * 0.5, 1.0);
        float s = (distance - faceCenter) / max(faceHalf, 1e-4);
        float plate = smoothstep(-1.0, 1.0, s);
        float kink = exp(-s * s * max(uWarpSharpness, 0.35));
        float shift = min(uWarp * (plate * 0.88 + kink * 0.55), uViewSize.x * 0.14);
        shift *= (1.0 - rimHold);
        point.x -= direction * shift;
        point.y += (point.y - midY) * kink * (uWarp / max(uStripSize.y, 1.0));
      }
    }
    if (uWarpWave > 0.5 && warpWindow > 0.001) {
      float waveLen = max(uWarpWaveLength, 8.0);
      float blurNorm = clamp(uWarpWaveBlur / 28.0, 0.0, 1.0);
      if (uWarpWaveKind < 0.5) {
        float phase = (point.y - midY) * 6.283185 / waveLen;
        float rippleSharp = sin(phase) + 0.28 * sin(phase * 2.0 + 0.4);
        float ripple = mix(rippleSharp, sin(phase), blurNorm);
        float wave = uWarpWave * ripple * warpWindow;
        point.x -= direction * wave;
        point.y += cos(phase) * wave * 0.18;
      } else {
        float thickness = uWarpWave * warpWindow;
        float eps = mix(2.0, 10.0, blurNorm);
        float hRich = waveHeight(point, midY, waveLen);
        float hSoft = sin((point.y - midY) * 6.283185 / waveLen);
        float h = mix(hRich, hSoft, blurNorm);
        float hx = mix(
          waveHeight(point + vec2(eps, 0.0), midY, waveLen),
          sin((point.y - midY) * 6.283185 / waveLen),
          blurNorm
        );
        float hy = mix(
          waveHeight(point + vec2(0.0, eps), midY, waveLen),
          sin((point.y + eps - midY) * 6.283185 / waveLen),
          blurNorm
        );
        vec2 grad = vec2(hx - h, hy - h) / max(eps, 1e-4);
        float iorBend = 1.0 - 1.0 / 1.28;
        point -= grad * thickness * (14.0 * iorBend + 6.5);
        point -= grad * h * thickness * 0.22;
        point.y += h * thickness * 0.12;
      }
    }
  }

  // Coverage of the authored rail after geometric warp, before spectral
  // displacement. Outside the card silhouettes the renderer may keep
  // spectral fringes, but must not turn a dark sampled pixel into a
  // neutral grey veil on the white canvas.
  float authoredCoverage = sampleStrip(point).a;

  float dispersionExtent = uAmount * edge;
  float blurExtent = uBlur * edge + uWarpWaveBlur * warpWindow;
  float velocity = uVelocity;
  float span = dispersionExtent + blurExtent;
  float verticalExtent = blurExtent * 0.5;

  // Irregular halo envelope: a static screen-space noise field modulates how
  // far the smear and the halo reach at every row, so the edge dissolves into
  // a ragged organic contour instead of a straight wash. The field morphs
  // slowly with scroll, staying deterministic for any given position.
  float haloSwing = 1.0;
  float haloWave = 0.0;
  if (uTurbulence > 0.002 && edge > 0.0005) {
    float rowCoord = point.y * uTurbulenceFreq;
    float drift = uScroll * uTurbulenceFreq * 0.3;
    float sideSeed = direction > 0.0 ? 13.7 : 3.1;
    float envelope = fbm(vec2(rowCoord, sideSeed + drift));
    float ragged = fbm(vec2(rowCoord * 0.55 + 31.0, sideSeed * 1.7 - drift * 0.6));
    span *= mix(1.0, 0.55 + 1.05 * envelope, uTurbulence);
    haloSwing = mix(1.0, 0.25 + 1.95 * ragged, uTurbulence);
    haloWave = (envelope - 0.5) * uTurbulence;
  }
  float extent = span + abs(velocity);

  // Every sample is transparent beyond this conservative vertical reach.
  // Account for defocus, aura jitter/drift, and the gate's +/-9px taps.
  float verticalReach = max(
    9.0,
    verticalExtent * 2.5 + 12.0 + abs(haloWave * 34.0)
  );
  if (point.y < uPadY - verticalReach ||
      point.y > uPadY + uStripSize.y + verticalReach) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Stationary boundary light band ("aura gate"): two vertical curtains whose
  // centers are positioned independently from the nearest viewport edge.
  float gateCenter = 1.0 - clamp(uGateOffset, 0.0, 0.5) * 2.0;
  float gateHalf = max(uGateWidth, 1.0) / (uViewSize.x * 0.5);
  float gateS = (distance - gateCenter) / max(gateHalf, 1e-4);
  float band = exp(-gateS * gateS * 1.1);
  if (uGateRefraction > 0.01) {
    // Glass-ridge displacement: a smooth monotonic push at the curtain, so
    // crossing content visibly refracts without double exposure.
    float ridge = min(uGateRefraction, uGateWidth * 0.6);
    point.x += direction * exp(-gateS * gateS) * ridge;
  }
  vec4 color = vec4(0.0);
  if (extent < 0.5) {
    color = sampleStrip(point);
  } else {
    vec3 accumulated = vec3(0.0);
    vec3 weightSum = vec3(0.0);
    float alpha = 0.0;
    float alphaWeight = 0.0;
    for (int i = 0; i < MAX_SAMPLES; i++) {
      if (i >= uSamples) {
        break;
      }
      float index = float(i);
      float jitterX = ditherPhase(gl_FragCoord.xy + index * vec2(0.754, 0.569));
      float jitterY = fract(jitterX * 61.803398 + index * 0.381966);
      float t = (index + jitterX) / float(uSamples);
      float spread = t - 0.5;
      vec3 weight = spectralWeight(t);
      vec2 offset = vec2(
        direction * span * spread + velocity * spread * 2.0,
        (jitterY * 2.0 - 1.0) * verticalExtent
      );
      vec4 texel = sampleStrip(point + offset);
      accumulated += texel.rgb * weight;
      weightSum += weight;
      float luminanceWeight = (weight.r + weight.g + weight.b) / 3.0;
      alpha += texel.a * luminanceWeight;
      alphaWeight += luminanceWeight;
    }
    color = vec4(
      accumulated / max(weightSum, vec3(1e-5)),
      alpha / max(alphaWeight, 1e-5)
    );

    float auraGain = uAura * edge * min(haloSwing, 1.6);
    if (auraGain > 0.002) {
      vec3 auraColor = vec3(0.0);
      vec3 auraWeightSum = vec3(0.0);
      float auraAlpha = 0.0;
      float auraAlphaWeight = 0.0;
      for (int j = 0; j < AURA_SAMPLES; j++) {
        float index = float(j);
        float jitterX = ditherPhase(gl_FragCoord.xy + index * vec2(0.591, 0.812));
        float jitterY = fract(jitterX * 61.803398 + index * 0.618034);
        float t = (index + jitterX) / float(AURA_SAMPLES);
        float spread = t - 0.5;
        vec3 weight = spectralWeight(t);
        vec2 offset = vec2(
          direction * (span * 2.6 + 24.0) * haloSwing * spread +
            velocity * spread * 3.0,
          (jitterY * 2.0 - 1.0) * (verticalExtent * 2.5 + 12.0) +
            haloWave * 34.0
        );
        vec4 texel = sampleStrip(point + offset);
        auraColor += texel.rgb * weight;
        auraWeightSum += weight;
        float luminanceWeight = (weight.r + weight.g + weight.b) / 3.0;
        auraAlpha += texel.a * luminanceWeight;
        auraAlphaWeight += luminanceWeight;
      }
      vec3 halo = auraColor / max(auraWeightSum, vec3(1e-5));
      float haloAlpha = auraAlpha / max(auraAlphaWeight, 1e-5);
      color.rgb += halo * auraGain * (1.0 - color.rgb);
      color.a += haloAlpha * auraGain * 0.9 * (1.0 - color.a);
    }
  }

  float gateGain = uGateGlow * band;
  if (gateGain > 0.004) {
    // Light source: a small local blur of the (refracted) content feeding the
    // curtain, so crossing cards flare while empty background stays faint.
    vec4 lightSample =
      sampleStrip(point) * 0.34 +
      sampleStrip(point + vec2(7.0, 0.0)) * 0.22 +
      sampleStrip(point - vec2(7.0, 0.0)) * 0.22 +
      sampleStrip(point + vec2(0.0, 9.0)) * 0.11 +
      sampleStrip(point - vec2(0.0, 9.0)) * 0.11;
    // Neutral light at the band core, prism colors along its rims.
    vec3 ramp = spectralWeight(clamp(0.5 + gateS * 0.5, 0.0, 1.0));
    ramp /= max(ramp.r + ramp.g + ramp.b, 1e-4);
    vec3 tint = mix(vec3(1.0 / 3.0), ramp, clamp(abs(gateS), 0.0, 1.0));
    float motionKick = 1.0 + min(abs(uVelocity) / 48.0, 1.0) * 0.7;
    float flare = gateGain * motionKick;
    float lightCoverage = clamp(lightSample.a, 0.0, 1.0);
    vec3 add =
      lightSample.rgb * flare * 1.15 +
      tint * flare * lightCoverage * 0.55;
    float addAlpha = flare * lightCoverage * 0.78;
    color.rgb = color.rgb + add * (1.0 - color.rgb);
    color.a = color.a + addAlpha * (1.0 - color.a);
  }

  // A premultiplied neutral halo composites as a grey band on white. Remove
  // only that neutral component outside the original card silhouette; the
  // channel differences remain as the intended red/green/blue dispersion.
  float outsideAuthoredContent =
    1.0 - smoothstep(0.001, 0.08, authoredCoverage);
  float neutral = min(color.r, min(color.g, color.b));
  vec3 spectralFringe = max(color.rgb - vec3(neutral), vec3(0.0));
  float spectralAlpha = max(
    spectralFringe.r,
    max(spectralFringe.g, spectralFringe.b)
  );
  color = mix(
    color,
    vec4(spectralFringe, spectralAlpha),
    outsideAuthoredContent
  );

  float fadeAmount = uFade * pow(edge, 2.0);
  gl_FragColor = color * (1.0 - fadeAmount);
}
`;

// ---------------------------------------------------------------------------
// Strip textures: every card image and every testimonial painted once, side
// by side at 2x, into an image canvas and a transparent text canvas.

interface StripTextures {
  image: HTMLCanvasElement;
  text: HTMLCanvasElement;
  /** Normalised [top, bottom] rows of the text canvas that hold any ink. */
  textRowRange: [number, number];
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`Failed to load carousel card: ${src}`));
    img.src = src;
  });
}

function textRowRange(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): [number, number] {
  const { data } = ctx.getImageData(0, 0, width, height);
  const rowHasInk = (row: number) => {
    const end = (row + 1) * width * 4;
    for (let i = row * width * 4 + 3; i < end; i += 4)
      if (data[i] !== 0) return true;
    return false;
  };
  let top = 0;
  while (top < height && !rowHasInk(top)) top++;
  if (top === height) return [1, 0];
  let bottom = height - 1;
  while (bottom > top && !rowHasInk(bottom)) bottom--;
  return [Math.max(0, top - 1) / height, Math.min(height, bottom + 2) / height];
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/u)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawTestimonial(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
) {
  ctx.font = TEXT_FONT;
  ctx.fontKerning = "normal";
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "top";
  const lines = wrapLines(ctx, text, CARD_WIDTH - TEXT_PADDING * 2);
  const top = y + CARD_HEIGHT - TEXT_PADDING - lines.length * TEXT_LINE_HEIGHT;
  for (const [i, line] of lines.entries()) {
    ctx.fillText(line, x + TEXT_PADDING, top + i * TEXT_LINE_HEIGHT);
  }
}

/** object-fit: cover into a rounded card, then the optional bottom scrim. */
function drawCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  scrim: boolean,
) {
  const w = CARD_WIDTH * STRIP_SCALE;
  const h = CARD_HEIGHT * STRIP_SCALE;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, 0, w, h, CARD_RADIUS * STRIP_SCALE);
  ctx.clip();
  ctx.drawImage(
    img,
    (img.naturalWidth - sw) / 2,
    (img.naturalHeight - sh) / 2,
    sw,
    sh,
    x,
    0,
    w,
    h,
  );
  if (scrim) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    for (const [stop, color] of SCRIM_STOPS) gradient.addColorStop(stop, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, 0, w, h);
  }
  ctx.restore();
}

async function buildStrip(
  cards: AuraCarouselCard[],
  scrim: boolean,
): Promise<StripTextures> {
  if ("fonts" in document) await document.fonts.load(TEXT_FONT);
  const images = await Promise.all(cards.map((card) => loadImage(card.src)));
  const width = SLOT * cards.length * STRIP_SCALE;
  const height = CARD_HEIGHT * STRIP_SCALE;
  const image = document.createElement("canvas");
  const text = document.createElement("canvas");
  image.width = text.width = width;
  image.height = text.height = height;
  const imageCtx = image.getContext("2d");
  const textCtx = text.getContext("2d");
  if (!imageCtx || !textCtx)
    throw new Error("The carousel strip textures require Canvas 2D support.");
  for (const [i, card] of cards.entries()) {
    const x = i * SLOT * STRIP_SCALE;
    drawCard(imageCtx, images[i], x, scrim);
    textCtx.save();
    textCtx.scale(STRIP_SCALE, STRIP_SCALE);
    drawTestimonial(textCtx, card.testimonial, x / STRIP_SCALE, 0);
    textCtx.restore();
  }
  return { image, text, textRowRange: textRowRange(textCtx, width, height) };
}

// ---------------------------------------------------------------------------
// WebGL renderer: one full-screen triangle, redrawn only when scroll,
// velocity or size changes.

const MAX_TEXTURE_EDGE = 16384;
const MAX_BACKING_PIXELS = 48e6;

interface RailRenderer {
  render(scroll: number, velocity: number): void;
  setSize(width: number, height: number, scale: number): void;
  dispose(): void;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader)
    throw new Error("The dispersion rail could not allocate a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "unknown error";
    gl.deleteShader(shader);
    throw new Error(`The dispersion rail shader failed to compile: ${log}`);
  }
  return shader;
}

function backingSize(width: number, height: number, scale: number) {
  let s = Math.min(
    Math.max(0.5, scale),
    MAX_TEXTURE_EDGE / Math.max(1, width, height),
  );
  const pixels = width * height * s * s;
  if (pixels > MAX_BACKING_PIXELS) s *= Math.sqrt(MAX_BACKING_PIXELS / pixels);
  return {
    width: Math.max(1, Math.round(width * s)),
    height: Math.max(1, Math.round(height * s)),
  };
}

function createRailRenderer(
  canvas: HTMLCanvasElement,
  strip: StripTextures,
  stripWidth: number,
): RailRenderer {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
    stencil: false,
  });
  if (!gl) throw new Error("The dispersion rail requires WebGL support.");

  let disposed = false;
  let lost = false;
  let viewWidth = 1;
  let viewHeight = 1;
  let pixelScale = 1;
  let lastScroll = 0;
  let lastVelocity = 0;
  let sizeDirty = true;
  let frameDirty = true;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let stripTexture: WebGLTexture | null = null;
  let textTexture: WebGLTexture | null = null;
  let u: Record<string, WebGLUniformLocation | null> = {};

  const setup = () => {
    sizeDirty = true;
    frameDirty = true;
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const p = gl.createProgram();
    if (!p)
      throw new Error("The dispersion rail could not allocate a program.");
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(p) ?? "unknown error";
      gl.deleteProgram(p);
      throw new Error(`The dispersion rail program failed to link: ${log}`);
    }
    program = p;
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React hook.
    gl.useProgram(p);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(p, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const upload = (unit: number, source: HTMLCanvasElement) => {
      const texture = gl.createTexture();
      if (!texture)
        throw new Error("The dispersion rail could not allocate a texture.");
      gl.activeTexture(unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return texture;
    };
    stripTexture = upload(gl.TEXTURE0, strip.image);
    textTexture = upload(gl.TEXTURE1, strip.text);

    const names = [
      "uAmount",
      "uAura",
      "uBlur",
      "uCurve",
      "uEdgeStart",
      "uFade",
      "uGateGlow",
      "uGateOffset",
      "uGateRefraction",
      "uGateWidth",
      "uHue",
      "uIncludeText",
      "uPadY",
      "uSamples",
      "uScroll",
      "uSpectrum",
      "uStrip",
      "uText",
      "uTextRowRange",
      "uStripSize",
      "uTurbulence",
      "uTurbulenceFreq",
      "uVelocity",
      "uViewSize",
      "uWarp",
      "uWarpFace",
      "uWarpOffset",
      "uWarpSharpness",
      "uWarpStyle",
      "uWarpWave",
      "uWarpWaveBlur",
      "uWarpWaveKind",
      "uWarpWaveLength",
    ];
    u = Object.fromEntries(
      names.map((name) => [name, gl.getUniformLocation(p, name)]),
    );
    gl.uniform1i(u.uStrip, 0);
    gl.uniform1i(u.uText, 1);
    gl.uniform2f(u.uTextRowRange, strip.textRowRange[0], strip.textRowRange[1]);
    gl.uniform2f(u.uStripSize, stripWidth, CARD_HEIGHT);
    gl.uniform1f(u.uPadY, EFFECT_PADDING);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
  };

  const resize = (scale: number) => {
    const size = backingSize(viewWidth, viewHeight, scale);
    if (canvas.width !== size.width || canvas.height !== size.height) {
      canvas.width = size.width;
      canvas.height = size.height;
      frameDirty = true;
    }
    gl.viewport(0, 0, size.width, size.height);
  };

  const draw = (scroll: number, velocity: number) => {
    if (disposed || lost || !program) return;
    if (!frameDirty && scroll === lastScroll && velocity === lastVelocity)
      return;
    lastScroll = scroll;
    lastVelocity = velocity;
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React hook.
    gl.useProgram(program);
    gl.uniform1f(u.uScroll, scroll);
    gl.uniform1f(u.uVelocity, velocity);
    if (sizeDirty) {
      // The source's panel-to-uniform mapping, applied to the fixed settings.
      const s = SETTINGS;
      gl.uniform2f(u.uViewSize, viewWidth, viewHeight);
      gl.uniform1f(u.uAmount, s.amount);
      gl.uniform1f(u.uAura, s.aura);
      gl.uniform1f(u.uBlur, s.blur);
      gl.uniform1f(u.uCurve, s.curve);
      gl.uniform1f(
        u.uEdgeStart,
        Math.min(0.999, Math.max(0, 1 - (s.edgeWidth / 100) * 2)),
      );
      gl.uniform1f(u.uFade, s.edgeFade);
      gl.uniform1f(u.uGateGlow, s.gateGlow);
      gl.uniform1f(u.uGateOffset, s.gateOffset / 100);
      gl.uniform1f(u.uGateRefraction, s.gateRefraction);
      gl.uniform1f(u.uGateWidth, s.gateWidth);
      gl.uniform1f(u.uHue, (s.hue * Math.PI) / 180);
      gl.uniform1f(u.uIncludeText, 1);
      gl.uniform1i(u.uSamples, s.count);
      gl.uniform1f(u.uSpectrum, s.spectrum);
      gl.uniform1f(u.uTurbulence, s.turbulence);
      gl.uniform1f(u.uTurbulenceFreq, 1 / s.turbulenceScale);
      gl.uniform1f(u.uWarp, s.warp);
      gl.uniform1f(u.uWarpFace, s.warpFace);
      gl.uniform1f(u.uWarpOffset, Math.min(0.9, (s.warpOffset / 100) * 2));
      gl.uniform1f(u.uWarpSharpness, s.warpSharpness);
      gl.uniform1f(u.uWarpStyle, s.warpStyle === "stretch" ? 0 : 1);
      gl.uniform1f(u.uWarpWave, s.warpWave);
      gl.uniform1f(u.uWarpWaveBlur, s.warpWaveBlur);
      gl.uniform1f(u.uWarpWaveKind, s.warpWaveKind === "ripple" ? 0 : 1);
      gl.uniform1f(u.uWarpWaveLength, s.warpWaveLength);
      sizeDirty = false;
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frameDirty = false;
  };

  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
  };
  const onRestored = () => {
    lost = false;
    setup();
    resize(pixelScale);
    draw(lastScroll, lastVelocity);
  };
  canvas.addEventListener("webglcontextlost", onLost, false);
  canvas.addEventListener("webglcontextrestored", onRestored, false);
  setup();

  return {
    render: draw,
    setSize(width, height, scale) {
      const w = Math.max(1, width);
      const h = Math.max(1, height);
      if (viewWidth !== w || viewHeight !== h) {
        sizeDirty = true;
        frameDirty = true;
      }
      viewWidth = w;
      viewHeight = h;
      pixelScale = scale;
      resize(scale);
      draw(lastScroll, lastVelocity);
    },
    dispose() {
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (stripTexture) gl.deleteTexture(stripTexture);
      if (textTexture) gl.deleteTexture(textTexture);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      stripTexture = textTexture = buffer = program = null;
    },
  };
}

// ---------------------------------------------------------------------------
// Input helpers.

/** Horizontal wheel distance in px; vertical wheel only counts with Shift. */
function wheelDelta(event: WheelEvent, pageWidth: number) {
  const unit =
    event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? pageWidth : 1;
  const x = event.deltaX * unit;
  const y = event.deltaY * unit;
  return Math.abs(x) >= Math.abs(y) ? x : event.shiftKey ? y : 0;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Mouse drag on the rail; touch keeps native overflow scrolling. */
function attachMouseDrag(
  el: HTMLElement,
  handlers: { onStart(): void; onDelta(dx: number): void; onEnd(): void },
) {
  let drag: { pointerId: number; x: number; scale: number } | null = null;
  const end = (notify: boolean) => {
    if (!drag) return;
    const { pointerId } = drag;
    drag = null;
    delete el.dataset.carouselDragging;
    if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
    if (notify) handlers.onEnd();
  };
  const down = (e: PointerEvent) => {
    if (
      drag ||
      e.defaultPrevented ||
      e.pointerType !== "mouse" ||
      e.button !== 0
    )
      return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    e.stopPropagation();
    el.setPointerCapture(e.pointerId);
    const width = el.getBoundingClientRect().width;
    drag = {
      pointerId: e.pointerId,
      x: e.clientX,
      scale: width > 0 && el.clientWidth > 0 ? width / el.clientWidth : 1,
    };
    el.dataset.carouselDragging = "true";
    el.focus({ preventScroll: true });
    handlers.onStart();
  };
  const move = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    if (!(e.buttons & 1)) {
      end(true);
      return;
    }
    const dx = (drag.x - e.clientX) / drag.scale;
    drag.x = e.clientX;
    if (dx !== 0) handlers.onDelta(dx);
  };
  const up = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    e.stopPropagation();
    end(true);
  };
  const blur = () => end(true);
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("lostpointercapture", up);
  window.addEventListener("blur", blur);
  return {
    isDragging: () => drag !== null,
    dispose() {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("lostpointercapture", up);
      window.removeEventListener("blur", blur);
      end(false);
    },
  };
}

type InputMode = "native" | "mouse" | "programmatic";

interface Tween {
  frame: number | null;
  from: number;
  to: number;
  start: number;
}

/**
 * Looping customer-story rail with a screen-space spectral aura at both
 * edges. Drag, Shift+wheel or trackpad swipe to move; arrows step one card.
 * Give the parent a height: the layout centres a 714px block vertically and
 * matches the source exactly at 1034px.
 */
export default function AuraCarousel({
  title = DEFAULT_TITLE,
  cards = DEFAULT_CARDS,
  background = "#FFFFFF",
  renderScale = 2,
  scrim = true,
  className,
  style,
}: AuraCarouselProps) {
  const count = cards.length;
  const cycle = SLOT * count;
  const trackWidth = cycle * 3 - CARD_GAP;
  const wrap = useCallback(
    (x: number) => ((x % cycle) + cycle) % cycle,
    [cycle],
  );
  // The source opens on its last card, 1856px into a 2320px cycle.
  const initialScroll = wrap((count - 1) * SLOT);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLElement>(null);
  const railHostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderer, setRenderer] = useState<RailRenderer | null>(null);
  const rendererRef = useRef<RailRenderer | null>(null);
  const scrollRef = useRef(initialScroll);
  const snapTimer = useRef<number | null>(null);
  const inputMode = useRef<InputMode>("native");
  const applyScrollRef = useRef<(x: number) => void>(() => undefined);
  const scheduleSnapRef = useRef<() => void>(() => undefined);
  const tweenRef = useRef<Tween | null>(null);
  const motion = useRef({
    frame: null as number | null,
    lastScroll: initialScroll,
    velocity: 0,
  });

  useLayoutEffect(() => {
    rendererRef.current = renderer;
  }, [renderer]);

  // Smoothed, wrap-aware scroll velocity; keeps drawing until it settles.
  const requestRender = useCallback(() => {
    const m = motion.current;
    if (m.frame !== null) return;
    const tick = () => {
      m.frame = null;
      const r = rendererRef.current;
      if (!r) return;
      const scroll = scrollRef.current;
      let delta = scroll - m.lastScroll;
      if (delta > cycle / 2) delta -= cycle;
      else if (delta < -cycle / 2) delta += cycle;
      m.lastScroll = scroll;
      m.velocity += (delta - m.velocity) * (VELOCITY_SMOOTHING * 2);
      const streak = Math.max(
        -VELOCITY_LIMIT,
        Math.min(
          VELOCITY_LIMIT,
          m.velocity * SETTINGS.velocity * VELOCITY_GAIN,
        ),
      );
      r.render(scroll, streak);
      if (Math.abs(m.velocity) > VELOCITY_REST || delta !== 0) {
        m.frame = window.requestAnimationFrame(tick);
      }
    };
    m.frame = window.requestAnimationFrame(tick);
  }, [cycle]);

  const setScroll = useCallback((logical: number) => {
    scrollRef.current = logical;
    if (surfaceRef.current)
      surfaceRef.current.dataset.scrollLeft = logical.toFixed(3);
  }, []);

  // The DOM rail always sits in its middle copy so native scrolling can run
  // either way before it is recentred.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollLeft = cycle + scrollRef.current;
    motion.current.lastScroll = scrollRef.current;
  }, [cycle]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let lastPhysical = el.scrollLeft;

    const applyScroll = (x: number) => {
      const logical = wrap(x);
      setScroll(logical);
      el.scrollLeft = cycle + logical;
      lastPhysical = el.scrollLeft;
      requestRender();
    };
    applyScrollRef.current = applyScroll;

    const snap = () => applyScroll(Math.round(scrollRef.current / SLOT) * SLOT);
    const scheduleSnap = () => {
      if (drag.isDragging()) return;
      if (snapTimer.current !== null) window.clearTimeout(snapTimer.current);
      snapTimer.current = window.setTimeout(() => {
        snapTimer.current = null;
        snap();
      }, SNAP_IDLE_MS);
    };
    scheduleSnapRef.current = scheduleSnap;

    const cancelTween = () => {
      const tween = tweenRef.current;
      if (tween?.frame != null) window.cancelAnimationFrame(tween.frame);
      tweenRef.current = null;
    };

    const drag = attachMouseDrag(el, {
      onStart() {
        inputMode.current = "mouse";
        cancelTween();
        if (snapTimer.current !== null) {
          window.clearTimeout(snapTimer.current);
          snapTimer.current = null;
        }
      },
      onDelta: (dx) => applyScroll(scrollRef.current + dx),
      onEnd() {
        inputMode.current = "programmatic";
      },
    });

    const onWheel = (e: WheelEvent) => {
      const dx = wheelDelta(e, el.clientWidth);
      e.stopPropagation();
      if (dx === 0) return;
      e.preventDefault();
      if (drag.isDragging()) return;
      inputMode.current = "native";
      cancelTween();
      const logical = wrap(scrollRef.current + dx);
      setScroll(logical);
      requestRender();
      scheduleSnap();
    };

    const onScroll = () => {
      const physical = el.scrollLeft;
      if (physical === lastPhysical) return;
      lastPhysical = physical;
      if (inputMode.current !== "native") return;
      setScroll(wrap(physical - cycle));
      requestRender();
      scheduleSnap();
    };

    el.addEventListener("wheel", onWheel, { capture: true, passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      drag.dispose();
      if (inputMode.current === "mouse") inputMode.current = "programmatic";
      el.removeEventListener("wheel", onWheel, true);
      el.removeEventListener("scroll", onScroll);
      if (snapTimer.current !== null) window.clearTimeout(snapTimer.current);
    };
  }, [cycle, wrap, setScroll, requestRender]);

  // Build the strip textures and the WebGL renderer. Until they are ready
  // (or if WebGL or CORS fails) the plain DOM cards stay visible.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let created: RailRenderer | null = null;
    buildStrip(cards, scrim)
      .then((strip) => {
        if (cancelled) return;
        created = createRailRenderer(canvas, strip, cycle);
        setRenderer(created);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      created?.dispose();
      setRenderer((current) => (current === created ? null : current));
    };
  }, [cards, cycle, scrim]);

  useEffect(() => {
    const host = railHostRef.current;
    if (!host || !renderer) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight, dpr * renderScale);
      requestRender();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    return () => observer.disconnect();
  }, [renderer, renderScale, requestRender]);

  useEffect(() => {
    const m = motion.current;
    return () => {
      if (m.frame !== null) window.cancelAnimationFrame(m.frame);
      m.frame = null;
      const tween = tweenRef.current;
      if (tween?.frame != null) window.cancelAnimationFrame(tween.frame);
      tweenRef.current = null;
    };
  }, []);

  // Arrow buttons and keys: ease to the next card boundary over 420ms,
  // chaining from the current tween target when pressed repeatedly.
  const step = useCallback(
    (direction: 1 | -1) => {
      inputMode.current = "programmatic";
      const now = performance.now();
      const running = tweenRef.current;
      let from = scrollRef.current;
      if (running) {
        const t = Math.min(1, Math.max(0, (now - running.start) / STEP_MS));
        from = running.from + (running.to - running.from) * easeOutCubic(t);
        if (running.frame !== null) window.cancelAnimationFrame(running.frame);
      }
      if (snapTimer.current !== null) {
        window.clearTimeout(snapTimer.current);
        snapTimer.current = null;
      }
      const base = (running ? running.to : from) / SLOT;
      const to =
        (direction > 0 ? Math.floor(base) + 1 : Math.ceil(base) - 1) * SLOT;
      const tween: Tween = { frame: null, from, to, start: now };
      tweenRef.current = tween;
      const tick = (time: number) => {
        if (tweenRef.current !== tween) return;
        const t = Math.min(1, Math.max(0, (time - tween.start) / STEP_MS));
        const logical = wrap(
          tween.from + (tween.to - tween.from) * easeOutCubic(t),
        );
        setScroll(logical);
        requestRender();
        if (t < 1) {
          tween.frame = window.requestAnimationFrame(tick);
          return;
        }
        applyScrollRef.current(logical);
        tweenRef.current = null;
        scheduleSnapRef.current();
      };
      tween.frame = window.requestAnimationFrame(tick);
    },
    [wrap, setScroll, requestRender],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  };

  const loop = [0, 1, 2].flatMap((copy) =>
    cards.map((card, i) => ({ card, copy, i })),
  );

  return (
    <div
      ref={surfaceRef}
      className={["acr-surface", className].filter(Boolean).join(" ")}
      data-rail-renderer={renderer ? "webgl" : "loading"}
      data-scrim={scrim ? "on" : "off"}
      style={{ backgroundColor: background, ...style }}
    >
      <style>{styles}</style>
      <header className="acr-header">
        <h2 className="acr-title">{title}</h2>
        <div
          className="acr-navigation"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            aria-label="Previous slide"
            className="acr-navigation-button"
            onClick={() => step(-1)}
            type="button"
          >
            <span className="acr-chevron acr-chevron-previous" />
          </button>
          <button
            aria-label="Next slide"
            className="acr-navigation-button"
            onClick={() => step(1)}
            type="button"
          >
            <span className="acr-chevron" />
          </button>
        </div>
      </header>
      <section
        aria-label="Customer stories"
        aria-roledescription="carousel"
        className="acr-rail-viewport"
        data-rail-visual={renderer ? "hidden" : "fallback"}
        onKeyDownCapture={onKeyDown}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") inputMode.current = "native";
          e.stopPropagation();
        }}
        onWheelCapture={(e) => {
          if (inputMode.current === "mouse") e.preventDefault();
          else inputMode.current = "native";
          e.stopPropagation();
        }}
        ref={viewportRef}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the rail is a focusable region so the arrow keys can step it, as in the source.
        tabIndex={0}
      >
        <div className="acr-rail-track" style={{ width: trackWidth }}>
          {loop.map(({ card, copy, i }) => (
            <article
              aria-hidden={copy !== 1 || undefined}
              className="acr-card"
              key={`${copy}-${i}`}
            >
              <img
                alt={copy === 1 ? card.alt : ""}
                className="acr-card-image"
                crossOrigin="anonymous"
                draggable={false}
                src={card.src}
              />
              <p className="acr-testimonial">{card.testimonial}</p>
            </article>
          ))}
        </div>
      </section>
      <div aria-hidden="true" className="acr-dispersion-rail" ref={railHostRef}>
        <canvas className="acr-dispersion-canvas" ref={canvasRef} />
      </div>
    </div>
  );
}

// Source CSS module, verbatim apart from the class prefix and the vertical
// anchors: the source pins the header at 160px and the rail at 314px inside a
// 1034px canvas; here they hang off 50% so any height centres the same block.
const styles = `
@font-face {
  font-family: "${FONT_FAMILY}";
  font-style: normal;
  font-weight: 300 900;
  font-display: swap;
  src: url("${ASSET_BASE}/aura-carousel/figtree-latin-wght-normal.woff2") format("woff2-variations");
}
.acr-surface {
  box-sizing: border-box;
  contain: layout paint style;
  isolation: isolate;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.acr-header {
  background-color: inherit;
  box-sizing: border-box;
  z-index: 4;
  justify-content: space-between;
  align-items: flex-end;
  width: min(1472px, 100%);
  max-width: 1472px;
  height: 106px;
  display: flex;
  position: absolute;
  top: calc(50% - 357px);
  left: 50%;
  transform: translate(-50%);
}
.acr-title {
  color: #000;
  font-feature-settings: "liga" 0;
  letter-spacing: -0.96px;
  width: 607.43px;
  margin: 0;
  font-family: "${FONT_FAMILY}", sans-serif;
  font-size: 48px;
  font-style: normal;
  font-weight: 500;
  line-height: 1.1;
  overflow: hidden;
}
.acr-navigation {
  box-sizing: border-box;
  background: #00000008;
  border: 1px solid #0000000d;
  border-radius: 99px;
  flex: none;
  align-items: center;
  gap: 8px;
  width: 108px;
  height: 54px;
  padding: 4px;
  display: flex;
}
.acr-navigation-button {
  appearance: none;
  color: #000;
  cursor: pointer;
  background: #fefefe;
  border: 1px solid #0000001a;
  border-radius: 99px;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 46px;
  margin: 0;
  padding: 0;
  transition: opacity 0.16s, transform 0.16s, box-shadow 0.16s;
  display: inline-flex;
}
.acr-surface .acr-navigation-button:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow: 0 2px 5px #00000014;
  cursor: pointer !important;
}
.acr-surface .acr-navigation-button:hover:not(:disabled) .acr-chevron {
  cursor: pointer !important;
}
.acr-navigation-button:focus-visible {
  outline-offset: 2px;
  outline: 2px solid #111;
}
.acr-navigation-button:disabled {
  cursor: default;
  opacity: 0.28;
  background: 0 0;
}
.acr-chevron {
  border-top: 1.8px solid;
  border-right: 1.8px solid;
  width: 8px;
  height: 8px;
  display: block;
  transform: rotate(45deg);
}
.acr-chevron.acr-chevron-previous {
  transform: rotate(-135deg);
}
.acr-rail-viewport {
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  touch-action: pan-x;
  -webkit-user-select: none;
  user-select: none;
  z-index: 1;
  outline: none;
  width: 100%;
  height: 560px;
  position: absolute;
  top: calc(50% - 203px);
  left: 0;
  overflow: scroll hidden;
}
.acr-surface .acr-rail-viewport {
  cursor: grab !important;
}
.acr-surface .acr-rail-viewport[data-carousel-dragging="true"] {
  cursor: grabbing !important;
}
.acr-surface .acr-rail-viewport * {
  cursor: inherit !important;
}
.acr-rail-viewport::-webkit-scrollbar {
  display: none;
}
.acr-rail-track {
  gap: 16px;
  height: 560px;
  display: flex;
}
.acr-card {
  -webkit-user-select: none;
  user-select: none;
  border-radius: 12px;
  flex: 0 0 448px;
  width: 448px;
  height: 560px;
  margin: 0;
  display: block;
  position: relative;
  overflow: hidden;
}
.acr-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, ${SCRIM_STOPS.map(([stop, color]) => `${color} ${stop * 100}%`).join(", ")});
}
.acr-card-image {
  border-radius: inherit;
  object-fit: cover;
  width: 100%;
  height: 100%;
  max-width: none;
  display: block;
  position: absolute;
  inset: 0;
}
.acr-testimonial {
  color: #fff;
  font-feature-settings: normal;
  letter-spacing: 0;
  margin: 0;
  font-family: "${FONT_FAMILY}", sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.3;
  position: absolute;
  z-index: 1;
  bottom: 24px;
  left: 24px;
  right: 24px;
}
.acr-surface[data-scrim="off"] .acr-card::after,
.acr-rail-viewport[data-rail-visual="hidden"] .acr-card-image,
.acr-rail-viewport[data-rail-visual="hidden"] .acr-testimonial,
.acr-rail-viewport[data-rail-visual="hidden"] .acr-card::after {
  display: none;
}
.acr-dispersion-rail {
  pointer-events: none;
  z-index: 2;
  width: 100%;
  height: 688px;
  position: absolute;
  top: calc(50% - 267px);
  left: 0;
}
.acr-dispersion-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
`;

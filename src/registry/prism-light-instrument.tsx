"use client";

/**
 * Prism Light Instrument - a lighting rig you play with a pointer.
 *
 * Lamps are placed on a surface and aimed. The surface is not empty space: it
 * is a HEIGHT FIELD, with typed letters, a ruled grid and a fine tooth pressed
 * into it, and each lamp rakes across that relief at a shallow angle. Grazing
 * light is what makes an emboss read, so the lamps sit low.
 *
 * The beam model is measured rather than invented: angular gaussians per
 * wavelength with a fixed chromatic offset, a two-term radial throw, Reinhard
 * tone mapping. A triangle of glass stands on the surface and is traced for
 * real - rays refract through it with a wavelength-dependent index, which is
 * where the spectrum comes from. Nothing here paints a gradient.
 *
 * The original was a whole-page instrument bound to `window`. This version
 * scopes sizing, input, keyboard, rAF and every WebGL resource to the React
 * component, so it can sit in a bounded box or fill the screen unchanged.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef } from "react";

/** A lamp seeded in fractional coordinates, so a rig survives any viewport. */
export interface LampSeed {
  /** Horizontal position, 0 = left edge, 1 = right edge. */
  x: number;
  /** Vertical position, 0 = top edge, 1 = bottom edge. */
  y: number;
  /** Point the lamp at this fractional coordinate. */
  aimAt?: [number, number];
  /** Aim angle in radians. Ignored when `aimAt` is set. */
  aim?: number;
  /** Half-angle of the cone, radians. Small is a spot, large is a wash. */
  spread?: number;
  /** Radiance multiplier. */
  inten?: number;
  /** Throw length, in units of the reference length. */
  throwR?: number;
  /** Gel: negative is tungsten, 0 is neutral, positive is daylight. */
  tint?: number;
}

export interface PrismConfig {
  /** Whether the glass is on the surface at all. */
  on?: boolean;
  /** Horizontal position, fraction of width. */
  x?: number;
  /** Vertical position, fraction of height. */
  y?: number;
  /** Circumradius as a fraction of the reference length. */
  radius?: number;
  /** Rotation in radians. */
  rot?: number;
  /** How far apart the wavelengths are pulled. */
  disp?: number;
  /** Brightness of the refracted fan. */
  gain?: number;
  /** How far the fan is drawn past the glass. */
  len?: number;
  /** How fast a slice softens as it leaves the glass. */
  blur?: number;
}

export interface LegendEntry {
  /** The highlighted affordance, e.g. "drag". */
  key: string;
  /** What it does, e.g. "place a lamp". */
  label: string;
}

export interface PrismLightInstrumentProps {
  /** Text embossed into the surface. Up to 5 lines, 90 characters. */
  text?: string;
  /** Small mono signature in the bottom-left. Empty string hides it. */
  mark?: string;
  /** Show the affordance legend in the bottom-right. */
  showLegend?: boolean;
  /** Legend rows. Defaults to the four gestures the instrument supports. */
  legend?: LegendEntry[];
  /** Lamps present on load. Defaults to a three-point rig aimed at the word. */
  lamps?: LampSeed[];
  /** The glass triangle. */
  prism?: PrismConfig;
  /** Raked (letters sink to a pool floor) or stamped flat at one depth. */
  ramp?: boolean;
  /** How much deeper the foot of a basin sits. */
  rampDepth?: number;
  /** Ceiling on placed lamps. Clamped to 8, the shader's array size. */
  maxLamps?: number;
  /** Angular samples across the glass, per wavelength band. */
  rayAngles?: number;
  /** Wavelength samples. Enough that no individual band shows. */
  rayBands?: number;
  /** Accent color for the gizmo overlay. */
  accent?: string;
  /** Allow typing to emboss the surface. */
  allowTyping?: boolean;
  /** Take keyboard focus on mount. Use for a full-screen presentation. */
  autoFocus?: boolean;
  className?: string;
  style?: CSSProperties;
}

/* ------------------------------------------------------------------ shaders */

const VERT = `#version 300 es
void main(){
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

/* Shared prism geometry. The prism is a real object in the plane: an
   equilateral triangle of glass standing on the surface. Rays are refracted
   through it with a wavelength-dependent index, which is where the spectrum
   comes from - nothing here paints a gradient. */
const PRISM_GLSL = `
uniform vec4  uPrism;        // xy = centre, z = circumradius, w = rotation
uniform float uPrismOn;
uniform float uSrcSize;      // lamp source radius, device px -- sets the penumbra

vec2 pvert(int i, vec4 pr){
  float a = pr.w + 1.5707963 + float(i) * 2.0943951;
  return pr.xy + pr.z * vec2(cos(a), sin(a));
}

// nearest crossing of the triangle boundary along a ray, with outward normal
bool triHit(vec2 o, vec2 d, vec4 pr, float tmin, out float bt, out vec2 bn){
  bt = 1e20;
  bool got = false;
  for (int i = 0; i < 3; i++){
    vec2 p = pvert(i, pr), q = pvert((i + 1) % 3, pr);
    vec2 e = q - p;
    vec2 n = normalize(vec2(e.y, -e.x));
    if (dot(n, p - pr.xy) < 0.0) n = -n;          // force outward
    float den = dot(d, n);
    if (abs(den) < 1e-7) continue;
    float t = dot(p - o, n) / den;
    if (t > tmin && t < bt){
      float s = dot(o + d * t - p, e) / dot(e, e);
      if (s >= -0.002 && s <= 1.002){ bt = t; bn = n; got = true; }
    }
  }
  return got;
}

bool inPrism(vec2 p, vec4 pr){
  float sgn = 0.0;
  for (int i = 0; i < 3; i++){
    vec2 a = pvert(i, pr), b = pvert((i + 1) % 3, pr);
    float c = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (sgn == 0.0) sgn = sign(c);
    else if (sign(c) != sgn) return false;
  }
  return true;
}

/* The angular slice the glass occupies as seen from a lamp. It is convex, so
   the silhouette is exactly an interval -- no sampling needed to find it. */
void prismSpan(vec2 lampPos, out float ac, out float lo, out float hi){
  vec2 toC = uPrism.xy - lampPos;
  ac = atan(toC.y, toC.x);
  lo = 1e9; hi = -1e9;
  for (int i = 0; i < 3; i++){
    vec2 v = pvert(i, uPrism) - lampPos;
    float da = atan(v.y, v.x) - ac;
    da = atan(sin(da), cos(da));
    lo = min(lo, da);
    hi = max(hi, da);
  }
}

/* How much of the lamp can see the glass along a given direction, 0..1.
   A finite source blurs the silhouette by roughly its own angular radius, so
   the penumbra falls straight out of the geometry. Doing it this way instead
   of sampling the source over time means the softness carries NO temporal
   noise at all -- it is the same every frame, converged or not. */
/* Pressed right up against the glass, the slice it subtends grows until a
   fixed number of rays can no longer fill it and they show up one by one. That
   is also the regime where a prism stops behaving like one -- the beam is far
   too divergent to disperse. Both effects ease off together. */
float prismNear(vec2 lampPos){
  float dC = length(uPrism.xy - lampPos);
  return smoothstep(uPrism.z * 1.15, uPrism.z * 3.0, dC);
}

float prismCoverage(vec2 lampPos, float ang){
  float ac, lo, hi;
  prismSpan(lampPos, ac, lo, hi);
  float dC  = max(length(uPrism.xy - lampPos), 1.0);
  float pen = max(uSrcSize / dC, 0.0035);
  float a   = atan(sin(ang - ac), cos(ang - ac));
  return min(smoothstep(lo - pen, lo + pen, a),
             1.0 - smoothstep(hi - pen, hi + pen, a));
}

// Glass takes the direct beam and hands it to the refracted rays. It does not
// take all of it: a little scatters on inside the body, which is the
// difference between reading as glass and reading as a hole cut in the light.
float prismBlocks(vec2 frag, vec2 lampPos){
  if (uPrismOn < 0.5) return 0.0;
  if (inPrism(frag, uPrism)) return 0.45;
  vec2  d   = frag - lampPos;
  float len = length(d);
  float dC  = length(uPrism.xy - lampPos);
  // only behind the glass, eased in across its own depth
  float depth = smoothstep(dC - uPrism.z, dC - uPrism.z * 0.15, len);
  return 0.90 * depth * prismNear(lampPos) * prismCoverage(lampPos, atan(d.y, d.x));
}
`;

/* The surface itself, shared by every pass that puts light on it. Both the
   lamps and the refracted spectrum have to answer to the same relief, or the
   prism reads as an overlay pasted on top of the scene instead of light. */
const SURFACE_GLSL = `
uniform vec2  uRes;
uniform float uUnit;         // reference length, device px
uniform float uDpr;
uniform sampler2D uText;
uniform float uRelief;
uniform float uZH;           // source height above the surface, device px
uniform vec2  uTextY;        // GL y of the text block: x = top, y = bottom
uniform float uRamp;         // 0 = stamped flat, 1 = raked into a basin
uniform float uRampD;        // how much deeper the foot of a basin sits

// Relief depths are tiny on purpose. A stamped letter is a few thousandths of
// the frame deep; push it further and the bevel goes vertical, the normals
// blow out, and you get a cartoon bevel instead of an impression.
const float GRID_U   = 0.1522;   // ruling pitch / unit
const float LETTER_H = 0.0088;   // emboss depth / unit
const float GRID_H   = 0.00055;
const float GRAIN_H  = 0.00013;  // tooth
const float SWELL_H  = 0.0022;   // slow undulation, like a cast surface
const float WRAP     = 0.30;     // damps the relief response at grazing angles
const float SPEC     = 0.30;

float hash(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

float ruling(vec2 p){
  float pitch = uUnit * GRID_U;
  vec2  gd = abs(fract(p / pitch + 0.5) - 0.5) * pitch;
  return 1.0 - smoothstep(0.5 * uDpr, 2.0 * uDpr, min(gd.x, gd.y));
}

/* height of the surface at p, in device px of relief */
float surfH(vec2 p){
  // letters: the blurred coverage ramp IS the bevel, and the smoothstep sets
  // how wide that bevel runs before the letter tops out flat.
  vec3  tx  = texture(uText, p / uRes).rgb;
  // A stamped letter wants a tight bevel. A basin wants a long one -- with the
  // deep end many times deeper, a narrow edge becomes a cliff, and a cliff all
  // the way round is exactly what reads as an emboss turned inside out.
  float lit = smoothstep(mix(0.17, 0.04, uRamp), mix(0.63, 0.93, uRamp), tx.r);

  // Stamped: every letter is a plateau at one depth, so only its rim catches
  // the light. Raked: each letter is its own pool floor -- flush with the
  // surface along that letter's top edge, sinking to its foot. The gradient is
  // baked per glyph, so a descender digs deeper than the cap beside it.
  float k  = clamp(tx.g / max(tx.r, 0.02), 0.0, 1.0);   // down this letter
  float gd = clamp(tx.b / max(tx.r, 0.02), 0.0, 1.0);   // how far it has sunk
  float depth = mix(LETTER_H, -LETTER_H * uRampD * k, uRamp) * gd;

  float grain = vnoise(p * (1.6 / uDpr)) * 0.55
              + vnoise(p * (4.1 / uDpr)) * 0.30
              + vnoise(p * (9.0 / uDpr)) * 0.15;

  // very slow swell, so raking light finds something even on bare surface
  float swell = vnoise(p * (0.0055 / uDpr)) * 0.7 + vnoise(p * (0.013 / uDpr)) * 0.3;

  return (lit * depth + ruling(p) * GRID_H
        + grain * GRAIN_H + swell * SWELL_H) * uUnit;
}

uniform sampler2D uNorm;     // baked, because solving it per fragment is the
                             // single most expensive thing either pass does
vec3 bakedNormal(vec2 p){
  return normalize(texture(uNorm, p / uRes).xyz * 2.0 - 1.0);
}

/* How much of the surroundings a point can still see. Tilt alone will not make
   the foot of a basin read as deep -- a pit is dark because its own walls are
   in the way, and that is an occlusion term, not a shading one. */
float bakedOpen(vec2 p){
  return texture(uNorm, p / uRes).a;
}

vec3 surfNormal(vec2 p){
  float e  = 1.15 * uDpr;
  float hx = surfH(p + vec2(e, 0.0)) - surfH(p - vec2(e, 0.0));
  float hy = surfH(p + vec2(0.0, e)) - surfH(p - vec2(0.0, e));
  return normalize(vec3(-hx / (2.0 * e), -hy / (2.0 * e), 1.0));
}

/* How the surface answers a source sitting uZH above it at \`src\`.
   Referencing against the flat response keeps bare areas neutral; WRAP stops
   the ratio exploding when the light is almost in the plane. */
vec3 surfaceResponse(vec2 frag, vec2 src, vec3 N){
  vec3  L   = normalize(vec3(-(frag - src), uZH));
  float nl  = dot(N, L);
  float nl0 = L.z;
  float shade = clamp(mix(1.0, (nl + WRAP) / (nl0 + WRAP), uRelief), 0.04, 2.2);
  vec3  Hv = normalize(L + vec3(0.0, 0.0, 1.0));
  float sp = pow(max(dot(N, Hv), 0.0), 34.0) * SPEC * smoothstep(0.0, 0.30, nl);
  return vec3(shade + sp);
}
`;

const LAMP =
  `#version 300 es
precision highp float;
out vec4 outColor;` +
  PRISM_GLSL +
  SURFACE_GLSL +
  `

uniform vec2  uJitter;
uniform float uW;            // this sample's weight in the running average
uniform int   uN;            // live lamp count
uniform vec4  uLA[8];        // xy = position, z = aim angle, w = dispersion
uniform vec4  uLB[8];        // x = intensity, y = throw, z = tint, w = birth
uniform float uPre;          // 1 when the buffer can't hold values above 1

// --- beam constants, fitted to the reference plate -----------------------
const float NEAR_A = 0.994, NEAR_U = 0.3637, NEAR_P = 6.000;
const float FAR_A  = 1.681, FAR_U  = 0.3535, FAR_P  = 1.542;
const float SRC_A  = 2.20,  SRC_U  = 0.045;
const float CHROMA = 0.60;   // prism offset, in units of D
const float CORE   = 0.35;   // achromatic core, whitens the axis
const float D_REF  = 0.24, D_CONC = 0.56;
const float GAIN   = 0.3235;

const float AMBIENT = 0.00016;  // so the ruling is faintly there in the dark

float g(float x){ return exp(-x * x); }

void main(){
  vec2 frag = gl_FragCoord.xy + uJitter;
  vec3  N    = bakedNormal(frag);
  float open = bakedOpen(frag);

  vec3 E = vec3(0.0);

  for (int i = 0; i < 8; i++){
    if (i >= uN) break;
    vec4 A = uLA[i], B = uLB[i];

    vec2  d = frag - A.xy;
    float r = max(length(d), 0.75);
    vec2  u = d / r;

    // signed angle off the aim axis -- signed, so the prism stays on one side
    vec2  a  = vec2(cos(A.z), sin(A.z));
    float th = atan(a.x * u.y - a.y * u.x, dot(a, u));

    float D   = max(A.w, 0.02);
    float off = CHROMA * D;
    vec3  ang = vec3(g((th + off) / D), g(th / D), g((th - off) / D));
    ang += CORE * g(th / (0.55 * D));

    float rn  = r / (uUnit * max(B.y * B.w, 0.02));
    float rad = NEAR_A * exp(-pow(rn / NEAR_U, NEAR_P))
              + FAR_A  * exp(-pow(rn / FAR_U,  FAR_P))
              + SRC_A  * exp(-rn / SRC_U);

    vec3 beam = GAIN * B.x * B.w * pow(D_REF / D, D_CONC) * ang * rad;
    beam *= 1.0 - prismBlocks(frag, A.xy);

    // tint is a gel on the lamp: warm through neutral to daylight
    vec3 tint = B.z < 0.0
      ? mix(vec3(1.0), vec3(1.06, 0.80, 0.55), -B.z)
      : mix(vec3(1.0), vec3(0.66, 0.84, 1.10),  B.z);

    E += beam * tint * surfaceResponse(frag, A.xy, N) * open;
  }

  // the ruling stays just barely present where no lamp reaches
  E += AMBIENT * ruling(frag);

  // without a float target the buffer clips at 1, so tone map before storing
  E = mix(E, E / (1.0 + E), uPre);

  outColor = vec4(E, uW);
}`;

/* ---------------------------------------------------------------- caustics */
/* One quad per (lamp, wavelength, angular slice, piece) -- NOT one line. A line
   is infinitely thin, so a fixed number of them leaves gaps that only close
   once the running average has filled them in; that is why the caustic used to
   look coarse for as long as you were dragging. A quad spans the slice between
   two adjacent refracted rays, so the fan is watertight in a single frame and
   looks the same moving as it does settled.

   It also fixes the brightness: with real width, the geometry carries the
   spreading, so the colour is simply the beam's radiance -- no density fudge.

   The vertex shader does the whole trace, so no geometry touches the CPU.     */

const RAYS_V =
  `#version 300 es
precision highp float;` +
  PRISM_GLSL +
  `

uniform vec2  uRes;
uniform float uUnit;
uniform vec4  uLA[8];
uniform vec4  uLB[8];
uniform int   uAngles;
uniform int   uBands;
uniform int   uSegs;         // pieces per ray
uniform float uSeed;         // 0..1, decorrelates successive samples
uniform float uDisp;         // how far apart the wavelengths are pulled
uniform float uRayGain;
uniform float uRayLen;
uniform float uBlur;         // how fast a slice softens as it leaves the glass

out vec3 vCol;        // radiance WITHOUT the distance falloff
out vec2 vSrc;        // the exit face acts as the secondary source
out float vU;         // position across the slice, in slice half-widths
out float vWiden;     // how far this slice was spread
out float vR;         // how far this corner is from the lamp
out float vThrow;     // this lamp's throw length

const float NEAR_A = 0.994, NEAR_U = 0.3637, NEAR_P = 6.000;
const float FAR_A  = 1.681, FAR_U  = 0.3535, FAR_P  = 1.542;
const float GAIN   = 0.3235;
const float D_REF  = 0.24, D_CONC = 0.56;

float throwAt(float r, float unitThrow){
  float rn = r / max(unitThrow, 1.0);
  return NEAR_A * exp(-pow(rn / NEAR_U, NEAR_P))
       + FAR_A  * exp(-pow(rn / FAR_U,  FAR_P));
}

/* In one face and out again -- but a ray that hits the far wall too steeply
   cannot leave there, it reflects. Discarding those was throwing the whole fan
   away at the orientations where most of the beam does exactly that. Following
   the bounce puts the light back and is what a real prism does anyway. */
bool traceGlass(vec2 o, float ang, float ior, out vec2 exitP, out vec2 exitD, out float travelled, out int bounces){
  vec2 d = vec2(cos(ang), sin(ang));
  float t0; vec2 n0;
  if (!triHit(o, d, uPrism, 1.0, t0, n0)) return false;
  vec2 p1 = o + d * t0;
  vec2 d1 = refract(d, n0, 1.0 / ior);
  if (dot(d1, d1) < 1e-8) return false;

  travelled = t0;
  bounces = 0;
  for (int k = 0; k < 2; k++){
    float t1; vec2 n1;
    if (!triHit(p1 + d1 * 0.5, d1, uPrism, 0.0, t1, n1)) return false;
    vec2 hit = p1 + d1 * (t1 + 0.5);
    travelled += t1;
    vec2 out2 = refract(d1, -n1, ior);
    if (dot(out2, out2) > 1e-8){                            // it gets out here
      exitP = hit; exitD = out2;
      return true;
    }
    d1 = reflect(d1, n1);                                   // total internal
    p1 = hit;
    bounces++;
  }
  return false;
}

// wavelength -> linear rgb, the usual piecewise approximation
vec3 spectral(float nm){
  vec3 c;
  if      (nm < 440.0) c = vec3(-(nm - 440.0) / 60.0, 0.0, 1.0);
  else if (nm < 490.0) c = vec3(0.0, (nm - 440.0) / 50.0, 1.0);
  else if (nm < 510.0) c = vec3(0.0, 1.0, -(nm - 510.0) / 20.0);
  else if (nm < 580.0) c = vec3((nm - 510.0) / 70.0, 1.0, 0.0);
  else if (nm < 645.0) c = vec3(1.0, -(nm - 645.0) / 65.0, 0.0);
  else                 c = vec3(1.0, 0.0, 0.0);
  float rolloff = smoothstep(380.0, 420.0, nm) * (1.0 - smoothstep(640.0, 700.0, nm));
  return c * (0.35 + 0.65 * rolloff);
}

const int SIDE[6] = int[6](0, 1, 0, 0, 1, 1);   // two triangles of one quad
const int ENDI[6] = int[6](0, 0, 1, 1, 0, 1);

void main(){
  int corner = gl_VertexID % 6;
  int piece  = gl_VertexID / 6;
  int seg    = piece / uSegs;          // which angular slice
  int si     = piece - seg * uSegs;    // which piece along it
  int side   = SIDE[corner];           // which of the slice's two edge rays
  int end    = ENDI[corner];

  int perLamp = uAngles * uBands;
  int li  = seg / perLamp;
  int rem = seg - li * perLamp;
  int bi  = rem / uAngles;
  int ai  = rem - bi * uAngles;

  vec4 A = uLA[li], B = uLB[li];
  vCol = vec3(0.0);
  vSrc = vec2(0.0);
  gl_Position = vec4(2.0, 2.0, 0.0, 1.0);      // parked off-screen by default

  // aim the fan only at the slice the glass actually subtends -- spending rays
  // on the rest of the cone would be spending them on nothing
  float ac, lo, hi;
  prismSpan(A.xy, ac, lo, hi);
  float dC  = max(length(uPrism.xy - A.xy), 1.0);
  float pen = max(uSrcSize / dC, 0.0035);
  // stay just inside the silhouette so both edge rays of every slice really
  // hit the glass -- one that misses would collapse its quad and open a gap
  float a0 = lo + pen * 0.12, a1 = hi - pen * 0.12;
  float u   = (float(ai) + float(side)) / float(uAngles);
  float ang = ac + a0 + u * (a1 - a0);

  // how much of this lamp's beam actually leaves along that angle
  float D  = max(A.w, 0.02);
  float off = ang - A.z;
  off = atan(sin(off), cos(off));
  float w = exp(-(off / D) * (off / D));
  // the spectrum fades out on exactly the curve the shadow fades in on, so
  // the two edges always agree and neither one is a hard line
  w *= prismCoverage(A.xy, ang) * prismNear(A.xy);

  // ...and it has to reach zero at the outermost slice we actually sample.
  // Coverage is still around a half there, so without this the fan stops on a
  // step, and a step along the edge of a fan is a bright hairline.
  float rel = (ang - (ac + a0)) / max(a1 - a0, 1e-5);
  w *= smoothstep(0.0, 0.10, rel) * (1.0 - smoothstep(0.90, 1.0, rel));
  if (w < 0.0006) return;

  float nm  = 400.0 + (float(bi) + 0.5) / float(uBands) * 280.0;
  float lum = nm / 1000.0;                                  // microns
  float ior = 1.45 + uDisp * (0.0045 / (lum * lum));

  // Trace BOTH edges of the slice. The quad is only meaningful if they leave
  // through the same face -- across the seam where they switch faces, or where
  // one goes totally internal, the beam really does split, and stretching a
  // quad over that gap paints a band of nonsense.
  vec2 eA, dA, eB, dB; float trA, trB; int bA, bB;
  float sw = (a1 - a0) / float(uAngles);
  if (!traceGlass(A.xy, ac + a0 + float(ai)     * sw, ior, eA, dA, trA, bA)) return;
  if (!traceGlass(A.xy, ac + a0 + float(ai + 1) * sw, ior, eB, dB, trB, bB)) return;

  // Two edge rays only bound a real beam slice if they took the SAME path
  // through the glass. Comparing bounce counts says that exactly; guessing at
  // it with angle and distance thresholds either threw away good slices or let
  // a quad stretch across a discontinuity, which is what those stray streaks
  // were. Geometry stays as a backstop for grazing cases.
  if (bA != bB) return;
  if (distance(eA, eB) > uPrism.z * 1.25) return;
  if (dot(normalize(dA), normalize(dB)) < 0.30) return;

  vec2  e1 = (side == 0) ? eA : eB;
  vec2  d2 = (side == 0) ? dA : dB;
  float travelled = (side == 0) ? trA : trB;

  float unitThrow = uUnit * max(B.y * B.w, 0.02);
  float len = unitThrow * uRayLen;

  // walking the ray in pieces lets the colour follow the throw curve down to
  // nothing, so it fades out instead of stopping while still bright
  float f = (float(si) + float(end)) / float(uSegs);
  float r = travelled + len * f;

  // Progressive softening: the further a slice gets from the glass the wider
  // it is drawn, with a soft profile across it. Neighbouring slices overlap
  // and sum, so the fan blurs with distance without a single blur pass --
  // widening geometry that is already being drawn costs almost nothing.
  vec2  pA = eA + dA * (len * f);
  vec2  pB = eB + dB * (len * f);
  vec2  mid = 0.5 * (pA + pB);
  vec2  halfv = 0.5 * (pB - pA);
  float widen = 1.0 + uBlur * (len * f) / max(unitThrow, 1.0);
  float sgn = (side == 0) ? -1.0 : 1.0;

  vec2 p = mid + halfv * (sgn * widen);
  vU = sgn * widen;
  vWiden = widen;

  // no distance falloff here -- see the fragment shader
  float amp = GAIN * B.x * B.w * pow(D_REF / D, D_CONC) * w;

  vec3 tint = B.z < 0.0
    ? mix(vec3(1.0), vec3(1.06, 0.80, 0.55), -B.z)
    : mix(vec3(1.0), vec3(0.66, 0.84, 1.10),  B.z);

  // A ray is drawn one pixel wide however far it has travelled, but the slice
  // of beam it stands for keeps widening. Without scaling by r the whole fan
  // reads dozens of times too faint, which is what a naive splat gets wrong.
  // Ease the spectrum toward the restraint the lamps already work in. Fully
  // saturated primaries next to warm-and-cool beams read as a different
  // medium, which is exactly what makes a bolted-on rainbow look bolted on.
  vec3 sp = spectral(nm);
  sp = mix(sp, vec3(dot(sp, vec3(0.2126, 0.7152, 0.0722))), 0.42);

  // the quad's own width already carries the spreading, so this is just the
  // beam's radiance -- the same quantity the direct lamp pass works in
  // spreading it wider must not brighten it -- energy stays put
  vSrc = e1;
  vR = r;
  vThrow = unitThrow;
  vCol = sp * tint * amp * uRayGain * 2.0 / (float(uBands) * (widen + 1.0));

  gl_Position = vec4(p / uRes * 2.0 - 1.0, 0.0, 1.0);
}`;

const RAYS_F =
  `#version 300 es
precision highp float;` +
  SURFACE_GLSL +
  `
in vec3 vCol;
in vec2 vSrc;
in float vU;
in float vWiden;
in float vR;
in float vThrow;
out vec4 outColor;
uniform float uCausScale;   // this buffer is smaller than the screen

const float NEAR_A = 0.994, NEAR_U = 0.3637, NEAR_P = 6.000;
const float FAR_A  = 1.681, FAR_U  = 0.3535, FAR_P  = 1.542;
const float SRC_A  = 2.20,  SRC_U  = 0.045;

float throwAt(float r, float unitThrow){
  float rn = r / max(unitThrow, 1.0);
  return NEAR_A * exp(-pow(rn / NEAR_U, NEAR_P))
       + FAR_A  * exp(-pow(rn / FAR_U,  FAR_P))
       + SRC_A  * exp(-rn / SRC_U);
}

void main(){
  // The refracted light lands on the same relief the lamps do -- it carves the
  // letters, finds the ruling and picks up the tooth. Without this the rays sit
  // on top of the picture instead of in it.
  vec2 frag = gl_FragCoord.xy;
  /* A gaussian across each slice was the bug behind the visible banding: with
     no spread the slices only touch, so the profile dips to nothing at every
     seam and rises in every middle. A flat-topped trapezoid instead -- flat
     across the slice proper, ramping away over the spread -- sums to one no
     matter how wide it gets, which is what a partition of unity has to do.
     More blur could only ever hide that ripple, never remove it. */
  float prof = clamp((vWiden - abs(vU)) / max(vWiden - 1.0, 1e-3), 0.0, 1.0);

  /* The distance falloff is evaluated HERE, per pixel. Carrying it on the
     vertices meant straight-lining an exponential between a handful of points:
     over-bright by 9x in the middle of a span and then snapping back at every
     joint, which reads as a beam that shines steadily and then falls off a
     cliff. Position and width are both linear along a ray, so the geometry
     needs no subdivision at all once the curve is off the vertices. */
  float fall = throwAt(vR, vThrow);
  outColor = vec4(vCol * fall * prof * surfaceResponse(frag, vSrc, bakedNormal(frag)) * bakedOpen(frag), 1.0);
}`;

/* lifts the half-res caustic back onto the accumulator at this sample's weight */
const COMP = `#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uCaus;
uniform vec2 uRes;
uniform float uW;
void main(){
  outColor = vec4(texture(uCaus, gl_FragCoord.xy / uRes).rgb, uW);
}`;

/* one full-screen pass, re-run only when the surface itself changes */
const NORM =
  `#version 300 es
precision highp float;
out vec4 outColor;` +
  SURFACE_GLSL +
  `
void main(){
  vec2 p = gl_FragCoord.xy;
  float sink = clamp(-surfH(p) / max(LETTER_H * uRampD * uUnit, 1.0), 0.0, 1.0);
  outColor = vec4(surfNormal(p) * 0.5 + 0.5, 1.0 - 0.82 * sink);
}`;

const SHOW = `#version 300 es
precision highp float;
out vec4 outColor;
uniform sampler2D uTex;
uniform float uPost;

// ordered dither: the cheapest way to stop a huge dark gradient from banding
// once it is squeezed into 8 bits on the way to the display
float bayer(ivec2 p){
  int x = p.x & 7, y = p.y & 7, v = 0;
  for (int i = 0; i < 3; i++){
    int xi = (x >> (2 - i)) & 1;
    int yi = (y >> (2 - i)) & 1;
    v = (v << 2) | ((xi ^ yi) << 1) | xi;
  }
  return float(v) / 64.0;
}

void main(){
  vec3 E = texelFetch(uTex, ivec2(gl_FragCoord.xy), 0).rgb;
  vec3 c = mix(E, E / (1.0 + E), uPost);       // Reinhard
  c = pow(max(c, 0.0), vec3(1.0 / 2.2));
  c += (bayer(ivec2(gl_FragCoord.xy)) - 0.5) * (1.4 / 255.0);
  outColor = vec4(c, 1.0);
}`;

/* ---------------------------------------------------------------- constants */

const MAXL = 8;
const RAY_SEGS = 1; // geometry is linear along a ray; no pieces needed
const RAY_BANDS_LO = 8; // while the relief is moving, see the frame loop
const SRC_RADIUS = 0.03; // lamp source size / unit -- this is the penumbra
const CAUS_DIV = 2; // the caustic is a soft thing; it does not need full res
const SETTLE = 26; // quads land complete in one frame; this is only AA
const HANDLE = 24;

const SLIDE_MS = 520; // how long the line takes to re-centre
const SINK_MS = 1150; // how long a new letter takes to reach full depth
const STAGGER_MS = 170; // gap between letters when a whole word arrives
const INTRO_MS = 420; // a beat of empty surface before the first one

// A grotesque holds up far better in relief than a serif does: no hairlines to
// vanish, no bracketed joins to muddy the bevel -- just clean closed shapes.
const FACE =
  '"Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif';

const DEFAULT_LAMPS: LampSeed[] = [
  // a three-point rig aimed at the word: the key does the carving, the fill
  // keeps the shadow side from going solid, the accent grazes the baseline
  {
    x: 0.05,
    y: 0.6,
    aimAt: [0.68, 0.455],
    spread: 0.155,
    inten: 7.4,
    throwR: 1.15,
    tint: -0.78,
  },
  {
    x: 0.98,
    y: 0.08,
    aimAt: [0.42, 0.56],
    spread: 0.43,
    inten: 1.9,
    throwR: 1.3,
    tint: 0.72,
  },
  {
    x: 0.99,
    y: 0.86,
    aimAt: [0.24, 0.585],
    spread: 0.055,
    inten: 5.6,
    throwR: 1.05,
    tint: -0.1,
  },
];

const DEFAULT_LEGEND: LegendEntry[] = [
  { key: "drag", label: "place a lamp" },
  { key: "handles", label: "aim / spread" },
  { key: "dbl-click", label: "remove" },
  { key: "just type", label: "to emboss" },
];

const NEW_LAMP_TINTS = [-0.75, 0.72, -0.1, 0.4];

/* ------------------------------------------------------------------- types */

interface Lamp {
  x: number;
  y: number;
  aim: number;
  spread: number;
  inten: number;
  throwR: number;
  tint: number;
  birth: number;
  wob: number;
  drift: number;
}

interface Glyph {
  ch: string;
  tx: number;
  ty: number;
  asc: number;
  desc: number;
  adv: number;
  x: number;
  y: number;
  x0: number;
  y0: number;
  t0: number;
  sink0: number;
  gd: number;
}

interface PlateLayout {
  size: number;
  track: number;
  lines: string[];
  lh: number;
  top: number;
  targets: Omit<Glyph, "x" | "y" | "x0" | "y0" | "t0" | "sink0" | "gd">[];
}

type DragMode = "move" | "aim" | "spread" | "glass" | "spin";
interface Drag {
  mode: DragMode;
  i?: number;
  ox?: number;
  oy?: number;
}

/* ------------------------------------------------------------------ helpers */

/** "#e8bf4b" -> "232,191,75", so it can be dropped into an rgba() string. */
function rgbTriplet(hex: string): string {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return "232,191,75";
  let h = m[1];
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = Number.parseInt(h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

// zero slope AND zero curvature at both ends -- no visible start or stop
function ease(t: number) {
  return t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (t * (t * 6 - 15) + 10);
}

/** The legend reads as two affordances per line, right-aligned, as in the source. */
function legendRows(entries: LegendEntry[]): LegendEntry[][] {
  const rows: LegendEntry[][] = [];
  for (let i = 0; i < entries.length; i += 2)
    rows.push(entries.slice(i, i + 2));
  return rows;
}

function halton(i: number, b: number) {
  let f = 1;
  let r = 0;
  let n = i;
  while (n > 0) {
    f /= b;
    r += f * (n % b);
    n = Math.floor(n / b);
  }
  return r;
}

/* ================================================================ component */

export default function PrismLightInstrument({
  text = "LIGHT",
  mark = "blank_graphics",
  showLegend = true,
  legend = DEFAULT_LEGEND,
  lamps = DEFAULT_LAMPS,
  prism,
  ramp = true,
  rampDepth = 5,
  maxLamps = 8,
  rayAngles = 84,
  rayBands = 24,
  accent = "#e8bf4b",
  allowTyping = true,
  autoFocus = false,
  className,
  style,
}: PrismLightInstrumentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const ovRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<HTMLDivElement>(null);

  // Live prop values the engine reads each frame, so tuning a dial never tears
  // down a WebGL context.
  const live = useRef({
    lamps,
    prism,
    ramp,
    rampDepth,
    maxLamps,
    rayAngles,
    rayBands,
    accent,
    allowTyping,
  });
  // Synced in an effect rather than during render: the React Compiler is on for
  // this app, and a ref written mid-render is not a safe thing to memoize
  // around. The useRef initializer already holds the right values on mount.
  useEffect(() => {
    live.current = {
      lamps,
      prism,
      ramp,
      rampDepth,
      maxLamps,
      rayAngles,
      rayBands,
      accent,
      allowTyping,
    };
  });

  // The engine hands back the handful of things React drives from the outside.
  const api = useRef<{
    type: (e: ReactKeyboardEvent) => void;
    setText: (t: string) => void;
    setRelief: (ramp: boolean, depth: number) => void;
    setPrism: (p: PrismConfig | undefined) => void;
    restart: () => void;
  } | null>(null);

  useEffect(() => {
    const rootEl = rootRef.current;
    const glCanvas = glRef.current;
    const ovCanvas = ovRef.current;
    if (!rootEl || !glCanvas || !ovCanvas) return;
    const ovCtx = ovCanvas.getContext("2d");
    if (!ovCtx) return;

    // Rebound to their own consts so the non-null type survives into the
    // hoisted function declarations below, which TypeScript will not narrow
    // into (they could, in principle, be called before the guard ran).
    const root = rootEl;
    const glc = glCanvas;
    const ovc = ovCanvas;
    const ovx = ovCtx;

    const ctx = glc.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!ctx || ctx.isContextLost()) {
      root.dataset.unsupported = "true";
      return;
    }
    // Bound to its own const so the narrowing survives into every closure below.
    const gl = ctx;

    // `gl.useProgram` matches the linter's React-hook name heuristic, which
    // fires wherever it is called conditionally. One plainly named wrapper
    // keeps every call site below unambiguous.
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method, not a React Hook.
    const bindProgram = (p: WebGLProgram) => gl.useProgram(p);
    const hasFloat = !!gl.getExtension("EXT_color_buffer_float");

    /* ------------------------------------------------------------ programs */

    function compile(src: string, type: number) {
      const s = gl.createShader(type);
      if (!s) throw new Error("shader alloc failed");
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? "compile failed");
      return s;
    }
    function program(fs: string, vs?: string) {
      const p = gl.createProgram();
      if (!p) throw new Error("program alloc failed");
      gl.attachShader(p, compile(vs || VERT, gl.VERTEX_SHADER));
      gl.attachShader(p, compile(fs, gl.FRAGMENT_SHADER));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(p) ?? "link failed");
      return p;
    }

    const pNorm = program(NORM);
    const pComp = program(COMP);
    const pLamp = program(LAMP);
    const pRays = program(RAYS_F, RAYS_V);
    const pShow = program(SHOW);

    type ULoc = Record<string, WebGLUniformLocation | null>;
    const uL: ULoc = {};
    const uR: ULoc = {};
    const uNo: ULoc = {};
    const uC: ULoc = {};
    for (const n of ["uCaus", "uRes", "uW"])
      uC[n] = gl.getUniformLocation(pComp, n);
    for (const n of [
      "uRes",
      "uUnit",
      "uDpr",
      "uJitter",
      "uW",
      "uN",
      "uLA",
      "uLB",
      "uText",
      "uRelief",
      "uZH",
      "uPre",
      "uPrism",
      "uPrismOn",
      "uSrcSize",
      "uTextY",
      "uRamp",
      "uRampD",
      "uNorm",
    ])
      uL[n] = gl.getUniformLocation(pLamp, n);
    for (const n of [
      "uRes",
      "uUnit",
      "uLA",
      "uLB",
      "uAngles",
      "uBands",
      "uSeed",
      "uDisp",
      "uRayGain",
      "uRayLen",
      "uSegs",
      "uBlur",
      "uCausScale",
      "uPrism",
      "uPrismOn",
      "uSrcSize",
      "uDpr",
      "uText",
      "uRelief",
      "uZH",
      "uTextY",
      "uRamp",
      "uRampD",
      "uNorm",
    ])
      uR[n] = gl.getUniformLocation(pRays, n);
    for (const n of [
      "uRes",
      "uUnit",
      "uDpr",
      "uText",
      "uTextY",
      "uRamp",
      "uRampD",
    ])
      uNo[n] = gl.getUniformLocation(pNorm, n);

    const uShowTex = gl.getUniformLocation(pShow, "uTex");
    const uShowPost = gl.getUniformLocation(pShow, "uPost");
    const vao = gl.createVertexArray();

    /* ------------------------------------------------------------- targets */

    let tex: WebGLTexture | null = null;
    let fbo: WebGLFramebuffer | null = null;
    let W = 0;
    let H = 0;
    let DPR = 1;
    let normTex: WebGLTexture | null = null;
    let normFbo: WebGLFramebuffer | null = null;
    let causTex: WebGLTexture | null = null;
    let causFbo: WebGLFramebuffer | null = null;
    let CW = 0;
    let CH = 0;

    function allocTargets() {
      if (tex) gl.deleteTexture(tex);
      if (fbo) gl.deleteFramebuffer(fbo);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        hasFloat ? gl.RGBA16F : gl.RGBA8,
        W,
        H,
        0,
        gl.RGBA,
        hasFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        null,
      );
      for (const [k, v] of [
        [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
        [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ])
        gl.texParameteri(gl.TEXTURE_2D, k, v);
      fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        tex,
        0,
      );

      if (normTex) gl.deleteTexture(normTex);
      if (normFbo) gl.deleteFramebuffer(normFbo);
      normTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, normTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        W,
        H,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
      for (const [k, v] of [
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ])
        gl.texParameteri(gl.TEXTURE_2D, k, v);
      normFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, normFbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        normTex,
        0,
      );

      if (causTex) gl.deleteTexture(causTex);
      if (causFbo) gl.deleteFramebuffer(causFbo);
      CW = Math.max(1, Math.ceil(W / CAUS_DIV));
      CH = Math.max(1, Math.ceil(H / CAUS_DIV));
      causTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, causTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        hasFloat ? gl.RGBA16F : gl.RGBA8,
        CW,
        CH,
        0,
        gl.RGBA,
        hasFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        null,
      );
      for (const [k, v] of [
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ])
        gl.texParameteri(gl.TEXTURE_2D, k, v);
      causFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, causFbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        causTex,
        0,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /* The relief only changes when the type, the ramp or the viewport does, so
       its normals are solved once and read back as a texture. Both the lamp
       pass and the caustic pass were paying for four height evaluations per
       fragment -- with two dozen overlapping wavelength fans, that was the
       whole frame. */
    function bakeNormals() {
      if (!normFbo) return;
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, normFbo);
      gl.viewport(0, 0, W, H);
      bindProgram(pNorm);
      gl.bindVertexArray(vao);
      gl.uniform2f(uNo.uRes, W, H);
      gl.uniform1f(uNo.uUnit, S.unit * DPR);
      gl.uniform1f(uNo.uDpr, DPR);
      gl.uniform2f(uNo.uTextY, S.textTop, S.textBot);
      gl.uniform1f(uNo.uRamp, S.ramp ? 1 : 0);
      gl.uniform1f(uNo.uRampD, S.rampD);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      gl.uniform1i(uNo.uText, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /* --------------------------------------------------------- the plate */
    /* Text is drawn to a 2D canvas at half resolution and blurred; that blur IS
       the bevel, so the shader can read it straight as a height ramp.        */

    const plate = document.createElement("canvas");
    const plateCtx = plate.getContext("2d");
    if (!plateCtx) return;
    const px2 = plateCtx;
    let plateTex: WebGLTexture | null = null;
    let caretOn = true;

    function makePlateTex() {
      plateTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      for (const [k, v] of [
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ])
        gl.texParameteri(gl.TEXTURE_2D, k, v);
    }

    function measure(s: string, track: number) {
      return px2.measureText(s).width + track * Math.max(s.length - 1, 0);
    }
    function wrapText(t: string, maxW: number, track: number) {
      const out: string[] = [];
      for (const para of t.split("\n")) {
        if (para === "") {
          out.push("");
          continue;
        }
        let line = "";
        for (const word of para.split(" ")) {
          const test = line ? `${line} ${word}` : word;
          if (measure(test, track) > maxW && line) {
            out.push(line);
            line = word;
          } else line = test;
        }
        out.push(line);
      }
      return out.slice(0, 5);
    }
    function layout(t: string, w: number, h: number) {
      const maxW = w * 0.84;
      const maxH = h * 0.46;
      let size = Math.min(w * 0.2, h * 0.16);
      let track = size * 0.055;
      let lines = [t];
      for (let guard = 0; guard < 46; guard++) {
        track = size * 0.055;
        px2.font = `${size}px ${FACE}`;
        lines = wrapText(t, maxW, track);
        const tall = lines.length * size * 1.16;
        const wide = Math.max(...lines.map((l) => measure(l, track)), 0);
        if (tall <= maxH && wide <= maxW) break;
        size *= 0.93;
      }
      return { size, track, lines };
    }

    /* ---------------------------------------------------------- glyphs */
    /* Letters are their own little objects so they can move. Typing re-centres
       the line, which means every letter already on screen has a new home to
       travel to, and the one just added has to sink in from nothing rather than
       appear at full depth. Both are springs; the plate is repainted while
       either is live. */

    function layoutGlyphs(): PlateLayout {
      const w = plate.width;
      const h = plate.height;
      const { size, track, lines } = layout(S.text || " ", w, h);
      const lh = size * 1.16;
      const top = h / 2 - ((lines.length - 1) * lh) / 2 + size * 0.34;

      px2.font = `${size}px ${FACE}`;
      const out: PlateLayout["targets"] = [];
      for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        let x = w / 2 - measure(line, track) / 2;
        for (const ch of line) {
          const m = px2.measureText(ch);
          out.push({
            ch,
            tx: x,
            ty: top + li * lh,
            asc: m.actualBoundingBoxAscent || size * 0.7,
            desc: m.actualBoundingBoxDescent || 0,
            adv: m.width,
          });
          x += m.width + track;
        }
      }
      return { size, track, lines, lh, top, targets: out };
    }

    /* fold new targets into the live glyphs, keeping anything already in flight */
    function retarget() {
      const L = layoutGlyphs();
      S.plate = L;
      const g = S.glyphs;
      const now = performance.now();
      const fresh: Glyph[] = [];
      let anyMoved = false;

      for (let i = 0; i < L.targets.length; i++) {
        const t = L.targets[i];
        if (g[i]) {
          const q = g[i];
          const moved =
            Math.abs(q.tx - t.tx) > 0.3 || Math.abs(q.ty - t.ty) > 0.3;
          Object.assign(q, t);
          if (moved) {
            q.x0 = q.x;
            q.y0 = q.y;
            q.t0 = now;
            anyMoved = true;
          }
        } else {
          g[i] = Object.assign(
            {
              x: t.tx,
              y: t.ty,
              x0: t.tx,
              y0: t.ty,
              t0: now - SLIDE_MS,
              sink0: now,
              gd: 0,
            },
            t,
          );
          fresh.push(g[i]);
        }
      }
      g.length = L.targets.length;

      // The line re-centres first, and only then does a new letter start to
      // arrive. Running them together meant a letter could surface underneath
      // one that was still travelling across the spot it was surfacing in.
      //
      // When a whole word turns up at once -- on load -- they come in one after
      // another rather than all together, so the piece reads itself in.
      const lead = S.intro ? INTRO_MS : anyMoved ? SLIDE_MS : 0;
      const step = fresh.length > 1 ? STAGGER_MS : 0;
      for (let k = 0; k < fresh.length; k++)
        fresh[k].sink0 = now + lead + k * step;
      if (fresh.length) S.intro = false;

      const toGL = H / plate.height;
      const capTop = L.top - L.size * 0.72;
      const footY = L.top + (L.lines.length - 1) * L.lh + L.size * 0.22;
      S.textTop = H - capTop * toGL;
      S.textBot = H - footY * toGL;
    }

    /* Timed, not per-frame stepped. A spring advanced once per frame runs
       slower when the frame rate dips -- and the frame rate dips precisely
       because this is animating, so it would stretch itself out exactly when it
       should not. On a clock it takes the same time no matter what the renderer
       is doing. */
    function stepGlyphs() {
      const now = performance.now();
      let liveNow = false;
      for (const q of S.glyphs) {
        const u = (now - q.t0) / SLIDE_MS;
        const v = (now - q.sink0) / SINK_MS;
        const e = ease(u);
        q.x = q.x0 + (q.tx - q.x0) * e;
        q.y = q.y0 + (q.ty - q.y0) * e;
        q.gd = ease(v);
        if (u < 1 || v < 1) liveNow = true;
      }
      return liveNow;
    }

    function paintPlate() {
      const L = S.plate;
      if (!L) return;
      const w = plate.width;
      const h = plate.height;
      const size = L.size;

      px2.setTransform(1, 0, 0, 1, 0, 0);
      px2.filter = "none";
      px2.globalCompositeOperation = "source-over";
      px2.fillStyle = "#000";
      px2.fillRect(0, 0, w, h);

      // blur radius is the bevel width, scaled to the type so big letters get a
      // proportionally generous chamfer instead of a hairline
      px2.filter = `blur(${(size * 0.042).toFixed(2)}px)`;
      px2.font = `${size}px ${FACE}`;
      px2.textAlign = "left";
      px2.textBaseline = "alphabetic";
      px2.globalCompositeOperation = "lighter";

      // R = coverage
      px2.fillStyle = "rgb(255,0,0)";
      for (const q of S.glyphs) if (q.ch.trim()) px2.fillText(q.ch, q.x, q.y);

      // G = how far down this letter you are, B = how deep this letter is yet.
      // Both ride one gradient, so it is still a single pass over the glyphs.
      for (const q of S.glyphs) {
        if (!q.ch.trim()) continue;
        const d = Math.round(255 * Math.min(1, Math.max(0, q.gd)));
        const g = px2.createLinearGradient(
          0,
          q.y - q.asc,
          0,
          q.y + q.desc + 0.001,
        );
        g.addColorStop(0, `rgb(0,0,${d})`);
        g.addColorStop(1, `rgb(0,255,${d})`);
        px2.fillStyle = g;
        px2.fillText(q.ch, q.x, q.y);
      }

      px2.filter = "none";
      px2.globalCompositeOperation = "source-over";

      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        plate,
      );
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      bakeNormals();
      restart();
    }

    function renderPlate() {
      retarget();
      paintPlate();
    }

    /* --------------------------------------------------------------- state */

    const cfg = live.current;
    const S = {
      lights: [] as Lamp[],
      sel: -1,
      drag: null as Drag | null,
      text,
      typing: false,
      n: 0,
      vw: 0,
      vh: 0,
      unit: 0,
      ramp: cfg.ramp,
      rampD: cfg.rampDepth,
      glyphs: [] as Glyph[],
      intro: true,
      tick: 0,
      wasLive: false,
      plate: null as PlateLayout | null,
      textTop: 0,
      textBot: 0,
      prism: {
        x: 0,
        y: 0,
        r: 0,
        rot: cfg.prism?.rot ?? 0.62,
        on: cfg.prism?.on ?? true,
        disp: cfg.prism?.disp ?? 6.5,
        gain: cfg.prism?.gain ?? 1.0,
        len: cfg.prism?.len ?? 1.9,
        blur: cfg.prism?.blur ?? 2.6,
      },
      t0: performance.now(),
      lastInput: performance.now(),
    };

    function restart() {
      S.n = 0;
    }

    function mkLight(
      x: number,
      y: number,
      aim: number,
      spread: number,
      inten: number,
      throwR: number,
      tint: number,
    ): Lamp {
      return {
        x,
        y,
        aim,
        spread,
        inten,
        throwR,
        tint,
        birth: 0,
        wob: 0,
        drift: Math.random() * 6.283,
      };
    }

    function defaultRig() {
      const w = S.vw;
      const h = S.vh;
      S.lights = (live.current.lamps ?? DEFAULT_LAMPS)
        .slice(0, MAXL)
        .map((seed) => {
          const x = seed.x * w;
          const y = seed.y * h;
          const aim = seed.aimAt
            ? Math.atan2(seed.aimAt[1] * h - y, seed.aimAt[0] * w - x)
            : (seed.aim ?? 0);
          return mkLight(
            x,
            y,
            aim,
            seed.spread ?? 0.2,
            seed.inten ?? 4.5,
            seed.throwR ?? 1,
            seed.tint ?? 0,
          );
        });
      S.sel = -1;
    }

    /* ------------------------------------------------------------ the glass */

    function prismVerts(): [number, number][] {
      const P = S.prism;
      const out: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        const a = P.rot + Math.PI / 2 + i * ((Math.PI * 2) / 3);
        out.push([P.x + Math.cos(a) * P.r, P.y + Math.sin(a) * P.r]);
      }
      return out;
    }
    function insidePrism(x: number, y: number) {
      if (!S.prism.on) return false;
      const v = prismVerts();
      let sign = 0;
      for (let i = 0; i < 3; i++) {
        const [ax, ay] = v[i];
        const [bx, by] = v[(i + 1) % 3];
        const c = (bx - ax) * (y - ay) - (by - ay) * (x - ax);
        if (c !== 0) {
          if (sign === 0) sign = Math.sign(c);
          else if (Math.sign(c) !== sign) return false;
        }
      }
      return true;
    }

    /* ---------------------------------------------------------- gizmo hit */

    function tipOf(L: Lamp): [number, number] {
      const len = L.throwR * S.unit * 0.4;
      return [L.x + Math.cos(L.aim) * len, L.y + Math.sin(L.aim) * len];
    }
    function edgeOf(L: Lamp, sgn: number): [number, number] {
      const len = L.throwR * S.unit * 0.32;
      const a = L.aim + sgn * L.spread;
      return [L.x + Math.cos(a) * len, L.y + Math.sin(a) * len];
    }
    function near(px: number, py: number, x: number, y: number) {
      return Math.hypot(px - x, py - y) < HANDLE;
    }

    function hit(x: number, y: number): Drag | null {
      if (S.sel >= 0 && S.lights[S.sel]) {
        const L = S.lights[S.sel];
        const t = tipOf(L);
        if (near(x, y, t[0], t[1])) return { mode: "aim", i: S.sel };
        for (const s of [1, -1]) {
          const e = edgeOf(L, s);
          if (near(x, y, e[0], e[1])) return { mode: "spread", i: S.sel };
        }
      }
      for (let i = S.lights.length - 1; i >= 0; i--) {
        const L = S.lights[i];
        if (near(x, y, L.x, L.y))
          return { mode: "move", i, ox: x - L.x, oy: y - L.y };
      }
      // the glass: a corner grip spins it, anywhere else on the body slides it
      if (S.prism.on) {
        const v = prismVerts();
        for (const [vx, vy] of v)
          if (near(x, y, vx, vy)) return { mode: "spin" };
        if (insidePrism(x, y))
          return { mode: "glass", ox: x - S.prism.x, oy: y - S.prism.y };
      }
      return null;
    }

    /* ------------------------------------------------------------- layout */

    function resize() {
      const vw = root?.clientWidth ?? 0;
      const vh = root?.clientHeight ?? 0;
      if (vw < 2 || vh < 2) return;
      DPR = Math.min(window.devicePixelRatio || 1, 2.5);
      const first = S.vw === 0;
      const sx = first ? 1 : vw / S.vw;
      const sy = first ? 1 : vh / S.vh;

      S.vw = vw;
      S.vh = vh;
      S.unit = Math.min(vw, vh * (2 / 3));

      W = Math.max(1, Math.round(vw * DPR));
      H = Math.max(1, Math.round(vh * DPR));
      glc.width = W;
      glc.height = H;
      ovc.width = W;
      ovc.height = H;
      ovx.setTransform(DPR, 0, 0, DPR, 0, 0);

      plate.width = Math.max(1, Math.round(W * 0.5));
      plate.height = Math.max(1, Math.round(H * 0.5));

      allocTargets();
      if (!plateTex) makePlateTex();

      if (first) {
        defaultRig();
        S.prism.x = vw * (live.current.prism?.x ?? 0.375);
        S.prism.y = vh * (live.current.prism?.y ?? 0.53);
      } else {
        for (const L of S.lights) {
          L.x *= sx;
          L.y *= sy;
        }
        S.prism.x *= sx;
        S.prism.y *= sy;
      }
      S.prism.r = S.unit * (live.current.prism?.radius ?? 0.062);

      renderPlate();
    }

    /* ------------------------------------------------------------ overlay */

    let ovLive = false;

    function ring(
      x: number,
      y: number,
      r: number,
      fill: string | null,
      stroke: string | null,
      lw?: number,
    ) {
      ovx.beginPath();
      ovx.arc(x, y, r, 0, Math.PI * 2);
      if (fill) {
        ovx.fillStyle = fill;
        ovx.fill();
      }
      if (stroke) {
        ovx.strokeStyle = stroke;
        ovx.lineWidth = lw || 1;
        ovx.stroke();
      }
    }

    function drawOverlay() {
      const AMBER = rgbTriplet(live.current.accent);
      ovx.clearRect(0, 0, S.vw, S.vh);

      // The caret used to be pressed into the surface with the letters, so
      // every blink re-rendered the plate and restarted the light. It is
      // interface, not relief -- up here it costs nothing.
      if (caretOn && S.typing && S.plate) {
        const L = S.plate;
        const sx = S.vw / plate.width;
        const sy = S.vh / plate.height;
        const last = S.glyphs[S.glyphs.length - 1];
        const cx =
          (last ? last.x + last.adv + L.track * 0.8 : plate.width / 2) * sx;
        const cy = (last ? last.y : L.top) * sy;
        // an empty cell waiting for a letter, not a bar. hairline and white so
        // it reads as instrument rather than as another thing cut into the
        // surface
        const cw = Math.max(L.size * 0.25 * sx, 4);
        const ch = Math.max(L.size * 0.72 * sy, 8);
        // one device pixel, snapped in device space so it lands on a single row
        // rather than smearing across two. thinner reads dimmer, so it gains
        // alpha
        const lw = 1 / DPR;
        const snap = (v: number) => (Math.round(v * DPR) + 0.5) / DPR;
        const x0 = snap(cx);
        const y0 = snap(cy - L.size * 0.7 * sy);
        ovx.strokeStyle = "rgba(255,255,255,0.82)";
        ovx.lineWidth = lw;
        ovx.strokeRect(x0, y0, Math.round(cw), Math.round(ch));
      }

      // the glass: an edge bright enough to locate, faint enough to stay an
      // object
      if (S.prism.on) {
        const v = prismVerts();
        ovx.beginPath();
        ovx.moveTo(v[0][0], v[0][1]);
        ovx.lineTo(v[1][0], v[1][1]);
        ovx.lineTo(v[2][0], v[2][1]);
        ovx.closePath();
        ovx.strokeStyle = "rgba(216,224,232,0.34)";
        ovx.lineWidth = 1;
        ovx.stroke();
        for (const [vx, vy] of v)
          ring(vx, vy, 2.6, "rgba(216,224,232,0.5)", null);
      }

      for (let i = 0; i < S.lights.length; i++) {
        const L = S.lights[i];
        const on = i === S.sel;

        if (on) {
          // cone edges and aim, drawn only for the lamp you are actually
          // holding
          const [tx, ty] = tipOf(L);
          ovx.setLineDash([5, 6]);
          ovx.strokeStyle = `rgba(${AMBER},0.44)`;
          ovx.lineWidth = 1;
          for (const s of [1, -1]) {
            const [ex, ey] = edgeOf(L, s);
            ovx.beginPath();
            ovx.moveTo(L.x, L.y);
            ovx.lineTo(ex, ey);
            ovx.stroke();
          }
          ovx.setLineDash([]);
          ovx.strokeStyle = `rgba(${AMBER},0.60)`;
          ovx.beginPath();
          ovx.moveTo(L.x, L.y);
          ovx.lineTo(tx, ty);
          ovx.stroke();

          // open rings for the spread grips, a solid dot for the aim grip, so
          // the two read as different kinds of control at a glance
          for (const s of [1, -1]) {
            const [ex, ey] = edgeOf(L, s);
            ring(ex, ey, 4.5, "rgba(10,10,9,0.85)", `rgba(${AMBER},0.95)`, 1.5);
          }
          ring(tx, ty, 4.5, `rgba(${AMBER},0.95)`, null);
          ring(tx, ty, 8.5, null, `rgba(${AMBER},0.35)`, 1);
        }

        ring(
          L.x,
          L.y,
          on ? 7 : 5,
          null,
          `rgba(${AMBER},${on ? 1 : 0.4})`,
          on ? 1.4 : 1,
        );
        ring(L.x, L.y, 1.9, `rgba(${AMBER},${on ? 1 : 0.4})`, null);
      }
    }

    function drawHud() {
      // nothing to report any more -- the legend just gets out of the way
      keysRef.current?.classList.toggle(
        "pli-rest",
        performance.now() - S.lastInput > 2600,
      );
    }

    /* ---------------------------------------------------------- main loop */

    const LA = new Float32Array(MAXL * 4);
    const LB = new Float32Array(MAXL * 4);
    let raf = 0;
    let stopped = false;

    function frame() {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      const t = (performance.now() - S.t0) / 1000;
      const P = S.prism;

      // lamps ease up to full throw when placed, and breathe a little at rest
      // so an untouched screen is never completely dead
      let moving = false;
      for (const L of S.lights) {
        if (L.birth < 1) {
          L.birth = Math.min(1, L.birth + 0.042);
          moving = true;
        }
        // The breathe has to be slow enough that the running average can
        // actually build between nudges -- restarting every frame pins it at
        // one sample, which costs the soft edges and makes the ray pass run
        // forever.
        const wob =
          Math.sin(t * 0.055 + L.drift) * 0.011 +
          Math.sin(t * 0.034 + L.drift * 1.7) * 0.006;
        if (Math.abs(wob - L.wob) > 0.0035) {
          L.wob = wob;
          moving = true;
        }
      }
      if (moving) restart();

      // Letters slide to their new centre and sink in. The springs step every
      // frame, but the plate itself only needs repainting at half that --
      // pushing a fresh canvas into a texture stalls the pipeline, and nobody
      // can see the difference between a spring sampled at 60Hz and one sampled
      // at 30.
      const liveGlyphs = S.glyphs.length ? stepGlyphs() : false;
      if (liveGlyphs) {
        if ((S.tick++ & 1) === 0) paintPlate();
        S.wasLive = true;
      } else if (S.wasLive) {
        paintPlate(); // always land on the settled frame
        S.wasLive = false;
      }

      // A lamp is not a mathematical point. Sampling a small disc across the
      // accumulation gives every edge it casts a real penumbra -- the glass
      // stops cutting the beam with a razor, and the spectrum's edges go soft.
      for (let i = 0; i < S.lights.length; i++) {
        const L = S.lights[i];
        LA[i * 4 + 0] = L.x * DPR;
        LA[i * 4 + 1] = (S.vh - L.y) * DPR; // GL y is up
        LA[i * 4 + 2] = -(L.aim + L.wob); // so the aim flips too
        LA[i * 4 + 3] = L.spread;
        const b = L.birth * L.birth * (3 - 2 * L.birth);
        LB[i * 4 + 0] = L.inten;
        LB[i * 4 + 1] = L.throwR;
        LB[i * 4 + 2] = L.tint;
        LB[i * 4 + 3] = b;
      }

      // Every wavelength draws its own full fan, so bands ARE the overdraw.
      // While the type is animating, the whole surface is being re-lit every
      // frame, so spend fewer of them -- the progressive blur covers for a
      // coarser spectrum and it lasts well under a second.
      const angles = Math.max(4, Math.round(live.current.rayAngles));
      const bands = S.wasLive
        ? RAY_BANDS_LO
        : Math.max(1, Math.round(live.current.rayBands));

      if (S.n < SETTLE) {
        const i = S.n + 1;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, W, H);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        bindProgram(pLamp);
        gl.bindVertexArray(vao);
        gl.uniform1f(uL.uW, 1 / i);
        gl.uniform2f(uL.uRes, W, H);
        gl.uniform1f(uL.uUnit, S.unit * DPR);
        gl.uniform1f(uL.uDpr, DPR);
        gl.uniform2f(uL.uJitter, halton(i, 2) - 0.5, halton(i, 3) - 0.5);
        gl.uniform1i(uL.uN, S.lights.length);
        gl.uniform4fv(uL.uLA, LA);
        gl.uniform4fv(uL.uLB, LB);
        gl.uniform1f(uL.uRelief, 1.0);
        gl.uniform1f(uL.uZH, S.unit * DPR * 0.085);
        gl.uniform1f(uL.uPre, hasFloat ? 0 : 1);
        gl.uniform4f(
          uL.uPrism,
          P.x * DPR,
          (S.vh - P.y) * DPR,
          P.r * DPR,
          -P.rot,
        );
        gl.uniform1f(uL.uPrismOn, P.on ? 1 : 0);
        gl.uniform1f(uL.uSrcSize, S.unit * DPR * SRC_RADIUS);
        gl.uniform2f(uL.uTextY, S.textTop, S.textBot);
        gl.uniform1f(uL.uRamp, S.ramp ? 1 : 0);
        gl.uniform1f(uL.uRampD, S.rampD);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, plateTex);
        gl.uniform1i(uL.uText, 0);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, normTex);
        gl.uniform1i(uL.uNorm, 2);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // Caustics go into their own smaller buffer. Each wavelength paints a
        // full fan over the same region, so 24 bands means 24x the pixel work
        // -- that overdraw, not the geometry, is what costs the frame. A
        // blurred spectrum survives being computed at half resolution perfectly
        // well, and a quarter of the fragments is a quarter of the problem.
        if (P.on && S.lights.length) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, causFbo);
          gl.viewport(0, 0, CW, CH);
          gl.disable(gl.BLEND);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.ONE, gl.ONE);

          bindProgram(pRays);
          gl.bindVertexArray(vao);
          gl.uniform2f(uR.uRes, W, H);
          gl.uniform1f(uR.uUnit, S.unit * DPR);
          gl.uniform4fv(uR.uLA, LA);
          gl.uniform4fv(uR.uLB, LB);
          gl.uniform1i(uR.uAngles, angles);
          gl.uniform1i(uR.uBands, bands);
          gl.uniform1i(uR.uSegs, RAY_SEGS);
          gl.uniform1f(uR.uSeed, (i * 0.7548776662) % 1);
          gl.uniform1f(uR.uDisp, P.disp);
          gl.uniform1f(uR.uRayGain, P.gain);
          gl.uniform1f(uR.uRayLen, P.len);
          gl.uniform1f(uR.uBlur, P.blur);
          gl.uniform1f(uR.uCausScale, CAUS_DIV);
          gl.uniform4f(
            uR.uPrism,
            P.x * DPR,
            (S.vh - P.y) * DPR,
            P.r * DPR,
            -P.rot,
          );
          gl.uniform1f(uR.uPrismOn, 1);
          gl.uniform1f(uR.uSrcSize, S.unit * DPR * SRC_RADIUS);
          gl.uniform1f(uR.uDpr, DPR);
          gl.uniform1f(uR.uRelief, 1.0);
          gl.uniform1f(uR.uZH, S.unit * DPR * 0.085);
          gl.uniform2f(uR.uTextY, S.textTop, S.textBot);
          gl.uniform1f(uR.uRamp, S.ramp ? 1 : 0);
          gl.uniform1f(uR.uRampD, S.rampD);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, plateTex);
          gl.uniform1i(uR.uText, 0);
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, normTex);
          gl.uniform1i(uR.uNorm, 2);
          gl.drawArrays(
            gl.TRIANGLES,
            0,
            S.lights.length * angles * bands * RAY_SEGS * 6,
          );

          // and back onto the accumulator at this sample's weight
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
          gl.viewport(0, 0, W, H);
          gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          bindProgram(pComp);
          gl.bindVertexArray(vao);
          gl.activeTexture(gl.TEXTURE3);
          gl.bindTexture(gl.TEXTURE_2D, causTex);
          gl.uniform1i(uC.uCaus, 3);
          gl.uniform2f(uC.uRes, W, H);
          gl.uniform1f(uC.uW, 1 / i);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        gl.disable(gl.BLEND);
        S.n = i;
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      bindProgram(pShow);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uShowTex, 0);
      gl.uniform1f(uShowPost, hasFloat ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const want = S.lights.length > 0;
      if (want || ovLive) {
        drawOverlay();
        ovLive = want;
      }
      drawHud();
    }

    /* --------------------------------------------------------------- input */

    function pos(e: PointerEvent): [number, number] {
      const r = glc.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }

    let lastTap = 0;
    let lastTapI = -1;

    function onDown(e: PointerEvent) {
      const [x, y] = pos(e);
      S.lastInput = performance.now();
      root?.focus({ preventScroll: true });
      if (glc.setPointerCapture) glc.setPointerCapture(e.pointerId);

      const h = hit(x, y);

      // double-tap a lamp to strike it
      if (h && h.mode === "move") {
        const now = performance.now();
        if (now - lastTap < 340 && lastTapI === h.i) {
          S.lights.splice(h.i as number, 1);
          S.sel = -1;
          lastTapI = -1;
          S.drag = null;
          restart();
          e.preventDefault();
          return;
        }
        lastTap = now;
        lastTapI = h.i as number;
      }

      if (h && (h.mode === "glass" || h.mode === "spin")) {
        S.drag = h;
      } else if (h) {
        S.sel = h.i as number;
        S.drag = h;
      } else {
        // empty surface: lay a new lamp down and let the drag aim it
        const cap = Math.max(
          1,
          Math.min(MAXL, Math.round(live.current.maxLamps)),
        );
        if (S.lights.length >= cap) S.lights.shift();
        const toward = Math.atan2(S.vh * 0.5 - y, S.vw * 0.5 - x);
        const tint = NEW_LAMP_TINTS[S.lights.length % 4];
        S.lights.push(mkLight(x, y, toward, 0.2, 4.5, 1.0, tint));
        S.sel = S.lights.length - 1;
        S.drag = { mode: "aim", i: S.sel };
        lastTapI = -1;
      }
      restart();
      e.preventDefault();
    }

    function onMove(e: PointerEvent) {
      if (!S.drag) return;
      const [x, y] = pos(e);
      S.lastInput = performance.now();

      if (S.drag.mode === "glass") {
        S.prism.x = x - (S.drag.ox as number);
        S.prism.y = y - (S.drag.oy as number);
        restart();
        e.preventDefault();
        return;
      }
      if (S.drag.mode === "spin") {
        S.prism.rot = Math.atan2(y - S.prism.y, x - S.prism.x) - Math.PI / 2;
        restart();
        e.preventDefault();
        return;
      }

      const L = S.lights[S.drag.i as number];
      if (!L) {
        S.drag = null;
        return;
      }

      if (S.drag.mode === "move") {
        L.x = x - (S.drag.ox as number);
        L.y = y - (S.drag.oy as number);
      } else if (S.drag.mode === "aim") {
        const dx = x - L.x;
        const dy = y - L.y;
        const len = Math.hypot(dx, dy);
        if (len > 6) {
          L.aim = Math.atan2(dy, dx);
          // pull further to throw further and harder
          const k = Math.min(len / (S.unit * 0.55), 1.9);
          L.throwR = 0.42 + k * 0.75;
          L.inten = 1.6 + k * 5.4;
        }
      } else if (S.drag.mode === "spread") {
        const ang = Math.atan2(y - L.y, x - L.x);
        const dd = Math.abs(
          ((ang - L.aim + Math.PI * 3) % (Math.PI * 2)) - Math.PI,
        );
        L.spread = Math.min(0.85, Math.max(0.03, dd));
      }
      restart();
      e.preventDefault();
    }

    function onUp() {
      S.drag = null;
    }

    function noDbl(e: Event) {
      e.preventDefault();
    }

    glc.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    glc.addEventListener("dblclick", noDbl);

    // The instrument owns its own box, so it watches that box rather than the
    // window: dropped into a bounded stage it fills the stage, and full-screen
    // it fills the screen, with no branch between the two.
    const ro = new ResizeObserver(() => resize());
    ro.observe(root);

    /* --- typing ---------------------------------------------------------- */

    // Keyboard is scoped to the component, not the window: a registry page has
    // other things on it that also want the keys. Clicking the surface (which
    // you do anyway, to place a lamp) hands focus over.
    function setTyping(on: boolean) {
      S.typing = on;
    }

    function type(e: ReactKeyboardEvent) {
      if (!live.current.allowTyping) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      S.lastInput = performance.now();

      if (e.key === "Escape") {
        S.text = "";
        S.typing = false;
        renderPlate();
        e.preventDefault();
        return;
      }
      if (e.key === "Backspace") {
        S.text = S.text.slice(0, -1);
        S.typing = true;
        renderPlate();
        e.preventDefault();
        return;
      }
      if (e.key === "Enter") {
        if (S.text.split("\n").length < 5) S.text += "\n";
        S.typing = true;
        renderPlate();
        e.preventDefault();
        return;
      }
      if (e.key.length === 1) {
        if (S.text.length < 90) S.text += e.key;
        S.typing = true;
        renderPlate();
        e.preventDefault();
      }
    }

    const blink = window.setInterval(() => {
      if (S.typing) caretOn = !caretOn;
    }, 530);

    // the caret is only there to say "your keystrokes land here". once you stop
    // it has nothing left to say, so it goes early and leaves the light alone
    const idle = window.setInterval(() => {
      if (S.typing && performance.now() - S.lastInput > 3000) setTyping(false);
    }, 250);

    api.current = {
      type,
      setText: (t: string) => {
        if (t === S.text) return;
        S.text = t;
        renderPlate();
      },
      setRelief: (r: boolean, d: number) => {
        if (r === S.ramp && d === S.rampD) return;
        S.ramp = r;
        S.rampD = d;
        bakeNormals();
        restart();
      },
      // Position and rotation are the pointer's to own once the glass is on the
      // surface, so only the optical dials are driven from props.
      setPrism: (p) => {
        if (!p) return;
        let changed = false;
        for (const k of ["on", "disp", "gain", "len", "blur"] as const) {
          const v = p[k];
          if (v !== undefined && v !== S.prism[k]) {
            (S.prism as Record<string, unknown>)[k] = v;
            changed = true;
          }
        }
        if (changed) restart();
      },
      restart,
    };

    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.clearInterval(blink);
      window.clearInterval(idle);
      ro.disconnect();
      glc.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      glc.removeEventListener("dblclick", noDbl);
      api.current = null;

      for (const p of [pNorm, pComp, pLamp, pRays, pShow]) gl.deleteProgram(p);
      for (const t of [tex, normTex, causTex, plateTex])
        if (t) gl.deleteTexture(t);
      for (const f of [fbo, normFbo, causFbo]) if (f) gl.deleteFramebuffer(f);
      if (vao) gl.deleteVertexArray(vao);
      // Deliberately NOT WEBGL_lose_context: the canvas element outlives a
      // remount, and getContext would hand the same dead context back on the
      // next mount, where every call fails silently. Releasing the objects is
      // enough; the driver reclaims the context with the node.
    };
    // Mount-once: every prop the engine cares about is read live through
    // `live`, and the ones that must be pushed in have their own effects below.
  }, []);

  // Prop-driven changes are pushed into the running engine rather than
  // rebuilding it, so a studio slider never drops the WebGL context.
  useEffect(() => {
    api.current?.setText(text);
  }, [text]);
  useEffect(() => {
    api.current?.setRelief(ramp, rampDepth);
  }, [ramp, rampDepth]);
  useEffect(() => {
    api.current?.setPrism(prism);
  }, [prism?.on, prism?.disp, prism?.gain, prism?.len, prism?.blur]);

  useEffect(() => {
    if (autoFocus) rootRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  return (
    <div
      ref={rootRef}
      className={`pli-root${className ? ` ${className}` : ""}`}
      style={style}
      // A canvas instrument: focusable so it can take the keys that emboss the
      // surface, and announced as an application rather than a static region.
      role="application"
      aria-label="Lighting instrument: place and aim lamps, type to emboss the surface"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the surface is typed into, so it has to be reachable and hold focus.
      tabIndex={0}
      onKeyDown={(e) => api.current?.type(e)}
    >
      <style>{styles}</style>
      <canvas ref={glRef} className="pli-gl" />
      <canvas ref={ovRef} className="pli-ov" />

      {mark ? <div className="pli-mark">{mark}</div> : null}

      {showLegend ? (
        <div ref={keysRef} className="pli-keys">
          {legendRows(legend).map((row) => (
            <div key={row.map((e) => e.key).join("/")}>
              {row.map((entry, j) => (
                <span key={entry.key}>
                  {j > 0 ? "  " : null}
                  <b>{entry.key}</b> {entry.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <p className="pli-unsupported">WebGL2 required.</p>
    </div>
  );
}

const styles = `
.pli-root{
  position:relative;
  width:100%;
  height:100%;
  min-height:320px;
  background:#000;
  color:#e8e8e6;
  overflow:hidden;
  cursor:crosshair;
  touch-action:none;
  overscroll-behavior:none;
  outline:none;
  -webkit-font-smoothing:antialiased;
  -webkit-tap-highlight-color:transparent;

  --pli-pad: clamp(16px, 4.2vw, 34px);
  --pli-mono: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Monaco, "Courier New", monospace;
  --pli-dim: #6e6e6b;
}

.pli-root canvas{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  display:block;
}

/* the gizmo layer sits on top of the render, so it must not eat the pointer */
.pli-root .pli-ov{ pointer-events:none }

/* a signature, not a label: present, and not asking for anything */
.pli-root .pli-mark{
  position:absolute; z-index:4; pointer-events:none;
  left:var(--pli-pad);
  bottom: calc(var(--pli-pad) + env(safe-area-inset-bottom));
  font-family:var(--pli-mono);
  font-size:clamp(9px, 2.2vw, 10.5px);
  letter-spacing:.20em;
  color:#5c5c59;
  user-select:none;
}

.pli-root .pli-keys{
  position:absolute; z-index:4; pointer-events:none;
  right:var(--pli-pad);
  bottom: calc(var(--pli-pad) + env(safe-area-inset-bottom));
  font-family:var(--pli-mono);
  font-size:clamp(8.5px, 2.1vw, 10.5px);
  letter-spacing:.12em;
  line-height:2.05;
  text-align:right;
  color:var(--pli-dim);
  transition:opacity .6s ease;
  white-space:nowrap;
}
.pli-root .pli-keys b{ color:#a9a8a4; font-weight:400 }
.pli-root .pli-keys.pli-rest{ opacity:0 }

/* on a narrow screen the legend would land on top of the readout, and the
   affordances are discoverable enough by touch without it */
@media (max-width: 920px){
  .pli-root .pli-keys{ display:none }
}

.pli-root .pli-unsupported{ display:none }
.pli-root[data-unsupported="true"] canvas,
.pli-root[data-unsupported="true"] .pli-mark,
.pli-root[data-unsupported="true"] .pli-keys{ display:none }
.pli-root[data-unsupported="true"] .pli-unsupported{
  display:block;
  margin:0;
  padding:2rem;
  color:#888;
  font:14px var(--pli-mono);
}
`;

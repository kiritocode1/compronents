import { DRIFT_PERIOD_MAX, DRIFT_PERIOD_MIN } from "./tokens";

const f = (v: number) => v.toFixed(4);

/**
 * GLSL twin of motion.ts. seeds(), flightEase(), throwAmount(), throwDir(),
 * driftAt() and project() must stay in step with their TypeScript versions.
 */
const MODEL = `
const float TAU = 6.2831853;
const float FIT = 0.655;

vec3 seeds(float s) {
  return vec3(fract(s * 91.7 + 0.13), fract(s * 47.3 + 0.71), fract(s * 23.9 + 0.37));
}

float cubicInOut(float u) {
  return u < 0.5 ? 4.0 * u * u * u : 1.0 - pow(-2.0 * u + 2.0, 3.0) / 2.0;
}

float flightEase(float p, float s0, float z, float swarm, float hang) {
  if (p >= 1.0) return 1.0;
  float order = swarm > 0.5 ? s0 : smoothstep(-0.45, 0.45, -z) * 0.75 + s0 * 0.25;
  float width = swarm > 0.5 ? 0.45 : 0.55;
  float start = hang + order * (1.0 - width - hang);
  return cubicInOut(clamp((p - start) / width, 0.0, 1.0));
}

float throwAmount(float p, float e, float sharp, float s1) {
  if (p >= 1.0) return 0.0;
  float open = 1.0 - pow(1.0 - min(1.0, p * sharp / 4.0), 3.0);
  return open * (1.0 - e) * (0.08 + 0.52 * s1);
}

vec3 throwDir(vec2 q, float s0) {
  float a = atan(q.y, q.x) + (s0 - 0.5) * 1.2;
  return normalize(vec3(cos(a), sin(a), 0.6));
}

// xyz offset, w alpha; away goes out through the last argument
vec4 driftAt(vec2 p, float time, vec3 s, float drift, float angle, float offset, float side, out float away) {
  away = 0.0;
  float nx = -sin(angle);
  float ny = cos(angle);
  vec2 w = vec2(nx, ny) * side;
  if (drift <= 0.003) return vec4(0.0, 0.0, 0.0, 1.0);
  float along = -p.x * ny + p.y * nx;
  float edge = 0.12 * sin(along * 2.2 + 0.7 * sin(along * 5.0 + 1.0) + time * 0.2)
    + (s.z - 0.5) * 0.2;
  float past = (p.x * nx + p.y * ny - offset) * side + edge;
  float depthIn = clamp(past / 0.8, 0.0, 1.0);
  float exposure = depthIn * depthIn * (3.0 - 2.0 * depthIn);
  float period = ${f(DRIFT_PERIOD_MIN)} + ${f(DRIFT_PERIOD_MAX - DRIFT_PERIOD_MIN)} * s.y;
  float cyc = fract(time / period + s.z);
  float windowShare = 0.15 + 0.72 * exposure;
  float u = clamp((cyc - (1.0 - windowShare)) / windowShare, 0.0, 1.0);
  float dist = drift * exposure * (0.5 + s.x) * 1.5 * u * sqrt(u);
  vec3 d = vec3(
    w.x * dist + sin(p.y * 2.9 + time * 0.5 + s.y * TAU) * dist * 0.22,
    w.y * dist + cos(p.x * 3.1 - time * 0.4 + s.z * TAU) * dist * 0.22,
    (s.x - 0.5) * dist * 0.5
  );
  float thin = 1.0 - smoothstep(0.25, 1.0, u);
  float form = exposure > 0.05 ? smoothstep(0.0, 0.04, cyc) : 1.0;
  away = u * exposure;
  return vec4(d, thin * form);
}

// clip-space position with w = 1; persp out
vec4 project(vec3 q, float yaw, float pitch, float zoom, float aspect, out float persp) {
  float cy = cos(yaw), sy = sin(yaw), cx = cos(pitch), sx = sin(pitch);
  float x1 = q.x * cy + q.z * sy;
  float z1 = -q.x * sy + q.z * cy;
  float y2 = q.y * cx - z1 * sx;
  float z2 = q.y * sx + z1 * cx;
  persp = 1.0 / (2.35 - z2);
  return vec4(vec2(x1 / aspect, y2) * zoom * persp * 1.65, 0.0, 1.0);
}
`;

const COMMON_UNIFORMS = `
uniform float uP, uSwarm, uHang, uSharp;
uniform float uTime, uDrift, uLineAngle, uLineOffset, uFadeSide, uDepth;
uniform float uYaw, uPitch, uZoom;
uniform vec2 uResolution;
uniform float uPointSize;
uniform vec4 uLamp[3];   // world xyz, strength
uniform vec4 uWake[6];   // ndc xy, push xy in ndc
`;

/** World position at a given time, before projection. */
const PLACE = `
vec3 place(float time, out float alpha, out float away, out vec3 s) {
  s = seeds(aSeed);
  float e = flightEase(uP, s.x, (aHome.z + aDest.z) * 0.5, uSwarm, uHang);
  vec3 q = mix(aHome, aDest, e);
  float thrown = throwAmount(uP, e, uSharp, s.y);
  if (thrown > 0.0) q += throwDir(q.xy, s.x) * thrown;
  float b = sin(time * TAU / 7.0);
  q.xy *= 1.0 + 0.008 * b;
  q.z = q.z * (0.1 + uDepth * 1.3) * (1.0 + 0.05 * b);
  vec4 d = driftAt(q.xy, time, s, uDrift, uLineAngle, uLineOffset, uFadeSide, away);
  alpha = d.w;
  return (q + d.xyz) * FIT;
}

// The pointer's recent path pushes points along the way it was moving.
vec2 wake(vec2 ndc, float s1) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 push = vec2(0.0);
  for (int k = 0; k < 6; k++) {
    vec2 d = (ndc - uWake[k].xy) * vec2(aspect, 1.0);
    float fall = 1.0 / (1.0 + dot(d, d) * 90.0);
    push += uWake[k].zw * fall * fall * (0.6 + 0.8 * s1);
  }
  return push;
}

// Lamps sit in the cloud; a point takes light by its distance to each.
float lampAt(vec3 q) {
  float lit = 0.0;
  for (int k = 0; k < 3; k++) {
    vec3 d = q - uLamp[k].xyz;
    lit += uLamp[k].w * exp(-dot(d, d) * 9.0);
  }
  return lit;
}
`;

const ATTRIBUTES = `
layout(location = 0) in vec3 aHome;
layout(location = 1) in vec3 aDest;
layout(location = 2) in vec3 aHomeColor;
layout(location = 3) in vec3 aDestColor;
layout(location = 4) in float aSeed;
`;

const VARYINGS_OUT = `
out vec3 vColor;
out float vAlpha;
out float vLit;
out float vZ;
`;

export const POINT_VERT = `#version 300 es
precision highp float;
${ATTRIBUTES}
${COMMON_UNIFORMS}
${MODEL}
${PLACE}
${VARYINGS_OUT}
void main() {
  float alpha, away; vec3 s;
  vec3 q = place(uTime, alpha, away, s);
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float persp;
  vec4 clip = project(q, uYaw, uPitch, uZoom, aspect, persp);
  clip.xy += wake(clip.xy, s.y);
  float lit = lampAt(q);
  float size = uPointSize * persp * 2.35 * uZoom * (0.75 + 0.5 * s.z)
    * (1.0 - 0.3 * away) * (1.0 + 0.5 * min(1.0, lit));
  gl_PointSize = max(size, 1.0);
  gl_Position = clip;
  float e = flightEase(uP, s.x, (aHome.z + aDest.z) * 0.5, uSwarm, uHang);
  vColor = mix(aHomeColor, aDestColor, e);
  // a point smaller than a pixel dims instead of popping
  vAlpha = alpha * clamp(size, 0.2, 1.0);
  vLit = lit;
  vZ = q.z;
}
`;

/** Streaks: one instance per leaving point, a line from now back uTail seconds. */
export const TRAIL_VERT = `#version 300 es
precision highp float;
${ATTRIBUTES}
${COMMON_UNIFORMS}
uniform float uTail;
${MODEL}
${PLACE}
${VARYINGS_OUT}
void main() {
  float back = gl_VertexID == 1 ? 1.0 : 0.0;
  float alpha, away; vec3 s;
  vec3 q = place(uTime - back * uTail, alpha, away, s);
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float persp;
  gl_Position = project(q, uYaw, uPitch, uZoom, aspect, persp);
  float e = flightEase(uP, s.x, (aHome.z + aDest.z) * 0.5, uSwarm, uHang);
  vColor = mix(aHomeColor, aDestColor, e);
  vAlpha = step(0.004, away) * alpha * (1.0 - back) * 0.7;
  vLit = 0.0;
  vZ = q.z;
}
`;

export const POINT_FRAG = `#version 300 es
precision highp float;

in vec3 vColor;
in float vAlpha;
in float vLit;
in float vZ;

uniform float uPaper;     // 1 white paper
uniform float uTrue;      // 1 True tone on white paper
uniform float uFade;      // paper flip dip
uniform float uGain;      // light per point for the current density
uniform float uLine;      // 1 when drawing trails
uniform vec3 uLightColor;
uniform float uScan;
uniform float uScanZ;

out vec4 o;

void main() {
  float a = 1.0;
  if (uLine < 0.5) {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    a = 1.0 - r * r;
  }
  a *= vAlpha * uFade * uGain;
  float lit = min(1.5, vLit);
  float band = uScan * (1.0 - smoothstep(0.0, 0.03, abs(vZ - uScanZ)));
  vec3 col = vColor;
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));

  if (uPaper > 0.5) {
    // Paper: each point takes light away. A lamp lifts the ink near it.
    vec3 ink = uTrue < 0.5 ? col : vec3(1.0) - col;
    ink *= 1.0 - 0.7 * min(1.0, lit);
    ink += vec3(0.5) * band;
    o = vec4(min(ink * a * 1.4, vec3(1.0)), 1.0);
  } else {
    // Black: each point adds light, so dense areas glow.
    vec3 c = col + uLightColor * lit * 4.0 * (0.4 + 0.6 * luma) + vec3(0.7) * band;
    o = vec4(c * a, 1.0);
  }
}
`;

/** Soft light round each lamp, drawn under the points. */
export const GLOW_VERT = `#version 300 es
void main() {
  vec2 q = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0);
  gl_Position = vec4(q, 0.0, 1.0);
}
`;

export const GLOW_FRAG = `#version 300 es
precision highp float;

uniform vec4 uCore[3];   // ndc xy, strength, radius in ndc
uniform vec3 uLightColor;
uniform vec2 uResolution;
uniform float uPaper;

out vec4 o;

void main() {
  vec2 ndc = gl_FragCoord.xy / uResolution * 2.0 - 1.0;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float g = 0.0;
  for (int k = 0; k < 3; k++) {
    vec2 d = (ndc - uCore[k].xy) * vec2(aspect, 1.0) / max(uCore[k].w, 1e-3);
    g += uCore[k].z * pow(1.0 + dot(d, d), -1.5);
  }
  // interleaved gradient noise, so the falloff does not band
  float n = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5;
  o = uPaper > 0.5
    ? vec4(mix(vec3(1.0), uLightColor, clamp(g * 0.35, 0.0, 0.6)) + n / 255.0, 1.0)
    : vec4(uLightColor * g * 1.6 + n / 255.0, 1.0);
}
`;

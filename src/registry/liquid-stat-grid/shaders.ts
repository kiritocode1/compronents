// Six-stage liquid gradient chain.
//
//   1 plate     flat #F5F5F5 ground, half resolution
//   2 blob      pointer-tracked colour disc, rotated and squashed, luma-displaced
//   3 warp A    five-octave domain warp, wide amplitude, strong colour fringing
//   4 blur A    noise-steered directional blur, half resolution
//   5 blur B    the same blur again at quarter resolution
//   6 warp B    a tighter, faster warp that re-curls the softened result
//
// Each stage renders into its own framebuffer at its own scale and samples the
// previous stage as uTexture. The constants are named rather than inlined so the
// effect can actually be tuned; the warp and blob stages are generated from one
// parameterised source since they differ only by numbers.

/** Fullscreen-quad vertex stage. */
export const VERTEX_SHADER = `#version 300 es
precision mediump float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
out vec2 vTextureCoord;
out vec3 vVertexPosition;
void main() {
  gl_Position = vec4(aVertexPosition, 1.0);
  vTextureCoord = aTextureCoord;
  vVertexPosition = aVertexPosition;
}`;

const COMMON = `
const float TWO_PI = 6.28318530718;
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }
float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

// value noise in 3d, used as an animated steering field
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float n000 = hash13(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash13(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash13(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash13(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash13(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash13(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash13(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash13(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
    mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y),
    u.z
  );
}
`;

/** Stage 1: the flat ground everything else is layered onto. */
export const GRADIENT_FRAG = `#version 300 es
precision highp float;
in vec2 vTextureCoord;
out vec4 fragColor;
const vec3 PLATE = vec3(0.9607843137254902);
void main() {
  fragColor = vec4(PLATE, 1.0);
}`;

/**
 * Stage 2: the colour disc.
 *
 * Its centre drifts with the pointer. The edge is a smoothstep band whose radii
 * are nudged by the luminance underneath, which gives the rim its wobble. The uv
 * is aspect-corrected, rotated, then squashed on one axis so the disc reads as a
 * leaning ellipse rather than a circle.
 */
const circleFrag = (tint: string) => `#version 300 es
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform vec2 uMousePos;
uniform vec2 uResolution;
out vec4 fragColor;
${COMMON}
const vec3  TINT        = ${tint};
const vec2  CENTRE      = vec2(0.3318482130957141, 0.43976314236210257);
const float MOUSE_PULL  = 0.38;
const float ROTATION    = 0.7398;
const float SKEW_X      = 0.41;
const float HALF_RADIUS = 0.225;   // 0.45 across, halved
const float FALLOFF     = 0.21;
const float DISPLACE    = 0.045;   // 0.09 luma influence, halved
const float STRENGTH    = 0.70;

void main() {
  vec2 uv = vTextureCoord;
  vec4 bg = texture(uTexture, uv);

  float displacement = (luma(bg.rgb) - 0.5) * DISPLACE;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 skew = vec2(max(SKEW_X, 0.001), max(1.0 - SKEW_X, 0.001));

  float innerEdge = HALF_RADIUS - FALLOFF * HALF_RADIUS * 0.5;
  float outerEdge = HALF_RADIUS + FALLOFF * HALF_RADIUS * 0.5;

  vec2 pos = CENTRE + (uMousePos - 0.5) * MOUSE_PULL;
  mat2 m = rot(ROTATION * TWO_PI);
  vec2 scaledUV  = uv  * aspect * m * skew;
  vec2 scaledPos = pos * aspect * m * skew;

  float falloff = smoothstep(
    innerEdge + displacement,
    outerEdge + displacement,
    distance(scaledUV, scaledPos)
  );
  falloff = (1.0 - falloff) * STRENGTH;

  fragColor = vec4(mix(bg.rgb, TINT, falloff), max(bg.a, falloff));
}`;

/**
 * Stages 3 and 6: domain warp with chromatic aberration.
 *
 * Five octaves, each rotating the space a further fifth of a turn and displacing
 * it along a sine of the opposite axis, so the distortion curls instead of
 * shearing. The three channels then sample at slightly different distances along
 * the warp vector, which is where the colour fringing comes from.
 */
const warpFrag = (o: {
  rotation: number;
  frequency: number;
  amplitude: number;
  chromatic: number;
  blend: number;
}) => `#version 300 es
precision mediump float;
in vec2 vTextureCoord;
uniform float uTime;
uniform sampler2D uTexture;
uniform vec2 uResolution;
out vec4 fragColor;
${COMMON}
const float ROTATION   = ${o.rotation};
const float FREQUENCY  = ${o.frequency};
const float AMPLITUDE  = ${o.amplitude};
const float CHROMATIC  = ${o.chromatic};
const float BLEND      = ${o.blend};
const float TIME_SCALE = 0.025;
const int   OCTAVES    = 5;

vec2 warp(vec2 st) {
  float aspect = uResolution.x / uResolution.y;
  vec2 centre = vec2(0.5);
  float t = uTime * TIME_SCALE;

  st -= centre;
  st.x *= aspect;
  st = st * rot(ROTATION * TWO_PI);

  for (int i = 1; i <= OCTAVES; i++) {
    float fi = float(i);
    st = st * rot(fi / float(OCTAVES) * TWO_PI);
    float f = fi * FREQUENCY;
    st.x += AMPLITUDE * cos(f * st.y + t);
    st.y += AMPLITUDE * sin(f * st.x + t);
  }

  st = st * rot(-ROTATION * TWO_PI);
  st.x /= aspect;
  st += centre;
  return st;
}

void main() {
  vec2 uv = vTextureCoord;
  vec2 warped = warp(uv);

  vec2 delta = warped - uv;
  float dist = length(delta);
  vec2 dir = dist > 1e-6 ? delta / dist : vec2(0.0);

  vec2 offR = warped + CHROMATIC * dir * dist;
  vec2 offB = warped - CHROMATIC * dir * dist;

  vec4 cR = texture(uTexture, mix(uv, offR,   BLEND));
  vec4 cG = texture(uTexture, mix(uv, warped, BLEND));
  vec4 cB = texture(uTexture, mix(uv, offB,   BLEND));

  fragColor = vec4(cR.r, cG.g, cB.b, cR.a * cG.a * cB.a);
}`;

/**
 * Stages 4 and 5: directional blur steered by a drifting noise field.
 *
 * The noise picks a smear direction per pixel; 32 taps are then walked along
 * that direction and averaged. Because the direction varies smoothly, the result
 * softens the disc into a cloud without the ringing a fixed-offset blur leaves.
 */
const noiseBlurFrag = () => `#version 300 es
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;
out vec4 fragColor;
${COMMON}
const float FIELD_ROTATION = 0.2538;
const float FIELD_SQUASH   = 0.54;
const float FIELD_SCALE    = 4.12;   // 5.0 * 0.824
const float SMEAR          = 0.1475; // (0.58 + 0.01) * 0.25
const int   TAPS           = 32;

void main() {
  vec2 uv = vTextureCoord;
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUv = uv * vec2(aspect, 1.0) - vec2(0.5) * vec2(aspect, 1.0);

  vec2 fieldUv = rot(-FIELD_ROTATION * TWO_PI) * aspectUv
               * vec2(FIELD_SQUASH, 1.0 - FIELD_SQUASH) * FIELD_SCALE;

  float t = uTime * 0.025;
  // two offset samples give a smoothly varying direction rather than a scalar
  vec2 field = vec2(
    vnoise(vec3(fieldUv, t)),
    vnoise(vec3(fieldUv + 144.5, t))
  );
  vec2 smear = (field - 0.5) * SMEAR;

  vec4 sum = vec4(0.0);
  for (int i = 0; i < TAPS; i++) {
    float offset = float(i) - float(TAPS) * 0.5;
    sum += texture(uTexture, uv + smear * (offset / float(TAPS)));
  }
  fragColor = sum / float(TAPS);
}`;

/** Warp A: wide, slow, heavy fringing. */
export const LIQUIFY_FRAG = warpFrag({
  rotation: 0.3915,
  frequency: 3.9, // 5.0 * (0.68 + 0.1)
  amplitude: 0.133281, // 0.61 * mix(0.2, 0.2 / 0.73, 0.25)
  chromatic: 0.235, // 0.47, halved
  blend: 0.5,
});

/** Warp B: tighter, ~3x faster, barely any fringing. */
export const LIQUIFY_2_FRAG = warpFrag({
  rotation: 0.6021,
  frequency: 4.1, // 5.0 * (0.72 + 0.1)
  amplitude: 0.036539, // 0.17 * mix(0.2, 0.2 / 0.77, 0.25)
  chromatic: 0.005, // 0.01, halved
  blend: 0.16,
});

export const NOISE_BLUR_PASS_1 = noiseBlurFrag();
export const NOISE_BLUR_PASS_2 = NOISE_BLUR_PASS_1;

/** Disc tint per cell. Every other parameter is shared. */
export const CIRCLE_FRAG = {
  blue: circleFrag("vec3(0.0, 0.5058823529411764, 0.9686274509803922)"),
  pink: circleFrag("vec3(0.9607843137254902, 0.0, 0.19607843137254902)"),
  green: circleFrag(
    "vec3(0.4823529411764706, 0.7098039215686275, 0.023529411764705882)",
  ),
} as const;

export type LiquidVariant = keyof typeof CIRCLE_FRAG;

/** Per-stage time multiplier and framebuffer scale. */
export const LAYERS = [
  {
    id: "plate",
    frag: GRADIENT_FRAG,
    speed: 0.25,
    downSample: 0.5,
    background: true,
  },
  { id: "blob", frag: null, speed: 0, downSample: 1, background: false },
  {
    id: "warpA",
    frag: LIQUIFY_FRAG,
    speed: 0.25,
    downSample: 1,
    background: false,
  },
  {
    id: "blurA",
    frag: NOISE_BLUR_PASS_1,
    speed: 0.16,
    downSample: 0.5,
    background: false,
  },
  {
    id: "blurB",
    frag: NOISE_BLUR_PASS_2,
    speed: 0.16,
    downSample: 0.25,
    background: false,
  },
  {
    id: "warpB",
    frag: LIQUIFY_2_FRAG,
    speed: 0.77,
    downSample: 1,
    background: false,
  },
] as const;

/** Pointer tracking on the blob stage. */
export const CIRCLE_TRACK_MOUSE = 0.38;
export const CIRCLE_MOUSE_MOMENTUM = 0.29;

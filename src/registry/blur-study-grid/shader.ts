function unrolledSamples(count: number) {
  let out = "";
  for (let index = 0; index < count; index += 1) {
    out += `
  {
    let jittered = ${index}.0 + 0.5 + noise * params.ditherStrength;
    let sampleZ = halfDepth - stepDepth * jittered;
    let distanceBehindPane = max(params.paneZ - input.center.z - sampleZ, 0.0);
    let ramp = pow(
      clamp(distanceBehindPane / max(params.blurDistance, 0.001), 0.0, 1.0),
      params.blurCurve,
    );
    let width = 0.004 + ramp * params.blur;
    let distance = max(
      capsuleSdf(vec3f(input.localPosition, sampleZ), input.axis, params.rodRadius),
      0.0,
    );
    let gaussian = exp(-0.5 * pow(distance / width, 2.0));
    let opacity = 0.96 * exp(-ramp * params.opacityFalloff);
    let absorption = 1.0 - exp(-(gaussian * stepDepth * params.volumeDensity));
    let contribution = transmittance * absorption;
    alpha += contribution * opacity;
    transmittance *= 1.0 - absorption;
  }`;
  }
  return out;
}

export const BLUR_STUDY_SHADER = /* wgsl */ `
struct StudyParams {
  halfView: vec2f,
  fullSize: vec2f,
  tileOffset: vec2f,
  tileSize: vec2f,
  blur: f32,
  blurCurve: f32,
  blurDistance: f32,
  ditherStrength: f32,
  paneZ: f32,
  volumeDensity: f32,
  opacityFalloff: f32,
  rodRadius: f32,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) localPosition: vec2f,
  @location(1) @interpolate(flat) center: vec3f,
  @location(2) @interpolate(flat) axis: vec3f,
  @location(3) @interpolate(flat) proxySize: vec2f,
}

@group(0) @binding(0) var<uniform> params: StudyParams;

@vertex
fn vertex_main(
  @location(0) corner: vec2f,
  @location(1) center: vec3f,
  @location(2) axis: vec3f,
  @location(3) proxySize: vec2f,
) -> VertexOutput {
  let localPosition = corner * proxySize;
  let worldPosition = center.xy + localPosition;
  let fullClip = worldPosition / params.halfView;
  let fullPixel = vec2f(
    (fullClip.x * 0.5 + 0.5) * params.fullSize.x,
    (0.5 - fullClip.y * 0.5) * params.fullSize.y,
  );
  let tileUv = (fullPixel - params.tileOffset) / params.tileSize;

  var output: VertexOutput;
  output.position = vec4f(tileUv.x * 2.0 - 1.0, 1.0 - tileUv.y * 2.0, 0.0, 1.0);
  output.localPosition = localPosition;
  output.center = center;
  output.axis = axis;
  output.proxySize = proxySize;
  return output;
}

fn interleavedGradientNoise(position: vec2f) -> f32 {
  return fract(52.9829189 * fract(dot(position, vec2f(0.06711056, 0.00583715))));
}

fn capsuleSdf(point: vec3f, axis: vec3f, radius: f32) -> f32 {
  let start = -axis;
  let segment = axis - start;
  let relative = point - start;
  let along = clamp(dot(relative, segment) / max(dot(segment, segment), 0.000001), 0.0, 1.0);
  return length(relative - segment * along) - radius;
}

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
  let noise = interleavedGradientNoise(input.position.xy + params.tileOffset) - 0.5;
  let maximumWidth = 0.004 + params.blur;
  let halfDepth = abs(input.axis.z) + params.rodRadius + maximumWidth * 3.0;
  let stepDepth = halfDepth * (2.0 / 96.0);
  // Projecting onto the pane is 1-Lipschitz, so the planar distance to the
  // capsule is a lower bound on the 3D distance at every sample. Past 3.5
  // widths the widest gaussian is exp(-6.125), which cannot reach one 255th
  // of an alpha step, so those fragments carry dither only. The proxy quad
  // already clips each axis at 3 widths; this trims its corners.
  let planarAxis = input.axis.xy * 2.0;
  let planarRelative = input.localPosition + input.axis.xy;
  let planarAlong = clamp(
    dot(planarRelative, planarAxis) / max(dot(planarAxis, planarAxis), 0.000001),
    0.0,
    1.0,
  );
  let planar =
    length(planarRelative - planarAxis * planarAlong) - params.rodRadius;
  if (planar > maximumWidth * 3.5) {
    return vec4f(
      vec3f(0.008),
      clamp(noise * params.ditherStrength / 255.0, 0.0, 0.96),
    );
  }

  var alpha = 0.0;
  var transmittance = 1.0;

${unrolledSamples(96)}

  let dither = noise * params.ditherStrength / 255.0;
  return vec4f(vec3f(0.008), clamp(alpha + dither, 0.0, 0.96));
}
`;

export const BLIT_SHADER = /* wgsl */ `
@group(0) @binding(0) var studyTexture: texture_2d<f32>;

fn linearToSrgb(value: f32) -> f32 {
  if (value <= 0.0031308) {
    return value * 12.92;
  }
  return pow(value, 0.41666) * 1.055 - 0.055;
}

@fragment
fn fragment_main(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let linear = textureLoad(studyTexture, vec2i(position.xy), 0);
  return vec4f(
    linearToSrgb(linear.r),
    linearToSrgb(linear.g),
    linearToSrgb(linear.b),
    linear.a,
  );
}
`;

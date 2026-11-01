// GENERATED from the watercolor.bizar.ro bundle (index-2ZPewFcs.js).
// Do not edit by hand. Every module below concatenates back to the original
// WGSL byte for byte; the shared prelude and the brush and wash helpers are
// factored out only to avoid shipping them ten times.

const PRELUDE = `struct Frame {
  paint: vec4f,
  flow: vec4f,
  time: vec4f,
  brushStart: vec4f,
  brushEnd: vec4f,
  brushColor: vec4f,
  brushVelocity: vec4f,
  spread: vec4f,
  settle: vec4f,
  dry: vec4f,
  motion: vec4f,
  paper: vec4f,
  light: vec4f,
  look: vec4f,
  grade: vec4f,
  wipe: vec4f,
}

@group(0) @binding(0) var<uniform> frame: Frame;
@group(0) @binding(1) var bilinear: sampler;
@group(0) @binding(2) var nearest: sampler;

fn paintSize() -> vec2i {
  return vec2i(frame.paint.xy);
}

fn flowSize() -> vec2i {
  return vec2i(frame.flow.xy);
}

fn clampPaint(cell: vec2i) -> vec2i {
  return clamp(cell, vec2i(0), paintSize() - 1);
}

fn clampFlow(cell: vec2i) -> vec2i {
  return clamp(cell, vec2i(0), flowSize() - 1);
}

fn hash(cell: vec2u, seed: u32) -> f32 {
  var value = (cell.x * 1597334677u) ^ (cell.y * 3812015801u) ^ (seed * 2654435769u);
  value = (value ^ (value >> 16u)) * 2246822519u;
  value = (value ^ (value >> 13u)) * 3266489917u;
  value = value ^ (value >> 16u);

  return f32(value) / 4294967295.0;
}

fn valueNoise(position: vec2f, seed: u32) -> f32 {
  let base = floor(position);
  let fraction = position - base;
  let blend = fraction * fraction * (3.0 - 2.0 * fraction);
  let cell = vec2u(vec2i(base) + 65536);
  let bottom = mix(hash(cell, seed), hash(cell + vec2u(1u, 0u), seed), blend.x);
  let top = mix(hash(cell + vec2u(0u, 1u), seed), hash(cell + vec2u(1u, 1u), seed), blend.x);

  return mix(bottom, top, blend.y);
}

fn fbm(position: vec2f, seed: u32, octaves: u32) -> f32 {
  var amplitude = 0.5;
  var frequency = 1.0;
  var sum = 0.0;
  var total = 0.0;

  for (var octave = 0u; octave < octaves; octave++) {
    sum += valueNoise(position * frequency, seed + octave * 31u) * amplitude;
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2.07;
  }

  return sum / total;
}

`;

const BRUSH = `fn capsuleDistance(position: vec2f) -> f32 {
  let start = frame.brushStart.xy;
  let segment = frame.brushEnd.xy - start;
  let along = clamp(dot(position - start, segment) / max(dot(segment, segment), 1e-6), 0.0, 1.0);

  return length(position - (start + segment * along));
}

fn brushFalloff(position: vec2f, ragged: f32, splay: f32) -> f32 {
  let radius = frame.brushStart.z * (0.55 + 0.9 * splay) * (0.85 + 0.3 * ragged);

  return 1.0 - smoothstep(radius * 0.78, radius, capsuleDistance(position));
}
`;

const WIPE = `fn wipeDistance(position: vec2f) -> f32 {
  let radius = frame.wipe.z;
  let offset = position - frame.wipe.xy;
  let wobble = fbm(position * 0.006 + 3.0, 53u, 4u) - 0.5;
  let ragged = fbm(position * 0.03, 59u, 3u) - 0.5;

  return length(offset) + (wobble * 0.22 + ragged * 0.05) * radius;
}

fn wipeMask(position: vec2f) -> f32 {
  let radius = frame.wipe.z;

  if (radius <= 0.0) {
    return 0.0;
  }
`;

export const RENDER = `${PRELUDE}struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex
fn vs(@builtin(vertex_index) index: u32) -> VertexOutput {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  var out: VertexOutput;
  out.position = vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
  out.uv = vec2f(corner.x, 1.0 - corner.y);
  return out;
}

${WIPE}
  return 1.0 - smoothstep(radius * (1.0 - frame.wipe.w), radius, wipeDistance(position));
}


@group(1) @binding(0) var carried: texture_2d<f32>;
@group(1) @binding(1) var deposit: texture_2d<f32>;
@group(1) @binding(2) var paper: texture_2d<f32>;

fn reflectance(ratio: vec3f) -> vec3f {
  return 1.0 + ratio - sqrt(ratio * ratio + 2.0 * ratio);
}

fn toSrgb(color: vec3f) -> vec3f {
  let low = color * 12.92;
  let high = 1.055 * pow(color, vec3f(1.0 / 2.4)) - 0.055;

  return select(high, low, color <= vec3f(0.0031308));
}

@fragment
fn fs(in: VertexOutput) -> @location(0) vec4f {
  let uv = in.uv;
  let texel = frame.paint.zw;
  let sheet = textureSampleLevel(paper, bilinear, uv, 0.0);
  let left = textureSampleLevel(paper, bilinear, uv - vec2f(texel.x, 0.0), 0.0).r;
  let right = textureSampleLevel(paper, bilinear, uv + vec2f(texel.x, 0.0), 0.0).r;
  let down = textureSampleLevel(paper, bilinear, uv - vec2f(0.0, texel.y), 0.0).r;
  let up = textureSampleLevel(paper, bilinear, uv + vec2f(0.0, texel.y), 0.0).r;
  let normal = normalize(vec3f((left - right) * 3.0, (up - down) * 3.0, 1.0));
  let lightDirection = frame.light.xyz;
  let shading = mix(1.0, clamp(dot(normal, lightDirection) / max(lightDirection.z, 0.2), 0.6, 1.25), frame.look.y);
  let floating = textureSampleLevel(carried, bilinear, uv, 0.0);
  let settled = textureSampleLevel(deposit, bilinear, uv, 0.0);
  let granules = 1.0 + frame.look.x * (0.5 - sheet.r) * 2.0;
  let mottle = 1.0 + frame.grade.w * (sheet.b - 0.5) * 2.0;
  let ratio = settled.rgb * granules * mottle + floating.rgb * mix(1.0, granules, 0.4);
  var color = frame.paper.rgb * reflectance(max(ratio, vec3f(0.0))) * shading;
  let wet = smoothstep(0.02, 0.6, floating.a);
  let waterLeft = textureSampleLevel(carried, bilinear, uv - vec2f(texel.x * 2.0, 0.0), 0.0).a;
  let waterRight = textureSampleLevel(carried, bilinear, uv + vec2f(texel.x * 2.0, 0.0), 0.0).a;
  let waterDown = textureSampleLevel(carried, bilinear, uv - vec2f(0.0, texel.y * 2.0), 0.0).a;
  let waterUp = textureSampleLevel(carried, bilinear, uv + vec2f(0.0, texel.y * 2.0), 0.0).a;
  let surface = normalize(vec3f((waterLeft - waterRight) * 1.5, (waterUp - waterDown) * 1.5, 1.0));
  let halfway = normalize(lightDirection + vec3f(0.0, 0.0, 1.0));
  let glint = pow(max(dot(surface, halfway), 0.0), 24.0) * wet * frame.look.z;

  let wetLuma = dot(color, vec3f(0.2126, 0.7152, 0.0722));
  color = mix(color, max(mix(vec3f(wetLuma), color, 1.25), vec3f(0.0)) * (1.0 - frame.look.w), wet);
  color += glint;

  if (frame.wipe.z > 0.0) {
    let radius = frame.wipe.z;
    let reach = wipeDistance(uv * frame.paint.xy) / radius;
    let front = exp(-pow((reach - 1.0) / 0.012, 2.0));
    let sheen = smoothstep(1.0 - frame.wipe.w * 1.6, 1.0, reach) * (1.0 - smoothstep(0.985, 1.0, reach));

    color = mix(color, frame.paper.rgb * 1.015, sheen * 0.55);
    color *= 1.0 - front * 0.06;
  }

  let luma = dot(color, vec3f(0.2126, 0.7152, 0.0722));
  color = max(mix(vec3f(luma), color, frame.grade.x), vec3f(0.0));

  let centered = uv * 2.0 - 1.0;
  color *= 1.0 - frame.grade.y * 0.5 * dot(centered, centered);

  let grain = (hash(vec2u(in.position.xy), u32(frame.time.z)) - 0.5) * frame.grade.z;

  return vec4f(toSrgb(clamp(color, vec3f(0.0), vec3f(1.0))) + grain, 1.0);
}
`;

export const ADVECT_PAINT = `${PRELUDE}${BRUSH}
${WIPE}
  return 1.0 - smoothstep(radius * (1.0 - frame.wipe.w), radius, wipeDistance(position));
}


@group(1) @binding(0) var velocity: texture_2d<f32>;
@group(1) @binding(1) var carried: texture_2d<f32>;
@group(1) @binding(2) var paper: texture_2d<f32>;
@group(1) @binding(3) var carriedOut: texture_storage_2d<rgba16float, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let cell = vec2i(id.xy);

  if (any(cell >= paintSize())) {
    return;
  }

  let uv = (vec2f(cell) + 0.5) * frame.paint.zw;
  let flow = textureSampleLevel(velocity, bilinear, uv, 0.0).xy * frame.time.y * frame.flow.zw;
  var next = textureSampleLevel(carried, bilinear, uv - flow, 0.0);
  let sheet = textureLoad(paper, cell, 0);
  let ragged = sheet.g;
  let position = vec2f(cell) + 0.5;
  let dryness = frame.brushEnd.w;
  let bristles = smoothstep(dryness - 0.12, dryness + 0.12, sheet.r * 0.7 + ragged * 0.3 + 0.15);
  let scale = 1.0 / max(frame.brushStart.z, 1.0);
  let splay = fbm(position * scale * 0.9, 41u, 3u);
  let load = 0.35 + 1.3 * fbm(position * scale * 1.7 + 17.0, 43u, 3u);
  let stroke = brushFalloff(position, ragged, splay) * mix(1.0, bristles, smoothstep(0.2, 0.6, dryness));

  next += vec4f(frame.brushColor.rgb * frame.brushEnd.z * load, frame.brushStart.w) * stroke;
  next *= 1.0 - wipeMask(position);
  next.a = min(next.a, 4.0);

  textureStore(carriedOut, cell, max(next, vec4f(0.0)));
}
`;

export const ADVECT_VELOCITY = `${PRELUDE}${BRUSH}

@group(1) @binding(0) var velocity: texture_2d<f32>;
@group(1) @binding(1) var curl: texture_2d<f32>;
@group(1) @binding(2) var carried: texture_2d<f32>;
@group(1) @binding(3) var velocityOut: texture_storage_2d<rgba16float, write>;

fn curlAt(cell: vec2i) -> f32 {
  return textureLoad(curl, clampFlow(cell), 0).x;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let cell = vec2i(id.xy);
  let size = flowSize();

  if (any(cell >= size)) {
    return;
  }

  let delta = frame.time.y;
  let uv = (vec2f(cell) + 0.5) * frame.flow.zw;
  let current = textureLoad(velocity, cell, 0).xy;
  var next = textureSampleLevel(velocity, bilinear, uv - current * delta * frame.flow.zw, 0.0).xy;
  let around = textureLoad(velocity, clampFlow(cell + vec2i(1, 0)), 0).xy + textureLoad(velocity, clampFlow(cell - vec2i(1, 0)), 0).xy +
    textureLoad(velocity, clampFlow(cell + vec2i(0, 1)), 0).xy + textureLoad(velocity, clampFlow(cell - vec2i(0, 1)), 0).xy;

  next = mix(next, around * 0.25, 0.3);

  let gradient = 0.5 * vec2f(
    abs(curlAt(cell + vec2i(1, 0))) - abs(curlAt(cell - vec2i(1, 0))),
    abs(curlAt(cell + vec2i(0, 1))) - abs(curlAt(cell - vec2i(0, 1))),
  );
  let normal = gradient / (length(gradient) + 1e-5);
  let omega = curlAt(cell);

  next += frame.motion.y * vec2f(normal.y, -normal.x) * omega * delta;
  next *= frame.motion.x;

  let paintPosition = uv * frame.paint.xy;
  let reach = 1.0 - smoothstep(frame.brushStart.z * 0.5, frame.brushStart.z * frame.brushVelocity.w, capsuleDistance(paintPosition));

  next = mix(next, frame.brushVelocity.xy, clamp(reach * frame.brushVelocity.z, 0.0, 1.0));

  let water = textureSampleLevel(carried, bilinear, uv, 0.0).a;

  next *= smoothstep(frame.motion.z * 0.5, frame.motion.z * 2.0, water);

  if (cell.x == 0 || cell.x == size.x - 1) {
    next.x = 0.0;
  }

  if (cell.y == 0 || cell.y == size.y - 1) {
    next.y = 0.0;
  }

  textureStore(velocityOut, cell, vec4f(next, 0.0, 1.0));
}
`;

export const CURL = `${PRELUDE}
@group(1) @binding(0) var velocity: texture_2d<f32>;
@group(1) @binding(1) var curlOut: texture_storage_2d<r32float, write>;

fn velocityAt(cell: vec2i) -> vec2f {
  return textureLoad(velocity, clampFlow(cell), 0).xy;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let cell = vec2i(id.xy);

  if (any(cell >= flowSize())) {
    return;
  }

  let curl = 0.5 * (
    velocityAt(cell + vec2i(1, 0)).y - velocityAt(cell - vec2i(1, 0)).y -
    velocityAt(cell + vec2i(0, 1)).x + velocityAt(cell - vec2i(0, 1)).x
  );

  textureStore(curlOut, cell, vec4f(curl, 0.0, 0.0, 0.0));
}
`;

export const DIVERGENCE = `${PRELUDE}
@group(1) @binding(0) var velocity: texture_2d<f32>;
@group(1) @binding(1) var pressure: texture_2d<f32>;
@group(1) @binding(2) var divergenceOut: texture_storage_2d<r32float, write>;
@group(1) @binding(3) var pressureOut: texture_storage_2d<r32float, write>;

fn velocityAt(cell: vec2i) -> vec2f {
  return textureLoad(velocity, clampFlow(cell), 0).xy;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let cell = vec2i(id.xy);

  if (any(cell >= flowSize())) {
    return;
  }

  let divergence = 0.5 * (
    velocityAt(cell + vec2i(1, 0)).x - velocityAt(cell - vec2i(1, 0)).x +
    velocityAt(cell + vec2i(0, 1)).y - velocityAt(cell - vec2i(0, 1)).y
  );

  textureStore(divergenceOut, cell, vec4f(divergence, 0.0, 0.0, 0.0));
  textureStore(pressureOut, cell, vec4f(textureLoad(pressure, cell, 0).x * frame.motion.w, 0.0, 0.0, 0.0));
}
`;

export const PAPER = `${PRELUDE}
@group(1) @binding(0) var paperOut: texture_storage_2d<rgba8unorm, write>;

fn fibre(position: vec2f, seed: u32) -> f32 {
  let angle = valueNoise(position * 0.004, seed) * 6.2831853;
  let along = vec2f(cos(angle), sin(angle));
  let stretched = vec2f(dot(position, along) * 0.06, dot(position, vec2f(-along.y, along.x)) * 0.5);

  return valueNoise(stretched, seed + 7u);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let size = textureDimensions(paperOut);

  if (any(id.xy >= size)) {
    return;
  }

  let position = vec2f(id.xy) / max(frame.time.w, 0.25);
  let tooth = fbm(position * 0.11, 3u, 3u);
  let grain = fbm(position * 0.45, 11u, 2u);
  let fibres = max(fibre(position, 19u), fibre(position * 1.7, 23u));
  let height = clamp(tooth * 0.62 + grain * 0.25 + fibres * 0.18 - 0.05, 0.0, 1.0);
  let permeability = clamp((fbm(position * 0.03, 29u, 5u) - 0.5) * 1.9 + 0.5 + (fibres - 0.5) * 0.25 + (grain - 0.5) * 0.6, 0.0, 1.0);

  let mottle = fbm(position * 0.012, 37u, 4u);

  textureStore(paperOut, id.xy, vec4f(height, permeability, mottle, 1.0));
}
`;

export const PRESSURE = `${PRELUDE}
@group(1) @binding(0) var pressure: texture_2d<f32>;
@group(1) @binding(1) var divergence: texture_2d<f32>;
@group(1) @binding(2) var pressureOut: texture_storage_2d<r32float, write>;

fn pressureAt(cell: vec2i) -> f32 {
  return textureLoad(pressure, clampFlow(cell), 0).x;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let cell = vec2i(id.xy);

  if (any(cell >= flowSize())) {
    return;
  }

  let neighbours = pressureAt(cell - vec2i(1, 0)) + pressureAt(cell + vec2i(1, 0)) +
    pressureAt(cell - vec2i(0, 1)) + pressureAt(cell + vec2i(0, 1));

  textureStore(pressureOut, cell, vec4f((neighbours - textureLoad(divergence, cell, 0).x) * 0.25, 0.0, 0.0, 0.0));
}
`;

export const PROJECT = `${PRELUDE}
@group(1) @binding(0) var velocity: texture_2d<f32>;
@group(1) @binding(1) var pressure: texture_2d<f32>;
@group(1) @binding(2) var velocityOut: texture_storage_2d<rgba16float, write>;

fn pressureAt(cell: vec2i) -> f32 {
  return textureLoad(pressure, clampFlow(cell), 0).x;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let cell = vec2i(id.xy);
  let size = flowSize();

  if (any(cell >= size)) {
    return;
  }

  let gradient = 0.5 * vec2f(
    pressureAt(cell + vec2i(1, 0)) - pressureAt(cell - vec2i(1, 0)),
    pressureAt(cell + vec2i(0, 1)) - pressureAt(cell - vec2i(0, 1)),
  );
  var next = textureLoad(velocity, cell, 0).xy - gradient;

  if (cell.x == 0 || cell.x == size.x - 1) {
    next.x = 0.0;
  }

  if (cell.y == 0 || cell.y == size.y - 1) {
    next.y = 0.0;
  }

  textureStore(velocityOut, cell, vec4f(next, 0.0, 1.0));
}
`;

export const SETTLE = `${PRELUDE}${BRUSH}
${WIPE}
  return 1.0 - smoothstep(radius * (1.0 - frame.wipe.w), radius, wipeDistance(position));
}


@group(1) @binding(0) var carried: texture_2d<f32>;
@group(1) @binding(1) var deposit: texture_2d<f32>;
@group(1) @binding(2) var paper: texture_2d<f32>;
@group(1) @binding(3) var carriedOut: texture_storage_2d<rgba16float, write>;
@group(1) @binding(4) var depositOut: texture_storage_2d<rgba16float, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let cell = vec2i(id.xy);

  if (any(cell >= paintSize())) {
    return;
  }

  let floating = textureLoad(carried, cell, 0);
  let settled = textureLoad(deposit, cell, 0);
  let height = textureLoad(paper, cell, 0).r;
  let thin = 1.0 - smoothstep(0.0, 0.3, floating.a);
  let water = max(floating.a - frame.settle.x * (1.0 + frame.dry.z * thin), 0.0);
  let isDry = water < frame.motion.z;
  let shallow = 1.0 - smoothstep(0.0, 0.4, water);
  let rate = frame.settle.y * (1.0 + frame.settle.w * (0.5 - height) * 2.0) * (1.0 + 0.8 * shallow);
  let transfer = select(floating.rgb * clamp(rate, 0.0, 1.0), floating.rgb, isDry);
  let radius = frame.brushStart.z;
  let rub = (1.0 - smoothstep(radius * 0.5, radius, capsuleDistance(vec2f(cell) + 0.5))) * frame.brushColor.w;
  let lift = settled.rgb * min(frame.settle.z * smoothstep(0.08, 0.8, water) + rub, 1.0);
  let pigment = floating.rgb - transfer + lift;
  let lifted = 1.0 - wipeMask(vec2f(cell) + 0.5);
  let laid = (settled.rgb + transfer - lift) * frame.dry.y * lifted;
  let damp = max(settled.a * frame.dry.x, smoothstep(0.0, 0.2, water)) * lifted;

  textureStore(carriedOut, cell, vec4f(max(pigment, vec3f(0.0)), select(water, 0.0, isDry)));
  textureStore(depositOut, cell, vec4f(max(laid, vec3f(0.0)), damp));
}
`;

export const SPREAD = `${PRELUDE}
@group(1) @binding(0) var carried: texture_2d<f32>;
@group(1) @binding(1) var deposit: texture_2d<f32>;
@group(1) @binding(2) var paper: texture_2d<f32>;
@group(1) @binding(3) var carriedOut: texture_storage_2d<rgba16float, write>;

const NEIGHBOURS = array<vec2i, 4>(vec2i(1, 0), vec2i(-1, 0), vec2i(0, 1), vec2i(0, -1));

fn concentration(texel: vec4f) -> vec3f {
  return select(texel.rgb / max(texel.a, 1e-3), vec3f(0.0), texel.a < 1e-3);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let cell = vec2i(id.xy);

  if (any(cell >= paintSize())) {
    return;
  }

  let here = textureLoad(carried, cell, 0);
  let hereDamp = textureLoad(deposit, cell, 0).a;
  let herePaper = textureLoad(paper, cell, 0).g;
  let threshold = frame.motion.z;
  var next = here;

  for (var index = 0; index < 4; index++) {
    let other = clampPaint(cell + NEIGHBOURS[index]);
    let there = textureLoad(carried, other, 0);
    let thereDamp = textureLoad(deposit, other, 0).a;
    let permeability = 0.5 * (herePaper + textureLoad(paper, other, 0).g);
    let isWet = min(here.a, there.a) > threshold;
    let damp = max(max(hereDamp, thereDamp), f32(isWet));
    let pinned = frame.spread.y * (0.45 + 1.1 * (1.0 - permeability));
    let isOpen = isWet || max(here.a, there.a) > pinned || damp > 0.6;
    let depth = pow(0.5 * (here.a + there.a), frame.dry.w);
    let paperFlow = mix(frame.spread.z, 1.0, damp) * (0.15 + 0.85 * permeability * permeability);
    let conductance = select(0.0, min(frame.spread.x * paperFlow * depth, 0.15), isOpen);
    let flux = conductance * (there.a - here.a);

    next.a += flux;
    next = vec4f(next.rgb + select(concentration(here), concentration(there), flux > 0.0) * flux, next.a);

    if (isWet) {
      next = vec4f(next.rgb + frame.spread.w * (there.rgb - here.rgb), next.a);
    }
  }

  textureStore(carriedOut, cell, max(next, vec4f(0.0)));
}
`;

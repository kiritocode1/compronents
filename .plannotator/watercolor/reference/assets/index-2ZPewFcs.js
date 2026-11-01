const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Controls-Dtx486q5.js","assets/Settings-DyGoQMeO.js","assets/Settings-8fN1sgGV.js"])))=>i.map(i=>d[i]);
import{t as e}from"./Settings-DyGoQMeO.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=e=>{let t=new Set;do for(let n of Reflect.ownKeys(e))t.add([e,n]);while((e=Reflect.getPrototypeOf(e))&&e!==Object.prototype);return t};function n(e,{include:n,exclude:r}={}){let i=e=>{let t=t=>typeof t==`string`?e===t:t.test(e);return n?n.some(t):!r||!r.some(t)};for(let[n,r]of t(e.constructor.prototype)){if(r===`constructor`||!i(r))continue;let t=Reflect.getOwnPropertyDescriptor(n,r);t&&typeof t.value==`function`&&(e[r]=e[r].bind(e))}return e}var r=`struct Frame {
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

struct VertexOutput {
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

fn wipeDistance(position: vec2f) -> f32 {
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
`,i=[[`paint`,4],[`flow`,4],[`time`,4],[`brushStart`,4],[`brushEnd`,4],[`brushColor`,4],[`brushVelocity`,4],[`spread`,4],[`settle`,4],[`dry`,4],[`motion`,4],[`paper`,4],[`light`,4],[`look`,4],[`grade`,4],[`wipe`,4]],a=(()=>{let e={},t=0;for(let[n,r]of i)e[n]=t,t+=r;return e})(),o=i.reduce((e,[,t])=>e+t,0),s=class{data=new Float32Array(o);set(e,t){this.data.set(t,a[e])}};function c(e,t,n){return Math.min(Math.max(e,t),n)}function l(e,t,n){let r=c((n-e)/(t-e),0,1);return r*r*(3-2*r)}function u(e,t){return 1-Math.exp(-e*t)}function d(e){let t=Number.parseInt(e.replace(`#`,``),16);return[t>>16&255,t>>8&255,t&255].map(e=>{let t=e/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4})}function f(e,t,n){let r=n*Math.PI/180,i=t*Math.cos(r),a=t*Math.sin(r),o=(e+.3963377774*i+.2158037573*a)**3,s=(e-.1055613458*i-.0638541728*a)**3,c=(e-.0894841775*i-1.291485548*a)**3;return[4.0767416621*o-3.3077115913*s+.2309699292*c,-1.2684380046*o+2.6097574011*s-.3413193965*c,-.0041960863*o-.7034186147*s+1.707614701*c]}function p(e){return e.every(e=>e>=-5e-4&&e<=1.0005)}var m=.02,h=.985;function g(e){return e.map(e=>{let t=c(e,m,h);return(1-t)**2/(2*t)})}function _(e,{chroma:t,lightness:n,swing:r}){let i=(e%360+360)%360,a=n+r*Math.cos((i-100)*Math.PI/180),o=t;for(;o>.005&&!p(f(a,o,i));)o*=.94;return f(a,o,i).map(e=>c(e,0,1))}var v={high:{flowScale:.5,maximumCells:4096e3,paintScale:1,unitCells:1100},low:{flowScale:.5,maximumCells:81e4,paintScale:.6,unitCells:600}};function y({cores:e,isFinePointer:t,memory:n,search:r}){let i=new URLSearchParams(r).get(`quality`);return i===`low`||i===`high`?i:!t||(e===void 0||e>=8)&&(n===void 0||n>=8)?`high`:`low`}function b(e){return{...v[y(e)],tier:y(e)}}function x(){return{cores:navigator.hardwareConcurrency,isFinePointer:window.matchMedia(`(pointer: fine)`).matches,memory:navigator.deviceMemory,search:window.location.search}}function S(e,t,{flowScale:n,maximumCells:r,paintScale:i,unitCells:a}){let o=Math.min(i,a/Math.max(1,Math.min(e,t))),s=e*t*o*o,c=s>r?o*Math.sqrt(r/s):o,l=[Math.max(16,Math.round(e*c)),Math.max(16,Math.round(t*c))];return{flow:[Math.max(8,Math.round(l[0]*n)),Math.max(8,Math.round(l[1]*n))],paint:l,pixel:l[0]/e}}function C(e,t){return e.paint[0]===t.paint[0]&&e.paint[1]===t.paint[1]}function w(e,t,n){return e===`image`?{binding:t,texture:{sampleType:`float`,viewDimension:`2d`},visibility:n}:e===`raw`?{binding:t,texture:{sampleType:`unfilterable-float`,viewDimension:`2d`},visibility:n}:{binding:t,storageTexture:{access:`write-only`,format:e,viewDimension:`2d`},visibility:n}}function T(e,t,n,r){return e.createBindGroupLayout({entries:n.map((e,t)=>w(e,t,r)),label:t})}function E(e){let t=GPUShaderStage.COMPUTE|GPUShaderStage.FRAGMENT|GPUShaderStage.VERTEX;return e.createBindGroupLayout({entries:[{binding:0,buffer:{type:`uniform`},visibility:t},{binding:1,sampler:{type:`filtering`},visibility:t},{binding:2,sampler:{type:`filtering`},visibility:t}],label:`frame`})}function D(e,t,n,r){return e.createBindGroup({entries:r.map((e,t)=>({binding:t,resource:e})),label:t,layout:n})}var O=`struct Frame {
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

fn capsuleDistance(position: vec2f) -> f32 {
  let start = frame.brushStart.xy;
  let segment = frame.brushEnd.xy - start;
  let along = clamp(dot(position - start, segment) / max(dot(segment, segment), 1e-6), 0.0, 1.0);

  return length(position - (start + segment * along));
}

fn brushFalloff(position: vec2f, ragged: f32, splay: f32) -> f32 {
  let radius = frame.brushStart.z * (0.55 + 0.9 * splay) * (0.85 + 0.3 * ragged);

  return 1.0 - smoothstep(radius * 0.78, radius, capsuleDistance(position));
}

fn wipeDistance(position: vec2f) -> f32 {
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
`,k=`struct Frame {
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

fn capsuleDistance(position: vec2f) -> f32 {
  let start = frame.brushStart.xy;
  let segment = frame.brushEnd.xy - start;
  let along = clamp(dot(position - start, segment) / max(dot(segment, segment), 1e-6), 0.0, 1.0);

  return length(position - (start + segment * along));
}

fn brushFalloff(position: vec2f, ragged: f32, splay: f32) -> f32 {
  let radius = frame.brushStart.z * (0.55 + 0.9 * splay) * (0.85 + 0.3 * ragged);

  return 1.0 - smoothstep(radius * 0.78, radius, capsuleDistance(position));
}


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
`,A=`struct Frame {
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
`,ee=`struct Frame {
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
`,te=`struct Frame {
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
`,ne=`struct Frame {
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
`,re=`struct Frame {
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
`,ie=`struct Frame {
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

fn capsuleDistance(position: vec2f) -> f32 {
  let start = frame.brushStart.xy;
  let segment = frame.brushEnd.xy - start;
  let along = clamp(dot(position - start, segment) / max(dot(segment, segment), 1e-6), 0.0, 1.0);

  return length(position - (start + segment * along));
}

fn brushFalloff(position: vec2f, ragged: f32, splay: f32) -> f32 {
  let radius = frame.brushStart.z * (0.55 + 0.9 * splay) * (0.85 + 0.3 * ragged);

  return 1.0 - smoothstep(radius * 0.78, radius, capsuleDistance(position));
}

fn wipeDistance(position: vec2f) -> f32 {
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
`,j=`struct Frame {
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
`,M=8,N={advectPaint:{bindings:[`image`,`image`,`image`,`rgba16float`],source:O},advectVelocity:{bindings:[`image`,`raw`,`image`,`rgba16float`],source:k},curl:{bindings:[`image`,`r32float`],source:A},divergence:{bindings:[`image`,`raw`,`r32float`,`r32float`],source:ee},paper:{bindings:[`rgba8unorm`],source:te},pressure:{bindings:[`raw`,`raw`,`r32float`],source:ne},project:{bindings:[`image`,`raw`,`rgba16float`],source:re},settle:{bindings:[`image`,`image`,`image`,`rgba16float`,`rgba16float`],source:ie},spread:{bindings:[`image`,`image`,`image`,`rgba16float`],source:j}},P=class{carried=0;deposit=0;device;frameLayout;isPaperPending=!0;layouts={};pipelines={};textures=[];constructor(e,t){n(this),this.device=e,this.frameLayout=t}async create(){let e=Object.entries(N);await Promise.all(e.map(async([e,{bindings:t,source:n}])=>{this.layouts[e]=T(this.device,e,t,GPUShaderStage.COMPUTE),this.pipelines[e]=await this.device.createComputePipelineAsync({compute:{entryPoint:`main`,module:this.device.createShaderModule({code:n,label:e})},label:e,layout:this.device.createPipelineLayout({bindGroupLayouts:[this.frameLayout,this.layouts[e]]})})}))}createTexture(e,t,n){let r=this.device.createTexture({format:t,label:e,size:n,usage:GPUTextureUsage.STORAGE_BINDING|GPUTextureUsage.TEXTURE_BINDING});return this.textures.push(r),r.createView()}resize(e){this.destroyTextures(),this.sheet=e,this.carried=0,this.deposit=0,this.isPaperPending=!0;let{flow:t,paint:n}=e,r=(e,t,n)=>[this.createTexture(`${e} a`,t,n),this.createTexture(`${e} b`,t,n)],i={carried:r(`carried`,`rgba16float`,n),curl:this.createTexture(`curl`,`r32float`,t),deposit:r(`deposit`,`rgba16float`,n),divergence:this.createTexture(`divergence`,`r32float`,t),paper:this.createTexture(`paper`,`rgba8unorm`,n),pressure:r(`pressure`,`r32float`,t),velocity:r(`velocity`,`rgba16float`,t)},{carried:a,curl:o,deposit:s,divergence:c,paper:l,pressure:u,velocity:d}=i,f=(e,t)=>D(this.device,e,this.layouts[e],t),p={curl:f(`curl`,[d[1],o]),divergence:f(`divergence`,[d[0],u[0],c,u[1]]),paper:f(`paper`,[l]),pressure0:f(`pressure`,[u[1],c,u[0]]),pressure1:f(`pressure`,[u[0],c,u[1]]),project:f(`project`,[d[0],u[0],d[1]])};for(let e of[0,1]){let t=1-e;p[`advectVelocity${e}`]=f(`advectVelocity`,[d[1],o,a[e],d[0]]),p[`advectPaint${e}`]=f(`advectPaint`,[d[1],a[e],l,a[t]]);for(let n of[0,1]){let r=1-n;p[`spread${e}${n}`]=f(`spread`,[a[e],s[n],l,a[t]]),p[`settle${e}${n}`]=f(`settle`,[a[e],s[n],l,a[t],s[r]])}}this.views=i,this.groups=p}get carriedView(){return this.views.carried[this.carried]}get depositView(){return this.views.deposit[this.deposit]}update(e,t,{iterations:n,spreads:r},i){let{groups:a,pipelines:o}=this,s=e=>[Math.ceil(e[0]/M),Math.ceil(e[1]/M)],c=s(this.sheet.flow),l=s(this.sheet.paint),u=e.beginComputePass({label:`paint`,timestampWrites:i}),d=(e,t,[n,r])=>{u.setPipeline(o[e]),u.setBindGroup(1,a[t]),u.dispatchWorkgroups(n,r)},f=()=>{this.carried=1-this.carried};u.setBindGroup(0,t),this.isPaperPending&&=(d(`paper`,`paper`,l),!1),d(`curl`,`curl`,c),d(`advectVelocity`,`advectVelocity${this.carried}`,c),d(`divergence`,`divergence`,c);let p=Math.floor(Math.max(1,n)/2)*2+1;for(let e=0;e<p;e++)d(`pressure`,`pressure${e%2}`,c);d(`project`,`project`,c),d(`advectPaint`,`advectPaint${this.carried}`,l),f();for(let e=0;e<r;e++)d(`spread`,`spread${this.carried}${this.deposit}`,l),f();d(`settle`,`settle${this.carried}${this.deposit}`,l),f(),this.deposit=1-this.deposit,u.end()}destroyTextures(){for(let e of this.textures)e.destroy();this.textures=[]}},F=4,I=class{device;isCopied=!1;isPending=!1;milliseconds={fluid:0,march:0};querySet;readback;resolveBuffer;constructor(e){n(this),this.device=e,this.querySet=e.createQuerySet({count:F,label:`timing`,type:`timestamp`}),this.resolveBuffer=e.createBuffer({label:`timing resolve`,size:32,usage:GPUBufferUsage.QUERY_RESOLVE|GPUBufferUsage.COPY_SRC}),this.readback=e.createBuffer({label:`timing readback`,size:32,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ})}get fluidWrites(){return{beginningOfPassWriteIndex:0,endOfPassWriteIndex:1,querySet:this.querySet}}get marchWrites(){return{beginningOfPassWriteIndex:2,endOfPassWriteIndex:3,querySet:this.querySet}}resolve(e){this.isPending||(e.resolveQuerySet(this.querySet,0,F,this.resolveBuffer,0),e.copyBufferToBuffer(this.resolveBuffer,0,this.readback,0,32),this.isCopied=!0)}afterSubmit(){this.isCopied&&(this.isCopied=!1,this.isPending=!0,this.readback.mapAsync(GPUMapMode.READ).then(()=>{let[e,t,n,r]=new BigUint64Array(this.readback.getMappedRange());t&&e&&t>e&&(this.milliseconds.fluid=Number(t-e)/1e6),r&&n&&r>n&&(this.milliseconds.march=Number(r-n)/1e6),this.readback.unmap(),this.isPending=!1}).catch(()=>{this.isPending=!1}))}},L=.35,R=1/60,z=1/30,B=2,V=250;function H(e){return .5+.3*Math.sin(e*2.1)+.2*Math.sin(e*5.3+1.7)}function U(e){return e<.5?4*e**3:1-(-2*e+2)**3/2}var W=class{element;frame=new s;frameIndex=0;isCapture=new URLSearchParams(window.location.search).has(`capture`);isDestroyed=!1;isRevealed=!1;last=0;motion=1;onFailure;hue=e.hue;isRainbow=e.rainbow.isActive;scale=1;strokes=0;pixelRatioQuery=null;pointer={isInside:!1,isTouch:!1,mode:null,position:[0,0],previous:[0,0],target:[0,0]};quality=b(x());ready;reducedMotion=window.matchMedia(`(prefers-reduced-motion: reduce)`);resizeTimeout=0;size={height:0,width:0};time=0;timing=null;load=1;travelled=0;wipe={center:[0,0],progress:1};constructor({element:e,onFailure:t}){n(this),this.element=e,this.onFailure=t,this.onReducedMotionChange(),this.reducedMotion.addEventListener(`change`,this.onReducedMotionChange),this.ready=this.create().catch(e=>{console.error(e),this.fail()})}async create(){let e=await navigator.gpu.requestAdapter({powerPreference:`high-performance`});if(!e)throw Error(`No WebGPU adapter.`);let t=e.features.has(`timestamp-query`)?[`timestamp-query`]:[];this.device=await e.requestDevice({label:`watercolor`,requiredFeatures:t}),this.device.lost.then(()=>{this.isDestroyed||this.fail()}),this.device.addEventListener(`uncapturederror`,e=>{console.error(e.error.message)}),this.device.features.has(`timestamp-query`)&&(this.timing=new I(this.device)),this.format=navigator.gpu.getPreferredCanvasFormat(),this.context=this.element.getContext(`webgpu`),this.context.configure({alphaMode:`opaque`,device:this.device,format:this.format});let n=E(this.device);this.frameBuffer=this.device.createBuffer({label:`frame`,size:o*4,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.frameGroup=this.device.createBindGroup({entries:[{binding:0,resource:{buffer:this.frameBuffer}},{binding:1,resource:this.device.createSampler({magFilter:`linear`,minFilter:`linear`})},{binding:2,resource:this.device.createSampler({magFilter:`nearest`,minFilter:`nearest`})}],label:`frame`,layout:n}),this.paint=new P(this.device,n),this.renderLayout=T(this.device,`render`,[`image`,`image`,`image`],GPUShaderStage.FRAGMENT);let i=this.device.createShaderModule({code:r,label:`render`}),[a]=await Promise.all([this.device.createRenderPipelineAsync({fragment:{entryPoint:`fs`,module:i,targets:[{format:this.format}]},label:`render`,layout:this.device.createPipelineLayout({bindGroupLayouts:[n,this.renderLayout]}),primitive:{topology:`triangle-list`},vertex:{entryPoint:`vs`,module:i}}),this.paint.create()]);this.render=a,this.isDestroyed||(this.createSheet(!0),this.onResize(),this.addEventListeners(),this.usePaperBackground(),this.onLoopFrame(0),await this.device.queue.onSubmittedWorkDone(),this.isCapture?this.startCapture():requestAnimationFrame(e=>{this.last=e,this.isRevealed=!0,document.documentElement.classList.add(`is-ready`),requestAnimationFrame(this.onLoop)}))}startCapture(){this.isRevealed=!0,document.documentElement.classList.add(`is-ready`);let e=window;e.capture={frame:async()=>{this.onLoopFrame(R),await this.device.queue.onSubmittedWorkDone()}}}fail(){this.isDestroyed=!0,this.onFailure()}get paintMilliseconds(){return this.timing?.milliseconds.fluid??0}get renderMilliseconds(){return this.timing?.milliseconds.march??0}createSheet(e=!1){let{flowScale:t,maximumCells:n,paintScale:r,unitCells:i}=this.quality,a=S(window.innerWidth,window.innerHeight,{flowScale:t,maximumCells:n,paintScale:r,unitCells:i});if(!e&&this.sheet&&C(a,this.sheet))return;this.sheet=a,this.paint.resize(a);let{carried:o,deposit:s,paper:c}=this.paint.views;this.renderGroups={};for(let e of[0,1])for(let t of[0,1])this.renderGroups[`${e}${t}`]=D(this.device,`render`,this.renderLayout,[o[e],s[t],c])}clear(){this.createSheet(!0)}wash(){this.wipe={center:[window.innerWidth/2,window.innerHeight/2],progress:0}}addEventListeners(){window.addEventListener(`resize`,this.onResize),window.addEventListener(`pointermove`,this.onPointerMove),window.addEventListener(`pointerdown`,this.onPointerDown),window.addEventListener(`pointerup`,this.onPointerUp),window.addEventListener(`pointercancel`,this.onPointerUp),window.addEventListener(`contextmenu`,this.onContextMenu),window.addEventListener(`wheel`,this.onWheel,{passive:!1}),document.documentElement.addEventListener(`pointerleave`,this.onPointerLeave)}onResize(){this.watchPixelRatio();let e=Math.min(window.devicePixelRatio,B),t=Math.max(1,Math.round(window.innerWidth*e)),n=Math.max(1,Math.round(window.innerHeight*e));(t!==this.size.width||n!==this.size.height)&&(this.size={height:n,width:t},this.element.width=t,this.element.height=n),window.clearTimeout(this.resizeTimeout),this.resizeTimeout=window.setTimeout(()=>this.createSheet(),V)}watchPixelRatio(){this.pixelRatioQuery?.removeEventListener(`change`,this.onResize),this.pixelRatioQuery=window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),this.pixelRatioQuery.addEventListener(`change`,this.onResize)}isInterface(e){return!!e.target?.closest?.(`[data-interface]`)}updateTarget(e){this.pointer.target=[e.clientX,e.clientY],this.pointer.isTouch=e.pointerType!==`mouse`}resetPointer(){this.pointer.position=[...this.pointer.target],this.pointer.previous=this.pointer.position}onPointerMove(e){this.updateTarget(e),this.pointer.isInside=!this.isInterface(e)}onPointerDown(e){this.isInterface(e)||e.button!==0&&e.button!==2||(this.updateTarget(e),this.resetPointer(),this.pointer.isInside=!0,this.pointer.mode=e.button===2?`smudge`:`paint`,this.travelled=0,this.strokes++)}onPointerUp(){this.pointer.mode=null}onPointerLeave(){this.pointer.isInside=!1}onContextMenu(e){this.isInterface(e)||e.preventDefault()}onWheel(t){if(this.isInterface(t))return;t.preventDefault();let n=Math.abs(t.deltaY)>=Math.abs(t.deltaX)?t.deltaY:t.deltaX,r=t.deltaMode===1?n*16:n;t.ctrlKey?this.setScale(this.scale*Math.exp(-r*.01)):t.shiftKey?this.setScale(this.scale*Math.exp(-r*.0025)):this.setHue(this.hue+r*e.color.wheel)}onReducedMotionChange(){this.motion=this.reducedMotion.matches?L:1}setHue(e){this.hue=(e%360+360)%360}advanceHue(e){this.hue=(this.hue+e)%360}toggleRainbow(e=!this.isRainbow){this.isRainbow=e}setScale(t){this.scale=c(t,e.brush.smallest,e.brush.largest)}usePaperBackground(){document.documentElement.style.background=e.paper,document.querySelector(`meta[name="theme-color"]`)?.setAttribute(`content`,e.paper)}hueAbsorption(t){return g(_(t,e.color))}get isPointerActive(){let{isInside:e,mode:t}=this.pointer;return this.isRevealed&&e&&t!==null}onLoop(e){if(this.isDestroyed)return;let t=Math.min((e-this.last)/1e3,.1);this.last=e,this.onLoopFrame(t),requestAnimationFrame(this.onLoop)}movePointer(){let{pointer:e}=this;e.previous=e.position,e.position=[...e.target]}updateBrush(t){let{frame:n,pointer:r,sheet:i}=this,{brush:a}=e,o=this.isPointerActive,s=o&&r.mode===`smudge`,d=+!!o,[f,p]=r.position,[m,h]=r.previous,g=Math.min(window.innerWidth,window.innerHeight),_=t>0?(f-m)/t:0,v=t>0?(p-h)/t:0,y=Math.min(Math.hypot(_,v)/g,a.maximum),b=y<a.rest||!o;this.load=c(this.load-y*t/a.reservoir+(a.trickle+(b?a.refill:0))*t,a.empty,1);let{load:x}=this,S=(a.water+a.speedWater*y)*t*d*(s?a.wash:.35+.65*x),C=s?0:(a.pigment+a.speedPigment*y)*t*d*x**.8,w=i.pixel*(i.flow[0]/i.paint[0])*this.motion*(s?a.washForce:a.force),T=d>0?u(a.follow,t)*c(y/.17,0,1):0,E=Math.min(1,a.maximum*g/Math.max(Math.hypot(_,v),1e-6));this.travelled+=y*t,o&&this.isRainbow&&!s&&this.advanceHue((e.rainbow.distance*y+e.rainbow.time)*t);let D=1.25-.6*l(0,a.thin,y),O=(.75+.5*H(this.travelled*3.6+this.strokes*13.1))*D;n.set(`brushStart`,[m*i.pixel,h*i.pixel,a.radius*(o?this.scale:1)*g*O*i.pixel,S]),n.set(`brushEnd`,[f*i.pixel,p*i.pixel,C,Math.max(0,.6-x)*a.dryBrush]),n.set(`brushColor`,[...this.hueAbsorption(this.hue),s?u(a.lift,t):0]),n.set(`brushVelocity`,[_*w*E,v*w*E,T,2.2])}wipeFrame(t){let{center:n,progress:r}=this.wipe;if(r>=1)return[0,0,0,e.wipe.edge];let i=Math.min(1,r+t/e.wipe.duration),{pixel:a}=this.sheet,o=Math.hypot(window.innerWidth,window.innerHeight)*.5*1.45,s=Math.max(1,U(i)*o);return this.wipe.progress=i,[n[0]*a,n[1]*a,s*a,e.wipe.edge]}updateFrame(t){let{dry:n,flow:r,grade:i,light:a,look:o,settle:s,spread:c}=e,{frame:l,sheet:u}=this,[f,p]=u.paint,[m,h]=u.flow,g=[Math.cos(a.elevation)*Math.cos(a.azimuth),Math.cos(a.elevation)*Math.sin(a.azimuth),Math.sin(a.elevation)];l.set(`paint`,[f,p,1/f,1/p]),l.set(`flow`,[m,h,1/m,1/h]),l.set(`time`,[this.time,t,this.frameIndex,u.pixel]),l.set(`spread`,[c.rate,c.pinning,c.dry,c.diffusion]),l.set(`settle`,[s.evaporation*t,s.adsorb*t,s.lift*t,s.granulation]),l.set(`dry`,[Math.exp(-n.damp*t),Math.exp(-n.fade*t),s.edge,c.depth]),l.set(`motion`,[Math.exp(-r.friction*t),r.vorticity,r.threshold,r.pressure]),l.set(`paper`,[...d(e.paper),0]),l.set(`light`,[...g,0]),l.set(`look`,[o.granulation,o.paper,o.sheen,o.wet]),l.set(`grade`,[i.saturation,i.vignette,i.grain,o.mottle]),l.set(`wipe`,this.wipeFrame(t)),this.device.queue.writeBuffer(this.frameBuffer,0,l.data)}onLoopFrame(t){let n=this.isRevealed?Math.min(t,z):0,{timing:r}=this;this.time+=n,this.frameIndex++,this.movePointer(),this.updateBrush(n),this.updateFrame(n);let i=this.device.createCommandEncoder({label:`frame`});this.paint.update(i,this.frameGroup,{iterations:e.flow.iterations,spreads:n>0?e.spread.iterations:0},r?.fluidWrites);let a=i.beginRenderPass({colorAttachments:[{clearValue:[1,1,1,1],loadOp:`clear`,storeOp:`store`,view:this.context.getCurrentTexture().createView()}],label:`render`,timestampWrites:r?.marchWrites});a.setPipeline(this.render),a.setBindGroup(0,this.frameGroup),a.setBindGroup(1,this.renderGroups[`${this.paint.carried}${this.paint.deposit}`]),a.draw(3),a.end(),r?.resolve(i),this.device.queue.submit([i.finish()]),r?.afterSubmit()}},G=1.35,K=12,q=class{canvas;rainbow=document.querySelector(`[data-rainbow]`);constructor(e){n(this),this.canvas=e,window.addEventListener(`keydown`,this.onKeyDown),this.update()}onKeyDown(e){if(e.metaKey||e.ctrlKey||e.altKey)return;let{canvas:t}=this,n=e.key.toLowerCase();if(n===`[`||n===`]`)t.setScale(t.scale*G**(n===`]`?1:-1));else if(n===`arrowleft`||n===`arrowright`)t.setHue(t.hue+(n===`arrowright`?K:-12));else if(n===`r`)t.toggleRainbow(),this.update();else if(n===`d`||n===`backspace`||n===`delete`)t.wash();else return;e.preventDefault()}update(){if(this.rainbow){let e=this.canvas.isRainbow?`on`:`off`;this.rainbow.dataset.rainbow=e,this.rainbow.textContent=e}}},J=`modulepreload`,Y=function(e){return`/`+e},ae={},oe=function(e){return e.pathname.endsWith(`.css`)},se=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},X=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=Y(t,n);let r=s(t),i=oe(r);return se(ae,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:J,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})};await new Promise(e=>requestAnimationFrame(()=>setTimeout(e)));var Z=document.documentElement,Q=document.querySelector(`.canvas`);function $(){Z.classList.remove(`is-ready`),Z.classList.add(`is-unsupported`);let e=document.querySelector(`.fallback`);e&&(e.hidden=!1)}if(!Q||!navigator.gpu)$();else{let e=new W({element:Q,onFailure:$});e.ready.then(()=>new q(e)),window.location.hash===`#debug`&&e.ready.then(async()=>{let[{Controls:t},{settings:n}]=await Promise.all([X(()=>import(`./Controls-Dtx486q5.js`),__vite__mapDeps([0,1])),X(()=>import(`./Settings-8fN1sgGV.js`),__vite__mapDeps([2,1]))]);new t(e),Object.assign(window,{canvas:e,settings:n})})}
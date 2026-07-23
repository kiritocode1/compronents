export type SpiralInteractionState = "idle" | "holding" | "charged";

const PHRASE = "THE CONTENT ARCHITECTURE.";
const PERIOD_INDEX = PHRASE.indexOf(".");
const LETTER_INDICES = Array.from(PHRASE, (_, index) => index).filter(
  (index) => index !== PERIOD_INDEX,
);
const RING_COUNT = 30;
const RIPPLE_SLOTS = 16;
const RIPPLE_DURATION = 1.8;
const RIPPLE_MAX_RADIUS = 1.6;
const RIPPLE_WIDTH = 0.85;
const DESIGN_PER_PIXEL = 1 / 540;

const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec2 position;
in vec2 uv;
in float aRadius;
in float aTheta0;
in float aSpeed;
in float aSize;
in float aCharIdx;
in float aRingIdx;

uniform float uTime;
uniform vec2 uFitScale;
uniform vec2 uCenter;
uniform vec2 uAtlasGrid;
uniform float uPxToDesign;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform float uMouseRadius;
uniform float uRingCharge[30];
uniform float uRingGather[30];
uniform float uRippleStarts[16];
uniform float uRingOffsets[30];
uniform float uRingArrivalTime[30];

out vec2 vUv;
out float vRingT;
out float vAlpha;

void main() {
  float rippleInfluence = 0.0;
  for (int r = 0; r < 16; r++) {
    float start = uRippleStarts[r];
    if (start < 0.0) continue;
    float elapsed = uTime - start;
    if (elapsed < 0.0 || elapsed >= 1.8) continue;
    float t = elapsed / 1.8;
    float waveRadius = smoothstep(0.0, 1.0, t) * 1.6;
    float bell = 1.0 - smoothstep(0.0, 0.425, abs(aRadius - waveRadius));
    float lifeFade = smoothstep(0.0, 0.22, t) * (1.0 - smoothstep(0.78, 1.0, t));
    rippleInfluence = max(rippleInfluence, bell * lifeFade);
  }

  float holdCharge = uRingCharge[int(aRingIdx)];
  float gatherAmt = uRingGather[int(aRingIdx)];
  float effectiveRadius = aRadius * (1.0 - gatherAmt * 0.12) + rippleInfluence * 0.045;

  float theta = aTheta0 + uTime * aSpeed + uRingOffsets[int(aRingIdx)];
  float c = cos(theta);
  float s = sin(theta);
  vec2 ringCenter = vec2(c, s) * effectiveRadius;

  float mouseDist = length(ringCenter - uMouse);
  float hoverInfluence = (1.0 - smoothstep(0.0, uMouseRadius, mouseDist)) * uMouseInfluence;
  float strength = max(hoverInfluence * 2.5, rippleInfluence);
  float seed = aTheta0 * 7.13 + aRadius * 13.97;
  float threshold = fract(sin(seed * 12.9898) * 43758.5453);
  float isDot = step(threshold, strength);

  float glitchTick = floor(uTime * 9.0);
  float glitchNoise = fract(sin(seed * 91.7 + glitchTick * 7.31) * 43758.5453);
  isDot = max(isDot, step(glitchNoise, holdCharge * 0.15));
  float charIdxNow = mix(aCharIdx, ${PERIOD_INDEX}.0, isDot);
  float sizePx = mix(aSize, 5.0, isDot) * (1.0 + rippleInfluence * 0.5);

  float designSize = sizePx * uPxToDesign;
  vec2 rotated = vec2(
    -position.x * s - position.y * c,
    position.x * c - position.y * s
  ) * designSize;

  float shakeSeed = fract(sin(aTheta0 * 91.17 + aRadius * 47.91) * 24634.6345);
  float shakes = step(shakeSeed, 0.18);
  vec2 tremor = vec2(
    sin(uTime * (38.0 + shakeSeed * 14.0) + shakeSeed * 271.0),
    cos(uTime * (34.0 + shakeSeed * 17.0) + shakeSeed * 113.0)
  ) * (holdCharge * shakes * 0.002);

  vec2 worldPos = (ringCenter + rotated + tremor) * uFitScale + uCenter;
  float col = mod(charIdxNow, uAtlasGrid.x);
  float row = floor(charIdxNow / uAtlasGrid.x);
  vUv = vec2((col + uv.x) / uAtlasGrid.x, (row + (1.0 - uv.y)) / uAtlasGrid.y);
  vRingT = clamp(aRadius, 0.0, 1.2);
  float arrival = uRingArrivalTime[int(aRingIdx)];
  vAlpha = clamp((uTime - arrival) / 0.5, 0.0, 1.0);
  gl_Position = vec4(worldPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

uniform sampler2D tAtlas;
in vec2 vUv;
in float vRingT;
in float vAlpha;
out vec4 fragColor;

void main() {
  vec4 sampled = texture(tAtlas, vUv);
  float dim = mix(0.85, 1.0, smoothstep(0.0, 0.85, vRingT));
  fragColor = vec4(vec3(dim), sampled.a * vAlpha);
}
`;

const QUAD_POSITIONS = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);
const QUAD_UVS = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);

interface Ring {
  radius: number;
  charsCount: number;
  speed: number;
  letterSizePx: number;
  bandCenter: number;
  bandHalfWidth: number;
  bandSoftness: number;
}

interface Ripple {
  start: number;
  strength: number;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const progress = clamp01((value - edge0) / (edge1 - edge0));
  return progress * progress * (3 - 2 * progress);
}

function inverseSmoothstep(value: number) {
  return 0.5 - Math.sin(Math.asin(1 - 2 * clamp01(value)) / 3);
}

function wrapAngle(value: number) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create the spiral shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create the spiral program.");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unknown link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function createGlyphAtlas() {
  const rows = Math.ceil(PHRASE.length / 8);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64 * rows;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "400 57px CapMono, monospace";
  for (let index = 0; index < PHRASE.length; index++) {
    const x = ((index % 8) + 0.5) * 64;
    const y = (Math.floor(index / 8) + 0.55) * 64;
    if (index === PERIOD_INDEX) {
      context.beginPath();
      context.arc(x, y, 5.76, 0, Math.PI * 2);
      context.fill();
    } else {
      context.fillText(PHRASE[index] ?? "", x, y);
    }
  }
  return canvas;
}

function createRings() {
  const rings: Ring[] = [];
  const bandRange = 0.65 * Math.PI;
  for (let index = 0; index < RING_COUNT; index++) {
    const progress = index / (RING_COUNT - 1);
    const radius = 0.06 + 1.39 * progress;
    const speed = (index % 2 === 0 ? 1 : -1) * (0.006 + (1 - progress) * 0.029);
    const letterSizePx = 14 + 16 * progress;
    const charsCount = Math.max(
      8,
      Math.floor(
        (Math.PI * 2 * radius) / (0.6 * letterSizePx * DESIGN_PER_PIXEL),
      ),
    );
    const bandCenter =
      Math.random() < 0.15
        ? Math.random() * Math.PI * 2
        : 0.25 + (Math.random() - 0.5) * bandRange;
    const bandHalfWidth =
      Math.random() < 0.1
        ? 0.05 + 0.15 * Math.random()
        : 0.25 + 0.35 * progress + 0.3 * Math.random();
    rings.push({
      radius,
      charsCount,
      speed,
      letterSizePx,
      bandCenter,
      bandHalfWidth: Math.min(0.98, bandHalfWidth) * Math.PI,
      bandSoftness: Math.PI * (0.07 + 0.13 * Math.random()),
    });
  }
  return rings;
}

function createInstanceData(rings: Ring[]) {
  const total = rings.reduce((sum, ring) => sum + ring.charsCount, 0);
  const radius = new Float32Array(total);
  const theta = new Float32Array(total);
  const speed = new Float32Array(total);
  const size = new Float32Array(total);
  const charIndex = new Float32Array(total);
  const ringIndex = new Float32Array(total);
  let cursor = 0;

  rings.forEach((ring, currentRing) => {
    const isLetter = new Uint8Array(ring.charsCount);
    const letterIndex = new Uint16Array(ring.charsCount);
    let slot = 0;
    while (slot < ring.charsCount) {
      for (
        let phraseSlot = 0;
        phraseSlot < LETTER_INDICES.length && slot < ring.charsCount;
        phraseSlot++
      ) {
        isLetter[slot] = 1;
        letterIndex[slot] = LETTER_INDICES[phraseSlot] ?? 0;
        slot++;
      }
      slot += 1 + Math.floor(3 * Math.random());
    }

    const offset = Math.random() * Math.PI * 2;
    const step = (Math.PI * 2) / ring.charsCount;
    const outerBand = ring.bandHalfWidth + ring.bandSoftness;
    const innerBand = Math.max(0, ring.bandHalfWidth - ring.bandSoftness);
    for (let index = 0; index < ring.charsCount; index++) {
      const angle = offset + index * step;
      const bandDistance = Math.abs(wrapAngle(angle - ring.bandCenter));
      const weight = smoothstep(outerBand, innerBand, bandDistance);
      const showLetter =
        isLetter[index] === 1 &&
        (weight > 0.7 || (weight >= 0.3 && Math.random() < weight));
      radius[cursor] = ring.radius;
      theta[cursor] = angle;
      speed[cursor] = ring.speed;
      ringIndex[cursor] = currentRing;
      if (showLetter) {
        charIndex[cursor] = letterIndex[index] ?? 0;
        size[cursor] = ring.letterSizePx * (0.85 + 0.15 * weight);
      } else {
        charIndex[cursor] = PERIOD_INDEX;
        size[cursor] = 5;
      }
      cursor++;
    }
  });

  return { total, radius, theta, speed, size, charIndex, ringIndex };
}

function findScrollParent(element: HTMLElement) {
  let current = element.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(`${style.overflow}${style.overflowY}`)) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

export function mountContentArchitectureSpiral(
  container: HTMLElement,
  label: HTMLElement | null,
  onState: (state: SpiralInteractionState) => void,
) {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return () => {};
  const activateProgram = gl.useProgram.bind(gl);

  container
    .querySelectorAll<HTMLCanvasElement>(":scope > canvas")
    .forEach((existingCanvas) => existingCanvas.remove());
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.prepend(canvas);

  let program: WebGLProgram;
  try {
    program = createProgram(gl);
  } catch (error) {
    console.error("[ContentArchitectureSpiral]", error);
    canvas.remove();
    return () => {};
  }

  const rings = createRings();
  const instances = createInstanceData(rings);
  const arrivalTimes = new Float32Array(RING_COUNT);
  rings.forEach((ring, index) => {
    const distance = Math.max(0, ring.radius - RIPPLE_WIDTH / 2);
    arrivalTimes[index] =
      RIPPLE_DURATION *
      inverseSmoothstep(Math.min(1, distance / RIPPLE_MAX_RADIUS));
  });

  gl.clearColor(35 / 255, 35 / 255, 35 / 255, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  activateProgram(program);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buffers: WebGLBuffer[] = [];
  const addAttribute = (
    name: string,
    values: Float32Array,
    size: number,
    instanced = false,
  ) => {
    const location = gl.getAttribLocation(program, name);
    if (location < 0) return;
    const buffer = gl.createBuffer();
    if (!buffer) return;
    buffers.push(buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    if (instanced) gl.vertexAttribDivisor(location, 1);
  };
  addAttribute("position", QUAD_POSITIONS, 2);
  addAttribute("uv", QUAD_UVS, 2);
  addAttribute("aRadius", instances.radius, 1, true);
  addAttribute("aTheta0", instances.theta, 1, true);
  addAttribute("aSpeed", instances.speed, 1, true);
  addAttribute("aSize", instances.size, 1, true);
  addAttribute("aCharIdx", instances.charIndex, 1, true);
  addAttribute("aRingIdx", instances.ringIndex, 1, true);
  gl.bindVertexArray(null);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.LINEAR_MIPMAP_LINEAR,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const uploadAtlas = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      createGlyphAtlas(),
    );
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  uploadAtlas();

  const location = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    time: location("uTime"),
    fitScale: location("uFitScale"),
    center: location("uCenter"),
    atlasGrid: location("uAtlasGrid"),
    pxToDesign: location("uPxToDesign"),
    mouse: location("uMouse"),
    mouseInfluence: location("uMouseInfluence"),
    mouseRadius: location("uMouseRadius"),
    ringCharge: location("uRingCharge[0]"),
    ringGather: location("uRingGather[0]"),
    rippleStarts: location("uRippleStarts[0]"),
    ringOffsets: location("uRingOffsets[0]"),
    ringArrival: location("uRingArrivalTime[0]"),
    atlas: location("tAtlas"),
  };
  gl.uniform2f(uniforms.center, 0, 0);
  gl.uniform2f(uniforms.atlasGrid, 8, Math.ceil(PHRASE.length / 8));
  gl.uniform1f(uniforms.pxToDesign, DESIGN_PER_PIXEL);
  gl.uniform1f(uniforms.mouseRadius, 0.35);
  gl.uniform1i(uniforms.atlas, 0);
  gl.uniform1fv(uniforms.ringArrival, arrivalTimes);

  const controller = new AbortController();
  const { signal } = controller;
  const ringCharge = new Float32Array(RING_COUNT);
  const ringGather = new Float32Array(RING_COUNT);
  const ringOffsets = new Float32Array(RING_COUNT);
  const offsetTargets = new Float32Array(RING_COUNT);
  const offsetSmoothed = new Float32Array(RING_COUNT);
  const freezeOffsets = new Float32Array(RING_COUNT);
  const rippleUniform = new Float32Array(RIPPLE_SLOTS).fill(-1);
  const mouseTarget = new Float32Array([999, 999]);
  const mouseCurrent = new Float32Array([999, 999]);
  const ripples: Ripple[] = [];
  let width = 1;
  let height = 1;
  let time = 0;
  let lastFrame = performance.now();
  let frame = 0;
  let visible = true;
  let mouseInfluence = 0;
  let mouseInfluenceTarget = 0;
  let holding = false;
  let charged = false;
  let charge = 0;
  let gather = 0;
  let releaseTime = -1;
  let scrollVelocity = 0;
  let smoothedScrollVelocity = 0;
  let lastScrollPosition = 0;
  let lastScrollTime = performance.now();

  const resize = () => {
    const bounds = container.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    gl.viewport(0, 0, canvas.width, canvas.height);
    const aspect = width / height;
    if (aspect >= 1) gl.uniform2f(uniforms.fitScale, 1, aspect);
    else gl.uniform2f(uniforms.fitScale, 1 / aspect, 1);
  };

  const draw = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    activateProgram(program);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1f(uniforms.time, time);
    gl.uniform2fv(uniforms.mouse, mouseCurrent);
    gl.uniform1f(uniforms.mouseInfluence, mouseInfluence);
    gl.uniform1fv(uniforms.ringCharge, ringCharge);
    gl.uniform1fv(uniforms.ringGather, ringGather);
    gl.uniform1fv(uniforms.rippleStarts, rippleUniform);
    gl.uniform1fv(uniforms.ringOffsets, ringOffsets);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, instances.total);
    gl.bindVertexArray(null);
  };

  const animate = (now: number) => {
    const delta = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    time += delta;

    while (ripples.length && time - (ripples[0]?.start ?? 0) >= 1.8) {
      ripples.shift();
    }
    rippleUniform.fill(-1);
    ripples.slice(0, RIPPLE_SLOTS).forEach((ripple, index) => {
      rippleUniform[index] = ripple.start;
    });

    mouseInfluence +=
      (mouseInfluenceTarget - mouseInfluence) * (1 - Math.exp(-6 * delta));
    const mouseEase = 1 - Math.exp(-14 * delta);
    mouseCurrent[0] += (mouseTarget[0] - mouseCurrent[0]) * mouseEase;
    mouseCurrent[1] += (mouseTarget[1] - mouseCurrent[1]) * mouseEase;

    if (holding) {
      charge = Math.min(1, charge + delta / 0.9);
      gather = 1 - (1 - gather) * Math.exp(-delta / 4);
      if (!charged && charge >= 1) {
        charged = true;
        onState("charged");
      }
    } else {
      charge *= Math.exp(-10 * delta);
      gather *= Math.exp(-10 * delta);
    }

    const decay = Math.exp(-10 * delta);
    const sinceRelease = time - releaseTime;
    const releaseActive = releaseTime >= 0 && sinceRelease < RIPPLE_DURATION;
    const releaseRadius = releaseActive
      ? RIPPLE_MAX_RADIUS * smoothstep(0, 1, sinceRelease / RIPPLE_DURATION) +
        RIPPLE_WIDTH / 2
      : Number.POSITIVE_INFINITY;
    rings.forEach((ring, index) => {
      let currentCharge = ringCharge[index] ?? 0;
      let currentGather = ringGather[index] ?? 0;
      if (holding) {
        const ease = 1 - Math.exp(-14 * delta);
        currentCharge += (charge - currentCharge) * ease;
        currentGather +=
          (smoothstep(0, 1, charge) * gather - currentGather) * ease;
      } else if (!releaseActive || releaseRadius >= ring.radius) {
        currentCharge *= decay;
        currentGather *= decay;
      }
      ringCharge[index] = currentCharge;
      ringGather[index] = currentGather;
      const frozen = smoothstep(0, 1, currentCharge);
      freezeOffsets[index] =
        (freezeOffsets[index] ?? 0) - frozen * ring.speed * delta;
    });

    scrollVelocity *= Math.exp(-5 * delta);
    const scrollMagnitude = Math.min(40, Math.abs(scrollVelocity));
    smoothedScrollVelocity +=
      (scrollMagnitude - smoothedScrollVelocity) * (1 - Math.exp(-4 * delta));
    const offsetEase = 1 - Math.exp(-3 * delta);
    rings.forEach((ring, index) => {
      let rippleStrength = 0;
      for (const ripple of ripples) {
        const age = time - ripple.start;
        if (age < 0 || age >= RIPPLE_DURATION) continue;
        const progress = age / RIPPLE_DURATION;
        const radius = RIPPLE_MAX_RADIUS * smoothstep(0, 1, progress);
        const strength =
          (1 -
            smoothstep(0, RIPPLE_WIDTH / 2, Math.abs(ring.radius - radius))) *
          smoothstep(0, 0.22, progress) *
          (1 - smoothstep(0.78, 1, progress)) *
          ripple.strength;
        rippleStrength = Math.max(rippleStrength, strength);
      }
      const direction = Math.sign(ring.speed) || 1;
      offsetTargets[index] =
        (offsetTargets[index] ?? 0) +
        (0.55 * rippleStrength * direction +
          ring.speed * smoothedScrollVelocity) *
          delta;
      offsetSmoothed[index] =
        (offsetSmoothed[index] ?? 0) +
        ((offsetTargets[index] ?? 0) - (offsetSmoothed[index] ?? 0)) *
          offsetEase;
      ringOffsets[index] =
        (offsetSmoothed[index] ?? 0) + (freezeOffsets[index] ?? 0);
    });

    draw();
    if (visible) frame = requestAnimationFrame(animate);
  };

  const pointerPosition = (event: PointerEvent) => {
    const bounds = container.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const fitX = width / height >= 1 ? 1 : height / width;
    const fitY = width / height >= 1 ? width / height : 1;
    mouseTarget[0] = ((x / width) * 2 - 1) / fitX;
    mouseTarget[1] = -((y / height) * 2 - 1) / fitY;
    if (label) {
      label.style.transform = `translate3d(${x + 20}px,${y + 20}px,0)`;
    }
  };
  const pointerEnter = (event: PointerEvent) => {
    pointerPosition(event);
    mouseCurrent.set(mouseTarget);
    mouseInfluenceTarget = 1;
    if (label) label.dataset.visible = "true";
  };
  const pointerMove = (event: PointerEvent) => pointerPosition(event);
  const pointerLeave = () => {
    mouseInfluenceTarget = 0;
    holding = false;
    charged = false;
    onState("idle");
    if (label) label.dataset.visible = "false";
  };
  const pointerDown = (event: PointerEvent) => {
    pointerPosition(event);
    holding = true;
    charged = false;
    onState("holding");
    container.setPointerCapture(event.pointerId);
  };
  const pointerUp = (event: PointerEvent) => {
    pointerPosition(event);
    if (holding) {
      holding = false;
      if (charged) {
        releaseTime = time;
        ripples.push({ start: time, strength: 0.7 + 0.6 * gather });
        while (ripples.length > RIPPLE_SLOTS) ripples.shift();
      }
      charged = false;
      onState("idle");
    }
    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
  };

  const scrollParent = findScrollParent(container);
  const readScroll = () =>
    scrollParent === window
      ? window.scrollY
      : (scrollParent as HTMLElement).scrollTop;
  lastScrollPosition = readScroll();
  const onScroll = () => {
    const now = performance.now();
    const position = readScroll();
    const elapsed = Math.max(16, now - lastScrollTime);
    scrollVelocity = ((position - lastScrollPosition) / elapsed) * 16;
    lastScrollPosition = position;
    lastScrollTime = now;
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    const nextVisible = entry?.isIntersecting ?? false;
    if (nextVisible === visible) return;
    visible = nextVisible;
    if (visible) {
      lastFrame = performance.now();
      frame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(frame);
    }
  });
  intersectionObserver.observe(container);

  container.addEventListener("pointerenter", pointerEnter, { signal });
  container.addEventListener("pointermove", pointerMove, { signal });
  container.addEventListener("pointerleave", pointerLeave, { signal });
  container.addEventListener("pointerdown", pointerDown, { signal });
  container.addEventListener("pointerup", pointerUp, { signal });
  scrollParent.addEventListener("scroll", onScroll, {
    passive: true,
    signal,
  });
  document.fonts.ready.then(() => {
    if (!signal.aborted) uploadAtlas();
  });

  resize();
  ripples.push({ start: 0, strength: 1 });
  draw();
  frame = requestAnimationFrame(animate);

  return () => {
    controller.abort();
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    gl.deleteTexture(texture);
    gl.deleteVertexArray(vao);
    gl.deleteProgram(program);
    canvas.remove();
  };
}

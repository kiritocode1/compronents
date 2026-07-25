const QUAD_POSITIONS = new Float32Array([
  -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
]);
const QUAD_UVS = new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]);
const RIPPLE_SLOTS = 16;
const RIPPLE_DURATION = 1.8;
const ATLAS_COLUMNS = 4;

const FIELD_ATLAS = " ·.ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+*#@";
const FIELD_PHRASE =
  "EVERY DECISION ALREADY MADE · SCHEMA AS A SYSTEM · THE HARD FIELDS ALREADY BUILT · A LINK FIELD THAT HANDLES EVERYTHING · ONE MEDIA FIELD ONE SHAPE · A PAGE BUILDER WITH GUARDRAILS · FETCH LAYER SOLVED · CDN BYPASSED IN PRODUCTION · WEBHOOKS INVALIDATE ON PUBLISH · DRAFT MODE WIRED IN · A STUDIO EDITORS ACTUALLY USE · SEO DONE NOT DEFERRED · AGENT NATIVE NO DRIFT · WIRED UP NOT JUST CLONED · ";

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

uniform sampler2D tAtlas;
uniform vec3 uColor;

in vec2 vUv;
in float vOpacity;

out vec4 fragColor;

void main() {
  vec4 sampled = texture(tAtlas, vUv);
  fragColor = vec4(uColor, sampled.a * vOpacity);
}
`;

function createVertexShader(phraseLength: number, glyphAspect: number) {
  return `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 position;
in vec2 uv;

uniform vec2 uGridSize;
uniform vec2 uAtlasGrid;
uniform float uTime;
uniform float uPhraseChars[${phraseLength}];
uniform vec2 uModelStart;
uniform vec2 uModelSize;
uniform vec2 uModelUVScale;
uniform vec2 uModelUVOffset;
uniform float uBackgroundBrightness;
uniform float uBackgroundTwinkle;
uniform sampler2D tSourceBrightness;
uniform vec2 uEntranceCenter;
uniform float uEntranceStart;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform float uMouseRadius;
uniform float uRippleMaxRadius;
uniform float uRippleWidth;
uniform float uRippleStarts[16];
uniform vec2 uRippleCenters[16];
uniform float uActiveRippleCount;

const float RIPPLE_DURATION_S = 1.8000;
const float ENTRANCE_FADE_S = 0.5000;
const float GLYPH_ASPECT_S = ${glyphAspect.toFixed(4)};
const float RIPPLE_SCALE_BOOST_S = 0.0000;
const float GENTLE_FLIP_OSC_HZ_S = 0.1800;
const float GENTLE_FLIP_THRESHOLD_S = 0.9850;
const float GENTLE_FLIP_SCRAMBLE_HZ_S = 2.5000;

out vec2 vUv;
out float vOpacity;

float screenDist(vec2 cellOffset) {
  cellOffset.y /= GLYPH_ASPECT_S;
  return length(cellOffset);
}

float cellHash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1D(float x) {
  return fract(sin(x * 12.9898) * 43758.5453);
}

float pickRandomGlyph(float seed, float numGlyphs) {
  return 1.0 + floor(hash1D(seed) * (numGlyphs - 1.0));
}

void main() {
  int instanceID = gl_InstanceID;
  int cols = int(uGridSize.x);
  vec2 cell = vec2(float(instanceID % cols), float(instanceID / cols));

  vec2 modelOffset = cell - uModelStart;
  bool inModel = modelOffset.x >= 0.0 && modelOffset.x < uModelSize.x
              && modelOffset.y >= 0.0 && modelOffset.y < uModelSize.y;

  int activeRippleCount = int(uActiveRippleCount);
  float rippleInfluence = 0.0;
  for (int r = 0; r < 16; r++) {
    if (r >= activeRippleCount) break;
    float start = uRippleStarts[r];
    float elapsed = uTime - start;
    if (elapsed < 0.0 || elapsed >= RIPPLE_DURATION_S) continue;
    float t = elapsed / RIPPLE_DURATION_S;
    float waveRadius = smoothstep(0.0, 1.0, t) * uRippleMaxRadius;
    float distToCenter = screenDist(cell - uRippleCenters[r]);
    float bell = 1.0 - smoothstep(0.0, uRippleWidth * 0.5, abs(distToCenter - waveRadius));
    float lifeFade = smoothstep(0.0, 0.22, t) * (1.0 - smoothstep(0.78, 1.0, t));
    rippleInfluence = max(rippleInfluence, bell * lifeFade);
  }

  float mouseDist = screenDist(cell - uMouse);
  float hoverInfluence = (1.0 - smoothstep(0.0, uMouseRadius, mouseDist)) * uMouseInfluence;
  float threshold = cellHash(cell);
  float dimMask = step(threshold, hoverInfluence * 2.5) * step(0.001, hoverInfluence);
  float boostMask = step(threshold, rippleInfluence * 0.5) * step(0.001, rippleInfluence);

  float rowPhraseOffset = floor(hash1D(cell.y + 0.5) * float(${phraseLength}));
  float baseCharIdx = uPhraseChars[int(mod(cell.x + rowPhraseOffset, float(${phraseLength})))];
  float numAtlasGlyphs = uAtlasGrid.x * uAtlasGrid.y;

  float flipPhase = uTime * GENTLE_FLIP_OSC_HZ_S + threshold * 6.2831853;
  float flipActive = step(GENTLE_FLIP_THRESHOLD_S, sin(flipPhase) * 0.5 + 0.5) * max(float(inModel), uBackgroundTwinkle);
  float flipFrame = floor(uTime * GENTLE_FLIP_SCRAMBLE_HZ_S);
  float flipChar = pickRandomGlyph(threshold * 17.13 + flipFrame * 1.7, numAtlasGlyphs);
  float charIdx = mix(baseCharIdx, flipChar, flipActive);

  float scrambleFrame = floor(uTime * 24.0);
  float scrambleChar = pickRandomGlyph(threshold * 7.13 + scrambleFrame, numAtlasGlyphs);
  charIdx = mix(charIdx, scrambleChar, boostMask);
  charIdx = clamp(charIdx, 0.0, numAtlasGlyphs - 1.0);

  float atlasCol = mod(charIdx, uAtlasGrid.x);
  float atlasRow = floor(charIdx / uAtlasGrid.x);
  vUv = vec2((atlasCol + uv.x) / uAtlasGrid.x, (atlasRow + (1.0 - uv.y)) / uAtlasGrid.y);

  float brightness = uBackgroundBrightness;
  if (inModel) {
    vec2 modelUV = (modelOffset + 0.5) / uModelSize;
    modelUV = modelUV * uModelUVScale + uModelUVOffset;
    brightness = max(uBackgroundBrightness, texture(tSourceBrightness, modelUV).r);
  }

  float baseOpacity = pow(brightness, 0.6);
  float effectiveOpacity = baseOpacity * (1.0 - hoverInfluence);
  effectiveOpacity = mix(effectiveOpacity, 0.0, dimMask);
  effectiveOpacity = mix(effectiveOpacity, 1.0, boostMask);

  float entranceAlpha = 1.0;
  if (uEntranceStart > -1e8) {
    float arrivalDist = screenDist(cell - uEntranceCenter);
    float arrivalFrac = clamp((arrivalDist - uRippleWidth * 0.5) / uRippleMaxRadius, 0.0, 1.0);
    float invSmoothArg = clamp(1.0 - 2.0 * arrivalFrac, -1.0, 1.0);
    float arrival = (0.5 - sin(asin(invSmoothArg) / 3.0)) * RIPPLE_DURATION_S;
    entranceAlpha = clamp((uTime - uEntranceStart - arrival) / ENTRANCE_FADE_S, 0.0, 1.0);
  }
  vOpacity = effectiveOpacity * entranceAlpha;

  vec2 cellSize = 2.0 / uGridSize;
  vec2 cellCenter = -1.0 + (cell + 0.5) * cellSize;
  cellCenter.y = -cellCenter.y;
  vec2 worldPos = cellCenter + position * cellSize;
  gl_Position = vec4(worldPos, 0.0, 1.0);
}
`;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create the glyph field shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  phraseLength: number,
  glyphAspect: number,
) {
  const vertex = compileShader(
    gl,
    gl.VERTEX_SHADER,
    createVertexShader(phraseLength, glyphAspect),
  );
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create the glyph field program.");
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

function createGlyphAtlas(glyphAspect: number) {
  const rows = Math.ceil(FIELD_ATLAS.length / ATLAS_COLUMNS);
  const cellWidth = Math.max(8, Math.round(64 * glyphAspect));
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_COLUMNS * cellWidth;
  canvas.height = 64 * rows;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "500 47px CapMono, monospace";
  for (let index = 0; index < FIELD_ATLAS.length; index++) {
    const x = ((index % ATLAS_COLUMNS) + 0.5) * cellWidth;
    const y = (Math.floor(index / ATLAS_COLUMNS) + 0.58) * 64;
    context.fillText(FIELD_ATLAS[index] ?? " ", x, y);
  }
  return canvas;
}

function createTexture(
  gl: WebGL2RenderingContext,
  image: TexImageSource,
  options: { linear?: boolean; flipY?: boolean } = {},
) {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Unable to create the glyph field texture.");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.flipY ? 1 : 0);
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    options.linear ? gl.LINEAR : gl.LINEAR_MIPMAP_LINEAR,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  if (!options.linear) gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

function replaceTextureImage(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  image: TexImageSource,
) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

/**
 * Paint a precomputed brightness grid straight into the texture source. Grey
 * is written to all three channels because the shader samples .r and treats
 * the texel as luminance.
 */
function createBrightnessCanvasFromGrid(
  columns: number,
  rows: number,
  cellBrightness: Uint8Array | number[],
) {
  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = rows;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return canvas;
  const data = context.createImageData(columns, rows);
  for (let index = 0; index < columns * rows; index++) {
    const value = cellBrightness[index] ?? 0;
    data.data[index * 4] = value;
    data.data[index * 4 + 1] = value;
    data.data[index * 4 + 2] = value;
    data.data[index * 4 + 3] = 255;
  }
  context.putImageData(data, 0, 0);
  return canvas;
}

function createBrightnessCanvas(
  columns: number,
  rows: number,
  image?: HTMLImageElement,
) {
  const canvas = document.createElement("canvas");
  canvas.width = columns;
  canvas.height = rows;
  const context = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
  });
  if (!context) return canvas;
  context.fillStyle = "#000";
  context.fillRect(0, 0, columns, rows);
  if (!image) return canvas;
  context.drawImage(image, 0, 0, columns, rows);
  const data = context.getImageData(0, 0, columns, rows);
  for (let index = 0; index < data.data.length; index += 4) {
    const red = data.data[index] ?? 0;
    const green = data.data[index + 1] ?? 0;
    const blue = data.data[index + 2] ?? 0;
    const luminance = Math.round(red * 0.299 + green * 0.587 + blue * 0.114);
    data.data[index] = luminance;
    data.data[index + 1] = luminance;
    data.data[index + 2] = luminance;
    data.data[index + 3] = 255;
  }
  context.putImageData(data, 0, 0);
  return canvas;
}

function bindAttribute(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
  data: Float32Array,
) {
  const location = gl.getAttribLocation(program, name);
  if (location < 0) return null;
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  return buffer;
}

function parseHexColor(value: string) {
  const normalized = value.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized.padEnd(6, "0").slice(0, 6);
  return [
    Number.parseInt(expanded.slice(0, 2), 16) / 255,
    Number.parseInt(expanded.slice(2, 4), 16) / 255,
    Number.parseInt(expanded.slice(4, 6), 16) / 255,
  ] as const;
}

interface Ripple {
  start: number;
  centerX: number;
  centerY: number;
}

/**
 * A precomputed per-cell brightness grid for the model region, row-major and
 * 0-255. Supplying this skips the image path entirely: the texture is built at
 * mount instead of waiting on a load event, which is how the production field
 * feeds its model.
 */
export interface GlyphFieldModelData {
  cols: number;
  rows: number;
  cellBrightness: Uint8Array | number[];
}

export interface GlyphFieldOptions {
  backgroundOnly?: boolean;
  imageUrl?: string;
  modelData?: GlyphFieldModelData;
  interactive?: boolean;
  modelLayout?: "right" | "bottom";
  imageFit?: "contain" | "cover";
  backgroundColor?: string;
  color?: string;
  cursorLabel?: HTMLElement | null;
}

export function mountContentArchitectureGlyphField(
  container: HTMLElement,
  options: GlyphFieldOptions = {},
) {
  const {
    backgroundOnly = false,
    imageUrl,
    modelData,
    interactive = true,
    modelLayout = "right",
    imageFit = "contain",
    backgroundColor = "#232323",
    color = "#ffffff",
    cursorLabel,
  } = options;
  const glyphAspect = 0.55;
  const modelColumns = modelData?.cols ?? 160;
  const modelRows = modelData?.rows ?? 88;
  /*
   * Aspect of the model's source, used to size the model region. A grid states
   * it through its own cell dimensions; an image only knows it once loaded, so
   * this starts square and is corrected on load. Leaving it pinned at 1 sizes
   * a 16:9 tile as a square and covers barely half the box.
   */
  let sourceAspect = modelData ? (modelColumns * glyphAspect) / modelRows : 1;
  const phraseIndices = new Float32Array(
    Array.from(FIELD_PHRASE, (character) => {
      const index = FIELD_ATLAS.indexOf(character);
      return index < 0 ? 0 : index;
    }),
  );

  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:absolute;inset:0;display:block;width:100%;height:100%";
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return;
  container.querySelectorAll("canvas").forEach((node) => node.remove());
  container.appendChild(canvas);

  const program = createProgram(gl, phraseIndices.length, glyphAspect);
  const activateProgram = gl.useProgram.bind(gl);
  activateProgram(program);
  const positionBuffer = bindAttribute(gl, program, "position", QUAD_POSITIONS);
  const uvBuffer = bindAttribute(gl, program, "uv", QUAD_UVS);
  const atlasCanvas = createGlyphAtlas(glyphAspect);
  const atlasTexture = createTexture(gl, atlasCanvas);
  const brightnessTexture = createTexture(
    gl,
    modelData
      ? createBrightnessCanvasFromGrid(
          modelColumns,
          modelRows,
          modelData.cellBrightness,
        )
      : createBrightnessCanvas(modelColumns, modelRows),
    { linear: true },
  );

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    atlas: uniform("tAtlas"),
    color: uniform("uColor"),
    source: uniform("tSourceBrightness"),
    gridSize: uniform("uGridSize"),
    atlasGrid: uniform("uAtlasGrid"),
    modelStart: uniform("uModelStart"),
    modelSize: uniform("uModelSize"),
    uvScale: uniform("uModelUVScale"),
    uvOffset: uniform("uModelUVOffset"),
    entranceCenter: uniform("uEntranceCenter"),
    entranceStart: uniform("uEntranceStart"),
    backgroundBrightness: uniform("uBackgroundBrightness"),
    backgroundTwinkle: uniform("uBackgroundTwinkle"),
    phrase: uniform("uPhraseChars"),
    time: uniform("uTime"),
    mouse: uniform("uMouse"),
    mouseInfluence: uniform("uMouseInfluence"),
    mouseRadius: uniform("uMouseRadius"),
    rippleMaxRadius: uniform("uRippleMaxRadius"),
    rippleWidth: uniform("uRippleWidth"),
    rippleStarts: uniform("uRippleStarts"),
    rippleCenters: uniform("uRippleCenters"),
    activeRippleCount: uniform("uActiveRippleCount"),
  };
  const atlasRows = Math.ceil(FIELD_ATLAS.length / ATLAS_COLUMNS);
  const [red, green, blue] = parseHexColor(backgroundColor);
  const [glyphRed, glyphGreen, glyphBlue] = parseHexColor(color);
  gl.clearColor(red, green, blue, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform1i(uniforms.atlas, 0);
  gl.uniform1i(uniforms.source, 1);
  gl.uniform3f(uniforms.color, glyphRed, glyphGreen, glyphBlue);
  gl.uniform2f(uniforms.atlasGrid, ATLAS_COLUMNS, atlasRows);
  gl.uniform1fv(uniforms.phrase, phraseIndices);
  gl.uniform1f(uniforms.backgroundBrightness, 0.01);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, brightnessTexture);

  let cellWidth = 1;
  let cellHeight = 1;
  let columns = 8;
  let rows = 8;
  let instanceCount = 64;
  let entranceStart = Number.POSITIVE_INFINITY;
  const mouseTarget = [-999, -999];
  const mouseCurrent = [-999, -999];
  let mouseInfluenceTarget = 0;
  let mouseInfluence = 0;
  let elapsedTime = 0;
  let lastTime = performance.now();
  let visible = true;
  let documentVisible = !document.hidden;
  let reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let frame = 0;
  const ripples: Ripple[] = [];

  const resize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);

    cellHeight = 14;
    cellWidth = cellHeight * glyphAspect;
    columns = Math.max(8, Math.round(width / cellWidth));
    rows = Math.max(8, Math.round(height / cellHeight));
    cellWidth = width / columns;
    cellHeight = height / rows;
    instanceCount = columns * rows;

    let startX = 0;
    let startY = 0;
    let sizeX = 0;
    let sizeY = 0;
    let uvScaleX = 1;
    let uvScaleY = 1;
    let uvOffsetX = 0;
    let uvOffsetY = 0;
    if (!backgroundOnly && imageFit === "cover") {
      sizeX = columns;
      sizeY = rows;
      const targetAspect = (columns * glyphAspect) / rows;
      if (sourceAspect > targetAspect) {
        uvScaleX = targetAspect / sourceAspect;
        uvOffsetX = (1 - uvScaleX) / 2;
      } else {
        uvScaleY = sourceAspect / targetAspect;
        uvOffsetY = (1 - uvScaleY) / 2;
      }
    } else if (!backgroundOnly) {
      const cellsPerRow = sourceAspect / glyphAspect;
      const fittedRows = Math.min(rows, columns / cellsPerRow);
      sizeY = Math.max(1, Math.round(fittedRows));
      sizeX = Math.max(
        1,
        Math.min(columns, Math.round(fittedRows * cellsPerRow)),
      );
      if (modelLayout === "bottom") {
        startX = Math.round((columns - sizeX) / 2);
        startY = rows - sizeY;
      } else {
        startX = columns - sizeX;
        startY = Math.round((rows - sizeY) / 2);
      }
    }

    activateProgram(program);
    gl.uniform2f(uniforms.gridSize, columns, rows);
    gl.uniform2f(uniforms.modelStart, startX, startY);
    gl.uniform2f(uniforms.modelSize, sizeX, sizeY);
    gl.uniform2f(uniforms.uvScale, uvScaleX, uvScaleY);
    gl.uniform2f(uniforms.uvOffset, uvOffsetX, uvOffsetY);
    gl.uniform1f(uniforms.backgroundTwinkle, backgroundOnly ? 1 : 0);
    gl.uniform2f(
      uniforms.entranceCenter,
      backgroundOnly ? columns / 2 : startX + sizeX / 2,
      backgroundOnly ? rows / 2 : startY + sizeY / 2,
    );
    const halfWidth = columns / 2;
    gl.uniform1f(uniforms.mouseRadius, 0.35 * halfWidth);
    gl.uniform1f(uniforms.rippleMaxRadius, 1.6 * halfWidth);
    gl.uniform1f(uniforms.rippleWidth, 0.85 * halfWidth);
  };

  const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    activateProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, brightnessTexture);
    gl.uniform1f(uniforms.time, elapsedTime);
    gl.uniform1f(uniforms.entranceStart, entranceStart);
    gl.uniform2f(uniforms.mouse, mouseCurrent[0], mouseCurrent[1]);
    gl.uniform1f(uniforms.mouseInfluence, mouseInfluence);
    gl.uniform1f(uniforms.activeRippleCount, ripples.length);
    const starts = new Float32Array(RIPPLE_SLOTS).fill(-1);
    const centers = new Float32Array(RIPPLE_SLOTS * 2);
    ripples.forEach((ripple, index) => {
      starts[index] = ripple.start;
      centers[index * 2] = ripple.centerX;
      centers[index * 2 + 1] = ripple.centerY;
    });
    gl.uniform1fv(uniforms.rippleStarts, starts);
    gl.uniform2fv(uniforms.rippleCenters, centers);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, instanceCount);
  };

  const animate = (now: number) => {
    const delta = Math.min(0.05, (now - lastTime) * 0.001);
    lastTime = now;
    if (!reducedMotion) elapsedTime += delta;
    while (ripples[0] && elapsedTime - ripples[0].start >= RIPPLE_DURATION) {
      ripples.shift();
    }
    if (
      entranceStart > -1e8 &&
      entranceStart < 1e8 &&
      elapsedTime - entranceStart > 2.35
    ) {
      entranceStart = -1e9;
    }
    mouseInfluence +=
      (mouseInfluenceTarget - mouseInfluence) * (1 - Math.exp(-6 * delta));
    const mouseMix = 1 - Math.exp(-14 * delta);
    mouseCurrent[0] += (mouseTarget[0] - mouseCurrent[0]) * mouseMix;
    mouseCurrent[1] += (mouseTarget[1] - mouseCurrent[1]) * mouseMix;
    render();
    frame =
      visible && documentVisible && !reducedMotion
        ? requestAnimationFrame(animate)
        : 0;
  };

  const startAnimation = () => {
    if (visible && documentVisible && !reducedMotion && frame === 0) {
      lastTime = performance.now();
      frame = requestAnimationFrame(animate);
    } else if (!visible || !documentVisible || reducedMotion) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      render();
    }
  };

  const pointerPosition = (event: PointerEvent | MouseEvent) => {
    const rect = container.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };
  const moveCursorLabel = (x: number, y: number) => {
    if (!cursorLabel) return;
    cursorLabel.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0)`;
  };
  const onPointerMove = (event: PointerEvent) => {
    const { x, y } = pointerPosition(event);
    mouseTarget[0] = x / cellWidth;
    mouseTarget[1] = y / cellHeight;
    moveCursorLabel(x, y);
  };
  const onPointerEnter = (event: PointerEvent) => {
    const { x, y } = pointerPosition(event);
    mouseTarget[0] = x / cellWidth;
    mouseTarget[1] = y / cellHeight;
    mouseCurrent[0] = mouseTarget[0];
    mouseCurrent[1] = mouseTarget[1];
    mouseInfluenceTarget = 1;
    if (cursorLabel) cursorLabel.dataset.visible = "true";
    moveCursorLabel(x, y);
  };
  const onPointerLeave = () => {
    mouseInfluenceTarget = 0;
    if (cursorLabel) cursorLabel.dataset.visible = "false";
  };
  const onClick = (event: MouseEvent) => {
    const { x, y } = pointerPosition(event);
    ripples.push({
      start: elapsedTime,
      centerX: x / cellWidth,
      centerY: y / cellHeight,
    });
    while (ripples.length > RIPPLE_SLOTS) ripples.shift();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible && entranceStart === Number.POSITIVE_INFINITY) {
        entranceStart = reducedMotion ? -1e9 : elapsedTime;
        ripples.push({
          start: elapsedTime,
          centerX: columns / 2,
          centerY: rows / 2,
        });
      }
      startAnimation();
    },
    { threshold: 0 },
  );
  intersectionObserver.observe(container);
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const onReducedMotion = () => {
    reducedMotion = reducedMotionQuery.matches;
    if (reducedMotion) entranceStart = -1e9;
    startAnimation();
  };
  const onVisibility = () => {
    documentVisible = !document.hidden;
    startAnimation();
  };
  reducedMotionQuery.addEventListener("change", onReducedMotion);
  document.addEventListener("visibilitychange", onVisibility);
  if (interactive) {
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("click", onClick);
  }

  let image: HTMLImageElement | undefined;
  // A supplied grid wins: it is already uploaded, so no image is fetched.
  if (!backgroundOnly && !modelData && imageUrl) {
    image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => {
      if (image?.naturalWidth && image.naturalHeight) {
        sourceAspect = image.naturalWidth / image.naturalHeight;
      }
      replaceTextureImage(
        gl,
        brightnessTexture,
        createBrightnessCanvas(modelColumns, modelRows, image),
      );
      // Re-measure: the model region was sized against the placeholder aspect.
      resize();
      render();
    });
    image.src = imageUrl;
  }

  resize();
  render();
  document.fonts.ready.then(() => {
    replaceTextureImage(gl, atlasTexture, createGlyphAtlas(glyphAspect));
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.generateMipmap(gl.TEXTURE_2D);
    render();
  });
  startAnimation();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    reducedMotionQuery.removeEventListener("change", onReducedMotion);
    document.removeEventListener("visibilitychange", onVisibility);
    if (interactive) {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("click", onClick);
    }
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(uvBuffer);
    gl.deleteTexture(atlasTexture);
    gl.deleteTexture(brightnessTexture);
    gl.deleteProgram(program);
    canvas.remove();
  };
}

// biome-ignore-all lint/correctness/useHookAtTopLevel: WebGL useProgram is a GPU method, not a React hook.
import {
  cardFragmentShader,
  cardVertexShader,
  gridFragmentShader,
  gridVertexShader,
} from "./shaders";

export interface WarpedGalleryProject {
  title: string;
  image?: string;
  /** Standard browser srcset, independent of Framer image objects. */
  imageSrcSet?: string;
  video?: string;
  href?: string;
  aspectRatio?: number;
}
export interface GallerySettings {
  background: string;
  titleColor: string;
  showGrid: boolean;
  playVideos: boolean;
  mobileBreakpoint: number;
  scrollSensitivity: number;
}
type Project = WarpedGalleryProject & { aspect: number };
type Card = Project & { x: number; y: number; w: number; h: number };
type Layout = {
  width: number;
  height: number;
  small: boolean;
  rem: number;
  period: number;
  cards: Card[];
};
type Media = {
  texture: WebGLTexture;
  image: HTMLImageElement;
  video?: HTMLVideoElement;
  imageReady: boolean;
  videoReady: boolean;
  uploadedImage: boolean;
  videoAllocated: boolean;
  videoWidth: number;
  videoHeight: number;
  videoDirty: boolean;
  videoVisible: boolean;
  videoUploadFailed: boolean;
  fallbackFramePump: boolean;
  frameCallback?: number;
};
type Label = {
  texture: WebGLTexture;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};
export const galleryMechanics = {
  subdivisions: 24,
  cameraFov: 53.4,
  cameraZ: 41.18,
  desktopHeight: 0.435,
  desktopSheetT: 1.15,
  desktopDoor: -0.12,
  dent: 0.1,
  hoverRate: 13.8629,
  wheelMultiplier: 1.25,
  burstMultiplier: 2,
  burstRetention: 0.78,
  scrollRetention: 0.9,
  touchMultiplier: 3.25,
  touchInertia: 35,
  dragThreshold: 10,
  dragMultiplier: 1.5,
  dragInertia: 12,
} as const;
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const smoothstep = (lo: number, hi: number, v: number) => {
  const t = clamp((v - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
};
const wrap = (lo: number, hi: number, value: number) => {
  const period = hi - lo;
  return period ? ((((value - lo) % period) + period) % period) + lo : lo;
};
function rgb(color: string): [number, number, number] {
  const hex = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (hex) {
    const value =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    return [
      Number.parseInt(value.slice(0, 2), 16) / 255,
      Number.parseInt(value.slice(2, 4), 16) / 255,
      Number.parseInt(value.slice(4, 6), 16) / 255,
    ];
  }
  const channels = color.match(/[\d.]+/g);
  return channels && channels.length >= 3
    ? [
        Number(channels[0]) / 255,
        Number(channels[1]) / 255,
        Number(channels[2]) / 255,
      ]
    : [0, 0, 0];
}
export function galleryLayout(
  width: number,
  height: number,
  breakpoint: number,
  projects: readonly Project[],
): Layout {
  const small = width <= breakpoint;
  const rem = clamp((10 * width) / (small ? 390 : 1500), 5, 20);
  const cards: Card[] = [];
  let cursor = 0;
  for (const project of projects) {
    if (small) {
      const w = Math.max(1, width - 4 * rem),
        h = w / project.aspect;
      cards.push({ ...project, x: 2 * rem, y: cursor, w, h });
      cursor += h + 2 * rem;
    } else {
      const h = Math.min(height * galleryMechanics.desktopHeight, 55 * rem),
        w = h * project.aspect;
      cards.push({ ...project, x: cursor, y: (height - h) / 2, w, h });
      cursor += w + rem;
    }
  }
  return { width, height, small, rem, period: Math.max(1, cursor), cards };
}
function cycle(layout: Layout, card: Card, offset: number) {
  const end = layout.small ? card.y + card.h : card.x + card.w;
  const shift = wrap(-(layout.period - end), end, offset);
  return {
    x: card.x - (layout.small ? 0 : shift),
    y: card.y - (layout.small ? shift : 0),
  };
}
function depth(
  layout: Layout,
  card: Card,
  x: number,
  y: number,
  velocity: number,
  bulge: number,
) {
  const halfY =
    Math.tan((galleryMechanics.cameraFov * Math.PI) / 360) *
    galleryMechanics.cameraZ;
  const halfX = (halfY * layout.width) / layout.height;
  const wx = ((x + card.w / 2 - layout.width / 2) / (layout.width / 2)) * halfX;
  const wy =
    ((layout.height / 2 - (y + card.h / 2)) / (layout.height / 2)) * halfY;
  if (layout.small) {
    const t = clamp(wy / halfY, -1, 1);
    return bulge * (1 - t * t);
  }
  const q = (wx / halfX) * 1.15 - 0.2,
    edge = wx / halfX;
  const slope =
    (Math.PI * Math.cos(Math.PI * q) - 2 * q * Math.sin(Math.PI * q)) *
    Math.exp(-q * q);
  const roll =
    (-0.16 * slope) / Math.PI +
    (velocity > 0.001
      ? 1.8 * velocity * smoothstep(0.3, 0.9, Math.abs(edge)) * Math.sign(edge)
      : 0);
  let z =
    wy * Math.sin(roll) -
    halfX *
      0.2 *
      (1 + 1.1 * velocity) *
      Math.sin(Math.PI * q) *
      Math.exp(-q * q);
  if (velocity > 0.001)
    z += 0.2 * halfX * velocity * (1 - smoothstep(-1, 0.3, edge));
  const t = clamp(edge, -1, 1);
  z += halfX * -0.12 * t * (1.5 - 0.5 * t * t);
  return z;
}
function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WarpedGallery could not allocate a shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message ?? "WarpedGallery shader compilation failed.");
  }
  return shader;
}
function program(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const result = gl.createProgram();
  if (!result) throw new Error("WarpedGallery could not allocate a program.");
  const vs = compile(gl, gl.VERTEX_SHADER, vertex),
    fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  gl.attachShader(result, vs);
  gl.attachShader(result, fs);
  gl.linkProgram(result);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(result, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(result);
    gl.deleteProgram(result);
    throw new Error(message ?? "WarpedGallery program linking failed.");
  }
  return result;
}

/** Owns one canvas and its input/resources. Returns null when WebGL is unavailable. */
export function createGalleryRenderer(
  root: HTMLDivElement,
  canvas: HTMLCanvasElement,
  veil: HTMLDivElement,
  anchors: readonly HTMLAnchorElement[],
  projects: readonly WarpedGalleryProject[],
  settings: GallerySettings,
) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  if (!gl || !gl.getExtension("OES_standard_derivatives")) return null;
  const gpu = gl;
  const cardProgram = program(gpu, cardVertexShader, cardFragmentShader);
  const gridProgram = program(gpu, gridVertexShader, gridFragmentShader);
  const buffers: WebGLBuffer[] = [];
  function buffer(target: number, data: Float32Array | Uint16Array) {
    const value = gpu.createBuffer();
    if (!value) throw new Error("WarpedGallery could not allocate a buffer.");
    buffers.push(value);
    gpu.bindBuffer(target, value);
    gpu.bufferData(target, data, gpu.STATIC_DRAW);
    return value;
  }
  const vertices: number[] = [],
    indices: number[] = [];
  const size = galleryMechanics.subdivisions;
  for (let y = 0; y <= size; y++)
    for (let x = 0; x <= size; x++)
      vertices.push(x / size - 0.5, y / size - 0.5, x / size, y / size);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const a = y * (size + 1) + x,
        b = a + 1,
        c = a + size + 1,
        d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  const vertexBuffer = buffer(gpu.ARRAY_BUFFER, new Float32Array(vertices));
  const indexBuffer = buffer(
    gpu.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
  );
  const gridBuffer = buffer(
    gpu.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
  );
  gpu.enable(gpu.BLEND);
  gpu.blendFunc(gpu.SRC_ALPHA, gpu.ONE_MINUS_SRC_ALPHA);
  gpu.disable(gpu.DEPTH_TEST);
  const data = projects.map((p) => ({
    ...p,
    aspect: clamp(p.aspectRatio || 16 / 9, 0.25, 4),
  }));
  const hover = projects.map(() => ({ value: 0, target: 0 }));
  let layout: Layout = {
    width: 1,
    height: 1,
    small: false,
    rem: 5,
    period: 1,
    cards: [],
  };
  const scroll = { target: 0, current: 0, pending: 0, burst: 0 };
  let alive = true,
    frame = 0,
    previousFrame = 0,
    visible = true,
    initialized = false;
  let suppressClick = false,
    lastWheel = 0,
    lastFastWheel = -500;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function schedule() {
    if (alive && !frame && !document.hidden && visible)
      frame = requestAnimationFrame(draw);
  }
  function texture(alpha = false) {
    const value = gpu.createTexture();
    if (!value) throw new Error("WarpedGallery could not allocate a texture.");
    gpu.bindTexture(gpu.TEXTURE_2D, value);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_WRAP_S, gpu.CLAMP_TO_EDGE);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_WRAP_T, gpu.CLAMP_TO_EDGE);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_MIN_FILTER, gpu.LINEAR);
    gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_MAG_FILTER, gpu.LINEAR);
    gpu.texImage2D(
      gpu.TEXTURE_2D,
      0,
      alpha ? gpu.ALPHA : gpu.RGBA,
      1,
      1,
      0,
      alpha ? gpu.ALPHA : gpu.RGBA,
      gpu.UNSIGNED_BYTE,
      new Uint8Array(alpha ? [0] : [0, 0, 0, 255]),
    );
    return value;
  }
  const labels: Label[] = data.map(() => ({
    texture: texture(true),
    canvas: document.createElement("canvas"),
    width: 1,
    height: 1,
  }));
  const media: Media[] = data.map((project, index) => {
    const item: Media = {
      texture: texture(),
      image: new Image(),
      imageReady: false,
      videoReady: false,
      uploadedImage: false,
      videoAllocated: false,
      videoWidth: 0,
      videoHeight: 0,
      videoDirty: false,
      videoVisible: false,
      videoUploadFailed: false,
      fallbackFramePump: false,
    };
    function updateAspect(ratio: number) {
      if (
        alive &&
        Number.isFinite(ratio) &&
        ratio > 0 &&
        Math.abs(data[index].aspect - ratio) >= 0.001
      ) {
        data[index].aspect = clamp(ratio, 0.25, 4);
        resize();
      }
    }
    item.image.crossOrigin = "anonymous";
    item.image.decoding = "async";
    item.image.onload = () => {
      item.imageReady = true;
      if (item.image.naturalHeight)
        updateAspect(item.image.naturalWidth / item.image.naturalHeight);
      schedule();
    };
    item.image.onerror = schedule;
    if (project.imageSrcSet) {
      item.image.srcset = project.imageSrcSet;
      item.image.sizes = `(max-width: ${settings.mobileBreakpoint}px) 100vw, 50vw`;
    }
    if (project.image) item.image.src = project.image;
    if (settings.playVideos && project.video) {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.poster = project.image ?? "";
      video.oncanplay = () => {
        item.videoReady = true;
        item.videoDirty = true;
        schedule();
      };
      video.onloadedmetadata = () => {
        if (video.videoHeight)
          updateAspect(video.videoWidth / video.videoHeight);
      };
      video.src = project.video;
      item.video = video;
      video.load();
    }
    return item;
  });
  function upload(item: Media) {
    gpu.bindTexture(gpu.TEXTURE_2D, item.texture);
    gpu.pixelStorei(gpu.UNPACK_FLIP_Y_WEBGL, 1);
    const video = item.video;
    const useVideo = !!(
      video &&
      item.videoReady &&
      !item.videoUploadFailed &&
      video.readyState >= 2 &&
      (item.videoDirty || !item.videoAllocated)
    );
    try {
      if (useVideo && video) {
        if (
          item.videoAllocated &&
          item.videoWidth === video.videoWidth &&
          item.videoHeight === video.videoHeight
        )
          gpu.texSubImage2D(
            gpu.TEXTURE_2D,
            0,
            0,
            0,
            gpu.RGBA,
            gpu.UNSIGNED_BYTE,
            video,
          );
        else {
          gpu.texImage2D(
            gpu.TEXTURE_2D,
            0,
            gpu.RGBA,
            gpu.RGBA,
            gpu.UNSIGNED_BYTE,
            video,
          );
          item.videoAllocated = true;
          item.videoWidth = video.videoWidth;
          item.videoHeight = video.videoHeight;
        }
        item.videoDirty = false;
      } else if (item.imageReady && !item.uploadedImage) {
        gpu.texImage2D(
          gpu.TEXTURE_2D,
          0,
          gpu.RGBA,
          gpu.RGBA,
          gpu.UNSIGNED_BYTE,
          item.image,
        );
        item.uploadedImage = true;
      }
    } catch {
      if (useVideo) {
        item.videoDirty = false;
        item.videoUploadFailed = true;
        video?.pause();
      }
      if (item.imageReady && !item.uploadedImage) {
        try {
          gpu.texImage2D(
            gpu.TEXTURE_2D,
            0,
            gpu.RGBA,
            gpu.RGBA,
            gpu.UNSIGNED_BYTE,
            item.image,
          );
        } catch {
          /* Cross-origin posters cannot be uploaded to WebGL. */
        }
        item.uploadedImage = true;
      }
    }
  }
  function rasterizeLabels(scale: number) {
    layout.cards.forEach((card, index) => {
      const label = labels[index],
        context = label.canvas.getContext("2d");
      if (!context) return;
      const inset = (layout.small ? 1 : 2) * layout.rem,
        fontSize = (layout.small ? 1.6 : 1.8) * layout.rem;
      const font = `400 ${fontSize}px "WarpedGalleryInter", "InterVariable", "Inter", Arial, sans-serif`,
        spacing = -0.05 * fontSize;
      context.font = font;
      const chars = Array.from(card.title);
      const measured = chars.reduce(
        (sum, char, i) =>
          sum + context.measureText(char).width + (i ? spacing : 0),
        0,
      );
      const width = Math.max(
        1,
        Math.min(
          Math.max(1, card.w - inset * 2 - 2.5 * layout.rem - layout.rem),
          measured + 3,
        ),
      );
      const height = Math.max(1, fontSize * 1.4),
        ratio = Math.max(1, Math.min(2, scale, 1024 / width));
      label.canvas.width = Math.max(1, Math.ceil(width * ratio));
      label.canvas.height = Math.max(1, Math.ceil(height * ratio));
      context.scale(ratio, ratio);
      context.clearRect(0, 0, width, height);
      context.font = font;
      context.textBaseline = "alphabetic";
      context.fillStyle = "#ffffff";
      let x = 1;
      for (const char of chars) {
        context.fillText(char, x, fontSize * 1.05);
        x += context.measureText(char).width + spacing;
        if (x > width) break;
      }
      gpu.activeTexture(gpu.TEXTURE1);
      gpu.bindTexture(gpu.TEXTURE_2D, label.texture);
      gpu.pixelStorei(gpu.UNPACK_FLIP_Y_WEBGL, 1);
      gpu.texImage2D(
        gpu.TEXTURE_2D,
        0,
        gpu.ALPHA,
        gpu.ALPHA,
        gpu.UNSIGNED_BYTE,
        label.canvas,
      );
      label.width = width;
      label.height = height;
    });
  }
  function resolutionScale() {
    return Math.min(
      2,
      window.devicePixelRatio || 1,
      Math.sqrt(4e6 / (layout.width * layout.height)),
    );
  }
  function resize() {
    const rect = root.getBoundingClientRect(),
      width = Math.max(1, rect.width),
      height = Math.max(1, rect.height);
    const old = layout;
    layout = galleryLayout(width, height, settings.mobileBreakpoint, data);
    const scale = resolutionScale(),
      w = Math.max(1, Math.round(width * scale)),
      h = Math.max(1, Math.round(height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gpu.viewport(0, 0, w, h);
    if (!initialized) {
      const card = layout.cards[Math.min(1, layout.cards.length - 1)];
      scroll.target = scroll.current = card
        ? layout.small
          ? card.y + card.h / 2 - height / 2
          : card.x + card.w / 2 - width / 2
        : 0;
      initialized = true;
    } else {
      const ratio = layout.period / old.period;
      scroll.target *= ratio;
      scroll.current *= ratio;
    }
    veil.style.display = layout.small ? "block" : "none";
    layout.cards.forEach((card, index) => {
      const anchor = anchors[index];
      if (!anchor) return;
      Object.assign(anchor.style, {
        left: `${card.x}px`,
        top: `${card.y}px`,
        width: `${card.w}px`,
        height: `${card.h}px`,
        borderRadius: `${(layout.small ? 1.5 : 2) * layout.rem}px`,
      });
    });
    rasterizeLabels(scale);
    schedule();
  }
  function scrollBy(delta: number) {
    scroll.target += delta * settings.scrollSensitivity;
    if (!layout.small)
      scroll.target =
        scroll.current +
        Math.tanh((scroll.target - scroll.current) / layout.width) *
          layout.width;
    schedule();
  }
  function cancelVideo(item: Media) {
    if (item.frameCallback !== undefined)
      item.video?.cancelVideoFrameCallback?.(item.frameCallback);
    item.frameCallback = undefined;
    item.fallbackFramePump = false;
  }
  function pumpVideo(item: Media) {
    const video = item.video;
    if (
      !video ||
      item.frameCallback !== undefined ||
      !item.videoVisible ||
      video.paused
    )
      return;
    if (typeof video.requestVideoFrameCallback === "function")
      item.frameCallback = video.requestVideoFrameCallback(() => {
        item.frameCallback = undefined;
        if (alive && item.videoVisible && !document.hidden && visible) {
          item.videoDirty = true;
          schedule();
          pumpVideo(item);
        }
      });
    else {
      item.fallbackFramePump = true;
      schedule();
    }
  }
  function pauseVideos() {
    for (const item of media) {
      item.videoVisible = false;
      cancelVideo(item);
      item.video?.pause();
    }
  }
  function visibilityChange() {
    if (document.hidden) pauseVideos();
    else schedule();
  }
  const one = (p: WebGLProgram, name: string, value: number) =>
    gpu.uniform1f(gpu.getUniformLocation(p, name), value);
  const two = (p: WebGLProgram, name: string, x: number, y: number) =>
    gpu.uniform2f(gpu.getUniformLocation(p, name), x, y);
  const four = (
    p: WebGLProgram,
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
  ) => gpu.uniform4f(gpu.getUniformLocation(p, name), x, y, z, w);
  function draw(timestamp: number) {
    frame = 0;
    if (!alive) return;
    const units = previousFrame ? (timestamp - previousFrame) / (1000 / 60) : 1;
    const dt = Math.min(
      (timestamp - (previousFrame || timestamp)) / 1000,
      0.05,
    );
    previousFrame = timestamp;
    if (scroll.burst) {
      const released =
        scroll.burst *
        (1 - galleryMechanics.burstRetention ** Math.min(units || 0, 4));
      scroll.pending += released;
      scroll.burst -= released;
      if (Math.abs(scroll.burst) < 0.05) {
        scroll.pending += scroll.burst;
        scroll.burst = 0;
      }
    }
    if (scroll.pending) {
      const input = scroll.pending;
      scroll.pending = 0;
      scrollBy(input);
    }
    scroll.current = reducedMotion.matches
      ? scroll.target
      : Math.round(
          (scroll.current +
            (scroll.target - scroll.current) *
              (1 - galleryMechanics.scrollRetention ** Math.min(units, 2))) *
            100,
        ) / 100;
    const lag = scroll.target - scroll.current,
      c = Math.tanh(lag / (layout.small ? 245 : 550));
    const velocity = reducedMotion.matches
      ? 0
      : Math.min(1, Math.abs(c * Math.abs(c)));
    const halfY =
        Math.tan((galleryMechanics.cameraFov * Math.PI) / 360) *
        galleryMechanics.cameraZ,
      halfX = (halfY * layout.width) / layout.height;
    const p = Math.tanh(lag / 500),
      bulge =
        layout.small && !reducedMotion.matches
          ? p * Math.abs(p) * 0.22 * halfY * 1.3
          : 0;
    let hovering = false;
    for (const h of hover) {
      h.value = reducedMotion.matches
        ? h.target
        : h.value +
          (h.target - h.value) *
            (1 - Math.exp(-galleryMechanics.hoverRate * Math.max(0, dt)));
      if (Math.abs(h.target - h.value) < 0.0005) h.value = h.target;
      else hovering = true;
    }
    for (const item of media)
      if (
        item.fallbackFramePump &&
        item.videoVisible &&
        item.video &&
        !item.video.paused
      )
        item.videoDirty = true;
    const [r, g, b] = rgb(settings.background);
    gpu.clearColor(r, g, b, 1);
    gpu.clear(gpu.COLOR_BUFFER_BIT);
    if (settings.showGrid && !layout.small && layout.cards.length) {
      gpu.useProgram(gridProgram);
      gpu.bindBuffer(gpu.ARRAY_BUFFER, gridBuffer);
      const position = gpu.getAttribLocation(gridProgram, "a_position");
      gpu.enableVertexAttribArray(position);
      gpu.vertexAttribPointer(position, 2, gpu.FLOAT, false, 0, 0);
      one(gridProgram, "u_aspect", layout.width / layout.height);
      one(
        gridProgram,
        "u_horizon",
        clamp(
          (layout.cards[0].y + layout.cards[0].h) / layout.height + 0.03,
          0,
          0.95,
        ),
      );
      gpu.uniform3f(
        gpu.getUniformLocation(gridProgram, "u_color"),
        0.08,
        0.08,
        0.085,
      );
      gpu.drawArrays(gpu.TRIANGLES, 0, 3);
    }
    gpu.useProgram(cardProgram);
    gpu.bindBuffer(gpu.ARRAY_BUFFER, vertexBuffer);
    gpu.bindBuffer(gpu.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const position = gpu.getAttribLocation(cardProgram, "a_position"),
      uv = gpu.getAttribLocation(cardProgram, "a_uv");
    gpu.enableVertexAttribArray(position);
    gpu.enableVertexAttribArray(uv);
    gpu.vertexAttribPointer(position, 2, gpu.FLOAT, false, 16, 0);
    gpu.vertexAttribPointer(uv, 2, gpu.FLOAT, false, 16, 8);
    two(cardProgram, "u_half", halfX, halfY);
    one(cardProgram, "u_cameraZ", galleryMechanics.cameraZ);
    one(
      cardProgram,
      "u_sheetD",
      layout.small ? 0 : halfX * 0.2 * (1 + 1.1 * velocity),
    );
    one(cardProgram, "u_sheetT", layout.small ? 1 : 1.15);
    one(cardProgram, "u_sheetC", Number(!layout.small));
    one(cardProgram, "u_sheetV", velocity);
    one(cardProgram, "u_door", layout.small ? 0 : -0.12);
    one(cardProgram, "u_dent", galleryMechanics.dent);
    one(cardProgram, "u_mobileBulge", bulge);
    one(cardProgram, "u_scrim", 1);
    gpu.uniform1i(gpu.getUniformLocation(cardProgram, "u_texture"), 0);
    gpu.uniform1i(gpu.getUniformLocation(cardProgram, "u_labelTexture"), 1);
    gpu.uniform3f(
      gpu.getUniformLocation(cardProgram, "u_titleColor"),
      ...rgb(settings.titleColor),
    );
    const shown = layout.cards
      .map((card, index) => {
        const pos = cycle(layout, card, scroll.current);
        return {
          card,
          index,
          pos,
          z: depth(layout, card, pos.x, pos.y, velocity, bulge),
        };
      })
      .filter(({ card, pos }) => {
        const overscan =
          (layout.small ? layout.height : layout.width) *
          (layout.small ? 0.25 : 0.5);
        return layout.small
          ? pos.y + card.h > -overscan && pos.y < layout.height + overscan
          : pos.x + card.w > -overscan && pos.x < layout.width + overscan;
      })
      .sort((a, b) => a.z - b.z);
    const onScreen = new Set(
      shown
        .filter(({ card, pos }) =>
          layout.small
            ? pos.y + card.h > 0 && pos.y < layout.height
            : pos.x + card.w > 0 && pos.x < layout.width,
        )
        .map((entry) => entry.index),
    );
    media.forEach((item, index) => {
      const video = item.video;
      if (!video) return;
      item.videoVisible =
        !reducedMotion.matches &&
        !item.videoUploadFailed &&
        visible &&
        !document.hidden &&
        onScreen.has(index);
      if (item.videoVisible) {
        if (video.paused)
          void video
            .play()
            .then(() => {
              if (item.videoVisible) pumpVideo(item);
            })
            .catch(() => {});
        else pumpVideo(item);
      } else {
        cancelVideo(item);
        video.pause();
      }
    });
    for (const { card, index, pos } of shown) {
      two(
        cardProgram,
        "u_center",
        ((pos.x + card.w / 2 - layout.width / 2) / (layout.width / 2)) * halfX,
        ((layout.height / 2 - (pos.y + card.h / 2)) / (layout.height / 2)) *
          halfY,
      );
      two(
        cardProgram,
        "u_res",
        (card.w / layout.width) * halfX * 2,
        (card.h / layout.height) * halfY * 2,
      );
      one(cardProgram, "u_hover", hover[index].value);
      one(cardProgram, "u_arrowHover", hover[index].value);
      one(
        cardProgram,
        "u_corner",
        ((layout.small ? 1.5 : 2) * layout.rem) / card.h,
      );
      const inset = (layout.small ? 1 : 2) * layout.rem,
        arrow = 2.5 * layout.rem,
        label = labels[index];
      four(
        cardProgram,
        "u_labelRect",
        inset / card.w,
        layout.rem / card.h,
        label.width / card.w,
        label.height / card.h,
      );
      four(
        cardProgram,
        "u_arrowRect",
        (card.w - inset - arrow) / card.w,
        layout.rem / card.h,
        arrow / card.w,
        arrow / card.h,
      );
      gpu.activeTexture(gpu.TEXTURE0);
      upload(media[index]);
      gpu.bindTexture(gpu.TEXTURE_2D, media[index].texture);
      gpu.activeTexture(gpu.TEXTURE1);
      gpu.bindTexture(gpu.TEXTURE_2D, label.texture);
      gpu.drawElements(gpu.TRIANGLES, indices.length, gpu.UNSIGNED_SHORT, 0);
    }
    layout.cards.forEach((card, index) => {
      const pos = cycle(layout, card, scroll.current);
      if (anchors[index])
        anchors[index].style.transform = layout.small
          ? `translate3d(0px, ${pos.y - card.y}px, 0px)`
          : `translate3d(${pos.x - card.x}px, 0px, 0px)`;
    });
    if (
      Math.abs(scroll.target - scroll.current) >= 0.02 ||
      Math.abs(scroll.burst) >= 0.05 ||
      Math.abs(scroll.pending) >= 0.01 ||
      hovering ||
      media.some(
        (item) =>
          item.fallbackFramePump &&
          item.videoVisible &&
          item.video &&
          !item.video.paused,
      )
    )
      schedule();
    else previousFrame = 0;
  }
  function wheel(e: WheelEvent) {
    if (e.ctrlKey) return;
    e.preventDefault();
    const delta =
        e.deltaY *
        (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? layout.height : 1),
      interval = e.timeStamp - lastWheel;
    if (interval < 30) lastFastWheel = e.timeStamp;
    const burst =
      Math.abs(delta) >= 40 &&
      interval >= 30 &&
      e.timeStamp - lastFastWheel >= 500;
    lastWheel = e.timeStamp;
    if (burst)
      scroll.burst +=
        delta *
        galleryMechanics.wheelMultiplier *
        galleryMechanics.burstMultiplier;
    else scroll.pending += delta * galleryMechanics.wheelMultiplier;
    schedule();
  }
  let touchY = 0,
    touchDelta = 0,
    touchTravel = 0;
  function touchStart(e: TouchEvent) {
    touchY = e.targetTouches[0]?.clientY ?? 0;
    touchDelta = touchTravel = 0;
  }
  function touchMove(e: TouchEvent) {
    const y = e.targetTouches[0]?.clientY ?? touchY;
    touchDelta = touchY - y;
    touchY = y;
    touchTravel += Math.abs(touchDelta);
    if (touchTravel > 10) suppressClick = true;
    if (touchDelta) {
      e.preventDefault();
      scrollBy(touchDelta * galleryMechanics.touchMultiplier);
    }
  }
  function touchEnd() {
    if (touchDelta) scrollBy(touchDelta * galleryMechanics.touchInertia);
    touchDelta = 0;
  }
  let pointerActive = false,
    dragging = false,
    startX = 0,
    startY = 0,
    pointerAxis = 0,
    dragDelta = 0,
    lastDrag = 0;
  const axis = (e: PointerEvent) => (layout.small ? e.clientY : e.clientX);
  function endPointer(e: PointerEvent | null, inertia: boolean) {
    if (!pointerActive) return;
    pointerActive = false;
    if (dragging) {
      dragging = false;
      root.style.cursor = "grab";
      delete root.dataset.dragging;
      if (inertia && e && dragDelta && e.timeStamp - lastDrag < 100)
        scrollBy(dragDelta * galleryMechanics.dragInertia);
    }
    dragDelta = 0;
    window.removeEventListener("pointermove", pointerMove);
    window.removeEventListener("pointerup", pointerUp);
    window.removeEventListener("pointercancel", pointerCancel);
  }
  function pointerMove(e: PointerEvent) {
    if (!pointerActive) return;
    if (!dragging) {
      const along = layout.small
          ? Math.abs(e.clientY - startY)
          : Math.abs(e.clientX - startX),
        across = layout.small
          ? Math.abs(e.clientX - startX)
          : Math.abs(e.clientY - startY);
      if (along <= galleryMechanics.dragThreshold || along <= across) return;
      dragging = true;
      suppressClick = true;
      root.style.cursor = "grabbing";
      root.dataset.dragging = "true";
      pointerAxis = axis(e);
    }
    e.preventDefault();
    const next = axis(e);
    dragDelta = (pointerAxis - next) * galleryMechanics.dragMultiplier;
    pointerAxis = next;
    lastDrag = e.timeStamp;
    if (dragDelta) scrollBy(dragDelta);
  }
  function pointerUp(e: PointerEvent) {
    endPointer(e, true);
  }
  function pointerCancel(e: PointerEvent) {
    endPointer(e, false);
  }
  function pointerDown(e: PointerEvent) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    pointerActive = true;
    dragging = false;
    startX = e.clientX;
    startY = e.clientY;
    dragDelta = 0;
    window.addEventListener("pointermove", pointerMove, { passive: false });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerCancel);
  }
  function keyDown(e: KeyboardEvent) {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      (e.shiftKey && e.key !== " ") ||
      (e.target !== root &&
        e.target instanceof HTMLElement &&
        /^(input|textarea|select|button|a|summary|audio|video)$/i.test(
          e.target.tagName,
        ))
    )
      return;
    let delta = 0;
    if (e.key === "ArrowDown") delta = 100;
    else if (e.key === "ArrowUp") delta = -100;
    else if (e.key === "PageDown") delta = layout.height * 0.9;
    else if (e.key === "PageUp") delta = -layout.height * 0.9;
    else if (e.key === " ") delta = layout.height * 0.9 * (e.shiftKey ? -1 : 1);
    else return;
    e.preventDefault();
    scrollBy(delta);
  }
  function click(e: MouseEvent) {
    if (suppressClick) {
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    }
  }
  const anchorCleanups = anchors.map((anchor, index) => {
    function enter(e: PointerEvent) {
      if (e.pointerType === "mouse") {
        hover[index].target = 1;
        schedule();
      }
    }
    function focus() {
      hover[index].target = 1;
      schedule();
    }
    function leave() {
      hover[index].target = 0;
      schedule();
    }
    anchor.addEventListener("pointerenter", enter);
    anchor.addEventListener("pointerleave", leave);
    anchor.addEventListener("focus", focus);
    anchor.addEventListener("blur", leave);
    return () => {
      anchor.removeEventListener("pointerenter", enter);
      anchor.removeEventListener("pointerleave", leave);
      anchor.removeEventListener("focus", focus);
      anchor.removeEventListener("blur", leave);
    };
  });
  root.addEventListener("wheel", wheel, { passive: false });
  root.addEventListener("touchstart", touchStart, { passive: true });
  root.addEventListener("touchmove", touchMove, { passive: false });
  root.addEventListener("touchend", touchEnd);
  root.addEventListener("touchcancel", touchEnd);
  root.addEventListener("pointerdown", pointerDown);
  root.addEventListener("keydown", keyDown);
  root.addEventListener("click", click, true);
  document.addEventListener("visibilitychange", visibilityChange);
  reducedMotion.addEventListener("change", schedule);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  resize();
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
    if (visible) schedule();
    else pauseVideos();
  });
  intersection.observe(root);
  void document.fonts?.load('400 18px "WarpedGalleryInter"').then(() => {
    if (alive) {
      rasterizeLabels(resolutionScale());
      schedule();
    }
  });
  schedule();
  return {
    dispose() {
      alive = false;
      cancelAnimationFrame(frame);
      endPointer(null, false);
      resizeObserver.disconnect();
      intersection.disconnect();
      pauseVideos();
      root.removeEventListener("wheel", wheel);
      root.removeEventListener("touchstart", touchStart);
      root.removeEventListener("touchmove", touchMove);
      root.removeEventListener("touchend", touchEnd);
      root.removeEventListener("touchcancel", touchEnd);
      root.removeEventListener("pointerdown", pointerDown);
      root.removeEventListener("keydown", keyDown);
      root.removeEventListener("click", click, true);
      document.removeEventListener("visibilitychange", visibilityChange);
      reducedMotion.removeEventListener("change", schedule);
      anchorCleanups.forEach((cleanup) => cleanup());
      media.forEach((item) => {
        item.image.onload = item.image.onerror = null;
        if (item.video) {
          item.video.oncanplay = item.video.onloadedmetadata = null;
          item.video.removeAttribute("src");
          item.video.load();
        }
        gpu.deleteTexture(item.texture);
      });
      labels.forEach((label) => gpu.deleteTexture(label.texture));
      buffers.forEach((value) => gpu.deleteBuffer(value));
      gpu.deleteProgram(cardProgram);
      gpu.deleteProgram(gridProgram);
      delete root.dataset.dragging;
      root.style.cursor = "grab";
    },
  };
}

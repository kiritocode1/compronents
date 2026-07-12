"use client";

/**
 * Shader Grid Gallery - an infinite, draggable grid of framed images rendered
 * entirely in one fragment shader. A single full-screen plane tiles the projects
 * into cells with borders, captions, and a lens-warped vignette; dragging pans
 * the field with inertia and eases in a slight zoom, the cell under the pointer
 * lifts, and a click that does not drag selects that project. Three.js, image
 * and text atlases built on the fly.
 *
 * Fills its container, so it fits a bounded stage or a full-viewport slot.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ASSET_BASE = "https://ui.aryank.space/assets/shader-grid-gallery";

export interface ShaderGridProject {
  title: string;
  year: number;
  image: string;
  href?: string;
}

export interface ShaderGridGalleryProps {
  projects?: ShaderGridProject[];
  onSelect?: (project: ShaderGridProject) => void;
  className?: string;
}

const TITLES: Array<[string, number]> = [
  ["Motion Study", 2024],
  ["Idle Form", 2023],
  ["Blur Signal", 2024],
  ["Still Drift", 2023],
  ["Tidewalk", 2024],
  ["Core Motion", 2022],
  ["White Bloom", 2024],
  ["Backrun", 2023],
  ["Rushline", 2024],
  ["Afterimage", 2023],
  ["Shadowhead", 2022],
  ["Opal Lace", 2024],
  ["Glassprint", 2024],
  ["Redshift", 2023],
  ["White Noise", 2023],
  ["Twin Field", 2024],
  ["Petalloop", 2023],
  ["Ghostwalk", 2024],
  ["Heatwave", 2023],
  ["Sky Drift", 2024],
  ["Spindle", 2022],
  ["Pacer", 2023],
  ["Stride", 2024],
  ["Cryo Pulse", 2022],
  ["Velvet Blur", 2024],
];

const DEFAULT_PROJECTS: ShaderGridProject[] = TITLES.map(
  ([title, year], i) => ({
    title,
    year,
    image: `${ASSET_BASE}/img${i + 1}.jpeg`,
  }),
);

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec2 uOffset;
  uniform vec2 uResolution;
  uniform vec4 uBorderColor;
  uniform vec4 uHoverColor;
  uniform vec4 uBackgroundColor;
  uniform vec2 uMousePos;
  uniform float uZoom;
  uniform float uCellSize;
  uniform float uTextureCount;
  uniform sampler2D uImageAtlas;
  uniform sampler2D uTextAtlas;
  varying vec2 vUv;

  void main() {
    vec2 screenUV = (vUv - 0.5) * 2.0;
    float radius = length(screenUV);
    float distortion = 1.0 - 0.08 * radius * radius;
    vec2 distortedUV = screenUV * distortion;
    vec2 aspectRatio = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 worldCoord = distortedUV * aspectRatio;
    worldCoord *= uZoom;
    worldCoord += uOffset;

    vec2 cellPos = worldCoord / uCellSize;
    vec2 cellId = floor(cellPos);
    vec2 cellUV = fract(cellPos);

    vec2 mouseScreenUV = (uMousePos / uResolution) * 2.0 - 1.0;
    mouseScreenUV.y = -mouseScreenUV.y;
    float mouseRadius = length(mouseScreenUV);
    float mouseDistortion = 1.0 - 0.08 * mouseRadius * mouseRadius;
    vec2 mouseDistortedUV = mouseScreenUV * mouseDistortion;
    vec2 mouseWorldCoord = mouseDistortedUV * aspectRatio;
    mouseWorldCoord *= uZoom;
    mouseWorldCoord += uOffset;
    vec2 mouseCellPos = mouseWorldCoord / uCellSize;
    vec2 mouseCellId = floor(mouseCellPos);

    vec2 cellCenter = cellId + 0.5;
    vec2 mouseCellCenter = mouseCellId + 0.5;
    float cellDistance = length(cellCenter - mouseCellCenter);
    float hoverIntensity = 1.0 - smoothstep(0.4, 0.7, cellDistance);
    bool isHovered = hoverIntensity > 0.0 && uMousePos.x >= 0.0;

    vec3 backgroundColor = uBackgroundColor.rgb;
    if (isHovered) {
      backgroundColor = mix(uBackgroundColor.rgb, uHoverColor.rgb, hoverIntensity * uHoverColor.a);
    }

    float lineWidth = 0.005;
    float gridX = smoothstep(0.0, lineWidth, cellUV.x) * smoothstep(0.0, lineWidth, 1.0 - cellUV.x);
    float gridY = smoothstep(0.0, lineWidth, cellUV.y) * smoothstep(0.0, lineWidth, 1.0 - cellUV.y);
    float gridMask = gridX * gridY;

    float imageSize = 0.6;
    float imageBorder = (1.0 - imageSize) * 0.5;
    vec2 imageUV = (cellUV - imageBorder) / imageSize;
    float edgeSmooth = 0.01;
    vec2 imageMask = smoothstep(-edgeSmooth, edgeSmooth, imageUV) *
                    smoothstep(-edgeSmooth, edgeSmooth, 1.0 - imageUV);
    float imageAlpha = imageMask.x * imageMask.y;
    bool inImageArea = imageUV.x >= 0.0 && imageUV.x <= 1.0 && imageUV.y >= 0.0 && imageUV.y <= 1.0;

    float textHeight = 0.08;
    float textY = 0.88;
    bool inTextArea = cellUV.x >= 0.05 && cellUV.x <= 0.95 && cellUV.y >= textY && cellUV.y <= (textY + textHeight);

    float texIndex = mod(cellId.x + cellId.y * 3.0, uTextureCount);
    vec3 color = backgroundColor;

    if (inImageArea && imageAlpha > 0.0) {
      float atlasSize = ceil(sqrt(uTextureCount));
      vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
      vec2 atlasUV = (atlasPos + imageUV) / atlasSize;
      atlasUV.y = 1.0 - atlasUV.y;
      vec3 imageColor = texture2D(uImageAtlas, atlasUV).rgb;
      color = mix(color, imageColor, imageAlpha);
    }

    if (inTextArea) {
      vec2 textCoord = vec2((cellUV.x - 0.05) / 0.9, (cellUV.y - textY) / textHeight);
      textCoord.y = 1.0 - textCoord.y;
      float atlasSize = ceil(sqrt(uTextureCount));
      vec2 atlasPos = vec2(mod(texIndex, atlasSize), floor(texIndex / atlasSize));
      vec2 atlasUV = (atlasPos + textCoord) / atlasSize;
      vec4 textColor = texture2D(uTextAtlas, atlasUV);
      color = mix(backgroundColor, textColor.rgb, textColor.a);
    }

    vec3 borderRGB = uBorderColor.rgb;
    float borderAlpha = uBorderColor.a;
    color = mix(color, borderRGB, (1.0 - gridMask) * borderAlpha);

    float fade = 1.0 - smoothstep(1.2, 1.8, radius);
    gl_FragColor = vec4(color * fade, 1.0);
  }
`;

const rgbaToArray = (rgba: string): [number, number, number, number] => {
  const match = rgba.match(/rgba?\(([^)]+)\)/);
  if (!match) return [1, 1, 1, 1];
  const parts = match[1]
    .split(",")
    .map((v, i) =>
      i < 3
        ? Number.parseFloat(v.trim()) / 255
        : Number.parseFloat(v.trim() || "1"),
    );
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
};

export default function ShaderGridGallery({
  projects = DEFAULT_PROJECTS,
  onSelect,
  className,
}: ShaderGridGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    const config = {
      cellSize: 0.75,
      zoomLevel: 1.25,
      lerpFactor: 0.075,
      borderColor: "rgba(255, 255, 255, 0.15)",
      backgroundColor: "rgba(0, 0, 0, 1)",
      textColor: "rgba(128, 128, 128, 1)",
      hoverColor: "rgba(255, 255, 255, 0)",
    };

    let disposed = false;
    let rafId = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let plane: THREE.Mesh | undefined;
    const cleanups: Array<() => void> = [];

    let isDragging = false;
    let isClick = true;
    let clickStartTime = 0;
    const previousMouse = { x: 0, y: 0 };
    const offset = { x: 0, y: 0 };
    const targetOffset = { x: 0, y: 0 };
    const mousePosition = { x: -1, y: -1 };
    let zoomLevel = 1.0;
    let targetZoom = 1.0;
    const textTextures: THREE.CanvasTexture[] = [];

    const createTextTexture = (title: string, year: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);
      ctx.clearRect(0, 0, 2048, 256);
      ctx.font = '80px "IBM Plex Mono", monospace';
      ctx.fillStyle = config.textColor;
      ctx.textBaseline = "middle";
      ctx.imageSmoothingEnabled = false;
      ctx.textAlign = "left";
      ctx.fillText(title.toUpperCase(), 30, 128);
      ctx.textAlign = "right";
      ctx.fillText(String(year).toUpperCase(), 2048 - 30, 128);
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.flipY = false;
      texture.generateMipmaps = false;
      return texture;
    };

    const createTextureAtlas = (textures: THREE.Texture[], isText: boolean) => {
      const atlasSize = Math.ceil(Math.sqrt(textures.length));
      const textureSize = 512;
      const canvas = document.createElement("canvas");
      canvas.width = atlasSize * textureSize;
      canvas.height = atlasSize * textureSize;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (isText) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        textures.forEach((texture, index) => {
          const x = (index % atlasSize) * textureSize;
          const y = Math.floor(index / atlasSize) * textureSize;
          const canvasData = texture.source?.data as
            | CanvasImageSource
            | undefined;
          const imageData = texture.image as
            | (CanvasImageSource & { complete?: boolean })
            | undefined;
          if (isText && canvasData) {
            ctx.drawImage(canvasData, x, y, textureSize, textureSize);
          } else if (!isText && imageData?.complete) {
            ctx.drawImage(imageData, x, y, textureSize, textureSize);
          }
        });
      }
      const atlasTexture = new THREE.CanvasTexture(canvas);
      atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
      atlasTexture.wrapT = THREE.ClampToEdgeWrapping;
      atlasTexture.minFilter = THREE.LinearFilter;
      atlasTexture.magFilter = THREE.LinearFilter;
      atlasTexture.flipY = false;
      return atlasTexture;
    };

    const loadTextures = () => {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      const imageTextures: THREE.Texture[] = [];
      let loadedCount = 0;
      return new Promise<THREE.Texture[]>((resolve) => {
        for (const project of projects) {
          const texture = loader.load(project.image, () => {
            if (++loadedCount === projects.length) resolve(imageTextures);
          });
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          imageTextures.push(texture);
          textTextures.push(createTextTexture(project.title, project.year));
        }
      });
    };

    const startDrag = (x: number, y: number) => {
      isDragging = true;
      isClick = true;
      clickStartTime = Date.now();
      container.classList.add("sgg-dragging");
      previousMouse.x = x;
      previousMouse.y = y;
      window.setTimeout(() => {
        if (isDragging) targetZoom = config.zoomLevel;
      }, 150);
    };

    const handleMove = (currentX: number, currentY: number) => {
      if (!isDragging) return;
      const deltaX = currentX - previousMouse.x;
      const deltaY = currentY - previousMouse.y;
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        isClick = false;
        if (targetZoom === 1.0) targetZoom = config.zoomLevel;
      }
      targetOffset.x -= deltaX * 0.003;
      targetOffset.y += deltaY * 0.003;
      previousMouse.x = currentX;
      previousMouse.y = currentY;
    };

    const endDrag = (endX?: number, endY?: number) => {
      const wasClick = isClick && Date.now() - clickStartTime < 200;
      isDragging = false;
      container.classList.remove("sgg-dragging");
      targetZoom = 1.0;
      if (wasClick && endX !== undefined && endY !== undefined && renderer) {
        const rect = renderer.domElement.getBoundingClientRect();
        const screenX = ((endX - rect.left) / rect.width) * 2 - 1;
        const screenY = -(((endY - rect.top) / rect.height) * 2 - 1);
        const radius = Math.sqrt(screenX * screenX + screenY * screenY);
        const distortion = 1.0 - 0.08 * radius * radius;
        const worldX =
          screenX * distortion * (rect.width / rect.height) * zoomLevel +
          offset.x;
        const worldY = screenY * distortion * zoomLevel + offset.y;
        const cellX = Math.floor(worldX / config.cellSize);
        const cellY = Math.floor(worldY / config.cellSize);
        const texIndex = Math.floor((cellX + cellY * 3.0) % projects.length);
        const actualIndex =
          texIndex < 0 ? projects.length + texIndex : texIndex;
        const project = projects[actualIndex];
        if (project) onSelectRef.current?.(project);
      }
    };

    const onPointerDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY);
    const onPointerMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onPointerUp = (e: MouseEvent) => endDrag(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches?.[0];
      endDrag(t?.clientX, t?.clientY);
    };
    const onContextMenu = (e: Event) => e.preventDefault();

    const updateMousePosition = (event: MouseEvent) => {
      if (!renderer || !plane) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mousePosition.x = event.clientX - rect.left;
      mousePosition.y = event.clientY - rect.top;
      (plane.material as THREE.ShaderMaterial).uniforms.uMousePos.value.set(
        mousePosition.x,
        mousePosition.y,
      );
    };
    const clearMousePosition = () => {
      mousePosition.x = -1;
      mousePosition.y = -1;
      if (plane)
        (plane.material as THREE.ShaderMaterial).uniforms.uMousePos.value.set(
          -1,
          -1,
        );
    };

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      offset.x += (targetOffset.x - offset.x) * config.lerpFactor;
      offset.y += (targetOffset.y - offset.y) * config.lerpFactor;
      zoomLevel += (targetZoom - zoomLevel) * config.lerpFactor;
      if (plane && renderer) {
        const u = (plane.material as THREE.ShaderMaterial).uniforms;
        u.uOffset.value.set(offset.x, offset.y);
        u.uZoom.value = zoomLevel;
        renderer.render(scene, camera);
      }
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const init = async () => {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      const bg = rgbaToArray(config.backgroundColor);
      renderer.setClearColor(new THREE.Color(bg[0], bg[1], bg[2]), bg[3]);
      container.appendChild(renderer.domElement);

      if (document.fonts?.load) {
        try {
          await document.fonts.load('80px "IBM Plex Mono"');
        } catch {
          // fall back to system monospace
        }
      }
      if (disposed) return;

      const imageTextures = await loadTextures();
      if (disposed) return;
      const imageAtlas = createTextureAtlas(imageTextures, false);
      const textAtlas = createTextureAtlas(textTextures, true);

      const uniforms = {
        uOffset: { value: new THREE.Vector2(0, 0) },
        uResolution: {
          value: new THREE.Vector2(
            container.offsetWidth,
            container.offsetHeight,
          ),
        },
        uBorderColor: {
          value: new THREE.Vector4(...rgbaToArray(config.borderColor)),
        },
        uHoverColor: {
          value: new THREE.Vector4(...rgbaToArray(config.hoverColor)),
        },
        uBackgroundColor: {
          value: new THREE.Vector4(...rgbaToArray(config.backgroundColor)),
        },
        uMousePos: { value: new THREE.Vector2(-1, -1) },
        uZoom: { value: 1.0 },
        uCellSize: { value: config.cellSize },
        uTextureCount: { value: projects.length },
        uImageAtlas: { value: imageAtlas },
        uTextAtlas: { value: textAtlas },
      };

      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
      });
      plane = new THREE.Mesh(geometry, material);
      scene.add(plane);

      const canvasEl = renderer.domElement;
      canvasEl.addEventListener("mousedown", onPointerDown);
      window.addEventListener("mousemove", onPointerMove);
      window.addEventListener("mouseup", onPointerUp);
      canvasEl.addEventListener("touchstart", onTouchStart, { passive: true });
      canvasEl.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
      canvasEl.addEventListener("contextmenu", onContextMenu);
      canvasEl.addEventListener("mousemove", updateMousePosition);
      canvasEl.addEventListener("mouseleave", clearMousePosition);

      cleanups.push(() => {
        canvasEl.removeEventListener("mousedown", onPointerDown);
        window.removeEventListener("mousemove", onPointerMove);
        window.removeEventListener("mouseup", onPointerUp);
        canvasEl.removeEventListener("touchstart", onTouchStart);
        canvasEl.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        canvasEl.removeEventListener("contextmenu", onContextMenu);
        canvasEl.removeEventListener("mousemove", updateMousePosition);
        canvasEl.removeEventListener("mouseleave", clearMousePosition);
        geometry.dispose();
        material.dispose();
        imageAtlas.dispose();
        textAtlas.dispose();
        for (const t of imageTextures) t.dispose();
        for (const t of textTextures) t.dispose();
      });

      animate();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!renderer || !plane) return;
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(window.devicePixelRatio);
      (plane.material as THREE.ShaderMaterial).uniforms.uResolution.value.set(
        w,
        h,
      );
    });
    resizeObserver.observe(container);

    init();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      for (const c of cleanups) c();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
    };
  }, [projects]);

  return (
    <div
      className={className ? `sgg-root ${className}` : "sgg-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="sgg-vignette" />
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap");

.sgg-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  cursor: grab;
  touch-action: none;
}

.sgg-root.sgg-dragging {
  cursor: grabbing;
}

.sgg-root canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.sgg-vignette {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.5) 100%
  );
}
`;

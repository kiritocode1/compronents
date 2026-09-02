"use client";

/**
 * Frosted Plate Carousel - a wrapping diagonal of thin image plates.
 *
 * Each plate is a 0.0175-thick box. Cover-fit UVs mix a sharp texture into a
 * 64px blur across a 0.15 UV-edge smoothstep, which is the glass. X wraps on a
 * single scroll number. Z is -X times the depth multiplier, so the row recedes
 * on a diagonal at -PI/6. Click eases that rotation to 0, recenters X, and
 * dollies the camera in. Three.js and GSAP. Fills its parent box.
 *
 * BLANK - aryank.space
 */

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ASSET_BASE = "https://ui.aryank.space/assets/liquid-glass-carousel";

/** Byte-identical to reference/unveil/tile.vert, including the leading newline. */
export const TILE_VERT = `
  precision mediump float;

  varying vec2 vUv;

  void main () {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Byte-identical to reference/unveil/tile.frag, including the leading newline. */
export const TILE_FRAG = `
  precision mediump float;

  uniform vec2 uMeshSize;
  uniform vec2 uImageSize;

  uniform sampler2D uImageTexture;
  uniform sampler2D uBlurTexture;

  uniform float uSaturation;

  varying vec2 vUv;

  void main() {
    vec2 ratio = vec2(min((uMeshSize.x / uMeshSize.y) / (uImageSize.x / uImageSize.y), 1.0), min((uMeshSize.y / uMeshSize.x) / (uImageSize.y / uImageSize.x), 1.0));
    vec2 uvCover = vec2(vUv.x * ratio.x + (1.0 - ratio.x) * 0.5, vUv.y * ratio.y + (1.0 - ratio.y) * 0.5);
    
    vec4 progress = vec4(1.0, 1.0, 1.0, 1.0);
    
    vec4 blurTexture = texture2D(uBlurTexture, uvCover);
    vec4 imageTexture = texture2D(uImageTexture, uvCover);

    float margin = 0.15;
 
    if (vUv.x < margin) {
      progress.rgb *= smoothstep(0.0, margin, vUv.x);
    }

    if (vUv.x > 1.0 - margin) {
      progress.rgb *= smoothstep(1.0, 1.0 - margin, vUv.x);
    }

    if (vUv.y < margin) {
      progress.rgb *= smoothstep(0.0, margin, vUv.y);
    }

    if (vUv.y > 1.0 - margin) {
      progress.rgb *= smoothstep(1.0, 1.0 - margin, vUv.y);
    }

    blurTexture.a *= 0.75;
    
    vec4 color = mix(imageTexture, blurTexture, 1.0 - progress.r);

    gl_FragColor = color;
  }
`;

export const MECHANICS = {
  fov: 5,
  cameraNear: 0.1,
  cameraFar: 1000,
  cameraY: 100 / 7.5,
  cameraZDesktop: 35,
  cameraZPortrait: 55,
  clickDollyZDesktop: 30,
  clickDollyZNarrow: 35,
  narrowWidthPx: 640,
  ambientIntensity: 1.5,
  directionalIntensity: 1,
  directionalY: 25,
  directionalZ: 50,
  baseSize: 1.5,
  thickness: 0.0175,
  spacing: 0.375,
  rotationY: -Math.PI / 6,
  depthPortrait: 6,
  depthDesktopFactor: 1.5,
  visibilityZ: 12.5,
  hoverHitScaleX: 1.5,
  wheelDivisor: 20,
  previousLerp: 0.15,
  scrollDivisor: 25,
  dragLerp: 0.1,
  dragHoverDivisor: 100,
  dragTouchDivisor: 50,
  dragActiveDelayMs: 150,
  sceneScaleFocus: 0.825,
  entryScaleDuration: 1,
  entryScaleDelay: 1.25,
  hoverDuration: 0.5,
  hoverDesktopX: (1 / 3) * 2,
  hoverDesktopY: -0.1,
  hoverMobileXOn: 0.325,
  hoverMobileXOff: -0.325,
  clickInnerDuration: (1.25 / 3) * 2,
  clickRotationDuration: 1.25,
  clickGateMs: 1000,
  clickStampWindowMs: 200,
  entryOffsetX: -20,
  entryDuration: 2,
  minDuplicateCount: 20,
  blurMapSize: 64,
  pixelRatioCap: 2,
  titleFollowLerp: 0.1,
} as const;

export interface FrostedPlateTile {
  src: string;
  title: string;
  slug?: string;
}

export interface FrostedPlateCarouselProps {
  tiles?: FrostedPlateTile[];
  background?: string;
  onSelect?: (tile: FrostedPlateTile) => void;
  className?: string;
}

const DEFAULT_TILES: FrostedPlateTile[] = [
  { src: `${ASSET_BASE}/img-1.jpg`, title: "Bloomcollar", slug: "bloomcollar" },
  { src: `${ASSET_BASE}/img-2.jpg`, title: "Ribbonwork", slug: "ribbonwork" },
  { src: `${ASSET_BASE}/img-3.jpg`, title: "Swanhold", slug: "swanhold" },
  { src: `${ASSET_BASE}/img-4.jpg`, title: "Lumenflora", slug: "lumenflora" },
  {
    src: `${ASSET_BASE}/img-5.jpg`,
    title: "Long Exposure",
    slug: "long-exposure",
  },
  {
    src: `${ASSET_BASE}/img-6.jpg`,
    title: "Night Vision",
    slug: "night-vision",
  },
  {
    src: `${ASSET_BASE}/img-7.jpg`,
    title: "Still Object",
    slug: "still-object",
  },
  {
    src: `${ASSET_BASE}/img-8.jpg`,
    title: "Blossom Veil",
    slug: "blossom-veil",
  },
  { src: `${ASSET_BASE}/img-9.jpg`, title: "Split Frame", slug: "split-frame" },
  { src: `${ASSET_BASE}/img-10.jpg`, title: "Threshold", slug: "threshold" },
  { src: `${ASSET_BASE}/img-11.jpg`, title: "Daisy Fall", slug: "daisy-fall" },
  { src: `${ASSET_BASE}/img-12.jpg`, title: "Glasshouse", slug: "glasshouse" },
];

type TileRuntime = {
  index: number;
  source: FrostedPlateTile;
  meshW: number;
  root: THREE.Group;
  hoverGroup: THREE.Group;
  wrapper: THREE.Group;
  mesh: THREE.Mesh;
  hit: THREE.Mesh;
  hoverActive: boolean;
  sharp: THREE.Texture;
  blur: THREE.Texture;
};

function pointingFine() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error(`Failed to load ${src}`)),
    );
    image.src = src;
  });
}

function textureFromImage(image: HTMLImageElement, size?: number) {
  let source: HTMLImageElement | HTMLCanvasElement = image;
  if (size) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.drawImage(image, 0, 0, size, size);
    source = canvas;
  }
  const texture = new THREE.Texture(source);
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const material = child.material;
      if (Array.isArray(material)) {
        for (const entry of material) entry.dispose();
      } else {
        material.dispose();
      }
    }
  });
}

export default function FrostedPlateCarousel({
  tiles = DEFAULT_TILES,
  background = "#fafafa",
  onSelect,
  className,
}: FrostedPlateCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const [hoverTitle, setHoverTitle] = useState<string | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let scene: THREE.Scene | undefined;
    let tileRoot: THREE.Group | undefined;
    let clickReady = false;
    const readyTimer = window.setTimeout(() => {
      clickReady = true;
    }, MECHANICS.clickGateMs);

    const pointer = {
      ndc: new THREE.Vector2(1000, -1000),
      x: 0,
      y: 0,
      moved: false,
      downStamp: 0,
      dragging: false,
      dragActive: false,
      dragX: 0,
      dragY: 0,
      onX: 0,
      onY: 0,
      dragTimer: 0,
    };
    const titlePos = { x: 0, y: 0 };
    const scroll = { current: 0, previous: 0 };
    const entry = { x: MECHANICS.entryOffsetX };
    const dragSmooth = { value: 0 };
    const runtimes: TileRuntime[] = [];
    const hitIndex = new WeakMap<THREE.Object3D, number>();
    const raycaster = new THREE.Raycaster();
    let hoverIndex: number | null = null;
    let focused: TileRuntime | null = null;
    let closing = false;
    let canHover = pointingFine();

    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onMedia = () => {
      canHover = media.matches;
    };
    media.addEventListener("change", onMedia);

    // Three.js owns this canvas. Passing a React <canvas> and then calling
    // forceContextLoss() in cleanup leaves a dead context on the same node,
    // and Strict Mode remounts throw: getShaderPrecisionFormat() is null.
    renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
    });
    renderer.setClearColor(background);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, MECHANICS.pixelRatioCap),
    );
    const glCanvas = renderer.domElement;
    glCanvas.className = "absolute inset-0 z-[1] h-full w-full";
    glCanvas.style.display = "block";
    root.prepend(glCanvas);

    scene = new THREE.Scene();
    tileRoot = new THREE.Group();
    scene.add(tileRoot);
    scene.add(new THREE.AmbientLight("white", MECHANICS.ambientIntensity));
    const directional = new THREE.DirectionalLight(
      "white",
      MECHANICS.directionalIntensity,
    );
    directional.position.set(0, MECHANICS.directionalY, MECHANICS.directionalZ);
    scene.add(directional);

    camera = new THREE.PerspectiveCamera(
      MECHANICS.fov,
      1,
      MECHANICS.cameraNear,
      MECHANICS.cameraFar,
    );

    const size = { w: 1, h: 1 };
    const resize = () => {
      const next = root.getBoundingClientRect();
      size.w = Math.max(1, next.width);
      size.h = Math.max(1, next.height);
      renderer?.setSize(size.w, size.h, false);
      if (!camera) return;
      camera.aspect = size.w / size.h;
      camera.updateProjectionMatrix();
      if (focused) return;
      const portrait = size.w / size.h < 1;
      camera.position.set(
        0,
        MECHANICS.cameraY,
        portrait ? MECHANICS.cameraZPortrait : MECHANICS.cameraZDesktop,
      );
      camera.lookAt(0, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();

    gsap.set(tileRoot.scale, {
      x: MECHANICS.sceneScaleFocus,
      y: MECHANICS.sceneScaleFocus,
      z: MECHANICS.sceneScaleFocus,
    });
    gsap.to(tileRoot.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: MECHANICS.entryScaleDuration,
      delay: MECHANICS.entryScaleDelay,
      ease: "expo.out",
    });
    gsap.to(entry, {
      x: 0,
      ease: "expo.out",
      duration: MECHANICS.entryDuration,
    });

    const wrapWidth = (count: number) => (count * MECHANICS.spacing) / 2;

    const setHover = (index: number | null) => {
      if (hoverIndex === index) return;
      hoverIndex = index;
      const title =
        index === null ? null : (runtimes[index]?.source.title ?? null);
      setHoverTitle(title);
      for (const tile of runtimes) {
        const on = index === tile.index && !focused;
        if (canHover) {
          gsap.to(tile.hoverGroup.position, {
            x: on ? MECHANICS.hoverDesktopX : 0,
            y: on ? MECHANICS.hoverDesktopY : 0,
            ease: "expo.out",
            duration: MECHANICS.hoverDuration,
          });
        } else {
          gsap.to(tile.hoverGroup.position, {
            x: on ? MECHANICS.hoverMobileXOn : MECHANICS.hoverMobileXOff,
            y: on ? MECHANICS.hoverDesktopY : 0,
            ease: "expo.out",
            duration: MECHANICS.hoverDuration,
          });
        }
      }
    };

    const cameraZForFocus = () =>
      size.w < MECHANICS.narrowWidthPx
        ? MECHANICS.clickDollyZNarrow
        : MECHANICS.clickDollyZDesktop;

    const idleCameraZ = () =>
      size.w / size.h < 1
        ? MECHANICS.cameraZPortrait
        : MECHANICS.cameraZDesktop;

    const openFocus = (tile: TileRuntime) => {
      if (focused || closing || !camera || !tileRoot) return;
      focused = tile;
      closing = false;
      setHover(null);
      if (!canHover) gsap.set(tile.hoverGroup.position, { x: 0, y: 0 });
      const aspect = size.w / size.h;
      gsap.to(tile.mesh.position, {
        x: 0,
        ease: "expo.out",
        duration: MECHANICS.clickInnerDuration,
      });
      gsap.to(tile.wrapper.position, {
        x: 0,
        ease: "expo.out",
        duration: MECHANICS.clickInnerDuration,
        onUpdate: () => {
          tile.wrapper.position.z =
            -tile.wrapper.position.x * aspect * MECHANICS.depthDesktopFactor;
        },
      });
      gsap.to(tile.wrapper.rotation, {
        y: 0,
        ease: "expo.inOut",
        duration: MECHANICS.clickRotationDuration,
        onComplete: () => {
          onSelectRef.current?.(tile.source);
        },
      });
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: cameraZForFocus(),
        ease: "expo.inOut",
        duration: MECHANICS.clickRotationDuration,
        onUpdate: () => camera?.lookAt(0, 0, 0),
      });
      gsap.to(tileRoot.scale, {
        x: MECHANICS.sceneScaleFocus,
        y: MECHANICS.sceneScaleFocus,
        z: MECHANICS.sceneScaleFocus,
        duration: 0.75,
        ease: "expo.out",
      });
    };

    const closeFocus = () => {
      const tile = focused;
      if (!tile || !camera || !tileRoot || closing) return;
      closing = true;
      const aspect = size.w / size.h;
      const half = wrapWidth(runtimes.length);
      gsap.to(tile.mesh.position, {
        x: -(tile.meshW - MECHANICS.baseSize) / 2,
        ease: "expo.out",
        duration: MECHANICS.clickInnerDuration,
      });
      gsap.to(tile.wrapper.rotation, {
        y: MECHANICS.rotationY,
        ease: "expo.inOut",
        duration: MECHANICS.clickRotationDuration,
        onComplete: () => {
          focused = null;
          closing = false;
        },
      });
      gsap.to(camera.position, {
        x: 0,
        y: MECHANICS.cameraY,
        z: idleCameraZ(),
        ease: "expo.inOut",
        duration: MECHANICS.clickRotationDuration,
        onUpdate: () => camera?.lookAt(0, 0, 0),
      });
      gsap.to(tileRoot.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.75,
        ease: "expo.out",
      });
      gsap.to(
        {},
        {
          duration: MECHANICS.clickInnerDuration,
          ease: "expo.out",
          onUpdate: () => {
            if (focused !== tile) return;
            const dragDiv = canHover
              ? MECHANICS.dragHoverDivisor
              : MECHANICS.dragTouchDivisor;
            const shifted =
              scroll.previous / MECHANICS.scrollDivisor -
              dragSmooth.value / dragDiv +
              entry.x;
            const wrapped = gsap.utils.wrap(
              -half,
              half,
              (tile.index - shifted) * MECHANICS.spacing,
            );
            tile.wrapper.position.x = wrapped;
            tile.wrapper.position.z =
              aspect < 1
                ? -wrapped * MECHANICS.depthPortrait
                : -wrapped * aspect * MECHANICS.depthDesktopFactor;
          },
        },
      );
    };

    const clientPoint = (event: MouseEvent | PointerEvent | TouchEvent) => {
      if ("changedTouches" in event && event.changedTouches[0]) {
        return {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        };
      }
      if ("clientX" in event) return { x: event.clientX, y: event.clientY };
      return { x: 0, y: 0 };
    };

    const updatePointer = (event: MouseEvent | PointerEvent | TouchEvent) => {
      const point = clientPoint(event);
      const rect = root.getBoundingClientRect();
      pointer.x = point.x;
      pointer.y = point.y;
      pointer.moved = true;
      pointer.ndc.x = ((point.x - rect.left) / rect.width - 0.5) * 2;
      pointer.ndc.y = -((point.y - rect.top) / rect.height - 0.5) * 2;
      if (pointer.dragging) {
        pointer.dragX = pointer.onX + point.x;
        pointer.dragY = pointer.onY + point.y;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Element) {
        if (
          event.target.closest("a") ||
          event.target.closest("button") ||
          event.target.tagName === "I"
        ) {
          return;
        }
      }
      const point = clientPoint(event);
      pointer.downStamp = event.timeStamp;
      pointer.onX = pointer.dragX - point.x;
      pointer.onY = pointer.dragY - point.y;
      pointer.dragging = true;
      pointer.dragTimer = window.setTimeout(() => {
        pointer.dragActive = true;
      }, MECHANICS.dragActiveDelayMs);
      root.setPointerCapture(event.pointerId);
    };

    const onPointerUp = (event: PointerEvent) => {
      window.clearTimeout(pointer.dragTimer);
      pointer.dragging = false;
      pointer.dragActive = false;
      pointer.ndc.set(1000, -1000);
      if (root.hasPointerCapture(event.pointerId)) {
        root.releasePointerCapture(event.pointerId);
      }
    };

    const onClick = (event: MouseEvent) => {
      updatePointer(event);
      if (!clickReady) return;
      if (event.target instanceof Element) {
        if (
          event.target.closest("a") ||
          event.target.closest("button") ||
          event.target.tagName === "I"
        ) {
          return;
        }
      }
      if (event.timeStamp - pointer.downStamp >= MECHANICS.clickStampWindowMs) {
        return;
      }
      window.setTimeout(
        () => {
          if (focused) {
            closeFocus();
            return;
          }
          if (hoverIndex === null) return;
          const tile = runtimes[hoverIndex];
          if (tile) openFocus(tile);
        },
        canHover ? 0 : 20,
      );
    };

    const onWheel = (event: WheelEvent) => {
      if (!canHover || focused) return;
      event.preventDefault();
      let dx = event.deltaX;
      let dy = event.deltaY;
      if (event.deltaMode === 1) {
        dx *= 15;
        dy *= 15;
      }
      scroll.current -= (dy + dx) / MECHANICS.wheelDivisor;
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && focused) closeFocus();
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", updatePointer);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("click", onClick);
    root.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);

    const tick = () => {
      if (cancelled || !renderer || !camera || !scene || !tileRoot) return;
      raf = requestAnimationFrame(tick);

      dragSmooth.value +=
        (pointer.dragX - pointer.dragY - dragSmooth.value) * MECHANICS.dragLerp;
      scroll.previous +=
        (scroll.current - scroll.previous) * MECHANICS.previousLerp;

      const aspect = size.w / size.h;
      const count = runtimes.length;
      const half = wrapWidth(count);
      const dragDiv = canHover
        ? MECHANICS.dragHoverDivisor
        : MECHANICS.dragTouchDivisor;
      const shifted =
        scroll.previous / MECHANICS.scrollDivisor -
        dragSmooth.value / dragDiv +
        entry.x;

      if (!canHover && !focused) {
        let closest: TileRuntime | undefined;
        for (const tile of runtimes) {
          tile.hoverActive = false;
          if (
            !closest ||
            Math.abs(tile.wrapper.position.z) <
              Math.abs(closest.wrapper.position.z)
          ) {
            closest = tile;
          }
        }
        if (closest) closest.hoverActive = true;
        setHover(closest ? closest.index : null);
      }

      for (const tile of runtimes) {
        tile.root.visible = !focused || closing || focused.index === tile.index;
        if (focused && !closing) continue;
        if (closing && tile === focused) continue;
        if (!Number.isFinite(aspect)) continue;
        const wrapped = gsap.utils.wrap(
          -half,
          half,
          (tile.index - shifted) * MECHANICS.spacing,
        );
        tile.wrapper.position.x = wrapped;
        tile.wrapper.position.y = 0;
        tile.wrapper.position.z =
          aspect < 1
            ? -wrapped * MECHANICS.depthPortrait
            : -wrapped * aspect * MECHANICS.depthDesktopFactor;
        tile.wrapper.rotation.x = 0;
        tile.wrapper.rotation.y = MECHANICS.rotationY;
        tile.wrapper.visible =
          tile.wrapper.position.z < MECHANICS.visibilityZ &&
          tile.wrapper.position.z > -MECHANICS.visibilityZ;
        const material = tile.mesh.material;
        if (material instanceof THREE.ShaderMaterial) {
          const show = tile.wrapper.visible;
          material.uniforms.uBlurTexture.value = show ? tile.blur : null;
          material.uniforms.uImageTexture.value = show ? tile.sharp : null;
        }
      }

      if (
        canHover &&
        camera &&
        pointer.moved &&
        !pointer.dragActive &&
        !focused
      ) {
        raycaster.setFromCamera(pointer.ndc, camera);
        const targets = runtimes.map((tile) =>
          canHover ? tile.hit : tile.mesh,
        );
        const hits = raycaster.intersectObjects(targets);
        if (hits.length) {
          let best = hits[0];
          for (const hit of hits) {
            if (hit.object.renderOrder > best.object.renderOrder) best = hit;
          }
          setHover(hitIndex.get(best.object) ?? null);
        } else {
          setHover(null);
        }
      } else if (canHover && (pointer.dragActive || !pointer.moved)) {
        setHover(null);
      }

      const scaling = pointer.dragActive || Boolean(focused);
      if (!focused) {
        const target = scaling ? MECHANICS.sceneScaleFocus : 1;
        if (Math.abs(tileRoot.scale.x - target) > 0.001) {
          gsap.to(tileRoot.scale, {
            x: target,
            y: target,
            z: target,
            duration: 0.75,
            ease: "expo.out",
            overwrite: "auto",
          });
        }
      }

      root.style.cursor = focused
        ? "default"
        : hoverIndex !== null
          ? "pointer"
          : pointer.dragActive
            ? "grabbing"
            : "grab";

      const titleEl = titleRef.current;
      if (titleEl) {
        titlePos.x += (pointer.x - titlePos.x) * MECHANICS.titleFollowLerp;
        titlePos.y += (pointer.y - titlePos.y) * MECHANICS.titleFollowLerp;
        const rect = root.getBoundingClientRect();
        gsap.set(titleEl, {
          x: titlePos.x - rect.left,
          y: titlePos.y - rect.top,
          opacity: hoverIndex !== null && canHover && !focused ? 1 : 0,
        });
      }

      renderer.render(scene, camera);
    };

    const boot = async () => {
      let list = tiles.slice();
      if (list.length < MECHANICS.minDuplicateCount) list = [...list, ...list];
      const loaded = await Promise.all(
        list.map(async (source, index) => {
          const image = await loadImage(source.src);
          return { source, index, image };
        }),
      );
      if (cancelled || !tileRoot) return;

      for (const { source, index, image } of loaded) {
        let meshW = MECHANICS.baseSize;
        let meshH = MECHANICS.baseSize;
        const imageAspectHW = image.naturalHeight / image.naturalWidth;
        meshH *= imageAspectHW;
        if (imageAspectHW !== 0) {
          const fit = 1 - (imageAspectHW - 1) * 0.5;
          meshW *= fit;
          meshH *= fit;
        }
        const geometry = new THREE.BoxGeometry(
          meshW,
          meshH,
          MECHANICS.thickness,
        );
        const sharp = textureFromImage(image);
        const blur = textureFromImage(image, MECHANICS.blurMapSize);
        const material = new THREE.ShaderMaterial({
          vertexShader: TILE_VERT,
          fragmentShader: TILE_FRAG,
          transparent: true,
          uniforms: {
            uBlurTexture: { value: null },
            uImageTexture: { value: null },
            uImageSize: {
              value: new THREE.Vector2(image.naturalWidth, image.naturalHeight),
            },
            uMeshSize: { value: new THREE.Vector2(meshW, meshH) },
            uSaturation: { value: 1 },
          },
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.setScalar(1);
        mesh.position.x = -(meshW - MECHANICS.baseSize) / 2;
        const hit = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            color: "white",
            opacity: 0,
            transparent: true,
            depthWrite: false,
          }),
        );
        hit.scale.x = MECHANICS.hoverHitScaleX;
        const hoverGroup = new THREE.Group();
        const wrapper = new THREE.Group();
        const group = new THREE.Group();
        hoverGroup.add(mesh);
        wrapper.add(hoverGroup);
        wrapper.add(hit);
        group.add(wrapper);
        tileRoot.add(group);
        hitIndex.set(hit, index);
        hitIndex.set(mesh, index);
        runtimes.push({
          index,
          source,
          meshW,
          root: group,
          hoverGroup,
          wrapper,
          mesh,
          hit,
          hoverActive: false,
          sharp,
          blur,
        });
      }

      raf = requestAnimationFrame(tick);
    };

    void boot();

    return () => {
      cancelled = true;
      clickReady = false;
      window.clearTimeout(readyTimer);
      window.clearTimeout(pointer.dragTimer);
      cancelAnimationFrame(raf);
      media.removeEventListener("change", onMedia);
      observer.disconnect();
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", updatePointer);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("click", onClick);
      root.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      gsap.killTweensOf(entry);
      if (tileRoot) gsap.killTweensOf(tileRoot.scale);
      if (camera) gsap.killTweensOf(camera.position);
      for (const tile of runtimes) {
        gsap.killTweensOf(tile.hoverGroup.position);
        gsap.killTweensOf(tile.mesh.position);
        gsap.killTweensOf(tile.wrapper.position);
        gsap.killTweensOf(tile.wrapper.rotation);
        tile.sharp.dispose();
        tile.blur.dispose();
        disposeObject(tile.root);
        tileRoot?.remove(tile.root);
      }
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [tiles, background]);

  return (
    <div
      ref={rootRef}
      className={["relative h-full w-full overflow-hidden", className]
        .filter(Boolean)
        .join(" ")}
      style={{ background }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] hidden opacity-75 md:block"
        style={{
          background:
            "linear-gradient(45deg,#fafafa,#fafafa 1%,#fafafa00 25%,#fafafa00 75%,#fafafa)",
        }}
      />
      <span
        ref={titleRef}
        className="pointer-events-none absolute top-0 left-0 z-[3] p-3 text-[0.65625rem] leading-[0.8125rem] tracking-[0.015em] text-white opacity-0 mix-blend-exclusion"
      >
        <span style={{ filter: "saturate(0)" }}>{hoverTitle}</span>
      </span>
    </div>
  );
}

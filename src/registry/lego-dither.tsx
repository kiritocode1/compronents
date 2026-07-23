"use client";

/**
 * Lego Dither
 *
 * A spinning GLB hand rendered into a luminance buffer, then rebuilt cell by
 * cell from a six-frame Lego stud sprite sheet. Pointer movement rotates the
 * hand and paints a fading trail through the same dither pass.
 *
 * BLANK, aryank.space
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const DEFAULT_MODEL =
  "https://ui.aryank.space/assets/lego-dither/marble-hand-2.glb";
const DEFAULT_SPRITE =
  "https://ui.aryank.space/assets/lego-dither/lego-sprite.png";

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uScene;
  uniform sampler2D uSprite;
  uniform sampler2D uTrail;
  uniform vec2 uResolution;
  uniform float uCellSize;
  uniform float uDistortion;
  varying vec2 vUv;

  float luminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
  }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCellSize);
    vec2 cellUv = (cell * uCellSize + uCellSize * 0.5) / uResolution;
    vec2 texel = 1.0 / uResolution;
    float trail = texture2D(uTrail, cellUv).r;
    vec2 trailGradient = vec2(
      texture2D(uTrail, cellUv + vec2(texel.x * 4.0, 0.0)).r -
        texture2D(uTrail, cellUv - vec2(texel.x * 4.0, 0.0)).r,
      texture2D(uTrail, cellUv + vec2(0.0, texel.y * 4.0)).r -
        texture2D(uTrail, cellUv - vec2(0.0, texel.y * 4.0)).r
    );
    vec3 source = texture2D(
      uScene,
      clamp(cellUv + trailGradient * uDistortion, 0.0, 1.0)
    ).rgb;
    float level = max(luminance(source), trail);
    float glyph = min(5.0, floor(level * 6.0));
    vec2 local = fract(gl_FragCoord.xy / uCellSize);
    vec2 spriteUv = vec2((glyph + local.x) / 6.0, local.y);

    gl_FragColor = texture2D(uSprite, spriteUv);
  }
`;

export interface LegoDitherProps {
  modelUrl?: string;
  spriteUrl?: string;
  cellSize?: number;
  modelScale?: number;
  spinSpeed?: number;
  pointerRotation?: number;
  trailSize?: number;
  trailDecay?: number;
  distortion?: number;
  className?: string;
}

function fitModel(model: THREE.Object3D, scale: number) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  model.position.sub(center);
  model.scale.setScalar((scale * 3.2) / Math.max(size.x, size.y, size.z));
}

export default function LegoDither({
  modelUrl = DEFAULT_MODEL,
  spriteUrl = DEFAULT_SPRITE,
  cellSize = 7,
  modelScale = 1,
  spinSpeed = 0.26,
  pointerRotation = 0.32,
  trailSize = 0.065,
  trailDecay = 0.018,
  distortion = 0.055,
  className,
}: LegoDitherProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    let disposed = false;
    let frameId = 0;
    let model: THREE.Object3D | null = null;
    let pointerDown = false;
    let hasPointer = false;
    let previousTrailPoint: THREE.Vector2 | null = null;
    const pointer = new THREE.Vector2(0.5, 0.5);
    const easedPointer = new THREE.Vector2(0.5, 0.5);
    const pointerCenter = new THREE.Vector2(0.5, 0.5);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const sourceScene = new THREE.Scene();
    sourceScene.background = new THREE.Color(0x000000);
    const sourceCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
    sourceCamera.position.set(0, 0, 8);

    sourceScene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.9));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
    keyLight.position.set(3, 5, 6);
    sourceScene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 2.2);
    fillLight.position.set(-4, -1, 3);
    sourceScene.add(fillLight);

    const target = new THREE.WebGLRenderTarget(1, 1, {
      depthBuffer: true,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    target.texture.colorSpace = THREE.SRGBColorSpace;

    const trailCanvas = document.createElement("canvas");
    trailCanvas.width = 768;
    trailCanvas.height = 768;
    const trailContext = trailCanvas.getContext("2d");
    const trailTexture = new THREE.CanvasTexture(trailCanvas);
    trailTexture.minFilter = THREE.LinearFilter;
    trailTexture.magFilter = THREE.LinearFilter;

    const spriteTexture = new THREE.TextureLoader().load(
      spriteUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
      },
    );

    const uniforms = {
      uScene: { value: target.texture },
      uSprite: { value: spriteTexture },
      uTrail: { value: trailTexture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uCellSize: { value: cellSize },
      uDistortion: { value: distortion },
    };
    const postMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
    });
    const postScene = new THREE.Scene();
    const postCamera = new THREE.Camera();
    const postQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      postMaterial,
    );
    postScene.add(postQuad);

    const resize = () => {
      const width = Math.max(1, root.clientWidth);
      const height = Math.max(1, root.clientHeight);
      renderer.setSize(width, height, false);
      const drawingBuffer = renderer.getDrawingBufferSize(new THREE.Vector2());
      target.setSize(drawingBuffer.x, drawingBuffer.y);
      uniforms.uResolution.value.copy(drawingBuffer);
      uniforms.uCellSize.value = Math.max(
        3,
        cellSize * (drawingBuffer.y / height),
      );

      const aspect = width / height;
      sourceCamera.left = -2.45 * aspect;
      sourceCamera.right = 2.45 * aspect;
      sourceCamera.top = 2.45;
      sourceCamera.bottom = -2.45;
      sourceCamera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    resize();

    const updatePointer = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect();
      pointer.set(
        THREE.MathUtils.clamp(
          (event.clientX - bounds.left) / bounds.width,
          0,
          1,
        ),
        THREE.MathUtils.clamp(
          1 - (event.clientY - bounds.top) / bounds.height,
          0,
          1,
        ),
      );
      hasPointer = true;
      pointerDown = event.buttons > 0;
    };
    const leavePointer = () => {
      hasPointer = false;
      pointerDown = false;
      previousTrailPoint = null;
    };
    root.addEventListener("pointermove", updatePointer);
    root.addEventListener("pointerleave", leavePointer);
    root.addEventListener("pointerdown", updatePointer);
    root.addEventListener("pointerup", updatePointer);

    new GLTFLoader().load(
      modelUrl,
      (gltf) => {
        if (disposed) {
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) child.geometry.dispose();
          });
          return;
        }

        model = gltf.scene;
        fitModel(model, modelScale);
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];
          for (const material of materials) material.dispose();
          child.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.06,
            metalness: 0.08,
          });
        });
        sourceScene.add(model);
        setIsReady(true);
      },
      undefined,
      () => setIsReady(false),
    );

    const clock = new THREE.Clock();
    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      easedPointer.lerp(hasPointer ? pointer : pointerCenter, 0.06);

      if (trailContext) {
        trailContext.globalCompositeOperation = "destination-out";
        trailContext.fillStyle = `rgba(0,0,0,${Math.min(1, trailDecay * delta * 60)})`;
        trailContext.fillRect(0, 0, trailCanvas.width, trailCanvas.height);
        trailContext.globalCompositeOperation = "source-over";

        if (hasPointer) {
          const point = new THREE.Vector2(
            pointer.x * trailCanvas.width,
            pointer.y * trailCanvas.height,
          );
          const last = previousTrailPoint ?? point;
          trailContext.strokeStyle = "#ffffff";
          trailContext.lineCap = "round";
          trailContext.lineJoin = "round";
          trailContext.lineWidth =
            trailSize * trailCanvas.height * (pointerDown ? 1.35 : 1);
          trailContext.beginPath();
          trailContext.moveTo(last.x, last.y);
          trailContext.lineTo(point.x, point.y);
          trailContext.stroke();
          previousTrailPoint = point;
        }
        trailTexture.needsUpdate = true;
      }

      if (model) {
        if (!reducedMotion) model.rotation.y = time * spinSpeed;
        model.rotation.x = (easedPointer.y - 0.5) * pointerRotation;
        model.rotation.z = -(easedPointer.x - 0.5) * pointerRotation;
      }

      renderer.setRenderTarget(target);
      renderer.render(sourceScene, sourceCamera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      root.removeEventListener("pointermove", updatePointer);
      root.removeEventListener("pointerleave", leavePointer);
      root.removeEventListener("pointerdown", updatePointer);
      root.removeEventListener("pointerup", updatePointer);
      sourceScene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const material of materials) material.dispose();
      });
      spriteTexture.dispose();
      trailTexture.dispose();
      target.dispose();
      postQuad.geometry.dispose();
      postMaterial.dispose();
      renderer.dispose();
    };
  }, [
    cellSize,
    distortion,
    modelScale,
    modelUrl,
    pointerRotation,
    spinSpeed,
    spriteUrl,
    trailDecay,
    trailSize,
  ]);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 320,
        overflow: "hidden",
        background: "#ffffff",
        cursor: "crosshair",
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="A spinning hand rendered as colorful Lego studs. Move the pointer to rotate it and draw a fading trail."
        style={{ display: "block", width: "100%", height: "100%" }}
      />
      <span
        aria-live="polite"
        style={{
          position: "absolute",
          left: 16,
          bottom: 14,
          color: "#111111",
          fontFamily: "monospace",
          fontSize: 10,
          letterSpacing: "0.08em",
          opacity: isReady ? 0 : 0.55,
          pointerEvents: "none",
          transition: "opacity 180ms ease",
        }}
      >
        {isReady ? "" : "LOADING HAND"}
      </span>
    </div>
  );
}

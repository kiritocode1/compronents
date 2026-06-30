"use client";

/**
 * Material Spotlight — a cursor-driven material reveal on a 3D model.
 *
 * A GLB model is lit by a room-environment IBL and rendered with a near-matte
 * standard material. A small shader patch (injected via onBeforeCompile) carves
 * a soft sphere of influence around the cursor's world-space hit point: inside
 * it the surface drops to low roughness and darker diffuse, so a wet, polished
 * "spotlight" of the material follows the pointer and eases away when it leaves.
 * Three.js + WebGL.
 *
 * Fills its container — drop it into any bounded box or a full-screen section.
 * Pass your own `src` (a .glb / .gltf).
 *
 * BLANK — aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface MaterialSpotlightProps {
  /** Model URL (.glb / .gltf), same-origin or CORS-enabled. */
  src?: string;
  /** Clear / background color. */
  background?: string;
  /** Radius of the polished spotlight (world units). */
  radius?: number;
  /** Soft falloff width past the radius. */
  softness?: number;
  /** Follow easing for the hit point and activation (0–1 per frame). */
  lerp?: number;
  /** Tone-mapping exposure. */
  exposure?: number;
}

const COMPRONENTS_ASSET_BASE =
  "https://compronents.dev/assets/material-spotlight";

const vertexPars = "varying vec3 vWPos;";
const vertexMain = "vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;";
const fragmentPars = `
  uniform vec3 uHitPoint;
  uniform float uActive, uRadius, uSoftness;
  varying vec3 vWPos;
`;
const fragmentMain = `
  float d = distance(vWPos, uHitPoint);
  float reveal = 1.0 - smoothstep(uRadius, uRadius + uSoftness, d);
  float mask = reveal * uActive;
  roughnessFactor = mix(0.95, 0.45, mask);
  diffuseColor.rgb *= mix(1.0, 0.5, mask);
`;

export default function MaterialSpotlight({
  src = `${COMPRONENTS_ASSET_BASE}/model.glb`,
  background = "#dddcd7",
  radius = 0.15,
  softness = 0.35,
  lerp = 0.05,
  exposure = 0.65,
}: MaterialSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color(background));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure;
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment()).texture;
    scene.environment = envTexture;
    pmrem.dispose();

    const config = { radius, softness, lerp };
    const shaders: THREE.WebGLProgramParametersWithUniforms[] = [];
    const uHit = new THREE.Vector3(0, 100, 0);
    const target = new THREE.Vector3(0, 100, 0);
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const planeHit = new THREE.Vector3();
    let uActive = 0;
    let active = false;
    let model: THREE.Object3D | null = null;
    let disposed = false;

    const loader = new GLTFLoader();
    loader.load(src, (gltf) => {
      if (disposed) return;
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      model.position.sub(box.getCenter(new THREE.Vector3()));

      const size = box.getSize(new THREE.Vector3());
      const dist =
        Math.max(size.x, size.y, size.z) /
        (2 * Math.tan((camera.fov * Math.PI) / 180 / 2));
      camera.position.set(0, 0, dist * 1.75);
      camera.lookAt(0, 0, 0);

      model.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (!mesh.isMesh) return;
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.roughness = 0.95;
        material.onBeforeCompile = (shader) => {
          shader.uniforms.uHitPoint = { value: uHit };
          shader.uniforms.uActive = { value: 0 };
          shader.uniforms.uRadius = { value: config.radius };
          shader.uniforms.uSoftness = { value: config.softness };

          shader.vertexShader = shader.vertexShader
            .replace("#include <common>", `#include <common>\n${vertexPars}`)
            .replace(
              "#include <worldpos_vertex>",
              `#include <worldpos_vertex>\n${vertexMain}`,
            );
          shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>\n${fragmentPars}`)
            .replace(
              "#include <roughnessmap_fragment>",
              `#include <roughnessmap_fragment>\n${fragmentMain}`,
            );
          shaders.push(shader);
        };
        material.needsUpdate = true;
      });

      scene.add(model);
    });

    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      active = true;
    };
    const onMouseLeave = () => {
      active = false;
    };
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    let frame = 0;
    const animate = () => {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, planeHit);
      if (planeHit) target.copy(planeHit);

      uHit.lerp(target, config.lerp);
      uActive += ((active ? 1 : 0) - uActive) * config.lerp;
      for (const shader of shaders) {
        (shader.uniforms.uHitPoint.value as THREE.Vector3).copy(uHit);
        shader.uniforms.uActive.value = uActive;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    const observer = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    observer.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      envTexture.dispose();
      scene.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mat = mesh.material;
          if (Array.isArray(mat)) for (const m of mat) m.dispose();
          else mat?.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [src, background, radius, softness, lerp, exposure]);

  return (
    <div className="ms-root" ref={containerRef} style={{ background }}>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.ms-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.ms-root canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
`;

"use client";

/**
 * Photo Sphere Orb - a hundred photographs distributed over the surface of a
 * sphere, each turned to face the middle. Positions come from a Fibonacci
 * spiral rather than a lat/long grid, so the tiles space evenly instead of
 * bunching at the poles. Each plane is built at the real aspect ratio of the
 * texture it received, so nothing is stretched, and the whole ball is dragged
 * with damped orbit controls that allow rotation and zoom but no panning, so
 * the orb can never be knocked off center.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ASSET_BASE = "https://ui.aryank.space/assets/photo-sphere-orb";

export interface PhotoSphereOrbProps {
  title?: string;
  caption?: string;
  images?: string[];
  totalItems?: number;
  sphereRadius?: number;
  backgroundColor?: string;
}

const DEFAULT_IMAGES = Array.from(
  { length: 30 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpeg`,
);

export default function PhotoSphereOrb({
  title = "Orb",
  caption = "[ Archive beyond reality ]",
  images = DEFAULT_IMAGES,
  totalItems = 100,
  sphereRadius = 5,
  backgroundColor = "#000000",
}: PhotoSphereOrbProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!images.length) return;

    const container = root.querySelector<HTMLElement>(".orb-container");
    if (!container) return;

    const baseWidth = 1;
    const baseHeight = 0.6;

    const frameWidth = () => root.clientWidth || 1;
    const frameHeight = () => root.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      frameWidth() / frameHeight(),
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(frameWidth(), frameHeight());
    renderer.setClearColor(
      Number.parseInt(backgroundColor.replace("#", ""), 16),
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.2;
    controls.minDistance = 6;
    controls.maxDistance = 10;
    controls.enableZoom = true;
    controls.enablePan = false;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    let loadedCount = 0;
    let frame = 0;
    let disposed = false;

    const meshes: THREE.Mesh[] = [];
    const textures: THREE.Texture[] = [];

    const getRandomImagePath = () =>
      images[Math.floor(Math.random() * images.length)];

    const createImagePlane = (texture: THREE.Texture) => {
      const image = texture.image as { width: number; height: number };
      const imageAspect = image.width / image.height;
      let width = baseWidth;
      let height = baseHeight;

      if (imageAspect > 1) {
        height = width / imageAspect;
      } else {
        width = height * imageAspect;
      }

      return new THREE.PlaneGeometry(width, height);
    };

    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    const loadImageMesh = (phi: number, theta: number) => {
      textureLoader.load(
        getRandomImagePath(),
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }

          texture.generateMipmaps = false;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          textures.push(texture);

          const geometry = createImagePlane(texture);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: false,
            depthWrite: true,
            depthTest: true,
          });

          const mesh = new THREE.Mesh(geometry, material);

          mesh.position.x = sphereRadius * Math.cos(theta) * Math.sin(phi);
          mesh.position.y = sphereRadius * Math.sin(theta) * Math.sin(phi);
          mesh.position.z = sphereRadius * Math.cos(phi);

          mesh.lookAt(0, 0, 0);
          mesh.rotateY(Math.PI);

          scene.add(mesh);
          meshes.push(mesh);

          loadedCount++;
          if (loadedCount === totalItems) animate();
        },
        undefined,
        () => {
          loadedCount++;
          if (loadedCount === totalItems) animate();
        },
      );
    };

    // Fibonacci distribution: acos on a linear ramp keeps the polar spacing
    // even, which a naive lat/long loop would bunch at the poles.
    for (let i = 0; i < totalItems; i++) {
      const phi = Math.acos(-1 + (2 * i) / totalItems);
      const theta = Math.sqrt(totalItems * Math.PI) * phi;
      loadImageMesh(phi, theta);
    }

    camera.position.z = 10;

    const onResize = () => {
      const width = frameWidth();
      const height = frameHeight();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      for (const mesh of meshes) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        scene.remove(mesh);
      }
      for (const texture of textures) texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [images, totalItems, sphereRadius, backgroundColor]);

  return (
    <div
      className="orb-root"
      ref={rootRef}
      style={{ "--orb-bg": backgroundColor } as React.CSSProperties}
    >
      <style>{styles}</style>
      <div className="orb-container" />
      <nav className="orb-nav">
        <h1>{title}</h1>
      </nav>
      <footer className="orb-footer">
        <p>{caption}</p>
      </footer>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap");

.orb-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--orb-bg);
}
.orb-root * { margin: 0; padding: 0; box-sizing: border-box; }
.orb-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.orb-nav,
.orb-footer {
  position: absolute;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3em;
  z-index: 2;
  pointer-events: none;
}
.orb-nav { top: 0; }
.orb-footer { bottom: 0; }
.orb-root h1 {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 18px;
  font-weight: 900;
  color: #fff;
}
.orb-root p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 11px;
  color: #777777;
}
`;

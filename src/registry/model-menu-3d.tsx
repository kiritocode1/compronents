"use client";

/**
 * Model Menu 3D - a fullscreen menu overlay built around a lit 3D model: a
 * toggle fades the panel in, a GLB object sits behind the links reacting to the
 * cursor with eased parallax rotation and a pointer-tracked point light, and
 * each menu label fills with a left-to-right gradient wipe on hover. A hero
 * section sits beneath the closed menu.
 *
 * Fills its container, so it drops into any bounded box or a full-screen
 * section. Three.js + WebGL.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// WebGL loaders (GLTFLoader/TextureLoader) fetch crossOrigin, so they must hit
// a CORS-enabled origin directly; the Blob public origin sends ACAO:* with no
// redirect (the /assets redirect does not preserve CORS for the crossOrigin
// request). Plain <img> assets can still use /assets.
const ASSET_BASE =
  "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/model-menu-3d";

export interface ModelMenu3DProps {
  modelSrc?: string;
  heroImage?: string;
  logo?: string;
  menuItems?: string[];
  heroText?: string;
  canvasBg?: string;
}

const DEFAULT_ITEMS = [
  "Studio",
  "Coordinates",
  "Framework",
  "Garden",
  "Design",
  "Collective",
  "Features",
  "Atrium",
];

export default function ModelMenu3D({
  modelSrc = `${ASSET_BASE}/model.glb`,
  heroImage = `${ASSET_BASE}/hero.jpg`,
  logo = "Golden Hour Atelier",
  menuItems = DEFAULT_ITEMS,
  heroText = "A Study in Time and Texture",
  canvasBg = "#1a1a1a",
}: ModelMenu3DProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const config = {
      metalness: 0.55,
      roughness: 0.75,
      baseZoom: 0.35,
      baseCamPosY: -1.25,
      baseRotationY: 0.3,
      parallaxSensitivityX: 0.25,
      parallaxSensitivityY: 0.05,
      cursorLightSmoothness: 0.5,
    };

    const size = () => ({
      w: root.clientWidth || 1,
      h: root.clientHeight || 1,
    });
    const baseCamPosX = () => (size().w < 1000 ? 0 : -0.75);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(canvasBg);

    const initial = size();
    const camera = new THREE.PerspectiveCamera(
      60,
      initial.w / initial.h,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(initial.w, initial.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(2.5, 10, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 100;
    keyLight.shadow.bias = -0.00005;
    keyLight.shadow.normalBias = 0.05;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(-5, 2.5, -2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
    rimLight.position.set(-7.5, 5, -10);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 15, 0);
    scene.add(topLight);

    const cursorLight = new THREE.PointLight(0xffffff, 2.5, 7.5, 2);
    cursorLight.position.set(0, 0, 1.25);
    scene.add(cursorLight);

    let model: THREE.Object3D | null = null;
    const modelCenter = new THREE.Vector3();

    const loader = new GLTFLoader();
    loader.load(modelSrc, (gltf) => {
      model = gltf.scene;
      model.traverse((node) => {
        const mesh = node as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.metalness = config.metalness;
            mat.roughness = config.roughness;
            mat.needsUpdate = true;
          }
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      box.getCenter(modelCenter);
      const dims = box.getSize(new THREE.Vector3());

      model.position.set(
        -modelCenter.x + baseCamPosX(),
        -modelCenter.y + config.baseCamPosY,
        -modelCenter.z,
      );
      model.rotation.set(0, config.baseRotationY, 0);

      const maxDim = Math.max(dims.x, dims.y, dims.z);
      camera.position.z = maxDim * config.baseZoom;
      camera.lookAt(0, 0, 0);
      scene.add(model);
    });

    let mouseX = 0;
    let mouseY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const { w, h } = size();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (model) {
        model.position.setX(-modelCenter.x + baseCamPosX());
      }
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(root);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (model) {
        const targetRotationY = mouseX * config.parallaxSensitivityX;
        const targetRotationX = -mouseY * config.parallaxSensitivityY;
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;
        model.rotation.x = currentRotationX;
        model.rotation.y = config.baseRotationY + currentRotationY;
      }
      cursorLight.position.x +=
        (mouseX - cursorLight.position.x) * config.cursorLightSmoothness;
      cursorLight.position.y +=
        (mouseY - cursorLight.position.y) * config.cursorLightSmoothness;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      cancelAnimationFrame(raf);
      renderer.dispose();
    };
  }, [modelSrc, canvasBg]);

  const onEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      backgroundSize: "100% 100%",
      duration: 0.75,
      ease: "power2.out",
      overwrite: true,
    });
  };
  const onLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      backgroundSize: "0% 100%",
      duration: 0.25,
      ease: "power2.out",
      overwrite: true,
    });
  };

  return (
    <div className="mm3-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="mm3-nav">
        <div className="mm3-logo">
          <a href="#">{logo}</a>
        </div>
        <button
          className="mm3-toggler"
          onClick={() => setIsOpen((v) => !v)}
          type="button"
        >
          <p>{isOpen ? "Close" : "Menu"}</p>
        </button>
      </nav>

      <div
        className="mm3-overlay"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
        }}
      >
        <canvas className="mm3-canvas" ref={canvasRef} />
        <div className="mm3-links">
          {menuItems.map((item) => (
            <div className="mm3-item" key={item}>
              <a href="#" onMouseEnter={onEnter} onMouseLeave={onLeave}>
                {item}
              </a>
            </div>
          ))}
        </div>
      </div>

      <section
        className="mm3-hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <h1>{heroText}</h1>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.mm3-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #0a0a0a;
  font-family: "Manrope", sans-serif;
}

.mm3-root h1 {
  text-transform: uppercase;
  font-size: 8rem;
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.25rem;
}

.mm3-root a,
.mm3-root p {
  color: #fff;
  display: block;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 0.9;
  user-select: none;
}

.mm3-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 2;
}

.mm3-logo,
.mm3-toggler {
  padding: 1rem;
  cursor: pointer;
}

.mm3-toggler {
  background: none;
  border: none;
}

.mm3-logo {
  width: 4rem;
}

.mm3-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  background-color: #1a1a1a;
  will-change: opacity;
  z-index: 1;
}

.mm3-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.mm3-links {
  position: relative;
  width: 45%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mm3-item a {
  width: max-content;
  color: #4d4d4d;
  font-size: 4rem;
  line-height: 1;
  background: linear-gradient(#fff, #fff) left no-repeat, #4d4d4d;
  background-size: 0% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mm3-hero {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  display: flex;
  align-items: flex-end;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: cover;
  overflow: hidden;
}

.mm3-hero h1 {
  width: 75%;
  color: #fff;
}

@media (max-width: 1000px) {
  .mm3-root h1 {
    font-size: 3rem;
    letter-spacing: 0;
  }

  .mm3-hero h1 {
    width: 100%;
  }

  .mm3-links {
    width: 100%;
    padding: 2rem;
  }

  .mm3-item a {
    font-size: 2.5rem;
  }
}
`;

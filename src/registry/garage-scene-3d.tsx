"use client";

/**
 * Garage Scene 3D - a GLTF interior lit almost entirely by coloured point
 * lights, orbited with damped controls. Ambient is set to zero, so every
 * surface you see is being reached by one of four points with hand-tuned decay,
 * and a single dim directional fills the rest. An UnrealBloom pass on top of
 * the render is what turns those hot spots into the neon look, and the orbit is
 * clamped to a polar half turn and a distance range so the camera cannot leave
 * the room or drop through the floor.
 *
 * Fills its container. Three.js, no animation library.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const ASSET_BASE = "https://ui.aryank.space/assets/garage-scene-3d";

export interface GarageScene3DProps {
  modelSrc?: string;
  brand?: string;
  navItems?: string[];
  statement?: string;
  credit?: string;
  background?: string;
  logoColor?: string;
  bloomStrength?: number;
}

export default function GarageScene3D({
  modelSrc = `${ASSET_BASE}/scene.gltf`,
  brand = "The Garage",
  navItems = ["Services", "About", "Contact"],
  statement = "Redefining the future, where raw grit meets bold style in a dystopian-inspired garage experience.",
  credit = "Made by BLANK",
  background = "#151620",
  logoColor = "#ffe940",
  bloomStrength = 0.6,
}: GarageScene3DProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = root.querySelector<HTMLElement>(".gs3-stage");
    if (!stage) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const camera = new THREE.PerspectiveCamera(
      70,
      stage.clientWidth / stage.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(60, 10, 50);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.75;
    stage.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0));

    const directionalLight = new THREE.DirectionalLight(0xcc8ee8, 1.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const points: THREE.PointLight[] = [
      Object.assign(new THREE.PointLight(0xffd600, 3, 50), { decay: 5 }),
      Object.assign(new THREE.PointLight(0xea00ff, 1.25, 0), { decay: 2 }),
      Object.assign(new THREE.PointLight(0xff4c00, 2.5, 50), { decay: 2 }),
      Object.assign(new THREE.PointLight(0xffd600, 3, 47), { decay: 0.5 }),
    ];
    points[0].position.set(4.5, 25, 25);
    points[1].position.set(-100, 65.5, 20);
    points[2].position.set(10, -10, -25);
    points[3].position.set(52, -25, 25);
    for (const light of points) scene.add(light);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(stage.clientWidth, stage.clientHeight),
        bloomStrength,
        1,
        0.1,
      ),
    );
    composer.addPass(new OutputPass());

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(modelSrc, (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      model.position.sub(box.getCenter(new THREE.Vector3()));
      scene.add(model);
    });

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      composer.render();
    };
    animate();

    const resize = new ResizeObserver(() => {
      if (!stage.clientWidth || !stage.clientHeight) return;
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      composer.setSize(stage.clientWidth, stage.clientHeight);
    });
    resize.observe(stage);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          const material = object.material;
          if (Array.isArray(material)) {
            for (const m of material) m.dispose();
          } else {
            material?.dispose();
          }
        }
      });
    };
  }, [background, bloomStrength, modelSrc]);

  return (
    <div
      className="gs3-root"
      ref={rootRef}
      style={{ backgroundColor: background }}
    >
      <style>{styles}</style>

      <div className="gs3-stage" />

      <nav className="gs3-nav">
        <div className="gs3-logo" style={{ backgroundColor: logoColor }}>
          <a href="#brand">{brand}</a>
        </div>
        <div className="gs3-nav-items">
          {navItems.map((item) => (
            <a href="#nav" key={item}>
              {item}
            </a>
          ))}
        </div>
      </nav>

      <footer className="gs3-footer">
        <p>{statement}</p>
        <p>{credit}</p>
      </footer>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,100..900;1,100..900&display=swap");

.gs3-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Libre Franklin", sans-serif;
}

.gs3-root * {
  box-sizing: border-box;
}

.gs3-root a,
.gs3-root p {
  margin: 0;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 18px;
  color: #fff;
}

.gs3-stage {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gs3-stage canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.gs3-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2.5em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  pointer-events: none;
}

.gs3-nav a {
  pointer-events: auto;
}

.gs3-nav-items {
  display: flex;
  gap: 2em;
}

.gs3-logo {
  padding: 0.5em 0.5em 0 0.5em;
  border-radius: 4px;
}

.gs3-logo a {
  font-size: 24px;
  font-weight: 800;
  color: #000;
}

.gs3-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2.5em;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: none;
}

.gs3-footer p:nth-child(1) {
  max-width: 360px;
}
`;

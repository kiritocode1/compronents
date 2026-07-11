"use client";

/**
 * Corridor Scene 3D - a brutalist sci-fi landing hero built around a GLTF
 * corridor. The scene rotates into place behind a stepped loader, then follows
 * the pointer with slow camera parallax while bloom and film grain shape the
 * final image.
 *
 * Fills its container. Three.js + postprocessing + GSAP.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import {
  BlendFunction,
  BloomEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
} from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const ASSET_BASE =
  "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/corridor-scene-3d";

export interface CorridorScene3DProps {
  modelSrc?: string;
  brand?: string;
  navItems?: string[];
  statement?: string;
  year?: string;
  credit?: string;
}

const DEFAULT_NAV_ITEMS = ["Apparel", "Events", "Archive"];
const COUNTER_STEPS = [0, 8, 19, 34, 52, 69, 84, 97, 100];

function CharacterText({ children }: { children: string }) {
  const words = children.split(" ");
  return words.map((word, wordIndex) => (
    <span className="cs3-word" key={`${word}-${wordIndex}`}>
      {word.split("").map((character, characterIndex) => (
        <span
          className="cs3-char"
          // ponytail: characters have no stable identity beyond their position.
          key={`${character}-${characterIndex}`}
        >
          {character}
        </span>
      ))}
      {wordIndex < words.length - 1 ? (
        <span className="cs3-space">{"\u00a0"}</span>
      ) : null}
    </span>
  ));
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const material of materials) material?.dispose();
  });
}

export default function CorridorScene3D({
  modelSrc = `${ASSET_BASE}/scene.gltf`,
  brand = "Astrolume",
  navItems = DEFAULT_NAV_ITEMS,
  statement = "Blending contemporary minimalism with futuristic innovation to create forms that transcend trends and define elegance.",
  year = "2026 [N]",
  credit = "/ Built by BLANK",
}: CorridorScene3DProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const loading = root.querySelector<HTMLElement>(".cs3-loading");
    const overlay = root.querySelector<HTMLElement>(".cs3-overlay");
    const counter = root.querySelector<HTMLElement>(".cs3-counter-value");
    const characters = root.querySelectorAll<HTMLElement>(
      ".cs3-char, .cs3-space",
    );

    const size = () => ({
      width: Math.max(root.clientWidth, 1),
      height: Math.max(root.clientHeight, 1),
    });
    const initialSize = size();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      75,
      initialSize.width / initialSize.height,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      canvas,
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
    });
    renderer.setSize(initialSize.width, initialSize.height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x000000, 0.5);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    const pointA = new THREE.PointLight(0xffffff, 2, 1);
    pointA.position.set(2, 3, 2);
    scene.add(pointA);

    const pointB = new THREE.PointLight(0xffffff, 2, 1);
    pointB.position.set(-2, 3, -2);
    scene.add(pointB);

    const initialAngle = Math.PI / 4;
    const radius = Math.sqrt(50);
    let currentAngle = initialAngle + Math.PI;
    let targetAngle = initialAngle;
    let currentY = 0;
    let targetY = 0;
    let animationComplete = false;
    let disposed = false;
    let model: THREE.Object3D | null = null;
    let introTimeline: gsap.core.Timeline | null = null;

    camera.position.set(
      Math.cos(currentAngle) * radius,
      currentY,
      Math.sin(currentAngle) * radius,
    );
    camera.lookAt(0, 0, 0);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new BloomEffect({
      intensity: 2,
      luminanceThreshold: 0.5,
      luminanceSmoothing: 0.25,
      mipmapBlur: true,
    });
    const grain = new NoiseEffect({
      blendFunction: BlendFunction.ADD,
      premultiply: true,
    });
    grain.blendMode.opacity.value = 0.15;
    composer.addPass(new EffectPass(camera, bloom, grain));

    const revealCharacters = () => {
      const textTimeline = gsap.timeline();
      textTimeline.to(characters, {
        opacity: 1,
        duration: 0.1,
        ease: "power2.inOut",
        stagger: { amount: 1, from: "random", repeat: 2, yoyo: true },
      });
      textTimeline.to(characters, {
        opacity: 1,
        duration: 0.15,
        ease: "power2.inOut",
        stagger: { amount: 1, from: "random" },
      });
      return textTimeline;
    };

    const startIntro = () => {
      if (!overlay || !counter) return;

      let currentStep = 0;
      introTimeline = gsap.timeline({
        onComplete: () => {
          animationComplete = true;
        },
      });
      introTimeline.to(
        {},
        {
          duration: 4,
          ease: "none",
          onUpdate() {
            const nextStep = Math.min(
              Math.floor(this.progress() * COUNTER_STEPS.length),
              COUNTER_STEPS.length - 1,
            );
            if (nextStep !== currentStep) {
              currentStep = nextStep;
              counter.textContent = String(COUNTER_STEPS[currentStep]);
            }
          },
          onComplete: () => {
            counter.textContent = "100";
          },
        },
      );
      introTimeline.to(
        counter.parentElement,
        {
          opacity: 0,
          duration: 0.75,
          ease: "power2.out",
        },
        "+=0.2",
      );

      const rotation = { angle: currentAngle };
      introTimeline.to(
        rotation,
        {
          angle: initialAngle,
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => {
            currentAngle = rotation.angle;
            camera.position.x = Math.cos(currentAngle) * radius;
            camera.position.z = Math.sin(currentAngle) * radius;
          },
        },
        "+=0.2",
      );
      introTimeline.to(
        overlay,
        {
          opacity: 0,
          duration: 1.5,
          ease: "power2.inOut",
          onComplete: () => {
            overlay.style.display = "none";
          },
        },
        "<",
      );
      introTimeline.add(revealCharacters(), "-=1");
    };

    const loader = new GLTFLoader();
    loader.load(
      modelSrc,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }

        model = gltf.scene;
        model.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const source = Array.isArray(mesh.material)
            ? mesh.material[0]
            : mesh.material;
          const sourceMaterial = source as THREE.MeshStandardMaterial;
          const texture = sourceMaterial?.map ?? null;
          if (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.flipY = false;
          }
          mesh.material = new THREE.MeshStandardMaterial({
            color: sourceMaterial?.color ?? new THREE.Color(0xffffff),
            map: texture,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0,
            roughness: 1,
            metalness: 0.125,
          });
          source?.dispose();
        });

        const center = new THREE.Box3()
          .setFromObject(model)
          .getCenter(new THREE.Vector3());
        model.position.sub(center);
        scene.add(model);
        if (loading) loading.style.display = "none";
        startIntro();
      },
      undefined,
      () => {
        if (loading) loading.textContent = "Scene unavailable";
        if (overlay) overlay.style.display = "none";
        gsap.set(characters, { opacity: 1 });
      },
    );

    const onPointerMove = (event: PointerEvent) => {
      if (!animationComplete) return;
      const rect = root.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      targetAngle = initialAngle - mouseX * 0.35;
      targetY = -mouseY * 1.5;
    };
    root.addEventListener("pointermove", onPointerMove);

    const onResize = () => {
      const next = size();
      camera.aspect = next.width / next.height;
      camera.updateProjectionMatrix();
      renderer.setSize(next.width, next.height, false);
      composer.setSize(next.width, next.height);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(root);

    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      if (animationComplete) {
        currentAngle += (targetAngle - currentAngle) * 0.025;
        currentY += (targetY - currentY) * 0.025;
        camera.position.x = Math.cos(currentAngle) * radius;
        camera.position.z = Math.sin(currentAngle) * radius;
        camera.position.y += (currentY - camera.position.y) * 0.05;
      }
      camera.lookAt(0, 0, 0);
      composer.render();
    };
    render();

    return () => {
      disposed = true;
      root.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      introTimeline?.kill();
      if (model) disposeObject(model);
      composer.dispose();
      renderer.dispose();
    };
  }, [modelSrc]);

  return (
    <div className="cs3-root" ref={rootRef}>
      <style>{styles}</style>
      <canvas className="cs3-canvas" ref={canvasRef} />
      <div className="cs3-loading">Loading scene</div>
      <div className="cs3-overlay">
        <div className="cs3-counter">
          <p className="cs3-counter-value">0</p>
        </div>
      </div>
      <div className="cs3-hero">
        <nav className="cs3-nav">
          <a href="#cs3-statement">
            <CharacterText>{brand.toUpperCase()}</CharacterText>
          </a>
          <div className="cs3-nav-items">
            {navItems.map((item) => (
              <a href="#cs3-statement" key={item}>
                <CharacterText>{item.toUpperCase()}</CharacterText>
              </a>
            ))}
          </div>
          <p>
            <CharacterText>{year.toUpperCase()}</CharacterText>
          </p>
        </nav>
        <h1 id="cs3-statement">
          <CharacterText>{statement.toUpperCase()}</CharacterText>
        </h1>
        <div className="cs3-footer">
          <p>
            <CharacterText>{credit.toUpperCase()}</CharacterText>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600&display=swap");

.cs3-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: #0f0f0f;
  color: #fff;
  font-family: "DM Mono", monospace;
}

.cs3-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.cs3-loading,
.cs3-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.cs3-loading {
  z-index: 5;
  pointer-events: none;
}

.cs3-overlay {
  background: #000;
}

.cs3-counter p {
  margin: 0;
}

.cs3-hero {
  position: absolute;
  inset: 0;
  z-index: 2;
  mix-blend-mode: difference;
  pointer-events: none;
}

.cs3-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 2rem;
}

.cs3-nav a,
.cs3-nav p,
.cs3-footer p {
  margin: 0;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 0.75rem;
  line-height: 1;
  pointer-events: auto;
}

.cs3-nav > p {
  text-align: right;
}

.cs3-nav-items {
  display: flex;
  gap: 2rem;
}

.cs3-root h1 {
  position: absolute;
  left: 2rem;
  bottom: 2rem;
  width: min(60%, 52rem);
  margin: 0;
  color: #fff;
  font-family: "Manrope", sans-serif;
  font-size: clamp(1.5rem, 3vw, 3.5rem);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  user-select: none;
}

.cs3-footer {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
}

.cs3-char,
.cs3-space {
  display: inline-block;
  opacity: 0;
}

.cs3-word {
  display: inline-block;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .cs3-nav {
    grid-template-columns: 1fr auto;
    padding: 1.25rem;
  }

  .cs3-nav-items {
    display: none;
  }

  .cs3-root h1 {
    left: 1.25rem;
    bottom: 5rem;
    width: calc(100% - 2.5rem);
  }

  .cs3-footer {
    left: 1.25rem;
    right: auto;
    bottom: 1.25rem;
  }
}
`;

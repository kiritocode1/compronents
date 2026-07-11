"use client";

/**
 * Spiral Gallery - a 3D helix of curved image tiles you scroll through.
 *
 * Image tiles are bent into shallow arcs and stacked along a descending helix.
 * The whole spiral idles with a slow rotation, picks up spin from scroll
 * velocity, and tilts toward the cursor with eased parallax, while the camera
 * descends through the coil as you scroll. A small facing shader brightens tiles
 * as they turn to face you. Three.js + Lenis, no animation library.
 *
 * By default it owns a Lenis-smoothed scroll container, so it embeds in a
 * bounded box. Pass embedded={false} to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface SpiralGalleryProps {
  /** Images cycled around the helix. */
  images?: string[];
  heading?: string;
  aboutText?: string;
  heroBackground?: string;
  aboutBackground?: string;
  textColor?: string;
  /** Own an internal scroll container (true) or use the window scroll (false). */
  embedded?: boolean;
}

const COMPRONENTS_ASSET_BASE = "https://ui.aryank.space/assets/spiral-gallery";
const DEFAULT_IMAGES = Array.from(
  { length: 12 },
  (_, i) => `${COMPRONENTS_ASSET_BASE}/img-${i + 1}.jpg`,
);

const CONFIG = {
  tilesPerRevolution: 15,
  revolutions: 5,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  tileSegments: 24,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
};

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float facing = max(dot(-normalize(vWorldNormal), viewDir), 0.0);
    float falloff = smoothstep(-0.2, 0.5, facing) * 0.45 + 0.42;
    vec3 color = mix(vec3(1.0), tex.rgb * falloff, 0.975) * 1.25;
    gl_FragColor = vec4(color, tex.a);
  }
`;

export default function SpiralGallery({
  images = DEFAULT_IMAGES,
  heading = "Somewhere between structure and disorder new forms quietly start to emerge",
  aboutText = "New forms begin here",
  heroBackground = "#242424",
  aboutBackground = "#171717",
  textColor = "#d2d2d2",
  embedded = true,
}: SpiralGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const host = canvasHostRef.current;
    const scroller = scrollerRef.current;
    const content = contentRef.current;
    if (!root || !host || !scroller || !content) return;

    const totalImages = images.length;
    const totalTiles = Math.floor(
      CONFIG.tilesPerRevolution * CONFIG.revolutions,
    );
    const angleStep = (Math.PI * 2) / CONFIG.tilesPerRevolution;

    let viewW = root.clientWidth;
    let viewH = root.clientHeight;
    let isMobile = viewW < 1000;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, viewW / viewH, 0.1, 1000);
    camera.position.z = isMobile ? 15 : CONFIG.cameraZ;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(viewW, viewH);
    host.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const textures = images.map((src) =>
      textureLoader.load(src, (t) => {
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }),
    );

    const cameraPositionUniform = {
      value: new THREE.Vector3(0, 0, CONFIG.cameraZ),
    };

    const tileEdgesY = [0];
    for (let i = 0; i < totalTiles; i++) {
      const progress = i / totalTiles;
      const radius =
        CONFIG.startRadius + (CONFIG.endRadius - CONFIG.startRadius) * progress;
      const arcWidth = (2 * Math.PI * radius) / CONFIG.tilesPerRevolution;
      const tileHeight = arcWidth * CONFIG.tileHeightRatio;
      tileEdgesY.push(
        tileEdgesY[i] -
          (tileHeight + CONFIG.spiralGap) / CONFIG.tilesPerRevolution,
      );
    }

    const spiral = new THREE.Group();
    scene.add(spiral);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.ShaderMaterial[] = [];

    for (let i = 0; i < totalTiles; i++) {
      const progress = i / totalTiles;
      const radius =
        CONFIG.startRadius + (CONFIG.endRadius - CONFIG.startRadius) * progress;
      const arcWidth = (2 * Math.PI * radius) / CONFIG.tilesPerRevolution;
      const tileHeight = arcWidth * CONFIG.tileHeightRatio;
      const tileAngle = arcWidth / radius + CONFIG.tileOverlap;

      const centerY = (tileEdgesY[i] + tileEdgesY[i + 1]) / 2;
      const slope = tileEdgesY[i + 1] - tileEdgesY[i];

      const positions: number[] = [];
      const uvCoords: number[] = [];
      const indices: number[] = [];
      const segments = CONFIG.tileSegments;

      for (let row = 0; row <= 1; row++) {
        for (let col = 0; col <= segments; col++) {
          const angle = (col / segments - 0.5) * tileAngle;
          positions.push(
            Math.sin(angle) * radius,
            (row - 0.5) * tileHeight + (col / segments - 0.5) * slope,
            Math.cos(angle) * radius,
          );
          uvCoords.push(col / segments, row);
        }
      }

      for (let col = 0; col < segments; col++) {
        const current = col;
        const below = current + segments + 1;
        indices.push(
          current,
          below,
          current + 1,
          below,
          below + 1,
          current + 1,
        );
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(uvCoords, 2),
      );
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometries.push(geometry);

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uMap: { value: textures[i % totalImages] },
          uCameraPosition: cameraPositionUniform,
        },
        side: THREE.DoubleSide,
      });
      materials.push(material);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = centerY;

      const tile = new THREE.Group();
      tile.rotation.y = i * angleStep;
      tile.add(mesh);
      spiral.add(tile);
    }

    const spiralHeight = Math.abs(tileEdgesY[totalTiles]);

    let scrollY = 0;
    let spinVelocity = 0;

    const lenis = embedded
      ? new Lenis({ wrapper: scroller, content })
      : new Lenis();
    lenis.on("scroll", (e: { scroll: number; velocity: number }) => {
      scrollY = e.scroll;
      spinVelocity = e.velocity * CONFIG.scrollRotationMultiplier;
    });

    let mouseX = 0;
    let mouseY = 0;
    let smoothX = 0;
    let smoothY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouseY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    root.addEventListener("mousemove", onMouseMove);

    let frame = 0;
    const animate = (time: number) => {
      lenis.raf(time);

      const progress = Math.min(scrollY / (viewH * CONFIG.scrollMultiplier), 1);
      camera.position.y +=
        (-(progress * spiralHeight * CONFIG.cameraYMultiplier) -
          camera.position.y) *
        CONFIG.cameraSmoothing;

      if (!isMobile) {
        smoothX += (mouseX - smoothX) * 0.02;
        smoothY += (mouseY - smoothY) * 0.02;
        spiral.rotation.x = smoothY * CONFIG.parallaxStrength;
        spiral.rotation.z = -smoothX * CONFIG.parallaxStrength * 0.3;
      }

      cameraPositionUniform.value.copy(camera.position);
      spiral.rotation.y += CONFIG.baseRotationSpeed + spinVelocity;
      spinVelocity *= CONFIG.rotationDecay;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    const resize = () => {
      viewW = root.clientWidth;
      viewH = root.clientHeight;
      isMobile = viewW < 1000;
      camera.aspect = viewW / viewH;
      camera.position.z = isMobile ? 15 : CONFIG.cameraZ;
      camera.updateProjectionMatrix();
      renderer.setSize(viewW, viewH);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("mousemove", onMouseMove);
      lenis.destroy();
      for (const t of textures) t.dispose();
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [images, embedded]);

  return (
    <div
      ref={rootRef}
      className={embedded ? "sg-root sg-embedded" : "sg-root"}
      style={
        {
          "--sg-hero-bg": heroBackground,
          "--sg-about-bg": aboutBackground,
          "--sg-text": textColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="sg-canvas" ref={canvasHostRef} />
      <div className="sg-scroller" ref={scrollerRef}>
        <div className="sg-content" ref={contentRef}>
          <section className="sg-hero">
            <h2>{heading}</h2>
          </section>
          <section className="sg-about">
            <h3>{aboutText}</h3>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = `
.sg-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  overflow: hidden;
  container-type: inline-size;
  background: linear-gradient(var(--sg-hero-bg), var(--sg-about-bg));
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.sg-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.sg-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.sg-root.sg-embedded .sg-scroller {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.sg-root.sg-embedded .sg-scroller::-webkit-scrollbar {
  display: none;
}

.sg-content {
  width: 100%;
}

.sg-hero,
.sg-about {
  position: relative;
  width: 100%;
  padding: 2rem;
  color: var(--sg-text);
  overflow: hidden;
}

.sg-hero {
  height: 150svh;
  background: transparent;
  text-align: justify;
}
.sg-about {
  height: 100svh;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.sg-root.sg-embedded .sg-hero {
  height: 150cqh;
}
.sg-root.sg-embedded .sg-about {
  height: 100cqh;
}

.sg-hero h2,
.sg-about h3 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: -0.04em;
  line-height: 0.85;
  font-weight: 500;
}
.sg-hero h2 {
  font-size: clamp(2.5rem, 10cqw, 12rem);
}
.sg-about h3 {
  font-size: clamp(2rem, 5cqw, 7.5rem);
}
`;

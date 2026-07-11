"use client";

/**
 * Fractal Glass Hover - a hero image seen through a bank of vertical fluted
 * glass: a WebGL shader slices the image into ~35 stripes and refracts each
 * one, then eased cursor movement drives a subtle parallax that pushes harder
 * where the distortion is strongest, so the surface reads like real ribbed
 * glass reacting to the pointer. Three.js + WebGL.
 *
 * Fills its container, so it drops into any bounded box or a full-screen
 * section. Pass your own `imgSrc`.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

// WebGL TextureLoader fetches crossOrigin, so it must hit a CORS-enabled origin
// directly; the Blob public origin sends ACAO:* with no redirect (the /assets
// redirect does not preserve CORS for the crossOrigin request).
const ASSET_BASE =
  "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/fractal-glass-hover";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uTextureSize;
  uniform vec2 uMouse;
  uniform float uParallaxStrength;
  uniform float uDistortionMultiplier;
  uniform float uGlassStrength;
  uniform float ustripesFrequency;
  uniform float uglassSmoothness;
  uniform float uEdgePadding;

  varying vec2 vUv;

  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;
    vec2 s = uResolution / textureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
  }

  float displacement(float x, float num_stripes, float strength) {
    float modulus = 1.0 / num_stripes;
    return mod(x, modulus) * strength;
  }

  float fractalGlass(float x) {
    float d = 0.0;
    for (int i = -5; i <= 5; i++) {
      d += displacement(x + float(i) * uglassSmoothness, ustripesFrequency, uGlassStrength);
    }
    d = d / 11.0;
    return x + d;
  }

  float smoothEdge(float x, float padding) {
    float edge = padding;
    if (x < edge) {
      return smoothstep(0.0, edge, x);
    } else if (x > 1.0 - edge) {
      return smoothstep(1.0, 1.0 - edge, x);
    }
    return 1.0;
  }

  void main() {
    vec2 uv = vUv;
    float originalX = uv.x;
    float edgeFactor = smoothEdge(originalX, uEdgePadding);
    float distortedX = fractalGlass(originalX);
    uv.x = mix(originalX, distortedX, edgeFactor);
    float distortionFactor = uv.x - originalX;
    float parallaxDirection = -sign(0.5 - uMouse.x);
    vec2 parallaxOffset = vec2(
      parallaxDirection * abs(uMouse.x - 0.5) * uParallaxStrength * (1.0 + abs(distortionFactor) * uDistortionMultiplier),
      0.0
    );
    parallaxOffset *= edgeFactor;
    uv += parallaxOffset;
    vec2 coverUV = getCoverUV(uv, uTextureSize);
    if (coverUV.x < 0.0 || coverUV.x > 1.0 || coverUV.y < 0.0 || coverUV.y > 1.0) {
      coverUV = clamp(coverUV, 0.0, 1.0);
    }
    gl_FragColor = texture2D(uTexture, coverUV);
  }
`;

export interface FractalGlassHoverProps {
  imgSrc?: string;
  logo?: string;
  navLinks?: string[];
  headline?: string;
  caption?: string;
  lerpFactor?: number;
  parallaxStrength?: number;
  distortionMultiplier?: number;
  glassStrength?: number;
  glassSmoothness?: number;
  stripesFrequency?: number;
  edgePadding?: number;
}

const DEFAULT_NAV = ["Experiments", "Objects", "Exhibits"];

export default function FractalGlassHover({
  imgSrc = `${ASSET_BASE}/hero.jpg`,
  logo = "Ω Glassform",
  navLinks = DEFAULT_NAV,
  headline = "Designed for the space between silence and noise.",
  caption = "Built by BLANK",
  lerpFactor = 0.035,
  parallaxStrength = 0.1,
  distortionMultiplier = 10,
  glassStrength = 2.0,
  glassSmoothness = 0.0001,
  stripesFrequency = 35,
  edgePadding = 0.1,
}: FractalGlassHoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    const host = canvasHostRef.current;
    const root = rootRef.current;
    if (!host || !root) return;

    const size = () => ({
      w: host.clientWidth || 1,
      h: host.clientHeight || 1,
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const initial = size();
    renderer.setSize(initial.w, initial.h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(initial.w, initial.h) },
        uTextureSize: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uParallaxStrength: { value: parallaxStrength },
        uDistortionMultiplier: { value: distortionMultiplier },
        uGlassStrength: { value: glassStrength },
        ustripesFrequency: { value: stripesFrequency },
        uglassSmoothness: { value: glassSmoothness },
        uEdgePadding: { value: edgePadding },
      },
      vertexShader,
      fragmentShader,
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const loader = new THREE.TextureLoader();
    loader.load(imgSrc, (texture) => {
      texture.needsUpdate = true;
      const img = texture.image as HTMLImageElement;
      material.uniforms.uTexture.value = texture;
      material.uniforms.uTextureSize.value.set(
        img.naturalWidth || img.width,
        img.naturalHeight || img.height,
      );
    });

    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      const { w, h } = size();
      renderer.setSize(w, h);
      material.uniforms.uResolution.value.set(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    let raf = 0;
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      mouse.x = lerp(mouse.x, target.x, lerpFactor);
      mouse.y = lerp(mouse.y, target.y, lerpFactor);
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      cancelAnimationFrame(raf);
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      materialRef.current = null;
    };
  }, [imgSrc, lerpFactor]);

  // Live-update tuning uniforms without rebuilding the scene.
  useEffect(() => {
    const m = materialRef.current;
    if (!m) return;
    m.uniforms.uParallaxStrength.value = parallaxStrength;
    m.uniforms.uDistortionMultiplier.value = distortionMultiplier;
    m.uniforms.uGlassStrength.value = glassStrength;
    m.uniforms.ustripesFrequency.value = stripesFrequency;
    m.uniforms.uglassSmoothness.value = glassSmoothness;
    m.uniforms.uEdgePadding.value = edgePadding;
  }, [
    parallaxStrength,
    distortionMultiplier,
    glassStrength,
    stripesFrequency,
    glassSmoothness,
    edgePadding,
  ]);

  return (
    <div className="fgh-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="fgh-nav">
        <div className="fgh-logo">
          <a href="#">{logo}</a>
        </div>
        <div className="fgh-nav-links">
          {navLinks.map((link) => (
            <a href="#" key={link}>
              {link}
            </a>
          ))}
        </div>
      </nav>

      <section className="fgh-hero">
        <div className="fgh-canvas" ref={canvasHostRef} />
        <div className="fgh-hero-content">
          <h1>{headline}</h1>
          <p>{caption}</p>
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.fgh-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #000;
  color: #fff;
  font-family: "Manrope", sans-serif;
}

.fgh-root h1 {
  font-size: 4rem;
  font-weight: 500;
  letter-spacing: -0.1rem;
  line-height: 1;
}

.fgh-root a,
.fgh-root p {
  color: #fff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 550;
  line-height: 1;
  display: inline-block;
}

.fgh-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 2;
}

.fgh-nav-links {
  display: flex;
  gap: 0.75rem;
}

.fgh-hero {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
}

.fgh-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.fgh-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.fgh-hero-content {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 1;
  pointer-events: none;
}

.fgh-hero-content h1 {
  width: 60%;
}

@media (max-width: 1000px) {
  .fgh-hero-content {
    align-items: flex-start;
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .fgh-hero-content h1 {
    width: 100%;
  }
}
`;

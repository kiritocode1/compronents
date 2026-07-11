"use client";

/**
 * Inversion Lens Hover - a WebGL image where a soft circular lens tracks the
 * cursor and inverts a grayscale version of the image inside it. The lens edge
 * is broken up by 8-octave turbulence scrolling over time, so the boundary
 * churns like a living blot; the lens eases open on enter and closes when the
 * pointer leaves or the element scrolls out of view. Three.js + WebGL.
 *
 * Fills its container, so it drops into any bounded box or a full-screen
 * section. Pass your own `src`.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

// WebGL TextureLoader fetches crossOrigin, so it must hit a CORS-enabled origin
// directly; the Blob public origin sends ACAO:* with no redirect (the /assets
// redirect does not preserve CORS for the crossOrigin request).
const ASSET_BASE =
  "https://zs4kp2p2okhfnarl.public.blob.vercel-storage.com/inversion-lens-hover";

const vertexShader = `
  varying vec2 v_uv;

  void main() {
    v_uv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_radius;
  uniform float u_speed;
  uniform float u_imageAspect;
  uniform float u_turbulenceIntensity;

  varying vec2 v_uv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float turbulence(vec2 p) {
    float t = 0.0;
    float w = 0.5;
    for (int i = 0; i < 8; i++) {
      t += abs(noise(p)) * w;
      p *= 2.0;
      w *= 0.5;
    }
    return t;
  }

  void main() {
    vec2 uv = v_uv;
    float screenAspect = u_resolution.x / u_resolution.y;
    float ratio = u_imageAspect / screenAspect;

    vec2 texCoord = vec2(
      mix(0.5 - 0.5 / ratio, 0.5 + 0.5 / ratio, uv.x),
      uv.y
    );

    vec4 tex = texture2D(u_texture, texCoord);
    float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 invertedGray = vec3(1.0 - gray);

    vec2 correctedUV = uv;
    correctedUV.x *= screenAspect;
    vec2 correctedMouse = u_mouse;
    correctedMouse.x *= screenAspect;

    float dist = distance(correctedUV, correctedMouse);

    float jaggedDist = dist + (turbulence(uv * 25.0 + u_time * u_speed) - 0.5) * u_turbulenceIntensity;

    float mask = step(jaggedDist, u_radius);

    vec3 finalColor = mix(invertedGray, tex.rgb, 1.0 - mask);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export interface InversionLensHoverProps {
  src?: string;
  maskRadius?: number;
  maskSpeed?: number;
  lerpFactor?: number;
  radiusLerpSpeed?: number;
  turbulenceIntensity?: number;
}

export default function InversionLensHover({
  src = `${ASSET_BASE}/portrait.jpeg`,
  maskRadius = 0.15,
  maskSpeed = 0.75,
  lerpFactor = 0.05,
  radiusLerpSpeed = 0.1,
  turbulenceIntensity = 0.075,
}: InversionLensHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targetMouse = new THREE.Vector2(0.5, 0.5);
    const lerpedMouse = new THREE.Vector2(0.5, 0.5);
    let targetRadius = 0.0;
    let isInView = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let raf = 0;
    let disposed = false;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.OrthographicCamera | null = null;
    let uniforms: Record<string, { value: unknown }> | null = null;

    const loader = new THREE.TextureLoader();
    loader.load(src, (texture) => {
      if (disposed || !container) return;

      const imageAspect = texture.image.width / texture.image.height;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 16;

      scene = new THREE.Scene();
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      uniforms = {
        u_texture: { value: texture },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_radius: { value: 0.0 },
        u_speed: { value: maskSpeed },
        u_imageAspect: { value: imageAspect },
        u_turbulenceIntensity: { value: turbulenceIntensity },
      };

      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });
      scene.add(new THREE.Mesh(geometry, material));

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      const animate = () => {
        raf = requestAnimationFrame(animate);
        if (!uniforms || !renderer || !scene || !camera) return;
        lerpedMouse.lerp(targetMouse, lerpFactor);
        (uniforms.u_mouse.value as THREE.Vector2).copy(lerpedMouse);
        uniforms.u_time.value = (uniforms.u_time.value as number) + 0.01;
        uniforms.u_radius.value =
          (uniforms.u_radius.value as number) +
          (targetRadius - (uniforms.u_radius.value as number)) *
            radiusLerpSpeed;
        renderer.render(scene, camera);
      };
      animate();
    });

    const updateCursorState = (x: number, y: number) => {
      lastMouseX = x;
      lastMouseY = y;
      const rect = container.getBoundingClientRect();
      const inside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (inside) {
        targetMouse.x = (x - rect.left) / rect.width;
        targetMouse.y = 1.0 - (y - rect.top) / rect.height;
        targetRadius = maskRadius;
      } else {
        targetRadius = 0.0;
      }
    };

    const onMouseMove = (e: MouseEvent) =>
      updateCursorState(e.clientX, e.clientY);
    const onScroll = () => updateCursorState(lastMouseX, lastMouseY);
    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isInView = entry.isIntersecting;
          if (!isInView) targetRadius = 0.0;
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(container);

    const onResize = () => {
      if (!renderer || !uniforms || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      (uniforms.u_resolution.value as THREE.Vector2).set(width, height);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      ro.disconnect();
      if (renderer) {
        const canvas = renderer.domElement;
        if (canvas.parentNode === container) container.removeChild(canvas);
        renderer.dispose();
      }
    };
  }, [
    src,
    maskRadius,
    maskSpeed,
    lerpFactor,
    radiusLerpSpeed,
    turbulenceIntensity,
  ]);

  return (
    <div className="ilh-root" ref={containerRef}>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.ilh-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
}

.ilh-root canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
`;

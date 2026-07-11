"use client";

/**
 * CRT Display - a 3D monitor whose screen swaps images with a glitch.
 *
 * A GLB monitor model sits in a lit scene and follows the cursor with an eased
 * parallax tilt. A curved screen plane is drawn by a CRT shader: scanlines, an
 * aperture-grille mask, vignette, chromatic split, and a noisy RGB tear that
 * spikes to full whenever the displayed image changes, then decays. Hovering a
 * project name loads that image onto the tube; leaving resets to the default.
 *
 * Fills its container, so it drops into a bounded box or a full-screen section.
 * Three.js + WebGL, no animation library.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import { preload } from "react-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface CrtProject {
  label: string;
  image: string;
}

export interface CrtDisplayProps {
  /** Monitor model URL (.glb / .gltf), same-origin or CORS-enabled. */
  src?: string;
  /** Image shown at rest and on pointer leave. */
  defaultImage?: string;
  /** Project names and the image each one shows on hover. */
  projects?: CrtProject[];
  /** Backdrop color behind the monitor. */
  background?: string;
  /** Tone-mapping exposure. */
  exposure?: number;
}

const COMPRONENTS_ASSET_BASE = "https://ui.aryank.space/assets/crt-display";

const DEFAULT_PROJECTS: CrtProject[] = [
  { label: "District", image: `${COMPRONENTS_ASSET_BASE}/project-img-1.jpg` },
  { label: "Waypoint", image: `${COMPRONENTS_ASSET_BASE}/project-img-2.jpg` },
  { label: "Corridor", image: `${COMPRONENTS_ASSET_BASE}/project-img-3.jpg` },
  { label: "Archive", image: `${COMPRONENTS_ASSET_BASE}/project-img-4.jpg` },
  { label: "Terminal", image: `${COMPRONENTS_ASSET_BASE}/project-img-5.jpg` },
];

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D map;
  uniform float imageAspect, planeAspect, glitchIntensity, time;
  uniform vec2 iResolution;
  varying vec2 vUv;

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  vec2 coverUV(vec2 uv) {
    if (planeAspect > imageAspect) {
      float s = imageAspect / planeAspect;
      uv.y = uv.y * s + (1.0 - s) * 0.5;
    } else {
      float s = planeAspect / imageAspect;
      uv.x = uv.x * s + (1.0 - s) * 0.5;
    }
    return uv;
  }

  void main() {
    vec2 uv = vUv;
    float gi = glitchIntensity;

    uv.x += (hash(floor(uv.y * 20.0 + time * 80.0) + time * 7.0) - 0.5) * 2.0 * gi * 0.15;
    uv.y += (hash(floor(time * 50.0)) - 0.5) * gi * 0.06;

    float rs = 0.001 + gi * 0.025;

    vec3 col;
    col.r = texture2D(map, coverUV(vec2(uv.x + rs, uv.y + rs))).r + 0.05;
    col.g = texture2D(map, coverUV(vec2(uv.x, uv.y - rs * 2.0))).g + 0.05;
    col.b = texture2D(map, coverUV(vec2(uv.x - rs * 2.0, uv.y))).b + 0.05;

    col.r += 0.08 * texture2D(map, coverUV(vec2(uv.x + 0.026, uv.y - 0.026))).r;
    col.g += 0.05 * texture2D(map, coverUV(vec2(uv.x - 0.022, uv.y - 0.022))).g;
    col.b += 0.08 * texture2D(map, coverUV(vec2(uv.x - 0.022, uv.y - 0.018))).b;

    col = clamp(col * 0.93 + 0.07 * col * col, 0.0, 1.0);
    col *= vec3(pow(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.12));
    col *= vec3(0.95, 1.05, 0.95) * 2.5;
    col *= vec3(0.6 + 0.4 * pow(clamp(0.35 + 0.35 * sin(uv.y * iResolution.y * 1.5), 0.0, 1.0), 1.2));
    col *= 1.0 - 0.65 * vec3(clamp((mod(vUv.x * iResolution.x, 2.0) - 1.0) * 2.0, 0.0, 1.0));
    col += vec3(hash(uv.x * 100.0 + uv.y * 1000.0 + time * 300.0) * gi * 0.3);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function createScreenGeometry(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geometry = new THREE.ShapeGeometry(shape);
  const positions = geometry.attributes.position;
  const uvs = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {
    uvs[i * 2] = (positions.getX(i) - x) / w;
    uvs[i * 2 + 1] = (positions.getY(i) - y) / h;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return geometry;
}

export default function CrtDisplay({
  src = `${COMPRONENTS_ASSET_BASE}/monitor.glb`,
  defaultImage = `${COMPRONENTS_ASSET_BASE}/project-img-1.jpg`,
  projects = DEFAULT_PROJECTS,
  background = "#b0b0b0",
  exposure = 1.25,
}: CrtDisplayProps) {
  preload(src, {
    as: "fetch",
    fetchPriority: "high",
    crossOrigin: "anonymous",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const list = listRef.current;
    if (!container || !list) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(0, 0.15, 1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(15, 10, -5);
    scene.add(dirLight);
    const topLight = new THREE.PointLight(0xffffff, 5, 10);
    topLight.position.set(-5, -2.5, 0);
    topLight.decay = 0.3;
    scene.add(topLight);

    const monitorGroup = new THREE.Group();
    scene.add(monitorGroup);

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(src, (gltf) => {
      if (disposed) return;
      const model = gltf.scene;
      const center = new THREE.Box3()
        .setFromObject(model)
        .getCenter(new THREE.Vector3());
      model.position.sub(center);
      monitorGroup.add(model);
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const textureCache: Record<string, THREE.Texture> = {};

    const loadTexture = (source: string) => {
      if (textureCache[source]) return textureCache[source];
      const texture = textureLoader.load(source, (t) => {
        displayMaterial.uniforms.imageAspect.value =
          t.image.width / t.image.height;
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      textureCache[source] = texture;
      return texture;
    };

    const displayMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: loadTexture(defaultImage) },
        imageAspect: { value: 1 },
        planeAspect: { value: 0.28 / 0.235 },
        iResolution: { value: new THREE.Vector2(512, 512) },
        glitchIntensity: { value: 0 },
        time: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });

    const displayPlane = new THREE.Mesh(
      createScreenGeometry(1, 1, 0.03),
      displayMaterial,
    );
    displayPlane.scale.set(0.28, 0.235, 1);
    displayPlane.position.set(-0.008, 0.005, 0.041);
    displayPlane.rotation.set(-0.18, 0, 0);
    monitorGroup.add(displayPlane);

    const mouse = { x: 0, y: 0 };
    const lerped = { x: 0, y: 0 };
    let glitch = 0;
    const clock = new THREE.Clock();

    const setDisplayImage = (source: string) => {
      displayMaterial.uniforms.map.value = loadTexture(source);
      glitch = 1;
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 10;
      mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 5;
    };
    container.addEventListener("mousemove", onMouseMove);

    const projectEls = Array.from(
      list.querySelectorAll<HTMLElement>("[data-img]"),
    );
    const enterHandlers = projectEls.map((el, i) => {
      const handler = () => setDisplayImage(projects[i]?.image ?? defaultImage);
      el.addEventListener("mouseenter", handler);
      return handler;
    });
    const onListLeave = () => setDisplayImage(defaultImage);
    list.addEventListener("mouseleave", onListLeave);

    let frame = 0;
    const animate = () => {
      displayMaterial.uniforms.time.value = clock.getElapsedTime();

      lerped.x += (mouse.x - lerped.x) * 0.05;
      lerped.y += (mouse.y - lerped.y) * 0.05;
      monitorGroup.rotation.x = lerped.y * 0.15;
      monitorGroup.rotation.y = lerped.x * 0.3;

      if (glitch > 0.0001) {
        glitch *= 0.9;
      } else {
        glitch = 0;
      }
      displayMaterial.uniforms.glitchIntensity.value = glitch;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.position.z = Math.max(1, 768 / width);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      list.removeEventListener("mouseleave", onListLeave);
      projectEls.forEach((el, i) => {
        el.removeEventListener("mouseenter", enterHandlers[i]);
      });
      for (const key in textureCache) textureCache[key].dispose();
      displayMaterial.dispose();
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
  }, [src, defaultImage, projects, exposure]);

  return (
    <div className="crt-root" ref={containerRef} style={{ background }}>
      <style>{styles}</style>
      <ul className="crt-projects" ref={listRef}>
        {projects.map((project) => (
          <li key={project.label} data-img={project.image}>
            {project.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = `
.crt-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 480px;
  overflow: hidden;
}
.crt-root canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.crt-projects {
  position: absolute;
  left: 50%;
  bottom: 2.5rem;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 2rem;
  list-style: none;
  margin: 0;
  z-index: 2;
}

.crt-projects li {
  text-transform: uppercase;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 450;
  letter-spacing: 0.02em;
  color: #000;
  width: max-content;
  padding: 0.5rem 1rem;
  background-color: #fff;
  border: 1px solid #000;
  box-shadow: 4px 4px 0 -1px rgba(0, 0, 0, 1);
  cursor: pointer;
  transition: color 150ms ease, background-color 150ms ease;
}

.crt-projects li:hover {
  color: #fff;
  background-color: #000;
}
`;

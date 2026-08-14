"use client";

/**
 * Fisheye Scroll - a pinned poster whose word is a repeating marquee sampled
 * through a WebGL lens. Scroll slides the strip from left to right.
 *
 * Two stacks, two lenses. Behind: the strip sits under the cutout and the
 * lens inverts so the sides grow around the figure. Forward: a second,
 * transparent strip sits over the person and enlarges from the middle, so
 * the face stays visible through the letterforms.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { type CSSProperties, useEffect, useRef } from "react";
import * as THREE from "three";

const ASSET_BASE = "https://ui.aryank.space/assets/fisheye-scroll";
const FONT_HREF = "https://fonts.googleapis.com/css2?family=Anton&display=swap";
const COPIES = 6;

export type FisheyeEffect = "behind" | "forward" | "both";

export interface FisheyeScrollProps {
  text?: string;
  portraitSrc?: string;
  background?: string;
  textColor?: string;
  /** behind: under the person. forward: over the person. both: both stacks. */
  effect?: FisheyeEffect;
  intensity?: number;
  zoom?: number;
  portraitScale?: number;
  outroText?: string;
  embedded?: boolean;
  className?: string;
  style?: CSSProperties;
}

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
uniform sampler2D uMap;
uniform vec3 uBg;
uniform vec2 uRes;
uniform float uOffset;
uniform float uCenter;
uniform float uEdge;
uniform float uCurve;
uniform float uRepeat;
uniform float uYZoom;
uniform float uFillBg;

varying vec2 vUv;

void main() {
  vec2 p = vUv - 0.5;
  float aspect = uRes.x / max(uRes.y, 1.0);
  p.x *= aspect;

  // Horizontal-weighted radius: the word is a mid band, so the lens
  // has to change scale left-to-right more than it bows the baseline.
  float r2 = p.x * p.x * 0.82 + p.y * p.y * 0.28;
  float t = clamp(pow(r2 * uCurve, 0.85), 0.0, 1.0);
  float zoom = mix(uCenter, uEdge, t);
  zoom = max(zoom, 0.06);
  p *= zoom;
  p.x /= aspect;

  vec2 sampleUv = p + 0.5;
  sampleUv.x = sampleUv.x * uRepeat + uOffset;
  sampleUv.y = (sampleUv.y - 0.5) * uYZoom + 0.5;

  if (sampleUv.y < -0.02 || sampleUv.y > 1.02) {
    gl_FragColor = uFillBg > 0.5 ? vec4(uBg, 1.0) : vec4(0.0);
    return;
  }

  vec4 ink = texture2D(uMap, sampleUv);
  vec3 field = uBg * (1.0 - 0.07 * r2);
  if (uFillBg > 0.5) {
    gl_FragColor = vec4(mix(field, ink.rgb, ink.a), 1.0);
    return;
  }
  gl_FragColor = vec4(ink.rgb, ink.a);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.padEnd(6, "0").slice(0, 6);
  const n = Number.parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function ensureAnton() {
  if (!document.querySelector(`link[data-fys-anton="1"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    link.setAttribute("data-fys-anton", "1");
    document.head.appendChild(link);
  }
  return document.fonts.load("400 200px Anton");
}

function paintMarquee(text: string, textColor: string): HTMLCanvasElement {
  const word = (text.trim() || "GIANTS").toUpperCase();
  const height = 1024;
  const probe = document.createElement("canvas");
  const probeCtx = probe.getContext("2d");
  const fontSize = height * 0.58;
  if (!probeCtx) {
    const empty = document.createElement("canvas");
    empty.width = 64;
    empty.height = 64;
    return empty;
  }
  probeCtx.font = `400 ${fontSize}px Anton, Impact, sans-serif`;
  const wordW = Math.max(1, probeCtx.measureText(word).width);
  const gap = wordW * 0.22;
  const tile = wordW + gap;
  const width = Math.ceil(tile * COPIES);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.font = `400 ${fontSize}px Anton, Impact, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = textColor;
  for (let i = 0; i < COPIES; i++) {
    ctx.fillText(word, i * tile, height / 2);
  }
  return canvas;
}

interface Layer {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  resize: (w: number, h: number) => void;
  render: () => void;
  dispose: () => void;
}

function makeLayer(
  parent: HTMLElement,
  texture: THREE.Texture,
  bg: THREE.Vector3,
  opts: { fillBg: boolean; sign: number; className: string },
): Layer {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uBg: { value: bg },
      uRes: { value: new THREE.Vector2(1, 1) },
      uOffset: { value: 0 },
      uCenter: { value: opts.sign < 0 ? 0.88 : 0.2 },
      uEdge: { value: opts.sign < 0 ? 0.3 : 0.78 },
      uCurve: { value: 1.6 },
      uRepeat: { value: 0.2 },
      uYZoom: { value: 1.05 },
      uFillBg: { value: opts.fillBg ? 1 : 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: !opts.fillBg,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: !opts.fillBg,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, opts.fillBg ? 1 : 0);
  renderer.domElement.className = `fys-canvas ${opts.className}`;
  parent.appendChild(renderer.domElement);

  return {
    renderer,
    scene,
    camera,
    mesh,
    resize(w, h) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      material.uniforms.uRes.value.set(w, h);
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export default function FisheyeScroll({
  text = "GIANTS",
  portraitSrc = `${ASSET_BASE}/portrait.png`,
  background = "#e83210",
  textColor = "#f1cbb6",
  effect = "behind",
  intensity = 1,
  zoom = 1,
  portraitScale = 1,
  outroText = "The word holds.",
  embedded = true,
  className,
  style,
}: FisheyeScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const backHost = backRef.current;
    const frontHost = frontRef.current;
    if (!root || !backHost || !frontHost) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".fys-content");
    const hero = root.querySelector<HTMLElement>(".fys-hero");
    if (!content || !hero) return;

    let disposed = false;
    let back: Layer | null = null;
    let front: Layer | null = null;
    let texture: THREE.CanvasTexture | null = null;
    let trigger: ScrollTrigger | undefined;
    let progress = 0;
    let raf = 0;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const viewportHeight = embedded
      ? (root.clientHeight ?? window.innerHeight)
      : window.innerHeight;

    const apply = () => {
      const travel = 1 / COPIES;
      const offset = 0.06 + progress * travel * 2.4;
      const closeness = Math.max(0.45, Math.min(1.4, zoom));
      const gain = Math.max(0.35, intensity);

      if (back) {
        const u = back.mesh.material.uniforms;
        // Rest pose hides the middle of the word under the figure.
        u.uOffset.value = offset;
        // Invert: pinch the middle (hidden by the figure), grow the sides.
        u.uCenter.value = 0.78 / closeness;
        u.uEdge.value = 0.34 / Math.max(0.7, gain) / closeness;
        u.uCurve.value = 1.15 + 0.25 * gain;
        u.uRepeat.value = 0.17 / closeness;
        u.uYZoom.value = 0.96;
      }
      if (front) {
        const u = front.mesh.material.uniforms;
        // Shift onto a stem so the centre lands on ink, not the gap.
        u.uOffset.value = offset - 0.055;
        // Readable fisheye: middle letters are larger, sides taper, the
        // word stays a word instead of collapsing into a single counter.
        u.uCenter.value = 0.26 / Math.max(0.75, gain) / closeness;
        u.uEdge.value = 0.64 / closeness;
        u.uCurve.value = 1.05 + 0.35 * gain;
        u.uRepeat.value = 0.21 / closeness;
        u.uYZoom.value = 0.9;
      }
    };

    const resize = () => {
      const w = hero.clientWidth || root.clientWidth;
      const h = hero.clientHeight || root.clientHeight;
      back?.resize(w, h);
      front?.resize(w, h);
    };

    const boot = async () => {
      await ensureAnton();
      if (disposed) return;

      const strip = paintMarquee(text, textColor);
      texture = new THREE.CanvasTexture(strip);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = 8;
      texture.needsUpdate = true;

      const [br, bg, bb] = hexToRgb(background);
      const bgVec = new THREE.Vector3(br, bg, bb);

      back = makeLayer(backHost, texture, bgVec, {
        fillBg: true,
        sign: -1,
        className: "fys-canvas-back",
      });
      front = makeLayer(frontHost, texture, bgVec, {
        fillBg: false,
        sign: 1,
        className: "fys-canvas-front",
      });

      resize();
      apply();
      back.render();
      front.render();

      trigger = ScrollTrigger.create({
        trigger: hero,
        scroller: embedded ? root : undefined,
        start: "top top",
        end: `+=${viewportHeight * 3}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          progress = self.progress;
        },
      });

      const loop = () => {
        if (disposed) return;
        apply();
        back?.render();
        front?.render();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    void boot();

    const onResize = () => {
      resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      trigger?.kill();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      window.removeEventListener("resize", onResize);
      back?.dispose();
      front?.dispose();
      texture?.dispose();
    };
  }, [text, background, textColor, intensity, zoom, embedded]);

  return (
    <div
      className={["fys-root", className].filter(Boolean).join(" ")}
      ref={rootRef}
      style={
        {
          "--fys-bg": background,
          "--fys-fg": textColor,
          ...style,
        } as CSSProperties
      }
    >
      <style>{styles}</style>
      <div className="fys-content">
        <section className="fys-hero" aria-label={text} data-effect={effect}>
          <div className="fys-stage fys-stage-back" ref={backRef} />
          <img
            className="fys-portrait"
            src={portraitSrc}
            alt=""
            draggable={false}
            style={{ transform: `translateX(-50%) scale(${portraitScale})` }}
          />
          <div className="fys-stage fys-stage-front" ref={frontRef} />
        </section>
        <section className="fys-outro">
          <p>{outroText}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&display=swap");

.fys-root {
  --fys-bg: #e83210;
  --fys-fg: #f1cbb6;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--fys-bg);
  color: var(--fys-fg);
  font-family: Anton, Impact, sans-serif;
}

.fys-root::-webkit-scrollbar {
  display: none;
}

.fys-content {
  min-height: 100%;
}

.fys-hero,
.fys-outro {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}

.fys-stage,
.fys-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.fys-stage-back,
.fys-canvas-back {
  z-index: 1;
}

.fys-portrait {
  position: absolute;
  left: 50%;
  bottom: 0;
  height: 94%;
  width: auto;
  max-width: none;
  transform: translateX(-50%);
  transform-origin: 50% 100%;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  z-index: 2;
}

.fys-stage-front,
.fys-canvas-front {
  z-index: 3;
  pointer-events: none;
}

.fys-hero[data-effect="behind"] .fys-stage-front {
  visibility: hidden;
}

.fys-hero[data-effect="forward"] .fys-canvas-back {
  opacity: 0;
}

.fys-outro {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fys-bg);
}

.fys-outro p {
  margin: 0;
  font-size: clamp(2.4rem, 8vw, 6rem);
  letter-spacing: -0.03em;
  line-height: 0.9;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .fys-portrait {
    height: 86%;
  }
}
`;

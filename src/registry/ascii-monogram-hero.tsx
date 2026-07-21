"use client";

/**
 * ASCII Monogram Hero
 *
 * A load-in and hero sequence in the style of romainavalle.dev: the screen
 * starts covered by a 50 by 14 grid of solid cells with a stepped ASCII
 * progress bar (three stacked glyph strips wiping left to right). When the
 * bar finishes, the cells dissolve one by one in a random grid stagger,
 * revealing a giant blackletter monogram already zooming from 10x scale down
 * to rest. The monogram is a lit metallic plane in a fogged Three.js scene,
 * rendered to text: every frame is downsampled and redrawn as monospace
 * characters, with a pointer-following light and a Perlin noise backdrop
 * flickering faint glyphs across the background.
 *
 * The component owns its scroll container, so it embeds in a bounded box.
 * The monogram texture is drawn at runtime (blackletter Google font with a
 * serif fallback), so there are no required assets.
 *
 * BLANK, aryank.space
 */

import gsap from "gsap";
import type * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface AsciiMonogramHeroProps {
  /** Name shown top left in the loader and the hero. */
  name?: string;
  /** Role or tagline shown top right. */
  role?: string;
  /** One or two characters drawn as the giant blackletter monogram. */
  monogram?: string;
  /**
   * Optional image used instead of the runtime-drawn monogram. Must be a
   * white silhouette on black; white areas become the visible shape.
   */
  monogramImage?: string;
  /** Page scheme. "white" is ink on paper, "black" is paper on ink. */
  theme?: "white" | "black";
  /** Total scroll length in multiples of the container height. */
  scrollLength?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Density ramp used by the ASCII pass, from empty to full ink. */
const ASCII_CHARS = " .,:;i1tL0@▒▓▓▓███";
const GRID_COLS = 50;
const GRID_ROWS = 14;
const BAR_BASE = "░░░░░░░░░░░░░░░░░░░░░░░░░░░";
const BAR_MID = "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒";
const BAR_TOP = "█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓";
/** Downsample factor of the ASCII pass; one glyph cell per 5x10 css px. */
const ASCII_SCALE = 0.2;
const MONO_FONT = '"Andale Mono", "Menlo", "Courier New", monospace';
const BLACKLETTER_URL =
  "https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap";

/** Perlin noise backdrop shader, ported from the source scene. */
const NOISE_FRAGMENT = `
precision highp float;
uniform float time;
varying vec2 vUv;

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

void main() {
  float noise = cnoise(vUv * 0.1 + time * 0.5) * 100.0;
  float opacity = cnoise(vUv * 0.2 - time * 0.2) * noise * 5.0;
  gl_FragColor = vec4(vec3(noise), opacity * 0.0025);
}
`;

const NOISE_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Draws the monogram as a white on black silhouette for the alpha map. */
function drawMonogram(
  canvas: HTMLCanvasElement,
  text: string,
  fontFamily: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = 1400;
  canvas.height = 1213;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let size = 1100;
  ctx.font = `${size}px ${fontFamily}`;
  const width = ctx.measureText(text).width;
  if (width > canvas.width * 0.92) {
    size = Math.floor((size * canvas.width * 0.92) / width);
    ctx.font = `${size}px ${fontFamily}`;
  }
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + size * 0.04);
}

export default function AsciiMonogramHero({
  name = "BLANK",
  role = "Component Registry",
  monogram = "Bk",
  monogramImage,
  theme = "white",
  scrollLength = 2.75,
  className,
  style,
}: AsciiMonogramHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderContentRef = useRef<HTMLDivElement>(null);
  const barWrapRef = useRef<HTMLDivElement>(null);
  const barMidRef = useRef<HTMLDivElement>(null);
  const barTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const heroText = heroTextRef.current;
    const loader = loaderRef.current;
    if (!root || !canvas || !heroText || !loader) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Three scene: fogged white void, a hot point light low left, a faint
    // pointer light, and the monogram as an alpha-mapped metallic plane.
    const renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff, 1);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 3.5, 4);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);

    const lightGroup = new THREE.Group();
    lightGroup.add(new THREE.PointLight(0xffffff, 200, 100, 10));
    lightGroup.position.set(-1.2, -1.2, -1.5);
    scene.add(lightGroup);
    const mouseLight = new THREE.PointLight(0x999999, 0.25, 1000, 1e-5);
    mouseLight.position.z = -2.5;
    scene.add(mouseLight);
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      metalness: 0.8,
      roughness: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: 0,
    });
    const shapeRoot = new THREE.Group();
    shapeRoot.position.z = -3;
    scene.add(shapeRoot);
    let plane: THREE.Mesh | null = null;

    const isNarrow = () => root.clientWidth <= 1024;
    const addPlane = (w: number, h: number) => {
      const divisor = isNarrow() ? 650 : 450;
      const geometry = new THREE.PlaneGeometry(w / divisor, h / divisor);
      plane = new THREE.Mesh(geometry, material);
      shapeRoot.add(plane);
    };

    // Monogram texture: an optional silhouette image, otherwise drawn live
    // in a blackletter face (redrawn once the webfont arrives).
    let disposed = false;
    if (monogramImage) {
      const texture = new THREE.TextureLoader().load(monogramImage, (tex) => {
        if (!disposed) addPlane(tex.image.width, tex.image.height);
      });
      material.alphaMap = texture;
    } else {
      const monoCanvas = document.createElement("canvas");
      drawMonogram(monoCanvas, monogram, "Georgia, serif");
      const texture = new THREE.CanvasTexture(monoCanvas);
      material.alphaMap = texture;
      addPlane(monoCanvas.width, monoCanvas.height);
      if (!document.querySelector("link[data-amh-blackletter]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = BLACKLETTER_URL;
        link.dataset.amhBlackletter = "";
        document.head.appendChild(link);
      }
      document.fonts
        .load('400 100px "UnifrakturMaguntia"')
        .then((faces) => {
          if (disposed || faces.length === 0) return;
          drawMonogram(monoCanvas, monogram, '"UnifrakturMaguntia"');
          texture.needsUpdate = true;
        })
        .catch(() => {});
    }

    const noiseMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: NOISE_VERTEX,
      fragmentShader: NOISE_FRAGMENT,
      transparent: true,
    });
    const noisePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30, 1, 1),
      noiseMaterial,
    );
    noisePlane.position.z = -15;
    scene.add(noisePlane);

    // ASCII pass: downsample the WebGL frame, map cell luminance onto the
    // density ramp, and stamp the characters onto the visible 2d canvas.
    const sampler = document.createElement("canvas");
    const samplerCtx = sampler.getContext("2d", { willReadFrequently: true });
    let width = 1;
    let height = 1;
    let cols = 1;
    let rows = 1;
    let dpr = 1;

    const resize = () => {
      width = root.clientWidth;
      height = root.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width * ASCII_SCALE);
      rows = Math.ceil(height * ASCII_SCALE);
      sampler.width = cols;
      sampler.height = rows;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const inkColor = theme === "white" ? "#000" : "#fff";
    const drawAscii = () => {
      if (!samplerCtx) return;
      samplerCtx.clearRect(0, 0, cols, rows);
      samplerCtx.drawImage(renderer.domElement, 0, 0, cols, rows);
      const data = samplerCtx.getImageData(0, 0, cols, rows).data;
      ctx2d.clearRect(0, 0, width, height);
      ctx2d.font = `10px ${MONO_FONT}`;
      ctx2d.fillStyle = inkColor;
      const cellW = 26 * ASCII_SCALE;
      const rowH = 50 * ASCII_SCALE;
      const startX = (-width * ASCII_SCALE) / 10;
      let y = 0;
      for (let row = 0; row < rows; row += 2) {
        let x = startX;
        for (let col = 0; col < cols; col++) {
          const i = (row * cols + col) * 4;
          const lum =
            (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) /
            255;
          const charIndex = Math.floor((1 - lum) * (ASCII_CHARS.length - 1));
          if (charIndex > 0) {
            ctx2d.fillText(ASCII_CHARS[charIndex], x, y);
          }
          x += cellW;
        }
        y += rowH;
      }
    };

    // Pointer light follows an eased cursor, like the source's slow ease.
    let targetX = width / 2;
    let targetY = height / 2;
    let easeX = targetX;
    let easeY = targetY;
    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let frameId = 0;
    const render = () => {
      frameId = requestAnimationFrame(render);
      easeX += (targetX - easeX) * 0.04;
      easeY += (targetY - easeY) * 0.04;
      mouseLight.position.x = (easeX / width - 0.5) * 3;
      mouseLight.position.y = (0.5 - easeY / height) * 3;
      noiseMaterial.uniforms.time.value += 0.005;
      renderer.render(scene, camera);
      drawAscii();
    };
    frameId = requestAnimationFrame(render);

    // Scroll: the sticky hero text fades over the first screen of travel,
    // and the monogram sinks into the fog once the hero scrolls away.
    let shapeShown = true;
    const heroDistance = () => root.clientHeight;
    const onScroll = () => {
      const top = root.scrollTop;
      heroText.style.opacity = `${1 - clamp01(top / heroDistance())}`;
      const shouldShow = top < heroDistance() * 0.7;
      if (shouldShow !== shapeShown) {
        shapeShown = shouldShow;
        gsap.killTweensOf([material, shapeRoot.position]);
        if (shouldShow) {
          shapeRoot.position.z = -3;
          gsap.to(material, { opacity: 1, duration: 1, ease: "power3.out" });
        } else {
          gsap.to(shapeRoot.position, {
            z: -4.4,
            duration: 0.4,
            ease: "power1.out",
          });
          gsap.to(material, { opacity: 0, duration: 1, ease: "power3.out" });
        }
      }
    };
    root.addEventListener("scroll", onScroll, { passive: true });

    const observer = new ResizeObserver(resize);
    observer.observe(root);

    // Loader: two glyph strips wipe over the base strip in 12 steps; when
    // the long one lands, the bar collapses, the copy holds for two seconds,
    // and the 700 cells dissolve in a random grid stagger.
    const gsapCtx = gsap.context(() => {
      const cells = loader.querySelectorAll("li");
      const startHero = () => {
        gsap.fromTo(
          material,
          { opacity: 0 },
          { opacity: 1, duration: 1, ease: "power3.out" },
        );
        const restScale = isNarrow() ? 0.4 : 1;
        if (reducedMotion) {
          shapeRoot.scale.setScalar(restScale);
          return;
        }
        gsap.fromTo(
          shapeRoot.scale,
          { x: 10, y: 10 },
          { x: restScale, y: restScale, duration: 6, ease: "power3.out" },
        );
      };
      const finishLoader = () => {
        gsap.to(barWrapRef.current, { duration: 0.2, scaleY: 0, delay: 0.5 });
        gsap.to(loaderContentRef.current, {
          duration: 0.2,
          opacity: 0,
          delay: 2,
        });
        gsap.to(cells, {
          opacity: 0,
          duration: 0.1,
          stagger: {
            grid: [GRID_ROWS, GRID_COLS],
            from: "random",
            amount: 2,
            ease: "power1.inOut",
          },
          onComplete: () => {
            loader.style.display = "none";
          },
        });
      };
      if (reducedMotion) {
        startHero();
        loader.style.display = "none";
        return;
      }
      gsap.fromTo(
        barMidRef.current,
        { xPercent: -100, opacity: 1 },
        { duration: 0.8, xPercent: 0, delay: 0.3, ease: "steps(12)" },
      );
      gsap.fromTo(
        barTopRef.current,
        { xPercent: -100, opacity: 1 },
        {
          duration: 1.2,
          xPercent: 0,
          delay: 0.3,
          ease: "steps(12)",
          onStart: startHero,
          onComplete: finishLoader,
        },
      );
    }, root);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("scroll", onScroll);
      gsapCtx.revert();
      gsap.killTweensOf([material, shapeRoot.position, shapeRoot.scale]);
      material.alphaMap?.dispose();
      material.dispose();
      noiseMaterial.dispose();
      noisePlane.geometry.dispose();
      if (plane) plane.geometry.dispose();
      renderer.dispose();
    };
  }, [monogram, monogramImage, theme]);

  const cells = Array.from({ length: GRID_COLS * GRID_ROWS });

  return (
    <div
      ref={rootRef}
      className={`amh amh-${theme}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <style>{`
        .amh {
          position: relative;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          container-type: size;
          font-family: ${MONO_FONT};
          letter-spacing: -0.02em;
        }
        .amh h1, .amh h2 {
          margin: 0;
          font-size: inherit;
          font-weight: inherit;
        }
        .amh-white { background: #fff; color: #000; }
        .amh-black { background: #000; color: #fff; }
        .amh-canvas-pin {
          position: sticky;
          top: 0;
          height: 0;
          z-index: 1;
        }
        .amh-canvas-pin canvas {
          display: block;
          pointer-events: none;
        }
        .amh-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          column-gap: 2cqw;
          padding: 0 2cqw;
          align-items: center;
          width: 100%;
          font-size: clamp(11px, 1.15cqw, 18px);
        }
        .amh-name { grid-column: 1 / span 3; text-align: right; }
        .amh-role { grid-column: 10 / span 3; text-align: left; }
        .amh-hero {
          position: relative;
          height: 175cqh;
          z-index: 2;
        }
        .amh-hero-sticky {
          position: sticky;
          top: 0;
          height: 100cqh;
        }
        .amh-hero-sticky .amh-grid { height: 100%; }
        .amh-tail {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          padding: 0 2cqw 6cqh;
        }
        .amh-tail p {
          max-width: 34em;
          font-size: clamp(12px, 1.3cqw, 20px);
          line-height: 1.4;
        }
        .amh-loader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100cqh;
          z-index: 3;
          pointer-events: none;
        }
        .amh-loader ul {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(${GRID_COLS}, 1fr);
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .amh-white .amh-loader li { background: #fff; }
        .amh-black .amh-loader li { background: #000; }
        .amh-loader-content {
          position: absolute;
          inset: 0;
        }
        .amh-bar {
          grid-column: 4 / span 6;
          display: flex;
          justify-content: center;
          white-space: pre;
        }
        .amh-bar-stack { position: relative; overflow: hidden; }
        .amh-bar-stack > div {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
        }
      `}</style>
      <div className="amh-canvas-pin" aria-hidden>
        <canvas ref={canvasRef} />
      </div>
      <div
        className="amh-hero"
        style={{ height: `${(scrollLength - 1) * 100}cqh` }}
      >
        <div className="amh-hero-sticky">
          <div ref={heroTextRef} className="amh-grid">
            <h1 className="amh-name">{name}</h1>
            <h2 className="amh-role">{role}</h2>
          </div>
        </div>
      </div>
      <div className="amh-tail" style={{ height: "100cqh" }}>
        <p>
          Every piece in this registry is a working port of a production load
          sequence, rebuilt as one installable React component: the grid
          dissolve, the stepped progress bar, and the ASCII render pass all run
          from a single file.
        </p>
      </div>
      <div ref={loaderRef} className="amh-loader" aria-hidden>
        <ul>
          {cells.map((_, i) => (
            <li key={i} />
          ))}
        </ul>
        <div ref={loaderContentRef} className="amh-loader-content">
          <div className="amh-grid" style={{ height: "100%" }}>
            <div className="amh-name">{name}</div>
            <div className="amh-bar">
              <div ref={barWrapRef} className="amh-bar-stack">
                {BAR_BASE}
                <div ref={barMidRef}>{BAR_MID}</div>
                <div ref={barTopRef}>{BAR_TOP}</div>
              </div>
            </div>
            <div className="amh-role">{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

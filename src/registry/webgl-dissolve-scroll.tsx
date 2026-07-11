"use client";

/**
 * WebGL Dissolve Scroll - a hero image is progressively dissolved from the
 * bottom up by a real-time WebGL noise field as you scroll: an fbm-driven
 * edge eats across the frame in a colored wash, while a stacked headline
 * below fades in one word at a time.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const ASSET_BASE = "https://ui.aryank.space/assets/webgl-dissolve-scroll";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform float uSpread;
  varying vec2 vUv;

  float Hash(vec2 p) {
    vec3 p2 = vec3(p.xy, 1.0);
    return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);
  }

  float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    return mix(
      mix(Hash(i + vec2(0.0, 0.0)), Hash(i + vec2(1.0, 0.0)), f.x),
      mix(Hash(i + vec2(0.0, 1.0)), Hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    v += noise(p * 1.0) * 0.5;
    v += noise(p * 2.0) * 0.25;
    v += noise(p * 4.0) * 0.125;
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 centeredUv = (uv - 0.5) * vec2(aspect, 1.0);

    float dissolveEdge = uv.y - uProgress * 1.2;
    float noiseValue = fbm(centeredUv * 15.0);
    float d = dissolveEdge + noiseValue * uSpread;

    float pixelSize = 1.0 / uResolution.y;
    float alpha = 1.0 - smoothstep(-pixelSize, pixelSize, d);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16) / 255,
        g: Number.parseInt(result[2], 16) / 255,
        b: Number.parseInt(result[3], 16) / 255,
      }
    : { r: 0.89, g: 0.89, b: 0.89 };
}

export interface WebglDissolveScrollProps {
  heroImage?: string;
  eyebrow?: string;
  headerText?: string;
  bodyText?: string;
  aboutText?: string;
  /** Dissolve wash color. */
  dissolveColor?: string;
  /** Noise displacement amount at the dissolve edge. */
  spread?: number;
  /** Scroll-to-dissolve multiplier. */
  speed?: number;
  embedded?: boolean;
}

export default function WebglDissolveScroll({
  heroImage = `${ASSET_BASE}/hero-img.jpg`,
  eyebrow = "Morphogenesis",
  headerText = "Solid form gives way to liquid movement.",
  bodyText = "An underlying field of motion pushes and pulls the image across its surface, redistributing pixels in a way that feels organic and constantly in flux.",
  aboutText = "This animation is driven by a real-time WebGL displacement process where interaction introduces force into the surface, causing form to bend, stretch, and reorganize dynamically. Rather than relying on fixed keyframes, the visual state evolves continuously, allowing motion to feel organic, responsive, and materially present as the page progresses.",
  dissolveColor = "#ebf5df",
  spread = 0.5,
  speed = 2,
  embedded = true,
}: WebglDissolveScrollProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".wds-content");
    const hero = root.querySelector<HTMLElement>(".wds-hero");
    const canvas = root.querySelector<HTMLCanvasElement>(".wds-canvas");
    const words = Array.from(root.querySelectorAll<HTMLElement>(".wds-word"));
    if (!content || !hero || !canvas) return;

    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    });

    function resize() {
      if (!hero) return;
      renderer.setSize(hero.offsetWidth, hero.offsetHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    resize();

    const rgb = hexToRgb(dissolveColor);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(hero.offsetWidth, hero.offsetHeight),
        },
        uColor: { value: new THREE.Vector3(rgb.r, rgb.g, rgb.b) },
        uSpread: { value: spread },
      },
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let scrollProgress = 0;
    let renderRafId = 0;
    function animate() {
      material.uniforms.uProgress.value = scrollProgress;
      renderer.render(scene, camera);
      renderRafId = requestAnimationFrame(animate);
    }
    animate();

    const onScroll = ({ scroll }: { scroll: number }) => {
      const viewportHeight = embedded
        ? (root?.clientHeight ?? window.innerHeight)
        : window.innerHeight;
      const maxScroll = hero.offsetHeight - viewportHeight;
      scrollProgress = Math.min((scroll / maxScroll) * speed, 1.1);
    };
    lenis.on("scroll", onScroll);

    const onResize = () => {
      resize();
      material.uniforms.uResolution.value.set(
        hero.offsetWidth,
        hero.offsetHeight,
      );
    };
    window.addEventListener("resize", onResize);

    gsap.set(words, { opacity: 0 });
    const wordTrigger = ScrollTrigger.create({
      trigger: content.querySelector(".wds-copy"),
      scroller: embedded ? root : undefined,
      start: "top 25%",
      end: "bottom 100%",
      onUpdate: (self) => {
        const progress = self.progress;
        const totalWords = words.length;
        words.forEach((word, index) => {
          const wordProgress = index / totalWords;
          const nextWordProgress = (index + 1) / totalWords;
          let opacity = 0;
          if (progress >= nextWordProgress) {
            opacity = 1;
          } else if (progress >= wordProgress) {
            opacity =
              (progress - wordProgress) / (nextWordProgress - wordProgress);
          }
          gsap.to(word, { opacity, duration: 0.1, overwrite: true });
        });
      },
    });

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(renderRafId);
      window.removeEventListener("resize", onResize);
      wordTrigger.kill();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      lenis.destroy();
    };
  }, [embedded, dissolveColor, spread, speed]);

  const bodyWords = bodyText.split(" ");

  return (
    <div className="wds-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="wds-content">
        <section className="wds-hero">
          <div className="wds-img">
            <img alt="" draggable={false} src={heroImage} />
          </div>

          <div className="wds-header">
            <h1>{eyebrow}</h1>
            <p>{headerText}</p>
          </div>

          <canvas className="wds-canvas" />

          <div className="wds-copy">
            <h2>
              {bodyWords.map((word, index) => (
                <span
                  className="wds-word"
                  // ponytail: static word list, index key is fine
                  key={`${word}-${index}`}
                >
                  {word}
                  {index < bodyWords.length - 1 ? " " : ""}
                </span>
              ))}
            </h2>
          </div>
        </section>

        <section className="wds-about">
          <p>{aboutText}</p>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Instrument+Serif:ital@0;1&display=swap");

.wds-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #ebf5df;
}

.wds-root::-webkit-scrollbar {
  display: none;
}

.wds-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wds-root h1,
.wds-root h2 {
  text-transform: uppercase;
  font-family: "Instrument Serif", sans-serif;
  font-weight: 500;
  line-height: 0.9;
}

.wds-root h1 {
  font-size: clamp(4rem, 7.5vw, 10rem);
}

.wds-root h2 {
  font-size: clamp(2.5rem, 4.5vw, 5rem);
}

.wds-root p {
  font-family: "Instrument Sans", sans-serif;
  font-size: 1.125rem;
  font-weight: 400;
}

.wds-hero {
  position: relative;
  width: 100%;
  height: 175svh;
  color: #fec81d;
  overflow: hidden;
}

.wds-img {
  position: absolute;
  width: 100%;
  height: 100%;
}

.wds-header {
  position: absolute;
  width: 100%;
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.wds-header p {
  width: 75%;
}

.wds-canvas {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wds-copy {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 125svh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.wds-copy h2 {
  width: 75%;
  color: #0f0f0f;
}

.wds-about {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0f0f0f;
  color: #ebf5df;
}

.wds-about p {
  width: 40%;
  text-align: center;
}

@media (max-width: 1000px) {
  .wds-copy h2,
  .wds-about p {
    width: calc(100% - 4rem);
  }
}
`;

"use client";

/**
 * Shader Tunnel Slider - cards flying at you down a CSS perspective corridor,
 * over a raymarch-style tunnel drawn by a fragment shader. The backdrop is a
 * single full-screen plane whose polar pattern is sin(angle / 0.1) times
 * sin(20 / radius + t), which is what produces the ribbed funnel; scroll is fed
 * in as a separate uniform on top of elapsed time, so scrolling accelerates the
 * tunnel rather than just moving the cards. Each card starts far down the Z
 * axis, alternates to the left or right of centre, and is pushed 22500 units
 * forward across the scroll while its opacity ramps only over the final 2500,
 * so it fades up out of the dark instead of popping in.
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

const ASSET_BASE = "https://ui.aryank.space/assets/shader-tunnel-slider";

export interface TunnelSlide {
  title: string;
  id: string;
  image: string;
}

export interface ShaderTunnelSliderProps {
  slides?: TunnelSlide[];
  brand?: string;
  navLeft?: string[];
  navRight?: string[];
  footerLeft?: string;
  footerRight?: string;
  /** World units between two consecutive cards on the Z axis. */
  zStep?: number;
  embedded?: boolean;
}

const DEFAULT_SLIDES: TunnelSlide[] = [
  { title: "Neon", id: "CG30128", image: `${ASSET_BASE}/img1.jpg` },
  { title: "Volt", id: "CG39102", image: `${ASSET_BASE}/img2.jpg` },
  { title: "Echo", id: "CG84729", image: `${ASSET_BASE}/img3.jpg` },
  { title: "Glitch", id: "CG67215", image: `${ASSET_BASE}/img4.jpg` },
  { title: "Pulse", id: "CG48391", image: `${ASSET_BASE}/img5.jpg` },
  { title: "Drift", id: "CG55204", image: `${ASSET_BASE}/img6.jpg` },
  { title: "Prism", id: "CG71638", image: `${ASSET_BASE}/img7.jpg` },
  { title: "Vapor", id: "CG29457", image: `${ASSET_BASE}/img8.jpg` },
  { title: "Signal", id: "CG83016", image: `${ASSET_BASE}/img9.jpg` },
  { title: "Static", id: "CG40972", image: `${ASSET_BASE}/img10.jpg` },
];

const VERTEX_SHADER = `
void main() {
    gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform vec2 iResolution;
uniform float iTime;
uniform float scrollOffset;

void mainImage(out vec4 o, vec2 I) {
    I -= o.zw = iResolution.xy / 2.0;
    float t = iTime * 5.0 + scrollOffset * 200.0;
    float pattern = sin(atan(I.y, I.x) / 0.1) * sin(20.0 * (o.w /= length(I)) + t) - 1.0 + o.w;

    float monochrome = 1.0 - pattern * 0.5;

    float invertedMonochrome = 1.0 - monochrome;

    o = vec4(invertedMonochrome, invertedMonochrome, invertedMonochrome, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

export default function ShaderTunnelSlider({
  slides = DEFAULT_SLIDES,
  brand = "Tunnel Vision",
  navLeft = ["Works", "Archive"],
  navRight = ["Info", "Contact"],
  footerLeft = "Watch Showreel",
  footerRight = "Launching 2024",
  zStep = 2500,
  embedded = true,
}: ShaderTunnelSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".sts-content");
    const container = root.querySelector<HTMLElement>(".sts-container");
    const stage = root.querySelector<HTMLElement>(".sts-canvas");
    if (!content || !container || !stage) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    stage.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      iTime: { value: 0 },
      iResolution: {
        value: new THREE.Vector2(stage.clientWidth, stage.clientHeight),
      },
      scrollOffset: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let lastTime = 0;
    let frame = 0;
    const animateTunnel = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      uniforms.iTime.value += deltaTime * 0.001;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animateTunnel);
    };
    animateTunnel(0);

    const totalSlides = slides.length;
    const totalTravel = totalSlides * zStep - zStep;
    const initialZ = -(totalTravel + zStep);

    const slideEls = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".sts-slide"),
    );

    slideEls.forEach((slide, i) => {
      gsap.set(slide, {
        top: "50%",
        left: (i + 1) % 2 === 0 ? "30%" : "70%",
        xPercent: -50,
        yPercent: -50,
        z: initialZ + i * zStep,
        opacity: i === totalSlides - 1 ? 1 : 0,
      });
    });

    const mapRange = (
      value: number,
      inMin: number,
      inMax: number,
      outMin: number,
      outMax: number,
    ) => ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

    const triggers: ScrollTrigger[] = [];

    triggers.push(
      ScrollTrigger.create({
        trigger: container,
        scroller,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          uniforms.scrollOffset.value = self.progress;
        },
      }),
    );

    for (const slide of slideEls) {
      const slideInitialZ = gsap.getProperty(slide, "z") as number;

      triggers.push(
        ScrollTrigger.create({
          trigger: container,
          scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          onUpdate: (self) => {
            const currentZ =
              slideInitialZ + self.progress * (totalTravel + zStep);

            const opacity =
              currentZ >= -zStep
                ? mapRange(currentZ, -zStep, 0, 0, 1)
                : mapRange(currentZ, -zStep * 2, -zStep, 0, 0);

            slide.style.opacity = String(opacity);
            slide.style.transform = `translateX(-50%) translateY(-50%) translateZ(${currentZ}px)`;
          },
        }),
      );
    }

    const resize = new ResizeObserver(() => {
      if (!stage.clientWidth || !stage.clientHeight) return;
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      uniforms.iResolution.value.set(stage.clientWidth, stage.clientHeight);
      ScrollTrigger.refresh();
    });
    resize.observe(stage);

    ScrollTrigger.refresh();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      for (const trigger of triggers) trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [embedded, slides, zStep]);

  return (
    <div
      className={embedded ? "sts-root sts-embedded" : "sts-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <div className="sts-canvas" />

      <nav className="sts-nav">
        <div className="sts-nav-items">
          {navLeft.map((item) => (
            <a href="#nav" key={item}>
              {item}
            </a>
          ))}
        </div>
        <div className="sts-logo">
          <a href="#brand">{brand}</a>
        </div>
        <div className="sts-nav-items">
          {navRight.map((item) => (
            <a href="#nav" key={item}>
              {item}
            </a>
          ))}
        </div>
      </nav>

      <footer className="sts-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>

      <div className="sts-slider">
        {slides.map((slide) => (
          <div className="sts-slide" key={slide.id}>
            <div className="sts-slide-img">
              <img alt="" draggable={false} src={slide.image} />
            </div>
            <div className="sts-slide-copy">
              <p>{slide.title}</p>
              <p>{slide.id}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sts-overlay" />

      <div className="sts-content">
        <div className="sts-container" />
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Geist+Mono:wght@100..900&display=swap");

.sts-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}

.sts-root * {
  box-sizing: border-box;
}

.sts-root.sts-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.sts-root.sts-embedded::-webkit-scrollbar {
  display: none;
}

.sts-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.sts-canvas canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.sts-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sts-root a,
.sts-root p {
  margin: 0;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
  font-family: "Geist Mono", monospace;
  font-size: 12px;
  font-weight: 500;
}

.sts-nav,
.sts-footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  mix-blend-mode: exclusion;
  z-index: 3;
  pointer-events: none;
}

.sts-nav a,
.sts-footer p {
  pointer-events: auto;
}

.sts-nav {
  top: 0;
}

.sts-footer {
  bottom: 0;
}

.sts-nav > div {
  flex: 1;
  display: flex;
  gap: 2em;
}

.sts-logo {
  display: flex;
  justify-content: center;
}

.sts-logo a {
  font-family: "Anton", sans-serif;
  font-size: 48px;
  font-weight: 400;
}

.sts-nav-items:nth-child(3) {
  justify-content: flex-end;
}

.sts-content {
  position: relative;
  width: 100%;
  z-index: 1;
  pointer-events: none;
}

.sts-container {
  width: 100%;
  height: 2000svh;
}

.sts-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  perspective: 500px;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}

.sts-slide {
  position: absolute;
  width: 400px;
  height: 500px;
  will-change: transform, opacity;
}

.sts-slide-img {
  width: 100%;
  height: 100%;
  padding: 0.5em;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.sts-slide-copy {
  position: absolute;
  width: 100%;
  bottom: -24px;
  display: flex;
  justify-content: space-between;
}

.sts-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  background: rgb(0, 0, 0);
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 1) 100%
  );
}
`;

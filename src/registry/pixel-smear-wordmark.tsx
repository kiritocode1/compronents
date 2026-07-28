"use client";

/**
 * Pixel Smear Wordmark - a wordmark rendered to a canvas, uploaded as a
 * texture, and sampled through a shader that drags it under the cursor. The
 * displacement is not the pointer position, it is the pointer's velocity: each
 * fragment snaps its UV to a forty by forty grid, measures the distance from
 * that cell's centre to the cursor, and offsets its sample along the direction
 * the cursor last travelled, scaled by a smoothstep falloff. So the letters
 * only smear while the mouse is actually moving, and the grid quantisation is
 * what makes the smear read as blocks rather than a smooth warp.
 *
 * Two easing rates are used deliberately: 0.01 on enter and leave so the field
 * settles gently, 0.035 while moving so it tracks.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface PixelSmearWordmarkProps {
  text?: string;
  fontFamily?: string;
  fontWeight?: string;
  background?: string;
  textColor?: string;
  /** Cells per axis the shader snaps to. Lower is chunkier. */
  gridSize?: number;
  /** How far a cell is dragged along the pointer's travel direction. */
  strength?: number;
}

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShaderFor = (grid: number, strength: number) => `
  varying vec2 vUv;
  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform vec2 u_prevMouse;

  void main() {
    vec2 gridUV = floor(vUv * vec2(${grid.toFixed(1)}, ${grid.toFixed(1)})) / vec2(${grid.toFixed(1)}, ${grid.toFixed(1)});
    vec2 centerOfPixel = gridUV + vec2(1.0/${grid.toFixed(1)}, 1.0/${grid.toFixed(1)});

    vec2 mouseDirection = u_mouse - u_prevMouse;

    vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
    float pixelDistanceToMouse = length(pixelToMouseDirection);
    float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);

    vec2 uvOffset = strength * -mouseDirection * ${strength.toFixed(2)};
    vec2 uv = vUv - uvOffset;

    vec4 color = texture2D(u_texture, uv);
    gl_FragColor = color;
  }
`;

export default function PixelSmearWordmark({
  text = "blank",
  fontFamily = "Anton",
  fontWeight = "100",
  background = "#ffffff",
  textColor = "#1a1a1a",
  gridSize = 40,
  strength = 0.4,
}: PixelSmearWordmarkProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const textContainer = root.querySelector<HTMLElement>(".psw-container");
    if (!textContainer) return;

    let easeFactor = 0.02;
    const mousePosition = { x: 0.5, y: 0.5 };
    let targetMousePosition = { x: 0.5, y: 0.5 };
    let prevPosition = { x: 0.5, y: 0.5 };

    function createTextTexture() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // The source sizes this off the window; here it is the component's own
      // box, so the wordmark fills a bounded preview at the same proportions.
      const canvasWidth = (textContainer?.clientWidth ?? 1) * 2;
      const canvasHeight = (textContainer?.clientHeight ?? 1) * 2;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fontSize = Math.floor(canvasWidth * 2);

      ctx.fillStyle = textColor;
      ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const textWidth = ctx.measureText(text).width;

      const scaleFactor = Math.min(1, (canvasWidth * 1) / textWidth);
      const aspectCorrection = canvasWidth / canvasHeight;

      ctx.setTransform(
        scaleFactor,
        0,
        0,
        scaleFactor / aspectCorrection,
        canvasWidth / 2,
        canvasHeight / 2,
      );

      ctx.strokeStyle = textColor;
      ctx.lineWidth = fontSize * 0.005;
      for (let i = 0; i < 3; i++) {
        ctx.strokeText(text, 0, 0);
      }
      ctx.fillText(text, 0, 0);

      return new THREE.CanvasTexture(canvas);
    }

    const scene = new THREE.Scene();
    const aspectRatio = textContainer.clientWidth / textContainer.clientHeight;
    const camera = new THREE.OrthographicCamera(
      -1,
      1,
      1 / aspectRatio,
      -1 / aspectRatio,
      0.1,
      1000,
    );
    camera.position.z = 1;

    let texture = createTextTexture();

    const shaderUniforms = {
      u_mouse: { value: new THREE.Vector2() },
      u_prevMouse: { value: new THREE.Vector2() },
      u_texture: { value: texture },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: fragmentShaderFor(gridSize, strength),
    });
    const planeMesh = new THREE.Mesh(geometry, material);
    scene.add(planeMesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(new THREE.Color(background), 1);
    renderer.setSize(textContainer.clientWidth, textContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    textContainer.appendChild(renderer.domElement);

    let frame = 0;
    const animateScene = () => {
      frame = requestAnimationFrame(animateScene);

      mousePosition.x += (targetMousePosition.x - mousePosition.x) * easeFactor;
      mousePosition.y += (targetMousePosition.y - mousePosition.y) * easeFactor;

      planeMesh.material.uniforms.u_mouse.value.set(
        mousePosition.x,
        1.0 - mousePosition.y,
      );
      planeMesh.material.uniforms.u_prevMouse.value.set(
        prevPosition.x,
        1.0 - prevPosition.y,
      );

      renderer.render(scene, camera);
    };
    animateScene();

    const handleMouseMove = (event: MouseEvent) => {
      easeFactor = 0.035;
      const rect = textContainer.getBoundingClientRect();
      prevPosition = { ...targetMousePosition };

      targetMousePosition.x = (event.clientX - rect.left) / rect.width;
      targetMousePosition.y = (event.clientY - rect.top) / rect.height;
    };

    const handleMouseEnter = (event: MouseEvent) => {
      easeFactor = 0.01;
      const rect = textContainer.getBoundingClientRect();
      mousePosition.x = targetMousePosition.x =
        (event.clientX - rect.left) / rect.width;
      mousePosition.y = targetMousePosition.y =
        (event.clientY - rect.top) / rect.height;
    };

    const handleMouseLeave = () => {
      easeFactor = 0.01;
      targetMousePosition = { ...prevPosition };
    };

    textContainer.addEventListener("mousemove", handleMouseMove);
    textContainer.addEventListener("mouseenter", handleMouseEnter);
    textContainer.addEventListener("mouseleave", handleMouseLeave);

    const resize = new ResizeObserver(() => {
      if (!textContainer.clientWidth || !textContainer.clientHeight) return;
      const ratio = textContainer.clientWidth / textContainer.clientHeight;
      camera.left = -1;
      camera.right = 1;
      camera.top = 1 / ratio;
      camera.bottom = -1 / ratio;
      camera.updateProjectionMatrix();

      renderer.setSize(textContainer.clientWidth, textContainer.clientHeight);

      texture?.dispose();
      texture = createTextTexture();
      planeMesh.material.uniforms.u_texture.value = texture;
    });
    resize.observe(textContainer);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      textContainer.removeEventListener("mousemove", handleMouseMove);
      textContainer.removeEventListener("mouseenter", handleMouseEnter);
      textContainer.removeEventListener("mouseleave", handleMouseLeave);
      texture?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [text, fontFamily, fontWeight, background, textColor, gridSize, strength]);

  return (
    <div
      className="psw-root"
      ref={rootRef}
      style={{ backgroundColor: background }}
    >
      <style>{styles}</style>
      <div className="psw-container" />
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Anton&display=swap");

.psw-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Anton", sans-serif;
}

.psw-root * {
  box-sizing: border-box;
}

.psw-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.psw-container canvas {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: block;
  width: 100% !important;
  height: 100% !important;
}
`;

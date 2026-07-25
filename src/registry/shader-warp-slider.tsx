"use client";

/**
 * Shader Warp Slider - a wheel-driven slider where the transition happens in
 * the fragment shader rather than in transforms. Both the outgoing and
 * incoming textures are sampled on the same plane, split at the scroll
 * position, so one image slides up out of the frame as the next arrives behind
 * it with no second mesh. The vertex shader bows the plane by scroll velocity,
 * bending the sides more than the top and bottom, which is what makes the
 * frame flex like film during a fast flick. When motion falls below threshold
 * it snaps to whole slides and the caption swaps behind its own mask.
 *
 * Self-contained: it fills its own box and reads the wheel over itself.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ASSET_BASE = "https://ui.aryank.space/assets/shader-warp-slider";

export interface ShaderSlide {
  title: string;
  url: string;
  image: string;
}

export interface ShaderWarpSliderProps {
  brand?: string;
  navLinks?: string[];
  socials?: string[];
  footerLeft?: string;
  footerRight?: string;
  slides?: ShaderSlide[];
}

const DEFAULT_SLIDES: ShaderSlide[] = [
  {
    title: "Chromatic Loopscape",
    url: "#",
    image: `${ASSET_BASE}/img1.jpg`,
  },
  { title: "Solar Bloom", url: "#", image: `${ASSET_BASE}/img2.jpg` },
  { title: "Neon Handscape", url: "#", image: `${ASSET_BASE}/img3.jpg` },
  { title: "Echo Discs", url: "#", image: `${ASSET_BASE}/img4.jpg` },
  { title: "Void Gaze", url: "#", image: `${ASSET_BASE}/img5.jpg` },
  { title: "Gravity Sync", url: "#", image: `${ASSET_BASE}/img6.jpg` },
  { title: "Heat Core", url: "#", image: `${ASSET_BASE}/img7.jpg` },
];

const VERTEX_SHADER = `
  uniform float uScrollIntensity;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float sideDistortion = sin(uv.y * 3.14159) * uScrollIntensity * 0.5;
    float topBottomDistortion = sin(uv.x * 3.14159) * uScrollIntensity * 0.2;
    pos.z += sideDistortion + topBottomDistortion;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uCurrentTexture;
  uniform sampler2D uNextTexture;
  uniform float uScrollPosition;
  varying vec2 vUv;

  void main() {
    float normalizedPosition = fract(uScrollPosition);

    vec2 currentUv = vec2(vUv.x, mod(vUv.y - normalizedPosition, 1.0));
    vec2 nextUv = vec2(vUv.x, mod(vUv.y + 1.0 - normalizedPosition, 1.0));

    if (vUv.y < normalizedPosition) {
      gl_FragColor = texture2D(uNextTexture, nextUv);
    } else {
      gl_FragColor = texture2D(uCurrentTexture, currentUv);
    }
  }
`;

export default function ShaderWarpSlider({
  brand = "BLANK",
  navLinks = ["About", "Contact"],
  socials = ["FB", "IG", "YT"],
  footerLeft = "Experiment 444",
  footerRight = "Scroll to advance",
  slides = DEFAULT_SLIDES,
}: ShaderWarpSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!slides.length) return;

    const container = root.querySelector<HTMLElement>(".crs-container");
    const projectTitle = root.querySelector<HTMLElement>(".crs-project-title");
    const projectLink =
      root.querySelector<HTMLAnchorElement>(".crs-project-link");
    if (!container || !projectTitle || !projectLink) return;

    let scrollIntensity = 0;
    let targetScrollIntensity = 0;
    const maxScrollIntensity = 1.0;
    const scrollSmoothness = 0.5;

    let scrollPosition = 0;
    let targetScrollPosition = 0;
    const scrollPositionSmoothness = 0.05;

    let isMoving = false;
    const movementThreshold = 0.001;
    let isSnapping = false;

    let stableCurrentIndex = 0;
    let stableNextIndex = 1;
    let isStable = false;

    let titleHidden = false;
    let titleAnimating = false;
    let currentProjectIndex = 0;
    let frame = 0;
    let hideTimer = 0;
    let showTimer = 0;

    projectTitle.textContent = slides[0].title;
    projectLink.href = slides[0].url;

    const frameWidth = () => root.clientWidth || 1;
    const frameHeight = () => root.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      frameWidth() / frameHeight(),
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(frameWidth(), frameHeight());
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement);

    const calculatePlaneDimensions = () => {
      const fov = camera.fov * (Math.PI / 180);
      const viewportHeight = 2 * Math.tan(fov / 2) * camera.position.z;
      const viewportWidth = viewportHeight * camera.aspect;

      const widthFactor = frameWidth() < 900 ? 0.9 : 0.5;
      const planeWidth = viewportWidth * widthFactor;
      const planeHeight = planeWidth * (9 / 16);

      return { width: planeWidth, height: planeHeight };
    };

    const dimensions = calculatePlaneDimensions();

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const textures = slides.map((slide) => {
      const texture = textureLoader.load(slide.image);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    });

    const geometry = new THREE.PlaneGeometry(
      dimensions.width,
      dimensions.height,
      32,
      32,
    );

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      side: THREE.DoubleSide,
      uniforms: {
        uScrollIntensity: { value: scrollIntensity },
        uScrollPosition: { value: scrollPosition },
        uCurrentTexture: { value: textures[0] },
        uNextTexture: { value: textures[1 % textures.length] },
      },
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const determineTextureIndices = (position: number) => {
      const totalImages = slides.length;

      const baseIndex = Math.floor(position % totalImages);
      const positiveBaseIndex =
        baseIndex >= 0 ? baseIndex : (totalImages + baseIndex) % totalImages;

      const nextIndex = (positiveBaseIndex + 1) % totalImages;

      let normalizedPosition = position % 1;
      if (normalizedPosition < 0) normalizedPosition += 1;

      return { currentIndex: positiveBaseIndex, nextIndex, normalizedPosition };
    };

    const updateTextureIndices = () => {
      if (isStable) {
        material.uniforms.uCurrentTexture.value = textures[stableCurrentIndex];
        material.uniforms.uNextTexture.value = textures[stableNextIndex];
        return;
      }

      const indices = determineTextureIndices(scrollPosition);

      material.uniforms.uCurrentTexture.value = textures[indices.currentIndex];
      material.uniforms.uNextTexture.value = textures[indices.nextIndex];
    };

    const hideTitle = () => {
      if (!titleHidden && !titleAnimating) {
        titleAnimating = true;
        projectTitle.style.transform = "translateY(20px)";

        hideTimer = window.setTimeout(() => {
          titleAnimating = false;
          titleHidden = true;
        }, 500);
      }
    };

    const showTitle = () => {
      if (titleHidden && !titleAnimating) {
        projectTitle.textContent = slides[currentProjectIndex].title;
        projectLink.href = slides[currentProjectIndex].url;

        titleAnimating = true;
        projectTitle.style.transform = "translateY(0px)";

        showTimer = window.setTimeout(() => {
          titleAnimating = false;
          titleHidden = false;
        }, 500);
      }
    };

    const snapToNearestImage = () => {
      if (isSnapping) return;
      isSnapping = true;
      const roundedPosition = Math.round(scrollPosition);
      targetScrollPosition = roundedPosition;

      const indices = determineTextureIndices(roundedPosition);
      stableCurrentIndex = indices.currentIndex;
      stableNextIndex = indices.nextIndex;

      currentProjectIndex = indices.currentIndex;

      showTitle();
    };

    const onResize = () => {
      camera.aspect = frameWidth() / frameHeight();
      camera.updateProjectionMatrix();

      renderer.setSize(frameWidth(), frameHeight());
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const newDimensions = calculatePlaneDimensions();
      plane.geometry.dispose();
      plane.geometry = new THREE.PlaneGeometry(
        newDimensions.width,
        newDimensions.height,
        32,
        32,
      );
    };
    window.addEventListener("resize", onResize);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      isSnapping = false;
      isStable = false;

      hideTitle();

      targetScrollIntensity += event.deltaY * 0.001;
      targetScrollIntensity = Math.max(
        -maxScrollIntensity,
        Math.min(maxScrollIntensity, targetScrollIntensity),
      );

      targetScrollPosition += event.deltaY * 0.001;

      isMoving = true;
    };
    root.addEventListener("wheel", onWheel, { passive: false });

    const animate = () => {
      frame = requestAnimationFrame(animate);

      scrollIntensity +=
        (targetScrollIntensity - scrollIntensity) * scrollSmoothness;
      material.uniforms.uScrollIntensity.value = scrollIntensity;

      scrollPosition +=
        (targetScrollPosition - scrollPosition) * scrollPositionSmoothness;

      let normalizedPosition = scrollPosition % 1;
      if (normalizedPosition < 0) normalizedPosition += 1;

      material.uniforms.uScrollPosition.value = isStable
        ? 0
        : normalizedPosition;

      updateTextureIndices();

      const baseScale = 1.0;
      const scaleIntensity = 0.1;

      if (scrollIntensity > 0) {
        const scale = baseScale + scrollIntensity * scaleIntensity;
        plane.scale.set(scale, scale, 1);
      } else {
        const scale = baseScale - Math.abs(scrollIntensity) * scaleIntensity;
        plane.scale.set(scale, scale, 1);
      }

      targetScrollIntensity *= 0.98;

      const scrollDelta = Math.abs(targetScrollPosition - scrollPosition);

      if (scrollDelta < movementThreshold) {
        if (isMoving && !isSnapping) snapToNearestImage();

        if (scrollDelta < 0.0001) {
          if (!isStable) {
            isStable = true;
            scrollPosition = Math.round(scrollPosition);
            targetScrollPosition = scrollPosition;
          }

          isMoving = false;
          isSnapping = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
      window.removeEventListener("resize", onResize);
      root.removeEventListener("wheel", onWheel);
      for (const texture of textures) texture.dispose();
      plane.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [slides]);

  return (
    <div className="crs-root" ref={rootRef}>
      <style>{styles}</style>
      <nav className="crs-nav">
        <div className="crs-logo">
          <a href="#top">{brand}</a>
        </div>
        <div className="crs-links">
          {navLinks.map((link) => (
            <a href="#top" key={link}>
              {link}
            </a>
          ))}
          <div className="crs-socials">
            {socials.map((social) => (
              <a href="#top" key={social}>
                {social}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <footer className="crs-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </footer>

      <div className="crs-gradient-bg" />

      <div className="crs-container">
        <div className="crs-project-title-container">
          <a href="#top" className="crs-project-link">
            <div className="crs-project-title-mask">
              <p className="crs-project-title">{slides[0]?.title}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap");

.crs-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.crs-root * { margin: 0; padding: 0; box-sizing: border-box; }
.crs-root a,
.crs-root p {
  display: block;
  text-decoration: none;
  text-transform: uppercase;
  color: #000;
  font-family: "Roboto Mono", monospace;
  font-size: 12px;
  font-weight: 400;
}
.crs-nav,
.crs-footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 1em;
  display: flex;
  justify-content: space-between;
  gap: 2em;
  z-index: 3;
}
.crs-nav { top: 0; }
.crs-footer { bottom: 0; }
.crs-links,
.crs-socials { display: flex; gap: 2em; }
.crs-nav > *,
.crs-links a { flex: 1; }
.crs-gradient-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(204, 204, 204);
  background: linear-gradient(
    0deg,
    rgba(204, 204, 204, 1) 0%,
    rgba(255, 255, 255, 1) 100%
  );
  z-index: 0;
}
.crs-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
}
.crs-project-title-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  aspect-ratio: 16/9;
}
.crs-project-link {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
}
.crs-project-title-mask {
  position: relative;
  width: 100%;
  height: 16px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  overflow: hidden;
}
.crs-project-title {
  display: block;
  position: relative;
  transform: translateY(0px);
  color: #fff;
  text-align: center;
  text-transform: uppercase;
  font-family: "Roboto Mono", monospace;
  font-size: 13px;
  line-height: 1;
  transition: transform 0.5s ease-in-out;
}
`;

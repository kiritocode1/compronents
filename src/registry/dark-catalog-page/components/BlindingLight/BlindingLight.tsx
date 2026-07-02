// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  EffectComposer,
  EffectPass,
  GodRaysEffect,
  RenderPass,
} from "postprocessing";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";

import { LOGO_PATH_D, LOGO_SVG_H, LOGO_SVG_W } from "./logoPath";

gsap.registerPlugin(ScrollTrigger);

const CONFIG = {
  logoScale: 10,
  logoYOffset: -2,
};

const BASE_SIZE = 900;
const SVG_ASPECT = LOGO_SVG_W / LOGO_SVG_H;

// scale logo mesh based on viewport size
function getLogoScaleMultiplier(w, h) {
  return Math.min(w, h) / BASE_SIZE;
}

// vertical range the light travels during scroll
function getLightBounds(scaleMultiplier) {
  const halfH = (CONFIG.logoScale * scaleMultiplier) / 2;
  return {
    start: -halfH + CONFIG.logoYOffset * scaleMultiplier,
    end: halfH + CONFIG.logoYOffset * scaleMultiplier,
  };
}

// convert svg path d string into subpath point arrays
function parseSvgPath(d, steps = 32) {
  const subpaths = [];
  let pts = [],
    cx = 0,
    cy = 0;
  const tokens = d.match(
    /[MmCcHhVvZz]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g,
  );
  let i = 0;
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++];
    switch (cmd) {
      case "M": {
        cx = num();
        cy = num();
        pts.push([cx, cy]);
        break;
      }
      case "C": {
        while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
          const x1 = num(),
            y1 = num(),
            x2 = num(),
            y2 = num(),
            x = num(),
            y = num();
          for (let t = 1; t <= steps; t++) {
            const u = t / steps,
              v = 1 - u;
            pts.push([
              v * v * v * cx +
                3 * v * v * u * x1 +
                3 * v * u * u * x2 +
                u * u * u * x,
              v * v * v * cy +
                3 * v * v * u * y1 +
                3 * v * u * u * y2 +
                u * u * u * y,
            ]);
          }
          cx = x;
          cy = y;
        }
        break;
      }
      case "H": {
        cx = num();
        pts.push([cx, cy]);
        break;
      }
      case "V": {
        cy = num();
        pts.push([cx, cy]);
        break;
      }
      case "Z": {
        subpaths.push(pts);
        pts = [];
        break;
      }
    }
  }
  return subpaths;
}

const LOGO_SUBPATHS = parseSvgPath(LOGO_PATH_D, 32);

// build three.js occluder mesh from parsed logo subpaths
function buildLogoOccluder() {
  const scaleW = CONFIG.logoScale * SVG_ASPECT;
  const scaleH = CONFIG.logoScale;
  const yOff = CONFIG.logoYOffset;

  const toVec2 = (subpath) =>
    subpath.map(
      ([x, y]) =>
        new THREE.Vector2(
          (x / LOGO_SVG_W - 0.5) * scaleW,
          -(y / LOGO_SVG_H - 0.5) * scaleH + yOff,
        ),
    );

  const shape = new THREE.Shape([
    new THREE.Vector2(-100, 100),
    new THREE.Vector2(100, 100),
    new THREE.Vector2(100, -100),
    new THREE.Vector2(-100, -100),
  ]);
  shape.holes.push(new THREE.Path(toVec2(LOGO_SUBPATHS[0])));

  const geo = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0b0b0b,
    side: THREE.FrontSide,
  });
  const occluderMesh = new THREE.Mesh(geo, mat);

  const innerGroup = new THREE.Group();
  for (let h = 1; h < LOGO_SUBPATHS.length; h++) {
    const innerShape = new THREE.Shape(toVec2(LOGO_SUBPATHS[h]));
    const innerGeo = new THREE.ShapeGeometry(innerShape);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x080808 });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.position.z = 0.1;
    innerGroup.add(innerMesh);
  }

  const group = new THREE.Group();
  group.add(occluderMesh);
  group.add(innerGroup);
  return group;
}

// simplex noise glsl injected into the light material
const SIMPLEX_NOISE = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// create animated circle mesh used as god-rays light source
function blindingLightCreateLight() {
  const timeUniform = { value: 0 };
  const geo = new THREE.CircleGeometry(50, 64);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xedebe7,
    onBeforeCompile: (shader) => {
      shader.uniforms.time = timeUniform;
      shader.fragmentShader = `uniform float time;\n${shader.fragmentShader}`
        .replace("void main() {", `${SIMPLEX_NOISE}\nvoid main() {`)
        .replace(
          "vec4 diffuseColor = vec4( diffuse, opacity );",
          `
          vec2 uv = vUv - 0.5;
          vec3 col = vec3(0);
          float f = smoothstep(0.5, 0., length(uv));
          f = pow(f, 4.);
          float n = snoise(vec3(uv * 7., time)) * 0.5 + 0.5;
          n = n * 0.5 + 0.5;
          col = mix(col, diffuse, f * n);
          vec4 diffuseColor = vec4(col, opacity);
          `,
        );
    },
  });
  mat.defines = { USE_UV: "" };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.time = timeUniform;
  return mesh;
}

const BlindingLight = () => {
  const blindingLightContainerRef = useRef(null);
  const blindingLightSectionRef = useRef(null);
  const instanceRef = useRef(null);

  // init three.js scene, god rays, and scroll-driven light animation
  useEffect(() => {
    const container = blindingLightContainerRef.current;
    const section = blindingLightSectionRef.current;
    if (!container || !section) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      stencil: false,
      depth: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.replaceChildren();
    container.appendChild(renderer.domElement);

    const logoGroup = buildLogoOccluder();
    let scaleMultiplier = getLogoScaleMultiplier(width, height);
    logoGroup.scale.setScalar(scaleMultiplier);
    scene.add(logoGroup);

    let { start: lightYStart, end: lightYEnd } =
      getLightBounds(scaleMultiplier);

    const light = blindingLightCreateLight();
    light.position.set(0, lightYStart, -10);
    scene.add(light);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const godRaysEffect = new GodRaysEffect(camera, light, {
      height: 720,
      kernelSize: 2,
      density: 0.9,
      decay: 0.9,
      weight: 0,
      exposure: 0,
      samples: 40,
      clampMax: 0.5,
    });
    composer.addPass(new EffectPass(camera, godRaysEffect));

    if (godRaysEffect.godRaysMaterial.uniforms.exposure)
      godRaysEffect.godRaysMaterial.uniforms.exposure.value = 0;
    if (godRaysEffect.godRaysMaterial.uniforms.weight)
      godRaysEffect.godRaysMaterial.uniforms.weight.value = 0;

    const timer = new THREE.Timer();
    timer.connect(document);

    function blindingLightLoop(time) {
      timer.update(time);
      const t = timer.getElapsed();
      light.userData.time.value = t;
      light.position.x = Math.cos(t * 0.7) * 0.8;
      composer.render();
    }

    let scrollProgress = 0;

    // map scroll progress to light position and ray intensity
    function applyScrollProgress(p) {
      scrollProgress = p;
      const buildP = Math.min(p / 0.25, 1);
      const dropP = Math.max(0, Math.min((p - 0.25) / 0.5, 1));
      const fadeP = Math.max(0, (p - 0.75) / 0.25);

      light.position.y = lightYStart + (lightYEnd - lightYStart) * dropP;

      const intensity = buildP * (1 - fadeP);
      if (godRaysEffect.godRaysMaterial.uniforms.exposure)
        godRaysEffect.godRaysMaterial.uniforms.exposure.value =
          0.125 * intensity;
      if (godRaysEffect.godRaysMaterial.uniforms.weight)
        godRaysEffect.godRaysMaterial.uniforms.weight.value = 0.15 * intensity;
    }

    function blindingLightResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 1 || h < 1) return;

      scaleMultiplier = getLogoScaleMultiplier(w, h);
      logoGroup.scale.setScalar(scaleMultiplier);
      ({ start: lightYStart, end: lightYEnd } =
        getLightBounds(scaleMultiplier));

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(window.devicePixelRatio);
      composer.setSize(w, h);

      applyScrollProgress(scrollProgress);
      ScrollTrigger.refresh();
    }

    let blindingLightResizeRaf = 0;
    function blindingLightScheduleResize() {
      cancelAnimationFrame(blindingLightResizeRaf);
      blindingLightResizeRaf = requestAnimationFrame(blindingLightResize);
    }

    window.addEventListener("resize", blindingLightScheduleResize);
    const blindingLightResizeObserver = new ResizeObserver(
      blindingLightScheduleResize,
    );
    blindingLightResizeObserver.observe(container);
    renderer.setAnimationLoop(blindingLightLoop);

    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=300%",
      pin: true,
      scrub: 1.5,
      onUpdate: (self) => applyScrollProgress(self.progress),
    });

    applyScrollProgress(scrollTrigger.progress);

    instanceRef.current = {
      renderer,
      composer,
      timer,
      scrollTrigger,
      blindingLightResizeObserver,
      blindingLightScheduleResize,
      blindingLightResizeRaf,
    };

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      if (instanceRef.current?.scrollTrigger === scrollTrigger) {
        instanceRef.current = null;
      }
    };
  }, []);

  // dispose three.js resources after react unmounts pinned content
  useLayoutEffect(() => {
    return () => {
      const instance = instanceRef.current;
      if (!instance) return;

      instance.scrollTrigger.kill();
      instance.renderer.setAnimationLoop(null);
      cancelAnimationFrame(instance.blindingLightResizeRaf);
      instance.blindingLightResizeObserver.disconnect();
      window.removeEventListener(
        "resize",
        instance.blindingLightScheduleResize,
      );
      instance.timer.dispose();
      instance.renderer.dispose();
      instance.composer.dispose();
      instanceRef.current = null;
    };
  }, []);

  return (
    <section className="blinding-light" ref={blindingLightSectionRef}>
      <div className="blinding-light-header">
        <p className="mono">Operational Since 2024</p>
        <h5 className="type-2">We build worlds that refuse to let you go</h5>
      </div>

      <div className="blinding-light-footer">
        <div className="container">
          <p className="mono">Signal Intercepted</p>
          <p className="mono">Location Unknown</p>
        </div>
      </div>
      <div className="blinding-light-stage" ref={blindingLightContainerRef} />
    </section>
  );
};

export default BlindingLight;

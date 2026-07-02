// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import { useEffect, useRef } from "react";

import * as THREE from "three";
import { getScrollerScrollTop, useScroller } from "../../runtime";
import Copy from "../Copy/Copy";

// spiral tile vertex shader
const spiralVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

// spiral tile fragment shader with view-dependent falloff
const spiralFragmentShader = `
  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
    float facing = max(dot(-normalize(vWorldNormal), viewDir), 0.0);
    float falloff = smoothstep(-0.2, 0.5, facing) * 0.45 + 0.42;
    vec3 color = mix(vec3(1.0), tex.rgb * falloff, 0.975) * 1.25;
    gl_FragColor = vec4(color, tex.a);
  }
`;

const SPIRAL_CONFIG = {
  totalImages: 10,
  tilesPerRevolution: 15,
  revolutions: 5,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  tileSegments: 24,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.005,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
};

const Spiral = ({ images, heading }) => {
  const spiralSectionRef = useRef(null);
  const spiralRendererRef = useRef(null);
  const { scroller } = useScroller();

  // build three.js spiral gallery with scroll-driven camera and spin
  useEffect(() => {
    const spiralSection = spiralSectionRef.current;
    if (!spiralSection) return;

    const spiralTotalTiles = Math.floor(
      SPIRAL_CONFIG.tilesPerRevolution * SPIRAL_CONFIG.revolutions,
    );
    const spiralAngleStep = (Math.PI * 2) / SPIRAL_CONFIG.tilesPerRevolution;

    const spiralScene = new THREE.Scene();

    const spiralCamera = new THREE.PerspectiveCamera(
      75,
      spiralSection.clientWidth / spiralSection.clientHeight,
      0.1,
      1000,
    );
    spiralCamera.position.z = SPIRAL_CONFIG.cameraZ;

    const spiralRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    spiralRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    spiralRenderer.setSize(
      spiralSection.clientWidth,
      spiralSection.clientHeight,
    );
    spiralSection.appendChild(spiralRenderer.domElement);
    spiralRendererRef.current = spiralRenderer;

    const spiralTextureLoader = new THREE.TextureLoader();
    const spiralTextures = images.map((src) =>
      spiralTextureLoader.load(src, (t) => {
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.anisotropy = spiralRenderer.capabilities.getMaxAnisotropy();
      }),
    );

    const spiralCameraPositionUniform = {
      value: new THREE.Vector3(0, 0, SPIRAL_CONFIG.cameraZ),
    };

    const spiralTileEdgesY = [0];

    for (let i = 0; i < spiralTotalTiles; i++) {
      const progress = i / spiralTotalTiles;
      const radius =
        SPIRAL_CONFIG.startRadius +
        (SPIRAL_CONFIG.endRadius - SPIRAL_CONFIG.startRadius) * progress;
      const arcWidth =
        (2 * Math.PI * radius) / SPIRAL_CONFIG.tilesPerRevolution;
      const tileHeight = arcWidth * SPIRAL_CONFIG.tileHeightRatio;
      spiralTileEdgesY.push(
        spiralTileEdgesY[i] -
          (tileHeight + SPIRAL_CONFIG.spiralGap) /
            SPIRAL_CONFIG.tilesPerRevolution,
      );
    }

    const spiralGroup = new THREE.Group();
    spiralScene.add(spiralGroup);

    for (let i = 0; i < spiralTotalTiles; i++) {
      const progress = i / spiralTotalTiles;
      const radius =
        SPIRAL_CONFIG.startRadius +
        (SPIRAL_CONFIG.endRadius - SPIRAL_CONFIG.startRadius) * progress;
      const arcWidth =
        (2 * Math.PI * radius) / SPIRAL_CONFIG.tilesPerRevolution;
      const tileHeight = arcWidth * SPIRAL_CONFIG.tileHeightRatio;
      const tileAngle = arcWidth / radius + SPIRAL_CONFIG.tileOverlap;

      const centerY = (spiralTileEdgesY[i] + spiralTileEdgesY[i + 1]) / 2;
      const slope = spiralTileEdgesY[i + 1] - spiralTileEdgesY[i];

      const spiralPositions = [];
      const spiralUvCoords = [];
      const spiralIndices = [];
      const segments = SPIRAL_CONFIG.tileSegments;

      for (let row = 0; row <= 1; row++) {
        for (let col = 0; col <= segments; col++) {
          const angle = (col / segments - 0.5) * tileAngle;
          spiralPositions.push(
            Math.sin(angle) * radius,
            (row - 0.5) * tileHeight + (col / segments - 0.5) * slope,
            Math.cos(angle) * radius,
          );
          spiralUvCoords.push(col / segments, row);
        }
      }

      for (let col = 0; col < segments; col++) {
        const current = col;
        const below = current + segments + 1;
        spiralIndices.push(
          current,
          below,
          current + 1,
          below,
          below + 1,
          current + 1,
        );
      }

      const spiralGeometry = new THREE.BufferGeometry();
      spiralGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(spiralPositions, 3),
      );
      spiralGeometry.setAttribute(
        "uv",
        new THREE.Float32BufferAttribute(spiralUvCoords, 2),
      );
      spiralGeometry.setIndex(spiralIndices);
      spiralGeometry.computeVertexNormals();

      const spiralMaterial = new THREE.ShaderMaterial({
        vertexShader: spiralVertexShader,
        fragmentShader: spiralFragmentShader,
        uniforms: {
          uMap: {
            value: spiralTextures[i % spiralTextures.length],
          },
          uCameraPosition: spiralCameraPositionUniform,
        },
        side: THREE.DoubleSide,
      });

      const spiralMesh = new THREE.Mesh(spiralGeometry, spiralMaterial);
      spiralMesh.position.y = centerY;

      const spiralTile = new THREE.Group();
      spiralTile.rotation.y = i * spiralAngleStep;
      spiralTile.add(spiralMesh);
      spiralGroup.add(spiralTile);
    }

    const spiralHeight = Math.abs(spiralTileEdgesY[spiralTotalTiles]);

    let spiralScrollY = 0;
    let spiralSpinVelocity = 0;

    let spiralLastScrollY = getScrollerScrollTop(scroller);

    const spiralOnScroll = () => {
      const nextScrollY = getScrollerScrollTop(scroller);
      const delta = nextScrollY - spiralLastScrollY;
      spiralScrollY = nextScrollY;
      spiralLastScrollY = nextScrollY;
      spiralSpinVelocity =
        delta * 0.08 * SPIRAL_CONFIG.scrollRotationMultiplier;
    };

    const spiralScrollTarget = scroller || window;
    spiralScrollTarget.addEventListener("scroll", spiralOnScroll, {
      passive: true,
    });
    spiralOnScroll();

    let spiralRafId;

    const spiralAnimate = () => {
      spiralRafId = requestAnimationFrame(spiralAnimate);

      const progress = Math.min(
        spiralScrollY / (window.innerHeight * SPIRAL_CONFIG.scrollMultiplier),
        1,
      );
      spiralCamera.position.y +=
        (-(progress * spiralHeight * SPIRAL_CONFIG.cameraYMultiplier) -
          spiralCamera.position.y) *
        SPIRAL_CONFIG.cameraSmoothing;

      spiralCameraPositionUniform.value.copy(spiralCamera.position);

      spiralGroup.rotation.y +=
        SPIRAL_CONFIG.baseRotationSpeed + spiralSpinVelocity;
      spiralSpinVelocity *= SPIRAL_CONFIG.rotationDecay;

      spiralRenderer.render(spiralScene, spiralCamera);
    };

    spiralAnimate();

    const updateSpiralScale = () => {
      const scale = Math.min(1, spiralSection.clientWidth / 1400);
      spiralGroup.scale.setScalar(Math.max(0.78, scale));
    };

    const spiralOnResize = () => {
      spiralCamera.aspect =
        spiralSection.clientWidth / spiralSection.clientHeight;
      spiralCamera.updateProjectionMatrix();
      spiralRenderer.setSize(
        spiralSection.clientWidth,
        spiralSection.clientHeight,
      );
      updateSpiralScale();
    };

    updateSpiralScale();
    window.addEventListener("resize", spiralOnResize);

    return () => {
      cancelAnimationFrame(spiralRafId);
      window.removeEventListener("resize", spiralOnResize);
      spiralScrollTarget.removeEventListener("scroll", spiralOnScroll);
      spiralRenderer.dispose();
      if (spiralSection.contains(spiralRenderer.domElement)) {
        spiralSection.removeChild(spiralRenderer.domElement);
      }

      spiralGroup.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });

      spiralTextures.forEach((t) => t.dispose());
    };
  }, [images, scroller]);

  return (
    <section className="studio-hero" ref={spiralSectionRef}>
      <div className="studio-hero-header">
        <div className="container">
          <Copy animateOnScroll={false} delay={0.65}>
            <h1 className="type-2">{heading}</h1>
          </Copy>
        </div>
      </div>
    </section>
  );
};

export default Spiral;

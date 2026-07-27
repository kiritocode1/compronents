"use client";

/**
 * Cylinder Block Gallery - photographs mounted as curved panels on the inside
 * of a tall cylinder you fly up through. Each panel is a hand-built buffer
 * geometry bent to the cylinder's radius, so the picture wraps with the wall
 * instead of floating flat in front of it, and its UVs are inset a tenth on
 * each side so the edges do not smear. Panels sit in horizontal bands with a
 * random angular jitter, the ring turns on its own at a constant crawl, and
 * scroll velocity is injected as extra spin that decays on its own.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const ASSET_BASE = "https://ui.aryank.space/assets/cylinder-block-gallery";

export interface CylinderBlockGalleryProps {
  images?: string[];
  /** Horizontal bands of panels stacked up the cylinder. */
  rows?: number;
  /** Panels evenly spaced around each band. */
  panelsPerRow?: number;
  /** World units between two bands. */
  rowSpacing?: number;
  /** Panel size in world units, before the curve is applied. */
  panelSize?: [number, number];
  background?: string;
  navLeft?: string;
  navCenter?: string;
  navRight?: string;
  footerLeft?: string;
  footerRight?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 50 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

export default function CylinderBlockGallery({
  images = DEFAULT_IMAGES,
  rows = 12,
  panelsPerRow = 4,
  rowSpacing = 3.25,
  panelSize = [5, 3],
  background = "#e6e5e3",
  navLeft = "Silhouette",
  navCenter = "Microfolio 2017 - Ongoing",
  navRight = "Info",
  footerLeft = "Experiment CG407",
  footerRight = "By BLANK",
  embedded = true,
}: CylinderBlockGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = root.querySelector<HTMLElement>(".cbg-stage");
    const scroller = root.querySelector<HTMLElement>(".cbg-scroller");
    const content = root.querySelector<HTMLElement>(".cbg-content");
    if (!stage || !scroller || !content) return;

    const lenis = embedded
      ? new Lenis({ wrapper: scroller, content, autoRaf: true })
      : new Lenis({ autoRaf: true });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      stage.clientWidth / stage.clientHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setClearColor(0x000000, 0);
    stage.appendChild(renderer.domElement);

    const galleryGroup = new THREE.Group();
    scene.add(galleryGroup);

    const radius = 6;
    const height = 30;
    const segments = 30;

    const cylinderGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      segments,
      1,
      true,
    );
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    galleryGroup.add(new THREE.Mesh(cylinderGeometry, cylinderMaterial));

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const textures: THREE.Texture[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    let disposed = false;

    function loadImageTexture(src: string) {
      return new Promise<THREE.Texture>((resolve) => {
        textureLoader.load(src, (loadedTexture) => {
          loadedTexture.generateMipmaps = true;
          loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          loadedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          textures.push(loadedTexture);
          resolve(loadedTexture);
        });
      });
    }

    function createCurvedPlane(
      width: number,
      planeHeight: number,
      planeRadius: number,
      planeSegments: number,
    ) {
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const indices: number[] = [];
      const uvs: number[] = [];

      const segmentsX = planeSegments * 4;
      const segmentsY = Math.floor(planeHeight * 12);
      const theta = width / planeRadius;

      for (let y = 0; y <= segmentsY; y++) {
        const yPos = (y / segmentsY - 0.5) * planeHeight;
        for (let x = 0; x <= segmentsX; x++) {
          const xAngle = (x / segmentsX - 0.5) * theta;
          vertices.push(
            Math.sin(xAngle) * planeRadius,
            yPos,
            Math.cos(xAngle) * planeRadius,
          );
          uvs.push((x / segmentsX) * 0.8 + 0.1, y / segmentsY);
        }
      }

      for (let y = 0; y < segmentsY; y++) {
        for (let x = 0; x < segmentsX; x++) {
          const a = x + (segmentsX + 1) * y;
          const b = x + (segmentsX + 1) * (y + 1);
          const c = x + 1 + (segmentsX + 1) * (y + 1);
          const d = x + 1 + (segmentsX + 1) * y;
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
      );
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      geometries.push(geometry);
      return geometry;
    }

    const totalBlockHeight = rows * rowSpacing;
    const heightBuffer = (height - totalBlockHeight) / 2;
    const startY = -height / 2 + heightBuffer + rowSpacing;
    const sectionAngle = (Math.PI * 2) / panelsPerRow;
    const maxRandomAngle = sectionAngle * 0.3;

    async function createBlock(baseY: number, yOffset: number, index: number) {
      const blockGeometry = createCurvedPlane(
        panelSize[0],
        panelSize[1],
        radius,
        10,
      );
      const src = images[Math.floor(Math.random() * images.length)];
      const texture = await loadImageTexture(src);
      if (disposed) return null;

      const blockMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      materials.push(blockMaterial);

      const block = new THREE.Mesh(blockGeometry, blockMaterial);
      block.position.y = baseY + yOffset;

      const blockContainer = new THREE.Group();
      blockContainer.rotation.y =
        sectionAngle * index + (Math.random() * 2 - 1) * maxRandomAngle;
      blockContainer.add(block);
      return blockContainer;
    }

    (async () => {
      for (let section = 0; section < rows; section++) {
        const baseY = startY + section * rowSpacing;
        for (let i = 0; i < panelsPerRow; i++) {
          const blockContainer = await createBlock(
            baseY,
            Math.random() * 0.2 - 0.1,
            i,
          );
          if (disposed) return;
          if (blockContainer) galleryGroup.add(blockContainer);
        }
      }
    })();

    scene.add(new THREE.AmbientLight(0xffffff, 1));

    camera.position.z = 12;
    camera.position.y = 0;

    let currentScroll = 0;
    let rotationSpeed = 0;
    const baseRotationSpeed = 0.0025;

    const totalScroll = () =>
      embedded
        ? Math.max(1, scroller.scrollHeight - scroller.clientHeight)
        : Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight,
          );

    lenis.on("scroll", (e: { scroll: number; velocity: number }) => {
      currentScroll = e.scroll;
      rotationSpeed = e.velocity * 0.005;
    });

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const scrollFraction = currentScroll / totalScroll();
      camera.position.y = -(scrollFraction * height - height / 2);
      galleryGroup.rotation.y += baseRotationSpeed + rotationSpeed;
      // The source multiplies by two each frame, which reads as an impulse that
      // is immediately overwritten by the next scroll event rather than a decay.
      rotationSpeed *= 2;
      renderer.render(scene, camera);
    };
    animate();

    const resize = new ResizeObserver(() => {
      if (!stage.clientWidth || !stage.clientHeight) return;
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
    resize.observe(stage);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      lenis.destroy();
      for (const texture of textures) texture.dispose();
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      cylinderGeometry.dispose();
      cylinderMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [embedded, images, rows, panelsPerRow, rowSpacing, panelSize]);

  return (
    <div
      className={embedded ? "cbg-root cbg-embedded" : "cbg-root"}
      ref={rootRef}
      style={{ backgroundColor: background }}
    >
      <style>{styles}</style>

      <div className="cbg-stage" />

      <div className="cbg-scroller">
        <div className="cbg-content" />
      </div>

      <div className="cbg-nav">
        <div className="cbg-nav-col">
          <p>{navLeft}</p>
          <p>{navCenter}</p>
        </div>
        <div className="cbg-nav-col">
          <p>{navRight}</p>
        </div>
      </div>

      <div className="cbg-footer">
        <p>{footerLeft}</p>
        <p>{footerRight}</p>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap");

.cbg-root {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.cbg-root * {
  box-sizing: border-box;
}

.cbg-root.cbg-embedded {
  height: 100%;
}

.cbg-scroller {
  position: relative;
  width: 100%;
  z-index: 1;
}

.cbg-root.cbg-embedded .cbg-scroller {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.cbg-root.cbg-embedded .cbg-scroller::-webkit-scrollbar {
  display: none;
}

.cbg-content {
  width: 100%;
  height: 500svh;
  pointer-events: none;
}

.cbg-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.cbg-root:not(.cbg-embedded) .cbg-stage {
  position: fixed;
}

.cbg-stage canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.cbg-root p {
  margin: 0;
  text-transform: uppercase;
  font-family: "Archivo", sans-serif;
  font-stretch: expanded;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.125;
  color: #fff;
}

.cbg-nav,
.cbg-footer {
  position: absolute;
  left: 0;
  width: 100%;
  padding: 1.5em;
  display: flex;
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: difference;
}

.cbg-nav {
  top: 0;
}

.cbg-footer {
  bottom: 0;
  justify-content: space-between;
}

.cbg-root:not(.cbg-embedded) .cbg-nav,
.cbg-root:not(.cbg-embedded) .cbg-footer {
  position: fixed;
}

.cbg-nav-col {
  flex: 1;
}

.cbg-nav-col:nth-child(1) {
  display: flex;
}

.cbg-nav-col:nth-child(1) p {
  flex: 1;
}

.cbg-nav-col:nth-child(2) {
  text-align: right;
}
`;

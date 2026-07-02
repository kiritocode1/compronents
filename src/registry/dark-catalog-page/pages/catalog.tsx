// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useAsset, useRoute } from "../runtime";
import {
  createScrambleSplit,
  playScrambleIn,
  revertScrambleInstance,
  scrambleIn,
  scrambleOut,
  scrambleVisible,
} from "../utils/scramble";

gsap.registerPlugin(SplitText);

const CATALOG_INITIAL_DELAY = 0.85;
const CATALOG_LINE_STAGGER = 0.05;
const CATALOG_TAG_STAGGER = 0.06;
const CATALOG_TAGS_START = 0.35;
const CATALOG_SCRAMBLE = {
  duration: 0.15,
  charDelay: 50,
  stagger: 25,
  maxIterations: 5,
};

// webgl vertex shader - fullscreen plane
const catalogVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// webgl fragment shader - horizontal image wipe transition
const catalogFragmentShader = `
  uniform float time;
  uniform float progress;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform vec4 resolution;
  varying vec2 vUv;

  void main() {
    vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    vec2 p = newUV;
    float x = progress;
    x = smoothstep(0.0, 1.0, (x * 2.0 + p.y - 1.0));
    vec4 f = mix(
      texture2D(texture1, (p - 0.5) * (1.0 - x) + 0.5),
      texture2D(texture2, (p - 0.5) * x + 0.5),
      x
    );
    gl_FragColor = f;
  }
`;

// slide data for the catalog viewer
const CATALOG_SLIDES = [
  {
    title: "Room 14B",
    description:
      "A sealed interrogation chamber with a single terminal still running. No one remembers who was last assigned here.",
    type: "Environment",
    field: "Psychological Horror",
    date: "2025",
    image: "/catalog/catalog-1.jpg",
  },
  {
    title: "Subject Identified",
    description:
      "Surveillance feed captures a figure on a stairwell landing. Facial recognition flags positive. The file says otherwise.",
    type: "Sequence",
    field: "Stealth Thriller",
    date: "2024",
    image: "/catalog/catalog-2.jpg",
  },
  {
    title: "Dossier 09",
    description:
      "Recovered case file with redacted identity, crossed out fingerprints, and coordinates that lead to a location that no longer exists.",
    type: "Narrative",
    field: "Investigation",
    date: "2025",
    image: "/catalog/catalog-3.jpg",
  },
  {
    title: "Stairwell C7",
    description:
      "A concrete underpass with failing fluorescents and a silhouette that hasn't moved in fourteen minutes of footage.",
    type: "Environment",
    field: "Atmospheric Tension",
    date: "2024",
    image: "/catalog/catalog-4.jpg",
  },
];

// static markup for the active catalog slide
function CatalogSlideContent({ slide }) {
  const { navigate } = useRoute();
  const handleBriefClick = (event) => {
    event.preventDefault();
    navigate("/brief");
  };
  return (
    <div className="container">
      <div className="catalog-slide-title">
        <h1 className="type-2">{slide.title}</h1>
      </div>

      <div className="catalog-slide-description">
        <p>{slide.description}</p>

        <div className="catalog-slide-info">
          <p className="mono sm">Type. {slide.type}</p>
          <p className="mono sm">Field. {slide.field}</p>
          <p className="mono sm">Date. {slide.date}</p>
        </div>

        <div className="catalog-slide-link">
          <a href="/brief" className="mono" onClick={handleBriefClick}>
            [ View Full Brief ]
          </a>
        </div>
      </div>
    </div>
  );
}

const Catalog = ({ slides = CATALOG_SLIDES }) => {
  const asset = useAsset();
  const catalogContainerRef = useRef(null);
  const catalogCanvasRef = useRef(null);
  const catalogContentRef = useRef(null);
  const catalogIndexRef = useRef(0);
  const [catalogActiveIndex, setCatalogActiveIndex] = useState(0);
  const [catalogContentHidden, setCatalogContentHidden] = useState(true);
  const catalogTransitioningRef = useRef(false);
  const catalogRendererRef = useRef(null);
  const catalogMaterialRef = useRef(null);
  const catalogTexturesRef = useRef([]);
  const catalogLineSplitsRef = useRef([]);
  const catalogTitleSplitRef = useRef(null);
  const catalogLinkSplitRef = useRef(null);
  const catalogTagSplitRefs = useRef([]);
  const catalogRafRef = useRef(null);
  const catalogLinkAnimatingRef = useRef(false);
  const catalogHasInteractedRef = useRef(false);
  const catalogInitialPlayedRef = useRef(false);

  // revert all splittext and scramble instances
  function catalogRevertSplits() {
    catalogLineSplitsRef.current.forEach((s) => s.revert());
    catalogLineSplitsRef.current = [];
    if (catalogTitleSplitRef.current) {
      revertScrambleInstance(catalogTitleSplitRef.current);
      catalogTitleSplitRef.current = null;
    }
    if (catalogLinkSplitRef.current) {
      revertScrambleInstance(catalogLinkSplitRef.current);
      catalogLinkSplitRef.current = null;
    }
    catalogTagSplitRefs.current.forEach(revertScrambleInstance);
    catalogTagSplitRefs.current = [];
  }

  // split element into masked line spans for slide-up reveal
  function catalogSplitLineReveal(element, splitsRef) {
    if (!element) return [];

    const split = SplitText.create(element, {
      type: "lines",
      linesClass: "catalog-line",
      lineThreshold: 0.1,
    });

    const spans = split.lines.map((line) => {
      line.innerHTML = `<span>${line.textContent}</span>`;
      return line.querySelector("span");
    });

    splitsRef.current.push(split);
    return spans.filter(Boolean);
  }

  // split description and tag lines on slide change
  const catalogProcessContent = useCallback((container) => {
    if (!container) return;

    catalogRevertSplits();

    const catalogSplitTargets = container.querySelectorAll(
      ".catalog-slide-description > p, .catalog-slide-info p",
    );

    catalogSplitTargets.forEach((el) => {
      const split = SplitText.create(el, {
        type: "lines",
        linesClass: "catalog-line",
      });
      split.lines.forEach((line) => {
        line.innerHTML = `<span>${line.textContent}</span>`;
      });
      catalogLineSplitsRef.current.push(split);
    });
  }, []);

  // first-load enter - line reveal plus tag and link scramble
  const catalogAnimateInitialEnter = useCallback((container) => {
    if (!container) return null;

    setCatalogContentHidden(false);
    catalogRevertSplits();

    const titleEl = container.querySelector(".catalog-slide-title h1");
    const descEl = container.querySelector(".catalog-slide-description > p");
    const tagEls = container.querySelectorAll(".catalog-slide-info p");
    const linkEl = container.querySelector(".catalog-slide-link a");

    const lineSpans = [
      ...catalogSplitLineReveal(titleEl, catalogLineSplitsRef),
      ...catalogSplitLineReveal(descEl, catalogLineSplitsRef),
    ];

    const tagSplits = Array.from(tagEls)
      .map((el) => createScrambleSplit(el))
      .filter(Boolean);
    catalogTagSplitRefs.current = tagSplits;

    const linkSplit = linkEl ? createScrambleSplit(linkEl) : null;
    if (linkSplit) catalogLinkSplitRef.current = linkSplit;

    if (lineSpans.length === 0 && tagSplits.length === 0 && !linkSplit) {
      return null;
    }

    gsap.set(lineSpans, { y: "120%" });

    const tl = gsap.timeline({
      onComplete: () => {
        catalogTransitioningRef.current = false;
      },
    });

    if (lineSpans.length > 0) {
      tl.to(lineSpans, {
        y: "0%",
        duration: 0.75,
        ease: "power3.out",
        stagger: CATALOG_LINE_STAGGER,
      });
    }

    const tagsAt = lineSpans.length > 0 ? CATALOG_TAGS_START : 0;

    tagSplits.forEach((split, index) => {
      tl.add(
        () => playScrambleIn(split, 0, CATALOG_SCRAMBLE),
        tagsAt + index * CATALOG_TAG_STAGGER,
      );
    });

    if (linkSplit) {
      tl.add(
        () => playScrambleIn(linkSplit, 0, CATALOG_SCRAMBLE),
        tagsAt + tagSplits.length * CATALOG_TAG_STAGGER,
      );
    }

    return tl;
  }, []);

  // slide enter - title scramble, line reveal, link scramble
  const catalogAnimateIn = useCallback((container) => {
    if (!container) return;

    const catalogLineSpans = container.querySelectorAll(".catalog-line span");
    const catalogTitleEl = container.querySelector(".catalog-slide-title h1");
    const catalogLinkEl = container.querySelector(".catalog-slide-link a");

    gsap.set(catalogLineSpans, { y: "120%" });

    if (catalogLinkEl) {
      catalogLinkEl.style.opacity = "0";
    }

    const catalogInTl = gsap.timeline({
      onComplete: () => {
        catalogTransitioningRef.current = false;
      },
    });

    if (catalogTitleEl) {
      catalogInTl.add(() => {
        catalogTitleSplitRef.current = scrambleIn(catalogTitleEl, 0, {
          duration: 0.15,
          charDelay: 30,
          stagger: 25,
          maxIterations: 4,
        });
      }, 0);
    }

    catalogInTl.to(
      catalogLineSpans,
      {
        y: "0%",
        duration: 0.6,
        stagger: 0.04,
        ease: "power3.out",
      },
      0.2,
    );

    if (catalogLinkEl) {
      catalogInTl.add(() => {
        catalogLinkEl.style.opacity = "1";
        catalogLinkSplitRef.current = scrambleIn(catalogLinkEl, 0, {
          duration: 0.15,
          charDelay: 30,
          stagger: 25,
          maxIterations: 4,
        });
      }, 0.5);
    }
  }, []);

  // slide exit - scramble title/link out and slide lines up
  const catalogAnimateOut = useCallback((container, onComplete) => {
    if (!container) {
      onComplete?.();
      return;
    }

    const catalogLineSpans = container.querySelectorAll(".catalog-line span");
    const catalogTitleEl = container.querySelector(".catalog-slide-title h1");
    const catalogLinkEl = container.querySelector(".catalog-slide-link a");

    let catalogTitleDone = false;
    let catalogLinesDone = false;
    let catalogLinkDone = !catalogLinkEl;

    function catalogCheckComplete() {
      if (catalogTitleDone && catalogLinesDone && catalogLinkDone) {
        onComplete?.();
      }
    }

    if (catalogTitleEl) {
      scrambleOut(catalogTitleEl, 0, {
        duration: 0.15,
        charDelay: 25,
        stagger: 20,
        maxIterations: 3,
      });

      setTimeout(() => {
        catalogTitleDone = true;
        catalogCheckComplete();
      }, 400);
    } else {
      catalogTitleDone = true;
    }

    gsap.to(catalogLineSpans, {
      y: "-120%",
      duration: 0.5,
      stagger: 0.025,
      ease: "power3.in",
      onComplete: () => {
        catalogLinesDone = true;
        catalogCheckComplete();
      },
    });

    if (catalogLinkEl) {
      scrambleOut(catalogLinkEl, 0.05, {
        duration: 0.1,
        charDelay: 10,
        stagger: 20,
        maxIterations: 2,
      });
      setTimeout(() => {
        catalogLinkDone = true;
        catalogCheckComplete();
      }, 350);
    }
  }, []);

  // advance slide on click - webgl wipe plus content out/in
  const catalogHandleClick = useCallback(
    (e) => {
      if (e.target.closest(".catalog-slide-link a")) return;
      if (catalogTransitioningRef.current) return;
      catalogTransitioningRef.current = true;
      catalogHasInteractedRef.current = true;
      setCatalogContentHidden(false);

      const nextIndex = (catalogIndexRef.current + 1) % slides.length;
      const catalogMaterial = catalogMaterialRef.current;
      const catalogTextures = catalogTexturesRef.current;

      if (catalogMaterial && catalogTextures.length) {
        catalogMaterial.uniforms.texture1.value =
          catalogTextures[catalogIndexRef.current];
        catalogMaterial.uniforms.texture2.value = catalogTextures[nextIndex];

        gsap.fromTo(
          catalogMaterial.uniforms.progress,
          { value: 0 },
          {
            value: 1,
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => {
              catalogMaterial.uniforms.progress.value = 0;
              catalogMaterial.uniforms.texture1.value =
                catalogTextures[nextIndex];
            },
          },
        );
      }

      catalogAnimateOut(catalogContentRef.current, () => {
        catalogIndexRef.current = nextIndex;
        setCatalogActiveIndex(nextIndex);
      });
    },
    [slides.length, catalogAnimateOut],
  );

  // delayed first-enter animation after fonts load
  useEffect(() => {
    if (
      catalogActiveIndex !== 0 ||
      catalogHasInteractedRef.current ||
      catalogInitialPlayedRef.current
    ) {
      return;
    }

    let cancelled = false;
    let tween = null;
    let delayCall = null;

    const playInitialEnter = async () => {
      try {
        await document.fonts.ready;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (
        cancelled ||
        catalogHasInteractedRef.current ||
        catalogInitialPlayedRef.current ||
        !catalogContentRef.current
      ) {
        return;
      }

      tween = catalogAnimateInitialEnter(catalogContentRef.current);
      if (tween) catalogInitialPlayedRef.current = true;
    };

    delayCall = gsap.delayedCall(CATALOG_INITIAL_DELAY, playInitialEnter);

    return () => {
      cancelled = true;
      delayCall?.kill();
      tween?.kill();
    };
  }, [catalogActiveIndex, catalogAnimateInitialEnter]);

  // re-split and animate content when active slide changes
  useEffect(() => {
    const catalogContent = catalogContentRef.current;
    if (!catalogContent) return;

    if (catalogActiveIndex === 0 && !catalogHasInteractedRef.current) {
      return;
    }

    catalogProcessContent(catalogContent);
    catalogAnimateIn(catalogContent);
  }, [catalogActiveIndex, catalogProcessContent, catalogAnimateIn]);

  // init three.js shader plane and texture loader
  useEffect(() => {
    const catalogCanvas = catalogCanvasRef.current;
    const catalogContainer = catalogContainerRef.current;
    if (!catalogCanvas || !catalogContainer) return;

    const catalogScene = new THREE.Scene();

    const catalogCamera = new THREE.PerspectiveCamera(
      70,
      catalogContainer.clientWidth / catalogContainer.clientHeight,
      0.001,
      1000,
    );
    catalogCamera.position.set(0, 0, 2);

    const catalogRenderer = new THREE.WebGLRenderer({
      canvas: catalogCanvas,
      antialias: true,
    });
    catalogRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    catalogRenderer.setSize(
      catalogContainer.clientWidth,
      catalogContainer.clientHeight,
    );
    catalogRendererRef.current = catalogRenderer;

    let catalogTime = 0;

    const catalogMaterial = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        texture1: { value: null },
        texture2: { value: null },
        resolution: { value: new THREE.Vector4() },
        width: { value: 0.5 },
      },
      vertexShader: catalogVertexShader,
      fragmentShader: catalogFragmentShader,
    });
    catalogMaterialRef.current = catalogMaterial;

    const catalogGeometry = new THREE.PlaneGeometry(1, 1, 2, 2);
    const catalogPlane = new THREE.Mesh(catalogGeometry, catalogMaterial);
    catalogScene.add(catalogPlane);

    function catalogUpdateResolution() {
      const w = catalogContainer.clientWidth;
      const h = catalogContainer.clientHeight;
      catalogRenderer.setSize(w, h);
      catalogCamera.aspect = w / h;

      const imageAspect =
        catalogTexturesRef.current.length > 0
          ? catalogTexturesRef.current[0].image.height /
            catalogTexturesRef.current[0].image.width
          : 1;

      let a1, a2;
      if (h / w > imageAspect) {
        a1 = (w / h) * imageAspect;
        a2 = 1;
      } else {
        a1 = 1;
        a2 = h / w / imageAspect;
      }

      catalogMaterial.uniforms.resolution.value.set(w, h, a1, a2);

      const dist = catalogCamera.position.z;
      const height = 1;
      catalogCamera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));

      catalogPlane.scale.x = catalogCamera.aspect;
      catalogPlane.scale.y = 1;

      catalogCamera.updateProjectionMatrix();
    }

    const catalogLoader = new THREE.TextureLoader();
    const catalogLoadPromises = slides.map(
      (slide) =>
        new Promise((resolve) =>
          catalogLoader.load(asset(slide.image), (t) => {
            t.minFilter = t.magFilter = THREE.LinearFilter;
            resolve(t);
          }),
        ),
    );

    Promise.all(catalogLoadPromises).then((textures) => {
      catalogTexturesRef.current = textures;

      catalogMaterial.uniforms.texture1.value = textures[0];
      catalogMaterial.uniforms.texture2.value = textures[1 % textures.length];

      catalogUpdateResolution();
    });

    const catalogRender = () => {
      catalogRafRef.current = requestAnimationFrame(catalogRender);
      catalogTime += 0.05;
      catalogMaterial.uniforms.time.value = catalogTime;
      catalogRenderer.render(catalogScene, catalogCamera);
    };
    catalogRender();

    const catalogOnResize = () => {
      if (catalogTexturesRef.current.length > 0) {
        catalogUpdateResolution();
      }
    };

    window.addEventListener("resize", catalogOnResize);

    return () => {
      cancelAnimationFrame(catalogRafRef.current);
      window.removeEventListener("resize", catalogOnResize);
      catalogRenderer.dispose();
      catalogTexturesRef.current.forEach((t) => t.dispose());
      catalogRevertSplits();
    };
  }, [slides, asset]);

  // scramble link text on hover
  useEffect(() => {
    const catalogContent = catalogContentRef.current;
    if (!catalogContent) return;

    const catalogLinkEl = catalogContent.querySelector(".catalog-slide-link a");
    if (!catalogLinkEl) return;

    function catalogHandleLinkEnter() {
      if (catalogLinkAnimatingRef.current) return;
      catalogLinkAnimatingRef.current = true;

      if (catalogLinkSplitRef.current) {
        catalogLinkSplitRef.current.charSplits?.forEach((s) => s.revert());
        catalogLinkSplitRef.current.wordSplit?.revert();
      }

      catalogLinkSplitRef.current = scrambleVisible(catalogLinkEl, 0, {
        duration: 0.1,
        charDelay: 25,
        stagger: 10,
        maxIterations: 5,
      });

      setTimeout(() => {
        catalogLinkAnimatingRef.current = false;
      }, 250);
    }

    catalogLinkEl.addEventListener("mouseenter", catalogHandleLinkEnter);

    return () => {
      catalogLinkEl.removeEventListener("mouseenter", catalogHandleLinkEnter);
    };
  }, [catalogActiveIndex]);

  const catalogCurrentSlide = slides[catalogActiveIndex];

  return (
    <section
      className="catalog-slider"
      ref={catalogContainerRef}
      onClick={catalogHandleClick}
    >
      <canvas className="catalog-canvas" ref={catalogCanvasRef} />

      <div
        className={`catalog-slider-content${catalogContentHidden ? " is-awaiting-enter" : ""}`}
        ref={catalogContentRef}
        key={catalogActiveIndex}
      >
        <CatalogSlideContent slide={catalogCurrentSlide} />
      </div>

      <div className="catalog-slider-footer">
        <div className="container">
          <p className="mono sm">Selected Catalog</p>
          <p className="mono sm">[ Click Through ]</p>
        </div>
      </div>
    </section>
  );
};

export default Catalog;

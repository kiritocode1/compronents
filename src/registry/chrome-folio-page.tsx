"use client";

/**
 * Chrome Folio Page - a dark portfolio homepage built on four scroll movements:
 * a masthead set in mixed grotesque and italic serif over a liquid-chrome WebGL
 * sphere, a parallax handoff into light, a cube that warps in from deep Z while
 * the mark blurs out, and a pinned card fly-through over an oversized word.
 *
 * Fills its container. Three.js + GSAP ScrollTrigger + SplitText + Lenis.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin);

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export interface FolioProject {
  title: string;
  blurb: string;
  /** Two colors for the generated media panel, top then bottom. */
  tint: [string, string];
}

export interface ChromeFolioPageProps {
  /** Masthead wordmark. Characters wrapped in braces set in italic serif. */
  wordmark?: string;
  /** Small mono line centered in the masthead. */
  tagline?: string;
  /** Secondary display line under the masthead. */
  subline?: string;
  /** Persistent mono line pinned to the bottom of the viewport. */
  standfirst?: string[];
  /** Mono intro above the project fly-through. */
  worksIntro?: string[];
  /** Oversized word behind the cube, set in italic serif. */
  cubeWord?: string;
  /** Oversized word behind the cards, set in grotesque. */
  projectsWord?: string;
  /** Two-line uppercase contact prompt in the outro. */
  outroHeading?: string[];
  /** Oversized word across the foot of the outro. */
  outroWord?: string;
  /** Mono links in the footer. */
  footerLinks?: string[];
  projects?: FolioProject[];
  /** Fired when a folder is dropped onto the back-to-top square. */
  onFolderDrop?: (label: string) => void;
  /** Ride the container's scroll instead of the window. */
  embedded?: boolean;
}

const DEFAULT_PROJECTS: FolioProject[] = [
  {
    title: "Field Atlas",
    blurb:
      "A reference site for a survey studio, built around a map that stays legible at every zoom and a type scale that holds on small screens.",
    tint: ["#6f7a63", "#2a2f26"],
  },
  {
    title: "Registry 24",
    blurb:
      "A component registry with live demos, source, and install commands generated from one manifest, so a new entry costs four files.",
    tint: ["#8a8a8a", "#1c1c1c"],
  },
  {
    title: "Signal Concept",
    blurb:
      "Layout and typography experiments run as a weekly exercise. Every piece ships as a working page, never a static frame.",
    tint: ["#a32014", "#2b0a06"],
  },
  {
    title: "Generated Gallery",
    blurb:
      "A minimal gallery exploring generated imagery through a plain grid and deliberately restrained, slightly distorted interactions.",
    tint: ["#4a4f58", "#141518"],
  },
  {
    title: "Practice Notes",
    blurb:
      "Long-form writing on interface craft, set in a single column with figures that expand inline rather than opening a lightbox.",
    tint: ["#b9a88d", "#2c261d"],
  },
];

/** Per-card y and rotation keyframes for the fly-through, four stops each. */
const CARD_KEYFRAMES: Array<[number[], number[]]> = [
  [
    [10, 50, -10, 10],
    [20, -10, -45, 20],
  ],
  [
    [0, 47.5, -10, 15],
    [-25, 15, -45, 30],
  ],
  [
    [0, 52.5, -10, 5],
    [15, -5, -40, 60],
  ],
  [
    [0, 50, 30, -80],
    [20, -10, 60, 5],
  ],
  [
    [0, 55, -15, 30],
    [25, -15, 60, 95],
  ],
];

const CUBE_INITIAL = {
  top: 150,
  left: 50,
  rotateX: -360,
  rotateY: -360,
  rotateZ: -180,
  z: -180000,
};
const CUBE_FINAL = {
  top: 50,
  left: 50,
  rotateX: -1,
  rotateY: 1,
  rotateZ: 0,
  z: 0,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Duplicates its content and slides the pair by exactly one copy width, which
 * is what makes the loop seamless regardless of text length.
 */
function Marquee({
  text,
  duration = 18,
  className,
}: {
  text: string;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`cfp-marquee ${className ?? ""}`}>
      <div
        className="cfp-marquee-track"
        style={{ animationDuration: `${duration}s` }}
      >
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </div>
    </div>
  );
}

/** Translucent folder tab, blurred over the chrome behind it. */
function Folder({
  label,
  style,
}: {
  label: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="cfp-folder" data-label={label} style={style}>
      <svg viewBox="0 0 40 32" width="40" height="32" aria-hidden="true">
        <path
          d="M0 4a4 4 0 0 1 4-4h10l4 5h18a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4Z"
          fill="currentColor"
        />
      </svg>
      <p>{label}</p>
    </div>
  );
}

/**
 * Splits `A{B}C` into runs, where braced runs render in italic serif. Lets the
 * wordmark mix two faces without the caller writing markup.
 */
function MixedType({ text }: { text: string }) {
  return text.split(/(\{[^}]*\})/).map((run, i) => {
    const key = `${i}-${run}`;
    return run.startsWith("{") ? (
      <em key={key}>{run.slice(1, -1)}</em>
    ) : (
      <span key={key}>{run}</span>
    );
  });
}

/* ------------------------------------------------------------------ */
/* Liquid chrome sphere                                                */
/* ------------------------------------------------------------------ */

const SPHERE_VERTEX = /* glsl */ `
  varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * 3D value noise supplies a rotation angle for the sampling frame, then two
 * smoothstepped sine bands are mixed over three greys. Rotating the frame is
 * what bends the bands into the folded, liquid-metal read.
 */
const SPHERE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLight;
  uniform vec3 uMid;
  uniform vec3 uDark;
  varying vec3 vPosition;

  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 perm(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float noise(vec3 p) {
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
  }

  float bands(vec2 uv, float offset) {
    return smoothstep(0.0, 0.9 + offset * 0.5, abs(0.5 * (sin(uv.x * 20.0) + offset * 2.0)));
  }

  mat2 rotate2d(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

  void main() {
    float n = noise(vPosition + uTime * 1.5);
    vec2 uv = rotate2d(n) * vPosition.xy * 0.15;
    vec3 color = mix(uLight, uMid, bands(uv, 0.2));
    color = mix(color, uDark, bands(uv, 0.3));
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Screen-space grain, matched to the film-grain density of the reference. */
const GRAIN_SHADER = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uAmount: { value: 0.08 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    varying vec2 vUv;

    float random(vec2 p) {
      vec2 k = vec2(23.14069263277926, 2.665144142690225);
      return fract(cos(dot(p, k)) * 12345.6789);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 uv = vUv;
      uv.y *= random(vec2(uv.y, 0.4));
      color.rgb += random(uv) * uAmount;
      gl_FragColor = color;
    }
  `,
};

const BASE_ROTATION = -0.8;
const MAX_ROTATION = 0.4;
const ROTATION_EASE = 0.05;

function useChromeSphere(mountRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.001, 1000);
    camera.position.set(0, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Raw shader output: color management would wash the greys toward white.
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0 },
      uLight: { value: new THREE.Vector3(0.784, 0.773, 0.753) },
      uMid: { value: new THREE.Vector3(0.243, 0.29, 0.439) },
      uDark: { value: new THREE.Vector3(0, 0, 0) },
    };

    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader: SPHERE_VERTEX,
      fragmentShader: SPHERE_FRAGMENT,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.y = BASE_ROTATION;
    scene.add(sphere);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new ShaderPass(GRAIN_SHADER));

    let target = BASE_ROTATION;
    let current = BASE_ROTATION;

    const onMouseMove = (e: MouseEvent) => {
      target =
        BASE_ROTATION +
        ((e.clientX / window.innerWidth) * 2 - 1) * MAX_ROTATION;
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    window.addEventListener("mousemove", onMouseMove);
    resize();

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      current += (target - current) * ROTATION_EASE;
      sphere.rotation.y = current;
      uniforms.uTime.value += 0.01;
      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      composer.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [mountRef]);
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ChromeFolioPage({
  wordmark = "BLANK STUDI{O} '{25}",
  tagline = "Mixing interfaces, code, and motion",
  subline = "DESIGN - {FOLIO}",
  standfirst = [
    "An independent interface studio working out of the web",
    "focused on systems, motion, and realtime graphics.",
  ],
  worksIntro = [
    "We design and build interfaces",
    "and hold the details through release",
    "/here is some of the work",
  ],
  cubeWord = "FEEL",
  projectsWord = "PROJECTS",
  outroHeading = ["Have an idea in mind?", "Feel free to get in touch."],
  outroWord = "GET IN TOUCH",
  footerLinks = [
    "Design and build by BLANK",
    "Instagram",
    "LinkedIn",
    "studio@aryank.space",
  ],
  projects = DEFAULT_PROJECTS,
  onFolderDrop,
  embedded = true,
}: ChromeFolioPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const outroSphereRef = useRef<HTMLDivElement>(null);

  /* Snaps rather than eases: the reference sets scrollTop = 0 outright. */
  const dropRef = useRef(onFolderDrop);
  dropRef.current = onFolderDrop;

  const scrollTop = () => {
    const viewport = viewportRef.current;
    if (embedded && viewport) {
      viewport.scrollTop = 0;
      return;
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useChromeSphere(sphereRef);
  useChromeSphere(outroSphereRef);

  useEffect(() => {
    const root = rootRef.current;
    const viewport = viewportRef.current;
    if (!root || !viewport) return;

    const scroller = embedded ? viewport : undefined;
    if (scroller) ScrollTrigger.defaults({ scroller });

    /*
     * Lenis runs its own rAF rather than riding gsap.ticker. The production
     * bundle splits gsap across chunks, so the instance this module imports
     * can hold a ticker that never starts; driving Lenis from it left
     * lenis.scroll pinned at 0 and every scrub stuck at progress 0.
     */
    const lenis = new Lenis({
      autoRaf: true,
      wrapper: embedded ? viewport : undefined,
      content: embedded
        ? (viewport.firstElementChild as HTMLElement | undefined)
        : undefined,
    });
    lenis.on("scroll", ScrollTrigger.update);

    const ctx = gsap.context(() => {
      /* --- Masthead reveal --- */
      const splitMark = new SplitText(".cfp-wordmark", { type: "chars" });
      gsap
        .timeline({ delay: 0.15 })
        .from(splitMark.chars, {
          yPercent: 115,
          duration: 1.1,
          stagger: 0.02,
          ease: "expo.out",
        })
        .from(
          ".cfp-hero-fade",
          { opacity: 0, duration: 0.9, stagger: 0.08, ease: "power2.out" },
          "-=0.7",
        )
        .from(
          ".cfp-chrome",
          { yPercent: 40, duration: 1.2, ease: "expo.out" },
          "-=1",
        );

      /* --- Hero handoff: chrome grows, masthead lifts at three rates --- */
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".cfp-hero",
          start: "top top",
          end: "+=200%",
          scrub: 1,
          pin: true,
        },
      });
      heroTl
        .to(".cfp-chrome", { height: "100%", ease: "none" }, 0)
        .to(".cfp-hero-mid", { yPercent: -140, opacity: 0, ease: "none" }, 0)
        .to(".cfp-subline", { yPercent: -260, ease: "none" }, 0);

      /*
       * The masthead collapses into the corner mark. Scaling from the top-left
       * is what carries it there, so there is only ever one wordmark. Once it
       * is small the header switches to difference blending, which is what
       * keeps it legible over both the dark hero and the light sections.
       */
      ScrollTrigger.create({
        trigger: ".cfp-hero",
        start: "top top",
        end: "+=60%",
        onEnter: () => {
          gsap.to(".cfp-wordmark", {
            scale: window.innerWidth <= 768 ? 0.4 : 0.2,
            duration: 0.6,
            ease: "power3",
          });
          gsap.to(".cfp-nav", { opacity: 1, duration: 0.6, ease: "power3" });
          gsap.set(".cfp-topbar", { mixBlendMode: "difference" });
        },
        onLeaveBack: () => {
          gsap.to(".cfp-wordmark", { scale: 1, duration: 0.6, ease: "power3" });
          gsap.to(".cfp-nav", { opacity: 0, duration: 0.4, ease: "power3" });
          gsap.set(".cfp-topbar", { mixBlendMode: "normal" });
        },
      });

      /* --- Cube warp: mark blurs out as the cube arrives from deep Z --- */
      const mark = root.querySelector<HTMLElement>(".cfp-mark");
      const cubeWrap = root.querySelector<HTMLElement>(".cfp-cube-wrap");
      const cube = root.querySelector<HTMLElement>(".cfp-cube");

      ScrollTrigger.create({
        trigger: ".cfp-warp",
        start: "top top",
        end: () => `+=${window.innerHeight * 4}`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          if (mark) {
            mark.style.filter = `blur(${lerp(0, 20, Math.min(p * 20, 1))}px)`;
            mark.style.opacity = String(
              1 - (p >= 0.02 ? Math.min((p - 0.02) * 100, 1) : 0),
            );
          }
          if (cubeWrap) {
            cubeWrap.style.opacity = String(
              p >= 0.01 ? Math.min((p - 0.01) * 100, 1) : 0,
            );
          }
          gsap.set(".cfp-cube-word", {
            opacity: Math.min(Math.max(0, (p - 0.25) * 2), 1),
          });

          if (!cube) return;
          const first = Math.min(p * 2, 1);
          const spin = lerp(0, 360, p >= 0.5 ? (p - 0.5) * 2 : 0);
          cube.style.top = `${lerp(CUBE_INITIAL.top, CUBE_FINAL.top, first)}%`;
          cube.style.left = `${lerp(CUBE_INITIAL.left, CUBE_FINAL.left, first)}%`;
          cube.style.transform = `
            translate3d(-50%, -50%, ${lerp(CUBE_INITIAL.z, CUBE_FINAL.z, first)}px)
            rotateX(${lerp(CUBE_INITIAL.rotateX, CUBE_FINAL.rotateX, first)}deg)
            rotateY(${lerp(CUBE_INITIAL.rotateY, CUBE_FINAL.rotateY, first) + spin}deg)
            rotateZ(${lerp(CUBE_INITIAL.rotateZ, CUBE_FINAL.rotateZ, first)}deg)
          `;
        },
      });

      /* --- Card fly-through over the oversized word --- */
      const cards = gsap.utils.toArray<HTMLElement>(".cfp-card");
      const driver = { p: 0 };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".cfp-fly",
            start: "top top",
            end: () => `+=${window.innerHeight * 4}`,
            pin: true,
            scrub: 1,
          },
        })
        .to(driver, {
          p: 1,
          ease: "none",
          onUpdate: () => {
            cards.forEach((card, i) => {
              const t = Math.max(0, Math.min((driver.p - i * 0.1125) * 2, 1));
              if (t <= 0) {
                gsap.set(card, { opacity: 0 });
                return;
              }
              const [yStops, rotStops] =
                CARD_KEYFRAMES[i % CARD_KEYFRAMES.length];
              const scaled = t * 3;
              const idx = Math.min(Math.floor(scaled), yStops.length - 2);
              const ratio = scaled - idx;
              gsap.set(card, {
                opacity: 1,
                xPercent: gsap.utils.interpolate(25, -650, t),
                yPercent: gsap.utils.interpolate(
                  yStops[idx],
                  yStops[idx + 1],
                  ratio,
                ),
                rotation: gsap.utils.interpolate(
                  rotStops[idx],
                  rotStops[idx + 1],
                  ratio,
                ),
              });
            });
          },
        });
      /* The persistent bottom line retires once the outro is reached. */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".cfp-outro",
            start: "top bottom",
            end: "+=400",
            scrub: 1,
          },
        })
        .to(".cfp-standfirst", { opacity: 0, ease: "power1.out" });
    }, root);

    /*
     * Draggable folders. Each remembers where it started, hit-tests the
     * back-to-top square at 50% overlap while moving (which swells the square
     * to 1.2 as feedback), and on a drop over it fires the callback and
     * springs home. Inertia makes a flick coast instead of stopping dead.
     */
    const egg = root.querySelector<HTMLElement>(".cfp-egg");
    const draggables = gsap.utils
      .toArray<HTMLElement>(".cfp-outro-wrap .cfp-folder")
      .map((folder) => {
        let isOverEgg = false;
        const swell = (over: boolean) => {
          if (egg)
            gsap.to(egg, {
              scale: over ? 1.2 : 1,
              duration: 0.2,
              overwrite: true,
            });
        };

        return Draggable.create(folder, {
          type: "x,y",
          bounds: ".cfp-outro-wrap",
          edgeResistance: 0.4,
          inertia: true,
          onDrag() {
            folder.classList.add("cfp-dragging");
            if (!egg) return;
            const over = this.hitTest(egg, "50%");
            if (over !== isOverEgg) {
              swell(over);
              isOverEgg = over;
            }
          },
          onDragEnd() {
            folder.classList.remove("cfp-dragging");
          },
          onRelease() {
            if (!egg) return;
            const dropped = this.hitTest(egg, "50%");
            swell(false);
            isOverEgg = false;
            if (!dropped) return;

            this.disable();
            dropRef.current?.(folder.dataset.label ?? "");
            gsap.to(folder, {
              x: 0,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
              onComplete: () => {
                this.enable();
                this.update();
              },
            });
          },
        })[0];
      });

    /*
     * Defer the first refresh past layout settling. A synchronous refresh here
     * measured pre-layout positions in the production bundle, where module
     * evaluation and first paint land in a different order than the dev server,
     * so every ScrollTrigger started at scroll 0 and the masthead collapsed into
     * the corner on load instead of on scroll. Two frames is enough for the
     * scroller height, the pinned sections, and the WebGL canvases to settle;
     * refreshing again on window load covers late layout shifts (fonts, images).
     */
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("load", onLoad);
      draggables.forEach((d) => d?.kill());
      ctx.revert();
      lenis.destroy();
      if (scroller) ScrollTrigger.defaults({ scroller: undefined });
    };
  }, [embedded]);

  return (
    <div className="cfp-root" data-embedded={embedded} ref={rootRef}>
      {/*
        One wordmark, not two. It is the giant masthead and the collapsed
        header mark: past the hero it scales to 0.2 from its top-left corner,
        which is what lands it in the corner at reading size.
      */}
      <header className="cfp-topbar">
        <h1 className="cfp-wordmark">
          <MixedType text={wordmark} />
        </h1>
        <nav className="cfp-nav">
          <span>
            <MixedType text={subline} />
          </span>
          <span>(Contact)</span>
          <span>(About)</span>
        </nav>
      </header>

      <p className="cfp-standfirst">
        {standfirst.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <div className="cfp-viewport" ref={viewportRef}>
        <div className="cfp-scroll">
          {/* Hero */}
          <section className="cfp-hero">
            <div className="cfp-hero-mid">
              <span className="cfp-hero-fade">(About)</span>
              <span className="cfp-hero-fade">{tagline}</span>
              <span className="cfp-hero-fade">(Contact)</span>
            </div>

            <div className="cfp-subline cfp-hero-fade">
              <MixedType text={subline} />
            </div>

            <div className="cfp-chrome">
              <div className="cfp-chrome-canvas" ref={sphereRef} />
            </div>
          </section>

          {/* Cube warp */}
          <section className="cfp-warp">
            {/* Title is a looping marquee at 0.1 opacity, not a static word. */}
            <div className="cfp-cube-word">
              <div className="cfp-cube-word-inner">
                <Marquee className="cfp-title-item" text={`${cubeWord} `} />
              </div>
            </div>
            <div className="cfp-mark">
              <span />
            </div>
            <div className="cfp-cube-wrap">
              <div className="cfp-cube">
                {/* A cube needs all six faces, so tints cycle when projects run short. */}
                {Array.from({ length: 6 }, (_, i) => {
                  const tint = projects[i % projects.length].tint;
                  return (
                    <div
                      className={`cfp-cube-face cfp-face-${i}`}
                      key={`face-${i}`}
                      style={{
                        background: `linear-gradient(160deg, ${tint[0]}, ${tint[1]})`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* Project fly-through */}
          <section className="cfp-fly">
            <p className="cfp-works-intro">
              {worksIntro.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>

            <div className="cfp-fly-word">{projectsWord}</div>

            <div className="cfp-cards">
              {projects.map((project) => (
                <article className="cfp-card" key={project.title}>
                  <div
                    className="cfp-card-media"
                    style={{
                      background: `linear-gradient(155deg, ${project.tint[0]}, ${project.tint[1]})`,
                    }}
                  />
                  <div className="cfp-card-body">
                    <h2>{project.title}</h2>
                    <div className="cfp-card-foot">
                      <p>{project.blurb}</p>
                      <span className="cfp-card-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Outro. Entering here retires the persistent bottom line. */}
          <footer className="cfp-outro">
            {/* Chrome carries the footer, so everything above it is soft-light. */}
            <div className="cfp-outro-chrome" ref={outroSphereRef} />

            <div className="cfp-outro-wrap">
              <h2 className="cfp-outro-txt">
                {outroHeading.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>

              <button className="cfp-top" type="button" onClick={scrollTop}>
                <span className="cfp-egg" aria-hidden="true">
                  {/* Slender long-shafted arrow, near-full height of the box. */}
                  <svg
                    viewBox="0 0 18 19"
                    width="18"
                    height="19"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 18.4V1M9 1 1 9M9 1l8 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Back to Top
              </button>

              <Folder label="Playlist" style={{ right: "22%", top: "26%" }} />
              <Folder label="CV" style={{ right: "25%", top: "46%" }} />

              <div className="cfp-footer-info">
                <div className="cfp-outro-word">{outroWord}</div>
                <div className="cfp-footer-info-txt">
                  {footerLinks.map((link) => (
                    <span key={link}>{link}</span>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.cfp-root {
  --cfp-black: #010101;
  --cfp-paper: #efefef;
  --cfp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
  --cfp-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --cfp-serif: "Times New Roman", Times, serif;

  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--cfp-black);
  color: var(--cfp-paper);
  font-family: var(--cfp-sans);
}

.cfp-root * { box-sizing: border-box; }

/* The scroller. Overlays are siblings of this, so they never scroll away. */
.cfp-viewport {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.cfp-root[data-embedded="true"] .cfp-viewport { overflow-y: auto; }

.cfp-scroll { position: relative; width: 100%; }

.cfp-root em {
  font-family: var(--cfp-serif);
  font-style: italic;
  font-weight: 400;
}

/* Sticky chrome */
.cfp-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  pointer-events: none;
}

/* Nav only earns its place once the masthead has collapsed. */
.cfp-nav {
  display: flex;
  flex: none;
  gap: clamp(1.5rem, 6vw, 5rem);
  padding-top: 0.4rem;
  opacity: 0;
  font-family: var(--cfp-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/**
 * Zero-height sticky box: pins to the bottom of the scrollport for the whole
 * page without taking part in layout, and works the same whether the scroller
 * is the container or the window (position:fixed would not).
 */
.cfp-standfirst {
  position: absolute;
  bottom: 1.75rem;
  left: 50%;
  translate: -50% 0;
  z-index: 40;
  margin: 0;
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  font-family: var(--cfp-mono);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
  mix-blend-mode: difference;
  pointer-events: none;
}

/* Hero */
.cfp-hero {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: var(--cfp-black);
}

/* Scaled from the top-left so collapsing lands it exactly in the corner. */
.cfp-wordmark {
  flex: none;
  margin: 0;
  transform-origin: 0% 0%;
  font-size: clamp(2rem, 9.4vw, 13rem);
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: -0.045em;
  white-space: nowrap;
}

.cfp-hero-mid {
  position: absolute;
  top: 45%;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
  font-family: var(--cfp-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cfp-subline {
  position: absolute;
  top: 72%;
  left: 50%;
  translate: -50% 0;
  z-index: 2;
  font-size: clamp(1.5rem, 4vw, 3.5rem);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.cfp-chrome {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 22%;
  z-index: 1;
  overflow: hidden;
}

.cfp-chrome-canvas { width: 100%; height: 100vh; }
.cfp-chrome-canvas canvas { display: block; width: 100% !important; height: 100% !important; }

/* Cube warp */
.cfp-warp {
  position: relative;
  height: 100vh;
  background: var(--cfp-paper);
  color: var(--cfp-black);
  overflow: hidden;
}

/* Marquee title: one 14vw line clipped to its own height. */
.cfp-cube-word {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  translate: 0 -50%;
  opacity: 0;
  pointer-events: none;
}

.cfp-cube-word-inner {
  width: 100%;
  height: 14vw;
  overflow: clip;
}

.cfp-title-item {
  font-family: var(--cfp-serif);
  font-style: italic;
  font-size: 14vw;
  line-height: 1;
  opacity: 0.1;
}

/* A 24px mark, deliberately small: the blur has to read as it dissolving. */
.cfp-mark {
  position: absolute;
  top: 55%;
  left: 50%;
  translate: -50% -50%;
  z-index: 2;
  width: 24px;
  height: 24px;
}

.cfp-mark span { display: block; width: 100%; height: 100%; background: var(--cfp-black); }

/*
 * Deep perspective is the whole effect: at 10000px the cube reads as arriving
 * from far away rather than unfolding flat. A tight perspective kills it.
 */
.cfp-cube-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform-style: preserve-3d;
  perspective: 10000px;
  pointer-events: none;
}

.cfp-cube {
  /* ponytail: calibrated to the reference's landed proportion (~30vw).
     The source's 60rem assumes its own perspective-origin; matching the
     number alone rendered ~2x too large here. */
  --cfp-cube-size: clamp(16rem, 30vw, 34rem);
  position: absolute;
  width: var(--cfp-cube-size);
  height: var(--cfp-cube-size);
  transform-style: preserve-3d;
}

/* Faces push out by half the cube edge, so they scale with --cfp-cube-size. */
.cfp-cube > div {
  position: absolute;
  width: var(--cfp-cube-size);
  height: var(--cfp-cube-size);
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.cfp-face-0 { transform: translateZ(calc(var(--cfp-cube-size) / 2)); }
.cfp-face-1 { transform: translateZ(calc(var(--cfp-cube-size) / -2)) rotateY(180deg); }
.cfp-face-2 { transform: rotateY(90deg) translateZ(calc(var(--cfp-cube-size) / 2)); }
.cfp-face-3 { transform: rotateY(-90deg) translateZ(calc(var(--cfp-cube-size) / 2)); }
.cfp-face-4 { transform: rotateX(90deg) translateZ(calc(var(--cfp-cube-size) / 2)); }
.cfp-face-5 { transform: rotateX(-90deg) translateZ(calc(var(--cfp-cube-size) / 2)); }

/* Marquee: track holds two copies, sliding exactly one copy width. */
.cfp-marquee { width: 100%; overflow: clip; }

.cfp-marquee-track {
  display: flex;
  width: fit-content;
  white-space: nowrap;
  animation: cfp-marquee linear infinite;
}

@keyframes cfp-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .cfp-marquee-track { animation: none; }
}

/* Fly-through */
.cfp-fly {
  position: relative;
  height: 100vh;
  background: var(--cfp-paper);
  color: var(--cfp-black);
  overflow: hidden;
}

.cfp-works-intro {
  position: absolute;
  top: 5.5rem;
  left: 50%;
  translate: -50% 0;
  z-index: 3;
  margin: 0;
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  font-family: var(--cfp-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
  white-space: nowrap;
}

.cfp-fly-word {
  position: absolute;
  top: 62%;
  left: 50%;
  translate: -50% -50%;
  font-size: clamp(6rem, 22vw, 22rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.05em;
  white-space: nowrap;
  pointer-events: none;
}

.cfp-cards { position: absolute; inset: 0; z-index: 2; }

/* Anchored high: the keyframes add up to ~50% of card height in yPercent. */
.cfp-card {
  position: absolute;
  top: 3%;
  right: 0;
  width: clamp(230px, 26vw, 380px);
  border-radius: 18px;
  overflow: hidden;
  background: var(--cfp-black);
  color: var(--cfp-paper);
  opacity: 0;
  will-change: transform;
}

.cfp-card-media { aspect-ratio: 4 / 3; width: 100%; }

.cfp-card-body { padding: 1.25rem 1.25rem 1rem; }

.cfp-card-body h2 {
  margin: 0 0 1.75rem;
  font-size: clamp(1.25rem, 2.2vw, 2rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.cfp-card-foot {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(239, 239, 239, 0.25);
}

.cfp-card-foot p {
  margin: 0;
  flex: 1;
  font-family: var(--cfp-mono);
  font-size: 0.6875rem;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  opacity: 0.65;
}

.cfp-card-arrow {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: rgba(239, 239, 239, 0.12);
  font-size: 0.8125rem;
}

/* Outro + footer: chrome carries it, everything above is soft-light. */
.cfp-outro {
  position: relative;
  width: 100%;
  height: 100vh;
  background: var(--cfp-black);
  color: var(--cfp-paper);
  overflow: hidden;
}

.cfp-outro-chrome { position: absolute; inset: 0; z-index: 0; }
.cfp-outro-chrome canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.cfp-outro-wrap {
  position: relative;
  z-index: 40;
  height: 100%;
  padding-top: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

/* Uppercase grotesque, not the masthead's mixed faces. */
.cfp-outro-txt {
  margin: 0;
  display: grid;
  justify-items: center;
  max-width: 60%;
  font-size: clamp(1.5rem, 3.4vw, 3rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-align: center;
  text-transform: uppercase;
  color: #2b2b2b;
}

.cfp-top {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--cfp-paper);
  cursor: pointer;
  font-family: var(--cfp-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.cfp-egg {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  border-radius: 4px;
  background-color: var(--cfp-black);
  color: var(--cfp-paper);
  transition: all 0.3s ease-out;
}

.cfp-top:hover .cfp-egg {
  background-color: var(--cfp-paper);
  color: var(--cfp-black);
}

.cfp-folder {
  position: absolute;
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: rgba(240, 240, 240, 0.5);
  cursor: grab;
  scale: 1;
  transition: scale 0.3s ease-out;
}

.cfp-folder:hover { scale: 0.9; }
.cfp-folder:active,
.cfp-folder.cfp-dragging { cursor: grabbing; scale: 0.95; }
.cfp-folder.cfp-dragging p { opacity: 1; }
.cfp-folder:hover p { opacity: 1; }
.cfp-folder svg { backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }

.cfp-folder p {
  margin: 0;
  padding: 2px 4px;
  border-radius: 2px;
  background-color: var(--cfp-black);
  color: var(--cfp-paper);
  font-family: var(--cfp-mono);
  font-size: 0.6875rem;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease-out;
}

.cfp-footer-info { width: 100%; }

/* Oversized word bled off the bottom edge. */
.cfp-outro-word {
  width: 100%;
  margin-bottom: -2vw;
  font-size: 15.5vw;
  line-height: 0.85;
  letter-spacing: -0.03em;
  text-align: center;
  white-space: nowrap;
  color: #1a1a1a;
  opacity: 0.85;
  pointer-events: none;
}

.cfp-footer-info-txt {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 2rem;
  font-family: var(--cfp-mono);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (max-width: 760px) {
  .cfp-nav span:not(:last-child) { display: none; }
  .cfp-hero-mid { font-size: 0.625rem; }
  .cfp-works-intro { font-size: 0.625rem; }
  .cfp-outro-txt { max-width: 80%; }
  .cfp-footer-info-txt { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .cfp-folder { display: none; }
  .cfp-cube { visibility: hidden; opacity: 0; }
}
`;

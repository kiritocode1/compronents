// @ts-nocheck
// biome-ignore-all lint: source-backed template port keeps source-shaped WebGL and GSAP code.

"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import {
  EffectComposer,
  EffectPass,
  GodRaysEffect,
  RenderPass,
} from "postprocessing";
import type * as React from "react";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { getDarkCatalogPageStyles } from "./styles";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const DEFAULT_ASSET_BASE = "https://ui.aryank.space/assets/dark-catalog-page";
const MOBILE_BREAKPOINT = 1000;
const ROUTES = [
  { path: "/", label: "Index" },
  { path: "/studio", label: "Studio" },
  { path: "/catalog", label: "Catalog" },
  { path: "/brief", label: "Brief" },
  { path: "/connect", label: "Connect" },
] as const;

const AssetContext = createContext(DEFAULT_ASSET_BASE);
const RouterContext = createContext({
  pathname: "/",
  navigate: (_path: string) => {},
});

function useAsset() {
  const base = useContext(AssetContext);
  return useCallback(
    (path: string) => `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    [base],
  );
}

function useRoute() {
  return useContext(RouterContext);
}

function getScrollParent(node: HTMLElement | null) {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(`${style.overflow}${style.overflowY}`)) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

function scrollToTop(scroller: HTMLElement | Window) {
  if (scroller === window) {
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }
  scroller.scrollTo({ top: 0, behavior: "instant" });
}

function ScrollerSetup({ rootRef }: { rootRef: React.RefObject<HTMLElement> }) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scroller = getScrollParent(root);
    ScrollTrigger.defaults({ scroller });
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.defaults({ scroller: undefined });
    };
  }, [rootRef]);

  return null;
}

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

function clearScrambleCharTimers(charEl: HTMLElement) {
  if (charEl.scrambleInterval) clearInterval(charEl.scrambleInterval);
  if (charEl.scrambleTimeout) clearTimeout(charEl.scrambleTimeout);
  if (charEl.staggerTimeout) clearTimeout(charEl.staggerTimeout);
  charEl.scrambleInterval = null;
  charEl.scrambleTimeout = null;
  charEl.staggerTimeout = null;
}

function scrambleText(
  elements: HTMLElement[],
  showAfter = true,
  duration = 0.15,
  charDelay = 50,
  stagger = 25,
  maxIterations = 5,
) {
  elements.forEach((charEl, index) => {
    clearScrambleCharTimers(charEl);
    charEl.staggerTimeout = window.setTimeout(() => {
      if (!charEl.dataset.originalText) {
        charEl.dataset.originalText = charEl.textContent ?? "";
      }
      const originalText = charEl.dataset.originalText;
      let iterations = 0;
      if (showAfter) gsap.set(charEl, { opacity: 1 });

      charEl.scrambleInterval = window.setInterval(() => {
        charEl.textContent =
          originalText === " "
            ? " "
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        iterations += 1;
        if (iterations >= maxIterations) {
          clearScrambleCharTimers(charEl);
          charEl.textContent = originalText;
          if (!showAfter) gsap.set(charEl, { opacity: 0 });
        }
      }, charDelay);

      charEl.scrambleTimeout = window.setTimeout(() => {
        clearScrambleCharTimers(charEl);
        charEl.textContent = originalText;
        if (!showAfter) gsap.set(charEl, { opacity: 0 });
      }, duration * 1000);
    }, index * stagger);
  });
}

function createScrambleSplit(element: HTMLElement) {
  if (!element || !element.textContent?.trim()) return null;
  const wordSplit = new SplitText(element, { type: "words" });
  const charSplits = wordSplit.words.map(
    (word) => new SplitText(word, { type: "chars" }),
  );
  const allChars = charSplits.flatMap((split) => split.chars);
  gsap.set(allChars, { opacity: 0 });
  return { wordSplit, charSplits, allChars, playTimeout: null };
}

function revertScrambleInstance(instance: any) {
  if (!instance) return;
  if (instance.playTimeout) clearTimeout(instance.playTimeout);
  instance.allChars?.forEach(clearScrambleCharTimers);
  instance.charSplits?.forEach((split: SplitText) => split?.revert());
  instance.wordSplit?.revert();
}

function playScrambleIn(instance: any, delay = 0) {
  if (!instance?.allChars?.length) return;
  instance.allChars.forEach(clearScrambleCharTimers);
  gsap.set(instance.allChars, { opacity: 0 });
  instance.playTimeout = window.setTimeout(() => {
    instance.playTimeout = null;
    scrambleText(instance.allChars);
  }, delay * 1000);
}

function scrambleIn(element: HTMLElement, delay = 0) {
  const instance = createScrambleSplit(element);
  playScrambleIn(instance, delay);
  return instance;
}

function scrambleVisible(element: HTMLElement) {
  if (!element || !element.textContent?.trim()) return null;
  const wordSplit = new SplitText(element, { type: "words" });
  const charSplits = wordSplit.words.map(
    (word) => new SplitText(word, { type: "chars" }),
  );
  const allChars = charSplits.flatMap((split) => split.chars);
  scrambleText(allChars, true, 0.1, 25, 10, 5);
  return { wordSplit, charSplits, allChars };
}

function Copy({
  children,
  variant = "slide",
  animateOnScroll = true,
  delay = 0,
  type = "lines",
  start = null,
}: {
  children: ReactNode;
  variant?: "slide" | "flicker";
  animateOnScroll?: boolean;
  delay?: number;
  type?: "lines" | "words";
  start?: string | null;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const splitsRef = useRef<SplitText[]>([]);
  const scrambleRef = useRef<any[]>([]);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;
      let active = true;

      async function build() {
        try {
          await document.fonts.ready;
        } catch {}
        if (!active) return;

        splitsRef.current.forEach((split) => split.revert());
        scrambleRef.current.forEach(revertScrambleInstance);
        splitsRef.current = [];
        scrambleRef.current = [];

        const targets = root.matches("h1,h2,h3,h4,h5,h6,p,a,span")
          ? [root]
          : Array.from(
              root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,a,span"),
            ).filter((el) => el.textContent?.trim());

        if (variant === "flicker") {
          scrambleRef.current = targets
            .map((target) => createScrambleSplit(target as HTMLElement))
            .filter(Boolean);
          const run = () =>
            scrambleRef.current.forEach((instance, index) =>
              playScrambleIn(instance, delay + index * 0.1),
            );
          if (animateOnScroll) {
            ScrollTrigger.create({
              trigger: root,
              start: start ?? "top 85%",
              once: true,
              onEnter: run,
            });
          } else {
            run();
          }
          return;
        }

        const units: HTMLElement[] = [];
        targets.forEach((target) => {
          const split = SplitText.create(target, {
            type,
            mask: type,
            ...(type === "words"
              ? { wordsClass: "word" }
              : { linesClass: "line", lineThreshold: 0.1 }),
          });
          splitsRef.current.push(split);
          units.push(...(type === "words" ? split.words : split.lines));
        });

        gsap.set(units, { yPercent: 110 });
        root.classList.add("copy-slide-ready");
        const tween = gsap.to(units, {
          yPercent: 0,
          duration: 0.75,
          ease: "power3.out",
          delay,
          stagger: 0.05,
          paused: animateOnScroll,
        });
        if (animateOnScroll) {
          ScrollTrigger.create({
            trigger: root,
            start: start ?? "top 80%",
            animation: tween,
            once: true,
          });
        }
      }

      build();

      return () => {
        active = false;
        splitsRef.current.forEach((split) => split.revert());
        scrambleRef.current.forEach(revertScrambleInstance);
      };
    },
    {
      scope: containerRef,
      dependencies: [variant, animateOnScroll, delay, type],
    },
  );

  if (
    typeof children === "object" &&
    children &&
    "type" in children &&
    "props" in children
  ) {
    return {
      ...children,
      props: { ...children.props, ref: containerRef },
    } as React.ReactElement;
  }

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}>{children}</div>
  );
}

let isInitialLoad = true;

function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);

  useEffect(
    () => () => {
      isInitialLoad = false;
    },
    [],
  );

  useGSAP(
    () => {
      const scope = preloaderRef.current;
      if (!scope || !showPreloader) return;

      const hero = {
        fluorescent: document.querySelector(".hero .fluorescent"),
        content: document.querySelector(".hero-content"),
        footer: document.querySelector(".hero-footer"),
        logo: document.querySelector(".hero-logo"),
      };
      gsap.set(Object.values(hero).filter(Boolean), { y: 300, force3D: true });

      const counter = scope.querySelector(".preloader-counter p");
      const counterTween = { value: 0 };
      const splits = [
        ...scope.querySelectorAll(
          ".preloader-copy-col p, .preloader-counter p",
        ),
      ].map((el) => SplitText.create(el, { type: "lines", mask: "lines" }));
      const lines = splits.flatMap((split) => split.lines);
      gsap.set(lines, { y: "100%" });

      const tl = gsap.timeline({
        onComplete: () => window.setTimeout(() => setShowPreloader(false), 100),
      });
      tl.to(lines, {
        y: "0%",
        duration: 1,
        stagger: 0.075,
        ease: "power3.out",
        delay: 0.8,
      })
        .to(
          counterTween,
          {
            value: 100,
            duration: 3,
            ease: "power2.out",
            onUpdate: () => {
              if (counter) {
                counter.textContent = Math.round(counterTween.value)
                  .toString()
                  .padStart(2, "0");
              }
            },
          },
          "<",
        )
        .to(
          scope.querySelector(".preloader-revealer"),
          { scale: 1, duration: 2.2, ease: "power3.out" },
          "<",
        )
        .to(scope, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1.25,
          ease: "power3.out",
        })
        .to(
          Object.values(hero).filter(Boolean),
          { y: 0, duration: 1.25, ease: "power3.out" },
          "-=1.15",
        );

      return () => {
        tl.kill();
        splits.forEach((split) => split.revert());
      };
    },
    { scope: preloaderRef, dependencies: [showPreloader] },
  );

  if (!showPreloader) return null;

  return (
    <div className="preloader" ref={preloaderRef}>
      <div className="preloader-revealer" />
      <div className="preloader-copy">
        <div className="preloader-copy-col">
          <p>
            Corridors shaped by surveillance, concrete, and mechanics that never
            reveal their full logic.
          </p>
        </div>
        <div className="preloader-copy-col">
          <p>
            Projects constructed to leave permanent residue where comfort used
            to be.
          </p>
        </div>
      </div>
      <div className="preloader-counter">
        <p>00</p>
      </div>
    </div>
  );
}

function Menu() {
  const { pathname, navigate } = useRoute();
  const asset = useAsset();
  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hamburgerTl = useRef<gsap.core.Timeline | null>(null);
  const isOpen = useRef(false);

  const close = useCallback(() => {
    if (!isOpen.current) return;
    isOpen.current = false;
    hamburgerTl.current?.reverse();
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      overlay.style.visibility = "hidden";
    }
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const spans = nav.querySelectorAll(".nav-toggler-hamburger span");
    hamburgerTl.current = gsap
      .timeline({ paused: true })
      .to(spans[0], { y: "0.19rem", rotation: 45, duration: 0.3 }, 0)
      .to(spans[1], { y: "-0.19rem", rotation: -45, duration: 0.3 }, 0);
    return () => hamburgerTl.current?.kill();
  }, []);

  const go = (event: React.MouseEvent, href: string) => {
    event.preventDefault();
    close();
    if (href !== pathname) navigate(href);
  };

  const toggle = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    if (isOpen.current) {
      close();
      return;
    }
    isOpen.current = true;
    hamburgerTl.current?.play();
    overlay.style.visibility = "visible";
    overlay.style.pointerEvents = "all";
    overlay.style.opacity = "1";
    overlay
      .querySelectorAll(".nav-item a, .nav-footer-item a")
      .forEach((link, index) => scrambleIn(link as HTMLElement, index * 0.08));
  };

  return (
    <>
      <nav ref={navRef} className="top">
        <div className="container">
          <div className="nav-container">
            <div className="nav-cta">
              <a
                href="/connect"
                className="btn"
                onClick={(e) => go(e, "/connect")}
              >
                <span className="mono">Connect</span>
              </a>
            </div>
            <div className="nav-logo">
              <a href="/" onClick={(e) => go(e, "/")}>
                <img src={asset("logo.png")} alt="Deadlock Studios" />
              </a>
            </div>
            <div className="nav-toggler">
              <button className="btn" type="button" onClick={toggle}>
                <p className="mono">Menu</p>
                <div className="nav-toggler-hamburger">
                  <span />
                  <span />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="nav-overlay" ref={overlayRef}>
        <div className="nav-items">
          <div className="nav-overlay-logo">
            <img src={asset("logo.png")} alt="Deadlock Studios" />
          </div>
          {ROUTES.map((route) => (
            <div
              className={`nav-item${pathname === route.path ? " active" : ""}`}
              key={route.path}
            >
              <a href={route.path} onClick={(e) => go(e, route.path)}>
                {route.label}
              </a>
            </div>
          ))}
        </div>
        <div className="nav-footer">
          <div className="container">
            <div className="nav-footer-container">
              <div className="nav-footer-item">
                <a
                  className="mono"
                  href="https://www.instagram.com/aryankspace/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Feed
                </a>
                <a
                  className="mono"
                  href="https://aryank.space"
                  target="_blank"
                  rel="noreferrer"
                >
                  Channel
                </a>
              </div>
              <div className="nav-footer-item">
                <a
                  className="mono"
                  href="/connect"
                  onClick={(e) => go(e, "/connect")}
                >
                  Get In Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const FLUORESCENT_VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FLUORESCENT_FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  float tanh_f(float x){ float e2x = exp(2.0 * x); return (e2x - 1.0) / (e2x + 1.0); }
  vec4 tanh_v4(vec4 x){ return vec4(tanh_f(x.x), tanh_f(x.y), tanh_f(x.z), tanh_f(x.w)); }
  void main(){
    vec4 O = vec4(0.0);
    float aspect = u_resolution.x / u_resolution.y;
    vec2 I = aspect < 1.0 ? vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y) : gl_FragCoord.xy;
    float t = u_time;
    float z = 0.0;
    float b = 0.0;
    float l = 0.0;
    float yOffset = aspect < 1.0 ? (1.0 - aspect) * 1.75 : 0.0;
    vec2 shifted = vec2(I.x, I.y - yOffset * u_resolution.y);
    float mn = min(u_resolution.x, u_resolution.y);
    for(int j = 0; j < 40; j++){
      vec3 rayDir = normalize(vec3((2.0 * shifted - u_resolution) / mn, -1.0));
      vec3 p = z * rayDir;
      p.yz *= 0.1 * mat2(8.0, -6.0, 6.0, 8.0);
      p.z += 80.0;
      l = length(p) * 0.1;
      z += 1.0 + abs(l - 1.2);
      l += 1.0;
      b = dot(cos(p / l - t), sin(p / l * 2.5 + t).yzx);
      O += (1.0 + cos(tanh_f(l - 7.0) * 6.0 - vec4(3.5, 3.0, 4.2, 0.0))) * b * b * b * b / z;
    }
    O = tanh_v4(O / 2.0);
    float luminance = dot(O.rgb, vec3(0.299, 0.587, 0.114));
    float bright = luminance * 1.4;
    O.rgb = vec3(bright * 0.15, bright * 0.9, bright * 0.1);
    float gray = dot(O.rgb, vec3(0.299, 0.587, 0.114));
    O.rgb = mix(vec3(gray), O.rgb, 0.2);
    gl_FragColor = vec4(O.rgb, 1.0);
  }
`;

function Fluorescent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, FLUORESCENT_VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FLUORESCENT_FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    const pos = gl.getAttribLocation(program, "a_position");
    const res = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const start = performance.now();
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr * 0.35));
      canvas.height = Math.max(1, Math.round(rect.height * dpr * 0.35));
    };

    const render = () => {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.enableVertexAttribArray(pos);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(res, canvas.width, canvas.height);
      gl.uniform1f(time, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return <canvas ref={canvasRef} className="fluorescent" />;
}

const LOGO_PATH_D = `M2000 563.794C2000 650.027 1939.76 729.216 1835.67 794.923C1691.87 990.83 1371.47 1127.59 999.939 1127.59C628.53 1127.59 308.131 990.83 164.329 794.923C60.2417 729.216 0 650.027 0 563.794C0 477.561 60.2417 398.372 164.329 332.665C308.131 136.758 628.53 0 999.939 0C1371.47 0 1691.87 136.758 1835.67 332.665C1939.76 398.372 2000 477.561 2000 563.794ZM83.4396 563.794C83.4396 508.046 96.9209 454.242 121.576 403.352C64.3709 452.177 32.1855 506.467 32.1855 563.794C32.1855 621.121 64.3709 675.411 121.576 724.236C96.9209 673.346 83.4396 619.542 83.4396 563.794ZM242.424 289.913C424.485 202.708 693.994 148.297 999.939 148.297C1306.01 148.297 1575.51 202.708 1757.58 289.913C1602.6 135.665 1321.07 32.3067 999.939 32.3067C678.934 32.3067 397.401 135.665 242.424 289.913ZM348.94 547.398H836.218C875.205 547.398 913.949 534.038 941.641 506.589C942.046 506.184 942.41 505.82 942.734 505.496C970.183 477.804 983.543 439.06 983.543 400.073V326.107C983.543 245.339 915.164 180.968 834.639 186.555C624.886 200.765 438.088 241.817 297.686 300.601C296.714 301.006 295.702 301.411 294.65 301.816C168.094 356.47 211.089 547.398 348.94 547.398ZM294.65 825.773C295.702 826.178 296.714 826.583 297.686 826.987C438.088 885.772 624.886 926.823 834.639 941.155C915.164 946.621 983.543 882.249 983.543 801.603V727.516C983.543 688.529 970.183 649.785 942.734 622.093C942.41 621.769 942.046 621.445 941.641 621.121C914.071 593.551 875.205 580.312 836.218 580.312H348.94C211.089 580.312 168.094 771.239 294.65 825.773ZM1757.58 837.675C1575.51 924.88 1306.01 979.292 999.939 979.292C693.994 979.292 424.485 924.88 242.424 837.675C397.401 991.923 678.934 1095.28 999.939 1095.28C1321.07 1095.28 1602.6 991.923 1757.58 837.675ZM1651.06 580.312H1163.78C1124.79 580.312 1085.93 593.551 1058.24 621.121C1057.91 621.445 1057.59 621.769 1057.27 622.093C1029.82 649.785 1016.46 688.529 1016.46 727.516V801.603C1016.46 882.249 1084.84 946.621 1165.36 941.155C1375.11 926.823 1561.91 885.772 1702.31 826.987C1703.29 826.583 1704.3 826.178 1705.35 825.773C1831.91 771.239 1788.91 580.312 1651.06 580.312ZM1705.35 301.816C1704.3 301.411 1703.29 301.006 1702.31 300.601C1561.91 241.817 1375.11 200.765 1165.36 186.555C1084.84 180.968 1016.46 245.339 1016.46 326.107V400.073C1016.46 439.06 1029.82 477.804 1057.27 505.496C1057.59 505.82 1057.95 506.184 1058.36 506.589C1085.93 534.038 1124.79 547.398 1163.78 547.398H1651.06C1788.91 547.398 1831.91 356.47 1705.35 301.816ZM1967.81 563.794C1967.81 506.467 1935.63 452.177 1878.42 403.352C1903.08 454.242 1916.56 508.046 1916.56 563.794C1916.56 619.542 1903.08 673.346 1878.42 724.236C1935.63 675.411 1967.81 621.121 1967.81 563.794Z`;
const LOGO_SVG_W = 2000;
const LOGO_SVG_H = 1128;

function parseSvgPath(d: string, steps = 24) {
  const subpaths: number[][][] = [];
  let pts: number[][] = [];
  let cx = 0;
  let cy = 0;
  const tokens =
    d.match(/[MmCcHhVvZz]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g) ?? [];
  let i = 0;
  const num = () => Number.parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === "M") {
      cx = num();
      cy = num();
      pts.push([cx, cy]);
    } else if (cmd === "C") {
      while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
        const x1 = num();
        const y1 = num();
        const x2 = num();
        const y2 = num();
        const x = num();
        const y = num();
        for (let t = 1; t <= steps; t++) {
          const u = t / steps;
          const v = 1 - u;
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
    } else if (cmd === "H") {
      cx = num();
      pts.push([cx, cy]);
    } else if (cmd === "V") {
      cy = num();
      pts.push([cx, cy]);
    } else if (cmd === "Z") {
      subpaths.push(pts);
      pts = [];
    }
  }
  return subpaths;
}

const LOGO_SUBPATHS = parseSvgPath(LOGO_PATH_D);

function buildLogoOccluder() {
  const logoScale = 10;
  const scaleW = logoScale * (LOGO_SVG_W / LOGO_SVG_H);
  const toVec2 = (subpath: number[][]) =>
    subpath.map(
      ([x, y]) =>
        new THREE.Vector2(
          (x / LOGO_SVG_W - 0.5) * scaleW,
          -(y / LOGO_SVG_H - 0.5) * logoScale - 2,
        ),
    );
  const shape = new THREE.Shape([
    new THREE.Vector2(-100, 100),
    new THREE.Vector2(100, 100),
    new THREE.Vector2(100, -100),
    new THREE.Vector2(-100, -100),
  ]);
  shape.holes.push(new THREE.Path(toVec2(LOGO_SUBPATHS[0])));
  const group = new THREE.Group();
  group.add(
    new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({ color: 0x0b0b0b }),
    ),
  );
  LOGO_SUBPATHS.slice(1).forEach((subpath) => {
    const mesh = new THREE.Mesh(
      new THREE.ShapeGeometry(new THREE.Shape(toVec2(subpath))),
      new THREE.MeshBasicMaterial({ color: 0x080808 }),
    );
    mesh.position.z = 0.1;
    group.add(mesh);
  });
  return group;
}

function BlindingLight() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!stage || !section) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);
    camera.position.set(0, 0, 20);
    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      stencil: false,
      depth: false,
    });
    stage.replaceChildren(renderer.domElement);

    const logo = buildLogoOccluder();
    scene.add(logo);
    const light = new THREE.Mesh(
      new THREE.CircleGeometry(50, 64),
      new THREE.MeshBasicMaterial({ color: 0xedebe7 }),
    );
    light.position.set(0, -5, -10);
    scene.add(light);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const rays = new GodRaysEffect(camera, light, {
      height: 720,
      kernelSize: 2,
      density: 0.9,
      decay: 0.9,
      weight: 0,
      exposure: 0,
      samples: 40,
      clampMax: 0.5,
    });
    composer.addPass(new EffectPass(camera, rays));

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      const scale = Math.min(w, h) / 900;
      logo.scale.setScalar(scale);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      composer.setSize(w, h);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=300%",
      pin: true,
      scrub: 1.5,
      onUpdate: (self) => {
        const buildP = Math.min(self.progress / 0.25, 1);
        const dropP = Math.max(0, Math.min((self.progress - 0.25) / 0.5, 1));
        const fadeP = Math.max(0, (self.progress - 0.75) / 0.25);
        const intensity = buildP * (1 - fadeP);
        light.position.y = -5 + 10 * dropP;
        if (rays.godRaysMaterial.uniforms.exposure) {
          rays.godRaysMaterial.uniforms.exposure.value = 0.125 * intensity;
        }
        if (rays.godRaysMaterial.uniforms.weight) {
          rays.godRaysMaterial.uniforms.weight.value = 0.15 * intensity;
        }
      },
    });
    renderer.setAnimationLoop((time) => {
      light.position.x = Math.cos(time * 0.0007) * 0.8;
      composer.render();
    });

    return () => {
      trigger.kill();
      observer.disconnect();
      renderer.setAnimationLoop(null);
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return (
    <section className="blinding-light" ref={sectionRef}>
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
      <div className="blinding-light-stage" ref={stageRef} />
    </section>
  );
}

const FEATURED_SLIDES = [
  {
    title: "Room 14B",
    image: "featured-work/featured-work-1.jpg",
    url: "/brief",
  },
  {
    title: "Subject Identified",
    image: "featured-work/featured-work-2.jpg",
    url: "/brief",
  },
  {
    title: "Dossier 09",
    image: "featured-work/featured-work-3.jpg",
    url: "/brief",
  },
  {
    title: "Stairwell C7",
    image: "featured-work/featured-work-4.jpg",
    url: "/brief",
  },
];

function FeaturedProjects() {
  const asset = useAsset();
  const { navigate } = useRoute();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const images = imagesRef.current;
    const title = titleRef.current;
    if (!section || !images || !title) return;
    const layers = Array.from(images.querySelectorAll(".fp-img"));
    gsap.set(layers.slice(1), { autoAlpha: 0, scale: 1.2 });
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=3200",
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const index = Math.min(
          FEATURED_SLIDES.length - 1,
          Math.floor(self.progress * FEATURED_SLIDES.length),
        );
        layers.forEach((layer, i) => {
          gsap.to(layer, {
            autoAlpha: i === index ? 1 : 0,
            scale: i === index ? 1 : 1.18,
            duration: 0.35,
            overwrite: true,
          });
        });
        title.textContent = FEATURED_SLIDES[index].title;
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <section className="fp-sticky-slider" ref={sectionRef}>
      <div className="fp-slide-images" ref={imagesRef}>
        {FEATURED_SLIDES.map((slide, index) => (
          <div className="fp-img" id={`fp-img-${index + 1}`} key={slide.title}>
            <img src={asset(slide.image)} alt={slide.title} />
          </div>
        ))}
      </div>
      <div className="fp-slide-info">
        <div className="container">
          <div className="fp-slide-title-prefix">
            <p>Featured</p>
          </div>
          <div className="fp-slide-title">
            <p id="fp-title-text" ref={titleRef}>
              {FEATURED_SLIDES[0].title}
            </p>
          </div>
          <div className="fp-slide-link">
            <a
              href="/brief"
              onClick={(event) => {
                event.preventDefault();
                navigate("/brief");
              }}
            >
              Explore
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const TEAM = [
  ["Kai Tanaka", "Creative Director", "team/team-1.jpg"],
  ["Lena Voss", "Lead Sound Designer", "team/team-2.jpg"],
  ["Erik Holm", "Systems Architect", "team/team-3.jpg"],
  ["Mara Chen", "Art Director", "team/team-4.jpg"],
  ["Sol Rieve", "Narrative Designer", "team/team-5.jpg"],
];

function Team() {
  const asset = useAsset();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current;
    if (!section || !cards.length) return;
    const totalCards = cards.length;
    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;
    const positionCards = (progress = 0) => {
      const radius =
        window.innerWidth < 900
          ? window.innerWidth * 7.5
          : window.innerWidth * 2.5;
      const cardSpacing = 0.15;
      const initialOffset = -cardSpacing * (totalCards - 1);
      const arcProgress = initialOffset + progress * (1 - initialOffset);
      cards.forEach((card, i) => {
        const cardProgress = (totalCards - 1 - i) * cardSpacing + arcProgress;
        const angle = startAngle + arcAngle * cardProgress;
        gsap.set(card, {
          x: Math.cos(angle) * radius,
          y: -Math.sin(angle) * radius + radius,
          rotation: -((angle - Math.PI / 2) * (180 / Math.PI)),
        });
      });
    };
    positionCards();
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${window.innerHeight * 7}px`,
      pin: true,
      scrub: true,
      onUpdate: (self) => positionCards(self.progress),
    });
    return () => trigger.kill();
  }, []);

  return (
    <section className="team" ref={sectionRef}>
      <div className="team-header">
        <Copy variant="flicker">
          <p className="mono">The Collective</p>
        </Copy>
        <Copy>
          <h5 className="type-2">Behind The Lock</h5>
        </Copy>
      </div>
      <div className="team-footer">
        <div className="container">
          <p className="mono">Roster Verified</p>
          <p className="mono">Defectors: None</p>
        </div>
      </div>
      <div className="cards">
        {TEAM.map(([name, role, image], index) => (
          <div
            className="card"
            key={name}
            ref={(el) => {
              if (el) cardsRef.current[index] = el;
            }}
          >
            <div className="card-img">
              <img src={asset(image)} alt={name} />
            </div>
            <div className="card-content">
              <p className="lg">{name}</p>
              <p className="mono">{role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;
    const vertex = `attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.,1.);}`;
    const fragment = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f); return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y); }
      void main(){
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float n = 0.0;
        float amp = 0.5;
        vec2 p = uv * vec2(2.0, 1.0) + vec2(0.0, -u_time * 0.03);
        for(int i=0;i<5;i++){ n += noise(p) * amp; p *= 2.02; amp *= 0.5; }
        float plume = smoothstep(0.78, 0.16, distance(uv, vec2(0.5, 0.42))) * n;
        vec3 col = mix(vec3(0.043), vec3(0.78), plume * 0.72);
        gl_FragColor = vec4(col, 1.0);
      }
    `;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex);
    const fs = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    const pos = gl.getAttribLocation(program, "a_position");
    const time = gl.getUniformLocation(program, "u_time");
    const res = gl.getUniformLocation(program, "u_resolution");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const start = performance.now();
    let raf = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.enableVertexAttribArray(pos);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(time, (performance.now() - start) / 1000);
      gl.uniform2f(res, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <footer className="smoke-footer">
      <canvas ref={canvasRef} />
      <div className="footer-content">
        <div className="container">
          <div className="footer-heading">
            <p className="mono">Establish Contact</p>
            <h2 className="type-2">
              Let's Make Something They Can't Walk Away From
            </h2>
          </div>
        </div>
      </div>
      <div className="footer-bar">
        <div className="container">
          <div className="footer-bar-left">
            <p className="mono">&copy; 2025 Deadlock Inc.</p>
          </div>
          <div className="footer-bar-right">
            <p className="mono">Developed By BLANK</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function HomePage() {
  const asset = useAsset();
  return (
    <>
      <Preloader />
      <section className="hero">
        <Fluorescent />
        <div className="hero-content">
          <Copy animateOnScroll={false} delay={isInitialLoad ? 4.85 : 0.75}>
            <div className="container">
              <p>Worlds Without Exit</p>
              <p>Games Without Mercy</p>
            </div>
          </Copy>
        </div>
        <div className="hero-footer">
          <div className="container">
            <Copy animateOnScroll={false} delay={isInitialLoad ? 4.85 : 0.75}>
              <p>
                Deadlock Studios builds games that blur the line between tension
                and obsession, one system at a time.
              </p>
            </Copy>
          </div>
        </div>
        <div className="hero-logo">
          <img src={asset("logo-type.png")} alt="Deadlock Studios" />
        </div>
      </section>
      <BlindingLight />
      <section className="about">
        <Copy variant="flicker">
          <p className="mono">The Manifesto</p>
        </Copy>
        <div className="about-copy">
          <Copy>
            <div className="container">
              <h6 className="type-2">
                Deadlock Studios was founded on a single conviction: games
                should leave marks. Not the kind you forget after credits roll,
                but the kind that sit in your chest days later. We design worlds
                rooted in tension, silence, and consequence.
              </h6>
              <h6 className="type-2">
                Our work draws from surveillance culture, brutalist
                architecture, and the quiet horror of systems you cannot see but
                know are watching.
              </h6>
            </div>
          </Copy>
        </div>
      </section>
      <FeaturedProjects />
      <Team />
      <Footer />
    </>
  );
}

const CATALOG_SLIDES = [
  {
    title: "Room 14B",
    description:
      "A sealed interrogation chamber with a single terminal still running. No one remembers who was last assigned here.",
    type: "Environment",
    field: "Psychological Horror",
    date: "2025",
    image: "catalog/catalog-1.jpg",
  },
  {
    title: "Subject Identified",
    description:
      "Surveillance feed captures a figure on a stairwell landing. Facial recognition flags positive. The file says otherwise.",
    type: "Sequence",
    field: "Stealth Thriller",
    date: "2024",
    image: "catalog/catalog-2.jpg",
  },
  {
    title: "Dossier 09",
    description:
      "Recovered case file with redacted identity, crossed out fingerprints, and coordinates that lead to a location that no longer exists.",
    type: "Narrative",
    field: "Investigation",
    date: "2025",
    image: "catalog/catalog-3.jpg",
  },
  {
    title: "Stairwell C7",
    description:
      "A concrete underpass with failing fluorescents and a silhouette that has not moved in fourteen minutes of footage.",
    type: "Environment",
    field: "Atmospheric Tension",
    date: "2024",
    image: "catalog/catalog-4.jpg",
  },
];

function CatalogPage() {
  const asset = useAsset();
  const { navigate } = useRoute();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 1;
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    const textures = CATALOG_SLIDES.map((slide) =>
      loader.load(asset(slide.image), (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
      }),
    );
    let raf = 0;
    const render = () => {
      const rect = section.getBoundingClientRect();
      renderer.setSize(section.clientWidth, section.clientHeight, false);
      camera.aspect = section.clientWidth / section.clientHeight;
      camera.updateProjectionMatrix();
      material.map = textures[active];
      material.needsUpdate = true;
      mesh.rotation.z = Math.sin(performance.now() * 0.0003) * 0.01;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      textures.forEach((texture) => texture.dispose());
    };
  }, [asset, active]);

  const slide = CATALOG_SLIDES[active];

  return (
    <section
      className="catalog-slider"
      ref={sectionRef}
      onClick={() =>
        setActive((current) => (current + 1) % CATALOG_SLIDES.length)
      }
    >
      <canvas className="catalog-canvas" ref={canvasRef} />
      <div className="catalog-slider-content">
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
              <a
                href="/brief"
                className="mono"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  navigate("/brief");
                }}
              >
                [ View Full Brief ]
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="catalog-slider-footer">
        <div className="container">
          <p className="mono sm">Selected Catalog</p>
          <p className="mono sm">[ Click Through ]</p>
        </div>
      </div>
    </section>
  );
}

function BriefPage() {
  const asset = useAsset();
  return (
    <>
      <section className="brief-hero">
        <div className="brief-hero-header">
          <Copy animateOnScroll={false} delay={0.65}>
            <h2 className="type-2">Subject Identified</h2>
          </Copy>
        </div>
      </section>
      <section className="brief-banner-img">
        <div className="brief-banner-img-wrapper">
          <img src={asset("brief/brief-img-1.jpg")} alt="Subject feed" />
        </div>
      </section>
      <section className="brief-overview">
        <div className="brief-overview-header">
          <div className="container">
            <Copy>
              <h2 className="type-2">
                A face in the feed that changes everything
              </h2>
            </Copy>
            <Copy variant="flicker">
              <p className="mono">2022 - 2025</p>
            </Copy>
          </div>
        </div>
        <div className="brief-overview-content">
          <div className="container">
            <div className="brief-overview-content-col">
              <Copy variant="flicker">
                <p className="mono">Project Brief</p>
              </Copy>
            </div>
            <div className="brief-overview-content-col">
              <Copy>
                <h5 className="type-2">
                  Subject Identified is a stealth thriller built around a
                  fractured surveillance network and one unresolved case file.
                  Every identification triggers a chain of events that cannot be
                  undone.
                </h5>
              </Copy>
              <Copy variant="flicker">
                <p className="mono">View Trailer</p>
              </Copy>
            </div>
          </div>
        </div>
      </section>
      <section className="brief-images">
        <div className="brief-images-container">
          <div className="container">
            {[2, 3, 4].map((n) => (
              <div className="brief-img" key={n}>
                <img
                  src={asset(`brief/brief-img-${n}.jpg`)}
                  alt={`Brief ${n}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="next-brief">
        <div className="next-brief-header">
          <Copy variant="flicker">
            <p className="mono">Next Project</p>
          </Copy>
          <Copy>
            <h2 className="type-2">Dossier 09</h2>
          </Copy>
        </div>
      </section>
      <Footer />
    </>
  );
}

function Spiral({ images, heading }: { images: string[]; heading: string }) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const lenis = new Lenis({
      autoRaf: true,
      wrapper: getScrollParent(section),
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 12;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    section.appendChild(renderer.domElement);
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    const textures = images.map((src) => loader.load(src));
    const group = new THREE.Group();
    scene.add(group);
    const total = 60;
    for (let i = 0; i < total; i++) {
      const texture = textures[i % textures.length];
      texture.colorSpace = THREE.SRGBColorSpace;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 1.2, 8, 2),
        new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
      );
      const angle = i * ((Math.PI * 2) / 15);
      const radius = 5 - (i / total) * 1.5;
      mesh.position.set(
        Math.sin(angle) * radius,
        -i * 0.16,
        Math.cos(angle) * radius,
      );
      mesh.lookAt(0, mesh.position.y, 0);
      group.add(mesh);
    }
    let scrollY = 0;
    const onScroll = (event: any) => {
      scrollY = event.scroll ?? 0;
    };
    lenis.on("scroll", onScroll);
    let raf = 0;
    const resize = () => {
      renderer.setSize(section.clientWidth, section.clientHeight);
      camera.aspect = section.clientWidth / section.clientHeight;
      camera.updateProjectionMatrix();
    };
    const animate = () => {
      resize();
      camera.position.y +=
        (-(scrollY / window.innerHeight) * 1.8 - camera.position.y) * 0.08;
      group.rotation.y += 0.002;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      renderer.dispose();
      textures.forEach((texture) => texture.dispose());
      section.removeChild(renderer.domElement);
    };
  }, [images]);

  return (
    <section className="studio-hero" ref={sectionRef}>
      <div className="studio-hero-header">
        <div className="container">
          <Copy animateOnScroll={false} delay={0.65}>
            <h1 className="type-2">{heading}</h1>
          </Copy>
        </div>
      </div>
    </section>
  );
}

function AnimeText({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const words = Array.from(section.querySelectorAll(".at-word"));
    const trigger = ScrollTrigger.create({
      trigger: section,
      pin: section,
      start: "top top",
      end: `+=${window.innerHeight * 4}`,
      onUpdate: (self) => {
        words.forEach((word, index) => {
          const p = Math.min(
            1,
            Math.max(0, self.progress * 1.25 - index / words.length),
          );
          (word as HTMLElement).style.opacity = String(p);
        });
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <section className="at-container" ref={ref}>
      <div className="at-inner">
        <div className="at-text">
          <div className="container">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>
                {paragraph.split(/\s+/).map((word, index) => (
                  <span className="at-word" key={`${word}-${index}`}>
                    <span>{word}</span>
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const ACCORDION_ITEMS = [
  [
    "01",
    "Tension Over Reward",
    "Comfort is the enemy of memorable design.",
    "accordion/accordion-1.jpg",
  ],
  [
    "02",
    "Atmosphere First",
    "Every project begins with a feeling, not a feature list.",
    "accordion/accordion-2.jpg",
  ],
  [
    "03",
    "Invisible Systems",
    "The game watches you as much as you watch it.",
    "accordion/accordion-3.jpg",
  ],
  [
    "04",
    "Restraint as Language",
    "We say more by showing less.",
    "accordion/accordion-4.jpg",
  ],
];

function Accordion() {
  const asset = useAsset();
  const [active, setActive] = useState(1);
  return (
    <section className="accordion">
      <div className="accordion-header">
        <p className="mono">Design Pillars</p>
        <h6 className="type-2">Four principles that guide every build</h6>
      </div>
      <div className="accordion-panels">
        <div className="container">
          {ACCORDION_ITEMS.map(([id, title, description, image], index) => (
            <div
              key={id}
              className="accordion-panel"
              onMouseEnter={() => setActive(index)}
              style={{ flexGrow: active === index ? 52 : 16 }}
            >
              <img
                className="accordion-panel-img"
                src={asset(image)}
                alt={title}
              />
              <div className="accordion-panel-overlay" />
              <div className="accordion-panel-content">
                <span className="accordion-panel-number mono">{id}</span>
                <p className="accordion-panel-title">{title}</p>
              </div>
              <div className="accordion-panel-desc-wrap">
                <p className="accordion-panel-desc mono">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudioPage() {
  const asset = useAsset();
  const spiralImages = Array.from({ length: 19 }, (_, i) =>
    asset(`spiral/spiral-${i + 1}.jpg`),
  );
  return (
    <>
      <Spiral
        images={spiralImages}
        heading="We exist in the space where control breaks down and something else takes over"
      />
      <AnimeText
        paragraphs={[
          "Deadlock Studios is a design-led game studio that operates at the edge of comfort.",
          "Every project ships only when the player feels watched from the first frame and never fully shakes it after the last.",
        ]}
      />
      <Accordion />
      <Team />
      <Footer />
    </>
  );
}

function TrailContainer() {
  const asset = useAsset();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    if (!container || window.innerWidth <= MOBILE_BREAKPOINT) return;
    const images = Array.from({ length: 19 }, (_, i) =>
      asset(`trail-images/trail-${i + 1}.jpg`),
    );
    let index = 0;
    let last = { x: 0, y: 0 };
    const onMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const distance = Math.hypot(
        event.clientX - last.x,
        event.clientY - last.y,
      );
      if (distance < 150) return;
      last = { x: event.clientX, y: event.clientY };
      const img = document.createElement("div");
      img.className = "trail-img";
      img.style.left = `${event.clientX - rect.left - 87.5}px`;
      img.style.top = `${event.clientY - rect.top - 87.5}px`;
      img.style.backgroundImage = `url(${images[index % images.length]})`;
      index += 1;
      container.appendChild(img);
      requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.clipPath = "inset(0 0 0 0)";
      });
      window.setTimeout(() => img.remove(), 1100);
    };
    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, [asset]);
  return <div ref={ref} className="trail-container" />;
}

function ConnectPage() {
  return (
    <section className="contact-page">
      <TrailContainer />
      <div className="contact-copy">
        <div className="contact-copy-main">
          <Copy animateOnScroll={false} delay={0.65}>
            <div className="contact-col-copy">
              <h6 className="contact-header type-2">Deadlock Studios</h6>
              <h6 className="type-2">Tokyo / Berlin</h6>
              <h6 className="type-2">Unit 09, Bunker Lane</h6>
              <h6 className="type-2">52.5200 / 13.4050</h6>
              <h6 className="type-2">DE-7X01</h6>
            </div>
            <div className="contact-col-copy">
              <h6 className="type-2">Open a channel</h6>
              <h6 className="type-2">signal@deadlockstudios.com</h6>
              <h6 className="type-2">Instagram / YouTube / X</h6>
              <h6 className="type-2">+(49) 301 708 0091</h6>
            </div>
          </Copy>
        </div>
        <div className="contact-copy-footer">
          <Copy animateOnScroll={false} variant="flicker" delay={1}>
            <div className="container">
              <p className="mono">&copy; 2025 Deadlock Inc.</p>
              <p className="mono">Developed by BLANK</p>
            </div>
          </Copy>
        </div>
      </div>
    </section>
  );
}

function TransitionGrid({ active }: { active: boolean }) {
  return (
    <div className={`transition-grid${active ? " is-blocking" : ""}`}>
      {[0, 1].map((row) => (
        <div className={`transition-row row-${row + 1}`} key={row}>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              className="transition-block"
              key={index}
              style={{ transform: `scaleY(${active ? 1 : 0})` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export interface DarkCatalogPageProps {
  assetBase?: string;
  initialPath?: "/" | "/studio" | "/catalog" | "/brief" | "/connect";
  className?: string;
  style?: CSSProperties;
}

export default function DarkCatalogPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className,
  style,
}: DarkCatalogPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [pathname, setPathname] = useState(initialPath);
  const [transitioning, setTransitioning] = useState(false);
  const styles = useMemo(
    () => getDarkCatalogPageStyles(assetBase),
    [assetBase],
  );

  const navigate = useCallback((path: string) => {
    const root = rootRef.current;
    const scroller = getScrollParent(root);
    setTransitioning(true);
    window.setTimeout(() => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      setPathname(path as typeof initialPath);
      scrollToTop(scroller);
      window.setTimeout(() => {
        setTransitioning(false);
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }, 120);
    }, 450);
  }, []);

  const page = {
    "/": <HomePage />,
    "/studio": <StudioPage />,
    "/catalog": <CatalogPage />,
    "/brief": <BriefPage />,
    "/connect": <ConnectPage />,
  }[pathname] ?? <HomePage />;

  return (
    <AssetContext.Provider value={assetBase}>
      <RouterContext.Provider value={{ pathname, navigate }}>
        <main
          ref={rootRef}
          className={["dark-catalog-page", className].filter(Boolean).join(" ")}
          style={style}
        >
          <style dangerouslySetInnerHTML={{ __html: styles }} />
          <ScrollerSetup rootRef={rootRef} />
          <div className="page">
            <Menu />
            <TransitionGrid active={transitioning} />
            <div className="page-wrapper">{page}</div>
          </div>
        </main>
      </RouterContext.Provider>
    </AssetContext.Provider>
  );
}

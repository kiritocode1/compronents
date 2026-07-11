"use client";

/**
 * Film Studio Page - source-backed Negative Films website template.
 *
 * A faithful React port of the vanilla-JS Negative Films site: the full routed
 * experience (index, work, culture, directors, contact, sample film) with its
 * project-grid Preloader, scramble nav menu, Three.js pixelated-video hero,
 * html2canvas pixelated-text, lens-distortion work slider, expanding spotlight
 * gallery, Lenis smooth scroll, ukiyojs parallax, split-image scroll, and a
 * clip-path page transition. Imagery, video, and fonts are served from Blob.
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import html2canvas from "html2canvas";
import { useLenis } from "lenis/react";
import {
  type CSSProperties,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import Ukiyo from "ukiyojs";
import { getFilmStudioPageStyles } from "./styles";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);
if (!CustomEase.get?.("filmHop")) {
  try {
    CustomEase.create("filmHop", "0.9, 0, 0.1, 1");
  } catch {
    /* already created */
  }
}

const DEFAULT_ASSET_BASE = "https://ui.aryank.space/assets/film-studio-page";
const MOBILE = 1000;

/* ---------------------------------------------------------------- asset ctx */

const ASSET_CONTEXT = createContext(DEFAULT_ASSET_BASE);

function useAsset() {
  const base = useContext(ASSET_CONTEXT);
  return useCallback(
    (path: string) => `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    [base],
  );
}

/* ------------------------------------------------------------------- router */

export const FILM_STUDIO_PAGE_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/work", label: "Work" },
  { path: "/culture", label: "Culture" },
  { path: "/directors", label: "Directors" },
  { path: "/contact", label: "Contact" },
  { path: "/film", label: "Film" },
] as const;

type RoutePath = (typeof FILM_STUDIO_PAGE_ROUTES)[number]["path"];
const ROUTE_PATHS = FILM_STUDIO_PAGE_ROUTES.map((r) => r.path) as string[];

interface RouterValue {
  pathname: string;
  navigate: (to: string) => void;
}
const RouterContext = createContext<RouterValue>({
  pathname: "/",
  navigate: () => {},
});
const useRouter = () => useContext(RouterContext);

/* ------------------------------------------------------------------ shaders */

const LENS_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LENS_FRAGMENT = `
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float uProgress;
  uniform vec2 uResolution;
  uniform vec2 uTexture1Size;
  uniform vec2 uTexture2Size;
  varying vec2 vUv;
  vec2 getCoverUV(vec2 uv, vec2 textureSize) {
    vec2 s = uResolution / textureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    return (uv * uResolution - offset) / scaledSize;
  }
  vec2 getDistortedUv(vec2 uv, vec2 direction, float factor) {
    vec2 scaledDirection = direction;
    scaledDirection.y *= 2.0;
    return uv - scaledDirection * factor;
  }
  struct LensDistortion { vec2 distortedUV; float inside; };
  LensDistortion getLensDistortion(vec2 p, vec2 uv, vec2 sphereCenter, float sphereRadius, float focusFactor) {
    vec2 distortionDirection = normalize(p - sphereCenter);
    float focusRadius = sphereRadius * focusFactor;
    float focusStrength = sphereRadius / 3000.0;
    float focusSdf = length(sphereCenter - p) - focusRadius;
    float sphereSdf = length(sphereCenter - p) - sphereRadius;
    float inside = smoothstep(0.0, 1.0, -sphereSdf / (sphereRadius * 0.001));
    float magnifierFactor = focusSdf / (sphereRadius - focusRadius);
    float mFactor = clamp(magnifierFactor * inside, 0.0, 1.0);
    mFactor = pow(mFactor, 5.0);
    float distortionFactor = mFactor * focusStrength;
    vec2 distortedUV = getDistortedUv(uv, distortionDirection, distortionFactor);
    return LensDistortion(distortedUV, inside);
  }
  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 p = vUv * uResolution;
    vec2 uv1 = getCoverUV(vUv, uTexture1Size);
    vec2 uv2 = getCoverUV(vUv, uTexture2Size);
    float maxRadius = length(uResolution) * 1.5;
    float bubbleRadius = uProgress * maxRadius;
    vec2 sphereCenter = center * uResolution;
    float focusFactor = 0.25;
    float dist = length(sphereCenter - p);
    float mask = step(bubbleRadius, dist);
    vec4 currentImg = texture2D(uTexture1, uv1);
    LensDistortion distortion = getLensDistortion(p, uv2, sphereCenter, bubbleRadius, focusFactor);
    vec4 newImg = texture2D(uTexture2, distortion.distortedUV);
    float finalMask = max(mask, 1.0 - distortion.inside);
    vec4 color = mix(newImg, currentImg, finalMask);
    gl_FragColor = color;
  }
`;

const PIXEL_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

const PIXEL_FRAGMENT = `
  uniform sampler2D uDataTexture;
  uniform sampler2D uTexture;
  varying vec2 vUv;
  void main() {
    vec4 offset = texture2D(uDataTexture, vUv);
    gl_FragColor = texture2D(uTexture, vUv - 0.02 * offset.rg);
  }`;

/* --------------------------------------------------------------------- data */

const directorsData = [
  {
    name: "Nikolai Dreyer",
    previewImg: "directors/director-1.jpg",
    route: "/film",
  },
  {
    name: "Elena Marceau",
    previewImg: "directors/director-2.jpg",
    route: "/film",
  },
  {
    name: "Tomas Calderón",
    previewImg: "directors/director-3.jpg",
    route: "/film",
  },
  {
    name: "Ingrid Falk",
    previewImg: "directors/director-4.jpg",
    route: "/film",
  },
  {
    name: "Marco Varela",
    previewImg: "directors/director-5.jpg",
    route: "/film",
  },
  {
    name: "Anselm Roth",
    previewImg: "directors/director-6.jpg",
    route: "/film",
  },
  {
    name: "Sofia Iversen",
    previewImg: "directors/director-7.jpg",
    route: "/film",
  },
  {
    name: "Rafael Nunes",
    previewImg: "directors/director-8.jpg",
    route: "/film",
  },
  {
    name: "Johan Vester",
    previewImg: "directors/director-9.jpg",
    route: "/film",
  },
  {
    name: "Clara Bex",
    previewImg: "directors/director-10.jpg",
    route: "/film",
  },
];

const servicesData = [
  {
    name: "Camera Work",
    img: "spotlight/spotlight-1.jpg",
    indicatorText: "[ Framing ]",
  },
  {
    name: "Visual Direction",
    img: "spotlight/spotlight-2.jpg",
    indicatorText: "[ Vision ]",
  },
  {
    name: "Sound Design",
    img: "spotlight/spotlight-3.jpg",
    indicatorText: "[ Resonance ]",
  },
  {
    name: "Film Editing",
    img: "spotlight/spotlight-4.jpg",
    indicatorText: "[ Sequence ]",
  },
];

const slidesData = [
  {
    title: "Gilded Noise",
    description:
      "Heat, gold, and the sharp glint of teeth caught in a half-lit confession.",
    type: "Still",
    field: "Cinematic",
    date: "2025",
    image: "work/work-1.jpg",
    route: "/film",
  },
  {
    title: "White Rush",
    description:
      "Motion buried in snow. A body pressed against speed, swallowed by cold silence.",
    type: "Sequence",
    field: "Documentary",
    date: "2023",
    image: "work/work-2.jpg",
    route: "/film",
  },
  {
    title: "Copper Skin",
    description:
      "Sweat, shadow, and the texture of closeness sculpted by unrelenting light.",
    type: "Portrait",
    field: "Experimental",
    date: "2024",
    image: "work/work-3.jpg",
    route: "/film",
  },
  {
    title: "Ash Tide",
    description:
      "A slow drift through ruin, where every frame settles like falling ash.",
    type: "Sequence",
    field: "Cinematic",
    date: "2022",
    image: "work/work-4.jpg",
    route: "/film",
  },
];

const preloaderProjects = [
  {
    name: "Lunar Eclipse",
    director: "Amelia Crawford",
    location: "Toronto, ON",
  },
  {
    name: "Visitor Quarters",
    director: "Marcus Reynolds",
    location: "Vancouver Studio, BC",
  },
  { name: "Celestial", director: "Nina Liu // Weston", location: "Austin, TX" },
  {
    name: "Streamwave Original",
    director: "Dylan Pierce",
    location: "Sunset Studios - Miami",
  },
  {
    name: "Viewfinder",
    director: "Javier // Rodriguez",
    location: "BLANK Studios - Chicago",
  },
  {
    name: "Rhythm Collective",
    director: "Sophia // Chen",
    location: "London, UK",
  },
  {
    name: "Urban Odyssey",
    director: "Leo Thompson",
    location: "Pioneer Studios - Seattle",
  },
  {
    name: "Prism No. 1",
    director: "Taylor // McKnight",
    location: "Private Estate - Sedona",
  },
  {
    name: "Vision Quest",
    director: "Spencer // Hudson",
    location: "Elevation - Denver",
  },
  {
    name: "Wavelength",
    director: "Kai Nakamura",
    location: "San Francisco, CA",
  },
  { name: "Desert Horizon", director: "Olivia", location: "New Mexico" },
  {
    name: "Spectrum",
    director: "Ellis // Moss",
    location: "Harmony Studio - Montreal",
  },
  {
    name: "Vision Quest II",
    director: "Hudson // Wright",
    location: "Elevation Studios - Denver",
  },
  { name: "Auteur", director: "Leo Thompson", location: "Berlin, DE" },
  {
    name: "Capsule X Design",
    director: "Sophia // Chen",
    location: "Neon House - Brooklyn",
  },
  {
    name: "Pulse",
    director: "Callum // Winters",
    location: "Echo Pavilion - Portland",
  },
];

const cultureGridLayout = [
  [0, null, 1, null],
  [null, 2, null, null],
  [3, null, null, 4],
  [null, 5, 6, null],
  [7, null, null, 8],
  [null, null, 9, null],
  [null, 10, null, 11],
  [12, null, 13, null],
  [null, 14, null, null],
  [15, null, null, 16],
];
const cultureOrigins = [
  "right",
  "left",
  "left",
  "right",
  "left",
  "left",
  "right",
  "left",
  "left",
  "left",
  "left",
  "left",
  "right",
  "left",
  "left",
  "right",
  "left",
];

/* --------------------------------------------------------------- scramble */

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
const SCRAMBLE_DURATION = 0.25;
const SCRAMBLE_STAGGER = 50;

type CharEl = HTMLElement & {
  scrambleInterval?: ReturnType<typeof setInterval> | null;
  scrambleTimeout?: ReturnType<typeof setTimeout> | null;
  staggerTimeout?: ReturnType<typeof setTimeout> | null;
  dataset: DOMStringMap;
};

function scrambleChar(
  char: CharEl,
  showAfter = true,
  duration = SCRAMBLE_DURATION,
  charDelay = 50,
  maxIterations: number | null = null,
) {
  if (!char.dataset.originalText)
    char.dataset.originalText = char.textContent ?? "";
  const originalText = char.dataset.originalText;
  let iterations = 0;
  const iterationsCount = maxIterations || Math.floor(Math.random() * 6) + 3;
  if (showAfter) gsap.set(char, { opacity: 1 });
  if (char.scrambleInterval) clearInterval(char.scrambleInterval);
  if (char.scrambleTimeout) clearTimeout(char.scrambleTimeout);
  const interval = setInterval(() => {
    char.textContent =
      originalText === " "
        ? " "
        : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    iterations++;
    if (iterations >= iterationsCount) {
      clearInterval(interval);
      char.scrambleInterval = null;
      char.textContent = originalText;
      if (!showAfter) gsap.set(char, { opacity: 0 });
    }
  }, charDelay);
  char.scrambleInterval = interval;
  const timeout = setTimeout(() => {
    clearInterval(interval);
    char.scrambleInterval = null;
    char.scrambleTimeout = null;
    char.textContent = originalText;
    if (!showAfter) gsap.set(char, { opacity: 0 });
  }, duration * 1000);
  char.scrambleTimeout = timeout;
}

function scrambleText(
  elements: CharEl[],
  showAfter = true,
  duration = SCRAMBLE_DURATION,
  charDelay = 50,
  stagger = SCRAMBLE_STAGGER,
  skipChars = 0,
  maxIterations: number | null = null,
) {
  elements.forEach((char, index) => {
    if (index < skipChars) {
      if (showAfter) gsap.set(char, { opacity: 1 });
      return;
    }
    if (char.staggerTimeout) clearTimeout(char.staggerTimeout);
    const staggerTimeout = setTimeout(
      () => {
        scrambleChar(char, showAfter, duration, charDelay, maxIterations);
        char.staggerTimeout = null;
      },
      (index - skipChars) * stagger,
    );
    char.staggerTimeout = staggerTimeout;
  });
}

interface ScrambleOptions {
  duration?: number;
  charDelay?: number;
  stagger?: number;
  skipChars?: number;
  maxIterations?: number | null;
}
interface ScrambleInstance {
  wordSplit: SplitText;
  charSplits: SplitText[];
  allChars: CharEl[];
}

function splitToChars(element: HTMLElement): {
  wordSplit: SplitText;
  charSplits: SplitText[];
  allChars: CharEl[];
} {
  const wordSplit = new SplitText(element, { type: "words" });
  const charSplits = wordSplit.words.map(
    (word) => new SplitText(word as HTMLElement, { type: "chars" }),
  );
  const allChars: CharEl[] = [];
  charSplits.forEach((split) => allChars.push(...(split.chars as CharEl[])));
  return { wordSplit, charSplits, allChars };
}

function scrambleIn(
  element: HTMLElement,
  delay = 0,
  options: ScrambleOptions = {},
): ScrambleInstance | undefined {
  if (!element.textContent?.trim()) return;
  const {
    duration = SCRAMBLE_DURATION,
    charDelay = 50,
    stagger = SCRAMBLE_STAGGER,
    skipChars = 0,
    maxIterations = null,
  } = options;
  const { wordSplit, charSplits, allChars } = splitToChars(element);
  gsap.set(allChars, { opacity: 0 });
  setTimeout(
    () =>
      scrambleText(
        allChars,
        true,
        duration,
        charDelay,
        stagger,
        skipChars,
        maxIterations,
      ),
    delay * 1000,
  );
  return { wordSplit, charSplits, allChars };
}

function scrambleOut(element: HTMLElement, delay = 0) {
  const chars = element.querySelectorAll(".char span");
  if (chars.length === 0) return;
  gsap.set(chars, { opacity: 1 });
  setTimeout(
    () => scrambleText([...chars].reverse() as CharEl[], false),
    delay * 1000,
  );
}

function scrambleVisible(
  element: HTMLElement,
  delay = 0,
  options: ScrambleOptions = {},
): ScrambleInstance | undefined {
  if (!element.textContent?.trim()) return;
  const {
    duration = SCRAMBLE_DURATION,
    charDelay = 50,
    stagger = SCRAMBLE_STAGGER,
    skipChars = 0,
    maxIterations = null,
  } = options;
  const { wordSplit, charSplits, allChars } = splitToChars(element);
  gsap.set(allChars, { opacity: 1 });
  setTimeout(
    () =>
      scrambleText(
        allChars,
        true,
        duration,
        charDelay,
        stagger,
        skipChars,
        maxIterations,
      ),
    delay * 1000,
  );
  return { wordSplit, charSplits, allChars };
}

/* scramble hover on .scramble-hover links (hover.js) */
function useScrambleHover() {
  useEffect(() => {
    if (window.innerWidth < MOBILE) return;
    const links = document.querySelectorAll<HTMLElement>("a.scramble-hover");
    const cleanups: (() => void)[] = [];
    links.forEach((link) => {
      if (link.dataset.hasHoverEffect) return;
      link.dataset.hasHoverEffect = "true";
      let isAnimating = false;
      let currentSplit: ScrambleInstance | undefined;
      if (!link.dataset.originalColor)
        link.dataset.originalColor = getComputedStyle(link).color;
      const enter = () => {
        if (isAnimating) return;
        isAnimating = true;
        currentSplit?.wordSplit?.revert();
        currentSplit = scrambleVisible(link, 0, {
          duration: 0.1,
          charDelay: 25,
          stagger: 10,
          maxIterations: 5,
        });
        setTimeout(() => {
          isAnimating = false;
        }, 250);
      };
      const leave = () => {
        link.style.color = link.dataset.originalColor || "";
      };
      link.addEventListener("mouseenter", enter);
      link.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        link.removeEventListener("mouseenter", enter);
        link.removeEventListener("mouseleave", leave);
        delete link.dataset.hasHoverEffect;
        currentSplit?.wordSplit?.revert();
      });
    });
    return () => cleanups.forEach((c) => c());
  }, []);
}

/* ------------------------------------------------------------- shared JSX */

function Nav() {
  const { pathname, navigate } = useRouter();
  const lenis = useLenis();
  const isMenuOpen = useRef(false);
  const isAnimating = useRef(false);
  const scrambleInstances = useRef<(ScrambleInstance | undefined)[]>([]);

  const link = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  useEffect(() => {
    if (isMenuOpen.current) forceClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function cleanupScrambles() {
    scrambleInstances.current.forEach((i) => i?.wordSplit?.revert());
    scrambleInstances.current = [];
  }
  function resetText() {
    document
      .querySelectorAll<HTMLElement>(".nav-item a, .nav-footer-item a")
      .forEach((l) => {
        l.style.color = l.dataset.originalColor || "";
        const chars = l.querySelectorAll(".char span");
        if (chars.length > 0) l.innerHTML = l.textContent ?? "";
      });
  }
  function open() {
    const overlay = document.querySelector<HTMLElement>(".nav-overlay");
    const btn = document.querySelector<HTMLElement>(".menu-toggle-btn");
    const navItems = document.querySelectorAll<HTMLElement>(".nav-item");
    if (!overlay || !btn) return;
    isAnimating.current = true;
    overlay.style.pointerEvents = "all";
    btn.classList.add("menu-open");
    lenis?.stop();
    gsap.to(overlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.3,
      onComplete: () => {
        isAnimating.current = false;
      },
    });
    cleanupScrambles();
    resetText();
    navItems.forEach((item, index) => {
      const a = item.querySelector<HTMLElement>("a");
      if (a) {
        gsap.set(item, { opacity: 1, transform: "translateY(0%)" });
        scrambleInstances.current.push(
          scrambleIn(a, index * 0.1, {
            duration: 0.15,
            charDelay: 50,
            stagger: 25,
            maxIterations: 5,
          }),
        );
      }
    });
    let fi = 0;
    document.querySelectorAll(".nav-footer-item").forEach((footerItem) => {
      footerItem.querySelectorAll<HTMLElement>("a").forEach((a) => {
        scrambleInstances.current.push(
          scrambleIn(a, navItems.length * 0.1 + fi * 0.1, {
            duration: 0.15,
            charDelay: 50,
            stagger: 25,
            maxIterations: 5,
          }),
        );
        fi++;
      });
    });
    isMenuOpen.current = true;
  }
  function close() {
    const overlay = document.querySelector<HTMLElement>(".nav-overlay");
    const btn = document.querySelector<HTMLElement>(".menu-toggle-btn");
    const navItems = document.querySelectorAll<HTMLElement>(".nav-item");
    if (!overlay || !btn) return;
    isAnimating.current = true;
    overlay.style.pointerEvents = "none";
    btn.classList.remove("menu-open");
    lenis?.start();
    navItems.forEach((item, index) => {
      const a = item.querySelector<HTMLElement>("a");
      if (a) scrambleOut(a, index * 0.1);
    });
    let fi = 0;
    document.querySelectorAll(".nav-footer-item").forEach((footerItem) => {
      footerItem.querySelectorAll<HTMLElement>("a").forEach((a) => {
        scrambleOut(a, navItems.length * 0.1 + fi * 0.1);
        fi++;
      });
    });
    gsap.to(overlay, {
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
      duration: 0.3,
      onComplete: () => {
        gsap.set(navItems, { opacity: 0, transform: "translateY(100%)" });
        isAnimating.current = false;
      },
    });
    isMenuOpen.current = false;
  }
  function forceClose() {
    const overlay = document.querySelector<HTMLElement>(".nav-overlay");
    const btn = document.querySelector<HTMLElement>(".menu-toggle-btn");
    overlay?.style.setProperty("pointer-events", "none");
    btn?.classList.remove("menu-open");
    gsap.set(".nav-overlay", {
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    });
    gsap.set(".nav-item", { opacity: 0, transform: "translateY(100%)" });
    lenis?.start();
    isMenuOpen.current = false;
    isAnimating.current = false;
  }
  function toggle() {
    if (isAnimating.current) return;
    if (!isMenuOpen.current) open();
    else close();
  }

  return (
    <>
      <nav>
        <div className="container">
          <div className="logo">
            <div className="logo-container">
              <a href="/" onClick={link("/")}>
                <span></span>Negative
              </a>
            </div>
          </div>
          <div className="menu-toggle-btn" onClick={toggle}>
            <div className="menu-toggle-btn-wrapper">
              <p>Menu</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="nav-overlay">
        <div className="nav-items">
          {FILM_STUDIO_PAGE_ROUTES.filter((r) => r.path !== "/film").map(
            (r) => (
              <div
                className={`nav-item ${pathname === r.path ? "active" : ""}`}
                key={r.path}
              >
                <a href={r.path} onClick={link(r.path)}>
                  {r.label}
                </a>
              </div>
            ),
          )}
        </div>
        <div className="nav-footer">
          <div className="container">
            <div className="nav-footer-item">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
              >
                YouTube
              </a>
            </div>
            <div className="nav-footer-item">
              <a href="/contact" onClick={link("/contact")}>
                [ &nbsp;Drop a line &nbsp; ]
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Footer() {
  const { navigate } = useRouter();
  const link = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };
  return (
    <footer>
      <div className="footer-row form">
        <div className="container">
          <div className="footer-name">
            <h3>Negative</h3>
            <h3>Films</h3>
          </div>
          <div className="footer-form-copy">
            <p>A living record of projects, people, and process.</p>
          </div>
          <div className="footer-input">
            <input type="text" placeholder="Enter your email" />
          </div>
          <div className="footer-submit-btn">
            <a
              href="/contact"
              className="scramble-hover"
              onClick={link("/contact")}
            >
              [ &nbsp;Start Exchange&nbsp; ]
            </a>
          </div>
        </div>
      </div>
      <div className="footer-row meta">
        <div className="container">
          <div className="footer-meta-row">
            <div className="meta-info">
              <p>Get in touch</p>
              <p>inquiry@negativefilms.com</p>
            </div>
            <div className="meta-info">
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                className="scramble-hover"
              >
                YouTube
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="scramble-hover"
              >
                Instagram
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                className="scramble-hover"
              >
                Twitter
              </a>
              <a
                href="https://vimeo.com/"
                target="_blank"
                rel="noreferrer"
                className="scramble-hover"
              >
                Vimeo
              </a>
            </div>
            <div className="meta-info">
              <a
                href="/culture"
                className="scramble-hover"
                onClick={link("/culture")}
              >
                Culture
              </a>
              <a
                href="/directors"
                className="scramble-hover"
                onClick={link("/directors")}
              >
                Directors
              </a>
            </div>
            <div className="meta-info">
              <a
                href="/work"
                className="scramble-hover"
                onClick={link("/work")}
              >
                Projects
              </a>
            </div>
          </div>
          <div className="footer-meta-row">
            <p>Developed by BLANK</p>
            <p>All Rights Reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------- pixelation fx */

/** Three.js data-texture mouse-distortion effect shared by video hero + text. */
function usePixelDistortion(
  containerSel: string,
  getTexture: () => Promise<{
    texture: THREE.Texture;
    onFrame?: () => void;
  } | null>,
  opts: { alpha?: boolean; zIndex?: number } = {},
) {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(containerSel);
    if (!container || window.innerWidth < MOBILE) return;
    let destroyed = false;
    let raf = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let dataTexture: THREE.DataTexture | null = null;
    let baseTexture: THREE.Texture | null = null;
    let onFrame: (() => void) | undefined;
    const settings = {
      grid: 25,
      mouse: 0.25,
      strength: 0.1,
      relaxation: 0.925,
    };
    const mouse = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
    let width = container.offsetWidth;
    let height = container.offsetHeight;

    function makeGrid() {
      const size = settings.grid;
      const data = new Float32Array(size * size * 4);
      for (let i = 3; i < data.length; i += 4) data[i] = 255;
      dataTexture = new THREE.DataTexture(
        data,
        size,
        size,
        THREE.RGBAFormat,
        THREE.FloatType,
      );
      dataTexture.magFilter = dataTexture.minFilter = THREE.NearestFilter;
      dataTexture.needsUpdate = true;
      if (material) material.uniforms.uDataTexture.value = dataTexture;
    }
    function updateData() {
      if (!dataTexture) return;
      const data = dataTexture.image.data as Float32Array;
      const size = settings.grid;
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= settings.relaxation;
        data[i + 1] *= settings.relaxation;
      }
      if (Math.abs(mouse.vX) < 0.001 && Math.abs(mouse.vY) < 0.001) {
        mouse.vX *= 0.9;
        mouse.vY *= 0.9;
        dataTexture.needsUpdate = true;
        return;
      }
      const gridMouseX = size * mouse.x;
      const gridMouseY = size * (1 - mouse.y);
      const maxDist = size * settings.mouse;
      const maxDistSq = maxDist * maxDist;
      const aspect = height / width;
      const strengthFactor = settings.strength * 100;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distance =
            (gridMouseX - i) ** 2 / aspect + (gridMouseY - j) ** 2;
          if (distance < maxDistSq) {
            const index = 4 * (i + size * j);
            const power = Math.min(10, maxDist / Math.sqrt(distance));
            data[index] += strengthFactor * mouse.vX * power;
            data[index + 1] -= strengthFactor * mouse.vY * power;
          }
        }
      }
      mouse.vX *= 0.9;
      mouse.vY *= 0.9;
      dataTexture.needsUpdate = true;
    }
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const newX = (e.clientX - rect.left) / rect.width;
      const newY = (e.clientY - rect.top) / rect.height;
      mouse.vX = newX - mouse.prevX;
      mouse.vY = newY - mouse.prevY;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = newX;
      mouse.y = newY;
    };

    (async () => {
      const result = await getTexture();
      if (destroyed || !result) return;
      baseTexture = result.texture;
      onFrame = result.onFrame;
      width = container.offsetWidth;
      height = container.offsetHeight;
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
      camera.position.z = 1;
      makeGrid();
      material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          uTexture: { value: baseTexture },
          uDataTexture: { value: dataTexture },
        },
        vertexShader: PIXEL_VERTEX,
        fragmentShader: PIXEL_FRAGMENT,
        side: THREE.DoubleSide,
        transparent: Boolean(opts.alpha),
      });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: Boolean(opts.alpha),
      });
      renderer.setClearColor(0x000000, opts.alpha ? 0 : 1);
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const canvas = renderer.domElement;
      canvas.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:auto;z-index:${opts.zIndex ?? 0}`;
      container.appendChild(canvas);
      container.addEventListener("mousemove", onMove);
      const loop = () => {
        if (destroyed || !renderer || !material) return;
        updateData();
        onFrame?.();
        material.uniforms.time.value += 0.05;
        try {
          renderer.render(scene, camera);
        } catch {
          // Tainted texture (cross-origin media without CORS): stop the effect
          // and fall back to the plain source element instead of crashing.
          destroyed = true;
          renderer.domElement.remove();
          const media = container.querySelector<HTMLElement>(
            ".hero-video, .pixelated-text h1",
          );
          if (media) media.style.opacity = "1";
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      loop();
    })();

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", onMove);
      renderer?.domElement.remove();
      renderer?.dispose();
      material?.dispose();
      dataTexture?.dispose();
      baseTexture?.dispose();
    };
  }, [containerSel, getTexture, opts.alpha, opts.zIndex]);
}

/** pixelated video hero (pixelated-video.js) */
function usePixelatedVideo(active: boolean) {
  const getTexture = useCallback(async () => {
    const video = document.querySelector<HTMLVideoElement>(".hero-video");
    if (!video) return null;
    await new Promise<void>((r) =>
      video.readyState >= 2
        ? r()
        : video.addEventListener("loadeddata", () => r(), { once: true }),
    );
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    video.style.opacity = "0";
    return {
      texture,
      onFrame: () => {
        texture.needsUpdate = true;
      },
    };
  }, []);
  usePixelDistortion(active ? ".hero" : "__none__", getTexture, {
    alpha: false,
    zIndex: 0,
  });
}

/** pixelated text (pixelated-text.js) via html2canvas capture */
function usePixelatedText(active: boolean) {
  const getTexture = useCallback(async () => {
    const container = document.querySelector<HTMLElement>(".pixelated-text");
    const el = document.querySelector<HTMLElement>(".pixelated-text h1");
    if (!container || !el) return null;
    el.style.opacity = "1";
    await new Promise((r) => setTimeout(r, 50));
    let source: HTMLCanvasElement;
    try {
      source = await html2canvas(el, {
        backgroundColor: null,
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        allowTaint: true,
        width: el.offsetWidth,
        height: el.offsetHeight,
        logging: false,
        imageTimeout: 0,
      });
    } catch {
      source = document.createElement("canvas");
    }
    el.style.opacity = "0";
    const dpr = window.devicePixelRatio || 2;
    const full = document.createElement("canvas");
    const ctx = full.getContext("2d");
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    full.width = w * dpr;
    full.height = h * dpr;
    if (ctx) {
      ctx.scale(dpr, dpr);
      const r1 = el.getBoundingClientRect();
      const r2 = container.getBoundingClientRect();
      ctx.drawImage(
        source,
        r1.left - r2.left,
        r1.top - r2.top,
        source.width / dpr,
        source.height / dpr,
      );
    }
    const texture = new THREE.CanvasTexture(full);
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return { texture };
  }, []);
  usePixelDistortion(active ? ".pixelated-text" : "__none__", getTexture, {
    alpha: true,
    zIndex: 2,
  });
}

/* ---------------------------------------------------------------- Preloader */

let preloaderSeen = false;

function Preloader({ onDone }: { onDone: () => void }) {
  const asset = useAsset();
  const lenis = useLenis();
  const [visible, setVisible] = useState(!preloaderSeen);

  useGSAP(
    () => {
      if (preloaderSeen) {
        onDone();
        return;
      }
      lenis?.stop();
      const overlayTl = gsap.timeline();
      const imagesTl = gsap.timeline();
      overlayTl.to(".fs-logo-line-1", {
        backgroundPosition: "0% 0%",
        color: "#e3e4d8",
        duration: 1,
        ease: "none",
        delay: 0.5,
        onComplete: () =>
          gsap.to(".fs-logo-line-2", {
            backgroundPosition: "0% 0%",
            color: "#e3e4d8",
            duration: 1,
            ease: "none",
          }),
      });
      overlayTl.to([".projects-header", ".project-item"], {
        opacity: 1,
        duration: 0.05,
        stagger: 0.075,
        delay: 1,
      });
      overlayTl.to(
        [".locations-header", ".location-item"],
        { opacity: 1, duration: 0.05, stagger: 0.075 },
        "<",
      );
      overlayTl.to(".project-item", {
        color: "#e3e4d8",
        duration: 0.15,
        stagger: 0.075,
      });
      overlayTl.to(
        ".location-item",
        { color: "#e3e4d8", duration: 0.15, stagger: 0.075 },
        "<",
      );
      overlayTl.to([".projects-header", ".project-item"], {
        opacity: 0,
        duration: 0.05,
        stagger: 0.075,
      });
      overlayTl.to(
        [".locations-header", ".location-item"],
        { opacity: 0, duration: 0.05, stagger: 0.075 },
        "<",
      );
      overlayTl.to(".overlay", { opacity: 0, duration: 0.5, delay: 1.5 });

      const rotate = () => {
        const grid = gsap.utils.toArray<HTMLElement>(".image-grid .img");
        const sources = Array.from({ length: 20 }, (_, i) =>
          asset(`spotlight/spotlight-${i + 1}.jpg`),
        );
        for (let cycle = 0; cycle < 20; cycle++) {
          gsap.to(
            {},
            {
              duration: 0,
              delay: cycle * 0.15,
              onComplete: () => {
                const shuffled = [...sources]
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 9);
                grid.forEach((cell, index) => {
                  const img = cell.querySelector("img");
                  if (img && shuffled[index]) img.src = shuffled[index];
                });
              },
            },
          );
        }
      };
      imagesTl.to(".image-grid .img", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        delay: 2.5,
        stagger: 0.05,
        ease: "filmHop",
        onStart: () =>
          setTimeout(() => {
            rotate();
            gsap.to(".loader", { opacity: 0, duration: 0.3 });
          }, 1000),
      });
      imagesTl.to(".image-grid .img", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1,
        delay: 2.5,
        stagger: 0.05,
        ease: "filmHop",
        onComplete: () => {
          preloaderSeen = true;
          setTimeout(() => {
            setVisible(false);
            lenis?.start();
            onDone();
          }, 500);
        },
      });
    },
    { dependencies: [] },
  );

  if (!visible) return null;
  const initial = Array.from({ length: 9 }, (_, i) =>
    asset(`spotlight/spotlight-${i + 1}.jpg`),
  );
  return (
    <>
      <div className="overlay">
        <div className="projects">
          <div className="projects-header">
            <p>Project</p>
            <p>Director</p>
          </div>
          {preloaderProjects.map((p) => (
            <div className="project-item" key={p.name}>
              <p>{p.name}</p>
              <p>{p.director}</p>
            </div>
          ))}
        </div>
        <div className="loader">
          <h1 className="logo-line-1 fs-logo-line-1">Negative</h1>
          <h1 className="logo-line-2 fs-logo-line-2">Films</h1>
        </div>
        <div className="locations">
          <div className="locations-header">
            <p>Location</p>
          </div>
          {preloaderProjects.map((p) => (
            <div className="location-item" key={p.name}>
              <p>{p.location}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="image-grid">
        {[0, 1, 2].map((row) => (
          <div className="grid-row" key={row}>
            {[0, 1, 2].map((col) => (
              <div className="img" key={col}>
                <img src={initial[row * 3 + col]} alt="" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* -------------------------------------------------------------- home page */

function HomePage() {
  const asset = useAsset();
  const { navigate } = useRouter();
  const [ready, setReady] = useState(preloaderSeen);
  usePixelatedVideo(ready);
  usePixelatedText(ready);
  useScrambleHover();
  const link = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  // ukiyojs parallax + split-element + spotlight + clients
  useEffect(() => {
    if (!ready) return;
    let ukiyo: Ukiyo | null = null;
    if (window.innerWidth >= MOBILE) {
      ukiyo = new Ukiyo('[data-parallax="true"] img', {
        scale: 1.5,
        speed: 0.65,
        willChange: true,
        wrapperClass: "ukiyo-wrapper",
        externalRAF: false,
      });
    }
    // split-element scroll scale
    const topImg = document.querySelector<HTMLElement>(".split-top img");
    const botImg = document.querySelector<HTMLElement>(".split-bottom img");
    let splitST: ScrollTrigger | null = null;
    if (topImg && botImg) {
      splitST = ScrollTrigger.create({
        trigger: ".split-element",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = Math.min(self.progress / 0.65, 1);
          gsap.set(topImg, {
            scale: 1.5 + (1 - 1.5) * progress,
            force3D: true,
          });
          gsap.set(botImg, { scale: 2 + (1 - 2) * progress, force3D: true });
        },
      });
    }
    ScrollTrigger.refresh();
    return () => {
      ukiyo?.reset?.();
      splitST?.kill();
    };
  }, [ready]);

  // spotlight gallery
  useEffect(() => {
    if (!ready) return;
    const container = document.querySelector<HTMLElement>(".spotlight-gallery");
    if (!container) return;
    let isMobile = window.innerWidth < MOBILE;
    const collapsedWidth = 20;
    const expandedWidth = 400;
    const mobileExpandedWidth = 100;
    const gap = 5;
    let items: HTMLElement[] = [];
    let currentExpanded = 0;
    const listeners: { el: HTMLElement; type: string; fn: EventListener }[] =
      [];

    function layout(expandedIndex: number) {
      const expW = isMobile ? mobileExpandedWidth : expandedWidth;
      let total = 0;
      for (let i = 0; i < items.length; i++)
        total += (i === expandedIndex ? expW : collapsedWidth) + gap;
      total -= gap;
      let left = (container!.offsetWidth - total) / 2;
      items.forEach((item, i) => {
        const w = i === expandedIndex ? expW : collapsedWidth;
        item.style.left = `${left}px`;
        item.style.width = `${w}px`;
        left += w + gap;
      });
    }
    function build() {
      container!.innerHTML = "";
      const count = isMobile ? 10 : 20;
      for (let i = 1; i <= count; i++) {
        const el = document.createElement("div");
        el.className = "spotlight-gallery-item";
        const img = document.createElement("img");
        img.src = asset(`spotlight/spotlight-${i}.jpg`);
        img.alt = `Spotlight ${i}`;
        el.appendChild(img);
        container!.appendChild(el);
      }
      items = Array.from(
        container!.querySelectorAll<HTMLElement>(".spotlight-gallery-item"),
      );
      currentExpanded = 0;
      layout(0);
      items.forEach((item, index) => {
        const fn = () => {
          currentExpanded = index;
          layout(index);
        };
        item.addEventListener("mouseenter", fn);
        listeners.push({ el: item, type: "mouseenter", fn });
      });
    }
    build();
    const onResize = () => {
      isMobile = window.innerWidth < MOBILE;
      build();
      layout(currentExpanded);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      listeners.forEach((l) => l.el.removeEventListener(l.type, l.fn));
      container.innerHTML = "";
    };
  }, [ready, asset]);

  // clients highlight
  useEffect(() => {
    if (!ready) return;
    const container = document.querySelector<HTMLElement>(
      ".clients .container",
    );
    const highlight = document.querySelector<HTMLElement>(
      ".clients .highlight",
    );
    const items = Array.from(
      document.querySelectorAll<HTMLElement>(".clients .grid-item"),
    );
    if (!container || !highlight || !items.length) return;
    let isMobile = window.innerWidth < MOBILE;
    let active: HTMLElement | null = null;
    const tone500 = getComputedStyle(
      document.querySelector<HTMLElement>(".film-studio-page") ??
        document.documentElement,
    )
      .getPropertyValue("--tone-500")
      .trim();
    const tone100 = getComputedStyle(
      document.querySelector<HTMLElement>(".film-studio-page") ??
        document.documentElement,
    )
      .getPropertyValue("--tone-100")
      .trim();
    function moveTo(el: HTMLElement) {
      if (!el || isMobile || active === el) return;
      if (active) {
        const p = active.querySelector("p");
        if (p) p.style.color = "";
      }
      const rect = el.getBoundingClientRect();
      const crect = container!.getBoundingClientRect();
      highlight!.style.transform = `translate(${rect.left - crect.left}px, ${rect.top - crect.top}px)`;
      highlight!.style.width = `${rect.width}px`;
      highlight!.style.height = `${rect.height}px`;
      highlight!.style.backgroundColor = tone500;
      active = el;
      const p = el.querySelector<HTMLElement>("p");
      if (p) {
        p.style.color = tone100;
        scrambleVisible(p, 0, {
          duration: 0.3,
          charDelay: 30,
          stagger: 20,
          maxIterations: 3,
        });
      }
    }
    const onMove = (e: MouseEvent) => {
      if (isMobile) return;
      const hovered = document.elementFromPoint(
        e.clientX,
        e.clientY,
      ) as HTMLElement | null;
      const target = hovered?.classList.contains("grid-item")
        ? hovered
        : hovered?.parentElement?.classList.contains("grid-item")
          ? hovered.parentElement
          : null;
      if (target) moveTo(target as HTMLElement);
    };
    if (!isMobile) {
      highlight.style.opacity = "1";
      container.addEventListener("mousemove", onMove);
      moveTo(items[0]);
    }
    const onResize = () => {
      isMobile = window.innerWidth < MOBILE;
    };
    window.addEventListener("resize", onResize);
    return () => {
      container.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [ready]);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />

      <section className="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          crossOrigin="anonymous"
        >
          <source src={asset("hero/hero-footage.mp4")} type="video/mp4" />
        </video>
        <div className="hero-content">
          <div className="hero-header">
            <div className="container">
              <h2>Films forged on shadow, silence and geometry.</h2>
            </div>
          </div>
          <div className="hero-footer">
            <div className="container">
              <p>
                <span>Warsaw</span> <span>/</span> <span>Marseille</span>
              </p>
              <p>[ &nbsp;Scroll to Continue&nbsp; ]</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-callout">
        <div className="container">
          <div className="about-callout-copy">
            <p>We Shoot. We fracture. We reform.</p>
            <p>We are Negative.</p>
          </div>
        </div>
      </section>

      <section className="pixelated-text about-header">
        <h1>Cold as Concrete</h1>
      </section>

      <section className="about-copy">
        <div className="container">
          <h3>
            We approach cinema as a construction of form and weight. Each frame
            is laid like concrete, measured and precise.
          </h3>
          <div className="about-copy-info">
            <p>
              Our work begins with the recognition that film is not an escape
              but a construction. We treat every image as material. Light,
              shadow, and silence are not backdrops, they are the raw elements
              we use to build. Each project is assembled like a structure, every
              frame placed with weight, every cut measured against the whole. We
              are not interested in surface, in ornament, in polish that fades.
              What we pursue is durability. What we pursue is form that endures
              long after the screen has gone dark. We believe that cinema should
              resist convenience. It should not bend itself to easy consumption
              or quick comfort. A film should hold its ground. It should demand
              attention, not chase it. Our practice is shaped by this
              discipline. We fracture images, we strip away excess, we confront
              the audience with only what is necessary. The result is work that
              is sharp, deliberate, and unflinching. This is not entertainment
              in the common sense.
            </p>
            <a
              href="/culture"
              className="scramble-hover"
              onClick={link("/culture")}
            >
              [ &nbsp;Explore Our Ethos&nbsp; ]
            </a>
          </div>
        </div>
      </section>

      <section className="banner">
        <div
          className="banner-img"
          data-parallax="true"
          data-parallax-speed="0.2"
        >
          <img src={asset("home/banner.jpg")} alt="" />
        </div>
        <div className="banner-content">
          <div className="container">
            <div className="banner-header">
              <h2>We do not chase beauty. We build function.</h2>
            </div>
            <div className="banner-tags">
              <p>Film Archive</p>
              <p>Documentation</p>
              <p>Still Frames</p>
              <p>Research</p>
              <p>Preservation</p>
            </div>
            <div className="banner-copy">
              <p>
                Film is not only vision, it is work. We set lights until the
                shadows fall in the right place. We cut until rhythm appears. We
                test, we rebuild, we repeat. The camera is a tool, but so is the
                hand that holds it and the time spent waiting for a single
                detail to align. This is the practice that shapes what you see.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="spotlight">
        <div className="spotlight-container">
          <div className="spotlight-gallery"></div>
        </div>
        <div className="spotlight-footer">
          <div className="container">
            <p>Selected Frames</p>
            <a href="/work" className="scramble-hover" onClick={link("/work")}>
              [ &nbsp;Expand Catalogue&nbsp; ]
            </a>
          </div>
        </div>
      </section>

      <section className="split-element">
        <div className="split-img split-top">
          <img src={asset("home/form.svg")} alt="" />
        </div>
        <div className="split-img split-bottom">
          <img src={asset("home/form.svg")} alt="" />
        </div>
        <div className="split-copy">
          <div className="container">
            <p>
              <span>Disruption</span>
              <span>Discipline</span>
              <span>Mechanics</span>
              <span>Sequence</span>
              <span>Construct</span>
            </p>
          </div>
        </div>
      </section>

      <section className="clients">
        <div className="container">
          <div className="clients-header">
            <p>[ &nbsp;Selected Collaborations&nbsp; ]</p>
            <h3>Allies in Creation</h3>
          </div>
          <div className="grid">
            <div className="grid-row">
              <div className="grid-item">
                <p>Blackline Studio</p>
              </div>
              <div className="grid-item">
                <p>North Axis</p>
              </div>
              <div className="grid-item">
                <p>Vanta Works</p>
              </div>
            </div>
            <div className="grid-row">
              <div className="grid-item">
                <p>Oblique Films</p>
              </div>
              <div className="grid-item">
                <p>Hollow Syndicate</p>
              </div>
              <div className="grid-item">
                <p>Ferrotype</p>
              </div>
              <div className="grid-item">
                <p>Glasshaus</p>
              </div>
              <div className="grid-item">
                <p>Orbit Division</p>
              </div>
            </div>
          </div>
          <div className="highlight"></div>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* -------------------------------------------------------------- work page */

function WorkPage() {
  const asset = useAsset();
  useScrambleHover();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let destroyed = false;
    let raf = 0;
    let currentIndex = 0;
    let transitioning = false;
    const textures: THREE.Texture[] = [];
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture1: { value: null },
        uTexture2: { value: null },
        uProgress: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTexture1Size: { value: new THREE.Vector2(1, 1) },
        uTexture2Size: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: LENS_VERTEX,
      fragmentShader: LENS_FRAGMENT,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    (async () => {
      for (const slide of slidesData) {
        const texture = await new Promise<THREE.Texture>((resolve) =>
          loader.load(asset(slide.image), resolve),
        );
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        const img = texture.image as HTMLImageElement;
        texture.userData = { size: new THREE.Vector2(img.width, img.height) };
        textures.push(texture);
      }
      if (destroyed || textures.length < 2) return;
      material.uniforms.uTexture1.value = textures[0];
      material.uniforms.uTexture2.value = textures[1];
      material.uniforms.uTexture1Size.value = textures[0].userData.size;
      material.uniforms.uTexture2Size.value = textures[1].userData.size;
      const render = () => {
        if (destroyed) return;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(render);
      };
      render();
    })();

    // slide text handling
    const setTitleChars = (root: HTMLElement) => {
      const title = root.querySelector<HTMLElement>(".slide-title h1");
      if (title && title.querySelectorAll(".char").length === 0) {
        const words = (title.textContent ?? "").split(" ");
        title.innerHTML = "";
        words.forEach((word, wi) => {
          const wordDiv = document.createElement("div");
          wordDiv.className = "word";
          [...word].forEach((ch) => {
            const c = document.createElement("div");
            c.className = "char";
            c.innerHTML = `<span>${ch}</span>`;
            wordDiv.appendChild(c);
          });
          title.appendChild(wordDiv);
          if (wi < words.length - 1) {
            const sp = document.createElement("div");
            sp.className = "char space-char";
            sp.innerHTML = "<span> </span>";
            title.appendChild(sp);
          }
        });
      }
      root
        .querySelectorAll<HTMLElement>(".slide-description p, .slide-link a")
        .forEach((el) => {
          new SplitText(el, { type: "lines", linesClass: "line" });
          el.querySelectorAll(".line").forEach((line) => {
            line.innerHTML = `<span>${line.textContent}</span>`;
          });
        });
    };

    const initialContent =
      document.querySelector<HTMLElement>(".slider-content");
    if (initialContent) {
      setTitleChars(initialContent);
      gsap.set(initialContent.querySelectorAll(".line span"), { y: "0%" });
    }

    const makeSlide = (data: (typeof slidesData)[number]) => {
      const content = document.createElement("div");
      content.className = "slider-content";
      content.style.opacity = "0";
      content.innerHTML = `<div class="slide-title"><h1>${data.title}</h1></div>
        <div class="slide-description"><p>${data.description}</p>
        <div class="slide-info"><p>Type. ${data.type}</p><p>Field. ${data.field}</p><p>Date. ${data.date}</p></div>
        <div class="slide-link"><a href="${data.route}">[ View Full Project ]</a></div></div>`;
      return content;
    };

    const changeSlide = () => {
      if (transitioning || textures.length < 2) return;
      transitioning = true;
      const nextIndex = (currentIndex + 1) % slidesData.length;
      material.uniforms.uTexture1.value = textures[currentIndex];
      material.uniforms.uTexture2.value = textures[nextIndex];
      material.uniforms.uTexture1Size.value =
        textures[currentIndex].userData.size;
      material.uniforms.uTexture2Size.value = textures[nextIndex].userData.size;
      const current = document.querySelector<HTMLElement>(".slider-content");
      const slider = document.querySelector<HTMLElement>(".slider");
      if (current && slider) {
        const currentTitle =
          current.querySelector<HTMLElement>(".slide-title h1");
        if (currentTitle) scrambleOut(currentTitle, 0);
        gsap.to([...current.querySelectorAll(".line span")], {
          y: "-100%",
          duration: 0.6,
          stagger: 0.025,
          ease: "power2.inOut",
          delay: 0.1,
        });
        gsap.delayedCall(0.8, () => {
          const next = makeSlide(slidesData[nextIndex]);
          slider.appendChild(next);
          gsap.set(next.querySelectorAll("span"), { y: "100%" });
          setTimeout(() => {
            setTitleChars(next);
            const newTitle = next.querySelector<HTMLElement>(".slide-title h1");
            const newLines = next.querySelectorAll(".line span");
            gsap.set(newLines, { y: "100%" });
            gsap.set(next, { opacity: 1 });
            gsap
              .timeline({
                onComplete: () => {
                  transitioning = false;
                  currentIndex = nextIndex;
                  current.remove();
                },
              })
              .call(() => {
                if (newTitle) scrambleIn(newTitle, 0);
              })
              .to(
                newLines,
                { y: "0%", duration: 0.5, stagger: 0.1, ease: "power2.inOut" },
                0.3,
              );
          }, 100);
        });
      }
      gsap.fromTo(
        material.uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: 2.5,
          ease: "power2.inOut",
          onComplete: () => {
            material.uniforms.uProgress.value = 0;
            material.uniforms.uTexture1.value = textures[nextIndex];
            material.uniforms.uTexture1Size.value =
              textures[nextIndex].userData.size;
          },
        },
      );
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        t.closest(".slide-link a") ||
        t.closest("nav") ||
        t.closest(".nav-overlay") ||
        t.closest(".menu-toggle-btn")
      )
        return;
      changeSlide();
    };
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight,
      );
    };
    document.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      textures.forEach((t) => t.dispose());
      material.dispose();
      renderer.dispose();
    };
  }, [asset]);

  return (
    <div className="page work">
      <div className="slider">
        <canvas ref={canvasRef}></canvas>
        <div className="slider-content">
          <div className="slide-title">
            <h1>Gilded Noise</h1>
          </div>
          <div className="slide-description">
            <p>
              Heat, gold, and the sharp glint of teeth caught in a half-lit
              confession.
            </p>
            <div className="slide-info">
              <p>Type. Still</p>
              <p>Field. Cinematic</p>
              <p>Date. 2025</p>
            </div>
            <div className="slide-link">
              <a href="/film" className="scramble-hover">
                [ View Full Project ]
              </a>
            </div>
          </div>
        </div>
        <div className="slide-footer">
          <div className="container">
            <p>Selected Works</p>
            <p>[ &nbsp;Click Through&nbsp; ]</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- film page */

function FilmPage() {
  const asset = useAsset();
  const [ready] = useState(true);
  usePixelatedText(ready);
  useScrambleHover();

  useEffect(() => {
    // parallax
    let ukiyo: Ukiyo | null = null;
    if (window.innerWidth >= MOBILE)
      ukiyo = new Ukiyo('[data-parallax="true"] img', {
        scale: 1.5,
        speed: 0.65,
        willChange: true,
        wrapperClass: "ukiyo-wrapper",
        externalRAF: false,
      });
    // snapshot mask reveal (film.js)
    const clipPaths = [
      "polygon(0% 0%, 33.5% 0%, 33.5% 33.5%, 0% 33.5%)",
      "polygon(33% 0%, 66.5% 0%, 66.5% 33.5%, 33% 33.5%)",
      "polygon(66% 0%, 100% 0%, 100% 33.5%, 66% 33.5%)",
      "polygon(0% 33%, 33.5% 33%, 33.5% 66.5%, 0% 66.5%)",
      "polygon(33% 33%, 66.5% 33%, 66.5% 66.5%, 33% 66.5%)",
      "polygon(66% 33%, 100% 33%, 100% 66.5%, 66% 66.5%)",
      "polygon(0% 66%, 33.5% 66%, 33.5% 100%, 0% 100%)",
      "polygon(33% 66%, 66.5% 66%, 66.5% 100%, 33% 100%)",
      "polygon(66% 66%, 100% 66%, 100% 100%, 66% 100%)",
    ];
    const triggers: ScrollTrigger[] = [];
    document.querySelectorAll<HTMLElement>(".snap-img").forEach((img) => {
      if (!img.className.includes("img-")) return;
      for (let i = 0; i < 9; i++) {
        const m = document.createElement("div");
        m.classList.add("mask");
        img.appendChild(m);
      }
    });
    document.querySelectorAll<HTMLElement>(".snap-row").forEach((row) => {
      row.querySelectorAll<HTMLElement>(".snap-img").forEach((img) => {
        if (!img.className.includes("img-")) return;
        const masks = img.querySelectorAll<HTMLElement>(".mask");
        masks.forEach((mask, index) =>
          gsap.set(mask, { clipPath: clipPaths[index], opacity: 0 }),
        );
        const shuffled = gsap.utils.shuffle([...masks]);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: "top 75%" },
        });
        tl.to(shuffled, {
          opacity: 1,
          duration: 0.05,
          ease: "power2.inOut",
          stagger: { amount: 0.5, from: "random", repeat: 2, yoyo: true },
        });
        if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);
      });
    });
    ScrollTrigger.refresh();
    return () => {
      ukiyo?.reset?.();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <section className="film-hero">
        <div className="container">
          <div className="film-hero-copy">
            <div className="film-hero-title">
              <div className="pixelated-text">
                <h1>White Rush</h1>
              </div>
            </div>
            <div className="film-hero-description">
              <p>
                White Rush unfolds in the raw force of winter, where snow erases
                the horizon and motion becomes survival. A figure cuts through
                the cold, pressed against velocity and silence alike. The
                sequence captures exhaustion, defiance, and beauty within the
                same frame, a study of speed turned into memory.
              </p>
              <p>[ &nbsp;Continue Inside&nbsp; ]</p>
            </div>
          </div>
        </div>
      </section>

      <section className="banner film-banner">
        <div
          className="banner-img"
          data-parallax="true"
          data-parallax-speed="0.2"
        >
          <img src={asset("sample-film/banner.jpg")} alt="" />
        </div>
        <div className="banner-content">
          <div className="container">
            <div className="banner-header">
              <h2>Vision by</h2>
              <h2>Nikolai Dreyer</h2>
            </div>
            <div className="banner-tags">
              <p>Snow</p>
              <p>Velocity</p>
              <p>Silence</p>
              <p>Endurance</p>
              <p>Collision</p>
            </div>
            <div className="banner-copy">
              <p>
                White Rush captures the collision between human persistence and
                the violence of winter. Filmed against a horizon erased by snow,
                it follows a figure moving through silence and speed,
                documenting both exhaustion and defiance. Each frame turns
                motion into memory, and cold into endurance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="film-snapshots">
        <div className="container">
          <div className="snap-row">
            <div className="snap-img"></div>
            <div className="snap-img"></div>
            <div className="snap-img img-1"></div>
          </div>
          <div className="snap-row">
            <div className="snap-img img-2"></div>
            <div className="snap-img"></div>
            <div className="snap-img"></div>
          </div>
          <div className="snap-row">
            <div className="snap-img"></div>
            <div className="snap-img img-3"></div>
            <div className="snap-img img-4"></div>
          </div>
          <div className="snap-row">
            <div className="snap-img img-5"></div>
            <div className="snap-img"></div>
            <div className="snap-img"></div>
          </div>
          <div className="snap-row">
            <div className="snap-img"></div>
            <div className="snap-img"></div>
            <div className="snap-img img-6"></div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ---------------------------------------------------------- directors page */

function DirectorsPage() {
  const asset = useAsset();
  usePixelatedText(true);

  useEffect(() => {
    const listContainer =
      document.querySelector<HTMLElement>(".directors-list");
    if (!listContainer) return;
    let isMobile = window.innerWidth < MOBILE;
    const cleanups: (() => void)[] = [];
    function applyLayout() {
      const previews =
        document.querySelectorAll<HTMLElement>(".director-preview");
      const imgs = document.querySelectorAll<HTMLElement>(
        ".director-preview img",
      );
      if (isMobile) {
        previews.forEach((p) =>
          gsap.set(p, {
            position: "relative",
            top: "auto",
            height: "300px",
            pointerEvents: "auto",
            clearProps: "clip-path",
            padding: "1rem",
          }),
        );
        imgs.forEach((img) => gsap.set(img, { scale: 1, clearProps: "scale" }));
      } else {
        previews.forEach((p) =>
          gsap.set(p, {
            position: "absolute",
            top: "100%",
            height: "300%",
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            pointerEvents: "none",
            clearProps: "position,top,height",
          }),
        );
        imgs.forEach((img) => gsap.set(img, { scale: 1.5 }));
      }
    }
    function build() {
      listContainer!.innerHTML = "";
      directorsData.forEach((d) => {
        const el = document.createElement("div");
        el.className = "director-item";
        el.innerHTML = `<a href="${d.route}" class="director-link"><div class="director-name"><h2>${d.name}</h2></div><div class="director-preview"><img src="${asset(d.previewImg)}" alt="${d.name}" /></div></a>`;
        listContainer!.appendChild(el);
      });
    }
    function initScramble() {
      if (isMobile) return;
      document
        .querySelectorAll<HTMLElement>(".director-item")
        .forEach((item) => {
          const activeSet = new Set<HTMLElement>();
          const enter = () => {
            if (activeSet.has(item)) return;
            activeSet.add(item);
            const name = item.querySelector<HTMLElement>(".director-name h2");
            const preview =
              item.querySelector<HTMLElement>(".director-preview");
            const img = preview?.querySelector<HTMLElement>("img");
            if (name) {
              name.style.color = "var(--tone-500)";
              scrambleVisible(name, 0, {
                duration: 0.1,
                charDelay: 25,
                stagger: 25,
                skipChars: 1,
                maxIterations: 5,
              });
            }
            if (preview)
              gsap.to(preview, {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 0.3,
                ease: "power4.out",
              });
            if (img) {
              gsap.killTweensOf(img);
              gsap.fromTo(
                img,
                { scale: 1.5 },
                { scale: 1, duration: 0.75, ease: "power4.out" },
              );
            }
          };
          const leave = () => {
            activeSet.delete(item);
            const name = item.querySelector<HTMLElement>(".director-name h2");
            const preview =
              item.querySelector<HTMLElement>(".director-preview");
            const img = preview?.querySelector<HTMLElement>("img");
            if (name) {
              name.style.color = name.dataset.originalColor || "";
              name.querySelectorAll<HTMLElement>(".char span").forEach((c) => {
                c.textContent =
                  (c as CharEl).dataset.originalText || c.textContent;
                c.style.opacity = "1";
              });
            }
            if (preview) {
              gsap.set(preview, {
                clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
              });
              gsap.to(preview, {
                clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
                duration: 0.5,
                ease: "power4.out",
                onComplete: () =>
                  gsap.set(preview, {
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
                  }),
              });
            }
            if (img) {
              gsap.killTweensOf(img);
              gsap.fromTo(
                img,
                { scale: 1 },
                { scale: 1.5, duration: 0.5, ease: "power4.out" },
              );
            }
          };
          item.addEventListener("mouseenter", enter);
          item.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            item.removeEventListener("mouseenter", enter);
            item.removeEventListener("mouseleave", leave);
          });
        });
    }
    build();
    applyLayout();
    initScramble();
    const onResize = () => {
      isMobile = window.innerWidth < MOBILE;
      applyLayout();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cleanups.forEach((c) => c());
    };
  }, [asset]);

  return (
    <>
      <section className="pixelated-text directors-hero">
        <h1>House Directors</h1>
      </section>
      <div className="directors-list"></div>
      <Footer />
    </>
  );
}

/* ---------------------------------------------------------- culture page */

function CulturePage() {
  const asset = useAsset();
  useScrambleHover();

  // services indicator (services.js)
  useEffect(() => {
    const list = document.querySelector<HTMLElement>(".services-list");
    const indicator = document.querySelector<HTMLElement>(
      ".services-indicator",
    );
    if (!list || !indicator) return;
    let isMobile = window.innerWidth < MOBILE;
    let active: HTMLElement | null = null;
    const cleanups: (() => void)[] = [];
    servicesData.forEach((service) => {
      const item = document.createElement("div");
      item.className = "service-item with-image";
      item.innerHTML = `<div class="service-img-wrapper"><img src="${asset(service.img)}" alt="${service.name}" class="service-image" /></div><div class="service-name"><h2>${service.name}</h2></div>`;
      list.appendChild(item);
    });
    const span = indicator.querySelector("span");
    if (span) span.textContent = servicesData[0].indicatorText;
    gsap.set(indicator, { y: 0 });
    document
      .querySelectorAll<HTMLElement>(".service-item.with-image")
      .forEach((item, index) => {
        const enter = () => {
          if (active && active !== item)
            active
              .querySelector<HTMLElement>(".service-name h2")
              ?.style.setProperty("color", "");
          active = item;
          const name = item.querySelector<HTMLElement>(".service-name h2");
          if (!isMobile && name) {
            if (!name.dataset.originalText)
              name.dataset.originalText = name.textContent ?? "";
            name.style.color = "var(--tone-500)";
            scrambleVisible(name, 0, {
              duration: 0.1,
              charDelay: 25,
              stagger: 25,
              skipChars: 0,
              maxIterations: 5,
            });
            const itemRect = item.getBoundingClientRect();
            const listRect = list.getBoundingClientRect();
            const indicatorRect = indicator.getBoundingClientRect();
            const centerY = itemRect.top - listRect.top + itemRect.height / 2;
            const targetY = centerY - indicatorRect.height / 2;
            const clamped = Math.max(
              20,
              Math.min(targetY, listRect.height - indicatorRect.height - 20),
            );
            if (span) span.textContent = servicesData[index].indicatorText;
            gsap.to(indicator, {
              y: clamped,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        };
        const leave = () => {
          active = null;
          const name = item.querySelector<HTMLElement>(".service-name h2");
          if (!isMobile && name) {
            name.style.color = name.dataset.originalColor || "";
            name.querySelectorAll<HTMLElement>(".char span").forEach((c) => {
              c.textContent =
                (c as CharEl).dataset.originalText || c.textContent;
              c.style.opacity = "1";
            });
          }
        };
        item.addEventListener("mouseenter", enter);
        item.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          item.removeEventListener("mouseenter", enter);
          item.removeEventListener("mouseleave", leave);
        });
      });
    const onResize = () => {
      isMobile = window.innerWidth < MOBILE;
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cleanups.forEach((c) => c());
    };
  }, [asset]);

  // team grid + scroll (culture.js) + split-element + hero scramble
  useEffect(() => {
    const teamSection = document.querySelector<HTMLElement>(".team");
    if (teamSection) {
      cultureGridLayout.forEach((row) => {
        const teamRow = document.createElement("div");
        teamRow.className = "team-row";
        row.forEach((imageIndex) => {
          const col = document.createElement("div");
          col.className = "team-col";
          if (imageIndex !== null) {
            const teamImg = document.createElement("div");
            teamImg.className = "team-img";
            teamImg.setAttribute("data-origin", cultureOrigins[imageIndex]);
            const img = document.createElement("img");
            img.src = asset(`culture/team/team-${imageIndex + 1}.jpg`);
            img.alt = "";
            teamImg.appendChild(img);
            col.appendChild(teamImg);
          }
          teamRow.appendChild(col);
        });
        teamSection.appendChild(teamRow);
      });
    }
    const hero = document.querySelector<HTMLElement>(".culture-hero-header h1");
    if (hero)
      scrambleIn(hero, 0.75, {
        duration: 0.4,
        charDelay: 40,
        stagger: 80,
        skipChars: 0,
        maxIterations: 5,
      });

    const isMobile = window.innerWidth < MOBILE;
    const triggers: ScrollTrigger[] = [];
    if (isMobile) {
      gsap.set(".team-img", { scale: 1, force3D: true });
    } else {
      gsap.set(".team-img", { scale: 0, force3D: true });
      document
        .querySelectorAll<HTMLElement>(".team-row")
        .forEach((row, index) => {
          const rowImages = row.querySelectorAll<HTMLElement>(".team-img");
          if (!rowImages.length) return;
          row.id = `team-row-${index}`;
          triggers.push(
            ScrollTrigger.create({
              trigger: row,
              start: "top bottom",
              end: "bottom bottom-=10%",
              scrub: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (self.isActive) {
                  const eased = Math.min(1, self.progress * 1.2);
                  rowImages.forEach((img) =>
                    gsap.set(img, {
                      scale: gsap.utils.interpolate(0, 1, eased),
                      force3D: true,
                    }),
                  );
                  if (self.progress > 0.95)
                    gsap.set(rowImages, { scale: 1, force3D: true });
                }
              },
              onLeave: () => gsap.set(rowImages, { scale: 1, force3D: true }),
            }),
          );
          triggers.push(
            ScrollTrigger.create({
              trigger: row,
              start: "top top",
              end: "bottom top",
              pin: true,
              pinSpacing: false,
              scrub: 1,
              invalidateOnRefresh: true,
              onEnter: () => gsap.set(rowImages, { scale: 1, force3D: true }),
              onUpdate: (self) => {
                if (self.isActive)
                  rowImages.forEach((img) =>
                    gsap.set(img, {
                      scale: gsap.utils.interpolate(1, 0, self.progress),
                      force3D: true,
                    }),
                  );
              },
            }),
          );
        });
    }
    const header = document.querySelector<HTMLElement>(".team-header");
    if (teamSection && header)
      triggers.push(
        ScrollTrigger.create({
          trigger: teamSection,
          start: "top top",
          end: "bottom bottom",
          pin: header,
          pinSpacing: false,
        }),
      );

    // split-element
    const topImg = document.querySelector<HTMLElement>(".split-top img");
    const botImg = document.querySelector<HTMLElement>(".split-bottom img");
    if (topImg && botImg) {
      triggers.push(
        ScrollTrigger.create({
          trigger: ".split-element",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = Math.min(self.progress / 0.65, 1);
            gsap.set(topImg, { scale: 1.5 + (1 - 1.5) * p, force3D: true });
            gsap.set(botImg, { scale: 2 + (1 - 2) * p, force3D: true });
          },
        }),
      );
    }
    ScrollTrigger.refresh();
    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [asset]);

  return (
    <>
      <section className="culture-hero">
        <div className="culture-hero-img">
          <img src={asset("culture/hero.jpg")} alt="" />
        </div>
        <div className="culture-hero-header">
          <div className="container">
            <h1>Inside The Studio</h1>
          </div>
        </div>
        <div className="culture-hero-footer">
          <div className="container">
            <p>Studio Rituals</p>
            <p>[ &nbsp;Continue Reading&nbsp; ]</p>
          </div>
        </div>
      </section>

      <section className="services">
        <div className="services-container">
          <div className="services-list"></div>
          <div className="services-indicator">
            <span>[ Discover ]</span>
          </div>
        </div>
        <div className="services-footer">
          <div className="container">
            <p>Offered Works</p>
            <p>[ &nbsp;Practice Areas&nbsp; ]</p>
          </div>
        </div>
      </section>

      <section className="team">
        <div className="team-header">
          <h2>People Behind</h2>
        </div>
      </section>

      <section className="split-element">
        <div className="container">
          <div className="split-img split-top">
            <img src={asset("home/form.svg")} alt="" />
          </div>
          <div className="split-img split-bottom">
            <img src={asset("home/form.svg")} alt="" />
          </div>
        </div>
        <div className="split-copy">
          <div className="container">
            <p>
              <span>Disruption</span>
              <span>Discipline</span>
              <span>Mechanics</span>
              <span>Sequence</span>
              <span>Construct</span>
            </p>
          </div>
        </div>
      </section>

      <section className="culture-about">
        <div className="container">
          <div className="culture-header">
            <p>[ &nbsp;Operating Field&nbsp; ]</p>
            <h3>Inside Process</h3>
          </div>
          <div className="culture-about-copy">
            <p>
              Our studio operates as both workshop and laboratory. Every project
              is approached like an experiment, tested in fragments, revised
              through repetition, and built layer by layer. We believe that
              ideas gain strength when exposed to pressure, when they are forced
              to survive scrutiny and resist collapse.
            </p>
            <p>
              The culture here is one of process rather than instant result, a
              constant cycle of building, breaking, and reassembling until only
              the essential remains. Collaboration is treated as structure, not
              decoration. Teams are formed like systems, each role carrying
              weight, each voice shaping the final frame. Conflict is not
              avoided but used as material, because friction generates clarity.
              The rhythm of work is set by the people themselves, moving between
              long silence, sudden bursts of invention, and the slow grind of
              technical precision. This is how our culture functions, not as
              hierarchy but as a collective mechanism. What emerges from this
              approach is not only film but an environment defined by
              persistence.
            </p>
            <p>
              We aim to create work that resists trends, that does not vanish
              when the noise fades. The culture of the studio is built on
              discipline, endurance, and the belief that every image should
              outlast its moment. What binds us together is not just the act of
              making, but the responsibility to leave behind work that remains.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ---------------------------------------------------------- contact page */

function ContactPage() {
  const asset = useAsset();
  usePixelatedVideo(true);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(
      ".contact-copy h4, .contact-copy-footer p",
    );
    els.forEach((el, index) => {
      if (el.textContent?.trim())
        scrambleIn(el, 0.75 + index * 0.1, {
          duration: 0.1,
          charDelay: 50,
          stagger: 25,
          skipChars: 0,
          maxIterations: 5,
        });
    });
  }, []);

  return (
    <section className="hero contact-page">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
      >
        <source src={asset("contact/contact-hero.mp4")} type="video/mp4" />
      </video>
      <div className="contact-copy">
        <div className="contact-copy-main">
          <div className="contact-col-copy">
            <h4 className="contact-header">Negative Films</h4>
            <h4>Warsaw / Marseille</h4>
            <h4>Block C, Foundry Street</h4>
            <h4>48.8566 / 2.3522</h4>
            <h4>FR-204X</h4>
          </div>
          <div className="contact-col-copy">
            <h4>Drop a line</h4>
            <h4>Inquiry@negative.com</h4>
            <h4>Instagram / Vimeo / LinkedIn</h4>
            <h4>+(33) 714 202 4410</h4>
          </div>
        </div>
        <div className="contact-copy-footer">
          <div className="container">
            <p>Developed by BLANK</p>
            <p>&copy; 2025 Negative Films</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ shell */

/** Nearest scrollable ancestor, or null when this is the page's own scroller. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node) {
    const oy = getComputedStyle(node).overflowY;
    if (oy === "auto" || oy === "scroll") return node;
    node = node.parentElement;
  }
  return null;
}

/** Points ScrollTrigger at the real scroll container when embedded (see dining port). */
function ScrollerSetup() {
  useGSAP(() => {
    const root = document.querySelector<HTMLElement>(".film-studio-page");
    const scroller = getScrollParent(root);
    if (!scroller) return;
    ScrollTrigger.defaults({ scroller });
    ScrollTrigger.refresh();
    return () => {
      ScrollTrigger.defaults({ scroller: undefined });
    };
  }, []);
  return null;
}

function renderRoute(pathname: string) {
  switch (pathname) {
    case "/work":
      return <WorkPage />;
    case "/culture":
      return <CulturePage />;
    case "/directors":
      return <DirectorsPage />;
    case "/contact":
      return <ContactPage />;
    case "/film":
      return <FilmPage />;
    default:
      return <HomePage />;
  }
}

function FilmStudioShell({ initialPath }: { initialPath: RoutePath }) {
  const [current, setCurrent] = useState<string>(initialPath);
  const lenis = useLenis();
  const busy = useRef(false);

  // The transition overlay defaults to a full-screen scaleY(1) red panel; the
  // source hides it on load. Do the same before paint so the page isn't red.
  useGSAP(() => {
    gsap.set(".transition-overlay", { scaleY: 0, transformOrigin: "top" });
  }, []);

  const navigate = useCallback(
    (to: string) => {
      if (!ROUTE_PATHS.includes(to) || to === current || busy.current) return;
      busy.current = true;
      const overlay = ".transition-overlay";
      gsap.set(overlay, { scaleY: 0, transformOrigin: "bottom" });
      gsap.to(overlay, {
        scaleY: 1,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          setCurrent(to);
          window.scrollTo(0, 0);
          requestAnimationFrame(() => {
            gsap.set(overlay, { scaleY: 1, transformOrigin: "top" });
            gsap.to(overlay, {
              scaleY: 0,
              duration: 0.6,
              delay: 0.4,
              ease: "power2.inOut",
              onComplete: () => {
                busy.current = false;
              },
            });
          });
        },
      });
      lenis?.scrollTo(0, { immediate: true });
    },
    [current, lenis],
  );

  const value = useMemo<RouterValue>(
    () => ({ pathname: current, navigate }),
    [current, navigate],
  );

  return (
    <RouterContext.Provider value={value}>
      <ScrollerSetup />
      <div className="transition">
        <div className="transition-overlay"></div>
      </div>
      <Nav />
      <div className="film-viewport" key={current}>
        {renderRoute(current)}
      </div>
    </RouterContext.Provider>
  );
}

/* --------------------------------------------------------------- top level */

export interface FilmStudioPageProps {
  assetBase?: string;
  initialPath?: RoutePath;
  className?: string;
  style?: CSSProperties;
}

export default function FilmStudioPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: FilmStudioPageProps) {
  const normalizedAssetBase = assetBase.replace(/\/$/, "");
  const styles = useMemo(
    () => getFilmStudioPageStyles(normalizedAssetBase),
    [normalizedAssetBase],
  );

  return (
    <ASSET_CONTEXT.Provider value={normalizedAssetBase}>
      <main className={`film-studio-page ${className}`.trim()} style={style}>
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet */}
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <FilmStudioShell key={initialPath} initialPath={initialPath} />
      </main>
    </ASSET_CONTEXT.Provider>
  );
}

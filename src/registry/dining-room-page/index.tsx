"use client";

/**
 * Dining Room Page - source-backed Salle Blanche restaurant template.
 *
 * A faithful React port of the Next.js Salle Blanche site: the full routed
 * experience (home, menu, about, reservation) with its Preloader, rotating Nav
 * menu, GSAP SplitText copy reveals, Lenis smooth scroll, dining menu selector,
 * dragging testimonials carousel, sticky cards, chefs hover, marquee, pinned
 * reservation cards, and a self-contained clip-path page transition. Images and
 * fonts are served from the Compronents asset host.
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import ReactLenis, { useLenis } from "lenis/react";
import type * as React from "react";
import {
  Children,
  type CSSProperties,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  HiOutlineArrowDown,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineArrowUp,
} from "react-icons/hi";
import { HiBolt, HiMoon, HiSparkles } from "react-icons/hi2";
import { getDiningRoomPageStyles } from "./styles";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const DEFAULT_ASSET_BASE = "https://ui.aryank.space/assets/dining-room-page";
const MOBILE_BREAKPOINT = 1000;
const TRANSITION_EASE = "power4.inOut";
const TRANSITION_DURATION = 1.5;

const ASSET_CONTEXT = createContext(DEFAULT_ASSET_BASE);

function useAsset() {
  const base = useContext(ASSET_CONTEXT);
  return useCallback(
    (path: string) => `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    [base],
  );
}

/* ------------------------------------------------------------------ router */

export const DINING_ROOM_PAGE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "Essence" },
  { path: "/menu", label: "Carte" },
  { path: "/reservation", label: "Book" },
] as const;

type RoutePath = (typeof DINING_ROOM_PAGE_ROUTES)[number]["path"];

const ROUTE_PATHS = DINING_ROOM_PAGE_ROUTES.map((r) => r.path) as RoutePath[];

interface RouterValue {
  pathname: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterValue>({
  pathname: "/",
  navigate: () => {},
});

function useRouter() {
  return useContext(RouterContext);
}

/* -------------------------------------------------------------------- Copy */

const REQUIRED_FONTS = ["Host Grotesk", "DM Mono", "Roslindale Variable"];

async function waitForFonts() {
  try {
    await document.fonts.ready;
    REQUIRED_FONTS.forEach((font) => {
      document.fonts.check(`16px "${font}"`);
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

function resolveTriggerElement(
  selector: string | null,
  fallback: HTMLElement,
): HTMLElement {
  if (typeof selector === "string" && selector.trim().length > 0) {
    return (
      (fallback.closest(selector) as HTMLElement | null) ||
      (document.querySelector(selector) as HTMLElement | null) ||
      fallback
    );
  }
  return fallback;
}

interface CopyProps {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  type?: "lines" | "words";
  trigger?: string | null;
  triggerPoint?: string | null;
  start?: string | null;
}

function Copy({
  children,
  animateOnScroll = true,
  delay = 0,
  type = "lines",
  trigger = null,
  triggerPoint = null,
  start = null,
}: CopyProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const splitInstanceRefs = useRef<SplitText[]>([]);
  const scrollTriggerRefs = useRef<ScrollTrigger[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let isActive = true;

      const cleanupInstances = () => {
        scrollTriggerRefs.current.forEach((st) => {
          st?.kill();
        });
        scrollTriggerRefs.current = [];
        splitInstanceRefs.current.forEach((split) => {
          split?.revert();
        });
        splitInstanceRefs.current = [];
      };

      const buildAnimations = async () => {
        await waitForFonts();
        if (!isActive || !containerRef.current) return;

        cleanupInstances();

        const targetElements = containerRef.current.hasAttribute(
          "data-copy-wrapper",
        )
          ? (Array.from(containerRef.current.children) as HTMLElement[])
          : [containerRef.current];

        const resolvedType = type === "words" ? "words" : "lines";
        const resolvedStart = start ?? "top 80%";
        const triggerElement = resolveTriggerElement(
          triggerPoint ?? trigger,
          containerRef.current,
        );

        const splitUnits: HTMLElement[] = [];

        targetElements.forEach((element) => {
          const isWordSplit = resolvedType === "words";

          const split = SplitText.create(element, {
            type: isWordSplit ? "words" : "lines",
            mask: isWordSplit ? "words" : "lines",
            ...(isWordSplit
              ? { wordsClass: "word" }
              : { linesClass: "line", lineThreshold: 0.1 }),
          });

          splitInstanceRefs.current.push(split);

          const units = (
            isWordSplit ? split.words : split.lines
          ) as HTMLElement[];

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;
          if (textIndent && textIndent !== "0px" && units.length > 0) {
            units[0].style.paddingLeft = textIndent;
            element.style.textIndent = "0";
          }

          splitUnits.push(...units);
        });

        gsap.set(splitUnits, { y: "110%" });

        const revealAnimation = gsap.to(splitUnits, {
          y: "0%",
          duration: 1,
          ease: "power4.out",
          stagger: 0.1,
          delay,
          paused: animateOnScroll,
        });

        if (animateOnScroll) {
          const scrollTrigger = ScrollTrigger.create({
            trigger: triggerElement,
            start: resolvedStart,
            animation: revealAnimation,
            once: true,
            refreshPriority: -1,
          });
          scrollTriggerRefs.current.push(scrollTrigger);
        }
      };

      buildAnimations();

      return () => {
        isActive = false;
        cleanupInstances();
      };
    },
    {
      scope: containerRef,
      dependencies: [
        animateOnScroll,
        delay,
        type,
        trigger,
        triggerPoint,
        start,
      ],
    },
  );

  if (Children.count(children) === 1 && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ ref?: unknown }>, {
      ref: containerRef,
    });
  }

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      data-copy-wrapper="true"
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Button */

interface ButtonProps {
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

const Button = forwardRef<HTMLAnchorElement, ButtonProps>(function Button(
  { href = "#", children, className = "", onClick },
  ref,
) {
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const hoverTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const { navigate } = useRouter();

  const buttonText = typeof children === "string" ? children : "";
  const characters = buttonText.split("");

  const mergeRefs = useCallback(
    (node: HTMLAnchorElement | null) => {
      buttonRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const defaultChars = button.querySelectorAll(".char-default");
    const hoverChars = button.querySelectorAll(".char-hover");

    gsap.set(defaultChars, { yPercent: 0 });
    gsap.set(hoverChars, { yPercent: -100 });

    const handleMouseEnter = () => {
      if (hoverTimelineRef.current) hoverTimelineRef.current.kill();
      const tl = gsap.timeline();
      tl.to(
        defaultChars,
        { yPercent: 100, duration: 0.3, ease: "power3.out", stagger: 0.01 },
        0,
      );
      tl.to(
        hoverChars,
        { yPercent: 0, duration: 0.3, ease: "power3.out", stagger: 0.01 },
        0.1,
      );
      hoverTimelineRef.current = tl;
    };

    const handleMouseLeave = () => {
      if (hoverTimelineRef.current) hoverTimelineRef.current.kill();
      const tl = gsap.timeline();
      tl.to(
        hoverChars,
        { yPercent: -100, duration: 0.4, ease: "power3.inOut", stagger: 0.01 },
        0,
      );
      tl.to(
        defaultChars,
        { yPercent: 0, duration: 0.4, ease: "power3.inOut", stagger: 0.01 },
        0.15,
      );
      hoverTimelineRef.current = tl;
    };

    let isHoverActive = false;
    const enableHover = () => {
      if (isHoverActive) return;
      button.addEventListener("mouseenter", handleMouseEnter);
      button.addEventListener("mouseleave", handleMouseLeave);
      isHoverActive = true;
    };
    const disableHover = () => {
      if (!isHoverActive) return;
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
      gsap.set(defaultChars, { yPercent: 0 });
      gsap.set(hoverChars, { yPercent: -100 });
      if (hoverTimelineRef.current) hoverTimelineRef.current.kill();
      isHoverActive = false;
    };
    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) disableHover();
      else enableHover();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      disableHover();
      window.removeEventListener("resize", handleResize);
      if (hoverTimelineRef.current) hoverTimelineRef.current.kill();
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    if (href && href !== "#" && href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <a
      href={href}
      className={`slide-button ${className}`}
      ref={mergeRefs}
      onClick={handleClick}
    >
      <div className="slide-button-bg" />
      <span className="slide-button-text">
        {characters.map((char, index) => (
          <span key={index} className="slide-char">
            <span className="char-default">{char === " " ? " " : char}</span>
            <span className="char-hover">{char === " " ? " " : char}</span>
          </span>
        ))}
      </span>
    </a>
  );
});

/* --------------------------------------------------------------- Preloader */

let isInitialLoad = true;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const EXIT_ANIMATION_MS = 700;

interface PreloaderProps {
  title?: string;
  duration?: number;
  buttonText?: string;
  buttonHref?: string;
  onEnter?: (event?: React.MouseEvent) => void;
  onAnimationComplete?: () => void;
}

function Preloader({
  title = "Salle Blanche",
  duration = 2600,
  buttonText = "Enter Website",
  buttonHref = "#",
  onEnter,
  onAnimationComplete,
}: PreloaderProps) {
  const lenis = useLenis();
  const [isVisible, setIsVisible] = useState(isInitialLoad);
  const [isScrollLocked, setIsScrollLocked] = useState(isInitialLoad);
  const [progress, setProgress] = useState(0);
  const [hasFinishedLoading, setHasFinishedLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isScrollLocked) {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
      return;
    }
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
    return () => {
      if (lenis) lenis.start();
      document.body.style.overflow = "";
    };
  }, [lenis, isScrollLocked]);

  useEffect(() => {
    if (!isVisible) return;
    let frameId: number | null = null;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = clamp(elapsed / duration, 0, 1);
      const percent = Math.round(ratio * 100);
      setProgress(percent);
      if (percent >= 100) {
        setHasFinishedLoading(true);
        return;
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [duration, isVisible]);

  const loadingText = useMemo(() => `Loading... ${progress}%`, [progress]);

  const handleEnterClick = (event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    if (!hasFinishedLoading || isExiting) return;
    if (onEnter) onEnter(event);
    setIsExiting(true);
    setIsScrollLocked(false);
    window.setTimeout(() => {
      isInitialLoad = false;
      setIsVisible(false);
      if (onAnimationComplete) onAnimationComplete();
    }, EXIT_ANIMATION_MS);
  };

  if (!isVisible) return null;

  return (
    <section
      className={`preloader ${isExiting ? "is-exiting" : ""}`}
      aria-label="Website preloader"
    >
      <div className="preloader-inner">
        <div className="preloader-title-wrap">
          <h2 className="preloader-title preloader-title-base">{title}</h2>
          <h2
            className="preloader-title preloader-title-fill"
            style={{ width: `${progress}%` }}
          >
            {title}
          </h2>
        </div>

        <div className="preloader-action-slot">
          <p
            className={`preloader-loading ${hasFinishedLoading ? "is-hidden" : ""} mono`}
            aria-live="polite"
          >
            {loadingText}
          </p>
          <div
            className={`preloader-button-wrap ${hasFinishedLoading ? "is-visible" : ""}`}
          >
            <Button
              href={buttonHref}
              onClick={handleEnterClick}
              className="preloader-enter-button"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- Nav */

const NAV_LINKS = [
  { label: "Home", href: "/", img: "menu/menu-home.jpg" },
  { label: "Essence", href: "/about", img: "menu/menu-essence.jpg" },
  { label: "Carte", href: "/menu", img: "menu/menu-carte.jpg" },
  { label: "Book", href: "/reservation", img: "menu/menu-book.jpg" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Google", href: "#" },
  { label: "OpenTable", href: "#" },
];

const LINK_TEXT_SELECTORS = [".nav-link a", ".nav-social a"];
const FOOTER_TEXT_SELECTORS = [".nav-menu-footer p span"];
const ALL_TEXT_SELECTORS = [...LINK_TEXT_SELECTORS, ...FOOTER_TEXT_SELECTORS];

function Nav({ rootRef }: { rootRef: React.RefObject<HTMLElement | null> }) {
  const { pathname, navigate } = useRouter();
  const lenis = useLenis();
  const asset = useAsset();

  const lenisInstanceRef = useRef<ReturnType<typeof useLenis> | null>(null);
  const isMenuOpenRef = useRef(false);
  const isMenuAnimatingRef = useRef(false);
  const previewImageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    lenisInstanceRef.current = lenis;
  }, [lenis]);

  const getPage = () =>
    rootRef.current?.querySelector<HTMLElement>(".page-wrapper") ?? null;

  useEffect(() => {
    if (isMenuOpenRef.current) forceCloseMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function lockScroll() {
    if (lenisInstanceRef.current) lenisInstanceRef.current.stop();
    document.body.style.overflow = "hidden";
  }
  function unlockScroll() {
    document.body.style.overflow = "";
    if (lenisInstanceRef.current) lenisInstanceRef.current.start();
  }
  function prunePreviewImages() {
    const container = previewImageRef.current;
    if (!container) return;
    const images = container.querySelectorAll("img");
    if (images.length > 3) {
      for (let i = 0; i < images.length - 3; i++)
        container.removeChild(images[i]);
    }
  }
  function resetPreviewImage() {
    const container = previewImageRef.current;
    if (!container) return;
    container.innerHTML = "";
    const defaultImg = document.createElement("img");
    defaultImg.src = asset(NAV_LINKS[0].img);
    container.appendChild(defaultImg);
  }
  function killMenuTextTweens() {
    gsap.killTweensOf(ALL_TEXT_SELECTORS);
  }
  function resetMenuTextToHidden() {
    gsap.set(LINK_TEXT_SELECTORS, { y: "140%", opacity: 0.25 });
    gsap.set(FOOTER_TEXT_SELECTORS, { y: "120%", opacity: 0.25 });
  }
  function animateToggleLabel(isOpening: boolean) {
    const openLabel = document.querySelector("#nav-toggle-open");
    const closeLabel = document.querySelector("#nav-toggle-close");
    gsap.to(isOpening ? openLabel : closeLabel, {
      x: -5,
      y: isOpening ? -10 : 10,
      rotation: isOpening ? -5 : 5,
      opacity: 0,
      delay: 0.25,
      duration: 0.5,
      ease: "power2.out",
    });
    gsap.to(isOpening ? closeLabel : openLabel, {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      delay: 0.5,
      duration: 0.5,
      ease: "power2.out",
    });
  }

  function openMenu() {
    if (isMenuAnimatingRef.current || isMenuOpenRef.current) return;
    isMenuAnimatingRef.current = true;
    const page = getPage();
    const scrollY = window.scrollY;
    lockScroll();
    if (page) {
      page.style.transformOrigin = `right ${scrollY}px`;
      gsap.to(page, {
        rotation: 10,
        x: 300,
        y: 450,
        scale: 1.5,
        duration: 1.25,
        ease: "power4.inOut",
      });
    }
    animateToggleLabel(true);
    killMenuTextTweens();
    resetMenuTextToHidden();
    gsap.to(".nav-menu-content", {
      rotation: 0,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 1.25,
      ease: "power4.inOut",
    });
    gsap.to(ALL_TEXT_SELECTORS, {
      y: "0%",
      opacity: 1,
      delay: 0.75,
      duration: 1,
      ease: "power3.out",
      stagger: 0.1,
    });
    gsap.to(".nav-menu-overlay", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 175%, 0% 100%)",
      duration: 1.25,
      ease: "power4.inOut",
      onComplete: () => {
        isMenuOpenRef.current = true;
        isMenuAnimatingRef.current = false;
      },
    });
  }

  function closeMenu() {
    if (isMenuAnimatingRef.current || !isMenuOpenRef.current) return;
    isMenuAnimatingRef.current = true;
    const page = getPage();
    if (page) {
      gsap.to(page, {
        rotation: 0,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.25,
        ease: "power4.inOut",
        onComplete: () => {
          gsap.set(page, { clearProps: "all" });
          page.style.transformOrigin = "";
        },
      });
    }
    animateToggleLabel(false);
    killMenuTextTweens();
    gsap.to(".nav-menu-content", {
      rotation: -15,
      x: -100,
      y: -100,
      scale: 1.5,
      opacity: 0.25,
      duration: 1.25,
      ease: "power4.inOut",
    });
    gsap.to(".nav-menu-overlay", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1.25,
      ease: "power4.inOut",
      onComplete: () => {
        isMenuOpenRef.current = false;
        isMenuAnimatingRef.current = false;
        resetMenuTextToHidden();
        resetPreviewImage();
        unlockScroll();
      },
    });
  }

  function forceCloseMenu() {
    const page = getPage();
    if (page) {
      gsap.set(page, { clearProps: "all" });
      page.style.transformOrigin = "";
    }
    killMenuTextTweens();
    gsap.set(".nav-menu-overlay", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    });
    gsap.set(".nav-menu-content", {
      rotation: -15,
      x: -100,
      y: -100,
      scale: 1.5,
      opacity: 0.25,
    });
    resetMenuTextToHidden();
    gsap.set("#nav-toggle-open", { x: 0, y: 0, rotation: 0, opacity: 1 });
    gsap.set("#nav-toggle-close", { x: -5, y: 10, rotation: 5, opacity: 0 });
    isMenuOpenRef.current = false;
    isMenuAnimatingRef.current = false;
    resetPreviewImage();
    unlockScroll();
  }

  function handleToggle() {
    if (!isMenuOpenRef.current) openMenu();
    else closeMenu();
  }

  function handleLinkHover(imageSrc: string) {
    if (!isMenuOpenRef.current || isMenuAnimatingRef.current) return;
    const container = previewImageRef.current;
    if (!container || !imageSrc) return;
    const currentImages = container.querySelectorAll("img");
    if (
      currentImages.length > 0 &&
      currentImages[currentImages.length - 1].src.endsWith(imageSrc)
    )
      return;
    const newImg = document.createElement("img");
    newImg.src = imageSrc;
    newImg.style.opacity = "0";
    newImg.style.transform = "scale(1.25) rotate(10deg)";
    container.appendChild(newImg);
    prunePreviewImages();
    gsap.to(newImg, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.75,
      ease: "power2.out",
    });
  }

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-logo">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <svg
              width="771"
              height="336"
              viewBox="0 0 771 336"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M101.2 111.802C101.2 138.802 83.0002 160.602 48.6002 160.602C32.2002 160.602 13.0002 156.402 0.000194997 152.002L16.4002 107.202H17.4002C25.4002 134.002 37.4002 152.602 58.2002 152.602C73.4002 152.602 81.8002 141.002 81.8002 129.202C81.8002 113.602 66.6002 107.202 50.2002 99.4016C31.4002 90.4016 11.2002 79.4016 11.2002 50.2016C11.2002 25.2016 29.0002 4.60155 59.4002 4.60155C71.4002 4.60155 83.6002 6.20156 94.4002 8.60155L83.4002 47.8016H82.4002C76.0002 28.0016 63.6002 12.6016 49.2002 12.6016C39.0002 12.6016 31.0002 21.0016 31.0002 32.6016C31.0002 50.0016 49.6002 56.0016 67.8002 65.2016C84.8002 73.8016 101.2 85.4016 101.2 111.802ZM130.424 157.002V157.602H94.6236V157.002C100.224 154.402 107.424 144.402 111.624 132.402L155.424 6.60155H157.824L203.024 132.002C208.624 147.602 213.024 154.002 218.824 157.002V157.602H160.424V157.002C166.624 153.802 171.624 145.402 167.024 131.802L161.024 113.802H126.024L119.824 132.202C115.624 144.802 124.424 153.802 130.424 157.002ZM128.624 105.802H158.224L143.424 62.0016L128.624 105.802ZM280.227 157.602H213.027V157.002C219.227 153.802 224.427 148.202 224.427 136.402V28.8016C224.427 19.0016 220.627 11.6016 213.027 8.20155V7.60155H267.827V8.20155C260.227 11.6016 256.427 19.0016 256.427 28.8016V136.602C256.427 147.202 260.427 152.002 267.027 152.002C278.427 152.002 294.227 131.602 308.427 112.402L309.227 112.802L299.027 165.202H298.427C294.027 160.202 288.027 157.602 280.227 157.602ZM376.516 157.602H309.316V157.002C315.516 153.802 320.716 148.202 320.716 136.402V28.8016C320.716 19.0016 316.916 11.6016 309.316 8.20155V7.60155H364.116V8.20155C356.516 11.6016 352.716 19.0016 352.716 28.8016V136.602C352.716 147.202 356.716 152.002 363.316 152.002C374.716 152.002 390.516 131.602 404.716 112.402L405.516 112.802L395.316 165.202H394.716C390.316 160.202 384.316 157.602 376.516 157.602ZM405.605 7.60155H481.605C489.405 7.60155 496.205 5.00156 500.005 0.00155306H500.605L508.005 49.4016L507.205 49.8016C493.605 29.8016 480.805 13.2016 462.005 13.2016C453.605 13.2016 448.805 18.0016 448.805 28.6016V72.6016H466.205C477.205 72.6016 487.005 68.0016 495.205 54.0016H495.805V98.8016H495.205C486.405 86.8016 477.205 79.6016 466.405 79.6016H448.805V136.602C448.805 147.202 453.605 152.002 462.005 152.002C482.205 152.002 496.605 134.002 511.805 112.602L512.405 112.802L502.205 165.202H501.205C497.005 160.202 491.205 157.602 483.405 157.602H405.605V157.002C411.805 153.802 417.005 148.202 417.005 136.402V28.8016C417.005 19.0016 413.205 11.6016 405.605 8.20155V7.60155ZM117.6 288.002C117.6 312.602 97.0002 329.602 58.0002 329.602C39.8002 329.602 23.0002 328.202 5.8002 325.602V325.002C13.4002 321.602 17.2002 314.202 17.2002 304.402V200.602C17.2002 190.802 13.4002 183.602 5.8002 180.202V179.602C22.0002 177.002 38.2002 175.602 55.4002 175.602C90.8002 175.602 109 188.402 109 207.202C109 227.202 92.2002 239.202 73.6002 243.402C96.2002 248.002 117.6 262.802 117.6 288.002ZM49.0002 196.602V239.802H53.2002C67.6002 239.802 75.8002 228.802 75.8002 210.202C75.8002 192.802 69.0002 182.002 58.2002 182.002C52.2002 182.002 49.0002 187.202 49.0002 196.602ZM49.0002 308.602C49.0002 318.002 53.0002 323.202 60.6002 323.202C73.8002 323.202 82.4002 307.602 82.4002 283.402C82.4002 260.402 72.0002 247.202 53.2002 247.202H49.0002V308.602ZM188.039 327.602H120.839V327.002C127.039 323.802 132.239 318.202 132.239 306.402V198.802C132.239 189.002 128.439 181.602 120.839 178.202V177.602H175.639V178.202C168.039 181.602 164.239 189.002 164.239 198.802V306.602C164.239 317.202 168.239 322.002 174.839 322.002C186.239 322.002 202.039 301.602 216.239 282.402L217.039 282.802L206.839 335.202H206.239C201.839 330.202 195.839 327.602 188.039 327.602ZM243.705 327.002V327.602H207.905V327.002C213.505 324.402 220.705 314.402 224.905 302.402L268.705 176.602H271.105L316.305 302.002C321.905 317.602 326.305 324.002 332.105 327.002V327.602H273.705V327.002C279.905 323.802 284.905 315.402 280.305 301.802L274.305 283.802H239.305L233.105 302.202C228.905 314.802 237.705 323.802 243.705 327.002ZM241.905 275.802H271.505L256.705 232.002L241.905 275.802ZM423.308 204.802V331.602H422.908L345.708 219.402V300.402C345.708 312.802 350.508 323.202 357.908 327.002V327.602H325.708V327.002C332.908 323.202 337.708 312.802 337.708 300.402V198.802C337.708 191.002 333.908 181.602 326.308 178.202V177.602H358.708L415.308 262.002V204.802C415.308 195.602 412.308 182.202 403.508 178.202V177.602H433.908V178.202C426.108 181.802 423.308 195.602 423.308 204.802ZM499.278 174.602C514.478 174.602 527.478 177.602 535.878 181.402L516.878 230.202H516.478C510.078 200.802 500.478 183.402 487.278 183.402C472.878 183.402 464.278 205.402 464.278 235.402C464.278 276.402 479.078 302.202 502.878 302.202C517.078 302.202 528.278 293.202 534.478 275.202L535.478 275.402C532.078 313.202 511.078 330.602 488.478 330.602C460.878 330.602 437.878 301.602 437.878 255.202C437.878 210.002 465.878 174.602 499.278 174.602ZM592.631 327.002V327.602H537.831V327.002C544.031 323.802 549.231 316.202 549.231 306.402V198.802C549.231 191.002 545.431 181.602 537.831 178.202V177.602H592.631V178.202C585.031 181.602 581.231 191.002 581.231 198.802V230.802H616.631V198.802C616.631 191.002 612.631 181.602 605.231 178.202V177.602H660.231V178.202C652.631 181.602 648.631 191.002 648.631 198.802V306.402C648.631 316.202 653.831 323.802 660.231 327.002V327.602H605.231V327.002C611.231 323.802 616.631 316.202 616.631 306.402V237.802H581.231V306.402C581.231 316.202 586.231 323.802 592.631 327.002ZM663.417 177.602H739.417C747.217 177.602 754.017 175.002 757.817 170.002H758.417L765.817 219.402L765.017 219.802C751.417 199.802 738.617 183.202 719.817 183.202C711.417 183.202 706.617 188.002 706.617 198.602V242.602H724.017C735.017 242.602 744.817 238.002 753.017 224.002H753.617V268.802H753.017C744.217 256.802 735.017 249.602 724.217 249.602H706.617V306.602C706.617 317.202 711.417 322.002 719.817 322.002C740.017 322.002 754.417 304.002 769.617 282.602L770.217 282.802L760.017 335.202H759.017C754.817 330.202 749.017 327.602 741.217 327.602H663.417V327.002C669.617 323.802 674.817 318.202 674.817 306.402V198.802C674.817 189.002 671.017 181.602 663.417 178.202V177.602Z"
                fill="#E0DED1"
              />
            </svg>
          </a>
        </div>

        <div className="nav-toggle" onClick={handleToggle}>
          <p id="nav-toggle-open">Menu</p>
          <p id="nav-toggle-close">Close</p>
        </div>
      </nav>

      <div className="nav-menu-overlay">
        <div className="nav-menu-content">
          <div className="nav-menu-items">
            <div className="nav-col-lg">
              <div className="nav-preview-img" ref={previewImageRef}>
                <img src={asset(NAV_LINKS[0].img)} alt="" />
              </div>
            </div>

            <div className="nav-col-sm">
              <div className="nav-menu-links">
                {NAV_LINKS.map((link) => (
                  <div className="nav-link" key={link.label}>
                    <a
                      href={link.href}
                      data-img={asset(link.img)}
                      onMouseOver={() => handleLinkHover(asset(link.img))}
                      onFocus={() => handleLinkHover(asset(link.img))}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(link.href);
                      }}
                    >
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>

              <div className="nav-menu-socials">
                {SOCIAL_LINKS.map((social) => (
                  <div className="nav-social" key={social.label}>
                    <a href={social.href}>{social.label}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="nav-menu-footer">
            <p className="sm">
              <span>Since 1984</span>
            </p>
            <p className="sm">
              <span>Florence, IT</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ Footer */

const POSTCARDS = [
  { image: "footer/footer-img-1.jpg", rotation: -8, x: "-25%" },
  { image: "footer/footer-img-2.jpg", rotation: 6, x: "20%" },
  { image: "footer/footer-img-3.jpg", rotation: -4, x: "-15%" },
  { image: "footer/footer-img-4.jpg", rotation: 10, x: "25%" },
  { image: "footer/footer-img-5.jpg", rotation: -12, x: "-10%" },
];

function Footer() {
  const { pathname } = useRouter();
  const asset = useAsset();
  const sectionRef = useRef<HTMLElement | null>(null);
  const visitButtonRef = useRef<HTMLAnchorElement | null>(null);
  const visitButtonContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const heading = sectionRef.current?.querySelector(".footer-heading");
    const buttonContainer = visitButtonContainerRef.current;
    if (!heading || !buttonContainer) return;
    gsap.set(buttonContainer, { autoAlpha: 0, y: 40 });
    const scrollTrigger = ScrollTrigger.create({
      trigger: heading,
      start: "top 50%",
      once: true,
      onEnter: () => {
        gsap.to(buttonContainer, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
        });
      },
    });
    return () => scrollTrigger.kill();
  }, [pathname]);

  useEffect(() => {
    const section = sectionRef.current;
    const button = visitButtonRef.current;
    if (!section || !button) return;
    const cards = gsap.utils.toArray<HTMLElement>(
      section.querySelectorAll(".footer-postcard"),
    );
    const postcardsContainer =
      section.querySelector<HTMLElement>(".footer-postcards");
    if (!cards.length || !postcardsContainer) return;
    const postcardTimeline = gsap.timeline({ paused: true });
    cards.forEach((card, index) => {
      const cardData = POSTCARDS[index];
      if (!cardData) return;
      postcardTimeline.fromTo(
        card,
        { yPercent: 250, xPercent: 0, rotation: 0 },
        {
          yPercent: 55,
          xPercent: parseFloat(cardData.x),
          rotation: cardData.rotation,
          duration: 0.8,
          ease: "power3.out",
        },
        index * 0.07,
      );
    });
    const handleMouseEnter = () => postcardTimeline.play();
    const handleMouseLeave = () => postcardTimeline.reverse();
    let isHoverActive = false;
    const enableHover = () => {
      if (isHoverActive) return;
      button.addEventListener("mouseenter", handleMouseEnter);
      button.addEventListener("mouseleave", handleMouseLeave);
      postcardsContainer.style.display = "";
      isHoverActive = true;
    };
    const disableHover = () => {
      if (!isHoverActive) return;
      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);
      postcardTimeline.pause(0);
      postcardsContainer.style.display = "none";
      isHoverActive = false;
    };
    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) disableHover();
      else enableHover();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      disableHover();
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);

  return (
    <footer className="footer" ref={sectionRef}>
      <div className="footer-content">
        <div className="footer-heading">
          <Copy key={`heading-${pathname}`} type="lines" animateOnScroll>
            <h2>We Look Forward To Your Visit</h2>
          </Copy>
        </div>
        <div className="footer-button-container" ref={visitButtonContainerRef}>
          <Button href="/reservation" ref={visitButtonRef}>
            Plan Your Visit
          </Button>
        </div>
      </div>

      <div className="footer-postcards">
        {POSTCARDS.map((card, index) => (
          <div className="footer-postcard" key={index}>
            <img src={asset(card.image)} alt="Salle Blanche" />
          </div>
        ))}
      </div>

      <div className="footer-bar">
        <div className="footer-bar-left">
          <Copy
            key={`left-${pathname}`}
            type="lines"
            trigger=".footer-heading"
            animateOnScroll
          >
            <p className="sm">&copy;2025 All Rights Reserved</p>
          </Copy>
        </div>
        <div className="footer-bar-right">
          <Copy
            key={`right-${pathname}`}
            type="lines"
            trigger=".footer-heading"
            animateOnScroll
          >
            <p className="sm">Built by BLANK</p>
          </Copy>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------- DiningMenu */

interface DiningItem {
  name: string;
  weight?: string;
  size?: string;
  price: string;
  description?: string;
}
interface DiningGroup {
  title: string;
  items: DiningItem[];
}
interface DiningCategory {
  category: string;
  items?: DiningItem[];
  groups?: DiningGroup[];
}

const diningMenu: DiningCategory[] = [
  {
    category: "Breakfast",
    items: [
      {
        name: "Bread with Egg",
        weight: "250 g",
        price: "€6.50",
        description:
          "Sourdough bread, soft-boiled eggs (x2), whipped butter, cottage cheese, radish, chives",
      },
      {
        name: "Eggs Benedict",
        weight: "370 g",
        price: "€7.50",
        description:
          "Sourdough toast, poached eggs (x2), hollandaise sauce, basil pesto, grilled broad beans",
      },
      {
        name: "Omelet with Zucchini and Feta",
        weight: "350 g",
        price: "€7.00",
        description:
          "Omelet, grilled zucchini, raspberry tomato, feta, olive oil, sourdough wheat bread",
      },
      {
        name: "Bread with Burrata and Pesto",
        weight: "400 g",
        price: "€7.50",
        description:
          "Sourdough wheat bread, burrata, basil pesto, raspberry tomato, pistachios",
      },
      {
        name: "Toast with Broad Bean Paste",
        weight: "320 g",
        price: "€6.50",
        description:
          "Milk toast, broad bean & feta paste, broad beans, pickled beets, pistachios",
      },
    ],
  },
  {
    category: "Foodsharing",
    items: [
      {
        name: "Beef Tartare",
        weight: "180 g",
        price: "€10.00",
        description:
          "Beef tenderloin, onion, pickled cucumber, egg yolk, mustard, bread",
      },
      {
        name: "Burrata",
        weight: "250 g",
        price: "€8.50",
        description:
          "Burrata, grilled zucchini, tomatoes, pistachios, basil pesto, bread",
      },
      {
        name: "Shrimp",
        weight: "200 g",
        price: "€10.50",
        description: "Shrimp, garlic, chili, parsley, olive oil, bread",
      },
      {
        name: "Fish Soup",
        weight: "300 g",
        price: "€8.00",
        description:
          "Fish broth, cod, salmon, shrimp, vegetables, herbs, bread",
      },
    ],
  },
  {
    category: "Pizza",
    items: [
      {
        name: "Margherita",
        weight: "450 g",
        price: "€6.50",
        description: "Tomato sauce, mozzarella, basil",
      },
      {
        name: "Pepperoni",
        weight: "480 g",
        price: "€7.50",
        description: "Tomato sauce, mozzarella, pepperoni, oregano",
      },
      {
        name: "Capricciosa",
        weight: "500 g",
        price: "€8.00",
        description:
          "Tomato sauce, mozzarella, ham, mushrooms, artichokes, olives",
      },
      {
        name: "Prosciutto e Rucola",
        weight: "480 g",
        price: "€8.50",
        description: "Tomato sauce, mozzarella, prosciutto, arugula, parmesan",
      },
      {
        name: "Musa",
        weight: "500 g",
        price: "€9.50",
        description:
          "Artichoke cream, fior di latte, grilled pepper, guanciale, pecorino romano, basil",
      },
    ],
  },
  {
    category: "Drinks",
    groups: [
      {
        title: "Coffee",
        items: [
          { name: "Doppio", size: "38 ml", price: "€2.00" },
          { name: "Filter", size: "250 ml", price: "€3.00" },
          { name: "Flat White", size: "150 ml", price: "€3.50" },
          { name: "Caffè Latte", size: "250 ml", price: "€3.50" },
          { name: "Oat Milk", price: "+€0.50" },
        ],
      },
      {
        title: "Cold Coffee",
        items: [
          { name: "Espresso Tonic", size: "250 ml", price: "€3.50" },
          { name: "Iced Latte", size: "250 ml", price: "€3.50" },
          { name: "Espresso Orange", size: "160 ml", price: "€4.50" },
        ],
      },
    ],
  },
  {
    category: "Ice Cream",
    items: [
      {
        name: "Coffee",
        price: "€2.00",
        description: "Cream soft serve with coffee sprinkles and espresso",
      },
      {
        name: "Olive Oil",
        price: "€2.50",
        description: "Cream soft serve with olive oil and salt flakes",
      },
      {
        name: "Matcha",
        price: "€3.50",
        description: "Cream soft serve with a shot of matcha",
      },
      {
        name: "Cherry",
        price: "€3.00",
        description: "Cream soft serve with homemade cherry sauce",
      },
    ],
  },
];

function DiningMenu() {
  const asset = useAsset();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isFirstCategory = activeIndex === 0;
  const isLastCategory = activeIndex === diningMenu.length - 1;
  const activeMenu = diningMenu[activeIndex];

  const handlePrev = () => {
    if (!isFirstCategory) setActiveIndex((prev) => prev - 1);
  };
  const handleNext = () => {
    if (!isLastCategory) setActiveIndex((prev) => prev + 1);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const navButtons = section.querySelectorAll(".dining-nav-button-wrapper");
    const previewCard = section.querySelector(".dining-preview-card");
    const minimapItems = section.querySelectorAll(".dining-minimap-item");
    gsap.set(navButtons, { scale: 0 });
    gsap.set(previewCard, { autoAlpha: 0, y: 50 });
    gsap.set(minimapItems, { autoAlpha: 0, y: 30 });
    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 30%",
      once: true,
      onEnter: () => {
        gsap.to(navButtons, {
          scale: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
        });
        gsap.to(previewCard, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        });
        gsap.to(minimapItems, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1,
        });
      },
    });
    return () => scrollTrigger.kill();
  }, []);

  return (
    <section className="dining-menu" ref={sectionRef}>
      <div className="dining-menu-bg">
        <img src={asset("dining-menu/dining-menu.jpg")} alt="" />
      </div>

      <div className="container">
        <div className="dining-menu-header">
          <Copy type="words" animateOnScroll>
            <h3>Our Menu</h3>
          </Copy>
        </div>

        <div className="dining-menu-content">
          <div className="dining-nav">
            <div className="dining-nav-button-wrapper">
              <button
                type="button"
                className={`dining-nav-button ${isFirstCategory ? "disabled" : ""}`}
                disabled={isFirstCategory}
                onClick={handlePrev}
              >
                <HiOutlineArrowUp />
              </button>
            </div>
            <div className="dining-nav-button-wrapper">
              <button
                type="button"
                className={`dining-nav-button ${isLastCategory ? "disabled" : ""}`}
                disabled={isLastCategory}
                onClick={handleNext}
              >
                <HiOutlineArrowDown />
              </button>
            </div>
          </div>

          <div className="dining-preview">
            <div className="dining-preview-card">
              <h6>{activeMenu.category}</h6>

              {activeMenu.items?.map((item, index) => (
                <div key={index} className="dining-preview-item">
                  <div className="dining-preview-item-row">
                    <p>
                      {item.name} {item.weight}
                    </p>
                    <p>{item.price}</p>
                  </div>
                  {item.description && (
                    <p className="dining-preview-item-description">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}

              {activeMenu.groups?.map((group, groupIndex) => (
                <div key={groupIndex} className="dining-preview-group">
                  <div className="dining-preview-group-header">
                    <span></span>
                    <p className="mono">{group.title}</p>
                    <span></span>
                  </div>
                  {group.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="dining-preview-item-row">
                      <p>
                        {item.name} {item.size || ""}
                      </p>
                      <p>{item.price}</p>
                    </div>
                  ))}
                </div>
              ))}

              <div className="dining-preview-footer">
                <p>Salle Blanche</p>
              </div>
            </div>
          </div>

          <div className="dining-minimap">
            {diningMenu.map((menu, index) => (
              <div
                key={index}
                className={`dining-minimap-item ${index === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                <div className="dining-minimap-img">
                  <img
                    src={asset(
                      `dining-menu/dining-menu-${menu.category.toLowerCase().replaceAll(" ", "-")}.jpg`,
                    )}
                    alt={menu.category}
                  />
                </div>
                <p>{menu.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Testimonials */

interface Testimonial {
  name: string;
  profilePicture: string;
  review: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Sophie Laurent",
    profilePicture: "testimonials/sophie.jpg",
    review:
      "An unforgettable evening in a romantic setting. Every detail was crafted with precision, from the candlelit ambiance to the exquisite plating.",
    rating: 5,
  },
  {
    name: "Olivia Robinson",
    profilePicture: "testimonials/olivia.jpg",
    review:
      "Each dish looked like a work of art, from the amuse-bouche to dessert. I left impressed by both the flavors and the professionalism of the staff.",
    rating: 5,
  },
  {
    name: "Lucas Meyer",
    profilePicture: "testimonials/lucas.jpg",
    review:
      "I loved the harmony between textures and flavors in every dish. This place proves that luxury dining can still feel warm and welcoming.",
    rating: 5,
  },
  {
    name: "Fine Laurent",
    profilePicture: "testimonials/fine.jpg",
    review:
      "Flawless from start to finish. The tasting menu felt like a journey through seasons, and the sommelier's pairings were extraordinary.",
    rating: 5,
  },
  {
    name: "Emma Dubois",
    profilePicture: "testimonials/emma.jpg",
    review:
      "A culinary masterpiece. The attention to detail in every course was remarkable, and the service was impeccable throughout the evening.",
    rating: 5,
  },
  {
    name: "James Chen",
    profilePicture: "testimonials/james.jpg",
    review:
      "The perfect blend of classic technique and modern creativity. Each bite told a story, and the atmosphere was nothing short of magical.",
    rating: 4,
  },
  {
    name: "Clara Fontaine",
    profilePicture: "testimonials/clara.jpg",
    review:
      "From the moment we walked in, we felt transported. The wine selection is phenomenal, and the duck confit was the best I've ever had.",
    rating: 5,
  },
];

const CARD_GAP = 20;
const LERP_FACTOR = 0.075;
const VELOCITY_DAMPING = 0.95;
const VELOCITY_THRESHOLD = 0.05;

function StarRating({ count }: { count: number }) {
  return (
    <div className="testimonial-stars">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < count ? "star filled" : "star"}>
          {"★"}
        </span>
      ))}
    </div>
  );
}

function Testimonials() {
  const asset = useAsset();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideByRef = useRef<((direction: number) => void) | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const navButtons = section.querySelectorAll(
      ".testimonials-nav-button-wrapper",
    );
    const cards = section.querySelectorAll(".testimonial-card");
    gsap.set(navButtons, { scale: 0 });
    gsap.set(cards, { scale: 0.85, autoAlpha: 0 });
    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      once: true,
      onEnter: () => {
        gsap.to(navButtons, {
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.1,
          delay: 0.4,
        });
        gsap.to(cards, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.3,
        });
      },
    });
    return () => scrollTrigger.kill();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = gsap.utils.toArray<HTMLElement>(
      track.querySelectorAll(".testimonial-card"),
    );
    const cardCount = cards.length;
    if (!cardCount) return;
    const cardWidth = cards[0].offsetWidth;
    const itemWidth = cardWidth + CARD_GAP;
    const totalWidth = cardCount * itemWidth;
    gsap.set(cards, {
      position: "absolute",
      left: 0,
      top: 0,
      x: (index: number) => index * itemWidth,
    });
    gsap.set(track, { height: cards[0].offsetHeight });
    const wrapPosition = gsap.utils.wrap(-itemWidth, totalWidth - itemWidth);
    let targetX = 0;
    let currentX = 0;
    let isDragging = false;
    let dragStartPointerX = 0;
    let dragStartTargetX = 0;
    let velocityX = 0;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    slideByRef.current = (direction: number) => {
      velocityX = 0;
      targetX += direction * itemWidth;
    };
    const updateCardPositions = () => {
      if (!isDragging) {
        targetX += velocityX;
        velocityX *= VELOCITY_DAMPING;
        if (Math.abs(velocityX) < VELOCITY_THRESHOLD) velocityX = 0;
      }
      currentX += (targetX - currentX) * LERP_FACTOR;
      cards.forEach((card, index) => {
        gsap.set(card, { x: wrapPosition(index * itemWidth + currentX) });
      });
    };
    gsap.ticker.add(updateCardPositions);
    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      dragStartPointerX = e.clientX;
      dragStartTargetX = targetX;
      velocityX = 0;
      lastPointerX = e.clientX;
      lastPointerTime = Date.now();
      track.setPointerCapture(e.pointerId);
      track.style.cursor = "grabbing";
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dragDelta = e.clientX - dragStartPointerX;
      targetX = dragStartTargetX + dragDelta;
      const now = Date.now();
      const timeDelta = now - lastPointerTime;
      if (timeDelta > 0) {
        velocityX = ((e.clientX - lastPointerX) / timeDelta) * 16;
        lastPointerX = e.clientX;
        lastPointerTime = now;
      }
    };
    const handlePointerUp = () => {
      isDragging = false;
      track.style.cursor = "grab";
    };
    let isDragEnabled = false;
    const enableDrag = () => {
      if (isDragEnabled) return;
      track.addEventListener("pointerdown", handlePointerDown);
      track.addEventListener("pointermove", handlePointerMove);
      track.addEventListener("pointerup", handlePointerUp);
      track.addEventListener("pointercancel", handlePointerUp);
      track.style.cursor = "grab";
      track.style.touchAction = "none";
      isDragEnabled = true;
    };
    const disableDrag = () => {
      if (!isDragEnabled) return;
      track.removeEventListener("pointerdown", handlePointerDown);
      track.removeEventListener("pointermove", handlePointerMove);
      track.removeEventListener("pointerup", handlePointerUp);
      track.removeEventListener("pointercancel", handlePointerUp);
      track.style.cursor = "default";
      track.style.touchAction = "auto";
      isDragging = false;
      isDragEnabled = false;
    };
    const handleResize = () => {
      if (window.innerWidth < MOBILE_BREAKPOINT) disableDrag();
      else enableDrag();
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      gsap.ticker.remove(updateCardPositions);
      disableDrag();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlePrev = useCallback(() => slideByRef.current?.(1), []);
  const handleNext = useCallback(() => slideByRef.current?.(-1), []);

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="container">
        <div className="testimonials-header">
          <Copy type="lines" animateOnScroll>
            <h3>What our clients say</h3>
          </Copy>
          <div className="testimonials-nav">
            <div className="testimonials-nav-button-wrapper">
              <button
                type="button"
                className="testimonials-nav-button"
                onClick={handlePrev}
              >
                <HiOutlineArrowLeft />
              </button>
            </div>
            <div className="testimonials-nav-button-wrapper">
              <button
                type="button"
                className="testimonials-nav-button"
                onClick={handleNext}
              >
                <HiOutlineArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="testimonials-carousel">
        <div className="testimonials-track" ref={trackRef}>
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-card" key={index}>
              <div className="testimonial-content">
                <span className="testimonial-quote-mark">"</span>
                <p>{testimonial.review}</p>
              </div>
              <div className="testimonial-author">
                <div className="testimonial-author-img">
                  <img
                    src={asset(testimonial.profilePicture)}
                    alt={testimonial.name}
                  />
                </div>
                <div className="testimonial-author-info">
                  <h6 className="testimonial-author-name">
                    {testimonial.name}
                  </h6>
                  <StarRating count={testimonial.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- CTA */

function CTA() {
  const asset = useAsset();
  const sectionRef = useRef<HTMLElement | null>(null);
  const circleButtonRef = useRef<HTMLDivElement | null>(null);
  const circlePathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const circlePath = circlePathRef.current;
    if (!section || !circlePath) return;
    const pathLength = circlePath.getTotalLength();
    const image = section.querySelector(".cta-image");
    gsap.set(circlePath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
      rotation: -90,
      transformOrigin: "center center",
    });
    gsap.set(image, { autoAlpha: 0, scale: 0.75 });
    const scrollTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      once: true,
      onEnter: () => {
        gsap.to(circlePath, {
          strokeDashoffset: 0,
          duration: 1.2,
          delay: 0.6,
          ease: "power2.inOut",
        });
        gsap.to(image, {
          autoAlpha: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        });
      },
    });
    return () => scrollTrigger.kill();
  }, []);

  useEffect(() => {
    const button = circleButtonRef.current;
    const circlePath = circlePathRef.current;
    if (!button || !circlePath) return;
    const pathLength = circlePath.getTotalLength();
    let hoverTimeline: gsap.core.Timeline | null = null;
    const handleMouseEnter = () => {
      if (hoverTimeline) hoverTimeline.kill();
      hoverTimeline = gsap.timeline();
      hoverTimeline
        .set(circlePath, {
          strokeDashoffset: 0,
          strokeDasharray: pathLength,
          scale: 1,
        })
        .to(circlePath, {
          strokeDashoffset: -pathLength,
          duration: 0.75,
          ease: "power2.inOut",
        })
        .set(circlePath, { strokeDashoffset: pathLength })
        .to(circlePath, {
          strokeDashoffset: 0,
          duration: 0.75,
          ease: "power2.inOut",
        });
    };
    button.addEventListener("mouseenter", handleMouseEnter);
    return () => {
      button.removeEventListener("mouseenter", handleMouseEnter);
      if (hoverTimeline) hoverTimeline.kill();
    };
  }, []);

  return (
    <section className="cta" ref={sectionRef}>
      <div className="container">
        <div className="cta-content">
          <Copy type="lines" animateOnScroll trigger=".cta" start="top 80%">
            <h6>A table awaits</h6>
          </Copy>
          <Copy type="lines" animateOnScroll trigger=".cta" start="top 80%">
            <h5>
              Settle into a space where the pace softens and each course arrives
              with quiet intention.
            </h5>
          </Copy>
          <div className="cta-details">
            <div className="cta-address">
              <Copy
                type="lines"
                animateOnScroll
                trigger=".cta"
                start="top 80%"
                delay={0.3}
              >
                <p className="mono">Piazza Santo Spirito 8</p>
                <p className="mono">Firenze, IT 50125</p>
              </Copy>
            </div>
            <div className="cta-hours">
              <Copy
                type="lines"
                animateOnScroll
                trigger=".cta"
                start="top 80%"
                delay={0.3}
              >
                <p className="mono">LUN–VEN 19:00–23:00</p>
                <p className="mono">SAB–DOM 18:30–23:30</p>
              </Copy>
            </div>
          </div>
          <div className="cta-circle-button" ref={circleButtonRef}>
            {/* biome-ignore lint/a11y/useValidAnchor: decorative CTA anchor preserved from source markup */}
            <a href="#" className="cta-button">
              <svg
                className="cta-button-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
              >
                <path
                  ref={circlePathRef}
                  d="M50,10 A40,40 0 1,1 49.9999,10"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  fill="none"
                />
              </svg>
              <Copy
                type="lines"
                animateOnScroll
                trigger=".cta"
                start="top 80%"
                delay={0.5}
              >
                <span>Take a Table</span>
              </Copy>
            </a>
          </div>
        </div>

        <div className="cta-image">
          <img src={asset("cta/cta-img.jpg")} alt="Restaurant interior" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- ImageBanner */

function ImageBanner({
  image = "image-banner/image-banner.jpg",
  heading = ["More", "Than", "Stay"],
  description = "Salle Blanche, every detail is designed to make you feel at home with the elegance of Florence just beyond your door.",
}: {
  image?: string;
  heading?: string[];
  description?: string;
}) {
  const asset = useAsset();
  return (
    <section className="image-banner">
      <div className="image-banner-bg">
        <img src={asset(image)} alt="" />
      </div>
      <div className="container">
        <Copy type="lines" animateOnScroll>
          {heading.map((word, index) => (
            <h4 key={index}>{word}</h4>
          ))}
        </Copy>
        <div className="image-banner-footer">
          <Copy
            type="lines"
            trigger=".image-banner"
            start="top 50%"
            delay={0.5}
          >
            <p>{description}</p>
          </Copy>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Marquee */

const MARQUEE_TEXT = "Enduring Taste";
const MARQUEE_REPEAT_COUNT = 12;

function Marquee() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = track.querySelectorAll<HTMLElement>(".marquee-item");
    if (!items.length) return;
    const itemWidth = items[0].offsetWidth;
    const halfLoopWidth = itemWidth * (MARQUEE_REPEAT_COUNT / 2);
    const scrollTween = gsap.to(track, {
      x: -halfLoopWidth,
      duration: 30,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(
          (x: number) => parseFloat(String(x)) % halfLoopWidth,
        ),
      },
    });
    const pill = track.parentElement;
    if (!pill) return;
    const handleMouseEnter = () =>
      gsap.to(scrollTween, { timeScale: 0, duration: 0.5 });
    const handleMouseLeave = () =>
      gsap.to(scrollTween, { timeScale: 1, duration: 0.5 });
    pill.addEventListener("mouseenter", handleMouseEnter);
    pill.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      pill.removeEventListener("mouseenter", handleMouseEnter);
      pill.removeEventListener("mouseleave", handleMouseLeave);
      scrollTween.kill();
    };
  }, []);

  return (
    <section className="marquee">
      <div className="container">
        <div className="marquee-content">
          <h1>Since 1984</h1>
          <h3>Art of Stillness</h3>
        </div>
        <div className="marquee-pill">
          <div className="marquee-track" ref={trackRef}>
            {Array.from({ length: MARQUEE_REPEAT_COUNT }, (_, index) => (
              <span className="marquee-item" key={index}>
                {MARQUEE_TEXT}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- StickyCards */

const STICKY_CARDS = [
  {
    title: "The Craft",
    description:
      "Guided by quiet precision, each plate is shaped with intention, allowing technique and creativity to meet in a calm balance.",
    image: "about/sticky-card-1.jpg",
  },
  {
    title: "The Beginning",
    description:
      "What started as a simple pursuit of honesty in cooking became a space where detail, warmth, and restraint define every moment.",
    image: "about/sticky-card-2.jpg",
  },
  {
    title: "The Experience",
    description:
      "An atmosphere composed of light, texture, and stillness invites every sense to settle in, creating a presence that lingers.",
    image: "about/sticky-card-3.jpg",
  },
  {
    title: "The Flavors",
    description:
      "Seasonal ingredients are treated with clarity and respect, forming subtle layers that reveal themselves slowly with each bite.",
    image: "about/sticky-card-4.jpg",
  },
  {
    title: "The Future",
    description:
      "With curiosity as its compass, the kitchen continues to evolve, exploring new ideas while honoring the foundations that shaped it.",
    image: "about/sticky-card-5.jpg",
  },
  {
    title: "The Legacy",
    description:
      "Built one dish at a time, the restaurant's story reflects years of dedication, forming a quiet tradition that endures with grace.",
    image: "about/sticky-card-6.jpg",
  },
];

function StickyCards() {
  const asset = useAsset();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ctx: gsap.Context | undefined;
    const section = sectionRef.current;
    if (!section) return;

    const buildScrollAnimation = () => {
      if (ctx) ctx.revert();
      const cardElements = section.querySelectorAll(".sticky-card");
      cardElements.forEach((card) => {
        gsap.set(card, { clearProps: "all" });
      });
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        section.classList.add("sticky-cards-mobile");
        return;
      }
      section.classList.remove("sticky-cards-mobile");
      requestAnimationFrame(() => {
        ctx = gsap.context(() => {
          const cards = gsap.utils.toArray<HTMLElement>(".sticky-card");
          const totalCards = cards.length;
          const lastLeftColumnIndex =
            totalCards % 2 === 0 ? totalCards - 2 : totalCards - 1;
          const lastRightColumnIndex =
            totalCards % 2 === 0 ? totalCards - 1 : totalCards - 2;
          cards.forEach((card, index) => {
            const isLastInColumn =
              index === lastLeftColumnIndex || index === lastRightColumnIndex;
            if (isLastInColumn) return;
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: card,
                  start: "bottom top",
                  end: "+=100%",
                  scrub: true,
                },
              })
              .to(card, { yPercent: -100, ease: "none" });
          });
          ScrollTrigger.refresh();
        }, sectionRef);
      });
    };

    let wasMobile = window.innerWidth < MOBILE_BREAKPOINT;
    buildScrollAnimation();
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (isMobile !== wasMobile) {
        wasMobile = isMobile;
        buildScrollAnimation();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div className="sticky-cards" ref={sectionRef}>
      {STICKY_CARDS.map((card, index) => (
        <div className="sticky-card" key={index}>
          <div className="sticky-card-img">
            <img src={asset(card.image)} alt={card.title} />
          </div>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- Chefs */

const CHEFS = [
  { name: "Laurent", image: "chefs/avatar1.jpg" },
  { name: "Camille", image: "chefs/avatar2.jpg" },
  { name: "Nicolas", image: "chefs/avatar3.jpg" },
  { name: "Isabelle", image: "chefs/avatar4.jpg" },
  { name: "Matthieu", image: "chefs/avatar5.jpg" },
  { name: "Colette", image: "chefs/avatar6.jpg" },
  { name: "Olivier", image: "chefs/avatar7.jpg" },
  { name: "Juliette", image: "chefs/avatar8.jpg" },
];

function SplitChars({
  text,
  headingRef,
}: {
  text: string;
  headingRef?: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <h1 ref={headingRef}>
      {text.split("").map((char, index) => (
        <span className="letter" key={index}>
          {char === " " ? " " : char}
        </span>
      ))}
    </h1>
  );
}

function Chefs() {
  const asset = useAsset();
  const sectionRef = useRef<HTMLElement | null>(null);
  const avatarContainerRef = useRef<HTMLDivElement | null>(null);
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chefNameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const defaultHeadingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const avatarContainer = avatarContainerRef.current;
    const avatars = avatarRefs.current.filter(Boolean) as HTMLDivElement[];
    const chefNames = chefNameRefs.current.filter(Boolean) as HTMLDivElement[];
    const defaultHeading = defaultHeadingRef.current;
    if (!avatarContainer || !defaultHeading || !avatars.length) return;

    const defaultLetters = defaultHeading.querySelectorAll(".letter");
    gsap.set(defaultLetters, { y: "0%" });

    let avatarHandlers: {
      element: HTMLElement;
      onEnter: () => void;
      onLeave: () => void;
    }[] = [];
    let handleContainerEnter: (() => void) | null = null;
    let handleContainerLeave: (() => void) | null = null;

    const enableHoverInteractions = () => {
      avatars.forEach((avatar, index) => {
        const nameElement = chefNames[index];
        if (!nameElement) return;
        const nameLetters = nameElement.querySelectorAll(".letter");
        const handleAvatarEnter = () => {
          gsap.to(avatar, {
            width: 120,
            height: 120,
            duration: 0.5,
            ease: "power4.out",
          });
          gsap.to(defaultLetters, {
            y: "-110%",
            duration: 0.75,
            ease: "power4.out",
            stagger: { each: 0.025, from: "center" },
          });
          gsap.to(nameLetters, {
            y: "0%",
            duration: 0.75,
            ease: "power4.out",
            stagger: { each: 0.025, from: "center" },
          });
        };
        const handleAvatarLeave = () => {
          gsap.to(avatar, {
            width: 70,
            height: 70,
            duration: 0.5,
            ease: "power4.out",
          });
          gsap.to(nameLetters, {
            y: "110%",
            duration: 0.75,
            ease: "power4.out",
            stagger: { each: 0.025, from: "center" },
          });
        };
        avatar.addEventListener("mouseenter", handleAvatarEnter);
        avatar.addEventListener("mouseleave", handleAvatarLeave);
        avatarHandlers.push({
          element: avatar,
          onEnter: handleAvatarEnter,
          onLeave: handleAvatarLeave,
        });
      });

      handleContainerEnter = () => {
        gsap.to(defaultLetters, {
          y: "-110%",
          duration: 0.75,
          ease: "power4.out",
          stagger: { each: 0.025, from: "center" },
        });
      };
      handleContainerLeave = () => {
        chefNames.forEach((name) => {
          const letters = name.querySelectorAll(".letter");
          gsap.to(letters, {
            y: "110%",
            duration: 0.75,
            ease: "power4.out",
            stagger: { each: 0.025, from: "center" },
          });
        });
        gsap.to(defaultLetters, {
          y: "0%",
          duration: 0.75,
          ease: "power4.out",
          stagger: { each: 0.025, from: "center" },
        });
      };
      avatarContainer.addEventListener("mouseenter", handleContainerEnter);
      avatarContainer.addEventListener("mouseleave", handleContainerLeave);
    };

    const disableHoverInteractions = () => {
      avatarHandlers.forEach(({ element, onEnter, onLeave }) => {
        element.removeEventListener("mouseenter", onEnter);
        element.removeEventListener("mouseleave", onLeave);
      });
      avatarHandlers = [];
      if (handleContainerEnter) {
        avatarContainer.removeEventListener("mouseenter", handleContainerEnter);
        handleContainerEnter = null;
      }
      if (handleContainerLeave) {
        avatarContainer.removeEventListener("mouseleave", handleContainerLeave);
        handleContainerLeave = null;
      }
      gsap.set(defaultLetters, { y: "0%" });
      chefNames.forEach((name) => {
        const letters = name.querySelectorAll(".letter");
        gsap.set(letters, { y: "110%" });
      });
      avatars.forEach((avatar) => {
        gsap.set(avatar, { clearProps: "width,height" });
      });
    };

    let wasDesktop = window.innerWidth >= MOBILE_BREAKPOINT;
    const handleResize = () => {
      const isDesktop = window.innerWidth >= MOBILE_BREAKPOINT;
      if (isDesktop !== wasDesktop) {
        wasDesktop = isDesktop;
        if (isDesktop) enableHoverInteractions();
        else disableHoverInteractions();
      }
    };
    if (wasDesktop) enableHoverInteractions();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      disableHoverInteractions();
    };
  }, []);

  return (
    <section className="chefs" ref={sectionRef}>
      <div className="chefs-avatars" ref={avatarContainerRef}>
        {CHEFS.map((chef, index) => (
          <div
            className="chefs-avatar"
            key={index}
            ref={(el) => {
              avatarRefs.current[index] = el;
            }}
          >
            <img src={asset(chef.image)} alt={chef.name} />
          </div>
        ))}
      </div>

      <div className="chefs-names">
        <div className="chefs-name chefs-name--default" ref={defaultHeadingRef}>
          <SplitChars text="The Chefs" />
        </div>
        {CHEFS.map((chef, index) => (
          <div
            className="chefs-name"
            key={index}
            ref={(el) => {
              chefNameRefs.current[index] = el;
            }}
          >
            <SplitChars text={chef.name} />
          </div>
        ))}
      </div>

      <div className="section-footer">
        <p className="sm">Craft & Technique</p>
        <p className="sm">Fire & Form</p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Home route */

const ABOUT_IMAGE_COUNT = 6;

function HomePage() {
  const asset = useAsset();
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const isInitialPageLoad = useRef(isInitialLoad).current;
  const [preloaderDelay, setPreloaderDelay] = useState(
    isInitialPageLoad ? 9999 : 0,
  );

  const handlePreloaderEnter = () => {
    if (isInitialPageLoad) setPreloaderDelay(0.2);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const aboutImages = gsap.utils.toArray<HTMLElement>(".about-img");
      aboutImages.forEach((image) => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: image,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          })
          .fromTo(image, { scale: 0.5 }, { scale: 1.25, ease: "none" })
          .to(image, { scale: 0.5, ease: "none" });
      });
      gsap.to(".about-header h3", {
        opacity: 0,
        ease: "power1.out",
        scrollTrigger: {
          trigger: ".about-imgs",
          start: "bottom bottom",
          end: "bottom 30%",
          scrub: true,
        },
      });
    }, aboutSectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <Preloader onEnter={handlePreloaderEnter} />

      <section className="hero">
        <div className="hero-img">
          <img src={asset("home/hero.jpg")} alt="" />
        </div>
        <div className="container">
          <Copy
            type="words"
            animateOnScroll={false}
            delay={isInitialPageLoad ? preloaderDelay : 0.85}
          >
            <h1>
              Salle <br /> Blanche
            </h1>
          </Copy>
          <div className="section-footer">
            <Copy
              type="lines"
              animateOnScroll={false}
              delay={isInitialPageLoad ? preloaderDelay + 0.15 : 1.1}
            >
              <p className="sm">Since 1984</p>
            </Copy>
            <Copy
              type="lines"
              animateOnScroll={false}
              delay={isInitialPageLoad ? preloaderDelay + 0.25 : 1.2}
            >
              <p className="sm">Florence, IT</p>
            </Copy>
          </div>
        </div>
      </section>

      <section className="about" ref={aboutSectionRef}>
        <div className="about-header">
          <div className="container">
            <Copy type="lines">
              <h3>
                An environment built on balance and subtlety, where materials,
                light, and presence create something that feels effortless.
              </h3>
            </Copy>
            <div className="section-footer">
              <Copy type="lines" trigger=".about" start="top 50%" delay={0.5}>
                <p className="sm">Maison Dining</p>
              </Copy>
              <Copy type="lines" trigger=".about" start="top 50%" delay={0.6}>
                <p className="sm">Fine Setting</p>
              </Copy>
            </div>
          </div>
        </div>

        <div className="about-imgs">
          <div className="container">
            {Array.from({ length: ABOUT_IMAGE_COUNT }, (_, index) => (
              <div
                key={index + 1}
                className="about-img"
                id={`about-img-${index + 1}`}
              >
                <img src={asset(`home/about-${index + 1}.jpg`)} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <DiningMenu />
      <Testimonials />
      <CTA />
      <ImageBanner />
    </>
  );
}

/* -------------------------------------------------------------- Menu route */

const CATEGORY_TAGLINES: Record<string, string> = {
  Breakfast: "A gentle start, crafted with care",
  Foodsharing: "Plates meant to be passed and savoured together",
  Pizza: "Wood-fired, hand-stretched, classically inspired",
  Drinks: "From bean to glass, every sip considered",
  "Ice Cream": "Small indulgences to end on a sweet note",
};

function flattenCategoryItems(category: DiningCategory): DiningItem[] {
  if (category.items) return category.items;
  if (category.groups) {
    return category.groups.flatMap((group) =>
      group.items.map((item) => ({ ...item })),
    );
  }
  return [];
}

function MenuPage() {
  const menuListRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".menu-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".menu-grid-card");
        gsap.set(cards, { opacity: 0, y: 30, scale: 0.75 });
        ScrollTrigger.create({
          trigger: grid,
          start: "top 70%",
          once: true,
          onEnter: () => {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.08,
            });
          },
        });
      });
    }, menuListRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section className="menu-hero">
        <div className="container">
          <Copy type="words" animateOnScroll={false} delay={0.85}>
            <h2>A Menu Guided by Taste and Time</h2>
          </Copy>
        </div>
        <div className="section-footer">
          <Copy type="lines" animateOnScroll={false} delay={1.1}>
            <p className="sm">The Carte</p>
          </Copy>
          <Copy type="lines" animateOnScroll={false} delay={1.2}>
            <p className="sm">Selected Courses</p>
          </Copy>
        </div>
      </section>

      <section className="menu-list" ref={menuListRef}>
        <div className="container">
          {diningMenu.map((category, categoryIndex) => {
            const items = flattenCategoryItems(category);
            const tagline = CATEGORY_TAGLINES[category.category];
            return (
              <div className="menu-category" key={categoryIndex}>
                <div className="menu-category-header">
                  <Copy type="words" animateOnScroll>
                    <h3>{category.category}</h3>
                  </Copy>
                  {tagline && (
                    <Copy type="lines" animateOnScroll>
                      <p className="md">{tagline}</p>
                    </Copy>
                  )}
                </div>
                <div className="menu-grid">
                  {items.map((item, itemIndex) => (
                    <div
                      className={`menu-grid-card ${itemIndex % 2 !== 0 ? "alt" : ""}`}
                      key={itemIndex}
                    >
                      <div className="menu-grid-card-top">
                        <h6>{item.name}</h6>
                        {item.weight && <p className="mono">{item.weight}</p>}
                      </div>
                      {(item.description || item.size) && (
                        <p>{item.description || item.size}</p>
                      )}
                      <p className="menu-grid-card-price">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Testimonials />
    </>
  );
}

/* ------------------------------------------------------------- About route */

function AboutPage() {
  const asset = useAsset();
  const heroSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const heroImage = heroSectionRef.current?.querySelector(".hero-image");
    if (!heroImage) return;
    gsap.fromTo(
      heroImage,
      { autoAlpha: 0, scale: 0.75, y: 50 },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 1,
        delay: 1.25,
        ease: "power3.out",
      },
    );
  }, []);

  useEffect(() => {
    let ctx: gsap.Context | undefined;
    const buildScrollAnimation = () => {
      if (ctx) ctx.revert();
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const headerOffsetY = isMobile ? "200vh" : "175vh";
      const headerOffsetX = isMobile ? -100 : -150;
      ctx = gsap.context(() => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: ".about-hero",
              start: "top top",
              end: "bottom +=1200%",
              scrub: true,
            },
          })
          .to(
            [".hero-heading .heading-line-1", ".hero-heading .heading-line-3"],
            { scale: 2, y: headerOffsetY, xPercent: headerOffsetX },
            "scroll",
          )
          .to(
            ".hero-heading .heading-line-2",
            { scale: 2, y: headerOffsetY, xPercent: -headerOffsetX },
            "scroll",
          )
          .to(".hero-image", { scaleY: 2.5, yPercent: 300 }, "scroll")
          .to(".hero-image img", { scaleX: 2.5 }, "scroll");
      }, heroSectionRef);
    };
    let wasMobile = window.innerWidth < MOBILE_BREAKPOINT;
    buildScrollAnimation();
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      if (isMobile !== wasMobile) {
        wasMobile = isMobile;
        buildScrollAnimation();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <>
      <section className="about-hero" ref={heroSectionRef}>
        <div className="about-hero-pin">
          <div className="hero-heading">
            <Copy animateOnScroll={false} delay={0.85}>
              <h1 className="heading-line-1">Salle</h1>
              <h1 className="heading-line-2">Blanche</h1>
              <h1 className="heading-line-3">Story</h1>
            </Copy>
          </div>
          <div className="hero-image">
            <img
              src={asset("about/about-hero.jpg")}
              alt="About Salle Blanche"
            />
          </div>
        </div>
      </section>

      <section className="about-info">
        <div className="container">
          <Copy>
            <p className="mono">Defined by Balance and Restraint</p>
            <h3>
              Salle Blanche is an exercise in quiet composition, where space,
              light, and material come together with deliberate restraint.
            </h3>
            <h3>
              In the same spirit, the menu follows a measured approach, guided
              by balance, clarity, and precision. Each element is considered,
              each plate composed to feel complete yet effortless.
            </h3>
          </Copy>
        </div>
      </section>

      <ImageBanner image="about/about-image-banner.jpg" />
      <Marquee />
      <StickyCards />
      <Chefs />
      <CTA />
    </>
  );
}

/* ------------------------------------------------------- Reservation route */

const INFO_CARDS = [
  {
    icon: HiBolt,
    title: "Menu",
    description:
      "Discover a focused selection of crafted plates, refined pours, and seasonal flavors shaped with quiet intention.",
    items: [
      "Small Plates",
      "Cellar Wines",
      "Signature Spirits",
      "Chef's Picks",
    ],
  },
  {
    icon: HiSparkles,
    title: "Hours",
    description:
      "Our space is prepared for evenings shaped around ease, warmth, and unhurried conversation.",
    items: [
      "Mon – Tue: 5pm – 12am",
      "Wed – Thu: 5pm – 12am",
      "Fri – Sat: 4pm – 1am",
      "Sunday: 4pm – 11pm",
    ],
  },
  {
    icon: HiMoon,
    title: "Contact",
    description:
      "Contact our team for questions or arrangements. We respond with care, clarity, and attention to every visit.",
    items: [
      "+39 055 398 2417",
      "hello@salleblanche.com",
      "press@salleblanche.com",
      "Guest Services",
    ],
  },
];

function ReservationPage() {
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const infoSectionRef = useRef<HTMLElement | null>(null);
  const heroButtonRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [rebuildKey, setRebuildKey] = useState(0);

  useEffect(() => {
    const handleResize = () =>
      setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleTransitionComplete = () => setRebuildKey((prev) => prev + 1);
    window.addEventListener("viewTransitionComplete", handleTransitionComplete);
    return () =>
      window.removeEventListener(
        "viewTransitionComplete",
        handleTransitionComplete,
      );
  }, []);

  useEffect(() => {
    const buttonWrapper = heroButtonRef.current;
    if (!buttonWrapper) return;
    gsap.fromTo(
      buttonWrapper,
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.9, delay: 1.55, ease: "power3.out" },
    );
  }, []);

  useGSAP(
    () => {
      const infoSection = infoSectionRef.current;
      if (!infoSection) return;
      infoSection.classList.remove("reservation-info-mobile");
      if (
        (window as unknown as { __viewTransitioning?: boolean })
          .__viewTransitioning
      )
        return;
      if (!isDesktop) {
        infoSection.classList.add("reservation-info-mobile");
        return;
      }
      const panels = gsap.utils.toArray<HTMLElement>(
        infoSection.querySelectorAll(".info-panel"),
      );
      const cards = gsap.utils.toArray<HTMLElement>(
        infoSection.querySelectorAll(".info-card"),
      );

      ScrollTrigger.create({
        trigger: infoSection,
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          panels.forEach((panel, index) => {
            const staggerDelay = 0.15;
            const duration = 0.7;
            const start = index * staggerDelay;
            const end = start + duration;
            if (progress >= start && progress <= end) {
              const normalised = (progress - start) / duration;
              gsap.set(panel, { y: `${125 - normalised * 125}%` });
              const icon = panel.querySelector(".info-panel-icon");
              const iconThreshold = 0.4;
              const iconProgress = Math.max(
                0,
                (normalised - iconThreshold) / (1 - iconThreshold),
              );
              gsap.set(icon, { scale: iconProgress });
            } else if (progress > end) {
              gsap.set(panel, { y: "0%" });
              gsap.set(panel.querySelector(".info-panel-icon"), { scale: 1 });
            }
          });
        },
      });

      ScrollTrigger.create({
        trigger: infoSection,
        start: "top top",
        end: `+=${window.innerHeight * 3}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          cards.forEach((card, index) => {
            const slideStagger = 0.075;
            const slideDuration = 0.4;
            const slideStart = index * slideStagger;
            const slideEnd = slideStart + slideDuration;
            if (progress >= slideStart && progress <= slideEnd) {
              const normalised = (progress - slideStart) / slideDuration;
              const initialX = 350 - index * 100;
              const targetX = -50;
              const currentX = initialX + normalised * (targetX - initialX);
              const currentRotation = 20 - normalised * 20;
              gsap.set(card, { x: `${currentX}%`, rotation: currentRotation });
            } else if (progress > slideEnd) {
              gsap.set(card, { x: "-50%", rotation: 0 });
            }
            const scaleStagger = 0.12;
            const scaleStart = 0.4 + index * scaleStagger;
            const scaleEnd = 1;
            if (progress >= scaleStart && progress <= scaleEnd) {
              const normalised =
                (progress - scaleStart) / (scaleEnd - scaleStart);
              gsap.set(card, { scale: 0.75 + normalised * 0.25 });
            } else if (progress > scaleEnd) {
              gsap.set(card, { scale: 1 });
            }
          });
        },
      });
    },
    {
      scope: infoSectionRef,
      dependencies: [isDesktop, rebuildKey],
      revertOnUpdate: true,
    },
  );

  return (
    <>
      <section className="reservation-hero" ref={heroSectionRef}>
        <div className="container">
          <Copy type="words" animateOnScroll={false} delay={0.85}>
            <h2>Set the Evening in Motion</h2>
          </Copy>
          <Copy type="lines" animateOnScroll={false} delay={1.35}>
            <p className="lg">
              Reserve your place for an evening of attentive service, thoughtful
              plates, and an atmosphere made to linger in.
            </p>
          </Copy>
          <div className="reservation-hero-button" ref={heroButtonRef}>
            <Button href="/reservation">Reserve Your Evening</Button>
          </div>
          <Copy type="lines" animateOnScroll={false} delay={1.65}>
            <p className="mono">( +39 055 398 2417 )</p>
          </Copy>
        </div>
      </section>

      <section className="reservation-info" ref={infoSectionRef}>
        <div className="container">
          {INFO_CARDS.map(({ icon: Icon, title, description, items }) => (
            <div className="info-panel" key={title}>
              <div className="info-panel-icon">
                <Icon />
              </div>
              <div className="info-card">
                <Icon className="info-card-icon" />
                <h5>{title}</h5>
                <p>{description}</p>
                <div className="info-card-items">
                  {items.map((item) => (
                    <p className="mono" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTA />
    </>
  );
}

/* --------------------------------------------------------- transition shell */

function renderRoute(pathname: string) {
  switch (pathname) {
    case "/menu":
      return <MenuPage />;
    case "/about":
      return <AboutPage />;
    case "/reservation":
      return <ReservationPage />;
    default:
      return <HomePage />;
  }
}

function RouteLayer({
  pathname,
  isOverlay,
  layerRef,
}: {
  pathname: string;
  isOverlay: boolean;
  layerRef: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div className={`page ${isOverlay ? "page-overlay" : ""}`} ref={layerRef}>
      <div className="page-wrapper">
        {renderRoute(pathname)}
        <Footer />
      </div>
    </div>
  );
}

function DiningRoomShell({
  initialPath,
  rootRef,
}: {
  initialPath: RoutePath;
  rootRef: React.RefObject<HTMLElement | null>;
}) {
  const [current, setCurrent] = useState<string>(initialPath);
  const [incoming, setIncoming] = useState<string | null>(null);
  const layerNodes = useRef<Record<string, HTMLDivElement | null>>({});

  const navigate = useCallback(
    (to: string) => {
      if (!ROUTE_PATHS.includes(to as RoutePath)) return;
      if (to === current || incoming) return;
      (
        window as unknown as { __viewTransitioning?: boolean }
      ).__viewTransitioning = true;
      setIncoming(to);
    },
    [current, incoming],
  );

  useGSAP(
    () => {
      if (!incoming) return;
      const oldLayer = layerNodes.current[current];
      const newLayer = layerNodes.current[incoming];
      if (!newLayer) return;

      gsap.set(newLayer, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        y: "25%",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(newLayer, { clearProps: "all" });
          setCurrent(incoming);
          setIncoming(null);
          window.scrollTo(0, 0);
          (
            window as unknown as { __viewTransitioning?: boolean }
          ).__viewTransitioning = false;
          window.dispatchEvent(new Event("viewTransitionComplete"));
        },
      });

      if (oldLayer) {
        tl.to(
          oldLayer,
          {
            y: "-35%",
            opacity: 0.2,
            duration: TRANSITION_DURATION,
            ease: TRANSITION_EASE,
          },
          0,
        );
      }
      tl.to(
        newLayer,
        {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          y: "0%",
          duration: TRANSITION_DURATION,
          ease: TRANSITION_EASE,
        },
        0,
      );
    },
    { dependencies: [incoming] },
  );

  const routerValue = useMemo<RouterValue>(
    () => ({ pathname: incoming ?? current, navigate }),
    [incoming, current, navigate],
  );

  const layers = incoming ? [current, incoming] : [current];

  return (
    <RouterContext.Provider value={routerValue}>
      <Nav rootRef={rootRef} />
      <div className="dining-viewport">
        {layers.map((route, index) => (
          <RouteLayer
            key={route}
            pathname={route}
            isOverlay={Boolean(incoming) && index === 1}
            layerRef={(node) => {
              layerNodes.current[route] = node;
            }}
          />
        ))}
      </div>
    </RouterContext.Provider>
  );
}

/* --------------------------------------------------------------- top level */

export interface DiningRoomPageProps {
  assetBase?: string;
  initialPath?: RoutePath;
  className?: string;
  style?: CSSProperties;
}

const LENIS_OPTIONS = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
  smoothWheel: true,
  syncTouch: true,
  touchMultiplier: 2,
};

export default function DiningRoomPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: DiningRoomPageProps) {
  const normalizedAssetBase = assetBase.replace(/\/$/, "");
  const rootRef = useRef<HTMLElement | null>(null);
  const styles = useMemo(
    () => getDiningRoomPageStyles(normalizedAssetBase),
    [normalizedAssetBase],
  );

  return (
    <ASSET_CONTEXT.Provider value={normalizedAssetBase}>
      <main
        ref={rootRef}
        className={`dining-room-page ${className}`.trim()}
        style={style}
      >
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet */}
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <ReactLenis root options={LENIS_OPTIONS}>
          <DiningRoomShell
            key={initialPath}
            initialPath={initialPath}
            rootRef={rootRef}
          />
        </ReactLenis>
      </main>
    </ASSET_CONTEXT.Provider>
  );
}

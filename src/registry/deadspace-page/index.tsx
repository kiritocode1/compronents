// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import * as THREE from "three";

import { type DeadspaceRoute, getDeadspaceFragment } from "./fragments";
import { matrixShader } from "./menu-shader";
import { getDeadspacePageStyles } from "./styles";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/deadspace-page";

const ROUTES: DeadspaceRoute[] = ["/", "/work", "/project", "/lab", "/contact"];
const ROUTE_SET = new Set(ROUTES);

function normalizePath(path: string): DeadspaceRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/\/$/, "") || "/";
  return ROUTE_SET.has(normalized as DeadspaceRoute)
    ? (normalized as DeadspaceRoute)
    : "/";
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    if (
      /(auto|scroll)/.test(style.overflow + style.overflowY + style.overflowX)
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

function getScrollTop(scroller: HTMLElement | Window | null) {
  if (!scroller || scroller === window) {
    return window.scrollY || window.pageYOffset || 0;
  }
  return scroller.scrollTop;
}

function scrollToTop(scroller: HTMLElement | Window | null) {
  if (!scroller || scroller === window) {
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }
  scroller.scrollTo({ top: 0, behavior: "instant" });
}

function useScrollRuntime(rootElement: HTMLElement | null) {
  const [state, setState] = useState<{
    scroller: HTMLElement | Window | null;
    lenis: Lenis | null;
  }>({ scroller: null, lenis: null });

  useLayoutEffect(() => {
    if (!rootElement) return;

    const scroller = getScrollParent(rootElement);
    let lenis: Lenis | null = null;
    let ticker: ((time: number) => void) | null = null;
    let previousOverflowAnchor = "";
    let previousOverscrollBehavior = "";
    let previousScrollBehavior = "";

    if (scroller instanceof HTMLElement) {
      previousOverflowAnchor = scroller.style.overflowAnchor;
      previousOverscrollBehavior = scroller.style.overscrollBehavior;
      previousScrollBehavior = scroller.style.scrollBehavior;
      scroller.style.overflowAnchor = "none";
      scroller.style.overscrollBehavior = "contain";
      scroller.style.scrollBehavior = "auto";
      lenis = new Lenis({
        wrapper: scroller,
        content: rootElement,
        smoothWheel: true,
        syncTouch: true,
        lerp: window.innerWidth <= 1000 ? 0.075 : 0.1,
        duration: window.innerWidth <= 1000 ? 0.8 : 1.2,
        touchMultiplier: window.innerWidth <= 1000 ? 1.5 : 2,
      });
      ScrollTrigger.defaults({ scroller });
    } else {
      lenis = new Lenis({
        smoothWheel: true,
        syncTouch: true,
        lerp: window.innerWidth <= 1000 ? 0.075 : 0.1,
        duration: window.innerWidth <= 1000 ? 0.8 : 1.2,
        touchMultiplier: window.innerWidth <= 1000 ? 1.5 : 2,
      });
      ScrollTrigger.defaults({ scroller: undefined });
    }

    lenis.on("scroll", ScrollTrigger.update);
    ticker = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
    setState({ scroller, lenis });

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      if (ticker) gsap.ticker.remove(ticker);
      lenis?.destroy();
      if (window.lenis === lenis) window.lenis = null;
      if (scroller instanceof HTMLElement) {
        scroller.style.overflowAnchor = previousOverflowAnchor;
        scroller.style.overscrollBehavior = previousOverscrollBehavior;
        scroller.style.scrollBehavior = previousScrollBehavior;
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      ScrollTrigger.defaults({ scroller: undefined });
      setState({ scroller: null, lenis: null });
    };
  }, [rootElement]);

  return state;
}

export default function DeadspacePage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: {
  assetBase?: string;
  initialPath?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const [pathname, setPathname] = useState<DeadspaceRoute>(() =>
    normalizePath(initialPath),
  );
  const { scroller, lenis } = useScrollRuntime(rootElement);
  const css = useMemo(() => getDeadspacePageStyles(assetBase), [assetBase]);

  useEffect(() => {
    setPathname(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = useCallback(
    (nextPath: string) => {
      const next = normalizePath(nextPath);
      setPathname(next);
      scrollToTop(scroller);
    },
    [scroller],
  );

  return (
    <div
      ref={setRootElement}
      className={["deadspace-page", className].filter(Boolean).join(" ")}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {rootElement && scroller && lenis ? (
        <DeadspaceRouteView
          key={pathname}
          assetBase={assetBase}
          lenis={lenis}
          navigate={navigate}
          pathname={pathname}
          rootElement={rootElement}
          scroller={scroller}
        />
      ) : null}
    </div>
  );
}

function DeadspaceRouteView({
  assetBase,
  lenis,
  navigate,
  pathname,
  rootElement,
  scroller,
}: {
  assetBase: string;
  lenis: Lenis;
  navigate: (path: string) => void;
  pathname: DeadspaceRoute;
  rootElement: HTMLElement;
  scroller: HTMLElement | Window;
}) {
  const [routeElement, setRouteElement] = useState<HTMLDivElement | null>(null);
  const html = useMemo(
    () => getDeadspaceFragment(pathname, assetBase),
    [assetBase, pathname],
  );

  useDeadspaceEffects({
    assetBase,
    lenis,
    navigate,
    pathname,
    root: routeElement,
    rootElement,
    scroller,
  });

  return (
    <div
      ref={setRouteElement}
      className="deadspace-route"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function useDeadspaceEffects({
  assetBase,
  lenis,
  navigate,
  pathname,
  root,
  rootElement,
  scroller,
}: {
  assetBase: string;
  lenis: Lenis;
  navigate: (path: string) => void;
  pathname: DeadspaceRoute;
  root: HTMLElement | null;
  rootElement: HTMLElement;
  scroller: HTMLElement | Window;
}) {
  useLayoutEffect(() => {
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const asset = (path: string) =>
      `${assetBase.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

    loadIonicons();
    cleanups.push(initNavClock(root));
    const menuControls = initMenu(root, asset, navigate);
    cleanups.push(menuControls.cleanup);
    cleanups.push(initRouteLinks(root, navigate, menuControls.close, pathname));
    cleanups.push(initTransitionReveal(root));
    if (pathname === "/") cleanups.push(initPreloader(root));
    cleanups.push(initAnimatedCopy(root));
    if (pathname === "/") cleanups.push(initSkyline(root));
    if (pathname === "/lab") {
      cleanups.push(initLabScroll(root));
      cleanups.push(initPieTransition(root));
      cleanups.push(initStats(root));
      cleanups.push(initClients(root));
      cleanups.push(initParticleVisual(root, asset));
    }
    if (pathname === "/contact") cleanups.push(initContact(root, asset, lenis));
    if (pathname === "/work" || pathname === "/project") {
      cleanups.push(
        initImageDistortion(root, rootElement, scroller, lenis, pathname),
      );
    }
    if (
      pathname === "/work" ||
      pathname === "/project" ||
      pathname === "/lab"
    ) {
      cleanups.push(initFooterParallax(root));
    }

    const refreshFrame = window.requestAnimationFrame(() =>
      ScrollTrigger.refresh(),
    );

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      cleanups.reverse().forEach((cleanup) => cleanup());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
    };
  }, [assetBase, lenis, navigate, pathname, root, rootElement, scroller]);
}

function loadIonicons() {
  if (document.getElementById("deadspace-ionicons-module")) return;
  const moduleScript = document.createElement("script");
  moduleScript.id = "deadspace-ionicons-module";
  moduleScript.type = "module";
  moduleScript.src =
    "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js";
  document.head.appendChild(moduleScript);
}

function isExternalLink(href: string | null) {
  return (
    !href ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  );
}

function initRouteLinks(
  root: HTMLElement,
  navigate: (path: string) => void,
  closeMenu: () => void,
  currentPath: DeadspaceRoute,
) {
  let isTransitioning = false;

  const handleClick = (event: MouseEvent) => {
    if (isTransitioning) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const link = (event.target as HTMLElement).closest("a");
    if (!link || !root.contains(link)) return;
    const href = link.getAttribute("href");
    if (isExternalLink(href)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const next = normalizePath(href || "/");
    if (next === currentPath) {
      closeMenu();
      return;
    }

    isTransitioning = true;
    animateTransitionOut(root).then(() => {
      closeMenu();
      navigate(next);
    });
  };

  root.addEventListener("click", handleClick, { capture: true });
  return () =>
    root.removeEventListener("click", handleClick, { capture: true });
}

function initTransitionReveal(root: HTMLElement) {
  const blocks = [...root.querySelectorAll(".transition-block")];
  gsap.set(blocks, { opacity: 0 });
  return () => gsap.killTweensOf(blocks);
}

function animateTransitionOut(root: HTMLElement) {
  return new Promise<void>((resolve) => {
    const transitionGrid = root.querySelector<HTMLElement>(".transition-grid");
    const blocks = [...root.querySelectorAll<HTMLElement>(".transition-block")];
    if (!transitionGrid || blocks.length === 0) {
      resolve();
      return;
    }

    transitionGrid.style.pointerEvents = "auto";
    transitionGrid.style.zIndex = "1000";
    gsap.set(blocks, { opacity: 0 });

    const shuffled = [...blocks].sort(() => Math.random() - 0.5);
    shuffled.forEach((block, index) => {
      gsap.to(block, {
        opacity: 1,
        duration: 0.075,
        ease: "power2.inOut",
        delay: index * 0.025,
        repeat: 1,
        yoyo: true,
        onComplete: () => {
          gsap.set(block, { opacity: 1 });
          if (index === shuffled.length - 1) {
            window.setTimeout(resolve, 300);
          }
        },
      });
    });
  });
}

function initPreloader(root: HTMLElement) {
  const preloader = root.querySelector<HTMLElement>(".preloader");
  if (!preloader) return () => {};
  if (sessionStorage.getItem("deadspacePreloaderSeen") === "true") {
    preloader.style.display = "none";
    return () => {};
  }

  const progressIndicator = root.querySelector<HTMLElement>(
    ".progress-bar-indicator",
  );
  const progressText = root.querySelector<HTMLElement>(
    ".progress-bar-copy span",
  );
  const progressBar = root.querySelector<HTMLElement>(".progress-bar");
  const preloaderBlocks = [
    ...root.querySelectorAll<HTMLElement>(".preloader-block"),
  ];
  const timers: number[] = [];

  if (!progressIndicator || !progressText || !progressBar) return () => {};

  function complete() {
    sessionStorage.setItem("deadspacePreloaderSeen", "true");
    gsap.to(progressBar, {
      opacity: 0,
      duration: 0.075,
      ease: "power2.inOut",
      delay: 0.3,
      repeat: 1,
      yoyo: true,
      onComplete: () => {
        const shuffled = [...preloaderBlocks].sort(() => Math.random() - 0.5);
        const timer = window.setTimeout(() => {
          shuffled.forEach((block, index) => {
            gsap.to(block, {
              opacity: 0,
              duration: 0.075,
              ease: "power2.inOut",
              delay: index * 0.025,
              repeat: 1,
              yoyo: true,
              onComplete: () => {
                gsap.set(block, { opacity: 0 });
                if (index === shuffled.length - 1)
                  preloader.style.display = "none";
              },
            });
          });
        }, 200);
        timers.push(timer);
      },
    });
  }

  function generateRandomIncrements(totalSteps: number) {
    const increments: number[] = [];
    let remaining = 100;
    const maxSingleIncrement = 30;

    for (let i = 0; i < totalSteps - 1; i++) {
      const maxIncrement = Math.min(
        maxSingleIncrement,
        remaining - (totalSteps - 1 - i),
      );
      const minIncrement = Math.max(
        5,
        Math.floor((remaining / (totalSteps - i)) * 0.5),
      );
      const increment =
        Math.floor(Math.random() * (maxIncrement - minIncrement)) +
        minIncrement;
      increments.push(increment);
      remaining -= increment;
    }

    increments.push(remaining);
    return increments.sort(() => Math.random() - 0.5);
  }

  gsap.to(progressBar, {
    opacity: 1,
    duration: 0.075,
    ease: "power2.inOut",
    delay: 0.5,
    repeat: 1,
    yoyo: true,
    onComplete: () => {
      gsap.set(progressBar, { opacity: 1 });
      let currentProgress = 0;
      const totalSteps = 5;
      let stepCount = 0;
      const increments = generateRandomIncrements(totalSteps);

      function animateNextStep() {
        if (stepCount >= totalSteps) {
          complete();
          return;
        }

        const increment = increments[stepCount];
        const targetProgress = Math.min(currentProgress + increment, 100);
        const randomDelay = 200 + Math.random() * 400;

        const timer = window.setTimeout(() => {
          gsap.to(progressIndicator, {
            "--progress": targetProgress / 100,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
              const currentValue = Math.round(
                Number(gsap.getProperty(progressIndicator, "--progress")) * 100,
              );
              progressText.textContent = `${currentValue}%`;
            },
            onComplete: () => {
              currentProgress = targetProgress;
              stepCount++;
              animateNextStep();
            },
          });
        }, randomDelay);
        timers.push(timer);
      }

      animateNextStep();
    },
  });

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    gsap.killTweensOf([progressBar, progressIndicator, preloaderBlocks]);
  };
}

function initNavClock(root: HTMLElement) {
  const clockEl = root.querySelector<HTMLElement>(".nav-clock p");
  const colonEl = clockEl?.querySelector<HTMLElement>("span");
  if (!clockEl || !colonEl) return () => {};

  function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timeZone =
      Intl.DateTimeFormat(undefined, { timeZoneName: "short" })
        .formatToParts(now)
        .find((part) => part.type === "timeZoneName")?.value || "";
    clockEl.childNodes[0].textContent = `${hours} `;
    clockEl.childNodes[2].textContent = ` ${minutes} ${timeZone}`;
  }

  function blinkColon() {
    colonEl.style.visibility =
      colonEl.style.visibility === "hidden" ? "visible" : "hidden";
  }

  updateClock();
  const clockTimer = window.setInterval(updateClock, 1000);
  const blinkTimer = window.setInterval(blinkColon, 500);
  return () => {
    window.clearInterval(clockTimer);
    window.clearInterval(blinkTimer);
  };
}

const MENU_ITEMS = [
  { label: "Index", icon: "compass-sharp", href: "/" },
  { label: "Lab", icon: "cube-sharp", href: "/lab" },
  { label: "Archive", icon: "laptop-sharp", href: "/work" },
  { label: "Record 01", icon: "flash-sharp", href: "/project" },
  { label: "Connect", icon: "paper-plane-sharp", href: "/contact" },
];

function initMenu(
  root: HTMLElement,
  asset: (path: string) => string,
  navigate: (path: string) => void,
) {
  const menu = root.querySelector<HTMLElement>(".circular-menu");
  const joystick = root.querySelector<HTMLElement>(".joystick");
  const menuOverlay = root.querySelector<HTMLElement>(".menu-overlay");
  const menuToggle = root.querySelector<HTMLElement>(".menu-toggle-btn");
  const closeButton = root.querySelector<HTMLElement>(".close-btn");
  const menuOverlayNav = root.querySelector<HTMLElement>(".menu-overlay-nav");
  const menuOverlayFooter = root.querySelector<HTMLElement>(
    ".menu-overlay-footer",
  );
  const cleanupAtmosphere = initMenuAtmosphere(root);
  let isOpen = false;
  let isMenuAnimating = false;
  let resetJoystick: (() => void) | null = null;
  let cleanupJoystick: (() => void) | null = null;
  const linkSplits: SplitText[] = [];

  if (!menu || !joystick || !menuOverlay || !menuToggle || !closeButton) {
    return { close: () => {}, cleanup: cleanupAtmosphere };
  }

  function getResponsiveConfig() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 1000;
    const maxSize = Math.min(viewportWidth * 0.9, viewportHeight * 0.9);
    const menuSize = isMobile ? Math.min(maxSize, 480) : 700;
    return {
      center: menuSize / 2,
      contentRadius: menuSize * 0.28,
      innerRadius: 0,
      menuSize,
      outerRadius: menuSize * 0.42,
    };
  }

  function calculateSegmentGeometry(index: number, total: number) {
    const config = getResponsiveConfig();
    const { center, contentRadius, innerRadius, menuSize, outerRadius } =
      config;
    const anglePerSegment = 360 / total;
    const startAngle = anglePerSegment * index;
    const endAngle = startAngle + anglePerSegment;
    const centerAngle = startAngle + anglePerSegment / 2;
    const point = (radius: number, angle: number) => ({
      x: center + radius * Math.cos(((angle - 90) * Math.PI) / 180),
      y: center + radius * Math.sin(((angle - 90) * Math.PI) / 180),
    });
    const innerStart = point(innerRadius, startAngle);
    const outerStart = point(outerRadius, startAngle);
    const innerEnd = point(innerRadius, endAngle);
    const outerEnd = point(outerRadius, endAngle);
    const content = point(contentRadius, centerAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    const pathData = [
      `M ${innerStart.x} ${innerStart.y}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      "Z",
    ].join(" ");
    return { contentX: content.x, contentY: content.y, menuSize, pathData };
  }

  function buildSegment(item: (typeof MENU_ITEMS)[number], index: number) {
    const segment = document.createElement("a");
    segment.className = "menu-segment";
    segment.href = item.href;
    const geometry = calculateSegmentGeometry(index, MENU_ITEMS.length);
    segment.style.clipPath = `path('${geometry.pathData}')`;
    segment.style.width = `${geometry.menuSize}px`;
    segment.style.height = `${geometry.menuSize}px`;
    segment.innerHTML = `<div class="segment-content" style="left:${geometry.contentX}px;top:${geometry.contentY}px;transform:translate(-50%,-50%);"><ion-icon name="${item.icon}"></ion-icon><div class="label">${item.label}</div></div>`;
    segment.addEventListener("mouseenter", () => {
      if (isOpen)
        new Audio(asset("sfx/menu-select.mp3")).play().catch(() => {});
    });
    return segment;
  }

  function resizeMenu() {
    const config = getResponsiveConfig();
    menu.style.width = `${config.menuSize}px`;
    menu.style.height = `${config.menuSize}px`;
    [...menu.querySelectorAll<HTMLElement>(".menu-segment")].forEach(
      (segment, index) => {
        const geometry = calculateSegmentGeometry(index, MENU_ITEMS.length);
        segment.style.clipPath = `path('${geometry.pathData}')`;
        segment.style.width = `${geometry.menuSize}px`;
        segment.style.height = `${geometry.menuSize}px`;
        const content = segment.querySelector<HTMLElement>(".segment-content");
        if (content) {
          content.style.left = `${geometry.contentX}px`;
          content.style.top = `${geometry.contentY}px`;
        }
      },
    );
  }

  function initJoystick() {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let activeSegment: HTMLElement | null = null;
    let frame = 0;

    function clearActiveSegment() {
      if (!activeSegment) return;
      activeSegment.style.animation = "";
      activeSegment.querySelector<HTMLElement>(
        ".segment-content",
      ).style.animation = "";
      activeSegment.style.zIndex = "";
      activeSegment = null;
    }

    function animate() {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      gsap.set(joystick, { x: currentX, y: currentY });

      if (
        isDragging &&
        Math.sqrt(currentX * currentX + currentY * currentY) > 20
      ) {
        const angle = Math.atan2(currentY, currentX) * (180 / Math.PI);
        const segmentIndex =
          Math.floor(((angle + 90 + 360) % 360) / (360 / MENU_ITEMS.length)) %
          MENU_ITEMS.length;
        const segment =
          root.querySelectorAll<HTMLElement>(".menu-segment")[segmentIndex];

        if (segment && segment !== activeSegment) {
          clearActiveSegment();
          activeSegment = segment;
          segment.style.animation = "flickerHover 350ms ease-in-out forwards";
          segment.querySelector<HTMLElement>(
            ".segment-content",
          ).style.animation = "contentFlickerHover 350ms ease-in-out forwards";
          segment.style.zIndex = "10";
          if (isOpen)
            new Audio(asset("sfx/menu-select.mp3")).play().catch(() => {});
        }
      } else {
        clearActiveSegment();
      }

      frame = window.requestAnimationFrame(animate);
    }

    function startDrag(event: MouseEvent | TouchEvent) {
      isDragging = true;
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      function drag(dragEvent: MouseEvent | TouchEvent) {
        if (!isDragging) return;

        const clientX =
          "clientX" in dragEvent
            ? dragEvent.clientX
            : dragEvent.touches?.[0]?.clientX;
        const clientY =
          "clientY" in dragEvent
            ? dragEvent.clientY
            : dragEvent.touches?.[0]?.clientY;
        if (clientX === undefined || clientY === undefined) return;

        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDrag = 100 * 0.25;

        if (distance <= 20) {
          targetX = 0;
          targetY = 0;
        } else if (distance > maxDrag) {
          const ratio = maxDrag / distance;
          targetX = deltaX * ratio;
          targetY = deltaY * ratio;
        } else {
          targetX = deltaX;
          targetY = deltaY;
        }

        dragEvent.preventDefault();
      }

      function endDrag() {
        isDragging = false;
        targetX = 0;
        targetY = 0;
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", endDrag);
        document.removeEventListener("touchmove", drag);
        document.removeEventListener("touchend", endDrag);
      }

      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchmove", drag, { passive: false });
      document.addEventListener("touchend", endDrag);

      event.preventDefault();
    }

    joystick.addEventListener("mousedown", startDrag);
    joystick.addEventListener("touchstart", startDrag, { passive: false });
    animate();

    return {
      reset() {
        currentX = 0;
        currentY = 0;
        targetX = 0;
        targetY = 0;
        clearActiveSegment();
        gsap.set(joystick, { x: 0, y: 0 });
      },
      cleanup() {
        window.cancelAnimationFrame(frame);
        joystick.removeEventListener("mousedown", startDrag);
        joystick.removeEventListener("touchstart", startDrag);
      },
    };
  }

  function animateMenuLinks(reverse = false) {
    linkSplits.forEach((split) => {
      if (!split?.chars) return;
      gsap.to(split.chars, {
        opacity: reverse ? 0 : 1,
        duration: 0.05,
        ease: "power2.inOut",
        stagger: { amount: 0.5, each: 0.1, from: "random" },
      });
    });
  }

  function toggleMenu(forceClose = false) {
    if (isMenuAnimating) return;
    if (forceClose && !isOpen) return;
    const menuSegments = [
      ...root.querySelectorAll<HTMLElement>(".menu-segment"),
    ];
    isMenuAnimating = true;

    if (!isOpen && !forceClose) {
      isOpen = true;
      new Audio(asset("sfx/menu-open.mp3")).play().catch(() => {});
      if (resetJoystick) resetJoystick();
      gsap.to(menuOverlay, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
          menuOverlay.style.pointerEvents = "all";
        },
      });
      gsap.to(joystick, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.4,
        delay: 0.2,
        ease: "back.out(1.7)",
      });
      linkSplits.forEach((split) => split.revert());
      linkSplits.length = 0;
      gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 1 });
      [
        ...root.querySelectorAll(".menu-overlay-items a"),
        ...root.querySelectorAll(".menu-overlay-footer a"),
      ].forEach((link) => {
        const split = SplitText.create(link, {
          type: "chars",
          autoSplit: true,
        });
        gsap.set(split.chars, { opacity: 0 });
        linkSplits.push(split);
      });
      window.setTimeout(() => animateMenuLinks(false), 300);
      menuSegments
        .map((_, index) => index)
        .sort(() => Math.random() - 0.5)
        .forEach((originalIndex, shuffledPosition) => {
          const segment = menuSegments[originalIndex];
          gsap.set(segment, { opacity: 0 });
          gsap.to(segment, {
            opacity: 1,
            duration: 0.075,
            delay: shuffledPosition * 0.075,
            repeat: 3,
            yoyo: true,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(segment, { opacity: 1 });
              if (shuffledPosition === menuSegments.length - 1) {
                isMenuAnimating = false;
              }
            },
          });
        });
    } else {
      isOpen = false;
      new Audio(asset("sfx/menu-close.mp3")).play().catch(() => {});
      animateMenuLinks(true);
      gsap.to(joystick, {
        scale: 0,
        x: 0,
        y: 0,
        duration: 0.3,
        delay: 0.2,
        ease: "back.in(1.7)",
        onComplete: () => {
          if (resetJoystick) resetJoystick();
        },
      });
      menuSegments
        .map((_, index) => index)
        .sort(() => Math.random() - 0.5)
        .forEach((originalIndex, shuffledPosition) => {
          const segment = menuSegments[originalIndex];
          gsap.to(segment, {
            opacity: 0,
            duration: 0.05,
            delay: shuffledPosition * 0.05,
            repeat: 2,
            yoyo: true,
            ease: "power2.inOut",
            onComplete: () => gsap.set(segment, { opacity: 0 }),
          });
        });
      gsap.to(menuOverlay, {
        opacity: 0,
        duration: 0.3,
        delay: 0.6,
        ease: "power2.out",
        onComplete: () => {
          menuOverlay.style.pointerEvents = "none";
          gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 0 });
          isMenuAnimating = false;
        },
      });
    }
  }

  MENU_ITEMS.forEach((item, index) => {
    const segment = buildSegment(item, index);
    segment.addEventListener("click", (event) => {
      event.preventDefault();
      animateTransitionOut(root).then(() => {
        toggleMenu(true);
        navigate(item.href);
      });
    });
    menu.appendChild(segment);
  });

  resizeMenu();
  gsap.set(joystick, { scale: 0, x: 0, y: 0 });
  gsap.set([menuOverlayNav, menuOverlayFooter], { opacity: 0 });
  const joystickControls = initJoystick();
  resetJoystick = joystickControls.reset;
  cleanupJoystick = joystickControls.cleanup;
  resetJoystick();
  menuToggle.addEventListener("click", () => toggleMenu());
  closeButton.addEventListener("click", () => toggleMenu());
  window.addEventListener("resize", resizeMenu);

  return {
    close: () => toggleMenu(true),
    cleanup: () => {
      window.removeEventListener("resize", resizeMenu);
      cleanupJoystick?.();
      cleanupAtmosphere();
      linkSplits.forEach((split) => split.revert());
      gsap.killTweensOf(root.querySelectorAll(".menu-segment"));
    },
  };
}

function initMenuAtmosphere(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("#menu-canvas");
  if (!canvas) return () => {};

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    vertexShader: matrixShader.vertexShader,
    fragmentShader: matrixShader.fragmentShader,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      uColorBg: { value: new THREE.Vector3(0.8902, 0.0235, 0.0745) },
      uColorFg: { value: new THREE.Vector3(0, 0, 0) },
    },
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  let frame = 0;

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    material.uniforms.iResolution.value.set(width, height);
  }

  function animate() {
    material.uniforms.iTime.value += 0.016;
    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);
  animate();
  return () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}

function initAnimatedCopy(root: HTMLElement) {
  const splits: SplitText[] = [];
  const animations: gsap.core.Animation[] = [];
  let active = true;
  const hasPreloader =
    !!root.querySelector(".preloader") &&
    sessionStorage.getItem("deadspacePreloaderSeen") !== "true";

  gsap.set(root.querySelectorAll("[data-animate-variant]"), { opacity: 0 });

  function splitWhenReady() {
    if (!active) return;
    root
      .querySelectorAll<HTMLElement>("[data-animate-variant]")
      .forEach((element) => {
        const variant = element.getAttribute("data-animate-variant");
        const animateOnScroll =
          element.getAttribute("data-animate-on-scroll") !== "false";
        let delay =
          Number.parseFloat(
            element.getAttribute("data-animate-delay") || "0",
          ) || 0;
        if (hasPreloader && !animateOnScroll) delay += 5.5;

        if (variant === "slide") {
          const slideType =
            element.getAttribute("data-animate-type") || "lines";
          const split = SplitText.create(element, {
            type: slideType,
            mask: slideType,
            autoSplit: true,
            linesClass: "line",
            wordsClass: "word",
          });
          splits.push(split);
          const targets = slideType === "words" ? split.words : split.lines;
          gsap.set(targets, { yPercent: 100 });
          gsap.set(element, { opacity: 1 });
          const animation = gsap.to(targets, {
            yPercent: 0,
            duration: 0.75,
            ease: "power3.out",
            delay,
            stagger: Number.parseFloat(
              element.getAttribute("data-animate-stagger") || "0.1",
            ),
            paused: animateOnScroll,
          });
          animations.push(animation);
          if (animateOnScroll) {
            ScrollTrigger.create({
              trigger: element,
              start: "top 70%",
              animation,
              toggleActions: "play none none none",
            });
          } else {
            animation.play();
          }
        }

        if (variant === "flicker") {
          const split = SplitText.create(element, {
            type: "chars",
            autoSplit: true,
          });
          splits.push(split);
          gsap.set(split.chars, { opacity: 0 });
          gsap.set(element, { opacity: 1 });
          const animation = gsap.to(split.chars, {
            opacity: 1,
            duration: 0.05,
            ease: "power2.inOut",
            delay,
            stagger: { amount: 0.5, each: 0.1, from: "random" },
            paused: animateOnScroll,
          });
          animations.push(animation);
          if (animateOnScroll) {
            ScrollTrigger.create({
              trigger: element,
              start: "top 85%",
              animation,
              toggleActions: "play none none none",
            });
          } else {
            animation.play();
          }
        }

        if (variant === "diffuse") {
          const split = SplitText.create(element, {
            type: "words",
            autoSplit: true,
            wordsClass: "word",
          });
          splits.push(split);
          split.words.forEach((word) => {
            word.style.filter = "blur(75px)";
            word.style.webkitFilter = "blur(75px)";
          });
          gsap.set(split.words, { filter: "blur(75px)", opacity: 0 });
          gsap.set(element, { opacity: 1 });
          const animation = gsap.to(split.words, {
            filter: "blur(0px)",
            opacity: 1,
            duration: 2,
            ease: "power3.out",
            delay,
            paused: animateOnScroll,
            onComplete: () => {
              gsap.set(split.words, { filter: "blur(0px)", opacity: 1 });
              split.words.forEach((word) => {
                word.style.filter = "blur(0px)";
                word.style.webkitFilter = "blur(0px)";
              });
            },
          });
          animations.push(animation);
          if (animateOnScroll) {
            ScrollTrigger.create({
              trigger: element,
              start: "top 85%",
              animation,
              toggleActions: "play none none none",
            });
          } else {
            animation.play();
          }
        }
      });
    ScrollTrigger.refresh();
  }

  document.fonts?.ready?.then(splitWhenReady) ??
    window.requestAnimationFrame(splitWhenReady);
  return () => {
    active = false;
    animations.forEach((animation) => animation.kill());
    splits.forEach((split) => split.revert());
  };
}

function initSkyline(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("#skyline");
  if (!canvas) return () => {};
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const pixelRatioLimit = isMobile ? 1.0 : 1.25;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: "high-performance",
    stencil: false,
    depth: false,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3() },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
      #else
        precision mediump float;
      #endif

      uniform float iTime;
      uniform vec3 iResolution;
      varying vec2 vUv;

      uint seed = 31713U;

      float rand(void) {
        seed = (seed << 13U) ^ seed;
        seed = seed * (seed * seed * 15731U + 789221U) + 1376312589U;
        uint seed2 = seed * seed;
        return float(seed2&0x7fffffffU)/float(0x7fffffffU);
      }

      float Polygon(vec2 uv, float h) {
        float mid = (rand()-.5)*exp2(-h*2.);
        float f = abs(uv.y-rand()+.5)-rand()-2.;
        f = max(f,abs(uv.x-mid)-rand()-.5+h*.4);
        f = max(f,abs(dot(uv,vec2(1,1)/sqrt(2.))-rand()+.5)-rand()-1.);
        f = max(f,abs(dot(uv,vec2(1,-1)/sqrt(2.))-rand()+.5)-rand()-1.);
        return f;
      }

      vec3 Buildings(vec2 uv, int layer) {
        seed = uint(2. + uv.x/4.);
        uv.x = (fract(uv.x/4.)-.5)*4.;

        bool cull = (pow(float(layer+1)/8.,.3) < rand());
        seed += 0x1001U*uint(layer);

        float a = Polygon(uv-vec2(0,0), 0.);
        float b = Polygon(uv-vec2(0,2), .5);
        float c = Polygon(uv-vec2(0,4), 1.);
        if (cull) { a = 1.; b = 1.; c = 1.; }

        a = min(a, uv.y+.5);

        vec3 f = vec3(a,min(a,b),min(min(a,b),c)).zyx;
        vec3 col = vec3(.5+.5*f/(.01+abs(f)));

        return vec3(dot(col,vec3(.985,.01,.005)));
      }

      void main() {
        vec2 fragCoord = vUv * iResolution.xy;
        vec2 uv = (fragCoord-iResolution.xy*vec2(.5,.5))/iResolution.y;

        uv *= 10.;
        uv.y += 3.;
        uv.x -= 8.;

        vec3 color = vec3(1);

        const float size = .5;
        const float fog = .15;
        const float baseFog = 0.075;

        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*0.)+iTime*vec2(4,0),0), exp2(-fog*0.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*1.)+iTime*vec2(4,0),1), exp2(-fog*1.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*2.)+iTime*vec2(4,0),2), exp2(-fog*2.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*3.)+iTime*vec2(4,0),3), exp2(-fog*3.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*4.)+iTime*vec2(4,0),4), exp2(-fog*4.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*5.)+iTime*vec2(4,0),5), exp2(-fog*5.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*6.)+iTime*vec2(4,0),6), exp2(-fog*6.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*7.)+iTime*vec2(4,0),7), exp2(-fog*7.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*8.)+iTime*vec2(4,0),8), exp2(-fog*8.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*9.)+iTime*vec2(4,0),9), exp2(-fog*9.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*10.)+iTime*vec2(4,0),10), exp2(-fog*10.-baseFog)));
        color = min(color, mix(vec3(1), Buildings(uv*exp2(size*11.)+iTime*vec2(4,0),11), exp2(-fog*11.-baseFog)));

        color = pow(color, vec3(1./2.2));

        const vec3 bgColor = vec3(0.89, 0.024, 0.075);
        color = mix(bgColor, vec3(0.0), 1.0 - color.r);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  let frame = 0;
  let resizeTimer = 0;

  function resize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, pixelRatioLimit),
      );
      material.uniforms.iResolution.value.set(width, height, 1);
    }, 100);
  }

  function animate(time: number) {
    material.uniforms.iTime.value = time * 0.001;
    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);
  frame = window.requestAnimationFrame(animate);
  return () => {
    window.cancelAnimationFrame(frame);
    window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", resize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}

function initLabScroll(root: HTMLElement) {
  const revealer = root.querySelector(".lab-about-revealer");
  const overlay = root.querySelector(".lab-hero-overlay");
  const hero = root.querySelector(".lab-hero");
  if (!revealer || !overlay || !hero) return () => {};
  const config = {
    trigger: hero,
    start: "top top",
    end: "150% top",
    scrub: true,
  };
  const tweens = [
    gsap.to(revealer, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% -25%, 0% 0%)",
      ease: "none",
      scrollTrigger: config,
    }),
    gsap.to(overlay, { opacity: 1, ease: "none", scrollTrigger: config }),
  ];
  return () => tweens.forEach((tween) => tween.kill());
}

function initPieTransition(root: HTMLElement) {
  const container = root.querySelector<HTMLElement>(".pie-transition");
  const header = root.querySelector<HTMLElement>(
    ".pie-transition-outro-header h3",
  );
  if (!container || !header) return () => {};
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 800 800");
  svg.style.cssText =
    "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:min(80vw,80vh);height:min(80vw,80vh);overflow:visible;";
  const dotsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const pieGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  dotsGroup.style.transformOrigin = "400px 400px";
  pieGroup.style.transformOrigin = "400px 400px";
  dotsGroup.setAttribute("id", "pie-transition-dots-group");
  pieGroup.setAttribute("id", "pie-transition-pie-group");

  for (let i = 0; i < 1500; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * 300;
    const dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    dot.setAttribute("cx", String(400 + Math.cos(angle) * distance));
    dot.setAttribute("cy", String(400 + Math.sin(angle) * distance));
    dot.setAttribute("r", "1");
    dot.setAttribute("fill", "#e30613");
    dotsGroup.appendChild(dot);
  }

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
  mask.setAttribute("id", "pie-transition-mask");
  const maskBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  maskBg.setAttribute("width", "800");
  maskBg.setAttribute("height", "800");
  maskBg.setAttribute("fill", "black");
  const slicePath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  slicePath.setAttribute("fill", "white");
  mask.append(maskBg, slicePath);
  defs.appendChild(mask);
  const solidCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  solidCircle.setAttribute("cx", "400");
  solidCircle.setAttribute("cy", "400");
  solidCircle.setAttribute("r", "302");
  solidCircle.setAttribute("fill", "#e30613");
  solidCircle.setAttribute("mask", "url(#pie-transition-mask)");
  pieGroup.appendChild(solidCircle);
  svg.append(defs, dotsGroup, pieGroup);
  container.appendChild(svg);

  const split = SplitText.create(header, {
    type: "words",
    wordsClass: "pie-transition-word",
  });
  gsap.set(split.words, { opacity: 0 });

  function updatePieFill(progress: number) {
    const angle = progress * 360;
    if (angle <= 0) {
      slicePath.setAttribute("d", "");
      return;
    }
    if (angle >= 360) {
      slicePath.setAttribute(
        "d",
        "M 400,400 m -302,0 a 302,302 0 1,0 604,0 a 302,302 0 1,0 -604,0",
      );
      return;
    }
    const startAngle = -90;
    const endAngle = startAngle + angle;
    const x1 = 400 + 302 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 400 + 302 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 400 + 302 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 400 + 302 * Math.sin((endAngle * Math.PI) / 180);
    const largeArc = angle > 180 ? 1 : 0;
    slicePath.setAttribute(
      "d",
      `M 400,400 L ${x1},${y1} A 302,302 0 ${largeArc} 1 ${x2},${y2} Z`,
    );
  }

  const trigger = ScrollTrigger.create({
    trigger: container,
    start: "top top",
    end: () => `+=${window.innerHeight * 5}`,
    scrub: true,
    pin: true,
    pinSpacing: true,
    onUpdate: (self) => {
      const progress = self.progress;
      updatePieFill(progress <= 0.5 ? progress / 0.5 : 1);
      const scaleMultiplier = window.innerWidth < 1000 ? 3 : 2.5;
      const scale =
        progress >= 0.5 ? 1 + ((progress - 0.5) / 0.5) * scaleMultiplier : 1;
      pieGroup.style.transform = `scale(${scale})`;
      dotsGroup.style.transform = `scale(${scale})`;
      if (progress >= 0.75 && progress <= 0.95) {
        const textProgress = (progress - 0.75) / 0.2;
        split.words.forEach((word, index) => {
          gsap.set(word, {
            opacity: textProgress >= index / split.words.length ? 1 : 0,
          });
        });
      } else if (progress < 0.75) {
        gsap.set(split.words, { opacity: 0 });
      } else {
        gsap.set(split.words, { opacity: 1 });
      }
    },
  });

  return () => {
    trigger.kill();
    split.revert();
    svg.remove();
  };
}

function initStats(root: HTMLElement) {
  const triggers = [...root.querySelectorAll<HTMLElement>(".stat-item")].map(
    (item) =>
      ScrollTrigger.create({
        trigger: item,
        start: "top bottom",
        end: "top 25%",
        scrub: true,
        onUpdate: (self) => gsap.set(item, { x: 250 - self.progress * 250 }),
      }),
  );
  return () => triggers.forEach((trigger) => trigger.kill());
}

const CLIENTS = [
  ["Northbound", "Archive Signal"],
  ["Grey Matter Co", "Carbon Interface"],
  ["Field Dept", "Signal Drift Study"],
  ["Monolith", "Index"],
  ["Office of Signal", "Hero Transition"],
  ["Plainform", "Commerce Stack V1"],
  ["Late Season Studio", "Content Flow"],
  ["Artifact", "Scroll Narrative System"],
  ["Room Eleven", "Visual Density"],
  ["Index", "Navigation"],
  ["Signal & Form", "Motion Identity System"],
  ["Null", "Interface Calibration Test"],
  ["Low Fidelity", "Prototype"],
  ["House of Color", "Surface Study"],
  ["Static", "Landing Page"],
  ["Edge Pattern Lab", "Interaction Layer"],
  ["Grain", "Editorial"],
  ["Studio Northbound", "System Homepage"],
  ["Signal Dept", "Scroll Field Test"],
  ["Room of Pattern", "Viewport Experiments"],
  ["Vault", "Data Surface"],
  ["Greyform Lab", "Motion Calibration"],
  ["Section Eight", "Hero Grid Study"],
  ["Tone", "Identity Pass"],
  ["Index Dept", "Navigation Stack"],
  ["Field of View", "Scroll Response"],
  ["Mono", "Landing System"],
  ["North Sector Lab", "Interface Density Test"],
  ["Drift", "Motion Layer"],
  ["Room Zero", "Prototype Field"],
  ["Signal", "Scroll Narrative"],
  ["Plain Studio", "System Audit"],
  ["Axis", "Layout Study"],
  ["Grey Room", "Visual Flow Test"],
  ["Object Dept", "Surface Logic"],
  ["Static Form", "Content Index"],
  ["Lab North", "Hero Entry"],
  ["Frame", "Viewport Logic"],
  ["Pattern Office", "Interaction System"],
  ["North Axis", "Spatial Index"],
  ["White Room", "Interface Study"],
  ["Signal Works", "Motion Framework"],
  ["Field Studio", "Scroll Architecture"],
  ["Coreform", "Layout System"],
  ["Room Twelve", "Visual Balance Test"],
  ["Gradient Lab", "Surface Transition"],
  ["Studio Vector", "Directional System"],
  ["Pattern Field", "Interaction Mapping"],
  ["Neutral Office", "Content Hierarchy"],
  ["Monoform", "Typography Pass"],
  ["Signal Archive", "Narrative Index"],
  ["Grey Sector", "Density Calibration"],
  ["Object Field", "Component Study"],
  ["Northframe", "Viewport Scaling"],
  ["Layer Dept", "Stack Architecture"],
  ["Studio Plain", "System Cleanup"],
  ["Axis North", "Grid Refinement"],
  ["Visual Office", "Flow Analysis"],
  ["Field Notes", "Experimental Log"],
  ["Room Alpha", "Prototype Cycle"],
  ["Form Dept", "Structural Pass"],
  ["Static North", "Landing Revision"],
  ["Index Lab", "Navigation Research"],
  ["Tone Studio", "Identity Calibration"],
  ["Signal North", "Scroll Velocity Test"],
  ["Pattern Lab", "Interaction Grammar"],
  ["Frame Office", "Viewport Rules"],
  ["Grey Index", "System Ordering"],
  ["Field Logic", "Response Mapping"],
  ["Object Studio", "Surface Composition"],
  ["Northform", "Layout Integrity"],
  ["Room Delta", "Visual Experiment"],
  ["Signal Studio", "Motion Pass"],
  ["Plain Index", "Content Structure"],
  ["Axis Lab", "Alignment Study"],
  ["Neutral Field", "Interface Restraint"],
  ["Pattern North", "System Iteration"],
  ["Frame Lab", "Viewport Behavior"],
];

function initClients(root: HTMLElement) {
  const clientsList = root.querySelector<HTMLElement>(".clients-list");
  if (!clientsList) return () => {};
  CLIENTS.forEach(([name, project]) => {
    const row = document.createElement("div");
    row.className = "client-row";
    row.innerHTML = `<p class="type-mono">${name}</p><p class="type-mono">${project}</p>`;
    clientsList.appendChild(row);
  });
  const triggers = [
    ...clientsList.querySelectorAll<HTMLElement>(".client-row"),
  ].map((row) => {
    const paragraphs = [...row.querySelectorAll("p")];
    return ScrollTrigger.create({
      trigger: row,
      start: "top 75%",
      end: "top 65%",
      scrub: true,
      onUpdate: (self) => {
        gsap.set(row, { gap: `${25 - self.progress * 25}%` });
        paragraphs.forEach((paragraph) =>
          gsap.set(paragraph, { opacity: self.progress }),
        );
      },
    });
  });
  return () => {
    triggers.forEach((trigger) => trigger.kill());
    clientsList.innerHTML = "";
  };
}

function initFooterParallax(root: HTMLElement) {
  const footer = root.querySelector("footer");
  const footerContainer = root.querySelector(".footer-container");
  if (!footer || !footerContainer) return () => {};
  const trigger = ScrollTrigger.create({
    trigger: footer,
    start: "top bottom",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) =>
      gsap.set(footerContainer, { y: `${-35 * (1 - self.progress)}%` }),
  });
  return () => trigger.kill();
}

function initContact(
  root: HTMLElement,
  asset: (path: string) => string,
  lenis: Lenis,
) {
  const contactVisual = root.querySelector<HTMLElement>(".contact-visual");
  const contactVisualIcon = root.querySelector<HTMLImageElement>(
    ".contact-visual-icon img",
  );
  const contactInfo = root.querySelector<HTMLElement>(".contact-info");
  if (!contactVisual || !contactVisualIcon || !contactInfo) return () => {};
  let currentIconIndex = 1;
  let lastCenteredRow: HTMLElement | null = null;
  const timers: number[] = [];
  const triggers: ScrollTrigger[] = [];

  function getESTTime() {
    const now = new Date();
    const estTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" }),
    );
    return `${String(estTime.getHours()).padStart(2, "0")}:${String(estTime.getMinutes()).padStart(2, "0")} EST`;
  }

  function updateClocks() {
    root.querySelectorAll(".contact-clock").forEach((clock) => {
      clock.textContent = getESTTime();
    });
  }

  updateClocks();
  const timer = window.setInterval(updateClocks, 1000);
  timers.push(timer);

  for (let i = 0; i < 10; i++) {
    contactInfo.parentElement?.appendChild(contactInfo.cloneNode(true));
  }

  const onScroll = () => {
    const viewportCenter = window.innerHeight / 2;
    const rows = [...root.querySelectorAll<HTMLElement>(".contact-info-row")];
    let closestRow: HTMLElement | null = null;
    let minDistance = Infinity;
    rows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      const rowCenter = rect.top + rect.height / 2;
      const distance = Math.abs(rowCenter - viewportCenter);
      if (distance < minDistance && distance < 25) {
        minDistance = distance;
        closestRow = row;
      }
    });
    if (closestRow && closestRow !== lastCenteredRow) {
      lastCenteredRow = closestRow;
      currentIconIndex = (currentIconIndex % 10) + 1;
      contactVisualIcon.src = asset(`contact/icon_${currentIconIndex}.svg`);
    }
  };

  let isMobile = window.innerWidth < 1000;
  const previousInfinite = lenis.options?.infinite;
  lenis.options.infinite = true;

  function resetRowGaps() {
    root.querySelectorAll<HTMLElement>(".contact-info-row").forEach((row) => {
      row.style.gap = "1rem";
    });
  }

  function killGapAnimations() {
    triggers.forEach((trigger) => trigger.kill());
    triggers.length = 0;
    resetRowGaps();
  }

  function initGapAnimations() {
    killGapAnimations();

    if (isMobile) return;

    const visualCenter =
      contactVisual.offsetTop + contactVisual.offsetHeight / 2;
    root.querySelectorAll<HTMLElement>(".contact-info-row").forEach((row) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: row,
          start: () => `top+=${visualCenter - 550} center`,
          end: () => `top+=${visualCenter - 450} center`,
          scrub: true,
          onUpdate: (self) => {
            row.style.gap = `${1 + (10 - 1) * self.progress}rem`;
          },
        }),
        ScrollTrigger.create({
          trigger: row,
          start: () => `top+=${visualCenter - 400} center`,
          end: () => `top+=${visualCenter - 300} center`,
          scrub: true,
          onUpdate: (self) => {
            row.style.gap = `${10 - (10 - 1) * self.progress}rem`;
          },
        }),
      );
    });
  }

  function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 1000;

    if (wasMobile !== isMobile) {
      initGapAnimations();
    }
  }

  lenis.on("scroll", onScroll);
  initGapAnimations();
  window.addEventListener("resize", handleResize);

  return () => {
    lenis.off("scroll", onScroll);
    lenis.options.infinite = previousInfinite;
    window.removeEventListener("resize", handleResize);
    timers.forEach((id) => window.clearInterval(id));
    killGapAnimations();
  };
}

function initImageDistortion(
  root: HTMLElement,
  rootElement: HTMLElement,
  scroller: HTMLElement | Window,
  lenis: Lenis,
  pathname: DeadspaceRoute,
) {
  const selector = pathname === "/work" ? ".work-item img" : ".project-img img";
  const media = [...root.querySelectorAll<HTMLImageElement>(selector)];
  if (media.length === 0) return () => {};
  const bendStrength = pathname === "/project" ? "5.0" : "7.5";
  const cameraPosition = 400;
  let isMobile = window.innerWidth < 1000;
  let active = true;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.className = "deadspace-webgl-layer";
  renderer.domElement.style.display = isMobile ? "none" : "block";
  rootElement.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    10,
    1000,
  );
  camera.position.z = cameraPosition;
  camera.fov =
    (2 * Math.atan(window.innerHeight / 2 / cameraPosition) * 180) / Math.PI;
  camera.updateProjectionMatrix();

  const geometry = new THREE.PlaneGeometry(1, 1, 100, 100);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uScrollVelocity: { value: 0 },
      uTexture: { value: null },
      uTextureSize: { value: new THREE.Vector2(100, 100) },
      uQuadSize: { value: new THREE.Vector2(100, 100) },
    },
    vertexShader: `
      uniform float uScrollVelocity;
      uniform vec2 uTextureSize;
      uniform vec2 uQuadSize;
      out vec2 vUvCover;
      vec2 getCoverUv(vec2 uv, vec2 textureSize, vec2 quadSize){
        vec2 ratio=vec2(min((quadSize.x/quadSize.y)/(textureSize.x/textureSize.y),1.0),min((quadSize.y/quadSize.x)/(textureSize.y/textureSize.x),1.0));
        return vec2(uv.x*ratio.x+(1.0-ratio.x)*0.5,uv.y*ratio.y+(1.0-ratio.y)*0.5);
      }
      void main(){ vUvCover=getCoverUv(uv,uTextureSize,uQuadSize); vec3 pos=position; float dist=length(uv-vec2(0.5)); pos.z+=dist*dist*uScrollVelocity*${bendStrength}; gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0); }
    `,
    fragmentShader: `
      precision highp float;
      uniform sampler2D uTexture;
      in vec2 vUvCover;
      out vec4 outColor;
      void main(){ outColor=vec4(texture(uTexture,vUvCover).rgb,1.0); }
    `,
    glslVersion: THREE.GLSL3,
  });
  const objects: any[] = [];
  let scrollVelocity = 0;
  let smoothVelocity = 0;
  let frame = 0;

  function getObjectTop(bounds: DOMRect) {
    const rootTop = rootElement.getBoundingClientRect().top;
    const scrollY = getScrollTop(scroller);
    return bounds.top - rootTop + scrollY;
  }

  function createMeshes() {
    const loadImage = (img: HTMLImageElement) =>
      new Promise<HTMLImageElement>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve(img);
        } else {
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
        }
      });

    Promise.all(media.map(loadImage)).then((loadedImages) => {
      if (!active) return;
      loadedImages.forEach((img) => {
        img.crossOrigin = "anonymous";
        img.style.opacity = isMobile ? "1" : "0";
        const bounds = img.getBoundingClientRect();
        const imageMaterial = material.clone();
        const mesh = new THREE.Mesh(geometry, imageMaterial);
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        imageMaterial.uniforms.uTexture.value = texture;
        imageMaterial.uniforms.uTextureSize.value.set(
          img.naturalWidth || 1,
          img.naturalHeight || 1,
        );
        imageMaterial.uniforms.uQuadSize.value.set(bounds.width, bounds.height);
        mesh.scale.set(bounds.width, bounds.height, 1);
        if (!isMobile) scene.add(mesh);
        objects.push({
          img,
          material: imageMaterial,
          mesh,
          texture,
          width: bounds.width,
          height: bounds.height,
          top: getObjectTop(bounds),
          left: bounds.left,
        });
      });
    });
  }

  function setPositions() {
    const scrollY = getScrollTop(scroller);
    const viewportHeight =
      scroller instanceof HTMLElement
        ? scroller.clientHeight
        : window.innerHeight;
    objects.forEach((object) => {
      object.mesh.position.x =
        object.left - window.innerWidth / 2 + object.width / 2;
      object.mesh.position.y =
        -object.top + scrollY + viewportHeight / 2 - object.height / 2;
    });
  }

  function render() {
    if (isMobile) {
      frame = window.requestAnimationFrame(render);
      return;
    }
    smoothVelocity += (scrollVelocity - smoothVelocity) * 0.1;
    objects.forEach((object) => {
      object.material.uniforms.uScrollVelocity.value = smoothVelocity;
    });
    setPositions();
    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(render);
  }

  const onScroll = ({ velocity }: { velocity: number }) => {
    scrollVelocity = velocity;
  };

  function toggleMode() {
    if (isMobile) {
      renderer.domElement.style.display = "none";
      objects.forEach((object) => {
        object.img.style.opacity = "1";
      });
      return;
    }

    renderer.domElement.style.display = "block";
    objects.forEach((object) => {
      object.img.style.opacity = "0";
      if (!scene.children.includes(object.mesh)) {
        scene.add(object.mesh);
      }
    });
  }

  function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 1000;

    if (isMobile !== wasMobile) {
      toggleMode();
      return;
    }

    if (isMobile) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.fov =
      (2 * Math.atan(window.innerHeight / 2 / cameraPosition) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    objects.forEach((object) => {
      const bounds = object.img.getBoundingClientRect();
      object.width = bounds.width;
      object.height = bounds.height;
      object.top = getObjectTop(bounds);
      object.left = bounds.left;
      object.mesh.scale.set(bounds.width, bounds.height, 1);
      object.material.uniforms.uQuadSize.value.x = bounds.width;
      object.material.uniforms.uQuadSize.value.y = bounds.height;
    });
  }

  lenis.on("scroll", onScroll);
  window.addEventListener("resize", handleResize);
  createMeshes();
  render();

  return () => {
    active = false;
    lenis.off("scroll", onScroll);
    window.removeEventListener("resize", handleResize);
    window.cancelAnimationFrame(frame);
    media.forEach((img) => {
      img.style.opacity = "1";
    });
    objects.forEach((object) => {
      object.texture?.dispose?.();
      object.material.dispose();
      object.mesh.geometry.dispose();
    });
    material.dispose();
    geometry.dispose();
    renderer.domElement.remove();
    renderer.dispose();
  };
}

function initParticleVisual(
  root: HTMLElement,
  asset: (path: string) => string,
) {
  const canvas = root.querySelector<HTMLCanvasElement>("#particle-canvas");
  if (!canvas) return () => {};
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
    desynchronized: true,
  });
  if (!gl) return () => {};

  const config = {
    canvasBg: "#e30613",
    distortionRadius: 2000,
    forceStrength: 0.05,
    logoPath: asset("lab/hero-visual.png"),
    logoSize: 2000,
    maxDisplacement: 1000,
    particleSpacing: 2,
    returnForce: 0.1,
  };
  const state = {
    geometry: null as null | {
      colBuf: WebGLBuffer;
      count: number;
      posBuf: WebGLBuffer;
    },
    isMobile: window.innerWidth < 1000,
    mouse: { x: 0, y: 0 },
    particles: [] as {
      i: number;
      j: number;
      ox: number;
      oy: number;
      vx: number;
      vy: number;
    }[],
    posArray: null as Float32Array | null,
    program: null as WebGLProgram | null,
  };
  let frame = 0;
  let active = true;
  let vShader: WebGLShader | null = null;
  let fShader: WebGLShader | null = null;
  let execCount = 0;

  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
  }

  function setupShaders() {
    const vs = `
      precision mediump float;
      uniform vec2 u_resolution;
      attribute vec2 a_position;
      attribute vec4 a_color;
      varying vec4 v_color;
      void main() {
        vec2 clip = (a_position / u_resolution * 2.0 - 1.0) * vec2(1.0, -1.0);
        v_color = a_color;
        gl_Position = vec4(clip, 0.0, 1.0);
        gl_PointSize = 3.0;
      }`;

    const fs = `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        if (v_color.a < 0.01) discard;
        float dist = length(gl_PointCoord - 0.5);
        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
      }`;

    vShader = gl.createShader(gl.VERTEX_SHADER);
    fShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vShader || !fShader) return;

    gl.shaderSource(vShader, vs);
    gl.compileShader(vShader);
    gl.shaderSource(fShader, fs);
    gl.compileShader(fShader);

    state.program = gl.createProgram();
    if (!state.program) return;
    gl.attachShader(state.program, vShader);
    gl.attachShader(state.program, fShader);
    gl.bindAttribLocation(state.program, 0, "a_position");
    gl.bindAttribLocation(state.program, 1, "a_color");
    gl.linkProgram(state.program);
  }

  function createParticles(pixels: Uint8ClampedArray) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = Math.min(innerWidth / 1920, 1);
    const dim = config.logoSize;
    const spacing = config.particleSpacing;
    const pos: number[] = [];
    const colors: number[] = [];

    state.particles = [];

    for (let i = 0; i < dim; i += spacing) {
      for (let j = 0; j < dim; j += spacing) {
        const idx = (i * dim + j) * 4;
        if (pixels[idx + 3] > 50) {
          const x = cx + (j - dim / 2) * scale;
          const y = cy + (i - dim / 2) * scale;

          pos.push(x, y);
          colors.push(
            pixels[idx] / 255,
            pixels[idx + 1] / 255,
            pixels[idx + 2] / 255,
            pixels[idx + 3] / 255,
          );
          state.particles.push({ ox: x, oy: y, vx: 0, vy: 0, i, j });
        }
      }
    }

    state.posArray = new Float32Array(pos);
    const posBuf = gl.createBuffer();
    const colBuf = gl.createBuffer();
    if (!posBuf || !colBuf) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, state.posArray, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    state.geometry = { posBuf, colBuf, count: state.particles.length };
    animate();
  }

  function loadImage() {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!active) return;
      const temp = document.createElement("canvas");
      const ctx = temp.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      temp.width = temp.height = config.logoSize;

      const s = config.logoSize * 0.9;
      const o = (config.logoSize - s) / 2;
      ctx.drawImage(img, o, o, s, s);

      createParticles(
        ctx.getImageData(0, 0, config.logoSize, config.logoSize).data,
      );
    };
    img.src = config.logoPath;
  }

  function render() {
    if (!state.program || !state.geometry) return;
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      config.canvasBg,
    );
    if (!rgb) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(
      Number.parseInt(rgb[1], 16) / 255,
      Number.parseInt(rgb[2], 16) / 255,
      Number.parseInt(rgb[3], 16) / 255,
      1,
    );
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(state.program);

    gl.uniform2f(
      gl.getUniformLocation(state.program, "u_resolution"),
      canvas.width,
      canvas.height,
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, state.geometry.posBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, state.geometry.colBuf);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, state.geometry.count);
  }

  function animate() {
    frame = window.requestAnimationFrame(animate);
    if (!state.geometry || !state.posArray) return;

    if (!state.isMobile && execCount > 0) {
      execCount--;
      const rad = config.distortionRadius ** 2;
      let needsUpdate = false;

      for (let i = 0; i < state.particles.length; i++) {
        const x = state.posArray[i * 2];
        const y = state.posArray[i * 2 + 1];
        const p = state.particles[i];
        const dx = state.mouse.x - x;
        const dy = state.mouse.y - y;
        const dis = dx * dx + dy * dy;

        if (dis < rad && dis > 0) {
          const f = -rad / dis;
          const distOrig = Math.sqrt((x - p.ox) ** 2 + (y - p.oy) ** 2);
          const mult = Math.max(
            0.1,
            1 - distOrig / (config.maxDisplacement * 2),
          );
          p.vx +=
            f * Math.cos(Math.atan2(dy, dx)) * config.forceStrength * mult;
          p.vy +=
            f * Math.sin(Math.atan2(dy, dx)) * config.forceStrength * mult;
          needsUpdate = true;
        }

        if (Math.abs(p.vx) > 0.01 || Math.abs(p.vy) > 0.01) {
          const nx = x + (p.vx *= 0.82) + (p.ox - x) * config.returnForce;
          const ny = y + (p.vy *= 0.82) + (p.oy - y) * config.returnForce;
          const dox = nx - p.ox;
          const doy = ny - p.oy;
          const distOrig = Math.sqrt(dox * dox + doy * doy);

          if (distOrig > config.maxDisplacement) {
            const s = config.maxDisplacement / distOrig;
            const ds =
              s +
              (1 - s) * Math.exp(-(distOrig - config.maxDisplacement) * 0.02);
            state.posArray[i * 2] = p.ox + dox * ds;
            state.posArray[i * 2 + 1] = p.oy + doy * ds;
            p.vx *= 0.7;
            p.vy *= 0.7;
          } else {
            state.posArray[i * 2] = nx;
            state.posArray[i * 2 + 1] = ny;
          }
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        gl.bindBuffer(gl.ARRAY_BUFFER, state.geometry.posBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, state.posArray);
      }
    }

    render();
  }

  function handleMouseMove(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    state.mouse.x = (event.clientX - rect.left) * dpr;
    state.mouse.y = (event.clientY - rect.top) * dpr;
    execCount = 300;
  }

  function handleResize() {
    state.isMobile = innerWidth < 1000;
    sizeCanvas();
    if (!state.geometry || !state.posArray) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = Math.min(innerWidth / 1920, 1);
    const dim = config.logoSize;

    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];
      p.ox = cx + (p.j - dim / 2) * scale;
      p.oy = cy + (p.i - dim / 2) * scale;
      p.vx = 0;
      p.vy = 0;
      state.posArray[i * 2] = p.ox;
      state.posArray[i * 2 + 1] = p.oy;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, state.geometry.posBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, state.posArray);
  }

  sizeCanvas();
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  setupShaders();
  loadImage();
  if (!state.isMobile) {
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
  }
  window.addEventListener("resize", handleResize);

  return () => {
    active = false;
    window.cancelAnimationFrame(frame);
    document.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("resize", handleResize);
    if (state.geometry) {
      gl.deleteBuffer(state.geometry.posBuf);
      gl.deleteBuffer(state.geometry.colBuf);
    }
    if (state.program) {
      if (vShader) gl.detachShader(state.program, vShader);
      if (fShader) gl.detachShader(state.program, fShader);
      gl.deleteProgram(state.program);
    }
    if (vShader) gl.deleteShader(vShader);
    if (fShader) gl.deleteShader(fShader);
  };
}

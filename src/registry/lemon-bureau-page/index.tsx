// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP + WebGL template port.

"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Observer } from "gsap/Observer";
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
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";

import { getLemonBureauFragment, type LemonBureauRoute } from "./fragments";
import { initParticleVisual } from "./particle-visual";
import { initSimulation } from "./simulation";
import { getLemonBureauPageStyles } from "./styles";
import { Simulator, setSimulatorShaderBase, WrappedGL } from "./webgl";

gsap.registerPlugin(ScrollTrigger, SplitText, Observer, CustomEase);

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/lemon-bureau-page";

export const LEMON_BUREAU_PAGE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/studio", label: "Studio" },
  { path: "/work", label: "Work" },
  { path: "/sample-project", label: "Project" },
  { path: "/contact", label: "Contact" },
] as const;

const ROUTE_SET = new Set(LEMON_BUREAU_PAGE_ROUTES.map((route) => route.path));

const PRELOADER_SEEN_KEY = "lemonBureauPreloaderSeen";
const PRELOADER_START_DELAY_S = 1;
const PRELOADER_HERO_DELAY_S = 3.25;

function normalizePath(path: string): LemonBureauRoute {
  const clean =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .trim()
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\.\//, "")
      .replace(/^\.\.\//, "")
      .replace(/^pages\//, "")
      .replace(/\.html$/, "")
      .replace(/\/$/, "") || "/";

  if (clean === "index" || clean === "/index") return "/";

  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  return ROUTE_SET.has(withSlash) ? (withSlash as LemonBureauRoute) : "/";
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

function scrollToTop(scroller: HTMLElement | Window | null, lenis?: Lenis) {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
    return;
  }
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

    const scrollSettings = {
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 1,
      infinite: false,
      lerp: 0.1,
      orientation: "vertical",
      smoothWheel: true,
      syncTouch: true,
    };

    if (scroller instanceof HTMLElement) {
      previousOverflowAnchor = scroller.style.overflowAnchor;
      previousOverscrollBehavior = scroller.style.overscrollBehavior;
      previousScrollBehavior = scroller.style.scrollBehavior;
      scroller.style.overflowAnchor = "none";
      scroller.style.overscrollBehavior = "contain";
      scroller.style.scrollBehavior = "auto";
      lenis = new Lenis({
        ...scrollSettings,
        wrapper: scroller,
        content: rootElement,
      });
      ScrollTrigger.defaults({ scroller });
    } else {
      lenis = new Lenis(scrollSettings);
      ScrollTrigger.defaults({ scroller: undefined });
    }

    lenis.on("scroll", ScrollTrigger.update);
    ticker = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    setState({ scroller, lenis });

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      if (ticker) gsap.ticker.remove(ticker);
      lenis?.destroy();
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

export interface LemonBureauPageProps {
  assetBase?: string;
  initialPath?: LemonBureauRoute | string;
  className?: string;
  style?: CSSProperties;
}

export default function LemonBureauPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: LemonBureauPageProps) {
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const [pathname, setPathname] = useState<LemonBureauRoute>(() =>
    normalizePath(initialPath),
  );
  const { scroller, lenis } = useScrollRuntime(rootElement);
  const css = useMemo(() => getLemonBureauPageStyles(assetBase), [assetBase]);

  useEffect(() => {
    setPathname(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = useCallback(
    (path: string) => {
      setPathname(normalizePath(path));
      scrollToTop(scroller, lenis ?? undefined);
    },
    [lenis, scroller],
  );

  return (
    <div
      ref={setRootElement}
      className={["lemon-bureau-page", className].filter(Boolean).join(" ")}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {rootElement && scroller && lenis ? (
        <LemonBureauRouteView
          key={pathname}
          assetBase={assetBase}
          lenis={lenis}
          navigate={navigate}
          pathname={pathname}
          scroller={scroller}
        />
      ) : null}
    </div>
  );
}

function LemonBureauRouteView({
  assetBase,
  lenis,
  navigate,
  pathname,
  scroller,
}: {
  assetBase: string;
  lenis: Lenis;
  navigate: (path: string) => void;
  pathname: LemonBureauRoute;
  scroller: HTMLElement | Window;
}) {
  const [routeElement, setRouteElement] = useState<HTMLDivElement | null>(null);
  const html = useMemo(
    () => getLemonBureauFragment(pathname, assetBase),
    [assetBase, pathname],
  );

  useLemonBureauEffects({
    assetBase,
    lenis,
    navigate,
    pathname,
    root: routeElement,
    scroller,
  });

  return (
    <div
      ref={setRouteElement}
      className={`lemon-bureau-route lemon-bureau-route-${
        pathname === "/" ? "index" : pathname.slice(1)
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function useLemonBureauEffects({
  assetBase,
  lenis,
  navigate,
  pathname,
  root,
  scroller,
}: {
  assetBase: string;
  lenis: Lenis;
  navigate: (path: string) => void;
  pathname: LemonBureauRoute;
  root: HTMLElement | null;
  scroller: HTMLElement | Window;
}) {
  useLayoutEffect(() => {
    if (!root) return;

    const base = assetBase.replace(/\/$/, "");
    const cleanups: Array<() => void> = [];
    const q = <T extends Element = HTMLElement>(s: string) =>
      root.querySelector<T>(s);
    const qa = <T extends Element = HTMLElement>(s: string) =>
      Array.from(root.querySelectorAll<T>(s));

    const preloaderShowing =
      !!q(".preloader") &&
      (typeof sessionStorage === "undefined" ||
        sessionStorage.getItem(PRELOADER_SEEN_KEY) !== "true");

    const ctx = gsap.context(() => {
      setupLinks();
      setupCursor();
      setupSimulation();
      setupAnimatedCopy();
      setupPreloader();
      setupNav();
      setupHomeHero();
      setupStudioHero();
      setupTeamCards();
      setupClients();
      setupWork();
      setupParticleVisual();
      setupContactCube();
      setupFooterFluid();
    }, root);

    const refreshFrame = window.requestAnimationFrame(() => {
      lenis.resize?.();
      ScrollTrigger.refresh();
    });
    cleanups.push(() => window.cancelAnimationFrame(refreshFrame));

    // Refresh once fonts + images settle so pinned sections measure correctly.
    const refresh = () => {
      lenis.resize?.();
      ScrollTrigger.refresh();
    };
    document.fonts?.ready?.then(refresh).catch(() => {});
    qa<HTMLImageElement>("img").forEach((img) => {
      if (img.complete) return;
      img.addEventListener("load", refresh, { once: true });
      img.addEventListener("error", refresh, { once: true });
    });

    return () => {
      cleanups.splice(0).forEach((fn) => fn());
      ctx.revert();
    };

    // ── SPA link interception ────────────────────────────────────────────
    function setupLinks() {
      const onClick = (event: MouseEvent) => {
        const a = (event.target as HTMLElement)?.closest?.(
          "a[href]",
        ) as HTMLAnchorElement | null;
        if (!a || !root.contains(a)) return;
        const href = a.getAttribute("href");
        if (
          !href ||
          href === "#" ||
          href.startsWith("http") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ) {
          if (!href || href === "#") event.preventDefault();
          return;
        }
        event.preventDefault();
        const next = normalizePath(href);
        if (next === pathname) return;
        navigate(next);
      };
      root.addEventListener("click", onClick);
      cleanups.push(() => root.removeEventListener("click", onClick));
    }

    // ── Custom cursor ────────────────────────────────────────────────────
    function setupCursor() {
      if (!window.matchMedia?.("(pointer: fine)").matches) return;

      let el = q<HTMLDivElement>("#custom-cursor");
      if (!el) {
        el = document.createElement("div");
        el.id = "custom-cursor";
        root.appendChild(el);
      }
      const cursor = el;

      let tx = -100;
      let ty = -100;
      let cx = tx;
      let cy = ty;
      let raf: number | null = null;
      const k = 0.1;

      const tick = () => {
        cx += (tx - cx) * k;
        cy += (ty - cy) * k;
        cursor.style.setProperty("--x", `${cx}px`);
        cursor.style.setProperty("--y", `${cy}px`);
        raf = requestAnimationFrame(tick);
      };

      const onPointerMove = (e: PointerEvent) => {
        tx = e.clientX;
        ty = e.clientY;
        cursor.classList.add("is-visible");
        raf ??= requestAnimationFrame(tick);
      };
      const onLeave = () => cursor.classList.remove("is-visible");

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("mouseleave", onLeave);
        if (cursor.parentElement === root) cursor.remove();
      });
    }

    // ── Full-page fluid-ink background ───────────────────────────────────
    function setupSimulation() {
      const dispose = initSimulation(root);
      cleanups.push(dispose);
    }

    // ── Animated copy (SplitText slide masks) ────────────────────────────
    function setupAnimatedCopy() {
      const heroEl = q(".hero");
      const elements = qa("[data-animate-variant]");
      const splits: SplitText[] = [];

      const run = () => {
        elements.forEach((element) => {
          const variant = element.getAttribute("data-animate-variant");
          if (
            variant !== "slide" &&
            variant !== "slide-lines" &&
            variant !== "slide-words"
          )
            return;

          const animateOnScroll =
            element.getAttribute("data-animate-on-scroll") === "true";
          let delay =
            parseFloat(element.getAttribute("data-animate-delay")) || 0;
          if (
            preloaderShowing &&
            !animateOnScroll &&
            heroEl &&
            heroEl.contains(element)
          ) {
            delay += PRELOADER_HERO_DELAY_S;
          }
          const duration =
            parseFloat(element.getAttribute("data-animate-duration")) || 0.75;
          const stagger =
            parseFloat(element.getAttribute("data-animate-stagger")) || 0.1;
          const start = (
            element.getAttribute("data-animate-start") || "top 70%"
          ).trim();

          const splitType =
            variant === "slide-words"
              ? "words"
              : variant === "slide-lines"
                ? "lines"
                : (element.getAttribute("data-animate-split") || "").trim() ===
                    "words"
                  ? "words"
                  : "lines";

          const split = SplitText.create(element, {
            type: splitType,
            mask: splitType,
            autoSplit: true,
            linesClass: "line",
            wordsClass: "word",
            onSplit(self) {
              const targets = splitType === "words" ? self.words : self.lines;
              gsap.set(targets, { yPercent: 100 });
              const animation = gsap.to(targets, {
                yPercent: 0,
                duration,
                ease: "power3.out",
                delay,
                stagger,
                paused: animateOnScroll,
              });
              if (animateOnScroll) {
                ScrollTrigger.create({
                  trigger: element,
                  start,
                  animation,
                  toggleActions: "play none none none",
                });
              }
            },
          });
          splits.push(split);
        });
      };

      const fontsReady = document.fonts?.ready;
      if (fontsReady?.then) fontsReady.then(run).catch(run);
      else run();

      cleanups.push(() => splits.forEach((s) => s.revert?.()));
    }

    // ── Preloader (home only) ────────────────────────────────────────────
    function setupPreloader() {
      const preloader = q(".preloader");
      const splitOverlay = q(".split-overlay");
      const tagsOverlay = q(".tags-overlay");
      if (!preloader || !splitOverlay || !tagsOverlay) return;

      const hide = () =>
        [preloader, splitOverlay, tagsOverlay].forEach((el) => {
          el.style.display = "none";
        });

      if (!preloaderShowing) {
        hide();
        return;
      }

      CustomEase.create("hop", ".8, 0, .3, 1");
      lenis.stop();

      const titles = qa(".preloader h1, .split-overlay h1, .tags-overlay p");
      gsap.set(titles, { opacity: 0 });

      const localSplits: SplitText[] = [];
      const splitTextElements = (selector, type, addFirstChar = false) => {
        qa(selector).forEach((element) => {
          const st = new SplitText(element, {
            type,
            wordsClass: "word",
            charsClass: "char",
          });
          localSplits.push(st);
          if (type.includes("chars")) {
            st.chars.forEach((char, index) => {
              char.innerHTML = `<span>${char.textContent}</span>`;
              if (addFirstChar && index === 0) char.classList.add("first-char");
            });
          }
        });
      };

      splitTextElements(".intro-title h1", "words, chars", true);
      splitTextElements(".tag p", "words");

      gsap.set(".split-overlay .intro-title .char span", { y: "0%" });

      const tl = gsap.timeline({
        defaults: { ease: "hop" },
        delay: PRELOADER_START_DELAY_S,
        onComplete: () => {
          try {
            sessionStorage.setItem(PRELOADER_SEEN_KEY, "true");
          } catch {}
          hide();
          lenis.start();
        },
      });

      const reveal = () =>
        gsap.delayedCall(PRELOADER_START_DELAY_S, () => {
          gsap.set(titles, { opacity: 1 });
        });
      const fontsReady = document.fonts?.ready;
      if (fontsReady?.then) fontsReady.then(reveal).catch(reveal);
      else reveal();

      const tags = gsap.utils.toArray(qa(".tag"));
      tags.forEach((tag, index) => {
        tl.to(
          tag.querySelectorAll("p .word"),
          { y: "0%", duration: 0.75 },
          0.5 + index * 0.1,
        );
      });

      tl.to(
        ".preloader .intro-title .char span",
        { y: "0%", duration: 0.75, stagger: 0.05 },
        0.5,
      ).to(
        ".split-overlay .intro-title .char span",
        { y: "0%", duration: 0.75, stagger: 0.05 },
        0.5,
      );

      tags.forEach((tag, index) => {
        tl.to(
          tag.querySelectorAll("p .word"),
          { y: "110%", duration: 0.75 },
          2 + index * 0.1,
        );
      });

      tl.set(
        [".preloader", ".split-overlay"],
        {
          clipPath: (i) =>
            i === 0
              ? "polygon(0 0, 100% 0, 100% 50%, 0 50%)"
              : "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
        },
        2.5,
      ).to(
        [".preloader", ".split-overlay"],
        { y: (i) => (i === 0 ? "-50%" : "50%"), duration: 1 },
        2.5,
      );

      cleanups.push(() => {
        tl.kill();
        localSplits.forEach((s) => s.revert?.());
      });
    }

    // ── Navigation menu ──────────────────────────────────────────────────
    function setupNav() {
      const nav = q("nav");
      if (!nav) return;

      const menuItems = [
        { label: "Home", route: "/" },
        { label: "Studio", route: "/studio" },
        { label: "Work", route: "/work" },
        { label: "Project", route: "/sample-project" },
        { label: "Contact", route: "/contact" },
      ];

      const toggler = nav.querySelector<HTMLElement>(".nav-toggler");
      if (toggler) {
        toggler.innerHTML = `
          <div class="nav-toggle-wrapper">
            <p class="open-label">Menu</p>
            <p class="close-label">Close</p>
          </div>`;
      }

      const overlay = document.createElement("div");
      overlay.className = "menu-overlay";
      overlay.innerHTML = `
        <div class="menu-content">
          <div class="menu-col" data-col="0">
            <div class="menu-content-group">
              <p>&copy; Lemon Bureau</p>
              <p>Seaside Studio Block</p>
              <p>Oslo</p>
            </div>
            <div class="menu-content-group">
              <p>Edition</p>
              <p>Late Vol. 04</p>
            </div>
            <div class="menu-content-group">
              <p>Say Hello</p>
              <p>hello@lemonbureau.com</p>
            </div>
            <div class="menu-content-group">
              <p>Hotline</p>
              <p>+33 1 23 45 67 89</p>
            </div>
          </div>
          <div class="menu-col" data-col="1">
            <div class="menu-content-group">
              <p>Socials</p>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer">YouTube</a>
            </div>
            <div class="menu-content-group">
              <p>Language</p>
              <p>Human</p>
            </div>
            <div class="menu-content-group">
              <p>Credits</p>
              <p>Made by BLANK</p>
              <p>MWT APR 2026</p>
            </div>
          </div>
        </div>
        <div class="menu-img">
          <img src="${base}/menu/menu-img.jpg" alt="" />
        </div>
        <div class="menu-links-wrapper">
          ${menuItems
            .map(
              (item) => `
            <div class="menu-link" data-route="${item.route}">
              <a href="${item.route}">
                <span>${item.label}</span>
                <span>${item.label}</span>
              </a>
            </div>`,
            )
            .join("")}
          <div class="link-highlighter"></div>
        </div>`;
      root.appendChild(overlay);

      const navToggler = toggler;
      const menuOverlay = overlay;
      const menuImage =
        overlay.querySelector<HTMLImageElement>(".menu-img img");
      const menuLinksWrapper = overlay.querySelector<HTMLElement>(
        ".menu-links-wrapper",
      );
      const linkHighlighter =
        overlay.querySelector<HTMLElement>(".link-highlighter");
      const menuLinks = Array.from(overlay.querySelectorAll(".menu-link a"));
      const menuLinkContainers = Array.from(
        overlay.querySelectorAll<HTMLElement>(".menu-link"),
      );
      const openLabel = overlay.ownerDocument
        ? nav.querySelector<HTMLElement>(".open-label")
        : null;
      const closeLabel = nav.querySelector<HTMLElement>(".close-label");
      const menuCols = Array.from(
        overlay.querySelectorAll<HTMLElement>(".menu-col"),
      );

      let isMenuOpen = false;
      let isMenuAnimating = false;
      const splitInstances: SplitText[] = [];

      let currentX = 0;
      let targetX = 0;
      const lerpFactor = 0.05;
      let currentHighlighterX = 0;
      let targetHighlighterX = 0;
      let currentHighlighterWidth = 0;
      let targetHighlighterWidth = 0;
      let rafId: number | null = null;

      function setupLinkSplits() {
        menuLinks.forEach((link) => {
          link.querySelectorAll("span").forEach((span, i) => {
            const split = new SplitText(span, { type: "chars" });
            splitInstances.push(split);
            split.chars.forEach((c) => c.classList.add("char"));
            if (i === 1) gsap.set(split.chars, { y: "110%" });
          });
        });
      }

      function setupColSplits() {
        if (isMenuOpen) return;
        menuCols.forEach((col) => {
          col.querySelectorAll("p, a").forEach((el) => {
            const split = SplitText.create(el, {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
            });
            splitInstances.push(split);
            gsap.set(split.lines, { y: "100%" });
          });
        });
      }

      function setInitialStates() {
        gsap.set(menuImage, { y: 0, scale: 0.5, opacity: 0.25 });
        gsap.set(menuLinks, { y: "150%" });
        gsap.set(linkHighlighter, { y: "150%" });

        const firstLinkContainer = menuLinkContainers[0];
        const firstLinkSpan = firstLinkContainer?.querySelector("a span");
        if (firstLinkSpan && linkHighlighter && menuLinksWrapper) {
          const linkWidth = firstLinkSpan.offsetWidth;
          linkHighlighter.style.width = linkWidth + "px";
          currentHighlighterWidth = linkWidth;
          targetHighlighterWidth = linkWidth;
          const linkRect = firstLinkContainer.getBoundingClientRect();
          const wrapperRect = menuLinksWrapper.getBoundingClientRect();
          const initialX = linkRect.left - wrapperRect.left;
          currentHighlighterX = initialX;
          targetHighlighterX = initialX;
        }
      }

      function animateLoop() {
        currentX += (targetX - currentX) * lerpFactor;
        currentHighlighterX +=
          (targetHighlighterX - currentHighlighterX) * lerpFactor;
        currentHighlighterWidth +=
          (targetHighlighterWidth - currentHighlighterWidth) * lerpFactor;
        gsap.set(menuLinksWrapper, { x: currentX });
        gsap.set(linkHighlighter, {
          x: currentHighlighterX,
          width: currentHighlighterWidth,
        });
        rafId = requestAnimationFrame(animateLoop);
      }

      function onMouseMove(e: MouseEvent) {
        if (window.innerWidth < 1000) return;
        const mouseX = e.clientX;
        const viewportWidth = window.innerWidth;
        const wrapperWidth = menuLinksWrapper.offsetWidth;
        const maxMoveRight = viewportWidth - wrapperWidth;
        const sensitivityRange = viewportWidth * 0.5;
        const startX = (viewportWidth - sensitivityRange) / 2;
        const endX = startX + sensitivityRange;
        let pct;
        if (mouseX <= startX) pct = 0;
        else if (mouseX >= endX) pct = 1;
        else pct = (mouseX - startX) / sensitivityRange;
        targetX = pct * maxMoveRight;
      }

      function onLinksWrapperLeave() {
        const firstContainer = menuLinkContainers[0];
        const firstSpan = firstContainer?.querySelector("a span");
        if (!firstSpan) return;
        const linkRect = firstContainer.getBoundingClientRect();
        const wrapperRect = menuLinksWrapper.getBoundingClientRect();
        targetHighlighterX = linkRect.left - wrapperRect.left;
        targetHighlighterWidth = firstSpan.offsetWidth;
      }

      function startDesktopTracking() {
        if (window.innerWidth < 1000 || rafId) return;
        menuOverlay.addEventListener("mousemove", onMouseMove);
        menuLinksWrapper.addEventListener("mouseleave", onLinksWrapperLeave);
        rafId = requestAnimationFrame(animateLoop);
      }
      function stopDesktopTracking() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        menuOverlay.removeEventListener("mousemove", onMouseMove);
        menuLinksWrapper.removeEventListener("mouseleave", onLinksWrapperLeave);
      }

      function onLinkEnter(container: HTMLElement) {
        if (window.innerWidth < 1000) return;
        const spans = container.querySelectorAll("a span");
        if (spans.length < 2) return;
        gsap.to(spans[0].querySelectorAll(".char"), {
          y: "-110%",
          stagger: 0.05,
          duration: 0.5,
          ease: "expo.inOut",
        });
        gsap.to(spans[1].querySelectorAll(".char"), {
          y: "0%",
          stagger: 0.05,
          duration: 0.5,
          ease: "expo.inOut",
        });
        const linkRect = container.getBoundingClientRect();
        const wrapperRect = menuLinksWrapper.getBoundingClientRect();
        targetHighlighterX = linkRect.left - wrapperRect.left;
        const firstSpan = container.querySelector("a span");
        targetHighlighterWidth = firstSpan
          ? firstSpan.offsetWidth
          : container.offsetWidth;
      }
      function onLinkLeave(container: HTMLElement) {
        if (window.innerWidth < 1000) return;
        const spans = container.querySelectorAll("a span");
        if (spans.length < 2) return;
        gsap.to(spans[1].querySelectorAll(".char"), {
          y: "110%",
          stagger: 0.05,
          duration: 0.5,
          ease: "expo.inOut",
        });
        gsap.to(spans[0].querySelectorAll(".char"), {
          y: "0%",
          stagger: 0.05,
          duration: 0.5,
          ease: "expo.inOut",
        });
      }

      const enterHandlers: Array<[HTMLElement, () => void, () => void]> = [];
      menuLinkContainers.forEach((container) => {
        const enter = () => onLinkEnter(container);
        const leave = () => onLinkLeave(container);
        container.addEventListener("mouseenter", enter);
        container.addEventListener("mouseleave", leave);
        enterHandlers.push([container, enter, leave]);
      });

      function toggleMenu() {
        if (isMenuAnimating) return;
        isMenuAnimating = true;

        if (!isMenuOpen) {
          lenis.stop();
          startDesktopTracking();
          gsap.to(openLabel, { y: "-100%", duration: 1, ease: "power3.out" });
          gsap.to(closeLabel, { y: "-100%", duration: 1, ease: "power3.out" });
          gsap.to(menuOverlay, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
            duration: 1.25,
            ease: "expo.out",
            onComplete: () => {
              menuLinkContainers.forEach((c) => (c.style.overflow = "visible"));
              isMenuOpen = true;
              isMenuAnimating = false;
            },
          });
          gsap.to(menuImage, {
            scale: 1,
            opacity: 1,
            duration: 1.5,
            ease: "expo.out",
          });
          gsap.to(menuLinks, {
            y: "0%",
            duration: 1.25,
            stagger: 0.1,
            delay: 0.25,
            ease: "expo.out",
          });
          gsap.to(linkHighlighter, {
            y: "0%",
            duration: 1,
            delay: 1,
            ease: "expo.out",
          });
          menuCols.forEach((col) => {
            gsap.to(col.querySelectorAll(".split-line"), {
              y: "0%",
              duration: 1,
              stagger: 0.05,
              delay: 0.5,
              ease: "expo.out",
            });
          });
        } else {
          gsap.to(openLabel, { y: "0%", duration: 1, ease: "power3.out" });
          gsap.to(closeLabel, { y: "0%", duration: 1, ease: "power3.out" });
          gsap.to(menuImage, {
            y: "-25svh",
            opacity: 0.5,
            duration: 1.25,
            ease: "expo.out",
          });
          menuCols.forEach((col) => {
            gsap.to(col.querySelectorAll(".split-line"), {
              y: "-100%",
              duration: 1,
              stagger: 0,
              ease: "expo.out",
            });
          });
          gsap.to(menuOverlay, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.25,
            ease: "expo.out",
            onComplete: () => {
              stopDesktopTracking();
              gsap.set(menuOverlay, {
                clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              });
              gsap.set(menuLinks, { y: "150%" });
              gsap.set(linkHighlighter, { y: "150%" });
              gsap.set(menuImage, { y: "0", scale: 0.5, opacity: 0.25 });
              menuLinkContainers.forEach((c) => (c.style.overflow = "hidden"));
              menuCols.forEach((col) => {
                gsap.set(col.querySelectorAll(".split-line"), { y: "100%" });
              });
              gsap.set(menuLinksWrapper, { x: 0 });
              currentX = 0;
              targetX = 0;
              setupColSplits();
              isMenuOpen = false;
              isMenuAnimating = false;
              lenis.start();
            },
          });
        }
      }

      navToggler?.addEventListener("click", toggleMenu);

      setupLinkSplits();
      setupColSplits();
      setInitialStates();

      cleanups.push(() => {
        if (rafId) cancelAnimationFrame(rafId);
        stopDesktopTracking();
        navToggler?.removeEventListener("click", toggleMenu);
        enterHandlers.forEach(([c, enter, leave]) => {
          c.removeEventListener("mouseenter", enter);
          c.removeEventListener("mouseleave", leave);
        });
        splitInstances.forEach((s) => s.revert?.());
        overlay.remove();
      });
    }

    // ── Home hero cursor tilt ────────────────────────────────────────────
    function setupHomeHero() {
      const setupTilt = (container: HTMLElement | null, target) => {
        if (!container || !target) return;
        const state = {
          currentX: 0,
          currentY: 0,
          targetX: 0,
          targetY: 0,
          raf: null as number | null,
          isInside: false,
        };
        const LERP = 0.05;
        const MAX = 20;

        const render = () => {
          state.currentX += (state.targetX - state.currentX) * LERP;
          state.currentY += (state.targetY - state.currentY) * LERP;
          gsap.set(target, {
            rotateX: state.currentY,
            rotateY: state.currentX,
            transformPerspective: 1000,
            transformOrigin: "center center",
            force3D: true,
          });
          const settled =
            Math.abs(state.currentX - state.targetX) < 0.01 &&
            Math.abs(state.currentY - state.targetY) < 0.01;
          if (settled && !state.isInside) {
            state.raf = null;
            return;
          }
          state.raf = requestAnimationFrame(render);
        };
        const ensureLoop = () => {
          if (!state.raf) state.raf = requestAnimationFrame(render);
        };
        const onMove = (event: MouseEvent) => {
          const rect = container.getBoundingClientRect();
          const nx = (event.clientX - rect.left) / rect.width - 0.5;
          const ny = (event.clientY - rect.top) / rect.height - 0.5;
          state.targetX = nx * MAX;
          state.targetY = -ny * MAX;
          state.isInside = true;
          ensureLoop();
        };
        const onLeave = () => {
          state.targetX = 0;
          state.targetY = 0;
          state.isInside = false;
          ensureLoop();
        };
        container.addEventListener("mousemove", onMove);
        container.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          if (state.raf) cancelAnimationFrame(state.raf);
          container.removeEventListener("mousemove", onMove);
          container.removeEventListener("mouseleave", onLeave);
        });
      };

      setupTilt(q(".hero"), q(".hero-header"));
      setupTilt(q(".particle-canvas"), q(".particle-header h1"));
    }

    // ── Studio hero pin ──────────────────────────────────────────────────
    function setupStudioHero() {
      const hero = q(".studio-hero");
      if (!hero) return;
      const header1 = q(".studio-hero-header:nth-child(1)");
      const header2 = q(".studio-hero-header:nth-child(2)");
      const img = q(".studio-hero-img");
      const imgEl = q(".studio-hero-img img");

      ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: () => `+=${window.innerHeight * 3}px`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        refreshPriority: 10,
        onUpdate: (self) => {
          const p = self.progress;
          const iw = window.innerWidth;
          const ih = window.innerHeight;
          gsap.set(header1, {
            x: -iw * 3 * p,
            y: ih * 0.5 * p,
            scale: 1 + 9 * p,
          });
          gsap.set(header2, {
            x: iw * 3 * p,
            y: ih * 0.5 * p,
            scale: 1 + 9 * p,
          });
          const s = {
            tl: 37.5,
            tt: 20,
            tr: 62.5,
            tb: 20,
            br: 62.5,
            bb: 80,
            bl: 37.5,
            bbt: 80,
          };
          const e = {
            tl: 0,
            tt: 0,
            tr: 100,
            tb: 0,
            br: 100,
            bb: 100,
            bl: 0,
            bbt: 100,
          };
          const lerp = (a, b) => a + (b - a) * p;
          gsap.set(img, {
            rotation: 30 * (1 - p),
            clipPath: `polygon(${lerp(s.tl, e.tl)}% ${lerp(s.tt, e.tt)}%, ${lerp(
              s.tr,
              e.tr,
            )}% ${lerp(s.tb, e.tb)}%, ${lerp(s.br, e.br)}% ${lerp(
              s.bb,
              e.bb,
            )}%, ${lerp(s.bl, e.bl)}% ${lerp(s.bbt, e.bbt)}%)`,
          });
          gsap.set(imgEl, { scale: 2 - p });
        },
      });
    }

    // ── Studio team cards ────────────────────────────────────────────────
    function setupTeamCards() {
      const mountEl = q("#team-cards");
      if (!mountEl) return;

      const teamMembers = [
        {
          id: "card-1",
          name: "Ren Nakamura",
          img: `${base}/team-cards/team-member-1.jpg`,
          description:
            "Art director with a sharp eye and sharper instincts. Sees the grid others miss.",
        },
        {
          id: "card-2",
          name: "Sable Voss",
          img: `${base}/team-cards/team-member-2.jpg`,
          description:
            "Brand strategist and tone setter. Turns vague briefs into something people actually feel.",
        },
        {
          id: "card-3",
          name: "Cleo Marsh",
          img: `${base}/team-cards/team-member-3.jpg`,
          description:
            "Visual storyteller obsessed with texture, light, and the space between both.",
        },
        {
          id: "card-4",
          name: "Yori Tanaka",
          img: `${base}/team-cards/team-member-4.jpg`,
          description:
            "Motion designer who treats every frame like it is the only one that matters.",
        },
        {
          id: "card-5",
          name: "Maren Cole",
          img: `${base}/team-cards/team-member-5.jpg`,
          description:
            "Creative lead and resident overthinker. Keeps the work honest and the team grounded.",
        },
      ];

      const buildCard = (m) => {
        const card = document.createElement("div");
        card.className = "card";
        card.id = m.id;
        card.innerHTML = `
          <div class="card-img"><img src="${m.img}" alt="${m.name}" /></div>
          <div class="card-content">
            <div class="card-title"><h6>${m.name}</h6></div>
            <div class="card-description"><p>${m.description}</p></div>
          </div>`;
        return card;
      };

      const desktopSection = document.createElement("section");
      desktopSection.className = "sticky team-desktop";
      desktopSection.id = "team-desktop";
      const stickyHeader = document.createElement("div");
      stickyHeader.className = "sticky-header";
      stickyHeader.innerHTML = `<h1>Meet The Obsessives</h1>`;
      desktopSection.appendChild(stickyHeader);
      const desktopCards = teamMembers.map((m) => {
        const card = buildCard(m);
        desktopSection.appendChild(card);
        return card;
      });

      const mobileSection = document.createElement("section");
      mobileSection.className = "team-mobile";
      const mobileHeader = document.createElement("div");
      mobileHeader.className = "mobile-header";
      mobileHeader.innerHTML = `<h1>Minds at Work</h1>`;
      mobileSection.appendChild(mobileHeader);
      teamMembers.forEach((m) => {
        const card = buildCard(m);
        card.id = `m-${m.id}`;
        mobileSection.appendChild(card);
      });

      mountEl.appendChild(desktopSection);
      mountEl.appendChild(mobileSection);

      const transforms = [
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

      const mm = gsap.matchMedia();
      let onRefreshInit: (() => void) | null = null;
      let handleResize: (() => void) | null = null;

      mm.add("(min-width: 1000px)", () => {
        let stickyHeight = 0;
        let maxTranslate = 0;
        let cardWidth = 325;
        let cardStartX = 25;
        let cardEndX = -650;

        const measure = () => {
          stickyHeight = window.innerHeight * 5;
          const headerWidth = stickyHeader.offsetWidth;
          maxTranslate = Math.max(0, headerWidth - window.innerWidth);
          const viewportWidth = window.innerWidth;
          if (desktopCards[0]) {
            cardWidth = desktopCards[0].getBoundingClientRect().width || 325;
          }
          const standardTravelPixels = Math.abs((-650 / 100) * cardWidth);
          const viewportScale = viewportWidth / 1920;
          const requiredTravelPixels =
            standardTravelPixels * 1.25 * Math.max(1, viewportScale);
          cardStartX = 25;
          cardEndX = -(requiredTravelPixels / cardWidth) * 100;
        };
        measure();

        const st = ScrollTrigger.create({
          trigger: desktopSection,
          start: "top top",
          end: () => `+=${stickyHeight}px`,
          invalidateOnRefresh: true,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(stickyHeader, { x: -progress * maxTranslate });
            desktopCards.forEach((card, index) => {
              const delay = index * 0.1125;
              const cardProgress = Math.max(
                0,
                Math.min((progress - delay) * 2, 1),
              );
              if (cardProgress > 0) {
                const yPos = transforms[index][0];
                const rotations = transforms[index][1];
                const cardX = gsap.utils.interpolate(
                  cardStartX,
                  cardEndX,
                  cardProgress,
                );
                const yProgress = cardProgress * 3;
                const yIndex = Math.min(Math.floor(yProgress), yPos.length - 2);
                const yInterpolation = yProgress - yIndex;
                const cardY = gsap.utils.interpolate(
                  yPos[yIndex],
                  yPos[yIndex + 1],
                  yInterpolation,
                );
                const cardRotation = gsap.utils.interpolate(
                  rotations[yIndex],
                  rotations[yIndex + 1],
                  yInterpolation,
                );
                gsap.set(card, {
                  xPercent: cardX,
                  yPercent: cardY,
                  rotation: cardRotation,
                  opacity: 1,
                });
              } else {
                gsap.set(card, { opacity: 0 });
              }
            });
          },
        });

        onRefreshInit = () => measure();
        ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
        handleResize = () => {
          measure();
          ScrollTrigger.refresh();
        };
        window.addEventListener("resize", handleResize, { passive: true });
        ScrollTrigger.refresh();

        return () => {
          st.kill();
          if (onRefreshInit)
            ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
          if (handleResize) window.removeEventListener("resize", handleResize);
        };
      });

      mm.add("(max-width: 999px)", () => {
        gsap.set(desktopSection, { clearProps: "all" });
        gsap.set(stickyHeader, { clearProps: "all" });
        desktopCards.forEach((card) => {
          if (card) gsap.set(card, { clearProps: "all", opacity: 1 });
        });
        ScrollTrigger.refresh();
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("orientationchange", onLoad);
        window.addEventListener("load", onLoad, { passive: true });
        return () => {
          window.removeEventListener("orientationchange", onLoad);
          window.removeEventListener("load", onLoad);
        };
      });

      cleanups.push(() => mm.revert());
    }

    // ── Studio clients marquee ───────────────────────────────────────────
    function setupClients() {
      const section = q(".clients");
      if (!section) return;

      const clients = [
        { name: "Cloudform", logo: `${base}/clients/client-logo-1.svg` },
        { name: "Opal", logo: `${base}/clients/client-logo-2.svg` },
        { name: "Oasis", logo: `${base}/clients/client-logo-3.svg` },
        { name: "Arc", logo: `${base}/clients/client-logo-4.svg` },
        { name: "Mainpoint", logo: `${base}/clients/client-logo-5.svg` },
      ];
      const RADII = ["0.75rem", "5rem"];

      function horizontalLoop(items, config) {
        items = gsap.utils.toArray(items);
        config = config || {};
        const tl = gsap.timeline({
          repeat: config.repeat,
          paused: config.paused,
          defaults: { ease: "none" },
          onReverseComplete: () =>
            tl.totalTime(tl.rawTime() + tl.duration() * 100),
        });
        const length = items.length;
        const startX = items[0].offsetLeft;
        const times = [];
        const widths = [];
        const xPercents = [];
        const pixelsPerSecond = (config.speed || 1) * 100;
        const snap =
          config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1);
        let totalWidth, curX, distanceToStart, distanceToLoop, item, i;
        gsap.set(items, {
          xPercent: (i, el) => {
            const w = (widths[i] = parseFloat(
              gsap.getProperty(el, "width", "px"),
            ));
            xPercents[i] = snap(
              (parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 +
                gsap.getProperty(el, "xPercent"),
            );
            return xPercents[i];
          },
        });
        gsap.set(items, { x: 0 });
        totalWidth =
          items[length - 1].offsetLeft +
          (xPercents[length - 1] / 100) * widths[length - 1] -
          startX +
          items[length - 1].offsetWidth *
            gsap.getProperty(items[length - 1], "scaleX") +
          (parseFloat(config.paddingRight) || 0);
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (xPercents[i] / 100) * widths[i];
          distanceToStart = item.offsetLeft + curX - startX;
          distanceToLoop =
            distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
          tl.to(
            item,
            {
              xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
              duration: distanceToLoop / pixelsPerSecond,
            },
            0,
          )
            .fromTo(
              item,
              {
                xPercent: snap(
                  ((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
                ),
              },
              {
                xPercent: xPercents[i],
                duration:
                  (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false,
              },
              distanceToLoop / pixelsPerSecond,
            )
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        tl.progress(1, true).progress(0, true);
        return tl;
      }

      const buildRow = (rowIndex) => {
        const row = document.createElement("div");
        row.className = "clients-marquee-row";
        for (let c = 0; c < 6; c++) {
          clients.forEach((client, i) => {
            const it = document.createElement("div");
            it.className = "clients-marquee-item";
            it.style.borderRadius = RADII[(i + rowIndex) % RADII.length];
            it.innerHTML = `<img src="${client.logo}" alt="${client.name}" draggable="false" />`;
            row.appendChild(it);
          });
        }
        return row;
      };

      const wrapper = document.createElement("div");
      wrapper.className = "clients-marquee-wrapper";
      const row1 = buildRow(0);
      const row2 = buildRow(1);
      wrapper.appendChild(row1);
      wrapper.appendChild(row2);
      section.appendChild(wrapper);

      const SPEED = 1.5;
      const BASE = 1;
      const MAX_BOOST = BASE * 10;
      const BOOST_SCALE = 0.055;
      const IDLE_MS = 95;
      const RAMP_SPEED = 10.5;
      const KICK_EPS = 0.02;
      const KICK_LERP = 0.65;
      const power3Out = (t) => 1 - (1 - t) ** 3;

      const loop1 = horizontalLoop(
        row1.querySelectorAll(".clients-marquee-item"),
        { repeat: -1, speed: SPEED },
      );
      const loop2 = horizontalLoop(
        row2.querySelectorAll(".clients-marquee-item"),
        { repeat: -1, speed: SPEED },
      );
      loop1.timeScale(BASE);
      loop2.progress(1).timeScale(-BASE);

      let currentBoost = BASE;
      let targetBoost = BASE;
      let lastChangeAt = performance.now();
      let lastTickAt = performance.now();
      let tickRaf: number | null = null;

      function tick() {
        const now = performance.now();
        const dt = Math.min((now - lastTickAt) / 1000, 0.05);
        lastTickAt = now;
        if (now - lastChangeAt > IDLE_MS) targetBoost = BASE;
        const t = Math.min(1, dt * RAMP_SPEED);
        const eased = power3Out(t);
        currentBoost += (targetBoost - currentBoost) * eased;
        currentBoost = gsap.utils.clamp(BASE, MAX_BOOST, currentBoost);
        loop1.timeScale(currentBoost);
        loop2.timeScale(-currentBoost);
        tickRaf = requestAnimationFrame(tick);
      }
      tickRaf = requestAnimationFrame(tick);

      const observer = Observer.create({
        type: "wheel,scroll,touch",
        wheelSpeed: -1,
        onChange: (self) => {
          const now = performance.now();
          const rawDelta =
            Math.abs(self.deltaY ?? 0) || Math.abs(self.deltaX ?? 0);
          const delta = Math.min(rawDelta, 120);
          const desiredBoost = gsap.utils.clamp(
            BASE,
            MAX_BOOST,
            BASE + Math.min(delta * BOOST_SCALE, MAX_BOOST - BASE),
          );
          targetBoost = desiredBoost;
          lastChangeAt = now;
          if (Math.abs(currentBoost - BASE) < KICK_EPS) {
            currentBoost = BASE + (desiredBoost - BASE) * KICK_LERP;
            loop1.timeScale(currentBoost);
            loop2.timeScale(-currentBoost);
          }
          lastTickAt = now;
        },
      });

      cleanups.push(() => {
        if (tickRaf) cancelAnimationFrame(tickRaf);
        observer.kill();
        loop1.kill();
        loop2.kill();
      });
    }

    // ── Work carousel ────────────────────────────────────────────────────
    function setupWork() {
      const carousel = q(".work-carousel");
      if (!carousel) return;

      const work = [
        {
          name: "Radio Radio",
          image: `${base}/work/work1.jpg`,
          accentColor: "#ffd601",
          ringColor: "#0f0f0f",
          url: "/sample-project",
        },
        {
          name: "Unravel Van Gogh",
          image: `${base}/work/work2.jpg`,
          accentColor: "#0f0f0f",
          ringColor: "#ffd601",
          url: "/sample-project",
        },
        {
          name: "N=5",
          image: `${base}/work/work3.jpg`,
          accentColor: "#ffd601",
          ringColor: "#0f0f0f",
          url: "/sample-project",
        },
        {
          name: "Forma Studio",
          image: `${base}/work/work4.jpg`,
          accentColor: "#0f0f0f",
          ringColor: "#ffd601",
          url: "/sample-project",
        },
        {
          name: "Solenne Fields",
          image: `${base}/work/work5.jpg`,
          accentColor: "#ffd601",
          ringColor: "#0f0f0f",
          url: "/sample-project",
        },
        {
          name: "Atlas Press",
          image: `${base}/work/work6.jpg`,
          accentColor: "#0f0f0f",
          ringColor: "#ffd601",
          url: "/sample-project",
        },
      ];

      const W = 1000;
      const H = 1000;
      const CX = W / 2;
      const HIDDEN = `M0,${H} Q${CX},${H} ${W},${H} L${W},${H} L0,${H} Z`;
      const BULGE = `M0,${H * 0.52} Q${CX},${H * 0.26} ${W},${H * 0.52} L${W},${H} L0,${H} Z`;
      const FULL = `M0,0 Q${CX},0 ${W},0 L${W},${H} L0,${H} Z`;

      const setCentered = (el) =>
        gsap.set(el, { xPercent: -50, yPercent: -50 });
      const setCardOffscreen = (el) =>
        gsap.set(el, { xPercent: -50, yPercent: 150 });

      const buildSlide = (item, index, isCurrent) => {
        const slide = document.createElement("div");
        slide.className = "work-slide" + (isCurrent ? " is-current" : "");
        slide.dataset.index = index;
        slide.innerHTML = `
          <svg class="work-slide-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path class="work-slide-path" fill="${item.accentColor}" d="${isCurrent ? FULL : HIDDEN}" />
          </svg>
          <div class="work-slide-card-wrap">
            <div class="work-slide-card">
              <div class="work-slide-img" style="background-image: url('${item.image}')"></div>
              <div class="work-slide-scrim"></div>
              <a class="work-slide-link" href="${item.url}"></a>
            </div>
          </div>
          <div class="work-slide-title-wrap">
            <h1 class="work-slide-title">${item.name}</h1>
          </div>`;
        const cardWrap = slide.querySelector(".work-slide-card-wrap");
        const titleWrap = slide.querySelector(".work-slide-title-wrap");
        if (isCurrent) {
          setCentered(cardWrap);
          setCentered(titleWrap);
        } else {
          setCardOffscreen(cardWrap);
          setCardOffscreen(titleWrap);
        }
        return slide;
      };

      carousel.innerHTML = `
        <div class="work-slides" id="lbWorkSlides"></div>
        <aside class="work-sidebar"><div class="work-sidebar-inner" id="lbWorkSidebar"></div></aside>
        <span class="work-slider-meta">The Archive</span>
        <div class="work-counter"><span class="work-counter-current" id="lbWorkCounter">01</span></div>`;

      const slidesEl = carousel.querySelector("#lbWorkSlides");
      const sidebarEl = carousel.querySelector("#lbWorkSidebar");
      const counterCurrent = carousel.querySelector("#lbWorkCounter");
      carousel.style.setProperty("--thumb-ring", work[0].ringColor);

      const firstSlide = buildSlide(work[0], 0, true);
      slidesEl.appendChild(firstSlide);
      const firstSplit = SplitText.create(
        firstSlide.querySelector(".work-slide-title"),
        { type: "words", mask: "words", wordsClass: "word" },
      );
      gsap.set(firstSplit.words, { yPercent: 0 });

      let current = 0;
      let isAnimating = false;

      work.forEach((item, i) => {
        const thumb = document.createElement("div");
        thumb.className = "work-thumb" + (i === 0 ? " is-active" : "");
        thumb.dataset.index = i;
        thumb.innerHTML = `<img src="${item.image}" alt="${item.name}" />`;
        thumb.addEventListener("click", () => {
          if (isAnimating || i === current) return;
          navigateTo(i);
        });
        sidebarEl.appendChild(thumb);
      });

      function navigateTo(nextIndex) {
        if (isAnimating) return;
        isAnimating = true;
        const prevSlide = slidesEl.querySelector(
          `.work-slide[data-index="${current}"]`,
        );
        const allThumbs = [...sidebarEl.querySelectorAll(".work-thumb")];
        const prevThumb = allThumbs.find((t) => +t.dataset.index === current);
        const nextThumb = allThumbs.find((t) => +t.dataset.index === nextIndex);
        const prevCardWrap = prevSlide.querySelector(".work-slide-card-wrap");
        const prevTitleWrap = prevSlide.querySelector(".work-slide-title-wrap");

        const nextSlide = buildSlide(work[nextIndex], nextIndex, false);
        gsap.set(nextSlide, { zIndex: 2 });
        gsap.set(prevSlide, { zIndex: 1 });
        slidesEl.appendChild(nextSlide);
        nextSlide.classList.add("is-current");

        const nextPath = nextSlide.querySelector(".work-slide-path");
        const nextCardWrap = nextSlide.querySelector(".work-slide-card-wrap");
        const nextTitleEl = nextSlide.querySelector(".work-slide-title");
        const nextTitleWrap = nextSlide.querySelector(".work-slide-title-wrap");
        const split = SplitText.create(nextTitleEl, {
          type: "words",
          mask: "words",
          wordsClass: "word",
        });
        gsap.set(split.words, { yPercent: -100 });

        counterCurrent.textContent = String(nextIndex + 1).padStart(2, "0");
        current = nextIndex;

        const tl = gsap.timeline({
          onComplete: () => {
            prevSlide.remove();
            isAnimating = false;
          },
        });
        tl.to(
          prevCardWrap,
          { xPercent: -50, yPercent: -100, duration: 1, ease: "power4.inOut" },
          0,
        );
        tl.to(
          prevTitleWrap,
          { xPercent: -50, yPercent: 25, duration: 0.75, ease: "power3.in" },
          0,
        );
        tl.to(
          nextPath,
          { duration: 0.5, attr: { d: BULGE }, ease: "power4.in" },
          0,
        );
        tl.to(
          nextPath,
          { duration: 0.5, attr: { d: FULL }, ease: "power4.out" },
          0.5,
        );
        tl.to(
          nextCardWrap,
          { xPercent: -50, yPercent: -50, duration: 0.75, ease: "power3.out" },
          0.5,
        );
        tl.to(
          nextTitleWrap,
          { xPercent: -50, yPercent: -50, duration: 0.75, ease: "power3.out" },
          0.5,
        );
        tl.to(
          split.words,
          { yPercent: 0, duration: 0.75, ease: "power3.out", stagger: 0.1 },
          0.75,
        );
        tl.add(() => {
          prevThumb?.classList.remove("is-active");
          nextThumb?.classList.add("is-active");
          carousel.style.setProperty("--thumb-ring", work[nextIndex].ringColor);
        }, 0.5);
      }

      let wheelCooldown = false;
      const onWheel = (e: WheelEvent) => {
        if (isAnimating || wheelCooldown) return;
        wheelCooldown = true;
        setTimeout(() => (wheelCooldown = false), 1100);
        const next =
          e.deltaY > 0
            ? current < work.length - 1
              ? current + 1
              : 0
            : current > 0
              ? current - 1
              : work.length - 1;
        navigateTo(next);
      };
      let touchStartY = 0;
      const onTouchStart = (e: TouchEvent) => {
        touchStartY = e.touches[0].clientY;
      };
      const onTouchEnd = (e: TouchEvent) => {
        if (isAnimating) return;
        const delta = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(delta) < 40) return;
        const next =
          delta > 0
            ? current < work.length - 1
              ? current + 1
              : 0
            : current > 0
              ? current - 1
              : work.length - 1;
        navigateTo(next);
      };

      window.addEventListener("wheel", onWheel, { passive: true });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });

      cleanups.push(() => {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchend", onTouchEnd);
      });
    }

    // ── Studio particle-logo visual ──────────────────────────────────────
    function setupParticleVisual() {
      const canvas = q<HTMLCanvasElement>("#particle-canvas");
      if (!canvas) return;
      const dispose = initParticleVisual(canvas, base);
      cleanups.push(dispose);
    }

    // ── Contact three.js cube ────────────────────────────────────────────
    function setupContactCube() {
      const canvas = q<HTMLCanvasElement>("#cube-canvas");
      if (!canvas) return;
      const wrap = canvas.parentElement as HTMLElement;

      const BALL_COUNT = 55;
      const R = 0.1;
      const BOUNCE = 0.72;
      const LIN_DAMP = 0.9995;
      const GRAV = 9.8;
      const SUBSTEPS = 8;
      const LINE_WIDTH = 2.5;
      const CUBE_SIZE = 1.85;
      const ROT_X = 0.00048;
      const ROT_Y = 0.00082;
      const ROT_Z = 0.00022;
      const LIM = CUBE_SIZE - R;
      const D = R * 2;
      const D2 = D * D;
      const FOV = 45;
      const DIAGONAL = Math.sqrt(3) * CUBE_SIZE;
      const PADDING = 1.4;
      const CAM_DIST =
        (DIAGONAL / Math.tan(((FOV / 2) * Math.PI) / 180)) * PADDING;
      const CANVAS_HEIGHT = Math.round(DIAGONAL * 200 + 80);
      wrap.style.height = `${CANVAS_HEIGHT}px`;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(FOV, 1, 0.01, 100);
      cam.position.set(0, 0, CAM_DIST);

      const cubeGroup = new THREE.Group();
      scene.add(cubeGroup);

      const cc = CUBE_SIZE;
      const corners = [
        [-cc, -cc, -cc],
        [cc, -cc, -cc],
        [cc, cc, -cc],
        [-cc, cc, -cc],
        [-cc, -cc, cc],
        [cc, -cc, cc],
        [cc, cc, cc],
        [-cc, cc, cc],
      ];
      const edgePairs = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];
      const edgePositions = [];
      for (const [a, b] of edgePairs)
        edgePositions.push(...corners[a], ...corners[b]);

      const lineGeo = new LineSegmentsGeometry();
      lineGeo.setPositions(edgePositions);
      const lineMat = new LineMaterial({
        color: 0x0f0f0f,
        linewidth: LINE_WIDTH,
        worldUnits: false,
      });
      const cubeLines = new LineSegments2(lineGeo, lineMat);
      cubeGroup.add(cubeLines);

      const ballGeo = new THREE.SphereGeometry(R, 14, 10);
      const ballMat = new THREE.MeshBasicMaterial({ color: 0x0f0f0f });
      const pos = [];
      const vel = [];
      const meshes = [];
      for (let i = 0; i < BALL_COUNT; i++) {
        const p = new THREE.Vector3(
          (Math.random() - 0.5) * CUBE_SIZE * 1.6,
          (Math.random() - 0.5) * CUBE_SIZE * 1.6,
          (Math.random() - 0.5) * CUBE_SIZE * 1.6,
        );
        p.clampScalar(-LIM, LIM);
        pos.push(p);
        vel.push(
          new THREE.Vector3(
            (Math.random() - 0.5) * CUBE_SIZE * 1.5,
            (Math.random() - 0.5) * CUBE_SIZE * 1.5,
            (Math.random() - 0.5) * CUBE_SIZE * 1.5,
          ),
        );
        const m = new THREE.Mesh(ballGeo, ballMat);
        m.position.copy(p);
        cubeGroup.add(m);
        meshes.push(m);
      }

      const localGrav = new THREE.Vector3();
      const worldDown = new THREE.Vector3(0, -GRAV, 0);
      const invQ = new THREE.Quaternion();

      let viewW = 1;
      let viewH = 1;
      const resize = () => {
        viewW = wrap.offsetWidth || CANVAS_HEIGHT;
        viewH = wrap.offsetHeight || CANVAS_HEIGHT;
        renderer.setSize(viewW, viewH, false);
        cam.aspect = viewW / viewH;
        cam.updateProjectionMatrix();
        lineMat.resolution.set(viewW, viewH);
      };

      function physStep(dt) {
        const sdt = dt / SUBSTEPS;
        const drag = LIN_DAMP ** dt;
        for (let s = 0; s < SUBSTEPS; s++) {
          for (let i = 0; i < BALL_COUNT; i++) {
            vel[i].x += localGrav.x * sdt;
            vel[i].y += localGrav.y * sdt;
            vel[i].z += localGrav.z * sdt;
            pos[i].x += vel[i].x * sdt;
            pos[i].y += vel[i].y * sdt;
            pos[i].z += vel[i].z * sdt;
          }
          for (let i = 0; i < BALL_COUNT; i++) {
            const p = pos[i];
            const v = vel[i];
            if (p.x < -LIM) {
              p.x = -LIM;
              if (v.x < 0) v.x = -v.x * BOUNCE;
            }
            if (p.x > LIM) {
              p.x = LIM;
              if (v.x > 0) v.x = -v.x * BOUNCE;
            }
            if (p.y < -LIM) {
              p.y = -LIM;
              if (v.y < 0) v.y = -v.y * BOUNCE;
            }
            if (p.y > LIM) {
              p.y = LIM;
              if (v.y > 0) v.y = -v.y * BOUNCE;
            }
            if (p.z < -LIM) {
              p.z = -LIM;
              if (v.z < 0) v.z = -v.z * BOUNCE;
            }
            if (p.z > LIM) {
              p.z = LIM;
              if (v.z > 0) v.z = -v.z * BOUNCE;
            }
          }
          for (let i = 0; i < BALL_COUNT - 1; i++) {
            for (let j = i + 1; j < BALL_COUNT; j++) {
              const dx = pos[j].x - pos[i].x;
              const dy = pos[j].y - pos[i].y;
              const dz = pos[j].z - pos[i].z;
              const d2 = dx * dx + dy * dy + dz * dz;
              if (d2 >= D2 || d2 < 1e-10) continue;
              const d = Math.sqrt(d2);
              const nx = dx / d,
                ny = dy / d,
                nz = dz / d;
              const sep = (D - d) * 0.5;
              pos[i].x -= nx * sep;
              pos[i].y -= ny * sep;
              pos[i].z -= nz * sep;
              pos[j].x += nx * sep;
              pos[j].y += ny * sep;
              pos[j].z += nz * sep;
              const rv =
                (vel[j].x - vel[i].x) * nx +
                (vel[j].y - vel[i].y) * ny +
                (vel[j].z - vel[i].z) * nz;
              if (rv >= 0) continue;
              const imp = rv * (1 + BOUNCE) * 0.5;
              vel[i].x += imp * nx;
              vel[i].y += imp * ny;
              vel[i].z += imp * nz;
              vel[j].x -= imp * nx;
              vel[j].y -= imp * ny;
              vel[j].z -= imp * nz;
            }
          }
        }
        for (let i = 0; i < BALL_COUNT; i++) vel[i].multiplyScalar(drag);
      }

      let aX = 0.3,
        aY = 0.2,
        aZ = 0.0,
        last = 0;
      let driftX = ROT_X,
        driftY = ROT_Y,
        driftZ = ROT_Z;
      let nextKick = 3.0;
      let isDragging = false;
      let prevX = 0,
        prevY = 0;
      let momentumYaw = 0,
        momentumPitch = 0;
      let targetX = 0.3,
        targetY = 0.2;
      const DRAG_SENS = 0.005;
      const DRAG_LERP = 0.1;
      const MOMENTUM_DECAY = 0.88;

      const getXY = (e) =>
        e.touches
          ? [e.touches[0].clientX, e.touches[0].clientY]
          : [e.clientX, e.clientY];

      const onMouseDown = (e) => {
        isDragging = true;
        [prevX, prevY] = getXY(e);
        momentumYaw = momentumPitch = 0;
        targetX = aX;
        targetY = aY;
        canvas.style.cursor = "grabbing";
      };
      const onTouchStart = (e) => {
        isDragging = true;
        [prevX, prevY] = getXY(e);
        momentumYaw = momentumPitch = 0;
        targetX = aX;
        targetY = aY;
      };
      const onMove = (e) => {
        if (!isDragging) return;
        const [cx, cy] = getXY(e);
        const dx = (cx - prevX) * DRAG_SENS;
        const dy = (cy - prevY) * DRAG_SENS;
        targetY += dx;
        targetX += dy;
        momentumYaw = dx;
        momentumPitch = dy;
        prevX = cx;
        prevY = cy;
      };
      const onUp = () => {
        isDragging = false;
        canvas.style.cursor = "grab";
      };
      const onTouchEnd = () => {
        isDragging = false;
      };

      canvas.addEventListener("mousedown", onMouseDown);
      canvas.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onTouchEnd);
      window.addEventListener("resize", resize);
      canvas.style.cursor = "grab";
      resize();

      let raf = 0;
      function tick(ts) {
        const dt = Math.min((ts - last) / 1000, 0.033);
        last = ts;
        if (isDragging) {
          aX += (targetX - aX) * DRAG_LERP;
          aY += (targetY - aY) * DRAG_LERP;
        } else {
          aY += momentumYaw;
          aX += momentumPitch;
          momentumYaw *= MOMENTUM_DECAY;
          momentumPitch *= MOMENTUM_DECAY;
          const momentumMag = Math.abs(momentumYaw) + Math.abs(momentumPitch);
          const autoBlend = Math.max(0, 1 - momentumMag / 0.01);
          driftX += (Math.random() - 0.5) * 0.000003;
          driftY += (Math.random() - 0.5) * 0.000003;
          driftZ += (Math.random() - 0.5) * 0.000003;
          driftX = Math.max(ROT_X * 0.6, Math.min(ROT_X * 1.4, driftX));
          driftY = Math.max(ROT_Y * 0.6, Math.min(ROT_Y * 1.4, driftY));
          driftZ = Math.max(ROT_Z * 0.6, Math.min(ROT_Z * 1.4, driftZ));
          aX += driftX * dt * 1000 * autoBlend;
          aY += driftY * dt * 1000 * autoBlend;
          aZ += driftZ * dt * 1000 * autoBlend;
        }
        cubeGroup.rotation.set(aX, aY, aZ);
        invQ.setFromEuler(cubeGroup.rotation).invert();
        localGrav.copy(worldDown).applyQuaternion(invQ);
        nextKick -= dt;
        if (nextKick <= 0) {
          const kickStr = CUBE_SIZE * 1.5;
          for (let i = 0; i < BALL_COUNT; i++) {
            vel[i].x += (Math.random() - 0.5) * kickStr;
            vel[i].y += (Math.random() - 0.5) * kickStr;
            vel[i].z += (Math.random() - 0.5) * kickStr;
          }
          nextKick = 2.5 + Math.random() * 2.0;
        }
        physStep(dt);
        for (let i = 0; i < BALL_COUNT; i++) meshes[i].position.copy(pos[i]);
        renderer.render(scene, cam);
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame((ts) => {
        last = ts;
        raf = requestAnimationFrame(tick);
      });

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("resize", resize);
        lineGeo.dispose();
        lineMat.dispose();
        ballGeo.dispose();
        ballMat.dispose();
        renderer.dispose();
      });
    }

    // ── Footer GPU FLIP fluid ────────────────────────────────────────────
    function setupFooterFluid() {
      const mount = q("#footer-canvas");
      if (!mount) return;
      const footerEl = mount.closest("footer") || q("footer");

      const rs = getComputedStyle(root);
      const BG = rs.getPropertyValue("--d").trim() || "#0f0f0f";
      const FG = rs.getPropertyValue("--l").trim() || "#ffd601";
      const _h = FG.replace("#", "");
      const [FR, FGc, FB] = [0, 2, 4].map((i) =>
        parseInt(_h.slice(i, i + 2), 16),
      );

      setSimulatorShaderBase(`${base}/shaders/`);

      const CFG = {
        targetParticles: 1500,
        maxParticles: 3000,
        particlesTextureWidth: 512,
        particleSize: 7.5,
        alphaBase: 1000,
        darkenDens: 6,
        gridWidth: 40,
        gridHeight: 20,
        gridDepth: 10,
        particlesPerCell: 0.1,
        spawnAabbMin: [0, 0, 0],
        spawnAabbMax: [15, 20, 20],
        flipness: 0.5,
        timeStep: 1 / 60,
        mouseEnabled: true,
        mouseForce: 1.0,
        mouseVelGain: 0.5,
        mouseVelMax: 5,
        mouseSmoothing: 0.25,
        mouseOnlyOnHover: true,
        separationEnabled: true,
        separationMinDist: 0.55,
        separationStrength: 0.55,
        separationIters: 2,
      };

      let CW = 1;
      let CH = 1;
      let hover = false;
      let active = false;
      let started = false;
      let rafId: number | null = null;
      let disposed = false;
      let readState = null;

      let sepCellSize = 0,
        sepNx = 0,
        sepNy = 0;
      let sepCounts = null,
        sepOffsets = null,
        sepIndices = null;
      let sepWritePos = null,
        sepSeen = null,
        sepCellOrder = null;

      const mouseVelocity = new Float32Array(3);
      const mouseRayOrigin = new Float32Array(3);
      const mouseRayDirection = new Float32Array([0, 0, 1]);

      const canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      mount.appendChild(canvas);
      const cctx = canvas.getContext("2d", { alpha: true });
      if (!cctx) return;

      const colorCache = new Map();
      const particleSize = CFG.particleSize;
      const halfParticleSize = particleSize / 2;
      const particleAlpha = CFG.alphaBase / 255;
      const circlePath = new Path2D();
      circlePath.arc(0, 0, halfParticleSize, 0, Math.PI * 2);
      const trianglePath = new Path2D();
      trianglePath.moveTo(-halfParticleSize, halfParticleSize);
      trianglePath.lineTo(halfParticleSize, halfParticleSize);
      trianglePath.lineTo(0, -halfParticleSize);
      trianglePath.closePath();

      let simCanvas = null;
      let wgl = null;
      let simulator = null;
      let simReady = false;

      let N = 0;
      let particlesWidth = 0;
      let particlesHeight = 0;
      let positionPixels = null;
      let lastPosX = null;
      let lastPosY = null;
      let rotArr = null;
      let rotVArr = null;
      let shpArr = null;
      let densArr = null;

      let mouseX = 0,
        mouseY = 0,
        mousePrevX = 0,
        mousePrevY = 0;
      let mouseVelSmoothX = 0,
        mouseVelSmoothY = 0;
      let uploadPositionsData = null;

      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const lerp = (a, b, t) => a + (b - a) * t;

      function computeSimParticleCountAndTextureDims() {
        let desired = Math.max(1, CFG.targetParticles | 0);
        desired = Math.min(desired, Math.max(1, CFG.maxParticles | 0));
        const w = Math.max(4, CFG.particlesTextureWidth | 0);
        const h = Math.max(1, Math.ceil(desired / w));
        return { desired, w, h };
      }
      function computeFluidMasterResolutions() {
        const GRID_WIDTH = CFG.gridWidth;
        const GRID_HEIGHT = CFG.gridHeight;
        const GRID_DEPTH = CFG.gridDepth;
        const gridCells = GRID_WIDTH * GRID_HEIGHT * GRID_DEPTH * 0.35;
        const gridResolutionY = Math.ceil((gridCells / 2) ** (1 / 3));
        return {
          gridResolutionX: gridResolutionY * 2,
          gridResolutionY,
          gridResolutionZ: gridResolutionY,
          GRID_WIDTH,
          GRID_HEIGHT,
          GRID_DEPTH,
        };
      }
      const randomPointInAabb = (min, max) => [
        lerp(min[0], max[0], Math.random()),
        lerp(min[1], max[1], Math.random()),
        lerp(min[2], max[2], Math.random()),
      ];
      function buildInitialParticlePositions() {
        const positions = new Array(particlesWidth * particlesHeight);
        for (let i = 0; i < N; i++)
          positions[i] = randomPointInAabb(CFG.spawnAabbMin, CFG.spawnAabbMax);
        for (let i = N; i < particlesWidth * particlesHeight; i++)
          positions[i] = [
            Math.random() * CFG.gridWidth,
            Math.random() * CFG.gridHeight,
            Math.random() * CFG.gridDepth,
          ];
        return positions;
      }
      function initCpuDrawState() {
        const { desired, w, h } = computeSimParticleCountAndTextureDims();
        particlesWidth = w;
        particlesHeight = h;
        N = desired;
        positionPixels = new Float32Array(particlesWidth * particlesHeight * 4);
        lastPosX = new Float32Array(N);
        lastPosY = new Float32Array(N);
        rotArr = new Float32Array(N);
        rotVArr = new Float32Array(N);
        densArr = new Float32Array(N);
        shpArr = new Uint8Array(N);
        for (let i = 0; i < N; i++) {
          rotArr[i] = Math.random() * Math.PI * 2;
          rotVArr[i] = (Math.random() - 0.5) * 0.15;
          shpArr[i] = i % 3;
          densArr[i] = 0;
        }
        initSeparationBuffers();
      }
      function initSeparationBuffers() {
        sepCellSize = Math.max(1e-4, CFG.separationMinDist);
        sepNx = Math.max(1, Math.ceil(CFG.gridWidth / sepCellSize));
        sepNy = Math.max(1, Math.ceil(CFG.gridHeight / sepCellSize));
        const cellCount = sepNx * sepNy;
        sepCounts = new Int32Array(cellCount);
        sepOffsets = new Int32Array(cellCount + 1);
        sepIndices = new Int32Array(N);
        sepWritePos = new Int32Array(cellCount);
        sepSeen = new Uint8Array(cellCount);
        sepCellOrder = new Int32Array(cellCount);
      }
      function initGpuSim(onReady) {
        simReady = false;
        simCanvas = document.createElement("canvas");
        simCanvas.width = Math.max(1, Math.floor(CW));
        simCanvas.height = Math.max(1, Math.floor(CH));
        wgl = new WrappedGL(simCanvas, {
          alpha: false,
          antialias: false,
          premultipliedAlpha: false,
        });
        wgl.getExtension("OES_texture_float");
        wgl.getExtension("OES_texture_float_linear");
        wgl.getExtension("WEBGL_color_buffer_float");
        wgl.getExtension("OES_texture_half_float");
        wgl.getExtension("OES_texture_half_float_linear");
        readState = wgl.createReadState();
        simulator = new Simulator(wgl, () => {
          if (disposed) return;
          simulator.flipness = CFG.flipness;
          const {
            gridResolutionX,
            gridResolutionY,
            gridResolutionZ,
            GRID_WIDTH,
            GRID_HEIGHT,
            GRID_DEPTH,
          } = computeFluidMasterResolutions();
          const particlePositions = buildInitialParticlePositions();
          simulator.reset(
            particlesWidth,
            particlesHeight,
            particlePositions,
            [GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH],
            [gridResolutionX, gridResolutionY, gridResolutionZ],
            CFG.particlesPerCell,
          );
          simReady = true;
          onReady?.();
        });
      }
      function readBackPositions() {
        wgl.framebufferTexture2D(
          simulator.simulationFramebuffer,
          wgl.FRAMEBUFFER,
          wgl.COLOR_ATTACHMENT0,
          wgl.TEXTURE_2D,
          simulator.particlePositionTexture,
          0,
        );
        readState.bindFramebuffer(simulator.simulationFramebuffer);
        wgl.readPixels(
          readState,
          0,
          0,
          particlesWidth,
          particlesHeight,
          wgl.RGBA,
          wgl.FLOAT,
          positionPixels,
        );
      }
      function enforceSeparation() {
        if (!CFG.separationEnabled) return;
        const minDist = Math.max(1e-4, CFG.separationMinDist);
        const minDist2 = minDist * minDist;
        const strength = clamp(CFG.separationStrength, 0, 1);
        const iters = Math.max(1, CFG.separationIters | 0);
        if (!sepIndices || sepCellSize !== minDist || !sepCounts || !sepOffsets)
          initSeparationBuffers();
        const cell = sepCellSize;
        const clampMinX = 0.01,
          clampMaxX = CFG.gridWidth - 0.01;
        const clampMinY = 0.01,
          clampMaxY = CFG.gridHeight - 0.01;
        const cellCount = sepNx * sepNy;
        for (let iter = 0; iter < iters; iter++) {
          sepCounts.fill(0);
          sepSeen.fill(0);
          let cellOrderLen = 0;
          for (let i = 0; i < N; i++) {
            const gx = Math.floor(positionPixels[i * 4] / cell);
            const gy = Math.floor(positionPixels[i * 4 + 1] / cell);
            if (gx < 0 || gx >= sepNx || gy < 0 || gy >= sepNy) continue;
            const b = gy * sepNx + gx;
            if (sepSeen[b] === 0) {
              sepSeen[b] = 1;
              sepCellOrder[cellOrderLen++] = b;
            }
            sepCounts[b]++;
          }
          let sum = 0;
          for (let c = 0; c < cellCount; c++) {
            sepOffsets[c] = sum;
            sum += sepCounts[c];
          }
          sepOffsets[cellCount] = sum;
          sepWritePos.set(sepOffsets.subarray(0, cellCount));
          for (let i = 0; i < N; i++) {
            const gx = Math.floor(positionPixels[i * 4] / cell);
            const gy = Math.floor(positionPixels[i * 4 + 1] / cell);
            if (gx < 0 || gx >= sepNx || gy < 0 || gy >= sepNy) continue;
            const b = gy * sepNx + gx;
            sepIndices[sepWritePos[b]++] = i;
          }
          for (let orderIdx = 0; orderIdx < cellOrderLen; orderIdx++) {
            const cellIndex = sepCellOrder[orderIdx];
            const gx = cellIndex % sepNx;
            const gy = (cellIndex / sepNx) | 0;
            const startI = sepOffsets[cellIndex];
            const endI = sepOffsets[cellIndex + 1];
            for (let ox = -1; ox <= 1; ox++) {
              const nbx = gx + ox;
              if (nbx < 0 || nbx >= sepNx) continue;
              for (let oy = -1; oy <= 1; oy++) {
                const nby = gy + oy;
                if (nby < 0 || nby >= sepNy) continue;
                const nbCellIndex = nby * sepNx + nbx;
                if (sepCounts[nbCellIndex] === 0) continue;
                const startJ = sepOffsets[nbCellIndex];
                const endJ = sepOffsets[nbCellIndex + 1];
                for (let a = startI; a < endI; a++) {
                  const i = sepIndices[a];
                  const i4 = i * 4;
                  for (let b = startJ; b < endJ; b++) {
                    const j = sepIndices[b];
                    if (j <= i) continue;
                    const j4 = j * 4;
                    const dx = positionPixels[i4] - positionPixels[j4];
                    const dy = positionPixels[i4 + 1] - positionPixels[j4 + 1];
                    const d2 = dx * dx + dy * dy;
                    if (d2 >= minDist2 || d2 < 1e-10) continue;
                    const d = Math.sqrt(d2);
                    const overlap = (minDist - d) / d;
                    const pushX = dx * overlap * 0.5 * strength;
                    const pushY = dy * overlap * 0.5 * strength;
                    positionPixels[i4] = clamp(
                      positionPixels[i4] + pushX,
                      clampMinX,
                      clampMaxX,
                    );
                    positionPixels[i4 + 1] = clamp(
                      positionPixels[i4 + 1] + pushY,
                      clampMinY,
                      clampMaxY,
                    );
                    positionPixels[j4] = clamp(
                      positionPixels[j4] - pushX,
                      clampMinX,
                      clampMaxX,
                    );
                    positionPixels[j4 + 1] = clamp(
                      positionPixels[j4 + 1] - pushY,
                      clampMinY,
                      clampMaxY,
                    );
                  }
                }
              }
            }
          }
        }
      }
      function uploadCorrectedPositionsToGPU() {
        if (
          !uploadPositionsData ||
          uploadPositionsData.length !== positionPixels.length
        )
          uploadPositionsData = new Float32Array(positionPixels.length);
        uploadPositionsData.set(positionPixels);
        for (let i = N; i < particlesWidth * particlesHeight; i++) {
          uploadPositionsData[i * 4] = clamp(
            uploadPositionsData[i * 4],
            0.01,
            CFG.gridWidth - 0.01,
          );
          uploadPositionsData[i * 4 + 1] = clamp(
            uploadPositionsData[i * 4 + 1],
            0.01,
            CFG.gridHeight - 0.01,
          );
          uploadPositionsData[i * 4 + 2] = clamp(
            uploadPositionsData[i * 4 + 2],
            0.01,
            CFG.gridDepth - 0.01,
          );
        }
        wgl.rebuildTexture(
          simulator.particlePositionTexture,
          wgl.RGBA,
          wgl.FLOAT,
          particlesWidth,
          particlesHeight,
          uploadPositionsData,
          wgl.CLAMP_TO_EDGE,
          wgl.CLAMP_TO_EDGE,
          wgl.NEAREST,
          wgl.NEAREST,
        );
      }
      function updateDerivedState(dt) {
        for (let i = 0; i < N; i++) {
          const wx = positionPixels[i * 4];
          const wy = positionPixels[i * 4 + 1];
          const x = (wx / CFG.gridWidth) * CW;
          const y = CH - (wy / CFG.gridHeight) * CH;
          const vx = (x - lastPosX[i]) / Math.max(1e-6, dt);
          const vy = (y - lastPosY[i]) / Math.max(1e-6, dt);
          const speed = Math.sqrt(vx * vx + vy * vy);
          rotVArr[i] +=
            Math.min(0.08, speed * 0.00008) * (Math.random() < 0.5 ? 1 : -1);
          rotVArr[i] *= 0.985;
          rotArr[i] += rotVArr[i] * dt * 60;
          densArr[i] = Math.max(
            0,
            Math.min(5, densArr[i] * 0.9 + speed * 0.003),
          );
          lastPosX[i] = x;
          lastPosY[i] = y;
        }
      }
      function draw() {
        cctx.clearRect(0, 0, CW, CH);
        cctx.fillStyle = BG;
        cctx.fillRect(0, 0, CW, CH);
        for (let i = 0; i < N; i++) {
          const wx = positionPixels[i * 4];
          const wy = positionPixels[i * 4 + 1];
          const x = (wx / CFG.gridWidth) * CW;
          const y = CH - (wy / CFG.gridHeight) * CH;
          const dk = Math.min(densArr[i], 5) * CFG.darkenDens;
          const r = Math.max(0, FR - dk) | 0;
          const g = Math.max(0, FGc - dk) | 0;
          const b = Math.max(0, FB - dk) | 0;
          const colorKey = ((r & 255) << 16) | ((g & 255) << 8) | (b & 255);
          let fill = colorCache.get(colorKey);
          if (!fill) {
            fill = `rgba(${r},${g},${b},${particleAlpha})`;
            colorCache.set(colorKey, fill);
          }
          cctx.fillStyle = fill;
          cctx.save();
          cctx.translate(x, y);
          cctx.rotate(rotArr[i]);
          const s = shpArr[i];
          if (s === 0) cctx.fill(trianglePath);
          else if (s === 1)
            cctx.fillRect(
              -halfParticleSize,
              -halfParticleSize,
              particleSize,
              particleSize,
            );
          else cctx.fill(circlePath);
          cctx.restore();
        }
      }
      function resize() {
        CW = Math.max(1, footerEl?.clientWidth || mount.clientWidth || 1);
        CH = Math.max(1, footerEl?.clientHeight || mount.clientHeight || 1);
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        canvas.width = Math.floor(CW * dpr);
        canvas.height = Math.floor(CH * dpr);
        canvas.style.width = CW + "px";
        canvas.style.height = CH + "px";
        cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initCpuDrawState();
        initGpuSim(() => {
          readBackPositions();
          for (let i = 0; i < N; i++) {
            lastPosX[i] = positionPixels[i * 4];
            lastPosY[i] = CH - positionPixels[i * 4 + 1];
          }
        });
      }
      function ensureTick() {
        if (!active || rafId != null || disposed) return;
        rafId = requestAnimationFrame(tick);
      }
      function tick() {
        rafId = null;
        if (!active || disposed) return;
        if (simReady) {
          const dt = CFG.timeStep;
          const dmx = mouseX - mousePrevX;
          const dmy = mouseY - mousePrevY;
          const simMx = (mouseX / Math.max(1, CW)) * CFG.gridWidth;
          const simMy = ((CH - mouseY) / Math.max(1, CH)) * CFG.gridHeight;
          const applyMouse =
            CFG.mouseEnabled && (!CFG.mouseOnlyOnHover || hover);
          let vxW = 0,
            vyW = 0;
          if (applyMouse) {
            vxW =
              (((dmx * CFG.mouseVelGain) / Math.max(1, CW)) * CFG.gridWidth) /
              Math.max(1e-6, dt);
            vyW =
              (((-dmy * CFG.mouseVelGain) / Math.max(1, CH)) * CFG.gridHeight) /
              Math.max(1e-6, dt);
            const sm = clamp(CFG.mouseSmoothing, 0, 0.98);
            mouseVelSmoothX = mouseVelSmoothX * sm + vxW * (1 - sm);
            mouseVelSmoothY = mouseVelSmoothY * sm + vyW * (1 - sm);
            const maxV = Math.max(1, CFG.mouseVelMax);
            vxW = clamp(mouseVelSmoothX, -maxV, maxV) * CFG.mouseForce;
            vyW = clamp(mouseVelSmoothY, -maxV, maxV) * CFG.mouseForce;
          } else {
            mouseVelSmoothX *= 0.9;
            mouseVelSmoothY *= 0.9;
          }
          mouseVelocity[0] = vxW;
          mouseVelocity[1] = vyW;
          mouseVelocity[2] = 0;
          mouseRayOrigin[0] = simMx;
          mouseRayOrigin[1] = simMy;
          mouseRayOrigin[2] = -1000;
          simulator.simulate(
            dt,
            mouseVelocity,
            mouseRayOrigin,
            mouseRayDirection,
          );
          readBackPositions();
          enforceSeparation();
          uploadCorrectedPositionsToGPU();
          updateDerivedState(dt);
          draw();
          mousePrevX = mouseX;
          mousePrevY = mouseY;
        }
        if (active && !disposed) rafId = requestAnimationFrame(tick);
      }

      const onMouseMove = (e) => {
        const r = mount.getBoundingClientRect();
        mouseX = e.clientX - r.left;
        mouseY = e.clientY - r.top;
      };
      const onEnter = () => (hover = true);
      const onLeave = () => (hover = false);
      const onResize = () => {
        if (started) resize();
      };
      mount.addEventListener("mousemove", onMouseMove);
      mount.addEventListener("mouseenter", onEnter);
      mount.addEventListener("mouseleave", onLeave);
      window.addEventListener("resize", onResize);

      let io: IntersectionObserver | null = null;
      const maybeKickstart = () => {
        if (disposed || !footerEl) return;
        if (footerEl.getBoundingClientRect().top <= window.innerHeight) {
          active = true;
          if (!started) {
            started = true;
            resize();
          }
          ensureTick();
        }
      };

      if (footerEl && "IntersectionObserver" in window) {
        io = new IntersectionObserver(
          (entries) => {
            active = !!entries[0]?.isIntersecting;
            if (active) {
              if (!started) {
                started = true;
                resize();
              }
              ensureTick();
            }
          },
          { threshold: 0, rootMargin: "0px 0px" },
        );
        io.observe(footerEl);
        maybeKickstart();
        requestAnimationFrame(maybeKickstart);
        window.addEventListener("load", maybeKickstart, { once: true });
        setTimeout(maybeKickstart, 750);
      } else {
        active = true;
        started = true;
        resize();
        ensureTick();
      }

      cleanups.push(() => {
        disposed = true;
        active = false;
        if (rafId) cancelAnimationFrame(rafId);
        io?.disconnect();
        mount.removeEventListener("mousemove", onMouseMove);
        mount.removeEventListener("mouseenter", onEnter);
        mount.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("load", maybeKickstart);
        const lose = wgl?.gl?.getExtension?.("WEBGL_lose_context");
        lose?.loseContext?.();
        canvas.remove();
      });
    }
  }, [assetBase, lenis, navigate, pathname, root, scroller]);
}

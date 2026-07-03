// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { CSSProperties } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import {
  type DamienTsarantosRoute,
  getDamienTsarantosFragment,
} from "./fragments";
import { getDamienTsarantosPageStyles } from "./styles";

gsap.registerPlugin(ScrollTrigger);

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/damien-tsarantos-page";

export const DAMIEN_TSARANTOS_PAGE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/work", label: "Projects" },
  { path: "/project", label: "Project" },
  { path: "/awards", label: "Awards" },
  { path: "/contact", label: "Contact" },
] as const;

const ROUTE_SET = new Set(
  DAMIEN_TSARANTOS_PAGE_ROUTES.map((route) => route.path),
);

function normalizePath(path: string): DamienTsarantosRoute {
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
  return ROUTE_SET.has(withSlash) ? (withSlash as DamienTsarantosRoute) : "/";
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
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
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

export interface DamienTsarantosPageProps {
  assetBase?: string;
  initialPath?: DamienTsarantosRoute | string;
  className?: string;
  style?: CSSProperties;
}

export default function DamienTsarantosPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: DamienTsarantosPageProps) {
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const [pathname, setPathname] = useState<DamienTsarantosRoute>(() =>
    normalizePath(initialPath),
  );
  const { scroller, lenis } = useScrollRuntime(rootElement);
  const css = useMemo(
    () => getDamienTsarantosPageStyles(assetBase),
    [assetBase],
  );

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
      className={["damien-tsarantos-page", className].filter(Boolean).join(" ")}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {rootElement && scroller && lenis ? (
        <DamienTsarantosRouteView
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

function DamienTsarantosRouteView({
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
  pathname: DamienTsarantosRoute;
  rootElement: HTMLElement;
  scroller: HTMLElement | Window;
}) {
  const [routeElement, setRouteElement] = useState<HTMLDivElement | null>(null);
  const html = useMemo(
    () => getDamienTsarantosFragment(pathname, assetBase),
    [assetBase, pathname],
  );

  useDamienTsarantosEffects({
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
      className={`damien-tsarantos-route damien-tsarantos-route-${
        pathname === "/" ? "index" : pathname.slice(1)
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function useDamienTsarantosEffects({
  lenis,
  navigate,
  pathname,
  root,
  rootElement,
  scroller,
}: {
  lenis: Lenis;
  navigate: (path: string) => void;
  pathname: DamienTsarantosRoute;
  root: HTMLElement | null;
  rootElement: HTMLElement;
  scroller: HTMLElement | Window;
}) {
  useLayoutEffect(() => {
    if (!root) return;

    const cleanups: Array<() => void> = [];
    const q = <T extends Element = HTMLElement>(selector: string) =>
      root.querySelector<T>(selector);
    const qa = <T extends Element = HTMLElement>(selector: string) =>
      Array.from(root.querySelectorAll<T>(selector));

    const ctx = gsap.context(() => {
      setupLinks();
      setupMagneticButtons();
      setupContactCards();
      setupSplitHeadings();
      setupImageRefresh();
    }, root);

    const refreshFrame = window.requestAnimationFrame(() => {
      lenis.resize?.();
      ScrollTrigger.refresh();
    });

    cleanups.push(() => window.cancelAnimationFrame(refreshFrame));

    return () => {
      cleanups.splice(0).forEach((cleanup) => cleanup());
      ctx.revert();
    };

    function setupLinks() {
      const links = qa<HTMLAnchorElement>("a");
      const onClick = (event: MouseEvent) => {
        const link = event.currentTarget as HTMLAnchorElement;
        const href = link.getAttribute("href");

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
        const nextPath = normalizePath(href);
        if (nextPath === pathname) return;
        navigate(nextPath);
      };

      links.forEach((link) => link.addEventListener("click", onClick));
      cleanups.push(() =>
        links.forEach((link) => link.removeEventListener("click", onClick)),
      );
    }

    function setupMagneticButtons() {
      const magnets = qa<HTMLElement>(".magnetic-area");
      const strength = 75;

      magnets.forEach((magnet) => {
        const moveMagnet = (event: MouseEvent) => {
          const bounding = magnet.getBoundingClientRect();

          gsap.to(magnet, {
            x:
              ((event.clientX - bounding.left) / magnet.offsetWidth - 0.5) *
              strength,
            y:
              ((event.clientY - bounding.top) / magnet.offsetHeight - 0.5) *
              strength,
            duration: 1,
            ease: "power4.out",
          });
        };

        const resetMagnet = () => {
          gsap.to(magnet, {
            x: 0,
            y: 0,
            duration: 1,
            ease: "power4.out",
          });
        };

        magnet.addEventListener("mousemove", moveMagnet);
        magnet.addEventListener("mouseout", resetMagnet);
        cleanups.push(() => {
          magnet.removeEventListener("mousemove", moveMagnet);
          magnet.removeEventListener("mouseout", resetMagnet);
        });
      });
    }

    function setupContactCards() {
      const cards = qa<HTMLElement>(".card");
      const contact = q<HTMLElement>(".contact");

      if (!cards.length) return;

      gsap.set(q<HTMLElement>(".card-1"), { rotation: -10 });
      gsap.set(q<HTMLElement>(".card-2"), { rotation: -20 });
      gsap.set(q<HTMLElement>(".card-3"), { rotation: -15 });

      if (!contact) return;

      ScrollTrigger.create({
        trigger: contact,
        start: "-50% top",
        onUpdate: (self) => {
          const progress = self.progress;
          cards.forEach((card) => {
            gsap.to(card, {
              y: -300 * progress,
              overwrite: true,
            });
          });
        },
      });
    }

    function setupSplitHeadings() {
      const headings = qa<HTMLHeadingElement>("h1");

      headings.forEach((heading) => {
        const text = heading.textContent ?? "";
        heading.textContent = "";

        Array.from(text).forEach((char) => {
          if (char === " ") {
            heading.appendChild(document.createTextNode("\u00a0"));
            return;
          }

          const span = document.createElement("span");
          span.textContent = char;

          const wrapper = document.createElement("div");
          wrapper.className = "letter";
          wrapper.appendChild(span);
          heading.appendChild(wrapper);
        });

        const spans = Array.from(heading.querySelectorAll(".letter span"));
        gsap.to(spans, {
          x: 0,
          duration: 1,
          ease: "power4.out",
          delay: (index) => Math.random() * 0.5 + 0.25,
          scrollTrigger: {
            trigger: heading,
            start: "top 90%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }

    function setupImageRefresh() {
      const images = qa<HTMLImageElement>("img");
      const refresh = () => {
        lenis.resize?.();
        ScrollTrigger.refresh();
      };

      images.forEach((image) => {
        if (image.complete) return;
        image.addEventListener("load", refresh, { once: true });
        image.addEventListener("error", refresh, { once: true });
        cleanups.push(() => {
          image.removeEventListener("load", refresh);
          image.removeEventListener("error", refresh);
        });
      });
    }
  }, [lenis, navigate, pathname, root, rootElement, scroller]);
}

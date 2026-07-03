// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/dark-catalog-page";

const AssetContext = createContext(DEFAULT_ASSET_BASE);
const RouterContext = createContext({
  pathname: "/",
  navigate: (_path: string) => {},
});
const ScrollContext = createContext({
  scroller: null as HTMLElement | Window | null,
  lenis: null as Lenis | null,
});

export function normalizePath(path: string) {
  const normalized = (path || "/")
    .split("?")[0]
    .split("#")[0]
    .replace(/\/$/, "");
  return normalized || "/";
}

export function AssetProvider({
  base,
  children,
}: {
  base: string;
  children: ReactNode;
}) {
  return <AssetContext.Provider value={base}>{children}</AssetContext.Provider>;
}

export function RouterProvider({
  pathname,
  navigate,
  children,
}: {
  pathname: string;
  navigate: (path: string) => void;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ pathname, navigate }), [pathname, navigate]);
  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function useAsset() {
  const base = useContext(AssetContext);
  return useCallback(
    (assetPath: string) =>
      base.replace(/\/$/, "") + "/" + assetPath.replace(/^\//, ""),
    [base],
  );
}

export function useRoute() {
  return useContext(RouterContext);
}

export function getScrollParent(
  node: HTMLElement | null,
): HTMLElement | Window {
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

export function getScrollerScrollTop(scroller: HTMLElement | Window | null) {
  if (!scroller || scroller === window)
    return window.scrollY || window.pageYOffset || 0;
  return scroller.scrollTop;
}

export function scrollScrollerToTop(scroller: HTMLElement | Window | null) {
  if (!scroller || scroller === window) {
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }
  scroller.scrollTo({ top: 0, behavior: "instant" });
}

export function useScroller() {
  return useContext(ScrollContext);
}

export function useTemplateLenis() {
  const { scroller, lenis } = useScroller();

  return useMemo(
    () =>
      lenis ?? {
        get scroll() {
          return getScrollerScrollTop(scroller);
        },
        start() {},
        stop() {},
        scrollTo(
          _value: number | string,
          options: { immediate?: boolean } = {},
        ) {
          scrollScrollerToTop(scroller);
        },
        on(eventName: string, callback: () => void) {
          if (eventName !== "scroll") return;
          const target = scroller || window;
          target.addEventListener("scroll", callback, { passive: true });
        },
        off(eventName: string, callback: () => void) {
          if (eventName !== "scroll") return;
          const target = scroller || window;
          target.removeEventListener("scroll", callback);
        },
      },
    [scroller, lenis],
  );
}

export function ScrollProvider({
  rootElement,
  children,
}: {
  rootElement: HTMLElement;
  children: ReactNode;
}) {
  const [scrollState, setScrollState] = useState<{
    scroller: HTMLElement | Window | null;
    lenis: Lenis | null;
  }>({ scroller: null, lenis: null });

  useLayoutEffect(() => {
    const nextScroller = getScrollParent(rootElement);
    let nextLenis: Lenis | null = null;
    let ticker: ((time: number) => void) | null = null;
    let previousOverflowAnchor = "";
    let previousOverscrollBehavior = "";
    let previousScrollBehavior = "";

    if (nextScroller instanceof HTMLElement) {
      previousOverflowAnchor = nextScroller.style.overflowAnchor;
      previousOverscrollBehavior = nextScroller.style.overscrollBehavior;
      previousScrollBehavior = nextScroller.style.scrollBehavior;
      nextScroller.style.overflowAnchor = "none";
      nextScroller.style.overscrollBehavior = "contain";
      nextScroller.style.scrollBehavior = "auto";

      nextLenis = new Lenis({
        wrapper: nextScroller,
        content: rootElement,
        smoothWheel: true,
        lerp: 0.1,
      });
      nextLenis.on("scroll", ScrollTrigger.update);
      ticker = (time) => nextLenis?.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
    }

    ScrollTrigger.defaults({ scroller: nextScroller });
    setScrollState({ scroller: nextScroller, lenis: nextLenis });

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      if (ticker) gsap.ticker.remove(ticker);
      nextLenis?.destroy();
      if (nextScroller instanceof HTMLElement) {
        nextScroller.style.overflowAnchor = previousOverflowAnchor;
        nextScroller.style.overscrollBehavior = previousOverscrollBehavior;
        nextScroller.style.scrollBehavior = previousScrollBehavior;
      }
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      ScrollTrigger.defaults({ scroller: undefined });
      setScrollState({ scroller: null, lenis: null });
    };
  }, [rootElement]);

  if (!scrollState.scroller) {
    return null;
  }

  return (
    <ScrollContext.Provider value={scrollState}>
      {children}
    </ScrollContext.Provider>
  );
}

export function LocalLink({
  href,
  onClick,
  onClickCapture,
  children,
  ...props
}: ComponentPropsWithoutRef<"a"> & { href: string }) {
  const { navigate } = useRoute();

  return (
    <a
      {...props}
      href={href}
      onClickCapture={onClickCapture}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (href.startsWith("/")) {
          event.preventDefault();
          navigate(href);
        }
      }}
    >
      {children}
    </a>
  );
}

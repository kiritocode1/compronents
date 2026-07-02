// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  const { scroller } = useScroller();

  return useMemo(
    () => ({
      get scroll() {
        return getScrollerScrollTop(scroller);
      },
      start() {},
      stop() {},
      scrollTo(_value: number | string, options: { immediate?: boolean } = {}) {
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
    }),
    [scroller],
  );
}

export function ScrollProvider({
  rootElement,
  children,
}: {
  rootElement: HTMLElement;
  children: ReactNode;
}) {
  const [scroller, setScroller] = useState<HTMLElement | Window | null>(null);

  useLayoutEffect(() => {
    const nextScroller = getScrollParent(rootElement);
    ScrollTrigger.defaults({ scroller: nextScroller });
    setScroller(nextScroller);

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      ScrollTrigger.defaults({ scroller: undefined });
      setScroller(null);
    };
  }, [rootElement]);

  if (!scroller) {
    return null;
  }

  return (
    <ScrollContext.Provider value={{ scroller }}>
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

// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  normalizePath,
  RouterProvider,
  scrollScrollerToTop,
  useScroller,
} from "../runtime";
import { dispatchMenuClose } from "../utils/menuClose";

const ROWS = 2;
const COLS = 5;
const ease = "power4.inOut";

gsap.registerPlugin(ScrollTrigger);

export default function TransitionProvider({
  children,
  pathname,
  setPathname,
}: {
  children: React.ReactNode;
  pathname: string;
  setPathname: (path: string) => void;
}) {
  const { scroller } = useScroller();
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const gridRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const setTransitionBlocking = (blocking) => {
    gridRef.current?.classList.toggle("is-blocking", blocking);
  };

  const getBlocks = useCallback(
    () => [
      ...Array.from(
        row1Ref.current?.querySelectorAll(".transition-block") || [],
      ),
      ...Array.from(
        row2Ref.current?.querySelectorAll(".transition-block") || [],
      ),
    ],
    [],
  );

  useEffect(() => {
    const blocks = getBlocks();
    gsap.set(blocks, { scaleY: 0, visibility: "hidden" });
  }, [getBlocks]);

  useLayoutEffect(() => {
    if (isTransitioningRef.current) return;

    scrollScrollerToTop(scroller);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }, [pathname, scroller]);

  const navigate = useCallback(
    (href: string) => {
      const nextPath = normalizePath(href);
      const currentPath = normalizePath(pathnameRef.current);

      if (nextPath === currentPath) {
        dispatchMenuClose();
        scrollScrollerToTop(scroller);
        return;
      }

      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      setTransitionBlocking(true);

      const blocks = getBlocks();
      gsap.killTweensOf(blocks);
      gsap.set(blocks, { visibility: "visible", scaleY: 0 });

      gsap.to(blocks, {
        scaleY: 1,
        duration: 1,
        stagger: {
          each: 0.1,
          from: "start",
          grid: [ROWS, COLS],
          axis: "x",
        },
        ease,
        onComplete: () => {
          dispatchMenuClose();
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
          setPathname(nextPath);

          requestAnimationFrame(() => {
            scrollScrollerToTop(scroller);
            gsap.set(blocks, { visibility: "visible", scaleY: 1 });
            gsap.to(blocks, {
              scaleY: 0,
              duration: 1,
              stagger: {
                each: 0.1,
                from: "start",
                grid: [ROWS, COLS],
                axis: "x",
              },
              ease,
              onComplete: () => {
                gsap.set(blocks, { visibility: "hidden" });
                setTransitionBlocking(false);
                isTransitioningRef.current = false;
                requestAnimationFrame(() => ScrollTrigger.refresh());
              },
            });
          });
        },
      });
    },
    [getBlocks, scroller, setPathname],
  );

  return (
    <RouterProvider pathname={pathname} navigate={navigate}>
      <div className="transition-grid" ref={gridRef}>
        <div className="transition-row row-1" ref={row1Ref}>
          {Array.from({ length: COLS }).map((_, i) => (
            <div key={i} className="transition-block" />
          ))}
        </div>
        <div className="transition-row row-2" ref={row2Ref}>
          {Array.from({ length: COLS }).map((_, i) => (
            <div key={i} className="transition-block" />
          ))}
        </div>
      </div>
      {children}
    </RouterProvider>
  );
}

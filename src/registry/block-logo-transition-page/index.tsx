"use client";

/**
 * Block Logo Transition Page - a three route site whose transitions are built
 * from twenty vertical blocks. Leaving a page, the blocks scale out from their
 * left edge on a two hundredth of a second stagger, sweeping the screen shut;
 * arriving, they collapse from the right, so the wipe never reverses direction
 * and always reads as travelling one way. While the screen is covered, a mark
 * draws itself: its path length is measured at runtime and used as the dash
 * offset, so the stroke traces on before the fill arrives.
 *
 * Routes run through a lightweight internal router, so the whole template is
 * one installable component with no routing dependency.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useCallback, useEffect, useRef, useState } from "react";

import { getBlockLogoTransitionStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/block-logo-transition-page";

export const BLOCK_LOGO_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/archive", label: "Archive" },
  { path: "/contact", label: "Contact" },
] as const;

export type BlockLogoRoute = (typeof BLOCK_LOGO_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(BLOCK_LOGO_ROUTES.map((r) => r.path));

function normalizePath(path: string | undefined): BlockLogoRoute {
  if (path && ROUTE_SET.has(path)) return path as BlockLogoRoute;
  return "/";
}

const LOGO_PATH =
  "M82.6306 0C79.8604 5.32092 74.9984 15.6531 72.43 24.0313C80.497 18.2644 89.0129 13.5149 97.6896 10.449C93.9825 17.5694 87.0092 32.5146 84.7598 42.5941C93.0521 37.1488 101.702 32.6834 110.474 29.7215C105.427 39.0923 95.1513 60.5111 94.4257 71.2193C83.5883 74.5743 52.906 88.8011 18.5906 118.443C25.5824 101.301 45.556 73.6638 70.6591 53.0204C57.6282 59.6057 38.4488 71.4317 17.8355 89.7486C22.896 76.8262 36.1412 57.0952 53.4438 40.1036C42.5167 46.1741 28.2058 55.6353 13 69.1471C20.7367 49.3908 50.4126 11.3841 82.6306 0Z";

const BLOCK_COUNT = 20;

export interface BlockLogoTransitionPageProps {
  assetBase?: string;
  brand?: string;
  homeHeading?: string;
  contactHeading?: string;
  archiveImages?: string[];
  initialPath?: BlockLogoRoute;
}

export default function BlockLogoTransitionPage({
  assetBase = DEFAULT_ASSET_BASE,
  brand = "Silhouette",
  homeHeading = "Timeless Form",
  contactHeading = "Get in touch",
  archiveImages,
  initialPath = "/",
}: BlockLogoTransitionPageProps) {
  const [path, setPath] = useState<BlockLogoRoute>(normalizePath(initialPath));
  const rootRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLElement[]>([]);
  const isTransitioning = useRef(false);
  const pathLengthRef = useRef(0);

  const images =
    archiveImages ??
    Array.from({ length: 4 }, (_, i) => `${assetBase}/img_0${i + 1}.jpg`);

  const revealPage = useCallback(() => {
    const blocks = blocksRef.current;
    if (!blocks.length) return;

    gsap.set(blocks, { scaleX: 1, transformOrigin: "right" });

    gsap.to(blocks, {
      scaleX: 0,
      duration: 0.4,
      stagger: 0.02,
      ease: "power2.out",
      transformOrigin: "right",
      onComplete: () => {
        isTransitioning.current = false;
      },
    });
  }, []);

  const navigate = useCallback(
    (next: BlockLogoRoute) => {
      if (isTransitioning.current || next === path) return;
      isTransitioning.current = true;

      const root = rootRef.current;
      const blocks = blocksRef.current;
      const logoOverlay = root?.querySelector<HTMLElement>(".blt-logo-overlay");
      const logoPathEl = root?.querySelector<SVGPathElement>(".blt-logo path");
      if (!blocks.length || !logoOverlay || !logoPathEl) {
        setPath(next);
        isTransitioning.current = false;
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => setPath(next),
      });

      tl.to(blocks, {
        scaleX: 1,
        duration: 0.4,
        stagger: 0.02,
        ease: "power2.out",
        transformOrigin: "left",
      })
        .set(logoOverlay, { opacity: 1 }, "-=0.2")
        .set(
          logoPathEl,
          {
            strokeDashoffset: pathLengthRef.current,
            fill: "transparent",
          },
          "-=0.25",
        )
        .to(
          logoPathEl,
          { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" },
          "-=0.5",
        )
        .to(
          logoPathEl,
          { fill: "#e3e4d8", duration: 1, ease: "power2.out" },
          "-=0.5",
        )
        .to(logoOverlay, { opacity: 0, duration: 0.25, ease: "power2.out" });
    },
    [path],
  );

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    blocksRef.current = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".blt-block"),
    );
    gsap.set(blocksRef.current, { scaleX: 0, transformOrigin: "left" });

    const logoPathEl = root.querySelector<SVGPathElement>(".blt-logo path");
    if (logoPathEl) {
      pathLengthRef.current = logoPathEl.getTotalLength();
      gsap.set(logoPathEl, {
        strokeDasharray: pathLengthRef.current,
        strokeDashoffset: pathLengthRef.current,
        fill: "transparent",
      });
    }
  }, []);

  // Copy is split per route and the blocks retract, matching the source, where
  // each navigation mounted a fresh page beneath the cover.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(SplitText);

    const content = root.querySelector<HTMLElement>(".blt-scroll");
    const lenis = content
      ? new Lenis({ wrapper: root, content })
      : new Lenis({ wrapper: root });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    revealPage();

    const splits: SplitText[] = [];
    const heading = root.querySelector<HTMLElement>(".blt-page-header h1");
    if (heading) {
      const split = SplitText.create(heading, {
        type: "chars",
        mask: "chars",
        charsClass: "blt-char",
      });
      splits.push(split);
      gsap.set(split.chars, { y: "100%" });
      gsap.to(split.chars, {
        y: "0%",
        duration: 1,
        stagger: 0.03,
        delay: 0.3,
        ease: "power4.out",
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      for (const split of splits) split.revert();
      lenis.destroy();
    };
  }, [path, revealPage]);

  return (
    <div className="blt-root" ref={rootRef}>
      <style>{getBlockLogoTransitionStyles()}</style>

      <div className="blt-transition-overlay">
        {Array.from({ length: BLOCK_COUNT }, (_, i) => (
          <div className="blt-block" key={`block-${i}`} />
        ))}
      </div>

      <div className="blt-logo-overlay">
        <div className="blt-logo-container">
          <svg
            className="blt-logo"
            width="160"
            height="160"
            viewBox="-4 -4 133 136"
            fill="none"
            aria-hidden="true"
          >
            <title>Transition mark</title>
            <path
              d={LOGO_PATH}
              fill="none"
              stroke="#e3e4d8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <nav className="blt-nav">
        <div className="blt-nav-logo">
          <button type="button" onClick={() => navigate("/")}>
            {brand}
          </button>
        </div>
        <div className="blt-nav-links">
          {BLOCK_LOGO_ROUTES.map((route) => (
            <button
              type="button"
              key={route.path}
              onClick={() => navigate(route.path)}
            >
              {route.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="blt-scroll" key={path}>
        <div className="blt-container">
          {path === "/" ? (
            <div className="blt-page-header">
              <h1>{homeHeading}</h1>
            </div>
          ) : null}

          {path === "/contact" ? (
            <div className="blt-page-header">
              <h1>{contactHeading}</h1>
            </div>
          ) : null}

          {path === "/archive" ? (
            <div className="blt-archive">
              {images.map((image) => (
                <img src={image} alt="" key={image} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * View Transition Folio Page - a three route photographer folio where the page
 * change is handled entirely by the browser's View Transition API. The old
 * page lifts a third of a screen and fades while the new one opens upward from
 * a flat clip path, so the arriving page reads as unrolling over the departing
 * one rather than crossfading with it. Entrance animations re-run on every
 * route: nav links roll up from behind their own clip, the hero name splits
 * into characters that rise on a stagger, and the about copy climbs line by
 * line from behind its own baseline.
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

import { getViewTransitionFolioStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/view-transition-folio-page";

export const FOLIO_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/work", label: "Work" },
  { path: "/about", label: "About" },
] as const;

export type FolioRoute = (typeof FOLIO_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(FOLIO_ROUTES.map((r) => r.path));

function normalizePath(path: string | undefined): FolioRoute {
  if (path && ROUTE_SET.has(path)) return path as FolioRoute;
  return "/";
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

export interface ViewTransitionFolioPageProps {
  assetBase?: string;
  name?: string;
  aboutCopy?: string;
  workImages?: string[];
  portraitImage?: string;
  initialPath?: FolioRoute;
}

export default function ViewTransitionFolioPage({
  assetBase = DEFAULT_ASSET_BASE,
  name = "Kaelon",
  aboutCopy = "Kaelon is a portrait photographer who captures striking and artistic images. His work focuses on light, shadow, and movement, creating portraits that feel both modern and timeless. With a minimal and moody style, he brings out raw emotion and unique beauty in every subject.",
  workImages,
  portraitImage,
  initialPath = "/",
}: ViewTransitionFolioPageProps) {
  const [path, setPath] = useState<FolioRoute>(normalizePath(initialPath));
  const rootRef = useRef<HTMLDivElement>(null);

  const images =
    workImages ??
    Array.from({ length: 4 }, (_, i) => `${assetBase}/img${i + 1}.jpeg`);
  const portrait = portraitImage ?? `${assetBase}/portrait.jpeg`;

  const navigate = useCallback(
    (next: FolioRoute) => {
      if (next === path) return;

      const doc = document as ViewTransitionDocument;
      if (typeof doc.startViewTransition !== "function") {
        setPath(next);
        return;
      }

      doc.startViewTransition(() => {
        setPath(next);
      });
    },
    [path],
  );

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  // Entrance animations re-run per route, matching the source, which rebuilt
  // the document body on every navigation and re-initialised from scratch.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(SplitText);

    const content = root.querySelector<HTMLElement>(".vtf-container");
    const lenis = content
      ? new Lenis({ wrapper: root, content })
      : new Lenis({ wrapper: root });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const splits: SplitText[] = [];

    gsap.to(root.querySelectorAll(".vtf-link button"), {
      y: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power4.out",
      delay: 1,
    });

    const heroHeading = root.querySelector<HTMLElement>(".vtf-hero h1");
    if (heroHeading) {
      const heroText = SplitText.create(heroHeading, {
        type: "chars",
        charsClass: "vtf-char",
      });
      splits.push(heroText);
      gsap.set(heroText.chars, { y: 400 });
      gsap.to(heroText.chars, {
        y: 0,
        duration: 1,
        stagger: 0.075,
        ease: "power4.out",
        delay: 1,
      });
    }

    const infoCopy = root.querySelector<HTMLElement>(".vtf-info p");
    if (infoCopy) {
      const text = SplitText.create(infoCopy, {
        type: "lines",
        mask: "lines",
        linesClass: "vtf-line",
      });
      splits.push(text);

      gsap.set(text.lines, { y: 400 });
      gsap.to(text.lines, {
        y: 0,
        duration: 2,
        stagger: 0.075,
        ease: "power4.out",
        delay: 0.25,
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      for (const split of splits) split.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div className="vtf-root" ref={rootRef}>
      <style>{getViewTransitionFolioStyles()}</style>

      <nav className="vtf-nav">
        <div className="vtf-logo">
          <div className="vtf-link">
            <button type="button" onClick={() => navigate("/")}>
              Index
            </button>
          </div>
        </div>
        <div className="vtf-links">
          {FOLIO_ROUTES.filter((r) => r.path !== "/").map((route) => (
            <div className="vtf-link" key={route.path}>
              <button type="button" onClick={() => navigate(route.path)}>
                {route.label}
              </button>
            </div>
          ))}
        </div>
      </nav>

      <div className="vtf-container" key={path}>
        {path === "/" ? (
          <div className="vtf-hero">
            <h1>{name}</h1>
          </div>
        ) : null}

        {path === "/work" ? (
          <div className="vtf-images">
            {images.map((image) => (
              <img src={image} alt="" key={image} />
            ))}
          </div>
        ) : null}

        {path === "/about" ? (
          <div className="vtf-info">
            <div className="vtf-col">
              <img src={portrait} alt="" />
            </div>
            <div className="vtf-col">
              <p>{aboutCopy}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

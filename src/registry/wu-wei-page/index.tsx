// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import type { CSSProperties } from "react";
import * as React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getWuWeiPageStyles } from "./styles";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("wuWeiPreloader", "0.9, 0, 0.1, 1");
CustomEase.create("wuWeiMenu", ".15, 1, .25, 1");

export const DEFAULT_ASSET_BASE = "https://ui.aryank.space/assets/wu-wei-page";

export type WuWeiPageRoute =
  | "/"
  | "/work"
  | "/studio"
  | "/archive"
  | "/contact"
  | "/sample-project";

export const WU_WEI_PAGE_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/work", label: "Work" },
  { path: "/studio", label: "Studio" },
  { path: "/archive", label: "Archive" },
  { path: "/contact", label: "Contact" },
  { path: "/sample-project", label: "Project" },
] as const;

const ROUTE_SET = new Set(WU_WEI_PAGE_ROUTES.map((route) => route.path));

let wuWeiInitialLoad = true;

const portfolio = [
  {
    year: "2025",
    projects: [
      ["Echo", "creative direction, design", "images/work/work_007.jpeg"],
      ["Nocturne Blur", "motion, design", "images/work/work_002.jpeg"],
      ["Phase // 03", "art direction, identity", "images/work/work_003.jpeg"],
      ["Hidden Signal", "web, creative direction", "images/work/work_004.jpeg"],
      ["SURF9", "typography, design", "images/work/work_005.jpeg"],
      ["Botanical Drift", "motion, experimental", "images/work/work_006.jpeg"],
      ["Mono Flower", "art direction, design", "images/work/work_001.jpeg"],
      ["GL Loop", "motion, design", "images/work/work_008.jpeg"],
    ],
  },
  {
    year: "2024",
    projects: [
      ["Echoed Matter", "art direction, identity", "images/work/work_009.jpeg"],
      ["LineEscape", "web, creative direction", "images/work/work_010.jpeg"],
      ["FLORA", "typography, design", "images/work/work_011.jpeg"],
      ["Black + Bloom", "motion, experimental", "images/work/work_012.jpeg"],
      ["Zag 13", "creative direction, design", "images/work/work_013.jpeg"],
    ],
  },
  {
    year: "2023",
    projects: [
      ["Serpent/Logic", "motion, design", "images/work/work_014.jpeg"],
      ["667-487", "art direction, identity", "images/work/work_015.jpeg"],
      ["Infra Burn", "web, creative direction", "images/work/work_016.jpeg"],
      ["Float", "typography, design", "images/work/work_017.jpeg"],
      ["Persona:2", "motion, experimental", "images/work/work_018.jpeg"],
      ["Bloom", "creative direction, design", "images/work/work_019.jpeg"],
      ["Rift Oscillator", "motion, design", "images/work/work_020.jpeg"],
    ],
  },
  {
    year: "2022",
    projects: [
      [
        "Timefold 22",
        "creative direction, design",
        "images/work/work_006.jpeg",
      ],
      ["CTRL V", "web, creative direction", "images/work/work_022.jpeg"],
      ["NEON SYSTEM 3", "typography, design", "images/work/work_023.jpeg"],
    ],
  },
  {
    year: "2021",
    projects: [
      ["Matrix+01", "motion, design", "images/work/work_024.jpeg"],
      [
        "Featherlight",
        "creative direction, design",
        "images/work/work_025.jpeg",
      ],
      ["Quiet Rush", "typography, design", "images/work/work_001.jpeg"],
      ["DriftState", "web, creative direction", "images/work/work_002.jpeg"],
      ["Signal Cut 4", "motion, experimental", "images/work/work_003.jpeg"],
    ],
  },
  {
    year: "2020",
    projects: [
      ["Tension Loop", "art direction, identity", "images/work/work_004.jpeg"],
      ["Object 1A", "creative direction, design", "images/work/work_005.jpeg"],
    ],
  },
  {
    year: "2019",
    projects: [
      ["Core-9", "art direction, identity", "images/work/work_021.jpeg"],
      ["Void / Dust", "web, creative direction", "images/work/work_007.jpeg"],
      ["ZigZag Dream", "motion, design", "images/work/work_008.jpeg"],
      ["SN4KE", "experimental, identity", "images/work/work_009.jpeg"],
    ],
  },
];

const processCardsData = [
  {
    index: "01",
    title: "Principles",
    image: "images/process/process_001.jpeg",
    description:
      "We design with restraint and intention. Every decision is shaped by a set of values: clarity, structure, and calm execution.",
  },
  {
    index: "02",
    title: "Approach",
    image: "images/process/process_002.jpeg",
    description:
      "Our process is iterative and deliberate. We prioritize simplicity over excess, and build systems that scale with clarity.",
  },
  {
    index: "03",
    title: "Practice",
    image: "images/process/process_003.jpeg",
    description:
      "We work at the intersection of design and code. Every detail is shaped by consistency, rhythm, and quiet precision.",
  },
  {
    index: "04",
    title: "Vision",
    image: "images/process/process_004.jpeg",
    description:
      "We believe the web should feel honest and effortless. Our aim is to create digital experiences that stand the test of time.",
  },
];

function normalizePath(path: string): WuWeiPageRoute {
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
  return ROUTE_SET.has(withSlash) ? (withSlash as WuWeiPageRoute) : "/";
}

function assetUrl(assetBase: string, path: string) {
  return `${assetBase.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
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

function killScopedScrollTriggers(root: HTMLElement | null) {
  if (!root) return;
  ScrollTrigger.getAll().forEach((trigger) => {
    const target = trigger.trigger;
    if (target instanceof Node && root.contains(target)) {
      trigger.kill(true);
    }
  });
}

export interface WuWeiPageProps {
  assetBase?: string;
  initialPath?: WuWeiPageRoute | string;
  className?: string;
  style?: CSSProperties;
}

export default function WuWeiPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: WuWeiPageProps) {
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const [pathname, setPathname] = useState<WuWeiPageRoute>(() =>
    normalizePath(initialPath),
  );
  const pathnameRef = useRef(pathname);
  const transitioningRef = useRef(false);
  const transitionOverlayRef = useRef<HTMLDivElement | null>(null);
  const { scroller, lenis } = useScrollRuntime(rootElement);
  const css = useMemo(() => getWuWeiPageStyles(assetBase), [assetBase]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    setPathname(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = useCallback(
    (path: string) => {
      const next = normalizePath(path);
      if (transitioningRef.current) return;

      if (next === pathnameRef.current) {
        scrollToTop(scroller, lenis ?? undefined);
        return;
      }

      const overlay = transitionOverlayRef.current;
      const route = rootElement?.querySelector(".wu-wei-route");

      if (!overlay || !route) {
        setPathname(next);
        scrollToTop(scroller, lenis ?? undefined);
        return;
      }

      transitioningRef.current = true;
      const tl = gsap.timeline({
        onComplete: () => {
          transitioningRef.current = false;
          ScrollTrigger.refresh();
        },
      });

      tl.set(overlay, { y: "100%" })
        .to(
          route,
          {
            opacity: 0.2,
            y: "-30%",
            scale: 0.9,
            duration: 1.5,
            ease: "power4.inOut",
          },
          0,
        )
        .to(
          overlay,
          {
            y: "0%",
            duration: 1.5,
            ease: "power4.inOut",
          },
          0,
        )
        .add(() => {
          setPathname(next);
          scrollToTop(scroller, lenis ?? undefined);
        }, 1.45)
        .to(overlay, {
          y: "-100%",
          duration: 0.95,
          ease: "power4.inOut",
        })
        .set(overlay, { y: "100%" });
    },
    [lenis, rootElement, scroller],
  );

  return (
    <div
      ref={setRootElement}
      className={["wu-wei-page", className].filter(Boolean).join(" ")}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {rootElement && scroller && lenis ? (
        <>
          <Menu assetBase={assetBase} navigate={navigate} pathname={pathname} />
          <RouteView
            key={pathname}
            assetBase={assetBase}
            navigate={navigate}
            pathname={pathname}
          />
          <div
            aria-hidden="true"
            className="wu-wei-transition-overlay"
            ref={transitionOverlayRef}
          />
        </>
      ) : null}
    </div>
  );
}

function RouteView({
  assetBase,
  navigate,
  pathname,
}: {
  assetBase: string;
  navigate: (path: string) => void;
  pathname: WuWeiPageRoute;
}) {
  const routeRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(frame);
      killScopedScrollTriggers(routeRef.current);
    };
  }, []);

  return (
    <div
      className={`wu-wei-route wu-wei-route-${
        pathname === "/" ? "index" : pathname.slice(1).replace("/", "-")
      }`}
      ref={routeRef}
    >
      {pathname === "/" ? (
        <HomePage assetBase={assetBase} navigate={navigate} />
      ) : null}
      {pathname === "/work" ? (
        <WorkPage assetBase={assetBase} navigate={navigate} />
      ) : null}
      {pathname === "/studio" ? (
        <StudioPage assetBase={assetBase} navigate={navigate} />
      ) : null}
      {pathname === "/archive" ? <ArchivePage assetBase={assetBase} /> : null}
      {pathname === "/contact" ? (
        <ContactPage assetBase={assetBase} navigate={navigate} />
      ) : null}
      {pathname === "/sample-project" ? (
        <SampleProjectPage assetBase={assetBase} navigate={navigate} />
      ) : null}
    </div>
  );
}

function Menu({
  assetBase,
  navigate,
  pathname,
}: {
  assetBase: string;
  navigate: (path: string) => void;
  pathname: WuWeiPageRoute;
}) {
  const [currentTime, setCurrentTime] = useState("");
  const isAnimatingRef = useRef(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const menuOverlayRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLParagraphElement | null>(null);
  const closeBtnRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now
        .toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .toUpperCase();
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    const root = menuRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.set(menuOverlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
      });
      gsap.set(closeBtnRef.current, { y: "100%" });
      gsap.set(root.querySelectorAll(".menu-overlay-items .revealer a"), {
        y: "100%",
      });
      gsap.set(
        root.querySelectorAll(
          ".menu-footer .revealer p, .menu-footer .revealer a",
        ),
        { y: "100%" },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  const closeMenu = useCallback((afterClose?: () => void) => {
    if (isAnimatingRef.current) return;

    const root = menuRef.current;
    isAnimatingRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        afterClose?.();
      },
    });

    tl.to(closeBtnRef.current, {
      y: "-100%",
      duration: 0.5,
      ease: "power3.out",
    });

    tl.to(
      root?.querySelectorAll(".menu-overlay-items .revealer a") ?? [],
      {
        y: "-100%",
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.in",
      },
      "<",
    );

    tl.to(
      root?.querySelectorAll(
        ".menu-footer .revealer p, .menu-footer .revealer a",
      ) ?? [],
      {
        y: "-100%",
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.in",
      },
      "<",
    );

    tl.to(
      menuOverlayRef.current,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
        onComplete: () => {
          if (menuOverlayRef.current) {
            menuOverlayRef.current.style.pointerEvents = "none";
          }

          gsap.set(closeBtnRef.current, { y: "100%" });
          gsap.set(root?.querySelectorAll(".menu-overlay-items .revealer a"), {
            y: "100%",
          });
          gsap.set(
            root?.querySelectorAll(
              ".menu-footer .revealer p, .menu-footer .revealer a",
            ),
            { y: "100%" },
          );
        },
      },
      "+=0.1",
    );

    tl.to(
      menuBtnRef.current,
      {
        y: "0%",
        duration: 0.5,
        ease: "power3.out",
        onStart: () => {
          if (navRef.current) navRef.current.style.pointerEvents = "all";
        },
      },
      "-=0.45",
    );
  }, []);

  const openMenu = useCallback(() => {
    if (isAnimatingRef.current) return;

    const root = menuRef.current;
    isAnimatingRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      },
    });

    tl.to(menuBtnRef.current, {
      y: "-100%",
      duration: 0.5,
      ease: "power3.out",
      onComplete: () => {
        if (navRef.current) navRef.current.style.pointerEvents = "none";
        gsap.set(menuBtnRef.current, { y: "100%" });
      },
    });

    tl.to(
      menuOverlayRef.current,
      {
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        onStart: () => {
          if (menuOverlayRef.current) {
            menuOverlayRef.current.style.pointerEvents = "all";
          }
        },
      },
      "-=0.45",
    );

    tl.to(
      closeBtnRef.current,
      {
        y: "0%",
        duration: 1,
        ease: "power3.out",
      },
      "-=0.5",
    );

    tl.to(
      root?.querySelectorAll(".menu-overlay-items .revealer a") ?? [],
      {
        y: "0%",
        duration: 1,
        stagger: 0.075,
        ease: "power3.out",
      },
      "<",
    );

    tl.to(
      root?.querySelectorAll(
        ".menu-footer .revealer p, .menu-footer .revealer a",
      ) ?? [],
      {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      },
      "<",
    );
  }, []);

  const navigateFromMenu = useCallback(
    (path: WuWeiPageRoute) => {
      if (isAnimatingRef.current) return;

      if (path === pathname) {
        closeMenu();
        return;
      }

      closeMenu(() => navigate(path));
    },
    [closeMenu, navigate, pathname],
  );

  return (
    <>
      <div className="nav-container">
        <div className="nav" ref={navRef}>
          <div className="nav-logo">
            <div className="revealer">
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  if (pathname !== "/") navigate("/");
                }}
              >
                <img
                  alt=""
                  className="logo-img"
                  src={assetUrl(assetBase, "images/logos/logo_light.png")}
                />
              </a>
            </div>
          </div>
          <div className="nav-items">
            <div className="nav-menu-time">
              <div className="revealer">
                <p className="sm caps mono">{currentTime}</p>
              </div>
            </div>

            <div className="nav-menu-toggle-open">
              <div
                className="revealer"
                onClick={openMenu}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") openMenu();
                }}
                role="button"
                tabIndex={0}
              >
                <p className="sm caps mono" ref={menuBtnRef}>
                  Menu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="menu" ref={menuRef}>
        <div className="menu-overlay" ref={menuOverlayRef}>
          <div className="menu-overlay-nav">
            <div className="menu-overlay-nav-toggle-close">
              <div
                className="revealer"
                onClick={() => closeMenu()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") closeMenu();
                }}
                role="button"
                tabIndex={0}
              >
                <p className="sm caps mono" ref={closeBtnRef}>
                  Close
                </p>
              </div>
            </div>
          </div>
          <div className="menu-overlay-items">
            {[
              ["/", "index,"],
              ["/work", "work,"],
              ["/studio", "studio,"],
              ["/archive", "archive,"],
              ["/contact", "contact"],
            ].map(([path, label]) => (
              <div className="revealer" key={path}>
                <a
                  href={path}
                  onClick={(event) => {
                    event.preventDefault();
                    navigateFromMenu(path as WuWeiPageRoute);
                  }}
                >
                  <h1>{label}</h1>
                </a>
              </div>
            ))}
          </div>
          <div className="menu-footer">
            <div className="menu-footer-col">
              <div className="revealer">
                <p className="sm caps mono">(c) 2025 All Rights Reserved</p>
              </div>
            </div>
            <div className="menu-footer-col">
              <div className="socials">
                <div className="revealer">
                  <a
                    className="sm caps mono"
                    href="https://www.youtube.com/@aryankspace"
                  >
                    YouTube
                  </a>
                </div>
                <div className="revealer">
                  <a
                    className="sm caps mono"
                    href="https://www.instagram.com/aryankspace/"
                  >
                    Instagram
                  </a>
                </div>
                <div className="revealer">
                  <a className="sm caps mono" href="https://x.com/aryankspace">
                    X
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CopyReveal({
  children,
  animateOnScroll = true,
  delay = 0,
}: {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
}) {
  const containerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    const splits: SplitText[] = [];
    const lines: HTMLElement[] = [];

    const waitForFonts = async () => {
      try {
        await document.fonts.ready;
        await Promise.all(
          ["nm", "DM Mono"].map((fontFamily) =>
            document.fonts.check(`16px ${fontFamily}`),
          ),
        );
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      } catch {
        await new Promise((resolve) => window.setTimeout(resolve, 200));
      }
    };

    const setup = async () => {
      await waitForFonts();
      if (cancelled || !containerRef.current) return;

      const ctx = gsap.context(() => {
        const container = containerRef.current;
        const elements = container.hasAttribute("data-copy-wrapper")
          ? Array.from(container.children)
          : [container];

        elements.forEach((element) => {
          const split = SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: "line++",
            lineThreshold: 0.1,
          });
          splits.push(split);

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;
          if (textIndent && textIndent !== "0px" && split.lines.length > 0) {
            split.lines[0].style.paddingLeft = textIndent;
            element.style.textIndent = "0";
          }

          lines.push(...split.lines);
        });

        gsap.set(lines, { y: "100%" });
        const animationProps = {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay,
        };

        if (animateOnScroll) {
          gsap.to(lines, {
            ...animationProps,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 75%",
              once: true,
            },
          });
        } else {
          gsap.to(lines, animationProps);
        }
      }, containerRef);

      if (cancelled) ctx.revert();
    };

    setup();

    return () => {
      cancelled = true;
      splits.forEach((split) => split?.revert());
    };
  }, [animateOnScroll, delay]);

  if (React.Children.count(children) === 1) {
    const child = React.Children.only(children);
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { ref: containerRef });
    }
  }

  return (
    <div data-copy-wrapper="true" ref={containerRef}>
      {children}
    </div>
  );
}

function BtnLink({
  dark = false,
  label,
  navigate,
  route,
}: {
  dark?: boolean;
  label: string;
  navigate: (path: string) => void;
  route: string;
}) {
  return (
    <a
      className={`sm caps mono ${dark ? "link-dark" : "link-light"}`}
      href={route}
      onClick={(event) => {
        event.preventDefault();
        navigate(route);
      }}
    >
      <div
        className={`anime-link ${dark ? "anime-link-dark" : "anime-link-light"}`}
      >
        <div className="anime-link-label">
          <p className="sm caps mono">
            <span>{label}</span>
          </p>
        </div>
        <div className="anime-link-icon">
          <span aria-hidden="true" className="wu-wei-arrow">
            &#8594;
          </span>
        </div>
      </div>
    </a>
  );
}

function HomePage({
  assetBase,
  navigate,
}: {
  assetBase: string;
  navigate: (path: string) => void;
}) {
  const [showPreloader] = useState(wuWeiInitialLoad);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      wuWeiInitialLoad = false;
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const heroLink = root.querySelector(".hero-link");
      const animationDelay = showPreloader ? 6.2 : 0.9;

      if (showPreloader) {
        const tl = gsap.timeline({
          delay: 0.3,
          defaults: {
            ease: "wuWeiPreloader",
          },
          onComplete: () => {
            wuWeiInitialLoad = false;
          },
        });

        const counts = root.querySelectorAll(".count");
        const progressBar = root.querySelector(".progress-bar");
        const preloaderOverlay = root.querySelector(".preloader-overlay");

        const progressTl = gsap.timeline({ delay: 0.3 });

        counts.forEach((count, index) => {
          const digits = count.querySelectorAll(".digit h1");

          tl.to(
            digits,
            {
              y: "0%",
              duration: 1,
              stagger: 0.075,
            },
            index * 1,
          );

          tl.to(
            digits,
            {
              y: "-120%",
              duration: 1,
              stagger: 0.075,
            },
            index * 1 + 1,
          );

          progressTl.to(
            progressBar,
            {
              scaleY: (index + 1) / counts.length,
              duration: 1,
              ease: "wuWeiPreloader",
            },
            index * 1,
          );
        });

        progressTl
          .set(progressBar, { transformOrigin: "top" })
          .to(progressBar, {
            scaleY: 0,
            duration: 0.75,
            ease: "wuWeiPreloader",
          })
          .to(preloaderOverlay, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              if (preloaderOverlay instanceof HTMLElement) {
                preloaderOverlay.style.display = "none";
              }
            },
          });
      }

      if (heroLink) {
        gsap.set(heroLink, { y: 30, opacity: 0 });
        gsap.to(heroLink, {
          y: 0,
          opacity: 1,
          duration: 1,
          delay: animationDelay,
          ease: "power4.out",
        });
      }
    }, root);

    return () => ctx.revert();
  }, [showPreloader]);

  return (
    <div className="wu-wei-home" ref={rootRef}>
      {showPreloader ? (
        <div className="preloader-overlay">
          <div className="progress-bar" />
          <div className="counter">
            {["00", "27", "65", "98", "99"].map((count) => (
              <div className="count" key={count}>
                {count.split("").map((digit, index) => (
                  <div className="digit" key={`${count}-${index}`}>
                    <h1>{digit}</h1>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <section className="hero">
        <DynamicBackground
          logoPath={assetUrl(assetBase, "images/logos/logo_light.png")}
        />

        <div className="hero-content">
          <div className="hero-header">
            <div className="hero-header-col-lg" />
            <div className="hero-header-col-sm">
              <CopyReveal
                animateOnScroll={false}
                delay={showPreloader ? 6.2 : 0.9}
              >
                <h3>
                  Systems thinking and creative execution brought into web
                  development for consistent outcomes.
                </h3>
              </CopyReveal>
            </div>
          </div>

          <div className="hero-footer">
            <div className="hero-footer-col-lg">
              <CopyReveal
                animateOnScroll={false}
                delay={showPreloader ? 6.2 : 0.9}
              >
                <p className="sm caps mono">Studios</p>
                <p className="sm caps mono">Toronto and Copenhagen</p>
              </CopyReveal>
            </div>
            <div className="hero-footer-col-sm">
              <div className="hero-tags">
                <CopyReveal
                  animateOnScroll={false}
                  delay={showPreloader ? 6.2 : 0.9}
                >
                  <p className="sm caps mono">Web Systems</p>
                  <p className="sm caps mono">Interface Design</p>
                  <p className="sm caps mono">Creative Development</p>
                  <p className="sm caps mono">End to End Delivery</p>
                </CopyReveal>
              </div>

              <div className="hero-link">
                <BtnLink label="contact" navigate={navigate} route="/contact" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DynamicBackground({ logoPath }: { logoPath: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.innerWidth < 1000) return;

    const CONFIG = {
      canvasBg: "#1a1a1a",
      logoSize: 1100,
      distortionRadius: 3000,
      forceStrength: 0.003,
      maxDisplacement: 100,
      returnForce: 0.025,
    };

    const dpr = window.devicePixelRatio || 1;
    let animationFrame = 0;
    let program: WebGLProgram | null = null;
    let geometry: {
      positionBuffer: WebGLBuffer | null;
      colorBuffer: WebGLBuffer | null;
      vertexCount: number;
    } | null = null;
    let particleGrid: { ox: number; oy: number; vx: number; vy: number }[] = [];
    let posArray: Float32Array | null = null;
    let colorArray: Float32Array | null = null;
    const mouse = { x: 0, y: 0 };
    let execCount = 0;
    let cleanedUp = false;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resizeCanvas();

    const gl = canvas.getContext("webgl", {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });

    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vertexShaderSource = `
      precision highp float;
      uniform vec2 u_resolution;
      attribute vec2 a_position;
      attribute vec4 a_color;
      varying vec4 v_color;
      void main() {
         vec2 zeroToOne = a_position / u_resolution;
         vec2 clipSpace = (zeroToOne * 2.0 - 1.0);
         v_color = a_color;
         gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
         gl_PointSize = 3.5;
     }
    `;

    const fragmentShaderSource = `
      precision highp float;
      varying vec4 v_color;
      void main() {
          if (v_color.a < 0.01) discard;
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
      }
    `;

    function hexToRgb(hex: string) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: Number.parseInt(result[1], 16) / 255,
            g: Number.parseInt(result[2], 16) / 255,
            b: Number.parseInt(result[3], 16) / 255,
          }
        : { r: 0, g: 0, b: 0 };
    }

    function createShader(type: number, source: string) {
      if (cleanedUp) return null;
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    if (!vertexShader || !fragmentShader) return;

    program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position",
    );
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution",
    );

    function initParticleSystem(pixels: Uint8ClampedArray, dim: number) {
      if (cleanedUp) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const validPositions: number[] = [];
      const validColors: number[] = [];
      const validParticles: {
        ox: number;
        oy: number;
        vx: number;
        vy: number;
      }[] = [];

      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          const pixelIndex = (i * dim + j) * 4;
          const alpha = pixels[pixelIndex + 3];

          if (alpha > 10) {
            const x = centerX + (j - dim / 2) * 1.0;
            const y = centerY + (i - dim / 2) * 1.0;
            validPositions.push(x, y);
            validColors.push(
              pixels[pixelIndex] / 255,
              pixels[pixelIndex + 1] / 255,
              pixels[pixelIndex + 2] / 255,
              pixels[pixelIndex + 3] / 255,
            );
            validParticles.push({ ox: x, oy: y, vx: 0, vy: 0 });
          }
        }
      }

      particleGrid = validParticles;
      posArray = new Float32Array(validPositions);
      colorArray = new Float32Array(validColors);
      const positionBuffer = gl.createBuffer();
      const colorBuffer = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);
      geometry = {
        positionBuffer,
        colorBuffer,
        vertexCount: validParticles.length,
      };

      animate();
    }

    function animate() {
      if (cleanedUp || !program || !geometry || !posArray) return;

      if (execCount > 0) {
        execCount -= 1;
        const rad = CONFIG.distortionRadius * CONFIG.distortionRadius;

        for (let i = 0, len = particleGrid.length; i < len; i++) {
          const x = posArray[i * 2];
          const y = posArray[i * 2 + 1];
          const d = particleGrid[i];
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dis = dx * dx + dy * dy;

          if (dis < rad && dis > 0) {
            const f = -rad / dis;
            const t = Math.atan2(dy, dx);
            const distFromOrigin = Math.sqrt(
              (x - d.ox) * (x - d.ox) + (y - d.oy) * (y - d.oy),
            );
            const forceMultiplier = Math.max(
              0.1,
              1 - distFromOrigin / (CONFIG.maxDisplacement * 2),
            );

            d.vx += f * Math.cos(t) * CONFIG.forceStrength * forceMultiplier;
            d.vy += f * Math.sin(t) * CONFIG.forceStrength * forceMultiplier;
          }

          const newX = x + (d.vx *= 0.82) + (d.ox - x) * CONFIG.returnForce;
          const newY = y + (d.vy *= 0.82) + (d.oy - y) * CONFIG.returnForce;
          const dxOrigin = newX - d.ox;
          const dyOrigin = newY - d.oy;
          const distFromOrigin = Math.sqrt(
            dxOrigin * dxOrigin + dyOrigin * dyOrigin,
          );

          if (distFromOrigin > CONFIG.maxDisplacement) {
            const excess = distFromOrigin - CONFIG.maxDisplacement;
            const scale = CONFIG.maxDisplacement / distFromOrigin;
            const dampedScale = scale + (1 - scale) * Math.exp(-excess * 0.02);
            posArray[i * 2] = d.ox + dxOrigin * dampedScale;
            posArray[i * 2 + 1] = d.oy + dyOrigin * dampedScale;
            d.vx *= 0.7;
            d.vy *= 0.7;
          } else {
            posArray[i * 2] = newX;
            posArray[i * 2 + 1] = newY;
          }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, posArray);
      }

      const bgColor = hexToRgb(CONFIG.canvasBg);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry.positionBuffer);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0,
      );
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry.colorBuffer);
      gl.enableVertexAttribArray(colorAttributeLocation);
      gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.POINTS, 0, geometry.vertexCount);
      animationFrame = window.requestAnimationFrame(animate);
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cleanedUp) return;
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;
      tempCanvas.width = CONFIG.logoSize;
      tempCanvas.height = CONFIG.logoSize;
      const scale = 0.9;
      const scaledSize = CONFIG.logoSize * scale;
      const offset = (CONFIG.logoSize - scaledSize) / 2;
      tempCtx.drawImage(image, offset, offset, scaledSize, scaledSize);
      const imageData = tempCtx.getImageData(
        0,
        0,
        CONFIG.logoSize,
        CONFIG.logoSize,
      );
      initParticleSystem(imageData.data, CONFIG.logoSize);
    };
    image.src = logoPath;

    const handleMouseMove = (event: MouseEvent) => {
      if (cleanedUp) return;
      const rect = canvas.getBoundingClientRect();
      const currentDpr = window.devicePixelRatio || 1;
      mouse.x = (event.clientX - rect.left) * currentDpr;
      mouse.y = (event.clientY - rect.top) * currentDpr;
      execCount = 300;
    };

    const handleResize = () => {
      if (cleanedUp) return;
      resizeCanvas();
    };

    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      cleanedUp = true;
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (!gl.isContextLost()) {
        if (geometry?.positionBuffer) gl.deleteBuffer(geometry.positionBuffer);
        if (geometry?.colorBuffer) gl.deleteBuffer(geometry.colorBuffer);
        if (program) {
          const shaders = gl.getAttachedShaders(program);
          shaders?.forEach((shader) => {
            gl.detachShader(program, shader);
            gl.deleteShader(shader);
          });
          gl.deleteProgram(program);
        }
      }
    };
  }, [logoPath]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        backgroundColor: "transparent",
        mixBlendMode: "normal",
      }}
    />
  );
}

function WorkPage({
  assetBase,
  navigate,
}: {
  assetBase: string;
  navigate: (path: string) => void;
}) {
  const workRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = workRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const workContainers = root.querySelectorAll(".work-container");
      const yearIndices = root.querySelectorAll(".year-index");
      let initialAnimationComplete = false;
      const workProjects = root.querySelectorAll(".work-project");

      gsap.set(workProjects, { y: 100, opacity: 0 });
      gsap.to(workProjects, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        delay: 0.85,
        duration: 1,
        ease: "power3.out",
      });

      const setActiveYear = (activeIndex: number) => {
        yearIndices.forEach((yearIndex, index) => {
          yearIndex.classList.toggle("active", index === activeIndex);
          const highlighter = yearIndex.querySelector(
            ".year-index-highlighter",
          );
          gsap.to(highlighter, {
            scaleX: index === activeIndex ? 1 : 0,
            transformOrigin: index === activeIndex ? "left" : "right",
            duration: 0.3,
            ease: "power2.out",
          });
        });
      };

      workContainers.forEach((container, index) => {
        ScrollTrigger.create({
          trigger: container,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => {
            if (initialAnimationComplete) setActiveYear(index);
          },
          onEnterBack: () => {
            if (initialAnimationComplete) setActiveYear(index);
          },
        });
      });

      yearIndices.forEach((yearIndex) => {
        const highlighter = yearIndex.querySelector(".year-index-highlighter");
        gsap.set(highlighter, { scaleX: 0 });
      });

      const timeout = window.setTimeout(() => {
        let activeIndex = 0;
        workContainers.forEach((container, index) => {
          const rect = container.getBoundingClientRect();
          const containerCenter = rect.top + rect.height / 2;
          if (containerCenter <= window.innerHeight / 2) {
            activeIndex = index;
          }
        });
        setActiveYear(activeIndex);
        initialAnimationComplete = true;
      }, 1000);

      if (window.innerWidth > 1000) {
        root.querySelectorAll(".work-year").forEach((workYear) => {
          ScrollTrigger.create({
            trigger: workYear,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              gsap.to(workYear, {
                y: self.progress * -100,
                duration: 0.3,
                ease: "none",
              });
            },
          });
        });
      }

      return () => window.clearTimeout(timeout);
    }, root);

    return () => {
      ctx.revert();
      killScopedScrollTriggers(root);
    };
  }, []);

  return (
    <>
      <div className="work" ref={workRef}>
        <div className="year-indices">
          {portfolio.map((yearData, yearIndex) => (
            <div
              className={`year-index year-index-var-${(yearIndex % 3) + 1}`}
              key={yearData.year}
            >
              <CopyReveal delay={0.85}>
                <p className="sm">{yearData.year.slice(-2)}</p>
              </CopyReveal>
              <div className="year-index-highlighter" />
            </div>
          ))}
        </div>
        <div className="work-sidebar" />
        <div className="work-main">
          {portfolio.map((yearData) => (
            <div className="work-container" key={yearData.year}>
              <div className="work-year-container">
                <CopyReveal animateOnScroll={false} delay={0.85}>
                  <h1 className="work-year">'{yearData.year.slice(-2)}</h1>
                </CopyReveal>
              </div>
              <div className="work-projects-container">
                {yearData.projects.map(([name, tags, img]) => (
                  <div
                    className="work-project"
                    key={`${yearData.year}-${name}`}
                    onClick={() => navigate("/sample-project")}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        navigate("/sample-project");
                      }
                    }}
                    role="button"
                    style={{ cursor: "pointer" }}
                    tabIndex={0}
                  >
                    <div className="work-project-img">
                      <img alt={name} src={assetUrl(assetBase, img)} />
                    </div>
                    <div className="work-project-info">
                      <p className="sm work-project-info-name">{name}</p>
                      <p className="sm work-project-info-tags">{tags}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

function StudioPage({
  assetBase,
  navigate,
}: {
  assetBase: string;
  navigate: (path: string) => void;
}) {
  const studioRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = studioRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const studioHeroH1 = root.querySelector(".studio-hero h1");
      const studioHeroImgWrapper = root.querySelector(
        ".studio-hero-img-wrapper",
      );
      const missionLinkWrapper = root.querySelector(".mission-link");

      if (studioHeroH1) {
        const split = SplitText.create(studioHeroH1, {
          type: "chars",
          charsClass: "char++",
        });

        split.chars.forEach((char) => {
          const wrapper = document.createElement("span");
          wrapper.className = "char-mask";
          wrapper.style.overflow = "hidden";
          wrapper.style.display = "inline-block";
          char.parentNode.insertBefore(wrapper, char);
          wrapper.appendChild(char);
        });

        gsap.set(split.chars, { y: "100%" });
        gsap.to(split.chars, {
          y: "0%",
          duration: 0.8,
          stagger: 0.2,
          delay: 0.85,
          ease: "power3.out",
        });
      }

      if (studioHeroImgWrapper) {
        gsap.set(studioHeroImgWrapper, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        });
        gsap.to(studioHeroImgWrapper, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
          duration: 1,
          delay: 1,
          ease: "power3.out",
        });
      }

      if (missionLinkWrapper) {
        gsap.set(missionLinkWrapper, { y: 30, opacity: 0 });
        ScrollTrigger.create({
          trigger: missionLinkWrapper.closest(".mission-intro-copy"),
          start: "top 75%",
          once: true,
          onEnter: () => {
            gsap.to(missionLinkWrapper, {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 1.2,
              ease: "power3.out",
            });
          },
        });
      }
    }, root);

    return () => {
      ctx.revert();
      killScopedScrollTriggers(root);
    };
  }, []);

  return (
    <>
      <div className="studio" ref={studioRef}>
        <section className="studio-hero">
          <h1 className="caps">Wu</h1>
        </section>

        <section className="studio-hero-img">
          <div className="studio-hero-img-wrapper">
            <img alt="" src={assetUrl(assetBase, "images/studio/hero.jpeg")} />
          </div>
        </section>

        <section className="studio-header">
          <div className="studio-header-copy">
            <CopyReveal>
              <h2>
                At Wu Wei Studio, we approach every project with quiet focus.
                Through close collaboration and considered process, we build
                digital work that reflects both the needs of our clients and the
                values of our practice.
              </h2>
            </CopyReveal>
          </div>
        </section>

        <WhoWeAre assetBase={assetBase} />

        <section className="mission-intro">
          <div className="mission-intro-col-sm" />
          <div className="mission-intro-col-lg">
            <div className="mission-intro-copy">
              <CopyReveal>
                <h3>
                  We are a digital studio dedicated to creating clear and
                  purposeful online experiences. Our work is rooted in
                  structure, guided by systems, and shaped through close
                  collaboration.
                </h3>
                <br />
                <h3>
                  With a focus on design and development, we build scalable
                  solutions that reflect quiet precision and long-term value.
                  Every project is an exercise in restraint, intention, and
                  technical care.
                </h3>
              </CopyReveal>

              <div className="mission-link">
                <BtnLink
                  dark
                  label="View Work"
                  navigate={navigate}
                  route="/work"
                />
              </div>
            </div>
          </div>
        </section>

        <ProcessCards assetBase={assetBase} />

        <section className="recognition">
          <div className="recognition-copy">
            <CopyReveal>
              <p className="sm caps">(Recognition)</p>
              <br />
              <h2>
                Our work has been recognized by digital platforms and design
                communities for its clarity, consistency, and attention to
                detail. We focus on building systems that go beyond visuals
                experiences.
              </h2>
            </CopyReveal>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

function WhoWeAre({ assetBase }: { assetBase: string }) {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const whoweareScroll = root.querySelector(".whoweare-scroll");
      const whoweareContainer = root.querySelector(".whoweare-container");
      if (!(whoweareScroll instanceof HTMLElement)) return;

      const containerWidth = whoweareScroll.offsetWidth;
      const viewportWidth = window.innerWidth;
      const maxTranslateX = containerWidth - viewportWidth;
      const maxTranslateAtTarget = maxTranslateX / 1;

      const images = [
        { id: "#whoweare-img-1", endTranslateX: -800 },
        { id: "#whoweare-img-2", endTranslateX: -1200 },
        { id: "#whoweare-img-3", endTranslateX: -600 },
        { id: "#whoweare-img-4", endTranslateX: -1000 },
        { id: "#whoweare-img-5", endTranslateX: -900 },
      ];

      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: `bottom+=${window.innerHeight * 2} top`,
        scrub: 1,
        onUpdate: (self) => {
          const clipPathValue = Math.min(self.progress * 100, 100);
          gsap.set(whoweareContainer, {
            clipPath: `circle(${clipPathValue}% at 50% 50%)`,
          });
        },
        onComplete: () => {
          gsap.set(whoweareContainer, {
            clipPath: "circle(100% at 50% 50%)",
          });
        },
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: `+=${window.innerHeight * 6}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          let opacity = 1;
          let scale = 1;
          let translateX = 0;

          if (progress <= 0.3) {
            const fadeProgress = progress / 0.3;
            opacity = fadeProgress;
            scale = 0.85 + 0.15 * fadeProgress;
          } else {
            const adjustedProgress = (progress - 0.3) / (1 - 0.3);
            translateX = -Math.min(
              adjustedProgress * maxTranslateAtTarget,
              maxTranslateX,
            );
          }

          gsap.set(whoweareScroll, {
            opacity,
            scale,
            x: translateX,
          });
        },
      });

      images.forEach((img) => {
        const image = root.querySelector(img.id);
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: `+=${window.innerHeight * 6}`,
          scrub: 1,
          onUpdate: (self) => {
            if (self.progress >= 0.3) {
              const adjustedProgress = (self.progress - 0.3) / (1 - 0.3);
              gsap.set(image, {
                x: `${img.endTranslateX * adjustedProgress}px`,
              });
            }
          },
        });
      });
    }, root);

    return () => {
      ctx.revert();
      killScopedScrollTriggers(root);
    };
  }, []);

  return (
    <section className="whoweare" ref={rootRef}>
      <div className="whoweare-container">
        <div className="whoweare-scroll">
          <div className="whoweare-header">
            <h1>Who we are</h1>
          </div>
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              className="whoweare-img"
              id={`whoweare-img-${index}`}
              key={index}
            >
              <img
                alt=""
                src={assetUrl(assetBase, `images/who-we-are/team-${index}.jpg`)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessCards({ assetBase }: { assetBase: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const processCards = root.querySelectorAll(".process-card");

      processCards.forEach((card, index) => {
        if (index < processCards.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: "top top",
            endTrigger: processCards[processCards.length - 1],
            end: "top top",
            pin: true,
            pinSpacing: false,
            id: `card-pin-${index}`,
          });

          ScrollTrigger.create({
            trigger: processCards[index + 1],
            start: "top bottom",
            end: "top top",
            onUpdate: (self) => {
              const progress = self.progress;
              const scale = 1 - progress * 0.25;
              const rotation = (index % 2 === 0 ? 5 : -5) * progress;
              gsap.set(card, {
                scale,
                rotation,
                "--after-opacity": progress,
              });
            },
          });
        }
      });
    }, root);

    return () => {
      ctx.revert();
      killScopedScrollTriggers(root);
    };
  }, []);

  return (
    <div className="process-cards" ref={rootRef}>
      {processCardsData.map((cardData) => (
        <div className="process-card" key={cardData.index}>
          <div className="process-card-index">
            <h1>{cardData.index}</h1>
          </div>
          <div className="process-card-content">
            <div className="process-card-content-wrapper">
              <h1 className="process-card-header">{cardData.title}</h1>
              <div className="process-card-img">
                <img alt="" src={assetUrl(assetBase, cardData.image)} />
              </div>
              <div className="process-card-copy">
                <div className="process-card-copy-title">
                  <p className="caps">(About the state)</p>
                </div>
                <div className="process-card-copy-description">
                  <p>{cardData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  const footerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = footerRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const textElements = root.querySelectorAll(".footer-text");

      textElements.forEach((element) => {
        const textContent = element.querySelector(".footer-text-content");
        gsap.set(textContent, { y: "100%" });
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top 80%",
        onEnter: () => {
          textElements.forEach((element, index) => {
            const textContent = element.querySelector(".footer-text-content");
            gsap.to(textContent, {
              y: "0%",
              duration: 0.8,
              delay: index * 0.1,
              ease: "power3.out",
            });
          });
        },
      });
    }, root);

    return () => {
      ctx.revert();
      killScopedScrollTriggers(root);
    };
  }, []);

  return (
    <div className="footer" ref={footerRef}>
      <div className="footer-socials">
        <div className="fs-col-lg" />
        <div className="fs-col-sm">
          <div className="fs-header">
            <div className="footer-text">
              <div className="footer-text-content">
                <p className="sm caps">( Socials )</p>
              </div>
            </div>
          </div>
          {[
            ["Email", "mailto:business@aryank.space"],
            ["LinkedIn", "https://www.linkedin.com/"],
            ["Behance", "https://www.behance.net/"],
            ["Instagram", "https://www.instagram.com/aryankspace/"],
            ["Vimeo", "https://vimeo.com/"],
          ].map(([label, href]) => (
            <div className="footer-social" key={label}>
              <a href={href}>
                <div className="footer-text">
                  <div className="footer-text-content">
                    <h2>{label}</h2>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-copy">
        <div className="fc-col-lg">
          <div className="footer-text">
            <div className="footer-text-content">
              <p className="sm caps">Developed by BLANK</p>
            </div>
          </div>
        </div>
        <div className="fc-col-sm">
          <div className="footer-text">
            <div className="footer-text-content">
              <p className="sm caps">(c) 2025 All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchivePage({ assetBase }: { assetBase: string }) {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const dragLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const gallery = galleryRef.current;
    const dragLayer = dragLayerRef.current;
    if (!gallery || !dragLayer) return;

    const isMobile = window.innerWidth < 1000;
    const totalRows = isMobile ? 15 : 20;
    const imagesPerRow = isMobile ? 30 : 60;
    const totalImages = totalRows * imagesPerRow;
    const images: HTMLDivElement[] = [];

    function getRandomHeight(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    for (let i = 0; i < totalImages; i++) {
      const img = document.createElement("div");
      img.className = "img";

      if (isMobile) {
        img.style.height = `${getRandomHeight(80, 100)}px`;
        img.style.width = "calc((100% - 72px) / 6)";
      } else {
        img.style.height = `${getRandomHeight(30, 40)}px`;
        img.style.width = "calc((100% - 236px) / 60)";
      }

      const imgElement = document.createElement("img");
      const randomImageNumber = Math.floor(Math.random() * 50) + 1;
      imgElement.src = assetUrl(
        assetBase,
        `images/archive/img${randomImageNumber}.jpeg`,
      );
      imgElement.alt = "";
      img.appendChild(imgElement);
      gallery.appendChild(img);
      images.push(img);
    }

    const introTween = gsap.to(images, {
      scale: 1,
      delay: 1,
      opacity: 0.3,
      duration: 0.5,
      stagger: {
        amount: 1,
        grid: [totalRows, imagesPerRow],
        from: "random",
      },
      ease: "power1.out",
      onComplete: () => {
        dragLayer.style.display = "block";
        images.forEach((img) => {
          const rect = img.getBoundingClientRect();
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const distX = (rect.left + rect.width / 2 - centerX) / 100;
          const distY = (rect.top + rect.height / 2 - centerY) / 100;
          gsap.to(img, {
            x: distX * (isMobile ? 400 : 1200),
            y: distY * (isMobile ? 400 : 600),
            opacity: 1,
            scale: isMobile ? 2.5 : 5,
            duration: 2.5,
            ease: "power4.inOut",
          });
        });
      },
    });

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    function lerp(start: number, end: number, factor: number) {
      return start + (end - start) * factor;
    }

    function animate() {
      if (
        isDragging ||
        Math.abs(targetX - currentX) > 0.01 ||
        Math.abs(targetY - currentY) > 0.01
      ) {
        currentX = lerp(currentX, targetX, 0.075);
        currentY = lerp(currentY, targetY, 0.075);
        gallery.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      raf = window.requestAnimationFrame(animate);
    }
    animate();

    function handleDragStart(event: MouseEvent | TouchEvent) {
      event.preventDefault();
      isDragging = true;
      dragLayer.classList.add("active");
      startX =
        event.type === "mousedown"
          ? (event as MouseEvent).pageX
          : (event as TouchEvent).touches[0].pageX;
      startY =
        event.type === "mousedown"
          ? (event as MouseEvent).pageY
          : (event as TouchEvent).touches[0].pageY;

      const transform = window.getComputedStyle(gallery).transform;
      const matrix = new DOMMatrix(transform);
      initialX = matrix.m41;
      initialY = matrix.m42;
      currentX = initialX;
      currentY = initialY;
      targetX = initialX;
      targetY = initialY;

      if (event.type === "mousedown") {
        document.addEventListener("mousemove", handleDragMove, {
          passive: false,
        });
        document.addEventListener("mouseup", handleDragEnd);
      } else {
        document.addEventListener("touchmove", handleDragMove, {
          passive: false,
        });
        document.addEventListener("touchend", handleDragEnd);
      }
    }

    function handleDragMove(event: MouseEvent | TouchEvent) {
      if (!isDragging) return;
      event.preventDefault();

      const currentPositionX =
        event.type === "mousemove"
          ? (event as MouseEvent).pageX
          : (event as TouchEvent).touches[0].pageX;
      const currentPositionY =
        event.type === "mousemove"
          ? (event as MouseEvent).pageY
          : (event as TouchEvent).touches[0].pageY;

      targetX = initialX + currentPositionX - startX;
      targetY = initialY + currentPositionY - startY;
    }

    function handleDragEnd() {
      isDragging = false;
      dragLayer.classList.remove("active");
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
    }

    dragLayer.addEventListener("mousedown", handleDragStart);
    dragLayer.addEventListener("touchstart", handleDragStart, {
      passive: false,
    });

    return () => {
      introTween.kill();
      window.cancelAnimationFrame(raf);
      dragLayer.removeEventListener("mousedown", handleDragStart);
      dragLayer.removeEventListener("touchstart", handleDragStart);
      handleDragEnd();
      gallery.innerHTML = "";
    };
  }, [assetBase]);

  return (
    <div className="archive-page">
      <div id="drag-layer" ref={dragLayerRef} />
      <div className="container">
        <div className="gallery" ref={galleryRef} />
      </div>
    </div>
  );
}

function ContactPage({
  assetBase,
  navigate,
}: {
  assetBase: string;
  navigate: (path: string) => void;
}) {
  const contactRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = contactRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const contactImg = root.querySelector(".contact-img");
      const footerTexts = root.querySelectorAll(".contact-footer .footer-text");

      gsap.set(contactImg, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });
      gsap.to(contactImg, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1,
        delay: 0.85,
        ease: "power3.out",
      });

      footerTexts.forEach((element) => {
        const textContent = element.querySelector(".footer-text-content");
        gsap.set(textContent, { y: "100%" });
      });

      footerTexts.forEach((element, index) => {
        const textContent = element.querySelector(".footer-text-content");
        gsap.to(textContent, {
          y: "0%",
          duration: 0.8,
          delay: 1.8 + index * 0.1,
          ease: "power3.out",
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const routeLink = (path: WuWeiPageRoute, label: string) => (
    <a
      href={path}
      onClick={(event) => {
        event.preventDefault();
        navigate(path);
      }}
    >
      <p className="caps sm">{label}</p>
    </a>
  );

  return (
    <div className="contact" ref={contactRef}>
      <div className="contact-img-wrapper">
        <div className="contact-img">
          <img
            alt=""
            src={assetUrl(assetBase, "images/contact/contact.jpeg")}
          />
        </div>
      </div>
      <div className="contact-copy">
        <div className="contact-copy-bio">
          <CopyReveal delay={1}>
            <p className="caps sm">Wu Wei Studios</p>
            <p className="caps sm">Toronto / Copenhagen</p>
          </CopyReveal>
        </div>

        <div className="contact-copy-tags">
          <CopyReveal delay={1.15}>
            <p className="caps sm">Web Systems</p>
            <p className="caps sm">Interface Design</p>
            <p className="caps sm">Creative Development</p>
            <p className="caps sm">End To End Delivery</p>
          </CopyReveal>
        </div>

        <div className="contact-copy-addresses">
          <div className="contact-address">
            <CopyReveal delay={1.3}>
              <p className="caps sm">Toronto</p>
              <p className="caps sm">Studio 302, Richmond St W</p>
              <p className="caps sm">M5V 3A8</p>
            </CopyReveal>
          </div>

          <div className="contact-address">
            <CopyReveal delay={1.45}>
              <p className="caps sm">Copenhagen</p>
              <p className="caps sm">Unit 02 Refshalevej 167A</p>
              <p className="caps sm">1432 Kobenhavn K</p>
            </CopyReveal>
          </div>
        </div>

        <div className="contact-copy-links">
          <CopyReveal delay={1.6}>
            {routeLink("/studio", "Studio Overview")}
            {routeLink("/archive", "Project Archive")}
            {routeLink("/work", "Selected Work")}
          </CopyReveal>
        </div>
      </div>

      <div className="contact-footer">
        <div className="fc-col-lg">
          <div className="footer-text">
            <div className="footer-text-content">
              <p className="sm caps">Developed by BLANK</p>
            </div>
          </div>
        </div>
        <div className="fc-col-sm">
          <div className="footer-text">
            <div className="footer-text-content">
              <p className="sm caps">(c) 2025 All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SampleProjectPage({
  assetBase,
  navigate,
}: {
  assetBase: string;
  navigate: (path: string) => void;
}) {
  const sampleProjectRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = sampleProjectRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const imagesContainer = root.querySelector(".sp-images-container");
      const progressContainer = root.querySelector(
        ".sp-images-scroll-progress-container",
      );
      const counter = root.querySelector("#sp-images-scroll-counter");
      const bannerImg = root.querySelector(".sp-banner-img");
      const btnLinkWrapper = root.querySelector(".sp-link-wrapper");

      gsap.set(bannerImg, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });
      gsap.to(bannerImg, {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
        duration: 1,
        delay: 1,
        ease: "power4.out",
      });

      if (btnLinkWrapper) {
        gsap.set(btnLinkWrapper, { y: 30, opacity: 0 });
        ScrollTrigger.create({
          trigger: btnLinkWrapper.closest(".sp-copy-description"),
          start: "top 75%",
          once: true,
          onEnter: () => {
            gsap.to(btnLinkWrapper, {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 1,
              ease: "power4.out",
            });
          },
        });
      }

      ScrollTrigger.create({
        trigger: imagesContainer,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const progress = Math.round(self.progress * 100);
          if (counter) counter.textContent = String(progress);

          if (progressContainer instanceof HTMLElement) {
            const containerHeight = progressContainer.offsetHeight;
            const isMobile = window.innerWidth < 1000;
            const baseDistance = window.innerHeight + containerHeight;
            const moveDistance = baseDistance * (isMobile ? 1.25 : 1);
            gsap.to(progressContainer, {
              y: -self.progress * moveDistance,
              duration: 0.1,
              ease: "none",
            });
          }
        },
      });

      gsap.set(progressContainer, {
        position: "fixed",
        top: "100vh",
        left: "1.5rem",
        right: "1.5rem",
        width: "calc(100% - 3rem)",
      });
    }, root);

    return () => {
      ctx.revert();
      killScopedScrollTriggers(root);
    };
  }, []);

  const imageList = [
    "001",
    "021",
    "003",
    "009",
    "015",
    "023",
    "024",
    "001",
    "021",
    "003",
    "009",
    "015",
    "023",
    "024",
  ];

  return (
    <div className="sample-project" ref={sampleProjectRef}>
      <section className="sp-hero">
        <CopyReveal delay={0.85}>
          <h1>Timefold 22</h1>
        </CopyReveal>
      </section>

      <section className="sp-banner-img">
        <img alt="" src={assetUrl(assetBase, "images/work/work_006.jpeg")} />
      </section>

      <section className="sp-copy">
        <div className="sp-info">
          <div className="sp-col sp-col-lg">
            <div className="sp-tags">
              <CopyReveal>
                <p className="sm caps mono">Creative Direction</p>
                <p className="sm caps mono">Motion Design</p>
                <p className="sm caps mono">Visual Identity</p>
              </CopyReveal>
            </div>
          </div>
          <div className="sp-col sp-col-sm">
            <div className="sp-year">
              <CopyReveal delay={0.15}>
                <p className="sm caps mono">2025</p>
              </CopyReveal>
            </div>
            <div className="client">
              <CopyReveal delay={0.3}>
                <p className="sm caps mono">Self-Initiated</p>
              </CopyReveal>
            </div>
          </div>
        </div>

        <div className="sp-copy-wrapper">
          <div className="sp-col-lg">
            <div className="sp-copy-title">
              <CopyReveal>
                <h3>Exploring Motion Through Structured Design</h3>
              </CopyReveal>
            </div>
          </div>
          <div className="sp-col-sm">
            <div className="sp-copy-description">
              <CopyReveal>
                <p>
                  Timefold 22 is an exploration of motion through layered
                  temporal loops. Built with a modular design system, the
                  visuals pulse and stretch to reflect the elasticity of time in
                  digital environments. The concept embraces minimal forms with
                  high contrast dynamics to suggest an ongoing shift, folding
                  the present into an abstract continuum.
                </p>
                <br />
                <p>
                  Designed as a speculative identity for a non-linear brand
                  system, this piece operates both as a visual experiment and a
                  creative prompt. Every frame is composed to highlight rhythm,
                  silence, and distortion, aimed at evoking a subtle tension
                  between chaos and control.
                </p>
              </CopyReveal>

              <div className="sp-link">
                <div className="sp-link-wrapper">
                  <BtnLink label="Live Demo" navigate={navigate} route="/" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-images">
        <div className="sp-images-scroll-progress-container">
          <h1 id="sp-images-scroll-counter">0</h1>
          <h1>/100</h1>
        </div>
        <div className="sp-images-container">
          {imageList.map((id, index) => (
            <div className="sp-img" key={`${id}-${index}`}>
              <img
                alt=""
                src={assetUrl(assetBase, `images/work/work_${id}.jpeg`)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="sp-next-project">
        <div className="sp-next-project-copy">
          <CopyReveal>
            <p className="sm">(More Projects)</p>
          </CopyReveal>
          <div className="sp-next-project-names">
            <CopyReveal>
              <h1>Hidden Signal</h1>
            </CopyReveal>
          </div>
        </div>
      </section>
    </div>
  );
}

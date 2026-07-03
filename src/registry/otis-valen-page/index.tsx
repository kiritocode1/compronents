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

import { getOtisValenFragment, type OtisValenRoute } from "./fragments";
import { getOtisValenPageStyles } from "./styles";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/otis-valen-page";

export const OTIS_VALEN_PAGE_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/work", label: "The Good Stuff" },
  { path: "/project", label: "Project" },
  { path: "/about", label: "Meet Otis" },
  { path: "/contact", label: "Slide In" },
] as const;

const ROUTE_SET = new Set(OTIS_VALEN_PAGE_ROUTES.map((route) => route.path));

function normalizePath(path: string): OtisValenRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/\/$/, "") || "/";

  return ROUTE_SET.has(normalized) ? (normalized as OtisValenRoute) : "/";
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

function scrollToPosition(scroller: HTMLElement | Window | null, top: number) {
  if (!scroller || scroller === window) {
    window.scrollTo({ top, behavior: "instant" });
    return;
  }

  scroller.scrollTo({ top, behavior: "instant" });
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

    const isMobile = window.innerWidth <= 900;
    const scrollSettings = isMobile
      ? {
          duration: 1,
          easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
          direction: "vertical",
          gestureDirection: "vertical",
          smooth: true,
          smoothTouch: true,
          touchMultiplier: 1.5,
          infinite: false,
          lerp: 0.05,
          wheelMultiplier: 1,
          orientation: "vertical",
          smoothWheel: true,
          syncTouch: true,
        }
      : {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
          direction: "vertical",
          gestureDirection: "vertical",
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false,
          lerp: 0.1,
          wheelMultiplier: 1,
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

export interface OtisValenPageProps {
  assetBase?: string;
  initialPath?: OtisValenRoute | string;
  className?: string;
  style?: CSSProperties;
}

export default function OtisValenPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: OtisValenPageProps) {
  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const [pathname, setPathname] = useState<OtisValenRoute>(() =>
    normalizePath(initialPath),
  );
  const { scroller, lenis } = useScrollRuntime(rootElement);
  const css = useMemo(() => getOtisValenPageStyles(assetBase), [assetBase]);

  useEffect(() => {
    setPathname(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = useCallback(
    (path: string) => {
      setPathname(normalizePath(path));
      scrollToTop(scroller);
    },
    [scroller],
  );

  return (
    <div
      ref={setRootElement}
      className={["otis-valen-page", className].filter(Boolean).join(" ")}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {rootElement && scroller && lenis ? (
        <OtisValenRouteView
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

function OtisValenRouteView({
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
  pathname: OtisValenRoute;
  rootElement: HTMLElement;
  scroller: HTMLElement | Window;
}) {
  const [routeElement, setRouteElement] = useState<HTMLDivElement | null>(null);
  const html = useMemo(
    () => getOtisValenFragment(pathname, assetBase),
    [assetBase, pathname],
  );

  useOtisValenEffects({
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
      className={`otis-valen-route otis-valen-route-${
        pathname === "/" ? "index" : pathname.slice(1)
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function useOtisValenEffects({
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
  pathname: OtisValenRoute;
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
    const asset = (path: string) => assetUrl(assetBase, path);
    const scrollerTarget = scroller === window ? window : scroller;
    let closeMenuIfOpen = () => {};

    const ctx = gsap.context(() => {
      setupTransitionAndLinks();
      setupMenu();
      if (pathname === "/") {
        setupHomeHero();
        setupFeaturedWork();
        setupServices();
      }
      if (pathname === "/work") setupWorkPage();
      if (pathname === "/project") setupProjectPage();
      if (pathname === "/about") setupAboutPage();
      if (pathname === "/contact") setupContactPage();
      if (pathname !== "/contact") setupFooterExplosion();
    }, root);

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    cleanups.push(() => window.cancelAnimationFrame(refreshFrame));

    return () => {
      cleanups.splice(0).forEach((cleanup) => cleanup());
      ctx.revert();
    };

    function setupTransitionAndLinks() {
      const overlays = qa<HTMLElement>(".transition-overlay");

      gsap.set(overlays, { scaleY: 1, transformOrigin: "top" });
      gsap.to(overlays, {
        scaleY: 0,
        duration: 0.6,
        stagger: -0.1,
        ease: "power2.inOut",
      });

      const animateTransition = () =>
        new Promise<void>((resolve) => {
          gsap.set(overlays, { scaleY: 0, transformOrigin: "bottom" });
          gsap.to(overlays, {
            scaleY: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.inOut",
            onComplete: () => resolve(),
          });
        });

      const isSamePage = (href: string | null) => {
        if (!href || href === "#" || href === "") return true;
        return normalizePath(href) === pathname;
      };

      const links = qa<HTMLAnchorElement>("a");
      const onClick = (event: MouseEvent) => {
        const link = event.currentTarget as HTMLAnchorElement;
        const href = link.getAttribute("href");

        if (
          href &&
          (href.startsWith("http") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:"))
        ) {
          return;
        }

        event.preventDefault();

        if (isSamePage(href)) {
          closeMenuIfOpen();
          return;
        }

        closeMenuIfOpen();
        animateTransition().then(() => navigate(href || "/"));
      };

      links.forEach((link) => link.addEventListener("click", onClick));
      cleanups.push(() =>
        links.forEach((link) => link.removeEventListener("click", onClick)),
      );
    }

    function setupMenu() {
      const menuToggleBtn = q<HTMLElement>(".menu-toggle-btn");
      const navOverlay = q<HTMLElement>(".nav-overlay");
      const openLabel = q<HTMLElement>(".open-label");
      const closeLabel = q<HTMLElement>(".close-label");
      const navItems = qa<HTMLElement>(".nav-item");
      const navFooterParts = qa<HTMLElement>(
        ".nav-footer-item-header, .nav-footer-item-copy",
      );
      let isMenuOpen = false;
      let isAnimating = false;
      let scrollY = 0;
      let previousOverflow = "";

      if (!menuToggleBtn || !navOverlay || !openLabel || !closeLabel) return;

      const closeMenu = () => {
        if (!isMenuOpen) return;

        isAnimating = true;
        navOverlay.style.pointerEvents = "none";
        menuToggleBtn.classList.remove("menu-open");
        if (scroller instanceof HTMLElement) {
          scroller.style.overflow = previousOverflow;
        }
        lenis.start();
        scrollToPosition(scroller, scrollY);

        gsap.to(openLabel, {
          y: "0rem",
          duration: 0.3,
        });

        gsap.to(closeLabel, {
          y: "0rem",
          duration: 0.3,
        });

        gsap.to(navOverlay, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            gsap.set([...navItems, ...navFooterParts], {
              opacity: 0,
              y: "100%",
            });
            isAnimating = false;
          },
        });

        isMenuOpen = false;
      };

      closeMenuIfOpen = closeMenu;

      const onMenuToggle = () => {
        if (isAnimating) {
          gsap.killTweensOf([
            navOverlay,
            openLabel,
            closeLabel,
            ...navItems,
            ...navFooterParts,
          ]);
          isAnimating = false;
        }

        if (!isMenuOpen) {
          isAnimating = true;
          navOverlay.style.pointerEvents = "all";
          menuToggleBtn.classList.add("menu-open");
          scrollY = getScrollTop(scroller);
          if (scroller instanceof HTMLElement) {
            previousOverflow = scroller.style.overflow;
            scroller.style.overflow = "hidden";
          }
          lenis.stop();

          gsap.to(openLabel, {
            y: "-1rem",
            duration: 0.3,
          });

          gsap.to(closeLabel, {
            y: "-1rem",
            duration: 0.3,
          });

          gsap.to(navOverlay, {
            opacity: 1,
            duration: 0.3,
            onComplete: () => {
              isAnimating = false;
            },
          });

          gsap.to([...navItems, ...navFooterParts], {
            opacity: 1,
            y: "0%",
            duration: 0.75,
            stagger: 0.075,
            ease: "power4.out",
          });

          isMenuOpen = true;
          return;
        }

        closeMenu();
      };

      menuToggleBtn.addEventListener("click", onMenuToggle);
      cleanups.push(() => {
        menuToggleBtn.removeEventListener("click", onMenuToggle);
        closeMenu();
      });
    }

    function setupHomeHero() {
      const heroImg = q<HTMLImageElement>(".hero-img img");
      const heroImgBox = q<HTMLElement>(".hero-img");
      const holder = q<HTMLElement>(".hero-img-holder");
      if (!heroImg || !heroImgBox || !holder) return;

      let currentImageIndex = 1;
      let trigger: ScrollTrigger | null = null;

      const interval = window.setInterval(() => {
        currentImageIndex = currentImageIndex >= 10 ? 1 : currentImageIndex + 1;
        heroImg.src = asset(
          `images/work-items/work-item-${currentImageIndex}.jpg`,
        );
      }, 250);
      cleanups.push(() => window.clearInterval(interval));

      const initAnimations = () => {
        trigger?.kill();
        trigger = ScrollTrigger.create({
          trigger: holder,
          start: "top bottom",
          end: "top top",
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(heroImgBox, {
              y: `${-110 + 110 * progress}%`,
              scale: 0.25 + 0.75 * progress,
              rotation: -15 + 15 * progress,
            });
          },
        });
      };

      initAnimations();
      window.addEventListener("resize", initAnimations);
      cleanups.push(() => {
        window.removeEventListener("resize", initAnimations);
        trigger?.kill();
      });
    }

    function setupFeaturedWork() {
      const indicatorContainer = q<HTMLElement>(".featured-work-indicator");
      const featuredTitles = q<HTMLElement>(".featured-titles");
      const imagesContainer = q<HTMLElement>(".featured-images");
      const section = q<HTMLElement>(".featured-work");
      if (
        !indicatorContainer ||
        !featuredTitles ||
        !imagesContainer ||
        !section
      )
        return;

      let trigger: ScrollTrigger | null = null;

      const initAnimations = () => {
        if (window.innerWidth <= 1000) {
          trigger?.kill();
          trigger = null;
          return;
        }

        trigger?.kill();

        indicatorContainer.innerHTML = "";
        for (let sectionIndex = 1; sectionIndex <= 5; sectionIndex++) {
          const sectionNumber = document.createElement("p");
          sectionNumber.className = "mn";
          sectionNumber.textContent = `0${sectionIndex}`;
          indicatorContainer.appendChild(sectionNumber);

          for (let i = 0; i < 10; i++) {
            const indicator = document.createElement("div");
            indicator.className = "indicator";
            indicatorContainer.appendChild(indicator);
          }
        }

        const featuredCardPosSmall = [
          { y: 100, x: 1000 },
          { y: 1500, x: 100 },
          { y: 1250, x: 1950 },
          { y: 1500, x: 850 },
          { y: 200, x: 2100 },
          { y: 250, x: 600 },
          { y: 1100, x: 1650 },
          { y: 1000, x: 800 },
          { y: 900, x: 2200 },
          { y: 150, x: 1600 },
        ];

        const featuredCardPosLarge = [
          { y: 800, x: 5000 },
          { y: 2000, x: 3000 },
          { y: 240, x: 4450 },
          { y: 1200, x: 3450 },
          { y: 500, x: 2200 },
          { y: 750, x: 1100 },
          { y: 1850, x: 3350 },
          { y: 2200, x: 1300 },
          { y: 3000, x: 1950 },
          { y: 500, x: 4500 },
        ];

        const featuredCardPos =
          window.innerWidth >= 1600
            ? featuredCardPosLarge
            : featuredCardPosSmall;
        const moveDistance = window.innerWidth * 4;

        imagesContainer.innerHTML = "";
        for (let i = 1; i <= 10; i++) {
          const featuredImgCard = document.createElement("div");
          featuredImgCard.className = `featured-img-card featured-img-card-${i}`;

          const img = document.createElement("img");
          img.src = asset(`images/work-items/work-item-${i}.jpg`);
          img.alt = `featured work image ${i}`;
          featuredImgCard.appendChild(img);

          const position = featuredCardPos[i - 1];
          gsap.set(featuredImgCard, {
            x: position.x,
            y: position.y,
          });

          imagesContainer.appendChild(featuredImgCard);
        }

        const featuredImgCards = qa<HTMLElement>(".featured-img-card");
        featuredImgCards.forEach((featuredImgCard) => {
          gsap.set(featuredImgCard, {
            z: -1500,
            scale: 0,
          });
        });

        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${window.innerHeight * 5}px`,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            gsap.set(featuredTitles, {
              x: -moveDistance * self.progress,
            });

            featuredImgCards.forEach((featuredImgCard, index) => {
              const staggerOffset = index * 0.075;
              const scaledProgress = (self.progress - staggerOffset) * 2;
              const individualProgress = Math.max(
                0,
                Math.min(1, scaledProgress),
              );
              const newZ = -1500 + 3000 * individualProgress;
              const scaleProgress = Math.min(1, individualProgress * 10);
              const scale = Math.max(0, Math.min(1, scaleProgress));

              gsap.set(featuredImgCard, {
                z: newZ,
                scale,
              });
            });

            const indicators = qa<HTMLElement>(".indicator");
            const progressPerIndicator = 1 / indicators.length;

            indicators.forEach((indicator, index) => {
              const indicatorStart = index * progressPerIndicator;
              const indicatorOpacity = self.progress > indicatorStart ? 1 : 0.2;

              gsap.to(indicator, {
                opacity: indicatorOpacity,
                duration: 0.3,
              });
            });
          },
        });
      };

      initAnimations();
      window.addEventListener("resize", initAnimations);
      cleanups.push(() => {
        window.removeEventListener("resize", initAnimations);
        trigger?.kill();
      });
    }

    function setupServices() {
      const services = qa<HTMLElement>(".service-card");
      const contactCta = q<HTMLElement>(".contact-cta");
      if (!services.length || !contactCta) return;

      let triggers: ScrollTrigger[] = [];

      const initAnimations = () => {
        if (window.innerWidth <= 1000) {
          triggers.forEach((trigger) => trigger?.kill());
          triggers = [];
          return;
        }

        triggers.forEach((trigger) => trigger?.kill());
        triggers = [];

        const mainTrigger = ScrollTrigger.create({
          trigger: services[0],
          start: "top 50%",
          endTrigger: services[services.length - 1],
          end: "top 150%",
        });
        triggers.push(mainTrigger);

        services.forEach((service, index) => {
          const isLastServiceCard = index === services.length - 1;
          const serviceCardInner = service.querySelector<HTMLElement>(
            ".service-card-inner",
          );

          if (!isLastServiceCard && serviceCardInner) {
            const pinTrigger = ScrollTrigger.create({
              trigger: service,
              start: "top 45%",
              endTrigger: contactCta,
              end: "top 90%",
              pin: true,
              pinSpacing: false,
            });
            triggers.push(pinTrigger);

            const scrollAnimation = gsap.to(serviceCardInner, {
              y: `-${(services.length - index) * 14}vh`,
              ease: "none",
              scrollTrigger: {
                trigger: service,
                start: "top 45%",
                endTrigger: contactCta,
                end: "top 90%",
                scrub: true,
              },
            });
            triggers.push(scrollAnimation.scrollTrigger);
          }
        });
      };

      initAnimations();
      window.addEventListener("resize", initAnimations);
      cleanups.push(() => {
        window.removeEventListener("resize", initAnimations);
        triggers.forEach((trigger) => trigger?.kill());
      });
    }

    function setupWorkPage() {
      const splits: SplitText[] = [];
      const triggers: ScrollTrigger[] = [];
      const profileIcon = q<HTMLElement>(".work-profile-icon");
      const arrowIcon = q<HTMLElement>(".work-header-arrow-icon");
      const feastTextEl = q<HTMLElement>(".work-header-content p");
      const titleEls = qa<HTMLElement>(".work-header-title h1");

      if (profileIcon && arrowIcon && feastTextEl && titleEls.length) {
        gsap.set(profileIcon, { scale: 0 });
        gsap.set(arrowIcon, { scale: 0 });

        const feastText = SplitText.create(feastTextEl, {
          type: "lines",
          mask: "lines",
        });
        const titleText = SplitText.create(titleEls, {
          type: "lines",
          mask: "lines",
        });
        splits.push(feastText, titleText);

        gsap.set([feastText.lines, titleText.lines], {
          y: "120%",
        });

        const headerTl = gsap.timeline({ delay: 0.75 });

        headerTl.to(profileIcon, {
          scale: 1,
          duration: 1,
          ease: "power4.out",
        });

        headerTl.to(
          feastText.lines,
          {
            y: "0%",
            duration: 1,
            ease: "power4.out",
          },
          "-=0.9",
        );

        headerTl.to(
          titleText.lines,
          {
            y: "0%",
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
          },
          "-=0.9",
        );

        headerTl.to(
          arrowIcon,
          {
            scale: 1,
            duration: 0.75,
            ease: "power4.out",
          },
          "-=0.9",
        );
      }

      const initAnimations = () => {
        triggers.forEach((trigger) => trigger?.kill());
        triggers.length = 0;

        gsap.set(".work-item", {
          opacity: 0,
          scale: 0.75,
        });

        qa<HTMLElement>(".work-items .row").forEach((row) => {
          const workItems = Array.from(
            row.querySelectorAll<HTMLElement>(".work-item"),
          );

          workItems.forEach((item, itemIndex) => {
            const fromLeft = itemIndex % 2 === 0;
            gsap.set(item, {
              x: fromLeft ? -1000 : 1000,
              rotation: fromLeft ? -50 : 50,
              transformOrigin: "center center",
            });
          });

          const trigger = ScrollTrigger.create({
            trigger: row,
            start: "top 75%",
            onEnter: () => {
              gsap.timeline().to(workItems, {
                duration: 1,
                x: 0,
                rotation: 0,
                opacity: 1,
                scale: 1,
                ease: "power4.out",
              });
            },
          });
          triggers.push(trigger);
        });

        ScrollTrigger.refresh();
      };

      initAnimations();
      window.addEventListener("resize", initAnimations);
      cleanups.push(() => {
        window.removeEventListener("resize", initAnimations);
        triggers.forEach((trigger) => trigger?.kill());
        splits.forEach((split) => split?.revert());
      });
    }

    function setupProjectPage() {
      const splits: SplitText[] = [];
      const title = q<HTMLElement>(".project-hero-header-h1 h1");
      const projectTags = qa<HTMLElement>(".project-tags p");
      const heroDescription = q<HTMLElement>(".project-hero-description p");
      const heroSymbols = qa<HTMLElement>(".project-hero-header-h1 img");

      if (title && projectTags.length && heroDescription) {
        const heroTitle = SplitText.create(title, {
          type: "lines",
          mask: "lines",
        });
        const tagsSplit = SplitText.create(projectTags, {
          type: "lines",
          mask: "lines",
        });
        const descriptionSplit = SplitText.create(heroDescription, {
          type: "lines",
          mask: "lines",
        });
        splits.push(heroTitle, tagsSplit, descriptionSplit);

        gsap.set([heroTitle.lines, tagsSplit.lines, descriptionSplit.lines], {
          position: "relative",
          y: "120%",
          willChange: "transform",
        });

        gsap.set(heroSymbols, {
          scale: 0,
          willChange: "transform",
        });

        const heroTl = gsap.timeline({ delay: 0.85 });

        heroTl.to(heroTitle.lines, {
          y: "0%",
          duration: 1,
          ease: "power4.out",
        });

        heroTl.to(
          heroSymbols,
          {
            scale: 1,
            duration: 1,
            ease: "power4.out",
          },
          "-=1",
        );

        heroTl.to(
          tagsSplit.lines,
          {
            y: "0%",
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
          },
          "-=0.9",
        );

        heroTl.to(
          descriptionSplit.lines,
          {
            y: "0%",
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
          },
          "-=0.9",
        );
      }

      const trigger = ScrollTrigger.create({
        trigger: q<HTMLElement>(".project-page-whitespace"),
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const projectPreviewWrapper = q<HTMLElement>(
            ".project-preview-wrapper",
          );
          const previewCols = qa<HTMLElement>(
            ".preview-col:not(.main-preview-col)",
          );
          const mainPreviewImg = q<HTMLElement>(
            ".preview-img.main-preview-img img",
          );

          if (!projectPreviewWrapper || !mainPreviewImg) return;

          const previewMaxScale = window.innerWidth < 900 ? 4 : 2.65;
          const scale = 1 + self.progress * previewMaxScale;
          const yPreviewColTranslate = self.progress * 300;
          const mainPreviewImgScale = 2 - self.progress * 0.85;

          projectPreviewWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;

          previewCols.forEach((previewCol) => {
            previewCol.style.transform = `translateY(${yPreviewColTranslate}px)`;
          });

          mainPreviewImg.style.transform = `scale(${mainPreviewImgScale})`;
        },
      });

      cleanups.push(() => {
        trigger?.kill();
        splits.forEach((split) => split?.revert());
      });
    }

    function setupAboutPage() {
      let triggers: ScrollTrigger[] = [];

      const initAnimations = () => {
        triggers.forEach((trigger) => trigger?.kill());
        triggers = [];

        const statItems = qa<HTMLElement>(
          ".stats-item-1, .stats-item-2, .stats-item-3",
        );
        gsap.set(statItems, {
          scale: 0,
        });

        const statsAnimation = gsap.to(statItems, {
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: q<HTMLElement>(".stats"),
            start: "top 50%",
            toggleActions: "play none none none",
          },
        });
        triggers.push(statsAnimation.scrollTrigger);

        if (window.innerWidth > 1000) {
          const portraitAnimation = gsap.to(
            q<HTMLElement>(".about-hero-portrait"),
            {
              y: -200,
              rotation: -25,
              scrollTrigger: {
                trigger: q<HTMLElement>(".about-hero"),
                start: "top top",
                end: "bottom top",
                scrub: 1,
              },
            },
          );
          triggers.push(portraitAnimation.scrollTrigger);

          [
            ["#tag-1", -300, -45],
            ["#tag-2", -150, 70],
            ["#tag-3", -400, 120],
            ["#tag-4", -350, -60],
            ["#tag-5", -200, 100],
          ].forEach(([selector, y, rotation]) => {
            const animation = gsap.to(q<HTMLElement>(selector as string), {
              y,
              rotation,
              scrollTrigger: {
                trigger: q<HTMLElement>(".about-copy"),
                start: "top bottom",
                end: "bottom+=100% top",
                scrub: 1,
              },
            });
            triggers.push(animation.scrollTrigger);
          });
        }
      };

      initAnimations();
      window.addEventListener("resize", initAnimations);
      cleanups.push(() => {
        window.removeEventListener("resize", initAnimations);
        triggers.forEach((trigger) => trigger?.kill());
      });
    }

    function setupContactPage() {
      const container = q<HTMLElement>(".trail-container");
      if (!container) return;

      let isDesktop = window.innerWidth > 1000;
      let animationId: number | null = null;
      let mouseMoveListener: ((event: MouseEvent) => void) | null = null;
      const timeouts: number[] = [];

      const config = {
        imageCount: 10,
        imageLifespan: 750,
        removalDelay: 50,
        mouseThreshold: 100,
        inDuration: 750,
        outDuration: 1000,
        inEasing: "cubic-bezier(.07,.5,.5,1)",
        outEasing: "cubic-bezier(.87, 0, .13, 1)",
      };

      const images = Array.from({ length: config.imageCount }, (_, i) =>
        asset(`images/work-items/work-item-${i + 1}.jpg`),
      );
      const trail: Array<{
        element: HTMLImageElement;
        rotation: number;
        removeTime: number;
      }> = [];

      let mouseX = 0;
      let mouseY = 0;
      let lastMouseX = 0;
      let lastMouseY = 0;
      let isCursorInContainer = false;
      let lastRemovalTime = 0;

      const isInContainer = (x: number, y: number) => {
        const rect = container.getBoundingClientRect();
        return (
          x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
        );
      };

      const hasMovedEnough = () => {
        const distance = Math.sqrt(
          (mouseX - lastMouseX) ** 2 + (mouseY - lastMouseY) ** 2,
        );
        return distance > config.mouseThreshold;
      };

      const createImage = () => {
        const img = document.createElement("img");
        img.classList.add("trail-img");

        const randomIndex = Math.floor(Math.random() * images.length);
        const rotation = (Math.random() - 0.5) * 50;
        img.src = images[randomIndex];

        const rect = container.getBoundingClientRect();
        const relativeX = mouseX - rect.left;
        const relativeY = mouseY - rect.top;

        img.style.left = `${relativeX}px`;
        img.style.top = `${relativeY}px`;
        img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;
        img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;

        container.appendChild(img);

        timeouts.push(
          window.setTimeout(() => {
            img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
          }, 10),
        );

        trail.push({
          element: img,
          rotation,
          removeTime: Date.now() + config.imageLifespan,
        });
      };

      const removeOldImages = () => {
        const now = Date.now();

        if (now - lastRemovalTime < config.removalDelay || trail.length === 0)
          return;

        const oldestImage = trail[0];
        if (now >= oldestImage.removeTime) {
          const imgToRemove = trail.shift();
          if (!imgToRemove) return;

          imgToRemove.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
          imgToRemove.element.style.transform = `translate(-50%, -50%) rotate(${imgToRemove.rotation}deg) scale(0)`;

          lastRemovalTime = now;

          timeouts.push(
            window.setTimeout(() => {
              imgToRemove.element.parentNode?.removeChild(imgToRemove.element);
            }, config.outDuration),
          );
        }
      };

      const stopAnimation = () => {
        if (mouseMoveListener) {
          document.removeEventListener("mousemove", mouseMoveListener);
          mouseMoveListener = null;
        }

        if (animationId) {
          window.cancelAnimationFrame(animationId);
          animationId = null;
        }

        trail.forEach((item) =>
          item.element.parentNode?.removeChild(item.element),
        );
        trail.length = 0;
      };

      const startAnimation = () => {
        if (!isDesktop || mouseMoveListener) return;

        mouseMoveListener = (event) => {
          mouseX = event.clientX;
          mouseY = event.clientY;
          isCursorInContainer = isInContainer(mouseX, mouseY);

          if (isCursorInContainer && hasMovedEnough()) {
            lastMouseX = mouseX;
            lastMouseY = mouseY;
            createImage();
          }
        };

        document.addEventListener("mousemove", mouseMoveListener);

        const animate = () => {
          removeOldImages();
          animationId = window.requestAnimationFrame(animate);
        };
        animate();
      };

      const handleResize = () => {
        const wasDesktop = isDesktop;
        isDesktop = window.innerWidth > 1000;

        if (isDesktop && !wasDesktop) {
          startAnimation();
        } else if (!isDesktop && wasDesktop) {
          stopAnimation();
        }
      };

      window.addEventListener("resize", handleResize);
      if (isDesktop) startAnimation();

      cleanups.push(() => {
        window.removeEventListener("resize", handleResize);
        stopAnimation();
        timeouts.forEach((timeout) => window.clearTimeout(timeout));
      });
    }

    function setupFooterExplosion() {
      const footer = q<HTMLElement>("footer");
      const explosionContainer = q<HTMLElement>(".explosion-container");
      if (!footer || !explosionContainer) return;

      let hasExploded = false;
      let animationId: number | null = null;
      let checkTimeout: number | null = null;

      const config = {
        gravity: 0.25,
        friction: 0.99,
        imageSize: 150,
        horizontalForce: 20,
        verticalForce: 15,
        rotationSpeed: 10,
      };

      const imagePaths = Array.from({ length: 10 }, (_, i) =>
        asset(`images/work-items/work-item-${i + 1}.jpg`),
      );

      imagePaths.forEach((path) => {
        const img = new Image();
        img.src = path;
      });

      const createParticles = () => {
        explosionContainer.innerHTML = "";

        imagePaths.forEach((path) => {
          const particle = document.createElement("img");
          particle.src = path;
          particle.classList.add("explosion-particle-img");
          particle.style.width = `${config.imageSize}px`;
          explosionContainer.appendChild(particle);
        });
      };

      class Particle {
        element: HTMLElement;
        x = 0;
        y = 0;
        vx = (Math.random() - 0.5) * config.horizontalForce;
        vy = -config.verticalForce - Math.random() * 10;
        rotation = 0;
        rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed;

        constructor(element: HTMLElement) {
          this.element = element;
        }

        update() {
          this.vy += config.gravity;
          this.vx *= config.friction;
          this.vy *= config.friction;
          this.rotationSpeed *= config.friction;

          this.x += this.vx;
          this.y += this.vy;
          this.rotation += this.rotationSpeed;

          this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
        }
      }

      const explode = () => {
        if (hasExploded) return;
        hasExploded = true;

        createParticles();

        const particleElements = qa<HTMLElement>(".explosion-particle-img");
        const particles = particleElements.map(
          (element) => new Particle(element),
        );

        const animate = () => {
          particles.forEach((particle) => particle.update());
          animationId = window.requestAnimationFrame(animate);

          if (
            particles.every(
              (particle) => particle.y > explosionContainer.offsetHeight / 2,
            )
          ) {
            if (animationId) window.cancelAnimationFrame(animationId);
            animationId = null;
          }
        };

        animate();
      };

      const checkFooterPosition = () => {
        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (footerRect.top > viewportHeight + 100) {
          hasExploded = false;
        }

        if (!hasExploded && footerRect.top <= viewportHeight + 250) {
          explode();
        }
      };

      const onScroll = () => {
        if (checkTimeout) window.clearTimeout(checkTimeout);
        checkTimeout = window.setTimeout(checkFooterPosition, 5);
      };

      const onResize = () => {
        hasExploded = false;
      };

      scrollerTarget.addEventListener("scroll", onScroll);
      window.addEventListener("resize", onResize);

      createParticles();
      checkTimeout = window.setTimeout(checkFooterPosition, 500);

      cleanups.push(() => {
        scrollerTarget.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        if (checkTimeout) window.clearTimeout(checkTimeout);
        if (animationId) window.cancelAnimationFrame(animationId);
      });
    }
  }, [assetBase, lenis, navigate, pathname, root, rootElement, scroller]);
}

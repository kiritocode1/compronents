"use client";

/**
 * Interior Studio Page - source-backed Terrene interior studio template.
 *
 * A faithful React port of the Next.js Terrene site: the full routed
 * experience (home, studio, spaces, sample space, blueprints, connect) with
 * its counter preloader, circular clip-path menu, hide-on-scroll top bar,
 * SplitText copy reveals, pinned featured-projects deck, expanding client
 * reviews, arc-path spotlight sequence, pinned process steps, draggable
 * infinite blueprint gallery, Lenis smooth scroll, and a circular clip-path
 * page transition replacing the source's next-view-transitions choreography.
 * Imagery is served from the Compronents asset host.
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import type * as React from "react";
import {
  Children,
  type CSSProperties,
  cloneElement,
  createContext,
  isValidElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IoMdArrowForward } from "react-icons/io";
import {
  RiDribbbleLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiYoutubeLine,
} from "react-icons/ri";
import { getInteriorStudioPageStyles } from "./styles";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);
CustomEase.create("ispHop", "0.9, 0, 0.1, 1");
CustomEase.create("ispSlide", "0.87, 0, 0.13, 1");

const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/interior-studio-page";
const TRANSITION_DURATION = 2;

const ASSET_CONTEXT = createContext(DEFAULT_ASSET_BASE);

function useAsset() {
  const base = useContext(ASSET_CONTEXT);
  return useCallback(
    (path: string) => `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    [base],
  );
}

/* ---------------------------------------------------------------- runtime */

interface RuntimeValue {
  root: HTMLElement;
  scroller: HTMLElement | Window;
  lenis: Lenis;
}

const RuntimeContext = createContext<RuntimeValue | null>(null);

function useRuntime() {
  const value = useContext(RuntimeContext);
  if (!value) throw new Error("useRuntime must be used inside the template");
  return value;
}

/* ------------------------------------------------------------------ router */

export const INTERIOR_STUDIO_PAGE_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/studio", label: "Studio" },
  { path: "/spaces", label: "Our Spaces" },
  { path: "/sample-space", label: "One Installation" },
  { path: "/blueprints", label: "Blueprints" },
  { path: "/connect", label: "Connect" },
] as const;

interface RouterValue {
  pathname: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterValue>({
  pathname: "/",
  navigate: () => {},
});

function useRouter() {
  return useContext(RouterContext);
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
}

/* -------------------------------------------------------------------- copy */

async function waitForFonts() {
  try {
    await document.fonts.ready;
    document.fonts.check("16px Manrope");
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

function Copy({
  children,
  animateOnScroll = true,
  delay = 0,
}: {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const splitRefs = useRef<SplitText[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let isActive = true;

      const initializeSplitText = async () => {
        await waitForFonts();
        if (!isActive || !containerRef.current) return;

        splitRefs.current = [];
        const lines: HTMLElement[] = [];

        const elements = containerRef.current.hasAttribute("data-copy-wrapper")
          ? (Array.from(containerRef.current.children) as HTMLElement[])
          : [containerRef.current];

        elements.forEach((element) => {
          const split = SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: "line++",
            lineThreshold: 0.1,
          });
          splitRefs.current.push(split);

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;
          if (textIndent && textIndent !== "0px") {
            if (split.lines.length > 0) {
              (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
            }
            element.style.textIndent = "0";
          }

          lines.push(...(split.lines as HTMLElement[]));
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
              start: "top 90%",
              once: true,
            },
          });
        } else {
          gsap.to(lines, animationProps);
        }
      };

      initializeSplitText();

      return () => {
        isActive = false;
        splitRefs.current.forEach((split) => {
          split?.revert();
        });
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay] },
  );

  if (Children.count(children) === 1 && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ ref?: unknown }>, {
      ref: containerRef,
    });
  }

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      data-copy-wrapper="true"
    >
      {children}
    </div>
  );
}

/* --------------------------------------------------------- animated button */

function AnimatedButton({
  label,
  route,
  animate = true,
  animateOnScroll = true,
  delay = 0,
}: {
  label: string;
  route?: string;
  animate?: boolean;
  animateOnScroll?: boolean;
  delay?: number;
}) {
  const router = useRouter();
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const splitRef = useRef<SplitText | null>(null);

  useGSAP(
    () => {
      if (!buttonRef.current || !textRef.current) return;

      if (!animate) {
        gsap.set(buttonRef.current, { scale: 1 });
        gsap.set(circleRef.current, { scale: 1, opacity: 1 });
        gsap.set(iconRef.current, { opacity: 1, x: 0 });
        return;
      }

      let isActive = true;

      const initializeAnimation = async () => {
        await waitForFonts();
        if (!isActive || !buttonRef.current || !textRef.current) return;

        const split = SplitText.create(textRef.current, {
          type: "lines",
          mask: "lines",
          linesClass: "line++",
          lineThreshold: 0.1,
        });
        splitRef.current = split;

        gsap.set(buttonRef.current, { scale: 0, transformOrigin: "center" });
        gsap.set(circleRef.current, {
          scale: 0,
          transformOrigin: "center",
          opacity: 0,
        });
        gsap.set(iconRef.current, { opacity: 0, x: -20 });
        gsap.set(split.lines, { y: "100%", opacity: 0 });

        const tl = gsap.timeline({ delay });

        tl.to(buttonRef.current, {
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        });

        tl.to(
          circleRef.current,
          { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" },
          "+0.25",
        );

        tl.to(
          iconRef.current,
          { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" },
          "-0.25",
        );

        tl.to(
          split.lines,
          {
            y: "0%",
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power4.out",
          },
          "-=0.2",
        );

        if (animateOnScroll) {
          ScrollTrigger.create({
            trigger: buttonRef.current,
            start: "top 90%",
            once: true,
            animation: tl,
          });
        }
      };

      initializeAnimation();

      return () => {
        isActive = false;
        splitRef.current?.revert();
      };
    },
    { scope: buttonRef, dependencies: [animate, animateOnScroll, delay] },
  );

  const buttonContent = (
    <>
      <span className="circle" ref={circleRef} aria-hidden="true"></span>
      <div className="icon" ref={iconRef}>
        <IoMdArrowForward />
      </div>
      <span className="button-text" ref={textRef}>
        {label}
      </span>
    </>
  );

  if (route) {
    return (
      <a
        href={route}
        className="btn"
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        onClick={(e) => {
          e.preventDefault();
          router.navigate(route);
        }}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="btn"
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
    >
      {buttonContent}
    </button>
  );
}

/* ---------------------------------------------------------------- menu btn */

function MenuBtn({
  isOpen,
  toggleMenu,
}: {
  isOpen: boolean;
  toggleMenu: () => void;
}) {
  return (
    <div
      className={`menu-toggle ${isOpen ? "opened" : "closed"}`}
      onClick={toggleMenu}
    >
      <div className="menu-toggle-icon">
        <div className="hamburger">
          <div className="menu-bar" data-position="top"></div>
          <div className="menu-bar" data-position="bottom"></div>
        </div>
      </div>
      <div className="menu-copy">
        <p>Menu</p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- nav */

function Nav() {
  const router = useRouter();
  const { root, lenis } = useRuntime();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isInitializedRef = useRef(false);
  const splitTextRefs = useRef<SplitText[]>([]);

  useEffect(() => {
    if (isOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [lenis, isOpen]);

  useLayoutEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;

      splitTextRefs.current.forEach((split) => {
        split?.revert();
      });
      splitTextRefs.current = [];

      gsap.set(menu, { clipPath: "circle(0% at 50% 50%)" });

      const textElements = menu.querySelectorAll("h2, p");
      textElements.forEach((element) => {
        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
        });
        gsap.set(split.lines, { y: "120%" });
        (split.lines as HTMLElement[]).forEach((line) => {
          line.style.pointerEvents = "auto";
        });
        splitTextRefs.current.push(split);
      });

      isInitializedRef.current = true;
    }

    return () => {
      splitTextRefs.current.forEach((split) => {
        split?.revert();
      });
      splitTextRefs.current = [];
      root.classList.remove("menu-open");
    };
  }, [root]);

  const animateMenu = useCallback(
    (open: boolean) => {
      if (!menuRef.current) return;
      const menu = menuRef.current;

      setIsAnimating(true);

      if (open) {
        root.classList.add("menu-open");

        gsap.to(menu, {
          clipPath: "circle(100% at 50% 50%)",
          ease: "power3.out",
          duration: 2,
          onStart: () => {
            menu.style.pointerEvents = "all";
            splitTextRefs.current.forEach((split, index) => {
              gsap.to(split.lines, {
                y: "0%",
                stagger: 0.05,
                delay: 0.35 + index * 0.1,
                duration: 1,
                ease: "power4.out",
              });
            });
          },
          onComplete: () => {
            setIsAnimating(false);
          },
        });
      } else {
        const textTimeline = gsap.timeline({
          onStart: () => {
            gsap.to(menu, {
              clipPath: "circle(0% at 50% 50%)",
              ease: "power3.out",
              duration: 1,
              delay: 0.75,
              onComplete: () => {
                menu.style.pointerEvents = "none";
                splitTextRefs.current.forEach((split) => {
                  gsap.set(split.lines, { y: "120%" });
                });
                root.classList.remove("menu-open");
                setIsAnimating(false);
                setIsNavigating(false);
              },
            });
          },
        });

        splitTextRefs.current.forEach((split, index) => {
          textTimeline.to(
            split.lines,
            {
              y: "-120%",
              stagger: 0.03,
              delay: index * 0.05,
              duration: 1,
              ease: "power3.out",
            },
            0,
          );
        });
      }
    },
    [root],
  );

  useEffect(() => {
    if (isInitializedRef.current) {
      animateMenu(isOpen);
    }
  }, [isOpen, animateMenu]);

  const toggleMenu = useCallback(() => {
    if (!isAnimating && isInitializedRef.current && !isNavigating) {
      setIsOpen((prevIsOpen) => !prevIsOpen);
    }
  }, [isAnimating, isNavigating]);

  const handleLinkClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      e.preventDefault();

      if (router.pathname === href) {
        if (isOpen) setIsOpen(false);
        return;
      }

      if (isNavigating) return;

      setIsNavigating(true);
      router.navigate(href);
    },
    [isNavigating, router, isOpen],
  );

  return (
    <div>
      <MenuBtn isOpen={isOpen} toggleMenu={toggleMenu} />
      <div className="menu" ref={menuRef}>
        <div className="menu-wrapper">
          <div className="col col-1">
            <div className="links">
              {INTERIOR_STUDIO_PAGE_ROUTES.map((route) => (
                <div className="link" key={route.path}>
                  <a
                    href={route.path}
                    onClick={(e) => handleLinkClick(e, route.path)}
                  >
                    <h2>{route.label}</h2>
                  </a>
                </div>
              ))}
            </div>
          </div>
          <div className="col col-2">
            <div className="socials">
              <div className="sub-col">
                <div className="menu-meta menu-commissions">
                  <p>Commissions</p>
                  <p>build@terrene.studio</p>
                  <p>+1 (872) 441&#8209;2086</p>
                </div>
                <div className="menu-meta">
                  <p>Studio Address</p>
                  <p>18 Cordova Lane</p>
                  <p>Seattle, WA 98101</p>
                </div>
              </div>
              <div className="sub-col">
                <div className="menu-meta">
                  <p>Social</p>
                  <p>Instagram</p>
                  <p>Are.na</p>
                  <p>LinkedIn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- top bar */

function TopBar() {
  const asset = useAsset();
  const router = useRouter();
  const { scroller } = useRuntime();
  const topBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const topBar = topBarRef.current;
    if (!topBar) return;

    const topBarHeight = topBar.offsetHeight;
    let lastScrollY = 0;
    let isScrolling = false;

    gsap.set(topBar, { y: 0 });

    const getScrollY = () =>
      scroller instanceof HTMLElement ? scroller.scrollTop : window.scrollY;

    const handleScroll = () => {
      if (isScrolling) return;

      isScrolling = true;
      const currentScrollY = getScrollY();
      const direction = currentScrollY > lastScrollY ? 1 : -1;

      if (direction === 1 && currentScrollY > 50) {
        gsap.to(topBar, { y: -topBarHeight, duration: 1, ease: "power4.out" });
      } else if (direction === -1) {
        gsap.to(topBar, { y: 0, duration: 1, ease: "power4.out" });
      }

      lastScrollY = currentScrollY;

      setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    const target = scroller instanceof HTMLElement ? scroller : window;
    target.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", handleScroll);
    };
  }, [scroller]);

  return (
    <div className="top-bar" ref={topBarRef}>
      <div className="top-bar-logo">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            router.navigate("/");
          }}
        >
          <img src={asset("logos/terrene-logo-symbol.png")} alt="" />
        </a>
      </div>
      <div className="top-bar-cta">
        <AnimatedButton label="Reserve" route="/connect" animate={false} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------- featured projects */

const FEATURED_PROJECTS = [
  {
    info: "An immersive lounge built around a central tree",
    title: "Sanctum Hall",
    description:
      "Circular seating, arched openings, and natural textures create a serene gathering space. The design balances monumentality with intimacy, framing nature as the focal point.",
    image: "featured-projects/featured-work-1.jpg",
  },
  {
    info: "A private retreat defined by water and sun",
    title: "Desert Poolhouse",
    description:
      "Soft stucco walls, a lone palm, and an open sky bring elemental simplicity. The still surface of the pool becomes both mirror and threshold, blurring enclosure and openness.",
    image: "featured-projects/featured-work-2.jpg",
  },
  {
    info: "A cloister-inspired courtyard with generous arches",
    title: "Arcade Residence",
    description:
      "Rhythmic colonnades and layered seating zones encourage calm gatherings. Textured stone and filtered light evoke both permanence and ease, rooted in classical geometry.",
    image: "featured-projects/featured-work-3.jpg",
  },
  {
    info: "A refined interior anchored by symmetry and light",
    title: "Atrium Gallery",
    description:
      "A quiet procession of columns and a sculptural centerpiece guide the eye toward framed views. Warm plaster walls and soft daylight create a setting of contemplative elegance.",
    image: "featured-projects/featured-work-4.jpg",
  },
];

function FeaturedProjects() {
  const asset = useAsset();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const featuredProjectCards = Array.from(
      containerRef.current.querySelectorAll(".featured-project-card"),
    );
    const triggers: ScrollTrigger[] = [];

    featuredProjectCards.forEach((featuredProjectCard, index) => {
      if (index < featuredProjectCards.length - 1) {
        const featuredProjectCardInner = featuredProjectCard.querySelector(
          ".featured-project-card-inner",
        );
        if (!featuredProjectCardInner) return;

        const isMobile = window.innerWidth <= 1000;

        const moveTween = gsap.fromTo(
          featuredProjectCardInner,
          { y: "0%", z: 0, rotationX: 0 },
          {
            y: "-50%",
            z: -250,
            rotationX: 45,
            scrollTrigger: {
              trigger: featuredProjectCards[index + 1],
              start: isMobile ? "top 85%" : "top 100%",
              end: "top -75%",
              scrub: true,
              pin: featuredProjectCard,
              pinSpacing: false,
            },
          },
        );
        if (moveTween.scrollTrigger) triggers.push(moveTween.scrollTrigger);

        const fadeTween = gsap.to(featuredProjectCardInner, {
          "--after-opacity": 1,
          scrollTrigger: {
            trigger: featuredProjectCards[index + 1],
            start: "top 75%",
            end: "top 0%",
            scrub: true,
          },
        });
        if (fadeTween.scrollTrigger) triggers.push(fadeTween.scrollTrigger);
      }
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="featured-projects" ref={containerRef}>
      {FEATURED_PROJECTS.map((project, index) => (
        <div key={index} className="featured-project-card">
          <div className="featured-project-card-inner">
            <div className="featured-project-card-content">
              <div className="featured-project-card-info">
                <p>{project.info}</p>
              </div>
              <div className="featured-project-card-content-main">
                <div className="featured-project-card-title">
                  <h2>{project.title}</h2>
                </div>
                <div className="featured-project-card-description">
                  <p className="lg">{project.description}</p>
                </div>
              </div>
            </div>
            <div className="featured-project-card-img">
              <img src={asset(project.image)} alt={project.title} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ client reviews */

const CLIENT_REVIEWS = [
  {
    id: 1,
    name: "Evelyn Hart",
    title: "Villa Owner",
    image: "client-reviews/client-review-1.jpg",
    avatar: "clients/client-1.jpg",
    review:
      "The design feels deeply personal, as if it grew from the way we live. The flow of each room, the light at different hours, everything was thought through with remarkable care and clarity.",
  },
  {
    id: 2,
    name: "Jonas Mercer",
    title: "Retreat Host",
    image: "client-reviews/client-review-2.jpg",
    avatar: "clients/client-2.jpg",
    review:
      "We expected something beautiful, but what we received was a place that completely reshaped our sense of comfort. It feels open, serene, and in perfect conversation.",
  },
  {
    id: 3,
    name: "Clara Voss",
    title: "Townhouse Resident",
    image: "client-reviews/client-review-3.jpg",
    avatar: "clients/client-3.jpg",
    review:
      "Every material, every proportion, every finish feels intentional. The spaces carry a timeless quality that makes the home feel complete from the moment we stepped inside.",
  },
  {
    id: 4,
    name: "Samuel Wright",
    title: "Apartment Owner",
    image: "client-reviews/client-review-4.jpg",
    avatar: "clients/client-4.jpg",
    review:
      "From first conversation to final delivery, the process was thoughtful and exact. Each stage revealed a design that was both surprising and completely aligned with how we wanted to live.",
  },
  {
    id: 5,
    name: "Isla Bennett",
    title: "Estate Owner",
    image: "client-reviews/client-review-5.jpg",
    avatar: "clients/client-5.jpg",
    review:
      "What we have now feels more than just a home. It carries a quiet elegance that has transformed our daily life. Every detail has purpose, and the whole space feels seamless and resolved.",
  },
];

function ClientReviews() {
  const asset = useAsset();
  const [activeClient, setActiveClient] = useState(0);
  const [visualClient, setVisualClient] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const clientRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reviewTextRef = useRef<HTMLHeadingElement | null>(null);
  const splitTextRef = useRef<SplitText | null>(null);
  const clientInfoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const masterTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const getExpandedWidth = () => {
    if (!containerRef.current) return "10rem";

    const containerWidth = containerRef.current.offsetWidth;
    const padding = 16;
    const gap = 4;
    const inactiveItemWidth = 48;
    const inactiveItems = CLIENT_REVIEWS.length - 1;

    const remainingSpace =
      containerWidth -
      padding -
      inactiveItemWidth * inactiveItems -
      gap * inactiveItems;

    return `${remainingSpace}px`;
  };

  const animateImageChange = (newImageSrc: string) => {
    if (!imageContainerRef.current) return gsap.to({}, { duration: 0 });

    const newImg = document.createElement("img");
    newImg.src = newImageSrc;
    newImg.alt = "";
    newImg.style.opacity = "0";

    imageContainerRef.current.appendChild(newImg);

    return gsap.to(newImg, {
      opacity: 1,
      duration: 1,
      delay: 0.5,
      ease: "power2.out",
      onComplete: () => {
        const container = imageContainerRef.current;
        if (!container) return;
        container.querySelectorAll("img").forEach((img) => {
          if (img !== newImg) img.remove();
        });
      },
    });
  };

  useEffect(() => {
    gsap.set(clientRefs.current, { width: "3rem" });
    gsap.set(clientInfoRefs.current, { opacity: 0 });

    if (clientRefs.current[0]) {
      gsap.to(clientRefs.current[0], {
        width: getExpandedWidth(),
        duration: 0.75,
        ease: "power4.inOut",
      });
    }

    if (clientInfoRefs.current[0]) {
      gsap.to(clientInfoRefs.current[0], {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    const initTimer = setTimeout(() => {
      if (reviewTextRef.current) {
        splitTextRef.current = SplitText.create(reviewTextRef.current, {
          type: "lines",
          mask: "lines",
        });

        if (splitTextRef.current?.lines) {
          gsap.set(splitTextRef.current.lines, { y: "110%" });
          gsap.to(splitTextRef.current.lines, {
            y: "0%",
            duration: 0.5,
            stagger: 0.05,
            ease: "power4.out",
          });
        }
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (splitTextRef.current) {
        splitTextRef.current.revert();
        splitTextRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!splitTextRef.current) return;

    if (reviewTextRef.current) {
      splitTextRef.current.revert();

      splitTextRef.current = SplitText.create(reviewTextRef.current, {
        type: "lines",
        mask: "lines",
      });

      if (splitTextRef.current.lines) {
        gsap.set(splitTextRef.current.lines, { y: "110%" });
        gsap.to(splitTextRef.current.lines, {
          y: "0%",
          duration: 0.5,
          stagger: 0.05,
          ease: "power4.out",
        });
      }
    }
  }, [activeClient]);

  const handleClientClick = (index: number) => {
    if (index === activeClient || isAnimating) return;

    if (masterTimelineRef.current) {
      masterTimelineRef.current.kill();
    }

    setIsAnimating(true);

    const expandedWidth = getExpandedWidth();

    masterTimelineRef.current = gsap.timeline();
    const tl = masterTimelineRef.current;

    if (clientInfoRefs.current[visualClient]) {
      tl.to(
        clientInfoRefs.current[visualClient],
        { opacity: 0, duration: 0.5, ease: "power2.out" },
        0,
      );
    }

    tl.to(
      clientRefs.current[activeClient],
      { width: "3rem", duration: 0.75, ease: "power4.inOut" },
      0,
    ).to(
      clientRefs.current[index],
      { width: expandedWidth, duration: 0.75, ease: "power4.inOut" },
      0,
    );

    tl.call(
      () => {
        setVisualClient(index);
      },
      [],
      0.2,
    );

    tl.to(
      {},
      {
        duration: 0.1,
        onComplete: () => {
          if (clientInfoRefs.current[index]) {
            const clientInfoAnim = gsap.to(clientInfoRefs.current[index], {
              opacity: 0,
              duration: 0,
              ease: "power2.out",
              onComplete: () => {
                gsap.to(clientInfoRefs.current[index], {
                  opacity: 1,
                  duration: 0.5,
                  ease: "power2.out",
                });
              },
            });
            tl.add(clientInfoAnim, 0.5);
          }
        },
      },
      0.5,
    );

    const imageAnimation = animateImageChange(
      asset(CLIENT_REVIEWS[index].image),
    );
    tl.add(imageAnimation, 0);

    if (splitTextRef.current?.lines) {
      const textOutAnim = gsap.to(splitTextRef.current.lines, {
        y: "-110%",
        duration: 0.5,
        stagger: 0.05,
        ease: "power4.in",
        onComplete: () => {
          setActiveClient(index);
        },
      });
      tl.add(textOutAnim, 0);
    } else {
      setActiveClient(index);
    }

    tl.call(() => {
      setTimeout(() => {
        setIsAnimating(false);
        masterTimelineRef.current = null;
      }, 250);
    });
  };

  return (
    <div className="client-reviews">
      <div className="container">
        <div className="client-reviews-wrapper">
          <div className="client-review-content">
            <div className="client-review-img" ref={imageContainerRef}>
              <img src={asset(CLIENT_REVIEWS[activeClient].image)} alt="" />
            </div>
            <div className="client-review-copy">
              <h3 ref={reviewTextRef} key={activeClient}>
                {CLIENT_REVIEWS[activeClient].review}
              </h3>
            </div>
          </div>
          <div className="clients-list" ref={containerRef}>
            {CLIENT_REVIEWS.map((client, index) => (
              <div
                key={client.id}
                ref={(el) => {
                  clientRefs.current[index] = el;
                }}
                className={`client-item ${index === visualClient ? "active" : ""} ${isAnimating ? "animating" : ""}`}
                onClick={() => handleClientClick(index)}
              >
                <div className="client-avatar">
                  <img src={asset(client.avatar)} alt={client.name} />
                </div>
                {index === visualClient && (
                  <div
                    className="client-info"
                    ref={(el) => {
                      clientInfoRefs.current[index] = el;
                    }}
                    style={{ opacity: 0 }}
                  >
                    <p className="client-name md">{client.name}</p>
                    <p className="client-title">{client.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- cta window */

function CTAWindow({
  img,
  header,
  callout,
  description,
}: {
  img: string;
  header: string;
  callout: string;
  description: string;
}) {
  const asset = useAsset();
  return (
    <section className="cta-window">
      <div className="container">
        <div className="cta-window-img-wrapper">
          <img src={asset(img)} alt="" />
        </div>
        <div className="cta-window-img-overlay"></div>
        <div className="cta-window-header">
          <Copy delay={0.1}>
            <h1>{header}</h1>
          </Copy>
        </div>
        <div className="cta-window-footer">
          <div className="cta-window-callout">
            <Copy delay={0.1}>
              <h3>{callout}</h3>
            </Copy>
          </div>
          <div className="cta-window-description">
            <Copy delay={0.1}>
              <p>{description}</p>
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ footer */

function Footer() {
  const asset = useAsset();
  const router = useRouter();
  const socialIconsRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!socialIconsRef.current) return;

      const icons = socialIconsRef.current.querySelectorAll(".icon");
      gsap.set(icons, { opacity: 0, x: -40 });

      ScrollTrigger.create({
        trigger: socialIconsRef.current,
        start: "top 90%",
        once: true,
        animation: gsap.to(icons, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: -0.1,
          ease: "power3.out",
        }),
      });
    },
    { scope: socialIconsRef },
  );

  return (
    <div className="footer">
      <div className="footer-meta">
        <div className="container footer-meta-header">
          <div className="footer-meta-col">
            <div className="footer-meta-block">
              <div className="footer-meta-logo">
                <Copy delay={0.1}>
                  <h3 className="lg">Terrene</h3>
                </Copy>
              </div>
              <Copy delay={0.2}>
                <h2>Spaces made simple, thoughtful, lasting.</h2>
              </Copy>
            </div>
          </div>
          <div className="footer-meta-col">
            <div className="footer-nav-links">
              <Copy delay={0.1}>
                {INTERIOR_STUDIO_PAGE_ROUTES.map((route) => (
                  <a
                    key={route.path}
                    href={route.path}
                    onClick={(e) => {
                      e.preventDefault();
                      router.navigate(route.path);
                    }}
                  >
                    <h3>{route.label}</h3>
                  </a>
                ))}
              </Copy>
            </div>
          </div>
        </div>
        <div className="container footer-socials">
          <div className="footer-meta-col">
            <div className="footer-socials-wrapper" ref={socialIconsRef}>
              <div className="icon">
                <RiLinkedinBoxLine />
              </div>
              <div className="icon">
                <RiInstagramLine />
              </div>
              <div className="icon">
                <RiDribbbleLine />
              </div>
              <div className="icon">
                <RiYoutubeLine />
              </div>
            </div>
          </div>
          <div className="footer-meta-col">
            <Copy delay={0.1}>
              <p>
                We believe design is not decoration but the quiet structure that
                shapes experience.
              </p>
            </Copy>
          </div>
        </div>
      </div>
      <div className="footer-outro">
        <div className="container">
          <div className="footer-header">
            <img src={asset("logos/terrene-footer-logo.svg")} alt="" />
          </div>
          <div className="footer-copyright">
            <p>
              Developed by <span>BLANK</span>
            </p>
            <p>This website is using cookies.</p>
            <p>All rights reserved &copy; 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionalFooter() {
  const { pathname } = useRouter();
  return pathname === "/blueprints" ? null : <Footer />;
}

/* ----------------------------------------------------------------- gallery */

const GALLERY_ITEMS = [
  "Stillwater Entry",
  "Desert Light",
  "Terracotta Echo",
  "Threshold in Clay",
  "Stone Mirage",
  "Sol Courtyard",
  "Bath of Silence",
  "Arches in Bloom",
  "The Listening Wall",
  "Shadow Pool",
  "Warmed by Earth",
  "Portal of Quiet",
  "The Reflecting Niche",
  "Sheltered Rhythm",
  "Golden Passage",
  "Air Between Walls",
  "Sun Geometry",
  "Rooted Space",
  "Horizon Vault",
  "Sand & Silence",
];

interface GalleryState {
  isDragging: boolean;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  dragVelocityX: number;
  dragVelocityY: number;
  lastDragTime: number;
  mouseHasMoved: boolean;
  visibleItems: Set<string>;
  lastUpdateTime: number;
  lastX: number;
  lastY: number;
  isExpanded: boolean;
  activeItem: HTMLElement | null;
  canDrag: boolean;
  originalPosition: { id: string; rect: DOMRect; imgSrc: string } | null;
  expandedItem: HTMLElement | null;
  activeItemId: string | null;
  titleSplit: SplitText | null;
  animationFrameId: number | null;
  introAnimationPlayed: boolean;
}

function Gallery() {
  const asset = useAsset();
  const { root } = useRuntime();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const projectTitleRef = useRef<HTMLDivElement | null>(null);

  const itemCount = 20;
  const itemGap = 150;
  const columns = 4;
  const itemWidth = 120;
  const itemHeight = 160;
  const masonryOffset = 125;

  const stateRef = useRef<GalleryState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    dragVelocityX: 0,
    dragVelocityY: 0,
    lastDragTime: 0,
    mouseHasMoved: false,
    visibleItems: new Set(),
    lastUpdateTime: 0,
    lastX: 0,
    lastY: 0,
    isExpanded: false,
    activeItem: null,
    canDrag: true,
    originalPosition: null,
    expandedItem: null,
    activeItemId: null,
    titleSplit: null,
    animationFrameId: null,
    introAnimationPlayed: false,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!container || !canvas || !overlay) return;

    const state = stateRef.current;

    const setAndAnimateTitle = (title: string) => {
      const projectTitleElement = projectTitleRef.current?.querySelector("p");
      if (!projectTitleElement) return;

      if (state.titleSplit) state.titleSplit.revert();
      projectTitleElement.textContent = title;

      state.titleSplit = SplitText.create(projectTitleElement, {
        type: "words",
      });
      gsap.set(state.titleSplit.words, { y: "100%" });
    };

    const animateTitleIn = () => {
      if (!state.titleSplit) return;
      gsap.to(state.titleSplit.words, {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });
    };

    const animateTitleOut = () => {
      if (!state.titleSplit) return;
      gsap.to(state.titleSplit.words, {
        y: "-100%",
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
      });
    };

    const playIntroAnimation = () => {
      if (state.introAnimationPlayed) return;

      const allItems = canvas.querySelectorAll(".item");
      if (allItems.length === 0) return;

      state.introAnimationPlayed = true;

      gsap.to(allItems, {
        scale: 1,
        delay: 1,
        duration: 0.5,
        stagger: { amount: 1, from: "random" },
        ease: "power1.out",
      });
    };

    const closeExpandedItem = () => {
      if (!state.expandedItem || !state.originalPosition) return;

      animateTitleOut();
      overlay.classList.remove("active");
      const originalRect = state.originalPosition.rect;

      canvas.querySelectorAll(".item").forEach((el) => {
        if (el.id !== state.activeItemId) {
          gsap.to(el, {
            opacity: 1,
            duration: 0.5,
            delay: 0.5,
            ease: "power2.out",
          });
        }
      });

      const originalItem = state.activeItemId
        ? canvas.querySelector<HTMLElement>(`[id="${state.activeItemId}"]`)
        : null;

      gsap.to(state.expandedItem, {
        width: itemWidth,
        height: itemHeight,
        x: originalRect.left + itemWidth / 2 - window.innerWidth / 2,
        y: originalRect.top + itemHeight / 2 - window.innerHeight / 2,
        duration: 1,
        ease: "ispHop",
        onComplete: () => {
          if (state.expandedItem?.parentNode) {
            state.expandedItem.parentNode.removeChild(state.expandedItem);
          }

          if (originalItem) {
            originalItem.style.visibility = "visible";
          }

          state.expandedItem = null;
          state.isExpanded = false;
          state.activeItem = null;
          state.originalPosition = null;
          state.activeItemId = null;
          state.canDrag = true;
          container.style.cursor = "grab";
          state.dragVelocityX = 0;
          state.dragVelocityY = 0;
        },
      });
    };

    const expandItem = (item: HTMLElement) => {
      state.isExpanded = true;
      state.activeItem = item;
      state.activeItemId = item.id;
      state.canDrag = false;
      container.style.cursor = "auto";

      const itemImg = item.querySelector("img");
      if (!itemImg) return;

      const imgSrc = itemImg.src;
      const imgMatch = imgSrc.match(/archive-(\d+)\.jpg/);
      const imgNum = imgMatch ? Number.parseInt(imgMatch[1], 10) : 1;
      const titleIndex = (imgNum - 1) % GALLERY_ITEMS.length;

      setAndAnimateTitle(GALLERY_ITEMS[titleIndex]);
      item.style.visibility = "hidden";

      const rect = item.getBoundingClientRect();

      state.originalPosition = { id: item.id, rect, imgSrc };

      overlay.classList.add("active");

      const expandedItem = document.createElement("div");
      expandedItem.className = "expanded-item";
      expandedItem.style.width = `${itemWidth}px`;
      expandedItem.style.height = `${itemHeight}px`;

      const img = document.createElement("img");
      img.src = imgSrc;
      expandedItem.appendChild(img);
      expandedItem.addEventListener("click", closeExpandedItem);
      root.appendChild(expandedItem);

      state.expandedItem = expandedItem;

      canvas.querySelectorAll(".item").forEach((el) => {
        if (el !== state.activeItem) {
          gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.out" });
        }
      });

      const viewportWidth = window.innerWidth;
      const isMobile = window.innerWidth <= 1000;
      const targetWidth = viewportWidth * (isMobile ? 0.75 : 0.4);
      const targetHeight = targetWidth * 1.2;

      gsap.delayedCall(0.5, animateTitleIn);

      gsap.fromTo(
        expandedItem,
        {
          width: itemWidth,
          height: itemHeight,
          x: rect.left + itemWidth / 2 - window.innerWidth / 2,
          y: rect.top + itemHeight / 2 - window.innerHeight / 2,
        },
        {
          width: targetWidth,
          height: targetHeight,
          x: 0,
          y: 0,
          duration: 1,
          ease: "ispHop",
        },
      );
    };

    const handleItemClick = (item: HTMLElement) => {
      if (state.isExpanded) {
        if (state.expandedItem) closeExpandedItem();
      } else {
        expandItem(item);
      }
    };

    const updateVisibleItems = () => {
      const isMobile = window.innerWidth <= 1000;
      const buffer = isMobile ? 0.8 : 1.5;
      const viewWidth = window.innerWidth * (1 + buffer);
      const viewHeight = window.innerHeight * (1 + buffer);
      const movingRight = state.targetX > state.currentX;
      const movingDown = state.targetY > state.currentY;
      const directionBufferX = movingRight
        ? isMobile
          ? -100
          : -200
        : isMobile
          ? 100
          : 200;
      const directionBufferY = movingDown
        ? isMobile
          ? -100
          : -200
        : isMobile
          ? 100
          : 200;

      const startCol = Math.floor(
        (-state.currentX -
          viewWidth / 2 +
          (movingRight ? directionBufferX : 0)) /
          (itemWidth + itemGap),
      );
      const endCol = Math.ceil(
        (-state.currentX +
          viewWidth * (isMobile ? 1.0 : 1.2) +
          (!movingRight ? directionBufferX : 0)) /
          (itemWidth + itemGap),
      );
      const startRow = Math.floor(
        (-state.currentY -
          viewHeight / 2 +
          (movingDown ? directionBufferY : 0)) /
          (itemHeight + itemGap),
      );
      const endRow = Math.ceil(
        (-state.currentY +
          viewHeight * (isMobile ? 1.0 : 1.2) +
          (!movingDown ? directionBufferY : 0)) /
          (itemHeight + itemGap),
      );

      const currentItems = new Set<string>();
      let newItemsCreated = false;

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const itemId = `${col},${row}`;
          currentItems.add(itemId);

          if (state.visibleItems.has(itemId)) continue;
          if (state.activeItemId === itemId && state.isExpanded) continue;

          const item = document.createElement("div");
          item.className = "item";
          item.id = itemId;

          const isEvenRow = row % 2 === 0;
          const horizontalOffset = isEvenRow ? masonryOffset : 0;
          item.style.left = `${col * (itemWidth + itemGap) + horizontalOffset}px`;
          item.style.top = `${row * (itemHeight + itemGap)}px`;
          item.dataset.col = String(col);
          item.dataset.row = String(row);

          if (!state.introAnimationPlayed) {
            gsap.set(item, { scale: 0 });
          }

          const itemNum = (Math.abs(row * columns + col) % itemCount) + 1;
          const img = document.createElement("img");
          img.src = asset(`archive/archive-${itemNum}.jpg`);
          img.alt = `Image ${itemNum}`;
          item.appendChild(img);

          item.addEventListener("click", () => {
            if (state.mouseHasMoved || state.isDragging) return;
            handleItemClick(item);
          });

          canvas.appendChild(item);
          state.visibleItems.add(itemId);
          newItemsCreated = true;
        }
      }

      state.visibleItems.forEach((itemId) => {
        if (
          !currentItems.has(itemId) ||
          (state.activeItemId === itemId && state.isExpanded)
        ) {
          const item = canvas.querySelector(`[id="${itemId}"]`);
          if (item && canvas.contains(item)) canvas.removeChild(item);
          state.visibleItems.delete(itemId);
        }
      });

      if (newItemsCreated && !state.introAnimationPlayed) {
        playIntroAnimation();
      }
    };

    const animate = () => {
      if (state.canDrag) {
        const ease = 0.085;
        state.currentX += (state.targetX - state.currentX) * ease;
        state.currentY += (state.targetY - state.currentY) * ease;

        canvas.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0)`;

        const now = Date.now();
        const distMoved = Math.sqrt(
          (state.currentX - state.lastX) ** 2 +
            (state.currentY - state.lastY) ** 2,
        );

        const isMobile = window.innerWidth <= 1000;
        const updateThreshold = isMobile ? 100 : 80;
        const updateInterval = isMobile ? 150 : 100;

        if (
          distMoved > updateThreshold ||
          now - state.lastUpdateTime > updateInterval
        ) {
          updateVisibleItems();
          state.lastX = state.currentX;
          state.lastY = state.currentY;
          state.lastUpdateTime = now;
        }
      }

      state.animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!state.canDrag) return;
      state.isDragging = true;
      state.mouseHasMoved = false;
      state.startX = e.clientX;
      state.startY = e.clientY;
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!state.isDragging || !state.canDrag) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        state.mouseHasMoved = true;
      }

      const now = Date.now();
      const dt = Math.max(10, now - state.lastDragTime);
      state.lastDragTime = now;

      state.dragVelocityX = dx / dt;
      state.dragVelocityY = dy / dt;

      state.targetX += dx;
      state.targetY += dy;

      state.startX = e.clientX;
      state.startY = e.clientY;
    };

    const handleMouseUp = () => {
      if (!state.isDragging) return;
      state.isDragging = false;

      if (state.canDrag) {
        container.style.cursor = "grab";

        if (
          Math.abs(state.dragVelocityX) > 0.1 ||
          Math.abs(state.dragVelocityY) > 0.1
        ) {
          const momentumFactor = 200;
          state.targetX += state.dragVelocityX * momentumFactor;
          state.targetY += state.dragVelocityY * momentumFactor;
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!state.canDrag) return;
      state.isDragging = true;
      state.mouseHasMoved = false;
      state.startX = e.touches[0].clientX;
      state.startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!state.isDragging || !state.canDrag) return;

      const dx = e.touches[0].clientX - state.startX;
      const dy = e.touches[0].clientY - state.startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        state.mouseHasMoved = true;
      }

      const sensitivityMultiplier = 1.5;
      state.targetX += dx * sensitivityMultiplier;
      state.targetY += dy * sensitivityMultiplier;

      state.startX = e.touches[0].clientX;
      state.startY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      state.isDragging = false;
    };

    const handleOverlayClick = () => {
      if (state.isExpanded) closeExpandedItem();
    };

    const handleResize = () => {
      if (state.isExpanded && state.expandedItem) {
        const viewportWidth = window.innerWidth;
        const isMobile = window.innerWidth <= 768;
        const targetWidth = viewportWidth * (isMobile ? 0.6 : 0.4);
        const targetHeight = targetWidth * 1.2;

        gsap.to(state.expandedItem, {
          width: targetWidth,
          height: targetHeight,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        updateVisibleItems();
      }
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("resize", handleResize);
    overlay.addEventListener("click", handleOverlayClick);

    updateVisibleItems();
    animate();

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
      overlay.removeEventListener("click", handleOverlayClick);

      if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
      }

      if (state.expandedItem?.parentNode) {
        state.expandedItem.parentNode.removeChild(state.expandedItem);
        state.expandedItem = null;
      }

      state.isExpanded = false;
      state.activeItem = null;
      state.originalPosition = null;
      state.activeItemId = null;
      state.canDrag = true;

      if (state.titleSplit) {
        state.titleSplit.revert();
        state.titleSplit = null;
      }
    };
  }, [asset, root]);

  return (
    <>
      <div className="gallery-container" ref={containerRef}>
        <div className="canvas" ref={canvasRef}></div>
        <div className="overlay" ref={overlayRef}></div>
      </div>
      <div className="project-title" ref={projectTitleRef}>
        <p></p>
      </div>
    </>
  );
}

/* --------------------------------------------------------------- spotlight */

const SPOTLIGHT_ITEMS = [
  { name: "Courtyard Stillness", img: "spotlight/spotlight-img-1.jpg" },
  { name: "Blue Horizon", img: "spotlight/spotlight-img-2.jpg" },
  { name: "Stone Quiet", img: "spotlight/spotlight-img-3.jpg" },
  { name: "Amber Niche", img: "spotlight/spotlight-img-4.jpg" },
  { name: "Earthen Shelf", img: "spotlight/spotlight-img-5.jpg" },
  { name: "Reflective White", img: "spotlight/spotlight-img-6.jpg" },
  { name: "Desert Edge", img: "spotlight/spotlight-img-7.jpg" },
  { name: "Soft Passage", img: "spotlight/spotlight-img-8.jpg" },
  { name: "Water Column", img: "spotlight/spotlight-img-9.jpg" },
  { name: "Golden Retreat", img: "spotlight/spotlight-img-10.jpg" },
];

function Spotlight() {
  const asset = useAsset();
  const spotlightRef = useRef<HTMLElement | null>(null);
  const titlesContainerRef = useRef<HTMLDivElement | null>(null);
  const imagesContainerRef = useRef<HTMLDivElement | null>(null);
  const spotlightHeaderRef = useRef<HTMLDivElement | null>(null);
  const titlesContainerElementRef = useRef<HTMLDivElement | null>(null);
  const introTextElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  const config = { gap: 0.08, speed: 0.3, arcRadius: 500 };

  useEffect(() => {
    const section = spotlightRef.current;
    const titlesContainer = titlesContainerRef.current;
    const imagesContainer = imagesContainerRef.current;
    const spotlightHeader = spotlightHeaderRef.current;
    const titlesContainerElement = titlesContainerElementRef.current;
    const introTextElements = introTextElementsRef.current;

    if (
      !section ||
      !titlesContainer ||
      !imagesContainer ||
      !spotlightHeader ||
      !titlesContainerElement
    ) {
      return;
    }

    titlesContainer.innerHTML = "";
    imagesContainer.innerHTML = "";
    const imageElements: HTMLDivElement[] = [];

    SPOTLIGHT_ITEMS.forEach((item, index) => {
      const titleElement = document.createElement("h1");
      titleElement.textContent = item.name;
      if (index === 0) titleElement.style.opacity = "1";
      titlesContainer.appendChild(titleElement);

      const imgWrapper = document.createElement("div");
      imgWrapper.className = "spotlight-img";
      const imgElement = document.createElement("img");
      imgElement.src = asset(item.img);
      imgElement.alt = "";
      imgWrapper.appendChild(imgElement);
      imagesContainer.appendChild(imgWrapper);
      imageElements.push(imgWrapper);
    });

    const titleElements = Array.from(titlesContainer.querySelectorAll("h1"));
    if (titleElements.length === 0) return;

    let currentActiveIndex = 0;

    const containerWidth = window.innerWidth * 0.3;
    const containerHeight = window.innerHeight;
    const arcStartX = containerWidth - 220;
    const arcStartY = -200;
    const arcEndY = containerHeight + 200;
    const arcControlPointX = arcStartX + config.arcRadius;
    const arcControlPointY = containerHeight / 2;

    function getBezierPosition(t: number) {
      const x =
        (1 - t) * (1 - t) * arcStartX +
        2 * (1 - t) * t * arcControlPointX +
        t * t * arcStartX;
      const y =
        (1 - t) * (1 - t) * arcStartY +
        2 * (1 - t) * t * arcControlPointY +
        t * t * arcEndY;
      return { x, y };
    }

    function getImgProgressState(index: number, overallProgress: number) {
      const startTime = index * config.gap;
      const endTime = startTime + config.speed;

      if (overallProgress < startTime) return -1;
      if (overallProgress > endTime) return 2;

      return (overallProgress - startTime) / config.speed;
    }

    imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));

    const bgImgWrapper = section.querySelector(".spotlight-bg-img");
    const bgImg = section.querySelector<HTMLImageElement>(
      ".spotlight-bg-img img",
    );
    const spotlightTitles = section.querySelector(".spotlight-titles");

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${window.innerHeight * 10}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        if (progress <= 0.2) {
          const animationProgress = progress / 0.2;

          const moveDistance = window.innerWidth * 0.6;
          gsap.set(introTextElements[0], {
            x: -animationProgress * moveDistance,
          });
          gsap.set(introTextElements[1], {
            x: animationProgress * moveDistance,
          });
          gsap.set(introTextElements[0], { opacity: 1 });
          gsap.set(introTextElements[1], { opacity: 1 });

          gsap.set(bgImgWrapper, {
            transform: `scale(${animationProgress})`,
          });
          gsap.set(bgImg, {
            transform: `scale(${1.5 - animationProgress * 0.5})`,
          });

          imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));
          spotlightHeader.style.opacity = "0";
          gsap.set(titlesContainerElement, {
            "--before-opacity": "0",
            "--after-opacity": "0",
          });
        } else if (progress > 0.2 && progress <= 0.25) {
          gsap.set(bgImgWrapper, { transform: "scale(1)" });
          gsap.set(bgImg, { transform: "scale(1)" });

          gsap.set(introTextElements[0], { opacity: 0 });
          gsap.set(introTextElements[1], { opacity: 0 });

          imageElements.forEach((img) => gsap.set(img, { opacity: 0 }));
          spotlightHeader.style.opacity = "1";
          gsap.set(titlesContainerElement, {
            "--before-opacity": "1",
            "--after-opacity": "1",
          });
        } else if (progress > 0.25 && progress <= 0.95) {
          gsap.set(bgImgWrapper, { transform: "scale(1)" });
          gsap.set(bgImg, { transform: "scale(1)" });

          gsap.set(introTextElements[0], { opacity: 0 });
          gsap.set(introTextElements[1], { opacity: 0 });

          spotlightHeader.style.opacity = "1";
          gsap.set(titlesContainerElement, {
            "--before-opacity": "1",
            "--after-opacity": "1",
          });

          const switchProgress = (progress - 0.25) / 0.7;
          const viewportHeight = window.innerHeight;
          const titlesContainerHeight = titlesContainer.scrollHeight;
          const startPosition = viewportHeight;
          const targetPosition = -titlesContainerHeight;
          const totalDistance = startPosition - targetPosition;
          const currentY = startPosition - switchProgress * totalDistance;

          gsap.set(spotlightTitles, {
            transform: `translateY(${currentY}px)`,
          });

          imageElements.forEach((img, index) => {
            const imageProgress = getImgProgressState(index, switchProgress);

            if (imageProgress < 0 || imageProgress > 1) {
              gsap.set(img, { opacity: 0 });
            } else {
              const pos = getBezierPosition(imageProgress);
              gsap.set(img, { x: pos.x - 100, y: pos.y - 75, opacity: 1 });
            }
          });

          const viewportMiddle = viewportHeight / 2;
          let closestIndex = 0;
          let closestDistance = Number.POSITIVE_INFINITY;

          titleElements.forEach((title, index) => {
            const titleRect = title.getBoundingClientRect();
            const titleCenter = titleRect.top + titleRect.height / 2;
            const distanceFromCenter = Math.abs(titleCenter - viewportMiddle);

            if (distanceFromCenter < closestDistance) {
              closestDistance = distanceFromCenter;
              closestIndex = index;
            }
          });

          if (closestIndex !== currentActiveIndex) {
            titleElements[currentActiveIndex].style.opacity = "0.35";
            titleElements[closestIndex].style.opacity = "1";
            if (bgImg) bgImg.src = asset(SPOTLIGHT_ITEMS[closestIndex].img);
            currentActiveIndex = closestIndex;
          }
        } else if (progress > 0.95) {
          spotlightHeader.style.opacity = "0";
          gsap.set(titlesContainerElement, {
            "--before-opacity": "0",
            "--after-opacity": "0",
          });
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [asset]);

  return (
    <section className="spotlight" ref={spotlightRef}>
      <div className="spotlight-inner">
        <div className="spotlight-intro-text-wrapper">
          <div
            className="spotlight-intro-text"
            ref={(el) => {
              introTextElementsRef.current[0] = el;
            }}
          >
            <p>Beneath</p>
          </div>
          <div
            className="spotlight-intro-text"
            ref={(el) => {
              introTextElementsRef.current[1] = el;
            }}
          >
            <p>Beyond</p>
          </div>
        </div>
        <div className="spotlight-bg-img">
          <img src={asset("spotlight/spotlight-img-1.jpg")} alt="" />
        </div>
      </div>
      <div
        className="spotlight-titles-container"
        ref={titlesContainerElementRef}
      >
        <div className="spotlight-titles" ref={titlesContainerRef}></div>
      </div>
      <div className="spotlight-images" ref={imagesContainerRef}></div>
      <div className="spotlight-header" ref={spotlightHeaderRef}>
        <p>Discover</p>
      </div>
      <div className="spotlight-outline"></div>
    </section>
  );
}

/* ------------------------------------------------------------- how we work */

const HOW_WE_WORK_CARDS = [
  {
    image: "how-we-work/process-1.jpg",
    label: "Discovery / Context",
    copy: "We begin with listening and study. Site, climate, and daily routines inform the brief so we can define aims, constraints, and measures of success with clarity.",
  },
  {
    image: "how-we-work/process-2.jpg",
    label: "Principles / Direction",
    copy: "We set guiding principles for light, massing, and flow. Quick models and diagrams test options and reveal the direction that best serves the brief.",
  },
  {
    image: "how-we-work/process-3.jpg",
    label: "Detail / Coordination",
    copy: "We develop drawings and specifications across structure, services, and joinery. Materials and samples are reviewed in natural light while budget and timeline stay in view.",
  },
  {
    image: "how-we-work/process-4.jpg",
    label: "Build / Handover",
    copy: "We oversee construction with care and precision. After final review and finishing, we hand over a space that is ready to live in, complete with guidance for long term care.",
  },
];

function HowWeWork() {
  const asset = useAsset();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useGSAP(
    () => {
      if (!stepsRef.current) return;

      const steps = stepsRef.current.querySelectorAll(".how-we-work-step");
      gsap.set(steps, { opacity: 0, x: -40 });

      ScrollTrigger.create({
        trigger: stepsRef.current,
        start: "top 75%",
        once: true,
        animation: gsap.to(steps, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: -0.1,
          ease: "none",
        }),
      });
    },
    { scope: stepsRef },
  );

  useEffect(() => {
    const container = containerRef.current;
    const header = headerRef.current;
    const cards = cardsRef.current;

    if (!container || !header || !cards) return;

    const triggers: ScrollTrigger[] = [];

    if (!isMobile) {
      const mainTrigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        endTrigger: cards,
        end: "bottom bottom",
        pin: header,
        pinSpacing: false,
      });
      triggers.push(mainTrigger);

      const cardElements = cards.querySelectorAll(".how-we-work-card");

      cardElements.forEach((card, index) => {
        const cardTrigger = ScrollTrigger.create({
          trigger: card,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveStep(index),
          onEnterBack: () => setActiveStep(index),
          onLeave: () => {
            if (index < cardElements.length - 1) {
              setActiveStep(index + 1);
            }
          },
          onLeaveBack: () => {
            if (index > 0) {
              setActiveStep(index - 1);
            }
          },
        });
        triggers.push(cardTrigger);
      });
    }

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [isMobile]);

  return (
    <div className="how-we-work" ref={containerRef}>
      <div className="how-we-work-col how-we-work-header" ref={headerRef}>
        <div className="container">
          <div className="how-we-work-header-content">
            <div className="how-we-work-header-callout">
              <Copy delay={0.1}>
                <p>Process in focus</p>
              </Copy>
            </div>
            <Copy delay={0.15}>
              <h3>
                From first sketches to final details, our process is shaped to
                bring clarity and rhythm
              </h3>
            </Copy>
            <div className="how-we-work-steps" ref={stepsRef}>
              {HOW_WE_WORK_CARDS.map((_, index) => (
                <div
                  key={index}
                  className={`how-we-work-step ${activeStep === index ? "active" : ""}`}
                >
                  <p className="how-we-work-step-label">Step</p>
                  <p className="how-we-work-step-index">{index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="how-we-work-col how-we-work-cards" ref={cardsRef}>
        {HOW_WE_WORK_CARDS.map((card) => (
          <div className="how-we-work-card" key={card.label}>
            <div className="how-we-work-card-img">
              <img src={asset(card.image)} alt="" />
            </div>
            <div className="how-we-work-card-copy">
              <div className="how-we-work-card-index-label">
                <h3>{card.label}</h3>
              </div>
              <p className="md">{card.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- home */

let isInitialLoad = true;

function HomePage() {
  const asset = useAsset();
  const { lenis } = useRuntime();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const tagsRef = useRef<HTMLDivElement | null>(null);
  const [showPreloader] = useState(isInitialLoad);
  const [loaderAnimating, setLoaderAnimating] = useState(false);

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useEffect(() => {
    if (loaderAnimating) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [lenis, loaderAnimating]);

  useGSAP(
    () => {
      if (!pageRef.current || !showPreloader) return;

      const page = pageRef.current;
      setLoaderAnimating(true);

      const tl = gsap.timeline({
        delay: 0.3,
        defaults: { ease: "ispHop" },
      });

      const counts = page.querySelectorAll(".count");

      counts.forEach((count, index) => {
        const digits = count.querySelectorAll(".digit h1");

        tl.to(digits, { y: "0%", duration: 1, stagger: 0.075 }, index * 1);

        if (index < counts.length) {
          tl.to(
            digits,
            { y: "-100%", duration: 1, stagger: 0.075 },
            index * 1 + 1,
          );
        }
      });

      tl.to(page.querySelectorAll(".spinner"), { opacity: 0, duration: 0.3 });

      tl.to(page.querySelectorAll(".word h1"), { y: "0%", duration: 1 }, "<");

      tl.to(page.querySelectorAll(".divider"), {
        scaleY: "100%",
        duration: 1,
        onComplete: () => {
          gsap.to(page.querySelectorAll(".divider"), {
            opacity: 0,
            duration: 0.3,
            delay: 0.3,
          });
        },
      });

      tl.to(page.querySelectorAll("#word-1 h1"), {
        y: "100%",
        duration: 1,
        delay: 0.3,
      });

      tl.to(
        page.querySelectorAll("#word-2 h1"),
        { y: "-100%", duration: 1 },
        "<",
      );

      tl.to(
        page.querySelectorAll(".block"),
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          stagger: 0.1,
          delay: 0.75,
          onStart: () => {
            gsap.to(page.querySelectorAll(".hero-img"), {
              scale: 1,
              duration: 2,
              ease: "ispHop",
            });
          },
          onComplete: () => {
            gsap.set(page.querySelectorAll(".loader"), {
              pointerEvents: "none",
            });
            setLoaderAnimating(false);
          },
        },
        "<",
      );
    },
    { scope: pageRef, dependencies: [showPreloader] },
  );

  useGSAP(
    () => {
      if (!tagsRef.current) return;

      const tags = tagsRef.current.querySelectorAll(".what-we-do-tag");
      gsap.set(tags, { opacity: 0, x: -40 });

      ScrollTrigger.create({
        trigger: tagsRef.current,
        start: "top 90%",
        once: true,
        animation: gsap.to(tags, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }),
      });
    },
    { scope: tagsRef },
  );

  return (
    <div ref={pageRef}>
      {showPreloader && (
        <div className="loader">
          <div className="overlay">
            <div className="block"></div>
            <div className="block"></div>
          </div>
          <div className="intro-logo">
            <div className="word" id="word-1">
              <h1>
                <span>Terrene</span>
              </h1>
            </div>
            <div className="word" id="word-2">
              <h1>Balance</h1>
            </div>
          </div>
          <div className="divider"></div>
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <div className="counter">
            {[
              ["0", "0"],
              ["2", "7"],
              ["6", "5"],
              ["9", "8"],
              ["9", "9"],
            ].map((pair, index) => (
              <div className="count" key={index}>
                <div className="digit">
                  <h1>{pair[0]}</h1>
                </div>
                <div className="digit">
                  <h1>{pair[1]}</h1>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Nav />
      <section className="hero">
        <div className="hero-bg">
          <img src={asset("home/hero.jpg")} alt="" />
        </div>
        <div className="hero-gradient"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-header">
              <Copy animateOnScroll={false} delay={showPreloader ? 10 : 0.85}>
                <h1>Spaces that feel rooted, human, and quietly bold</h1>
              </Copy>
            </div>
            <div className="hero-tagline">
              <Copy animateOnScroll={false} delay={showPreloader ? 10.15 : 1}>
                <p>
                  At Terrene, we shape environments that elevate daily life,
                  invite pause, and speak through texture and light.
                </p>
              </Copy>
            </div>
            <AnimatedButton
              label="Discover More"
              route="/studio"
              animateOnScroll={false}
              delay={showPreloader ? 10.3 : 1.15}
            />
          </div>
        </div>
        <div className="hero-stats">
          <div className="container">
            {[
              ["225+", "Completed design studies", 0.1],
              ["36", "Ongoing spatial explorations", 0.2],
              ["12", "Cross-disciplinary collaborators", 0.3],
              ["98%", "Return rate across commissions", 0.4],
            ].map(([count, info, delay]) => (
              <div className="stat" key={count as string}>
                <div className="stat-count">
                  <Copy delay={delay as number}>
                    <h2>{count}</h2>
                  </Copy>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-info">
                  <Copy delay={(delay as number) + 0.05}>
                    <p>{info}</p>
                  </Copy>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="what-we-do">
        <div className="container">
          <div className="what-we-do-header">
            <Copy delay={0.1}>
              <h1>
                <span className="spacer">&nbsp;</span>
                At Terrene, we design with purpose and clarity, creating spaces
                that speak through light, scale, and the quiet confidence of
                lasting form.
              </h1>
            </Copy>
          </div>
          <div className="what-we-do-content">
            <div className="what-we-do-col">
              <Copy delay={0.1}>
                <p>How we work</p>
              </Copy>

              <Copy delay={0.15}>
                <p className="lg">
                  We approach each build with a clarity of intent. Every plan is
                  shaped through research, iteration, and conversation. What
                  remains is the essential, designed to last and built to feel
                  lived in.
                </p>
              </Copy>
            </div>
            <div className="what-we-do-col">
              <div className="what-we-do-tags" ref={tagsRef}>
                {[
                  "Quiet",
                  "View",
                  "Tactile",
                  "Light-forward",
                  "Slow design",
                  "Modular rhythm",
                ].map((tag) => (
                  <div className="what-we-do-tag" key={tag}>
                    <h3>{tag}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="featured-projects-container">
        <div className="container">
          <div className="featured-projects-header-callout">
            <Copy delay={0.1}>
              <p>Featured work</p>
            </Copy>
          </div>
          <div className="featured-projects-header">
            <Copy delay={0.15}>
              <h2>A selection of recent studies and completed spaces</h2>
            </Copy>
          </div>
        </div>
        <FeaturedProjects />
      </section>
      <section className="client-reviews-container">
        <div className="container">
          <div className="client-reviews-header-callout">
            <p>Voices from our spaces</p>
          </div>
          <ClientReviews />
        </div>
      </section>
      <section className="gallery-callout">
        <div className="container">
          <div className="gallery-callout-col">
            <div className="gallery-callout-row">
              <div className="gallery-callout-img gallery-callout-img-1">
                <img
                  src={asset("gallery-callout/gallery-callout-1.jpg")}
                  alt=""
                />
              </div>
              <div className="gallery-callout-img gallery-callout-img-2">
                <img
                  src={asset("gallery-callout/gallery-callout-2.jpg")}
                  alt=""
                />
                <div className="gallery-callout-img-content">
                  <h3>800+</h3>
                  <p>Project Images</p>
                </div>
              </div>
            </div>
            <div className="gallery-callout-row">
              <div className="gallery-callout-img gallery-callout-img-3">
                <img
                  src={asset("gallery-callout/gallery-callout-3.jpg")}
                  alt=""
                />
              </div>
              <div className="gallery-callout-img gallery-callout-img-4">
                <img
                  src={asset("gallery-callout/gallery-callout-4.jpg")}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div className="gallery-callout-col">
            <div className="gallery-callout-copy">
              <Copy delay={0.1}>
                <h3>
                  Take a closer look at the projects that define our practice.
                  From intimate interiors to expansive landscapes, each image
                  highlights a unique perspective that might spark your next big
                  idea.
                </h3>
              </Copy>
              <AnimatedButton label="Explore Gallery" route="/blueprints" />
            </div>
          </div>
        </div>
      </section>
      <CTAWindow
        img="home/home-cta-window.jpg"
        header="Terrene"
        callout="Spaces that breathe with time"
        description="Our approach is guided by rhythm, proportion, and light, allowing every environment to grow more meaningful as it is lived in."
      />
      <ConditionalFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ studio */

function StudioPage() {
  const asset = useAsset();
  return (
    <>
      <Nav />
      <div className="page studio">
        <section className="studio-hero">
          <div className="container">
            <div className="studio-hero-col">
              <Copy delay={0.85}>
                <p>
                  We see design as more than construction. It is an ongoing
                  dialogue between people, material, and place, shaped with
                  care, and built to endure.
                </p>
              </Copy>
            </div>
            <div className="studio-hero-col">
              <Copy delay={0.85}>
                <h2>
                  Our studio exists to create spaces that feel honest, lived in,
                  and quietly transformative. Every project begins with
                  listening and ends with an environment.
                </h2>
              </Copy>
              <div className="studio-hero-hero-img">
                <img src={asset("studio/about-hero.png")} alt="" />
              </div>
            </div>
          </div>
        </section>
        <section className="more-facts">
          <div className="container">
            <div className="more-facts-items">
              {[
                ["Models crafted", "120+", 0.1],
                ["Materials explored", "60", 0.2],
                ["Workshops hosted", "25+", 0.3],
                ["Hours logged", "3k+", 0.4],
                ["Prototypes build", "724", 0.5],
              ].map(([label, count, delay]) => (
                <div className="fact" key={label as string}>
                  <Copy delay={delay as number}>
                    <p>{label}</p>
                    <h2>{count}</h2>
                  </Copy>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="how-we-work-container">
          <div className="container">
            <HowWeWork />
          </div>
        </section>
        <CTAWindow
          img="studio/about-cta-window.jpg"
          header="The Archive"
          callout="Designs that speak through form"
          description="Each project tells a story of light, material, and rhythm. Explore how ideas take shape and grow into lasting environments."
        />
        <Spotlight />
      </div>
      <ConditionalFooter />
    </>
  );
}

/* ------------------------------------------------------------------ spaces */

const SPACES_DATA = [
  {
    id: 1,
    image: "spaces/space-1.jpg",
    date: "June 10, 2021",
    name: "Desert Poolhouse",
    location: "Greece, Athens",
    clientImage: "spaces/client-1.jpeg",
    clientName: "Marina Li",
    route: "/sample-space",
  },
  {
    id: 2,
    image: "spaces/space-2.jpg",
    date: "May 15, 2021",
    name: "Sanctum Hall",
    location: "Morocco, Marrakesh",
    clientImage: "spaces/client-2.jpeg",
    clientName: "Alex Chen",
    route: "/sample-space",
  },
  {
    id: 3,
    image: "spaces/space-3.jpg",
    date: "April 22, 2021",
    name: "Arcade Residence",
    location: "Portugal, Lisbon",
    clientImage: "spaces/client-3.jpeg",
    clientName: "Sophia Rodriguez",
    route: "/sample-space",
  },
  {
    id: 4,
    image: "spaces/space-4.jpg",
    date: "March 8, 2021",
    name: "Atrium Gallery",
    location: "Austria, Vienna",
    clientImage: "spaces/client-4.jpeg",
    clientName: "David Kim",
    route: "/sample-space",
  },
  {
    id: 5,
    image: "spaces/space-5.jpg",
    date: "February 14, 2021",
    name: "Mountain Retreat",
    location: "Switzerland, Zurich",
    clientImage: "spaces/client-5.jpeg",
    clientName: "Emma Wilson",
    route: "/sample-space",
  },
  {
    id: 6,
    image: "spaces/space-6.jpg",
    date: "January 30, 2021",
    name: "Horizon Pavilion",
    location: "Japan, Kyoto",
    clientImage: "spaces/client-6.jpeg",
    clientName: "Aiko Tanaka",
    route: "/sample-space",
  },
  {
    id: 7,
    image: "spaces/space-7.jpg",
    date: "December 12, 2020",
    name: "Lumen Spa",
    location: "UAE, Dubai",
    clientImage: "spaces/client-7.jpeg",
    clientName: "Omar Rahman",
    route: "/sample-space",
  },
];

function SpacesPage() {
  const asset = useAsset();
  const router = useRouter();
  const spacesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollTriggerInstances: ScrollTrigger[] = [];

    const cleanupScrollTriggers = () => {
      scrollTriggerInstances.forEach((instance) => {
        instance?.kill();
      });
      scrollTriggerInstances.length = 0;
    };

    const setupAnimations = () => {
      cleanupScrollTriggers();

      if (!spacesRef.current) return;

      const spaces = spacesRef.current.querySelectorAll(".space");
      if (spaces.length === 0) return;

      spaces.forEach((space, index) => {
        gsap.set(space, { opacity: 0, scale: 0.75, y: 150 });

        if (index === 0) {
          gsap.to(space, {
            duration: 0.75,
            y: 0,
            scale: 1,
            opacity: 1,
            ease: "power3.out",
            delay: 1.4,
          });
        } else {
          const trigger = ScrollTrigger.create({
            trigger: space,
            start: "top 100%",
            onEnter: () => {
              gsap.to(space, {
                duration: 0.75,
                y: 0,
                scale: 1,
                opacity: 1,
                ease: "power3.out",
              });
            },
          });

          scrollTriggerInstances.push(trigger);
        }
      });

      ScrollTrigger.refresh();
    };

    setupAnimations();

    const handleResize = () => {
      setupAnimations();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cleanupScrollTriggers();
    };
  }, []);

  return (
    <>
      <Nav />
      <div className="page spaces">
        <section className="spaces-header">
          <div className="container">
            <div className="prop-col"></div>
            <div className="prop-col">
              <Copy delay={1}>
                <h1>Timeless Spaces</h1>
              </Copy>
              <div className="prop-filters">
                {["All", "Residential", "Commercial", "Hospitality"].map(
                  (filter, index) => (
                    <div
                      className={`filter ${index === 0 ? "default" : ""}`}
                      key={filter}
                    >
                      <Copy delay={1 + index * 0.1}>
                        <p className="lg">{filter}</p>
                      </Copy>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="spaces-list">
          <div className="container" ref={spacesRef}>
            {SPACES_DATA.map((space) => (
              <a
                key={space.id}
                href={space.route}
                className="space"
                onClick={(e) => {
                  e.preventDefault();
                  router.navigate(space.route);
                }}
              >
                <div className="space-img">
                  <img src={asset(space.image)} alt={space.name} />
                </div>
                <div className="space-info">
                  <div className="prop-info-col">
                    <div className="prop-date">
                      <p>{space.date}</p>
                    </div>
                  </div>
                  <div className="prop-info-col">
                    <div className="prop-info-sub-col">
                      <div className="prop-name">
                        <h3>{space.name}</h3>
                        <p className="lg">{space.location}</p>
                      </div>
                    </div>
                    <div className="prop-info-sub-col">
                      <div className="prop-client">
                        <div className="prop-client-img">
                          <img
                            src={asset(space.clientImage)}
                            alt={space.clientName}
                          />
                        </div>
                        <div className="prop-client-name">
                          <p>{space.clientName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
      <ConditionalFooter />
    </>
  );
}

/* ------------------------------------------------------------ sample space */

function SampleSpacePage() {
  const asset = useAsset();
  return (
    <>
      <Nav />
      <div className="page sample-space">
        <section className="sample-space-hero">
          <div className="sample-space-hero-img">
            <img
              src={asset("sample-space/hero.jpg")}
              alt="Arcade Residence Lisbon"
            />
          </div>
          <div className="sample-space-hero-overlay"></div>
          <div className="container">
            <div className="sample-space-hero-header">
              <Copy delay={1} animateOnScroll={false}>
                <h1>Arcade Residence</h1>
              </Copy>
            </div>
            <div className="sample-space-content">
              <div className="sample-space-col">
                <Copy delay={1.05} animateOnScroll={false}>
                  <p>Lisbon, Portugal</p>
                </Copy>
              </div>
              <div className="sample-space-col">
                <div className="sample-space-content-wrapper">
                  <Copy delay={1.1} animateOnScroll={false}>
                    <p>Europe</p>
                  </Copy>
                </div>
                <div className="sample-space-content-wrapper">
                  <Copy delay={1.15} animateOnScroll={false}>
                    <h3>
                      Arcade Residence is a study in rhythm and light, where
                      colonnades and vaulted thresholds frame daily life with
                      quiet grandeur.
                    </h3>
                    <h3>
                      The design combines classical proportions with a
                      contemporary sensitivity, creating a home that feels both
                      rooted in tradition and attuned to the present moment.
                    </h3>
                  </Copy>
                </div>
                <div className="sample-space-content-wrapper sample-space-meta">
                  <div className="sample-space-hero-row">
                    <div className="sample-space-hero-sub-col">
                      <Copy delay={0.2}>
                        <p>Date Completed</p>
                        <p>2021</p>
                      </Copy>
                    </div>
                    <div className="sample-space-hero-sub-col">
                      <Copy delay={0.2}>
                        <p>Project Type</p>
                        <p>Residential Architecture</p>
                        <p>Retreat Wellness</p>
                      </Copy>
                    </div>
                  </div>
                </div>
                <div className="sample-space-content-wrapper sample-space-meta">
                  <div className="sample-space-hero-row">
                    <div className="sample-space-hero-sub-col">
                      <Copy delay={0.35}>
                        <p>Collaborators</p>
                        <p>Atelier Forma</p>
                        <p>LX Stoneworks</p>
                        <p>Studio Mar&eacute;</p>
                      </Copy>
                    </div>
                    <div className="sample-space-hero-sub-col">
                      <Copy delay={0.35}>
                        <p>Photography</p>
                        <p>Atelier Forma</p>
                        <p>In&ecirc;s Almeida</p>
                      </Copy>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="sample-space-details sample-space-details-1">
          <div className="container">
            <div className="sample-space-col">
              <Copy delay={0.1}>
                <p>Architectural Story</p>
              </Copy>
            </div>
            <div className="sample-space-col">
              <Copy delay={0.1}>
                <h3>
                  At Arcade Residence, the sequence of arches creates a measured
                  rhythm that guides movement through the home. Each passage
                  frames daylight differently, shifting the mood as one moves
                  from courtyard to living space.
                </h3>

                <h3>
                  Materials were chosen for their quiet permanence: pale stone,
                  lime plaster, and timber accents. These textures invite touch
                  and age gracefully, ensuring the house evolves in character
                  with time.
                </h3>
              </Copy>
              <div className="sample-space-details-img">
                <img src={asset("sample-space/sample-space-1.jpg")} alt="" />
              </div>
            </div>
          </div>
        </section>
        <section className="sample-space-details sample-space-details-2">
          <div className="container">
            <div className="sample-space-col">
              <Copy delay={0.1}>
                <p>Spatial Qualities</p>
              </Copy>
            </div>
            <div className="sample-space-col">
              <div className="sample-space-content-wrapper sample-space-meta">
                <div className="sample-space-hero-row">
                  <div className="sample-space-hero-sub-col">
                    <Copy delay={0.1}>
                      <p>Atmosphere</p>
                      <p>Calm</p>
                      <p>Softened acoustics</p>
                      <p>Filtered light</p>
                    </Copy>
                  </div>
                  <div className="sample-space-hero-sub-col">
                    <Copy delay={0.1}>
                      <p>Flow</p>
                      <p>Passages</p>
                      <p>Guided movement</p>
                      <p>Rhythmic</p>
                    </Copy>
                  </div>
                </div>
              </div>
              <div className="sample-space-content-wrapper sample-space-meta">
                <div className="sample-space-hero-row">
                  <div className="sample-space-hero-sub-col">
                    <Copy delay={0.2}>
                      <p>Materials</p>
                      <p>Lime plaster walls</p>
                      <p>Local stone flooring</p>
                      <p>Timber inlays</p>
                    </Copy>
                  </div>
                  <div className="sample-space-hero-sub-col">
                    <Copy delay={0.2}>
                      <p>Natural Elements</p>
                      <p>Court planting</p>
                      <p>Daylight wells</p>
                      <p>Cross ventilation</p>
                    </Copy>
                  </div>
                </div>
              </div>
              <div className="sample-space-details-img">
                <img
                  src={asset("sample-space/sample-space-2.jpg")}
                  alt="Arcade Residence interiors and light"
                />
              </div>
              <Copy delay={0.2}>
                <h3>
                  Every choice within the residence was guided by sensory
                  experience. The aim was not only to frame views but to shape
                  how sound, touch, and temperature are felt as one moves
                  through the home.
                </h3>
              </Copy>
            </div>
          </div>
        </section>
        <CTAWindow
          img="sample-space/next-project.jpg"
          header="Next Project"
          callout="Built for stillness and clarity"
          description="A study in restraint and resonance, this space invites quietude. Materials, light, and layout come together."
        />
      </div>
      <ConditionalFooter />
    </>
  );
}

/* -------------------------------------------------------------- blueprints */

function BlueprintsPage() {
  return (
    <>
      <Nav />
      <div className="page blueprints">
        <Gallery />
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- connect */

function ConnectPage() {
  const asset = useAsset();
  return (
    <>
      <Nav />
      <div className="page contact">
        <section className="contact-hero">
          <div className="container">
            <div className="contact-col">
              <div className="contact-hero-header">
                <Copy delay={0.85}>
                  <h1>All spaces begin with intention</h1>
                </Copy>
              </div>
              <div className="contact-copy-year">
                <Copy delay={0.1}>
                  <h1>&copy;25</h1>
                </Copy>
              </div>
            </div>
            <div className="contact-col">
              <div className="contact-info">
                <div className="contact-info-block">
                  <Copy delay={0.85}>
                    <p>General</p>
                    <p>desk@terrene.studio</p>
                  </Copy>
                </div>
                <div className="contact-info-block">
                  <Copy delay={1}>
                    <p>New Commissions</p>
                    <p>build@terrene.studio</p>
                    <p>+1 (872) 441&#8209;2086</p>
                  </Copy>
                </div>
                <div className="contact-info-block">
                  <Copy delay={1.15}>
                    <p>Studio Address</p>
                    <p>18 Cordova Lane</p>
                    <p>Seattle, WA 98101</p>
                  </Copy>
                </div>
                <div className="contact-info-block">
                  <Copy delay={1.3}>
                    <p>Social</p>
                    <p>Instagram</p>
                    <p>Are.na</p>
                    <p>LinkedIn</p>
                  </Copy>
                </div>
              </div>
              <div className="contact-img">
                <img
                  src={asset("contact/contact-img.jpg")}
                  alt="Terrene studio workspace"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      <ConditionalFooter />
    </>
  );
}

/* --------------------------------------------------------- scroll runtime */

/** Nearest scrollable ancestor, or null when this is the page's own scroller. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node) {
    const oy = getComputedStyle(node).overflowY;
    if (oy === "auto" || oy === "scroll") return node;
    node = node.parentElement;
  }
  return null;
}

function scrollToTop(scroller: HTMLElement | Window | null) {
  if (scroller instanceof HTMLElement) {
    scroller.scrollTo({ top: 0, behavior: "instant" });
  } else {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

/**
 * Drives Lenis and ScrollTrigger against the real scroll container. When
 * embedded (registry preview / demo box), the component lives inside an
 * `overflow-y:auto` element, not the window; the source's `<ReactLenis root>`
 * would hijack the window instead.
 */
function useScrollRuntime(rootElement: HTMLElement | null) {
  const [state, setState] = useState<{
    scroller: HTMLElement | Window | null;
    lenis: Lenis | null;
  }>({ scroller: null, lenis: null });

  useLayoutEffect(() => {
    if (!rootElement) return;

    const scroller = getScrollParent(rootElement);
    let lenis: Lenis | null = null;
    let previousOverflowAnchor = "";
    let previousOverscrollBehavior = "";
    let previousScrollBehavior = "";

    const isMobile = window.innerWidth <= 1000;
    const scrollSettings = {
      duration: isMobile ? 0.8 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      touchMultiplier: isMobile ? 1.5 : 2,
      lerp: isMobile ? 0.09 : 0.1,
      wheelMultiplier: 1,
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
    const ticker = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
    setState({ scroller: scroller ?? window, lenis });

    const refreshFrame = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      gsap.ticker.remove(ticker);
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

/* ------------------------------------------------------------------- shell */

function renderRoute(pathname: string) {
  switch (pathname) {
    case "/studio":
      return <StudioPage />;
    case "/spaces":
      return <SpacesPage />;
    case "/sample-space":
      return <SampleSpacePage />;
    case "/blueprints":
      return <BlueprintsPage />;
    case "/connect":
      return <ConnectPage />;
    default:
      return <HomePage />;
  }
}

function RouteLayer({
  pathname,
  isOverlay,
  layerRef,
}: {
  pathname: string;
  isOverlay: boolean;
  layerRef: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      className={`route-layer ${isOverlay ? "route-layer-overlay" : ""}`}
      ref={layerRef}
    >
      <div className="route-wrapper">{renderRoute(pathname)}</div>
    </div>
  );
}

function InteriorStudioShell({ initialPath }: { initialPath: string }) {
  const { scroller, lenis } = useRuntime();
  const [current, setCurrent] = useState(normalizePath(initialPath));
  const [incoming, setIncoming] = useState<string | null>(null);
  const layerNodes = useRef<Record<string, HTMLDivElement | null>>({});

  const navigate = useCallback(
    (to: string) => {
      const target = normalizePath(to);
      if (target === current || incoming) return;
      setIncoming(target);
    },
    [current, incoming],
  );

  useGSAP(
    () => {
      if (!incoming) return;
      const oldLayer = layerNodes.current[current];
      const newLayer = layerNodes.current[incoming];
      if (!newLayer) return;

      const scrollTop =
        scroller instanceof HTMLElement ? scroller.scrollTop : window.scrollY;

      lenis.stop();

      gsap.set(newLayer, {
        top: scrollTop,
        clipPath: "circle(0% at 50% 50%)",
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrent(incoming);
          setIncoming(null);
          scrollToTop(scroller);
          lenis.start();
          requestAnimationFrame(() => {
            const settled = layerNodes.current[incoming];
            if (settled) gsap.set(settled, { clearProps: "all" });
            ScrollTrigger.refresh();
          });
        },
      });

      if (oldLayer) {
        tl.to(
          oldLayer,
          {
            scale: 0.5,
            opacity: 0,
            duration: TRANSITION_DURATION,
            ease: "ispSlide",
          },
          0,
        );
      }
      tl.to(
        newLayer,
        {
          clipPath: "circle(75% at 50% 50%)",
          duration: TRANSITION_DURATION,
          ease: "ispSlide",
        },
        0,
      );
    },
    { dependencies: [incoming] },
  );

  const routerValue = useMemo<RouterValue>(
    () => ({ pathname: incoming ?? current, navigate }),
    [incoming, current, navigate],
  );

  const layers = incoming ? [current, incoming] : [current];

  return (
    <RouterContext.Provider value={routerValue}>
      <TopBar />
      <div className="isp-viewport">
        {layers.map((route, index) => (
          <RouteLayer
            key={route}
            pathname={route}
            isOverlay={Boolean(incoming) && index === 1}
            layerRef={(node) => {
              layerNodes.current[route] = node;
            }}
          />
        ))}
      </div>
    </RouterContext.Provider>
  );
}

/* --------------------------------------------------------------- top level */

export interface InteriorStudioPageProps {
  assetBase?: string;
  initialPath?: string;
  className?: string;
  style?: CSSProperties;
}

export default function InteriorStudioPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className = "",
  style,
}: InteriorStudioPageProps) {
  const normalizedAssetBase = assetBase.replace(/\/$/, "");
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);
  const { scroller, lenis } = useScrollRuntime(rootElement);
  const styles = useMemo(
    () => getInteriorStudioPageStyles(normalizedAssetBase),
    [normalizedAssetBase],
  );

  const runtime = useMemo<RuntimeValue | null>(
    () =>
      rootElement && scroller && lenis
        ? { root: rootElement, scroller, lenis }
        : null,
    [rootElement, scroller, lenis],
  );

  return (
    <ASSET_CONTEXT.Provider value={normalizedAssetBase}>
      <main
        ref={setRootElement}
        className={`interior-studio-page ${className}`.trim()}
        style={style}
      >
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet */}
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        {runtime ? (
          <RuntimeContext.Provider value={runtime}>
            <InteriorStudioShell key={initialPath} initialPath={initialPath} />
          </RuntimeContext.Provider>
        ) : null}
      </main>
    </ASSET_CONTEXT.Provider>
  );
}

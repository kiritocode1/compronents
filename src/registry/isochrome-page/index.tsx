"use client";

/**
 * ISOChrome Page - a faithful port of the ISOChrome creative-agency template.
 * Ships the routed home (preloader), about (pinned expertise, parallax), work,
 * project, and contact pages behind a lightweight internal router. Line-reveal
 * text uses gsap SplitText (replacing split-type); parallax and ScrollTrigger
 * run against the preview's own scroll container (replacing Lenis); the overlay
 * menu keeps its gsap choreography. No split-type / lenis / view-transition
 * deps. Fonts and images are Blob-hosted.
 *
 * BLANK - aryank.space
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { getIsochromePageStyles } from "./styles";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/isochrome-page";

export const ISOCHROME_PAGE_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/about", label: "About Us" },
  { path: "/work", label: "Work" },
  { path: "/project", label: "Project" },
  { path: "/contact", label: "Contact" },
] as const;

export type IsochromeRoute = (typeof ISOCHROME_PAGE_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(ISOCHROME_PAGE_ROUTES.map((r) => r.path));

function normalizePath(path: string | undefined): IsochromeRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/(.)\/$/, "$1") || "/";
  return ROUTE_SET.has(normalized) ? (normalized as IsochromeRoute) : "/";
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflow + style.overflowY)) return current;
    current = current.parentElement;
  }
  return window;
}

interface NavContextValue {
  navigate: (to: IsochromeRoute) => void;
  assetBase: string;
}
const NavContext = createContext<NavContextValue>({
  navigate: () => {},
  assetBase: DEFAULT_ASSET_BASE,
});
const useNav = () => useContext(NavContext);
const asset = (base: string, file: string) =>
  `${base.replace(/\/$/, "")}${file}`;

let isInitialLoad = true;

/** Binds gsap ScrollTrigger to the preview's own scroll container. */
function ScrollerSetup({
  rootRef,
}: {
  rootRef: React.RefObject<HTMLElement | null>;
}) {
  useLayoutEffect(() => {
    const scroller = getScrollParent(rootRef.current);
    if (scroller instanceof Window) {
      ScrollTrigger.defaults({ scroller: undefined });
    } else {
      ScrollTrigger.defaults({ scroller });
    }
    ScrollTrigger.refresh();
    return () => {
      ScrollTrigger.defaults({ scroller: undefined });
    };
  }, [rootRef]);
  return null;
}

interface AnimatedTextProps {
  children: ReactNode;
  tag?: "p" | "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  animateOnScroll?: boolean;
  direction?: "top" | "bottom";
}

function AnimatedText({
  children,
  tag = "p",
  className = "",
  delay = 0,
  duration = 1,
  ease = "power4.out",
  stagger = 0.1,
  animateOnScroll = true,
  direction = "bottom",
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      let split: SplitText | null = null;
      let cancelled = false;

      const run = () => {
        if (cancelled || !ref.current) return;
        split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
        });
        const from = direction === "top" ? -100 : 100;
        gsap.set(split.lines, { yPercent: from });
        gsap.to(split.lines, {
          yPercent: 0,
          stagger,
          delay,
          duration,
          ease,
          ...(animateOnScroll
            ? {
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              }
            : {}),
        });
      };

      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(run);
      } else {
        run();
      }

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: ref, dependencies: [animateOnScroll, delay, direction] },
  );

  const Tag = tag as "p";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLParagraphElement>}
      className={className}
    >
      {children}
    </Tag>
  );
}

function ParallaxImage({
  base,
  src,
  alt,
  speed = 0.3,
}: {
  base: string;
  src: string;
  alt: string;
  speed?: number;
}) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (!img || typeof window === "undefined" || window.innerWidth < 900)
      return;
    let raf = 0;
    let cur = 0;
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
    const animate = () => {
      const r = img.getBoundingClientRect();
      const vh = window.innerHeight;
      const elemMiddle = r.top + r.height / 2;
      const target = (vh / 2 - elemMiddle) * speed;
      cur = lerp(cur, target, 0.1);
      img.style.transform = `translateY(${cur}px) scale(1.5)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return (
    <img
      ref={ref}
      src={asset(base, src)}
      alt={alt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        position: "absolute",
        top: 0,
        left: 0,
        willChange: "transform",
        transform: "translateY(0) scale(1.5)",
      }}
    />
  );
}

const EASE = ".76,0,.2,1";

function Nav() {
  const { navigate } = useNav();
  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    const nav = navRef.current;
    const overlay = overlayRef.current;
    const bar = barRef.current;
    const openBtn = openBtnRef.current;
    const closeBtn = closeBtnRef.current;
    const foot = footerRef.current;
    if (!nav || !overlay || !bar || !openBtn || !closeBtn || !foot) return;

    gsap.to([nav.querySelector("a"), openBtn.querySelector("p")], {
      y: -20,
      duration: 1,
      stagger: 0.1,
      ease: CustomEase.create("", EASE),
      onComplete: () => {
        gsap.set(nav.querySelector("a"), { y: 20 });
        gsap.set(openBtn.querySelector("p"), { y: 20 });
      },
    });
    gsap.to(overlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1,
      ease: CustomEase.create("", EASE),
      onComplete: () => {
        gsap.set(nav, { pointerEvents: "none" });
        gsap.set(overlay, { pointerEvents: "all" });
      },
    });
    gsap.to(overlay.querySelectorAll(".menu-link a"), {
      y: "0%",
      duration: 1,
      stagger: 0.1,
      delay: 0.5,
      ease: "power3.out",
    });
    gsap.to(
      [
        bar.querySelector("a"),
        closeBtn.querySelector("p"),
        foot.querySelector(".showreel a"),
        ...foot.querySelectorAll(".media-link a"),
      ],
      {
        y: 0,
        duration: 1,
        stagger: 0.1,
        delay: 0.5,
        ease: CustomEase.create("", EASE),
      },
    );
  };

  const closeMenu = () => {
    const nav = navRef.current;
    const overlay = overlayRef.current;
    const bar = barRef.current;
    const openBtn = openBtnRef.current;
    const closeBtn = closeBtnRef.current;
    const foot = footerRef.current;
    if (!nav || !overlay || !bar || !openBtn || !closeBtn || !foot) return;

    gsap.to(
      [
        bar.querySelector("a"),
        closeBtn.querySelector("p"),
        foot.querySelector(".showreel a"),
        ...foot.querySelectorAll(".media-link a"),
      ],
      {
        y: -20,
        duration: 1,
        stagger: 0.1,
        ease: CustomEase.create("", EASE),
        onComplete: () => {
          gsap.set(bar.querySelector("a"), { y: 20 });
          gsap.set(closeBtn.querySelector("p"), { y: 20 });
          gsap.set(foot.querySelector(".showreel a"), { y: 20 });
          gsap.set(foot.querySelectorAll(".media-link a"), { y: 20 });
        },
      },
    );
    gsap.to(overlay.querySelectorAll(".menu-link a"), {
      y: "-100%",
      duration: 0.75,
      stagger: 0.05,
      ease: "power4.in",
      onComplete: () => {
        gsap.set(overlay.querySelectorAll(".menu-link a"), { y: "100%" });
      },
    });
    gsap.to(overlay, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      delay: 0.5,
      ease: CustomEase.create("", EASE),
      onComplete: () => {
        gsap.set(nav, { pointerEvents: "all" });
        gsap.set(overlay, {
          pointerEvents: "none",
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        });
      },
    });
    gsap.to([nav.querySelector("a"), openBtn.querySelector("p")], {
      y: 0,
      duration: 1,
      stagger: 0.1,
      delay: 0.5,
      ease: CustomEase.create("", EASE),
    });
  };

  const go = (path: IsochromeRoute) => {
    closeMenu();
    setTimeout(() => navigate(path), 300);
  };

  return (
    <>
      <nav ref={navRef}>
        <div className="logo">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            ISOChrome
          </a>
        </div>
        <button
          type="button"
          className="menu-toggle-open"
          ref={openBtnRef}
          onClick={openMenu}
        >
          <p>Menu</p>
        </button>
      </nav>

      <div className="menu-overlay" ref={overlayRef}>
        <div className="menu-overlay-bar" ref={barRef}>
          <div className="logo">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                go("/");
              }}
            >
              ISOChrome
            </a>
          </div>
          <button
            type="button"
            className="menu-toggle-close"
            ref={closeBtnRef}
            onClick={closeMenu}
          >
            <p>Close</p>
          </button>
        </div>

        <div className="menu-footer" ref={footerRef}>
          <div className="showreel">
            <a
              href="https://aryank.space"
              target="_blank"
              rel="noopener noreferrer"
            >
              Showreel
            </a>
          </div>
          <div className="socials">
            <div className="media-link">
              <a
                href="https://github.com/kiritocode1"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
            <div className="media-link">
              <a
                href="https://x.com/blank_spacets"
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
            </div>
          </div>
        </div>

        <div className="menu-links">
          {ISOCHROME_PAGE_ROUTES.filter((r) => r.path !== "/project").map(
            (r) => (
              <div className="menu-link" key={r.path}>
                <a
                  href={r.path}
                  onClick={(e) => {
                    e.preventDefault();
                    go(r.path);
                  }}
                >
                  <h1>{r.label}</h1>
                </a>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
}

function Footer() {
  const logoRef = useRef<HTMLHeadingElement>(null);
  useGSAP(
    () => {
      const el = logoRef.current;
      if (!el) return;
      let split: SplitText | null = null;
      const run = () => {
        split = SplitText.create(el, {
          type: "chars",
          charsClass: "footer-logo-char",
        });
        gsap.set(split.chars, { yPercent: 100 });
        gsap.to(split.chars, {
          yPercent: 0,
          stagger: 0.04,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      };
      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(run);
      } else {
        run();
      }
      return () => split?.revert();
    },
    { scope: logoRef },
  );
  return (
    <div className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="col">
            <h3>Content delivered to your inbox</h3>
            <div className="subscribe-form">
              <input type="text" placeholder="Enter your email" />
              <button type="button">Subscribe</button>
            </div>
          </div>
          <div className="col">
            <div className="row">
              <div className="footer-socials">
                <a
                  href="https://github.com/kiritocode1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href="https://x.com/blank_spacets"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  X
                </a>
              </div>
              <div className="langs">
                <p>EN</p>
                <p>FR</p>
              </div>
            </div>
            <div className="row">
              <div className="location">
                <h3>New York</h3>
                <p>245 Fifth Avenue</p>
                <p>New York, NY 10016</p>
                <p>USA</p>
              </div>
              <div className="location">
                <h3>Tokyo</h3>
                <p>3-5-7 Ginza</p>
                <p>Chuo-ku, Tokyo 104-0061</p>
                <p>Japan</p>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-logo">
          <h1 ref={logoRef}>ISOChrome</h1>
        </div>
        <div className="footer-copyright">
          <p>ISOChrome &copy;2025. All rights reserved.</p>
          <p>By BLANK</p>
        </div>
      </div>
    </div>
  );
}

function Home({ base }: { base: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);

  useLayoutEffect(() => {
    CustomEase.create(
      "hop-main",
      "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1",
    );
  }, []);

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useGSAP(
    () => {
      if (!showPreloader) return;
      const tl = gsap.timeline({ onComplete: () => setShowPreloader(false) });
      tl.to(progressBarRef.current, {
        scaleX: 1,
        duration: 4,
        ease: "power1.inOut",
      });
      tl.set(progressBarRef.current, { transformOrigin: "right" }).to(
        progressBarRef.current,
        { scaleX: 0, duration: 1, ease: "power2.in" },
      );
      tl.to(preloaderRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.5,
        ease: "hop-main",
      });
    },
    { scope: containerRef, dependencies: [showPreloader] },
  );

  return (
    <>
      {showPreloader && (
        <div className="pre-loader" ref={preloaderRef}>
          <div className="progress-bar" ref={progressBarRef} />
        </div>
      )}
      <div className="page" ref={containerRef}>
        <section className="index-hero">
          <div className="hero-img">
            <img src={asset(base, "/home/hero-img.jpg")} alt="" />
          </div>
          <div className="hero-header">
            <AnimatedText
              tag="h1"
              animateOnScroll={false}
              delay={showPreloader ? 5.75 : 0.85}
            >
              Beyond the Frame, Into the Soul.
            </AnimatedText>
          </div>
          <div className="hero-footer">
            <div className="site-info">
              <a
                href="https://aryank.space"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Showreel
              </a>
            </div>
            <div className="contact-link">
              <a
                href="https://x.com/blank_spacets"
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const CLIENT_BRANDS = [
  "Meridian",
  "Hexal",
  "Synergy",
  "Harmony",
  "Octa",
  "Constellation",
  "Aperture",
  "Flux",
  "Bloom",
  "Spectrum",
  "Equinox",
  "Horizon",
  "Element",
  "Stratos",
  "Vanguard",
  "Echo",
];

const SERVICES = [
  {
    n: "(01)",
    title: "Brand Strategy",
    items: [
      "01 Market Research and Insights",
      "02 Positioning and Differentiation",
      "03 Audience Analysis",
      "04 Messaging Framework",
      "05 Long-Term Growth Planning",
    ],
  },
  {
    n: "(02)",
    title: "Visual Identity",
    items: [
      "01 Logo and Brand Guidelines",
      "02 Color Theory and Typography",
      "03 Design Systems and Assets",
      "04 Illustration and Iconography",
      "05 Brand Voice and Personality",
    ],
  },
  {
    n: "(03)",
    title: "Digital Experiences",
    items: [
      "01 Web Design and Development",
      "02 UI/UX and Interactive Design",
      "03 Prototyping and Wireframing",
      "04 Mobile and Web App Interfaces",
      "05 Performance and Accessibility",
    ],
  },
  {
    n: "(04)",
    title: "Content and Storytelling",
    items: [
      "01 Creative Copywriting",
      "02 Video and Motion Graphics",
      "03 Social Media Campaigns",
      "04 Content Strategy",
      "05 Brand Narratives",
    ],
  },
  {
    n: "(05)",
    title: "Marketing and Growth",
    items: [
      "01 SEO and Performance Optimization",
      "02 Ad Campaigns and Paid Media",
      "03 Email and CRM Strategies",
      "04 Conversion Rate Optimization",
      "05 Analytics and Insights",
    ],
  },
];

function About({ base }: { base: string }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.innerWidth <= 900) return;
      const id = setTimeout(() => {
        const expertise =
          container.current?.querySelector<HTMLElement>(".expertise");
        const header =
          container.current?.querySelector<HTMLElement>(".expertise-header");
        const services =
          container.current?.querySelector<HTMLElement>(".services");
        if (expertise && header && services) {
          ScrollTrigger.create({
            trigger: expertise,
            start: "top top",
            endTrigger: services,
            end: "bottom bottom",
            pin: header,
            pinSpacing: false,
          });
          ScrollTrigger.refresh();
        }
      }, 200);
      return () => clearTimeout(id);
    },
    { scope: container },
  );

  return (
    <div className="page" ref={container}>
      <section className="about-hero">
        <div className="about-hero-bg">
          <img
            src={asset(base, "/about/hero.jpg")}
            alt="ISOChrome about hero"
          />
        </div>
        <div className="container">
          <AnimatedText tag="h1" animateOnScroll={false} delay={1}>
            Shaping the Future of Creativity
          </AnimatedText>
          <div className="about-tagline">
            <div className="col">
              <AnimatedText delay={1} animateOnScroll={false}>
                Who We Are
              </AnimatedText>
            </div>
            <div className="col">
              <AnimatedText delay={1} animateOnScroll={false}>
                Where strategy meets storytelling, crafting bold, unforgettable
                brand experiences.
              </AnimatedText>
            </div>
          </div>
          <AnimatedText tag="h1" animateOnScroll={false} delay={1.2}>
            with Vision and Innovation
          </AnimatedText>
        </div>
      </section>

      <section className="about-copy">
        <div className="container">
          <AnimatedText tag="h2">The Origin</AnimatedText>
          <div className="about-copy-wrapper">
            <AnimatedText>
              ISOChrome is more than a creative agency. We are storytellers,
              strategists, and visionaries dedicated to redefining brand
              communication. We craft experiences that go beyond visuals,
              blending strategy with creativity to create lasting impact. Every
              brand has a unique identity, and we specialize in bringing that
              identity to life with immersive storytelling, cutting-edge design,
              and audience-driven narratives. From concept to execution, we
              ensure that every campaign is crafted with precision and passion.
              We do not just create content, we engineer experiences that
              inspire engagement and action.
            </AnimatedText>
            <AnimatedText delay={0.25}>
              Our approach is built on innovation, ensuring every project is
              fresh, dynamic, and purpose-driven. Whether it is brand strategy,
              influencer collaborations, or digital campaigns, we help brands
              stand out, connect authentically, and leave a lasting impression.
              We combine creative vision with analytical insights to develop
              strategies that not only capture attention but also drive real
              impact in an ever-evolving digital landscape. We believe in the
              power of collaboration. By working closely with our clients, we
              align our creative strategies with their business objectives.
            </AnimatedText>
            <AnimatedText delay={0.5}>
              At ISOChrome, we push boundaries, challenge conventions, and shape
              the future of branding. With every campaign, we aim to turn ideas
              into movements, transforming how brands interact with their
              audiences in a rapidly evolving digital world. Creativity is not
              just about aesthetics, it is about impact, engagement, and
              innovation that goes beyond the expected. As pioneers in the
              creative space, we thrive on experimentation and fearless
              execution.
            </AnimatedText>
            <div className="about-copy-img">
              <div className="about-copy-img-wrapper">
                <ParallaxImage
                  base={base}
                  src="/about/about-copy.jpg"
                  alt="ISOChrome creative team at work"
                  speed={0.2}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="expertise">
        <div className="expertise-header">
          <div className="container">
            <div className="row">
              <AnimatedText tag="h1" animateOnScroll={true}>
                What we do best
              </AnimatedText>
              <div className="expertise-img-1">
                <img src={asset(base, "/about/expertise-img-1.jpg")} alt="" />
              </div>
            </div>
            <div className="row">
              <div className="expertise-img-2">
                <img src={asset(base, "/about/expertise-img-2.jpg")} alt="" />
              </div>
            </div>
          </div>
        </div>
        <div className="services">
          <div className="col" />
          <div className="col">
            {SERVICES.map((service) => (
              <div className="service" key={service.n}>
                <AnimatedText tag="h3">{service.n}</AnimatedText>
                <AnimatedText tag="h2">{service.title}</AnimatedText>
                {service.items.map((item) => (
                  <AnimatedText key={item}>{item}</AnimatedText>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-outro-banner">
        <div className="about-outro-img">
          <ParallaxImage
            base={base}
            src="/about/about-outro.jpg"
            alt=""
            speed={0.2}
          />
        </div>
      </section>

      <section className="founder-voice">
        <div className="container">
          <AnimatedText tag="h2">
            "ISOChrome revolutionizes influencer marketing by seamlessly
            connecting brands with powerful voices across social media, crafting
            narratives that leave a lasting impact."
          </AnimatedText>
          <div className="founder-image">
            <img src={asset(base, "/about/founder.jpg")} alt="" />
          </div>
          <div className="founter-info">
            <AnimatedText>Alvah Jehohanan</AnimatedText>
            <AnimatedText>Founder</AnimatedText>
          </div>
        </div>
      </section>

      <section className="client-logos">
        <div className="container">
          <div className="logos-grid">
            {CLIENT_BRANDS.map((brand, index) => (
              <div className="logo-item" key={brand + index}>
                <div className="logo-details">
                  <p>&#9632;</p>
                  <p>{brand}</p>
                </div>
                <img
                  src={asset(
                    base,
                    `/client-logos/${String.fromCharCode(65 + Math.floor(index / 2))}${(index % 2) + 1}.png`,
                  )}
                  alt={`${brand} logo`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const PROJECTS = [
  { id: 1, name: "Horizon Branding", img: "/projects/project-banner-1.jpg" },
  { id: 2, name: "Pulse Digital", img: "/projects/project-banner-2.jpg" },
  { id: 3, name: "Elevate Studios", img: "/projects/project-banner-3.jpg" },
  { id: 4, name: "Nova Marketing", img: "/projects/project-banner-4.jpg" },
  { id: 5, name: "Catalyst Media", img: "/projects/project-banner-5.jpg" },
  { id: 6, name: "Spectrum Design", img: "/projects/project-banner-6.jpg" },
  { id: 7, name: "Vertex Creative", img: "/projects/project-banner-7.jpg" },
];

function Work({ base }: { base: string }) {
  const { navigate } = useNav();
  return (
    <div className="page">
      <section className="work-hero">
        <div className="container">
          <AnimatedText tag="h1" animateOnScroll={false} delay={0.85}>
            From vision to victory
          </AnimatedText>
          <AnimatedText delay={1.1} animateOnScroll={false}>
            Elevating digital marketing excellence through strategic innovation
          </AnimatedText>
        </div>
      </section>
      <section className="projects">
        {PROJECTS.map((project) => (
          <div className="project" key={project.id}>
            <div className="project-banner-img">
              <ParallaxImage base={base} src={project.img} alt={project.name} />
              <div className="project-title">
                <a
                  href="/project"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/project");
                  }}
                >
                  <AnimatedText tag="h1" animateOnScroll={true}>
                    {project.name}
                  </AnimatedText>
                </a>
              </div>
            </div>
          </div>
        ))}
      </section>
      <Footer />
    </div>
  );
}

const PROJECT_STATS = [
  { value: "97.4K", label: "Video Views" },
  { value: "3.8K", label: "Total Engagement" },
  { value: "45.6K", label: "Total Reach" },
  { value: "512", label: "Conversions" },
  { value: "183.7K", label: "Impressions" },
  { value: "4.2K", label: "Interactions" },
];

function Project({ base }: { base: string }) {
  return (
    <div className="page">
      <section className="project-hero">
        <div className="col">
          <div className="project-hero-img">
            <div className="project-hero-img-wrapper">
              <ParallaxImage
                base={base}
                src="/project/project-img-1.jpg"
                alt=""
                speed={0.2}
              />
            </div>
          </div>
        </div>
        <div className="col">
          <div className="container">
            <div className="project-page-title">
              <AnimatedText tag="h1" animateOnScroll={false} delay={1}>
                Pulse Interactive Digital
              </AnimatedText>
            </div>
            <div className="row">
              <div className="sub-col">
                <AnimatedText delay={1.125} animateOnScroll={false}>
                  Client
                </AnimatedText>
                <AnimatedText delay={1.25} tag="h3" animateOnScroll={false}>
                  Northstar Co.
                </AnimatedText>
              </div>
              <div className="sub-col">
                <AnimatedText delay={1.125} animateOnScroll={false}>
                  Services
                </AnimatedText>
                <AnimatedText delay={1.25} tag="h3" animateOnScroll={false}>
                  Content Creation
                </AnimatedText>
              </div>
            </div>
            <div className="row">
              <div className="sub-col" />
              <div className="sub-col">
                <AnimatedText delay={1.5} animateOnScroll={false}>
                  Through collaborative strategy and innovative digital
                  solutions, we helped Northstar establish a stronger online
                  presence.
                </AnimatedText>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="project-info">
        <div className="container">
          <div className="col">
            <AnimatedText tag="h3">Summary</AnimatedText>
          </div>
          <div className="col">
            <AnimatedText>
              Pulse Digital partnered with Northstar Innovations to develop a
              comprehensive interactive campaign that would strengthen their
              market position and expand their digital footprint. The project
              focused on creating engaging, conversion-driven content that
              resonated with their target audience while maintaining brand
              consistency across all platforms.
            </AnimatedText>
            <AnimatedText delay={0.15}>
              Our strategy involved a multi-channel approach combining social
              media optimization, content marketing, and targeted digital
              advertising. We developed custom graphics, interactive elements,
              and compelling narratives that highlighted Northstar's innovative
              solutions, with responsive design that adapted seamlessly to
              different devices.
            </AnimatedText>
            <AnimatedText delay={0.3}>
              The results exceeded initial projections, with Northstar
              experiencing a 38% increase in qualified leads and 42% growth in
              social media engagement. Website traffic from organic searches
              improved significantly, and average session duration increased by
              nearly three minutes.
            </AnimatedText>
          </div>
        </div>
      </section>

      <section className="project-info">
        <div className="container">
          <div className="col" />
          <div className="col">
            <div className="project-info-img-1">
              <div className="project-info-img-1-wrapper">
                <ParallaxImage
                  base={base}
                  src="/project/project-img-2.jpg"
                  alt=""
                  speed={0.2}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="project-info">
        <div className="container">
          <div className="col">
            <AnimatedText tag="h3">Strategy</AnimatedText>
          </div>
          <div className="col">
            <AnimatedText>
              We implemented a strategic multi-platform approach for Pulse
              Digital's campaign, beginning with comprehensive audience analysis
              to identify key engagement opportunities. Our tactics included
              custom interactive content for Instagram and LinkedIn, targeted
              Google and Meta ad campaigns with A/B tested creative, and a
              series of thought leadership articles distributed through industry
              newsletters, alongside virtual events and interactive website
              elements that encouraged participation.
            </AnimatedText>
          </div>
        </div>
      </section>

      <section className="project-info">
        <div className="container">
          <div className="col">
            <AnimatedText tag="h3">Campaign Performance</AnimatedText>
          </div>
          <div className="col">
            {PROJECT_STATS.map((stat) => (
              <div className="stat" key={stat.label}>
                <AnimatedText tag="h1" animateOnScroll={true} direction="top">
                  {stat.value}
                </AnimatedText>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="project-preview-img">
        <div className="project-preview-img-wrapper">
          <ParallaxImage
            base={base}
            src="/project/project-img-3.jpg"
            alt=""
            speed={0.2}
          />
        </div>
      </section>

      <section className="project-info project-info-outro">
        <div className="container">
          <div className="col">
            <AnimatedText tag="h3">Execution</AnimatedText>
          </div>
          <div className="col">
            <AnimatedText>
              For the Pulse Digital campaign, we implemented a multi-faceted
              digital strategy centered on audience engagement and conversion
              optimization. Our team developed custom-designed interactive
              elements across all touchpoints, including shoppable Instagram
              posts, targeted LinkedIn content, and a series of
              performance-optimized landing pages.
            </AnimatedText>
            <AnimatedText delay={0.15}>
              Content creation focused on storytelling that highlighted
              Northstar's unique value proposition while addressing specific
              pain points identified through customer research. We deployed A/B
              testing protocols for all key campaign elements, allowing us to
              refine messaging and visual assets based on real-time performance
              data.
            </AnimatedText>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Contact({ base }: { base: string }) {
  const [nyTime, setNyTime] = useState("--:-- EST");
  const [tokyoTime, setTokyoTime] = useState("--:-- JST");
  useEffect(() => {
    const update = () => {
      const opts = (tz: string): Intl.DateTimeFormatOptions => ({
        timeZone: tz,
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      setNyTime(
        `${new Intl.DateTimeFormat("en-US", opts("America/New_York")).format(new Date())} EST`,
      );
      setTokyoTime(
        `${new Intl.DateTimeFormat("en-US", opts("Asia/Tokyo")).format(new Date())} JST`,
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="page">
      <section className="contact-hero">
        <div className="container">
          <AnimatedText tag="h1" animateOnScroll={false} delay={0.85}>
            Collaborating with visionary brands, entrepreneurs, and investors to
            craft bold identities that inspire and leave a lasting mark.
          </AnimatedText>
        </div>
      </section>

      <section className="contact-details">
        <div className="container">
          <div className="row">
            <div className="col">
              <AnimatedText>Let's Build</AnimatedText>
            </div>
            <div className="col">
              <div className="sub-col">
                <AnimatedText>New Collaborations</AnimatedText>
                <AnimatedText>hello@aryank.space</AnimatedText>
              </div>
              <div className="sub-col">
                <AnimatedText>Join ISOChrome</AnimatedText>
                <AnimatedText>hello@aryank.space</AnimatedText>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <AnimatedText>New York</AnimatedText>
            </div>
            <div className="col">
              <div className="sub-col">
                <AnimatedText>245 Fifth Avenue</AnimatedText>
                <AnimatedText>New York, NY 10016</AnimatedText>
                <AnimatedText>USA</AnimatedText>
              </div>
              <div className="sub-col">
                <AnimatedText>{nyTime}</AnimatedText>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <AnimatedText>Tokyo</AnimatedText>
            </div>
            <div className="col">
              <div className="sub-col">
                <AnimatedText>3-5-7 Ginza</AnimatedText>
                <AnimatedText>Chuo-ku, Tokyo 104-0061</AnimatedText>
                <AnimatedText>Japan</AnimatedText>
              </div>
              <div className="sub-col">
                <AnimatedText>{tokyoTime}</AnimatedText>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-banner">
        <div className="contact-banner-bg">
          <ParallaxImage
            base={base}
            src="/contact/banner.jpg"
            alt=""
            speed={0.2}
          />
        </div>
        <div className="contact-banner-cta">
          <AnimatedText tag="h1" animateOnScroll={true}>
            Let's build together
          </AnimatedText>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function RouteView({ path, base }: { path: IsochromeRoute; base: string }) {
  switch (path) {
    case "/about":
      return <About base={base} />;
    case "/work":
      return <Work base={base} />;
    case "/project":
      return <Project base={base} />;
    case "/contact":
      return <Contact base={base} />;
    default:
      return <Home base={base} />;
  }
}

export interface IsochromePageProps {
  assetBase?: string;
  initialPath?: IsochromeRoute;
  className?: string;
  style?: CSSProperties;
}

export default function IsochromePage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className,
  style,
}: IsochromePageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState<IsochromeRoute>(normalizePath(initialPath));
  const base = assetBase.replace(/\/$/, "");

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = (to: IsochromeRoute) => {
    setPath(normalizePath(to));
    const scroller = getScrollParent(rootRef.current);
    scroller.scrollTo({ top: 0 });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <main
      ref={rootRef}
      className={className ? `isochrome-page ${className}` : "isochrome-page"}
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet
        dangerouslySetInnerHTML={{ __html: getIsochromePageStyles(assetBase) }}
      />
      <NavContext.Provider value={{ navigate, assetBase }}>
        <ScrollerSetup rootRef={rootRef} />
        <Nav />
        <RouteView path={path} base={base} />
      </NavContext.Provider>
    </main>
  );
}

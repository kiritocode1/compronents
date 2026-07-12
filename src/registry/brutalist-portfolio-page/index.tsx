"use client";

/**
 * Brutalist Portfolio Page - a faithful port of the Brutal Portfolio template.
 * Ships the routed home (cursor image-trail), about, and case-studies pages
 * behind a lightweight internal router (no multi-page navigation). The original
 * TweenMax image trail is reimplemented with gsap 3, scoped to the component and
 * aligned to its own bounding box. Fonts and images are Blob-hosted.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { getBrutalistPortfolioPageStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/brutalist-portfolio-page";

export const BRUTALIST_PORTFOLIO_PAGE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/case-studies", label: "Case Studies" },
  { path: "/about", label: "About" },
] as const;

export type BrutalistRoute =
  (typeof BRUTALIST_PORTFOLIO_PAGE_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(
  BRUTALIST_PORTFOLIO_PAGE_ROUTES.map((r) => r.path),
);

function normalizePath(path: string | undefined): BrutalistRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/(.)\/$/, "$1") || "/";
  return ROUTE_SET.has(normalized) ? (normalized as BrutalistRoute) : "/";
}

interface NavContextValue {
  navigate: (to: BrutalistRoute) => void;
}
const NavContext = createContext<NavContextValue>({ navigate: () => {} });
const useNav = () => useContext(NavContext);

function RouteLink({
  to,
  children,
}: {
  to: BrutalistRoute;
  children: ReactNode;
}) {
  const { navigate } = useNav();
  return (
    <a
      href={to}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function Nav({ light }: { light?: boolean }) {
  return (
    <nav id={light ? "light" : undefined}>
      <div className="nav-logo">
        <div className="nav-link">
          <RouteLink to="/">GC</RouteLink>
        </div>
      </div>
      <div className="nav-links">
        <div className="nav-link">
          <a href="mailto:hello@aryank.space">Contact</a>
        </div>
        <div className="nav-link">
          <a
            href="https://www.linkedin.com/in/kiritocode1/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
        <div className="nav-link">
          <RouteLink to="/case-studies">Case Studies</RouteLink>
        </div>
        <div className="nav-link">
          <RouteLink to="/about">About</RouteLink>
        </div>
      </div>
    </nav>
  );
}

function Footer({ variant }: { variant?: "light" | "relative" }) {
  return (
    <footer id={variant}>
      <div className="footer-col">
        <p>Current:</p>
        <p>Google, UIUX Design</p>
        <p>(Part of Alphbt Inc.)</p>
      </div>
      <div className="footer-col">
        <p>Previously</p>
        <p>Apple, Frontend Dev</p>
        <p>Contract, Full-time</p>
      </div>
      <div className="footer-col">
        <p>Toronto</p>
        <p>GTA, Ontario</p>
        <p>Canada</p>
      </div>
    </footer>
  );
}

const IMAGES = ["01", "02", "03", "04", "05", "06", "07", "08", "09"];

function useImageTrail(
  rootRef: React.RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    const content = root?.querySelector<HTMLElement>(".content");
    if (!root || !content) return;
    const imgs = Array.from(
      content.querySelectorAll<HTMLElement>(".content__img"),
    );
    if (!imgs.length) return;

    let raf = 0;
    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
    const mouse = { x: 0, y: 0 };
    const last = { x: 0, y: 0 };
    const cache = { x: 0, y: 0 };
    let idx = 0;
    let z = 1;
    const threshold = 100;

    const onMove = (ev: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      mouse.x = ev.clientX - rect.left;
      mouse.y = ev.clientY - rect.top;
    };
    window.addEventListener("mousemove", onMove);

    const showNext = () => {
      const el = imgs[idx];
      const w = el.offsetWidth || 250;
      const h = el.offsetHeight || 350;
      gsap.killTweensOf(el);
      gsap
        .timeline()
        .set(
          el,
          {
            opacity: 1,
            scale: 1,
            zIndex: z,
            x: cache.x - w / 2,
            y: cache.y - h / 2,
          },
          0,
        )
        .to(
          el,
          {
            duration: 0.9,
            ease: "expo.out",
            x: mouse.x - w / 2,
            y: mouse.y - h / 2,
          },
          0,
        )
        .to(el, { duration: 1, ease: "power1.out", opacity: 0 }, 0.4)
        .to(el, { duration: 1, ease: "quint.out", scale: 0.2 }, 0.4);
    };

    const render = () => {
      const dist = Math.hypot(mouse.x - last.x, mouse.y - last.y);
      cache.x = lerp(cache.x || mouse.x, mouse.x, 0.1);
      cache.y = lerp(cache.y || mouse.y, mouse.y, 0.1);
      if (dist > threshold) {
        showNext();
        z += 1;
        idx = idx < imgs.length - 1 ? idx + 1 : 0;
        last.x = mouse.x;
        last.y = mouse.y;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      for (const el of imgs) gsap.killTweensOf(el);
    };
  }, [rootRef, active]);
}

function Home({ base }: { base: string }) {
  return (
    <div className="container">
      <main>
        <div className="content">
          {IMAGES.map((n) => (
            <img
              className="content__img"
              src={`${base}/images/${n}.png`}
              alt=""
              key={n}
            />
          ))}
        </div>
      </main>
      <Nav />
      <header>
        <p id="name">Gilberto Cunningham</p>
        <p>Creative Designer and Developer</p>
        <p>Frontend, Backend</p>
      </header>
      <Footer />
    </div>
  );
}

function About() {
  return (
    <div className="container" id="dark">
      <Nav light />
      <section className="about">
        <div className="about-col">
          <p>Hello!</p>
          <p>
            I am a designer and developer who treats interfaces as objects with
            weight and edges. I like systems that show their seams, type that
            fills the frame, and interactions you can feel more than notice.
          </p>
          <p>
            Ten years in, I still start every project the same way: strip it
            back to the one thing it has to do, then build outward until the
            details earn their place.
          </p>
        </div>
        <div className="about-col">
          <p>Experience (10+ years)</p>
          <p>
            Across product design and front-end engineering, I have shipped
            brand systems, design tooling, and marketing sites for teams that
            care about craft. I move between Figma and the codebase so nothing
            gets lost in the handoff, and I keep performance in view the whole
            way through.
          </p>
          <p>Awards (25+)</p>
          <p>
            The work has been recognized by Awwwards, CSS Design Awards, and a
            handful of juries who reward taking the harder, sharper route.
          </p>
        </div>
      </section>
      <Footer variant="light" />
    </div>
  );
}

const STUDIES = [
  {
    category: "Tocne App",
    project: "project-1",
    name: "Token Web v2",
    year: "2023",
  },
  {
    category: "SSY",
    project: "project-2",
    name: "Crypto App Taxes",
    year: "2019",
  },
  {
    category: "Personal",
    project: "project-3",
    name: "Nothing 11+ Notes",
    year: "2021",
  },
  {
    category: "Blink Studios",
    project: "project-4",
    name: "Broken Brand",
    year: "2017",
  },
  {
    category: "D-Reel",
    project: "project-5",
    name: "Mutual Ecommerce",
    year: "2022",
  },
  {
    category: "Note App",
    project: "project-6",
    name: "Note App Web v2",
    year: "2023",
  },
  {
    category: "TQE",
    project: "project-7",
    name: "Colors App Taxes",
    year: "2019",
  },
  {
    category: "Personal",
    project: "project-8",
    name: "Nothing 13+ Notes",
    year: "2021",
    final: true,
  },
];

function CaseStudies() {
  return (
    <div className="container">
      <div className="gradient" />
      <Nav />
      <section className="studies">
        {STUDIES.map((study) => (
          <div
            className="study"
            id={study.final ? "final-study" : undefined}
            key={study.name}
          >
            <div className="study-category">{study.category}</div>
            <div className="study-icon">
              <div className="study-icon-img" id={study.project} />
            </div>
            <div className="study-name">{study.name}</div>
            <div className="study-year">{study.year}</div>
          </div>
        ))}
      </section>
      <Footer variant="relative" />
    </div>
  );
}

export interface BrutalistPortfolioPageProps {
  assetBase?: string;
  initialPath?: BrutalistRoute;
  className?: string;
  style?: CSSProperties;
}

export default function BrutalistPortfolioPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className,
  style,
}: BrutalistPortfolioPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState<BrutalistRoute>(normalizePath(initialPath));
  const base = assetBase.replace(/\/$/, "");

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  useImageTrail(rootRef, path === "/");

  const navigate = (to: BrutalistRoute) => setPath(normalizePath(to));

  return (
    <main
      ref={rootRef}
      className={
        className
          ? `brutalist-portfolio-page ${className}`
          : "brutalist-portfolio-page"
      }
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet
        dangerouslySetInnerHTML={{
          __html: getBrutalistPortfolioPageStyles(assetBase),
        }}
      />
      <NavContext.Provider value={{ navigate }}>
        {path === "/about" ? (
          <About />
        ) : path === "/case-studies" ? (
          <CaseStudies />
        ) : (
          <Home base={base} />
        )}
      </NavContext.Provider>
    </main>
  );
}

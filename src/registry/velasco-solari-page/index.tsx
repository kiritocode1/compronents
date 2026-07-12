"use client";

/**
 * Velasco Solari Page - a faithful port of the Velasco Solari director portfolio
 * template. Ships the routed home, work, overview, mustang, info, and sample
 * project pages behind a lightweight internal router (no react-router), with the
 * original nav, hover-reactive work grid and overview table, and Vimeo showreels
 * embedded as native background players. Fonts and images are Blob-hosted.
 *
 * BLANK - aryank.space
 */

import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { getVelascoSolariPageStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/velasco-solari-page";

export const VELASCO_SOLARI_PAGE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/work", label: "Work" },
  { path: "/overview", label: "Overview" },
  { path: "/mustang", label: "Mustang" },
  { path: "/info", label: "Info" },
  { path: "/sample-project", label: "Sample Project" },
] as const;

export type VelascoSolariRoute =
  (typeof VELASCO_SOLARI_PAGE_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(
  VELASCO_SOLARI_PAGE_ROUTES.map((r) => r.path),
);

function normalizePath(path: string | undefined): VelascoSolariRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/(.)\/$/, "$1") || "/";
  return ROUTE_SET.has(normalized) ? (normalized as VelascoSolariRoute) : "/";
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
  navigate: (to: VelascoSolariRoute) => void;
  assetBase: string;
}

const NavContext = createContext<NavContextValue>({
  navigate: () => {},
  assetBase: DEFAULT_ASSET_BASE,
});

function useNav() {
  return useContext(NavContext);
}

function RouteLink({
  to,
  className,
  children,
}: {
  to: VelascoSolariRoute;
  className?: string;
  children?: ReactNode;
}) {
  const { navigate } = useNav();
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

function VimeoBg({ id, title }: { id: string | number; title: string }) {
  return (
    <iframe
      src={`https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1&autopause=0`}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}

function Nav() {
  return (
    <div className="nav">
      <div className="logo">
        <div className="nav-item">
          <RouteLink to="/">velasco solari</RouteLink>
        </div>
      </div>
      <div className="links">
        <div className="nav-item">
          <RouteLink to="/work">work</RouteLink>
        </div>
        <div className="nav-item">
          <RouteLink to="/overview">overview</RouteLink>
        </div>
        <div className="nav-item">
          <RouteLink to="/mustang">mustang</RouteLink>
        </div>
        <div className="nav-item">
          <RouteLink to="/info">info</RouteLink>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      <div className="footer-item">
        <p>represented by none</p>
        <p>utopia@nuance.tv</p>
        <p>34 21 2323 2323</p>
      </div>
      <div className="footer-item footer-links">
        <a
          href="https://x.com/blank_spacets"
          target="_blank"
          rel="noopener noreferrer"
        >
          x
        </a>
        <a
          href="https://github.com/kiritocode1"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="home-page">
      <div className="hero-video">
        <VimeoBg id={509236733} title="Velasco Solari showreel" />
      </div>
      <div className="footer-bottom">
        <Footer />
      </div>
    </div>
  );
}

function WorkItem({
  videoId,
  index,
  workName,
}: {
  videoId: number;
  index: string;
  workName: string;
}) {
  return (
    <div className="work">
      <div className="work-open">
        <RouteLink to="/sample-project" />
      </div>
      <div className="work-video">
        <div className="work-video-wrapper">
          <VimeoBg id={videoId} title={workName} />
        </div>
      </div>
      <div className="work-info">
        <div className="work-index">
          <p>{index}</p>
        </div>
        <div className="work-name">
          <p>{workName}</p>
        </div>
      </div>
    </div>
  );
}

const WORK_ITEMS: { videoId: number; index: string; workName: string }[][] = [
  [
    { videoId: 437808118, index: "01", workName: "Azure Serenity Echoes" },
    { videoId: 871750630, index: "02", workName: "Solar Reverie" },
    { videoId: 477068055, index: "03", workName: "Crimson Symphony Memoirs" },
  ],
  [
    { videoId: 487114118, index: "04", workName: "Neon Galactic Chronicles" },
    { videoId: 366780994, index: "05", workName: "Velvet Dreamscape" },
    { videoId: 659334960, index: "06", workName: "Lunar Symphony" },
  ],
  [
    { videoId: 533729157, index: "07", workName: "Oceanic Memoirs Echoes" },
    { videoId: 500832353, index: "08", workName: "Twilight Dreamscape Saga" },
    { videoId: 510814675, index: "09", workName: "Galactic Odyssey" },
  ],
];

function Work() {
  return (
    <div className="work-page">
      <div className="whitespace-300" />
      <div className="container">
        <div className="works">
          {WORK_ITEMS.map((row, i) => (
            <div className="row" key={`row-${i}`}>
              {row.map((item) => (
                <WorkItem key={item.index} {...item} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="whitespace-300" />
      <Footer />
    </div>
  );
}

const OVERVIEW_PROJECTS: {
  title: string;
  category: string;
  runningTime: string;
  year: number;
}[] = [
  {
    title: "Azure Serenity",
    category: "Commercial",
    runningTime: `53"`,
    year: 2021,
  },
  {
    title: "Crimson Symphony Memoirs",
    category: "Music",
    runningTime: `03' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 17"`,
    year: 2017,
  },
  {
    title: "Velvet Dreamscape",
    category: "Narrative",
    runningTime: `02' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 42"`,
    year: 2020,
  },
  {
    title: "Azure Serenity",
    category: "Commercial",
    runningTime: `53"`,
    year: 2021,
  },
  {
    title: "Crimson Symphony Memoirs",
    category: "Music",
    runningTime: `03' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 17"`,
    year: 2017,
  },
  {
    title: "Velvet Dreamscape",
    category: "Narrative",
    runningTime: `02' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 42"`,
    year: 2020,
  },
  {
    title: "Crimson Symphony Memoirs",
    category: "Music",
    runningTime: `03' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 17"`,
    year: 2017,
  },
  {
    title: "Velvet Dreamscape",
    category: "Narrative",
    runningTime: `02' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 42"`,
    year: 2020,
  },
];

function Overview() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  return (
    <div className="overview-page">
      <div className="whitespace-300" />
      <div className="table">
        <div className="t-row" id="table-header">
          <div className="index">
            <p>#</p>
          </div>
          <div className="title">
            <p>Title</p>
          </div>
          <div className="category">
            <p>Category</p>
          </div>
          <div className="time">
            <p>Running Time</p>
          </div>
          <div className="year">
            <p>Year</p>
          </div>
        </div>
        {OVERVIEW_PROJECTS.map((project, index) => (
          <div
            className={`t-row ${
              hoveredIndex !== null && index !== hoveredIndex
                ? "not-hovered"
                : ""
            }`}
            key={`project-${index}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="index">
              <p>0{index + 1}</p>
            </div>
            <div className="title">
              <p>{project.title}</p>
            </div>
            <div className="category">
              <p>{project.category}</p>
            </div>
            <div className="time">
              {/* biome-ignore lint/security/noDangerouslySetInnerHtml: source running-time uses &nbsp; spacing */}
              <p dangerouslySetInnerHTML={{ __html: project.runningTime }} />
            </div>
            <div className="year">
              <p>{project.year}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <Footer />
      </div>
    </div>
  );
}

const BIO_PARAGRAPHS = [
  "My lifelong aspiration was to become a cartographer. Ever since I was young, I would sketch maps and envision vast terrains. There was always something deeply compelling about the visual aspect for me. As time went on, my interest evolved into storytelling. It was when I encountered the world of cinema and photography that things clicked for me. I realized that visual art and storytelling, the craft of map-making and narrative weaving, could converge in the creation of scripts and the birth of characters from the ground up. This marked the beginning of my dream turning into tangible reality.",
  "Pursuing my education, I earned a degree in Film Studies. The enchanting and intricate world of cinema completely engulfed me. My fascination with fictional narratives grew profoundly during my time at EFTI's International Film Master, where I delved deeper into the art form. It was a journey that further solidified my path and passion in the realm of visual storytelling.",
  "Velasco Solari, a name that I came to embrace, became synonymous with my journey. My experiences at EFTI opened a myriad of opportunities where I could blend my early love for cartography with my newfound passion for cinema. Every script I wrote, every scene I envisioned, was a map of its own, a landscape of emotions, stories, and characters waiting to be navigated and explored. The amalgamation of my childhood dreams and my professional aspirations crafted a unique path that I walked with fervor and dedication, making each step a testament to my commitment to the art of visual and narrative storytelling.",
];

function Bio() {
  return (
    <div className="info-copy">
      {BIO_PARAGRAPHS.map((paragraph, i) => (
        <div key={`bio-${i}`}>
          {i > 0 ? <br /> : null}
          <p>{paragraph}</p>
        </div>
      ))}
    </div>
  );
}

function Mustang() {
  return (
    <div className="mustang-page">
      <div className="mustang-video">
        <div className="hero-video">
          <VimeoBg id={366780994} title="Mustang film" />
        </div>
      </div>
      <div className="whitespace-300" />
      <div className="container">
        <div className="info-row">
          <div className="info-col">
            <Bio />
          </div>
          <div className="info-col img" />
        </div>
      </div>
      <div className="footer-bottom">
        <Footer />
      </div>
    </div>
  );
}

function Info() {
  return (
    <div className="info-page">
      <div className="whitespace-300" />
      <div className="container">
        <div className="info-row">
          <div className="info-col">
            <div className="info-contact">
              <p className="header">represented by</p>
              <p>none at nuance</p>
              <p>utopia@lagnuanceence.tv</p>
              <p>34 232 983 24</p>
            </div>
            <div className="info-copy">
              <p className="header">about</p>
              {BIO_PARAGRAPHS.map((paragraph, i) => (
                <div key={`about-${i}`}>
                  {i > 0 ? <br /> : null}
                  <p>{paragraph}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="info-col img">
            <div className="info-imgs" />
          </div>
        </div>
        <div className="info-row info-row-2">
          <div className="info-col">
            <div className="info-img-2">
              <div className="img-2" />
            </div>
          </div>
          <div className="info-col">
            <div className="info-contact-2">
              <p className="header">contact</p>
              <p>hello@aryank.space</p>
              <p>23 234 234 23</p>
              <p>
                <a
                  href="https://x.com/blank_spacets"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  x
                </a>
              </p>
              <p>
                <a
                  href="https://www.linkedin.com/in/kiritocode1/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SAMPLE_IMAGE_ROWS = [
  ["07.jpg", "08.jpg"],
  ["01.jpg"],
  ["02.jpg", "03.jpg"],
  ["04.jpg"],
  ["05.jpg", "06.jpg"],
];

function SampleProject() {
  const { assetBase } = useNav();
  const base = assetBase.replace(/\/$/, "");
  return (
    <div className="sameple-project-page">
      <div className="project-info">
        <div className="project-index">
          <p>02</p>
        </div>
        <div className="project-name">
          <p>Neon Galactic Chronicles</p>
        </div>
        <div className="project-duration">
          <p>00' 43'' / 03' 17''</p>
        </div>
        <div className="project-description">
          <p>
            Music video for Eva Sola's new single called Punal. Tells the story
            of a broken relationship that falls into the abyss through an
            intimate and violent choreography.
          </p>
        </div>
        <div className="project-year">
          <p>2023</p>
        </div>
      </div>

      <div className="whitespace-35vh" />

      <div className="project-preview">
        <div className="project-preview-col d-only" />
        <div className="project-preview-col">
          <div className="work-video">
            <div className="work-video-wrapper">
              <VimeoBg id={509236733} title="Neon Galactic Chronicles" />
            </div>
          </div>
        </div>
      </div>

      <div className="sample-images">
        {SAMPLE_IMAGE_ROWS.map((row, i) => (
          <div className="s-row" key={`s-row-${i}`}>
            {row.map((file) => (
              <div className="img" key={file}>
                <img src={`${base}/project-images/${file}`} alt="" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="project-nav">
        <div className="link">
          <RouteLink to="/">prev</RouteLink>
        </div>
        <div className="link">
          <RouteLink to="/">next</RouteLink>
        </div>
      </div>
    </div>
  );
}

function RouteView({ path }: { path: VelascoSolariRoute }) {
  switch (path) {
    case "/work":
      return <Work />;
    case "/overview":
      return <Overview />;
    case "/mustang":
      return <Mustang />;
    case "/info":
      return <Info />;
    case "/sample-project":
      return <SampleProject />;
    default:
      return <Home />;
  }
}

export interface VelascoSolariPageProps {
  assetBase?: string;
  initialPath?: VelascoSolariRoute;
  className?: string;
  style?: CSSProperties;
}

export default function VelascoSolariPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className,
  style,
}: VelascoSolariPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState<VelascoSolariRoute>(
    normalizePath(initialPath),
  );

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = useCallback((to: VelascoSolariRoute) => {
    const next = normalizePath(to);
    setPath(next);
    const scroller = getScrollParent(rootRef.current);
    if (scroller instanceof Window) scroller.scrollTo({ top: 0 });
    else scroller.scrollTo({ top: 0 });
  }, []);

  return (
    <main
      ref={rootRef}
      className={
        className ? `velasco-solari-page ${className}` : "velasco-solari-page"
      }
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet
        dangerouslySetInnerHTML={{
          __html: getVelascoSolariPageStyles(assetBase),
        }}
      />
      <NavContext.Provider value={{ navigate, assetBase }}>
        <Nav />
        <RouteView path={path} />
      </NavContext.Provider>
    </main>
  );
}

"use client";

/**
 * Null Studio Page - a faithful port of the Null Studio agency template. Ships
 * the routed home, projects, about (with a draggable auto-playing team
 * carousel), sample project (custom video player and collapsible copy), careers,
 * and contact pages behind a lightweight internal router. The fullscreen overlay
 * menu, carousel, and interactions are rebuilt with React state and CSS (no
 * runtime deps). Fonts and images are Blob-hosted.
 *
 * BLANK - aryank.space
 */

import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { getNullStudioPageStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/null-studio-page";

export const NULL_STUDIO_PAGE_ROUTES = [
  { path: "/", label: "Index" },
  { path: "/work", label: "Projects" },
  { path: "/about", label: "About Us" },
  { path: "/contact", label: "Contact" },
  { path: "/careers", label: "Careers" },
  { path: "/work-sample", label: "Sample Project" },
] as const;

export type NullStudioRoute = (typeof NULL_STUDIO_PAGE_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(NULL_STUDIO_PAGE_ROUTES.map((r) => r.path));

function normalizePath(path: string | undefined): NullStudioRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/(.)\/$/, "$1") || "/";
  return ROUTE_SET.has(normalized) ? (normalized as NullStudioRoute) : "/";
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
  navigate: (to: NullStudioRoute) => void;
  assetBase: string;
}
const NavContext = createContext<NavContextValue>({
  navigate: () => {},
  assetBase: DEFAULT_ASSET_BASE,
});
const useNav = () => useContext(NavContext);
const asset = (base: string, file: string) =>
  `${base.replace(/\/$/, "")}/${file}`;

function A({ to, children }: { to: NullStudioRoute; children: ReactNode }) {
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

function Menu() {
  const { navigate } = useNav();
  const [open, setOpen] = useState(false);
  const go = (to: NullStudioRoute) => {
    setOpen(false);
    navigate(to);
  };
  return (
    <>
      <button
        type="button"
        className={`menu-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        style={{ background: "none", border: "none" }}
      >
        <div className="toggle-icon">
          <span>+</span>
        </div>
      </button>
      <div className={`menu ${open ? "open" : ""}`}>
        {NULL_STUDIO_PAGE_ROUTES.filter((r) => r.path !== "/work-sample").map(
          (r) => (
            <div className="menu-link" key={r.path}>
              <a
                href={r.path}
                onClick={(e) => {
                  e.preventDefault();
                  go(r.path);
                }}
              >
                {r.label}
              </a>
              <span>+</span>
            </div>
          ),
        )}
      </div>
    </>
  );
}

function Footer({ light }: { light?: boolean }) {
  return (
    <footer id={light ? "light" : undefined}>
      <p>&copy; whitespace 2023</p>
      <p id="address">2489 Westwood Avenue, Two Harbors, MN 55616</p>
      <p>
        <a
          href="https://x.com/blank_spacets"
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
      </p>
    </footer>
  );
}

function Header({ home }: { home?: boolean }) {
  return (
    <div className="header">
      <div className="hero-logo">
        <A to="/">Null</A>
      </div>
      {home ? (
        <div className="hero-copy">
          <p>
            An autonomous agency that stands at the <span>forefront</span> of{" "}
            <span>innovation</span>, championing a{" "}
            <span>revolutionary approach</span> to defining success for brands.
            This approach places emphasis on <span>genuine</span> work and{" "}
            <span>realities</span>.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Home({ base }: { base: string }) {
  return (
    <div className="container" id="home">
      <Header home />
      <div className="article" id="hero-article">
        <div className="article-img" id="article-img-1">
          <img src={asset(base, "images/home/hero.jpg")} alt="" />
        </div>
        <div className="article-copy">
          <div className="article-title">
            <p>
              <A to="/about">Null Studios</A>
            </p>
            <span>(Creative Agency)</span>
          </div>
          <div className="article-text">
            <p>
              We are a compact studio built around brand strategy, identity, and
              the digital surfaces that carry them. We take on a handful of
              partners at a time so the work stays sharp and the thinking stays
              ours.
            </p>
            <div className="article-link">
              <A to="/about">Explore Studio</A>
            </div>
          </div>
        </div>
      </div>
      <div className="article-row">
        <div className="article-col">
          <div className="article" id="hero-article">
            <div className="article-img" id="article-img-2">
              <img src={asset(base, "images/home/article-1.jpg")} alt="" />
            </div>
            <div className="article-copy">
              <div className="article-title">
                <p>
                  <A to="/work">View All Work</A>
                </p>
                <span>(Selected Projects)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="article-col">
          <div className="article" id="hero-article">
            <div className="article-img" id="article-img-3">
              <img src={asset(base, "images/home/article-2.jpg")} alt="" />
            </div>
            <div className="article-copy">
              <div className="article-title">
                <p>
                  <A to="/about">About Us</A>
                </p>
                <span>(Know The Team)</span>
              </div>
              <div className="article-text">
                <p>
                  A small group of designers, developers, and writers who would
                  rather make one memorable thing than ten forgettable ones. We
                  work closely, argue kindly, and ship work we are willing to
                  put our name on.
                </p>
                <div className="article-link">
                  <A to="/about">Learn More</A>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const TEAM = [
  { img: "team-1.jpg", name: "Gor Keghart", role: "Sales Manager" },
  { img: "team-2.jpg", name: "Geghard Toros", role: "Web Developer" },
  { img: "team-3.jpg", name: "Khazhak Aleks", role: "Online Teacher" },
  { img: "team-5.jpg", name: "Bedros Taniel", role: "Freelancer" },
  { img: "team-6.jpg", name: "Ara Hakob", role: "Bank Manager" },
  { img: "team-7.jpg", name: "Toros Tigran", role: "App Designer" },
];

function Carousel({ base }: { base: string }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const drag = useRef({ down: false, startX: 0, startScroll: 0 });

  const step = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".card");
    const w = card ? card.offsetWidth + 16 : track.clientWidth / 4;
    track.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const id = setInterval(() => {
      if (track.matches(":hover")) return;
      const card = track.querySelector<HTMLElement>(".card");
      const w = card ? card.offsetWidth + 16 : track.clientWidth / 4;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: w, behavior: "smooth" });
      }
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      down: true,
      startX: e.pageX,
      startScroll: track.scrollLeft,
    };
    track.classList.add("dragging");
  };
  const onMove = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track || !drag.current.down) return;
    track.scrollLeft =
      drag.current.startScroll - (e.pageX - drag.current.startX);
  };
  const onUp = () => {
    drag.current.down = false;
    trackRef.current?.classList.remove("dragging");
  };

  return (
    <div className="wrapper">
      <button
        type="button"
        className="arrow left"
        onClick={() => step(-1)}
        aria-label="Previous"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M15 18l-6-6 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <ul
        className="carousel"
        ref={trackRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        {TEAM.map((member) => (
          <li className="card" key={member.name}>
            <div className="img">
              <img
                src={asset(base, `images/about/${member.img}`)}
                alt=""
                draggable={false}
              />
            </div>
            <h2>{member.name}</h2>
            <span>{member.role}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="arrow right"
        onClick={() => step(1)}
        aria-label="Next"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

const SERVICES = [
  {
    name: "Creative",
    copy: "Identity systems, art direction, and campaign worlds built to be remembered, not just approved.",
  },
  {
    name: "Influencer",
    copy: "Partnerships that read as genuine because we cast for fit and voice before reach.",
  },
  {
    name: "Experiential",
    copy: "Launches, installations, and moments people want to stand inside and share.",
  },
  {
    name: "Strategy",
    copy: "Positioning and narrative that give every later decision something true to answer to.",
  },
];

const CLIENT_LOGOS = [
  "logo-1.webp",
  "logo-2.webp",
  "logo-3.webp",
  "logo-4.webp",
  "logo-5.webp",
  "logo-6.webp",
  "logo-1.webp",
  "logo-2.webp",
  "logo-3.webp",
  "logo-4.webp",
  "logo-5.webp",
  "logo-6.webp",
];

function About({ base }: { base: string }) {
  return (
    <>
      <div className="container">
        <Header />
        <div className="about-hero-img">
          <img src={asset(base, "images/about/about-hero.jpg")} alt="" />
        </div>
        <div className="about-copy">
          <div className="about-copy-col">
            <h1>
              We are <br />
              Nulls
            </h1>
          </div>
          <div className="about-copy-col">
            <p>
              Null began as a reaction to work that looked busy and said
              nothing. We build brands the slow way: understand the thing, find
              the one true idea, and give it a form sharp enough to last.
            </p>
            <br />
            <p>
              We stay small on purpose. Every project runs through the same few
              hands, so the craft is consistent and the accountability is
              obvious.
            </p>
          </div>
        </div>
      </div>
      <div className="slider-wrapper">
        <h1>Our Team</h1>
        <Carousel base={base} />
      </div>
      <div className="container">
        <div className="services">
          <h1>Services</h1>
          <div className="services-cols">
            {SERVICES.map((service) => (
              <div className="service" key={service.name}>
                <h1>{service.name}</h1>
                <p>{service.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="clients">
        <h1>Selected Clients</h1>
        <div className="clients-container">
          {[0, 1, 2].map((row) => (
            <div className="c-row" key={`crow-${row}`}>
              {CLIENT_LOGOS.slice(row * 4, row * 4 + 4).map((logo, i) => (
                <div className="c-item" key={`c-${row}-${i}`}>
                  <img src={asset(base, `images/about/${logo}`)} alt="" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <Footer light />
      </div>
    </>
  );
}

const WORK_ITEMS = [
  { img: "project-1.jpg", name: "Ember", category: "Art Direction", big: true },
  { img: "project-2.jpg", name: "Scratcher", category: "UIUX" },
  { img: "project-2.jpg", name: "Synthesis", category: "Development" },
  { img: "project-2.jpg", name: "Liquid Soil", category: "App Design" },
  {
    img: "project-2.jpg",
    name: "Wars",
    category: "Music Production",
    big: true,
  },
  { img: "project-2.jpg", name: "Whitespace", category: "Concept Art" },
  { img: "project-2.jpg", name: "Elastic", category: "Web Design" },
  { img: "project-2.jpg", name: "Nova", category: "Marketing" },
];

function WorkArticle({
  item,
  base,
  imgId,
}: {
  item: (typeof WORK_ITEMS)[number];
  base: string;
  imgId: string;
}) {
  return (
    <div className="article" id="hero-article">
      <div className="article-img" id={imgId}>
        <A to="/work-sample">
          <img src={asset(base, `images/work/${item.img}`)} alt="" />
        </A>
      </div>
      <div className="article-copy">
        <div className="article-title">
          <p>
            <A to="/work-sample">{item.name}</A>
          </p>
          <span>({item.category})</span>
        </div>
      </div>
    </div>
  );
}

function Work({ base }: { base: string }) {
  return (
    <div className="container">
      <Header />
      <div className="work-container">
        <WorkArticle item={WORK_ITEMS[0]} base={base} imgId="article-img-1" />
        <div className="article-row">
          <div className="article-col">
            <WorkArticle
              item={WORK_ITEMS[1]}
              base={base}
              imgId="article-img-2"
            />
          </div>
          <div className="article-col">
            <WorkArticle
              item={WORK_ITEMS[2]}
              base={base}
              imgId="article-img-3"
            />
            <WorkArticle
              item={WORK_ITEMS[3]}
              base={base}
              imgId="article-img-3"
            />
          </div>
        </div>
        <WorkArticle item={WORK_ITEMS[4]} base={base} imgId="article-img-1" />
        <div className="article-row">
          <div className="article-col">
            <WorkArticle
              item={WORK_ITEMS[5]}
              base={base}
              imgId="article-img-3"
            />
            <WorkArticle
              item={WORK_ITEMS[6]}
              base={base}
              imgId="article-img-3"
            />
          </div>
          <div className="article-col">
            <WorkArticle
              item={WORK_ITEMS[7]}
              base={base}
              imgId="article-img-2"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function WorkSample({ base }: { base: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) v.play();
    else v.pause();
  };
  return (
    <div className="container">
      <Header />
      <div className="work-video">
        <div className="video-wrapper">
          <div className="video-container">
            <video
              ref={videoRef}
              controls
              preload="metadata"
              poster={asset(base, "images/work/project-4.jpg")}
              onPlaying={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            >
              <source
                src="https://cdn.jsdelivr.net/npm/big-buck-bunny-1080p@0.0.6/video.mp4"
                type="video/mp4"
              />
              <track kind="captions" />
            </video>
            <div className="play-button-wrapper">
              <button
                type="button"
                className="circle-play-b"
                onClick={toggle}
                aria-label="Play video"
                style={{ opacity: playing ? 0 : 1 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
                  <path d="M40 0a40 40 0 1040 40A40 40 0 0040 0zM36 48V32L54 40z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="article-copy" id="article-work-copy">
        <div className="article-title">
          <p>
            <a
              href="https://aryank.space"
              target="_blank"
              rel="noopener noreferrer"
            >
              Check Live
            </a>
          </p>
          <span>(Est 2021)</span>
        </div>
        <div className="article-text">
          <h3>A launch film for a brand that wanted to feel inevitable.</h3>
          <div className={`collapsible ${expanded ? "open" : ""}`}>
            <p>
              The brief was a single line: make people believe this already
              exists everywhere. We built the identity around one confident
              gesture and let everything else stay quiet.
            </p>
            <br />
            <p>
              From there we designed the site, the film, and the social system
              as one continuous idea, so the story reads the same whether you
              meet it in three seconds or three minutes. Motion carried the
              tone; type carried the message.
            </p>
            <br />
            <p>
              It shipped in six weeks with a small team and no wasted frames.
              The client kept the system and has been extending it since, which
              is the outcome we care about most.
            </p>
          </div>
          <button
            type="button"
            className="article-link toggler"
            onClick={() => setExpanded((v) => !v)}
            style={{ background: "none", font: "inherit", cursor: "pointer" }}
          >
            <span style={{ fontFamily: "inherit" }}>
              {expanded ? "Read Less" : "Read More"}
            </span>
          </button>
        </div>
      </div>
      <div className="project-images">
        {[0, 1, 2, 3].map((row) => (
          <div className="img-row" key={`imgrow-${row}`}>
            {(row % 2 === 0 ? [0, 1] : [0]).map((c) => (
              <div className="i-col" key={`icol-${row}-${c}`}>
                <div className="project-img">
                  <img src={asset(base, "images/work/project-2.jpg")} alt="" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="work-page">
        <h1>
          <A to="/work">View All Work</A>
        </h1>
      </div>
      <Footer />
    </div>
  );
}

const JOBS = [
  "Creative Director",
  "Designer",
  "Manager",
  "Intern",
  "Sales Manager",
];

function Careers() {
  return (
    <div className="container">
      <Header />
      <div className="cards">
        {JOBS.map((job) => (
          <div className="card" key={job}>
            <div className="card-title">
              <h1>{job}</h1>
            </div>
            <div className="card-location">
              <p>Los Angeles, CA</p>
              <p className="expand-sign">+</p>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

function Contact({ base }: { base: string }) {
  return (
    <div className="container">
      <Header />
      <div className="tiles">
        <div className="tile">
          <img src={asset(base, "images/home/hero.jpg")} alt="" />
        </div>
        <div className="tile">
          <div className="tile-1" id="tile-dark">
            <h1>Email Us</h1>
            <p>
              <a href="mailto:hello@aryank.space">hello@aryank.space</a>
            </p>
          </div>
          <div className="tile-2">
            <h1>Follow Us</h1>
            <div className="tile-links">
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function RouteView({ path, base }: { path: NullStudioRoute; base: string }) {
  switch (path) {
    case "/work":
      return <Work base={base} />;
    case "/about":
      return <About base={base} />;
    case "/contact":
      return <Contact base={base} />;
    case "/careers":
      return <Careers />;
    case "/work-sample":
      return <WorkSample base={base} />;
    default:
      return <Home base={base} />;
  }
}

export interface NullStudioPageProps {
  assetBase?: string;
  initialPath?: NullStudioRoute;
  className?: string;
  style?: CSSProperties;
}

export default function NullStudioPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className,
  style,
}: NullStudioPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState<NullStudioRoute>(normalizePath(initialPath));
  const base = assetBase.replace(/\/$/, "");

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = (to: NullStudioRoute) => {
    setPath(normalizePath(to));
    const scroller = getScrollParent(rootRef.current);
    scroller.scrollTo({ top: 0 });
  };

  return (
    <main
      ref={rootRef}
      className={
        className ? `null-studio-page ${className}` : "null-studio-page"
      }
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet
        dangerouslySetInnerHTML={{ __html: getNullStudioPageStyles(assetBase) }}
      />
      <NavContext.Provider value={{ navigate, assetBase }}>
        <Menu />
        <RouteView path={path} base={base} />
      </NavContext.Provider>
    </main>
  );
}

"use client";

/**
 * Soren Page - a faithful port of the Soren personal portfolio template. Ships
 * the routed home (Spline 3D hero, live clock), work masonry, projects list with
 * scramble text, photos grid, and sample post pages behind a lightweight internal
 * router (no react-router). The magnifying dock, GSAP entrance staggers, and a
 * self-contained scramble hook recreate the source; the Spline scene loads via
 * the official web-component viewer. Images are Blob-hosted.
 *
 * BLANK - aryank.space
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  type CSSProperties,
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FaCamera,
  FaEnvelope,
  FaFolderOpen,
  FaGithub,
  FaHome,
  FaLink,
  FaPalette,
  FaSquareFull,
  FaTwitter,
} from "react-icons/fa";

import { getSorenPageStyles } from "./styles";

gsap.registerPlugin(useGSAP);

export const DEFAULT_ASSET_BASE = "https://ui.aryank.space/assets/soren-page";

const SPLINE_SCENE =
  "https://prod.spline.design/BNaurVSeS57NeyWI/scene.splinecode";
const SPLINE_VIEWER_SRC =
  "https://unpkg.com/@splinetool/viewer/build/spline-viewer.js";

export const SOREN_PAGE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/work", label: "Work" },
  { path: "/projects", label: "Projects" },
  { path: "/photos", label: "Photos" },
  { path: "/post", label: "Post" },
] as const;

export type SorenRoute = (typeof SOREN_PAGE_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(SOREN_PAGE_ROUTES.map((r) => r.path));

function normalizePath(path: string | undefined): SorenRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/(.)\/$/, "$1") || "/";
  return ROUTE_SET.has(normalized) ? (normalized as SorenRoute) : "/";
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
  navigate: (to: SorenRoute) => void;
  assetBase: string;
}

const NavContext = createContext<NavContextValue>({
  navigate: () => {},
  assetBase: DEFAULT_ASSET_BASE,
});

const useNav = () => useContext(NavContext);

/** Minimal scramble reveal, replacing the use-scramble dependency. */
function useScramble(
  text: string,
): React.RefObject<HTMLParagraphElement | null> {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const glyphs = "!<>-_\\/[]{}=+*^?#________";
    const total = text.length;
    let frame = 0;
    const revealEvery = 1.6;
    let raf = 0;
    const render = () => {
      const revealed = Math.floor(frame / revealEvery);
      let out = "";
      for (let i = 0; i < total; i += 1) {
        if (i < revealed || text[i] === " ") out += text[i];
        else out += glyphs[(frame + i) % glyphs.length];
      }
      el.textContent = out;
      frame += 1;
      if (revealed <= total) raf = requestAnimationFrame(render);
      else el.textContent = text;
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return ref;
}

function DockItem({
  IconComponent,
  path,
  external,
  isHovered,
  isNeighbor,
  onMouseEnter,
}: {
  IconComponent: React.ComponentType<{
    size?: string;
    style?: CSSProperties;
  }>;
  path: string;
  external?: boolean;
  isHovered: boolean;
  isNeighbor: boolean;
  onMouseEnter: () => void;
}) {
  const { navigate } = useNav();
  const scale = isHovered ? 2.5 : isNeighbor ? 2 : 1;
  const margin = isHovered || isNeighbor ? "28px" : "4px";
  const style = { transform: `scale(${scale})`, margin: `0 ${margin}` };
  const icon = (
    <div className="dock-item-link-wrap">
      <IconComponent size="14px" style={{ color: "hsl(0, 0%, 50%)" }} />
    </div>
  );
  return (
    <div className="dock-item" style={style} onMouseEnter={onMouseEnter}>
      {external ? (
        <a href={path} target="_blank" rel="noopener noreferrer">
          {icon}
        </a>
      ) : (
        <a
          href={path}
          onClick={(event) => {
            event.preventDefault();
            navigate(normalizePath(path));
          }}
        >
          {icon}
        </a>
      )}
    </div>
  );
}

const DOCK_ICONS = [
  { icon: FaHome, path: "/" },
  { icon: FaPalette, path: "/work" },
  { icon: FaFolderOpen, path: "/projects" },
  { icon: FaCamera, path: "/photos" },
  { icon: FaTwitter, path: "https://twitter.com/codegridweb", external: true },
  { icon: FaGithub, path: "https://github.com/codegrid", external: true },
  { icon: FaEnvelope, path: "mailto:contact@codegridweb.com", external: true },
] as const;

function Dock() {
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const check = () => setEnabled(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      className="dock-container"
      onMouseLeave={() => enabled && setHoveredIndex(-100)}
    >
      <div className="dock">
        {DOCK_ICONS.map((item, index) => (
          <DockItem
            key={item.path}
            IconComponent={item.icon}
            path={item.path}
            external={"external" in item ? item.external : false}
            isHovered={index === hoveredIndex}
            isNeighbor={Math.abs(index - hoveredIndex) === 1}
            onMouseEnter={() => enabled && setHoveredIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <p>{time}</p>
    </div>
  );
}

function SplineHero() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (customElements.get("spline-viewer")) {
      setReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SPLINE_VIEWER_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      if (customElements.get("spline-viewer")) setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = SPLINE_VIEWER_SRC;
    script.addEventListener("load", () => setReady(true));
    document.head.appendChild(script);
  }, []);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        zIndex: 0,
      }}
    >
      {ready ? createElement("spline-viewer", { url: SPLINE_SCENE }) : null}
    </div>
  );
}

function Home() {
  return (
    <>
      <SplineHero />
      <div className="hero-header">
        <h1>Artistry and Engineering</h1>
        <h1>By Soren</h1>
      </div>
      <div className="home-logo">
        <FaSquareFull size="16px" style={{ color: "#fff" }} />
      </div>
      <div className="live-clock">
        <LiveClock />
      </div>
    </>
  );
}

interface WorkEntry {
  img: string;
  height: string;
  type: "blog" | "img" | "article";
}

const WORK_COLUMNS: WorkEntry[][] = [
  [
    { img: "work-18.jpg", height: "300", type: "blog" },
    { img: "work-20.jpg", height: "200", type: "img" },
    { img: "work-3.jpg", height: "500", type: "article" },
    { img: "work-4.jpg", height: "350", type: "blog" },
    { img: "work-21.jpg", height: "250", type: "img" },
    { img: "work-6.jpg", height: "450", type: "article" },
  ],
  [
    { img: "work-10.jpg", height: "200", type: "img" },
    { img: "work-5.jpg", height: "350", type: "article" },
    { img: "work-9.jpg", height: "300", type: "img" },
    { img: "work-10.jpg", height: "450", type: "article" },
    { img: "work-11.jpg", height: "200", type: "blog" },
    { img: "work-12.jpg", height: "450", type: "article" },
    { img: "work-13.jpg", height: "200", type: "img" },
  ],
  [
    { img: "work-7.jpg", height: "250", type: "article" },
    { img: "work-22.jpg", height: "350", type: "img" },
    { img: "work-16.jpg", height: "400", type: "blog" },
    { img: "work-17.jpg", height: "200", type: "img" },
    { img: "work-18.jpg", height: "500", type: "blog" },
    { img: "work-19.jpg", height: "450", type: "img" },
  ],
];

function WorkItem({ entry, base }: { entry: WorkEntry; base: string }) {
  const { navigate } = useNav();
  return (
    <div className={`work-item type-${entry.type}`}>
      <div className={`work-item-img work-${entry.height}`}>
        <div className="work-item-img-wrapper">
          <img src={`${base}/work/${entry.img}`} alt="" />
        </div>
        <div className="work-item-info">
          <p id="work-name">Work Name</p>
          <p id="work-date">April 2024</p>
        </div>
      </div>
      <div className="work-item-cta">
        <a
          href="/post"
          onClick={(event) => {
            event.preventDefault();
            navigate("/post");
          }}
        >
          {entry.type === "blog" ? (
            <button type="button">Read Post</button>
          ) : entry.type === "article" ? (
            <button type="button">View Article</button>
          ) : null}
        </a>
      </div>
    </div>
  );
}

function Work() {
  const { assetBase } = useNav();
  const base = assetBase.replace(/\/$/, "");
  const container = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".col .work-item", { y: 300, stagger: 0.025, opacity: 0 });
    },
    { scope: container },
  );
  return (
    <div className="container page-work" ref={container}>
      {WORK_COLUMNS.map((col, i) => (
        <div className="col" key={`col-${i}`}>
          {col.map((entry, j) => (
            <WorkItem entry={entry} base={base} key={`work-${i}-${j}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

const PROJECT_DATA = [
  {
    title: "Dynamic Web Artistry",
    copy: "Crafting engaging visuals for web",
    year: "2024",
  },
  {
    title: "Interactive Media Design",
    copy: "Blending interactivity with user-centric design",
    year: "2023",
  },
  {
    title: "Mobile UX Innovations",
    copy: "Enhancing mobile experience",
    year: "2025",
  },
  {
    title: "Cloud Solutions Architecture",
    copy: "Building scalable and secure applications",
    year: "2024",
  },
  {
    title: "AI for Predictive Analysis",
    copy: "Integrating AI to predict trends",
    year: "2023",
  },
  {
    title: "Blockchain Development",
    copy: "Developing secure blockchain systems for applications",
    year: "2025",
  },
  {
    title: "Advanced Data Analytics",
    copy: "Utilizing big data to drive enterprise growth",
    year: "2022",
  },
  {
    title: "Virtual Reality Content Creation",
    copy: "Creating immersive VR for education",
    year: "2023",
  },
  {
    title: "E-commerce Optimization",
    copy: "Enhancing online shopping through tailored e-com",
    year: "2024",
  },
  {
    title: "Smart Technologies",
    copy: "Integrating smart technology",
    year: "2025",
  },
];

function ProjectItem({
  title,
  copy,
  year,
}: {
  title: string;
  copy: string;
  year: string;
}) {
  const { navigate } = useNav();
  const titleRef = useScramble(title);
  const copyRef = useScramble(copy);
  return (
    <a
      href="/"
      onClick={(event) => {
        event.preventDefault();
        navigate("/");
      }}
    >
      <div className="project-item">
        <div className="project-title">
          <p ref={titleRef}>{title}</p>
        </div>
        <div className="project-copy">
          <p ref={copyRef}>{copy}</p>
        </div>
        <div className="project-divider" />
        <div className="project-year">
          <p>{year}</p>
        </div>
      </div>
    </a>
  );
}

function Projects() {
  return (
    <div className="container page-projects">
      {PROJECT_DATA.map((project) => (
        <ProjectItem key={project.title} {...project} />
      ))}
    </div>
  );
}

const PHOTO_COLUMNS = [
  [
    "work-1.jpg",
    "work-2.jpg",
    "work-3.jpg",
    "work-4.jpg",
    "work-5.jpg",
    "work-6.jpg",
    "work-7.jpg",
    "work-8.jpg",
  ],
  [
    "work-16.jpg",
    "work-10.jpg",
    "work-11.jpg",
    "work-12.jpg",
    "work-13.jpg",
    "work-14.jpg",
    "work-15.jpg",
    "work-16.jpg",
  ],
  [
    "work-17.jpg",
    "work-18.jpg",
    "work-19.jpg",
    "work-20.jpg",
    "work-21.jpg",
    "work-22.jpg",
    "work-1.jpg",
    "work-2.jpg",
  ],
];

function Photos() {
  const { assetBase } = useNav();
  const base = assetBase.replace(/\/$/, "");
  const container = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".photos-col img", { y: 300, stagger: 0.025, opacity: 0 });
    },
    { scope: container },
  );
  return (
    <div className="container page-photos" ref={container}>
      {PHOTO_COLUMNS.map((col, i) => (
        <div className="photos-col" key={`photos-col-${i}`}>
          {col.map((file, j) => (
            <img src={`${base}/work/${file}`} alt="" key={`photo-${i}-${j}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Post() {
  const { assetBase } = useNav();
  const base = assetBase.replace(/\/$/, "");
  return (
    <div className="container page-post">
      <div className="post-header">
        <div className="post-info">
          <p>Sample Blog Post </p>
          <p>January 2024</p>
        </div>
        <div className="post-link">
          <FaLink size="14px" style={{ color: "hsl(0 0% 60%)" }} />
        </div>
      </div>
      <div className="post-content">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos impedit
          repellat sapiente, rerum pariatur nesciunt in optio? Adipisci tempore
          eligendi eius accusantium explicabo atque expedita quisquam illum,
          voluptates delectus sequi?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit nulla
          quidem ex quod nihil facilis sint non ullam possimus quisquam vitae id
          maiores aliquam, neque atque odio eos laudantium odit sunt? At atque
          aspernatur error facere voluptatibus nulla nobis! Aliquam suscipit
          dolore rerum omnis nesciunt voluptate. Repudiandae in aliquam et nam
          deserunt animi harum magnam nulla vitae. Similique praesentium tempore
          eveniet pariatur. Sequi perspiciatis qui, aperiam consectetur eaque
          reiciendis nostrum.
        </p>
        <div className="post-img post-img-1">
          <img src={`${base}/work/work-2.jpg`} alt="" />
        </div>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia qui
          possimus tempore totam explicabo. Quam commodi aut iusto quos eaque
          deserunt dolore ratione laboriosam numquam consectetur enim quod
          reiciendis sunt molestias, repellat illo ullam animi porro! Nam
          maiores voluptas beatae.
        </p>
        <div className="post-img post-img-2">
          <img src={`${base}/work/work-7.jpg`} alt="" />
        </div>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil quas
          maxime ducimus? Cumque odit soluta quis ipsum dignissimos veritatis,
          quaerat ullam veniam cum ipsam minus iste autem. Quibusdam eum
          accusantium ex suscipit corporis eveniet repudiandae voluptas
          voluptatibus, at voluptatum labore!
        </p>
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Amet maxime
          sapiente reiciendis nesciunt? Illum possimus ab alias assumenda sunt,
          ratione repellat nesciunt sapiente earum delectus voluptates nihil
          repellendus, vel aliquid!
        </p>
      </div>
      <div className="white-space" />
    </div>
  );
}

function RouteView({ path }: { path: SorenRoute }) {
  switch (path) {
    case "/work":
      return <Work />;
    case "/projects":
      return <Projects />;
    case "/photos":
      return <Photos />;
    case "/post":
      return <Post />;
    default:
      return <Home />;
  }
}

export interface SorenPageProps {
  assetBase?: string;
  initialPath?: SorenRoute;
  className?: string;
  style?: CSSProperties;
}

export default function SorenPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className,
  style,
}: SorenPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState<SorenRoute>(normalizePath(initialPath));

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = (to: SorenRoute) => {
    setPath(normalizePath(to));
    const scroller = getScrollParent(rootRef.current);
    scroller.scrollTo({ top: 0 });
  };

  return (
    <main
      ref={rootRef}
      className={className ? `soren-page ${className}` : "soren-page"}
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet
        dangerouslySetInnerHTML={{ __html: getSorenPageStyles() }}
      />
      <NavContext.Provider value={{ navigate, assetBase }}>
        <Dock />
        <RouteView path={path} />
      </NavContext.Provider>
    </main>
  );
}

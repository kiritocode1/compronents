"use client";

/**
 * Unusual Studio Page - a faithful port of the Unusual Designs creative-studio
 * template. Ships the routed home, portfolio, about (with native sticky panels),
 * careers (Lottie), contact, and sample project pages behind a lightweight
 * internal router (no react-router). framer-motion drives the slide page
 * transition, a CSS marquee replaces react-fast-marquee, the Lottie loads via
 * the official web-component player, and locomotive-scroll is dropped for native
 * container scroll. Fonts and images are Blob-hosted.
 *
 * BLANK - aryank.space
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  type CSSProperties,
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { getUnusualStudioPageStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/unusual-studio-page";

const LOTTIE_PLAYER_SRC =
  "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";

export const UNUSUAL_STUDIO_PAGE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/projects", label: "Portfolio" },
  { path: "/about", label: "About Us" },
  { path: "/careers", label: "Careers" },
  { path: "/contact", label: "Contact" },
  { path: "/sample-project-page", label: "Sample Project" },
] as const;

export type UnusualStudioRoute =
  (typeof UNUSUAL_STUDIO_PAGE_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(
  UNUSUAL_STUDIO_PAGE_ROUTES.map((r) => r.path),
);

function normalizePath(path: string | undefined): UnusualStudioRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/(.)\/$/, "$1") || "/";
  return ROUTE_SET.has(normalized) ? (normalized as UnusualStudioRoute) : "/";
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
  navigate: (to: UnusualStudioRoute) => void;
  assetBase: string;
}
const NavContext = createContext<NavContextValue>({
  navigate: () => {},
  assetBase: DEFAULT_ASSET_BASE,
});
const useNav = () => useContext(NavContext);
const asset = (base: string, file: string) =>
  `${base.replace(/\/$/, "")}/${file}`;

function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setTime(
        `${p(now.getHours())} : ${p(now.getMinutes())} : ${p(now.getSeconds())}`,
      );
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function A({ to, children }: { to: UnusualStudioRoute; children: ReactNode }) {
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

function Nav() {
  return (
    <div className="nav">
      <div className="logo">
        <A to="/">Unusual Designs</A>
      </div>
      <div className="nav-items">
        <div className="nav-item">
          <A to="/">• Home</A>
        </div>
        <div className="nav-item">
          <A to="/projects">• Portfolio</A>
        </div>
        <div className="nav-item">
          <A to="/about">• About Us</A>
        </div>
        <div className="nav-item">
          <A to="/careers">• Careers</A>
        </div>
        <div className="nav-item">
          <A to="/contact">• Contact</A>
        </div>
      </div>
    </div>
  );
}

function ContactFooter() {
  const time = useClock();
  return (
    <section className="footer">
      <div className="footer-copy">
        <div className="footer-copy-h1">
          <A to="/contact">
            <h1>Contact</h1>
          </A>
        </div>
        <div className="footer-copy-text">
          <p>Digital creative studio</p>
          <br />
          <p>
            <a
              href="https://x.com/blank_spacets"
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>{" "}
            •{" "}
            <a
              href="https://github.com/kiritocode1"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>{" "}
            •{" "}
            <a
              href="https://www.linkedin.com/in/kiritocode1/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </p>
          <br />
          <p>Toronto, CA {time}</p>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ variant }: { variant: 1 | 2 | 3 | 4 }) {
  return (
    <A to="/sample-project-page">
      <div className="project">
        <div className={`project-img project-img-${variant}`} />
        <div className="project-name">
          <p>Project Name &#8599;</p>
        </div>
        <div className="project-category">
          <p>Project Category</p>
        </div>
      </div>
    </A>
  );
}

function Home({ base }: { base: string }) {
  return (
    <div className="home">
      <section className="hero-img">
        <div className="hero-img-container">
          <img src={asset(base, "images/banner-img.jpg")} alt="" />
        </div>
        <div className="hero-img-copy">
          <div className="hero-img-copy-h1">
            <h1>Unusual</h1>
          </div>
        </div>
      </section>
      <section className="projects">
        <div className="projects-copy">
          <div className="projects-copy-ws" />
          <div className="projects-copy-h1">
            <h1>
              We build brand systems and digital products that refuse to look
              like everyone else.
            </h1>
          </div>
        </div>
        <div className="projects-list">
          <ProjectCard variant={1} />
          <ProjectCard variant={2} />
        </div>
        <div className="projects-list">
          <ProjectCard variant={3} />
          <ProjectCard variant={4} />
        </div>
      </section>
      <section className="article">
        <div className="article-container">
          <div className="article-container-copy">
            <h1>
              Every engagement starts with a question nobody else is asking,
              then we design the answer end to end.
            </h1>
            <A to="/projects">See the work &#8599;</A>
          </div>
        </div>
      </section>
      <section className="services">
        <div className="services-copy-p">
          <span>What we do</span>
        </div>
        <div className="services-copy-h1">
          <h1>
            Brand identity, art direction, web design and build, motion, and the
            interaction details that make a product feel alive.
          </h1>
        </div>
      </section>
      <section className="feature-img">
        <div className="feature-img-container">
          <img src={asset(base, "images/hero-img.jpg")} alt="" />
        </div>
      </section>
      <section className="logos">
        <div className="us-marquee">
          {[0, 1].map((dup) => (
            <div className="client-logos" key={`logos-${dup}`}>
              {Array.from({ length: 8 }, (_, i) => (
                <div className="client-logo" key={`logo-${dup}-${i}`}>
                  <p>Logo {i + 1}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="clients">
        <div className="client-copy">
          <div className="client-copy-p">
            <p>Our clients</p>
            <br />
            <p>
              We partner with founders, cultural institutions, and product teams
              who want work that stands apart. Long engagements, honest
              feedback, and a shared appetite for risk keep the results sharp.
            </p>
            <br />
            <p>
              From first positioning workshop to launch day, one small team
              stays on the project so nothing gets lost in translation.
            </p>
            <br />
            <p>
              We measure success in the second look: the moment someone stops
              scrolling and pays attention.
            </p>
          </div>
          <div className="client-copy-p">
            <p>
              Recent collaborations span fashion, music, fintech, and the arts,
              across identity, packaging, and the screens in between.
            </p>
            <br />
            <p>
              If you have a launch, a rebrand, or a stubborn design problem, we
              would like to hear about it.
            </p>
          </div>
        </div>
      </section>
      <ContactFooter />
    </div>
  );
}

function Projects() {
  return (
    <div className="projects-container">
      <section className="projects">
        <div className="projects-copy">
          <div className="projects-copy-ws" />
          <div className="projects-copy-h1">
            <h1>
              Selected work across identity, product, and the moving image.
            </h1>
          </div>
        </div>
        <div className="projects-list">
          <ProjectCard variant={1} />
          <ProjectCard variant={2} />
        </div>
        <div className="projects-list">
          <ProjectCard variant={3} />
          <ProjectCard variant={4} />
        </div>
        <div className="projects-list">
          <ProjectCard variant={1} />
          <ProjectCard variant={2} />
        </div>
        <div className="projects-list">
          <ProjectCard variant={3} />
          <ProjectCard variant={4} />
        </div>
      </section>
      <ContactFooter />
    </div>
  );
}

function About({ base }: { base: string }) {
  return (
    <div className="about smooth-scroll">
      <section className="hero-img">
        <div className="hero-img-container">
          <img src={asset(base, "images/about-hero.jpg")} alt="" />
        </div>
      </section>
      <section className="about-us">
        <div className="about-us-copy">
          <div className="about-us-copy-p">
            <span>About Us</span>
            <br />
            <p>
              Unusual Designs is a small studio with a wide remit. We move
              between strategy, identity, and engineering so ideas keep their
              edge from the first sketch to the shipped product.
            </p>
            <br />
            <p>
              We stay deliberately lean. Fewer hands on each project means
              faster decisions, tighter craft, and a direct line to the people
              actually making the thing. Every collaboration is treated as a
              chance to make something we would be proud to sign.
            </p>
            <br />
          </div>
          <div className="about-us-copy-p">
            <span>Unusual Designs</span>
            <span>Digital Creative Studio</span>
            <span>Toronto 0982</span>
            <span>0912 King street</span>
            <br />
            <span>
              <a href="mailto:hello@aryank.space">hello@aryank.space</a>
            </span>
          </div>
        </div>
      </section>
      <section id="about-sticky-wrap">
        <div className="about-sticky about-sticky-1">
          <div className="sticky-content">
            <div className="sitcky-content-h1">
              <h1 className="num">1</h1>
            </div>
            <div className="sitcky-content-h1">
              <h1>Design:</h1>
              <h1>
                Positioning, identity systems, art direction, and the type and
                motion language that carries a brand everywhere it shows up.
              </h1>
            </div>
          </div>
        </div>
        <div className="about-sticky about-sticky-2">
          <div className="sticky-content">
            <div className="sitcky-content-h1">
              <h1 className="num">2</h1>
            </div>
            <div className="sitcky-content-h1">
              <h1>Development:</h1>
              <h1>
                Design engineering, performant front-ends, and the interaction
                details that turn a static comp into a living product.
              </h1>
            </div>
          </div>
        </div>
      </section>
      <section className="hero-img">
        <div className="hero-img-container">
          <img src={asset(base, "images/about-feature.jpg")} alt="" />
        </div>
      </section>
      <section className="more-clients">
        <div className="more-clients-h1">
          <h1>We've worked with</h1>
        </div>
        <div className="more-clients-logos">
          {Array.from({ length: 9 }, (_, i) => (
            <div className="more-clients-logo" key={`mc-${i}`}>
              LOGO {i + 1}
            </div>
          ))}
        </div>
      </section>
      <section className="about-us office">
        <div className="hero-img-container">
          <img src={asset(base, "images/about-office.jpg")} alt="" />
        </div>
        <div className="about-us-copy">
          <div className="about-us-copy-p">
            <span>Unusual Designs</span>
            <span>Digital Creative Studio</span>
            <span>Toronto 0982</span>
            <span>0912 King street</span>
            <br />
            <span>
              <a href="mailto:hello@aryank.space">hello@aryank.space</a>
            </span>
          </div>
          <div className="about-us-copy-h1">
            <h1 id="office">Workplace</h1>
          </div>
        </div>
      </section>
      <ContactFooter />
    </div>
  );
}

function Careers({ base }: { base: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (customElements.get("lottie-player")) {
      setReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${LOTTIE_PLAYER_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      if (customElements.get("lottie-player")) setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = LOTTIE_PLAYER_SRC;
    script.addEventListener("load", () => setReady(true));
    document.head.appendChild(script);
  }, []);
  return (
    <section className="careers">
      <div className="careers-copy">
        <div className="careers-copy-p">
          <span>We are always looking for restless, precise people.</span>
        </div>
        <div className="careers-copy-h1">
          <h1>
            No open roles right now, but send us the work you cannot stop making
            and we will remember it.
          </h1>
        </div>
      </div>
      <div className="careers-lottie">
        {ready
          ? createElement("lottie-player", {
              src: asset(base, "careers-lottie.json"),
              background: "transparent",
              speed: "1",
              loop: true,
              autoplay: true,
              style: { width: "100%", height: "100%" },
            })
          : null}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact">
      <div className="contact-copy">
        <span>Project Inquiries</span>
        <br />
        <br />
        <p>Tell us what you are building and where you want it to go.</p>
        <br />
        <a href="mailto:hello@aryank.space">hello@aryank.space</a>
        <br />
        <br />
        <br />
        <p>Opening times : Mon to Fri, 10 to 18</p>
        <br />
        <br />
        <span>Networks</span>
        <br />
        <br />
        <a
          href="https://x.com/blank_spacets"
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        <br />
        <a
          href="https://github.com/kiritocode1"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <br />
        <a
          href="https://www.linkedin.com/in/kiritocode1/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <br />
        <br />
        <br />
        <span>Our Workplace</span>
        <br />
        <br />
        <p>Toronto 0982</p>
        <p>0912 King street</p>
        <p>Toronto CA</p>
        <br />
        <span id="copyright">
          Unusual Designs is a creative studio <br /> Toronto, CA © 2023 ALL
          RIGHTS RESERVED.
        </span>
      </div>
    </section>
  );
}

function ProjectDetail({ base }: { base: string }) {
  return (
    <div className="project-wrapper">
      <section className="project-type">
        <div className="project-type-copy">
          <span>Project Name</span>
          <span>Category</span>
          <span>Company</span>
          <span>2050</span>
        </div>
      </section>
      <section className="project-hero">
        <div className="project-hero-img">
          <img src={asset(base, "images/project-img-1.jpg")} alt="" />
        </div>
      </section>
      <section className="project-overview">
        <div className="project-overview-copy">
          <div className="project-overview-copy-p">
            <p>
              A full rebrand and site build for a studio that wanted to feel
              less like an agency and more like a signal. We started with the
              voice, then let the identity follow.
            </p>
            <br />
            <p>
              The system had to survive far outside the pitch deck: on
              packaging, in motion, at a hundred pixels wide and at billboard
              scale. So we built it as a kit of parts, with rules loose enough
              to stay alive.
            </p>
          </div>
          <div className="project-overview-ws" />
          <div className="project-overview-copy-h1">
            <h1>An identity built to move</h1>
          </div>
        </div>
      </section>
      <section className="project-img-full">
        <div className="project-img-full-wrapper">
          <img src={asset(base, "images/project-img.jpg")} alt="" />
        </div>
      </section>
      <section className="project-overview">
        <div className="project-overview-copy">
          <div className="project-overview-copy-p">
            <p>
              The web build paired a lightweight front-end with scroll-linked
              motion, so the site reads as one continuous gesture rather than a
              stack of blocks. Performance stayed the priority the whole way
              through.
            </p>
          </div>
          <div className="project-overview-ws" />
          <div className="project-overview-copy-h1">
            <h1>Fast, quiet, and precise</h1>
          </div>
        </div>
      </section>
      <section className="project-img-full">
        <div className="project-img-full-wrapper">
          <img src={asset(base, "images/project-page-img-2.jpg")} alt="" />
        </div>
      </section>
      <section className="project-info">
        <div className="project-info-copy">
          <p>
            We shipped a brand book, a component library, and a launch film,
            then stayed on for the first season of campaigns. Handover meant the
            in-house team could keep the system honest without us in the room.
          </p>
          <br />
          <p>
            The result reads as one voice across every surface, which is the
            only metric that ever really mattered here.
          </p>
        </div>
        <div className="project-info-img">
          <img src={asset(base, "images/project-img-2.jpg")} alt="" />
        </div>
      </section>
      <section className="project-img-full">
        <div className="project-img-full-wrapper">
          <img src={asset(base, "images/project-img.jpg")} alt="" />
        </div>
      </section>
      <section className="project-overview">
        <div className="project-overview-copy">
          <div className="project-overview-copy-p">
            <p>
              Live now, and still growing as the team adds new surfaces to the
              system. The best sign it worked: nobody can tell which pieces we
              made and which they made after.
            </p>
          </div>
          <div className="project-overview-ws" />
          <div className="project-overview-copy-h1">
            <h1>
              <a
                href="https://aryank.space"
                target="_blank"
                rel="noopener noreferrer"
              >
                <u>projecturl.com</u>
              </a>
            </h1>
          </div>
        </div>
      </section>
      <section className="projects discover">
        <div className="projects-copy">
          <div className="projects-copy-h1">
            <h1>Find more projects</h1>
          </div>
          <div className="projects-copy-ws" />
        </div>
        <div className="projects-list">
          <ProjectCard variant={3} />
          <ProjectCard variant={4} />
        </div>
      </section>
      <ContactFooter />
    </div>
  );
}

function RouteView({ path, base }: { path: UnusualStudioRoute; base: string }) {
  switch (path) {
    case "/projects":
      return <Projects />;
    case "/about":
      return <About base={base} />;
    case "/careers":
      return <Careers base={base} />;
    case "/contact":
      return <Contact />;
    case "/sample-project-page":
      return <ProjectDetail base={base} />;
    default:
      return <Home base={base} />;
  }
}

const EASE = [0.22, 1, 0.36, 1] as const;

export interface UnusualStudioPageProps {
  assetBase?: string;
  initialPath?: UnusualStudioRoute;
  className?: string;
  style?: CSSProperties;
}

export default function UnusualStudioPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className,
  style,
}: UnusualStudioPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState<UnusualStudioRoute>(
    normalizePath(initialPath),
  );
  const base = assetBase.replace(/\/$/, "");

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = (to: UnusualStudioRoute) => {
    setPath(normalizePath(to));
    const scroller = getScrollParent(rootRef.current);
    scroller.scrollTo({ top: 0 });
  };

  return (
    <main
      ref={rootRef}
      className={
        className ? `unusual-studio-page ${className}` : "unusual-studio-page"
      }
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet
        dangerouslySetInnerHTML={{
          __html: getUnusualStudioPageStyles(assetBase),
        }}
      />
      <NavContext.Provider value={{ navigate, assetBase }}>
        <Nav />
        <AnimatePresence mode="wait">
          <motion.div key={path} style={{ display: "contents" }}>
            <RouteView path={path} base={base} />
            <motion.div
              className="slide-in"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 0 }}
              exit={{ scaleX: 1 }}
              transition={{ duration: 0.75, ease: EASE }}
            />
            <motion.div
              className="slide-in-text"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
            >
              🔥
            </motion.div>
            <motion.div
              className="slide-out"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.75, ease: EASE, delay: 0.5 }}
            />
          </motion.div>
        </AnimatePresence>
      </NavContext.Provider>
    </main>
  );
}

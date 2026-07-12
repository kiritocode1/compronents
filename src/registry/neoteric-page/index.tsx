"use client";

/**
 * Neoteric Page - a faithful port of the Neoteric Studio agency template. Ships
 * the routed home, work, studio, thinking (dark), feed, contact, and sample
 * project pages behind a lightweight internal router (no react-router). The
 * framer-motion slide-in/slide-out page transition, the dark-mode nav/footer on
 * the thinking route, and a self-contained masonry grid recreate the source.
 * Images are Blob-hosted.
 *
 * BLANK - aryank.space
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { getNeotericPageStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/neoteric-page";

export const NEOTERIC_PAGE_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/work", label: "Work" },
  { path: "/studio", label: "Studio" },
  { path: "/thinking", label: "Thinking" },
  { path: "/feed", label: "Feed" },
  { path: "/contact", label: "Contact" },
  { path: "/work/sample-project", label: "Sample Project" },
] as const;

export type NeotericRoute = (typeof NEOTERIC_PAGE_ROUTES)[number]["path"];

const ROUTE_SET = new Set<string>(NEOTERIC_PAGE_ROUTES.map((r) => r.path));

function normalizePath(path: string | undefined): NeotericRoute {
  const normalized =
    (path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\.html$/, "")
      .replace(/(.)\/$/, "$1") || "/";
  return ROUTE_SET.has(normalized) ? (normalized as NeotericRoute) : "/";
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
  navigate: (to: NeotericRoute) => void;
  path: NeotericRoute;
  assetBase: string;
}

const NavContext = createContext<NavContextValue>({
  navigate: () => {},
  path: "/",
  assetBase: DEFAULT_ASSET_BASE,
});

const useNav = () => useContext(NavContext);
const img = (base: string, file: string) =>
  `${base.replace(/\/$/, "")}/project-images/${file}`;

function A({
  to,
  id,
  children,
}: {
  to: NeotericRoute;
  id?: string;
  children: ReactNode;
}) {
  const { navigate } = useNav();
  return (
    <a
      href={to}
      id={id}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

/* ---- data ---- */
interface ProjectData {
  img: string;
  title: string;
  category: string;
}
const PROJECTS: ProjectData[] = [
  { img: "img1.jpg", title: "Eunoia Aesthetics", category: "Web Design" },
  { img: "img2.jpg", title: "Zenith Visions", category: "UI/UX" },
  {
    img: "img3.jpg",
    title: "Lumina Essence II",
    category: "Creative Direction",
  },
  { img: "img4.jpg", title: "Aether Dynamics", category: "Photography" },
  { img: "img5.jpg", title: "Nova Landscapes", category: "Web Development" },
  { img: "img6.jpg", title: "Sylphlike Elegance", category: "Graphic Design" },
  { img: "img7.jpg", title: "Chronicle Echoes", category: "Cinematography" },
  { img: "img8.jpg", title: "Serenity Frames", category: "Branding" },
  {
    img: "img9.jpg",
    title: "Mystic Interfaces",
    category: "Digital Marketing",
  },
  { img: "img10.jpg", title: "Pixelated Dreams", category: "Web Design" },
  {
    img: "img11.jpg",
    title: "Spectrum Creatives",
    category: "Creative Direction",
  },
  { img: "img1.jpg", title: "Visionary Clicks", category: "Photography" },
  { img: "img2.jpg", title: "Eunoia Aesthetics", category: "Web Design" },
];

interface FeedData {
  img: string;
  date: string;
  name: string;
  copy: string;
}
const FEEDS: FeedData[] = [
  {
    img: "img1.jpg",
    date: "10 2456 7823",
    name: "Aurora Creative® Emblems",
    copy: "",
  },
  {
    img: "img2.jpg",
    date: "78 5940 1265",
    name: "Breeze Symbols",
    copy: "The essence of Nordic Breeze, captured through evocative symbols. An exploration into the serene beauty of the northernmost landscapes.",
  },
  {
    img: "img3.jpg",
    date: "92 0134 6758",
    name: "Oslo Moods® Glyphs",
    copy: "",
  },
  {
    img: "img4.jpg",
    date: "56 8410 2379",
    name: "Helsinki Imagery Icons",
    copy: "",
  },
  {
    img: "img6.jpg",
    date: "87 5012 3468",
    name: "Scandinavian Pulse® Marks",
    copy: "",
  },
  { img: "img5.jpg", date: "23 1456 8907", name: "Baltic Patterns", copy: "" },
  { img: "img7.jpg", date: "12 6789 0456", name: "Nordic Diagrams", copy: "" },
  {
    img: "img8.jpg",
    date: "90 2134 5678",
    name: "Viking Voyage® Prints",
    copy: "Incorporating ancient maritime history with modern design perspectives. A nostalgic yet fresh take on the Viking spirit.",
  },
  {
    img: "img9.jpg",
    date: "45 6789 0123",
    name: "Borealis Stencils",
    copy: "",
  },
  { img: "img10.jpg", date: "67 8901 2345", name: "Arctic Aura", copy: "" },
  {
    img: "img11.jpg",
    date: "34 5678 9012",
    name: "Fjord Fables® Imprints",
    copy: "Drawing inspiration from age-old tales and landscapes, Fjord Fables is a visual storybook. Capturing the whispers of mountains and rivers.",
  },
  { img: "img1.jpg", date: "78 9012 3456", name: "Polar Purity", copy: "" },
  {
    img: "img2.jpg",
    date: "89 0123 4567",
    name: "Glacial Glow® Seals",
    copy: "",
  },
  {
    img: "img3.jpg",
    date: "12 3456 7890",
    name: "Mystic Badges",
    copy: "A deep dive into the mysteries of the midnight sun. An artful interpretation of the phenomena that lights up the polar nights.",
  },
  {
    img: "img4.jpg",
    date: "23 4567 8901",
    name: "Nordic Nebula Stamps",
    copy: "",
  },
  { img: "img5.jpg", date: "34 5678 9012", name: "Siberian Silence", copy: "" },
];

const AWARDS = [
  {
    client: "Astral",
    category: "astral.org",
    year: "2021",
    name: "Webby Awards, People's Voice Winner",
  },
  {
    client: "Nexa",
    category: "nexadesigns.com",
    year: "2022",
    name: "UX Design Awards, Gold",
  },
  {
    client: "Solar Shift",
    category: "solarshift.io",
    year: "2020",
    name: "Awwwards, Site of the Month",
  },
  {
    client: "Terra",
    category: "terrawave.co",
    year: "2021",
    name: "CSS Design Awards, Special Kudos",
  },
  {
    client: "Echo Rise",
    category: "echorise.net",
    year: "2021",
    name: "Digital Design Awards",
  },
  {
    client: "Lumen Craft",
    category: "lumencraft.org",
    year: "2022",
    name: "Interactive Media Awards, Best in Class",
  },
  {
    client: "Flux",
    category: "fluxfusion.co",
    year: "2020",
    name: "Web Excellence Awards, Best Homepage",
  },
  {
    client: "Zenith",
    category: "zenithflow.io",
    year: "2021",
    name: "Web Guru Awards, Designer of the Year",
  },
  {
    client: "Lunar Trail",
    category: "lunartrail.com",
    year: "2021",
    name: "Pixel Awards, Best Visual Design",
  },
  {
    client: "Ethereum",
    category: "etheriumpulse.net",
    year: "2022",
    name: "Design Innovation Awards",
  },
];

const THINKINGS = [
  {
    title: "Purpose for being",
    bodyCopy1:
      "The modern era provides unparalleled opportunities to conceptualize, initiate, and assess innovative ideas on both grand and modest scales. Propelled by a forward-thinking generation seeking transformation, and large entities aiming for rejuvenation, the innovation landscape brims with hope.",
    bodyCopy2:
      "However, this emphasis on rapid progression has also paved the way for a surge of superfluous products and services. While hope is commendable, not every idea holds merit.",
    bodyCopy3:
      "We cherish genuine perspectives on addressing the profound challenges we encounter as consumers and dwellers of this Earth. Concepts rooted in authenticity that transcend mere financial gain, aiming for a distinct form of influence. It all begins by posing the correct inquiries.",
    index: 1.4,
  },
  {
    title: "Craft authentic worth",
    bodyCopy1:
      "The visual realm we inhabit has leveled the playing field for expression, with an abundance of creators ready to lend their skills to any endeavor, round the clock.",
    bodyCopy2:
      "Furthermore, digital platforms equipped with universal market reach have simplified the process for individuals to introduce brands and initiatives that appear reliable at first glance.",
    bodyCopy3:
      "However, merely vying based on hues, graphics, and narratives may offer immediate gains, but it lacks longevity. We advocate for products and services rooted in genuine utility, prioritizing user-centric benefits, a value proposition steered by customer needs.",
    index: 2.4,
  },
  {
    title: "Forward of thinking",
    bodyCopy1:
      "The world we navigate is transforming at the pace of a click, and the allure of embracing current trends is omnipresent.",
    bodyCopy2:
      "Organizations are frequently enticed to embrace emerging technologies, platforms, or consumer engagement strategies to remain in the loop. Yet, what's in vogue isn't universally apt.",
    bodyCopy3:
      "We are resolutely dedicated to crafting enduring brands and products, emphasizing meticulous artisanship, holistic strategy, and adaptable foresight. Robust brands aren't the result of fleeting efforts; they emerge from consistent endeavors over an extended duration.",
    index: 3.4,
  },
  {
    title: "True real essence",
    bodyCopy1:
      "Modern consumers delve deeper, seeking to comprehend not merely the products or services but the core ethos of the organizations offering them. The vehicle, the endorsement, or the flair of a message can't eclipse the substance anymore.",
    bodyCopy2:
      "In this context, forthrightness and clarity emerge as the linchpins of trustworthiness, while superfluous layers of dialogue act as detractors.",
    bodyCopy3:
      "Our commitment lies in manifesting genuineness through compelling and captivating means, resonating with both the emotional and cognitive realms of our audience. For us, the most genuine narrative often holds the highest resonance.",
    index: 4.4,
  },
];

/* ---- shared components ---- */
function Project({ project, base }: { project: ProjectData; base: string }) {
  return (
    <div className="project">
      <A to="/work/sample-project">
        <div className="project-img">
          <img src={img(base, project.img)} alt="" />
        </div>
        <div className="project-title">
          <p>{project.title}</p>
        </div>
        <div className="project-category">
          <p>{project.category}</p>
        </div>
      </A>
    </div>
  );
}

function renderProjects(base: string, start: number, end: number) {
  return PROJECTS.slice(start, end).map((project, index) => (
    <Project project={project} base={base} key={`${project.title}-${index}`} />
  ));
}

function FeedItem({ feed, base }: { feed: FeedData; base: string }) {
  return (
    <div className="feed">
      <div className="feed-img">
        <img src={img(base, feed.img)} alt="" />
      </div>
      <div className="feed-date">
        <p>{feed.date}</p>
      </div>
      <div className="feed-name">
        <p>{feed.name}</p>
        <span className="feed-copy">{feed.copy}</span>
      </div>
    </div>
  );
}

function renderFeeds(base: string, start: number, end: number) {
  return FEEDS.slice(start, end).map((feed, index) => (
    <FeedItem feed={feed} base={base} key={`${feed.name}-${index}`} />
  ));
}

function Footer() {
  const { path } = useNav();
  return (
    <div className={`footer ${path === "/thinking" ? "footer-dark" : ""}`}>
      <div className="container">
        <div className="footer-item">
          <p>
            <A to="/">Neoteric Studio</A>
          </p>
        </div>
        <div className="footer-item" id="footer-contact">
          <p>
            Work with us, write to{" "}
            <a href="mailto:contact@neoteric.com">contact@neoteric.com</a>
          </p>
        </div>
        <div className="footer-item">
          <p>&copy; 2016-2023</p>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { path } = useNav();
  return (
    <div className={`navbar ${path === "/thinking" ? "navbar-dark" : ""}`}>
      <div className="container">
        <div className="navbar-logo">
          <div className="navbar-item">
            <A to="/">Neoteric Studio</A>
          </div>
        </div>
        <div className="navbar-items">
          <div className="navbar-item">
            <A to="/work">Work</A>
          </div>
          <div className="navbar-item">
            <A to="/studio">Studio</A>
          </div>
          <div className="navbar-item">
            <A to="/thinking">Thinking</A>
          </div>
          <div className="navbar-item">
            <A to="/feed">Feed</A>
          </div>
          <div className="navbar-item">
            <A to="/contact">Contact</A>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- masonry (replaces react-masonry-css) ---- */
function Masonry({ children, base }: { children: string[]; base: string }) {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setCols(w <= 500 ? 1 : w <= 700 ? 2 : w <= 1100 ? 3 : 4);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  const columns: string[][] = Array.from({ length: cols }, () => []);
  children.forEach((file, i) => columns[i % cols].push(file));
  return (
    <div className="my-masonry-grid">
      {columns.map((col, ci) => (
        <div className="my-masonry-grid_column" key={`mcol-${ci}`}>
          {col.map((file, ii) => (
            <div key={`mimg-${ci}-${ii}`}>
              <img src={img(base, file)} alt="" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---- pages ---- */
function Home({ base }: { base: string }) {
  return (
    <div className="home">
      <div className="container">
        <div className="hero-img">
          <img src={img(base, "img11.jpg")} alt="" />
        </div>
        <div className="hero-copy">
          <h1>
            <span>Foundational Elements</span>
            <br />
            Neoteric® is a creative hub located in Denmark, branching out
            globally to sculpt iconic brands and immersive digital journeys,
            centering on the vital core. &nbsp;{" "}
            <A to="/studio"> Why emphasis?</A>
          </h1>
        </div>
      </div>
      <div className="divider" />
      <div className="container">
        <div className="work-section">
          <div className="work-section-header">
            <div className="section-header-title">
              <h1 className="section-title">Work</h1>
            </div>
            <div className="section-header-copy">
              <p>2016-2023</p>
              <p>
                <A to="/work" id="a-underline">
                  View All
                </A>
              </p>
              <p>({PROJECTS.length})</p>
            </div>
          </div>
          <div className="projects">
            <div className="row">
              <div className="col sm">{renderProjects(base, 0, 2)}</div>
              {renderProjects(base, 2, 3)}
            </div>
            <div className="row">
              <div className="col">{renderProjects(base, 3, 4)}</div>
              {renderProjects(base, 4, 5)}
            </div>
            <div className="row">
              {renderProjects(base, 5, 6)}
              <div className="col sm">{renderProjects(base, 6, 8)}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="container">
        <div className="feed-section">
          <div className="work-section-header">
            <div className="section-header-title">
              <h1 className="section-title">Feed</h1>
            </div>
            <div className="section-header-copy">
              <p>
                <A to="/feed" id="a-underline">
                  View All
                </A>
              </p>
              <p>({FEEDS.length})</p>
            </div>
          </div>
          <div className="feeds">
            <div className="row">{renderFeeds(base, 0, 2)}</div>
            <div className="row">{renderFeeds(base, 2, 4)}</div>
          </div>
        </div>
      </div>
      <div className="divider" />
      <Footer />
    </div>
  );
}

function Work({ base }: { base: string }) {
  return (
    <div className="work-page">
      <div className="divider" />
      <div className="container">
        <div className="work-section">
          <div className="work-section-header">
            <div className="section-header-title">
              <h1 className="section-title">Work</h1>
            </div>
            <div className="section-header-copy">
              <p>2016-2023</p>
              <p>
                <A to="/" id="a-underline">
                  Back
                </A>
              </p>
              <p>({PROJECTS.length})</p>
            </div>
          </div>
          <div className="projects">
            <div className="row">
              <div className="col sm">{renderProjects(base, 0, 2)}</div>
              {renderProjects(base, 2, 3)}
            </div>
            <div className="row">
              <div className="col">{renderProjects(base, 3, 4)}</div>
              {renderProjects(base, 4, 5)}
            </div>
            <div className="row">
              {renderProjects(base, 5, 6)}
              <div className="col sm">{renderProjects(base, 6, 8)}</div>
            </div>
            <div className="row">
              <div className="col">{renderProjects(base, 8, 9)}</div>
              {renderProjects(base, 9, 10)}
            </div>
            <div className="row">
              <div className="col sm">{renderProjects(base, 10, 12)}</div>
              {renderProjects(base, 12, 13)}
            </div>
          </div>
        </div>
      </div>
      <div className="divider" />
      <Footer />
    </div>
  );
}

function Studio({ base }: { base: string }) {
  return (
    <div className="studio">
      <div className="divider" />
      <div className="container">
        <h1 className="section-title">
          Established to craft <br /> fundamentals
        </h1>
        <div className="whitespace-300" />
        <p>Established 2018</p>
      </div>
      <div className="divider" />
      <div className="container">
        <section className="contact-info">
          <div className="contact-info-col">
            <h2 className="section-h2">
              Neoteric<sup>&copy;</sup> is a creative hub rooted in Denmark,
              collaborating globally to sculpt iconic brands and immersive
              digital journeys, always honing in on the vital core.
            </h2>
          </div>
          <div className="contact-info-col">
            <div className="contact-info-sub-col">
              <p>
                Neoteric Studios, nestled in the bustling heart of Copenhagen,
                stands as a testament to the city's legacy of avant-garde design
                and pioneering innovation. The studio was the brainchild of Elsa
                and Johan, both luminaries in their own right.
              </p>
              <br />
              <p>
                What sets Neoteric Studios apart is its unyielding commitment to
                storytelling. Every project undertaken is seen as a blank
                canvas, waiting for a narrative to unfold. The team delves deep
                into the brand's ethos, history, and aspirations.
              </p>
              <br />
              <p>
                While firmly rooted in Danish design principles, Neoteric
                Studios has always cast its eyes towards the horizon. Their
                portfolio boasts collaborations with brands from Tokyo to New
                York, yet each project carries a hint of that quintessential
                Danish minimalism.
              </p>
              <p>
                Neoteric has championed the integration of technology with
                design, crafting digital realms that enchant and engage.
              </p>
            </div>
            <div className="contact-info-sub-col">
              <p>
                Neoteric Studios has always been at the vanguard of digital
                evolution. Recognizing the paradigm shift towards digital
                experiences early on, they invested in curating a team of
                digital magicians. From immersive AR experiences to intuitive
                UI/UX designs.
              </p>
              <br />
              <p>
                At the core of Neoteric's philosophy lies a profound respect for
                essentialism. Amidst the noise of the modern world, they seek
                the fundamental, the elemental.
              </p>
              <br />
              <p>
                Recognizing the paradigm shift towards digital experiences early
                on, they invested in curating a team of digital magicians. From
                immersive AR experiences to intuitive UI/UX designs.
              </p>
            </div>
          </div>
        </section>
        <div className="studio-img">
          <div className="studio-img-alt">
            <p>
              Co-founders Lars Eriksson and Kristian Moller. <br /> Odense,
              2020.
            </p>
            <br />
            <div className="studio-main-img">
              <img src={img(base, "img2.jpg")} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="container">
        <section className="contact-info">
          <div className="contact-info-col">
            <h1 className="section-title">Methodology</h1>
          </div>
          <div className="contact-info-col">
            <p>
              At the heart of our approach lies a commitment to innovative
              design principles. Through a fusion of creativity and strategy, we
              navigate challenges with precision. From the conceptualization
              phase to the final output, our goal remains consistent: to deliver
              design solutions that not only resonate but also stand the test of
              time.
            </p>
          </div>
        </section>
      </div>
      {[
        {
          n: "1",
          t: "Conceptualization and Drafting",
          c: "Turning initial ideas into tangible concepts, and sketching preliminary designs.",
        },
        {
          n: "2",
          t: "Refinement and Iteration",
          c: "Enhancing the concepts through feedback, making iterative changes for perfection.",
        },
        {
          n: "3",
          t: "Finalization and Delivery",
          c: "Sealing the design with utmost precision and ensuring it's ready for its intended application.",
        },
        {
          n: "4",
          t: "Implementation and Feedback Loop",
          c: "Launching the design into its intended environment and continuously monitoring for areas of improvement.",
        },
      ].map((step) => (
        <div key={step.n}>
          <div className="divider" />
          <div className="container">
            <section className="contact-info">
              <div className="contact-info-col" />
              <div className="contact-info-col">
                <div className="contact-info-sub-col">
                  <h2>{step.n}</h2>
                </div>
                <div className="contact-info-sub-col">
                  <p>{step.t}</p>
                  <p className="contact-info-sec">{step.c}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      ))}
      <div className="divider" />
      <div className="container">
        <section className="contact-info">
          <div className="contact-info-col">
            <h1 className="section-title">Services</h1>
          </div>
          <div className="contact-info-col">
            <p>
              At Neoteric Studios, our expertise spans a broad spectrum. From
              meticulously crafting brand identities that resonate with
              audiences to constructing digital landscapes that captivate users,
              our dedication shines through. We pride ourselves on our ability
              to merge aesthetics with functionality.
            </p>
          </div>
        </section>
      </div>
      <div className="divider" />
      <div className="container">
        <section className="contact-info">
          <div className="contact-info-col">
            <h1 className="section-title">
              Selected <br />
              Clients
            </h1>
          </div>
          <div className="contact-info-col">
            <div className="project-names">
              {[
                "Nexa",
                "Aura Shift",
                "Flux Veil",
                "Lurea",
                "Lunar Arc",
                "Zenix",
                "Ciriio",
                "Ether Pulse",
                "Flow",
                "Omni Wave",
                "Vireo",
                "Terra Glide",
                "Pluvio",
                "Aether Drift",
                "Muio",
              ].map((name) => (
                <h3 key={name}>{name}</h3>
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="divider" />
      <section className="awards">
        <div className="award" id="award-header">
          <div className="container">
            <div>
              <div>
                <div className="award-client">
                  <h3>Client</h3>
                </div>
                <div className="award-category">
                  <h3>Project</h3>
                </div>
              </div>
              <div className="award-year">
                <h3>Year</h3>
              </div>
            </div>
            <div className="award-name">
              <h3>Award</h3>
            </div>
          </div>
        </div>
        {AWARDS.map((award) => (
          <div className="award" key={award.client}>
            <div className="container">
              <div>
                <div>
                  <div className="award-client">
                    <p>{award.client}</p>
                  </div>
                  <div className="award-category">
                    <p>{award.category}</p>
                  </div>
                </div>
                <div className="award-year">
                  <p>{award.year}</p>
                </div>
              </div>
              <div className="award-name">
                <p>{award.name}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
      <div className="whitespace-100" />
      <div className="divider" />
      <div className="container">
        <div className="work-section-header">
          <div className="section-header-title">
            <h1 className="section-title">Work</h1>
          </div>
          <div className="section-header-copy">
            <p>2016-2023</p>
            <p>
              <A to="/work" id="a-underline">
                View All
              </A>
            </p>
            <p>({PROJECTS.length})</p>
          </div>
        </div>
        <div className="projects">
          <div className="row">
            <div className="col sm">{renderProjects(base, 0, 2)}</div>
            {renderProjects(base, 2, 3)}
          </div>
        </div>
      </div>
      <div className="divider" />
      <Footer />
    </div>
  );
}

function Contact({ base }: { base: string }) {
  return (
    <div className="contact">
      <div className="divider" />
      <div className="container">
        <h1 className="section-title">Contact Us</h1>
        <div className="whitespace-300" />
        <p>Odense and Viborg</p>
      </div>
      <div className="divider" />
      <div className="container">
        <section className="contact-info">
          <div className="contact-info-col">
            <h2 className="section-h2">
              We forge strong partnerships with brands and teams, sculpting
              their prospective ventures via design. From audacious conceptual
              journeys to meticulous execution of thoughtful design, we invite
              you to connect to explore possibilities or delve deeper into our
              studio's philosophy on crafting fundamentals.
            </h2>
          </div>
          <div className="contact-info-col">
            <div className="contact-info-sub-col">
              <p>Neoteric A/S</p>
              <p>Skt. Lukas Vej 4D</p>
              <p>DK-1624</p>
              <p>Copenhagen</p>
              <br />
              <p>Jens Olufsens Gade 11C</p>
              <p>DK-8260</p>
              <p>Aarhus</p>
              <br />
              <p>+45 5246 8426</p>
              <p>hello@neoteric.dk</p>
              <br />
              <br />
              <p>CHX 868234</p>
            </div>
            <div className="contact-info-sub-col">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>{" "}
              <br />
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>{" "}
              <br />
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            </div>
          </div>
        </section>
      </div>
      <div className="divider" />
      <div className="container">
        <section className="contact-info">
          <div className="contact-info-col">
            <h1 className="section-title">All Inquiries</h1>
          </div>
          <div className="contact-info-col">
            <div className="contact-info-sub-col">
              <p>Business</p>
              <p className="sec-contact">
                New business inquiries and collaborations. Please write to
                hi@neoteric.dk
              </p>
              <br />
              <p>Public Relations</p>
              <p className="sec-contact">
                Requests for interviews, materials, and talks. Please write to
                press@neoteric.dk
              </p>
              <br />
              <p>Careers</p>
              <p className="sec-contact">
                We're currently not accepting interns or hiring.
              </p>
              <br />
              <br />
              <p>CVR 37503878</p>
            </div>
            <div className="contact-info-sub-col" />
          </div>
        </section>
      </div>
      <div className="divider" />
      <div className="container">
        <section className="contact-info">
          <div className="contact-info-col">
            <h1 className="section-title">Founding Partners</h1>
          </div>
          <div className="contact-info-col">
            <div className="contact-info-sub-col">
              <p>
                Neoteric® is established and directed by Danish designers Morten
                Skov Hansen and Emil Rasmussen, with branches in Copenhagen and
                Viborg.
              </p>
              <br />
              <p>
                From audacious conceptual journeys to meticulous execution of
                thoughtful design, we invite you to connect to explore
                possibilities or delve deeper into our studio's philosophy on
                crafting fundamentals.
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="divider" />
      <div className="container">
        <div className="team">
          <div className="team-col" />
          <div className="team-col">
            {[
              {
                img: "team1.jpg",
                name: "Martin Jens Lassen",
                pos: "Founder and Design Director",
                email: "martin@neoteric.com",
                phone: "+45 87439 374",
              },
              {
                img: "team2.jpg",
                name: "Sorten Skov Hansen",
                pos: "Founder and Creative Lead",
                email: "sorten@neoteric.com",
                phone: "+23 9843 7834",
              },
            ].map((dev) => (
              <div className="dev" key={dev.name}>
                <div className="dev-img">
                  <img
                    src={`${base.replace(/\/$/, "")}/team/${dev.img}`}
                    alt=""
                  />
                </div>
                <div className="dev-name">
                  <p>{dev.name}</p>
                </div>
                <div className="dev-pos">
                  <p>{dev.pos}</p>
                  <p>{dev.email}</p>
                </div>
                <div className="dev-contact">
                  <p>{dev.phone}</p>
                  <p>LinkedIn</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="container">
        <div className="work-section-header">
          <div className="section-header-title">
            <h1 className="section-title">Work</h1>
          </div>
          <div className="section-header-copy">
            <p>2016-2023</p>
            <p>
              <A to="/" id="a-underline">
                View All
              </A>
            </p>
            <p>({PROJECTS.length})</p>
          </div>
        </div>
        <div className="projects">
          <div className="row">
            <div className="col sm">{renderProjects(base, 0, 2)}</div>
            {renderProjects(base, 2, 3)}
          </div>
        </div>
      </div>
      <div className="divider" />
      <Footer />
    </div>
  );
}

function Feed({ base }: { base: string }) {
  return (
    <div className="feed-wrapper">
      <div className="divider" />
      <div className="container">
        <div className="feed-section">
          <div className="work-section-header">
            <div className="section-header-title">
              <h1 className="section-title">Feed</h1>
            </div>
            <div className="section-header-copy">
              <p>
                <A to="/" id="a-underline">
                  Back
                </A>
              </p>
              <p>({FEEDS.length})</p>
            </div>
          </div>
          {[
            [0, 2, 2, 4],
            [4, 6, 6, 8],
            [8, 10, 10, 12],
            [12, 14, 14, 16],
          ].map((group, gi) => (
            <div className="feeds" key={`feedgroup-${gi}`}>
              <div className="row">{renderFeeds(base, group[0], group[1])}</div>
              <div className="row">{renderFeeds(base, group[2], group[3])}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="divider" />
      <Footer />
    </div>
  );
}

function Thinking() {
  return (
    <div className="thinking">
      <div className="divider d-light" />
      <div className="container">
        <h1 className="section-title">Contemplating Essentials</h1>
        <div className="whitespace-300" />
        <p>Odense and Esbjerg</p>
      </div>
      <div className="divider d-light" />
      <div className="container">
        <section className="contact-info">
          <div className="contact-info-col">
            <h2 className="section-h2">
              Fundamental design acknowledges individuals, enterprises, the
              environment, and our collective destiny. Pursuing the fundamental
              underscores every aspect of our approach and deliverables. While
              it isn't an exact discipline, certain elements determine what we
              view as fundamental in brand and product experiences.
            </h2>
          </div>
          <div className="contact-info-col" />
        </section>
      </div>
      {THINKINGS.map((thinking) => (
        <div key={thinking.index}>
          <div className="divider d-light" />
          <div className="container">
            <div className="think">
              <div className="think-col">
                <div className="think-col-copy">
                  <h2 className="think-h2">{thinking.title}</h2>
                </div>
                <div className="think-col-copy">
                  <p>{thinking.bodyCopy1}</p>
                  <br />
                  <p>{thinking.bodyCopy2}</p>
                  <br />
                  <p>{thinking.bodyCopy3}</p>
                </div>
              </div>
              <div className="think-col">
                <h1 className="index-h1">{thinking.index}</h1>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="divider d-light" />
      <Footer />
    </div>
  );
}

function SampleProject({ base }: { base: string }) {
  const gridImages = [
    "img2.jpg",
    "img3.jpg",
    "img4.jpg",
    "img5.jpg",
    "img6.jpg",
    "img7.jpg",
    "img8.jpg",
    "img9.jpg",
    "img10.jpg",
    "img11.jpg",
    "img1.jpg",
    "img2.jpg",
  ];
  return (
    <div className="sample-project">
      <div className="divider" />
      <div className="container">
        <div className="project-head">
          <div className="project-head-col">
            <h1 className="section-title">Eunoia Aesthetics</h1>
          </div>
          <div className="project-head-col">
            <p>Project</p>
            <p className="project-copy-sec">Client: Spotify</p>
            <p className="project-copy-sec">Project: Creative Direction</p>
            <p className="project-copy-sec">Year: 2021</p>
            <br />
            <br />
            <p className="project-copy-sec">Digital Venture</p>
            <p className="project-copy-sec">User Interface Design</p>
            <p className="project-copy-sec">Branding</p>
            <p className="project-copy-sec">Modern Platform</p>
          </div>
        </div>
        <div className="project-sub-head">
          <div className="back-link">
            <A to="/work" id="a-underline">
              Back to work
            </A>
          </div>
          <div className="project-credits">
            <p>Credits</p>
            <p className="project-copy-sec">Google NOSP</p>
          </div>
        </div>
        <div className="project-image">
          <img src={img(base, "img1.jpg")} alt="" />
        </div>
      </div>
      <div className="divider" />
      <div className="container">
        <section className="contact-info project-dummy">
          <div className="contact-info-col">
            <h2 className="section-h2">
              Neoteric<sup>&copy;</sup> is a Danish-based design studio that
              operates on a global scale, crafting iconic brands and immersive
              digital journeys with an emphasis on the fundamental essence.
            </h2>
          </div>
          <div className="contact-info-col">
            <div className="contact-info-sub-col">
              <p>
                Neoteric Studios, nestled in the bustling heart of Copenhagen,
                stands as a testament to the city's legacy of avant-garde design
                and pioneering innovation.
              </p>
              <br />
              <p>
                While firmly rooted in Danish design principles, Neoteric
                Studios has always cast its eyes towards the horizon. Their
                portfolio boasts collaborations with brands from Tokyo to New
                York, yet each project carries a hint of that quintessential
                Danish minimalism.
              </p>
              <br />
              <p>
                Neoteric Studios has always been at the vanguard of digital
                evolution. Recognizing the paradigm shift towards digital
                experiences early on, they invested in curating a team of
                digital magicians.
              </p>
            </div>
            <div className="contact-info-sub-col">
              <p>
                Good work takes time, commitment and close collaboration. We
                value long-lasting relationships where trust, openness and
                progress become the driver for the process.
              </p>
              <br />
              <p>
                The studio was born in 2016 with an ambition to create order in
                the increasingly more complex convergence between business and
                design. Based in Denmark we work with ambitious corporations,
                startups and individuals all over the world.
              </p>
              <br />
              <p>
                At the core of Neoteric's philosophy lies a profound respect for
                essentialism. Amidst the noise of the modern world, they seek
                the fundamental, the elemental.
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="divider" />
      <div className="container">
        <div className="project-grid">
          <Masonry base={base}>{gridImages}</Masonry>
        </div>
      </div>
      <div className="divider" />
      <div className="container">
        <div className="work-section-header">
          <div className="section-header-title">
            <h1 className="section-title">Work</h1>
          </div>
          <div className="section-header-copy">
            <p>2016-2023</p>
            <p>
              <A to="/work" id="a-underline">
                View All
              </A>
            </p>
            <p>({PROJECTS.length})</p>
          </div>
        </div>
        <div className="projects">
          <div className="row">
            <div className="col sm">{renderProjects(base, 4, 6)}</div>
            {renderProjects(base, 6, 7)}
          </div>
        </div>
      </div>
      <div className="divider" />
      <Footer />
    </div>
  );
}

function RouteView({ path, base }: { path: NeotericRoute; base: string }) {
  switch (path) {
    case "/work":
      return <Work base={base} />;
    case "/studio":
      return <Studio base={base} />;
    case "/thinking":
      return <Thinking />;
    case "/feed":
      return <Feed base={base} />;
    case "/contact":
      return <Contact base={base} />;
    case "/work/sample-project":
      return <SampleProject base={base} />;
    default:
      return <Home base={base} />;
  }
}

const EASE = [0.22, 1, 0.36, 1] as const;

export interface NeotericPageProps {
  assetBase?: string;
  initialPath?: NeotericRoute;
  className?: string;
  style?: CSSProperties;
}

export default function NeotericPage({
  assetBase = DEFAULT_ASSET_BASE,
  initialPath = "/",
  className,
  style,
}: NeotericPageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [path, setPath] = useState<NeotericRoute>(normalizePath(initialPath));
  const base = assetBase.replace(/\/$/, "");

  useEffect(() => {
    setPath(normalizePath(initialPath));
  }, [initialPath]);

  const navigate = (to: NeotericRoute) => {
    setPath(normalizePath(to));
    const scroller = getScrollParent(rootRef.current);
    scroller.scrollTo({ top: 0 });
  };

  return (
    <main
      ref={rootRef}
      className={className ? `neoteric-page ${className}` : "neoteric-page"}
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped template stylesheet
        dangerouslySetInnerHTML={{ __html: getNeotericPageStyles() }}
      />
      <NavContext.Provider value={{ navigate, path, assetBase }}>
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.div key={path} style={{ display: "contents" }}>
            <RouteView path={path} base={base} />
            <motion.div
              className="slide-in"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 0 }}
              exit={{ scaleX: 1 }}
              transition={{ duration: 1, ease: EASE }}
            />
            <motion.div
              className="slide-out"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 1, ease: EASE }}
            />
          </motion.div>
        </AnimatePresence>
      </NavContext.Provider>
    </main>
  );
}

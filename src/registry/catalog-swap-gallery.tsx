"use client";

/**
 * Catalog Swap Gallery - a documentary catalog with a scrolling thumbnail rail.
 * Picking a thumbnail throws the current project out (the title, line-split
 * synopsis and credits lift and clip away while the featured still scales down
 * and drops) then builds the next one back in from below, all over a blurred
 * backdrop that cross-fades to the new frame. GSAP timeline with SplitText line
 * splitting, no other dependencies.
 *
 * Fills its container, so it fits a bounded stage or a full-viewport slot.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/catalog-swap-gallery";

export interface CatalogItem {
  title: string;
  copy: string;
  director: string;
  cinematographer: string;
}

export interface CatalogSwapGalleryProps {
  items?: CatalogItem[];
  images?: string[];
  brand?: string;
  navLinks?: string[];
  intro?: string;
  className?: string;
}

const DEFAULT_ITEMS: CatalogItem[] = [
  {
    title: "Beyond The Summit",
    copy: "Join a team of elite mountaineers as they attempt to conquer K2 in winter, a feat never before accomplished. This breathtaking documentary captures the raw beauty of the Karakoram and the indomitable human spirit.",
    director: "Alex Honnold",
    cinematographer: "Jimmy Chin",
  },
  {
    title: "Olympian's Journey",
    copy: "A heartfelt documentary following the trials and triumphs of a young athlete's four-year preparation for the Olympic Games. This intimate portrait showcases the dedication, sacrifices, and unwavering spirit required to compete at the highest level.",
    director: "Sarah Chen",
    cinematographer: "Marcus Doherty",
  },
  {
    title: "Velocity",
    copy: "An adrenaline-pumping series exploring the world's fastest motorsports. From Formula 1 to MotoGP, we dive deep into the technology, strategy, and human stories behind these high-octane competitions.",
    director: "Carlos Rodriguez",
    cinematographer: "Yuki Tanaka",
  },
  {
    title: "Court of Dreams",
    copy: "A gripping docuseries chronicling a season with an underdog college basketball team as they fight against all odds to reach the NCAA Final Four. Experience the passion, teamwork, and drama both on and off the court.",
    director: "Malik Johnson",
    cinematographer: "Elena Petrova",
  },
  {
    title: "The Last Whistle",
    copy: "An emotional retrospective on the career of a legendary football coach, exploring his impact on the sport and the lives he touched over a forty-year career. A testament to the power of mentorship and perseverance.",
    director: "Dana Whitfield",
    cinematographer: "Roger Deakins",
  },
  {
    title: "Waves of Change",
    copy: "Follow the journey of a para-surfer as she inspires a new generation of adaptive athletes. This uplifting documentary showcases the transformative power of sport and the ocean.",
    director: "Ava Delgado",
    cinematographer: "Rachel Morrison",
  },
  {
    title: "Chess Prodigy",
    copy: "Delve into the fascinating world of competitive chess through the eyes of a twelve-year-old prodigy. Watch as she takes on grandmasters and breaks barriers in this cerebral sport.",
    director: "Wes Aldridge",
    cinematographer: "Robert Yeoman",
  },
  {
    title: "Marathon of Mind",
    copy: "An innovative series blending sport and neuroscience, exploring how elite athletes train their brains for peak performance. Featuring cutting-edge research and intimate athlete profiles.",
    director: "Chris Nolan",
    cinematographer: "Hoyte van Hoytema",
  },
  {
    title: "Urban Evolution",
    copy: "Witness the art and athleticism of parkour as it evolves from street movement to recognized sport. This dynamic documentary follows practitioners around the globe as they redefine urban landscapes.",
    director: "Luc Besson",
    cinematographer: "Thierry Arbogast",
  },
  {
    title: "The Referee's Call",
    copy: "Step into the shoes of professional sports referees as they navigate split-second decisions, player confrontations, and the pressure of the world's biggest stages. A unique perspective on the unsung heroes of sport.",
    director: "Marta Ricci",
    cinematographer: "Rodrigo Prieto",
  },
  {
    title: "eSports Revolution",
    copy: "Explore the rapidly growing world of competitive gaming, from basement LAN parties to sold-out arenas. This series examines the culture, technology, and athletes driving the eSports phenomenon.",
    director: "Edgar Wright",
    cinematographer: "Bill Pope",
  },
  {
    title: "The Ironman Story",
    copy: "Chronicle the grueling preparation and superhuman endurance required to complete the Ironman World Championship. Follow amateur and professional triathletes as they push their limits.",
    director: "Kate Bigelow",
    cinematographer: "Barry Ackroyd",
  },
  {
    title: "Dance of Matador",
    copy: "A visually stunning exploration of the artistry, danger, and controversy surrounding modern bullfighting. This thought-provoking film examines the clash between tradition and animal rights.",
    director: "Pedro Almodovar",
    cinematographer: "Jose Luis Alcaine",
  },
  {
    title: "Way of the Warrior",
    copy: "Immerse yourself in the ancient traditions and modern realities of professional sumo wrestling in Japan. This intimate documentary reveals the dedication, ritual, and skill behind this revered sport.",
    director: "Hiro Koreeda",
    cinematographer: "Ryuto Kondo",
  },
  {
    title: "Breaking the Ice",
    copy: "Follow a national women's bobsled team as they defy expectations and climate to compete in the Winter Olympics. A story of determination, cultural exchange, and the universal language of sport.",
    director: "Ryan Coogler",
    cinematographer: "Rachel Morrison",
  },
];

const DEFAULT_IMAGES = Array.from(
  { length: 15 },
  (_, i) => `${ASSET_BASE}/img${i + 1}.jpg`,
);

const ANIMATED_SELECTOR =
  ".csg-title h1, .csg-info p .csg-line span, .csg-credits p, .csg-director p, .csg-cinematographer p";

export default function CatalogSwapGallery({
  items = DEFAULT_ITEMS,
  images = DEFAULT_IMAGES,
  brand = "BLANK",
  navLinks = ["Home", "Work", "Contact"],
  intro = "We are a full-service creative agency delivering innovative design solutions for businesses around the globe.",
  className,
}: CatalogSwapGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(SplitText);

    const blurryPrev = root.querySelector<HTMLElement>(".csg-blurry-prev");
    const projectPreview = root.querySelector<HTMLElement>(
      ".csg-project-preview",
    );
    const gallery = root.querySelector<HTMLElement>(".csg-gallery");
    if (!blurryPrev || !projectPreview || !gallery) return;

    let activeItemIndex = 0;
    let isAnimating = false;

    const splitIntoLines = (element: HTMLElement) => {
      const split = SplitText.create(element, { type: "lines" });
      const lines = split.lines.map((l) => l.textContent ?? "");
      element.innerHTML = "";
      for (const text of lines) {
        const lineDiv = document.createElement("div");
        lineDiv.className = "csg-line";
        const span = document.createElement("span");
        span.textContent = text;
        lineDiv.appendChild(span);
        element.appendChild(lineDiv);
      }
    };

    const initialInfo = root.querySelector<HTMLElement>(".csg-info p");
    if (initialInfo) splitIntoLines(initialInfo);
    gsap.set(root.querySelectorAll(ANIMATED_SELECTOR), { y: 0 });

    const withClass = (tag: string, cls: string) => {
      const el = document.createElement(tag);
      el.classList.add(cls);
      return el;
    };

    const buildDetails = (item: CatalogItem, index: number) => {
      const details = withClass("div", "csg-project-details");
      const structure: Array<[string, string, string]> = [
        ["csg-title", "h1", item.title],
        ["csg-info", "p", item.copy],
        ["csg-credits", "p", "Credits"],
        ["csg-director", "p", `Director: ${item.director}`],
        [
          "csg-cinematographer",
          "p",
          `Cinematographer: ${item.cinematographer}`,
        ],
      ];
      for (const [cls, tag, content] of structure) {
        const wrap = withClass("div", cls);
        const el = document.createElement(tag);
        el.textContent = content;
        wrap.appendChild(el);
        details.appendChild(wrap);
      }
      const imgWrap = withClass("div", "csg-project-img");
      const img = document.createElement("img");
      img.src = images[index] ?? "";
      img.alt = item.title;
      img.draggable = false;
      imgWrap.appendChild(img);
      return {
        details,
        imgWrap,
        infoP: details.querySelector<HTMLElement>(".csg-info p"),
      };
    };

    const handleItemClick = (index: number) => {
      if (index === activeItemIndex || isAnimating) return;
      isAnimating = true;
      const item = items[index];

      gallery.children[activeItemIndex]?.classList.remove("active");
      gallery.children[index]?.classList.add("active");
      activeItemIndex = index;

      const outgoing = root.querySelectorAll(ANIMATED_SELECTOR);
      const currentImgWrap =
        root.querySelector<HTMLElement>(".csg-project-img");
      const currentImg = currentImgWrap?.querySelector("img") ?? null;

      const newBlurry = document.createElement("img");
      newBlurry.src = images[index] ?? "";
      newBlurry.alt = item.title;
      newBlurry.draggable = false;
      gsap.set(newBlurry, {
        opacity: 0,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      });
      blurryPrev.insertBefore(newBlurry, blurryPrev.firstChild);

      const currentBlurry =
        blurryPrev.querySelector<HTMLImageElement>("img:nth-child(2)");
      if (currentBlurry) {
        gsap.to(currentBlurry, {
          opacity: 0,
          duration: 1,
          delay: 0.5,
          ease: "power2.inOut",
          onComplete: () => currentBlurry.remove(),
        });
      }
      gsap.to(newBlurry, {
        delay: 0.5,
        opacity: 1,
        duration: 1,
        ease: "power2.inOut",
      });

      gsap.to(outgoing, {
        y: -60,
        duration: 1,
        ease: "power4.in",
        stagger: 0.05,
      });

      if (currentImgWrap) {
        gsap.to(currentImgWrap, {
          onStart: () => {
            if (currentImg)
              gsap.to(currentImg, { scale: 2, duration: 1, ease: "power4.in" });
          },
          scale: 0,
          bottom: "10em",
          duration: 1,
          ease: "power4.in",
          onComplete: () => {
            root.querySelector(".csg-project-details")?.remove();
            currentImgWrap.remove();

            const { details, imgWrap, infoP } = buildDetails(item, index);
            projectPreview.appendChild(details);
            projectPreview.appendChild(imgWrap);
            if (infoP) splitIntoLines(infoP);

            const incoming = details.querySelectorAll(ANIMATED_SELECTOR);
            gsap.fromTo(
              incoming,
              { y: 40 },
              { y: 0, duration: 1, ease: "power4.out", stagger: 0.05 },
            );
            gsap.fromTo(
              imgWrap,
              { scale: 0, bottom: "-10em" },
              { scale: 1, bottom: "1em", duration: 1, ease: "power4.out" },
            );
            gsap.fromTo(
              imgWrap.querySelector("img"),
              { scale: 2 },
              {
                scale: 1,
                duration: 1,
                ease: "power4.out",
                onComplete: () => {
                  isAnimating = false;
                },
              },
            );
          },
        });
      } else {
        isAnimating = false;
      }
    };

    const offs: Array<() => void> = [];
    const thumbs = gallery.querySelectorAll<HTMLElement>(".csg-item");
    thumbs.forEach((thumb, i) => {
      const handler = () => handleItemClick(i);
      thumb.addEventListener("click", handler);
      offs.push(() => thumb.removeEventListener("click", handler));
    });

    return () => {
      for (const off of offs) off();
    };
  }, [items, images]);

  const first = items[0];

  return (
    <div
      className={className ? `csg-root ${className}` : "csg-root"}
      ref={rootRef}
    >
      <style>{styles}</style>

      <div className="csg-blurry-prev">
        <img alt="" draggable={false} src={images[0]} />
        <div className="csg-overlay" />
      </div>

      <div className="csg-col csg-site-info">
        <nav className="csg-nav">
          {navLinks.map((link) => (
            <a href="#top" key={link}>
              {link}
            </a>
          ))}
        </nav>
        <div className="csg-header">
          <h1>Welcome to {brand}</h1>
        </div>
        <div className="csg-copy">
          <p>{intro}</p>
        </div>
      </div>

      <div className="csg-col csg-project-preview">
        <div className="csg-project-details">
          <div className="csg-title">
            <h1>{first?.title}</h1>
          </div>
          <div className="csg-info">
            <p>{first?.copy}</p>
          </div>
          <div className="csg-credits">
            <p>Credits</p>
          </div>
          <div className="csg-director">
            <p>Director: {first?.director}</p>
          </div>
          <div className="csg-cinematographer">
            <p>Cinematographer: {first?.cinematographer}</p>
          </div>
        </div>
        <div className="csg-project-img">
          <img alt={first?.title} draggable={false} src={images[0]} />
        </div>
      </div>

      <div className="csg-gallery-wrapper">
        <div className="csg-gallery">
          {images.map((src, i) => (
            <div className={i === 0 ? "csg-item active" : "csg-item"} key={src}>
              <img alt={items[i]?.title ?? ""} draggable={false} src={src} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..900&display=swap");

.csg-root {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  background-color: #0f0f0f;
  color: #fff;
  font-family: "DM Sans", sans-serif;
}

.csg-root img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.csg-root h1 {
  margin: 0;
  color: #fff;
  font-size: clamp(1.5rem, 3vw, 36px);
  font-weight: 500;
}

.csg-root a,
.csg-root p {
  margin: 0;
  text-decoration: none;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.csg-blurry-prev {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.csg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(80px);
  -webkit-backdrop-filter: blur(80px);
}

.csg-col {
  position: relative;
  padding: 1em;
}

.csg-site-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.csg-nav {
  display: flex;
  gap: 1em;
}

.csg-header {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.csg-project-preview {
  flex: 2;
}

.csg-project-details {
  position: absolute;
  top: 1em;
  left: 1em;
  width: 50%;
}

.csg-title {
  margin-bottom: 0.5em;
}

.csg-info {
  margin-bottom: 1em;
}

.csg-title,
.csg-credits,
.csg-director,
.csg-cinematographer,
.csg-line {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.csg-title h1 {
  position: relative;
  will-change: transform;
}

.csg-info p .csg-line span,
.csg-credits p,
.csg-director p,
.csg-cinematographer p {
  display: inline-block;
  position: relative;
  will-change: transform;
}

.csg-project-img {
  position: absolute;
  left: 1em;
  bottom: 1em;
  width: 75%;
  height: 50%;
  overflow: hidden;
  will-change: transform;
}

.csg-project-img img {
  will-change: transform;
}

.csg-gallery-wrapper {
  z-index: 2;
  overflow: auto;
  padding: 0.75em;
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  scrollbar-width: none;
}
.csg-gallery-wrapper::-webkit-scrollbar {
  display: none;
}

.csg-gallery {
  width: 100px;
  height: 300%;
  display: flex;
  flex-direction: column;
  gap: 0.75em;
}

.csg-item {
  position: relative;
  flex: 1;
  min-height: 6em;
  background-color: #aeaeae;
  cursor: pointer;
}

.csg-item::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  transition: background-color 0.5s ease-in-out;
  transition-delay: 0.5s;
}

.csg-item.active::after {
  background-color: rgba(0, 0, 0, 0);
}

@media (max-width: 900px) {
  .csg-root {
    flex-direction: column;
  }

  .csg-site-info {
    flex: 0.5;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .csg-header {
    top: unset;
    bottom: 1em;
    transform: none;
  }

  .csg-site-info .csg-copy {
    display: none;
  }

  .csg-project-details {
    width: calc(100% - 1em);
  }

  .csg-project-img {
    width: 93%;
  }

  .csg-gallery-wrapper {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .csg-gallery {
    width: 300%;
    height: 100px;
    flex-direction: row;
  }
}
`;

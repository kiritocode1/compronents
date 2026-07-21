"use client";

/**
 * Dither Studio Page, a full-bleed agency homepage.
 *
 * The whole page sits on a fixed WebGL dither field that drifts and warps
 * toward the cursor. A pill nav floats top-centre carrying a morphing pixel
 * mark and a message that rolls over per section, and unfolds into a full menu
 * with a page-wide blur behind it. A right rail stacks a contact card and
 * collapsible panels that follow the section in view. Case rows expand in
 * place, thumbnails smear into coarse pixels under the cursor, and a label
 * chases the pointer across anything hoverable. A status rail is pinned to the
 * bottom with a live clock, and on load a counter runs to 100% before the
 * dither plate dissolves from its thinnest areas outward.
 *
 * No media is bundled: every image slot renders seeded procedural plate art
 * through the same dither, and props accept real footage.
 *
 * BLANK - aryank.space
 */

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { DitherEngine, DitherMedia } from "./dither-canvas";
import { MonoReveal, REVEAL_STYLES, TextReveal } from "./reveals";

/* ------------------------------------------------------------------ */
/* content                                                             */
/* ------------------------------------------------------------------ */

const SCRAMBLE_CHARS = "#_$(*0&%@!/\\<>[]{}";

/** One message per section; the pill rolls to it as the section scrolls in. */
const SECTION_MESSAGES: Record<string, string> = {
  top: "YOU MADE IT",
  work: "RECEIPTS BELOW",
  studio: "TRICKS WE KNOW",
  clients: "IN GOOD COMPANY",
  culture: "THE HUMANS BEHIND IT",
  contact: "SAY THE WORD",
};

/** 4x4 pixel-mark patterns, one per section, morphed between on scroll. */
const MARK_PATTERNS: Record<string, number[]> = {
  top: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  work: [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1],
  studio: [0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0],
  clients: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1],
  culture: [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
  contact: [1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1],
};

interface CaseEntry {
  title: string;
  tags: string[];
  year: string;
  accent: string;
  seeds: number[];
}

const CASES: CaseEntry[] = [
  {
    title: "Northwind",
    tags: ["Branding", "Experience", "Portfolio"],
    year: "2026",
    accent: "#e75d60",
    seeds: [11, 12, 13, 14, 15],
  },
  {
    title: "Alder",
    tags: ["Branding", "Corporate"],
    year: "2026",
    accent: "#dcf2f4",
    seeds: [21, 22, 23, 24],
  },
  {
    title: "Postmark",
    tags: ["Product", "Design system"],
    year: "2025",
    accent: "#ffc6da",
    seeds: [31, 32, 33, 34, 35],
  },
  {
    title: "Halcyon",
    tags: ["Identity", "Motion"],
    year: "2025",
    accent: "#d0ff7e",
    seeds: [41, 42, 43, 44],
  },
  {
    title: "Fieldnote",
    tags: ["Campaign", "Experience"],
    year: "2024",
    accent: "#f4e3c2",
    seeds: [51, 52, 53, 54, 55],
  },
  {
    title: "Grainstore",
    tags: ["E-commerce", "Branding"],
    year: "2024",
    accent: "#9fb8ff",
    seeds: [61, 62, 63, 64],
  },
];

const SERVICE_COLUMNS = [
  {
    label: "[ Design ]",
    items: [
      "Brand strategy",
      "Identity systems",
      "Art direction",
      "Type and layout",
      "Campaign",
      "Photo direction",
      "3D and render",
    ],
  },
  {
    label: "[ Engineering ]",
    items: [
      "Design engineering",
      "Front-end builds",
      "Creative tooling",
      "WebGL and shaders",
      "Headless commerce",
      "Performance passes",
      "Accessibility sweeps",
    ],
  },
  {
    label: "[ Motion ]",
    items: [
      "Motion identity",
      "Scroll choreography",
      "Micro interactions",
      "Video direction",
      "Title sequences",
      "Prototype films",
    ],
  },
];

const CLIENTS = [
  "Northwind",
  "Alder & Co",
  "Postmark",
  "Vector",
  "Halcyon",
  "Fieldnote",
  "Tessellate",
  "Grainstore",
];

const MENU_ITEMS = [
  { label: "Work", href: "#work" },
  {
    label: "What we do",
    children: [
      { label: "Design", href: "#studio" },
      { label: "Engineering", href: "#studio" },
      { label: "Motion", href: "#studio" },
    ],
  },
  { label: "About us", href: "#culture" },
  { label: "Careers", href: "mailto:hello@aryank.space", external: true },
  { label: "Contact", href: "#contact" },
];

const CONTACT_MAIL = "mailto:hello@aryank.space";

/* ------------------------------------------------------------------ */
/* hooks                                                               */
/* ------------------------------------------------------------------ */

function useClock() {
  const [now, setNow] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(
        [d.getHours(), d.getMinutes(), d.getSeconds()]
          .map((n) => String(n).padStart(2, "0"))
          .join(" : "),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Settles `text` into place from random glyphs, one character at a time. */
function useScramble(text: string, run: boolean) {
  const [out, setOut] = useState(run ? "" : text);
  useEffect(() => {
    if (!run) {
      setOut(text);
      return;
    }
    let frame = 0;
    const total = text.length * 2;
    const id = window.setInterval(() => {
      frame += 1;
      const settled = Math.floor((frame / total) * text.length);
      setOut(
        text
          .split("")
          .map((ch, i) => {
            if (i < settled || ch === " ") return ch;
            return SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
            ];
          })
          .join(""),
      );
      if (frame >= total) {
        setOut(text);
        window.clearInterval(id);
      }
    }, 40);
    return () => window.clearInterval(id);
  }, [text, run]);
  return out;
}

/** Reports which page section currently owns the viewport. */
function useActiveSection(rootRef: React.RefObject<HTMLDivElement | null>) {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>("[data-section]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.getAttribute("data-section") ?? "top");
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const s of sections) io.observe(s);
    return () => io.disconnect();
  }, [rootRef]);
  return active;
}

/* ------------------------------------------------------------------ */
/* small pieces                                                        */
/* ------------------------------------------------------------------ */

/** The 4x4 pixel mark; cells fade between per-section patterns. */
function PixelMark({ section }: { section: string }) {
  const pattern = MARK_PATTERNS[section] ?? MARK_PATTERNS.top;
  return (
    <span className="dsp-mark" aria-hidden="true">
      {pattern.map((on, i) => (
        <i key={i} style={{ opacity: on ? 1 : 0 }} />
      ))}
    </span>
  );
}

/** Message that rolls out and in whenever its text changes. */
function RollingMessage({ text }: { text: string }) {
  return (
    <span className="dsp-roll-message" key={text}>
      {text}
    </span>
  );
}

/**
 * Bordered mono button with the site's hover: a fill wipes in while a second
 * copy of the label rolls up over the first, and the arrow flips corners.
 */
function RollButton({
  children,
  href,
  onClick,
  arrow = true,
  filled = false,
  className,
}: {
  children: string;
  href?: string;
  onClick?: () => void;
  arrow?: boolean;
  filled?: boolean;
  className?: string;
}) {
  const inner = (
    <>
      <span className="dsp-btn-face">
        <span className="dsp-btn-roll">
          <span>{children}</span>
          <span aria-hidden="true">{children}</span>
        </span>
        {arrow ? (
          <span className="dsp-btn-arrow" aria-hidden="true">
            <svg viewBox="0 0 7 7" fill="none">
              <path d="M1 6L6 1M6 1H1.8M6 1V5.2" stroke="currentColor" />
            </svg>
          </span>
        ) : null}
      </span>
    </>
  );
  const cls = `dsp-btn${filled ? " dsp-btn--filled" : ""}${className ? ` ${className}` : ""}`;
  return href ? (
    <a className={cls} href={href}>
      {inner}
    </a>
  ) : (
    <button type="button" className={cls} onClick={onClick}>
      {inner}
    </button>
  );
}

/** Contact card: avatar plate plus a label that swaps on hover. */
function ContactCard({
  label,
  hoverLabel,
  avatarSrc,
  href,
  solid = false,
}: {
  label: string;
  hoverLabel: string;
  avatarSrc?: string;
  href: string;
  solid?: boolean;
}) {
  return (
    <a className={`dsp-card${solid ? " dsp-card--solid" : ""}`} href={href}>
      <span className="dsp-card-avatar">
        {avatarSrc ? (
          <img src={avatarSrc} alt="" />
        ) : (
          <DitherMedia seed={7} accent="#f4e3c2" className="dsp-fill" />
        )}
      </span>
      <span className="dsp-card-roll">
        <span>{label}</span>
        <span aria-hidden="true">{hoverLabel}</span>
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* cursor label                                                        */
/* ------------------------------------------------------------------ */

/**
 * A pill that chases the pointer with a lerp. Any element carrying
 * `data-cursor="Label"` summons it; leaving the element hides it.
 */
function CursorLabel({
  rootRef,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const pillRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const pos = { x: -100, y: -100 };
    const target = { x: -100, y: -100 };
    let raf = 0;
    let visible = false;

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      pill.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX + 14;
      target.y = e.clientY - 14;
      const hit = (e.target as HTMLElement | null)?.closest?.("[data-cursor]");
      const next = hit?.getAttribute("data-cursor") ?? "";
      if (next && !visible) {
        pos.x = target.x;
        pos.y = target.y;
      }
      if (next !== (visible ? pill.dataset.label : "")) {
        pill.dataset.label = next;
        setLabel(next || "");
      }
      visible = Boolean(next);
      pill.style.opacity = next ? "1" : "0";
    };

    raf = requestAnimationFrame(loop);
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
    };
  }, [rootRef]);

  return (
    <div ref={pillRef} className="dsp-cursor" aria-hidden="true">
      {label}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* showreel modal                                                      */
/* ------------------------------------------------------------------ */

const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");

/** Fullscreen player with the page's own chrome: a hairline progress bar you
 * can scrub, rolled mono labels for play and mute, and a live timecode. */
function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onTime = () => setTime(vid.currentTime);
    const onMeta = () => setDuration(vid.duration || 0);
    vid.addEventListener("timeupdate", onTime);
    vid.addEventListener("loadedmetadata", onMeta);
    vid.play().catch(() => setPlaying(false));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      vid.removeEventListener("timeupdate", onTime);
      vid.removeEventListener("loadedmetadata", onMeta);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const toggle = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setPlaying(true);
    } else {
      vid.pause();
      setPlaying(false);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const vid = videoRef.current;
    const bar = barRef.current;
    if (!vid || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    vid.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  return (
    <div className="dsp-modal">
      {/* biome-ignore lint/a11y/useMediaCaption: showreel footage is decorative */}
      <video ref={videoRef} src={src} loop playsInline muted={muted} />
      <div className="dsp-modal-controls">
        <div
          ref={barRef}
          className="dsp-modal-bar"
          onClick={seek}
          role="presentation"
        >
          <i
            style={{
              transform: `scaleX(${duration ? time / duration : 0})`,
            }}
          />
        </div>
        <button type="button" onClick={toggle}>
          {playing ? "Pause" : "Play"}
        </button>
        <span className="dsp-modal-time">
          {pad2(time / 60)} : {pad2(time % 60)} / {pad2(duration / 60)} :{" "}
          {pad2(duration % 60)}
        </span>
        <span className="dsp-modal-gap" />
        <button type="button" onClick={() => setMuted((m) => !m)}>
          {muted ? "Unmute" : "Mute"}
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the page                                                            */
/* ------------------------------------------------------------------ */

export interface DitherStudioPageProps {
  /** Hero backdrop footage; rendered through the duotone dither. */
  heroVideoSrc?: string;
  /** Still fallback for the hero plate. */
  heroPoster?: string;
  /** Footage for the "This is us" rail panel and its dithered preview. */
  reelVideoSrc?: string;
  /** Still fallback for the rail panel. */
  reelPoster?: string;
  /** Avatar shown in the contact cards. */
  avatarSrc?: string;
  className?: string;
  style?: CSSProperties;
}

export default function DitherStudioPage({
  heroVideoSrc,
  heroPoster,
  reelVideoSrc,
  reelPoster,
  avatarSrc,
  className,
  style,
}: DitherStudioPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // load choreography lives in the engine: the counter mirrors its fill,
  // then the plate dissolves and `revealed` flips
  const [count, setCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const active = useActiveSection(rootRef);
  const clock = useClock();
  const eyebrow = useScramble("[ WE ARE BLANK ]", revealed);

  // menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  // right rail: one open panel, follows the section in view until touched
  const [openPanel, setOpenPanel] = useState<string | null>("reel");
  const panelTouched = useRef(false);
  useEffect(() => {
    if (panelTouched.current) return;
    if (active === "studio") setOpenPanel("deck");
    else if (active === "culture") setOpenPanel("talk");
    else if (active === "top") setOpenPanel("reel");
  }, [active]);
  const togglePanel = useCallback((id: string) => {
    panelTouched.current = true;
    setOpenPanel((p) => (p === id ? null : id));
  }, []);

  // cases accordion
  const [openCase, setOpenCase] = useState<number | null>(null);

  // showreel modal
  const [modalOpen, setModalOpen] = useState(false);

  // language toggle, purely ornamental like the rest of the status rail
  const [lang, setLang] = useState<"EN" | "NL">("EN");

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, []);

  return (
    <div
      ref={rootRef}
      className={`dither-studio-page${revealed ? "" : " is-loading"}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped component stylesheet
        dangerouslySetInnerHTML={{ __html: STYLES + REVEAL_STYLES }}
      />

      {/* the engine: field, hero footage, cursor fluid, and the load plate */}
      <DitherEngine
        className="dsp-engine"
        videoSrc={heroVideoSrc}
        onProgress={(p) => setCount(Math.round(p * 100))}
        onDone={() => setRevealed(true)}
      />
      {!revealed ? (
        <div className="dsp-loader" aria-hidden="true">
          <span className="dsp-loader-count">{count}%</span>
        </div>
      ) : null}

      {/* menu blur */}
      <div
        className={`dsp-blur${menuOpen ? " is-on" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* pill nav */}
      <header className={`dsp-nav${menuOpen ? " is-open" : ""}`}>
        <div className="dsp-nav-bar">
          <a
            className="dsp-nav-mark"
            href="#top"
            aria-label="BLANK, back to top"
          >
            <PixelMark section={active} />
          </a>
          <div className="dsp-nav-message">
            <RollingMessage text={SECTION_MESSAGES[active] ?? "HELLO"} />
          </div>
          <button
            type="button"
            className="dsp-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <i />
            <i />
            <i />
          </button>
        </div>

        <div className="dsp-menu" aria-hidden={!menuOpen}>
          <div className="dsp-menu-clip">
            <nav className="dsp-menu-items">
              {MENU_ITEMS.map((item, i) =>
                item.children ? (
                  <div className="dsp-menu-group" key={item.label}>
                    <button
                      type="button"
                      className="dsp-menu-item"
                      style={{
                        transitionDelay: menuOpen ? `${i * 45}ms` : "0ms",
                      }}
                      onClick={() => setDropOpen((o) => !o)}
                    >
                      <span>{item.label}</span>
                      <span className="dsp-menu-plus" aria-hidden="true">
                        {dropOpen ? "-" : "+"}
                      </span>
                    </button>
                    <div
                      className={`dsp-menu-children${dropOpen ? " is-open" : ""}`}
                    >
                      <div>
                        {item.children.map((child) => (
                          <a
                            className="dsp-menu-item dsp-menu-item--child"
                            key={child.label}
                            href={child.href}
                            onClick={closeMenu}
                          >
                            <span>{child.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <a
                    className="dsp-menu-item"
                    key={item.label}
                    href={item.href}
                    style={{
                      transitionDelay: menuOpen ? `${i * 45}ms` : "0ms",
                    }}
                    onClick={closeMenu}
                  >
                    <span>{item.label}</span>
                    {item.external ? (
                      <span className="dsp-menu-ext" aria-hidden="true">
                        <svg viewBox="0 0 7 7" fill="none">
                          <path
                            d="M1 6L6 1M6 1H1.8M6 1V5.2"
                            stroke="currentColor"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </a>
                ),
              )}
            </nav>
            <div className="dsp-menu-foot">
              <RollButton
                href={CONTACT_MAIL}
                arrow={false}
                className="dsp-menu-deck"
              >
                Our pitchdeck
              </RollButton>
              <div className="dsp-menu-ctas">
                <RollButton href={CONTACT_MAIL} arrow={false} filled>
                  Schedule a call
                </RollButton>
                <RollButton href={CONTACT_MAIL} arrow={false} filled>
                  Start a project
                </RollButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* right rail */}
      <aside className="dsp-rail">
        <ContactCard
          label="Get in touch"
          hoverLabel="hello@aryank.space"
          avatarSrc={avatarSrc}
          href={CONTACT_MAIL}
          solid
        />

        {[
          { id: "reel", title: "This is us" },
          { id: "deck", title: "Pitchdeck" },
          { id: "talk", title: "The talk" },
        ].map((panel) => (
          <div
            className={`dsp-panel${openPanel === panel.id ? " is-open" : ""}`}
            key={panel.id}
          >
            <button
              type="button"
              className="dsp-panel-toggle"
              onClick={() => togglePanel(panel.id)}
            >
              <span>{panel.title}</span>
              <span>( {openPanel === panel.id ? "-" : "+"} )</span>
            </button>
            <div className="dsp-panel-body">
              <div className="dsp-panel-inner">
                {panel.id === "reel" ? (
                  <button
                    type="button"
                    className="dsp-panel-media"
                    data-cursor="Play +"
                    aria-label="Play the showreel"
                    onClick={() => {
                      if (reelVideoSrc || heroVideoSrc) setModalOpen(true);
                    }}
                  >
                    {reelVideoSrc ? (
                      <DitherMedia
                        src={reelVideoSrc}
                        video
                        className="dsp-fill"
                      />
                    ) : reelPoster ? (
                      <DitherMedia src={reelPoster} className="dsp-fill" />
                    ) : (
                      <DitherMedia
                        seed={91}
                        accent="#ffc6da"
                        className="dsp-fill"
                      />
                    )}
                  </button>
                ) : null}
                {panel.id === "deck" ? (
                  <div className="dsp-panel-deck" data-cursor="Open +">
                    <DitherMedia
                      seed={91}
                      accent="#f4e3c2"
                      className="dsp-deck-card"
                    />
                    <DitherMedia
                      seed={92}
                      accent="#dcf2f4"
                      className="dsp-deck-card"
                    />
                    <DitherMedia
                      seed={93}
                      accent="#e75d60"
                      className="dsp-deck-card"
                    />
                  </div>
                ) : null}
                {panel.id === "talk" ? (
                  <div className="dsp-panel-media" data-cursor="Watch +">
                    <DitherMedia
                      seed={94}
                      accent="#d0ff7e"
                      className="dsp-fill"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </aside>

      {/* cursor chaser */}
      <CursorLabel rootRef={rootRef} />

      {/* showreel modal */}
      {modalOpen && (reelVideoSrc || heroVideoSrc) ? (
        <VideoModal
          src={(reelVideoSrc ?? heroVideoSrc) as string}
          onClose={() => setModalOpen(false)}
        />
      ) : null}

      <main className="dsp-main">
        {/* hero: the engine paints the footage, the section carries the type */}
        <section className="dsp-hero" id="top" data-section="top">
          {!heroVideoSrc && heroPoster ? (
            <DitherMedia src={heroPoster} className="dsp-hero-plate" />
          ) : null}
          <div className="dsp-hero-body">
            <div className="dsp-hero-left">
              <p className="dsp-eyebrow">{eyebrow}</p>
              {revealed ? (
                <TextReveal
                  as="h1"
                  className="dsp-hero-title"
                  lines={[
                    "A creative studio that",
                    "ships the loud version",
                    "or not at all.",
                  ]}
                />
              ) : (
                <h1 className="dsp-hero-title" style={{ opacity: 0 }}>
                  A creative studio that ships the loud version or not at all.
                </h1>
              )}
            </div>
            <p className="dsp-hero-copy">
              We craft brands, products and interfaces that hit harder, run
              faster and hold up under real use. With heart, with craft, and
              with a team that is all in or not at all.
            </p>
          </div>
        </section>

        {/* featured cases */}
        <section className="dsp-section" id="work" data-section="work">
          <div className="dsp-cases-head">
            <TextReveal
              as="h2"
              className="dsp-cases-title"
              lines={[
                "     We partner with teams",
                "that would rather ship than",
                "posture. A taste of the work",
                "we loved making.",
              ]}
            />
            <p className="dsp-label">
              <MonoReveal>[ Featured work ]</MonoReveal>
            </p>
          </div>

          <div className="dsp-cases">
            {CASES.map((entry, index) => {
              const open = openCase === index;
              return (
                <article
                  className={`dsp-case${open ? " is-open" : ""}`}
                  key={entry.title}
                >
                  <button
                    type="button"
                    className="dsp-case-row"
                    data-cursor={open ? "Close -" : "Work +"}
                    onClick={() => setOpenCase(open ? null : index)}
                    aria-expanded={open}
                  >
                    <h3 className="dsp-case-title">{entry.title}</h3>
                    <span className="dsp-case-tags">
                      {entry.tags.map((tag) => (
                        <span className="dsp-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </span>
                    <span className="dsp-case-view" aria-hidden="true">
                      ({" "}
                      <span className="dsp-case-sign">{open ? "-" : "+"}</span>{" "}
                      )
                    </span>
                    <span className="dsp-case-thumbs" aria-hidden="true">
                      {entry.seeds.map((seed) => (
                        <DitherMedia
                          key={seed}
                          seed={seed}
                          accent={entry.accent}
                          className="dsp-thumb"
                        />
                      ))}
                    </span>
                  </button>

                  <div className="dsp-case-detail">
                    <div className="dsp-case-detail-inner">
                      <div className="dsp-case-media">
                        {entry.seeds.slice(0, 3).map((seed) => (
                          <DitherMedia
                            key={seed}
                            seed={seed + 100}
                            accent={entry.accent}
                            className="dsp-case-big"
                          />
                        ))}
                      </div>
                      <div className="dsp-case-actions">
                        <RollButton href={CONTACT_MAIL}>View case</RollButton>
                        <RollButton href={CONTACT_MAIL}>
                          Visit website
                        </RollButton>
                        <span className="dsp-case-year">{entry.year}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* services */}
        <section
          className="dsp-section dsp-services"
          id="studio"
          data-section="studio"
        >
          <TextReveal as="h2" className="dsp-display" lines={["WHAT WE DO."]} />

          <div className="dsp-services-pills">
            <RollButton href="#work">Design</RollButton>
            <RollButton href="#work">Engineering</RollButton>
            <RollButton href="#work">Motion</RollButton>
          </div>

          <TextReveal
            as="p"
            className="dsp-services-lede"
            lines={[
              "We design the brand, build the",
              "product and wire the motion that",
              "carries both. Sharp design, smart",
              "code, and the patience to sweat",
              "the last five percent.",
            ]}
          />

          <div className="dsp-services-grid">
            <div className="dsp-services-call">
              <p>Short version: if it renders, we do it. Say hello:</p>
              <ContactCard
                label="hello@aryank.space"
                hoverLabel="Press send"
                avatarSrc={avatarSrc}
                href={CONTACT_MAIL}
              />
            </div>
            {SERVICE_COLUMNS.map((column) => (
              <div className="dsp-service-col" key={column.label}>
                <p className="dsp-label">
                  <MonoReveal>{column.label}</MonoReveal>
                </p>
                <ul>
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* clients marquee */}
        <section
          className="dsp-section dsp-clients"
          id="clients"
          data-section="clients"
        >
          <p className="dsp-label">
            <MonoReveal>[ Good company ]</MonoReveal>
          </p>
          <div className="dsp-marquee">
            <div className="dsp-marquee-track">
              {[0, 1].map((copy) => (
                <span
                  className="dsp-marquee-group"
                  key={copy}
                  aria-hidden={copy === 1}
                >
                  {CLIENTS.map((client) => (
                    <span className="dsp-marquee-item" key={client}>
                      {client}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* culture */}
        <section
          className="dsp-section dsp-culture"
          id="culture"
          data-section="culture"
        >
          <div className="dsp-culture-left">
            <div className="dsp-culture-pair">
              <DitherMedia
                seed={71}
                accent="#f4e3c2"
                className="dsp-culture-thumb"
              />
              <DitherMedia
                seed={72}
                accent="#dcf2f4"
                className="dsp-culture-thumb"
              />
            </div>
            <p className="dsp-culture-caption">
              <MonoReveal>
                Terminally online, dangerously caffeinated
              </MonoReveal>
            </p>
            <TextReveal
              as="h3"
              className="dsp-culture-title"
              lines={[
                "     A small crew that cares",
                "loudly, ships weekly and argues",
                "about kerning at lunch. When the",
                "culture is right, the work",
                "takes off.",
              ]}
            />
            <RollButton href={CONTACT_MAIL} className="dsp-culture-btn">
              The culture
            </RollButton>
          </div>
          <div className="dsp-culture-right" data-cursor="The crew +">
            <DitherMedia seed={73} accent="#e75d60" className="dsp-fill" />
          </div>
        </section>

        {/* footer */}
        <footer
          className="dsp-section dsp-footer"
          id="contact"
          data-section="contact"
        >
          <div className="dsp-footer-left">
            <TextReveal
              as="h2"
              className="dsp-display"
              lines={["START", "SOMETHING."]}
            />
            <ContactCard
              label="hello@aryank.space"
              hoverLabel="Press send"
              avatarSrc={avatarSrc}
              href={CONTACT_MAIL}
            />
          </div>
          <div className="dsp-footer-right">
            <p className="dsp-label">
              <MonoReveal>[ Get in touch ]</MonoReveal>
            </p>
            <p className="dsp-footer-copy">
              Tell us what you are building. We will bring the sharp edges.
            </p>
            <div className="dsp-footer-ctas">
              <RollButton href={CONTACT_MAIL}>Start a project</RollButton>
              <RollButton href={CONTACT_MAIL}>Schedule a call</RollButton>
            </div>
          </div>
        </footer>
      </main>

      {/* fixed status rail */}
      <div className="dsp-status" aria-hidden={!revealed}>
        <div className="dsp-status-bar">
          <span className="dsp-status-item">Certified pixel freaks</span>
          <span className="dsp-status-item">Web based since 2019</span>
          <span className="dsp-status-clock">
            [ <i className="dsp-dot" /> {clock} ]
          </span>
          <span className="dsp-status-gap" />
          <span className="dsp-status-item">Follow us</span>
          <a className="dsp-status-link" href="https://x.com/blank_spacets">
            x <span aria-hidden="true">+</span>
          </a>
          <a className="dsp-status-link" href="https://github.com/kiritocode1">
            github <span aria-hidden="true">+</span>
          </a>
          <button
            type="button"
            className="dsp-lang"
            onClick={() => setLang((l) => (l === "EN" ? "NL" : "EN"))}
          >
            <span className={lang === "NL" ? "is-on" : ""}>NL</span>
            <i data-side={lang} />
            <span className={lang === "EN" ? "is-on" : ""}>EN</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* styles                                                              */
/* ------------------------------------------------------------------ */

const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Sometype+Mono:wght@400;500&display=swap");
.dither-studio-page {
  --dsp-ground: #1a1c1c;
  --dsp-paper: #f9f4eb;
  --dsp-red: #e75d60;
  --dsp-margin: max(1rem, calc(40 / 1440 * 100vw));
  --dsp-gap: 0.625rem;
  --dsp-radius: 0.25rem;
  --dsp-hair: rgba(249, 244, 235, 0.14);
  position: relative;
  isolation: isolate;
  width: 100%;
  min-height: 100vh;
  background: var(--dsp-ground);
  color: var(--dsp-paper);
  font-family: "Sometype Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}
.dither-studio-page ::selection { background: var(--dsp-paper); color: var(--dsp-ground); }
.dither-studio-page .dsp-fill { position: absolute; inset: 0; width: 100%; height: 100%; }

/* fixed layers: backdrop canvas lives UNDER the DOM; it only jumps above
   everything while the load plate is up */
.dither-studio-page .dsp-engine {
  position: fixed;
  inset: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  pointer-events: none;
}
.dither-studio-page.is-loading .dsp-engine { z-index: 40; }
.dither-studio-page .dsp-loader {
  position: fixed;
  inset: 0;
  z-index: 41;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.dither-studio-page .dsp-loader-count {
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
}
.dither-studio-page .dsp-blur {
  position: fixed;
  inset: 0;
  z-index: 14;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s ease;
}
.dither-studio-page .dsp-blur.is-on { opacity: 1; pointer-events: auto; }

/* pill nav */
.dither-studio-page .dsp-nav {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  width: calc(100vw - 2rem);
  max-width: 27.375rem;
  border-radius: var(--dsp-radius);
  overflow: hidden;
  backdrop-filter: blur(6px);
  background: rgba(5, 6, 6, 0.72);
}
.dither-studio-page .dsp-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.125rem;
  padding: 0 0.8125rem 0 0.5625rem;
  position: relative;
}
.dither-studio-page .dsp-nav-mark { display: block; padding: 0.4rem; }
.dither-studio-page .dsp-mark {
  display: grid;
  grid-template-columns: repeat(4, 0.3rem);
  grid-auto-rows: 0.3rem;
  gap: 0.09rem;
}
.dither-studio-page .dsp-mark i {
  background: var(--dsp-paper);
  transition: opacity 0.5s ease;
}
.dither-studio-page .dsp-nav-message {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
  text-transform: uppercase;
  pointer-events: none;
  white-space: nowrap;
}
.dither-studio-page .dsp-roll-message {
  display: block;
  animation: dsp-roll-in 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes dsp-roll-in {
  from { transform: translateY(110%); }
  to { transform: translateY(0); }
}
.dither-studio-page .dsp-burger {
  display: grid;
  gap: 0.1875rem;
  padding: 0.75rem 0.4375rem;
  background: none;
  border: 0;
  cursor: pointer;
}
.dither-studio-page .dsp-burger i {
  display: block;
  width: 1rem;
  height: 2px;
  background: var(--dsp-paper);
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.dither-studio-page .dsp-nav.is-open .dsp-burger i:nth-child(1) { transform: translateY(0.34rem) rotate(45deg); }
.dither-studio-page .dsp-nav.is-open .dsp-burger i:nth-child(2) { opacity: 0; }
.dither-studio-page .dsp-nav.is-open .dsp-burger i:nth-child(3) { transform: translateY(-0.34rem) rotate(-45deg); }

/* menu */
.dither-studio-page .dsp-menu {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.dither-studio-page .dsp-nav.is-open .dsp-menu { grid-template-rows: 1fr; }
.dither-studio-page .dsp-menu-clip { overflow: hidden; min-height: 0; }
.dither-studio-page .dsp-menu-items { display: flex; flex-direction: column; }
.dither-studio-page .dsp-menu-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 3.125rem;
  padding: 0 1rem 0 2rem;
  border: 0;
  border-top: 1px solid rgba(249, 244, 235, 0.1);
  background: none;
  color: var(--dsp-paper);
  font: inherit;
  font-size: 1.0625rem;
  letter-spacing: -0.01em;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  text-decoration: none;
  text-align: left;
  cursor: pointer;
  opacity: 0;
  transform: translateY(0.5rem);
  transition: opacity 0.4s ease, transform 0.4s ease, background 0.25s ease;
}
.dither-studio-page .dsp-nav.is-open .dsp-menu-item {
  opacity: 1;
  transform: translateY(0);
}
.dither-studio-page .dsp-menu-item:hover { background: rgba(255, 255, 255, 0.08); }
.dither-studio-page .dsp-menu-item--child {
  height: 2.5rem;
  padding-left: 2.7rem;
  font-size: 0.9375rem;
}
.dither-studio-page .dsp-menu-children {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.dither-studio-page .dsp-menu-children.is-open { grid-template-rows: 1fr; }
.dither-studio-page .dsp-menu-children > div { overflow: hidden; min-height: 0; }
.dither-studio-page .dsp-menu-plus,
.dither-studio-page .dsp-menu-ext { font-size: 0.75rem; opacity: 0.85; }
.dither-studio-page .dsp-menu-ext svg { width: 0.55rem; height: 0.55rem; display: block; }
.dither-studio-page .dsp-menu-foot {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.8125rem;
  border-top: 1px solid rgba(249, 244, 235, 0.1);
}
.dither-studio-page .dsp-menu-deck { width: 100%; }
.dither-studio-page .dsp-menu-ctas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
}

/* buttons */
.dither-studio-page .dsp-btn {
  position: relative;
  display: inline-flex;
  border: 0;
  padding: 0;
  background: none;
  color: var(--dsp-paper);
  font: inherit;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  border-radius: var(--dsp-radius);
}
.dither-studio-page .dsp-btn-face {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  height: 3.125rem;
  padding: 0 1rem;
  border: 1px solid rgba(249, 244, 235, 0.2);
  border-radius: var(--dsp-radius);
  overflow: hidden;
  transition: color 0.3s ease;
}
.dither-studio-page .dsp-btn-face::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--dsp-paper);
  transform: translateY(101%);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.dither-studio-page .dsp-btn:hover .dsp-btn-face { color: var(--dsp-ground); }
.dither-studio-page .dsp-btn:hover .dsp-btn-face::before { transform: translateY(0); }
.dither-studio-page .dsp-btn--filled .dsp-btn-face {
  border-color: transparent;
  background: var(--dsp-paper);
  color: var(--dsp-ground);
}
.dither-studio-page .dsp-btn--filled .dsp-btn-face::before { background: rgba(26, 28, 28, 0.12); }
.dither-studio-page .dsp-btn--filled:hover .dsp-btn-face { color: var(--dsp-ground); }
.dither-studio-page .dsp-btn-roll {
  position: relative;
  display: block;
  overflow: hidden;
  height: 1.1em;
}
.dither-studio-page .dsp-btn-roll span {
  display: block;
  height: 1.1em;
  line-height: 1.1em;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.dither-studio-page .dsp-btn:hover .dsp-btn-roll span { transform: translateY(-100%); }
.dither-studio-page .dsp-btn-arrow {
  position: relative;
  width: 0.4375rem;
  height: 0.4375rem;
  z-index: 1;
}
.dither-studio-page .dsp-btn-arrow svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
}
.dither-studio-page .dsp-btn:hover .dsp-btn-arrow svg {
  transform: translate(35%, -35%);
}
.dither-studio-page .dsp-btn-roll,
.dither-studio-page .dsp-btn-arrow { z-index: 1; }

/* contact cards */
.dither-studio-page .dsp-card {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  height: 3.125rem;
  padding: 0 2rem 0 0.6875rem;
  border-radius: var(--dsp-radius);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.6);
  color: var(--dsp-paper);
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
}
.dither-studio-page .dsp-card--solid {
  background: rgba(249, 244, 235, 0.86);
  color: var(--dsp-ground);
  backdrop-filter: blur(6px);
}
.dither-studio-page .dsp-card-avatar {
  position: relative;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.125rem;
  overflow: hidden;
  flex-shrink: 0;
  background: #3a3e3e;
}
.dither-studio-page .dsp-card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.dither-studio-page .dsp-card-roll {
  position: relative;
  display: block;
  overflow: hidden;
  height: 1.2em;
}
.dither-studio-page .dsp-card-roll span {
  display: block;
  height: 1.2em;
  line-height: 1.2em;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.dither-studio-page .dsp-card:hover .dsp-card-roll span { transform: translateY(-100%); }

/* right rail */
.dither-studio-page .dsp-rail {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 13;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 10rem;
}
.dither-studio-page .dsp-rail .dsp-card {
  width: 100%;
  padding-right: 0.5rem;
  gap: 0.7rem;
  justify-content: flex-start;
  font-size: 0.625rem;
}
.dither-studio-page .dsp-panel-toggle span:first-child {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dither-studio-page .dsp-panel-toggle span:last-child { white-space: nowrap; flex-shrink: 0; }
.dither-studio-page .dsp-panel {
  border-radius: var(--dsp-radius);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(6px);
}
.dither-studio-page .dsp-panel-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: 0;
  background: none;
  color: var(--dsp-paper);
  font: inherit;
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
}
.dither-studio-page .dsp-panel-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.dither-studio-page .dsp-panel.is-open .dsp-panel-body { grid-template-rows: 1fr; }
.dither-studio-page .dsp-panel-inner { overflow: hidden; min-height: 0; }
.dither-studio-page .dsp-panel-media {
  position: relative;
  display: block;
  width: calc(100% - 1.5rem);
  height: 12.5rem;
  margin: 0 0.75rem 0.75rem;
  padding: 0;
  border: 0;
  border-radius: 0.125rem;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
}
.dither-studio-page .dsp-panel-deck {
  position: relative;
  height: 5.5rem;
  margin: 0.25rem 0.75rem 0.9rem;
}
.dither-studio-page .dsp-deck-card {
  position: absolute;
  left: 0;
  right: 0;
  height: 4.8rem;
  border-radius: 0.125rem;
  overflow: hidden;
}
.dither-studio-page .dsp-deck-card:nth-child(1) { bottom: 0.9rem; transform: scale(0.9); }
.dither-studio-page .dsp-deck-card:nth-child(2) { bottom: 0.45rem; transform: scale(0.95); }
.dither-studio-page .dsp-deck-card:nth-child(3) { bottom: 0; }

/* showreel modal */
.dither-studio-page .dsp-modal {
  position: fixed;
  inset: 0;
  z-index: 32;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: #000;
}
.dither-studio-page .dsp-modal video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
@media (min-width: 1024px) {
  .dither-studio-page .dsp-modal video { object-fit: cover; }
}
.dither-studio-page .dsp-modal-controls {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.75rem;
  margin: 0 var(--dsp-margin) 1.5rem;
  padding-top: 1rem;
  color: #fff;
  text-transform: uppercase;
}
.dither-studio-page .dsp-modal-bar {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 0.75rem;
  cursor: pointer;
}
.dither-studio-page .dsp-modal-bar::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.25);
}
.dither-studio-page .dsp-modal-bar i {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: currentColor;
  transform-origin: left;
}
.dither-studio-page .dsp-modal-controls button {
  border: 0;
  padding: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-transform: uppercase;
  cursor: pointer;
}
.dither-studio-page .dsp-modal-time { font-variant-numeric: tabular-nums; }
.dither-studio-page .dsp-modal-gap { flex: 1; }

/* cursor label */
.dither-studio-page .dsp-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  padding: 0.25rem 0.55rem;
  border-radius: 0.125rem;
  background: rgba(249, 244, 235, 0.92);
  color: var(--dsp-ground);
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  will-change: transform;
}

/* layout */
.dither-studio-page .dsp-main { position: relative; z-index: 1; }
.dither-studio-page .dsp-section {
  position: relative;
  padding: max(5rem, calc(200 / 1440 * 100vw)) var(--dsp-margin);
}

/* hero */
.dither-studio-page .dsp-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100vh;
  min-height: 100dvh;
  padding: max(5rem, 12vh) var(--dsp-margin) 7.5rem;
  mix-blend-mode: exclusion;
}
.dither-studio-page .dsp-hero-plate {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
}
.dither-studio-page .dsp-hero-body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: end;
}
.dither-studio-page .dsp-eyebrow {
  margin: 0 0 1.5rem;
  min-height: 1em;
  text-transform: uppercase;
}
.dither-studio-page .dsp-hero-title {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(2.75rem, 1.1rem + 3.6vw, 6.25rem);
  font-weight: 700;
  line-height: 0.84;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}
.dither-studio-page .dsp-hero-title .dsp-reveal-line { white-space: nowrap; }
.dither-studio-page .dsp-hero-copy {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  letter-spacing: -0.01em;
  line-height: 1.35;
  max-width: 24rem;
}

/* cases */
.dither-studio-page .dsp-cases-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 3.5rem;
}
.dither-studio-page .dsp-cases-title {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(2rem, 0.75rem + 2.5vw, 4.5rem);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.02em;
  max-width: 24ch;
}
.dither-studio-page .dsp-label {
  margin: 0;
  text-transform: uppercase;
  opacity: 0.9;
}
.dither-studio-page .dsp-cases {
  margin: 0 calc(-1 * var(--dsp-margin));
}
.dither-studio-page .dsp-case { position: relative; }
.dither-studio-page .dsp-case-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(8rem, 14rem) minmax(0, 1fr) auto minmax(0, 38%);
  align-items: center;
  gap: var(--dsp-gap);
  width: 100%;
  padding: 1.5rem var(--dsp-margin);
  border: 0;
  border-top: 1px solid var(--dsp-hair);
  background: none;
  color: var(--dsp-paper);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: opacity 0.3s ease;
}
.dither-studio-page .dsp-cases:hover .dsp-case-row { opacity: 0.45; }
.dither-studio-page .dsp-cases:hover .dsp-case:hover .dsp-case-row { opacity: 1; }
.dither-studio-page .dsp-case-title {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(1.125rem, 1rem + 0.31vw, 1.39rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.dither-studio-page .dsp-case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.125rem;
}
.dither-studio-page .dsp-tag {
  display: inline-flex;
  align-items: center;
  height: 1.375rem;
  padding: 0.1rem 0.5rem 0;
  border-radius: 0.125rem;
  background: rgba(0, 0, 0, 0.55);
  text-transform: uppercase;
}
.dither-studio-page .dsp-case-view { white-space: nowrap; opacity: 0.9; }
.dither-studio-page .dsp-case-thumbs {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  height: 5.5rem;
}
.dither-studio-page .dsp-thumb {
  position: relative;
  width: 5.5rem;
  height: 100%;
  flex-shrink: 0;
  border-radius: 0.125rem;
  overflow: hidden;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.dither-studio-page .dsp-case:hover .dsp-thumb { transform: translateY(-0.25rem); }
.dither-studio-page .dsp-case:hover .dsp-thumb:nth-child(even) { transform: translateY(0.25rem); }
.dither-studio-page .dsp-case-detail {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.dither-studio-page .dsp-case.is-open .dsp-case-detail { grid-template-rows: 1fr; }
.dither-studio-page .dsp-case-detail-inner {
  overflow: hidden;
  min-height: 0;
  padding: 0 var(--dsp-margin);
}
.dither-studio-page .dsp-case-media {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.25rem;
}
.dither-studio-page .dsp-case-big {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 0.125rem;
  overflow: hidden;
}
.dither-studio-page .dsp-case-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 0 2rem;
}
.dither-studio-page .dsp-case-year { margin-left: auto; opacity: 0.6; }

/* services */
.dither-studio-page .dsp-display {
  margin: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(3.25rem, 1rem + 5.4vw, 7.7rem);
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}
.dither-studio-page .dsp-services-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin-top: max(3rem, calc(120 / 1440 * 100vw));
}
.dither-studio-page .dsp-services-pills .dsp-btn-face { height: 2.125rem; }
.dither-studio-page .dsp-services-lede {
  margin: 2.5rem 0 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(1.5rem, 0.875rem + 1.25vw, 2.67rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.15;
  max-width: 34ch;
}
.dither-studio-page .dsp-services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  margin-top: 3.5rem;
  padding-top: 2.6rem;
  border-top: 1px solid var(--dsp-hair);
}
.dither-studio-page .dsp-services-call p {
  margin: 0 0 1.25rem;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1rem;
  letter-spacing: -0.01em;
  max-width: 16rem;
}
.dither-studio-page .dsp-service-col ul {
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1rem;
  letter-spacing: -0.01em;
  line-height: 1.5;
}

/* clients */
.dither-studio-page .dsp-clients { padding-bottom: max(6rem, calc(220 / 1440 * 100vw)); }
.dither-studio-page .dsp-marquee {
  position: relative;
  margin: 0 calc(-1 * var(--dsp-margin));
  padding: max(3rem, calc(120 / 1440 * 100vw)) 0 0;
  border-top: 1px solid var(--dsp-hair);
  margin-top: 1.5rem;
  overflow: hidden;
}
.dither-studio-page .dsp-marquee-track {
  display: flex;
  width: max-content;
  animation: dsp-marquee 28s linear infinite;
}
.dither-studio-page .dsp-marquee-group {
  display: flex;
  align-items: center;
  gap: 3.5rem;
  padding-right: 3.5rem;
}
.dither-studio-page .dsp-marquee-item {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(1.5rem, 2.6vw, 2.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;
  opacity: 0.85;
}
.dither-studio-page .dsp-marquee-item:nth-child(odd) {
  font-weight: 400;
  font-family: Georgia, "Times New Roman", serif;
  letter-spacing: 0;
}
@keyframes dsp-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* culture */
.dither-studio-page .dsp-culture {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
}
.dither-studio-page .dsp-culture-pair {
  display: flex;
  gap: var(--dsp-gap);
}
.dither-studio-page .dsp-culture-thumb {
  position: relative;
  width: 8.75rem;
  aspect-ratio: 2 / 3;
  border-radius: 0.125rem;
  overflow: hidden;
}
.dither-studio-page .dsp-culture-caption {
  margin: 1rem 0 0;
  max-width: 11rem;
  text-transform: uppercase;
  line-height: 1.5;
}
.dither-studio-page .dsp-culture-title {
  margin: max(4rem, calc(128 / 1440 * 100vw)) 0 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(1.75rem, 0.8rem + 1.9vw, 3.57rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.05;
  max-width: 24ch;
}
.dither-studio-page .dsp-culture-btn { margin-top: 2.5rem; }
.dither-studio-page .dsp-culture-right {
  position: relative;
  aspect-ratio: 2 / 3;
  max-height: 44rem;
  border-radius: 0.125rem;
  overflow: hidden;
}

/* footer */
.dither-studio-page .dsp-footer {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: start;
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: max(7rem, calc(240 / 1440 * 100vw));
  padding-bottom: 7.5rem;
}
.dither-studio-page .dsp-footer-left .dsp-card { margin-top: 3rem; }
.dither-studio-page .dsp-footer-copy {
  margin: 6rem 0 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: clamp(1.125rem, 1.7vw, 1.5rem);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.3;
  max-width: 24rem;
}
.dither-studio-page .dsp-footer-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 3rem;
}

/* status rail */
.dither-studio-page .dsp-status {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  padding: 0 var(--dsp-margin) 1.5rem;
  pointer-events: none;
}
.dither-studio-page .dsp-status-bar {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(249, 244, 235, 0.9);
  text-transform: uppercase;
}
.dither-studio-page .dsp-status a,
.dither-studio-page .dsp-status button { pointer-events: auto; }
.dither-studio-page .dsp-status-gap { flex: 1; }
.dither-studio-page .dsp-status-clock {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dither-studio-page .dsp-dot {
  width: 0.28rem;
  height: 0.28rem;
  border-radius: 50%;
  background: red;
  animation: dsp-pulse 2s ease-in-out infinite;
}
@keyframes dsp-pulse { 50% { opacity: 0.2; } }
.dither-studio-page .dsp-status-link {
  color: inherit;
  text-decoration: none;
}
.dither-studio-page .dsp-status-link span { opacity: 0.7; }
.dither-studio-page .dsp-status-link:hover span { opacity: 1; }
.dither-studio-page .dsp-lang {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-transform: uppercase;
  cursor: pointer;
}
.dither-studio-page .dsp-lang span { opacity: 0.4; transition: opacity 0.25s ease; }
.dither-studio-page .dsp-lang span.is-on { opacity: 1; }
.dither-studio-page .dsp-lang i {
  position: relative;
  width: 0.9375rem;
  height: 0.5rem;
  border-radius: 1rem;
  background: rgba(249, 244, 235, 0.25);
}
.dither-studio-page .dsp-lang i::after {
  content: "";
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 50%;
  background: var(--dsp-paper);
  transition: transform 0.3s ease;
}
.dither-studio-page .dsp-lang i[data-side="EN"]::after { transform: translateX(0.42rem); }

/* responsive */
@media (min-width: 1024px) {
  .dither-studio-page .dsp-nav { top: 1rem; }
  .dither-studio-page .dsp-rail { top: 1rem; right: 1rem; }
  .dither-studio-page .dsp-hero-body {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  }
  .dither-studio-page .dsp-hero-copy { justify-self: end; align-self: end; }
  .dither-studio-page .dsp-services-grid {
    grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
    gap: var(--dsp-gap);
  }
  .dither-studio-page .dsp-culture {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    gap: calc(100% / 12);
  }
  .dither-studio-page .dsp-footer {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: calc(100% / 12);
  }
}
@media (max-width: 1023px) {
  .dither-studio-page .dsp-rail { display: none; }
  .dither-studio-page .dsp-status-item,
  .dither-studio-page .dsp-lang,
  .dither-studio-page .dsp-status-link { display: none; }
  .dither-studio-page .dsp-status-item:first-child { display: inline; }
  .dither-studio-page .dsp-status-gap { display: none; }
  .dither-studio-page .dsp-status-bar { justify-content: space-between; }
  .dither-studio-page .dsp-case-row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "title view"
      "tags tags"
      "thumbs thumbs";
  }
  .dither-studio-page .dsp-case-title { grid-area: title; }
  .dither-studio-page .dsp-case-tags { grid-area: tags; }
  .dither-studio-page .dsp-case-view { grid-area: view; }
  .dither-studio-page .dsp-case-thumbs { grid-area: thumbs; justify-content: flex-start; overflow: hidden; }
  .dither-studio-page .dsp-case-media { grid-template-columns: 1fr; }
  .dither-studio-page .dsp-case-actions { flex-wrap: wrap; }
}
@media (prefers-reduced-motion: reduce) {
  .dither-studio-page .dsp-marquee-track { animation: none; }
  .dither-studio-page .dsp-dot { animation: none; }
  .dither-studio-page .dsp-roll-message { animation: none; }
}
`;

"use client";

/**
 * Shuffle Panel Menu - a side panel whose every label scrambles into place.
 * Each character runs its own interval swapping in a random letter, and the
 * interval is torn down on a per-character delay that grows by 150ms down the
 * word, so the text resolves left to right rather than snapping back at once.
 * The highlight behind a link is not a fixed width: each link is measured after
 * mount and its plate sized to that width plus thirty, with the meta label
 * parked just past it, so a long word and a short one both get a plate that
 * fits. Items slide in from minus a hundred pixels on a fifty millisecond
 * cascade.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import { useEffect, useRef, useState } from "react";

export interface ShufflePanelItem {
  label: string;
  meta: string;
}

export interface ShufflePanelSubItem {
  title: string;
  content: string;
}

export interface ShufflePanelMenuProps {
  toggleLabel?: string;
  navLabel?: string;
  sectionTitle?: string;
  items?: ShufflePanelItem[];
  /** Zero based index of the item highlighted at rest. */
  activeIndex?: number;
  subItems?: ShufflePanelSubItem[];
  activeColor?: string;
}

const DEFAULT_ITEMS: ShufflePanelItem[] = [
  { label: "story", meta: "page 001" },
  { label: "protocol", meta: "20 ideas" },
  { label: "journal", meta: "10 notes" },
  { label: "contact", meta: "email now" },
  { label: "gallery", meta: "check out" },
  { label: "about", meta: "our office" },
];

const DEFAULT_SUB_ITEMS: ShufflePanelSubItem[] = [
  { title: "connect", content: "Discord" },
  { title: "buy on", content: "Opensea" },
  { title: "us-en", content: "2026" },
];

/** Wraps each character in its own span so it can be shuffled independently. */
function Chars({ text }: { text: string }) {
  return (
    <span className="spm-word">
      {text.split("").map((char, i) => (
        <span className="spm-char" key={`${char}-${String(i)}`}>
          {char}
        </span>
      ))}
    </span>
  );
}

export default function ShufflePanelMenu({
  toggleLabel = "Menu",
  navLabel = "Collection",
  sectionTitle = "discover",
  items = DEFAULT_ITEMS,
  activeIndex = 4,
  subItems = DEFAULT_SUB_ITEMS,
  activeColor = "aquamarine",
}: ShufflePanelMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const intervals = useRef<Set<ReturnType<typeof setInterval>>>(new Set());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Plate width and meta offset are measured from the rendered link, so a
    // long label and a short one each get a highlight that fits.
    for (const item of root.querySelectorAll<HTMLElement>(".spm-menu-item")) {
      const linkElement = item.querySelector<HTMLElement>(".spm-item-link a");
      if (!linkElement) continue;
      const width = linkElement.offsetWidth;
      const plate = item.querySelector<HTMLElement>(".spm-bg-hover");
      if (plate) plate.style.width = `${width + 30}px`;
      const spanElement = item.querySelector<HTMLElement>(".spm-meta");
      if (spanElement) spanElement.style.left = `${width + 40}px`;
    }
  }, [items]);

  useEffect(() => {
    const currentTimers = timers.current;
    const currentIntervals = intervals.current;
    return () => {
      for (const t of currentTimers) clearTimeout(t);
      for (const i of currentIntervals) clearInterval(i);
      currentTimers.clear();
      currentIntervals.clear();
    };
  }, []);

  const addShuffleEffect = (element: Element | null) => {
    if (!element) return;
    const chars = element.querySelectorAll<HTMLElement>(".spm-char");
    const originalText = [...chars].map((char) => char.textContent);
    const shuffleInterval = 10;
    const resetDelay = 75;
    const additionalDelay = 150;

    chars.forEach((char, index) => {
      const startTimer = setTimeout(() => {
        timers.current.delete(startTimer);
        const interval = setInterval(() => {
          char.textContent = String.fromCharCode(
            97 + Math.floor(Math.random() * 26),
          );
        }, shuffleInterval);
        intervals.current.add(interval);

        const stopTimer = setTimeout(
          () => {
            clearInterval(interval);
            intervals.current.delete(interval);
            timers.current.delete(stopTimer);
            char.textContent = originalText[index];
          },
          resetDelay + index * additionalDelay,
        );
        timers.current.add(stopTimer);
      }, index * shuffleInterval);
      timers.current.add(startTimer);
    });
  };

  const shuffleAll = () => {
    const root = rootRef.current;
    if (!root) return;
    for (const link of root.querySelectorAll(
      ".spm-menu-item, .spm-sub-item .spm-menu-title, .spm-sub-item .spm-menu-content",
    )) {
      addShuffleEffect(
        link.querySelector(
          ".spm-item-link a, .spm-menu-title p, .spm-menu-content p",
        ),
      );
    }
  };

  const animateMenuItems = (direction: "in" | "out") => {
    const root = rootRef.current;
    if (!root) return;
    const menuItems = root.querySelectorAll<HTMLElement>(".spm-menu-item");
    menuItems.forEach((item, index) => {
      const timer = setTimeout(() => {
        item.style.left = direction === "in" ? "0px" : "-100px";
        timers.current.delete(timer);
      }, index * 50);
      timers.current.add(timer);
    });
  };

  const open = () => {
    setIsOpen(true);
    shuffleAll();
    animateMenuItems("in");
  };

  const close = () => {
    setIsOpen(false);
    animateMenuItems("out");
  };

  const colorChars = (item: Element, active: boolean) => {
    const chars = item.querySelectorAll<HTMLElement>(".spm-meta .spm-char");
    if (!active) {
      for (const char of chars) char.classList.remove("spm-char-active");
      return;
    }
    chars.forEach((char, index) => {
      const timer = setTimeout(() => {
        char.classList.add("spm-char-active");
        timers.current.delete(timer);
      }, index * 50);
      timers.current.add(timer);
    });
  };

  return (
    <div className="spm-root" ref={rootRef}>
      <style>{styles}</style>

      <nav className="spm-nav">
        <button className="spm-menu-toggle" onClick={open} type="button">
          <p>{toggleLabel}</p>
        </button>
        <p>{navLabel}</p>
      </nav>

      <div className="spm-container">
        <div
          className="spm-menu-container"
          style={{ left: isOpen ? "0%" : "-100%" }}
        >
          <div className="spm-menu">
            <div className="spm-menu-main">
              <div className="spm-menu-top">
                <div className="spm-menu-top-title">
                  <p>{sectionTitle}</p>
                </div>
                <div className="spm-menu-top-content">
                  {items.map((item, i) => (
                    <div
                      className={
                        i === activeIndex
                          ? "spm-menu-item spm-active"
                          : "spm-menu-item"
                      }
                      key={item.label}
                      onMouseEnter={(e) => {
                        addShuffleEffect(
                          e.currentTarget.querySelector(".spm-item-link a"),
                        );
                        addShuffleEffect(
                          e.currentTarget.querySelector(".spm-meta"),
                        );
                        colorChars(e.currentTarget, true);
                      }}
                      onMouseLeave={(e) => colorChars(e.currentTarget, false)}
                    >
                      <div className="spm-item-link">
                        <div
                          className="spm-bg-hover"
                          style={
                            i === activeIndex
                              ? { backgroundColor: activeColor }
                              : undefined
                          }
                        />
                        <a href="#menu">
                          <Chars text={item.label} />
                        </a>
                      </div>
                      <span className="spm-meta">
                        <Chars text={item.meta} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="spm-menu-bottom">
                {subItems.map((sub) => (
                  <div className="spm-sub-item" key={sub.title}>
                    <div
                      className="spm-menu-title"
                      onMouseEnter={(e) =>
                        addShuffleEffect(e.currentTarget.querySelector("p"))
                      }
                    >
                      <p>
                        <Chars text={sub.title} />
                      </p>
                    </div>
                    <div
                      className="spm-menu-content"
                      onMouseEnter={(e) =>
                        addShuffleEffect(e.currentTarget.querySelector("p"))
                      }
                    >
                      <p>
                        <Chars text={sub.content} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="spm-menu-sidebar">
              <button
                aria-label="Close menu"
                className="spm-close-btn"
                onClick={close}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 5 19 19M19 5 5 19"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <div className="spm-logo">
                <svg
                  aria-hidden="true"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z" fill="#fff" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Geist+Mono:wght@100..900&display=swap");

.spm-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #fff;
  color: #000;
  font-family: "Geist Mono", monospace;
}

.spm-root * {
  box-sizing: border-box;
}

.spm-root a,
.spm-root p,
.spm-root span {
  margin: 0;
  text-transform: uppercase;
  font-size: 10px;
  line-height: 100%;
  cursor: pointer;
}

.spm-nav {
  position: absolute;
  top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2em;
  z-index: 2;
}

.spm-menu-toggle {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
}

.spm-container {
  width: 100%;
  height: 100%;
}

.spm-menu-container {
  position: absolute;
  top: 50%;
  left: -100%;
  transform: translateY(-50%);
  padding: 1.5em;
  width: 45%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  transition: left 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.spm-menu {
  width: 100%;
  height: 100%;
  background: #000;
  color: #fff;
  border-radius: 20px;
  display: flex;
  overflow: hidden;
}

.spm-menu-main {
  flex: 5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(255, 255, 255, 0.125);
}

.spm-menu-sidebar {
  flex: 0.2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.spm-menu-main .spm-menu-top {
  display: flex;
  border-top: 1px solid rgba(255, 255, 255, 0.125);
}

.spm-menu-main .spm-menu-bottom {
  display: flex;
  flex-direction: column;
}

.spm-menu-top-title {
  flex: 1;
  padding: 2em;
}

.spm-menu-top-content {
  padding: 1.25em 0;
  flex: 4;
  display: flex;
  flex-direction: column;
}

.spm-menu-item {
  position: relative;
  left: -100px;
  padding: 0.5em 0;
  transition: left 0.3s;
}

.spm-item-link {
  position: relative;
}

.spm-item-link a {
  position: relative;
  display: inline-block;
  text-decoration: none;
  color: #fff;
  font-size: 48px;
  font-family: "Archivo", sans-serif;
  letter-spacing: -2px;
  font-weight: 700;
  padding-left: 10px;
  z-index: 2;
}

.spm-menu-item.spm-active .spm-item-link a {
  color: #000;
}

.spm-menu-item:hover .spm-item-link a {
  color: #000;
}

.spm-bg-hover {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #fff;
  clip-path: polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0% 50%);
  z-index: 0;
  opacity: 0;
}

.spm-menu-item:hover .spm-bg-hover {
  opacity: 1;
}

.spm-menu-item.spm-active .spm-bg-hover {
  opacity: 1;
}

.spm-menu-item .spm-meta {
  position: absolute;
  top: 0px;
  padding: 1.5em 0;
}

.spm-menu-item .spm-meta .spm-char {
  color: #000;
}

.spm-menu-item.spm-active .spm-meta .spm-char {
  color: #fff;
}

.spm-menu-item:hover .spm-meta .spm-char.spm-char-active {
  color: #fff;
}

.spm-menu-item .spm-meta .spm-char.spm-char-active {
  color: #000;
}

.spm-sub-item {
  width: 100%;
  display: flex;
  gap: 1em;
  border-top: 1px solid rgba(255, 255, 255, 0.125);
  padding: 1em 2em;
}

.spm-menu-title {
  flex: 1;
}

.spm-menu-content {
  flex: 4;
  padding-left: 2em;
}

.spm-menu-content p {
  position: relative;
  width: max-content;
  padding: 0.125em;
}

.spm-menu-content p::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: #fff;
  mix-blend-mode: difference;
}

@keyframes spm-hover-effect {
  0% {
    width: 0%;
    left: 0;
  }
  50% {
    width: 100%;
    left: 0;
  }
  51% {
    left: auto;
    right: 0;
    width: 100%;
  }
  100% {
    left: auto;
    right: 0;
    width: 0%;
  }
}

.spm-menu-content p:hover::after {
  animation: spm-hover-effect 1s ease forwards;
}

.spm-close-btn,
.spm-logo {
  padding: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spm-close-btn {
  border: none;
  background: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.125);
  cursor: pointer;
}

@media (max-width: 900px) {
  .spm-menu-container {
    width: 100%;
  }

  .spm-menu-top-content {
    padding: 1.5em;
  }

  .spm-menu-top-title,
  .spm-menu-item .spm-meta,
  .spm-menu-title,
  .spm-bg-hover {
    display: none;
  }

  .spm-menu-item:hover .spm-item-link a,
  .spm-menu-item.spm-active .spm-item-link a {
    color: #fff;
  }

  .spm-sub-item {
    padding: 1em 0;
  }
}
`;

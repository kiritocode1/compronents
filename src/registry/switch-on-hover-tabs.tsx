"use client";

import { motion } from "motion/react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useId,
  useRef,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SwitchOnHoverTabItem {
  /** Heading shown at every size. */
  title: string;
  /** Body copy. Only the active tab renders it, which is what moves the stack. */
  description: string;
  /** Panel artwork. Falls back to a tinted placeholder when omitted. */
  image?: string;
  /** Alt text for the panel artwork. */
  alt?: string;
}

export interface SwitchOnHoverTabsProps {
  items?: SwitchOnHoverTabItem[];
  /** Tab open on first paint. */
  defaultIndex?: number;
  /**
   * `hover` matches the source: a mouse crossing a tab selects it, and touch
   * still falls back to tap. `click` requires a deliberate press everywhere.
   */
  activateOn?: "hover" | "click";
  /** Card background behind both columns. */
  surface?: string;
  /** Fill shared by the active tab, its fillets, and the panel. */
  panel?: string;
  /** Title colour. */
  titleColor?: string;
  /** Description colour. */
  descriptionColor?: string;
  /** Corner radius of the artwork panel. */
  panelRadius?: number;
  /** Corner radius of the outer card. Source ships square. */
  cardRadius?: number;
  /** Width of the tab column on wide screens. */
  tabWidth?: number;
  /** Height of the card on wide screens. */
  height?: number;
  className?: string;
  style?: CSSProperties;
  onChange?: (index: number) => void;
}

/* ------------------------------------------------------------------ */
/* Constants lifted from the source                                    */
/* ------------------------------------------------------------------ */

/** Shell spring: drives the column reflow as a tab grows. */
const SHELL_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 50,
  mass: 1,
} as const;

/** Tab spring: drives fill, fillets, and the description reveal. */
const TAB_SPRING = { type: "spring", bounce: 0.2, duration: 0.4 } as const;

/** Size of the concave fillet welding an active tab into the panel. */
const FILLET = 20;

/**
 * Quarter squircle subtracted from the fillet square. The curve is centred on
 * the corner nearest the tab, so the fill flares outward as it approaches the
 * tab edge and tapers to nothing 20px away.
 */
const FILLET_TOP =
  "M 6.018 19.789 C 4.705 20 3.137 20 0 20 L 20 20 L 20 0 C 20 3.137 20 4.705 19.789 6.018 C 18.65 13.098 13.098 18.65 6.018 19.789 Z";
const FILLET_BOTTOM =
  "M 6.018 0.211 C 4.705 0 3.137 0 0 0 L 20 0 L 20 20 C 20 16.863 20 15.295 19.789 13.982 C 18.65 6.902 13.098 1.35 6.018 0.211 Z";

const DEFAULT_ITEMS: SwitchOnHoverTabItem[] = [
  {
    title: "Spatial Optimization",
    description:
      "We measure how a room is actually used before we move a single wall, so the plan you approve is the plan you end up living in.",
  },
  {
    title: "Renovation Guidance",
    description:
      "Drawings, permits, and trades held on one schedule, with a single point of contact from demolition through the final walkthrough.",
  },
  {
    title: "Material Sourcing",
    description:
      "Stone, timber, and hardware chosen against the real light in the room, sampled on site, and priced before anything is ordered.",
  },
  {
    title: "Site Supervision",
    description:
      "Weekly checks against the drawing set, photographed and logged, so a problem surfaces while it is still cheap to fix.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function SwitchOnHoverTabs({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  activateOn = "hover",
  surface = "#ffffff",
  panel = "rgb(226, 232, 240)",
  titleColor = "rgb(0, 0, 0)",
  descriptionColor = "rgb(100, 116, 139)",
  panelRadius = 24,
  cardRadius = 0,
  tabWidth = 300,
  height = 434,
  className,
  style,
  onChange,
}: SwitchOnHoverTabsProps) {
  const reactId = useId();
  const scope = `blank-sht-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(() =>
    Math.min(Math.max(defaultIndex, 0), Math.max(items.length - 1, 0)),
  );

  const select = (index: number) => {
    if (index === active) return;
    setActive(index);
    onChange?.(index);
  };

  const handlePointerEnter =
    (index: number) => (event: PointerEvent<HTMLButtonElement>) => {
      // Touch fires a synthetic enter right before the tap; ignore it so the
      // tap path stays in charge on phones, exactly like the source's split
      // between its desktop hover and mobile click variants.
      if (activateOn !== "hover" || event.pointerType !== "mouse") return;
      select(index);
    };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = items.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      next = active === last ? 0 : active + 1;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      next = active === 0 ? last : active - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  const cssVars = {
    "--sht-surface": surface,
    "--sht-panel": panel,
    "--sht-title": titleColor,
    "--sht-desc": descriptionColor,
    "--sht-tab-width": `${tabWidth}px`,
    "--sht-height": `${height}px`,
    "--sht-panel-radius": `${panelRadius}px`,
    "--sht-card-radius": `${cardRadius}px`,
    "--sht-fillet": `${FILLET}px`,
  } as CSSProperties;

  return (
    <div
      className={[scope, "blank-sht-root", className].filter(Boolean).join(" ")}
      style={{ ...cssVars, ...style }}
    >
      <style>{styles(scope)}</style>

      <div
        className="blank-sht-tabs"
        role="tablist"
        aria-orientation="vertical"
      >
        {items.map((item, index) => {
          const isActive = index === active;
          return (
            <motion.button
              key={item.title}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${scope}-tab-${index}`}
              aria-selected={isActive}
              aria-controls={`${scope}-panel`}
              tabIndex={isActive ? 0 : -1}
              className="blank-sht-tab"
              data-active={isActive || undefined}
              layout
              transition={SHELL_SPRING}
              animate={{
                backgroundColor: isActive ? panel : "rgba(245, 245, 245, 0)",
              }}
              onPointerEnter={handlePointerEnter(index)}
              onClick={() => select(index)}
              onFocus={() => select(index)}
              onKeyDown={handleKeyDown}
            >
              <motion.h3 layout="position" className="blank-sht-title">
                {item.title}
              </motion.h3>

              <motion.div
                className="blank-sht-body"
                initial={false}
                animate={{ height: isActive ? "auto" : 0 }}
                transition={TAB_SPRING}
              >
                <motion.p
                  className="blank-sht-desc"
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={TAB_SPRING}
                >
                  {item.description}
                </motion.p>
              </motion.div>

              {/* Fillets weld the active tab into the panel. Desktop only. */}
              <motion.span
                aria-hidden
                className="blank-sht-fillet blank-sht-fillet-top"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={TAB_SPRING}
              >
                <svg viewBox="0 0 20 20" width={FILLET} height={FILLET}>
                  <title>Tab fillet</title>
                  <path d={FILLET_TOP} fill={panel} />
                </svg>
              </motion.span>
              <motion.span
                aria-hidden
                className="blank-sht-fillet blank-sht-fillet-bottom"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={TAB_SPRING}
              >
                <svg viewBox="0 0 20 20" width={FILLET} height={FILLET}>
                  <title>Tab fillet</title>
                  <path d={FILLET_BOTTOM} fill={panel} />
                </svg>
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      <div
        className="blank-sht-panel"
        id={`${scope}-panel`}
        role="tabpanel"
        aria-labelledby={`${scope}-tab-${active}`}
      >
        <div className="blank-sht-frame">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              className="blank-sht-media"
              initial={false}
              animate={{ opacity: index === active ? 1 : 0 }}
              transition={SHELL_SPRING}
              aria-hidden={index !== active}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.alt ?? ""}
                  className="blank-sht-img"
                  draggable={false}
                />
              ) : (
                <div
                  className="blank-sht-placeholder"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in oklab, ${panel} 70%, #000 12%), ${panel})`,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scoped styles                                                       */
/* ------------------------------------------------------------------ */

function styles(scope: string) {
  const s = `.${scope}`;
  return `
${s}.blank-sht-root {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0;
  width: 100%;
  max-width: 1104px;
  height: var(--sht-height);
  padding: 0;
  overflow: clip;
  position: relative;
  background: var(--sht-surface);
  border-radius: var(--sht-card-radius);
  font-family: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    sans-serif;
  font-feature-settings: "cv03" on, "cv04" on, "cv09" on, "cv11" on;
}

${s} .blank-sht-tabs {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  width: var(--sht-tab-width);
  height: min-content;
  padding: 40px 0 0 0;
  overflow: visible;
  position: relative;
}

${s} .blank-sht-tab {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  width: 100%;
  height: min-content;
  padding: 18px 14px 22px 22px;
  margin: 0;
  position: relative;
  overflow: visible;
  cursor: pointer;
  text-align: left;
  border: 0;
  border-radius: 12px 0 0 12px;
  background: rgba(245, 245, 245, 0);
  font: inherit;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}

${s} .blank-sht-tab[data-active] {
  z-index: 1;
  cursor: default;
}

${s} .blank-sht-tab:focus-visible {
  outline: 2px solid var(--sht-title);
  outline-offset: -2px;
}

${s} .blank-sht-title {
  margin: 0;
  width: 100%;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.25em;
  letter-spacing: -0.02em;
  color: var(--sht-title);
  text-wrap: pretty;
}

${s} .blank-sht-body {
  width: 100%;
  overflow: hidden;
}

${s} .blank-sht-desc {
  margin: 0;
  padding-top: 8px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5em;
  letter-spacing: -0.04em;
  color: var(--sht-desc);
  text-wrap: balance;
}

${s} .blank-sht-fillet {
  position: absolute;
  right: 0;
  width: var(--sht-fillet);
  height: var(--sht-fillet);
  overflow: visible;
  pointer-events: none;
  line-height: 0;
}

${s} .blank-sht-fillet-top {
  top: calc(var(--sht-fillet) * -1);
}

${s} .blank-sht-fillet-bottom {
  bottom: calc(var(--sht-fillet) * -1);
}

${s} .blank-sht-panel {
  display: flex;
  flex: 1 0 0px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 1px;
  height: 100%;
  padding: 8px;
  position: relative;
  overflow: visible;
  background: var(--sht-panel);
  border-radius: var(--sht-panel-radius);
}

${s} .blank-sht-frame {
  flex: 1 0 0px;
  width: 100%;
  height: 1px;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

${s} .blank-sht-media {
  position: absolute;
  inset: 0;
}

${s} .blank-sht-img,
${s} .blank-sht-placeholder {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
  user-select: none;
}

@media (max-width: 810px) {
  ${s}.blank-sht-root {
    flex-direction: column;
    height: auto;
    max-width: 480px;
  }

  ${s} .blank-sht-tabs {
    width: 100%;
    padding: 0 0 24px 0;
  }

  ${s} .blank-sht-tab {
    border-radius: 12px;
    cursor: pointer;
  }

  ${s} .blank-sht-fillet {
    display: none;
  }

  ${s} .blank-sht-panel {
    width: 100%;
    height: 360px;
    flex: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  ${s} .blank-sht-tab,
  ${s} .blank-sht-media,
  ${s} .blank-sht-fillet {
    transition-duration: 0.01ms !important;
  }
}
`;
}

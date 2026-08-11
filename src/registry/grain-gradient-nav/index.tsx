"use client";

/**
 * Grain Gradient Nav - a floating header pill you can drag, that opens into a
 * mega menu, over the Grain Gradient Field shader.
 *
 * The interaction model, in the order you meet it:
 *
 *   1. The pill floats centred and is DRAGGABLE by its dot handle. Dragging is
 *      absolute-positional rather than transform-based, because the panel
 *      underneath has to recompute how much room is left below the pill as it
 *      moves.
 *   2. Once the page is scrolled, the links COLLAPSE to zero width and the pill
 *      shrinks to the wordmark and the handle, shifting by half the menu's
 *      width so it stays optically centred. Hovering expands it back.
 *   3. Hovering the wordmark or any link opens the mega panel BENEATH the pill.
 *      Panels sit side by side in one strip; switching slides the strip
 *      horizontally while the wrapper's height animates to the height of the
 *      panel you moved to, so running along the menu reads as one surface
 *      reshaping rather than as panels swapping.
 *   4. Hovering the handle closes the panel; hovering the overlay behind the
 *      pill closes it and releases focus, which is what re-collapses the bar.
 *   5. The contact panel is wider than the others, so opening it also widens
 *      the pill and re-centres it in the same motion.
 *
 * The durations are load-bearing: 0.8s cubic-bezier(0.5, 0, 0, 1) shared by the
 * width, the height and the horizontal slide (which is what fuses them into one
 * movement), 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) for the underline sweep,
 * and 1.5s cubic-bezier(0, 0, 0, 1) for the drop-in.
 *
 * The pill's surface is the same seven-pass shader as Grain Gradient Field,
 * retuned for a bar. Pass `surface={false}` for a flat pill.
 *
 * BLANK - aryank.space
 */

import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  coverBox,
  GrainFieldEngine,
  hexToRgb,
  loadShapeTexture,
} from "./engine";
import { DEFAULT_CONFIG, type GrainFieldConfig } from "./shaders";

export { coverBox, GrainFieldEngine, hexToRgb } from "./engine";
export type { GrainFieldConfig, Vec3 } from "./shaders";
export { DEFAULT_CONFIG } from "./shaders";

const SHAPE_URL =
  "https://ui.aryank.space/assets/grain-gradient/shape-wave.png";

/**
 * Retuning of the field for a wide, short, dark box.
 *
 * Two things have to change that are free at section height. The scene is drawn
 * at a near-square aspect and cropped to the bar rather than rendered at the
 * bar's own 12:1, because that ratio goes straight into the shape shader's
 * aspect correction and squeezes the silhouette into a hard vertical smudge.
 * And the blur runs far wider at a much lower noise frequency, because the
 * visible 44px band cuts through the middle of the shape: at section settings
 * its silhouette crosses the bar as a legible hard edge instead of a ramp.
 */
export const NAV_CONFIG: Partial<GrainFieldConfig> = {
  shapeSize: 4.2,
  shapeY: 0.65,
  blurAmount: 0.9,
  blurScale: 0.05,
  waveAmplitude: 0.45,
  trailRadius: 0.42,
  trailDecay: 0.62,
  grainAmount: 0.16,
};

export interface NavLink {
  label: string;
  url: string;
}

export interface NavPanel {
  /** Label in the pill. The first panel is opened by the wordmark instead. */
  label: string;
  url?: string;
  /** Two-column list of links inside the panel. */
  links?: NavLink[];
  /** Optional wide image below the list. */
  thumb?: { src: string; alt: string; url?: string };
}

export interface NavContactSection {
  heading?: string;
  items: string[];
}

export interface NavFormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "options" | "file" | "consent";
  options?: string[];
  required?: boolean;
}

export interface GrainGradientNavProps {
  /** Wordmark in the pill. Opens the first panel on hover. */
  brand?: string;
  /** Panels reachable from the pill, in order. */
  menu?: NavPanel[];
  /** The contact panel is always last and always wider than the others. */
  contactLabel?: string;
  contactHeading?: string;
  contactSections?: NavContactSection[];
  formHeading?: string;
  formText?: string;
  formFields?: NavFormField[];
  /** Called with the collected values on submit. */
  onSubmit?: (values: Record<string, unknown>) => void;
  /** Render the shader behind the pill. False gives a flat bar. */
  surface?: boolean;
  /** Flat ground of the bar. */
  baseColor?: string;
  /** Flat-shaded colour of the lit crest moving through it. */
  shapeColor?: string;
  /** Corner radius of the pill. */
  radius?: number;
  /** Scene aspect for the surface; see NAV_CONFIG for why it is not the bar's. */
  aspectWidth?: number;
  aspectHeight?: number;
  shapeSrc?: string;
  dpi?: number;
  fps?: number;
  /** Let pointer movement drag a smear through the bar. */
  interactive?: boolean;
  /** Width of the contact panel, and so of the pill while it is open. */
  expandedWidth?: number;
  /** Minimum width of the pill, and so of every non-contact panel. */
  panelWidth?: number;
  /** Allow dragging the pill by its handle. */
  draggable?: boolean;
  /** Collapse the links once the page has scrolled past this many pixels. */
  collapseAfter?: number;
  /** Distance from the top of the positioning context, in pixels. */
  offsetTop?: number;
  /**
   * Pin the bar to this component's own box instead of to the viewport.
   *
   * The bar is `position: fixed`, which is what a page header wants. Inside a
   * bounded stage that would escape the box, so `embedded` puts a transform on
   * the root, which makes the root the containing block for the fixed children
   * and clips them to it. One switch, both behaviours, no duplicate CSS.
   */
  embedded?: boolean;
  /** Replaces the pill interior. The mega panel is not rendered. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_MENU: NavPanel[] = [
  {
    label: "Studio",
    url: "#studio",
    links: [
      { label: "How we work", url: "#how-we-work" },
      { label: "Team", url: "#team" },
      { label: "Careers", url: "#careers" },
      { label: "Journal", url: "#journal" },
    ],
  },
  {
    label: "Work",
    url: "#work",
    links: [
      { label: "Selected projects", url: "#selected" },
      { label: "Brand systems", url: "#brand" },
      { label: "Product design", url: "#product" },
      { label: "Motion", url: "#motion" },
      { label: "Archive", url: "#archive" },
      { label: "Awards", url: "#awards" },
    ],
  },
  {
    label: "Capabilities",
    url: "#capabilities",
    links: [
      { label: "Strategy", url: "#strategy" },
      { label: "Identity", url: "#identity" },
      { label: "Interface design", url: "#interface" },
      { label: "Front-end engineering", url: "#frontend" },
      { label: "Fullstack development", url: "#fullstack" },
      { label: "Art direction", url: "#art-direction" },
    ],
  },
];

const DEFAULT_CONTACT_SECTIONS: NavContactSection[] = [
  { items: ["hello@aryank.space", "+61 3 9000 0000"] },
  {
    heading: "Melbourne",
    items: ["Level 4, 120 Flinders Lane", "Victoria 3000"],
  },
  { heading: "Follow", items: ["LinkedIn", "Instagram"] },
];

const DEFAULT_FORM_FIELDS: NavFormField[] = [
  { name: "name", label: "My name is", type: "text", required: true },
  {
    name: "email",
    label: "You can reach me at",
    type: "email",
    required: true,
  },
  {
    name: "services",
    label: "I am looking for",
    type: "options",
    options: ["Brand", "Website", "Product", "Motion", "Something else"],
  },
  { name: "brief", label: "A little about the project", type: "textarea" },
  { name: "attachments", label: "Anything to share", type: "file" },
  {
    name: "consent",
    label: "I am happy to be contacted about this enquiry.",
    type: "consent",
  },
];

const ARROW = (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
    <path
      d="M4.00004 6.33329L6.33337 3.99996L4.00004 1.66663"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.66671 4H6.33337"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** The nine-dot grip. Its `cursor: move` is the only affordance the original
 *  gives that the pill can be moved at all. */
const HANDLE = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <title>Drag the menu</title>
    {[1.55, 6.52, 11.48].map((cy) =>
      [2.03, 7, 11.96].map((cx) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="0.99"
          fill="currentColor"
        />
      )),
    )}
  </svg>
);

export default function GrainGradientNav({
  brand = "BLANK",
  menu = DEFAULT_MENU,
  contactLabel = "Contact",
  contactHeading = "Tell us what you are building.",
  contactSections = DEFAULT_CONTACT_SECTIONS,
  formHeading = "Start a project",
  formText = "Two or three lines is plenty. We reply to everything within a working day.",
  formFields = DEFAULT_FORM_FIELDS,
  onSubmit,
  surface = true,
  baseColor = "#242422",
  shapeColor = "#5c5d55",
  radius = 13,
  aspectWidth = 520,
  aspectHeight = 300,
  shapeSrc = SHAPE_URL,
  dpi = 1.5,
  fps = 30,
  interactive = true,
  expandedWidth = 996,
  panelWidth = 420,
  draggable = true,
  collapseAfter = 3,
  offsetTop = 42,
  embedded = false,
  children,
  className,
  style,
}: GrainGradientNavProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLUListElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GrainFieldEngine | null>(null);

  const contactIndex = menu.length;
  const panelCount = menu.length + 1;

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [activePanel, setActivePanel] = useState(-1);
  const [animate, setAnimate] = useState(false);
  const [focused, setFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [metrics, setMetrics] = useState({ menuWidth: 0, maxHeight: 640 });
  const [panelHeight, setPanelHeight] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [files, setFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [box, setBox] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [ready, setReady] = useState(false);

  const resolved = useMemo<GrainFieldConfig>(
    () => ({
      ...DEFAULT_CONFIG,
      ...NAV_CONFIG,
      baseColor: hexToRgb(baseColor),
      shapeColor: hexToRgb(shapeColor),
    }),
    [baseColor, shapeColor],
  );

  // --- measurement ---------------------------------------------------------

  const measure = useCallback(() => {
    const inner = innerRef.current;
    const list = primaryRef.current;
    if (!inner || !list) return;
    // Only the list is measured. Deriving the pill's width from its own box
    // would feed the min-width we set from it straight back into the next
    // measurement, and the bar grows without bound.
    setMetrics({
      menuWidth: list.scrollWidth,
      maxHeight: Math.max(
        200,
        window.innerHeight - offsetTop - offset.y - inner.clientHeight * 2,
      ),
    });
  }, [offsetTop, offset.y]);

  useEffect(() => {
    measure();
    // The drop-in only reads as a drop-in if the first paint is off-screen, so
    // the loaded class is set on the next tick rather than during layout.
    const timer = window.setTimeout(() => {
      measure();
      setLoaded(true);
    }, 60);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // Collapse follows whichever element actually scrolls. Listening only on
  // window works on a normal page and silently does nothing the moment the bar
  // is dropped inside a scroll container, which is most app shells.
  useEffect(() => {
    const node = headerRef.current;
    let scroller: HTMLElement | null = node?.parentElement ?? null;
    while (scroller) {
      const overflow = getComputedStyle(scroller).overflowY;
      if (overflow === "auto" || overflow === "scroll") break;
      scroller = scroller.parentElement;
    }
    const read = () =>
      setScrolled(
        (scroller ? scroller.scrollTop : window.scrollY) > collapseAfter,
      );
    const target: EventTarget = scroller ?? window;
    read();
    target.addEventListener("scroll", read, { passive: true });
    return () => target.removeEventListener("scroll", read);
  }, [collapseAfter]);

  // The strip is one surface: its height follows whichever panel is open, so
  // switching reshapes it instead of snapping.
  useEffect(() => {
    if (activePanel < 0) {
      setPanelHeight(0);
      return;
    }
    const node = panelRefs.current[activePanel];
    if (node) setPanelHeight(node.scrollHeight);
  }, [activePanel]);

  // --- drag ----------------------------------------------------------------

  const onHandleDown = (event: React.MouseEvent) => {
    if (!draggable) return;
    event.preventDefault();
    const grab = { x: event.clientX, y: event.clientY };
    const start = { ...offset };
    setDragging(true);
    const onMove = (move: MouseEvent) => {
      setOffset({
        x: start.x + (move.clientX - grab.x),
        y: start.y + (move.clientY - grab.y),
      });
    };
    const onUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // --- panel switching -----------------------------------------------------

  const openPanel = (index: number) => {
    // Only animate the slide when moving BETWEEN panels. Animating on the way
    // in would drag the strip across from wherever it was last left.
    setAnimate(activePanel >= 0);
    setActivePanel(index);
    setFocused(true);
  };

  const closePanel = (releaseFocus: boolean) => {
    setActivePanel(-1);
    if (releaseFocus) setFocused(false);
  };

  // --- surface -------------------------------------------------------------

  useEffect(() => {
    if (!surface) return;
    const container = headerRef.current;
    if (!container) return;
    const remeasure = () => {
      const next = coverBox(
        container.clientWidth,
        container.clientHeight,
        aspectWidth,
        aspectHeight,
        true,
      );
      setBox((current) =>
        current.width === next.width &&
        current.height === next.height &&
        current.offsetY === next.offsetY
          ? current
          : next,
      );
    };
    remeasure();
    const observer = new ResizeObserver(remeasure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [aspectWidth, aspectHeight, surface]);

  useEffect(() => {
    if (!surface) return;
    const canvas = canvasRef.current;
    const container = headerRef.current;
    if (!canvas || !container || box.width === 0 || box.height === 0) return;

    let engine: GrainFieldEngine | null = null;
    let cancelled = false;

    loadShapeTexture(shapeSrc)
      .then((image) => {
        if (cancelled) return;
        engine = new GrainFieldEngine({
          canvas,
          shapeTexture: image,
          config: resolved,
          dpi,
          fps,
          interactive,
          hitTarget: container,
        });
        engineRef.current = engine;
        engine.render();
        engine.start();
        setReady(true);
      })
      .catch(() => {
        // Falling back to the flat bar colour is the right quiet failure for
        // chrome that has to stay usable.
      });

    return () => {
      cancelled = true;
      engineRef.current = null;
      engine?.dispose();
      setReady(false);
    };
  }, [shapeSrc, dpi, fps, box.width, box.height, surface]);

  useEffect(() => {
    engineRef.current?.setConfig(resolved);
    engineRef.current?.render();
  }, [resolved]);

  // --- derived layout ------------------------------------------------------

  const condensed = scrolled && !focused;
  const contactOpen = activePanel === contactIndex && !condensed;
  const listWidth = condensed ? 0 : metrics.menuWidth;
  // The pill is max-content wide, so collapsing the list shrinks it and the
  // translateX(-50%) keeps it centred for free. min-width only sets the floor:
  // the panel is as wide as the pill, so a pill sized to its own content would
  // squeeze the link columns.
  const pillMinWidth = condensed ? 0 : contactOpen ? expandedWidth : panelWidth;

  // --- form ----------------------------------------------------------------

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.({ ...values, attachments: files });
    setSubmitted(true);
  };

  const setValue = (name: string, value: unknown) =>
    setValues((current) => ({ ...current, [name]: value }));

  const toggleOption = (name: string, option: string) =>
    setValues((current) => {
      const list = (current[name] as string[]) ?? [];
      return {
        ...current,
        [name]: list.includes(option)
          ? list.filter((item) => item !== option)
          : [...list, option],
      };
    });

  const renderField = (field: NavFormField) => {
    if (field.type === "options") {
      const list = (values[field.name] as string[]) ?? [];
      return (
        <>
          <span className="ggn-label">{field.label}</span>
          <div className="ggn-options">
            {field.options?.map((option) => (
              <label
                key={option}
                className={`ggn-option ${list.includes(option) ? "is-checked" : ""}`}
              >
                <input
                  type="checkbox"
                  name={field.name}
                  value={option}
                  checked={list.includes(option)}
                  onChange={() => toggleOption(field.name, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </>
      );
    }
    if (field.type === "textarea") {
      return (
        <>
          <span className="ggn-label ggn-label--block">{field.label}</span>
          <textarea
            className="ggn-input ggn-textarea"
            name={field.name}
            value={(values[field.name] as string) ?? ""}
            onChange={(event) => setValue(field.name, event.target.value)}
          />
        </>
      );
    }
    if (field.type === "file") {
      return (
        <>
          <span className="ggn-label ggn-label--block">{field.label}</span>
          <div
            className="ggn-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setFiles(
                Array.from(event.dataTransfer.files).map((file) => file.name),
              );
            }}
          >
            <input
              type="file"
              multiple
              name={field.name}
              onChange={(event) =>
                setFiles(
                  Array.from(event.target.files ?? []).map((file) => file.name),
                )
              }
            />
            <p>Attach files here.</p>
          </div>
          {files.length > 0 && (
            <ul className="ggn-files">
              {files.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          )}
        </>
      );
    }
    if (field.type === "consent") {
      return (
        <label className="ggn-consent">
          <input
            type="checkbox"
            name={field.name}
            checked={Boolean(values[field.name])}
            onChange={(event) => setValue(field.name, event.target.checked)}
          />
          <span className="ggn-consent-box" />
          <span className="ggn-consent-label">{field.label}</span>
        </label>
      );
    }
    return (
      <>
        <span className="ggn-label">{field.label}</span>
        <input
          className="ggn-input"
          type={field.type}
          name={field.name}
          required={field.required}
          value={(values[field.name] as string) ?? ""}
          onChange={(event) => setValue(field.name, event.target.value)}
        />
      </>
    );
  };

  return (
    <div
      className={`ggn-root ${embedded ? "is-embedded" : ""} ${className ?? ""}`}
      style={style}
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a static stylesheet constant, so the component installs as one file with no CSS import. */}
      <style dangerouslySetInnerHTML={{ __html: CSS_TEXT }} />

      {/* Hovering anything that is not the pill closes the panel. It is parked
          off-screen while closed, so it never intercepts anything. */}
      <div
        className="ggn-overlay"
        style={{ left: activePanel >= 0 ? 0 : "-9999px" }}
        onMouseEnter={() => closePanel(true)}
      />

      <div
        ref={headerRef}
        className={`ggn-header ${loaded ? "is-loaded" : "is-loading"} ${
          dragging ? "is-dragging" : ""
        }`}
        style={{
          top: `${offsetTop + offset.y}px`,
          left: `calc(50% + ${offset.x}px)`,
          minWidth: `${pillMinWidth}px`,
          borderRadius: `${radius}px`,
          backgroundColor: baseColor,
        }}
        onMouseEnter={() => setFocused(true)}
      >
        {surface && (
          <canvas
            ref={canvasRef}
            className="ggn-canvas"
            style={{
              top: `${box.offsetY}px`,
              left: `${box.offsetX}px`,
              width: box.width ? `${box.width}px` : "100%",
              height: box.height ? `${box.height}px` : "100%",
              opacity: ready ? 1 : 0,
            }}
          />
        )}

        <div ref={innerRef} className="ggn-inner">
          {children ?? (
            <>
              <span className="ggn-brand" onMouseEnter={() => openPanel(0)}>
                {brand}
              </span>
              <div className="ggn-menu-wrap">
                <ul
                  ref={primaryRef}
                  className="ggn-list"
                  style={{ width: `${listWidth}px` }}
                >
                  {menu.slice(1).map((panel, index) => (
                    <li
                      key={panel.label}
                      className={`ggn-item ${activePanel === index + 1 ? "is-active" : ""}`}
                      onMouseEnter={() => openPanel(index + 1)}
                    >
                      <a className="ggn-link" href={panel.url ?? "#"}>
                        {panel.label}
                      </a>
                    </li>
                  ))}
                  <li
                    className={`ggn-item ${activePanel === contactIndex ? "is-active" : ""}`}
                    onMouseEnter={() => openPanel(contactIndex)}
                  >
                    <span className="ggn-link">{contactLabel}</span>
                  </li>
                </ul>
              </div>
              <div
                className="ggn-handle"
                onMouseEnter={() => closePanel(false)}
                onMouseDown={onHandleDown}
              >
                {HANDLE}
              </div>
            </>
          )}
        </div>

        {!children && (
          <div
            className="ggn-panels"
            style={{
              height: `${panelHeight}px`,
              maxHeight: `${metrics.maxHeight}px`,
            }}
          >
            <div
              className={`ggn-strip ${animate ? "is-animating" : ""}`}
              style={{
                width: `${panelCount * 100}%`,
                transform: `translateX(-${(Math.max(activePanel, 0) * 100) / panelCount}%)`,
              }}
            >
              {menu.map((panel, index) => (
                <div
                  key={panel.label}
                  className="ggn-panel"
                  style={{ width: `${100 / panelCount}%` }}
                >
                  <div
                    ref={(node) => {
                      panelRefs.current[index] = node;
                    }}
                    className="ggn-panel-inner"
                  >
                    <ul className="ggn-panel-list">
                      {panel.links?.map((link) => (
                        <li key={link.url} className="ggn-panel-item">
                          <a className="ggn-panel-link" href={link.url}>
                            <span className="ggn-chip">{ARROW}</span>
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                    {panel.thumb && (
                      <a
                        className="ggn-thumb"
                        href={panel.thumb.url ?? panel.url ?? "#"}
                      >
                        <img src={panel.thumb.src} alt={panel.thumb.alt} />
                      </a>
                    )}
                  </div>
                </div>
              ))}

              <div
                className="ggn-panel"
                style={{ width: `${100 / panelCount}%` }}
              >
                <div
                  ref={(node) => {
                    panelRefs.current[contactIndex] = node;
                  }}
                  className="ggn-panel-inner ggn-panel-inner--contact"
                >
                  <div className="ggn-contact">
                    <h2 className="ggn-contact-heading">{contactHeading}</h2>
                    {contactSections.map((section) => (
                      <div
                        key={section.heading ?? section.items[0]}
                        className="ggn-contact-section"
                      >
                        {section.heading && (
                          <p className="ggn-contact-label">{section.heading}</p>
                        )}
                        {section.items.map((item) => (
                          <p key={item} className="ggn-contact-item">
                            <a href="#contact">{item}</a>
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="ggn-form">
                    <form className="ggn-form-inner" onSubmit={submit}>
                      <h3 className="ggn-form-heading">{formHeading}</h3>
                      <p className="ggn-form-text">{formText}</p>
                      {formFields.map((field) => (
                        <div
                          key={field.name}
                          className={`ggn-row ggn-row--${field.type}`}
                        >
                          {renderField(field)}
                        </div>
                      ))}
                      <div className="ggn-row ggn-row--submit">
                        <button type="submit" className="ggn-submit">
                          <span className="ggn-submit-left">⇀</span>
                          {submitted ? "Sent" : "Submit"}
                          <span className="ggn-submit-right">⇀</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Scoped under `.ggn-root` so the component drops into any page without its
 * element rules leaking. Every duration and easing is the original's.
 */
const CSS_TEXT = `
.ggn-root { position: relative; }
.ggn-root.is-embedded { transform: translateZ(0); overflow: hidden; }
.ggn-root *, .ggn-root *::before, .ggn-root *::after { box-sizing: border-box; }

.ggn-overlay { position: fixed; inset: 0; z-index: 8900; }

.ggn-header {
  position: fixed; z-index: 9999; overflow: hidden; width: max-content;
  transform: translateX(-50%);
  font-family: ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", sans-serif;
  transition: min-width 0.8s cubic-bezier(0.5, 0, 0, 1), margin-top 1.5s cubic-bezier(0, 0, 0, 1);
}
.ggn-header.is-loading { margin-top: -8rem; opacity: 0; transition: none; }
.ggn-header.is-loaded { margin-top: 0; opacity: 1; }
.ggn-header.is-dragging { transition: min-width 0.8s; user-select: none; }

.ggn-canvas { position: absolute; display: block; transition: opacity 0.6s ease; pointer-events: none; }

.ggn-inner {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.875rem 1rem; height: 0.8125rem; box-sizing: content-box;
}

.ggn-brand {
  font-size: 0.8125rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1;
  color: #f7f8ec; white-space: nowrap; margin-right: 1.375rem; cursor: pointer;
}

.ggn-menu-wrap { overflow: hidden; height: 1.4375rem; margin: -0.3125rem 0; flex: 0 1 auto; }
.ggn-list {
  display: flex; list-style: none; margin: 0; padding: 0;
  transition: width 0.8s; overflow: visible; white-space: nowrap;
}
.ggn-item {
  position: relative; display: block; line-height: 1.5em; height: 1.5em;
  margin-right: 1.375rem; cursor: pointer;
}
.ggn-item:last-child { margin-right: 0; }
.ggn-item::after {
  content: ""; position: absolute; top: 1.4em; left: 0;
  height: 1px; width: 0; background-color: #a3a39b;
  transition: width 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
}
.ggn-item:hover::after, .ggn-item.is-active::after { width: 100%; }
.ggn-link {
  display: block; font-size: 0.7072rem; line-height: 1.5em; letter-spacing: -0.04em;
  color: #a3a39b; text-decoration: none; transition: color 0.25s; white-space: nowrap;
}
.ggn-item:hover .ggn-link, .ggn-item.is-active .ggn-link { color: #f7f8ec; }

.ggn-handle {
  position: relative; display: block; width: 0.875rem; height: 0.875rem;
  margin-left: 1.375rem; cursor: move; color: #a3a39b; transition: color 0.25s;
  flex: 0 0 auto;
}
.ggn-handle:hover { color: #f7f8ec; }
.ggn-handle svg { display: block; width: 100%; height: 100%; }

.ggn-panels {
  position: relative; z-index: 1; display: block; width: 100%;
  overflow-x: hidden; overflow-y: auto;
  transition: height 0.8s cubic-bezier(0.5, 0, 0, 1);
}
/* Absolute so the strip contributes height but never width. The pill is
   max-content wide, and a four-panel flex row of nowrap links would otherwise
   set the pill's intrinsic width to the sum of every panel. */
.ggn-strip { position: absolute; top: 0; left: 0; display: flex; align-items: flex-start; }
.ggn-strip.is-animating { transition: transform 0.8s cubic-bezier(0.5, 0, 0, 1); }
.ggn-panel { flex: 0 0 auto; }
.ggn-panel-inner { padding: 0.25rem 1rem 1rem; }

.ggn-panel-list { column-count: 2; column-gap: 0.25rem; list-style: none; margin: 0; padding: 0; }
.ggn-panel-item { display: block; margin-bottom: 0.25rem; break-inside: avoid; }
.ggn-panel-link {
  position: relative; z-index: 1; display: flex; align-items: center;
  padding: 0.75rem 0.6875rem; line-height: 1rem; white-space: nowrap;
  font-size: 0.7072rem; letter-spacing: -0.04em; color: #a3a39b; text-decoration: none;
  transition: color 0.25s;
}
.ggn-panel-link::before {
  content: ""; position: absolute; inset: 0; z-index: -1; border-radius: 0.25rem;
  background-color: #4e4e4a; opacity: 0; transition: opacity 0.25s;
}
.ggn-panel-link:hover { color: #f7f8ec; }
.ggn-panel-link:hover::before { opacity: 1; }
.ggn-chip {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 1rem; height: 1rem; border-radius: 0.25rem;
  margin-right: 0.5rem; background-color: #4e4e4a; color: #cdcec4; flex: 0 0 auto;
}

.ggn-thumb {
  display: block; position: relative; margin-top: 0.5rem;
  padding-top: 62.5%; border-radius: 0.25rem; overflow: hidden;
}
.ggn-thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; max-width: none; }

.ggn-panel-inner--contact { display: flex; gap: 3rem; padding: 1.25rem 1rem 1.75rem; }
.ggn-contact { flex: 0 0 15rem; }
.ggn-contact-heading {
  margin: 0 0 1rem; font-size: 1.1rem; line-height: 1.2em; letter-spacing: -0.05em;
  font-weight: 400; color: #cdcec4; padding-bottom: 1rem; border-bottom: 1px solid #2f2f2c;
}
.ggn-contact-section { padding: 0 0 1rem; border-bottom: 1px solid #2f2f2c; margin-bottom: 1rem; }
.ggn-contact-section:last-child { border-bottom: none; margin-bottom: 0; }
.ggn-contact-label {
  margin: 0 0 0.5rem; font-size: 0.625rem; text-transform: uppercase;
  letter-spacing: 0.01em; font-weight: 500; color: #a3a39b; line-height: 1.6em;
}
.ggn-contact-item { margin: 0 0 0.375rem; font-size: 0.9rem; line-height: 1.2em; letter-spacing: -0.04em; }
.ggn-contact-item a { position: relative; color: #cdcec4; text-decoration: none; transition: color 0.25s; }
.ggn-contact-item a::after {
  content: ""; position: absolute; top: 1.2em; left: 0; height: 1px; width: 0;
  background-color: #787973; transition: width 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
}
.ggn-contact-item a:hover { color: #f7f8ec; }
.ggn-contact-item a:hover::after { width: 100%; }

.ggn-form { flex: 1 1 auto; }
.ggn-form-inner { border-radius: 0.75rem; background-color: #2f2f2c; padding: 1.5rem 1.25rem; }
.ggn-form-heading { margin: 0 0 0.5rem; font-size: 1.1rem; font-weight: 400; line-height: 1.2em; letter-spacing: -0.04em; color: #f7f8ec; }
.ggn-form-text { margin: 0 0 1rem; font-size: 0.7072rem; line-height: 1.4em; color: #cdcec4; }

.ggn-row { display: block; position: relative; }
.ggn-row--text, .ggn-row--email { display: flex; align-items: center; flex-wrap: nowrap; padding-top: 0.75rem; }
.ggn-row--textarea, .ggn-row--file, .ggn-row--options { padding-top: 1.25rem; }
.ggn-label { font-size: 0.75rem; line-height: 1.2em; letter-spacing: -0.04em; color: #f7f8ec; white-space: nowrap; }
.ggn-label--block { display: block; font-size: 0.625rem; color: #a3a39b; }
.ggn-input {
  appearance: none; border: none; border-bottom: 1px solid #4e4e4a; border-radius: 0;
  background-color: transparent; width: 100%; padding: 0.75rem 0; margin-left: 0.5rem;
  font: inherit; font-size: 0.75rem; color: #cdcec4; transition: color 0.25s;
}
.ggn-input:focus { color: #f7f8ec; outline: none; }
.ggn-textarea { margin-left: 0; margin-top: 0.5rem; height: 4.5rem; resize: none; padding-top: 0; }

.ggn-options { display: flex; flex-wrap: wrap; gap: 0.5rem; padding-top: 0.75rem; }
.ggn-option { position: relative; display: block; cursor: pointer; }
.ggn-option input { position: absolute; left: -9999px; }
.ggn-option span {
  display: block; position: relative; padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  line-height: 0.75rem; font-size: 0.7072rem; color: #cdcec4;
  border: 1px solid #4e4e4a; border-radius: 1rem; transition: border-color 0.25s;
}
.ggn-option span::before {
  content: ""; position: absolute; top: 0.625rem; left: 0.75rem;
  width: 0.75rem; height: 0.75rem; border: 1px solid #787973; border-radius: 50%;
}
.ggn-option span::after {
  content: ""; position: absolute; top: calc(0.625rem + 0.25rem); left: calc(0.75rem + 0.25rem);
  width: 0.25rem; height: 0.25rem; background-color: #787973; border-radius: 50%;
  opacity: 0; transition: width 0.25s, height 0.25s, left 0.25s, top 0.25s, opacity 0.25s;
}
.ggn-option:hover span::after { opacity: 1; }
.ggn-option.is-checked span { border-color: #787973; }
.ggn-option.is-checked span::after {
  opacity: 1; top: 0.625rem; left: 0.75rem; width: 0.75rem; height: 0.75rem;
}

.ggn-dropzone { position: relative; display: block; width: 100%; margin-top: 0.5rem; }
.ggn-dropzone input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.001; z-index: 10; cursor: pointer; }
.ggn-dropzone p {
  margin: 0; text-align: center; padding: 0.75rem 0; border: 1px dashed #787973;
  font-size: 0.7072rem; line-height: 1.2em; letter-spacing: -0.04em; color: #a3a39b;
}
.ggn-files { margin: 0.5rem 0 0; padding: 0 0 0 1rem; font-size: 0.7072rem; color: #a3a39b; }

.ggn-consent { position: relative; display: flex; align-items: flex-start; gap: 0.5rem; padding-top: 1.25rem; cursor: pointer; }
.ggn-consent input { position: absolute; left: -9999px; }
.ggn-consent-box {
  flex: 0 0 auto; width: 0.75rem; height: 0.75rem; margin-top: 0.1rem;
  border: 1px solid #787973; border-radius: 50%; transition: background-color 0.25s;
}
.ggn-consent input:checked + .ggn-consent-box { background-color: #787973; }
.ggn-consent-label { font-size: 0.7072rem; line-height: 1.2em; color: #cdcec4; }

.ggn-row--submit { padding-top: 1.5rem; }
.ggn-submit {
  position: relative; display: block; appearance: none; border: none; margin: 0;
  background-color: transparent; font: inherit; font-size: 0.9rem; color: #f7f8ec;
  line-height: 1.3em; letter-spacing: -0.04em; cursor: pointer; overflow: hidden;
  padding: 0 1.125em 0.75rem 0; transition: padding-left 0.5s, padding-right 0.5s;
}
.ggn-submit::before, .ggn-submit::after {
  content: ""; position: absolute; bottom: 0.075em; left: 0; height: 0.075em;
}
.ggn-submit::before { width: 100%; background-color: #787973; }
.ggn-submit::after { width: 0; background-color: #f7f8ec; transition: width 0.5s; }
.ggn-submit:hover { padding-left: 1.125em; padding-right: 0; }
.ggn-submit:hover::after { width: 100%; }
.ggn-submit-left { position: absolute; top: 0; left: -1.125em; width: 1.125em; transition: left 0.5s; }
.ggn-submit-right { position: absolute; top: 0; right: 0; width: 1.125em; transition: right 0.5s; text-align: right; }
.ggn-submit:hover .ggn-submit-left { left: 0; }
.ggn-submit:hover .ggn-submit-right { right: -1.125em; }

@media (prefers-reduced-motion: reduce) {
  .ggn-root *, .ggn-root *::before, .ggn-root *::after { transition-duration: 0.01ms !important; }
}
`;

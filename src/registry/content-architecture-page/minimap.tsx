import { useEffect, useRef, useState } from "react";

type MinimapRectKind = "text" | "media" | "accent";

interface MinimapRect {
  top: number;
  left: number;
  width: number;
  height: number;
  kind: MinimapRectKind;
}

interface StudioFieldRect {
  key: string;
  label: string;
  sectionIndex: number;
  sectionType: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

const MEDIA_TAGS = new Set([
  "FIGURE",
  "IMG",
  "PICTURE",
  "VIDEO",
  "SVG",
  "CANVAS",
]);
const ACCENT_TAGS = new Set(["BUTTON", "INPUT", "TEXTAREA"]);
const MINIMAP_ALPHA: Record<MinimapRectKind, number> = {
  text: 0.35,
  media: 0.15,
  accent: 0.6,
};
const SCAN_ALPHA: Record<MinimapRectKind, number> = {
  text: 0.7,
  media: 0.4,
  accent: 1,
};

function findScrollParent(node: HTMLElement) {
  let current = node.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(`${style.overflow}${style.overflowY}`)) {
      return current;
    }
    current = current.parentElement;
  }
  return window;
}

function classifyElement(element: HTMLElement): MinimapRectKind {
  if (MEDIA_TAGS.has(element.tagName)) return "media";
  if (
    ACCENT_TAGS.has(element.tagName) ||
    element.getAttribute("role") === "button"
  ) {
    return "accent";
  }
  return "text";
}

function getElementRects(element: HTMLElement, kind: MinimapRectKind) {
  if (kind !== "text") return [element.getBoundingClientRect()];
  const range = document.createRange();
  range.selectNodeContents(element);
  const rects = Array.from(range.getClientRects());
  if (rects.length === 0) return [element.getBoundingClientRect()];
  return rects.length > 200 ? rects.slice(0, 200) : rects;
}

function measurePage(root: HTMLElement) {
  const rootRect = root.getBoundingClientRect();
  const scrollParent = findScrollParent(root);
  const scrollTop =
    scrollParent === window
      ? window.scrollY
      : (scrollParent as HTMLElement).scrollTop;
  const originTop = rootRect.top - scrollTop;
  const originLeft = rootRect.left;
  const measured: MinimapRect[] = [];

  for (const section of Array.from(
    root.querySelectorAll<HTMLElement>("[data-page-builder-section]"),
  )) {
    const candidates = Array.from(
      section.querySelectorAll<HTMLElement>(
        "h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,figure,img,picture,video,svg,canvas,button,input,textarea,[role='button']",
      ),
    );
    const candidateSet = new Set(candidates);
    const sectionRect = section.getBoundingClientRect();
    for (const candidate of candidates) {
      let parent = candidate.parentElement;
      let nested = false;
      while (parent && parent !== section) {
        if (candidateSet.has(parent)) {
          nested = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (nested) continue;
      const kind = classifyElement(candidate);
      for (const rect of getElementRects(candidate, kind)) {
        if (
          rect.width < 2 ||
          rect.height < 2 ||
          rect.bottom <= sectionRect.top ||
          rect.top >= sectionRect.bottom
        ) {
          continue;
        }
        measured.push({
          top: rect.top - originTop,
          left: rect.left - originLeft,
          width: rect.width,
          height: rect.height,
          kind,
        });
        if (measured.length >= 1500) return measured;
      }
    }
  }
  return measured;
}

function drawMinimap(
  canvas: HTMLCanvasElement,
  rects: MinimapRect[],
  scaleX: number,
  scaleY: number,
  worldHeight: number,
  color: string,
  alpha: Record<MinimapRectKind, number>,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.parentElement?.parentElement?.clientWidth ?? 1;
  const height = Math.max(1, Math.ceil(worldHeight * scaleY));
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
  context.fillStyle = color;
  for (const rect of rects) {
    context.globalAlpha = alpha[rect.kind];
    context.fillRect(
      rect.left * scaleX,
      rect.top * scaleY,
      rect.width * scaleX,
      rect.height * scaleY,
    );
  }
  context.globalAlpha = 1;
}

function StudioFieldOverlay({
  root,
  active,
  onExit,
}: {
  root: HTMLElement | null;
  active: boolean;
  onExit: () => void;
}) {
  const [fields, setFields] = useState<StudioFieldRect[]>([]);
  const [selected, setSelected] = useState<StudioFieldRect | null>(null);

  useEffect(() => {
    if (!root || !active) {
      setFields([]);
      setSelected(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const next: StudioFieldRect[] = [];
      root
        .querySelectorAll<HTMLElement>("[data-studio-field]")
        .forEach((element, index) => {
          if (element.closest("[inert]")) return;
          const rect = element.getBoundingClientRect();
          if (rect.width < 1 || rect.height < 1) return;
          const field = element.dataset.studioField ?? "content";
          const section = element.closest<HTMLElement>(
            "[data-page-builder-section]",
          );
          const sections = Array.from(
            root.querySelectorAll<HTMLElement>("[data-page-builder-section]"),
          );
          next.push({
            key: `${field}:${index}`,
            label:
              field
                .split(".")
                .at(-1)
                ?.replace(/([a-z])([A-Z])/g, "$1 $2")
                .replaceAll("-", " ") ?? "Content",
            sectionIndex: section ? sections.indexOf(section) : 0,
            sectionType:
              section?.dataset.pageBuilderSection ?? "pageBuilderSection",
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        });
      setFields(next);
    };
    const requestMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    requestMeasure();
    const scrollParent = findScrollParent(root);
    scrollParent.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      scrollParent.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
    };
  }, [active, root]);

  if (!active) return null;
  return (
    <div className="cap-studio-field-overlay">
      {fields.map((field) => (
        <button
          type="button"
          aria-label={`Edit ${field.label}`}
          key={field.key}
          className="cap-studio-field-outline"
          data-selected={selected?.key === field.key}
          onClick={() => setSelected(field)}
          style={{
            top: field.top - 3,
            left: field.left - 3,
            width: field.width + 6,
            height: field.height + 6,
          }}
        >
          <span>✎ {field.label}</span>
        </button>
      ))}
      <aside
        className="cap-studio-panel"
        role="dialog"
        aria-label="Studio Mode"
      >
        <div className="cap-studio-panel-bar">
          <span>⋮⋮</span>
          <i aria-hidden="true" />
          <span>Studio Mode</span>
          <button type="button" onClick={onExit}>
            Exit ✕
          </button>
        </div>
        <div className="cap-studio-panel-head">
          {selected ? (
            <>
              <small>
                Page Builder / Sections / #{selected.sectionIndex + 1}
              </small>
              <strong>{selected.label}</strong>
              <small>{selected.sectionType}</small>
            </>
          ) : (
            <p>
              Click any highlighted field on the page to edit it live. A demo of
              Sanity Presentation: changes are local and reset on reload.
            </p>
          )}
          <div className="cap-studio-panel-tabs">
            <button type="button" data-active="true">
              Content
            </button>
            <button type="button">Page</button>
          </div>
        </div>
        <div className="cap-studio-panel-body">
          {selected ? (
            <label>
              {selected.label}
              <textarea
                defaultValue={
                  root
                    ?.querySelector<HTMLElement>(
                      `[data-studio-field="${CSS.escape(
                        selected.key.split(":")[0] ?? "",
                      )}"]`,
                    )
                    ?.textContent?.trim() ?? ""
                }
              />
            </label>
          ) : (
            <p>Select a highlighted title, paragraph, or page-builder item.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

export function SiteMinimap({ pageRoot }: { pageRoot: HTMLElement | null }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const baseWrapRef = useRef<HTMLDivElement>(null);
  const scanWrapRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [studioArmed, setStudioArmed] = useState(false);

  useEffect(() => {
    if (!pageRoot) return;
    let frame = 0;
    let timeout = 0;
    let destroyed = false;
    let rects: MinimapRect[] = [];
    let scaleY = 0;

    const syncScroll = () => {
      const scrollParent = findScrollParent(pageRoot);
      const scrollTop =
        scrollParent === window
          ? window.scrollY
          : (scrollParent as HTMLElement).scrollTop;
      const transform = `translateY(${-scrollTop * scaleY}px)`;
      if (baseWrapRef.current) baseWrapRef.current.style.transform = transform;
      if (scanWrapRef.current) scanWrapRef.current.style.transform = transform;
    };
    const measure = () => {
      frame = 0;
      if (destroyed || !frameRef.current) return;
      rects = measurePage(pageRoot);
      const scrollParent = findScrollParent(pageRoot);
      const viewportWidth =
        scrollParent === window
          ? window.innerWidth
          : (scrollParent as HTMLElement).clientWidth;
      const viewportHeight =
        scrollParent === window
          ? window.innerHeight
          : (scrollParent as HTMLElement).clientHeight;
      const worldHeight = pageRoot.scrollHeight;
      const scaleX = frameRef.current.clientWidth / viewportWidth;
      scaleY = frameRef.current.clientHeight / viewportHeight;
      const accent =
        getComputedStyle(pageRoot).getPropertyValue("--cap-accent").trim() ||
        "#ff9100";
      if (baseCanvasRef.current) {
        drawMinimap(
          baseCanvasRef.current,
          rects,
          scaleX,
          scaleY,
          worldHeight,
          "#ffffff",
          MINIMAP_ALPHA,
        );
      }
      if (scanCanvasRef.current) {
        drawMinimap(
          scanCanvasRef.current,
          rects,
          scaleX,
          scaleY,
          worldHeight,
          accent,
          SCAN_ALPHA,
        );
      }
      syncScroll();
      setReady(rects.length > 0);
    };
    const requestMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    requestMeasure();
    const scrollParent = findScrollParent(pageRoot);
    scrollParent.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", requestMeasure, { passive: true });
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(requestMeasure, 200);
    });
    resizeObserver.observe(pageRoot);
    const refreshes = [500, 1500, 3000].map((delay) =>
      window.setTimeout(requestMeasure, delay),
    );
    document.fonts?.ready.then(requestMeasure);
    return () => {
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      refreshes.forEach((refresh) => window.clearTimeout(refresh));
      resizeObserver.disconnect();
      scrollParent.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", requestMeasure);
    };
  }, [pageRoot]);

  useEffect(() => {
    if (!studioArmed) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setStudioArmed(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [studioArmed]);

  return (
    <>
      <div
        className="cap-minimap"
        data-studio-armed={studioArmed}
        style={{ opacity: ready ? 1 : 0 }}
      >
        <div ref={frameRef} className="cap-minimap-frame" aria-hidden="true">
          <div className="cap-minimap-base">
            <div ref={baseWrapRef} className="cap-minimap-world">
              <canvas ref={baseCanvasRef} />
            </div>
          </div>
          <div className="cap-minimap-scan">
            <div className="cap-minimap-scan-mask">
              <div className="cap-minimap-scan-counter">
                <div ref={scanWrapRef} className="cap-minimap-world">
                  <canvas ref={scanCanvasRef} />
                </div>
              </div>
            </div>
            <span className="cap-minimap-scan-glow" />
            <span className="cap-minimap-scan-line" />
            <span className="cap-minimap-scan-dot cap-minimap-scan-dot-left" />
            <span className="cap-minimap-scan-dot cap-minimap-scan-dot-right" />
          </div>
        </div>
        <button
          type="button"
          aria-label="Inspect this page in Studio mode"
          onClick={() => setStudioArmed((armed) => !armed)}
        />
        <span className="cap-minimap-inspect">Inspect ↗</span>
      </div>
      <StudioFieldOverlay
        root={pageRoot}
        active={studioArmed}
        onExit={() => setStudioArmed(false)}
      />
    </>
  );
}

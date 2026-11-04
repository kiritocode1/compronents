"use client";

import {
  type DragEvent,
  forwardRef,
  type KeyboardEvent,
  type Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import { type GatherOpts, mountGather } from "./engine";
import { isPlateId, PLATE_LABELS } from "./plates";
import { FONT_HREF, GROUND_DARK, GROUND_LIGHT, LIGHTS } from "./tokens";

const DEFAULT_PLATES = ["sphere", "ripple", "taiji", "ring"];

export { isPlateId, LIGHTS, PLATE_LABELS };

export type GatherFieldProps = {
  drift?: number;
  splash?: number;
  gather?: number;
  depth?: number;
  travel?: "swarm" | "melt";
  track?: boolean;
  links?: boolean;
  scan?: boolean;
  trails?: boolean;
  marks?: boolean;
  trackers?: "sparse" | "dense";
  lineAngle?: number;
  lineOffset?: number;
  fadeSide?: number;
  lightColor?: string;
  paper?: "dark" | "light";
  tone?: "negative" | "true";
  pointCount?: number;
  autoplay?: boolean;
  plates?: string[];
  index?: number;
  lightNonce?: number;
  held?: boolean;
  onIndexChange?: (index: number) => void;
  onLight?: () => void;
  onTogglePaper?: () => void;
  onToggleTravel?: () => void;
  onFiles?: (urls: string[]) => void;
  onInteract?: () => void;
  className?: string;
};

const GatherField = forwardRef<HTMLDivElement, GatherFieldProps>(
  function GatherField(
    {
      drift = 80,
      splash = 70,
      gather = 33,
      depth = 80,
      travel = "swarm",
      track = true,
      links = true,
      scan = false,
      trails = false,
      marks = true,
      trackers = "sparse",
      lineAngle = 100,
      lineOffset = 0,
      fadeSide = -1,
      lightColor = "#fbe7c6",
      paper = "dark",
      tone = "negative",
      pointCount = 0,
      autoplay = true,
      plates,
      index,
      lightNonce,
      held,
      onIndexChange,
      onLight,
      onTogglePaper,
      onToggleTravel,
      onFiles,
      onInteract,
      className,
    },
    ref,
  ) {
    const [paperLive, setPaperLive] = useState(paper);
    const [travelLive, setTravelLive] = useState(travel);
    const [innerIndex, setInnerIndex] = useState(0);
    const [innerLight, setInnerLight] = useState(0);
    const [owned, setOwned] = useState<string[] | null>(null);
    const [innerHeld, setInnerHeld] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [failed, setFailed] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const glRef = useRef<HTMLCanvasElement>(null);
    const hudRef = useRef<HTMLCanvasElement>(null);
    const lineRef = useRef<HTMLCanvasElement>(null);
    const ownedRef = useRef<string[]>([]);
    const onInteractRef = useRef(onInteract);
    const heldRef = useRef(false);
    const optsRef = useRef<GatherOpts | null>(null);

    useEffect(() => setPaperLive(paper), [paper]);
    useEffect(() => setTravelLive(travel), [travel]);
    onInteractRef.current = onInteract;
    heldRef.current = Boolean(held) || innerHeld;

    const shown = plates ?? owned ?? DEFAULT_PLATES;
    const indexLive = index ?? innerIndex;
    const lightLive = lightNonce ?? innerLight;

    function setIndex(n: number) {
      const count = Math.max(1, shown.length);
      const next = ((n % count) + count) % count;
      if (index === undefined) setInnerIndex(next);
      onIndexChange?.(next);
    }

    function fire() {
      if (onLight) onLight();
      else setInnerLight((n) => n + 1);
    }

    function flipPaper() {
      if (onTogglePaper) onTogglePaper();
      else setPaperLive((value) => (value === "dark" ? "light" : "dark"));
    }

    function flipTravel() {
      if (onToggleTravel) onToggleTravel();
      else setTravelLive((value) => (value === "swarm" ? "melt" : "swarm"));
    }

    function hold() {
      heldRef.current = true;
      setInnerHeld(true);
      onInteractRef.current?.();
    }

    function takeFiles(files: File[]) {
      const urls = files
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, 4)
        .map((file) => URL.createObjectURL(file));
      if (urls.length === 0) return;
      if (onFiles) {
        onFiles(urls);
      } else {
        for (const url of ownedRef.current) URL.revokeObjectURL(url);
        ownedRef.current = urls;
        setOwned(urls);
        if (index === undefined) setInnerIndex(0);
        onIndexChange?.(0);
      }
      hold();
    }

    const live = useRef({ index: 0, count: 4, go: (_n: number) => {} });
    live.current.index = indexLive;
    live.current.count = shown.length;
    live.current.go = setIndex;

    optsRef.current = {
      drift,
      splash,
      gather,
      depth,
      travel: travelLive,
      track,
      links,
      scan,
      trails,
      marks,
      trackers,
      lineAngle,
      lineOffset,
      fadeSide,
      lightColor,
      paper: paperLive,
      tone,
      pointCount,
      plates: shown,
      index: indexLive,
      lightNonce: lightLive,
    };

    useEffect(() => {
      const id = "gather-field-fonts";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = FONT_HREF;
        document.head.appendChild(link);
      }
      return () => {
        for (const url of ownedRef.current) URL.revokeObjectURL(url);
      };
    }, []);

    useEffect(() => {
      if (!autoplay) return;
      let timer = 0;
      const tick = () => {
        timer = window.setTimeout(() => {
          if (!heldRef.current && document.visibilityState === "visible") {
            const { index: at, go } = live.current;
            go(at + 1);
          }
          tick();
        }, 6500);
      };
      timer = window.setTimeout(tick, 5500);
      return () => window.clearTimeout(timer);
    }, [autoplay]);

    useEffect(() => {
      const gl = glRef.current;
      const hudCanvas = hudRef.current;
      const lineCanvas = lineRef.current;
      if (!gl || !hudCanvas || !lineCanvas) return;
      const handle = mountGather({
        gl,
        hud: hudCanvas,
        line: lineCanvas,
        getOpts: () => {
          if (!optsRef.current) {
            throw new Error(
              "gather-field: options were read before the first paint",
            );
          }
          return optsRef.current;
        },
        onInteract: () => {
          heldRef.current = true;
          setInnerHeld(true);
          onInteractRef.current?.();
        },
      });
      setFailed(handle === null);
      return () => handle?.dispose();
    }, []);

    function setRoot(node: HTMLDivElement | null) {
      rootRef.current = node;
      assignRef(ref, node);
    }

    function onKey(e: KeyboardEvent<HTMLDivElement>) {
      const key = e.key;
      if (key === " " || key === "Spacebar") {
        e.preventDefault();
        hold();
        setIndex(indexLive + 1);
      } else if (key === "s" || key === "S") {
        e.preventDefault();
        hold();
        fire();
      } else if (key === "b" || key === "B") {
        hold();
        flipPaper();
      } else if (key === "m" || key === "M") {
        hold();
        flipTravel();
      } else if (key === "f" || key === "F") {
        hold();
        const node = rootRef.current;
        if (!node) return;
        if (document.fullscreenElement) void document.exitFullscreen();
        else void node.requestFullscreen();
      } else if (key === "ArrowRight") {
        hold();
        setIndex(indexLive + 1);
      } else if (key === "ArrowLeft") {
        hold();
        setIndex(indexLive - 1);
      } else if (key >= "1" && key <= "4") {
        const n = Number(key) - 1;
        if (n < shown.length) {
          hold();
          setIndex(n);
        }
      }
    }

    const ground = paperLive === "light" ? GROUND_LIGHT : GROUND_DARK;

    return (
      <div
        ref={setRoot}
        className={`relative h-full w-full overflow-hidden outline-none ${className ?? ""}`}
        style={{
          background: ground,
          color: paperLive === "light" ? "#101012" : "#ecece8",
          transition: "background-color 0.5s ease, color 0.5s ease",
          touchAction: "none",
        }}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the field takes Space, arrows, and S
        tabIndex={0}
        role="application"
        aria-label="Point field. Drag to turn it, scroll to zoom. Space turns the page. S lights it."
        onKeyDown={onKey}
        onPointerDown={() => rootRef.current?.focus()}
        onDragOver={(e) => {
          if (![...e.dataTransfer.types].includes("Files")) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragging(false);
          takeFiles([...e.dataTransfer.files]);
        }}
      >
        <canvas ref={glRef} className="absolute inset-0 h-full w-full" />
        <canvas
          ref={hudRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <canvas
          ref={lineRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ mixBlendMode: "difference" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.5em]"
          style={{ opacity: dragging ? 1 : 0, transition: "opacity 0.2s" }}
        >
          DROP UP TO FOUR PICTURES
        </div>
        {failed ? (
          <p className="absolute inset-0 flex items-center justify-center px-10 text-center text-[10px] uppercase tracking-[0.32em]">
            This browser cannot draw the field. WebGL 2 is missing.
          </p>
        ) : null}
      </div>
    );
  },
);

export default GatherField;

function assignRef(ref: Ref<HTMLDivElement>, node: HTMLDivElement | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

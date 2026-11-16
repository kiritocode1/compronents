"use client";

/**
 * Scribble Cursor - a pen line that chases the pointer and redraws itself
 * every frame with random control-point offsets, so it reads as a hand-drawn
 * scribble. A chain of spring points follows the pointer; each segment is a
 * quadratic curve whose control point jumps by up to `jitter` px per frame.
 * The line clears 100ms after the pointer stops.
 *
 * `tracking="global"` draws for pointer movement anywhere. `tracking="hover"`
 * draws only while the pointer is over this component's box (its children).
 * By default the canvas is fixed over the viewport; pass `container` to keep
 * the canvas and global tracking inside one element.
 *
 * BLANK - aryank.space
 */

import {
  type CSSProperties,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export interface ScribbleCursorProps {
  /** Stroke colour. */
  color?: string;
  /** Stroke width in px. */
  strokeWidth?: number;
  /** Spring points in the chain, minimum 2. More points give a longer tail. */
  points?: number;
  /** Pull towards the point ahead, 0.05 to 1. Higher snaps faster. */
  tension?: number;
  /** Velocity kept per frame, 0.1 to 0.99. Lower damps harder. */
  friction?: number;
  /** Max random control-point offset in px. 0 draws a smooth line. */
  jitter?: number;
  /** Draw for movement anywhere, or only over this component. */
  tracking?: "global" | "hover";
  /**
   * Element the canvas covers and measures from. Omit to cover the viewport
   * with a fixed canvas.
   */
  container?: RefObject<HTMLElement | null>;
  className?: string;
  style?: CSSProperties;
  /** Hover target content when `tracking="hover"`. */
  children?: ReactNode;
}

type Point = { x: number; y: number; dx: number; dy: number };

export default function ScribbleCursor({
  color = "#3DA8FF",
  strokeWidth = 2,
  points = 8,
  tension = 0.95,
  friction = 0.38,
  jitter = 65,
  tracking = "global",
  container,
  className,
  style,
  children,
}: ScribbleCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chain = useRef<Point[]>([]);
  const target = useRef({ x: 0, y: 0 });
  const moving = useRef(false);
  const idleTimer = useRef<number | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  // Resolve the portal target after mount: a parent's ref is not attached yet
  // during this component's layout effects, and this keeps the canvas out of
  // server-rendered markup.
  useEffect(() => {
    setHost(container ? container.current : document.body);
  }, [container]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Pointer position in canvas space: the viewport for the fixed canvas,
  // the container's box otherwise.
  const move = useCallback(
    (clientX: number, clientY: number) => {
      let x = clientX;
      let y = clientY;
      if (container?.current) {
        const r = container.current.getBoundingClientRect();
        x -= r.left;
        y -= r.top;
      }
      if (chain.current.length === 0)
        for (let i = 0; i < Math.max(2, points); i++)
          chain.current.push({ x, y, dx: 0, dy: 0 });
      target.current = { x, y };
      moving.current = true;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        moving.current = false;
      }, 100);
    },
    [points, container],
  );

  const stop = useCallback(() => {
    moving.current = false;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    clear();
  }, [clear]);

  // Canvas backing size follows the viewport, or the container.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const box = container?.current ?? null;
    const resize = () => {
      const w = box ? box.clientWidth : window.innerWidth;
      const h = box ? box.clientHeight : window.innerHeight;
      const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (canvas.width === pw && canvas.height === ph) return;
      canvas.width = pw;
      canvas.height = ph;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    if (box) {
      const ro = new ResizeObserver(resize);
      ro.observe(box);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [host, container]);

  // Global tracking listens on the window, or on the container when given.
  useEffect(() => {
    if (tracking !== "global" || !host) return;
    const el = container?.current ?? window;
    const onMove = (e: Event) => {
      const p = e as PointerEvent;
      move(p.clientX, p.clientY);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, [tracking, host, container, move]);

  // Resize the chain when `points` changes; new points start at the tail.
  useEffect(() => {
    const n = Math.max(2, points);
    const c = chain.current;
    if (c.length < n) {
      const last = c[c.length - 1] ?? target.current;
      while (c.length < n) c.push({ x: last.x, y: last.y, dx: 0, dy: 0 });
    } else if (c.length > n) c.length = n;
  }, [points]);

  // Frame loop. The Math.random() calls keep the source's order, so a seeded
  // run draws the same strokes as the original.
  useEffect(() => {
    let raf = 0;
    const frame = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        if (moving.current && chain.current.length > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const c = chain.current;
          const head = target.current;
          c.forEach((p, i) => {
            const lead = i === 0 ? head : c[i - 1];
            p.dx += tension * (lead.x - p.x) + 2 * Math.random();
            p.dy += tension * (lead.y - p.y) + 2 * Math.random();
            p.dx *= friction;
            p.dy *= friction;
            p.x += p.dx;
            p.y += p.dy;
          });
          ctx.beginPath();
          ctx.moveTo(c[0].x + Math.random() * 2, c[0].y + Math.random() * 2);
          for (let i = 0; i < c.length - 1; i++) {
            const mx = 0.5 * (c[i].x + c[i + 1].x + Math.random() * 2);
            const my = 0.5 * (c[i].y + c[i + 1].y + Math.random() * 2);
            ctx.quadraticCurveTo(
              c[i].x + Math.random() * jitter - jitter / 2,
              c[i].y + Math.random() * jitter - jitter / 2,
              mx,
              my,
            );
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            // The source strokes the growing path once per segment, so the
            // early segments are painted several times. Kept for identical
            // antialiasing.
            ctx.stroke();
          }
          ctx.lineTo(c[c.length - 1].x, c[c.length - 1].y);
          ctx.stroke();
        } else ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [color, strokeWidth, tension, friction, jitter]);

  useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    [],
  );

  const onHover =
    tracking === "hover"
      ? (e: ReactPointerEvent) => move(e.clientX, e.clientY)
      : undefined;

  const canvas = (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={
        container
          ? {
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              zIndex: 99999,
            }
          : {
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "none",
              zIndex: 99999,
            }
      }
    />
  );

  return (
    <div
      className={className}
      style={{
        ...style,
        pointerEvents: tracking === "global" ? "none" : "auto",
      }}
      onPointerMove={onHover}
      onPointerDown={onHover}
      onPointerLeave={tracking === "hover" ? stop : undefined}
      onPointerCancel={tracking === "hover" ? stop : undefined}
    >
      {children}
      {host ? createPortal(canvas, host) : null}
    </div>
  );
}

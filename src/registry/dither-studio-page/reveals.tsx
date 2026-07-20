"use client";

/**
 * The two text-reveal primitives the page is built from.
 *
 * `TextReveal` masks a block per line and slides each line up out of its own
 * clip box, staggered. `MonoReveal` stacks two copies of a label: one that
 * animates and one held at zero opacity purely to reserve the layout box, so the
 * roll never reflows anything around it. Both are driven by IntersectionObserver
 * so they fire once as they enter, and both collapse to a plain static render
 * when reduced motion is requested.
 *
 * BLANK - aryank.space
 */

import {
  type ElementType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Fires once when the element first crosses into view. */
function useInView<T extends HTMLElement>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
}

export interface TextRevealProps {
  /** One entry per line. Lines are split by the caller so wrapping stays intentional. */
  lines: string[];
  as?: ElementType;
  className?: string;
  /** Seconds between consecutive lines. */
  stagger?: number;
  delay?: number;
}

export function TextReveal({
  lines,
  as: Tag = "div",
  className,
  stagger = 0.08,
  delay = 0,
}: TextRevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const reduced = useReducedMotion();
  const shown = inView || reduced;

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span
          key={line}
          className="dsp-reveal-line"
          data-shown={shown ? "true" : "false"}
          style={{
            transitionDelay: reduced ? "0s" : `${delay + i * stagger}s`,
          }}
        >
          <span className="dsp-reveal-line-inner">{line}</span>
        </span>
      ))}
    </Tag>
  );
}

export interface MonoRevealProps {
  children: ReactNode;
  /** Swapped in on hover. Omit for a reveal with no hover state. */
  hoverChildren?: ReactNode;
  className?: string;
  delay?: number;
}

export function MonoReveal({
  children,
  hoverChildren,
  className,
  delay = 0,
}: MonoRevealProps) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const reduced = useReducedMotion();
  const shown = inView || reduced;

  return (
    <span
      ref={ref}
      className={`dsp-mono-reveal${className ? ` ${className}` : ""}`}
      data-shown={shown ? "true" : "false"}
      data-swap={hoverChildren ? "true" : "false"}
      style={{ transitionDelay: reduced ? "0s" : `${delay}s` }}
    >
      {/* the animating copy */}
      <span className="dsp-mono-reveal-anim">{children}</span>
      {/* the hover copy, waiting one line below */}
      {hoverChildren ? (
        <span className="dsp-mono-reveal-hover">{hoverChildren}</span>
      ) : null}
      {/* zero-opacity copy that reserves the box so the roll never reflows */}
      <span className="dsp-mono-reveal-ghost" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

/** Styles for both primitives, injected once by the page. */
export const REVEAL_STYLES = `
.dsp-reveal-line {
  display: block;
  clip-path: inset(-10% -10% 110% -10%);
  transition: clip-path 0.85s cubic-bezier(0.16, 1, 0.3, 1);
}
.dsp-reveal-line[data-shown="true"] {
  clip-path: inset(-10% -10% -10% -10%);
}
.dsp-reveal-line-inner {
  display: block;
  transform: translateY(80%) scale(0.96);
  opacity: 0;
  transform-origin: left bottom;
  transition:
    transform 0.85s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: inherit;
}
.dsp-reveal-line[data-shown="true"] .dsp-reveal-line-inner {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.dsp-mono-reveal {
  position: relative;
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
}
.dsp-mono-reveal-anim,
.dsp-mono-reveal-hover {
  position: absolute;
  inset: 0;
  display: block;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: inherit;
}
.dsp-mono-reveal-anim { transform: translateY(100%); }
.dsp-mono-reveal[data-shown="true"] .dsp-mono-reveal-anim { transform: translateY(0); }
.dsp-mono-reveal-hover { transform: translateY(100%); }
.dsp-mono-reveal[data-swap="true"]:hover .dsp-mono-reveal-anim { transform: translateY(-100%); }
.dsp-mono-reveal[data-swap="true"]:hover .dsp-mono-reveal-hover { transform: translateY(0); }
.dsp-mono-reveal-ghost {
  display: block;
  opacity: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .dsp-reveal-line,
  .dsp-reveal-line-inner,
  .dsp-mono-reveal-anim,
  .dsp-mono-reveal-hover {
    transition: none;
  }
}
`;

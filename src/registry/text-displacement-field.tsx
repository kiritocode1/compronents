"use client";

/**
 * Text Displacement Field - words and letters pushed away by the cursor.
 *
 * A readable block is split into independent spans. Pointer movement creates a
 * soft force field that pushes nearby spans outward, then eases them home.
 *
 * BLANK - aryank.space
 */

import type * as React from "react";
import { useEffect, useMemo, useRef } from "react";

export interface TextDisplacementFieldProps {
  intro?: string;
  body?: string;
  outro?: string;
  background?: string;
  textColor?: string;
  mutedColor?: string;
  radius?: number;
  displacement?: number;
  ease?: number;
}

interface Target {
  element: HTMLSpanElement;
  originalX: number;
  originalY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
}

const DEFAULT_BODY =
  "Sharing the craft behind building interactive experiences and carefully tuned websites. The best lessons live in small gestures: a word moving away from the cursor, a line finding its rhythm, a surface reacting without shouting. This component turns text into a responsive field while keeping the copy readable.";

function splitLetters(value: string) {
  return value.split("").map((char, index) => ({ char, index }));
}

function splitWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

export default function TextDisplacementField({
  intro = "one subscription",
  body = DEFAULT_BODY,
  outro = "endless web design",
  background = "#f3efe6",
  textColor = "#171717",
  mutedColor = "#57534a",
  radius = 150,
  displacement = 300,
  ease = 0.1,
}: TextDisplacementFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<HTMLSpanElement[]>([]);
  const introLetters = useMemo(() => splitLetters(intro), [intro]);
  const outroLetters = useMemo(() => splitLetters(outro), [outro]);
  const words = useMemo(() => splitWords(body), [body]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets: Target[] = targetRefs.current.filter(Boolean).map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        element: el,
        originalX: rect.left + rect.width / 2,
        originalY: rect.top + rect.height / 2,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
      };
    });

    const measure = () => {
      for (const target of targets) {
        const rect = target.element.getBoundingClientRect();
        target.originalX = rect.left + rect.width / 2 - target.currentX;
        target.originalY = rect.top + rect.height / 2 - target.currentY;
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      for (const target of targets) {
        const dx = target.originalX - event.clientX;
        const dy = target.originalY - event.clientY;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < radius) {
          const force = (1 - distance / radius) * displacement;
          target.targetX = (dx / distance) * force;
          target.targetY = (dy / distance) * force;
        } else {
          target.targetX = 0;
          target.targetY = 0;
        }
      }
    };

    const onMouseLeave = () => {
      for (const target of targets) {
        target.targetX = 0;
        target.targetY = 0;
      }
    };

    let frame = 0;
    const animate = () => {
      for (const target of targets) {
        target.currentX += (target.targetX - target.currentX) * ease;
        target.currentY += (target.targetY - target.currentY) * ease;
        target.element.style.transform = `translate3d(${target.currentX}px, ${target.currentY}px, 0)`;
      }
      frame = requestAnimationFrame(animate);
    };

    root.addEventListener("mousemove", onMouseMove);
    root.addEventListener("mouseleave", onMouseLeave);
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("mousemove", onMouseMove);
      root.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [radius, displacement, ease]);

  targetRefs.current = [];
  const setTarget = (node: HTMLSpanElement | null) => {
    if (node) targetRefs.current.push(node);
  };

  return (
    <section
      className="tdf-root"
      ref={rootRef}
      style={
        {
          "--tdf-bg": background,
          "--tdf-text": textColor,
          "--tdf-muted": mutedColor,
        } as React.CSSProperties
      }
    >
      <style>{styles}</style>
      <h2 className="tdf-header" aria-label={intro}>
        {introLetters.map(({ char, index }) =>
          char === " " ? (
            <span aria-hidden="true" key={`intro-space-${index}`}>
              {" "}
            </span>
          ) : (
            <span className="tdf-letter" key={`intro-${index}`} ref={setTarget}>
              {char}
            </span>
          ),
        )}
      </h2>
      <p className="tdf-body">
        {words.map((word, index) => (
          <span className="tdf-word" key={`${word}-${index}`} ref={setTarget}>
            {word}
            {index < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      <h2 className="tdf-header" aria-label={outro}>
        {outroLetters.map(({ char, index }) =>
          char === " " ? (
            <span aria-hidden="true" key={`outro-space-${index}`}>
              {" "}
            </span>
          ) : (
            <span className="tdf-letter" key={`outro-${index}`} ref={setTarget}>
              {char}
            </span>
          ),
        )}
      </h2>
    </section>
  );
}

const styles = `
.tdf-root {
  width: 100%;
  min-height: 620px;
  padding: clamp(1.5rem, 4vw, 4rem);
  overflow: hidden;
  background: var(--tdf-bg);
  color: var(--tdf-text);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 3rem;
}

.tdf-header {
  margin: 0;
  max-width: 11ch;
  font-family: "Times New Roman", Georgia, serif;
  font-size: clamp(3.4rem, 12vw, 11rem);
  font-weight: 400;
  line-height: 0.9;
  text-transform: uppercase;
  letter-spacing: 0;
}

.tdf-body {
  align-self: flex-end;
  width: min(720px, 100%);
  margin: 0;
  color: var(--tdf-muted);
  font-size: clamp(1rem, 2vw, 1.55rem);
  line-height: 1.28;
}

.tdf-letter,
.tdf-word {
  display: inline-block;
  will-change: transform;
}
`;

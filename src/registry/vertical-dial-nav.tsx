"use client";

import type { CSSProperties, RefObject } from "react";
import { startTransition, useEffect, useRef, useState } from "react";

export interface DialSection {
  id: string;
  label: string;
}

export interface VerticalDialNavProps {
  sections: readonly DialSection[];
  activeColor?: string;
  fadeDistance?: number;
  font?: CSSProperties;
  dialWidth?: number;
  dialRadius?: number;
  itemSpacing?: number;
  alignment?: "left" | "center" | "right";
  scrollRoot?: RefObject<HTMLElement | null>;
  style?: CSSProperties;
  className?: string;
}

export const DIAL_TRANSITION =
  "opacity 0.4s cubic-bezier(.4,0,.2,1), color 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1), font-variation-settings 0.4s cubic-bezier(.4,0,.2,1)";

export function dialOpacity(distance: number, fadeDistance: number) {
  return distance === 0
    ? 1
    : distance > fadeDistance
      ? 0.2
      : 1 - (distance / (fadeDistance + 1)) * 0.8;
}

/** Scroll-linked section navigation. Pass a root ref when sections scroll inside a container. */
export default function VerticalDialNav({
  sections,
  activeColor = "rgb(26, 26, 26)",
  fadeDistance = 2,
  font = {
    fontFamily: "Geist, sans-serif",
    fontSize: 16,
    letterSpacing: "-0.05em",
  },
  dialWidth = 180,
  dialRadius = 0,
  itemSpacing = 12,
  alignment = "right",
  scrollRoot,
  style,
  className,
}: VerticalDialNavProps) {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const links = useRef<HTMLDivElement>(null);
  const activeLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = scrollRoot?.current;
    const target = root ?? window;
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const top = root
          ? root.getBoundingClientRect().top + root.clientTop
          : 0;
        const height = root ? root.clientHeight : window.innerHeight;
        let next = 0;
        sections.forEach((section, index) => {
          const node = root
            ? root.querySelector<HTMLElement>(
                `[id="${CSS.escape(section.id)}"]`,
              )
            : document.getElementById(section.id);
          if (node && node.getBoundingClientRect().top - top <= height * 0.3)
            next = index;
        });
        startTransition(() => setActive(next));
      });
    };
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = root ? new ResizeObserver(update) : null;
    if (root) observer?.observe(root);
    update();
    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [sections, scrollRoot]);

  useEffect(() => {
    const list = links.current;
    const link = activeLink.current;
    if (!list || !link || list.scrollHeight <= list.clientHeight) return;
    // Center inside the dial only, without scrolling the page or other ancestors.
    list.scrollTo({
      top: link.offsetTop - (list.clientHeight - link.offsetHeight) / 2,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }, [active, reducedMotion]);

  const alignItems =
    alignment === "left"
      ? "flex-start"
      : alignment === "right"
        ? "flex-end"
        : "center";
  return (
    <nav
      className={className}
      aria-label="Section navigation"
      style={{
        ...style,
        width: dialWidth,
        height: "100%",
        minWidth: dialWidth,
        background: "none",
        borderRadius: dialRadius,
        display: "flex",
        flexDirection: "column",
        alignItems,
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        boxShadow: "none",
        textRendering: "auto",
      }}
    >
      <style>{`.vertical-dial-link:focus-visible{outline:2px solid currentColor!important;outline-offset:-2px}`}</style>
      <div
        ref={links}
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems,
          justifyContent: "center",
          gap: Math.max(0, itemSpacing),
          scrollbarWidth: "none",
          paddingRight: alignment === "right" ? 8 : 0,
          paddingLeft: alignment === "left" ? 8 : 0,
        }}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: this scroll region is keyboard-scrollable.
        tabIndex={0}
      >
        {sections.map((section, index) => (
          <a
            key={section.id}
            ref={index === active ? activeLink : undefined}
            className="vertical-dial-link"
            href={`#${section.id}`}
            aria-current={index === active ? "true" : undefined}
            onClick={(event) => {
              event.preventDefault();
              const root = scrollRoot?.current;
              const node = root
                ? root.querySelector<HTMLElement>(
                    `[id="${CSS.escape(section.id)}"]`,
                  )
                : document.getElementById(section.id);
              if (!node) return;
              const behavior = reducedMotion ? "instant" : "smooth";
              if (root)
                root.scrollTo({
                  top:
                    root.scrollTop +
                    node.getBoundingClientRect().top -
                    root.getBoundingClientRect().top -
                    root.clientTop,
                  behavior,
                });
              else node.scrollIntoView({ behavior, block: "start" });
              startTransition(() => setActive(index));
            }}
            style={{
              color: index === active ? activeColor : "#000000",
              ...font,
              opacity: dialOpacity(Math.abs(index - active), fadeDistance),
              transition: reducedMotion ? "none" : DIAL_TRANSITION,
              padding: 0,
              width: "100%",
              textAlign: alignment,
              cursor: "pointer",
              userSelect: "none",
              textDecoration: "none",
              fontWeight: index === active ? 500 : 400,
              fontVariationSettings:
                index === active ? '"wght" 500' : '"wght" 400',
              fontSize: font.fontSize || 18,
              borderRadius: 6,
              background: "transparent",
              outline: "none",
              transform: index === active ? "scale(1.06)" : "scale(1)",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              willChange: "opacity, color, transform, font-variation-settings",
              minHeight: 0,
              lineHeight: 1,
              boxSizing: "border-box",
              margin: 0,
            }}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

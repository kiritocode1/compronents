// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import React, { useRef } from "react";

import {
  createScrambleSplit,
  playScrambleIn,
  revertScrambleInstance,
} from "../../utils/scramble";

gsap.registerPlugin(SplitText, ScrollTrigger);

/** Project font families (see src/app/fonts.css). */
const REQUIRED_FONTS = ["Verilet", "Cossette Titre", "SUSE Mono"];

const TEXT_SELECTOR =
  "h1,h2,h3,h4,h5,h6,p,a,li,label,blockquote,figcaption,span";

/** Matches menu nav text reveal (Menu.jsx). */
const SCRAMBLE_OPTIONS = {
  duration: 0.15,
  charDelay: 50,
  stagger: 25,
  maxIterations: 5,
};

// wait for custom fonts before splitting text
async function waitForFonts() {
  try {
    await document.fonts.ready;
    REQUIRED_FONTS.forEach((font) => document.fonts.check(`16px "${font}"`));
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

// resolve scrolltrigger trigger element from selector or fallback
function resolveTriggerElement(selector, fallback) {
  if (typeof selector === "string" && selector.trim().length > 0) {
    return (
      fallback.closest(selector) || document.querySelector(selector) || fallback
    );
  }
  return fallback;
}

// collect leaf text elements in dom order for shared stagger
function getAnimatableElements(root) {
  const candidates = Array.from(root.querySelectorAll(TEXT_SELECTOR)).filter(
    (el) => root.contains(el) && el.textContent?.trim(),
  );

  const leaves = candidates.filter(
    (el) => !candidates.some((other) => other !== el && el.contains(other)),
  );

  if (leaves.length > 0) {
    return leaves;
  }

  if (root.hasAttribute("data-copy-wrapper") && root.children.length > 0) {
    return Array.from(root.children);
  }

  return [root];
}

// move text-indent to first split unit so mask aligns correctly
function preserveTextIndent(element, units) {
  const computedStyle = window.getComputedStyle(element);
  const textIndent = computedStyle.textIndent;
  if (textIndent && textIndent !== "0px" && units.length > 0) {
    units[0].style.paddingLeft = textIndent;
    element.style.textIndent = "0";
  }
}

// create scrolltrigger for on-scroll or immediate animation playback
function attachScrollTrigger(
  scrollTriggerRefs,
  { animateOnScroll, triggerElement, start, animation, onEnter },
) {
  if (!animateOnScroll) return;

  const scrollTrigger = ScrollTrigger.create({
    trigger: triggerElement,
    start,
    once: true,
    refreshPriority: -1,
    ...(onEnter
      ? { onEnter }
      : { animation, toggleActions: "play none none none" }),
  });

  scrollTriggerRefs.current.push(scrollTrigger);
}

/**
 * Copy - animated text reveal (slide line mask or scramble).
 *
 * Nested blocks (e.g. multiple columns) share one sequential stagger across all lines.
 *
 * @example Slide (default) - masked line reveal
 *   <Copy>
 *     <h1 className="type-2">Subject Identified</h1>
 *   </Copy>
 *
 * @example Flicker - menu-style character scramble reveal
 *   <Copy variant="flicker">
 *     <p className="mono">Surveillance log entry</p>
 *   </Copy>
 *
 * @example Nested columns - lines stagger in DOM order across both columns
 *   <Copy animateOnScroll={false}>
 *     <div><h6>Line A</h6><h6>Line B</h6></div>
 *     <div><h6>Line C</h6></div>
 *   </Copy>
 *
 * Props:
 *  - children         : ReactNode - one element (cloned with ref) or multiple (auto-wrapped)
 *  - variant          : "slide" | "flicker" - slide = line mask; flicker = scramble (default "slide")
 *  - animateOnScroll  : boolean - if true, play when scrolled into view; if false, on mount (default true)
 *  - delay            : number - seconds before reveal starts (default 0)
 *  - stagger          : number - slide: delay between lines in seconds (default 0.05); flicker: delay between elements in seconds (default 0.1)
 *  - type             : "lines" | "words" - slide only: split unit (default "lines")
 *  - trigger          : string | null - ScrollTrigger trigger selector (default null = Copy root)
 *  - triggerPoint     : string | null - alias for trigger; wins when both are set
 *  - start            : string | null - ScrollTrigger start; defaults "top 80%" (slide) or "top 85%" (flicker)
 */
export default function Copy({
  children,
  variant = "slide",
  animateOnScroll = true,
  delay = 0,
  stagger = null,
  type = "lines",
  trigger = null,
  triggerPoint = null,
  start = null,
}) {
  const containerRef = useRef(null);
  const splitInstanceRefs = useRef([]);
  const scrambleInstanceRefs = useRef([]);
  const scrollTriggerRefs = useRef([]);
  const combinedTweenRef = useRef(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      let isActive = true;
      let rebuildTimer = null;

      // tear down scramble instances and ready-state classes
      const cleanupScramble = () => {
        scrambleInstanceRefs.current.forEach(revertScrambleInstance);
        scrambleInstanceRefs.current = [];

        containerRef.current?.removeAttribute("data-copy-scramble");
        containerRef.current?.classList.remove("copy-scramble-ready");
      };

      const setSlideReady = (ready) => {
        if (variant !== "slide" || !containerRef.current) return;

        containerRef.current.classList.toggle("copy-slide-ready", ready);
      };

      const cleanupInstances = () => {
        if (rebuildTimer) {
          clearTimeout(rebuildTimer);
          rebuildTimer = null;
        }

        combinedTweenRef.current?.kill();
        combinedTweenRef.current = null;

        scrollTriggerRefs.current.forEach((st) => st?.kill());
        scrollTriggerRefs.current = [];

        splitInstanceRefs.current.forEach((split) => split?.revert());
        splitInstanceRefs.current = [];

        setSlideReady(false);
        cleanupScramble();
      };

      const scheduleCombinedRebuild = (run) => {
        if (rebuildTimer) clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
          rebuildTimer = null;
          if (isActive) run();
        }, 50);
      };

      // rebuild splits and animations after fonts load
      const buildAnimations = async () => {
        await waitForFonts();
        if (!isActive || !containerRef.current) return;

        cleanupInstances();

        const root = containerRef.current;
        const targetElements = getAnimatableElements(root);

        const isScramble = variant === "flicker";
        const resolvedStart = start ?? (isScramble ? "top 85%" : "top 80%");
        const resolvedStagger = stagger ?? (isScramble ? 0.1 : 0.05);

        const triggerElement = resolveTriggerElement(
          triggerPoint ?? trigger,
          root,
        );

        if (isScramble) {
          root.classList.remove("copy-scramble-ready");

          scrambleInstanceRefs.current = targetElements
            .map((element) => createScrambleSplit(element))
            .filter(Boolean);

          root.classList.add("copy-scramble-ready");

          // stagger scramble-in across all target elements
          const runScrambleSequence = () => {
            scrambleInstanceRefs.current.forEach((instance, index) => {
              playScrambleIn(
                instance,
                delay + index * resolvedStagger,
                SCRAMBLE_OPTIONS,
              );
            });
          };

          if (animateOnScroll) {
            attachScrollTrigger(scrollTriggerRefs, {
              animateOnScroll,
              triggerElement,
              start: resolvedStart,
              onEnter: runScrambleSequence,
            });
          } else {
            runScrambleSequence();
          }

          return;
        }

        // slide variant - combined line/word reveal across all targets
        const runCombinedAnimation = () => {
          combinedTweenRef.current?.kill();
          scrollTriggerRefs.current.forEach((st) => st?.kill());
          scrollTriggerRefs.current = [];

          const allUnits = [];

          targetElements.forEach((element, index) => {
            const split = splitInstanceRefs.current[index];
            if (!split) return;

            const units = type === "words" ? split.words : split.lines;
            preserveTextIndent(element, units);
            allUnits.push(...units);
          });

          if (allUnits.length === 0) {
            setSlideReady(true);
            return;
          }

          gsap.set(allUnits, { yPercent: 110 });
          setSlideReady(true);

          combinedTweenRef.current = gsap.to(allUnits, {
            yPercent: 0,
            duration: 0.75,
            ease: "power3.out",
            delay,
            stagger: resolvedStagger,
            paused: animateOnScroll,
          });

          attachScrollTrigger(scrollTriggerRefs, {
            animateOnScroll,
            triggerElement,
            start: resolvedStart,
            animation: combinedTweenRef.current,
          });
        };

        // create splittext instances with auto-split rebuild on resize
        const createSplits = () => {
          setSlideReady(false);

          splitInstanceRefs.current.forEach((split) => split?.revert());
          splitInstanceRefs.current = [];

          const isWordSplit = type === "words";

          targetElements.forEach((element) => {
            const split = SplitText.create(element, {
              type: isWordSplit ? "words" : "lines",
              mask: isWordSplit ? "words" : "lines",
              autoSplit: true,
              ...(isWordSplit
                ? { wordsClass: "word" }
                : { linesClass: "line", lineThreshold: 0.1 }),
              onSplit: () => scheduleCombinedRebuild(runCombinedAnimation),
            });

            splitInstanceRefs.current.push(split);
          });
        };

        createSplits();
      };

      buildAnimations();

      return () => {
        isActive = false;
        cleanupInstances();
      };
    },
    {
      scope: containerRef,
      dependencies: [
        variant,
        animateOnScroll,
        delay,
        stagger,
        type,
        trigger,
        triggerPoint,
        start,
      ],
    },
  );

  const copyAttrs =
    variant === "flicker"
      ? { "data-copy-scramble": "" }
      : variant === "slide"
        ? { "data-copy-slide": "" }
        : undefined;

  if (React.Children.count(children) === 1 && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: containerRef,
      ...copyAttrs,
    });
  }

  return (
    <div ref={containerRef} data-copy-wrapper="true" {...copyAttrs}>
      {children}
    </div>
  );
}

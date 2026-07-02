// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useCallback, useEffect, useRef } from "react";

import { useAsset } from "../../runtime";

gsap.registerPlugin(SplitText);

const ACCORDION_ITEMS = [
  {
    id: "01",
    title: "Tension Over Reward",
    description:
      "We don't design progression loops that hand players a treat for completing tasks. We design systems where the absence of resolution is the point. The player is always reaching for ground that shifts beneath them. Comfort is the enemy of memorable design.",
    image: "/accordion/accordion-1.jpg",
  },
  {
    id: "02",
    title: "Atmosphere First",
    description:
      "Every project begins with a feeling, not a feature list. We define the emotional signature of a world before we write a single line of code. If we cannot describe how the game makes you feel in one sentence, it is not ready to be built.",
    image: "/accordion/accordion-2.jpg",
  },
  {
    id: "03",
    title: "Invisible Systems",
    description:
      "The best mechanics are the ones players never notice consciously. We build rulesets that shape behavior from underneath, adjusting difficulty, pacing, and environmental cues based on how the player moves and hesitates. The game watches you as much as you watch it.",
    image: "/accordion/accordion-3.jpg",
  },
  {
    id: "04",
    title: "Restraint as Language",
    description:
      "We say more by showing less. Empty rooms carry more weight than crowded ones. A single flickering light communicates more threat than an army of enemies. Every element earns its place through subtraction and what remains is only what absolutely needs to exist.",
    image: "/accordion/accordion-4.jpg",
  },
];

const ACCORDION_EXPANDED = 52;
const ACCORDION_COLLAPSED = 16;
const ACCORDION_DURATION = 0.6;
const ACCORDION_EASE = "power3.out";
const ACCORDION_WORD_STAGGER = 0.015;
const ACCORDION_DEFAULT_ACTIVE = 1;
const ACCORDION_MOBILE_BREAKPOINT = 1000;

const Accordion = ({ items = ACCORDION_ITEMS }) => {
  const asset = useAsset();
  const accordionRef = useRef(null);
  const accordionPanelsRef = useRef([]);
  const accordionSplitsRef = useRef([]);
  const accordionActiveRef = useRef(ACCORDION_DEFAULT_ACTIVE);
  const accordionStackedRef = useRef(false);

  // apply horizontal flex or stacked mobile layout
  const accordionApplyLayout = useCallback((stacked) => {
    accordionRef.current?.classList.toggle("accordion--stacked", stacked);

    accordionPanelsRef.current.forEach((panel, i) => {
      if (!panel) return;

      if (stacked) {
        gsap.killTweensOf(panel);
        panel.style.flexGrow = "";
        panel.style.flexShrink = "";
        panel.style.flexBasis = "";

        const split = accordionSplitsRef.current[i];
        if (split?.words?.length) {
          gsap.set(split.words, { opacity: 1, y: 0 });
        }
        return;
      }

      const isActive = i === accordionActiveRef.current;
      panel.style.flexGrow = isActive
        ? ACCORDION_EXPANDED
        : ACCORDION_COLLAPSED;
      panel.style.flexShrink = "0";
      panel.style.flexBasis = "0";

      const split = accordionSplitsRef.current[i];
      if (split?.words?.length) {
        gsap.set(split.words, {
          opacity: isActive ? 1 : 0,
          y: isActive ? 0 : 6,
        });
      }
    });
  }, []);

  // expand hovered panel and animate description words
  const accordionSetActive = useCallback((index) => {
    if (accordionStackedRef.current) return;
    if (accordionActiveRef.current === index) return;
    const prevIndex = accordionActiveRef.current;
    accordionActiveRef.current = index;

    accordionPanelsRef.current.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === index;

      gsap.to(panel, {
        flexGrow: isActive ? ACCORDION_EXPANDED : ACCORDION_COLLAPSED,
        duration: ACCORDION_DURATION,
        ease: ACCORDION_EASE,
      });
    });

    const prevSplit = accordionSplitsRef.current[prevIndex];
    if (prevSplit?.words?.length) {
      gsap.to(prevSplit.words, {
        opacity: 0,
        y: 6,
        duration: 0.2,
        ease: "power2.in",
        overwrite: true,
      });
    }

    const activeSplit = accordionSplitsRef.current[index];
    if (activeSplit?.words?.length) {
      gsap.to(activeSplit.words, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: ACCORDION_WORD_STAGGER,
        ease: "power2.out",
        delay: 0.2,
        overwrite: true,
      });
    }
  }, []);

  // split descriptions into words and handle responsive layout
  useEffect(() => {
    accordionSplitsRef.current = accordionPanelsRef.current.map((panel) => {
      if (!panel) return null;
      const desc = panel.querySelector(".accordion-panel-desc");
      if (!desc) return null;
      const split = SplitText.create(desc, { type: "words" });
      gsap.set(split.words, { opacity: 0, y: 6 });
      return split;
    });

    accordionPanelsRef.current.forEach((panel, i) => {
      if (!panel) return;
      const isActive = i === ACCORDION_DEFAULT_ACTIVE;
      panel.style.flexGrow = isActive
        ? ACCORDION_EXPANDED
        : ACCORDION_COLLAPSED;
      panel.style.flexShrink = "0";
      panel.style.flexBasis = "0";
    });

    const handleResize = (initial = false) => {
      const stacked = window.innerWidth < ACCORDION_MOBILE_BREAKPOINT;
      if (!initial && stacked === accordionStackedRef.current) return;
      accordionStackedRef.current = stacked;
      accordionApplyLayout(stacked);
    };

    handleResize(true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      accordionSplitsRef.current.forEach((split) => {
        if (split) split.revert();
      });
    };
  }, [accordionApplyLayout]);

  return (
    <section className="accordion" ref={accordionRef}>
      <div className="accordion-header">
        <p className="mono">Design Pillars</p>
        <h6 className="type-2">Four principles that guide every build</h6>
      </div>

      <div className="accordion-panels">
        <div className="container">
          {items.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (accordionPanelsRef.current[index] = el)}
              className="accordion-panel"
              onMouseEnter={() => accordionSetActive(index)}
            >
              <img
                className="accordion-panel-img"
                src={asset(item.image)}
                alt={item.title}
              />

              <div className="accordion-panel-overlay" />

              <div className="accordion-panel-content">
                <span className="accordion-panel-number mono">{item.id}</span>
                <p className="accordion-panel-title">{item.title}</p>
              </div>

              <div className="accordion-panel-desc-wrap">
                <p className="accordion-panel-desc mono">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Accordion;

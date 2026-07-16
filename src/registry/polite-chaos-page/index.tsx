// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.

"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";

import Button from "./source/Button/Button";
import ClientReviews from "./source/ClientReviews/ClientReviews";
import Copy from "./source/Copy/Copy";
import CTACard from "./source/CTACard/CTACard";
import FeaturedWork from "./source/FeaturedWork/FeaturedWork";
import Footer from "./source/Footer/Footer";
import Menu from "./source/Menu/Menu";
import Preloader, { isInitialLoad } from "./source/Preloader/Preloader";
import Showreel from "./source/Showreel/Showreel";
import Spotlight from "./source/Spotlight/Spotlight";
import { getPoliteChaosPageStyles } from "./styles";

function getScrollParent(node: HTMLElement) {
  let current = node.parentElement;

  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflow + style.overflowY)) return current;
    current = current.parentElement;
  }

  return window;
}

export interface PoliteChaosPageProps {
  className?: string;
  style?: CSSProperties;
}

export default function PoliteChaosPage({
  className = "",
  style,
}: PoliteChaosPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const previousDefaults = ScrollTrigger.defaults();
    const scroller = getScrollParent(root);
    ScrollTrigger.defaults({
      ...previousDefaults,
      scroller: scroller === window ? undefined : scroller,
    });

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(refreshFrame);
      ScrollTrigger.defaults(previousDefaults);
    };
  }, []);

  useEffect(() => {
    const refreshFrame = requestAnimationFrame(() =>
      ScrollTrigger.refresh(true),
    );
    return () => cancelAnimationFrame(refreshFrame);
  }, []);

  const containInternalNavigation = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");
    if (href?.startsWith("/")) event.preventDefault();
  };

  return (
    <div
      ref={pageRef}
      className={["polite-chaos-page", className].filter(Boolean).join(" ")}
      onClickCapture={containInternalNavigation}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: getPoliteChaosPageStyles() }} />
      <Menu pageRef={pageRef} />

      <div className="page">
        <Preloader />

        <section className="hero">
          <div className="container">
            <div className="hero-content-main">
              <div className="hero-header">
                <Copy
                  animateOnScroll={false}
                  delay={isInitialLoad ? 5.75 : 0.75}
                >
                  <h1>Crafting Digital Worlds with a Bit of Mischief</h1>
                </Copy>
              </div>

              <div className="hero-footer-outer">
                <Copy
                  animateOnScroll={false}
                  delay={isInitialLoad ? 6.35 : 1.65}
                >
                  <p className="sm">&copy; BLANK Dept.</p>
                  <p className="sm">( Workroom 101 )</p>
                </Copy>
              </div>

              <div className="hero-footer">
                <Copy
                  animateOnScroll={false}
                  delay={isInitialLoad ? 6.05 : 1.15}
                >
                  <p className="lg">
                    We build visuals, stories, and systems for people who like
                    their creativity a little unpredictable.
                  </p>
                </Copy>

                <Button delay={isInitialLoad ? 6.35 : 1.55} href="/studio">
                  Visit the Studio
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Showreel />

        <section className="featured-work">
          <div className="container">
            <div className="featured-work-header-content">
              <div className="featured-work-header">
                <Copy animateOnScroll delay={0.25}>
                  <h1>Featured Work</h1>
                </Copy>
              </div>
              <DownArrow />
              <div className="featured-work-header-copy">
                <Copy animateOnScroll delay={0.25}>
                  <p className="lg">
                    From motion to concept, pieces born from quiet sketches,
                    late nights, and just the right amount of chaos.
                  </p>
                </Copy>
              </div>
            </div>
            <FeaturedWork />
          </div>
        </section>

        <section className="client-reviews-header-container">
          <div className="container">
            <div className="client-reviews-header-content">
              <div className="client-reviews-header">
                <Copy animateOnScroll delay={0.25}>
                  <h1>People Approved</h1>
                </Copy>
              </div>
              <DownArrow />
              <div className="client-reviews-header-copy">
                <Copy animateOnScroll delay={0.25}>
                  <p className="lg">
                    Unfiltered thoughts from the people who survived our
                    creative process. Or at least that is what they told us.
                  </p>
                </Copy>
              </div>
            </div>
          </div>
        </section>

        <ClientReviews />
        <Spotlight />
        <CTACard />
        <Footer />
      </div>
    </div>
  );
}

function DownArrow() {
  return (
    <div className="arrow">
      <svg viewBox="0 0 32 32" fill="none" className="icon" aria-hidden="true">
        <path
          d="M16 26.6665L16 5.33317"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22.6667 19.9999L16 26.6665L9.33337 19.9998"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

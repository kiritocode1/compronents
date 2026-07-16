// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.

"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties, MouseEvent } from "react";
import { useLayoutEffect, useRef } from "react";

import About from "./source/About/About";
import Copy from "./source/Copy/Copy";
import CTA from "./source/CTA/CTA";
import FeaturedCards from "./source/FeaturedCards/FeaturedCards";
import Footer from "./source/Footer/Footer";
import Menu from "./source/Menu/Menu";
import MusicToggle from "./source/MusicToggle/MusicToggle";
import Preloader, { isInitialLoad } from "./source/Preloader/Preloader";
import Showreel from "./source/Showreel/Showreel";
import { getHouseOfEpochsPageStyles } from "./styles";

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/house-of-epochs-page";

function getScrollParent(node: HTMLElement) {
  let current = node.parentElement;

  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflow + style.overflowY)) return current;
    current = current.parentElement;
  }

  return window;
}

export interface HouseOfEpochsPageProps {
  className?: string;
  style?: CSSProperties;
}

export default function HouseOfEpochsPage({
  className = "",
  style,
}: HouseOfEpochsPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
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

  const containInternalNavigation = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");
    if (href?.startsWith("/")) event.preventDefault();
  };

  const heroDelay = isInitialLoad ? 7 : 0.5;
  const footerDelay = isInitialLoad ? 7.5 : 0.75;

  return (
    <div
      ref={rootRef}
      className={["house-of-epochs-page", className].filter(Boolean).join(" ")}
      onClickCapture={containInternalNavigation}
      style={style}
    >
      <style
        dangerouslySetInnerHTML={{ __html: getHouseOfEpochsPageStyles() }}
      />

      <Menu />
      <MusicToggle />

      <div className="page">
        <Preloader />

        <section className="hero">
          <div className="hero-img">
            <img
              src={`${DEFAULT_ASSET_BASE}/images/img2.jpg`}
              alt="Ancient rock formation"
            />
          </div>

          <div className="container">
            <div className="hero-header">
              <Copy animateOnScroll={false} delay={heroDelay}>
                <h1 className="subheader">House of</h1>
                <h1>Epochs</h1>
              </Copy>
            </div>

            <div className="hero-footer">
              <Copy
                variant="flicker"
                delay={footerDelay}
                animateOnScroll={false}
              >
                <p className="mono sm">Preserving What Remains</p>
              </Copy>
              <Copy
                variant="flicker"
                delay={footerDelay}
                animateOnScroll={false}
              >
                <p className="mono sm">[ Since 1961 ]</p>
              </Copy>
            </div>
          </div>
        </section>

        <About />
        <Showreel />
        <CTA />
        <FeaturedCards />
        <Footer />
      </div>
    </div>
  );
}

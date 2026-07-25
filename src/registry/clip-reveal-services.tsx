"use client";

/**
 * Clip Reveal Services - copy that fills in as you read it, and a three line
 * masthead that assembles then collapses. Each paragraph is duplicated through
 * a pseudo element and the bright copy is clipped from the bottom up on scroll,
 * so the grey text is overwritten line by line rather than faded. The service
 * lines slide in from alternating sides, then the section pins: the outer two
 * close on the middle one, and once stacked all three scale down together to a
 * tenth of their size.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/clip-reveal-services";

export interface ClipRevealServicesProps {
  aboutCopy?: string;
  servicesCopy?: string;
  heroImage?: string;
  outroImage?: string;
  headerImage?: string;
  embedded?: boolean;
}

export default function ClipRevealServices({
  aboutCopy = "A space for work shaped with clarity and intention. Each project follows a simple path from thought to form, from form to function.",
  servicesCopy = "I create websites and digital experiences that value clarity above excess. Through minimal form and precise detail, I aim to build work that lasts and offers a quiet sense of order.",
  heroImage = `${ASSET_BASE}/hero.jpg`,
  outroImage = `${ASSET_BASE}/outro.jpg`,
  headerImage = `${ASSET_BASE}/whatido.svg`,
  embedded = true,
}: ClipRevealServicesProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".wjs-content");
    const services = root.querySelector<HTMLElement>(".wjs-services");
    if (!content || !services) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const triggers: ScrollTrigger[] = [];

    for (const textElement of gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".wjs-animate-text"),
    )) {
      textElement.setAttribute(
        "data-text",
        textElement.textContent?.trim() ?? "",
      );

      triggers.push(
        ScrollTrigger.create({
          trigger: textElement,
          scroller,
          start: "top 50%",
          end: "bottom 50%",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const clipValue = Math.max(0, 100 - self.progress * 100);
            textElement.style.setProperty("--wjs-clip-value", `${clipValue}%`);
          },
        }),
      );
    }

    const headers = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".wjs-services-header"),
    );

    triggers.push(
      ScrollTrigger.create({
        trigger: services,
        scroller,
        start: "top bottom",
        end: "top top",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(headers[0], { x: `${100 - self.progress * 100}%` });
          gsap.set(headers[1], { x: `${-100 + self.progress * 100}%` });
          gsap.set(headers[2], { x: `${100 - self.progress * 100}%` });
        },
      }),
    );

    const viewportHeight = embedded ? root.clientHeight : window.innerHeight;

    triggers.push(
      ScrollTrigger.create({
        trigger: services,
        scroller,
        start: "top top",
        end: `+=${viewportHeight * 2}`,
        pin: true,
        scrub: 1,
        pinSpacing: false,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress <= 0.5) {
            const yProgress = self.progress / 0.5;
            gsap.set(headers[0], { y: `${yProgress * 100}%` });
            gsap.set(headers[2], { y: `${yProgress * -100}%` });
          } else {
            gsap.set(headers[0], { y: "100%" });
            gsap.set(headers[2], { y: "-100%" });

            const scaleProgress = (self.progress - 0.5) / 0.5;
            const minScale = window.innerWidth <= 1000 ? 0.3 : 0.1;
            const scale = 1 - scaleProgress * (1 - minScale);

            for (const header of headers) gsap.set(header, { scale });
          }
        },
      }),
    );

    ScrollTrigger.refresh();

    return () => {
      for (const trigger of triggers) trigger.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded]);

  return (
    <div
      className={embedded ? "wjs-root wjs-embedded" : "wjs-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="wjs-content">
        <section className="wjs-hero">
          <div className="wjs-hero-img">
            <img src={heroImage} alt="" />
          </div>
        </section>

        <section className="wjs-about">
          <h1 className="wjs-animate-text">{aboutCopy}</h1>
        </section>

        <section className="wjs-services">
          <div className="wjs-services-header">
            <img src={headerImage} alt="" />
          </div>
          <div className="wjs-services-header">
            <img src={headerImage} alt="" />
          </div>
          <div className="wjs-services-header">
            <img src={headerImage} alt="" />
          </div>
        </section>

        <section className="wjs-services-copy">
          <h1 className="wjs-animate-text">{servicesCopy}</h1>
        </section>

        <section className="wjs-outro">
          <div className="wjs-outro-img">
            <img src={outroImage} alt="" />
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap");

.wjs-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Manrope", sans-serif;
  background-color: #1a1a1a;
}
.wjs-root.wjs-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.wjs-root.wjs-embedded::-webkit-scrollbar { display: none; }
.wjs-root * { margin: 0; padding: 0; box-sizing: border-box; }
.wjs-content { position: relative; width: 100%; }
.wjs-root img { width: 100%; height: 100%; object-fit: cover; }
.wjs-root h1 {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: -0.15rem;
  line-height: 1.125;
  text-align: center;
}
.wjs-hero,
.wjs-outro,
.wjs-about {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.wjs-hero-img,
.wjs-outro-img {
  width: 300px;
  aspect-ratio: 5/7;
  overflow: hidden;
}
.wjs-services {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.wjs-services-header {
  position: relative;
  width: 100%;
  padding: 0 2rem;
  background-color: #1a1a1a;
  will-change: transform;
}
.wjs-services-header img { object-fit: contain; }
.wjs-services-header:nth-child(1),
.wjs-services-header:nth-child(3) {
  transform: translateX(100%) translateY(0%);
}
.wjs-services-header:nth-child(2) {
  transform: translateX(-100%) translateY(0%);
  z-index: 2;
}
.wjs-services-copy {
  position: relative;
  width: 100%;
  height: 100%;
  margin-top: 155svh;
  padding: 2rem 2rem 25svh 2rem;
  text-align: center;
}
.wjs-animate-text {
  position: relative;
  width: 60%;
  margin: 0 auto;
  color: #4f4f4f;
  --wjs-clip-value: 100%;
}
.wjs-animate-text::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  clip-path: inset(0 0 var(--wjs-clip-value) 0);
  will-change: clip-path;
}

@media (max-width: 1000px) {
  .wjs-root h1 { font-size: 2rem; letter-spacing: -0.05rem; }
  .wjs-animate-text { width: 100%; }
}
`;

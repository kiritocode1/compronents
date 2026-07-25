"use client";

/**
 * Card Parting Reveal - three rows of paired cards that split apart to
 * uncover the message behind them. Each row is pushed a different distance,
 * height, and angle, so the pairs fan away at their own rates rather than
 * sliding as one wall. The centered block behind them pops its badge from
 * zero, rolls three lines up from behind their own masks, and lifts the button
 * in last on a short delay.
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

const ASSET_BASE = "https://ui.aryank.space/assets/card-parting-reveal";

export interface CardPartingRevealProps {
  heroImage?: string;
  badgeImage?: string;
  images?: string[];
  lines?: string[];
  buttonLabel?: string;
  footerLink?: string;
  embedded?: boolean;
}

const DEFAULT_IMAGES = Array.from(
  { length: 6 },
  (_, i) => `${ASSET_BASE}/img-${i + 1}.jpg`,
);

const LEFT_X = [-800, -900, -400];
const RIGHT_X = [800, 900, 400];
const LEFT_ROTATION = [-30, -20, -35];
const RIGHT_ROTATION = [30, 20, 35];
const Y_VALUES = [100, -150, -400];

export default function CardPartingReveal({
  heroImage = `${ASSET_BASE}/pro-logo.png`,
  badgeImage = `${ASSET_BASE}/logo.jpg`,
  images = DEFAULT_IMAGES,
  lines = [
    "Build without the clutter.",
    "One library. Every interface worth shipping.",
    "Take the fast lane to mastery.",
  ],
  buttonLabel = "Get BLANK",
  footerLink = "Link in description",
  embedded = true,
}: CardPartingRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".cpr-content");
    const main = root.querySelector<HTMLElement>(".cpr-main");
    if (!content || !main) return;

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const triggers: ScrollTrigger[] = [];
    const tweens: gsap.core.Tween[] = [];

    const scrollTriggerSettings = {
      trigger: main,
      scroller,
      start: "top 25%",
      toggleActions: "play reverse play reverse",
    };

    gsap.utils
      .toArray<HTMLElement>(root.querySelectorAll(".cpr-row"))
      .forEach((row, index) => {
        const cardLeft = row.querySelector<HTMLElement>(".cpr-card-left");
        const cardRight = row.querySelector<HTMLElement>(".cpr-card-right");
        if (!cardLeft || !cardRight) return;

        triggers.push(
          ScrollTrigger.create({
            trigger: main,
            scroller,
            start: "top center",
            end: "150% bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              cardLeft.style.transform = `translateX(${
                progress * LEFT_X[index]
              }px) translateY(${progress * Y_VALUES[index]}px) rotate(${
                progress * LEFT_ROTATION[index]
              }deg)`;
              cardRight.style.transform = `translateX(${
                progress * RIGHT_X[index]
              }px) translateY(${progress * Y_VALUES[index]}px) rotate(${
                progress * RIGHT_ROTATION[index]
              }deg)`;
            },
          }),
        );
      });

    tweens.push(
      gsap.to(root.querySelector(".cpr-logo"), {
        scale: 1,
        duration: 0.5,
        ease: "power1.out",
        scrollTrigger: scrollTriggerSettings,
      }),
    );

    tweens.push(
      gsap.to(root.querySelectorAll(".cpr-line p"), {
        y: 0,
        duration: 0.5,
        ease: "power1.out",
        stagger: 0.1,
        scrollTrigger: scrollTriggerSettings,
      }),
    );

    tweens.push(
      gsap.to(root.querySelector(".cpr-btn button"), {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power1.out",
        delay: 0.25,
        scrollTrigger: scrollTriggerSettings,
      }),
    );

    ScrollTrigger.refresh();

    return () => {
      for (const trigger of triggers) trigger.kill();
      for (const tween of tweens) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, images]);

  return (
    <div
      className={embedded ? "cpr-root cpr-embedded" : "cpr-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="cpr-content">
        <section className="cpr-hero">
          <div className="cpr-img">
            <img src={heroImage} alt="" />
          </div>
        </section>

        <section className="cpr-main">
          <div className="cpr-main-content">
            <div className="cpr-logo">
              <img src={badgeImage} alt="" />
            </div>
            <div className="cpr-copy">
              {lines.map((line) => (
                <div className="cpr-line" key={line}>
                  <p>{line}</p>
                </div>
              ))}
            </div>
            <div className="cpr-btn">
              <button type="button">{buttonLabel}</button>
            </div>
          </div>

          {[0, 1, 2].map((rowIndex) => (
            <div className="cpr-row" key={`row-${rowIndex}`}>
              <div className="cpr-card cpr-card-left">
                <img src={images[rowIndex * 2]} alt="" />
              </div>
              <div className="cpr-card cpr-card-right">
                <img src={images[rowIndex * 2 + 1]} alt="" />
              </div>
            </div>
          ))}
        </section>

        <section className="cpr-footer">
          <a href="#top">{footerLink}</a>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.cpr-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background-color: #000;
  color: #fff;
  container-type: inline-size;
}
.cpr-root.cpr-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.cpr-root.cpr-embedded::-webkit-scrollbar { display: none; }
.cpr-root * { margin: 0; padding: 0; box-sizing: border-box; }
.cpr-content { position: relative; width: 100%; }
.cpr-root img { width: 100%; height: 100%; object-fit: cover; }
.cpr-root section {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
}
.cpr-hero { height: 100svh; }
.cpr-hero .cpr-img { width: 50%; aspect-ratio: 1; }
.cpr-footer { height: 50svh; align-items: flex-start; }
.cpr-footer a { font-size: 4cqw; color: #fff; text-decoration: none; }
.cpr-main {
  width: 100%;
  height: 150svh;
  flex-direction: column;
}
.cpr-row {
  position: relative;
  width: 100%;
  margin: 1em 0;
  display: flex;
  justify-content: center;
  gap: 2em;
}
.cpr-card {
  position: relative;
  width: 40%;
  height: 360px;
  border-radius: 0.75em;
  overflow: hidden;
  will-change: transform;
}
.cpr-main-content {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cpr-logo {
  width: 150px;
  height: 150px;
  border: 2px solid #fff;
  border-radius: 100%;
  overflow: hidden;
  transform: scale(0);
}
.cpr-copy {
  margin: 2em 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.cpr-line {
  position: relative;
  margin: 0.5em 0;
  width: max-content;
  height: 28px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.cpr-line p {
  position: relative;
  font-size: 24px;
  transform: translateY(30px);
}
.cpr-btn button {
  position: relative;
  padding: 1em 2em;
  font-size: 18px;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 8em;
  background: none;
  outline: none;
  transform: translateY(30px);
  opacity: 0;
  cursor: pointer;
  font-family: inherit;
}

@media (max-width: 900px) {
  .cpr-card { width: 50%; height: 240px; }
}
`;

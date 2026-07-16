"use client";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/circle-preloader-hero";

export interface CirclePreloaderHeroProps {
  itemImages?: string[];
  logoImage?: string;
  heroImage?: string;
  navLinks?: string[];
  heading?: string;
  footer?: [string, string];
}

const DEFAULT_ITEMS = Array.from(
  { length: 4 },
  (_, i) => `${ASSET_BASE}/item${i + 1}.png`,
);

export default function CirclePreloaderHero({
  itemImages = DEFAULT_ITEMS,
  logoImage = `${ASSET_BASE}/logo.png`,
  heroImage = `${ASSET_BASE}/item6.png`,
  navLinks = ["Menu", "Locations", "Our Story", "Reserve", "FAQ", "Order"],
  heading = "The table you will keep coming back to every week",
  footer = ["Locally Sourced", "Always Welcome"],
}: CirclePreloaderHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(SplitText);

    const splits: SplitText[] = [];
    const floatingTweens: gsap.core.Tween[] = [];

    const ctx = gsap.context(() => {
      const navLinksSplit = SplitText.create(
        root.querySelectorAll(".cph-nav-items a"),
        {
          type: "words",
          mask: "words",
          wordsClass: "cph-nav-word",
        },
      );
      const headingSplit = SplitText.create(
        root.querySelector(".cph-hero-header h1"),
        {
          type: "lines, words, chars",
          charsClass: "cph-char",
          wordsClass: "cph-word",
        },
      );
      const footerSplit = SplitText.create(
        root.querySelectorAll(".cph-hero-footer p"),
        {
          type: "lines",
          mask: "lines",
          linesClass: "cph-footer-line",
        },
      );
      splits.push(navLinksSplit, headingSplit, footerSplit);

      gsap.set(".cph-nav-logo img", { scale: 0 });
      gsap.set(navLinksSplit.words, { yPercent: 100 });
      gsap.set(headingSplit.chars, { y: 50, opacity: 0, scale: 0.5 });
      gsap.set(footerSplit.lines, { yPercent: 100 });

      const itemTargets = [
        { x: "-20vw", y: "-30vh", rotation: -20 },
        { x: "25vw", y: "-20vh", rotation: 15 },
        { x: "-32vw", y: "30vh", rotation: 12 },
        { x: "15vw", y: "25vh", rotation: -15 },
      ];
      const itemExits = itemTargets.map((target) => ({
        x: `${Number.parseFloat(target.x) * 3.5}vw`,
        y: `${Number.parseFloat(target.y) * 3.5}vh`,
        rotation: target.rotation * 2.5,
      }));
      const items = gsap.utils.toArray<HTMLElement>(".cph-item");
      const tl = gsap.timeline({ delay: 0.5 });

      tl.to(".cph-preloader-revealer", {
        clipPath: "circle(100% at 50% 50%)",
        duration: 1,
        stagger: 0.25,
        ease: "power2.inOut",
      }).set(".cph-preloader-revealer", { display: "none" });

      items.forEach((item, index) => {
        const target = itemTargets[index];
        const image = item.querySelector("img");
        if (!target || !image) return;
        tl.to(
          item,
          {
            x: target.x,
            y: target.y,
            scale: 1,
            rotation: target.rotation,
            duration: 1,
            ease: "power3.out",
            onStart: () => {
              floatingTweens[index] = gsap.to(image, {
                y: gsap.utils.random(-15, -25),
                duration: gsap.utils.random(1.5, 2.5),
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: gsap.utils.random(0, 0.5),
              });
            },
          },
          index === 0 ? "-=0.55" : "<0.075",
        );
      });

      tl.to(
        ".cph-preloader-logo",
        { scale: 1, opacity: 1, duration: 1, ease: "power3.out" },
        "<",
      )
        .set(".cph-preloader-bg", { display: "none" })
        .to({}, { duration: 1 })
        .call(() => floatingTweens.forEach((tween) => tween.kill()));

      items.forEach((item, index) => {
        const exit = itemExits[index];
        if (!exit) return;
        tl.to(
          item,
          {
            ...exit,
            scale: 2.5,
            duration: 0.75,
            ease: "power2.in",
          },
          index === 0 ? ">" : "<0.075",
        );
      });

      tl.to(
        ".cph-preloader-logo",
        { y: "-120vh", scale: 2.5, duration: 0.75, ease: "power2.in" },
        "<",
      )
        .to(
          ".cph-nav-logo img",
          { scale: 1, duration: 0.75, ease: "power3.out" },
          "-=0.4",
        )
        .to(
          navLinksSplit.words,
          {
            yPercent: 0,
            duration: 0.75,
            stagger: 0.05,
            ease: "power3.out",
          },
          "<0.1",
        )
        .to(
          headingSplit.chars,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.5,
            stagger: 0.015,
            ease: "elastic.out(0.75, 0.25)",
          },
          "<0.15",
        )
        .to(
          footerSplit.lines,
          {
            yPercent: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
          },
          "<0.2",
        )
        .to(
          ".cph-hero-img-bg",
          { scale: 1, duration: 1, ease: "power3.out" },
          "<0.1",
        )
        .to(
          ".cph-hero-img img",
          { y: "-50%", duration: 1, ease: "power3.out" },
          "<0.3",
        )
        .set(".cph-preloader", { display: "none" });
    }, root);

    return () => {
      floatingTweens.forEach((tween) => tween.kill());
      ctx.revert();
      splits.forEach((split) => split.revert());
    };
  }, []);

  return (
    <div className="cph-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="cph-preloader">
        <div className="cph-preloader-bg" />
        {[1, 2, 3, 4].map((number) => (
          <div
            className={`cph-preloader-revealer cph-preloader-revealer-${number}`}
            key={number}
          />
        ))}
        <div className="cph-items">
          {itemImages.slice(0, 4).map((image, index) => (
            <div className={`cph-item cph-item-${index + 1}`} key={image}>
              <img alt="" draggable={false} src={image} />
            </div>
          ))}
        </div>
        <div className="cph-preloader-logo">
          <img alt="" draggable={false} src={logoImage} />
        </div>
      </div>

      <nav className="cph-nav">
        <div className="cph-nav-logo">
          <img alt="" draggable={false} src={logoImage} />
        </div>
        <div className="cph-nav-items">
          {navLinks.map((link) => (
            <a href={`#${link.toLowerCase().replaceAll(" ", "-")}`} key={link}>
              {link}
            </a>
          ))}
        </div>
      </nav>

      <section className="cph-hero">
        <div className="cph-hero-header">
          <h1>{heading}</h1>
        </div>
        <div className="cph-hero-img">
          <div className="cph-hero-img-bg" />
          <img alt="" draggable={false} src={heroImage} />
        </div>
        <div className="cph-hero-footer">
          <p>{footer[0]}</p>
          <p>{footer[1]}</p>
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@100..900&family=Instrument+Sans:wght@400..700&display=swap");

.cph-root {
  --cph-100: #f5e1bf;
  --cph-200: #c49241;
  --cph-300: #f75828;
  --cph-400: #e01b22;
  --cph-500: #17100a;
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: var(--cph-500);
}

.cph-root *,
.cph-root *::before,
.cph-root *::after { box-sizing: border-box; }
.cph-root h1,
.cph-root a,
.cph-root p { margin: 0; color: var(--cph-100); text-transform: uppercase; line-height: 0.85; }
.cph-root h1 { font-family: "Barlow Condensed", sans-serif; font-size: clamp(3rem, 6vw, 9rem); font-weight: 800; }
.cph-root a { font-family: "Barlow Condensed", sans-serif; font-size: 1.5rem; font-weight: 600; text-decoration: none; }
.cph-root p { font-family: "Instrument Sans", sans-serif; font-weight: 500; }

.cph-preloader { position: absolute; inset: 0; z-index: 2; width: 100%; height: 100svh; overflow: hidden; }
.cph-preloader-bg,
.cph-preloader-revealer { position: absolute; width: 100%; height: 100svh; transform-origin: center; }
.cph-preloader-bg { background: var(--cph-500); }
.cph-preloader-revealer { clip-path: circle(0% at 50% 50%); will-change: clip-path; }
.cph-preloader-revealer-1 { background: var(--cph-200); }
.cph-preloader-revealer-2 { background: var(--cph-300); }
.cph-preloader-revealer-3 { background: var(--cph-400); }
.cph-preloader-revealer-4 { background: var(--cph-500); }
.cph-items { position: absolute; width: 100%; height: 100svh; }
.cph-item { position: absolute; top: 50%; left: 50%; width: 15vw; aspect-ratio: 1; transform: translate(-50%, -50%) scale(0); will-change: transform; }
.cph-item img { display: block; width: 100%; height: 100%; object-fit: cover; }
.cph-preloader-logo { position: absolute; top: 50%; left: 50%; width: 10vw; transform: translate(-50%, -50%) scale(0.5); opacity: 0; will-change: transform, opacity; }
.cph-preloader-logo img { width: 100%; height: auto; }

.cph-nav { position: absolute; inset: 0 0 auto; z-index: 1; display: flex; width: 100%; align-items: flex-start; justify-content: space-between; padding: 2rem; }
.cph-nav-logo img { width: 5rem; transform-origin: top left; }
.cph-nav-items { display: flex; gap: 2rem; }
.cph-hero { position: relative; z-index: 0; width: 100%; height: 100svh; overflow: hidden; background: var(--cph-500); }
.cph-hero-header { position: absolute; top: 30%; left: 50%; width: 55%; transform: translate(-50%, -50%); text-align: center; }
.cph-hero-footer { position: absolute; bottom: 0; left: 0; z-index: 0; display: flex; width: 100%; align-items: flex-end; justify-content: space-between; padding: 2rem; }
.cph-hero-img { position: absolute; bottom: -15%; left: 50%; display: flex; width: 35%; min-width: 250px; aspect-ratio: 1; transform: translateX(-50%); align-items: center; justify-content: center; }
.cph-hero-img-bg { width: 100%; aspect-ratio: 1; transform: scale(0); transform-origin: center; border-radius: 100%; background: var(--cph-300); }
.cph-hero-img img { position: absolute; top: 50%; left: 50%; width: 130%; transform: translate(-50%, 50%) rotate(15deg); transform-origin: center; }
.cph-nav-word,
.cph-footer-line,
.cph-char,
.cph-word { display: inline-block; will-change: transform; }

@media (max-width: 1000px) {
  .cph-nav-items { flex-direction: column; gap: 0; text-align: right; }
  .cph-hero-header { width: calc(100% - 4rem); }
  .cph-hero-img { bottom: -5%; width: 80%; }
}
`;

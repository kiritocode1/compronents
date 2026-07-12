"use client";

/**
 * Landing Image Reveal - a load intro where a progress bar wipes away, five
 * scattered images slide in and line up across the frame, then the outer pairs
 * fly off-screen while the center image scales up to fill the hero. The nav,
 * headline, and contact lines reveal in masked lines on top. GSAP timeline with
 * SplitText, no scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/landing-image-reveal";

export interface LandingImageRevealProps {
  images?: [string, string, string, string, string];
  logo?: string;
  navItems?: string[];
  heading?: string;
  email?: string;
}

export default function LandingImageReveal({
  images = [
    `${ASSET_BASE}/img-1.jpg`,
    `${ASSET_BASE}/img-2.jpg`,
    `${ASSET_BASE}/img-3.jpg`,
    `${ASSET_BASE}/img-4.jpg`,
    `${ASSET_BASE}/img-5.jpg`,
  ],
  logo = "Foundry & Form",
  navItems = ["Work", "Catalogue", "About"],
  heading = "We design objects that carry the weight of their own conviction, where every curve and joint exists not for beauty but because the material demanded it.",
  email = "info@foundryandform.com",
}: LandingImageRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(CustomEase, SplitText);
    CustomEase.create("lir-hop", "0.9, 0, 0.1, 1");
    CustomEase.create("lir-glide", "0.8, 0, 0.2, 1");

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const introImages = gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll(".lir-intro-img"),
        );
        const vw = root.clientWidth;
        const scale = 0.2;
        const gap = 40;
        const rotations = [-15, 5, -7.5, 10, -2.5];
        const scaledWidth = vw * scale;
        const rowWidth = scaledWidth * 5 + gap * 4;
        const centeredX = (vw - rowWidth) / 2;
        const offScreenX = centeredX - vw * 1.3;

        introImages.forEach((img, i) => {
          const cx =
            centeredX + i * (scaledWidth + gap) + scaledWidth / 2 - vw / 2;
          const ox =
            offScreenX + i * (scaledWidth + gap) + scaledWidth / 2 - vw / 2;
          gsap.set(img, {
            scale,
            x: ox,
            rotation: rotations[i],
            borderRadius: "2.5rem",
          });
          img.dataset.cx = String(cx);
        });

        SplitText.create(
          ".lir-nav a, .lir-hero-header h1, .lir-hero-social p, .lir-hero-social a",
          {
            type: "lines",
            linesClass: "lir-line",
            mask: "lines",
            autoSplit: true,
          },
        );
        gsap.set(".lir-line", { y: "125%" });

        const tl = gsap.timeline({ delay: 0.75 });
        tl.to(".lir-preloader", {
          scaleX: 1,
          duration: 1.5,
          ease: "lir-glide",
          onComplete: () =>
            gsap.set(".lir-preloader", { transformOrigin: "right" }),
        });
        tl.to(".lir-preloader", { scaleX: 0, duration: 1.25, ease: "lir-hop" });
        tl.to(
          ".lir-preloader-overlay",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            ease: "lir-hop",
          },
          "<0.75",
        );
        introImages.forEach((img) => {
          tl.to(
            img,
            {
              x: parseFloat(img.dataset.cx || "0"),
              duration: 1.5,
              ease: "lir-glide",
            },
            "<0.025",
          );
        });
        tl.to(
          ".lir-intro-img:nth-child(1), .lir-intro-img:nth-child(2)",
          { x: -vw, duration: 1.5, ease: "lir-glide" },
          "spread",
        );
        tl.to(
          ".lir-intro-img:nth-child(4), .lir-intro-img:nth-child(5)",
          { x: vw, duration: 1.5, ease: "lir-glide" },
          "spread",
        );
        tl.to(
          ".lir-hero-img",
          {
            scale: 1,
            x: 0,
            rotation: 0,
            borderRadius: 0,
            duration: 1.5,
            ease: "lir-glide",
          },
          "<",
        );
        tl.to(
          ".lir-nav .lir-line",
          { y: "0%", duration: 1, stagger: 0.1, ease: "power3.out" },
          "<1",
        );
        tl.to(
          ".lir-hero-header .lir-line",
          { y: "0%", duration: 1, stagger: 0.1, ease: "power3.out" },
          "<",
        );
        tl.to(
          ".lir-hero-social .lir-line",
          { y: "0%", duration: 1, stagger: 0.1, ease: "power3.out" },
          "<0.25",
        );
      }, root);
    };

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(build);
    } else {
      build();
    }

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [images]);

  return (
    <div className="lir-root" ref={rootRef}>
      <style>{styles}</style>
      <div className="lir-preloader-overlay">
        <div className="lir-preloader" />
      </div>
      <nav className="lir-nav">
        <div className="lir-nav-logo">
          <a href="#a">
            {logo}
            <br />
            Industrial Design Consultancy
          </a>
        </div>
        <div className="lir-nav-items">
          {navItems.map((item) => (
            <a href="#a" key={item}>
              {item}
            </a>
          ))}
        </div>
      </nav>
      <section className="lir-hero">
        {images.map((src, i) => (
          <div
            className={i === 2 ? "lir-intro-img lir-hero-img" : "lir-intro-img"}
            key={src + i}
          >
            <img src={src} alt="" />
          </div>
        ))}
        <div className="lir-hero-content">
          <div className="lir-hero-header">
            <h1>{heading}</h1>
          </div>
          <div className="lir-hero-social">
            <p>Say Hello</p>
            <a href={`mailto:${email}`}>{email}</a>
            <a href="#a">View Enquiries</a>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap");

.lir-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background-color: #0f0f0f;
  font-family: "DM Sans", sans-serif;
}
.lir-root * { margin: 0; padding: 0; box-sizing: border-box; }
.lir-root h1 {
  color: #fff;
  font-size: clamp(1.75rem, 3vw, 3rem);
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.1;
}
.lir-root a,
.lir-root p {
  color: #fff;
  text-decoration: none;
  font-weight: 400;
  letter-spacing: -0.01em;
  display: block;
}
.lir-root img { width: 100%; height: 100%; object-fit: cover; }

.lir-nav {
  position: absolute;
  top: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 3;
}
.lir-nav-items { display: flex; gap: 4rem; }

.lir-preloader-overlay {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #0f0f0f;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  z-index: 10;
}
.lir-preloader-overlay .lir-preloader {
  position: absolute;
  top: 0;
  width: 100%;
  height: 0.5rem;
  background-color: #fff;
  transform: scaleX(0);
  transform-origin: left;
  will-change: transform;
}

.lir-hero { position: relative; width: 100%; height: 100%; min-height: 100svh; overflow: hidden; }
.lir-intro-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
  transform-origin: center center;
  will-change: transform;
}
.lir-hero-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  padding: 15svh 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 2;
}
.lir-hero-header { width: 60%; }
.lir-line { position: relative; will-change: transform; }

@media (max-width: 1000px) {
  .lir-nav-items { flex-direction: column; align-items: flex-end; gap: 0; }
  .lir-hero-content { padding: 15svh 2rem 2rem 2rem; }
  .lir-hero-header { width: 100%; }
}
`;

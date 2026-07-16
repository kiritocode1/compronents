// @ts-nocheck
// biome-ignore-all lint: source-authored vanilla page port.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import type { CSSProperties, MouseEvent } from "react";
import { useLayoutEffect, useRef } from "react";

import { getOrbitMatterFragment } from "./fragment";
import { getOrbitMatterPageStyles } from "./styles";

gsap.registerPlugin(ScrollTrigger, SplitText);

const GRID_SIZE = 60;

function getScrollParent(node: HTMLElement) {
  let current = node.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflow + style.overflowY)) return current;
    current = current.parentElement;
  }
  return window;
}

export interface OrbitMatterPageProps {
  className?: string;
  style?: CSSProperties;
}

export default function OrbitMatterPage({
  className = "",
  style,
}: OrbitMatterPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scroller = getScrollParent(root);
    const previousDefaults = ScrollTrigger.defaults();
    let lenis: Lenis;

    if (scroller instanceof HTMLElement) {
      lenis = new Lenis({
        wrapper: scroller,
        content: root,
        duration: window.innerWidth <= 1000 ? 0.8 : 1.2,
        lerp: window.innerWidth <= 1000 ? 0.075 : 0.1,
        smoothWheel: true,
        syncTouch: true,
      });
      ScrollTrigger.defaults({ ...previousDefaults, scroller });
    } else {
      lenis = new Lenis({
        duration: window.innerWidth <= 1000 ? 0.8 : 1.2,
        lerp: window.innerWidth <= 1000 ? 0.075 : 0.1,
        smoothWheel: true,
        syncTouch: true,
      });
      ScrollTrigger.defaults({ ...previousDefaults, scroller: undefined });
    }

    lenis.on("scroll", ScrollTrigger.update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const cleanups: Array<() => void> = [];
    const splits: SplitText[] = [];
    const q = <T extends Element>(selector: string) =>
      root.querySelector<T>(selector);
    const qa = <T extends Element>(selector: string) =>
      Array.from(root.querySelectorAll<T>(selector));
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const context = gsap.context(() => {
      initNavigation();
      initInteractiveGrid();
      initPreloader();

      if (!reducedMotion) {
        initAnimatedCopy();
        initHeroTimer();
        initIntroCopy();
        initMissionPin();
        initCta();
      } else {
        q(".preloader-overlay")?.remove();
      }
    }, root);

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    function initNavigation() {
      const nav = q("nav");
      const header = q(".nav-mobile-header");
      if (!nav || !header) return;

      const toggle = (event: Event) => {
        if (window.innerWidth <= 1000) {
          event.stopPropagation();
          nav.classList.toggle("nav-open");
        }
      };
      const close = () => nav.classList.remove("nav-open");
      const resize = () => window.innerWidth > 1000 && close();

      header.addEventListener("click", toggle);
      qa(".nav-item a").forEach((link) =>
        link.addEventListener("click", close),
      );
      window.addEventListener("resize", resize);
      cleanups.push(() => {
        header.removeEventListener("click", toggle);
        qa(".nav-item a").forEach((link) =>
          link.removeEventListener("click", close),
        );
        window.removeEventListener("resize", resize);
      });
    }

    function initInteractiveGrid() {
      const container = q<HTMLElement>(".interactive-grid");
      if (!container) return;

      type Block = {
        element: HTMLElement;
        x: number;
        y: number;
        end: number;
      };
      let blocks: Block[] = [];
      let raf = 0;

      const reset = () => {
        container.replaceChildren();
        blocks = [];
        const columns = Math.ceil(window.innerWidth / GRID_SIZE);
        const rows = Math.ceil(window.innerHeight / GRID_SIZE);
        const offsetX = (window.innerWidth - columns * GRID_SIZE) / 2;
        const offsetY = (window.innerHeight - rows * GRID_SIZE) / 2;

        for (let row = 0; row < rows; row++) {
          for (let column = 0; column < columns; column++) {
            const left = column * GRID_SIZE + offsetX;
            const top = row * GRID_SIZE + offsetY;
            const element = document.createElement("div");
            element.className = "block";
            Object.assign(element.style, {
              width: `${GRID_SIZE}px`,
              height: `${GRID_SIZE}px`,
              left: `${left}px`,
              top: `${top}px`,
            });
            container.appendChild(element);
            blocks.push({
              element,
              x: left + GRID_SIZE / 2,
              y: top + GRID_SIZE / 2,
              end: 0,
            });
          }
        }
      };

      const move = (event: PointerEvent) => {
        let closest: Block | undefined;
        let distance = GRID_SIZE * 2;
        for (const block of blocks) {
          const next = Math.hypot(
            event.clientX - block.x,
            event.clientY - block.y,
          );
          if (next < distance) {
            distance = next;
            closest = block;
          }
        }
        if (closest) {
          closest.element.classList.add("highlight");
          closest.end = performance.now() + 300;
        }
      };

      const tick = (now: number) => {
        blocks.forEach((block) => {
          if (block.end && now > block.end) {
            block.element.classList.remove("highlight");
            block.end = 0;
          }
        });
        raf = requestAnimationFrame(tick);
      };

      reset();
      raf = requestAnimationFrame(tick);
      window.addEventListener("resize", reset);
      window.addEventListener("pointermove", move);
      cleanups.push(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", reset);
        window.removeEventListener("pointermove", move);
      });
    }

    function initPreloader() {
      const overlay = q<HTMLElement>(".preloader-overlay");
      const grid = q<HTMLElement>(".preloader-grid");
      const ringFrame = q<HTMLElement>(".preloader-ring-frame");
      const discFrame = q<HTMLElement>(".preloader-disc-frame");
      if (!overlay || !grid || !ringFrame || !discFrame) return;

      const seen =
        sessionStorage.getItem("orbitMatterPreloaderSeen") === "true";
      if (seen) {
        overlay.remove();
        return;
      }

      lenis.stop();
      const columns = Math.ceil(window.innerWidth / GRID_SIZE);
      const rows = Math.ceil(window.innerHeight / GRID_SIZE) + 1;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const block = document.createElement("div");
          block.className = "preloader-block";
          Object.assign(block.style, {
            width: `${GRID_SIZE}px`,
            height: `${GRID_SIZE}px`,
            left: `${column * GRID_SIZE}px`,
            top: `${row * GRID_SIZE}px`,
          });
          grid.appendChild(block);
        }
      }

      for (let index = 1; index < 4; index++) {
        const ring = document.createElement("span");
        const disc = document.createElement("span");
        ring.className = "preloader-ring";
        disc.className = "preloader-disc";
        ring.style.width = ring.style.height = `${200 + index * 10}px`;
        disc.style.animationDelay = `${index - 0.8}s`;
        ringFrame.appendChild(ring);
        discFrame.appendChild(disc);
      }

      const blocks = qa(".preloader-block");
      gsap
        .timeline({
          delay: 1.75,
          onComplete: () => {
            sessionStorage.setItem("orbitMatterPreloaderSeen", "true");
            overlay.remove();
            lenis.start();
          },
        })
        .to(".preloader-animation-wrapper", { opacity: 0, duration: 0.3 })
        .to(blocks, {
          opacity: 0,
          duration: 0.05,
          stagger: { amount: 0.5, from: "random" },
        });
    }

    function initAnimatedCopy() {
      const hero = q(".hero-content");
      const preloaderVisible = Boolean(q(".preloader-overlay"));

      qa<HTMLElement>("[data-animate-variant]").forEach((element) => {
        const variant = element.dataset.animateVariant;
        const onScroll = element.dataset.animateOnScroll === "true";
        let delay = Number.parseFloat(element.dataset.animateDelay || "0");
        if (preloaderVisible && hero?.contains(element)) delay += 2;

        if (variant === "slide") {
          const split = SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: "line",
          });
          splits.push(split);
          gsap.fromTo(
            split.lines,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: 0.75,
              ease: "power3.out",
              delay,
              stagger: Number.parseFloat(
                element.dataset.animateStagger || "0.1",
              ),
              scrollTrigger: onScroll
                ? { trigger: element, start: "top 70%", once: true }
                : undefined,
            },
          );
        } else if (variant === "flicker") {
          const split = SplitText.create(element, { type: "chars" });
          splits.push(split);
          gsap.fromTo(
            split.chars,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.05,
              delay,
              stagger: { amount: 0.5, from: "random" },
              scrollTrigger: onScroll
                ? { trigger: element, start: "top 85%", once: true }
                : undefined,
            },
          );
        }
      });
    }

    function initHeroTimer() {
      const timer = q<HTMLElement>(".hero-timer p");
      if (!timer) return;
      const update = () => {
        const time = new Date().toLocaleTimeString("en-US", {
          timeZone: "America/Toronto",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        });
        const sector = Math.floor(Number.parseInt(time) / 4) + 1;
        timer.textContent = `Zone ${String(sector).padStart(2, "0")} __ ${time}`;
      };
      update();
      const interval = window.setInterval(update, 60_000);
      cleanups.push(() => clearInterval(interval));
    }

    function initIntroCopy() {
      const copy = q<HTMLElement>(".intro-copy h3");
      if (!copy) return;
      const split = SplitText.create(copy, {
        type: "chars",
        charsClass: "char",
      });
      splits.push(split);
      ScrollTrigger.create({
        trigger: copy,
        start: "top 75%",
        end: "bottom 30%",
        onUpdate: ({ progress }) => {
          const colored = Math.floor(progress * split.chars.length);
          split.chars.forEach((char, index) => {
            char.style.color =
              index < colored ? "var(--base-100)" : "var(--base-300)";
          });
        },
      });
    }

    function initMissionPin() {
      const header = q(".featured-missions-header");
      const missions = q(".featured-missions");
      if (!header || !missions) return;
      ScrollTrigger.create({
        trigger: header,
        start: "top top",
        endTrigger: missions,
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
      });
    }

    function initCta() {
      const cta = q(".cta");
      if (!cta) return;
      const leftX = [-800, -900, -400];
      const rightX = [800, 900, 400];
      const leftRotation = [-30, -20, -35];
      const rightRotation = [30, 20, 35];
      const y = [100, -150, -400];

      qa<HTMLElement>(".cta-row").forEach((row, index) => {
        const left = row.querySelector<HTMLElement>(".cta-card-left");
        const right = row.querySelector<HTMLElement>(".cta-card-right");
        if (!left || !right) return;
        ScrollTrigger.create({
          trigger: cta,
          start: "top center",
          end: "150% bottom",
          scrub: true,
          onUpdate: ({ progress }) => {
            left.style.transform = `translate(${progress * leftX[index]}px, ${progress * y[index]}px) rotate(${progress * leftRotation[index]}deg)`;
            right.style.transform = `translate(${progress * rightX[index]}px, ${progress * y[index]}px) rotate(${progress * rightRotation[index]}deg)`;
          },
        });
      });

      gsap.to(".cta-logo", {
        scale: 1,
        duration: 0.5,
        scrollTrigger: { trigger: cta, start: "top 25%" },
      });
      gsap.fromTo(
        ".cta .btn a.btn",
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          delay: 0.3,
          scrollTrigger: { trigger: cta, start: "top 25%" },
        },
      );
    }

    return () => {
      cancelAnimationFrame(refreshFrame);
      cleanups.forEach((cleanup) => cleanup());
      splits.forEach((split) => split.revert());
      context.revert();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      ScrollTrigger.defaults(previousDefaults);
    };
  }, []);

  const containInternalNavigation = (event: MouseEvent<HTMLDivElement>) => {
    const href = (event.target as HTMLElement)
      .closest("a")
      ?.getAttribute("href");
    if (href?.startsWith("/")) event.preventDefault();
  };

  return (
    <div
      ref={rootRef}
      className={["orbit-matter-page", className].filter(Boolean).join(" ")}
      onClickCapture={containInternalNavigation}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: getOrbitMatterPageStyles() }} />
      <div dangerouslySetInnerHTML={{ __html: getOrbitMatterFragment() }} />
    </div>
  );
}

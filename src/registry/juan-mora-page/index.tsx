"use client";

/**
 * Juan Mora Page - a faithful port of a Webflow-built design-director portfolio
 * home page. The markup and the full Webflow stylesheet are carried over 1:1;
 * everything that Webflow's own IX2/IX3 runtime used to drive (scroll scrubs,
 * hover timelines, the intro loader, Lottie playback) is reimplemented on gsap
 * ScrollTrigger + SplitText, so no jQuery or webflow.js ships with the page.
 *
 * ScrollTrigger binds to the preview's own scroll container rather than the
 * window, and every selector query is scoped to the component root so two
 * mounted copies never animate each other.
 *
 * BLANK - aryank.space
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { AnimationItem } from "lottie-web";
import { type CSSProperties, type RefObject, useEffect, useRef } from "react";

import { getJuanMoraPageStyles } from "./styles";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export const DEFAULT_ASSET_BASE =
  "https://ui.aryank.space/assets/juan-mora-page";

const asset = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}/${path}`;

/** Webflow responsive images ship a 500w derivative next to the full-size file. */
const srcSet500 = (base: string, file: string, full: number) => {
  const [name, ext] = file.split(/\.(?=[^.]+$)/);
  return `${asset(base, `images/${name}-p-500.${ext}`)} 500w, ${asset(base, `images/${file}`)} ${full}w`;
};

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  let current = node?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflow + style.overflowY)) return current;
    current = current.parentElement;
  }
  return window;
}

/** Webflow's `data-animation-type="lottie"` div, driven by lottie-web directly. */
function Lottie({
  src,
  className,
  autoplay = false,
  animRef,
  playWhenReady,
}: {
  src: string;
  className: string;
  autoplay?: boolean;
  animRef?: RefObject<AnimationItem | null>;
  /** Set by a timeline that may fire before this player finished loading. */
  playWhenReady?: RefObject<boolean>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef(autoplay);
  autoplayRef.current = autoplay;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let anim: AnimationItem | undefined;
    let cancelled = false;

    import("lottie-web/build/player/lottie_light").then((mod) => {
      if (cancelled || !hostRef.current) return;
      anim = mod.default.loadAnimation({
        container: hostRef.current,
        renderer: "svg",
        loop: false,
        autoplay: autoplayRef.current,
        path: src,
        rendererSettings: { progressiveLoad: true },
      });
      if (animRef) animRef.current = anim;
      // The intro timeline can reach this animation's cue before the player has
      // loaded, in which case its play() call was a no-op; honour it here.
      if (playWhenReady?.current) anim.play();
    });

    return () => {
      cancelled = true;
      anim?.destroy();
      if (animRef) animRef.current = null;
    };
  }, [src, animRef, playWhenReady]);

  return <div ref={hostRef} className={className} />;
}

interface ServiceImage {
  kind: "img";
  file: string;
  hide?: boolean;
}
interface ServiceVideo {
  kind: "video";
  file: string;
}
type ServiceMedia = ServiceImage | ServiceVideo;

interface Service {
  title: string;
  copy: string;
  media: ServiceMedia[];
}

const SERVICES: Service[] = [
  {
    title: "Websites & Landing pages",
    copy: "Creating high-end and beautiful websites built to perform and convert.",
    media: [
      { kind: "img", file: "home-work1.jpg" },
      { kind: "video", file: "home-ampli.mp4" },
      { kind: "img", file: "home-work2.jpg" },
      { kind: "video", file: "home-shopping.mp4" },
      { kind: "img", file: "home-work3.jpg", hide: true },
    ],
  },
  {
    title: "Visual Branding",
    copy: "Helping brands find a distinctive visual language that truly stands out.",
    media: [
      { kind: "video", file: "home-ampli-brand.mp4" },
      { kind: "img", file: "home-work7.jpg" },
      { kind: "video", file: "home-brudget1.mp4" },
      { kind: "img", file: "home-work8.jpg" },
      { kind: "img", file: "home-work9.jpg", hide: true },
    ],
  },
  {
    title: "Product Design Enhancement",
    copy: "Bringing fresh ideas to turn complex products into intuitive experiences with an elevated visual layer. ",
    media: [
      { kind: "img", file: "home-work4.jpg", hide: true },
      { kind: "video", file: "home-alena.mp4" },
      { kind: "img", file: "home-work5.jpg" },
      { kind: "img", file: "home-work6.jpg" },
      { kind: "video", file: "home-apechain.mp4" },
    ],
  },
];

const BENEFITS = [
  "I bring a premium and unique visual direction that makes your brand stand out.",
  "I care about the craft, from concept to final product.",
  "I define scalable design systems that keep your brand consistent.",
  "I align your goals with my experience to make the right design decisions for your brand.",
];

const FOOTER_STACK = ["Figma", "Webflow", "GSAP", "AE/Lottie", "Lennis Scroll"];

const FOOTER_CONTACT = [
  { label: "Email", href: "mailto:hello@aryank.space?subject=Hey%20Juan!" },
  { label: "Linkedin", href: "https://www.linkedin.com/in/kiritocode1/" },
  { label: "X", href: "https://x.com/blank_spacets" },
  { label: "Behance", href: "https://github.com/kiritocode1" },
];

const NAV_SOCIALS = [
  {
    label: "Email",
    href: "mailto:hello@aryank.space?subject=Hey%20Juan%20Mora!",
  },
  { label: "in", href: "https://www.linkedin.com/in/kiritocode1/" },
  { label: "x", href: "https://x.com/blank_spacets" },
  { label: "Be", href: "https://github.com/kiritocode1" },
];

export interface JuanMoraPageProps {
  /** Base URL the images, Lottie JSON, fonts and videos are served from. */
  assetBase?: string;
  className?: string;
  style?: CSSProperties;
}

export default function JuanMoraPage({
  assetBase = DEFAULT_ASSET_BASE,
  className,
  style,
}: JuanMoraPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const navIconRef = useRef<AnimationItem | null>(null);
  const mobileIconRef = useRef<AnimationItem | null>(null);
  const nameMouseRef = useRef<AnimationItem | null>(null);
  const nameMouseCued = useRef(false);
  const scrollLottieRef = useRef<AnimationItem | null>(null);
  const scrollLottieCued = useRef(false);

  const img = (file: string) => asset(assetBase, `images/${file}`);
  const doc = (file: string) => asset(assetBase, `documents/${file}`);
  const video = (file: string) => asset(assetBase, `videos-work/home/${file}`);
  const poster = asset(assetBase, "videos-work/juan-video-loading.jpg");

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      // Bind every trigger below to the preview's own scroll container. This has
      // to happen here rather than in a child component: React attaches host refs
      // in the same bottom-up pass that runs layout effects, so a child would see
      // rootRef.current === null and silently fall back to the window.
      const scroller = getScrollParent(root);
      ScrollTrigger.defaults({ scroller });

      const all = <T extends HTMLElement = HTMLElement>(sel: string) =>
        Array.from(root.querySelectorAll<T>(sel));
      const one = <T extends HTMLElement = HTMLElement>(sel: string) =>
        root.querySelector<T>(sel);

      const splits: SplitText[] = [];
      const split = (
        target: Element | Element[] | null,
        type: "chars" | "words" | "lines",
      ) => {
        if (!target || (Array.isArray(target) && !target.length)) return [];
        const s = new SplitText(target as Element, { type });
        splits.push(s);
        return type === "chars"
          ? s.chars
          : type === "words"
            ? s.words
            : s.lines;
      };

      // Every scroll interaction in the source sets Webflow's `clamp: true`, which
      // pins the start to scroll 0 so a trigger already on screen at the top of the
      // page begins at progress 0 instead of jumping in mid-timeline. gsap spells
      // that `clamp(...)`; without it the hero starts half-scrubbed.
      const scrollTl = (
        trigger: Element | null,
        start: string,
        end: string,
        scrub: number | boolean = 0.8,
      ) =>
        trigger
          ? gsap.timeline({
              scrollTrigger: {
                trigger,
                start: `clamp(${start})`,
                end: `clamp(${end})`,
                scrub,
              },
            })
          : gsap.timeline({ paused: true });

      // Desktop-only interactions, matching Webflow's `dont-animate` breakpoints.
      const isWide = () => window.innerWidth > 767;

      /* ---------- page load: intro loader, hero reveal ---------- */
      gsap
        .timeline()
        .to(".grow-line", { width: "100%", duration: 0.6 }, 0)
        .to(
          ".orange-intro",
          { backgroundColor: "#ffbc95", duration: 0.54, ease: "power1.in" },
          0.45,
        )
        .to(
          ".container-loader",
          { height: "0vh", duration: 0.6, ease: "power3.out" },
          1.2,
        )
        .fromTo(
          ".img-hero-wrapper",
          { opacity: 0.5, height: "120%" },
          { opacity: 1, height: "100%", duration: 1.14, ease: "power3.out" },
          1.2,
        )
        .fromTo(
          split(one(".conter-content-hero"), "words"),
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: { amount: 0.3 },
          },
          1.54,
        )
        .add(() => {
          nameMouseCued.current = true;
          nameMouseRef.current?.play();
        }, 1.54);

      /* ---------- hero: parallax fade on scroll ---------- */
      scrollTl(one(".wrapper-hero"), "top bottom", "bottom top").fromTo(
        ".img-hero-wrapper",
        { opacity: 1, yPercent: 0 },
        { opacity: 0.6, yPercent: 30, ease: "none" },
        0,
      );

      /* ---------- "16 years making users click and scroll" ---------- */
      scrollTl(one(".wrapper-cont-50"), "top 80%", "top 40%").fromTo(
        ".click-scroll-text",
        { color: "#ffbc95" },
        { color: "#96908c", ease: "power1.out" },
        0,
      );

      // floating shapes drifting past the headline
      const shapeDrift: Array<[string, gsap.TweenVars, gsap.TweenVars]> = [
        [
          ".square-scroll",
          { rotation: 70, y: "10vw" },
          { rotation: 0, y: "-20vw" },
        ],
        [
          ".pill-scroll",
          { y: "-5vw", rotation: 30 },
          { y: "20vw", rotation: 0 },
        ],
        [
          ".blue-hex",
          { y: "0vw", rotation: -160 },
          { y: "-10vw", rotation: 60 },
        ],
        [
          ".blue-pill",
          { y: "0vw", rotation: -160 },
          { y: "-10vw", rotation: 60 },
        ],
        [
          ".blue-circle",
          { y: "0vw", rotation: -160 },
          { y: "-10vw", rotation: 60 },
        ],
        [
          ".circle-left-scroll",
          { y: "0vw", rotation: -160 },
          { y: "0vw", rotation: 60 },
        ],
        [
          ".circle-center-scroll",
          { y: "0vw", rotation: -160 },
          { y: "0vw", rotation: 60 },
        ],
        [
          ".circle-plus-scroll",
          { y: "10vw", rotation: 0 },
          { y: "-10vw", rotation: 80 },
        ],
        [".hex-scroll", { y: "0vw", rotation: 0 }, { y: "0vw", rotation: 60 }],
      ];
      const shapesTl = scrollTl(
        one(".click-scroll-height"),
        "top bottom",
        "bottom top",
      );
      for (const [sel, from, to] of shapeDrift) {
        shapesTl.fromTo(
          sel.trim(),
          from,
          { ...to, duration: 1, ease: "power1.out" },
          0,
        );
      }
      shapesTl.add(() => {
        scrollLottieCued.current = true;
        scrollLottieRef.current?.play();
      }, 0.3);

      /* ---------- services ---------- */
      scrollTl(one(".service-headline"), "top 95%", "top 45%").fromTo(
        split(one(".service-headline"), "words"),
        { opacity: 0.7, color: "#ffbc95" },
        {
          opacity: 1,
          color: "#96908c",
          duration: 2,
          ease: "expo.in",
          stagger: { each: 1, from: "start" },
        },
        0,
      );

      for (const headline of all(".service-h2")) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: headline,
              start: "clamp(top 80%)",
              end: "clamp(top 50%)",
              scrub: 0.8,
            },
          })
          .fromTo(
            split(headline, "words"),
            { opacity: 0.3, scale: 0.99, color: "#ffbc95" },
            {
              opacity: 1,
              scale: 1,
              color: "#96908c",
              ease: "power2.out",
              stagger: { each: 0.2, from: "start" },
            },
            0,
          );
      }

      // each media column rises and unfolds as it enters
      for (const grid of all(".cont-imgs-service")) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: grid,
              start: "clamp(top bottom)",
              end: "clamp(top center)",
              scrub: 0.8,
            },
          })
          .fromTo(
            grid.querySelectorAll(".mask-img-service"),
            { y: "8vw", rotationX: 110, scale: 1.1 },
            {
              y: "0vw",
              rotationX: 0,
              scale: 1,
              duration: 2.5,
              ease: "power1.out",
              stagger: { amount: 0.7, from: "edges", grid: "auto" },
            },
            0,
          );
      }

      // the copy column drifts slower than its media
      for (const col of all(".cont-text-service")) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: col,
              start: "clamp(top bottom)",
              end: "clamp(bottom top)",
              scrub: 0.8,
            },
          })
          .fromTo(col, { y: "0vw" }, { y: "7vw", ease: "none" }, 0);
      }

      scrollTl(
        one(".cont-title-service.webflow"),
        "top bottom",
        "bottom top",
      ).fromTo(
        [".webflow-frame", ".framer-frame"],
        { y: "15%" },
        { y: "-5%", ease: "none" },
        0,
      );

      /* ---------- work CTA ---------- */
      scrollTl(one(".work-cta-wrapper"), "top bottom", "bottom top").fromTo(
        ".work-cta-content-wrapper",
        { y: "5vw" },
        { y: "-5vw", ease: "none" },
        0,
      );

      scrollTl(one(".work-cta-content-wrapper"), "top 80%", "top 40%").fromTo(
        split(one(".work-cta-content-wrapper .body-copy"), "words"),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.1,
          ease: "power1.out",
          stagger: { each: 0.1 },
        },
        0,
      );

      /* ---------- benefits: the two pinned-feel steps ---------- */
      if (isWide()) {
        const step1 = scrollTl(
          one(".benefits-main-wrapper"),
          "top 71%",
          "top -40%",
          0.76,
        );
        step1
          .fromTo(
            ".text-wrapper-align-benefit:not(._2)",
            { x: "18%" },
            { x: "-22%", duration: 9.97, ease: "none" },
            0,
          )
          .fromTo(
            ".text-wrapper-align-benefit._2",
            { x: "-33%" },
            { x: "0%", duration: 9.97, ease: "none" },
            0,
          )
          .fromTo(
            ".line.step1",
            { width: "0%" },
            { width: "100%", duration: 5.43, ease: "power2.out" },
            6.57,
          )
          .fromTo(
            split(one(".h2-headline-step1-3"), "words"),
            { opacity: 0 },
            {
              opacity: 1,
              duration: 1.05,
              ease: "none",
              stagger: { each: 0.8 },
            },
            8.81,
          );

        // step 1 headline hands off to the light portrait
        scrollTl(
          one(".benefits-height-1step"),
          "top bottom",
          "bottom bottom",
          0.76,
        )
          .fromTo(
            split(
              [
                one(".text-wrapper-align-benefit._2"),
                one(".text-wrapper-align-benefit:not(._2)"),
                one(".h2-headline-step1-3"),
              ].filter(Boolean) as Element[],
              "words",
            ),
            { opacity: 1 },
            {
              opacity: 0,
              duration: 0.2,
              ease: "power1.out",
              stagger: { amount: 0.8, from: "start" },
            },
            0,
          )
          .fromTo(
            ".line.step1",
            { opacity: 1 },
            { opacity: 0, duration: 0.2, ease: "power1.out" },
            0,
          )
          .fromTo(
            ".light-jm-img",
            { opacity: 0 },
            { opacity: 1, duration: 0.83, ease: "power1.out" },
            0.17,
          );

        scrollTl(one(".benefits-height-2step"), "top 125%", "bottom 110%")
          .fromTo(
            split(
              [one(".step2-headline-wrapper"), one(".list-benefits")].filter(
                Boolean,
              ) as Element[],
              "words",
            ),
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.2,
              ease: "none",
              stagger: { each: 0.2 },
            },
            0,
          )
          .fromTo(
            ".line-step2",
            { width: "0%" },
            { width: "100%", duration: 2.26, ease: "power2.out" },
            1.99,
          )
          .fromTo(
            ".line-benefit",
            { width: "0%" },
            {
              width: "100%",
              duration: 1.19,
              ease: "none",
              stagger: { each: 0.6 },
            },
            3,
          )
          .fromTo(
            [".check-icon", ".cont-cta-benefitc"],
            { opacity: 0, y: -5 },
            {
              opacity: 1,
              y: 0,
              duration: 1.18,
              ease: "power1.out",
              stagger: { each: 1.5 },
            },
            3,
          );
      }

      // portraits drift against the section
      scrollTl(one(".benefits-main-wrapper"), "top bottom", "top top").fromTo(
        [".jm-siluete-img", ".dark-jm-img"],
        { y: "-3vw" },
        { y: "0vw", ease: "none" },
        0,
      );
      scrollTl(one(".main-cta-wrapper"), "top bottom", "top top").to(
        ".light-jm-img",
        { y: "10vw", ease: "none" },
        0,
      );

      /* ---------- closing CTA + footer ---------- */
      scrollTl(one(".content-cta-wrapper"), "top bottom", "top 40%")
        .fromTo(
          split(all(".heading-cta"), "words"),
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.15,
            ease: "power2.out",
            stagger: { each: 0.1 },
          },
          0,
        )
        .fromTo(
          split(one(".body-copy-cta"), "words"),
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.15,
            ease: "power2.out",
            stagger: { each: 0.1 },
          },
          0.04,
        );

      scrollTl(one(".main-cta-wrapper"), "bottom 105%", "bottom top").fromTo(
        ".section.footer",
        { y: "-20vw" },
        { y: "0vw", duration: 1, ease: "none" },
        0,
      );

      scrollTl(one(".main-cta-wrapper"), "bottom center", "bottom top").fromTo(
        split(all(".name-footer"), "words"),
        { y: "10vw" },
        {
          y: "0vw",
          duration: 2,
          ease: "power1.out",
          stagger: { amount: 0.2 },
        },
        0,
      );

      /* ---------- hover: nav links + wordmark ---------- */
      const linkHover = (link: HTMLElement, targets: Element[]) => {
        const chars = split(targets, "chars");
        if (!chars.length) return;
        const tl = gsap
          .timeline({ paused: true })
          .to(chars, {
            opacity: 0,
            y: -2,
            duration: 0.2,
            ease: "power3.out",
            stagger: { each: 0.1 },
          })
          .to(
            chars,
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              ease: "power3.out",
              stagger: { each: 0.1 },
            },
            0.2,
          );
        link.addEventListener("mouseenter", () => tl.restart());
      };

      for (const link of all(".nav-link, .nav-social-link")) {
        linkHover(link, [link]);
      }

      const navName = one(".nav-name");
      if (navName) {
        const chars = split(
          Array.from(navName.querySelectorAll(".nav-name-jm")),
          "chars",
        );
        const dot = navName.querySelector(".dot-jm");
        const tl = gsap.timeline({ paused: true });
        if (chars.length)
          tl.to(chars, {
            y: -2,
            duration: 0.2,
            ease: "power3.out",
            stagger: { each: 0.1 },
          }).to(
            chars,
            { y: 0, duration: 0.2, ease: "power3.out", stagger: { each: 0.1 } },
            0.2,
          );
        if (dot)
          tl.to(dot, { y: -10, scale: 1.2, ease: "power3.out" }, 0).to(
            dot,
            { y: 0, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.3)" },
            0.5,
          );
        navName.addEventListener("mouseenter", () => tl.restart());
        navName.addEventListener("mouseenter", () => {
          navIconRef.current?.playSegments(
            [
              (navIconRef.current.totalFrames ?? 0) * 0.23,
              navIconRef.current.totalFrames ?? 0,
            ],
            true,
          );
          mobileIconRef.current?.playSegments(
            [
              (mobileIconRef.current.totalFrames ?? 0) * 0.15,
              mobileIconRef.current.totalFrames ?? 0,
            ],
            true,
          );
        });
      }

      /* ---------- hover: "click" pill ---------- */
      const clickBtn = one(".cont-click");
      if (clickBtn && isWide()) {
        const clickChars = split(one(".click"), "chars");
        const hoverDot = one(".cont-hover-click");
        const tl = gsap.timeline({ paused: true });
        if (clickChars.length)
          tl.to(
            clickChars,
            {
              y: "-9vw",
              ease: "power2.inOut",
              stagger: { amount: 0.2, from: "end" },
            },
            0,
          );
        if (hoverDot)
          tl.to(
            hoverDot,
            { y: "-9vw", scale: 1.6, duration: 0.4, ease: "expo.out" },
            0.25,
          );
        clickBtn.addEventListener("mouseenter", () => tl.play());
        clickBtn.addEventListener("mouseleave", () => tl.reverse());
      }

      /* ---------- hover: work folder ---------- */
      const folder = one(".folder-wrapper");
      if (folder) {
        const workChars = split(one(".work-big-text"), "chars");
        const cursorIcon = one(".cursor-jm-icon");
        const tl = gsap
          .timeline({ paused: true })
          .to(
            ".front-folder",
            { rotationX: -35, duration: 0.68, ease: "elastic.out(0.7, 0.3)" },
            0,
          )
          .to(
            ".projects-folder",
            { y: "2.4vw", scaleY: 1.8, duration: 0.23, ease: "power3.out" },
            0,
          );
        if (workChars.length)
          tl.fromTo(
            workChars,
            { opacity: 0.3 },
            {
              opacity: 0.6,
              duration: 0.2,
              ease: "power1.out",
              stagger: { each: 0.1, from: "start" },
            },
            0.11,
          );
        if (cursorIcon)
          tl.fromTo(
            cursorIcon,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 },
            0,
          );
        folder.addEventListener("mouseenter", () => tl.play());
        folder.addEventListener("mouseleave", () => tl.reverse());
      }

      /* ---------- hover: email CTA reveal ---------- */
      const ctaWrapper = one(".cta-button-wrapper");
      if (ctaWrapper) {
        const emailChars = split(
          ctaWrapper.querySelector(".email-cta"),
          "chars",
        );
        const fill = ctaWrapper.querySelector(".hover-main-cta");
        const tl = gsap.timeline({ paused: true });
        if (fill)
          tl.fromTo(
            fill,
            { height: "0%" },
            { height: "100%", duration: 0.6, ease: "power2.out" },
            0,
          );
        if (emailChars.length)
          tl.fromTo(
            emailChars,
            { opacity: 0 },
            { opacity: 1, duration: 0.05, stagger: { each: 0.03 } },
            0.08,
          );
        ctaWrapper.addEventListener("mouseenter", () => tl.play());
        ctaWrapper.addEventListener("mouseleave", () => tl.reverse());
      }

      /* ---------- "learn more" button arrow swap ---------- */
      for (const link of all(".main-cont-button")) {
        const firstIcon = link.querySelector(".icon-wrapper-cta-first");
        const lastIcon = link.querySelector(".icon-wrapper-cta");
        link.addEventListener("mouseenter", () => {
          gsap.to(firstIcon, {
            width: "2.8rem",
            rotation: 0,
            opacity: 1,
            duration: 0.8,
            ease: "elastic.out(0.5, 0.3)",
            overwrite: true,
          });
          gsap.to(lastIcon, {
            width: "0rem",
            rotation: -90,
            opacity: 0,
            duration: 0.2,
            ease: "power2.out",
            overwrite: true,
          });
        });
        link.addEventListener("mouseleave", () => {
          gsap.to(firstIcon, {
            width: "0rem",
            rotation: -90,
            opacity: 0,
            duration: 0.3,
            ease: "power2.inOut",
            overwrite: true,
          });
          gsap.to(lastIcon, {
            width: "2.8rem",
            rotation: 0,
            opacity: 1,
            duration: 0.8,
            ease: "elastic.out(0.6, 0.3)",
            overwrite: true,
          });
        });
      }

      /* ---------- trailing cursor ---------- */
      const cursor = one(".cursor-jm");
      const cursorText = one(".text-jm-cursor");
      let onMove: ((e: MouseEvent) => void) | undefined;
      let tick: (() => void) | undefined;
      if (cursor) {
        const mouse = { x: 0, y: 0 };
        const pos = { x: 0, y: 0 };
        onMove = (e: MouseEvent) => {
          const rect = root.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
        };
        root.addEventListener("mousemove", onMove);
        tick = () => {
          const dt = 1 - 0.91 ** gsap.ticker.deltaRatio();
          pos.x += (mouse.x - pos.x) * dt;
          pos.y += (mouse.y - pos.y) * dt;
          gsap.set(cursor, { x: pos.x, y: pos.y });
        };
        gsap.ticker.add(tick);

        if (cursorText && ctaWrapper) {
          cursorText.innerText = "Copy my Email";
          ctaWrapper.addEventListener("mouseenter", () => {
            cursorText.innerText = "Copy my Email";
            gsap.to(cursorText, { opacity: 1, duration: 0.5, overwrite: true });
          });
          ctaWrapper.addEventListener("mouseleave", () =>
            gsap.to(cursorText, { opacity: 0, duration: 0.3, overwrite: true }),
          );
          ctaWrapper.addEventListener("click", (event) => {
            event.preventDefault();
            navigator.clipboard
              ?.writeText("hello@aryank.space")
              .then(() => {
                cursorText.innerText = "Great! Email copied";
                const s = new SplitText(cursorText, { type: "chars" });
                gsap.from(s.chars, {
                  opacity: 0,
                  stagger: 0.05,
                  duration: 0.05,
                  ease: "back.out(1.7)",
                  overwrite: true,
                });
              })
              .catch(() => {});
          });
        }
      }

      // "Who is a little curious?" label on the click pill
      const curious = one(".click-hover-huh");
      if (curious && clickBtn) {
        curious.innerText = "Who is a little curious?";
        clickBtn.addEventListener("mouseenter", () => {
          curious.innerText = "Who is a little curious?";
          gsap.fromTo(
            curious,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, delay: 0.3, overwrite: true },
          );
        });
        clickBtn.addEventListener("mouseleave", () =>
          gsap.to(curious, { opacity: 0, duration: 0.3, overwrite: true }),
        );
        clickBtn.addEventListener("click", () => {
          curious.innerText = "Another click!";
          const s = new SplitText(curious, { type: "chars" });
          splits.push(s);
          gsap.from(s.chars, {
            opacity: 0,
            stagger: 0.05,
            duration: 0.05,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      }

      /* ---------- nav colour theme per section ---------- */
      const navEls = all(
        ".nav-name-jm, .nav-link-mobile, .nav-link, .nav-social-link",
      );
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const peach = entry.target.getAttribute("data-nav") === "peach";
            for (const el of navEls) el.classList.toggle("is-peach", peach);
          }
        },
        {
          root: root.parentElement,
          rootMargin: "-50px 0px -90% 0px",
          threshold: 0,
        },
      );
      for (const section of all("[data-nav]")) observer.observe(section);

      // Fonts, Lottie SVGs and the responsive imagery all settle after mount and
      // shift every trigger's start/end, so measure once the page has quiesced.
      ScrollTrigger.refresh();
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);
      const refreshTimer = window.setTimeout(onLoad, 600);

      return () => {
        if (onMove) root.removeEventListener("mousemove", onMove);
        if (tick) gsap.ticker.remove(tick);
        window.removeEventListener("load", onLoad);
        window.clearTimeout(refreshTimer);
        observer.disconnect();
        ScrollTrigger.defaults({ scroller: undefined });
        for (const s of splits) s.revert();
      };
    },
    { scope: rootRef, dependencies: [assetBase] },
  );

  return (
    <div
      ref={rootRef}
      className={`juan-mora-page${className ? ` ${className}` : ""}`}
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped Webflow stylesheet
        dangerouslySetInnerHTML={{ __html: getJuanMoraPageStyles(assetBase) }}
      />

      <ul className="nav-menu-mobile w-list-unstyled">
        <li>
          <a href="#about" className="nav-link-mobile">
            About
          </a>
        </li>
        <li>
          <a href="#top" className="w-inline-block w--current">
            <Lottie
              className="jm-icon"
              src={doc("icon-jm.json")}
              autoplay
              animRef={mobileIconRef}
            />
          </a>
        </li>
        <li>
          <a href="#work" className="nav-link-mobile">
            Work
          </a>
        </li>
      </ul>

      <div className="container-2">
        <div className="cont-name-logo">
          <a href="#top" className="nav-name w-inline-block w--current">
            <div className="nav-name-jm">Juan</div>
            <div className="dot-jm" />
            <div className="nav-name-jm">Mora</div>
          </a>
        </div>
        <ul className="nav-menu w-list-unstyled">
          <li className="cont-social-link">
            <a href="#about" className="nav-link">
              About
            </a>
          </li>
          <li>
            <a href="#top" className="w-inline-block w--current">
              <Lottie
                className="jm-icon"
                src={doc("icon-jm.json")}
                autoplay
                animRef={navIconRef}
              />
            </a>
          </li>
          <li className="cont-social-link">
            <a href="#work" className="nav-link">
              Work
            </a>
          </li>
        </ul>
        <ol className="nav-social-wrapper w-list-unstyled">
          {NAV_SOCIALS.map((social) => (
            <li className="cont-social-link" key={social.label}>
              <a
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  social.href.startsWith("http")
                    ? "noreferrer noopener"
                    : undefined
                }
                className="nav-social-link"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ol>
      </div>

      <main className="main" id="top">
        <div className="container-loader">
          <div className="orange-intro">
            <div className="cont-juan-intro">
              <div className="nav-name-jm intro">Juan</div>
              <div className="dot-jm intro" />
              <div className="nav-name-jm intro">Mora</div>
            </div>
          </div>
          <div className="grow-line" />
        </div>

        <div className="cursor-jm">
          <div className="cursor-jm-icon">
            <img
              src={img("arrow-grey.svg")}
              loading="lazy"
              alt=""
              className="icon-cursor"
            />
          </div>
          <div className="text-jm-cursor">copy</div>
        </div>

        <div className="top-glow">
          <div className="blur" />
        </div>

        <div data-nav="peach" className="wrapper-hero">
          <div className="img-hero-wrapper">
            <div className="black-overlay-top" />
            <div className="black-overlay" />
          </div>
          <div className="w-layout-blockcontainer wrapper-hero-home w-container">
            <div className="conter-content-hero">
              <div className="hero-top">
                <h1 className="heading">
                  Brand &amp; Web <br />
                  Design Specialist
                </h1>
              </div>
              <div className="hero-bottom">
                <Lottie
                  className="name-mouse-lottie"
                  src={doc("juan-name-mouse.json")}
                  animRef={nameMouseRef}
                  playWhenReady={nameMouseCued}
                />
                <p className="heading right">Freelance Design Director </p>
              </div>
            </div>
          </div>
        </div>

        <section data-nav="grey" className="section">
          <div className="click-scroll-height">
            <div className="wrapper-cont-50">
              <h1 className="click-scroll-text">
                16 years making users click and{" "}
                <span className="text-span">scroll</span> my designs
              </h1>
              <div className="cont-click">
                <div className="cont-hover-click" />
                <div className="click-hover-huh">
                  test
                  <br />
                </div>
                <div className="click">click</div>
              </div>
              <div className="scroll">scroll</div>
            </div>
            <div className="wrapper-icons">
              <Lottie
                className="ll-scroll"
                src={doc("ll-scroll.json")}
                animRef={scrollLottieRef}
                playWhenReady={scrollLottieCued}
              />
              <img
                src={img("big-pill-scroll1.png")}
                loading="lazy"
                sizes="(max-width: 729px) 100vw, 729px"
                alt=""
                srcSet={srcSet500(assetBase, "big-pill-scroll1.png", 729)}
                className="pill-scroll"
              />
              <img
                src={img("big-circle-scroll1.png")}
                loading="lazy"
                sizes="(max-width: 661px) 100vw, 661px"
                alt=""
                srcSet={srcSet500(assetBase, "big-circle-scroll1.png", 661)}
                className="circle-left-scroll"
              />
              <img
                src={img("big-hexagon-scroll1.png")}
                loading="lazy"
                sizes="(max-width: 563px) 100vw, 563px"
                srcSet={srcSet500(assetBase, "big-hexagon-scroll1.png", 563)}
                alt=""
                className="hex-scroll"
              />
              <img
                src={img("big-circle-scroll2.png")}
                loading="lazy"
                sizes="(max-width: 980px) 100vw, 980px"
                alt=""
                srcSet={`${asset(assetBase, "images/big-circle-scroll2-p-500.png")} 500w, ${asset(assetBase, "images/big-circle-scroll2-p-800.png")} 800w, ${asset(assetBase, "images/big-circle-scroll2.png")} 980w`}
                className="circle-center-scroll"
              />
              <img
                src={img("big-circle-scroll3.png")}
                loading="lazy"
                sizes="(max-width: 532px) 100vw, 532px"
                alt=""
                srcSet={srcSet500(assetBase, "big-circle-scroll3.png", 532)}
                className="circle-plus-scroll"
              />
              <img
                src={img("big-square-scroll1.png")}
                loading="lazy"
                sizes="(max-width: 607px) 100vw, 607px"
                alt=""
                srcSet={srcSet500(assetBase, "big-square-scroll1.png", 607)}
                className="square-scroll"
              />
              <img
                src={img("blue-circle-scroll.svg")}
                loading="lazy"
                alt=""
                className="blue-circle"
              />
              <img
                src={img("blue-pill-scroll.svg")}
                loading="lazy"
                alt=""
                className="blue-pill"
              />
              <img
                src={img("blue-hexagon-scroll.svg")}
                loading="lazy"
                alt=""
                className="blue-hex"
              />
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="service-headline-wrapper">
            <div className="tag-text">Design Expert</div>
            <h1 className="service-headline">
              I help companies to succeed on projects like:
            </h1>
          </div>
          <ul className="main-wrapper-services w-list-unstyled">
            {SERVICES.map((service) => (
              <li className="service-wrapper" key={service.title}>
                <div className="cont-text-service">
                  <div className="cont-title-service">
                    <div className="dot-project test" />
                    <h2 className="service-h2">{service.title}</h2>
                  </div>
                  <p className="body-copy home-work">{service.copy}</p>
                </div>
                <div className="cont-imgs-service">
                  {service.media.map((media) =>
                    media.kind === "img" ? (
                      <div
                        className={`mask-img-service${media.hide ? " hide" : ""}`}
                        key={media.file}
                      >
                        <img
                          src={img(media.file)}
                          loading="lazy"
                          sizes="100vw"
                          srcSet={srcSet500(assetBase, media.file, 800)}
                          alt=""
                          className="img-service"
                        />
                      </div>
                    ) : (
                      <div className="mask-img-service" key={media.file}>
                        <div className="video-cont-p2 home">
                          <div className="code-video w-embed">
                            <video
                              autoPlay
                              loop
                              muted
                              playsInline
                              width="100%"
                              height="auto"
                              preload="metadata"
                              poster={poster}
                            >
                              <source
                                src={video(media.file)}
                                type="video/mp4"
                              />
                            </video>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </li>
            ))}
            <li className="service-wrapper webflow">
              <div className="cont-text-service webflow">
                <div className="cont-title-service webflow">
                  <h2 className="service-h2 webflow">Webflow &amp; Framer</h2>
                  <img
                    src={img("webflow-frame.svg")}
                    loading="lazy"
                    alt=""
                    className="webflow-frame"
                  />
                  <img
                    src={img("framer-frame.svg")}
                    loading="lazy"
                    alt=""
                    className="framer-frame"
                  />
                </div>
                <p className="body-copy home-work webflow">
                  Building elegant and responsive projects featuring creative
                  micro-interactions and seamless CMS hand-off.
                </p>
              </div>
              <div className="cont-imgs-service webflow">
                <div className="mask-img-service webflow">
                  <img
                    src={img("webflow-tag-juan-mora.svg")}
                    loading="lazy"
                    alt=""
                    className="tag-webflow"
                  />
                </div>
                <div className="mask-img-service framer">
                  <img
                    src={img("framer-tag-juan-mora.svg")}
                    loading="lazy"
                    alt=""
                    className="tag-framer"
                  />
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section data-nav="grey" className="section" id="work">
          <div className="work-cta-wrapper">
            <div className="work-cta-content-wrapper">
              <div className="body-copy">Curious?... Check out my</div>
              <a href="#work" className="folder-wrapper w-inline-block">
                <img
                  src={img("folder-icon-front.png")}
                  loading="lazy"
                  sizes="100vw"
                  alt=""
                  srcSet={srcSet500(assetBase, "folder-icon-front.png", 782)}
                  className="front-folder"
                />
                <img
                  src={img("projects-folder.png")}
                  loading="lazy"
                  sizes="100vw"
                  alt=""
                  srcSet={srcSet500(assetBase, "projects-folder.png", 741)}
                  className="projects-folder"
                />
                <img
                  src={img("folder-icon-back.png")}
                  loading="lazy"
                  sizes="100vw"
                  srcSet={srcSet500(assetBase, "folder-icon-back.png", 782)}
                  alt=""
                  className="back-folder"
                />
              </a>
              <div className="body-copy">Or keep scrolling</div>
            </div>
            <div className="work-big-text">
              W<span className="text-span-2">o</span>rk
            </div>
          </div>
        </section>

        <section data-nav="peach" className="section" id="about">
          <div className="ticker-main-wrapper" />
          <div className="benefits-main-wrapper">
            <div className="bg-benefits-wrapper">
              <div className="main-cont-step1">
                <div className="text-wrapper-align-benefit">
                  <h2 className="h2-headline-step1-1">Good design</h2>
                </div>
                <div className="text-wrapper-align-benefit _2">
                  <h2 className="h2-headline-step1-2">takes time</h2>
                </div>
                <img
                  src={img("home-about-jm-2.png")}
                  loading="lazy"
                  sizes="100vw"
                  srcSet={`${asset(assetBase, "images/home-about-jm-2-p-500.png")} 500w, ${asset(assetBase, "images/home-about-jm-2-p-800.png")} 800w, ${asset(assetBase, "images/home-about-jm-2-p-1080.png")} 1080w, ${asset(assetBase, "images/home-about-jm-2-p-1600.png")} 1600w, ${asset(assetBase, "images/home-about-jm-2-p-2000.png")} 2000w, ${asset(assetBase, "images/home-about-jm-2.png")} 2530w`}
                  alt=""
                  className="jm-siluete-img"
                />
                <div className="line step1" />
                <h2 className="h2-headline-step1-3">
                  and working with me saves it
                </h2>
              </div>
              <div className="main-cont-step2">
                <div className="step2-headline-wrapper">
                  <h2 className="h2-benefit-1">
                    Companies partner with me because of my
                  </h2>
                  <h2 className="h2-benefit-2">
                    perspective + sharp instincts
                  </h2>
                </div>
                <div className="line-step2" />
                <ul className="list-benefits w-list-unstyled">
                  {BENEFITS.map((benefit) => (
                    <li className="item-benefits-cont" key={benefit}>
                      <div className="text-benefit-cont">
                        <img
                          src={img("check-mark-icon.svg")}
                          loading="lazy"
                          alt=""
                          className="check-icon"
                        />
                        <h3 className="he-bulltet">{benefit}</h3>
                      </div>
                      <div className="line-benefit" />
                    </li>
                  ))}
                </ul>
                <div className="cont-cta-benefitc">
                  <a href="#about" className="main-cont-button w-inline-block">
                    <div className="icon-wrapper-cta-first">
                      <img
                        loading="lazy"
                        src={img("arrow-grey.svg")}
                        alt=""
                        className="arrow-cion"
                      />
                    </div>
                    <div className="text-wrapper-cta">
                      Learn more about me
                      <br />
                    </div>
                    <div className="icon-wrapper-cta">
                      <img
                        loading="lazy"
                        src={img("arrow-grey.svg")}
                        alt=""
                        className="arrow-cion"
                      />
                    </div>
                  </a>
                </div>
              </div>
              <img
                src={img("home-about-jm-1.jpg")}
                loading="lazy"
                sizes="100vw"
                srcSet={`${asset(assetBase, "images/home-about-jm-1-p-500.jpg")} 500w, ${asset(assetBase, "images/home-about-jm-1-p-800.jpg")} 800w, ${asset(assetBase, "images/home-about-jm-1-p-1080.jpg")} 1080w, ${asset(assetBase, "images/home-about-jm-1-p-1600.jpg")} 1600w, ${asset(assetBase, "images/home-about-jm-1-p-2000.jpg")} 2000w, ${asset(assetBase, "images/home-about-jm-1-p-2600.jpg")} 2600w, ${asset(assetBase, "images/home-about-jm-1.jpg")} 3000w`}
                alt=""
                className="dark-jm-img"
              />
              <img
                src={img("home-about-jm-3.jpg")}
                loading="lazy"
                sizes="100vw"
                alt=""
                srcSet={`${asset(assetBase, "images/home-about-jm-3-p-500.jpg")} 500w, ${asset(assetBase, "images/home-about-jm-3-p-800.jpg")} 800w, ${asset(assetBase, "images/home-about-jm-3-p-1080.jpg")} 1080w, ${asset(assetBase, "images/home-about-jm-3-p-1600.jpg")} 1600w, ${asset(assetBase, "images/home-about-jm-3-p-2000.jpg")} 2000w, ${asset(assetBase, "images/home-about-jm-3-p-2600.jpg")} 2600w, ${asset(assetBase, "images/home-about-jm-3.jpg")} 3000w`}
                className="light-jm-img"
              />
            </div>
            <div className="benefits-height-1step" />
            <div className="benefits-height-2step" />
          </div>
        </section>

        <section data-nav="grey" className="section">
          <div className="main-cta-wrapper">
            <div className="content-cta-wrapper">
              <div className="cta-text-wrapper">
                <h2 className="heading-cta main">
                  Let’s build something people remember
                </h2>
                <p className="body-copy-cta">
                  from global tech companies to growing startups.
                </p>
              </div>
              <a href="#top" className="cta-button-wrapper w-inline-block">
                <div className="cont-icon-cta">
                  <img
                    src={img("arrow-grey.svg")}
                    loading="lazy"
                    alt=""
                    className="arrow-cta"
                  />
                </div>
                <h2 className="heading-cta">Let&#39;s talk</h2>
                <h2 className="email-cta">hello@aryank.space</h2>
                <div className="hover-main-cta" />
              </a>
            </div>
          </div>
        </section>

        <section data-nav="peach" className="section footer">
          <div className="main-wrapper-footer">
            <div className="wrapper-content-footer _1">
              <div className="wrapper-column">
                <h3 className="body-footer fade">Website made using:</h3>
                <ul className="list-footer w-list-unstyled">
                  {FOOTER_STACK.map((item) => (
                    <li className="wrapper-item-column" key={item}>
                      <h4 className="body-footer right">{item}</h4>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="wrapper-column right">
                <h3 className="body-footer fade">Contact:</h3>
                <ul className="list-footer w-list-unstyled">
                  {FOOTER_CONTACT.map((item) => (
                    <li className="wrapper-item-column" key={item.label}>
                      <a
                        href={item.href}
                        target={
                          item.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          item.href.startsWith("http")
                            ? "noreferrer noopener"
                            : undefined
                        }
                        className="footer-social-link"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="wrapper-content-footer _2">
              <h2 className="name-footer">Juan</h2>
              <img
                src={img("juan-mora-logo-footer.svg")}
                loading="lazy"
                alt=""
                className="image-4"
              />
              <h2 className="name-footer right">Mora</h2>
            </div>
            <div className="wrapper-content-footer">
              <h3 className="body-footer big">
                Freelance Design Director{" "}
                <span className="text-span-4">2026</span>
              </h3>
              <h3 className="body-footer big">
                Morable Design Studio{" "}
                <span className="text-span-3">[Coming Soon]</span>
              </h3>
            </div>
          </div>
          <div className="video-cont-footer footer">
            <div className="video-embed w-embed">
              <video
                className="video-embed"
                muted
                autoPlay
                loop
                playsInline
                poster={poster}
              >
                <source
                  src={asset(assetBase, "videos-work/desk_jm3.mp4")}
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

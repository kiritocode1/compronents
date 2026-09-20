import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, CustomEase);

/**
 * The reference's motion, ported one interaction at a time.
 *
 * Every duration, delay, offset, and easing below was read out of the live
 * page's interaction data rather than eyeballed, so the numbers are the
 * reference's own. Where a name appears in a comment (a-45, a-46, …) it is the
 * identifier that interaction carries in the source.
 *
 * Two easing curves need translating. The source's "ease" is the CSS keyword,
 * which is cubic-bezier(.25,.1,.25,1) — GSAP has no built-in equivalent, hence
 * the CustomEase. Its "outQuart" and "outCubic" map onto GSAP's power3.out and
 * power2.out, since GSAP counts powers from quad.
 */
const EASE = CustomEase.create("wfEase", "M0,0 C0.25,0.1 0.25,1 1,1");
const OUT_QUART = "power3.out";
const OUT_CUBIC = "power2.out";

/**
 * Elements that rise 50px and fade in when scrolled to (a-45).
 *
 * The number is the trigger offset: the element must be that percentage of a
 * viewport height inside the fold before it plays. Selectors mirror the ones
 * the reference binds to, so the two lists can be diffed by eye.
 */
const REVEALS: [selector: string, offsetPercent: number][] = [
  [".section-badge-wrap", 0],
  [".section-heading-wrap", 0],
  [".section-header-right", 0],
  [".section-button-right", 0],
  [".pricing-01-main-wrap", 0],
  [".cta .badge", 0],
  [".cta-button-wrap", 0],
  [".footer-copyright-wrap", 0],
  [".feedback-statistics-wrap", 0],
  [".brands-main-wrap", 5],
  [".services-card", 5],
  [".about-01-text-wrap", 5],
  [".about-01-button-wrap", 5],
  [".about-01-image-wrap", 5],
  [".project-01-left", 5],
  [".project-01-info-wrap", 5],
  [".project-large-link", 5],
  [".section-subtitle-wrap", 5],
  [".growth-circle-wrap", 5],
  [".circle-text-wrap", 5],
  [".growth-list", 5],
  [".feedback-column", 5],
  [".plan-switch-wrap", 5],
  [".plan-item", 5],
  [".faq-item", 5],
  [".blog-collection-list > *", 5],
  [".footer-details", 5],
  [".footer-newsletter-wrap", 5],
  [".footer-menu-column", 5],
];

/**
 * Reveal triggers play forward on entry and never reverse.
 *
 * `once: true` would express the same thing, but it makes a trigger kill itself
 * the instant it fires. On a narrow screen a good many of these are already
 * past their start when they are created, so they self-destruct part-way
 * through the creation loop and splice the array GSAP is iterating — which
 * throws. Leaving the trigger alive costs nothing and avoids that entirely.
 */
const PLAY_ONCE = { toggleActions: "play none none none" } as const;

/** Marquee cycle. Long enough that the movement reads as drift, not scroll. */
const MARQUEE_SECONDS = 50;

export function initOptionThreeMotion(scope: HTMLElement): () => void {
  const ctx = gsap.context(() => {
    const q = <T extends HTMLElement>(sel: string) =>
      gsap.utils.toArray<T>(sel);

    /* Navbar (fadeIn). Plays on load; the reference fades it rather than
       sliding it, so it never competes with the hero. */
    gsap.fromTo(
      ".navbar",
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 1, ease: OUT_QUART },
    );

    /* Hero (a-47). A staggered entrance where the image cover wipes downward as
       the photo un-zooms behind it — the two have to stay in step, so this is
       one timeline with absolute offsets rather than chained relative ones. */
    gsap
      .timeline({ defaults: { ease: EASE } })
      .fromTo(
        ".hero .badge",
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4 },
        0.1,
      )
      .fromTo(
        ".hero-heading-wrap",
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4 },
        0.2,
      )
      .fromTo(
        ".hero-image-cover",
        { yPercent: 0, autoAlpha: 1 },
        { yPercent: 100, duration: 0.6 },
        0.2,
      )
      .fromTo(
        ".hero-subtitle-wrap",
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 },
        0.3,
      )
      .fromTo(
        ".fit-cover.hero-image",
        { scale: 1.12 },
        { scale: 1, duration: 0.6 },
        0.3,
      )
      .fromTo(
        ".hero-button-wrap",
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.4 },
        0.4,
      );

    /* Scroll reveals (a-45). */
    for (const [selector, offset] of REVEALS) {
      for (const element of q(selector)) {
        gsap.fromTo(
          element,
          { y: 50, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.4,
            delay: 0.1,
            ease: EASE,
            scrollTrigger: {
              trigger: element,
              start: `top bottom-=${offset}%`,
              ...PLAY_ONCE,
            },
          },
        );
      }
    }

    /* Image reveals (a-46). The wrapper slides down over its own height while
       the photo inside un-zooms and comes out of blur, so the picture appears
       to settle rather than to arrive. */
    for (const wrap of q<HTMLElement>(".image-wrap")) {
      const image = wrap.querySelector(".fit-cover");
      gsap
        .timeline({
          defaults: { duration: 0.5, delay: 0.1, ease: OUT_QUART },
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom-=5%",
            ...PLAY_ONCE,
          },
        })
        .fromTo(wrap, { yPercent: -100 }, { yPercent: 0 }, 0)
        .fromTo(
          image,
          { scale: 1.5, filter: "blur(10px)" },
          { scale: 1, filter: "blur(0px)" },
          0,
        );
    }

    /* Hairline dividers (a-48) draw out from the left. */
    for (const divider of q<HTMLElement>(".divider")) {
      gsap.fromTo(
        divider,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.4,
          ease: EASE,
          scrollTrigger: {
            trigger: divider,
            start: "top bottom-=20%",
            ...PLAY_ONCE,
          },
        },
      );
    }

    /* Logo marquee (a-28). Two identical rows; moving both by exactly one row
       width lands the second where the first began, so the seam never shows.
       Like the reference, it holds still until the strip is actually on screen
       — otherwise it has already scrolled past its start by the time anyone
       reaches it. */
    const marquee = (
      targets: string,
      vars: gsap.TweenVars,
      trigger: string,
    ) => {
      const element = scope.querySelector(trigger);
      if (!element) return;
      gsap.to(targets, {
        ...vars,
        duration: MARQUEE_SECONDS,
        ease: "none",
        repeat: -1,
        scrollTrigger: { trigger: element, start: "top bottom", ...PLAY_ONCE },
      });
    };

    marquee(".brands-list", { xPercent: -100 }, ".brands-marquee");

    /* Testimonial marquees (a-18). Same trick vertically, and the two columns
       travel in opposite directions. */
    marquee(".feedback-list._01", { yPercent: -100 }, ".feedback-main-wrap");
    gsap.set(".feedback-list._02", { yPercent: -100 });
    marquee(".feedback-list._02", { yPercent: 0 }, ".feedback-main-wrap");

    /* Statistics (a-17). Each digit column is a strip of ten numerals inside a
       one-line window; the two strips arrive from opposite directions and stop
       on the pair that spells the figure. */
    for (const wrap of q<HTMLElement>(".statistics-number-wrap")) {
      gsap
        .timeline({
          defaults: { duration: 1, ease: OUT_CUBIC },
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom-=2%",
            ...PLAY_ONCE,
          },
        })
        .fromTo(
          wrap.querySelector(".upper"),
          { yPercent: 400 },
          { yPercent: 0 },
          0,
        )
        .fromTo(
          wrap.querySelector(".lower"),
          { yPercent: -400 },
          { yPercent: 0 },
          0,
        );
    }

    /* Growth dial (a-52). Tied to scroll position rather than played once, so
       the ring tracks the reader through the section. */
    const growth = scope.querySelector(".growth-main-wrap");
    if (growth) {
      gsap.fromTo(
        ".growth-circle",
        { rotate: 0 },
        {
          rotate: 15,
          ease: "none",
          scrollTrigger: {
            trigger: growth,
            start: "top 90%",
            end: "bottom 35%",
            scrub: 1,
          },
        },
      );
    }
  }, scope);

  return () => ctx.revert();
}

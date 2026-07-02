// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";
import { useTemplateLenis as useLenis } from "../../runtime";

gsap.registerPlugin(useGSAP, SplitText);

export let isInitialLoad = true;

const HERO_ENTER_DELAY = 4.5;
const HERO_ENTER_DURATION = 1.25;

// query hero elements needed for the enter animation
function getHeroElements() {
  return {
    fluorescent: document.querySelector(".hero .fluorescent"),
    content: document.querySelector(".hero-content"),
    footer: document.querySelector(".hero-footer"),
    logo: document.querySelector(".hero-logo"),
  };
}

// poll until all hero elements are in the dom
function waitForHeroElements(callback) {
  let attempts = 0;
  const maxAttempts = 60;

  const tryResolve = () => {
    const hero = getHeroElements();
    if (hero.fluorescent && hero.logo && hero.content && hero.footer) {
      callback(hero);
      return;
    }

    attempts += 1;
    if (attempts < maxAttempts) {
      requestAnimationFrame(tryResolve);
    }
  };

  tryResolve();
}

// set hero elements to their pre-enter offset state
function setHeroStartState(hero) {
  gsap.set(hero.fluorescent, { y: 300, force3D: true });
  gsap.set(hero.content, {
    top: "50%",
    yPercent: -50,
    y: 300,
    force3D: true,
  });
  gsap.set(hero.footer, { y: 300, force3D: true });
  gsap.set(hero.logo, {
    top: "50%",
    left: "50%",
    xPercent: -50,
    yPercent: -50,
    y: 300,
    force3D: true,
  });
}

// split text element into masked lines
function splitTextIntoLines(scope, selector) {
  const el = scope.querySelector(selector);
  if (!el) return null;

  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    linesClass: "line",
  });
}

// animate loading counter from 00 to 100
function animateCounter(scope, selector, duration = 4.5, delay = 2) {
  const counterElement = scope.querySelector(selector);
  if (!counterElement) return;

  let currentValue = 0;
  const updateInterval = 200;
  const maxDuration = duration * 1000;
  const startTime = Date.now();

  const timeoutId = window.setTimeout(() => {
    const updateCounter = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / maxDuration;

      if (currentValue < 100 && elapsedTime < maxDuration) {
        const target = Math.floor(progress * 100);
        const jump = Math.floor(Math.random() * 25) + 5;
        currentValue = Math.min(currentValue + jump, target, 100);
        counterElement.textContent = currentValue.toString().padStart(2, "0");
        window.setTimeout(updateCounter, updateInterval + Math.random() * 100);
      } else {
        counterElement.textContent = "100";
      }
    };

    updateCounter();
  }, delay * 1000);

  return () => window.clearTimeout(timeoutId);
}

export default function Preloader() {
  const preloaderRef = useRef(null);
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);
  const [loaderAnimating, setLoaderAnimating] = useState(false);
  const lenis = useLenis();

  // mark initial load complete on unmount
  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  // pause lenis scroll while preloader is animating
  useEffect(() => {
    if (!lenis) return;

    if (loaderAnimating) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [lenis, loaderAnimating]);

  // preloader timeline - copy reveal, revealer scale, hero enter
  useGSAP(
    () => {
      if (!showPreloader) return;

      const scope = preloaderRef.current;
      if (!scope) return;

      setLoaderAnimating(true);

      let hero = null;
      let tl = null;
      let clearCounter = null;
      let copySplits = [];

      waitForHeroElements((resolvedHero) => {
        hero = resolvedHero;
        setHeroStartState(hero);

        const revealer = scope.querySelector(".preloader-revealer");
        gsap.set(revealer, {
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
          scale: 0,
          transform: "none",
        });

        copySplits = [
          splitTextIntoLines(scope, ".preloader-copy-col:first-child p"),
          splitTextIntoLines(scope, ".preloader-copy-col:last-child p"),
          splitTextIntoLines(scope, ".preloader-counter p"),
        ].filter(Boolean);

        const lineEls = copySplits.flatMap((split) => split.lines);

        if (lineEls.length > 0) {
          gsap.set(lineEls, { y: "100%" });
        }

        scope.classList.add("is-copy-ready");

        clearCounter = animateCounter(scope, ".preloader-counter p", 4.5, 2);

        tl = gsap.timeline({
          onComplete: () => {
            window.setTimeout(() => {
              setLoaderAnimating(false);
              setShowPreloader(false);
            }, 100);
          },
        });

        tl.to(lineEls, {
          y: "0%",
          duration: 1,
          stagger: 0.075,
          ease: "power3.out",
          delay: 1,
        })
          .to(
            revealer,
            {
              scale: 0.1,
              duration: 0.75,
              ease: "power2.out",
            },
            "<",
          )
          .to(revealer, {
            scale: 0.25,
            duration: 1,
            ease: "power3.out",
          })
          .to(revealer, {
            scale: 0.5,
            duration: 0.75,
            ease: "power3.out",
          })
          .to(revealer, {
            scale: 0.75,
            duration: 0.5,
            ease: "power2.out",
          })
          .to(revealer, {
            scale: 1,
            duration: 1,
            ease: "power3.out",
          })
          .to(
            scope,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: HERO_ENTER_DURATION,
              ease: "power3.out",
            },
            "-=1",
          )
          .to(
            [hero.fluorescent, hero.content, hero.footer, hero.logo],
            {
              y: 0,
              duration: HERO_ENTER_DURATION,
              ease: "power3.out",
            },
            HERO_ENTER_DELAY,
          );
      });

      return () => {
        clearCounter?.();
        tl?.kill();
        scope?.classList.remove("is-copy-ready");
        copySplits.forEach((split) => split.revert());

        if (hero) {
          gsap.killTweensOf([
            hero.fluorescent,
            hero.content,
            hero.footer,
            hero.logo,
          ]);
        }
      };
    },
    { scope: preloaderRef, dependencies: [showPreloader] },
  );

  if (!showPreloader) {
    return null;
  }

  return (
    <div className="preloader" ref={preloaderRef}>
      <div className="preloader-revealer" />

      <div className="preloader-copy">
        <div className="preloader-copy-col">
          <p>
            Corridors shaped by surveillance, concrete, and mechanics that never
            reveal their full logic.
          </p>
        </div>
        <div className="preloader-copy-col">
          <p>
            Projects constructed to leave permanent residue where comfort used
            to be.
          </p>
        </div>
      </div>

      <div className="preloader-counter">
        <p>00</p>
      </div>
    </div>
  );
}

// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useLenis } from "lenis/react";
import React, { useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP, SplitText, CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

export let isInitialLoad = true;

const Preloader = () => {
  const preloaderRef = useRef(null);
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);
  const [loaderAnimating, setLoaderAnimating] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useEffect(() => {
    if (lenis) {
      if (loaderAnimating) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [lenis, loaderAnimating]);

  useGSAP(
    () => {
      if (!showPreloader) return;
      setLoaderAnimating(true);

      const waitForFonts = async () => {
        try {
          await document.fonts.ready;
          const customFonts = ["Big Shoulders Display"];
          const fontCheckPromises = customFonts.map((fontFamily) => {
            return document.fonts.check(`16px ${fontFamily}`);
          });
          await Promise.all(fontCheckPromises);
          await new Promise((resolve) => setTimeout(resolve, 100));
          return true;
        } catch (error) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return true;
        }
      };

      const initializeAnimation = async () => {
        await waitForFonts();

        gsap.set(".preloader-header h1", { opacity: 0 });

        const preloaderHeaderSplit = SplitText.create(".preloader-header h1", {
          type: "chars",
          charsClass: "char",
          mask: "chars",
        });

        const chars = preloaderHeaderSplit.chars;

        chars.forEach((char, index) => {
          gsap.set(char, { yPercent: index % 2 === 0 ? -100 : 100 });
        });

        gsap.set(".preloader-header h1", { opacity: 1 });

        const preloaderImages = gsap.utils.toArray(".preloader-images .img");
        const preloaderImagesInner = gsap.utils.toArray(
          ".preloader-images .img img",
        );

        const tl = gsap.timeline({ delay: 0.25 });

        tl.to(".progress-bar", {
          scaleX: 1,
          duration: 4,
          ease: "power3.inOut",
        })
          .set(".progress-bar", { transformOrigin: "right" })
          .to(".progress-bar", {
            scaleX: 0,
            duration: 1,
            ease: "power3.in",
          });

        preloaderImages.forEach((preloaderImg, index) => {
          tl.to(
            preloaderImg,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1,
              ease: "hop",
              delay: index * 0.75,
            },
            "-=5",
          );
        });

        preloaderImagesInner.forEach((preloaderImageInner, index) => {
          tl.to(
            preloaderImageInner,
            {
              scale: 1,
              duration: 1.5,
              ease: "hop",
              delay: index * 0.75,
            },
            "-=5.25",
          );
        });

        tl.to(
          chars,
          {
            yPercent: 0,
            duration: 1,
            ease: "hop",
            stagger: 0.025,
          },
          "-=5",
        );

        tl.to(
          ".preloader-images",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1,
            ease: "hop",
          },
          "-=1.5",
        );

        tl.to(
          chars,
          {
            yPercent: (index) => (index % 2 === 0 ? 100 : -100),
            duration: 1,
            ease: "hop",
            stagger: 0.025,
          },
          "-=2.5",
        );

        tl.to(
          ".preloader",
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.75,
            ease: "hop",
            onStart: () => {
              gsap.set(".preloader", { pointerEvents: "none" });
            },
            onComplete: () => {
              setTimeout(() => {
                setLoaderAnimating(false);
                setShowPreloader(false);
              }, 100);
            },
          },
          "-=0.5",
        );
      };

      initializeAnimation();
    },
    { scope: preloaderRef, dependencies: [showPreloader] },
  );

  if (!showPreloader) {
    return null;
  }

  return (
    <>
      <div className="preloader" ref={preloaderRef}>
        <div className="progress-bar"></div>

        <div className="preloader-images">
          <div className="img">
            <img
              src="https://ui.aryank.space/assets/polite-chaos-page/featured-work/work-1.jpg"
              alt=""
            />
          </div>
          <div className="img">
            <img
              src="https://ui.aryank.space/assets/polite-chaos-page/featured-work/work-2.jpg"
              alt=""
            />
          </div>
          <div className="img">
            <img
              src="https://ui.aryank.space/assets/polite-chaos-page/featured-work/work-5.jpg"
              alt=""
            />
          </div>
          <div className="img">
            <img
              src="https://ui.aryank.space/assets/polite-chaos-page/featured-work/work-3.jpg"
              alt=""
            />
          </div>
        </div>
      </div>

      <div className="preloader-header">
        <h1>Polite Chaos</h1>
      </div>
    </>
  );
};

export default Preloader;

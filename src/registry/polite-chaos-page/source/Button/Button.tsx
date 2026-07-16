// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import React, { useRef } from "react";
import { HiLightningBolt } from "react-icons/hi";
import { useViewTransition } from "../useViewTransition";

gsap.registerPlugin(SplitText, ScrollTrigger);

export default function Button({
  href,
  children,
  variant = "dark",
  icon,
  animateOnScroll = false,
  delay = 0,
}) {
  const IconComponent = icon || HiLightningBolt;
  const { navigateWithTransition } = useViewTransition();
  const buttonRef = useRef(null);
  const labelRef = useRef(null);
  const iconRef = useRef(null);
  const splitRef = useRef(null);
  const lines = useRef([]);

  const waitForFonts = async () => {
    try {
      await document.fonts.ready;

      const customFonts = [
        "Geist Mono",
        "PP Neue Montreal",
        "PP Pangram Sans",
        "Big Shoulders Display",
      ];
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

  useGSAP(
    () => {
      if (!labelRef.current || !buttonRef.current) return;

      const initializeSplitText = async () => {
        await waitForFonts();

        splitRef.current = null;
        lines.current = [];

        const split = SplitText.create(labelRef.current, {
          type: "lines",
          mask: "lines",
          linesClass: "line++",
          lineThreshold: 0.1,
        });

        splitRef.current = split;
        lines.current = split.lines;

        gsap.set(lines.current, { y: "100%" });

        if (iconRef.current) {
          gsap.set(iconRef.current, { scale: 0 });
        }

        const animationProps = {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay: delay,
        };

        if (animateOnScroll) {
          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger: labelRef.current,
              start: "top 90%",
              once: true,
            },
          });

          if (iconRef.current) {
            gsap.to(iconRef.current, {
              scale: 1,
              duration: 0.8,
              ease: "power4.out",
              delay: delay + 0.3,
              scrollTrigger: {
                trigger: labelRef.current,
                start: "top 90%",
                once: true,
              },
            });
          }
        } else {
          gsap.to(lines.current, animationProps);

          if (iconRef.current) {
            gsap.to(iconRef.current, {
              scale: 1,
              duration: 0.8,
              ease: "power4.out",
              delay: delay,
            });
          }
        }
      };

      initializeSplitText();

      return () => {
        if (splitRef.current) {
          splitRef.current.revert();
        }
      };
    },
    { scope: buttonRef, dependencies: [animateOnScroll, delay] },
  );

  return (
    <a
      ref={buttonRef}
      href={href}
      className={`button button--${variant}`}
      onClick={(e) => {
        if (!href) return;
        e.preventDefault();
        navigateWithTransition(href);
      }}
    >
      <span className="button-label" ref={labelRef}>
        {children}
      </span>
      <span className="button-icon">
        <span className="button-icon-inner" ref={iconRef}>
          <IconComponent size={12} />
        </span>
      </span>
    </a>
  );
}

// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef, useState } from "react";
import { LuVolume, LuVolumeX } from "react-icons/lu";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Showreel = () => {
  const showreelSecRef = useRef(null);
  const audioRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const totalFrames = 7;
  const frameInterval = 500;

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);

      if (!audioRef.current.muted && audioRef.current.paused) {
        audioRef.current.play();
      }
    }
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1000px)", () => {
        const scrollTriggerInstances = [];

        const frameTimeline = gsap.timeline({ repeat: -1 });

        for (let i = 1; i <= totalFrames; i++) {
          frameTimeline.add(
            () => {
              setCurrentFrame(i);
            },
            (i - 1) * (frameInterval / 1000),
          );
        }

        if (audioRef.current) {
          audioRef.current.play().catch((error) => {});
        }

        const scrollTrigger = ScrollTrigger.create({
          trigger: showreelSecRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 2}px`,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const progress = self.progress;

            const scaleValue = gsap.utils.mapRange(0, 1, 0.75, 1, progress);
            const borderRadiusValue =
              progress <= 0.5 ? gsap.utils.mapRange(0, 0.5, 2, 0, progress) : 0;

            gsap.set(".showreel-container", {
              scale: scaleValue,
              borderRadius: `${borderRadiusValue}rem`,
            });
          },
        });

        if (scrollTrigger) {
          scrollTriggerInstances.push(scrollTrigger);
        }

        const refreshHandler = () => {
          ScrollTrigger.refresh();
        };

        window.addEventListener("orientationchange", refreshHandler);
        window.addEventListener("resize", refreshHandler);

        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad, { passive: true });

        return () => {
          frameTimeline.kill();

          scrollTriggerInstances.forEach((trigger) => trigger.kill());

          window.removeEventListener("orientationchange", refreshHandler);
          window.removeEventListener("resize", refreshHandler);
          window.removeEventListener("load", onLoad);
        };
      });

      mm.add("(max-width: 999px)", () => {
        const showreelSection = showreelSecRef.current;
        if (showreelSection) {
          gsap.set(showreelSection, { clearProps: "all" });
        }
        gsap.set(".showreel-container", { clearProps: "all" });

        ScrollTrigger.refresh();

        const refreshHandler = () => {
          ScrollTrigger.refresh();
        };

        window.addEventListener("orientationchange", refreshHandler);
        const onLoad = () => ScrollTrigger.refresh();
        window.addEventListener("load", onLoad, { passive: true });

        return () => {
          window.removeEventListener("orientationchange", refreshHandler);
          window.removeEventListener("load", onLoad);
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: showreelSecRef },
  );

  return (
    <section className="showreel" ref={showreelSecRef}>
      <div className="showreel-container">
        <img
          src={`https://ui.aryank.space/assets/polite-chaos-page/showreel/showreel-frame-${currentFrame}.jpg`}
          alt="Showreel frame"
        />
      </div>

      <div className="volume-icon" onClick={toggleMute}>
        {isMuted ? (
          <LuVolumeX color="#171412" size={25} />
        ) : (
          <LuVolume color="#171412" size={25} />
        )}
      </div>

      <audio
        ref={audioRef}
        src="https://ui.aryank.space/assets/polite-chaos-page/showreel/showreel_music.mp3"
        loop
        muted={isMuted}
      />
    </section>
  );
};

export default Showreel;

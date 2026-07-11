"use client";

/**
 * Video Card Stack - a 3D perspective deck of looping video cards. Clicking
 * anywhere throws the front card off and tucks it behind the stack.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

const ASSET_BASE = "https://ui.aryank.space/assets/video-card-stack";

export interface StackVideo {
  id: string;
  title: string;
  category: string;
  date: string;
}

export interface VideoCardStackProps {
  videos?: StackVideo[];
  logoText?: string;
  navLinks?: string[];
  ctaText?: string;
  background?: string;
}

const DEFAULT_VIDEOS: StackVideo[] = [
  {
    id: "711863471",
    title: "Cineprint",
    category: "Documentary",
    date: "May 2022",
  },
  {
    id: "478246234",
    title: "Yosemite",
    category: "Sci-Fi",
    date: "June 2022",
  },
  {
    id: "387407107",
    title: "Orihima",
    category: "Art",
    date: "July 2022",
  },
  {
    id: "704562417",
    title: "Grace Rutina",
    category: "Nature",
    date: "August 2022",
  },
];

const DEFAULT_LINKS = ["Home", "Projects", "Use Cases", "Commitments"];

export default function VideoCardStack({
  videos = DEFAULT_VIDEOS,
  logoText = "Directory",
  navLinks = DEFAULT_LINKS,
  ctaText = "Contact",
  background = "#000000",
}: VideoCardStackProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && sliderRef.current) {
      initializeCards();
    }
  }, [isClient]);

  const initializeCards = () => {
    if (!sliderRef.current) return;
    const cards = Array.from(sliderRef.current.querySelectorAll(".vcs-card"));
    gsap.to(cards, {
      y: (i: number) => `${0 + 20 * i}%`,
      z: (i: number) => 15 * i,
      duration: 1,
      ease: "power3.out",
      stagger: -0.1,
    });
  };

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const slider = sliderRef.current;
    if (!slider) return;
    const cards = Array.from(slider.querySelectorAll(".vcs-card"));
    const lastCard = cards.pop();
    if (!lastCard) return;

    gsap.to(lastCard, {
      y: "+=150%",
      duration: 0.75,
      ease: "power3.inOut",
      onStart: () => {
        setTimeout(() => {
          slider.prepend(lastCard);
          initializeCards();
          setTimeout(() => {
            setIsAnimating(false);
          }, 1000);
        }, 300);
      },
    });
  };

  return (
    <section
      className="vcs-root"
      style={{ "--vcs-bg": background } as React.CSSProperties}
    >
      <style>{styles}</style>
      <div className="vcs-navbar">
        <div className="vcs-logo">
          <p>
            <span>{logoText}</span> by BLANK
          </p>
        </div>
        <div className="vcs-nav-links">
          {navLinks.map((link) => (
            <p key={link}>{link}</p>
          ))}
        </div>
        <div className="vcs-cta">
          <p>{ctaText}</p>
        </div>
      </div>

      <div className="vcs-container" onClick={handleClick}>
        <div className="vcs-slider" ref={sliderRef}>
          {videos.map((video) => (
            <div className="vcs-card" key={video.id}>
              <div className="vcs-card-info">
                <div className="vcs-card-item">
                  <p>{video.date}</p>
                </div>
                <div className="vcs-card-item">
                  <p>{video.title}</p>
                </div>
                <div className="vcs-card-item">
                  <p>{video.category}</p>
                </div>
              </div>

              <div className="vcs-video-player">
                {isClient ? (
                  <ReactPlayer
                    controls={false}
                    height="100%"
                    loop
                    muted
                    playing
                    src={`https://vimeo.com/${video.id}`}
                    width="100%"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = `
@font-face {
  font-family: "BLANK Stack Label";
  src: url("${ASSET_BASE}/fonts/neue-montreal-medium.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.vcs-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  font-family: "PP Neue Montreal", "BLANK Stack Label", sans-serif;
  background-color: var(--vcs-bg);
}

.vcs-root p {
  font-size: 12px;
  font-weight: 500;
  color: #6a6a6a;
}

.vcs-root p span {
  font-weight: bolder;
  color: #fff;
}

.vcs-navbar {
  position: absolute;
  top: 0;
  width: 100%;
  padding: 2em;
  display: flex;
  align-items: center;
  z-index: 2;
}

.vcs-navbar > div {
  flex: 1;
}

.vcs-nav-links {
  display: flex;
  justify-content: center;
  gap: 1em;
}

.vcs-cta {
  display: flex;
  justify-content: flex-end;
}

.vcs-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
}

.vcs-slider {
  position: absolute;
  top: 5vh;
  width: 100%;
  height: 100%;
  perspective: 175px;
  perspective-origin: 50% 100%;
  overflow: hidden;
}

.vcs-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0px);
  width: 65%;
  height: 500px;
  background: #000;
  border-right: 1px solid #303030;
  border-radius: 7px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vcs-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 1px solid #303030;
  border-radius: 8px;
  z-index: 2;
}

.vcs-card-info {
  width: 100%;
  padding: 0.5em 0.75em;
  display: flex;
  align-items: center;
  background-color: #000;
  z-index: 2;
}

.vcs-card-item {
  flex: 1;
}

.vcs-card-item p {
  font-size: 7px;
  color: #6a6a6a;
}

.vcs-card-item:nth-child(2) {
  text-align: center;
}

.vcs-card-item:nth-child(2) p {
  font-size: 8px;
  font-weight: 600;
  color: #fff;
}

.vcs-card-item:nth-child(3) {
  text-align: right;
}

.vcs-video-player {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.vcs-video-player > * {
  position: relative;
  transform: scale(1.5);
}

@media (max-width: 900px) {
  .vcs-nav-links {
    display: none;
  }

  .vcs-video-player > * {
    transform: scale(3);
  }
}
`;

// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Button from "../Button/Button";
import Copy from "../Copy/Copy";

import "./FeaturedCards.css";

gsap.registerPlugin(ScrollTrigger);

const FEATURED_CARDS_DATA = [
  {
    subtitle: "The Fallen",
    title: "Arches of Vorn",
    image: "https://ui.aryank.space/assets/house-of-epochs-page/images/img1.jpg",
  },
  {
    subtitle: "The Silent",
    title: "Monolith Drenn",
    image: "https://ui.aryank.space/assets/house-of-epochs-page/images/img2.jpg",
  },
  {
    subtitle: "The Suspended",
    title: "Orbs of Thessyn",
    image: "https://ui.aryank.space/assets/house-of-epochs-page/images/img3.jpg",
  },
  {
    subtitle: "The Tethered Moon",
    title: "Fields of Aruun",
    image: "https://ui.aryank.space/assets/house-of-epochs-page/images/img4.jpg",
  },
  {
    subtitle: "The Flooded",
    title: "Passage of Kael",
    image: "https://ui.aryank.space/assets/house-of-epochs-page/images/img5.jpg",
  },
];

export default function FeaturedCards() {
  const featuredCardsRef = useRef(null);
  const featuredCardsContainerRef = useRef(null);

  useGSAP(
    () => {
      const section = featuredCardsRef.current;
      const cards =
        featuredCardsContainerRef.current?.querySelectorAll(".featured-card");

      if (!section || !cards?.length) return;

      let featuredCardsTrigger;

      function setup() {
        cleanup();

        cards.forEach((card) => gsap.set(card, { clearProps: "all" }));

        if (window.innerWidth < 1000) return;

        const totalCards = cards.length;

        featuredCardsTrigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${window.innerHeight * totalCards}px`,
          pin: true,
          pinSpacing: true,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress * totalCards;

            cards.forEach((card, i) => {
              const cardProgress = gsap.utils.clamp(0, 1, progress - i);
              const nextCardProgress = gsap.utils.clamp(
                0,
                1,
                progress - (i + 1),
              );

              gsap.set(card, {
                y: gsap.utils.interpolate("200%", "-50%", cardProgress),
                scale: gsap.utils.interpolate(1, 0.85, nextCardProgress),
                "--overlay-opacity": gsap.utils.interpolate(
                  0,
                  1,
                  nextCardProgress * 0.5,
                ),
              });
            });
          },
        });
      }

      function cleanup() {
        featuredCardsTrigger?.kill();
        featuredCardsTrigger = null;
      }

      setup();

      let featuredCardsResizeTimer;
      const handleFeaturedCardsResize = () => {
        clearTimeout(featuredCardsResizeTimer);
        featuredCardsResizeTimer = setTimeout(setup, 250);
      };

      window.addEventListener("resize", handleFeaturedCardsResize);

      return () => {
        cleanup();
        clearTimeout(featuredCardsResizeTimer);
        window.removeEventListener("resize", handleFeaturedCardsResize);
      };
    },
    { scope: featuredCardsRef },
  );

  return (
    <section className="featured-cards" ref={featuredCardsRef}>
      <div className="container">
        <div className="featured-cards-wrapper">
          <div className="featured-cards-header">
            <Copy variant="flicker">
              <p className="mono">[ Surveyed Lands ]</p>
            </Copy>

            <Copy splitType="words">
              <h5 className="v2">Record of structures that refused to fall</h5>
            </Copy>

            <Copy variant="slide" delay={0.5}>
              <Button href="/chronicles">Browse Chronicles</Button>
            </Copy>
          </div>

          <div
            className="featured-cards-container"
            ref={featuredCardsContainerRef}
          >
            {FEATURED_CARDS_DATA.map((card) => (
              <div className="featured-card" key={card.title}>
                <div className="featured-card-img">
                  <img src={card.image} alt="" />
                </div>
                <div className="featured-card-content">
                  <h6 className="subheader">{card.subtitle}</h6>
                  <h5>{card.title}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

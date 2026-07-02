// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { useAsset } from "../../runtime";
import Copy from "../Copy/Copy";

gsap.registerPlugin(ScrollTrigger);

const TEAM = [
  {
    name: "Kai Tanaka",
    role: "Creative Director",
    img: "/team/team-1.jpg",
  },
  {
    name: "Lena Voss",
    role: "Lead Sound Designer",
    img: "/team/team-2.jpg",
  },
  {
    name: "Erik Holm",
    role: "Systems Architect",
    img: "/team/team-3.jpg",
  },
  {
    name: "Mara Chen",
    role: "Art Director",
    img: "/team/team-4.jpg",
  },
  {
    name: "Sol Rieve",
    role: "Narrative Designer",
    img: "/team/team-5.jpg",
  },
];

export default function Team() {
  const asset = useAsset();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  // pin section and arc cards along scroll progress
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current;
    if (!section || !cards.length) return;

    const stickyHeight = window.innerHeight * 7;
    const totalCards = cards.length;

    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;

    function getRadius() {
      return window.innerWidth < 900
        ? window.innerWidth * 7.5
        : window.innerWidth * 2.5;
    }

    // position each card on the arc for a given scroll progress
    function positionCards(progress = 0) {
      const radius = getRadius();
      const cardSpacing = 0.15;
      const initialOffset = -cardSpacing * (totalCards - 1);
      const totalTravel = 1 - initialOffset;
      const arcProgress = initialOffset + progress * totalTravel;

      cards.forEach((card, i) => {
        if (!card) return;
        const cardOffset = (totalCards - 1 - i) * cardSpacing;
        const cardProgress = cardOffset + arcProgress;
        const angle = startAngle + arcAngle * cardProgress;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rotation = (angle - Math.PI / 2) * (180 / Math.PI);

        gsap.set(card, {
          x,
          y: -y + radius,
          rotation: -rotation,
          transformOrigin: "center center",
        });
      });
    }

    positionCards(0);

    const proxy = { progress: 0 };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${stickyHeight}px`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      invalidateOnRefresh: true,
      refreshPriority: -1,
      onUpdate: (self) => {
        positionCards(self.progress);
      },
    });

    const handleResize = () => {
      positionCards(0);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="team" ref={sectionRef}>
      <div className="team-header">
        <Copy variant="flicker">
          <p className="mono">The Collective</p>
        </Copy>
        <Copy>
          <h5 className="type-2">Behind The Lock</h5>
        </Copy>
      </div>

      <div className="team-footer">
        <div className="container">
          <p className="mono">Roster Verified</p>
          <p className="mono">Defectors: None</p>
        </div>
      </div>

      <div className="cards">
        {TEAM.map((member, i) => (
          <div
            key={member.name}
            className="card"
            ref={(el) => (cardsRef.current[i] = el)}
          >
            <div className="card-img">
              <img src={asset(member.img)} alt={member.name} />
            </div>
            <div className="card-content">
              <p className="lg">{member.name}</p>
              <p className="mono">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

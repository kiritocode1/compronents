// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import Copy from "../Copy/Copy";

import "./About.css";

gsap.registerPlugin(ScrollTrigger);

const services = [
  "Structural Preservation",
  "Archaeological Survey",
  "Archival Documentation",
  "Cartographic Research",
  "Geological Dating",
  "Field Conservation",
];

export default function About() {
  const aboutRef = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".about-service-card");
      if (!cards.length) return;

      gsap.set(cards, { y: 300, opacity: 0 });

      gsap.to(cards, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".about-services-grid",
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: aboutRef },
  );

  return (
    <section className="about" ref={aboutRef}>
      <div className="container">
        <div className="about-wrapper">
          <div className="about-intro">
            <Copy variant="flicker">
              <p className="mono about-label">[ The Institution ]</p>
            </Copy>

            <Copy splitType="words">
              <h5 className="v2 about-title">
                A digital archive dedicated to the monumental structures that
                outlasted their builders.
              </h5>
            </Copy>
          </div>

          <div className="about-services">
            <div className="about-services-left">
              <div className="about-services-left-header">
                <Copy splitType="words">
                  <h6 className="v2">
                    Recording structures the earth is slowly reclaiming.
                  </h6>
                </Copy>
              </div>

              <div className="about-services-left-copy">
                <div className="about-services-image">
                  <img src="https://ui.aryank.space/assets/house-of-epochs-page/images/img4.jpg" alt="" />
                </div>

                <p className="about-services-copy">
                  Every epoch leaves behind stone, and long after language fades
                  and borders dissolve, the structures remain.
                </p>
              </div>
            </div>

            <div className="about-services-right">
              <Copy splitType="words">
                <h6 className="v2">Disciplines</h6>
              </Copy>

              <div className="about-services-grid">
                {services.map((service, id) => (
                  <div className="about-service-card" key={service}>
                    <p className="mono sm">0{id + 1}</p>
                    <p className="md">{service}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

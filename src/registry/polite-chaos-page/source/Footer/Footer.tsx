// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { IoMail } from "react-icons/io5";
import Button from "../Button/Button";
import Copy from "../Copy/Copy";

gsap.registerPlugin(useGSAP);

const Footer = () => {
  const footerRef = useRef(null);
  const explosionContainerRef = useRef(null);
  const [torontoTime, setTorontoTime] = useState("");

  const config = {
    gravity: 0.25,
    friction: 0.99,
    imageSize: 300,
    horizontalForce: 20,
    verticalForce: 15,
    rotationSpeed: 10,
    resetDelay: 500,
  };

  const imageParticleCount = 10;
  const imagePaths = Array.from(
    { length: imageParticleCount },
    (_, i) => `/objects/obj-${i + 1}.png`,
  );

  useEffect(() => {
    const updateTorontoTime = () => {
      const options = {
        timeZone: "America/Toronto",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };

      const formatter = new Intl.DateTimeFormat("en-US", options);
      const torontoTimeString = formatter.format(new Date());
      setTorontoTime(torontoTimeString);
    };

    updateTorontoTime();
    const timeInterval = setInterval(updateTorontoTime, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  class Particle {
    constructor(element) {
      this.element = element;
      this.x = 0;
      this.y = 0;
      this.vx = (Math.random() - 0.5) * config.horizontalForce;
      this.vy = -config.verticalForce - Math.random() * 10;
      this.rotation = 0;
      this.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed;
    }

    update() {
      this.vy += config.gravity;
      this.vx *= config.friction;
      this.vy *= config.friction;
      this.rotationSpeed *= config.friction;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }
  }

  useGSAP(
    () => {
      let hasExploded = false;
      let animationId;
      let checkTimeout;

      imagePaths.forEach((path) => {
        const img = new Image();
        img.src = path;
      });

      const getComputedImageSize = () => {
        const viewportWidth =
          typeof window !== "undefined" ? window.innerWidth : 1200;
        const viewportHeight =
          typeof window !== "undefined" ? window.innerHeight : 800;
        const baseOnWidth = Math.floor(viewportWidth * 0.18);
        const baseOnHeight = Math.floor(viewportHeight * 0.22);
        return Math.max(
          300,
          Math.min(config.imageSize, baseOnWidth, baseOnHeight),
        );
      };

      const createParticles = () => {
        if (!explosionContainerRef.current) return;
        explosionContainerRef.current.innerHTML = "";

        const particleSize = getComputedImageSize();
        explosionContainerRef.current.style.setProperty(
          "--particle-size",
          `${particleSize}px`,
        );

        imagePaths.forEach((path) => {
          const particle = document.createElement("img");
          particle.src = path;
          particle.classList.add("explosion-particle-img");
          explosionContainerRef.current.appendChild(particle);
        });
      };

      const explode = () => {
        if (hasExploded || !explosionContainerRef.current) return;

        hasExploded = true;
        createParticles();

        const particleElements = explosionContainerRef.current.querySelectorAll(
          ".explosion-particle-img",
        );
        const particles = Array.from(particleElements).map(
          (element) => new Particle(element),
        );

        const animate = () => {
          particles.forEach((particle) => particle.update());
          animationId = requestAnimationFrame(animate);

          if (
            explosionContainerRef.current &&
            particles.every(
              (particle) =>
                particle.y > explosionContainerRef.current.offsetHeight / 2,
            )
          ) {
            cancelAnimationFrame(animationId);
          }
        };

        animate();
      };

      const checkFooterPosition = () => {
        if (!footerRef.current) return;

        const footerRect = footerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (footerRect.top > viewportHeight + 100) {
          hasExploded = false;
        }

        if (!hasExploded && footerRect.top <= viewportHeight + 250) {
          explode();
        }
      };

      createParticles();
      setTimeout(checkFooterPosition, 500);

      const scrollHandler = () => {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(checkFooterPosition, 5);
      };

      const resizeHandler = () => {
        const newSize = getComputedImageSize();
        if (explosionContainerRef.current) {
          explosionContainerRef.current.style.setProperty(
            "--particle-size",
            `${newSize}px`,
          );
        }
        hasExploded = false;
      };

      window.addEventListener("scroll", scrollHandler);
      window.addEventListener("resize", resizeHandler);

      return () => {
        window.removeEventListener("scroll", scrollHandler);
        window.removeEventListener("resize", resizeHandler);
        clearTimeout(checkTimeout);
        cancelAnimationFrame(animationId);
        if (explosionContainerRef.current) {
          explosionContainerRef.current.innerHTML = "";
        }
      };
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef}>
      <div className="container">
        <div className="footer-header-content">
          <div className="footer-header">
            <Copy animateOnScroll={true} delay={0.2}>
              <h1>Let's build something that feels alive</h1>
            </Copy>
          </div>
          <div className="footer-link">
            <Button
              animateOnScroll={true}
              delay={0.5}
              variant="light"
              icon={IoMail}
              href="/contact"
            >
              Say Hello
            </Button>
          </div>
        </div>
        <div className="footer-byline">
          <div className="footer-time">
            <p>
              Toronto, ON <span>{torontoTime}</span>
            </p>
          </div>

          <div className="footer-author">
            <p>Developed by BLANK</p>
          </div>

          <div className="footer-copyright">
            <p>&copy; Polite Chaos</p>
          </div>
        </div>
      </div>
      <div className="explosion-container" ref={explosionContainerRef}></div>
    </footer>
  );
};

export default Footer;

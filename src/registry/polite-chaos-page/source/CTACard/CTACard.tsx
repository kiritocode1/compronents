// @ts-nocheck
// biome-ignore-all lint: source-authored full-page port.
"use client";
import { MdArticle } from "react-icons/md";
import Button from "../Button/Button";
import Copy from "../Copy/Copy";

const CTACard = () => {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta-copy">
          <div className="cta-col">
            <Copy animateOnScroll={true}>
              <p className="sm">Part of the collective</p>
            </Copy>
          </div>

          <div className="cta-col">
            <Copy animateOnScroll={true}>
              <p className="lg">
                Polite Chaos is connected to The Noise Network, a collective of
                studios exploring digital art as emotion, motion, and code.
              </p>
            </Copy>

            <Button
              animateOnScroll={true}
              delay={0.25}
              variant="dark"
              href="/contact"
            >
              Drop your portfolio
            </Button>
          </div>
        </div>

        <div className="cta-card">
          <div className="cta-card-copy">
            <div className="cta-card-col">
              <Copy animateOnScroll={true}>
                <h3>Secret Department</h3>
              </Copy>
            </div>

            <div className="cta-card-col">
              <Copy animateOnScroll={true}>
                <p>
                  We like to think we build order out of chaos, but it’s usually
                  the other way around. Every project starts as a mess of
                  sketches and motion tests.
                </p>

                <p>
                  If something feels too polished, we probably broke it on
                  purpose and rebuilt it slightly wrong, just enough to feel
                  human.
                </p>
              </Copy>

              <Button
                animateOnScroll={true}
                delay={0.25}
                variant="light"
                icon={MdArticle}
                href="/studio"
              >
                Read the theory
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTACard;

// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import Copy from "../components/Copy/Copy";
import Footer from "../components/Footer/Footer";
import { useAsset } from "../runtime";

// brief page - project case study sections
const Brief = () => {
  const asset = useAsset();
  return (
    <>
      <section className="brief-hero">
        <div className="brief-hero-header">
          <Copy animateOnScroll={false} delay={0.65}>
            <h2 className="type-2">Subject Identified</h2>
          </Copy>
        </div>
      </section>

      <section className="brief-banner-img">
        <div className="brief-banner-img-wrapper">
          <img src={asset("brief/brief-img-1.jpg")} alt="" />
        </div>
      </section>

      <section className="brief-overview">
        <div className="brief-overview-header">
          <div className="container">
            <Copy>
              <h2 className="type-2">
                A face in the feed that changes everything
              </h2>
            </Copy>
            <Copy variant="flicker">
              <p className="mono">2022 - 2025</p>
            </Copy>
          </div>
        </div>

        <div className="brief-overview-content">
          <div className="container">
            <div className="brief-overview-content-col">
              <Copy variant="flicker">
                <p className="mono">Project Brief</p>
              </Copy>
            </div>
            <div className="brief-overview-content-col">
              <Copy>
                <h5 className="type-2">
                  Subject Identified is a stealth thriller built around a
                  fractured surveillance network and one unresolved case file.
                  The player operates from behind a wall of monitors, scrubbing
                  through degraded camera feeds, cross-referencing timestamps,
                  and flagging targets that may or may not exist. Nothing is
                  confirmed. Every identification triggers a chain of events
                  that cannot be undone.
                </h5>
              </Copy>

              <Copy variant="flicker">
                <p className="mono">View Trailer</p>
              </Copy>
            </div>
          </div>
        </div>
      </section>

      <section className="brief-images">
        <div className="brief-images-container">
          <div className="container">
            <div className="brief-img">
              <img src={asset("brief/brief-img-2.jpg")} alt="" />
            </div>

            <div className="brief-img">
              <img src={asset("brief/brief-img-3.jpg")} alt="" />
            </div>

            <div className="brief-img">
              <img src={asset("brief/brief-img-4.jpg")} alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className="next-brief">
        <div className="next-brief-header">
          <Copy variant="flicker">
            <p className="mono">Next Project</p>
          </Copy>
          <Copy>
            <h2 className="type-2">Dossier 09</h2>
          </Copy>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Brief;

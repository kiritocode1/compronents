// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

"use client";

import Copy from "../components/Copy/Copy";
import TrailContainer from "../components/TrailContainer/TrailContainer";

// connect page - mouse trail and contact copy
const Connect = () => {
  return (
    <section className="contact-page">
      <TrailContainer />

      <div className="contact-copy">
        <div className="contact-copy-main">
          <Copy animateOnScroll={false} delay={0.65}>
            <div className="contact-col-copy">
              <h6 className="contact-header type-2">Deadlock Studios</h6>
              <h6 className="type-2">Tokyo / Berlin</h6>
              <h6 className="type-2">Unit 09, Bunker Lane</h6>
              <h6 className="type-2">52.5200 / 13.4050</h6>
              <h6 className="type-2">DE-7X01</h6>
            </div>

            <div className="contact-col-copy">
              <h6 className="type-2">Open a channel</h6>
              <h6 className="type-2">signal@deadlockstudios.com</h6>
              <h6 className="type-2">Instagram / YouTube / X</h6>
              <h6 className="type-2">+(49) 301 708 0091</h6>
            </div>
          </Copy>
        </div>

        <div className="contact-copy-footer">
          <Copy animateOnScroll={false} variant="flicker" delay={1}>
            <div className="container">
              <p className="mono">&copy; 2025 Deadlock Inc.</p>
              <p className="mono">Developed by BLANK</p>
            </div>
          </Copy>
        </div>
      </div>
    </section>
  );
};

export default Connect;

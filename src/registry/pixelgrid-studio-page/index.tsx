"use client";

/**
 * Pixelgrid Studio Page - a source-backed port of a vanilla-JS design-studio
 * marketing site: a generative pixel-field hero (cursor charge/detonate,
 * idle Pac-Man wander, decode-to-text headline, keyboard easter eggs),
 * springy drag carousels, cursor-tracking smiley faces, a diamond-tessellation
 * "protocol" visualization, a double-helix process flow, and a fully
 * playable Tetris game hidden in the footer. All content is original
 * BLANK copy; case-study media is generative canvas art (thermal/dots/
 * fluid/reveal) in place of real client footage.
 *
 * BLANK - aryank.space
 */

import { type CSSProperties, useEffect, useRef } from "react";
import { initCarousels } from "./scripts/carousel";
import { initFlowCanvases } from "./scripts/flow-canvases";
import { initFooterTetris } from "./scripts/footer-tetris";
import { initHeroField } from "./scripts/hero-field";
import { initHoverCrumble } from "./scripts/hover-crumble";
import { initMiscUi } from "./scripts/misc-ui";
import { initPreviewFx } from "./scripts/preview-fx";
import { initProcessViz } from "./scripts/process-viz";
import { initReveals } from "./scripts/reveals";
import { getPixelgridStudioPageStyles } from "./styles";

const B_MARK: [number, number][] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [0, 1],
  [4, 1],
  [0, 2],
  [4, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
  [0, 4],
  [4, 4],
  [0, 5],
  [4, 5],
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
];

type WorkCard = { title: string; desc: string; fx: string };
const WORK: WorkCard[] = [
  {
    title: "Solace Agent",
    desc: "The launch landing page for an autonomous coding agent that ships its own pull requests.",
    fx: "kv",
  },
  {
    title: "Waypoint Robotics",
    desc: "Brand refresh and site rebuild with new 3D assets and a full design system.",
    fx: "thermal",
  },
  {
    title: "Northline",
    desc: "A playful brand site that turns dense data into something with actual character.",
    fx: "dots",
  },
  {
    title: "Lucent Optics",
    desc: "A platform with the same precision as the hardware: a new palette, a technical type system, and custom 3D renders.",
    fx: "reveal",
  },
  {
    title: "Anchor Health",
    desc: "Two offline WebGL kiosks for a hospital tour, localised and built to run all day on a showroom floor.",
    fx: "fluid",
  },
  {
    title: "Clearwell",
    desc: "A microsite for a serum launch that takes on skincare myths and just tells the truth instead.",
    fx: "lab",
  },
  {
    title: "Farfield",
    desc: "A WebGL journey through space to find hidden stars, turning a wall of rare diseases into something you can hold in your head.",
    fx: "kv",
  },
  {
    title: "Solum",
    desc: "A new brand and an immersive site with a headless pre-order flow, for the athlete underneath the gear.",
    fx: "thermal",
  },
  {
    title: "Amberglass",
    desc: "A brand refresh for a wellness label: a new palette, refined type, and a system the whole team can run with.",
    fx: "dots",
  },
];

type LabCard = {
  title: string;
  desc: string;
  fx: string;
  tags: { cls: string; label: string }[];
};
const LAB: LabCard[] = [
  {
    title: "Field Week",
    desc: "A complete event site in 1.5 weeks with 1.5 designers. Proof that taste is what makes the tools worth anything.",
    fx: "kv",
    tags: [
      { cls: "claude", label: "Claude" },
      { cls: "weave", label: "Design tool" },
      { cls: "framer", label: "Framer" },
    ],
  },
  {
    title: "Very Fluffy",
    desc: "We asked how fluffy we could make it. The answer: very.",
    fx: "fluid",
    tags: [
      { cls: "claude", label: "Claude" },
      { cls: "comfy", label: "Comfy" },
    ],
  },
  {
    title: "Active Heads",
    desc: "Playing with an open-source avatar library, pushed somewhere it wasn't built to go.",
    fx: "dots",
    tags: [
      { cls: "claude", label: "Claude" },
      { cls: "aframe", label: "Design tool" },
    ],
  },
  {
    title: "Asset Pipeline",
    desc: "Turning generative chaos into a repeatable system, finished with a dither heatmap.",
    fx: "reveal",
    tags: [
      { cls: "comfy", label: "Comfy" },
      { cls: "replit", label: "Replit" },
    ],
  },
];

const ArrowIcon = () => (
  <svg
    className="ar"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export interface PixelgridStudioPageProps {
  className?: string;
  style?: CSSProperties;
}

export default function PixelgridStudioPage({
  className,
  style,
}: PixelgridStudioPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups = [
      initHeroField(root),
      initReveals(root),
      initCarousels(root),
      initPreviewFx(root),
      initHoverCrumble(root),
      initProcessViz(root),
      initFlowCanvases(root),
      initMiscUi(root),
      initFooterTetris(root),
    ];
    return () => {
      for (const c of cleanups) c();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={["pixelgrid-studio-page", className].filter(Boolean).join(" ")}
      style={style}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: scoped component stylesheet, no user input
        dangerouslySetInnerHTML={{ __html: getPixelgridStudioPageStyles() }}
      />
      <canvas id="hero-kv" />
      <div className="pgs-content">
        <svg
          width="0"
          height="0"
          style={{ position: "absolute" }}
          aria-hidden="true"
        >
          <symbol id="pgs-mark" viewBox="0 0 5 7">
            {B_MARK.map(([x, y]) => (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill="#0A0A0A"
              />
            ))}
          </symbol>
        </svg>

        <div className="pxctl" id="pxctl">
          <span className="lbl">Cell</span>
          <button type="button" data-cell="22">
            L
          </button>
          <button type="button" data-cell="14">
            M
          </button>
          <button type="button" data-cell="9" className="on">
            S
          </button>
          <span className="lbl">Brush</span>
          <button type="button" data-brush="16">
            L
          </button>
          <button type="button" data-brush="10" className="on">
            M
          </button>
          <button type="button" data-brush="7">
            S
          </button>
        </div>

        <a
          className="toplink"
          id="toplink"
          href="https://ui.aryank.space"
          target="_blank"
          rel="noopener noreferrer"
        >
          View the registry <ArrowIcon />
        </a>

        <main id="top">
          <section className="hero" id="hero">
            <div className="hhead">
              <div className="hgrid">
                <h1 className="hl">
                  <span className="ln">
                    <span>Pixels,</span>
                  </span>
                  <span className="ln">
                    <span>engineered.</span>
                  </span>
                </h1>
                <div className="hcol">
                  <p className="hdesc">
                    <span className="ln">
                      <span>A design &amp; engineering</span>
                    </span>
                    <span className="ln">
                      <span>practice for interface builders</span>
                    </span>
                  </p>
                  <div className="hfoot">
                    <span className="wlogo">
                      <svg
                        width="34"
                        height="18"
                        viewBox="-1 -1 7 9"
                        aria-hidden="true"
                      >
                        <use href="#pgs-mark" />
                      </svg>
                    </span>
                    <p className="htag">
                      Installable components, built with craft and care, one
                      pixel grid at a time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="intro" style={{ marginTop: "-24vh" }}>
            <div className="wrap">
              <p className="lead">
                A short point of view from us on what actually changed in how we
                build interfaces and how the parts that matter didn't change at
                all. But first, here's some work:
              </p>
            </div>
          </section>

          <section className="caro" id="work">
            <div className="track-wrap" data-slider>
              <div className="track">
                {WORK.map((w) => (
                  <a
                    key={w.title}
                    className="slide cs"
                    href="#work"
                    data-fx={w.fx}
                  >
                    <div className="csm">
                      <canvas />
                    </div>
                    <p className="t">{w.title}</p>
                    <p className="d">{w.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <div className="sheet">
            <section className="ed" id="origin">
              <div className="wrap">
                <div className="head reveal">
                  <h2>A hundred-year-old idea, still the standard.</h2>
                  <p className="kick mono">Where the discipline comes from</p>
                </div>
                <div className="reveal">
                  <p>
                    In 1903 a group of Viennese artists and craftspeople founded
                    the Wiener Werkstätte and put every discipline under one
                    roof: furniture, type, posters, whole buildings, all of it
                    held to the same standard.
                  </p>
                  <p>
                    Their idea was simple to the point of stubbornness: the
                    things people use every day deserve as much care as the
                    things that hang in a gallery. So they kept the makers close
                    and refused to let anything half-finished out the door.
                  </p>
                  <p className="s">
                    We work much the same way. One team, one set of eyes, and
                    nothing left to run on its own.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="sheet">
            <section className="ed" id="shift">
              <div className="wrap">
                <div className="head reveal">
                  <h2>AI is good at everything except the last 10 percent.</h2>
                  <p className="kick mono">What changed</p>
                </div>
                <div className="reveal">
                  <p>
                    The tools are very good now, and everyone has the same ones.
                    A first draft, ten variations, working code: what used to
                    take a week takes an afternoon.
                  </p>
                  <p>
                    Which is why volume stopped being the hard part. Point a
                    model at a blank page and it hands back the average of
                    everything it has already seen. Competent enough, and
                    instantly forgettable.
                  </p>
                  <div className="two">
                    <div className="c">
                      <svg
                        className="smiley"
                        viewBox="0 0 156 156"
                        data-mood="happy"
                        data-base="#d8ff00"
                        aria-hidden="true"
                      />
                      <div className="l mono">Brilliant at</div>
                      <p>
                        Producing a lot of work quickly, and getting a rough
                        first version of almost anything in front of you.
                      </p>
                    </div>
                    <div className="c">
                      <svg
                        className="smiley"
                        viewBox="0 0 156 156"
                        data-mood="sad"
                        data-base="#3b5bd9"
                        aria-hidden="true"
                      />
                      <div className="l mono">Hopeless at</div>
                      <p>
                        Knowing which of those versions is actually any good,
                        and having the nerve to throw the rest away.
                      </p>
                    </div>
                  </div>
                  <p className="s" style={{ marginTop: "1.2em" }}>
                    And that last ten percent is where the real work lives. It
                    still takes 90 percent of the effort, and it's the part you
                    have to do yourself.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="proc" id="process">
            <div className="wrap">
              <div className="ph reveal">
                <h2 data-blobarrow="true">
                  Explore. Generate.
                  <br />
                  Refine. Scale.
                </h2>
                <div className="phx">
                  <p className="pd">
                    The machine makes the options, we make the calls. In
                    practice that works out to roughly 60 percent exploring, 20
                    building, 20 refining.
                  </p>
                </div>
              </div>
              <div className="procflow reveal">
                <canvas id="procflow" />
              </div>
              <div className="donuts reveal">
                {[
                  {
                    n: "01",
                    t: "Explore",
                    d: "We can go further than we used to, and faster: interactions and shader code, not just static layouts.",
                    k: "explore",
                  },
                  {
                    n: "02",
                    t: "Generate",
                    d: "It rarely lands first try, so we curate and keep tuning the prompt and the inputs until it does.",
                    k: "generate",
                  },
                  {
                    n: "03",
                    t: "Refine",
                    d: "We keep what's working, fix what isn't, and take it the rest of the way.",
                    k: "refine",
                  },
                  {
                    n: "04",
                    t: "Scale",
                    d: "Once something works, it becomes a system we can reuse.",
                    k: "scale",
                  },
                ].map((s) => (
                  <div className="step" key={s.n}>
                    <div className="dl">
                      <span className="dn">{s.n}</span>
                      <span className="dt">{s.t}</span>
                    </div>
                    <div className="donut">
                      <canvas data-viz={s.k} />
                    </div>
                    <p className="dd">{s.d}</p>
                    <span className="pxline" aria-hidden="true">
                      <i />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="sheet">
            <section className="ed" id="protocol">
              <div className="wrap">
                <div className="head reveal">
                  <h2>The Component Context Protocol.</h2>
                  <p className="kick mono">We make interfaces AI ready</p>
                </div>
                <div className="reveal">
                  <p>
                    <strong>Our first product.</strong> Every registry we ship
                    ends up with one: a single source that holds the voice, the
                    design and the rules, written so a person and an AI can both
                    use it. It's what we generate from, and what we check
                    everything against. The four parts below are how it works.
                  </p>
                  <a className="btn" href="#protocol-parts">
                    Read the full story
                  </a>
                </div>
              </div>
            </section>
          </div>

          <section className="proc bcp-parts" id="protocol-parts">
            <div className="wrap">
              <div className="reveal">
                <div className="procflow">
                  <canvas id="bcp-flowviz" />
                </div>
                <div className="donuts">
                  {[
                    {
                      n: "01",
                      t: "Component Truth",
                      d: "The one place that holds the voice, the design and the rules we build everything from.",
                      k: "truth",
                    },
                    {
                      n: "02",
                      t: "Skills",
                      d: "A job the system has been taught to do your way, ready whenever you ask for it.",
                      k: "skills",
                    },
                    {
                      n: "03",
                      t: "Output",
                      d: "The finished work, drawn from Component Truth and on-brand the moment it arrives.",
                      k: "output",
                    },
                    {
                      n: "04",
                      t: "Check",
                      d: "A score on every output, and what it learns goes back into the source.",
                      k: "check",
                    },
                  ].map((s) => (
                    <div className="step" key={s.n}>
                      <div className="dl">
                        <span className="dn">{s.n}</span>
                        <span className="dt">{s.t}</span>
                      </div>
                      <div className="donut">
                        <canvas data-viz={s.k} />
                      </div>
                      <p className="dd">{s.d}</p>
                      <span className="pxline" aria-hidden="true">
                        <i />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="sheet">
            <section className="ed" id="ai">
              <div className="wrap">
                <div className="head reveal">
                  <h2>Move your organisation up the levels of AI.</h2>
                  <p className="kick mono">Passing on our learnings</p>
                </div>
                <div className="reveal">
                  <p>
                    This is the other half of what we do. We're a design and
                    engineering practice working with AI every day, on our own
                    components and our clients', and most of what we've learned
                    is teachable. So we pass it on: pilots that prove a real use
                    case, hands-on workshops, upskilling for your team, and the
                    change management that makes any of it stick.
                  </p>
                  <p>
                    It starts with where you actually are. AI adoption has
                    levels, a bit like self-driving cars: at one end someone is
                    pasting prompts into a chat window, at the other a system
                    runs whole jobs on its own. Most teams are idling in the
                    assisted-parking phase, and we help you move up a level at a
                    time, so the tools compound instead of gathering dust after
                    the demo.
                  </p>
                  <ul className="pts">
                    <li>
                      <span className="n mono">L1</span>
                      <span>
                        <b>Chats.</b> People prompt by hand. Helpful, but
                        nothing compounds.
                      </span>
                    </li>
                    <li>
                      <span className="n mono">L3</span>
                      <span>
                        <b>Workflows.</b> A task done the same good way every
                        time, with a human reviewing.
                      </span>
                    </li>
                    <li>
                      <span className="n mono">L5</span>
                      <span>
                        <b>Agents.</b> Whole jobs run end to end, while people
                        stay on the calls that matter.
                      </span>
                    </li>
                  </ul>
                  <p className="s">
                    We know where the line is, and we'll happily talk you out of
                    the AI idea that's going to embarrass you in six months.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="caro" id="lab">
            <div
              className="ch reveal"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "calc(var(--cell)*1.5)",
              }}
            >
              <h2 style={{ maxWidth: "18ch" }} data-blobarrow="true">
                The tools are everywhere. The judgment isn't.
              </h2>
              <p
                style={{
                  maxWidth: "62ch",
                  margin: 0,
                  color: "#2a2a2a",
                  fontSize: "clamp(15px,1.15vw,18px)",
                  lineHeight: 1.62,
                }}
              >
                For our team, AI has turned into a new layer of expression. The
                craft isn't new, but it used to need an engineer in the loop.
                Now a designer can build real interactions, motion, and shader
                work directly, which lets us take a project somewhere more
                distinctive than a static screen ever could.
              </p>
            </div>
            <div className="track-wrap" data-slider>
              <div className="track">
                {LAB.map((l) => (
                  <a
                    key={l.title}
                    className="slide cs"
                    href="#lab"
                    data-fx={l.fx}
                  >
                    <div className="csm">
                      <canvas />
                    </div>
                    <p className="t">{l.title}</p>
                    <p className="d">{l.desc}</p>
                    <div className="tags">
                      {l.tags.map((tag) => (
                        <span key={tag.cls} className={tag.cls}>
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="cta" id="contact">
            <div className="wrap">
              <a className="ctabtn reveal" href="mailto:hello@aryank.space">
                Get in touch
              </a>
              <p className="meta reveal">
                We're a small, remote team scattered across a few time zones, so
                the odds are decent someone's awake near you. Small by design,
                always happiest with a good problem to solve.
              </p>
              <p
                className="meta near reveal"
                id="nearest"
                style={{ display: "none" }}
              />
              <p className="meta reveal">
                <a href="mailto:hello@aryank.space">hello@aryank.space</a>
              </p>
            </div>
          </section>
        </main>

        <footer>
          <canvas id="footcity" />
          <button className="tt-teaser" type="button" aria-label="play tetris">
            play{" "}
            <span className="tt-blocks" aria-hidden="true">
              <canvas id="ttpieces" />
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}

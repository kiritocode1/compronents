"use client";

/**
 * Option three — a replica of the selected reference layout, rewritten for
 * Moneybee.
 *
 * Structure and class names follow the reference exactly so that
 * `option-three.css`, which is the reference's own stylesheet scoped to this
 * page, applies without translation. Plain `<img>` is deliberate: the vendored
 * rules size images through their wrappers, and next/image's extra element
 * would sit between the two and break that.
 *
 * Motion lives in `components/option-three/motion.ts`.
 */

import { useEffect, useRef, useState } from "react";
import {
  BRAND_LOGOS,
  FAQS,
  FEEDBACK_A,
  FEEDBACK_B,
  FOOTER_COLUMNS,
  GROWTH,
  NAV_HOME,
  NAV_INNER,
  NAV_LINKS,
  NAV_MAIN,
  NAV_UTILITY,
  PLANS_PERFORMANCE,
  PLANS_STANDARD,
  POSTS,
  PROJECTS,
  SERVICES,
  STATISTICS,
} from "./content";
import { initOptionThreeMotion } from "./motion";
import { getMoneybeeEditorialPageStyles } from "./styles";

/**
 * The reference's five button shapes.
 *
 * Every one of them works the same way: the label is duplicated inside a
 * fixed-height, overflow-hidden wrapper, and hover slides the pair up by half
 * its height so the second copy takes the first one's place. The arrow, where
 * there is one, slides a full width sideways in its own clipped box. Nothing
 * here is decorative — the doubled markup *is* the animation, so the copies
 * must stay identical.
 *
 * Hover motion itself lives in `motion.ts` alongside the rest of the timeline
 * work, which is why these components carry classes but no handlers.
 */

type ButtonProps = {
  children: string;
  href?: string;
  className?: string;
};

/** Pill with a phone glyph. `tone` picks the reference's purple or white fill. */
function CtaButton({
  children,
  href = "#contact",
  tone = "purple",
}: ButtonProps & { tone?: "purple" | "white" }) {
  const purple = tone === "purple";
  return (
    <a
      href={href}
      className={`cta-button w-inline-block${purple ? " is-purple" : ""}`}
    >
      <img
        src="https://ui.aryank.space/assets/moneybee-editorial-page/call.svg"
        loading="lazy"
        alt=""
        className="call"
      />
      <div className={`cta-button-text-wrap${purple ? " is-purple" : ""}`}>
        <div className="cta-button-text-group">
          <div className="button-01-text">{children}</div>
          <div className="button-01-text">{children}</div>
        </div>
      </div>
    </a>
  );
}

/** Outlined pill that fills purple on hover. `icon={false}` drops the arrow. */
function ButtonOne({
  children,
  href = "#contact",
  icon = true,
}: ButtonProps & { icon?: boolean }) {
  return (
    <a href={href} className="button-01 w-inline-block">
      <div className={`button-01-arrow-wrap${icon ? "" : " is-textonly"}`}>
        <div className="button-01-arrow-group">
          <img
            src="https://ui.aryank.space/assets/moneybee-editorial-page/arrow.svg"
            loading="lazy"
            alt=""
            className="button-01-arrow"
          />
          <img
            src="https://ui.aryank.space/assets/moneybee-editorial-page/arrow.svg"
            loading="lazy"
            alt=""
            className="button-01-arrow"
          />
        </div>
      </div>
      <div className="button-01-text-wrap">
        <div className="button-01-text-group">
          <div className="button-01-text">{children}</div>
          <div className="button-01-text">{children}</div>
        </div>
      </div>
    </a>
  );
}

/** Solid black pill that turns yellow on hover; the arrow inverts with it. */
function ButtonTwo({
  children,
  href = "#contact",
  icon = true,
}: ButtonProps & { icon?: boolean }) {
  return (
    <a href={href} className="button-02 w-inline-block">
      <div className={`button-02-arrow-wrap${icon ? "" : " is-textonly"}`}>
        <div className="button-02-arrow-group">
          <img
            src="https://ui.aryank.space/assets/moneybee-editorial-page/arrow.svg"
            loading="lazy"
            alt=""
            className="button-02-arrow"
          />
          <img
            src="https://ui.aryank.space/assets/moneybee-editorial-page/arrow-white.svg"
            loading="lazy"
            alt=""
            className="button-02-arrow"
          />
        </div>
      </div>
      <div className="button-02-text-wrap">
        <div className="button-02-text-group">
          <div className="button-01-text text-white">{children}</div>
          <div className="button-01-text">{children}</div>
        </div>
      </div>
    </a>
  );
}

/**
 * Inline text link. Lives inside a card that is itself a link, so it renders as
 * a div — an anchor here would nest interactive elements.
 */
function ButtonThree({ children }: { children: string }) {
  return (
    <div className="button-03">
      <img
        src="https://ui.aryank.space/assets/moneybee-editorial-page/arrow.svg"
        loading="lazy"
        alt=""
        className="button-03-arrow"
      />
      <div className="button-01-text">{children}</div>
      <div className="button-underline" />
    </div>
  );
}

/** The compact navbar pill. */
function ButtonFour({ children, href = "#contact" }: ButtonProps) {
  return (
    <a href={href} className="button-04 w-inline-block">
      <div className="button-04-text-wrap">
        <div className="button-04-text-group">
          <div className="button-02-text text-white">{children}</div>
          <div className="button-02-text">{children}</div>
        </div>
      </div>
    </a>
  );
}

/**
 * The Moneybee lockup.
 *
 * The reference ships its logo as a flat SVG: an abstract mark beside a
 * wordmark drawn as outlines. Reusing that file wholesale would leave the
 * template's name on the page, so the mark is kept as a path and the wordmark
 * is set as live text instead — which also means it renders in the page's own
 * Inter Tight rather than in someone else's outlines.
 *
 * Proportions are taken from the original 120x45 artboard so the lockup keeps
 * the same optical weight inside the 110px brand slot.
 */

const MARK =
  "M16.3703 21.5529C14.7684 20.1369 12.5357 19.622 10.0254 19.622V13.3594C13.2227 13.3594 17.2684 13.9881 20.5181 16.8608C21.3832 17.6255 22.1502 18.5116 22.8115 19.5248V13.3594C26.0088 13.3594 30.0545 13.9881 33.3042 16.8608C36.6243 19.7957 38.4997 24.5169 38.4997 31.358H32.237C32.237 25.619 30.6878 22.9066 29.1564 21.5529C27.568 20.1488 25.3592 19.6307 22.8745 19.6221C24.7111 22.4879 25.7135 26.3564 25.7135 31.358H19.4509C19.4509 25.619 17.9016 22.9066 16.3703 21.5529ZM10.1221 23.3467C10.0776 23.3191 10.0425 23.2974 10.0227 23.2849C10.003 23.2974 9.96784 23.3191 9.92334 23.3467C9.76083 23.4475 9.4732 23.6259 9.35071 23.7119C9.03912 23.9306 8.62274 24.2488 8.20525 24.6462C7.38211 25.4298 6.5 26.5734 6.5 27.9056C6.5 29.8138 8.07718 31.3608 10.0227 31.3608C11.9683 31.3608 13.5455 29.8138 13.5455 27.9056C13.5455 26.5734 12.6633 25.4298 11.8402 24.6462C11.4227 24.2488 11.0064 23.9306 10.6948 23.7119C10.5723 23.6259 10.2846 23.4475 10.1221 23.3467Z";

function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span
      aria-hidden="true"
      className="navbar-brand-logo"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        // The original artboard is 120x45 and the navbar is sized by it: the
        // brand's height sets the bar's height, its width sets where the menu
        // starts. "Moneybee." is two glyphs longer than the name it replaces,
        // so the lockup is scaled to fit the box rather than allowed to resize
        // it.
        width: "120px",
        height: "45px",
        color:
          tone === "dark" ? "var(--colors--black)" : "var(--colors--white)",
      }}
    >
      <svg
        viewBox="10 13 29 19"
        width="22"
        height="14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flex: "none" }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={MARK}
          fill="var(--colors--light-purple)"
        />
      </svg>
      <span
        style={{
          fontSize: "19px",
          lineHeight: 1,
          fontWeight: 600,
          letterSpacing: "var(--letter-spacing--letter-spacing-2)",
        }}
      >
        Moneybee.
      </span>
    </span>
  );
}

/**
 * The `w-` classes below are not decoration. Webflow's widget stylesheet is
 * what makes a dropdown a dropdown — `w-dropdown` establishes the positioning
 * context, `w-dropdown-list` takes the panel out of flow, `w-inline-block`
 * keeps links from stretching. Dropping them collapses the whole navbar into
 * the page flow, so they stay even though the behaviour is ours.
 */

type Item = { readonly label: string; readonly href: string };

/** A dropdown row: label plus the underline that wipes in from the left. */
function DropdownMenu({ item }: { item: Item }) {
  return (
    <a href={item.href} className="dropdown-menu w-inline-block">
      <div className="paragraph-02 text-dark-gray">{item.label}</div>
      <div className="menu-underline" />
    </a>
  );
}

function DropdownColumn({
  title,
  items,
}: {
  title: string;
  items: readonly Item[];
}) {
  return (
    <div className="dropdown-column">
      <div className="dropdown-menu-wrap">
        <div className="dropdown-title-wrap">
          <h6 className="paragraph-02">{title}</h6>
        </div>
        <div className="dropdown-menu-list">
          {items.map((item) => (
            <DropdownMenu key={item.label} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** The three-column panel behind "Pages", reused by the mobile menu. */
function PagesPanel() {
  return (
    <nav className="nav-dropdown-list w-dropdown-list">
      <div className="dropdown-list-wrap">
        <div className="dropdown-wrap">
          <DropdownColumn title="Main" items={NAV_MAIN} />
          <DropdownColumn title="Investors" items={NAV_INNER} />
          <DropdownColumn title="Regulatory" items={NAV_UTILITY} />
        </div>
      </div>
    </nav>
  );
}

function DropdownToggle({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="dropdown-toggle w-dropdown-toggle"
      aria-haspopup="true"
      style={{ background: "none", border: 0 }}
    >
      <div className="icon w-icon-dropdown-toggle" />
      <div>{label}</div>
    </button>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  const brand = (
    <a
      href="#top"
      aria-label="Moneybee home"
      className="navbar-brand w-inline-block"
    >
      <Logo />
    </a>
  );

  return (
    <section className="navbar">
      <div className="nav-container">
        <div className="navbar-wrap">
          <div className="navbar-desktop-wrap">
            <div className="navbar-desktop-left">
              {brand}
              <div className="nav-left-menu-wrap">
                <div className="nav-dropdown w-dropdown">
                  <DropdownToggle label="Home" />
                  <nav className="nav-dropdown-list _02 w-dropdown-list">
                    <div className="dropdown-list-wrap">
                      <div className="dropdown-wrap small">
                        <div className="dropdown-column">
                          <div className="dropdown-menu-wrap">
                            <div className="dropdown-menu-list">
                              {NAV_HOME.map((item) => (
                                <DropdownMenu key={item.label} item={item} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </nav>
                </div>
                {NAV_LINKS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="nav-menu w-inline-block"
                  >
                    <div className="paragraph-02">{item.label}</div>
                    <div className="menu-underline" />
                  </a>
                ))}
                <div className="nav-divider" />
              </div>
            </div>
            <div className="navbar-desktop-right">
              <div className="nav-dropdown w-dropdown">
                <DropdownToggle label="Pages" />
                <PagesPanel />
              </div>
              <ButtonFour>Contact Us</ButtonFour>
            </div>
          </div>

          <div className={`navbar-mobile-wrap${open ? " is-open" : ""}`}>
            <div className="navbar-top-wrap">
              {brand}
              <div className="navbar-right">
                <button
                  type="button"
                  className="navbar-menu-box"
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                  onClick={() => setOpen((value) => !value)}
                >
                  {/* Stands in for the reference's Lottie burger, whose three
                      layers are named top, middle and bottom. */}
                  <span className="hamburger" aria-hidden="true">
                    <span className="hamburger-bar" />
                    <span className="hamburger-bar" />
                    <span className="hamburger-bar" />
                  </span>
                </button>
              </div>
            </div>
            <div className="mobile-dropdown-wrap">
              {[{ label: "Home", href: "#top" }, ...NAV_LINKS].map((item) => (
                <div key={item.label} className="mobile-dropdown-list">
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="mobile-menu paragraph-02"
                  >
                    {item.label}
                  </a>
                </div>
              ))}
              <div className="mobile-dropdown-list pages">
                {/* The reference gives the menu's own dropdown a different
                    class from the two in the desktop bar; the panel styling
                    hangs off it. */}
                <div className="dropdown w-dropdown">
                  <DropdownToggle label="Pages" />
                  <PagesPanel />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pill above a section heading. */
function SectionBadge({
  children,
  position = false,
}: {
  children: string;
  position?: boolean;
}) {
  return (
    <div className={`section-badge-wrap${position ? " position" : ""}`}>
      <div className="section-badge">
        <div className="badge-dot" />
        <div className="tagline">{children}</div>
      </div>
    </div>
  );
}

/** Heading split black/grey, the reference's signature two-tone treatment. */
function SplitHeading({
  lead,
  tail,
  center = false,
}: {
  lead: string;
  tail: string;
  center?: boolean;
}) {
  return (
    <h2 className={`section-heading${center ? " text-center" : ""}`}>
      {lead} <span className="text-light-gray">{tail}</span>
    </h2>
  );
}

function FeedbackItem({
  item,
}: {
  item: { name: string; role: string; image: string; quote: string };
}) {
  return (
    <div className="feedback-item">
      <div className="feedback-author-wrap">
        <img
          src={item.image}
          loading="lazy"
          alt=""
          className="feedback-author-image"
        />
        <div className="feedback-author-info">
          <h4 className="h4">{item.name}</h4>
          <div className="paragraph-02 text-dark-gray">{item.role}</div>
        </div>
      </div>
      <div className="feedback-details">
        <h4 className="h4">{item.quote}</h4>
      </div>
    </div>
  );
}

/**
 * One marquee column.
 *
 * Two levels of repetition, both load-bearing. Each list runs its quotes twice
 * so a single list is taller than the column and the strip never empties
 * mid-travel; then the whole list is rendered twice so that moving both by
 * exactly one list height lands the duplicate where the original began, and the
 * loop has no visible seam.
 */
function FeedbackColumn({
  items,
  variant,
}: {
  items: { name: string; role: string; image: string; quote: string }[];
  variant: "_01" | "_03";
}) {
  const list = variant === "_01" ? "_01" : "_02";
  return (
    <div className={`feedback-column ${variant}`}>
      <div className="feedback-marquee-wrap">
        {[0, 1].map((copy) => (
          <div key={copy} className={`feedback-list ${list}`}>
            {[...items, ...items].map((item, index) => (
              <FeedbackItem key={`${copy}-${index}`} item={item} />
            ))}
          </div>
        ))}
      </div>
      <div className="feedback-shadow-top" />
      <div className="feedback-shadow-bottom" />
    </div>
  );
}

/** Slot-machine digit pair. Ten numerals per strip, one line visible. */
function Statistic({
  upper,
  lower,
  suffix,
  label,
}: {
  upper: string;
  lower: string;
  suffix: string;
  label: string;
}) {
  return (
    <div className="feedback-statistics-list">
      <div className="statistics-number-wrap">
        <div className="statistics-number-box upper">
          {[...upper].map((digit, index) => (
            <h2 key={index} className="h2">
              {digit}
            </h2>
          ))}
        </div>
        <div className="statistics-number-box lower">
          {[...lower].map((digit, index) => (
            <h2 key={index} className="h2">
              {digit}
            </h2>
          ))}
        </div>
        <h2 className="h2">{suffix}</h2>
      </div>
      <div className="paragraph-02 text-dark-gray">{label}</div>
    </div>
  );
}

/**
 * A row that animates open to the height of its own answer.
 *
 * The reference animates to `height: auto`, which its engine resolves to a
 * pixel value at runtime. Measuring the answer and setting that number does the
 * same thing, and leaves the transition on the CSS `ease` curve the source uses.
 */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = answerRef.current;
    if (!element) return;
    const sync = () => setHeight(open ? element.scrollHeight : 0);
    sync();
    if (!open) return;
    // An open row has a fixed height, so it has to be re-measured if the answer
    // reflows underneath it — on resize, or when the font finally swaps in.
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open]);

  return (
    <div className={`faq-item${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="faq-question-wrap"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="text-style-h3 faq-question">{question}</div>
        <div className="faq-arrow-block">
          <div className="arrow-horizontal-line" />
          <div className="arrow-vertical-line" />
        </div>
      </button>
      <div className="faq-answer-wrap" style={{ height }}>
        <div ref={answerRef}>
          <div className="paragraph-02 faq-answer">{answer}</div>
        </div>
      </div>
    </div>
  );
}

function PlanList({
  plans,
  hidden,
}: {
  plans: typeof PLANS_STANDARD;
  hidden: boolean;
}) {
  return (
    <div className={`plan-list${hidden ? " is-hidden" : ""}`}>
      {plans.map((plan, index) => (
        <div
          key={plan.title}
          className={`plan-item${plan.featured ? " card-02" : ""}${index === 2 ? " _03" : ""}`}
        >
          <div className="plan-top-wrap">
            <div className="plan-info-wrap">
              <img
                loading="lazy"
                src={plan.icon}
                alt=""
                className="plan-icon"
              />
              <div className={`plan-badge${plan.featured ? " _02" : ""}`}>
                <div className="tagline text-center">{plan.badge}</div>
              </div>
            </div>
            <div className="plan-text-wrap">
              <h3>{plan.title}</h3>
              <div className="paragraph-02 text-dark-gray">{plan.copy}</div>
            </div>
            <div className="plan-price-wrap">
              <h2>{plan.price}</h2>
              <div className="paragraph-02 plan-duration">{plan.duration}</div>
            </div>
          </div>
          <div className="plan-bottom-wrap">
            <h2 className="h5">What is included:</h2>
            <div className="plan-features-wrap">
              {plan.features.map((feature) => (
                <div key={feature} className="plan-features-list">
                  <img
                    loading="lazy"
                    src="https://ui.aryank.space/assets/moneybee-editorial-page/tick-circle.svg"
                    alt=""
                    className="plan-check"
                  />
                  <div className="paragraph-02 text-dark-gray">{feature}</div>
                </div>
              ))}
            </div>
            <div className="plan-button-wrap">
              {/* The emphasised card gets the solid button, as in the reference. */}
              {plan.featured ? (
                <ButtonTwo icon={false}>Start a conversation</ButtonTwo>
              ) : (
                <ButtonOne icon={false}>Start a conversation</ButtonOne>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MoneybeeEditorialPage() {
  const root = useRef<HTMLDivElement>(null);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // `?motion=off` renders the resting layout with no transforms applied,
    // which is what the layout comparison against the reference reads.
    if (new URLSearchParams(window.location.search).get("motion") === "off")
      return;
    return initOptionThreeMotion(scope);
  }, []);

  return (
    <div ref={root} className="option-three page-wrapper" id="top">
      <style>{getMoneybeeEditorialPageStyles()}</style>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="hero">
        <Navbar />
        <div className="hero-wrap">
          <div className="container hero-container">
            <div className="hero-main-wrap">
              <div className="hero-content-wrap">
                <div className="hero-header-wrap">
                  <div className="badge">
                    <img
                      src="https://ui.aryank.space/assets/moneybee-editorial-page/magic-wand.svg"
                      loading="lazy"
                      alt=""
                      className="badge-icon"
                    />
                    <div className="tagline">
                      Portfolio Management &amp; AIF
                    </div>
                  </div>
                  <div className="hero-text-wrap">
                    <div className="hero-heading-wrap">
                      <h1 className="home-hero-heading">
                        We help long-term investors grow with{" "}
                        <span className="text-light-gray">
                          research the market overlooks
                        </span>
                      </h1>
                    </div>
                    <div className="hero-subtitle-wrap">
                      <div className="paragraph-01 text-dark-gray">
                        Moneybee manages capital through fundamental research,
                        valuation discipline, and the patience to let a sound
                        thesis compound.
                      </div>
                    </div>
                  </div>
                  <div className="hero-button-wrap">
                    <CtaButton>Book a Consultation</CtaButton>
                    <ButtonOne href="#strategies">Our Strategies</ButtonOne>
                  </div>
                </div>
              </div>
              <div className="hero-image-wrap">
                <img
                  src="https://ui.aryank.space/assets/moneybee-editorial-page/hero-image.avif"
                  loading="eager"
                  alt="Two investors reviewing a portfolio together"
                  className="fit-cover hero-image"
                />
                <div className="hero-image-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Brands */}
      <section className="brands is-spaced">
        <div className="container">
          <div className="brands-wrap">
            <div className="section-header-wrap center">
              <div className="section-header-content">
                <div className="section-heading-wrap">
                  <div className="text-style-h5">
                    Registered, audited, and settled through India&rsquo;s
                    market infrastructure
                  </div>
                </div>
              </div>
            </div>
            <div className="brands-main-wrap">
              <div className="brands-marquee">
                {[0, 1].map((copy) => (
                  <div key={copy} className="brands-list">
                    {[...BRAND_LOGOS, ...BRAND_LOGOS].map((logo, index) => (
                      <img
                        key={`${copy}-${index}`}
                        src={logo}
                        loading="lazy"
                        alt=""
                        className="brand"
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="brand-left-shadow" />
              <div className="brand-right-shadow" />
            </div>
            <div className="divider is-bottom" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Services */}
      <section className="services" id="strategies">
        <div className="container">
          <div className="services-wrap">
            <div className="section-header-wrap">
              <div className="section-header-left">
                <SectionBadge>What we do</SectionBadge>
                <div className="section-heading-wrap">
                  <SplitHeading
                    lead="How we put capital to work"
                    tail="with discipline and care"
                  />
                </div>
              </div>
              <div className="section-header-right">
                <div className="paragraph-02 text-dark-gray">
                  Three ways to work with the same research. The mandate
                  changes; the process behind it does not.
                </div>
              </div>
            </div>
            <div className="services-main-wrap">
              {SERVICES.map((service, index) => (
                <div
                  key={service.title}
                  className={`services-card${index === 1 ? " _02" : index === 2 ? " _03" : ""}`}
                >
                  <img
                    src={service.icon}
                    loading="lazy"
                    alt=""
                    className="services-icon"
                  />
                  <div className="services-details">
                    <div className="services-text-wrap">
                      <div className="text-style-h3">{service.title}</div>
                      <div className="paragraph-02 black-text-70">
                        {service.copy}
                      </div>
                    </div>
                    <div className="services-tag-wrap">
                      {service.tags.map((tag) => (
                        <div key={tag} className="services-tag">
                          <div className="tagline">{tag}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- About */}
      <section className="about-01" id="approach">
        <div className="container">
          <div className="about-01-wrap">
            <div className="about-01-header-wrap">
              <div className="section-heading-wrap">
                <SectionBadge position>(Our practice)</SectionBadge>
                <h2 className="section-heading about-01-heading">
                  <span className="about-text-space">We look</span> where
                  institutional research arrives last, and we stay long enough
                  for the business rather than the market to decide the outcome.
                  Every mandate begins with your objectives
                  <span className="text-light-gray">
                    {" "}
                    &mdash; your horizon, your other assets, and what you would
                    find hard to live through &mdash; before a single position
                    is discussed.
                  </span>
                </h2>
              </div>
            </div>
            <div className="about-01-main-wrap">
              <div className="about-01-left">
                <div className="about-01-video-wrap">
                  <div className="image-wrap">
                    <img
                      src="https://ui.aryank.space/assets/moneybee-editorial-page/about-image-01.avif"
                      loading="lazy"
                      alt="The Moneybee research desk"
                      className="fit-cover"
                    />
                  </div>
                </div>
                <div className="about-01-details">
                  <div className="about-01-text-wrap">
                    <div className="paragraph-02 text-dark-gray">
                      Moneybee is a Mumbai-based investment practice with
                      decades of capital-markets experience behind it. Our
                      strength is bottom-up research into businesses that are
                      too small, too dull, or too early to attract a crowd,
                      which is usually where the mispricing sits.
                    </div>
                    <div className="paragraph-02 text-dark-gray">
                      We hold a focused portfolio because a focused portfolio
                      can be explained. Every position has a thesis, a price we
                      were willing to pay, and a reason to remain.
                    </div>
                  </div>
                  <div className="about-01-button-wrap">
                    <ButtonTwo href="#research">More about Moneybee</ButtonTwo>
                  </div>
                </div>
              </div>
              <div className="about-01-right">
                <div className="about-01-image-wrap">
                  <div className="image-wrap">
                    <img
                      src="https://ui.aryank.space/assets/moneybee-editorial-page/about-image-02.avif"
                      loading="lazy"
                      alt="An investor meeting in progress"
                      className="fit-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Research */}
      <section className="project-01" id="research">
        <div className="container">
          <div className="section-header-wrap">
            <div className="section-header-left">
              <SectionBadge>Selected research</SectionBadge>
              <div className="section-heading-wrap">
                <SplitHeading
                  lead="A record of ideas found"
                  tail="before the market noticed"
                />
              </div>
            </div>
            <div className="section-header-right">
              <div className="paragraph-02 text-dark-gray">
                Past positions, described as we described them at the time.
                Holdings shown are illustrative and are not a recommendation.
              </div>
            </div>
          </div>
        </div>
        <div className="project-01-list-wrap">
          {PROJECTS.map((project, index) => (
            <div
              key={project.title}
              className={`project-01-list${index === 1 ? " _02" : ""}`}
            >
              <div className="container">
                <a href="#insights" className="project-01-link w-inline-block">
                  <div className="project-01-item">
                    <div className="project-01-left">
                      <div className="text-style-h4">{project.index}</div>
                      <div className="project-01-details">
                        <div className="project-01-text-wrap">
                          <div className="text-style-h3">{project.title}</div>
                          <div className="paragraph-02 text-dark-gray">
                            {project.copy}
                          </div>
                        </div>
                        <ButtonThree>Read the note</ButtonThree>
                      </div>
                    </div>
                    <div className="project-01-right">
                      <div className="project-01-info-wrap">
                        <div className="project-01-tag-wrap">
                          {project.tags.map((tag) => (
                            <div key={tag} className="project-01-tag">
                              <div className="tagline">{tag}</div>
                            </div>
                          ))}
                        </div>
                        <div className="project-01-year">
                          <div className="tagline">&copy;</div>
                          <div className="tagline">{project.year}</div>
                        </div>
                      </div>
                      <div className="project-01-image-wrap">
                        {project.images.map((image, imageIndex) => (
                          <div
                            key={image}
                            className={`project-01-thumbnail-wrap${
                              imageIndex === 1
                                ? " _02"
                                : imageIndex === 2
                                  ? " _03"
                                  : ""
                            }`}
                          >
                            <div className="image-wrap">
                              <img
                                src={image}
                                loading="lazy"
                                alt=""
                                className="fit-cover"
                              />
                            </div>
                            <div className="project-arrow small">
                              <img
                                src="https://ui.aryank.space/assets/moneybee-editorial-page/arrow-plan.svg"
                                loading="lazy"
                                alt=""
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
        <a href="#insights" className="project-large-link w-inline-block">
          <div className="project-link-arrow-block">
            <div className="project-link-arrow-group">
              <img
                src="https://ui.aryank.space/assets/moneybee-editorial-page/arrow-project.svg"
                loading="lazy"
                alt=""
                className="project-link-arrow"
              />
              <img
                src="https://ui.aryank.space/assets/moneybee-editorial-page/arrow-project.svg"
                loading="lazy"
                alt=""
                className="project-link-arrow"
              />
            </div>
          </div>
          <div className="project-link-text-wrap">
            <div className="project-link-text-group">
              <div className="text-style-h1 project-link-title">
                Read All Research
              </div>
              <div className="text-style-h1 project-link-title">
                Read All Research
              </div>
            </div>
          </div>
        </a>
      </section>

      {/* -------------------------------------------------------------- Growth */}
      <section className="growth">
        <div className="container">
          <div className="growth-wrap">
            <div className="section-header-wrap center">
              <div className="section-header-content">
                <SectionBadge>Where returns come from</SectionBadge>
                <div className="section-heading-wrap space">
                  <SplitHeading
                    lead="A consistent process"
                    tail="across market cycles"
                    center
                  />
                </div>
                <div className="section-subtitle-wrap">
                  <div className="paragraph-02 text-center text-dark-gray">
                    Returns follow from decisions, and decisions follow from a
                    process. Ours has three parts, applied in the same order to
                    every position we take, in every kind of market.
                  </div>
                </div>
              </div>
            </div>
            <div className="growth-main-wrap">
              <div className="growth-circle-wrap">
                {/* Intrinsic dimensions are required here, not optional. The ring
                    is sized `width: 100%` with automatic height, so until the
                    file loads the element is zero-high — and a zero-high lazy
                    image never comes near enough to the viewport to start
                    loading. Declaring the ratio breaks that deadlock and
                    reserves the space besides. */}
                <img
                  src="https://ui.aryank.space/assets/moneybee-editorial-page/circle.avif"
                  width={1174}
                  height={1148}
                  loading="lazy"
                  alt=""
                  className="growth-circle"
                />
                <div className="circle-text-wrap">
                  <div className="text-style-h2 circle-text">
                    Investment
                    <br />
                    Process
                  </div>
                </div>
              </div>
              <div className="growth-list-wrap">
                {GROWTH.map((item, index) => (
                  <div key={item.title} className="growth-list">
                    <div
                      className={`growth-icon-block${index === 1 ? " button-02-text-group" : ""}`}
                    >
                      <img
                        src={item.icon}
                        loading="lazy"
                        alt=""
                        className="growth-icon"
                      />
                    </div>
                    <div
                      className={`growth-details${index === 1 ? " _02" : ""}`}
                    >
                      <div
                        className={`growth-badge-wrap${index === 1 ? " _02" : index === 2 ? " _03" : ""}`}
                      >
                        <div className="tagline text-center">{item.badge}</div>
                      </div>
                      <div className="growth-text-wrap">
                        <div className="text-style-h3">{item.title}</div>
                        <div className="paragraph-02 text-dark-gray">
                          {item.copy}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Feedback */}
      <section className="feedback">
        <div className="container">
          <div className="feedback-wrap">
            <div className="section-header-wrap center">
              <div className="section-header-content medium">
                <SectionBadge>Investor perspective</SectionBadge>
                <div className="section-heading-wrap space">
                  <SplitHeading
                    lead="Trusted by families and institutions"
                    tail="through more than one cycle"
                    center
                  />
                </div>
              </div>
            </div>
            <div className="feedback-main-wrap">
              <FeedbackColumn items={FEEDBACK_A} variant="_01" />
              <div className="feedback-column">
                <div className="ceo-wrap">
                  <div className="ceo-image-wrap">
                    <img
                      src="https://ui.aryank.space/assets/moneybee-editorial-page/ceo-image.avif"
                      loading="lazy"
                      alt=""
                      className="ceo-image"
                    />
                    <div className="ceo-image-shadow" />
                  </div>
                  <div className="ceo-text-wrap">
                    <h4 className="h4 text-center">
                      &ldquo;We would rather be judged on the quality of our
                      reasoning than on any single year. Explain the decision,
                      and the returns can look after themselves.&rdquo;
                    </h4>
                  </div>
                  <div className="feedback-statistics-wrap">
                    {STATISTICS.map((stat) => (
                      <Statistic key={stat.label} {...stat} />
                    ))}
                  </div>
                  <div className="ceo-badge">
                    <div className="tagline text-center">CIO of Moneybee</div>
                  </div>
                </div>
              </div>
              <FeedbackColumn items={FEEDBACK_B} variant="_03" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Pricing */}
      <section className="pricing-01" id="mandates">
        <div className="container">
          <div className="pricing-01-wrap">
            <div className="section-header-wrap">
              <div className="section-header-left">
                <SectionBadge>Mandates</SectionBadge>
                <div className="section-heading-wrap">
                  <SplitHeading
                    lead="Structures built around"
                    tail="objectives, not products"
                  />
                </div>
              </div>
              <div className="section-header-right">
                <div className="paragraph-02 text-dark-gray">
                  Minimums are set by regulation. Everything above them is a
                  conversation about what you are trying to achieve.
                </div>
              </div>
            </div>
            <div className="pricing-01-main-wrap">
              <div className="plan-switch-wrap">
                <div className={`tagline month${yearly ? "" : " is-active"}`}>
                  Fixed fee
                </div>
                <button
                  type="button"
                  className={`plan-switch${yearly ? " is-yearly" : ""}`}
                  role="switch"
                  aria-checked={yearly}
                  aria-label="Switch between fixed fee and performance-linked structures"
                  onClick={() => setYearly((value) => !value)}
                >
                  <div className="switch-ball" />
                </button>
                <div className={`tagline year${yearly ? " is-active" : ""}`}>
                  Performance linked
                </div>
              </div>
              <div className="plan-wrap">
                <PlanList plans={PLANS_STANDARD} hidden={yearly} />
                <PlanList plans={PLANS_PERFORMANCE} hidden={!yearly} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- FAQ */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="faq-wrap">
            <div className="section-header-wrap center">
              <div className="section-header-content small">
                <SectionBadge>Investor questions</SectionBadge>
                <div className="section-heading-wrap space">
                  <h2 className="h2 text-center">Got questions?</h2>
                </div>
                <div className="section-subtitle-wrap">
                  <div className="paragraph-02 text-dark-gray text-center">
                    The things investors ask before they place a mandate,
                    answered plainly. Anything not covered here is worth a
                    conversation.
                  </div>
                </div>
              </div>
            </div>
            <div className="faq-main-wrap">
              {FAQS.map((faq) => (
                <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Blog */}
      <section className="blog-01" id="insights">
        <div className="container">
          <div className="blog-01-wrap">
            <div className="section-header-wrap">
              <div className="section-header-left large">
                <SectionBadge>From the investment desk</SectionBadge>
                <div className="section-heading-wrap">
                  <SplitHeading
                    lead="Notes from the desk"
                    tail="on markets and businesses"
                  />
                </div>
              </div>
              <div className="section-header-right">
                <div className="section-subtitle-wrap space">
                  <div className="paragraph-02 text-dark-gray">
                    What we are reading, what we are questioning, and what we
                    have changed our mind about.
                  </div>
                </div>
                <div className="section-button-right">
                  <ButtonTwo href="#insights">Read all notes</ButtonTwo>
                </div>
              </div>
            </div>
            <div className="blog-01-main-wrap">
              <div className="blog-collection-list">
                {POSTS.map((post) => (
                  <div key={post.title}>
                    <a href="#insights" className="blog-link w-inline-block">
                      <div className="blog-01-card">
                        <div className="blog-01-image-wrap">
                          <div className="image-wrap">
                            <img
                              src={post.image}
                              loading="lazy"
                              alt=""
                              className="fit-cover"
                            />
                          </div>
                        </div>
                        <div className="blog-01-details">
                          <div className="blog-01-text-wrap">
                            <div className="paragraph-02 text-dark-gray">
                              {post.date}
                            </div>
                            <div className="text-style-h4 blog-title">
                              {post.title}
                            </div>
                          </div>
                          <ButtonThree>Read more</ButtonThree>
                        </div>
                        <div
                          className="blog-tag"
                          style={{ backgroundColor: post.tone }}
                        >
                          <div className="tagline text-center">{post.tag}</div>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <section className="cta" id="contact">
        <div className="container">
          <div className="cta-wrap">
            <div className="badge">
              <img
                src="https://ui.aryank.space/assets/moneybee-editorial-page/magic-wand.svg"
                loading="lazy"
                alt=""
                className="badge-icon"
              />
              <div className="tagline">Portfolio Management &amp; AIF</div>
            </div>
            <div className="cta-text-wrap">
              <div className="section-heading-wrap">
                <h1 className="text-center">
                  Begin with a conversation, not a product
                </h1>
              </div>
              <div className="section-subtitle-wrap">
                <div className="paragraph-01 cta-subtitle">
                  We would like to understand your objectives before discussing
                  ours. No allocation is discussed in a first meeting.
                </div>
              </div>
            </div>
            <div className="cta-button-wrap">
              <CtaButton tone="white">Book a Consultation</CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Footer */}
      <section className="footer">
        <div className="container">
          <div className="footer-wrap">
            <div className="footer-main-wrap">
              <div className="footer-left">
                <div className="footer-details">
                  <a
                    href="#top"
                    aria-label="Moneybee home"
                    className="footer-brand w-inline-block"
                  >
                    <Logo tone="light" />
                  </a>
                  <div className="paragraph-02 text-light-gray">
                    Moneybee Securities Pvt Ltd. Portfolio Management Services,
                    Alternative Investment Fund, and Investment Advisory.
                    Mumbai, India.
                  </div>
                </div>
                <div className="footer-newsletter-wrap">
                  <div className="text-style-h4 menu-title">
                    Quarterly letters from the investment desk
                  </div>
                  <div className="newsletter-form-block">
                    <form onSubmit={(event) => event.preventDefault()}>
                      <div className="newsletter-form-group">
                        <input
                          className="newsletter-input-filed w-input"
                          maxLength={256}
                          name="email"
                          placeholder="Enter email"
                          type="email"
                          aria-label="Email address"
                          required
                        />
                        <input
                          type="submit"
                          className="newsletter-submit-button w-button"
                          value="Subscribe"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="footer-right">
                {FOOTER_COLUMNS.map((column, index) => (
                  <div key={column.title} className="footer-menu-column">
                    {/* The reference tags only the first of these as a heading. */}
                    <div
                      className={`${index === 0 ? "h4" : "text-style-h4"} menu-title`}
                    >
                      {column.title}
                    </div>
                    <div className="footer-menu-list">
                      {column.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          className="footer-menu"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="footer-copyright-wrap">
              <div className="paragraph-02 copyright-text">
                &copy; 2026 Moneybee Securities Pvt Ltd. All rights reserved.
              </div>
              <div className="paragraph-02 copyright-text">
                Investments are subject to market risk. Read all documents
                carefully.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

/**
 * Dealt Team Cards - a team section that deals itself out. Dashed placeholder
 * frames rise into their slots as the section approaches, each popping its
 * giant initial once the frame is most of the way up. The section then pins and
 * the real cards fly in from off to the right, rotating flat and scaling up on
 * staggered windows, so the last card is still arriving while the first has
 * already settled.
 *
 * Owns a scroll container by default (`embedded`) so it fits a bounded box; set
 * `embedded={false}` to drive it from the window scroll.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/dealt-team-cards";

export interface TeamMember {
  firstName: string;
  lastName: string;
  role: string;
  image: string;
}

export interface DealtTeamCardsProps {
  heroHeading?: string;
  outroHeading?: string;
  members?: TeamMember[];
  embedded?: boolean;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    firstName: "Caspian",
    lastName: "Merlow",
    role: "( Creative Director )",
    image: `${ASSET_BASE}/team-member-1.jpg`,
  },
  {
    firstName: "Evander",
    lastName: "Coren",
    role: "( Executive Producer )",
    image: `${ASSET_BASE}/team-member-2.jpg`,
  },
  {
    firstName: "Leopold",
    lastName: "Draven",
    role: "( Head of Production )",
    image: `${ASSET_BASE}/team-member-3.jpg`,
  },
];

export default function DealtTeamCards({
  heroHeading = "Faces Behind the Frame",
  outroHeading = "Where Vision Becomes Work",
  members = DEFAULT_MEMBERS,
  embedded = true,
}: DealtTeamCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const content = root.querySelector<HTMLElement>(".wst-content");
    const teamSection = root.querySelector<HTMLElement>(".wst-team");
    if (!content || !teamSection) return;

    const teamMembers = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".wst-team-member"),
    );
    const teamMemberCards = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".wst-team-member-card"),
    );

    const scroller = embedded ? root : undefined;
    const lenis = embedded
      ? new Lenis({ wrapper: root, content })
      : new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    let cardPlaceholderEntrance: ScrollTrigger | null = null;
    let cardSlideInAnimation: ScrollTrigger | null = null;

    const initTeamAnimations = () => {
      const frameWidth = window.innerWidth;
      const frameHeight = embedded ? root.clientHeight : window.innerHeight;

      cardPlaceholderEntrance?.kill();
      cardSlideInAnimation?.kill();
      cardPlaceholderEntrance = null;
      cardSlideInAnimation = null;

      if (frameWidth < 1000) {
        for (const member of teamMembers) {
          gsap.set(member, { clearProps: "all" });
          const teamMemberInitial = member.querySelector(
            ".wst-team-member-name-initial h1",
          );
          gsap.set(teamMemberInitial, { clearProps: "all" });
        }
        for (const card of teamMemberCards) {
          gsap.set(card, { clearProps: "all" });
        }
        return;
      }

      cardPlaceholderEntrance = ScrollTrigger.create({
        trigger: teamSection,
        scroller,
        start: "top bottom",
        end: "top top",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          teamMembers.forEach((member, index) => {
            const entranceDelay = 0.15;
            const entranceDuration = 0.7;
            const entranceStart = index * entranceDelay;
            const entranceEnd = entranceStart + entranceDuration;

            const teamMemberInitial = member.querySelector(
              ".wst-team-member-name-initial h1",
            );

            if (progress >= entranceStart && progress <= entranceEnd) {
              const memberEntranceProgress =
                (progress - entranceStart) / entranceDuration;

              const entranceY = 125 - memberEntranceProgress * 125;
              gsap.set(member, { y: `${entranceY}%` });

              const initialLetterScaleDelay = 0.4;
              const initialLetterScaleProgress = Math.max(
                0,
                (memberEntranceProgress - initialLetterScaleDelay) /
                  (1 - initialLetterScaleDelay),
              );
              gsap.set(teamMemberInitial, {
                scale: initialLetterScaleProgress,
              });
            } else if (progress > entranceEnd) {
              gsap.set(member, { y: "0%" });
              gsap.set(teamMemberInitial, { scale: 1 });
            }
          });
        },
      });

      cardSlideInAnimation = ScrollTrigger.create({
        trigger: teamSection,
        scroller,
        start: "top top",
        end: `+=${frameHeight * 3}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;

          teamMemberCards.forEach((card, index) => {
            const slideInStagger = 0.075;
            const xRotationDuration = 0.4;
            const xRotationStart = index * slideInStagger;
            const xRotationEnd = xRotationStart + xRotationDuration;

            if (progress >= xRotationStart && progress <= xRotationEnd) {
              const cardProgress =
                (progress - xRotationStart) / xRotationDuration;

              const cardInitialX = 300 - index * 100;
              const cardTargetX = -50;
              const cardSlideInX =
                cardInitialX + cardProgress * (cardTargetX - cardInitialX);

              const cardSlideInRotation = 20 - cardProgress * 20;

              gsap.set(card, {
                x: `${cardSlideInX}%`,
                rotation: cardSlideInRotation,
              });
            } else if (progress > xRotationEnd) {
              gsap.set(card, { x: "-50%", rotation: 0 });
            }

            const cardScaleStagger = 0.12;
            const cardScaleStart = 0.4 + index * cardScaleStagger;
            const cardScaleEnd = 1;

            if (progress >= cardScaleStart && progress <= cardScaleEnd) {
              const scaleProgress =
                (progress - cardScaleStart) / (cardScaleEnd - cardScaleStart);
              const scaleValue = 0.75 + scaleProgress * 0.25;

              gsap.set(card, { scale: scaleValue });
            } else if (progress > cardScaleEnd) {
              gsap.set(card, { scale: 1 });
            }
          });
        },
      });
    };

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        initTeamAnimations();
        ScrollTrigger.refresh();
      }, 250);
    };
    window.addEventListener("resize", onResize);

    initTeamAnimations();
    ScrollTrigger.refresh();

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      cardPlaceholderEntrance?.kill();
      cardSlideInAnimation?.kill();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
    };
  }, [embedded, members]);

  return (
    <div
      className={embedded ? "wst-root wst-embedded" : "wst-root"}
      ref={rootRef}
    >
      <style>{styles}</style>
      <div className="wst-content">
        <section className="wst-hero">
          <h1>{heroHeading}</h1>
        </section>

        <section className="wst-team">
          {members.map((member) => (
            <div className="wst-team-member" key={member.lastName}>
              <div className="wst-team-member-name-initial">
                <h1>{member.firstName.charAt(0)}</h1>
              </div>
              <div className="wst-team-member-card">
                <div className="wst-team-member-img">
                  <img src={member.image} alt="" />
                </div>
                <div className="wst-team-member-info">
                  <p>{member.role}</p>
                  <h1>
                    {member.firstName} <span>{member.lastName}</span>
                  </h1>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="wst-outro">
          <h1>{outroHeading}</h1>
        </section>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap");

.wst-root {
  --base-100: #171717;
  --base-200: #f2f5ea;
  --base-300: #fc694c;
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Barlow Condensed", sans-serif;
  background-color: var(--base-100);
  container-type: inline-size;
}
.wst-root.wst-embedded {
  overflow-y: auto;
  overflow-x: hidden;
}
.wst-root.wst-embedded::-webkit-scrollbar { display: none; }
.wst-root * { margin: 0; padding: 0; box-sizing: border-box; }
.wst-content { position: relative; width: 100%; }
.wst-root img { width: 100%; height: 100%; object-fit: cover; }
.wst-root h1 {
  text-transform: uppercase;
  font-size: 12rem;
  font-weight: 800;
  line-height: 0.8;
}
.wst-root p {
  text-transform: uppercase;
  font-family: "DM Mono", monospace;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1;
}
.wst-root section {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  padding: 1rem;
}
.wst-hero,
.wst-outro {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.wst-hero h1,
.wst-outro h1 { width: 75%; color: var(--base-300); }
.wst-team { display: flex; gap: 1rem; }
.wst-team-member {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px dashed rgba(242, 245, 234, 0.35);
  border-radius: 1.5rem;
  will-change: transform;
  transform: translateY(125%);
}
.wst-team-member:nth-child(1) { z-index: 2; }
.wst-team-member:nth-child(2) { z-index: 1; }
.wst-team-member:nth-child(3) { z-index: 0; }
.wst-team-member-name-initial {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.wst-team-member-name-initial h1 {
  color: var(--base-300);
  font-size: 20rem;
  will-change: transform;
  transform: scale(0);
}
.wst-team-member-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  background-color: var(--base-200);
  border-radius: 1.5rem;
  will-change: transform;
}
.wst-team-member-img {
  aspect-ratio: 1;
  border-radius: 1rem;
  margin-bottom: 1rem;
  overflow: hidden;
}
.wst-team-member-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}
.wst-team-member-info h1 { font-size: 6.5rem; color: var(--base-300); }
.wst-team-member-info h1 span,
.wst-team-member-info p { color: var(--base-100); }
.wst-team-member:nth-child(1) .wst-team-member-card {
  transform: translate(300%, -50%) scale(0.75) rotate(20deg);
}
.wst-team-member:nth-child(2) .wst-team-member-card {
  transform: translate(200%, -50%) scale(0.75) rotate(20deg);
}
.wst-team-member:nth-child(3) .wst-team-member-card {
  transform: translate(100%, -50%) scale(0.75) rotate(20deg);
}

@media (max-width: 1000px) {
  .wst-root h1 { font-size: 4rem; }
  .wst-hero h1,
  .wst-outro h1 { width: 100%; }
  .wst-team {
    height: 250svh;
    flex-direction: column;
    align-items: center;
  }
  .wst-team-member {
    max-width: 400px;
    transform: translateY(0%) !important;
  }
  .wst-team-member-name-initial h1 { transform: scale(1); }
  .wst-team-member .wst-team-member-card {
    transform: translate(-50%, -50%) scale(1) rotate(0deg) !important;
  }
  .wst-team-member-info h1 { font-size: 5rem; }
}
`;

"use client";

/**
 * Story Reel Viewer - a stories player where the transition is a counter-scale
 * rather than a slide. The outgoing photograph scales to two and rotates
 * twenty five degrees away, while the incoming one starts at scale two and the
 * opposite rotation and settles to rest, so the two images pass through each
 * other in depth. The new frame's container is also clip-path wiped in from the
 * edge you are travelling toward, giving two independent reveals on one change.
 * Text does not cross-fade: a fresh node is appended, the old one is pushed out
 * by exactly one line height, and any node beyond the newest two is pruned so
 * the DOM cannot grow. The progress bars fill over the story duration, and
 * skipping backwards empties the bar from the right rather than the left.
 *
 * Cursor is replaced by a blurred puck that reads Prev or Next depending on
 * which half of the frame it is in; clicking anywhere advances that way.
 *
 * Self-contained: it fills its own box, no page scroll required.
 *
 * BLANK - aryank.space
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";

const ASSET_BASE = "https://ui.aryank.space/assets/story-reel-viewer";

export interface StoryReelEntry {
  profileImg: string;
  profileName: string;
  title: string[];
  linkLabel: string;
  linkSrc: string;
  storyImg: string;
}

export interface StoryReelViewerProps {
  stories?: StoryReelEntry[];
  /** Milliseconds a story holds before auto-advancing. */
  storyDuration?: number;
}

const DEFAULT_STORIES: StoryReelEntry[] = [
  {
    profileImg: `${ASSET_BASE}/profile-1.png`,
    profileName: "Behance",
    title: [
      "Showcasing creative",
      "portfolios and projects",
      "from top designers",
    ],
    linkLabel: "Read More",
    linkSrc: "https://behance.net",
    storyImg: `${ASSET_BASE}/story-1.png`,
  },
  {
    profileImg: `${ASSET_BASE}/profile-2.png`,
    profileName: "Dribbble",
    title: ["Inspiring design", "ideas and visual", "creations from experts"],
    linkLabel: "Discover",
    linkSrc: "https://dribbble.com",
    storyImg: `${ASSET_BASE}/story-2.png`,
  },
  {
    profileImg: `${ASSET_BASE}/profile-3.png`,
    profileName: "Awwwards",
    title: ["Award-winning web", "design and development", "projects"],
    linkLabel: "Check It Out",
    linkSrc: "https://awwwards.com",
    storyImg: `${ASSET_BASE}/story-3.png`,
  },
  {
    profileImg: `${ASSET_BASE}/profile-4.png`,
    profileName: "Adobe",
    title: ["Curated design", "inspiration for", "creative professionals"],
    linkLabel: "Adobe More",
    linkSrc: "https://adobe.com",
    storyImg: `${ASSET_BASE}/story-4.png`,
  },
  {
    profileImg: `${ASSET_BASE}/profile-5.png`,
    profileName: "Creative Bloq",
    title: ["The latest in", "design trends", "and tutorials"],
    linkLabel: "Explore",
    linkSrc: "https://creativebloq.com",
    storyImg: `${ASSET_BASE}/story-5.png`,
  },
  {
    profileImg: `${ASSET_BASE}/profile-6.png`,
    profileName: "Smashing Magazine",
    title: ["Practical tips", "for web designers", "and developers"],
    linkLabel: "Visit Site",
    linkSrc: "https://smashingmagazine.com",
    storyImg: `${ASSET_BASE}/story-6.png`,
  },
];

export default function StoryReelViewer({
  stories = DEFAULT_STORIES,
  storyDuration = 4000,
}: StoryReelViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cursor = root.querySelector<HTMLElement>(".srv-cursor");
    const cursorText = cursor?.querySelector("p");
    if (!cursor || !cursorText) return;

    let activeStory = 0;
    const contentUpdateDelay = 0.4;
    let direction: "next" | "prev" = "next";
    let storyTimeout: ReturnType<typeof setTimeout>;
    const pending = new Set<ReturnType<typeof setTimeout>>();

    const highlights = () =>
      root.querySelectorAll<HTMLElement>(".srv-index .srv-index-highlight");

    function resetIndexHighlight(index: number, currentDirection: string) {
      const highlight = highlights()[index];
      if (!highlight) return;
      gsap.killTweensOf(highlight);
      gsap.to(highlight, {
        width: currentDirection === "next" ? "100%" : "0%",
        duration: 0.3,
        onStart: () => {
          gsap.to(highlight, {
            transformOrigin: "right center",
            scaleX: 0,
            duration: 0.3,
          });
        },
      });
    }

    function animateIndexHighlight(index: number) {
      const highlight = highlights()[index];
      if (!highlight) return;
      gsap.set(highlight, {
        width: "0%",
        scaleX: 1,
        transformOrigin: "right center",
      });
      gsap.to(highlight, {
        width: "100%",
        duration: storyDuration / 1000,
        ease: "none",
      });
    }

    function animateNewImage(
      imgContainer: HTMLElement,
      currentDirection: string,
    ) {
      gsap.set(imgContainer, {
        clipPath:
          currentDirection === "next"
            ? "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)"
            : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      });
      gsap.to(imgContainer, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "power4.inOut",
      });
    }

    function animateImageScale(
      currentImg: HTMLElement,
      upcomingImg: HTMLElement,
      currentDirection: string,
    ) {
      gsap.fromTo(
        currentImg,
        { scale: 1, rotate: 0 },
        {
          scale: 2,
          rotate: currentDirection === "next" ? -25 : 25,
          duration: 1,
          ease: "power4.inOut",
          onComplete: () => {
            currentImg.parentElement?.remove();
          },
        },
      );
      gsap.fromTo(
        upcomingImg,
        { scale: 2, rotate: currentDirection === "next" ? 25 : -25 },
        { scale: 1, rotate: 0, duration: 1, ease: "power4.inOut" },
      );
    }

    function cleanUpElements() {
      const profileNameDiv = root?.querySelector(".srv-profile-name");
      const titleRows = root?.querySelectorAll(".srv-title-row");

      while (profileNameDiv && profileNameDiv.childElementCount > 2) {
        profileNameDiv.removeChild(profileNameDiv.firstChild as Node);
      }

      for (const titleRow of titleRows ?? []) {
        while (titleRow.childElementCount > 2) {
          titleRow.removeChild(titleRow.firstChild as Node);
        }
      }
    }

    function changeStory(isAutomatic = true) {
      const previousStory = activeStory;
      const currentDirection = isAutomatic ? "next" : direction;

      activeStory =
        currentDirection === "next"
          ? (activeStory + 1) % stories.length
          : (activeStory - 1 + stories.length) % stories.length;

      const story = stories[activeStory];

      gsap.to(root?.querySelectorAll(".srv-profile-name p") ?? [], {
        y: currentDirection === "next" ? -24 : 24,
        duration: 0.5,
        delay: contentUpdateDelay,
      });
      gsap.to(root?.querySelectorAll(".srv-title-row h1") ?? [], {
        y: currentDirection === "next" ? -48 : 48,
        duration: 0.5,
        delay: contentUpdateDelay,
      });

      const currentImgContainer = root?.querySelector<HTMLElement>(
        ".srv-story-img .srv-img",
      );
      const currentImg = currentImgContainer?.querySelector("img");

      const t1 = setTimeout(() => {
        pending.delete(t1);
        const newProfileName = document.createElement("p");
        newProfileName.innerText = story.profileName;
        newProfileName.style.transform =
          currentDirection === "next"
            ? "translateY(24px)"
            : "translateY(-24px)";

        root?.querySelector(".srv-profile-name")?.appendChild(newProfileName);
        gsap.to(newProfileName, {
          y: 0,
          duration: 0.5,
          delay: contentUpdateDelay,
        });

        const titleRows = root?.querySelectorAll(".srv-title-row");
        story.title.forEach((line, index) => {
          const row = titleRows?.[index];
          if (!row) return;
          const newTitle = document.createElement("h1");
          newTitle.innerText = line;
          newTitle.style.transform =
            currentDirection === "next"
              ? "translateY(48px)"
              : "translateY(-48px)";
          row.appendChild(newTitle);
          gsap.to(newTitle, { y: 0, duration: 0.5, delay: contentUpdateDelay });
        });

        const newImgContainer = document.createElement("div");
        newImgContainer.classList.add("srv-img");
        const newStoryImg = document.createElement("img");
        newStoryImg.src = story.storyImg;
        newStoryImg.alt = story.profileName;
        newStoryImg.draggable = false;
        newImgContainer.appendChild(newStoryImg);
        root?.querySelector(".srv-story-img")?.appendChild(newImgContainer);

        animateNewImage(newImgContainer, currentDirection);
        if (currentImg) {
          animateImageScale(currentImg, newStoryImg, currentDirection);
        }

        resetIndexHighlight(previousStory, currentDirection);
        animateIndexHighlight(activeStory);
        cleanUpElements();

        clearTimeout(storyTimeout);
        storyTimeout = setTimeout(() => changeStory(true), storyDuration);
        pending.add(storyTimeout);
      }, 200);
      pending.add(t1);

      const t2 = setTimeout(() => {
        pending.delete(t2);
        const profileImg = root?.querySelector<HTMLImageElement>(
          ".srv-profile-icon img",
        );
        if (profileImg) profileImg.src = story.profileImg;

        const link = root?.querySelector<HTMLAnchorElement>(".srv-link a");
        if (link) {
          link.textContent = story.linkLabel;
          link.href = story.linkSrc;
        }
      }, 600);
      pending.add(t2);
    }

    // The source binds to document and splits on the window's midpoint; here it
    // is the component's own rect so the halves match the visible frame.
    const onMouseMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      gsap.to(cursor, {
        x: x - cursor.offsetWidth / 2,
        y: y - cursor.offsetHeight / 2,
        ease: "power2.out",
        duration: 0.3,
      });

      if (x < rect.width / 2) {
        cursorText.textContent = "Prev";
        direction = "prev";
      } else {
        cursorText.textContent = "Next";
        direction = "next";
      }
    };

    const onClick = () => {
      clearTimeout(storyTimeout);
      resetIndexHighlight(activeStory, direction);
      changeStory(false);
    };

    root.addEventListener("mousemove", onMouseMove);
    root.addEventListener("click", onClick);

    storyTimeout = setTimeout(() => changeStory(true), storyDuration);
    pending.add(storyTimeout);
    animateIndexHighlight(activeStory);

    return () => {
      root.removeEventListener("mousemove", onMouseMove);
      root.removeEventListener("click", onClick);
      clearTimeout(storyTimeout);
      for (const t of pending) clearTimeout(t);
      gsap.killTweensOf(root.querySelectorAll("*"));
    };
  }, [stories, storyDuration]);

  const first = stories[0];

  return (
    <div className="srv-root" ref={rootRef}>
      <style>{styles}</style>

      <div className="srv-container">
        <div className="srv-cursor">
          <p />
        </div>

        <div className="srv-story-img">
          <div className="srv-img">
            <img alt="" draggable={false} src={first.storyImg} />
          </div>
        </div>

        <div className="srv-story-content">
          <div className="srv-row">
            <div className="srv-indices">
              {stories.map((story) => (
                <div className="srv-index" key={`index-${story.profileName}`}>
                  <div className="srv-index-highlight" />
                </div>
              ))}
            </div>

            <div className="srv-profile">
              <div className="srv-profile-icon">
                <img alt="" draggable={false} src={first.profileImg} />
              </div>
              <div className="srv-profile-name">
                <p>{first.profileName}</p>
              </div>
            </div>
          </div>

          <div className="srv-row">
            <div className="srv-title">
              {first.title.map((line) => (
                <div className="srv-title-row" key={line}>
                  <h1>{line}</h1>
                </div>
              ))}
              <div className="srv-link">
                <a href={first.linkSrc}>{first.linkLabel}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.srv-root {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Inter", sans-serif;
  background: #000;
  cursor: none;
  overflow: hidden;
}

.srv-root * {
  box-sizing: border-box;
}

.srv-root img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.srv-root h1,
.srv-root p,
.srv-root a {
  margin: 0;
  color: #fff;
  text-decoration: none;
  font-weight: 400;
}

.srv-root h1 {
  font-size: 36px;
}

.srv-root p,
.srv-root a {
  font-size: 16px;
}

.srv-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.srv-cursor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 100%;
  pointer-events: none;
  z-index: 2;
}

.srv-cursor p {
  font-size: 12px;
  text-transform: uppercase;
}

.srv-story-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0.5;
}

.srv-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.srv-story-content {
  position: absolute;
  padding: 4em 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.srv-indices {
  width: 100%;
  height: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.25em;
}

.srv-index {
  position: relative;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.25);
}

.srv-index-highlight {
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background: #fff;
  transform: scaleX(100%);
}

.srv-profile {
  width: 100%;
  height: 60px;
  display: flex;
  gap: 1em;
  align-items: center;
}

.srv-profile-icon {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 100%;
  overflow: hidden;
  flex: none;
}

.srv-profile-name {
  position: relative;
  width: 200px;
  height: 20px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.srv-title-row {
  position: relative;
  width: 100%;
  height: 42px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.srv-link {
  position: relative;
  width: max-content;
  margin: 2em 0;
  padding: 0.25em 0;
}

.srv-link::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 1px;
  background: #fff;
}

.srv-title-row h1,
.srv-profile-name p {
  position: absolute;
  top: 0;
}

@media (max-width: 900px) {
  .srv-root {
    cursor: default;
  }

  .srv-story-content {
    width: 100%;
    padding: 2em;
  }

  .srv-cursor {
    display: none;
  }
}
`;

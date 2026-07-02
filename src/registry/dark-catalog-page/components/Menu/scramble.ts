// @ts-nocheck
// biome-ignore-all lint: source-authored GSAP template port.

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
const DURATION = 0.25;
const STAGGER = 50;

// animate a single character through random chars then settle on original
function scrambleChar(
  char,
  showAfter = true,
  duration = DURATION,
  charDelay = 50,
  maxIterations = null,
) {
  if (!char.dataset.originalText) {
    char.dataset.originalText = char.textContent;
  }
  const originalText = char.dataset.originalText;
  let iterations = 0;
  const iterationsCount = maxIterations || Math.floor(Math.random() * 6) + 3;

  if (showAfter) gsap.set(char, { opacity: 1 });

  if (char.scrambleInterval) {
    clearInterval(char.scrambleInterval);
  }
  if (char.scrambleTimeout) {
    clearTimeout(char.scrambleTimeout);
  }

  const interval = setInterval(() => {
    if (originalText === " ") {
      char.textContent = " ";
    } else {
      char.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    iterations++;

    if (iterations >= iterationsCount) {
      clearInterval(interval);
      char.scrambleInterval = null;
      char.textContent = originalText;
      if (!showAfter) gsap.set(char, { opacity: 0 });
    }
  }, charDelay);

  char.scrambleInterval = interval;

  const timeout = setTimeout(() => {
    clearInterval(interval);
    char.scrambleInterval = null;
    char.scrambleTimeout = null;
    char.textContent = originalText;
    if (!showAfter) gsap.set(char, { opacity: 0 });
  }, duration * 1000);

  char.scrambleTimeout = timeout;
}

// stagger scramble animation across multiple character elements
function scrambleText(
  elements,
  showAfter = true,
  duration = DURATION,
  charDelay = 50,
  stagger = STAGGER,
  skipChars = 0,
  maxIterations = null,
) {
  elements.forEach((char, index) => {
    if (index < skipChars) {
      if (showAfter) gsap.set(char, { opacity: 1 });
      return;
    }

    if (char.staggerTimeout) {
      clearTimeout(char.staggerTimeout);
    }

    const staggerTimeout = setTimeout(
      () => {
        scrambleChar(char, showAfter, duration, charDelay, maxIterations);
        char.staggerTimeout = null;
      },
      (index - skipChars) * stagger,
    );

    char.staggerTimeout = staggerTimeout;
  });
}

// split element and trigger scramble-in after optional delay
export function scrambleIn(element, delay = 0, options = {}) {
  if (!element.textContent.trim()) return;

  const {
    duration = DURATION,
    charDelay = 50,
    stagger = STAGGER,
    skipChars = 0,
    maxIterations = null,
  } = options;

  const wordSplit = new SplitText(element, { type: "words" });

  const charSplits = wordSplit.words.map((word) => {
    return new SplitText(word, { type: "chars" });
  });

  const allChars = [];
  charSplits.forEach((split) => {
    allChars.push(...split.chars);
  });

  gsap.set(allChars, { opacity: 0 });

  setTimeout(() => {
    scrambleText(
      allChars,
      true,
      duration,
      charDelay,
      stagger,
      skipChars,
      maxIterations,
    );
  }, delay * 1000);

  return { wordSplit, charSplits, allChars };
}

// scramble-out existing split chars in reverse order
export function scrambleOut(element, delay = 0) {
  const chars = element.querySelectorAll(".char span");
  if (chars.length === 0) return;

  gsap.set(chars, { opacity: 1 });

  setTimeout(() => {
    scrambleText([...chars].reverse(), false);
  }, delay * 1000);
}

// split visible text and scramble chars without hiding first
export function scrambleVisible(element, delay = 0, options = {}) {
  if (!element.textContent.trim()) return;

  const {
    duration = DURATION,
    charDelay = 50,
    stagger = STAGGER,
    skipChars = 0,
    maxIterations = null,
  } = options;

  const wordSplit = new SplitText(element, { type: "words" });

  const charSplits = wordSplit.words.map((word) => {
    return new SplitText(word, { type: "chars" });
  });

  const allChars = [];
  charSplits.forEach((split) => {
    allChars.push(...split.chars);
  });

  gsap.set(allChars, { opacity: 1 });

  setTimeout(() => {
    scrambleText(
      allChars,
      true,
      duration,
      charDelay,
      stagger,
      skipChars,
      maxIterations,
    );
  }, delay * 1000);

  return { wordSplit, charSplits, allChars };
}

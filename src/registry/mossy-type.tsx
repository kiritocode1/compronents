"use client";

import type { CSSProperties } from "react";

const ASSETS = "https://ui.aryank.space/assets/mossy-type";

// The source runtime queries document IDs and owns window listeners and WebGL.
// Keep it in its own document so multiple components can mount without collisions.
const documentMarkup = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
  <base href="${ASSETS}/" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap" />
  <link rel="stylesheet" href="${ASSETS}/index.css" />
  <script type="module" src="${ASSETS}/index.js"></script>
</head>
<body>
  <canvas id="stage" aria-label="Moss text canvas"></canvas>
  <textarea id="type-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="48" aria-label="Type text to grow moss"></textarea>
  <footer class="credit-bar">
    <span>Build with Claude Code</span>
    <span class="sep" aria-hidden="true">•</span>
    <a class="credit" href="https://x.com/panic_puriii" target="_blank" rel="noopener">By panic_puriii</a>
  </footer>
  <p id="hint" class="hint">Start typing...</p>
  <div class="dock">
    <nav id="presets" class="presets" aria-label="Moss presets"></nav>
    <div class="popover">
      <button id="font-btn" class="round" aria-haspopup="menu" aria-expanded="false" aria-label="Change font" title="Font"></button>
      <div id="font-menu" class="menu font-menu" role="menu" hidden></div>
    </div>
    <div class="popover">
      <button id="size-btn" class="round" aria-haspopup="dialog" aria-expanded="false" aria-controls="size-menu" aria-label="Text size" title="Text size"></button>
      <div id="size-menu" class="menu size-menu" role="dialog" aria-label="Text size" hidden>
        <div class="size-head"><span>Text size</span><output id="size-val">100%</output></div>
        <div class="size-row">
          <button id="size-down" type="button" aria-label="Smaller text"></button>
          <input id="size-range" type="range" min="60" max="160" step="5" value="100" aria-label="Text size" />
          <button id="size-up" type="button" aria-label="Larger text"></button>
        </div>
      </div>
    </div>
    <button id="clear-btn" class="round" aria-label="Clear text" title="Clear" disabled></button>
    <div class="download popover">
      <button id="download-btn" class="round" aria-haspopup="menu" aria-expanded="false" aria-label="Download"></button>
      <div id="download-menu" class="menu" role="menu" hidden>
        <button role="menuitem" data-action="png">PNG 2X</button>
        <button role="menuitem" data-action="png4">PNG 4X</button>
        <hr />
        <button role="menuitem" data-action="record">MP4 Record live</button>
      </div>
    </div>
  </div>
  <div id="rec-badge" class="rec" hidden><span class="dot"></span><span id="rec-label">REC</span></div>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
</body>
</html>`;

export interface MossyTypeProps {
  /** The frame fills its parent. Give the parent an explicit height. */
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/** The original Moss Type WebGL scene in an isolated, installable document. */
export default function MossyType({
  className,
  style,
  title = "Moss Type",
}: MossyTypeProps) {
  return (
    <iframe
      title={title}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        ...style,
      }}
      sandbox="allow-scripts allow-downloads allow-popups"
      srcDoc={documentMarkup}
    />
  );
}

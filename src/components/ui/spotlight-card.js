"use client";

import React, { useEffect, useId, useRef } from "react";

const glowColorMap = {
  blue: { base: 220, spread: 40 },
  // Cool violet — primary brand glow
  purple: { base: 262, spread: 12, lightness: 28, saturation: 72 },
  // Soft lavender-pink accent (use sparingly)
  pink: { base: 290, spread: 8, lightness: 32, saturation: 48 },
  green: { base: 120, spread: 40 },
  red: { base: 0, spread: 40 },
  orange: { base: 30, spread: 40 },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

/** Parse #RGB / #RRGGBB / rgb() into hue degrees, or null if invalid */
function colorToHue(input) {
  if (!input || typeof input !== "string") return null;
  const raw = input.trim();

  let r;
  let g;
  let b;

  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  } else {
    const rgb = raw.match(
      /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i
    );
    if (rgb) {
      r = Number(rgb[1]);
      g = Number(rgb[2]);
      b = Number(rgb[3]);
    }
  }

  if (r === undefined || g === undefined || b === undefined) return null;
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;

  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  if (delta === 0) return 262; // neutral → cool violet

  let hue = 0;
  if (max === rn) hue = ((gn - bn) / delta) % 6;
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return hue;
}

const GLOW_STYLES = `
  [data-glow] {
    --bg-spot-opacity: 0.14;
    --border-spot-opacity: 0.9;
    --border-light-opacity: 0.55;
  }

  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
    -webkit-mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    -webkit-mask-clip: padding-box, border-box;
    -webkit-mask-composite: source-in;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 268) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 26) * 1%) / var(--border-spot-opacity, 1)),
      transparent 100%
    );
    filter: brightness(1.15);
    z-index: 1;
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 1)),
      transparent 100%
    );
    z-index: 1;
  }

  /* Soft outer bloom — only while the card is hovered / focused */
  [data-glow] > [data-glow] {
    position: absolute;
    inset: 0;
    opacity: 0;
    border-radius: calc(var(--radius) * 1px);
    filter: blur(calc(var(--border-size) * 8));
    background: none;
    pointer-events: none;
    border: none;
    z-index: 0;
    transition: opacity 180ms ease;
  }

  [data-glow]:hover > [data-glow],
  [data-glow]:focus-within > [data-glow] {
    opacity: var(--outer, 1);
  }

  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }

  [data-glow] > [data-glow-content] {
    position: relative;
    z-index: 2;
    min-width: 0;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    [data-glow] > [data-glow] {
      display: none;
    }
  }
`;

let stylesMounted = false;

function ensureGlowStyles() {
  if (typeof document === "undefined" || stylesMounted) return;
  if (document.getElementById("glow-card-styles")) {
    stylesMounted = true;
    return;
  }
  const style = document.createElement("style");
  style.id = "glow-card-styles";
  style.textContent = GLOW_STYLES;
  document.head.appendChild(style);
  stylesMounted = true;
}

function GlowCard({
  children,
  className = "",
  glowColor = "purple",
  color,
  size = "md",
  width,
  height,
  customSize = false,
  style,
}) {
  const cardRef = useRef(null);
  const reactId = useId();

  useEffect(() => {
    ensureGlowStyles();
  }, []);

  // Only track the pointer while the card is hovered — avoids N listeners
  // constantly calling getBoundingClientRect on every move across the page.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let attached = false;

    const syncPointer = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", x.toFixed(2));
      card.style.setProperty("--xp", (rect.width > 0 ? x / rect.width : 0).toFixed(2));
      card.style.setProperty("--y", y.toFixed(2));
      card.style.setProperty("--yp", (rect.height > 0 ? y / rect.height : 0).toFixed(2));
    };

    const onEnter = (e) => {
      if (attached) return;
      attached = true;
      syncPointer(e);
      card.addEventListener("pointermove", syncPointer);
    };

    const onLeave = () => {
      if (!attached) return;
      attached = false;
      card.removeEventListener("pointermove", syncPointer);
    };

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      onLeave();
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const preset = glowColorMap[glowColor] || glowColorMap.purple;
  const customHue = colorToHue(color);
  const base = customHue ?? preset.base;
  const spread = customHue != null ? 0 : preset.spread;
  const saturation = "saturation" in preset ? preset.saturation : 100;
  const lightness = "lightness" in preset ? preset.lightness : 26;

  const sizeClasses = customSize ? "" : sizeMap[size];

  const baseStyles = {
    "--base": base,
    "--spread": spread,
    "--saturation": saturation,
    "--lightness": lightness,
    "--radius": "14",
    "--border": "3",
    "--backdrop": "hsl(0 0% 12% / 0.72)",
    "--backup-border": "hsl(0 0% 100% / 0.08)",
    "--size": "200",
    "--outer": "1",
    "--border-size": "calc(var(--border, 2) * 1px)",
    "--spotlight-size": "calc(var(--size, 150) * 1px)",
    "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 50%) * 1px)
      calc(var(--y, 50%) * 1px),
      hsl(var(--hue, 268) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 26) * 1%) / var(--bg-spot-opacity, 0.1)),
      transparent
    )`,
    backgroundColor: "var(--backdrop, transparent)",
    backgroundSize:
      "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
    backgroundPosition: "50% 50%",
    border: "var(--border-size) solid var(--backup-border)",
    position: "relative",
    overflow: "visible",
    contain: "layout style",
    ...(width !== undefined && {
      width: typeof width === "number" ? `${width}px` : width,
    }),
    ...(height !== undefined && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
    ...style,
  };

  return (
    <div
      ref={cardRef}
      data-glow
      data-glow-id={reactId}
      style={baseStyles}
      className={`
        ${sizeClasses}
        ${!customSize ? "aspect-[3/4]" : ""}
        rounded-2xl
        relative
        shadow-[0_1rem_2rem_-1rem_black]
        p-4
        ${className}
      `}
    >
      <div data-glow aria-hidden="true" />
      <div data-glow-content className="relative z-[2] h-full min-h-0 w-full min-w-0">
        {children}
      </div>
    </div>
  );
}

export { GlowCard };

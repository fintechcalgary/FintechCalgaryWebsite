"use client";

import { useLayoutEffect, useRef } from "react";
import {
  IDLE_POINTER,
  createRenderer,
  isSettled,
  parseConfig,
  stepPointer,
} from "hazeglow/core";

const READY_CLASS = "hazeglow-ready";
const BOOT_CLASS = "hazeglow-boot";
const READY_TIMEOUT_MS = 2000;
const MAX_DPR = 2;
const MAX_DT = 0.1;

/* Black → indigo → brand violet mesh tuned for FinTech Calgary */
const HAZEGLOW_CONFIG = parseConfig({
  version: 1,
  seed: 1,
  shape: "mesh",
  center: [0.5, 0.42],
  size: [0.86, 0.6],
  roundness: 0.7,
  softness: 0.9,
  rotation: 0,
  rampDirection: 0.9,
  angle: 90,
  warp: 0.1,
  warpScale: 1.1,
  palette: ["#8B5CF6", "#6D28D9", "#4C1D95", "#2E1065", "#1A0B2E", "#0A0618"],
  background: "#050208",
  mesh: [
    // Near-black frame so edges stay quiet
    [0.02, 0.04, "#050208"],
    [0.98, 0.06, "#0A0618"],
    [0.04, 0.96, "#080414"],
    [0.96, 0.94, "#0C081A"],
    // Upper bloom behind the hero / globe
    [0.38, 0.16, "#3B1D6E"],
    [0.58, 0.24, "#8B5CF6"],
    [0.72, 0.12, "#5B21B6"],
    // Mid depth — indigo bridges so the blend feels continuous
    [0.22, 0.48, "#1E0A3C"],
    [0.5, 0.52, "#4C1D95"],
    [0.82, 0.56, "#2E1065"],
    // Lower weight — deep purple-black for section readability
    [0.48, 0.86, "#12081F"],
  ],
  grain: 0.32,
  motion: "drift",
  speed: 1.05,
  loop: 0,
  hover: 0.45,
  hoverMode: "pull",
  effect: "none",
  effectSize: 22,
  effectAmount: 0.94,
});

function markHazeglowReady() {
  const { body } = document;
  if (!body || body.classList.contains(READY_CLASS)) return;
  body.classList.add(READY_CLASS);
  body.classList.remove(BOOT_CLASS);
}

export default function HazeGlowBackground() {
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      markHazeglowReady();
      return;
    }

    const renderer = createRenderer(canvas);
    if (!renderer) {
      markHazeglowReady();
      return;
    }

    let disposed = false;
    let time = 0;
    let pointer = { ...IDLE_POINTER };
    let target = { x: 0.5, y: 0.5, inside: false };
    let animating = false;
    let raf = 0;
    let last = performance.now();
    let revealed = false;

    const reduceMotionMq = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const failOpen = window.setTimeout(markHazeglowReady, READY_TIMEOUT_MS);

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.clearTimeout(failOpen);
      requestAnimationFrame(markHazeglowReady);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      renderer.resize(w * dpr, h * dpr);
    };

    const paint = (now) => {
      if (disposed) return;

      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;

      const reduceMotion = reduceMotionMq.matches;
      const motionOn =
        !reduceMotion && HAZEGLOW_CONFIG.motion !== "none";
      const hoverOn = !reduceMotion && HAZEGLOW_CONFIG.hover > 0;

      if (motionOn) time += dt * HAZEGLOW_CONFIG.speed;

      const goal = hoverOn ? target : { ...target, inside: false };
      pointer = stepPointer(pointer, goal, dt);
      renderer.render(HAZEGLOW_CONFIG, time, pointer);
      reveal();

      const keepGoing =
        motionOn || (hoverOn && !isSettled(pointer, goal));

      if (keepGoing && !document.hidden) {
        raf = requestAnimationFrame(paint);
      } else {
        animating = false;
        raf = 0;
      }
    };

    const kick = () => {
      if (disposed || animating || document.hidden) return;
      animating = true;
      last = performance.now();
      raf = requestAnimationFrame(paint);
    };

    const setTargetFromEvent = (event) => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      target = {
        x: (event.clientX - rect.left) / width,
        y: (event.clientY - rect.top) / height,
        inside: true,
      };
      kick();
    };

    const clearTarget = () => {
      if (!target.inside) return;
      target = { ...target, inside: false };
      kick();
    };

    const onPointerMove = (event) => {
      if (HAZEGLOW_CONFIG.hover <= 0 || reduceMotionMq.matches) return;
      setTargetFromEvent(event);
    };

    const onPointerUp = (event) => {
      if (event.pointerType !== "mouse") clearTarget();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        animating = false;
        raf = 0;
      } else {
        kick();
      }
    };

    const onResize = () => {
      resize();
      renderer.render(HAZEGLOW_CONFIG, time, pointer);
      reveal();
      kick();
    };

    renderer.ready.then((ok) => {
      if (disposed) return;
      if (!ok) markHazeglowReady();
    });

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    /* Window-level tracking — canvas sits under site content with
       pointer-events: none, so Hazeglow's built-in canvas handlers never fire. */
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", clearTarget, { passive: true });
    document.documentElement.addEventListener("mouseleave", clearTarget);
    window.addEventListener("blur", clearTarget);
    document.addEventListener("visibilitychange", onVisibility);

    resize();
    renderer.render(HAZEGLOW_CONFIG, time, pointer);
    kick();

    return () => {
      disposed = true;
      window.clearTimeout(failOpen);
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", clearTarget);
      document.documentElement.removeEventListener("mouseleave", clearTarget);
      window.removeEventListener("blur", clearTarget);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
    };
  }, []);

  return (
    <div aria-hidden className="hazeglow-bg pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}

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

/* Pill · seed 22 — hazeglow.dev generator preset */
const HAZEGLOW_CONFIG = parseConfig({
  version: 1,
  seed: 22,
  shape: "pill",
  center: [0.5, 0.92],
  size: [1.5, 1.27],
  roundness: 0.67,
  softness: 0.79,
  rotation: 0,
  rampDirection: 0.4,
  angle: 283,
  warp: 0.4,
  warpScale: 1.05,
  palette: ["#32004d", "#3e0594", "#2e046c", "#350061"],
  background: "#000000",
  mesh: [],
  grain: 0.75,
  motion: "drift",
  speed: 0.55,
  loop: 0,
  hover: 0.31,
  hoverMode: "pull",
  effect: "none",
  effectSize: 18,
  effectAmount: 0.85,
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

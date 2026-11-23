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
const MOBILE_LAYOUT_MQ = "(max-width: 767px)";

const HAZEGLOW_SHARED = {
  version: 1,
  seed: 22,
  shape: "pill",
  size: [1.5, 1.27],
  roundness: 0.67,
  softness: 0.79,
  rotation: 0,
  rampDirection: 0.4,
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
};

const HAZEGLOW_DESKTOP = parseConfig({
  ...HAZEGLOW_SHARED,
  center: [0.5, 0.92],
  angle: 283,
});

const HAZEGLOW_MOBILE = parseConfig({
  ...HAZEGLOW_SHARED,
  center: [0.5, 0.08],
  angle: 103,
});

function markHazeglowReady() {
  const { body } = document;
  if (!body || body.classList.contains(READY_CLASS)) return;
  body.classList.add(READY_CLASS);
  body.classList.remove(BOOT_CLASS);
}

function syncShellHeight(isMobile) {
  const vv = window.visualViewport;
  const layoutH = window.innerHeight;
  const visualH = vv ? vv.height + vv.offsetTop : layoutH;
  const bleed = isMobile ? 160 : 0;
  const height = Math.ceil(Math.max(layoutH, visualH) + bleed);
  document.documentElement.style.setProperty("--mobile-vvh", `${height}px`);
}

export default function HazeGlowBackground() {
  const shellRef = useRef(null);
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) {
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
    const mobileLayoutMq = window.matchMedia(MOBILE_LAYOUT_MQ);
    const failOpen = window.setTimeout(markHazeglowReady, READY_TIMEOUT_MS);

    const getConfig = () =>
      mobileLayoutMq.matches ? HAZEGLOW_MOBILE : HAZEGLOW_DESKTOP;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.clearTimeout(failOpen);
      requestAnimationFrame(markHazeglowReady);
    };

    const sync = () => {
      syncShellHeight(mobileLayoutMq.matches);
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      renderer.resize(
        Math.max(1, canvas.clientWidth) * dpr,
        Math.max(1, canvas.clientHeight) * dpr,
      );
      renderer.render(getConfig(), time, pointer);
      reveal();
      kick();
    };

    const paint = (now) => {
      if (disposed) return;

      const config = getConfig();
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;

      const reduceMotion = reduceMotionMq.matches;
      const motionOn = !reduceMotion && config.motion !== "none";
      const hoverOn = !reduceMotion && config.hover > 0;

      if (motionOn) time += dt * config.speed;

      const goal = hoverOn ? target : { ...target, inside: false };
      pointer = stepPointer(pointer, goal, dt);
      renderer.render(config, time, pointer);
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
      target = {
        x: (event.clientX - rect.left) / (rect.width || 1),
        y: (event.clientY - rect.top) / (rect.height || 1),
        inside: true,
      };
      kick();
    };

    const clearTarget = () => {
      if (!target.inside) return;
      target = { ...target, inside: false };
      kick();
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

    renderer.ready.then((ok) => {
      if (disposed) return;
      if (!ok) markHazeglowReady();
    });

    const onPointerMove = (event) => {
      if (getConfig().hover <= 0 || reduceMotionMq.matches) return;
      setTargetFromEvent(event);
    };

    const onPointerUp = (event) => {
      if (event.pointerType !== "mouse") clearTarget();
    };

    const ro = new ResizeObserver(sync);
    ro.observe(shell);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", clearTarget, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    window.addEventListener("orientationchange", sync, { passive: true });
    mobileLayoutMq.addEventListener("change", sync);
    window.visualViewport?.addEventListener("resize", sync, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const lateSync = window.setTimeout(sync, 400);
    sync();

    return () => {
      disposed = true;
      window.clearTimeout(failOpen);
      window.clearTimeout(lateSync);
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", clearTarget);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      mobileLayoutMq.removeEventListener("change", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={shellRef} aria-hidden className="hazeglow-bg">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
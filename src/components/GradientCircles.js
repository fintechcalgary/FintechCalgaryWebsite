"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function GradientCircles({ count = 3 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize circles only once
    const circles = Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 200 + Math.random() * 300,
      color: Math.random() > 0.5 ? "primary" : "purple",
    }));

    containerRef.current.circles = circles;
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[100px] opacity-30
            ${i % 2 === 0 ? "bg-primary/70" : "bg-purple-500/40"}`}
          animate={{
            x: ["0%", "10%", "-10%", "0%"],
            y: ["0%", "-10%", "10%", "0%"],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            left: `${10 + i * 35}%`,
            top: `${5 + i * 40}%`,
          }}
        />
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "ai-loader--sm",
  md: "ai-loader--md",
  lg: "ai-loader--lg",
};

export function AiLoader({ text = "Loading", className, size = "lg" }) {
  const letters = Array.from(text);

  return (
    <div
      className={cn("ai-loader-root", SIZE_CLASS[size], className)}
      role="status"
      aria-label={text}
    >
      <div className="loader-wrapper">
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="loader-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
            aria-hidden="true"
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
        <div className="loader" aria-hidden="true" />
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}

/** Default export name used by the upstream demo (`Component`). */
export const Component = AiLoader;

export default AiLoader;

"use client";


const SIZE_WRAPPER = {
  sm: "h-24 w-24 text-[0.65em]",
  md: "h-[132px] w-[132px] text-[0.9em]",
  lg: "h-[180px] w-[180px] text-[1.2em]",
};

/** Static inset glow when spin animation is off (prefers-reduced-motion). */
const LOADER_RING_STATIC_SHADOW =
  "motion-reduce:shadow-[inset_0_10px_20px_0_#fff,inset_0_20px_30px_0_#ad5fff,inset_0_60px_60px_0_#471eec]";

const LOADER_RING_CLASS = `absolute left-0 top-0 z-0 w-full aspect-square rounded-full bg-transparent animate-loader-rotate motion-reduce:animate-none ${LOADER_RING_STATIC_SHADOW}`.trim();

const LOADER_LETTER_CLASS = `relative z-[1] inline-block border-0 bg-transparent animate-loader-letter motion-reduce:animate-none motion-reduce:opacity-85 motion-reduce:transform-none`.trim();

function LoaderRing() {
  return <div className={LOADER_RING_CLASS} aria-hidden="true" />;
}

function LoaderLetters({ text }) {
  return Array.from(text).map((letter, index) => (
    <span
      key={`${letter}-${index}`}
      className={LOADER_LETTER_CLASS}
      style={{ animationDelay: `${index * 0.1}s` }}
      aria-hidden="true"
    >
      {letter === " " ? "\u00A0" : letter}
    </span>
  ));
}

export function AiLoader({ text = "Loading", className, size = "lg" }) {
  const sizeClass = SIZE_WRAPPER[size] ?? SIZE_WRAPPER.lg;

  return (
    <div
      className={`inline-flex items-center justify-center leading-none ${className}`.trim()}
      role="status"
      aria-label={text}
    >
      <div
        className={`relative flex items-center justify-center rounded-full font-sans font-light text-white select-none box-border ${sizeClass}`.trim()}
      >
        <LoaderLetters text={text} />
        <LoaderRing />
      </div>
      <span className="sr-only">{text}</span>
    </div>
  );
}

/** Default export name used by the upstream demo (`Component`). */
export const Component = AiLoader;

export default AiLoader;

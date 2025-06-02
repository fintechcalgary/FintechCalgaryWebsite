export default function GradientCircles({ count = 3 }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[100px] opacity-30
            ${i % 2 === 0 ? "bg-primary/70" : "bg-purple-500/40"}`}
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

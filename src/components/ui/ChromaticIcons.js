/**
 * Shared paint server for .fc-icon glyphs.
 * The rules live in a document <style> so url(#fc-icon-gradient) resolves
 * against the page. An external stylesheet would resolve the fragment
 * against the CSS file and the gradient would not paint.
 */
export default function ChromaticIcons() {
  return (
    <>
      <svg
        width="0"
        height="0"
        className="absolute"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="fc-icon-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="32%" stopColor="#818cf8" />
            <stop offset="56%" stopColor="#c084fc" />
            <stop offset="78%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
      </svg>
      <style>{`
        .fc-icon svg,
        .fc-icon-tile svg,
        .fc-icon svg *,
        .fc-icon-tile svg * {
          stroke: url(#fc-icon-gradient);
        }
        .fc-icon svg[fill="currentColor"],
        .fc-icon-tile svg[fill="currentColor"],
        .fc-icon svg[fill="currentColor"] *,
        .fc-icon-tile svg[fill="currentColor"] *,
        .fc-icon svg [fill="currentColor"],
        .fc-icon-tile svg [fill="currentColor"] {
          fill: url(#fc-icon-gradient);
          stroke: none;
        }
      `}</style>
    </>
  );
}

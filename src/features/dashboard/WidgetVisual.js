const SPLIT_BAR = {
  amber: "bg-amber-300/90",
  emerald: "bg-emerald-300/90",
  rose: "bg-rose-300/80",
  primary: "bg-primary",
};

const SPLIT_DOT = {
  amber: "bg-amber-300",
  emerald: "bg-emerald-300",
  rose: "bg-rose-300",
  primary: "bg-primary",
};

function SplitChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (!total) return null;

  return (
    <div className="mt-4">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
        {items.map((item) => (
          <div
            key={item.label}
            className={SPLIT_BAR[item.tone] || SPLIT_BAR.primary}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-1.5 text-[11px] text-white/45"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${SPLIT_DOT[item.tone] || SPLIT_DOT.primary}`}
              aria-hidden
            />
            <span className="tabular-nums text-white/70">{item.value}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BarChart({ items }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="mt-4 space-y-1.5">
      {items.map((item) => (
        <li
          key={item.label}
          className="grid grid-cols-[minmax(0,5.25rem)_1fr_auto] items-center gap-2"
        >
          <span className="truncate text-[11px] text-white/40">{item.label}</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-primary/80"
              style={{ width: `${Math.max((item.value / max) * 100, item.value ? 8 : 0)}%` }}
            />
          </span>
          <span className="text-[11px] tabular-nums text-white/50">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

function Sparkline({ items }) {
  const width = 120;
  const height = 32;
  const max = Math.max(...items.map((item) => item.value), 1);
  const step = items.length > 1 ? width / (items.length - 1) : width;
  const points = items
    .map((item, index) => {
      const x = index * step;
      const y = height - 3 - (item.value / max) * (height - 8);
      return `${x},${y}`;
    })
    .join(" ");
  const first = items[0];
  const last = items[items.length - 1];

  return (
    <div className="mt-4">
      <p className="sr-only">
        Joins by month: {items.map((item) => `${item.label} ${item.value}`).join(", ")}
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-8 w-full text-primary"
        aria-hidden
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-white/35">
        <span>{first?.label}</span>
        <span>{last?.label}</span>
      </div>
    </div>
  );
}

export default function WidgetVisual({ chart }) {
  if (!chart?.items?.length) return null;
  if (chart.type === "split") return <SplitChart items={chart.items} />;
  if (chart.type === "spark") return <Sparkline items={chart.items} />;
  if (chart.type === "bars") return <BarChart items={chart.items} />;
  return null;
}

"use client";

import { motion } from "framer-motion";

/** Full-width bar + count badge (Insights page sentiment section). */
export function OverviewSentimentBar({ label, value, total, color }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colorClasses = {
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    gray: "bg-gray-500/20 border-gray-500/30 text-gray-400",
    red: "bg-red-500/20 border-red-500/30 text-red-400",
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-md border font-medium ${colorClasses[color]}`}
          >
            {value}
          </span>
          {total > 0 && (
            <span className="text-xs text-gray-500">{percentage}%</span>
          )}
        </div>
      </div>
      <div className="h-2.5 bg-gray-800/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className={`h-full ${
            color === "green"
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : color === "red"
                ? "bg-gradient-to-r from-red-500 to-rose-500"
                : "bg-gradient-to-r from-gray-500 to-gray-400"
          } rounded-full shadow-sm`}
        />
      </div>
    </div>
  );
}

/** Compact label + % row and thin bar (weekly digest sidebar). */
export function CompactSentimentBar({
  label,
  value,
  total,
  colorClass,
  bgClass,
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={colorClass}>{label}</span>
        <span className="text-gray-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${bgClass}`}
        />
      </div>
    </div>
  );
}

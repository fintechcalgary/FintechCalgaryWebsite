"use client";

import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import WidgetVisual from "@/features/dashboard/WidgetVisual";

/**
 * Dashboard widget used on the admin home grid.
 * `widget` is { value, label, detail } once the summary has loaded.
 */
export default function AdminCard({
  title,
  description,
  href,
  icon: Icon,
  widget,
  widgetState = "loading",
}) {
  const showMetric = widgetState === "ready" && widget;

  return (
    <Link
      href={href}
      className="fc-card group flex h-full flex-col p-5 outline-none transition-transform duration-300 hover:-translate-y-0.5 hover:bg-gray-900/60 focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="fc-icon">
          {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
        </span>
        <FiArrowUpRight
          className="h-4 w-4 text-white/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </div>
      <h3 className="fc-title text-lg">{title}</h3>

      {widgetState === "loading" ? (
        <div className="mt-4 space-y-2" aria-hidden>
          <div className="h-8 w-24 animate-pulse rounded-lg bg-white/10" />
          <div className="h-4 w-40 animate-pulse rounded-lg bg-white/5" />
        </div>
      ) : showMetric ? (
        <div className="mt-4">
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-display text-3xl font-semibold tabular-nums tracking-tight text-white">
              {widget.value}
            </span>
            <span className="text-sm text-white/45">{widget.label}</span>
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
            {widget.detail || description}
          </p>
          <WidgetVisual chart={widget.chart} />
        </div>
      ) : (
        <p className="mt-3 fc-body">{description}</p>
      )}
    </Link>
  );
}

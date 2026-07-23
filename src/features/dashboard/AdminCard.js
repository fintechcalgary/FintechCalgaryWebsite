"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Dashboard navigation card used on the admin home grid.
 */
export default function AdminCard({ title, description, icon: Icon, href, color }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-semibold text-white transition-all duration-300"
            style={{
              transform: isHovered ? "translateY(-2px)" : "translateY(0)",
            }}
          >
            {title}
          </h3>
          <div
            className={`w-10 h-10 bg-gradient-to-br from-${color}/20 to-${color}/30 rounded-lg flex items-center justify-center border border-${color}/30 transition-all duration-300 ${
              isHovered ? "scale-110 shadow-lg shadow-primary/25" : ""
            }`}
          >
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
        </div>
        <p
          className="text-gray-300 text-sm transition-all duration-300 mb-4 flex-grow"
          style={{
            opacity: isHovered ? 1 : 0.8,
          }}
        >
          {description}
        </p>
        <div className="flex justify-end mt-auto">
          <div className="text-primary group-hover:translate-x-1 transition-transform duration-300">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

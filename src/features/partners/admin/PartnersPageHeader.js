"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function PartnersPageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
      <div className="space-y-1 sm:space-y-2 min-w-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white truncate">
          Partners
        </h1>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg">
          Manage the public partners list and organization applications in one
          place
        </p>
      </div>
      <Link
        href="/dashboard"
        className="px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
      >
        <FiArrowLeft className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline">Back to Dashboard</span>
        <span className="sm:hidden">Back</span>
      </Link>
    </div>
  );
}

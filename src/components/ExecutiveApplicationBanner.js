"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiX, FiUsers, FiArrowRight } from "react-icons/fi";

export default function ExecutiveApplicationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if applications are open
    const checkApplicationsStatus = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        setApplicationsOpen(!!data.executiveApplicationsOpen);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setIsLoading(false);
      }
    };

    checkApplicationsStatus();
  }, []);

  useEffect(() => {
    // Show banner after a delay if applications are open
    if (!isLoading && applicationsOpen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isLoading, applicationsOpen]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Always render the banner, but control visibility with CSS
  return (
    <div
      className={`fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isVisible && !isLoading && applicationsOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
      style={{
        pointerEvents:
          isVisible && !isLoading && applicationsOpen ? "auto" : "none",
        visibility: isLoading ? "hidden" : "visible",
      }}
    >
      <div className="bg-gray-900/95 backdrop-blur-xl border border-primary/30 rounded-xl p-3 sm:p-4 shadow-2xl max-w-md mx-auto relative">
        {/* Close button in top right */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-white transition-colors p-1"
          aria-label="Close banner"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-2 sm:gap-3 pr-6 sm:pr-8">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-xs sm:text-sm mb-1">
              Join Our Executive Team!
            </h3>
            <p className="text-gray-300 text-xs mb-2 sm:mb-3 leading-relaxed">
              Executive applications are now open. Apply to be part of our
              leadership team.
            </p>

            <div className="flex items-center">
              <Link
                href="/executive-application"
                className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded-lg transition-all duration-200"
              >
                Apply Now
                <FiArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

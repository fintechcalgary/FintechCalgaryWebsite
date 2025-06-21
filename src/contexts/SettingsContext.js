"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [executiveApplicationsOpen, setExecutiveApplicationsOpen] =
    useState(true); // Optimistic default
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", {
          cache: "no-store",
          // Add a timeout to prevent hanging
          signal: AbortSignal.timeout(3000),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setExecutiveApplicationsOpen(!!data.executiveApplicationsOpen);
        setError(null);
      } catch (error) {
        console.warn(
          "Failed to fetch settings, using optimistic default:",
          error
        );
        // Keep the optimistic default (true) if fetch fails
        setError(error.message);
      } finally {
        setSettingsLoaded(true);
      }
    };

    fetchSettings();
  }, []);

  const value = {
    executiveApplicationsOpen,
    settingsLoaded,
    error,
    // Allow manual override if needed
    setExecutiveApplicationsOpen,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

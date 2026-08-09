"use client";

import { useEffect } from "react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import Footer from "@/components/layout/Footer";

/**
 * Shared public-page chrome: navbar + main + footer.
 * Optional document.title for client pages that already set it via useEffect.
 */
export default function PublicPageShell({
  children,
  title,
  className = "",
  mainClassName = "flex flex-col min-h-screen",
  showFooter = true,
  showNavbar = true,
}) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return (
    <main className={`${mainClassName} ${className}`.trim()}>
      {showNavbar ? <PublicNavbar /> : null}
      {children}
      {showFooter ? <Footer /> : null}
    </main>
  );
}

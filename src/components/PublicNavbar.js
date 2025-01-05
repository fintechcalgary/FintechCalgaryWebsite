import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 200;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-gray-900/30 backdrop-blur-md border-gray-800/50"
          : "border-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <motion.img
              src="/logo.svg"
              alt="Dimension Logo"
              className="w-16 h-16"
              whileHover={{ scale: 1.1 }}
            />
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/login"
              className="text-gray-200 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-primary/90 hover:bg-primary text-white px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal/ConfirmModal";
import useConfirmLogout from "@/hooks/useConfirmLogout";

export default function Navbar() {
  const {
    isOpen: showLogoutModal,
    ask: handleLogoutClick,
    close: closeLogoutModal,
    confirm: handleLogout,
  } = useConfirmLogout();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 60 && lastScrollY <= 60) {
        setIsScrolled(true);
      } else if (currentScrollY < 50 && lastScrollY >= 50) {
        setIsScrolled(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <motion.nav
        className="sticky top-0 z-50 transition-all duration-300 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 max-w-7xl mt-4">
          <div className="flex items-center justify-between gap-4 transition-all duration-300">
            <motion.div
              animate={{ scale: isScrolled ? 0.9 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href="/"
                className="flex items-center hover:opacity-90 transition-opacity"
                title="Back to FinTech Calgary"
              >
                <motion.img
                  src="/logo.svg"
                  alt="FinTech Calgary"
                  className={`transition-all duration-300 ${
                    isScrolled ? "w-12 h-12 md:w-14 md:h-14" : "w-14 h-14"
                  }`}
                  whileHover={{ scale: 1.05 }}
                />
              </Link>
            </motion.div>

            <motion.div
              animate={{ scale: isScrolled ? 0.9 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleLogoutClick}
                className="relative px-5 py-2.5 md:px-6 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 text-white text-sm md:text-base font-medium transition-all hover:bg-white/15 hover:scale-[1.02] whitespace-nowrap cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Log Out</span>
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <Modal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your dashboard."
        confirmText="Log Out"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}

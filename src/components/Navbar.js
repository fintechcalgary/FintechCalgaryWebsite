"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import Modal from "./Modal";

export default function Navbar() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowLogoutModal(false);
    router.push("/login");
  };

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
        className="sticky top-0 z-50 transition-all duration-300 bg-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 max-w-7xl mt-4">
          <div className="hidden md:flex items-center justify-between transition-all duration-300">
            {/* Logo - hidden on scroll */}
            <motion.div
              className="flex items-center gap-3 flex-1"
              animate={{
                opacity: isScrolled ? 0 : 1,
                width: isScrolled ? 0 : "auto",
              }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>

            {/* Centered Navigation Links */}
            <motion.div
              className="flex items-center justify-center flex-[2]"
              animate={{
                x: isScrolled ? 0 : 0,
                scale: isScrolled ? 0.95 : 1,
                marginTop: isScrolled ? "1.25rem" : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-8 bg-gray-800/70 py-3 px-8 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700/30">
                {[
                  ["Events", "/dashboard#events"],
                  ["Members", "/dashboard#members"],
                  ["Info", "/info"],
                ].map(([title, path]) => (
                  <Link
                    key={path}
                    href={path}
                    className="text-white text-base font-medium hover:text-purple-300 transition-all relative group"
                  >
                    {title}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-300 transition-all group-hover:w-full" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Logout Button - hidden on scroll */}
            <motion.div
              animate={{
                opacity: isScrolled ? 0 : 1,
                width: isScrolled ? 0 : "auto",
              }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex justify-end"
            >
              <button
                onClick={handleLogoutClick}
                className="px-7 py-2.5 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 text-white font-medium transition-all hover:bg-white/15 hover:scale-[1.02] whitespace-nowrap cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Log Out</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
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
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle - updated styling */}
          <div className="flex md:hidden justify-between items-center h-16">
            <Link href="/dashboard">
              <motion.img
                src="/logo.svg"
                alt="Dimension Logo"
                className="w-14 h-14"
                whileHover={{ scale: 1.1 }}
              />
            </Link>
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white text-3xl focus:outline-none p-2 rounded-lg hover:bg-gray-800/50"
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </motion.button>
          </div>

          {/* Mobile Menu - updated animation and styling */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isMenuOpen ? 1 : 0,
              height: isMenuOpen ? "auto" : 0,
            }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            <div className="bg-gray-800/90 p-4 rounded-lg mt-2 backdrop-blur-sm">
              {[
                { href: "/dashboard#events", label: "Events" },
                { href: "/dashboard#members", label: "Members" },
                { href: "/info", label: "Info" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white text-base font-medium mb-3 hover:text-purple-400"
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogoutClick();
                }}
                className="block text-white text-base font-medium mb-3 hover:text-red-400"
              >
                Log Out
              </button>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Log Out Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
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

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
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-transparent" : "bg-transparent"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div
            className={`hidden md:flex items-center ${
              isScrolled ? "flex-col gap-4" : "justify-between h-16"
            } transition-all duration-300`}
          >
            {/* Logo */}
            <div
              className={`flex items-center gap-3 ${
                isScrolled ? "hidden" : ""
              }`}
            >
              <Link
                href="/dashboard"
                className="flex items-center gap-3 hover:opacity-90 transition-opacity"
              >
                <motion.img
                  src="/logo.svg"
                  alt="Dimension Logo"
                  className="w-16 h-16 transition-transform duration-300"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                />
              </Link>
            </div>

            {/* Buttons */}
            <div
              className={`hidden md:flex items-center justify-center gap-4 bg-gray-800/70 py-2 px-6 rounded-lg shadow-md`}
            >
              <Link
                href="/about"
                className="text-white text-base font-medium hover:text-purple-300 transition-all"
              >
                About
              </Link>
              <Link
                href="/careers"
                className="text-white text-base font-medium hover:text-purple-300 transition-all"
              >
                Careers
              </Link>
              <Link
                href="/blog"
                className="text-white text-base font-medium hover:text-purple-300 transition-all"
              >
                Blog
              </Link>
              <Link
                href="/changelog"
                className="text-white text-base font-medium hover:text-purple-300 transition-all"
              >
                Changelog
              </Link>
              <button
                onClick={handleLogoutClick}
                className={`${
                  !isScrolled ? "hidden" : "block"
                } text-base px-6 py-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all`}
              >
                Log Out
              </button>
            </div>

            {/* Log Out Button */}
            <div
              className={`${
                !isScrolled ? "hidden md:flex" : "hidden"
              } items-center`}
            >
              <button
                onClick={handleLogoutClick}
                className="text-base px-7 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden justify-between items-center h-16">
            <Link href="/dashboard">
              <motion.img
                src="/logo.svg"
                alt="Dimension Logo"
                className="w-14 h-14"
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white text-3xl focus:outline-none"
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-gray-800/90 p-4 rounded-lg mt-2">
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white text-base font-medium mb-3 hover:text-purple-400"
              >
                About
              </Link>
              <Link
                href="/careers"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white text-base font-medium mb-3 hover:text-purple-400"
              >
                Careers
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white text-base font-medium mb-3 hover:text-purple-400"
              >
                Blog
              </Link>
              <Link
                href="/changelog"
                onClick={() => setIsMenuOpen(false)}
                className="block text-white text-base font-medium mb-3 hover:text-purple-400"
              >
                Changelog
              </Link>
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
          )}
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

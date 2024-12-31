"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiHome, FiCalendar, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import Modal from "./Modal";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setShowLogoutModal(false);
    router.push("/login");
  };

  return (
    <>
      <motion.nav
        className="relative overflow-hidden shadow-lg"
        initial={{ background: "linear-gradient(145deg, #1c003a, #4c008c)" }}
        animate={{
          background: [
            "linear-gradient(145deg, #1c003a, #4c008c)",
            "linear-gradient(145deg, #2e004d, #5e009e)",
            "linear-gradient(145deg, #1c003a, #4c008c)",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="container mx-auto px-4 max-w-7xl text-white">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <motion.img
                src="/logo.svg"
                alt="FinTech Calgary Logo"
                className="w-10 h-10 rounded-full border-2 border-purple-400 transition-transform duration-300"
                whileHover={{ scale: 1.15, rotate: 5 }}
              />
              <span className="text-2xl font-bold tracking-wider text-white">
                FINTECH
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-300 hover:text-purple-200 transition-colors text-base font-medium"
              >
                <FiHome className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard#events"
                className="flex items-center gap-2 text-gray-300 hover:text-purple-200 transition-colors text-base font-medium"
              >
                <FiCalendar className="w-5 h-5" />
                Events
              </Link>
            </div>

            {/* Hamburger Menu */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-purple-200 focus:outline-none"
              >
                {isMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Log Out Button */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-all duration-300 text-base font-medium"
              >
                <FiLogOut className="w-5 h-5" />
                Log Out
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden flex flex-col gap-3 mt-4 bg-gray-900 p-3 rounded-lg">
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-purple-200 transition-colors text-base font-medium"
              >
                <FiHome className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/dashboard#events"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-purple-200 transition-colors text-base font-medium"
              >
                <FiCalendar className="w-5 h-5" />
                Events
              </Link>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-all duration-300 text-base font-medium"
              >
                <FiLogOut className="w-5 h-5" />
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

"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiHome, FiCalendar, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <nav className="bg-gray-800/50 border-b border-gray-700">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and name */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <span className="text-xl font-bold tracking-wide">
              Fintech Calgary
            </span>
          </Link>

          {/* Center - Navigation items */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              <FiHome className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/dashboard#events"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              <FiCalendar className="w-4 h-4" />
              Events
            </Link>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

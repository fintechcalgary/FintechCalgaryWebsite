import Link from "next/link";
import { motion } from "framer-motion";

export default function PublicNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300">
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
        </div>
      </div>
    </nav>
  );
}

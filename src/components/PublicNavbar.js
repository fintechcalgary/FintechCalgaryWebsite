import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > 60 && lastScrollY <= 60) {
            setIsScrolled(true);
          } else if (currentScrollY < 50 && lastScrollY >= 50) {
            setIsScrolled(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 mt-4 transform-gpu`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center h-24">
          <motion.div
            className={`w-full flex ${
              isScrolled ? "justify-center" : "justify-between"
            }`}
            animate={{
              scale: isScrolled ? 0.95 : 1,
              x: isScrolled ? "0%" : "0%",
            }}
            layout
            transition={{
              duration: 0.3,
              ease: "easeOut",
              layout: {
                duration: 0.3,
                ease: "easeOut",
              },
            }}
          >
            {!isScrolled && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/" className="flex items-center group">
                  <motion.img
                    src="/logo.svg"
                    alt="Dimension Logo"
                    className="w-11 h-11 group-hover:brightness-110 transition-all"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            )}

            <motion.div
              className={`flex items-center gap-2 ${
                isScrolled
                  ? "bg-gray-800/70 backdrop-blur-md border border-gray-700/30"
                  : ""
              } rounded-2xl px-3 py-2`}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href="/" className="flex items-center mr-4 group">
                    <motion.img
                      src="/logo.svg"
                      alt="Dimension Logo"
                      className="w-11 h-11 group-hover:brightness-110 transition-all"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              )}
              <div className="flex items-center space-x-4">
                {[
                  ["About", "/about"],
                  ["Events", "/events"],
                  ["Executives", "/executives"],
                  ["Partners", "/partners"],
                  ["Contact", "/contact"],
                ].map(([title, path]) => (
                  <Link key={path} href={path}>
                    <motion.div
                      className={`relative px-6 py-2.5 text-sm font-semibold rounded-xl text-gray-200 hover:text-white transition-colors
                        ${
                          pathname === path
                            ? isScrolled
                              ? "bg-gray-700/50"
                              : "bg-gray-700/30"
                            : isScrolled
                            ? "hover:bg-gray-700/30"
                            : "hover:bg-gray-700/20"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {title}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center h-20">
          <Link href="/">
            <motion.img
              src="/logo.svg"
              alt="Dimension Logo"
              className="w-10 h-10"
              whileHover={{ scale: 1.05 }}
            />
          </Link>

          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-xl text-gray-200 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: isMenuOpen ? "auto" : 0,
            opacity: isMenuOpen ? 1 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="md:hidden overflow-hidden"
        >
          <div
            className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-3 mb-4 space-y-1`}
          >
            {[
              ["About", "/about"],
              ["Events", "/events"],
              ["Executives", "/executives"],
              ["Partners", "/partners"],
              ["Contact", "/contact"],
            ].map(([title, path]) => (
              <Link key={path} href={path} onClick={() => setIsMenuOpen(false)}>
                <motion.div
                  className={`px-4 py-3 text-gray-200 hover:text-white rounded-xl transition-colors
                    ${
                      pathname === path
                        ? "bg-gray-700/50"
                        : "hover:bg-gray-700/30"
                    }`}
                  whileHover={{ backgroundColor: "rgba(109, 40, 217, 0.1)" }}
                >
                  {title}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}

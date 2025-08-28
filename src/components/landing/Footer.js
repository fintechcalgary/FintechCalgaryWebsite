import Link from "next/link";
import { FiMail, FiMapPin, FiUsers, FiTrendingUp } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900/80 to-gray-900/50 border-t border-gray-800/50 z-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 md:px-4 py-16 md:py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Main Brand Section */}
          <div className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-primary/30">
                <FiTrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white">FinTech Calgary</h3>
            </div>
            <p className="text-gray-300 max-w-md leading-relaxed">
              Innovating the future of finance in Calgary. Join us in shaping
              tomorrow&apos;s financial landscape.
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-primary" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/events", label: "Events" },
                { href: "/executives", label: "Executives" },
                { href: "/partners", label: "Partners" },
                { href: "/contact", label: "Contact" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-primary transition-all duration-300 inline-flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-primary" />
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="text-gray-300 flex items-start gap-2">
                <FiMapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">University of Calgary</p>
                  <p className="text-gray-400 text-sm">2500 University Dr NW</p>
                  <p className="text-gray-400 text-sm">Calgary, AB T2N 1N4</p>
                </div>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:fintechcalgary@gmail.com"
                  className="text-primary hover:text-purple-400 transition-colors duration-300 inline-flex items-center gap-2 group"
                >
                  <FiMail className="w-4 h-4" />
                  <span className="group-hover:underline">
                    fintechcalgary@gmail.com
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800/50 mt-12 md:mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} FinTech Calgary. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-primary transition-colors duration-300"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

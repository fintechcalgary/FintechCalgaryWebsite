import Link from "next/link";
import Image from "next/image";
import { FiMail, FiMapPin, FiUsers } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="relative z-50 overflow-hidden border-t border-gray-800/50 bg-gradient-to-b from-gray-900/80 to-gray-900/50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-6 py-16 md:py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <div className="space-y-6 md:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="FinTech Calgary"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <h3 className="font-brand text-2xl font-bold tracking-tight text-white">
                FinTech Calgary
              </h3>
            </div>
            <p className="max-w-md leading-relaxed text-gray-300">
              Innovating the future of finance in Calgary. Join us in shaping
              tomorrow&apos;s financial landscape.
            </p>
          </div>

          <div>
            <h4 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <FiUsers className="h-5 w-5 text-primary" />
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
                    className="group inline-flex items-center text-gray-300 transition-all duration-300 hover:text-primary"
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
              <FiMapPin className="h-5 w-5 text-primary" />
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300">
                <FiMapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-gray-300">University of Calgary</p>
                  <p className="text-sm text-gray-400">2500 University Dr NW</p>
                  <p className="text-sm text-gray-400">Calgary, AB T2N 1N4</p>
                </div>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:fintech.calgary@gmail.com"
                  className="fc-link group inline-flex items-center gap-2"
                >
                  <FiMail className="h-4 w-4" />
                  <span className="group-hover:underline">
                    fintech.calgary@gmail.com
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800/50 pt-8 md:mt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} FinTech Calgary. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 transition-colors duration-300 hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 transition-colors duration-300 hover:text-primary"
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

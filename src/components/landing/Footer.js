import Link from "next/link";
import { FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 z-50">
      <div className="container mx-auto px-6 md:px-4 py-16 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-2xl font-bold text-white">FinTech Calgary</h3>
            <p className="text-gray-400 max-w-md">
              Innovating the future of finance at the University of Calgary.
              Join us in shaping tomorrow's financial landscape.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-primary transition-colors inline-flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/members"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Members
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contact</h4>
            <ul className="space-y-3">
              <li className="text-gray-400">University of Calgary</li>
              <li className="text-gray-400">2500 University Dr NW</li>
              <li className="text-gray-400">Calgary, AB T2N 1N4</li>
              <li>
                <a
                  href="mailto:fintech.calgary@gmail.com"
                  className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-2"
                >
                  <FiMail className="inline" />
                  <span>fintech.calgary@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 md:mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} FinTech Calgary. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

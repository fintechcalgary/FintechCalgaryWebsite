import Link from "next/link";
import { FiGithub, FiLinkedin, FiInstagram, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 z-50">
      <div className="container mx-auto px-6 md:px-4 py-16 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Fintech Calgary</h3>
            <p className="text-gray-400">
              Innovating the future of finance at the University of Calgary
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  About Us
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
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">University of Calgary</li>
              <li className="text-gray-400">2500 University Dr NW</li>
              <li className="text-gray-400">Calgary, AB T2N 1N4</li>
              <li>
                <a
                  href="mailto:info@fintechcalgary.com"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  info@fintechcalgary.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com/fintech-calgary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <FiGithub className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/company/fintechcalgary/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <FiLinkedin className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/fintech.calgary/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <FiInstagram className="w-6 h-6" />
              </a>
              <a
                href="mailto:fintechcalgary@gmail.com"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <FiMail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 md:mt-8 pt-12 md:pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Fintech Calgary. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

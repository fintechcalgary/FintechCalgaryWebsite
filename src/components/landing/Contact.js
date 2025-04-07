import {
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiLinkedin,
  FiInstagram,
  FiGithub,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";

const ContactCard = ({ children, icon: Icon, title }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-10 rounded-2xl 
                 border border-gray-700/50 hover:border-primary/50 transition-all duration-500"
    >
      {/* Animated background gradient */}
      <div
        style={{
          opacity: isHovered ? 1 : 0,
          transform: `scale(${isHovered ? 1 : 0.8})`,
          transition: "opacity 0.3s, transform 0.3s",
        }}
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl"
      />

      {/* Animated circles in background */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div
          style={{
            transform: `scale(${isHovered ? 1.2 : 1})`,
            opacity: isHovered ? 0.1 : 0,
            transition: "opacity 0.6s, transform 0.6s",
          }}
          className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl"
        />
        <div
          style={{
            transform: `scale(${isHovered ? 1.2 : 1})`,
            opacity: isHovered ? 0.1 : 0,
            transition: "opacity 0.6s, transform 0.6s",
          }}
          className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"
        />
      </div>

      <div className="flex flex-col items-center text-center relative">
        <div
          style={{
            transform: `scale(${isHovered ? 1.1 : 1})`,
            transition: "transform 0.3s",
          }}
          className="w-20 h-20 mb-8 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        >
          <Icon className="w-10 h-10 text-primary" />
        </div>

        <h3
          style={{
            transform: `translateY(${isHovered ? -5 : 0}px)`,
            transition: "transform 0.3s",
          }}
          className="text-2xl font-bold text-white mb-4"
        >
          {title}
        </h3>

        <div
          style={{
            transform: `translateY(${isHovered ? 5 : 0}px)`,
            opacity: isHovered ? 1 : 0.8,
            transition: "opacity 0.3s, transform 0.3s",
          }}
          className="relative z-10"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const SocialIcon = ({ href, icon: Icon, className = "" }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`text-gray-400 hover:text-primary transition-colors hover:scale-110 active:scale-90 ${className}`}
    style={{ display: "inline-block", transition: "transform 0.2s" }}
  >
    <Icon className="w-6 h-6" />
  </a>
);

export default function Contact() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="text-6xl font-bold mb-20 text-center group cursor-pointer relative">
          <Link
            href="/contact"
            className="flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300"
          >
            <div className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
                Contact Us
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 w-full bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
            </div>
          </Link>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <ContactCard icon={FiMail} title="Email">
            <a
              href="mailto:fintech.calgary@gmail.com"
              className="text-lg text-gray-300 hover:text-primary transition-colors duration-300"
            >
              fintech.calgary@gmail.com
            </a>
          </ContactCard>

          <ContactCard icon={FiMapPin} title="Location">
            <div className="text-lg text-gray-300 space-y-2">
              <p>University of Calgary</p>
              <p>2500 University Dr NW</p>
              <p>Calgary, AB T2N 1N4</p>
            </div>
          </ContactCard>

          <ContactCard icon={FiMessageSquare} title="Social Media">
            <p className="text-lg text-gray-300 mb-6">
              Follow us for the latest updates
            </p>
            <div className="flex justify-center space-x-6">
              <SocialIcon
                href="https://www.linkedin.com/company/fintechcalgary/"
                icon={FiLinkedin}
              />
              <SocialIcon
                href="https://www.instagram.com/fintech.calgary/"
                icon={FiInstagram}
              />
              <SocialIcon
                href="mailto:fintechcalgary@gmail.com"
                icon={FiMail}
              />
              <SocialIcon
                href="https://github.com/fintech-calgary"
                icon={FiGithub}
              />
              <SocialIcon
                href="https://www.tiktok.com/@fintech.calgary"
                icon={FaTiktok}
                className="w-5 h-5"
              />
            </div>
          </ContactCard>
        </div>
      </div>
    </section>
  );
}

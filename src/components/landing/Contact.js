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
                 border border-gray-700/50 hover:border-primary/50 transition-all duration-500 overflow-hidden"
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
          className="w-20 h-20 mb-8 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-primary/30"
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
    className={`relative p-3 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110 active:scale-90 hover:bg-gray-700/50 hover:border-primary/30 group ${className}`}
    style={{ display: "inline-block" }}
  >
    {/* Hover background effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Icon with relative positioning */}
    <Icon className="w-6 h-6 relative z-10" />
  </a>
);

export default function Contact() {
  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-6 relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Animated title */}
        <h2
          className="text-6xl font-bold mb-20 text-center group relative"
          style={{
            opacity: 1,
            transform: "translateY(0)",
            transition: "opacity 0.5s, transform 0.5s",
          }}
        >
          <div className="relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
              Get In Touch
            </span>
            <div
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"
              style={{ width: "100%" }}
            />
          </div>
        </h2>

        {/* Contact Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <ContactCard icon={FiMail} title="Email Us">
            <p className="text-gray-300 mb-4">
              Have questions? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:info@fintechcalgary.com"
              className="text-primary hover:text-purple-400 transition-colors duration-300 font-medium"
            >
              info@fintechcalgary.com
            </a>
          </ContactCard>

          <ContactCard icon={FiMapPin} title="Location">
            <p className="text-gray-300 mb-4">
              Based in the heart of Calgary&apos;s tech community.
            </p>
            <p className="text-primary font-medium">Calgary, Alberta, Canada</p>
          </ContactCard>

          <ContactCard icon={FiMessageSquare} title="Connect">
            <p className="text-gray-300 mb-4">
              Follow us on social media for updates and insights.
            </p>
            <div className="flex justify-center space-x-3">
              <SocialIcon
                href="https://linkedin.com/company/fintechcalgary"
                icon={FiLinkedin}
              />
              <SocialIcon
                href="https://instagram.com/fintechcalgary"
                icon={FiInstagram}
              />
              <SocialIcon
                href="https://github.com/fintechcalgary"
                icon={FiGithub}
              />
              <SocialIcon
                href="https://tiktok.com/@fintechcalgary"
                icon={FaTiktok}
              />
            </div>
          </ContactCard>
        </div>
      </div>
    </section>
  );
}

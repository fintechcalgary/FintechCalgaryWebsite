import {
  FiMail,
  FiMapPin,
  FiLinkedin,
  FiInstagram,
  FiGithub,
  FiArrowRight,
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";

const SocialIcon = ({ href, icon: Icon, label }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-center gap-3 px-4 py-3 rounded-lg 
                 bg-gray-900/40 backdrop-blur-sm border border-gray-700/30 
                 hover:border-primary/50 hover:bg-gray-800/60
                 transition-all duration-300 hover:translate-x-1"
    >
      <Icon className={`w-5 h-5 transition-colors duration-300 ${
        isHovered ? 'text-primary' : 'text-gray-400'
      }`} />
      <span className={`text-sm font-medium transition-colors duration-300 ${
        isHovered ? 'text-white' : 'text-gray-400'
      }`}>
        {label}
      </span>
      <FiArrowRight className={`w-4 h-4 transition-all duration-300 ${
        isHovered ? 'text-primary translate-x-1 opacity-100' : 'text-transparent opacity-0 -translate-x-1'
      }`} />
    </a>
  );
};

export default function Contact() {
  const [hoveredEmail, setHoveredEmail] = useState(false);

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
               backgroundSize: '40px 40px'
             }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="mb-16 md:mb-20 text-center">
          <Link href="/contact" className="group inline-block relative">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6">
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500 animate-gradient">
                  Get In Touch
                </span>
                <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300">
                  Get In Touch
                </span>
              </span>
            </h2>
            <div className="relative h-1 w-full max-w-xs mx-auto mt-2 md:mt-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"></div>
              <div className="relative h-full bg-gradient-to-r from-primary via-purple-400 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          </Link>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Email & Location */}
          <div className="space-y-6">
            {/* Email Section */}
            <div 
              className="relative group p-8 rounded-2xl border border-gray-800/50 
                         bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm
                         hover:border-primary/30 transition-all duration-500 overflow-hidden"
              onMouseEnter={() => setHoveredEmail(true)}
              onMouseLeave={() => setHoveredEmail(false)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 
                              flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <FiMail className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-2">Send us an email</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    Questions, partnerships, or just want to chat? We&apos;re all ears.
                  </p>
                  <a
                    href="mailto:fintechcalgary@gmail.com"
                    className="inline-flex items-center gap-2 text-primary hover:text-purple-400 
                             transition-colors duration-300 font-medium group/link"
                  >
                    <span className="text-base">fintechcalgary@gmail.com</span>
                    <FiArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                      hoveredEmail ? 'translate-x-1' : ''
                    }`} />
                  </a>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="relative group p-8 rounded-2xl border border-gray-800/50 
                          bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm
                          hover:border-primary/30 transition-all duration-500 overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 
                              flex items-center justify-center group-hover:bg-purple-500/20 transition-colors duration-300">
                  <FiMapPin className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">Find us</h3>
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">
                    Based in Calgary, connecting fintech innovators across Canada and beyond.
                  </p>
                  <p className="text-purple-400 font-medium">Calgary, Alberta, Canada</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Social Media */}
          <div className="relative group p-8 rounded-2xl border border-gray-800/50 
                        bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm
                        hover:border-primary/30 transition-all duration-500 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 
                              flex items-center justify-center group-hover:bg-pink-500/20 transition-colors duration-300">
                  <FiGithub className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Connect with us</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Follow along for updates, insights, and fintech news.
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <SocialIcon
                  href="https://linkedin.com/company/fintechcalgary"
                  icon={FiLinkedin}
                  label="LinkedIn"
                />
                <SocialIcon
                  href="https://instagram.com/fintechcalgary"
                  icon={FiInstagram}
                  label="Instagram"
                />
                <SocialIcon
                  href="https://github.com/fintechcalgary"
                  icon={FiGithub}
                  label="GitHub"
                />
                <SocialIcon
                  href="https://tiktok.com/@fintechcalgary"
                  icon={FaTiktok}
                  label="TikTok"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

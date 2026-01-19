import Link from "next/link";
import { FiArrowRight, FiTarget, FiUsers, FiTrendingUp } from "react-icons/fi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useState } from "react";

const ServiceCard = ({ title, description, icon: Icon, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      key={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl 
        border border-gray-700/50 hover:border-primary/50 
        transition-all duration-500 relative flex-1 overflow-hidden"
    >
      <div className="h-full flex flex-col relative z-10">
        {/* Icon with enhanced styling */}
        <div className="mb-4">
          <div
            className={`w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-primary/30 transition-all duration-300 ${
              isHovered ? "scale-110" : ""
            }`}
          >
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>

        <h3
          className="text-2xl font-bold text-white mb-3 transition-all duration-300"
          style={{
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
          }}
        >
          {title}
        </h3>
        <p
          className="text-gray-300 leading-relaxed mb-4 flex-grow transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0.9,
          }}
        >
          {description}
        </p>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-primary transition-all duration-300 mt-auto group/link"
        >
          <span className="font-semibold group-hover/link:translate-x-1 transition-transform duration-300">
            Learn more
          </span>
          <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default function AboutUs() {
  return (
    <section id="about" className="py-16 relative overflow-hidden">
      {/* Additional floating elements */}
      <div
        className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="container mx-auto px-6 relative">
        {/* Title */}
        <div className="mb-16 md:mb-20 text-center">
          <Link href="/about" className="group inline-block relative">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6">
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500 animate-gradient">
                  About Us
                </span>
                <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300">
                  About Us
                </span>
              </span>
            </h2>
            <div className="relative h-1 w-full max-w-xs mx-auto mt-2 md:mt-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"></div>
              <div className="relative h-full bg-gradient-to-r from-primary via-purple-400 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Enhanced Left Section (Large Card) */}
          <div
            className="group lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 lg:p-10 
              border border-gray-700/50 hover:border-primary/50 
              transition-all duration-500 flex flex-col justify-between backdrop-blur-xl overflow-hidden relative"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-primary/30">
                  <FiTarget className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                FinTech Calgary is a fintech association dedicated to bridging
                the gap between fintech companies and key business decision
                makers. Through hands-on projects, industry events, and
                collaborative initiatives, we create meaningful B2B engagement
                opportunities for both students and industry partners. Our
                association goes beyond visibility, we provide practical market
                access, informed student-driven insights, and direct connections
                that support real business outcomes.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-primary transition-all duration-300 group/link"
              >
                <span className="font-semibold group-hover/link:translate-x-1 transition-transform duration-300">
                  Learn more
                </span>
                <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="block mt-6 relative z-10 items-center justify-center overflow-hidden h-full">
              <DotLottieReact
                src="/lottie/crypto.lottie"
                autoplay
                loop
                className="w-full h-full"
                renderer="svg"
              />
            </div>
          </div>

          {/* Enhanced Right Section (Two Stacked Cards) */}
          <div className="flex flex-col gap-6 h-full">
            <ServiceCard
              title="Our Services"
              description="We provide tech companies with a platform to showcase their solutions to targeted businesses. Through digital marketing and partner features, we connect innovative technologies with decision-makers to drive adoption and growth."
              icon={FiTrendingUp}
              index={0}
            />
            <ServiceCard
              title="Our Network"
              description="FinTech Calgary connects fintech innovators with enterprise buyers across payments, hospitality, and services. We bridge the gap between solution providers and businesses, fostering strategic partnerships that advance financial technology."
              icon={FiUsers}
              index={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

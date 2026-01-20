import Link from "next/link";
import { FiArrowRight, FiUsers, FiCode, FiTrendingUp } from "react-icons/fi";
import { useState } from "react";

const FeatureCard = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getColorClasses = (idx) => {
    if (idx === 0) {
      return {
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        icon: 'text-primary',
        hoverBg: 'group-hover:bg-primary/20'
      };
    } else if (idx === 1) {
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        icon: 'text-purple-400',
        hoverBg: 'group-hover:bg-purple-500/20'
      };
    } else {
      return {
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        icon: 'text-pink-400',
        hoverBg: 'group-hover:bg-pink-500/20'
      };
    }
  };
  
  const colorScheme = getColorClasses(index);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative p-8 rounded-2xl border border-gray-800/50 
                 bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm
                 hover:border-primary/30 transition-all duration-500"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div 
            className={`flex-shrink-0 w-14 h-14 rounded-xl ${colorScheme.bg} ${colorScheme.border} border
                        flex items-center justify-center ${colorScheme.hoverBg} 
                        transition-all duration-300`}
          >
            <div className={colorScheme.icon}>
              {feature.icon}
            </div>
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
              {feature.title}
            </h3>
          </div>
        </div>

        <p className="text-gray-400 leading-relaxed text-base flex-1">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export default function MissionStatement() {
  const features = [
    {
      icon: <FiUsers />,
      title: "To Educate",
      description:
        "Learn about the evolving world of Fintech and its transformative impact",
    },
    {
      icon: <FiCode />,
      title: "To Inspire",
      description: "Foster creativity and innovation in discovering new ideas",
    },
    {
      icon: <FiTrendingUp />,
      title: "To Shape",
      description: "Be part of shaping the future of financial technology",
    },
  ];

  return (
    <section id="join" className="py-24 relative overflow-hidden">
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
          <Link href="/about" className="group inline-block relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 md:mb-6">
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500 animate-gradient">
                  Mission Statement
                </span>
                <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300">
                  Mission Statement
                </span>
              </span>
            </h2>
            <div className="relative h-1 w-full max-w-xs mx-auto mt-2 md:mt-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"></div>
              <div className="relative h-full bg-gradient-to-r from-primary via-purple-400 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* CTA button */}
        <div className="flex justify-center">
          <Link
            href="/join"
            className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-full 
                     bg-primary hover:bg-primary/90 text-white 
                     transition-all duration-300 hover:shadow-xl hover:shadow-primary/25"
          >
            Join Now
            <FiArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

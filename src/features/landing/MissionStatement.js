import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const FeatureCard = ({ feature }) => {
  return (
    <div
      className="group relative p-8 rounded-2xl border border-gray-800/50 
                 bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm
                 hover:border-primary/30 transition-all duration-500"
    >
      <div className="flex flex-col h-full">
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>

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
      title: "To Educate",
      description:
        "Learn about the evolving world of Fintech and its transformative impact",
    },
    {
      title: "To Inspire",
      description: "Foster creativity and innovation in discovering new ideas",
    },
    {
      title: "To Shape",
      description: "Be part of shaping the future of financial technology",
    },
  ];

  return (
    <section id="join" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="mb-16 md:mb-20 text-center">
          <Link href="/about" className="group inline-block relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 md:mb-6">
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400/75">
                  Mission Statement
                </span>
                <span className="absolute inset-0 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400/75 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300">
                  Mission Statement
                </span>
              </span>
            </h2>
            <div className="relative h-1 w-full max-w-xs mx-auto mt-2 md:mt-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"></div>
              <div className="relative h-full bg-gradient-to-r from-primary to-purple-400/75 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
            </div>
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>

        {/* CTA button */}
        <div className="flex justify-center">
          <Link
            href="/join"
            className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-xl 
                     bg-primary hover:bg-primary/90 text-white 
                     transition-all duration-300 hover:shadow-xl hover:shadow-primary/15"
          >
            Join Now
            <FiArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

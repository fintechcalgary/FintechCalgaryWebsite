import Link from "next/link";
import { FiArrowRight, FiUsers, FiCode, FiTrendingUp } from "react-icons/fi";

export default function JoinUs() {
  const features = [
    {
      icon: <FiUsers />,
      title: "Community",
      description:
        "Join a diverse network of students passionate about fintech",
    },
    {
      icon: <FiCode />,
      title: "Innovation",
      description: "Work on cutting-edge projects and learn new technologies",
    },
    {
      icon: <FiTrendingUp />,
      title: "Growth",
      description: "Develop your skills and advance your career in fintech",
    },
  ];

  return (
    <section id="join" className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[128px] -translate-x-1/2 opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[96px] translate-x-1/2 opacity-20"></div>

      <div className="container mx-auto px-6 relative">
        {/* Title */}
        <h2 className="text-6xl font-bold mb-20 text-center group cursor-pointer relative">
          <div className="relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
              Join Us
            </span>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
          </div>
        </h2>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 mb-6 bg-primary/10 rounded-xl flex items-center justify-center text-2xl text-primary group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href="/join"
            className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-medium rounded-full 
                     bg-primary hover:bg-primary/90 text-white transition-all duration-300 
                     hover:shadow-xl hover:shadow-primary/25 transform hover:-translate-y-1"
          >
            Join Now
            <FiArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

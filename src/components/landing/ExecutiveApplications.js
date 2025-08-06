import Link from "next/link";
import { FiArrowRight, FiUsers, FiAward, FiTrendingUp } from "react-icons/fi";

export default function ExecutiveApplications() {
  return (
    <section id="executive-applications" className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[128px] -translate-x-1/2 opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[96px] translate-x-1/2 opacity-20"></div>

      <div className="container mx-auto px-6 relative">
        {/* Title */}
        <h2 className="text-6xl font-bold mb-20 text-center">
          <div className="group inline-block relative">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary">
                  Executive Applications
                </span>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </h2>

        <div className="max-w-6xl mx-auto">
          {/* Main CTA Card */}
          <div
            className="group bg-gradient-to-br from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl p-12 lg:p-16 
            shadow-2xl border border-primary/30 hover:border-primary/50 
            transition-all duration-500 backdrop-blur-xl relative overflow-hidden mb-12"
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-400/10 to-primary/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 text-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-full mb-6 shadow-lg">
                  <FiAward className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                  Join Our Executive Team
                </h3>
                <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
                  Take on a leadership role in shaping the future of fintech in
                  Calgary. We&apos;re looking for passionate individuals to join
                  our executive team and help drive innovation in the financial
                  technology sector.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    icon: FiUsers,
                    title: "Leadership",
                    description:
                      "Lead initiatives and shape the direction of our organization",
                  },
                  {
                    icon: FiAward,
                    title: "Growth",
                    description:
                      "Develop your skills and expand your professional network",
                  },
                  {
                    icon: FiTrendingUp,
                    title: "Impact",
                    description:
                      "Make a real difference in the fintech community",
                  },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-4 border border-gray-700/50">
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/executive-application"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full 
                  bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-purple-700 
                  text-white transition-all duration-300 
                  hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-1
                  border border-primary/50 hover:border-primary group"
              >
                Apply Now
                <FiArrowRight className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "What We're Looking For",
                description:
                  "Passionate individuals with experience in fintech, business development, or community leadership. We value creativity, strategic thinking, and a commitment to advancing financial technology in Calgary.",
                link: "/about",
                linkText: "Learn about our team",
              },
              {
                title: "Benefits & Opportunities",
                description:
                  "Gain valuable leadership experience, expand your professional network, and contribute to the growth of Calgary's fintech ecosystem. Access exclusive events, mentorship opportunities, and industry connections.",
                link: "/partners",
                linkText: "View partners",
              },
            ].map((card, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-8 
                  shadow-xl hover:shadow-2xl border border-gray-700/50 hover:border-primary/50 
                  transition-all duration-500 backdrop-blur-xl relative overflow-hidden
                  border-l-4 border-l-purple-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="relative z-10 h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {card.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6 flex-grow">
                    {card.description}
                  </p>
                  <Link
                    href={card.link}
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-primary transition-colors duration-300"
                  >
                    <span className="font-semibold">{card.linkText}</span>
                    <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function AboutUs() {
  return (
    <section id="about" className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[128px] -translate-x-1/2 opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[96px] translate-x-1/2 opacity-20"></div>

      <div className="container mx-auto px-6 relative">
        {/* Title */}
        <h2 className="text-6xl font-bold mb-20 text-center">
          <Link href="/about" className="group inline-block relative">
            <div className="flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300">
              <div className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary">
                  About Us
                </span>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-full"></div>
              </div>
            </div>
          </Link>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* Left Section (Large Card) */}
          <div
            className="group lg:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-10 lg:p-12 
              shadow-xl hover:shadow-2xl border border-gray-700/50 hover:border-primary/50 
              transition-all duration-500 flex flex-col justify-between backdrop-blur-xl border-l-4 border-l-purple-500"
          >
            <div className="relative">
              <h3 className="text-4xl font-extrabold text-white mb-6">
                Our Mission
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                FinTech Calgary is a student-led organization, dedicated to
                bridging the gap between finance and technology through
                insightful discussions, hands-on projects, and networking
                opportunities.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-primary transition-colors duration-300"
              >
                <span className="font-semibold">Learn more</span>
                <FiArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="block mt-8">
              <DotLottieReact
                src="/lottie/crypto.lottie"
                autoplay
                loop
                className="w-full h-full object-contain"
                renderer="svg"
              />
            </div>
          </div>

          {/* Right Section (Two Stacked Cards) */}
          <div className="flex flex-col gap-8 h-full">
            {["What We Do", "Our Approach"].map((title, index) => (
              <div
                key={title}
                className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-10 
                  shadow-xl hover:shadow-2xl border border-gray-700/50 hover:border-primary/50 
                  transition-all duration-500 backdrop-blur-xl relative flex-1 overflow-hidden
                  border-l-4 border-l-purple-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                <div className="h-full flex flex-col relative z-10">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {title}
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed mb-6">
                    {title === "What We Do"
                      ? "We host workshops, speaker sessions, and collaborative projects providing practical experience and industry insights in the fintech sector."
                      : "By combining academic knowledge with real-world applications, we empower students to develop critical skills and stay ahead in the evolving fintech landscape."}
                  </p>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-primary transition-colors duration-300 mt-auto"
                  >
                    <span className="font-semibold">Learn more</span>
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

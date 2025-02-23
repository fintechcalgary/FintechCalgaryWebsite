import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Image from "next/image";

export default function AboutUs() {
  return (
    <section id="about" className="py-24">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-6">
          {/* Left Section (Large Card) */}
          <div className="group lg:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-10 lg:p-12 shadow-xl hover:shadow-2xl border-l-4 lg:border-l-8 border-purple-500 transition-all duration-500 flex flex-col justify-between">
            <h3 className="text-4xl font-extrabold text-white mb-6">
              Our Mission
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              FinTech Calgary is a student-led organization at the University of
              Calgary, dedicated to bridging the gap between finance and
              technology through insightful discussions, hands-on projects, and
              networking opportunities.
            </p>
            <Link
              href="/about"
              className="text-purple-400 font-semibold inline-flex items-center gap-2 group-hover:underline lg:mb-5"
            >
              Learn more{" "}
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="hidden lg:flex justify-center items-center">
              <Image
                src="/finance.svg"
                alt="Fintech Illustration"
                width={500}
                height={300}
                className="rounded-2xl"
              />
            </div>
          </div>

          {/* Right Section (Two Stacked Cards) */}
          <div className="flex flex-col gap-8">
            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-10 shadow-xl hover:shadow-2xl border-l-4 border-purple-500 transition-all duration-500 flex-grow">
              <h3 className="text-3xl font-bold text-white mb-4">What We Do</h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                We host workshops, speaker sessions, and collaborative projects
                providing practical experience and industry insights in the
                fintech sector.
              </p>
              <Link
                href="/about"
                className="text-purple-400 font-semibold inline-flex items-center gap-2 group-hover:underline"
              >
                Learn more{" "}
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-10 shadow-xl hover:shadow-2xl border-l-4 border-purple-500 transition-all duration-500 flex-grow">
              <h3 className="text-3xl font-bold text-white mb-4">
                Our Approach
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                By combining academic knowledge with real-world applications, we
                empower students to develop critical skills and stay ahead in
                the evolving fintech landscape.
              </p>
              <Link
                href="/about"
                className="text-purple-400 font-semibold inline-flex items-center gap-2 group-hover:underline"
              >
                Learn more{" "}
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

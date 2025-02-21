import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiTarget, FiUsers } from "react-icons/fi";

export default function AboutUs() {
  return (
    <section id="about" className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[128px] translate-x-1/2 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[96px] -translate-x-1/2 opacity-20"></div>

      <div className="container mx-auto px-6 relative">
        {/* Title */}
        <motion.h2
          className="text-6xl font-bold mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link href="/about" className="group inline-block relative">
            <div className="flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300">
              <div className="relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
                  About Us
                </span>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
              </div>
              <FiArrowRight className="text-4xl text-primary transition-transform duration-300 group-hover:translate-x-2" />
            </div>
          </Link>
        </motion.h2>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Mission Card */}
          <motion.div
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-10 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative">
              <div className="w-16 h-16 mb-8 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiTarget className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Our Mission
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                FinTech Calgary is a student-led organization at the University
                of Calgary dedicated to exploring the intersection of finance
                and technology.
              </p>
            </div>
          </motion.div>

          {/* What We Do Card */}
          <motion.div
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-10 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* Hover Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Content */}
            <div className="relative">
              <div className="w-16 h-16 mb-8 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiUsers className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">What We Do</h3>
              <p className="text-lg text-gray-300 leading-relaxed">
                Our mission is to educate, innovate, and connect students with
                industry professionals in the rapidly evolving world of
                financial technology.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function AboutUs() {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center"></div>
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-6xl font-bold mb-20 text-center group cursor-pointer relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link
            href="/about"
            className="flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300"
          >
            <div className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
                About Us
              </span>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
            </div>
            <FiArrowRight className="transition-all duration-300 text-primary text-4xl" />
          </Link>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          <motion.div
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-3xl font-bold mb-6 text-primary relative">
              Our Mission
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed relative">
              FinTech Calgary is a student-led organization at the University of
              Calgary dedicated to exploring the intersection of finance and
              technology.
            </p>
          </motion.div>

          <motion.div
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 hover:border-primary/50 transition-all duration-500"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="text-3xl font-bold mb-6 text-primary relative">
              What We Do
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed relative">
              Our mission is to educate, innovate, and connect students with
              industry professionals in the rapidly evolving world of financial
              technology.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

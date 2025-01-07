import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function AboutUs() {
  return (
    <section id="about" className="py-16 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 text-center group cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link
            href="/about"
            className="flex items-center justify-center gap-4 hover:gap-6 transition-all duration-300"
          >
            About Us
            <FiArrowRight className="transition-all duration-300 text-primary" />
          </Link>
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            className="p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-primary">
              Our Mission
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Fintech Calgary is a student-led organization at the University of
              Calgary dedicated to exploring the intersection of finance and
              technology.
            </p>
          </motion.div>
          <motion.div
            className="p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-primary/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-primary">
              What We Do
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed">
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

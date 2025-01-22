import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function JoinUs() {
  return (
    <section id="join" className="mb-24 relative">
      {/* Background Design */}
      <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-center pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 flex flex-col items-center">
        {/* Title */}
        <motion.h2
          className="text-5xl md:text-6xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Join Us
        </motion.h2>

        {/* Description */}
        <motion.p
          className="max-w-3xl text-lg md:text-xl text-center text-gray-300 leading-relaxed mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Be part of a dynamic community where innovation, technology, and
          finance come together. Connect with fellow students and industry
          leaders to make an impact.
        </motion.p>

        {/* Button */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Link
            href="/join"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full 
                       bg-primary hover:bg-primary/90 text-white transition-all duration-300 
                       hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-1 border border-primary/50"
          >
            Join Now
            <FiArrowRight className="ml-3 text-xl transition-transform duration-300 hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

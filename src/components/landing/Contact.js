import { motion } from "framer-motion";
import { FiMail, FiMapPin, FiMessageSquare } from "react-icons/fi";

export default function Contact() {
  return (
    <section id="contact" className="py-16 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-5xl font-bold mb-16 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Contact Us
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg 
                      hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <FiMail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Email</h3>
              <a
                href="mailto:info@fintechcalgary.com"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                info@fintechcalgary.com
              </a>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg 
                      hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <FiMapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Location
              </h3>
              <div className="text-gray-300 space-y-2">
                <p>University of Calgary</p>
                <p>2500 University Dr NW</p>
                <p>Calgary, AB T2N 1N4</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg 
                      hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                <FiMessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Social Media
              </h3>
              <p className="text-gray-300">Follow us for the latest updates</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

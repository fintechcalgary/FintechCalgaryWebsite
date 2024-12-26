import { motion } from "framer-motion";
import { FiMail, FiMapPin, FiMessageSquare } from "react-icons/fi";

export default function Contact() {
  return (
    <section
      id="contact"
      className="py-24 bg-gradient-to-b from-gray-900 to-background"
    >
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-4xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Contact Us
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div
            className="bg-gray-800/50 p-8 rounded-xl border border-gray-700/50 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <FiMail className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
            <a
              href="mailto:info@fintechcalgary.com"
              className="text-gray-300 hover:text-primary transition-colors"
            >
              info@fintechcalgary.com
            </a>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 p-8 rounded-xl border border-gray-700/50 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FiMapPin className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Location</h3>
            <p className="text-gray-300">
              University of Calgary
              <br />
              2500 University Dr NW
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 p-8 rounded-xl border border-gray-700/50 shadow-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <FiMessageSquare className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Social Media
            </h3>
            <p className="text-gray-300">Follow us for the latest updates</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

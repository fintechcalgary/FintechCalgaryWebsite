"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiMapPin, FiMessageSquare, FiSend } from "react-icons/fi";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have questions about Fintech Calgary? We'd love to hear from you.
            Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
          >
            <FiMail className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
            <a
              href="mailto:info@fintechcalgary.com"
              className="text-gray-300 hover:text-primary transition-colors"
            >
              info@fintechcalgary.com
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
          >
            <FiMapPin className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Location</h3>
            <p className="text-gray-300">
              University of Calgary
              <br />
              2500 University Dr NW
              <br />
              Calgary, AB T2N 1N4
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
          >
            <FiMessageSquare className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Social Media
            </h3>
            <p className="text-gray-300">Follow us for the latest updates</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="Your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                placeholder="Message subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                placeholder="Your message"
              />
            </div>

            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${
                  submitStatus === "success"
                    ? "bg-green-500/10 border-green-500/50 text-green-500"
                    : "bg-red-500/10 border-red-500/50 text-red-500"
                } border rounded-lg p-4`}
              >
                {submitStatus === "success"
                  ? "Message sent successfully!"
                  : "Failed to send message. Please try again."}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

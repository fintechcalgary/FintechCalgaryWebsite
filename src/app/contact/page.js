"use client";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { FaTiktok } from "react-icons/fa";

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact | Fintech Calgary";
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 50, density: { enable: true, value_area: 800 } },
      color: { value: "#6d28d9" },
      opacity: { value: 0.8 },
      size: { value: 3 },

      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab",
        },
      },
    },
    retina_detect: true,
  };

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
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />

        <div className="relative z-10 container mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions? We&apos;d love to hear from you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
            >
              <FiMail className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <a
                href="mailto:fintech.calgary@gmail.com"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                fintech.calgary@gmail.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
            >
              <FiMapPin className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Location
              </h3>
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
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300"
            >
              <FiMessageSquare className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Social Media
              </h3>
              <p className="text-gray-300 mb-4">
                Follow us for the latest updates
              </p>
              <div>
                <div className="flex space-x-4">
                  <a
                    href="https://www.linkedin.com/company/fintechcalgary/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <FiLinkedin className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.instagram.com/fintech.calgary/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <FiInstagram className="w-6 h-6" />
                  </a>
                  <a
                    href="mailto:fintechcalgary@gmail.com"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <FiMail className="w-6 h-6" />
                  </a>
                  <a
                    href="https://github.com/fintech-calgary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <FiGithub className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@fintech.calgary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <FaTiktok className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <FiSend />
                    </>
                  )}
                </button>
              </div>
              {submitStatus === "success" && (
                <p className="text-green-400 text-center">
                  Message sent successfully!
                </p>
              )}
              {submitStatus === "error" && (
                <p className="text-red-400 text-center">
                  Failed to send message. Please try again.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

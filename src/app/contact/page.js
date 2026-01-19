"use client";
import { useState, useEffect } from "react";
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
import { FaTiktok } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { createFormChangeHandler } from "@/lib/frontend-helpers";
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact | FinTech Calgary";
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = createFormChangeHandler(setFormData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(API_ENDPOINTS.CONTACT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.CONTACT_FAILED);
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
    <main className="flex flex-col min-h-screen">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="text-center mb-16 animate-fadeIn">
            <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300 animate-slideInLeft">
              <FiMail className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <a
                href="mailto:fintech.calgary@gmail.com"
                className="text-gray-300 hover:text-primary transition-colors"
              >
                fintech.calgary@gmail.com
              </a>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700/50 shadow-lg hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300 animate-slideInRight">
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
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="order-2 lg:order-1 animate-slideInUp">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 scrollbar-thin scrollbar-track-gray-900/50 scrollbar-thumb-gray-500/50 hover:scrollbar-thumb-gray-400/80"
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
                    {SUCCESS_MESSAGES.CONTACT_SENT}
                  </p>
                )}
                {submitStatus === "error" && (
                  <p className="text-red-400 text-center">
                    {ERROR_MESSAGES.CONTACT_FAILED}
                  </p>
                )}
              </form>
            </div>

            <div className="order-1 lg:order-2 flex items-center justify-center animate-slideInDown">
              <DotLottieReact
                src="/lottie/contact.lottie"
                autoplay
                loop
                className="w-full h-full object-contain"
                renderer="svg"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

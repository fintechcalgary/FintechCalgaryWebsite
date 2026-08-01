"use client";
import { useState } from "react";
import {
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PageTitle } from "@/components/ui/SectionHeading";
import { FaTiktok } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { createFormChangeHandler } from "@/lib/frontend-helpers";
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/lib/constants";

export default function ContactPage() {

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
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicPageShell title="Contact | FinTech Calgary">

      <div className="relative flex-grow">
        <div className="container relative z-10 mx-auto px-6 pb-24 pt-36 sm:px-8 lg:px-12">
          <div className="mb-16 animate-fadeIn text-center">
            <PageTitle sizeClass="text-5xl md:text-6xl font-extrabold mb-6">
              Contact Us
            </PageTitle>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Have questions? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-2">
            <div className="fc-card animate-slideInLeft p-8">
              <FiMail className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold text-white">Email</h3>
              <a
                href="mailto:fintech.calgary@gmail.com"
                className="fc-link"
              >
                fintech.calgary@gmail.com
              </a>
            </div>

            <div className="fc-card animate-slideInRight p-8">
              <FiMessageSquare className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-semibold text-white">
                Social Media
              </h3>
              <p className="mb-4 text-gray-300">
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
                    href="mailto:fintech.calgary@gmail.com"
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
                      className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
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
                      className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
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
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
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
                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="fc-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
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
    </PublicPageShell>
  );
}

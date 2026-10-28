"use client";
import { useState } from "react";
import { FiMail, FiMessageSquare, FiSend } from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import { PublicPageFrame, PublicPageHeader } from "@/components/layout/PublicPageFrame";
import { GlowCard } from "@/components/ui/spotlight-card";
import SocialLinks from "@/components/ui/SocialLinks";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { createFormChangeHandler } from "@/lib/frontend-helpers";
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SITE_CONTACT,
  SUCCESS_MESSAGES,
} from "@/lib/constants";

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

      <PublicPageFrame>
          <PublicPageHeader
            title="Contact Us"
            lede="Have questions? We'd love to hear from you."
          />

          <div className="mb-16 grid items-stretch gap-8 md:grid-cols-2">
            <div className="h-full animate-slideInLeft">
              <GlowCard
                customSize
                glowColor="purple"
                className="h-full w-full !gap-0 !p-8"
              >
                <div className="relative z-10">
                  <div className="fc-icon-tile mb-4">
                    <FiMail className="h-6 w-6" />
                  </div>
                  <h3 className="fc-title mb-2 text-xl">Email</h3>
                  <a href={SITE_CONTACT.mailto} className="fc-link-underline">
                    {SITE_CONTACT.email}
                  </a>
                </div>
              </GlowCard>
            </div>

            <div className="h-full animate-slideInRight">
              <GlowCard
                customSize
                glowColor="purple"
                className="h-full w-full !gap-0 !p-8"
              >
                <div className="relative z-10">
                <div className="fc-icon-tile mb-4">
                  <FiMessageSquare className="h-6 w-6" />
                </div>
                <h3 className="fc-title mb-2 text-xl">
                  Social Media
                </h3>
                <p className="fc-body mb-4">
                  Follow us for the latest updates
                </p>
                <SocialLinks />
                </div>
              </GlowCard>
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
                      className="form-input"
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
                      className="form-input"
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
                    className="form-input"
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
                    className="form-input"
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
                  <p className="fc-alert-success text-center">
                    {SUCCESS_MESSAGES.CONTACT_SENT}
                  </p>
                )}
                {submitStatus === "error" && (
                  <p className="fc-alert-error text-center">
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
      </PublicPageFrame>
    </PublicPageShell>
  );
}

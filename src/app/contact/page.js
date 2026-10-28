"use client";
import { useState } from "react";
import {
  FiArrowRight,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiSend,
} from "react-icons/fi";
import PublicPageShell from "@/components/layout/PublicPageShell";
import {
  PublicPageFrame,
  PublicPageHeader,
} from "@/components/layout/PublicPageFrame";
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

        <div className="mb-16 grid items-stretch gap-8 lg:grid-cols-2">
          <div className="flex h-full flex-col gap-8">
            <div className="animate-slideInLeft">
              <GlowCard
                customSize
                glowColor="purple"
                className="h-full w-full !gap-0 !p-8"
              >
                <div className="relative z-10 flex items-start gap-4">
                  <div className="fc-icon-tile">
                    <FiMail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="fc-title mb-2 text-xl">Email</h3>
                    <p className="fc-body mb-4">
                      Questions, partnerships, or a note for the team. We read
                      every message sent to the club inbox.
                    </p>
                    <a
                      href={SITE_CONTACT.mailto}
                      className="fc-link-underline inline-flex items-center gap-2"
                    >
                      {SITE_CONTACT.email}
                      <FiArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </GlowCard>
            </div>

            <div className="flex-1 animate-slideInLeft">
              <GlowCard
                customSize
                glowColor="purple"
                className="h-full w-full !gap-0 !p-8"
              >
                <div className="relative z-10 flex items-start gap-4">
                  <div className="fc-icon-tile">
                    <FiMapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="fc-title mb-2 text-xl">Find us</h3>
                    <p className="fc-body mb-3">
                      Based at the University of Calgary. We work with partners
                      across campus and the city.
                    </p>
                    <p className="font-medium tracking-wide text-primary">
                      {SITE_CONTACT.addressName}
                    </p>
                    <p className="fc-muted">{SITE_CONTACT.addressLine}</p>
                  </div>
                </div>
              </GlowCard>
            </div>
          </div>

          <div className="h-full animate-slideInRight">
            <GlowCard
              customSize
              glowColor="purple"
              className="h-full w-full !gap-0 !p-8"
            >
              <div className="relative z-10">
                <div className="mb-6 flex items-start gap-4">
                  <div className="fc-icon-tile">
                    <FiMessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="fc-title mb-2 text-xl">Social media</h3>
                    <p className="fc-body">
                      Event posts, club updates, and the occasional fintech
                      note. Pick whichever you already use.
                    </p>
                  </div>
                </div>
                <SocialLinks />
              </div>
            </GlowCard>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="order-2 lg:order-1 animate-slideInUp">
            <GlowCard
              customSize
              glowColor="purple"
              className="h-full w-full !gap-0 !p-8"
            >
              <div className="relative z-10 mb-6">
                <h2 className="fc-title mb-2 text-2xl">Send a message</h2>
                <p className="fc-body">
                  Tell us who you are and what you need. We reply from{" "}
                  {SITE_CONTACT.email}.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="fc-form-label">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="fc-form-label">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="fc-form-label">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    placeholder="What is this about?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="fc-form-label">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    placeholder="Your message"
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
            </GlowCard>
          </div>

          <div className="order-1 lg:order-2 flex items-center justify-center animate-slideInDown">
            <DotLottieReact
              src="/lottie/contact.lottie"
              autoplay
              loop
              className="h-full w-full object-contain"
              renderer="svg"
            />
          </div>
        </div>
      </PublicPageFrame>
    </PublicPageShell>
  );
}

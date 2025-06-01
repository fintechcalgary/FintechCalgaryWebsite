"use client";
import { useState, useCallback, useEffect } from "react";
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

export default function AssociateMemberSignupPage() {
  useEffect(() => {
    document.title = "Associate Member | FinTech Calgary";
  }, []);

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
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow">
        <div className="container mx-auto px-6 py-24 relative z-10">
          <div className="text-center mb-16 animate-fadeIn">
            <h1 className="text-6xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary mb-6">
              Associate Member Sign Up
            </h1>
            <p className="text-xl text-gray-300 mx-auto">
              Interested in learning more about Associate Membership before
              applying? Contact us at fintech.calgary@gmail.com.
            </p>
          </div>

          <div className="flex justify-center items-center">
            <form className="bg-gray-800/50 backdrop-blur-sm rounded-lg py-5 px-8 w-full max-w-6xl">
              <div className="text-xl font-semibold">
                Organization Information
              </div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="flex gap-x-2 mb-2">
                <input
                  id="logo-upload"
                  type="file"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormData({ ...formData, logo: file });
                  }}
                  className="hidden"
                />

                <label
                  htmlFor="logo-upload"
                  className="flex justify-between items-stretch cursor-pointer max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 w-full"
                >
                  <span
                    className={`truncate self-center ${
                      formData.logo ? "" : "text-gray-400"
                    }`}
                  >
                    {formData.logo ? formData.logo.name : "Organization Logo"}
                  </span>

                  <span className="flex items-center pl-4 border-l border-gray-600 text-gray-400">
                    Browse
                  </span>
                </label>
              </div>

              <div className="flex gap-x-2 mb-5">
                <input
                  type="text"
                  placeholder="Organization Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="text-xl font-semibold">Contacts</div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="flex gap-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Prefix"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="max-w-2xl px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="text-xl font-semibold">
                Organization Contact Information
              </div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="text-xl font-semibold">Organization Address</div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
              <div className="text-xl font-semibold">Directory Listing</div>
              <div className="my-2 border-t-2 border-primary/60 w-full"></div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/landing/Footer";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import Link from "next/link";

export default function JoinPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [membershipType, setMembershipType] = useState("free");

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesConfig = {
    particles: {
      number: { value: 10, density: { enable: true, value_area: 800 } },
      color: { value: "#6d28d9" },
      opacity: { value: 0.5 },
      size: { value: 3 },
      line_linked: {
        enable: false,
      },
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
    retina_detect: true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(""); // Clear any previous error messages

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "" });
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error.message);
      console.log("Subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePremiumRedirect = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-gray-900">
      <PublicNavbar />

      <div className="relative flex-grow flex items-center justify-center py-12">
        <Particles
          className="absolute inset-0 z-0"
          init={particlesInit}
          options={particlesConfig}
        />

        <div className="relative container mx-auto px-6 my-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative z-50">
              <Link
                href="/"
                className="inline-flex items-center text-gray-400 hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 mb-6 group"
              >
                <FiArrowLeft className="mr-2 group-hover:translate-x-[-4px] transition-transform duration-200" />
                Back to Home
              </Link>
            </div>

            <div className="relative z-40">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50">
                <h1 className="text-3xl font-bold text-white mb-4">Join Us</h1>
                <p className="text-gray-300 mb-6">
                  Join the FinTech Calgary community to stay updated with our
                  latest events, workshops, and opportunities.
                </p>

                {submitStatus === "success" ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Thank you for joining!
                    </h2>
                    <p className="text-gray-300">
                      Check your email for a welcome message from our team.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Membership Options */}
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-white mb-4">
                        Choose Your Membership
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Free Membership Option */}
                        <div
                          className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            membershipType === "free"
                              ? "bg-primary/10 border-primary"
                              : "bg-gray-800/50 border-gray-700 hover:border-gray-500"
                          }`}
                          onClick={() => setMembershipType("free")}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-medium text-white">
                              Free Membership
                            </h3>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                membershipType === "free"
                                  ? "bg-primary"
                                  : "border border-gray-500"
                              }`}
                            >
                              {membershipType === "free" && (
                                <FiCheck className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">
                            Stay updated with our community
                          </p>
                          <ul className="space-y-1 text-sm text-gray-300">
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Email newsletters</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Event announcements</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Community updates</span>
                            </li>
                          </ul>
                          <div className="mt-3 text-center">
                            <span className="text-xl font-bold text-white">
                              $0
                            </span>
                            <span className="text-gray-400 text-sm">
                              {" "}
                              / forever
                            </span>
                          </div>
                        </div>

                        {/* Premium Membership Option */}
                        <div
                          className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            membershipType === "premium"
                              ? "bg-primary/10 border-primary"
                              : "bg-gray-800/50 border-gray-700 hover:border-gray-500"
                          }`}
                          onClick={() => setMembershipType("premium")}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-medium text-white">
                                Premium Membership
                              </h3>
                              <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs rounded-full mt-1">
                                Exclusive Benefits
                              </span>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                membershipType === "premium"
                                  ? "bg-primary"
                                  : "border border-gray-500"
                              }`}
                            >
                              {membershipType === "premium" && (
                                <FiCheck className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">
                            Get full access to our community
                          </p>
                          <ul className="space-y-1 text-sm text-gray-300">
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>All free benefits</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Priority event access</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Exclusive networking opportunities</span>
                            </li>
                            <li className="flex items-start">
                              <FiCheck className="w-4 h-4 text-primary mr-2 mt-0.5" />
                              <span>Member-only resources</span>
                            </li>
                          </ul>
                          <div className="mt-3 text-center">
                            <span className="text-xl font-bold text-white">
                              $5
                            </span>
                            <span className="text-gray-400 text-sm">
                              {" "}
                              / year
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {membershipType === "free" ? (
                      <div className="mt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                          {errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start">
                              <FiAlertCircle className="text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                              <div>
                                <p className="text-red-400">{errorMessage}</p>
                                {errorMessage.includes(
                                  "already subscribed"
                                ) && (
                                  <p className="text-gray-400 text-sm mt-1">
                                    Please use a different email address or
                                    check your inbox for previous
                                    communications.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-300 mb-1 block">
                                Name
                              </label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  })
                                }
                                required
                                className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                                placeholder="Your full name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    email: e.target.value,
                                  })
                                }
                                required
                                className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50"
                                placeholder="Your email address"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                          >
                            {isSubmitting ? "Joining..." : "Join Now"}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4 mt-6">
                        <p className="text-gray-300">
                          Get exclusive access to premium events, networking
                          opportunities, and member-only resources.
                        </p>
                        <button
                          onClick={handlePremiumRedirect}
                          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                        >
                          Continue to Premium Sign Up
                        </button>
                        <p className="text-xs text-gray-400 text-center">
                          You&apos;ll be redirected to our secure payment page.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
